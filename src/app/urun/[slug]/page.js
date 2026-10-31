import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { slugify } from '@/lib/slugify';
import ProductDetailClient from './ProductDetailClient';
import './product-detail.css';
import { generateProductSchema, generateBreadcrumbSchema, generateFaqSchema, generateImageObjectSchema } from '@/lib/seo/schemaGenerator';
import { generateImageAltText } from '@/lib/seo/imageSeo';

// Helper to find a product by slug, code, brand+name slug or ID
async function getProductBySlugOrId(slug) {
  if (!slug) return null;

  try {
    const targetSlug = decodeURIComponent(slug).toLowerCase().trim();

    // 1. Direct indexed slug match - fastest O(1)
    const bySlug = await prisma.product.findUnique({
      where: { slug: targetSlug },
      include: { brand: true }
    });
    if (bySlug) return bySlug;

    // 2. Direct UUID match
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetSlug);
    if (isUuid) {
      const p = await prisma.product.findUnique({
        where: { id: targetSlug },
        include: { brand: true }
      });
      if (p) return p;
    }

    // 3. Direct exact code match (case-insensitive)
    const byCode = await prisma.product.findFirst({
      where: {
        code: {
          equals: targetSlug,
          mode: 'insensitive'
        }
      },
      include: { brand: true }
    });
    if (byCode) return byCode;

    // 4. Case-insensitive slug fallback
    const bySlugInsensitive = await prisma.product.findFirst({
      where: {
        slug: {
          equals: targetSlug,
          mode: 'insensitive'
        }
      },
      include: { brand: true }
    });
    if (bySlugInsensitive) return bySlugInsensitive;

    // 5. Brand-prefixed slug resolution (e.g. 'ng-kutahya-seramik-calacatta-gold')
    const brands = await prisma.brand.findMany({
      select: { id: true, name: true, slug: true }
    });
    const sortedBrands = brands.sort((a, b) => (b.slug || '').length - (a.slug || '').length);
    for (const b of sortedBrands) {
      const bSlug = b.slug || slugify(b.name);
      if (bSlug && targetSlug.startsWith(bSlug)) {
        const rest = targetSlug.slice(bSlug.length).replace(/^-+/, '').replace(/-/g, ' ').trim();
        if (rest) {
          // 5a. Direct name contains remainder
          let p = await prisma.product.findFirst({
            where: {
              brandId: b.id,
              name: { contains: rest, mode: 'insensitive' }
            },
            include: { brand: true }
          });
          if (p) return p;

          // 5b. All non-stop tokens must match
          const tokens = rest.split(/\s+/).filter(t => t.length > 2 && !['seramik', 'karo', 'porselen'].includes(t));
          if (tokens.length > 0) {
            p = await prisma.product.findFirst({
              where: {
                brandId: b.id,
                AND: tokens.map(t => ({ name: { contains: t, mode: 'insensitive' } }))
              },
              include: { brand: true }
            });
            if (p) return p;
          }
        }
      }
    }

    // 6. Direct name fallback
    const plainName = targetSlug.replace(/-/g, ' ');
    const nameMatch = await prisma.product.findFirst({
      where: {
        name: {
          contains: plainName,
          mode: 'insensitive'
        }
      },
      include: { brand: true }
    });
    if (nameMatch) return nameMatch;

    // 7. Token-based multi-keyword fallback across all products
    const words = targetSlug.replace(/-/g, ' ').split(/\s+/).filter(w => w.length > 2 && !['seramik', 'karo', 'porselen', 'modeli', 'fiyat'].includes(w));
    if (words.length > 0) {
      const tokenMatch = await prisma.product.findFirst({
        where: {
          AND: words.map(w => ({
            OR: [
              { name: { contains: w, mode: 'insensitive' } },
              { code: { contains: w, mode: 'insensitive' } }
            ]
          }))
        },
        include: { brand: true }
      });
      if (tokenMatch) return tokenMatch;
    }

    return null;
  } catch (err) {
    console.error('Error fetching product by slug:', err);
    return null;
  }
}

