import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { slugify } from '@/lib/slugify';
import DealerProfileClient from './DealerProfileClient';

export async function generateMetadata({ params }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams?.id;

    if (!id) return {};

    let dealer = null;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (isUuid) {
      dealer = await prisma.dealer.findUnique({
        where: { id },
        include: { brand: true }
      });
    }

    if (!dealer) {
      const allDealers = await prisma.dealer.findMany({
        include: { brand: true }
      });
      dealer = allDealers.find(d => slugify(d.name) === id);
    }

    if (!dealer) {
      return {
        title: "Yetkili Seramik Bayisi | SeramikBak",
        description: "Türkiye'nin yetkili seramik bayileri ve showroomları. En yakın şubeyi bulun, stok sorgulayın."
      };
    }

    const brandName = dealer.brand?.name || 'Seramik';
    const title = `${dealer.name} | ${brandName} Yetkili Bayi & Showroom`;
    const description = `${dealer.city || ''} ${dealer.district || ''} bölgesindeki yetkili ${brandName} bayisi ${dealer.name}. Güncel stok durumunu inceleyin, yol tarifi alın ve fiyat teklifi isteyin.`;

    return {
      title,
      description,
      keywords: `${dealer.name}, ${brandName} bayi, ${dealer.city || ''} seramik, ${dealer.district || ''} fayans, seramik showroom, stok sorgulama`,
      openGraph: {
        title,
        description,
        type: 'profile',
        locale: 'tr_TR'
      }
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
    // Try to find by UUID first
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (isUuid) {
      dealer = await prisma.dealer.findUnique({
        where: { id },
        include: {
          brand: true,
          inventories: {
            include: {
              product: true
            }
          }
        }
      });
    }

    // If not found (or not UUID), try to match by name slug
    if (!dealer) {
      const allDealers = await prisma.dealer.findMany({
        include: {
          brand: true,
          inventories: {
            include: {
              product: true
            }
          }
        }
      });
      dealer = allDealers.find(d => slugify(d.name) === id);
    }

    if (dealer && dealer.brandId) {
      products = await prisma.product.findMany({
        where: { brandId: dealer.brandId },
        take: 100
      });
    }
  } catch (error) {
    console.error('Dealer Page DB Error:', error);
  }

  if (!dealer) {
    notFound();
  }

  return <DealerProfileClient dealer={dealer} products={products} />;
}
