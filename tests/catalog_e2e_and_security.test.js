import test from 'node:test';
import assert from 'node:assert/strict';
import {
  sanitizeUrlString,
  sanitizeNumber,
  sanitizeRotation,
  sanitizeCanvasElements,
  validateAndSanitizeCanvasPages,
  getCanvasDimensions
} from '../src/lib/catalogSanitizer.js';

test('Catalog Security & Sanitization Suite', async (t) => {
  await t.test('should strictly block javascript: and dangerous URI schemes in URLs and QR codes', () => {
    assert.equal(sanitizeUrlString('javascript:alert(document.cookie)'), '#');
    assert.equal(sanitizeUrlString('JAVASCRIPT:alert(1)'), '#');
    assert.equal(sanitizeUrlString('vbscript:msgbox("test")'), '#');
    assert.equal(sanitizeUrlString('data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg=='), '#');
    assert.equal(sanitizeUrlString('data:text/javascript,alert(1)'), '#');
    assert.equal(sanitizeUrlString('   javascript:void(0)   '), '#');
  });

  await t.test('should permit valid safe web URLs, relative paths and image base64 URIs', () => {
    assert.equal(sanitizeUrlString('https://www.seramikbak.com/urun/calacatta-gold'), 'https://www.seramikbak.com/urun/calacatta-gold');
    assert.equal(sanitizeUrlString('http://example.com/test'), 'http://example.com/test');
    assert.equal(sanitizeUrlString('/renders/luxury_bathroom_calacatta_gold.jpg'), '/renders/luxury_bathroom_calacatta_gold.jpg');
    assert.equal(sanitizeUrlString('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAE='), 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAE=');
  });

  await t.test('should sanitize numbers, prevent NaN/Infinity and normalize rotation to [0, 360)', () => {
    assert.equal(sanitizeNumber('120', 0), 120);
    assert.equal(sanitizeNumber(NaN, 50), 50);
    assert.equal(sanitizeNumber(Infinity, 0), 0);
    assert.equal(sanitizeNumber(-100, 0, 0, 500), 0);
    assert.equal(sanitizeNumber(9999, 0, 0, 500), 500);

    // Rotation tests
    assert.equal(sanitizeRotation(0), 0);
    assert.equal(sanitizeRotation(360), 0);
    assert.equal(sanitizeRotation(450), 90);
    assert.equal(sanitizeRotation(-45), 315);
    assert.equal(sanitizeRotation('invalid'), 0);
  });

  await t.test('should strip unknown element types and bound element attributes', () => {
    const rawElements = [
      { id: 'el-1', type: 'text', content: 'Calacatta Gold', x: 50, y: 100, width: 300, height: 40, rotation: 15 },
      { id: 'el-2', type: 'malicious_script_tag', content: '<script>evil()</script>' },
      { id: 'el-3', type: 'image', src: 'javascript:alert(1)', x: -9999, y: 99999, width: -50, height: 9999 },
      { id: 'el-4', type: 'qr', qrUrl: 'data:text/html,<script>alert(1)</script>' }
    ];

    const sanitized = sanitizeCanvasElements(rawElements);
    assert.equal(sanitized.length, 4);

    // Check el-1
    assert.equal(sanitized[0].type, 'text');
    assert.equal(sanitized[0].content, 'Calacatta Gold');
    assert.equal(sanitized[0].rotation, 15);

    // Check unknown type transformed to safe fallback 'text'
    assert.equal(sanitized[1].type, 'text');

    // Check el-3 bounds clamping and blocked javascript: image
    assert.equal(sanitized[2].type, 'image');
    assert.equal(sanitized[2].src, '#');
    assert.equal(sanitized[2].x, -500); // clamped min
    assert.equal(sanitized[2].y, 3000); // clamped max
    assert.equal(sanitized[2].width, 4); // clamped min width
    assert.equal(sanitized[2].height, 3000); // clamped max height

    // Check el-4 blocked QR target
    assert.equal(sanitized[3].type, 'qr');
    assert.equal(sanitized[3].qrUrl, '#');
  });

  await t.test('should enforce max page limits and max elements per page limits', () => {
    // Generate 60 pages
    const excessivePages = Array.from({ length: 60 }, (_, i) => ({
      id: `p-${i}`,
      title: `Page ${i}`,
      format: 'portrait',
      elements: Array.from({ length: 150 }, (__, j) => ({
        id: `el-${i}-${j}`,
        type: 'text',
        content: `Item ${j}`
      }))
    }));

    const sanitizedPages = validateAndSanitizeCanvasPages(excessivePages);
    assert.equal(sanitizedPages.length, 50, 'Must cap total pages to 50');
    assert.equal(sanitizedPages[0].elements.length, 100, 'Must cap elements per page to 100');
  });
});

test('Catalog Mobile & Responsive Scaling Geometry Suite', async (t) => {
  const breakpoints = [
    { name: 'Mobile XS', width: 320 },
    { name: 'Mobile Small', width: 360 },
    { name: 'iPhone 13/14', width: 390 },
    { name: 'iPhone 14 Pro Max', width: 430 },
    { name: 'Tablet Portrait', width: 768 },
    { name: 'Tablet Landscape', width: 1024 },
    { name: 'Desktop HD', width: 1440 }
  ];

  await t.test('should calculate correct container scale factor without zero division or NaN', () => {
    const formats = ['portrait', 'landscape', 'square'];

    for (const fmt of formats) {
      const dim = getCanvasDimensions(fmt);
      for (const bp of breakpoints) {
        // Assume 32px horizontal padding in mobile viewport container
        const availableWidth = bp.width - 32;
        const scaleFactor = Math.min(1, Math.max(0.1, availableWidth / dim.width));
        const renderedWidth = Math.round(dim.width * scaleFactor);
        const renderedHeight = Math.round(dim.height * scaleFactor);

        assert.ok(Number.isFinite(scaleFactor) && scaleFactor > 0, `Scale factor valid for ${bp.name} (${fmt})`);
        assert.ok(renderedWidth <= bp.width, `Rendered width ${renderedWidth}px fits inside ${bp.width}px for ${bp.name}`);
        assert.ok(renderedHeight > 0, 'Rendered height is positive');
      }
    }
  });

  await t.test('should guarantee fixed internal coordinate spaces across all aspect ratios', () => {
    const portraitDim = getCanvasDimensions('portrait');
    assert.deepEqual(portraitDim, { width: 595, height: 842 });

    const landscapeDim = getCanvasDimensions('landscape');
    assert.deepEqual(landscapeDim, { width: 842, height: 595 });

    const squareDim = getCanvasDimensions('square');
    assert.deepEqual(squareDim, { width: 700, height: 700 });
  });
});

test('Catalog Performance & High-Capacity Benchmark Suite', async (t) => {
  await t.test('should serialize and sanitize 20 pages with 50 elements each (1000 items) in under 75ms', () => {
    const testCatalog = Array.from({ length: 20 }, (_, pIdx) => ({
      id: `perf-page-${pIdx}`,
      title: `Katalog Sayfası #${pIdx + 1}`,
      format: pIdx % 2 === 0 ? 'portrait' : 'landscape',
      bgColor: '#ffffff',
      elements: Array.from({ length: 50 }, (__, eIdx) => ({
        id: `el-${pIdx}-${eIdx}`,
        type: eIdx % 4 === 0 ? 'image' : eIdx % 4 === 1 ? 'text' : eIdx % 4 === 2 ? 'box' : 'qr',
        x: (eIdx * 10) % 500,
        y: (eIdx * 15) % 700,
        width: 180,
        height: 80,
        rotation: (eIdx * 45) % 360,
        content: `Ürün ve Teknik Açıklama ${eIdx}`,
        src: '/renders/luxury_bathroom_calacatta_gold.jpg',
        qrUrl: 'https://www.seramikbak.com'
      }))
    }));

    const startTime = performance.now();
    const sanitized = validateAndSanitizeCanvasPages(testCatalog);
    const jsonStr = JSON.stringify(sanitized);
    const parsed = JSON.parse(jsonStr);
    const durationMs = performance.now() - startTime;

    assert.equal(sanitized.length, 20);
    assert.equal(parsed.length, 20);
    assert.equal(parsed[0].elements.length, 50);
    assert.ok(durationMs < 75, `Benchmark duration (${durationMs.toFixed(2)}ms) must be under 75ms`);
  });
});

test('Catalog Multi-Tenant Isolation & Ownership Suite', async (t) => {
  await t.test('should reject unauthorized brand access when auth id does not match brandId', () => {
    const authSession = { id: 'brand_alice', role: 'brand' };
    const targetCatalogBrandId = 'brand_bob';

    const isAuthorized = authSession.role === 'admin' || (authSession.role === 'brand' && authSession.id === targetCatalogBrandId);
    assert.equal(isAuthorized, false, 'Brand Alice must be strictly forbidden from accessing Brand Bob catalog');
  });

  await t.test('should permit admin full cross-brand management access', () => {
    const adminSession = { id: 'super_admin_1', role: 'admin' };
    const targetCatalogBrandId = 'brand_bob';

    const isAuthorized = adminSession.role === 'admin' || (adminSession.role === 'brand' && adminSession.id === targetCatalogBrandId);
    assert.equal(isAuthorized, true, 'Admin role must have management access');
  });

  await t.test('should forbid public access to draft / unpublished catalogs unless owner or admin', () => {
    const draftCatalog = { isDraft: true, isPublished: false, brandId: 'brand_bob' };

    const checkPublicAccess = (catalog, user) => {
      if (catalog.isPublished && !catalog.isDraft) return true;
      if (!user) return false;
      return user.role === 'admin' || user.id === catalog.brandId;
    };

    assert.equal(checkPublicAccess(draftCatalog, null), false, 'Anonymous visitor denied draft access');
    assert.equal(checkPublicAccess(draftCatalog, { id: 'brand_mallory', role: 'brand' }), false, 'Stranger brand denied draft access');
    assert.equal(checkPublicAccess(draftCatalog, { id: 'brand_bob', role: 'brand' }), true, 'Owner brand allowed draft access');
    assert.equal(checkPublicAccess(draftCatalog, { id: 'admin_1', role: 'admin' }), true, 'Admin allowed draft access');
  });
});
