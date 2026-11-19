import { cache } from 'react';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { slugify } from '@/lib/slugify';
import { generateLocalBusinessSchema } from '@/lib/seo/schemaGenerator';
import DealerProfileClient from './DealerProfileClient';

export const revalidate = 3600;

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const resolveDealerId = cache(async (id) => {
  if (!id) return null;
  if (UUID_REGEX.test(id)) return id;

  // Fetch only lightweight id + name pairs instead of full nested dealer relations
  const dealerSummaries = await prisma.dealer.findMany({
    select: { id: true, name: true }
  });
  const match = dealerSummaries.find(d => slugify(d.name) === id);
  return match ? match.id : null;
});

const getDealerWithRelations = cache(async (id) => {
  const resolvedId = await resolveDealerId(id);
  if (!resolvedId) return null;

  return prisma.dealer.findUnique({
    where: { id: resolvedId },
    include: {
      brand: true,
      inventories: {
        include: {
          product: true
        }
      },
      outletListings: {
        include: {
          product: true
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  });
});

export async function generateMetadata({ params }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams?.id;

    if (!id) return {};

    const dealer = await getDealerWithRelations(id);

    if (!dealer) {
      return {
        title: "Yetkili Seramik Bayisi | SeramikBak",
        description: "Türkiye'nin yetkili seramik bayileri ve showroomları. En yakın şubeyi bulun, stok sorgulayın."
      };
    }

    const brandName = dealer.brand?.name || 'Seramik';
    const title = `${dealer.name} | ${brandName} Yetkili Bayi & Showroom`;
    const description = `${dealer.city || ''} ${dealer.district || ''} bölgesindeki yetkili ${brandName} bayisi ${dealer.name}. Güncel stok durumunu inceleyin, yol tarifi alın ve fiyat teklifi isteyin.`;

    const dealerSlug = slugify(dealer.name);
    const canonicalUrl = `https://www.seramikbak.com/bayi/${dealerSlug}`;

    return {
      title,
      description,
      keywords: [
        dealer.name, `${brandName} bayi`, `${dealer.city || ''} seramik`,
        `${dealer.district || ''} fayans`, 'seramik showroom', 'stok sorgulama',
        `${dealer.city || ''} seramik bayi`, `${brandName} yetkili bayi`,
        'seramik fiyat teklifi', 'seramik mağaza'
      ],
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title,
        description,
        url: canonicalUrl,
        type: 'profile',
        locale: 'tr_TR',
        siteName: 'SeramikBak',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
      },
      robots: {
        index: true,
        follow: true,
      },
    };
  } catch (error) {
    console.error('generateMetadata Dealer Error:', error);
    return {
      title: "Yetkili Seramik Bayisi | SeramikBak"
    };
  }
}

export default async function Page({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams?.id;

  if (!id) {
    notFound();
  }

  let dealer = null;
  let products = [];

  try {
    dealer = await getDealerWithRelations(id);

    if (dealer) {
      let rawFeatured = [];
      try {
        rawFeatured = dealer.featuredProducts ? JSON.parse(dealer.featuredProducts) : [];
      } catch (e) {
        rawFeatured = [];
      }
      const featuredIds = Array.isArray(rawFeatured)
        ? rawFeatured.map(item => (typeof item === 'object' && item !== null ? item.id : item)).filter(Boolean)
        : [];

      if (dealer.brandId) {
        products = await prisma.product.findMany({
          where: { brandId: dealer.brandId },
          take: 250
        });
      } else {
        products = await prisma.product.findMany({
          take: 100
        });
      }

      // If dealer selected featured products not in the first batch, fetch them explicitly
      if (featuredIds.length > 0) {
        const loadedIds = new Set(products.map(p => p.id));
        const missingIds = featuredIds.filter(fId => !loadedIds.has(fId));
        if (missingIds.length > 0) {
          const extraFeatured = await prisma.product.findMany({
            where: { id: { in: missingIds } }
          });
          products = [...extraFeatured, ...products];
        }
      }
    }
  } catch (error) {
    console.error('Dealer Page DB Error:', error);
  }

  if (!dealer) {
    notFound();
  }

  const localBusinessSchema = generateLocalBusinessSchema(dealer);

  return (
    <>
      {localBusinessSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema).replace(/</g, '\\u003c') }}
        />
      )}
      <DealerProfileClient dealer={dealer} products={products} />
    </>
  );
}
