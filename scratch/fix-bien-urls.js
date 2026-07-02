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

async function main() {
  console.log('Fetching Bien Seramik products...');
  const products = await prisma.product.findMany({
    where: {
      brand: { name: 'Bien Seramik' },
      OR: [
        { imageUrl: { contains: '/uploads/uploads/' } },
        { textureUrl: { contains: '/uploads/uploads/' } }
      ]
    },
    select: { id: true, name: true, imageUrl: true, textureUrl: true }
  });

  console.log(`Found ${products.length} products with duplicate /uploads/ path in URLs.`);

  let updatedCount = 0;
  for (const p of products) {
    const fixedImageUrl = p.imageUrl ? p.imageUrl.replace('/uploads/uploads/', '/uploads/') : p.imageUrl;
    const fixedTextureUrl = p.textureUrl ? p.textureUrl.replace('/uploads/uploads/', '/uploads/') : p.textureUrl;

    await prisma.product.update({
      where: { id: p.id },
      data: {
        imageUrl: fixedImageUrl,
        textureUrl: fixedTextureUrl
      }
    });
    updatedCount++;
    if (updatedCount % 100 === 0 || updatedCount === products.length) {
      console.log(`Updated ${updatedCount}/${products.length} product URLs.`);
    }
  }

  console.log('All Bien Seramik URLs successfully fixed in database!');
}

main().catch(console.error).finally(() => process.exit(0));
