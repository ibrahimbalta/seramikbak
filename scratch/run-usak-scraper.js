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

// Helper to title case a string
function toTitleCase(str) {
  return str.toLowerCase().split(' ').map(word => {
    if (word.length === 0) return '';
    // Handle Turkish characters
    const firstChar = word.charAt(0);
    let upperFirst = firstChar.toUpperCase();
    if (firstChar === 'i') upperFirst = 'İ';
    if (firstChar === 'ı') upperFirst = 'I';
    return upperFirst + word.slice(1);
  }).join(' ');
}

// Helper to parse face file name into product variant name
function parseUsakVariantName(filename, baseProductName) {
  // filename example: "ADA-BONE-F1-T3" or "ADA-DARK-BROWN-F1"
  let name = filename.replace(/\.[^/.]+$/, ""); // remove extension if any
  name = name.toUpperCase();
  
  // Clean common suffixes
  name = name.replace(/-F\d+/gi, '');
  name = name.replace(/-T\d+/gi, '');
  name = name.replace(/-FACE/gi, '');
  name = name.replace(/-THUMB/gi, '');
  name = name.replace(/-CONVERSIONS/gi, '');
  name = name.replace(/-/g, ' ');
  name = name.replace(/\s+/g, ' ').trim();
  
  // Title case it
  let titleCased = toTitleCase(name);
  
  // Ensure base product name is included
  const baseLower = baseProductName.toLowerCase();
  const titleLower = titleCased.toLowerCase();
  if (!titleLower.includes(baseLower)) {
    titleCased = `${toTitleCase(baseProductName)} ${titleCased}`;
  }
  
  return titleCased;
}

// Helper to guess Turkish color from variant name
function guessColor(name) {
  const lower = name.toLowerCase();
  if (lower.includes('bone') || lower.includes('kemik')) return 'Bej';
  if (lower.includes('grey') || lower.includes('gri') || lower.includes('gray')) return 'Gri';
  if (lower.includes('white') || lower.includes('beyaz') || lower.includes('ak')) return 'Beyaz';
  if (lower.includes('brown') || lower.includes('kahve')) return 'Kahverengi';
  if (lower.includes('beige') || lower.includes('bej')) return 'Bej';
  if (lower.includes('cream') || lower.includes('krem')) return 'Krem';
  if (lower.includes('black') || lower.includes('siyah') || lower.includes('kara')) return 'Siyah';
  if (lower.includes('blue') || lower.includes('mavi')) return 'Mavi';
  if (lower.includes('green') || lower.includes('yeşil')) return 'Yeşil';
  if (lower.includes('red') || lower.includes('kırmızı')) return 'Kırmızı';
  if (lower.includes('gold') || lower.includes('altın')) return 'Sarı';
  return 'Bej'; // default
}

