import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const customOrder = [
  "Çanakkale Seramik",
  "NG Kütahya Seramik",
  "VitrA",
  "Bien Seramik",
  "Yurtbay Seramik",
  "Seramiksan",
  "Ege Seramik",
  "Qua Granite",
  "Duratiles",
  "DuraTiles"
];

export async function GET() {
  try {
    const brands = await prisma.brand.findMany({
      select: {
        id: true,
        name: true,
        logoUrl: true
      }
    });

    brands.sort((a, b) => {
      const indexA = customOrder.findIndex(name => name.toLowerCase() === a.name.toLowerCase());
      const indexB = customOrder.findIndex(name => name.toLowerCase() === b.name.toLowerCase());
      
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      if (indexA !== -1) {
        return -1;
      }
      if (indexB !== -1) {
        return 1;
      }
      return a.name.localeCompare(b.name, 'tr');
    });

    return NextResponse.json(brands);
  } catch (error) {
    console.error('Brands API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch brands' }, { status: 500 });
  }
}
