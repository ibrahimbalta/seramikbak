import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Haversine formula to compute distance between two sets of GPS coordinates in kilometers
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
}

function round(value, decimals) {
  return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const latStr = searchParams.get('lat');
    const lngStr = searchParams.get('lng');
    const brandIdParam = searchParams.get('brandId');
    const productId = searchParams.get('productId');

    // Default to Kadıköy / Istanbul coordinates if missing or invalid
    let userLat = parseFloat(latStr);
    let userLng = parseFloat(lngStr);
    if (isNaN(userLat) || isNaN(userLng)) {
      userLat = 40.9901;
      userLng = 29.0278;
    }

    let targetBrandId = brandIdParam;

    // If productId is provided, query product details to retrieve associated brandId
    let productDetails = null;
    if (productId && productId.trim() !== '' && productId !== 'demo-product-id') {
      try {
        productDetails = await prisma.product.findUnique({
          where: { id: productId },
          select: { id: true, name: true, brandId: true, brand: { select: { id: true, name: true } } }
        });
        if (productDetails?.brandId && (!targetBrandId || targetBrandId === 'all')) {
          targetBrandId = productDetails.brandId;
        }
      } catch (pErr) {
        console.warn('Product lookup for nearest dealer failed:', pErr);
      }
    }

    // Retrieve approved dealers with their brand and inventories
    const dealers = await prisma.dealer.findMany({
      where: {
        status: {
          in: ['APPROVED', 'approved']
        }
      },
      include: {
        brand: {
          select: { id: true, name: true }
        },
        inventories: {
          where: productId ? { productId } : undefined,
          select: {
            productId: true,
            status: true,
            stock: true,
            price: true
          }
        }
      }
    });

    if (dealers.length === 0) {
      return NextResponse.json([]);
    }

    // Filter candidate dealers:
    // If a brand is specified and there are registered dealers for this brand,
    // only return authorized dealers of this brand (or dealers holding this product in stock).
    let candidateDealers = dealers;
    if (targetBrandId && targetBrandId !== 'all') {
      const brandDealers = dealers.filter(
        (d) => d.brandId === targetBrandId || (d.inventories && d.inventories.length > 0)
      );
      if (brandDealers.length > 0) {
        candidateDealers = brandDealers;
      }
    }

    // Compute distance and product availability for each dealer
    const dealersWithMetadata = candidateDealers.map((dealer) => {
      const dLat = typeof dealer.lat === 'number' ? dealer.lat : (parseFloat(dealer.lat) || 41.0082);
      const dLng = typeof dealer.lng === 'number' ? dealer.lng : (parseFloat(dealer.lng) || 28.9784);
      const rawDistance = haversineDistance(userLat, userLng, dLat, dLng);
      const distance = isNaN(rawDistance) ? 10 : rawDistance;

      const hasProductInInventory = dealer.inventories && dealer.inventories.length > 0;
      const isSameBrand = targetBrandId ? dealer.brandId === targetBrandId : false;

      return {
        id: dealer.id,
        name: dealer.name || 'Yetkili Bayi',
        brandId: dealer.brandId,
        brand: dealer.brand || { name: 'Yetkili Marka' },
        phone: dealer.phone || '0850 123 45 67',
        email: dealer.email,
        address: dealer.address || '',
        city: dealer.city || 'İstanbul',
        district: dealer.district || 'Merkez',
        lat: dLat,
        lng: dLng,
        status: dealer.status,
        logoUrl: dealer.logoUrl,
        bannerUrl: dealer.bannerUrl,
        distanceKm: round(distance, 1),
        hasProductInStock: hasProductInInventory,
        isAuthorizedBrandDealer: isSameBrand,
        matchedProduct: productDetails?.name || null
      };
    });

    // Intelligent Sorting:
    // 1. Dealers holding the product directly in inventory first
    // 2. Authorized dealers of the same brand second
    // 3. Closest distance third
    const sortedDealers = dealersWithMetadata.sort((a, b) => {
      if (a.hasProductInStock && !b.hasProductInStock) return -1;
      if (!a.hasProductInStock && b.hasProductInStock) return 1;

      if (a.isAuthorizedBrandDealer && !b.isAuthorizedBrandDealer) return -1;
      if (!a.isAuthorizedBrandDealer && b.isAuthorizedBrandDealer) return 1;

      return a.distanceKm - b.distanceKm;
    });

    return NextResponse.json(sortedDealers);
  } catch (error) {
    console.error('Nearest Dealers API Error:', error);
    return NextResponse.json([]);
  }
}
