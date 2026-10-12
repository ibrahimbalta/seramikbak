import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-check';
import { slugify } from '@/lib/slugify';
import crypto from 'crypto';

export async function GET(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get('brandId') || auth.id;

    if (!brandId) {
      return NextResponse.json({ error: 'Marka ID gereklidir.' }, { status: 400 });
    }

    // Role check: brand can only view its own catalogs, admin can view any
    if (auth.role !== 'admin' && (auth.role !== 'brand' || auth.id !== brandId)) {
      return NextResponse.json({ error: 'Bu markanın kataloglarına erişim yetkiniz yok.' }, { status: 403 });
    }

    const catalogs = await prisma.brandCatalog.findMany({
      where: { brandId },
      orderBy: { updatedAt: 'desc' },
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

    // Format catalogs with product count
    const formatted = catalogs.map((cat) => {
      let itemCount = 0;
      try {
        const parsed = JSON.parse(cat.productItems || '[]');
        itemCount = Array.isArray(parsed) ? parsed.length : 0;
      } catch (e) {
        itemCount = 0;
      }
      return {
        ...cat,
        itemCount,
      };
    });

    return NextResponse.json({ success: true, catalogs: formatted });
  } catch (error) {
    console.error('[Catalog List API Error]:', error);
    return NextResponse.json({ error: 'Kataloglar yüklenirken hata oluştu.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const body = await request.json();
    const {
      brandId,
      title,
      description,
      coverTitle,
      coverSubtitle,
      introText,
      template = 'milano',
      orientation = 'portrait',
      pageSize = 'a4',
      language = 'tr',
      customLogoUrl,
      primaryColor = '#b4823c',
      accentColor = '#0f172a',
      websiteUrl,
      contactPhone,
      contactEmail,
      contactAddress,
      showPrices = false,
      showSpecs = true,
      showCodes = true,
      showDescriptions = true,
      showQrCodes = true,
      showCover = true,
      showTOC = true,
      showContactPage = true,
      showPageNumbers = true,
      productItems = [],
      isPublished = false,
      isDraft = true,
    } = body;

    const targetBrandId = brandId || auth.id;

    if (!targetBrandId) {
      return NextResponse.json({ error: 'Marka ID eksik.' }, { status: 400 });
    }

    if (auth.role !== 'admin' && (auth.role !== 'brand' || auth.id !== targetBrandId)) {
      return NextResponse.json({ error: 'Bu marka adına katalog oluşturma yetkiniz yok.' }, { status: 403 });
    }

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Katalog başlığı zorunludur.' }, { status: 400 });
    }

    // Verify brand exists
    const brand = await prisma.brand.findUnique({
      where: { id: targetBrandId }
    });

    if (!brand) {
      return NextResponse.json({ error: 'Marka bulunamadı.' }, { status: 404 });
    }

    // Parse and validate productItems
    const rawItems = Array.isArray(productItems)
      ? productItems
      : typeof productItems === 'string'
      ? JSON.parse(productItems || '[]')
      : [];

    // Verify that all selected products belong to this brand (multi-tenant security)
    if (rawItems.length > 0) {
      const productIds = rawItems.map(item => typeof item === 'string' ? item : item.productId).filter(Boolean);
      if (productIds.length > 0) {
        const ownedCount = await prisma.product.count({
          where: {
            id: { in: productIds },
            brandId: targetBrandId,
          }
        });
        if (ownedCount !== productIds.length && auth.role !== 'admin') {
          return NextResponse.json({
            error: 'Seçilen bazı ürünler markanıza ait değil veya veritabanında bulunamadı.'
          }, { status: 400 });
        }
      }
    }

    // Generate unique slug
    const baseSlug = slugify(`${brand.name}-${title}`);
    const randomSuffix = crypto.randomBytes(3).toString('hex');
    const publicSlug = `${baseSlug}-${randomSuffix}`;

    const created = await prisma.brandCatalog.create({
      data: {
        brandId: targetBrandId,
        title: title.trim(),
        description: description?.trim() || null,
        coverTitle: coverTitle?.trim() || title.trim(),
        coverSubtitle: coverSubtitle?.trim() || null,
        introText: introText?.trim() || null,
        template,
        orientation,
        pageSize,
        language,
        customLogoUrl: customLogoUrl || brand.logoUrl || null,
        primaryColor,
        accentColor,
        websiteUrl: websiteUrl || null,
        contactPhone: contactPhone || null,
        contactEmail: contactEmail || null,
        contactAddress: contactAddress || null,
        showPrices: Boolean(showPrices),
        showSpecs: Boolean(showSpecs),
        showCodes: Boolean(showCodes),
        showDescriptions: Boolean(showDescriptions),
        showQrCodes: Boolean(showQrCodes),
        showCover: Boolean(showCover),
        showTOC: Boolean(showTOC),
        showContactPage: Boolean(showContactPage),
        showPageNumbers: Boolean(showPageNumbers),
        productItems: JSON.stringify(rawItems),
        isPublished: Boolean(isPublished),
        isDraft: Boolean(isDraft),
        publicSlug,
      },
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

    return NextResponse.json({
      success: true,
      catalog: {
        ...created,
        itemCount: rawItems.length,
      }
    }, { status: 201 });

  } catch (error) {
    console.error('[Catalog Create API Error]:', error);
    return NextResponse.json({ error: 'Katalog oluşturulurken hata meydana geldi.' }, { status: 500 });
  }
}
