import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const brandId = searchParams.get('brandId') || '';
    const style = searchParams.get('style') || '';
    const finish = searchParams.get('finish') || '';
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const skip = (page - 1) * limit;

    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { style: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (brandId && brandId !== 'all') {
      where.brandId = brandId;
    }

    if (style && style !== 'all') {
      where.style = { contains: style, mode: 'insensitive' };
    }

    if (finish && finish !== 'all') {
      where.finish = { contains: finish, mode: 'insensitive' };
    }

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

    return NextResponse.json({
      success: true,
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('[Public Products API Error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
