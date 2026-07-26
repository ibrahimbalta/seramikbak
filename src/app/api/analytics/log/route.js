import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, productId, brandId, dealerId, city } = body;

    if (!action) {
      return NextResponse.json(
        { error: 'Missing action parameter' },
        { status: 400 }
      );
    }

    // 1. Create the general analytics log record
    const log = await prisma.analyticsLog.create({
      data: {
        action,
        productId: productId || null,
        brandId: brandId || null,
        dealerId: dealerId || null,
        city: city || 'İstanbul'
      }
    });

    // 2. Pay-Per-Click budget subtraction logic
    if (action === 'CLICK' && productId) {
      // Find if there is an active advertising campaign for this product
      const campaign = await prisma.adCampaign.findFirst({
        where: {
          productId: productId,
          status: 'ACTIVE',
          budget: { gt: 0 }
        }
      });

      if (campaign) {
        const newBudget = Math.max(0, campaign.budget - campaign.bidAmount);
        const newStatus = newBudget <= 0 ? 'COMPLETED' : 'ACTIVE';

        await prisma.adCampaign.update({
          where: { id: campaign.id },
          data: {
            clicks: { increment: 1 },
            budget: newBudget,
            status: newStatus
          }
        });
        
        console.log(`[PPC Charge] Charged ${campaign.bidAmount} TRY for Product ${productId}. New budget: ${newBudget} TRY.`);
      }
    } 
    
    // 3. Impression counting logic
    if (action === 'VIEW' && productId) {
      const campaign = await prisma.adCampaign.findFirst({
        where: {
          productId: productId,
          status: 'ACTIVE'
        }
      });

      if (campaign) {
        await prisma.adCampaign.update({
          where: { id: campaign.id },
          data: {
            impressions: { increment: 1 }
          }
        });
      }
    }

    return NextResponse.json({ success: true, logId: log.id });
  } catch (error) {
    console.error('Log Analytics API Error:', error);
    return NextResponse.json(
      { error: 'Failed to record analytics', details: error.message },
      { status: 500 }
    );
  }
}
