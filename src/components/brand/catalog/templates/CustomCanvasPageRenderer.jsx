'use client';

import React, { useState, useEffect, useRef } from 'react';
import { QrCode, Sparkles } from 'lucide-react';

/**
 * CustomCanvasPageRenderer
 * Renders custom pages authored in Gelişmiş Studio (Tuval) with 100% fidelity.
 * - Responsive interactive viewer (Single / Spread / Grid views).
 * - Professional print stage for high-DPI vector/raster PDF export without clipping or blank pages.
 * - Turkish typography, exact background colors & eager image loading.
 */

function sanitizeUrl(url) {
  if (!url || typeof url !== 'string') return '#';
  const trimmed = url.trim();
  if (trimmed.startsWith('/') || trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
    return trimmed;
  }
  return '#';
}

export function getCanvasDimensions(format) {
  if (format === 'landscape') return { width: 842, height: 595 };
  if (format === 'square') return { width: 700, height: 700 };
  return { width: 595, height: 842 }; // portrait (A4 ratio)
}

function SingleCanvasPage({ page, scale = 1, isPrint = false, isLast = false }) {
  if (!page) return null;
  const { width: pageW, height: pageH } = getCanvasDimensions(page.format);
  const elements = Array.isArray(page.elements) ? page.elements.filter(Boolean) : [];

  return (
    <div
      data-testid="canvas-page"
      className={`relative overflow-hidden ${
        isPrint
          ? `catalog-print-page ${!isLast ? 'break-after-page page-break-always' : ''} shadow-none`
          : 'shadow-2xl rounded-sm border border-neutral-800/40'
      }`}
      style={{
        width: isPrint ? `${pageW}px` : `${Math.round(pageW * scale)}px`,
        height: isPrint ? `${pageH}px` : `${Math.round(pageH * scale)}px`,
        backgroundColor: page.bgColor || '#ffffff',
        WebkitPrintColorAdjust: 'exact',
        printColorAdjust: 'exact',
        transition: isPrint ? 'none' : 'width 0.15s ease, height 0.15s ease'
      }}
    >
      <div
        style={{
          width: `${pageW}px`,
          height: `${pageH}px`,
          transform: isPrint ? 'none' : `scale(${scale})`,
          transformOrigin: 'top left',
          backgroundColor: page.bgColor || '#ffffff',
          WebkitPrintColorAdjust: 'exact',
          printColorAdjust: 'exact'
        }}
        className="relative select-none overflow-hidden"
      >
        {elements.map((el) => {
          if (!el || !el.id || el.hidden) return null;

          return (
            <div
              key={el.id}
              data-element-id={el.id}
              style={{
                position: 'absolute',
                left: `${el.x}px`,
                top: `${el.y}px`,
                width: `${el.width}px`,
                height: `${el.height}px`,
                opacity: (el.opacity || 100) / 100,
                transform: el.rotation ? `rotate(${el.rotation}deg)` : 'none',
                transformOrigin: 'center center',
                pointerEvents: el.type === 'qr' && !isPrint ? 'auto' : 'none',
                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact'
              }}
            >
              {/* Type: TEXT */}
              {el.type === 'text' && (
                <div
                  style={{
                    fontSize: `${el.fontSize || 14}px`,
                    fontWeight: el.fontWeight || '600',
                    fontFamily: el.fontFamily || 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    color: el.color || '#0f172a',
                    backgroundColor: el.bgColor || 'transparent',
                    textAlign: el.align || 'left',
                    letterSpacing: el.letterSpacing || 'normal',
                    textTransform: el.textTransform || 'none',
                    width: '100%',
                    height: '100%',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    lineHeight: el.lineHeight || 1.35,
                    WebkitPrintColorAdjust: 'exact',
                    printColorAdjust: 'exact'
                  }}
                  className="p-1 overflow-hidden"
                >
                  {el.content}
                </div>
              )}

              {/* Type: IMAGE */}
              {el.type === 'image' && (
                <img
                  src={el.src || '/placeholder.png'}
                  alt=""
                  draggable={false}
                  loading={isPrint ? 'eager' : 'lazy'}
                  decoding={isPrint ? 'sync' : 'async'}
                  style={{
                    objectFit: el.objectFit || 'cover',
                    borderRadius: `${el.borderRadius || 0}px`,
                    WebkitPrintColorAdjust: 'exact',
                    printColorAdjust: 'exact'
                  }}
                  className="w-full h-full pointer-events-none select-none"
                />
              )}

              {/* Type: BOX */}
              {el.type === 'box' && (
                <div
                  style={{
                    backgroundColor: el.color || '#f8fafc',
                    borderColor: el.borderColor || '#cbd5e1',
                    borderWidth: `${el.borderWidth || 1}px`,
                    borderRadius: `${el.borderRadius || 0}px`,
                    WebkitPrintColorAdjust: 'exact',
                    printColorAdjust: 'exact'
                  }}
                  className="w-full h-full border"
                />
              )}

              {/* Type: LINE */}
              {el.type === 'line' && (
                <div
                  style={{
                    backgroundColor: el.color || '#b4823c',
                    height: `${el.height || 2}px`,
                    WebkitPrintColorAdjust: 'exact',
                    printColorAdjust: 'exact'
                  }}
                  className="w-full"
                />
              )}

              {/* Type: QR CODE */}
              {el.type === 'qr' && (
                <a
                  href={sanitizeUrl(el.qrUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-full p-2 bg-white flex flex-col items-center justify-center border border-neutral-300 hover:border-amber-500 hover:shadow-md transition group/qr"
                  title={el.qrUrl ? `Bağlantıyı Aç: ${el.qrUrl}` : 'QR Kodu'}
                  style={{
                    WebkitPrintColorAdjust: 'exact',
                    printColorAdjust: 'exact'
                  }}
                >
                  <QrCode
                    size={Math.max(16, Math.min(el.width, el.height) - 24)}
                    className="text-neutral-900 group-hover/qr:scale-105 transition"
                  />
                  <span className="text-[7px] font-mono text-neutral-500 mt-0.5 truncate max-w-full group-hover/qr:text-amber-600">
                    {el.qrUrl || 'seramikbak.com'}
                  </span>
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function CustomCanvasPageRenderer({
  catalog,
  activePageIndex = 0,
  viewFormat = 'single', // 'single' | 'spread' | 'all'
  mode = 'preview', // 'preview' | 'print'
  onSelectPage
}) {
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(800);

  const pages = Array.isArray(catalog?.customCanvasPages) ? catalog.customCanvasPages.filter(Boolean) : [];
  const totalPages = pages.length;

  // Determine dominant page format for print @page sizing
  const dominantFormat = pages[0]?.format || catalog?.orientation || 'portrait';
  const pageCssSize =
    dominantFormat === 'landscape'
      ? 'A4 landscape'
      : dominantFormat === 'square'
      ? '210mm 210mm'
      : 'A4 portrait';

  useEffect(() => {
    if (!containerRef.current) return;
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth || 800);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  if (totalPages === 0) {
    return (
      <div className="p-12 text-center text-neutral-400">
        <Sparkles size={28} className="mx-auto mb-2 text-amber-500/60" />
        <p className="text-sm font-semibold">Bu katalog için henüz tuval sayfası oluşturulmamış.</p>
      </div>
    );
  }

  // 1. DEDICATED PRINT MODE
  if (mode === 'print') {
    return (
      <div id="catalog-print-stage" className="w-full flex flex-col items-center">
        {pages.map((p, idx) => (
          <div key={p.id || idx} className="catalog-print-page-wrapper">
            <SingleCanvasPage
              page={p}
              scale={1}
              isPrint={true}
              isLast={idx === totalPages - 1}
            />
          </div>
        ))}
      </div>
    );
  }

  // 2. INTERACTIVE MODES (Single, Spread, All Grid)
  // Always include a hidden `#catalog-print-stage` containing ALL pages so window.print() prints the entire catalog.
  return (
    <>
      {/* Dynamic @page and Print Stylesheet */}
      <style jsx global>{`
        @media print {
          @page {
            size: ${pageCssSize};
            margin: 0 !important;
          }
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .custom-canvas-screen-stage,
          .no-print {
            display: none !important;
          }
          #catalog-print-stage {
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
          }
          .catalog-print-page-wrapper {
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            width: 100% !important;
            height: 100vh !important;
            max-height: 100vh !important;
            margin: 0 !important;
            padding: 0 !important;
            page-break-after: always !important;
            break-after: page !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            overflow: hidden !important;
            box-sizing: border-box !important;
          }
          .catalog-print-page-wrapper:last-child {
            page-break-after: auto !important;
            break-after: auto !important;
          }
          .catalog-print-page {
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            margin: 0 auto !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}</style>

      {/* 2A. INTERACTIVE SCREEN STAGE */}
      <div className="custom-canvas-screen-stage w-full">
        {viewFormat === 'all' && (
          <div ref={containerRef} className="w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
              {pages.map((p, idx) => {
                const isCurrent = idx === activePageIndex;
                const dims = getCanvasDimensions(p.format);
                const thumbScale = Math.min(0.5, (containerWidth / 3 - 32) / dims.width);

                return (
                  <div
                    key={p.id || idx}
                    onClick={() => onSelectPage?.(idx)}
                    className={`flex flex-col items-center p-3 rounded-2xl border transition cursor-pointer group ${
                      isCurrent
                        ? 'bg-neutral-800/80 border-amber-500 ring-2 ring-amber-500/30'
                        : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/60'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-2 px-1 text-xs">
                      <span className="font-mono font-bold text-amber-400">#{idx + 1}</span>
                      <span className="text-neutral-400 text-[11px] truncate max-w-[160px]">
                        {p.title || `Sayfa ${idx + 1}`}
                      </span>
                    </div>

                    <div className="overflow-hidden rounded-lg shadow-md group-hover:shadow-xl transition">
                      <SingleCanvasPage page={p} scale={thumbScale > 0.1 ? thumbScale : 0.4} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {viewFormat === 'spread' && (
          <div ref={containerRef} className="w-full flex justify-center items-center py-4">
            {(() => {
              const leftPageIdx =
                activePageIndex % 2 === 1 && activePageIndex > 0 ? activePageIndex - 1 : activePageIndex;
              const rightPageIdx = leftPageIdx + 1 < totalPages ? leftPageIdx + 1 : null;
              const leftPage = pages[leftPageIdx];
              const rightPage = rightPageIdx !== null ? pages[rightPageIdx] : null;

              const leftDims = getCanvasDimensions(leftPage?.format);
              const rightDims = rightPage ? getCanvasDimensions(rightPage.format) : { width: 0, height: 0 };
              const totalW = leftDims.width + (rightPage ? rightDims.width : 0);
              const maxScale = Math.min(1, Math.max(0.3, (containerWidth - 48) / totalW));

              return (
                <div className="flex flex-wrap sm:flex-nowrap items-center justify-center gap-3 sm:gap-1">
                  {leftPage && <SingleCanvasPage page={leftPage} scale={maxScale} />}
                  {rightPage && <SingleCanvasPage page={rightPage} scale={maxScale} />}
                </div>
              );
            })()}
          </div>
        )}

        {viewFormat === 'single' && (
          <div ref={containerRef} className="w-full flex flex-col items-center justify-center py-2 sm:py-4">
            {(() => {
              const safeIdx = Math.max(0, Math.min(totalPages - 1, activePageIndex));
              const currentPage = pages[safeIdx];
              const pageDims = getCanvasDimensions(currentPage?.format);
              const responsiveScale = Math.min(1, Math.max(0.3, (containerWidth - 32) / pageDims.width));

              return <SingleCanvasPage page={currentPage} scale={responsiveScale} />;
            })()}
          </div>
        )}
      </div>

      {/* 2B. HIDDEN HIGH-RES PRINT STAGE (Rendered for window.print() output) */}
      <div id="catalog-print-stage" className="hidden print:flex">
        {pages.map((p, idx) => (
          <div key={`print-${p.id || idx}`} className="catalog-print-page-wrapper">
            <SingleCanvasPage
              page={p}
              scale={1}
              isPrint={true}
              isLast={idx === totalPages - 1}
            />
          </div>
        ))}
      </div>
    </>
  );
}
