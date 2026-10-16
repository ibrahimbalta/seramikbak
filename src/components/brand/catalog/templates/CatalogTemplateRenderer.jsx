'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Printer,
  BookOpen,
  LayoutGrid,
  FileText,
  Loader2
} from 'lucide-react';
import MilanoLookbookTemplate from './MilanoLookbookTemplate';
import MinimalCollectionTemplate from './MinimalCollectionTemplate';
import ArchitecturalSpecSheetTemplate from './ArchitecturalSpecSheetTemplate';
import ShowroomCollectionTemplate from './ShowroomCollectionTemplate';
import GlobalExportTemplate from './GlobalExportTemplate';
import LidyaTechnicTemplate from './LidyaTechnicTemplate';
import DecoExclusiveTemplate from './DecoExclusiveTemplate';
import ArchitecturalEditorialTemplate from './ArchitecturalEditorialTemplate';
import MaterialTextureTemplate from './MaterialTextureTemplate';
import CustomCanvasPageRenderer from './CustomCanvasPageRenderer';
import { prepareAndPrintCatalog } from '@/utils/printCatalog';

export default function CatalogTemplateRenderer({
  catalog,
  products = [],
  mode = 'preview', // 'preview' | 'print'
  initialPage = 0
}) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [viewFormat, setViewFormat] = useState('single'); // 'single' | 'spread' | 'all'
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const containerRef = useRef(null);

  if (!catalog) return null;

  const hasCustomCanvas =
    (catalog?.template === 'custom-canvas' ||
      catalog?.template === 'serbest-tuval' ||
      catalog?.useCustomCanvas === true) &&
    Array.isArray(catalog?.customCanvasPages) &&
    catalog.customCanvasPages.length > 0;
  const template = catalog.template || 'premium-mimari';
  const isLandscape = catalog.orientation === 'landscape';

  // Calculate total pages dynamically (Custom canvas pages vs Easy mode templates)
  let extraPages = 0;
  let productPagesCount = products.length > 0 ? products.length : 2;

  if (hasCustomCanvas) {
    productPagesCount = 0;
    extraPages = 0;
  } else if (template === 'lidya') {
    extraPages += 1; // System & 4 domains page
    extraPages += 1; // Colour engineering page
    if (catalog.showSpecs !== false) extraPages += 1; // Technical standards page
    if (catalog.showQrCodes !== false) extraPages += 1; // Digital BIM & 3D
    productPagesCount = products.length > 0 ? products.length : 2;
  } else if (template === 'deco') {
    productPagesCount = productPagesCount * 2; // 2 pages per product spread (Left: Mekan Fotoğrafı / Right: Ebat & Dekofon Detayı)
    if (catalog.showSpecs !== false) extraPages += 1; // Technical standards & packing page
  } else if (template === 'showroom') {
    productPagesCount = Math.max(1, Math.ceil(productPagesCount / 2));
  } else if (template === 'spec-sheet' || template === 'teknik-urun' || template === 'nordic') {
    if (catalog.showSpecs !== false) extraPages += 1;
    productPagesCount = products.length > 0 ? products.length : 1;
  } else if (
    template === 'architectural-editorial' ||
    template === 'mimar-sunum' ||
    template === 'terra-luxe' ||
    template === 'dogal-tas-mermer' ||
    template === 'premium-mimari' ||
    template === 'milano'
  ) {
    productPagesCount = 2;
    extraPages = 2;
  }

  const totalPages = hasCustomCanvas
    ? catalog.customCanvasPages.length
    : (template === 'material-texture' ||
       template === 'yuzey-doku' ||
       template === 'doku-renk' ||
       template === 'yuzey-ve-doku')
    ? (catalog.showCover !== false ? 1 : 0) +
      3 + // surface philosophy + spectrum grid + macro focus
      (catalog.showSpecs !== false ? 1 : 0) +
      1 + // application spaces
      (catalog.showContactPage !== false ? 1 : 0)
    : (template === 'architectural-editorial' ||
       template === 'mimar-sunum' ||
       template === 'terra-luxe' ||
       template === 'dogal-tas-mermer' ||
       template === 'premium-mimari' ||
       template === 'milano')
    ? (catalog.showCover !== false ? 1 : 0) +
      5 + // manifesto (1) + panoramic living (1) + hero slab (1) + macro specs (1) + collection matrix (1)
      (catalog.showSpecs !== false ? 1 : 0) + // specs table (1)
      (catalog.showContactPage !== false ? 1 : 0) // back cover (1)
    : (catalog.showCover !== false ? 1 : 0) +
      (catalog.showTOC !== false ? 1 : 0) +
      productPagesCount +
      extraPages +
      (catalog.showContactPage !== false ? 1 : 0);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (mode === 'print') return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        setCurrentPage((prev) => Math.min(totalPages - 1, prev + (viewFormat === 'spread' && prev > 0 ? 2 : 1)));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        setCurrentPage((prev) => Math.max(0, prev - (viewFormat === 'spread' && prev > 1 ? 2 : 1)));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [totalPages, mode, viewFormat]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handlePrint = async () => {
    if (isPrinting) return;
    setIsPrinting(true);
    try {
      if (catalog?.slug) {
        fetch(`/api/brand/catalogs/public/${catalog.slug}?download=true`).catch(() => {});
      }
      await prepareAndPrintCatalog({ stageId: 'catalog-print-stage' });
    } finally {
      setIsPrinting(false);
    }
  };

  const renderTemplateComponent = () => {
    if (hasCustomCanvas) {
      return (
        <CustomCanvasPageRenderer
          catalog={catalog}
          activePageIndex={currentPage}
          viewFormat={viewFormat}
          mode={mode}
          onSelectPage={(idx) => {
            setCurrentPage(idx);
            setViewFormat('single');
          }}
        />
      );
    }

    const props = {
      catalog,
      products,
      mode,
      activePageIndex: currentPage,
      viewFormat,
      onSelectPage: (idx) => {
        setCurrentPage(idx);
        if (viewFormat === 'spread') setViewFormat('single');
      }
    };

    switch (template) {
      case 'spec-sheet':
      case 'teknik-urun':
      case 'nordic':
        return <ArchitecturalSpecSheetTemplate {...props} />;
      case 'minimal-koleksiyon':
      case 'minimal-editorial':
      case 'nordic-minimal':
        return <MinimalCollectionTemplate {...props} />;
      case 'showroom':
      case 'fuar-bayi':
        return <ShowroomCollectionTemplate {...props} />;
      case 'global-export':
      case 'modern-ihracat':
        return <GlobalExportTemplate {...props} />;
      case 'lidya':
      case 'endustriyel-ticari':
      case 'outdoor':
        return <LidyaTechnicTemplate {...props} />;
      case 'deco':
      case 'dijital-brosur':
      case 'artisan':
        return <DecoExclusiveTemplate {...props} />;
      case 'material-texture':
      case 'yuzey-doku':
      case 'doku-renk':
      case 'yuzey-ve-doku':
        return <MaterialTextureTemplate {...props} />;
      case 'architectural-editorial':
      case 'mimar-sunum':
      case 'terra-luxe':
      case 'dogal-tas-mermer':
      case 'premium-mimari':
      case 'milano':
      case 'verona':
      case 'banyo-mutfak':
      case 'renk-ebat-rehberi':
      case 'yeni-lansman':
      default:
        return <ArchitecturalEditorialTemplate {...props} />;
    }
  };

  return (
    <div
      id="catalog-print-stage"
      ref={containerRef}
      className={`catalog-super-renderer ${mode === 'print' ? 'mode-print' : 'mode-interactive'} ${
        isFullscreen ? 'is-fullscreen' : ''
      }`}
    >
      <style jsx global>{`
        /* Global Reset & Isolation for Catalog Pages */
        .catalog-super-renderer {
          width: 100%;
          position: relative;
          color: #0f172a;
          box-sizing: border-box;
        }

        .catalog-super-renderer * {
          box-sizing: border-box;
        }

        /* Interactive Reader Backdrop */
        .mode-interactive {
          background: radial-gradient(circle at 50% 15%, #181d26 0%, #0d1117 60%, #06080c 100%);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 30px 70px -15px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.1);
        }

        /* Fixed Page Aspect Ratio & Presentation Scaler */
        .catalog-page {
          width: 100%;
          max-width: ${isLandscape ? '1100px' : '820px'};
          aspect-ratio: ${isLandscape ? '297 / 210' : '210 / 297'};
          margin: 0 auto;
          box-shadow: 0 25px 60px -12px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(0, 0, 0, 0.08);
          border-radius: 0px;
          overflow: hidden;
          position: relative;
          background: #ffffff;
          transition: transform 0.2s ease, opacity 0.2s ease;
        }

        /* Deco Exclusive 1:1 Square Editorial Format (Bien Standard) */
        .deco-square-page {
          width: 100%;
          max-width: 820px;
          aspect-ratio: 1 / 1;
          margin: 0 auto;
          box-shadow: 0 25px 60px -12px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(0, 0, 0, 0.08);
          border-radius: 0px;
          overflow: hidden;
          position: relative;
          background: #ffffff;
          transition: transform 0.2s ease, opacity 0.2s ease;
        }

        /* Mobile Ergonomics & Symmetrical Adaptability */
        @media (max-width: 640px) {
          .mode-interactive {
            border-radius: 12px;
            background: #0d1117;
          }
          .catalog-page,
          .deco-square-page {
            max-width: 100% !important;
            aspect-ratio: auto !important;
            min-height: auto !important;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5) !important;
          }
        }

        /* High-DPI Print Output Rules */
        @media print {
          @page {
            size: ${catalog.pageSize === 'letter' ? 'letter' : 'A4'} ${isLandscape ? 'landscape' : 'portrait'};
            margin: 0mm;
          }

          body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .no-print,
          .catalog-reader-toolbar,
          .catalog-thumbnail-bar,
          header,
          nav,
          footer,
          button {
            display: none !important;
          }

          .catalog-super-renderer {
            background: transparent !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            width: 100% !important;
          }

          .catalog-page,
          .deco-square-page {
            width: 100% !important;
            max-width: 100% !important;
            height: 100vh !important;
            aspect-ratio: auto !important;
            margin: 0 !important;
            padding: 10mm !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            page-break-after: always !important;
            break-after: page !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}</style>

      {/* -------------------- TOP READER TOOLBAR -------------------- */}
      {mode !== 'print' && (
        <div className="no-print bg-neutral-950/95 border-b border-white/10 px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between text-white select-none">
          {/* Left: Template badge & View Mode Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[11px] sm:text-xs font-bold tracking-wide uppercase text-amber-300 truncate max-w-[120px] sm:max-w-none">
              {template.toUpperCase()} LOOKBOOK
            </span>

            <div className="h-4 w-px bg-white/20 hidden md:block" />

            {/* View Format Selector (Desktop / Tablet) */}
            <div className="hidden md:flex items-center gap-1 bg-white/10 p-0.5 rounded-lg text-[11px]">
              <button
                onClick={() => setViewFormat('single')}
                className={`px-2.5 py-1 rounded-md font-semibold transition flex items-center gap-1 ${
                  viewFormat === 'single' ? 'bg-amber-500 text-neutral-950 shadow' : 'text-neutral-300 hover:text-white'
                }`}
              >
                <FileText size={12} />
                <span>Tek Sayfa</span>
              </button>

              <button
                onClick={() => setViewFormat('spread')}
                className={`px-2.5 py-1 rounded-md font-semibold transition flex items-center gap-1 ${
                  viewFormat === 'spread' ? 'bg-amber-500 text-neutral-950 shadow' : 'text-neutral-300 hover:text-white'
                }`}
              >
                <BookOpen size={12} />
                <span>Çift Sayfa (Dergilik)</span>
              </button>

              <button
                onClick={() => setViewFormat('all')}
                className={`px-2.5 py-1 rounded-md font-semibold transition flex items-center gap-1 ${
                  viewFormat === 'all' ? 'bg-amber-500 text-neutral-950 shadow' : 'text-neutral-300 hover:text-white'
                }`}
              >
                <LayoutGrid size={12} />
                <span>Tüm Sayfalar</span>
              </button>
            </div>
          </div>

          {/* Center: Pagination Controls (Single / Spread) */}
          {viewFormat !== 'all' && (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                disabled={currentPage === 0}
                onClick={() => setCurrentPage((p) => Math.max(0, p - (viewFormat === 'spread' && p > 1 ? 2 : 1)))}
                className="p-1 sm:p-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 transition text-neutral-200"
                title="Önceki Sayfa"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="px-2.5 sm:px-3 py-1 rounded-lg bg-white/10 text-[11px] sm:text-xs font-mono font-bold">
                <span className="text-amber-400">{currentPage + 1}</span>
                <span className="text-neutral-400"> / {totalPages}</span>
              </div>

              <button
                disabled={currentPage >= totalPages - 1}
                onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + (viewFormat === 'spread' && p > 0 ? 2 : 1)))}
                className="p-1 sm:p-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 transition text-neutral-200"
                title="Sonraki Sayfa"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* Right: Print & Fullscreen */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={handlePrint}
              disabled={isPrinting}
              className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-neutral-950 text-xs font-bold flex items-center gap-1.5 shadow transition cursor-pointer"
              title="Yazdır / PDF Olarak Kaydet"
            >
              {isPrinting ? <Loader2 size={14} className="animate-spin" /> : <Printer size={14} />}
              <span className="hidden sm:inline">{isPrinting ? 'Hazırlanıyor...' : 'PDF İndir'}</span>
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white transition"
              title="Tam Ekran"
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          </div>
        </div>
      )}

      {/* -------------------- MAIN DISPLAY ARENA -------------------- */}
      <div className="p-2 sm:p-6 md:p-10 flex items-center justify-center min-h-[460px]">
        <div className="w-full flex flex-col items-center justify-center">
          {renderTemplateComponent()}
        </div>
      </div>

      {/* -------------------- BOTTOM FILMSTRIP NAVIGATION -------------------- */}
      {mode !== 'print' && viewFormat !== 'all' && (
        <div className="no-print bg-neutral-950/95 border-t border-white/10 p-2.5 sm:p-3 flex items-center justify-center gap-1.5 sm:gap-2 overflow-x-auto">
          {Array.from({ length: totalPages }).map((_, idx) => {
            const isSelected = currentPage === idx;
            return (
              <button
                key={idx}
                onClick={() => setCurrentPage(idx)}
                className={`px-2 sm:px-2.5 py-1 rounded-md text-[11px] font-mono font-bold transition whitespace-nowrap ${
                  isSelected
                    ? 'bg-amber-500 text-neutral-950 shadow-md ring-1 ring-amber-400'
                    : 'bg-white/10 text-neutral-400 hover:bg-white/20 hover:text-white'
                }`}
              >
                #{idx + 1}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
