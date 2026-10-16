'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Layers,
  ZoomIn,
  CheckCircle2,
  Shield,
  Compass,
  ArrowRight,
  QrCode,
  Droplets,
  Sun,
  Flame,
  Maximize2
} from 'lucide-react';

/**
 * 3. TASARIM AİLESİ: MATERIAL & TEXTURE (YÜZEY, DOKU VE IŞIK MONOGRAFI)
 * Seramik karo yüzeylerini, ışık yansıma indeksini, mikro rölyef dokularını,
 * mermer damar sürekliliğini ve 10x makro yakın çekimleri öne çıkaran editoryal şablon.
 */
export default function MaterialTextureTemplate({
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

  const [activeTextureTab, setActiveTextureTab] = useState(0);

  // High quality safe products fallback
  const safeProducts = products && products.length > 0 ? products : [
    {
      id: 'tex-1',
      name: 'Aren White Lappato',
      code: 'P156ZDRAJ30X0XCAAW50',
      width: 60,
      height: 120,
      thickness: 9.5,
      finish: 'Lappato Yarı Parlak',
      color: 'Kırık Beyaz / İpeksi Gri Damar',
      peiRating: 4,
      slipResistance: 'R9',
      rectified: true,
      frostResistance: true,
      imageUrl: '/renders/luxury_bathroom_calacatta_gold.jpg',
      textureUrl: '/textures/calacatta_gold.jpg',
      glossLevel: '75 GU (İpeksi Parlaklık)',
      tactileDepth: 'Mikro Lappato Zımparalama',
      lightReflection: '%82 Işık Yayılımı',
      description: 'Doğal Carrara mermerinin kalsit kristallerinden ilham alan yüzey. Nano lappato koruma kalkanı sayesinde derinlik hissi veren üç boyutlu damar kırılımları.'
    },
    {
      id: 'tex-2',
      name: 'Bona Dea Concrete Grey',
      code: 'P156XDRB55TX0XMXXG40',
      width: 60,
      height: 120,
      thickness: 10.0,
      finish: 'Brüt Beton Mat',
      color: 'Açık Çimento Grisi',
      peiRating: 5,
      slipResistance: 'R10B',
      rectified: true,
      frostResistance: true,
      imageUrl: '/renders/luxury_bathroom_loft_beton.jpg',
      textureUrl: '/textures/loft_beton.jpg',
      glossLevel: '12 GU (Ultra Mat)',
      tactileDepth: 'Mikro Gözenekli Rölyef',
      lightReflection: '%35 Işık Soğurma',
      description: 'Endüstriyel brüt beton döküm kalıplarının mikro gözenek dokusu. Homojen matlık, yüksek mekanik aşınma direnci ve yumuşak dokunsal his.'
    },
    {
      id: 'tex-3',
      name: 'Calacatta Marmi Grigio',
      code: 'CALACATTA-MARMI-60X60',
      width: 60,
      height: 60,
      thickness: 9.0,
      finish: 'Doğal Mat Yüzey',
      color: 'Duman Grisi & Beyaz',
      peiRating: 4,
      slipResistance: 'R10',
      rectified: true,
      frostResistance: true,
      imageUrl: '/renders/luxury_bathroom_albatros_antrasit.jpg',
      textureUrl: '/textures/albatros_antrasit.jpg',
      glossLevel: '20 GU (Doğal Taş Matlığı)',
      tactileDepth: 'Hafif Dalgalı Rölyef',
      lightReflection: '%48 Dengeli Parlaklık',
      description: 'Leke tutmayan mikro-kristal sır tabakasıyla mühürlenmiş doğal taş dokusu. Islak ayak güvenliği sağlayan R10 sürtünme katsayısı.'
    },
    {
      id: 'tex-4',
      name: 'Shell Stone Beige Out20',
      code: '7BANTSEET-SHELL-BEIGE-20MM',
      width: 60,
      height: 120,
      thickness: 20.0,
      finish: 'Antislip Taş Yüzey',
      color: 'Sıcak Bej / Kireçtaşı',
      peiRating: 5,
      slipResistance: 'R11 A+B+C',
      rectified: true,
      frostResistance: true,
      imageUrl: '/renders/modern_living_natural_oak.jpg',
      textureUrl: '/textures/keops_bej.jpg',
      glossLevel: '5 GU (Yansıtmasız Pürüzlü)',
      tactileDepth: 'Ağır Antislip Kumlu Doku',
      lightReflection: '%25 Düşük Parıltı',
      description: '20 mm ağır zemin plakası. Dış mekan, teras ve havuz kenarı için geliştirilmiş aşırı kaymazlık (R11) ve 10.000 N kırılma yükü direnci.'
    }
  ];

  // -------------------------------------------------------------
  // PAGE COMPILATION PIPELINE (MATERIAL & TEXTURE SPECIFIC)
  // -------------------------------------------------------------
  const pages = [];

  // Page 1: High Contrast Material Cover
  if (catalog?.showCover !== false) {
    pages.push({ type: 'material_cover' });
  }

  // Page 2: Texture Philosophy & Surface Technology
  pages.push({ type: 'surface_philosophy' });

  // Page 3: Tactile Swatches & Color Spectrum
  pages.push({ type: 'spectrum_grid' });

  // Page 4: Macro Texture Focus (Split Screen Hero)
  pages.push({ type: 'macro_focus', product: safeProducts[0] });

  // Page 5: Light Reflection & Slip Resistance Spec Sheet
  if (catalog?.showSpecs !== false) {
    pages.push({ type: 'texture_specs' });
  }

  // Page 6: Tactile Application Environments
  pages.push({ type: 'application_spaces' });

  // Page 7: Back Cover & 3D Texture Scanner
  if (catalog?.showContactPage !== false) {
    pages.push({ type: 'material_back' });
  }

  // Render preparation
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
    const p = pages[activePageIndex] || pages[0];
    pagesToRender = [{ ...p, pageIndex: activePageIndex }];
  }

  // -------------------------------------------------------------
  // PAGE RENDER SWITCH
  // -------------------------------------------------------------
  const renderPage = (pageItem) => {
    const pageNum = pageItem.pageIndex + 1;
    const totalP = pages.length;

    switch (pageItem.type) {
      // 1. MATERIAL COVER
      case 'material_cover':
        return (
          <div key={pageItem.pageIndex} className="catalog-page p-6 sm:p-12 flex flex-col justify-between bg-[#12161a] text-white relative overflow-hidden select-none">
            {/* Top Minimalist Folio */}
            <div className="flex items-center justify-between border-b border-white/15 pb-4 relative z-10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="text-[11px] font-mono tracking-widest uppercase text-stone-300">
                  SURFACE ARCHIVES &bull; MATERIAL STUDY 2026
                </span>
              </div>
              <span className="text-xs font-mono font-bold tracking-widest text-[#d4af37]">
                {(brand.name || 'BIEN SERAMİK').toUpperCase()}
              </span>
            </div>

            {/* Split Visual Center */}
            <div className="my-auto py-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative z-10">
              <div className="md:col-span-7 space-y-4">
                <span className="px-3 py-1 rounded-full text-[10px] font-mono tracking-widest uppercase bg-amber-500/20 text-amber-300 border border-amber-400/30 inline-block">
                  DOKU & MALZEME MONOGRAFI
                </span>
                <h1 className="text-3xl sm:text-5xl font-serif font-black tracking-tight leading-tight text-white">
                  MATTER &bull; LIGHT
                </h1>
                <p className="text-xs sm:text-sm text-stone-300 font-light max-w-md leading-relaxed">
                  Işığın karo yüzeyindeki kırılımları, nano-lappato ipeksi dokunuş ve porselenin mikrometrik mineral yoğunluğu.
                </p>
                <div className="flex items-center gap-4 pt-2 text-stone-400 text-xs font-mono">
                  <span>GLOSS: 10 - 85 GU</span>
                  <span>&bull;</span>
                  <span>AŞINMA: PEI IV / V</span>
                  <span>&bull;</span>
                  <span>KAYMAZLIK: R9 - R11</span>
                </div>
              </div>

              {/* Macro Texture Hero Window */}
              <div className="md:col-span-5 relative">
                <div className="rounded-3xl overflow-hidden shadow-2xl border-2 border-white/20 aspect-square group relative">
                  <img
                    src={safeProducts[0]?.textureUrl || '/textures/calacatta_gold.jpg'}
                    alt="Macro Vein"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4 text-white">
                    <span className="text-[10px] font-mono uppercase text-amber-300">10X MAKRO YÜZEY AYRINTISI</span>
                    <strong className="text-xs font-serif">Kalsit ve Altın Damar Kristalizasyonu</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-white/15 pt-4 relative z-10 text-[11px] text-stone-400 font-mono">
              <span>DOĞAL MİNERAL SERİSİ</span>
              <span>SAYFA {String(pageNum).padStart(2, '0')} / {String(totalP).padStart(2, '0')}</span>
            </div>
          </div>
        );

      // 2. SURFACE PHILOSOPHY
      case 'surface_philosophy':
        return (
          <div key={pageItem.pageIndex} className="catalog-page p-6 sm:p-12 flex flex-col justify-between bg-white text-stone-900 relative overflow-hidden select-none">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <span className="text-[11px] font-mono tracking-widest text-[#b4823c] font-bold uppercase">
                01 &bull; YÜZEY MÜHENDİSLİĞİ & IŞIK REFLEKSİYONU
              </span>
              <span className="text-[11px] font-mono text-stone-400">
                {brand.name || 'Bien Seramik'}
              </span>
            </div>

            <div className="my-auto py-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-6 space-y-4">
                <span className="px-2.5 py-1 rounded-md bg-stone-100 text-stone-700 text-[10px] font-mono uppercase tracking-wider font-bold">
                  Dokunsal Ergonomi
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-extrabold text-stone-900 leading-tight">
                  &ldquo;Seramiğin karakteri, ışıkla buluştuğu mikron mertebesindeki ilk temas yüzeyinde gizlidir.&rdquo;
                </h2>
                <div className="space-y-3 text-xs text-stone-600 leading-relaxed font-light">
                  <p>
                    Matter & Light serisi; seramik karoları sadece bir renk veya desen değil, dokunulduğunda ve ışık altında hissedilen yaşayan bir mineral yüzey olarak ele alır.
                  </p>
                  <p>
                    Nano Lappato teknolojimiz cam benzeri soğuk bir parlaklık yerine, mermerin doğal patinasını yansıtan ipeksi bir ışık yayılımı (diffuse reflection) sunar. Mikro rölyefli mat yüzeyler ise ıslak hacimlerde ayak tabanına masaj etkisi yapan ergonomik bir sürtünme konforu sağlar.
                  </p>
                </div>
              </div>

              <div className="md:col-span-6 grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2 text-center">
                  <Sun size={24} className="mx-auto text-amber-500" />
                  <strong className="text-xs font-serif text-stone-900 block">Diffüz Işık Kırılımı</strong>
                  <p className="text-[10px] text-stone-500 font-light">Mekandaki aydınlatmayı homojen dağıtır, kamaşmayı önler.</p>
                </div>
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2 text-center">
                  <Droplets size={24} className="mx-auto text-sky-500" />
                  <strong className="text-xs font-serif text-stone-900 block">Sıfır Gözenek Kalkanı</strong>
                  <p className="text-[10px] text-stone-500 font-light">Sıvı, asit ve leke emilimini &lt; %0.05 oranına indirir.</p>
                </div>
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2 text-center">
                  <Shield size={24} className="mx-auto text-emerald-600" />
                  <strong className="text-xs font-serif text-stone-900 block">Mohs 8 Yüzey Sertliği</strong>
                  <p className="text-[10px] text-stone-500 font-light">Metal sürtünmelerine ve ağır yaya trafiğine dirençli koruma.</p>
                </div>
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2 text-center">
                  <Layers size={24} className="mx-auto text-stone-700" />
                  <strong className="text-xs font-serif text-stone-900 block">Senkron 3D Rölyef</strong>
                  <p className="text-[10px] text-stone-500 font-light">Damar çizgileriyle %100 örtüşen derinlik kanalları.</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-stone-200 pt-3 text-[11px] text-stone-400 font-mono">
              <span>YÜZEY BİLİMİ & METROLOJİ</span>
              <span>SAYFA {String(pageNum).padStart(2, '0')}</span>
            </div>
          </div>
        );

      // 3. SPECTRUM GRID (TACTILE SWATCHES)
      case 'spectrum_grid':
        return (
          <div key={pageItem.pageIndex} className="catalog-page p-6 sm:p-12 flex flex-col justify-between bg-white text-stone-900 relative overflow-hidden select-none">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <span className="text-[11px] font-mono tracking-widest text-[#b4823c] font-bold uppercase">
                02 &bull; YÜZEY DOKU TAYFI & PARLAKLIK İNDEKSLERİ
              </span>
              <span className="text-[11px] font-mono text-stone-400">
                4 ANA YÜZEY SINIFI
              </span>
            </div>

            <div className="pt-2">
              <h2 className="text-2xl font-serif font-extrabold text-stone-900">
                Dokunsal Yüzey Yelpazesi
              </h2>
              <p className="text-xs text-stone-500 font-light mt-0.5">
                Mimarın hacim kurgusuna göre matlıktan kristal parlaklığa uzanan doku seçenekleri.
              </p>
            </div>

            <div className="my-auto py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {safeProducts.map((p, idx) => (
                <div
                  key={p.id || idx}
                  className="p-4 rounded-2xl bg-stone-50 border border-stone-200 hover:border-amber-400 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-mono text-stone-400 block uppercase">YÜZEY MODU #{idx + 1}</span>
                      <h4 className="text-sm font-bold text-stone-900">{p.finish}</h4>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-stone-200 text-stone-700">
                      {p.glossLevel || 'Mat / Doğal'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl overflow-hidden aspect-[4/3] border border-stone-200">
                      <img src={p.textureUrl} alt="Macro" className="w-full h-full object-cover" />
                    </div>
                    <div className="rounded-xl overflow-hidden aspect-[4/3] border border-stone-200">
                      <img src={p.imageUrl} alt="Slab" className="w-full h-full object-cover" />
                    </div>
                  </div>

                  <div className="space-y-1 text-[11px] text-stone-600 border-t border-stone-200/60 pt-2">
                    <div className="flex justify-between">
                      <span className="text-stone-400 font-mono">Işık Refleksi:</span>
                      <strong className="font-mono text-stone-800">{p.lightReflection || 'Dengeli'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400 font-mono">Doku Derinliği:</span>
                      <strong className="text-stone-800">{p.tactileDepth || 'Standart'}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-stone-200 pt-3 text-[11px] text-stone-400 font-mono">
              <span>TÜM NUMUNELER DOKUNSAL TEST KİTİNDE BULUNMAKTADIR</span>
              <span>SAYFA {String(pageNum).padStart(2, '0')}</span>
            </div>
          </div>
        );

      // 4. MACRO FOCUS HERO
      case 'macro_focus':
        const heroP = pageItem.product || safeProducts[0];
        return (
          <div key={pageItem.pageIndex} className="catalog-page p-6 sm:p-12 flex flex-col justify-between bg-white text-stone-900 relative overflow-hidden select-none">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <span className="text-[11px] font-mono tracking-widest text-[#b4823c] font-bold uppercase">
                03 &bull; İMZA DOKU YAKIN ÇEKİMİ
              </span>
              <span className="text-[11px] font-mono text-stone-400">
                {heroP.name}
              </span>
            </div>

            <div className="my-auto py-4 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-7 space-y-3">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-stone-300 aspect-square group">
                  <img
                    src={heroP.textureUrl || heroP.imageUrl}
                    alt="Macro Focus"
                    className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-1000 cursor-crosshair"
                  />
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-[10px] font-mono flex items-center gap-1.5">
                    <ZoomIn size={12} className="text-amber-400" />
                    <span>10X MİKROSKOPİK DETAY</span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 p-3.5 rounded-xl bg-black/70 backdrop-blur-md text-white">
                    <span className="text-[9px] font-mono uppercase text-amber-300 block font-bold">DAMAR GEÇİŞ DERİNLİĞİ</span>
                    <p className="text-xs font-serif">Kalsit Damarların Yüzey Altı Katmanlaşması</p>
                  </div>
                </div>
              </div>

              <div className="md:col-span-5 space-y-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#b4823c] font-bold block mb-1">
                    {heroP.finish}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-serif font-black text-stone-900 leading-tight">
                    {heroP.name}
                  </h2>
                  <p className="text-xs text-stone-500 font-mono mt-0.5">
                    {heroP.width}×{heroP.height} cm &bull; {heroP.thickness} mm
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/70 text-xs text-stone-700 leading-relaxed font-light">
                  {heroP.description}
                </div>

                <div className="space-y-2 text-xs text-stone-700">
                  <div className="flex justify-between py-1.5 border-b border-stone-100">
                    <span className="font-semibold text-stone-500">Parlaklık Seviyesi:</span>
                    <strong className="font-mono text-stone-900">{heroP.glossLevel}</strong>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-stone-100">
                    <span className="font-semibold text-stone-500">Rölyef Derinliği:</span>
                    <strong className="font-mono text-stone-900">{heroP.tactileDepth}</strong>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-stone-100">
                    <span className="font-semibold text-stone-500">Işık Yansıması:</span>
                    <strong className="font-mono text-stone-900">{heroP.lightReflection}</strong>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-stone-100">
                    <span className="font-semibold text-stone-500">Kaymazlık Güvenliği:</span>
                    <strong className="font-mono text-emerald-700">{heroP.slipResistance}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-stone-200 pt-3 text-[11px] text-stone-400 font-mono">
              <span>OPTİK VE DOKUNSAL ANALİZ SAYFASI</span>
              <span>SAYFA {String(pageNum).padStart(2, '0')}</span>
            </div>
          </div>
        );

      // 5. TEXTURE SPECS MATRIX
      case 'texture_specs':
        return (
          <div key={pageItem.pageIndex} className="catalog-page p-6 sm:p-12 flex flex-col justify-between bg-white text-stone-900 relative overflow-hidden select-none">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <span className="text-[11px] font-mono tracking-widest text-[#b4823c] font-bold uppercase">
                04 &bull; YÜZEY TEKNİK ŞARTNAME MATRİSİ
              </span>
              <span className="text-[11px] font-mono text-stone-400">
                DIN 51130 & ISO 10545
              </span>
            </div>

            <div className="pt-2">
              <h2 className="text-2xl font-serif font-extrabold text-stone-900">
                Optik ve Mekanik Değerler
              </h2>
              <p className="text-xs text-stone-500 font-light mt-0.5">
                Islak/kuru kaymazlık açıları, parlaklık birimleri (GU) ve kimyasal leke tutmama sınıfları.
              </p>
            </div>

            <div className="my-auto py-3 overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-stone-300 bg-stone-100/70 text-[10px] font-mono text-stone-600">
                    <th className="py-2.5 px-3">Yüzey İsmi</th>
                    <th className="py-2.5 px-3">Parlaklık (GU)</th>
                    <th className="py-2.5 px-3">Kaymazlık (R)</th>
                    <th className="py-2.5 px-3">Aşınma (PEI)</th>
                    <th className="py-2.5 px-3">Leke Dayanımı</th>
                    <th className="py-2.5 px-3">Temizlik Kolaylığı</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700">
                  {safeProducts.map((p, idx) => (
                    <tr key={p.id || idx} className="hover:bg-amber-50/40">
                      <td className="py-2.5 px-3">
                        <strong className="text-stone-900 block font-serif">{p.name}</strong>
                        <span className="text-[10px] text-stone-500">{p.finish}</span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-stone-800">{p.glossLevel || '20 GU'}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-[#b4823c]">{p.slipResistance}</td>
                      <td className="py-2.5 px-3 font-mono">{p.peiRating ? `PEI ${p.peiRating}` : 'PEI IV'}</td>
                      <td className="py-2.5 px-3 font-mono text-emerald-700">Sınıf 5 (Maksimum)</td>
                      <td className="py-2.5 px-3 text-stone-600">Sıcak Su & Nötr Sabun</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-4 gap-3 p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-center">
              <div>
                <span className="text-[10px] font-mono text-stone-400 block uppercase">Parlaklık Testi</span>
                <strong className="text-xs font-bold text-stone-900">ISO 2813</strong>
              </div>
              <div>
                <span className="text-[10px] font-mono text-stone-400 block uppercase">Kaymazlık Açısı</span>
                <strong className="text-xs font-bold text-emerald-700">DIN 51130</strong>
              </div>
              <div>
                <span className="text-[10px] font-mono text-stone-400 block uppercase">Asit Direnci</span>
                <strong className="text-xs font-bold text-stone-900">ISO 10545-13</strong>
              </div>
              <div>
                <span className="text-[10px] font-mono text-stone-400 block uppercase">Hijyen Sertifikası</span>
                <strong className="text-xs font-bold text-[#b4823c]">Antibakteriyel Nano</strong>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-stone-200 pt-3 text-[11px] text-stone-400 font-mono">
              <span>ŞARTNAME VE HAKEDİŞ REFERANS MATRİSİ</span>
              <span>SAYFA {String(pageNum).padStart(2, '0')}</span>
            </div>
          </div>
        );

      // 6. APPLICATION SPACES
      case 'application_spaces':
        return (
          <div key={pageItem.pageIndex} className="catalog-page p-6 sm:p-12 flex flex-col justify-between bg-white text-stone-900 relative overflow-hidden select-none">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <span className="text-[11px] font-mono tracking-widest text-[#b4823c] font-bold uppercase">
                05 &bull; DOKU VE MEKÂN ENTEGRASYONU
              </span>
              <span className="text-[11px] font-mono text-stone-400">
                IŞIK VE HACİM SENARYOLARI
              </span>
            </div>

            <div className="pt-2">
              <h2 className="text-2xl font-serif font-extrabold text-stone-900">
                Yüzeyin Hacimle Etkileşimi
              </h2>
              <p className="text-xs text-stone-500 font-light mt-0.5">
                Farklı ışık kaynakları altında yüzeyin mat, yarı parlak ve rölyef davranışları.
              </p>
            </div>

            <div className="my-auto py-3 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-2xl bg-stone-50 border border-stone-200 p-3.5 space-y-2">
                <div className="rounded-xl overflow-hidden aspect-[4/3] border border-stone-200">
                  <img src="/renders/luxury_bathroom_calacatta_gold.jpg" alt="Lappato Space" className="w-full h-full object-cover" />
                </div>
                <span className="text-[9px] font-mono uppercase text-[#b4823c] font-bold block">75 GU &bull; Lappato Işıltısı</span>
                <h4 className="text-xs font-serif font-bold text-stone-900">Banyo & Spa Hacimleri</h4>
                <p className="text-[11px] text-stone-600 font-light leading-relaxed">
                  Spot ve lineer aydınlatmalar altında altın damarları parlatırken mekana ferah derinlik katar.
                </p>
              </div>

              <div className="rounded-2xl bg-stone-50 border border-stone-200 p-3.5 space-y-2">
                <div className="rounded-xl overflow-hidden aspect-[4/3] border border-stone-200">
                  <img src="/renders/luxury_bathroom_loft_beton.jpg" alt="Mat Space" className="w-full h-full object-cover" />
                </div>
                <span className="text-[9px] font-mono uppercase text-stone-600 font-bold block">12 GU &bull; Brüt Beton Dinginliği</span>
                <h4 className="text-xs font-serif font-bold text-stone-900">Modern Salon & Mutfak</h4>
                <p className="text-[11px] text-stone-600 font-light leading-relaxed">
                  Güneş ışığını soğurarak göz yormayan, parlamayan ve sıcak ahşap mobilyalarla kontrast kuran yüzey.
                </p>
              </div>

              <div className="rounded-2xl bg-stone-50 border border-stone-200 p-3.5 space-y-2">
                <div className="rounded-xl overflow-hidden aspect-[4/3] border border-stone-200">
                  <img src="/renders/modern_living_natural_oak.jpg" alt="20mm Space" className="w-full h-full object-cover" />
                </div>
                <span className="text-[9px] font-mono uppercase text-emerald-700 font-bold block">R11 &bull; Dış Mekan Antislip</span>
                <h4 className="text-xs font-serif font-bold text-stone-900">Teras & Havuz Çevresi</h4>
                <p className="text-[11px] text-stone-600 font-light leading-relaxed">
                  Yağmur, don ve ıslaklık altında çıplak ayakla dahi kaymayı engelleyen pürüzlü doku emniyeti.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-stone-200 pt-3 text-[11px] text-stone-400 font-mono">
              <span>SERAMİKBAK 3D VİSUALİZER İLE DESTEKLENİR</span>
              <span>SAYFA {String(pageNum).padStart(2, '0')}</span>
            </div>
          </div>
        );

      // 7. MATERIAL BACK COVER
      case 'material_back':
        return (
          <div key={pageItem.pageIndex} className="catalog-page p-6 sm:p-12 flex flex-col justify-between bg-[#12161a] text-white relative overflow-hidden select-none text-center">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 text-left">
              <span className="text-[11px] font-mono tracking-widest text-stone-400 uppercase">
                DOKU ARŞİVİ &bull; ARKA KAPAK
              </span>
              <span className="text-[11px] font-mono text-[#d4af37] font-bold">
                {brand.name || 'Bien Seramik'}
              </span>
            </div>

            <div className="my-auto py-8 max-w-sm mx-auto space-y-6">
              <div className="space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center font-serif text-2xl font-black mx-auto shadow-lg">
                  M&L
                </div>
                <h2 className="text-2xl font-serif font-bold text-white">
                  Matter & Light
                </h2>
                <p className="text-xs text-stone-400 font-light">
                  {catalog?.websiteUrl || 'www.seramikbak.com'}
                </p>
              </div>

              {/* 3D Texture Scanner QR */}
              <div className="p-4 rounded-3xl bg-white/5 border border-white/10 space-y-2">
                <span className="text-[10px] font-mono uppercase text-amber-300 font-bold block">
                  3D DOKU VE IŞIK SİMÜLATÖRÜ
                </span>
                <div className="w-28 h-28 bg-white p-2 rounded-xl mx-auto flex items-center justify-center">
                  <div className="w-full h-full bg-stone-900 rounded-lg flex flex-col items-center justify-center text-white">
                    <QrCode size={48} className="text-amber-400" />
                    <span className="text-[7px] font-mono text-stone-300 mt-0.5">3D DOKU TARA</span>
                  </div>
                </div>
                <p className="text-[10px] text-stone-400 font-light">
                  Kameranızla okutarak bu karoların ışık altındaki 3D yansımasını telefonunuzda deneyimleyin.
                </p>
              </div>

              {/* Contact Coordinates */}
              <div className="grid grid-cols-2 gap-2 text-left text-xs">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[9px] font-mono text-stone-400 uppercase block font-bold">Numune Talep</span>
                  <p className="font-bold text-white text-xs mt-0.5">{catalog?.contactPhone || '+90 850 888 00 00'}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[9px] font-mono text-stone-400 uppercase block font-bold">E-Posta</span>
                  <p className="font-bold text-white text-xs mt-0.5 truncate">{catalog?.contactEmail || 'proje@seramikbak.com'}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-white/10 pt-3 text-[11px] text-stone-400 font-mono text-left">
              <span>SERAMİKBAK YÜZEY MİMARİSİ &copy; 2026</span>
              <span>SAYFA {String(pageNum).padStart(2, '0')}</span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`catalog-template-material-texture ${isLandscape ? 'orientation-landscape' : 'orientation-portrait'}`}>
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
