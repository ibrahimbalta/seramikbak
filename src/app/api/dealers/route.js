import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const brandId = searchParams.get('brandId');

    const whereClause = {
      status: {
        in: ['APPROVED', 'approved']
      }
    };

    if (city && city.trim() !== '') {
      whereClause.city = {
        equals: city.trim(),
        mode: 'insensitive'
      };
    }

    if (brandId && brandId.trim() !== '' && brandId !== 'all') {
      whereClause.brandId = brandId;
    }

    const dealers = await prisma.dealer.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        address: true,
        city: true,
        district: true,
        lat: true,
        lng: true,
        status: true,
        logoUrl: true,
        bannerUrl: true,
        showroomImages: true,
        virtualTourUrl: true,
        specialConcepts: true,
        brandId: true,
        brand: {
          select: {
            id: true,
            name: true,
            logoUrl: true
          }
        },
        createdAt: true
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(dealers);
  } catch (error) {
    console.error('Public Dealers API GET Error:', error);
    return NextResponse.json([], { status: 200 });
  }
}
