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
  CheckCircle2
} from 'lucide-react';

export default function ShowroomCollectionTemplate({
  catalog,
  products = [],
  mode = 'preview',
  activePageIndex = 0,
  viewFormat = 'single'
}) {
  const brand = catalog.brand || {};
  const logo = catalog.customLogoUrl || brand.logoUrl;
  const [imgErrors, setImgErrors] = useState({});

  const handleImgError = (id) => {
    setImgErrors((prev) => ({ ...prev, [id]: true }));
  };

  const pages = [];
  if (catalog.showCover) pages.push({ type: 'cover' });

  // Group products 2 per page for showroom presentation
  for (let i = 0; i < products.length; i += 2) {
    pages.push({
      type: 'products',
      items: products.slice(i, i + 2),
      chunkIndex: Math.floor(i / 2)
    });
  }

  if (catalog.showContactPage) pages.push({ type: 'contact' });

  const renderSinglePage = (pageObj, pageIndex) => {
    if (!pageObj) return null;

    // -------------------------------------------------------------------------
    // COVER — BOUTIQUE SHOWROOM & RETAIL SELECTION
    // -------------------------------------------------------------------------
    if (pageObj.type === 'cover') {
      const coverHero =
        products[0]?.imageUrl ||
        products[0]?.textureUrl ||
        '/renders/luxury_bathroom_calacatta_gold.jpg';

      return (
        <section
          key="cover"
          className="catalog-page relative p-8 sm:p-14 text-white flex flex-col justify-between overflow-hidden"
          style={{
            background: `radial-gradient(circle at 75% 25%, rgba(217, 119, 6, 0.25) 0%, transparent 60%), linear-gradient(135deg, rgba(28, 25, 23, 0.96) 0%, rgba(68, 64, 60, 0.90) 60%, rgba(120, 53, 15, 0.85) 100%), url(${coverHero}) center/cover no-repeat`,
            backgroundColor: '#1c1917'
          }}
        >
          {/* Decorative Warm Terracotta Border */}
          <div className="absolute inset-5 sm:inset-7 border border-amber-400/25 pointer-events-none rounded-2xl" />

          <div className="relative z-10 flex items-center justify-between border-b border-white/20 pb-5">
            <span className="text-2xl sm:text-3xl font-serif font-bold tracking-wider uppercase text-white">
              {brand.name}
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
              {catalog.coverTitle || catalog.title}
            </h1>
            {catalog.coverSubtitle && (
              <p className="text-lg sm:text-xl text-stone-200 font-sans font-light leading-relaxed mb-6">
                {catalog.coverSubtitle}
              </p>
            )}
            {catalog.introText && (
              <p className="text-xs sm:text-sm text-stone-300 font-sans font-light leading-relaxed max-w-lg border-l-2 border-amber-400 pl-4 py-1">
                {catalog.introText}
              </p>
            )}
          </div>

          <div className="relative z-10 border-t border-white/20 pt-4 flex justify-between text-xs text-stone-400 font-sans">
            <span>{brand.name} Yetkili Showroom Ağı</span>
            <span className="text-amber-400/80">SeramikBak Perakende Stüdyosu</span>
          </div>
        </section>
      );
    }

    // -------------------------------------------------------------------------
    // PRODUCTS SPREAD — BALANCED 2-PRODUCT SHOWROOM PRESENTATION
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
          <div className="flex items-center justify-between border-b-2 border-stone-300 pb-3 mb-3">
            <div className="flex items-center gap-3">
              <span className="font-serif font-bold text-sm tracking-wider uppercase text-stone-900">
                {brand.name}
              </span>
              <span className="text-stone-300">&bull;</span>
              <span className="text-xs text-stone-600 font-medium">{catalog.title}</span>
            </div>
            <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-300">
              SHOWROOM SEÇKİSİ
            </span>
          </div>

          {/* 2-Product Balanced Showcase */}
          <div
            className={`grid ${
              pair.length === 2 ? 'grid-cols-1 md:grid-cols-2 gap-4' : 'grid-cols-1 max-w-lg mx-auto w-full'
            } flex-1 my-auto`}
          >
            {pair.map((p, idx) => {
              const pImage = p.imageUrl || p.textureUrl || '/renders/luxury_bathroom_calacatta_gold.jpg';
              const dimensions = p.width && p.height ? `${p.width} × ${p.height} cm` : '60 × 120 cm';

              return (
                <div
                  key={p.id || idx}
                  className="bg-white rounded-2xl p-4 sm:p-5 border-2 border-stone-200/90 shadow-md flex flex-col justify-between"
                >
                  <div>
                    {/* Visual Stage */}
                    <div className="relative rounded-xl overflow-hidden bg-stone-100 aspect-[16/11] mb-3 border border-stone-200 shadow-sm group">
                      <img
                        src={pImage}
                        alt={p.name}
                        onError={() => handleImgError(`pair-${p.id}`)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-2.5 right-2.5 bg-stone-950/85 backdrop-blur-sm text-white px-2.5 py-1 rounded text-xs font-mono font-bold shadow">
                        {dimensions}
                      </div>
                      <div className="absolute bottom-2.5 left-2.5 bg-white/95 backdrop-blur-sm text-stone-900 px-2.5 py-0.5 rounded text-[11px] font-bold shadow">
                        {p.finish || 'Mat'} Yüzey
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {p.code ? `KOD: ${p.code}` : `REF: SB-${idx + 101}`}
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono">
                        Stand No: #{idx + 1}
                      </span>
                    </div>

                    <h4 className="text-xl font-serif font-bold text-stone-900 mb-1">
                      {p.name}
                    </h4>

                    <p className="text-xs text-stone-500 mb-3 font-medium">
                      Kategori: <strong className="text-stone-800">{p.style || 'Lüks Porselen'}</strong> &bull; Renk:{' '}
                      <strong className="text-stone-800">{p.color || 'Doğal'}</strong>
                    </p>

                    {/* Showroom Grout & Pairing Advice */}
                    <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 mb-3 text-[11px] space-y-1">
                      <p className="font-bold text-stone-800 flex items-center gap-1.5">
                        <Palette size={12} className="text-amber-600" />
                        <span>Tavsiye Edilen Derz Uyumu</span>
                      </p>
                      <p className="text-stone-600 text-[10px]">
                        Fildişi / Bej #04 veya Sıcak Antrasit #18 (1-2 mm lazer derz)
                      </p>
                    </div>

                    {/* Retail Price Card */}
                    {catalog.showPrices && p.trendyolPrice && (
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

                  {/* 3D Visualizer & In-Store Kiosk QR Code */}
                  {catalog.showQrCodes && (
                    <div className="pt-3 border-t border-stone-200 flex items-center gap-3">
                      {p.qrCodeUrl ? (
                        <img
                          src={p.qrCodeUrl}
                          alt="QR"
                          className="w-13 h-13 rounded-xl border border-stone-300 p-1 bg-white shadow-xs flex-shrink-0"
                        />
                      ) : (
                        <div className="w-13 h-13 rounded-xl border border-stone-300 p-2 bg-white shadow-xs flex items-center justify-center flex-shrink-0">
                          <QrCode size={28} className="text-stone-800" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-stone-900">
                          Mekânında 3D / AR Gör
                        </p>
                        <p className="text-[10px] text-stone-500 leading-tight">
                          Telefonla okutun, kendi odanızda nasıl durduğunu anında görün.
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
            <span>{brand.name} Showroom Rehberi</span>
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
            <span className="text-xl font-serif font-bold uppercase">{brand.name}</span>
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
              {catalog.contactAddress && (
                <div className="flex gap-4">
                  <span className="w-20 text-amber-300">Merkez:</span>
                  <span>{catalog.contactAddress}</span>
                </div>
              )}
              {catalog.contactPhone && (
                <div className="flex gap-4">
                  <span className="w-20 text-amber-300">Telefon:</span>
                  <a href={`tel:${catalog.contactPhone}`} className="text-white font-bold hover:underline">
                    {catalog.contactPhone}
                  </a>
                </div>
              )}
              {catalog.contactEmail && (
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
            <span>&copy; {new Date().getFullYear()} {brand.name} Showroom Ağı</span>
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

  return (
    <div className="w-full flex flex-col gap-10 items-center">
      {pages.map((p, idx) => renderSinglePage(p, idx))}
    </div>
  );
}
