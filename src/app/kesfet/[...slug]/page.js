import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { resolvePseoMatrix } from '@/lib/seo/pseoMatrixParser';
import { generateBreadcrumbSchema, generateFaqSchema } from '@/lib/seo/schemaGenerator';
import { getInternalLinkCluster } from '@/lib/seo/internalLinkingEngine';
import { COMPARISON_TABLES, EXPERT_QUOTES, TECHNICAL_GUIDES } from '@/lib/seo/guideContentEngine';
import PSEOClient from './PSEOClient';

export async function generateMetadata({ params }) {
  try {
    const resolvedParams = await params;
    const slugParts = resolvedParams?.slug || [];
    const matrix = resolvePseoMatrix(slugParts);

    const canonicalUrl = `https://www.seramikbak.com/kesfet/${matrix.fullSlug}`;

    return {
      title: matrix.metaTitle,
      description: matrix.metaDescription,
      keywords: [
        matrix.mainTitle,
        matrix.brand?.name || 'Seramik',
        matrix.size?.label || '60x120',
        matrix.color?.name || 'Porselen',
        matrix.style?.name || 'Mermer',
        matrix.area?.label || 'Banyo',
        'seramik fiyatları',
        'porselen karo modelleri',
        'seramik bayileri'
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
        title: matrix.metaTitle,
        description: matrix.metaDescription,
        url: canonicalUrl,
        type: 'website',
        locale: 'tr_TR',
        siteName: 'SeramikBak Global',
        images: [
          {
            url: 'https://www.seramikbak.com/og-image.png',
            width: 1200,
            height: 630,
            alt: matrix.mainTitle
          }
        ]
      },
      twitter: {
        card: 'summary_large_image',
        title: matrix.metaTitle,
        description: matrix.metaDescription
      },
      robots: {
        index: true,
        follow: true
      }
    };
  } catch (err) {
    return {
      title: 'Seramik ve Porselen Karo Koleksiyonları | SeramikBak'
    };
  }
}

export default async function PseoPage({ params }) {
  const resolvedParams = await params;
  const slugParts = resolvedParams?.slug || [];
  const matrix = resolvePseoMatrix(slugParts);

  if (!matrix.fullSlug) {
    notFound();
  }

  // Construct Prisma where filters
  const andConditions = [];

  if (matrix.brand) {
    andConditions.push({
      brand: {
        name: {
          contains: matrix.brand.query,
          mode: 'insensitive'
        }
      }
    });
  }

  if (matrix.color) {
    andConditions.push({
      color: {
        contains: matrix.color.name,
        mode: 'insensitive'
      }
    });
  }

  if (matrix.finish) {
    andConditions.push({
      finish: {
        contains: matrix.finish.name,
        mode: 'insensitive'
      }
    });
  }

  if (matrix.style) {
    andConditions.push({
      style: {
        contains: matrix.style.name,
        mode: 'insensitive'
      }
    });
  }

  if (matrix.area) {
    andConditions.push({
      area: {
        contains: matrix.area.name,
        mode: 'insensitive'
      }
    });
  }

  if (matrix.size) {
    andConditions.push({
      OR: [
        { width: matrix.size.width, height: matrix.size.height },
        { width: matrix.size.height, height: matrix.size.width }
      ]
    });
  }

  const where = andConditions.length > 0 ? { AND: andConditions } : {};

  let products = [];
  try {
    products = await prisma.product.findMany({
      where,
      include: { brand: true },
      take: 48,
      orderBy: [
        { isPremium: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    // Fallback if combination is very specific and returned 0
    if (products.length === 0) {
      products = await prisma.product.findMany({
        take: 24,
        include: { brand: true },
        orderBy: { createdAt: 'desc' }
      });
    }
  } catch (err) {
    console.error('PSEO DB fetch error:', err);
  }

  // If city is specified, fetch matching authorized dealers
  let dealers = [];
  if (matrix.city) {
    try {
      dealers = await prisma.dealer.findMany({
        where: {
          city: { equals: matrix.city, mode: 'insensitive' },
          status: 'APPROVED'
        },
        include: { brand: true },
        take: 12
      });
    } catch (e) {
      console.warn('Dealers fetch error:', e.message);
    }
  }

  const canonicalUrl = `https://www.seramikbak.com/kesfet/${matrix.fullSlug}`;

  // Schemas
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: matrix.mainTitle,
    description: matrix.metaDescription,
    url: canonicalUrl
  };

  const breadcrumbs = [
    { name: 'Anasayfa', url: '/' },
    { name: 'Seramik Keşfet', url: '/kategori/banyo-seramikleri' },
    { name: matrix.mainTitle, url: `/kesfet/${matrix.fullSlug}` }
  ];
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);

  const dynamicFaqs = [
    {
      q: `${matrix.mainTitle} nerelerde kullanılır?`,
      a: `${matrix.mainTitle} porselen yapısı ve yüksek dayanıklılığı sayesinde banyo, mutfak, salon zeminleri, antre ve ticari alanlarda uzun yıllar güvenle kullanılır.`
    },
    {
      q: `${matrix.mainTitle} m² fiyatları ne kadardır?` ,
      a: 'Fiyatlar ebat, rektifiye kenar özelliği ve yüzey dokusuna göre metrekare başına 350 TL ile 1.200 TL arasında değişmektedir. SeramikBak üzerinden en yakın yetkili bayiden anında teklif alabilirsiniz.'
    },
    {
      q: 'Numune isteyebilir miyim?',
      a: 'Evet, SeramikBak üzerinden ilgilendiğiniz tüm modeller için 15x15 cm kesit numune talebinde bulunabilir, rengi ve dokuyu yerinde inceleyebilirsiniz.'
    }
  ];
  const faqSchema = generateFaqSchema(dynamicFaqs);

  const internalLinks = getInternalLinkCluster({
    currentBrand: matrix.brand?.name,
    currentStyle: matrix.style?.name,
    currentArea: matrix.area?.name,
    currentDimension: matrix.size?.label,
    currentCity: matrix.city
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      )}
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <PSEOClient
        matrix={matrix}
        products={products}
        dealers={dealers}
        internalLinks={internalLinks}
        comparisonTables={COMPARISON_TABLES}
        expertQuotes={EXPERT_QUOTES}
        technicalGuides={TECHNICAL_GUIDES}
        faqs={dynamicFaqs}
      />
    </>
  );
}
