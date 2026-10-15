'use client';

import React, { useState } from 'react';
import {
  QrCode,
  ExternalLink,
  ChevronRight,
  Phone,
  Mail,
  Globe,
  MapPin,
  Check,
  ArrowRight
} from 'lucide-react';

export default function MilanoLookbookTemplate({
  catalog,
  products = [],
  mode = 'preview',
  activePageIndex = 0,
  viewFormat = 'single',
  onSelectPage
}) {
  const brand = catalog?.brand || {};
  const logo = catalog?.customLogoUrl || brand.logoUrl;
  const isLandscape = catalog?.orientation === 'landscape';

  const [imgErrors, setImgErrors] = useState({});

  const handleImgError = (id) => {
    setImgErrors((prev) => ({ ...prev, [id]: true }));
  };

  // Safe products array with high quality fallback if empty
  const safeProducts = products && products.length > 0 ? products : [
    {
      id: 'demo-1',
      name: 'Amazonit',
      sku: '55018167RP',
      color: 'Yeşil',
      finish: 'Parlak',
      width: 120,
      height: 280,
      thickness: '6',
      rectified: true,
      slipResistance: 'R9',
      peiRating: '4',
      imageUrl: '/renders/modern_living_natural_oak.jpg',
      textureUrl: '/textures/calacatta_gold.jpg',
      description: 'Doğal taşın dinginliğini ve mermer damarlarının zarafetini 120x280 cm dev plakalarla yaşam alanlarınıza taşıyan Amazonit Koleksiyonu.'
    },
    {
      id: 'demo-2',
      name: 'Calacatta Gold',
      sku: '55018244RP',
      color: 'Beyaz / Altın',
      finish: 'Parlak',
      width: 120,
      height: 280,
      thickness: '6',
      rectified: true,
      slipResistance: 'R10',
      peiRating: '4',
      imageUrl: '/renders/luxury_bathroom_calacatta_gold.jpg',
      textureUrl: '/textures/calacatta_gold.jpg',
      description: 'İtalyan mermer mirasının en prestijli temsilcisi. İpeksi altın damarları ve berrak beyaz tabanıyla mimari mekanlara zamansız lüks katar.'
    }
  ];

  // Helper: Sample variations for slab color swatches (page 91 in benchmark)
  const getProductVariations = (p, pIndex) => {
    return [
      {
        name: p.color || 'Ana Renk',
        texture: p.textureUrl || p.imageUrl || '/textures/calacatta_gold.jpg',
        bg: '#d1d5db'
      },
      {
        name: 'Gri',
        texture: '/textures/concrete_light_grey.jpg',
        bg: '#9ca3af'
      },
      {
        name: 'Antrasit',
        texture: '/textures/albatros_antrasit.jpg',
        bg: '#374151'
      }
    ];
  };

  // =========================================================================
  // PAGE COMPILATION PIPELINE (Authentic Ceramic Monograph)
  // =========================================================================
  const pages = [];

  // Page 1: Minimalist Dark Cover (Milano 120x280)
  if (catalog?.showCover !== false) {
    pages.push({ type: 'cover' });
  }

  // Page 2: Table of Contents (İçindekiler - 2 Kolonlu Matbaa Dizilimi)
  if (catalog?.showTOC !== false) {
    pages.push({ type: 'toc' });
  }

  // Page 3: Corporate Manifesto & Innovation (Tasarımda Yenilik ve Teknoloji)
  pages.push({ type: 'manifesto' });

  // Product Pages: 2-Page Spreads (Sol Sayfa: Mekan & Teknik / Sağ Sayfa: Tam Boy Dikey Plaka)
  safeProducts.forEach((p, idx) => {
    pages.push({ type: 'product_left', product: p, index: idx });
    pages.push({ type: 'product_right', product: p, index: idx });
  });

  // Dedicated Section: Technical Standards (Teknik Özellikler Matrisi)
  if (catalog?.showSpecs !== false) {
    pages.push({ type: 'technical_standards' });
  }

  // Dedicated Section: Application Areas (Kullanım Alanları)
  pages.push({ type: 'application_areas' });

  // Dedicated Section: Digital Catalog & 3D AR Studio
  if (catalog?.showQrCodes !== false) {
    pages.push({ type: 'digital_3d' });
  }

  // Final Page: Contact & Showroom Back Cover
  if (catalog?.showContactPage !== false) {
    pages.push({ type: 'contact' });
  }

  // =========================================================================
  // PAGE RENDERER
  // =========================================================================
  const renderSinglePage = (pageObj, pageIndex) => {
    if (!pageObj) return null;
    const pageNum = (pageIndex + 1).toString().padStart(2, '0');
    const collectionTag = catalog?.collectionTag || '120×280 KOLEKSİYONLARI';

    // -----------------------------------------------------------------------
    // 1. COVER PAGE — Minimalist Dark Slate Monograph
    // -----------------------------------------------------------------------
    if (pageObj.type === 'cover') {
      return (
        <section
          key="cover"
          className="catalog-page relative text-white overflow-hidden flex flex-col justify-between select-none"
          style={{ backgroundColor: '#23272a' }}
        >
          {/* Subtle noise and fine architectural grid line */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

          {/* Top Architectural Running Marker */}
          <div className="p-8 sm:p-14 md:p-16 flex justify-between items-center text-[10px] tracking-[0.3em] font-mono uppercase text-neutral-400">
            <span>{brand.name || 'SERAMİKBAK'}</span>
            <span>{new Date().getFullYear()}</span>
          </div>

          {/* Center Brand Identity */}
          <div className="my-auto px-8 sm:px-14 md:px-16 text-center flex flex-col items-center">
            {logo && !imgErrors['logo-cover'] ? (
              <img
                src={logo}
                alt={brand.name || 'Brand'}
                onError={() => handleImgError('logo-cover')}
                className="h-12 sm:h-16 max-w-[280px] object-contain filter brightness-0 invert mb-6"
              />
            ) : (
              <div className="flex flex-col items-center gap-3 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white font-serif font-light text-2xl shadow-xl">
                  {(brand.name || 'S').charAt(0)}
                </div>
                <h1 className="text-2xl sm:text-4xl font-serif font-normal tracking-[0.2em] uppercase text-white">
                  {brand.name || 'SeramikBak'}
                </h1>
              </div>
            )}

            <div className="w-12 h-px bg-white/30 my-6" />

            <p className="text-xs sm:text-sm text-neutral-300 font-light tracking-widest max-w-md uppercase">
              {catalog?.coverSubtitle || catalog?.introText || 'Doğanın Zarafeti, Mekânlarınıza İlham Olsun'}
            </p>
          </div>

          {/* Bottom Bold Monograph Category */}
          <div className="p-8 sm:p-14 md:p-16 text-center border-t border-white/10">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-sans font-bold tracking-[0.18em] uppercase text-white">
              {catalog?.coverTitle || collectionTag}
            </h2>
            <p className="text-[10px] sm:text-[11px] font-mono tracking-widest text-neutral-400 mt-2 uppercase">
              Porselen Seramik ve Mimari Yüzeyler
            </p>
          </div>
        </section>
      );
    }

    // -----------------------------------------------------------------------
    // 2. TABLE OF CONTENTS — Pure White 2-Column Monograph Directory (Page 3)
    // -----------------------------------------------------------------------
    if (pageObj.type === 'toc') {
      return (
        <section
          key="toc"
          className="catalog-page relative bg-white text-neutral-900 p-8 sm:p-14 md:p-16 flex flex-col justify-between overflow-hidden"
        >
          {/* Top Running Header */}
          <div>
            <div className="text-[10px] sm:text-[11px] font-sans font-bold tracking-[0.2em] uppercase text-neutral-500 mb-8 sm:mb-12">
              {collectionTag}
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans font-normal tracking-tight text-neutral-950 mb-10 sm:mb-14">
              İçindekiler
            </h2>

            {/* Strict Two-Column Directory */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 sm:gap-x-16 gap-y-3 sm:gap-y-4 max-w-2xl text-xs sm:text-sm">
              {/* Product Collections with Spaced Page Numbers */}
              {safeProducts.map((p, idx) => {
                // Page calculation: Cover=1, TOC=2, Manifesto=3, Product idx starts at 4 + idx*2
                const pStartPage = (4 + idx * 2).toString().padStart(2, '0');
                const targetIdx = 3 + idx * 2;
                return (
                  <button
                    key={p.id || idx}
                    type="button"
                    onClick={() => mode !== 'print' && onSelectPage?.(targetIdx)}
                    className="flex items-baseline justify-between border-b border-neutral-100 pb-1.5 group text-left w-full cursor-pointer hover:border-amber-400 transition"
                    title={mode !== 'print' ? `${p.name} sayfasına git` : undefined}
                  >
                    <span className="font-sans font-medium text-neutral-800 group-hover:text-[#b4823c] transition truncate pr-2">
                      {p.name}
                    </span>
                    <span className="font-mono text-neutral-500 text-xs tracking-wider group-hover:text-[#b4823c] transition flex-shrink-0">
                      {pStartPage}
                    </span>
                  </button>
                );
              })}

              {/* Extra Core Sections */}
              <button
                type="button"
                onClick={() => mode !== 'print' && onSelectPage?.(3 + safeProducts.length * 2)}
                className="flex items-baseline justify-between border-b border-neutral-100 pb-1.5 group text-left w-full cursor-pointer hover:border-amber-400 transition"
              >
                <span className="font-sans font-medium text-neutral-800 group-hover:text-[#b4823c] transition">
                  Teknik Özellikler & Standartlar
                </span>
                <span className="font-mono text-neutral-500 text-xs tracking-wider group-hover:text-[#b4823c] transition">
                  {(4 + safeProducts.length * 2).toString().padStart(2, '0')}
                </span>
              </button>

              <button
                type="button"
                onClick={() => mode !== 'print' && onSelectPage?.(4 + safeProducts.length * 2)}
                className="flex items-baseline justify-between border-b border-neutral-100 pb-1.5 group text-left w-full cursor-pointer hover:border-amber-400 transition"
              >
                <span className="font-sans font-medium text-neutral-800 group-hover:text-[#b4823c] transition">
                  Kullanım Alanları & Mimari Çözümler
                </span>
                <span className="font-mono text-neutral-500 text-xs tracking-wider group-hover:text-[#b4823c] transition">
                  {(5 + safeProducts.length * 2).toString().padStart(2, '0')}
                </span>
              </button>

              <button
                type="button"
                onClick={() => mode !== 'print' && onSelectPage?.(5 + safeProducts.length * 2)}
                className="flex items-baseline justify-between border-b border-neutral-100 pb-1.5 group text-left w-full cursor-pointer hover:border-amber-400 transition"
              >
                <span className="font-sans font-medium text-neutral-800 group-hover:text-[#b4823c] transition">
                  İletişim & Showroom
                </span>
                <span className="font-mono text-neutral-500 text-xs tracking-wider group-hover:text-[#b4823c] transition">
                  {(6 + safeProducts.length * 2).toString().padStart(2, '0')}
                </span>
              </button>
            </div>
          </div>

          {/* Running Footer Page Number */}
          <div className="pt-8 flex justify-between items-center text-[10px] font-mono text-neutral-400">
            <span>{brand.name || 'SeramikBak'} &bull; İçindekiler</span>
            <span>{pageNum}</span>
          </div>
        </section>
      );
    }

    // -----------------------------------------------------------------------
    // 3. CORPORATE MANIFESTO & INNOVATION
    // -----------------------------------------------------------------------
    if (pageObj.type === 'manifesto') {
      return (
        <section
          key="manifesto"
          className="catalog-page relative bg-white text-neutral-900 p-8 sm:p-14 md:p-16 flex flex-col justify-between overflow-hidden"
        >
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-sans font-bold text-neutral-950 tracking-tight mb-8">
              {brand.name || 'SeramikBak'}: Tasarımda Yenilik ve Teknoloji
            </h2>

            <div className="space-y-4 text-xs sm:text-sm text-neutral-700 font-light leading-relaxed max-w-2xl">
              <p>
                Mimari mekanların ruhunu dönüştüren dev boyutlu porselen seramiklerimiz, ileri teknoloji ve üstün estetiğin kusursuz birleşimidir. Modern üretim altyapımızda üretilen 120×280 cm ve 60×120 cm plakalarımız, iç ve dış mekanlarda eksiz, ferah ve prestijli yüzeyler oluşturur.
              </p>
              <p>
                Sürdürülebilirlik odaklı yaklaşımımızla EPD ve GREENGUARD sertifikalı çevre dostu formüller geliştirmekteyiz. Hijyenik, leke tutmayan ve aşınmaya karşı yüksek dirençli porselen yüzeylerimiz, hem konut hem de yoğun ticari projelerde uzun yıllar ilk günkü zarafetini korur.
              </p>
              <p>
                Doğanın en nadide mermer damarlarından, endüstriyel brüt beton dokularına kadar uzanan zengin koleksiyonumuz, mimarlara ve tasarımcılara sınırsız bir yaratıcı özgürlük sunmaktadır.
              </p>
            </div>
          </div>

          {/* Architectural Factory / Production Vignette Image */}
          <div className="mt-8 mb-6 overflow-hidden rounded-none border border-neutral-200">
            <div className="aspect-[16/7] w-full overflow-hidden bg-neutral-100">
              <img
                src="/renders/modern_living_natural_oak.jpg"
                alt="Production & Studio"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Running Footer Page Number */}
          <div className="flex justify-between items-center text-[10px] font-mono text-neutral-400">
            <span>{brand.name || 'SeramikBak'} &bull; Kurumsal</span>
            <span>{pageNum}</span>
          </div>
        </section>
      );
    }

    // -----------------------------------------------------------------------
    // 4. PRODUCT LEFT PAGE — Ambient Scene, Wireframe Outlines & Technical Matrix (Page 6)
    // -----------------------------------------------------------------------
    if (pageObj.type === 'product_left') {
      const p = pageObj.product;
      const pAmbient = p.imageUrl || '/renders/modern_living_natural_oak.jpg';
      const mainDim = p.width && p.height ? `${p.width}x${p.height} cm` : '120x280 cm';
      const secDim = '60x120 cm';
      const thirdDim = '120x120 cm';

      return (
        <section
          key={`prod-left-${p.id || pageObj.index}`}
          className="catalog-page relative bg-[#fdfdfd] text-neutral-900 p-6 sm:p-10 md:p-12 flex flex-col justify-between overflow-hidden border border-neutral-200/60 shadow-xs"
        >
          <div className="space-y-5">
            {/* Top Architectural Header Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-200/80">
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded-md bg-[#b4823c]/15 text-[#b4823c] text-[10px] font-mono font-bold uppercase tracking-widest border border-[#b4823c]/30">
                  MİMARİ MONOGRAF &bull; {String(pageObj.index + 1).padStart(2, '0')}
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-neutral-950">
                  {p.name}
                </h2>
              </div>

              <div className="flex items-center gap-3">
                {p.badge && (
                  <span className="px-2.5 py-1 rounded bg-neutral-900 text-amber-400 text-[10px] font-mono font-bold uppercase tracking-wider">
                    {p.badge}
                  </span>
                )}
                {catalog?.showPrices && (p.customPrice || p.price) && (
                  <span className="px-3 py-1 rounded-lg bg-amber-50 border border-amber-200 text-xs font-extrabold text-amber-900">
                    {p.customPrice || p.price} {catalog?.sectionSettings?.prices?.currency || '₺'} / m²
                  </span>
                )}
                <span className="text-[11px] font-mono text-neutral-400 hidden sm:inline">
                  PORSELEN SLAB
                </span>
              </div>
            </div>

            {/* Ambient Interior Scene with Architectural Spatial Pins */}
            <div className="relative rounded-2xl overflow-hidden shadow-md border border-neutral-200/90 group bg-neutral-900 aspect-[16/9]">
              <img
                src={pAmbient}
                alt={`${p.name} Mekan`}
                onError={() => handleImgError(`ambient-${p.id}`)}
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

              {/* Architectural Spatial Pin 1 (Top Left) */}
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/20 text-white text-[10px] font-mono flex items-center gap-1.5 shadow-md">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span>[01] Zemin: {mainDim} &bull; {p.finish || 'Lappato'}</span>
              </div>

              {/* Architectural Spatial Pin 2 (Bottom Right) */}
              <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/20 text-white text-[10px] font-mono flex items-center gap-1.5 shadow-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>[02] Lazer Rektifiye (0.5 mm Derz)</span>
              </div>

              {/* Atmosphere Tag (Bottom Left) */}
              <div className="absolute bottom-3 left-3 text-white text-[10px] font-mono tracking-wider opacity-90 hidden sm:block">
                <span>DOĞAL IŞIK YANSIMASI &bull; SPATIAL MONOLITH</span>
              </div>
            </div>

            {/* Middle Row: Proportional Vector Wireframes & Modular Layouts */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center bg-neutral-50/80 p-3.5 rounded-xl border border-neutral-200/80">
              {/* Left Column: Proportional Dimension Outlines */}
              <div className="sm:col-span-7 flex items-end gap-5">
                {/* 120x280 Slab */}
                <div className="flex flex-col items-center">
                  <div
                    className="border-2 border-neutral-800 bg-white rounded-2xs shadow-2xs relative flex flex-col justify-between p-0.5"
                    style={{ width: '36px', height: '84px' }}
                    title={mainDim}
                  >
                    <span className="text-[7px] font-mono font-bold text-center text-neutral-800">6mm</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-neutral-800 mt-1 whitespace-nowrap">
                    {mainDim}
                  </span>
                  <span className="text-[8px] font-mono text-neutral-400">Dev Plaka</span>
                </div>

                {/* 120x120 Slab */}
                <div className="flex flex-col items-center">
                  <div
                    className="border border-neutral-500 bg-white rounded-2xs shadow-2xs relative flex flex-col justify-between p-0.5"
                    style={{ width: '36px', height: '36px' }}
                    title={thirdDim}
                  >
                    <span className="text-[7px] font-mono text-center text-neutral-600">9mm</span>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-700 mt-1 whitespace-nowrap">
                    {thirdDim}
                  </span>
                  <span className="text-[8px] font-mono text-neutral-400">Kare Zemin</span>
                </div>

                {/* 60x120 Standard Slab */}
                <div className="flex flex-col items-center">
                  <div
                    className="border border-neutral-500 bg-white rounded-2xs shadow-2xs relative flex flex-col justify-between p-0.5"
                    style={{ width: '22px', height: '44px' }}
                    title={secDim}
                  >
                    <span className="text-[7px] font-mono text-center text-neutral-600">9mm</span>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-700 mt-1 whitespace-nowrap">
                    {secDim}
                  </span>
                  <span className="text-[8px] font-mono text-neutral-400">Duvar & Zemin</span>
                </div>

                {/* Bookmatch Indicator */}
                <div className="flex flex-col items-center">
                  <div className="flex gap-0.5">
                    <div className="border border-amber-600/70 bg-amber-50/50 rounded-2xs" style={{ width: '16px', height: '38px' }} title="A" />
                    <div className="border border-amber-600/70 bg-amber-50/50 rounded-2xs" style={{ width: '16px', height: '38px' }} title="B" />
                  </div>
                  <span className="text-[10px] font-mono text-amber-800 mt-1 whitespace-nowrap font-bold">
                    Bookmatch
                  </span>
                  <span className="text-[8px] font-mono text-amber-600">Kelebek Damar</span>
                </div>
              </div>

              {/* Right Column: Modular Laying Schema Badges */}
              <div className="sm:col-span-5 flex flex-col justify-center space-y-1.5 pl-0 sm:pl-3 sm:border-l border-neutral-200 text-[10px] font-mono">
                <span className="font-bold text-neutral-800 uppercase tracking-wider">
                  MİMARİ DÖŞEME ŞEMALARI
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-2 py-0.5 rounded bg-white border border-neutral-200 text-neutral-700 font-semibold">
                    1/3 Kayan Derz
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white border border-neutral-200 text-neutral-700 font-semibold">
                    Monolitik Düz
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold">
                    Derz: 1.0 mm
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Section: Architectural Spec Matrix Table */}
            <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-100/90 text-neutral-800 font-mono text-[10px] uppercase border-b border-neutral-200">
                    <th className="py-2 px-3">POZ KODU</th>
                    <th className="py-2 px-3">EBAT (CM)</th>
                    <th className="py-2 px-3">KALINLIK</th>
                    <th className="py-2 px-3">YÜZEY BİTİŞİ</th>
                    <th className="py-2 px-3">AŞINMA / KAYMA</th>
                    <th className="py-2 px-3 text-right">REKTİFİYE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-sans text-[11px] text-neutral-700">
                  <tr className="hover:bg-amber-50/30 transition">
                    <td className="py-2 px-3 font-mono font-bold text-neutral-900">{p.sku || p.code || '55018167RP'}</td>
                    <td className="py-2 px-3 font-semibold">{p.width && p.height ? `${p.width}x${p.height}` : '120x280'}</td>
                    <td className="py-2 px-3">{p.thickness ? `${p.thickness} mm` : '6 mm'}</td>
                    <td className="py-2 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-amber-100/80 text-amber-900 font-bold text-[10px]">
                        {p.finish || 'Parlak Full Lappato'}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-mono font-semibold text-neutral-800">{p.peiRating ? `PEI ${p.peiRating}` : 'PEI IV'} &bull; {p.slipResistance || 'R10-A'}</td>
                    <td className="py-2 px-3 text-right text-emerald-700 font-bold">&check; 90° Lazer</td>
                  </tr>
                  <tr className="hover:bg-amber-50/30 transition bg-neutral-50/40">
                    <td className="py-2 px-3 font-mono font-bold text-neutral-900">{p.sku ? `${p.sku}-120` : '55018168RP'}</td>
                    <td className="py-2 px-3 font-semibold">120x120</td>
                    <td className="py-2 px-3">9 mm</td>
                    <td className="py-2 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-800 font-bold text-[10px]">
                        Mat İpeksi (Silk)
                      </span>
                    </td>
                    <td className="py-2 px-3 font-mono font-semibold text-neutral-800">PEI IV &bull; R10-B</td>
                    <td className="py-2 px-3 text-right text-emerald-700 font-bold">&check; 90° Lazer</td>
                  </tr>
                  <tr className="hover:bg-amber-50/30 transition">
                    <td className="py-2 px-3 font-mono font-bold text-neutral-900">{p.sku ? `${p.sku}-60` : '55018169RP'}</td>
                    <td className="py-2 px-3 font-semibold">60x120</td>
                    <td className="py-2 px-3">9 mm</td>
                    <td className="py-2 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-amber-100/80 text-amber-900 font-bold text-[10px]">
                        Full Lappato
                      </span>
                    </td>
                    <td className="py-2 px-3 font-mono font-semibold text-neutral-800">PEI IV &bull; R9</td>
                    <td className="py-2 px-3 text-right text-emerald-700 font-bold">&check; 90° Lazer</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Running Footer Page Number */}
          <div className="pt-4 flex justify-between items-center text-[10px] font-mono text-neutral-400 border-t border-neutral-100">
            <span>{brand.name || 'SeramikBak'} &bull; Mimari Monograf &bull; {p.name}</span>
            <span>Sayfa {pageNum}</span>
          </div>
        </section>
      );
    }

    if (pageObj.type === 'product_right') {
      const p = pageObj.product;
      const slabTexture = p.textureUrl || p.imageUrl || '/textures/calacatta_gold.jpg';
      const variations = getProductVariations(p, pageObj.index);

      return (
        <section
          key={`prod-right-${p.id || pageObj.index}`}
          className="catalog-page relative bg-[#fdfdfd] text-neutral-900 p-6 sm:p-10 md:p-12 flex flex-col justify-between overflow-hidden border border-neutral-200/60 shadow-xs"
        >
          {/* Top Running Category Header */}
          <div className="flex justify-between items-center pb-3 border-b border-neutral-200/80">
            <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-neutral-500">
              TAM BOY DİKEY SLAB &bull; MALZEME ANATOMİSİ
            </span>
            <span className="text-[10px] font-mono text-[#b4823c] font-bold">
              120&times;280 CM MONOLİTİK PLAKA
            </span>
          </div>

          {/* Main Visual Arena: Swatches on Left, Slab in Center, Margin Info on Right */}
          <div className="flex-1 flex items-center justify-between gap-4 my-auto py-2">
            {/* Left Column: Stacked Color Variations & Grout Match */}
            <div className="flex flex-col gap-4 justify-center pr-2 z-10 max-w-[130px]">
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block">
                RENK SEÇENEKLERİ
              </span>
              {variations.map((v, vIdx) => (
                <div key={vIdx} className="space-y-1">
                  <div
                    className="w-20 aspect-[3/4] rounded-lg border-2 border-neutral-200 overflow-hidden bg-neutral-100 shadow-sm hover:border-[#b4823c] transition-all cursor-pointer"
                    title={v.name}
                  >
                    <img
                      src={v.texture}
                      alt={v.name}
                      onError={() => handleImgError(`var-${p.id}-${vIdx}`)}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-[10px] font-sans font-bold text-neutral-800 block truncate">
                    {v.name}
                  </span>
                </div>
              ))}

              {/* Complementary Grout Recommendation */}
              <div className="pt-2 border-t border-neutral-200/80 space-y-1">
                <span className="text-[9px] font-mono text-neutral-400 block uppercase">ÖNERİLEN DERZ</span>
                <span className="text-[10px] font-sans font-bold text-neutral-800 block">
                  130 Jasmine / Bej
                </span>
                <span className="text-[9px] font-mono text-neutral-500 block">Derz Aralığı: 1.0 mm</span>
              </div>
            </div>

            {/* Central Giant Vertical Slab Showcase with 3D Bevel & Magnifier */}
            <div className="flex-1 flex justify-center items-center py-2 px-2 sm:px-6 relative">
              <div
                className="relative w-full max-w-[280px] sm:max-w-[340px] aspect-[1/2.35] rounded-lg overflow-hidden shadow-2xl border border-neutral-300 bg-neutral-900 group"
                style={{
                  boxShadow: '16px 24px 45px rgba(0,0,0,0.22), 4px 8px 16px rgba(0,0,0,0.1)'
                }}
              >
                <img
                  src={slabTexture}
                  alt={`${p.name} Tam Plaka`}
                  onError={() => handleImgError(`slab-${p.id}`)}
                  className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-700"
                />

                {/* Light reflection gradient for high-gloss porcelain slab feel */}
                <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/20 pointer-events-none" />

                {/* 1:1 Surface Magnifier Floating Circle */}
                <div className="absolute top-6 right-4 w-18 h-18 rounded-full border-2 border-white/80 shadow-2xl overflow-hidden bg-neutral-100 hidden sm:block">
                  <img
                    src={slabTexture}
                    alt="1:1 Doku Zoom"
                    className="w-full h-full object-cover scale-200 contrast-110"
                  />
                  <div className="absolute inset-0 ring-1 ring-black/20 rounded-full pointer-events-none" />
                  <span className="absolute bottom-1 inset-x-0 text-center text-[7px] font-mono font-bold bg-black/70 text-white uppercase tracking-wider">
                    1:1 YÜZEY
                  </span>
                </div>

                {/* Slab 3D Studio Bridge Button */}
                {mode !== 'print' && (
                  <a
                    href={`/urun/${p.slug || p.id}?studio=3d`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-neutral-950/90 hover:bg-[#b4823c] text-white text-xs font-extrabold flex items-center gap-2 shadow-xl backdrop-blur-md transition-all cursor-pointer z-20 group"
                    title="Bu seramiği 3D Sanal Stüdyoda inceleyin"
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    <span>Mekanında Canlı Gör</span>
                    <ExternalLink size={12} className="group-hover:translate-x-0.5 transition-transform" />
                  </a>
                )}
              </div>
            </div>

            {/* Right Margin: Technical Badges & Vertical Typography */}
            <div className="flex flex-col justify-between items-center pl-2 sm:pl-4 border-l border-neutral-200/80 h-full py-4">
              {/* Top Rotated Collection Name */}
              <div
                className="text-xs sm:text-sm font-serif font-bold uppercase tracking-[0.25em] text-neutral-900 select-none whitespace-nowrap"
                style={{
                  writingMode: 'vertical-rl',
                  transform: 'rotate(180deg)'
                }}
              >
                {p.name} &bull; 120&times;280 CM
              </div>

              {/* Material Quality Badges */}
              <div className="space-y-3 py-4 text-center">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex flex-col items-center justify-center text-[8px] font-mono font-bold text-amber-900 shadow-2xs">
                  <span>MOHS</span>
                  <span className="text-[10px] font-extrabold">7</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col items-center justify-center text-[8px] font-mono font-bold text-emerald-900 shadow-2xs">
                  <span>SU EMME</span>
                  <span className="text-[9px] font-extrabold">&le;%0.05</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex flex-col items-center justify-center text-[8px] font-mono font-bold text-purple-900 shadow-2xs">
                  <span>LEKE</span>
                  <span className="text-[10px] font-extrabold">SNF 5</span>
                </div>
              </div>

              {/* Bottom Rotated Collection Tag */}
              <div
                className="text-[9px] font-mono uppercase tracking-[0.2em] text-neutral-400 select-none whitespace-nowrap"
                style={{
                  writingMode: 'vertical-rl',
                  transform: 'rotate(180deg)'
                }}
              >
                {collectionTag}
              </div>
            </div>
          </div>

          {/* Running Footer Page Number */}
          <div className="pt-4 flex justify-between items-center text-[10px] font-mono text-neutral-400 border-t border-neutral-100">
            <span>&copy; {new Date().getFullYear()} {brand.name || 'SeramikBak'} &bull; Lüks Porselen Plaka Serisi</span>
            <span>Sayfa {pageNum}</span>
          </div>
        </section>
      );
    }
    // -----------------------------------------------------------------------
    // 6. TECHNICAL STANDARDS PAGE (TS EN 14411 BIA & BIM Matrix)
    // -----------------------------------------------------------------------
    if (pageObj.type === 'technical_standards') {
      return (
        <section
          key="standards"
          className="catalog-page relative bg-white text-neutral-900 p-8 sm:p-14 md:p-16 flex flex-col justify-between overflow-hidden"
        >
          <div>
            <div className="text-[10px] sm:text-[11px] font-sans font-bold tracking-[0.2em] uppercase text-neutral-500 mb-2">
              TS EN 14411 &bull; BIA GRUBU
            </div>
            <h2 className="text-3xl sm:text-4xl font-sans font-bold text-neutral-950 tracking-tight mb-8">
              Teknik Özellikler & Test Standartları
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl text-neutral-800">
              <div className="p-4 bg-[#f8fafc] border border-neutral-200">
                <span className="text-[10px] font-mono text-neutral-500 uppercase block">Ebat Toleransı</span>
                <p className="text-sm font-bold text-neutral-950 mt-1">± %0.1 (Lazer)</p>
                <p className="text-[11px] text-neutral-500 mt-1">ISO 10545-2</p>
              </div>

              <div className="p-4 bg-[#f8fafc] border border-neutral-200">
                <span className="text-[10px] font-mono text-neutral-500 uppercase block">Su Emme</span>
                <p className="text-sm font-bold text-neutral-950 mt-1">E ≤ %0.05</p>
                <p className="text-[11px] text-neutral-500 mt-1">ISO 10545-3</p>
              </div>

              <div className="p-4 bg-[#f8fafc] border border-neutral-200">
                <span className="text-[10px] font-mono text-neutral-500 uppercase block">Kırılma Dayanımı</span>
                <p className="text-sm font-bold text-neutral-950 mt-1">≥ 2500 N</p>
                <p className="text-[11px] text-neutral-500 mt-1">ISO 10545-4</p>
              </div>

              <div className="p-4 bg-[#f8fafc] border border-neutral-200">
                <span className="text-[10px] font-mono text-neutral-500 uppercase block">Eğilme Mukavemeti</span>
                <p className="text-sm font-bold text-neutral-950 mt-1">≥ 50 N/mm²</p>
                <p className="text-[11px] text-neutral-500 mt-1">ISO 10545-4</p>
              </div>

              <div className="p-4 bg-[#f8fafc] border border-neutral-200">
                <span className="text-[10px] font-mono text-neutral-500 uppercase block">Aşınma Direnci</span>
                <p className="text-sm font-bold text-neutral-950 mt-1">PEI 4 - 5</p>
                <p className="text-[11px] text-neutral-500 mt-1">ISO 10545-7</p>
              </div>

              <div className="p-4 bg-[#f8fafc] border border-neutral-200">
                <span className="text-[10px] font-mono text-neutral-500 uppercase block">Kaymazlık</span>
                <p className="text-sm font-bold text-neutral-950 mt-1">R9 / R10 / R11</p>
                <p className="text-[11px] text-neutral-500 mt-1">DIN 51130</p>
              </div>

              <div className="p-4 bg-[#f8fafc] border border-neutral-200">
                <span className="text-[10px] font-mono text-neutral-500 uppercase block">Dona Dayanıklılık</span>
                <p className="text-sm font-bold text-neutral-950 mt-1">Tam Dayanıklı</p>
                <p className="text-[11px] text-neutral-500 mt-1">ISO 10545-12</p>
              </div>

              <div className="p-4 bg-[#f8fafc] border border-neutral-200">
                <span className="text-[10px] font-mono text-neutral-500 uppercase block">Leke Direnci</span>
                <p className="text-sm font-bold text-neutral-950 mt-1">Sınıf 5 (Maksimum)</p>
                <p className="text-[11px] text-neutral-500 mt-1">ISO 10545-14</p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-neutral-200 flex justify-between items-center text-[10px] font-mono text-neutral-400">
            <span>Uluslararası Kalite & BIM Şartname Standartları</span>
            <span>{pageNum}</span>
          </div>
        </section>
      );
    }

    // -----------------------------------------------------------------------
    // 7. APPLICATION AREAS (Kullanım Alanları)
    // -----------------------------------------------------------------------
    if (pageObj.type === 'application_areas') {
      return (
        <section
          key="application"
          className="catalog-page relative bg-white text-neutral-900 p-8 sm:p-14 md:p-16 flex flex-col justify-between overflow-hidden"
        >
          <div>
            <div className="text-[10px] sm:text-[11px] font-sans font-bold tracking-[0.2em] uppercase text-neutral-500 mb-2">
              MİMARİ ÇÖZÜMLER
            </div>
            <h2 className="text-3xl sm:text-4xl font-sans font-bold text-neutral-950 tracking-tight mb-8">
              Kullanım Alanları
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl">
              <div className="border border-neutral-200 bg-white overflow-hidden group">
                <div className="aspect-[16/10] overflow-hidden bg-neutral-100">
                  <img
                    src="/renders/luxury_bathroom_calacatta_gold.jpg"
                    alt="Banyo"
                    className="w-full h-full object-cover group-hover:scale-102 transition duration-500"
                  />
                </div>
                <div className="p-4">
                  <h4 className="text-sm font-bold text-neutral-950">Banyo & Islak Hacimler</h4>
                  <p className="text-xs text-neutral-500 mt-1">Suya ve kimyasallara tam dayanıklı, hijyenik ve kaymaz yüzeyler.</p>
                </div>
              </div>

              <div className="border border-neutral-200 bg-white overflow-hidden group">
                <div className="aspect-[16/10] overflow-hidden bg-neutral-100">
                  <img
                    src="/textures/sample_kitchen.png"
                    alt="Mutfak"
                    className="w-full h-full object-cover group-hover:scale-102 transition duration-500"
                  />
                </div>
                <div className="p-4">
                  <h4 className="text-sm font-bold text-neutral-950">Mutfak & Tezgah Arası</h4>
                  <p className="text-xs text-neutral-500 mt-1">Isıya dayanıklı, leke tutmaz, kolay temizlenen estetik plakalar.</p>
                </div>
              </div>

              <div className="border border-neutral-200 bg-white overflow-hidden group">
                <div className="aspect-[16/10] overflow-hidden bg-neutral-100">
                  <img
                    src="/renders/modern_living_natural_oak.jpg"
                    alt="Salon"
                    className="w-full h-full object-cover group-hover:scale-102 transition duration-500"
                  />
                </div>
                <div className="p-4">
                  <h4 className="text-sm font-bold text-neutral-950">Salon & Geniş Yaşam Alanları</h4>
                  <p className="text-xs text-neutral-500 mt-1">120x280 cm dev formatla minimum derz, maksimum ferahlık.</p>
                </div>
              </div>

              <div className="border border-neutral-200 bg-white overflow-hidden group">
                <div className="aspect-[16/10] overflow-hidden bg-neutral-100">
                  <img
                    src="/renders/luxury_bathroom_loft_beton.jpg"
                    alt="Dış Cephe"
                    className="w-full h-full object-cover group-hover:scale-102 transition duration-500"
                  />
                </div>
                <div className="p-4">
                  <h4 className="text-sm font-bold text-neutral-950">Dış Cephe, Teras & Ticari Alanlar</h4>
                  <p className="text-xs text-neutral-500 mt-1">UV ışınlarına ve dona dayanıklı, yüksek mukavemetli porselen kaplama.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-neutral-200 flex justify-between items-center text-[10px] font-mono text-neutral-400">
            <span>{brand.name || 'SeramikBak'} &bull; Kullanım Alanları</span>
            <span>{pageNum}</span>
          </div>
        </section>
      );
    }

    // -----------------------------------------------------------------------
    // 8. 3D DIGITAL CATALOG & AR SIMULATOR
    // -----------------------------------------------------------------------
    if (pageObj.type === 'digital_3d') {
      return (
        <section
          key="digital3d"
          className="catalog-page relative bg-[#181b1e] text-white p-8 sm:p-14 md:p-16 flex flex-col justify-between overflow-hidden"
        >
          <div className="my-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center max-w-4xl mx-auto">
            <div className="md:col-span-7 space-y-4">
              <span className="text-[10px] font-mono tracking-[0.25em] text-amber-400 uppercase font-bold">
                DİJİTAL STÜDYO & 3D AR
              </span>
              <h2 className="text-2xl sm:text-4xl font-serif font-light text-white leading-tight">
                Koleksiyonumuzu 3D Olarak Mekânınızda Deneyin
              </h2>
              <p className="text-xs sm:text-sm text-neutral-300 font-light leading-relaxed">
                Akıllı telefonunuzun kamerasıyla QR kodu okutarak dilediğiniz seramiği salonunuzda, banyonuzda veya mutfağınızda canlı olarak görselleştirin.
              </p>
              <div className="pt-2 flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-white p-1.5 flex items-center justify-center text-neutral-950">
                  <QrCode size={52} />
                </div>
                <div className="text-xs text-neutral-300">
                  <p className="font-bold text-white">Akıllı Telefonunuzla Okutun</p>
                  <p className="text-neutral-400 text-[11px]">Anında 3D simülasyona bağlanın</p>
                </div>
              </div>
            </div>

            <div className="md:col-span-5 flex justify-center">
              <div className="w-56 h-80 rounded-2xl overflow-hidden border border-white/20 shadow-2xl relative bg-neutral-900">
                <img
                  src={safeProducts[0]?.imageUrl || '/renders/luxury_bathroom_calacatta_gold.jpg'}
                  alt="3D Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                <div className="absolute bottom-4 left-4 right-4 text-center">
                  <span className="px-3 py-1 rounded-full bg-amber-500 text-neutral-950 font-bold text-[10px] uppercase tracking-wider">
                    3D Canlı Görselleştirme
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 flex justify-between items-center text-[10px] font-mono text-neutral-400">
            <span>SeramikBak Dijital AR Çözümleri</span>
            <span>{pageNum}</span>
          </div>
        </section>
      );
    }

    // -----------------------------------------------------------------------
    // 9. BACK COVER / CONTACT PAGE
    // -----------------------------------------------------------------------
    if (pageObj.type === 'contact') {
      return (
        <section
          key="contact"
          className="catalog-page relative bg-[#23272a] text-white p-8 sm:p-14 md:p-16 flex flex-col justify-between overflow-hidden select-none"
        >
          {/* Top Brand Logo */}
          <div className="flex justify-between items-center border-b border-white/10 pb-6">
            <span className="text-sm font-sans font-bold tracking-[0.2em] uppercase text-white">
              {brand.name || 'SERAMİKBAK'}
            </span>
            <span className="text-[10px] font-mono tracking-widest text-neutral-400">
              {collectionTag}
            </span>
          </div>

          {/* Center Contact & Showroom Matrix */}
          <div className="my-auto max-w-xl space-y-6">
            <h3 className="text-xl sm:text-2xl font-sans font-bold text-white tracking-tight">
              İletişim & Mimari Proje Destek
            </h3>

            <div className="space-y-4 text-xs sm:text-sm text-neutral-300">
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-amber-400 flex-shrink-0" />
                <span>{catalog?.contactPhone || '+90 (212) 555 00 00'}</span>
              </div>

              <div className="flex items-center gap-3">
                <Mail size={16} className="text-amber-400 flex-shrink-0" />
                <span>{catalog?.contactEmail || 'proje@seramikbak.com'}</span>
              </div>

              <div className="flex items-center gap-3">
                <Globe size={16} className="text-amber-400 flex-shrink-0" />
                <span>{catalog?.websiteUrl || 'www.seramikbak.com'}</span>
              </div>

              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <span>
                  {catalog?.contactAddress || 'Büyükdere Cad. No:192, Levent / İstanbul'}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom QR & Copyright */}
          <div className="pt-6 border-t border-white/10 flex justify-between items-center text-[10px] font-mono text-neutral-400">
            <span>&copy; {new Date().getFullYear()} {brand.name || 'SeramikBak'}. Tüm hakları saklıdır.</span>
            <span>{pageNum}</span>
          </div>
        </section>
      );
    }

    return null;
  };

  // -------------------------------------------------------------------------
  // VIEW FORMAT HANDLING: 'single' | 'spread' | 'all'
  // -------------------------------------------------------------------------
  if (viewFormat === 'single') {
    return (
      <div className="w-full flex justify-center">
        {renderSinglePage(pages[activePageIndex] || pages[0], activePageIndex)}
      </div>
    );
  }

  if (viewFormat === 'spread') {
    // Determine 2 pages to show side by side
    // If activePageIndex is cover (0), show just cover centered.
    // If activePageIndex > 0, show paired pages (even + odd).
    const isCover = activePageIndex === 0;
    if (isCover) {
      return (
        <div className="w-full flex justify-center">
          {renderSinglePage(pages[0], 0)}
        </div>
      );
    }

    const leftIdx = activePageIndex % 2 === 1 ? activePageIndex : activePageIndex - 1;
    const rightIdx = leftIdx + 1;

    return (
      <div className="w-full flex flex-col md:flex-row items-center justify-center gap-4 lg:gap-6">
        <div className="w-full md:w-1/2 flex justify-end">
          {renderSinglePage(pages[leftIdx], leftIdx)}
        </div>
        <div className="w-full md:w-1/2 flex justify-start">
          {rightIdx < pages.length && renderSinglePage(pages[rightIdx], rightIdx)}
        </div>
      </div>
    );
  }

  // View format: all (continuous vertical scroll)
  return (
    <div className="w-full flex flex-col gap-10 items-center">
      {pages.map((p, idx) => renderSinglePage(p, idx))}
    </div>
  );
}
