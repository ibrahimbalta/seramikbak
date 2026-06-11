const { PrismaClient } = require('@prisma/client');
const { processProductFeedStream } = require('./feedParser');

const prisma = new PrismaClient();

async function run() {
  console.log('\n======================================================');
  console.log('          VitrA Ingestion & Normalization            ');
  console.log('======================================================\n');

  try {
    // 1. Fetch VitrA brand ID
    const brand = await prisma.brand.findFirst({
      where: { name: 'VitrA' }
    });

    if (!brand) {
      throw new Error('VitrA brand not found in database. Please seed the database first.');
    }

    console.log(`[Ingestion] Targeting Brand: ${brand.name} (ID: ${brand.id})`);

    // 2. Execute the ingestion pipeline
    const feedFile = 'scripts/ingestion/vitra_feed.jsonl';
    
    const fs = require('fs');
    if (!fs.existsSync(feedFile)) {
      throw new Error(`Scraper feed file not found at ${feedFile}. Please run the VitrA scraper first.`);
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

    console.log(`[Ingestion] Verified: VitrA has ${syncedCount} products in the database.`);
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
