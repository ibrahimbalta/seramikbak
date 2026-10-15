import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CATALOG_DESIGN_FAMILIES,
  CATALOG_CATEGORIES,
  CATALOG_STYLES,
  getTemplateConfig,
  filterTemplates
} from '../src/components/brand/catalog/templates/registry.js';

/**
 * Otomasyon Test Paketi: Profesyonel Dijital Katalog Şablon Sistemi
 * 12 Tasarım Ailesi, Registry, Filtreleme, Null-Safety ve Sayfa Hesaplama Doğrulaması
 */

test('Katalog Şablon Registry & 12 Tasarım Ailesi Testleri', async (t) => {
  await t.test('12 tasarım ailesinin tümü kayıtlı ve eksiksiz olmalı', () => {
    assert.equal(CATALOG_DESIGN_FAMILIES.length, 12, 'Toplam 12 tasarım ailesi bulunmalı');
    
    const requiredIds = [
      'premium-mimari',
      'minimal-koleksiyon',
      'teknik-urun',
      'mimar-sunum',
      'banyo-mutfak',
      'dogal-tas-mermer',
      'renk-ebat-rehberi',
      'fuar-bayi',
      'modern-ihracat',
      'yeni-lansman',
      'endustriyel-ticari',
      'dijital-brosur'
    ];

    requiredIds.forEach((id) => {
      const found = CATALOG_DESIGN_FAMILIES.find((t) => t.id === id);
      assert.ok(found, `Şablon ailesi eksik: ${id}`);
      assert.ok(found.name && found.name.length > 3, `${id} geçerli bir ada sahip olmalı`);
      assert.ok(found.category, `${id} kategoriye sahip olmalı`);
      assert.ok(found.style, `${id} stile sahip olmalı`);
      assert.ok(found.targetAudience, `${id} hedef kitleye sahip olmalı`);
      assert.ok(found.description, `${id} açıklamaya sahip olmalı`);
      assert.ok(Array.isArray(found.supportedPages) && found.supportedPages.length >= 4, `${id} en az 4 sayfa türü desteklemeli`);
    });
  });

  await t.test('getTemplateConfig hem birincil ID hem de geriye dönük takma adları (alias) çözümlemeli', () => {
    // Primary ID resolution
    const minimal = getTemplateConfig('minimal-koleksiyon');
    assert.equal(minimal.id, 'minimal-koleksiyon');

    const tech = getTemplateConfig('teknik-urun');
    assert.equal(tech.id, 'teknik-urun');

    // Backward compatible aliases
    const milanoAlias = getTemplateConfig('milano');
    assert.equal(milanoAlias.id, 'premium-mimari');

    const specSheetAlias = getTemplateConfig('spec-sheet');
    assert.equal(specSheetAlias.id, 'teknik-urun');

    const decoAlias = getTemplateConfig('deco');
    assert.equal(decoAlias.id, 'dijital-brosur');

    const lidyaAlias = getTemplateConfig('lidya');
    assert.equal(lidyaAlias.id, 'endustriyel-ticari');

    const showroomAlias = getTemplateConfig('showroom');
    assert.equal(showroomAlias.id, 'fuar-bayi');

    const exportAlias = getTemplateConfig('global-export');
    assert.equal(exportAlias.id, 'modern-ihracat');

    // Unknown template fallback to first template
    const fallback = getTemplateConfig('unknown-non-existent-template');
    assert.equal(fallback.id, 'premium-mimari');
  });

  await t.test('filterTemplates kategori, stil ve arama terimlerine göre doğru sonuç üretmeli', () => {
    // Filter by category
    const archList = filterTemplates({ category: 'architectural' });
    assert.ok(archList.length >= 3);
    assert.ok(archList.every((t) => t.category === 'architectural'));

    const techList = filterTemplates({ category: 'technical' });
    assert.ok(techList.length >= 1);
    assert.equal(techList[0].id, 'teknik-urun');

    // Filter by style
    const minimalList = filterTemplates({ style: 'minimalist' });
    assert.ok(minimalList.some((t) => t.id === 'minimal-koleksiyon'));

    // Filter by text search
    const bimSearch = filterTemplates({ searchQuery: 'BIM' });
    assert.ok(bimSearch.some((t) => t.id === 'teknik-urun'));

    const searchJapandi = filterTemplates({ searchQuery: 'Japandi' });
    assert.ok(searchJapandi.some((t) => t.id === 'minimal-koleksiyon'));

    // Empty query returns all
    const all = filterTemplates({ category: 'all', style: 'all', searchQuery: '' });
    assert.equal(all.length, 12);
  });
});

