const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@libsql/client');
const { PrismaLibSQL } = require('@prisma/adapter-libsql');
const cheerio = require('c:/Users/A/Desktop/KOLAYWEBCİ/seramikbak/node_modules/cheerio');

// Load env variables
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

async function fetchHtmlWithRetry(url, retries = 5, delay = 2500) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
          'Referer': 'https://www.kale.com.tr/'
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

function getStyleFromName(name, url) {
  const lower = (name + ' ' + url).toLowerCase();
  if (lower.includes('ahşap') || lower.includes('wood') || lower.includes('meşe') || lower.includes('ceviz')) return 'Ahşap';
  if (lower.includes('mermer') || lower.includes('marble') || lower.includes('onyx') || lower.includes('calacatta') || lower.includes('laminat')) return 'Mermer';
  if (lower.includes('beton') || lower.includes('concrete') || lower.includes('cement') || lower.includes('çimento')) return 'Beton';
  if (lower.includes('metal') || lower.includes('paslı') || lower.includes('iron')) return 'Metal';
  if (lower.includes('taş') || lower.includes('stone') || lower.includes('kaya') || lower.includes('slate') || lower.includes('traverten')) return 'Taş';
  return 'Seramik';
}

async function main() {
  console.log('======================================================');
  console.log('      Kaleseramik (Çanakkale & Kalebodur) Scraper     ');
  console.log('======================================================\n');

  // 1. Ensure Brands exist
  let brandCanakkale = await prisma.brand.findFirst({
    where: { name: { contains: 'Çanakkale' } }
  });
  if (!brandCanakkale) {
    console.log('[Veritabanı] "Çanakkale Seramik" markası bulunamadı. Oluşturuluyor...');
    brandCanakkale = await prisma.brand.create({
      data: {
        id: 'canakkale-seramik-brand-id-3344',
        name: 'Çanakkale Seramik',
        logoUrl: '/logos/canakkale_seramik.png'
      }
    });
  }

  let brandKale = await prisma.brand.findFirst({
    where: { name: { contains: 'Kalebodur' } }
  });
  if (!brandKale) {
    console.log('[Veritabanı] "Kalebodur" markası bulunamadı. Oluşturuluyor...');
    brandKale = await prisma.brand.create({
      data: {
        id: 'kalebodur-brand-id-1122',
        name: 'Kalebodur',
        logoUrl: '/logos/kalebodur.png'
      }
    });
  }

  console.log(`Çanakkale Seramik ID: ${brandCanakkale.id}`);
  console.log(`Kalebodur ID: ${brandKale.id}`);

  // 2. Define URLs
  const categoryUrls = [
    'https://www.kale.com.tr/seramik-karolar/yer-seramikleri?pg=1-500',
    'https://www.kale.com.tr/seramik-karolar/duvar-seramikleri?pg=1-500',
    'https://www.kale.com.tr/seramik-karolar/banyo-seramikleri?pg=1-500',
    'https://www.kale.com.tr/seramik-karolar/mutfak-seramikleri?pg=1-500',
    'https://www.kale.com.tr/seramik-karolar/konut-disi-alanlar?pg=1-500'
  ];

  const parsedProducts = [];
  const seenCodes = new Set();

  for (const url of categoryUrls) {
    console.log(`\n[Scraper] Kategori çekiliyor: ${url}...`);
    let html = '';
    try {
      html = await fetchHtmlWithRetry(url);
      console.log(`[Scraper] HTML başarıyla çekildi. Boyut: ${html.length} byte.`);
    } catch (err) {
      console.error(`[Hata] Sayfa çekilemedi: ${url} - ${err.message}`);
      continue;
    }

    console.log('[Scraper] Sayfa ayrıştırılıyor (cheerio)...');
    const $ = cheerio.load(html);

    // Build a map of product data from global script tags (since script tags are direct children of body, not card siblings)
    const scriptMap = new Map();
    $('script').each((idx, scriptEl) => {
      const text = $(scriptEl).html();
      if (text && (text.includes('productTemp') || text.includes('relatedProduct'))) {
        const idMatch = text.match(/"id":\s*'([^']+)'/);
        const itemIdMatch = text.match(/"item_id":\s*(\d+)/);
        const brandMatch = text.match(/"item_brand":\s*"([^"]+)"/) || text.match(/"list":\s*'([^']+)'/);
        const colorMatch = text.match(/"color":\s*"([^"]+)"/);
        const variantMatch = text.match(/"item_variant":\s*"([^"]+)"/);
        const nameMatch = text.match(/"item_name":\s*"([^"]+)"/) || text.match(/"name":\s*'([^']+)'/);

        const skuId = idMatch ? idMatch[1] : null;
        const itemId = itemIdMatch ? itemIdMatch[1] : null;
        const brand = brandMatch ? brandMatch[1] : null;
        const color = colorMatch ? colorMatch[1] : null;
        const size = variantMatch ? variantMatch[1] : null;
        const nameVal = nameMatch ? nameMatch[1] : null;

        const data = { brand, color, size, name: nameVal };
        if (skuId) scriptMap.set(skuId, data);
        if (itemId) scriptMap.set(itemId, data);
      }
    });

    console.log(`[Scraper] Sayfa içi scriptlerden ${scriptMap.size} adet ürün detay haritası çıkarıldı.`);

    $('.comp-product-01').each((i, el) => {
      const erpCode = $(el).attr('data-erp') || '';
      const bookmarkLink = $(el).find('.c-item-02').attr('onclick');
      let skuId = '';
      if (bookmarkLink) {
        const match = bookmarkLink.match(/skuId:\s*'([^']+)'/);
        if (match) skuId = match[1];
      }

      const detailLink = $(el).find('.c-container-02 a.c-item-01');
      const href = detailLink.attr('href') || '';
      const onclickAttr = detailLink.attr('onclick') || '';
      let itemId = '';
      const itemMatch = onclickAttr.match(/selectedListingItem\('([^']+)'\)/) || onclickAttr.match(/selectedListingItem\((\d+)\)/);
      if (itemMatch) itemId = itemMatch[1];

      let imgUrl = detailLink.find('img').attr('data-src') || detailLink.find('source').first().attr('data-srcset') || '';
      let name = detailLink.find('img').attr('alt') || $(el).find('.c-container-02 a.c-item-01 picture img').attr('alt') || '';

      if (imgUrl && imgUrl.startsWith('//')) {
        imgUrl = 'https:' + imgUrl;
      } else if (imgUrl && imgUrl.startsWith('/')) {
        imgUrl = 'https://www.kale.com.tr' + imgUrl;
      }

      // Default values
      let brandName = 'Kalebodur';
      let color = 'Gri';
      let size = '60x120';

      // Look up in scriptMap
      const matchedData = scriptMap.get(skuId) || scriptMap.get(itemId);
      if (matchedData) {
        if (matchedData.brand) brandName = matchedData.brand;
        if (matchedData.color) color = matchedData.color;
        if (matchedData.size) size = matchedData.size;
        if (matchedData.name && !name) name = matchedData.name;
      }

      // Format clean name
      if (!name) name = `Kaleseramik Ürün ${skuId || erpCode}`;
      name = name.replace(/&amp;/g, '&').replace(/&#231;/g, 'ç').replace(/&#206;/g, 'Î').trim();

      // Formulate unique code
      const uniqueId = skuId || erpCode;
      if (!uniqueId) return; // skip if no ID

      const code = `KALE-${uniqueId}`;
      if (seenCodes.has(code)) return; // skip duplicates
      seenCodes.add(code);

      // Parse dimensions
      let width = 60;
      let height = 60;
      if (size) {
        const sizeMatch = size.toLowerCase().match(/^(\d+(?:\.\d+)?)[xX](\d+(?:\.\d+)?)$/);
        if (sizeMatch) {
          width = parseFloat(sizeMatch[1]);
          height = parseFloat(sizeMatch[2]);
        }
      }

      // Resolve color
      let resolvedColor = 'Gri';
      const colorLower = color.toLowerCase();
      if (colorLower.includes('grey') || colorLower.includes('gri') || colorLower.includes('antrasit') || colorLower.includes('anthracite')) resolvedColor = 'Gri';
      else if (colorLower.includes('white') || colorLower.includes('beyaz')) resolvedColor = 'Beyaz';
      else if (colorLower.includes('black') || colorLower.includes('siyah')) resolvedColor = 'Siyah';
      else if (colorLower.includes('beige') || colorLower.includes('bej')) resolvedColor = 'Bej';
      else if (colorLower.includes('brown') || colorLower.includes('kahve') || colorLower.includes('kahverengi')) resolvedColor = 'Kahverengi';
      else if (colorLower.includes('krem') || colorLower.includes('cream') || colorLower.includes('grej') || colorLower.includes('vizon')) resolvedColor = 'Bej';
      else if (colorLower.includes('yeşil') || colorLower.includes('olive') || colorLower.includes('green')) resolvedColor = 'Yeşil';
      else if (colorLower.includes('altın') || colorLower.includes('gold')) resolvedColor = 'Altın';
      else if (colorLower.includes('mavi') || colorLower.includes('blue')) resolvedColor = 'Mavi';

      // Finish
      let finish = 'Mat';
      const nameLower = name.toLowerCase();
      if (nameLower.includes('lappato')) finish = 'Lappato';
      else if (nameLower.includes('parlak') || nameLower.includes('glossy')) finish = 'Parlak';
      else if (nameLower.includes('yarı parlak') || nameLower.includes('semiglossy')) finish = 'Yarı Parlak';

      // Style
      const style = getStyleFromName(name, url);

      parsedProducts.push({
        name,
        code,
        width,
        height,
        color: resolvedColor,
        finish,
        style,
        rectified: nameLower.includes('rektifiye') || size.toLowerCase().includes('r') || nameLower.includes('sinterflex'),
        imageUrl: imgUrl,
        textureUrl: imgUrl,
        brandId: (brandName.includes('Çanakkale') || brandName.includes('&#199;') || brandName.includes('Canakkale')) ? brandCanakkale.id : brandKale.id,
        sourceUrl: href ? (href.startsWith('http') ? href : `https://www.kale.com.tr${href}`) : 'https://www.kale.com.tr'
      });
    });

    console.log(`[Scraper] Kategori taraması bitti. Toplam toplanan ürün sayısı: ${parsedProducts.length}`);
    await sleep(1500); // polite delay
  }

  console.log(`\n[Scraper] Toplam ${parsedProducts.length} adet benzersiz Çanakkale Seramik & Kalebodur ürünü ayrıştırıldı.`);

  if (parsedProducts.length === 0) {
    console.error('[Hata] Hiç ürün toplanamadı. İşlem sonlandırılıyor.');
    process.exit(1);
  }

  // 3. Upsert products to database
  console.log(`\n[Veritabanı] ${parsedProducts.length} adet ürünün veritabanına kaydedilmesi başlatılıyor...`);
  let addedCount = 0;
  let errorCount = 0;

  for (const prod of parsedProducts) {
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
          brandId: prod.brandId,
        },
        create: {
          name: prod.name,
          code: prod.code,
          brandId: prod.brandId,
          width: prod.width,
          height: prod.height,
          color: prod.color,
          finish: prod.finish,
          style: prod.style,
          area: 'Yer,Duvar,Mutfak,Banyo',
          imageUrl: prod.imageUrl,
          textureUrl: prod.textureUrl,
          isPremium: false,
          rectified: prod.rectified,
        }
      });
      addedCount++;
      if (addedCount % 50 === 0 || addedCount === parsedProducts.length) {
        console.log(`[Veritabanı İlerleme] ${addedCount}/${parsedProducts.length} Kaleseramik ürünü upsert edildi.`);
      }
    } catch (err) {
      errorCount++;
      console.error(`[Veritabanı Hata] Ürün kaydedilemedi: ${prod.name} (SKU: ${prod.code}) - ${err.message}`);
    }
  }

  console.log(`\n[Sistem] ✅ Kaleseramik Entegrasyonu Başarıyla Tamamlandı!`);
  console.log(`[Sistem] 📊 Toplam: ${addedCount} gerçek ürün veritabanına aktarıldı. Hatalı: ${errorCount}`);
}

main().catch(console.error).finally(() => process.exit(0));
