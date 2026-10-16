import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  QrCode,
  Printer,
  X,
  Sparkles,
  Check,
  Scissors,
  Layers,
  Building,
  Eye,
  Sliders,
  Smartphone,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { generateQrDataUrl, buildProductStudioUrl, buildCatalogPublicUrl } from '../../../utils/generateQrCode';
import { prepareAndPrintCatalog } from '../../../utils/printCatalog';

const LAYOUTS = [
  { id: 'grid-4', name: "A4 4'lü Stand (2×2)", cols: 2, rows: 2, perPage: 4, desc: '105 × 148 mm • Teşhir kanatları için ideal' },
  { id: 'grid-6', name: "A4 6'lı Stand (2×3)", cols: 2, rows: 3, perPage: 6, desc: '105 × 99 mm • Standart showroom stant etiketi' },
  { id: 'grid-8', name: "A4 8'li Raf (2×4)", cols: 2, rows: 4, perPage: 8, desc: '105 × 74 mm • Numune kutusu ve raf etiketi' },
  { id: 'grid-9', name: "A4 9'lu Kutu (3×3)", cols: 3, rows: 3, perPage: 9, desc: '70 × 99 mm • Kompakt kare numune etiketi' },
  { id: 'single-large', name: "A4 2'li Büyük Panel (1×2)", cols: 1, rows: 2, perPage: 2, desc: '210 × 148 mm • Showroom ana teşhir panosu' }
];

const THEMES = [
  {
    id: 'clean-white',
    name: '⚪ Temiz Stüdyo Beyazı',
    desc: 'Yüksek kontrast, renk doğruluğu ve ekonomik baskı.',
    cardBg: '#ffffff',
    cardBorder: '#e2e8f0',
    textColor: '#0f172a',
    subTextColor: '#64748b',
    badgeBg: '#f1f5f9',
    badgeText: '#0f172a',
    accentColor: '#b4823c',
    qrBg: '#ffffff',
    qrDark: '#0f172a'
  },
  {
    id: 'luxury-gold',
    name: '🏆 Lüks Altın & Antrasit',
    desc: 'Showroom teşhirlerinde prestijli altın yansımalar.',
    cardBg: '#0f172a',
    cardBorder: 'rgba(212, 175, 55, 0.4)',
    textColor: '#f8fafc',
    subTextColor: '#94a3b8',
    badgeBg: 'rgba(212, 175, 55, 0.15)',
    badgeText: '#d4af37',
    accentColor: '#d4af37',
    qrBg: '#ffffff',
    qrDark: '#0f172a'
  },
  {
    id: 'minimal-dark',
    name: '🌑 Elite Siyah',
    desc: 'Modern mimari ve monokrom showroom stantları.',
    cardBg: '#18181b',
    cardBorder: '#27272a',
    textColor: '#ffffff',
    subTextColor: '#a1a1aa',
    badgeBg: '#27272a',
    badgeText: '#e4e4e7',
    accentColor: '#ffffff',
    qrBg: '#ffffff',
    qrDark: '#000000'
  }
];

