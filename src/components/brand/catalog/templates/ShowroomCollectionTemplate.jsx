'use client';

import React, { useState } from 'react';
import {
  Building,
  QrCode,
  ExternalLink,
  Sparkles,
  Tag,
  Store,
  Layers,
  Palette,
  CheckCircle2,
  Box,
  ShieldCheck,
  Snowflake,
  Compass,
  Eye,
  Maximize2
} from 'lucide-react';

export default function ShowroomCollectionTemplate({
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

  // Safe fallback products
  const safeProducts = products && products.length > 0 ? products : [
    {
      id: 'demo-sh-1',
      name: 'Calacatta Michelangelo',
      collection: 'Prestige Marble',
      code: 'PRE-CAL-120',
      color: 'Warm White & Gold',
      finish: 'Silk Lappato',
      width: 120,
      height: 280,
      thickness: '6',
      rectified: true,
      slipResistance: 'R10',
      peiRating: '4',
      imageUrl: '/renders/luxury_bathroom_calacatta_gold.jpg',
      textureUrl: '/textures/calacatta_gold.jpg',
      description: 'Prestijli rezidans ve otel lobileri için kesintisiz altın damarlı mermer zarafeti.',
      trendyolPrice: '1450',
      curatedMoodboard: [
        { name: 'Sıcak Meşe', type: 'Ahşap', color: '#c49a6c' },
        { name: 'Brushed Brass', type: 'Metal', color: '#d4af37' },
        { name: 'Vizon Keten', type: 'Tekstil', color: '#b8a99a' }
      ]
    },
    {
      id: 'demo-sh-2',
      name: 'Loft Beton Grigio',
      collection: 'Urban Contemporary',
      code: 'URB-LFT-6012',
      color: 'Misty Grey',
      finish: 'Mat Doğal',
      width: 60,
      height: 120,
      thickness: '9.5',
      rectified: true,
      slipResistance: 'R10B',
      peiRating: '5',
      imageUrl: '/renders/luxury_bathroom_loft_beton.jpg',
      textureUrl: '/textures/loft_beton.jpg',
      description: 'Minimalist mimari yapılar ve modern salonlar için mikroskopik agregalı brüt beton dokusu.',
      trendyolPrice: '980',
      curatedMoodboard: [
        { name: 'Füme Meşe', type: 'Ahşap', color: '#544d47' },
        { name: 'Mat Siyah Demir', type: 'Metal', color: '#2b2b2b' },
        { name: 'Antrasit Yün', type: 'Tekstil', color: '#3d4047' }
      ]
    }
  ];

  const pages = [];
  if (catalog?.showCover !== false) pages.push({ type: 'cover' });

  // Group products 2 per page for showroom presentation
  for (let i = 0; i < safeProducts.length; i += 2) {
    pages.push({
      type: 'products',
      items: safeProducts.slice(i, i + 2),
      chunkIndex: Math.floor(i / 2)
    });
  }

  if (catalog?.showContactPage !== false) pages.push({ type: 'contact' });

  const renderSinglePage = (pageObj, pageIndex) => {
    if (!pageObj) return null;

    // -------------------------------------------------------------------------
    // COVER — BOUTIQUE SHOWROOM & RETAIL SELECTION
    // -------------------------------------------------------------------------
    if (pageObj.type === 'cover') {
      const coverHero =
        safeProducts[0]?.imageUrl ||
        safeProducts[0]?.textureUrl ||
        '/renders/luxury_bathroom_calacatta_gold.jpg';

      return (
        <section
          key="cover"
          className="catalog-page relative p-8 sm:p-14 text-white flex flex-col justify-between overflow-hidden"
          style={{
            background: `radial-gradient(circle at 75% 25%, rgba(217, 119, 6, 0.3) 0%, transparent 60%), linear-gradient(135deg, rgba(28, 25, 23, 0.96) 0%, rgba(68, 64, 60, 0.90) 60%, rgba(120, 53, 15, 0.85) 100%), url(${coverHero}) center/cover no-repeat`,
            backgroundColor: '#1c1917'
          }}
        >
          {/* Decorative Warm Terracotta Border */}
          <div className="absolute inset-5 sm:inset-7 border border-amber-400/25 pointer-events-none rounded-2xl" />

          <div className="relative z-10 flex items-center justify-between border-b border-white/20 pb-5">
            <span className="text-2xl sm:text-3xl font-serif font-bold tracking-wider uppercase text-white">
              {brand.name || 'SERAMİKBAK'}
            </span>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-mono">
              <Store size={13} />
              <span>SHOWROOM LOOKBOOK &bull; {new Date().getFullYear()}</span>
            </div>
          </div>

          <div className="relative z-10 my-auto py-10 max-w-2xl font-serif">
            <span className="text-xs font-sans font-bold tracking-widest uppercase text-amber-400 bg-amber-400/10 px-4 py-1.5 rounded-full border border-amber-400/30 inline-block mb-5">
              MAĞAZA & PERAKENDE SEÇKİSİ
            </span>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-light text-white leading-tight mb-5">
              {catalog?.coverTitle || catalog?.title || 'Boutique Showroom Koleksiyonu'}
            </h1>
            {catalog?.coverSubtitle && (
              <p className="text-lg sm:text-xl text-stone-200 font-sans font-light leading-relaxed mb-6">
                {catalog.coverSubtitle}
              </p>
            )}
            {catalog?.introText && (
              <p className="text-xs sm:text-sm text-stone-300 font-sans font-light leading-relaxed max-w-lg border-l-2 border-amber-400 pl-4 py-1">
                {catalog.introText}
              </p>
            )}
          </div>

          <div className="relative z-10 border-t border-white/20 pt-4 flex justify-between text-xs text-stone-400 font-sans">
            <span>{brand.name || 'SeramikBak'} Yetkili Showroom Ağı</span>
            <span className="text-amber-400/80">Perakende & İç Mimari Seçkisi</span>
          </div>
        </section>
      );
    }

    // -------------------------------------------------------------------------
    // PRODUCTS SPREAD — ELEVATED SHOWROOM & INTERIOR GALLERY DESIGN
    // -------------------------------------------------------------------------
    if (pageObj.type === 'products') {
      const pair = pageObj.items;

      return (
        <section
          key={pageIndex}
          className="catalog-page relative p-6 sm:p-10 text-stone-900 flex flex-col justify-between overflow-hidden"
          style={{
            background:
              'radial-gradient(circle at 10% 10%, rgba(217, 119, 6, 0.04) 0%, transparent 40%), radial-gradient(circle at 90% 90%, rgba(180, 83, 9, 0.04) 0%, transparent 40%), #fcfaf6'
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-stone-300 pb-3 mb-4">
            <div className="flex items-center gap-3">
              <span className="font-serif font-bold text-sm tracking-wider uppercase text-stone-900">
                {brand.name || 'SERAMİKBAK'}
              </span>
              <span className="text-stone-300">&bull;</span>
              <span className="text-xs text-stone-600 font-medium">{catalog?.title || 'Showroom Rehberi'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-300">
                BOUTIQUE GALLERY
              </span>
              <span className="text-xs font-mono text-stone-400">
                {(pageIndex + 1).toString().padStart(2, '0')}
              </span>
            </div>
          </div>

          {/* 2-Product Elevated Luxury Gallery Grid */}
          <div
            className={`grid ${
              pair.length === 2 ? 'grid-cols-1 md:grid-cols-2 gap-5' : 'grid-cols-1 max-w-lg mx-auto w-full'
            } flex-1 my-auto`}
          >
            {pair.map((p, idx) => {
              const pImage = p.imageUrl || p.textureUrl || '/renders/luxury_bathroom_calacatta_gold.jpg';
              const dimensions = p.width && p.height ? `${p.width} × ${p.height} cm` : '60 × 120 cm';
              const pThickness = p.thickness ? `${p.thickness} mm` : '9 mm';

              return (
                <div
                  key={p.id || idx}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/90 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    {/* Visual Ambient Stage with Spatial Pins & Magnifier */}
                    <div className="relative rounded-xl overflow-hidden bg-stone-100 aspect-[16/11] mb-3.5 border border-stone-200 shadow-xs group">
                      <img
                        src={pImage}
                        alt={p.name}
                        onError={() => handleImgError(`pair-${p.id}`)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />

                      {/* Spatial Interior Hotspot Pin 01: Floor/Wall In-Situ */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/75 backdrop-blur-md text-white text-[9px] font-mono px-2 py-0.5 rounded-full border border-white/20 shadow">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        <span>Mekan Uygulaması: {p.finish || 'Lappato'}</span>
                      </div>

                      {/* Dimensions & Rectified Badge */}
                      <div className="absolute top-3 right-3 flex items-center gap-1">
                        <span className="bg-stone-950/85 backdrop-blur-md text-white px-2 py-0.5 rounded text-[10px] font-mono font-bold shadow">
                          {dimensions}
                        </span>
                        <span className="bg-amber-500 text-stone-950 px-1.5 py-0.5 rounded text-[9px] font-bold shadow">
                          {pThickness}
                        </span>
                      </div>

                      {/* 1:1 Macro Texture Circular Loupe Callout (Bottom Right) */}
                      {p.textureUrl && (
                        <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 bg-white/95 backdrop-blur-md p-1 rounded-full border border-stone-300 shadow-md">
                          <img
                            src={p.textureUrl}
                            alt="1:1 Zoom"
                            className="w-8 h-8 rounded-full object-cover border border-amber-500/60"
                          />
                          <div className="pr-2 hidden sm:block">
                            <span className="text-[8px] font-bold block uppercase text-stone-900 leading-none">1:1 Zoom</span>
                            <span className="text-[7px] text-stone-500 font-mono">Doku Detayı</span>
                          </div>
                        </div>
                      )}

                      {/* Bottom Left: Laser Rectified Callout */}
                      <div className="absolute bottom-2.5 left-2.5 bg-white/90 backdrop-blur-md text-stone-900 px-2 py-0.5 rounded text-[9px] font-bold shadow flex items-center gap-1">
                        <CheckCircle2 size={10} className="text-emerald-600" />
                        <span>Lazer Rektifiye 0.5mm Derz</span>
                      </div>
                    </div>

                    {/* Metadata Header */}
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {p.code ? `KOD: ${p.code}` : `REF: SB-${idx + 101}`}
                      </span>
                      <span className="text-[10px] text-stone-500 font-mono flex items-center gap-1">
                        <Store size={10} className="text-stone-400" />
                        <span>Stand: #{idx + 1} &bull; Vitrin Seçkisi</span>
                      </span>
                    </div>

                    <h4 className="text-xl font-serif font-bold text-stone-900 mb-1 leading-snug">
                      {p.name}
                    </h4>

                    <p className="text-xs text-stone-500 mb-3 font-medium">
                      Koleksiyon: <strong className="text-stone-800">{p.collection || p.style || 'Lüks Porselen'}</strong> &bull; Renk:{' '}
                      <strong className="text-stone-800">{p.color || 'Doğal'}</strong>
                    </p>

                    {/* Curated Material Harmony Moodboard (Wood, Metal, Fabric) */}
                    <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 mb-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold text-stone-700 flex items-center gap-1">
                          <Palette size={11} className="text-amber-600" />
                          <span>İç Mimar Moodboard Uyumu</span>
                        </span>
                        <span className="text-[9px] text-stone-400 font-mono">Doğal Eşleşme</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {(p.curatedMoodboard || [
                          { name: 'Doğal Meşe', type: 'Ahşap', color: '#c49a6c' },
                          { name: 'Pirinç / Gold', type: 'Metal', color: '#d4af37' },
                          { name: 'Keten Dokuma', type: 'Tekstil', color: '#b8a99a' }
                        ]).map((chip, cIdx) => (
                          <div key={cIdx} className="flex items-center gap-1.5 p-1 bg-white rounded border border-stone-200/80">
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-black/10 flex-shrink-0"
                              style={{ backgroundColor: chip.color }}
                            />
                            <div className="min-w-0">
                              <span className="text-[9px] font-bold text-stone-800 block truncate leading-tight">{chip.name}</span>
                              <span className="text-[8px] text-stone-400 block leading-none">{chip.type}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Quick Specs Capsule Row */}
                    <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] mb-3 font-mono">
                      <div className="bg-stone-50 p-1 rounded border border-stone-200">
                        <span className="text-[8px] text-stone-400 uppercase block">Kaymazlık</span>
                        <span className="font-bold text-stone-900">{p.slipResistance || 'R10'}</span>
                      </div>
                      <div className="bg-stone-50 p-1 rounded border border-stone-200">
                        <span className="text-[8px] text-stone-400 uppercase block">Aşınma</span>
                        <span className="font-bold text-stone-900">PEI {p.peiRating || '4'}</span>
                      </div>
                      <div className="bg-stone-50 p-1 rounded border border-stone-200">
                        <span className="text-[8px] text-stone-400 uppercase block">Su Emme</span>
                        <span className="font-bold text-stone-900">&le;%0.05</span>
                      </div>
                      <div className="bg-stone-50 p-1 rounded border border-stone-200">
                        <span className="text-[8px] text-stone-400 uppercase block">Yüzey</span>
                        <span className="font-bold text-stone-900 truncate">{p.finish || 'Mat'}</span>
                      </div>
                    </div>

                    {/* Retail Price Card */}
                    {catalog?.showPrices && p.trendyolPrice && (
                      <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex justify-between items-center mb-3">
                        <div>
                          <span className="text-[10px] font-mono text-amber-900 font-bold uppercase block">
                            m² Liste Fiyatı:
                          </span>
                          <span className="text-[9px] text-amber-700">Tavsiye Edilen Perakende</span>
                        </div>
                        <span className="text-lg font-bold text-amber-950 font-serif">
                          {p.trendyolPrice} TL <span className="text-xs font-sans font-normal">/ m²</span>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 3D Visualizer & In-Store Kiosk QR Code Bridge */}
                  {catalog?.showQrCodes !== false && (
                    <div className="pt-3 border-t border-stone-200 flex items-center gap-3">
                      {p.qrCodeUrl ? (
                        <img
                          src={p.qrCodeUrl}
                          alt="QR"
                          className="w-12 h-12 rounded-xl border border-stone-300 p-1 bg-white shadow-xs flex-shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl border border-stone-300 p-2 bg-white shadow-xs flex items-center justify-center flex-shrink-0">
                          <QrCode size={26} className="text-stone-800" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-stone-900 leading-tight">
                          Mekanında 3D / AR Gör
                        </p>
                        <p className="text-[10px] text-stone-500 leading-tight">
                          Kameranızla okutun, evinizde veya projenizde anında deneyimleyin.
                        </p>
                        <a
                          href={p.tryInRoomUrl || p.productUrl || '#'}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] font-bold text-amber-800 hover:underline flex items-center gap-1 mt-0.5"
                        >
                          <span>3D Odada Aç</span>
                          <ExternalLink size={10} />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="border-t border-stone-300 pt-3 flex justify-between text-xs text-stone-500 font-sans">
            <span>{brand.name || 'SeramikBak'} Showroom Rehberi &bull; İtalyan Seramik Seçkisi</span>
            <span>Sayfa {(pageIndex + 1).toString().padStart(2, '0')}</span>
          </div>
        </section>
      );
    }

    // -------------------------------------------------------------------------
    // CONTACT
    // -------------------------------------------------------------------------
    if (pageObj.type === 'contact') {
      return (
        <section
          key="contact"
          className="catalog-page relative p-8 sm:p-14 bg-stone-900 text-white flex flex-col justify-between overflow-hidden"
        >
          <div className="border-b border-white/20 pb-4 flex justify-between items-center">
            <span className="text-xl font-serif font-bold uppercase">{brand.name || 'SERAMİKBAK'}</span>
            <span className="text-xs text-amber-300 font-mono">MAĞAZA VE BAYİ AĞI</span>
          </div>

          <div className="my-auto py-8 max-w-xl">
            <h3 className="text-3xl font-serif text-white mb-3">
              Yetkili Showroom & Bayi Noktaları
            </h3>
            <p className="text-xs text-stone-300 leading-relaxed mb-6 font-light">
              Koleksiyonlarımızı canlı görmek, plaka numunelerini incelemek ve uzman mimari danışmanlık almak için en yakın showroom mağazamızı ziyaret edebilirsiniz.
            </p>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3 text-xs">
              {catalog?.contactAddress && (
                <div className="flex gap-4">
                  <span className="w-20 text-amber-300">Merkez:</span>
                  <span>{catalog.contactAddress}</span>
                </div>
              )}
              {catalog?.contactPhone && (
                <div className="flex gap-4">
                  <span className="w-20 text-amber-300">Telefon:</span>
                  <a href={`tel:${catalog.contactPhone}`} className="text-white font-bold hover:underline">
                    {catalog.contactPhone}
                  </a>
                </div>
              )}
              {catalog?.contactEmail && (
                <div className="flex gap-4">
                  <span className="w-20 text-amber-300">E-Posta:</span>
                  <a href={`mailto:${catalog.contactEmail}`} className="text-white font-bold hover:underline">
                    {catalog.contactEmail}
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-white/20 pt-4 flex justify-between text-xs text-stone-400">
            <span>&copy; {new Date().getFullYear()} {brand.name || 'SeramikBak'} Showroom Ağı</span>
            <span>SeramikBak Dijital Mağaza</span>
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

  if (viewFormat === 'spread') {
    if (activePageIndex === 0) {
      return (
        <div className="w-full flex justify-center">
          {renderSinglePage(pages[0], 0)}
        </div>
      );
    }

    const leftIdx = activePageIndex % 2 === 1 ? activePageIndex : activePageIndex - 1;
    const rightIdx = leftIdx + 1;

    return (
      <div className="w-full flex justify-center items-center gap-1 sm:gap-2">
        <div className="w-1/2 flex justify-end">
          {renderSinglePage(pages[leftIdx], leftIdx)}
        </div>
        <div className="w-1/2 flex justify-start">
          {rightIdx < pages.length ? renderSinglePage(pages[rightIdx], rightIdx) : (
            <div className="catalog-page bg-stone-100 flex items-center justify-center text-stone-400 text-xs font-mono">
              [BOŞ SAYFA / ARKA KAPAK]
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-10 items-center">
      {pages.map((p, idx) => renderSinglePage(p, idx))}
    </div>
  );
}
