'use client';

import React from 'react';

export default function ShowroomCollectionTemplate({ catalog, products = [], mode = 'preview' }) {
  const brand = catalog.brand || {};
  const logo = catalog.customLogoUrl || brand.logoUrl;
  const primaryColor = catalog.primaryColor || '#b4823c';
  const isLandscape = catalog.orientation === 'landscape';

  const isTR = catalog.language !== 'en';
  const t = {
    showroomTitle: isTR ? 'SHOWROOM & MAĞAZA ÜRÜN REHBERİ' : 'SHOWROOM & STORE COLLECTION GUIDE',
    season: isTR ? 'YENİ SEZON KOLEKSİYONU' : 'NEW SEASON COLLECTION',
    applications: isTR ? 'Önerilen Kullanım Alanları' : 'Recommended Applications',
    groutMatch: isTR ? 'Önerilen Derz Dolgusu' : 'Matching Grout',
    orderCode: isTR ? 'Sipariş Kodu' : 'Order Code',
    pricePerM2: isTR ? 'Tavsiye Edilen m² Fiyatı' : 'MSRP per m²',
    try3D: isTR ? 'Mekânınızda 3D Canlandırın' : 'Simulate in 3D Room',
    scanToTry: isTR ? 'Telefonunuzun kamerasıyla QR kodu okutun, seramiği banyo veya salonunuzda anında görün.' : 'Scan QR code with your phone camera to instantly visualize this tile in your room.',
    toc: isTR ? 'Koleksiyon Rehberi' : 'Collection Index',
    page: isTR ? 'Sayfa' : 'Page',
  };

  // Group products into 2 per page for balanced showroom browsing
  const chunkedProducts = [];
  for (let i = 0; i < products.length; i += 2) {
    chunkedProducts.push(products.slice(i, i + 2));
  }

  return (
    <div className={`catalog-showroom ${isLandscape ? 'orientation-landscape' : 'orientation-portrait'}`}>
      {/* -------------------- SHOWROOM COVER -------------------- */}
      {catalog.showCover && (
        <section className="catalog-page cover-page flex flex-col justify-between p-12 bg-amber-950 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1c1917 0%, #292524 50%, #44403c 100%)' }}>
          <div className="flex items-center justify-between border-b border-white/20 pb-6">
            {logo ? (
              <img src={logo} alt={brand.name} className="h-10 max-w-[180px] object-contain filter brightness-0 invert" />
            ) : (
              <span className="text-2xl font-serif font-bold tracking-wider">{brand.name}</span>
            )}
            <span className="text-xs uppercase tracking-widest text-amber-200/80 font-medium">{t.season}</span>
          </div>

          <div className="my-auto py-12 max-w-2xl">
            <span className="text-xs font-semibold tracking-widest uppercase text-amber-400 bg-amber-400/10 px-3.5 py-1.5 rounded-full border border-amber-400/20 inline-block mb-6">
              {t.showroomTitle}
            </span>
            <h1 className="text-5xl md:text-6xl font-serif font-normal text-white leading-tight mb-6">
              {catalog.coverTitle || catalog.title}
            </h1>
            {catalog.coverSubtitle && (
              <p className="text-xl text-stone-300 font-light leading-relaxed mb-6">
                {catalog.coverSubtitle}
              </p>
            )}
            {catalog.introText && (
              <p className="text-sm text-stone-400 leading-relaxed pt-6 border-t border-white/10 max-w-lg">
                {catalog.introText}
              </p>
            )}
          </div>

          <div className="flex items-end justify-between border-t border-white/20 pt-6 text-xs text-stone-400">
            <div>
              <p className="font-semibold text-white">{brand.name} Yetkili Bayi ve Showroom Portföyü</p>
              <p>{catalog.websiteUrl || 'www.seramikbak.com'}</p>
            </div>
            <div className="text-right">
              <p className="text-stone-300 font-medium">SeramikBak Perakende Teknolojileri</p>
            </div>
          </div>
        </section>
      )}

      {/* -------------------- SHOWROOM SPREAD PAGES (2 PRODUCTS PER PAGE) -------------------- */}
      {chunkedProducts.map((pair, pageIdx) => {
        const pageNum = (catalog.showCover ? 1 : 0) + pageIdx + 1;

        return (
          <section key={pageIdx} className="catalog-page p-10 bg-stone-50 text-stone-900 flex flex-col justify-between">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-stone-200 pb-3 mb-6">
              <div className="flex items-center gap-2">
                {logo ? (
                  <img src={logo} alt={brand.name} className="h-6 max-w-[100px] object-contain" />
                ) : (
                  <span className="font-bold text-xs uppercase tracking-wider">{brand.name}</span>
                )}
                <span className="text-stone-300">&bull;</span>
                <span className="text-xs text-stone-500">{catalog.title}</span>
              </div>
              <span className="text-xs text-stone-400">KOLEKSİYON SEÇKİSİ</span>
            </div>

            {/* Two Products Grid */}
            <div className={`grid ${pair.length === 2 ? 'grid-cols-1 md:grid-cols-2 gap-8' : 'grid-cols-1 max-w-2xl mx-auto w-full'} flex-1 my-auto`}>
              {pair.map((p, pIndex) => {
                const mainImage = p.imageUrl || p.textureUrl || '/placeholder.png';
                const dimensions = p.width && p.height ? `${p.width}x${p.height} cm` : null;

                return (
                  <div key={p.id || pIndex} className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm flex flex-col justify-between">
                    <div>
                      {/* Product Visual */}
                      <div className="relative rounded-xl overflow-hidden bg-stone-100 aspect-[4/3] mb-4 border border-stone-200/80">
                        <img src={mainImage} alt={p.name} className="w-full h-full object-cover" />
                        {dimensions && (
                          <div className="absolute top-2.5 right-2.5 bg-stone-900/80 backdrop-blur-sm text-white px-2.5 py-1 rounded text-xs font-medium">
                            {dimensions}
                          </div>
                        )}
                        {p.code && (
                          <div className="absolute bottom-2.5 left-2.5 bg-white/90 backdrop-blur-sm text-stone-800 px-2 py-0.5 rounded text-[11px] font-mono font-bold">
                            #{p.code}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <h3 className="text-xl font-serif font-bold text-stone-900 mb-1">{p.name}</h3>
                      <p className="text-xs text-stone-500 mb-3">
                        {p.style || 'Lüks Porselen'} &bull; Yüzey: <span className="font-medium text-stone-700">{p.finish || 'Mat'}</span>
                      </p>

                      {catalog.showDescriptions && (p.customNote || p.description) && (
                        <p className="text-xs text-stone-600 mb-4 line-clamp-3 leading-relaxed">
                          {p.customNote || p.description}
                        </p>
                      )}

                      {/* Recommended Usage Tags */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                          Banyo & Spa
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                          Mutfak Zemin
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                          Salon & Antre
                        </span>
                      </div>

                      {/* Pricing Tag */}
                      {catalog.showPrices && p.trendyolPrice && (
                        <div className="mb-4 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                          <span className="text-xs text-amber-900 font-medium">{t.pricePerM2}:</span>
                          <span className="text-base font-bold text-amber-950">{p.trendyolPrice} TL</span>
                        </div>
                      )}
                    </div>

                    {/* QR Code and 3D Action */}
                    {catalog.showQrCodes && p.qrCodeUrl && (
                      <div className="pt-4 border-t border-stone-100 flex items-center gap-3">
                        <img src={p.qrCodeUrl} alt="QR Code" className="w-14 h-14 rounded-lg border border-stone-200 p-1 bg-white" />
                        <div className="text-xs flex-1">
                          <p className="font-semibold text-stone-900">{t.try3D}</p>
                          <p className="text-[11px] text-stone-500 leading-tight mt-0.5">{t.scanToTry}</p>
                          <a href={p.productUrl} target="_blank" rel="noreferrer" className="text-amber-700 font-medium text-[11px] block mt-1 hover:underline">
                            seramikbak.com/urun/{p.slug}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="border-t border-stone-200 pt-3 flex justify-between items-center text-xs text-stone-400">
              <span>{brand.name} Showroom Rehberi</span>
              {catalog.showPageNumbers && <span>{t.page} {pageNum.toString().padStart(2, '0')}</span>}
            </div>
          </section>
        );
      })}

      {/* -------------------- CONTACT & STORE LOCATOR PAGE -------------------- */}
      {catalog.showContactPage && (
        <section className="catalog-page p-12 bg-stone-900 text-stone-100 flex flex-col justify-between">
          <div className="border-b border-stone-800 pb-4 flex items-center justify-between">
            <span className="text-lg font-serif">{brand.name} Müşteri Deneyimi & Showroom</span>
            <span className="text-xs text-stone-400">B2C & B2B REHBER</span>
          </div>

          <div className="my-auto py-8 max-w-xl">
            <h4 className="text-3xl font-serif mb-4">Yetkili Mağaza ve Bayi Ağı</h4>
            <p className="text-sm text-stone-400 leading-relaxed mb-6 font-light">
              Seramik koleksiyonlarımızı yakından incelemek, yüzey dokularına dokunmak ve mekânınıza özel tasarım desteği almak için en yakın satış noktamızı ziyaret edin.
            </p>

            <div className="space-y-3 text-xs bg-stone-800/80 p-5 rounded-xl border border-stone-700 text-stone-300">
              {catalog.contactAddress && <div><strong className="text-white">Merkez / Showroom:</strong> {catalog.contactAddress}</div>}
              {catalog.contactPhone && <div><strong className="text-white">Danışma Hattı:</strong> {catalog.contactPhone}</div>}
              {catalog.contactEmail && <div><strong className="text-white">E-Posta:</strong> {catalog.contactEmail}</div>}
              {catalog.websiteUrl && <div><strong className="text-white">Online Mağaza:</strong> {catalog.websiteUrl}</div>}
            </div>
          </div>

          <div className="border-t border-stone-800 pt-4 flex justify-between items-center text-xs text-stone-500">
            <span>&copy; {new Date().getFullYear()} {brand.name}. Tüm hakları saklıdır.</span>
            <span>SeramikBak Dijital Katalog Stüdyosu</span>
          </div>
        </section>
      )}
    </div>
  );
}
