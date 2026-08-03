import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET: Fetch brand's own outlet listings
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get('brandId');

    if (!brandId) {
      return NextResponse.json({ success: false, error: 'Marka Kimliği (brandId) zorunludur.' }, { status: 400 });
    }

    const listings = await prisma.outletListing.findMany({
      where: { brandId },
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
    console.error('GET /api/brands/outlet Error:', error);
    return NextResponse.json({ success: false, error: 'İlanlar yüklenirken bir hata oluştu.' }, { status: 500 });
  }
}

// POST: Add new outlet stock listing for a brand
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      brandId,
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

    if (!brandId || !title || !unitPrice || !quantityM2) {
      return NextResponse.json({ success: false, error: 'Lütfen zorunlu alanları (Marka, Başlık, Metraj, Outlet Fiyatı) doldurun.' }, { status: 400 });
    }

    const brand = await prisma.brand.findUnique({
      where: { id: brandId },
      select: { name: true }
    });

    if (!brand) {
      return NextResponse.json({ success: false, error: 'Marka bulunamadı.' }, { status: 404 });
    }

    const listing = await prisma.outletListing.create({
      data: {
        brandId,
        productId: productId || null,
        title,
        category: category || 'PROJE_FAZLASI',
        badgeTag: badgeTag || 'Fabrika Çıkışlı / Proje Fazlası',
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

    return NextResponse.json({
      success: true,
      data: listing
    });
  } catch (error) {
    console.error('POST /api/brands/outlet Error:', error);
    return NextResponse.json({ success: false, error: 'İlan kaydedilirken hata oluştu.' }, { status: 500 });
  }
}

// PUT: Update a brand's outlet listing
export async function PUT(request) {
  try {
    const body = await request.json();
    const {
      id,
      brandId,
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

    if (!id || !brandId) {
      return NextResponse.json({ success: false, error: 'İlan ID ve Marka ID zorunludur.' }, { status: 400 });
    }

    const existing = await prisma.outletListing.findUnique({
      where: { id }
    });

    if (!existing || existing.brandId !== brandId) {
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
        originalPrice: originalPrice ? parseFloat(originalPrice) : (originalPrice === null ? null : existing.originalPrice),
        dimensions: dimensions !== undefined ? dimensions : existing.dimensions,
        colorFinish: colorFinish !== undefined ? colorFinish : existing.colorFinish,
        imageUrl: imageUrl !== undefined ? imageUrl : existing.imageUrl,
        notes: notes !== undefined ? notes : existing.notes,
        status: status !== undefined ? status : existing.status
      }
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('PUT /api/brands/outlet Error:', error);
    return NextResponse.json({ success: false, error: 'İlan güncellenirken hata oluştu.' }, { status: 500 });
  }
}

// DELETE: Delete a brand's outlet listing
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const brandId = searchParams.get('brandId');

    if (!id || !brandId) {
      return NextResponse.json({ success: false, error: 'İlan ID ve Marka ID zorunludur.' }, { status: 400 });
    }

    const existing = await prisma.outletListing.findUnique({
      where: { id }
    });

    if (!existing || existing.brandId !== brandId) {
      return NextResponse.json({ success: false, error: 'İlan bulunamadı veya silme yetkiniz yok.' }, { status: 403 });
    }

    await prisma.outletListing.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: 'İlan başarıyla silindi.' });
  } catch (error) {
    console.error('DELETE /api/brands/outlet Error:', error);
    return NextResponse.json({ success: false, error: 'İlan silinirken hata oluştu.' }, { status: 500 });
  }
}
