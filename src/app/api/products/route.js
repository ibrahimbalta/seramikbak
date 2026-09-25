import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const brandId = searchParams.get('brandId') || '';
    const style = searchParams.get('style') || '';
    const finish = searchParams.get('finish') || '';
    const rawLimit = parseInt(searchParams.get('limit') || '24', 10);
    const limit = Math.max(1, Math.min(isNaN(rawLimit) ? 24 : rawLimit, 150)); // Clamp between 1 and 150
    const rawPage = parseInt(searchParams.get('page') || '1', 10);
    const page = Math.max(1, isNaN(rawPage) ? 1 : rawPage);
    const skip = (page - 1) * limit;

    const conditions = [];

    if (search) {
      conditions.push({
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } },
          { style: { contains: search, mode: 'insensitive' } }
        ]
      });
    }

    if (brandId && brandId !== 'all') {
      conditions.push({
        OR: [
          { brandId: brandId },
          { brand: { id: brandId } },
          { brand: { name: { equals: brandId, mode: 'insensitive' } } },
          { brand: { name: { contains: brandId, mode: 'insensitive' } } },
          { brand: { slug: { equals: brandId, mode: 'insensitive' } } }
        ]
      });
    }

    if (style && style !== 'all') {
      conditions.push({ style: { contains: style, mode: 'insensitive' } });
    }

    if (finish && finish !== 'all') {
      conditions.push({ finish: { contains: finish, mode: 'insensitive' } });
    }

    const where = conditions.length > 0 ? { AND: conditions } : {};

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          brand: {
            select: { id: true, name: true, logoUrl: true }
          }
        }
      }),
      prisma.product.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      products,
      total,
      page,
      totalPages,
      hasMore: page < totalPages
    });
  } catch (error) {
    console.error('[Public Products API Error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
