const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkProduct() {
  const products = await prisma.product.findMany({
    take: 5,
    include: { brand: true }
  });
  console.log("=== First 5 Products ===");
  console.log(JSON.stringify(products, null, 2));

  const count = await prisma.product.count();
  console.log("Total products in DB:", count);
  
  await prisma.$disconnect();
}

checkProduct();
