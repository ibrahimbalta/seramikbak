'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
  Shield,
  FileText,
  Package,
  CheckCircle2
} from 'lucide-react';

export default function ArchitecturalEditorialTemplate({
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

  // Safe fallback products matching real architectural ceramic data (Bien Seramik benchmarks)
  const safeProducts = products && products.length > 0 ? products : [
    {
      id: 'p-1',
      name: 'Bien Bona Dea Light Grey',
      code: 'P156XDRB55TX0XMXXG40',
      width: 60,
      height: 120,
      thickness: 10.0,
      finish: 'Brüt Beton Mat Dokusu',
      style: 'Taş-Beton',
      color: 'Açık Çimento Grisi',
      peiRating: 5,
      slipResistance: 'R10B',
      rectified: true,
      frostResistance: true,
      imageUrl: '/renders/luxury_bathroom_loft_beton.jpg',
      textureUrl: '/textures/loft_beton.jpg',
      description: 'Mikro gözenekli endüstriyel beton dokusu. Homojen matlık ve yüksek mekanik aşınma direnci.'
    },
    {
      id: 'p-2',
      name: 'Bien Calacatta Marmi',
      code: 'CALACATTA-MARMI-60X60',
      width: 60,
      height: 60,
      thickness: 9.0,
      finish: 'Doğal Mat Yüzey',
      style: 'Mermer',
      color: 'Duman Grisi & Beyaz Mermer',
      peiRating: 4,
      slipResistance: 'R10',
      rectified: true,
      frostResistance: true,
      imageUrl: '/renders/luxury_bathroom_albatros_antrasit.jpg',
      textureUrl: '/textures/calacatta_gold.jpg',
      description: 'Hafif dokulu mat seramik gövde, ıslak ayak kaymazlığı sunarken leke tutmayan nano koruyucu tabaka.'
    },
    {
      id: 'p-3',
      name: 'Bien Iroko Warm Grey',
      code: 'G192ZDRI21TV0XMXXG50',
      width: 20,
      height: 120,
      thickness: 9.5,
      finish: 'Doğal Ahşap Dokusu',
      style: 'Ahşap',
      color: 'Sıcak Gri / Meşe Doğal Damar',
      peiRating: 4,
      slipResistance: 'R10',
      rectified: true,
      frostResistance: true,
      imageUrl: '/renders/modern_living_natural_oak.jpg',
      textureUrl: '/textures/natural_oak.jpg',
      description: 'Doğal ahşap damarlarının rölyef dokusunu porselenin çizilmezliği ile buluşturan 3D senkronize yüzey.'
    },
    {
      id: 'p-4',
      name: 'Bien Bond Beige',
      code: 'W168ZDRB93XX0XMXXB50',
      width: 40,
      height: 120,
      thickness: 9.5,
      finish: 'İpeksi Mat Dokunuş',
      style: 'Mix',
      color: 'Sıcak Bej / Kireçtaşı',
      peiRating: 4,
      slipResistance: 'R9',
      rectified: true,
      frostResistance: true,
      imageUrl: '/renders/luxury_bathroom_calacatta_gold.jpg',
      textureUrl: '/textures/keops_bej.jpg',
      description: 'Zarif kireçtaşı sedimantasyon çizgileri, yumuşak ışık emilimi ve mimari dinginlik.'
    },
    {
      id: 'p-5',
      name: 'Bien Maxi Mat Beyaz',
      code: 'G015XDRM720X0XMAAW50',
      width: 60,
      height: 60,
      thickness: 9.0,
      finish: 'Pürüzsüz Mat Beyaz',
      style: 'Mermer',
      color: 'Karasal Saf Beyaz',
      peiRating: 4,
      slipResistance: 'R9',
      rectified: true,
      frostResistance: true,
      imageUrl: '/images/showroom_hero_flagship.jpg',
      textureUrl: '/textures/loft_beton.jpg',
      description: 'Kusursuz mat beyazlık derinliği. Işığı yansıtmadan hacmi genişleten homojen doku.'
    },
    {
      id: 'p-6',
      name: 'Bien Yuta Beyaz Dekofon',
      code: 'W188ZDRY20040XMAAW50',
      width: 30,
      height: 90,
      thickness: 10.5,
      finish: '3D Rölyef Geometrik',
      style: 'Mix Dekofon',
      color: 'Optik Beyaz & Işık Kırılımları',
      peiRating: 3,
      slipResistance: 'N/A',
      rectified: true,
      frostResistance: false,
      imageUrl: '/renders/luxury_bathroom_albatros_antrasit.jpg',
      textureUrl: '/textures/magma_antrasit.jpg',
      description: '3 boyutlu dalga rölyefi. Yan açılı mimari aydınlatmada heykelsi gölge ve ışık oyunları üretir.'
    }
  ];

  const handleTriggerInquiry = (product, type = 'quote') => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('seramikbak-open-lead-modal', {
          detail: { product, type }
        })
      );
    }
  };

  // -------------------------------------------------------------
  // PAGE COMPILATION PIPELINE (EXACT 8 MASTER EDITORIAL PAGES)
  // -------------------------------------------------------------
  const pages = [];

  // Page 1: Premium Full Bleed Cover
  if (catalog?.showCover !== false) {
    pages.push({ type: 'cover' });
  }

  // Page 2: Storytelling & Design Manifesto
  pages.push({ type: 'manifesto' });

  // Page 3: Panoramic Architectural Living Space Spread
  pages.push({ type: 'panoramic_living_space' });

  // Page 4: Hero Signature Slab (1:2 Monumental Aspect)
  pages.push({ type: 'hero_slab', product: safeProducts[0] });

  // Page 5: Material & 10x Macro Texture Specifications
  pages.push({ type: 'macro_texture_specs', product: safeProducts[0] });

  // Page 6: Collection Family & Comparison Matrix
  pages.push({ type: 'collection_matrix' });

  // Page 7: Master Technical & Logistics Spec Sheet
  if (catalog?.showSpecs !== false) {
    pages.push({ type: 'specs_table' });
  }

  // Page 8: Back Cover & 3D Virtual Studio QR Portal
  if (catalog?.showContactPage !== false) {
    pages.push({ type: 'back_cover' });
  }

  // View Filtering (Spread vs Single)
  const isPrint = mode === 'print';
  let pagesToRender = [];

  if (isPrint || viewFormat === 'all') {
    pagesToRender = pages.map((p, idx) => ({ ...p, pageIndex: idx }));
  } else if (viewFormat === 'spread') {
    if (activePageIndex === 0) {
      pagesToRender = [{ ...pages[0], pageIndex: 0 }];
    } else {
      const leftIdx = activePageIndex % 2 === 1 ? activePageIndex : activePageIndex - 1;
      const rightIdx = leftIdx + 1;
      pagesToRender = [
        { ...pages[leftIdx], pageIndex: leftIdx },
        ...(rightIdx < pages.length ? [{ ...pages[rightIdx], pageIndex: rightIdx }] : [])
      ];
    }
  } else {
    // Single page mode
    const p = pages[activePageIndex] || pages[0];
    pagesToRender = [{ ...p, pageIndex: activePageIndex }];
  }

  // -------------------------------------------------------------
  // RENDER PAGE BY TYPE
  // -------------------------------------------------------------
  const renderPage = (pageItem) => {
    const pageNum = pageItem.pageIndex + 1;
    const totalP = pages.length;

    switch (pageItem.type) {
      // 1. COVER
      case 'cover':
        return (
          <div key={pageItem.pageIndex} className="catalog-page p-4 sm:p-8 md:p-12 flex flex-col justify-between bg-stone-900 text-white relative overflow-hidden select-none">
            {/* Top Brand Monogram */}
            <div className="flex items-center justify-between border-b border-white/20 pb-3 relative z-10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#b4823c]" />
                <span className="text-[10px] sm:text-[11px] font-mono tracking-widest uppercase text-stone-300">
                  {catalog?.coverSubtitle || 'ARCHITECTURAL ISSUE • VOL. 2026'}
                </span>
              </div>
              <span className="text-[11px] sm:text-xs font-mono font-bold tracking-widest text-[#d4af37]">
                {(brand.name || catalog?.title || 'SERAMİKBAK').toUpperCase()}
              </span>
            </div>

            {/* Center Background Artwork */}
            <div className="absolute inset-0 z-0">
              <img
                src={catalog?.sectionSettings?.coverImageUrl || catalog?.coverImageUrl || safeProducts[0]?.imageUrl || '/renders/luxury_bathroom_calacatta_gold.jpg'}
                alt="Architectural Cover"
                className="w-full h-full object-cover opacity-60 filter brightness-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/50 to-transparent" />
            </div>

            {/* Bottom Typographic Title */}
            <div className="relative z-10 space-y-3 sm:space-y-4 pt-16 sm:pt-28 md:pt-40 pb-2 sm:pb-4">
              <span className="px-2.5 sm:px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-mono tracking-widest uppercase bg-[#b4823c] text-white font-bold inline-block shadow-md">
                EDİTORYAL MİMARİ LOOKBOOK
              </span>
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-serif font-black tracking-tight leading-tight text-white max-w-xl">
                {catalog?.coverTitle || catalog?.title || 'TERRA • LUXE'}
              </h1>
              <p className="text-xs sm:text-sm text-stone-300 font-light max-w-lg leading-relaxed">
                {catalog?.introText || 'Yenilikçi yüzey teknolojileri, yüksek mekanik mukavemetli porselen gövde ve çağdaş mimari mekanlar için tasarlanmış geniş ebat plakalar.'}
              </p>

              {/* Editorial Metadata Triplets */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 pt-3 border-t border-white/20 text-stone-300 max-w-lg">
                <div className="bg-white/5 sm:bg-transparent p-2 sm:p-0 rounded-lg">
                  <span className="text-[9px] font-mono tracking-wider text-stone-400 uppercase block">Kürasyon</span>
                  <strong className="text-xs font-serif text-white block mt-0.5">Mimari Porselen</strong>
                </div>
                <div className="bg-white/5 sm:bg-transparent p-2 sm:p-0 rounded-lg">
                  <span className="text-[9px] font-mono tracking-wider text-stone-400 uppercase block">Ebat Yelpazesi</span>
                  <strong className="text-xs font-serif text-white block mt-0.5">60×120 • 20×120 • 30×90</strong>
                </div>
                <div className="bg-white/5 sm:bg-transparent p-2 sm:p-0 rounded-lg">
                  <span className="text-[9px] font-mono tracking-wider text-stone-400 uppercase block">Üretim Standardı</span>
                  <strong className="text-xs font-serif text-white block mt-0.5">EN 14411 Bla / LEED v4</strong>
                </div>
              </div>
            </div>

            {/* Footer Folio */}
            <div className="flex items-center justify-between border-t border-white/20 pt-3 relative z-10 text-[10px] sm:text-[11px] text-stone-400 font-mono">
              <span>{brand.origin || 'Türkiye'}</span>
              <span>SAYFA {String(pageNum).padStart(2, '0')} / {String(totalP).padStart(2, '0')}</span>
            </div>
          </div>
        );

      // 2. MANIFESTO & STORYTELLING
      case 'manifesto':
        return (
          <div key={pageItem.pageIndex} className="catalog-page p-4 sm:p-8 md:p-12 flex flex-col justify-between bg-white text-stone-900 relative overflow-hidden select-none">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <span className="text-[10px] sm:text-[11px] font-mono tracking-widest text-[#b4823c] font-bold uppercase">
                01 • MİMARİ VİZYON & MANİFESTO
              </span>
              <span className="text-[10px] sm:text-[11px] font-mono text-stone-400">
                {brand.name || 'Bien Seramik'}
              </span>
            </div>

            <div className="my-auto py-4 sm:py-6 grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 items-center">
              <div className="md:col-span-7 space-y-3 sm:space-y-4">
                <span className="px-2.5 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[10px] font-mono uppercase tracking-wider font-bold">
                  Koleksiyon Felsefesi
                </span>
                <h2 className="text-xl sm:text-3xl font-serif font-extrabold text-stone-900 leading-tight">
                  &ldquo;Doğanın ham minerallerini, mimarinin kusursuz geometrisiyle dengeliyoruz.&rdquo;
                </h2>
                <div className="space-y-2.5 text-xs text-stone-600 leading-relaxed font-light">
                  <p>
                    {catalog?.description || 'Yüzyıllardır süregelen mermer ve taş mirasının en prestijli temsilcileri; çizilmez porselen teknolojisi, yüksek sürtünme dayanımı ve sıfıra yakın su emme oranlarıyla modern mimari mekanlara zamansız bir kimlik kazandırıyor.'}
                  </p>
                </div>
                <div className="p-3.5 sm:p-4 rounded-2xl bg-[#fbf6ee] border-l-4 border-[#b4823c] text-stone-800 text-xs italic font-serif leading-relaxed">
                  &ldquo;Seramik yalnızca bir zemin kaplaması değil; mekanın hacmini, ışığını ve dokunsal algısını şekillendiren mimari bir kabuktur.&rdquo;
                  <span className="block font-sans font-bold text-[10px] text-[#b4823c] uppercase tracking-wider not-italic mt-1.5">
                    — {brand.name || 'Bien Seramik'} Tasarım Stüdyosu
                  </span>
                </div>
              </div>

              <div className="md:col-span-5 space-y-2.5">
                <div className="rounded-2xl overflow-hidden shadow-md border border-stone-200 aspect-[16/9] sm:aspect-[4/3]">
                  <img
                    src="/renders/luxury_bathroom_albatros_antrasit.jpg"
                    alt="Moodboard"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl overflow-hidden border border-stone-200 aspect-square">
                    <img src="/textures/calacatta_gold.jpg" alt="Macro" className="w-full h-full object-cover" />
                  </div>
                  <div className="rounded-xl overflow-hidden border border-stone-200 aspect-square">
                    <img src="/textures/natural_oak.jpg" alt="Texture" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-stone-200 pt-3 text-[10px] sm:text-[11px] text-stone-400 font-mono">
              <span>MİMARİ MANİFESTO</span>
              <span>SAYFA {String(pageNum).padStart(2, '0')}</span>
            </div>
          </div>
        );

      // 3. PANORAMIC ARCHITECTURAL LIVING SPACE
      case 'panoramic_living_space':
        return (
          <div key={pageItem.pageIndex} className="catalog-page p-4 sm:p-8 md:p-12 flex flex-col justify-between bg-white text-stone-900 relative overflow-hidden select-none">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <span className="text-[10px] sm:text-[11px] font-mono tracking-widest text-[#b4823c] font-bold uppercase">
                02 • MEKÂN KONSEPTİ & UYGULAMA
              </span>
              <span className="text-[10px] sm:text-[11px] font-mono text-stone-400">
                PANORAMİK ÖLÇEK
              </span>
            </div>

            <div className="my-auto py-3 space-y-3 sm:space-y-4">
              <div className="relative rounded-2xl overflow-hidden shadow-xl border border-stone-200 aspect-[4/3] sm:aspect-[16/9] group">
                <img
                  src="/renders/modern_living_natural_oak.jpg"
                  alt="Architectural Living Space"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-4 sm:p-8 text-white">
                  <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-amber-300 font-bold mb-1">
                    REZİDANS & YAŞAM ALANI ENTEGRASYONU
                  </span>
                  <h3 className="text-lg sm:text-2xl font-serif font-bold">
                    Porselen Parke ve Geniş Plaka Füzyonu
                  </h3>
                  <p className="text-xs text-stone-200 font-light mt-1 max-w-xl leading-relaxed">
                    Yerden ısıtmalı zeminlerde ahşap dokunuş ile geniş porselen plakaların monolitik estetiği tek bir hacimde buluşuyor.
                  </p>
                </div>
              </div>

              {/* Space Specification Triplets */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-[10px] font-mono text-stone-400 uppercase block">Derz Genişliği</span>
                  <strong className="text-xs font-serif text-stone-900 block mt-0.5">1.5 mm Lazer Rektifiye</strong>
                  <p className="text-[10px] text-stone-500 mt-0.5">Zeminde monolitik ve kesintisiz akış hissi sağlar.</p>
                </div>
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-[10px] font-mono text-stone-400 uppercase block">Termal Uyumluluk</span>
                  <strong className="text-xs font-serif text-stone-900 block mt-0.5">Yerden Isıtma %100 Uyum</strong>
                  <p className="text-[10px] text-stone-500 mt-0.5">Yüksek ısı iletim katsayısı ile enerji verimliliği.</p>
                </div>
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-[10px] font-mono text-stone-400 uppercase block">3D Simülasyon</span>
                  <Link
                    href="/mekan-dene"
                    className="text-xs font-bold text-[#b4823c] hover:underline flex items-center gap-1 mt-0.5"
                  >
                    <span>Mekânda Canlı Gör →</span>
                  </Link>
                  <p className="text-[10px] text-stone-500 mt-0.5">Kendi odanızın fotoğrafında anında deneyin.</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-stone-200 pt-3 text-[10px] sm:text-[11px] text-stone-400 font-mono">
              <span>MEKÂN ENTEGRASYON ANALİZİ</span>
              <span>SAYFA {String(pageNum).padStart(2, '0')}</span>
            </div>
          </div>
        );

      // 4. HERO SLAB (1:2 MONUMENTAL ASPECT)
      case 'hero_slab':
        const heroSlab = pageItem.product || safeProducts[0];
        return (
          <div key={pageItem.pageIndex} className="catalog-page p-4 sm:p-8 md:p-12 flex flex-col justify-between bg-white text-stone-900 relative overflow-hidden select-none">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <span className="text-[10px] sm:text-[11px] font-mono tracking-widest text-[#b4823c] font-bold uppercase">
                03 • İMZA SERİSİ
              </span>
              <span className="text-[10px] sm:text-[11px] font-mono text-stone-400">
                SKU: {heroSlab.code || heroSlab.sku || 'MİMARİ-ÖZEL'}
              </span>
            </div>

            <div className="my-auto py-3 sm:py-4 grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 items-center">
              <div className="md:col-span-7 space-y-3">
                <div className="relative rounded-2xl overflow-hidden shadow-xl border border-stone-200 aspect-[4/3] sm:aspect-[3/4] group">
                  <img
                    src={heroSlab.imageUrl || '/renders/luxury_bathroom_calacatta_gold.jpg'}
                    alt={heroSlab.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-black/60 backdrop-blur-md text-white flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-[9px] font-mono uppercase text-amber-300 block font-bold">MEKAN UYGULAMASI</span>
                      <p className="text-xs font-serif font-bold truncate">Monolitik Geniş Ebat Kaplama</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleTriggerInquiry(heroSlab, 'sample')}
                      className="px-3 py-1.5 rounded-lg bg-[#b4823c] hover:bg-[#9a6e2e] text-white font-bold text-[10px] shadow transition cursor-pointer flex-shrink-0"
                    >
                      Numune İste
                    </button>
                  </div>
                </div>
              </div>

              <div className="md:col-span-5 space-y-3 sm:space-y-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#b4823c] font-bold block mb-1">
                    {heroSlab.style || 'Mimari Porselen'}
                  </span>
                  <h2 className="text-xl sm:text-3xl font-serif font-black text-stone-900 leading-tight">
                    {heroSlab.name}
                  </h2>
                  <p className="text-xs text-stone-500 font-mono mt-1">
                    {heroSlab.width}×{heroSlab.height} cm • Kalınlık: {heroSlab.thickness ? `${heroSlab.thickness} mm` : '9.5 mm'}
                  </p>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed font-light">
                  {heroSlab.description || 'Derin mineral damar geçişleri ve ışığı kusursuz kıran nano yüzey teknolojisi ile çağdaş hacimler için monolitik estetik.'}
                </p>

                <div className="p-3 sm:p-3.5 rounded-2xl bg-[#fbf6ee] border border-amber-200/60 space-y-1">
                  <span className="text-[10px] font-mono uppercase font-bold text-[#b4823c] block">
                    Mimari Tercih
                  </span>
                  <p className="text-xs text-stone-800 font-serif leading-snug">
                    Yüksek sürtünme mukavemeti ve rektifiye kenar kesimi ile otel, lobi ve prestijli konut projelerinde uzun ömürlü dayanıklılık.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleTriggerInquiry(heroSlab, 'quote')}
                  className="w-full py-2.5 rounded-xl border border-[#b4823c] text-[#b4823c] hover:bg-[#b4823c] hover:text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
                >
                  <Sparkles size={14} />
                  <span>Bu Ürün İçin Proje Fiyatı Al</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-stone-200 pt-3 text-[10px] sm:text-[11px] text-stone-400 font-mono">
              <span>İMZA SERİSİ DETAYI</span>
              <span>SAYFA {String(pageNum).padStart(2, '0')}</span>
            </div>
          </div>
        );

      // 5. MACRO TEXTURE & SPECIFICATIONS
      case 'macro_texture_specs':
        const macroItem = pageItem.product || safeProducts[0];
        return (
          <div key={pageItem.pageIndex} className="catalog-page p-4 sm:p-8 md:p-12 flex flex-col justify-between bg-white text-stone-900 relative overflow-hidden select-none">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <span className="text-[10px] sm:text-[11px] font-mono tracking-widest text-[#b4823c] font-bold uppercase">
                04 • DOKU & MALZEME MÜHENDİSLİĞİ
              </span>
              <span className="text-[10px] sm:text-[11px] font-mono text-stone-400">
                {macroItem.name}
              </span>
            </div>

            <div className="my-auto py-3 sm:py-4 grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 items-center">
              <div className="md:col-span-6 space-y-2.5">
                <div className="relative rounded-2xl overflow-hidden shadow-lg border border-stone-200 aspect-[16/9] sm:aspect-square group">
                  <img
                    src={macroItem.textureUrl || macroItem.imageUrl || '/textures/calacatta_gold.jpg'}
                    alt="10x Macro Surface"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-white text-[9px] font-mono font-bold">
                    10× MAKRO DOKU
                  </div>
                </div>
                <p className="text-[11px] text-stone-500 leading-relaxed font-light text-center">
                  Doğal mineral geçişleri ve mikrometrik rektifiye kenar kesimi.
                </p>
              </div>

              <div className="md:col-span-6 space-y-3">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-stone-400 font-bold block">
                    Fiziksel Özellikler
                  </span>
                  <h3 className="text-lg sm:text-xl font-serif font-bold text-stone-900">
                    Porselen Gövde Spesifikasyonu
                  </h3>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-stone-100 text-stone-700">
                    <span className="font-semibold text-stone-500">Nominal Ebat:</span>
                    <strong className="font-mono text-stone-900">{macroItem.width}×{macroItem.height} cm</strong>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-stone-100 text-stone-700">
                    <span className="font-semibold text-stone-500">Gövde Kalınlığı:</span>
                    <strong className="font-mono text-stone-900">{macroItem.thickness ? `${macroItem.thickness} mm` : '9.5 mm'}</strong>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-stone-100 text-stone-700">
                    <span className="font-semibold text-stone-500">Yüzey Karakteri:</span>
                    <strong className="text-stone-800">{macroItem.finish || 'Mat Porselen'}</strong>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-stone-100 text-stone-700">
                    <span className="font-semibold text-stone-500">Aşınma Direnci:</span>
                    <strong className="font-mono text-[#b4823c] font-bold">
                      {macroItem.peiRating ? `PEI ${macroItem.peiRating}` : 'PEI IV'}
                    </strong>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-stone-100 text-stone-700">
                    <span className="font-semibold text-stone-500">Kaymazlık Sınıfı:</span>
                    <strong className="font-mono">{macroItem.slipResistance || 'R10'} (DIN 51130)</strong>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-stone-100 text-stone-700">
                    <span className="font-semibold text-stone-500">Su Emme Katsayısı:</span>
                    <strong className="font-mono text-emerald-700 font-bold">&lt; %0.05</strong>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-stone-100 text-stone-700">
                    <span className="font-semibold text-stone-500">Kenar Tipi:</span>
                    <strong className="text-stone-800">{macroItem.rectified ? 'Lazer Rektifiye' : 'Standart'}</strong>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleTriggerInquiry(macroItem, 'sample')}
                  className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                >
                  <Package size={14} />
                  <span>Numune Kiti ve Teknik Föy İste</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-stone-200 pt-3 text-[10px] sm:text-[11px] text-stone-400 font-mono">
              <span>MALZEME VE DOKU ANALİZİ</span>
              <span>SAYFA {String(pageNum).padStart(2, '0')}</span>
            </div>
          </div>
        );

      // 6. COLLECTION FAMILY & COMPARISON MATRIX
      case 'collection_matrix':
        return (
          <div key={pageItem.pageIndex} className="catalog-page p-4 sm:p-8 md:p-12 flex flex-col justify-between bg-white text-stone-900 relative overflow-hidden select-none">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <span className="text-[10px] sm:text-[11px] font-mono tracking-widest text-[#b4823c] font-bold uppercase">
                05 • KOLEKSİYON AİLESİ
              </span>
              <span className="text-[10px] sm:text-[11px] font-mono text-stone-400">
                {safeProducts.length} SEÇKİN MODEL
              </span>
            </div>

            <div className="pt-1 sm:pt-2">
              <h2 className="text-xl sm:text-2xl font-serif font-extrabold text-stone-900">
                Küratör Porselen Yelpazesi
              </h2>
              <p className="text-xs text-stone-500 font-light mt-0.5">
                Mekanın fonksiyonuna göre optimize edilmiş yüzey ve ebat seçenekleri.
              </p>
            </div>

            <div className="my-auto py-2.5 sm:py-3 grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              {safeProducts.slice(0, 6).map((p, idx) => (
                <div
                  key={p.id || idx}
                  onClick={() => handleTriggerInquiry(p, 'quote')}
                  className="group p-2.5 sm:p-3 rounded-2xl bg-stone-50/70 border border-stone-200/80 hover:border-amber-400/80 hover:bg-white transition-all shadow-2xs hover:shadow-md cursor-pointer flex flex-col justify-between"
                >
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-white mb-2 border border-stone-200">
                    <img
                      src={p.textureUrl || p.imageUrl || '/textures/calacatta_gold.jpg'}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-mono font-bold bg-black/70 text-white backdrop-blur-xs">
                      {p.width && p.height ? `${p.width}×${p.height} cm` : 'Plaka'}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[8px] sm:text-[9px] font-mono text-stone-400 uppercase block">0{idx + 1} • {p.style || 'Mimari Seri'}</span>
                    <h4 className="text-xs font-bold text-stone-900 group-hover:text-[#b4823c] transition truncate">
                      {p.name}
                    </h4>
                    <div className="flex items-center justify-between text-[10px] text-stone-500 pt-1 border-t border-stone-100">
                      <span className="truncate">{p.finish || 'Mat'}</span>
                      <span className="font-mono font-bold text-stone-700 flex-shrink-0">
                        {p.peiRating ? `PEI ${p.peiRating}` : 'PEI IV'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-stone-200 pt-3 text-[10px] sm:text-[11px] text-stone-400 font-mono">
              <span>KOLEKSİYON GENEL BAKIŞ</span>
              <span>SAYFA {String(pageNum).padStart(2, '0')}</span>
            </div>
          </div>
        );

      // 7. SPECS TABLE (LOGISTICS & PACKAGING)
      case 'specs_table':
        return (
          <div key={pageItem.pageIndex} className="catalog-page p-4 sm:p-8 md:p-12 flex flex-col justify-between bg-white text-stone-900 relative overflow-hidden select-none">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <span className="text-[10px] sm:text-[11px] font-mono tracking-widest text-[#b4823c] font-bold uppercase">
                06 • TEKNİK ŞARTNAME & LOJİSTİK
              </span>
              <span className="text-[10px] sm:text-[11px] font-mono text-stone-400">
                STANDART: ISO 13006
              </span>
            </div>

            <div className="pt-1 sm:pt-2">
              <h2 className="text-xl sm:text-2xl font-serif font-extrabold text-stone-900">
                Mimari Teknik Spesifikasyonlar
              </h2>
              <p className="text-xs text-stone-500 font-light mt-0.5">
                İnşaat şartnameleri ve lojistik planlaması için teyitli parametreler.
              </p>
            </div>

            <div className="my-auto py-2 overflow-x-auto -mx-1 px-1">
              <table className="w-full text-left text-xs border-collapse min-w-[500px]">
                <thead>
                  <tr className="border-b-2 border-stone-300 bg-stone-100/70 text-[11px] font-mono text-stone-600">
                    <th className="py-2 px-3">Ürün Adı & Kodu</th>
                    <th className="py-2 px-3">Ebat</th>
                    <th className="py-2 px-3">Yüzey</th>
                    <th className="py-2 px-3">PEI</th>
                    <th className="py-2 px-3">Kaymazlık</th>
                    <th className="py-2 px-3">Kutu</th>
                    <th className="py-2 px-3 text-right">Aksiyon</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700">
                  {safeProducts.map((p, pIdx) => (
                    <tr key={p.id || pIdx} className="hover:bg-amber-50/40 transition">
                      <td className="py-2 px-3">
                        <strong className="text-stone-900 block font-serif">{p.name}</strong>
                        <span className="text-[10px] font-mono text-stone-400">{p.code || p.sku}</span>
                      </td>
                      <td className="py-2 px-3 font-mono font-bold text-stone-800">{p.width}×{p.height} cm</td>
                      <td className="py-2 px-3 text-stone-600">{p.finish || 'Mat'}</td>
                      <td className="py-2 px-3 font-mono font-bold text-[#b4823c]">
                        {p.peiRating ? `PEI ${p.peiRating}` : 'PEI IV'}
                      </td>
                      <td className="py-2 px-3 font-mono">{p.slipResistance || 'R10'}</td>
                      <td className="py-2 px-3 font-mono">1.44 m²</td>
                      <td className="py-2 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleTriggerInquiry(p, 'quote')}
                          className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-[#b4823c] hover:text-white text-stone-700 text-[10px] font-bold transition cursor-pointer"
                        >
                          Teklif Al
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2.5 sm:p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-center">
              <div>
                <span className="text-[9px] sm:text-[10px] font-mono text-stone-400 block uppercase">Su Emme</span>
                <strong className="text-xs font-bold text-stone-800 font-mono">E ≤ 0.05%</strong>
              </div>
              <div>
                <span className="text-[9px] sm:text-[10px] font-mono text-stone-400 block uppercase">Donma Direnci</span>
                <strong className="text-xs font-bold text-emerald-700 font-mono">Dayanıklı (EN ISO)</strong>
              </div>
              <div>
                <span className="text-[9px] sm:text-[10px] font-mono text-stone-400 block uppercase">Kimyasal Direnç</span>
                <strong className="text-xs font-bold text-stone-800 font-mono">Sınıf GA / GLA</strong>
              </div>
              <div>
                <span className="text-[9px] sm:text-[10px] font-mono text-stone-400 block uppercase">Çevre Standardı</span>
                <strong className="text-xs font-bold text-[#b4823c] font-mono">LEED / EPD</strong>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-stone-200 pt-3 text-[10px] sm:text-[11px] text-stone-400 font-mono">
              <span>TEKNİK ŞARTNAME BİLGİLERİ</span>
              <span>SAYFA {String(pageNum).padStart(2, '0')}</span>
            </div>
          </div>
        );

      // 8. BACK COVER
      case 'back_cover':
        return (
          <div key={pageItem.pageIndex} className="catalog-page p-4 sm:p-8 md:p-12 flex flex-col justify-between bg-stone-950 text-white relative overflow-hidden select-none text-center">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 text-left">
              <span className="text-[10px] sm:text-[11px] font-mono tracking-widest text-stone-400 uppercase">
                KURUMSAL ARKA KAPAK
              </span>
              <span className="text-[10px] sm:text-[11px] font-mono text-[#d4af37] font-bold">
                {brand.name || catalog?.title || 'Bien Seramik'}
              </span>
            </div>

            <div className="my-auto py-4 sm:py-8 max-w-sm mx-auto space-y-4 sm:space-y-6">
              <div className="space-y-1.5 sm:space-y-2">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-[#b4823c] text-white flex items-center justify-center font-serif text-xl sm:text-2xl font-black mx-auto shadow-xl">
                  {(brand.name || 'BS').slice(0, 2).toUpperCase()}
                </div>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
                  {brand.name || 'Bien Seramik'}
                </h2>
                <p className="text-xs text-stone-400 font-light">
                  {catalog?.websiteUrl || 'www.seramikbak.com'}
                </p>
              </div>

              {/* 3D QR Code Showcase */}
              <div className="p-3.5 sm:p-4 rounded-3xl bg-white/5 border border-white/10 space-y-2">
                <span className="text-[10px] font-mono uppercase text-amber-300 font-bold block">
                  3D MEKANDA DENE & VİRTUAL STUDIO
                </span>
                <div className="w-24 h-24 sm:w-28 sm:h-28 bg-white p-2 rounded-2xl mx-auto flex items-center justify-center shadow-sm">
                  <div className="w-full h-full bg-stone-900 rounded-xl flex flex-col items-center justify-center text-white">
                    <QrCode size={44} className="text-amber-400" />
                    <span className="text-[8px] font-mono text-stone-300 mt-0.5">3D SCAN</span>
                  </div>
                </div>
                <p className="text-[10px] sm:text-[11px] text-stone-300 font-light">
                  Kameranızla QR kodu okutarak bu karoları odanızda anında 3D deneyimleyin.
                </p>
                <Link
                  href="/mekan-dene"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:underline pt-0.5"
                >
                  <span>3D Mekan Motorunu Başlat</span>
                  <ArrowRight size={13} />
                </Link>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left text-xs">
                <div className="p-2.5 sm:p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[9px] font-mono text-stone-400 uppercase block font-bold">Mimar Masası</span>
                  <p className="font-bold text-white text-xs mt-0.5">{catalog?.contactPhone || '+90 850 888 00 00'}</p>
                  <span className="text-[10px] text-stone-400">{catalog?.contactEmail || 'proje@seramikbak.com'}</span>
                </div>
                <div className="p-2.5 sm:p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[9px] font-mono text-stone-400 uppercase block font-bold">Genel Merkez</span>
                  <p className="text-stone-300 font-medium text-[11px] mt-0.5 leading-snug">
                    {catalog?.contactAddress || 'Bilecik Fabrika & İstanbul Showroom'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-white/10 pt-3 text-[10px] sm:text-[11px] text-stone-400 font-mono text-left">
              <span>SERAMİKBAK DİJİTAL LOOKBOOK</span>
              <span>SAYFA {String(pageNum).padStart(2, '0')}</span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`catalog-template-architectural ${isLandscape ? 'orientation-landscape' : 'orientation-portrait'}`}>
      {viewFormat === 'spread' && !isPrint ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pagesToRender.map(renderPage)}
        </div>
      ) : (
        <div className="space-y-6">
          {pagesToRender.map(renderPage)}
        </div>
      )}
    </div>
  );
}
