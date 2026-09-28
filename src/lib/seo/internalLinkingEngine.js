/**
 * AI Internal Linking Engine (Topic Clusters & PageRank Silo)
 * Automatically builds high-authority semantic internal link structures
 * connecting products, categories, dimensions, styles, finishes, and dealer networks.
 */

import { slugify } from '../slugify.js';

export const POPULAR_DIMENSIONS = [
  { label: '60x120 cm Seramikler', slug: '60x120-seramik', width: 60, height: 120 },
  { label: '80x80 cm Kare Karolar', slug: '80x80-seramik', width: 80, height: 80 },
  { label: '60x60 cm Zemin Seramikleri', slug: '60x60-seramik', width: 60, height: 60 },
  { label: '20x120 cm Ahşap Desen Karolar', slug: '20x120-ahsap-seramik', width: 20, height: 120 },
  { label: '30x60 cm Duvar Fayansları', slug: '30x60-fayans', width: 30, height: 60 },
  { label: '120x240 cm Dev Porselen Slab', slug: '120x240-slab-plaka', width: 120, height: 240 }
];

export const CORE_AREAS = [
  { label: 'Banyo Seramik & Fayans Modelleri', slug: 'banyo-seramikleri', area: 'Banyo' },
  { label: 'Mutfak & Tezgah Arası Seramikler', slug: 'mutfak-seramikleri', area: 'Mutfak' },
  { label: 'Salon & Antre Zemin Porselenleri', slug: 'salon-seramikleri', area: 'Salon' },
  { label: 'Teras & Dış Mekan (Dona Dayanıklı) Karolar', slug: 'dis-mekan-teras-seramikleri', area: 'Teras' }
];

export const CORE_STYLES = [
  { label: 'Mermer Görünümlü Seramikler', slug: 'mermer-gorunumlu-seramik', style: 'Mermer' },
  { label: 'Ahşap Görünümlü Parke Karolar', slug: 'ahsap-gorunumlu-seramik', style: 'Ahşap' },
  { label: 'Beton Görünümlü Loft Seramikler', slug: 'beton-gorunumlu-seramik', style: 'Beton' },
  { label: 'Traverten & Doğal Taş Dokulu Seramikler', slug: 'traverten-seramik', style: 'Taş' }
];

export const MAJOR_CITIES = [
  'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya', 'Kocaeli', 'Gaziantep', 'Eskişehir'
];

export const TOP_BRANDS = [
  'VitrA', 'Çanakkale Seramik', 'NG Kütahya Seramik', 'Bien Seramik', 'Yurtbay Seramik',
  'Seramiksan', 'Ege Seramik', 'Qua Granite', 'DuraTiles', 'Decovita'
];

/**
 * Generates contextual internal linking cluster for any page
 */
export function getInternalLinkCluster({ currentBrand, currentStyle, currentArea, currentDimension, currentCity }) {
  // 1. Related Brand Collections
  const brandLinks = TOP_BRANDS
    .filter(b => !currentBrand || b.toLowerCase() !== currentBrand.toLowerCase())
    .slice(0, 5)
    .map(b => ({
      title: `${b} Seramik Modelleri & Bayileri`,
      url: `/marka/${slugify(b)}`
    }));

  // 2. Cross-Area Links
  const areaLinks = CORE_AREAS
    .filter(a => !currentArea || !a.label.toLowerCase().includes(currentArea.toLowerCase()))
    .map(a => ({
      title: a.label,
      url: `/kategori/${a.slug}`
    }));

  // 3. Dimension Clusters
  const dimensionLinks = POPULAR_DIMENSIONS.map(d => ({
    title: currentBrand ? `${currentBrand} ${d.label}` : d.label,
    url: currentBrand ? `/kesfet/${slugify(currentBrand)}-${d.width}x${d.height}-seramik` : `/kategori/${d.slug}`
  }));

  // 4. Style Clusters
  const styleLinks = CORE_STYLES.map(s => ({
    title: currentBrand ? `${currentBrand} ${s.label}` : s.label,
    url: currentBrand ? `/kesfet/${slugify(currentBrand)}-${slugify(s.style)}-seramik` : `/kategori/${s.slug}`
  }));

  // 5. Local Dealer Showroom Hubs
  const localDealerLinks = MAJOR_CITIES
    .filter(c => !currentCity || c.toLowerCase() !== currentCity.toLowerCase())
    .slice(0, 6)
    .map(c => ({
      title: currentBrand ? `${currentBrand} ${c} Yetkili Bayileri & Showroomları` : `${c} Seramik Bayileri ve Mağazaları`,
      url: currentBrand ? `/bayi?city=${encodeURIComponent(c)}&brand=${encodeURIComponent(currentBrand)}` : `/bayi?city=${encodeURIComponent(c)}`
    }));

  return {
    brandLinks,
    areaLinks,
    dimensionLinks,
    styleLinks,
    localDealerLinks
  };
}
