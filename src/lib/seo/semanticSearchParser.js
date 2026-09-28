/**
 * AI Semantic Search Query Parser & NLU Intent Extractor
 * Deconstructs natural language user input (e.g. "bej mermer görünümlü 60x120 banyo seramiği")
 * into high-precision faceted search filters.
 */

const KNOWN_BRANDS = [
  { name: 'VitrA', aliases: ['vitra', 'vitra seramik', 'vitra karo'] },
  { name: 'Çanakkale Seramik', aliases: ['çanakkale seramik', 'canakkale seramik', 'kalebodur', 'çanakkale', 'kale'] },
  { name: 'NG Kütahya Seramik', aliases: ['kütahya seramik', 'kutahya seramik', 'ng kütahya', 'kütahya'] },
  { name: 'Bien Seramik', aliases: ['bien', 'bien seramik', 'bienseramik'] },
  { name: 'Yurtbay Seramik', aliases: ['yurtbay', 'yurtbay seramik'] },
  { name: 'Seramiksan', aliases: ['seramiksan'] },
  { name: 'Ege Seramik', aliases: ['ege', 'ege seramik'] },
  { name: 'Qua Granite', aliases: ['qua', 'qua granite', 'qua granit'] },
  { name: 'DuraTiles', aliases: ['duratiles', 'dura tiles', 'dura'] },
  { name: 'Decovita', aliases: ['decovita'] }
];

const KNOWN_COLORS = [
  'Beyaz', 'Bej', 'Gri', 'Antrasit', 'Siyah', 'Kahve', 'Kemik', 'Krem', 'Mavi', 'Yeşil', 'Terracotta', 'Altın'
];

const KNOWN_STYLES = [
  { name: 'Mermer', aliases: ['mermer', 'mermer desen', 'mermer görünümlü', 'calacatta', 'statuario', 'nero'] },
  { name: 'Ahşap', aliases: ['ahşap', 'ahsap', 'parke', 'ahşap desenli', 'ahşap görünümlü', 'meşe', 'ceviz'] },
  { name: 'Beton', aliases: ['beton', 'beton görünümlü', 'çimento', 'loft', 'brüt beton', 'endüstriyel'] },
  { name: 'Taş', aliases: ['taş', 'dogal tas', 'doğal taş', 'traverten', 'kayrak', 'bazalt'] },
  { name: 'Terrazzo', aliases: ['terrazzo', 'mozaik', 'çakıl'] }
];

const KNOWN_AREAS = [
  { name: 'Banyo', aliases: ['banyo', 'duş', 'ıslak hacim', 'lavabo'] },
  { name: 'Mutfak', aliases: ['mutfak', 'tezgah arası', 'tezgah'] },
  { name: 'Salon', aliases: ['salon', 'oturma odası', 'antre', 'koridor', 'yaşam alanı'] },
  { name: 'Teras', aliases: ['teras', 'balkon', 'dış mekan', 'bahçe', 'havuz'] }
];

const KNOWN_FINISHES = [
  { name: 'Mat', aliases: ['mat', 'kaymaz', 'dokulu'] },
  { name: 'Parlak', aliases: ['parlak', 'full parlak', 'cilalı', 'polished', 'ayna parlak'] },
  { name: 'Lapatto', aliases: ['lapatto', 'yarı mat', 'yarı parlak', 'saten'] }
];

/**
 * Parses free-form user query into structured semantic intent
 */
export function parseSemanticQuery(rawQuery) {
  if (!rawQuery || typeof rawQuery !== 'string') {
    return { extracted: {}, rawQuery: '' };
  }

  const queryLower = rawQuery.toLowerCase().trim();
  const extracted = {};

  // 1. Detect Dimensions (e.g. "60x120", "80x80", "20x120", "60*120")
  const sizeMatch = queryLower.match(/\b(\d{2,3})[x*](\d{2,3})\b/);
  if (sizeMatch) {
    extracted.size = `${sizeMatch[1]}x${sizeMatch[2]}`;
    extracted.width = parseFloat(sizeMatch[1]);
    extracted.height = parseFloat(sizeMatch[2]);
  }

  // 2. Detect Brand
  for (const b of KNOWN_BRANDS) {
    if (b.aliases.some(alias => queryLower.includes(alias))) {
      extracted.brand = b.name;
      break;
    }
  }

  // 3. Detect Color
  for (const c of KNOWN_COLORS) {
    const cLower = c.toLowerCase();
    if (queryLower.includes(cLower)) {
      extracted.color = c;
      break;
    }
  }

  // 4. Detect Style
  for (const s of KNOWN_STYLES) {
    if (s.aliases.some(alias => queryLower.includes(alias))) {
      extracted.style = s.name;
      break;
    }
  }

  // 5. Detect Area
  for (const a of KNOWN_AREAS) {
    if (a.aliases.some(alias => queryLower.includes(alias))) {
      extracted.area = a.name;
      break;
    }
  }

  // 6. Detect Finish
  for (const f of KNOWN_FINISHES) {
    if (f.aliases.some(alias => queryLower.includes(alias))) {
      extracted.finish = f.name;
      break;
    }
  }

  // 7. Detect Frost Resistance
  if (queryLower.includes('dona dayanıklı') || queryLower.includes('donmaz') || queryLower.includes('dış mekan')) {
    extracted.frostResistance = true;
  }

  // 8. Detect Rectified
  if (queryLower.includes('rektifiye') || queryLower.includes('lazer kesim') || queryLower.includes('derzsiz')) {
    extracted.rectified = true;
  }

  // Clean tokens for textual fallback search
  const cleanTokens = queryLower
    .replace(/\b(\d{2,3})[x*](\d{2,3})\b/g, '')
    .replace(/(seramik|seramiği|karo|karosu|fayans|fayansı|modelleri|fiyatları|görünümlü|desenli)/g, '')
    .split(/\s+/)
    .filter(t => t.length > 2);

  return {
    rawQuery,
    extracted,
    remainingTokens: cleanTokens,
    isSemanticMatch: Object.keys(extracted).length > 0
  };
}
