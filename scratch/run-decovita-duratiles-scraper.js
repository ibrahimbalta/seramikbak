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
  console.log('Connecting to remote Turso database...');
  const libsql = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
  prisma = new PrismaClient({ adapter: new PrismaLibSQL(libsql) });
} else {
  console.log('Connecting to local SQLite database...');
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
  console.log('      Decovita & DuraTiles Ürün Aktarım Scripti       ');
  console.log('======================================================\n');

  // 1. Resolve Brand: Decovita
  let decovitaBrand = await prisma.brand.findFirst({
    where: { name: { contains: 'Decovita' } }
  });
  if (!decovitaBrand) {
    console.log('[Veritabanı] "Decovita" markası oluşturuluyor...');
    decovitaBrand = await prisma.brand.create({
      data: {
        name: 'Decovita',
        logoUrl: '/logos/decovita.png',
        username: 'decovita',
        password: 'decovita123'
      }
    });
  }
  console.log(`Decovita Brand ID: ${decovitaBrand.id}`);

  // 2. Resolve Brand: DuraTiles
  let duratilesBrand = await prisma.brand.findFirst({
    where: { name: { contains: 'DuraTiles' } }
  });
  if (!duratilesBrand) {
    console.log('[Veritabanı] "DuraTiles" markası oluşturuluyor...');
    duratilesBrand = await prisma.brand.create({
      data: {
        name: 'DuraTiles',
        logoUrl: '/logos/duratiles.png',
        username: 'duratiles',
        password: 'duratiles123'
      }
    });
  }
  console.log(`DuraTiles Brand ID: ${duratilesBrand.id}`);

  // 3. Scrape Decovita Products
  console.log('\n[Scraper] Decovita ürün listesi indiriliyor...');
  try {
    const listHtml = await fetchWithRetry('https://www.decovita.com.tr/urunler/tr/urunler-liste');
    const productRegex = /<a href="([^"]*detay\/tr\/[^"]+)"[^>]*class="thumbnail">[\s\S]*?<img src="([^"]+)"[\s\S]*?<div style="[^"]*font-size: 24px;">([\s\S]*?)(?:<small>|<\/div>)/gi;
    
    let match;
    const decovitaSeries = [];
    while ((match = productRegex.exec(listHtml)) !== null) {
      let detailPath = match[1].trim();
      let imgPath = match[2].trim();
      let rawName = match[3].replace(/<[^>]+>/g, '').trim();

      // Normalize urls
      const detailUrl = detailPath.startsWith('http') ? detailPath : 'https://www.decovita.com.tr' + detailPath.replace(/^\.\.\/\.\.\/\.\.\/\.\./, '');
      const imageUrl = imgPath.startsWith('http') ? imgPath : 'https://www.decovita.com.tr' + imgPath.replace(/^\.\.\/\.\.\/\.\.\/\.\.\/\.\./, '');

      decovitaSeries.push({ name: rawName, detailUrl, imageUrl });
    }

    console.log(`[Scraper] Decovita listesinde ${decovitaSeries.length} adet seri bulundu.`);
    
    // We will scrape and seed up to 40 Decovita products
    const limitDecovita = Math.min(decovitaSeries.length, 40);
    let decovitaCount = 0;
    
    for (let i = 0; i < limitDecovita; i++) {
      const item = decovitaSeries[i];
      console.log(`[Decovita ${i+1}/${limitDecovita}] Kazınıyor: ${item.name} (${item.detailUrl})`);
      
      let width = 60;
      let height = 120;
      let color = 'Gri';
      let finish = 'Parlak';
      let style = 'Mermer';
      
      try {
        const detailHtml = await fetchWithRetry(item.detailUrl);
        
        // Parse size
        const sizeRegex = /(\d+)\s*(?:x|&#215;|&#xd7;|×)\s*(\d+)/i;
        const sizeMatch = detailHtml.match(sizeRegex);
        if (sizeMatch) {
          width = parseFloat(sizeMatch[1]) || 60;
          height = parseFloat(sizeMatch[2]) || 120;
        }

        // Parse finish
        if (detailHtml.includes('MAT')) finish = 'Mat';
        else if (detailHtml.includes('SUGAR EFFECT')) finish = 'Sugar Effect';
        else if (detailHtml.includes('PARLAK')) finish = 'Parlak';

        // Parse color
        if (detailHtml.includes('BROWN') || detailHtml.includes('KAHVE')) color = 'Kahverengi';
        else if (detailHtml.includes('GREY') || detailHtml.includes('GRI')) color = 'Gri';
        else if (detailHtml.includes('WHITE') || detailHtml.includes('BEYAZ')) color = 'Beyaz';
        else if (detailHtml.includes('BEIGE') || detailHtml.includes('BEJ')) color = 'Bej';
        else if (detailHtml.includes('SIYAH') || detailHtml.includes('BLACK')) color = 'Siyah';

        // Style guess
        const nameLower = item.name.toLowerCase();
        if (nameLower.includes('wood') || nameLower.includes('ahşap')) style = 'Ahşap';
        else if (nameLower.includes('concrete') || nameLower.includes('beton')) style = 'Beton';
        else if (nameLower.includes('stone') || nameLower.includes('taş')) style = 'Taş';
      } catch (err) {
        console.log(`   [Detay Hatası] Detay sayfası okunamadı, varsayılan değerler kullanılacak: ${err.message}`);
      }

      const sanitizedName = item.name.toUpperCase().replace(/[^A-Z0-9]/g, '-').replace(/-+/g, '-');
      const code = `DECO-${sanitizedName}-${width}X${height}`;
      
      const productData = {
        name: item.name + ' Serisi',
        code: code,
        brandId: decovitaBrand.id,
        width: width,
        height: height,
        color: color,
        finish: finish,
        style: style,
        area: 'Banyo,Mutfak,Salon,Dış Mekan',
        imageUrl: item.imageUrl,
        textureUrl: item.imageUrl,
        isPremium: false,
        peiRating: 4,
        slipResistance: 'R10',
        frostResistance: true,
        thickness: 9.0,
        rectified: true
      };

      await prisma.product.upsert({
        where: { code: code },
        update: productData,
        create: productData
      });
      decovitaCount++;
      await sleep(200);
    }
    console.log(`[Başarılı] ${decovitaCount} Decovita ürünü başarıyla eklendi/güncellendi.`);

  } catch (err) {
    console.error('[Hata] Decovita kazıma işlemi başarısız oldu:', err.message);
  }

  // 4. Import DuraTiles Products
  console.log('\n[İthalat] DuraTiles ürün listesi local dosyadan okunuyor...');
  try {
    const rawDataPath = path.join(__dirname, '..', '..', '..', '..', '..', '..', 'Users', 'A', '.gemini', 'antigravity', 'brain', '46fc5f89-605b-40e2-a732-54b346eec41e', 'scratch', 'duratiles-raw.json');
    if (!fs.existsSync(rawDataPath)) {
      console.error('[Hata] duratiles-raw.json bulunamadı!');
      return;
    }

    const duratilesRaw = JSON.parse(fs.readFileSync(rawDataPath, 'utf8'));
    console.log(`DuraTiles ham verisinde ${duratilesRaw.length} adet ürün kaydı var.`);

    // Sample/Filter to get a rich representation across collections
    const limitDuratiles = duratilesRaw.length;
    let duratilesCount = 0;

    for (let i = 0; i < limitDuratiles; i++) {
      const item = duratilesRaw[i];
      
      // Parse dimensions
      let width = 60;
      let height = 60;
      if (item.size && item.size.includes('x')) {
        const parts = item.size.split('x');
        width = parseFloat(parts[0]) || 60;
        height = parseFloat(parts[1]) || 60;
      }

      // Map color
      let color = item.color || 'Gri';
      if (color.toLowerCase() === 'gris') color = 'Gri';
      else if (color.toLowerCase() === 'beige') color = 'Bej';
      else if (color.toLowerCase() === 'noce') color = 'Kahverengi';
      else if (color.toLowerCase() === 'anthracite') color = 'Antrasit';
      else if (color.toLowerCase() === 'bianco') color = 'Beyaz';

      // Map style/collection
      let style = 'Modern';
      if (item.collection) {
        if (item.collection.includes('Ahşap')) style = 'Ahşap';
        else if (item.collection.includes('Mermer')) style = 'Mermer';
        else if (item.collection.includes('Beton')) style = 'Beton';
        else if (item.collection.includes('Taş') || item.collection.includes('Doğal')) style = 'Taş';
      }

      const sanitizedName = item.seriesName.toUpperCase().replace(/[^A-Z0-9]/g, '-').replace(/-+/g, '-');
      const code = `DURA-${sanitizedName}-${(item.color || 'Gri').toUpperCase()}-${width}X${height}`;

      const productData = {
        name: `DuraTiles ${item.seriesName} ${item.color || ''}`,
        code: code,
        brandId: duratilesBrand.id,
        width: width,
        height: height,
        color: color,
        finish: item.surface || 'Mat',
        style: style,
        area: item.usageArea || 'Banyo,Mutfak,Salon,Dış Mekan',
        imageUrl: item.imageUrl,
        textureUrl: item.imageUrl,
        isPremium: false,
        peiRating: 4,
        slipResistance: item.slipResistance || 'R9',
        frostResistance: item.frostResistance === 'Resistant' || true,
        thickness: 9.0,
        rectified: true
      };

      await prisma.product.upsert({
        where: { code: code },
        update: productData,
        create: productData
      });
      duratilesCount++;
    }
    console.log(`[Başarılı] ${duratilesCount} DuraTiles ürünü başarıyla eklendi/güncellendi.`);

  } catch (err) {
    console.error('[Hata] DuraTiles ithalat işlemi başarısız oldu:', err.message);
  }

  console.log('\n======================================================');
  console.log(' Marka ve ürün ekleme/güncelleme işlemleri tamamlandı! ');
  console.log('======================================================');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
