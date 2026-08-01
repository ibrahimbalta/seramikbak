import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

function getISOWeekDetails(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return { weekNumber: weekNo, year: d.getUTCFullYear() };
}

export async function GET() {
  try {
    const { weekNumber, year } = getISOWeekDetails();

    // 1. Try to find the approved WINNER_ACTIVE bid for this week
    let activeBid = await prisma.podiumBid.findFirst({
      where: {
        weekNumber,
        year,
        status: 'WINNER_ACTIVE'
      },
      include: {
        brand: {
          select: { id: true, name: true, logoUrl: true }
        },
        product: {
          select: {
            id: true,
            name: true,
            code: true,
            width: true,
            height: true,
            color: true,
            finish: true,
            style: true,
            imageUrl: true,
            textureUrl: true,
            peiRating: true,
            slipResistance: true,
            thickness: true
          }
        }
      }
    });

    // 2. If no winner active for this week, check highest PENDING_APPROVAL bid
    if (!activeBid) {
      activeBid = await prisma.podiumBid.findFirst({
        where: {
          weekNumber,
          year,
          status: 'PENDING_APPROVAL'
        },
        orderBy: {
          bidAmount: 'desc'
        },
        include: {
          brand: {
            select: { id: true, name: true, logoUrl: true }
          },
          product: {
            select: {
              id: true,
              name: true,
              code: true,
              width: true,
              height: true,
              color: true,
              finish: true,
              style: true,
              imageUrl: true,
              textureUrl: true,
              peiRating: true,
              slipResistance: true,
              thickness: true
            }
          }
        }
      });
    }

    // 3. Fallback to a featured premium product if no bids exist yet
    if (!activeBid) {
      const fallbackProduct = await prisma.product.findFirst({
        where: { isPremium: true },
        include: {
          brand: { select: { id: true, name: true, logoUrl: true } }
        }
      });

      if (fallbackProduct) {
        return NextResponse.json({
          success: true,
          active: true,
          isFallback: true,
          weekNumber,
          year,
          bid: {
            id: 'featured-default',
            bidAmount: 5000,
            title: 'Haftanın Özel Koleksiyon Podyumu',
            description: 'Mimari projelerde öne çıkan lüks porselen ve mermer konsepti.',
            brand: fallbackProduct.brand,
            product: fallbackProduct
          }
        });
      }
      return NextResponse.json({ success: true, active: false });
    }

    // Increment impressions count asynchronously
    prisma.podiumBid.update({
      where: { id: activeBid.id },
      data: { impressions: { increment: 1 } }
    }).catch(err => console.error('Failed to increment podium impressions:', err));

    return NextResponse.json({
      success: true,
      active: true,
      isFallback: false,
      weekNumber,
      year,
      bid: activeBid
    });
  } catch (error) {
    console.error('Active Podium API Error:', error);
    return NextResponse.json(
      { error: 'Podium fetch failed', details: error.message },
      { status: 500 }
    );
  }
}
