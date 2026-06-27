const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const productCount = await prisma.product.count();
    const brandCount = await prisma.brand.count();
    const dealerCount = await prisma.dealer.count();
    
    console.log('--- DATABASE COUNT RESULTS ---');
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

    console.log('\nProducts by Brand:');
    for (const group of productsByBrand) {
      console.log(`- ${brandMap.get(group.brandId) || group.brandId}: ${group._count.id} products`);
    }
  } catch (err) {
    console.error('Error querying database:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
