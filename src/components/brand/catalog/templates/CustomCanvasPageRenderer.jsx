'use client';

import React, { useState, useEffect, useRef } from 'react';
import { QrCode, ExternalLink, Sparkles } from 'lucide-react';

/**
 * CustomCanvasPageRenderer
 * Renders custom pages authored in Gelişmiş Studio (Tuval) with 100% fidelity.
 * Fully responsive: automatically scales on mobile, tablet and desktop without overflowing.
 * Read-only & safe for visitors.
 */

function sanitizeUrl(url) {
  if (!url || typeof url !== 'string') return '#';
  const trimmed = url.trim();
  if (trimmed.startsWith('/') || trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
    return trimmed;
  }
  return '#';
}

function getCanvasDimensions(format) {
  if (format === 'landscape') return { width: 842, height: 595 };
  if (format === 'square') return { width: 700, height: 700 };
  return { width: 595, height: 842 }; // portrait
}

function SingleCanvasPage({ page, scale = 1, isPrint = false }) {
  if (!page) return null;
  const { width: pageW, height: pageH } = getCanvasDimensions(page.format);
  const elements = Array.isArray(page.elements) ? page.elements.filter(Boolean) : [];

  return (
    <div
      className={`relative overflow-hidden ${
        isPrint
          ? 'break-after-page page-break-always mb-0 shadow-none'
          : 'shadow-2xl rounded-sm border border-neutral-800/40'
      }`}
      style={{
        width: isPrint ? `${pageW}px` : `${Math.round(pageW * scale)}px`,
        height: isPrint ? `${pageH}px` : `${Math.round(pageH * scale)}px`,
        backgroundColor: page.bgColor || '#ffffff',
        transition: 'width 0.15s ease, height 0.15s ease'
      }}
    >
      <div
        style={{
          width: `${pageW}px`,
          height: `${pageH}px`,
          transform: isPrint ? 'none' : `scale(${scale})`,
          transformOrigin: 'top left',
          backgroundColor: page.bgColor || '#ffffff'
        }}
        className="relative select-none overflow-hidden"
      >
        {elements.map((el) => {
          if (!el || !el.id || el.hidden) return null;

          return (
            <div
              key={el.id}
              style={{
                position: 'absolute',
                left: `${el.x}px`,
                top: `${el.y}px`,
                width: `${el.width}px`,
                height: `${el.height}px`,
                opacity: (el.opacity || 100) / 100,
                pointerEvents: el.type === 'qr' ? 'auto' : 'none'
              }}
            >
              {/* Type: TEXT */}
              {el.type === 'text' && (
                <div
                  style={{
                    fontSize: `${el.fontSize || 14}px`,
                    fontWeight: el.fontWeight || '600',
                    fontFamily: el.fontFamily || 'Inter, sans-serif',
                    color: el.color || '#0f172a',
                    backgroundColor: el.bgColor || 'transparent',
                    textAlign: el.align || 'left',
                    letterSpacing: el.letterSpacing || 'normal',
                    textTransform: el.textTransform || 'none',
                    width: '100%',
                    height: '100%',
                    whiteSpace: 'pre-wrap',
                    lineHeight: el.lineHeight || 1.35
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
                  loading="lazy"
                  style={{
                    objectFit: el.objectFit || 'cover',
                    borderRadius: `${el.borderRadius || 0}px`
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
                    borderRadius: `${el.borderRadius || 0}px`
                  }}
                  className="w-full h-full border"
                />
              )}

              {/* Type: LINE */}
              {el.type === 'line' && (
                <div
                  style={{
                    backgroundColor: el.color || '#b4823c',
                    height: `${el.height || 2}px`
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

  // 1. PRINT MODE: Render all pages sequentially for high-res printing
  if (mode === 'print') {
    return (
      <div className="w-full flex flex-col items-center gap-8 print:gap-0">
        {pages.map((p, idx) => (
          <div key={p.id || idx} className="print:break-after-page print:page-break-always">
            <SingleCanvasPage page={p} scale={1} isPrint={true} />
          </div>
        ))}
      </div>
    );
  }

  // 2. ALL PAGES (GRID) VIEW
  if (viewFormat === 'all') {
    return (
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
    );
  }

  // 3. SPREAD (MAGAZINE) VIEW
  if (viewFormat === 'spread') {
    const leftPageIdx = activePageIndex % 2 === 1 && activePageIndex > 0 ? activePageIndex - 1 : activePageIndex;
    const rightPageIdx = leftPageIdx + 1 < totalPages ? leftPageIdx + 1 : null;
    const leftPage = pages[leftPageIdx];
    const rightPage = rightPageIdx !== null ? pages[rightPageIdx] : null;

    const leftDims = getCanvasDimensions(leftPage?.format);
    const rightDims = rightPage ? getCanvasDimensions(rightPage.format) : { width: 0, height: 0 };
    const totalW = leftDims.width + (rightPage ? rightDims.width : 0);
    const maxScale = Math.min(1, Math.max(0.3, (containerWidth - 48) / totalW));

    return (
      <div ref={containerRef} className="w-full flex justify-center items-center py-4">
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-center gap-3 sm:gap-1">
          {leftPage && <SingleCanvasPage page={leftPage} scale={maxScale} />}
          {rightPage && <SingleCanvasPage page={rightPage} scale={maxScale} />}
        </div>
      </div>
    );
  }

  // 4. SINGLE PAGE VIEW (DEFAULT)
  const safeIdx = Math.max(0, Math.min(totalPages - 1, activePageIndex));
  const currentPage = pages[safeIdx];
  const pageDims = getCanvasDimensions(currentPage?.format);
  const responsiveScale = Math.min(1, Math.max(0.3, (containerWidth - 32) / pageDims.width));

  return (
    <div ref={containerRef} className="w-full flex flex-col items-center justify-center py-2 sm:py-4">
      <SingleCanvasPage page={currentPage} scale={responsiveScale} />
    </div>
  );
}
