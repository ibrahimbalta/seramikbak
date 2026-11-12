import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';

function verifyStripeSignature(rawBody, signatureHeader, webhookSecret) {
  if (!signatureHeader || !webhookSecret) return false;
  const parts = signatureHeader.split(',').reduce((acc, item) => {
    const [k, v] = item.split('=');
    if (k && v) acc[k.trim()] = v.trim();
    return acc;
  }, {});

  const timestamp = parts.t;
  const signature = parts.v1;
  if (!timestamp || !signature) return false;

  const tsNum = parseInt(timestamp, 10);
  if (!Number.isFinite(tsNum) || Math.abs(Math.floor(Date.now() / 1000) - tsNum) > 300) {
    return false;
  }

  const signedPayload = `${timestamp}.${rawBody}`;
  const expectedSig = crypto
    .createHmac('sha256', webhookSecret)
    .update(signedPayload, 'utf8')
    .digest('hex');

  const sigBuf = Buffer.from(signature, 'hex');
  const expectedBuf = Buffer.from(expectedSig, 'hex');
  if (sigBuf.length !== expectedBuf.length) return false;
  return crypto.timingSafeEqual(sigBuf, expectedBuf);
}

export async function POST(request) {
  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('CRITICAL: STRIPE_WEBHOOK_SECRET is not configured.');
      return NextResponse.json({ error: 'Webhook verification not configured' }, { status: 503 });
    }

    const rawBody = await request.text();
    const sigHeader = request.headers.get('stripe-signature');
    if (!verifyStripeSignature(rawBody, sigHeader, webhookSecret)) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const { eventType, brandId, dealerId, plan, durationMonths } = payload;

    if (!eventType || (!brandId && !dealerId)) {
      return NextResponse.json(
        { error: 'Invalid webhook payload (missing eventType, brandId, or dealerId)' },
        { status: 400 }
      );
    }

    console.log(`[Stripe Webhook Received] Event: ${eventType} for Brand: ${brandId || 'N/A'}, Dealer: ${dealerId || 'N/A'}`);

    if (eventType === 'checkout.session.completed' || eventType === 'invoice.payment_succeeded') {
      const selectedPlan = plan || 'PRO';
      const months = durationMonths || 12;

      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + months);

      if (dealerId) {
        const existingConfig = await prisma.dealerSaaSConfig.findFirst({
          where: { dealerId }
        });

        let saas;
        if (existingConfig) {
          if (existingConfig.status === 'ACTIVE') {
            saas = await prisma.dealerSaaSConfig.update({
              where: { id: existingConfig.id },
              data: {
                pendingPlan: selectedPlan,
                pendingStatus: 'PENDING_APPROVAL'
              }
            });
          } else {
            saas = await prisma.dealerSaaSConfig.update({
              where: { id: existingConfig.id },
              data: {
                plan: selectedPlan,
                status: 'PENDING_APPROVAL',
                expiresAt: expiresAt,
                pendingPlan: null,
                pendingStatus: null
              }
            });
          }
        } else {
          saas = await prisma.dealerSaaSConfig.create({
            data: {
              dealerId,
              plan: selectedPlan,
              status: 'PENDING_APPROVAL',
              expiresAt: expiresAt
            }
          });
        }

        console.log(`[Subscription Requested] Dealer: ${dealerId} requested ${selectedPlan}. Pending admin approval.`);

        return NextResponse.json({
          success: true,
          message: 'Dealer subscription request received (pending approval)',
          saasId: saas.id
        });
      } else {
        const existingConfig = await prisma.saaSConfig.findFirst({
          where: { brandId }
        });

        let saas;
        if (existingConfig) {
          if (existingConfig.status === 'ACTIVE') {
            saas = await prisma.saaSConfig.update({
              where: { id: existingConfig.id },
              data: {
                pendingPlan: selectedPlan,
                pendingStatus: 'PENDING_APPROVAL'
              }
            });
          } else {
            saas = await prisma.saaSConfig.update({
              where: { id: existingConfig.id },
              data: {
                plan: selectedPlan,
                status: 'PENDING_APPROVAL',
                expiresAt: expiresAt,
                pendingPlan: null,
                pendingStatus: null
              }
            });
          }
        } else {
          saas = await prisma.saaSConfig.create({
            data: {
              brandId,
              plan: selectedPlan,
              status: 'PENDING_APPROVAL',
              expiresAt: expiresAt
            }
          });
        }

        console.log(`[Subscription Requested] Brand: ${brandId} requested ${selectedPlan}. Pending admin approval.`);

        return NextResponse.json({
          success: true,
          message: 'Brand subscription request received (pending approval)',
          saasId: saas.id
        });
      }
    }

    return NextResponse.json({ success: true, message: 'Event logged but no action required' });

  } catch (error) {
    console.error('Webhook Endpoint Error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
