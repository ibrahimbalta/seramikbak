'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ExternalLink,
  X,
  Package,
  Tag,
  Phone,
  Mail,
  MapPin,
  Globe,
  QrCode,
  ZoomIn,
  ArrowDown,
  ShieldCheck,
  Check
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

  // Texture Zoom & Detail Lightbox Modal
  const [activeDetailProduct, setActiveDetailProduct] = useState(null);

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

  const coverBlock = blocks.find((b) => b.type === 'hero-cover');
  const manifestoBlock = blocks.find((b) => b.type === 'manifesto');
  const roomSpreads = blocks.filter((b) => b.type === 'room-spread' && b.enabled);
  const collectionGridBlock = blocks.find((b) => b.type === 'collection-grid');
  const specBlock = blocks.find((b) => b.type === 'spec-matrix');
  const colophonBlock = blocks.find((b) => b.type === 'contact-colophon');

  return (
    <article
      id="seramikbak-lookbook-container"
      className="seramikbak-lookbook-root w-full antialiased text-stone-100 transition-colors duration-300"
      style={{
        backgroundColor: '#0d0f12',
        color: '#f4efe6'
      }}
    >
      {/* Import High-End Google Fonts for Editorial Luxury */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,400&family=Montserrat:wght@200;300;400;500;600;700&display=swap');

        .font-editorial-serif {
          font-family: 'Cormorant Garamond', Georgia, serif;
        }
        .font-editorial-sans {
          font-family: 'Montserrat', -apple-system, sans-serif;
        }

        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm;
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
          }
          .lookbook-print-page {
            page-break-after: always !important;
            break-after: page !important;
            break-inside: avoid !important;
            padding: 24px 0 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* =========================================================================
          SECTION 1: HERO CINEMATIC COVER (Monograph Grade)
      ========================================================================= */}
      {coverBlock && coverBlock.enabled && (
        <section
          id="section-cover"
          className="relative min-h-[90vh] md:min-h-screen flex flex-col justify-between p-6 sm:p-12 md:p-20 overflow-hidden border-b border-white/10"
        >
          {/* Background High-Res Image with Dark Architectural Vignette */}
          <div className="absolute inset-0 z-0">
            <img
              src={coverBlock.coverImage}
              alt={normalized.coverTitle}
              className="w-full h-full object-cover object-center filter brightness-45 contrast-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f12] via-[#0d0f12]/50 to-[#0d0f12]/30" />
            <div className="absolute inset-0 bg-radial-at-c from-transparent via-black/40 to-black/80" />
          </div>

          {/* Top Brand Tagline */}
          <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-editorial-sans font-semibold tracking-[0.3em] uppercase text-amber-300/90">
                MİMARİ YAYIN &bull; {new Date().getFullYear()} / {new Date().getFullYear() + 1}
              </span>
              <p className="text-xs text-stone-400 font-editorial-sans tracking-widest uppercase">
                {brand.name || 'SERAMİK'} ARCHITECTURAL LOOKBOOK
              </p>
            </div>

            <div className="hidden sm:block text-right">
              <span className="text-[10px] font-mono tracking-widest text-stone-400 border border-white/15 px-3 py-1 rounded-full backdrop-blur-md">
                TS EN 14411 GRUP BIA
              </span>
            </div>
          </div>

          {/* Center Title & Subtitle */}
          <div className="relative z-10 max-w-4xl my-auto py-12 space-y-6">
            <div className="w-12 h-0.5 bg-amber-400/80" />

            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-editorial-serif font-normal tracking-tight text-white leading-[1.05] drop-shadow-2xl">
              {normalized.coverTitle}
            </h1>

            <p className="text-base sm:text-xl md:text-2xl text-stone-300 font-editorial-sans font-light max-w-2xl leading-relaxed tracking-wide">
              {normalized.coverSubtitle}
            </p>

            <div className="pt-4 flex items-center gap-4 no-print">
              <a
                href="#section-manifesto"
                className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-editorial-sans font-medium text-xs tracking-widest uppercase backdrop-blur-md border border-white/20 transition-all cursor-pointer"
              >
                <span>Koleksiyonu Keşfet</span>
                <ArrowDown size={13} className="text-amber-400 animate-bounce" />
              </a>

              <button
                type="button"
                onClick={() => handleTriggerLead(null, 'sample')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-amber-500 hover:bg-amber-400 text-neutral-950 font-editorial-sans font-bold text-xs tracking-widest uppercase shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
              >
                <Package size={13} />
                <span>Mimari Numune İste</span>
              </button>
            </div>
          </div>

          {/* Bottom Cover Strip */}
          <div className="relative z-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-stone-400 text-xs font-editorial-sans">
            <div>
              <span>PORCELAIN & ARCHITECTURAL SURFACES</span>
            </div>
            <div className="flex items-center gap-3">
              <span>{normalized.products.length} MİMARİ SERİ</span>
              <span>&bull;</span>
              <span>TS EN 14411 UYGUNLUK</span>
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          SECTION 2: EDITORIAL MANIFESTO & PHILOSOPHY
      ========================================================================= */}
      {manifestoBlock && manifestoBlock.enabled && (
        <section
          id="section-manifesto"
          className="lookbook-print-page max-w-6xl mx-auto px-6 sm:px-12 py-20 md:py-28 space-y-16 border-b border-white/10"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16 items-start">
            <div className="lg:col-span-5 space-y-3">
              <span className="text-amber-400 text-xs font-editorial-sans tracking-[0.25em] uppercase font-semibold block">
                TASARIM FELSEFESİ
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-editorial-serif font-normal text-white leading-tight">
                {manifestoBlock.subheading}
              </h2>
            </div>

            <div className="lg:col-span-7 space-y-6">
              <p className="text-xl sm:text-2xl text-stone-300 font-editorial-serif italic leading-relaxed border-l border-amber-400/50 pl-6">
                &ldquo;{manifestoBlock.quote}&rdquo;
              </p>
              <p className="text-sm sm:text-base text-stone-400 font-editorial-sans font-light leading-relaxed">
                {manifestoBlock.text}
              </p>
            </div>
          </div>

          {/* Three Key Architectural Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-8 border-t border-white/10">
            <div className="space-y-2">
              <span className="text-xs font-editorial-sans font-bold tracking-widest text-amber-400 uppercase block">
                01. PORCELLANATO GRES
              </span>
              <h4 className="text-base font-editorial-serif text-white">Yüksek Mekanik Mukavemet</h4>
              <p className="text-xs text-stone-400 font-editorial-sans font-light leading-relaxed">
                TS EN 14411 standardında Grup BIa porselen mukavemeti, sıfıra yakın su emme ve tam dona dayanım.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-editorial-sans font-bold tracking-widest text-amber-400 uppercase block">
                02. MİMARİ EBATLAR
              </span>
              <h4 className="text-base font-editorial-serif text-white">Lazer Hassasiyetle Rektifiye</h4>
              <p className="text-xs text-stone-400 font-editorial-sans font-light leading-relaxed">
                Geniş formatlı porselen karolarda minimum derz aralığı ve kusursuz yüzey devamlılığı.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-editorial-sans font-bold tracking-widest text-amber-400 uppercase block">
                03. GÜVENLİ YAŞAM
              </span>
              <h4 className="text-base font-editorial-serif text-white">R10 / R11 Yüzey Güvenliği</h4>
              <p className="text-xs text-stone-400 font-editorial-sans font-light leading-relaxed">
                Islak hacimler, teraslar ve ticari projeler için sertifikalı kaymazlık ve leke tutmazlık.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          SECTION 3: ARCHITECTURAL ROOM SPREADS (Split Lifestyle & Tile Slab)
      ========================================================================= */}
      {roomSpreads.length > 0 && (
        <section id="section-spreads" className="py-16 md:py-24 space-y-20 md:space-y-32">
          {roomSpreads.map((spread, idx) => {
            const product =
              normalized.products.find((p) => p.id === spread.productId) ||
              normalized.products[spread.productIndex] ||
              {};
            const isReversed = idx % 2 === 1;

            return (
              <div
                key={spread.id || idx}
                className="lookbook-print-page max-w-7xl mx-auto px-6 sm:px-12"
              >
                <div
                  className={`grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-16 items-center ${
                    isReversed ? 'lg:flex-row-reverse' : ''
                  }`}
                >
                  {/* Big Lifestyle Render (65% width) */}
                  <div className={`lg:col-span-7 ${isReversed ? 'lg:order-2' : 'lg:order-1'}`}>
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-black aspect-[16/10] group">
                      <img
                        src={spread.roomRender}
                        alt={spread.productName}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[11px] font-editorial-sans tracking-wider">
                        {spread.roomName}
                      </div>

                      {product.slug && (
                        <div className="absolute bottom-4 right-4 no-print">
                          <Link
                            href={`/mekan-dene?product=${product.slug}`}
                            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-editorial-sans font-bold text-xs tracking-wider uppercase flex items-center gap-1.5 shadow-xl transition"
                          >
                            <Sparkles size={13} />
                            <span>Mekânda 3D Gör</span>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Slab Detail & Specification (35% width) */}
                  <div className={`lg:col-span-5 space-y-6 ${isReversed ? 'lg:order-1' : 'lg:order-2'}`}>
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-editorial-sans tracking-[0.25em] uppercase text-amber-400 font-semibold block">
                        MİMARİ YÜZEY VİTRİNİ &bull; 0{idx + 1}
                      </span>
                      <h3 className="text-3xl sm:text-4xl font-editorial-serif font-normal text-white">
                        {spread.productName}
                      </h3>
                      <p className="text-xs sm:text-sm text-stone-400 font-editorial-sans font-light leading-relaxed">
                        {spread.caption}
                      </p>
                    </div>

                    {/* Slab Tile Closeup */}
                    <div
                      onClick={() => setActiveDetailProduct(product)}
                      className="group/slab relative rounded-xl overflow-hidden border border-white/15 bg-black/60 aspect-[16/9] cursor-pointer shadow-lg"
                    >
                      <img
                        src={spread.slabImage}
                        alt={spread.productName}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover/slab:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/slab:opacity-100 flex items-center justify-center gap-2 text-white text-xs font-editorial-sans font-semibold backdrop-blur-xs transition-opacity">
                        <ZoomIn size={16} className="text-amber-400" />
                        <span>Dokuyu Tam Ekran İncele</span>
                      </div>
                    </div>

                    {/* Spec Line */}
                    <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-editorial-sans text-stone-300">
                      <div>
                        <span className="font-semibold text-white">{spread.dimensions}</span>
                        <span className="text-stone-500 mx-2">&bull;</span>
                        <span className="text-stone-400">{spread.finish}</span>
                      </div>
                      <div className="font-mono text-[11px] text-amber-300">
                        {spread.slipResistance} &bull; {spread.peiRating}
                      </div>
                    </div>

                    {/* Action Row */}
                    <div className="flex items-center gap-3 pt-2 no-print">
                      <button
                        type="button"
                        onClick={() => handleTriggerLead(product, 'sample')}
                        className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-editorial-sans font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-1.5 shadow-md transition cursor-pointer"
                      >
                        <Package size={13} />
                        <span>Numune İste</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleTriggerLead(product, 'quote')}
                        className="flex-1 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-editorial-sans font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-1.5 border border-white/15 transition cursor-pointer"
                      >
                        <Tag size={13} className="text-amber-400" />
                        <span>Teklif Al</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* =========================================================================
          SECTION 4: COMPLETE COLLECTION GALLERY GRID
      ========================================================================= */}
      {collectionGridBlock && collectionGridBlock.enabled && (
        <section
          id="section-grid"
          className="lookbook-print-page max-w-7xl mx-auto px-6 sm:px-12 py-20 md:py-28 space-y-12 border-t border-white/10"
        >
          {/* Header & Filter Row */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6">
            <div className="space-y-2">
              <span className="text-amber-400 text-xs font-editorial-sans tracking-[0.25em] uppercase font-semibold block">
                KOLEKSİYON SEÇKİSİ
              </span>
              <h2 className="text-3xl sm:text-5xl font-editorial-serif font-normal text-white">
                {collectionGridBlock.title}
              </h2>
              <p className="text-xs sm:text-sm text-stone-400 font-editorial-sans font-light">
                {collectionGridBlock.subtitle}
              </p>
            </div>

            {/* Clean Finish Filters */}
            <div className="flex flex-wrap items-center gap-2 no-print">
              <button
                type="button"
                onClick={() => setActiveFinishFilter('ALL')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-editorial-sans tracking-wider uppercase font-semibold transition cursor-pointer ${
                  activeFinishFilter === 'ALL'
                    ? 'bg-amber-500 text-neutral-950'
                    : 'bg-white/5 hover:bg-white/10 text-stone-300 border border-white/10'
                }`}
              >
                Tümü ({normalized.products.length})
              </button>

              {uniqueFinishes.map((finish) => (
                <button
                  key={finish}
                  type="button"
                  onClick={() => setActiveFinishFilter(finish)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-editorial-sans tracking-wider uppercase font-semibold transition cursor-pointer ${
                    activeFinishFilter === finish
                      ? 'bg-amber-500 text-neutral-950'
                      : 'bg-white/5 hover:bg-white/10 text-stone-300 border border-white/10'
                  }`}
                >
                  {finish}
                </button>
              ))}
            </div>
          </div>

          {/* Clean Visual Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((p, idx) => {
              const dimensions =
                p.width && p.height ? `${p.width}×${p.height} cm` : '60×120 cm';
              const imageUrl = p.imageUrl || p.textureUrl || '/placeholder.png';

              return (
                <div
                  key={p.id || idx}
                  onClick={() => setActiveDetailProduct(p)}
                  className="group cursor-pointer space-y-3"
                >
                  {/* Tile Visual Container */}
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-black/60 border border-white/10 group-hover:border-amber-400/50 transition-all duration-300">
                    <img
                      src={imageUrl}
                      alt={p.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Subtle Overlay on Hover */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 text-white font-editorial-sans text-xs font-medium backdrop-blur-xs transition-opacity">
                      <ZoomIn size={14} className="text-amber-400" />
                      <span>Dokuyu İncele</span>
                    </div>

                    {p.finish && (
                      <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-[10px] font-editorial-sans text-stone-200 border border-white/10">
                        {p.finish}
                      </div>
                    )}
                  </div>

                  {/* Clean Minimal Info */}
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-editorial-serif font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                      {p.name}
                    </h4>
                    <p className="text-[11px] text-stone-400 font-editorial-sans font-light flex items-center justify-between">
                      <span>{dimensions}</span>
                      {p.slipResistance && (
                        <span className="font-mono text-amber-300/80">{p.slipResistance}</span>
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* =========================================================================
          SECTION 5: ARCHITECTURAL TECHNICAL MATRIX (TS EN 14411)
      ========================================================================= */}
      {specBlock && specBlock.enabled && (
        <section
          id="section-specs"
          className="lookbook-print-page max-w-6xl mx-auto px-6 sm:px-12 py-20 md:py-28 space-y-12 border-t border-white/10"
        >
          <div className="space-y-2">
            <span className="text-amber-400 text-xs font-editorial-sans tracking-[0.25em] uppercase font-semibold flex items-center gap-2">
              <ShieldCheck size={14} />
              <span>TEKNİK ŞARTNAME & UYGUNLUK STANDARTLARI</span>
            </span>
            <h2 className="text-3xl sm:text-4xl font-editorial-serif font-normal text-white">
              {specBlock.title}
            </h2>
            <p className="text-xs text-stone-400 font-mono">
              Standart Kodu: {specBlock.standardCode}
            </p>
          </div>

          {/* Minimalist Architectural Table */}
          <div className="border-t border-b border-white/10 overflow-x-auto">
            <table className="w-full text-left text-xs font-editorial-sans">
              <thead>
                <tr className="border-b border-white/10 text-stone-400 tracking-wider uppercase text-[11px]">
                  <th className="py-3.5 px-3 font-semibold">Parametre</th>
                  <th className="py-3.5 px-3 font-semibold">Test Standardı</th>
                  <th className="py-3.5 px-3 font-semibold">Beyan Değeri</th>
                  <th className="py-3.5 px-3 font-semibold text-right">Uygunluk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {specBlock.specs.map((s, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02] transition">
                    <td className="py-3 px-3 font-medium text-white">{s.parameter}</td>
                    <td className="py-3 px-3 text-stone-400 font-mono">{s.standard}</td>
                    <td className="py-3 px-3 text-amber-300 font-mono">{s.value}</td>
                    <td className="py-3 px-3 text-right">
                      <span className="font-mono text-[10px] text-emerald-400 font-semibold tracking-wider">
                        TS EN UYGUN
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Logistics Box/Pallet Info */}
          <div className="space-y-3 pt-4">
            <h4 className="text-sm font-editorial-serif font-bold text-stone-200">
              Paketleme & Lojistik Kapasitesi
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-editorial-sans">
              {specBlock.packaging.map((pack, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-1">
                  <span className="font-bold text-white block">{pack.dimension}</span>
                  <p className="text-stone-400 text-[11px]">
                    Kutu: {pack.boxPcs} &bull; {pack.boxM2} &bull; {pack.boxKg}
                  </p>
                  <p className="text-amber-300 text-[11px]">
                    Palet: {pack.palletBox} &bull; {pack.palletM2} &bull; {pack.palletKg}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          SECTION 6: COLOPHON & B2B DIRECT CONTACT
      ========================================================================= */}
      {colophonBlock && colophonBlock.enabled && (
        <section
          id="section-contact"
          className="lookbook-print-page max-w-6xl mx-auto px-6 sm:px-12 py-20 md:py-28 space-y-12 border-t border-white/10"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <span className="text-amber-400 text-xs font-editorial-sans tracking-[0.25em] uppercase font-semibold block">
                MİMARİ PROJE & NUMUNE DESTEK
              </span>

              <h2 className="text-3xl sm:text-5xl font-editorial-serif font-normal text-white">
                {colophonBlock.title}
              </h2>

              <p className="text-stone-300 text-sm sm:text-base font-editorial-sans font-light leading-relaxed">
                {colophonBlock.subtitle}
              </p>

              <div className="space-y-2 pt-2 text-xs font-editorial-sans text-stone-300">
                {brand.contactPhone && (
                  <div className="flex items-center gap-3">
                    <Phone size={13} className="text-amber-400" />
                    <span>{brand.contactPhone}</span>
                  </div>
                )}
                {brand.contactEmail && (
                  <div className="flex items-center gap-3">
                    <Mail size={13} className="text-amber-400" />
                    <span>{brand.contactEmail}</span>
                  </div>
                )}
                {brand.websiteUrl && (
                  <div className="flex items-center gap-3">
                    <Globe size={13} className="text-amber-400" />
                    <a href={brand.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">
                      {brand.websiteUrl}
                    </a>
                  </div>
                )}
              </div>

              <div className="pt-4 flex flex-wrap gap-4 no-print">
                <button
                  type="button"
                  onClick={() => handleTriggerLead(null, 'sample')}
                  className="px-6 py-3.5 rounded-full bg-amber-500 hover:bg-amber-400 text-neutral-950 font-editorial-sans font-bold text-xs tracking-wider uppercase flex items-center gap-2 shadow-xl shadow-amber-500/20 transition cursor-pointer"
                >
                  <Package size={14} />
                  <span>Mimari Numune Talep Et</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTriggerLead(null, 'quote')}
                  className="px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/15 text-white font-editorial-sans font-semibold text-xs tracking-wider uppercase flex items-center gap-2 border border-white/15 transition cursor-pointer"
                >
                  <Tag size={14} className="text-amber-400" />
                  <span>Proje Teklifi Al</span>
                </button>
              </div>
            </div>

            {/* Mobile QR Card */}
            <div className="lg:col-span-5 p-8 rounded-2xl bg-white/[0.02] border border-white/10 text-center space-y-4">
              <div className="p-3 bg-white rounded-xl inline-block shadow-sm">
                {normalized.products[0]?.qrCodeUrl ? (
                  <img
                    src={normalized.products[0].qrCodeUrl}
                    alt="Katalog QR Kodu"
                    className="w-32 h-32 mx-auto"
                  />
                ) : (
                  <QrCode size={120} className="text-neutral-950 mx-auto" />
                )}
              </div>
              <div className="space-y-1 text-xs font-editorial-sans">
                <h4 className="font-bold text-white">Akıllı Telefonunuzla İnceleyin</h4>
                <p className="text-stone-400 text-[11px]">
                  Kameranızla okutarak interaktif dijital yayına mobil cihazınızdan ulaşın.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          IMMERSIVE TILE DETAIL & 4K MACRO TEXTURE MODAL
      ========================================================================= */}
      {activeDetailProduct && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 no-print animate-in fade-in duration-200">
          <div className="relative max-w-4xl w-full bg-[#121418] border border-white/15 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 px-7 border-b border-white/10 bg-[#161920]">
              <div>
                <h3 className="text-xl font-editorial-serif font-normal text-white">
                  {activeDetailProduct.name}
                </h3>
                <p className="text-xs text-stone-400 font-editorial-sans">
                  {activeDetailProduct.finish} &bull; {activeDetailProduct.width}×{activeDetailProduct.height} cm
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveDetailProduct(null)}
                className="p-2 rounded-full text-stone-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body: Large Image with zoom */}
            <div className="p-6 overflow-y-auto flex-1 flex flex-col items-center justify-center bg-black/40">
              <img
                src={activeDetailProduct.imageUrl || activeDetailProduct.textureUrl}
                alt={activeDetailProduct.name}
                className="max-h-[55vh] w-auto object-contain rounded-xl shadow-2xl transition-transform duration-300 hover:scale-125 cursor-zoom-in"
              />
              <p className="text-[11px] text-stone-500 font-editorial-sans mt-3">
                İpucu: Yüzey rölyefini ve damar derinliğini yakından incelemek için görselin üzerine gelin.
              </p>
            </div>

            {/* Modal Footer: Quick Specs & B2B Actions */}
            <div className="p-4 px-7 border-t border-white/10 bg-[#161920] flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-xs font-mono text-stone-300">
                <span>PEI: {activeDetailProduct.peiRating || 'IV'}</span>
                <span>&bull;</span>
                <span>KAYMAZLIK: {activeDetailProduct.slipResistance || 'R10'}</span>
                <span>&bull;</span>
                <span>KALINLIK: {activeDetailProduct.thickness || '9'} mm</span>
              </div>

              <div className="flex items-center gap-3">
                {activeDetailProduct.slug && (
                  <Link
                    href={`/mekan-dene?product=${activeDetailProduct.slug}`}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-editorial-sans text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <Sparkles size={13} className="text-amber-400" />
                    <span>3D Mekânda Gör</span>
                  </Link>
                )}

                <button
                  type="button"
                  onClick={() => {
                    handleTriggerLead(activeDetailProduct, 'sample');
                    setActiveDetailProduct(null);
                  }}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-editorial-sans font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
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