export async function generateMetadata({ params }) {
  try {
    const resolvedParams = await params;
    const slug = resolvedParams?.slug;
    if (!slug) return {};

    const product = await getProductBySlugOrId(slug);
    if (!product) {
      return {
        title: "Seramik Modelleri & Karo Fiyatları | SeramikBak",
        description: "Türkiye'nin yetkili seramik üreticileri ve bayilerinden en uygun karo modellerini inceleyin, numune talep edin."
      };
    }

    const brandName = product.brand?.name || 'Seramik';
    const dimensions = `${product.width}x${product.height} cm`;
    const title = `${product.name} ${dimensions} | ${brandName} | SeramikBak`;
    const description = `${brandName} ${product.name} (${dimensions}) seramik karosu. ${product.finish} yüzey, ${product.color} renk, ${product.style} dokusu. En yakın yetkili bayiden fiyat teklifi alın veya 15x15 kesit numune isteyin.`;
    
    const productSlug = product.slug || slugify(`${brandName} ${product.name}`);
    const canonicalUrl = `https://www.seramikbak.com/urun/${productSlug}`;
    const imageUrl = product.imageUrl || 'https://www.seramikbak.com/logo.png';

    return {
      title,
      description,
      keywords: [
        product.name,
        product.code,
        brandName,
        `${dimensions} seramik`,
        `${product.finish} seramik`,
        `${product.color} karo`,
        `${product.style} seramik`,
        'seramik numune',
        'seramik fiyat teklifi',
        'fayans modelleri'
      ],
      alternates: {
        canonical: canonicalUrl,
        languages: {
          'tr-TR': canonicalUrl,
          'en-US': `${canonicalUrl}?lang=en`,
          'de-DE': `${canonicalUrl}?lang=de`,
          'fr-FR': `${canonicalUrl}?lang=fr`,
          'es-ES': `${canonicalUrl}?lang=es`,
          'ar-SA': `${canonicalUrl}?lang=ar`,
          'ru-RU': `${canonicalUrl}?lang=ru`,
          'x-default': canonicalUrl
        }
      },
      openGraph: {
        title,
        description,
        url: canonicalUrl,
        type: 'website',
        locale: 'tr_TR',
        siteName: 'SeramikBak',
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: `${brandName} - ${product.name}`
          }
        ]
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [imageUrl]
      },
      robots: {
        index: true,
        follow: true
      }
    };
  } catch (error) {
    console.error('generateMetadata Product Error:', error);
    return {
      title: "Seramik Ürünü | SeramikBak"
    };
  }
}

export default async function ProductDetailPage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;

  if (!slug) {
    notFound();
  }

  const product = await getProductBySlugOrId(slug);

  if (!product) {
    notFound();
  }

  const brandName = product.brand?.name || 'Seramik';
  const productSlug = product.slug || slugify(`${brandName} ${product.name}`);
  const canonicalUrl = `https://www.seramikbak.com/urun/${productSlug}`;

  // Fetch related products from same brand
  let relatedProducts = [];
  let authorizedDealers = [];

  try {
    if (product.brandId) {
      relatedProducts = await prisma.product.findMany({
        where: {
          brandId: product.brandId,
          id: { not: product.id }
        },
        include: { brand: true },
        take: 4,
        orderBy: { createdAt: 'desc' }
      });

      authorizedDealers = await prisma.dealer.findMany({
        where: {
          brandId: product.brandId,
          status: 'APPROVED'
        },
        take: 6,
        orderBy: { city: 'asc' }
      });
    }
  } catch (e) {
    console.warn('Could not fetch related products or dealers:', e.message);
  }

  // Schema.org Product, Breadcrumbs, ImageObject, and FAQ
  const productSchema = generateProductSchema(product, brandName);

  const breadcrumbs = [
    { name: 'Anasayfa', url: '/' },
    { name: brandName, url: `/marka/${slugify(brandName)}` },
    { name: product.name, url: `/urun/${productSlug}` }
  ];
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);

  const imageAlt = generateImageAltText(product, brandName);
  const imageSchema = generateImageObjectSchema({
    url: product.imageUrl,
    title: `${brandName} ${product.name} ${product.width}x${product.height} cm Seramik Karo`,
    caption: imageAlt,
    author: brandName
  });

  return (
    <div className="sb-product-page min-h-screen">
      {productSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
      )}
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      )}
      {imageSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(imageSchema) }}
        />
      )}
      <ProductDetailClient
        product={product}
        relatedProducts={relatedProducts}
        authorizedDealers={authorizedDealers}
      />
    </div>
  );
}
