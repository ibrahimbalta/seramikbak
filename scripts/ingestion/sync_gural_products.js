const fs = require('fs');
const path = require('path');
const prisma = require('../../src/lib/prisma').default;

function parseDimensions(title) {
  // Matches e.g. 60×120, 60x120, 60*120, 30×90, 80×80, 20×120
  const match = title.match(/(\d{2,3})\s*[x×*]\s*(\d{2,3})/i);
  if (match) {
    return {
      width: parseInt(match[1], 10),
      height: parseInt(match[2], 10)
    };
  }
  return { width: 60, height: 120 }; // Default standard size
}

function parseFinish(title) {
  const t = title.toLowerCase();
  if (t.includes('lappato') || t.includes('full lappato')) return 'Full Lappato';
  if (t.includes('antislip') || t.includes('r11')) return 'Antislip (Kaymaz)';
  if (t.includes('mat')) return 'Mat';
  if (t.includes('parlak') || t.includes('glossy')) return 'Parlak';
  if (t.includes('satin')) return 'Saten';
  return 'Mat';
}

function parseStyle(title) {
  const t = title.toLowerCase();
  if (t.includes('wood') || t.includes('ahşap') || t.includes('teak') || t.includes('oak')) return 'Ahşap';
  if (t.includes('concrete') || t.includes('beton') || t.includes('cement')) return 'Beton';
  if (t.includes('stone') || t.includes('taş') || t.includes('rock')) return 'Taş';
  if (t.includes('marmi') || t.includes('marble') || t.includes('onyx') || t.includes('calacatta') || t.includes('mermer') || t.includes('olvido') || t.includes('salda')) return 'Mermer';
  return 'Mermer';
}

function parseColor(title) {
  const t = title.toLowerCase();
  if (t.includes('grey') || t.includes('gri')) return 'Gri';
  if (t.includes('white') || t.includes('beyaz') || t.includes('silver')) return 'Beyaz / Gümüş';
  if (t.includes('beige') || t.includes('bej') || t.includes('ivory') || t.includes('cream')) return 'Bej';
  if (t.includes('anthracite') || t.includes('antrasit')) return 'Antrasit';
  if (t.includes('black') || t.includes('siyah')) return 'Siyah';
  if (t.includes('blue') || t.includes('mavi')) return 'Mavi';
  if (t.includes('mink') || t.includes('vizon')) return 'Vizon';
  if (t.includes('brown') || t.includes('kahve') || t.includes('almond')) return 'Koyu Bej / Badem';
  return 'Gri / Karma';
}

function parsePrice(priceText) {
  if (!priceText) return null;
  // e.g. "750,00 ₺" -> 750.00
  const clean = priceText.replace(/[^0-9,.]/g, '').replace(/\./g, '').replace(',', '.');
  const val = parseFloat(clean);
  return isNaN(val) ? null : val;
}

function generateSKU(title, width, height) {
  // Create clean SKU e.g. GURAL-OLVIDO-60120-SILVER
  const cleanTitle = title
    .replace(/^Güral\s+Seramik\s+/i, '')
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '-');
  return `GURAL-${cleanTitle.slice(0, 30)}`;
}

async function main() {
  console.log('==================================================');
  console.log('GÜRAL SERAMİK KATEGORİ VE ÜRÜN SENKRONİZASYONU');
  console.log('==================================================\n');

  // 1. Get or Create Güral Seramik Brand
  let brand = await prisma.brand.findFirst({
    where: {
      name: { contains: 'Güral', mode: 'insensitive' }
    }
  });

  if (!brand) {
    console.log('[INFO] Güral Seramik markası veritabanında oluşturuluyor...');
    brand = await prisma.brand.create({
      data: {
        name: 'Güral Seramik',
        logoUrl: '/brands/gural.png',
        catalogPdfUrl: 'https://gural-seramik.com/katalog.pdf'
      }
    });
  }

  console.log(`[OK] Marka ID: ${brand.id} (${brand.name})`);

  // 2. Load Scraped JSON
  const jsonPath = path.join(__dirname, 'gural_scraped_products.json');
  if (!fs.existsSync(jsonPath)) {
    throw new Error('gural_scraped_products.json bulunamadı. Önce tarama scriptini çalıştırın.');
  }

  const scrapedProducts = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  console.log(`[INFO] İşlenecek Toplam Scraped Ürün Sayısı: ${scrapedProducts.length}`);

  // 3. Load Existing Products in DB
  const existingProducts = await prisma.product.findMany({
    where: { brandId: brand.id }
  });

  console.log(`[INFO] Veritabanındaki Mevcut Güral Seramik Ürün Sayısı: ${existingProducts.length}`);

  const existingCodesSet = new Set(existingProducts.map(p => p.code.toUpperCase()));
  const existingNamesSet = new Set(existingProducts.map(p => p.name.toLowerCase()));

  let createdCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;

  for (const item of scrapedProducts) {
    const rawTitle = item.title;
    const { width, height } = parseDimensions(rawTitle);
    const finish = parseFinish(rawTitle);
    const style = parseStyle(rawTitle);
    const color = parseColor(rawTitle);
    const price = parsePrice(item.priceText);

    // Clean name
    const cleanName = rawTitle.replace(/^Güral\s+Seramik\s+/i, '').trim();
    const sku = generateSKU(rawTitle, width, height);

    if (existingCodesSet.has(sku) || existingNamesSet.has(cleanName.toLowerCase())) {
      // Update price / image if needed
      const match = existingProducts.find(p => p.code.toUpperCase() === sku || p.name.toLowerCase() === cleanName.toLowerCase());
      if (match) {
        await prisma.product.update({
          where: { id: match.id },
          data: {
            imageUrl: item.imageUrl || match.imageUrl,
            textureUrl: item.imageUrl || match.textureUrl,
            trendyolPrice: price || match.trendyolPrice,
            yerevdekorUrl: item.productUrl || match.yerevdekorUrl
          }
        });
        updatedCount++;
      } else {
        skippedCount++;
      }
    } else {
      // Create new product
      await prisma.product.create({
        data: {
          name: cleanName,
          code: sku,
          brandId: brand.id,
          width,
          height,
          color,
          finish,
          style,
          area: 'Yer,Duvar',
          imageUrl: item.imageUrl || '/textures/calacatta_gold.jpg',
          textureUrl: item.imageUrl || '/textures/calacatta_gold.jpg',
          isPremium: finish.includes('Lappato') || width >= 60,
          trendyolPrice: price,
          yerevdekorUrl: item.productUrl
        }
      });

      existingCodesSet.add(sku);
      existingNamesSet.add(cleanName.toLowerCase());
      createdCount++;
    }
  }

  console.log(`\n==================================================`);
  console.log(`SENKRONİZASYON BİTTİ!`);
  console.log(`Yeni Eklenen Ürün Sayısı: ${createdCount}`);
  console.log(`Güncellenen Ürün Sayısı: ${updatedCount}`);
  console.log(`Atlanan Ürün Sayısı: ${skippedCount}`);
  
  const finalTotal = await prisma.product.count({
    where: { brandId: brand.id }
  });
  console.log(`Veritabanındaki Güral Seramik Ürün Toplamı: ${finalTotal}`);
  console.log(`==================================================\n`);
}

main().catch(console.error);
