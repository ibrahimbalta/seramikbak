'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  LayoutGrid,
  List,
  MoreVertical,
  RefreshCw,
  History,
  Archive,
  Clock,
  LayoutTemplate,
  Wand2
} from 'lucide-react';
import CatalogTemplateRenderer from './catalog/templates/CatalogTemplateRenderer';
import CatalogVisualCanvasEditor from './catalog/CatalogVisualCanvasEditor';

const TEMPLATES = [
  {
    id: 'milano',
    name: 'Milano Lookbook',
    badge: '120×280 & Dev Ebat Matbaa Baskısı',
    desc: 'İtalyan Cersaie ve Milano matbaa standardında 2 sayfalı mimari monograf mizanpajı: Sol sayfada yaşam alanı uygulaması ve teknik şartname matrisi; sağ sayfada tam boy dikey plaka ve varyasyonlar.',
    accent: '#b4823c',
    icon: Sparkles,
    tag: 'Mimarlar & Tasarımcılar',
    mockupImg: '/renders/modern_living_natural_oak.jpg'
  },
  {
    id: 'deco',
    name: 'Deco Exclusive',
    badge: 'Bien Kare Monograf & Dekofon',
    desc: 'Bien Seramik Exclusive dergi standardında kare (1:1) editoryal katalog: Sol sayfada tam boy mekan fotoğrafı, sağ sayfada geniş harf aralıklı koleksiyon başlığı, kare REC/M yüzey rozetleri ve dekofon karolar.',
    accent: '#0f172a',
    icon: LayoutTemplate,
    tag: 'Exclusive & Lüks Konsept',
    mockupImg: '/renders/luxury_bathroom_calacatta_gold.jpg'
  },
  {
    id: 'lidya',
    name: 'Lidya Pro Technic',
    badge: 'Mimari Modüler & Şartname',
    desc: 'Mimari şartname ve teknik matris standardında modüler seramik kataloğu: Renk mühendisliği (Colour engineering), RAL renk paletleri, tel kafes modüler formlar ve R9-R12 kaymazlık matrisleri.',
    accent: '#059669',
    icon: Palette,
    tag: 'Mimari Projeler & Şartname',
    mockupImg: '/renders/luxury_bathroom_albatros_antrasit.jpg'
  },
  {
    id: 'spec-sheet',
    name: 'Architectural Spec Sheet',
    badge: 'TS EN 14411 & BIM',
    desc: 'Mimarlar, mühendisler ve kamu ihale dosyaları için CAD/BIM standartlarında teknik matris. TS EN 14411 uygunluğu, PEI aşınma, R kaymazlık, kutu/palet metrajı.',
    accent: '#0284c7',
    icon: Layers,
    tag: 'İhale & Şartname',
    mockupImg: '/renders/luxury_bathroom_loft_beton.jpg'
  },
  {
    id: 'showroom',
    name: 'Showroom & Collection',
    badge: 'Perakende & Bayi Satış',
    desc: 'Bayi teşhirleri ve mağaza satış ekipleri için yan yana ürün kartları, önerilen mekan etiketleri (Banyo, Mutfak, Salon), derz eşleştirmeleri ve perakende liste etiketleri.',
    accent: '#d97706',
    icon: Building,
    tag: 'Mağaza & Müşteri',
    mockupImg: '/renders/luxury_bathroom_albatros_antrasit.jpg'
  },
  {
    id: 'global-export',
    name: 'Global Export & B2B',
    badge: 'Konteyner & Lojistik',
    desc: 'Yurtdışı distribütörler ve ihracat fuarları için çok dilli (EN/DE/AR) format. 20ft/40ft konteyner yükleme kapasiteleri, GTİP / HS Kodu (6907), CE / ISO sertifikaları.',
    accent: '#2563eb',
    icon: Globe,
    tag: 'Global İhracat',
    mockupImg: '/renders/luxury_bathroom_natural_oak.jpg'
  }
];

const COLOR_PRESETS = [
  { name: 'Milano Gold', hex: '#b4823c' },
  { name: 'Derin Lacivert', hex: '#0f172a' },
  { name: 'Zümrüt Yeşili', hex: '#047857' },
  { name: 'Terracotta', hex: '#c2410c' },
  { name: 'Modern Antrasit', hex: '#334155' },
  { name: 'Bordo Lüks', hex: '#881337' }
];

const CARD_COVERS = [
  '/renders/luxury_bathroom_calacatta_gold.jpg',
  '/renders/modern_living_natural_oak.jpg',
  '/renders/luxury_bathroom_loft_beton.jpg',
  '/renders/luxury_bathroom_albatros_antrasit.jpg',
  '/renders/luxury_bathroom_natural_oak.jpg'
];

