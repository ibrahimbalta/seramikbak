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
  const visualizerUrl = `/floor-tile-visualizer/index.html?tile=${encodeURIComponent(textureUrl)}&product=${encodeURIComponent(productName)}&scale=1.0&surface=floor&embed=1`;

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

    // Listen for postMessage from embedded floor-tile-visualizer
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md p-0 md:p-4 animate-in fade-in duration-200">
      <div 
        className={`relative flex flex-col bg-[#0b0f19] border border-white/10 text-white overflow-hidden shadow-2xl transition-all duration-300 ${
          isFullscreen 
            ? 'w-full h-full rounded-none' 
            : 'w-full h-full md:w-[96vw] md:h-[94vh] md:max-w-7xl md:rounded-2xl'
        }`}
      >
        {/* Modal Header */}
        <header className="flex items-center justify-between px-3.5 py-2.5 md:px-5 md:py-3 bg-[#0d1322] border-b border-white/10 shrink-0">
          {/* Left: Product & Status */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              <Sparkles size={16} />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm md:text-base font-bold text-white truncate">
                  {productName}
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                  {tileWidth}×{tileHeight} cm
                </span>
                <span className="hidden sm:inline-flex text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300">
                  {brandName}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5 truncate">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>SegFormer-B3 AI Görselleştirici Aktif</span>
              </p>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
            <a
              href={`/floor-tile-visualizer/index.html?tile=${encodeURIComponent(textureUrl)}&product=${encodeURIComponent(productName)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
              title="Yeni sekmede tam sayfa aç"
            >
              <ExternalLink size={13} />
              <span>Tam Sayfa</span>
            </a>

            <button
              type="button"
              onClick={() => setIsFullscreen(prev => !prev)}
              className="p-1.5 md:p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title={isFullscreen ? 'Pencere Modu' : 'Tam Ekran'}
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 md:p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              title="Kapat (ESC)"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        {/* Modal Body / Iframe Viewport */}
        <div className="relative flex-1 w-full bg-[#06060c] overflow-hidden">
          {!isIframeLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#06060c] z-10 gap-3">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-medium text-slate-400">Yapay Zekâ Stüdyosu Yükleniyor...</p>
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
