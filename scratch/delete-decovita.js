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

async function main() {
  console.log('Searching for Decovita brand...');
  const brand = await prisma.brand.findFirst({
    where: { name: { contains: 'Decovita' } }
  });

  if (!brand) {
    console.log('Decovita brand not found in the database.');
    return;
  }

  console.log(`Found Brand: ${brand.name} (ID: ${brand.id}). Deleting...`);
  
  // Delete brand (cascades to products)
  await prisma.brand.delete({
    where: { id: brand.id }
  });

  console.log('Successfully deleted Decovita brand and all its products!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
