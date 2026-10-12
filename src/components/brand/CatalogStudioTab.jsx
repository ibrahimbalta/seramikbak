'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Eye,
  Download,
  Share2,
  Copy,
  Trash2,
  Edit,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  MoveUp,
  MoveDown,
  X,
  ExternalLink,
  Layers,
  Sparkles,
  Palette,
  Settings,
  FileText,
  Printer,
  Sliders,
  Globe,
  Building,
  QrCode,
  Box,
  Check,
  ChevronRight,
  HelpCircle,
  Smartphone,
  Monitor,
  LayoutTemplate,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Tag,
  Maximize2
} from 'lucide-react';
import CatalogTemplateRenderer from './catalog/templates/CatalogTemplateRenderer';

const TEMPLATES = [
  {
    id: 'milano',
    name: 'Minimalist Milano Lookbook',
    badge: 'Editorial & Lüks Mimari',
    desc: 'İtalyan Cersaie dergi estetiği. Geniş negatif alanlar, yüksek çözünürlüklü mekan ve doku görselleri, zarif tipografi ve 3D simülasyon QR kodları.',
    accent: '#b4823c',
    icon: Sparkles,
    tag: 'Mimarlar & Tasarımcılar',
    mockupImg: '/renders/luxury_bathroom_calacatta_gold.jpg'
  },
  {
    id: 'spec-sheet',
    name: 'Mimari Teknik Föy & Şartname',
    badge: 'TS EN 14411 & BIM',
    desc: 'Mimarlar, mühendisler ve kamu ihale dosyaları için CAD/BIM standartlarında teknik matris. TS EN 14411 uygunluğu, PEI aşınma, R kaymazlık, kutu/palet metrajı.',
    accent: '#0284c7',
    icon: Layers,
    tag: 'İhale & Şartname',
    mockupImg: '/renders/luxury_bathroom_loft_beton.jpg'
  },
  {
    id: 'showroom',
    name: 'Showroom & Koleksiyon Rehberi',
    badge: 'Perakende & Bayi Satış',
    desc: 'Bayi teşhirleri ve mağaza satış ekipleri için yan yana ürün kartları, önerilen mekan etiketleri (Banyo, Mutfak, Salon), derz eşleştirmeleri ve perakende liste etiketleri.',
    accent: '#d97706',
    icon: Building,
    tag: 'Mağaza & Müşteri',
    mockupImg: '/renders/luxury_bathroom_albatros_antrasit.jpg'
  },
  {
    id: 'global-export',
    name: 'Global İhracat & B2B Matrisi',
    badge: 'Konteyner & Lojistik',
    desc: 'Yurtdışı distribütörler ve ihracat fuarları için çok dilli (EN) format. 20ft/40ft konteyner yükleme kapasiteleri, GTİP / HS Kodu (6907), CE / ISO sertifikaları ve FOB/EXW terimleri.',
    accent: '#2563eb',
    icon: Globe,
    tag: 'Global İhracat',
    mockupImg: '/renders/luxury_bathroom_natural_oak.jpg'
  },
];

const COLOR_PRESETS = [
  { name: 'Milano Gold', hex: '#b4823c' },
  { name: 'Derin Lacivert', hex: '#0f172a' },
  { name: 'Zümrüt Yeşili', hex: '#047857' },
  { name: 'Terracotta', hex: '#c2410c' },
  { name: 'Modern Antrasit', hex: '#334155' },
  { name: 'Bordo Lüks', hex: '#881337' },
];

