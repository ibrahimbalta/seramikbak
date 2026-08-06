import { NextResponse, after } from 'next/server';
import prisma from '@/lib/prisma';

// In-memory buffer for analytics logs to prevent DB write-lock contention under load
let logBuffer = global.analyticsLogBuffer;
if (!logBuffer) {
  logBuffer = [];
  global.analyticsLogBuffer = logBuffer;
}

async function flushAnalyticsLogs() {
  if (logBuffer.length === 0) return;
  const batch = [...logBuffer];
  logBuffer.length = 0; // Clear the buffer
  
  try {
    await prisma.analyticsLog.createMany({
      data: batch
    });
  } catch (err) {
    console.error('Failed to flush analytics logs asynchronously:', err.message);
  }
}

// Flush logs every 5 seconds
if (!global.analyticsFlushInterval) {
  global.analyticsFlushInterval = setInterval(() => {
    flushAnalyticsLogs().catch(err => console.error('Interval flush error:', err.message));
  }, 5000);
}

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
    const pei = searchParams.get('pei');
    const slip = searchParams.get('slip');
    const thicknessRange = searchParams.get('thicknessRange');

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

    if (pei) {
      const peiVal = parseInt(pei, 10);
      if (!isNaN(peiVal)) {
        andConditions.push({ peiRating: { gte: peiVal } });
      }
    }

    if (slip) {
      andConditions.push({ slipResistance: slip });
    }

    if (thicknessRange) {
      if (thicknessRange === 'thin') {
        andConditions.push({ thickness: { lte: 8.5 } });
      } else if (thicknessRange === 'standard') {
        andConditions.push({ thickness: { gt: 8.5, lte: 10.0 } });
      } else if (thicknessRange === 'thick') {
        andConditions.push({ thickness: { gt: 10.0 } });
      }
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

      // Log the search query in analytics via in-memory buffer
      logBuffer.push({
        action: 'SEARCH',
        query: query,
        city: searchParams.get('city') || 'İstanbul'
      });

      // Flush asynchronously if the buffer reaches 50 items
      if (logBuffer.length >= 50) {
        try {
          after(() => {
            flushAnalyticsLogs().catch(err => console.error(err));
          });
        } catch (e) {
          // Fallback if after() is not supported in this runtime
          flushAnalyticsLogs().catch(err => console.error(err));
        }
      }
    }

    const where = andConditions.length > 0 ? { AND: andConditions } : {};

    const fullDetail = searchParams.get('fullDetail') === 'true';
    const selectSimple = searchParams.get('selectSimple') === 'true';

    if (selectSimple) {
      const simpleProducts = await prisma.product.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          name: true,
          code: true
        },
        orderBy: { name: 'asc' }
      });
      return NextResponse.json(simpleProducts);
    }

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
              OR: [
                { expiresAt: null },
                { expiresAt: { gt: new Date() } }
              ]
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
          trendyolPrice: true,
          trendyolUrl: true,
          hepsiburadaPrice: true,
          hepsiburadaUrl: true,
          n11Price: true,
          n11Url: true,
          koctasPrice: true,
          koctasUrl: true,
          bauhausPrice: true,
          bauhausUrl: true,
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
              OR: [
                { expiresAt: null },
                { expiresAt: { gt: new Date() } }
              ]
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
