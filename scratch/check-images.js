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
  const brandId = '03e2f32b-e9c0-4033-91ff-460daa6254ef';
  
  const total = await prisma.product.count({ where: { brandId } });
  console.log('Total products:', total);
  
  // Check how many have real image URLs (not local textures)
  const withRealImages = await prisma.product.count({
    where: { brandId, imageUrl: { startsWith: 'https://' } }
  });
  console.log('Products with real image URLs:', withRealImages);
  
  const withLocalTextures = await prisma.product.count({
    where: { brandId, imageUrl: { startsWith: '/textures/' } }
  });
  console.log('Products with local texture fallback:', withLocalTextures);
  
  // Check how many still have NGK- prefix codes (old scraper)
  const withOldCodes = await prisma.product.count({
    where: { brandId, code: { startsWith: 'NGK-' } }
  });
  console.log('Products with old NGK- codes:', withOldCodes);
  
  // Sample a few with real images
  const samples = await prisma.product.findMany({
    where: { brandId, imageUrl: { startsWith: 'https://' } },
    take: 3,
    select: { name: true, code: true, imageUrl: true, textureUrl: true }
  });
  console.log('Samples with real images:', JSON.stringify(samples, null, 2));
}

main().catch(console.error).finally(() => process.exit(0));
