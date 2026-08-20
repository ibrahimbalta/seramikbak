import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const allCitiesList = [
  "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Aksaray", "Amasya", "Ankara", "Antalya", "Ardahan", "Artvin",
  "Aydın", "Balıkesir", "Bartın", "Batman", "Bayburt", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur",
  "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Düzce", "Edirne", "Elazığ", "Erzincan",
  "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari", "Hatay", "Iğdır", "Isparta", "İstanbul",
  "İzmir", "Kahramanmaraş", "Karabük", "Karaman", "Kars", "Kastamonu", "Kayseri", "Kilis", "Kırıkkale", "Kırklareli",
  "Kırşehir", "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Mardin", "Mersin", "Muğla", "Muş",
  "Nevşehir", "Niğde", "Ordu", "Osmaniye", "Rize", "Sakarya", "Samsun", "Şanlıurfa", "Siirt", "Sinop",
  "Sivas", "Şırnak", "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Uşak", "Van", "Yalova", "Yozgat", "Zonguldak"
];

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

    // 1. Verify Brand & Check SaaS plan
    const brand = await prisma.brand.findUnique({
      where: { id: brandId }
    });

    if (!brand) {
      return NextResponse.json(
        { error: 'Brand not found' },
        { status: 404 }
      );
    }

    const saas = await prisma.saaSConfig.findFirst({
      where: { brandId },
      orderBy: { expiresAt: 'desc' }
    });

    const currentPlan = saas?.plan || 'ENTERPRISE';

    // 2. Fetch ONLY 100% REAL analytics logs over the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const logs = await prisma.analyticsLog.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo }
      },
      include: {
        product: {
          select: {
            color: true,
            width: true,
            height: true,
            style: true
          }
        }
      }
    });

    // In-memory buckets for city breakdowns
    const trendsByCity = {};

    const getInitCityData = () => ({
      colors: {},
      sizes: {},
      styles: {},
      keywords: {}
    });

    trendsByCity['Tüm Türkiye'] = getInitCityData();

    logs.forEach(log => {
      let city = 'İstanbul';
      if (log.city) {
        const rawCity = log.city.trim().toLowerCase();
        const matched = allCitiesList.find(c => {
          const cleanC = c.toLowerCase()
            .replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c');
          const cleanRaw = rawCity
            .replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c');
          return cleanRaw.includes(cleanC) || cleanC.includes(cleanRaw);
        });
        if (matched) {
          city = matched;
        } else if (rawCity.includes('kadıköy') || rawCity.includes('beşiktaş') || rawCity.includes('ataşehir') || rawCity.includes('merkez')) {
          city = 'İstanbul';
        }
      }

      if (!trendsByCity[city]) {
        trendsByCity[city] = getInitCityData();
      }

      const cityData = trendsByCity[city];
      const nationalData = trendsByCity['Tüm Türkiye'];

      // Real Keyword processing
      if (log.action === 'SEARCH' && log.query) {
        const kw = log.query.trim().toLowerCase();
        if (kw.length >= 2) {
          cityData.keywords[kw] = (cityData.keywords[kw] || 0) + 1;
          nationalData.keywords[kw] = (nationalData.keywords[kw] || 0) + 1;
        }
      }

      // Real Product properties mapping
      if (log.product) {
        const { color, width, height, style } = log.product;
        if (color) {
          cityData.colors[color] = (cityData.colors[color] || 0) + 1;
          nationalData.colors[color] = (nationalData.colors[color] || 0) + 1;
        }
        if (width && height) {
          const sizeStr = `${width}x${height} cm`;
          cityData.sizes[sizeStr] = (cityData.sizes[sizeStr] || 0) + 1;
          nationalData.sizes[sizeStr] = (nationalData.sizes[sizeStr] || 0) + 1;
        }
        if (style) {
          cityData.styles[style] = (cityData.styles[style] || 0) + 1;
          nationalData.styles[style] = (nationalData.styles[style] || 0) + 1;
        }
      }
    });

    // Format top 5 counts for each city strictly from real DB logs without any artificial baselines
    const finalTrends = {};
    const allCitiesKeys = ['Tüm Türkiye', ...allCitiesList];

    allCitiesKeys.forEach(city => {
      const cityReal = trendsByCity[city] || getInitCityData();

      const formatCounts = (dict) => {
        return Object.entries(dict)
          .map(([val, count]) => ({ val, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
      };

      finalTrends[city] = {
        topColors: formatCounts(cityReal.colors),
        topSizes: formatCounts(cityReal.sizes),
        topStyles: formatCounts(cityReal.styles),
        topKeywords: formatCounts(cityReal.keywords)
      };
    });

    return NextResponse.json({
      locked: false,
      plan: currentPlan,
      trendsByCity: finalTrends
    });

  } catch (error) {
    console.error('B2B Trends API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch B2B trends data', details: error.message },
      { status: 500 }
    );
  }
}
