import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const bids = await prisma.podiumBid.findMany({
      orderBy: [
        { year: 'desc' },
        { weekNumber: 'desc' },
        { bidAmount: 'desc' }
      ],
      include: {
        brand: { select: { id: true, name: true, logoUrl: true } },
        product: { select: { id: true, name: true, code: true, imageUrl: true } }
      }
    });

    return NextResponse.json({
      success: true,
      bids
    });
  } catch (error) {
    console.error('Admin Podium GET Error:', error);
    return NextResponse.json(
      { error: 'Podium bids fetch failed', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { bidId, action } = await request.json(); // action: 'APPROVE', 'REJECT'

    if (!bidId) {
      return NextResponse.json({ error: 'bidId zorunludur' }, { status: 400 });
    }

    const targetBid = await prisma.podiumBid.findUnique({
      where: { id: bidId }
    });

    if (!targetBid) {
      return NextResponse.json({ error: 'Teklif bulunamadı' }, { status: 404 });
    }

    if (action === 'REJECT') {
      const updated = await prisma.podiumBid.update({
        where: { id: bidId },
        data: { status: 'REJECTED' }
      });
      return NextResponse.json({ success: true, message: 'Teklif reddedildi.', bid: updated });
    }

    // Default action: APPROVE (WINNER_ACTIVE)
    // 1. Mark all other bids for the same week and year as OUTBID or PENDING
    await prisma.podiumBid.updateMany({
      where: {
        weekNumber: targetBid.weekNumber,
        year: targetBid.year,
        id: { not: bidId },
        status: { in: ['WINNER_ACTIVE', 'PENDING_APPROVAL'] }
      },
      data: { status: 'OUTBID' }
    });

    // 2. Set target bid as WINNER_ACTIVE
    const approvedBid = await prisma.podiumBid.update({
      where: { id: bidId },
      data: { status: 'WINNER_ACTIVE' }
    });

    return NextResponse.json({
      success: true,
      message: 'Teklif onaylandı ve haftanın Podyum Kazananı olarak yayına alındı!',
      bid: approvedBid
    });
  } catch (error) {
    console.error('Admin Podium POST Error:', error);
    return NextResponse.json(
      { error: 'Podium action failed', details: error.message },
      { status: 500 }
    );
  }
}
