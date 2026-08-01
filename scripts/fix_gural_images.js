const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function getTextureForProduct(p) {
  const name = (p.name || '').toLowerCase();
  const style = (p.style || '').toLowerCase();
  const color = (p.color || '').toLowerCase();
  const code = (p.code || '').toLowerCase();

  if (style.includes('ahşap') || style.includes('wood') || name.includes('kayın') || name.includes('wood') || name.includes('oak') || name.includes('ahsap')) {
    if (color.includes('koyu') || name.includes('teak') || name.includes('dark')) {
      return '/textures/teak_ahsap.jpg';
    }
    return '/textures/natural_oak.jpg';
  }

  if (style.includes('mermer') || style.includes('marble') || name.includes('calacatta') || name.includes('mermer') || name.includes('marmo')) {
    if (color.includes('antrasit') || color.includes('siyah') || name.includes('dark') || name.includes('black')) {
      return '/textures/borneo_antrasit.jpg';
    }
    return '/textures/calacatta_gold.jpg';
  }

  if (style.includes('taş') || style.includes('stone') || name.includes('travertin') || name.includes('vista') || color.includes('bej')) {
    return '/textures/travertino_classico.jpg';
  }

  // Beton / Concrete / Default
  if (color.includes('antrasit') || color.includes('siyah') || name.includes('dark') || name.includes('black') || name.includes('antrasit')) {
    return '/textures/albatros_antrasit.jpg';
  }
  if (color.includes('kahve') || color.includes('brown') || name.includes('brown')) {
    return '/textures/vista_bej.jpg';
  }
  
  return '/textures/concrete_light_grey.jpg';
}

async function main() {
  const guralBrand = await prisma.brand.findFirst({
    where: {
      OR: [
        { username: 'gural' },
        { name: { contains: 'Güral' } },
        { name: { contains: 'Gural' } }
      ]
    }
  });

  if (!guralBrand) {
    console.error('Güral brand not found');
    return;
  }

  console.log(`Found Güral Seramik brand: ${guralBrand.id}`);

  const products = await prisma.product.findMany({
    where: {
      OR: [
        { brandId: guralBrand.id },
        { imageUrl: { contains: 'guralporselen.com' } },
        { textureUrl: { contains: 'guralporselen.com' } }
      ]
    }
  });

  console.log(`Updating ${products.length} products with broken/dead image URLs...`);

  let updatedCount = 0;

  for (const p of products) {
    const newUrl = getTextureForProduct(p);
    await prisma.product.update({
      where: { id: p.id },
      data: {
        imageUrl: newUrl,
        textureUrl: newUrl
      }
    });
    updatedCount++;
  }

  console.log(`Successfully updated ${updatedCount} products to high-res local textures!`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
