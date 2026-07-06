import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get('brandId');

    if (!brandId) {
      const activeCampaigns = await prisma.adCampaign.findMany({
        where: {
          status: 'ACTIVE'
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
    const { brandId, productId, bidAmount, budget } = body;

    if (!brandId || !productId || !bidAmount || !budget) {
      return NextResponse.json(
        { error: 'Missing parameters (brandId, productId, bidAmount, budget)' },
        { status: 400 }
      );
    }

    // Check if campaign already exists for this product
    const existingCampaign = await prisma.adCampaign.findFirst({
      where: { productId, brandId }
    });

    let campaign;

    if (existingCampaign) {
      // Top up budget and update bid
      campaign = await prisma.adCampaign.update({
        where: { id: existingCampaign.id },
        data: {
          bidAmount: parseFloat(bidAmount),
          budget: existingCampaign.budget + parseFloat(budget),
          status: 'ACTIVE' // Reactivate if it was completed
        }
      });
    } else {
      // Create new campaign
      campaign = await prisma.adCampaign.create({
        data: {
          brandId,
          productId,
          bidAmount: parseFloat(bidAmount),
          budget: parseFloat(budget),
          status: 'ACTIVE'
        }
      });
    }

    // Update product flag
    await prisma.product.update({
      where: { id: productId },
      data: { isPremium: true }
    });

    return NextResponse.json({
      success: true,
      message: 'Campaign configured successfully',
      campaign
    });

  } catch (error) {
    console.error('B2B Campaigns POST Error:', error);
    return NextResponse.json({ error: 'Failed to configure campaign', details: error.message }, { status: 500 });
  }
}
