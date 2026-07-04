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
    const { brandId, plan, status, expiresAt, action } = body;

    if (!brandId) {
      return NextResponse.json({ error: 'Missing brandId' }, { status: 400 });
    }

    // Check if a SaaSConfig already exists for this brand
    const existingSaaS = await prisma.saaSConfig.findFirst({
      where: { brandId }
    });

    let config;

    if (action) {
      if (!existingSaaS) {
        return NextResponse.json({ error: 'No SaaS configuration found to perform action on' }, { status: 404 });
      }

      if (action === 'approve') {
        const newExpiresAt = new Date();
        newExpiresAt.setFullYear(newExpiresAt.getFullYear() + 1); // Extend for 1 year from approval

        if (existingSaaS.status === 'PENDING_APPROVAL') {
          config = await prisma.saaSConfig.update({
            where: { id: existingSaaS.id },
            data: {
              status: 'ACTIVE',
              expiresAt: newExpiresAt,
              pendingPlan: null,
              pendingStatus: null
            }
          });
        } else if (existingSaaS.pendingStatus === 'PENDING_APPROVAL') {
          config = await prisma.saaSConfig.update({
            where: { id: existingSaaS.id },
            data: {
              plan: existingSaaS.pendingPlan,
              status: 'ACTIVE',
              expiresAt: newExpiresAt,
              pendingPlan: null,
              pendingStatus: null
            }
          });
        } else {
          return NextResponse.json({ error: 'No pending subscription request found' }, { status: 400 });
        }
      } else if (action === 'reject') {
        if (existingSaaS.status === 'PENDING_APPROVAL') {
          config = await prisma.saaSConfig.update({
            where: { id: existingSaaS.id },
            data: {
              status: 'REJECTED'
            }
          });
        } else if (existingSaaS.pendingStatus === 'PENDING_APPROVAL') {
          config = await prisma.saaSConfig.update({
            where: { id: existingSaaS.id },
            data: {
              pendingStatus: 'REJECTED'
            }
          });
        } else {
          return NextResponse.json({ error: 'No pending subscription request found' }, { status: 400 });
        }
      } else {
        return NextResponse.json({ error: 'Invalid action parameter' }, { status: 400 });
      }
    } else {
      // Normal admin setup/override flow
      if (!plan || !status || !expiresAt) {
        return NextResponse.json({ error: 'Missing plan, status, or expiresAt' }, { status: 400 });
      }

      if (existingSaaS) {
        config = await prisma.saaSConfig.update({
          where: { id: existingSaaS.id },
          data: {
            plan,
            status,
            expiresAt: new Date(expiresAt),
            pendingPlan: null,
            pendingStatus: null
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
    }

    return NextResponse.json({ success: true, saas: config });
  } catch (error) {
    console.error('Admin SaaS POST Error:', error);
    return NextResponse.json({ error: 'Failed to configure SaaS plan', details: error.message }, { status: 500 });
  }
}
