'use client';

import React from 'react';

export default function MilanoLookbookTemplate({ catalog, products = [], mode = 'preview' }) {
  const brand = catalog.brand || {};
  const logo = catalog.customLogoUrl || brand.logoUrl;
  const primaryColor = catalog.primaryColor || '#b4823c';
  const isLandscape = catalog.orientation === 'landscape';

  const isTR = catalog.language !== 'en';
  const t = {
    collection: isTR ? 'ÖZEL KOLEKSİYON' : 'EXCLUSIVE COLLECTION',
    lookbook: isTR ? 'MİMARİ LOOKBOOK' : 'ARCHITECTURAL LOOKBOOK',
    specifications: isTR ? 'Teknik Özellikler' : 'Specifications',
    dimensions: isTR ? 'Ebat' : 'Dimensions',
    finish: isTR ? 'Yüzey' : 'Finish',
    color: isTR ? 'Renk' : 'Color',
    thickness: isTR ? 'Kalınlık' : 'Thickness',
    rectified: isTR ? 'Rektifiye' : 'Rectified',
    yes: isTR ? 'Evet (Lazer Kesim)' : 'Yes (Laser Cut)',
    no: isTR ? 'Hayır' : 'No',
    tryInRoom: isTR ? 'Mekânımda Gör & Dene' : 'Try in 3D Room',
    scanToTry: isTR ? 'Kameranızla tarayarak seramiği kendi banyo veya salonunuzda 3D görün.' : 'Scan with camera to preview this tile in your room with 3D Studio.',
    tableOfContents: isTR ? 'İçindekiler & Koleksiyon Fihristi' : 'Table of Contents',
    contact: isTR ? 'İletişim & Proje Destek' : 'Contact & Project Inquiries',
    page: isTR ? 'Sayfa' : 'Page',
  };

  return (
    <div className={`catalog-milano ${isLandscape ? 'orientation-landscape' : 'orientation-portrait'}`}>
      {/* -------------------- COVER PAGE -------------------- */}
      {catalog.showCover && (
        <section className="catalog-page cover-page flex flex-col justify-between p-12 bg-neutral-950 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />
          
          {/* Header / Brand Logo */}
          <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-6">
            <div className="flex items-center gap-4">
              {logo ? (
                <img src={logo} alt={brand.name || 'Brand Logo'} className="h-10 max-w-[180px] object-contain filter brightness-0 invert" />
              ) : (
                <span className="text-2xl font-bold tracking-widest uppercase">{brand.name || 'SERAMİKBAK'}</span>
              )}
            </div>
            <span className="text-xs uppercase tracking-[0.3em] text-neutral-400 font-medium">
              {t.lookbook} &bull; {new Date().getFullYear()}
            </span>
          </div>

          {/* Hero Title */}
          <div className="relative z-10 my-auto py-12 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs tracking-wider uppercase mb-6" style={{ color: primaryColor }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }} />
              {t.collection}
            </div>
            <h1 className="text-5xl md:text-6xl font-light tracking-tight leading-tight mb-6 font-serif">
              {catalog.coverTitle || catalog.title}
            </h1>
            {catalog.coverSubtitle && (
              <p className="text-xl text-neutral-300 font-light leading-relaxed max-w-xl">
                {catalog.coverSubtitle}
              </p>
            )}
            {catalog.introText && (
              <p className="text-sm text-neutral-400 font-light leading-relaxed max-w-lg mt-6 pt-6 border-t border-white/10">
                {catalog.introText}
              </p>
            )}
          </div>

          {/* Footer info */}
          <div className="relative z-10 flex items-end justify-between border-t border-white/10 pt-6 text-xs text-neutral-400">
            <div>
              <p className="font-medium text-white">{brand.name}</p>
              <p>{catalog.websiteUrl || 'www.seramikbak.com'}</p>
            </div>
            <div className="text-right">
              <p className="tracking-widest uppercase text-[10px] text-neutral-500">DIGITAL CATALOG STUDIO</p>
              <p className="text-neutral-300">Curated with SeramikBak Architecture</p>
            </div>
          </div>
        </section>
      )}

      {/* -------------------- TABLE OF CONTENTS -------------------- */}
      {catalog.showTOC && products.length > 2 && (
        <section className="catalog-page toc-page p-12 bg-white text-neutral-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-neutral-200 pb-4 mb-8">
              <h2 className="text-2xl font-serif font-light tracking-wide text-neutral-900">{t.tableOfContents}</h2>
              <span className="text-xs uppercase tracking-widest text-neutral-400">{brand.name}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
              {products.map((p, idx) => (
                <div key={p.id || idx} className="flex items-center justify-between py-2 border-b border-neutral-100 text-sm group">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-neutral-400 w-6">{(idx + 1).toString().padStart(2, '0')}</span>
                    <div>
                      <span className="font-medium text-neutral-800">{p.name}</span>
                      {catalog.showCodes && p.code && (
                        <span className="ml-2 text-xs text-neutral-400">({p.code})</span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-neutral-400 font-mono">
                    {p.width && p.height ? `${p.width}x${p.height} cm` : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-neutral-200 pt-4 flex justify-between items-center text-xs text-neutral-400">
            <span>{brand.name} &bull; {catalog.title}</span>
            {catalog.showPageNumbers && <span>{t.page} 02</span>}
          </div>
        </section>
      )}

      {/* -------------------- PRODUCT PAGES -------------------- */}
      {products.map((p, index) => {
        const pageNum = (catalog.showCover ? 1 : 0) + (catalog.showTOC && products.length > 2 ? 1 : 0) + index + 1;
        const mainImage = p.imageUrl || p.textureUrl || '/placeholder.png';
        const hasDimensions = p.width && p.height;
        const dimensionsText = hasDimensions ? `${p.width} × ${p.height} cm` : null;

        return (
          <section key={p.id || index} className="catalog-page product-page p-12 bg-white text-neutral-900 flex flex-col justify-between">
            {/* Top Brand Header */}
            <div className="flex items-center justify-between border-b border-neutral-200 pb-4 mb-6">
              <div className="flex items-center gap-3">
                {logo ? (
                  <img src={logo} alt={brand.name} className="h-6 max-w-[120px] object-contain" />
                ) : (
                  <span className="text-sm font-semibold tracking-wider text-neutral-800">{brand.name}</span>
                )}
                <span className="text-xs text-neutral-300">|</span>
                <span className="text-xs text-neutral-500 uppercase tracking-wider">{catalog.title}</span>
              </div>
              <span className="text-xs font-mono text-neutral-400">#{(index + 1).toString().padStart(2, '0')}</span>
            </div>

            {/* Main Content Layout */}
            <div className={`grid ${isLandscape ? 'grid-cols-12 gap-8' : 'grid-cols-1 md:grid-cols-12 gap-8'} items-center flex-1 my-auto`}>
              {/* Product Visual */}
              <div className={`${isLandscape ? 'col-span-7' : 'col-span-12 md:col-span-7'} flex flex-col items-center justify-center`}>
                <div className="w-full relative rounded-2xl overflow-hidden bg-neutral-100 shadow-md border border-neutral-200/60 aspect-[4/3] flex items-center justify-center">
                  <img
                    src={mainImage}
                    alt={p.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    loading="lazy"
                  />
                  {dimensionsText && (
                    <div className="absolute bottom-3 left-3 bg-neutral-900/80 backdrop-blur-sm text-white px-3 py-1 rounded-md text-xs font-medium">
                      {dimensionsText}
                    </div>
                  )}
                </div>

                {/* Secondary texture swatch if exists */}
                {p.textureUrl && p.textureUrl !== p.imageUrl && (
                  <div className="mt-4 flex items-center gap-3 w-full p-2.5 rounded-xl bg-neutral-50 border border-neutral-200">
                    <img src={p.textureUrl} alt="Texture Swatch" className="w-12 h-12 rounded-lg object-cover border border-neutral-300" />
                    <div className="text-xs">
                      <p className="font-semibold text-neutral-800">Orijinal Doku Detayı (1:1)</p>
                      <p className="text-neutral-500">Yüksek çözünürlüklü dijital seramik yüzey taraması</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Product Info & Specifications */}
              <div className={`${isLandscape ? 'col-span-5' : 'col-span-12 md:col-span-5'} flex flex-col justify-between h-full`}>
                <div>
                  <div className="inline-block px-2.5 py-1 rounded bg-neutral-100 text-xs font-mono font-medium text-neutral-600 mb-2">
                    {p.code || `SB-${(index + 101).toString()}`}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-serif font-light text-neutral-900 tracking-tight mb-3">
                    {p.name}
                  </h2>
                  {catalog.showDescriptions && (p.description || p.customNote) && (
                    <p className="text-xs text-neutral-600 leading-relaxed mb-6 font-light">
                      {p.customNote || p.description}
                    </p>
                  )}

                  {/* Technical Specs Table */}
                  {catalog.showSpecs && (
                    <div className="border border-neutral-200 rounded-xl overflow-hidden mb-6 bg-neutral-50/50">
                      <div className="bg-neutral-100 px-3 py-1.5 border-b border-neutral-200 text-[11px] font-semibold text-neutral-700 uppercase tracking-wider">
                        {t.specifications}
                      </div>
                      <div className="divide-y divide-neutral-200 text-xs">
                        {dimensionsText && (
                          <div className="flex justify-between px-3 py-2">
                            <span className="text-neutral-500">{t.dimensions}</span>
                            <span className="font-medium text-neutral-800">{dimensionsText}</span>
                          </div>
                        )}
                        {p.finish && (
                          <div className="flex justify-between px-3 py-2">
                            <span className="text-neutral-500">{t.finish}</span>
                            <span className="font-medium text-neutral-800">{p.finish}</span>
                          </div>
                        )}
                        {p.color && (
                          <div className="flex justify-between px-3 py-2">
                            <span className="text-neutral-500">{t.color}</span>
                            <span className="font-medium text-neutral-800">{p.color}</span>
                          </div>
                        )}
                        {p.thickness && (
                          <div className="flex justify-between px-3 py-2">
                            <span className="text-neutral-500">{t.thickness}</span>
                            <span className="font-medium text-neutral-800">{p.thickness} mm</span>
                          </div>
                        )}
                        {p.rectified !== undefined && (
                          <div className="flex justify-between px-3 py-2">
                            <span className="text-neutral-500">{t.rectified}</span>
                            <span className="font-medium text-neutral-800">{p.rectified ? t.yes : t.no}</span>
                          </div>
                        )}
                        {p.slipResistance && (
                          <div className="flex justify-between px-3 py-2">
                            <span className="text-neutral-500">Kaymazlık (R)</span>
                            <span className="font-medium text-neutral-800">{p.slipResistance}</span>
                          </div>
                        )}
                        {p.peiRating && (
                          <div className="flex justify-between px-3 py-2">
                            <span className="text-neutral-500">Aşınma (PEI)</span>
                            <span className="font-medium text-neutral-800">PEI {p.peiRating}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Price if enabled */}
                  {catalog.showPrices && p.trendyolPrice && (
                    <div className="mb-6 p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                      <span className="text-xs text-amber-800 font-medium">Tavsiye Edilen Fiyat (m²):</span>
                      <span className="text-lg font-bold text-amber-900">{p.trendyolPrice} TL</span>
                    </div>
                  )}
                </div>

                {/* 3D Visualizer & QR Box */}
                {catalog.showQrCodes && p.qrCodeUrl && (
                  <div className="mt-4 p-3.5 rounded-xl border border-neutral-200 bg-neutral-50 flex items-center gap-3">
                    <img src={p.qrCodeUrl} alt="QR Code" className="w-16 h-16 rounded-lg bg-white p-1 border border-neutral-300" />
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-900">
                        <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: primaryColor }} />
                        {t.tryInRoom}
                      </div>
                      <p className="text-[11px] text-neutral-500 leading-tight mt-0.5">
                        {t.scanToTry}
                      </p>
                      <a
                        href={p.tryInRoomUrl || p.productUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-1 text-[11px] font-medium text-blue-600 hover:underline"
                      >
                        seramikbak.com/urun/{p.slug} &rarr;
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Footer */}
            <div className="border-t border-neutral-200 pt-4 flex justify-between items-center text-xs text-neutral-400">
              <span>{brand.name} &bull; {p.name}</span>
              {catalog.showPageNumbers && <span>{t.page} {pageNum.toString().padStart(2, '0')}</span>}
            </div>
          </section>
        );
      })}

      {/* -------------------- CONTACT & BACK COVER -------------------- */}
      {catalog.showContactPage && (
        <section className="catalog-page back-cover-page p-12 bg-neutral-900 text-white flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-white/10 pb-6">
            {logo ? (
              <img src={logo} alt={brand.name} className="h-8 max-w-[150px] object-contain filter brightness-0 invert" />
            ) : (
              <span className="text-xl font-bold tracking-widest">{brand.name}</span>
            )}
            <span className="text-xs uppercase tracking-widest text-neutral-400">{t.contact}</span>
          </div>

          <div className="max-w-xl my-auto py-12">
            <h3 className="text-3xl font-serif font-light mb-6 text-white">{brand.name} Mimari & B2B Çözümleri</h3>
            <p className="text-neutral-400 text-sm leading-relaxed mb-8">
              Projeleriniz, mimari numune talepleriniz ve toptan siparişleriniz için yetkili satış ve proje ekibimizle doğrudan iletişime geçebilirsiniz.
            </p>

            <div className="space-y-4 text-sm text-neutral-300">
              {catalog.contactAddress && (
                <div className="flex items-start gap-3">
                  <span className="text-neutral-500 font-mono text-xs w-20">Adres:</span>
                  <span>{catalog.contactAddress}</span>
                </div>
              )}
              {catalog.contactPhone && (
                <div className="flex items-start gap-3">
                  <span className="text-neutral-500 font-mono text-xs w-20">Telefon:</span>
                  <a href={`tel:${catalog.contactPhone}`} className="hover:text-white">{catalog.contactPhone}</a>
                </div>
              )}
              {catalog.contactEmail && (
                <div className="flex items-start gap-3">
                  <span className="text-neutral-500 font-mono text-xs w-20">E-Posta:</span>
                  <a href={`mailto:${catalog.contactEmail}`} className="hover:text-white">{catalog.contactEmail}</a>
                </div>
              )}
              {catalog.websiteUrl && (
                <div className="flex items-start gap-3">
                  <span className="text-neutral-500 font-mono text-xs w-20">Web:</span>
                  <a href={catalog.websiteUrl.startsWith('http') ? catalog.websiteUrl : `https://${catalog.websiteUrl}`} target="_blank" rel="noreferrer" className="hover:text-white underline">
                    {catalog.websiteUrl}
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 flex justify-between items-center text-xs text-neutral-500">
            <span>&copy; {new Date().getFullYear()} {brand.name}. Tüm hakları saklıdır.</span>
            <span>Hazırlayan: SeramikBak Dijital Katalog Stüdyosu</span>
          </div>
        </section>
      )}
    </div>
  );
}
