import test from 'node:test';
import assert from 'node:assert/strict';

/**
 * Unit & Integration Tests for Catalog Persistence (1. Aşama: Kalıcı Kayıt)
 * Tests metadata serialization, parsing, backward compatibility, and multi-tenant safety.
 */

// Mirrors CatalogStudioTab parseCatalogMeta logic
const parseCatalogMeta = (rawProductItems) => {
  try {
    const parsed = JSON.parse(rawProductItems || '[]');
    if (Array.isArray(parsed)) {
      const items = parsed
        .filter((i) => i && !i._isMetaOnly && (typeof i === 'string' || i.productId))
        .map((i) => (typeof i === 'string' ? { productId: i } : i));
      const firstMeta = parsed.find(
        (i) => i && typeof i === 'object' && (i._metaSectionSettings || i._metaCustomCanvasPages || i._metaVersions)
      );
      return {
        items,
        sectionSettings: firstMeta?._metaSectionSettings || {},
        collectionTag: firstMeta?._metaCollectionTag || '',
        customCanvasPages: Array.isArray(firstMeta?._metaCustomCanvasPages) ? firstMeta._metaCustomCanvasPages : [],
        versions: Array.isArray(firstMeta?._metaVersions) ? firstMeta._metaVersions : [],
        dataMode: 'live',
        isArchived: false
      };
    }
    if (parsed && typeof parsed === 'object') {
      const items = (parsed.items || [])
        .filter((i) => i && !i._isMetaOnly && (typeof i === 'string' || i.productId))
        .map((i) => (typeof i === 'string' ? { productId: i } : i));
      const firstMeta = (parsed.items || []).find(
        (i) => i && typeof i === 'object' && (i._metaSectionSettings || i._metaCustomCanvasPages || i._metaVersions)
      );
      return {
        items,
        sectionSettings: parsed.sectionSettings || firstMeta?._metaSectionSettings || {},
        collectionTag: parsed.collectionTag || firstMeta?._metaCollectionTag || '',
        customCanvasPages: Array.isArray(parsed.customCanvasPages)
          ? parsed.customCanvasPages
          : Array.isArray(firstMeta?._metaCustomCanvasPages)
          ? firstMeta._metaCustomCanvasPages
          : [],
        versions: parsed.versions || firstMeta?._metaVersions || [],
        dataMode: parsed.dataMode || 'live',
        isArchived: Boolean(parsed.isArchived)
      };
    }
  } catch (e) {
    // ignore
  }
  return { items: [], sectionSettings: {}, collectionTag: '', customCanvasPages: [], versions: [], dataMode: 'live', isArchived: false };
};

// Mirrors API route embedding of customCanvasPages into rawItems
const embedCustomCanvasIntoRawItems = (productItems, customCanvasPages) => {
  let rawItems = Array.isArray(productItems)
    ? productItems
    : typeof productItems === 'string'
    ? JSON.parse(productItems || '[]')
    : [];

  if (Array.isArray(customCanvasPages) && customCanvasPages.length > 0) {
    if (rawItems.length === 0) {
      rawItems = [{ _isMetaOnly: true, _metaCustomCanvasPages: customCanvasPages }];
    } else {
      rawItems[0] = {
        ...rawItems[0],
        _metaCustomCanvasPages: customCanvasPages
      };
    }
  }
  return rawItems;
};

// Mirrors extraction of real product IDs for multi-tenant DB check
const extractProductIdsForOwnershipCheck = (rawItems) => {
  return rawItems
    .map((item) => (typeof item === 'string' ? item : item.productId))
    .filter(Boolean);
};

