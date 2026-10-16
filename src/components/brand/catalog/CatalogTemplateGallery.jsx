'use client';

import React, { useState, useMemo } from 'react';
import {
  Heart,
  MoreHorizontal,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Plus,
  Check,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Clock,
  Compass,
  FileText,
  Layers,
  Sparkles,
  Eye,
  X
} from 'lucide-react';
import CatalogTemplateRenderer from './templates/CatalogTemplateRenderer';
import { getTemplateConfig } from './templates/registry';

// 24 Full Catalog Templates dataset matching the user's interface
export const CATALOG_TEMPLATES_DATA = [
  {
    id: 'modern-mimari',
    templateId: 'premium-mimari',
    name: 'Modern Mimari Katalog',
    type: 'Klasik Katalog',
    style: 'Modern',
    styleBadgeClass: 'bg-sky-50 text-sky-800 border-sky-100',
    pageCount: 24,
    colorCode: '#2b4c7e',
    colorGroup: 'blue',
    coverImg: '/renders/modern_living_natural_oak.jpg',
    description: 'Büyük format porselen karolar ve çağdaş mimari projeler için çift sayfa monograf mizanpajı.'
  },
  {
    id: 'banyo-koleksiyonu',
    templateId: 'banyo-mutfak',
    name: 'Banyo Koleksiyonu Lookbook',
    type: 'Lookbook',
    style: 'Minimal',
    styleBadgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-100',
    pageCount: 16,
    colorCode: '#111827',
    colorGroup: 'black',
    coverImg: '/renders/luxury_bathroom_calacatta_gold.jpg',
    description: 'Islak hacimler, duş nişleri ve tezgah arası karolar için ferah editoryal yaşam alanı kurgusu.'
  },
  {
    id: 'mermer-koleksiyonu',
    templateId: 'dogal-tas-mermer',
    name: 'Mermer Koleksiyonu Katalog',
    type: 'Klasik Katalog',
    style: 'Premium',
    styleBadgeClass: 'bg-amber-50 text-amber-800 border-amber-100',
    pageCount: 32,
    colorCode: '#d4a373',
    colorGroup: 'sand',
    coverImg: '/renders/luxury_bathroom_albatros_antrasit.jpg',
    description: 'İtalyan Carrara ve Verona taş ocakları ihtişamında bookmatch damar takipli lüks katalog.'
  },
  {
    id: 'yuzey-ve-doku',
    templateId: 'material-texture',
    name: 'Yüzey & Doku Monografı',
    type: 'Monograf',
    style: 'Premium',
    styleBadgeClass: 'bg-amber-50 text-amber-900 border-amber-200',
    pageCount: 16,
    colorCode: '#d4af37',
    colorGroup: 'sand',
    coverImg: '/renders/luxury_bathroom_calacatta_gold.jpg',
    description: '10x makro yüzey dokuları, ışık yansıma indeksi (GU) ve mikro rölyef seramik monografı.'
  },
  {
    id: 'teknik-katalog',
    templateId: 'teknik-urun',
    name: 'Teknik Katalog',
    type: 'Teknik Katalog',
    style: 'Teknik',
    styleBadgeClass: 'bg-teal-50 text-teal-800 border-teal-100',
    pageCount: 40,
    colorCode: '#2d4a3e',
    colorGroup: 'green',
    coverImg: '/renders/luxury_bathroom_loft_beton.jpg',
    description: 'TS EN 14411 standartları, CAD katmanlaşma kesitleri ve ihaleler için teknik şartname föyü.'
  },
  {
    id: 'dogal-tas-gorunumlu',
    templateId: 'verona',
    name: 'Doğal Taş Görünümlü Katalog',
    type: 'Lookbook',
    style: 'Doğal',
    styleBadgeClass: 'bg-stone-100 text-stone-800 border-stone-200',
    pageCount: 20,
    colorCode: '#d4a373',
    colorGroup: 'sand',
    coverImg: '/textures/travertino_classico.jpg',
    description: 'Rustik traverten ve doğal kalker dokularını modern villalar ve açık alanlara taşıyan lookbook.'
  },
  {
    id: 'mutfak-banyo',
    templateId: 'banyo-mutfak',
    name: 'Mutfak & Banyo Kataloğu',
    type: 'Klasik Katalog',
    style: 'Modern',
    styleBadgeClass: 'bg-sky-50 text-sky-800 border-sky-100',
    pageCount: 28,
    colorCode: '#6b7280',
    colorGroup: 'grey',
    coverImg: '/renders/luxury_bathroom_natural_oak.jpg',
    description: 'Mutfak adaları, zemin-duvar kombinasyonları ve leke tutmayan seramik yüzeyler rehberi.'
  },
  {
    id: 'renk-koleksiyonu',
    templateId: 'renk-ebat-rehberi',
    name: 'Renk Koleksiyonu Katalog',
    type: 'Dijital Broşür',
    style: 'Minimal',
    styleBadgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-100',
    pageCount: 12,
    colorCode: '#6b7280',
    colorGroup: 'grey',
    coverImg: '/renders/luxury_bathroom_albatros_antrasit.jpg',
    description: 'RAL ve Pantone kodlarıyla uyumlu zengin renk kartelası ve modüler ebat yerleşim alternatifleri.'
  },
  {
    id: 'proje-sunumu',
    templateId: 'mimar-sunum',
    name: 'Proje Sunumu Kataloğu',
    type: 'Lookbook',
    style: 'Premium',
    styleBadgeClass: 'bg-amber-50 text-amber-800 border-amber-100',
    pageCount: 36,
    colorCode: '#111827',
    colorGroup: 'black',
    coverImg: '/renders/modern_living_natural_oak.jpg',
    description: 'Yatırımcı ve mimari yarışma sunumları için geniş pafta mizanpajı ve moodboard eşleştirmeleri.'
  },
  {
    id: 'showroom-perakende',
    templateId: 'fuar-bayi',
    name: 'Showroom & Perakende Rehberi',
    type: 'Klasik Katalog',
    style: 'Klasik',
    styleBadgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-100',
    pageCount: 24,
    colorCode: '#d4a373',
    colorGroup: 'sand',
    coverImg: '/renders/luxury_bathroom_calacatta_gold.jpg',
    description: 'Mağaza içi teşhir standları, raf kodları ve perakende müşteri seçkisi için vitrin kataloğu.'
  },
  {
    id: 'global-ihracat',
    templateId: 'modern-ihracat',
    name: 'Global İhracat & Konteyner Kataloğu',
    type: 'Teknik Katalog',
    style: 'Premium',
    styleBadgeClass: 'bg-amber-50 text-amber-800 border-amber-100',
    pageCount: 44,
    colorCode: '#2b4c7e',
    colorGroup: 'blue',
    coverImg: '/images/global_export_trade.jpg',
    description: 'Uluslararası B2B ticaret, 20/40ft konteyner yükleme geometrisi ve Euro-palet lojistik föyü.'
  },
  {
    id: 'endustriyel-zemin',
    templateId: 'endustriyel-ticari',
    name: 'Endüstriyel & Zemin Serisi',
    type: 'Teknik Katalog',
    style: 'Endüstriyel',
    styleBadgeClass: 'bg-slate-100 text-slate-800 border-slate-200',
    pageCount: 32,
    colorCode: '#6b7280',
    colorGroup: 'grey',
    coverImg: '/renders/luxury_bathroom_loft_beton.jpg',
    description: 'AVM, havalimanı ve metro istasyonları için R10-R12 kaymazlık ve ağır yaya trafiği serisi.'
  },
  {
    id: 'minimalist-japandi',
    templateId: 'minimal-koleksiyon',
    name: 'Minimalist Japandi Monograf',
    type: 'Lookbook',
    style: 'Minimal',
    styleBadgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-100',
    pageCount: 18,
    colorCode: '#d1d5db',
    colorGroup: 'beige',
    coverImg: '/renders/luxury_bathroom_calacatta_gold.jpg',
    description: 'Negatif boşluk dengesi, sakin tipografi ve zamansız estetik sunan minimalist porselen lookbook.'
  },
  {
    id: 'artisan-butik',
    templateId: 'dijital-brosur',
    name: 'Artisan & Butik Seramik Broşürü',
    type: 'Dijital Broşür',
    style: 'Doğal',
    styleBadgeClass: 'bg-stone-100 text-stone-800 border-stone-200',
    pageCount: 8,
    colorCode: '#d4a373',
    colorGroup: 'sand',
    coverImg: '/renders/modern_living_natural_oak.jpg',
    description: 'El yapımı seramik zarafeti, terracotta tonları ve butik mekanlar için kompakt broşür.'
  },
  {
    id: 'yeni-sezon-lansman',
    templateId: 'yeni-lansman',
    name: 'Yeni Sezon Lansman Lookbook',
    type: 'Lookbook',
    style: 'Modern',
    styleBadgeClass: 'bg-sky-50 text-sky-800 border-sky-100',
    pageCount: 24,
    colorCode: '#d4a373',
    colorGroup: 'sand',
    coverImg: '/renders/luxury_bathroom_albatros_antrasit.jpg',
    description: 'Yılın trend renkleri, yüzey dokuları ve yeni çıkan koleksiyonların etkileyici lansman sunumu.'
  },
  {
    id: 'luks-otel-lobby',
    templateId: 'spec-sheet',
    name: 'Lüks Otel & Lobby Şartnamesi',
    type: 'Teknik Katalog',
    style: 'Premium',
    styleBadgeClass: 'bg-amber-50 text-amber-800 border-amber-100',
    pageCount: 36,
    colorCode: '#111827',
    colorGroup: 'black',
    coverImg: '/images/global_architect_bim.jpg',
    description: '5 yıldızlı otel projeleri, resepsiyon ve balo salonları için mimari şartname dosyası.'
  },
  {
    id: 'monolitik-dis-cephe',
    templateId: 'outdoor',
    name: 'Monolitik Dış Cephe & Havuz Serisi',
    type: 'Teknik Katalog',
    style: 'Endüstriyel',
    styleBadgeClass: 'bg-slate-100 text-slate-800 border-slate-200',
    pageCount: 28,
    colorCode: '#2b4c7e',
    colorGroup: 'blue',
    coverImg: '/renders/luxury_bathroom_loft_beton.jpg',
    description: 'Havuz kenarı 20mm kalın porselenler ve mekanik klipsli havalandırmalı cephe sistemleri.'
  },
  {
    id: 'dekofon-rolyef',
    templateId: 'deco',
    name: 'Dekofon & Rölyef Duvar Kataloğu',
    type: 'Lookbook',
    style: 'Klasik',
    styleBadgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-100',
    pageCount: 16,
    colorCode: '#d1d5db',
    colorGroup: 'beige',
    coverImg: '/renders/luxury_bathroom_calacatta_gold.jpg',
    description: '3D kabartmalı duvar karoları ve uyumlu düz zemin karolarının monokrom ritmi.'
  },
  {
    id: 'nordic-ahsap',
    templateId: 'nordic-minimal',
    name: 'Nordic Ahşap Görünümlü Seramikler',
    type: 'Klasik Katalog',
    style: 'Doğal',
    styleBadgeClass: 'bg-stone-100 text-stone-800 border-stone-200',
    pageCount: 20,
    colorCode: '#d4a373',
    colorGroup: 'sand',
    coverImg: '/renders/luxury_bathroom_natural_oak.jpg',
    description: 'İskandinav meşe ve ceviz damarlarının sıcaklığını porselen dayanıklılığı ile buluşturan seri.'
  },
  {
    id: 'buyuk-ebat-plaka',
    templateId: 'premium-mimari',
    name: 'Büyük Ebat 120x280 Plaka Kataloğu',
    type: 'Lookbook',
    style: 'Modern',
    styleBadgeClass: 'bg-sky-50 text-sky-800 border-sky-100',
    pageCount: 32,
    colorCode: '#111827',
    colorGroup: 'black',
    coverImg: '/renders/modern_living_natural_oak.jpg',
    description: 'Derzsiz zemin hissi ve monolitik duvar kaplamaları için 120x280 dev plaka monografı.'
  },
  {
    id: 'metro-karo-mozaik',
    templateId: 'renk-ebat-rehberi',
    name: 'Metro Karo & Mozaik Broşürü',
    type: 'Dijital Broşür',
    style: 'Minimal',
    styleBadgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-100',
    pageCount: 10,
    colorCode: '#6b7280',
    colorGroup: 'grey',
    coverImg: '/renders/luxury_bathroom_albatros_antrasit.jpg',
    description: '10x30 metro tuğla ve heksagonal mozaiklerin mutfak ve kafeler için tasarım föyü.'
  },
  {
    id: 'dogal-traverten',
    templateId: 'dogal-tas-mermer',
    name: 'Doğal Traverten & Rustik Taş',
    type: 'Klasik Katalog',
    style: 'Doğal',
    styleBadgeClass: 'bg-stone-100 text-stone-800 border-stone-200',
    pageCount: 24,
    colorCode: '#d4a373',
    colorGroup: 'sand',
    coverImg: '/textures/travertino_classico.jpg',
    description: 'Gözenekli traverten ve doğal taş esintili honlu porselen koleksiyonu.'
  },
  {
    id: 'hizli-siparis-bayi',
    templateId: 'fuar-bayi',
    name: 'Hızlı Sipariş & Bayi Fiyat Föyü',
    type: 'Dijital Broşür',
    style: 'Klasik',
    styleBadgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-100',
    pageCount: 12,
    colorCode: '#2b4c7e',
    colorGroup: 'blue',
    coverImg: '/renders/luxury_bathroom_calacatta_gold.jpg',
    description: 'Bayi satış noktaları ve toptan alıcılar için ebat, paket ve sipariş kodları matrisi.'
  },
  {
    id: 'akdeniz-terracotta',
    templateId: 'artisan',
    name: 'Akdeniz Terracotta Koleksiyonu',
    type: 'Lookbook',
    style: 'Doğal',
    styleBadgeClass: 'bg-stone-100 text-stone-800 border-stone-200',
    pageCount: 22,
    colorCode: '#d4a373',
    colorGroup: 'sand',
    coverImg: '/renders/modern_living_natural_oak.jpg',
    description: 'Sıcak pişmiş toprak tonları ve el işçiliği seramik dokularıyla Akdeniz mimarisi.'
  },
  {
    id: 'bim-leed-sartname',
    templateId: 'teknik-urun',
    name: 'BIM & LEED Mimari Şartname Dosyası',
    type: 'Teknik Katalog',
    style: 'Endüstriyel',
    styleBadgeClass: 'bg-slate-100 text-slate-800 border-slate-200',
    pageCount: 48,
    colorCode: '#2d4a3e',
    colorGroup: 'green',
    coverImg: '/renders/luxury_bathroom_loft_beton.jpg',
    description: 'Yeşil bina sertifikalı projeler için EPD ve LEED v4 uyumlu teknik şartname portföyü.'
  }
];

