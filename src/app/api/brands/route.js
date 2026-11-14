import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { verifyAuth } from '@/lib/auth-check';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

const customOrder = [
  "Çanakkale Seramik",
  "NG Kütahya Seramik",
  "VitrA",
  "Bien Seramik",
  "Yurtbay Seramik",
  "Seramiksan",
  "Ege Seramik",
  "Qua Granite",
  "Duratiles",
  "DuraTiles"
];

export async function GET() {
  try {
    const brands = await prisma.brand.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        _count: {
          select: { products: true }
        }
      }
    });

    brands.sort((a, b) => {
      const indexA = customOrder.findIndex(name => name.toLowerCase() === a.name.toLowerCase());
      const indexB = customOrder.findIndex(name => name.toLowerCase() === b.name.toLowerCase());
      
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      if (indexA !== -1) {
        return -1;
      }
      if (indexB !== -1) {
        return 1;
      }
      return a.name.localeCompare(b.name, 'tr');
    });

    return NextResponse.json(brands);
  } catch (error) {
    console.error('Brands API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch brands' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const clientIp = getClientIp(request);
    const rateCheck = checkRateLimit(`brand_apply_${clientIp}`, 10, 15 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: '\u00c7ok fazla ba\u015fvuru denemesi. L\u00fctfen daha sonra tekrar deneyin.' }, { status: 429 });
    }

    const payload = await request.json();
    const brandName = payload.name || payload.brandName || payload.brandId;
    const contactPerson = payload.contactPerson || payload.paymentSender || 'Yetkili';
    const email = payload.email || '';
    const phone = payload.phone || '';
    const note = payload.note || payload.paymentNote || '';
    const collectionCount = payload.collectionCount || '10-25';

    if (!brandName || (!email && !phone)) {
      return NextResponse.json({ error: 'Lütfen Marka Adı, E-Posta ve Telefon alanlarını doldurun.' }, { status: 400 });
    }

    // Find or create Brand
    let brand = await prisma.brand.findFirst({
      where: {
        OR: [
          { id: brandName },
          { name: { equals: brandName, mode: 'insensitive' } }
        ]
      }
    });

    if (brand) {
      const auth = await verifyAuth(request);
      const isOwnerOrAdmin = auth && (auth.role === 'admin' || (auth.role === 'brand' && auth.id === brand.id));
      if (!isOwnerOrAdmin) {
        return NextResponse.json(
          { error: 'Bu marka ad\u0131 sistemde zaten kay\u0131tl\u0131. Mevcut marka hesab\u0131n\u0131zla giri\u015f yaparak i\u015flem yapabilirsiniz.' },
          { status: 409 }
        );
      }
    } else {
      const cleanUsername = brandName.toLowerCase().replace(/[^a-z0-9]/g, '') + Math.floor(1000 + Math.random() * 9000);
      const rawPassword = 'marka' + Math.floor(1000 + Math.random() * 9000);
      brand = await prisma.brand.create({
        data: {
          name: brandName,
          username: cleanUsername,
          password: hashPassword(rawPassword)
        }
      });
    }

    const formattedPaymentNote = `Yetkili: ${contactPerson} | E-posta: ${email} | Tel: ${phone} | Koleksiyon: ${collectionCount} | Not: ${note}`;
    const paymentDateStr = new Date().toISOString().split('T')[0];

    const existingConfig = await prisma.saaSConfig.findFirst({
      where: { brandId: brand.id }
    });

    if (existingConfig) {
      await prisma.saaSConfig.update({
        where: { id: existingConfig.id },
        data: {
          pendingPlan: 'ENTERPRISE_GLOBAL_EXPORTS',
          pendingStatus: 'PENDING_APPROVAL',
          status: existingConfig.status === 'ACTIVE' ? 'ACTIVE' : 'PENDING_APPROVAL',
          paymentSender: contactPerson,
          paymentDate: paymentDateStr,
          paymentNote: formattedPaymentNote
        }
      });
    } else {
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      await prisma.saaSConfig.create({
        data: {
          brandId: brand.id,
          plan: 'ENTERPRISE_GLOBAL_EXPORTS',
          status: 'PENDING_APPROVAL',
          expiresAt: expiresAt,
          paymentSender: contactPerson,
          paymentDate: paymentDateStr,
          paymentNote: formattedPaymentNote
        }
      });
    }

    console.log(`[POST /api/brands] Brand application saved for ${brand.name}`);

    return NextResponse.json({
      success: true,
      message: 'Marka katılım başvurunuz başarıyla alındı. Müşteri temsilcimiz 24 saat içinde sizinle iletişime geçecektir.',
      brandId: brand.id
    });
  } catch (error) {
    console.error('Brand Register API Error:', error);
    return NextResponse.json({ error: 'Başvuru kaydedilemedi', details: error.message }, { status: 500 });
  }
}
