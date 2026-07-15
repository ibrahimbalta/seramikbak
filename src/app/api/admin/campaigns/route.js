import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const campaigns = await prisma.adCampaign.findMany({
      include: {
        brand: {
          select: { name: true }
        },
        product: {
          select: { name: true, code: true, imageUrl: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, campaigns });
  } catch (error) {
    console.error('Admin Campaigns GET Error:', error);
    return NextResponse.json({ error: 'Kampanyalar yüklenirken hata oluştu.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { campaignId, action } = body;

    if (!campaignId || !action) {
      return NextResponse.json({ error: 'Eksik parametreler (campaignId, action)' }, { status: 400 });
    }

    const campaign = await prisma.adCampaign.findUnique({
      where: { id: campaignId }
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Kampanya bulunamadı.' }, { status: 404 });
    }

    if (action === 'approve') {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + campaign.durationDays);

      const updatedCampaign = await prisma.adCampaign.update({
        where: { id: campaignId },
        data: {
          status: 'ACTIVE',
          expiresAt: expiresAt,
          updatedAt: new Date()
        }
      });

      // Boost the product search rank by marking it isPremium
      await prisma.product.update({
        where: { id: campaign.productId },
        data: { isPremium: true }
      });

      return NextResponse.json({ success: true, campaign: updatedCampaign });
    }

    if (action === 'reject') {
      const updatedCampaign = await prisma.adCampaign.update({
        where: { id: campaignId },
        data: {
          status: 'REJECTED',
          expiresAt: null,
          updatedAt: new Date()
        }
      });

      // Remove the product boost rank
      await prisma.product.update({
        where: { id: campaign.productId },
        data: { isPremium: false }
      });

      return NextResponse.json({ success: true, campaign: updatedCampaign });
    }

    if (action === 'cancel') {
      const updatedCampaign = await prisma.adCampaign.update({
        where: { id: campaignId },
        data: {
          status: 'PAUSED', // manual cancel
          updatedAt: new Date()
        }
      });

      // Remove the product boost rank
      await prisma.product.update({
        where: { id: campaign.productId },
        data: { isPremium: false }
      });

      return NextResponse.json({ success: true, campaign: updatedCampaign });
    }

    return NextResponse.json({ error: 'Geçersiz işlem.' }, { status: 400 });

  } catch (error) {
    console.error('Admin Campaigns POST Error:', error);
    return NextResponse.json({ error: 'İşlem tamamlanırken bir hata oluştu.' }, { status: 500 });
  }
}
