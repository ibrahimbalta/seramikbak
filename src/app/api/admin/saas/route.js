import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const brands = await prisma.brand.findMany({
      include: {
        saas: true
      },
      orderBy: { name: 'asc' }
    });
    
    // Format the response so that every brand has a saas object
    const brandSaaSMaps = brands.map(brand => {
      const activeSaaS = brand.saas?.[0] || null;
      return {
        id: brand.id,
        name: brand.name,
        logoUrl: brand.logoUrl,
        saas: activeSaaS
      };
    });

    return NextResponse.json(brandSaaSMaps);
  } catch (error) {
    console.error('Admin SaaS GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch SaaS configs' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { brandId, plan, status, expiresAt } = body;

    if (!brandId || !plan || !status || !expiresAt) {
      return NextResponse.json({ error: 'Missing brandId, plan, status, or expiresAt' }, { status: 400 });
    }

    // Check if a SaaSConfig already exists for this brand
    const existingSaaS = await prisma.saaSConfig.findFirst({
      where: { brandId }
    });

    let config;
    if (existingSaaS) {
      config = await prisma.saaSConfig.update({
        where: { id: existingSaaS.id },
        data: {
          plan,
          status,
          expiresAt: new Date(expiresAt)
        }
      });
    } else {
      config = await prisma.saaSConfig.create({
        data: {
          brandId,
          plan,
          status,
          expiresAt: new Date(expiresAt)
        }
      });
    }

    return NextResponse.json({ success: true, saas: config });
  } catch (error) {
    console.error('Admin SaaS POST Error:', error);
    return NextResponse.json({ error: 'Failed to configure SaaS plan', details: error.message }, { status: 500 });
  }
}
