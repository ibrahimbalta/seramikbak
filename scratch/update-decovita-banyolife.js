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
  console.log('Connecting to remote Turso database...');
  const libsql = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
  prisma = new PrismaClient({ adapter: new PrismaLibSQL(libsql) });
} else {
  console.log('Connecting to local SQLite database...');
  prisma = new PrismaClient();
}

function cleanString(str) {
  return str
    .toLowerCase()
    .replace('serisi', '')
    .replace('decovita', '')
    .replace(/[^a-z0-9]/g, '');
}

async function main() {
  const decovitaBrand = await prisma.brand.findFirst({
    where: { name: { contains: 'Decovita' } }
  });
  
  if (!decovitaBrand) {
    console.error('[Error] Decovita brand not found in the database.');
    return;
  }
  
  console.log(`Found Decovita brand: ${decovitaBrand.name} (ID: ${decovitaBrand.id})`);
  
  const dbProducts = await prisma.product.findMany({
    where: { brandId: decovitaBrand.id }
  });
  
  const scrapedPath = path.join(__dirname, 'banyolife-scraped.json');
  if (!fs.existsSync(scrapedPath)) {
    console.error('[Error] banyolife-scraped.json not found in scratch folder.');
    return;
  }
  const scrapedProducts = JSON.parse(fs.readFileSync(scrapedPath, 'utf8'));
  
  console.log(`Loaded ${dbProducts.length} database products.`);
  console.log(`Loaded ${scrapedProducts.length} scraped products from Banyolife.`);
  
  let updateCount = 0;
  
  for (const dbProd of dbProducts) {
    const dbClean = cleanString(dbProd.name);
    
    // Find matching scraped items
    const matches = scrapedProducts.filter(s => {
      const sClean = cleanString(s.title);
      return sClean.includes(dbClean);
    });
    
    if (matches.length > 0) {
      const bestMatch = matches[0];
      const highResImg = bestMatch.imageUrl.replace('/thumb/', '/buyuk/');
      
      console.log(`\n[Matching] "${dbProd.name}" (${dbProd.code}) -> "${bestMatch.title}"`);
      console.log(`  Old Image: ${dbProd.imageUrl}`);
      console.log(`  New Image: ${highResImg}`);
      
      // Update in database
      await prisma.product.update({
        where: { id: dbProd.id },
        data: {
          imageUrl: highResImg,
          textureUrl: highResImg
        }
      });
      updateCount++;
    } else {
      console.log(`\n[No Match] "${dbProd.name}" (${dbProd.code}) remains unchanged.`);
    }
  }
  
  console.log(`\nDatabase update complete. Total updated products: ${updateCount}/${dbProducts.length}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