export default function ShowroomQrStickerModal({
  isOpen,
  onClose,
  catalog,
  products = [],
  brandName = 'SeramikBak',
  brandLogo = null
}) {
  const [selectedLayoutId, setSelectedLayoutId] = useState('grid-6');
  const [selectedThemeId, setSelectedThemeId] = useState('clean-white');
  const [qrDestination, setQrDestination] = useState('studio3d'); // 'studio3d' | 'catalog'
  const [showProductImage, setShowProductImage] = useState(true);
  const [showBrandHeader, setShowBrandHeader] = useState(true);
  const [showCuttingGuides, setShowCuttingGuides] = useState(true);
  const [customPriceNote, setCustomPriceNote] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [qrCache, setQrCache] = useState({});
  const [isPrinting, setIsPrinting] = useState(false);
  const [mobileTab, setMobileTab] = useState('settings'); // 'settings' | 'preview'
  const [previewZoom, setPreviewZoom] = useState('fit'); // 'fit' | '100%'
  const [containerWidth, setContainerWidth] = useState(0);
  const previewContainerRef = useRef(null);

  // Measure container width for responsive A4 scaling on mobile screens
  useEffect(() => {
    function updateWidth() {
      if (previewContainerRef.current) {
        setContainerWidth(previewContainerRef.current.clientWidth);
      } else if (typeof window !== 'undefined') {
        setContainerWidth(window.innerWidth);
      }
    }
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [isOpen, mobileTab]);

  const availableWidth = containerWidth > 0 ? containerWidth - 32 : 794;
  const scaleFactor = useMemo(() => {
    if (previewZoom === '100%') return 1;
    if (availableWidth >= 794) return 1;
    return Math.min(1, Math.max(0.32, availableWidth / 794));
  }, [previewZoom, availableWidth]);

  // Initialize selected product IDs with all products
  useEffect(() => {
    if (products && products.length > 0) {
      setSelectedProductIds(products.map((p) => p.id || p.productId));
    }
  }, [products]);

  const activeLayout = useMemo(() => {
    return LAYOUTS.find((l) => l.id === selectedLayoutId) || LAYOUTS[1];
  }, [selectedLayoutId]);

  const activeTheme = useMemo(() => {
    return THEMES.find((t) => t.id === selectedThemeId) || THEMES[0];
  }, [selectedThemeId]);

  // Filtered active products for stickers
  const activeProducts = useMemo(() => {
    if (!products || products.length === 0) return [];
    if (selectedProductIds.length === 0) return products;
    return products.filter((p) => selectedProductIds.includes(p.id || p.productId));
  }, [products, selectedProductIds]);

  // Generate QR codes for all products whenever list or destination changes
  useEffect(() => {
    let isCancelled = false;

    async function loadQrs() {
      const newCache = { ...qrCache };
      let updated = false;

      for (const p of activeProducts) {
        const id = p.id || p.productId;
        const targetUrl =
          qrDestination === 'catalog' && catalog?.publicSlug
            ? buildCatalogPublicUrl(catalog.publicSlug)
            : buildProductStudioUrl(p);

        const cacheKey = `${id}_${qrDestination}_${activeTheme.qrDark}`;
        if (!newCache[cacheKey]) {
          try {
            const dataUrl = await generateQrDataUrl(targetUrl, {
              width: 220,
              margin: 1,
              color: {
                dark: activeTheme.qrDark,
                light: activeTheme.qrBg
              }
            });
            newCache[cacheKey] = dataUrl;
            updated = true;
          } catch (err) {
            console.error('Failed to generate QR for product:', id, err);
          }
        }
      }

      if (!isCancelled && updated) {
        setQrCache(newCache);
      }
    }

    if (activeProducts.length > 0) {
      loadQrs();
    }

    return () => {
      isCancelled = true;
    };
  }, [activeProducts, qrDestination, activeTheme, catalog]);

  // Chunk products into printable A4 pages
  const pages = useMemo(() => {
    const list = activeProducts;
    const perPage = activeLayout.perPage;
    const chunks = [];
    for (let i = 0; i < list.length; i += perPage) {
      chunks.push(list.slice(i, i + perPage));
    }
    return chunks;
  }, [activeProducts, activeLayout]);

  const toggleProductSelect = (id) => {
    setSelectedProductIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const selectAllProducts = () => {
    setSelectedProductIds(products.map((p) => p.id || p.productId));
  };

  const clearProductSelection = () => {
    setSelectedProductIds([]);
  };

  const handlePrint = async () => {
    setIsPrinting(true);
    try {
      await prepareAndPrintCatalog({
        stageId: 'showroom-sticker-print-area',
        timeoutMs: 4000
      });
    } finally {
      setIsPrinting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-neutral-950/80 backdrop-blur-md overflow-hidden text-neutral-100 font-sans">
      {/* Top Header Bar */}
      <header className="px-3 sm:px-6 py-2.5 sm:py-3 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between flex-shrink-0 z-20 gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-700/30 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-sm flex-shrink-0">
            <QrCode size={18} className="sm:hidden" />
            <QrCode size={22} className="hidden sm:block" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-xs sm:text-base font-extrabold text-white truncate">
                QR Etiket & Panel Baskı
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 flex-shrink-0">
                A4 Teşhir
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-neutral-400 truncate">
              {catalog?.title ? `${catalog.title} • ` : ''}
              {activeProducts.length} model • {pages.length} A4 sayfa
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
          <button
            type="button"
            onClick={handlePrint}
            disabled={isPrinting || activeProducts.length === 0}
            className="px-2.5 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-black text-xs flex items-center gap-1.5 sm:gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer disabled:opacity-50"
            title="A4 Etiketleri Yazdır / PDF Al"
          >
            {isPrinting ? <RefreshCw size={14} className="animate-spin" /> : <Printer size={14} />}
            <span className="hidden sm:inline">A4 Etiketleri Yazdır / PDF</span>
            <span className="sm:hidden font-bold">Yazdır / PDF</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-2 sm:p-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition cursor-pointer"
            title="Kapat"
          >
            <X size={18} />
          </button>
        </div>
      </header>

      {/* Mobile Tab Switcher (Visible on small screens) */}
      <div className="lg:hidden flex items-center bg-neutral-950 border-b border-neutral-800 p-1 flex-shrink-0 z-10">
        <button
          type="button"
          onClick={() => setMobileTab('settings')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
            mobileTab === 'settings'
              ? 'bg-neutral-800 text-amber-300 shadow-sm border border-neutral-700'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Sliders size={13} />
          <span>Etiket Ayarları & Modeller</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('preview')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
            mobileTab === 'preview'
              ? 'bg-neutral-800 text-amber-300 shadow-sm border border-neutral-700'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Eye size={13} />
          <span>A4 Canlı Önizleme ({pages.length})</span>
        </button>
      </div>

      {/* Main Workspace Body */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Left Control Sidebar */}
        <aside
          className={`w-full lg:w-84 xl:w-96 bg-neutral-900/95 border-r border-neutral-800 flex-col overflow-y-auto p-4 sm:p-5 gap-4 sm:gap-5 flex-shrink-0 ${
            mobileTab === 'settings' ? 'flex flex-1 lg:flex-none' : 'hidden lg:flex'
          }`}
        >
          {/* Section: Layouts */}
          <div>
            <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block mb-2.5 flex items-center gap-1.5">
              <Layers size={13} className="text-amber-400" />
              <span>A4 Baskı Mizanpajı</span>
            </label>
            <div className="grid grid-cols-1 gap-2">
              {LAYOUTS.map((layout) => {
                const isSelected = selectedLayoutId === layout.id;
                return (
                  <button
                    key={layout.id}
                    type="button"
                    onClick={() => setSelectedLayoutId(layout.id)}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/10 text-white'
                        : 'border-neutral-800 bg-neutral-950/60 text-neutral-300 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{layout.name}</span>
                      {isSelected && <Check size={14} className="text-amber-400" />}
                    </div>
                    <span className="text-[11px] text-neutral-400 block mt-0.5">{layout.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Themes */}
          <div>
            <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block mb-2.5 flex items-center gap-1.5">
              <Sparkles size={13} className="text-amber-400" />
              <span>Etiket Teması</span>
            </label>
            <div className="grid grid-cols-1 gap-2">
              {THEMES.map((theme) => {
                const isSelected = selectedThemeId === theme.id;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setSelectedThemeId(theme.id)}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/10 text-white'
                        : 'border-neutral-800 bg-neutral-950/60 text-neutral-300 hover:border-neutral-700'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold block">{theme.name}</span>
                      <span className="text-[10px] text-neutral-400">{theme.desc}</span>
                    </div>
                    {isSelected && <Check size={14} className="text-amber-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: QR Destination */}
          <div>
            <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
              <Smartphone size={13} className="text-amber-400" />
              <span>QR Kod Okutulunca Ne Açılsın?</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setQrDestination('studio3d')}
                className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                  qrDestination === 'studio3d'
                    ? 'border-amber-500 bg-amber-500/15 text-amber-300 font-bold'
                    : 'border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:text-white'
                }`}
              >
                <div className="text-xs font-bold">3D Studio</div>
                <div className="text-[10px] opacity-75">Mekanda Gör</div>
              </button>

              <button
                type="button"
                onClick={() => setQrDestination('catalog')}
                className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                  qrDestination === 'catalog'
                    ? 'border-amber-500 bg-amber-500/15 text-amber-300 font-bold'
                    : 'border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:text-white'
                }`}
              >
                <div className="text-xs font-bold">Web Kataloğu</div>
                <div className="text-[10px] opacity-75">Tüm Koleksiyon</div>
              </button>
            </div>
          </div>

          {/* Section: Options */}
          <div>
            <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
              <Sliders size={13} className="text-amber-400" />
              <span>Etiket Detayları</span>
            </label>
            <div className="space-y-2 bg-neutral-950/60 p-3 rounded-xl border border-neutral-800 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-neutral-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={showProductImage}
                  onChange={(e) => setShowProductImage(e.target.checked)}
                  className="rounded border-neutral-700 bg-neutral-900 text-amber-500 focus:ring-0 cursor-pointer"
                />
                <span>Seramik Görselini Dahil Et</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-neutral-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={showBrandHeader}
                  onChange={(e) => setShowBrandHeader(e.target.checked)}
                  className="rounded border-neutral-700 bg-neutral-900 text-amber-500 focus:ring-0 cursor-pointer"
                />
                <span>Marka Başlığı / Logosu</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-neutral-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={showCuttingGuides}
                  onChange={(e) => setShowCuttingGuides(e.target.checked)}
                  className="rounded border-neutral-700 bg-neutral-900 text-amber-500 focus:ring-0 cursor-pointer"
                />
                <span>Makas Kesim Kılavuzları (✂)</span>
              </label>
            </div>
          </div>

          {/* Section: Custom Note or Price */}
          <div>
            <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block mb-1.5">
              Özel Not veya Perakende Tavsiyesi
            </label>
            <input
              type="text"
              value={customPriceNote}
              onChange={(e) => setCustomPriceNote(e.target.value)}
              placeholder="Örn: Tavsiye Edilen Liste Fiyatı: 850 ₺/m²"
              className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-500"
            />
            <p className="text-[10px] text-neutral-500 mt-1">
              Etiketin alt kısmında bayiler ve müşteriler için gösterilir.
            </p>
          </div>

          {/* Section: Product Selection Filter */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                Basılacak Modeller ({selectedProductIds.length}/{products.length})
              </label>
              <div className="flex items-center gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={selectAllProducts}
                  className="text-amber-400 hover:underline cursor-pointer"
                >
                  Tümü
                </button>
                <span className="text-neutral-600">•</span>
                <button
                  type="button"
                  onClick={clearProductSelection}
                  className="text-neutral-400 hover:underline cursor-pointer"
                >
                  Temizle
                </button>
              </div>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1 bg-neutral-950/80 p-2 rounded-xl border border-neutral-800">
              {products.map((p) => {
                const id = p.id || p.productId;
                const isSelected = selectedProductIds.includes(id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggleProductSelect(id)}
                    className={`w-full px-2.5 py-1.5 rounded-lg text-left flex items-center justify-between text-xs transition cursor-pointer ${
                      isSelected
                        ? 'bg-neutral-800/90 text-white font-medium'
                        : 'text-neutral-400 hover:bg-neutral-900'
                    }`}
                  >
                    <span className="truncate pr-2">{p.name || p.title || id}</span>
                    {isSelected && <Check size={12} className="text-amber-400 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mobile Bottom CTA to Switch to Preview */}
          <div className="lg:hidden mt-2 pt-3 border-t border-neutral-800">
            <button
              type="button"
              onClick={() => setMobileTab('preview')}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              <Eye size={15} />
              <span>A4 Canlı Önizlemeyi Gör ({pages.length} Sayfa)</span>
              <ChevronRight size={15} />
            </button>
          </div>
        </aside>

        {/* Right Main Preview Area */}
        <main
          ref={previewContainerRef}
          className={`flex-1 overflow-y-auto p-3 sm:p-6 md:p-10 flex-col items-center bg-neutral-950 ${
            mobileTab === 'preview' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {/* Preview Controls Bar */}
          <div className="mb-4 w-full max-w-[794px] flex flex-wrap items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] sm:text-xs font-bold text-neutral-400 uppercase tracking-wider">
                A4 Canlı Önizleme ({pages.length} sayfa • 210 × 297 mm)
              </span>
            </div>

            {/* Mobile / Desktop Zoom Control */}
            <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 rounded-lg p-1 text-[11px]">
              <button
                type="button"
                onClick={() => setPreviewZoom('fit')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition cursor-pointer ${
                  previewZoom === 'fit'
                    ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Ekrana Sığdır ({Math.round(scaleFactor * 100)}%)
              </button>
              <button
                type="button"
                onClick={() => setPreviewZoom('100%')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition cursor-pointer ${
                  previewZoom === '100%'
                    ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                %100 Boyut
              </button>
            </div>
          </div>

          {/* Printable Stage */}
          <div id="showroom-sticker-print-area" className="flex flex-col gap-6 sm:gap-10 items-center w-full">
            {pages.map((pageProducts, pageIdx) => (
              <div
                key={`page-wrapper-${pageIdx}`}
                className="showroom-page-wrapper flex justify-center items-start w-full overflow-hidden"
                style={{
                  height: scaleFactor < 1 ? `${Math.round(1123 * scaleFactor)}px` : 'auto',
                  marginBottom: scaleFactor < 1 ? '16px' : '0px'
                }}
              >
                <div
                  key={`page-${pageIdx}`}
                  className="showroom-a4-sheet bg-white shadow-2xl relative"
                  style={{
                    width: '794px', // A4 pixel width at 96 DPI
                    minHeight: '1123px', // A4 pixel height at 96 DPI
                    height: '1123px',
                    boxSizing: 'border-box',
                    padding: '24px',
                    backgroundColor: '#ffffff',
                    pageBreakAfter: 'always',
                    breakAfter: 'page',
                    transform: scaleFactor < 1 ? `scale(${scaleFactor})` : 'none',
                    transformOrigin: 'top center',
                    flexShrink: 0
                  }}
                >
                {/* Grid Container */}
                <div
                  className="w-full h-full grid"
                  style={{
                    gridTemplateColumns: `repeat(${activeLayout.cols}, minmax(0, 1fr))`,
                    gridTemplateRows: `repeat(${activeLayout.rows}, minmax(0, 1fr))`,
                    gap: showCuttingGuides ? '16px' : '12px',
                    height: '1075px'
                  }}
                >
                  {pageProducts.map((p, idx) => {
                    const id = p.id || p.productId;
                    const cacheKey = `${id}_${qrDestination}_${activeTheme.qrDark}`;
                    const qrUrl = qrCache[cacheKey] || '';
                    const sizeBadge =
                      p.width && p.height
                        ? `${p.width}×${p.height} cm`
                        : p.dimensions || p.size || '60×120 cm';
                    const surfaceText = p.finish || p.surface || 'Porselen Karo';
                    const imageSrc =
                      p.imageUrl ||
                      p.image ||
                      (Array.isArray(p.images) && p.images[0]) ||
                      '/renders/luxury_bathroom_calacatta_gold.jpg';

                    return (
                      <div
                        key={id || idx}
                        className="showroom-sticker-card relative flex flex-col justify-between overflow-hidden"
                        style={{
                          backgroundColor: activeTheme.cardBg,
                          border: showCuttingGuides
                            ? `1.5px dashed ${activeTheme.cardBorder}`
                            : `1px solid ${activeTheme.cardBorder}`,
                          borderRadius: '10px',
                          padding: activeLayout.id === 'single-large' ? '28px' : '14px',
                          color: activeTheme.textColor,
                          boxSizing: 'border-box'
                        }}
                      >
                        {/* Scissor icon for cutting guide */}
                        {showCuttingGuides && (
                          <div
                            className="absolute top-1 right-1 text-neutral-400 opacity-60 pointer-events-none"
                            style={{ fontSize: '10px' }}
                          >
                            <Scissors size={10} />
                          </div>
                        )}

                        {/* Card Header: Brand info */}
                        {showBrandHeader && (
                          <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-200/20">
                            <div className="flex items-center gap-1.5">
                              {brandLogo ? (
                                <img
                                  src={brandLogo}
                                  alt={brandName}
                                  className="h-4 object-contain max-w-[80px]"
                                />
                              ) : (
                                <Building size={12} style={{ color: activeTheme.accentColor }} />
                              )}
                              <span
                                className="text-[10px] font-black uppercase tracking-wider truncate"
                                style={{ color: activeTheme.accentColor }}
                              >
                                {brandName}
                              </span>
                            </div>
                            <span
                              className="text-[9px] font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded"
                              style={{
                                backgroundColor: activeTheme.badgeBg,
                                color: activeTheme.badgeText
                              }}
                            >
                              Showroom Teşhir
                            </span>
                          </div>
                        )}

                        {/* Card Center: Tile Image + Details + QR Code */}
                        <div className="flex-1 flex gap-3 items-center">
                          {/* Tile Image */}
                          {showProductImage && (
                            <div
                              className="relative rounded-lg overflow-hidden flex-shrink-0 bg-neutral-100 border border-neutral-200/30"
                              style={{
                                width:
                                  activeLayout.id === 'single-large'
                                    ? '160px'
                                    : activeLayout.id === 'grid-4'
                                    ? '110px'
                                    : '75px',
                                height:
                                  activeLayout.id === 'single-large'
                                    ? '180px'
                                    : activeLayout.id === 'grid-4'
                                    ? '120px'
                                    : '85px'
                              }}
                            >
                              <img
                                src={imageSrc}
                                alt={p.name || ''}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}

                          {/* Info Column */}
                          <div className="flex-1 flex flex-col justify-center min-w-0">
                            <h3
                              className="font-black leading-tight line-clamp-2"
                              style={{
                                fontSize:
                                  activeLayout.id === 'single-large'
                                    ? '1.25rem'
                                    : activeLayout.id === 'grid-4'
                                    ? '0.95rem'
                                    : '0.82rem',
                                color: activeTheme.textColor
                              }}
                            >
                              {p.name || p.title || 'Seramik Karo'}
                            </h3>

                            {p.code && (
                              <div
                                className="text-[10px] font-mono mt-0.5 opacity-80"
                                style={{ color: activeTheme.subTextColor }}
                              >
                                Kod: {p.code}
                              </div>
                            )}

                            {/* Dimension & Finish Badges */}
                            <div className="flex flex-wrap items-center gap-1 mt-2">
                              <span
                                className="px-1.5 py-0.5 rounded text-[10px] font-extrabold"
                                style={{
                                  backgroundColor: activeTheme.badgeBg,
                                  color: activeTheme.badgeText
                                }}
                              >
                                {sizeBadge}
                              </span>
                              <span
                                className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                                style={{
                                  backgroundColor: activeTheme.badgeBg,
                                  color: activeTheme.subTextColor
                                }}
                              >
                                {surfaceText}
                              </span>
                            </div>

                            {/* Custom Note / Price Tag */}
                            {customPriceNote && (
                              <div
                                className="mt-2 text-[10px] font-bold line-clamp-1"
                                style={{ color: activeTheme.accentColor }}
                              >
                                {customPriceNote}
                              </div>
                            )}
                          </div>

                          {/* QR Code Container */}
                          <div className="flex flex-col items-center justify-center flex-shrink-0">
                            <div
                              className="p-1 rounded-lg bg-white border border-neutral-300 shadow-sm flex items-center justify-center"
                              style={{
                                width:
                                  activeLayout.id === 'single-large'
                                    ? '120px'
                                    : activeLayout.id === 'grid-4'
                                    ? '85px'
                                    : '68px',
                                height:
                                  activeLayout.id === 'single-large'
                                    ? '120px'
                                    : activeLayout.id === 'grid-4'
                                    ? '85px'
                                    : '68px'
                              }}
                            >
                              {qrUrl ? (
                                <img
                                  src={qrUrl}
                                  alt="3D QR"
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <QrCode size={40} className="text-neutral-900" />
                              )}
                            </div>
                            <span
                              className="text-[8px] font-black uppercase tracking-tight text-center mt-1"
                              style={{ color: activeTheme.accentColor }}
                            >
                              3D Mekanda Gör
                            </span>
                          </div>
                        </div>

                        {/* Card Footer: Call to action bar */}
                        <div
                          className="pt-2 mt-2 border-t border-neutral-200/20 flex items-center justify-between text-[9px]"
                          style={{ color: activeTheme.subTextColor }}
                        >
                          <span className="flex items-center gap-1 font-semibold truncate">
                            <Smartphone size={10} style={{ color: activeTheme.accentColor }} />
                            <span>Kameranızla okutun, mekanınızda canlı deneyin</span>
                          </span>
                          <span className="font-mono text-[8px] opacity-70">
                            seramikbak.com
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
          </div>
        </main>
      </div>

      {/* Embedded CSS for Exact A4 Print Optimization */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #showroom-sticker-print-area,
          #showroom-sticker-print-area * {
            visibility: visible !important;
          }
          #showroom-sticker-print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
          }
          .showroom-page-wrapper {
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            display: block !important;
          }
          .showroom-a4-sheet {
            box-shadow: none !important;
            margin: 0 !important;
            width: 100% !important;
            height: 100vh !important;
            min-height: 100vh !important;
            transform: none !important;
            page-break-after: always !important;
            break-after: page !important;
          }
          @page {
            size: A4 portrait;
            margin: 6mm;
          }
        }
      `}</style>
    </div>
  );
}