export const COLOR_PALETTE_SWATCHES = [
  { id: 'black', hex: '#111827', label: 'Siyah' },
  { id: 'grey', hex: '#6b7280', label: 'Gri' },
  { id: 'beige', hex: '#d1d5db', label: 'Bej' },
  { id: 'green', hex: '#2d4a3e', label: 'Yeşil' },
  { id: 'blue', hex: '#2b4c7e', label: 'Mavi' },
  { id: 'dust-blue', hex: '#8ea4b8', label: 'Açık Mavi' },
  { id: 'sand', hex: '#d4a373', label: 'Terracotta' },
  { id: 'sage', hex: '#9ca57a', label: 'Zeytin' }
];

export default function CatalogTemplateGallery({
  onSelectTemplate,
  onCreateCustom,
  availableProducts = [],
  brandInfo = {},
  selectedTemplateId = null,
  onBackToList = null
}) {
  // Filters State
  // Default to showing all 24 templates immediately; users can narrow down by style or type
  const [selectedType, setSelectedType] = useState('all'); // 'all' | 'Klasik Katalog' | 'Lookbook' | 'Teknik Katalog' | 'Dijital Broşür'
  const [selectedStyles, setSelectedStyles] = useState([]);
  const [selectedPageRanges, setSelectedPageRanges] = useState([]);
  const [selectedColor, setSelectedColor] = useState(null);

  // Accordion Collapse State (all default open)
  const [typeOpen, setTypeOpen] = useState(true);
  const [styleOpen, setStyleOpen] = useState(true);
  const [pageOpen, setPageOpen] = useState(true);
  const [colorOpen, setColorOpen] = useState(true);

  // Favorites & Menu
  const [favorites, setFavorites] = useState({});
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Live Template Preview Walkthrough Modal
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [previewPageIndex, setPreviewPageIndex] = useState(0);

  // Toggle Favorite Heart
  const toggleFavorite = (id) => {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Toggle Style in multiselect checkboxes
  const toggleStyle = (styleName) => {
    setSelectedStyles((prev) =>
      prev.includes(styleName) ? prev.filter((s) => s !== styleName) : [...prev, styleName]
    );
  };

  // Toggle Page Range
  const togglePageRange = (rangeKey) => {
    setSelectedPageRanges((prev) =>
      prev.includes(rangeKey) ? prev.filter((r) => r !== rangeKey) : [...prev, rangeKey]
    );
  };

  // Reset All Filters
  const handleResetFilters = () => {
    setSelectedType('all');
    setSelectedStyles([]);
    setSelectedPageRanges([]);
    setSelectedColor(null);
  };

  // Filtering Logic
  const filteredTemplates = useMemo(() => {
    return CATALOG_TEMPLATES_DATA.filter((item) => {
      // Type Filter
      if (selectedType !== 'all' && item.type !== selectedType) {
        return false;
      }

      // Style Filter (if any styles selected)
      if (selectedStyles.length > 0) {
        if (!selectedStyles.includes(item.style)) {
          return false;
        }
      }

      // Page Count Filter
      if (selectedPageRanges.length > 0) {
        const matchesRange = selectedPageRanges.some((range) => {
          if (range === '1-10') return item.pageCount <= 10;
          if (range === '11-20') return item.pageCount >= 11 && item.pageCount <= 20;
          if (range === '21-40') return item.pageCount >= 21 && item.pageCount <= 40;
          if (range === '41+') return item.pageCount >= 41;
          return true;
        });
        if (!matchesRange) return false;
      }

      // Color Swatch Filter
      if (selectedColor && item.colorGroup !== selectedColor) {
        return false;
      }

      return true;
    });
  }, [selectedType, selectedStyles, selectedPageRanges, selectedColor]);

  // Featured Hero Template (Default: Premium Koleksiyon Kataloğu)
  const featuredTemplate = CATALOG_TEMPLATES_DATA[0];

  return (
    <div className="w-full space-y-6 pb-20 select-none">
      {/* 1. TOP HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          {onBackToList && (
            <button
              type="button"
              onClick={onBackToList}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition mb-1.5 cursor-pointer group"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
              <span>← Kataloglarıma Dön</span>
            </button>
          )}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Katalog Şablonları
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Profesyonel ve modern katalog şablonlarıyla markanıza özel dijital kataloglar oluşturun.
            <br className="hidden sm:inline" />
            İhtiyacınıza uygun şablonu seçin, ürünlerinizi ekleyin ve kısa sürede yayına alın.
          </p>
        </div>

        <div className="flex items-center gap-4 flex-shrink-0">
          <span className="text-xs sm:text-sm font-medium text-slate-500 font-sans">
            Toplam {filteredTemplates.length} şablon
          </span>

          <button
            type="button"
            onClick={onCreateCustom}
            className="px-4 sm:px-5 py-2.5 rounded-xl bg-[#e07a2c] hover:bg-[#cf6d22] text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm hover:shadow transition-all cursor-pointer"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Kendi Şablonunu Oluştur</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN 2-COLUMN LAYOUT: SIDEBAR (FILTERS) + RIGHT (HERO & CARDS) */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* LEFT SIDEBAR: FILTERS */}
        <aside className="w-full lg:w-60 xl:w-64 flex-shrink-0 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">Filtreler</h3>
          </div>

          {/* 1. Katalog Türü */}
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={() => setTypeOpen(!typeOpen)}
              className="w-full flex items-center justify-between text-xs font-bold text-slate-800 hover:text-slate-950 transition cursor-pointer"
            >
              <span>Katalog Türü</span>
              <ChevronDown
                size={14}
                className={`text-slate-400 transition-transform ${typeOpen ? '' : '-rotate-90'}`}
              />
            </button>

            {typeOpen && (
              <div className="space-y-2 pt-1 text-xs text-slate-600">
                {[
                  { id: 'all', label: 'Tüm Şablonlar' },
                  { id: 'Klasik Katalog', label: 'Klasik Katalog' },
                  { id: 'Lookbook', label: 'Lookbook' },
                  { id: 'Teknik Katalog', label: 'Teknik Katalog' },
                  { id: 'Dijital Broşür', label: 'Dijital Broşür' }
                ].map((item) => (
                  <label
                    key={item.id}
                    onClick={() => setSelectedType(item.id)}
                    className="flex items-center gap-2.5 cursor-pointer hover:text-slate-900 select-none"
                  >
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                        selectedType === item.id
                          ? 'border-[#e07a2c] bg-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {selectedType === item.id && (
                        <div className="w-2 h-2 rounded-full bg-[#e07a2c]" />
                      )}
                    </div>
                    <span className={selectedType === item.id ? 'font-semibold text-slate-900' : ''}>
                      {item.label}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* 2. Tasarım Stili */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStyleOpen(!styleOpen)}
              className="w-full flex items-center justify-between text-xs font-bold text-slate-800 hover:text-slate-950 transition cursor-pointer"
            >
              <span>Tasarım Stili</span>
              <ChevronDown
                size={14}
                className={`text-slate-400 transition-transform ${styleOpen ? '' : '-rotate-90'}`}
              />
            </button>

            {styleOpen && (
              <div className="space-y-2 pt-1 text-xs text-slate-600">
                {['Modern', 'Minimal', 'Premium', 'Doğal', 'Endüstriyel', 'Klasik'].map((st) => {
                  const isChecked = selectedStyles.includes(st);
                  return (
                    <label
                      key={st}
                      onClick={() => toggleStyle(st)}
                      className="flex items-center gap-2.5 cursor-pointer hover:text-slate-900 select-none"
                    >
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                          isChecked
                            ? 'bg-[#e07a2c] border-[#e07a2c] text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isChecked && <Check size={11} strokeWidth={3} />}
                      </div>
                      <span className={isChecked ? 'font-semibold text-slate-900' : ''}>
                        {st}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3. Sayfa Sayısı */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setPageOpen(!pageOpen)}
              className="w-full flex items-center justify-between text-xs font-bold text-slate-800 hover:text-slate-950 transition cursor-pointer"
            >
              <span>Sayfa Sayısı</span>
              <ChevronDown
                size={14}
                className={`text-slate-400 transition-transform ${pageOpen ? '' : '-rotate-90'}`}
              />
            </button>

            {pageOpen && (
              <div className="space-y-2 pt-1 text-xs text-slate-600">
                {[
                  { key: '1-10', label: '1 - 10 sayfa' },
                  { key: '11-20', label: '11 - 20 sayfa' },
                  { key: '21-40', label: '21 - 40 sayfa' },
                  { key: '41+', label: '41+ sayfa' }
                ].map((range) => {
                  const isChecked = selectedPageRanges.includes(range.key);
                  return (
                    <label
                      key={range.key}
                      onClick={() => togglePageRange(range.key)}
                      className="flex items-center gap-2.5 cursor-pointer hover:text-slate-900 select-none"
                    >
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                          isChecked
                            ? 'bg-[#e07a2c] border-[#e07a2c] text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isChecked && <Check size={11} strokeWidth={3} />}
                      </div>
                      <span className={isChecked ? 'font-semibold text-slate-900' : ''}>
                        {range.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* 4. Renk Paleti */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setColorOpen(!colorOpen)}
              className="w-full flex items-center justify-between text-xs font-bold text-slate-800 hover:text-slate-950 transition cursor-pointer"
            >
              <span>Renk Paleti</span>
              <ChevronDown
                size={14}
                className={`text-slate-400 transition-transform ${colorOpen ? '' : '-rotate-90'}`}
              />
            </button>

            {colorOpen && (
              <div className="grid grid-cols-4 gap-2 pt-1.5">
                {COLOR_PALETTE_SWATCHES.map((swatch) => {
                  const isSelected = selectedColor === swatch.id;
                  return (
                    <button
                      key={swatch.id}
                      type="button"
                      onClick={() => setSelectedColor(isSelected ? null : swatch.id)}
                      title={swatch.label}
                      className={`w-7 h-7 rounded-full transition-all relative flex items-center justify-center ${
                        isSelected
                          ? 'ring-2 ring-offset-2 ring-[#e07a2c] scale-110'
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: swatch.hex }}
                    >
                      {isSelected && (
                        <Check
                          size={12}
                          className={swatch.id === 'beige' ? 'text-neutral-900' : 'text-white'}
                          strokeWidth={2.5}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Reset Filters */}
          <div className="pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleResetFilters}
              className="w-full py-2 flex items-center justify-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition cursor-pointer"
            >
              <RotateCcw size={13} />
              <span>Filtreleri Temizle</span>
            </button>
          </div>
        </aside>

        {/* RIGHT CONTENT AREA: HERO BANNER & 4-COLUMN CARDS GRID */}
        <div className="flex-1 min-w-0 space-y-6 w-full">
          {/* FEATURED HERO BANNER ("Öne Çıkan") */}
          <div className="relative rounded-2xl overflow-hidden p-6 sm:p-8 text-white shadow-md border border-emerald-950/40 bg-gradient-to-r from-[#0d1614] via-[#132620] to-[#0a1210]">
            {/* Subtle Green & Gold Marble Veining Overlay */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay"
              style={{
                backgroundImage: 'radial-gradient(ellipse at 30% 40%, rgba(212, 163, 115, 0.3) 0%, transparent 60%)'
              }}
            />

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
              {/* Left Column: Headline & Action */}
              <div className="space-y-3 max-w-lg">
                <span className="inline-block bg-[#e07a2c] text-white text-[11px] font-bold px-3 py-0.5 rounded-full shadow-xs">
                  Öne Çıkan
                </span>

                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                  Premium Koleksiyon Kataloğu
                </h2>

                <p className="text-xs sm:text-sm text-neutral-300 font-light leading-relaxed">
                  Modern mimariler için özel olarak tasarlanmış, minimal ve etkileyici premium katalog şablonu.
                </p>

                {/* Meta Attributes Row */}
                <div className="flex items-center gap-4 text-xs font-medium text-neutral-300 pt-1">
                  <span className="flex items-center gap-1.5">
                    <BookOpen size={13} className="text-amber-400" />
                    <span>24 sayfa</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Compass size={13} className="text-amber-400" />
                    <span>Minimal</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={13} className="text-amber-400" />
                    <span>Modern</span>
                  </span>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => onSelectTemplate(featuredTemplate.templateId)}
                    className="bg-white hover:bg-neutral-100 text-neutral-900 font-bold px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2 text-xs transition-all cursor-pointer"
                  >
                    <span>Bu Şablonu Kullan</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>

              {/* Right Column: 3D Open Catalog Spread Mockup */}
              <div className="relative w-full max-w-[340px] sm:max-w-[420px] aspect-[16/10] flex items-center justify-center">
                {/* 3D Catalog Spread Box */}
                <div className="w-full h-full flex rounded-lg overflow-hidden shadow-2xl border border-white/10 bg-neutral-900">
                  {/* Left Page: Dark Cover ("TERRACOTTA COLLECTION 2026") */}
                  <div className="w-1/2 p-4 bg-[#1a1c1a] border-r border-black/40 flex flex-col justify-between text-neutral-300 relative">
                    <div className="text-[8px] font-mono tracking-widest uppercase text-amber-400/80">
                      SERAMİKBAK &bull; 2026
                    </div>

                    <div className="my-auto space-y-1">
                      <h4 className="text-sm sm:text-base font-serif font-bold text-white tracking-wider leading-tight">
                        TERRACOTTA<br />COLLECTION
                      </h4>
                      <p className="text-[8px] font-mono text-neutral-400">2026</p>
                    </div>

                    <div className="text-[7px] font-mono text-neutral-500">
                      ARCHITECTURAL CATALOG
                    </div>
                  </div>

                  {/* Right Page: Open Living Room Interior Spread */}
                  <div className="w-1/2 relative overflow-hidden bg-neutral-950">
                    <img
                      src="/renders/modern_living_natural_oak.jpg"
                      alt="Terracotta Living Space"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/50 to-transparent pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4-COLUMN CATALOG CARDS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {filteredTemplates.map((item) => {
              const isFav = favorites[item.id];
              const isMenuOpen = activeMenuId === item.id;
              const isSelected = selectedTemplateId && (
                item.templateId === selectedTemplateId ||
                item.id === selectedTemplateId ||
                (selectedTemplateId === 'milano' && item.templateId === 'premium-mimari')
              );

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl border transition-all flex flex-col justify-between group overflow-hidden ${
                    isSelected
                      ? 'border-[#e07a2c] ring-2 ring-[#e07a2c]/20 shadow-md bg-orange-50/10'
                      : 'border-slate-200/90 shadow-xs hover:shadow-md hover:border-slate-300'
                  }`}
                >
                  {/* Card Thumbnail Stage with Top-Right Heart Icon & Selected Badge */}
                  <div className="relative aspect-[4/3] bg-neutral-100 overflow-hidden cursor-pointer">
                    <img
                      src={item.coverImg}
                      alt={item.name}
                      onClick={() => setPreviewTemplate(item)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Active Selection Badge */}
                    {isSelected && (
                      <span className="absolute top-2.5 left-2.5 bg-[#e07a2c] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-md shadow-sm flex items-center gap-1 z-10">
                        <Check size={11} strokeWidth={3} />
                        <span>Seçili</span>
                      </span>
                    )}

                    {/* Heart Favorite Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(item.id);
                      }}
                      className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/85 hover:bg-white text-slate-400 hover:text-rose-500 shadow-xs flex items-center justify-center transition cursor-pointer z-10"
                    >
                      <Heart
                        size={14}
                        className={isFav ? 'fill-rose-500 text-rose-500' : ''}
                      />
                    </button>
                  </div>

                  {/* Card Info & Badges */}
                  <div className="p-3.5 space-y-2">
                    <h3
                      onClick={() => setPreviewTemplate(item)}
                      className="text-xs sm:text-sm font-bold text-slate-900 truncate hover:text-[#e07a2c] transition-colors cursor-pointer"
                      title={item.name}
                    >
                      {item.name}
                    </h3>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Style Pill */}
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
                          item.styleBadgeClass || 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {item.style}
                      </span>

                      {/* Page Count Pill */}
                      <span className="text-[10px] font-mono text-slate-500 px-2 py-0.5 rounded-md bg-slate-100">
                        {item.pageCount} sayfa
                      </span>
                    </div>

                    {/* Action Row: Seç Button, Önizle Button & Three Dots */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between relative">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onSelectTemplate(item.templateId)}
                          className={`text-xs font-semibold px-3 py-1 rounded-lg border transition cursor-pointer flex items-center gap-1 ${
                            isSelected
                              ? 'bg-[#e07a2c] text-white border-[#e07a2c] shadow-xs'
                              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          {isSelected && <Check size={11} strokeWidth={2.5} />}
                          <span>{isSelected ? 'Seçili' : 'Seç'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPreviewTemplate(item)}
                          className="text-xs font-medium px-2 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition flex items-center gap-1 cursor-pointer"
                          title="Şablonu Canlı Önizle"
                        >
                          <Eye size={12} />
                          <span>Önizle</span>
                        </button>
                      </div>

                      {/* Three Dots Button & Dropdown */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setActiveMenuId(isMenuOpen ? null : item.id)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                        >
                          <MoreHorizontal size={16} />
                        </button>

                        {isMenuOpen && (
                          <div className="absolute right-0 bottom-full mb-1 w-36 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-30 text-xs text-slate-700 font-medium">
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                setPreviewTemplate(item);
                              }}
                              className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2"
                            >
                              <Eye size={12} className="text-slate-500" />
                              <span>Önizle</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                onSelectTemplate(item.templateId);
                              }}
                              className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-[#e07a2c] font-bold"
                            >
                              <Check size={12} />
                              <span>Şablonu Seç</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty Search Result Fallback */}
          {filteredTemplates.length === 0 && (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/80 space-y-3">
              <p className="text-sm font-bold text-slate-800">
                Seçilen filtrelere uygun şablon bulunamadı.
              </p>
              <p className="text-xs text-slate-500">
                Filtreleri temizleyerek tüm şablonları görüntüleyebilirsiniz.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Tüm Şablonları Göster
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. LIVE TEMPLATE PREVIEW WALKTHROUGH MODAL */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-neutral-950 border border-white/20 rounded-2xl max-w-5xl w-full h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Top Bar */}
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded bg-[#e07a2c] text-white text-[10px] font-bold uppercase">
                  {previewTemplate.style}
                </span>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <span>{previewTemplate.name}</span>
                    <span className="text-xs font-normal text-neutral-400">
                      ({previewTemplate.pageCount} sayfa &bull; {previewTemplate.type})
                    </span>
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5 line-clamp-1">
                    {previewTemplate.description}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPreviewTemplate(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Live Viewport */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex justify-center bg-neutral-900">
              <div className="w-full max-w-4xl">
                <CatalogTemplateRenderer
                  catalog={{
                    title: previewTemplate.name,
                    subtitle: previewTemplate.description,
                    template: previewTemplate.templateId,
                    orientation: 'portrait',
                    showCover: true,
                    showTOC: true,
                    showSpecs: true,
                    showContactPage: true,
                    brand: brandInfo || { name: 'SeramikBak' }
                  }}
                  products={availableProducts.length > 0 ? availableProducts.slice(0, 4) : [
                    {
                      id: 'preview-1',
                      name: 'Amazonit Verde',
                      width: 120,
                      height: 280,
                      finish: 'Parlak Lappato',
                      color: 'Zümrüt Yeşili',
                      imageUrl: '/renders/modern_living_natural_oak.jpg'
                    },
                    {
                      id: 'preview-2',
                      name: 'Calacatta Gold',
                      width: 120,
                      height: 280,
                      finish: 'Parlak',
                      color: 'Beyaz / Altın',
                      imageUrl: '/renders/luxury_bathroom_calacatta_gold.jpg'
                    }
                  ]}
                  mode="preview"
                  initialPage={previewPageIndex}
                />
              </div>
            </div>

            {/* Modal Bottom Bar */}
            <div className="px-5 py-3.5 border-t border-white/10 bg-neutral-900/90 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs font-mono text-neutral-400">
                <span>Sayfalar arasında klavye ok tuşları ile geçiş yapabilirsiniz.</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewTemplate(null)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-neutral-300 transition"
                >
                  Kapat
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const tpl = previewTemplate.templateId;
                    setPreviewTemplate(null);
                    onSelectTemplate(tpl);
                  }}
                  className="px-5 py-2 rounded-xl bg-[#e07a2c] hover:bg-[#cf6d22] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition cursor-pointer"
                >
                  <span>Bu Şablonla Başla</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
