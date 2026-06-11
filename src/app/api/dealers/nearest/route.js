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

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const latStr = searchParams.get('lat');
    const lngStr = searchParams.get('lng');
    const brandId = searchParams.get('brandId');

    if (!latStr || !lngStr || !brandId) {
      return NextResponse.json(
        { error: 'Missing coordinates (lat, lng) or brandId parameters' },
        { status: 400 }
      );
    }

    const userLat = parseFloat(latStr);
    const userLng = parseFloat(lngStr);

    if (isNaN(userLat) || isNaN(userLng)) {
      return NextResponse.json(
        { error: 'Invalid latitude or longitude format' },
        { status: 400 }
      );
    }

    // Retrieve all approved dealers for the selected brand
    const dealers = await prisma.dealer.findMany({
      where: { 
        brandId,
        status: 'APPROVED'
      },
      include: {
        brand: {
          select: { name: true }
        }
      }
    });

    // Compute distance for each dealer
    const dealersWithDistance = dealers.map((dealer) => {
      const distance = haversineDistance(userLat, userLng, dealer.lat, dealer.lng);
      return {
        ...dealer,
        distanceKm: round(distance, 2)
      };
    });

    // Sort by distance (nearest first)
    const nearestDealers = dealersWithDistance
      .sort((a, b) => a.distanceKm - b.distanceKm);

    return NextResponse.json(nearestDealers);
  } catch (error) {
    console.error('Nearest Dealers API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dealers', details: error.message },
      { status: 500 }
    );
  }
}

function round(value, decimals) {
  return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}
