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
  ArrowRight,
  Layers,
  Palette,
  Box,
  ShieldCheck,
  Ruler
} from 'lucide-react';

export default function LidyaTechnicTemplate({
  catalog,
  products = [],
  mode = 'preview',
  activePageIndex = 0,
  viewFormat = 'single'
}) {
  const brand = catalog?.brand || {};
  const logo = catalog?.customLogoUrl || brand.logoUrl;
  const isLandscape = catalog?.orientation === 'landscape';

  const [imgErrors, setImgErrors] = useState({});

  const handleImgError = (id) => {
    setImgErrors((prev) => ({ ...prev, [id]: true }));
  };

  // Safe products array
  const safeProducts = products && products.length > 0 ? products : [
    {
      id: 'demo-1',
      name: 'Lidya Matrix Calacatta',
      sku: 'LID-CAL-60120',
      color: 'Beyaz / Gri',
      finish: 'Mat Rektifiye',
      width: 60,
      height: 120,
      thickness: '9',
      rectified: true,
      slipResistance: 'R10A',
      peiRating: '4',
      imageUrl: '/renders/luxury_bathroom_calacatta_gold.jpg',
      textureUrl: '/textures/calacatta_gold.jpg',
      description: 'Mimari şartname ve BIM standartlarında üretilen, yüksek aşınma dirençli modüler porselen karo serisi.'
    },
    {
      id: 'demo-2',
      name: 'Lidya Urban Concrete',
      sku: 'LID-CON-6060',
      color: 'Açık Gri',
      finish: 'Mat Endüstriyel',
      width: 60,
      height: 60,
      thickness: '10',
      rectified: true,
      slipResistance: 'R11B',
      peiRating: '5',
      imageUrl: '/renders/luxury_bathroom_loft_beton.jpg',
      textureUrl: '/textures/loft_beton.jpg',
      description: 'Yoğun yaya trafiğine, kimyasallara ve dona tam dayanıklı endüstriyel ve ticari zemin porseleni.'
    }
  ];

  // VitrA PRO Technic architectural RAL colour palette
  const COLOR_PALETTE = {
    dark: [
      { name: 'Anthracite / Antrasit', ral: 'RAL 000 40 00', hex: '#374151' },
      { name: 'Midnight Blue / Gece Mavisi', ral: 'RAL 290 20 30', hex: '#1e293b' },
      { name: 'Pine / Orman Yeşili', ral: 'RAL 6012', hex: '#164e63' },
      { name: 'Oxide Red / Oksit Kırmızı', ral: 'RAL 3009', hex: '#7f1d1d' },
      { name: 'Black / Siyah', ral: 'RAL 000 15 00', hex: '#111827' }
    ],
    accents: [
      { name: 'Coral / Mercan', ral: 'RAL 3016', hex: '#c2410c' },
      { name: 'Turmeric / Hardal Sarı', ral: 'RAL 075 60 60', hex: '#d97706' },
      { name: 'Lush Green / Çimen Yeşili', ral: 'RAL 150 50 30', hex: '#15803d' },
      { name: 'Azure / Okyanus Mavi', ral: 'RAL 260 50 30', hex: '#0284c7' }
    ],
    light: [
      { name: 'Rose Cream / Somon', ral: 'RAL 050 70 20', hex: '#fed7aa' },
      { name: 'Sand Yellow / Açık Sarı', ral: 'RAL 1002', hex: '#fde68a' },
      { name: 'Pool Blue / Havuz Mavisi', ral: 'RAL 230 70 15', hex: '#7dd3fc' },
      { name: 'Light Grey / Açık Gri', ral: 'RAL 7047', hex: '#d1d5db' },
      { name: 'Ultrawhite / Ultra Beyaz', ral: 'RAL 9016', hex: '#ffffff' }
    ]
  };

  // =========================================================================
  // PAGE COMPILATION PIPELINE (VitrA PRO Technic Architecture)
  // =========================================================================
  const pages = [];

  // Page 1: Architectural Full-Bleed Cover (VitrA PRO Technic Page 1)
  if (catalog?.showCover !== false) {
    pages.push({ type: 'cover' });
  }

  // Page 2: Corporate & System Architecture (VitrA PRO Page 2)
  pages.push({ type: 'system' });

  // Page 3: Technical Index / İçindekiler (VitrA PRO Page 3)
  if (catalog?.showTOC !== false) {
    pages.push({ type: 'toc' });
  }

  // Page 4: Colour Engineering / Renk Mühendisliği (VitrA PRO Page 6 & 10)
  pages.push({ type: 'color_engineering' });

  // Product Technical Pages
  safeProducts.forEach((p, idx) => {
    pages.push({ type: 'product', product: p, index: idx });
  });

  // Dedicated Section: Technical Standards & Slip Resistance Matrix (VitrA PRO Page 44 & 84)
  if (catalog?.showSpecs !== false) {
    pages.push({ type: 'technical_standards' });
  }

  // Dedicated Section: Digital BIM & 3D Tools
  if (catalog?.showQrCodes !== false) {
    pages.push({ type: 'digital_bim' });
  }

  // Final Page: Project Desk & Contacts
  if (catalog?.showContactPage !== false) {
    pages.push({ type: 'contact' });
  }

  // =========================================================================
  // PAGE RENDERER
  // =========================================================================
  const renderSinglePage = (pageObj, pageIndex) => {
    if (!pageObj) return null;
    const pageNum = (pageIndex + 1).toString().padStart(2, '0');
    const catalogTitle = catalog?.title || 'Lidya Pro Technic';

    // -----------------------------------------------------------------------
    // 1. COVER PAGE — Dark Architectural Tile Vignette (VitrA Page 1 Standard)
    // -----------------------------------------------------------------------
    if (pageObj.type === 'cover') {
      const coverBg =
        products[0]?.imageUrl ||
        '/renders/luxury_bathroom_albatros_antrasit.jpg';

      return (
        <section
          key="cover"
          className="catalog-page relative text-white overflow-hidden flex flex-col justify-between select-none"
          style={{ backgroundColor: '#111317' }}
        >
          {/* Architectural Background Photography */}
          <div className="absolute inset-0 z-0">
            <img
              src={coverBg}
              alt="Lidya Technic Background"
              className="w-full h-full object-cover object-center filter brightness-50"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/70" />
          </div>

          {/* Top Brand Logo Header */}
          <div className="relative z-10 p-8 sm:p-14 md:p-16 flex justify-between items-center">
            {logo && !imgErrors['logo-cover'] ? (
              <img
                src={logo}
                alt={brand.name || 'Brand'}
                onError={() => handleImgError('logo-cover')}
                className="h-10 sm:h-12 max-w-[220px] object-contain filter brightness-0 invert"
              />
            ) : (
              <div className="text-xl sm:text-2xl font-sans font-light tracking-[0.3em] uppercase text-white">
                {brand.name || 'LİDYA'}
              </div>
            )}
            <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase">
              PRO ARCHITECTURAL
            </span>
          </div>

          {/* Center Title Block */}
          <div className="relative z-10 px-8 sm:px-14 md:px-16 text-center my-auto">
            <div className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-200 mb-4">
              MODÜLER SERAMİK SİSTEMLERİ &bull; MODULAR TILE SYSTEMS
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-sans font-light text-white tracking-tight uppercase">
              {catalog?.coverTitle || 'Lidya Pro Technic'}
            </h1>

            <p className="text-xs sm:text-sm text-neutral-300 font-light max-w-lg mx-auto mt-4 leading-relaxed">
              {catalog?.coverSubtitle || catalog?.introText || 'Mimari Şartname, Renk Mühendisliği & Modüler Zemin Çözümleri'}
            </p>
          </div>

          {/* Bottom Running Footer */}
          <div className="relative z-10 p-8 sm:p-14 md:p-16 border-t border-white/10 flex justify-between items-end text-neutral-400">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest block text-neutral-300">
                PRO TECHNIC ARCHITECTURE
              </span>
              <span className="text-[11px] text-neutral-400">
                {catalog?.websiteUrl || 'www.seramikbak.com'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono tracking-widest text-neutral-300">
                {new Date().getFullYear()} - {new Date().getFullYear() + 1}
              </span>
            </div>
          </div>
        </section>
      );
    }

    // -----------------------------------------------------------------------
    // 2. SYSTEM ARCHITECTURE & 4 DOMAINS (VitrA PRO Page 2 Standard)
    // -----------------------------------------------------------------------
    if (pageObj.type === 'system') {
      return (
        <section
          key="system"
          className="catalog-page relative bg-[#f4f2ee] text-neutral-900 p-8 sm:p-14 md:p-16 flex flex-col justify-between overflow-hidden"
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start my-auto">
            {/* Left Column: Big Bold Typography & Manifesto */}
            <div className="md:col-span-5 space-y-6">
              <h2 className="text-4xl sm:text-6xl font-sans font-extrabold tracking-tight text-neutral-950">
                LİDYA
              </h2>

              <div className="space-y-4 text-xs sm:text-sm text-neutral-700 font-light leading-relaxed">
                <p className="font-normal text-neutral-900">
                  Lidya Pro Technic, mimarlara ve iç mimarlara ilham verecek, projelerin tüm teknik ve estetik gereksinimlerini karşılayan modüler seramik koleksiyonudur.
                </p>
                <p>
                  Doğal malzeme dokularından teknik aşınma dayanımlı ticari zeminlere kadar uzanan dört ana segment; renk mühendisliği, kaymazlık sınıfları (R9-R12) ve zengin modüler ebat seçenekleriyle bir araya getirilmiştir.
                </p>
                <p className="text-neutral-500 text-[11px] font-mono">
                  Enriching architectural living spaces through precise colour engineering, modular geometry, and ISO 10545 compliant durability standards.
                </p>
              </div>
            </div>

            {/* Right Column: 4 Segment Cards with Visual Vignettes (Page 2) */}
            <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-white border border-neutral-200 shadow-xs">
                <div className="aspect-[16/10] overflow-hidden bg-neutral-100 mb-3">
                  <img
                    src="/renders/modern_living_natural_oak.jpg"
                    alt="Lidya Nature"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h4 className="text-sm font-bold text-neutral-950">Lidya Nature</h4>
                <p className="text-[11px] text-neutral-600 mt-1">Doğal malzeme dokulu karolar / Mermer, taş, beton ve ahşap dokuları.</p>
              </div>

              <div className="p-4 bg-white border border-neutral-200 shadow-xs">
                <div className="aspect-[16/10] overflow-hidden bg-neutral-100 mb-3">
                  <img
                    src="/renders/luxury_bathroom_calacatta_gold.jpg"
                    alt="Lidya Residence"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h4 className="text-sm font-bold text-neutral-950">Lidya Residence</h4>
                <p className="text-[11px] text-neutral-600 mt-1">Ev ve iç yaşam alanları için özel tasarlanmış koleksiyonlar.</p>
              </div>

              <div className="p-4 bg-white border border-neutral-200 shadow-xs">
                <div className="aspect-[16/10] overflow-hidden bg-neutral-100 mb-3">
                  <img
                    src="/renders/luxury_bathroom_loft_beton.jpg"
                    alt="Lidya Technic"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h4 className="text-sm font-bold text-neutral-950">Lidya Technic</h4>
                <p className="text-[11px] text-neutral-600 mt-1">Renkler, yüzeyler, fullbody porselenler ve teknik çözümler.</p>
              </div>

              <div className="p-4 bg-white border border-neutral-200 shadow-xs">
                <div className="aspect-[16/10] overflow-hidden bg-neutral-100 mb-3">
                  <img
                    src="/renders/luxury_bathroom_albatros_antrasit.jpg"
                    alt="Lidya Pool"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h4 className="text-sm font-bold text-neutral-950">Lidya Pool & Facade</h4>
                <p className="text-[11px] text-neutral-600 mt-1">Havuz içi ve çevresi, yüksek kayma dirençli porselen karolar.</p>
              </div>
            </div>
          </div>

          {/* Running Footer */}
          <div className="pt-6 border-t border-neutral-300 flex justify-between items-center text-[10px] font-mono text-neutral-500">
            <span>{brand.name || 'Lidya'} &bull; Sistem Mimarisi</span>
            <span>{pageNum}</span>
          </div>
        </section>
      );
    }

    // -----------------------------------------------------------------------
    // 3. TABLE OF CONTENTS — Index with Isometric Art Composition (VitrA Page 3)
    // -----------------------------------------------------------------------
    if (pageObj.type === 'toc') {
      return (
        <section
          key="toc"
          className="catalog-page relative bg-white text-neutral-900 p-8 sm:p-14 md:p-16 flex flex-col justify-between overflow-hidden"
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center my-auto">
            {/* Left Column: Index Directory */}
            <div className="md:col-span-7">
              <h2 className="text-3xl sm:text-4xl font-sans font-bold text-neutral-950 tracking-tight">
                Index <span className="text-neutral-400 font-light text-2xl">/ İçindekiler</span>
              </h2>

              <div className="mt-8 space-y-4 max-w-md text-xs sm:text-sm">
                <div className="border-b border-neutral-200 pb-2">
                  <div className="flex justify-between font-bold text-neutral-900">
                    <span>Colour engineering / Renk mühendisliği</span>
                    <span className="font-mono text-neutral-500">04</span>
                  </div>
                  <span className="text-[11px] text-neutral-500">RAL renk paleti, aksan tonlar ve yüzey dengesi</span>
                </div>

                <div className="border-b border-neutral-200 pb-2">
                  <div className="flex justify-between font-bold text-neutral-900">
                    <span>Forms & shapes / Formlar ve şekiller</span>
                    <span className="font-mono text-neutral-500">05</span>
                  </div>
                  <span className="text-[11px] text-neutral-500">Modüler ebatlar, metro karolar ve rölöf yüzeyler</span>
                </div>

                {safeProducts.map((p, idx) => (
                  <div key={p.id || idx} className="border-b border-neutral-200 pb-2">
                    <div className="flex justify-between font-bold text-neutral-900">
                      <span>{p.name} / Modüler Seri</span>
                      <span className="font-mono text-neutral-500">
                        {(6 + idx).toString().padStart(2, '0')}
                      </span>
                    </div>
                    <span className="text-[11px] text-neutral-500">
                      {p.finish || 'Mat Rektifiye'} &bull; {p.slipResistance || 'R10'} &bull; PEI {p.peiRating || '4'}
                    </span>
                  </div>
                ))}

                <div className="border-b border-neutral-200 pb-2">
                  <div className="flex justify-between font-bold text-neutral-900">
                    <span>Technical information / Teknik bilgiler</span>
                    <span className="font-mono text-neutral-500">
                      {(6 + safeProducts.length).toString().padStart(2, '0')}
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-500">TS EN 14411 BIA, DIN 51130 kaymazlık matrisi</span>
                </div>

                <div className="border-b border-neutral-200 pb-2">
                  <div className="flex justify-between font-bold text-neutral-900">
                    <span>Digital BIM & Contacts / İletişim</span>
                    <span className="font-mono text-neutral-500">
                      {(7 + safeProducts.length).toString().padStart(2, '0')}
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-500">CAD/BIM indirme ve mimari proje destek masası</span>
                </div>
              </div>
            </div>

            {/* Right Column: Isometric Ceramic Art Vignette */}
            <div className="md:col-span-5 flex justify-center">
              <div className="relative w-full max-w-[320px] aspect-square rounded-2xl overflow-hidden border border-neutral-300 shadow-xl bg-neutral-100 flex items-center justify-center p-4">
                <div className="grid grid-cols-3 gap-2 w-full h-full">
                  <div className="bg-[#b45309] rounded-sm opacity-90 shadow-xs" />
                  <div className="bg-[#1e293b] rounded-sm opacity-95 shadow-xs" />
                  <div className="bg-[#0284c7] rounded-sm opacity-85 shadow-xs" />
                  <div className="bg-[#15803d] rounded-sm opacity-90 shadow-xs" />
                  <div className="bg-[#f59e0b] rounded-sm opacity-90 shadow-xs" />
                  <div className="bg-[#334155] rounded-sm opacity-95 shadow-xs" />
                  <div className="bg-[#d97706] rounded-sm opacity-90 shadow-xs" />
                  <div className="bg-[#64748b] rounded-sm opacity-90 shadow-xs" />
                  <div className="bg-[#0f172a] rounded-sm opacity-95 shadow-xs" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/20 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-neutral-200 flex justify-between items-center text-[10px] font-mono text-neutral-400">
            <span>{brand.name || 'Lidya'} &bull; Fihrist</span>
            <span>{pageNum}</span>
          </div>
        </section>
      );
    }

    // -----------------------------------------------------------------------
    // 4. COLOUR ENGINEERING / RENK MÜHENDİSLİĞİ (VitrA Pages 6 & 10)
    // -----------------------------------------------------------------------
    if (pageObj.type === 'color_engineering') {
      return (
        <section
          key="color_engineering"
          className="catalog-page relative bg-[#f9f8f5] text-neutral-900 p-8 sm:p-14 md:p-16 flex flex-col justify-between overflow-hidden"
        >
          <div>
            <div className="flex justify-between items-baseline mb-6">
              <div>
                <h2 className="text-3xl sm:text-4xl font-sans font-extrabold tracking-tight text-neutral-950">
                  Colour engineering
                </h2>
                <span className="text-sm font-sans font-medium text-neutral-500">
                  Renk mühendisliği &bull; Architectural Colour Palette
                </span>
              </div>
              <span className="text-xs font-mono text-neutral-400 font-bold uppercase hidden sm:block">
                RAL ENTEGRASYONLU
              </span>
            </div>

            {/* Palette Grid Sections: Koyu, Aksan, Açık */}
            <div className="space-y-6 max-w-4xl">
              {/* 1. Dark Colours */}
              <div>
                <span className="text-xs font-bold text-neutral-700 tracking-wider uppercase block mb-3">
                  Dark colours / Koyu renkler
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {COLOR_PALETTE.dark.map((c, i) => (
                    <div key={i} className="flex flex-col">
                      <div
                        className="w-full aspect-[4/3] border border-neutral-300 shadow-xs"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span className="text-[11px] font-bold text-neutral-900 mt-1.5 truncate">
                        {c.name}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-500">
                        {c.ral}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Accent Colours */}
              <div>
                <span className="text-xs font-bold text-neutral-700 tracking-wider uppercase block mb-3">
                  Accents / Aksan renkler
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {COLOR_PALETTE.accents.map((c, i) => (
                    <div key={i} className="flex flex-col">
                      <div
                        className="w-full aspect-[4/3] border border-neutral-300 shadow-xs"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span className="text-[11px] font-bold text-neutral-900 mt-1.5 truncate">
                        {c.name}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-500">
                        {c.ral}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Light Colours */}
              <div>
                <span className="text-xs font-bold text-neutral-700 tracking-wider uppercase block mb-3">
                  Light colours / Açık renkler
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {COLOR_PALETTE.light.map((c, i) => (
                    <div key={i} className="flex flex-col">
                      <div
                        className="w-full aspect-[4/3] border border-neutral-300 shadow-xs"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span className="text-[11px] font-bold text-neutral-900 mt-1.5 truncate">
                        {c.name}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-500">
                        {c.ral}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-neutral-300 flex justify-between items-center text-[10px] font-mono text-neutral-400">
            <span>{brand.name || 'Lidya'} &bull; Renk Mühendisliği</span>
            <span>{pageNum}</span>
          </div>
        </section>
      );
    }

    // -----------------------------------------------------------------------
    // 5. PRODUCT TECHNICAL PAGE — Modular Forms & Engineering Matrix (VitrA Pages 28 & 44)
    // -----------------------------------------------------------------------
    if (pageObj.type === 'product') {
      const p = pageObj.product;
      const pImage = p.imageUrl || p.textureUrl || '/renders/luxury_bathroom_calacatta_gold.jpg';
      const mainDim = p.width && p.height ? `${p.width}x${p.height} cm` : '60x120 cm';

      return (
        <section
          key={`prod-${p.id || pageObj.index}`}
          className="catalog-page relative bg-white text-neutral-900 p-6 sm:p-12 md:p-14 flex flex-col justify-between overflow-hidden"
        >
          <div>
            {/* Top Running Header */}
            <div className="flex justify-between items-center pb-3 border-b border-neutral-200 mb-6 text-xs text-neutral-500 font-sans">
              <span className="font-bold tracking-wider uppercase text-neutral-800">
                Colours & surfaces / Renkler & yüzeyler
              </span>
              <span className="font-mono text-neutral-400">| {pageNum} |</span>
            </div>

            {/* Split Arena: Modular Shapes on Left / Spec Matrix Table on Right */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start mb-6">
              {/* Left Column: Modular Silhouettes & Texture Swatches */}
              <div className="md:col-span-5 space-y-5">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-sans font-bold text-neutral-950 lowercase">
                    {p.name.toLowerCase()}
                  </h3>
                  <span className="text-xs text-neutral-500 font-sans">
                    flat & metro / {p.color || 'white / beyaz'}
                  </span>
                </div>

                {/* Hero Texture Vignette */}
                <div className="aspect-[4/3] rounded-lg overflow-hidden border border-neutral-300 bg-neutral-100 shadow-sm">
                  <img
                    src={pImage}
                    alt={p.name}
                    onError={() => handleImgError(`prod-img-${p.id}`)}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Modular Shape Outline Cards (VitrA Page 28 Standard) */}
                <div>
                  <span className="text-[11px] font-bold text-neutral-700 uppercase tracking-wider block mb-2.5">
                    Modüler Ebatlar / Modular Sizes
                  </span>
                  <div className="grid grid-cols-3 gap-3 text-[10px] font-sans">
                    <div className="p-2 border border-neutral-200 bg-neutral-50/60 flex flex-col items-center text-center">
                      <div className="w-6 h-6 border border-neutral-400 bg-white mb-1.5" />
                      <span className="font-bold text-neutral-800">10x10 cm</span>
                      <span className="text-neutral-500 text-[9px]">Matt/Parlak</span>
                    </div>

                    <div className="p-2 border border-neutral-200 bg-neutral-50/60 flex flex-col items-center text-center">
                      <div className="w-10 h-5 border border-neutral-400 bg-white mb-1.5" />
                      <span className="font-bold text-neutral-800">10x30 cm</span>
                      <span className="text-neutral-500 text-[9px]">Metro / Tuğla</span>
                    </div>

                    <div className="p-2 border border-neutral-200 bg-neutral-50/60 flex flex-col items-center text-center">
                      <div className="w-8 h-8 border border-neutral-400 bg-white mb-1.5" />
                      <span className="font-bold text-neutral-800">20x20 cm</span>
                      <span className="text-neutral-500 text-[9px]">Zemin Karo</span>
                    </div>

                    <div className="p-2 border border-neutral-200 bg-neutral-50/60 flex flex-col items-center text-center">
                      <div className="w-10 h-10 border border-neutral-400 bg-white mb-1.5" />
                      <span className="font-bold text-neutral-800">60x60 cm</span>
                      <span className="text-neutral-500 text-[9px]">Porselen</span>
                    </div>

                    <div className="p-2 border border-neutral-200 bg-neutral-50/60 flex flex-col items-center text-center">
                      <div className="w-8 h-14 border border-neutral-400 bg-white mb-1.5" />
                      <span className="font-bold text-neutral-800">60x120 cm</span>
                      <span className="text-neutral-500 text-[9px]">Büyük Plaka</span>
                    </div>

                    <div className="p-2 border border-neutral-200 bg-neutral-50/60 flex flex-col items-center text-center">
                      <div className="w-6 h-14 border border-neutral-400 bg-white mb-1.5" />
                      <span className="font-bold text-neutral-800">120x280 cm</span>
                      <span className="text-neutral-500 text-[9px]">Dev Plaka</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Engineering Slip-Resistance & Specification Matrix (VitrA Page 44) */}
              <div className="md:col-span-7 space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-neutral-900 uppercase tracking-wide">
                    Special surfaces & thickness / Özel yüzeyler & kalınlık
                  </h4>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    DIN 51130 ve ISO 10545 uluslararası mimari şartname parametreleri
                  </p>
                </div>

                {/* Technical Table Matrix */}
                <div className="w-full overflow-x-auto border border-neutral-300">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#f1f3f5] text-neutral-800 font-bold text-[11px]">
                        <th className="py-2 px-3 border-b border-r border-neutral-300">Kaymazlık</th>
                        <th className="py-2 px-3 border-b border-r border-neutral-300">Tip / Kod</th>
                        <th className="py-2 px-3 border-b border-r border-neutral-300">Ebat (cm)</th>
                        <th className="py-2 px-3 border-b border-r border-neutral-300">Kalınlık</th>
                        <th className="py-2 px-3 border-b border-neutral-300 text-center">Aşınma</th>
                      </tr>
                    </thead>
                    <tbody className="text-neutral-700">
                      <tr className="border-b border-neutral-200">
                        <td className="py-2 px-3 border-r border-neutral-200 font-mono font-bold text-neutral-900 bg-neutral-50/50">
                          R9
                        </td>
                        <td className="py-2 px-3 border-r border-neutral-200 font-mono text-[11px]">
                          {p.sku || 'K83518400001VTE0'}
                        </td>
                        <td className="py-2 px-3 border-r border-neutral-200">60x60</td>
                        <td className="py-2 px-3 border-r border-neutral-200">9 mm</td>
                        <td className="py-2 px-3 text-center">PEI 4</td>
                      </tr>

                      <tr className="border-b border-neutral-200 bg-neutral-50/30">
                        <td className="py-2 px-3 border-r border-neutral-200 font-mono font-bold text-neutral-900 bg-neutral-50/50">
                          R10A
                        </td>
                        <td className="py-2 px-3 border-r border-neutral-200 font-mono text-[11px]">
                          {p.sku ? `${p.sku}-10A` : 'K75874400001VTE0'}
                        </td>
                        <td className="py-2 px-3 border-r border-neutral-200">{mainDim}</td>
                        <td className="py-2 px-3 border-r border-neutral-200">{p.thickness || '9'} mm</td>
                        <td className="py-2 px-3 text-center">PEI 4</td>
                      </tr>

                      <tr className="border-b border-neutral-200">
                        <td className="py-2 px-3 border-r border-neutral-200 font-mono font-bold text-neutral-900 bg-neutral-50/50">
                          R11B
                        </td>
                        <td className="py-2 px-3 border-r border-neutral-200 font-mono text-[11px]">
                          {p.sku ? `${p.sku}-11B` : 'K75814000001VTE0'}
                        </td>
                        <td className="py-2 px-3 border-r border-neutral-200">20x20</td>
                        <td className="py-2 px-3 border-r border-neutral-200">12 mm</td>
                        <td className="py-2 px-3 text-center">PEI 5</td>
                      </tr>

                      <tr className="border-b border-neutral-200 bg-neutral-50/30">
                        <td className="py-2 px-3 border-r border-neutral-200 font-mono font-bold text-neutral-900 bg-neutral-50/50">
                          R12V4
                        </td>
                        <td className="py-2 px-3 border-r border-neutral-200 font-mono text-[11px]">
                          {p.sku ? `${p.sku}-12V` : 'K75813600001VTE0'}
                        </td>
                        <td className="py-2 px-3 border-r border-neutral-200">20x20</td>
                        <td className="py-2 px-3 border-r border-neutral-200">14 mm (Ağır Yük)</td>
                        <td className="py-2 px-3 text-center">PEI 5</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* BIM & Architecture Meta Note */}
                <div className="p-3 bg-neutral-50 border border-neutral-200 text-[11px] text-neutral-600 space-y-1">
                  <div className="flex items-center gap-2 text-neutral-900 font-bold">
                    <ShieldCheck size={14} className="text-emerald-600" />
                    <span>TS EN 14411 BIA & EPD Sertifikalı</span>
                  </div>
                  <p>
                    Revit, ArchiCAD ve AutoCAD BIM kütüphaneleri teknik şartname dosyalarında mevcuttur.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Running Footer */}
          <div className="pt-4 border-t border-neutral-200 flex justify-between items-center text-[10px] font-mono text-neutral-400">
            <span>{brand.name || 'Lidya'} &bull; {p.name}</span>
            <span>{pageNum}</span>
          </div>
        </section>
      );
    }

    // -----------------------------------------------------------------------
    // 6. TECHNICAL STANDARDS & SPEC SHEET (VitrA PRO Technical Section)
    // -----------------------------------------------------------------------
    if (pageObj.type === 'technical_standards') {
      return (
        <section
          key="standards"
          className="catalog-page relative bg-white text-neutral-900 p-8 sm:p-14 md:p-16 flex flex-col justify-between overflow-hidden"
        >
          <div>
            <div className="flex justify-between items-baseline mb-6">
              <div>
                <h2 className="text-3xl sm:text-4xl font-sans font-extrabold tracking-tight text-neutral-950">
                  Technical information
                </h2>
                <span className="text-sm font-sans font-medium text-neutral-500">
                  Teknik bilgiler &bull; TS EN 14411 BIA
                </span>
              </div>
              <span className="text-xs font-mono text-neutral-400 font-bold uppercase">
                ISO 10545 TEST STANDARTLARI
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl text-xs">
              <div className="p-4 bg-neutral-50 border border-neutral-200">
                <span className="text-[10px] font-mono text-neutral-500 uppercase block">Su Emme Oranı</span>
                <p className="text-base font-bold text-neutral-950 mt-1">E ≤ %0.05</p>
                <p className="text-[11px] text-neutral-500 mt-1">ISO 10545-3 Standardı</p>
              </div>

              <div className="p-4 bg-neutral-50 border border-neutral-200">
                <span className="text-[10px] font-mono text-neutral-500 uppercase block">Kırılma Dayanımı</span>
                <p className="text-base font-bold text-neutral-950 mt-1">≥ 3000 N</p>
                <p className="text-[11px] text-neutral-500 mt-1">ISO 10545-4 (Ağır Yük)</p>
              </div>

              <div className="p-4 bg-neutral-50 border border-neutral-200">
                <span className="text-[10px] font-mono text-neutral-500 uppercase block">Eğilme Mukavemeti</span>
                <p className="text-base font-bold text-neutral-950 mt-1">≥ 55 N/mm²</p>
                <p className="text-[11px] text-neutral-500 mt-1">ISO 10545-4 Standardı</p>
              </div>

              <div className="p-4 bg-neutral-50 border border-neutral-200">
                <span className="text-[10px] font-mono text-neutral-500 uppercase block">Kayma Direnci (Kuru/Islak)</span>
                <p className="text-base font-bold text-neutral-950 mt-1">R9 &bull; R10 &bull; R11 &bull; R12</p>
                <p className="text-[11px] text-neutral-500 mt-1">DIN 51130 & DIN 51097 (A-B-C)</p>
              </div>

              <div className="p-4 bg-neutral-50 border border-neutral-200">
                <span className="text-[10px] font-mono text-neutral-500 uppercase block">Dona Dayanıklılık</span>
                <p className="text-base font-bold text-neutral-950 mt-1">Tam Dayanıklı</p>
                <p className="text-[11px] text-neutral-500 mt-1">ISO 10545-12 (100 Döngü)</p>
              </div>

              <div className="p-4 bg-neutral-50 border border-neutral-200">
                <span className="text-[10px] font-mono text-neutral-500 uppercase block">Kimyasal & Leke Direnci</span>
                <p className="text-base font-bold text-neutral-950 mt-1">Sınıf A & Sınıf 5</p>
                <p className="text-[11px] text-neutral-500 mt-1">ISO 10545-13 & 14</p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-neutral-200 flex justify-between items-center text-[10px] font-mono text-neutral-400">
            <span>Uluslararası Kalite & Güvenlik Şartnamesi</span>
            <span>{pageNum}</span>
          </div>
        </section>
      );
    }

    // -----------------------------------------------------------------------
    // 7. DIGITAL BIM & AR TOOLS
    // -----------------------------------------------------------------------
    if (pageObj.type === 'digital_bim') {
      return (
        <section
          key="digital_bim"
          className="catalog-page relative bg-[#181a1f] text-white p-8 sm:p-14 md:p-16 flex flex-col justify-between overflow-hidden"
        >
          <div className="my-auto max-w-3xl mx-auto space-y-6">
            <span className="text-[10px] font-mono tracking-[0.25em] text-emerald-400 uppercase font-bold">
              BIM, CAD & DİJİTAL PROJE KÜTÜPHANESİ
            </span>

            <h2 className="text-3xl sm:text-5xl font-sans font-light leading-tight text-white">
              Mimari Şartname Dosyalarını Doğrudan İndirin
            </h2>

            <p className="text-xs sm:text-sm text-neutral-300 font-light leading-relaxed max-w-xl">
              Tüm Lidya Pro Technic koleksiyonunun Revit (.rfa), ArchiCAD (.gsm), SketchUp ve 3ds Max materyal dokularına tek tıkla veya QR kod ile ulaşabilirsiniz.
            </p>

            <div className="pt-4 flex items-center gap-6">
              <div className="w-20 h-20 rounded-xl bg-white p-1.5 flex items-center justify-center text-neutral-950 shadow-xl">
                <QrCode size={64} />
              </div>
              <div className="text-xs text-neutral-300">
                <p className="font-bold text-white text-sm">BIM Portalına Bağlanın</p>
                <p className="text-neutral-400 text-xs mt-0.5">3D dokular, ebat şablonları & şartname föyleri</p>
                <span className="inline-block mt-2 font-mono text-emerald-400 text-[11px]">
                  www.seramikbak.com/bim
                </span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 flex justify-between items-center text-[10px] font-mono text-neutral-400">
            <span>Lidya Dijital Mimari Sistemleri</span>
            <span>{pageNum}</span>
          </div>
        </section>
      );
    }

    // -----------------------------------------------------------------------
    // 8. CONTACT & PROJECT SUPPORT (Back Cover)
    // -----------------------------------------------------------------------
    if (pageObj.type === 'contact') {
      return (
        <section
          key="contact"
          className="catalog-page relative bg-[#111317] text-white p-8 sm:p-14 md:p-16 flex flex-col justify-between overflow-hidden select-none"
        >
          {/* Header */}
          <div className="flex justify-between items-center border-b border-white/10 pb-6">
            <span className="text-base font-sans font-bold tracking-[0.2em] uppercase text-white">
              {brand.name || 'LİDYA'}
            </span>
            <span className="text-[10px] font-mono tracking-widest text-neutral-400">
              PRO TECHNIC 2026-2027
            </span>
          </div>

          {/* Contact Matrix */}
          <div className="my-auto max-w-xl space-y-6">
            <h3 className="text-2xl sm:text-3xl font-sans font-light text-white tracking-tight">
              Mimari Danışmanlık & Şartname Masası
            </h3>

            <div className="space-y-4 text-xs sm:text-sm text-neutral-300">
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-emerald-400 flex-shrink-0" />
                <span>{catalog?.contactPhone || '+90 (212) 555 00 00'}</span>
              </div>

              <div className="flex items-center gap-3">
                <Mail size={16} className="text-emerald-400 flex-shrink-0" />
                <span>{catalog?.contactEmail || 'proje@seramikbak.com'}</span>
              </div>

              <div className="flex items-center gap-3">
                <Globe size={16} className="text-emerald-400 flex-shrink-0" />
                <span>{catalog?.websiteUrl || 'www.seramikbak.com'}</span>
              </div>

              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>
                  {catalog?.contactAddress || 'Büyükdere Cad. No:192, Levent / İstanbul'}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-6 border-t border-white/10 flex justify-between items-center text-[10px] font-mono text-neutral-400">
            <span>&copy; {new Date().getFullYear()} {brand.name || 'Lidya'}. Tüm hakları saklıdır.</span>
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

  // View format: all
  return (
    <div className="w-full flex flex-col gap-10 items-center">
      {pages.map((p, idx) => renderSinglePage(p, idx))}
    </div>
  );
}
