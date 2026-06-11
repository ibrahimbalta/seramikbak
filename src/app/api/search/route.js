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

    // Construct Prisma where filters
    const where = {};

    if (brandId) {
      where.brandId = brandId;
    }

    if (color) {
      where.color = color;
    }

    if (finish) {
      where.finish = finish;
    }

    if (style) {
      where.style = style;
    }

    if (area) {
      // Since area is stored as "Banyo,Mutfak", we perform a contains search
      where.area = {
        contains: area
      };
    }

    if (size) {
      const parts = size.split('x');
      if (parts.length === 2) {
        const width = parseInt(parts[0], 10);
        const height = parseInt(parts[1], 10);
        if (!isNaN(width) && !isNaN(height)) {
          where.OR = [
            { width: width, height: height },
            { width: height, height: width } // support swapped dimensions
          ];
        }
      }
    }

    if (query) {
      where.OR = [
        { name: { contains: query } },
        { code: { contains: query } },
        { style: { contains: query } },
        { color: { contains: query } }
      ];

      // Log the search query in analytics
      await prisma.analyticsLog.create({
        data: {
          action: 'SEARCH',
          query: query,
          city: searchParams.get('city') || 'İstanbul'
        }
      });
    }

    // Query products
    const products = await prisma.product.findMany({
      where,
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
