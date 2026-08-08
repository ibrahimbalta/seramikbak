import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [outletCount, dealerCount, todayLogsCount, totalLeadsCount] = await Promise.all([
      prisma.outletListing.count({ where: { status: 'ACTIVE' } }).catch(() => 0),
      prisma.dealer.count({ where: { status: 'APPROVED' } }).catch(() => 0),
      prisma.analyticsLog.count({ where: { createdAt: { gte: todayStart } } }).catch(() => 0),
      prisma.lead.count().catch(() => 0)
    ]);

    return NextResponse.json({
      success: true,
      data: {
        outletCount,
        dealerCount,
        todayLogsCount,
        totalLeadsCount
      }
    });
  } catch (error) {
    console.error('Error fetching ticker stats:', error);
    return NextResponse.json({
      success: false,
      data: {
        outletCount: 0,
        dealerCount: 0,
        todayLogsCount: 0,
        totalLeadsCount: 0
      }
    });
  }
}
