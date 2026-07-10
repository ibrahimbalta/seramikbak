import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse filters
    const query = searchParams.get('q');
    const color = searchParams.get('color');
    const finish = searchParams.get('finish');
    const style = searchParams.get('style');
    const area = searchParams.get('area');
    const brandId = searchParams.get('brandId');
    const size = searchParams.get('size'); // format: '60x120', '60x60', '20x120'
    const rectified = searchParams.get('rectified');
    const frost = searchParams.get('frost');
    const isPremium = searchParams.get('isPremium');

    // Pagination parameters
    const limitParam = searchParams.get('limit');
    const pageParam = searchParams.get('page');
    let skip = undefined;
    let take = undefined;

    if (limitParam !== 'all') {
      const limit = parseInt(limitParam || '24', 10);
      const page = parseInt(pageParam || '1', 10);
      if (!isNaN(limit) && limit > 0) {
        take = limit;
        if (!isNaN(page) && page > 0) {
          skip = (page - 1) * limit;
        }
      }
    }

    // Construct Prisma where filters using AND array to support multiple active criteria
    const andConditions = [];

    if (brandId) {
      andConditions.push({ brandId: brandId });
    }

    if (color) {
      andConditions.push({ color: color });
    }

    if (finish) {
      andConditions.push({ finish: finish });
    }

    if (style) {
      andConditions.push({ style: style });
    }

    if (rectified) {
      andConditions.push({ rectified: rectified === 'true' });
    }

    if (frost) {
      andConditions.push({ frostResistance: frost === 'true' });
    }

    if (isPremium) {
      andConditions.push({ isPremium: isPremium === 'true' });
    }

    if (area) {
      // Since area is stored as "Banyo,Mutfak", we perform a contains search
      andConditions.push({
        area: {
          contains: area
        }
      });
    }

    if (size) {
      const parts = size.toLowerCase().split('x');
      if (parts.length === 2) {
        const width = parseFloat(parts[0].replace(',', '.'));
        const height = parseFloat(parts[1].replace(',', '.'));
        if (!isNaN(width) && !isNaN(height)) {
          andConditions.push({
            OR: [
              { width: width, height: height },
              { width: height, height: width } // support swapped dimensions
            ]
          });
        }
      }
    }

    if (query) {
      const tokens = query.trim().split(/\s+/).filter(Boolean);
      if (tokens.length > 0) {
        tokens.forEach(token => {
          andConditions.push({
            OR: [
              { name: { contains: token } },
              { code: { contains: token } },
              { style: { contains: token } },
              { color: { contains: token } },
              { finish: { contains: token } },
              { brand: { name: { contains: token } } }
            ]
          });
        });
      }

      // Log the search query in analytics
      try {
        await prisma.analyticsLog.create({
          data: {
            action: 'SEARCH',
            query: query,
            city: searchParams.get('city') || 'İstanbul'
          }
        });
      } catch (err) {
        console.error('Analytics log failed:', err);
      }
    }

    const where = andConditions.length > 0 ? { AND: andConditions } : {};

    const fullDetail = searchParams.get('fullDetail') === 'true';

    // Query products
    let products;
    if (fullDetail) {
      products = await prisma.product.findMany({
        where,
        skip,
        take,
        orderBy: [
          { isPremium: 'desc' },
          { createdAt: 'desc' }
        ],
        include: {
          brand: {
            select: {
              id: true,
              name: true,
              logoUrl: true
            }
          },
          campaigns: {
            where: {
              status: 'ACTIVE',
              budget: { gt: 0 }
            },
            select: {
              id: true,
              bidAmount: true
            }
          }
        }
      });
    } else {
      products = await prisma.product.findMany({
        where,
        skip,
        take,
        orderBy: [
          { isPremium: 'desc' },
          { createdAt: 'desc' }
        ],
        select: {
          id: true,
          name: true,
          code: true,
          brandId: true,
          width: true,
          height: true,
          color: true,
          finish: true,
          style: true,
          imageUrl: true,
          textureUrl: true,
          isPremium: true,
          brand: {
            select: {
              id: true,
              name: true,
              logoUrl: true
            }
          },
          campaigns: {
            where: {
              status: 'ACTIVE',
              budget: { gt: 0 }
            },
            select: {
              id: true,
              bidAmount: true
            }
          }
        }
      });
    }

    // Sort products so that "isPremium" or bid-carrying products appear first
    // This implements the Step 5 Monetization requirement (Premium Featured Listings)
    const sortedProducts = products.sort((a, b) => {
      // 1. Check active campaigns
      const aCampaign = a.campaigns.length > 0;
      const bCampaign = b.campaigns.length > 0;
      
      if (aCampaign && !bCampaign) return -1;
      if (!aCampaign && bCampaign) return 1;
      
      if (aCampaign && bCampaign) {
        // Higher bid goes first
        return b.campaigns[0].bidAmount - a.campaigns[0].bidAmount;
      }
      
      // If neither has campaign, put general isPremium first
      if (a.isPremium && !b.isPremium) return -1;
      if (!a.isPremium && b.isPremium) return 1;

      return 0; // maintain original order
    });

    return NextResponse.json(sortedProducts);
  } catch (error) {
    console.error('Search API Error:', error);
    return NextResponse.json(
      { error: 'Search operation failed', details: error.message },
      { status: 500 }
    );
  }
}
