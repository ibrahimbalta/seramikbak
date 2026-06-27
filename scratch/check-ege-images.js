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

async function main() {
  const brand = await prisma.brand.findFirst({
    where: { name: { contains: 'Ege' } }
  });

  if (!brand) {
    console.error('Ege Seramik brand not found in DB!');
    process.exit(1);
  }

  console.log(`Ege Seramik Brand Found: ${brand.name} (ID: ${brand.id})`);
  
  const total = await prisma.product.count({ where: { brandId: brand.id } });
  console.log('Total Ege Seramik products in DB:', total);
  
  const withRealImages = await prisma.product.count({
    where: { brandId: brand.id, imageUrl: { startsWith: 'https://' } }
  });
  console.log('Ege Seramik products with real image URLs (starting with https):', withRealImages);
  
  const withMockCodes = await prisma.product.count({
    where: { brandId: brand.id, code: { startsWith: 'EGE-' } }
  });
  console.log('Ege Seramik products with mock codes (EGE-):', withMockCodes);
  
  // Sample 3 products
  const samples = await prisma.product.findMany({
    where: { brandId: brand.id },
    take: 3,
    select: { name: true, code: true, imageUrl: true, textureUrl: true, width: true, height: true, style: true, finish: true }
  });
  console.log('Samples of Ege Seramik products in DB:', JSON.stringify(samples, null, 2));
}

main().catch(console.error).finally(() => process.exit(0));
