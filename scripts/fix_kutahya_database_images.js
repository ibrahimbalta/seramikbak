/**
 * Database Migration Script: Fix NG Kütahya Seramik Repetitive Textures
 * 
 * Replaces broken external URLs with authentic, distinct high-resolution architectural
 * textures matching each product's collection name, color, style, and finish with hash diversity.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: { url: process.env.DIRECT_URL || process.env.DATABASE_URL }
  }
});

export function resolveKutahyaTexture(product) {
  const name = (product.name || '').toLowerCase();
  const color = (product.color || '').toLowerCase();
  const style = (product.style || '').toLowerCase();
  const finish = (product.finish || '').toLowerCase();
  const fullText = `${name} ${color} ${style} ${finish}`;

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) & 0xffffffff;
  }
  const absHash = Math.abs(hash);

  // 1. AHŞAP / WOOD (Albero, Sedir, Taiga, Palmwood, Teak, vb.)
  const isWood = style.includes('ahşap') || style.includes('wood') || 
                 fullText.includes('albero') || fullText.includes('sedir') || fullText.includes('taiga') || 
                 fullText.includes('palmwood') || fullText.includes('teak') || 
                 fullText.includes('ceviz') || fullText.includes('walnut') || 
                 fullText.includes('meşe') || fullText.includes('oak') || 
                 fullText.includes('akçaağaç') || fullText.includes('timber') || 
                 fullText.includes('parquet');
  if (isWood) {
    if (fullText.includes('gri') || fullText.includes('grey') || fullText.includes('fume') || fullText.includes('füme')) return '/textures/sedir_gri.jpg';
    if (fullText.includes('teak') || fullText.includes('ceviz') || fullText.includes('koyu') || fullText.includes('dark') || fullText.includes('walnut') || fullText.includes('kahve')) return '/textures/teak_ahsap.jpg';
    if (fullText.includes('akçaağaç') || fullText.includes('sedir') || fullText.includes('çam') || fullText.includes('pine') || fullText.includes('blonde')) return '/textures/sedir_akcaagac.jpg';
    const woodPool = ['/textures/natural_oak.jpg', '/textures/teak_ahsap.jpg', '/textures/sedir_akcaagac.jpg'];
    return woodPool[absHash % woodPool.length];
  }

  // 2. SPECIFIC NOTABLE COLLECTIONS
  if (fullText.includes('vista')) {
    if (fullText.includes('antrasit') || fullText.includes('siyah') || fullText.includes('black') || fullText.includes('dark')) return '/textures/vista_antrasit.jpg';
    if (fullText.includes('fume') || fullText.includes('füme') || fullText.includes('koyu gri')) return '/textures/vista_antrasit.jpg';
    if (fullText.includes('gri') || fullText.includes('grey')) return '/textures/thor_gri.jpg';
    return '/textures/vista_bej.jpg';
  }

  if (fullText.includes('portland')) {
    if (fullText.includes('fume') || fullText.includes('füme') || fullText.includes('antrasit') || fullText.includes('koyu') || fullText.includes('black')) return '/textures/portland_fume.jpg';
    if (fullText.includes('bej') || fullText.includes('bone') || fullText.includes('ivory')) return '/textures/swan_bone.jpg';
    return '/textures/vintage_gri.jpg';
  }

  if (fullText.includes('swan')) {
    if (fullText.includes('antrasit') || fullText.includes('siyah') || fullText.includes('dark')) return '/textures/albatros_antrasit.jpg';
    if (fullText.includes('gri') || fullText.includes('grey')) return '/textures/thor_gri.jpg';
    return '/textures/swan_bone.jpg';
  }

  if (fullText.includes('pulpis')) {
    if (fullText.includes('bej') || fullText.includes('vizon')) return '/textures/keops_bej.jpg';
    return '/textures/pulpis_gri.jpg';
  }

  if (fullText.includes('trax') || fullText.includes('oxido') || fullText.includes('corten') || fullText.includes('pas') || fullText.includes('metal')) {
    return '/textures/trax_oxido.jpg';
  }

  if (fullText.includes('magma') || fullText.includes('basalt') || fullText.includes('bazalt')) {
    return '/textures/magma_antrasit.jpg';
  }

  if (fullText.includes('keops')) {
    return '/textures/keops_bej.jpg';
  }

  if (fullText.includes('senzo') || fullText.includes('statu') || fullText.includes('bianco') || fullText.includes('carrara')) {
    return '/textures/senzo_beyaz.jpg';
  }

  if (fullText.includes('calacatta')) {
    return '/textures/calacatta_gold.jpg';
  }

  if (fullText.includes('vintage') || fullText.includes('ravel') || fullText.includes('indiana')) {
    return '/textures/vintage_gri.jpg';
  }

  if (fullText.includes('infinity') || fullText.includes('loft') || fullText.includes('urban') || fullText.includes('cement')) {
    if (fullText.includes('antrasit') || fullText.includes('siyah') || fullText.includes('koyu') || fullText.includes('füme') || fullText.includes('fume')) return '/textures/loft_beton.jpg';
    return '/textures/concrete_light_grey.jpg';
  }

  if (fullText.includes('traverten') || fullText.includes('travertine') || fullText.includes('jura') || fullText.includes('terra')) {
    return '/textures/travertino_classico.jpg';
  }

  // 3. COLOR & MATERIAL POOLS
  if (fullText.includes('antrasit') || fullText.includes('siyah') || fullText.includes('nero') || fullText.includes('black') || fullText.includes('dark') || fullText.includes('füme') || fullText.includes('fume')) {
    if (style.includes('taş') || fullText.includes('stone')) return '/textures/magma_antrasit.jpg';
    if (fullText.includes('leonardo') || fullText.includes('albatros') || fullText.includes('atlantis')) return '/textures/albatros_antrasit.jpg';
    const darkPool = ['/textures/borneo_antrasit.jpg', '/textures/magma_antrasit.jpg', '/textures/albatros_antrasit.jpg', '/textures/loft_beton.jpg', '/textures/vista_antrasit.jpg'];
    return darkPool[absHash % darkPool.length];
  }

  if (fullText.includes('gri') || fullText.includes('grey') || fullText.includes('silver') || fullText.includes('açık gri') || fullText.includes('koyu gri')) {
    if (fullText.includes('messina') || fullText.includes('padova') || fullText.includes('sierra')) return '/textures/thor_gri.jpg';
    if (fullText.includes('valeria') || fullText.includes('adria') || fullText.includes('luton') || fullText.includes('bristol')) return '/textures/vintage_gri.jpg';
    const greyPool = ['/textures/thor_gri.jpg', '/textures/vintage_gri.jpg', '/textures/pulpis_gri.jpg', '/textures/concrete_light_grey.jpg'];
    return greyPool[absHash % greyPool.length];
  }

  if (fullText.includes('bej') || fullText.includes('beige') || fullText.includes('bone') || fullText.includes('vizon') || fullText.includes('krem') || fullText.includes('cream') || fullText.includes('latte') || fullText.includes('fildişi') || fullText.includes('marfil')) {
    if (fullText.includes('bone') || fullText.includes('fildişi')) return '/textures/swan_bone.jpg';
    if (fullText.includes('vizon') || fullText.includes('latte')) return '/textures/keops_bej.jpg';
    const beigePool = ['/textures/vista_bej.jpg', '/textures/keops_bej.jpg', '/textures/swan_bone.jpg', '/textures/travertino_classico.jpg'];
    return beigePool[absHash % beigePool.length];
  }

  if (fullText.includes('beyaz') || fullText.includes('white') || fullText.includes('kristal') || fullText.includes('snow')) {
    if (fullText.includes('calacatta') || fullText.includes('gold')) return '/textures/calacatta_gold.jpg';
    const whitePool = ['/textures/senzo_beyaz.jpg', '/textures/calacatta_gold.jpg'];
    return whitePool[absHash % whitePool.length];
  }

  if (style.includes('mermer')) {
    const marblePool = ['/textures/calacatta_gold.jpg', '/textures/senzo_beyaz.jpg', '/textures/swan_bone.jpg', '/textures/borneo_antrasit.jpg'];
    return marblePool[absHash % marblePool.length];
  }
  if (style.includes('taş') || style.includes('stone')) {
    const stonePool = ['/textures/travertino_classico.jpg', '/textures/thor_gri.jpg', '/textures/vintage_gri.jpg', '/textures/magma_antrasit.jpg'];
    return stonePool[absHash % stonePool.length];
  }
  if (style.includes('beton')) {
    const betonPool = ['/textures/concrete_light_grey.jpg', '/textures/loft_beton.jpg', '/textures/vintage_gri.jpg'];
    return betonPool[absHash % betonPool.length];
  }

  const defaultPool = ['/textures/senzo_beyaz.jpg', '/textures/thor_gri.jpg', '/textures/vista_bej.jpg', '/textures/calacatta_gold.jpg'];
  return defaultPool[absHash % defaultPool.length];
}

async function run() {
  const brand = await prisma.brand.findFirst({
    where: { name: { contains: 'Kütahya', mode: 'insensitive' } }
  });

  if (!brand) return;

  const products = await prisma.product.findMany({
    where: { brandId: brand.id },
    select: { id: true, name: true, color: true, style: true, finish: true }
  });

  console.log(`Processing ${products.length} Kütahya Seramik products...`);

  const chunkSize = 100;
  for (let i = 0; i < products.length; i += chunkSize) {
    const chunk = products.slice(i, i + chunkSize);

    const valuesList = chunk.map(p => {
      const tex = resolveKutahyaTexture(p);
      const escapedId = p.id.replace(/'/g, "''");
      const escapedTex = tex.replace(/'/g, "''");
      return `('${escapedId}', '${escapedTex}')`;
    }).join(',\n');

    const sql = `
      UPDATE "Product" AS p
      SET "imageUrl" = c.texture, "textureUrl" = c.texture
      FROM (VALUES ${valuesList}) AS c(id, texture)
      WHERE p.id = c.id;
    `;

    await prisma.$executeRawUnsafe(sql);
  }

  console.log('Done!');
}

run().catch(console.error).finally(() => prisma.$disconnect());
