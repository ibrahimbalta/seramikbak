'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Plus,
  Search,
  Eye,
  Trash2,
  Edit,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  X,
  ExternalLink,
  Layers,
  Sparkles,
  Palette,
  FileText,
  Printer,
  QrCode,
  Check,
  Copy,
  Clock,
  LayoutTemplate,
  Phone,
  Mail,
  MessageCircle,
  Tag,
  Package,
  Building2,
  Share2,
  Sliders,
  Globe,
  RefreshCw
} from 'lucide-react';
import HtmlLookbookViewer from './catalog/templates/HtmlLookbookViewer';

// 5 Lüks & Hazır HTML Lookbook Şablonu
export const HTML_CATALOG_TEMPLATES = [
  {
    id: 'milano',
    name: 'Milano Architectural Lookbook',
    badge: 'En Çok Tercih Edilen',
    style: 'Lüks & Obsidian',
    description: 'Büyük tam ekran mekan fotoğrafları, obsidian siyah zemin, altın aksanlar ve asimetrik slab vitrini.',
    previewImg: '/renders/luxury_bathroom_calacatta_gold.jpg',
    palette: { primary: '#b4823c', accent: '#0c0e12', bg: '#0c0e12' }
  },
  {
    id: 'terra-luxe',
    name: 'Terra Luxe & Marble Edition',
    badge: 'Doğal Taş & Mermer',
    style: 'Şampanya & Bej',
    description: 'Doğal taş ve mermer damarlarını öne çıkaran açık krem zemin, zarif editoryal tipografi ve ferah negatif alan.',
    previewImg: '/renders/luxury_bathroom_natural_oak.jpg',
    palette: { primary: '#9a6c2d', accent: '#faf8f5', bg: '#faf8f5' }
  },
  {
    id: 'nordic',
    name: 'Nordic Minimalist & Loft',
    badge: 'Modern & Şehirli',
    style: 'Antrasit & Beton',
    description: 'Beton, çimento ve ahşap dokulu seriler için net çizgiler, antrasit tonları ve çağdaş mimari düzen.',
    previewImg: '/renders/luxury_bathroom_loft_beton.jpg',
    palette: { primary: '#475569', accent: '#0f172a', bg: '#0f172a' }
  },
  {
    id: 'spec-sheet',
    name: 'Lidya Technic & Spec Sheet',
    badge: 'B2B Şartname',
    style: 'Mühendislik & Proje',
    description: 'Mimarlık ofisleri ve şartname hazırlayan müteahhitler için TS EN 14411 standart ve kutu/palet lojistik odaklı.',
    previewImg: '/renders/luxury_bathroom_albatros_antrasit.jpg',
    palette: { primary: '#047857', accent: '#0f172a', bg: '#0f172a' }
  },
  {
    id: 'deco',
    name: 'Artisan Boutique Living',
    badge: 'Dekor & Butik',
    style: 'Sıcak & Akdeniz',
    description: 'Banyo, mutfak ve butik yaşam alanlarına yönelik sıcak toprak ve terracotta tonlarında zarif lookbook.',
    previewImg: '/renders/modern_living_natural_oak.jpg',
    palette: { primary: '#c2410c', accent: '#1e293b', bg: '#0f172a' }
  }
];