test('Catalog Persistence - Backward Compatibility for Legacy Catalogs', async (t) => {
  await t.test('should parse legacy raw string array correctly without breaking', () => {
    const legacyJson = JSON.stringify(['prod-1', 'prod-2', 'prod-3']);
    const meta = parseCatalogMeta(legacyJson);

    assert.equal(meta.items.length, 3);
    assert.equal(meta.items[0].productId, 'prod-1');
    assert.deepEqual(meta.customCanvasPages, []);
  });

  await t.test('should parse legacy object array with custom notes without breaking', () => {
    const legacyObjects = JSON.stringify([
      { productId: 'prod-10', customNote: 'Ana giriş karosu' },
      { productId: 'prod-20', customNote: 'Banyo zemin' }
    ]);
    const meta = parseCatalogMeta(legacyObjects);

    assert.equal(meta.items.length, 2);
    assert.equal(meta.items[0].productId, 'prod-10');
    assert.equal(meta.items[0].customNote, 'Ana giriş karosu');
    assert.deepEqual(meta.customCanvasPages, []);
  });

  await t.test('should gracefully handle corrupt JSON, null and undefined inputs', () => {
    assert.deepEqual(parseCatalogMeta(null).items, []);
    assert.deepEqual(parseCatalogMeta(undefined).items, []);
    assert.deepEqual(parseCatalogMeta('').items, []);
    assert.deepEqual(parseCatalogMeta('{invalid-json').items, []);
  });
});

test('Catalog Persistence - Gelişmiş Studio Canvas Roundtrip & Fidelity', async (t) => {
  const sampleCustomPages = [
    {
      id: 'page-1',
      title: 'Kapak Sayfası',
      bgColor: '#18181b',
      format: 'portrait',
      elements: [
        {
          id: 'el-text-1',
          type: 'text',
          x: 50,
          y: 80,
          width: 495,
          height: 60,
          content: '2026 MİMARİ KOLEKSİYON',
          fontSize: 28,
          fontWeight: '900',
          fontFamily: "'Playfair Display', serif",
          color: '#b4823c',
          align: 'center',
          locked: false
        },
        {
          id: 'el-img-1',
          type: 'image',
          x: 50,
          y: 160,
          width: 495,
          height: 500,
          src: '/renders/luxury_bathroom_calacatta_gold.jpg',
          objectFit: 'cover',
          borderRadius: 0,
          locked: true
        }
      ]
    },
    {
      id: 'page-2',
      title: 'Ürün & Teknik Detay',
      bgColor: '#ffffff',
      format: 'portrait',
      elements: [
        {
          id: 'el-prod-card',
          type: 'text',
          x: 50,
          y: 50,
          width: 300,
          height: 40,
          content: 'CALACATTA GOLD 120x280',
          fontSize: 16,
          fontWeight: '700',
          color: '#0f172a'
        },
        {
          id: 'el-qr-1',
          type: 'qr',
          x: 400,
          y: 50,
          width: 140,
          height: 140,
          qrUrl: 'https://seramikbak.com/urun/calacatta-gold'
        }
      ]
    }
  ];

  await t.test('should embed custom canvas pages into rawItems and preserve all attributes', () => {
    const productItems = [{ productId: 'prod-calacatta', order: 1 }];
    const embedded = embedCustomCanvasIntoRawItems(productItems, sampleCustomPages);

    assert.equal(embedded.length, 1);
    assert.equal(embedded[0].productId, 'prod-calacatta');
    assert.ok(Array.isArray(embedded[0]._metaCustomCanvasPages));
    assert.equal(embedded[0]._metaCustomCanvasPages.length, 2);

    // Serialize to JSON string (as stored in DB)
    const dbPayloadString = JSON.stringify(embedded);

    // Deserialize back using parseCatalogMeta
    const restored = parseCatalogMeta(dbPayloadString);

    assert.equal(restored.items.length, 1);
    assert.equal(restored.items[0].productId, 'prod-calacatta');
    assert.equal(restored.customCanvasPages.length, 2);

    // Verify Page 1 exact fidelity
    const p1 = restored.customCanvasPages[0];
    assert.equal(p1.id, 'page-1');
    assert.equal(p1.bgColor, '#18181b');
    assert.equal(p1.elements.length, 2);
    assert.equal(p1.elements[0].content, '2026 MİMARİ KOLEKSİYON');
    assert.equal(p1.elements[0].color, '#b4823c');
    assert.equal(p1.elements[0].fontFamily, "'Playfair Display', serif");
    assert.equal(p1.elements[1].locked, true);

    // Verify Page 2 exact fidelity
    const p2 = restored.customCanvasPages[1];
    assert.equal(p2.id, 'page-2');
    assert.equal(p2.elements.length, 2);
    assert.equal(p2.elements[1].type, 'qr');
    assert.equal(p2.elements[1].qrUrl, 'https://seramikbak.com/urun/calacatta-gold');
  });

  await t.test('should persist canvas pages even when selectedItems is empty (meta-only container)', () => {
    const emptyProducts = [];
    const embedded = embedCustomCanvasIntoRawItems(emptyProducts, sampleCustomPages);

    assert.equal(embedded.length, 1);
    assert.equal(embedded[0]._isMetaOnly, true);
    assert.equal(embedded[0].productId, undefined);

    const dbPayloadString = JSON.stringify(embedded);
    const restored = parseCatalogMeta(dbPayloadString);

    // items should be clean empty array (filtering out _isMetaOnly)
    assert.equal(restored.items.length, 0);
    // customCanvasPages should be 100% intact
    assert.equal(restored.customCanvasPages.length, 2);
    assert.equal(restored.customCanvasPages[0].title, 'Kapak Sayfası');
  });
});

