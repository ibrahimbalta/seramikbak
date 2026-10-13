'use client';

import React, { useState, useMemo } from 'react';
import {
  Sliders,
  Sparkles,
  Edit3,
  Layers,
  Table,
  Barcode,
  FileText,
  QrCode,
  DollarSign,
  PhoneCall,
  Check,
  Eye,
  Type,
  Layout,
  Palette,
  Image as ImageIcon,
  CheckCircle2,
  RefreshCw,
  Wand2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  HelpCircle,
  Maximize2
} from 'lucide-react';

const COVER_BG_PRESETS = [
  { name: 'Koyu Mimari Slate', url: '/renders/modern_living_natural_oak.jpg' },
  { name: 'Lüks Calacatta Altın', url: '/renders/luxury_bathroom_calacatta_gold.jpg' },
  { name: 'Loft Beton & Mimari', url: '/renders/luxury_bathroom_loft_beton.jpg' },
  { name: 'Albatros Antrasit Plaka', url: '/renders/luxury_bathroom_albatros_antrasit.jpg' },
  { name: 'Doğal Meşe & Minimal', url: '/renders/luxury_bathroom_natural_oak.jpg' }
];

const BADGE_PRESETS = [
  'YENİ KOLEKSİYON',
  'BOOKMATCH A/B',
  'DEV PLAKA 120×280',
  '160×320 SLAB',
  'R10 A+B KAYMAZ',
  'FULL LAPPATO',
  'EXCLUSIVE',
  'REC/M REKTİFİYE'
];

