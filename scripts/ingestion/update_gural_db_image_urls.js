const prisma = require('../../src/lib/prisma').default;

async function updateGüralImageUrls() {
  console.log('Updating Güral Seramik product image URLs in database to use proxy...');
  
  const brand = await prisma.brand.findFirst({
    where: { name: { contains: 'Güral', mode: 'insensitive' } }
  });

  if (!brand) {
    console.error('Güral Seramik markası bulunamadı!');
    return;
  }

  const products = await prisma.product.findMany({
    where: { brandId: brand.id }
  });

  console.log(`Found ${products.length} Güral Seramik products in DB.`);

  let updated = 0;
  for (const p of products) {
    let newImg = p.imageUrl;
    let newTex = p.textureUrl;

    if (newImg && (newImg.startsWith('http://') || newImg.startsWith('https://')) && !newImg.includes('/api/proxy')) {
      newImg = `/api/proxy?url=${encodeURIComponent(newImg)}`;
    }
    if (newTex && (newTex.startsWith('http://') || newTex.startsWith('https://')) && !newTex.includes('/api/proxy')) {
      newTex = `/api/proxy?url=${encodeURIComponent(newTex)}`;
    }

    if (newImg !== p.imageUrl || newTex !== p.textureUrl) {
      await prisma.product.update({
        where: { id: p.id },
        data: {
          imageUrl: newImg,
          textureUrl: newTex
        }
      });
      updated++;
    }
  }

  console.log(`[SUCCESS] Updated ${updated} product image URLs in database!`);
}

updateGüralImageUrls().catch(console.error);
