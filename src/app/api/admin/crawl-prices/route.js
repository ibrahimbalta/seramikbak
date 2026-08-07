import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { fetchHtml, extractPriceFromHtml, searchProductUrlViaGoogle } from '@/lib/priceScraper';

export async function POST(request) {
  const logs = [];
  let updatedCount = 0;

  try {
    const body = await request.json().catch(() => ({}));
    const { productId, limit = 5, offset = 0 } = body;

    let products = [];
    let totalCount = 0;
    if (productId) {
      const p = await prisma.product.findUnique({
        where: { id: productId },
        include: { brand: true }
      });
      if (p) products = [p];
      totalCount = products.length;
    } else {
      totalCount = await prisma.product.count();
      products = await prisma.product.findMany({
        take: limit,
        skip: offset,
        orderBy: { id: 'asc' },
        include: { brand: true }
      });
    }

    if (products.length === 0) {
      return NextResponse.json({ success: true, count: 0, remaining: 0, logs: ['[Fiyat Botu] Güncellenecek ürün kalmadı.'] });
    }

    // Load proxy & serper API keys from database settings
    const settings = await prisma.systemSetting.findMany();
    const settingsMap = {};
    settings.forEach(s => {
      settingsMap[s.key] = s.value;
    });
    
    const dbScrapingKey = settingsMap['scraping_api_key'];
    const scrapingApiKey = dbScrapingKey || process.env.SCRAPING_API_KEY;

    const dbSerperKey = settingsMap['serper_api_key'];
    const serperApiKey = dbSerperKey || process.env.SERPER_API_KEY;

    const remaining = Math.max(0, totalCount - (offset + products.length));
    logs.push(`[Fiyat Botu] Sıra: ${offset + 1} - ${offset + products.length} (Kalan: ${remaining}) | Toplam ${totalCount} üründen ${products.length} adedi taranıyor...`);
    
    if (scrapingApiKey) {
      logs.push(`[Sistem] Güvenlik duvarı aşımı için Scrape.do proxy servisi aktif.`);
    } else {
      logs.push(`[Uyarı] Proxy API anahtarı (Ayarlar veya .env altında SCRAPING_API_KEY) tanımlanmadığı için doğrudan istek atılacak.`);
    }

    if (serperApiKey) {
      logs.push(`[Sistem] Akıllı ilan bulma için Serper.dev Google Arama API servisi aktif.`);
    }

    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      logs.push(`[Tarama] SKU: ${p.code} | "${p.brand?.name || ''} ${p.name}" taranıyor...`);

      // Helper to crawl and discover direct product URLs
      const crawlVendorPrice = async (vendorKey, label, domain, defaultSearchUrl, currentPrice, currentUrl) => {
        let targetUrl = currentUrl;
        
        // If current URL is missing or just a search query URL, try Google Search for direct link
        const isSearchUrl = !targetUrl || 
          targetUrl.includes('/sr?q=') || 
          targetUrl.includes('/ara?q=') || 
          targetUrl.includes('/arama?q=') || 
          targetUrl.includes('/search?q=');

        if (isSearchUrl) {
          const searchQuery = `${p.brand?.name || ''} ${p.name}`.trim();
          const discoveredUrl = await searchProductUrlViaGoogle(searchQuery, domain, serperApiKey, scrapingApiKey);
          if (discoveredUrl) {
            logs.push(`[Google Serper] ${label}: Doğrudan ürün linki otomatik bulundu -> ${discoveredUrl}`);
            targetUrl = discoveredUrl;
          } else {
            targetUrl = defaultSearchUrl;
          }
        }

        try {
          const html = await fetchHtml(targetUrl, scrapingApiKey);
          const price = extractPriceFromHtml(html, targetUrl);
          if (price && price > 0) {
            logs.push(`[Eşleşti] ${label}: Canlı fiyat çekildi -> ${price} TL`);
            return { price, url: targetUrl };
          } else {
            logs.push(`[Bilgi] ${label}: Sayfada güncel fiyat bulunamadı.`);
            return { 
              price: productId ? null : (currentPrice || null), 
              url: targetUrl && !targetUrl.includes('?q=') ? targetUrl : null 
            };
          }
        } catch (err) {
          if (err.message.includes('404')) {
            logs.push(`[Bilgi] ${label}: Ürün bu pazaryerinde bulunamadı (404 Not Found).`);
          } else {
            logs.push(`[Engellendi/Hata] ${label}: Bağlantı engellendi veya hata oluştu (${err.message}).`);
          }
          return { 
            price: productId ? null : (currentPrice || null), 
            url: targetUrl && !targetUrl.includes('?q=') ? targetUrl : null 
          };
        }
      };

      // Crawl each marketplace in parallel
      const [tyRes, hbRes, n11Res, kcRes, bhRes, yedRes] = await Promise.all([
        crawlVendorPrice('trendyol', 'Trendyol', 'trendyol.com', `https://www.trendyol.com/sr?q=${encodeURIComponent(p.code)}`, p.trendyolPrice, p.trendyolUrl),
        crawlVendorPrice('hepsiburada', 'Hepsiburada', 'hepsiburada.com', `https://www.hepsiburada.com/ara?q=${encodeURIComponent(p.code)}`, p.hepsiburadaPrice, p.hepsiburadaUrl),
        crawlVendorPrice('n11', 'n11', 'n11.com', `https://www.n11.com/arama?q=${encodeURIComponent(p.code)}`, p.n11Price, p.n11Url),
        crawlVendorPrice('koctas', 'Koçtaş', 'koctas.com.tr', `https://www.koctas.com.tr/search?q=${encodeURIComponent(p.code)}`, p.koctasPrice, p.koctasUrl),
        crawlVendorPrice('bauhaus', 'Bauhaus', 'bauhaus.com.tr', `https://www.bauhaus.com.tr/arama?q=${encodeURIComponent(p.code)}`, p.bauhausPrice, p.bauhausUrl),
        crawlVendorPrice('yerevdekor', 'YerEvDekor', 'yerevdekor.com', `https://www.yerevdekor.com/arama?q=${encodeURIComponent(p.code)}`, p.yerevdekorPrice, p.yerevdekorUrl)
      ]);

      // 2. Update Database with discovered links & live prices
      const updatedProduct = await prisma.product.update({
        where: { id: p.id },
        data: {
          trendyolPrice: tyRes.price || null,
          trendyolUrl: tyRes.url || null,
          hepsiburadaPrice: hbRes.price || null,
          hepsiburadaUrl: hbRes.url || null,
          n11Price: n11Res.price || null,
          n11Url: n11Res.url || null,
          koctasPrice: kcRes.price || null,
          koctasUrl: kcRes.url || null,
          bauhausPrice: bhRes.price || null,
          bauhausUrl: bhRes.url || null,
          yerevdekorPrice: yedRes.price || null,
          yerevdekorUrl: yedRes.url || null
        },
        include: {
          brand: {
            select: { id: true, name: true, logoUrl: true }
          }
        }
      });

      updatedCount++;
      if (productId) {
        logs.push(`[Tamamlandı] ${updatedProduct.name} için canlı fiyatlar ve ilan linkleri güncellendi.`);
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

