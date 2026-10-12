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
  Box
} from 'lucide-react';
import CatalogTemplateRenderer from './catalog/templates/CatalogTemplateRenderer';

const TEMPLATES = [
  {
    id: 'milano',
    name: 'Minimalist Milano Lookbook',
    badge: 'Editorial & Lüks Tasarım',
    desc: 'İtalyan Cersaie dergi estetiği. Geniş boşluklar, seramik mimari fotoğrafları, şık tipografi ve 3D QR kodları.',
    accent: '#b4823c',
    icon: Sparkles,
  },
  {
    id: 'spec-sheet',
    name: 'Mimari Teknik Föy & Şartname',
    badge: 'TS EN 14411 & BIM',
    desc: 'Mimarlar, mühendisler ve kamu ihaleleri için yapılandırılmış teknik tablo. Aşınma PEI, kaymazlık R, kutu/palet metrajı.',
    accent: '#0284c7',
    icon: Layers,
  },
  {
    id: 'showroom',
    name: 'Showroom & Koleksiyon Rehberi',
    badge: 'Perakende & Bayi Satış',
    desc: 'Bayi teşhir ve perakende satış ekipleri için 2 ürün/sayfa düzeni. Önerilen mekânlar, derz eşleşmeleri ve perakende etiketleri.',
    accent: '#d97706',
    icon: Building,
  },
  {
    id: 'global-export',
    name: 'Global İhracat & B2B Matrisi',
    badge: 'Konteyner & Lojistik',
    desc: 'Yurtdışı distribütörler ve ihracat fuarları için çok dilli (EN) format. 20ft/40ft konteyner tonajı, GTİP 6907 ve CE uyumluluğu.',
    accent: '#2563eb',
    icon: Globe,
  },
];

