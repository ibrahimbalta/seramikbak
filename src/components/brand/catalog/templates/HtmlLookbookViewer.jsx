'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ExternalLink,
  Search,
  Maximize2,
  X,
  Layers,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Package,
  Tag,
  Phone,
  Mail,
  MapPin,
  Globe,
  Sliders,
  QrCode,
  ZoomIn,
  ArrowDown
} from 'lucide-react';
import { normalizeCatalogForLookbook } from '@/lib/catalogAdapter';

export default function HtmlLookbookViewer({
  catalog,
  products = [],
  mode = 'preview', // 'preview' | 'print'
  onOpenLeadModal
}) {
  const normalized = useMemo(() => {
    return normalizeCatalogForLookbook(catalog, products);
  }, [catalog, products]);

  // Active filter for product grid
  const [activeFinishFilter, setActiveFinishFilter] = useState('ALL');
  const [searchFilter, setSearchFilter] = useState('');

  // Texture Zoom Lightbox Modal
  const [zoomedProduct, setZoomedProduct] = useState(null);

  if (!normalized) return null;

  const { theme, brand, blocks } = normalized;
  const palette = theme.palette;

  // Extract unique surface finishes
  const uniqueFinishes = useMemo(() => {
    const set = new Set();
    normalized.products.forEach((p) => {
      if (p.finish) set.add(p.finish);
    });
    return Array.from(set);
  }, [normalized.products]);

  // Filtered products for grid
  const filteredProducts = useMemo(() => {
    return normalized.products.filter((p) => {
      const matchesFinish =
        activeFinishFilter === 'ALL' ||
        (p.finish && p.finish.toLowerCase().includes(activeFinishFilter.toLowerCase()));
      const matchesSearch =
        !searchFilter ||
        (p.name && p.name.toLowerCase().includes(searchFilter.toLowerCase())) ||
        (p.sku && p.sku.toLowerCase().includes(searchFilter.toLowerCase())) ||
        (p.color && p.color.toLowerCase().includes(searchFilter.toLowerCase()));
      return matchesFinish && matchesSearch;
    });
  }, [normalized.products, activeFinishFilter, searchFilter]);

  // Trigger B2B quote/sample modal
  const handleTriggerLead = (product, type = 'quote') => {
    if (typeof onOpenLeadModal === 'function') {
      onOpenLeadModal({ product, type });
      return;
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('seramikbak-open-lead-modal', {
          detail: { product, type }
        })
      );
    }
  };

  return (
    <article
      id="seramikbak-lookbook-container"
      className="seramikbak-lookbook-root w-full font-sans antialiased text-slate-100 transition-colors duration-300"
      style={{
        backgroundColor: palette.bg,
        color: palette.text
      }}
    >
      {/* =========================================================================
          PRINT & PAGE BREAK STYLES
      ========================================================================= */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 12mm 10mm;
          }
          body {
            background-color: #ffffff !important;
            color: #0f172a !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .seramikbak-lookbook-root {
            background-color: #ffffff !important;
            color: #0f172a !important;
            max-width: 100% !important;
            padding: 0 !important;
          }
          .lookbook-print-page {
            page-break-after: always !important;
            break-after: page !important;
            break-inside: avoid !important;
            padding: 20px 0 !important;
            min-height: 96vh !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
          }
          .no-print,
          .lookbook-sticky-nav,
          .lookbook-zoom-cta,
          .lookbook-action-buttons {
            display: none !important;
          }
          .lookbook-print-card {
            border: 1px solid #e2e8f0 !important;
            background: #ffffff !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      {/* =========================================================================
          STICKY LOOKBOOK NAV DOCK (Desktop & Tablet)
      ========================================================================= */}
      <nav
        aria-label="Katalog Bölümleri"
        className="lookbook-sticky-nav sticky top-14 z-30 w-full backdrop-blur-md border-b px-4 py-2.5 flex items-center justify-between gap-3 text-xs no-print transition-all"
        style={{
          backgroundColor: 'rgba(12, 14, 18, 0.85)',
          borderColor: palette.border
        }}
      >
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar scroll-smooth">
          <a
            href="#section-cover"
            className="hover:text-amber-400 font-semibold tracking-wider uppercase text-[11px] whitespace-nowrap transition"
          >
            Kapak
          </a>
          <span className="text-white/20">&bull;</span>
          <a
            href="#section-manifesto"
            className="hover:text-amber-400 font-semibold tracking-wider uppercase text-[11px] whitespace-nowrap transition"
          >
            Vizyon & Felsefe
          </a>
          <span className="text-white/20">&bull;</span>
          <a
            href="#section-spreads"
            className="hover:text-amber-400 font-semibold tracking-wider uppercase text-[11px] whitespace-nowrap transition"
          >
            Mekan Vitrini
          </a>
          <span className="text-white/20">&bull;</span>
          <a
            href="#section-grid"
            className="hover:text-amber-400 font-semibold tracking-wider uppercase text-[11px] whitespace-nowrap transition"
          >
            Koleksiyon ({normalized.products.length})
          </a>
          <span className="text-white/20">&bull;</span>
          <a
            href="#section-specs"
            className="hover:text-amber-400 font-semibold tracking-wider uppercase text-[11px] whitespace-nowrap transition"
          >
            Teknik Standartlar
          </a>
          <span className="text-white/20">&bull;</span>
          <a
            href="#section-contact"
            className="hover:text-amber-400 font-semibold tracking-wider uppercase text-[11px] whitespace-nowrap transition"
          >
            İletişim & Colophon
          </a>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => handleTriggerLead(normalized.products[0] || null, 'sample')}
            className="px-3 py-1.5 rounded-full bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 font-bold text-[11px] border border-amber-500/30 flex items-center gap-1.5 transition cursor-pointer"
          >
            <Package size={12} />
            <span>Numune İste</span>
          </button>
        </div>
      </nav>

      {/* =========================================================================
          SECTION 1: HERO CINEMATIC COVER (Lüks Mimari Kapak)
      ========================================================================= */}
      {blocks.find((b) => b.type === 'hero-cover' && b.enabled) && (
        <section
          id="section-cover"
          className="lookbook-print-page relative min-h-[92vh] flex flex-col justify-between p-6 sm:p-12 md:p-16 overflow-hidden border-b"
          style={{ borderColor: palette.border }}
        >
          {/* Background Image with Dark Vignette Overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src={blocks.find((b) => b.type === 'hero-cover').coverImage}
              alt={normalized.coverTitle}
              className="w-full h-full object-cover object-center filter brightness-50 contrast-105 scale-100 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-neutral-950/40" />
            <div className="absolute inset-0 bg-radial-at-c from-transparent via-black/40 to-black/80" />
          </div>

          {/* Top Brand Header */}
          <header className="relative z-10 flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              {brand.logoUrl ? (
                <img
                  src={brand.logoUrl}
                  alt={brand.name}
                  className="h-10 sm:h-12 w-auto object-contain drop-shadow-md brightness-110"
                />
              ) : (
                <h3 className="text-xl sm:text-2xl font-serif font-black tracking-widest uppercase text-white drop-shadow">
                  {brand.name}
                </h3>
              )}
              <p className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-amber-400/90 font-semibold">
                ARCHITECTURAL CERAMIC LOOKBOOK
              </p>
            </div>

            <div className="text-right space-y-1">
              <span className="inline-block px-3 py-1 rounded-full text-[10px] font-mono tracking-widest bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold">
                {blocks.find((b) => b.type === 'hero-cover').season}
              </span>
              <p className="text-[10px] text-white/60 tracking-wider">TS EN 14411 / GRUP BIA</p>
            </div>
          </header>

          {/* Center / Bottom Editorial Title */}
          <div className="relative z-10 max-w-4xl my-auto py-12 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
              <Sparkles size={13} className="text-amber-400" />
              <span>{blocks.find((b) => b.type === 'hero-cover').tagline}</span>
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-extrabold tracking-tight text-white leading-[1.05] drop-shadow-2xl">
              {normalized.coverTitle}
            </h1>

            <p className="text-base sm:text-xl md:text-2xl text-stone-300 font-light max-w-2xl leading-relaxed drop-shadow">
              {normalized.coverSubtitle}
            </p>

            <div className="pt-4 flex flex-wrap items-center gap-4 no-print">
              <a
                href="#section-manifesto"
                className="px-6 py-3.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-extrabold text-xs tracking-wider uppercase flex items-center gap-2 shadow-xl shadow-amber-500/20 transition-all hover:scale-105 cursor-pointer"
              >
                <span>Koleksiyonu Keşfet</span>
                <ArrowDown size={14} />
              </a>

              <button
                type="button"
                onClick={() => handleTriggerLead(normalized.products[0] || null, 'quote')}
                className="px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs tracking-wider uppercase backdrop-blur-md border border-white/20 transition-all cursor-pointer flex items-center gap-2"
              >
                <Tag size={14} className="text-amber-400" />
                <span>Mimari Fiyat Listesi İste</span>
              </button>
            </div>
          </div>

          {/* Bottom Cover Strip */}
          <footer className="relative z-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-white/70 text-xs font-mono">
            <div>
              <span>SERAMİKBAK &bull; DİJİTAL YAYIN PLATFORMU</span>
            </div>
            <div className="flex items-center gap-4">
              <span>{normalized.products.length} MİMARİ ÜRÜN</span>
              <span>&bull;</span>
              <span>PORSELEN & SERAMİK</span>
            </div>
          </footer>
        </section>
      )}

      {/* =========================================================================
          SECTION 2: EDITORIAL MANIFESTO / PHILOSOPHY
      ========================================================================= */}
      {blocks.find((b) => b.type === 'manifesto' && b.enabled) && (
        <section
          id="section-manifesto"
          className="lookbook-print-page max-w-6xl mx-auto px-6 sm:px-12 py-20 md:py-28 space-y-16"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16 items-start">
            <div className="lg:col-span-5 space-y-4">
              <span className="text-amber-400 text-xs font-mono uppercase tracking-widest font-bold flex items-center gap-2">
                <span className="w-8 h-px bg-amber-400/60" />
                <span>TASARIM FELSEFESİ</span>
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-extrabold tracking-tight text-white leading-tight">
                {blocks.find((b) => b.type === 'manifesto').subheading}
              </h2>
            </div>

            <div className="lg:col-span-7 space-y-6">
              <p className="text-lg sm:text-xl text-stone-300 font-light leading-relaxed border-l-2 border-amber-500/50 pl-6">
                &ldquo;{blocks.find((b) => b.type === 'manifesto').quote}&rdquo;
              </p>
              <p className="text-sm sm:text-base text-stone-400 font-normal leading-relaxed">
                {blocks.find((b) => b.type === 'manifesto').text}
              </p>
            </div>
          </div>

          {/* Three Key Architectural Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-white/10">
            {blocks.find((b) => b.type === 'manifesto').highlights.map((h, i) => (
              <div
                key={i}
                className="lookbook-print-card p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2 backdrop-blur-xs"
              >
                <div className="flex items-center gap-2 text-amber-400">
                  <ShieldCheck size={18} />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider">{h.label}</span>
                </div>
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-medium">
                  {h.desc}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* =========================================================================
          SECTION 3: ARCHITECTURAL ROOM SPREADS (Split Hero & Macro Details)
      ========================================================================= */}
      <section id="section-spreads" className="space-y-16 md:space-y-24 py-12">
        {blocks
          .filter((b) => b.type === 'room-spread' && b.enabled)
          .map((spread, idx) => {
            const product = normalized.products.find((p) => p.id === spread.productId) || normalized.products[spread.productIndex] || {};
            const isReversed = spread.align === 'right' || idx % 2 === 1;

            return (
              <div
                key={spread.id || idx}
                className="lookbook-print-page max-w-7xl mx-auto px-4 sm:px-8 md:px-12"
              >
                <div
                  className={`grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center ${
                    isReversed ? 'lg:flex-row-reverse' : ''
                  }`}
                >
                  {/* Left (or Right): Large Architectural Lifestyle Photography */}
                  <div className={`lg:col-span-7 ${isReversed ? 'lg:order-2' : 'lg:order-1'}`}>
                    <div className="group relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-neutral-950 aspect-[4/3] sm:aspect-[16/10]">
                      <img
                        src={spread.roomRender}
                        alt={spread.productName}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                      {/* Floating Room Label */}
                      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-xs font-medium flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        <span>{spread.roomName}</span>
                      </div>

                      {/* 3D Visualizer Trigger Overlay */}
                      {product.slug && (
                        <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 no-print">
                          <Link
                            href={`/mekan-dene?product=${product.slug}`}
                            className="px-4 py-2.5 rounded-2xl bg-amber-500/90 hover:bg-amber-400 text-neutral-950 font-extrabold text-xs flex items-center gap-2 shadow-xl backdrop-blur-sm transition-all hover:scale-105"
                          >
                            <Sparkles size={14} />
                            <span>Mekânda 3D Gör</span>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right (or Left): Architectural Slab Card, Texture Zoom & Specifications */}
                  <div className={`lg:col-span-5 space-y-6 ${isReversed ? 'lg:order-1' : 'lg:order-2'}`}>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold tracking-widest uppercase">
                        <span>SERİ 0{idx + 1}</span>
                        <span>&bull;</span>
                        <span>{spread.finish}</span>
                      </div>
                      <h3 className="text-2xl sm:text-4xl font-serif font-black text-white tracking-tight">
                        {spread.productName}
                      </h3>
                      <p className="text-xs sm:text-sm text-stone-400 leading-relaxed font-light">
                        {spread.caption}
                      </p>
                    </div>

                    {/* Macro Slab Tile Preview with Texture Zoom Trigger */}
                    <div className="relative group rounded-2xl overflow-hidden border border-white/10 bg-neutral-900/60 p-3 shadow-lg">
                      <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-neutral-950">
                        <img
                          src={spread.slabImage}
                          alt={spread.productName}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <button
                          type="button"
                          onClick={() => setZoomedProduct(product)}
                          className="lookbook-zoom-cta absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 text-white font-bold text-xs backdrop-blur-xs transition-opacity cursor-pointer"
                        >
                          <ZoomIn size={16} className="text-amber-400" />
                          <span>Dokuyu 4K Yakınlaştır</span>
                        </button>
                      </div>

                      <div className="pt-3 flex items-center justify-between text-xs text-stone-300">
                        <span className="font-mono">{spread.dimensions} &bull; {spread.thickness}</span>
                        <span className="px-2 py-0.5 rounded bg-white/10 font-mono text-[11px] text-amber-300">
                          {spread.slipResistance} / {spread.peiRating}
                        </span>
                      </div>
                    </div>

                    {/* Quick Specs Pill Row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                      <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/5">
                        <span className="block text-[10px] text-stone-400 uppercase font-mono">Ebat</span>
                        <span className="font-bold text-white">{spread.dimensions}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/5">
                        <span className="block text-[10px] text-stone-400 uppercase font-mono">Yüzey</span>
                        <span className="font-bold text-white">{spread.finish}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/5">
                        <span className="block text-[10px] text-stone-400 uppercase font-mono">Kaymazlık</span>
                        <span className="font-bold text-amber-400">{spread.slipResistance}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/5">
                        <span className="block text-[10px] text-stone-400 uppercase font-mono">Aşınma</span>
                        <span className="font-bold text-amber-400">{spread.peiRating}</span>
                      </div>
                    </div>

                    {/* B2B Action Buttons */}
                    <div className="pt-2 flex flex-wrap items-center gap-3 no-print">
                      <button
                        type="button"
                        onClick={() => handleTriggerLead(product, 'sample')}
                        className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer"
                      >
                        <Package size={14} />
                        <span>Numune Talep Et</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleTriggerLead(product, 'quote')}
                        className="flex-1 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center justify-center gap-2 border border-white/15 transition cursor-pointer"
                      >
                        <Tag size={14} className="text-amber-400" />
                        <span>Teklif İste</span>
                      </button>

                      {product.slug && (
                        <Link
                          href={`/urun/${product.slug}`}
                          className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-stone-300 hover:text-white border border-white/10 transition"
                          title="Ürün Detay Sayfası"
                        >
                          <ExternalLink size={16} />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
      </section>

      {/* =========================================================================
          SECTION 4: COMPLETE COLLECTION GALLERY GRID
      ========================================================================= */}
      {blocks.find((b) => b.type === 'collection-grid' && b.enabled) && (
        <section
          id="section-grid"
          className="lookbook-print-page max-w-7xl mx-auto px-4 sm:px-8 md:px-12 py-16 md:py-24 space-y-10 border-t"
          style={{ borderColor: palette.border }}
        >
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <span className="text-amber-400 text-xs font-mono uppercase tracking-widest font-bold flex items-center gap-2">
                <span className="w-8 h-px bg-amber-400/60" />
                <span>KOLEKSİYON SEÇKİSİ</span>
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black text-white tracking-tight">
                {blocks.find((b) => b.type === 'collection-grid').title}
              </h2>
              <p className="text-xs sm:text-sm text-stone-400">
                {blocks.find((b) => b.type === 'collection-grid').subtitle}
              </p>
            </div>

            {/* Quick Interactive Filters (No-Print) */}
            <div className="flex flex-wrap items-center gap-2 no-print">
              <button
                type="button"
                onClick={() => setActiveFinishFilter('ALL')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                  activeFinishFilter === 'ALL'
                    ? 'bg-amber-500 text-neutral-950'
                    : 'bg-white/5 hover:bg-white/10 text-stone-300'
                }`}
              >
                Tümü ({normalized.products.length})
              </button>

              {uniqueFinishes.map((finish) => (
                <button
                  key={finish}
                  type="button"
                  onClick={() => setActiveFinishFilter(finish)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                    activeFinishFilter === finish
                      ? 'bg-amber-500 text-neutral-950'
                      : 'bg-white/5 hover:bg-white/10 text-stone-300'
                  }`}
                >
                  {finish}
                </button>
              ))}
            </div>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((p, pIdx) => {
              const dimensions =
                p.width && p.height ? `${p.width}x${p.height} cm` : 'Standart Ebat';
              const imageUrl = p.imageUrl || p.textureUrl || '/placeholder.png';

              return (
                <div
                  key={p.id || pIdx}
                  className="lookbook-print-card group rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-amber-500/40 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-lg"
                >
                  {/* Top Image Box */}
                  <div className="relative aspect-square overflow-hidden bg-neutral-950">
                    <img
                      src={imageUrl}
                      alt={p.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Badges Overlay */}
                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
                      {p.finish && (
                        <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-mono text-white font-medium border border-white/10">
                          {p.finish}
                        </span>
                      )}
                      {p.slipResistance && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/80 backdrop-blur-md text-[10px] font-mono text-neutral-950 font-bold">
                          {p.slipResistance}
                        </span>
                      )}
                    </div>

                    {/* Hover Zoom CTA */}
                    <button
                      type="button"
                      onClick={() => setZoomedProduct(p)}
                      className="lookbook-zoom-cta absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 text-white font-bold text-xs backdrop-blur-xs transition-opacity cursor-pointer no-print"
                    >
                      <ZoomIn size={15} className="text-amber-400" />
                      <span>Dokuyu İncele</span>
                    </button>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-amber-400/90 font-mono mb-1">
                        <span>{dimensions}</span>
                        {p.thickness && <span>{p.thickness} mm</span>}
                      </div>

                      <h4 className="text-sm font-bold text-white tracking-tight line-clamp-1 group-hover:text-amber-300 transition-colors">
                        {p.name}
                      </h4>

                      {p.sku && (
                        <p className="text-[10px] text-stone-400 font-mono mt-0.5">
                          KOD: {p.sku}
                        </p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 border-t border-white/5 flex items-center gap-1.5 no-print">
                      <button
                        type="button"
                        onClick={() => handleTriggerLead(p, 'sample')}
                        className="flex-1 py-1.5 px-2 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 font-bold text-[11px] border border-amber-500/30 flex items-center justify-center gap-1 transition cursor-pointer"
                      >
                        <Package size={11} />
                        <span>Numune</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleTriggerLead(p, 'quote')}
                        className="flex-1 py-1.5 px-2 rounded-lg bg-white/10 hover:bg-white/15 text-white font-bold text-[11px] border border-white/10 flex items-center justify-center gap-1 transition cursor-pointer"
                      >
                        <Tag size={11} />
                        <span>Teklif</span>
                      </button>

                      {p.slug && (
                        <Link
                          href={`/mekan-dene?product=${p.slug}`}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-stone-300 hover:text-white border border-white/10 transition"
                          title="3D Mekânda Gör"
                        >
                          <Sparkles size={13} className="text-amber-400" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* =========================================================================
          SECTION 5: TECHNICAL SPECIFICATIONS & PACKAGING MATRIX
      ========================================================================= */}
      {blocks.find((b) => b.type === 'spec-matrix' && b.enabled) && (
        <section
          id="section-specs"
          className="lookbook-print-page max-w-7xl mx-auto px-4 sm:px-8 md:px-12 py-16 md:py-24 space-y-12 border-t"
          style={{ borderColor: palette.border }}
        >
          <div className="space-y-2">
            <span className="text-amber-400 text-xs font-mono uppercase tracking-widest font-bold flex items-center gap-2">
              <ShieldCheck size={14} className="text-amber-400" />
              <span>TEKNİK ŞARTNAME & LABORATUVAR TESTLERİ</span>
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-black text-white tracking-tight">
              {blocks.find((b) => b.type === 'spec-matrix').title}
            </h2>
            <p className="text-xs sm:text-sm text-stone-400 font-mono">
              Standart Kodu: {blocks.find((b) => b.type === 'spec-matrix').standardCode}
            </p>
          </div>

          {/* TS EN 14411 Standards Table */}
          <div className="rounded-2xl border border-white/10 overflow-hidden bg-neutral-950/60 shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/[0.05] border-b border-white/10 text-stone-300 font-mono uppercase text-[11px]">
                  <tr>
                    <th className="py-3 px-4 font-bold">Fiziksel / Kimyasal Parametre</th>
                    <th className="py-3 px-4 font-bold">Test Standardı</th>
                    <th className="py-3 px-4 font-bold">Beyan Değeri / Performans</th>
                    <th className="py-3 px-4 font-bold text-center">Uygunluk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {blocks.find((b) => b.type === 'spec-matrix').specs.map((s, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02] transition">
                      <td className="py-3 px-4 font-semibold text-white">{s.parameter}</td>
                      <td className="py-3 px-4 text-stone-400 font-mono">{s.standard}</td>
                      <td className="py-3 px-4 text-amber-300 font-mono">{s.value}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold font-mono">
                          <CheckCircle2 size={10} />
                          <span>TS EN UYGUN</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Packaging & Logistics Table */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Package size={18} className="text-amber-400" />
              <span>Paketleme, Paletleme & Lojistik Bilgileri</span>
            </h3>

            <div className="rounded-2xl border border-white/10 overflow-hidden bg-neutral-950/60 shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/[0.05] border-b border-white/10 text-stone-300 font-mono uppercase text-[11px]">
                    <tr>
                      <th className="py-3 px-4 font-bold">Ebat / Kalınlık</th>
                      <th className="py-3 px-4 font-bold">Kutu İçi Adet</th>
                      <th className="py-3 px-4 font-bold">Kutu m²</th>
                      <th className="py-3 px-4 font-bold">Kutu Ağırlık</th>
                      <th className="py-3 px-4 font-bold">Palet Kutu</th>
                      <th className="py-3 px-4 font-bold">Palet m²</th>
                      <th className="py-3 px-4 font-bold">Palet Ağırlık</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                    {blocks.find((b) => b.type === 'spec-matrix').packaging.map((pack, idx) => (
                      <tr key={idx} className="hover:bg-white/[0.02] transition">
                        <td className="py-3 px-4 font-bold text-white">{pack.dimension}</td>
                        <td className="py-3 px-4 text-stone-300">{pack.boxPcs}</td>
                        <td className="py-3 px-4 text-stone-300">{pack.boxM2}</td>
                        <td className="py-3 px-4 text-stone-300">{pack.boxKg}</td>
                        <td className="py-3 px-4 text-amber-300 font-bold">{pack.palletBox}</td>
                        <td className="py-3 px-4 text-amber-300 font-bold">{pack.palletM2}</td>
                        <td className="py-3 px-4 text-stone-400">{pack.palletKg}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          SECTION 6: COLOPHON & B2B PROJECT DESK BACKCOVER
      ========================================================================= */}
      {blocks.find((b) => b.type === 'contact-colophon' && b.enabled) && (
        <section
          id="section-contact"
          className="lookbook-print-page max-w-6xl mx-auto px-6 sm:px-12 py-20 md:py-28 space-y-12 border-t"
          style={{ borderColor: palette.border }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Brand Story & Colophon */}
            <div className="lg:col-span-7 space-y-6">
              <span className="text-amber-400 text-xs font-mono uppercase tracking-widest font-bold">
                MİMARİ PROJE & NUMUNE DESTEK
              </span>

              <h2 className="text-3xl sm:text-5xl font-serif font-black text-white tracking-tight">
                {blocks.find((b) => b.type === 'contact-colophon').title}
              </h2>

              <p className="text-stone-300 text-sm sm:text-base font-light leading-relaxed">
                {blocks.find((b) => b.type === 'contact-colophon').subtitle}
              </p>

              <div className="space-y-3 pt-2 text-xs text-stone-300">
                {brand.contactPhone && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                      <Phone size={14} />
                    </div>
                    <span>{brand.contactPhone}</span>
                  </div>
                )}
                {brand.contactEmail && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                      <Mail size={14} />
                    </div>
                    <span>{brand.contactEmail}</span>
                  </div>
                )}
                {brand.contactAddress && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                      <MapPin size={14} />
                    </div>
                    <span>{brand.contactAddress}</span>
                  </div>
                )}
                {brand.websiteUrl && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                      <Globe size={14} />
                    </div>
                    <a
                      href={brand.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-400 hover:underline"
                    >
                      {brand.websiteUrl}
                    </a>
                  </div>
                )}
              </div>

              {/* B2B Call to Actions */}
              <div className="pt-4 flex flex-wrap gap-4 no-print">
                <button
                  type="button"
                  onClick={() => handleTriggerLead(null, 'sample')}
                  className="px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-extrabold text-xs flex items-center gap-2 shadow-xl shadow-amber-500/20 transition cursor-pointer"
                >
                  <Package size={15} />
                  <span>Ücretsiz Mimari Numune Talep Et</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTriggerLead(null, 'quote')}
                  className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center gap-2 border border-white/15 transition cursor-pointer"
                >
                  <Tag size={15} className="text-amber-400" />
                  <span>Proje Teklifi İste</span>
                </button>
              </div>
            </div>

            {/* Right Column: QR Code & Publisher Info */}
            <div className="lg:col-span-5 p-8 rounded-3xl bg-neutral-950/80 border border-white/10 text-center space-y-4 shadow-2xl">
              <div className="p-4 bg-white rounded-2xl inline-block shadow-inner">
                {normalized.products[0]?.qrCodeUrl ? (
                  <img
                    src={normalized.products[0].qrCodeUrl}
                    alt="Katalog QR Kodu"
                    className="w-36 h-36 mx-auto"
                  />
                ) : (
                  <QrCode size={130} className="text-neutral-950 mx-auto" />
                )}
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">Mobil Cihazla Okutun</h4>
                <p className="text-xs text-stone-400">
                  Akıllı telefonunuzla doğrudan etkileşimli dijital kataloğa ve 3D mekan stüdyosuna bağlanın.
                </p>
              </div>

              <div className="pt-3 border-t border-white/10 text-[11px] text-stone-500 font-mono">
                SERAMİKBAK LOOKBOOK ENGINE &bull; 2026
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          INTERACTIVE TEXTURE ZOOM MODAL (4K Macro Inspection)
      ========================================================================= */}
      {zoomedProduct && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 no-print animate-in fade-in duration-200">
          <div className="relative max-w-4xl w-full bg-neutral-950 border border-white/15 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 px-6 border-b border-white/10 bg-neutral-900/50">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                <div>
                  <h3 className="text-sm font-bold text-white">{zoomedProduct.name}</h3>
                  <p className="text-[11px] text-stone-400 font-mono">
                    {zoomedProduct.finish} &bull; {zoomedProduct.width}x{zoomedProduct.height} cm
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setZoomedProduct(null)}
                className="p-2 rounded-full text-stone-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                title="Kapat"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 flex flex-col items-center justify-center bg-black/60">
              <img
                src={zoomedProduct.imageUrl || zoomedProduct.textureUrl}
                alt={zoomedProduct.name}
                className="max-h-[60vh] w-auto object-contain rounded-xl shadow-2xl transition-transform duration-300 hover:scale-125 cursor-zoom-in"
              />
              <p className="text-[11px] text-stone-400 mt-4 font-mono">
                İpucu: Yüzey dokusunu ve damar detaylarını yakından incelemek için görselin üzerine gelin.
              </p>
            </div>

            <div className="p-4 px-6 border-t border-white/10 bg-neutral-900/50 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs font-mono text-stone-300">
                <span>PEI: {zoomedProduct.peiRating || 'IV'}</span>
                <span>&bull;</span>
                <span>KAYMAZLIK: {zoomedProduct.slipResistance || 'R10'}</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    handleTriggerLead(zoomedProduct, 'sample');
                    setZoomedProduct(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Package size={13} />
                  <span>Numune İste</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
