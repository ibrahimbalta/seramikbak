import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET: Fetch dealer's own outlet listings
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const dealerId = searchParams.get('dealerId');

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
    const body = await request.json();
    const {
      dealerId,
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

    if (!dealerId || !title || !unitPrice || !quantityM2) {
      return NextResponse.json({ success: false, error: 'Lütfen zorunlu alanları (Bayi, Başlık, Metraj, Outlet Fiyatı) doldurun.' }, { status: 400 });
    }

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

    return NextResponse.json({ success: true, data: listing });
  } catch (error) {
    console.error('POST /api/dealers/outlet Error:', error);
    return NextResponse.json({ success: false, error: 'İlan kaydedilirken hata oluştu.' }, { status: 500 });
  }
}

// PUT: Update an outlet listing (details or status)
export async function PUT(request) {
  try {
    const body = await request.json();
    const {
      id,
      dealerId,
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

    if (!id || !dealerId) {
      return NextResponse.json({ success: false, error: 'İlan ID ve Bayi ID zorunludur.' }, { status: 400 });
    }

    const existing = await prisma.outletListing.findUnique({
      where: { id }
    });

    if (!existing || existing.dealerId !== dealerId) {
      return NextResponse.json({ success: false, error: 'İlan bulunamadı veya düzenleme yetkiniz yok.' }, { status: 404 });
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
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const dealerId = searchParams.get('dealerId');

    if (!id || !dealerId) {
      return NextResponse.json({ success: false, error: 'İlan ID ve Bayi ID zorunludur.' }, { status: 400 });
    }

    const existing = await prisma.outletListing.findUnique({
      where: { id }
    });

    if (!existing || existing.dealerId !== dealerId) {
      return NextResponse.json({ success: false, error: 'İlan bulunamadı veya silme yetkiniz yok.' }, { status: 404 });
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
