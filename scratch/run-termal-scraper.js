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

async function fetchWithRetry(url, retries = 3, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7'
        },
        signal: AbortSignal.timeout(15000)
      });
      if (response.status === 429) {
        throw new Error('HTTP 429 Too Many Requests');
      }
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.text();
    } catch (err) {
      console.log(`[Retry] Error fetching ${url}: ${err.message}. Retrying ${i + 1}/${retries}...`);
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
  console.log('         Termal Seramik Ürün Kazıyıcı Script          ');
  console.log('======================================================\n');

  // Find or create Termal Seramik brand
  let brand = await prisma.brand.findFirst({
    where: { name: { contains: 'Termal' } }
  });

  if (!brand) {
    console.log('[Veritabanı] "Termal Seramik" markası bulunamadı. Yeni oluşturuluyor...');
    brand = await prisma.brand.create({
      data: {
        name: 'Termal Seramik',
        logoUrl: '/logos/termal.png',
        username: 'termal',
        password: 'termal123'
      }
    });
  }

  console.log(`Target Brand: ${brand.name} (ID: ${brand.id})`);

  // Fetch product sitemap
  console.log('\n[Scraper] Product sitemap XML dosyası indiriliyor...');
  let sitemapXml = '';
  try {
    sitemapXml = await fetchWithRetry('https://www.termalseramik.com.tr/product-sitemap.xml');
  } catch (err) {
    console.error('[Hata] Sitemap indirilemedi:', err.message);
    process.exit(1);
  }

  // Parse URLs
  const urls = [];
  const locRegex = /<loc>([^<]+)<\/loc>/g;
  let match;
  while ((match = locRegex.exec(sitemapXml)) !== null) {
    // Filter out shop, checkout, cart or other generic endpoints
    const url = match[1];
    if (url.includes('/urun/') && !url.includes('/shop') && !url.includes('/cart')) {
      urls.add ? urls.add(url) : urls.push(url);
    }
  }

  const uniqueUrls = [...new Set(urls)];
  console.log(`[Scraper] Toplam ${uniqueUrls.length} adet ürün sayfası URL'si bulundu.`);

  // Limit number of products to scrape to prevent infinite run/rate limit issues
  // Let's scrape up to 100 products for a rich representation
  const maxProducts = 100;
  const urlsToScrape = uniqueUrls.slice(0, maxProducts);
  console.log(`[Scraper] Bu çalıştırmada ${urlsToScrape.length} ürün sayfası kazınacak.`);

  let successCount = 0;

  for (let idx = 0; idx < urlsToScrape.length; idx++) {
    const url = urlsToScrape[idx];
    console.log(`\n[${idx + 1}/${urlsToScrape.length}] Kazınıyor: ${url}`);
    
    try {
      const html = await fetchWithRetry(url);
      
      // 1. Name (from H1 tag)
      let name = '';
      const h1Match = html.match(/<h1[^>]*class="[^"]*product_title[^"]*"[^>]*>([^<]+)<\/h1>/i) 
                   || html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
      if (h1Match) {
        name = h1Match[1].trim();
      } else {
        // Fallback to title tag
        const titleMatch = html.match(/<title>([^<]+)<\/title>/);
        if (titleMatch) name = titleMatch[1].split('-')[0].trim();
      }

      if (!name) {
        console.log('   [Atlandı] Ürün ismi bulunamadı.');
        continue;
      }

      // 2. Image Url
      let imageUrl = '';
      const imgMatch = html.match(/class="[^"]*woocommerce-product-gallery__image[^"]*"[^>]*>.*?href="([^"]+)"/i) 
                    || html.match(/class="[^"]*wp-post-image[^"]*"[^>]*src="([^"]+)"/i)
                    || html.match(/<img[^>]+src="([^"]+wp-content\/uploads\/[^"]+)"/i);
      if (imgMatch) {
        imageUrl = imgMatch[1];
      }

      if (!imageUrl || imageUrl.includes('logooo.png')) {
        console.log('   [Atlandı] Geçerli ürün görseli bulunamadı.');
        continue;
      }

      // 3. Technical Specs (Dimensions, Color, etc.)
      let width = 60;
      let height = 60;
      let color = 'Gri';
      let finish = 'Mat';
      let style = 'Modern';

      // Parse dimensions (pa_boyut or text matching dimension format like 60x60, 30x60, 60.5x60.5)
      const dimensionsMatch = html.match(/Boyut<\/th>\s*<td[^>]*><p>([^<]+)<\/p>/i)
                           || html.match(/Boyut<\/th>\s*<td[^>]*>([^<]+)<\/td>/i)
                           || html.match(/(\d+(?:\.\d+)?)\s*(?:x|&#215;|&#xd7;)\s*(\d+(?:\.\d+)?)/i);
      
      if (dimensionsMatch) {
        // Try parsing width & height
        const dimStr = dimensionsMatch[1].replace('&#215;', 'x').replace('&#xd7;', 'x');
        const parts = dimStr.split('x');
        if (parts.length === 2) {
          width = parseFloat(parts[0].replace(',', '.')) || 60;
          height = parseFloat(parts[1].replace(',', '.')) || 60;
        } else {
          // Check if regex captured width/height as groups
          const dimRegex = /(\d+(?:\.\d+)?)\s*(?:x|&#215;|&#xd7;|×)\s*(\d+(?:\.\d+)?)/i;
          const matchCap = html.match(dimRegex);
          if (matchCap) {
            width = parseFloat(matchCap[1]) || 60;
            height = parseFloat(matchCap[2]) || 60;
          }
        }
      }

      // Parse color (pa_renk)
      const colorMatch = html.match(/Renk<\/th>\s*<td[^>]*><p>([^<]+)<\/p>/i)
                      || html.match(/Renk<\/th>\s*<td[^>]*>([^<]+)<\/td>/i);
      if (colorMatch) {
        color = colorMatch[1].trim();
        if (color === 'Tek Renk') {
          // Try guessing color from product name
          const lowerName = name.toLowerCase();
          if (lowerName.includes('grey') || lowerName.includes('gri')) color = 'Gri';
          else if (lowerName.includes('white') || lowerName.includes('beyaz')) color = 'Beyaz';
          else if (lowerName.includes('beige') || lowerName.includes('bej')) color = 'Bej';
          else if (lowerName.includes('brown') || lowerName.includes('kahve')) color = 'Kahverengi';
          else if (lowerName.includes('black') || lowerName.includes('siyah')) color = 'Siyah';
        }
      }

      // Guess style based on name
      const lowerName = name.toLowerCase();
      if (lowerName.includes('wood') || lowerName.includes('ahşap')) style = 'Ahşap';
      else if (lowerName.includes('marble') || lowerName.includes('mermer') || lowerName.includes('calacatta') || lowerName.includes('carrara')) style = 'Mermer';
      else if (lowerName.includes('stone') || lowerName.includes('taş') || lowerName.includes('rock') || lowerName.includes('slate')) style = 'Taş';
      else if (lowerName.includes('concrete') || lowerName.includes('beton') || lowerName.includes('cement')) style = 'Beton';

      // Parse finish or guess
      if (lowerName.includes('parlak') || lowerName.includes('glossy') || lowerName.includes('pol-')) finish = 'Parlak';
      else if (lowerName.includes('lappato') || lowerName.includes('lapatto')) finish = 'Lapatto';

      // Generate unique code
      const sanitizedName = name.toUpperCase().replace(/[^A-Z0-9]/g, '-').replace(/-+/g, '-');
      const code = `TERM-${sanitizedName}-${width}X${height}`;

      const productData = {
        name: name,
        code: code,
        brandId: brand.id,
        width: width,
        height: height,
        color: color,
        finish: finish,
        style: style,
        area: 'Banyo,Mutfak,Salon,Dış Mekan',
        imageUrl: imageUrl,
        textureUrl: imageUrl,
        isPremium: false,
        peiRating: 4,
        slipResistance: 'R9',
        frostResistance: true,
        thickness: 9.0,
        rectified: true
      };

      // Save to database
      await prisma.product.upsert({
        where: { code: code },
        update: productData,
        create: productData
      });

      console.log(`   [Başarılı] Kaydedildi: ${name} (${code}) [${width}x${height} cm, Renk: ${color}, Stil: ${style}, Finish: ${finish}]`);
      successCount++;

      // Wait a bit to prevent slamming the server
      await sleep(300);

    } catch (e) {
      console.error(`   [Hata] Ürün sayfasını işlerken hata oluştu:`, e.message);
    }
  }

  console.log(`\n======================================================`);
  console.log(` Kazıma tamamlandı! Toplam ${successCount} adet Termal Seramik ürünü kaydedildi/güncellendi.`);
  console.log(`======================================================`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
