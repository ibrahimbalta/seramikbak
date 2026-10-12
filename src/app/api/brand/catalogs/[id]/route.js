import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-check';
import QRCode from 'qrcode';

// Helper to enrich productItems with actual product details from database & QR code
async function enrichCatalogProducts(catalog) {
  let items = [];
  try {
    items = JSON.parse(catalog.productItems || '[]');
  } catch (e) {
    items = [];
  }

  if (!items || items.length === 0) {
    return { ...catalog, products: [] };
  }

  const productIds = items.map(item => (typeof item === 'string' ? item : item.productId)).filter(Boolean);

  if (productIds.length === 0) {
    return { ...catalog, products: [] };
  }

  const dbProducts = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: {
      brand: {
        select: {
          id: true,
          name: true,
          slug: true,
          logoUrl: true,
        }
      }
    }
  });

  const productMap = new Map();
  dbProducts.forEach(p => productMap.set(p.id, p));

  const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.seramikbak.com';

  // Build sorted, enriched array with QR codes
  const enrichedProducts = await Promise.all(
    items.map(async (item, index) => {
      const pid = typeof item === 'string' ? item : item.productId;
      const dbProduct = productMap.get(pid);
      if (!dbProduct) return null;

      const productUrl = `${appBaseUrl}/urun/${dbProduct.slug}`;
      const tryInRoomUrl = `${appBaseUrl}/urun/${dbProduct.slug}?studio=3d`;

      let qrDataUrl = null;
      if (catalog.showQrCodes) {
        try {
          qrDataUrl = await QRCode.toDataURL(productUrl, {
            errorCorrectionLevel: 'M',
            margin: 1,
            width: 140,
            color: {
              dark: '#0f172a',
              light: '#ffffff'
            }
          });
        } catch (err) {
          console.error('[Catalog QR Code Gen Error]:', err);
        }
      }

      return {
        ...dbProduct,
        catalogItemIndex: index + 1,
        customNote: typeof item === 'object' ? item.customNote : null,
        customUsageArea: typeof item === 'object' ? item.usageArea : null,
        productUrl,
        tryInRoomUrl,
        qrCodeUrl: qrDataUrl,
      };
    })
  );

  return {
    ...catalog,
    products: enrichedProducts.filter(Boolean),
  };
}

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const catalog = await prisma.brandCatalog.findUnique({
      where: { id },
      include: {
        brand: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
          }
        }
      }
    });

    if (!catalog) {
      return NextResponse.json({ error: 'Katalog bulunamadı.' }, { status: 404 });
    }

    if (auth.role !== 'admin' && (auth.role !== 'brand' || auth.id !== catalog.brandId)) {
      return NextResponse.json({ error: 'Bu kataloğa erişim izniniz yok.' }, { status: 403 });
    }

    const enriched = await enrichCatalogProducts(catalog);

    return NextResponse.json({ success: true, catalog: enriched });
  } catch (error) {
    console.error('[Catalog Detail API Error]:', error);
    return NextResponse.json({ error: 'Katalog detayları yüklenirken hata oluştu.' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const existing = await prisma.brandCatalog.findUnique({
      where: { id }
    });

    if (!existing) {
      return NextResponse.json({ error: 'Katalog bulunamadı.' }, { status: 404 });
    }

    if (auth.role !== 'admin' && (auth.role !== 'brand' || auth.id !== existing.brandId)) {
      return NextResponse.json({ error: 'Bu kataloğu güncelleme izniniz yok.' }, { status: 403 });
    }

    const body = await request.json();
    const {
      title,
      description,
      coverTitle,
      coverSubtitle,
      introText,
      template,
      orientation,
      pageSize,
      language,
      customLogoUrl,
      primaryColor,
      accentColor,
      websiteUrl,
      contactPhone,
      contactEmail,
      contactAddress,
      showPrices,
      showSpecs,
      showCodes,
      showDescriptions,
      showQrCodes,
      showCover,
      showTOC,
      showContactPage,
      showPageNumbers,
      productItems,
      isPublished,
      isDraft,
    } = body;

    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description ? description.trim() : null;
    if (coverTitle !== undefined) updateData.coverTitle = coverTitle ? coverTitle.trim() : null;
    if (coverSubtitle !== undefined) updateData.coverSubtitle = coverSubtitle ? coverSubtitle.trim() : null;
    if (introText !== undefined) updateData.introText = introText ? introText.trim() : null;
    if (template !== undefined) updateData.template = template;
    if (orientation !== undefined) updateData.orientation = orientation;
    if (pageSize !== undefined) updateData.pageSize = pageSize;
    if (language !== undefined) updateData.language = language;
    if (customLogoUrl !== undefined) updateData.customLogoUrl = customLogoUrl;
    if (primaryColor !== undefined) updateData.primaryColor = primaryColor;
    if (accentColor !== undefined) updateData.accentColor = accentColor;
    if (websiteUrl !== undefined) updateData.websiteUrl = websiteUrl;
    if (contactPhone !== undefined) updateData.contactPhone = contactPhone;
    if (contactEmail !== undefined) updateData.contactEmail = contactEmail;
    if (contactAddress !== undefined) updateData.contactAddress = contactAddress;

    if (showPrices !== undefined) updateData.showPrices = Boolean(showPrices);
    if (showSpecs !== undefined) updateData.showSpecs = Boolean(showSpecs);
    if (showCodes !== undefined) updateData.showCodes = Boolean(showCodes);
    if (showDescriptions !== undefined) updateData.showDescriptions = Boolean(showDescriptions);
    if (showQrCodes !== undefined) updateData.showQrCodes = Boolean(showQrCodes);
    if (showCover !== undefined) updateData.showCover = Boolean(showCover);
    if (showTOC !== undefined) updateData.showTOC = Boolean(showTOC);
    if (showContactPage !== undefined) updateData.showContactPage = Boolean(showContactPage);
    if (showPageNumbers !== undefined) updateData.showPageNumbers = Boolean(showPageNumbers);
    if (isPublished !== undefined) updateData.isPublished = Boolean(isPublished);
    if (isDraft !== undefined) updateData.isDraft = Boolean(isDraft);

    if (productItems !== undefined) {
      const rawItems = Array.isArray(productItems)
        ? productItems
        : typeof productItems === 'string'
        ? JSON.parse(productItems || '[]')
        : [];

      // Validate products belong to brand
      if (rawItems.length > 0) {
        const productIds = rawItems.map(item => (typeof item === 'string' ? item : item.productId)).filter(Boolean);
        if (productIds.length > 0) {
          const ownedCount = await prisma.product.count({
            where: {
              id: { in: productIds },
              brandId: existing.brandId,
            }
          });
          if (ownedCount !== productIds.length && auth.role !== 'admin') {
            return NextResponse.json({
              error: 'Seçilen ürünlerden bazıları bu markaya ait değil.'
            }, { status: 400 });
          }
        }
      }
      updateData.productItems = JSON.stringify(rawItems);
    }

    const updated = await prisma.brandCatalog.update({
      where: { id },
      data: updateData,
      include: {
        brand: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
          }
        }
      }
    });

    const enriched = await enrichCatalogProducts(updated);

    return NextResponse.json({ success: true, catalog: enriched });
  } catch (error) {
    console.error('[Catalog Update API Error]:', error);
    return NextResponse.json({ error: 'Katalog güncellenirken hata meydana geldi.' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const existing = await prisma.brandCatalog.findUnique({
      where: { id }
    });

    if (!existing) {
      return NextResponse.json({ error: 'Katalog bulunamadı.' }, { status: 404 });
    }

    if (auth.role !== 'admin' && String(auth.id) !== String(existing.brandId)) {
      return NextResponse.json({ error: 'Bu kataloğu silme yetkiniz yok.' }, { status: 403 });
    }

    await prisma.brandCatalog.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: 'Katalog başarıyla silindi.' });
  } catch (error) {
    console.error('[Catalog Delete API Error]:', error);
    return NextResponse.json({ error: 'Katalog silinirken hata oluştu.' }, { status: 500 });
  }
}
