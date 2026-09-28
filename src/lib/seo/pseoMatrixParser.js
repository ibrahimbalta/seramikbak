/**
 * Programmatic SEO Matrix Resolver & Parser
 * Resolves permutations of:
 * {marka} + {renk}
 * {marka} + {ölçü}
 * {marka} + {yüzey}
 * {marka} + {mekan}
 * {marka} + {ülke}
 * {marka} + {şehir}
 * {marka} + {stil}
 */

import { slugify } from '../slugify.js';

export const MATRIX_BRANDS = [
  { name: 'VitrA', slug: 'vitra', query: 'VitrA' },
  { name: 'Çanakkale Seramik', slug: 'canakkale', query: 'Çanakkale Seramik' },
  { name: 'NG Kütahya Seramik', slug: 'kutahya', query: 'NG Kütahya Seramik' },
  { name: 'Bien Seramik', slug: 'bien', query: 'Bien Seramik' },
  { name: 'Yurtbay Seramik', slug: 'yurtbay', query: 'Yurtbay Seramik' },
  { name: 'Seramiksan', slug: 'seramiksan', query: 'Seramiksan' },
  { name: 'Ege Seramik', slug: 'ege', query: 'Ege Seramik' },
  { name: 'Qua Granite', slug: 'qua', query: 'Qua Granite' },
  { name: 'DuraTiles', slug: 'duratiles', query: 'DuraTiles' },
  { name: 'Decovita', slug: 'decovita', query: 'Decovita' }
];

export const MATRIX_COLORS = [
  { name: 'Bej', slug: 'bej', en: 'Beige' },
  { name: 'Beyaz', slug: 'beyaz', en: 'White' },
  { name: 'Gri', slug: 'gri', en: 'Grey' },
  { name: 'Antrasit', slug: 'antrasit', en: 'Anthracite' },
  { name: 'Siyah', slug: 'siyah', en: 'Black' },
  { name: 'Kahve', slug: 'kahve', en: 'Brown' },
  { name: 'Kemik', slug: 'kemik', en: 'Bone' },
  { name: 'Krem', slug: 'krem', en: 'Cream' }
];

export const MATRIX_SIZES = [
  { width: 60, height: 120, slug: '60x120', label: '60x120 cm' },
  { width: 80, height: 80, slug: '80x80', label: '80x80 cm' },
  { width: 60, height: 60, slug: '60x60', label: '60x60 cm' },
  { width: 20, height: 120, slug: '20x120', label: '20x120 cm' },
  { width: 30, height: 60, slug: '30x60', label: '30x60 cm' },
  { width: 120, height: 240, slug: '120x240', label: '120x240 cm' }
];

export const MATRIX_FINISHES = [
  { name: 'Mat', slug: 'mat', en: 'Matte' },
  { name: 'Parlak', slug: 'parlak', en: 'Polished / Glossy' },
  { name: 'Lapatto', slug: 'lapatto', en: 'Semi-polished' }
];

export const MATRIX_AREAS = [
  { name: 'Banyo', slug: 'banyo', label: 'Banyo Seramikleri', en: 'Bathroom Tiles' },
  { name: 'Mutfak', slug: 'mutfak', label: 'Mutfak Seramikleri', en: 'Kitchen Tiles' },
  { name: 'Salon', slug: 'salon', label: 'Salon Zemin Karoları', en: 'Living Room Tiles' },
  { name: 'Teras', slug: 'teras', label: 'Teras & Dış Mekan Karoları', en: 'Outdoor / Terrace Tiles' }
];

export const MATRIX_STYLES = [
  { name: 'Mermer', slug: 'mermer', label: 'Mermer Görünümlü', en: 'Marble Look' },
  { name: 'Ahşap', slug: 'ahsap', label: 'Ahşap Görünümlü / Parke', en: 'Wood Look' },
  { name: 'Beton', slug: 'beton', label: 'Beton Görünümlü / Loft', en: 'Concrete Look' },
  { name: 'Taş', slug: 'tas', label: 'Doğal Taş Dokulu', en: 'Stone Look' }
];

