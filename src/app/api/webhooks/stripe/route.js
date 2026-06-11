import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const payload = await request.json();
    
    // In production, you would verify Stripe's signature:
    // const sig = request.headers.get('stripe-signature');
    // const event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    
    // Simulate webhook event parsing
    const { eventType, brandId, dealerId, plan, durationMonths } = payload;

    if (!eventType || (!brandId && !dealerId)) {
      return NextResponse.json(
        { error: 'Invalid webhook payload (missing eventType, brandId, or dealerId)' },
        { status: 400 }
      );
    }

    console.log(`[Stripe Webhook Received] Event: ${eventType} for Brand: ${brandId || 'N/A'}, Dealer: ${dealerId || 'N/A'}`);

    if (eventType === 'checkout.session.completed' || eventType === 'invoice.payment_succeeded') {
      const selectedPlan = plan || 'PRO'; // Default plan
      const months = durationMonths || 12;
      
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + months);

      if (dealerId) {
        // Upsert the SaaS configuration for the dealer
        const existingConfig = await prisma.dealerSaaSConfig.findFirst({
          where: { dealerId }
        });

        let saas;
        if (existingConfig) {
          saas = await prisma.dealerSaaSConfig.update({
            where: { id: existingConfig.id },
            data: {
              plan: selectedPlan,
              status: 'ACTIVE',
              expiresAt: expiresAt
            }
          });
        } else {
          saas = await prisma.dealerSaaSConfig.create({
            data: {
              dealerId,
              plan: selectedPlan,
              status: 'ACTIVE',
              expiresAt: expiresAt
            }
          });
        }

        console.log(`[Subscription Updated] Dealer: ${dealerId} upgraded to ${selectedPlan}. Expires at: ${expiresAt.toISOString()}`);
        
        return NextResponse.json({
          success: true,
          message: 'Dealer subscription updated successfully',
          saasId: saas.id
        });
      } else {
        // Upsert the SaaS configuration for the brand
        const existingConfig = await prisma.saaSConfig.findFirst({
          where: { brandId }
        });

        let saas;
        if (existingConfig) {
          saas = await prisma.saaSConfig.update({
            where: { id: existingConfig.id },
            data: {
              plan: selectedPlan,
              status: 'ACTIVE',
              expiresAt: expiresAt
            }
          });
        } else {
          saas = await prisma.saaSConfig.create({
            data: {
              brandId,
              plan: selectedPlan,
              status: 'ACTIVE',
              expiresAt: expiresAt
            }
          });
        }

        console.log(`[Subscription Updated] Brand: ${brandId} upgraded to ${selectedPlan}. Expires at: ${expiresAt.toISOString()}`);
        
        return NextResponse.json({
          success: true,
          message: 'Brand subscription updated successfully',
          saasId: saas.id
        });
      }
    }

    return NextResponse.json({ success: true, message: 'Event logged but no action required' });

  } catch (error) {
    console.error('Webhook Endpoint Error:', error);
    return NextResponse.json({ error: 'Webhook processing failed', details: error.message }, { status: 500 });
  }
}