export default function CatalogVisibilityGraphicEditor({
  formData,
  setFormData,
  availableProducts = [],
  brandInfo = {},
  onOpenCanvasStudio
}) {
  const [activeSectionId, setActiveSectionId] = useState('cover'); // 'cover' | 'toc' | 'specs' | 'codes' | 'descriptions' | 'qr' | 'prices' | 'contact'
  const [activeProductEditIndex, setActiveProductEditIndex] = useState(0);

  // Sections definition matching Step 5 checkboxes
  const SECTIONS = [
    {
      id: 'cover',
      key: 'showCover',
      title: 'Kapak Sayfası',
      desc: 'Marka logolu ve görselli ana katalog kapağı',
      icon: Layers,
      badge: formData.coverTitle || 'Başlık Tanımlı'
    },
    {
      id: 'toc',
      key: 'showTOC',
      title: 'İçindekiler & Konsept Dizini',
      desc: 'Koleksiyon fihristi ve sayfa numaraları',
      icon: FileText,
      badge: 'Fihrist & Önsöz'
    },
    {
      id: 'specs',
      key: 'showSpecs',
      title: 'Teknik Özellikler Tablosu',
      desc: 'Veritabanında mevcut olan ebat, yüzey ve kalınlık verileri',
      icon: Table,
      badge: 'Matris & Standartlar'
    },
    {
      id: 'codes',
      key: 'showCodes',
      title: 'Ürün ve Stok Kodları',
      desc: 'Her seramiğin resmi ürün ve üretim kodunu göster',
      icon: Barcode,
      badge: 'SKU & Kodlama'
    },
    {
      id: 'descriptions',
      key: 'showDescriptions',
      title: 'Koleksiyon Açıklamaları',
      desc: 'Ürün hikayesi, rozetler ve kullanım alanı notları',
      icon: Edit3,
      badge: 'Tipografi & Hikaye'
    },
    {
      id: 'qr',
      key: 'showQrCodes',
      title: 'QR Kod & Mekânımda Gör',
      desc: 'Gerçek ürün sayfasına yönlenen dinamik QR kodlar',
      icon: QrCode,
      badge: '3D AR Bağlantısı'
    },
    {
      id: 'prices',
      key: 'showPrices',
      title: 'Liste Fiyatlarını Göster',
      desc: 'Tavsiye edilen m² perakende ve proje fiyatlarını dahil et',
      icon: DollarSign,
      badge: formData.showPrices ? 'Fiyatlar Aktif' : 'Gizli'
    },
    {
      id: 'contact',
      key: 'showContactPage',
      title: 'İletişim & Arka Kapak',
      desc: 'Genel merkez, telefon, web ve QR arka kapak sayfası',
      icon: PhoneCall,
      badge: 'İletişim & Sosyal'
    }
  ];

  // Section Settings helper
  const sectionSettings = formData.sectionSettings || {};

  const updateSectionSettings = (secKey, newSettings) => {
    setFormData((prev) => ({
      ...prev,
      sectionSettings: {
        ...(prev.sectionSettings || {}),
        [secKey]: {
          ...((prev.sectionSettings || {})[secKey] || {}),
          ...newSettings
        }
      }
    }));
  };

  // Helper to update specific product override
  const handleUpdateProductOverride = (productId, overrideFields) => {
    setFormData((prev) => {
      const items = (prev.selectedItems || []).map((item) => {
        if (item.productId === productId) {
          return {
            ...item,
            overrides: {
              ...(item.overrides || {}),
              ...overrideFields
            }
          };
        }
        return item;
      });
      return { ...prev, selectedItems: items };
    });
  };

  // Currently selected products with DB info & overrides merged
  const combinedSelectedProducts = useMemo(() => {
    return (formData.selectedItems || []).map((item, idx) => {
      const dbProd = availableProducts.find((p) => p.id === item.productId) || {};
      const ov = item.overrides || {};
      return {
        ...dbProd,
        id: item.productId,
        name: ov.name || dbProd.name || `Ürün #${idx + 1}`,
        sku: ov.sku || dbProd.sku || `SKU-${1000 + idx}`,
        width: ov.width !== undefined ? ov.width : dbProd.width || 120,
        height: ov.height !== undefined ? ov.height : dbProd.height || 280,
        thickness: ov.thickness || dbProd.thickness || '6',
        finish: ov.finish || dbProd.finish || 'Parlak',
        color: ov.color || dbProd.color || 'Doğal Taş',
        slipResistance: ov.slipResistance || dbProd.slipResistance || 'R9',
        peiRating: ov.peiRating || dbProd.peiRating || '4',
        badge: ov.badge || '',
        price: ov.price || dbProd.price || '',
        description: ov.description || item.customNote || dbProd.description || '',
        usageArea: ov.usageArea || item.usageArea || dbProd.style || 'İç Mekân & Zemin',
        imageUrl: ov.imageUrl || dbProd.imageUrl || '/renders/modern_living_natural_oak.jpg',
        overrides: ov,
        itemRef: item
      };
    });
  }, [formData.selectedItems, availableProducts]);

  const activeProduct = combinedSelectedProducts[activeProductEditIndex] || combinedSelectedProducts[0];

  return (
    <div className="space-y-6">
      {/* Step 5 Main Header */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-stone-50 via-amber-50/20 to-neutral-50 border border-neutral-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-[#b4823c]/10 text-[#b4823c] font-mono text-[10px] font-bold uppercase tracking-wider">
              ADIM 5 / 6
            </span>
            <span className="text-xs font-mono text-neutral-400">• Yayın Denetimi</span>
          </div>
          <h3 className="text-base sm:text-lg font-extrabold text-neutral-900 mt-1 flex items-center gap-2">
            <Sliders size={18} className="text-[#b4823c]" />
            <span>Sayfa Tipleri, Görünürlük & Grafik Müdahale Stüdyosu</span>
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            Kataloğunuzda yer alacak sayfa modüllerini açıp kapatın; ürün verilerini ve tipografiyi doğrudan canlı düzenleyin.
          </p>
        </div>

        {onOpenCanvasStudio && (
          <button
            type="button"
            onClick={onOpenCanvasStudio}
            className="px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold flex items-center gap-2 flex-shrink-0 shadow-xs hover:shadow-md transition cursor-pointer"
          >
            <Wand2 size={14} className="text-amber-400" />
            <span>Gelişmiş Studio (Tuval) ile Aç</span>
          </button>
        )}
      </div>

      {/* 8 Primary Section Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {SECTIONS.map((sec) => {
          const isEnabled = Boolean(formData[sec.key]);
          const isSelectedForEdit = activeSectionId === sec.id;
          const SecIcon = sec.icon;

          return (
            <div
              key={sec.id}
              onClick={() => setActiveSectionId(sec.id)}
              className={`p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer flex flex-col justify-between group ${
                isSelectedForEdit
                  ? 'border-[#b4823c] bg-gradient-to-br from-amber-50/50 to-orange-50/20 ring-2 ring-[#b4823c]/20 shadow-sm'
                  : isEnabled
                  ? 'border-neutral-200 bg-white hover:border-[#b4823c]/50 hover:shadow-2xs'
                  : 'border-neutral-200/60 bg-neutral-50/50 opacity-65 hover:opacity-90'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormData({ ...formData, [sec.key]: !isEnabled });
                    }}
                    className={`mt-0.5 w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-colors cursor-pointer ${
                      isEnabled
                        ? 'border-[#b4823c] bg-[#b4823c] text-white'
                        : 'border-neutral-300 bg-white hover:border-neutral-400'
                    }`}
                  >
                    {isEnabled && <Check size={12} strokeWidth={3} />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-extrabold text-neutral-900 group-hover:text-[#b4823c] transition-colors">
                        {sec.title}
                      </p>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          isEnabled
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                            : 'bg-neutral-100 text-neutral-500'
                        }`}
                      >
                        {isEnabled ? 'Aktif Modül' : 'Gizli'}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">{sec.desc}</p>
                  </div>
                </div>

                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                    isSelectedForEdit
                      ? 'bg-[#b4823c] text-white shadow-2xs'
                      : isEnabled
                      ? 'bg-amber-50 text-[#b4823c]'
                      : 'bg-neutral-100 text-neutral-400'
                  }`}
                >
                  <SecIcon size={15} />
                </div>
              </div>

              {/* Bottom Quick Action / Status Bar */}
              <div className="mt-3.5 pt-2.5 border-t border-neutral-100 flex items-center justify-between text-[11px]">
                <span className="text-neutral-400 font-mono text-[10px] tracking-wide">{sec.badge}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveSectionId(sec.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                    isSelectedForEdit
                      ? 'bg-[#b4823c] text-white shadow-xs'
                      : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                  }`}
                >
                  <Edit3 size={12} />
                  <span>{isSelectedForEdit ? 'Denetçi Açık' : 'Grafik & Bilgi Düzenle'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* DEDICATED GRAPHIC & DATA INSPECTOR STUDIO (CANLI MÜDAHALE ALANI)          */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-sm overflow-hidden mt-6">
        {/* Inspector Header */}
        <div className="bg-gradient-to-r from-neutral-950 via-neutral-900 to-stone-900 text-white px-5 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-[#b4823c] text-neutral-950 flex items-center justify-center font-bold shadow-md">
              <Sparkles size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest uppercase text-amber-400 font-bold">
                  CANLI MÜDAHALE & GRAFİK DENETÇİSİ
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <h4 className="text-sm font-extrabold text-white">
                {SECTIONS.find((s) => s.id === activeSectionId)?.title} Bölümü Düzenleniyor
              </h4>
            </div>
          </div>

          {/* Quick Section Tab Switcher in Inspector */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full p-1 bg-white/5 rounded-xl border border-white/10">
            {SECTIONS.map((sec) => (
              <button
                key={sec.id}
                type="button"
                onClick={() => setActiveSectionId(sec.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  activeSectionId === sec.id
                    ? 'bg-[#b4823c] text-white shadow-xs'
                    : 'text-neutral-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {sec.title.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Inspector Body: 2 Columns (Left: Controls & Quick Tables / Right: Visual Live Mini Canvas) */}
        <div className="p-5 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-neutral-50/50">
          {/* ==================== LEFT COLUMN: CONTROLS (7 COLS) ==================== */}
          <div className="lg:col-span-7 space-y-5">
            {/* ---------------- 1. KAPAK SAYFASI MÜDAHALE EDİTÖRÜ ---------------- */}
            {activeSectionId === 'cover' && (
              <div className="space-y-4 bg-white p-5 rounded-2xl border border-neutral-200">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                  <h5 className="text-xs font-extrabold text-neutral-900 uppercase tracking-wide flex items-center gap-1.5">
                    <Type size={14} className="text-[#b4823c]" />
                    <span>Kapak Tipografisi & Başlık Yerleşimi</span>
                  </h5>
                  <span className="text-[10px] text-neutral-400">Milano & Monograf Standardı</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-neutral-700 block mb-1">
                      Ana Kapak Başlığı
                    </label>
                    <input
                      type="text"
                      value={formData.coverTitle || ''}
                      onChange={(e) => setFormData({ ...formData, coverTitle: e.target.value })}
                      placeholder="Örn: BİEN SERAMİK 2026 GENEL KATALOG"
                      className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-bold text-neutral-900 focus:bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-neutral-700 block mb-1">
                        Alt Başlık / Mimari Seri Adı
                      </label>
                      <input
                        type="text"
                        value={formData.coverSubtitle || ''}
                        onChange={(e) => setFormData({ ...formData, coverSubtitle: e.target.value })}
                        placeholder="Örn: 120x280 Dev Plakalar & Yaşam Alanları"
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-neutral-800"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-neutral-700 block mb-1">
                        Koleksiyon Sloganı / Rozet
                      </label>
                      <input
                        type="text"
                        value={formData.collectionTag || ''}
                        onChange={(e) => setFormData({ ...formData, collectionTag: e.target.value })}
                        placeholder="Örn: EXCLUSIVE ARCHITECTURAL MONOGRAPH"
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-neutral-800 font-mono"
                      />
                    </div>
                  </div>

                  {/* Preset Background Images */}
                  <div className="pt-2">
                    <label className="text-xs font-bold text-neutral-700 block mb-1.5 flex items-center justify-between">
                      <span>Kapak Arka Plan Görseli Seçin</span>
                      <span className="text-[10px] text-neutral-400">Lüks Mekan Presetleri</span>
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {COVER_BG_PRESETS.map((bg, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => updateSectionSettings('cover', { bgImage: bg.url })}
                          className={`group relative h-16 rounded-xl overflow-hidden border-2 transition cursor-pointer ${
                            (sectionSettings.cover?.bgImage || COVER_BG_PRESETS[0].url) === bg.url
                              ? 'border-[#b4823c] ring-2 ring-[#b4823c]/30 shadow'
                              : 'border-neutral-200 hover:border-neutral-400'
                          }`}
                        >
                          <img src={bg.url} alt={bg.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
                          <div className="absolute inset-0 bg-black/40 flex items-end p-1">
                            <span className="text-[8px] text-white font-bold leading-tight truncate">{bg.name}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Logo Alignment & Typography Selector */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="text-xs font-bold text-neutral-700 block mb-1">
                        Logo & Başlık Hizalaması
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {['left', 'center', 'right'].map((align) => (
                          <button
                            key={align}
                            type="button"
                            onClick={() => updateSectionSettings('cover', { alignment: align })}
                            className={`py-1.5 rounded-lg text-xs font-bold uppercase transition ${
                              (sectionSettings.cover?.alignment || 'center') === align
                                ? 'bg-neutral-900 text-white'
                                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                            }`}
                          >
                            {align === 'left' ? 'Sol' : align === 'center' ? 'Orta' : 'Sağ'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-neutral-700 block mb-1">
                        Tipografi Stili
                      </label>
                      <select
                        value={sectionSettings.cover?.fontStyle || 'serif'}
                        onChange={(e) => updateSectionSettings('cover', { fontStyle: e.target.value })}
                        className="w-full px-3 py-1.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-neutral-800"
                      >
                        <option value="serif">Editoryal Lüks Serif (Milano)</option>
                        <option value="sans">Modern Mimari Sans (Bauhaus)</option>
                        <option value="mono">Teknik Şartname Mono (Lidya)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ---------------- 2. İÇİNDEKİLER & KONSEPT DİZİNİ ---------------- */}
            {activeSectionId === 'toc' && (
              <div className="space-y-4 bg-white p-5 rounded-2xl border border-neutral-200">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                  <h5 className="text-xs font-extrabold text-neutral-900 uppercase tracking-wide flex items-center gap-1.5">
                    <FileText size={14} className="text-[#b4823c]" />
                    <span>İçindekiler Fihristi & Manifesto Metni</span>
                  </h5>
                  <span className="text-[10px] text-neutral-400">Sayfa Dizini</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-neutral-700 block mb-1">
                      İçindekiler Sayfa Başlığı
                    </label>
                    <input
                      type="text"
                      value={sectionSettings.toc?.title || 'İÇİNDEKİLER / INDEX'}
                      onChange={(e) => updateSectionSettings('toc', { title: e.target.value })}
                      className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-neutral-700 block mb-1">
                      Konsept Manifesto & Giriş Metni
                    </label>
                    <textarea
                      rows={3}
                      value={formData.introText || ''}
                      onChange={(e) => setFormData({ ...formData, introText: e.target.value })}
                      placeholder="Mimari mekanlara değer katan seramik ve porselen yüzey teknolojileri..."
                      className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-neutral-700 block mb-1">
                      Dizin Yerleşim Düzeni
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: '2-column', label: '2 Sütunlu Matbaa Dizini' },
                        { id: 'numbered-list', label: 'Minimal Numaralı Liste' }
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => updateSectionSettings('toc', { layout: item.id })}
                          className={`p-2.5 rounded-xl border text-xs font-bold text-left transition ${
                            (sectionSettings.toc?.layout || '2-column') === item.id
                              ? 'border-[#b4823c] bg-amber-50 text-[#b4823c]'
                              : 'border-neutral-200 bg-neutral-50 text-neutral-700'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ---------------- 3 & 4 & 5. TEKNİK ÖZELLİKLER, KODLAR & AÇIKLAMALAR (ANA MÜDAHALE TABLOSU) ---------------- */}
            {(activeSectionId === 'specs' ||
              activeSectionId === 'codes' ||
              activeSectionId === 'descriptions' ||
              activeSectionId === 'prices') && (
              <div className="space-y-4 bg-white p-5 rounded-2xl border border-neutral-200">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                  <div>
                    <h5 className="text-xs font-extrabold text-neutral-900 uppercase tracking-wide flex items-center gap-1.5">
                      <Table size={14} className="text-[#b4823c]" />
                      <span>Katalogdaki Ürün Verilerine Doğrudan Müdahale Tablosu</span>
                    </h5>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      Veritabanındaki eksik/hatalı ebat, yüzey, kod veya açıklamaları katalog bazında anında düzeltin.
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                    {combinedSelectedProducts.length} Ürün
                  </span>
                </div>

                {/* Product selector buttons */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {combinedSelectedProducts.map((p, idx) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setActiveProductEditIndex(idx)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 flex-shrink-0 transition cursor-pointer ${
                        activeProductEditIndex === idx
                          ? 'bg-[#b4823c] text-white shadow-2xs'
                          : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                      }`}
                    >
                      <span>#{idx + 1}</span>
                      <span className="truncate max-w-[100px]">{p.name}</span>
                    </button>
                  ))}
                </div>

                {/* Active Product Detailed Override Form */}
                {activeProduct && (
                  <div className="p-4 rounded-xl bg-amber-50/40 border border-amber-200/80 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={activeProduct.imageUrl}
                          alt={activeProduct.name}
                          className="w-10 h-10 rounded-lg object-cover border border-amber-300"
                        />
                        <div>
                          <p className="text-xs font-extrabold text-neutral-900">{activeProduct.name}</p>
                          <p className="text-[10px] text-neutral-500 font-mono">DB SKU: {activeProduct.sku}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                        Ürün #{activeProductEditIndex + 1} Müdahalesi
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
                      {/* Name Override */}
                      <div>
                        <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                          Ürün Adı (Katalog Gösterimi)
                        </label>
                        <input
                          type="text"
                          value={activeProduct.name}
                          onChange={(e) => handleUpdateProductOverride(activeProduct.id, { name: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 rounded-lg font-bold text-xs"
                        />
                      </div>

                      {/* SKU / Code Override */}
                      <div>
                        <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                          Ürün Kodu (SKU)
                        </label>
                        <input
                          type="text"
                          value={activeProduct.sku}
                          onChange={(e) => handleUpdateProductOverride(activeProduct.id, { sku: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 rounded-lg font-mono text-xs"
                        />
                      </div>

                      {/* Dimensions (Width x Height) */}
                      <div>
                        <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                          Ebatlar (cm) (En x Boy)
                        </label>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={activeProduct.width}
                            onChange={(e) =>
                              handleUpdateProductOverride(activeProduct.id, { width: e.target.value })
                            }
                            placeholder="En"
                            className="w-1/2 px-2 py-1.5 bg-white border border-neutral-300 rounded-lg text-xs"
                          />
                          <span className="text-neutral-400">×</span>
                          <input
                            type="number"
                            value={activeProduct.height}
                            onChange={(e) =>
                              handleUpdateProductOverride(activeProduct.id, { height: e.target.value })
                            }
                            placeholder="Boy"
                            className="w-1/2 px-2 py-1.5 bg-white border border-neutral-300 rounded-lg text-xs"
                          />
                        </div>
                      </div>

                      {/* Thickness */}
                      <div>
                        <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                          Kalınlık (mm)
                        </label>
                        <select
                          value={activeProduct.thickness}
                          onChange={(e) => handleUpdateProductOverride(activeProduct.id, { thickness: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 rounded-lg text-xs"
                        >
                          <option value="6">6 mm (İnce Dev Plaka)</option>
                          <option value="9">9 mm (Standart Porselen)</option>
                          <option value="10">10 mm (Ağır Yük)</option>
                          <option value="12">12 mm (Mutfak Tezgahı)</option>
                          <option value="20">20 mm (Dış Mekân Yükseltilmiş)</option>
                        </select>
                      </div>

                      {/* Finish */}
                      <div>
                        <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                          Yüzey / Bitiş Türü
                        </label>
                        <input
                          type="text"
                          value={activeProduct.finish}
                          onChange={(e) => handleUpdateProductOverride(activeProduct.id, { finish: e.target.value })}
                          placeholder="Parlak / Mat / Lappato"
                          className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 rounded-lg text-xs"
                        />
                      </div>

                      {/* Slip Resistance */}
                      <div>
                        <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                          Kaymazlık (R Değeri)
                        </label>
                        <select
                          value={activeProduct.slipResistance}
                          onChange={(e) =>
                            handleUpdateProductOverride(activeProduct.id, { slipResistance: e.target.value })
                          }
                          className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 rounded-lg text-xs font-mono"
                        >
                          <option value="R9">R9 (İç Mekân Konut)</option>
                          <option value="R10">R10 (Banyo & Islak Zemin)</option>
                          <option value="R11">R11 (Dış Mekân & Rampa)</option>
                          <option value="R12">R12 (Ticari & Havuz Kenarı)</option>
                        </select>
                      </div>

                      {/* List Price (If prices enabled) */}
                      {formData.showPrices && (
                        <div>
                          <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                            m² Liste Fiyatı ({sectionSettings.prices?.currency || '₺'})
                          </label>
                          <input
                            type="text"
                            value={activeProduct.price}
                            onChange={(e) => handleUpdateProductOverride(activeProduct.id, { price: e.target.value })}
                            placeholder="Örn: 850"
                            className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 rounded-lg font-bold text-xs"
                          />
                        </div>
                      )}

                      {/* Badge / Graphic Pill */}
                      <div className="sm:col-span-2">
                        <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                          Özel Grafik Rozeti / Vurgu Etiketi
                        </label>
                        <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                          {BADGE_PRESETS.map((b) => (
                            <button
                              key={b}
                              type="button"
                              onClick={() => handleUpdateProductOverride(activeProduct.id, { badge: b })}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                                activeProduct.badge === b
                                  ? 'bg-neutral-900 text-white'
                                  : 'bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-100'
                              }`}
                            >
                              {b}
                            </button>
                          ))}
                        </div>
                        <input
                          type="text"
                          value={activeProduct.badge || ''}
                          onChange={(e) => handleUpdateProductOverride(activeProduct.id, { badge: e.target.value })}
                          placeholder="Veya özel bir rozet yazın..."
                          className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 rounded-lg text-xs"
                        />
                      </div>

                      {/* Description / Story Override */}
                      <div className="sm:col-span-2 lg:col-span-3">
                        <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                          Koleksiyon Hikayesi / Açıklama Metni
                        </label>
                        <textarea
                          rows={2}
                          value={activeProduct.description}
                          onChange={(e) =>
                            handleUpdateProductOverride(activeProduct.id, { description: e.target.value })
                          }
                          placeholder="Bu seramik koleksiyonunun mimari tasarım felsefesi..."
                          className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 rounded-lg text-xs leading-relaxed"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ---------------- 6. QR KOD & DİJİTAL BAĞLANTI ---------------- */}
            {activeSectionId === 'qr' && (
              <div className="space-y-4 bg-white p-5 rounded-2xl border border-neutral-200">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                  <h5 className="text-xs font-extrabold text-neutral-900 uppercase tracking-wide flex items-center gap-1.5">
                    <QrCode size={14} className="text-[#b4823c]" />
                    <span>Dinamik QR Kod ve 3D AR Ayarları</span>
                  </h5>
                  <span className="text-[10px] text-neutral-400">Etkileşimli Baskı</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-neutral-700 block mb-1">
                      QR Kod Alt Etiketi Metni
                    </label>
                    <input
                      type="text"
                      value={sectionSettings.qr?.label || '3D Mekânımda Gör & BIM İndir'}
                      onChange={(e) => updateSectionSettings('qr', { label: e.target.value })}
                      className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-neutral-700 block mb-1">
                        Sayfa Konumu
                      </label>
                      <select
                        value={sectionSettings.qr?.position || 'bottom-right'}
                        onChange={(e) => updateSectionSettings('qr', { position: e.target.value })}
                        className="w-full px-3 py-1.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs"
                      >
                        <option value="bottom-right">Sağ Alt Köşe (Önerilen)</option>
                        <option value="bottom-left">Sol Alt Köşe</option>
                        <option value="near-specs">Teknik Tablo Yanı</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-neutral-700 block mb-1">
                        QR Kod Boyutu
                      </label>
                      <select
                        value={sectionSettings.qr?.size || 'standard'}
                        onChange={(e) => updateSectionSettings('qr', { size: e.target.value })}
                        className="w-full px-3 py-1.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs"
                      >
                        <option value="compact">Kompakt (60×60 mm)</option>
                        <option value="standard">Standart (85×85 mm)</option>
                        <option value="large">Büyük & Vurgulu (110×110 mm)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ---------------- 7. İLETİŞİM & ARKA KAPAK ---------------- */}
            {activeSectionId === 'contact' && (
              <div className="space-y-4 bg-white p-5 rounded-2xl border border-neutral-200">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                  <h5 className="text-xs font-extrabold text-neutral-900 uppercase tracking-wide flex items-center gap-1.5">
                    <PhoneCall size={14} className="text-[#b4823c]" />
                    <span>Arka Kapak Tasarımı & Kurumsal İletişim</span>
                  </h5>
                  <span className="text-[10px] text-neutral-400">Son Sayfa</span>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-neutral-700 block mb-1">
                        Web Sitesi
                      </label>
                      <input
                        type="text"
                        value={formData.websiteUrl || ''}
                        onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                        placeholder="www.bienseramik.com.tr"
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-neutral-700 block mb-1">
                        Telefon / Proje Hattı
                      </label>
                      <input
                        type="text"
                        value={formData.contactPhone || ''}
                        onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                        placeholder="+90 (212) 000 00 00"
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-neutral-700 block mb-1">
                      Fabrika & Genel Merkez Adresi
                    </label>
                    <textarea
                      rows={2}
                      value={formData.contactAddress || ''}
                      onChange={(e) => setFormData({ ...formData, contactAddress: e.target.value })}
                      placeholder="Organize Sanayi Bölgesi, Bilecik / Türkiye"
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ==================== RIGHT COLUMN: LIVE MINI CANVAS PREVIEW (5 COLS) ==================== */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            <div className="bg-neutral-900 rounded-2xl p-4 text-white shadow-lg space-y-3">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-white/10">
                <span className="font-extrabold flex items-center gap-1.5 text-amber-300">
                  <Eye size={13} />
                  <span>Canlı Grafik Önizleme</span>
                </span>
                <span className="text-[10px] font-mono text-neutral-400 uppercase">
                  {activeSectionId.toUpperCase()} ALANI
                </span>
              </div>

              {/* Graphical representation of the current section */}
              <div className="relative aspect-[3/4] bg-neutral-950 rounded-xl overflow-hidden border border-white/15 flex flex-col justify-between p-4 shadow-inner">
                {activeSectionId === 'cover' ? (
                  <>
                    <div
                      className="absolute inset-0 bg-cover bg-center opacity-40"
                      style={{
                        backgroundImage: `url(${sectionSettings.cover?.bgImage || COVER_BG_PRESETS[0].url})`
                      }}
                    />
                    <div className="relative z-10 flex justify-between items-center text-[8px] font-mono tracking-widest text-neutral-400 uppercase">
                      <span>{brandInfo?.name || 'SERAMİKBAK'}</span>
                      <span>2026</span>
                    </div>
                    <div className="relative z-10 text-center my-auto px-2">
                      <span className="text-[7px] font-mono tracking-widest uppercase text-amber-300 block mb-1">
                        {formData.collectionTag || 'ARCHITECTURAL MONOGRAPH'}
                      </span>
                      <h4 className="text-sm sm:text-base font-serif font-extrabold uppercase tracking-wide text-white drop-shadow">
                        {formData.coverTitle || 'BİEN SERAMİK 2026'}
                      </h4>
                      <p className="text-[9px] text-neutral-300 mt-1 font-sans line-clamp-2">
                        {formData.coverSubtitle || '120x280 Dev Plakalar & Yaşam Alanları'}
                      </p>
                    </div>
                    <div className="relative z-10 text-center text-[7px] text-neutral-500 font-mono">
                      <span>HIGH-RESOLUTION ARCHITECTURAL CERAMICS</span>
                    </div>
                  </>
                ) : activeProduct ? (
                  <>
                    <div className="flex items-center justify-between text-[8px] text-neutral-400 font-mono border-b border-white/10 pb-1.5">
                      <span>KOD: {activeProduct.sku}</span>
                      <span>{activeProduct.width}×{activeProduct.height} CM</span>
                    </div>

                    <div className="my-auto space-y-2">
                      <div className="h-28 w-full rounded-lg overflow-hidden relative border border-white/20">
                        <img
                          src={activeProduct.imageUrl}
                          alt={activeProduct.name}
                          className="w-full h-full object-cover"
                        />
                        {activeProduct.badge && (
                          <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-amber-500 text-neutral-950 text-[7px] font-black uppercase">
                            {activeProduct.badge}
                          </span>
                        )}
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-white truncate">{activeProduct.name}</h4>
                        <p className="text-[9px] text-neutral-400 mt-0.5">
                          {activeProduct.thickness} mm • {activeProduct.finish} • {activeProduct.slipResistance}
                        </p>
                        {activeProduct.price && (
                          <p className="text-[10px] font-extrabold text-amber-400 mt-1">
                            {activeProduct.price} {sectionSettings.prices?.currency || '₺'} / m²
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[8px] text-neutral-500">
                      <span>{activeProduct.usageArea}</span>
                      {formData.showQrCodes && <span className="text-amber-400 font-bold">QR Kod Aktif</span>}
                    </div>
                  </>
                ) : (
                  <div className="my-auto text-center text-xs text-neutral-500">
                    Önizleme oluşturuluyor...
                  </div>
                )}
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-[10px] text-neutral-300 flex items-center gap-2">
                <CheckCircle2 size={13} className="text-emerald-400 flex-shrink-0" />
                <span>
                  Yapılan tüm müdahaleler 6. Adımdaki (Canlı Önizleme & PDF) matbaa mizanpajına anında yansır.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
