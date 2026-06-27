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

// Dictionaries for style determination
const WOOD_KEYWORDS = ['wood', 'ahsap', 'ahşap', 'oak', 'ceviz', 'teak', 'larch', 'timber', 'parke', 'forest'];
const STONE_KEYWORDS = ['stone', 'tas', 'taş', 'slate', 'rock', 'quarry', 'granite', 'travertine', 'pietra', 'slate'];
const CEMENT_KEYWORDS = ['cement', 'beton', 'concrete', 'loft', 'terrazzo', 'agrega', 'blok'];
const MARBLE_KEYWORDS = ['marble', 'mermer', 'calacatta', 'carrara', 'onyx', 'afyon', 'akoya', 'dorado', 'luxe'];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchHtmlWithRetry(url, retries = 5, delay = 2500) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7'
        },
        signal: AbortSignal.timeout(15000)
      });
      if (response.status === 429) {
        throw new Error('HTTP 429 Rate Limited');
      }
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.text();
    } catch (err) {
      console.log(`[Fetch Retry] Error fetching ${url}: ${err.message}. Retrying ${i + 1}/${retries}...`);
      if (i < retries - 1) {
        await sleep(delay);
      } else {
        throw err;
      }
    }
  }
}

async function main() {
  console.log('======================================================');
  console.log('          Yurtbay Seramik Ürün Kazıyıcı Script        ');
  console.log('======================================================\n');

  // 1. Yurtbay Seramik Markasını bul veya oluştur
  let brand = await prisma.brand.findFirst({
    where: { name: { contains: 'Yurtbay' } }
  });

  if (!brand) {
    console.log('[Veritabanı] "Yurtbay Seramik" markası bulunamadı. Yeni marka oluşturuluyor...');
    brand = await prisma.brand.create({
      data: {
        id: 'yurtbay-seramik-brand-id-4455',
        name: 'Yurtbay Seramik',
        logoUrl: '/brands/yurtbay_seramik.png',
        website: 'https://www.yurtbayseramik.com'
      }
    });
  }

  console.log(`Targeting Brand: ${brand.name} (ID: ${brand.id})`);

  // 2. Fetch main page to get all series links
  const mainUrl = 'https://www.yurtbayseramik.com/tr/urunler';
  console.log(`\n[Scraper] Ana sayfa çekiliyor: ${mainUrl}...`);
  let mainHtml = '';
  try {
    mainHtml = await fetchHtmlWithRetry(mainUrl);
    console.log(`[Scraper] Ana sayfa başarıyla çekildi. Boyut: ${mainHtml.length} byte.`);
  } catch (err) {
    console.error('[Hata] Ana sayfa çekilemedi:', err.message);
    process.exit(1);
  }

  // Parse series names and slugs
  const seriesRegex = /href="https:\/\/www\.yurtbayseramik\.com\/tr\/urunler\/seriler\/([^"]+)"[\s\S]*?alt="([^"]+)"/gi;
  let match;
  const seriesList = [];
  const seenSeries = new Set();

  while ((match = seriesRegex.exec(mainHtml)) !== null) {
    const slug = match[1].trim();
    const title = match[2].trim().toUpperCase();
    if (!seenSeries.has(slug)) {
      seenSeries.add(slug);
      seriesList.push({ slug, title });
    }
  }

  console.log(`[Scraper] Toplam ${seriesList.length} adet seramik serisi tespit edildi.`);

  if (seriesList.length === 0) {
    console.error('[Hata] Seriler ayrıştırılamadı.');
    process.exit(1);
  }

  // 3. Obtain CSRF Token and Session Cookies
  const sampleUrl = `https://www.yurtbayseramik.com/tr/urunler/seriler/${seriesList[0].slug}`;
  console.log(`\n[CSRF] CSRF token ve Cookie'leri almak için örnek sayfa çekiliyor: ${sampleUrl}...`);
  
  let csrfToken = '';
  let cookieHeader = '';
  try {
    const pageResponse = await fetch(sampleUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    if (!pageResponse.ok) {
      throw new Error(`HTTP ${pageResponse.status}`);
    }
    
    const html = await pageResponse.text();
    const csrfMatch = html.match(/<meta[^>]+name="csrf-token"[^>]+content="([^"]+)"/i);
    csrfToken = csrfMatch ? csrfMatch[1] : null;
    
    const rawCookies = pageResponse.headers.getSetCookie();
    cookieHeader = rawCookies.map(c => c.split(';')[0]).join('; ');
    
    console.log(`[CSRF] Token Alındı: ${csrfToken}`);
    console.log(`[CSRF] Cookie Başlığı: ${cookieHeader.substring(0, 80)}...`);
  } catch (err) {
    console.error('[Hata] CSRF token veya Cookie alınamadı:', err.message);
    process.exit(1);
  }

  if (!csrfToken || !cookieHeader) {
    console.error('[Hata] CSRF/Cookie eksik.');
    process.exit(1);
  }

  // 4. Loop series and post to filterProducts
  console.log(`\n[Scraper] Serilere ait tekil ürünler AJAX API ile çekiliyor...`);
  const parsedProducts = [];
  const seenCodes = new Set();
  let successCount = 0;
  let failCount = 0;

  for (let idx = 0; idx < seriesList.length; idx++) {
    const series = seriesList[idx];
    console.log(`[${idx + 1}/${seriesList.length}] Seri yükleniyor: ${series.title} (${series.slug})`);
    
    await sleep(100); // 100ms polite delay

    try {
      const apiUrl = 'https://www.yurtbayseramik.com/tr/filterProducts';
      const apiResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': csrfToken,
          'Cookie': cookieHeader,
          'Referer': `https://www.yurtbayseramik.com/tr/urunler/seriler/${series.slug}`,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        body: new URLSearchParams({
          seri: series.title
        })
      });

      if (!apiResponse.ok) {
        throw new Error(`API HTTP ${apiResponse.status}`);
      }

      const json = await apiResponse.json();
      const renderHtml = json.render || '';
      
      // Parse individual product cards from response.render
      // <div class="item" data-id="S25270">...<img src="...S25270_1.jpg">...<h2>45x45 Afyon Beyaz Parlak</h2>...<h3>Sırlı Granit</h3>
      const cardRegex = /<div[^>]+class="[^"]*item[^"]*"[^>]*data-id="([^"]+)"[\s\S]*?<img[^>]+src="([^"]+)"[\s\S]*?<h2[^>]*>([\s\S]*?)<\/h2>[\s\S]*?<h3[^>]*>([\s\S]*?)<\/h3>/gi;
      
      let cardMatch;
      let seriesProdCount = 0;

      while ((cardMatch = cardRegex.exec(renderHtml)) !== null) {
        const dataId = cardMatch[1].trim();
        const rawImgUrl = cardMatch[2].trim();
        const rawTitle = cardMatch[3].replace(/<[^>]*>/g, '').trim().replace(/\s+/g, ' ');
        const rawType = cardMatch[4].replace(/<[^>]*>/g, '').trim().replace(/\s+/g, ' ');

        const code = dataId.toUpperCase();
        if (seenCodes.has(code)) continue;
        seenCodes.add(code);

        // Parse dimensions (e.g. "45x45 Afyon Beyaz Parlak")
        let width = 60;
        let height = 60;
        let sizeString = '60x60';
        const sizeMatch = rawTitle.match(/(\d+(?:\.\d+)?)\s*[xX]\s*(\d+(?:\.\d+)?)/);
        if (sizeMatch) {
          width = parseFloat(sizeMatch[1]);
          height = parseFloat(sizeMatch[2]);
          sizeString = `${sizeMatch[1]}x${sizeMatch[2]}`;
        }

        // Clean name (remove dimensions and extra spaces)
        let cleanName = rawTitle.replace(/(\d+(?:\.\d+)?)\s*[xX]\s*(\d+(?:\.\d+)?)/, '').trim();

        // Resolve color
        let color = 'Gri';
        const titleLower = rawTitle.toLowerCase();
        if (titleLower.includes('beyaz') || titleLower.includes('white')) color = 'Beyaz';
        else if (titleLower.includes('gri') || titleLower.includes('grey')) color = 'Gri';
        else if (titleLower.includes('kahve') || titleLower.includes('brown')) color = 'Kahverengi';
        else if (titleLower.includes('siyah') || titleLower.includes('black')) color = 'Siyah';
        else if (titleLower.includes('bej') || titleLower.includes('beige')) color = 'Bej';
        else if (titleLower.includes('mavi') || titleLower.includes('blue')) color = 'Mavi';
        else if (titleLower.includes('yeşil') || titleLower.includes('yesil') || titleLower.includes('green')) color = 'Yeşil';
        else if (titleLower.includes('antrasit') || titleLower.includes('anthracite')) color = 'Antrasit';
        else if (titleLower.includes('krem') || titleLower.includes('cream')) color = 'Krem';
        else if (titleLower.includes('altin') || titleLower.includes('altın') || titleLower.includes('gold')) color = 'Altın';
        else if (titleLower.includes('fildisi') || titleLower.includes('fildişi') || titleLower.includes('ivory')) color = 'Fildişi';

        // Resolve finish
        let finish = 'Mat';
        if (titleLower.includes('parlak') || titleLower.includes('glossy') || titleLower.includes('shine')) finish = 'Parlak';
        else if (titleLower.includes('lappato') || titleLower.includes('lapatto')) finish = 'Lappato';
        else if (titleLower.includes('antislip') || titleLower.includes('kaymaz')) finish = 'Mat (Kaymaz)';

        // Resolve style
        let style = 'Mermer';
        const allLower = rawTitle.toLowerCase() + ' ' + rawType.toLowerCase() + ' ' + series.title.toLowerCase();
        if (WOOD_KEYWORDS.some(k => allLower.includes(k))) style = 'Ahşap';
        else if (STONE_KEYWORDS.some(k => allLower.includes(k))) style = 'Taş';
        else if (CEMENT_KEYWORDS.some(k => allLower.includes(k))) style = 'Beton';
        else if (MARBLE_KEYWORDS.some(k => allLower.includes(k))) style = 'Mermer';

        // High-res image conversion (replace urun_320 with urun_768 for better textures)
        const highResImg = rawImgUrl.replace('/urun_320/', '/urun_768/');

        // Display Name
        const displayName = `Yurtbay ${cleanName} ${sizeString}`;

        parsedProducts.push({
          name: displayName,
          code: code,
          width,
          height,
          color,
          finish,
          style,
          rectified: titleLower.includes('rektifiye') || titleLower.includes('rek') || code.endsWith('R') || code.endsWith('RN'),
          imageUrl: highResImg,
          textureUrl: highResImg,
          sourceUrl: `https://www.yurtbayseramik.com/tr/urunler/seriler/${series.slug}`
        });

        seriesProdCount++;
      }

      successCount++;
      if (seriesProdCount > 0) {
        console.log(`   -> Başarıyla tarandı. Bulunan ürün: ${seriesProdCount}. Toplam toplanan: ${parsedProducts.length}`);
      }
    } catch (err) {
      failCount++;
      console.log(`[Uyarı] ${series.title} ürünleri çekilemedi: ${err.message}`);
    }
  }

  console.log(`\n[Scraper] Tarama bitti. Başarılı seri: ${successCount} | Hatalı seri: ${failCount}`);
  console.log(`[Scraper] Toplam ${parsedProducts.length} adet benzersiz ürün ayrıştırıldı.`);

  if (parsedProducts.length === 0) {
    console.log('[Hata] Hiç ürün toplanamadı.');
    process.exit(1);
  }

  // 5. Veritabanına kaydet (upsert)
  console.log(`\n[Veritabanı] Eski mock (YURT-*) Yurtbay Seramik ürünleri temizleniyor...`);
  try {
    const deleteResult = await prisma.product.deleteMany({
      where: {
        brandId: brand.id,
        code: {
          startsWith: 'YURT-'
        }
      }
    });
    console.log(`[Veritabanı] ${deleteResult.count} adet eski mock Yurtbay Seramik ürünü silindi.`);
  } catch (err) {
    console.error('[Veritabanı Hata] Eski mock ürünler silinemedi:', err.message);
  }

  console.log(`\n[Veritabanı] ${parsedProducts.length} adet Yurtbay Seramik ürününün veritabanına kaydedilmesi başlatılıyor...`);
  let addedCount = 0;
  let errorCount = 0;

  for (const prod of parsedProducts) {
    try {
      const dbProduct = await prisma.product.upsert({
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
      if (addedCount % 50 === 0 || addedCount === parsedProducts.length) {
        console.log(`[Veritabanı İlerleme] ${addedCount}/${parsedProducts.length} Yurtbay Seramik ürünü upsert edildi.`);
      }
    } catch (err) {
      errorCount++;
      console.error(`[Veritabanı Hata] Ürün kaydedilemedi: ${prod.name} (SKU: ${prod.code}) - ${err.message}`);
    }
  }

  console.log(`\n[Sistem] ✅ Yurtbay Seramik Entegrasyonu Başarıyla Tamamlandı!`);
  console.log(`[Sistem] 📊 Toplam: ${addedCount} gerçek ürün veritabanına aktarıldı. Hatalı: ${errorCount}`);
}

main().catch(console.error).finally(() => process.exit(0));
