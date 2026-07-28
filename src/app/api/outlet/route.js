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

    const where = {};

    if (dealerId) {
      where.dealerId = dealerId;
    }

    if (category && category !== 'ALL') {
      where.category = category;
    }

    if (city && city !== 'ALL') {
      where.dealer = {
        city: {
          contains: city
        }
      };
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { notes: { contains: search } },
        { dimensions: { contains: search } },
        { colorFinish: { contains: search } },
        { badgeTag: { contains: search } }
      ];
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
