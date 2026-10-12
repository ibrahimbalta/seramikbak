'use client';

import React, { useState } from 'react';
import { Sparkles, QrCode, ExternalLink, ShieldCheck, Layers, Maximize2 } from 'lucide-react';

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

    // ----------------------------------------------------
    // COVER PAGE
    // ----------------------------------------------------
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
            background: `linear-gradient(135deg, rgba(9, 13, 22, 0.92) 0%, rgba(17, 24, 39, 0.85) 60%, rgba(30, 27, 75, 0.9) 100%), url(${coverHero}) center/cover no-repeat`,
            backgroundColor: '#090d16'
          }}
        >
          {/* Subtle gold architectural framing lines */}
          <div className="absolute inset-4 sm:inset-6 border border-white/15 pointer-events-none rounded" />
          <div className="absolute top-8 right-8 text-[10px] font-mono tracking-[0.3em] text-amber-300/80 uppercase">
            MILANO LOOKBOOK &bull; {new Date().getFullYear()}
          </div>

          {/* Top Brand Header */}
          <div className="relative z-10 pt-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {logo && !imgErrors['logo-cover'] ? (
                <img
                  src={logo}
                  alt={brand.name || 'Brand'}
                  onError={() => handleImgError('logo-cover')}
                  className="h-10 max-w-[160px] object-contain filter brightness-0 invert"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 text-neutral-950 font-serif font-bold text-lg flex items-center justify-center shadow">
                    {(brand.name || 'S').charAt(0)}
                  </div>
                  <span className="text-xl font-serif font-bold tracking-widest text-white uppercase">
                    {brand.name || 'SERAMİK'}
                  </span>
                </div>
              )}
            </div>

            <div className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-medium tracking-widest uppercase text-amber-300">
              EXCLUSIVE COLLECTION
            </div>
          </div>

          {/* Center Title Block */}
          <div className="relative z-10 my-auto py-8 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold tracking-wider uppercase mb-6">
              <Sparkles size={13} className="text-amber-400" />
              <span>İtalyan Mimari Seramik Koleksiyonu</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-light text-white tracking-tight leading-tight mb-4">
              {catalog.coverTitle || catalog.title}
            </h1>

            {catalog.coverSubtitle && (
              <p className="text-lg sm:text-xl text-neutral-200 font-light leading-relaxed mb-6">
                {catalog.coverSubtitle}
              </p>
            )}

            {catalog.introText && (
              <p className="text-xs sm:text-sm text-neutral-300 font-light leading-relaxed max-w-xl border-l-2 border-amber-500 pl-4 py-1">
                {catalog.introText}
              </p>
            )}
          </div>

          {/* Bottom Footer Info */}
          <div className="relative z-10 pt-6 border-t border-white/15 flex items-end justify-between text-xs text-neutral-300">
            <div>
              <p className="font-bold text-white tracking-wide">{brand.name}</p>
              <p className="text-neutral-400 text-[11px]">{catalog.websiteUrl || 'www.seramikbak.com'}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-amber-400/80 font-mono tracking-widest uppercase block">
                CURATED ARCHITECTURE
              </span>
              <span className="text-neutral-400 text-[11px]">SeramikBak Catalog Studio</span>
            </div>
          </div>
        </section>
      );
    }

    // ----------------------------------------------------
    // TABLE OF CONTENTS (FİHRİST)
    // ----------------------------------------------------
    if (pageObj.type === 'toc') {
      return (
        <section
          key="toc"
          className="catalog-page p-8 sm:p-12 bg-white text-neutral-900 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between border-b-2 border-neutral-900 pb-4 mb-8">
              <div>
                <span className="text-xs font-mono font-bold text-amber-700 uppercase tracking-widest">
                  KOLEKSİYON DİZİNİ
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-light text-neutral-900 tracking-tight mt-0.5">
                  İçindekiler & Koleksiyon Fihristi
                </h2>
              </div>
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">{brand.name}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
              {products.map((p, idx) => (
                <div
                  key={p.id || idx}
                  className="flex items-center justify-between py-2.5 border-b border-neutral-100 group"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className="text-xs font-mono font-bold text-amber-600 w-6">
                      {(idx + 1).toString().padStart(2, '0')}
                    </span>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-neutral-800 truncate group-hover:text-amber-700 transition">
                        {p.name}
                      </p>
                      <p className="text-[10px] text-neutral-400 font-mono">
                        {p.code ? `Ref: ${p.code}` : ''} {p.width && p.height ? `• ${p.width}x${p.height} cm` : ''}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-neutral-400 group-hover:text-neutral-900 font-bold">
                    P. {(idx + (catalog.showCover ? 2 : 1) + 1).toString().padStart(2, '0')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-neutral-200 pt-3 flex justify-between items-center text-[11px] text-neutral-400 font-medium">
            <span>{brand.name} &bull; {catalog.title}</span>
            {catalog.showPageNumbers && <span>Sayfa 02</span>}
          </div>
        </section>
      );
    }

    // ----------------------------------------------------
    // PRODUCT PAGES (EDITORIAL MILANO DESIGN)
    // ----------------------------------------------------
    if (pageObj.type === 'product') {
      const p = pageObj.product;
      const index = pageObj.index;
      const pImage = p.imageUrl || p.textureUrl || '/renders/luxury_bathroom_calacatta_gold.jpg';
      const dimensions = p.width && p.height ? `${p.width} × ${p.height} cm` : null;
      const pageNum = pageIndex + 1;

      return (
        <section
          key={p.id || index}
          className="catalog-page p-6 sm:p-10 bg-white text-neutral-900 flex flex-col justify-between"
        >
          {/* Top Brand Header Bar */}
          <div className="flex items-center justify-between border-b border-neutral-200 pb-3 mb-4">
            <div className="flex items-center gap-3">
              <span className="font-serif font-bold text-sm tracking-wider uppercase text-neutral-900">
                {brand.name}
              </span>
              <span className="text-neutral-300">|</span>
              <span className="text-xs text-neutral-500 font-light truncate max-w-xs">{catalog.title}</span>
            </div>
            <div className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
              #{(index + 1).toString().padStart(2, '0')}
            </div>
          </div>

          {/* Main Editorial Layout (Split 2-Columns) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-center my-auto py-2">
            {/* Left: Product Visual Presentation */}
            <div className="md:col-span-7 flex flex-col items-center">
              <div className="w-full relative rounded-2xl overflow-hidden bg-neutral-100 shadow-lg border border-neutral-200/80 aspect-[4/3] flex items-center justify-center group">
                <img
                  src={pImage}
                  alt={p.name}
                  onError={() => handleImgError(`prod-${p.id}`)}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {dimensions && (
                  <div className="absolute top-3 left-3 bg-neutral-950/80 backdrop-blur-md text-white px-3 py-1 rounded-md text-xs font-mono font-semibold shadow">
                    {dimensions}
                  </div>
                )}

                {p.finish && (
                  <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md text-neutral-900 px-2.5 py-0.5 rounded text-[11px] font-bold shadow">
                    Yüzey: {p.finish}
                  </div>
                )}
              </div>

              {/* 1:1 Surface Texture Macro Swatch if available */}
              {p.textureUrl && p.textureUrl !== p.imageUrl && (
                <div className="mt-3 w-full p-2.5 rounded-xl bg-neutral-50 border border-neutral-200/90 flex items-center gap-3">
                  <img
                    src={p.textureUrl}
                    alt="Texture"
                    className="w-12 h-12 rounded-lg object-cover border border-neutral-300 shadow-xs flex-shrink-0"
                  />
                  <div className="text-xs">
                    <p className="font-bold text-neutral-800">1:1 Yüzey Dokusu & Rölyef</p>
                    <p className="text-neutral-500 text-[11px]">Gerçekçi ışık ve sırlama detayları</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Architectural Typography & Specs */}
            <div className="md:col-span-5 flex flex-col justify-between h-full">
              <div>
                <div className="inline-block px-2.5 py-1 rounded bg-neutral-100 text-neutral-700 text-[11px] font-mono font-bold mb-2">
                  {p.code ? `KOD: ${p.code}` : `SERİ NO: SB-${index + 101}`}
                </div>

                <h2 className="text-2xl sm:text-3xl font-serif font-light text-neutral-950 tracking-tight mb-2">
                  {p.name}
                </h2>

                {(p.customNote || p.description) && catalog.showDescriptions && (
                  <p className="text-xs text-neutral-600 font-light leading-relaxed mb-4">
                    {p.customNote || p.description}
                  </p>
                )}

                {/* Specs Table */}
                {catalog.showSpecs && (
                  <div className="border border-neutral-200 rounded-xl overflow-hidden mb-4 bg-neutral-50/50">
                    <div className="bg-neutral-100 px-3 py-1.5 border-b border-neutral-200 text-[10px] font-bold text-neutral-700 uppercase tracking-wider">
                      TEKNİK ÖZELLİKLER &bull; TS EN 14411
                    </div>
                    <div className="divide-y divide-neutral-200/80 text-xs">
                      {dimensions && (
                        <div className="flex justify-between px-3 py-1.5">
                          <span className="text-neutral-500">Anma Ebatı</span>
                          <span className="font-bold text-neutral-800">{dimensions}</span>
                        </div>
                      )}
                      {p.finish && (
                        <div className="flex justify-between px-3 py-1.5">
                          <span className="text-neutral-500">Yüzey Tipi</span>
                          <span className="font-bold text-neutral-800">{p.finish}</span>
                        </div>
                      )}
                      {p.color && (
                        <div className="flex justify-between px-3 py-1.5">
                          <span className="text-neutral-500">Renk</span>
                          <span className="font-bold text-neutral-800">{p.color}</span>
                        </div>
                      )}
                      {p.thickness && (
                        <div className="flex justify-between px-3 py-1.5">
                          <span className="text-neutral-500">Kalınlık</span>
                          <span className="font-bold text-neutral-800">{p.thickness} mm</span>
                        </div>
                      )}
                      {p.rectified !== undefined && (
                        <div className="flex justify-between px-3 py-1.5">
                          <span className="text-neutral-500">Rektifiye</span>
                          <span className="font-bold text-neutral-800">{p.rectified ? 'Evet (Lazer Kesim)' : 'Standart'}</span>
                        </div>
                      )}
                      {p.slipResistance && (
                        <div className="flex justify-between px-3 py-1.5">
                          <span className="text-neutral-500">Kaymazlık</span>
                          <span className="font-bold text-neutral-800">{p.slipResistance}</span>
                        </div>
                      )}
                      {p.peiRating && (
                        <div className="flex justify-between px-3 py-1.5">
                          <span className="text-neutral-500">Aşınma (PEI)</span>
                          <span className="font-bold text-neutral-800">PEI {p.peiRating}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Price if enabled */}
                {catalog.showPrices && p.trendyolPrice && (
                  <div className="mb-4 p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                    <span className="text-xs text-amber-800 font-medium">Tavsiye Edilen Liste Fiyatı:</span>
                    <span className="text-base font-bold text-amber-950">{p.trendyolPrice} TL / m²</span>
                  </div>
                )}
              </div>

              {/* 3D Visualizer QR Code Action Box */}
              {catalog.showQrCodes && (
                <div className="p-3 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50/50 to-orange-50/30 flex items-center gap-3 shadow-xs">
                  {p.qrCodeUrl ? (
                    <img
                      src={p.qrCodeUrl}
                      alt="QR Code"
                      className="w-16 h-16 rounded-lg bg-white p-1 border border-amber-300 shadow-xs flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-white p-2 border border-neutral-300 flex items-center justify-center flex-shrink-0">
                      <QrCode size={32} className="text-neutral-800" />
                    </div>
                  )}
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      <span>Mekânımda Gör & Dene</span>
                    </div>
                    <p className="text-[11px] text-neutral-600 leading-tight mt-0.5">
                      Kameranızla okutun, SeramikBak 3D Studio ile bu karoyu kendi odanızda görün.
                    </p>
                    <a
                      href={p.tryInRoomUrl || p.productUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 hover:text-amber-950 hover:underline mt-1"
                    >
                      <span>3D Stüdyoda Aç</span>
                      <ExternalLink size={11} />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Bar */}
          <div className="border-t border-neutral-200 pt-3 flex justify-between items-center text-[11px] text-neutral-400 font-medium">
            <span>{brand.name} &bull; {p.name}</span>
            {catalog.showPageNumbers && <span>Sayfa {pageNum.toString().padStart(2, '0')}</span>}
          </div>
        </section>
      );
    }

    // ----------------------------------------------------
    // CONTACT & BACK COVER
    // ----------------------------------------------------
    if (pageObj.type === 'contact') {
      return (
        <section
          key="contact"
          className="catalog-page p-8 sm:p-14 bg-neutral-950 text-white flex flex-col justify-between"
          style={{ backgroundColor: '#090d16' }}
        >
          <div className="flex items-center justify-between border-b border-white/15 pb-6">
            <span className="text-xl font-serif font-bold tracking-widest uppercase">{brand.name}</span>
            <span className="text-xs uppercase tracking-widest text-neutral-400 font-mono">
              PROJE & İLETİŞİM
            </span>
          </div>

          <div className="my-auto py-8 max-w-xl">
            <h3 className="text-3xl sm:text-4xl font-serif font-light text-white mb-4">
              Mimari & B2B Çözüm Ortaklığı
            </h3>
            <p className="text-sm text-neutral-400 leading-relaxed mb-8">
              Koleksiyon numuneleri, CAD/BIM dosyaları ve toplu proje teklifleri için satış ve mimari destek ekibimizle irtibata geçebilirsiniz.
            </p>

            <div className="space-y-4 text-xs sm:text-sm text-neutral-300 bg-white/5 p-6 rounded-2xl border border-white/10">
              {catalog.contactAddress && (
                <div className="flex gap-4">
                  <span className="w-20 text-neutral-400 font-mono">Adres:</span>
                  <span>{catalog.contactAddress}</span>
                </div>
              )}
              {catalog.contactPhone && (
                <div className="flex gap-4">
                  <span className="w-20 text-neutral-400 font-mono">Telefon:</span>
                  <a href={`tel:${catalog.contactPhone}`} className="text-amber-300 hover:underline">
                    {catalog.contactPhone}
                  </a>
                </div>
              )}
              {catalog.contactEmail && (
                <div className="flex gap-4">
                  <span className="w-20 text-neutral-400 font-mono">E-Posta:</span>
                  <a href={`mailto:${catalog.contactEmail}`} className="text-amber-300 hover:underline">
                    {catalog.contactEmail}
                  </a>
                </div>
              )}
              {catalog.websiteUrl && (
                <div className="flex gap-4">
                  <span className="w-20 text-neutral-400 font-mono">Web:</span>
                  <a
                    href={catalog.websiteUrl.startsWith('http') ? catalog.websiteUrl : `https://${catalog.websiteUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-300 underline"
                  >
                    {catalog.websiteUrl}
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-white/15 pt-6 flex justify-between items-center text-xs text-neutral-400">
            <span>&copy; {new Date().getFullYear()} {brand.name}. Tüm hakları saklıdır.</span>
            <span>SeramikBak Dijital Katalog Stüdyosu</span>
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
    <div className="w-full flex flex-col gap-8 items-center">
      {pages.map((p, idx) => renderSinglePage(p, idx))}
    </div>
  );
}
