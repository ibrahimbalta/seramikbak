import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-check';

// GET: Fetch dealer's own outlet listings
export async function GET(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth || (auth.role !== 'dealer' && auth.role !== 'admin')) {
      return NextResponse.json({ success: false, error: 'Yetkisiz erişim. Lütfen giriş yapınız.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    // Anti-IDOR: Regular dealers can only view their own listings
    const dealerId = auth.role === 'dealer' ? auth.id : (searchParams.get('dealerId') || auth.id);

    if (!dealerId) {
      return NextResponse.json({ success: false, error: 'Bayi Kimliği (dealerId) zorunludur.' }, { status: 400 });
    }

    const listings = await prisma.outletListing.findMany({
      where: { dealerId },
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            code: true,
            imageUrl: true
          }
        }
      }
    });

    return NextResponse.json({ success: true, data: listings });
  } catch (error) {
    console.error('GET /api/dealers/outlet Error:', error);
    return NextResponse.json({ success: false, error: 'İlanlar yüklenirken bir hata oluştu.' }, { status: 500 });
  }
}

// POST: Add new outlet stock listing
export async function POST(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth || (auth.role !== 'dealer' && auth.role !== 'admin')) {
      return NextResponse.json({ success: false, error: 'Yetkisiz erişim. Lütfen giriş yapınız.' }, { status: 401 });
    }

    const body = await request.json();
    const {
      productId,
      title,
      category,
      badgeTag,
      quantityM2,
      unitPrice,
      originalPrice,
      dimensions,
      colorFinish,
      imageUrl,
      notes,
      status
    } = body;

    // Anti-IDOR: Force session ID for dealers
    const dealerId = auth.role === 'dealer' ? auth.id : (body.dealerId || auth.id);

    if (!dealerId || !title || !unitPrice || !quantityM2) {
      return NextResponse.json({ success: false, error: 'Lütfen zorunlu alanları (Bayi, Başlık, Metraj, Outlet Fiyatı) doldurun.' }, { status: 400 });
    }

    const dealer = await prisma.dealer.findUnique({
      where: { id: dealerId },
      select: { city: true, name: true, phone: true }
    });

    const listing = await prisma.outletListing.create({
      data: {
        dealerId,
        productId: productId || null,
        title,
        category: category || 'PROJE_FAZLASI',
        badgeTag: badgeTag || 'Kapatıyoruz / Proje Fazlası',
        quantityM2: parseFloat(quantityM2),
        unitPrice: parseFloat(unitPrice),
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        dimensions: dimensions || null,
        colorFinish: colorFinish || null,
        imageUrl: imageUrl || null,
        notes: notes || null,
        status: status || 'ACTIVE'
      }
    });

    // Match active WhatsApp alert subscribers for dealer's city or ALL
    const dealerCity = dealer?.city || 'ALL';
    const matchingAlerts = await prisma.outletAlert.findMany({
      where: {
        status: 'ACTIVE',
        OR: [
          { city: dealerCity },
          { city: 'ALL' }
        ]
      },
      select: { id: true, name: true, phone: true, city: true }
    });

    console.log(`[OUTLET ALERT] New Listing Created by ${dealer?.name || 'Dealer'} in ${dealerCity}. Matched ${matchingAlerts.length} WhatsApp subscribers!`);

    return NextResponse.json({
      success: true,
      data: listing,
      matchedAlertsCount: matchingAlerts.length,
      alertCity: dealerCity
    });
  } catch (error) {
    console.error('POST /api/dealers/outlet Error:', error);
    return NextResponse.json({ success: false, error: 'İlan kaydedilirken hata oluştu.' }, { status: 500 });
  }
}

// PUT: Update an outlet listing (details or status)
export async function PUT(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth || (auth.role !== 'dealer' && auth.role !== 'admin')) {
      return NextResponse.json({ success: false, error: 'Yetkisiz erişim. Lütfen giriş yapınız.' }, { status: 401 });
    }

    const body = await request.json();
    const {
      id,
      title,
      category,
      badgeTag,
      quantityM2,
      unitPrice,
      originalPrice,
      dimensions,
      colorFinish,
      imageUrl,
      notes,
      status
    } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'İlan ID zorunludur.' }, { status: 400 });
    }

    const existing = await prisma.outletListing.findUnique({
      where: { id }
    });

    // Anti-IDOR check: Dealer must own this listing unless admin
    if (!existing || (auth.role === 'dealer' && existing.dealerId !== auth.id)) {
      return NextResponse.json({ success: false, error: 'İlan bulunamadı veya düzenleme yetkiniz yok.' }, { status: 403 });
    }

    const updated = await prisma.outletListing.update({
      where: { id },
      data: {
        title: title !== undefined ? title : existing.title,
        category: category !== undefined ? category : existing.category,
        badgeTag: badgeTag !== undefined ? badgeTag : existing.badgeTag,
        quantityM2: quantityM2 !== undefined ? parseFloat(quantityM2) : existing.quantityM2,
        unitPrice: unitPrice !== undefined ? parseFloat(unitPrice) : existing.unitPrice,
        originalPrice: originalPrice !== undefined ? (originalPrice ? parseFloat(originalPrice) : null) : existing.originalPrice,
        dimensions: dimensions !== undefined ? dimensions : existing.dimensions,
        colorFinish: colorFinish !== undefined ? colorFinish : existing.colorFinish,
        imageUrl: imageUrl !== undefined ? imageUrl : existing.imageUrl,
        notes: notes !== undefined ? notes : existing.notes,
        status: status !== undefined ? status : existing.status
      }
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('PUT /api/dealers/outlet Error:', error);
    return NextResponse.json({ success: false, error: 'İlan güncellenirken hata oluştu.' }, { status: 500 });
  }
}

// DELETE: Delete an outlet listing
export async function DELETE(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth || (auth.role !== 'dealer' && auth.role !== 'admin')) {
      return NextResponse.json({ success: false, error: 'Yetkisiz erişim. Lütfen giriş yapınız.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'İlan ID zorunludur.' }, { status: 400 });
    }

    const existing = await prisma.outletListing.findUnique({
      where: { id }
    });

    // Anti-IDOR check: Dealer must own this listing unless admin
    if (!existing || (auth.role === 'dealer' && existing.dealerId !== auth.id)) {
      return NextResponse.json({ success: false, error: 'İlan bulunamadı veya silme yetkiniz yok.' }, { status: 403 });
    }

    await prisma.outletListing.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: 'İlan başarıyla silindi.' });
  } catch (error) {
    console.error('DELETE /api/dealers/outlet Error:', error);
    return NextResponse.json({ success: false, error: 'İlan silinirken hata oluştu.' }, { status: 500 });
  }
}
