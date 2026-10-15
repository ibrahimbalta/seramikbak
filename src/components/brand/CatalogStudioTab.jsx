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
  Wand2,
  ChevronDown,
  ChevronUp,
  Home,
  Bell,
  Calendar,
  Upload,
  Zap
} from 'lucide-react';
import CatalogTemplateRenderer from './catalog/templates/CatalogTemplateRenderer';
import CatalogTemplateGallery, { CATALOG_TEMPLATES_DATA } from './catalog/CatalogTemplateGallery';
import CatalogVisualCanvasEditor from './catalog/CatalogVisualCanvasEditor';
import CatalogVisibilityGraphicEditor from './catalog/CatalogVisibilityGraphicEditor';
import ShowroomQrStickerModal from './catalog/ShowroomQrStickerModal';
import { generateQrDataUrl, buildCatalogPublicUrl } from '../../utils/generateQrCode';

import {
  CATALOG_DESIGN_FAMILIES,
  CATALOG_CATEGORIES,
  CATALOG_STYLES,
  filterTemplates,
  getTemplateConfig
} from './catalog/templates/registry';

export const TEMPLATES = CATALOG_DESIGN_FAMILIES;

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
  const [productSeriesFilter, setProductSeriesFilter] = useState('all');
  const [productDimensionFilter, setProductDimensionFilter] = useState('all');
  const [productColorFilter, setProductColorFilter] = useState('all');
  const [productFinishFilter, setProductFinishFilter] = useState('all');
  const [productGroupingMode, setProductGroupingMode] = useState('grid'); // 'grid' | 'series'
  const [productPage, setProductPage] = useState(1);
  const [productPageSize, setProductPageSize] = useState(24);
  const [expandedSeries, setExpandedSeries] = useState({});

  // Active Catalog Editor State
  const [activeCatalogId, setActiveCatalogId] = useState(null);
  const [activeStep, setActiveStep] = useState(1); // 1 to 6
  const [saving, setSaving] = useState(false);

  // Version History, Smart Product Sync & Delete Confirmation Modal State
  const [versionModalCatalog, setVersionModalCatalog] = useState(null);
  const [syncModalCatalog, setSyncModalCatalog] = useState(null);
  const [deleteConfirmCatalog, setDeleteConfirmCatalog] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [qrStickerModalData, setQrStickerModalData] = useState(null);
  const [sidebarQrDataUrl, setSidebarQrDataUrl] = useState('');

  // Generate live QR DataURL for the sidebar showcase card
  useEffect(() => {
    let isCancelled = false;
    async function loadSidebarQr() {
      try {
        const slug = catalogs[0]?.publicSlug || 'genel-katalog';
        const url = buildCatalogPublicUrl(slug);
        const dataUrl = await generateQrDataUrl(url, { width: 140, margin: 1 });
        if (!isCancelled && dataUrl) {
          setSidebarQrDataUrl(dataUrl);
        }
      } catch (err) {
        // ignore
      }
    }
    loadSidebarQr();
    return () => { isCancelled = true; };
  }, [catalogs]);

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
    collectionTag: '',
    sectionSettings: {},
    selectedItems: [],
    customCanvasPages: [],
    versions: [],
    isArchived: false,
    isPublished: false,
    isDraft: true,
    publicSlug: ''
  });

  // Template gallery filters & interactive preview modal states
  const [galleryCategory, setGalleryCategory] = useState('all');
  const [galleryStyle, setGalleryStyle] = useState('all');
  const [gallerySearch, setGallerySearch] = useState('');
  const [galleryPreviewTemplate, setGalleryPreviewTemplate] = useState(null);
  const [galleryPreviewPageIdx, setGalleryPreviewPageIdx] = useState(0);

  const filteredTemplates = useMemo(() => {
    return filterTemplates({
      category: galleryCategory,
      style: galleryStyle,
      searchQuery: gallerySearch
    });
  }, [galleryCategory, galleryStyle, gallerySearch]);

  // Step 3 unified template picker state
  const [step3Search, setStep3Search] = useState('');
  const [step3Style, setStep3Style] = useState('all');
  const [step3Type, setStep3Type] = useState('all');
  const [step3PreviewTemplate, setStep3PreviewTemplate] = useState(null);
  const [step3PreviewPageIdx, setStep3PreviewPageIdx] = useState(0);

  // Active template object derived from formData.template
  const activeTemplateObj = useMemo(() => {
    return (
      CATALOG_TEMPLATES_DATA.find(
        (t) =>
          formData.template === t.templateId ||
          formData.template === t.id ||
          (formData.template === 'milano' && t.templateId === 'premium-mimari')
      ) || CATALOG_TEMPLATES_DATA[0]
    );
  }, [formData.template]);

  // Step 3 filtered templates list matching the 24 gallery items
  const step3FilteredTemplates = useMemo(() => {
    return CATALOG_TEMPLATES_DATA.filter((item) => {
      if (step3Style !== 'all' && item.style !== step3Style) return false;
      if (step3Type !== 'all' && item.type !== step3Type) return false;
      if (step3Search.trim()) {
        const q = step3Search.toLowerCase().trim();
        const matchName = item.name.toLowerCase().includes(q);
        const matchDesc = item.description?.toLowerCase().includes(q);
        const matchStyle = item.style?.toLowerCase().includes(q);
        const matchType = item.type?.toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchStyle && !matchType) return false;
      }
      return true;
    });
  }, [step3Search, step3Style, step3Type]);

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
        const items = parsed
          .filter((i) => i && !i._isMetaOnly && (typeof i === 'string' || i.productId))
          .map((i) => (typeof i === 'string' ? { productId: i } : i));
        const firstMeta = parsed.find(
          (i) => i && typeof i === 'object' && (i._metaSectionSettings || i._metaCustomCanvasPages || i._metaVersions)
        );
        return {
          items,
          sectionSettings: firstMeta?._metaSectionSettings || {},
          collectionTag: firstMeta?._metaCollectionTag || '',
          customCanvasPages: Array.isArray(firstMeta?._metaCustomCanvasPages) ? firstMeta._metaCustomCanvasPages : [],
          versions: Array.isArray(firstMeta?._metaVersions) ? firstMeta._metaVersions : [],
          dataMode: 'live',
          isArchived: false
        };
      }
      if (parsed && typeof parsed === 'object') {
        const items = (parsed.items || [])
          .filter((i) => i && !i._isMetaOnly && (typeof i === 'string' || i.productId))
          .map((i) => (typeof i === 'string' ? { productId: i } : i));
        const firstMeta = (parsed.items || []).find(
          (i) => i && typeof i === 'object' && (i._metaSectionSettings || i._metaCustomCanvasPages || i._metaVersions)
        );
        return {
          items,
          sectionSettings: parsed.sectionSettings || firstMeta?._metaSectionSettings || {},
          collectionTag: parsed.collectionTag || firstMeta?._metaCollectionTag || '',
          customCanvasPages: Array.isArray(parsed.customCanvasPages)
            ? parsed.customCanvasPages
            : Array.isArray(firstMeta?._metaCustomCanvasPages)
            ? firstMeta._metaCustomCanvasPages
            : [],
          versions: parsed.versions || firstMeta?._metaVersions || [],
          dataMode: parsed.dataMode || 'live',
          isArchived: Boolean(parsed.isArchived)
        };
      }
    } catch (e) {
      // ignore
    }
    return { items: [], sectionSettings: {}, collectionTag: '', customCanvasPages: [], versions: [], dataMode: 'live', isArchived: false };
  };

  // Resolves actual product items from a catalog for showroom printing and exports
  const resolveCatalogProducts = (cat) => {
    if (!cat) return [];
    const meta = parseCatalogMeta(cat.productItems);
    const resolved = [];
    meta.items.forEach((item) => {
      const p = availableProducts.find((ap) => ap.id === item.productId);
      if (p) {
        resolved.push(p);
      } else if (item.snapshot) {
        resolved.push({
          id: item.productId,
          ...item.snapshot
        });
      }
    });
    return resolved.length > 0 ? resolved : availableProducts;
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
      collectionTag: '120×280 KOLEKSİYONLARI',
      sectionSettings: {},
      selectedItems: availableProducts.slice(0, 6).map((p) => ({
        productId: p.id,
        customNote: '',
        usageArea: p.style || 'İç Mekân',
        overrides: {},
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
          collectionTag: meta.collectionTag || '120×280 KOLEKSİYONLARI',
          sectionSettings: catalog.sectionSettings || meta.sectionSettings || {},
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

  const handleDelete = (target, e) => {
    if (e && typeof e.stopPropagation === 'function') {
      e.stopPropagation();
    }
    setOpenMenuId(null);
    const cat =
      typeof target === 'object' && target !== null
        ? target
        : catalogs.find((c) => c.id === target) || { id: target, title: formData.title || 'Katalog' };

    const catId = cat.id || (typeof target === 'string' ? target : null);
    if (!catId) return;

    setDeleteConfirmCatalog({ id: catId, title: cat.title || 'Bu Katalog' });
  };

  const executeDeleteCatalog = async (targetCat) => {
    const cat = targetCat || deleteConfirmCatalog;
    if (!cat || !cat.id) return;
    const catId = cat.id;

    setDeletingId(catId);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/brand/catalogs/${catId}?brandId=${brandId || ''}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg('Katalog başarıyla silindi.');
        setCatalogs((prev) => prev.filter((c) => c.id !== catId));
        setDeleteConfirmCatalog(null);
        if (activeCatalogId === catId || previewCatalog?.id === catId) {
          setActiveCatalogId(null);
          setPreviewCatalog(null);
          setViewMode('list');
        }
        setTimeout(() => {
          loadCatalogs();
        }, 200);
      } else {
        setErrorMsg(data.error || 'Silme işlemi başarısız.');
      }
    } catch (err) {
      setErrorMsg('Silme hatası: ' + err.message);
    } finally {
      setDeletingId(null);
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
            overrides: {},
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
    const hasCustomPages = Array.isArray(formData.customCanvasPages) && formData.customCanvasPages.length > 0;
    if (formData.selectedItems.length === 0 && !hasCustomPages) {
      alert('Lütfen kataloğa en az 1 seramik ürün veya tuval sayfası ekleyin.');
      return;
    }

    setSaving(true);
    try {
      // Clean and sanitize custom canvas pages
      const safeCanvasPages = hasCustomPages
        ? formData.customCanvasPages.filter(Boolean).map((p, pIdx) => ({
            id: p?.id || `page-${pIdx + 1}`,
            title: p?.title || `Sayfa ${pIdx + 1}`,
            bgColor: p?.bgColor || '#ffffff',
            format: p?.format || formData.orientation || 'portrait',
            elements: Array.isArray(p?.elements) ? p.elements.filter(Boolean) : []
          }))
        : [];

      // Create version history entry
      const newVersionEntry = {
        versionNumber: (formData.versions?.length || 0) + 1,
        savedAt: new Date().toISOString(),
        status: publish ? 'Yayınlandı' : 'Taslak',
        itemCount: formData.selectedItems.length,
        template: formData.template,
        language: formData.language,
        pageCount: safeCanvasPages.length
      };

      let enrichedSelectedItems = (formData.selectedItems || []).map((item, idx) => ({
        ...item,
        ...(idx === 0
          ? {
              _metaSectionSettings: formData.sectionSettings || {},
              _metaCollectionTag: formData.collectionTag || '',
              _metaCustomCanvasPages: safeCanvasPages
            }
          : {}),
        _metaVersions: [...(formData.versions || []), newVersionEntry].slice(-10)
      }));

      // If user is designing in canvas with 0 products selected, preserve metadata via meta-only container
      if (enrichedSelectedItems.length === 0) {
        enrichedSelectedItems = [
          {
            _isMetaOnly: true,
            _metaSectionSettings: formData.sectionSettings || {},
            _metaCollectionTag: formData.collectionTag || '',
            _metaCustomCanvasPages: safeCanvasPages,
            _metaVersions: [newVersionEntry]
          }
        ];
      } else {
        enrichedSelectedItems[0]._metaCustomCanvasPages = safeCanvasPages;
      }

      const payload = {
        ...formData,
        brandId,
        customCanvasPages: safeCanvasPages,
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

  // Derive clean series/collection name from product title or series field
  const getProductSeries = (p) => {
    if (!p) return 'Diğer';
    if (p.series) return p.series;
    const cleanName = (p.name || '').replace(/^(NG Kütahya|VitrA|Bien|Qua|Ege Seramik|Graniser|Seramiksan)\s+/i, '');
    const firstWord = cleanName.split(' ')[0] || '';
    if (firstWord && firstWord.length > 2 && !firstWord.match(/^\d+x\d+$/i)) {
      return firstWord;
    }
    return 'Diğer';
  };

  const productCategories = useMemo(() => ['all', ...new Set(availableProducts.map((p) => p.style).filter(Boolean))], [availableProducts]);

  const productSeriesList = useMemo(() => {
    const counts = {};
    availableProducts.forEach((p) => {
      const s = getProductSeries(p);
      counts[s] = (counts[s] || 0) + 1;
    });
    const sorted = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
    return ['all', ...sorted];
  }, [availableProducts]);

  const productDimensionsList = useMemo(() => {
    const counts = {};
    availableProducts.forEach((p) => {
      if (p.width && p.height) {
        const d = `${p.width}x${p.height}`;
        counts[d] = (counts[d] || 0) + 1;
      }
    });
    const sorted = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
    return ['all', ...sorted];
  }, [availableProducts]);

  const productColorsList = useMemo(() => {
    const counts = {};
    availableProducts.forEach((p) => {
      if (p.color) {
        counts[p.color] = (counts[p.color] || 0) + 1;
      }
    });
    const sorted = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
    return ['all', ...sorted];
  }, [availableProducts]);

  const productFinishesList = useMemo(() => {
    const counts = {};
    availableProducts.forEach((p) => {
      if (p.finish) {
        counts[p.finish] = (counts[p.finish] || 0) + 1;
      }
    });
    const sorted = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
    return ['all', ...sorted];
  }, [availableProducts]);

  const filteredAvailableProducts = useMemo(() => {
    return availableProducts.filter((p) => {
      if (productCategoryFilter !== 'all' && p.style !== productCategoryFilter) return false;
      if (productSeriesFilter !== 'all' && getProductSeries(p) !== productSeriesFilter) return false;
      if (productDimensionFilter !== 'all' && `${p.width}x${p.height}` !== productDimensionFilter) return false;
      if (productColorFilter !== 'all' && p.color !== productColorFilter) return false;
      if (productFinishFilter !== 'all' && p.finish !== productFinishFilter) return false;
      if (productSearch.trim()) {
        const q = productSearch.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          (p.code && p.code.toLowerCase().includes(q)) ||
          (p.color && p.color.toLowerCase().includes(q)) ||
          (p.style && p.style.toLowerCase().includes(q)) ||
          (`${p.width}x${p.height}`.includes(q))
        );
      }
      return true;
    });
  }, [availableProducts, productCategoryFilter, productSeriesFilter, productDimensionFilter, productColorFilter, productFinishFilter, productSearch]);

  // Series Grouped Structure for Tiles Catalogue pattern
  const groupedBySeries = useMemo(() => {
    const map = new Map();
    filteredAvailableProducts.forEach((p) => {
      const series = getProductSeries(p);
      if (!map.has(series)) {
        map.set(series, {
          name: series,
          style: p.style,
          sampleImg: p.imageUrl || p.textureUrl,
          items: []
        });
      }
      map.get(series).items.push(p);
    });
    return Array.from(map.values()).sort((a, b) => b.items.length - a.items.length);
  }, [filteredAvailableProducts]);

  // Pagination for Grid View
  const totalProductPages = Math.max(1, Math.ceil(filteredAvailableProducts.length / productPageSize));
  const paginatedProducts = useMemo(() => {
    const start = (productPage - 1) * productPageSize;
    return filteredAvailableProducts.slice(start, start + productPageSize);
  }, [filteredAvailableProducts, productPage, productPageSize]);

  // Selected series summary
  const selectedSeriesSummary = useMemo(() => {
    const counts = {};
    formData.selectedItems.forEach((item) => {
      const prod = availableProducts.find((p) => p.id === item.productId);
      if (prod) {
        const s = getProductSeries(prod);
        counts[s] = (counts[s] || 0) + 1;
      }
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [formData.selectedItems, availableProducts]);

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
    if (!cat) return 24;
    const count = cat?.itemCount || 6;
    if (cat?.template === 'milano' || cat?.template === 'deco') return count * 2 + 4;
    if (cat?.template === 'lidya') return count + 5;
    return count + 3;
  };

  const STEPS = [
    { num: 1, label: 'Katalog Bilgileri', desc: 'Başlık, kapak & dil', icon: FileText },
    { num: 2, label: `Ürün Seçimi (${formData.selectedItems.length})`, desc: 'Koleksiyon karoları', icon: Layers },
    { num: 3, label: 'Şablon Mimarisi', desc: 'Editoryal mizanpajlar', icon: LayoutTemplate },
    { num: 4, label: 'Kurumsal Kimlik', desc: 'Logo, renk & iletişim', icon: Palette },
    { num: 5, label: 'Görünürlük & Grafik', desc: 'Sayfa tipleri & modüller', icon: Sliders },
    { num: 6, label: 'Önizleme & Yayın', desc: 'Baskı PDF & Web', icon: Sparkles }
  ];

  // Aggregate KPI totals
  const totalViews = catalogs.reduce((acc, c) => acc + (c.viewCount || 0), 0);
  const totalDownloads = catalogs.reduce((acc, c) => acc + (c.downloadCount || 0), 0);
  const publishedCount = catalogs.filter((c) => c.isPublished).length;
  const draftCount = catalogs.filter((c) => !c.isPublished && !c._isArchived).length;
  const archivedCount = catalogs.filter((c) => c._isArchived).length;

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
        <div className="space-y-6 pb-20">
          {/* ========================================================================= */}
          {/* A. TOP BREADCRUMB & BRAND/USER HEADER                                     */}
          {/* ========================================================================= */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-2 text-neutral-500 font-medium">
              <Home size={15} className="text-neutral-500" />
              <span className="hover:text-neutral-900 cursor-pointer">Marka Paneli</span>
              <ChevronRight size={13} className="text-neutral-400" />
              <span className="font-bold text-neutral-900">Dijital Kataloglar</span>
            </div>

            {/* Brand Dropdown & User Indicator */}
            <div className="flex items-center gap-3 self-end sm:self-auto">
              {/* Brand Selector Pill */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-neutral-200/90 shadow-2xs text-xs font-bold text-neutral-800">
                {brandInfo?.logoUrl ? (
                  <img src={brandInfo.logoUrl} alt={brandInfo.name} className="w-5 h-5 rounded-md object-contain" />
                ) : (
                  <div className="w-5 h-5 rounded-md bg-neutral-950 text-white flex items-center justify-center text-[10px] font-black uppercase">
                    {(brandInfo?.name || 'B').slice(0, 2)}
                  </div>
                )}
                <span>{brandInfo?.name || 'Bien Seramik'}</span>
                <ChevronDown size={13} className="text-neutral-400 ml-1" />
              </div>

              {/* Notification Bell */}
              <button
                type="button"
                className="relative p-2 rounded-full bg-white border border-neutral-200/90 shadow-2xs text-neutral-600 hover:text-neutral-900 transition cursor-pointer"
                title="Bildirimler"
              >
                <Bell size={16} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
              </button>

              {/* User Avatar */}
              <div className="w-8 h-8 rounded-full bg-neutral-200 border border-neutral-300 flex items-center justify-center text-xs font-black text-neutral-700 shadow-2xs">
                {(brandInfo?.contactPerson || brandInfo?.name || 'İK')
                  .split(' ')
                  .map((w) => w[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* B & E. 2-COLUMN ASYMMETRIC STUDIO WORKSPACE (9 COLS MAIN + 3 COLS PANEL)  */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            {/* ==================== LEFT MAIN COLUMN (9 COLS) ==================== */}
            <div className="xl:col-span-9 space-y-6">
              {/* B. DUAL-ZONE LUXURY ARCHITECTURAL HERO BANNER */}
              <div className="rounded-3xl border border-neutral-800 bg-[#0e1726] overflow-hidden shadow-xl flex flex-col md:flex-row relative">
                {/* Left Visual Area (~38% width): Clean Luxury Bathroom Photography */}
                <div className="md:w-[38%] relative min-h-[220px] md:min-h-[280px] overflow-hidden flex-shrink-0">
                  <img
                    src="/renders/luxury_bathroom_calacatta_gold.jpg"
                    alt="Seramik Lookbook Studio"
                    className="w-full h-full object-cover object-center"
                  />
                </div>

                {/* Right Content Area (~62% width): Charcoal with Golden Waves */}
                <div className="md:w-[62%] p-6 sm:p-8 md:p-9 flex flex-col justify-center relative overflow-hidden bg-[#0e1726] text-white">
                  {/* Elegant Golden Curve Background SVG */}
                  <svg
                    className="absolute right-0 top-0 bottom-0 h-full w-52 text-amber-500/10 pointer-events-none opacity-60"
                    viewBox="0 0 200 400"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path d="M50,-50 C180,100 180,300 50,450" strokeWidth="2" />
                    <path d="M90,-50 C220,100 220,300 90,450" strokeWidth="1.5" />
                    <path d="M130,-50 C260,100 260,300 130,450" strokeWidth="1" />
                  </svg>

                  {/* Studio Badge */}
                  <div className="relative z-10">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold tracking-wide">
                      SeramikBak Dijital Studio
                    </span>
                  </div>

                  {/* Main Title */}
                  <h1 className="relative z-10 text-2xl sm:text-3xl font-extrabold text-white mt-3 mb-2 tracking-tight leading-tight">
                    Dijital Mimari Kataloglar & Lookbook Studio
                  </h1>

                  {/* Subtitle */}
                  <p className="relative z-10 text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-xl mb-4 font-normal">
                    Ürün portföyünüzü interaktif dijital kataloglara ve profesyonel baskıya hazır PDF lookbook'lara dönüştürün.
                  </p>

                  {/* 3 Feature Pills */}
                  <div className="relative z-10 flex flex-wrap items-center gap-2 mb-6">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-xs border border-white/15 text-xs text-neutral-200 font-semibold">
                      <LayoutGrid size={13} className="text-amber-400" />
                      <span>Editoryal Şablonlar</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-xs border border-white/15 text-xs text-neutral-200 font-semibold">
                      <Wand2 size={13} className="text-amber-400" />
                      <span>Vektör Tasarım Tuvali</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-xs border border-white/15 text-xs text-neutral-200 font-semibold">
                      <Printer size={13} className="text-amber-400" />
                      <span>Baskıya Hazır PDF</span>
                    </div>
                  </div>

                  {/* Action Buttons Row */}
                  <div className="relative z-10 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleStartNew('milano', 1)}
                      className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition cursor-pointer"
                    >
                      <Plus size={16} strokeWidth={2.5} />
                      <span>+ Yeni Katalog Oluştur</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setViewMode('templates-gallery')}
                      className="px-5 py-2.5 rounded-xl border border-white/30 hover:border-white/60 bg-white/5 hover:bg-white/10 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer"
                    >
                      <BookOpen size={15} />
                      <span>Şablonları Keşfet</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* C. 4 COMPACT KPI STAT CARDS */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1: Toplam Katalog */}
                <div className="bg-white rounded-2xl border border-neutral-200/90 p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <BookOpen size={18} />
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-xs font-bold text-neutral-500 block">Toplam katalog</span>
                    <span className="text-2xl sm:text-3xl font-extrabold text-neutral-900 block mt-0.5">
                      {catalogs.length}
                    </span>
                  </div>
                </div>

                {/* Card 2: Görüntülenme */}
                <div className="bg-white rounded-2xl border border-neutral-200/90 p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                      <Eye size={18} />
                    </div>
                    {/* Trendline Graphic (Amber wave) */}
                    <svg viewBox="0 0 100 30" className="w-18 h-6 text-amber-500 stroke-current fill-none stroke-[2.5]" preserveAspectRatio="none">
                      <path d="M0,24 Q30,22 55,14 T100,5" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div className="mt-4">
                    <span className="text-xs font-bold text-neutral-500 block">Görüntülenme</span>
                    <span className="text-2xl sm:text-3xl font-extrabold text-neutral-900 block mt-0.5">
                      {totalViews.toLocaleString('tr-TR')}
                    </span>
                  </div>
                </div>

                {/* Card 3: PDF İndirme */}
                <div className="bg-white rounded-2xl border border-neutral-200/90 p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Download size={18} />
                    </div>
                    {/* Trendline Graphic (Emerald wave) */}
                    <svg viewBox="0 0 100 30" className="w-18 h-6 text-emerald-500 stroke-current fill-none stroke-[2.5]" preserveAspectRatio="none">
                      <path d="M0,26 Q35,24 60,16 T100,6" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div className="mt-4">
                    <span className="text-xs font-bold text-neutral-500 block">PDF indirme</span>
                    <span className="text-2xl sm:text-3xl font-extrabold text-neutral-900 block mt-0.5">
                      {totalDownloads.toLocaleString('tr-TR')}
                    </span>
                  </div>
                </div>

                {/* Card 4: Yayında */}
                <div className="bg-white rounded-2xl border border-neutral-200/90 p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                      <Globe size={18} />
                    </div>
                    {/* Trendline Graphic (Purple wave) */}
                    <svg viewBox="0 0 100 30" className="w-18 h-6 text-purple-500 stroke-current fill-none stroke-[2.5]" preserveAspectRatio="none">
                      <path d="M0,25 Q40,23 65,13 T100,7" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div className="mt-4">
                    <span className="text-xs font-bold text-neutral-500 block">Yayında</span>
                    <span className="text-2xl sm:text-3xl font-extrabold text-neutral-900 block mt-0.5">
                      {publishedCount}
                    </span>
                  </div>
                </div>
              </div>

              {/* D. KATALOG YÖNETİMİ ALANI (KATALOGLARIM) */}
              <div className="space-y-4">
                {/* Header Row: Title + Search Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900">Kataloglarım</h2>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Oluşturduğunuz katalogları yönetin, düzenleyin ve paylaşın.
                    </p>
                  </div>

                  {/* Search Input (Pill Shaped) */}
                  <div className="relative min-w-[240px] sm:min-w-[320px]">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Katalog adı veya koleksiyon ara..."
                      className="w-full pl-9 pr-4 py-2 rounded-full border border-neutral-200 bg-white focus:border-amber-500 text-xs font-medium text-neutral-800 placeholder-neutral-400 outline-none shadow-2xs transition"
                    />
                  </div>
                </div>

                {/* Filter Pills + Sort & View Controls Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  {/* Left Filter Tabs */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[
                      { id: 'all', label: `Tümü (${catalogs.length})` },
                      { id: 'published', label: `Yayında (${publishedCount})` },
                      { id: 'draft', label: `Taslaklar (${draftCount})` },
                      { id: 'archived', label: `Arşiv (${archivedCount})` }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setFilterTab(tab.id)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          filterTab === tab.id
                            ? 'bg-[#b4823c] text-white shadow-xs'
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Right Controls: Sort & Grid/List View */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-1.5 bg-white border border-neutral-200 rounded-xl text-xs font-bold text-neutral-700 outline-none transition cursor-pointer shadow-2xs"
                    >
                      <option value="updated_desc">Son güncellenen</option>
                      <option value="views_desc">En çok görüntülenen</option>
                      <option value="downloads_desc">En çok indirilen</option>
                      <option value="title_asc">Başlık (A - Z)</option>
                    </select>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setCardDisplayMode('grid')}
                        className={`p-1.5 rounded-xl transition cursor-pointer ${
                          cardDisplayMode === 'grid'
                            ? 'bg-[#b4823c] text-white shadow-2xs'
                            : 'border border-neutral-200 bg-white text-neutral-500 hover:bg-neutral-50'
                        }`}
                        title="Izgara Görünümü"
                      >
                        <LayoutGrid size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setCardDisplayMode('list')}
                        className={`p-1.5 rounded-xl transition cursor-pointer ${
                          cardDisplayMode === 'list'
                            ? 'bg-[#b4823c] text-white shadow-2xs'
                            : 'border border-neutral-200 bg-white text-neutral-500 hover:bg-neutral-50'
                        }`}
                        title="Liste Görünümü"
                      >
                        <List size={15} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Catalog Items Display (Grid vs List) */}
                {loading ? (
                  <div className="bg-white rounded-2xl border border-neutral-200/80 py-20 flex flex-col items-center justify-center text-neutral-400">
                    <Loader2 size={32} className="animate-spin text-[#b4823c] mb-2" />
                    <p className="text-xs font-bold">Kataloglar yükleniyor...</p>
                  </div>
                ) : filteredCatalogs.length === 0 ? (
                  <div className="bg-gradient-to-b from-white to-stone-50/60 rounded-3xl border border-neutral-200/90 p-12 text-center shadow-sm">
                    <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-[#b4823c] border border-amber-500/20 flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <BookOpen size={28} />
                    </div>
                    <h3 className="text-lg font-serif font-bold text-neutral-900 mb-1.5">
                      Henüz Hazırlanmış Katalog Bulunmuyor
                    </h3>
                    <p className="text-xs text-neutral-500 max-w-md mx-auto mb-6 leading-relaxed">
                      Fabrika ürünlerinizden dilediklerinizi seçin; hazır editoryal şablonlarımızla dakikalar içinde profesyonel bir dijital katalog oluşturun.
                    </p>
                    <button
                      onClick={() => handleStartNew('milano', 1)}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#b4823c] to-amber-700 hover:from-[#9f7131] hover:to-amber-800 text-white font-extrabold text-xs inline-flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
                    >
                      <Plus size={16} strokeWidth={2.5} />
                      <span>İlk Kataloğunuzu Oluşturun</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {filteredCatalogs.map((cat, idx) => {
                      const tplInfo = TEMPLATES.find((t) => t.id === cat.template) || TEMPLATES[0];
                      const coverImg = CARD_COVERS[idx % CARD_COVERS.length] || tplInfo.mockupImg;
                      const pageCount = getEstimatedPages(cat);
                      const outdatedChanges = detectOutdatedProducts(cat);

                      return (
                        <div
                          key={cat.id}
                          className="bg-white rounded-2xl border border-neutral-200/90 p-4 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                          {/* Left: Thumbnail & Catalog Details */}
                          <div className="flex items-center gap-4 min-w-0 flex-1">
                            <div
                              onClick={() => handleOpenPreview(cat)}
                              className="w-32 h-24 sm:w-36 sm:h-26 rounded-xl overflow-hidden border border-neutral-200 flex-shrink-0 cursor-pointer relative shadow-2xs group"
                            >
                              <img
                                src={coverImg}
                                alt={cat.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                            </div>

                            <div className="min-w-0 flex-1">
                              {/* Title & Status Badge */}
                              <div className="flex items-center gap-2.5 flex-wrap">
                                <h3
                                  onClick={() => handleOpenPreview(cat)}
                                  className="text-base font-extrabold text-neutral-900 hover:text-[#b4823c] truncate transition cursor-pointer"
                                >
                                  {cat.title}
                                </h3>
                                {cat._isArchived ? (
                                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-neutral-200 text-neutral-700">
                                    Arşiv
                                  </span>
                                ) : cat.isPublished ? (
                                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                                    Yayında
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-neutral-100 text-neutral-600">
                                    Taslak
                                  </span>
                                )}

                                {outdatedChanges.length > 0 && (
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
                                )}
                              </div>

                              {/* Template & Specs */}
                              <p className="text-xs text-neutral-500 font-medium mt-1 truncate">
                                {tplInfo.name} &bull; {cat.itemCount || 0} Ürün &bull; {pageCount} Sayfa
                              </p>

                              {/* Date & Analytics Row */}
                              <div className="flex items-center gap-4 text-xs text-neutral-400 mt-2 flex-wrap">
                                <span className="flex items-center gap-1">
                                  <Calendar size={13} className="text-neutral-400" />
                                  <span>{new Date(cat.updatedAt || Date.now()).toLocaleDateString('tr-TR')}</span>
                                </span>
                                <span className="flex items-center gap-1">
                                  <Eye size={13} className="text-neutral-400" />
                                  <span>{(cat.viewCount || 0).toLocaleString('tr-TR')} görüntülenme</span>
                                </span>
                                <span className="flex items-center gap-1">
                                  <Download size={13} className="text-neutral-400" />
                                  <span>{(cat.downloadCount || 0).toLocaleString('tr-TR')} indirme</span>
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Right: Action Buttons Group */}
                          <div className="flex items-center gap-2 self-end md:self-auto flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => handleOpenPreview(cat)}
                              className="px-4 py-2 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 font-bold text-xs flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
                            >
                              <Eye size={14} />
                              <span>Önizle</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleEdit(cat, false)}
                              className="px-4 py-2 rounded-xl border border-amber-300 bg-amber-50/50 hover:bg-amber-100/70 text-amber-800 font-bold text-xs flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
                            >
                              <Edit size={14} className="text-[#b4823c]" />
                              <span>Düzenle</span>
                            </button>

                            {/* 3-Dots Dropdown Trigger */}
                            <div className="relative">
                              <button
                                type="button"
                                onClick={() => setOpenMenuId(openMenuId === cat.id ? null : cat.id)}
                                className="p-2 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-600 transition cursor-pointer"
                                title="Diğer İşlemler"
                              >
                                <MoreVertical size={16} />
                              </button>

                              {openMenuId === cat.id && (
                                <div className="absolute right-0 top-10 w-52 bg-white rounded-xl shadow-xl border border-neutral-200 py-1.5 z-40 text-xs font-semibold text-neutral-700">
                                  <button
                                    type="button"
                                    onClick={() => handleEdit(cat, true)}
                                    className="w-full px-3.5 py-2 text-left hover:bg-amber-50 hover:text-[#b4823c] flex items-center gap-2 cursor-pointer"
                                  >
                                    <Wand2 size={13} />
                                    <span>Gelişmiş Studio ile Aç</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenMenuId(null);
                                      const catProducts = resolveCatalogProducts(cat);
                                      setQrStickerModalData({ catalog: cat, products: catProducts });
                                    }}
                                    className="w-full px-3.5 py-2 text-left hover:bg-amber-50 hover:text-amber-800 text-amber-700 font-bold flex items-center gap-2 cursor-pointer"
                                  >
                                    <QrCode size={13} className="text-[#b4823c]" />
                                    <span>Showroom QR & Pano Etiketleri</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleCopyLink(cat.publicSlug)}
                                    className="w-full px-3.5 py-2 text-left hover:bg-neutral-50 flex items-center gap-2 cursor-pointer"
                                  >
                                    <Share2 size={13} />
                                    <span>Paylaşım Linkini Kopyala</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDuplicate(cat)}
                                    className="w-full px-3.5 py-2 text-left hover:bg-neutral-50 flex items-center gap-2 cursor-pointer"
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
                                    className="w-full px-3.5 py-2 text-left hover:bg-neutral-50 flex items-center gap-2 cursor-pointer"
                                  >
                                    <History size={13} />
                                    <span>Sürüm Geçmişi</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleArchive(cat)}
                                    className="w-full px-3.5 py-2 text-left hover:bg-neutral-50 flex items-center gap-2 cursor-pointer"
                                  >
                                    <Archive size={13} />
                                    <span>{cat._isArchived ? 'Arşivden Çıkar' : 'Arşivle'}</span>
                                  </button>
                                  <div className="my-1 border-t border-neutral-100" />
                                  <button
                                    type="button"
                                    onClick={(e) => handleDelete(cat, e)}
                                    className="w-full px-3.5 py-2 text-left text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                                  >
                                    <Trash2 size={13} />
                                    <span>Kataloğu Sil</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* ==================== RIGHT SIDEBAR COLUMN (3 COLS) ==================== */}
            <div className="xl:col-span-3 space-y-6">
              {/* Card 1: Hızlı Başlangıç */}
              <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-1 border-b border-neutral-100">
                  <Zap size={18} className="text-amber-500 fill-amber-500" />
                  <h3 className="text-base font-extrabold text-neutral-900">Hızlı Başlangıç</h3>
                </div>

                <div className="space-y-3.5">
                  {/* Step 1 */}
                  <div
                    onClick={() => setViewMode('templates-gallery')}
                    className="flex items-start gap-3 p-2 rounded-xl hover:bg-neutral-50 transition cursor-pointer group"
                  >
                    <div className="w-6 h-6 rounded-full border border-amber-400 text-amber-600 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-2">
                      1
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-[#fbf6ee] text-amber-800 border border-amber-100 flex items-center justify-center flex-shrink-0 group-hover:bg-[#b4823c] group-hover:text-white transition-colors">
                      <LayoutTemplate size={18} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-extrabold text-neutral-900 group-hover:text-[#b4823c] transition-colors">
                        Şablon seç
                      </h4>
                      <p className="text-[11px] text-neutral-500 leading-snug mt-0.5">
                        Profesyonel şablonlarımızdan size uygun olanı seçin.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div
                    onClick={() => handleStartNew('milano', 2)}
                    className="flex items-start gap-3 p-2 rounded-xl hover:bg-neutral-50 transition cursor-pointer group"
                  >
                    <div className="w-6 h-6 rounded-full border border-amber-400 text-amber-600 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-2">
                      2
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-[#fbf6ee] text-amber-800 border border-amber-100 flex items-center justify-center flex-shrink-0 group-hover:bg-[#b4823c] group-hover:text-white transition-colors">
                      <Box size={18} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-extrabold text-neutral-900 group-hover:text-[#b4823c] transition-colors">
                        Ürünleri ekle
                      </h4>
                      <p className="text-[11px] text-neutral-500 leading-snug mt-0.5">
                        Koleksiyonlarınızdan ürünleri kataloğunuza dahil edin.
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div
                    onClick={() => {
                      const targetCat = catalogs[0];
                      if (targetCat) {
                        const catProducts = resolveCatalogProducts(targetCat);
                        setQrStickerModalData({ catalog: targetCat, products: catProducts });
                      } else {
                        handleStartNew('milano', 1);
                      }
                    }}
                    className="flex items-start gap-3 p-2 rounded-xl hover:bg-neutral-50 transition cursor-pointer group"
                  >
                    <div className="w-6 h-6 rounded-full border border-amber-400 text-amber-600 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-2">
                      3
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-[#fbf6ee] text-amber-800 border border-amber-100 flex items-center justify-center flex-shrink-0 group-hover:bg-[#b4823c] group-hover:text-white transition-colors">
                      <Upload size={18} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-extrabold text-neutral-900 group-hover:text-[#b4823c] transition-colors">
                        Yayınla ve paylaş
                      </h4>
                      <p className="text-[11px] text-neutral-500 leading-snug mt-0.5">
                        Kataloğunuzu yayınlayın, QR kod ve link ile paylaşın.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Kataloğunu paylaş */}
              <div className="bg-gradient-to-b from-white via-amber-50/20 to-orange-50/40 rounded-2xl border border-neutral-200/90 p-5 shadow-sm space-y-4 relative overflow-hidden">
                {/* Decorative Warm Radial Glow */}
                <div className="absolute top-0 right-0 w-36 h-36 bg-amber-200/30 rounded-full blur-2xl pointer-events-none" />

                {/* 3D Realistic Catalog Cover Mockup */}
                <div className="relative z-10 flex justify-center py-2">
                  <div
                    className="w-44 h-56 rounded-md shadow-2xl relative overflow-hidden border border-neutral-300 bg-neutral-900 flex flex-col justify-between p-3.5 text-white transform -rotate-2 hover:rotate-0 transition-transform duration-300"
                    style={{
                      boxShadow: '10px 18px 30px rgba(0,0,0,0.22), 2px 4px 8px rgba(0,0,0,0.1)'
                    }}
                  >
                    {/* Background Cover Image */}
                    <div
                      className="absolute inset-0 bg-cover bg-center opacity-80"
                      style={{
                        backgroundImage: `url(${catalogs[0]?.coverImageUrl || '/renders/luxury_bathroom_calacatta_gold.jpg'})`
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-neutral-950/70" />

                    {/* Book Spine Shadow on Left */}
                    <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-black/40 to-transparent" />

                    {/* Cover Top Text */}
                    <div className="relative z-10">
                      <h4 className="text-[12px] font-serif font-black tracking-widest uppercase text-white">
                        {brandInfo?.name || 'BIEN SERAMİK'}
                      </h4>
                      <span className="text-[8px] font-mono tracking-wider text-amber-300 block uppercase">
                        MİMARİ KATALOG
                      </span>
                    </div>

                    {/* Cover Bottom Text */}
                    <div className="relative z-10">
                      <div className="text-[10px] font-sans font-bold text-white line-clamp-1">
                        {catalogs[0]?.title || '2026 Genel Koleksiyon'}
                      </div>
                      <div className="text-[8px] text-neutral-300">
                        {catalogs[0]?.itemCount || 26} Ürün &bull; {getEstimatedPages(catalogs[0]) || 31} Sayfa
                      </div>
                    </div>
                  </div>
                </div>

                {/* Text & Button Area */}
                <div className="relative z-10 space-y-2">
                  <h4 className="text-base font-extrabold text-neutral-900">Kataloğunu paylaş</h4>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    Kataloğunuza özel QR kod ile müşterilerinizle kolayca paylaşın.
                  </p>

                  <div className="pt-2 flex items-center gap-3">
                    {/* Scannable QR code preview */}
                    <div className="w-16 h-16 rounded-xl bg-white border border-neutral-300 p-1 flex-shrink-0 shadow-2xs flex items-center justify-center">
                      {sidebarQrDataUrl ? (
                        <img src={sidebarQrDataUrl} alt="Katalog QR" className="w-full h-full object-contain" />
                      ) : (
                        <QrCode size={36} className="text-neutral-800" />
                      )}
                    </div>

                    {/* Button */}
                    <button
                      type="button"
                      onClick={() => {
                        const targetCat = catalogs[0];
                        if (targetCat) {
                          const catProducts = resolveCatalogProducts(targetCat);
                          setQrStickerModalData({
                            catalog: targetCat,
                            products: catProducts
                          });
                        } else {
                          handleStartNew('milano', 1);
                        }
                      }}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-[#b4823c] hover:bg-[#9f7131] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
                    >
                      <QrCode size={14} />
                      <span>QR etiketlerini oluştur</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW MODE: TEMPLATE GALLERY (ŞABLON GALERİSİ — GÖRSELDEKİ MODERN TASARIM)  */}
      {/* ========================================================================= */}
      {viewMode === 'templates-gallery' && (
        <CatalogTemplateGallery
          onSelectTemplate={(tplId) => handleStartNew(tplId, 1)}
          onCreateCustom={() => handleStartNew('milano', 1)}
          availableProducts={availableProducts}
          brandInfo={brandInfo}
          selectedTemplateId={formData?.template}
          onBackToList={() => setViewMode('list')}
        />
      )}

      {/* ========================================================================= */}
      {/* VIEW MODE 2: CATALOG STUDIO EDITOR (KOLAY MOD + GELİŞMİŞ STUDIO)          */}
      {/* ========================================================================= */}
      {viewMode === 'editor' && (
        <div className="space-y-4 pb-16">
          {/* Editor Top Header with Mode Switcher (Kolay Mod / Gelişmiş Studio) */}
          <div className="bg-white rounded-xl border border-neutral-200 shadow-2xs p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Left: Back + Title & Badge */}
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="p-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-600 transition flex-shrink-0 cursor-pointer"
                title="Katalog Listesine Dön"
              >
                <ArrowLeft size={15} />
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60 uppercase tracking-wide">
                    {activeCatalogId ? 'Düzenleme' : 'Yeni Katalog'}
                  </span>
                  <span className="text-[10px] text-neutral-400">
                    {formData.dataMode === 'live' ? '• Canlı Stok' : '• Sabit Sürüm'}
                  </span>
                </div>
                <h2 className="text-sm sm:text-base font-bold text-neutral-900 mt-0.5 truncate">
                  {formData.title || 'Başlıksız Katalog'}
                </h2>
              </div>
            </div>

            {/* Center: Mode Switcher (Kolay Mod vs Gelişmiş Studio) */}
            <div className="flex items-center bg-neutral-100/90 p-1 rounded-xl border border-neutral-200/80 flex-shrink-0 w-full sm:w-auto justify-between sm:justify-start">
              <button
                type="button"
                onClick={() => setStudioMode('easy')}
                className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  studioMode === 'easy'
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                <Sparkles size={13} className="text-amber-500" />
                <span>Kolay Mod</span>
              </button>
              <button
                type="button"
                onClick={() => setStudioMode('advanced')}
                className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  studioMode === 'advanced'
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                <Wand2 size={13} className="text-amber-400" />
                <span>Gelişmiş Tuval</span>
              </button>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto justify-end">
              {activeCatalogId && (
                <button
                  type="button"
                  onClick={(e) => handleDelete({ id: activeCatalogId, title: formData.title }, e)}
                  className="px-2.5 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white text-xs font-medium transition flex items-center gap-1 cursor-pointer"
                  title="Kataloğu Sil"
                >
                  <Trash2 size={13} />
                  <span className="hidden sm:inline">Sil</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => handleSaveCatalog(false)}
                disabled={saving}
                className="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-medium transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                {saving ? <Loader2 size={12} className="animate-spin" /> : null}
                <span>Taslak</span>
              </button>
              <button
                type="button"
                onClick={() => handleSaveCatalog(true)}
                disabled={saving}
                className="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles size={13} />
                <span>Yayınla</span>
              </button>
            </div>
          </div>

          {/* ==================== MODE A: GELİŞMİŞ STUDIO ==================== */}
          {studioMode === 'advanced' ? (
            <CatalogVisualCanvasEditor
              initialPages={formData.customCanvasPages}
              brandProducts={availableProducts}
              brandInfo={brandInfo}
              currentTemplateId={formData.template}
              onSelectTemplate={(tmplId) => setFormData((prev) => ({ ...prev, template: tmplId }))}
              onChangePages={(updatedPages) =>
                setFormData((prev) => ({ ...prev, customCanvasPages: updatedPages }))
              }
              onUseProduct={(prod) => {
                if (!prod || !prod.id) return;
                setFormData((prev) => {
                  const exists = (prev.selectedItems || []).some(
                    (item) => (item.productId || item.id) === prod.id
                  );
                  if (exists) return prev;
                  return {
                    ...prev,
                    selectedItems: [
                      ...(prev.selectedItems || []),
                      { productId: prod.id, order: (prev.selectedItems || []).length + 1 }
                    ]
                  };
                });
              }}
              onSaveDraft={() => handleSaveCatalog(false)}
              onPublish={() => handleSaveCatalog(true)}
            />
          ) : (
            /* ==================== MODE B: KOLAY MOD (6 ADIMLI SİHİRBAZ) ==================== */
            <>
              {/* High-End Stepper Navigation */}
              <div className="bg-white rounded-xl border border-neutral-200 shadow-2xs p-3 sm:p-4">
                {/* Stepper Progress Bar Header */}
                <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-neutral-100 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-[11px] font-semibold text-neutral-600">
                      Adım {activeStep} / 6 • {STEPS[activeStep - 1]?.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-neutral-400">İlerleme:</span>
                    <div className="w-20 sm:w-28 h-1.5 rounded-full bg-neutral-100 overflow-hidden">
                      <div
                        className="h-full bg-amber-500 transition-all duration-300"
                        style={{ width: `${Math.round((activeStep / 6) * 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono font-semibold text-neutral-600">
                      %{Math.round((activeStep / 6) * 100)}
                    </span>
                  </div>
                </div>

                <div className="hidden lg:grid grid-cols-6 gap-2">
                  {STEPS.map((step) => {
                    const isActive = activeStep === step.num;
                    const isPassed = activeStep > step.num;
                    const StepIcon = step.icon || FileText;

                    return (
                      <button
                        key={step.num}
                        type="button"
                        onClick={() => setActiveStep(step.num)}
                        className={`group relative p-2.5 rounded-lg text-left border transition-all duration-200 flex items-center gap-2.5 cursor-pointer ${
                          isActive
                            ? 'border-amber-400 bg-amber-50/50 shadow-2xs'
                            : isPassed
                            ? 'border-emerald-200 bg-emerald-50/30 text-emerald-900 hover:bg-emerald-50/60'
                            : 'border-neutral-200/70 bg-neutral-50/50 text-neutral-500 hover:bg-neutral-100'
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0 transition-transform ${
                            isActive
                              ? 'bg-amber-600 text-white'
                              : isPassed
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white border border-neutral-200 text-neutral-400'
                          }`}
                        >
                          {isPassed ? <Check size={12} strokeWidth={2.5} /> : <StepIcon size={12} />}
                        </div>
                        <div className="overflow-hidden min-w-0">
                          <p
                            className={`text-xs font-semibold truncate ${
                              isActive ? 'text-neutral-900' : isPassed ? 'text-emerald-900' : 'text-neutral-700'
                            }`}
                          >
                            {step.num}. {step.label}
                          </p>
                          <p className="text-[10px] text-neutral-400 truncate mt-0.5">{step.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Mobile Stepper - Clean, modern CRM pill layout with compact buttons and subtle colors */}
                <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {[
                    { num: 1, label: 'Bilgiler', icon: FileText },
                    { num: 2, label: `Ürünler (${formData.selectedItems.length})`, icon: Layers },
                    { num: 3, label: 'Şablon', icon: LayoutTemplate },
                    { num: 4, label: 'Marka', icon: Palette },
                    { num: 5, label: 'Tasarım', icon: Sliders },
                    { num: 6, label: 'Önizleme', icon: Sparkles }
                  ].map((step) => {
                    const isActive = activeStep === step.num;
                    const isPassed = activeStep > step.num;
                    const StepIcon = step.icon;

                    return (
                      <button
                        key={step.num}
                        type="button"
                        onClick={() => setActiveStep(step.num)}
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer border ${
                          isActive
                            ? 'bg-amber-500 text-white border-amber-600 shadow-2xs font-semibold'
                            : isPassed
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'
                        }`}
                      >
                        <StepIcon size={11} className={isActive ? 'text-white' : isPassed ? 'text-emerald-600' : 'text-neutral-400'} />
                        <span>{step.num}. {step.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step Content Area */}
              <div className="bg-white rounded-xl border border-neutral-200 shadow-2xs p-3.5 sm:p-6">
                {/* STEP 1: KATALOG BİLGİLERİ & ÇOK DİLLİ AYARLAR */}
                {activeStep === 1 && (
                  <div className="space-y-4 sm:space-y-5">
                    {/* Header Banner - Compact & Clean CRM style */}
                    <div className="p-3 sm:p-4 rounded-lg bg-neutral-50/80 border border-neutral-200/80 flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-semibold tracking-wide">
                            ADIM 1
                          </span>
                          <h3 className="text-xs sm:text-sm font-bold text-neutral-800 flex items-center gap-1.5">
                            <FileText size={14} className="text-amber-600" />
                            <span>Katalog Temel Bilgileri & Dil</span>
                          </h3>
                        </div>
                        <p className="text-[11px] text-neutral-500 mt-0.5 hidden sm:block">
                          Kataloğunuzun başlığı, kapak metinleri, sayfa yönü ve dilini belirleyin.
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200/60 flex-shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Canlı Önizleme</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
                      {/* Left: Input Form (7 cols) */}
                      <div className="lg:col-span-7 space-y-3 sm:space-y-4">
                        {/* Title Input */}
                        <div className="space-y-1 bg-white p-3 sm:p-3.5 rounded-lg border border-neutral-200/90 shadow-2xs">
                          <label className="text-[11px] font-semibold text-neutral-700 flex items-center justify-between">
                            <span>Katalog Adı *</span>
                            <span className="text-[10px] text-neutral-400 font-normal">Panelde görünür</span>
                          </label>
                          <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Örn: 2026 Genel Katalog"
                            className="w-full px-3 py-2 bg-neutral-50/60 hover:bg-white focus:bg-white border border-neutral-200 focus:border-amber-500 rounded-lg text-xs font-medium text-neutral-900 transition-all outline-none"
                          />
                        </div>

                        {/* Cover Titles */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 bg-white p-3 sm:p-3.5 rounded-lg border border-neutral-200/90 shadow-2xs">
                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-neutral-700 block">Kapak Ana Başlığı</label>
                            <input
                              type="text"
                              value={formData.coverTitle}
                              onChange={(e) => setFormData({ ...formData, coverTitle: e.target.value })}
                              placeholder="SERAMİK KOLEKSİYONU 2026"
                              className="w-full px-3 py-2 bg-neutral-50/60 hover:bg-white focus:bg-white border border-neutral-200 focus:border-amber-500 rounded-lg text-xs font-medium text-neutral-900 transition-all outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-neutral-700 block">Kapak Alt Başlığı</label>
                            <input
                              type="text"
                              value={formData.coverSubtitle}
                              onChange={(e) => setFormData({ ...formData, coverSubtitle: e.target.value })}
                              placeholder="ARCHITECTURAL CATALOG"
                              className="w-full px-3 py-2 bg-neutral-50/60 hover:bg-white focus:bg-white border border-neutral-200 focus:border-amber-500 rounded-lg text-xs font-medium text-neutral-900 transition-all outline-none"
                            />
                          </div>
                          <div className="sm:col-span-2 space-y-1 pt-0.5">
                            <label className="text-[11px] font-semibold text-neutral-700 block">Önsöz / Tanıtım Metni</label>
                            <textarea
                              rows={2}
                              value={formData.introText}
                              onChange={(e) => setFormData({ ...formData, introText: e.target.value })}
                              placeholder="Katalog tanıtım yazısı..."
                              className="w-full px-3 py-2 bg-neutral-50/60 hover:bg-white focus:bg-white border border-neutral-200 focus:border-amber-500 rounded-lg text-xs text-neutral-800 transition-all outline-none leading-relaxed"
                            />
                          </div>
                        </div>

                        {/* Orientation Selection */}
                        <div className="space-y-1.5 bg-white p-3 sm:p-3.5 rounded-lg border border-neutral-200/90 shadow-2xs">
                          <label className="text-[11px] font-semibold text-neutral-700 block">Sayfa Yönü</label>
                          <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, orientation: 'portrait' })}
                              className={`p-2.5 rounded-lg border text-left transition-all flex items-center gap-2.5 cursor-pointer ${
                                formData.orientation === 'portrait'
                                  ? 'border-amber-500 bg-amber-50/40 shadow-2xs'
                                  : 'border-neutral-200 bg-neutral-50/50 hover:border-neutral-300'
                              }`}
                            >
                              <div
                                className={`w-6 h-8 rounded border flex items-center justify-center text-[8px] font-mono font-bold flex-shrink-0 ${
                                  formData.orientation === 'portrait'
                                    ? 'border-amber-600 bg-amber-100 text-amber-800'
                                    : 'border-neutral-300 text-neutral-400'
                                }`}
                              >
                                A4
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-neutral-900">A4 Dikey</p>
                                <p className="text-[10px] text-neutral-400 font-mono">210 × 297 mm</p>
                              </div>
                            </button>

                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, orientation: 'landscape' })}
                              className={`p-2.5 rounded-lg border text-left transition-all flex items-center gap-2.5 cursor-pointer ${
                                formData.orientation === 'landscape'
                                  ? 'border-amber-500 bg-amber-50/40 shadow-2xs'
                                  : 'border-neutral-200 bg-neutral-50/50 hover:border-neutral-300'
                              }`}
                            >
                              <div
                                className={`w-8 h-6 rounded border flex items-center justify-center text-[8px] font-mono font-bold flex-shrink-0 ${
                                  formData.orientation === 'landscape'
                                    ? 'border-amber-600 bg-amber-100 text-amber-800'
                                    : 'border-neutral-300 text-neutral-400'
                                }`}
                              >
                                A4
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-neutral-900">A4 Yatay</p>
                                <p className="text-[10px] text-neutral-400 font-mono">297 × 210 mm</p>
                              </div>
                            </button>
                          </div>
                        </div>

                        {/* Multi-Language Selection */}
                        <div className="space-y-1.5 bg-white p-3 sm:p-3.5 rounded-lg border border-neutral-200/90 shadow-2xs">
                          <label className="text-[11px] font-semibold text-neutral-700 block">Katalog Dili</label>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
                            {[
                              { code: 'tr', flag: '🇹🇷', label: 'Türkçe', sub: 'İç Pazar' },
                              { code: 'en', flag: '🇬🇧', label: 'English', sub: 'Global' },
                              { code: 'de', flag: '🇩🇪', label: 'Deutsch', sub: 'Avrupa' },
                              { code: 'ar', flag: '🇸🇦', label: 'العربية', sub: 'Orta Doğu' }
                            ].map((lang) => {
                              const isSelected = formData.language === lang.code;
                              return (
                                <button
                                  key={lang.code}
                                  type="button"
                                  onClick={() => setFormData({ ...formData, language: lang.code })}
                                  className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                                    isSelected
                                      ? 'border-amber-500 bg-amber-50/50 shadow-2xs'
                                      : 'border-neutral-200 bg-neutral-50/50 hover:border-neutral-300'
                                  }`}
                                >
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-sm">{lang.flag}</span>
                                    <span className="text-xs font-semibold text-neutral-900">{lang.label}</span>
                                  </div>
                                  <p className="text-[9px] text-neutral-400 truncate mt-0.5">{lang.sub}</p>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Data Sync Mode: Live vs Snapshot */}
                        <div className="space-y-1.5 bg-white p-3 sm:p-3.5 rounded-lg border border-neutral-200/90 shadow-2xs">
                          <label className="text-[11px] font-semibold text-neutral-700 block">
                            Ürün Veri Senkronizasyonu
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, dataMode: 'live' })}
                              className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                                formData.dataMode === 'live'
                                  ? 'border-amber-500 bg-amber-50/40 shadow-2xs'
                                  : 'border-neutral-200 bg-neutral-50/50 hover:border-neutral-300'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <RefreshCw size={12} className="text-amber-600" />
                                <span className="text-xs font-semibold text-neutral-900">Canlı Stok Senkronu</span>
                              </div>
                              <p className="text-[10px] text-neutral-500 leading-tight">
                                Ürün değiştikçe katalog otomatik güncellenir.
                              </p>
                            </button>

                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, dataMode: 'snapshot' })}
                              className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                                formData.dataMode === 'snapshot'
                                  ? 'border-amber-500 bg-amber-50/40 shadow-2xs'
                                  : 'border-neutral-200 bg-neutral-50/50 hover:border-neutral-300'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <Archive size={12} className="text-neutral-500" />
                                <span className="text-xs font-semibold text-neutral-900">Sabit Sürüm (Arşiv)</span>
                              </div>
                              <p className="text-[10px] text-neutral-500 leading-tight">
                                Tasarım o anki verilerle dondurulur.
                              </p>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Right: Modern Live Card Preview (5 cols) */}
                      <div className="lg:col-span-5 sticky top-6 space-y-3">
                        <div className="flex items-center justify-between text-xs font-bold text-neutral-600 px-1">
                          <span className="flex items-center gap-1.5">
                            <Sparkles size={13} className="text-[#b4823c]" />
                            <span>Kapak Canlı Kartı</span>
                          </span>
                          <span className="font-mono text-[10px] text-neutral-400 uppercase">
                            {formData.orientation === 'landscape' ? '297×210 mm' : '210×297 mm'}
                          </span>
                        </div>

                        {/* Interactive Simulated Book Cover */}
                        <div className="bg-neutral-900 rounded-xl p-4 sm:p-5 border border-neutral-800 shadow-md overflow-hidden relative group text-white">
                          <div
                            className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:scale-105 transition-transform duration-700"
                            style={{
                              backgroundImage: `url(${CARD_COVERS[0]})`
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/70 to-transparent" />

                          <div className="relative z-10 flex flex-col justify-between h-[280px] sm:h-[320px]">
                            {/* Top Brand Header */}
                            <div className="flex items-center justify-between text-[10px] font-mono tracking-wider text-neutral-400 uppercase pb-1.5 border-b border-white/10">
                              <span>{brandInfo?.name || 'SERAMİKBAK'}</span>
                              <span className="text-amber-400 font-bold">{formData.language?.toUpperCase() || 'TR'}</span>
                            </div>

                            {/* Middle Title Display */}
                            <div className="my-auto text-center px-2 space-y-1.5">
                              <span className="inline-block px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 text-[8px] font-mono tracking-wider uppercase border border-amber-400/30">
                                2026 ARCHITECTURAL CATALOG
                              </span>
                              <h4 className="text-lg sm:text-xl font-serif font-bold tracking-tight text-white uppercase drop-shadow-sm">
                                {formData.coverTitle || formData.title || 'SERAMİK KOLEKSİYONU'}
                              </h4>
                              <p className="text-[11px] text-neutral-300 font-sans tracking-wide">
                                {formData.coverSubtitle || 'TECHNICAL & ARCHITECTURAL CATALOG'}
                              </p>
                            </div>

                            {/* Bottom Card Footer */}
                            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[9px] text-neutral-400 font-mono">
                              <span>{formData.orientation === 'landscape' ? 'A4 YATAY' : 'A4 DİKEY'}</span>
                              <span className="text-amber-400/90">• {formData.dataMode === 'live' ? 'CANLI SENKRON' : 'SABİT ARŞİV'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-200 text-[11px] text-neutral-600 flex items-center gap-2">
                          <CheckCircle2 size={13} className="text-emerald-600 flex-shrink-0" />
                          <span>Bu bilgiler katalog kapağında ve içindekiler sayfasında otomatik biçimlendirilecektir.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: AKILLI ÜRÜN & VARYANT YÖNETİMİ */}
                {activeStep === 2 && (
                  <div className="space-y-5">
                    {/* Header: Title, Action Bar & View Mode Toggle */}
                    <div className="border-b border-neutral-100 pb-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-extrabold text-neutral-900 flex items-center gap-2">
                          <Layers size={20} className="text-[#b4823c]" />
                          <span>2. Akıllı Ürün & Koleksiyon Seçimi</span>
                        </h3>
                        <p className="text-xs text-neutral-500 mt-1">
                          Koleksiyon, ebat ve yüzey varyantlarını tek tıkla gruplayın veya tekil karoları arayıp seçin.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {/* View Mode Toggle: Grid vs Series Groups */}
                        <div className="inline-flex rounded-xl border border-neutral-200 bg-neutral-100 p-0.5">
                          <button
                            type="button"
                            onClick={() => setProductGroupingMode('grid')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                              productGroupingMode === 'grid'
                                ? 'bg-white text-neutral-900 shadow-2xs'
                                : 'text-neutral-600 hover:text-neutral-900'
                            }`}
                            title="Tekil Karo Kartları"
                          >
                            <LayoutGrid size={13} />
                            <span>Kart Görünümü</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setProductGroupingMode('series')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                              productGroupingMode === 'series'
                                ? 'bg-white text-neutral-900 shadow-2xs'
                                : 'text-neutral-600 hover:text-neutral-900'
                            }`}
                            title="Koleksiyon ve Ebat Grupları"
                          >
                            <Box size={13} />
                            <span>Seri / Varyant Grupları</span>
                          </button>
                        </div>

                        {/* Batch Action: Select All Filtered */}
                        <button
                          type="button"
                          onClick={() => {
                            const newSelected = [...formData.selectedItems];
                            filteredAvailableProducts.forEach((p) => {
                              if (!newSelected.some((i) => i.productId === p.id)) {
                                newSelected.push({
                                  productId: p.id,
                                  customNote: '',
                                  usageArea: p.style || 'İç Mekân'
                                });
                              }
                            });
                            setFormData((prev) => ({ ...prev, selectedItems: newSelected }));
                          }}
                          className="px-3 py-1.5 rounded-lg border border-neutral-200 text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition"
                          title="Filtreye uyan tüm ürünleri ekle"
                        >
                          Filtrelenenleri Seç ({filteredAvailableProducts.length})
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const selectedProds = availableProducts.filter((p) =>
                              formData.selectedItems.some((item) => item.productId === p.id)
                            );
                            setQrStickerModalData({
                              catalog: { title: formData.title || 'Yeni Katalog', publicSlug: '' },
                              products: selectedProds.length > 0 ? selectedProds : filteredAvailableProducts
                            });
                          }}
                          className="px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                          title="Seçili modeller için anında A4 Showroom QR Etiketi üret"
                        >
                          <QrCode size={13} className="text-[#b4823c]" />
                          <span>Showroom QR Etiketi Al</span>
                        </button>

                        {/* Clear Selection */}
                        {formData.selectedItems.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, selectedItems: [] }))}
                            className="px-3 py-1.5 rounded-lg border border-rose-200 text-xs font-bold text-rose-600 hover:bg-rose-50 transition"
                          >
                            Temizle
                          </button>
                        )}

                        <span className="text-xs font-bold px-3.5 py-1.5 bg-amber-100 text-amber-900 rounded-full border border-amber-200 shadow-2xs">
                          {formData.selectedItems.length} Ürün Seçildi
                        </span>
                      </div>
                    </div>

                    {/* Multi-Criteria Filter Bar */}
                    <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200/80 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        {/* Search Input */}
                        <div className="relative">
                          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                          <input
                            type="text"
                            value={productSearch}
                            onChange={(e) => {
                              setProductSearch(e.target.value);
                              setProductPage(1);
                            }}
                            placeholder="Ürün adı, SKU kodu, ebat veya renk..."
                            className="w-full pl-8 pr-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#b4823c] focus:border-transparent transition"
                          />
                        </div>

                        {/* Series / Collection Dropdown */}
                        <select
                          value={productSeriesFilter}
                          onChange={(e) => {
                            setProductSeriesFilter(e.target.value);
                            setProductPage(1);
                          }}
                          className="px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-medium text-neutral-800"
                        >
                          <option value="all">Tüm Koleksiyonlar & Seriler ({productSeriesList.length - 1})</option>
                          {productSeriesList
                            .filter((s) => s !== 'all')
                            .map((s) => (
                              <option key={s} value={s}>
                                {s} Serisi
                              </option>
                            ))}
                        </select>

                        {/* Dimensions Dropdown */}
                        <select
                          value={productDimensionFilter}
                          onChange={(e) => {
                            setProductDimensionFilter(e.target.value);
                            setProductPage(1);
                          }}
                          className="px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-medium text-neutral-800"
                        >
                          <option value="all">Tüm Ebatlar & Ölçüler ({productDimensionsList.length - 1})</option>
                          {productDimensionsList
                            .filter((d) => d !== 'all')
                            .map((d) => (
                              <option key={d} value={d}>
                                {d} cm
                              </option>
                            ))}
                        </select>
                      </div>

                      {/* Secondary Filters row */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                        {/* Color Dropdown */}
                        <select
                          value={productColorFilter}
                          onChange={(e) => {
                            setProductColorFilter(e.target.value);
                            setProductPage(1);
                          }}
                          className="px-3 py-1.5 bg-white border border-neutral-200 rounded-lg text-xs font-medium text-neutral-700"
                        >
                          <option value="all">Tüm Renkler ({productColorsList.length - 1})</option>
                          {productColorsList
                            .filter((c) => c !== 'all')
                            .map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                        </select>

                        {/* Surface / Finish Dropdown */}
                        <select
                          value={productFinishFilter}
                          onChange={(e) => {
                            setProductFinishFilter(e.target.value);
                            setProductPage(1);
                          }}
                          className="px-3 py-1.5 bg-white border border-neutral-200 rounded-lg text-xs font-medium text-neutral-700"
                        >
                          <option value="all">Tüm Yüzeyler ({productFinishesList.length - 1})</option>
                          {productFinishesList
                            .filter((f) => f !== 'all')
                            .map((f) => (
                              <option key={f} value={f}>
                                {f}
                              </option>
                            ))}
                        </select>

                        {/* Style / Material Dropdown */}
                        <select
                          value={productCategoryFilter}
                          onChange={(e) => {
                            setProductCategoryFilter(e.target.value);
                            setProductPage(1);
                          }}
                          className="px-3 py-1.5 bg-white border border-neutral-200 rounded-lg text-xs font-medium text-neutral-700"
                        >
                          <option value="all">Tüm Tarzlar ({productCategories.length - 1})</option>
                          {productCategories
                            .filter((c) => c !== 'all')
                            .map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                        </select>

                        {/* Reset Filters button */}
                        {(productSearch || productSeriesFilter !== 'all' || productDimensionFilter !== 'all' || productColorFilter !== 'all' || productFinishFilter !== 'all' || productCategoryFilter !== 'all') ? (
                          <button
                            type="button"
                            onClick={() => {
                              setProductSearch('');
                              setProductSeriesFilter('all');
                              setProductDimensionFilter('all');
                              setProductColorFilter('all');
                              setProductFinishFilter('all');
                              setProductCategoryFilter('all');
                              setProductPage(1);
                            }}
                            className="px-3 py-1.5 bg-neutral-200/80 hover:bg-neutral-300 text-neutral-700 rounded-lg text-xs font-bold transition text-center"
                          >
                            Filtreleri Sıfırla
                          </button>
                        ) : (
                          <div className="flex items-center justify-end text-[11px] text-neutral-500 font-medium px-2">
                            {filteredAvailableProducts.length} ürün listeleniyor
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Selected Series Chips Summary */}
                    {selectedSeriesSummary.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 p-2 bg-amber-50/60 rounded-xl border border-amber-200/60">
                        <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider mr-1">
                          Seçili Seriler:
                        </span>
                        {selectedSeriesSummary.map(([series, count]) => (
                          <span
                            key={series}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white border border-amber-300 text-amber-900 shadow-2xs"
                          >
                            <span>{series}</span>
                            <span className="font-mono bg-amber-100 text-amber-900 rounded-full px-1.5 py-0.2 text-[10px] font-bold">
                              {count}
                            </span>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* CONTENT AREA: Mode A (Grid) or Mode B (Series Groups) */}
                    <div className="border border-neutral-200 rounded-2xl p-4 bg-neutral-50/70 min-h-[320px]">
                      {productsLoading ? (
                        <div className="py-16 text-center text-neutral-500">
                          <Loader2 size={26} className="animate-spin text-[#b4823c] mx-auto mb-2" />
                          <p className="text-xs font-bold">Marka ürünleri yükleniyor...</p>
                        </div>
                      ) : filteredAvailableProducts.length === 0 ? (
                        <div className="py-16 text-center text-neutral-500">
                          <AlertCircle size={28} className="mx-auto mb-2 text-neutral-400" />
                          <p className="text-xs font-bold">Filtre kriterlerine uygun ürün bulunamadı.</p>
                          <p className="text-[11px] text-neutral-400 mt-1">Lütfen arama terimini veya filtre seçimlerini temizleyin.</p>
                        </div>
                      ) : productGroupingMode === 'grid' ? (
                        /* MODE A: PAGINATED GRID VIEW */
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                            {paginatedProducts.map((p) => {
                              const isSelected = formData.selectedItems.some((i) => i.productId === p.id);
                              return (
                                <div
                                  key={p.id}
                                  onClick={() => handleToggleProduct(p)}
                                  className={`p-2.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between group hover:shadow-md ${
                                    isSelected
                                      ? 'border-[#b4823c] bg-amber-50/70 shadow-2xs'
                                      : 'border-neutral-200 bg-white hover:border-neutral-300'
                                  }`}
                                >
                                  <div className="aspect-square rounded-lg bg-neutral-100 overflow-hidden mb-2 relative">
                                    <img
                                      src={p.imageUrl || p.textureUrl || '/placeholder.png'}
                                      alt={p.name}
                                      loading="lazy"
                                      decoding="async"
                                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                    />
                                    {isSelected ? (
                                      <div className="absolute top-1.5 right-1.5 bg-[#b4823c] text-white font-bold rounded-full p-1 shadow">
                                        <Check size={12} />
                                      </div>
                                    ) : (
                                      <div className="absolute top-1.5 right-1.5 bg-black/40 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition">
                                        <Plus size={12} />
                                      </div>
                                    )}
                                    {p.style && (
                                      <span className="absolute bottom-1.5 left-1.5 bg-neutral-900/80 backdrop-blur-xs text-white text-[9px] font-semibold px-1.5 py-0.5 rounded">
                                        {p.style}
                                      </span>
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-xs font-bold text-neutral-800 truncate" title={p.name}>{p.name}</p>
                                    <div className="flex items-center justify-between text-[10px] text-neutral-500 font-mono mt-0.5">
                                      <span>{p.width && p.height ? `${p.width}×${p.height} cm` : ''}</span>
                                      <span className="truncate max-w-[60px] text-neutral-400">{p.finish || ''}</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Pagination Controls */}
                          <div className="pt-3 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                            <div className="flex items-center gap-2 text-xs text-neutral-600">
                              <span>Sayfa Başına:</span>
                              <select
                                value={productPageSize}
                                onChange={(e) => {
                                  setProductPageSize(Number(e.target.value));
                                  setProductPage(1);
                                }}
                                className="px-2 py-1 bg-white border border-neutral-300 rounded-lg text-xs font-bold"
                              >
                                <option value={24}>24</option>
                                <option value={48}>48</option>
                                <option value={96}>96</option>
                              </select>
                              <span className="text-neutral-400">|</span>
                              <span className="font-medium">
                                Toplam <strong>{filteredAvailableProducts.length}</strong> ürün ({totalProductPages} sayfa)
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                disabled={productPage <= 1}
                                onClick={() => setProductPage((prev) => Math.max(1, prev - 1))}
                                className="px-3 py-1.5 rounded-lg border border-neutral-200 bg-white text-xs font-bold text-neutral-700 hover:bg-neutral-50 disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                Önceki
                              </button>
                              <span className="text-xs font-bold px-3 py-1 bg-neutral-200/70 rounded-lg text-neutral-800">
                                {productPage} / {totalProductPages}
                              </span>
                              <button
                                type="button"
                                disabled={productPage >= totalProductPages}
                                onClick={() => setProductPage((prev) => Math.min(totalProductPages, prev + 1))}
                                className="px-3 py-1.5 rounded-lg border border-neutral-200 bg-white text-xs font-bold text-neutral-700 hover:bg-neutral-50 disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                Sonraki
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* MODE B: SERIES & VARIANT GROUPED VIEW (TILES CATALOGUE PATTERN) */
                        <div className="space-y-3">
                          <p className="text-xs text-neutral-500 font-medium mb-2">
                            Aynı koleksiyona ait farklı ebat, kalınlık ve yüzey varyantlarını bir arada görüntüleyin. Tüm seriyi tek tıkla kataloğa ekleyebilir veya varyant bazında seçim yapabilirsiniz:
                          </p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                            {groupedBySeries.map((seriesGroup) => {
                              const seriesItems = seriesGroup.items;
                              const selectedCountInSeries = seriesItems.filter((p) =>
                                formData.selectedItems.some((i) => i.productId === p.id)
                              ).length;
                              const isAllSelected = selectedCountInSeries === seriesItems.length && seriesItems.length > 0;
                              const isExpanded = Boolean(expandedSeries[seriesGroup.name]);

                              // Distinct sizes in this series
                              const distinctSizes = Array.from(
                                new Set(seriesItems.map((p) => (p.width && p.height ? `${p.width}×${p.height}` : null)).filter(Boolean))
                              );

                              return (
                                <div
                                  key={seriesGroup.name}
                                  className={`rounded-2xl border transition-all bg-white overflow-hidden ${
                                    selectedCountInSeries > 0
                                      ? 'border-[#b4823c] ring-1 ring-[#b4823c]/20'
                                      : 'border-neutral-200 hover:border-neutral-300'
                                  }`}
                                >
                                  {/* Series Card Header */}
                                  <div className="p-3.5 flex items-start justify-between gap-3 bg-neutral-50/50">
                                    <div className="flex items-center gap-3">
                                      <img
                                        src={seriesGroup.sampleImg || '/placeholder.png'}
                                        alt={seriesGroup.name}
                                        loading="lazy"
                                        className="w-13 h-13 rounded-xl object-cover border border-neutral-200 flex-shrink-0 shadow-2xs"
                                      />
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <h4 className="text-sm font-extrabold text-neutral-900">
                                            {seriesGroup.name} Serisi
                                          </h4>
                                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-200/80 text-neutral-700">
                                            {seriesItems.length} Varyant
                                          </span>
                                        </div>
                                        <p className="text-[11px] text-neutral-500 font-medium mt-0.5">
                                          {seriesGroup.style || 'Seramik Karo'}
                                        </p>
                                        {/* Distinct Size Badges */}
                                        <div className="flex flex-wrap gap-1 mt-1.5">
                                          {distinctSizes.map((sz) => (
                                            <span
                                              key={sz}
                                              className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-white border border-neutral-300 text-neutral-700"
                                            >
                                              {sz} cm
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                                      {isAllSelected ? (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const itemIds = new Set(seriesItems.map((p) => p.id));
                                            setFormData((prev) => ({
                                              ...prev,
                                              selectedItems: prev.selectedItems.filter((i) => !itemIds.has(i.productId))
                                            }));
                                          }}
                                          className="px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-[11px] font-bold text-rose-700 hover:bg-rose-100 transition"
                                        >
                                          Seriyi Çıkar
                                        </button>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const newSelected = [...formData.selectedItems];
                                            seriesItems.forEach((p) => {
                                              if (!newSelected.some((i) => i.productId === p.id)) {
                                                newSelected.push({
                                                  productId: p.id,
                                                  customNote: '',
                                                  usageArea: p.style || 'İç Mekân'
                                                });
                                              }
                                            });
                                            setFormData((prev) => ({ ...prev, selectedItems: newSelected }));
                                          }}
                                          className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold transition shadow-2xs"
                                        >
                                          Tüm Seriyi Ekle (+{seriesItems.length - selectedCountInSeries})
                                        </button>
                                      )}

                                      <button
                                        type="button"
                                        onClick={() =>
                                          setExpandedSeries((prev) => ({
                                            ...prev,
                                            [seriesGroup.name]: !prev[seriesGroup.name]
                                          }))
                                        }
                                        className="text-[11px] font-bold text-neutral-600 hover:text-neutral-900 flex items-center gap-1 transition"
                                      >
                                        <span>{isExpanded ? 'Gizle' : 'Varyantları Gör'}</span>
                                        {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                                      </button>
                                    </div>
                                  </div>

                                  {/* Accordion: Individual Variants in Series */}
                                  {isExpanded && (
                                    <div className="p-3 border-t border-neutral-100 bg-neutral-50/40 divide-y divide-neutral-100 max-h-56 overflow-y-auto">
                                      {seriesItems.map((p) => {
                                        const isVariantSelected = formData.selectedItems.some((i) => i.productId === p.id);
                                        return (
                                          <div
                                            key={p.id}
                                            onClick={() => handleToggleProduct(p)}
                                            className="py-2 flex items-center justify-between cursor-pointer hover:bg-neutral-100/60 px-2 rounded-lg transition"
                                          >
                                            <div className="flex items-center gap-2.5">
                                              <input
                                                type="checkbox"
                                                checked={isVariantSelected}
                                                readOnly
                                                className="rounded border-neutral-300 text-[#b4823c] focus:ring-[#b4823c]"
                                              />
                                              <div>
                                                <p className="text-xs font-bold text-neutral-800">{p.name}</p>
                                                <p className="text-[10px] text-neutral-500 font-mono">
                                                  {p.width && p.height ? `${p.width}×${p.height} cm` : ''} • {p.finish || 'Standart'} • {p.color || ''}
                                                </p>
                                              </div>
                                            </div>
                                            <span
                                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                                isVariantSelected
                                                  ? 'bg-amber-100 text-amber-900'
                                                  : 'bg-neutral-200/70 text-neutral-600'
                                              }`}
                                            >
                                              {isVariantSelected ? 'Seçildi' : 'Seç'}
                                            </span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
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

                {/* STEP 3: ŞABLON SEÇİMİ — MODERN & UNIFIED DESIGN */}
                {activeStep === 3 && (
                  <div className="space-y-6 max-w-6xl">
                    {/* Header Banner */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-stone-50 via-amber-50/20 to-neutral-50 border border-neutral-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-[#b4823c]/10 text-[#b4823c] font-mono text-[10px] font-bold uppercase tracking-wider">
                            ADIM 3 / 6
                          </span>
                          <span className="text-xs font-mono text-neutral-400">• Tasarım Mimarisi</span>
                        </div>
                        <h3 className="text-base sm:text-lg font-extrabold text-neutral-900 mt-1 flex items-center gap-2">
                          <LayoutTemplate size={18} className="text-[#b4823c]" />
                          <span>Profesyonel Katalog Tasarım Şablonu Seçin</span>
                        </h3>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          Kataloğunuzun kapak, ürün yerleşimi, teknik şartname ve editoryal mizanpajını belirleyin. 'Şablonları Keşfet' kütüphanesindeki tüm tasarımlar burada mevcuttur.
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setStep3PreviewTemplate(activeTemplateObj);
                            setStep3PreviewPageIdx(0);
                          }}
                          className="px-3.5 py-2 rounded-xl bg-white border border-neutral-200 hover:border-[#b4823c] text-neutral-800 text-xs font-bold flex items-center gap-1.5 shadow-2xs hover:shadow-xs transition cursor-pointer"
                        >
                          <Eye size={14} className="text-[#b4823c]" />
                          <span>Mevcut Şablonu Önizle</span>
                        </button>
                      </div>
                    </div>

                    {/* AKTİF SEÇİLİ ŞABLON VURGUSU (HERO SUMMARY CARD) */}
                    {activeTemplateObj && (
                      <div className="p-4 sm:p-5 rounded-2xl bg-white border-2 border-[#e07a2c] ring-2 ring-[#e07a2c]/10 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="relative w-28 h-20 sm:w-36 sm:h-24 rounded-xl overflow-hidden bg-neutral-900 flex-shrink-0 border border-neutral-200">
                            <img
                              src={activeTemplateObj.coverImg}
                              alt={activeTemplateObj.name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-1.5">
                              <span className="text-[9px] font-mono font-bold text-white uppercase bg-black/60 px-1.5 py-0.5 rounded">
                                {activeTemplateObj.pageCount} Sayfa
                              </span>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#e07a2c] text-white text-[10px] font-extrabold uppercase shadow-2xs">
                                <Check size={11} strokeWidth={3} />
                                <span>Aktif Seçili Şablon</span>
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${activeTemplateObj.styleBadgeClass || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                                {activeTemplateObj.style}
                              </span>
                              <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                {activeTemplateObj.type}
                              </span>
                            </div>
                            <h4 className="text-sm sm:text-base font-extrabold text-neutral-900">
                              {activeTemplateObj.name}
                            </h4>
                            <p className="text-xs text-neutral-600 line-clamp-1 max-w-xl">
                              {activeTemplateObj.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setStep3PreviewTemplate(activeTemplateObj);
                              setStep3PreviewPageIdx(0);
                            }}
                            className="px-4 py-2 rounded-xl bg-[#e07a2c] hover:bg-[#cf6d22] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                          >
                            <Eye size={14} />
                            <span>Sayfaları İncele</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* SEARCH & FILTER CONTROLS BAR */}
                    <div className="bg-white rounded-2xl border border-neutral-200/90 p-4 shadow-2xs space-y-3">
                      {/* Top: Search and Counts */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="relative flex-1 max-w-md">
                          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                          <input
                            type="text"
                            value={step3Search}
                            onChange={(e) => setStep3Search(e.target.value)}
                            placeholder="Şablon ara... (örn: Mimari, Banyo, Mermer, Fuar)"
                            className="w-full pl-9 pr-8 py-2 rounded-xl border border-neutral-200 bg-neutral-50/60 focus:bg-white focus:border-[#b4823c] text-xs font-medium text-neutral-800 placeholder-neutral-400 outline-none transition"
                          />
                          {step3Search && (
                            <button
                              type="button"
                              onClick={() => setStep3Search('')}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                            >
                              <X size={13} />
                            </button>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-neutral-500 font-medium">
                          <span>{step3FilteredTemplates.length} şablon gösteriliyor</span>
                          {(step3Search || step3Style !== 'all' || step3Type !== 'all') && (
                            <button
                              type="button"
                              onClick={() => {
                                setStep3Search('');
                                setStep3Style('all');
                                setStep3Type('all');
                              }}
                              className="text-xs font-bold text-[#b4823c] hover:underline cursor-pointer ml-1"
                            >
                              Filtreleri Temizle
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Style Filter Pills */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-neutral-100">
                        <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mr-1">
                          Tarz:
                        </span>
                        {[
                          { id: 'all', label: `Tümü (${CATALOG_TEMPLATES_DATA.length})` },
                          { id: 'Modern', label: 'Modern' },
                          { id: 'Minimal', label: 'Minimal' },
                          { id: 'Premium', label: 'Premium' },
                          { id: 'Doğal', label: 'Doğal' },
                          { id: 'Teknik', label: 'Teknik' },
                          { id: 'Klasik', label: 'Klasik' },
                          { id: 'Endüstriyel', label: 'Endüstriyel' }
                        ].map((pill) => {
                          const isActive = step3Style === pill.id;
                          return (
                            <button
                              key={pill.id}
                              type="button"
                              onClick={() => setStep3Style(pill.id)}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                                isActive
                                  ? 'bg-neutral-900 text-white shadow-2xs'
                                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                              }`}
                            >
                              {pill.label}
                            </button>
                          );
                        })}
                      </div>

                      {/* Type Filter Pills */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mr-1">
                          Tür:
                        </span>
                        {[
                          { id: 'all', label: 'Tüm Türler' },
                          { id: 'Klasik Katalog', label: 'Klasik Katalog' },
                          { id: 'Lookbook', label: 'Lookbook' },
                          { id: 'Teknik Katalog', label: 'Teknik Katalog' },
                          { id: 'Dijital Broşür', label: 'Dijital Broşür' }
                        ].map((pill) => {
                          const isActive = step3Type === pill.id;
                          return (
                            <button
                              key={pill.id}
                              type="button"
                              onClick={() => setStep3Type(pill.id)}
                              className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                                isActive
                                  ? 'bg-[#b4823c] text-white'
                                  : 'bg-neutral-100/80 text-neutral-500 hover:bg-neutral-200/80'
                              }`}
                            >
                              {pill.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* TEMPLATES CARDS GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {step3FilteredTemplates.map((tpl) => {
                        const isSelected =
                          formData.template === tpl.templateId ||
                          formData.template === tpl.id ||
                          (formData.template === 'milano' && tpl.templateId === 'premium-mimari');

                        return (
                          <div
                            key={tpl.id}
                            className={`bg-white rounded-2xl border transition-all flex flex-col justify-between group overflow-hidden ${
                              isSelected
                                ? 'border-[#e07a2c] ring-2 ring-[#e07a2c]/20 shadow-md bg-orange-50/10'
                                : 'border-slate-200/90 shadow-2xs hover:shadow-md hover:border-slate-300'
                            }`}
                          >
                            {/* Card Thumbnail */}
                            <div
                              onClick={() => setFormData({ ...formData, template: tpl.templateId })}
                              className="relative aspect-[16/10] bg-neutral-100 overflow-hidden cursor-pointer"
                            >
                              <img
                                src={tpl.coverImg}
                                alt={tpl.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />

                              {/* Active Selection Badge */}
                              {isSelected && (
                                <span className="absolute top-2.5 left-2.5 bg-[#e07a2c] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-md shadow-sm flex items-center gap-1 z-10">
                                  <Check size={11} strokeWidth={3} />
                                  <span>Seçili Şablon</span>
                                </span>
                              )}

                              {/* Quick Hover Preview Pill */}
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                <span className="px-3 py-1.5 rounded-xl bg-white/95 text-neutral-900 text-xs font-bold flex items-center gap-1.5 shadow-lg">
                                  <Eye size={13} className="text-[#e07a2c]" />
                                  <span>Şablonu İncele</span>
                                </span>
                              </div>
                            </div>

                            {/* Card Content */}
                            <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
                              <div>
                                <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                                      tpl.styleBadgeClass || 'bg-slate-100 text-slate-700 border-slate-200'
                                    }`}
                                  >
                                    {tpl.style}
                                  </span>
                                  <span className="text-[10px] font-mono text-slate-500 px-2 py-0.5 rounded-md bg-slate-100">
                                    {tpl.pageCount} sayfa
                                  </span>
                                  <span className="text-[10px] text-slate-400">
                                    {tpl.type}
                                  </span>
                                </div>

                                <h4
                                  onClick={() => setFormData({ ...formData, template: tpl.templateId })}
                                  className="text-sm font-bold text-slate-900 group-hover:text-[#e07a2c] transition-colors cursor-pointer"
                                >
                                  {tpl.name}
                                </h4>

                                <p className="text-xs text-neutral-500 mt-1 line-clamp-2 leading-relaxed">
                                  {tpl.description}
                                </p>
                              </div>

                              {/* Action Buttons Row */}
                              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                                <button
                                  type="button"
                                  onClick={() => setFormData({ ...formData, template: tpl.templateId })}
                                  className={`text-xs font-bold px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 flex-1 justify-center ${
                                    isSelected
                                      ? 'bg-[#e07a2c] text-white border-[#e07a2c] shadow-xs'
                                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                                  }`}
                                >
                                  {isSelected && <Check size={12} strokeWidth={3} />}
                                  <span>{isSelected ? '✓ Seçildi' : 'Bu Şablonu Seç'}</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setStep3PreviewTemplate(tpl);
                                    setStep3PreviewPageIdx(0);
                                  }}
                                  className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition flex items-center gap-1 cursor-pointer"
                                  title="Canlı Önizleme"
                                >
                                  <Eye size={13} />
                                  <span>Önizle</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Empty Filter State */}
                    {step3FilteredTemplates.length === 0 && (
                      <div className="p-12 text-center bg-white rounded-2xl border border-neutral-200 space-y-3">
                        <p className="text-sm font-bold text-neutral-800">
                          Aramanıza veya seçilen filtrelere uygun şablon bulunamadı.
                        </p>
                        <p className="text-xs text-neutral-500">
                          Filtreleri temizleyerek tüm 24 profesyonel şablonu görüntüleyebilirsiniz.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setStep3Search('');
                            setStep3Style('all');
                            setStep3Type('all');
                          }}
                          className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold cursor-pointer"
                        >
                          Filtreleri Sıfırla
                        </button>
                      </div>
                    )}

                    {/* Step 3 Live Walkthrough Preview Modal */}
                    {step3PreviewTemplate && (
                      <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
                        <div className="bg-neutral-950 border border-white/20 rounded-2xl max-w-5xl w-full h-[90vh] flex flex-col overflow-hidden shadow-2xl">
                          {/* Modal Header */}
                          <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between text-white">
                            <div className="flex items-center gap-3">
                              <span className="px-2.5 py-1 rounded bg-[#e07a2c] text-white text-[10px] font-bold uppercase">
                                {step3PreviewTemplate.style}
                              </span>
                              <div>
                                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                                  <span>{step3PreviewTemplate.name}</span>
                                  <span className="text-xs font-normal text-neutral-400">
                                    ({step3PreviewTemplate.pageCount} sayfa &bull; {step3PreviewTemplate.type})
                                  </span>
                                </h3>
                                <p className="text-xs text-neutral-400 mt-0.5 line-clamp-1">
                                  {step3PreviewTemplate.description}
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => setStep3PreviewTemplate(null)}
                              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white transition cursor-pointer"
                            >
                              <X size={18} />
                            </button>
                          </div>

                          {/* Modal Body */}
                          <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex justify-center bg-neutral-900">
                            <div className="w-full max-w-4xl">
                              <CatalogTemplateRenderer
                                catalog={{
                                  title: formData.title || step3PreviewTemplate.name,
                                  subtitle: formData.description || step3PreviewTemplate.description,
                                  template: step3PreviewTemplate.templateId,
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
                                initialPage={step3PreviewPageIdx}
                              />
                            </div>
                          </div>

                          {/* Modal Footer */}
                          <div className="px-5 py-3.5 border-t border-white/10 bg-neutral-900/90 flex flex-col sm:flex-row items-center justify-between gap-3">
                            <div className="text-xs font-mono text-neutral-400">
                              <span>Sayfalar arasında gezinebilir veya doğrudan bu şablonu seçebilirsiniz.</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setStep3PreviewTemplate(null)}
                                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-neutral-300 transition"
                              >
                                Kapat
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setFormData({ ...formData, template: step3PreviewTemplate.templateId });
                                  setStep3PreviewTemplate(null);
                                }}
                                className="px-5 py-2 rounded-xl bg-[#e07a2c] hover:bg-[#cf6d22] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition cursor-pointer"
                              >
                                <Check size={14} strokeWidth={2.5} />
                                <span>Bu Şablonu Seç ve Uygula</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 4: KURUMSAL KİMLİK */}
                {activeStep === 4 && (
                  <div className="space-y-6">
                    {/* Header Banner */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-stone-50 via-amber-50/20 to-neutral-50 border border-neutral-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-[#b4823c]/10 text-[#b4823c] font-mono text-[10px] font-bold uppercase tracking-wider">
                            ADIM 4 / 6
                          </span>
                          <span className="text-xs font-mono text-neutral-400">• Brand Kit Entegrasyonu</span>
                        </div>
                        <h3 className="text-base sm:text-lg font-extrabold text-neutral-900 mt-1 flex items-center gap-2">
                          <Palette size={18} className="text-[#b4823c]" />
                          <span>Kurumsal Kimlik & Marka Bilgileri</span>
                        </h3>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          Katalog sayfalarında ve arka kapakta yer alacak marka logonuzu, imza renginizi ve iletişim bilgilerinizi özelleştirin.
                        </p>
                      </div>
                      <div className="hidden md:flex items-center gap-2 text-xs font-bold text-neutral-600 bg-white px-3 py-2 rounded-xl border border-neutral-200 shadow-2xs">
                        <span className="w-2 h-2 rounded-full bg-[#b4823c]" />
                        <span>{brandInfo?.name || 'Aktif Marka'}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      {/* Left: Input Form (7 cols) */}
                      <div className="lg:col-span-7 space-y-4.5">
                        {/* Logo URL Input with Preview */}
                        <div className="space-y-2 bg-white p-4.5 rounded-xl border border-neutral-200/90 shadow-2xs">
                          <label className="text-xs font-extrabold text-neutral-800 flex items-center justify-between">
                            <span>Marka Logo Görseli URL</span>
                            <span className="text-[10px] text-neutral-400">Önerilen: Şeffaf PNG veya SVG</span>
                          </label>
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl border border-neutral-200 bg-neutral-50 flex items-center justify-center overflow-hidden flex-shrink-0 p-1">
                              {formData.customLogoUrl || brandInfo?.logoUrl ? (
                                <img
                                  src={formData.customLogoUrl || brandInfo?.logoUrl}
                                  alt="Logo"
                                  className="w-full h-full object-contain"
                                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                />
                              ) : (
                                <Building size={20} className="text-neutral-400" />
                              )}
                            </div>
                            <input
                              type="text"
                              value={formData.customLogoUrl}
                              onChange={(e) => setFormData({ ...formData, customLogoUrl: e.target.value })}
                              placeholder={brandInfo?.logoUrl || '/logos/marka.png'}
                              className="flex-1 px-3.5 py-2.5 bg-neutral-50 hover:bg-white border border-neutral-200 focus:border-[#b4823c] focus:bg-white rounded-xl text-xs font-medium text-neutral-900 transition-all outline-none"
                            />
                          </div>
                          <p className="text-[11px] text-neutral-400">
                            Boş bırakırsanız profilinizdeki resmi marka logosu otomatik olarak kullanılır.
                          </p>
                        </div>

                        {/* Color Presets */}
                        <div className="space-y-2.5 bg-white p-4.5 rounded-xl border border-neutral-200/90 shadow-2xs">
                          <label className="text-xs font-extrabold text-neutral-800 flex items-center justify-between">
                            <span>Kurumsal İmza Rengi & Vurgu Tonu</span>
                            <span className="font-mono text-[11px] text-[#b4823c] font-bold">{formData.primaryColor}</span>
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {COLOR_PRESETS.map((preset) => {
                              const isSelected = formData.primaryColor === preset.hex;
                              return (
                                <button
                                  key={preset.hex}
                                  type="button"
                                  onClick={() => setFormData({ ...formData, primaryColor: preset.hex })}
                                  className={`p-2.5 rounded-xl border-2 text-left transition-all flex items-center gap-2.5 cursor-pointer ${
                                    isSelected
                                      ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                                      : 'border-neutral-200/80 bg-neutral-50/50 hover:border-neutral-300 text-neutral-800'
                                  }`}
                                >
                                  <span
                                    className="w-4 h-4 rounded-full border border-white/20 flex-shrink-0 shadow-2xs"
                                    style={{ backgroundColor: preset.hex }}
                                  />
                                  <span className="text-xs font-bold truncate">{preset.name}</span>
                                </button>
                              );
                            })}
                          </div>

                          <div className="pt-2 flex items-center gap-3">
                            <span className="text-xs font-semibold text-neutral-500">Özel Hex Rengi:</span>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={formData.primaryColor || '#b4823c'}
                                onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                                className="w-8 h-8 rounded-lg border border-neutral-300 cursor-pointer bg-transparent"
                              />
                              <input
                                type="text"
                                value={formData.primaryColor || ''}
                                onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                                placeholder="#b4823c"
                                className="w-24 px-2.5 py-1 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-mono font-bold uppercase text-neutral-800"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Contact Information Cards */}
                        <div className="bg-white p-4.5 rounded-xl border border-neutral-200/90 shadow-2xs space-y-3.5">
                          <label className="text-xs font-extrabold text-neutral-800 block">
                            Arka Kapak ve İletişim Bilgileri
                          </label>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <span className="text-[11px] font-bold text-neutral-600">Web Sitesi</span>
                              <input
                                type="text"
                                value={formData.websiteUrl}
                                onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                                placeholder="www.bienseramik.com.tr"
                                className="w-full px-3 py-2 bg-neutral-50 hover:bg-white border border-neutral-200 focus:border-[#b4823c] focus:bg-white rounded-xl text-xs font-medium text-neutral-800 outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <span className="text-[11px] font-bold text-neutral-600">Telefon / Proje Hattı</span>
                              <input
                                type="text"
                                value={formData.contactPhone}
                                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                                placeholder="+90 (212) 000 00 00"
                                className="w-full px-3 py-2 bg-neutral-50 hover:bg-white border border-neutral-200 focus:border-[#b4823c] focus:bg-white rounded-xl text-xs font-medium text-neutral-800 outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <span className="text-[11px] font-bold text-neutral-600">Kurumsal E-Posta</span>
                              <input
                                type="email"
                                value={formData.contactEmail}
                                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                                placeholder="mimari@bienseramik.com.tr"
                                className="w-full px-3 py-2 bg-neutral-50 hover:bg-white border border-neutral-200 focus:border-[#b4823c] focus:bg-white rounded-xl text-xs font-medium text-neutral-800 outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <span className="text-[11px] font-bold text-neutral-600">Fabrika / Genel Müdürlük</span>
                              <input
                                type="text"
                                value={formData.contactAddress}
                                onChange={(e) => setFormData({ ...formData, contactAddress: e.target.value })}
                                placeholder="Bilecik OSB, 4. Cadde No:12, Türkiye"
                                className="w-full px-3 py-2 bg-neutral-50 hover:bg-white border border-neutral-200 focus:border-[#b4823c] focus:bg-white rounded-xl text-xs font-medium text-neutral-800 outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Modern Brand Kit Stationery Mockup (5 cols) */}
                      <div className="lg:col-span-5 sticky top-6 space-y-3">
                        <div className="flex items-center justify-between text-xs font-bold text-neutral-600 px-1">
                          <span className="flex items-center gap-1.5">
                            <Sparkles size={13} className="text-[#b4823c]" />
                            <span>Marka Kimliği Canlı Önizleme</span>
                          </span>
                          <span className="font-mono text-[10px] text-neutral-400">ARKA KAPAK STANDARDI</span>
                        </div>

                        {/* Interactive Stationery Card */}
                        <div className="bg-neutral-900 rounded-2xl p-5 border border-neutral-800 shadow-xl overflow-hidden text-white flex flex-col justify-between h-[360px] relative">
                          <div className="flex items-center justify-between border-b border-white/10 pb-3">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3.5 h-3.5 rounded-full shadow-sm"
                                style={{ backgroundColor: formData.primaryColor || '#b4823c' }}
                              />
                              <span className="font-mono text-[11px] font-extrabold uppercase tracking-widest text-neutral-200">
                                {brandInfo?.name || 'SERAMİKBAK'}
                              </span>
                            </div>
                            <span className="text-[9px] font-mono text-neutral-400">LOOKBOOK BACK COVER</span>
                          </div>

                          <div className="my-auto space-y-3 text-center px-4">
                            <div className="w-14 h-14 mx-auto rounded-2xl bg-white/10 p-2 flex items-center justify-center border border-white/10">
                              <Building size={24} style={{ color: formData.primaryColor || '#b4823c' }} />
                            </div>
                            <h5 className="text-base font-extrabold text-white tracking-wide uppercase">
                              {brandInfo?.name || 'SERAMİK FABRİKASI'}
                            </h5>
                            <p className="text-[11px] text-neutral-300 max-w-xs mx-auto leading-relaxed">
                              {formData.contactAddress || 'Organize Sanayi Bölgesi, Türkiye'}
                            </p>
                          </div>

                          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-neutral-400 font-mono">
                            <span>{formData.websiteUrl || 'www.seramikbak.com'}</span>
                            <span style={{ color: formData.primaryColor || '#b4823c' }} className="font-bold">
                              {formData.contactPhone || '+90 (212) 000 00 00'}
                            </span>
                          </div>
                        </div>

                        <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-[11px] text-neutral-500 flex items-center gap-2">
                          <CheckCircle2 size={14} className="text-emerald-600 flex-shrink-0" />
                          <span>Seçtiğiniz kurumsal renk sayfa şeritlerinde, rozetlerde ve teknik tablolarda otomatik uygulanır.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 5: GÖRÜNÜRLÜK, ALAN & GRAFİK MÜDAHALE STÜDYOSU */}
                {activeStep === 5 && (
                  <CatalogVisibilityGraphicEditor
                    formData={formData}
                    setFormData={setFormData}
                    availableProducts={availableProducts}
                    brandInfo={brandInfo}
                    onOpenCanvasStudio={() => setStudioMode('advanced')}
                  />
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
                          onClick={() => setActiveStep(5)}
                          className="px-3.5 py-2 rounded-xl border border-[#b4823c] bg-amber-50 hover:bg-amber-100 text-xs font-bold text-[#b4823c] flex items-center gap-1.5 cursor-pointer"
                        >
                          <Sliders size={14} />
                          <span>Alanları & Verileri Düzenle</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => window.print()}
                          className="px-4 py-2 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 text-xs font-bold text-neutral-800 flex items-center gap-1.5 cursor-pointer"
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
                          const ov = item.overrides || {};
                          return {
                            ...found,
                            ...(ov.name ? { name: ov.name } : {}),
                            ...(ov.sku ? { sku: ov.sku } : {}),
                            ...(ov.width ? { width: Number(ov.width) || ov.width } : {}),
                            ...(ov.height ? { height: Number(ov.height) || ov.height } : {}),
                            ...(ov.thickness ? { thickness: ov.thickness } : {}),
                            ...(ov.finish ? { finish: ov.finish } : {}),
                            ...(ov.color ? { color: ov.color } : {}),
                            ...(ov.slipResistance ? { slipResistance: ov.slipResistance } : {}),
                            ...(ov.peiRating ? { peiRating: ov.peiRating } : {}),
                            ...(ov.description ? { description: ov.description } : {}),
                            ...(ov.imageUrl ? { imageUrl: ov.imageUrl } : {}),
                            ...(ov.badge ? { badge: ov.badge } : {}),
                            ...(ov.price ? { customPrice: ov.price } : {}),
                            catalogItemIndex: idx + 1,
                            customNote: ov.description || item.customNote,
                            customUsageArea: ov.usageArea || item.usageArea,
                            productUrl: ov.customUrl || `https://www.seramikbak.com/urun/${found.slug}`,
                            overrides: ov
                          };
                        })
                        .filter(Boolean)}
                      mode="preview"
                    />
                  </div>
                )}

                {/* Bottom Step Navigation Bar - Compact CRM buttons */}
                <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    disabled={activeStep === 1}
                    onClick={() => setActiveStep((prev) => Math.max(1, prev - 1))}
                    className="px-3.5 py-2 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 disabled:opacity-40 text-xs font-semibold text-neutral-600 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <ArrowLeft size={13} />
                    <span>Önceki Adım</span>
                  </button>

                  {activeStep < 6 ? (
                    <button
                      type="button"
                      onClick={() => setActiveStep((prev) => Math.min(6, prev + 1))}
                      className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                    >
                      <span>Sonraki Adım</span>
                      <ArrowRight size={13} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSaveCatalog(true)}
                      disabled={saving}
                      className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                    >
                      <CheckCircle2 size={14} />
                      <span>Kaydet ve Yayınla</span>
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

            <div className="flex flex-wrap items-center gap-2">
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
              <button
                type="button"
                onClick={(e) => handleDelete(previewCatalog, e)}
                className="px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Trash2 size={13} />
                <span>Kataloğu Sil</span>
              </button>
            </div>
          </div>

          <CatalogTemplateRenderer catalog={previewCatalog} products={previewProducts} mode="preview" />
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DELETE CONFIRMATION (KATALOG SİLME ONAYI)                          */}
      {/* ========================================================================= */}
      {deleteConfirmCatalog && (
        <div className="fixed inset-0 z-50 bg-neutral-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative bg-white rounded-3xl border border-neutral-100 max-w-sm sm:max-w-md w-full p-6 sm:p-7 shadow-2xl text-center space-y-5">
            <button
              type="button"
              onClick={() => setDeleteConfirmCatalog(null)}
              disabled={Boolean(deletingId)}
              className="absolute top-4 right-4 p-2 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition cursor-pointer"
              title="Kapat"
            >
              <X size={18} />
            </button>

            <div className="mx-auto w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100/80 flex items-center justify-center text-rose-600 shadow-xs">
              <Trash2 size={24} strokeWidth={2} />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-neutral-900 tracking-tight">Kataloğu Sil</h3>
              <p className="text-sm text-neutral-500 leading-relaxed max-w-xs mx-auto">
                <span className="font-semibold text-neutral-800 break-words">"{deleteConfirmCatalog.title}"</span> adlı katalog kalıcı olarak silinecektir. Bu işlem geri alınamaz.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmCatalog(null)}
                disabled={Boolean(deletingId)}
                className="w-full py-2.5 px-4 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 active:scale-[0.98] text-sm font-semibold text-neutral-700 transition cursor-pointer disabled:opacity-50"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={() => executeDeleteCatalog(deleteConfirmCatalog)}
                disabled={Boolean(deletingId)}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-sm shadow-rose-600/20 transition cursor-pointer disabled:opacity-50"
              >
                {deletingId ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Siliniyor...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={15} />
                    <span>Sil</span>
                  </>
                )}
              </button>
            </div>
          </div>
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
      {qrStickerModalData && (
        <ShowroomQrStickerModal
          isOpen={Boolean(qrStickerModalData)}
          onClose={() => setQrStickerModalData(null)}
          catalog={qrStickerModalData.catalog}
          products={qrStickerModalData.products}
          brandName={brandInfo?.name || 'SeramikBak'}
          brandLogo={brandInfo?.logoUrl || null}
        />
      )}

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
