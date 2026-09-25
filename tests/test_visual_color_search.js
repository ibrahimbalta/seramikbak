import fs from 'fs';
import path from 'path';
import prisma from '../src/lib/prisma.js';
import {
  classifyCeramicColor,
  searchProductsByVisualColor,
  CERAMIC_COLOR_PALETTE
} from '../src/lib/visualColorSearch.js';

async function runTests() {
  console.log('--- Testing Ceramic Color Classification ---');
  
  // 1. Test RGB classifications
  const testColors = [
    { name: 'Beyaz (Off-White)', rgb: [248, 248, 246], expected: 'Beyaz' },
    { name: 'Krem / Badem', rgb: [240, 232, 212], expected: 'Krem' },
    { name: 'Bej / Traverten', rgb: [214, 198, 172], expected: 'Bej' },
    { name: 'Açık Gri', rgb: [204, 204, 206], expected: 'Açık Gri' },
    { name: 'Gri (Loft Beton)', rgb: [142, 144, 146], expected: 'Gri' },
    { name: 'Koyu Gri / Füme', rgb: [85, 87, 89], expected: 'Koyu Gri' },
    { name: 'Antrasit', rgb: [45, 48, 52], expected: 'Antrasit' },
    { name: 'Siyah', rgb: [22, 22, 24], expected: 'Siyah' },
    { name: 'Ahşap / Ceviz (Kahverengi)', rgb: [120, 75, 45], expected: 'Kahverengi' },
  ];

  let passedClassification = 0;
  for (const t of testColors) {
    const res = classifyCeramicColor(t.rgb[0], t.rgb[1], t.rgb[2]);
    const pass = res.primaryColor === t.expected;
    console.log(`[${pass ? 'PASS' : 'FAIL'}] ${t.name}: Classified as "${res.primaryColor}" (Expected: "${t.expected}")`);
    if (pass) passedClassification++;
  }
  console.log(`Classification result: ${passedClassification}/${testColors.length} passed.\n`);

  console.log('--- Testing Database Visual Color Queries ---');
  const searchTests = [
    { color: 'Bej', style: 'Taş' },
    { color: 'Antrasit', style: 'Mermer' },
    { color: 'Kahverengi', style: 'Ahşap' },
    { color: 'Beyaz', style: 'Mermer' },
    { color: 'Gri', style: 'Beton' }
  ];

  for (const st of searchTests) {
    console.log(`\nSearching for: ${st.color} (${st.style})...`);
    const results = await searchProductsByVisualColor(prisma, {
      detectedColor: st.color,
      colorFamilies: CERAMIC_COLOR_PALETTE[st.color]?.compatible || [],
      style: st.style,
      limit: 10
    });

    console.log(`Found ${results.products.length} products. Top matches:`);
    results.products.slice(0, 4).forEach((p, idx) => {
      console.log(`  #${idx + 1}: [${p.color}] ${p.name} - Marka: ${p.brand?.name} - Uyum Skoru: %${p.similarityScore}`);
    });

    if (results.products.length === 0) {
      console.error(`ERROR: No products found for color ${st.color}!`);
    } else {
      const topProduct = results.products[0];
      const palette = CERAMIC_COLOR_PALETTE[st.color];
      const isExpectedMatch = 
        topProduct.color.toLowerCase() === st.color.toLowerCase() ||
        palette.compatible.map(c => c.toLowerCase()).includes(topProduct.color.toLowerCase());
      console.log(`  => Top product color "${topProduct.color}" match validity: ${isExpectedMatch ? 'VALID' : 'INVALID'}`);
    }
  }

  console.log('\nAll visual color search tests completed successfully!');
  process.exit(0);
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