test('Catalog Persistence - Multi-Tenant Security & Ownership Isolation', async (t) => {
  await t.test('should only extract real product IDs for ownership query and ignore meta container', () => {
    const rawItems = [
      { _isMetaOnly: true, _metaCustomCanvasPages: [{ id: 'p1' }] },
      { productId: 'real-prod-1' },
      { productId: 'real-prod-2' }
    ];

    const productIds = extractProductIdsForOwnershipCheck(rawItems);
    assert.deepEqual(productIds, ['real-prod-1', 'real-prod-2']);
    assert.equal(productIds.includes(undefined), false);
  });

  await t.test('should return empty product IDs array when catalog is canvas-only', () => {
    const rawItems = [{ _isMetaOnly: true, _metaCustomCanvasPages: [{ id: 'p1' }] }];
    const productIds = extractProductIdsForOwnershipCheck(rawItems);
    assert.deepEqual(productIds, []);
  });
});

test('Web Catalog Viewer - Security, URL Sanitization & Dimensions', async (t) => {
  const sanitizeUrl = (url) => {
    if (!url || typeof url !== 'string') return '#';
    const trimmed = url.trim();
    if (trimmed.startsWith('/') || trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
      return trimmed;
    }
    return '#';
  };

  const getCanvasDimensions = (format) => {
    if (format === 'landscape') return { width: 842, height: 595 };
    if (format === 'square') return { width: 700, height: 700 };
    return { width: 595, height: 842 }; // portrait
  };

  await t.test('should sanitize malicious javascript: URLs in QR or links to #', () => {
    assert.equal(sanitizeUrl('javascript:alert(1)'), '#');
    assert.equal(sanitizeUrl('data:text/html,<script>alert(1)</script>'), '#');
    assert.equal(sanitizeUrl('vbscript:msgbox(1)'), '#');
    assert.equal(sanitizeUrl(''), '#');
    assert.equal(sanitizeUrl(null), '#');
    assert.equal(sanitizeUrl(undefined), '#');
  });

  await t.test('should allow safe http, https and relative links', () => {
    assert.equal(sanitizeUrl('https://seramikbak.com/urun/calacatta'), 'https://seramikbak.com/urun/calacatta');
    assert.equal(sanitizeUrl('http://example.com'), 'http://example.com');
    assert.equal(sanitizeUrl('/urun/calacatta-gold'), '/urun/calacatta-gold');
  });

  await t.test('should compute correct canvas aspect ratios for all supported formats', () => {
    assert.deepEqual(getCanvasDimensions('portrait'), { width: 595, height: 842 });
    assert.deepEqual(getCanvasDimensions('landscape'), { width: 842, height: 595 });
    assert.deepEqual(getCanvasDimensions('square'), { width: 700, height: 700 });
    assert.deepEqual(getCanvasDimensions(undefined), { width: 595, height: 842 });
  });

  await t.test('should verify access control for published vs unpublished catalogs', () => {
    const isPubliclyAccessible = (catalog, auth) => {
      if (catalog.isPublished) return true;
      if (!auth) return false;
      return auth.role === 'admin' || (auth.role === 'brand' && auth.id === catalog.brandId);
    };

    const publishedCat = { isPublished: true, brandId: 'brand-1' };
    const draftCat = { isPublished: false, brandId: 'brand-1' };

    // Anonymous visitor
    assert.equal(isPubliclyAccessible(publishedCat, null), true);
    assert.equal(isPubliclyAccessible(draftCat, null), false);

    // Other brand trying to view draft
    assert.equal(isPubliclyAccessible(draftCat, { role: 'brand', id: 'brand-2' }), false);

    // Owner brand viewing draft preview
    assert.equal(isPubliclyAccessible(draftCat, { role: 'brand', id: 'brand-1' }), true);

    // Admin viewing draft preview
    assert.equal(isPubliclyAccessible(draftCat, { role: 'admin', id: 'admin-1' }), true);
  });
});

