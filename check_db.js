const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const brands = await p.brand.findMany({ select: { id: true, name: true } });
  console.log('BRANDS:', brands.length);
  brands.forEach(b => console.log(`  - ${b.name} (${b.id})`));

  const products = await p.product.findMany({ select: { id: true, name: true, brandId: true } });
  console.log('\nPRODUCTS:', products.length);
  products.forEach(pr => {
    const brand = brands.find(b => b.id === pr.brandId);
    console.log(`  - ${pr.name} | Marka: ${brand ? brand.name : 'YOK'}`);
  });

  await p.$disconnect();
}

main().catch(e => { console.error(e); p.$disconnect(); });
