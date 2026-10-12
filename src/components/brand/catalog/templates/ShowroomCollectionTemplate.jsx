'use client';

import React from 'react';
import { Building, QrCode, ExternalLink, Sparkles, Tag } from 'lucide-react';

export default function ShowroomCollectionTemplate({
  catalog,
  products = [],
  mode = 'preview',
  activePageIndex = 0,
  viewFormat = 'single'
}) {
  const brand = catalog.brand || {};
  const logo = catalog.customLogoUrl || brand.logoUrl;

  const pages = [];
  if (catalog.showCover) pages.push({ type: 'cover' });

  // Chunk products 2 per page for showroom presentation
  for (let i = 0; i < products.length; i += 2) {
    pages.push({ type: 'products', items: products.slice(i, i + 2), chunkIndex: Math.floor(i / 2) });
  }

  if (catalog.showContactPage) pages.push({ type: 'contact' });

  const renderSinglePage = (pageObj, pageIndex) => {
    if (!pageObj) return null;

    if (pageObj.type === 'cover') {
      const coverHero = products[0]?.imageUrl || '/renders/luxury_bathroom_calacatta_gold.jpg';
      return (
        <section
          key="cover"
          className="catalog-page p-8 sm:p-14 text-white flex flex-col justify-between"
          style={{
            background: `linear-gradient(135deg, rgba(28, 25, 23, 0.95) 0%, rgba(68, 64, 60, 0.85) 100%), url(${coverHero}) center/cover no-repeat`,
            backgroundColor: '#1c1917'
          }}
        >
          <div className="flex items-center justify-between border-b border-white/20 pb-5">
            <span className="text-2xl font-serif font-bold tracking-wider uppercase">{brand.name}</span>
            <span className="text-xs uppercase tracking-widest text-amber-200/80 font-medium font-mono">
              YENİ SEZON SHOWROOM REHBERİ
            </span>
          </div>

          <div className="my-auto py-8 max-w-2xl">
            <span className="text-xs font-bold tracking-widest uppercase text-amber-400 bg-amber-400/10 px-3.5 py-1.5 rounded-full border border-amber-400/20 inline-block mb-4">
              MAĞAZA & PERAKENDE SEÇKİSİ
            </span>
            <h1 className="text-4xl sm:text-6xl font-serif text-white leading-tight mb-4">
              {catalog.coverTitle || catalog.title}
            </h1>
            {catalog.coverSubtitle && (
              <p className="text-lg sm:text-xl text-stone-200 font-light leading-relaxed mb-4">
                {catalog.coverSubtitle}
              </p>
            )}
            {catalog.introText && (
              <p className="text-xs sm:text-sm text-stone-300 font-light leading-relaxed max-w-lg border-l-2 border-amber-400 pl-4">
                {catalog.introText}
              </p>
            )}
          </div>

          <div className="border-t border-white/20 pt-4 flex justify-between text-xs text-stone-400">
            <span>{brand.name} Yetkili Showroom Ağı</span>
            <span>SeramikBak Perakende Stüdyosu</span>
          </div>
        </section>
      );
    }

    if (pageObj.type === 'products') {
      const pair = pageObj.items;

      return (
        <section key={pageIndex} className="catalog-page p-6 sm:p-10 bg-stone-50 text-stone-900 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3 mb-4">
            <span className="font-bold text-xs uppercase tracking-wider text-stone-800">{brand.name} &bull; {catalog.title}</span>
            <span className="text-xs font-mono text-stone-400">SHOWROOM SEÇKİSİ</span>
          </div>

          <div className={`grid ${pair.length === 2 ? 'grid-cols-1 md:grid-cols-2 gap-6' : 'grid-cols-1 max-w-lg mx-auto w-full'} flex-1 my-auto`}>
            {pair.map((p, idx) => {
              const pImage = p.imageUrl || p.textureUrl || '/renders/luxury_bathroom_calacatta_gold.jpg';
              const dimensions = p.width && p.height ? `${p.width}x${p.height} cm` : null;

              return (
                <div key={p.id || idx} className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="relative rounded-xl overflow-hidden bg-stone-100 aspect-[4/3] mb-3 border border-stone-200">
                      <img src={pImage} alt={p.name} className="w-full h-full object-cover" />
                      {dimensions && (
                        <div className="absolute top-2.5 right-2.5 bg-stone-950/80 backdrop-blur-sm text-white px-2.5 py-0.5 rounded text-xs font-mono font-bold">
                          {dimensions}
                        </div>
                      )}
                    </div>

                    <h4 className="text-lg font-serif font-bold text-stone-900 mb-1">{p.name}</h4>
                    <p className="text-xs text-stone-500 mb-3 font-medium">
                      {p.style || 'Lüks Porselen'} &bull; Yüzey: <strong className="text-stone-700">{p.finish || 'Mat'}</strong>
                    </p>

                    <div className="flex flex-wrap gap-1.5 mb-3">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 font-semibold">
                        Banyo & Spa
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200 font-semibold">
                        Mutfak Zemin
                      </span>
                    </div>

                    {catalog.showPrices && p.trendyolPrice && (
                      <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 flex justify-between items-center mb-3">
                        <span className="text-xs text-amber-950 font-bold">m² Liste Fiyatı:</span>
                        <span className="text-base font-extrabold text-amber-900">{p.trendyolPrice} TL</span>
                      </div>
                    )}
                  </div>

                  {catalog.showQrCodes && (
                    <div className="pt-3 border-t border-stone-100 flex items-center gap-3">
                      <img src={p.qrCodeUrl || '/favicon.ico'} alt="QR" className="w-12 h-12 rounded border border-stone-200 p-1 bg-white" />
                      <div className="text-xs">
                        <p className="font-bold text-stone-900">Mekânında 3D Gör</p>
                        <p className="text-[10px] text-stone-500">Telefonla okut, odanda anında gör.</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="border-t border-stone-200 pt-3 flex justify-between text-xs text-stone-400">
            <span>{brand.name} Showroom Rehberi</span>
            <span>Sayfa {(pageIndex + 1).toString().padStart(2, '0')}</span>
          </div>
        </section>
      );
    }

    if (pageObj.type === 'contact') {
      return (
        <section key="contact" className="catalog-page p-8 sm:p-12 text-stone-100 flex flex-col justify-between" style={{ backgroundColor: '#1c1917' }}>
          <div className="border-b border-stone-800 pb-4 flex justify-between">
            <span className="text-lg font-serif font-bold uppercase">{brand.name} SHOWROOM AĞI</span>
            <span className="text-xs text-stone-400 font-mono">B2C REHBER</span>
          </div>
          <div className="my-auto py-8 max-w-xl">
            <h4 className="text-3xl font-serif mb-3">Showroom & Yetkili Satış Noktaları</h4>
            <p className="text-xs text-stone-400 leading-relaxed mb-6">
              Seramik koleksiyonlarımızı yakından incelemek, yüzey dokularına dokunmak ve mekânınıza özel tasarım desteği almak için en yakın satış noktamızı ziyaret edin.
            </p>
            <div className="space-y-2 text-xs bg-stone-800/80 p-5 rounded-xl border border-stone-700 text-stone-300">
              <div><strong className="text-white">Danışma Hattı:</strong> {catalog.contactPhone || '+90 (212) 000 00 00'}</div>
              <div><strong className="text-white">E-Posta:</strong> {catalog.contactEmail || 'iletisim@seramikbak.com'}</div>
              <div><strong className="text-white">Online Mağaza:</strong> {catalog.websiteUrl || 'www.seramikbak.com'}</div>
            </div>
          </div>
          <div className="border-t border-stone-800 pt-4 text-xs text-stone-500 flex justify-between">
            <span>&copy; {new Date().getFullYear()} {brand.name}. Tüm hakları saklıdır.</span>
            <span>SeramikBak Dijital Katalog Stüdyosu</span>
          </div>
        </section>
      );
    }

    return null;
  };

  if (viewFormat === 'single') {
    return <div className="w-full flex justify-center">{renderSinglePage(pages[activePageIndex] || pages[0], activePageIndex)}</div>;
  }

  return <div className="w-full flex flex-col gap-8 items-center">{pages.map((p, idx) => renderSinglePage(p, idx))}</div>;
}
