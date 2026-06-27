const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@libsql/client');
const { PrismaLibSQL } = require('@prisma/adapter-libsql');

// Load .env
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) process.env[match[1]] = (match[2] || '').trim();
  });
}

// Init Prisma Client
let prisma;
if (process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN) {
  const libsql = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
  prisma = new PrismaClient({ adapter: new PrismaLibSQL(libsql) });
} else {
  prisma = new PrismaClient();
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithRetry(url, retries = 5, delay = 1500) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://www.hititseramik.com.tr/'
        },
        signal: AbortSignal.timeout(15000)
      });
      if (response.status === 429) throw new Error('HTTP 429 Rate Limited');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response;
    } catch (err) {
      console.log(`[Retry] Error fetching ${url}: ${err.message}. Retrying ${i + 1}/${retries}...`);
      if (i < retries - 1) await sleep(delay);
      else throw err;
    }
  }
}

// Heuristics to resolve style/texture
function getStyleFromTitle(title, path) {
  const lower = (title + ' ' + path).toLowerCase();
  if (lower.includes('dekor') || lower.includes('decor')) return 'Dekor';
  if (lower.includes('ceviz') || lower.includes('meşe') || lower.includes('kayın') || lower.includes('wood') || lower.includes('ahşap') || lower.includes('sail')) return 'Ahşap';
  if (lower.includes('nexos') || lower.includes('concrete') || lower.includes('beton') || lower.includes('cement') || lower.includes('cemento')) return 'Beton';
  if (lower.includes('massa') || lower.includes('blue-burn') || lower.includes('mermer') || lower.includes('marble') || lower.includes('onyx') || lower.includes('calacatta')) return 'Mermer';
  return 'Taş'; // default
}