export default function CatalogStudioTab({ brandInfo }) {
  // Navigation: 'list' | 'editor' | 'preview-modal'
  const [viewMode, setViewMode] = useState('list');
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
    selectedItems: [], // array of { productId, customNote, usageArea }
    isPublished: false,
    isDraft: true,
    publicSlug: '',
  });

  // Modal preview state
  const [previewCatalog, setPreviewCatalog] = useState(null);
  const [previewProducts, setPreviewProducts] = useState([]);
  const [previewLoading, setPreviewLoading] = useState(false);

  const brandId = brandInfo?.id;

  // Load catalogs on mount
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

  // Start new catalog creation
  const handleStartNew = () => {
    setActiveCatalogId(null);
    setFormData({
      title: `${brandInfo?.name || 'Marka'} ${new Date().getFullYear()} Koleksiyon Kataloğu`,
      description: 'Mimari ve perakende kullanım için özenle seçilmiş seramik koleksiyonu.',
      coverTitle: `${brandInfo?.name || 'SERAMİK'} ${new Date().getFullYear()}`,
      coverSubtitle: 'Lüks Porselen & Seramik Seçkisi',
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
      selectedItems: [],
      isPublished: false,
      isDraft: true,
      publicSlug: '',
    });
    setActiveStep(1);
    setViewMode('editor');
  };

  // Edit existing catalog
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

  // Open Full Preview
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

  // Duplicate Catalog
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

  // Delete Catalog
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

  // Toggle Product Selection in Wizard Step 2
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

  // Save or Publish
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

  // Copy Public Link
  const handleCopyLink = (slug) => {
    const url = `${window.location.origin}/katalog/${slug}`;
    navigator.clipboard.writeText(url);
    alert('Katalog web bağlantısı panoya kopyalandı:\n' + url);
  };

  // Trigger Print to PDF
  const handlePrint = () => {
    window.print();
  };

  // Filtered Catalogs
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

  // Unique product categories for filter
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

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-amber-950 text-white p-6 md:p-8 rounded-2xl shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-medium border border-amber-500/30 mb-2">
              <BookOpen size={13} />
              <span>Catalog Studio &bull; Dijital Yayıncılık</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Dijital Katalog & Lookbook Oluşturucu
            </h1>
            <p className="text-sm text-neutral-300 mt-1 max-w-2xl">
              Portföyünüzdeki seramikleri İtalyan mimari dergi, teknik şartname veya showroom şablonlarına dönüştürün. Canlı QR kodları ile doğrudan 3D Studio'ya bağlayın.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {viewMode === 'list' && (
              <button
                onClick={handleStartNew}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-sm flex items-center gap-2 shadow-lg transition-all transform hover:-translate-y-0.5"
              >
                <Plus size={18} />
                <span>Yeni Katalog Oluştur</span>
              </button>
            )}
            {viewMode !== 'list' && (
              <button
                onClick={() => setViewMode('list')}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-sm flex items-center gap-2 transition"
              >
                <ArrowLeft size={16} />
                <span>Kataloglarıma Dön</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-600 hover:text-emerald-800">
            <X size={16} />
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-rose-600" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')} className="text-rose-600 hover:text-rose-800">
            <X size={16} />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW MODE 1: CATALOG LIST */}
      {/* ========================================================================= */}
      {viewMode === 'list' && (
        <div className="space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
              <span className="text-xs text-neutral-500 font-medium">Toplam Katalog</span>
              <p className="text-2xl font-bold text-neutral-900 mt-1">{catalogs.length}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
              <span className="text-xs text-emerald-600 font-medium">Yayında Olanlar</span>
              <p className="text-2xl font-bold text-emerald-600 mt-1">
                {catalogs.filter(c => c.isPublished).length}
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
              <span className="text-xs text-neutral-500 font-medium">Web Görüntülenme</span>
              <p className="text-2xl font-bold text-neutral-900 mt-1">
                {catalogs.reduce((acc, c) => acc + (c.viewCount || 0), 0)}
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
              <span className="text-xs text-blue-600 font-medium">PDF İndirilme</span>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {catalogs.reduce((acc, c) => acc + (c.downloadCount || 0), 0)}
              </p>
            </div>
          </div>

          {/* Filtering & Search Bar */}
          <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <button
                onClick={() => setFilterTab('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  filterTab === 'all'
                    ? 'bg-neutral-900 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                Tümü ({catalogs.length})
              </button>
              <button
                onClick={() => setFilterTab('published')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  filterTab === 'published'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                Yayınlananlar ({catalogs.filter(c => c.isPublished).length})
              </button>
              <button
                onClick={() => setFilterTab('draft')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  filterTab === 'draft'
                    ? 'bg-amber-600 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                Taslaklar ({catalogs.filter(c => !c.isPublished).length})
              </button>
            </div>

            <div className="relative w-full md:w-72">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Katalog ara..."
                className="w-full pl-9 pr-4 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>
          </div>

          {/* Catalog Cards Grid */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-neutral-500">
              <Loader2 size={32} className="animate-spin text-amber-500 mb-2" />
              <p className="text-sm">Kataloglar yükleniyor...</p>
            </div>
          ) : filteredCatalogs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-neutral-300 p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
                <BookOpen size={28} />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-1">
                Henüz Dijital Katalog Oluşturulmadı
              </h3>
              <p className="text-sm text-neutral-500 max-w-md mx-auto mb-6">
                Ürün portföyünüzden seramikleri seçerek mimari şartname, lookbook veya bayi satış kataloğu oluşturabilirsiniz.
              </p>
              <button
                onClick={handleStartNew}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-sm inline-flex items-center gap-2 shadow"
              >
                <Plus size={18} />
                <span>İlk Kataloğunuzu Oluşturun</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCatalogs.map(cat => {
                const tplInfo = TEMPLATES.find(t => t.id === cat.template) || TEMPLATES[0];
                const TplIcon = tplInfo.icon;

                return (
                  <div
                    key={cat.id}
                    className="bg-white rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                  >
                    {/* Top banner / template indicator */}
                    <div className="p-5 border-b border-neutral-100 flex items-start justify-between bg-neutral-50/50">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm"
                          style={{ backgroundColor: tplInfo.accent }}
                        >
                          <TplIcon size={18} />
                        </div>
                        <div>
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                            {tplInfo.name}
                          </span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-neutral-400 font-mono">
                              {cat.orientation === 'landscape' ? 'Yatay (A4)' : 'Dikey (A4)'}
                            </span>
                            <span className="text-neutral-300">&bull;</span>
                            <span className="text-xs text-neutral-500 font-medium">
                              {cat.itemCount || 0} Ürün
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Status badge */}
                      <span
                        className={`text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                          cat.isPublished
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {cat.isPublished ? 'Yayında' : 'Taslak'}
                      </span>
                    </div>

                    {/* Middle Info */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-base font-bold text-neutral-900 group-hover:text-amber-600 transition mb-1">
                          {cat.title}
                        </h3>
                        {cat.description && (
                          <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed mb-4">
                            {cat.description}
                          </p>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="pt-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                        <span>Görüntülenme: <strong className="text-neutral-800">{cat.viewCount || 0}</strong></span>
                        <span>İndirilme: <strong className="text-neutral-800">{cat.downloadCount || 0}</strong></span>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="p-3 bg-neutral-50 border-t border-neutral-100 grid grid-cols-4 gap-1 text-xs">
                      <button
                        onClick={() => handleOpenPreview(cat)}
                        title="Canlı Önizle & PDF"
                        className="py-1.5 px-2 rounded-lg bg-white border border-neutral-200 hover:bg-neutral-100 text-neutral-700 flex flex-col items-center justify-center gap-1 transition"
                      >
                        <Eye size={14} />
                        <span className="text-[10px]">Önizle</span>
                      </button>

                      <button
                        onClick={() => handleEdit(cat)}
                        title="Düzenle"
                        className="py-1.5 px-2 rounded-lg bg-white border border-neutral-200 hover:bg-neutral-100 text-neutral-700 flex flex-col items-center justify-center gap-1 transition"
                      >
                        <Edit size={14} />
                        <span className="text-[10px]">Düzenle</span>
                      </button>

                      <button
                        onClick={() => handleCopyLink(cat.publicSlug)}
                        title="Web Linkini Paylaş"
                        className="py-1.5 px-2 rounded-lg bg-white border border-neutral-200 hover:bg-neutral-100 text-neutral-700 flex flex-col items-center justify-center gap-1 transition"
                      >
                        <Share2 size={14} />
                        <span className="text-[10px]">Paylaş</span>
                      </button>

                      <div className="relative group/menu flex items-center justify-center">
                        <button
                          onClick={() => handleDuplicate(cat)}
                          title="Kopyasını Çoğalt"
                          className="w-full py-1.5 px-2 rounded-lg bg-white border border-neutral-200 hover:bg-neutral-100 text-neutral-700 flex flex-col items-center justify-center gap-1 transition"
                        >
                          <Copy size={14} />
                          <span className="text-[10px]">Kopya</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW MODE 2: 6-STEP WIZARD EDITOR */}
      {/* ========================================================================= */}
      {viewMode === 'editor' && (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
          {/* Wizard Step Navigation */}
          <div className="bg-neutral-50 border-b border-neutral-200 p-4">
            <div className="flex items-center justify-between max-w-4xl mx-auto overflow-x-auto gap-2">
              {[
                { num: 1, label: 'Katalog Bilgileri' },
                { num: 2, label: `Ürün Seçimi (${formData.selectedItems.length})` },
                { num: 3, label: 'Şablon Seçimi' },
                { num: 4, label: 'Kurumsal Kimlik' },
                { num: 5, label: 'Görünürlük' },
                { num: 6, label: 'Önizleme & Yayın' },
              ].map(step => (
                <button
                  key={step.num}
                  onClick={() => setActiveStep(step.num)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                    activeStep === step.num
                      ? 'bg-neutral-900 text-white shadow'
                      : activeStep > step.num
                      ? 'bg-amber-100 text-amber-800'
                      : 'text-neutral-500 hover:bg-neutral-200'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                      activeStep === step.num
                        ? 'bg-amber-500 text-neutral-950 font-bold'
                        : activeStep > step.num
                        ? 'bg-amber-600 text-white'
                        : 'bg-neutral-300 text-neutral-600'
                    }`}
                  >
                    {step.num}
                  </span>
                  <span>{step.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Wizard Body */}
          <div className="p-6 md:p-8 max-w-4xl mx-auto">
            {/* STEP 1: KATALOG BİLGİLERİ */}
            {activeStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-neutral-900">1. Katalog Temel Bilgileri</h2>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Kataloğunuzun başlık, kapak ve sayfa yönlendirme ayarlarını belirleyin.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-semibold text-neutral-700">Katalog Başlığı *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Örn: 2026 Mimari Porselen & Banyo Kataloğu"
                      className="w-full px-4 py-2 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-700">Kapak Başlığı</label>
                    <input
                      type="text"
                      value={formData.coverTitle}
                      onChange={e => setFormData({ ...formData, coverTitle: e.target.value })}
                      placeholder="Kapakta büyük puntoyla yer alacak başlık"
                      className="w-full px-4 py-2 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-700">Kapak Alt Başlığı</label>
                    <input
                      type="text"
                      value={formData.coverSubtitle}
                      onChange={e => setFormData({ ...formData, coverSubtitle: e.target.value })}
                      placeholder="Örn: Özel Mimari ve İç Mekân Seçkisi"
                      className="w-full px-4 py-2 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-semibold text-neutral-700">Giriş / Önsöz Metni</label>
                    <textarea
                      rows={3}
                      value={formData.introText}
                      onChange={e => setFormData({ ...formData, introText: e.target.value })}
                      placeholder="Kataloğun girişinde yer alacak marka manifestosu veya koleksiyon açıklaması..."
                      className="w-full px-4 py-2 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-700">Sayfa Yönlendirmesi</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, orientation: 'portrait' })}
                        className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition ${
                          formData.orientation === 'portrait'
                            ? 'border-amber-500 bg-amber-50 text-amber-900'
                            : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                        }`}
                      >
                        <span>Dikey (Portrait)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, orientation: 'landscape' })}
                        className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition ${
                          formData.orientation === 'landscape'
                            ? 'border-amber-500 bg-amber-50 text-amber-900'
                            : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                        }`}
                      >
                        <span>Yatay (Landscape)</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-700">Katalog Dili</label>
                    <select
                      value={formData.language}
                      onChange={e => setFormData({ ...formData, language: e.target.value })}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="tr">Türkçe (Standart)</option>
                      <option value="en">İngilizce (International)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: ÜRÜN SEÇİMİ & SIRALAMA */}
            {activeStep === 2 && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-neutral-900">2. Ürün Portföyünden Seçim Yapın</h2>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Kataloğa dahil etmek istediğiniz seramikleri tıklayarak seçin ve aşağıdan sıralarını belirleyin.
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 bg-amber-100 text-amber-900 rounded-full">
                    {formData.selectedItems.length} Ürün Seçildi
                  </span>
                </div>

                {/* Filter and Search */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      value={productSearch}
                      onChange={e => setProductSearch(e.target.value)}
                      placeholder="Ürün adı, kodu veya rengi ile ara..."
                      className="w-full pl-9 pr-4 py-2 border border-neutral-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <select
                    value={productCategoryFilter}
                    onChange={e => setProductCategoryFilter(e.target.value)}
                    className="px-4 py-2 border border-neutral-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="all">Tüm Kategoriler ({availableProducts.length})</option>
                    {productCategories.filter(c => c !== 'all').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Product Selection Grid */}
                <div className="border border-neutral-200 rounded-2xl p-4 bg-neutral-50/50 max-h-72 overflow-y-auto">
                  {productsLoading ? (
                    <div className="py-12 text-center text-neutral-500">
                      <Loader2 size={24} className="animate-spin text-amber-500 mx-auto mb-2" />
                      <p className="text-xs">Ürünler taranıyor...</p>
                    </div>
                  ) : filteredAvailableProducts.length === 0 ? (
                    <div className="py-12 text-center text-neutral-500 text-xs">
                      Eşleşen ürün bulunamadı.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {filteredAvailableProducts.map(p => {
                        const isSelected = formData.selectedItems.some(i => i.productId === p.id);
                        return (
                          <div
                            key={p.id}
                            onClick={() => handleToggleProduct(p)}
                            className={`p-2.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                              isSelected
                                ? 'border-amber-500 bg-amber-50/80 shadow-sm ring-2 ring-amber-500/20'
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
                                <div className="absolute top-1.5 right-1.5 bg-amber-500 text-white rounded-full p-0.5">
                                  <CheckCircle2 size={14} />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-neutral-800 truncate">{p.name}</p>
                              <p className="text-[10px] text-neutral-500 font-mono">{p.width}x{p.height} cm</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Selected Products Order & Custom Notes */}
                {formData.selectedItems.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-neutral-800">
                      Katalog Sayfa Sıralaması ve Özel Notlar
                    </h3>
                    <div className="space-y-2">
                      {formData.selectedItems.map((item, idx) => {
                        const p = availableProducts.find(prod => prod.id === item.productId) || {};
                        return (
                          <div
                            key={item.productId}
                            className="p-3 bg-white border border-neutral-200 rounded-xl flex items-center justify-between gap-4"
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-6 text-xs font-mono font-bold text-neutral-400">
                                #{(idx + 1).toString().padStart(2, '0')}
                              </span>
                              <img
                                src={p.imageUrl || p.textureUrl || '/placeholder.png'}
                                alt=""
                                className="w-10 h-10 rounded-lg object-cover border border-neutral-200"
                              />
                              <div>
                                <p className="text-xs font-semibold text-neutral-800">{p.name}</p>
                                <p className="text-[10px] text-neutral-500 font-mono">
                                  {p.width && p.height ? `${p.width}x${p.height} cm` : ''} &bull; Kod: {p.code || '-'}
                                </p>
                              </div>
                            </div>

                            <div className="flex-1 max-w-xs">
                              <input
                                type="text"
                                value={item.customNote || ''}
                                onChange={e => handleUpdateProductNote(idx, e.target.value)}
                                placeholder="Örn: 2026 Trend Banyo Serisi"
                                className="w-full px-2.5 py-1 text-xs border border-neutral-200 rounded-lg focus:ring-1 focus:ring-amber-500"
                              />
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleMoveProduct(idx, -1)}
                                className="p-1 rounded hover:bg-neutral-100 disabled:opacity-30 text-neutral-600"
                              >
                                <MoveUp size={15} />
                              </button>
                              <button
                                type="button"
                                disabled={idx === formData.selectedItems.length - 1}
                                onClick={() => handleMoveProduct(idx, 1)}
                                className="p-1 rounded hover:bg-neutral-100 disabled:opacity-30 text-neutral-600"
                              >
                                <MoveDown size={15} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleProduct(p)}
                                className="p-1 rounded hover:bg-rose-50 text-rose-600 ml-1"
                              >
                                <Trash2 size={15} />
                              </button>
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
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-neutral-900">3. Profesyonel Tasarım Şablonu</h2>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Seramik sektörünün farklı hedef kitleleri (iç mimarlar, ihaleler, bayiler, ihracat) için optimize edilmiş 4 ana şablondan birini seçin.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {TEMPLATES.map(tpl => {
                    const isSelected = formData.template === tpl.id;
                    const Icon = tpl.icon;

                    return (
                      <div
                        key={tpl.id}
                        onClick={() => setFormData({ ...formData, template: tpl.id })}
                        className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'border-amber-500 bg-amber-50/30 shadow-md ring-2 ring-amber-500/20'
                            : 'border-neutral-200 hover:border-neutral-300 bg-white'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                              style={{ backgroundColor: tpl.accent }}
                            >
                              <Icon size={20} />
                            </div>
                            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-700">
                              {tpl.badge}
                            </span>
                          </div>

                          <h3 className="text-base font-bold text-neutral-900 mb-2">
                            {tpl.name}
                          </h3>
                          <p className="text-xs text-neutral-600 leading-relaxed">
                            {tpl.desc}
                          </p>
                        </div>

                        <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between text-xs font-semibold">
                          <span style={{ color: tpl.accent }}>
                            {isSelected ? '✓ Seçili Şablon' : 'Bu Şablonu Seç'}
                          </span>
                          <span className="text-neutral-400 font-normal">A4 &bull; Yüksek Çözünürlük</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 4: KURUMSAL KİMLİK & İLETİŞİM */}
            {activeStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-neutral-900">4. Kurumsal Kimlik & İletişim Bilgileri</h2>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Katalog kapağı ve arka sayfada yer alacak logo, renk paleti ve irtibat kanallarını girin.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-semibold text-neutral-700">Marka Logo URL</label>
                    <input
                      type="text"
                      value={formData.customLogoUrl}
                      onChange={e => setFormData({ ...formData, customLogoUrl: e.target.value })}
                      placeholder="https://... logo.png (Boş bırakılırsa profil logosu kullanılır)"
                      className="w-full px-4 py-2 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-700">Ana Vurgu Rengi (Primary Hex)</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={formData.primaryColor}
                        onChange={e => setFormData({ ...formData, primaryColor: e.target.value })}
                        className="w-10 h-10 rounded-lg cursor-pointer border border-neutral-300 p-0.5"
                      />
                      <input
                        type="text"
                        value={formData.primaryColor}
                        onChange={e => setFormData({ ...formData, primaryColor: e.target.value })}
                        className="flex-1 px-4 py-2 border border-neutral-300 rounded-xl text-sm font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-700">Web Sitesi</label>
                    <input
                      type="text"
                      value={formData.websiteUrl}
                      onChange={e => setFormData({ ...formData, websiteUrl: e.target.value })}
                      placeholder="www.markaniz.com"
                      className="w-full px-4 py-2 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-700">Telefon / Proje Hattı</label>
                    <input
                      type="text"
                      value={formData.contactPhone}
                      onChange={e => setFormData({ ...formData, contactPhone: e.target.value })}
                      placeholder="+90 (212) 000 00 00"
                      className="w-full px-4 py-2 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-700">İletişim E-Posta</label>
                    <input
                      type="email"
                      value={formData.contactEmail}
                      onChange={e => setFormData({ ...formData, contactEmail: e.target.value })}
                      placeholder="proje@markaniz.com"
                      className="w-full px-4 py-2 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-semibold text-neutral-700">Adres / Fabrika / Showroom</label>
                    <input
                      type="text"
                      value={formData.contactAddress}
                      onChange={e => setFormData({ ...formData, contactAddress: e.target.value })}
                      placeholder="Organize Sanayi Bölgesi, Seramik Caddesi No:1, Türkiye"
                      className="w-full px-4 py-2 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: GÖRÜNÜRLÜK & ALAN AYARLARI */}
            {activeStep === 5 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-neutral-900">5. Görünürlük & İçerik Ayarları</h2>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Fiyatları, QR kodları, kapak ve fihrist sayfalarını kataloğunuza dahil edip etmeyeceğinizi seçin.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'showPrices', label: 'm² Fiyatlarını Göster', desc: 'Perakende tavsiye edilen liste fiyatlarını sayfalarda yayınla' },
                    { key: 'showSpecs', label: 'Teknik Özellik Tablosunu Göster', desc: 'PEI aşınma, R kaymazlık, kalınlık, rektifiye bilgileri' },
                    { key: 'showCodes', label: 'Ürün ve Poz Kodlarını Göster', desc: 'Her seramiğin resmi sipariş / poz kodunu belirt' },
                    { key: 'showDescriptions', label: 'Ürün Açıklamalarını Göster', desc: 'Seramik koleksiyon açıklamalarını veya özel notları yerleştir' },
                    { key: 'showQrCodes', label: 'Mekânımda Gör 3D QR Kodunu Göster', desc: 'Akıllı telefonla okutulduğunda 3D Studio açan QR kod' },
                    { key: 'showCover', label: 'Kapak Sayfası Ekle', desc: 'Lüks görsel ve marka başlıklı ana kapak' },
                    { key: 'showTOC', label: 'İçindekiler / Fihrist Ekle', desc: 'Koleksiyon genel listesi ve sayfa matrisi' },
                    { key: 'showContactPage', label: 'Arka İletişim Sayfası Ekle', desc: 'Telefon, e-posta, showroom ve web adresi' },
                    { key: 'showPageNumbers', label: 'Sayfa Numaralarını Göster', desc: 'A4 sayfaların alt kısmında resmi numaralandırma' },
                  ].map(toggle => (
                    <label
                      key={toggle.key}
                      className="p-4 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 cursor-pointer flex items-start gap-3 transition"
                    >
                      <input
                        type="checkbox"
                        checked={Boolean(formData[toggle.key])}
                        onChange={e => setFormData({ ...formData, [toggle.key]: e.target.checked })}
                        className="mt-1 w-4 h-4 text-amber-600 rounded border-neutral-300 focus:ring-amber-500"
                      />
                      <div>
                        <p className="text-xs font-bold text-neutral-800">{toggle.label}</p>
                        <p className="text-[11px] text-neutral-500 mt-0.5">{toggle.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 6: CANLI ÖNİZLEME & YAYINLAMA */}
            {activeStep === 6 && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-neutral-900">6. Canlı Önizleme & Yayın</h2>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Kataloğunuzun son hâlini inceleyin, taslak kaydedin veya yayına alarak paylaşın.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSaveCatalog(false)}
                      disabled={saving}
                      className="px-4 py-2 border border-neutral-300 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition"
                    >
                      {saving ? 'Kaydediliyor...' : 'Taslak Olarak Kaydet'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveCatalog(true)}
                      disabled={saving}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md transition"
                    >
                      {saving ? 'Yayınlanıyor...' : 'Kataloğu Yayınla'}
                    </button>
                  </div>
                </div>

                {/* Inline Preview Container */}
                <div className="border border-neutral-300 rounded-2xl p-6 bg-neutral-100 max-h-[600px] overflow-y-auto">
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

            {/* Navigation Buttons */}
            <div className="mt-8 pt-6 border-t border-neutral-200 flex items-center justify-between">
              <button
                type="button"
                disabled={activeStep === 1}
                onClick={() => setActiveStep(prev => Math.max(1, prev - 1))}
                className="px-4 py-2 rounded-xl border border-neutral-300 text-xs font-semibold text-neutral-600 hover:bg-neutral-50 disabled:opacity-30 transition flex items-center gap-1.5"
              >
                <ArrowLeft size={14} />
                <span>Önceki Adım</span>
              </button>

              {activeStep < 6 ? (
                <button
                  type="button"
                  onClick={() => setActiveStep(prev => Math.min(6, prev + 1))}
                  className="px-5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow"
                >
                  <span>Sonraki Adım</span>
                  <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSaveCatalog(true)}
                  disabled={saving}
                  className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold transition flex items-center gap-1.5 shadow-md"
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
      {/* VIEW MODE 3: FULLSCREEN PREVIEW & PDF PRINT MODAL */}
      {/* ========================================================================= */}
      {viewMode === 'preview-modal' && previewCatalog && (
        <div className="fixed inset-0 z-50 bg-neutral-900/90 backdrop-blur-sm flex flex-col">
          {/* Top Floating Control Bar */}
          <div className="bg-neutral-900 border-b border-neutral-800 px-6 py-3.5 flex items-center justify-between text-white no-print">
            <div className="flex items-center gap-3">
              <span className="font-bold text-sm tracking-wide">{previewCatalog.title}</span>
              <span className="text-xs text-neutral-400 font-mono">
                ({previewProducts.length} Ürün &bull; {previewCatalog.template.toUpperCase()})
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handlePrint}
                className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-xs flex items-center gap-1.5 shadow transition"
              >
                <Printer size={15} />
                <span>Yazdır / PDF Olarak Kaydet</span>
              </button>

              <button
                onClick={() => handleCopyLink(previewCatalog.publicSlug)}
                className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium flex items-center gap-1.5 transition"
              >
                <Share2 size={15} />
                <span>Web Bağlantısını Paylaş</span>
              </button>

              <button
                onClick={() => setViewMode('list')}
                className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Scrollable Document Container */}
          <div className="flex-1 overflow-y-auto p-8 bg-neutral-800">
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
