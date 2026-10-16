'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Eye,
  Download,
  Share2,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Sparkles,
  Layers,
  Check,
  CheckCircle2,
  Phone,
  Mail,
  Building2,
  Tag,
  Package,
  ArrowRight,
  Printer,
  QrCode,
  Shield,
  Compass,
  Sliders,
  X,
  FileText,
  RotateCcw
} from 'lucide-react';

// Real Cohesive Curated Architectural Ceramic Products
const PROTOTYPE_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Aren White Lappato',
    series: 'Aren Architectural Series',
    code: 'P156ZDRAJ30X0XCAAW50',
    dimensions: '60×120 cm',
    width: 60,
    height: 120,
    thickness: '9.5 mm',
    surface: 'Lappato Yarı Parlak',
    bodyType: 'Renkli Gövde Porselen',
    colorTone: 'Kırık Beyaz / İpeksi Gri Damar',
    pei: 'PEI IV',
    slip: 'R9',
    waterAbsorption: '< %0.08',
    frostResistant: true,
    rectified: true,
    boxM2: '1.44 m²',
    boxPcs: 2,
    palletM2: '46.08 m²',
    palletKg: '980 kg',
    renderUrl: '/renders/luxury_bathroom_calacatta_gold.jpg',
    textureUrl: '/textures/calacatta_gold.jpg',
    macroZoomText: 'Doğal İtalyan Carrara mermerinden ilham alan derin gri-altın damar geçişleri ve nano lappato yüzey parlaklığı.',
    architecturalNotes: 'Geniş banyo hacimleri, otel lobileri ve prestijli rezidans zeminlerinde monolitik genişlik hissi sağlar.'
  },
  {
    id: 'prod-2',
    name: 'Calacatta Marmi Grigio',
    series: 'Calacatta Marmi Series',
    code: 'CALACATTA-MARMI-60X60',
    dimensions: '60×60 cm',
    width: 60,
    height: 60,
    thickness: '9.0 mm',
    surface: 'Doğal Mat Yüzey',
    bodyType: 'Teknik Sırlı Porselen',
    colorTone: 'Duman Grisi & Beyaz Mermer',
    pei: 'PEI IV',
    slip: 'R10',
    waterAbsorption: '< %0.05',
    frostResistant: true,
    rectified: true,
    boxM2: '1.44 m²',
    boxPcs: 4,
    palletM2: '43.20 m²',
    palletKg: '890 kg',
    renderUrl: '/renders/luxury_bathroom_albatros_antrasit.jpg',
    textureUrl: '/textures/albatros_antrasit.jpg',
    macroZoomText: 'Hafif dokulu mat seramik gövde, ıslak ayak kaymazlığı sunarken leke tutmayan koruyucu sır tabakası.',
    architecturalNotes: 'Islak hacim zeminleri, mutfak zemin kaplamaları ve yoğun sirkülasyonlu koridorlar için optimum sürtünme dayanımı.'
  },
  {
    id: 'prod-3',
    name: 'Bona Dea Concrete Grey',
    series: 'Bona Dea Architectural Slab',
    code: 'P156XDRB55TX0XMXXG40',
    dimensions: '60×120 cm',
    width: 60,
    height: 120,
    thickness: '10.0 mm',
    surface: 'Brüt Beton Mat Dokusu',
    bodyType: 'Full Body Teknik Porselen',
    colorTone: 'Açık Çimento Grisi',
    pei: 'PEI V (Ağır Trafik)',
    slip: 'R10B',
    waterAbsorption: '< %0.02',
    frostResistant: true,
    rectified: true,
    boxM2: '1.44 m²',
    boxPcs: 2,
    palletM2: '46.08 m²',
    palletKg: '1010 kg',
    renderUrl: '/renders/luxury_bathroom_loft_beton.jpg',
    textureUrl: '/textures/loft_beton.jpg',
    macroZoomText: 'Mikro gözenekli endüstriyel beton dokusu. Homojen matlık ve yüksek mekanik aşınma direnci.',
    architecturalNotes: 'Modern loft daireler, ticari mağazalar, sanat galerileri ve açık ofis zeminlerinde çağdaş mimari duruş.'
  },
  {
    id: 'prod-4',
    name: 'Shell Stone Beige Out20',
    series: 'Shell 20mm Outdoor Series',
    code: '7BANTSEET-SHELL-BEIGE-20MM',
    dimensions: '60×120 cm (20 mm)',
    width: 60,
    height: 120,
    thickness: '20.0 mm (Ağır Yük Plakası)',
    surface: 'Antislip Taş Yüzey',
    bodyType: 'Ekstra Kalın Dış Mekan Porselen',
    colorTone: 'Sıcak Bej / Kireçtaşı',
    pei: 'PEI V',
    slip: 'R11 A+B+C',
    waterAbsorption: '< %0.01',
    frostResistant: true,
    rectified: true,
    boxM2: '0.72 m²',
    boxPcs: 1,
    palletM2: '21.60 m²',
    palletKg: '990 kg',
    renderUrl: '/renders/modern_living_natural_oak.jpg',
    textureUrl: '/textures/keops_bej.jpg',
    macroZoomText: '20 mm yükseltilmiş döşeme ve kuru çim/kum üzeri yapıştırmasız montaja uygun kırılma mukavemeti (10.000 N+).',
    architecturalNotes: 'Havuz kenarları, teras bahçeleri, villa girişleri ve otopark üstü hafif araç trafiği alanları.'
  },
  {
    id: 'prod-5',
    name: 'Concept Grigio Lappato',
    series: 'Concept Urban Architectural',
    code: 'P015ZDRC180X0XFAAG50',
    dimensions: '60×60 cm',
    width: 60,
    height: 60,
    thickness: '9.5 mm',
    surface: 'Full Lappato Kristal Parlak',
    bodyType: 'Teknik Porselen',
    colorTone: 'Titanyum Koyu Gri',
    pei: 'PEI IV',
    slip: 'R9',
    waterAbsorption: '< %0.05',
    frostResistant: true,
    rectified: true,
    boxM2: '1.44 m²',
    boxPcs: 4,
    palletM2: '43.20 m²',
    palletKg: '920 kg',
    renderUrl: '/images/showroom_hero_flagship.jpg',
    textureUrl: '/textures/magma_antrasit.jpg',
    macroZoomText: 'Cam benzeri parlaklık derinliği sunan kristal sır teknolojisi ve mikrometrik rektifiye kenar kesimi.',
    architecturalNotes: 'İç mekan lüks salonlar, otel suitleri ve kurumsal yönetim katlarında aydınlatmayı artıran yansıtıcı yüzey.'
  },
  {
    id: 'prod-6',
    name: 'Sakura Natural Wood',
    series: 'Sakura Biophilic Collection',
    code: 'G015ZDRR390X0XMAAK30',
    dimensions: '20×120 cm / 60×60 cm Modül',
    width: 60,
    height: 60,
    thickness: '9.0 mm',
    surface: 'Doğal Ahşap Rölyef',
    bodyType: 'Porselen Parke Hibrit',
    colorTone: 'Doğal Meşe / Bal Rengi',
    pei: 'PEI IV',
    slip: 'R10',
    waterAbsorption: '< %0.06',
    frostResistant: true,
    rectified: true,
    boxM2: '1.44 m²',
    boxPcs: 4,
    palletM2: '43.20 m²',
    palletKg: '880 kg',
    renderUrl: '/renders/luxury_bathroom_natural_oak.jpg',
    textureUrl: '/textures/natural_oak.jpg',
    macroZoomText: 'Gerçek meşe ağacının damar dokusunu seramiğin su ve leke geçirmezliği ile buluşturan 3D senkronize yüzey.',
    architecturalNotes: 'Yerden ısıtmalı villa salonları, spa dinlenme alanları ve restorasyon projelerinde biyofilik sıcaklık.'
  }
];

