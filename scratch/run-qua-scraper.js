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

async function fetchHtmlWithRetry(url, retries = 5, delay = 2500) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
          'Referer': 'https://qua.com.tr/'
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
  console.log('           Qua Granite Ürün Kazıyıcı Script           ');
  console.log('======================================================\n');

  // 1. Qua Granite Markasını bul veya oluştur
  let brand = await prisma.brand.findFirst({
    where: { name: { contains: 'Qua' } }
  });

  if (!brand) {
    console.log('[Veritabanı] "Qua Granite" markası bulunamadı. Yeni marka oluşturuluyor...');
    brand = await prisma.brand.create({
      data: {
        id: 'qua-granite-brand-id-3344',
        name: 'Qua Granite',
        logoUrl: '/brands/qua_granite.png',
        website: 'https://qua.com.tr'
      }
    });
  }

  console.log(`Targeting Brand: ${brand.name} (ID: ${brand.id})`);

  // 2. HTML sayfasını indir
  const url = 'https://qua.com.tr/karolar/tum-karolar';
  console.log(`\n[Scraper] Sayfa çekiliyor: ${url}...`);
  
  let html = '';
  try {
    html = await fetchHtmlWithRetry(url);
    console.log(`[Scraper] HTML başarıyla çekildi. Boyut: ${html.length} byte.`);
  } catch (err) {
    console.error('[Hata] HTML sayfası çekilemedi:', err.message);
    process.exit(1);
  }

  // 3. Regex ile ürünleri ayıkla
  console.log('[Scraper] Ürünler ayrıştırılıyor...');
  const regex = /<div[^>]+class="[^"]*prd-col[^"]*"[^>]*data-collection="([^"]*)"[^>]*data-doku="([^"]*)"[^>]*data-package="([^"]*)"[^>]*data-product_type="([^"]*)"[^>]*data-feature="([^"]*)"[\s\S]*?<a[^>]+href="([^"]+)"[^>]*><h5[^>]*>([\s\S]*?)<\/h5>[\s\S]*?<img[^>]+src="([^"]+)"/gi;

  let match;
  const parsedProducts = [];
  const seenCodes = new Set();

  while ((match = regex.exec(html)) !== null) {
    const collection = match[1].trim();
    const doku = match[2].trim();
    const size = match[3].trim();
    const type = match[4].trim();
    const feature = match[5].trim();
    const href = match[6].trim();
    const name = match[7].replace(/<[^>]*>/g, '').trim().replace(/\s+/g, ' ');
    const imgUrl = match[8].trim();

    // Code extraction
    let imgFilename = imgUrl.split('/').pop().split('?')[0].split('.')[0];
    
    // Clean -1 or similar suffixes from filename
    imgFilename = imgFilename.replace(/-1$/, '');
    
    let code = imgFilename.toUpperCase().replace(/[^A-Z0-9-]/gi, '');

    // Fallback if image name is not a SKU
    if (code.length < 8 || code.includes('FACE') || code.includes('YENI') || code.includes('IMAGE') || code.includes('LOGO')) {
      const cleanColl = collection.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase();
      const cleanSize = size.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      const cleanFeat = feature.replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase();
      code = `QUA-${cleanColl}-${cleanSize}-${cleanFeat}`;
    }

    // Handle duplicates
    let uniqueCode = code;
    let counter = 1;
    while (seenCodes.has(uniqueCode)) {
      uniqueCode = `${code}-${counter}`;
      counter++;
    }
    seenCodes.add(uniqueCode);

    // Parse dimensions
    let width = 60;
    let height = 120;
    const sizeMatch = size.match(/^(\d+(?:\.\d+)?)[xX](\d+(?:\.\d+)?)$/);
    if (sizeMatch) {
      width = parseFloat(sizeMatch[1]);
      height = parseFloat(sizeMatch[2]);
    }

    // Resolve color from name
    let color = 'Gri';
    const nameLower = name.toLowerCase();
    if (nameLower.includes('grey') || nameLower.includes('gri')) color = 'Gri';
    else if (nameLower.includes('white') || nameLower.includes('beyaz')) color = 'Beyaz';
    else if (nameLower.includes('ivory') || nameLower.includes('fildisi') || nameLower.includes('fildişi')) color = 'Fildişi';
    else if (nameLower.includes('black') || nameLower.includes('siyah')) color = 'Siyah';
    else if (nameLower.includes('anthracite') || nameLower.includes('antrasit')) color = 'Antrasit';
    else if (nameLower.includes('beige') || nameLower.includes('bej')) color = 'Bej';
    else if (nameLower.includes('brown') || nameLower.includes('kahve')) color = 'Kahverengi';
    else if (nameLower.includes('cream') || nameLower.includes('krem')) color = 'Krem';
    else if (nameLower.includes('gold') || nameLower.includes('altin') || nameLower.includes('altın')) color = 'Altın';

    // Style
    const style = doku || 'Mermer';

    // Image cleanup (get original high-res image and fix relative path issues)
    let cleanImg = imgUrl.replace('/../', '/');
    if (cleanImg.includes('?')) {
      cleanImg = cleanImg.split('?')[0];
    }

    // Display Name
    const displayName = `Qua ${name} ${size}`;

    parsedProducts.push({
      name: displayName,
      code: uniqueCode,
      width,
      height,
      color,
      finish: feature || 'Mat',
      style,
      rectified: nameLower.includes('rektifiye') || uniqueCode.endsWith('R') || uniqueCode.endsWith('RN'),
      imageUrl: cleanImg,
      textureUrl: cleanImg,
      sourceUrl: href.startsWith('http') ? href : `https://qua.com.tr/${href}`
    });
  }

  console.log(`[Scraper] Toplam ${parsedProducts.length} adet benzersiz ürün ayrıştırıldı.`);

  if (parsedProducts.length === 0) {
    console.error('[Hata] Hiç ürün toplanamadı. İşlem durduruluyor.');
    process.exit(1);
  }

  // 4. Eski mock verileri temizle (QUA- ön ekiyle başlayan mocklar)
  console.log(`\n[Veritabanı] Eski mock (QUA-*) Qua Granite ürünleri temizleniyor...`);
  try {
    const deleteResult = await prisma.product.deleteMany({
      where: {
        brandId: brand.id,
        code: {
          startsWith: 'QUA-'
        }
      }
    });
    console.log(`[Veritabanı] ${deleteResult.count} adet eski mock Qua Granite ürünü silindi.`);
  } catch (err) {
    console.error('[Veritabanı Hata] Eski mock ürünler silinemedi:', err.message);
  }

  // 5. Veritabanına kaydet (upsert)
  console.log(`\n[Veritabanı] ${parsedProducts.length} adet Qua Granite ürününün veritabanına kaydedilmesi başlatılıyor...`);
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
        console.log(`[Veritabanı İlerleme] ${addedCount}/${parsedProducts.length} Qua Granite ürünü upsert edildi.`);
      }
    } catch (err) {
      errorCount++;
      console.error(`[Veritabanı Hata] Ürün kaydedilemedi: ${prod.name} (SKU: ${prod.code}) - ${err.message}`);
    }
  }

  console.log(`\n[Sistem] ✅ Qua Granite Entegrasyonu Başarıyla Tamamlandı!`);
  console.log(`[Sistem] 📊 Toplam: ${addedCount} gerçek ürün veritabanına aktarıldı. Hatalı: ${errorCount}`);
}

main().catch(console.error).finally(() => process.exit(0));
