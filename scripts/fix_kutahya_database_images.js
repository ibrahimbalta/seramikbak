/**
 * Database Migration Script: Fix NG Kütahya Seramik Repetitive Textures
 * 
 * Replaces the repetitive /textures/calacatta_gold.jpg (716 items) and /textures/vista_bej.jpg (147 items)
 * with authentic, distinct high-resolution architectural textures matching each product's
 * collection name, color, style, and finish.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export function resolveKutahyaTexture(product) {
  const name = (product.name || '').toLowerCase();
  const color = (product.color || '').toLowerCase();
  const style = (product.style || '').toLowerCase();
  const finish = (product.finish || '').toLowerCase();
  const fullText = `${name} ${color} ${style} ${finish}`;

  // 1. AHŞAP (Wood)
  const isWood = style.includes('ahşap') || style.includes('wood') || 
                 fullText.includes('sedir') || fullText.includes('taiga') || 
                 fullText.includes('palmwood') || fullText.includes('teak') || 
                 fullText.includes('ceviz') || fullText.includes('walnut') || 
                 fullText.includes('meşe') || fullText.includes('oak') || 
                 fullText.includes('akçaağaç') || fullText.includes('timber') || 
                 fullText.includes('parquet');
  if (isWood) {
    if (fullText.includes('gri') || fullText.includes('grey') || fullText.includes('fume') || fullText.includes('füme')) return '/textures/sedir_gri.jpg';
    if (fullText.includes('teak') || fullText.includes('ceviz') || fullText.includes('koyu') || fullText.includes('dark') || fullText.includes('walnut') || fullText.includes('kahve')) return '/textures/teak_ahsap.jpg';
    if (fullText.includes('akçaağaç') || fullText.includes('sedir') || fullText.includes('çam') || fullText.includes('pine') || fullText.includes('blonde')) return '/textures/sedir_akcaagac.jpg';
    return '/textures/natural_oak.jpg';
  }

  // 2. SPECIFIC NOTABLE COLLECTIONS
  // Vista
  if (fullText.includes('vista')) {
    if (fullText.includes('antrasit') || fullText.includes('siyah') || fullText.includes('black') || fullText.includes('dark')) return '/textures/vista_antrasit.jpg';
    if (fullText.includes('fume') || fullText.includes('füme') || fullText.includes('koyu gri')) return '/textures/vista_antrasit.jpg';
    if (fullText.includes('gri') || fullText.includes('grey')) return '/textures/thor_gri.jpg';
    return '/textures/vista_bej.jpg';
  }

  // Portland
  if (fullText.includes('portland')) {
    if (fullText.includes('fume') || fullText.includes('füme') || fullText.includes('antrasit') || fullText.includes('koyu') || fullText.includes('black')) return '/textures/portland_fume.jpg';
    if (fullText.includes('bej') || fullText.includes('bone') || fullText.includes('ivory')) return '/textures/swan_bone.jpg';
    return '/textures/vintage_gri.jpg';
  }

  // Swan
  if (fullText.includes('swan')) {
    if (fullText.includes('antrasit') || fullText.includes('siyah') || fullText.includes('dark')) return '/textures/albatros_antrasit.jpg';
    if (fullText.includes('gri') || fullText.includes('grey')) return '/textures/thor_gri.jpg';
    return '/textures/swan_bone.jpg';
  }

  // Pulpis
  if (fullText.includes('pulpis')) {
    if (fullText.includes('bej') || fullText.includes('vizon')) return '/textures/keops_bej.jpg';
    return '/textures/pulpis_gri.jpg';
  }

  // Trax / Endüstriyel / Pas / Metalik
  if (fullText.includes('trax') || fullText.includes('oxido') || fullText.includes('corten') || fullText.includes('pas') || fullText.includes('metal')) {
    return '/textures/trax_oxido.jpg';
  }

  // Magma / Basalt / Volkanik
  if (fullText.includes('magma') || fullText.includes('basalt') || fullText.includes('bazalt')) {
    return '/textures/magma_antrasit.jpg';
  }

  // Keops / Piramit
  if (fullText.includes('keops')) {
    return '/textures/keops_bej.jpg';
  }

  // Senzo / Statu / Statuario / Bianco
  if (fullText.includes('senzo') || fullText.includes('statu') || fullText.includes('bianco') || fullText.includes('carrara')) {
    return '/textures/senzo_beyaz.jpg';
  }

  // Calacatta
  if (fullText.includes('calacatta')) {
    return '/textures/calacatta_gold.jpg';
  }

  // Vintage / Ravel / Indiana
  if (fullText.includes('vintage') || fullText.includes('ravel') || fullText.includes('indiana')) {
    return '/textures/vintage_gri.jpg';
  }

  // Infinity / Beton / Loft / Urban / Cement
  if (fullText.includes('infinity') || fullText.includes('beton') || fullText.includes('loft') || fullText.includes('urban') || fullText.includes('cement')) {
    if (fullText.includes('antrasit') || fullText.includes('siyah') || fullText.includes('koyu') || fullText.includes('füme') || fullText.includes('fume')) return '/textures/loft_beton.jpg';
    return '/textures/concrete_light_grey.jpg';
  }

  // Traverten / Jura / Terra / Delmar
  if (fullText.includes('traverten') || fullText.includes('travertine') || fullText.includes('jura') || fullText.includes('terra')) {
    return '/textures/travertino_classico.jpg';
  }

  // 3. COLOR & MATERIAL CATEGORIES FOR ALL OTHER COLLECTIONS (Messina, Padova, Atlantis, Leonardo, etc.)
  // Dark / Anthracite / Black / Füme
  if (fullText.includes('antrasit') || fullText.includes('siyah') || fullText.includes('nero') || fullText.includes('black') || fullText.includes('dark') || fullText.includes('füme') || fullText.includes('fume')) {
    if (style.includes('taş') || fullText.includes('stone')) return '/textures/magma_antrasit.jpg';
    if (fullText.includes('leonardo') || fullText.includes('albatros') || fullText.includes('atlantis')) return '/textures/albatros_antrasit.jpg';
    return '/textures/borneo_antrasit.jpg';
  }

  // Gray / Gri
  if (fullText.includes('gri') || fullText.includes('grey') || fullText.includes('silver') || fullText.includes('açık gri') || fullText.includes('koyu gri')) {
    if (fullText.includes('messina') || fullText.includes('padova') || fullText.includes('sierra')) return '/textures/thor_gri.jpg';
    if (fullText.includes('valeria') || fullText.includes('adria') || fullText.includes('luton') || fullText.includes('bristol')) return '/textures/vintage_gri.jpg';
    return '/textures/thor_gri.jpg';
  }

  // Beige / Bone / Vizon / Cream / Latte
  if (fullText.includes('bej') || fullText.includes('beige') || fullText.includes('bone') || fullText.includes('vizon') || fullText.includes('krem') || fullText.includes('cream') || fullText.includes('latte') || fullText.includes('fildişi') || fullText.includes('marfil')) {
    if (fullText.includes('bone') || fullText.includes('fildişi')) return '/textures/swan_bone.jpg';
    if (fullText.includes('vizon') || fullText.includes('latte')) return '/textures/keops_bej.jpg';
    return '/textures/vista_bej.jpg';
  }

  // White / Beyaz
  if (fullText.includes('beyaz') || fullText.includes('white') || fullText.includes('kristal') || fullText.includes('snow')) {
    if (fullText.includes('calacatta') || fullText.includes('gold')) return '/textures/calacatta_gold.jpg';
    return '/textures/senzo_beyaz.jpg';
  }

  // Fallback based on style
  if (style.includes('taş') || style.includes('stone')) return '/textures/travertino_classico.jpg';
  if (style.includes('beton')) return '/textures/concrete_light_grey.jpg';
  return '/textures/senzo_beyaz.jpg';
}

async function run() {
  console.log('=== Updating NG Kütahya Seramik Database Images ===');
  
  const brand = await prisma.brand.findFirst({
    where: { name: { contains: 'Kütahya' } }
  });

  if (!brand) {
    console.error('Kütahya Seramik brand not found in database.');
    return;
  }

  const products = await prisma.product.findMany({
    where: { brandId: brand.id }
  });

  console.log(`Found ${products.length} Kütahya Seramik products.`);
  
  let updatedCount = 0;
  for (const prod of products) {
    const newTexture = resolveKutahyaTexture(prod);
    
    // Check if texture or imageUrl needs update
    if (prod.imageUrl !== newTexture || prod.textureUrl !== newTexture) {
      await prisma.product.update({
        where: { id: prod.id },
        data: {
          imageUrl: newTexture,
          textureUrl: newTexture
        }
      });
      updatedCount++;
    }
  }

  console.log(`Successfully updated ${updatedCount} products with authentic textures!`);
}

run()
  .catch(err => {
    console.error('Error during migration:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
