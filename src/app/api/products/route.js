import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const brandId = searchParams.get('brandId') || '';
    const style = searchParams.get('style') || '';
    const rawLimit = parseInt(searchParams.get('limit') || '24', 10);
    const limit = Math.max(1, Math.min(isNaN(rawLimit) ? 24 : rawLimit, 100)); // Clamp between 1 and 100
    const rawPage = parseInt(searchParams.get('page') || '1', 10);
    const page = Math.max(1, isNaN(rawPage) ? 1 : rawPage);
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
      where.OR = [
        { brandId: brandId },
        { brand: { id: brandId } },
        { brand: { name: { equals: brandId, mode: 'insensitive' } } },
        { brand: { name: { contains: brandId, mode: 'insensitive' } } }
      ];
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
