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
  Minus
} from 'lucide-react';

/**
 * 2. Tasarım Ailesi: Minimal Koleksiyon Kataloğu (Minimalist White-Space & Japandi)
 * İskandinav & Japandi mimari seramik estetiği: Geniş negatif boşluk, narin serif & tracking'li başlıklar,
 * asimetrik kompozisyon, sakin nötr tonlar.
 */
export default function MinimalCollectionTemplate({
  catalog,
  products = [],
  mode = 'preview',
  activePageIndex = 0,
  viewFormat = 'single',
  onSelectPage
}) {
  const brand = catalog?.brand || {};
  const logo = catalog?.customLogoUrl || brand.logoUrl;
  const collectionTag = catalog?.collectionTag || 'MİMARİ KOLEKSİYON 2026';
  const primaryColor = catalog?.primaryColor || '#78716c';

  const [imgErrors, setImgErrors] = useState({});
  const handleImgError = (id) => {
    setImgErrors((prev) => ({ ...prev, [id]: true }));
  };

  // Safe products array
  const safeProducts = products && products.length > 0 ? products : [
    {
      id: 'min-1',
      name: 'Nordic Stone Warm Grey',
      sku: 'NS-60120-WG',
      color: 'Sıcak Gri',
      finish: 'Mat İpeksi',
      width: 60,
      height: 120,
      thickness: '9',
      rectified: true,
      slipResistance: 'R10',
      peiRating: '4',
      imageUrl: '/renders/modern_living_natural_oak.jpg',
      textureUrl: '/textures/calacatta_gold.jpg',
      description: 'İskandinav kayalıklarından ilham alan mikrotekstürlü yüzey. Doğal ışığı yumuşatarak mekana derinlik katan mat porselen karo.'
    },
    {
      id: 'min-2',
      name: 'Kyoto Wabi Bone',
      sku: 'KW-120120-BN',
      color: 'Kemik / Fildişi',
      finish: 'Honlu Doğal',
      width: 120,
      height: 120,
      thickness: '9',
      rectified: true,
      slipResistance: 'R9',
      peiRating: '3',
      imageUrl: '/renders/luxury_bathroom_calacatta_gold.jpg',
      textureUrl: '/textures/calacatta_gold.jpg',
      description: 'Japandi felsefesinin kusursuz sadeliği. Monolitik derzlerle birleşen sıcak kemik tonu, zamansız bir dinginlik sunar.'
    }
  ];

  // Helper for swatches
  const getProductSwatches = (p) => {
    return [
      { name: p.color || 'Ana Renk', texture: p.textureUrl || p.imageUrl || '/textures/calacatta_gold.jpg' },
      { name: 'Krem / Sand', texture: '/textures/calacatta_gold.jpg' },
      { name: 'Kül / Ash', texture: '/textures/concrete_light_grey.jpg' }
    ];
  };

  // Page compilation
  const pages = [];

  // Page 1: Minimalist Cover
  if (catalog?.showCover !== false) {
    pages.push({ type: 'cover' });
  }

  // Page 2: Table of Contents / Curation Index
  if (catalog?.showTOC !== false) {
    pages.push({ type: 'toc' });
  }

  // Page 3: Editorial Lifestyle Spread
  pages.push({ type: 'editorial', product: safeProducts[0] });

  // Product detail pages (1 page per product, asymmetrically balanced)
  safeProducts.forEach((p, idx) => {
    pages.push({ type: 'product-detail', product: p, index: idx });
  });

  // Page: Variants & Textures
  pages.push({ type: 'variants', products: safeProducts.slice(0, 4) });

  // Page: Minimal Technical Specs
  if (catalog?.showSpecs !== false) {
    pages.push({ type: 'specs' });
  }

  // Page: Minimalist Back Cover / Contact
  if (catalog?.showContactPage !== false) {
    pages.push({ type: 'contact' });
  }

  const renderSinglePage = (pageObj, index) => {
    if (!pageObj) return null;
    const pageNum = index + 1;

    // -----------------------------------------------------------------------
    // 1. COVER: MINIMALIST LIGHT TYPOGRAPHY
    // -----------------------------------------------------------------------
    if (pageObj.type === 'cover') {
      return (
        <section
          key="cover"
          className="catalog-page relative bg-[#fcfbf9] text-neutral-900 p-8 sm:p-14 md:p-20 flex flex-col justify-between overflow-hidden select-none border border-neutral-200/60 shadow-xs"
        >
          {/* Subtle Top Header */}
          <div className="flex justify-between items-center border-b border-neutral-200/80 pb-6">
            <span className="text-[11px] font-mono tracking-[0.3em] uppercase text-neutral-500">
              {brand.name || 'SERAMİKBAK'} &bull; COLLECTION
            </span>
            <span className="text-[10px] font-mono tracking-widest text-neutral-400">
              VOL. {new Date().getFullYear()}
            </span>
          </div>

          {/* Center: Asymmetrical Large Title & Image Slice */}
          <div className="my-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center py-6">
            <div className="md:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2">
                <Minus size={16} className="text-stone-400" />
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-stone-600">
                  {collectionTag}
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-light text-neutral-900 tracking-tight leading-[1.08]">
                {catalog?.title || 'Sade & Zamansız Karo Koleksiyonu'}
              </h1>

              {catalog?.subtitle && (
                <p className="text-xs sm:text-sm text-neutral-600 font-light leading-relaxed max-w-md">
                  {catalog.subtitle}
                </p>
              )}

              <div className="pt-4 flex items-center gap-6 text-[10px] font-mono text-neutral-400">
                <span>PORSELEN KARO</span>
                <span>&bull;</span>
                <span>JAPANDI SAKİNLİĞİ</span>
                <span>&bull;</span>
                <span>DOĞAL MAT DOKU</span>
              </div>
            </div>

            {/* Asymmetric Elegant Cover Photo Slice */}
            <div className="md:col-span-5 flex justify-center">
              <div className="w-56 sm:w-64 h-80 sm:h-96 rounded-xs overflow-hidden shadow-xl border border-neutral-200/80 relative">
                <img
                  src={catalog?.coverImageUrl || safeProducts[0]?.imageUrl || '/renders/modern_living_natural_oak.jpg'}
                  alt="Kapak Görseli"
                  className="w-full h-full object-cover grayscale-20 contrast-95 hover:scale-105 transition-transform duration-700"
                  onError={() => handleImgError('cover-img')}
                />
              </div>
            </div>
          </div>

          {/* Bottom Footer: Minimalist Metadata */}
          <div className="pt-6 border-t border-neutral-200/80 flex justify-between items-center text-[10px] font-mono text-neutral-400">
            <span>MİMARİ & İÇ MEKAN KATALOĞU</span>
            <span>{pageNum}</span>
          </div>
        </section>
      );
    }

    // -----------------------------------------------------------------------
    // 2. TOC: CURATION INDEX
    // -----------------------------------------------------------------------
    if (pageObj.type === 'toc') {
      return (
        <section
          key="toc"
          className="catalog-page relative bg-[#fcfbf9] text-neutral-900 p-8 sm:p-14 md:p-16 flex flex-col justify-between overflow-hidden select-none border border-neutral-200/60"
        >
          <div className="flex justify-between items-center border-b border-neutral-200/80 pb-6">
            <span className="text-[11px] font-mono tracking-[0.25em] uppercase text-neutral-500">
              İÇİNDEKİLER / CURATION
            </span>
            <span className="text-[10px] font-mono tracking-widest text-neutral-400">
              {collectionTag}
            </span>
          </div>

          <div className="my-auto max-w-2xl mx-auto w-full py-8 space-y-8">
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-stone-500">
                DİZİN
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-normal text-neutral-900 tracking-tight">
                Koleksiyon Seçkisi & Mekanlar
              </h2>
            </div>

            <div className="divide-y divide-neutral-200/70">
              <div
                onClick={() => onSelectPage && onSelectPage(2)}
                className="py-4 flex justify-between items-center hover:text-stone-700 cursor-pointer group transition"
              >
                <div className="flex items-center gap-4">
                  <span className="text-xs font-mono text-stone-400">01</span>
                  <span className="text-sm font-serif font-medium text-neutral-800 group-hover:translate-x-1 transition-transform">
                    Editoryal Yaşam Alanı Vizyonu
                  </span>
                </div>
                <span className="text-xs font-mono text-neutral-400">S. 03</span>
              </div>

              {safeProducts.map((p, idx) => (
                <div
                  key={p.id || idx}
                  onClick={() => onSelectPage && onSelectPage(3 + idx)}
                  className="py-4 flex justify-between items-center hover:text-stone-700 cursor-pointer group transition"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-mono text-stone-400">
                      {String(idx + 2).padStart(2, '0')}
                    </span>
                    <span className="text-sm font-serif font-medium text-neutral-800 group-hover:translate-x-1 transition-transform">
                      {p.name} &bull; {p.width && p.height ? `${p.width}x${p.height} cm` : p.finish || 'Porselen'}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-neutral-400">
                    S. {String(4 + idx).padStart(2, '0')}
                  </span>
                </div>
              ))}

              <div
                onClick={() => onSelectPage && onSelectPage(pages.length - 2)}
                className="py-4 flex justify-between items-center hover:text-stone-700 cursor-pointer group transition"
              >
                <div className="flex items-center gap-4">
                  <span className="text-xs font-mono text-stone-400">
                    {String(safeProducts.length + 2).padStart(2, '0')}
                  </span>
                  <span className="text-sm font-serif font-medium text-neutral-800 group-hover:translate-x-1 transition-transform">
                    Teknik Şartname & Yüzey Matrisi
                  </span>
                </div>
                <span className="text-xs font-mono text-neutral-400">
                  S. {String(pages.length - 1).padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-neutral-200/80 flex justify-between items-center text-[10px] font-mono text-neutral-400">
            <span>{brand.name || 'SERAMİKBAK'}</span>
            <span>{pageNum}</span>
          </div>
        </section>
      );
    }

    // -----------------------------------------------------------------------
    // 3. EDITORIAL: LARGE LIFESTYLE SPREAD
    // -----------------------------------------------------------------------
    if (pageObj.type === 'editorial') {
      const prod = pageObj.product || safeProducts[0];
      return (
        <section
          key="editorial"
          className="catalog-page relative bg-[#fcfbf9] text-neutral-900 p-8 sm:p-14 md:p-16 flex flex-col justify-between overflow-hidden select-none border border-neutral-200/60"
        >
          <div className="flex justify-between items-center border-b border-neutral-200/80 pb-5">
            <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-neutral-500">
              MİMARİ PERSPEKTİF
            </span>
            <span className="text-[10px] font-mono text-neutral-400">
              {prod.name}
            </span>
          </div>

          <div className="my-auto space-y-6">
            <div className="w-full h-80 sm:h-96 rounded-xs overflow-hidden shadow-lg border border-neutral-200/70 relative">
              <img
                src={prod.imageUrl || '/renders/modern_living_natural_oak.jpg'}
                alt={prod.name}
                className="w-full h-full object-cover"
                onError={() => handleImgError(`ed-${prod.id}`)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end pt-2">
              <div className="md:col-span-8">
                <blockquote className="text-base sm:text-xl font-serif italic text-neutral-800 leading-snug">
                  &ldquo;Işığın yüzeyle kurduğu sessiz diyalog; mekanın hacmini genişleten doğal tonlar ve rafine dokularla buluşuyor.&rdquo;
                </blockquote>
              </div>
              <div className="md:col-span-4 text-right">
                <span className="text-[10px] font-mono text-stone-500 block uppercase tracking-wider">
                  UYGULAMA ALANI
                </span>
                <span className="text-xs font-serif font-medium text-neutral-800">
                  Salon, Mutfak & Zemin Uygulamaları
                </span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-neutral-200/80 flex justify-between items-center text-[10px] font-mono text-neutral-400">
            <span>EDİTORYAL MİZANPAJ</span>
            <span>{pageNum}</span>
          </div>
        </section>
      );
    }

    // -----------------------------------------------------------------------
    // 4. PRODUCT DETAIL: ASYMMETRICAL MINIMAL SPEC
    // -----------------------------------------------------------------------
    if (pageObj.type === 'product-detail') {
      const prod = pageObj.product;
      const swatches = getProductSwatches(prod);

      return (
        <section
          key={`prod-${prod.id || pageObj.index}`}
          className="catalog-page relative bg-[#fcfbf9] text-neutral-900 p-8 sm:p-14 md:p-16 flex flex-col justify-between overflow-hidden select-none border border-neutral-200/60"
        >
          <div className="flex justify-between items-center border-b border-neutral-200/80 pb-5">
            <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-neutral-500">
              ÜRÜN DETAYI / {String(pageObj.index + 1).padStart(2, '0')}
            </span>
            <span className="text-[10px] font-mono text-stone-500">
              {prod.sku || 'PORSELEN KARO'}
            </span>
          </div>

          <div className="my-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center py-4">
            {/* Left: Tile Slab / Texture Representation */}
            <div className="md:col-span-6 flex justify-center">
              <div className="w-64 sm:w-72 h-80 sm:h-96 bg-white rounded-xs p-3 shadow-md border border-neutral-200/80 flex flex-col justify-between">
                <div className="w-full h-full rounded-2xs overflow-hidden relative">
                  <img
                    src={prod.imageUrl || prod.textureUrl || '/renders/luxury_bathroom_calacatta_gold.jpg'}
                    alt={prod.name}
                    className="w-full h-full object-cover"
                    onError={() => handleImgError(`slab-${prod.id}`)}
                  />
                  {prod.rectified && (
                    <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-xs text-[9px] font-mono font-bold text-neutral-800 shadow-2xs">
                      REKTİFİYE (REC)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Clean Minimal Specs & Typography */}
            <div className="md:col-span-6 space-y-6">
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-stone-500">
                  {prod.finish || 'Porselen'} &bull; {prod.color || 'Nötr'}
                </span>
                <h3 className="text-2xl sm:text-3xl font-serif font-normal text-neutral-900 tracking-tight">
                  {prod.name}
                </h3>
              </div>

              {prod.description && (
                <p className="text-xs text-neutral-600 font-light leading-relaxed">
                  {prod.description}
                </p>
              )}

              {/* Minimal Specs Grid */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-b border-neutral-200/80 py-4 text-xs">
                <div>
                  <span className="text-[10px] font-mono text-stone-400 block uppercase">Ebat</span>
                  <span className="font-serif font-medium text-neutral-800">
                    {prod.width && prod.height ? `${prod.width}×${prod.height} cm` : 'Standart'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-mono text-stone-400 block uppercase">Kalınlık</span>
                  <span className="font-serif font-medium text-neutral-800">
                    {prod.thickness ? `${prod.thickness} mm` : '9 mm'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-mono text-stone-400 block uppercase">Yüzey Bitişi</span>
                  <span className="font-serif font-medium text-neutral-800">
                    {prod.finish || 'Mat'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-mono text-stone-400 block uppercase">Kaymazlık</span>
                  <span className="font-serif font-medium text-neutral-800">
                    {prod.slipResistance || 'R9 / R10'}
                  </span>
                </div>
              </div>

              {/* Swatches */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 block">
                  Renk Tonu Alternatifleri
                </span>
                <div className="flex items-center gap-3">
                  {swatches.map((sw, swIdx) => (
                    <div key={swIdx} className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full border border-neutral-300 overflow-hidden shadow-2xs">
                        <img src={sw.texture} alt={sw.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[10px] font-serif text-neutral-600">{sw.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-neutral-200/80 flex justify-between items-center text-[10px] font-mono text-neutral-400">
            <span>{brand.name || 'SERAMİKBAK'}</span>
            <span>{pageNum}</span>
          </div>
        </section>
      );
    }

    // -----------------------------------------------------------------------
    // 5. VARIANTS & TEXTURES
    // -----------------------------------------------------------------------
    if (pageObj.type === 'variants') {
      return (
        <section
          key="variants"
          className="catalog-page relative bg-[#fcfbf9] text-neutral-900 p-8 sm:p-14 md:p-16 flex flex-col justify-between overflow-hidden select-none border border-neutral-200/60"
        >
          <div className="flex justify-between items-center border-b border-neutral-200/80 pb-5">
            <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-neutral-500">
              DOKU & VARYASYON
            </span>
            <span className="text-[10px] font-mono text-stone-500">
              KOLEKSİYON PALETİ
            </span>
          </div>

          <div className="my-auto space-y-8 py-4">
            <div className="max-w-md space-y-1.5">
              <h3 className="text-xl sm:text-2xl font-serif font-normal text-neutral-900">
                Uyumlu Tonlar ve Yüzey Bitişleri
              </h3>
              <p className="text-xs text-neutral-600 font-light leading-relaxed">
                Mekan içinde zemin ve duvar birlikteliğinde sakin ton geçişleri sunan kombine varyasyonlar.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {safeProducts.slice(0, 4).map((p, pIdx) => (
                <div key={p.id || pIdx} className="space-y-2">
                  <div className="w-full h-36 rounded-xs overflow-hidden border border-neutral-200/80 shadow-2xs">
                    <img
                      src={p.imageUrl || p.textureUrl || '/textures/calacatta_gold.jpg'}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-xs font-serif font-medium text-neutral-800 block truncate">
                      {p.name}
                    </span>
                    <span className="text-[10px] font-mono text-stone-500 block">
                      {p.color || 'Nötr'} &bull; {p.finish || 'Mat'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-neutral-200/80 flex justify-between items-center text-[10px] font-mono text-neutral-400">
            <span>VARYASYON MATRİSİ</span>
            <span>{pageNum}</span>
          </div>
        </section>
      );
    }

    // -----------------------------------------------------------------------
    // 6. TECHNICAL SPECS: CLEAN MINIMAL TABLE
    // -----------------------------------------------------------------------
    if (pageObj.type === 'specs') {
      return (
        <section
          key="specs"
          className="catalog-page relative bg-[#fcfbf9] text-neutral-900 p-8 sm:p-14 md:p-16 flex flex-col justify-between overflow-hidden select-none border border-neutral-200/60"
        >
          <div className="flex justify-between items-center border-b border-neutral-200/80 pb-5">
            <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-neutral-500">
              TEKNİK ÖZELLİKLER & STANDARTLAR
            </span>
            <span className="text-[10px] font-mono text-stone-500">
              TS EN 14411 ANNEX G
            </span>
          </div>

          <div className="my-auto space-y-6 py-4">
            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl font-serif font-normal text-neutral-900">
                Porselen Karo Teknik Tablosu
              </h3>
              <p className="text-xs text-neutral-500 font-light">
                Grup BIa (E &le; %0.5) porselen karolar için uluslararası test normları.
              </p>
            </div>

            <div className="overflow-x-auto border border-neutral-200/80 rounded-xs bg-white">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50/70 text-[10px] font-mono text-stone-600">
                    <th className="py-2.5 px-4">ÖZELLİK</th>
                    <th className="py-2.5 px-4">TEST METODU</th>
                    <th className="py-2.5 px-4">STANDART DEĞER</th>
                    <th className="py-2.5 px-4">SERAMİKBAK TAAHHÜDÜ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200/60 font-mono text-[11px] text-neutral-700">
                  <tr>
                    <td className="py-2.5 px-4 font-sans font-medium text-neutral-900">Su Emme Oranı</td>
                    <td className="py-2.5 px-4 text-stone-500">EN ISO 10545-3</td>
                    <td className="py-2.5 px-4">&le; % 0.5</td>
                    <td className="py-2.5 px-4 text-emerald-700 font-bold">&le; % 0.08 (Tam Sırlı)</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-sans font-medium text-neutral-900">Kırılma Dayanımı</td>
                    <td className="py-2.5 px-4 text-stone-500">EN ISO 10545-4</td>
                    <td className="py-2.5 px-4">&ge; 1300 N</td>
                    <td className="py-2.5 px-4 text-emerald-700 font-bold">&ge; 2200 N</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-sans font-medium text-neutral-900">Kaymazlık Sınıfı</td>
                    <td className="py-2.5 px-4 text-stone-500">DIN 51130</td>
                    <td className="py-2.5 px-4">R9 - R11</td>
                    <td className="py-2.5 px-4 text-emerald-700 font-bold">R10 (Banyo & Salon)</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-sans font-medium text-neutral-900">Lekelenme Direnci</td>
                    <td className="py-2.5 px-4 text-stone-500">EN ISO 10545-14</td>
                    <td className="py-2.5 px-4">Min. Sınıf 3</td>
                    <td className="py-2.5 px-4 text-emerald-700 font-bold">Sınıf 5 (Kolay Temizlenir)</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-sans font-medium text-neutral-900">Don Dayanımı</td>
                    <td className="py-2.5 px-4 text-stone-500">EN ISO 10545-12</td>
                    <td className="py-2.5 px-4">Gerekli</td>
                    <td className="py-2.5 px-4 text-emerald-700 font-bold">Dayanıklı (100 Döngü)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-6 border-t border-neutral-200/80 flex justify-between items-center text-[10px] font-mono text-neutral-400">
            <span>KALİTE SERTİFİKALARI</span>
            <span>{pageNum}</span>
          </div>
        </section>
      );
    }

    // -----------------------------------------------------------------------
    // 7. BACK COVER / CONTACT
    // -----------------------------------------------------------------------
    if (pageObj.type === 'contact') {
      return (
        <section
          key="contact"
          className="catalog-page relative bg-[#fcfbf9] text-neutral-900 p-8 sm:p-14 md:p-20 flex flex-col justify-between overflow-hidden select-none border border-neutral-200/60"
        >
          <div className="flex justify-between items-center border-b border-neutral-200/80 pb-6">
            <span className="text-[11px] font-mono tracking-[0.25em] uppercase text-neutral-500">
              {brand.name || 'SERAMİKBAK'}
            </span>
            <span className="text-[10px] font-mono tracking-widest text-neutral-400">
              İLETİŞİM & KATALOG
            </span>
          </div>

          <div className="my-auto max-w-md mx-auto text-center space-y-6">
            <div className="w-12 h-12 mx-auto rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-600">
              <QrCode size={22} />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-serif font-normal text-neutral-900">
                Dijital Koleksiyon & Numune
              </h3>
              <p className="text-xs text-neutral-500 font-light leading-relaxed">
                Mimari numune talepleri, proje fiyat teklifleri ve 3D mekan görselleştirme için bize ulaşın.
              </p>
            </div>

            <div className="pt-4 space-y-2 text-xs font-serif text-neutral-700">
              <p>{catalog?.contactPhone || '+90 (212) 555 00 00'}</p>
              <p>{catalog?.contactEmail || 'proje@seramikbak.com'}</p>
              <p>{catalog?.websiteUrl || 'www.seramikbak.com'}</p>
              <p className="text-[11px] text-neutral-400 font-sans pt-2">
                {catalog?.contactAddress || 'Büyükdere Cad. No:192, Levent / İstanbul'}
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-neutral-200/80 flex justify-between items-center text-[10px] font-mono text-neutral-400">
            <span>&copy; {new Date().getFullYear()} {brand.name || 'SeramikBak'}. Tüm hakları saklıdır.</span>
            <span>{pageNum}</span>
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

  // viewFormat === 'all'
  return (
    <div className="w-full flex flex-col gap-10 items-center">
      {pages.map((p, idx) => renderSinglePage(p, idx))}
    </div>
  );
}
