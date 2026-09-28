/**
 * Global Ceramic Tile Knowledge Graph & Ontology Engine
 * Connects Brands, Products, Styles, Colors, Dimensions, Technical Standards, and Dealers
 */

export const TILE_ONTOLOGY = {
  materials: {
    porcelain: {
      name: 'Porselen Karo (Porcelain Stoneware)',
      waterAbsorption: '< 0.5% (ISO 10545-3 Grup BIa)',
      frostResistance: true,
      bendingStrength: '≥ 35 N/mm²',
      bestFor: ['Zemin', 'Banyo', 'Teras', 'Dış Cephe', 'Yoğun Trafik']
    },
    ceramic: {
      name: 'Seramik Duvar Karosu (Wall Ceramic)',
      waterAbsorption: '> 10% (ISO 10545-3 Grup BIII)',
      frostResistance: false,
      bendingStrength: '≥ 15 N/mm²',
      bestFor: ['İç Duvar', 'Mutfak Tezgah Arası', 'Banyo Duvar']
    },
    granite: {
      name: 'Teknik Granit Seramik (Full Body Granite)',
      waterAbsorption: '< 0.1% (ISO 10545-3 Grup BIa+)',
      frostResistance: true,
      bendingStrength: '≥ 45 N/mm²',
      bestFor: ['Havalimanı', 'AVM', 'Metro', 'Fabrika', 'Dış Mekan']
    }
  },
  technicalStandards: {
    slipResistance: {
      R9: { angle: '6° - 10°', usage: 'Kuru iç mekanlar, salon, antre, ofis' },
      R10: { angle: '10° - 19°', usage: 'Banyo zemini, mutfak, kapalı havuz çevresi' },
      R11: { angle: '19° - 27°', usage: 'Teras, açık balkon, bina giriş merdivenleri' },
      R12: { angle: '27° - 35°', usage: 'Oto yıkama, ticari mutfak, rampalar' },
      R13: { angle: '> 35°', usage: 'Gıda fabrikaları, endüstriyel ıslak alanlar' }
    },
    peiWearRating: {
      1: 'Sadece çıplak ayakla basılan yatak odası, ebeveyn banyo',
      2: 'Yumuşak ayakkabıyla basılan hafif konut zeminleri',
      3: 'Tüm konut alanları, koridor, mutfak, balkon',
      4: 'Yoğun trafikli konut, otel odaları, restoranlar, mağazalar',
      5: 'Aşırı yoğun ticari alanlar, AVM, havaalanı, kamu binaları'
    }
  },
  dimensions: [
    { code: '60x120', name: '60x120 cm', areaPerBox: 1.44, pcsPerBox: 2, popularStyle: 'Mermer & Beton' },
    { code: '80x80', name: '80x80 cm', areaPerBox: 1.28, pcsPerBox: 2, popularStyle: 'Beton & Doğal Taş' },
    { code: '60x60', name: '60x60 cm', areaPerBox: 1.44, pcsPerBox: 4, popularStyle: 'Mat Taş & Terrazzo' },
    { code: '20x120', name: '20x120 cm', areaPerBox: 1.20, pcsPerBox: 5, popularStyle: 'Ahşap / Parke Görünümlü' },
    { code: '30x60', name: '30x60 cm', areaPerBox: 1.44, pcsPerBox: 8, popularStyle: 'Banyo Duvar Fayansı' },
    { code: '120x240', name: '120x240 cm (Slab Plaka)', areaPerBox: 2.88, pcsPerBox: 1, popularStyle: 'Dev Mermer Plakalar' }
  ],
  brands: [
    { name: 'VitrA', country: 'Türkiye', est: 1942, url: 'https://www.seramikbak.com/marka/vitra' },
    { name: 'Çanakkale Seramik', country: 'Türkiye', est: 1957, url: 'https://www.seramikbak.com/marka/canakkale-seramik' },
    { name: 'NG Kütahya Seramik', country: 'Türkiye', est: 1989, url: 'https://www.seramikbak.com/marka/ng-kutahya-seramik' },
    { name: 'Bien Seramik', country: 'Türkiye', est: 2007, url: 'https://www.seramikbak.com/marka/bien-seramik' },
    { name: 'Yurtbay Seramik', country: 'Türkiye', est: 1995, url: 'https://www.seramikbak.com/marka/yurtbay-seramik' },
    { name: 'Seramiksan', country: 'Türkiye', est: 1994, url: 'https://www.seramikbak.com/marka/seramiksan' },
    { name: 'Ege Seramik', country: 'Türkiye', est: 1972, url: 'https://www.seramikbak.com/marka/ege-seramik' },
    { name: 'Qua Granite', country: 'Türkiye', est: 2016, url: 'https://www.seramikbak.com/marka/qua-granite' },
    { name: 'DuraTiles', country: 'Türkiye', est: 1972, url: 'https://www.seramikbak.com/marka/duratiles' },
    { name: 'Decovita', country: 'Türkiye', est: 2015, url: 'https://www.seramikbak.com/marka/decovita' }
  ]
};

/**
 * Builds an interconnected Schema.org @graph linking a Brand, Product, Categories, and Knowledge entities
 */
export function buildTileKnowledgeGraph({ brandName, product, categoryTitle, city }) {
  const baseUri = 'https://www.seramikbak.com';

  const graph = [
    {
      '@type': 'WebSite',
      '@id': `${baseUri}/#website`,
      name: 'SeramikBak Global',
      url: baseUri
    },
    {
      '@type': 'Organization',
      '@id': `${baseUri}/#organization`,
      name: 'SeramikBak Global Ceramic Network',
      url: baseUri
    }
  ];

  if (brandName) {
    const brandEntity = TILE_ONTOLOGY.brands.find(b => b.name.toLowerCase() === brandName.toLowerCase());
    graph.push({
      '@type': 'Brand',
      '@id': `${baseUri}/marka/${brandName.toLowerCase().replace(/\s+/g, '-')}#brand`,
      name: brandName,
      foundingDate: brandEntity?.est ? `${brandEntity.est}` : '1980',
      areaServed: 'Worldwide'
    });
  }

  if (product) {
    const dimensions = `${product.width}x${product.height} cm`;
    graph.push({
      '@type': 'Product',
      '@id': `${baseUri}/urun/${product.slug || product.id}#product`,
      name: `${product.brand?.name || brandName || 'Seramik'} ${product.name}`,
      category: categoryTitle || 'Porselen Seramik Karolar',
      size: dimensions,
      material: 'Porselen Seramik (ISO 10545 Grup BIa)',
      isRelatedTo: brandName ? {
        '@id': `${baseUri}/marka/${brandName.toLowerCase().replace(/\s+/g, '-')}#brand`
      } : undefined
    });
  }

  if (city) {
    graph.push({
      '@type': 'Place',
      '@id': `${baseUri}/bayi?city=${encodeURIComponent(city)}#place`,
      name: city,
      containedInPlace: {
        '@type': 'Country',
        name: 'Turkey'
      }
    });
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph
  };
}
