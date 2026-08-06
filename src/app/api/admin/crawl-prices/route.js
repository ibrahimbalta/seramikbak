import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { fetchHtml, extractPriceFromHtml } from '@/lib/priceScraper';

export async function POST(request) {
  const logs = [];
  let updatedCount = 0;

  try {
    const body = await request.json().catch(() => ({}));
    const { productId, limit = 5, offset = 0 } = body;

    let products = [];
    let totalCount = 0;
    if (productId) {
      const p = await prisma.product.findUnique({ where: { id: productId } });
      if (p) products = [p];
      totalCount = products.length;
    } else {
      totalCount = await prisma.product.count();
      products = await prisma.product.findMany({
        take: limit,
        skip: offset,
        orderBy: { id: 'asc' }
      });
    }

    if (products.length === 0) {
      return NextResponse.json({ success: true, count: 0, remaining: 0, logs: ['[Fiyat Botu] Güncellenecek ürün kalmadı.'] });
    }

    // Load proxy API key from database settings
    const settings = await prisma.systemSetting.findMany();
    const settingsMap = {};
    settings.forEach(s => {
      settingsMap[s.key] = s.value;
    });
    
    const dbScrapingKey = settingsMap['scraping_api_key'];
    const scrapingApiKey = dbScrapingKey || process.env.SCRAPING_API_KEY;

    const remaining = Math.max(0, totalCount - (offset + products.length));
    logs.push(`[Fiyat Botu] Sıra: ${offset + 1} - ${offset + products.length} (Kalan: ${remaining}) | Toplam ${totalCount} üründen ${products.length} adedi taranıyor...`);
    
    if (scrapingApiKey) {
      logs.push(`[Sistem] Güvenlik duvarı aşımı için Scrape.do proxy servisi aktif.`);
    } else {
      logs.push(`[Uyarı] Proxy API anahtarı (Ayarlar veya .env altında SCRAPING_API_KEY) tanımlanmadığı için doğrudan istek atılacak. Engellenme olasılığı yüksektir.`);
    }

    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      logs.push(`[Tarama] SKU: ${p.code} | "${p.name}" taranıyor...`);

      // Define target URLs for scraping (search query used for scraping only)
      const tyScrapeUrl = p.trendyolUrl || `https://www.trendyol.com/sr?q=${encodeURIComponent(p.code)}`;
      const hbScrapeUrl = p.hepsiburadaUrl || `https://www.hepsiburada.com/ara?q=${encodeURIComponent(p.code)}`;
      const n11ScrapeUrl = p.n11Url || `https://www.n11.com/arama?q=${encodeURIComponent(p.code)}`;
      const kcScrapeUrl = p.koctasUrl || `https://www.koctas.com.tr/search?q=${encodeURIComponent(p.code)}`;
      const bhScrapeUrl = p.bauhausUrl || `https://www.bauhaus.com.tr/arama?q=${encodeURIComponent(p.code)}`;

      // Helper to fetch price cleanly without fake math fallbacks
      const getLivePrice = async (url, label, previousPrice) => {
        try {
          const html = await fetchHtml(url, scrapingApiKey);
          const price = extractPriceFromHtml(html, url);
          if (price && price > 0) {
            logs.push(`[Eşleşti] ${label}: Canlı fiyat çekildi -> ${price} TL`);
            return price;
          } else {
            logs.push(`[Bilgi] ${label}: Sayfada listeli fiyat bulunamadı.`);
            return previousPrice || null;
          }
        } catch (err) {
          if (err.message.includes('404')) {
            logs.push(`[Bilgi] ${label}: Ürün bu pazaryerinde bulunamadı (404 Not Found).`);
          } else {
            logs.push(`[Engellendi/Hata] ${label}: Bağlantı engellendi veya hata oluştu (${err.message}).`);
          }
          return previousPrice || null;
        }
      };

      // Crawl each marketplace in parallel to prevent Next.js request timeouts
      const [trendyolPrice, hepsiburadaPrice, n11Price, koctasPrice, bauhausPrice] = await Promise.all([
        getLivePrice(tyScrapeUrl, 'Trendyol', p.trendyolPrice),
        getLivePrice(hbScrapeUrl, 'Hepsiburada', p.hepsiburadaPrice),
        getLivePrice(n11ScrapeUrl, 'n11', p.n11Price),
        getLivePrice(kcScrapeUrl, 'Koçtaş', p.koctasPrice),
        getLivePrice(bhScrapeUrl, 'Bauhaus', p.bauhausPrice)
      ]);

      // 2. Update Database (only save specific direct product URLs if real price exists or URL was explicitly stored)
      const updatedProduct = await prisma.product.update({
        where: { id: p.id },
        data: {
          trendyolPrice: trendyolPrice || null,
          trendyolUrl: p.trendyolUrl || null,
          hepsiburadaPrice: hepsiburadaPrice || null,
          hepsiburadaUrl: p.hepsiburadaUrl || null,
          n11Price: n11Price || null,
          n11Url: p.n11Url || null,
          koctasPrice: koctasPrice || null,
          koctasUrl: p.koctasUrl || null,
          bauhausPrice: bauhausPrice || null,
          bauhausUrl: p.bauhausUrl || null
        },
        include: {
          brand: {
            select: { id: true, name: true, logoUrl: true }
          }
        }
      });

      updatedCount++;
      if (productId) {
        logs.push(`[Tamamlandı] ${updatedProduct.name} için canlı fiyatlar güncellendi.`);
        return NextResponse.json({
          success: true,
          count: 1,
          remaining: 0,
          product: updatedProduct,
          logs
        });
      }
    }

    logs.push(`[Tamamlandı] Fiyat güncelleme botu başarıyla tamamlandı. ${updatedCount} ürün güncellendi.`);

    return NextResponse.json({
      success: true,
      count: updatedCount,
      remaining,
      logs
    });

  } catch (error) {
    console.error('[Crawl Prices API Error]', error);
    logs.push(`[Hata] Fiyat tarama botu başarısız oldu: ${error.message}`);
    return NextResponse.json({ success: false, error: error.message, logs }, { status: 500 });
  }
}
