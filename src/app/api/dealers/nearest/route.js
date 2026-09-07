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
    const brandId = searchParams.get('brandId');

    // Default to Kadıköy / Istanbul coordinates if missing or invalid
    let userLat = parseFloat(latStr);
    let userLng = parseFloat(lngStr);
    if (isNaN(userLat) || isNaN(userLng)) {
      userLat = 40.9901;
      userLng = 29.0278;
    }

    // Build flexible query for approved dealers
    const whereClause = {
      status: {
        in: ['APPROVED', 'approved']
      }
    };

    if (brandId && brandId.trim() !== '' && brandId !== 'all' && brandId !== 'undefined' && brandId !== 'null') {
      whereClause.brandId = brandId;
    }

    // Retrieve approved dealers
    let dealers = await prisma.dealer.findMany({
      where: whereClause,
      include: {
        brand: {
          select: { name: true }
        }
      }
    });

    // If no dealers found for this specific brand, fallback to all approved dealers so users always see options
    if (dealers.length === 0 && whereClause.brandId) {
      dealers = await prisma.dealer.findMany({
        where: {
          status: {
            in: ['APPROVED', 'approved']
          }
        },
        include: {
          brand: {
            select: { name: true }
          }
        }
      });
    }

    // Compute distance for each dealer safely
    const dealersWithDistance = dealers.map((dealer) => {
      const dLat = typeof dealer.lat === 'number' ? dealer.lat : (parseFloat(dealer.lat) || 41.0082);
      const dLng = typeof dealer.lng === 'number' ? dealer.lng : (parseFloat(dealer.lng) || 28.9784);
      const rawDistance = haversineDistance(userLat, userLng, dLat, dLng);
      const distance = isNaN(rawDistance) ? 10 : rawDistance;

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
        distanceKm: round(distance, 1)
      };
    });

    // Sort by distance (nearest first)
    const nearestDealers = dealersWithDistance.sort((a, b) => a.distanceKm - b.distanceKm);

    return NextResponse.json(nearestDealers);
  } catch (error) {
    console.error('Nearest Dealers API Error:', error);
    // Never crash the client with 500 error object, return safe empty array
    return NextResponse.json([]);
  }
}