export default function CatalogPrototypePage() {
  const [activePage, setActivePage] = useState(1);
  const [spreadMode, setSpreadMode] = useState('single'); // 'single' (1 Sayfa) | 'spread' (Çift Sayfa Dergi)
  const [activeBrandPreset, setActiveBrandPreset] = useState('bien'); // 'bien' | 'kutahya'
  const [activePalette, setActivePalette] = useState('travertine'); // 'travertine' | 'slate' | 'bronze'
  const [zoomLevel, setZoomLevel] = useState(100);
  const [selectedProductForModal, setSelectedProductForModal] = useState(null);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [inquiryType, setInquiryType] = useState('quote');
  const [inquirySubmitted, setInquirySubmitted] = useState(false);

  const totalPages = 7;

  // Active Brand Profile
  const currentBrand = useMemo(() => {
    if (activeBrandPreset === 'kutahya') {
      return {
        name: 'NG Kütahya Seramik',
        tagline: 'Modern Yaşam Alanları İçin İleri Seramik Teknolojileri',
        origin: 'Kütahya, Türkiye',
        founded: '1989',
        logoUrl: '/logos/bien.png', // fallback
        accentColor: '#1e293b',
        secondaryColor: '#94a3b8'
      };
    }
    return {
      name: 'Bien Seramik',
      tagline: 'Doğadan İlham Alan Mimari Yüzeyler & Porselen Koleksiyonları',
      origin: 'Bilecik & Bozüyük, Türkiye',
      founded: '1965',
      logoUrl: '/logos/bien.png',
      accentColor: '#b4823c',
      secondaryColor: '#d4af37'
    };
  }, [activeBrandPreset]);

  // Color Theme Presets
  const themeStyles = useMemo(() => {
    if (activePalette === 'slate') {
      return {
        bg: 'bg-[#12161f]',
        cardBg: 'bg-[#181f2c]',
        border: 'border-slate-800',
        text: 'text-slate-100',
        subtext: 'text-slate-400',
        accent: 'text-sky-400',
        accentBg: 'bg-sky-500/10 border-sky-400/30 text-sky-300',
        highlight: '#38bdf8',
        pageBorder: 'border-slate-800'
      };
    }
    if (activePalette === 'bronze') {
      return {
        bg: 'bg-[#16120e]',
        cardBg: 'bg-[#1f1913]',
        border: 'border-[#3a2c20]',
        text: 'text-[#f5ece1]',
        subtext: 'text-[#ab9886]',
        accent: 'text-[#d4af37]',
        accentBg: 'bg-[#d4af37]/10 border-[#d4af37]/30 text-[#e9c766]',
        highlight: '#d4af37',
        pageBorder: 'border-[#382b20]'
      };
    }
    // Travertine & Chalk White (Default Architectural)
    return {
      bg: 'bg-[#f8f7f4]',
      cardBg: 'bg-white',
      border: 'border-stone-200/90',
      text: 'text-stone-900',
      subtext: 'text-stone-500',
      accent: 'text-[#b4823c]',
      accentBg: 'bg-[#b4823c]/10 border-[#b4823c]/25 text-[#9a6e2e]',
      highlight: '#b4823c',
      pageBorder: 'border-stone-200'
    };
  }, [activePalette]);

  const handlePrevPage = () => {
    if (spreadMode === 'spread') {
      setActivePage((p) => Math.max(1, p - 2));
    } else {
      setActivePage((p) => Math.max(1, p - 1));
    }
  };

  const handleNextPage = () => {
    if (spreadMode === 'spread') {
      setActivePage((p) => Math.min(totalPages, p + 2));
    } else {
      setActivePage((p) => Math.min(totalPages, p + 1));
    }
  };

  return (
    <div className={`min-h-screen ${themeStyles.bg} transition-colors duration-300 font-sans pb-16`}>
      {/* 1. TOP CURATOR CONTROL BAR (STUDIO MASTER CONTROLS) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 px-4 sm:px-6 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Brand & Prototype Identity */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <Link
              href="/marka/kataloglar"
              className="p-2 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition flex items-center gap-1.5 text-xs font-semibold"
            >
              <ChevronLeft size={16} />
              <span className="hidden sm:inline">Stüdyoya Dön</span>
            </Link>

            <div className="h-4 w-px bg-stone-200" />

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                  Örnek Mimari Lookbook Prototipi
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/15 text-amber-900 border border-amber-500/30">
                  Aşama 3 Tasarım
                </span>
              </div>
              <p className="text-[11px] text-stone-500 font-medium">
                {currentBrand.name} &bull; 2026 Architectural Slabs & Living Lookbook
              </p>
            </div>
          </div>

          {/* Interactive Styling Switches (Prototip Değerlendirme Araçları) */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
            {/* View Mode Toggle */}
            <div className="flex items-center p-1 rounded-xl bg-stone-100 border border-stone-200 text-xs">
              <button
                type="button"
                onClick={() => setSpreadMode('single')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
                  spreadMode === 'single' ? 'bg-white shadow-2xs text-stone-900' : 'text-stone-500 hover:text-stone-800'
                }`}
                title="Tek Sayfa A4 Dikey Sunum"
              >
                <BookOpen size={13} />
                <span className="hidden sm:inline">Tek Sayfa</span>
              </button>
              <button
                type="button"
                onClick={() => setSpreadMode('spread')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
                  spreadMode === 'spread' ? 'bg-white shadow-2xs text-stone-900' : 'text-stone-500 hover:text-stone-800'
                }`}
                title="Çift Sayfa Dergi / Lookbook Formatı"
              >
                <Layers size={13} />
                <span className="hidden sm:inline">Çift Sayfa Spread</span>
              </button>
            </div>

            {/* Color Palette Switcher */}
            <div className="flex items-center p-1 rounded-xl bg-stone-100 border border-stone-200 text-xs">
              <span className="text-[10px] font-bold text-stone-400 px-1.5 hidden lg:inline">Tema:</span>
              {[
                { id: 'travertine', label: 'Taş / Beyaz', color: '#e8e5dc' },
                { id: 'slate', label: 'Antrasit', color: '#1e293b' },
                { id: 'bronze', label: 'Lüks Bronz', color: '#b4823c' }
              ].map((pal) => (
                <button
                  key={pal.id}
                  type="button"
                  onClick={() => setActivePalette(pal.id)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    activePalette === pal.id
                      ? 'bg-white shadow-2xs text-stone-900'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full border border-black/10" style={{ backgroundColor: pal.color }} />
                  <span>{pal.label}</span>
                </button>
              ))}
            </div>

            {/* Quick Actions */}
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-bold flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
              title="Baskı ve PDF Önizlemesi"
            >
              <Printer size={13} />
              <span className="hidden md:inline">Yazdır / PDF</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedProductForModal(PROTOTYPE_PRODUCTS[0]);
                setShowInquiryModal(true);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-[#b4823c] hover:bg-[#9a6e2e] text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
            >
              <Sparkles size={13} />
              <span>Teklif & Numune Modalı</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. SUB-NAVIGATION BAR (SAYFA NUMARALARI VE DERGİ KONTROLLERİ) */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-5 pb-2 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-extrabold uppercase tracking-widest text-[11px] text-stone-400">
            Sayfalar:
          </span>
          {[
            { num: 1, title: 'Kapak' },
            { num: 2, title: 'İlham & Hikaye' },
            { num: 3, title: 'Koleksiyon Ailesi' },
            { num: 4, title: 'Ürün Detayı' },
            { num: 5, title: 'Teknik Tablo' },
            { num: 6, title: 'Mekân Uygulamaları' },
            { num: 7, title: 'İletişim & QR' }
          ].map((item) => (
            <button
              key={item.num}
              type="button"
              onClick={() => setActivePage(item.num)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                activePage === item.num
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-200/60 text-stone-600 hover:bg-stone-300'
              }`}
            >
              <span>{item.num}.</span>
              <span className="hidden md:inline">{item.title}</span>
            </button>
          ))}
        </div>

        {/* Pager Prev / Next */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handlePrevPage}
            disabled={activePage === 1}
            className="p-2 rounded-lg bg-white border border-stone-200 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed text-stone-700 transition cursor-pointer shadow-2xs"
            title="Önceki Sayfa"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="font-mono text-xs font-bold px-2 text-stone-600">
            {activePage} / {totalPages}
          </span>
          <button
            type="button"
            onClick={handleNextPage}
            disabled={activePage >= totalPages}
            className="p-2 rounded-lg bg-white border border-stone-200 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed text-stone-700 transition cursor-pointer shadow-2xs"
            title="Sonraki Sayfa"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* 3. MAIN SPREAD CONTAINER (A4 ORANI: 1:1.414 — MİMARİ YAYIN FORMATI) */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 flex justify-center">
        <div
          className={`w-full transition-all duration-300 ${
            spreadMode === 'spread' ? 'max-w-6xl' : 'max-w-3xl'
          }`}
        >
          {/* SPREAD MODE: Ekranda Yan Yana 2 Sayfa */}
          {spreadMode === 'spread' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 sm:p-8 rounded-3xl shadow-2xl border border-stone-300/80">
              <div className="border border-stone-200 rounded-2xl p-6 sm:p-8 min-h-[780px] flex flex-col justify-between bg-white relative overflow-hidden">
                <PrototypePageContent
                  pageNum={activePage}
                  brand={currentBrand}
                  products={PROTOTYPE_PRODUCTS}
                  themeStyles={themeStyles}
                  onSelectProduct={(p) => {
                    setSelectedProductForModal(p);
                    setShowInquiryModal(true);
                  }}
                />
              </div>

              <div className="border border-stone-200 rounded-2xl p-6 sm:p-8 min-h-[780px] flex flex-col justify-between bg-white relative overflow-hidden">
                {activePage + 1 <= totalPages ? (
                  <PrototypePageContent
                    pageNum={activePage + 1}
                    brand={currentBrand}
                    products={PROTOTYPE_PRODUCTS}
                    themeStyles={themeStyles}
                    onSelectProduct={(p) => {
                      setSelectedProductForModal(p);
                      setShowInquiryModal(true);
                    }}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-stone-300 text-xs font-serif italic">
                    Katalog Sonu &bull; SeramikBak Digital Publishing
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* SINGLE PAGE MODE: Tam A4 Dikey Editoryal Görünüm */
            <div className="bg-white p-6 sm:p-12 rounded-3xl shadow-2xl border border-stone-300/80 min-h-[920px] flex flex-col justify-between relative overflow-hidden transition-all">
              <PrototypePageContent
                pageNum={activePage}
                brand={currentBrand}
                products={PROTOTYPE_PRODUCTS}
                themeStyles={themeStyles}
                onSelectProduct={(p) => {
                  setSelectedProductForModal(p);
                  setShowInquiryModal(true);
                }}
              />
            </div>
          )}
        </div>
      </main>

      {/* 4. MODAL: İNTERAKTİF NUMUNE VE FİYAT TEKLİFİ MODALI (KURUMSAL PROJE MASASI) */}
      {showInquiryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-2xl border border-stone-200 relative animate-in zoom-in-95 duration-200">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#b4823c] via-amber-400 to-[#b4823c]" />

            <div className="flex items-start justify-between border-b border-stone-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#b4823c] block">
                  Kurumsal B2B Proje Masası
                </span>
                <h3 className="text-lg font-serif font-extrabold text-stone-900">
                  {inquiryType === 'quote' ? 'Mimari Fiyat Teklifi İste' : 'Fiziksel Numune Kiti Talep Et'}
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Ürün: <strong className="text-stone-800">{selectedProductForModal?.name || 'Katalog Ürünleri'}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowInquiryModal(false)}
                className="p-1.5 rounded-full text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            {inquirySubmitted ? (
              <div className="py-6 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                  <CheckCircle2 size={32} />
                </div>
                <h4 className="text-base font-bold text-stone-900">Talebiniz Marka Paneline İletildi</h4>
                <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
                  Talebiniz <strong>{currentBrand.name}</strong> yetkili satış masasına başarıyla kaydedildi. Marka temsilcisi en kısa sürede dönüş yapacaktır.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setInquirySubmitted(false);
                    setShowInquiryModal(false);
                  }}
                  className="px-6 py-2 rounded-xl bg-stone-900 text-white font-bold text-xs shadow-md"
                >
                  Pencereyi Kapat
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setInquirySubmitted(true);
                }}
                className="space-y-3 text-xs"
              >
                {/* Type Tabs */}
                <div className="grid grid-cols-2 p-1 rounded-xl bg-stone-100 gap-1 font-bold">
                  <button
                    type="button"
                    onClick={() => setInquiryType('quote')}
                    className={`py-1.5 rounded-lg transition ${
                      inquiryType === 'quote' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500'
                    }`}
                  >
                    Fiyat Teklifi İste
                  </button>
                  <button
                    type="button"
                    onClick={() => setInquiryType('sample')}
                    className={`py-1.5 rounded-lg transition ${
                      inquiryType === 'sample' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500'
                    }`}
                  >
                    Numune Talep Et
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-stone-700 block mb-1">Ad Soyad *</label>
                    <input
                      type="text"
                      required
                      placeholder="Mimar Selin Kaya"
                      className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:bg-white focus:outline-none focus:border-[#b4823c]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-stone-700 block mb-1">Firma / Proje Ofisi</label>
                    <input
                      type="text"
                      placeholder="Kaya Mimarlık & Tasarım"
                      className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:bg-white focus:outline-none focus:border-[#b4823c]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-stone-700 block mb-1">Telefon Numarası *</label>
                    <input
                      type="tel"
                      required
                      placeholder="05XX XXX XX XX"
                      className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:bg-white focus:outline-none focus:border-[#b4823c]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-stone-700 block mb-1">E-posta Adresi *</label>
                    <input
                      type="email"
                      required
                      placeholder="proje@ofis.com"
                      className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:bg-white focus:outline-none focus:border-[#b4823c]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">
                    {inquiryType === 'quote' ? 'Proje Metrajı (m²) ve Detaylar' : 'Numune Teslimat Adresi & İlgilenilen Yüzey'}
                  </label>
                  <textarea
                    rows={2}
                    placeholder={
                      inquiryType === 'quote'
                        ? 'Tahmini 350 m² zemin uygulaması, 2026 Q3 teslimat...'
                        : 'Koleksiyon numune kiti için teslimat adresi ve proje lokasyonu...'
                    }
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:bg-white focus:outline-none focus:border-[#b4823c] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#b4823c] to-[#9a6e2e] text-white font-extrabold text-xs shadow-md hover:shadow-lg transition cursor-pointer"
                >
                  {inquiryType === 'quote' ? 'Teklif Talebini Gönder' : 'Numune Kiti İste'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// PROTOTYPE 7 MASTER PAGES RENDERER (EDITORIAL ARCHITECTURAL QUALITY)
// -------------------------------------------------------------
function PrototypePageContent({ pageNum, brand, products, themeStyles, onSelectProduct }) {
  // PAGE 1: ETKİLEYİCİ MARKA VE KOLEKSİYON KAPAĞI (COVER)
  if (pageNum === 1) {
    return (
      <div className="h-full flex flex-col justify-between relative z-10">
        {/* Top Folio Header */}
        <div className="flex items-center justify-between border-b border-stone-200/80 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#b4823c]" />
            <span className="text-[11px] font-mono tracking-widest text-stone-400 uppercase font-semibold">
              ARCHITECTURAL ISSUE &bull; VOL. 2026
            </span>
          </div>
          <span className="text-[11px] font-mono tracking-widest text-stone-500 font-bold">
            {brand.name.toUpperCase()}
          </span>
        </div>

        {/* Center Cover Art & Typography */}
        <div className="my-auto py-8 space-y-6">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-stone-200 aspect-[16/10] group">
            <img
              src="/renders/luxury_bathroom_calacatta_gold.jpg"
              alt="Architectural Cover Slab"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-6 sm:p-10 text-white">
              <span className="inline-block px-3 py-1 rounded-full text-[10px] font-mono tracking-widest uppercase bg-[#b4823c] text-white font-bold w-fit mb-2 shadow-sm">
                EXCLUSIVE LOOKBOOK
              </span>
              <h1 className="text-3xl sm:text-5xl font-serif font-black tracking-tight leading-tight">
                TERRA &bull; LUXE
              </h1>
              <p className="text-xs sm:text-sm text-stone-300 font-light max-w-lg mt-2 leading-relaxed">
                Işığın mermer damarlarındaki yankısı, yüksek dayanımlı porselen gövde ve çağdaş mimari mekanlar için tasarlanmış geniş ebat plakalar.
              </p>
            </div>
          </div>

          {/* Editorial Metadata Triplets */}
          <div className="grid grid-cols-3 gap-4 pt-2 border-t border-stone-100 text-stone-600">
            <div>
              <span className="text-[10px] font-mono tracking-wider text-stone-400 uppercase block">Kürasyon</span>
              <strong className="text-xs font-serif text-stone-900 block mt-0.5">Mimari Porselen Serisi</strong>
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-wider text-stone-400 uppercase block">Ebat Yelpazesi</span>
              <strong className="text-xs font-serif text-stone-900 block mt-0.5">60×60 &bull; 60×120 &bull; 20mm</strong>
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-wider text-stone-400 uppercase block">Üretim Standardı</span>
              <strong className="text-xs font-serif text-stone-900 block mt-0.5">EN 14411 Bla / LEED v4</strong>
            </div>
          </div>
        </div>

        {/* Bottom Folio */}
        <div className="flex items-center justify-between pt-4 border-t border-stone-200/80 text-[11px] text-stone-400 font-mono">
          <span>{brand.origin}</span>
          <span>SAYFA 01</span>
        </div>
      </div>
    );
  }

  // PAGE 2: KOLEKSİYON HİKÂYESİ VE İLHAM SAYFASI (STORYTELLING & MOODBOARD)
  if (pageNum === 2) {
    return (
      <div className="h-full flex flex-col justify-between relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200/80 pb-3">
          <span className="text-[11px] font-mono tracking-widest text-[#b4823c] font-bold uppercase">
            01 &bull; MANİFESTO & TASARIM VİZYONU
          </span>
          <span className="text-[11px] font-mono tracking-widest text-stone-400">
            {brand.name}
          </span>
        </div>

        {/* 2-Column Asymmetrical Editorial Spread */}
        <div className="my-auto py-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Left Narrative (7 Cols) */}
          <div className="md:col-span-7 space-y-4">
            <span className="px-2.5 py-1 rounded-md bg-stone-100 text-stone-700 text-[10px] font-mono uppercase tracking-wider font-bold">
              Koleksiyon Felsefesi
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-extrabold text-stone-900 leading-tight">
              &ldquo;Doğanın ham minerallerini, mimarinin kusursuz geometrisiyle dengeliyoruz.&rdquo;
            </h2>
            <div className="space-y-3 text-xs text-stone-600 leading-relaxed font-light">
              <p>
                Terra Luxe koleksiyonu; yüzyıllardır İtalyan taş ocaklarından çıkan Carrara ve Grigio mermerlerinin dingin dokularını, modern porselen teknolojisinin sıfır su emme ve çizilmezlik avantajlarıyla bir araya getiriyor.
              </p>
              <p>
                İç mekanlarda homojen ışık kırılımları oluşturan nano-lappato yüzeyler, ıslak zeminlerde ise güvenli adımlar sağlayan mikro-mat sır tabakasıyla desteklenmiştir. Mimar ve iç mimarlara projenin tüm ölçeklerinde tutarlı bir tasarım dili sunar.
              </p>
            </div>

            {/* Pull Quote Box */}
            <div className="p-4 rounded-2xl bg-[#fbf6ee] border-l-4 border-[#b4823c] text-stone-800 text-xs italic font-serif leading-relaxed">
              &ldquo;Seramik sadece bir kaplama malzemesi değil; ışığı yönlendiren, hacmin akustiğini ve dokunsal algısını şekillendiren mimari bir kabuktur.&rdquo;
              <span className="block font-sans font-bold text-[10px] text-[#b4823c] uppercase tracking-wider not-italic mt-1.5">
                — Bien Seramik Tasarım Stüdyosu
              </span>
            </div>
          </div>

          {/* Right Moodboard Collage (5 Cols) */}
          <div className="md:col-span-5 space-y-3">
            <div className="rounded-2xl overflow-hidden shadow-lg border border-stone-200 aspect-[4/3]">
              <img
                src="/renders/luxury_bathroom_albatros_antrasit.jpg"
                alt="Moodboard Texture"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-xl overflow-hidden shadow-xs border border-stone-200 aspect-square">
                <img
                  src="/textures/calacatta_gold.jpg"
                  alt="Marble Vein Macro"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="rounded-xl overflow-hidden shadow-xs border border-stone-200 aspect-square">
                <img
                  src="/textures/natural_oak.jpg"
                  alt="Wood Texture Pairing"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <p className="text-[10px] text-stone-400 font-mono text-center">
              FIG 1.1 &bull; Mermer, Antrasit Taş ve Biyofilik Ahşap Uyumu
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-stone-200/80 text-[11px] text-stone-400 font-mono">
          <span>KOLEKSİYON MANİFESTOSU</span>
          <span>SAYFA 02</span>
        </div>
      </div>
    );
  }

  // PAGE 3: ÜRÜN AİLESİNİ SUNAN EDİTORYAL SAYFA (COLLECTION OVERVIEW GRID)
  if (pageNum === 3) {
    return (
      <div className="h-full flex flex-col justify-between relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200/80 pb-3">
          <span className="text-[11px] font-mono tracking-widest text-[#b4823c] font-bold uppercase">
            02 &bull; KOLEKSİYON AİLESİ & EBAT HARİTASI
          </span>
          <span className="text-[11px] font-mono tracking-widest text-stone-400">
            6 TEMEL SERİ
          </span>
        </div>

        {/* Title */}
        <div className="pt-2">
          <h2 className="text-2xl font-serif font-extrabold text-stone-900">
            Küratör Porselen Yelpazesi
          </h2>
          <p className="text-xs text-stone-500 font-light mt-0.5">
            Mekanın fonksiyonuna göre optimize edilmiş yüzey, ebat ve kalınlık seçenekleri.
          </p>
        </div>

        {/* 6 Products Grid */}
        <div className="my-auto py-4 grid grid-cols-2 sm:grid-cols-3 gap-3.5">
          {products.map((p, idx) => (
            <div
              key={p.id}
              onClick={() => onSelectProduct(p)}
              className="group p-3 rounded-2xl bg-stone-50/70 border border-stone-200/80 hover:border-amber-400/80 hover:bg-white transition-all shadow-2xs hover:shadow-md cursor-pointer flex flex-col justify-between"
            >
              {/* Product Thumbnail */}
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-white mb-2.5 border border-stone-200">
                <img
                  src={p.textureUrl || p.renderUrl}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-black/70 text-white backdrop-blur-xs">
                  {p.dimensions}
                </span>
              </div>

              {/* Product Meta */}
              <div className="space-y-1">
                <span className="text-[9px] font-mono text-stone-400 uppercase block">0{idx + 1} &bull; {p.series}</span>
                <h4 className="text-xs font-bold text-stone-900 group-hover:text-[#b4823c] transition truncate">
                  {p.name}
                </h4>
                <div className="flex items-center justify-between text-[10px] text-stone-500 pt-1 border-t border-stone-100">
                  <span>{p.surface}</span>
                  <span className="font-mono font-bold text-stone-700">{p.pei}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-stone-200/80 text-[11px] text-stone-400 font-mono">
          <span>TÜM PLAKALAR REKTİFİYE & DONMA DAYANIMLIDIR</span>
          <span>SAYFA 03</span>
        </div>
      </div>
    );
  }

  // PAGE 4: BÜYÜK GÖRSELLİ TEK ÜRÜN DETAY SAYFASI (HERO PRODUCT SHOWCASE)
  if (pageNum === 4) {
    const heroProduct = products[0]; // Aren White Lappato
    return (
      <div className="h-full flex flex-col justify-between relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200/80 pb-3">
          <span className="text-[11px] font-mono tracking-widest text-[#b4823c] font-bold uppercase">
            03 &bull; İMZA SERİ ODAĞI
          </span>
          <span className="text-[11px] font-mono tracking-widest text-stone-400">
            SKU: {heroProduct.code}
          </span>
        </div>

        {/* Hero Product Layout: Left Big Slab + Right Macro Zoom & Specs */}
        <div className="my-auto py-4 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Left: Monumental Vertical Slab (7 Cols) */}
          <div className="md:col-span-7 space-y-3">
            <div className="relative rounded-2xl overflow-hidden shadow-xl border border-stone-200 aspect-[3/4] group">
              <img
                src={heroProduct.renderUrl}
                alt={heroProduct.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute bottom-3 left-3 right-3 p-3.5 rounded-xl bg-black/60 backdrop-blur-md text-white flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-mono tracking-widest uppercase text-amber-300 block">
                    UYGULAMA ÖRNEĞİ
                  </span>
                  <p className="text-xs font-serif font-bold">Lüks Islak Hacim & Duvar Kaplama</p>
                </div>
                <button
                  type="button"
                  onClick={() => onSelectProduct(heroProduct)}
                  className="px-3 py-1.5 rounded-lg bg-[#b4823c] hover:bg-[#9a6e2e] text-white font-bold text-[10px] shadow transition cursor-pointer"
                >
                  Numune İste
                </button>
              </div>
            </div>
          </div>

          {/* Right: Detailed Typography & Macro Texture (5 Cols) */}
          <div className="md:col-span-5 space-y-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#b4823c] font-bold block mb-1">
                {heroProduct.series}
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-stone-900 leading-tight">
                {heroProduct.name}
              </h2>
              <p className="text-xs text-stone-500 font-mono mt-1">
                {heroProduct.dimensions} &bull; Kalınlık: {heroProduct.thickness}
              </p>
            </div>

            {/* Macro Zoom Box */}
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono uppercase text-stone-400 font-bold">
                <span>Yüzey Dokusu (10x Makro Zoom)</span>
                <span className="text-[#b4823c]">Lappato Nano</span>
              </div>
              <div className="h-28 rounded-xl overflow-hidden border border-stone-200 relative">
                <img
                  src={heroProduct.textureUrl}
                  alt="Texture Macro"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-[11px] text-stone-600 leading-relaxed font-light">
                {heroProduct.macroZoomText}
              </p>
            </div>

            {/* Architectural Highlights */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-stone-100 text-stone-700">
                <span className="font-semibold text-stone-500">Aşınma Sınıfı:</span>
                <strong className="font-mono">{heroProduct.pei} (Yüksek Yoğunluk)</strong>
              </div>
              <div className="flex justify-between py-1.5 border-b border-stone-100 text-stone-700">
                <span className="font-semibold text-stone-500">Kaymazlık:</span>
                <strong className="font-mono">{heroProduct.slip}</strong>
              </div>
              <div className="flex justify-between py-1.5 border-b border-stone-100 text-stone-700">
                <span className="font-semibold text-stone-500">Su Emme:</span>
                <strong className="font-mono text-emerald-700">{heroProduct.waterAbsorption}</strong>
              </div>
              <div className="flex justify-between py-1.5 border-b border-stone-100 text-stone-700">
                <span className="font-semibold text-stone-500">Kenar Tipi:</span>
                <strong className="text-stone-800">Lazer Kesim Rektifiye</strong>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onSelectProduct(heroProduct)}
              className="w-full py-2.5 rounded-xl border border-[#b4823c] text-[#b4823c] hover:bg-[#b4823c] hover:text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
            >
              <Sparkles size={14} />
              <span>Bu Ürün İçin Teklif Al</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-stone-200/80 text-[11px] text-stone-400 font-mono">
          <span>MİMARİ PROJE SPESİFİKASYON KARTI</span>
          <span>SAYFA 04</span>
        </div>
      </div>
    );
  }

  // PAGE 5: ÜRÜN VARYANTLARI VE TEKNİK ÖZELLİKLER TABLOSU (SPEC SHEET & LOGISTICS)
  if (pageNum === 5) {
    return (
      <div className="h-full flex flex-col justify-between relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200/80 pb-3">
          <span className="text-[11px] font-mono tracking-widest text-[#b4823c] font-bold uppercase">
            04 &bull; TEKNİK ŞARTNAME & LOJİSTİK PARAMETRELER
          </span>
          <span className="text-[11px] font-mono tracking-widest text-stone-400">
            STANDART: ISO 13006
          </span>
        </div>

        {/* Title */}
        <div className="pt-2">
          <h2 className="text-2xl font-serif font-extrabold text-stone-900">
            Mimari Teknik Spesifikasyonlar
          </h2>
          <p className="text-xs text-stone-500 font-light mt-0.5">
            İnşaat şartnameleri, hakedişler ve ihracat lojistik planlaması için teyitli değerler.
          </p>
        </div>

        {/* Responsive Table */}
        <div className="my-auto py-3 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-stone-300 bg-stone-100/70 text-[11px] font-mono text-stone-600">
                <th className="py-2.5 px-3">Ürün Adı & Kodu</th>
                <th className="py-2.5 px-3">Ebat</th>
                <th className="py-2.5 px-3">Yüzey</th>
                <th className="py-2.5 px-3">PEI</th>
                <th className="py-2.5 px-3">Kaymazlık</th>
                <th className="py-2.5 px-3">Kutu (m²)</th>
                <th className="py-2.5 px-3">Palet (kg)</th>
                <th className="py-2.5 px-3 text-right">Aksiyon</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-amber-50/40 transition">
                  <td className="py-2.5 px-3">
                    <strong className="text-stone-900 block font-serif">{p.name}</strong>
                    <span className="text-[10px] font-mono text-stone-400">{p.code}</span>
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-stone-800">{p.dimensions}</td>
                  <td className="py-2.5 px-3 text-stone-600">{p.surface}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-[#b4823c]">{p.pei}</td>
                  <td className="py-2.5 px-3 font-mono">{p.slip}</td>
                  <td className="py-2.5 px-3 font-mono">{p.boxM2} ({p.boxPcs} ad.)</td>
                  <td className="py-2.5 px-3 font-mono">{p.palletKg}</td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => onSelectProduct(p)}
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

        {/* Quality Badges */}
        <div className="grid grid-cols-4 gap-3 p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-center">
          <div>
            <span className="text-[10px] font-mono text-stone-400 block uppercase">Su Emme</span>
            <strong className="text-xs font-bold text-stone-800 font-mono">E &le; 0.05%</strong>
          </div>
          <div>
            <span className="text-[10px] font-mono text-stone-400 block uppercase">Donma Direnci</span>
            <strong className="text-xs font-bold text-emerald-700 font-mono">Dayanıklı (EN ISO)</strong>
          </div>
          <div>
            <span className="text-[10px] font-mono text-stone-400 block uppercase">Kimyasal Direnç</span>
            <strong className="text-xs font-bold text-stone-800 font-mono">Sınıf GA / GLA</strong>
          </div>
          <div>
            <span className="text-[10px] font-mono text-stone-400 block uppercase">Çevre Standardı</span>
            <strong className="text-xs font-bold text-[#b4823c] font-mono">LEED / EPD Onaylı</strong>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-stone-200/80 text-[11px] text-stone-400 font-mono">
          <span>TÜM TESTLER AKREDİTE LABORATUVARLARDA DOĞRULANMIŞTIR</span>
          <span>SAYFA 05</span>
        </div>
      </div>
    );
  }

  // PAGE 6: MİMARİ UYGULAMA VE KULLANIM ALANLARI SAYFASI (CASE STUDIES)
  if (pageNum === 6) {
    return (
      <div className="h-full flex flex-col justify-between relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200/80 pb-3">
          <span className="text-[11px] font-mono tracking-widest text-[#b4823c] font-bold uppercase">
            05 &bull; MİMARİ UYGULAMA ALANLARI & VAKA ANALİZLERİ
          </span>
          <span className="text-[11px] font-mono tracking-widest text-stone-400">
            PROJE REFERANSLARI
          </span>
        </div>

        {/* Title */}
        <div className="pt-2">
          <h2 className="text-2xl font-serif font-extrabold text-stone-900">
            Mekânda Yaşayan Seramik
          </h2>
          <p className="text-xs text-stone-500 font-light mt-0.5">
            Konut, otel ve ticari alanlarda malzeme uyumu ve aydınlatma senaryoları.
          </p>
        </div>

        {/* 3 Case Study Panels */}
        <div className="my-auto py-3 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Case 1: Lüks Banyo */}
          <div className="rounded-2xl bg-stone-50 border border-stone-200 p-3.5 space-y-2.5">
            <div className="rounded-xl overflow-hidden aspect-[4/3] border border-stone-200">
              <img
                src="/renders/luxury_bathroom_loft_beton.jpg"
                alt="Bathroom Case"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="text-[9px] font-mono uppercase text-[#b4823c] font-bold block">01 &bull; Islak Hacim</span>
              <h4 className="text-sm font-serif font-bold text-stone-900">Mono-Loft Spa Entegrasyonu</h4>
              <p className="text-[11px] text-stone-600 leading-relaxed font-light mt-1">
                Bona Dea Concrete serisi ile oluşturulan derzsiz zemin hissi, gömme armatürler ve antrasit detaylarla çağdaş bir sükunet yaratır.
              </p>
            </div>
          </div>

          {/* Case 2: Yaşam Alanı & Salon */}
          <div className="rounded-2xl bg-stone-50 border border-stone-200 p-3.5 space-y-2.5">
            <div className="rounded-xl overflow-hidden aspect-[4/3] border border-stone-200">
              <img
                src="/renders/modern_living_natural_oak.jpg"
                alt="Living Room Case"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="text-[9px] font-mono uppercase text-[#b4823c] font-bold block">02 &bull; Salon & Teras</span>
              <h4 className="text-sm font-serif font-bold text-stone-900">Doğal Ahşap & Seramik Füzyonu</h4>
              <p className="text-[11px] text-stone-600 leading-relaxed font-light mt-1">
                Yerden ısıtma sistemleriyle %100 uyumlu Sakura serisi, ahşabın sıcaklığını sıfır bakım gereksinimiyle mekanın merkezine taşır.
              </p>
            </div>
          </div>

          {/* Case 3: Ticari Lobi & Showroom */}
          <div className="rounded-2xl bg-stone-50 border border-stone-200 p-3.5 space-y-2.5">
            <div className="rounded-xl overflow-hidden aspect-[4/3] border border-stone-200">
              <img
                src="/images/showroom_hero_flagship.jpg"
                alt="Commercial Case"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="text-[9px] font-mono uppercase text-[#b4823c] font-bold block">03 &bull; Ticari & Lobi</span>
              <h4 className="text-sm font-serif font-bold text-stone-900">Yoğun Sirkülasyon Mukavemeti</h4>
              <p className="text-[11px] text-stone-600 leading-relaxed font-light mt-1">
                PEI V sınıfı yüzey aşınma direnci sayesinde alışveriş merkezleri, havalimanları ve plaza girişlerinde ömür boyu parlaklık.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-stone-200/80 text-[11px] text-stone-400 font-mono">
          <span>TÜM MEKANLAR SERAMİKBAK 3D MOTORUNDA SİMÜLE EDİLEBİLİR</span>
          <span>SAYFA 06</span>
        </div>
      </div>
    );
  }

  // PAGE 7: MARKA İLETİŞİMİ VE ARKA KAPAK (BACK COVER & 3D QR PORTAL)
  if (pageNum === 7) {
    return (
      <div className="h-full flex flex-col justify-between relative z-10 text-center">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200/80 pb-3 text-left">
          <span className="text-[11px] font-mono tracking-widest text-stone-400 font-bold uppercase">
            KURUMSAL ARKA KAPAK
          </span>
          <span className="text-[11px] font-mono tracking-widest text-[#b4823c]">
            {brand.name}
          </span>
        </div>

        {/* Center Back Cover Content */}
        <div className="my-auto py-8 max-w-md mx-auto space-y-6">
          {/* Brand Logo & Name */}
          <div className="space-y-2">
            <div className="w-16 h-16 rounded-3xl bg-stone-900 text-white flex items-center justify-center font-serif text-2xl font-black mx-auto shadow-xl">
              {brand.name.slice(0, 2).toUpperCase()}
            </div>
            <h2 className="text-2xl font-serif font-extrabold text-stone-900">
              {brand.name}
            </h2>
            <p className="text-xs text-stone-500 font-light max-w-xs mx-auto">
              {brand.tagline}
            </p>
          </div>

          {/* Interactive 3D Room QR Code Showcase */}
          <div className="p-5 rounded-3xl bg-stone-50 border border-stone-200 space-y-3 shadow-xs">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#b4823c] font-bold block">
              3D MEKANDA DENE & VİRTUAL STUDIO
            </span>
            <div className="w-32 h-32 bg-white p-2.5 rounded-2xl mx-auto border border-stone-200 shadow-sm flex items-center justify-center">
              {/* QR Code Graphic */}
              <div className="w-full h-full bg-stone-900 rounded-lg p-2 flex flex-col items-center justify-center text-white">
                <QrCode size={64} className="text-amber-400" />
                <span className="text-[8px] font-mono mt-1 text-stone-300">seramikbak.com</span>
              </div>
            </div>
            <p className="text-[11px] text-stone-600 font-light max-w-xs mx-auto">
              Akıllı telefonunuzun kamerası ile QR kodu okutarak bu katalogdaki karoları kendi odanızda anında 3D deneyimleyin.
            </p>
            <Link
              href="/mekan-dene"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#b4823c] hover:underline"
            >
              <span>3D Mekan Motorunu Başlat</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {/* Contact Coordinates */}
          <div className="grid grid-cols-2 gap-3 text-left text-xs text-stone-600 pt-2">
            <div className="p-3 rounded-xl bg-white border border-stone-100">
              <span className="text-[10px] font-mono text-stone-400 uppercase block font-bold">Mimar Masası</span>
              <a href="tel:08508880000" className="font-bold text-stone-900 hover:text-[#b4823c] transition block mt-0.5">
                +90 (850) 888 00 00
              </a>
              <span className="text-[10px] text-stone-400">proje@seramikbak.com</span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-stone-100">
              <span className="text-[10px] font-mono text-stone-400 uppercase block font-bold">Genel Merkez</span>
              <p className="text-stone-900 font-medium text-[11px] mt-0.5 leading-snug">
                Bilecik Fabrika & İstanbul Proje Showroom
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-stone-200/80 text-[11px] text-stone-400 font-mono text-left">
          <span>SERAMİKBAK DİJİTAL YAYIN PLATFORMU &copy; 2026</span>
          <span>SAYFA 07</span>
        </div>
      </div>
    );
  }

  return null;
}
