import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-check';
import { checkKioskSubscriptionAccess, checkBrandKioskSubscriptionAccess } from '@/lib/kioskAuth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const session = await verifyAuth(request);
    const { searchParams } = new URL(request.url);
    const queryDealerId = searchParams.get('dealerId');
    const queryBrand = searchParams.get('brand') || searchParams.get('brandSlug') || searchParams.get('brandId');

    // -------------------------------------------------------------
    // 1. BRAND ENTERPRISE / PRO KIOSK ACCESS CHECK
    // If opened with ?brand=... or as a logged-in brand user, grant
    // direct kiosk access if the brand has an active PRO or ENTERPRISE plan.
    // -------------------------------------------------------------
    const brandTarget = queryBrand || (session && session.role === 'brand' ? session.id : null);

    if (brandTarget) {
      const brand = await prisma.brand.findFirst({
        where: {
          OR: [
            { id: brandTarget },
            { slug: brandTarget },
            { slug: { startsWith: brandTarget } },
            { username: brandTarget },
            { name: { equals: brandTarget, mode: 'insensitive' } },
            { name: { contains: brandTarget, mode: 'insensitive' } }
          ]
        },
        select: {
          id: true,
          name: true,
          slug: true,
          logoUrl: true
        }
      });

      if (brand) {
        const brandSaas = await prisma.saaSConfig.findFirst({
          where: { brandId: brand.id },
          orderBy: { expiresAt: 'desc' }
        });

        const brandCheck = checkBrandKioskSubscriptionAccess(brandSaas);

        if (brandCheck.authorized) {
          return NextResponse.json({
            authorized: true,
            isBrandKiosk: true,
            reason: brandCheck.reason,
            message: brandCheck.message,
            brand: {
              id: brand.id,
              name: brand.name,
              slug: brand.slug,
              logoUrl: brand.logoUrl
            },
            subscription: {
              type: 'BRAND',
              plan: brandSaas?.plan || 'ENTERPRISE',
              status: brandSaas?.status || 'ACTIVE',
              expiresAt: brandSaas?.expiresAt
            }
          });
        } else {
          return NextResponse.json({
            authorized: false,
            isBrandKiosk: true,
            reason: brandCheck.reason,
            message: brandCheck.message,
            brand: {
              id: brand.id,
              name: brand.name,
              slug: brand.slug,
              logoUrl: brand.logoUrl
            },
            subscription: brandSaas ? {
              type: 'BRAND',
              plan: brandSaas.plan,
              status: brandSaas.status,
              expiresAt: brandSaas.expiresAt
            } : null
          }, { status: 403 });
        }
      }
    }

    // -------------------------------------------------------------
    // 2. DEALER KIOSK ACCESS CHECK
    // -------------------------------------------------------------
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
        isBrandKiosk: !!queryBrand,
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
