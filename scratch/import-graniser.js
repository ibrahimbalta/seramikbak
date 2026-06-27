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

let prisma;
if (process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN) {
  const libsql = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
  prisma = new PrismaClient({ adapter: new PrismaLibSQL(libsql) });
} else {
  prisma = new PrismaClient();
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  console.log('======================================================');
  console.log('         Graniser Ürün İthalatçı (Prisma)              ');
  console.log('======================================================\n');

  const inputPath = path.join(__dirname, 'graniser-products.json');
  if (!fs.existsSync(inputPath)) {
    console.error(`[Hata] Ürün dosyası bulunamadı: ${inputPath}`);
    process.exit(1);
  }

  const products = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  console.log(`[Dosya] ${products.length} ürün dosyadan okundu.`);

  // 1. Find or create the brand
  let brand = await prisma.brand.findFirst({
    where: { name: { contains: 'Graniser' } }
  });

  if (!brand) {
    console.log('[Veritabanı] "Graniser" markası bulunamadı. Yeni marka oluşturuluyor...');
    brand = await prisma.brand.create({
      data: {
        name: 'Graniser',
        logoUrl: '/logos/graniser.png'
      }
    });
  }
  console.log(`Hedef Marka: ${brand.name} (ID: ${brand.id})`);

  // 2. Clear old data
  console.log('[Veritabanı] Eski Graniser ürünleri temizleniyor...');
  try {
    const deleteResult = await prisma.product.deleteMany({
      where: { brandId: brand.id }
    });
    console.log(`[Veritabanı] ${deleteResult.count} adet eski Graniser ürünü silindi.`);
  } catch (err) {
    console.error('[Veritabanı Hata] Eski ürünler silinemedi:', err.message);
  }

  // 3. Import products
  console.log(`\n[Veritabanı] Entegrasyon başlıyor...`);
  let addedCount = 0;
  let errorCount = 0;

  for (const prod of products) {
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
          area: prod.area,
          thickness: prod.thickness,
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
          area: prod.area,
          thickness: prod.thickness,
          imageUrl: prod.imageUrl,
          textureUrl: prod.textureUrl,
          isPremium: false,
          rectified: prod.rectified || false,
        }
      });
      addedCount++;
      if (addedCount % 100 === 0 || addedCount === products.length) {
        console.log(`[Veritabanı İlerleme] ${addedCount}/${products.length} ürün başarıyla upsert edildi.`);
      }
      await sleep(20);
    } catch (err) {
      errorCount++;
      console.error(`[Veritabanı Hata] Ürün kaydedilemedi: ${prod.name} (SKU: ${prod.code}) - ${err.message}`);
    }
  }

  console.log(`\n[Sistem] ✅ Graniser İçe Aktarımı Tamamlandı!`);
  console.log(`[Sistem] 📊 Başarılı: ${addedCount} | Hatalı: ${errorCount}`);
}

main().catch(console.error).finally(() => process.exit(0));
