import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const brands = await prisma.brand.findMany({
      include: {
        saas: {
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { updatedAt: 'desc' }
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

    // Sort brands so that PENDING_APPROVAL applications appear FIRST
    brandSaaSMaps.sort((a, b) => {
      const statusA = a.saas?.status || a.saas?.pendingStatus || '';
      const statusB = b.saas?.status || b.saas?.pendingStatus || '';
      if (statusA === 'PENDING_APPROVAL' && statusB !== 'PENDING_APPROVAL') return -1;
      if (statusA !== 'PENDING_APPROVAL' && statusB === 'PENDING_APPROVAL') return 1;
      return a.name.localeCompare(b.name, 'tr');
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

        config = await prisma.saaSConfig.update({
          where: { id: existingSaaS.id },
          data: {
            plan: existingSaaS.pendingPlan || existingSaaS.plan || 'ENTERPRISE_GLOBAL_EXPORTS',
            status: 'ACTIVE',
            expiresAt: newExpiresAt,
            pendingPlan: null,
            pendingStatus: null
          }
        });
      } else if (action === 'reject') {
        config = await prisma.saaSConfig.update({
          where: { id: existingSaaS.id },
          data: {
            status: 'REJECTED',
            pendingStatus: 'REJECTED'
          }
        });
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