async function main() {
  console.log('======================================================');
  console.log('         Hitit Seramik & Kalebodur Kaldırma          ');
  console.log('======================================================\n');

  // 1. Remove Kalebodur
  console.log('[Veritabanı] "Kalebodur" markası ve ilişkili tüm veriler temizleniyor...');
  try {
    const delResult = await prisma.brand.deleteMany({
      where: { name: { contains: 'Kalebodur' } }
    });
    console.log(`[Veritabanı] ${delResult.count} adet Kalebodur markası veritabanından başarıyla silindi (ilişkili ürünler cascade ile silindi).`);
  } catch (err) {
    console.error('[Hata] Kalebodur silinirken hata oluştu:', err.message);
  }

  // 2. Create Hitit Seramik Brand
  let brand = await prisma.brand.findFirst({
    where: { name: { contains: 'Hitit' } }
  });

  if (!brand) {
    console.log('[Veritabanı] "Hitit Seramik" markası bulunamadı. Oluşturuluyor...');
    brand = await prisma.brand.create({
      data: {
        id: 'hitit-seramik-brand-id-9988',
        name: 'Hitit Seramik',
        logoUrl: '/brands/hitit_seramik.png'
      }
    });
  }
  console.log(`Targeting Brand: ${brand.name} (ID: ${brand.id})`);

  // 3. Fetch sitemap URLs
  const sitemapUrl = 'https://www.hititseramik.com.tr/sitemap.xml';
  console.log(`\n[Scraper] Sitemap çekiliyor: ${sitemapUrl}...`);
  
  let sitemapXml = '';
  try {
    const res = await fetchWithRetry(sitemapUrl);
    sitemapXml = await res.text();
    console.log(`[Scraper] Sitemap XML başarıyla çekildi. Boyut: ${sitemapXml.length} byte.`);
  } catch (err) {
    console.error('[Hata] Sitemap çekilemedi:', err.message);
    process.exit(1);
  }

  // 4. Parse sitemap for product URLs
  const regex = /<loc>([\s\S]*?)<\/loc>/gi;
  let match;
  const productUrls = [];
  
  while ((match = regex.exec(sitemapXml)) !== null) {
    const url = match[1].trim();
    const lower = url.toLowerCase();
    
    // Filter for actual product detail pages
    if (lower.includes('/urunler/') && 
        !lower.endsWith('/renkler/') && 
        !lower.endsWith('/yuzeyler/') && 
        !lower.endsWith('/dis-mekan/') && 
        !lower.endsWith('/ebatlar/') && 
        !lower.endsWith('/temalar/') &&
        !lower.endsWith('/urunler/')) {
      productUrls.push(url);
    }
  }

  console.log(`[Scraper] Sitemap'te toplam ${productUrls.length} adet ürün detay sayfası URL'i bulundu.`);

  // 5. Scrape each product page
  const parsedProductsMap = new Map();
  let processedPages = 0;

  for (const pageUrl of productUrls) {
    processedPages++;
    if (processedPages % 20 === 0 || processedPages === productUrls.length) {
      console.log(`[İlerleme] Sayfalar taranıyor: ${processedPages}/${productUrls.length}...`);
    }
    
    // Polite delay
    await sleep(200);

    try {
      const res = await fetchWithRetry(pageUrl);
      const html = await res.text();

      // Find fancybox and h1 patterns
      const itemRegex = /<a [^>]*data-fancybox="product-detail-image-gallery"[^>]*href="([^"]+)"[^>]*>[\s\S]*?<h1>([\s\S]*?)<\/h1>/gi;
      let itemMatch;

      while ((itemMatch = itemRegex.exec(html)) !== null) {
        let imgPath = itemMatch[1].trim();
        // Clean query parameters from image path
        let cleanImgUrl = imgPath.split('?')[0];
        if (!cleanImgUrl.startsWith('http')) {
          cleanImgUrl = `https://www.hititseramik.com.tr${cleanImgUrl}`;
        }

        const rawTitle = itemMatch[2].replace(/<[^>]*>/g, '').trim().replace(/\s+/g, ' ');
        
        // Parse Title format: "Nexos Antrasit Lappato | 30x60"
        const parts = rawTitle.split('|');
        const namePart = parts[0].trim();
        const sizePart = parts[1] ? parts[1].trim() : '60x60';

        // Parse dimensions
        let width = 60;
        let height = 60;
        const sizeMatch = sizePart.toLowerCase().match(/^(\d+(?:\.\d+)?)[xX](\d+(?:\.\d+)?)$/);
        if (sizeMatch) {
          width = parseFloat(sizeMatch[1]);
          height = parseFloat(sizeMatch[2]);
        }

        // Generate unique SKU
        const cleanNameSlug = namePart.toUpperCase().replace(/[^A-Z0-9]/g, '-');
        const cleanSizeSlug = sizePart.toUpperCase().replace(/[^A-Z0-9]/g, 'X');
        const skuCode = `HITIT-${cleanNameSlug}-${cleanSizeSlug}`;

        // Deduplicate
        if (parsedProductsMap.has(skuCode)) continue;

        // Resolve style
        const style = getStyleFromTitle(namePart, pageUrl);

        // Resolve color
        let color = 'Gri';
        const nameLower = namePart.toLowerCase();
        if (nameLower.includes('grey') || nameLower.includes('gri') || nameLower.includes('antrasit') || nameLower.includes('anthracite')) color = 'Gri';
        else if (nameLower.includes('white') || nameLower.includes('beyaz')) color = 'Beyaz';
        else if (nameLower.includes('black') || nameLower.includes('siyah')) color = 'Siyah';
        else if (nameLower.includes('beige') || nameLower.includes('bej')) color = 'Bej';
        else if (nameLower.includes('brown') || nameLower.includes('kahve') || nameLower.includes('ahşap') || nameLower.includes('kayın') || nameLower.includes('meşe') || nameLower.includes('ceviz')) color = 'Kahverengi';
        else if (nameLower.includes('krem') || nameLower.includes('cream') || nameLower.includes('grej') || nameLower.includes('taupe')) color = 'Bej';
        else if (nameLower.includes('olive') || nameLower.includes('yeşil')) color = 'Yeşil';

        // Resolve finish
        let finish = 'Mat';
        if (nameLower.includes('lappato')) finish = 'Lappato';
        else if (nameLower.includes('parlak') || nameLower.includes('polished') || nameLower.includes('fullpolished')) finish = 'Parlak';

        parsedProductsMap.set(skuCode, {
          name: `Hitit ${namePart} ${sizePart}`,
          code: skuCode,
          width,
          height,
          color,
          finish,
          style,
          rectified: true, // Hitit products are rectified rectified
          imageUrl: cleanImgUrl,
          textureUrl: cleanImgUrl
        });
      }
    } catch (err) {
      console.error(`[Sayfa Hata] ${pageUrl} taranamadı:`, err.message);
    }
  }

  const productsList = Array.from(parsedProductsMap.values());
  console.log(`\n[Scraper] Toplam ${productsList.length} adet benzersiz Hitit Seramik ürünü ayrıştırıldı.`);

  if (productsList.length === 0) {
    console.error('[Hata] Hiç ürün toplanamadı. İşlem sonlandırılıyor.');
    process.exit(1);
  }

  // 6. Save products into database
  console.log(`\n[Veritabanı] ${productsList.length} adet Hitit Seramik ürününün veritabanına kaydedilmesi başlatılıyor...`);
  let addedCount = 0;
  let errorCount = 0;

  for (const prod of productsList) {
    try {
      await prisma.product.upsert({
        where: { code: prod.code },
        update: {
          name: prod.name,
          imageUrl: prod.imageUrl,
          textureUrl: prod.textureUrl,
          width: prod.width,
          height: prod.height,
          color: prod.color,
          finish: prod.finish,
          style: prod.style,
          rectified: prod.rectified,
        },
        create: {
          name: prod.name,
          code: prod.code,
          brandId: brand.id,
          width: prod.width,
          height: prod.height,
          color: prod.color,
          finish: prod.finish,
          style: prod.style,
          area: 'Yer,Duvar,Mutfak,Banyo',
          imageUrl: prod.imageUrl,
          textureUrl: prod.textureUrl,
          isPremium: false,
          rectified: prod.rectified || false,
        }
      });
      addedCount++;
      if (addedCount % 20 === 0 || addedCount === productsList.length) {
        console.log(`[Veritabanı İlerleme] ${addedCount}/${productsList.length} Hitit Seramik ürünü upsert edildi.`);
      }
    } catch (err) {
      errorCount++;
      console.error(`[Veritabanı Hata] Ürün kaydedilemedi: ${prod.name} (SKU: ${prod.code}) - ${err.message}`);
    }
  }

  console.log(`\n[Sistem] ✅ Hitit Seramik Entegrasyonu Başarıyla Tamamlandı!`);
  console.log(`[Sistem] 📊 Toplam: ${addedCount} gerçek ürün veritabanına aktarıldı. Hatalı: ${errorCount}`);
}

main().catch(console.error).finally(() => process.exit(0));
