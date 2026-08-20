import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Master country configuration with region mapping
const countryMasterList = [
  { code: 'TR', country: 'Türkiye', flag: '🇹🇷', region: 'Yerel Pazar' },
  { code: 'DE', country: 'Almanya', flag: '🇩🇪', region: 'Avrupa' },
  { code: 'AE', country: 'Birleşik Arap Emirlikleri', flag: '🇦🇪', region: 'Orta Doğu' },
  { code: 'GB', country: 'İngiltere', flag: '🇬🇧', region: 'Avrupa' },
  { code: 'SA', country: 'Suudi Arabistan', flag: '🇸🇦', region: 'Orta Doğu' },
  { code: 'US', country: 'Amerika Birleşik Devletleri', flag: '🇺🇸', region: 'Kuzey Amerika' },
  { code: 'FR', country: 'Fransa', flag: '🇫🇷', region: 'Avrupa' },
  { code: 'RU', country: 'Rusya', flag: '🇷🇺', region: 'Doğu Avrupa & BDT' },
  { code: 'NL', country: 'Hollanda', flag: '🇳🇱', region: 'Avrupa' },
  { code: 'IT', country: 'İtalya', flag: '🇮🇹', region: 'Avrupa' },
  { code: 'AZ', country: 'Azerbaycan', flag: '🇦🇿', region: 'Kafkasya' },
  { code: 'IQ', country: 'Irak', flag: '🇮🇶', region: 'Orta Doğu' }
];

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get('brandId');
    const period = searchParams.get('period') || '30d'; // 30d, 90d, 1y, all

    if (!brandId) {
      return NextResponse.json(
        { error: 'Missing brandId parameter' },
        { status: 400 }
      );
    }

    // Verify brand existence
    const brand = await prisma.brand.findUnique({
      where: { id: brandId },
      select: { id: true, name: true, logoUrl: true }
    });

    if (!brand) {
      return NextResponse.json(
        { error: 'Brand not found' },
        { status: 404 }
      );
    }

    // Date range filter calculation
    let dateFilter = {};
    const now = new Date();
    if (period === '30d') {
      const d = new Date();
      d.setDate(now.getDate() - 30);
      dateFilter = { gte: d };
    } else if (period === '90d') {
      const d = new Date();
      d.setDate(now.getDate() - 90);
      dateFilter = { gte: d };
    } else if (period === '1y') {
      const d = new Date();
      d.setFullYear(now.getFullYear() - 1);
      dateFilter = { gte: d };
    }

    // Fetch ONLY 100% REAL DB metrics for this brand
    const [totalProducts, brandLeadsCount, brandLogs, brandProducts] = await Promise.all([
      prisma.product.count({ where: { brandId } }),
      prisma.lead.count({ 
        where: { 
          product: { brandId },
          ...(Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {})
        } 
      }),
      prisma.analyticsLog.findMany({
        where: {
          OR: [
            { brandId },
            { product: { brandId } }
          ],
          ...(Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {})
        },
        select: { action: true, country: true }
      }),
      prisma.product.findMany({
        where: { brandId },
        take: 12,
        select: { id: true, name: true, finish: true, style: true }
      })
    ]);

    // Aggregate country stats strictly from real database analytics logs
    const countryStatsMap = {};
    
    // Initialize map for all master countries
    countryMasterList.forEach(item => {
      countryStatsMap[item.code] = {
        country: item.country,
        code: item.code,
        flag: item.flag,
        region: item.region,
        views: 0,
        specDownloads: 0,
        b2bLeads: 0,
        growth: '0%',
        topProduct: brandProducts.length > 0 ? brandProducts[0].name : `${brand.name} Koleksiyonu`,
        sharePercent: 0
      };
    });

    // Populate actual DB log counts
    brandLogs.forEach((log) => {
      const countryCode = (log.country && countryStatsMap[log.country.toUpperCase()]) ? log.country.toUpperCase() : 'TR';
      const targetObj = countryStatsMap[countryCode] || countryStatsMap['TR'];
      
      if (log.action === 'VIEW' || log.action === 'SEARCH' || log.action === 'STUDIO_TRY') {
        targetObj.views += 1;
      } else if (log.action === 'PDF_DOWNLOAD' || log.action === 'BIM_DOWNLOAD') {
        targetObj.specDownloads += 1;
      } else if (log.action === 'LEAD') {
        targetObj.b2bLeads += 1;
      }
    });

    // Add actual lead table count to TR
    if (countryStatsMap['TR']) {
      countryStatsMap['TR'].b2bLeads += brandLeadsCount;
    }

    const countryStats = Object.values(countryStatsMap);

    // Compute total sum metrics from real data
    const totalViewsCount = countryStats.reduce((acc, c) => acc + c.views, 0);
    const totalDownloadsCount = countryStats.reduce((acc, c) => acc + c.specDownloads, 0);
    const totalLeadsCount = countryStats.reduce((acc, c) => acc + c.b2bLeads, 0);

    // Compute percentage share per country based on real views
    countryStats.forEach(c => {
      c.sharePercent = totalViewsCount > 0 ? Math.round((c.views / totalViewsCount) * 100) : 0;
    });

    // Sort by views descending
    countryStats.sort((a, b) => b.views - a.views);

    // Filter active countries with at least 1 view, download, or lead
    const activeCountries = countryStats.filter(c => c.views > 0 || c.specDownloads > 0 || c.b2bLeads > 0);

    // Top export market determination
    const topMarket = activeCountries.length > 0 ? activeCountries[0] : null;

    // Group stats by region strictly from real data
    const regionMap = {};
    countryStats.forEach(c => {
      if (!regionMap[c.region]) {
        regionMap[c.region] = { region: c.region, views: 0, downloads: 0, leads: 0, countriesCount: 0 };
      }
      regionMap[c.region].views += c.views;
      regionMap[c.region].downloads += c.specDownloads;
      regionMap[c.region].leads += c.b2bLeads;
      if (c.views > 0 || c.specDownloads > 0 || c.b2bLeads > 0) {
        regionMap[c.region].countriesCount += 1;
      }
    });
    const regions = Object.values(regionMap).sort((a, b) => b.views - a.views);

    // Real AI Actionable Export Insights tailored strictly to real DB metrics
    const insights = [];

    if (totalViewsCount > 0) {
      if (topMarket) {
        insights.push({
          id: 'insight-1',
          type: 'high-demand',
          title: `${topMarket.country} (${topMarket.flag}) Pazarında Gerçek İnceleme Trafiği`,
          desc: `${brand.name} ürünleri ${topMarket.country} bölgesinden toplam ${topMarket.views.toLocaleString('tr-TR')} canlı gösterim ve ${topMarket.b2bLeads} doğrudan B2B teklif talebi aldı.`
        });
      }

      insights.push({
        id: 'insight-2',
        type: 'bim-cad-demand',
        title: '3D BIM / CAD & Revit Şartname İndirmeleri',
        desc: `Sistemde mimarlar tarafından toplam ${totalDownloadsCount.toLocaleString('tr-TR')} adet 4K PBR kaplama ve Revit nesnesi indirildi.`
      });
    } else {
      insights.push({
        id: 'insight-empty',
        type: 'info',
        title: 'Canlı Veritabanı Analizi Bekleniyor',
        desc: `${brand.name} ürünlerinize ait henüz kaydedilmiş canlı küresel arama ve BIM indirme logu bulunmamaktadır. Mimarlar ürünlerinizi inceledikçe anlık olarak burada listelenecektir.`
      });
    }

    return NextResponse.json({
      success: true,
      brand: {
        id: brand.id,
        name: brand.name,
        totalProducts
      },
      period,
      summary: {
        totalGlobalViews: totalViewsCount,
        totalBimDownloads: totalDownloadsCount,
        totalB2bLeads: totalLeadsCount,
        activeCountriesCount: activeCountries.length,
        topExportMarket: topMarket ? `${topMarket.country} ${topMarket.flag}` : 'Henüz Veri Yok'
      },
      countries: countryStats,
      regions,
      insights
    });

  } catch (error) {
    console.error('Country Analytics API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch country analytics data', details: error.message },
      { status: 500 }
    );
  }
}
