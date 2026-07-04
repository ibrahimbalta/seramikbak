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
    const { dealerId, plan, status, expiresAt, action } = body;

    if (!dealerId) {
      return NextResponse.json({ error: 'Missing dealerId' }, { status: 400 });
    }

    // Check if a DealerSaaSConfig already exists for this dealer
    const existingSaaS = await prisma.dealerSaaSConfig.findFirst({
      where: { dealerId }
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
          config = await prisma.dealerSaaSConfig.update({
            where: { id: existingSaaS.id },
            data: {
              status: 'ACTIVE',
              expiresAt: newExpiresAt,
              pendingPlan: null,
              pendingStatus: null,
              paymentSender: null,
              paymentDate: null,
              paymentNote: null
            }
          });
        } else if (existingSaaS.pendingStatus === 'PENDING_APPROVAL') {
          config = await prisma.dealerSaaSConfig.update({
            where: { id: existingSaaS.id },
            data: {
              plan: existingSaaS.pendingPlan,
              status: 'ACTIVE',
              expiresAt: newExpiresAt,
              pendingPlan: null,
              pendingStatus: null,
              paymentSender: null,
              paymentDate: null,
              paymentNote: null
            }
          });
        } else {
          return NextResponse.json({ error: 'No pending subscription request found' }, { status: 400 });
        }
      } else if (action === 'reject') {
        if (existingSaaS.status === 'PENDING_APPROVAL') {
          config = await prisma.dealerSaaSConfig.update({
            where: { id: existingSaaS.id },
            data: {
              status: 'REJECTED',
              paymentSender: null,
              paymentDate: null,
              paymentNote: null
            }
          });
        } else if (existingSaaS.pendingStatus === 'PENDING_APPROVAL') {
          config = await prisma.dealerSaaSConfig.update({
            where: { id: existingSaaS.id },
            data: {
              pendingStatus: 'REJECTED',
              paymentSender: null,
              paymentDate: null,
              paymentNote: null
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
        config = await prisma.dealerSaaSConfig.update({
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
        config = await prisma.dealerSaaSConfig.create({
          data: {
            dealerId,
            plan,
            status,
            expiresAt: new Date(expiresAt)
          }
        });
      }
    }

    return NextResponse.json({ success: true, saas: config });
  } catch (error) {
    console.error('Admin Dealer SaaS POST Error:', error);
    return NextResponse.json({ error: 'Failed to configure dealer SaaS plan', details: error.message }, { status: 500 });
  }
}
