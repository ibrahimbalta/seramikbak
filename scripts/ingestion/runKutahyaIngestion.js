const { PrismaClient } = require('@prisma/client');
const { processProductFeedStream } = require('./feedParser');

const prisma = new PrismaClient();

async function run() {
  console.log('\n======================================================');
  console.log('    NG Kütahya Seramik Ingestion & Normalization     ');
  console.log('======================================================\n');

  try {
    // 1. Fetch the correct brand ID
    let brand = await prisma.brand.findFirst({
      where: { name: 'NG Kütahya Seramik' }
    });

    if (!brand) {
      // Fallback in case the seed wasn't run with the name change
      brand = await prisma.brand.findFirst({
        where: { name: 'Kütahya Seramik' }
      });
    }

    if (!brand) {
      throw new Error('NG Kütahya Seramik brand not found in database. Please seed the database first.');
    }

    console.log(`[Ingestion] Targeting Brand: ${brand.name} (ID: ${brand.id})`);

    // 2. Execute the ingestion pipeline
    const feedFile = 'scripts/ingestion/kutahya_feed.jsonl';
    
    // Check if feed file exists
    const fs = require('fs');
    if (!fs.existsSync(feedFile)) {
      throw new Error(`Scraper feed file not found at ${feedFile}. Please run the scraper first.`);
    }

    await processProductFeedStream(feedFile, brand.id);
    
    console.log('\n[Ingestion] Querying database to verify synchronized products...');
    
    const syncedCount = await prisma.product.count({
      where: { brandId: brand.id }
    });
    
    const sampleProducts = await prisma.product.findMany({
      where: { brandId: brand.id },
      take: 5
    });

    console.log(`[Ingestion] Verified: NG Kütahya Seramik has ${syncedCount} products in the database.`);
    console.log('\n--- Synced Sample Products ---');
    sampleProducts.forEach(p => {
      console.log(`- Sku: ${p.code.padEnd(16)} | Name: ${p.name.padEnd(24)} | Size: ${p.width}x${p.height} cm | Color: ${p.color.padEnd(8)} | Finish: ${p.finish.padEnd(8)} | Style: ${p.style}`);
    });
    
    console.log('\n[Ingestion] Ingestion pipeline execution completed successfully!');

  } catch (error) {
    console.error('[Ingestion] Ingestion pipeline failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

run();
