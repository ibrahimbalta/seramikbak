import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { slugify } from '@/lib/slugify';
import BrandShowcaseClient from './BrandShowcaseClient';

// Helper to find a brand by slug, username, or ID (O(1) indexed database query)
async function getBrandBySlugOrId(slug) {
  if (!slug) return null;

  try {
    const targetSlug = slug.toLowerCase().trim();

    // 1. Direct indexed slug match - fastest O(1)
    const bySlug = await prisma.brand.findUnique({
      where: { slug: targetSlug }
    });
    if (bySlug) return bySlug;

    // 2. Direct UUID match
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
    if (isUuid) {
      const b = await prisma.brand.findUnique({
        where: { id: slug }
      });
      if (b) return b;
    }

    // 3. Match by username
    const byUsername = await prisma.brand.findFirst({
      where: {
        username: {
          equals: targetSlug,
          mode: 'insensitive'
        }
      }
    });
    if (byUsername) return byUsername;

    // 4. Match by normalized name
    const byName = await prisma.brand.findFirst({
      where: {
        name: {
          equals: targetSlug.replace(/-/g, ' '),
          mode: 'insensitive'
        }
      }
    });
    return byName || null;
  } catch (err) {
    console.error('Error fetching brand by slug:', err);
    return null;
  }
}

export async function generateMetadata({ params }) {
  try {
    const resolvedParams = await params;
    const slug = resolvedParams?.slug;
    if (!slug) return {};

    const brand = await getBrandBySlugOrId(slug);
    if (!brand) {
      return {
        title: "Yetkili Seramik Markaları | SeramikBak",
        description: "Türkiye'nin lider seramik ve porselen karo üreticileri, güncel kataloglar ve yetkili bayileri."
      };
    }

    const title = `${brand.name} Seramik Modelleri, Katalog & Yetkili Bayileri | SeramikBak`;
    const description = `${brand.name} seramik ve porselen karo koleksiyonlarını inceleyin. En yakın yetkili showroom ve bayileri bulun, fabrika numunesi ve özel fiyat teklifi alın.`;
    
    const brandSlug = slugify(brand.name);
    const canonicalUrl = `https://www.seramikbak.com/marka/${brandSlug}`;
    const logoUrl = brand.logoUrl || 'https://www.seramikbak.com/logo.png';

    return {
      title,
      description,
      keywords: [
        brand.name,
        `${brand.name} seramik`,
        `${brand.name} modelleri`,
        `${brand.name} bayi`,
        `${brand.name} katalog`,
        `${brand.name} fiyat listesi`,
        `${brand.name} karo`,
        'seramik showroom',
        'fayans çeşitleri'
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
            url: logoUrl,
            width: 800,
            height: 600,
            alt: `${brand.name} Logo`
          }
        ]
      },
      twitter: {
        card: 'summary',
        title,
        description,
        images: [logoUrl]
      },
      robots: {
        index: true,
        follow: true
      }
    };
  } catch (error) {
    console.error('generateMetadata Brand Error:', error);
    return {
      title: "Seramik Markası | SeramikBak"
    };
  }
}

export default async function BrandShowcasePage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;

  if (!slug) {
    notFound();
  }

  const brand = await getBrandBySlugOrId(slug);

  if (!brand) {
    notFound();
  }

  const brandSlug = slugify(brand.name);
  const canonicalUrl = `https://www.seramikbak.com/marka/${brandSlug}`;

  let products = [];
  let dealers = [];

  try {
    products = await prisma.product.findMany({
      where: { brandId: brand.id },
      orderBy: { createdAt: 'desc' }
    });

    dealers = await prisma.dealer.findMany({
      where: { brandId: brand.id, status: 'APPROVED' },
      orderBy: { city: 'asc' }
    });
  } catch (err) {
    console.error('Error fetching brand products/dealers:', err);
  }

  // Schema.org Brand & BreadcrumbList JSON-LD
  const brandSchema = {
    "@context": "https://schema.org",
    "@type": "Brand",
    "name": brand.name,
    "logo": brand.logoUrl || "https://www.seramikbak.com/logo.png",
    "url": canonicalUrl,
    "description": `${brand.name} seramik ve porselen karo koleksiyonları, yetkili bayileri ve showroom ağı.`
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
        "name": "Markalar",
        "item": "https://www.seramikbak.com/bayiler"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": brand.name,
        "item": canonicalUrl
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(brandSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <BrandShowcaseClient
        brand={brand}
        products={products}
        dealers={dealers}
      />
    </>
  );
}