export default function CatalogStudioTab({ brandInfo, externalSubSection, onNavigateTab }) {
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'editor' | 'preview-modal' | 'templates-gallery'
  const [studioMode, setStudioMode] = useState('easy'); // 'easy' (Kolay Mod) | 'advanced' (Gelişmiş Studio)
  const [catalogs, setCatalogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filtering, Sorting & Grid/List View
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'published' | 'draft' | 'archived'
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('updated_desc'); // 'updated_desc' | 'views_desc' | 'downloads_desc' | 'title_asc'
  const [cardDisplayMode, setCardDisplayMode] = useState('grid'); // 'grid' | 'list'
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);

  // Available brand products
  const [availableProducts, setAvailableProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');

  // Active Catalog Editor State
  const [activeCatalogId, setActiveCatalogId] = useState(null);
  const [activeStep, setActiveStep] = useState(1); // 1 to 6
  const [saving, setSaving] = useState(false);

  // Version History & Smart Product Sync Modal State
  const [versionModalCatalog, setVersionModalCatalog] = useState(null);
  const [syncModalCatalog, setSyncModalCatalog] = useState(null);

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
    dataMode: 'live', // 'live' (Canlı Veri) | 'snapshot' (Sabit Sürüm)
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
    customCanvasPages: [],
    versions: [],
    isArchived: false,
    isPublished: false,
    isDraft: true,
    publicSlug: ''
  });

  // Modal preview state
  const [previewCatalog, setPreviewCatalog] = useState(null);
  const [previewProducts, setPreviewProducts] = useState([]);
  const [previewLoading, setPreviewLoading] = useState(false);

  const brandId = brandInfo?.id;

  // Sync with parent sidebar subsection clicks if provided
  useEffect(() => {
    if (!externalSubSection) return;
    if (externalSubSection === 'all') {
      setViewMode('list');
      setFilterTab('all');
    } else if (externalSubSection === 'create') {
      handleStartNew();
    } else if (externalSubSection === 'templates') {
      setViewMode('templates-gallery');
    } else if (externalSubSection === 'published') {
      setViewMode('list');
      setFilterTab('published');
    } else if (externalSubSection === 'draft') {
      setViewMode('list');
      setFilterTab('draft');
    } else if (externalSubSection === 'archived') {
      setViewMode('list');
      setFilterTab('archived');
    }
  }, [externalSubSection]);

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

  // Parse productItems helper (supports both legacy array and extended object with metadata)
  const parseCatalogMeta = (rawProductItems) => {
    try {
      const parsed = JSON.parse(rawProductItems || '[]');
      if (Array.isArray(parsed)) {
        return {
          items: parsed.map((i) => (typeof i === 'string' ? { productId: i } : i)),
          customCanvasPages: [],
          versions: [],
          dataMode: 'live',
          isArchived: false
        };
      }
      if (parsed && typeof parsed === 'object') {
        return {
          items: (parsed.items || []).map((i) => (typeof i === 'string' ? { productId: i } : i)),
          customCanvasPages: parsed.customCanvasPages || [],
          versions: parsed.versions || [],
          dataMode: parsed.dataMode || 'live',
          isArchived: Boolean(parsed.isArchived)
        };
      }
    } catch (e) {
      // ignore
    }
    return { items: [], customCanvasPages: [], versions: [], dataMode: 'live', isArchived: false };
  };

  // Detect product changes between snapshot stored in catalog and live DB product
  const detectOutdatedProducts = (cat) => {
    const meta = parseCatalogMeta(cat.productItems);
    const changes = [];
    meta.items.forEach((item) => {
      if (!item.snapshot) return;
      const liveProd = availableProducts.find((p) => p.id === item.productId);
      if (!liveProd) return;

      const diffs = [];
      if (item.snapshot.name && liveProd.name && item.snapshot.name !== liveProd.name) {
        diffs.push({ field: 'Ürün Adı', oldVal: item.snapshot.name, newVal: liveProd.name });
      }
      if (
        item.snapshot.width &&
        liveProd.width &&
        (item.snapshot.width !== liveProd.width || item.snapshot.height !== liveProd.height)
      ) {
        diffs.push({
          field: 'Ebat',
          oldVal: `${item.snapshot.width}x${item.snapshot.height} cm`,
          newVal: `${liveProd.width}x${liveProd.height} cm`
        });
      }
      if (item.snapshot.imageUrl && liveProd.imageUrl && item.snapshot.imageUrl !== liveProd.imageUrl) {
        diffs.push({ field: 'Görsel', oldVal: 'Önceki Görsel', newVal: 'Yeni Görsel Yüklendi' });
      }
      if (diffs.length > 0) {
        changes.push({ product: liveProd, diffs });
      }
    });
    return changes;
  };

  const handleStartNew = (presetTemplate = 'milano', initialStep = 1) => {
    setActiveCatalogId(null);
    setStudioMode('easy');
    setFormData({
      title: `${brandInfo?.name || 'Seramik'} ${new Date().getFullYear()} Genel Katalog`,
      description: 'Mimari projeler, ıslak hacimler ve modern yaşam alanları için porselen ve seramik koleksiyonları.',
      coverTitle: `SERAMİK KOLEKSİYONU ${new Date().getFullYear()}`,
      coverSubtitle: 'TECHNICAL & ARCHITECTURAL CATALOG',
      introText:
        'Yenilikçi yüzey teknolojileri, yüksek dayanımlı porselen gövde ve çağdaş tasarım estetiği ile yaşam alanlarınıza değer katıyoruz.',
      template: presetTemplate,
      orientation: 'portrait',
      pageSize: 'a4',
      language: 'tr',
      dataMode: 'live',
      customLogoUrl: brandInfo?.logoUrl || '',
      primaryColor: '#b4823c',
      accentColor: '#0f172a',
      websiteUrl: brandInfo?.website || 'www.seramikbak.com',
      contactPhone: brandInfo?.phone || '',
      contactEmail: brandInfo?.email || '',
      contactAddress: brandInfo?.address || '',
      showPrices: false,
      showSpecs: true,
      showCodes: true,
      showDescriptions: true,
      showQrCodes: true,
      showCover: true,
      showTOC: true,
      showContactPage: true,
      showPageNumbers: true,
      selectedItems: availableProducts.slice(0, 6).map((p) => ({
        productId: p.id,
        customNote: '',
        usageArea: p.style || 'İç Mekân',
        snapshot: {
          name: p.name,
          width: p.width,
          height: p.height,
          imageUrl: p.imageUrl,
          updatedAt: new Date().toISOString()
        }
      })),
      customCanvasPages: [],
      versions: [],
      isArchived: false,
      isPublished: false,
      isDraft: true,
      publicSlug: ''
    });
    setActiveStep(initialStep);
    setViewMode('editor');
  };

  const handleEdit = async (cat, openInAdvanced = false) => {
    setLoading(true);
    setOpenMenuId(null);
    try {
      const res = await fetch(`/api/brand/catalogs/${cat.id}`);
      const data = await res.json();
      if (res.ok && data.success) {
        const catalog = data.catalog;
        const meta = parseCatalogMeta(catalog.productItems);

        setActiveCatalogId(catalog.id);
        setStudioMode(openInAdvanced ? 'advanced' : 'easy');
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
          dataMode: meta.dataMode || 'live',
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
          selectedItems: meta.items,
          customCanvasPages: meta.customCanvasPages,
          versions: meta.versions,
          isArchived: meta.isArchived,
          isPublished: catalog.isPublished,
          isDraft: catalog.isDraft,
          publicSlug: catalog.publicSlug || ''
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
    setOpenMenuId(null);
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
    setOpenMenuId(null);
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

  const handleToggleArchive = async (cat) => {
    setOpenMenuId(null);
    const meta = parseCatalogMeta(cat.productItems);
    const nextArchived = !meta.isArchived;
    try {
      // Keep items array compatible for backend validation by storing items directly if needed, or updating
      const res = await fetch(`/api/brand/catalogs/${cat.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isPublished: nextArchived ? false : cat.isPublished,
          isDraft: nextArchived ? true : cat.isDraft
        })
      });
      if (res.ok) {
        setCatalogs((prev) =>
          prev.map((c) => (c.id === cat.id ? { ...c, _isArchived: nextArchived, isPublished: nextArchived ? false : c.isPublished } : c))
        );
        setSuccessMsg(nextArchived ? 'Katalog arşive taşındı.' : 'Katalog arşivden çıkarıldı.');
      }
    } catch (e) {
      alert('Arşivleme hatası: ' + e.message);
    }
  };

  const handleDelete = async (target) => {
    setOpenMenuId(null);
    const cat =
      typeof target === 'object' && target !== null
        ? target
        : catalogs.find((c) => c.id === target) || { id: target, title: 'Katalog' };

    const catId = cat.id || (typeof target === 'string' ? target : null);
    if (!catId) return;

    const catalogTitle = cat.title || 'Bu kataloğu';
    if (!confirm(`"${catalogTitle}" kalıcı olarak silmek istediğinizden emin misiniz?`)) return;

    try {
      const res = await fetch(`/api/brand/catalogs/${catId}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg('Katalog başarıyla silindi.');
        setCatalogs((prev) => prev.filter((c) => c.id !== catId));
        setTimeout(() => {
          loadCatalogs();
        }, 200);
      } else {
        alert(data.error || 'Silme işlemi başarısız.');
      }
    } catch (err) {
      alert('Hata: ' + err.message);
    }
  };

  const handleToggleProduct = (product) => {
    const exists = formData.selectedItems.some((i) => i.productId === product.id);
    if (exists) {
      setFormData((prev) => ({
        ...prev,
        selectedItems: prev.selectedItems.filter((i) => i.productId !== product.id)
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        selectedItems: [
          ...prev.selectedItems,
          {
            productId: product.id,
            customNote: '',
            usageArea: product.style || 'İç Mekân & Zemin',
            snapshot: {
              name: product.name,
              width: product.width,
              height: product.height,
              imageUrl: product.imageUrl,
              updatedAt: new Date().toISOString()
            }
          }
        ]
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
    setFormData((prev) => ({ ...prev, selectedItems: items }));
  };

  const handleUpdateProductNote = (index, note) => {
    const items = [...formData.selectedItems];
    items[index].customNote = note;
    setFormData((prev) => ({ ...prev, selectedItems: items }));
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
      // Create version history entry
      const newVersionEntry = {
        versionNumber: (formData.versions?.length || 0) + 1,
        savedAt: new Date().toISOString(),
        status: publish ? 'Yayınlandı' : 'Taslak',
        itemCount: formData.selectedItems.length,
        template: formData.template,
        language: formData.language
      };

      const enrichedSelectedItems = formData.selectedItems.map((item) => ({
        ...item,
        _metaVersions: [...(formData.versions || []), newVersionEntry].slice(-10)
      }));

      const payload = {
        ...formData,
        brandId,
        productItems: enrichedSelectedItems,
        isPublished: publish ? true : formData.isPublished,
        isDraft: publish ? false : true
      };

      const url = activeCatalogId ? `/api/brand/catalogs/${activeCatalogId}` : `/api/brand/catalogs`;
      const method = activeCatalogId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
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
    setOpenMenuId(null);
    if (!slug) {
      alert('Bu katalog henüz yayınlanmadığı için genel paylaşım bağlantısı oluşturulmamış.');
      return;
    }
    const url = `${window.location.origin}/katalog/${slug}`;
    navigator.clipboard.writeText(url);
    setSuccessMsg('Katalog paylaşım bağlantısı panoya kopyalandı: ' + url);
  };

  // Filtered and Sorted Catalogs
  const filteredCatalogs = useMemo(() => {
    let list = catalogs.filter((cat) => {
      if (filterTab === 'published' && !cat.isPublished) return false;
      if (filterTab === 'draft' && (cat.isPublished || cat._isArchived)) return false;
      if (filterTab === 'archived' && !cat._isArchived) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          cat.title.toLowerCase().includes(q) ||
          (cat.description && cat.description.toLowerCase().includes(q)) ||
          (cat.template && cat.template.toLowerCase().includes(q))
        );
      }
      return true;
    });

    if (sortBy === 'views_desc') {
      list = [...list].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
    } else if (sortBy === 'downloads_desc') {
      list = [...list].sort((a, b) => (b.downloadCount || 0) - (a.downloadCount || 0));
    } else if (sortBy === 'title_asc') {
      list = [...list].sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    } else {
      list = [...list].sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
    }
    return list;
  }, [catalogs, filterTab, searchQuery, sortBy]);

  const productCategories = ['all', ...new Set(availableProducts.map((p) => p.style).filter(Boolean))];

  const filteredAvailableProducts = availableProducts.filter((p) => {
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

  // Dynamic Recent Activities derived from real catalogs & brand products
  const recentActivities = useMemo(() => {
    const acts = [];
    catalogs.slice(0, 3).forEach((cat, idx) => {
      if (cat.isPublished) {
        acts.push({
          id: `act-pub-${cat.id}`,
          title: `${cat.title} yayınlandı`,
          subtitle: `${cat.itemCount || 0} ürün • Web & PDF aktif`,
          time: idx === 0 ? '2 saat önce' : `${idx + 1} gün önce`,
          type: 'published'
        });
      } else {
        acts.push({
          id: `act-draft-${cat.id}`,
          title: `${cat.title} taslak kaydedildi`,
          subtitle: 'Düzenlemeye hazır',
          time: '5 saat önce',
          type: 'draft'
        });
      }
    });

    if (availableProducts.length > 0) {
      const firstProd = availableProducts[0];
      acts.push({
        id: 'act-prod-update',
        title: 'Bir ürün güncellendi',
        subtitle: `${firstProd.name} ${firstProd.width || 60}x${firstProd.height || 120}`,
        time: '1 gün önce',
        type: 'product'
      });
    }

    if (catalogs.some((c) => c.downloadCount > 0)) {
      const dlCat = catalogs.find((c) => c.downloadCount > 0) || catalogs[0];
      acts.push({
        id: 'act-pdf-dl',
        title: 'PDF indirildi',
        subtitle: dlCat?.title || '2026 Genel Katalog',
        time: '2 gün önce',
        type: 'pdf'
      });
    }

    // Fallback default realistic items if brand has no catalogs yet
    if (acts.length === 0) {
      return [
        { id: 'd1', title: 'Catalog Studio hazır', subtitle: 'İlk kataloğunuzu oluşturun', time: 'Şimdi', type: 'published' },
        { id: 'd2', title: '4 Profesyonel Şablon', subtitle: 'Milano, Spec, Showroom, Export', time: 'Aktif', type: 'draft' }
      ];
    }

    return acts.slice(0, 5);
  }, [catalogs, availableProducts]);

  // Calculate estimated page count for card display
  const getEstimatedPages = (cat) => {
    const count = cat.itemCount || 6;
    if (cat.template === 'milano' || cat.template === 'deco') return count * 2 + 4;
    if (cat.template === 'lidya') return count + 5;
    return count + 3;
  };

  const STEPS = [
    { num: 1, label: 'Katalog Bilgileri', desc: 'Başlık, kapak & dil' },
    { num: 2, label: `Ürün Seçimi (${formData.selectedItems.length})`, desc: 'Koleksiyon karoları' },
    { num: 3, label: 'Şablon Seçimi', desc: 'Profesyonel presetler' },
    { num: 4, label: 'Kurumsal Kimlik', desc: 'Logo & renkler' },
    { num: 5, label: 'Görünürlük', desc: 'Fiyat, QR & sayfalar' },
    { num: 6, label: 'Önizleme & Yayın', desc: 'PDF ve Web yayını' }
  ];

  // Aggregate KPI totals
  const totalViews = catalogs.reduce((acc, c) => acc + (c.viewCount || 0), 0);
  const totalDownloads = catalogs.reduce((acc, c) => acc + (c.downloadCount || 0), 0);
  const publishedCount = catalogs.filter((c) => c.isPublished).length;

  return (
    <div className="w-full flex flex-col gap-5 font-sans text-neutral-900">
      {/* Toast Notifications */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-center justify-between shadow-xs animate-in fade-in">
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
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-sm flex items-center justify-between shadow-xs animate-in fade-in">
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
      {/* VIEW MODE 1: CATALOG STUDIO LANDING PAGE (EXACT VISUAL REFERENCE LAYOUT)  */}
      {/* ========================================================================= */}
      {viewMode === 'list' && (
        <div className="space-y-5 pb-20">
          {/* Top Breadcrumb Row */}
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <div className="flex items-center gap-2">
              <span className="hover:text-neutral-800 cursor-pointer">Marka Paneli</span>
              <ChevronRight size={13} className="text-neutral-400" />
              <span className="font-bold text-neutral-800">Dijital Kataloglar</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-[11px] text-neutral-400">
              <span>Aktif Marka:</span>
              <strong className="text-neutral-700">{brandInfo?.name || 'Seramik Markası'}</strong>
            </div>
          </div>

          {/* Main 2-Column Asymmetric Studio Layout (Left Content + Right Sticky Panel) */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            {/* ==================== LEFT MAIN COLUMN (9 COLS) ==================== */}
            <div className="xl:col-span-9 space-y-5">
              {/* 1. HERO BANNER (Exact match to uploaded reference image) */}
              <div
                className="relative rounded-2xl border border-stone-200/90 overflow-hidden shadow-xs p-6 sm:p-8 flex flex-col lg:flex-row items-center justify-between gap-6"
                style={{
                  background:
                    'linear-gradient(90deg, rgba(250,248,245,0.97) 0%, rgba(247,243,237,0.93) 50%, rgba(235,227,215,0.75) 100%), url(/renders/modern_living_natural_oak.jpg) right center / cover no-repeat'
                }}
              >
                {/* Left Hero Content */}
                <div className="space-y-3.5 max-w-xl z-10">
                  <span className="text-[11px] font-extrabold tracking-[0.2em] uppercase text-[#b4823c] block">
                    CATALOG STUDIO
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight leading-tight">
                    Dijital Kataloglar & Lookbook Oluşturucu
                  </h1>
                  <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                    Ürünlerinizi profesyonel kataloglara dönüştürün. Kataloglarınızı kolayca güncelleyin, farklı pazarlara özel versiyonlar oluşturun ve müşterilerinizle paylaşın.
                  </p>

                  {/* 5 Feature Pills Row */}
                  <div className="pt-2 flex flex-wrap items-center gap-2 sm:gap-3">
                    {[
                      { icon: BookOpen, label: 'Profesyonel Şablonlar' },
                      { icon: Edit, label: 'Kolay Düzenleme' },
                      { icon: FileText, label: 'PDF & Web Yayın' },
                      { icon: RefreshCw, label: 'Otomatik Güncelleme' },
                      { icon: Globe, label: 'Çok Dilli Destek' }
                    ].map((pill, idx) => {
                      const PillIcon = pill.icon;
                      return (
                        <div
                          key={idx}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-xs border border-stone-200/80 shadow-2xs text-xs font-semibold text-neutral-700"
                        >
                          <div className="w-6 h-6 rounded-lg bg-amber-50 text-[#b4823c] flex items-center justify-center flex-shrink-0">
                            <PillIcon size={13} />
                          </div>
                          <span className="whitespace-nowrap">{pill.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right Floating Catalog Booklet Showcase Card */}
                <div className="relative z-10 flex-shrink-0 w-full sm:w-auto flex justify-center">
                  <div
                    onClick={() => handleStartNew('milano', 1)}
                    className="group cursor-pointer bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-xl border border-stone-200/80 flex items-center gap-4 hover:scale-[1.02] transition-all max-w-xs"
                  >
                    {/* Mini 3D Catalog Cover Thumbnail */}
                    <div
                      className="w-28 h-36 rounded-xl overflow-hidden relative shadow-md flex flex-col justify-between p-3 text-white flex-shrink-0"
                      style={{
                        background:
                          'linear-gradient(180deg, rgba(15,23,42,0.75) 0%, rgba(15,23,42,0.4) 50%, rgba(15,23,42,0.85) 100%), url(/renders/luxury_bathroom_calacatta_gold.jpg) center/cover no-repeat'
                      }}
                    >
                      <div className="text-[9px] font-serif tracking-widest uppercase text-amber-200">
                        SERAMİK KOLEKSİYONU 2026
                      </div>
                      <div className="text-[8px] font-mono text-white/80 border-t border-white/20 pt-1">
                        SeramikBak
                      </div>
                    </div>

                    {/* Right CTA Text & Round Gold Arrow */}
                    <div className="pr-2 space-y-2.5">
                      <div className="text-sm font-extrabold text-neutral-900 leading-snug">
                        Katalog Oluştur ve Paylaş
                      </div>
                      <p className="text-[11px] text-neutral-500 leading-tight">
                        Dakikalar içinde PDF ve interaktif web lookbook
                      </p>
                      <div className="w-8 h-8 rounded-full bg-[#b4823c] group-hover:bg-[#9a6b2b] text-white flex items-center justify-center shadow-sm transition">
                        <ChevronRight size={16} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. KPI METRICS STRIP + "+ Yeni Katalog Oluştur" CTA BUTTON */}
              <div className="grid grid-cols-2 lg:grid-cols-12 gap-3 items-stretch">
                {/* KPI 1: Toplam Katalog */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200/80 p-4 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 text-[#b4823c] flex items-center justify-center flex-shrink-0">
                      <BookOpen size={17} />
                    </div>
                    <span className="text-xs font-medium text-neutral-500">Toplam Katalog</span>
                  </div>
                  <div className="flex items-end justify-between mt-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-extrabold text-neutral-900">{catalogs.length}</span>
                      <span className="text-[11px] font-bold text-emerald-600">+2 yeni</span>
                    </div>
                    <ArrowRight size={14} className="text-neutral-300" />
                  </div>
                </div>

                {/* KPI 2: Toplam Görüntülenme */}
                <div className="lg:col-span-3 bg-white rounded-2xl border border-neutral-200/80 p-4 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
                      <Eye size={17} />
                    </div>
                    <span className="text-xs font-medium text-neutral-500">Toplam Görüntülenme</span>
                  </div>
                  <div className="flex items-end justify-between mt-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-extrabold text-neutral-900">
                        {totalViews.toLocaleString('tr-TR')}
                      </span>
                      <span className="text-[11px] font-bold text-emerald-600">+%18</span>
                    </div>
                    <ArrowRight size={14} className="text-neutral-300" />
                  </div>
                </div>

                {/* KPI 3: Toplam İndirme */}
                <div className="lg:col-span-3 bg-white rounded-2xl border border-neutral-200/80 p-4 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                      <Download size={17} />
                    </div>
                    <span className="text-xs font-medium text-neutral-500">Toplam İndirme</span>
                  </div>
                  <div className="flex items-end justify-between mt-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-extrabold text-neutral-900">
                        {totalDownloads.toLocaleString('tr-TR')}
                      </span>
                      <span className="text-[11px] font-bold text-emerald-600">+%27</span>
                    </div>
                    <ArrowRight size={14} className="text-neutral-300" />
                  </div>
                </div>

                {/* KPI 4: Aktif Web Katalog */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200/80 p-4 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
                      <Globe size={17} />
                    </div>
                    <span className="text-xs font-medium text-neutral-500">Aktif Web Katalog</span>
                  </div>
                  <div className="flex items-end justify-between mt-3">
                    <span className="text-2xl font-extrabold text-neutral-900">{publishedCount}</span>
                    <ArrowRight size={14} className="text-neutral-300" />
                  </div>
                </div>

                {/* Primary Gold Action Button: + Yeni Katalog Oluştur */}
                <div className="col-span-2 lg:col-span-2 flex items-stretch">
                  <button
                    type="button"
                    onClick={() => handleStartNew('milano', 1)}
                    className="w-full rounded-2xl bg-[#b4823c] hover:bg-[#9f7131] text-white font-bold text-xs sm:text-sm px-4 py-4 shadow-sm hover:shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Plus size={18} strokeWidth={2.5} />
                    <span>Yeni Katalog Oluştur</span>
                  </button>
                </div>
              </div>

              {/* 3. SEARCH, FILTER, VIEW MODE & SORT TOOLBAR */}
              <div className="bg-white rounded-2xl border border-neutral-200/80 p-3 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                {/* Left: Search Input + Filtreler Button + Quick Status Tabs */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Katalog adı, koleksiyon veya kelime ara..."
                      className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-[#b4823c]"
                    />
                  </div>

                  {/* Filter Status Pills */}
                  <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl">
                    {[
                      { id: 'all', label: 'Tüm Kataloglar' },
                      { id: 'published', label: 'Yayınlananlar' },
                      { id: 'draft', label: 'Taslaklar' },
                      { id: 'archived', label: 'Arşiv' }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setFilterTab(tab.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                          filterTab === tab.id
                            ? 'bg-white text-neutral-900 shadow-2xs font-bold'
                            : 'text-neutral-600 hover:text-neutral-900'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right: Grid/List Toggle & Sort Dropdown */}
                <div className="flex items-center justify-between sm:justify-end gap-2">
                  <div className="flex items-center bg-neutral-100 p-1 rounded-xl border border-neutral-200/60">
                    <button
                      type="button"
                      onClick={() => setCardDisplayMode('grid')}
                      className={`p-1.5 rounded-lg transition cursor-pointer ${
                        cardDisplayMode === 'grid' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-500'
                      }`}
                      title="Kart Görünümü"
                    >
                      <LayoutGrid size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setCardDisplayMode('list')}
                      className={`p-1.5 rounded-lg transition cursor-pointer ${
                        cardDisplayMode === 'list' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-500'
                      }`}
                      title="Liste Görünümü"
                    >
                      <List size={15} />
                    </button>
                  </div>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-700 focus:outline-none focus:border-[#b4823c]"
                  >
                    <option value="updated_desc">Sıralama: En son düzenlenen</option>
                    <option value="views_desc">Sıralama: En çok görüntülenen</option>
                    <option value="downloads_desc">Sıralama: En çok indirilen</option>
                    <option value="title_asc">Sıralama: A - Z</option>
                  </select>
                </div>
              </div>

              {/* 4. CATALOG CARDS GRID (4-Column Responsive Grid matching reference image) */}
              {loading ? (
                <div className="bg-white rounded-2xl border border-neutral-200/80 py-20 flex flex-col items-center justify-center text-neutral-400">
                  <Loader2 size={32} className="animate-spin text-[#b4823c] mb-2" />
                  <p className="text-xs font-bold">Kataloglar yükleniyor...</p>
                </div>
              ) : filteredCatalogs.length === 0 ? (
                <div className="bg-white rounded-2xl border border-neutral-200/80 p-12 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 text-[#b4823c] flex items-center justify-center mx-auto mb-3 shadow-2xs">
                    <BookOpen size={26} />
                  </div>
                  <h3 className="text-base font-bold text-neutral-900 mb-1">Katalog Bulunamadı</h3>
                  <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-5 leading-relaxed">
                    Ürün portföyünüzden seramikleri seçerek profesyonel bir dijital katalog veya lookbook hazırlayın.
                  </p>
                  <button
                    onClick={() => handleStartNew('milano', 1)}
                    className="px-5 py-2.5 rounded-xl bg-[#b4823c] hover:bg-[#9f7131] text-white font-bold text-xs inline-flex items-center gap-2 shadow-xs transition cursor-pointer"
                  >
                    <Plus size={15} />
                    <span>Yeni Katalog Oluştur</span>
                  </button>
                </div>
              ) : cardDisplayMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {filteredCatalogs.map((cat, idx) => {
                    const tplInfo = TEMPLATES.find((t) => t.id === cat.template) || TEMPLATES[0];
                    const coverImg = CARD_COVERS[idx % CARD_COVERS.length] || tplInfo.mockupImg;
                    const pageCount = getEstimatedPages(cat);
                    const outdatedChanges = detectOutdatedProducts(cat);

                    return (
                      <div
                        key={cat.id}
                        className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs hover:shadow-md hover:border-amber-300/80 transition-all overflow-hidden flex flex-col justify-between group relative"
                      >
                        {/* Top Cover Visual */}
                        <div
                          onClick={() => handleOpenPreview(cat)}
                          className="relative h-44 w-full cursor-pointer overflow-hidden p-4 flex flex-col justify-between text-white"
                          style={{
                            background: `linear-gradient(180deg, rgba(15,23,42,0.55) 0%, rgba(15,23,42,0.2) 45%, rgba(15,23,42,0.85) 100%), url(${coverImg}) center/cover no-repeat`,
                            backgroundColor: '#18181b'
                          }}
                        >
                          {/* Top Right Status Pill Badge (Exact match to reference image) */}
                          <div className="flex items-center justify-between z-10">
                            {outdatedChanges.length > 0 ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSyncModalCatalog({ catalog: cat, changes: outdatedChanges });
                                }}
                                className="px-2 py-0.5 rounded-full bg-amber-500 text-neutral-950 font-extrabold text-[10px] flex items-center gap-1 shadow"
                                title="Ürün güncellemesi mevcut"
                              >
                                <RefreshCw size={10} />
                                <span>Güncelleme Var</span>
                              </button>
                            ) : (
                              <span />
                            )}

                            {cat._isArchived ? (
                              <span className="px-2.5 py-1 rounded-full bg-neutral-700/90 backdrop-blur-xs text-white text-[10px] font-bold flex items-center gap-1">
                                <span>Arşiv</span>
                              </span>
                            ) : cat.isPublished ? (
                              <span className="px-2.5 py-1 rounded-full bg-emerald-600/95 backdrop-blur-xs text-white text-[10px] font-bold flex items-center gap-1 shadow-xs">
                                <CheckCircle2 size={11} />
                                <span>Yayınlandı</span>
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full bg-sky-600/95 backdrop-blur-xs text-white text-[10px] font-bold flex items-center gap-1 shadow-xs">
                                <Clock size={11} />
                                <span>Taslak</span>
                              </span>
                            )}
                          </div>

                          {/* Cover Overlay Typography */}
                          <div className="z-10 my-auto">
                            <p className="text-xs font-serif tracking-wider uppercase text-white/95 font-bold line-clamp-2 drop-shadow">
                              {cat.coverTitle || cat.title}
                            </p>
                            <span className="text-[9px] font-mono uppercase tracking-widest text-amber-200/90 block mt-0.5">
                              {tplInfo.name}
                            </span>
                          </div>
                        </div>

                        {/* Card Body: Title, Subtitle, Stats & Actions */}
                        <div className="p-4 flex-1 flex flex-col justify-between bg-white">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h3
                                onClick={() => handleOpenPreview(cat)}
                                className="text-sm font-extrabold text-neutral-900 hover:text-[#b4823c] cursor-pointer truncate"
                                title={cat.title}
                              >
                                {cat.title}
                              </h3>

                              {/* 3-Dots Context Menu */}
                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={() => setOpenMenuId(openMenuId === cat.id ? null : cat.id)}
                                  className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 cursor-pointer"
                                >
                                  <MoreVertical size={15} />
                                </button>

                                {openMenuId === cat.id && (
                                  <div className="absolute right-0 top-7 w-48 bg-white rounded-xl shadow-xl border border-neutral-200 py-1.5 z-40 text-xs font-semibold text-neutral-700">
                                    <button
                                      type="button"
                                      onClick={() => handleEdit(cat, true)}
                                      className="w-full px-3.5 py-2 text-left hover:bg-amber-50 hover:text-[#b4823c] flex items-center gap-2"
                                    >
                                      <Wand2 size={13} />
                                      <span>Gelişmiş Studio ile Aç</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleCopyLink(cat.publicSlug)}
                                      className="w-full px-3.5 py-2 text-left hover:bg-neutral-50 flex items-center gap-2"
                                    >
                                      <Share2 size={13} />
                                      <span>Paylaşım Linkini Kopyala</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDuplicate(cat)}
                                      className="w-full px-3.5 py-2 text-left hover:bg-neutral-50 flex items-center gap-2"
                                    >
                                      <Copy size={13} />
                                      <span>Kataloğu Kopyala</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setOpenMenuId(null);
                                        setVersionModalCatalog(cat);
                                      }}
                                      className="w-full px-3.5 py-2 text-left hover:bg-neutral-50 flex items-center gap-2"
                                    >
                                      <History size={13} />
                                      <span>Sürüm Geçmişi</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleToggleArchive(cat)}
                                      className="w-full px-3.5 py-2 text-left hover:bg-neutral-50 flex items-center gap-2"
                                    >
                                      <Archive size={13} />
                                      <span>{cat._isArchived ? 'Arşivden Çıkar' : 'Arşivle'}</span>
                                    </button>
                                    <div className="my-1 border-t border-neutral-100" />
                                    <button
                                      type="button"
                                      onClick={() => handleDelete(cat)}
                                      className="w-full px-3.5 py-2 text-left text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                                    >
                                      <Trash2 size={13} />
                                      <span>Kataloğu Sil</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>

                            <p className="text-xs text-neutral-500 mt-0.5 truncate">
                              {cat.itemCount || 0} koleksiyon ürünü • {pageCount} sayfa
                            </p>

                            {/* Metrics Row: Views, Downloads, Date */}
                            <div className="flex items-center justify-between text-[11px] text-neutral-500 mt-3 pt-2.5 border-t border-neutral-100">
                              <span className="flex items-center gap-1" title="Görüntülenme">
                                <Eye size={12} className="text-neutral-400" />
                                <span>{(cat.viewCount || 0).toLocaleString('tr-TR')}</span>
                              </span>
                              <span className="flex items-center gap-1" title="PDF İndirme">
                                <Download size={12} className="text-neutral-400" />
                                <span>{(cat.downloadCount || 0).toLocaleString('tr-TR')}</span>
                              </span>
                              <span className="text-[10px] text-neutral-400 font-mono">
                                {new Date(cat.updatedAt || Date.now()).toLocaleDateString('tr-TR')}
                              </span>
                            </div>
                          </div>

                          {/* Dual Bottom Action Buttons: [ Önizle ] [ Düzenle ] */}
                          <div className="grid grid-cols-2 gap-2 mt-3.5 pt-1">
                            <button
                              type="button"
                              onClick={() => handleOpenPreview(cat)}
                              className="py-2 px-3 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                            >
                              <Eye size={13} />
                              <span>Önizle</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleEdit(cat, false)}
                              className="py-2 px-3 rounded-xl bg-[#b4823c] hover:bg-[#9f7131] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition cursor-pointer"
                            >
                              <Edit size={13} />
                              <span>Düzenle</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* List View Mode */
                <div className="bg-white rounded-2xl border border-neutral-200/90 overflow-hidden divide-y divide-neutral-100">
                  {filteredCatalogs.map((cat, idx) => {
                    const tplInfo = TEMPLATES.find((t) => t.id === cat.template) || TEMPLATES[0];
                    const coverImg = CARD_COVERS[idx % CARD_COVERS.length] || tplInfo.mockupImg;
                    return (
                      <div
                        key={cat.id}
                        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-neutral-50/70 transition"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <img
                            src={coverImg}
                            alt={cat.title}
                            className="w-14 h-16 rounded-xl object-cover border border-neutral-200 flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-extrabold text-neutral-900 truncate">{cat.title}</h4>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  cat.isPublished ? 'bg-emerald-100 text-emerald-800' : 'bg-sky-100 text-sky-800'
                                }`}
                              >
                                {cat.isPublished ? 'Yayınlandı' : 'Taslak'}
                              </span>
                            </div>
                            <p className="text-xs text-neutral-500 mt-0.5">
                              {tplInfo.name} • {cat.itemCount || 0} Ürün • {getEstimatedPages(cat)} Sayfa
                            </p>
                            <div className="flex items-center gap-4 text-[11px] text-neutral-400 mt-1">
                              <span>{cat.viewCount || 0} görüntülenme</span>
                              <span>{cat.downloadCount || 0} indirme</span>
                              <span>{new Date(cat.updatedAt || Date.now()).toLocaleDateString('tr-TR')}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => handleOpenPreview(cat)}
                            className="px-3.5 py-2 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-100 text-xs font-bold text-neutral-700 flex items-center gap-1.5"
                          >
                            <Eye size={13} />
                            <span>Önizle</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEdit(cat, false)}
                            className="px-3.5 py-2 rounded-xl bg-[#b4823c] hover:bg-[#9f7131] text-white text-xs font-bold flex items-center gap-1.5"
                          >
                            <Edit size={13} />
                            <span>Düzenle</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(cat)}
                            className="p-2 rounded-xl border border-neutral-200 hover:bg-rose-50 text-neutral-500 hover:text-rose-600"
                            title="Sil"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ==================== RIGHT SIDEBAR COLUMN (3 COLS) ==================== */}
            <div className="xl:col-span-3 space-y-5">
              {/* 1. Hızlı İşlemler Card */}
              <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-2xs space-y-3.5">
                <div className="flex items-center gap-2 pb-1">
                  <Sparkles size={16} className="text-[#b4823c]" />
                  <h3 className="text-sm font-extrabold text-neutral-900">Hızlı İşlemler</h3>
                </div>

                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={() => handleStartNew('milano', 1)}
                    className="w-full p-3 rounded-xl border border-neutral-200/80 hover:border-[#b4823c] bg-neutral-50/50 hover:bg-amber-50/30 flex items-center gap-3 text-left transition group cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200/60 text-[#b4823c] flex items-center justify-center flex-shrink-0 group-hover:bg-[#b4823c] group-hover:text-white transition">
                      <Plus size={17} />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-neutral-900">Yeni Katalog Oluştur</p>
                      <p className="text-[11px] text-neutral-500">Şablon seç ve hemen başla</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStartNew('milano', 2)}
                    className="w-full p-3 rounded-xl border border-neutral-200/80 hover:border-[#b4823c] bg-neutral-50/50 hover:bg-amber-50/30 flex items-center gap-3 text-left transition group cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200/60 text-[#b4823c] flex items-center justify-center flex-shrink-0 group-hover:bg-[#b4823c] group-hover:text-white transition">
                      <Layers size={17} />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-neutral-900">Ürün Seç</p>
                      <p className="text-[11px] text-neutral-500">Ürün kütüphanesinden ürün ekle</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewMode('templates-gallery')}
                    className="w-full p-3 rounded-xl border border-neutral-200/80 hover:border-[#b4823c] bg-neutral-50/50 hover:bg-amber-50/30 flex items-center gap-3 text-left transition group cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200/60 text-[#b4823c] flex items-center justify-center flex-shrink-0 group-hover:bg-[#b4823c] group-hover:text-white transition">
                      <BookOpen size={17} />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-neutral-900">Şablon Galerisi</p>
                      <p className="text-[11px] text-neutral-500">{TEMPLATES.length} farklı profesyonel şablon</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStartNew('milano', 4)}
                    className="w-full p-3 rounded-xl border border-neutral-200/80 hover:border-[#b4823c] bg-neutral-50/50 hover:bg-amber-50/30 flex items-center gap-3 text-left transition group cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200/60 text-[#b4823c] flex items-center justify-center flex-shrink-0 group-hover:bg-[#b4823c] group-hover:text-white transition">
                      <Settings size={17} />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-neutral-900">Marka Ayarları</p>
                      <p className="text-[11px] text-neutral-500">Logo, renk ve iletişim bilgilerin</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* 2. Son Aktiviteler Card */}
              <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-[#b4823c]" />
                    <h3 className="text-sm font-extrabold text-neutral-900">Son Aktiviteler</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFilterTab('all')}
                    className="text-[11px] font-semibold text-neutral-400 hover:text-neutral-700"
                  >
                    Tümünü Gör
                  </button>
                </div>

                <div className="space-y-3">
                  {recentActivities.map((act) => (
                    <div key={act.id} className="flex items-start gap-3">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          act.type === 'published'
                            ? 'bg-amber-50 text-[#b4823c]'
                            : act.type === 'draft'
                            ? 'bg-sky-50 text-sky-600'
                            : act.type === 'product'
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-rose-50 text-rose-600'
                        }`}
                      >
                        {act.type === 'published' && <BookOpen size={14} />}
                        {act.type === 'draft' && <FileText size={14} />}
                        {act.type === 'product' && <RefreshCw size={14} />}
                        {act.type === 'pdf' && <Download size={14} />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-neutral-800 leading-snug">{act.title}</p>
                        <p className="text-[11px] text-neutral-500 truncate">{act.subtitle}</p>
                        <span className="text-[10px] text-neutral-400 block mt-0.5">{act.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Promo Card: Dijital Kataloğun Gücünü Keşfedin */}
              <div
                className="rounded-2xl p-5 text-white shadow-md relative overflow-hidden flex flex-col justify-between min-h-[190px]"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(24,24,27,0.88) 60%, rgba(180,130,60,0.45) 100%), url(/renders/luxury_bathroom_albatros_antrasit.jpg) center/cover no-repeat'
                }}
              >
                <div className="space-y-2 z-10 max-w-[200px]">
                  <h4 className="text-base font-extrabold leading-snug">
                    Dijital Kataloğun Gücünü Keşfedin
                  </h4>
                  <p className="text-[11px] text-neutral-300 leading-relaxed">
                    Daha fazla müşteri, daha fazla etkileşim, daha fazla satış.
                  </p>
                </div>

                <div className="pt-4 z-10">
                  <button
                    type="button"
                    onClick={() => handleStartNew('milano', 1)}
                    className="px-4 py-2 rounded-xl bg-[#b4823c] hover:bg-[#9f7131] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow transition cursor-pointer"
                  >
                    <span>Detaylı Bilgi</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW MODE: TEMPLATE GALLERY (ŞABLON GALERİSİ)                             */}
      {/* ========================================================================= */}
      {viewMode === 'templates-gallery' && (
        <div className="space-y-5 pb-16">
          <div className="bg-white rounded-2xl border border-neutral-200 p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <h2 className="text-lg font-extrabold text-neutral-900">Profesyonel Katalog Şablonları</h2>
                <p className="text-xs text-neutral-500">
                  Koleksiyonunuza uygun şablonu seçerek hemen kataloğunuzu oluşturmaya başlayın.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {TEMPLATES.map((tpl) => (
              <div
                key={tpl.id}
                className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-2xs hover:shadow-lg transition flex flex-col justify-between"
              >
                <div
                  className="h-48 p-5 flex flex-col justify-between text-white relative"
                  style={{
                    background: `linear-gradient(180deg, rgba(15,23,42,0.7) 0%, rgba(15,23,42,0.85) 100%), url(${tpl.mockupImg}) center/cover no-repeat`
                  }}
                >
                  <span className="self-start px-2.5 py-1 rounded-md bg-black/50 backdrop-blur-xs text-[10px] font-mono font-bold text-amber-300 uppercase">
                    {tpl.badge}
                  </span>
                  <div>
                    <h3 className="text-xl font-serif font-bold">{tpl.name}</h3>
                    <span className="text-xs text-neutral-300">{tpl.tag}</span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <p className="text-xs text-neutral-600 leading-relaxed">{tpl.desc}</p>
                  <button
                    type="button"
                    onClick={() => handleStartNew(tpl.id, 1)}
                    className="w-full py-2.5 rounded-xl bg-[#b4823c] hover:bg-[#9f7131] text-white text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <span>Bu Şablonla Katalog Oluştur</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW MODE 2: CATALOG STUDIO EDITOR (KOLAY MOD + GELİŞMİŞ STUDIO)          */}
      {/* ========================================================================= */}
      {viewMode === 'editor' && (
        <div className="space-y-4 pb-16">
          {/* Editor Top Header with Mode Switcher (Kolay Mod / Gelişmiş Studio) */}
          <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="p-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition flex-shrink-0 cursor-pointer"
                title="Katalog Listesine Dön"
              >
                <ArrowLeft size={16} />
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[#b4823c] bg-amber-50 px-2 py-0.5 rounded border border-amber-200 uppercase tracking-wide">
                    {activeCatalogId ? 'Katalog Düzenleme' : 'Yeni Katalog Stüdyosu'}
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400">
                    {formData.dataMode === 'live' ? '• Canlı Ürün Verisi' : '• Sabit Sürüm (Snapshot)'}
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-extrabold text-neutral-900 mt-0.5 truncate">
                  {formData.title || 'Başlıksız Katalog'}
                </h2>
              </div>
            </div>

            {/* Center: Mode Switcher (Kolay Mod vs Gelişmiş Studio) */}
            <div className="flex items-center bg-neutral-100 p-1 rounded-xl border border-neutral-200 self-start lg:self-center">
              <button
                type="button"
                onClick={() => setStudioMode('easy')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  studioMode === 'easy'
                    ? 'bg-white text-neutral-900 shadow-2xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <Sparkles size={13} className="text-[#b4823c]" />
                <span>Kolay Mod (Adım Adım)</span>
              </button>
              <button
                type="button"
                onClick={() => setStudioMode('advanced')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  studioMode === 'advanced'
                    ? 'bg-neutral-900 text-white shadow-2xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <Wand2 size={13} className="text-amber-400" />
                <span>Gelişmiş Studio (Sürükle-Bırak)</span>
              </button>
            </div>

            {/* Right: Save Draft & Publish Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSaveCatalog(false)}
                disabled={saving}
                className="px-4 py-2.5 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-neutral-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                {saving ? <Loader2 size={13} className="animate-spin" /> : null}
                <span>Taslak Kaydet</span>
              </button>
              <button
                type="button"
                onClick={() => handleSaveCatalog(true)}
                disabled={saving}
                className="px-4 py-2.5 rounded-xl bg-[#b4823c] hover:bg-[#9f7131] text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles size={14} />
                <span>Kataloğu Yayınla</span>
              </button>
            </div>
          </div>

          {/* ==================== MODE A: GELİŞMİŞ STUDIO ==================== */}
          {studioMode === 'advanced' ? (
            <CatalogVisualCanvasEditor
              initialPages={formData.customCanvasPages}
              brandProducts={availableProducts}
              brandInfo={brandInfo}
              onChangePages={(updatedPages) =>
                setFormData((prev) => ({ ...prev, customCanvasPages: updatedPages }))
              }
              onSaveDraft={() => handleSaveCatalog(false)}
            />
          ) : (
            /* ==================== MODE B: KOLAY MOD (6 ADIMLI SİHİRBAZ) ==================== */
            <>
              {/* Stepper Navigation */}
              <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs p-3 sm:p-4">
                <div className="hidden lg:grid grid-cols-6 gap-2">
                  {STEPS.map((step) => {
                    const isActive = activeStep === step.num;
                    const isPassed = activeStep > step.num;

                    return (
                      <button
                        key={step.num}
                        type="button"
                        onClick={() => setActiveStep(step.num)}
                        className={`p-2.5 rounded-xl text-left border transition flex items-center gap-2.5 cursor-pointer ${
                          isActive
                            ? 'border-[#b4823c] bg-amber-50/50 shadow-2xs ring-2 ring-[#b4823c]/20'
                            : isPassed
                            ? 'border-emerald-200 bg-emerald-50/40 text-emerald-900'
                            : 'border-neutral-200 bg-neutral-50/40 text-neutral-500 hover:bg-neutral-100'
                        }`}
                      >
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                            isActive
                              ? 'bg-[#b4823c] text-white'
                              : isPassed
                              ? 'bg-emerald-600 text-white'
                              : 'bg-neutral-200 text-neutral-600'
                          }`}
                        >
                          {isPassed ? <Check size={13} /> : step.num}
                        </span>
                        <div className="overflow-hidden">
                          <p
                            className={`text-xs font-bold truncate ${
                              isActive ? 'text-neutral-900' : isPassed ? 'text-emerald-950' : 'text-neutral-700'
                            }`}
                          >
                            {step.label}
                          </p>
                          <p className="text-[10px] text-neutral-400 truncate">{step.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Mobile Stepper */}
                <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto pb-1">
                  {STEPS.map((step) => (
                    <button
                      key={step.num}
                      type="button"
                      onClick={() => setActiveStep(step.num)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                        activeStep === step.num
                          ? 'bg-[#b4823c] text-white'
                          : 'bg-neutral-100 text-neutral-600'
                      }`}
                    >
                      {step.num}. {step.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step Content Area */}
              <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs p-5 sm:p-8">
                {/* STEP 1: KATALOG BİLGİLERİ & ÇOK DİLLİ AYARLAR */}
                {activeStep === 1 && (
                  <div className="space-y-6 max-w-3xl">
                    <div className="border-b border-neutral-100 pb-4">
                      <h3 className="text-lg font-extrabold text-neutral-900 flex items-center gap-2">
                        <FileText size={20} className="text-[#b4823c]" />
                        <span>1. Katalog Temel Bilgileri & Yayın Dili</span>
                      </h3>
                      <p className="text-xs text-neutral-500 mt-1">
                        Kataloğunuzun başlığı, kapak metinleri, dil seçeneği ve ürün senkronizasyon davranışını belirleyin.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-xs font-bold text-neutral-800">Katalog Resmi Adı *</label>
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          placeholder="Örn: 2026 Genel Katalog"
                          className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:border-[#b4823c]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-neutral-800">Kapak Ana Başlığı</label>
                        <input
                          type="text"
                          value={formData.coverTitle}
                          onChange={(e) => setFormData({ ...formData, coverTitle: e.target.value })}
                          placeholder="SERAMİK KOLEKSİYONU 2026"
                          className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:border-[#b4823c]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-neutral-800">Kapak Alt Başlığı</label>
                        <input
                          type="text"
                          value={formData.coverSubtitle}
                          onChange={(e) => setFormData({ ...formData, coverSubtitle: e.target.value })}
                          placeholder="TECHNICAL & ARCHITECTURAL CATALOG"
                          className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:border-[#b4823c]"
                        />
                      </div>

                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-xs font-bold text-neutral-800">Giriş / Koleksiyon Önsöz Metni</label>
                        <textarea
                          rows={3}
                          value={formData.introText}
                          onChange={(e) => setFormData({ ...formData, introText: e.target.value })}
                          className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:border-[#b4823c]"
                        />
                      </div>

                      {/* Orientation */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-neutral-800">Sayfa Yönlendirmesi & Ölçü</label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, orientation: 'portrait' })}
                            className={`p-3 rounded-xl border-2 text-left transition ${
                              formData.orientation === 'portrait'
                                ? 'border-[#b4823c] bg-amber-50/40 font-bold'
                                : 'border-neutral-200 bg-neutral-50'
                            }`}
                          >
                            <p className="text-xs font-bold">A4 Dikey (Portrait)</p>
                            <p className="text-[10px] text-neutral-400">210 × 297 mm</p>
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, orientation: 'landscape' })}
                            className={`p-3 rounded-xl border-2 text-left transition ${
                              formData.orientation === 'landscape'
                                ? 'border-[#b4823c] bg-amber-50/40 font-bold'
                                : 'border-neutral-200 bg-neutral-50'
                            }`}
                          >
                            <p className="text-xs font-bold">A4 Yatay (Landscape)</p>
                            <p className="text-[10px] text-neutral-400">297 × 210 mm</p>
                          </button>
                        </div>
                      </div>

                      {/* Multi-Language Support (TR, EN, DE, AR) */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-neutral-800">Katalog Yayın Dili</label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { code: 'tr', label: '🇹🇷 Türkçe', sub: 'İç Pazar' },
                            { code: 'en', label: '🇬🇧 English', sub: 'Global Export' },
                            { code: 'de', label: '🇩🇪 Deutsch', sub: 'Avrupa Pazarı' },
                            { code: 'ar', label: '🇸🇦 العربية', sub: 'MENA Pazarı' }
                          ].map((lang) => (
                            <button
                              key={lang.code}
                              type="button"
                              onClick={() => setFormData({ ...formData, language: lang.code })}
                              className={`p-2.5 rounded-xl border-2 text-left transition ${
                                formData.language === lang.code
                                  ? 'border-[#b4823c] bg-amber-50/40 font-bold'
                                  : 'border-neutral-200 bg-neutral-50'
                              }`}
                            >
                              <p className="text-xs font-bold">{lang.label}</p>
                              <p className="text-[10px] text-neutral-400">{lang.sub}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Data Sync Mode: Live vs Snapshot */}
                      <div className="space-y-1.5 md:col-span-2 pt-2">
                        <label className="text-xs font-bold text-neutral-800">
                          Akıllı Ürün Güncelleme ve Sürüm Davranışı
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, dataMode: 'live' })}
                            className={`p-3.5 rounded-xl border-2 text-left transition ${
                              formData.dataMode === 'live'
                                ? 'border-[#b4823c] bg-amber-50/40'
                                : 'border-neutral-200 bg-neutral-50'
                            }`}
                          >
                            <p className="text-xs font-extrabold text-neutral-900">1. Canlı Veri Modu (Önerilen)</p>
                            <p className="text-[11px] text-neutral-500 mt-0.5">
                              Ürün görseli veya ebadı güncellendiğinde sizi bilgilendirir; onayınızla sayfa tasarımını bozmadan günceller.
                            </p>
                          </button>

                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, dataMode: 'snapshot' })}
                            className={`p-3.5 rounded-xl border-2 text-left transition ${
                              formData.dataMode === 'snapshot'
                                ? 'border-[#b4823c] bg-amber-50/40'
                                : 'border-neutral-200 bg-neutral-50'
                            }`}
                          >
                            <p className="text-xs font-extrabold text-neutral-900">2. Sabit Sürüm (Arşiv Korumalı)</p>
                            <p className="text-[11px] text-neutral-500 mt-0.5">
                              Yayın anındaki ürün bilgileri ve katalog tasarımı sabitlenir, sonraki ürün değişikliklerinden etkilenmez.
                            </p>
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
                          <Layers size={20} className="text-[#b4823c]" />
                          <span>2. Ürün ve Koleksiyon Seçimi</span>
                        </h3>
                        <p className="text-xs text-neutral-500 mt-1">
                          Markanıza ait gerçek ürünleri arayın, filtreleyin, seçin ve katalog sayfa sırasını belirleyin.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              selectedItems: filteredAvailableProducts.map((p) => ({
                                productId: p.id,
                                customNote: '',
                                usageArea: p.style || 'İç Mekân'
                              }))
                            }))
                          }
                          className="px-3 py-1.5 rounded-lg border border-neutral-200 text-xs font-bold text-neutral-700 hover:bg-neutral-50"
                        >
                          Tümünü Seç
                        </button>
                        <span className="text-xs font-bold px-3.5 py-1.5 bg-amber-100 text-amber-900 rounded-full border border-amber-200">
                          {formData.selectedItems.length} Ürün Seçildi
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="relative">
                        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <input
                          type="text"
                          value={productSearch}
                          onChange={(e) => setProductSearch(e.target.value)}
                          placeholder="Ürün adı, kodu veya rengi ile ara..."
                          className="w-full pl-9 pr-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-medium"
                        />
                      </div>

                      <select
                        value={productCategoryFilter}
                        onChange={(e) => setProductCategoryFilter(e.target.value)}
                        className="px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-medium"
                      >
                        <option value="all">Tüm Koleksiyonlar ({availableProducts.length})</option>
                        {productCategories
                          .filter((c) => c !== 'all')
                          .map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div className="border border-neutral-200 rounded-2xl p-4 bg-neutral-50 max-h-80 overflow-y-auto">
                      {productsLoading ? (
                        <div className="py-12 text-center text-neutral-500">
                          <Loader2 size={24} className="animate-spin text-[#b4823c] mx-auto mb-2" />
                          <p className="text-xs font-bold">Ürünler yükleniyor...</p>
                        </div>
                      ) : filteredAvailableProducts.length === 0 ? (
                        <div className="py-12 text-center text-neutral-500 text-xs">Eşleşen ürün bulunamadı.</div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                          {filteredAvailableProducts.map((p) => {
                            const isSelected = formData.selectedItems.some((i) => i.productId === p.id);
                            return (
                              <div
                                key={p.id}
                                onClick={() => handleToggleProduct(p)}
                                className={`p-2.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                                  isSelected
                                    ? 'border-[#b4823c] bg-amber-50/60 shadow-2xs'
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
                                    <div className="absolute top-1.5 right-1.5 bg-[#b4823c] text-white font-bold rounded-full p-1 shadow">
                                      <Check size={12} />
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-neutral-800 truncate">{p.name}</p>
                                  <p className="text-[10px] text-neutral-500 font-mono mt-0.5">
                                    {p.width && p.height ? `${p.width}x${p.height} cm` : p.finish || ''}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {formData.selectedItems.length > 0 && (
                      <div className="space-y-3 pt-2">
                        <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                          Katalog Sayfa Sıralaması ({formData.selectedItems.length} Ürün)
                        </h4>
                        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                          {formData.selectedItems.map((item, idx) => {
                            const p = availableProducts.find((prod) => prod.id === item.productId) || {};
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
                                      {p.width && p.height ? `${p.width}x${p.height} cm` : ''} • {p.finish || 'Standart'}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                  <input
                                    type="text"
                                    value={item.customNote || ''}
                                    onChange={(e) => handleUpdateProductNote(idx, e.target.value)}
                                    placeholder="Özel sayfa notu / açıklama..."
                                    className="flex-1 sm:w-64 px-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg"
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
                  <div className="space-y-6 max-w-5xl">
                    <div className="border-b border-neutral-100 pb-4">
                      <h3 className="text-lg font-extrabold text-neutral-900 flex items-center gap-2">
                        <LayoutTemplate size={20} className="text-[#b4823c]" />
                        <span>3. Profesyonel Tasarım Şablonu Seçin</span>
                      </h3>
                      <p className="text-xs text-neutral-500 mt-1">
                        Birbirinden tamamen farklı mizanpaj ve sayfa mimarisine sahip kurumsal şablonlardan birini seçin.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {TEMPLATES.map((tpl) => {
                        const isSelected = formData.template === tpl.id;
                        return (
                          <div
                            key={tpl.id}
                            onClick={() => setFormData({ ...formData, template: tpl.id })}
                            className={`rounded-2xl border-2 cursor-pointer transition-all overflow-hidden flex flex-col justify-between ${
                              isSelected
                                ? 'border-[#b4823c] bg-amber-50/30 shadow-lg ring-2 ring-[#b4823c]/20'
                                : 'border-neutral-200 hover:border-neutral-300 bg-white'
                            }`}
                          >
                            <div
                              className="h-32 w-full p-4 flex flex-col justify-between text-white relative"
                              style={{
                                background: `linear-gradient(135deg, rgba(9, 13, 22, 0.88) 0%, rgba(17, 24, 39, 0.72) 100%), url(${tpl.mockupImg}) center/cover no-repeat`
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-black/50 uppercase text-amber-300">
                                  {tpl.tag}
                                </span>
                                {isSelected && (
                                  <span className="w-5 h-5 rounded-full bg-[#b4823c] text-white flex items-center justify-center font-bold text-xs shadow">
                                    <Check size={12} />
                                  </span>
                                )}
                              </div>
                              <p className="text-base font-serif font-bold text-white">{tpl.name}</p>
                            </div>

                            <div className="p-4 flex-1 flex flex-col justify-between">
                              <p className="text-xs text-neutral-600 leading-relaxed mb-3">{tpl.desc}</p>
                              <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs font-bold">
                                <span style={{ color: tpl.accent }}>
                                  {isSelected ? '✓ Aktif Şablon' : 'Bu Şablonu Seç'}
                                </span>
                                <span className="text-neutral-400 font-normal">Baskı & Web</span>
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
                        <Palette size={20} className="text-[#b4823c]" />
                        <span>4. Kurumsal Kimlik & Marka Bilgileri</span>
                      </h3>
                      <p className="text-xs text-neutral-500 mt-1">
                        Mevcut marka kaydınızdan otomatik alınan logo, renk ve iletişim bilgilerini özelleştirin.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-xs font-bold text-neutral-800">Marka Logo Görseli URL</label>
                        <input
                          type="text"
                          value={formData.customLogoUrl}
                          onChange={(e) => setFormData({ ...formData, customLogoUrl: e.target.value })}
                          placeholder="https://... (Boş bırakılırsa marka profili logonuz kullanılır)"
                          className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm"
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-bold text-neutral-800">Kurumsal Vurgu Rengi</label>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          {COLOR_PRESETS.map((preset) => (
                            <button
                              key={preset.hex}
                              type="button"
                              onClick={() => setFormData({ ...formData, primaryColor: preset.hex })}
                              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-2 transition ${
                                formData.primaryColor === preset.hex
                                  ? 'border-neutral-900 bg-neutral-900 text-white'
                                  : 'border-neutral-200 bg-white text-neutral-700'
                              }`}
                            >
                              <span
                                className="w-3.5 h-3.5 rounded-full border border-black/10"
                                style={{ backgroundColor: preset.hex }}
                              />
                              <span>{preset.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-neutral-800">Web Sitesi</label>
                        <input
                          type="text"
                          value={formData.websiteUrl}
                          onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                          placeholder="www.markaniz.com.tr"
                          className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-neutral-800">Telefon / Proje Hattı</label>
                        <input
                          type="text"
                          value={formData.contactPhone}
                          onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                          placeholder="+90 (212) 000 00 00"
                          className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-neutral-800">Kurumsal E-Posta</label>
                        <input
                          type="email"
                          value={formData.contactEmail}
                          onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                          placeholder="info@markaniz.com.tr"
                          className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-neutral-800">Fabrika / Merkez Adresi</label>
                        <input
                          type="text"
                          value={formData.contactAddress}
                          onChange={(e) => setFormData({ ...formData, contactAddress: e.target.value })}
                          placeholder="Organize Sanayi Bölgesi, Türkiye"
                          className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 5: GÖRÜNÜRLÜK AYARLARI */}
                {activeStep === 5 && (
                  <div className="space-y-6 max-w-3xl">
                    <div className="border-b border-neutral-100 pb-4">
                      <h3 className="text-lg font-extrabold text-neutral-900 flex items-center gap-2">
                        <Sliders size={20} className="text-[#b4823c]" />
                        <span>5. Sayfa Tipleri ve Görünürlük Ayarları</span>
                      </h3>
                      <p className="text-xs text-neutral-500 mt-1">
                        Kataloğunuzda yer alacak bölümleri ve teknik detay görünürlüğünü seçin.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { key: 'showCover', label: 'Kapak Sayfası', desc: 'Marka logolu ve görselli ana katalog kapağı' },
                        { key: 'showTOC', label: 'İçindekiler & Konsept Dizini', desc: 'Koleksiyon fihristi ve sayfa numaraları' },
                        { key: 'showSpecs', label: 'Teknik Özellikler Tablosu', desc: 'Veritabanında mevcut olan ebat, yüzey ve kalınlık verileri' },
                        { key: 'showCodes', label: 'Ürün ve Stok Kodları', desc: 'Her seramiğin resmi ürün kodunu göster' },
                        { key: 'showDescriptions', label: 'Koleksiyon Açıklamaları', desc: 'Ürün hikayesi ve kullanım alanı notları' },
                        { key: 'showQrCodes', label: 'QR Kod & Mekânımda Gör Bağlantısı', desc: 'Gerçek ürün sayfasına yönlenen dinamik QR kodlar' },
                        { key: 'showPrices', label: 'Liste Fiyatlarını Göster', desc: 'Tavsiye edilen m² perakende fiyatlarını dahil et' },
                        { key: 'showContactPage', label: 'İletişim & Arka Kapak', desc: 'Genel merkez, telefon, web ve QR arka kapak sayfası' }
                      ].map((toggle) => (
                        <label
                          key={toggle.key}
                          className={`p-4 rounded-xl border-2 cursor-pointer flex items-start gap-3.5 transition ${
                            Boolean(formData[toggle.key])
                              ? 'border-[#b4823c] bg-amber-50/30'
                              : 'border-neutral-200 bg-white'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={Boolean(formData[toggle.key])}
                            onChange={(e) => setFormData({ ...formData, [toggle.key]: e.target.checked })}
                            className="mt-0.5 w-4 h-4 accent-[#b4823c] rounded"
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

                {/* STEP 6: CANLI ÖNİZLEME & YAYINLAMA */}
                {activeStep === 6 && (
                  <div className="space-y-6">
                    <div className="border-b border-neutral-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-extrabold text-neutral-900 flex items-center gap-2">
                          <Sparkles size={20} className="text-[#b4823c]" />
                          <span>6. Gerçek Zamanlı Katalog Önizleme & PDF Üretimi</span>
                        </h3>
                        <p className="text-xs text-neutral-500 mt-1">
                          Kataloğunuzu sayfa sayfa inceleyin, doğrudan PDF olarak indirin veya web bağlantısıyla yayınlayın.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => window.print()}
                          className="px-4 py-2 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 text-xs font-bold text-neutral-800 flex items-center gap-1.5"
                        >
                          <Printer size={14} />
                          <span>PDF İndir / Yazdır</span>
                        </button>
                      </div>
                    </div>

                    <CatalogTemplateRenderer
                      catalog={{
                        ...formData,
                        brand: brandInfo
                      }}
                      products={formData.selectedItems
                        .map((item, idx) => {
                          const found = availableProducts.find((p) => p.id === item.productId);
                          if (!found) return null;
                          return {
                            ...found,
                            catalogItemIndex: idx + 1,
                            customNote: item.customNote,
                            customUsageArea: item.usageArea,
                            productUrl: `https://www.seramikbak.com/urun/${found.slug}`
                          };
                        })
                        .filter(Boolean)}
                      mode="preview"
                    />
                  </div>
                )}

                {/* Bottom Step Navigation Bar */}
                <div className="mt-8 pt-5 border-t border-neutral-100 flex items-center justify-between">
                  <button
                    type="button"
                    disabled={activeStep === 1}
                    onClick={() => setActiveStep((prev) => Math.max(1, prev - 1))}
                    className="px-4 py-2.5 rounded-xl border border-neutral-300 hover:bg-neutral-50 disabled:opacity-40 text-xs font-bold text-neutral-700 flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft size={14} />
                    <span>Önceki Adım</span>
                  </button>

                  {activeStep < 6 ? (
                    <button
                      type="button"
                      onClick={() => setActiveStep((prev) => Math.min(6, prev + 1))}
                      className="px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Sonraki Adım</span>
                      <ArrowRight size={14} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSaveCatalog(true)}
                      disabled={saving}
                      className="px-6 py-2.5 rounded-xl bg-[#b4823c] hover:bg-[#9f7131] text-white text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer"
                    >
                      <CheckCircle2 size={15} />
                      <span>Kataloğu Kaydet ve Yayınla</span>
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW MODE 3: FULL PREVIEW MODAL                                           */}
      {/* ========================================================================= */}
      {viewMode === 'preview-modal' && previewCatalog && (
        <div className="space-y-4 pb-16">
          <div className="bg-white rounded-2xl border border-neutral-200 p-4 flex flex-wrap items-center justify-between gap-3 shadow-2xs no-print">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 cursor-pointer"
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <h3 className="text-base font-extrabold text-neutral-900">{previewCatalog.title}</h3>
                <p className="text-xs text-neutral-500">
                  {previewProducts.length} Ürün • Şablon: {previewCatalog.template?.toUpperCase()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {previewCatalog.publicSlug && (
                <a
                  href={`/katalog/${previewCatalog.publicSlug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-xs font-bold text-neutral-700 flex items-center gap-1.5"
                >
                  <ExternalLink size={13} />
                  <span>Web Kataloğunu Aç</span>
                </a>
              )}
              <button
                type="button"
                onClick={() => handleEdit(previewCatalog, false)}
                className="px-4 py-2 rounded-xl bg-[#b4823c] hover:bg-[#9f7131] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Edit size={13} />
                <span>Kataloğu Düzenle</span>
              </button>
            </div>
          </div>

          <CatalogTemplateRenderer catalog={previewCatalog} products={previewProducts} mode="preview" />
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: VERSION HISTORY (SÜRÜM GEÇMİŞİ)                                    */}
      {/* ========================================================================= */}
      {versionModalCatalog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-neutral-200 max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2">
                <History size={18} className="text-[#b4823c]" />
                <h3 className="text-base font-extrabold text-neutral-900">Katalog Sürüm Geçmişi</h3>
              </div>
              <button
                type="button"
                onClick={() => setVersionModalCatalog(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-neutral-500">
              <strong>{versionModalCatalog.title}</strong> kataloğuna ait kaydedilmiş sürümler:
            </p>

            <div className="space-y-2.5 max-h-64 overflow-y-auto">
              <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-600 text-white">
                    Aktif Sürüm (v2.0)
                  </span>
                  <p className="text-xs font-bold text-neutral-900 mt-1">
                    {versionModalCatalog.itemCount || 0} Ürün • Şablon: {versionModalCatalog.template}
                  </p>
                  <span className="text-[10px] text-neutral-500">
                    Son Güncelleme: {new Date(versionModalCatalog.updatedAt || Date.now()).toLocaleString('tr-TR')}
                  </span>
                </div>
                <span className="text-xs font-bold text-emerald-700">Yayında</span>
              </div>

              <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-neutral-200 text-neutral-700">
                    İlk Oluşturma (v1.0)
                  </span>
                  <p className="text-xs font-bold text-neutral-800 mt-1">Başlangıç Taslağı</p>
                  <span className="text-[10px] text-neutral-400">
                    {new Date(versionModalCatalog.createdAt || Date.now()).toLocaleString('tr-TR')}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const target = versionModalCatalog;
                    setVersionModalCatalog(null);
                    handleEdit(target, false);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-100 text-xs font-bold text-neutral-700"
                >
                  Bu Sürümü Aç
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setVersionModalCatalog(null)}
                className="px-4 py-2 rounded-xl bg-neutral-900 text-white text-xs font-bold"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SMART PRODUCT UPDATE DIFF (AKILLI ÜRÜN GÜNCELLEME ONAYI)          */}
      {/* ========================================================================= */}
      {syncModalCatalog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-neutral-200 max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2">
                <RefreshCw size={18} className="text-[#b4823c]" />
                <h3 className="text-base font-extrabold text-neutral-900">
                  Akıllı Ürün Güncelleme Algılandı
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSyncModalCatalog(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed">
              <strong>{syncModalCatalog.catalog.title}</strong> kataloğunda yer alan aşağıdaki ürünlerin bilgileri veritabanında güncellendi. Sayfa düzeninizi bozmadan yeni verileri senkronize etmek ister misiniz?
            </p>

            <div className="space-y-2.5 max-h-60 overflow-y-auto">
              {syncModalCatalog.changes.map((ch, idx) => (
                <div key={idx} className="p-3 rounded-xl border border-amber-200 bg-amber-50/40 space-y-1.5">
                  <p className="text-xs font-extrabold text-neutral-900">{ch.product.name}</p>
                  {ch.diffs.map((d, i) => (
                    <div key={i} className="text-[11px] flex items-center gap-2">
                      <span className="font-bold text-neutral-600">{d.field}:</span>
                      <span className="line-through text-rose-600">{d.oldVal}</span>
                      <ArrowRight size={11} className="text-neutral-400" />
                      <span className="font-bold text-emerald-700">{d.newVal}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setSyncModalCatalog(null)}
                className="px-4 py-2 rounded-xl border border-neutral-300 text-xs font-bold text-neutral-600"
              >
                Sabit Sürümü Koru
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = syncModalCatalog.catalog;
                  setSyncModalCatalog(null);
                  handleEdit(target, false);
                }}
                className="px-4 py-2 rounded-xl bg-[#b4823c] text-white text-xs font-bold"
              >
                Önizle ve Güncelle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
