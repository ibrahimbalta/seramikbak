import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-check';
import QRCode from 'qrcode';

export async function GET(request, { params }) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const isDownload = searchParams.get('download') === 'true';

    if (!slug) {
      return NextResponse.json({ error: 'Katalog slug belirtilmedi.' }, { status: 400 });
    }

    const catalog = await prisma.brandCatalog.findUnique({
      where: { publicSlug: slug },
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
      return NextResponse.json({ error: 'Katalog bulunamadı veya yayından kaldırılmış.' }, { status: 404 });
    }

    // If catalog is unpublished draft, check if authenticated owner brand or admin is viewing preview
    if (!catalog.isPublished) {
      const auth = await verifyAuth(request);
      if (!auth || (auth.role !== 'admin' && (auth.role !== 'brand' || auth.id !== catalog.brandId))) {
        return NextResponse.json({
          error: 'Bu katalog henüz herkese açık olarak yayınlanmamış.'
        }, { status: 403 });
      }
    }

    // Increment analytics asynchronously
    if (isDownload) {
      prisma.brandCatalog.update({
        where: { id: catalog.id },
        data: { downloadCount: { increment: 1 } }
      }).catch(err => console.error('[Catalog Download Counter Error]:', err));
    } else {
      prisma.brandCatalog.update({
        where: { id: catalog.id },
        data: { viewCount: { increment: 1 } }
      }).catch(err => console.error('[Catalog View Counter Error]:', err));
    }

    // Parse product items and load rich DB product info
    let items = [];
    try {
      items = JSON.parse(catalog.productItems || '[]');
    } catch (e) {
      items = [];
    }

    const productIds = items.map(item => (typeof item === 'string' ? item : item.productId)).filter(Boolean);

    let enrichedProducts = [];
    if (productIds.length > 0) {
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

      enrichedProducts = await Promise.all(
        items.map(async (item, index) => {
          const pid = typeof item === 'string' ? item : item.productId;
          const dbProduct = productMap.get(pid);
          if (!dbProduct) return null;

          const productUrl = `${appBaseUrl}/urun/${dbProduct.slug}`;
          const tryInRoomUrl = `${appBaseUrl}/urun/${dbProduct.slug}?studio=3d`;

          let qrCodeUrl = null;
          if (catalog.showQrCodes) {
            try {
              qrCodeUrl = await QRCode.toDataURL(productUrl, {
                errorCorrectionLevel: 'M',
                margin: 1,
                width: 140,
                color: {
                  dark: '#0f172a',
                  light: '#ffffff'
                }
              });
            } catch (err) {
              console.error('[Public Catalog QR Code Gen Error]:', err);
            }
          }

          const ov = typeof item === 'object' && item.overrides ? item.overrides : {};
          return {
            ...dbProduct,
            ...(ov.name ? { name: ov.name } : {}),
            ...(ov.sku ? { sku: ov.sku } : {}),
            ...(ov.width ? { width: Number(ov.width) || ov.width } : {}),
            ...(ov.height ? { height: Number(ov.height) || ov.height } : {}),
            ...(ov.thickness ? { thickness: ov.thickness } : {}),
            ...(ov.finish ? { finish: ov.finish } : {}),
            ...(ov.color ? { color: ov.color } : {}),
            ...(ov.slipResistance ? { slipResistance: ov.slipResistance } : {}),
            ...(ov.peiRating ? { peiRating: ov.peiRating } : {}),
            ...(ov.description ? { description: ov.description } : {}),
            ...(ov.imageUrl ? { imageUrl: ov.imageUrl } : {}),
            ...(ov.badge ? { badge: ov.badge } : {}),
            ...(ov.price ? { customPrice: ov.price } : {}),
            catalogItemIndex: index + 1,
            customNote: typeof item === 'object' ? ov.description || item.customNote : null,
            customUsageArea: typeof item === 'object' ? ov.usageArea || item.usageArea : null,
            productUrl: ov.customUrl || productUrl,
            tryInRoomUrl,
            qrCodeUrl,
            overrides: ov,
          };
        })
      );
    }

    const firstItemMeta = items.find((i) => typeof i === 'object' && i._metaSectionSettings);

    return NextResponse.json({
      success: true,
      catalog: {
        ...catalog,
        sectionSettings: firstItemMeta?._metaSectionSettings || null,
        products: enrichedProducts.filter(Boolean),
      }
    });

  } catch (error) {
    console.error('[Public Catalog Fetch API Error]:', error);
    return NextResponse.json({ error: 'Katalog yüklenirken hata oluştu.' }, { status: 500 });
  }
}
