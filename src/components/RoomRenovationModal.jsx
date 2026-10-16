'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  X, 
  Maximize2, 
  Minimize2, 
  ExternalLink, 
  CheckCircle2, 
  RefreshCw 
} from 'lucide-react';
import { resolveSafeTextureUrl } from '../utils/renovationUtils';

export default function RoomRenovationModal({ 
  isOpen, 
  onClose, 
  product, 
  onOpenQuote 
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);
  const iframeRef = useRef(null);

  // Safe product details
  const currentProduct = product || {};
  const productName = currentProduct.name || 'Seramik Modeli';
  const brandName = typeof currentProduct.brand === 'string'
    ? currentProduct.brand
    : (currentProduct.brand?.name || 'SeramikBak');
  const tileWidth = Number(currentProduct.width) || 60;
  const tileHeight = Number(currentProduct.height) || 120;

  const rawTexture = currentProduct.textureUrl || currentProduct.imageUrl || '/textures/calacatta_gold.jpg';
  const textureUrl = resolveSafeTextureUrl(rawTexture);

  // Visualizer URL with params (explicit index.html ensures direct static serving without router rewrite issues)
  const visualizerUrl = `/tile-engine/index.html?tile=${encodeURIComponent(textureUrl)}&product=${encodeURIComponent(productName)}&width=${tileWidth}&height=${tileHeight}&scale=1.0&surface=floor&embed=1&v=4.0.0`;

  // Lock body scroll when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Listen for postMessage from embedded visualizer
    const handleMessage = (e) => {
      if (!e.data) return;
      if (e.data.type === 'CLOSE_VISUALIZER') {
        onClose?.();
      }
      if (e.data.type === 'REQUEST_QUOTE') {
        onClose?.();
        onOpenQuote?.(currentProduct);
      }
    };
    window.addEventListener('message', handleMessage);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('message', handleMessage);
    };
  }, [isOpen, onClose, onOpenQuote, currentProduct]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-0 md:p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className={`relative flex flex-col bg-white border border-[#b38e47]/30 text-slate-800 overflow-hidden shadow-2xl transition-all duration-300 ${
          isFullscreen 
            ? 'w-full h-full h-[100dvh] rounded-none' 
            : 'w-full h-full h-[100dvh] md:w-[96vw] md:h-[94vh] md:max-w-7xl md:rounded-2xl'
        }`}
      >
        {/* Modal Header */}
        <header className="flex items-center justify-between px-3 py-2.5 md:px-5 md:py-3.5 bg-white border-b border-slate-200 shrink-0 pt-[max(env(safe-area-inset-top),0.625rem)] shadow-xs">
          {/* Left: Product & Status */}
          <div className="flex items-center gap-2 md:gap-2.5 min-w-0">
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-gradient-to-br from-amber-500/15 to-amber-500/5 border border-[#b38e47]/35 flex items-center justify-center text-[#b38e47] shrink-0 shadow-xs">
              <Sparkles size={16} />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
                <span className="text-xs md:text-base font-extrabold text-slate-900 truncate max-w-[130px] xs:max-w-[170px] sm:max-w-none">
                  {productName}
                </span>
                <span className="text-[10px] md:text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  {tileWidth}×{tileHeight} cm
                </span>
                <span className="hidden sm:inline-flex text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 border border-amber-300 text-amber-800">
                  {brandName}
                </span>
              </div>
              <p className="text-[10px] md:text-[11px] text-slate-500 flex items-center gap-1.5 truncate mt-0.5">
                <span className="inline-block w-2 h-2 rounded-full bg-[#b38e47] animate-pulse"></span>
                <span className="truncate">Yapay Zekâ Mekân Simülasyonu Aktif</span>
              </p>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
            <a
              href={`/tile-engine/index.html?tile=${encodeURIComponent(textureUrl)}&product=${encodeURIComponent(productName)}&width=${tileWidth}&height=${tileHeight}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-[#0f172a] bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-[#b38e47]/40 rounded-xl transition-all shadow-xs"
              title="Yeni sekmede tam sayfa aç"
            >
              <ExternalLink size={13} />
              <span>Tam Sayfa</span>
            </a>

            <button
              type="button"
              onClick={() => setIsFullscreen(prev => !prev)}
              className="p-2 min-w-[38px] min-h-[38px] flex items-center justify-center text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
              title={isFullscreen ? 'Pencere Modu' : 'Tam Ekran'}
              aria-label="Tam Ekran Modu"
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 min-w-[38px] min-h-[38px] flex items-center justify-center text-slate-600 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-xl transition-colors"
              title="Kapat (ESC)"
              aria-label="Kapat"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        {/* Modal Body / Iframe Viewport */}
        <div className="relative flex-1 w-full bg-[#f8fafc] overflow-hidden">
          {!isIframeLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#f8fafc] z-10 gap-3">
              <div className="w-8 h-8 border-2 border-[#b38e47] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-semibold text-slate-600">Yapay Zekâ Stüdyosu Yükleniyor...</p>
            </div>
          )}

          <iframe
            ref={iframeRef}
            src={visualizerUrl}
            title="SeramikBak AI Floor Tile Visualizer"
            className="w-full h-full border-0"
            allow="camera; clipboard-write; fullscreen"
            onLoad={() => setIsIframeLoaded(true)}
          />
        </div>
      </div>
    </div>
  );
}
