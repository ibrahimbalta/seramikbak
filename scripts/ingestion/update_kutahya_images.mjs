import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const BASE_URL = 'https://ngkutahyaseramik.com.tr';

async function updateKutahyaImages() {
  console.log('🚀 Starting NG Kütahya Seramik image update from ngkutahyaseramik.com.tr API...');

  const brand = await prisma.brand.findFirst({
    where: {
      OR: [
        { name: { contains: 'Kütahya', mode: 'insensitive' } },
        { slug: { contains: 'kutahya', mode: 'insensitive' } }
      ]
    }
  });

  if (!brand) {
    throw new Error('NG Kütahya Seramik brand not found in database.');
  }

  console.log(`Found Brand: ${brand.name} (${brand.id})`);

  const dbProducts = await prisma.product.findMany({
    where: { brandId: brand.id },
    select: { id: true, code: true, name: true, style: true, imageUrl: true }
  });

  console.log(`Fetched ${dbProducts.length} products from database for Kütahya.`);

  // 1. Fetch all products from all 4 NG brands
  const brands = ['NgSeramik', 'NgStone', 'NgSlim', 'NgPerforma'];
  const codeToProduct = new Map();

  for (const b of brands) {
    console.log(`Fetching products for brand: ${b}...`);
    const res = await fetch(`${BASE_URL}/api/public/products?lang=tr&brand=${b}&groupVariants=false&pageSize=2000`, {
      headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' }
    });
    const d = await res.json();
    (d.items || []).forEach(item => {
      if (item.productCode && item.primaryImageUrl) {
        codeToProduct.set(item.productCode.trim().toUpperCase(), item);
      }
    });
  }
  console.log(`Loaded ${codeToProduct.size} unique product codes from NG Kütahya API.`);

  // 2. Fetch all collections
  const collNameToImage = new Map();
  for (const b of brands) {
    const res = await fetch(`${BASE_URL}/api/public/collections?lang=tr&brand=${b}`, {
      headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' }
    });
    const colls = await res.json();
    (colls || []).forEach(c => {
      if (c.name && c.imageUrl) {
        collNameToImage.set(c.name.trim().toUpperCase(), c.imageUrl);
      }
    });
  }
  console.log(`Loaded ${collNameToImage.size} collections from NG Kütahya API.`);

  // 3. Fetch all categories
  const resCat = await fetch(`${BASE_URL}/api/public/categories?lang=tr`, {
    headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' }
  });
  const cats = await resCat.json();
  const catNameToImage = new Map();
  cats.forEach(c => {
    if (c.name && c.imageUrl) {
      catNameToImage.set(c.name.trim().toUpperCase(), c.imageUrl);
    }
  });
  console.log(`Loaded ${catNameToImage.size} categories from NG Kütahya API.`);

  let exactMatches = 0;
  let collMatches = 0;
  let catMatches = 0;

  const updates = [];

  for (const p of dbProducts) {
    const code = (p.code || '').trim().toUpperCase();
    const stripped = code.replace(/R[NP]?$|P$/, '');

    let chosenImageUrl = null;
    let matchType = '';

    if (codeToProduct.has(code)) {
      const apiItem = codeToProduct.get(code);
      chosenImageUrl = apiItem.primaryImageUrl;
      matchType = 'exact-code';
      exactMatches++;
    } else if (codeToProduct.has(stripped)) {
      const apiItem = codeToProduct.get(stripped);
      chosenImageUrl = apiItem.primaryImageUrl;
      matchType = 'stripped-code';
      exactMatches++;
    } else {
      const cleanName = p.name.replace(/^NG\s+Kütahya\s+/i, '').trim();
      const words = cleanName.split(/\s+/);
      let collImg = null;

      if (words.length >= 1 && collNameToImage.has(words[0].toUpperCase())) {
        collImg = collNameToImage.get(words[0].toUpperCase());
      } else if (words.length >= 2 && collNameToImage.has(`${words[0]} ${words[1]}`.toUpperCase())) {
        collImg = collNameToImage.get(`${words[0]} ${words[1]}`.toUpperCase());
      }

      if (collImg) {
        chosenImageUrl = collImg;
        matchType = 'collection';
        collMatches++;
      } else {
        const style = (p.style || '').toUpperCase();
        let catImg = null;
        if (style.includes('MERMER')) catImg = catNameToImage.get('MERMER');
        else if (style.includes('TAŞ')) catImg = catNameToImage.get('TAŞ');
        else if (style.includes('AHŞAP')) catImg = catNameToImage.get('AHŞAP');
        else if (style.includes('BETON') || style.includes('CEMENT')) catImg = catNameToImage.get('CEMENT');
        else catImg = catNameToImage.get('MERMER'); // fallback

        chosenImageUrl = catImg;
        matchType = 'category';
        catMatches++;
      }
    }

    if (chosenImageUrl) {
      const fullUrl = chosenImageUrl.startsWith('http') ? chosenImageUrl : `${BASE_URL}${chosenImageUrl.startsWith('/') ? '' : '/'}${chosenImageUrl}`;
      updates.push({
        id: p.id,
        imageUrl: fullUrl,
        textureUrl: fullUrl
      });
    }
  }

  console.log(`\nMatch Results:`);
  console.log(`- Exact Code Matches: ${exactMatches}`);
  console.log(`- Collection Matches: ${collMatches}`);
  console.log(`- Category Matches: ${catMatches}`);
  console.log(`- Total to update: ${updates.length} / ${dbProducts.length}`);

  // Perform updates in parallel chunks of 25
  const chunkSize = 25;
  for (let i = 0; i < updates.length; i += chunkSize) {
    const chunk = updates.slice(i, i + chunkSize);
    await Promise.all(
      chunk.map(u =>
        prisma.product.update({
          where: { id: u.id },
          data: {
            imageUrl: u.imageUrl,
            textureUrl: u.textureUrl
          }
        })
      )
    );
    if ((i + chunkSize) % 200 === 0 || i + chunkSize >= updates.length) {
      console.log(`Updated ${Math.min(i + chunkSize, updates.length)} / ${updates.length} products in DB...`);
    }
  }

  console.log('✅ Successfully updated all NG Kütahya Seramik product images in Supabase database!');
  await prisma.$disconnect();
}

updateKutahyaImages().catch(err => {
  console.error('❌ Error updating NG Kütahya images:', err);
  process.exit(1);
});
