const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@libsql/client');
const { PrismaLibSQL } = require('@prisma/adapter-libsql');

// Manually parse .env file
function loadEnv() {
  const envPath = path.join(__dirname, '../.env');
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      // Remove surrounding quotes if any
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.substring(1, value.length - 1);
      }
      process.env[key] = value;
    }
  });
}

async function main() {
  loadEnv();
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    console.error('Error: TURSO_DATABASE_URL or TURSO_AUTH_TOKEN is missing in .env');
    return;
  }

  console.log('Connecting to Turso database:', url);
  const libsql = createClient({ url, authToken });
  const adapter = new PrismaLibSQL(libsql);
  const prisma = new PrismaClient({ adapter });

  try {
    const productCount = await prisma.product.count();
    const brandCount = await prisma.brand.count();
    const dealerCount = await prisma.dealer.count();

    console.log('--- TURSO DATABASE COUNT RESULTS ---');
    console.log('Total Brands:', brandCount);
    console.log('Total Products:', productCount);
    console.log('Total Dealers:', dealerCount);

    const productsByBrand = await prisma.product.groupBy({
      by: ['brandId'],
      _count: {
        id: true
      }
    });

    const brands = await prisma.brand.findMany();
    const brandMap = new Map(brands.map(b => [b.id, b.name]));

    console.log('\nProducts by Brand in Turso:');
    for (const group of productsByBrand) {
      console.log(`- ${brandMap.get(group.brandId) || group.brandId}: ${group._count.id} products`);
    }

  } catch (err) {
    console.error('Error querying Turso database:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
