'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  QrCode,
  ExternalLink,
  ShieldCheck,
  Layers,
  Ruler,
  Maximize2,
  Award,
  Compass,
  CheckCircle2,
  Eye,
  Sliders
} from 'lucide-react';

export default function MilanoLookbookTemplate({
  catalog,
  products = [],
  mode = 'preview',
  activePageIndex = 0,
  viewFormat = 'single'
}) {
  const brand = catalog.brand || {};
  const logo = catalog.customLogoUrl || brand.logoUrl;
  const primaryColor = catalog.primaryColor || '#b4823c';
  const isLandscape = catalog.orientation === 'landscape';

  const [imgErrors, setImgErrors] = useState({});

  const handleImgError = (id) => {
    setImgErrors((prev) => ({ ...prev, [id]: true }));
  };

  // Compile all pages array
  const pages = [];

  // Page 1: Cover
  if (catalog.showCover) {
    pages.push({ type: 'cover' });
  }

  // Page 2: Table of Contents
  if (catalog.showTOC && products.length > 1) {
    pages.push({ type: 'toc' });
  }

  // Product Pages
  products.forEach((p, idx) => {
    pages.push({ type: 'product', product: p, index: idx });
  });

  // Back Cover Page
  if (catalog.showContactPage) {
    pages.push({ type: 'contact' });
  }

  const renderSinglePage = (pageObj, pageIndex) => {
    if (!pageObj) return null;

    // =========================================================================
    // 1. COVER PAGE — LUXURY OBSIDIAN & GOLD CERSAIE EDITORIAL
    // =========================================================================
    if (pageObj.type === 'cover') {
      const coverHero =
        products[0]?.imageUrl ||
        products[0]?.textureUrl ||
        '/renders/luxury_bathroom_calacatta_gold.jpg';

      return (
        <section
          key="cover"
          className="catalog-page relative text-white overflow-hidden p-8 sm:p-14 flex flex-col justify-between"
          style={{
            background: `radial-gradient(circle at 80% 20%, rgba(180, 130, 60, 0.28) 0%, transparent 60%), linear-gradient(145deg, rgba(8, 12, 20, 0.94) 0%, rgba(15, 23, 42, 0.88) 50%, rgba(26, 21, 14, 0.94) 100%), url(${coverHero}) center/cover no-repeat`,
            backgroundColor: '#080c14'
          }}
        >
          {/* Subtle architectural framing & crosshairs */}
          <div className="absolute inset-5 sm:inset-7 border border-amber-500/20 pointer-events-none rounded-xl" />
          <div className="absolute inset-7 sm:inset-9 border border-white/10 pointer-events-none rounded-lg" />
          
          <div className="absolute top-8 left-8 text-amber-400/40 font-mono text-[11px] select-none pointer-events-none">
            + 45° 28' N / 09° 11' E &bull; MILANO
          </div>
          <div className="absolute top-8 right-8 text-[10px] font-mono tracking-[0.35em] text-amber-300/90 uppercase select-none">
            CERSAIE BOLOGNA &bull; {new Date().getFullYear()}
          </div>
          <div className="absolute bottom-8 left-8 text-[10px] font-mono tracking-[0.25em] text-white/30 uppercase select-none">
            ARCHITETTURA CERAMICA ITALIANA
          </div>

          {/* Top Brand Header */}
          <div className="relative z-10 pt-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {logo && !imgErrors['logo-cover'] ? (
                <img
                  src={logo}
                  alt={brand.name || 'Brand'}
                  onError={() => handleImgError('logo-cover')}
                  className="h-11 max-w-[180px] object-contain filter brightness-0 invert drop-shadow-md"
                />
              ) : (
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-neutral-950 font-serif font-black text-xl flex items-center justify-center shadow-lg shadow-amber-500/20 ring-1 ring-white/30">
                    {(brand.name || 'S').charAt(0)}
                  </div>
                  <div>
                    <span className="text-xl sm:text-2xl font-serif font-bold tracking-[0.2em] text-white uppercase drop-shadow">
                      {brand.name || 'SERAMİK'}
                    </span>
                    <span className="block text-[9px] font-mono tracking-[0.3em] text-amber-300 uppercase">
                      CERAMIC TILES STUDIO
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-amber-500/30 text-[10px] font-mono tracking-widest uppercase text-amber-300 shadow-md">
              <Award size={13} className="text-amber-400" />
              <span>COLLEZIONE ARCHITETTONICA</span>
            </div>
          </div>

          {/* Center Title Block */}
          <div className="relative z-10 my-auto py-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-300 text-xs font-semibold tracking-widest uppercase mb-6 shadow-sm backdrop-blur-sm">
              <Sparkles size={13} className="text-amber-400" />
              <span>İtalyan Porselen & Yüzey Koleksiyonu</span>
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-light text-white tracking-tight leading-[1.08] mb-5 drop-shadow-md">
              {catalog.coverTitle || catalog.title}
            </h1>

            {catalog.coverSubtitle && (
              <p className="text-lg sm:text-2xl text-neutral-200 font-light leading-relaxed mb-6 font-sans">
                {catalog.coverSubtitle}
              </p>
            )}

            {catalog.introText && (
              <div className="relative max-w-xl p-4 sm:p-5 rounded-xl bg-black/40 backdrop-blur-md border border-white/15 text-xs sm:text-sm text-neutral-200 font-light leading-relaxed">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-amber-400 to-amber-600 rounded-l-xl" />
                <p className="pl-2">{catalog.introText}</p>
              </div>
            )}
          </div>

          {/* Bottom Footer Info & Seal */}
          <div className="relative z-10 pt-6 border-t border-white/20 flex flex-wrap items-end justify-between gap-4 text-xs text-neutral-300">
            <div>
              <p className="font-bold text-white tracking-wider text-sm">{brand.name}</p>
              <p className="text-amber-300/80 text-[11px] font-mono tracking-wide">
                {catalog.websiteUrl || 'www.seramikbak.com'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] text-amber-400 font-mono tracking-[0.2em] uppercase block font-semibold">
                  EDIZIONE LIMITATA {new Date().getFullYear()}
                </span>
                <span className="text-neutral-400 text-[11px]">SeramikBak Catalog Studio</span>
              </div>
              <div className="w-10 h-10 rounded-full border border-amber-400/40 flex items-center justify-center text-[10px] font-mono font-bold text-amber-300 bg-amber-500/10">
                A+
              </div>
            </div>
          </div>
        </section>
      );
    }

    // =========================================================================
    // 2. TABLE OF CONTENTS — EDITORIAL VISUAL GALLERY INDEX
    // =========================================================================
    if (pageObj.type === 'toc') {
      return (
        <section
          key="toc"
          className="catalog-page relative p-8 sm:p-12 text-neutral-900 flex flex-col justify-between overflow-hidden"
          style={{
            background:
              'radial-gradient(circle at 10% 10%, rgba(212, 175, 55, 0.04) 0%, transparent 40%), radial-gradient(circle at 90% 90%, rgba(180, 130, 60, 0.05) 0%, transparent 40%), #faf8f5'
          }}
        >
          {/* Architectural Framing Hairlines */}
          <div className="absolute inset-5 sm:inset-7 border border-amber-900/10 pointer-events-none rounded-xl" />
          <div className="absolute top-7 left-7 text-amber-800/40 font-mono text-[9px]">+ REF INDEX</div>
          <div className="absolute top-7 right-7 text-amber-800/40 font-mono text-[9px]">TS EN 14411 +</div>

          {/* Top Header */}
          <div className="relative z-10">
            <div className="flex items-end justify-between border-b-2 border-neutral-900 pb-4 mb-6">
              <div>
                <span className="text-[11px] font-mono font-bold text-amber-700 tracking-[0.25em] uppercase block">
                  SOMMARIO &bull; KOLEKSİYON DİZİNİ
                </span>
                <h2 className="text-2xl sm:text-4xl font-serif font-light text-neutral-950 tracking-tight mt-1">
                  İçindekiler & Koleksiyon Fihristi
                </h2>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-neutral-800 uppercase tracking-widest block font-serif">
                  {brand.name}
                </span>
                <span className="text-[10px] font-mono text-neutral-400">
                  TOPLAM {products.length} SERİ
                </span>
              </div>
            </div>

            {/* Visual Gallery Grid (Editorial Presentation) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 max-h-[680px] overflow-hidden">
              {products.map((p, idx) => {
                const pThumb =
                  p.imageUrl || p.textureUrl || '/renders/luxury_bathroom_calacatta_gold.jpg';
                const pPageNum = (idx + (catalog.showCover ? 2 : 1) + 1).toString().padStart(2, '0');

                return (
                  <div
                    key={p.id || idx}
                    className="flex items-center gap-3.5 p-2.5 sm:p-3 rounded-xl bg-white/80 backdrop-blur-sm border border-neutral-200/90 shadow-xs hover:border-amber-400 transition group"
                  >
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0 border border-neutral-200 shadow-xs">
                      <img
                        src={pThumb}
                        alt={p.name}
                        onError={() => handleImgError(`toc-${p.id}`)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-amber-700">
                          #{ (idx + 1).toString().padStart(2, '0') }
                        </span>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                          P. {pPageNum}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-neutral-900 truncate mt-0.5 group-hover:text-amber-800 transition">
                        {p.name}
                      </p>
                      <p className="text-[10px] text-neutral-500 font-mono truncate">
                        {p.width && p.height ? `${p.width}×${p.height} cm` : 'Standart Ebat'} &bull;{' '}
                        {p.finish || 'Mat'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Running Footer */}
          <div className="relative z-10 border-t border-neutral-300 pt-3 flex justify-between items-center text-[11px] text-neutral-500 font-medium font-mono">
            <span>
              {brand.name} &bull; {catalog.title}
            </span>
            {catalog.showPageNumbers && <span>P. 02</span>}
          </div>
        </section>
      );
    }

    // =========================================================================
    // 3. PRODUCT PAGE — HIGH-FASHION EDITORIAL ARCHITECTURAL SPREAD
    // =========================================================================
    if (pageObj.type === 'product') {
      const p = pageObj.product;
      const index = pageObj.index;
      const pImage = p.imageUrl || p.textureUrl || '/renders/luxury_bathroom_calacatta_gold.jpg';
      const dimensions = p.width && p.height ? `${p.width} × ${p.height} cm` : null;
      const pageNum = pageIndex + 1;

      // Curated Harmonious Color Chips based on tile style
      const paletteColors = [
        { name: 'Warm Alabaster', hex: '#f7f4ed' },
        { name: 'Greige Natural', hex: '#dfd7cc' },
        { name: 'Raw Travertine', hex: '#b5a593' },
        { name: 'Deep Basalt', hex: '#2b2a29' }
      ];

      return (
        <section
          key={p.id || index}
          className="catalog-page relative p-6 sm:p-10 text-neutral-900 flex flex-col justify-between overflow-hidden"
          style={{
            background:
              'radial-gradient(circle at 15% 15%, rgba(212, 175, 55, 0.05) 0%, transparent 45%), radial-gradient(circle at 85% 85%, rgba(180, 130, 60, 0.05) 0%, transparent 45%), #faf8f5'
          }}
        >
          {/* Architectural Framing & Watermark Accent */}
          <div className="absolute inset-4 sm:inset-6 border border-amber-900/12 pointer-events-none rounded-2xl" />
          <div className="absolute inset-5 sm:inset-7 border border-amber-900/6 pointer-events-none rounded-xl" />
          <div className="absolute top-6 left-6 text-amber-800/40 font-mono text-[9px] select-none">+ 0,0 REF</div>
          <div className="absolute top-6 right-6 text-amber-800/40 font-mono text-[9px] select-none">MILANO SPEC +</div>

          {/* Faint Italian Watermark */}
          <div className="absolute bottom-16 right-8 text-neutral-900/[0.03] font-serif font-black text-6xl tracking-widest uppercase pointer-events-none select-none">
            ARCHITETTURA
          </div>

          {/* -------------------- 1. TOP RUNNING HEADER -------------------- */}
          <div className="relative z-10 flex items-center justify-between border-b border-neutral-300 pb-3 mb-3">
            <div className="flex items-center gap-3">
              <span className="font-serif font-bold text-sm tracking-widest uppercase text-neutral-950">
                {brand.name}
              </span>
              <span className="text-neutral-300">&bull;</span>
              <span className="text-[11px] font-mono uppercase text-amber-800 tracking-wider">
                COLLEZIONE ARCHITETTONICA
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-neutral-400 uppercase hidden sm:inline">
                TS EN 14411 BIA
              </span>
              <div className="text-xs font-mono font-bold text-amber-900 bg-amber-500/15 px-3 py-1 rounded-full border border-amber-400/50 shadow-xs">
                POZ #{ (index + 1).toString().padStart(2, '0') }
              </div>
            </div>
          </div>

          {/* -------------------- 2. MAIN BODY (UPPER STAGING + LOWER SPECS) -------------------- */}
          <div className="relative z-10 flex-1 flex flex-col justify-between gap-4 my-auto">
            
            {/* UPPER STAGING: DRAMATIC HERO PRESENTATION & MOODBOARD */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
              {/* Left/Dominant: High-End Hero Ceramic Visual */}
              <div className="md:col-span-8 flex flex-col">
                <div className="relative w-full aspect-[16/11] rounded-2xl overflow-hidden bg-neutral-200/60 shadow-xl border border-neutral-300/80 group">
                  <img
                    src={pImage}
                    alt={p.name}
                    onError={() => handleImgError(`prod-${p.id}`)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />

                  {/* Top Floating Luxury Glass Badge */}
                  {dimensions && (
                    <div className="absolute top-3 left-3 bg-neutral-950/85 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-xs font-mono font-semibold shadow-lg border border-white/20 flex items-center gap-1.5">
                      <Ruler size={13} className="text-amber-400" />
                      <span>{dimensions}</span>
                    </div>
                  )}

                  {/* Surface Finish Floating Badge */}
                  <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md text-neutral-900 px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg border border-neutral-200 flex items-center gap-1.5">
                    <Sparkles size={13} className="text-amber-600" />
                    <span>Yüzey: {p.finish || 'Mat Lappato'}</span>
                  </div>

                  {/* Rectified Laser Cut Badge */}
                  <div className="absolute top-3 right-3 bg-amber-500/90 backdrop-blur-md text-neutral-950 px-2.5 py-1 rounded-md text-[10px] font-mono font-extrabold uppercase shadow">
                    {p.rectified !== false ? 'Rektifiye 0-Derz' : 'Standart Kenar'}
                  </div>
                </div>
              </div>

              {/* Right Side: 1:1 Surface Tactility & Coordinated Moodboard */}
              <div className="md:col-span-4 flex flex-col justify-between gap-3">
                {/* 1:1 Macro Texture Loupe Swatch */}
                <div className="p-3 rounded-2xl bg-white border border-neutral-200/90 shadow-md">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-11 h-11 rounded-xl overflow-hidden border border-amber-300 shadow-sm flex-shrink-0">
                      <img
                        src={p.textureUrl || pImage}
                        alt="Macro Texture"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-neutral-900 leading-tight">
                        1:1 Yüzey Dokusu
                      </p>
                      <p className="text-[10px] text-amber-700 font-mono">
                        Doğal Rölyef & Işık
                      </p>
                    </div>
                  </div>
                  <p className="text-[10px] text-neutral-500 leading-relaxed">
                    İtalyan sırlama teknolojisi ve mikron hassasiyetli taş kabartması.
                  </p>
                </div>

                {/* Coordinated Color Harmony Chips */}
                <div className="p-3 rounded-2xl bg-white border border-neutral-200/90 shadow-md">
                  <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500 mb-2">
                    Kombinasyon Renk Paleti
                  </p>
                  <div className="flex items-center justify-between gap-1.5">
                    {paletteColors.map((col, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-1 flex-1">
                        <div
                          className="w-7 h-7 rounded-full border border-neutral-300 shadow-xs"
                          style={{ backgroundColor: col.hex }}
                          title={col.name}
                        />
                        <span className="text-[8px] font-mono text-neutral-400 text-center truncate max-w-[48px]">
                          {col.name.split(' ')[0]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Application Area Badges */}
                <div className="p-2.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 shadow-xs">
                  <p className="text-[9px] font-mono font-bold uppercase text-amber-900 mb-1.5">
                    Tavsiye Edilen Mekânlar
                  </p>
                  <div className="flex flex-wrap gap-1">
                    <span className="text-[9px] px-2 py-0.5 rounded bg-white text-neutral-800 font-semibold border border-amber-200 shadow-xs">
                      🏛️ Lüks Konut & Salon
                    </span>
                    <span className="text-[9px] px-2 py-0.5 rounded bg-white text-neutral-800 font-semibold border border-amber-200 shadow-xs">
                      🚿 Banyo & Islak Zemin
                    </span>
                    <span className="text-[9px] px-2 py-0.5 rounded bg-white text-neutral-800 font-semibold border border-amber-200 shadow-xs">
                      🏢 Prestijli Ticari Proje
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* LOWER SECTION: EDITORIAL DETAILS, SPECS MATRIX & 3D AR VIP CARD */}
            <div className="space-y-3">
              {/* Product Header & Narrative */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded uppercase">
                    {p.code ? `KOD: ${p.code}` : `REF: SB-${index + 101}`}
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400 uppercase">
                    Gres Porcellanato Rettificato
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-light text-neutral-950 tracking-tight leading-tight">
                  {p.name}
                </h2>

                {(p.customNote || p.description) && catalog.showDescriptions && (
                  <p className="text-xs text-neutral-600 font-light leading-relaxed mt-1 line-clamp-2 max-w-3xl">
                    {p.customNote || p.description}
                  </p>
                )}
              </div>

              {/* Technical Specifications Matrix (4-Column Luxury Cards) */}
              {catalog.showSpecs && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-2.5 rounded-xl bg-white border border-neutral-200 shadow-xs">
                    <p className="text-[9px] font-mono text-neutral-400 uppercase">Anma Ebatı</p>
                    <p className="text-xs font-bold text-neutral-900 mt-0.5">
                      {dimensions || 'Standart'}
                    </p>
                    <p className="text-[9px] text-amber-700 font-mono">
                      Kalınlık: {p.thickness || '9.5'} mm
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-neutral-200 shadow-xs">
                    <p className="text-[9px] font-mono text-neutral-400 uppercase">Yüzey Bitişi</p>
                    <p className="text-xs font-bold text-neutral-900 mt-0.5">
                      {p.finish || 'Mat Lappato'}
                    </p>
                    <p className="text-[9px] text-amber-700 font-mono">
                      {p.rectified !== false ? 'Lazer Kesim' : 'Standart'}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-neutral-200 shadow-xs">
                    <p className="text-[9px] font-mono text-neutral-400 uppercase">Dayanım Sınıfı</p>
                    <p className="text-xs font-bold text-neutral-900 mt-0.5">
                      PEI {p.peiRating || 'IV'} &bull; {p.slipResistance || 'R10'}
                    </p>
                    <p className="text-[9px] text-amber-700 font-mono">Yüksek Yaya Trafiği</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-neutral-200 shadow-xs">
                    <p className="text-[9px] font-mono text-neutral-400 uppercase">Norm Uygunluğu</p>
                    <p className="text-xs font-bold text-neutral-900 mt-0.5">
                      TS EN 14411
                    </p>
                    <p className="text-[9px] text-amber-700 font-mono">Grup BIA (E ≤ 0.1%)</p>
                  </div>
                </div>
              )}

              {/* Bottom Dual Bar: Price & 3D AR Simulator Card */}
              <div className="flex flex-col sm:flex-row items-stretch gap-3">
                {/* Price Card if enabled */}
                {catalog.showPrices && p.trendyolPrice && (
                  <div className="p-3 rounded-2xl bg-amber-50 border border-amber-300 flex flex-col justify-center min-w-[170px] shadow-sm">
                    <span className="text-[10px] font-mono text-amber-900 uppercase font-semibold">
                      Tavsiye Liste Fiyatı
                    </span>
                    <span className="text-xl font-serif font-bold text-amber-950 mt-0.5">
                      {p.trendyolPrice} ₺ <span className="text-xs font-sans font-normal text-amber-800">/ m²</span>
                    </span>
                    <span className="text-[9px] text-amber-700">KDV Dahil &bull; Palet Bazlı</span>
                  </div>
                )}

                {/* 3D Visualizer & AR Simulator VIP Card */}
                {catalog.showQrCodes && (
                  <div className="flex-1 p-3 rounded-2xl bg-gradient-to-r from-neutral-950 via-stone-900 to-amber-950 text-white border border-amber-400/40 shadow-lg flex items-center gap-3.5">
                    {p.qrCodeUrl ? (
                      <img
                        src={p.qrCodeUrl}
                        alt="QR Code"
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-white p-1 border-2 border-amber-400 shadow-md flex-shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-white p-2 border-2 border-amber-400 flex items-center justify-center flex-shrink-0 text-neutral-950">
                        <QrCode size={36} />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-xs font-bold tracking-wider uppercase text-amber-300">
                          Mekânında Gör & 3D AR Stüdyo
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-300 leading-tight mt-0.5">
                        Telefon kameranızı okutun; bu seramiği kendi banyonuzda veya salonunuzda 3 boyutlu canlı deneyimleyin.
                      </p>
                      <a
                        href={p.tryInRoomUrl || p.productUrl || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition mt-1"
                      >
                        <span>3D Simülatörde Canlı Aç</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* -------------------- 3. RUNNING FOOTER -------------------- */}
          <div className="relative z-10 border-t border-neutral-300 pt-3 flex justify-between items-center text-[11px] text-neutral-500 font-medium font-mono">
            <span>
              {brand.name} &bull; {p.name}
            </span>
            <span className="text-[10px] text-neutral-400 uppercase hidden sm:inline">
              ISO 13006 &bull; BIA &bull; PORCELAIN STONEWARE
            </span>
            {catalog.showPageNumbers && <span>P. {pageNum.toString().padStart(2, '0')}</span>}
          </div>
        </section>
      );
    }

    // =========================================================================
    // 4. CONTACT & BACK COVER — ARCHITECTURAL DIRECTORY & SEAL
    // =========================================================================
    if (pageObj.type === 'contact') {
      return (
        <section
          key="contact"
          className="catalog-page relative p-8 sm:p-14 text-white flex flex-col justify-between overflow-hidden"
          style={{
            background:
              'radial-gradient(circle at 80% 20%, rgba(180, 130, 60, 0.22) 0%, transparent 60%), linear-gradient(145deg, #090d16 0%, #151d2f 50%, #1c150c 100%)',
            backgroundColor: '#090d16'
          }}
        >
          {/* Architectural Framing */}
          <div className="absolute inset-5 sm:inset-7 border border-amber-500/20 pointer-events-none rounded-xl" />
          <div className="absolute top-7 left-7 text-amber-400/40 font-mono text-[9px]">SERVIZIO ARCHITETTI</div>
          <div className="absolute top-7 right-7 text-amber-400/40 font-mono text-[9px]">SHOWROOM NETWORK</div>

          <div className="relative z-10 flex items-center justify-between border-b border-white/20 pb-5">
            <span className="text-xl sm:text-2xl font-serif font-bold tracking-[0.2em] uppercase text-white">
              {brand.name}
            </span>
            <span className="text-xs uppercase tracking-widest text-amber-300 font-mono">
              MİMARİ & B2B İLETİŞİM
            </span>
          </div>

          <div className="relative z-10 my-auto py-8 max-w-2xl">
            <span className="text-xs font-mono font-bold tracking-widest uppercase text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-400/30 inline-block mb-4">
              PROJE & ŞARTNAME DESTEK HATTI
            </span>

            <h3 className="text-3xl sm:text-5xl font-serif font-light text-white mb-4 leading-tight">
              Mimari & B2B Çözüm Ortaklığı
            </h3>

            <p className="text-sm text-neutral-300 leading-relaxed mb-6 font-light max-w-xl">
              Fiziksel numune talepleri, CAD / BIM kütüphanesi ve toplu kurumsal proje teklifleri için mimari koordinasyon ekibimiz hizmetinizdedir.
            </p>

            <div className="space-y-3.5 text-xs sm:text-sm text-neutral-200 bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-md">
              {catalog.contactAddress && (
                <div className="flex gap-4">
                  <span className="w-24 text-amber-300 font-mono uppercase text-xs">Genel Merkez:</span>
                  <span>{catalog.contactAddress}</span>
                </div>
              )}
              {catalog.contactPhone && (
                <div className="flex gap-4">
                  <span className="w-24 text-amber-300 font-mono uppercase text-xs">Telefon:</span>
                  <a href={`tel:${catalog.contactPhone}`} className="text-white hover:text-amber-300 font-bold transition">
                    {catalog.contactPhone}
                  </a>
                </div>
              )}
              {catalog.contactEmail && (
                <div className="flex gap-4">
                  <span className="w-24 text-amber-300 font-mono uppercase text-xs">E-Posta:</span>
                  <a href={`mailto:${catalog.contactEmail}`} className="text-white hover:text-amber-300 font-bold transition">
                    {catalog.contactEmail}
                  </a>
                </div>
              )}
              {catalog.websiteUrl && (
                <div className="flex gap-4">
                  <span className="w-24 text-amber-300 font-mono uppercase text-xs">Web Sitesi:</span>
                  <a
                    href={catalog.websiteUrl.startsWith('http') ? catalog.websiteUrl : `https://${catalog.websiteUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-300 hover:underline font-bold"
                  >
                    {catalog.websiteUrl}
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="relative z-10 border-t border-white/20 pt-5 flex justify-between items-center text-xs text-neutral-400 font-mono">
            <span>&copy; {new Date().getFullYear()} {brand.name}. Tüm hakları saklıdır.</span>
            <span className="text-amber-400/80">SeramikBak Digital Lookbook Studio</span>
          </div>
        </section>
      );
    }

    return null;
  };

  if (viewFormat === 'single') {
    return (
      <div className="w-full flex justify-center">
        {renderSinglePage(pages[activePageIndex] || pages[0], activePageIndex)}
      </div>
    );
  }

  // View format: all (continuous scroll)
  return (
    <div className="w-full flex flex-col gap-10 items-center">
      {pages.map((p, idx) => renderSinglePage(p, idx))}
    </div>
  );
}
