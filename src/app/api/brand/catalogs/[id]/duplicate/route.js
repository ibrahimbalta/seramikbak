import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-check';
import { slugify } from '@/lib/slugify';
import crypto from 'crypto';

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const source = await prisma.brandCatalog.findUnique({
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

    if (!source) {
      return NextResponse.json({ error: 'Kaynak katalog bulunamadı.' }, { status: 404 });
    }

    if (auth.role !== 'admin' && (auth.role !== 'brand' || auth.id !== source.brandId)) {
      return NextResponse.json({ error: 'Bu kataloğu kopyalama yetkiniz yok.' }, { status: 403 });
    }

    const newTitle = `${source.title} (Kopya)`;
    const baseSlug = slugify(`${source.brand.name}-${newTitle}`);
    const randomSuffix = crypto.randomBytes(3).toString('hex');
    const publicSlug = `${baseSlug}-${randomSuffix}`;

    const duplicated = await prisma.brandCatalog.create({
      data: {
        brandId: source.brandId,
        title: newTitle,
        description: source.description,
        coverTitle: source.coverTitle ? `${source.coverTitle} (Kopya)` : newTitle,
        coverSubtitle: source.coverSubtitle,
        introText: source.introText,
        template: source.template,
        orientation: source.orientation,
        pageSize: source.pageSize,
        language: source.language,
        customLogoUrl: source.customLogoUrl,
        primaryColor: source.primaryColor,
        accentColor: source.accentColor,
        websiteUrl: source.websiteUrl,
        contactPhone: source.contactPhone,
        contactEmail: source.contactEmail,
        contactAddress: source.contactAddress,
        showPrices: source.showPrices,
        showSpecs: source.showSpecs,
        showCodes: source.showCodes,
        showDescriptions: source.showDescriptions,
        showQrCodes: source.showQrCodes,
        showCover: source.showCover,
        showTOC: source.showTOC,
        showContactPage: source.showContactPage,
        showPageNumbers: source.showPageNumbers,
        productItems: source.productItems,
        isPublished: false,
        isDraft: true,
        publicSlug,
        viewCount: 0,
        downloadCount: 0,
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

    let itemCount = 0;
    try {
      const items = JSON.parse(duplicated.productItems || '[]');
      itemCount = Array.isArray(items) ? items.length : 0;
    } catch (e) {
      itemCount = 0;
    }

    return NextResponse.json({
      success: true,
      catalog: {
        ...duplicated,
        itemCount,
      }
    }, { status: 201 });

  } catch (error) {
    console.error('[Catalog Duplicate API Error]:', error);
    return NextResponse.json({ error: 'Katalog kopyalanırken hata oluştu.' }, { status: 500 });
  }
}
