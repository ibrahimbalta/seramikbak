import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const body = await request.json();
    let action = body.action || body.type;
    
    // Normalize type to action
    if (action === 'AD_CLICK') {
      action = 'CLICK';
    }

    if (!action) {
      return NextResponse.json(
        { error: 'Missing action parameter' },
        { status: 400 }
      );
    }

    let productId = body.productId || null;
    let brandId = body.brandId || null;
    const dealerId = body.dealerId || null;
    const city = body.city || 'İstanbul';
    const campaignId = body.campaignId || null;

    // If campaignId is provided, fetch campaign to fill missing productId/brandId
    let campaign = null;
    if (campaignId) {
      campaign = await prisma.adCampaign.findUnique({
        where: { id: campaignId }
      });
      if (campaign) {
        if (!productId) productId = campaign.productId;
        if (!brandId) brandId = campaign.brandId;
      }
    }

    // If campaign wasn't found by campaignId, but productId exists, look up active campaign
    if (!campaign && productId) {
      campaign = await prisma.adCampaign.findFirst({
        where: {
          productId: productId,
          status: 'ACTIVE'
        }
      });
    }

    // 1. Create the general analytics log record
    const log = await prisma.analyticsLog.create({
      data: {
        action,
        productId: productId || null,
        brandId: brandId || null,
        dealerId: dealerId || null,
        city: city
      }
    });

    // 2. Click counting & Pay-Per-Click budget subtraction logic
    if (action === 'CLICK' && campaign) {
      const updateData = {
        clicks: { increment: 1 }
      };

      if (campaign.bidAmount && campaign.bidAmount > 0 && campaign.budget > 0) {
        const newBudget = Math.max(0, campaign.budget - campaign.bidAmount);
        updateData.budget = newBudget;
        if (newBudget <= 0) {
          updateData.status = 'COMPLETED';
        }
      }

      await prisma.adCampaign.update({
        where: { id: campaign.id },
        data: updateData
      });

      console.log(`[Campaign Click] Incremented clicks for campaign ${campaign.id}.`);
    } 
    
    // 3. Impression counting logic
    if (action === 'VIEW' && campaign) {
      await prisma.adCampaign.update({
        where: { id: campaign.id },
        data: {
          impressions: { increment: 1 }
        }
      });
    }

    // 4. 3D Virtual Studio & AR Try-on counting logic
    if ((action === 'STUDIO_TRY' || action === 'AR_TRY') && campaign) {
      await prisma.adCampaign.update({
        where: { id: campaign.id },
        data: {
          studioTries: { increment: 1 }
        }
      });
      console.log(`[Campaign Studio Try] Incremented studioTries for campaign ${campaign.id}.`);
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

