import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const category = searchParams.get('category'); // PROJE_FAZLASI, SERI_SONU, IKINCI_KALITE, OUTLET
    const search = searchParams.get('search');
    const dealerId = searchParams.get('dealerId');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const includeInactive = searchParams.get('includeInactive') === 'true';

    const where = {};

    if (!includeInactive) {
      where.status = 'ACTIVE';
    }

    if (dealerId) {
      where.dealerId = dealerId;
    }

    if (category && category !== 'ALL') {
      where.category = category;
    }

    if (city && city !== 'ALL') {
      where.OR = [
        { dealer: { city: { contains: city } } },
        { brandId: { not: null } }
      ];
    }

    if (search) {
      const searchCondition = [
        { title: { contains: search } },
        { notes: { contains: search } },
        { dimensions: { contains: search } },
        { colorFinish: { contains: search } },
        { badgeTag: { contains: search } },
        { brand: { name: { contains: search } } }
      ];

      if (where.OR) {
        where.AND = [
          { OR: where.OR },
          { OR: searchCondition }
        ];
        delete where.OR;
      } else {
        where.OR = searchCondition;
      }
    }

    const outletItems = await prisma.outletListing.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        dealer: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            city: true,
            district: true,
            address: true,
            logoUrl: true,
            brand: {
              select: {
                name: true,
                logoUrl: true
              }
            }
          }
        },
        brand: {
          select: {
            id: true,
            name: true,
            logoUrl: true
          }
        },
        product: {
          select: {
            id: true,
            name: true,
            code: true,
            imageUrl: true,
            textureUrl: true,
            style: true,
            finish: true
          }
        }
      }
    });

    return NextResponse.json({ success: true, count: outletItems.length, data: outletItems });
  } catch (error) {
    console.error('GET /api/outlet Error:', error);
    return NextResponse.json({ success: false, error: 'Outlet ürünleri yüklenirken hata oluştu.' }, { status: 500 });
  }
}