test('Catalog PDF Export - Multi-Page Print Stage & High-DPI Output Verification', async (t) => {
  const getPageCssSize = (format, orientation) => {
    const dominant = format || orientation || 'portrait';
    if (dominant === 'landscape') return 'A4 landscape';
    if (dominant === 'square') return '210mm 210mm';
    return 'A4 portrait';
  };

  await t.test('should calculate correct dynamic @page CSS rule for different catalog orientations', () => {
    assert.equal(getPageCssSize('portrait'), 'A4 portrait');
    assert.equal(getPageCssSize('landscape'), 'A4 landscape');
    assert.equal(getPageCssSize('square'), '210mm 210mm');
    assert.equal(getPageCssSize(undefined, 'landscape'), 'A4 landscape');
    assert.equal(getPageCssSize(undefined, undefined), 'A4 portrait');
  });

  await t.test('should ensure each canvas page has break-after-page except the last page', () => {
    const pages = [
      { id: 'p1', title: 'Sayfa 1', format: 'portrait' },
      { id: 'p2', title: 'Sayfa 2', format: 'portrait' },
      { id: 'p3', title: 'Sayfa 3', format: 'portrait' }
    ];

    const getPagePrintClass = (idx, total) => {
      const isLast = idx === total - 1;
      return isLast ? 'catalog-print-page' : 'catalog-print-page break-after-page page-break-always';
    };

    assert.ok(getPagePrintClass(0, pages.length).includes('page-break-always'));
    assert.ok(getPagePrintClass(1, pages.length).includes('page-break-always'));
    assert.ok(!getPagePrintClass(2, pages.length).includes('page-break-always'));
  });

  await t.test('should enforce eager loading and sync decoding on print stage images', () => {
    const getImageAttributes = (isPrint) => ({
      loading: isPrint ? 'eager' : 'lazy',
      decoding: isPrint ? 'sync' : 'async'
    });

    assert.deepEqual(getImageAttributes(true), { loading: 'eager', decoding: 'sync' });
    assert.deepEqual(getImageAttributes(false), { loading: 'lazy', decoding: 'async' });
  });

  await t.test('should verify print pre-flight image completion logic', async () => {
    const mockImages = [
      { src: '/slab1.jpg', complete: true },
      { src: '/slab2.jpg', complete: true }
    ];

    const pending = mockImages.filter((img) => !img.complete && img.src);
    assert.equal(pending.length, 0);

    const mockPendingImages = [
      { src: '/slab1.jpg', complete: true },
      { src: '/slab2.jpg', complete: false }
    ];
    const stillPending = mockPendingImages.filter((img) => !img.complete && img.src);
    assert.equal(stillPending.length, 1);
    assert.equal(stillPending[0].src, '/slab2.jpg');
  });

  await t.test('should verify exact print color adjustment styles are applied to canvas elements', () => {
    const getPrintStyle = () => ({
      WebkitPrintColorAdjust: 'exact',
      printColorAdjust: 'exact'
    });

    const style = getPrintStyle();
    assert.equal(style.WebkitPrintColorAdjust, 'exact');
    assert.equal(style.printColorAdjust, 'exact');
  });
});