export const MATRIX_CITIES = [
  'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya', 'Kocaeli', 'Gaziantep', 'Eskişehir', 'Kayseri', 'Mersin'
];

export const MATRIX_COUNTRIES = [
  { name: 'Almanya', slug: 'germany', code: 'DE', en: 'Germany' },
  { name: 'Amerika', slug: 'usa', code: 'US', en: 'United States' },
  { name: 'Birleşik Krallık', slug: 'uk', code: 'GB', en: 'United Kingdom' },
  { name: 'Suudi Arabistan', slug: 'saudi-arabia', code: 'SA', en: 'Saudi Arabia' },
  { name: 'BAE', slug: 'uae', code: 'AE', en: 'United Arab Emirates' }
];

/**
 * Resolves a composite slug array into a structured matrix query
 * Example slug: ['vitra-60x120-seramik'] or ['vitra', 'banyo-seramikleri']
 */
export function resolvePseoMatrix(slugParts) {
  const fullSlug = Array.isArray(slugParts) ? slugParts.join('-').toLowerCase() : String(slugParts || '').toLowerCase();

  let brand = null;
  let color = null;
  let size = null;
  let finish = null;
  let area = null;
  let style = null;
  let city = null;
  let country = null;

  // 1. Detect Brand
  for (const b of MATRIX_BRANDS) {
    const bSlug = slugify(b.name);
    const shortSlug = b.slug;
    if (fullSlug.includes(shortSlug) || fullSlug.includes(bSlug)) {
      brand = b;
      break;
    }
  }

  // 2. Detect Dimension
  for (const s of MATRIX_SIZES) {
    if (fullSlug.includes(s.slug)) {
      size = s;
      break;
    }
  }

  // 3. Detect Color
  for (const c of MATRIX_COLORS) {
    if (fullSlug.includes(c.slug)) {
      color = c;
      break;
    }
  }

  // 4. Detect Finish
  for (const f of MATRIX_FINISHES) {
    if (fullSlug.includes(f.slug)) {
      finish = f;
      break;
    }
  }

  // 5. Detect Area
  for (const a of MATRIX_AREAS) {
    if (fullSlug.includes(a.slug)) {
      area = a;
      break;
    }
  }

  // 6. Detect Style
  for (const st of MATRIX_STYLES) {
    if (fullSlug.includes(st.slug)) {
      style = st;
      break;
    }
  }

  // 7. Detect City
  for (const ct of MATRIX_CITIES) {
    if (fullSlug.includes(slugify(ct))) {
      city = ct;
      break;
    }
  }

  // 8. Detect Country
  for (const cy of MATRIX_COUNTRIES) {
    if (fullSlug.includes(cy.slug) || fullSlug.includes(slugify(cy.name))) {
      country = cy;
      break;
    }
  }

  // Generate H1 and Page Titles
  const brandTitle = brand ? brand.name : '';
  const parts = [];
  if (brandTitle) parts.push(brandTitle);
  if (color) parts.push(color.name);
  if (style) parts.push(`${style.name} Görünümlü`);
  if (finish) parts.push(`${finish.name} Yüzey`);
  if (size) parts.push(size.label);
  if (area) parts.push(area.label);
  if (city) parts.push(`${city} Yetkili Bayileri`);
  if (country) parts.push(`${country.name} Export & Distribution`);

  let mainTitle = parts.join(' ');
  if (!mainTitle) {
    mainTitle = 'Lüks Seramik & Porselen Karo Koleksiyonları';
  }

  const metaTitle = `${mainTitle} | Fiyatları & Modelleri 2026 | SeramikBak`;
  const metaDescription = `${mainTitle} modelleri, teknik özellikleri ve en avantajlı fabrika/bayi teklifleri. 3D mekan giydirme ile canlı deneyin, ücretsiz 15x15 numune talep edin.`;

  return {
    fullSlug,
    brand,
    color,
    size,
    finish,
    area,
    style,
    city,
    country,
    mainTitle,
    metaTitle,
    metaDescription
  };
}
