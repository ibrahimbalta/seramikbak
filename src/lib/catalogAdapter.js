/**
 * SeramikBak — Lookbook & Digital Catalog Adapter
 * 
 * Converts any catalog data (legacy templates, raw database records, or versioned schemas)
 * into a modern, standardized, block-based Editorial Lookbook model.
 * 
 * Guarantees 100% backward compatibility with existing catalogs while powering
 * the magazine-grade HTML Lookbook renderer.
 */

export const DEFAULT_PALETTES = {
  obsidian: {
    id: 'obsidian',
    name: 'Obsidian Noir (Lüks Mimari)',
    primary: '#b4823c',     // Gold accent
    bg: '#0c0e12',          // Deep black-gray
    surface: '#151921',     // Elevated card
    text: '#f8fafc',        // Crisp white
    textMuted: '#94a3b8',   // Cool slate
    border: 'rgba(255, 255, 255, 0.1)',
    badgeBg: 'rgba(180, 130, 60, 0.15)',
    badgeText: '#f59e0b'
  },
  champagne: {
    id: 'champagne',
    name: 'Champagne Cream (Doğal Taş & Mermer)',
    primary: '#9a6c2d',
    bg: '#faf8f5',
    surface: '#ffffff',
    text: '#1c1917',
    textMuted: '#78716c',
    border: 'rgba(0, 0, 0, 0.08)',
    badgeBg: 'rgba(154, 108, 45, 0.12)',
    badgeText: '#9a6c2d'
  },
  terracotta: {
    id: 'terracotta',
    name: 'Terracotta & Kil (Akdeniz Esintisi)',
    primary: '#c2410c',
    bg: '#0f172a',
    surface: '#1e293b',
    text: '#ffffff',
    textMuted: '#94a3b8',
    border: 'rgba(255, 255, 255, 0.1)',
    badgeBg: 'rgba(194, 65, 12, 0.2)',
    badgeText: '#fb923c'
  },
  nordic: {
    id: 'nordic',
    name: 'Nordic Minimalist (Beton & Loft)',
    primary: '#475569',
    bg: '#f1f5f9',
    surface: '#ffffff',
    text: '#0f172a',
    textMuted: '#64748b',
    border: 'rgba(0, 0, 0, 0.08)',
    badgeBg: 'rgba(71, 85, 105, 0.12)',
    badgeText: '#334155'
  }
};

const DEFAULT_LIFESTYLE_RENDERS = [
  '/renders/luxury_bathroom_calacatta_gold.jpg',
  '/renders/modern_living_natural_oak.jpg',
  '/renders/luxury_bathroom_loft_beton.jpg',
  '/renders/luxury_bathroom_albatros_antrasit.jpg',
  '/renders/luxury_bathroom_natural_oak.jpg'
];

/**
 * Normalizes catalog into standard Lookbook sections and configuration.
 */
export function normalizeCatalogForLookbook(catalog, products = []) {
  if (!catalog) return null;

  const brand = catalog.brand || {};
  const normalizedProducts = Array.isArray(products) ? products : (catalog.products || []);

  // Determine color scheme / palette
  const primaryColor = catalog.primaryColor || '#b4823c';
  const isLightPreferred = catalog.accentColor === '#ffffff' || catalog.template === 'champagne';
  const palette = isLightPreferred ? DEFAULT_PALETTES.champagne : DEFAULT_PALETTES.obsidian;

  // Determine cover image
  const coverImage =
    catalog.customCoverUrl ||
    catalog.coverImageUrl ||
    (normalizedProducts.length > 0 && normalizedProducts[0].imageUrl) ||
    DEFAULT_LIFESTYLE_RENDERS[0];

  // Extract or generate blocks
  let blocks = [];

  // Check if catalog already has custom defined blocks in sectionSettings
  const existingBlocks = catalog.sectionSettings?.lookbookBlocks;

  if (Array.isArray(existingBlocks) && existingBlocks.length > 0) {
    blocks = existingBlocks;
  } else {
    // Generate intelligent default editorial flow
    blocks = generateDefaultLookbookBlocks({
      catalog,
      brand,
      products: normalizedProducts,
      coverImage,
      palette
    });
  }

  return {
    id: catalog.id,
    title: catalog.title || 'Seramik Koleksiyonu',
    description: catalog.description || '',
    coverTitle: catalog.coverTitle || catalog.title || 'MİMARİ KOLEKSİYON',
    coverSubtitle: catalog.coverSubtitle || 'Yüksek Performanslı Porselen ve Seramik Çözümleri',
    introText: catalog.introText || 'Doğadan ilham alan dokular, en ileri seramik teknolojisi ve mimari mekanlara hayat veren zamansız tasarımlar.',
    customLogoUrl: catalog.customLogoUrl || brand.logoUrl || null,
    coverImageUrl: catalog.coverImageUrl || catalog.sectionSettings?.coverImageUrl || null,
    brand: {
      id: brand.id,
      name: brand.name || 'Seramik Üreticisi',
      slug: brand.slug || '',
      logoUrl: catalog.customLogoUrl || brand.logoUrl || null,
      websiteUrl: catalog.websiteUrl || brand.website || 'https://www.seramikbak.com',
      contactPhone: catalog.contactPhone || brand.phone || '',
      contactEmail: catalog.contactEmail || brand.email || '',
      contactAddress: catalog.contactAddress || brand.address || ''
    },
    theme: {
      primaryColor,
      accentColor: catalog.accentColor || '#0f172a',
      palette: catalog.sectionSettings?.paletteId ? (DEFAULT_PALETTES[catalog.sectionSettings.paletteId] || palette) : palette
    },
    settings: {
      showCover: catalog.showCover !== false,
      showManifesto: catalog.introText ? true : true,
      showSpecs: catalog.showSpecs !== false,
      showQrCodes: catalog.showQrCodes !== false,
      showPrices: catalog.showPrices === true,
      showDescriptions: catalog.showDescriptions !== false
    },
    products: normalizedProducts,
    blocks
  };
}

