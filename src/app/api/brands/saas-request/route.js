import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const payload = await request.json();
    const { brandId, plan, paymentSender, paymentDate, paymentNote } = payload;

    if (!brandId || !plan) {
      return NextResponse.json({ error: 'Missing brandId or plan' }, { status: 400 });
    }

    const durationMonths = 12;
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + durationMonths);

    // Find existing config
    const existingConfig = await prisma.saaSConfig.findFirst({
      where: { brandId }
    });

    let saas;
    if (existingConfig) {
      if (existingConfig.status === 'ACTIVE') {
        saas = await prisma.saaSConfig.update({
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
        saas = await prisma.saaSConfig.update({
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
      saas = await prisma.saaSConfig.create({
        data: {
          brandId,
          plan,
          status: 'PENDING_APPROVAL',
          expiresAt,
          paymentSender,
          paymentDate,
          paymentNote
        }
      });
    }

    console.log(`[Banka Havalesi Bildirimi] Marka: ${brandId} -> ${plan} talebi alındı. Gönderen: ${paymentSender}`);

    return NextResponse.json({
      success: true,
      message: 'Brand subscription request received (pending approval)',
      saasId: saas.id
    });
  } catch (error) {
    console.error('Brand SaaS Request Endpoint Error:', error);
    return NextResponse.json({ error: 'Failed to save payment notification', details: error.message }, { status: 500 });
  }
}
