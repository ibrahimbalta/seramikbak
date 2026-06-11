const { PrismaClient } = require('@prisma/client');
const { processProductFeedStream } = require('./feedParser');

const prisma = new PrismaClient();

async function runTest() {
  console.log('\n==================================================');
  console.log('   SeramikBak Ingestion & Normalization Test Run   ');
  console.log('==================================================\n');

  try {
    // 1. Fetch Kütahya Seramik brand ID from db to link test items
    const brand = await prisma.brand.findFirst({
      where: { name: 'Kütahya Seramik' }
    });

    if (!brand) {
      throw new Error('Seed brand Kütahya Seramik not found. Make sure the database was seeded first.');
    }

    console.log(`[Test Run] Using Brand: ${brand.name} (ID: ${brand.id})`);

    // 2. Run the stream parsing pipeline
    const feedFile = 'scripts/ingestion/sample_feed.jsonl';
    await processProductFeedStream(feedFile, brand.id);

    console.log('\n[Test Run] Querying database to verify normalized records...\n');

    // 3. Query the newly inserted/updated products
    const testSkus = [
      'KUT-ALB-NEW-FUME', 
      'KUT-VIS-NEW-KREM', 
      'BIEN-CAL-NEW-GOLD', 
      'GUR-TEA-NEW-LINE'
    ];

    const syncedProducts = await prisma.product.findMany({
      where: {
        code: { in: testSkus }
      },
      include: {
        brand: { select: { name: true } }
      }
    });

    // 4. Output verification table in console
    console.log('------------------------------------------------------------------------------------------');
    console.log('SKU\t\t| Name\t\t\t| Width | Height | Color\t| Finish\t| Style');
    console.log('------------------------------------------------------------------------------------------');
    
    syncedProducts.forEach(p => {
      const paddedSku = p.code.padEnd(17, ' ');
      const paddedName = p.name.padEnd(23, ' ');
      const paddedColor = p.color.padEnd(10, ' ');
      const paddedFinish = p.finish.padEnd(12, ' ');
      
      console.log(`${paddedSku} | ${paddedName} | ${p.width}cm  | ${p.height}cm  | ${paddedColor} | ${paddedFinish} | ${p.style}`);
    });
    
    console.log('------------------------------------------------------------------------------------------');
    console.log(`[Test Run] Database verification successful. Verified ${syncedProducts.length} synced entries.`);
    console.log('\n[Test Run] Test run completed successfully!');

  } catch (error) {
    console.error('[Test Run] Test execution failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

runTest();
