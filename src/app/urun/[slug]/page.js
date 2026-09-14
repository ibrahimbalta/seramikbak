import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { slugify } from '@/lib/slugify';
import ProductDetailClient from './ProductDetailClient';

// Helper to find a product by slug, code or ID (O(1) indexed database query)
async function getProductBySlugOrId(slug) {
  if (!slug) return null;

  try {
    const targetSlug = slug.toLowerCase().trim();

    // 1. Direct indexed slug match - fastest O(1)
    const bySlug = await prisma.product.findUnique({
      where: { slug: targetSlug },
      include: { brand: true }
    });
    if (bySlug) return bySlug;

    // 2. Direct UUID match
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
    if (isUuid) {
      const p = await prisma.product.findUnique({
        where: { id: slug },
        include: { brand: true }
      });
      if (p) return p;
    }

    // 3. Direct exact code match
    const byCode = await prisma.product.findFirst({
      where: {
        code: {
          equals: slug,
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

    // 5. Targeted name fallback (only top 5 candidates instead of entire table)
    const nameMatch = await prisma.product.findFirst({
      where: {
        name: {
          contains: targetSlug.replace(/-/g, ' '),
          mode: 'insensitive'
        }
      },
      include: { brand: true }
    });
    return nameMatch || null;
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
    
    const productSlug = slugify(`${brandName} ${product.name}`);
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
  const productSlug = slugify(`${brandName} ${product.name}`);
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

  // Schema.org Product & BreadcrumbList JSON-LD Microdata
  const productSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": `${brandName} ${product.name}`,
    "image": [product.imageUrl, product.textureUrl].filter(Boolean),
    "description": `${brandName} ${product.name} ${product.width}x${product.height} cm seramik karosu. ${product.finish} yüzey, ${product.style} dokusu.`,
    "sku": product.code,
    "brand": {
      "@type": "Brand",
      "name": brandName
    },
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "TRY",
      "lowPrice": product.trendyolPrice || product.hepsiburadaPrice || 350,
      "offerCount": "1",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "SeramikBak Yetkili Bayi Ağı"
      }
    }
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Anasayfa",
        "item": "https://www.seramikbak.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": brandName,
        "item": `https://www.seramikbak.com/marka/${slugify(brandName)}`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": product.name,
        "item": canonicalUrl
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ProductDetailClient
        product={product}
        relatedProducts={relatedProducts}
        authorizedDealers={authorizedDealers}
      />
    </>
  );
}
