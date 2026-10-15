import QRCode from 'qrcode';

/**
 * generateQrCode.js
 * Generates high-fidelity QR codes as base64 Data URLs for physical showroom labels,
 * digital catalogs, and 3D Studio deep links.
 */

export async function generateQrDataUrl(text, options = {}) {
  if (!text || typeof text !== 'string') return '';
  const {
    width = 240,
    margin = 1,
    color = {
      dark: '#0f172a',
      light: '#ffffff'
    }
  } = options;

  try {
    if (QRCode && typeof QRCode.toDataURL === 'function') {
      return await QRCode.toDataURL(text, {
        width,
        margin,
        color,
        errorCorrectionLevel: 'M'
      });
    }
  } catch (err) {
    console.warn('[generateQrDataUrl] Local generation fallback:', err?.message);
  }

  // Graceful online fallback if canvas is unavailable
  const hexDark = (color.dark || '#000000').replace('#', '');
  const hexLight = (color.light || '#ffffff').replace('#', '');
  return `https://api.qrserver.com/v1/create-qr-code/?size=${width}x${width}&data=${encodeURIComponent(
    text
  )}&color=${hexDark}&bgcolor=${hexLight}&margin=${margin}`;
}

/**
 * Construct verified product 3D Studio and Public Catalog URLs.
 */
export function buildProductStudioUrl(product, origin = '') {
  const base = origin || (typeof window !== 'undefined' ? window.location.origin : 'https://seramikbak.com');
  const slugOrId = product?.slug || product?.id || product?.productId || '';
  return `${base}/urun/${encodeURIComponent(slugOrId)}?studio=3d`;
}

export function buildCatalogPublicUrl(catalogSlug, origin = '') {
  const base = origin || (typeof window !== 'undefined' ? window.location.origin : 'https://seramikbak.com');
  return `${base}/katalog/${encodeURIComponent(catalogSlug || '')}`;
}
