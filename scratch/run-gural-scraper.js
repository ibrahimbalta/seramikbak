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

async function fetchHtmlWithRetry(url, retries = 5, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
          'Referer': 'https://www.guralseramik.com/'
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

// Map category paths to display style names
function getStyleFromCategory(cat) {
  const lower = cat.toLowerCase();
  if (lower.includes('concrete') || lower.includes('beton')) return 'Beton';
  if (lower.includes('natural-stone') || lower.includes('dogal-tas') || lower.includes('taş')) return 'Taş';
  if (lower.includes('marble') || lower.includes('mermer')) return 'Mermer';
  if (lower.includes('wood') || lower.includes('ahsap') || lower.includes('ahşap')) return 'Ahşap';
  return 'Dekor'; // default
}

async function main() {
  console.log('======================================================');
  console.log('         Güral Seramik Ürün Kazıyıcı Script         ');
  console.log('======================================================\n');

  // 1. Markayı bul veya oluştur
  let brand = await prisma.brand.findFirst({
    where: { name: { contains: 'Güral' } }
  });

  if (!brand) {
    console.log('[Veritabanı] "Güral Seramik" markası bulunamadı. Yeni marka oluşturuluyor...');
    brand = await prisma.brand.create({
      data: {
        name: 'Güral Seramik',
        logoUrl: '/brands/gural_seramik.png',
        website: 'https://www.guralseramik.com'
      }
    });
  }

  console.log(`Targeting Brand: ${brand.name} (ID: ${brand.id})`);

  // 2. Tüm serileri çekmek için tum-seriler sayfasını indir
  const mainUrl = 'https://www.guralseramik.com/tum-seriler';
  console.log(`\n[Scraper] Ana seriler listesi çekiliyor: ${mainUrl}...`);
  
  let mainHtml = '';
  try {
    mainHtml = await fetchHtmlWithRetry(mainUrl);
    console.log(`[Scraper] Ana HTML başarıyla çekildi. Boyut: ${mainHtml.length} byte.`);
  } catch (err) {
    console.error('[Hata] Ana sayfa çekilemedi:', err.message);
    process.exit(1);
  }

  // 3. Seriler listesini regex ile bul
  // Örn: /concrete/beton, /marble/aleats vb.
  const seriesLinks = [];
  const linkRegex = /href="(\/(?:concrete|dekor|marble|wood|natural-stone)\/[a-zA-Z0-9-]+)"/gi;
  let match;
  while ((match = linkRegex.exec(mainHtml)) !== null) {
    const link = match[1].trim();
    if (!seriesLinks.includes(link)) {
      seriesLinks.push(link);
    }
  }

  console.log(`[Scraper] Toplam ${seriesLinks.length} adet seramik serisi/koleksiyonu bulundu.`);
  if (seriesLinks.length === 0) {
    console.error('[Hata] Hiç seri linki bulunamadı. İşlem durduruluyor.');
    process.exit(1);
  }

  // 4. Her bir seri sayfasını gezerek ürünleri topla
  const allProducts = [];
  let processedSeries = 0;

  for (const seriesPath of seriesLinks) {
    processedSeries++;
    const seriesUrl = `https://www.guralseramik.com${seriesPath}`;
    console.log(`\n[Seri ${processedSeries}/${seriesLinks.length}] Kazınıyor: ${seriesUrl}...`);
    
    // Polite delay
    await sleep(400);

    try {
      const detailHtml = await fetchHtmlWithRetry(seriesUrl);
      
      // Parse category style
      const categoryStyle = getStyleFromCategory(seriesPath);

      // Split the HTML by collection-product-wrapper to isolate sections by dimensions
      const wrapperRegex = /<div class="collection-product-wrapper">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/gi;
      let wrapperMatch;
      
      while ((wrapperMatch = wrapperRegex.exec(detailHtml)) !== null) {
        const wrapperHtml = wrapperMatch[1];
        
        // Find dimension header (e.g. 60X120 Ürünler)
        const sizeHeaderMatch = wrapperHtml.match(/<h4>(\d+(?:\.\d+)?[xX]\d+(?:\.\d+)?)\s*.*?<\/h4>/i);
        let width = 60;
        let height = 60;
        
        if (sizeHeaderMatch) {
          const dims = sizeHeaderMatch[1].toLowerCase().split('x');
          if (dims.length === 2) {
            width = parseFloat(dims[0]);
            height = parseFloat(dims[1]);
          }
        }

        // Loop items inside this wrapper
        const itemRegex = /<div class="item">[\s\S]*?<a[^>]+>([\s\S]*?)<\/p>\s*<\/a>\s*<\/div>/gi;
        let itemMatch;
        
        while ((itemMatch = itemRegex.exec(wrapperHtml)) !== null) {
          const itemInnerHtml = itemMatch[1];
          
          // Extract data-src (Image)
          const imgMatch = itemInnerHtml.match(/data-src="([^"]+)"/i);
          if (!imgMatch) continue;
          
          let rawImgUrl = imgMatch[1].trim();
          // Clean size parameters from image URL to get high-res original
          let cleanImgUrl = rawImgUrl.split('?')[0];

          // Extract Product Name
          const nameMatch = itemInnerHtml.match(/<p>([\s\S]*?)$/i);
          if (!nameMatch) continue;
          const rawName = nameMatch[1].replace(/<[^>]*>/g, '').trim().replace(/\s+/g, ' ');

          // Extract SKU Code from data-src path (e.g. SRSPALTS60X120FLP120_ALEATS_...)
          const pathParts = cleanImgUrl.split('/');
          const folderName = pathParts[pathParts.length - 2] || '';
          let code = folderName.split('_')[0].trim().toUpperCase();
          
          // Fallback if code extraction fails
          if (!code || code.length < 5 || code.includes('PRODUCT') || code.includes('URUNLER')) {
            const cleanName = rawName.replace(/[^a-zA-Z0-9]/gi, '').substring(0, 5).toUpperCase();
            code = `GRL-${cleanName}-${width}X${height}`;
          }

          // Resolve Color from name
          let color = 'Gri';
          const nameLower = rawName.toLowerCase();
          if (nameLower.includes('grey') || nameLower.includes('gri')) color = 'Gri';
          else if (nameLower.includes('white') || nameLower.includes('beyaz')) color = 'Beyaz';
          else if (nameLower.includes('black') || nameLower.includes('siyah')) color = 'Siyah';
          else if (nameLower.includes('anthracite') || nameLower.includes('antrasit')) color = 'Antrasit';
          else if (nameLower.includes('beige') || nameLower.includes('bej')) color = 'Bej';
          else if (nameLower.includes('brown') || nameLower.includes('kahve')) color = 'Kahverengi';
          else if (nameLower.includes('cream') || nameLower.includes('krem') || nameLower.includes('bone')) color = 'Krem';
          else if (nameLower.includes('gold') || nameLower.includes('altin')) color = 'Altın';
          else if (nameLower.includes('silver') || nameLower.includes('gümüş')) color = 'Gümüş';

          // Resolve Finish
          let finish = 'Mat';
          if (nameLower.includes('parlak') || nameLower.includes('glossy') || nameLower.includes('prk')) finish = 'Parlak';
          else if (nameLower.includes('lappato') || nameLower.includes('flp')) finish = 'Lappato';

          allProducts.push({
            name: `Güral ${rawName} ${width}x${height}`,
            code,
            width,
            height,
            color,
            finish,
            style: categoryStyle,
            rectified: nameLower.includes('rektifiye') || folderName.toUpperCase().includes('REK') || code.endsWith('R'),
            imageUrl: cleanImgUrl,
            textureUrl: cleanImgUrl
          });
        }
      }
      console.log(`[Seri İlerleme] Şu ana kadar toplam ${allProducts.length} adet ürün toplandı.`);
    } catch (err) {
      console.error(`[Seri Hata] ${seriesUrl} kazınamadı:`, err.message);
    }
  }

  console.log(`\n[Scraper] Ürün toplama bitti. Toplam ${allProducts.length} adet ürün ayrıştırıldı.`);

  if (allProducts.length === 0) {
    console.error('[Hata] Hiç ürün toplanamadı. İşlem sonlandırılıyor.');
    process.exit(1);
  }

  // 5. Veritabanına kaydet (upsert)
  console.log(`\n[Veritabanı] ${allProducts.length} adet Güral Seramik ürününün veritabanına kaydedilmesi başlatılıyor...`);
  let addedCount = 0;
  let errorCount = 0;

  for (const prod of allProducts) {
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
      if (addedCount % 50 === 0 || addedCount === allProducts.length) {
        console.log(`[Veritabanı İlerleme] ${addedCount}/${allProducts.length} Güral Seramik ürünü upsert edildi.`);
      }
    } catch (err) {
      errorCount++;
      console.error(`[Veritabanı Hata] Ürün kaydedilemedi: ${prod.name} (SKU: ${prod.code}) - ${err.message}`);
    }
  }

  console.log(`\n[Sistem] ✅ Güral Seramik Entegrasyonu Başarıyla Tamamlandı!`);
  console.log(`[Sistem] 📊 Toplam: ${addedCount} gerçek ürün veritabanına aktarıldı. Hatalı: ${errorCount}`);
}

main().catch(console.error).finally(() => process.exit(0));
