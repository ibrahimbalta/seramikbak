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
  Sliders,
  Phone,
  Mail,
  Globe,
  MapPin,
  Check,
  ArrowRight,
  ChevronRight,
  Smartphone
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
  const isLandscape = catalog.orientation === 'landscape';

  const [imgErrors, setImgErrors] = useState({});

  const handleImgError = (id) => {
    setImgErrors((prev) => ({ ...prev, [id]: true }));
  };

  // Compile all pages array
  const pages = [];

  // Page 1: Cover Page
  if (catalog.showCover) {
    pages.push({ type: 'cover' });
  }

  // Page 2: Table of Contents (İçindekiler)
  if (catalog.showTOC) {
    pages.push({ type: 'toc' });
  }

  // Individual Product Pages
  products.forEach((p, idx) => {
    pages.push({ type: 'product', product: p, index: idx });
  });

  // Dedicated Section: Technical Standards (Teknik Özellikler)
  if (catalog.showSpecs) {
    pages.push({ type: 'technical_standards' });
  }

  // Dedicated Section: Application Areas (Kullanım Alanları)
  pages.push({ type: 'application_areas' });

  // Dedicated Section: 3D Digital Catalog & Visualizer (Dijital Katalog / 3D Deneyim)
  if (catalog.showQrCodes) {
    pages.push({ type: 'digital_3d' });
  }

  // Last Page: Contact / Back Cover (İletişim)
  if (catalog.showContactPage) {
    pages.push({ type: 'contact' });
  }

  const renderSinglePage = (pageObj, pageIndex) => {
    if (!pageObj) return null;
    const pageNum = (pageIndex + 1).toString().padStart(2, '0');

    // =========================================================================
    // 1. COVER PAGE — SPLIT EDITORIAL WITH LUXURY ARCHITECTURAL SCENE
    // =========================================================================
    if (pageObj.type === 'cover') {
      const coverHero =
        products[0]?.imageUrl ||
        products[0]?.textureUrl ||
        '/renders/modern_living_natural_oak.jpg';

      return (
        <section
          key="cover"
          className="catalog-page relative bg-[#fdfbf7] text-neutral-900 overflow-hidden flex flex-col justify-between"
          style={{ backgroundColor: '#12151b' }}
        >
          {/* Split 2-Column Cover Layout */}
          <div className="w-full h-full flex flex-col md:flex-row">
            {/* Left Column: Dark Luxury Brand Panel */}
            <div className="w-full md:w-[50%] p-8 sm:p-12 md:p-14 flex flex-col justify-between text-white relative z-10 bg-gradient-to-b from-[#111622] via-[#0d111a] to-[#080b11]">
              {/* Brand Logo Header */}
              <div>
                <div className="flex items-center gap-3">
                  {logo && !imgErrors['logo-cover'] ? (
                    <img
                      src={logo}
                      alt={brand.name || 'Brand'}
                      onError={() => handleImgError('logo-cover')}
                      className="h-9 max-w-[170px] object-contain filter brightness-0 invert"
                    />
                  ) : (
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-300 text-neutral-950 font-serif font-black text-lg flex items-center justify-center shadow">
                        {(brand.name || 'S').charAt(0)}
                      </div>
                      <span className="text-xl font-serif font-bold tracking-wider text-white uppercase">
                        {brand.name || 'SeramikBak'}
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-[10px] font-sans text-neutral-400 tracking-wide mt-1">
                  Hayalinizdeki Mekân, Doğru Seramikle
                </p>
              </div>

              {/* Center Title Block */}
              <div className="my-auto py-8">
                <div className="w-8 h-1 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full mb-6" />
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-light text-white leading-[1.18] tracking-tight mb-4">
                  {catalog.coverTitle || 'Doğanın Zarafeti, Mekânlarınıza İlham Olsun'}
                </h1>
                <p className="text-xs sm:text-sm text-neutral-300 font-light leading-relaxed max-w-sm">
                  {catalog.coverSubtitle ||
                    catalog.introText ||
                    'Modern Yaşam Alanları İçin Premium Seramik & Porselen Çözümleri'}
                </p>
              </div>

              {/* Bottom Info & Digital Catalog QR */}
              <div className="pt-6 border-t border-white/10 flex items-end justify-between">
                <div>
                  <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase block font-semibold">
                    {new Date().getFullYear()} KOLEKSİYON KATALOĞU
                  </span>
                  <span className="text-[11px] text-neutral-400">
                    {catalog.websiteUrl || 'www.seramikbak.com'}
                  </span>
                </div>

                {catalog.showQrCodes && (
                  <div className="flex items-center gap-2.5 bg-white/5 p-2 rounded-xl border border-white/10">
                    <div className="w-10 h-10 rounded bg-white p-1 flex items-center justify-center text-neutral-950">
                      <QrCode size={30} />
                    </div>
                    <div className="text-[9px] text-neutral-300 leading-tight">
                      <p className="font-bold text-white">Kataloğu Dijital</p>
                      <p className="text-neutral-400">Olarak İnceleyin</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Full-Bleed Architectural Room Scene */}
            <div className="w-full md:w-[50%] relative min-h-[300px] md:min-h-full overflow-hidden">
              <img
                src={coverHero}
                alt="Luxury Room Scene"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

              {/* Top Right Header Badge */}
              <div className="absolute top-8 right-8 text-right text-white">
                <span className="text-[10px] font-mono tracking-[0.25em] text-amber-300 uppercase block font-bold">
                  SERAMİK & PORSELEN
                </span>
                <span className="text-xs font-serif tracking-widest uppercase text-white/90">
                  KOLEKSİYONU &bull; {new Date().getFullYear()}
                </span>
              </div>
            </div>
          </div>
        </section>
      );
    }

    // =========================================================================
    // 2. TABLE OF CONTENTS (İÇİNDEKİLER) — SPLIT SPREAD WITH ROOM PHOTOGRAPHY
    // =========================================================================
    if (pageObj.type === 'toc') {
      const tocImage =
        products[1]?.imageUrl ||
        products[0]?.imageUrl ||
        '/renders/luxury_bathroom_calacatta_gold.jpg';

      return (
        <section
          key="toc"
          className="catalog-page relative bg-[#fdfbf7] text-neutral-900 overflow-hidden flex flex-col justify-between"
        >
          <div className="w-full h-full flex flex-col md:flex-row">
            {/* Left Column: Table of Contents Directory */}
            <div className="w-full md:w-[55%] p-8 sm:p-12 md:p-14 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-mono font-bold text-amber-700 tracking-[0.2em] uppercase block">
                  KOLEKSİYONLARIMIZ
                </span>
                <h2 className="text-3xl sm:text-4xl font-serif font-light text-neutral-950 tracking-tight mt-1 mb-6">
                  İçindekiler
                </h2>

                {/* Directory List */}
                <div className="space-y-3 max-w-md">
                  {products.slice(0, 6).map((p, idx) => (
                    <div
                      key={p.id || idx}
                      className="flex items-center justify-between text-xs py-1.5 border-b border-neutral-200/80 group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-neutral-400 font-bold text-[11px] w-5">
                          {(idx + 1).toString().padStart(2, '0')}
                        </span>
                        <span className="font-medium text-neutral-800 group-hover:text-amber-800 transition">
                          {p.name}
                        </span>
                      </div>
                      <span className="font-mono text-neutral-400 font-bold text-[11px]">
                        {(idx + 3).toString().padStart(2, '0')}
                      </span>
                    </div>
                  ))}

                  <div className="flex items-center justify-between text-xs py-1.5 border-b border-neutral-200/80">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-neutral-400 font-bold text-[11px] w-5">
                        07
                      </span>
                      <span className="font-medium text-neutral-800">
                        Teknik Özellikler & Standartlar
                      </span>
                    </div>
                    <span className="font-mono text-neutral-400 font-bold text-[11px]">
                      {(products.length + 3).toString().padStart(2, '0')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs py-1.5 border-b border-neutral-200/80">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-neutral-400 font-bold text-[11px] w-5">
                        08
                      </span>
                      <span className="font-medium text-neutral-800">
                        Kullanım Alanları & Mimari Çözümler
                      </span>
                    </div>
                    <span className="font-mono text-neutral-400 font-bold text-[11px]">
                      {(products.length + 4).toString().padStart(2, '0')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs py-1.5 border-b border-neutral-200/80">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-neutral-400 font-bold text-[11px] w-5">
                        09
                      </span>
                      <span className="font-medium text-neutral-800">
                        İletişim & Proje Destek
                      </span>
                    </div>
                    <span className="font-mono text-neutral-400 font-bold text-[11px]">
                      {(products.length + 5).toString().padStart(2, '0')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Quote & Signature */}
              <div className="pt-6 border-t border-neutral-300/80">
                <p className="text-xs font-serif italic text-neutral-700 leading-relaxed mb-2">
                  &ldquo;Her mekân, doğru seramikle daha özel.&rdquo;
                </p>
                <div className="w-10 h-0.5 bg-amber-600 rounded-full" />
              </div>
            </div>

            {/* Right Column: Elegant Interior Scene */}
            <div className="w-full md:w-[45%] relative min-h-[300px] md:min-h-full overflow-hidden">
              <img
                src={tocImage}
                alt="Interior Scene"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/10" />
            </div>
          </div>

          {/* Running Footer Page Number */}
          <div className="absolute bottom-4 right-8 text-[11px] font-mono text-white/80 font-bold z-20">
            02
          </div>
        </section>
      );
    }

    // =========================================================================
    // 3. PRODUCT PAGES — EXACT CALACATTA GOLD / STATUARIO EDITORIAL SPREAD
    // =========================================================================
    if (pageObj.type === 'product') {
      const p = pageObj.product;
      const index = pageObj.index;
      const pImage = p.imageUrl || p.textureUrl || '/renders/luxury_bathroom_calacatta_gold.jpg';
      const dimensions = p.width && p.height ? `${p.width}x${p.height} cm` : '60x120 cm';

      return (
        <section
          key={p.id || index}
          className="catalog-page relative bg-[#fdfbf7] text-neutral-900 p-8 sm:p-12 md:p-14 flex flex-col justify-between overflow-hidden"
        >
          {/* Top Running Header */}
          <div className="flex items-center justify-between pb-3 border-b border-neutral-300/80 mb-6">
            <span className="text-[10px] font-mono font-bold tracking-[0.25em] text-neutral-500 uppercase">
              | {p.style ? `${p.style.toUpperCase()} KOLEKSİYONU` : 'MERMER KOLEKSİYONU'}
            </span>
            <span className="text-[11px] font-mono font-bold text-neutral-400">
              {pageNum}
            </span>
          </div>

          {/* Main 2-Column Product Layout */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center my-auto">
            {/* Left Column: Product Typography, Narrative & 6 Specs */}
            <div className="md:col-span-6 flex flex-col justify-between h-full py-2">
              <div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-light text-neutral-950 tracking-tight mb-3">
                  {p.name}
                </h2>

                <p className="text-xs sm:text-sm text-neutral-600 font-light leading-relaxed mb-6">
                  {p.customNote ||
                    p.description ||
                    'Beyazın saflığı, doğal damarların zarafetiyle buluşuyor. Mekânlarınıza sofistike, aydınlık ve prestijli bir atmosfer kazandırır.'}
                </p>

                {/* 6 Specification Rows with Clean Minimalist Icons */}
                <div className="space-y-2.5 text-xs text-neutral-700 max-w-sm mb-6">
                  <div className="flex items-center justify-between py-1 border-b border-neutral-200/70">
                    <span className="flex items-center gap-2 text-neutral-500">
                      <span className="text-sm">◫</span>
                      <span>Ebat</span>
                    </span>
                    <span className="font-medium text-neutral-900">
                      {dimensions} / {p.width || 60}x60 cm
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-neutral-200/70">
                    <span className="flex items-center gap-2 text-neutral-500">
                      <span className="text-sm">✦</span>
                      <span>Yüzey</span>
                    </span>
                    <span className="font-medium text-neutral-900">
                      {p.finish || 'Parlak / Lappato'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-neutral-200/70">
                    <span className="flex items-center gap-2 text-neutral-500">
                      <span className="text-sm">↕</span>
                      <span>Kalınlık</span>
                    </span>
                    <span className="font-medium text-neutral-900">
                      {p.thickness || '9'} mm
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-neutral-200/70">
                    <span className="flex items-center gap-2 text-neutral-500">
                      <span className="text-sm">⚿</span>
                      <span>Rektifiye</span>
                    </span>
                    <span className="font-medium text-neutral-900">
                      {p.rectified !== false ? 'Var' : 'Standart'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-neutral-200/70">
                    <span className="flex items-center gap-2 text-neutral-500">
                      <span className="text-sm">⛨</span>
                      <span>Kaymazlık</span>
                    </span>
                    <span className="font-medium text-neutral-900">
                      {p.slipResistance || 'R9'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-neutral-200/70">
                    <span className="flex items-center gap-2 text-neutral-500">
                      <span className="text-sm">🛡</span>
                      <span>Aşınma Dayanımı</span>
                    </span>
                    <span className="font-medium text-neutral-900">
                      PEI {p.peiRating || '4'}
                    </span>
                  </div>
                </div>

                {/* Price Display if enabled */}
                {catalog.showPrices && p.trendyolPrice && (
                  <div className="mb-6 p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between max-w-sm">
                    <span className="text-xs text-amber-900 font-medium">Liste Fiyatı:</span>
                    <span className="text-base font-serif font-bold text-amber-950">
                      {p.trendyolPrice} TL / m²
                    </span>
                  </div>
                )}
              </div>

              {/* Bottom Interactive Actions (QR + Ürün Detayı) */}
              <div className="flex items-center gap-6 pt-4 border-t border-neutral-200 text-xs">
                {catalog.showQrCodes && (
                  <div className="flex items-center gap-2.5">
                    {p.qrCodeUrl ? (
                      <img
                        src={p.qrCodeUrl}
                        alt="QR"
                        className="w-10 h-10 rounded border border-neutral-300 p-0.5 bg-white shadow-xs"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded border border-neutral-300 p-1 bg-white flex items-center justify-center">
                        <QrCode size={24} className="text-neutral-900" />
                      </div>
                    )}
                    <span className="text-[11px] text-neutral-600 font-medium leading-tight">
                      Bu ürünü 3D'de deneyin
                    </span>
                  </div>
                )}

                <a
                  href={p.productUrl || p.tryInRoomUrl || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-[11px] font-semibold text-neutral-800 hover:text-amber-800 transition"
                >
                  <ExternalLink size={13} className="text-neutral-500" />
                  <span>Ürün Detayı</span>
                </a>
              </div>
            </div>

            {/* Right Column: Full-Height Slab Showcase + 3 Face Variations */}
            <div className="md:col-span-6 flex flex-col items-center">
              {/* Grand Vertical Slab Showcase */}
              <div className="relative w-full max-w-[340px] aspect-[9/16] rounded-xl overflow-hidden shadow-2xl border border-neutral-200 bg-white group">
                <img
                  src={pImage}
                  alt={p.name}
                  onError={() => handleImgError(`prod-${p.id}`)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>

              {/* 3 Face / Dimension Variation Thumbnails underneath */}
              <div className="flex items-center gap-3 mt-4">
                <div className="w-14 h-14 rounded-lg overflow-hidden border border-neutral-300 shadow-xs bg-white">
                  <img src={pImage} alt="Var 1" className="w-full h-full object-cover opacity-90" />
                </div>
                <div className="w-14 h-14 rounded-lg overflow-hidden border border-neutral-300 shadow-xs bg-white">
                  <img src={p.textureUrl || pImage} alt="Var 2" className="w-full h-full object-cover opacity-90" />
                </div>
                <div className="w-14 h-14 rounded-lg overflow-hidden border border-neutral-300 shadow-xs bg-white">
                  <img src={pImage} alt="Var 3" className="w-full h-full object-cover opacity-90" />
                </div>
              </div>

              <div className="flex gap-4 text-[10px] font-mono text-neutral-400 mt-2">
                <span>60x60</span>
                <span>60x120</span>
                <span>120x120</span>
              </div>
            </div>
          </div>

          {/* Running Footer */}
          <div className="pt-3 border-t border-neutral-200/80 flex justify-between text-[10px] font-mono text-neutral-400">
            <span>
              {brand.name} &bull; {p.name}
            </span>
            <span>{pageNum}</span>
          </div>
        </section>
      );
    }

    // =========================================================================
    // 4. TECHNICAL STANDARDS PAGE (TEKNİK ÖZELLİKLER)
    // =========================================================================
    if (pageObj.type === 'technical_standards') {
      return (
        <section
          key="standards"
          className="catalog-page relative bg-[#fdfbf7] text-neutral-900 p-8 sm:p-12 md:p-14 flex flex-col justify-between overflow-hidden"
        >
          <div>
            <span className="text-[10px] font-mono font-bold tracking-[0.25em] text-amber-700 uppercase block">
              KALİTE STANDARTLARIMIZ
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-light text-neutral-950 tracking-tight mt-1 mb-8">
              Teknik Özellikler
            </h2>

            {/* 8 Clean Minimalist Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl">
              <div className="p-5 rounded-xl bg-white border border-neutral-200/90 shadow-xs flex flex-col justify-between h-32">
                <span className="text-lg">◫</span>
                <div>
                  <p className="text-[11px] font-medium text-neutral-500">Ebatlar</p>
                  <p className="text-xs font-bold text-neutral-900 mt-0.5">
                    60x60, 60x120, 80x80, 120x120 cm
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-white border border-neutral-200/90 shadow-xs flex flex-col justify-between h-32">
                <span className="text-lg">↕</span>
                <div>
                  <p className="text-[11px] font-medium text-neutral-500">Kalınlık</p>
                  <p className="text-xs font-bold text-neutral-900 mt-0.5">
                    8 - 11 mm
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-white border border-neutral-200/90 shadow-xs flex flex-col justify-between h-32">
                <span className="text-lg">⚿</span>
                <div>
                  <p className="text-[11px] font-medium text-neutral-500">Rektifiye</p>
                  <p className="text-xs font-bold text-neutral-900 mt-0.5">
                    Var (Lazer Kesim)
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-white border border-neutral-200/90 shadow-xs flex flex-col justify-between h-32">
                <span className="text-lg">⛨</span>
                <div>
                  <p className="text-[11px] font-medium text-neutral-500">Kaymazlık</p>
                  <p className="text-xs font-bold text-neutral-900 mt-0.5">
                    R9 - R11
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-white border border-neutral-200/90 shadow-xs flex flex-col justify-between h-32">
                <span className="text-lg">🛡</span>
                <div>
                  <p className="text-[11px] font-medium text-neutral-500">Aşınma Dayanımı</p>
                  <p className="text-xs font-bold text-neutral-900 mt-0.5">
                    PEI 3 - PEI 5
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-white border border-neutral-200/90 shadow-xs flex flex-col justify-between h-32">
                <span className="text-lg">📦</span>
                <div>
                  <p className="text-[11px] font-medium text-neutral-500">Kutu m²</p>
                  <p className="text-xs font-bold text-neutral-900 mt-0.5">
                    1.44 - 2.16 m²
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-white border border-neutral-200/90 shadow-xs flex flex-col justify-between h-32">
                <span className="text-lg">⚖️</span>
                <div>
                  <p className="text-[11px] font-medium text-neutral-500">Palet Ağırlığı</p>
                  <p className="text-xs font-bold text-neutral-900 mt-0.5">
                    800 - 1200 kg
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-white border border-neutral-200/90 shadow-xs flex flex-col justify-between h-32">
                <span className="text-lg">🎖️</span>
                <div>
                  <p className="text-[11px] font-medium text-neutral-500">Standart</p>
                  <p className="text-xs font-bold text-neutral-900 mt-0.5">
                    TS EN 14411 BIA
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="pt-6 border-t border-neutral-300 flex justify-between items-center text-xs text-neutral-500">
            <p>Tüm ürünlerimiz uluslararası kalite standartlarına uygun olarak üretilmektedir.</p>
            <span className="font-mono">{pageNum}</span>
          </div>
        </section>
      );
    }

    // =========================================================================
    // 5. APPLICATION AREAS (KULLANIM ALANLARI)
    // =========================================================================
    if (pageObj.type === 'application_areas') {
      return (
        <section
          key="application"
          className="catalog-page relative bg-[#fdfbf7] text-neutral-900 p-8 sm:p-12 md:p-14 flex flex-col justify-between overflow-hidden"
        >
          <div>
            <span className="text-[10px] font-mono font-bold tracking-[0.25em] text-amber-700 uppercase block">
              HER MEKÂNA UYGUN ÇÖZÜMLER
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-light text-neutral-950 tracking-tight mt-1 mb-8">
              Kullanım Alanları
            </h2>

            {/* 4 Photo Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-4xl">
              <div className="group rounded-2xl overflow-hidden border border-neutral-200 bg-white shadow-xs">
                <div className="aspect-[16/10] overflow-hidden bg-neutral-100">
                  <img
                    src="/renders/luxury_bathroom_calacatta_gold.jpg"
                    alt="Banyo"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-3.5 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-neutral-900">Banyo & Islak Hacim</h4>
                    <p className="text-[11px] text-neutral-500">Suya tam dayanıklı, hijyenik ve kaymaz yüzeyler</p>
                  </div>
                  <ChevronRight size={16} className="text-neutral-400 group-hover:text-amber-800 transition" />
                </div>
              </div>

              <div className="group rounded-2xl overflow-hidden border border-neutral-200 bg-white shadow-xs">
                <div className="aspect-[16/10] overflow-hidden bg-neutral-100">
                  <img
                    src="/textures/sample_kitchen.png"
                    alt="Mutfak"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-3.5 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-neutral-900">Mutfak & Tezgah Arası</h4>
                    <p className="text-[11px] text-neutral-500">Leke tutmaz, ısıya dayanıklı modern seramikler</p>
                  </div>
                  <ChevronRight size={16} className="text-neutral-400 group-hover:text-amber-800 transition" />
                </div>
              </div>

              <div className="group rounded-2xl overflow-hidden border border-neutral-200 bg-white shadow-xs">
                <div className="aspect-[16/10] overflow-hidden bg-neutral-100">
                  <img
                    src="/renders/modern_living_natural_oak.jpg"
                    alt="Salon"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-3.5 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-neutral-900">Salon & Yaşam Alanı</h4>
                    <p className="text-[11px] text-neutral-500">Geniş formatlı mermer ve doğal taş estetiği</p>
                  </div>
                  <ChevronRight size={16} className="text-neutral-400 group-hover:text-amber-800 transition" />
                </div>
              </div>

              <div className="group rounded-2xl overflow-hidden border border-neutral-200 bg-white shadow-xs">
                <div className="aspect-[16/10] overflow-hidden bg-neutral-100">
                  <img
                    src="/renders/luxury_bathroom_loft_beton.jpg"
                    alt="Teras & Dış Mekân"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-3.5 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-neutral-900">Teras & Dış Mekân</h4>
                    <p className="text-[11px] text-neutral-500">Dona dayanıklı, yüksek mukavemetli dış cephe & zemin</p>
                  </div>
                  <ChevronRight size={16} className="text-neutral-400 group-hover:text-amber-800 transition" />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-300 flex justify-between text-xs text-neutral-500 font-mono">
            <span>{brand.name} Mimari Çözümler</span>
            <span>{pageNum}</span>
          </div>
        </section>
      );
    }

    // =========================================================================
    // 6. 3D DIGITAL CATALOG & VISUALIZER SPREAD
    // =========================================================================
    if (pageObj.type === 'digital_3d') {
      return (
        <section
          key="digital3d"
          className="catalog-page relative bg-[#111622] text-white p-8 sm:p-12 md:p-14 flex flex-col justify-between overflow-hidden"
          style={{
            background:
              'radial-gradient(circle at 70% 30%, rgba(217, 119, 6, 0.15) 0%, transparent 60%), linear-gradient(135deg, #090e17 0%, #111827 50%, #1f2937 100%)'
          }}
        >
          <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-8 items-center my-auto">
            {/* Left Content */}
            <div className="md:col-span-7 space-y-5">
              <span className="text-[10px] font-mono tracking-[0.25em] text-amber-400 uppercase block font-bold">
                | DİJİTAL KATALOG & 3D AR
              </span>

              <h2 className="text-3xl sm:text-5xl font-serif font-light leading-tight">
                Koleksiyonumuzu Dijital Olarak Keşfedin
              </h2>

              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-light max-w-md">
                Tüm koleksiyonlarımızı interaktif dijital kataloğumuzda inceleyebilir, QR kodlarla 3D görselleştirme deneyimi yaşayabilir, kolayca paylaşabilirsiniz.
              </p>

              <div className="space-y-3 pt-2 text-xs text-neutral-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Check size={12} />
                  </div>
                  <span>3D Görselleştirme & Mekânda Canlı Deneme</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Check size={12} />
                  </div>
                  <span>QR Kod Entegrasyonu & Akıllı Telefon Erişimi</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Check size={12} />
                  </div>
                  <span>Hızlı Paylaşım & PDF İndirme</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Check size={12} />
                  </div>
                  <span>Tüm Cihazlarla Tam Mobil Uyumlu</span>
                </div>
              </div>

              <div className="pt-4">
                <a
                  href={`/katalog/${catalog.slug || ''}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-lg transition"
                >
                  <span>Dijital Kataloğu İncele</span>
                  <ArrowRight size={14} />
                </a>
              </div>
            </div>

            {/* Right: Smartphone 3D Simulator Mockup */}
            <div className="md:col-span-5 flex justify-center">
              <div className="relative w-64 h-[440px] rounded-[36px] p-3 bg-neutral-950 border-4 border-neutral-700 shadow-2xl overflow-hidden flex flex-col justify-between">
                {/* Speaker notch */}
                <div className="w-20 h-3.5 bg-neutral-800 rounded-full mx-auto mb-2" />

                {/* Simulated Screen */}
                <div className="flex-1 rounded-2xl overflow-hidden bg-neutral-900 relative flex flex-col justify-between p-3 text-center">
                  <div className="pt-2">
                    <span className="text-[9px] font-mono text-amber-400 tracking-wider uppercase block">
                      SERAMİKBAK 3D
                    </span>
                    <h5 className="text-xs font-serif text-white font-bold mt-1">
                      {catalog.title || 'Koleksiyon 2026'}
                    </h5>
                  </div>

                  <div className="my-auto rounded-xl overflow-hidden aspect-[4/3] border border-white/20 shadow">
                    <img
                      src={products[0]?.imageUrl || '/renders/luxury_bathroom_calacatta_gold.jpg'}
                      alt="Mockup"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="p-2 rounded-lg bg-amber-500 text-neutral-950 font-bold text-[10px]">
                    Mekânımda Canlı Gör
                  </div>
                </div>

                {/* Home Indicator */}
                <div className="w-24 h-1 bg-neutral-600 rounded-full mx-auto mt-2" />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex justify-between text-xs text-neutral-400 font-mono">
            <span>SeramikBak Dijital Katalog Stüdyosu</span>
            <span>{pageNum}</span>
          </div>
        </section>
      );
    }

    // =========================================================================
    // 7. CONTACT / BACK COVER — SPLIT CONTACT DIRECTORY & INTERIOR PHOTO
    // =========================================================================
    if (pageObj.type === 'contact') {
      return (
        <section
          key="contact"
          className="catalog-page relative bg-[#fdfbf7] text-neutral-900 overflow-hidden flex flex-col justify-between"
        >
          <div className="w-full h-full flex flex-col md:flex-row">
            {/* Left Column: Contact Directory */}
            <div className="w-full md:w-[50%] p-8 sm:p-12 md:p-14 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-300 text-neutral-950 font-serif font-black text-base flex items-center justify-center shadow">
                    {(brand.name || 'S').charAt(0)}
                  </div>
                  <span className="text-xl font-serif font-bold tracking-wider text-neutral-900 uppercase">
                    {brand.name || 'SeramikBak'}
                  </span>
                </div>
                <p className="text-[10px] text-neutral-500 mb-8">
                  Hayalinizdeki Mekân, Doğru Seramikle
                </p>

                <h3 className="text-2xl font-serif font-light text-neutral-950 mb-6">
                  İletişim
                </h3>

                <div className="space-y-4 text-xs text-neutral-700">
                  <div className="flex items-center gap-3">
                    <Phone size={15} className="text-amber-700 flex-shrink-0" />
                    <span>{catalog.contactPhone || '+90 (212) 555 00 00'}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Mail size={15} className="text-amber-700 flex-shrink-0" />
                    <span>{catalog.contactEmail || 'info@seramikbak.com'}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Globe size={15} className="text-amber-700 flex-shrink-0" />
                    <span>{catalog.websiteUrl || 'www.seramikbak.com'}</span>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin size={15} className="text-amber-700 flex-shrink-0 mt-0.5" />
                    <span>
                      {catalog.contactAddress ||
                        'Mimar Sinan Mah. Örnek Sk. No:12, Bağcılar / İstanbul'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom QR & Bize Ulaşın */}
              <div className="pt-8 border-t border-neutral-300/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-white border border-neutral-300 p-1 flex items-center justify-center shadow-xs">
                    <QrCode size={36} className="text-neutral-900" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-neutral-900">Bize Ulaşın</p>
                    <p className="text-[10px] text-neutral-500">Müşteri Destek & Numune</p>
                  </div>
                </div>

                <span className="text-xs font-mono text-neutral-400 font-bold">{pageNum}</span>
              </div>
            </div>

            {/* Right Column: Serene Living Room Scene with Chair & Plant */}
            <div className="w-full md:w-[50%] relative min-h-[300px] md:min-h-full overflow-hidden">
              <img
                src="/renders/modern_living_natural_oak.jpg"
                alt="Living Room with Chair"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-black/10" />

              {/* Bottom Right Quote */}
              <div className="absolute bottom-8 right-8 text-right text-white max-w-xs drop-shadow">
                <p className="text-xs font-serif italic text-white/90">
                  &ldquo;Doğanın ilhamı, modern yaşamın tasarımı...&rdquo;
                </p>
              </div>
            </div>
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
