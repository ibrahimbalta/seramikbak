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
  console.log('Connecting to Remote Turso Database...');
} else {
  prisma = new PrismaClient();
  console.log('Connecting to Local SQLite Database...');
}

async function main() {
  const brand = await prisma.brand.findFirst({
    where: { name: { contains: 'Yurtbay' } }
  });

  if (!brand) {
    console.error('Yurtbay Seramik brand not found!');
    process.exit(1);
  }

  console.log(`Found Yurtbay Seramik (ID: ${brand.id})`);

  const products = await prisma.product.findMany({
    where: { brandId: brand.id }
  });

  console.log(`Loaded ${products.length} products. Scanning for broken /urun_768/ URLs...`);

  let fixCount = 0;
  for (const product of products) {
    let needsUpdate = false;
    let newImageUrl = product.imageUrl;
    let newTextureUrl = product.textureUrl;

    if (product.imageUrl && product.imageUrl.includes('/urun_768/')) {
      newImageUrl = product.imageUrl.replace('/urun_768/', '/urun_320/');
      needsUpdate = true;
    }
    if (product.textureUrl && product.textureUrl.includes('/urun_768/')) {
      newTextureUrl = product.textureUrl.replace('/urun_768/', '/urun_320/');
      needsUpdate = true;
    }

    if (needsUpdate) {
      await prisma.product.update({
        where: { id: product.id },
        data: {
          imageUrl: newImageUrl,
          textureUrl: newTextureUrl
        }
      });
      fixCount++;
    }
  }

  console.log(`Successfully updated ${fixCount} Yurtbay Seramik products in the database.`);
}

main().catch(console.error).finally(() => process.exit(0));
