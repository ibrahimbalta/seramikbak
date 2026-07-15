import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get('brandId');

    if (!brandId) {
      // Fetch active campaigns (where status is ACTIVE and expiresAt has not passed)
      const activeCampaigns = await prisma.adCampaign.findMany({
        where: {
          status: 'ACTIVE',
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } }
          ]
        },
        include: {
          product: {
            include: {
              brand: {
                select: { name: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      return NextResponse.json(activeCampaigns);
    }

    const campaigns = await prisma.adCampaign.findMany({
      where: { brandId },
      include: {
        product: {
          select: { name: true, code: true, imageUrl: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(campaigns);
  } catch (error) {
    console.error('B2B Campaigns GET Error:', error);
    return NextResponse.json({ error: 'Failed to retrieve campaigns', details: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { brandId, productId, durationDays, paymentRef, price } = body;

    if (!brandId || !productId || !durationDays || !paymentRef || !price) {
      return NextResponse.json(
        { error: 'Eksik parametreler (brandId, productId, durationDays, paymentRef, price)' },
        { status: 400 }
      );
    }

    // Check if there is already a campaign for this product (e.g. pending or active)
    const existingCampaign = await prisma.adCampaign.findFirst({
      where: { productId, brandId }
    });

    let campaign;

    if (existingCampaign) {
      // If it exists, update it to PENDING_APPROVAL with new duration and payment info
      campaign = await prisma.adCampaign.update({
        where: { id: existingCampaign.id },
        data: {
          durationDays: parseInt(durationDays, 10),
          paymentRef,
          price: parseFloat(price),
          budget: parseFloat(price),
          status: 'PENDING_APPROVAL',
          expiresAt: null, // Reset expiry until approved
          updatedAt: new Date()
        }
      });
    } else {
      // Create new campaign with PENDING_APPROVAL status
      campaign = await prisma.adCampaign.create({
        data: {
          brandId,
          productId,
          durationDays: parseInt(durationDays, 10),
          paymentRef,
          price: parseFloat(price),
          budget: parseFloat(price),
          status: 'PENDING_APPROVAL',
          bidAmount: 0,
          expiresAt: null
        }
      });
    }

    // Note: We do not set product.isPremium to true here. That is done by admin approval.

    return NextResponse.json({
      success: true,
      message: 'Reklam başvurusu alındı. Admin onayı bekleniyor.',
      campaign
    });

  } catch (error) {
    console.error('B2B Campaigns POST Error:', error);
    return NextResponse.json({ error: 'Kampanya başvurusu sırasında hata oluştu.', details: error.message }, { status: 500 });
  }
}