export default function SimpleDigitalCatalogModule({ brandInfo, externalSubSection }) {
  const brandId = brandInfo?.id;

  // View state: 'list' | 'editor' | 'inquiries'
  const [currentView, setCurrentView] = useState('list');

  // Catalogs & loading
  const [catalogs, setCatalogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Available brand products
  const [brandProducts, setBrandProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productSearch, setProductSearch] = useState('');

  // B2B Inquiries (Quotes & Samples)
  const [inquiries, setInquiries] = useState([]);
  const [inquiriesLoading, setInquiriesLoading] = useState(false);
  const [inquiryFilter, setInquiryFilter] = useState('ALL');

  // Share Modal
  const [sharingCatalog, setSharingCatalog] = useState(null);
  const [linkCopied, setLinkCopied] = useState(false);

  // Editor State
  const [activeCatalogId, setActiveCatalogId] = useState(null);
  const [editorStep, setEditorStep] = useState(1); // 1: Şablon, 2: İçerik & Ürünler, 3: Önizle & Yayınla
  const [saving, setSaving] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    coverSubtitle: '',
    introText: '',
    template: 'milano',
    primaryColor: '#b4823c',
    selectedProductIds: [],
    isPublished: true,
    publicSlug: ''
  });

  // Load catalogs and products on mount
  useEffect(() => {
    if (brandId) {
      loadCatalogs();
      loadBrandProducts();
      loadInquiries();
    }
  }, [brandId]);

  // Sync with external navigation
  useEffect(() => {
    if (externalSubSection === 'inquiries') {
      setCurrentView('inquiries');
    } else if (externalSubSection === 'create') {
      handleStartNew();
    } else if (externalSubSection === 'all') {
      setCurrentView('list');
    }
  }, [externalSubSection]);

  const loadCatalogs = async () => {
    if (!brandId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/brand/catalogs?brandId=${brandId}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setCatalogs(data.catalogs || []);
      }
    } catch (err) {
      console.error('Kataloglar yüklenemedi:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadBrandProducts = async () => {
    if (!brandId) return;
    setProductsLoading(true);
    try {
      const res = await fetch(`/api/search?brandId=${brandId}&limit=all&fullDetail=true`);
      if (res.ok) {
        const data = await res.json();
        setBrandProducts(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Ürünler yüklenemedi:', err);
    } finally {
      setProductsLoading(false);
    }
  };

  const loadInquiries = async () => {
    if (!brandId) return;
    setInquiriesLoading(true);
    try {
      const res = await fetch(`/api/brand/catalogs/inquiries?brandId=${brandId}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setInquiries(data.inquiries || []);
      }
    } catch (err) {
      console.error('Talepler yüklenemedi:', err);
    } finally {
      setInquiriesLoading(false);
    }
  };

  // Start new catalog creation
  const handleStartNew = () => {
    setActiveCatalogId(null);
    setEditorStep(1);
    setFormData({
      title: `${brandInfo?.name || 'Marka'} ${new Date().getFullYear()} Mimari Koleksiyonu`,
      coverSubtitle: 'Yüksek Performanslı Porselen & Seramik Seçkisi',
      introText: 'Doğal taş, mermer ve beton dokularını en ileri porselen karo teknolojisiyle buluşturan lüks mimari seçki.',
      template: 'milano',
      primaryColor: '#b4823c',
      selectedProductIds: brandProducts.slice(0, 8).map((p) => p.id),
      isPublished: true,
      publicSlug: ''
    });
    setCurrentView('editor');
  };

  // Edit existing catalog
  const handleEditCatalog = (cat) => {
    setActiveCatalogId(cat.id);
    setEditorStep(2);

    let productIds = [];
    try {
      const parsed = JSON.parse(cat.productItems || '[]');
      productIds = parsed.map((item) => (typeof item === 'string' ? item : item.productId)).filter(Boolean);
    } catch (e) {
      productIds = [];
    }

    setFormData({
      title: cat.title || '',
      coverSubtitle: cat.coverSubtitle || '',
      introText: cat.introText || '',
      template: cat.template || 'milano',
      primaryColor: cat.primaryColor || '#b4823c',
      selectedProductIds: productIds,
      isPublished: Boolean(cat.isPublished),
      publicSlug: cat.publicSlug || ''
    });
    setCurrentView('editor');
  };

  // Toggle publish state
  const handleTogglePublish = async (cat) => {
    try {
      const newStatus = !cat.isPublished;
      const res = await fetch(`/api/brand/catalogs/${cat.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: newStatus })
      });
      if (res.ok) {
        setCatalogs((prev) =>
          prev.map((c) => (c.id === cat.id ? { ...c, isPublished: newStatus } : c))
        );
      }
    } catch (err) {
      console.error('Yayın durumu değiştirilemedi:', err);
    }
  };

  // Delete catalog
  const handleDeleteCatalog = async (catId) => {
    if (!window.confirm('Bu dijital kataloğu silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch(`/api/brand/catalogs/${catId}`, { method: 'DELETE' });
      if (res.ok) {
        setCatalogs((prev) => prev.filter((c) => c.id !== catId));
      }
    } catch (err) {
      console.error('Katalog silinemedi:', err);
    }
  };

  // AI Assistant: Auto-fill editorial text
  const handleAiAutoFill = async () => {
    setAiGenerating(true);
    try {
      const selected = brandProducts.filter((p) => formData.selectedProductIds.includes(p.id));
      const res = await fetch('/api/ai/catalog-autofill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandName: brandInfo?.name || 'Marka',
          products: selected.slice(0, 5).map((p) => ({
            name: p.name,
            finish: p.finish,
            color: p.color
          })),
          theme: formData.template === 'milano' ? 'luxury' : 'architectural'
        })
      });
      const data = await res.json();
      if (res.ok && data.success && data.preset) {
        setFormData((prev) => ({
          ...prev,
          title: data.preset.title || prev.title,
          coverSubtitle: data.preset.coverSubtitle || prev.coverSubtitle,
          introText: data.preset.introText || prev.introText,
          primaryColor: data.preset.primaryColor || prev.primaryColor
        }));
      }
    } catch (err) {
      console.error('AI autofill hatası:', err);
    } finally {
      setAiGenerating(false);
    }
  };

  // Save Catalog
  const handleSaveCatalog = async (publishNow = false) => {
    if (!formData.title.trim()) {
      alert('Lütfen katalog başlığı girin.');
      return;
    }
    if (formData.selectedProductIds.length === 0) {
      alert('Lütfen kataloğa en az 1 ürün ekleyin.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        brandId,
        title: formData.title,
        coverTitle: formData.title,
        coverSubtitle: formData.coverSubtitle,
        introText: formData.introText,
        template: formData.template,
        primaryColor: formData.primaryColor,
        isPublished: publishNow ? true : formData.isPublished,
        isDraft: !publishNow && !formData.isPublished,
        productItems: formData.selectedProductIds.map((pid, idx) => ({
          productId: pid,
          order: idx + 1
        }))
      };

      const url = activeCatalogId ? `/api/brand/catalogs/${activeCatalogId}` : '/api/brand/catalogs';
      const method = activeCatalogId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok && (data.success || data.catalog)) {
        await loadCatalogs();
        setCurrentView('list');
      } else {
        alert(data.error || 'Kaydedilirken bir hata oluştu.');
      }
    } catch (err) {
      console.error('Kayıt hatası:', err);
      alert('Bağlantı hatası: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Toggle product selection in editor
  const toggleProductSelect = (id) => {
    setFormData((prev) => ({
      ...prev,
      selectedProductIds: prev.selectedProductIds.includes(id)
        ? prev.selectedProductIds.filter((pid) => pid !== id)
        : [...prev.selectedProductIds, id]
    }));
  };

  // Filtered products for editor picker
  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return brandProducts;
    const q = productSearch.toLowerCase();
    return brandProducts.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q) ||
        p.finish?.toLowerCase().includes(q)
    );
  }, [brandProducts, productSearch]);

  // Selected products objects for preview
  const previewProducts = useMemo(() => {
    return formData.selectedProductIds
      .map((id) => brandProducts.find((p) => p.id === id))
      .filter(Boolean);
  }, [formData.selectedProductIds, brandProducts]);

  // KPI calculations
  const totalViews = catalogs.reduce((acc, c) => acc + (c.viewCount || 0), 0);
  const publishedCount = catalogs.filter((c) => c.isPublished).length;

  return (
    <div className="w-full min-h-screen bg-stone-50/50 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* =========================================================================
          TOP MASTER HEADER
      ========================================================================= */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-stone-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-700">
              {brandInfo?.name || 'Marka'} &bull; DİJİTAL YAYIN PLATFORMU
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-serif font-black text-stone-900 tracking-tight mt-1">
            Dijital Katalog & Lookbook Stüdyosu
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Müşterileriniz ve mimarlar için yüksek çözünürlüklü, mobil uyumlu HTML lookbook katalogları oluşturun.
          </p>
        </div>

        {/* View Switchers & Create Button */}
        <div className="flex flex-wrap items-center gap-2">
          {currentView !== 'editor' && (
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setCurrentView('list')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  currentView === 'list'
                    ? 'bg-white text-stone-900 shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <BookOpen size={13} className="text-amber-600" />
                <span>Kataloglarım ({catalogs.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentView('inquiries')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  currentView === 'inquiries'
                    ? 'bg-white text-stone-900 shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Tag size={13} className="text-amber-600" />
                <span>B2B Talepleri ({inquiries.length})</span>
              </button>
            </div>
          )}

          {currentView !== 'editor' && (
            <button
              type="button"
              onClick={handleStartNew}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-amber-600/20 transition-all cursor-pointer"
            >
              <Plus size={15} />
              <span>Yeni Katalog Oluştur</span>
            </button>
          )}

          {currentView === 'editor' && (
            <button
              type="button"
              onClick={() => setCurrentView('list')}
              className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Katalog Listesine Dön</span>
            </button>
          )}
        </div>
      </header>

      {/* =========================================================================
          VIEW 1: CATALOGS LIST (Kataloglarım)
      ========================================================================= */}
      {currentView === 'list' && (
        <div className="space-y-6">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                Toplam Katalog
              </span>
              <span className="text-2xl font-serif font-black text-stone-900 mt-1 block">
                {catalogs.length}
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs">
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">
                Yayındaki Kataloglar
              </span>
              <span className="text-2xl font-serif font-black text-emerald-700 mt-1 block">
                {publishedCount}
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                Toplam Ziyaret
              </span>
              <span className="text-2xl font-serif font-black text-stone-900 mt-1 block">
                {totalViews}
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs">
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">
                Gelen B2B Talepleri
              </span>
              <span className="text-2xl font-serif font-black text-amber-700 mt-1 block">
                {inquiries.length}
              </span>
            </div>
          </div>

          {/* Catalog Cards Grid */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-stone-400 space-y-2">
              <Loader2 size={24} className="animate-spin text-amber-600" />
              <p className="text-xs font-medium">Kataloglar yükleniyor...</p>
            </div>
          ) : catalogs.length === 0 ? (
            <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center max-w-lg mx-auto space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto shadow-xs">
                <BookOpen size={28} />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-stone-900">Henüz Bir Katalog Oluşturmadınız</h3>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  Ürünlerinizi mimarlara ve bayilere prestijli bir HTML lookbook olarak sunmak için hemen başlayın.
                </p>
              </div>
              <button
                type="button"
                onClick={handleStartNew}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs inline-flex items-center gap-2 shadow-sm transition cursor-pointer"
              >
                <Plus size={14} />
                <span>İlk Kataloğunuzu Oluşturun</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {catalogs.map((cat) => {
                const templateObj =
                  HTML_CATALOG_TEMPLATES.find((t) => t.id === cat.template) || HTML_CATALOG_TEMPLATES[0];
                const coverImage =
                  cat.customCoverUrl || templateObj.previewImg || '/renders/luxury_bathroom_calacatta_gold.jpg';
                const publicUrl = `/katalog/${cat.publicSlug}`;

                return (
                  <div
                    key={cat.id}
                    className="group bg-white rounded-2xl border border-stone-200/90 shadow-2xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between"
                  >
                    {/* Top Image Preview & Badges */}
                    <div className="relative aspect-[16/10] bg-stone-900 overflow-hidden">
                      <img
                        src={coverImage}
                        alt={cat.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                      {/* Status & Template Pills */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold font-mono tracking-wider bg-black/60 text-white backdrop-blur-md border border-white/20">
                          {templateObj.name}
                        </span>

                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 backdrop-blur-md shadow-xs ${
                            cat.isPublished
                              ? 'bg-emerald-500/90 text-white'
                              : 'bg-amber-500/90 text-neutral-950'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                          <span>{cat.isPublished ? 'Yayında' : 'Taslak'}</span>
                        </span>
                      </div>

                      {/* Title & Count Overlay */}
                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <h3 className="text-sm font-bold truncate drop-shadow">{cat.title}</h3>
                        <p className="text-[11px] text-stone-300 font-mono flex items-center gap-2 mt-0.5">
                          <span>{cat.itemCount || 0} Karo Seçili</span>
                          <span>&bull;</span>
                          <span>{cat.viewCount || 0} Görüntülenme</span>
                        </p>
                      </div>
                    </div>

                    {/* Bottom Action Controls */}
                    <div className="p-3.5 bg-stone-50/70 border-t border-stone-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={publicUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition"
                          title="Web Kataloğunu Aç"
                        >
                          <Eye size={13} />
                          <span>Görüntüle</span>
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleEditCatalog(cat)}
                          className="p-1.5 rounded-lg bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 text-xs font-semibold transition cursor-pointer"
                          title="Düzenle"
                        >
                          <Edit size={14} />
                        </button>

                        <button
                          type="button"
                          onClick={() => setSharingCatalog(cat)}
                          className="p-1.5 rounded-lg bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 text-xs font-semibold transition cursor-pointer"
                          title="Paylaş & QR Kod"
                        >
                          <Share2 size={14} />
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(cat)}
                          className={`text-[11px] font-bold px-2 py-1 rounded-md transition cursor-pointer ${
                            cat.isPublished
                              ? 'text-stone-500 hover:text-amber-700'
                              : 'text-emerald-700 hover:text-emerald-800 bg-emerald-50'
                          }`}
                        >
                          {cat.isPublished ? 'Taslağa Al' : 'Yayınla'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteCatalog(cat.id)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="Kataloğu Sil"
                        >
                          <Trash2 size={14} />
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

      {/* =========================================================================
          VIEW 2: INQUIRIES LIST (Gelen Mimari B2B Talepleri)
      ========================================================================= */}
      {currentView === 'inquiries' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-stone-900">Gelen Teklif & Numune Talepleri</h2>
            <button
              type="button"
              onClick={loadInquiries}
              className="text-xs font-bold text-amber-700 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw size={12} />
              <span>Yenile</span>
            </button>
          </div>

          {inquiriesLoading ? (
            <div className="py-20 text-center text-stone-400">
              <Loader2 size={24} className="animate-spin mx-auto text-amber-600 mb-2" />
              <p className="text-xs">Talepler yükleniyor...</p>
            </div>
          ) : inquiries.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-10 text-center space-y-2">
              <Tag size={28} className="text-stone-300 mx-auto" />
              <p className="text-xs text-stone-500">Henüz bu katalog üzerinden bir talep alınmadı.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {inquiries.map((inq) => {
                const isSample = inq.leadType === 'sample';
                return (
                  <div
                    key={inq.id}
                    className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            isSample
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {isSample ? 'Fiziksel Numune Talebi' : 'Fiyat Teklifi İsteği'}
                        </span>
                        <h4 className="text-sm font-bold text-stone-900">{inq.customerName}</h4>
                        {inq.companyName && (
                          <span className="text-xs text-stone-500 font-medium">({inq.companyName})</span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-stone-600 flex-wrap">
                        {inq.phone && (
                          <a
                            href={`tel:${inq.phone}`}
                            className="flex items-center gap-1 hover:text-amber-700 font-mono"
                          >
                            <Phone size={12} className="text-emerald-600" />
                            <span>{inq.phone}</span>
                          </a>
                        )}
                        {inq.email && (
                          <a
                            href={`mailto:${inq.email}`}
                            className="flex items-center gap-1 hover:text-amber-700"
                          >
                            <Mail size={12} className="text-amber-600" />
                            <span>{inq.email}</span>
                          </a>
                        )}
                        <span className="text-[11px] text-stone-400 font-mono">
                          {new Date(inq.createdAt).toLocaleDateString('tr-TR')}
                        </span>
                      </div>

                      {inq.selectedProducts && inq.selectedProducts.length > 0 && (
                        <p className="text-xs text-stone-500">
                          <strong>İlgilendiği Ürünler:</strong>{' '}
                          {inq.selectedProducts
                            .map((p) => (typeof p === 'string' ? p : p.name))
                            .join(', ')}
                        </p>
                      )}
                    </div>

                    {inq.phone && (
                      <a
                        href={`https://wa.me/${inq.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 self-start md:self-center shadow-xs transition"
                      >
                        <MessageCircle size={14} />
                        <span>WhatsApp'tan Yaz</span>
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          VIEW 3: SIMPLE 3-STEP CATALOG BUILDER (Sade & Modern Editör)
      ========================================================================= */}
      {currentView === 'editor' && (
        <div className="space-y-6">
          {/* Stepper Navigation */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto">
              <button
                type="button"
                onClick={() => setEditorStep(1)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  editorStep === 1
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                <span>1. Şablon Seçimi</span>
              </button>

              <button
                type="button"
                onClick={() => setEditorStep(2)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  editorStep === 2
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                <span>2. Bilgiler & Karolar ({formData.selectedProductIds.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setEditorStep(3)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  editorStep === 3
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                <Sparkles size={13} />
                <span>3. Canlı Önizle & Yayınla</span>
              </button>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => handleSaveCatalog(false)}
                disabled={saving}
                className="px-3.5 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
              >
                {saving && <Loader2 size={12} className="animate-spin" />}
                <span>Taslak Kaydet</span>
              </button>

              <button
                type="button"
                onClick={() => handleSaveCatalog(true)}
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-600/20 transition cursor-pointer"
              >
                <Sparkles size={13} />
                <span>Yayına Al</span>
              </button>
            </div>
          </div>

          {/* STEP 1: ŞABLON SEÇİMİ */}
          {editorStep === 1 && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs space-y-1">
                <h3 className="text-base font-bold text-stone-900">
                  Lüks HTML Dijital Lookbook Şablonunuzu Seçin
                </h3>
                <p className="text-xs text-stone-500">
                  Koleksiyonunuzun tarzına en uygun profesyonel editoryal mizanpajı seçin. Karolarınız bu şablon üzerinde otomatik düzenlenir.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {HTML_CATALOG_TEMPLATES.map((tmpl) => {
                  const isSelected = formData.template === tmpl.id;
                  return (
                    <div
                      key={tmpl.id}
                      onClick={() => setFormData({ ...formData, template: tmpl.id, primaryColor: tmpl.palette.primary })}
                      className={`group bg-white rounded-2xl border-2 transition-all duration-200 overflow-hidden cursor-pointer flex flex-col justify-between shadow-2xs hover:shadow-md ${
                        isSelected
                          ? 'border-amber-600 ring-2 ring-amber-600/20 shadow-md'
                          : 'border-stone-200 hover:border-amber-300'
                      }`}
                    >
                      <div className="relative aspect-[16/10] bg-stone-900 overflow-hidden">
                        <img
                          src={tmpl.previewImg}
                          alt={tmpl.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <div className="absolute top-3 left-3">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/60 text-white backdrop-blur-md border border-white/20">
                            {tmpl.badge}
                          </span>
                        </div>
                        {isSelected && (
                          <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center shadow-md">
                            <Check size={14} strokeWidth={3} />
                          </div>
                        )}
                        <div className="absolute bottom-3 left-3 text-white">
                          <span className="text-[10px] font-mono text-amber-300 uppercase tracking-wider block">
                            {tmpl.style}
                          </span>
                          <h4 className="text-sm font-bold drop-shadow">{tmpl.name}</h4>
                        </div>
                      </div>

                      <div className="p-4 space-y-3">
                        <p className="text-xs text-stone-600 leading-relaxed font-normal">
                          {tmpl.description}
                        </p>
                        <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                          <span className="text-stone-400 font-mono text-[11px]">HTML5 Responsive</span>
                          <span
                            className={`font-bold text-xs ${
                              isSelected ? 'text-amber-700' : 'text-stone-500 group-hover:text-stone-900'
                            }`}
                          >
                            {isSelected ? '✓ Seçili Şablon' : 'Bu Şablonu Seç'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setEditorStep(2)}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs inline-flex items-center gap-2 shadow-sm transition cursor-pointer"
                >
                  <span>Sonraki Adım: Bilgiler & Ürünler</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: BİLGİLER & ÜRÜN SEÇİMİ */}
          {editorStep === 2 && (
            <div className="space-y-6">
              {/* Editorial Text & AI Form */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200/80 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-stone-900">Katalog Başlığı & Editoryal Metinler</h3>
                    <p className="text-xs text-stone-500">
                      Lookbook kapağında ve manifesto bölümünde görüntülenecek metinleri belirleyin.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAiAutoFill}
                    disabled={aiGenerating}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                  >
                    {aiGenerating ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                    <span>✨ AI ile Otomatik Yaz</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-stone-700 block mb-1">
                      Katalog Başlığı *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Örn: 2026 Calacatta & Mermer Koleksiyonu"
                      className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-semibold text-stone-900 focus:bg-white focus:outline-none focus:border-amber-600 transition"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-stone-700 block mb-1">
                      Alt Başlık / Sezon
                    </label>
                    <input
                      type="text"
                      value={formData.coverSubtitle}
                      onChange={(e) => setFormData({ ...formData, coverSubtitle: e.target.value })}
                      placeholder="Örn: Yüksek Performanslı Porselen & Yüzey Koleksiyonu"
                      className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-medium text-stone-900 focus:bg-white focus:outline-none focus:border-amber-600 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">
                    Mimari Manifesto / Tanıtım Metni
                  </label>
                  <textarea
                    rows={2}
                    value={formData.introText}
                    onChange={(e) => setFormData({ ...formData, introText: e.target.value })}
                    placeholder="Koleksiyonun ilham kaynağını ve mimari vizyonunu anlatan editoryal cümle..."
                    className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-amber-600 transition"
                  />
                </div>
              </div>

              {/* Product Picker Grid */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200/80 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-stone-900">
                      Kataloğa Eklenecek Seramik Karolar ({formData.selectedProductIds.length} Seçili)
                    </h3>
                    <p className="text-xs text-stone-500">
                      Kataloğunuzda sergilemek istediğiniz ürünleri tıklayarak seçin.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          selectedProductIds: brandProducts.map((p) => p.id)
                        })
                      }
                      className="px-2.5 py-1 text-xs font-bold text-amber-700 hover:bg-amber-50 rounded-lg transition cursor-pointer"
                    >
                      Tümünü Seç
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, selectedProductIds: [] })}
                      className="px-2.5 py-1 text-xs font-bold text-stone-500 hover:bg-stone-100 rounded-lg transition cursor-pointer"
                    >
                      Temizle
                    </button>
                  </div>
                </div>

                {/* Search in products */}
                <div className="relative">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Karo adı, kod veya yüzey tipi ile filtrele..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:border-amber-600 transition"
                  />
                </div>

                {/* Products Grid */}
                {productsLoading ? (
                  <div className="py-12 text-center text-stone-400">
                    <Loader2 size={20} className="animate-spin mx-auto text-amber-600 mb-2" />
                    <p className="text-xs">Ürünler yükleniyor...</p>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="py-8 text-center text-stone-400 text-xs">
                    Uygun seramik ürünü bulunamadı.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-96 overflow-y-auto p-1">
                    {filteredProducts.map((p) => {
                      const isSelected = formData.selectedProductIds.includes(p.id);
                      const img = p.imageUrl || p.textureUrl || '/placeholder.png';

                      return (
                        <div
                          key={p.id}
                          onClick={() => toggleProductSelect(p.id)}
                          className={`relative rounded-xl border-2 p-2 cursor-pointer transition-all flex flex-col justify-between ${
                            isSelected
                              ? 'border-amber-600 bg-amber-50/40 ring-1 ring-amber-600/30'
                              : 'border-stone-200 bg-stone-50/50 hover:border-stone-300'
                          }`}
                        >
                          <div className="relative aspect-square rounded-lg overflow-hidden bg-stone-200 mb-2">
                            <img src={img} alt={p.name} className="w-full h-full object-cover" />
                            {isSelected && (
                              <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center shadow-xs">
                                <Check size={12} strokeWidth={3} />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <h5 className="text-[11px] font-bold text-stone-900 truncate">{p.name}</h5>
                            <p className="text-[10px] text-stone-500 font-mono truncate">
                              {p.width && p.height ? `${p.width}x${p.height} cm` : p.finish || ''}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setEditorStep(1)}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <ArrowLeft size={14} />
                  <span>Şablon Seçimine Dön</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEditorStep(3)}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs inline-flex items-center gap-2 shadow-sm transition cursor-pointer"
                >
                  <span>Sonraki Adım: Canlı Önizle & Yayınla</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: CANLI ÖNİZLEME & YAYINLAMA */}
          {editorStep === 3 && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-stone-900">
                    Kataloğunuz Canlı Önizlemede
                  </h3>
                  <p className="text-xs text-stone-500">
                    Aşağıdaki lookbook web yayınınızın birebir canlı önizlemesidir. Kontrol edip 'Yayına Al' butonuna basın.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditorStep(2)}
                    className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Edit size={13} />
                    <span>Bilgileri Düzenle</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSaveCatalog(true)}
                    disabled={saving}
                    className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-600/20 transition cursor-pointer"
                  >
                    {saving ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                    <span>Yayına Al & Link Üret</span>
                  </button>
                </div>
              </div>

              {/* Live Lookbook Container */}
              <div className="rounded-3xl border border-stone-300 overflow-hidden shadow-xl">
                <HtmlLookbookViewer
                  catalog={{
                    title: formData.title,
                    coverTitle: formData.title,
                    coverSubtitle: formData.coverSubtitle,
                    introText: formData.introText,
                    template: formData.template,
                    primaryColor: formData.primaryColor,
                    brand: brandInfo
                  }}
                  products={previewProducts}
                  mode="preview"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          SHARE MODAL (Bağlantı, WhatsApp & QR Kod)
      ========================================================================= */}
      {sharingCatalog && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-stone-200 relative animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-base font-bold text-stone-900">Kataloğu Paylaş</h3>
              <button
                type="button"
                onClick={() => setSharingCatalog(null)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-800"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                  Katalog Başlığı
                </span>
                <p className="text-sm font-bold text-stone-900">{sharingCatalog.title}</p>
              </div>

              {/* Direct Link */}
              <div>
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                  Doğrudan Web Bağlantısı
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={
                      typeof window !== 'undefined'
                        ? `${window.location.origin}/katalog/${sharingCatalog.publicSlug}`
                        : `/katalog/${sharingCatalog.publicSlug}`
                    }
                    className="flex-1 px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-mono text-stone-800 select-all"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const url = `${window.location.origin}/katalog/${sharingCatalog.publicSlug}`;
                      navigator.clipboard.writeText(url);
                      setLinkCopied(true);
                      setTimeout(() => setLinkCopied(false), 2000);
                    }}
                    className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                  >
                    {linkCopied ? <Check size={14} /> : <Copy size={14} />}
                    <span>{linkCopied ? 'Kopyalandı' : 'Kopyala'}</span>
                  </button>
                </div>
              </div>

              {/* WhatsApp Quick Share */}
              <button
                type="button"
                onClick={() => {
                  const url = `${window.location.origin}/katalog/${sharingCatalog.publicSlug}`;
                  const text = `Merhaba, "${sharingCatalog.title}" dijital seramik lookbook ve ürün kataloğumuzu inceleyebilirsiniz:\n\n${url}`;
                  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
              >
                <MessageCircle size={15} />
                <span>WhatsApp ile Gönder</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
