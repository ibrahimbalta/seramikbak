import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get('brandId');

    if (!brandId) {
      return NextResponse.json(
        { error: 'Missing brandId query parameter' },
        { status: 400 }
      );
    }

    // 1. Fetch Brand name and verification
    const brand = await prisma.brand.findUnique({
      where: { id: brandId }
    });

    if (!brand) {
      return NextResponse.json(
        { error: 'Brand not found' },
        { status: 404 }
      );
    }

    // 2. Fetch SaaS subscription details (fetch most recent config, regardless of status, so we see pending requests)
    const saas = await prisma.saaSConfig.findFirst({
      where: { brandId },
      orderBy: { expiresAt: 'desc' }
    });

    // 3. Fetch Leads for dealers under this brand
    const leadsCount = await prisma.lead.count({
      where: {
        product: { brandId }
      }
    });

    const recentLeads = await prisma.lead.findMany({
      where: {
        product: { brandId }
      },
      include: {
        product: { select: { name: true, code: true } },
        dealer: { select: { name: true, city: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    // 4. Fetch general analytics stats (Views, Clicks)
    const totalViews = await prisma.analyticsLog.count({
      where: { brandId, action: 'VIEW' }
    });

    const totalClicks = await prisma.analyticsLog.count({
      where: { brandId, action: 'CLICK' }
    });

    // 5. Fetch Ad Campaigns performance
    const campaigns = await prisma.adCampaign.findMany({
      where: { brandId },
      include: {
        product: { select: { name: true, code: true } }
      }
    });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    // 6. Aggregate Market Trends (Top searched terms in the past 30 days - platform wide)
    const searchLogs = await prisma.analyticsLog.findMany({
      where: { 
        action: 'SEARCH', 
        query: { not: null },
        createdAt: { gte: thirtyDaysAgo }
      },
      select: { query: true },
      take: 2000 // sanity cap to prevent memory bloat
    });

    const keywordCounts = {};
    searchLogs.forEach(log => {
      const q = log.query.trim().toLowerCase();
      keywordCounts[q] = (keywordCounts[q] || 0) + 1;
    });

    const topKeywords = Object.entries(keywordCounts)
      .map(([keyword, count]) => ({ keyword, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // 7. Aggregate User Demographics (Cities searching this brand in the past 30 days)
    const brandViewLogs = await prisma.analyticsLog.findMany({
      where: { 
        brandId, 
        city: { not: null },
        createdAt: { gte: thirtyDaysAgo }
      },
      select: { city: true }
    });

    const cityCounts = {};
    brandViewLogs.forEach(log => {
      cityCounts[log.city] = (cityCounts[log.city] || 0) + 1;
    });

    const topCities = Object.entries(cityCounts)
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // 8. Generate Time-Series Graph Data for the last 30 days (Optimized to exactly 1 query)
    const dailyLogs = await prisma.analyticsLog.findMany({
      where: {
        brandId,
        createdAt: { gte: thirtyDaysAgo },
        action: { in: ['VIEW', 'CLICK', 'LEAD'] }
      },
      select: {
        action: true,
        createdAt: true
      }
    });

    const now = new Date();
    const dailyStatsMap = {};

    // Pre-populate keys for the last 30 days to guarantee correct ordering and display empty dates
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      const dateLabel = date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
      dailyStatsMap[dateLabel] = { views: 0, clicks: 0, leads: 0 };
    }

    // Populate counts in memory
    dailyLogs.forEach(log => {
      const dateLabel = new Date(log.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
      if (dailyStatsMap[dateLabel]) {
        if (log.action === 'VIEW') dailyStatsMap[dateLabel].views++;
        else if (log.action === 'CLICK') dailyStatsMap[dateLabel].clicks++;
        else if (log.action === 'LEAD') dailyStatsMap[dateLabel].leads++;
      }
    });

    const dailyStats = Object.entries(dailyStatsMap).map(([dateLabel, stats]) => ({
      date: dateLabel,
      views: stats.views,
      clicks: stats.clicks,
      leads: stats.leads
    }));

    return NextResponse.json({
      brandName: brand.name,
      saas: saas ? {
        plan: saas.plan,
        status: saas.status,
        expiresAt: saas.expiresAt,
        pendingPlan: saas.pendingPlan,
        pendingStatus: saas.pendingStatus
      } : { plan: 'BASIC', status: 'ACTIVE', expiresAt: 'N/A' },
      summary: {
        totalViews,
        totalClicks,
        totalLeads: leadsCount,
        ctr: totalViews > 0 ? parseFloat(((totalClicks / totalViews) * 100).toFixed(2)) : 0
      },
      campaigns,
      recentLeads,
      topKeywords,
      topCities,
      timeline: dailyStats
    });

  } catch (error) {
    console.error('B2B Stats API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch B2B dashboard stats', details: error.message },
      { status: 500 }
    );
  }
}