async function main() {
  console.log('======================================================');
  console.log('          Uşak Seramik Ürün Kazıyıcı Script           ');
  console.log('======================================================\n');

  // Find or create Uşak Seramik brand
  let brand = await prisma.brand.findFirst({
    where: { name: { contains: 'Uşak' } }
  });

  if (!brand) {
    console.log('[Veritabanı] "Uşak Seramik" markası bulunamadı. Yeni oluşturuluyor...');
    brand = await prisma.brand.create({
      data: {
        name: 'Uşak Seramik',
        logoUrl: '/logos/usak.png',
        username: 'usak',
        password: 'usak123'
      }
    });
  }

  console.log(`Target Brand: ${brand.name} (ID: ${brand.id})`);

  // Fetch catalog page
  console.log('\n[Scraper] Ürünler listeleme sayfası indiriliyor...');
  let catalogHtml = '';
  try {
    catalogHtml = await fetchWithRetry('https://www.usakseramik.com/urunler');
  } catch (err) {
    console.error('[Hata] Katalog sayfası indirilemedi:', err.message);
    process.exit(1);
  }

  // Parse links matching /urunler/name
  const productUrls = [];
  const hrefRegex = /href="([^"]+)"/g;
  let match;
  while ((match = hrefRegex.exec(catalogHtml)) !== null) {
    const url = match[1];
    if (url.includes('/urunler/') && !url.includes('/tr/urunler') && !url.includes('?') && !url.includes('#') && url !== 'https://www.usakseramik.com/urunler') {
      productUrls.push(url.startsWith('http') ? url : `https://www.usakseramik.com${url.startsWith('/') ? '' : '/'}${url}`);
    }
  }

  const uniqueUrls = [...new Set(productUrls)];
  console.log(`[Scraper] Toplam ${uniqueUrls.length} adet ürün serisi sayfası bulundu.`);

  // Limit Uşak products to scrape to prevent excessive runtimes
  // Let's scrape up to 50 series (which will yield 100+ individual face/color variants)
  const maxSeries = 50;
  const urlsToScrape = uniqueUrls.slice(0, maxSeries);
  console.log(`[Scraper] Bu çalıştırmada ${urlsToScrape.length} ürün serisi kazınacak.`);

  let successCount = 0;

  for (let idx = 0; idx < urlsToScrape.length; idx++) {
    const url = urlsToScrape[idx];
    console.log(`\n[${idx + 1}/${urlsToScrape.length}] Serisi Kazınıyor: ${url}`);
    
    try {
      const html = await fetchWithRetry(url);
      
      // 1. Series Base Name (from H1 class title-xl)
      let baseName = '';
      const h1Match = html.match(/<h1[^>]*class="[^"]*title-xl[^"]*"[^>]*>([\s\S]*?)<\/h1>/i)
                   || html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
      if (h1Match) {
        baseName = h1Match[1].replace(/\s+/g, ' ').trim();
      }

      if (!baseName) {
        console.log('   [Atlandı] Seri ismi bulunamadı.');
        continue;
      }

      // 2. Parse Dimensions from Packaging Info table
      let width = 60;
      let height = 60;
      const dimRegex = /(\d+)\s*(?:x|&#215;|&#xd7;|×)\s*(\d+)/i;
      const dimMatch = html.match(dimRegex);
      if (dimMatch) {
        width = parseFloat(dimMatch[1]) || 60;
        height = parseFloat(dimMatch[2]) || 60;
      }

      // 3. Parse Finish from symbols
      let finish = 'Mat';
      const finishMatch = html.match(/alt="([^"]*(?:lappato|lapatto|mat|parlak)[^"]*)"/i)
                       || html.match(/title="([^"]*(?:lappato|lapatto|mat|parlak)[^"]*)"/i);
      if (finishMatch) {
        const finishStr = finishMatch[1].toLowerCase();
        if (finishStr.includes('lappato') || finishStr.includes('lapatto')) finish = 'Lapatto';
        else if (finishStr.includes('parlak')) finish = 'Parlak';
        else if (finishStr.includes('mat')) finish = 'Mat';
      }

      // Guess style from series name
      let style = 'Modern';
      const lowerBase = baseName.toLowerCase();
      if (lowerBase.includes('wood') || lowerBase.includes('ahşap')) style = 'Ahşap';
      else if (lowerBase.includes('marble') || lowerBase.includes('mermer') || lowerBase.includes('calacatta') || lowerBase.includes('carrara')) style = 'Mermer';
      else if (lowerBase.includes('stone') || lowerBase.includes('taş') || lowerBase.includes('rock')) style = 'Taş';
      else if (lowerBase.includes('concrete') || lowerBase.includes('beton') || lowerBase.includes('cement')) style = 'Beton';

      // 4. Parse Faces (Color variants)
      // Extract links to full-size image faces:
      // <a href="https://usakseramik.com/storage/375/ADA-BONE-F1-T3.jpg" data-lightbox="gallery-item">
      const faceRegex = /<a[^>]+href="([^"]+storage\/[^"]+\.(?:jpg|png|jpeg))"[^>]+data-lightbox="gallery-item">/gi;
      let faceMatch;
      const faces = [];
      while ((faceMatch = faceRegex.exec(html)) !== null) {
        faces.push(faceMatch[1]);
      }

      if (faces.length === 0) {
        // Fallback: check any image inside the page with storage/ conversions
        const fallbackRegex = /src="([^"]+storage\/[^"]+\.(?:jpg|png|jpeg))"/gi;
        let fbMatch;
        while ((fbMatch = fallbackRegex.exec(html)) !== null) {
          faces.push(fbMatch[1].replace('/conversions/', '/').replace('-thumb', ''));
        }
      }

      const uniqueFaces = [...new Set(faces)];
      console.log(`   Bulunan Varyant Sayısı (Faces): ${uniqueFaces.length}`);

      for (const faceUrl of uniqueFaces) {
        // Parse filename out of faceUrl
        const filename = faceUrl.substring(faceUrl.lastIndexOf('/') + 1);
        const name = parseUsakVariantName(filename, baseName);
        const color = guessColor(name);
        
        // Generate unique product code
        const sanitizedVariantName = name.toUpperCase().replace(/[^A-Z0-9]/g, '-').replace(/-+/g, '-');
        const code = `USAK-${sanitizedVariantName}-${width}X${height}`;

        const productData = {
          name: name,
          code: code,
          brandId: brand.id,
          width: width,
          height: height,
          color: color,
          finish: finish,
          style: style,
          area: 'Banyo,Mutfak,Salon,Antre',
          imageUrl: faceUrl,
          textureUrl: faceUrl,
          isPremium: false,
          peiRating: 4,
          slipResistance: 'R10',
          frostResistance: true,
          thickness: 8.5,
          rectified: true
        };

        // Save to database
        await prisma.product.upsert({
          where: { code: code },
          update: productData,
          create: productData
        });

        console.log(`      -> Kaydedildi: ${name} (${code}) [${width}x${height} cm, Renk: ${color}, Finish: ${finish}]`);
        successCount++;
      }

      // Wait a bit to prevent slamming the server
      await sleep(300);

    } catch (e) {
      console.error(`   [Hata] Seri sayfasını işlerken hata oluştu:`, e.message);
    }
  }

  console.log(`\n======================================================`);
  console.log(` Kazıma tamamlandı! Toplam ${successCount} adet Uşak Seramik ürünü varyantlarıyla kaydedildi.`);
  console.log(`======================================================`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
