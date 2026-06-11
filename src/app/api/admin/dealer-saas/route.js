import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const dealers = await prisma.dealer.findMany({
      include: {
        saas: true,
        brand: { select: { name: true } }
      },
      orderBy: { name: 'asc' }
    });
    
    // Format the response so that every dealer has a saas object
    const dealerSaaSMaps = dealers.map(dealer => {
      const activeSaaS = dealer.saas?.[0] || null;
      return {
        id: dealer.id,
        name: dealer.name,
        brandName: dealer.brand?.name || '',
        city: dealer.city,
        district: dealer.district,
        saas: activeSaaS
      };
    });

    return NextResponse.json(dealerSaaSMaps);
  } catch (error) {
    console.error('Admin Dealer SaaS GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch dealer SaaS configs' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { dealerId, plan, status, expiresAt } = body;

    if (!dealerId || !plan || !status || !expiresAt) {
      return NextResponse.json({ error: 'Missing dealerId, plan, status, or expiresAt' }, { status: 400 });
    }

    // Check if a DealerSaaSConfig already exists for this dealer
    const existingSaaS = await prisma.dealerSaaSConfig.findFirst({
      where: { dealerId }
    });

    let config;
    if (existingSaaS) {
      config = await prisma.dealerSaaSConfig.update({
        where: { id: existingSaaS.id },
        data: {
          plan,
          status,
          expiresAt: new Date(expiresAt)
        }
      });
    } else {
      config = await prisma.dealerSaaSConfig.create({
        data: {
          dealerId,
          plan,
          status,
          expiresAt: new Date(expiresAt)
        }
      });
    }

    return NextResponse.json({ success: true, saas: config });
  } catch (error) {
    console.error('Admin Dealer SaaS POST Error:', error);
    return NextResponse.json({ error: 'Failed to configure dealer SaaS plan', details: error.message }, { status: 500 });
  }
}
