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
  Sparkles,
  Layers,
  Box,
  ShieldCheck,
  Snowflake,
  Hand,
  Grid
} from 'lucide-react';

export default function DecoExclusiveTemplate({
  catalog,
  products = [],
  mode = 'preview',
  activePageIndex = 0,
  viewFormat = 'single'
}) {
  const brand = catalog?.brand || {};
  const logo = catalog?.customLogoUrl || brand.logoUrl;

  const [imgErrors, setImgErrors] = useState({});

  const handleImgError = (id) => {
    setImgErrors((prev) => ({ ...prev, [id]: true }));
  };

  // Safe products array with Bien Exclusive styled fallbacks
  const safeProducts = products && products.length > 0 ? products : [
    {
      id: 'demo-1',
      name: 'Adela',
      collection: 'Marble Collection',
      sku: 'DEC-ADE-3090',
      color: 'Anthracite',
      finish: 'Matt',
      surfaceCode: 'M',
      width: 30,
      height: 90,
      thickness: '9',
      rectified: true,
      slipResistance: 'R10',
      peiRating: '4',
      imageUrl: '/renders/luxury_bathroom_calacatta_gold.jpg',
      textureUrl: '/textures/calacatta_gold.jpg',
      description: 'Çağdaş banyo ve yaşam alanları için rölyefli dekofon ve mat yüzey zarafeti.',
      decofonName: 'Anthracite Decofon',
      variants: [
        { name: 'Anthracite', size: '30x90 / 12"x36"', isDeco: false, texture: '/textures/albatros_antrasit.jpg' },
        { name: 'Grey', size: '30x90 / 12"x36"', isDeco: false, texture: '/textures/concrete_light_grey.jpg' },
        { name: 'White', size: '30x90 / 12"x36"', isDeco: false, texture: '/textures/calacatta_gold.jpg' },
        { name: 'Anthracite Decofon', size: '30x90 / 12"x36"', isDeco: true, texture: '/textures/albatros_antrasit.jpg' },
        { name: 'Grey Decofon', size: '30x90 / 12"x36"', isDeco: true, texture: '/textures/concrete_light_grey.jpg' },
        { name: 'White Decofon', size: '30x90 / 12"x36"', isDeco: true, texture: '/textures/calacatta_gold.jpg' },
        { name: 'Grey (Floor)', size: '60x60 / 24"x24"', isFloor: true, texture: '/textures/concrete_light_grey.jpg' },
        { name: 'White (Floor)', size: '60x60 / 24"x24"', isFloor: true, texture: '/textures/calacatta_gold.jpg' },
      ],
      specs: [
        { size: '30x90 / 12"x36"', surface: 'Matt', type: 'Wall Tile' },
        { size: '60x60 / 24"x24"', surface: 'Matt', type: 'Floor Tile' }
      ]
    },
    {
      id: 'demo-2',
      name: 'Alexix',
      collection: 'Marble Collection',
      sku: 'DEC-ALX-60120',
      color: 'White Lappato',
      finish: 'Full Lappato',
      surfaceCode: 'FL',
      width: 60,
      height: 120,
      thickness: '9.5',
      rectified: true,
      slipResistance: 'R9',
      peiRating: '4',
      imageUrl: '/renders/modern_living_natural_oak.jpg',
      textureUrl: '/textures/calacatta_gold.jpg',
      description: 'Işıltılı lappato yüzeyi ve geniş formatı ile ferah salon ve prestijli lobiler.',
      variants: [
        { name: 'Full Lappato', size: '60x120 / 24"x48"', isDeco: false, texture: '/textures/calacatta_gold.jpg' },
      ],
      specs: [
        { size: '60x120 / 24"x48"', surface: 'Full Lappato', type: 'Glazed Porcelain' }
      ]
    },
    {
      id: 'demo-3',
      name: 'Arch',
      collection: 'Marble Collection',
      sku: 'DEC-ARC-60120',
      color: 'Light Grey & Grey',
      finish: 'Full Lappato & Matt',
      surfaceCode: 'FL',
      width: 60,
      height: 120,
      thickness: '10',
      rectified: true,
      slipResistance: 'R10',
      peiRating: '4',
      imageUrl: '/renders/luxury_bathroom_loft_beton.jpg',
      textureUrl: '/textures/loft_beton.jpg',
      description: 'Klasik lüks altın varaklı ve neo-barok salonlar için asil damarlı porselen kompozisyonu.',
      variants: [
        { name: 'Grey', size: '30x60 / 12"x24"', isDeco: false, texture: '/textures/albatros_antrasit.jpg' },
        { name: 'Light Grey', size: '30x60 / 12"x24"', isDeco: false, texture: '/textures/concrete_light_grey.jpg' },
        { name: 'Decofon Damask', size: '30x60 / 12"x24"', isDeco: true, texture: '/textures/albatros_antrasit.jpg' },
        { name: 'Light Grey', size: '60x60 / 24"x24"', isFloor: true, texture: '/textures/concrete_light_grey.jpg' },
        { name: 'Grey', size: '60x60 / 24"x24"', isFloor: true, texture: '/textures/albatros_antrasit.jpg' },
        { name: 'Light Grey', size: '60x120 / 24"x48"', isFloor: true, texture: '/textures/concrete_light_grey.jpg' },
        { name: 'Grey', size: '60x120 / 24"x48"', isFloor: true, texture: '/textures/albatros_antrasit.jpg' },
      ],
      specs: [
        { size: '60x120 / 24"x48"', surface: 'Full Lappato', type: 'Glazed Porcelain' },
        { size: '60x60 / 24"x24"', surface: 'Full Lappato', type: 'Glazed Porcelain' },
        { size: '30x60 / 12"x24"', surface: 'Matt', type: 'Wall Tile' }
      ]
    }
  ];

  // =========================================================================
  // PAGE COMPILATION PIPELINE (Bien Exclusive Monograph Spread Architecture)
  // =========================================================================
  const pages = [];

  // Page 1: Pure White Minimalist Cover with Lowercase Brand Title
  if (catalog?.showCover !== false) {
    pages.push({ type: 'cover' });
  }

  // Page 2: Concept Index (Categorized Ceramic Directory)
  if (catalog?.showTOC !== false) {
    pages.push({ type: 'concept_index' });
  }

  // Product 2-Page Spreads (Left: Full-Bleed 1:1 Room Photo / Right: Monograph Spec Page)
  safeProducts.forEach((p, idx) => {
    pages.push({ type: 'product_room', product: p, index: idx });
    pages.push({ type: 'product_details', product: p, index: idx });
  });

  // Dedicated Section: Technical Packing & Standards
  if (catalog?.showSpecs !== false) {
    pages.push({ type: 'technical_standards' });
  }

  // Dedicated Section: Digital 3D & Contact Back Cover
  if (catalog?.showContactPage !== false) {
    pages.push({ type: 'contact' });
  }

  // Helper: Surface badge letters
  const getSurfaceCode = (p) => {
    if (p.surfaceCode) return p.surfaceCode;
    const f = (p.finish || '').toLowerCase();
    if (f.includes('lappato')) return 'FL';
    if (f.includes('parlak') || f.includes('glossy') || f.includes('pol')) return 'G';
    return 'M';
  };

  const getSurfaceLabel = (code) => {
    switch (code) {
      case 'FL': return 'FULL LAPPATO';
      case 'G': return 'GLOSSY';
      case 'P': return 'POLISHED';
      default: return 'MATT';
    }
  };

  // =========================================================================
  // PAGE RENDERER
  // =========================================================================
  const renderSinglePage = (pageObj, pageIndex) => {
    if (!pageObj) return null;
    const pageNum = (pageIndex + 1).toString();
    const brandTitle = brand.name || 'deco';
    const catalogTitle = catalog?.title || 'EXCLUSIVE CATALOG';

    // -----------------------------------------------------------------------
    // 1. COVER PAGE — Pure Minimalist White Square Cover (Bien Page 2 Reference)
    // -----------------------------------------------------------------------
    if (pageObj.type === 'cover') {
      return (
        <section
          key="cover"
          className="deco-square-page bg-white text-neutral-900 overflow-hidden flex flex-col justify-between items-center select-none"
        >
          {/* Top minimal brand whisper */}
          <div className="w-full pt-10 sm:pt-14 px-10 flex justify-between items-center text-[10px] tracking-[0.4em] font-medium uppercase text-neutral-400">
            <span>{brand.name || 'DECO'}</span>
            <span>{new Date().getFullYear()}</span>
          </div>

          {/* Center Brand Identity (Lowercase Editorial Logo) */}
          <div className="flex flex-col items-center justify-center text-center my-auto px-6">
            {logo && !imgErrors['logo-cover'] ? (
              <img
                src={logo}
                alt={brand.name || 'Brand'}
                onError={() => handleImgError('logo-cover')}
                className="h-16 sm:h-20 md:h-24 max-w-[280px] object-contain mb-6 filter contrast-125"
              />
            ) : (
              <h1 className="text-5xl sm:text-7xl md:text-8xl font-light tracking-[-0.04em] text-neutral-900 lowercase select-none">
                {brandTitle.toLowerCase()}
              </h1>
            )}

            <div className="w-12 h-0.5 bg-neutral-900 my-4" />

            <p className="text-xs sm:text-sm font-light tracking-[0.45em] uppercase text-neutral-600 mt-2">
              {catalogTitle}
            </p>
            <span className="text-[11px] font-serif italic text-neutral-400 tracking-wider mt-1">
              {catalog.subtitle || 'be unique & contemporary'}
            </span>
          </div>

          {/* Bottom Running Footer */}
          <div className="w-full pb-8 sm:pb-12 px-10 text-center">
            <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-neutral-400">
              {brand.website || 'bienseramik.com.tr'}
            </span>
          </div>
        </section>
      );
    }

    // -----------------------------------------------------------------------
    // 2. CONCEPT INDEX — Bien 5-Category Index (Marble, Stone, Mix, Wood, Outdoor)
    // -----------------------------------------------------------------------
    if (pageObj.type === 'concept_index') {
      const categories = [
        {
          name: 'marble',
          items: [
            { name: safeProducts[0]?.name?.toUpperCase() || 'ADELA', p: '04' },
            { name: safeProducts[1]?.name?.toUpperCase() || 'ALEXIX', p: '06' },
            { name: safeProducts[2]?.name?.toUpperCase() || 'ARCH', p: '08' },
            { name: 'BELITA', p: '10' },
            { name: 'CALACATTA MARMI', p: '12' },
            { name: 'DARKNESS', p: '14' },
            { name: 'ELAN', p: '16' },
            { name: 'GORDION', p: '18' },
            { name: 'STATUARIO GOYA', p: '20' }
          ]
        },
        {
          name: 'stone-concrete',
          items: [
            { name: 'ALYSSA', p: '24' },
            { name: 'ARCIDES', p: '26' },
            { name: 'ANEMOS', p: '28' },
            { name: 'ASSOS', p: '30' },
            { name: 'BARLETTA', p: '32' },
            { name: 'BETON WEISS', p: '34' },
            { name: 'CAPPADOCIA', p: '36' },
            { name: 'MONTEVIA', p: '38' }
          ]
        },
        {
          name: 'wood & outdoor',
          items: [
            { name: 'ATELIER', p: '42' },
            { name: 'PICASSO', p: '44' },
            { name: 'ZIGANA', p: '46' },
            { name: 'ELEGANZA', p: '48' },
            { name: 'SHELL 20MM', p: '52' },
            { name: 'VENIS OUTDOOR', p: '54' }
          ]
        }
      ];

      return (
        <section
          key="concept-index"
          className="deco-square-page bg-white text-neutral-900 p-8 sm:p-14 md:p-16 flex flex-col justify-between select-none"
        >
          {/* Header */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-[0.15em] uppercase text-neutral-900 pb-3 border-b border-neutral-300">
              CONCEPT INDEX
            </h2>

            {/* Categorized Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mt-8">
              {categories.map((cat, idx) => (
                <div key={idx} className="flex flex-col">
                  <div className="flex items-center gap-2 mb-4 pb-1 border-b border-neutral-400">
                    <span className="text-sm font-bold lowercase tracking-wider text-neutral-900">
                      {cat.name}
                    </span>
                  </div>
                  <ul className="space-y-1.5 text-xs">
                    {cat.items.map((item, i) => (
                      <li key={i} className="flex items-center justify-between text-neutral-700 hover:text-neutral-950">
                        <span className="tracking-wide font-medium">{item.name}</span>
                        <span className="font-bold text-neutral-900 font-mono">{item.p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Running Footer */}
          <div className="pt-4 border-t border-neutral-200 flex justify-between items-center text-[10px] text-neutral-400 font-mono">
            <span>DECO EXCLUSIVE CONCEPT</span>
            <span>{pageNum}</span>
          </div>
        </section>
      );
    }

    // -----------------------------------------------------------------------
    // 3. PRODUCT SPREAD — LEFT PAGE: Haute Couture Ambient Interior Staging
    // -----------------------------------------------------------------------
    if (pageObj.type === 'product_room') {
      const p = pageObj.product;
      const roomImg = p.imageUrl || '/renders/luxury_bathroom_calacatta_gold.jpg';
      const collectionName = (p.collection || 'MARBLE COLLECTION').toUpperCase();

      return (
        <section
          key={`prod-left-${p.id}`}
          className="deco-square-page relative overflow-hidden bg-neutral-950 text-white select-none"
        >
          {/* Full-bleed Architectural Interior Photography */}
          <img
            src={roomImg}
            alt={p.name}
            onError={() => handleImgError(`room-${p.id}`)}
            className="w-full h-full object-cover object-center absolute inset-0 z-0 transition-transform duration-700 ease-out hover:scale-[1.02]"
          />

          {/* Vignette Gradients */}
          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/60 to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/85 via-black/40 to-transparent z-10 pointer-events-none" />

          {/* Top Running Header */}
          <div className="absolute top-6 sm:top-8 inset-x-6 sm:inset-x-10 z-20 flex justify-between items-center text-xs tracking-widest text-white/90">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="font-mono text-[10px] sm:text-xs uppercase font-bold drop-shadow">
                HAUTE COUTURE ARCHITECTURAL INTERIOR
              </span>
            </div>
            <span className="bg-black/60 backdrop-blur-md px-3 py-1 rounded text-[9px] sm:text-[10px] font-mono border border-white/20 uppercase tracking-widest">
              3D RELIEF & DECOFON
            </span>
          </div>

          {/* Architectural Spatial Pins */}
          <div className="absolute top-[28%] left-[25%] z-20 group">
            <div className="flex items-center gap-2 bg-neutral-950/80 backdrop-blur-md text-white text-[10px] font-mono px-3 py-1.5 rounded-full border border-amber-400/50 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>[01] 3D Rölyefli Vurgu Duvarı</span>
            </div>
          </div>

          <div className="absolute top-[68%] left-[55%] z-20 group">
            <div className="flex items-center gap-2 bg-neutral-950/80 backdrop-blur-md text-white text-[10px] font-mono px-3 py-1.5 rounded-full border border-white/30 shadow-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              <span>[02] Uyumlu Porselen Zemin (Full Lappato)</span>
            </div>
          </div>

          {/* Floating Architectural Material Card & Footer */}
          <div className="absolute bottom-6 sm:bottom-10 inset-x-6 sm:inset-x-10 z-20 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="bg-neutral-950/80 backdrop-blur-md p-4 rounded-xl border border-white/20 max-w-md shadow-xl">
              <div className="flex items-center gap-2 text-amber-400 font-mono text-[10px] uppercase tracking-wider mb-1">
                <span>{collectionName}</span>
                <span>&bull;</span>
                <span>Özel Tasarım Konsepti</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider mb-1.5 font-sans">
                {p.name}
              </h3>
              <p className="text-xs text-neutral-300 font-light leading-relaxed mb-3">
                {p.description || 'Dekofon rölyef yüzey teknolojisi ile mekanlara dinamik ışık ve gölge derinliği katan lüks seramik serisi.'}
              </p>

              {/* Material Harmony Chips */}
              <div className="flex items-center gap-2 pt-2 border-t border-white/10 text-[9px] font-mono text-neutral-300">
                <span className="text-neutral-400">Uyumlu Malzeme:</span>
                <span className="px-2 py-0.5 rounded bg-white/10">Pirinç Metal Çıta</span>
                <span className="px-2 py-0.5 rounded bg-white/10">Doğal Meşe</span>
                <span className="px-2 py-0.5 rounded bg-white/10">Füme Cam</span>
              </div>
            </div>

            {/* Running Page Num */}
            <div className="flex items-center gap-3 text-xs font-mono font-bold tracking-widest text-white/90">
              <span className="text-base text-amber-400">{pageNum}</span>
              <span className="h-4 w-px bg-white/40" />
              <span className="uppercase text-[11px]">{collectionName}</span>
            </div>
          </div>
        </section>
      );
    }

    // -----------------------------------------------------------------------
    // 4. PRODUCT SPREAD — RIGHT PAGE: Bien Spaced Monograph & Decofon Matrix (Bien Page 6 Right)
    // -----------------------------------------------------------------------
    if (pageObj.type === 'product_details') {
      const p = pageObj.product;
      const surfaceCode = getSurfaceCode(p);
      const spacedTitle = p.name.split('').join(' ').toUpperCase();

      // Feature Badges matching Bien Exclusive iconography:
      // [ Surface Code (M/FL/G) ] [ REC ] [ Wall Usage ] [ Floor Usage ] [ Frost Res ] [ Easy Clean ]
      const featureBadges = [
        { code: surfaceCode, label: getSurfaceLabel(surfaceCode), isText: true },
        { code: 'REC', label: 'RECTIFIED', isText: true },
        { icon: Hand, label: 'WALL USAGE' },
        { icon: Grid, label: 'FLOOR USAGE' },
        { icon: Snowflake, label: 'FROST RESISTANCE' },
        { icon: Sparkles, label: 'EASY CLEAN' }
      ];

      // Swatches: Wall tiles, Decofons, Floor tiles
      const variants = p.variants && p.variants.length > 0 ? p.variants : [
        { name: p.color || 'Anthracite', size: `${p.width || 30}x${p.height || 90} / 12"x36"`, isDeco: false, texture: p.textureUrl || p.imageUrl },
        { name: 'Grey', size: `${p.width || 30}x${p.height || 90} / 12"x36"`, isDeco: false, texture: '/textures/concrete_light_grey.jpg' },
        { name: 'White', size: `${p.width || 30}x${p.height || 90} / 12"x36"`, isDeco: false, texture: '/textures/calacatta_gold.jpg' },
        { name: `${p.color || 'Anthracite'} Decofon`, size: `${p.width || 30}x${p.height || 90} / 12"x36"`, isDeco: true, texture: p.textureUrl || p.imageUrl },
        { name: 'Grey Decofon', size: `${p.width || 30}x${p.height || 90} / 12"x36"`, isDeco: true, texture: '/textures/concrete_light_grey.jpg' },
        { name: 'White Decofon', size: `${p.width || 30}x${p.height || 90} / 12"x36"`, isDeco: true, texture: '/textures/calacatta_gold.jpg' },
        { name: 'Grey (Floor)', size: '60x60 / 24"x24"', isFloor: true, texture: '/textures/concrete_light_grey.jpg' },
        { name: 'White (Floor)', size: '60x60 / 24"x24"', isFloor: true, texture: '/textures/calacatta_gold.jpg' }
      ];

      // Clean spec table rows
      const specs = p.specs && p.specs.length > 0 ? p.specs : [
        { size: `${p.width || 30}x${p.height || 90} / 12"x36"`, surface: p.finish || 'Matt', type: 'Wall Tile' },
        { size: '60x60 / 24"x24"', surface: p.finish || 'Matt', type: 'Floor Tile' }
      ];

      return (
        <section
          key={`prod-right-${p.id}`}
          className="deco-square-page bg-white text-neutral-900 p-8 sm:p-12 md:p-14 flex flex-col justify-between select-none relative"
        >
          {/* Top Section: Spaced Title + Square Icon Badges Row */}
          <div>
            {/* Upper Right Spaced Bold Collection Title */}
            <div className="flex justify-end mb-6">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-neutral-900 tracking-[0.45em] uppercase text-right">
                {spacedTitle}
              </h2>
            </div>

            {/* Square Icon Badges Row (Bien Exclusive Official Signature) */}
            <div className="flex justify-end items-center gap-2 sm:gap-3 flex-wrap mb-8">
              {featureBadges.map((badge, bIdx) => (
                <div key={bIdx} className="flex flex-col items-center">
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-md border border-neutral-800 flex items-center justify-center bg-white shadow-sm">
                    {badge.isText ? (
                      <span className="font-extrabold text-[12px] sm:text-sm text-neutral-900 font-sans tracking-tight">
                        {badge.code}
                      </span>
                    ) : (
                      <badge.icon size={18} className="text-neutral-800" strokeWidth={1.75} />
                    )}
                  </div>
                  <span className="text-[7px] sm:text-[8px] font-bold tracking-wider uppercase text-neutral-500 mt-1 text-center max-w-[50px] leading-tight">
                    {badge.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Middle Section: Swatches Grid (Tiles & Decofon Reliefs) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-6 max-h-[380px] overflow-hidden">
              {variants.slice(0, 8).map((v, vIdx) => (
                <div key={vIdx} className="flex flex-col">
                  {/* Swatch Image Box */}
                  <div className={`w-full overflow-hidden border border-neutral-200 bg-neutral-100 shadow-sm relative ${v.isFloor ? 'aspect-square' : 'aspect-[3/1]'}`}>
                    <img
                      src={v.texture || p.textureUrl || p.imageUrl}
                      alt={v.name}
                      onError={() => handleImgError(`v-${p.id}-${vIdx}`)}
                      className={`w-full h-full object-cover filter contrast-105 ${v.isDeco ? 'brightness-95 saturate-110' : ''}`}
                    />
                    {v.isDeco && (
                      <span className="absolute top-1 right-1 bg-neutral-900/80 text-white text-[7px] font-bold px-1.5 py-0.5 rounded tracking-widest uppercase">
                        DECOFON
                      </span>
                    )}
                  </div>

                  {/* Dimension on Left, Color on Right */}
                  <div className="flex justify-between items-center text-[9px] sm:text-[10px] text-neutral-600 mt-1 font-mono">
                    <span className="font-medium text-neutral-500">{v.size}</span>
                    <span className="font-semibold text-neutral-900 truncate ml-1">{v.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Section: Architectural Laying Schema, Spec Matrix & Running Number */}
          <div className="pt-4 border-t border-neutral-200 grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
            {/* Left: Architectural Laying & Grout System Advice */}
            <div className="sm:col-span-5 space-y-1.5 text-[10px] font-mono text-neutral-600">
              <div className="flex items-center gap-1.5 text-neutral-900 font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 bg-neutral-900 rounded-full" />
                <span>Modüler Döşeme & Derz Mimarisi</span>
              </div>
              <p className="text-neutral-500 leading-snug">
                Düz duvar fonu ile %30 rölyef dekofon panelleri kombine edilerek ışık-gölge ritmi oluşturulabilir.
              </p>
              <div className="flex items-center gap-3 pt-1 text-[9px] text-neutral-500">
                <span className="bg-neutral-100 px-2 py-0.5 rounded border border-neutral-300 text-neutral-800 font-bold">Derz: 1.0mm Lazer</span>
                <span className="bg-neutral-100 px-2 py-0.5 rounded border border-neutral-300 text-neutral-800 font-bold">Harç: C2TE S1</span>
              </div>
            </div>

            {/* Right: Clean Architectural Spec Table & Page Number */}
            <div className="sm:col-span-7 flex flex-col items-end">
              <table className="text-[10px] sm:text-[11px] border-collapse text-left w-full sm:w-auto">
                <thead>
                  <tr className="border-b-2 border-neutral-900">
                    <th className="font-black uppercase tracking-wider text-neutral-900 pr-5 pb-1 text-[10px]">FORMAT</th>
                    <th className="font-black uppercase tracking-wider text-neutral-900 pr-5 pb-1 text-[10px]">YÜZEY</th>
                    <th className="font-black uppercase tracking-wider text-neutral-900 pb-1 text-[10px]">STANDART</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 font-mono text-[10px]">
                  {specs.map((row, sIdx) => (
                    <tr key={sIdx}>
                      <td className="pr-5 py-1 text-neutral-800 font-bold">{row.size}</td>
                      <td className="pr-5 py-1 text-neutral-700">{row.surface}</td>
                      <td className="py-1 text-neutral-700 font-sans">{row.type} &bull; EN 14411</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="w-full flex justify-between items-center mt-2 pt-1 border-t border-neutral-100 text-[10px] font-mono text-neutral-400">
                <span className="text-[9px] uppercase tracking-widest text-neutral-500">Deco Exclusive Monograph</span>
                <span className="font-bold text-neutral-900 font-mono text-xs">P. {pageNum}</span>
              </div>
            </div>
          </div>
        </section>
      );
    }

    // -----------------------------------------------------------------------
    // 5. TECHNICAL STANDARDS & PACKING MATRIX (Bien Exclusive Back Standard)
    // -----------------------------------------------------------------------
    if (pageObj.type === 'technical_standards') {
      const packingData = [
        { size: '30x90 / 12"x36"', pcsBox: '6', m2Box: '1.62', kgBox: '26.5', boxPallet: '36', m2Pallet: '58.32', kgPallet: '980' },
        { size: '60x60 / 24"x24"', pcsBox: '4', m2Box: '1.44', kgBox: '28.0', boxPallet: '32', m2Pallet: '46.08', kgPallet: '920' },
        { size: '60x120 / 24"x48"', pcsBox: '2', m2Box: '1.44', kgBox: '31.5', boxPallet: '32', m2Pallet: '46.08', kgPallet: '1030' },
        { size: '120x240 / 48"x96"', pcsBox: '1', m2Box: '2.88', kgBox: '46.0', boxPallet: '18', m2Pallet: '51.84', kgPallet: '880' }
      ];

      return (
        <section
          key="technical-standards"
          className="deco-square-page bg-white text-neutral-900 p-8 sm:p-14 md:p-16 flex flex-col justify-between select-none"
        >
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-[0.2em] uppercase text-neutral-900 pb-3 border-b border-neutral-300">
              TECHNICAL SPECIFICATIONS & PACKING
            </h2>

            {/* Packing Table */}
            <div className="mt-6 overflow-x-auto">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 block mb-2">
                PACKING INFORMATION / PAKETLEME DETAYLARI
              </span>
              <table className="w-full text-[10px] sm:text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-100 text-neutral-900 text-left font-bold border-b border-neutral-300">
                    <th className="p-2">SIZE / EBAT</th>
                    <th className="p-2 text-center">PCS/BOX</th>
                    <th className="p-2 text-center">M²/BOX</th>
                    <th className="p-2 text-center">KG/BOX</th>
                    <th className="p-2 text-center">BOX/PALLET</th>
                    <th className="p-2 text-center">M²/PALLET</th>
                    <th className="p-2 text-center">KG/PALLET</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 font-mono">
                  {packingData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-neutral-50">
                      <td className="p-2 font-bold font-sans">{row.size}</td>
                      <td className="p-2 text-center">{row.pcsBox}</td>
                      <td className="p-2 text-center">{row.m2Box}</td>
                      <td className="p-2 text-center">{row.kgBox}</td>
                      <td className="p-2 text-center">{row.boxPallet}</td>
                      <td className="p-2 text-center">{row.m2Pallet}</td>
                      <td className="p-2 text-center">{row.kgPallet}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Certifications and Standards Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-neutral-200">
              <div className="border border-neutral-300 rounded p-3 text-center">
                <span className="text-[10px] font-bold uppercase text-neutral-500 block">STANDARD</span>
                <span className="text-xs font-bold text-neutral-900 mt-1 block">TS EN 14411</span>
                <span className="text-[9px] text-neutral-600">Annex G - Group BIA</span>
              </div>
              <div className="border border-neutral-300 rounded p-3 text-center">
                <span className="text-[10px] font-bold uppercase text-neutral-500 block">WATER ABSORPTION</span>
                <span className="text-xs font-bold text-neutral-900 mt-1 block">E ≤ 0.5%</span>
                <span className="text-[9px] text-neutral-600">Porcelain Body</span>
              </div>
              <div className="border border-neutral-300 rounded p-3 text-center">
                <span className="text-[10px] font-bold uppercase text-neutral-500 block">MODULUS OF RUPTURE</span>
                <span className="text-xs font-bold text-neutral-900 mt-1 block">≥ 35 N/mm²</span>
                <span className="text-[9px] text-neutral-600">ISO 10545-4</span>
              </div>
              <div className="border border-neutral-300 rounded p-3 text-center">
                <span className="text-[10px] font-bold uppercase text-neutral-500 block">FROST RESISTANCE</span>
                <span className="text-xs font-bold text-neutral-900 mt-1 block">RESISTANT</span>
                <span className="text-[9px] text-neutral-600">EN ISO 10545-12</span>
              </div>
            </div>
          </div>

          {/* Running Footer */}
          <div className="pt-4 border-t border-neutral-200 flex justify-between items-center text-[10px] text-neutral-400 font-mono">
            <span>TS EN 14411 CONFORMITY</span>
            <span>{pageNum}</span>
          </div>
        </section>
      );
    }

    // -----------------------------------------------------------------------
    // 6. CONTACT & BACK COVER — Minimalist Dark Luxury Closing (Bien Page 1 Reference)
    // -----------------------------------------------------------------------
    if (pageObj.type === 'contact') {
      return (
        <section
          key="contact"
          className="deco-square-page bg-neutral-950 text-white p-8 sm:p-14 md:p-16 flex flex-col justify-between select-none relative"
        >
          {/* Top Running Header */}
          <div className="flex justify-between items-center text-[10px] tracking-[0.4em] uppercase text-neutral-400 font-mono">
            <span>DECO EXCLUSIVE</span>
            <span>SHOWROOM & CONTACT</span>
          </div>

          {/* Center Brand & Slogan */}
          <div className="my-auto flex flex-col items-center text-center">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-light tracking-[-0.03em] lowercase text-white mb-2">
              {brandTitle.toLowerCase()}
            </h1>
            <span className="text-xs sm:text-sm font-serif italic text-neutral-400 tracking-widest mb-6">
              be unique
            </span>

            {/* QR Code for 3D Digital Catalog */}
            <div className="p-3 bg-white rounded-lg shadow-xl mb-4">
              <QrCode size={90} className="text-neutral-950" />
            </div>
            <span className="text-[10px] tracking-[0.25em] uppercase text-neutral-400">
              SCAN TO VIEW 3D DIGITAL EXCLUSIVE
            </span>
          </div>

          {/* Bottom Contact Details */}
          <div className="border-t border-white/10 pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-[11px] text-neutral-400">
            <div>
              <span className="text-white font-bold block uppercase tracking-wider mb-1">HEADQUARTERS</span>
              <p>{catalog.address || 'Büyükdere Cad. No: 124 Levent / İstanbul'}</p>
            </div>
            <div>
              <span className="text-white font-bold block uppercase tracking-wider mb-1">CONTACT</span>
              <p>{catalog.phone || '+90 (212) 317 50 00'}</p>
              <p>{catalog.email || 'info@bienseramik.com.tr'}</p>
            </div>
            <div>
              <span className="text-white font-bold block uppercase tracking-wider mb-1">DIGITAL</span>
              <p>{brand.website || 'bienseramik.com.tr'}</p>
              <p>Instagram: @bienseramik</p>
            </div>
          </div>
        </section>
      );
    }

    return null;
  };

  // =========================================================================
  // VIEW MODE WRAPPERS (Single / Spread / All Pages)
  // =========================================================================
  if (mode === 'print') {
    return (
      <div className="catalog-print-wrapper space-y-6">
        {pages.map((pObj, idx) => (
          <div key={idx} className="print-page-break">
            {renderSinglePage(pObj, idx)}
          </div>
        ))}
      </div>
    );
  }

  if (viewFormat === 'all') {
    return (
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto p-4">
        {pages.map((pObj, idx) => (
          <div key={idx} className="flex flex-col items-center">
            <span className="text-xs text-neutral-400 mb-2 font-mono">
              Sayfa #{idx + 1} ({pObj.type})
            </span>
            {renderSinglePage(pObj, idx)}
          </div>
        ))}
      </div>
    );
  }

  if (viewFormat === 'spread') {
    // Spread view: display left and right pages together in a 2:1 editorial spread
    const leftIndex = activePageIndex % 2 === 0 ? activePageIndex : activePageIndex - 1;
    const rightIndex = leftIndex + 1;

    const leftPage = pages[leftIndex];
    const rightPage = rightIndex < pages.length ? pages[rightIndex] : null;

    return (
      <div className="w-full flex justify-center items-center p-2">
        <div className="deco-spread-container flex flex-col md:flex-row shadow-2xl bg-white border border-neutral-300 overflow-hidden max-w-[1200px] w-full">
          <div className="w-full md:w-1/2 border-b md:border-b-0 md:border-r border-neutral-200">
            {renderSinglePage(leftPage, leftIndex)}
          </div>
          <div className="w-full md:w-1/2">
            {rightPage ? (
              renderSinglePage(rightPage, rightIndex)
            ) : (
              <div className="deco-square-page bg-neutral-50 flex items-center justify-center text-neutral-300 font-mono text-xs">
                [ Boş Sayfa ]
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Single Page View (Default)
  const activePageObj = pages[activePageIndex] || pages[0];
  return (
    <div className="w-full flex justify-center items-center">
      {renderSinglePage(activePageObj, activePageIndex)}
    </div>
  );
}
