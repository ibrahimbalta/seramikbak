import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import DealerProfileClient from './DealerProfileClient';

export default async function Page({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  if (!id) {
    notFound();
  }

  // Fetch dealer details
  const dealer = await prisma.dealer.findUnique({
    where: { id },
    include: {
      brand: true
    }
  });

  if (!dealer) {
    notFound();
  }

  // Fetch products of this brand to let user select in direct quote form
  const products = await prisma.product.findMany({
    where: { brandId: dealer.brandId },
    take: 30,
    select: {
      id: true,
      name: true,
      code: true
    }
  });

  return <DealerProfileClient dealer={dealer} products={products} />;
}