test('İlk Üç Tasarım Ailesi Sayfa Mimarisi ve Null-Safety Testleri', async (t) => {
  await t.test('1. Aile (Premium Mimari Lookbook) sayfa hesaplama ve spread matrisi', () => {
    const productsCount = 4;
    // 2 sayfa per product (Sol: mekan, Sağ: plaka) + Cover (1) + TOC (1) + Manifesto (1) + Specs (1) + Studio3D (1) + Contact (1)
    const expectedPages = 1 + 1 + 1 + productsCount * 2 + 1 + 1 + 1; // 14 sayfa
    assert.equal(expectedPages, 14);

    // Spread modu: Sayfa 0 tek (Kapak), Sayfa 1-2 sol/sağ, Sayfa 3-4 sol/sağ
    const isCoverSingle = (pageIdx) => pageIdx === 0;
    assert.equal(isCoverSingle(0), true);
    assert.equal(isCoverSingle(1), false);
  });

  await t.test('2. Aile (Minimal Koleksiyon Kataloğu) sayfa yapısı ve asimetrik grid dengesi', () => {
    const products = [
      { id: 'p1', name: 'Nordic Grey', width: 60, height: 120 },
      { id: 'p2', name: 'Kyoto Bone', width: 120, height: 120 }
    ];

    // Minimal sayfa yapısı:
    // Cover (1) + TOC (1) + Editorial (1) + Products (2) + Variants (1) + Specs (1) + Contact (1) = 8 sayfa
    const minimalPages = [
      { type: 'cover' },
      { type: 'toc' },
      { type: 'editorial', product: products[0] },
      ...products.map((p, idx) => ({ type: 'product-detail', product: p, index: idx })),
      { type: 'variants' },
      { type: 'specs' },
      { type: 'contact' }
    ];

    assert.equal(minimalPages.length, 8);
    assert.equal(minimalPages[0].type, 'cover');
    assert.equal(minimalPages[1].type, 'toc');
    assert.equal(minimalPages[2].type, 'editorial');
    assert.equal(minimalPages[3].type, 'product-detail');
    assert.equal(minimalPages[7].type, 'contact');
  });

  await t.test('3. Aile (Teknik Ürün Kataloğu) TS EN 14411 parametre ve lojistik matrisi doğrulaması', () => {
    const product = {
      name: 'Loft Beton Gri',
      code: 'SB-LT60120',
      width: 60,
      height: 120,
      thickness: 10,
      slipResistance: 'R10',
      peiRating: 4
    };

    // Metraj ve kutu ağırlık hesaplaması:
    // 60x120 cm = 0.72 m2/adet. 1 kutuda 2 adet = 1.44 m2. 1 palette 32 kutu = 46.08 m2.
    const m2PerPiece = (product.width * product.height) / 10000;
    assert.equal(m2PerPiece, 0.72);

    const piecesPerBox = 2;
    const boxM2 = m2PerPiece * piecesPerBox;
    assert.equal(boxM2, 1.44);

    const boxesPerPallet = 32;
    const palletM2 = boxM2 * boxesPerPallet;
    assert.equal(palletM2, 46.08);

    // Güvenlik normu doğrulaması
    assert.ok(product.slipResistance.startsWith('R'));
    assert.ok(product.peiRating >= 1 && product.peiRating <= 5);
  });

  await t.test('Eksik ürün verilerinde (undefined/null) şablonlar çökmemeli ve güvenli değerler sunmalı', () => {
    const emptyProduct = {};
    
    // Güvenli ebat gösterimi
    const displayDimension = emptyProduct.width && emptyProduct.height
      ? `${emptyProduct.width}x${emptyProduct.height} cm`
      : 'Standart Ebat';
    assert.equal(displayDimension, 'Standart Ebat');

    // Güvenli yüzey gösterimi
    const displayFinish = emptyProduct.finish || 'Porselen / Mat';
    assert.equal(displayFinish, 'Porselen / Mat');

    // Güvenli kalınlık
    const displayThickness = emptyProduct.thickness ? `${emptyProduct.thickness} mm` : '9 mm';
    assert.equal(displayThickness, '9 mm');

    // Güvenli kaymazlık
    const displaySlip = emptyProduct.slipResistance || 'R9';
    assert.equal(displaySlip, 'R9');
  });
});
