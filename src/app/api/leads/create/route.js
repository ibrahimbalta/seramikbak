import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendLeadNotification } from '@/lib/email';
import { sendPushNotification } from '@/lib/pushServer';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(request) {
  try {
    const rateLimit = checkRateLimit(request, 10, 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Çok fazla teklif talebi gönderdiniz. Lütfen bir süre sonra tekrar deneyin.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { 
      productId, 
      productName,
      dealerId, 
      clientName, 
      name,
      clientPhone, 
      phone,
      clientEmail, 
      email,
      notes,
      message,
      requestedUsta,
      requestedArchitect,
      projectDimensions,
      projectPhotoUrl
    } = body;

    const resolvedName = (clientName || name || '').trim();
    const resolvedPhone = (clientPhone || phone || '').trim();
    const cleanPhone = resolvedPhone.replace(/\D/g, '');
    let resolvedEmail = (clientEmail || email || '').trim();
    if (!resolvedEmail) {
      resolvedEmail = `${cleanPhone || 'musteri'}@musteri.seramikbak.com`;
    }

    let resolvedNotes = (notes !== undefined ? notes : (message || '')).trim();

    // Validate inputs
    if (!dealerId) {
      return NextResponse.json(
        { error: 'Bayi seçimi zorunludur.' },
        { status: 400 }
      );
    }

    if (!resolvedName || !resolvedPhone) {
      return NextResponse.json(
        { error: 'Lütfen adınızı ve telefon numaranızı eksiksiz doldurunuz.' },
        { status: 400 }
      );
    }

    if (resolvedName.length > 150 || resolvedEmail.length > 150 || resolvedPhone.length > 50 || (resolvedNotes && resolvedNotes.length > 3000)) {
      return NextResponse.json(
        { error: 'Girdi karakter sınırını aşıyor.' },
        { status: 400 }
      );
    }

    // Verify dealer exists
    const dealer = await prisma.dealer.findUnique({
      where: { id: dealerId }
    });

    if (!dealer) {
      return NextResponse.json(
        { error: 'İlgili bayi sistemde bulunamadı.' },
        { status: 404 }
      );
    }

    // Verify or resolve product
    let product = null;
    let resolvedProductId = productId || null;

    if (resolvedProductId) {
      product = await prisma.product.findUnique({
        where: { id: resolvedProductId }
      });
    }

    // If product not explicitly passed (e.g. general showroom quote) or not found:
    if (!product && dealer.featuredProducts) {
      try {
        const rawFeat = JSON.parse(dealer.featuredProducts);
        const featIds = Array.isArray(rawFeat)
          ? rawFeat.map(item => (typeof item === 'object' && item !== null ? item.id : item)).filter(Boolean)
          : [];
        if (featIds.length > 0) {
          product = await prisma.product.findFirst({
            where: { id: { in: featIds } }
          });
        }
      } catch (e) {}
    }

    if (!product) {
      // 1. Try dealer's inventory
      try {
        const inv = await prisma.dealerInventory.findFirst({
          where: { dealerId: dealer.id }
        });
        if (inv?.productId) {
          product = await prisma.product.findUnique({
            where: { id: inv.productId }
          });
        }
      } catch (e) {}
    }

    if (!product && dealer.brandId) {
      // 2. Try dealer's brand products
      try {
        product = await prisma.product.findFirst({
          where: { brandId: dealer.brandId }
        });
      } catch (e) {}
    }

    if (!product) {
      // 3. Fallback to any active product to satisfy relational integrity
      try {
        product = await prisma.product.findFirst();
      } catch (e) {}
    }

    if (!product) {
      return NextResponse.json(
        { error: 'Katalogda kayıtlı ürün bulunamadı.' },
        { status: 404 }
      );
    }

    resolvedProductId = product.id;

    // If no specific product was chosen in the modal, prefix note with showroom context
    if (!productId) {
      const prefix = productName ? `[${productName}]` : '[Genel Showroom Teklif Talebi]';
      resolvedNotes = resolvedNotes ? `${prefix} ${resolvedNotes}` : `${prefix} Showroom geneli için proforma teklif ve stok bilgisi talep edildi.`;
    }

    // Create the lead record
    const lead = await prisma.lead.create({
      data: {
        productId: resolvedProductId,
        dealerId,
        clientName: resolvedName,
        clientPhone: resolvedPhone,
        clientEmail: resolvedEmail,
        notes: resolvedNotes,
        requestedUsta: !!requestedUsta,
        requestedArchitect: !!requestedArchitect,
        projectDimensions: projectDimensions || null,
        projectPhotoUrl: projectPhotoUrl || null,
        status: 'PENDING'
      },
      include: {
        product: {
          select: { name: true, code: true, imageUrl: true }
        }
      }
    });

    // Log analytics
    try {
      await prisma.analyticsLog.create({
        data: {
          action: 'LEAD',
          productId: resolvedProductId,
          brandId: product.brandId || dealer.brandId,
          city: dealer.city || 'İstanbul'
        }
      });
    } catch (e) {
      console.warn('Analytics log failed:', e.message);
    }

    // Send email notification to seramikbak@gmail.com and dealer
    try {
      sendLeadNotification({
        name: resolvedName,
        phone: resolvedPhone,
        city: dealer.city,
        notes: resolvedNotes,
        dealerName: dealer.name,
        dealerEmail: dealer.email,
        productName: productName || product.name
      }).catch(err => {
        console.error('Lead email notification trigger error:', err);
      });
    } catch (e) {
      console.warn('sendLeadNotification failed:', e.message);
    }

    // Send Web Push notification to dealer
    try {
      sendPushNotification({
        userType: 'DEALER',
        userId: dealerId,
        title: '🎯 Yeni Müşteri Teklif Talebi!',
        body: `${resolvedName} (${dealer.city || 'Genel'}) - ${productName || product.name} için fiyat teklifi bekliyor.`,
        url: '/bayi'
      }).catch(err => {
        console.warn('Lead push notification error:', err.message);
      });
    } catch (e) {
      console.warn('sendPushNotification failed:', e.message);
    }

    return NextResponse.json({
      success: true,
      message: 'Teklif talebi bayiye başarıyla iletildi.',
      leadId: lead.id,
      lead
    });
  } catch (error) {
    console.error('Create Lead API Error:', error);
    return NextResponse.json(
      { error: 'Failed to submit lead', details: error.message },
      { status: 500 }
    );
  }
}
