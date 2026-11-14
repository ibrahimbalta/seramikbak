import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-check';

export async function POST(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth || (auth.role !== 'dealer' && auth.role !== 'admin')) {
      return NextResponse.json({ error: 'Yetkisiz erişim. Lütfen bayi girişi yapınız.' }, { status: 401 });
    }

    const payload = await request.json();
    const { plan, paymentSender, paymentDate, paymentNote } = payload;
    // Anti-IDOR: Regular dealers can only submit SaaS requests for their own account
    const dealerId = auth.role === 'dealer' ? auth.id : (payload.dealerId || auth.id);

    if (!dealerId || !plan) {
      return NextResponse.json({ error: 'Missing dealerId or plan' }, { status: 400 });
    }

    const durationMonths = 12;
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + durationMonths);

    // Find existing config
    const existingConfig = await prisma.dealerSaaSConfig.findFirst({
      where: { dealerId }
    });

    let saas;
    if (existingConfig) {
      if (existingConfig.status === 'ACTIVE') {
        saas = await prisma.dealerSaaSConfig.update({
          where: { id: existingConfig.id },
          data: {
            pendingPlan: plan,
            pendingStatus: 'PENDING_APPROVAL',
            paymentSender,
            paymentDate,
            paymentNote
          }
        });
      } else {
        saas = await prisma.dealerSaaSConfig.update({
          where: { id: existingConfig.id },
          data: {
            plan,
            status: 'PENDING_APPROVAL',
            expiresAt,
            pendingPlan: null,
            pendingStatus: null,
            paymentSender,
            paymentDate,
            paymentNote
          }
        });
      }
    } else {
      saas = await prisma.dealerSaaSConfig.create({
        data: {
          dealerId,
          plan,
          status: 'PENDING_APPROVAL',
          expiresAt,
          paymentSender,
          paymentDate,
          paymentNote
        }
      });
    }

    console.log(`[Banka Havalesi Bildirimi] Bayi: ${dealerId} -> ${plan} talebi alındı. Gönderen: ${paymentSender}`);

    return NextResponse.json({
      success: true,
      message: 'Dealer subscription request received (pending approval)',
      saasId: saas.id
    });
  } catch (error) {
    console.error('Dealer SaaS Request Endpoint Error:', error);
    return NextResponse.json({ error: 'Failed to save payment notification', details: error.message }, { status: 500 });
  }
}
