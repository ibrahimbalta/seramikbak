import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { slugify } from '@/lib/slugify';
import DealerProfileClient from './DealerProfileClient';

export default async function Page({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  if (!id) {
    notFound();
  }

  let dealer = null;

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

  if (!dealer) {
    notFound();
  }

  // Fetch products of this brand to let user select in direct quote form
  const products = await prisma.product.findMany({
    where: { brandId: dealer.brandId },
    take: 100
  });

  return <DealerProfileClient dealer={dealer} products={products} />;
}
