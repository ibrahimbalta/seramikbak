/**
 * catalogSanitizer.js
 * Comprehensive validation, sanitization and safety enforcement for SeramikBak catalogs.
 * Protects against:
 * - XSS in text, links, and QR code targets
 * - Malformed geometries and infinite/NaN numbers
 * - Prototype pollution and unbounded memory payloads
 * - Invalid canvas element structures
 */

const ALLOWED_ELEMENT_TYPES = new Set(['text', 'image', 'box', 'line', 'qr']);
const MAX_PAGES_LIMIT = 50;
const MAX_ELEMENTS_PER_PAGE = 100;
const MAX_TEXT_LENGTH = 5000;

export function getCanvasDimensions(format) {
  if (format === 'landscape') return { width: 842, height: 595 };
  if (format === 'square') return { width: 700, height: 700 };
  return { width: 595, height: 842 }; // portrait (A4 ratio)
}

export function sanitizeUrlString(url) {
  if (!url || typeof url !== 'string') return '#';
  const trimmed = url.trim();
  const lower = trimmed.toLowerCase();

  // Block dangerous URI schemes (XSS prevention)
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('data:text/html') ||
    lower.startsWith('data:text/javascript')
  ) {
    return '#';
  }

  if (
    trimmed.startsWith('/') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('data:image/') // Safe base64 images
  ) {
    return trimmed;
  }

  return '#';
}

export function sanitizeNumber(val, defaultVal = 0, min = null, max = null) {
  if (typeof val !== 'number' || !Number.isFinite(val)) {
    const parsed = Number(val);
    if (!Number.isFinite(parsed)) return defaultVal;
    val = parsed;
  }
  if (min !== null && val < min) val = min;
  if (max !== null && val > max) val = max;
  return val;
}

export function sanitizeRotation(deg) {
  const num = sanitizeNumber(deg, 0);
  // Normalize into [0, 360)
  return ((Math.round(num) % 360) + 360) % 360;
}

export function sanitizeCanvasElements(elements) {
  if (!Array.isArray(elements)) return [];

  const safeElements = [];
  const limit = Math.min(elements.length, MAX_ELEMENTS_PER_PAGE);

  for (let i = 0; i < limit; i++) {
    const el = elements[i];
    if (!el || typeof el !== 'object' || Array.isArray(el)) continue;

    const rawType = typeof el.type === 'string' ? el.type.toLowerCase().trim() : 'text';
    const type = ALLOWED_ELEMENT_TYPES.has(rawType) ? rawType : 'text';

    const safeEl = {
      id: typeof el.id === 'string' && el.id.trim() ? el.id.trim().slice(0, 80) : `el-${i + 1}`,
      type,
      x: Math.round(sanitizeNumber(el.x, 0, -500, 2000)),
      y: Math.round(sanitizeNumber(el.y, 0, -500, 3000)),
      width: Math.round(sanitizeNumber(el.width, 100, 4, 3000)),
      height: Math.round(sanitizeNumber(el.height, 50, 2, 3000)),
      rotation: sanitizeRotation(el.rotation),
      locked: Boolean(el.locked),
      hidden: Boolean(el.hidden),
      opacity: sanitizeNumber(el.opacity, 100, 0, 100)
    };

    if (type === 'text') {
      const rawContent = typeof el.content === 'string' ? el.content : '';
      safeEl.content = rawContent.slice(0, MAX_TEXT_LENGTH);
      safeEl.fontSize = Math.round(sanitizeNumber(el.fontSize, 14, 6, 200));
      safeEl.fontWeight = typeof el.fontWeight === 'string' ? el.fontWeight.slice(0, 10) : '600';
      safeEl.fontFamily = typeof el.fontFamily === 'string' ? el.fontFamily.slice(0, 80) : 'Inter, sans-serif';
      safeEl.color = typeof el.color === 'string' ? el.color.slice(0, 30) : '#0f172a';
      safeEl.bgColor = typeof el.bgColor === 'string' ? el.bgColor.slice(0, 30) : 'transparent';
      safeEl.align = ['left', 'center', 'right', 'justify'].includes(el.align) ? el.align : 'left';
      safeEl.letterSpacing = typeof el.letterSpacing === 'string' ? el.letterSpacing.slice(0, 20) : 'normal';
      safeEl.textTransform = ['uppercase', 'lowercase', 'capitalize', 'none'].includes(el.textTransform)
        ? el.textTransform
        : 'none';
      safeEl.lineHeight = sanitizeNumber(el.lineHeight, 1.35, 0.8, 3.0);
    } else if (type === 'image') {
      safeEl.src = sanitizeUrlString(el.src);
      safeEl.objectFit = ['cover', 'contain', 'fill'].includes(el.objectFit) ? el.objectFit : 'cover';
      safeEl.borderRadius = Math.round(sanitizeNumber(el.borderRadius, 0, 0, 500));
    } else if (type === 'box') {
      safeEl.color = typeof el.color === 'string' ? el.color.slice(0, 30) : '#f8fafc';
      safeEl.borderColor = typeof el.borderColor === 'string' ? el.borderColor.slice(0, 30) : '#cbd5e1';
      safeEl.borderWidth = Math.round(sanitizeNumber(el.borderWidth, 1, 0, 40));
      safeEl.borderRadius = Math.round(sanitizeNumber(el.borderRadius, 0, 0, 500));
    } else if (type === 'line') {
      safeEl.color = typeof el.color === 'string' ? el.color.slice(0, 30) : '#b4823c';
    } else if (type === 'qr') {
      safeEl.qrUrl = sanitizeUrlString(el.qrUrl);
    }

    safeElements.push(safeEl);
  }

  return safeElements;
}

export function validateAndSanitizeCanvasPages(pages, defaultOrientation = 'portrait') {
  if (!Array.isArray(pages)) return [];

  const limit = Math.min(pages.length, MAX_PAGES_LIMIT);
  const safePages = [];

  for (let i = 0; i < limit; i++) {
    const page = pages[i];
    if (!page || typeof page !== 'object' || Array.isArray(page)) continue;

    const format = ['portrait', 'landscape', 'square'].includes(page.format)
      ? page.format
      : defaultOrientation;

    safePages.push({
      id: typeof page.id === 'string' && page.id.trim() ? page.id.trim().slice(0, 80) : `page-${i + 1}`,
      title: typeof page.title === 'string' ? page.title.slice(0, 120) : `Sayfa ${i + 1}`,
      bgColor: typeof page.bgColor === 'string' ? page.bgColor.slice(0, 30) : '#ffffff',
      format,
      elements: sanitizeCanvasElements(page.elements)
    });
  }

  return safePages;
}
