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
  FileText
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

  // Safe fallback products matching real architectural ceramic data
  const safeProducts = products && products.length > 0 ? products : [
    {
      id: 'p-1',
      name: 'Aren White Lappato',
      code: 'P156ZDRAJ30X0XCAAW50',
      width: 60,
      height: 120,
      thickness: 9.5,
      finish: 'Lappato Yarı Parlak',
      style: 'Mermer',
      color: 'Kırık Beyaz / İpeksi Gri Damar',
      peiRating: 4,
      slipResistance: 'R9',
      rectified: true,
      frostResistance: true,
      imageUrl: '/renders/luxury_bathroom_calacatta_gold.jpg',
      textureUrl: '/textures/calacatta_gold.jpg',
      description: 'Doğal İtalyan Carrara mermerinden ilham alan derin gri-altın damar geçişleri ve nano lappato yüzey parlaklığı.'
    },
    {
      id: 'p-2',
      name: 'Calacatta Marmi Grigio',
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
      textureUrl: '/textures/albatros_antrasit.jpg',
      description: 'Hafif dokulu mat seramik gövde, ıslak ayak kaymazlığı sunarken leke tutmayan koruyucu sır tabakası.'
    },
    {
      id: 'p-3',
      name: 'Bona Dea Concrete Grey',
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
      id: 'p-4',
      name: 'Shell Stone Beige Out20',
      code: '7BANTSEET-SHELL-BEIGE-20MM',
      width: 60,
      height: 120,
      thickness: 20.0,
      finish: 'Antislip Taş Yüzey',
      style: 'Dış Mekan 20mm',
      color: 'Sıcak Bej / Kireçtaşı',
      peiRating: 5,
      slipResistance: 'R11',
      rectified: true,
      frostResistance: true,
      imageUrl: '/renders/modern_living_natural_oak.jpg',
      textureUrl: '/textures/keops_bej.jpg',
      description: '20 mm kalınlığında kuru çim ve yükseltilmiş döşemeye uygun kırılma mukavemeti.'
    }
  ];

  // -------------------------------------------------------------
  // PAGE COMPILATION PIPELINE (7 ARCHITECTURAL EDITORIAL PAGES)
  // -------------------------------------------------------------
  const pages = [];

  // Page 1: Cover
  if (catalog?.showCover !== false) {
    pages.push({ type: 'cover' });
  }

  // Page 2: Storytelling & Design Manifesto
  pages.push({ type: 'manifesto' });

  // Page 3: Curation & Product Family Grid
  pages.push({ type: 'overview' });

  // Page 4: Hero Product Focus (Primary Slab Showcase)
  pages.push({ type: 'hero_detail', product: safeProducts[0] });

  // Page 5: Technical Specification & Logistics Matrix
  if (catalog?.showSpecs !== false) {
    pages.push({ type: 'specs_matrix' });
  }

  // Page 6: Architectural Case Studies & Living Spaces
  pages.push({ type: 'case_studies' });

  // Page 7: Back Cover & 3D QR Portal
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
          <div key={pageItem.pageIndex} className="catalog-page p-6 sm:p-12 flex flex-col justify-between bg-stone-900 text-white relative overflow-hidden select-none">
            {/* Top Brand Monogram */}
            <div className="flex items-center justify-between border-b border-white/20 pb-4 relative z-10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#b4823c]" />
                <span className="text-[11px] font-mono tracking-widest uppercase text-stone-300">
                  {catalog?.coverSubtitle || 'ARCHITECTURAL ISSUE &bull; VOL. 2026'}
                </span>
              </div>
              <span className="text-xs font-mono font-bold tracking-widest text-[#d4af37]">
                {(brand.name || catalog?.title || 'SERAMİKBAK').toUpperCase()}
              </span>
            </div>

            {/* Center Background Artwork */}
            <div className="absolute inset-0 z-0">
              <img
                src={catalog?.coverImageUrl || safeProducts[0]?.imageUrl || '/renders/luxury_bathroom_calacatta_gold.jpg'}
                alt="Architectural Cover"
                className="w-full h-full object-cover opacity-60 filter brightness-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/50 to-transparent" />
            </div>

            {/* Bottom Typographic Title */}
            <div className="relative z-10 space-y-4 pt-48 pb-4">
              <span className="px-3 py-1 rounded-full text-[10px] font-mono tracking-widest uppercase bg-[#b4823c] text-white font-bold inline-block shadow-md">
                EDİTORYAL MİMARİ LOOKBOOK
              </span>
              <h1 className="text-3xl sm:text-5xl font-serif font-black tracking-tight leading-tight text-white max-w-xl">
                {catalog?.coverTitle || catalog?.title || 'TERRA &bull; LUXE'}
              </h1>
              <p className="text-xs sm:text-sm text-stone-300 font-light max-w-lg leading-relaxed">
                {catalog?.introText || 'Yenilikçi yüzey teknolojileri, yüksek dayanımlı porselen gövde ve çağdaş tasarım estetiği ile yaşam alanlarınıza değer katıyoruz.'}
              </p>
            </div>

            {/* Footer Folio */}
            <div className="flex items-center justify-between border-t border-white/20 pt-4 relative z-10 text-[11px] text-stone-400 font-mono">
              <span>{brand.origin || 'Türkiye'}</span>
              <span>SAYFA {String(pageNum).padStart(2, '0')} / {String(totalP).padStart(2, '0')}</span>
            </div>
          </div>
        );

      // 2. MANIFESTO & STORYTELLING
      case 'manifesto':
        return (
          <div key={pageItem.pageIndex} className="catalog-page p-6 sm:p-12 flex flex-col justify-between bg-white text-stone-900 relative overflow-hidden select-none">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <span className="text-[11px] font-mono tracking-widest text-[#b4823c] font-bold uppercase">
                01 &bull; MANİFESTO & TASARIM VİZYONU
              </span>
              <span className="text-[11px] font-mono text-stone-400">
                {brand.name || 'Bien Seramik'}
              </span>
            </div>

            <div className="my-auto py-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-7 space-y-4">
                <span className="px-2.5 py-1 rounded-md bg-stone-100 text-stone-700 text-[10px] font-mono uppercase tracking-wider font-bold">
                  Koleksiyon Felsefesi
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-extrabold text-stone-900 leading-tight">
                  &ldquo;Doğanın ham minerallerini, mimarinin kusursuz geometrisiyle dengeliyoruz.&rdquo;
                </h2>
                <p className="text-xs text-stone-600 leading-relaxed font-light">
                  {catalog?.description || 'Yüzyıllardır süregelen mermer ve taş mirasının en prestijli temsilcileri; çizilmez porselen teknolojisi, yüksek sürtünme dayanımı ve sıfıra yakın su emme oranlarıyla modern mimari mekanlara zamansız bir kimlik kazandırıyor.'}
                </p>
                <div className="p-4 rounded-2xl bg-[#fbf6ee] border-l-4 border-[#b4823c] text-stone-800 text-xs italic font-serif leading-relaxed">
                  &ldquo;Seramik yalnızca bir zemin kaplaması değil; mekanın hacmini, ışığını ve dokunsal algısını şekillendiren mimari bir kabuktur.&rdquo;
                </div>
              </div>

              <div className="md:col-span-5 space-y-3">
                <div className="rounded-2xl overflow-hidden shadow-md border border-stone-200 aspect-[4/3]">
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

            <div className="flex items-center justify-between border-t border-stone-200 pt-3 text-[11px] text-stone-400 font-mono">
              <span>KOLEKSİYON MANİFESTOSU</span>
              <span>SAYFA {String(pageNum).padStart(2, '0')}</span>
            </div>
          </div>
        );

      // 3. OVERVIEW GRID
      case 'overview':
        return (
          <div key={pageItem.pageIndex} className="catalog-page p-6 sm:p-12 flex flex-col justify-between bg-white text-stone-900 relative overflow-hidden select-none">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <span className="text-[11px] font-mono tracking-widest text-[#b4823c] font-bold uppercase">
                02 &bull; KOLEKSİYON AİLESİ & EBAT HARİTASI
              </span>
              <span className="text-[11px] font-mono text-stone-400">
                {safeProducts.length} SEÇKİN ÜRÜN
              </span>
            </div>

            <div className="pt-2">
              <h2 className="text-2xl font-serif font-extrabold text-stone-900">
                Küratör Porselen Yelpazesi
              </h2>
              <p className="text-xs text-stone-500 font-light mt-0.5">
                Mekanın fonksiyonuna göre optimize edilmiş yüzey, ebat ve kalınlık seçenekleri.
              </p>
            </div>

            <div className="my-auto py-4 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {safeProducts.map((p, idx) => (
                <div
                  key={p.id || idx}
                  className="p-3 rounded-2xl bg-stone-50 border border-stone-200 hover:border-amber-400 transition-all flex flex-col justify-between"
                >
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-white mb-2 border border-stone-200">
                    <img
                      src={p.textureUrl || p.imageUrl || '/textures/calacatta_gold.jpg'}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-black/70 text-white">
                      {p.width && p.height ? `${p.width}×${p.height} cm` : 'Standart Ebat'}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-mono text-stone-400 block">SERİ #{idx + 1}</span>
                    <h4 className="text-xs font-bold text-stone-900 truncate">{p.name}</h4>
                    <p className="text-[10px] text-stone-500">{p.finish || 'Mat Porselen'} &bull; {p.peiRating ? `PEI ${p.peiRating}` : 'PEI IV'}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-stone-200 pt-3 text-[11px] text-stone-400 font-mono">
              <span>TÜM PLAKALAR REKTİFİYE & DONMA DAYANIMLIDIR</span>
              <span>SAYFA {String(pageNum).padStart(2, '0')}</span>
            </div>
          </div>
        );

      // 4. HERO DETAIL
      case 'hero_detail':
        const hero = pageItem.product || safeProducts[0];
        return (
          <div key={pageItem.pageIndex} className="catalog-page p-6 sm:p-12 flex flex-col justify-between bg-white text-stone-900 relative overflow-hidden select-none">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <span className="text-[11px] font-mono tracking-widest text-[#b4823c] font-bold uppercase">
                03 &bull; İMZA SERİ ODAĞI
              </span>
              <span className="text-[11px] font-mono text-stone-400">
                KOD: {hero.code || hero.sku || 'MİMARİ-ÖZEL'}
              </span>
            </div>

            <div className="my-auto py-4 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-7">
                <div className="rounded-2xl overflow-hidden shadow-xl border border-stone-200 aspect-[3/4] relative">
                  <img
                    src={hero.imageUrl || '/renders/luxury_bathroom_calacatta_gold.jpg'}
                    alt={hero.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-black/60 backdrop-blur-md text-white">
                    <span className="text-[9px] font-mono uppercase text-amber-300 block font-bold">MEKAN UYGULAMASI</span>
                    <p className="text-xs font-serif font-bold">Monolitik Geniş Ebat Duvar ve Zemin</p>
                  </div>
                </div>
              </div>

              <div className="md:col-span-5 space-y-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#b4823c] font-bold block mb-1">
                    {hero.style || 'Mimari Porselen'}
                  </span>
                  <h2 className="text-2xl font-serif font-black text-stone-900 leading-tight">
                    {hero.name}
                  </h2>
                  <p className="text-xs text-stone-500 font-mono mt-0.5">
                    {hero.width}×{hero.height} cm &bull; Kalınlık: {hero.thickness ? `${hero.thickness} mm` : '9.5 mm'}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono uppercase text-stone-400 font-bold">
                    <span>Yüzey Dokusu (10x Makro)</span>
                    <span className="text-[#b4823c]">{hero.finish || 'Lappato'}</span>
                  </div>
                  <div className="h-24 rounded-xl overflow-hidden border border-stone-200">
                    <img
                      src={hero.textureUrl || hero.imageUrl || '/textures/calacatta_gold.jpg'}
                      alt="Texture"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-[11px] text-stone-600 leading-relaxed font-light">
                    {hero.description || 'Derin mineral damar geçişleri ve ışığı kusursuz kıran nano yüzey teknolojisi.'}
                  </p>
                </div>

                <div className="space-y-1.5 text-xs text-stone-700">
                  <div className="flex justify-between py-1 border-b border-stone-100">
                    <span className="font-semibold text-stone-500">Aşınma:</span>
                    <strong className="font-mono">{hero.peiRating ? `PEI ${hero.peiRating}` : 'PEI IV'}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-stone-100">
                    <span className="font-semibold text-stone-500">Kaymazlık:</span>
                    <strong className="font-mono">{hero.slipResistance || 'R9'}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-stone-100">
                    <span className="font-semibold text-stone-500">Rektifiye:</span>
                    <strong className="text-emerald-700 font-mono">{hero.rectified ? 'Evet (Lazer Kesim)' : 'Standart'}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-stone-200 pt-3 text-[11px] text-stone-400 font-mono">
              <span>MİMARİ SPESİFİKASYON KARTI</span>
              <span>SAYFA {String(pageNum).padStart(2, '0')}</span>
            </div>
          </div>
        );

      // 5. SPECS MATRIX
      case 'specs_matrix':
        return (
          <div key={pageItem.pageIndex} className="catalog-page p-6 sm:p-12 flex flex-col justify-between bg-white text-stone-900 relative overflow-hidden select-none">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <span className="text-[11px] font-mono tracking-widest text-[#b4823c] font-bold uppercase">
                04 &bull; TEKNİK ŞARTNAME & LOJİSTİK MATRİSİ
              </span>
              <span className="text-[11px] font-mono text-stone-400">
                TS EN 14411
              </span>
            </div>

            <div className="pt-2">
              <h2 className="text-2xl font-serif font-extrabold text-stone-900">
                Mimari Standart Değerleri
              </h2>
              <p className="text-xs text-stone-500 font-light mt-0.5">
                Tüm ürünler bağımsız akredite laboratuvar onaylı test raporlarına sahiptir.
              </p>
            </div>

            <div className="my-auto py-3 overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-stone-300 bg-stone-100/70 text-[10px] font-mono text-stone-600">
                    <th className="py-2 px-3">Ürün</th>
                    <th className="py-2 px-3">Ebat</th>
                    <th className="py-2 px-3">Yüzey</th>
                    <th className="py-2 px-3">PEI</th>
                    <th className="py-2 px-3">Kaymazlık</th>
                    <th className="py-2 px-3">Su Emme</th>
                    <th className="py-2 px-3">Kutu (m²)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700">
                  {safeProducts.map((p, pIdx) => (
                    <tr key={p.id || pIdx} className="hover:bg-amber-50/40">
                      <td className="py-2 px-3 font-serif font-bold text-stone-900">{p.name}</td>
                      <td className="py-2 px-3 font-mono">{p.width}×{p.height} cm</td>
                      <td className="py-2 px-3 text-stone-600">{p.finish || 'Mat'}</td>
                      <td className="py-2 px-3 font-mono font-bold text-[#b4823c]">{p.peiRating ? `PEI ${p.peiRating}` : 'PEI IV'}</td>
                      <td className="py-2 px-3 font-mono">{p.slipResistance || 'R9'}</td>
                      <td className="py-2 px-3 font-mono text-emerald-700">&le; 0.05%</td>
                      <td className="py-2 px-3 font-mono">1.44 m²</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-4 gap-3 p-3 rounded-2xl bg-stone-50 border border-stone-200 text-center">
              <div>
                <span className="text-[9px] font-mono text-stone-400 block uppercase">Donma Direnci</span>
                <strong className="text-xs font-bold text-emerald-700">ISO 10545-12</strong>
              </div>
              <div>
                <span className="text-[9px] font-mono text-stone-400 block uppercase">Kimyasal Dayanım</span>
                <strong className="text-xs font-bold text-stone-800">Sınıf GA</strong>
              </div>
              <div>
                <span className="text-[9px] font-mono text-stone-400 block uppercase">Leke Tutmazlık</span>
                <strong className="text-xs font-bold text-stone-800">Sınıf 5</strong>
              </div>
              <div>
                <span className="text-[9px] font-mono text-stone-400 block uppercase">Yeşil Bina</span>
                <strong className="text-xs font-bold text-[#b4823c]">LEED v4</strong>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-stone-200 pt-3 text-[11px] text-stone-400 font-mono">
              <span>ŞARTNAME VE HAKEDİŞ REFERANS MATRİSİ</span>
              <span>SAYFA {String(pageNum).padStart(2, '0')}</span>
            </div>
          </div>
        );

      // 6. CASE STUDIES
      case 'case_studies':
        return (
          <div key={pageItem.pageIndex} className="catalog-page p-6 sm:p-12 flex flex-col justify-between bg-white text-stone-900 relative overflow-hidden select-none">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <span className="text-[11px] font-mono tracking-widest text-[#b4823c] font-bold uppercase">
                05 &bull; MİMARİ VAKA UYGULAMALARI
              </span>
              <span className="text-[11px] font-mono text-stone-400">
                UYGULAMA SENARYOLARI
              </span>
            </div>

            <div className="pt-2">
              <h2 className="text-2xl font-serif font-extrabold text-stone-900">
                Mekânda Yaşayan Seramik
              </h2>
              <p className="text-xs text-stone-500 font-light mt-0.5">
                Konut, ticari ve otel hacimlerinde zemin ve duvar entegrasyonu.
              </p>
            </div>

            <div className="my-auto py-3 grid grid-cols-1 md:grid-cols-3 gap-3.5">
              <div className="rounded-2xl bg-stone-50 border border-stone-200 p-3 space-y-2">
                <div className="rounded-xl overflow-hidden aspect-[4/3] border border-stone-200">
                  <img src="/renders/luxury_bathroom_loft_beton.jpg" alt="Case 1" className="w-full h-full object-cover" />
                </div>
                <h4 className="text-xs font-serif font-bold text-stone-900">Mono-Loft Islak Hacim</h4>
                <p className="text-[10px] text-stone-600 leading-relaxed">
                  Derzsiz geniş plaka uygulaması ile hijyenik ve monolitik banyo zeminleri.
                </p>
              </div>

              <div className="rounded-2xl bg-stone-50 border border-stone-200 p-3 space-y-2">
                <div className="rounded-xl overflow-hidden aspect-[4/3] border border-stone-200">
                  <img src="/renders/modern_living_natural_oak.jpg" alt="Case 2" className="w-full h-full object-cover" />
                </div>
                <h4 className="text-xs font-serif font-bold text-stone-900">Doğal Ahşap & Seramik</h4>
                <p className="text-[10px] text-stone-600 leading-relaxed">
                  Yerden ısıtma sistemlerine uygun porselen parke ile sıcak yaşam alanları.
                </p>
              </div>

              <div className="rounded-2xl bg-stone-50 border border-stone-200 p-3 space-y-2">
                <div className="rounded-xl overflow-hidden aspect-[4/3] border border-stone-200">
                  <img src="/images/showroom_hero_flagship.jpg" alt="Case 3" className="w-full h-full object-cover" />
                </div>
                <h4 className="text-xs font-serif font-bold text-stone-900">Yoğun Ticari Sirkülasyon</h4>
                <p className="text-[10px] text-stone-600 leading-relaxed">
                  PEI V aşınma direnci ile lobi ve mağazalarda uzun ömürlü parlaklık.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-stone-200 pt-3 text-[11px] text-stone-400 font-mono">
              <span>SERAMİKBAK 3D VİSUALİZER İLE DESTEKLENİR</span>
              <span>SAYFA {String(pageNum).padStart(2, '0')}</span>
            </div>
          </div>
        );

      // 7. BACK COVER
      case 'back_cover':
        return (
          <div key={pageItem.pageIndex} className="catalog-page p-6 sm:p-12 flex flex-col justify-between bg-stone-950 text-white relative overflow-hidden select-none text-center">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 text-left">
              <span className="text-[11px] font-mono tracking-widest text-stone-400 uppercase">
                KURUMSAL ARKA KAPAK
              </span>
              <span className="text-[11px] font-mono text-[#d4af37] font-bold">
                {brand.name || 'Bien Seramik'}
              </span>
            </div>

            <div className="my-auto py-8 max-w-sm mx-auto space-y-6">
              <div className="space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-[#b4823c] text-white flex items-center justify-center font-serif text-2xl font-black mx-auto shadow-lg">
                  {(brand.name || 'SB').slice(0, 2).toUpperCase()}
                </div>
                <h2 className="text-2xl font-serif font-bold text-white">
                  {brand.name || 'Bien Seramik'}
                </h2>
                <p className="text-xs text-stone-400 font-light">
                  {catalog?.websiteUrl || 'www.seramikbak.com'}
                </p>
              </div>

              {/* 3D QR Code Showcase */}
              <div className="p-4 rounded-3xl bg-white/5 border border-white/10 space-y-2">
                <span className="text-[10px] font-mono uppercase text-amber-300 font-bold block">
                  3D MEKANDA DENE & VİRTUAL STUDIO
                </span>
                <div className="w-28 h-28 bg-white p-2 rounded-xl mx-auto flex items-center justify-center">
                  <div className="w-full h-full bg-stone-900 rounded-lg flex flex-col items-center justify-center text-white">
                    <QrCode size={48} className="text-amber-400" />
                    <span className="text-[7px] font-mono text-stone-300 mt-0.5">3D SCAN</span>
                  </div>
                </div>
                <p className="text-[10px] text-stone-400 font-light">
                  Kameranızla okutarak bu karoları kendi odanızda anında 3D deneyimleyin.
                </p>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-2 gap-2 text-left text-xs">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[9px] font-mono text-stone-400 uppercase block font-bold">Mimar Masası</span>
                  <p className="font-bold text-white text-xs mt-0.5">{catalog?.contactPhone || '+90 850 888 00 00'}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[9px] font-mono text-stone-400 uppercase block font-bold">E-Posta</span>
                  <p className="font-bold text-white text-xs mt-0.5 truncate">{catalog?.contactEmail || 'proje@seramikbak.com'}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-white/10 pt-3 text-[11px] text-stone-400 font-mono text-left">
              <span>SERAMİKBAK DİJİTAL YAYIN PLATFORMU &copy; 2026</span>
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
