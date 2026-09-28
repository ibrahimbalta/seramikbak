import test from 'node:test';
import assert from 'node:assert';
import { parseSemanticQuery } from '../src/lib/seo/semanticSearchParser.js';
import { resolvePseoMatrix } from '../src/lib/seo/pseoMatrixParser.js';
import { 
  generateProductSchema, 
  generateBrandSchema, 
  generateFaqSchema, 
  generateBreadcrumbSchema,
  generateLocalBusinessSchema 
} from '../src/lib/seo/schemaGenerator.js';
import { calculateTileRequirements } from '../src/lib/seo/guideContentEngine.js';
import { generateImageAltText } from '../src/lib/seo/imageSeo.js';

test('AI Semantic Search Parser - NLU Query Intent Extraction', () => {
  const query1 = 'bej mermer görünümlü 60x120 banyo seramiği';
  const parsed1 = parseSemanticQuery(query1);

  assert.strictEqual(parsed1.extracted.color, 'Bej');
  assert.strictEqual(parsed1.extracted.style, 'Mermer');
  assert.strictEqual(parsed1.extracted.size, '60x120');
  assert.strictEqual(parsed1.extracted.width, 60);
  assert.strictEqual(parsed1.extracted.height, 120);
  assert.strictEqual(parsed1.extracted.area, 'Banyo');
  assert.strictEqual(parsed1.isSemanticMatch, true);

  const query2 = 'vitra antrasit mat salon porselen';
  const parsed2 = parseSemanticQuery(query2);

  assert.strictEqual(parsed2.extracted.brand, 'VitrA');
  assert.strictEqual(parsed2.extracted.color, 'Antrasit');
  assert.strictEqual(parsed2.extracted.finish, 'Mat');
  assert.strictEqual(parsed2.extracted.area, 'Salon');

  const query3 = 'dona dayanıklı rektifiye 80x80 teras karosu';
  const parsed3 = parseSemanticQuery(query3);

  assert.strictEqual(parsed3.extracted.frostResistance, true);
  assert.strictEqual(parsed3.extracted.rectified, true);
  assert.strictEqual(parsed3.extracted.size, '80x80');
  assert.strictEqual(parsed3.extracted.area, 'Teras');
});

test('Programmatic SEO (pSEO) Matrix Parser', () => {
  const matrix1 = resolvePseoMatrix(['vitra-60x120-seramik']);
  assert.strictEqual(matrix1.brand?.name, 'VitrA');
  assert.strictEqual(matrix1.size?.label, '60x120 cm');
  assert.ok(matrix1.metaTitle.includes('VitrA'));
  assert.ok(matrix1.metaTitle.includes('60x120 cm'));

  const matrix2 = resolvePseoMatrix(['bien-banyo-seramikleri']);
  assert.strictEqual(matrix2.brand?.name, 'Bien Seramik');
  assert.strictEqual(matrix2.area?.name, 'Banyo');

  const matrix3 = resolvePseoMatrix(['vitra-istanbul-bayileri']);
  assert.strictEqual(matrix3.brand?.name, 'VitrA');
  assert.strictEqual(matrix3.city, 'İstanbul');
  assert.ok(matrix3.mainTitle.includes('İstanbul Yetkili Bayileri'));
});

test('Schema.org Structured Data Generator', () => {
  const dummyProduct = {
    id: 'prod-12345-uuid',
    name: 'Marmori Calacatta',
    code: 'VIT-CAL-001',
    width: 60,
    height: 120,
    finish: 'Parlak',
    color: 'Beyaz',
    style: 'Mermer',
    area: 'Banyo, Salon',
    imageUrl: 'https://example.com/calacatta.webp',
    textureUrl: 'https://example.com/calacatta-texture.jpg',
    trendyolPrice: 480,
    rectified: true,
    frostResistance: true,
    peiRating: 4,
    slipResistance: 'R10',
    thickness: 9.5,
    brand: { name: 'VitrA' }
  };

  const productSchema = generateProductSchema(dummyProduct, 'VitrA');
  assert.strictEqual(productSchema['@context'], 'https://schema.org/');
  assert.strictEqual(productSchema['@type'], 'Product');
  assert.strictEqual(productSchema.brand.name, 'VitrA');
  assert.strictEqual(productSchema.material, 'Porselen Seramik (Porcelain Stoneware)');
  assert.ok(productSchema.offers.lowPrice > 0);

  const brandSchema = generateBrandSchema({ name: 'VitrA', logoUrl: 'https://example.com/logo.png' });
  assert.strictEqual(brandSchema['@type'], 'Brand');
  assert.strictEqual(brandSchema.name, 'VitrA');

  const faqSchema = generateFaqSchema([
    { q: 'Porselen karo donar mı?', a: 'Su emmesi %0.5 altı olduğu için donmaz.' }
  ]);
  assert.strictEqual(faqSchema['@type'], 'FAQPage');
  assert.strictEqual(faqSchema.mainEntity.length, 1);

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Anasayfa', url: '/' },
    { name: 'VitrA', url: '/marka/vitra' }
  ]);
  assert.strictEqual(breadcrumbSchema['@type'], 'BreadcrumbList');
  assert.strictEqual(breadcrumbSchema.itemListElement.length, 2);

  const dealerSchema = generateLocalBusinessSchema({
    name: 'VitrA Yetkili Showroom Kadıköy',
    address: 'Bağdat Caddesi No:100',
    city: 'İstanbul',
    district: 'Kadıköy',
    phone: '0216 111 22 33',
    lat: 40.98,
    lng: 29.05
  });
  assert.strictEqual(dealerSchema['@type'], 'HomeGoodsStore');
  assert.strictEqual(dealerSchema.geo.latitude, 40.98);
});

test('Material & Cost Calculation Formula', () => {
  const standardCalc = calculateTileRequirements(50, false); // 50m², 10% waste
  assert.strictEqual(standardCalc.netAreaM2, 50);
  assert.strictEqual(standardCalc.grossAreaM2, 55);
  assert.ok(standardCalc.boxCount60x120 > 0);
  assert.ok(standardCalc.adhesiveBags25Kg > 0);
  assert.ok(standardCalc.groutBuckets5Kg > 0);
  assert.strictEqual(standardCalc.estimatedLaborCost, 55 * 300);

  const diagonalCalc = calculateTileRequirements(50, true); // 15% waste
  assert.strictEqual(diagonalCalc.grossAreaM2, 57.5);
  assert.strictEqual(diagonalCalc.wastePercentage, 15);
});

test('Image SEO Alt Text Generator', () => {
  const product = {
    name: 'Statuario White',
    width: 60,
    height: 120,
    finish: 'Parlak',
    color: 'Beyaz',
    style: 'Mermer',
    area: 'Banyo, Salon'
  };

  const alt = generateImageAltText(product, 'Çanakkale Seramik');
  assert.ok(alt.includes('Çanakkale Seramik'));
  assert.ok(alt.includes('Statuario White'));
  assert.ok(alt.includes('60x120 cm'));
  assert.ok(alt.includes('Parlak Yüzey'));
  assert.ok(alt.includes('Mermer Görünümlü'));
  assert.ok(alt.includes('Banyo'));
});
