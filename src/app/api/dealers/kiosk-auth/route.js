import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-check';
import { checkKioskSubscriptionAccess } from '@/lib/kioskAuth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const session = await verifyAuth(request);
    const { searchParams } = new URL(request.url);
    const queryDealerId = searchParams.get('dealerId');

    let dealerId = null;

    if (session && session.role === 'dealer') {
      dealerId = session.id;
    } else if (session && session.role === 'admin' && queryDealerId) {
      dealerId = queryDealerId;
    } else if (queryDealerId) {
      dealerId = queryDealerId;
    }

    if (!dealerId) {
      return NextResponse.json({
        authorized: false,
        reason: 'NO_DEALER_SESSION',
        message: 'Kiosk Teşhir Modunu başlatmak için bayi girişi yapılmalıdır.'
      }, { status: 401 });
    }

    // Verify Dealer in database
    const dealer = await prisma.dealer.findUnique({
      where: { id: dealerId },
      select: {
        id: true,
        name: true,
        city: true,
        district: true,
        brandId: true,
        logoUrl: true,
        showroomImages: true,
        status: true,
        brand: {
          select: {
            id: true,
            name: true,
            logoUrl: true
          }
        }
      }
    });

    if (!dealer) {
      return NextResponse.json({
        authorized: false,
        reason: 'DEALER_NOT_FOUND',
        message: 'Belirtilen bayi kaydı sistemde bulunamadı.'
      }, { status: 404 });
    }

    if (dealer.status !== 'APPROVED' && dealer.status !== 'approved') {
      return NextResponse.json({
        authorized: false,
        reason: 'DEALER_NOT_APPROVED',
        message: 'Bayi kaydınız henüz onaylanmamıştır.'
      }, { status: 403 });
    }

    // Check SaaS package subscription
    const saas = await prisma.dealerSaaSConfig.findFirst({
      where: { dealerId: dealer.id },
      orderBy: { expiresAt: 'desc' }
    });

    const check = checkKioskSubscriptionAccess(saas);

    if (check.authorized) {
      return NextResponse.json({
        authorized: true,
        reason: check.reason,
        message: check.message,
        dealer: {
          id: dealer.id,
          name: dealer.name,
          city: dealer.city,
          district: dealer.district,
          brandId: dealer.brandId,
          brandName: dealer.brand?.name || '',
          brandLogo: dealer.brand?.logoUrl || '',
          logoUrl: dealer.logoUrl
        },
        subscription: {
          plan: saas.plan,
          status: saas.status,
          expiresAt: saas.expiresAt
        }
      });
    }

    return NextResponse.json({
      authorized: false,
      reason: check.reason,
      message: check.message,
      dealer: {
        id: dealer.id,
        name: dealer.name,
        city: dealer.city,
        district: dealer.district,
        brandId: dealer.brandId,
        brandName: dealer.brand?.name || ''
      },
      subscription: saas ? {
        plan: saas.plan,
        status: saas.status,
        expiresAt: saas.expiresAt
      } : null
    }, { status: 403 });

  } catch (error) {
    console.error('Kiosk Auth API Error:', error);
    return NextResponse.json({
      authorized: false,
      reason: 'SERVER_ERROR',
      message: 'Kiosk yetkilendirmesi sırasında sistemsel bir hata oluştu.'
    }, { status: 500 });
  }
}
