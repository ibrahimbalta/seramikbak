import prisma from '@/lib/prisma';

export async function generateMetadata({ params }) {
  try {
    const { slug } = await params;
    if (!slug) {
      return { title: 'Dijital Mimari Katalog | SeramikBak' };
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
        description: 'Aradığınız mimari dijital katalog yayında değil veya bulunamadı.'
      };
    }

    const brandName = catalog.brand?.name || 'Seramik Üreticisi';
    const pageTitle = `${catalog.title} | ${brandName} — SeramikBak Dijital Katalog`;
    const description =
      catalog.description ||
      `${brandName} markasının yeni sezon mimari seramik, porselen ve yüzey koleksiyonları dijital ürün kataloğu.`;

    const imageUrl =
      catalog.customLogoUrl ||
      catalog.brand?.logoUrl ||
      '/og-image.jpg';

    return {
      title: pageTitle,
      description,
      openGraph: {
        title: pageTitle,
        description,
        url: `https://seramikbak.com/katalog/${catalog.publicSlug}`,
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
        type: 'website'
      },
      twitter: {
        card: 'summary_large_image',
        title: pageTitle,
        description,
        images: [imageUrl]
      }
    };
  } catch (error) {
    return {
      title: 'Dijital Katalog | SeramikBak',
      description: 'Seramik ve mimari yüzeyler dijital katalog inceleme platformu.'
    };
  }
}

export default function CatalogSlugLayout({ children }) {
  return children;
}