/**
 * Generates an architectural editorial block layout for a catalog and its products.
 */
export function generateDefaultLookbookBlocks({ catalog, brand, products, coverImage, palette }) {
  const blocks = [];

  // 1. Hero Cinematic Cover Block
  blocks.push({
    id: 'block-hero-cover',
    type: 'hero-cover',
    title: catalog.coverTitle || catalog.title || 'MİMARİ KOLEKSİYON',
    subtitle: catalog.coverSubtitle || 'Yüksek Performanslı Porselen & Yüzey Koleksiyonu',
    season: `${new Date().getFullYear()} / ${new Date().getFullYear() + 1} ARCHITECTURAL SELECTION`,
    coverImage,
    tagline: 'ZAMANSIZ DOKULAR & İLERİ SERAMİK MÜHENDİSLİĞİ',
    layout: 'cinematic-full', // 'cinematic-full' | 'editorial-split' | 'minimal-modern'
    enabled: catalog.showCover !== false
  });

  // 2. Editorial Philosophy / Manifesto Block
  if (catalog.introText || catalog.description) {
    blocks.push({
      id: 'block-manifesto',
      type: 'manifesto',
      heading: 'TASARIM FELSEFESİ & MİMARİ VİZYON',
      subheading: 'Doğallığın ve Teknolojinin Kusursuz Uyumu',
      text: catalog.introText || catalog.description,
      quote: 'Mekanlar, üzerinde yürüdüğümüz yüzeylerin anlattığı hikayelerle derinleşir.',
      highlights: [
        { label: 'TS EN 14411', desc: 'Uluslararası Grup BIa Porselen Standardı' },
        { label: '%E ≤ 0.1', desc: 'Sıfıra Yakın Su Emme Oranı ve Dona Dayanıklılık' },
        { label: 'Anti-Slip', desc: 'R9 - R11 Kaymazlık Sınıfları ve Güvenli Yaşam Alanları' }
      ],
      enabled: true
    });
  }

  // 3. Featured Products Split Showcase (First 1 to 3 items as high-impact spreads)
  const featuredProducts = products.slice(0, 3);
  featuredProducts.forEach((product, idx) => {
    const lifestyleRender =
      product.lifestyleUrl ||
      DEFAULT_LIFESTYLE_RENDERS[idx % DEFAULT_LIFESTYLE_RENDERS.length];

    blocks.push({
      id: `block-featured-spread-${product.id || idx}`,
      type: 'room-spread',
      productIndex: idx,
      productId: product.id,
      productName: product.name || `Koleksiyon Ürünü 0${idx + 1}`,
      roomRender: lifestyleRender,
      slabImage: product.imageUrl || product.textureUrl || lifestyleRender,
      roomName: idx === 0 ? 'Özel Konut & Villa Projesi' : idx === 1 ? 'Lüks Karşılama Lobisi' : 'Modern Banyo & Islak Hacim',
      caption: product.description || product.customNote || 'Doğal taş ve mermer damarlarının zarafetini geniş format porselen mukavemetiyle buluşturan özgün mimari yüzey.',
      finish: product.finish || 'Mat Rektifiye',
      dimensions: product.width && product.height ? `${product.width}x${product.height} cm` : '60x120 cm',
      thickness: product.thickness ? `${product.thickness} mm` : '9 mm',
      slipResistance: product.slipResistance || (idx === 0 ? 'R10' : 'R9'),
      peiRating: product.peiRating || 'PEI IV',
      align: idx % 2 === 0 ? 'left' : 'right', // Alternating layout
      enabled: true
    });
  });

  // 4. Complete Collection Gallery Grid
  blocks.push({
    id: 'block-collection-grid',
    type: 'collection-grid',
    title: 'KOLEKSİYON SERİSİ & YÜZEY SEÇENEKLERİ',
    subtitle: `${brand.name || 'Marka'} bünyesindeki tüm ebat, doku ve renk alternatifleri`,
    layout: 'balanced-grid', // 'balanced-grid' | 'masonry' | 'compact-list'
    columns: 3, // 2, 3, or 4
    enableFilters: true,
    enableZoom: true,
    enabled: true
  });

  // 5. Technical Specifications Matrix Block (TS EN 14411 Standard)
  if (catalog.showSpecs !== false) {
    blocks.push({
      id: 'block-specs-matrix',
      type: 'spec-matrix',
      title: 'TEKNİK ÖZELLİKLER & KALİTE STANDARTLARI',
      standardCode: 'TS EN 14411 - ISO 13006 Grup BIa Porselen Karo',
      specs: [
        { parameter: 'Su Emme (Water Absorption)', standard: 'EN ISO 10545-3', value: '≤ % 0.1 (Grup BIa Porselen)', status: 'PASS' },
        { parameter: 'Kırılma Dayanımı (Breaking Strength)', standard: 'EN ISO 10545-4', value: '≥ 2000 N (Kalınlığa göre)', status: 'PASS' },
        { parameter: 'Eğilme Dayanımı (Modulus of Rupture)', standard: 'EN ISO 10545-4', value: '≥ 45 N/mm²', status: 'PASS' },
        { parameter: 'Yüzey Aşınma Direnci (PEI)', standard: 'EN ISO 10545-7', value: 'PEI III - PEI V (Yoğun Yaya Trafiği)', status: 'PASS' },
        { parameter: 'Kaymazlık Değeri (Slip Resistance)', standard: 'DIN 51130 / DIN 51097', value: 'R9 / R10 / R11 - A+B+C', status: 'PASS' },
        { parameter: 'Dona Dayanıklılık (Frost Resistance)', standard: 'EN ISO 10545-12', value: 'Tam Dayanıklı (Donma Riski Yok)', status: 'PASS' },
        { parameter: 'Leke Tutmazlık (Stain Resistance)', standard: 'EN ISO 10545-14', value: 'Sınıf 5 (Kolay Temizlenebilir)', status: 'PASS' },
        { parameter: 'Kimyasallara Direnç (Chemical Resistance)', standard: 'EN ISO 10545-13', value: 'Sınıf A / LA / HA', status: 'PASS' },
        { parameter: 'Kenar Doğrusallığı & Rektifiye', standard: 'EN ISO 10545-2', value: '± %0.1 Hassasiyetle Lazer Rektifiye', status: 'PASS' }
      ],
      packaging: [
        { dimension: '60x120 cm (9 mm)', boxPcs: '2 Adet', boxM2: '1.44 m²', boxKg: '29.5 kg', palletBox: '32 Kutu', palletM2: '46.08 m²', palletKg: '965 kg' },
        { dimension: '120x120 cm (9 mm)', boxPcs: '1 Adet', boxM2: '1.44 m²', boxKg: '30.0 kg', palletBox: '36 Kutu', palletM2: '51.84 m²', palletKg: '1100 kg' },
        { dimension: '60x60 cm (8.5 mm)', boxPcs: '4 Adet', boxM2: '1.44 m²', boxKg: '26.8 kg', palletBox: '36 Kutu', palletM2: '51.84 m²', palletKg: '985 kg' }
      ],
      enabled: true
    });
  }

  // 6. Colophon & B2B Project Desk Backcover Block
  blocks.push({
    id: 'block-contact-colophon',
    type: 'contact-colophon',
    title: 'MİMARİ PROJE & NUMUNE DESTEK MASASI',
    subtitle: 'Projelerinize özel teknik şartname desteği, toptan teklif ve fiziksel numune servisi.',
    brandName: brand.name || 'Seramik Markası',
    brandLogo: catalog.customLogoUrl || brand.logoUrl,
    phone: catalog.contactPhone || brand.phone,
    email: catalog.contactEmail || brand.email,
    address: catalog.contactAddress || brand.address,
    website: catalog.websiteUrl || brand.website || 'https://www.seramikbak.com',
    enabled: catalog.showContactPage !== false
  });

  return blocks;
}
