'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Printer,
  Share2,
  ZoomIn,
  ZoomOut,
  Layers,
  BookOpen,
  LayoutGrid,
  Sparkles,
  Download
} from 'lucide-react';
import MilanoLookbookTemplate from './MilanoLookbookTemplate';
import ArchitecturalSpecSheetTemplate from './ArchitecturalSpecSheetTemplate';
import ShowroomCollectionTemplate from './ShowroomCollectionTemplate';
import GlobalExportTemplate from './GlobalExportTemplate';

export default function CatalogTemplateRenderer({
  catalog,
  products = [],
  mode = 'preview', // 'preview' | 'print'
  initialPage = 0
}) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [viewFormat, setViewFormat] = useState('single'); // 'single' | 'all'
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const containerRef = useRef(null);

  if (!catalog) return null;

  const template = catalog.template || 'milano';
  const isLandscape = catalog.orientation === 'landscape';

  // Calculate total pages dynamically based on active template
  let extraPages = 0;
  if (template === 'milano') {
    if (catalog.showSpecs) extraPages += 1; // Technical standards page
    extraPages += 1; // Application areas page
    if (catalog.showQrCodes) extraPages += 1; // Digital 3D studio page
  }

  const totalPages =
    (catalog.showCover ? 1 : 0) +
    (catalog.showTOC ? 1 : 0) +
    (template === 'showroom' ? Math.max(1, Math.ceil(products.length / 2)) : products.length) +
    extraPages +
    (catalog.showContactPage ? 1 : 0);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (mode === 'print') return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        setCurrentPage((prev) => Math.max(0, prev - 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [totalPages, mode]);

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

  const renderTemplateComponent = () => {
    const props = {
      catalog,
      products,
      mode,
      activePageIndex: currentPage,
      viewFormat
    };

    switch (template) {
      case 'spec-sheet':
        return <ArchitecturalSpecSheetTemplate {...props} />;
      case 'showroom':
        return <ShowroomCollectionTemplate {...props} />;
      case 'global-export':
        return <GlobalExportTemplate {...props} />;
      case 'milano':
      default:
        return <MilanoLookbookTemplate {...props} />;
    }
  };

  return (
    <div
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
          background: radial-gradient(circle at 50% 15%, #151d2f 0%, #090e17 60%, #04070c 100%);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 30px 70px -15px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.1);
        }

        /* Fixed Page Aspect Ratio & Presentation Scaler */
        .catalog-page {
          width: 100%;
          max-width: ${isLandscape ? '1100px' : '820px'};
          aspect-ratio: ${isLandscape ? '297 / 210' : '210 / 297'};
          margin: 0 auto;
          box-shadow: 0 25px 60px -12px rgba(0, 0, 0, 0.65), 0 0 50px rgba(180, 130, 60, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.12);
          border-radius: 12px;
          overflow: hidden;
          position: relative;
          background: #faf8f5;
          transition: transform 0.2s ease, opacity 0.2s ease;
        }

        /* Mobile Responsiveness for Phone Viewports */
        @media (max-width: 640px) {
          .mode-interactive {
            border-radius: 12px;
            background: #090e17;
          }
          .catalog-page {
            max-width: 100% !important;
            aspect-ratio: auto !important;
            min-height: 480px !important;
            padding: 1.25rem 1rem !important;
            border-radius: 8px !important;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4) !important;
          }
          .catalog-page h1 {
            font-size: 1.75rem !important;
            line-height: 1.2 !important;
          }
          .catalog-page h2 {
            font-size: 1.5rem !important;
            line-height: 1.25 !important;
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

          .catalog-page {
            width: 100% !important;
            max-width: 100% !important;
            height: 100vh !important;
            aspect-ratio: auto !important;
            margin: 0 !important;
            padding: 12mm !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            page-break-after: always !important;
            break-after: page !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}</style>

      {/* -------------------- INTERACTIVE READER TOOLBAR (Top) -------------------- */}
      {mode !== 'print' && (
        <div className="no-print bg-neutral-950/95 border-b border-white/10 px-4 py-3 flex items-center justify-between text-white select-none">
          {/* Left: Title & Mode Switcher */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-xs font-bold tracking-wide uppercase text-amber-300">
                {template.toUpperCase()} LOOKBOOK
              </span>
            </div>
            <div className="h-4 w-px bg-white/20 hidden sm:block" />
            <div className="hidden sm:flex items-center gap-1 bg-white/10 p-1 rounded-lg text-[11px]">
              <button
                onClick={() => setViewFormat('single')}
                className={`px-2.5 py-1 rounded-md font-semibold transition ${
                  viewFormat === 'single' ? 'bg-amber-500 text-neutral-950 shadow' : 'text-neutral-300 hover:text-white'
                }`}
              >
                Sayfa Sayfa (Flipbook)
              </button>
              <button
                onClick={() => setViewFormat('all')}
                className={`px-2.5 py-1 rounded-md font-semibold transition ${
                  viewFormat === 'all' ? 'bg-amber-500 text-neutral-950 shadow' : 'text-neutral-300 hover:text-white'
                }`}
              >
                Tüm Sayfalar
              </button>
            </div>
          </div>

          {/* Center: Page Navigation (When in single page mode) */}
          {viewFormat === 'single' && (
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 0}
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10 transition text-neutral-200"
                title="Önceki Sayfa (Sol Ok)"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="px-3 py-1 rounded-lg bg-white/10 text-xs font-mono font-bold">
                <span className="text-amber-400">{currentPage + 1}</span>
                <span className="text-neutral-400"> / {totalPages}</span>
              </div>

              <button
                disabled={currentPage >= totalPages - 1}
                onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10 transition text-neutral-200"
                title="Sonraki Sayfa (Sağ Ok)"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* Right: Zoom, Fullscreen & Print */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold flex items-center gap-1.5 shadow transition"
              title="Yazdır / PDF Olarak Kaydet"
            >
              <Printer size={14} />
              <span className="hidden md:inline">Yazdır / PDF</span>
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

      {/* -------------------- MAIN DISPLAY AREA -------------------- */}
      <div className="p-2 sm:p-8 flex items-center justify-center min-h-[400px]">
        <div
          className="w-full flex flex-col items-center justify-center transition-transform duration-200"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
        >
          {renderTemplateComponent()}
        </div>
      </div>

      {/* -------------------- BOTTOM THUMBNAIL FILMSTRIP -------------------- */}
      {mode !== 'print' && viewFormat === 'single' && (
        <div className="no-print bg-neutral-950/90 border-t border-white/10 p-3 flex items-center justify-center gap-2 overflow-x-auto">
          {Array.from({ length: totalPages }).map((_, idx) => {
            const isCover = idx === 0 && catalog.showCover;
            const isTOC = idx === 1 && catalog.showCover && catalog.showTOC;
            const isBack = idx === totalPages - 1 && catalog.showContactPage;
            const isSelected = currentPage === idx;

            return (
              <button
                key={idx}
                onClick={() => setCurrentPage(idx)}
                className={`relative px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-amber-500 text-neutral-950 shadow-md ring-2 ring-amber-400/50'
                    : 'bg-white/10 text-neutral-400 hover:bg-white/20 hover:text-white'
                }`}
              >
                <span>#{idx + 1}</span>
                <span className="text-[10px] font-sans font-normal opacity-80 hidden md:inline">
                  {isCover ? 'Kapak' : isTOC ? 'Fihrist' : isBack ? 'İletişim' : 'Ürün'}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