export default function CatalogStudioTab({ brandInfo }) {
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'editor' | 'preview-modal'
  const [catalogs, setCatalogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filtering list
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'published' | 'draft'
  const [searchQuery, setSearchQuery] = useState('');

  // Available brand products
  const [availableProducts, setAvailableProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');

  // Active Catalog Editor State
  const [activeCatalogId, setActiveCatalogId] = useState(null);
  const [activeStep, setActiveStep] = useState(1); // 1 to 6
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    coverTitle: '',
    coverSubtitle: '',
    introText: '',
    template: 'milano',
    orientation: 'portrait',
    pageSize: 'a4',
    language: 'tr',
    customLogoUrl: '',
    primaryColor: '#b4823c',
    accentColor: '#0f172a',
    websiteUrl: '',
    contactPhone: '',
    contactEmail: '',
    contactAddress: '',
    showPrices: false,
    showSpecs: true,
    showCodes: true,
    showDescriptions: true,
    showQrCodes: true,
    showCover: true,
    showTOC: true,
    showContactPage: true,
    showPageNumbers: true,
    selectedItems: [],
    isPublished: false,
    isDraft: true,
    publicSlug: '',
  });

  // Modal preview state
  const [previewCatalog, setPreviewCatalog] = useState(null);
  const [previewProducts, setPreviewProducts] = useState([]);
  const [previewLoading, setPreviewLoading] = useState(false);

  const brandId = brandInfo?.id;

  useEffect(() => {
    if (brandId) {
      loadCatalogs();
      loadBrandProducts();
    }
  }, [brandId]);

  const loadCatalogs = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/brand/catalogs?brandId=${brandId}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setCatalogs(data.catalogs || []);
      } else {
        setErrorMsg(data.error || 'Kataloglar yüklenemedi.');
      }
    } catch (err) {
      setErrorMsg('Bağlantı hatası: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadBrandProducts = async () => {
    setProductsLoading(true);
    try {
      const res = await fetch(`/api/search?brandId=${brandId}&limit=all&fullDetail=true`);
      if (res.ok) {
        const data = await res.json();
        setAvailableProducts(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setProductsLoading(false);
    }
  };

  const handleStartNew = () => {
    setActiveCatalogId(null);
    setFormData({
      title: `${brandInfo?.name || 'Marka'} ${new Date().getFullYear()} Koleksiyon Kataloğu`,
      description: 'Mimari ve perakende kullanım için özenle seçilmiş porselen ve seramik serisi.',
      coverTitle: `${brandInfo?.name || 'SERAMİK'} ${new Date().getFullYear()}`,
      coverSubtitle: 'Özel Mimari ve İç Mekân Seçkisi',
      introText: 'Yenilikçi yüzey teknolojileri, dayanıklı porselen gövde ve çağdaş İtalyan tasarım estetiği ile yaşam alanlarınıza değer katıyoruz.',
      template: 'milano',
      orientation: 'portrait',
      pageSize: 'a4',
      language: 'tr',
      customLogoUrl: brandInfo?.logoUrl || '',
      primaryColor: '#b4823c',
      accentColor: '#0f172a',
      websiteUrl: 'www.seramikbak.com',
      contactPhone: '',
      contactEmail: '',
      contactAddress: '',
      showPrices: false,
      showSpecs: true,
      showCodes: true,
      showDescriptions: true,
      showQrCodes: true,
      showCover: true,
      showTOC: true,
      showContactPage: true,
      showPageNumbers: true,
      selectedItems: availableProducts.slice(0, 6).map(p => ({ productId: p.id, customNote: '', usageArea: p.style || 'İç Mekân' })),
      isPublished: false,
      isDraft: true,
      publicSlug: '',
    });
    setActiveStep(1);
    setViewMode('editor');
  };

  const handleEdit = async (cat) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/brand/catalogs/${cat.id}`);
      const data = await res.json();
      if (res.ok && data.success) {
        const catalog = data.catalog;
        let items = [];
        try {
          items = JSON.parse(catalog.productItems || '[]');
        } catch (e) {
          items = [];
        }

        setActiveCatalogId(catalog.id);
        setFormData({
          title: catalog.title || '',
          description: catalog.description || '',
          coverTitle: catalog.coverTitle || '',
          coverSubtitle: catalog.coverSubtitle || '',
          introText: catalog.introText || '',
          template: catalog.template || 'milano',
          orientation: catalog.orientation || 'portrait',
          pageSize: catalog.pageSize || 'a4',
          language: catalog.language || 'tr',
          customLogoUrl: catalog.customLogoUrl || brandInfo?.logoUrl || '',
          primaryColor: catalog.primaryColor || '#b4823c',
          accentColor: catalog.accentColor || '#0f172a',
          websiteUrl: catalog.websiteUrl || '',
          contactPhone: catalog.contactPhone || '',
          contactEmail: catalog.contactEmail || '',
          contactAddress: catalog.contactAddress || '',
          showPrices: catalog.showPrices,
          showSpecs: catalog.showSpecs,
          showCodes: catalog.showCodes,
          showDescriptions: catalog.showDescriptions,
          showQrCodes: catalog.showQrCodes,
          showCover: catalog.showCover,
          showTOC: catalog.showTOC,
          showContactPage: catalog.showContactPage,
          showPageNumbers: catalog.showPageNumbers,
          selectedItems: items.map(item => typeof item === 'string' ? { productId: item } : item),
          isPublished: catalog.isPublished,
          isDraft: catalog.isDraft,
          publicSlug: catalog.publicSlug || '',
        });
        setActiveStep(1);
        setViewMode('editor');
      } else {
        alert(data.error || 'Katalog detayları açılamadı.');
      }
    } catch (err) {
      alert('Hata: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPreview = async (cat) => {
    setPreviewLoading(true);
    setPreviewCatalog(null);
    try {
      const res = await fetch(`/api/brand/catalogs/${cat.id}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setPreviewCatalog(data.catalog);
        setPreviewProducts(data.catalog.products || []);
        setViewMode('preview-modal');
      } else {
        alert(data.error || 'Önizleme yüklenemedi.');
      }
    } catch (err) {
      alert('Önizleme hatası: ' + err.message);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDuplicate = async (cat) => {
    if (!confirm(`"${cat.title}" kataloğunun bir kopyasını oluşturmak istiyor musunuz?`)) return;
    try {
      const res = await fetch(`/api/brand/catalogs/${cat.id}/duplicate`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg('Katalog başarıyla kopyalandı.');
        loadCatalogs();
      } else {
        alert(data.error || 'Kopyalama başarısız.');
      }
    } catch (err) {
      alert('Hata: ' + err.message);
    }
  };

  const handleDelete = async (cat) => {
    if (!confirm(`"${cat.title}" kataloğunu kalıcı olarak silmek istediğinizden emin misiniz?`)) return;
    try {
      const res = await fetch(`/api/brand/catalogs/${cat.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg('Katalog başarıyla silindi.');
        loadCatalogs();
      } else {
        alert(data.error || 'Silme işlemi başarısız.');
      }
    } catch (err) {
      alert('Hata: ' + err.message);
    }
  };

  const handleToggleProduct = (product) => {
    const exists = formData.selectedItems.some(i => i.productId === product.id);
    if (exists) {
      setFormData(prev => ({
        ...prev,
        selectedItems: prev.selectedItems.filter(i => i.productId !== product.id),
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        selectedItems: [
          ...prev.selectedItems,
          {
            productId: product.id,
            customNote: '',
            usageArea: product.style || 'İç Mekân & Zemin',
          }
        ],
      }));
    }
  };

  const handleMoveProduct = (index, direction) => {
    const items = [...formData.selectedItems];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    const temp = items[index];
    items[index] = items[targetIndex];
    items[targetIndex] = temp;
    setFormData(prev => ({ ...prev, selectedItems: items }));
  };

  const handleUpdateProductNote = (index, note) => {
    const items = [...formData.selectedItems];
    items[index].customNote = note;
    setFormData(prev => ({ ...prev, selectedItems: items }));
  };

  const handleSaveCatalog = async (publish = false) => {
    if (!formData.title.trim()) {
      alert('Lütfen bir katalog başlığı girin.');
      return;
    }
    if (formData.selectedItems.length === 0) {
      alert('Lütfen kataloğa en az 1 seramik ürün ekleyin.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        brandId,
        productItems: formData.selectedItems,
        isPublished: publish ? true : formData.isPublished,
        isDraft: publish ? false : true,
      };

      const url = activeCatalogId
        ? `/api/brand/catalogs/${activeCatalogId}`
        : `/api/brand/catalogs`;
      const method = activeCatalogId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(publish ? 'Katalog başarıyla yayınlandı!' : 'Katalog taslak olarak kaydedildi.');
        setViewMode('list');
        loadCatalogs();
      } else {
        alert(data.error || 'Kaydetme işlemi başarısız.');
      }
    } catch (err) {
      alert('Hata: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCopyLink = (slug) => {
    const url = `${window.location.origin}/katalog/${slug}`;
    navigator.clipboard.writeText(url);
    alert('Katalog web bağlantısı panoya kopyalandı:\n' + url);
  };

  const filteredCatalogs = catalogs.filter(cat => {
    if (filterTab === 'published' && !cat.isPublished) return false;
    if (filterTab === 'draft' && cat.isPublished) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        cat.title.toLowerCase().includes(q) ||
        (cat.description && cat.description.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const productCategories = ['all', ...new Set(availableProducts.map(p => p.style).filter(Boolean))];

  const filteredAvailableProducts = availableProducts.filter(p => {
    if (productCategoryFilter !== 'all' && p.style !== productCategoryFilter) return false;
    if (productSearch.trim()) {
      const q = productSearch.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        (p.code && p.code.toLowerCase().includes(q)) ||
        (p.color && p.color.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const STEPS = [
    { num: 1, label: 'Katalog Bilgileri', desc: 'Başlık, kapak & dil' },
    { num: 2, label: `Ürün Seçimi (${formData.selectedItems.length})`, desc: 'Koleksiyon karoları' },
    { num: 3, label: 'Şablon Seçimi', desc: '4 lüks preset' },
    { num: 4, label: 'Kurumsal Kimlik', desc: 'Logo & renkler' },
    { num: 5, label: 'Görünürlük', desc: 'Fiyat, QR & sayfalar' },
    { num: 6, label: 'Canlı Flipbook & Yayın', desc: 'İnteraktif test' },
  ];

  return (
    <div className="w-full flex flex-col gap-6 font-sans">
      {/* Toast Notifications */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
            <span className="font-bold">{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-600 hover:text-emerald-800 p-1">
            <X size={16} />
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-sm flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <AlertCircle size={18} className="text-rose-600 flex-shrink-0" />
            <span className="font-bold">{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')} className="text-rose-600 hover:text-rose-800 p-1">
            <X size={16} />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW MODE 1: CATALOG STUDIO COMMAND CENTER & 3D LOOKBOOK SHOWCASE */}
      {/* ========================================================================= */}
      {viewMode === 'list' && (
        <div className="space-y-8">
          {/* Executive Studio Hero Command Center */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-amber-500/30 bg-gradient-to-r from-neutral-950 via-[#10141e] to-neutral-900 text-white p-7 sm:p-10">
            {/* Ambient luxury lighting */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-amber-500/20 via-amber-500/5 to-transparent pointer-events-none rounded-full blur-2xl" />
            <div className="absolute -bottom-10 left-10 w-72 h-72 bg-blue-500/10 pointer-events-none rounded-full blur-3xl" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-300 text-xs font-bold tracking-widest uppercase backdrop-blur-md">
                  <Sparkles size={13} className="text-amber-400" />
                  <span>SERAMİKBAK CATALOG STUDIO &bull; B2B & B2C DİJİTAL YAYINCILIK</span>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-light text-white tracking-tight leading-[1.15]">
                  Dijital Katalog & Lookbook Stüdyosu
                </h1>

                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-light">
                  Markanızın seramik ve porselen koleksiyonlarını; İtalyan Cersaie mimarlık dergisi kalitesinde lookbook&apos;lara, kamu ihale teknik şartnamelerine ve bayi showroom kataloglarına dönüştürün. Otomatik 3D & AR karekodlarıyla müşterileriniz ve mimarlar karoları anında kendi odalarında canlı denesin.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] font-mono text-neutral-400">
                  <span className="flex items-center gap-1.5 text-neutral-200">
                    <CheckCircle2 size={13} className="text-emerald-400" />
                    <span>A4 Vektörel PDF</span>
                  </span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1.5 text-neutral-200">
                    <CheckCircle2 size={13} className="text-amber-400" />
                    <span>Canlı 3D & AR Karekod</span>
                  </span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1.5 text-neutral-200">
                    <CheckCircle2 size={13} className="text-sky-400" />
                    <span>İnteraktif Web Linki</span>
                  </span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1.5 text-neutral-200">
                    <CheckCircle2 size={13} className="text-purple-400" />
                    <span>İndirme Analitiği</span>
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-shrink-0">
                <button
                  onClick={handleStartNew}
                  className="px-6 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:opacity-95 text-neutral-950 font-black text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-amber-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Plus size={20} className="stroke-[3]" />
                  <span>Yeni Katalog Oluştur</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar with Modern Glassmorphism */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-neutral-200/90 shadow-sm flex flex-col justify-between hover:border-amber-400 transition group">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider font-mono">
                  Toplam Katalog
                </span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <BookOpen size={16} />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-3xl font-extrabold text-neutral-900">{catalogs.length}</p>
                <p className="text-[11px] text-neutral-400 mt-0.5">Yayınlanan & Taslak Yayınlar</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-sm flex flex-col justify-between hover:border-emerald-400 transition group">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider font-mono">
                  Yayında Olanlar
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Globe size={16} />
                </div>
              </div>
              <div className="mt-3">
                <div className="flex items-center gap-2">
                  <p className="text-3xl font-extrabold text-emerald-600">
                    {catalogs.filter(c => c.isPublished).length}
                  </p>
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <p className="text-[11px] text-neutral-400 mt-0.5">Web & Mobil Erişime Açık</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-blue-200 shadow-sm flex flex-col justify-between hover:border-blue-400 transition group">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider font-mono">
                  Web Okunma
                </span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Eye size={16} />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-3xl font-extrabold text-neutral-900">
                  {catalogs.reduce((acc, c) => acc + (c.viewCount || 0), 0)}
                </p>
                <p className="text-[11px] text-neutral-400 mt-0.5">Mimar & Müşteri Görüntülemesi</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-purple-200 shadow-sm flex flex-col justify-between hover:border-purple-400 transition group">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider font-mono">
                  PDF İndirilme
                </span>
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Download size={16} />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-3xl font-extrabold text-purple-600">
                  {catalogs.reduce((acc, c) => acc + (c.downloadCount || 0), 0)}
                </p>
                <p className="text-[11px] text-neutral-400 mt-0.5">B2B Şartname & Föy İndirmeleri</p>
              </div>
            </div>
          </div>

          {/* Quick-Start Architectural Templates Showcase */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-neutral-900 flex items-center gap-2">
                  <Layers size={18} className="text-amber-600" />
                  <span>4 Profesyonel Şablon ile Hemen Başlayın</span>
                </h3>
                <p className="text-xs text-neutral-500">
                  İhtiyacınıza uygun mimari formatı seçin; ürünleriniz otomatik olarak profesyonel mizanpaja dizilsin.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {TEMPLATES.map((tpl) => {
                const IconComponent = tpl.icon;

                return (
                  <div
                    key={tpl.id}
                    className="bg-white rounded-2xl border border-neutral-200/90 shadow-sm hover:shadow-lg transition-all p-4 flex flex-col justify-between group hover:border-amber-400"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm"
                          style={{ backgroundColor: tpl.accent }}
                        >
                          <IconComponent size={18} />
                        </div>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700">
                          {tpl.tag}
                        </span>
                      </div>

                      <h4 className="text-sm font-extrabold text-neutral-900 mb-1 group-hover:text-amber-800 transition">
                        {tpl.name}
                      </h4>
                      <p className="text-[11px] text-neutral-500 leading-relaxed line-clamp-3 mb-4">
                        {tpl.desc}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        handleStartNew();
                        setFormData((prev) => ({ ...prev, template: tpl.id }));
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-neutral-100 group-hover:bg-amber-500 text-neutral-800 group-hover:text-neutral-950 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                    >
                      <span>Bu Şablonla Başla</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Catalog Listing Header & Search / Filter Controls */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-neutral-900 flex items-center gap-2">
                  <BookOpen size={19} className="text-amber-600" />
                  <span>Kataloglarım & Yayınlanan E-Lookbook&apos;lar</span>
                </h3>
                <p className="text-xs text-neutral-500">
                  Oluşturduğunuz katalogları görüntüleyin, canlı web bağlantısını paylaşın veya düzenleyin.
                </p>
              </div>
            </div>

            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-neutral-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setFilterTab('all')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                    filterTab === 'all'
                      ? 'bg-neutral-900 text-white shadow'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  Tümü ({catalogs.length})
                </button>
                <button
                  onClick={() => setFilterTab('published')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                    filterTab === 'published'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  Yayındakiler ({catalogs.filter(c => c.isPublished).length})
                </button>
                <button
                  onClick={() => setFilterTab('draft')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                    filterTab === 'draft'
                      ? 'bg-amber-600 text-white shadow'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  Taslaklar ({catalogs.filter(c => !c.isPublished).length})
                </button>
              </div>

              <div className="relative w-full sm:w-72">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Katalog adı veya seri ara..."
                  className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Hardcover Lookbook Cards Grid */}
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center text-neutral-500">
              <Loader2 size={36} className="animate-spin text-amber-500 mb-2" />
              <p className="text-sm font-bold">Kataloglar yükleniyor...</p>
            </div>
          ) : filteredCatalogs.length === 0 ? (
            <div className="bg-white rounded-3xl border-2 border-dashed border-neutral-300 p-10 sm:p-16 text-center">
              <div className="w-18 h-18 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
                <BookOpen size={32} />
              </div>
              <h3 className="text-lg font-extrabold text-neutral-900 mb-1">
                Henüz Dijital Katalog Oluşturulmadı
              </h3>
              <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto mb-6">
                Ürün portföyünüzden seramikleri seçerek İtalyan mimari dergi, şartname veya showroom lookbook&apos;u oluşturun.
              </p>
              <button
                onClick={handleStartNew}
                className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-sm inline-flex items-center gap-2 shadow-lg transition"
              >
                <Plus size={18} />
                <span>İlk Kataloğunuzu Oluşturun</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCatalogs.map(cat => {
                const tplInfo = TEMPLATES.find(t => t.id === cat.template) || TEMPLATES[0];

                return (
                  <div
                    key={cat.id}
                    className="bg-white rounded-2xl border border-neutral-200/90 shadow-md hover:shadow-2xl transition-all overflow-hidden flex flex-col justify-between group"
                  >
                    {/* 3D Realistic Hardcover Book Spine Mockup */}
                    <div
                      onClick={() => handleOpenPreview(cat)}
                      className="relative h-60 w-full cursor-pointer overflow-hidden p-6 flex flex-col justify-between text-white"
                      style={{
                        background: `linear-gradient(135deg, rgba(9, 13, 22, 0.95) 0%, rgba(17, 24, 39, 0.85) 60%, rgba(30, 27, 75, 0.9) 100%), url(${tplInfo.mockupImg}) center/cover no-repeat`,
                        backgroundColor: '#0f172a'
                      }}
                    >
                      {/* Book Spine Shadow Left */}
                      <div className="absolute inset-y-0 left-0 w-3.5 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
                      <div className="absolute inset-y-0 left-3.5 w-px bg-white/20" />

                      {/* Top Badges */}
                      <div className="relative z-10 flex items-center justify-between">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-300 font-mono bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10 shadow-sm">
                          {tplInfo.name}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                            cat.isPublished ? 'bg-emerald-500 text-neutral-950 font-extrabold shadow-sm' : 'bg-amber-500 text-neutral-950 font-extrabold'
                          }`}
                        >
                          {cat.isPublished ? 'YAYINDA' : 'TASLAK'}
                        </span>
                      </div>

                      {/* Middle Book Title */}
                      <div className="relative z-10 my-auto">
                        <span className="text-[11px] font-serif text-amber-200/90 uppercase tracking-widest block mb-1">
                          {brandInfo?.name || 'SERAMİK'}
                        </span>
                        <h3 className="text-xl sm:text-2xl font-serif font-light text-white leading-snug line-clamp-2 drop-shadow-md">
                          {cat.title}
                        </h3>
                      </div>

                      {/* Bottom Book Metadata */}
                      <div className="relative z-10 flex items-center justify-between text-[11px] text-neutral-300 font-mono border-t border-white/15 pt-2">
                        <span>{cat.itemCount || 0} Seramik Karo</span>
                        <span>{cat.orientation === 'landscape' ? 'Yatay A4' : 'Dikey A4'}</span>
                      </div>

                      {/* Hover Overlay with "Lookbook Olarak Aç" button */}
                      <div className="absolute inset-0 bg-neutral-950/75 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenPreview(cat);
                          }}
                          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs flex items-center gap-2 shadow-xl transform scale-95 group-hover:scale-100 transition"
                        >
                          <Eye size={15} />
                          <span>Lookbook Olarak Oku</span>
                        </button>
                      </div>
                    </div>

                    {/* Bottom Card Controls */}
                    <div className="p-4 bg-white flex flex-col justify-between flex-1">
                      {cat.description && (
                        <p className="text-xs text-neutral-500 line-clamp-2 mb-3 leading-relaxed">
                          {cat.description}
                        </p>
                      )}

                      <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500 font-medium">
                        <span>Okunma: <strong className="text-neutral-800">{cat.viewCount || 0}</strong></span>
                        <span>İndirilme: <strong className="text-neutral-800">{cat.downloadCount || 0}</strong></span>
                        <span className="font-mono text-[10px] text-neutral-400">
                          {new Date(cat.updatedAt || Date.now()).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                    </div>

                    {/* Modern Action Bar */}
                    <div className="p-3 bg-neutral-50 border-t border-neutral-200/80 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleOpenPreview(cat)}
                        className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
                      >
                        <Eye size={14} />
                        <span>Lookbook Aç</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEdit(cat)}
                          className="p-2 rounded-xl bg-white border border-neutral-200 hover:bg-neutral-100 text-blue-700 transition"
                          title="Kataloğu Düzenle"
                        >
                          <Edit size={15} />
                        </button>

                        <button
                          onClick={() => handleCopyLink(cat.publicSlug)}
                          className="p-2 rounded-xl bg-white border border-neutral-200 hover:bg-neutral-100 text-emerald-700 transition"
                          title="Web Bağlantısını Kopyala"
                        >
                          <Share2 size={15} />
                        </button>

                        <button
                          onClick={() => handleDuplicate(cat)}
                          className="p-2 rounded-xl bg-white border border-neutral-200 hover:bg-neutral-100 text-neutral-700 transition"
                          title="Kopyasını Çoğalt"
                        >
                          <Copy size={15} />
                        </button>

                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="p-2 rounded-xl bg-white border border-neutral-200 hover:bg-rose-50 text-rose-600 transition"
                          title="Kataloğu Sil"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Features & Architectural Value Guide (Bottom Highlights) */}
          <div className="pt-4 border-t border-neutral-200">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-500 mb-3">
              Catalog Studio &bull; Dijital Yayıncılık Özellikleri
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-xs flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <QrCode size={18} />
                </div>
                <div>
                  <h5 className="text-xs font-extrabold text-neutral-900">Otomatik 3D & AR Karekod</h5>
                  <p className="text-[11px] text-neutral-500 mt-0.5 leading-relaxed">
                    Her ürün sayfası için dinamik 3D mekan simülasyon karekodu basılır. Müşterileriniz telefonla okutarak karoları kendi odalarında canlı deneyimler.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-xs flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Printer size={18} />
                </div>
                <div>
                  <h5 className="text-xs font-extrabold text-neutral-900">Vektörel A4 Baskı & PDF</h5>
                  <p className="text-[11px] text-neutral-500 mt-0.5 leading-relaxed">
                    Sayfa kenar boşlukları ve yüksek çözünürlüklü görsellerle matbaa baskısına ve e-posta paylaşımlarına hazır profesyonel PDF dosyası üretin.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-xs flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Globe size={18} />
                </div>
                <div>
                  <h5 className="text-xs font-extrabold text-neutral-900">İnteraktif Web Lookbook&apos;u</h5>
                  <p className="text-[11px] text-neutral-500 mt-0.5 leading-relaxed">
                    Web sitenize gömebileceğiniz veya mimarlarla tek tıkla paylaşabileceğiniz, sayfa çevirme animasyonlu interaktif dijital yayın bağlantısı.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW MODE 2: WIZARD EDITOR (EXECUTIVE LUXURY FORM + LIVE PREVIEW) */}
      {/* ========================================================================= */}
      {viewMode === 'editor' && (
        <div className="space-y-4">
          {/* Editor Header Bar */}
          <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-sm p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setViewMode('list')}
                className="p-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition"
                title="Katalog Listesine Dön"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200 uppercase tracking-wide">
                  {activeCatalogId ? 'Katalog Düzenleme' : 'Yeni Katalog Stüdyosu'}
                </span>
                <h2 className="text-base sm:text-lg font-bold text-neutral-900 mt-0.5 truncate max-w-xs sm:max-w-md">
                  {formData.title || 'Başlıksız Katalog'}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                type="button"
                onClick={() => handleSaveCatalog(false)}
                disabled={saving}
                className="px-4 py-2 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-neutral-700 text-xs font-bold transition flex items-center gap-1.5"
              >
                {saving ? <Loader2 size={13} className="animate-spin" /> : null}
                <span>Taslak Kaydet</span>
              </button>
              <button
                type="button"
                onClick={() => handleSaveCatalog(true)}
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5"
              >
                <Sparkles size={14} />
                <span>Kataloğu Yayınla</span>
              </button>
            </div>
          </div>

          {/* Stepper Navigation */}
          <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-sm p-3 sm:p-4">
            <div className="hidden lg:grid grid-cols-6 gap-2">
              {STEPS.map(step => {
                const isActive = activeStep === step.num;
                const isPassed = activeStep > step.num;

                return (
                  <button
                    key={step.num}
                    onClick={() => setActiveStep(step.num)}
                    className={`p-2.5 rounded-xl text-left border transition flex items-center gap-2.5 ${
                      isActive
                        ? 'border-amber-500 bg-amber-50/60 shadow-sm ring-2 ring-amber-500/20'
                        : isPassed
                        ? 'border-emerald-200 bg-emerald-50/40 text-emerald-900'
                        : 'border-neutral-200 bg-neutral-50/40 text-neutral-500 hover:bg-neutral-100'
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        isActive
                          ? 'bg-amber-500 text-neutral-950 font-bold'
                          : isPassed
                          ? 'bg-emerald-600 text-white'
                          : 'bg-neutral-200 text-neutral-600'
                      }`}
                    >
                      {isPassed ? <Check size={13} /> : step.num}
                    </span>
                    <div className="overflow-hidden">
                      <p className={`text-xs font-bold truncate ${isActive ? 'text-neutral-900' : isPassed ? 'text-emerald-950' : 'text-neutral-700'}`}>
                        {step.label}
                      </p>
                      <p className="text-[10px] text-neutral-400 truncate">{step.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Mobile Stepper */}
            <div className="lg:hidden space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-amber-800">Adım {activeStep} / 6: {STEPS[activeStep - 1].label}</span>
                <span className="text-neutral-400 font-mono">%{Math.round((activeStep / 6) * 100)}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-neutral-100 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-300"
                  style={{ width: `${(activeStep / 6) * 100}%` }}
                />
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-1">
                {STEPS.map(step => (
                  <button
                    key={step.num}
                    onClick={() => setActiveStep(step.num)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition ${
                      activeStep === step.num
                        ? 'bg-neutral-900 text-white'
                        : activeStep > step.num
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-neutral-100 text-neutral-500'
                    }`}
                  >
                    {step.num}. {step.label.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Form Content Card */}
          <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-sm p-5 sm:p-8">
            {/* STEP 1: KATALOG BİLGİLERİ */}
            {activeStep === 1 && (
              <div className="space-y-6 max-w-3xl">
                <div className="border-b border-neutral-100 pb-4">
                  <h3 className="text-lg font-extrabold text-neutral-900 flex items-center gap-2">
                    <FileText size={20} className="text-amber-600" />
                    <span>1. Katalog Temel Bilgileri</span>
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    Kataloğunuzun başlığı, kapak yazıları ve sayfa yerleşim formatını belirleyin.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-neutral-800">Katalog Resmi Adı *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Örn: Bien Seramik 2026 Koleksiyon Kataloğu"
                      className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-800">Kapak Ana Başlığı</label>
                    <input
                      type="text"
                      value={formData.coverTitle}
                      onChange={e => setFormData({ ...formData, coverTitle: e.target.value })}
                      placeholder="Kapakta büyük puntoyla yer alacak başlık"
                      className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-800">Kapak Alt Başlığı</label>
                    <input
                      type="text"
                      value={formData.coverSubtitle}
                      onChange={e => setFormData({ ...formData, coverSubtitle: e.target.value })}
                      placeholder="Örn: Lüks Porselen & Seramik Seçkisi"
                      className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-neutral-800">Giriş / Önsöz Metni</label>
                    <textarea
                      rows={3}
                      value={formData.introText}
                      onChange={e => setFormData({ ...formData, introText: e.target.value })}
                      placeholder="Koleksiyon önsözü veya mimari marka manifestosu..."
                      className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                  </div>

                  {/* Orientation Cards */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-800">Sayfa Yönlendirmesi</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, orientation: 'portrait' })}
                        className={`p-3 rounded-xl border-2 text-left transition flex items-center gap-3 ${
                          formData.orientation === 'portrait'
                            ? 'border-amber-500 bg-amber-50/50 text-amber-950 font-bold'
                            : 'border-neutral-200 bg-neutral-50 text-neutral-600'
                        }`}
                      >
                        <div className="w-6 h-8 rounded border-2 border-current flex items-center justify-center flex-shrink-0">
                          <span className="text-[8px]">A4</span>
                        </div>
                        <div>
                          <p className="text-xs font-bold">Dikey (Portrait)</p>
                          <p className="text-[10px] text-neutral-400">Klasik dergi / föy</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, orientation: 'landscape' })}
                        className={`p-3 rounded-xl border-2 text-left transition flex items-center gap-3 ${
                          formData.orientation === 'landscape'
                            ? 'border-amber-500 bg-amber-50/50 text-amber-950 font-bold'
                            : 'border-neutral-200 bg-neutral-50 text-neutral-600'
                        }`}
                      >
                        <div className="w-8 h-6 rounded border-2 border-current flex items-center justify-center flex-shrink-0">
                          <span className="text-[8px]">A4</span>
                        </div>
                        <div>
                          <p className="text-xs font-bold">Yatay (Landscape)</p>
                          <p className="text-[10px] text-neutral-400">Geniş pafta</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Language Selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-800">Katalog Dili</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, language: 'tr' })}
                        className={`p-3 rounded-xl border-2 text-left transition flex items-center gap-2.5 ${
                          formData.language === 'tr'
                            ? 'border-amber-500 bg-amber-50/50 text-amber-950 font-bold'
                            : 'border-neutral-200 bg-neutral-50 text-neutral-600'
                        }`}
                      >
                        <span className="text-base">🇹🇷</span>
                        <div>
                          <p className="text-xs font-bold">Türkçe</p>
                          <p className="text-[10px] text-neutral-400">İç Pazar & Bayiler</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, language: 'en' })}
                        className={`p-3 rounded-xl border-2 text-left transition flex items-center gap-2.5 ${
                          formData.language === 'en'
                            ? 'border-amber-500 bg-amber-50/50 text-amber-950 font-bold'
                            : 'border-neutral-200 bg-neutral-50 text-neutral-600'
                        }`}
                      >
                        <span className="text-base">🇬🇧</span>
                        <div>
                          <p className="text-xs font-bold">English</p>
                          <p className="text-[10px] text-neutral-400">Export & B2B</p>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: ÜRÜN SEÇİMİ & SIRALAMA */}
            {activeStep === 2 && (
              <div className="space-y-6">
                <div className="border-b border-neutral-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-extrabold text-neutral-900 flex items-center gap-2">
                      <Layers size={20} className="text-amber-600" />
                      <span>2. Ürün Portföyünden Seçim Yapın</span>
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1">
                      Kataloğa dahil etmek istediğiniz seramikleri tıklayarak seçin.
                    </p>
                  </div>
                  <span className="text-xs font-bold px-3.5 py-1.5 bg-amber-100 text-amber-900 rounded-full border border-amber-200 self-start sm:self-center">
                    {formData.selectedItems.length} Ürün Seçildi
                  </span>
                </div>

                {/* Filter and Search */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="relative">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      value={productSearch}
                      onChange={e => setProductSearch(e.target.value)}
                      placeholder="Seramik adı, kodu veya rengi ile filtrele..."
                      className="w-full pl-9 pr-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                  </div>

                  <select
                    value={productCategoryFilter}
                    onChange={e => setProductCategoryFilter(e.target.value)}
                    className="px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  >
                    <option value="all">Tüm Kategoriler ({availableProducts.length})</option>
                    {productCategories.filter(c => c !== 'all').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Product Selection Grid */}
                <div className="border border-neutral-200 rounded-2xl p-4 bg-neutral-50 max-h-80 overflow-y-auto">
                  {productsLoading ? (
                    <div className="py-12 text-center text-neutral-500">
                      <Loader2 size={24} className="animate-spin text-amber-500 mx-auto mb-2" />
                      <p className="text-xs font-bold">Ürünler taranıyor...</p>
                    </div>
                  ) : filteredAvailableProducts.length === 0 ? (
                    <div className="py-12 text-center text-neutral-500 text-xs">
                      Eşleşen ürün bulunamadı.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {filteredAvailableProducts.map(p => {
                        const isSelected = formData.selectedItems.some(i => i.productId === p.id);
                        return (
                          <div
                            key={p.id}
                            onClick={() => handleToggleProduct(p)}
                            className={`p-2.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                              isSelected
                                ? 'border-amber-500 bg-amber-50 shadow-sm ring-2 ring-amber-500/20'
                                : 'border-neutral-200 bg-white hover:border-neutral-300'
                            }`}
                          >
                            <div className="aspect-square rounded-lg bg-neutral-100 overflow-hidden mb-2 relative">
                              <img
                                src={p.imageUrl || p.textureUrl || '/placeholder.png'}
                                alt={p.name}
                                className="w-full h-full object-cover"
                              />
                              {isSelected && (
                                <div className="absolute top-1.5 right-1.5 bg-amber-500 text-neutral-950 font-bold rounded-full p-1 shadow">
                                  <Check size={12} />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-neutral-800 truncate">{p.name}</p>
                              <p className="text-[10px] text-neutral-500 font-mono mt-0.5">{p.width}x{p.height} cm</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Selected Products Order */}
                {formData.selectedItems.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                      Katalog Sayfa Sıralaması
                    </h4>
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {formData.selectedItems.map((item, idx) => {
                        const p = availableProducts.find(prod => prod.id === item.productId) || {};
                        return (
                          <div
                            key={item.productId}
                            className="p-3 bg-white border border-neutral-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-6 text-xs font-mono font-bold text-neutral-400">
                                #{(idx + 1).toString().padStart(2, '0')}
                              </span>
                              <img
                                src={p.imageUrl || p.textureUrl || '/placeholder.png'}
                                alt=""
                                className="w-10 h-10 rounded-lg object-cover border border-neutral-200 flex-shrink-0"
                              />
                              <div>
                                <p className="text-xs font-bold text-neutral-800 truncate max-w-xs">{p.name}</p>
                                <p className="text-[10px] text-neutral-500 font-mono">
                                  {p.width && p.height ? `${p.width}x${p.height} cm` : ''} &bull; Kod: {p.code || '-'}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 w-full sm:w-auto">
                              <input
                                type="text"
                                value={item.customNote || ''}
                                onChange={e => handleUpdateProductNote(idx, e.target.value)}
                                placeholder="Örn: 2026 Trend Banyo Serisi"
                                className="flex-1 sm:w-64 px-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                              />

                              <div className="flex items-center gap-1 flex-shrink-0">
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={() => handleMoveProduct(idx, -1)}
                                  className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-100 disabled:opacity-30 text-neutral-600"
                                >
                                  <MoveUp size={14} />
                                </button>
                                <button
                                  type="button"
                                  disabled={idx === formData.selectedItems.length - 1}
                                  onClick={() => handleMoveProduct(idx, 1)}
                                  className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-100 disabled:opacity-30 text-neutral-600"
                                >
                                  <MoveDown size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleToggleProduct(p)}
                                  className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: ŞABLON SEÇİMİ */}
            {activeStep === 3 && (
              <div className="space-y-6 max-w-4xl">
                <div className="border-b border-neutral-100 pb-4">
                  <h3 className="text-lg font-extrabold text-neutral-900 flex items-center gap-2">
                    <LayoutTemplate size={20} className="text-amber-600" />
                    <span>3. Profesyonel Tasarım Şablonu</span>
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    Seramik sektörünün 4 ana hedef kitlesi için hazırlanmış prestijli şablonlardan birini seçin.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {TEMPLATES.map(tpl => {
                    const isSelected = formData.template === tpl.id;
                    const Icon = tpl.icon;

                    return (
                      <div
                        key={tpl.id}
                        onClick={() => setFormData({ ...formData, template: tpl.id })}
                        className={`rounded-2xl border-2 cursor-pointer transition-all overflow-hidden flex flex-col justify-between ${
                          isSelected
                            ? 'border-amber-500 bg-amber-50/40 shadow-xl ring-2 ring-amber-500/20'
                            : 'border-neutral-200 hover:border-neutral-300 bg-white'
                        }`}
                      >
                        {/* Mini mockup banner */}
                        <div
                          className="h-28 w-full p-4 flex flex-col justify-between text-white relative"
                          style={{
                            background: `linear-gradient(135deg, rgba(9, 13, 22, 0.9) 0%, rgba(17, 24, 39, 0.75) 100%), url(${tpl.mockupImg}) center/cover no-repeat`,
                            backgroundColor: '#0f172a'
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-black/50 backdrop-blur-md uppercase text-amber-300">
                              {tpl.tag}
                            </span>
                            {isSelected && (
                              <span className="w-5 h-5 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center font-bold text-xs shadow">
                                <Check size={12} />
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-serif font-light text-white">{tpl.name}</p>
                        </div>

                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <p className="text-xs text-neutral-600 leading-relaxed mb-3">
                            {tpl.desc}
                          </p>
                          <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs font-bold">
                            <span style={{ color: tpl.accent }}>
                              {isSelected ? '✓ Seçili Şablon' : 'Bu Şablonu Uygula'}
                            </span>
                            <span className="text-neutral-400 font-normal">A4 Ultra HD</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 4: KURUMSAL KİMLİK */}
            {activeStep === 4 && (
              <div className="space-y-6 max-w-3xl">
                <div className="border-b border-neutral-100 pb-4">
                  <h3 className="text-lg font-extrabold text-neutral-900 flex items-center gap-2">
                    <Palette size={20} className="text-amber-600" />
                    <span>4. Kurumsal Kimlik & İletişim Bilgileri</span>
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    Katalog kapağı ve arka sayfada yer alacak logo, kurumsal renk ve resmi irtibat bilgilerini girin.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-neutral-800">Marka Logo Görseli URL</label>
                    <input
                      type="text"
                      value={formData.customLogoUrl}
                      onChange={e => setFormData({ ...formData, customLogoUrl: e.target.value })}
                      placeholder="https://... logo.png (Boş bırakılırsa profil logonuz kullanılır)"
                      className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-neutral-800">Katalog Ana Vurgu Rengi</label>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {COLOR_PRESETS.map(preset => (
                        <button
                          key={preset.hex}
                          type="button"
                          onClick={() => setFormData({ ...formData, primaryColor: preset.hex })}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-2 transition ${
                            formData.primaryColor === preset.hex
                              ? 'border-neutral-900 bg-neutral-900 text-white shadow-sm'
                              : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                          }`}
                        >
                          <span className="w-3.5 h-3.5 rounded-full border border-black/10" style={{ backgroundColor: preset.hex }} />
                          <span>{preset.name}</span>
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={formData.primaryColor}
                        onChange={e => setFormData({ ...formData, primaryColor: e.target.value })}
                        className="w-10 h-10 rounded-xl cursor-pointer border border-neutral-300 p-0.5 bg-white"
                      />
                      <input
                        type="text"
                        value={formData.primaryColor}
                        onChange={e => setFormData({ ...formData, primaryColor: e.target.value })}
                        className="w-40 px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-800">Web Sitesi</label>
                    <input
                      type="text"
                      value={formData.websiteUrl}
                      onChange={e => setFormData({ ...formData, websiteUrl: e.target.value })}
                      placeholder="www.markaniz.com"
                      className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm font-medium focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-800">Telefon / Proje Hattı</label>
                    <input
                      type="text"
                      value={formData.contactPhone}
                      onChange={e => setFormData({ ...formData, contactPhone: e.target.value })}
                      placeholder="+90 (212) 000 00 00"
                      className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm font-medium focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-800">İletişim E-Posta</label>
                    <input
                      type="email"
                      value={formData.contactEmail}
                      onChange={e => setFormData({ ...formData, contactEmail: e.target.value })}
                      placeholder="proje@markaniz.com"
                      className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm font-medium focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-800">Fabrika / Showroom Adresi</label>
                    <input
                      type="text"
                      value={formData.contactAddress}
                      onChange={e => setFormData({ ...formData, contactAddress: e.target.value })}
                      placeholder="Organize Sanayi Bölgesi, Seramik Cad. No:1, Türkiye"
                      className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm font-medium focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: GÖRÜNÜRLÜK */}
            {activeStep === 5 && (
              <div className="space-y-6 max-w-3xl">
                <div className="border-b border-neutral-100 pb-4">
                  <h3 className="text-lg font-extrabold text-neutral-900 flex items-center gap-2">
                    <Sliders size={20} className="text-amber-600" />
                    <span>5. Görünürlük & İçerik Ayarları</span>
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    Kataloğunuzda hangi bilgilerin yer alacağını belirleyin.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'showPrices', label: 'm² Liste Fiyatlarını Göster', desc: 'Perakende tavsiye edilen liste fiyatlarını sayfalarda yayınla' },
                    { key: 'showSpecs', label: 'Teknik Parametre Tablosu', desc: 'PEI aşınma, R kaymazlık, kalınlık, rektifiye bilgileri' },
                    { key: 'showCodes', label: 'Ürün ve Poz Kodları', desc: 'Her seramiğin resmi sipariş ve mimari poz kodunu belirt' },
                    { key: 'showDescriptions', label: 'Ürün Açıklamaları & Notlar', desc: 'Seramik koleksiyon açıklamalarını veya özel notları yerleştir' },
                    { key: 'showQrCodes', label: 'Mekânımda Gör 3D QR Kodu', desc: 'Telefon kamerasıyla okutulduğunda 3D Studio açan QR kod' },
                    { key: 'showCover', label: 'Lüks Kapak Sayfası', desc: 'Görsel ve marka başlıklı ana kapak sayfası ekle' },
                    { key: 'showTOC', label: 'İçindekiler & Fihrist Sayfası', desc: 'Koleksiyon genel matrisi ve sayfa listesi ekle' },
                    { key: 'showContactPage', label: 'Arka İletişim Sayfası', desc: 'Telefon, e-posta, showroom ve web adresi sayfası' },
                    { key: 'showPageNumbers', label: 'Sayfa Numaralandırması', desc: 'A4 sayfaların alt kısmında resmi numaralandırma' },
                  ].map(toggle => (
                    <label
                      key={toggle.key}
                      className={`p-4 rounded-xl border-2 cursor-pointer flex items-start gap-3.5 transition ${
                        Boolean(formData[toggle.key])
                          ? 'border-amber-500 bg-amber-50/30'
                          : 'border-neutral-200 bg-white hover:border-neutral-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={Boolean(formData[toggle.key])}
                        onChange={e => setFormData({ ...formData, [toggle.key]: e.target.checked })}
                        className="mt-0.5 w-4 h-4 text-amber-600 rounded border-neutral-300 focus:ring-amber-500"
                      />
                      <div>
                        <p className="text-xs font-bold text-neutral-800">{toggle.label}</p>
                        <p className="text-[11px] text-neutral-500 mt-0.5 leading-relaxed">{toggle.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 6: CANLI İNTERAKTİF FLIPBOOK TESTİ & YAYINLAMA */}
            {activeStep === 6 && (
              <div className="space-y-6">
                <div className="border-b border-neutral-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-extrabold text-neutral-900 flex items-center gap-2">
                      <Sparkles size={20} className="text-amber-600" />
                      <span>6. Canlı E-Katalog & Flipbook Önizleme</span>
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1">
                      Kataloğunuzu birebir sayfa sayfa çevirerek test edin; dilerseniz taslak kaydedin veya yayına alarak paylaşın.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSaveCatalog(false)}
                      disabled={saving}
                      className="px-4 py-2 border border-neutral-300 rounded-xl text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition"
                    >
                      {saving ? 'Kaydediliyor...' : 'Taslak Kaydet'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveCatalog(true)}
                      disabled={saving}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition"
                    >
                      {saving ? 'Yayınlanıyor...' : 'Kataloğu Yayınla'}
                    </button>
                  </div>
                </div>

                {/* Flipbook Container */}
                <div className="w-full">
                  <CatalogTemplateRenderer
                    catalog={{
                      ...formData,
                      brand: brandInfo,
                    }}
                    products={formData.selectedItems.map((item, idx) => {
                      const p = availableProducts.find(prod => prod.id === item.productId) || {};
                      return {
                        ...p,
                        customNote: item.customNote,
                        productUrl: `https://www.seramikbak.com/urun/${p.slug}`,
                        tryInRoomUrl: `https://www.seramikbak.com/urun/${p.slug}?studio=3d`,
                      };
                    })}
                    mode="preview"
                  />
                </div>
              </div>
            )}

            {/* Stepper Bottom Action Buttons */}
            <div className="mt-8 pt-5 border-t border-neutral-100 flex items-center justify-between">
              <button
                type="button"
                disabled={activeStep === 1}
                onClick={() => setActiveStep(prev => Math.max(1, prev - 1))}
                className="px-4 py-2.5 rounded-xl border border-neutral-300 text-xs font-bold text-neutral-700 hover:bg-neutral-50 disabled:opacity-30 transition flex items-center gap-1.5"
              >
                <ArrowLeft size={14} />
                <span>Önceki Adım</span>
              </button>

              {activeStep < 6 ? (
                <button
                  type="button"
                  onClick={() => setActiveStep(prev => Math.min(6, prev + 1))}
                  className="px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow"
                >
                  <span>Sonraki Adım</span>
                  <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSaveCatalog(true)}
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-extrabold transition flex items-center gap-1.5 shadow-md"
                >
                  <Sparkles size={14} />
                  <span>Kataloğu Tamamla & Yayınla</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW MODE 3: FULLSCREEN PRESENTATION MODAL */}
      {/* ========================================================================= */}
      {viewMode === 'preview-modal' && previewCatalog && (
        <div className="fixed inset-0 z-50 bg-neutral-950 flex flex-col">
          {/* Top Floating Control Bar */}
          <div className="bg-neutral-950 border-b border-white/10 px-4 sm:px-6 py-3 flex items-center justify-between text-white no-print">
            <div className="flex items-center gap-3 overflow-hidden">
              <span className="font-serif font-bold text-base tracking-wide text-amber-300 truncate max-w-xs">
                {previewCatalog.title}
              </span>
              <span className="text-xs text-neutral-400 font-mono hidden sm:inline">
                ({previewProducts.length} Ürün &bull; {previewCatalog.template.toUpperCase()})
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <button
                onClick={() => handleCopyLink(previewCatalog.publicSlug)}
                className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition"
              >
                <Share2 size={14} />
                <span>Paylaş</span>
              </button>

              <button
                onClick={() => setViewMode('list')}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white transition"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Interactive Flipbook Container */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-neutral-900 flex items-center justify-center">
            <CatalogTemplateRenderer
              catalog={previewCatalog}
              products={previewProducts}
              mode="preview"
            />
          </div>
        </div>
      )}
    </div>
  );
}
