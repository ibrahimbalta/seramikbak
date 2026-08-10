import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const payload = await request.json();
    
    // Normalize parameters from /marka or /global-tanitim forms
    const brandName = payload.brandName || payload.name || payload.brandId;
    const contactPerson = payload.contactPerson || payload.paymentSender || 'Yetkili';
    const email = payload.email || '';
    const phone = payload.phone || '';
    const note = payload.note || payload.paymentNote || '';
    const collectionCount = payload.collectionCount || '10-25';
    const plan = payload.plan || 'ENTERPRISE_GLOBAL_EXPORTS';

    if (!brandName) {
      return NextResponse.json({ error: 'Lütfen Marka / Firma adını belirtin.' }, { status: 400 });
    }

    // 1. Find or create the Brand entry dynamically
    let brand = await prisma.brand.findFirst({
      where: {
        OR: [
          { id: brandName },
          { name: { equals: brandName, mode: 'insensitive' } }
        ]
      }
    });

    if (!brand) {
      const cleanUsername = brandName.toLowerCase().replace(/[^a-z0-9]/g, '') + Math.floor(1000 + Math.random() * 9000);
      brand = await prisma.brand.create({
        data: {
          name: brandName,
          username: cleanUsername,
          password: 'marka' + Math.floor(1000 + Math.random() * 9000)
        }
      });
    }

    const durationMonths = 12;
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + durationMonths);

    const formattedPaymentNote = `Yetkili: ${contactPerson} | E-posta: ${email} | Tel: ${phone} | Koleksiyon: ${collectionCount} | Not: ${note}`;
    const paymentDateStr = new Date().toISOString().split('T')[0];

    // 2. Find existing SaaSConfig for this brand or create a new one
    const existingConfig = await prisma.saaSConfig.findFirst({
      where: { brandId: brand.id }
    });

    let saas;
    if (existingConfig) {
      saas = await prisma.saaSConfig.update({
        where: { id: existingConfig.id },
        data: {
          pendingPlan: plan,
          pendingStatus: 'PENDING_APPROVAL',
          status: existingConfig.status === 'ACTIVE' ? 'ACTIVE' : 'PENDING_APPROVAL',
          paymentSender: contactPerson,
          paymentDate: paymentDateStr,
          paymentNote: formattedPaymentNote
        }
      });
    } else {
      saas = await prisma.saaSConfig.create({
        data: {
          brandId: brand.id,
          plan: plan,
          status: 'PENDING_APPROVAL',
          expiresAt: expiresAt,
          paymentSender: contactPerson,
          paymentDate: paymentDateStr,
          paymentNote: formattedPaymentNote
        }
      });
    }

    console.log(`[B2B Marka Katılım Başvurusu Alındı] Marka: ${brand.name} (${brand.id}) -> Yetkili: ${contactPerson} (${email})`);

    return NextResponse.json({
      success: true,
      message: 'Marka katılım başvurunuz başarıyla veritabanına kaydedildi! Müşteri temsilcimiz 24 saat içinde sizinle iletişime geçecektir.',
      saasId: saas.id,
      brandId: brand.id
    });
  } catch (error) {
    console.error('Brand SaaS Request Endpoint Error:', error);
    return NextResponse.json({ error: 'Başvuru kaydedilemedi', details: error.message }, { status: 500 });
  }
}
