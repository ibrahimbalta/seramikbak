/**
 * Official manufacturer brand logo resolver.
 * Maps brand names/slugs to verified official logo files in /public/logos/.
 */
const OFFICIAL_BRAND_LOGO_MAP = [
  { match: ['kutahya', 'kütahya'], url: '/logos/kutahya.png', isWhite: false },
  { match: ['vitra'], url: '/logos/vitra.svg', isWhite: false },
  { match: ['bien'], url: '/logos/bien.png', isWhite: false },
  { match: ['canakkale', 'çanakkale', 'kale'], url: '/logos/canakkale.svg', isWhite: false },
  { match: ['ege'], url: '/logos/ege.svg', isWhite: false },
  { match: ['gural', 'güral'], url: '/logos/gural.png', isWhite: true },
  { match: ['qua'], url: '/logos/qua.png', isWhite: false },
  { match: ['yurtbay'], url: '/logos/yurtbay.svg', isWhite: false },
  { match: ['graniser'], url: '/logos/graniser.png', isWhite: false },
  { match: ['seranit'], url: '/logos/seranit.png', isWhite: false },
  { match: ['termal'], url: '/logos/termal.png', isWhite: false },
  { match: ['usak', 'uşak'], url: '/logos/usak.png', isWhite: false },
  { match: ['decovita'], url: '/logos/decovita.png', isWhite: false },
];

export function resolveBrandLogo(brand) {
  const name = (brand?.name || '').toLowerCase();
  const slug = (brand?.slug || '').toLowerCase();
  const hay = `${name} ${slug}`;

  for (const entry of OFFICIAL_BRAND_LOGO_MAP) {
    if (entry.match.some((m) => hay.includes(m))) {
      return { url: entry.url, isWhite: entry.isWhite };
    }
  }

  // Fallback to brand.logoUrl only if it's an external URL or known non-missing asset
  if (brand?.logoUrl && /^https?:\/\//i.test(brand.logoUrl)) {
    return { url: brand.logoUrl, isWhite: false };
  }

  return { url: null, isWhite: false };
}
