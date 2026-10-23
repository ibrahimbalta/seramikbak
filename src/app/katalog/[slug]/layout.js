import prisma from '@/lib/prisma';

export async function generateMetadata({ params }) {
  try {
    const { slug } = await params;
    if (!slug) {
      return { title: 'Dijital Mimari Lookbook | SeramikBak' };
    }

    const catalog = await prisma.brandCatalog.findUnique({
      where: { publicSlug: slug },
      include: {
        brand: {
          select: {
            name: true,
            logoUrl: true
          }
        }
      }
    });

    if (!catalog) {
      return {
        title: 'Katalog Bulunamadı | SeramikBak',
        description: 'Aradığınız mimari dijital lookbook yayında değil veya bulunamadı.'
      };
    }

    const brandName = catalog.brand?.name || 'Seramik Üreticisi';
    const pageTitle = `${catalog.title} | ${brandName} — SeramikBak Dijital Lookbook`;
    const description =
      catalog.description ||
      catalog.introText ||
      `${brandName} markasının yeni sezon mimari seramik, porselen ve yüzey koleksiyonları dijital ürün kataloğu.`;

    const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.seramikbak.com';
    const catalogUrl = `${appBaseUrl}/katalog/${catalog.publicSlug}`;
    const imageUrl =
      catalog.customLogoUrl ||
      catalog.brand?.logoUrl ||
      `${appBaseUrl}/og-image.png`;

    return {
      title: pageTitle,
      description: description.slice(0, 160),
      alternates: {
        canonical: catalogUrl
      },
      openGraph: {
        title: pageTitle,
        description: description.slice(0, 160),
        url: catalogUrl,
        siteName: 'SeramikBak',
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: `${brandName} - ${catalog.title}`
          }
        ],
        locale: 'tr_TR',
        type: 'article'
      },
      twitter: {
        card: 'summary_large_image',
        title: pageTitle,
        description: description.slice(0, 160),
        images: [imageUrl]
      }
    };
  } catch (error) {
    return {
      title: 'Dijital Lookbook & Katalog | SeramikBak',
      description: 'Seramik ve mimari yüzeyler dijital katalog inceleme platformu.'
    };
  }
}

export default async function CatalogSlugLayout({ children, params }) {
  const { slug } = await params;
  let structuredData = null;

  try {
    const catalog = await prisma.brandCatalog.findUnique({
      where: { publicSlug: slug },
      include: {
        brand: {
          select: {
            name: true,
            website: true
          }
        }
      }
    });

    if (catalog) {
      const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.seramikbak.com';
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'DigitalDocument',
        name: catalog.title,
        description: catalog.description || catalog.introText,
        url: `${appBaseUrl}/katalog/${slug}`,
        author: {
          '@type': 'Organization',
          name: catalog.brand?.name || 'Seramik Üreticisi',
          url: catalog.websiteUrl || catalog.brand?.website || appBaseUrl
        },
        publisher: {
          '@type': 'Organization',
          name: 'SeramikBak',
          url: appBaseUrl
        },
        datePublished: catalog.createdAt?.toISOString(),
        dateModified: catalog.updatedAt?.toISOString()
      };
    }
  } catch (err) {
    // Ignore structured data fetch errors gracefully
  }

  return (
    <>
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
      {children}
    </>
  );
}
