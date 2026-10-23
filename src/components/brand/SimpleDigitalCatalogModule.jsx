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
  RefreshCw,
  HelpCircle,
  LayoutGrid,
  List,
  ShieldCheck,
  Image as ImageIcon,
  PhoneCall,
  MapPin,
  EyeOff
} from 'lucide-react';
import HtmlLookbookViewer from './catalog/templates/HtmlLookbookViewer';
import { LOOKBOOK_COLOR_TEMPLATES, getLookbookTheme } from './catalog/templates/lookbookThemes';

export const DEFAULT_SECTION_SETTINGS = {
  // 1. Kapak & Rozet
  coverImageUrl: '',
  heroBadgeText: 'MALZEMENİN DİLİ',
  heroStampText: 'Doğadan ilham.\nMimariyle hayat bulur.',
  heroYear: new Date().getFullYear().toString(),
  
  // 2. Kürasyon & Monograf
  showMonograph: true,
  monographQuote: 'Yüzey yalnızca bir kaplama değil; mekânın ışığını, akustik dengesini ve dokusal hafızasını belirleyen temel mimari dildir.',
  monographAuthor: '',
  spec1Label: 'EN 14411 BLa',
  spec1Desc: 'Tam Gövde Porselen',
  spec2Label: 'E ≤ %0.05',
  spec2Desc: 'Sıfıra Yakın Geçirgenlik',
  spec3Label: 'Lazer Rektifiye',
  spec3Desc: '1 mm Monokalibre Derz',
  spec4Label: '4K PBR Master',
  spec4Desc: 'Ultra HD Mikrotekstür',

  // 3. Mekânlar & Editoryal Yaşam Alanları
  showEditorial: true,
  editorialImageUrl: '',
  editorialCaption: '',
  editorialBadge: 'Mekânda Hayat Bulan Yüzeyler',
  editorialTitle: 'Bir Yüzeyden\nDaha Fazlası.',
  editorialText: 'Doğru seramik ve porselen, mekânın ışığını, akustik dengesini ve mimari derinliğini belirler. Seçkin serileri yalnızca ürün olarak değil, mekânınızın bir parçası olarak keşfedin.',
  feature1Title: '01   Banyo ve Spa',
  feature1Desc: 'Doğal Taş Dinginliği ↗',
  feature2Title: '02   Yaşam Alanları & Salon',
  feature2Desc: 'Geniş Ebat Monolitik Slab ↗',
  feature3Title: '03   Mutfak ve Ticari Zeminler',
  feature3Desc: 'Yüksek Trafik Dayanımı (PEI V) ↗',

  // 4. Teknik Şartname & BIM/PDF
  showTechnical: true,
  technicalBadge: 'Mimari Şartname & Kalite Güvencesi',
  technicalTitle: 'Mükemmel Estetik, Sarsılmaz Standartlar',
  technicalSubtitle: 'Avrupa Birliği EN 14411 standardına tam uyumlu teknik değerler.',
  tech1Title: '01 // SU EMME DEĞERİ (E ≤ %0.05)',
  tech1Heading: 'Sıfıra Yakın Su Emme',
  tech1Desc: 'Donmaya, lekelenmeye ve kimyasallara karşı maksimum direnç sunan yüksek yoğunluklu porselen gövde.',
  tech2Title: '02 // R10 / R11 KAYMA DİRENCİ',
  tech2Heading: 'Islak Hacim Güvenliği',
  tech2Desc: 'Banyo, havuz kenarı ve lüks otel girişleri için mikrotekstür teknolojisiyle güvenli adımlar.',
  tech3Title: '03 // REKTİFİYE MİLİMETRİK KESİM',
  tech3Heading: 'Derzsiz Süreklilik',
  tech3Desc: 'Lazer kontrollü rektifiye kenarlar sayesinde 1 mm minimum derz aralığıyla kesintisiz yüzey akışı.',
  bimCadUrl: '',
  ceLeedUrl: '',
  epdUrl: '',

  // 5. İletişim & Teklif (CTA)
  showCta: true,
  ctaTitle: 'Projeniz için doğru yüzeyi bulun.',
  ctaSubtitle: 'Karoları keşfedin, seçeneklerinizi belirleyin ve teklif sürecini başlatın.',
  ctaButtonText: 'Koleksiyonu Keşfet ↗',
  contactPhone: '',
  contactEmail: '',
  contactAddress: '',
  websiteUrl: ''
};

// 6 Lüks & Farklı Renklerde HTML Lookbook Şablonu
export const HTML_CATALOG_TEMPLATES = LOOKBOOK_COLOR_TEMPLATES.map((t) => ({
  id: t.id,
  name: t.name,
  badge: t.badge,
  tag: t.tag,
  style: t.style,
  idealFor: t.idealFor,
  brandInspiration: t.brandInspiration,
  folioNumber: t.folioNumber,
  description: t.description,
  previewImg: t.previewImg,
  colorSample: t.colorSample,
  palette: {
    primary: t.colorSample.primary,
    accent: t.colorSample.secondary,
    bg: t.colorSample.background
  }
}));

export default function SimpleDigitalCatalogModule({ brandInfo, externalSubSection }) {
  const brandId = brandInfo?.id;
  const brandName = brandInfo?.name || 'Bien Seramik';

  // View state: 'list' | 'editor' | 'inquiries'
  const [currentView, setCurrentView] = useState('list');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [showGuideModal, setShowGuideModal] = useState(false);

  // Catalogs & loading
  const [catalogs, setCatalogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [catalogFilter, setCatalogFilter] = useState('all'); // 'all' | 'published' | 'draft'

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
    template: 'terra-traverten',
    primaryColor: '#a87943',
    selectedProductIds: [],
    isPublished: true,
    publicSlug: '',
    contactPhone: '',
    contactEmail: '',
    contactAddress: '',
    websiteUrl: '',
    sectionSettings: { ...DEFAULT_SECTION_SETTINGS }
  });

  const [activeContentTab, setActiveContentTab] = useState('products'); // 'products' | 'cover' | 'monograph' | 'editorial' | 'technical' | 'cta'

  const updateSectionSetting = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      sectionSettings: {
        ...(prev.sectionSettings || DEFAULT_SECTION_SETTINGS),
        [key]: value
      }
    }));
  };

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
    } else if (externalSubSection === 'published') {
      setCurrentView('list');
      setCatalogFilter('published');
    } else if (externalSubSection === 'drafts') {
      setCurrentView('list');
      setCatalogFilter('draft');
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

  // Start creating new catalog
  const handleStartNew = () => {
    setActiveCatalogId(null);
    setFormData({
      title: `${brandName} ${new Date().getFullYear()} Mimari Koleksiyonu`,
      coverSubtitle: 'Yüksek Performanslı Porselen & Seramik Seçkisi',
      introText: `${brandName} markasının doğal taş, mermer ve çağdaş mimarinin yalın çizgilerini buluşturan lüks mimari yüzey seçkisi.`,
      template: 'terra-traverten',
      primaryColor: '#a87943',
      selectedProductIds: brandProducts.slice(0, 12).map((p) => p.id),
      isPublished: true,
      publicSlug: '',
      contactPhone: brandInfo?.phone || '',
      contactEmail: brandInfo?.email || '',
      contactAddress: brandInfo?.address || '',
      websiteUrl: brandInfo?.website || '',
      sectionSettings: {
        ...DEFAULT_SECTION_SETTINGS,
        monographAuthor: `— ${brandName} Tasarım & Malzeme İnovasyon Laboratuvarı`
      }
    });
    setEditorStep(1);
    setActiveContentTab('products');
    setCurrentView('editor');
  };

  // Edit existing catalog
  const handleEditCatalog = (cat) => {
    setActiveCatalogId(cat.id);
    let productIds = [];
    try {
      const parsed = typeof cat.productItems === 'string' ? JSON.parse(cat.productItems) : cat.productItems;
      productIds = Array.isArray(parsed) ? parsed.map((item) => item.productId).filter(Boolean) : [];
    } catch (_) {}

    setFormData({
      title: cat.title || '',
      coverSubtitle: cat.coverSubtitle || '',
      introText: cat.introText || '',
      template: cat.template || 'terra-traverten',
      primaryColor: cat.primaryColor || '#a87943',
      selectedProductIds: productIds,
      isPublished: Boolean(cat.isPublished),
      publicSlug: cat.publicSlug || '',
      contactPhone: cat.contactPhone || '',
      contactEmail: cat.contactEmail || '',
      contactAddress: cat.contactAddress || '',
      websiteUrl: cat.websiteUrl || '',
      sectionSettings: {
        ...DEFAULT_SECTION_SETTINGS,
        monographAuthor: `— ${brandName} Tasarım & Malzeme İnovasyon Laboratuvarı`,
        ...(cat.sectionSettings || {})
      }
    });
    setEditorStep(1);
    setActiveContentTab('products');
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
          theme: formData.template === 'obsidian-gold' ? 'luxury' : 'architectural'
        })
      });
      const data = await res.json();
      if (res.ok && data.success && (data.preset || data.data)) {
        const ai = data.preset || data.data;
        const bName = brandInfo?.name || 'Marka';
        setFormData((prev) => ({
          ...prev,
          title: ai.title || prev.title,
          coverSubtitle: ai.coverSubtitle || prev.coverSubtitle,
          introText: ai.introText || prev.introText,
          primaryColor: ai.primaryColor || prev.primaryColor,
          sectionSettings: {
            ...(prev.sectionSettings || DEFAULT_SECTION_SETTINGS),
            heroBadgeText: `${bName.toUpperCase()} ARCHITECTURAL ED.`,
            heroStampText: `${bName} Mimari Seçkisi`,
            monographQuote: `${bName} yüzey koleksiyonları; mekanın ışığına, mimari akustiğine ve zamansız dokusuna değer katan porselen inovasyonu ile üretilir.`,
            monographAuthor: `— ${bName} Tasarım & Malzeme İnovasyon Laboratuvarı`,
            editorialTitle: `${bName} ile Mekânda Hayat Bulan Yüzeyler`,
            editorialText: `Geniş ebatlı porselen plakalar ve özel dokusal bitişler ile ${bName}, projelerinizde estetik süreklilik ve yüksek mukavemet sağlar.`,
            ctaTitle: `${bName} ile Projenize Değer Katın`,
            ctaSubtitle: `Mimari numune talepleri, toptan proje teklifleri ve teknik şartname desteği için mimari ekibimize ulaşın.`
          }
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
        contactPhone: formData.contactPhone || null,
        contactEmail: formData.contactEmail || null,
        contactAddress: formData.contactAddress || null,
        websiteUrl: formData.websiteUrl || null,
        sectionSettings: formData.sectionSettings,
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
  const filteredBrandProducts = useMemo(() => {
    if (!productSearch.trim()) return brandProducts;
    const q = productSearch.toLowerCase();
    return brandProducts.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.code?.toLowerCase().includes(q) ||
        p.finish?.toLowerCase().includes(q)
    );
  }, [brandProducts, productSearch]);

  // Selected products objects for preview
  const previewProducts = useMemo(() => {
    return formData.selectedProductIds
      .map((id) => brandProducts.find((p) => p.id === id))
      .filter(Boolean);
  }, [formData.selectedProductIds, brandProducts]);

  // Filtered catalogs for list view
  const filteredCatalogs = useMemo(() => {
    let list = catalogs;
    if (searchQuery.trim()) {
      const q = searchQuery.toLocaleLowerCase('tr').trim();
      list = list.filter((c) => {
        const title = (c.title || '').toLocaleLowerCase('tr');
        const desc = (c.description || c.introText || '').toLocaleLowerCase('tr');
        const tmpl = (c.template || '').toLocaleLowerCase('tr');
        return title.includes(q) || desc.includes(q) || tmpl.includes(q);
      });
    }
    if (catalogFilter === 'published') {
      list = list.filter((c) => c.isPublished);
    } else if (catalogFilter === 'draft') {
      list = list.filter((c) => !c.isPublished);
    }
    return list;
  }, [catalogs, searchQuery, catalogFilter]);

  // KPI calculations
  const totalViews = catalogs.reduce((acc, c) => acc + (c.viewCount || 0), 0);
  const publishedCount = catalogs.filter((c) => c.isPublished).length;
  const year = new Date().getFullYear();

  return (
    <div className="studio-root w-full min-h-screen">
      {/* =========================================================================
          EXACT CSS STYLES EMBEDDED FROM USER'S ATTACHED DESIGN FILE
      ========================================================================= */}
      <style jsx global>{`
        .studio-root {
          --ink: #202522;
          --muted: #747c77;
          --line: #e7eae6;
          --paper: #ffffff;
          --canvas: #f5f6f3;
          --accent: #b47b3d;
          --accent-dark: #8f5c29;
          --green: #167653;
          --green-bg: #e9f6ef;
          --orange-bg: #fff4e8;
          --shadow: 0 8px 28px rgba(25, 35, 29, .055);
          --radius: 18px;
          background-color: var(--canvas);
          color: var(--ink);
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, sans-serif;
          padding: 24px clamp(14px, 3.5vw, 48px) 100px;
        }

        .studio-eyebrow {
          display: flex;
          align-items: center;
          gap: 9px;
          text-transform: uppercase;
          letter-spacing: 1.7px;
          font-size: 10px;
          font-weight: 800;
          color: var(--accent-dark);
          margin-bottom: 12px;
        }
        .studio-eyebrow:before {
          content: "";
          width: 7px;
          height: 7px;
          background: #c18b4b;
          border-radius: 50%;
          box-shadow: 0 0 0 4px #c18b4b1b;
        }

        .studio-hero {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 28px;
        }
        .studio-hero h1 {
          font-size: clamp(26px, 2.9vw, 36px);
          line-height: 1.15;
          letter-spacing: -1.3px;
          margin: 0 0 8px;
          font-weight: 780;
          color: var(--ink);
        }
        .studio-hero .subtitle {
          font-size: 13.5px;
          line-height: 1.6;
          color: var(--muted);
          margin: 0;
          max-width: 650px;
        }
        .hero-actions {
          display: flex;
          gap: 9px;
          flex-wrap: wrap;
        }

        .btn {
          border: 1px solid transparent;
          border-radius: 11px;
          padding: 10px 16px;
          font-size: 13px;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all .18s ease;
          cursor: pointer;
          text-decoration: none;
        }
        .btn-primary {
          background: var(--ink);
          color: white;
          box-shadow: 0 4px 12px #20252220;
        }
        .btn-primary:hover {
          background: #343c36;
          transform: translateY(-1px);
        }
        .btn-outline {
          border-color: var(--line);
          background: white;
          color: var(--ink);
        }
        .btn-outline:hover {
          border-color: #c9cec8;
          background: #fbfcfa;
        }
        .btn-accent {
          background: linear-gradient(145deg, #d6a15e, #98612e);
          color: white;
          box-shadow: 0 4px 12px #b47b3d44;
        }
        .btn-accent:hover {
          filter: brightness(1.05);
          transform: translateY(-1px);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
          margin-bottom: 34px;
        }
        .stat-card {
          background: var(--paper);
          border: 1px solid var(--line);
          border-radius: 15px;
          padding: 19px 20px;
          display: flex;
          align-items: center;
          gap: 15px;
          min-width: 0;
          box-shadow: 0 2px 5px #20252204;
        }
        .stat-icon {
          width: 42px;
          height: 42px;
          border-radius: 13px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
        }
        .stat-icon.gold { background: #f8efe3; color: #9a672e; }
        .stat-icon.green { background: #e7f5ee; color: #167653; }
        .stat-icon.blue { background: #eaf1f8; color: #3e6c96; }
        .stat-icon.orange { background: #fff0e5; color: #b55e20; }
        .stat-label {
          font-size: 11px;
          letter-spacing: .5px;
          text-transform: uppercase;
          color: var(--muted);
          font-weight: 750;
          margin-bottom: 7px;
        }
        .stat-value {
          font-size: 27px;
          font-weight: 780;
          letter-spacing: -1px;
          line-height: 1;
          color: var(--ink);
        }
        .stat-note {
          font-size: 11px;
          color: #89908b;
          margin-top: 6px;
        }

        .section-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          margin-bottom: 18px;
        }
        .section-title {
          font-size: 18px;
          letter-spacing: -.45px;
          font-weight: 760;
          margin: 0;
          color: var(--ink);
        }
        .section-subtitle {
          font-size: 12px;
          color: var(--muted);
          margin: 5px 0 0;
        }
        .section-tools {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .search-box {
          position: relative;
        }
        .search-box input {
          width: 220px;
          max-width: 100%;
          border: 1px solid var(--line);
          background: white;
          border-radius: 10px;
          padding: 10px 12px 10px 35px;
          outline: none;
          font-size: 12px;
          color: var(--ink);
          transition: border-color .18s;
        }
        .search-box input:focus {
          border-color: #c4a078;
          box-shadow: 0 0 0 3px #b47b3d16;
        }
        .view-toggle {
          display: flex;
          border: 1px solid var(--line);
          padding: 3px;
          border-radius: 10px;
          background: white;
        }
        .view-toggle button {
          width: 31px;
          height: 29px;
          border: 0;
          border-radius: 7px;
          background: transparent;
          color: #858d87;
          display: grid;
          place-items: center;
          cursor: pointer;
          transition: all .15s;
        }
        .view-toggle button.active {
          background: #f0eee9;
          color: var(--ink);
        }

        .catalog-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 19px;
        }
        .catalog-card {
          background: white;
          border: 1px solid var(--line);
          border-radius: 17px;
          overflow: hidden;
          min-width: 0;
          box-shadow: var(--shadow);
          transition: transform .2s ease, box-shadow .2s ease;
          display: flex;
          flex-direction: column;
        }
        .catalog-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 38px #20252210;
        }
        .cover {
          height: 235px;
          position: relative;
          overflow: hidden;
          background: #d7d0c6;
        }
        .cover img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform .55s ease;
        }
        .catalog-card:hover .cover img {
          transform: scale(1.035);
        }
        .cover:after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(18,22,19,.34) 0%, transparent 34%, rgba(18,22,19,.76) 100%);
        }
        .cover-top {
          position: absolute;
          z-index: 2;
          top: 15px;
          left: 15px;
          right: 15px;
          display: flex;
          justify-content: space-between;
          gap: 8px;
          align-items: center;
        }
        .collection-tag {
          background: #202522b8;
          color: white;
          backdrop-filter: blur(8px);
          border: 1px solid #ffffff30;
          padding: 6px 9px;
          border-radius: 7px;
          font-size: 10px;
          font-weight: 750;
          letter-spacing: .25px;
          text-transform: uppercase;
        }
        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #e4f8ec;
          color: #176b49;
          border-radius: 20px;
          padding: 6px 9px;
          font-size: 10px;
          font-weight: 800;
          white-space: nowrap;
        }
        .status-pill:before {
          content: "";
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #2ca56c;
        }
        .status-pill.draft {
          background: #fff4e8;
          color: #9a531f;
        }
        .status-pill.draft:before {
          background: #d67a38;
        }
        .cover-content {
          position: absolute;
          z-index: 2;
          bottom: 17px;
          left: 18px;
          right: 18px;
          color: white;
        }
        .cover-content h3 {
          font-size: 20px;
          letter-spacing: -.65px;
          line-height: 1.2;
          margin: 0 0 9px;
          font-weight: 760;
          text-shadow: 0 2px 8px rgba(0,0,0,0.4);
        }
        .cover-meta {
          display: flex;
          align-items: center;
          gap: 9px;
          color: #f3f3ef;
          font-size: 11px;
        }
        .cover-meta span {
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .cover-meta .dot {
          width: 3px;
          height: 3px;
          background: #ffffff9c;
          border-radius: 50%;
        }
        .card-body {
          padding: 15px 17px 16px;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .card-label {
          font-size: 10px;
          letter-spacing: 1.2px;
          text-transform: uppercase;
          color: #8b928d;
          font-weight: 800;
          margin-bottom: 8px;
        }
        .card-description {
          font-size: 12px;
          line-height: 1.55;
          color: #6f7771;
          margin: 0 0 15px;
          min-height: 38px;
        }
        .card-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          border-top: 1px solid var(--line);
          padding-top: 12px;
        }
        .updated {
          font-size: 10px;
          color: #929993;
        }
        .card-actions {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .icon-btn {
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          border: 1px solid var(--line);
          border-radius: 9px;
          background: white;
          color: #5c655e;
          cursor: pointer;
          transition: all .15s;
        }
        .icon-btn:hover {
          background: #f6f5f1;
          border-color: #d6d2c9;
          color: var(--ink);
        }
        .btn-small {
          padding: 8px 12px;
          border-radius: 9px;
          font-size: 11px;
        }

        .catalog-grid.list {
          grid-template-columns: 1fr;
        }
        .catalog-grid.list .catalog-card {
          display: grid;
          grid-template-columns: minmax(260px, 32%) 1fr;
        }
        .catalog-grid.list .cover {
          height: 100%;
          min-height: 220px;
        }
        .catalog-grid.list .card-body {
          padding: 22px 24px;
        }
        .catalog-grid.list .card-description {
          min-height: 0;
          max-width: 600px;
        }

        .empty-state {
          padding: 45px 20px;
          text-align: center;
          background: #fff;
          border: 1px dashed #d8ddd7;
          border-radius: 15px;
          color: var(--muted);
        }
        .empty-state strong {
          display: block;
          color: var(--ink);
          margin-bottom: 5px;
        }

        .footer-note {
          margin-top: 36px;
          border-top: 1px solid var(--line);
          padding-top: 18px;
          display: flex;
          justify-content: space-between;
          gap: 12px;
          color: #929993;
          font-size: 11px;
        }

        @media(max-width:1000px) {
          .stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .catalog-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .studio-hero { align-items: flex-start; flex-direction: column; }
          .hero-actions { width: 100%; }
        }
        @media(max-width:680px) {
          .studio-hero h1 { font-size: 28px; }
          .stats-grid { gap: 9px; margin-bottom: 25px; }
          .stat-card { padding: 13px 12px; gap: 10px; border-radius: 13px; }
          .stat-icon { width: 35px; height: 35px; border-radius: 10px; }
          .stat-value { font-size: 23px; }
          .section-head { align-items: flex-start; flex-direction: column; }
          .section-tools { width: 100%; }
          .search-box { flex: 1; }
          .search-box input { width: 100%; }
          .catalog-grid { grid-template-columns: 1fr; gap: 14px; }
          .catalog-grid.list .catalog-card { display: block; }
          .catalog-grid.list .cover { height: 225px; min-height: 0; }
          .catalog-grid.list .card-body { padding: 15px 17px 16px; }
          .footer-note { flex-direction: column; }
        }
      `}</style>

      {/* =========================================================================
          VIEW 1: CATALOGS LIST (TÜM KATALOGLAR)
      ========================================================================= */}
      {currentView === 'list' && (
        <div>
          {/* Eyebrow & Hero Header */}
          <section className="studio-hero">
            <div>
              <div className="studio-eyebrow">
                {brandName} &bull; DİJİTAL YAYIN PLATFORMU
              </div>
              <h1>
                Dijital Katalog <span style={{ color: '#9b6a36' }}>&</span> Lookbook Studio
              </h1>
              <p className="subtitle">
                Koleksiyonlarınızı güçlü görsellerle anlatın. Markanıza özel, mobil uyumlu ve etkileşimli dijital yayınlar oluşturun.
              </p>
            </div>

            <div className="hero-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowGuideModal(true)}
              >
                <HelpCircle size={15} />
                <span>Studio rehberi</span>
              </button>

              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setCurrentView('inquiries')}
              >
                <Tag size={15} style={{ color: 'var(--accent)' }} />
                <span>B2B Talepleri ({inquiries.length})</span>
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleStartNew}
              >
                <Plus size={16} />
                <span>Yeni katalog oluştur</span>
              </button>
            </div>
          </section>

          {/* KPI Stats Cards */}
          <section className="stats-grid" aria-label="Katalog istatistikleri">
            <article className="stat-card">
              <div className="stat-icon gold">
                <BookOpen size={19} />
              </div>
              <div>
                <div className="stat-label">Toplam katalog</div>
                <div className="stat-value">{catalogs.length}</div>
                <div className="stat-note">Oluşturduğunuz tüm yayınlar</div>
              </div>
            </article>

            <article className="stat-card">
              <div className="stat-icon green">
                <CheckCircle2 size={19} />
              </div>
              <div>
                <div className="stat-label">Yayındaki kataloglar</div>
                <div className="stat-value">{publishedCount}</div>
                <div className="stat-note">Ziyaretçilere açık yayınlar</div>
              </div>
            </article>

            <article className="stat-card">
              <div className="stat-icon blue">
                <Eye size={19} />
              </div>
              <div>
                <div className="stat-label">Toplam ziyaret</div>
                <div className="stat-value">{totalViews}</div>
                <div className="stat-note">Katalog görüntülenmeleri</div>
              </div>
            </article>

            <article className="stat-card">
              <div className="stat-icon orange">
                <Tag size={19} />
              </div>
              <div>
                <div className="stat-label">Gelen B2B talepleri</div>
                <div className="stat-value">{inquiries.length}</div>
                <div className="stat-note">Teklif ve numune talepleri</div>
              </div>
            </article>
          </section>

          {/* Section Head & Filter Tools */}
          <div className="section-head">
            <div>
              <h2 className="section-title">Kataloglarım</h2>
              <p className="section-subtitle">Yayınlarınızı yönetin, düzenleyin ve paylaşın.</p>
            </div>

            <div className="section-tools">
              {/* Quick Status Filter Tabs */}
              <div className="view-toggle hidden sm:flex">
                <button
                  type="button"
                  onClick={() => setCatalogFilter('all')}
                  className={catalogFilter === 'all' ? 'active' : ''}
                  style={{ width: 'auto', padding: '0 10px', fontSize: '11px', fontWeight: 700 }}
                >
                  Tümü
                </button>
                <button
                  type="button"
                  onClick={() => setCatalogFilter('published')}
                  className={catalogFilter === 'published' ? 'active' : ''}
                  style={{ width: 'auto', padding: '0 10px', fontSize: '11px', fontWeight: 700 }}
                >
                  Yayında
                </button>
                <button
                  type="button"
                  onClick={() => setCatalogFilter('draft')}
                  className={catalogFilter === 'draft' ? 'active' : ''}
                  style={{ width: 'auto', padding: '0 10px', fontSize: '11px', fontWeight: 700 }}
                >
                  Taslak
                </button>
              </div>

              {/* Search Box */}
              <div className="search-box">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="search"
                  placeholder="Kataloglarda ara…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Kataloglarda ara"
                />
              </div>

              {/* View Toggle: Grid vs List */}
              <div className="view-toggle">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={viewMode === 'grid' ? 'active' : ''}
                  title="Kart görünümü"
                  aria-label="Kart görünümü"
                >
                  <LayoutGrid size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={viewMode === 'list' ? 'active' : ''}
                  title="Liste görünümü"
                  aria-label="Liste görünümü"
                >
                  <List size={15} />
                </button>
              </div>
            </div>
          </div>

          {/* Catalog Cards Grid / List */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-stone-400 space-y-2 bg-white rounded-2xl border border-stone-200">
              <Loader2 size={24} className="animate-spin text-[#b47b3d]" />
              <p className="text-xs font-medium">Kataloglar yükleniyor...</p>
            </div>
          ) : filteredCatalogs.length === 0 ? (
            <div className="empty-state">
              <strong>Katalog bulunamadı</strong>
              <p className="text-xs mt-1">
                {searchQuery
                  ? 'Farklı bir arama terimi deneyin.'
                  : 'Henüz bu filtrede bir dijital katalog bulunmuyor.'}
              </p>
              {!searchQuery && (
                <button
                  type="button"
                  onClick={handleStartNew}
                  className="btn btn-primary mt-4"
                >
                  <Plus size={14} />
                  <span>İlk Kataloğunuzu Oluşturun</span>
                </button>
              )}
            </div>
          ) : (
            <div className={`catalog-grid ${viewMode === 'list' ? 'list' : ''}`}>
              {filteredCatalogs.map((cat) => {
                const templateObj =
                  HTML_CATALOG_TEMPLATES.find((t) => t.id === cat.template) || HTML_CATALOG_TEMPLATES[0];
                const coverImage =
                  cat.customCoverUrl ||
                  cat.coverImageUrl ||
                  templateObj.previewImg ||
                  '/renders/luxury_bathroom_calacatta_gold.jpg';
                const publicUrl = `/katalog/${cat.publicSlug}`;
                const updatedDate = cat.updatedAt
                  ? new Date(cat.updatedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
                  : 'Bugün';

                return (
                  <article key={cat.id} className="catalog-card">
                    {/* Cover Visual Area */}
                    <div className="cover">
                      <img src={coverImage} alt={cat.title} />
                      <div className="cover-top">
                        <span className="collection-tag">
                          {templateObj.name}
                        </span>
                        <span className={`status-pill ${cat.isPublished ? '' : 'draft'}`}>
                          {cat.isPublished ? 'Yayında' : 'Taslak'}
                        </span>
                      </div>

                      <div className="cover-content">
                        <h3>{cat.title}</h3>
                        <div className="cover-meta">
                          <span>
                            <BookOpen size={13} />
                            {cat.itemCount || 0} karo seçili
                          </span>
                          <span className="dot"></span>
                          <span>
                            <Eye size={13} />
                            {cat.viewCount || 0} görüntülenme
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="card-body">
                      <div>
                        <div className="card-label">
                          Dijital Lookbook &bull; {year}
                        </div>
                        <p className="card-description">
                          {cat.introText ||
                            cat.description ||
                            'Mimari projeler için hazırlanan koleksiyon seçkisi. Ürünlerinizi görüntüleyin ve yayınınızı yönetin.'}
                        </p>
                      </div>

                      <div className="card-bottom">
                        <span className="updated">
                          Son güncelleme &bull; {updatedDate}
                        </span>

                        <div className="card-actions">
                          <button
                            type="button"
                            className="icon-btn"
                            title="Düzenle"
                            aria-label="Düzenle"
                            onClick={() => handleEditCatalog(cat)}
                          >
                            <Edit size={14} />
                          </button>

                          <button
                            type="button"
                            className="icon-btn"
                            title="Paylaş & QR Kod"
                            aria-label="Paylaş"
                            onClick={() => setSharingCatalog(cat)}
                          >
                            <Share2 size={14} />
                          </button>

                          <button
                            type="button"
                            className="icon-btn"
                            title={cat.isPublished ? 'Taslağa Al' : 'Yayına Al'}
                            aria-label={cat.isPublished ? 'Taslağa Al' : 'Yayına Al'}
                            onClick={() => handleTogglePublish(cat)}
                          >
                            <CheckCircle2 size={14} style={{ color: cat.isPublished ? '#167653' : '#888' }} />
                          </button>

                          <button
                            type="button"
                            className="icon-btn"
                            title="Kataloğu Sil"
                            aria-label="Sil"
                            onClick={() => handleDeleteCatalog(cat.id)}
                          >
                            <Trash2 size={14} className="hover:text-rose-600" />
                          </button>

                          <Link
                            href={publicUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline btn-small"
                          >
                            <span>Ön izle</span>
                            <ExternalLink size={12} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* Footer Note */}
          <div className="footer-note">
            <span>
              SeramikBak Studio <span style={{ color: '#c0a17b' }}>&bull;</span> Markanızın dijital yayın alanı
            </span>
            <span>Kataloglarınızı her cihazda profesyonel biçimde sunun.</span>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 2: INQUIRIES LIST (GELEN B2B TALEPLERİ)
      ========================================================================= */}
      {currentView === 'inquiries' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="studio-eyebrow">{brandName} &bull; TİCARİ MASASI</div>
              <h2 className="text-xl font-bold text-stone-900">Gelen Teklif & Numune Talepleri</h2>
              <p className="text-xs text-stone-500">
                Dijital kataloglarınızdan gelen mimari ve ticari talepleri yönetin.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentView('list')}
                className="btn btn-outline"
              >
                <ArrowLeft size={14} />
                <span>Kataloglarıma Dön</span>
              </button>
              <button
                type="button"
                onClick={loadInquiries}
                className="btn btn-primary"
              >
                <RefreshCw size={13} />
                <span>Yenile</span>
              </button>
            </div>
          </div>

          {inquiriesLoading ? (
            <div className="py-20 text-center text-stone-400 bg-white rounded-2xl border border-stone-200">
              <Loader2 size={24} className="animate-spin mx-auto text-[#b47b3d] mb-2" />
              <p className="text-xs">Talepler yükleniyor...</p>
            </div>
          ) : inquiries.length === 0 ? (
            <div className="empty-state">
              <Tag size={28} className="text-stone-300 mx-auto mb-2" />
              <strong>Henüz bir talep alınmadı</strong>
              <p className="text-xs">Kataloglarınız üzerinden iletilen teklif ve numune talepleri burada listelenir.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {inquiries.map((inq) => {
                const isSample = inq.leadType === 'sample';
                return (
                  <div
                    key={inq.id}
                    className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4"
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
                            className="flex items-center gap-1 hover:text-[#b47b3d] font-mono"
                          >
                            <Phone size={12} className="text-emerald-600" />
                            <span>{inq.phone}</span>
                          </a>
                        )}
                        {inq.email && (
                          <a
                            href={`mailto:${inq.email}`}
                            className="flex items-center gap-1 hover:text-[#b47b3d]"
                          >
                            <Mail size={12} className="text-[#b47b3d]" />
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

                      {inq.customerMessage && (
                        <div className="text-xs text-stone-700 bg-stone-50 p-2.5 rounded-xl border border-stone-200 mt-2">
                          <strong className="text-stone-900 block text-[11px] mb-0.5">Müşteri Notu / Talep:</strong>
                          <span className="whitespace-pre-line">{inq.customerMessage}</span>
                        </div>
                      )}

                      {inq.catalogTitle && (
                        <p className="text-[11px] text-stone-400 mt-1">
                          <strong>Kaynak Katalog:</strong> {inq.catalogTitle}
                        </p>
                      )}
                    </div>

                    {inq.phone && (
                      <a
                        href={`https://wa.me/${inq.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary text-xs"
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
          VIEW 3: 3-STEP CATALOG BUILDER (SADE & LÜKS EDİTÖR)
      ========================================================================= */}
      {currentView === 'editor' && (
        <div className="space-y-6">
          {/* Stepper Navigation */}
          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-stone-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* 3 Steps Segmented Tabs */}
            <div className="grid grid-cols-3 gap-1.5 sm:flex sm:items-center sm:gap-2 w-full md:w-auto">
              <button
                type="button"
                onClick={() => setEditorStep(1)}
                className={`flex items-center justify-center gap-1.5 px-2 sm:px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer text-center ${
                  editorStep === 1 ? 'btn-primary shadow-xs' : 'btn-outline bg-stone-50/60'
                }`}
              >
                <span className="sm:hidden">1. Şablon</span>
                <span className="hidden sm:inline">1. Şablon Seçimi</span>
              </button>

              <button
                type="button"
                onClick={() => setEditorStep(2)}
                className={`flex items-center justify-center gap-1.5 px-2 sm:px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer text-center ${
                  editorStep === 2 ? 'btn-primary shadow-xs' : 'btn-outline bg-stone-50/60'
                }`}
              >
                <span className="sm:hidden">2. Karolar ({formData.selectedProductIds.length})</span>
                <span className="hidden sm:inline">2. Bilgiler & Karolar ({formData.selectedProductIds.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setEditorStep(3)}
                className={`flex items-center justify-center gap-1.5 px-2 sm:px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer text-center ${
                  editorStep === 3 ? 'btn-primary shadow-xs' : 'btn-outline bg-stone-50/60'
                }`}
              >
                <Sparkles size={13} className="hidden sm:inline" />
                <span className="sm:hidden">3. Önizle</span>
                <span className="hidden sm:inline">3. Canlı Önizle & Yayınla</span>
              </button>
            </div>

            {/* Action Buttons: Taslak Kaydet & Yayına Al */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-100 md:pt-0 md:border-t-0 md:flex md:items-center w-full md:w-auto">
              <button
                type="button"
                onClick={() => handleSaveCatalog(false)}
                disabled={saving}
                className="btn btn-outline flex-1 justify-center h-10 text-xs font-bold rounded-xl"
              >
                <span>Taslak Kaydet</span>
              </button>

              <button
                type="button"
                onClick={() => handleSaveCatalog(true)}
                disabled={saving}
                className="btn btn-accent flex-1 justify-center h-10 text-xs font-bold rounded-xl"
              >
                {saving ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                <span>Yayına Al</span>
              </button>
            </div>
          </div>

          {/* STEP 1: ŞABLON SEÇİMİ */}
          {editorStep === 1 && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
                <h3 className="text-base font-bold text-stone-900">
                  Lüks HTML Dijital Lookbook Şablonunuzu Seçin
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Koleksiyonunuzun tarzına en uygun mimari editoryal mizanpajı ve renk harmonisini seçin.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {HTML_CATALOG_TEMPLATES.map((tmpl) => {
                  const isSelected = formData.template === tmpl.id;
                  return (
                    <div
                      key={tmpl.id}
                      onClick={() => setFormData({ ...formData, template: tmpl.id, primaryColor: tmpl.palette.primary })}
                      className={`group bg-white rounded-2xl border-2 transition-all duration-200 overflow-hidden cursor-pointer flex flex-col justify-between shadow-2xs hover:shadow-lg ${
                        isSelected
                          ? 'border-[#b47b3d] ring-2 ring-[#b47b3d]/30 shadow-md'
                          : 'border-stone-200 hover:border-stone-400'
                      }`}
                    >
                      <div className="relative aspect-[16/10] bg-stone-950 overflow-hidden">
                        <img
                          src={tmpl.previewImg}
                          alt={tmpl.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                        <div className="absolute top-3 left-3 flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/70 text-white backdrop-blur-md border border-white/20">
                            {tmpl.badge}
                          </span>
                        </div>
                        {tmpl.folioNumber && (
                          <div className="absolute top-3 right-3">
                            <span className="px-2 py-0.5 rounded text-[9px] font-mono font-semibold bg-white/10 text-white/90 backdrop-blur-md border border-white/15">
                              {tmpl.folioNumber}
                            </span>
                          </div>
                        )}
                        {isSelected && (
                          <div className="absolute top-10 right-3 w-7 h-7 rounded-full bg-[#b47b3d] text-white flex items-center justify-center shadow-lg ring-2 ring-white">
                            <Check size={15} strokeWidth={3} />
                          </div>
                        )}
                        <div className="absolute bottom-3 left-3 right-3 text-white">
                          <span className="text-[10px] font-mono text-amber-300 uppercase tracking-widest block mb-0.5">
                            {tmpl.style}
                          </span>
                          <h4 className="text-sm font-bold drop-shadow leading-snug">{tmpl.name}</h4>
                        </div>
                      </div>

                      <div className="p-4 space-y-3">
                        {tmpl.idealFor && (
                          <div className="px-2.5 py-1.5 rounded-lg bg-stone-50 border border-stone-200/80 text-[11px] font-medium text-stone-700 flex items-center gap-1.5">
                            <Sparkles size={12} className="text-[#b47b3d] flex-shrink-0" />
                            <span className="truncate">{tmpl.idealFor}</span>
                          </div>
                        )}

                        {tmpl.colorSample && (
                          <div className="flex items-center justify-between pt-0.5 text-[11px]">
                            <span className="text-stone-400 font-mono text-[10px]">Renk Harmonisi:</span>
                            <div className="flex items-center gap-1.5">
                              <span
                                className="w-4 h-4 rounded-full border border-stone-300 shadow-2xs"
                                style={{ backgroundColor: tmpl.colorSample.primary }}
                                title="Ana Renk"
                              />
                              <span
                                className="w-4 h-4 rounded-full border border-stone-300 shadow-2xs"
                                style={{ backgroundColor: tmpl.colorSample.secondary }}
                                title="İkincil Renk"
                              />
                              <span
                                className="w-4 h-4 rounded-full border border-stone-300 shadow-2xs"
                                style={{ backgroundColor: tmpl.colorSample.background }}
                                title="Arka Plan"
                              />
                              <span
                                className="w-4 h-4 rounded-full border border-stone-300 shadow-2xs"
                                style={{ backgroundColor: tmpl.colorSample.accent }}
                                title="Aksan Vurgu"
                              />
                            </div>
                          </div>
                        )}

                        <p className="text-xs text-stone-600 leading-relaxed font-normal">
                          {tmpl.description}
                        </p>

                        <div className="pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs">
                          <span className="text-stone-400 font-mono text-[10px]">{tmpl.tag || 'HTML5 Responsive'}</span>
                          <span
                            className={`font-bold text-xs ${
                              isSelected ? 'text-[#8f5c29]' : 'text-stone-500 group-hover:text-stone-900'
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

              <div className="flex items-center justify-end pt-4 pb-16 sm:pb-2 border-t border-stone-200 mt-6">
                <button
                  type="button"
                  onClick={() => setEditorStep(2)}
                  className="btn btn-primary w-full sm:w-auto sm:min-w-[240px] justify-center h-12 text-xs font-bold rounded-xl"
                >
                  <span>Sonraki Adım: Bilgiler & Ürünler</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: BİLGİLER, BÖLÜM METİNLERİ, GÖRSELLER & KAROLAR */}
          {editorStep === 2 && (
            <div className="space-y-6">
              {/* Informative Sub-Tabs Bar */}
              <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
                      <Sliders size={16} className="text-amber-600" />
                      <span>Katalog İçerik, Metin ve Görsel Özelleştirme</span>
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      İstediğiniz bölümleri açıp kapatabilir, tüm başlık, metin, teknik şartname ve görselleri markanıza özel güncelleyebilirsiniz.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAiAutoFill}
                    disabled={aiGenerating}
                    className="btn btn-outline text-xs whitespace-nowrap self-start sm:self-auto"
                  >
                    {aiGenerating ? <Loader2 size={13} className="animate-spin text-amber-600" /> : <Sparkles size={13} className="text-amber-600" />}
                    <span>Yapay Zeka ile Doldur</span>
                  </button>
                </div>

                {/* Sub-Tabs Grid/Scroll */}
                <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setActiveContentTab('products')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      activeContentTab === 'products'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200'
                    }`}
                  >
                    <Package size={13} />
                    <span>1. Karolar ({formData.selectedProductIds.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveContentTab('cover')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      activeContentTab === 'cover'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200'
                    }`}
                  >
                    <BookOpen size={13} />
                    <span>2. Kapak & Giriş</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveContentTab('monograph')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      activeContentTab === 'monograph'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200'
                    }`}
                  >
                    <Tag size={13} />
                    <span>3. Kürasyon & Standartlar</span>
                    {formData.sectionSettings?.showMonograph === false && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 font-normal">Gizli</span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveContentTab('editorial')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      activeContentTab === 'editorial'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200'
                    }`}
                  >
                    <Layers size={13} />
                    <span>4. Mekânlar & Editoryal</span>
                    {formData.sectionSettings?.showEditorial === false && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 font-normal">Gizli</span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveContentTab('technical')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      activeContentTab === 'technical'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200'
                    }`}
                  >
                    <ShieldCheck size={13} />
                    <span>5. Teknik Şartname & BIM</span>
                    {formData.sectionSettings?.showTechnical === false && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 font-normal">Gizli</span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveContentTab('cta')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      activeContentTab === 'cta'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200'
                    }`}
                  >
                    <Phone size={13} />
                    <span>6. İletişim & Teklif</span>
                    {formData.sectionSettings?.showCta === false && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 font-normal">Gizli</span>
                    )}
                  </button>
                </div>
              </div>

              {/* SUB-TAB 1: PRODUCT SELECTION */}
              {activeContentTab === 'products' && (
                <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                        Kataloğa Dahil Edilecek Karolar ({formData.selectedProductIds.length} Seçili)
                      </h3>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Kataloğunuzda sergilenecek ürünleri seçin.
                      </p>
                    </div>

                    <div className="search-box">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                      <input
                        type="text"
                        placeholder="Ürün adı, kod veya yüzey ara..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                      />
                    </div>
                  </div>

                  {productsLoading ? (
                    <div className="py-12 text-center text-stone-400">
                      <Loader2 size={20} className="animate-spin mx-auto text-[#b47b3d] mb-1" />
                      <p className="text-xs">Ürünler taranıyor...</p>
                    </div>
                  ) : filteredBrandProducts.length === 0 ? (
                    <div className="p-8 text-center bg-stone-50 rounded-xl border border-dashed border-stone-200">
                      <p className="text-xs text-stone-500">Ürün bulunamadı.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-[460px] overflow-y-auto p-1">
                      {filteredBrandProducts.map((p) => {
                        const isSelected = formData.selectedProductIds.includes(p.id);
                        return (
                          <div
                            key={p.id}
                            onClick={() => toggleProductSelect(p.id)}
                            className={`group p-2 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                              isSelected
                                ? 'border-[#b47b3d] bg-amber-50/40 ring-1 ring-[#b47b3d]'
                                : 'border-stone-200 hover:border-stone-400 bg-white'
                            }`}
                          >
                            <div className="relative aspect-square rounded-lg bg-stone-100 overflow-hidden mb-2">
                              <img
                                src={p.imageUrl || p.textureUrl || '/renders/luxury_bathroom_calacatta_gold.jpg'}
                                alt={p.name}
                                className="w-full h-full object-cover"
                              />
                              {isSelected && (
                                <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[#b47b3d] text-white flex items-center justify-center shadow-xs">
                                  <Check size={12} strokeWidth={3} />
                                </div>
                              )}
                            </div>

                            <div>
                              <h4 className="text-xs font-bold text-stone-900 truncate" title={p.name}>
                                {p.name}
                              </h4>
                              <p className="text-[10px] text-stone-500 truncate">
                                {p.width && p.height ? `${p.width}x${p.height} cm` : (p.finish || 'Standart')}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* SUB-TAB 2: COVER & HERO EDIT */}
              {activeContentTab === 'cover' && (
                <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                    <div>
                      <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                        Kapak & Hero Alanı Özelleştirme
                      </h3>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Kataloğunuzun ilk açılış ekranındaki başlık, alt başlık, giriş metni ve özel kapak görseli.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-stone-700">Katalog Başlığı *</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Örn: Bien Seramik 2026 Mimari Koleksiyonu"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs text-stone-900 outline-none focus:border-amber-600 transition"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-stone-700">Kapak Alt Başlığı</label>
                      <input
                        type="text"
                        value={formData.coverSubtitle}
                        onChange={(e) => setFormData({ ...formData, coverSubtitle: e.target.value })}
                        placeholder="Örn: Yüksek Performanslı Porselen & Seramik Seçkisi"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs text-stone-900 outline-none focus:border-amber-600 transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-stone-700">Kapak Damga / Rozet Metni</label>
                      <input
                        type="text"
                        value={formData.sectionSettings?.heroBadgeText || ''}
                        onChange={(e) => updateSectionSetting('heroBadgeText', e.target.value)}
                        placeholder="Örn: MALZEMENİN DİLİ veya 2026 MİMARİ SERİSİ"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs text-stone-900 outline-none focus:border-amber-600 transition"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-stone-700">Yıl / Sezon Etiketi</label>
                      <input
                        type="text"
                        value={formData.sectionSettings?.heroYear || ''}
                        onChange={(e) => updateSectionSetting('heroYear', e.target.value)}
                        placeholder="Örn: 2026"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs text-stone-900 outline-none focus:border-amber-600 transition"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700">Özel Kapak Görseli URL'si</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={formData.sectionSettings?.coverImageUrl || ''}
                        onChange={(e) => updateSectionSetting('coverImageUrl', e.target.value)}
                        placeholder="https://... (Boş bırakılırsa şablonun varsayılan kapağı veya ilk ürün görseli kullanılır)"
                        className="flex-1 px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs text-stone-900 outline-none focus:border-amber-600 transition"
                      />
                      {formData.sectionSettings?.coverImageUrl && (
                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-stone-200 flex-shrink-0 bg-stone-100">
                          <img
                            src={formData.sectionSettings.coverImageUrl}
                            alt="Kapak Önizleme"
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-stone-400 block mt-0.5">
                      Markanıza ait showroom, katalog kapağı veya proje fotoğrafı URL'si yapıştırabilirsiniz.
                    </span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700">Kapak Damga Alt Başlığı (Vurgu)</label>
                    <input
                      type="text"
                      value={formData.sectionSettings?.heroStampText || ''}
                      onChange={(e) => updateSectionSetting('heroStampText', e.target.value)}
                      placeholder="Örn: Doğadan ilham. Mimariyle hayat bulur."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs text-stone-900 outline-none focus:border-amber-600 transition"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700">Giriş / Manifesto Açıklaması</label>
                    <textarea
                      rows={3}
                      value={formData.introText}
                      onChange={(e) => setFormData({ ...formData, introText: e.target.value })}
                      placeholder="Koleksiyonunuzun felsefesini, doku zenginliğini ve mimari kullanım vizyonunu açıklayan metin..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs text-stone-900 outline-none focus:border-amber-600 transition resize-none"
                    />
                  </div>
                </div>
              )}

              {/* SUB-TAB 3: MONOGRAPH & STANDARDS EDIT */}
              {activeContentTab === 'monograph' && (
                <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
                    <div>
                      <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                        Kürasyon & Mimari Standartlar Şeridi
                      </h3>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Kapak altında yer alan mimari felsefe alıntısı ve 4 teknik performans kutusu.
                      </p>
                    </div>

                    <label className="inline-flex items-center gap-2 cursor-pointer self-start sm:self-auto bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-200">
                      <input
                        type="checkbox"
                        checked={formData.sectionSettings?.showMonograph !== false}
                        onChange={(e) => updateSectionSetting('showMonograph', e.target.checked)}
                        className="rounded text-amber-600 focus:ring-amber-500 h-4 w-4"
                      />
                      <span className="text-xs font-bold text-stone-800">
                        {formData.sectionSettings?.showMonograph !== false ? 'Bölüm Açık' : 'Bölüm Gizli'}
                      </span>
                    </label>
                  </div>

                  {formData.sectionSettings?.showMonograph === false ? (
                    <div className="p-6 bg-rose-50/60 rounded-xl border border-rose-200 text-center">
                      <EyeOff size={24} className="mx-auto text-rose-500 mb-2" />
                      <h4 className="text-xs font-bold text-rose-900">Bu Bölüm Katalogda Gösterilmeyecek</h4>
                      <p className="text-[11px] text-rose-600 mt-1 max-w-md mx-auto">
                        Kürasyon & standartlar şeridi yayında tamamen gizlenecektir. İhtiyacınız olduğunda yukarıdaki anahtardan dilediğiniz zaman tekrar açabilirsiniz.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 animate-in fade-in duration-150">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-stone-700">Manifesto / Küratöryel Alıntı Metni</label>
                        <textarea
                          rows={2}
                          value={formData.sectionSettings?.monographQuote || ''}
                          onChange={(e) => updateSectionSetting('monographQuote', e.target.value)}
                          placeholder="Yüzey yalnızca bir kaplama değil; mekânın ışığını, akustik dengesini ve dokusal hafızasını belirleyen temel mimari dildir."
                          className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs text-stone-900 outline-none focus:border-amber-600 transition resize-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-stone-700">Alıntı İmzası / Laboratuvar Adı</label>
                        <input
                          type="text"
                          value={formData.sectionSettings?.monographAuthor || ''}
                          onChange={(e) => updateSectionSetting('monographAuthor', e.target.value)}
                          placeholder={`— ${brandName} Tasarım & Malzeme İnovasyon Laboratuvarı`}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs text-stone-900 outline-none focus:border-amber-600 transition"
                        />
                      </div>

                      <div className="pt-2">
                        <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
                          4 Teknik Standart / Özellik Kutusu
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          <div className="p-3 rounded-xl border border-stone-200 bg-stone-50 space-y-1.5">
                            <span className="text-[10px] font-bold text-stone-500 uppercase block">1. Kutu: Standart</span>
                            <input
                              type="text"
                              value={formData.sectionSettings?.spec1Label || 'EN 14411 BLa'}
                              onChange={(e) => updateSectionSetting('spec1Label', e.target.value)}
                              placeholder="EN 14411 BLa"
                              className="w-full px-2 py-1.5 rounded-lg border border-stone-200 bg-white text-xs font-bold"
                            />
                            <input
                              type="text"
                              value={formData.sectionSettings?.spec1Desc || 'Tam Gövde Porselen'}
                              onChange={(e) => updateSectionSetting('spec1Desc', e.target.value)}
                              placeholder="Tam Gövde Porselen"
                              className="w-full px-2 py-1.5 rounded-lg border border-stone-200 bg-white text-[11px]"
                            />
                          </div>

                          <div className="p-3 rounded-xl border border-stone-200 bg-stone-50 space-y-1.5">
                            <span className="text-[10px] font-bold text-stone-500 uppercase block">2. Kutu: Su Emme</span>
                            <input
                              type="text"
                              value={formData.sectionSettings?.spec2Label || 'E ≤ %0.05'}
                              onChange={(e) => updateSectionSetting('spec2Label', e.target.value)}
                              placeholder="E ≤ %0.05"
                              className="w-full px-2 py-1.5 rounded-lg border border-stone-200 bg-white text-xs font-bold"
                            />
                            <input
                              type="text"
                              value={formData.sectionSettings?.spec2Desc || 'Sıfıra Yakın Geçirgenlik'}
                              onChange={(e) => updateSectionSetting('spec2Desc', e.target.value)}
                              placeholder="Sıfıra Yakın Geçirgenlik"
                              className="w-full px-2 py-1.5 rounded-lg border border-stone-200 bg-white text-[11px]"
                            />
                          </div>

                          <div className="p-3 rounded-xl border border-stone-200 bg-stone-50 space-y-1.5">
                            <span className="text-[10px] font-bold text-stone-500 uppercase block">3. Kutu: Kenar Kesimi</span>
                            <input
                              type="text"
                              value={formData.sectionSettings?.spec3Label || 'Lazer Rektifiye'}
                              onChange={(e) => updateSectionSetting('spec3Label', e.target.value)}
                              placeholder="Lazer Rektifiye"
                              className="w-full px-2 py-1.5 rounded-lg border border-stone-200 bg-white text-xs font-bold"
                            />
                            <input
                              type="text"
                              value={formData.sectionSettings?.spec3Desc || '1 mm Monokalibre Derz'}
                              onChange={(e) => updateSectionSetting('spec3Desc', e.target.value)}
                              placeholder="1 mm Monokalibre Derz"
                              className="w-full px-2 py-1.5 rounded-lg border border-stone-200 bg-white text-[11px]"
                            />
                          </div>

                          <div className="p-3 rounded-xl border border-stone-200 bg-stone-50 space-y-1.5">
                            <span className="text-[10px] font-bold text-stone-500 uppercase block">4. Kutu: Doku Çözünürlüğü</span>
                            <input
                              type="text"
                              value={formData.sectionSettings?.spec4Label || '4K PBR Master'}
                              onChange={(e) => updateSectionSetting('spec4Label', e.target.value)}
                              placeholder="4K PBR Master"
                              className="w-full px-2 py-1.5 rounded-lg border border-stone-200 bg-white text-xs font-bold"
                            />
                            <input
                              type="text"
                              value={formData.sectionSettings?.spec4Desc || 'Ultra HD Mikrotekstür'}
                              onChange={(e) => updateSectionSetting('spec4Desc', e.target.value)}
                              placeholder="Ultra HD Mikrotekstür"
                              className="w-full px-2 py-1.5 rounded-lg border border-stone-200 bg-white text-[11px]"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SUB-TAB 4: EDITORIAL & LIVING SPACES EDIT */}
              {activeContentTab === 'editorial' && (
                <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
                    <div>
                      <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                        Mekânlar & Editoryal Yaşam Alanı Bölümü
                      </h3>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Mimari yaşam alanları, ilham veren mekan fotoğrafları ve kullanım alanları listesi.
                      </p>
                    </div>

                    <label className="inline-flex items-center gap-2 cursor-pointer self-start sm:self-auto bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-200">
                      <input
                        type="checkbox"
                        checked={formData.sectionSettings?.showEditorial !== false}
                        onChange={(e) => updateSectionSetting('showEditorial', e.target.checked)}
                        className="rounded text-amber-600 focus:ring-amber-500 h-4 w-4"
                      />
                      <span className="text-xs font-bold text-stone-800">
                        {formData.sectionSettings?.showEditorial !== false ? 'Bölüm Açık' : 'Bölüm Gizli'}
                      </span>
                    </label>
                  </div>

                  {formData.sectionSettings?.showEditorial === false ? (
                    <div className="p-6 bg-rose-50/60 rounded-xl border border-rose-200 text-center">
                      <EyeOff size={24} className="mx-auto text-rose-500 mb-2" />
                      <h4 className="text-xs font-bold text-rose-900">Bu Bölüm Katalogda Gösterilmeyecek</h4>
                      <p className="text-[11px] text-rose-600 mt-1 max-w-md mx-auto">
                        Mekânlar & editoryal bölümü ve fotoğrafı yayında tamamen gizlenecektir.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 animate-in fade-in duration-150">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-stone-700">Bölüm Üst Rozeti</label>
                          <input
                            type="text"
                            value={formData.sectionSettings?.editorialBadge || ''}
                            onChange={(e) => updateSectionSetting('editorialBadge', e.target.value)}
                            placeholder="Mekânda Hayat Bulan Yüzeyler"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs text-stone-900 outline-none focus:border-amber-600 transition"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-stone-700">Bölüm Ana Başlığı</label>
                          <input
                            type="text"
                            value={formData.sectionSettings?.editorialTitle || ''}
                            onChange={(e) => updateSectionSetting('editorialTitle', e.target.value)}
                            placeholder="Bir Yüzeyden Daha Fazlası."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs text-stone-900 outline-none focus:border-amber-600 transition"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-stone-700">Mekân / Uygulama Fotoğrafı URL'si</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="text"
                            value={formData.sectionSettings?.editorialImageUrl || ''}
                            onChange={(e) => updateSectionSetting('editorialImageUrl', e.target.value)}
                            placeholder="https://... (Markanıza ait salon, banyo veya dış cephe mimari uygulama fotoğrafı)"
                            className="flex-1 px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs text-stone-900 outline-none focus:border-amber-600 transition"
                          />
                          {formData.sectionSettings?.editorialImageUrl && (
                            <div className="w-10 h-10 rounded-lg overflow-hidden border border-stone-200 flex-shrink-0 bg-stone-100">
                              <img
                                src={formData.sectionSettings.editorialImageUrl}
                                alt="Mekan Önizleme"
                                className="w-full h-full object-cover"
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-stone-700">Editoryal Açıklama Metni</label>
                        <textarea
                          rows={2}
                          value={formData.sectionSettings?.editorialText || ''}
                          onChange={(e) => updateSectionSetting('editorialText', e.target.value)}
                          placeholder="Doğru seramik ve porselen, mekânın ışığını, akustik dengesini ve mimari derinliğini belirler..."
                          className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs text-stone-900 outline-none focus:border-amber-600 transition resize-none"
                        />
                      </div>

                      <div className="pt-2">
                        <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
                          3 Öne Çıkan Yaşam Alanı Satırı
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="p-3 rounded-xl border border-stone-200 bg-stone-50 space-y-1.5">
                            <span className="text-[10px] font-bold text-stone-500 uppercase block">01 Alan</span>
                            <input
                              type="text"
                              value={formData.sectionSettings?.feature1Title || '01   Banyo ve Spa'}
                              onChange={(e) => updateSectionSetting('feature1Title', e.target.value)}
                              placeholder="01   Banyo ve Spa"
                              className="w-full px-2 py-1.5 rounded-lg border border-stone-200 bg-white text-xs font-bold"
                            />
                            <input
                              type="text"
                              value={formData.sectionSettings?.feature1Desc || 'Doğal Taş Dinginliği ↗'}
                              onChange={(e) => updateSectionSetting('feature1Desc', e.target.value)}
                              placeholder="Doğal Taş Dinginliği ↗"
                              className="w-full px-2 py-1.5 rounded-lg border border-stone-200 bg-white text-[11px]"
                            />
                          </div>

                          <div className="p-3 rounded-xl border border-stone-200 bg-stone-50 space-y-1.5">
                            <span className="text-[10px] font-bold text-stone-500 uppercase block">02 Alan</span>
                            <input
                              type="text"
                              value={formData.sectionSettings?.feature2Title || '02   Yaşam Alanları & Salon'}
                              onChange={(e) => updateSectionSetting('feature2Title', e.target.value)}
                              placeholder="02   Yaşam Alanları & Salon"
                              className="w-full px-2 py-1.5 rounded-lg border border-stone-200 bg-white text-xs font-bold"
                            />
                            <input
                              type="text"
                              value={formData.sectionSettings?.feature2Desc || 'Geniş Ebat Monolitik Slab ↗'}
                              onChange={(e) => updateSectionSetting('feature2Desc', e.target.value)}
                              placeholder="Geniş Ebat Monolitik Slab ↗"
                              className="w-full px-2 py-1.5 rounded-lg border border-stone-200 bg-white text-[11px]"
                            />
                          </div>

                          <div className="p-3 rounded-xl border border-stone-200 bg-stone-50 space-y-1.5">
                            <span className="text-[10px] font-bold text-stone-500 uppercase block">03 Alan</span>
                            <input
                              type="text"
                              value={formData.sectionSettings?.feature3Title || '03   Mutfak ve Ticari Zeminler'}
                              onChange={(e) => updateSectionSetting('feature3Title', e.target.value)}
                              placeholder="03   Mutfak ve Ticari Zeminler"
                              className="w-full px-2 py-1.5 rounded-lg border border-stone-200 bg-white text-xs font-bold"
                            />
                            <input
                              type="text"
                              value={formData.sectionSettings?.feature3Desc || 'Yüksek Trafik Dayanımı (PEI V) ↗'}
                              onChange={(e) => updateSectionSetting('feature3Desc', e.target.value)}
                              placeholder="Yüksek Trafik Dayanımı (PEI V) ↗"
                              className="w-full px-2 py-1.5 rounded-lg border border-stone-200 bg-white text-[11px]"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SUB-TAB 5: TECHNICAL SPECIFICATIONS & BIM EDIT */}
              {activeContentTab === 'technical' && (
                <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
                    <div>
                      <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                        Teknik Şartname, Laboratuvar Değerleri & BIM
                      </h3>
                      <p className="text-xs text-stone-500 mt-0.5">
                        EN 14411 standart uyumluluğu, teknik performans kartları ve indirilebilir mimari BIM / CAD / Sertifika bağlantıları.
                      </p>
                    </div>

                    <label className="inline-flex items-center gap-2 cursor-pointer self-start sm:self-auto bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-200">
                      <input
                        type="checkbox"
                        checked={formData.sectionSettings?.showTechnical !== false}
                        onChange={(e) => updateSectionSetting('showTechnical', e.target.checked)}
                        className="rounded text-amber-600 focus:ring-amber-500 h-4 w-4"
                      />
                      <span className="text-xs font-bold text-stone-800">
                        {formData.sectionSettings?.showTechnical !== false ? 'Bölüm Açık' : 'Bölüm Gizli'}
                      </span>
                    </label>
                  </div>

                  {formData.sectionSettings?.showTechnical === false ? (
                    <div className="p-6 bg-rose-50/60 rounded-xl border border-rose-200 text-center">
                      <EyeOff size={24} className="mx-auto text-rose-500 mb-2" />
                      <h4 className="text-xs font-bold text-rose-900">Bu Bölüm Katalogda Gösterilmeyecek</h4>
                      <p className="text-[11px] text-rose-600 mt-1 max-w-md mx-auto">
                        Teknik şartname tablosu ve BIM indirme alanı yayında tamamen gizlenecektir.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 animate-in fade-in duration-150">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-stone-700">Bölüm Üst Rozeti</label>
                          <input
                            type="text"
                            value={formData.sectionSettings?.technicalBadge || ''}
                            onChange={(e) => updateSectionSetting('technicalBadge', e.target.value)}
                            placeholder="Mimari Şartname & Kalite Güvencesi"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs text-stone-900 outline-none focus:border-amber-600 transition"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-stone-700">Bölüm Ana Başlığı</label>
                          <input
                            type="text"
                            value={formData.sectionSettings?.technicalTitle || ''}
                            onChange={(e) => updateSectionSetting('technicalTitle', e.target.value)}
                            placeholder="Mükemmel Estetik, Sarsılmaz Standartlar"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs text-stone-900 outline-none focus:border-amber-600 transition"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-stone-700">Alt Açıklama / Standart Metni</label>
                        <input
                          type="text"
                          value={formData.sectionSettings?.technicalSubtitle || ''}
                          onChange={(e) => updateSectionSetting('technicalSubtitle', e.target.value)}
                          placeholder="Avrupa Birliği EN 14411 standardına tam uyumlu teknik değerler."
                          className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs text-stone-900 outline-none focus:border-amber-600 transition"
                        />
                      </div>

                      <div className="pt-2">
                        <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
                          3 Teknik Kriter Kartı
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50 space-y-1.5">
                            <span className="text-[10px] font-bold text-stone-500 uppercase block">1. Su Emme</span>
                            <input
                              type="text"
                              value={formData.sectionSettings?.tech1Title || '01 // SU EMME DEĞERİ (E ≤ %0.05)'}
                              onChange={(e) => updateSectionSetting('tech1Title', e.target.value)}
                              placeholder="01 // SU EMME DEĞERİ"
                              className="w-full px-2 py-1.5 rounded-lg border border-stone-200 bg-white text-[11px] font-mono"
                            />
                            <input
                              type="text"
                              value={formData.sectionSettings?.tech1Heading || 'Sıfıra Yakın Su Emme'}
                              onChange={(e) => updateSectionSetting('tech1Heading', e.target.value)}
                              placeholder="Sıfıra Yakın Su Emme"
                              className="w-full px-2 py-1.5 rounded-lg border border-stone-200 bg-white text-xs font-bold"
                            />
                            <textarea
                              rows={2}
                              value={formData.sectionSettings?.tech1Desc || 'Donmaya, lekelenmeye ve kimyasallara karşı maksimum direnç sunan porselen gövde.'}
                              onChange={(e) => updateSectionSetting('tech1Desc', e.target.value)}
                              className="w-full px-2 py-1.5 rounded-lg border border-stone-200 bg-white text-[11px] resize-none"
                            />
                          </div>

                          <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50 space-y-1.5">
                            <span className="text-[10px] font-bold text-stone-500 uppercase block">2. Kayma Direnci</span>
                            <input
                              type="text"
                              value={formData.sectionSettings?.tech2Title || '02 // R10 / R11 KAYMA DİRENCİ'}
                              onChange={(e) => updateSectionSetting('tech2Title', e.target.value)}
                              placeholder="02 // KAYMA DİRENCİ"
                              className="w-full px-2 py-1.5 rounded-lg border border-stone-200 bg-white text-[11px] font-mono"
                            />
                            <input
                              type="text"
                              value={formData.sectionSettings?.tech2Heading || 'Islak Hacim Güvenliği'}
                              onChange={(e) => updateSectionSetting('tech2Heading', e.target.value)}
                              placeholder="Islak Hacim Güvenliği"
                              className="w-full px-2 py-1.5 rounded-lg border border-stone-200 bg-white text-xs font-bold"
                            />
                            <textarea
                              rows={2}
                              value={formData.sectionSettings?.tech2Desc || 'Banyo, havuz kenarı ve otel girişleri için mikrotekstür teknolojisi.'}
                              onChange={(e) => updateSectionSetting('tech2Desc', e.target.value)}
                              className="w-full px-2 py-1.5 rounded-lg border border-stone-200 bg-white text-[11px] resize-none"
                            />
                          </div>

                          <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50 space-y-1.5">
                            <span className="text-[10px] font-bold text-stone-500 uppercase block">3. Rektifiye Kesim</span>
                            <input
                              type="text"
                              value={formData.sectionSettings?.tech3Title || '03 // REKTİFİYE MİLİMETRİK KESİM'}
                              onChange={(e) => updateSectionSetting('tech3Title', e.target.value)}
                              placeholder="03 // REKTİFİYE KESİM"
                              className="w-full px-2 py-1.5 rounded-lg border border-stone-200 bg-white text-[11px] font-mono"
                            />
                            <input
                              type="text"
                              value={formData.sectionSettings?.tech3Heading || 'Derzsiz Süreklilik'}
                              onChange={(e) => updateSectionSetting('tech3Heading', e.target.value)}
                              placeholder="Derzsiz Süreklilik"
                              className="w-full px-2 py-1.5 rounded-lg border border-stone-200 bg-white text-xs font-bold"
                            />
                            <textarea
                              rows={2}
                              value={formData.sectionSettings?.tech3Desc || 'Lazer kontrollü rektifiye kenarlar sayesinde 1 mm minimum derz aralığı.'}
                              onChange={(e) => updateSectionSetting('tech3Desc', e.target.value)}
                              className="w-full px-2 py-1.5 rounded-lg border border-stone-200 bg-white text-[11px] resize-none"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-2">
                        <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
                          Özel İndirme Dosyaları & Bağlantılar (Opsiyonel)
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-stone-700">BIM & CAD Dosya Linki</label>
                            <input
                              type="text"
                              value={formData.sectionSettings?.bimCadUrl || ''}
                              onChange={(e) => updateSectionSetting('bimCadUrl', e.target.value)}
                              placeholder="https://... (.ZIP / .RFA)"
                              className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white text-xs"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-stone-700">CE & LEED Sertifika Linki</label>
                            <input
                              type="text"
                              value={formData.sectionSettings?.ceLeedUrl || ''}
                              onChange={(e) => updateSectionSetting('ceLeedUrl', e.target.value)}
                              placeholder="https://... (.PDF)"
                              className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white text-xs"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-stone-700">EPD Çevresel Beyan Linki</label>
                            <input
                              type="text"
                              value={formData.sectionSettings?.epdUrl || ''}
                              onChange={(e) => updateSectionSetting('epdUrl', e.target.value)}
                              placeholder="https://... (.PDF)"
                              className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SUB-TAB 6: CTA & CONTACT EDIT */}
              {activeContentTab === 'cta' && (
                <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
                    <div>
                      <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                        İletişim & Teklif Çağrısı (CTA)
                      </h3>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Kataloğun altındaki eylem çağrısı şeridi ve alt bilgi (footer) kurumsal iletişim detayları.
                      </p>
                    </div>

                    <label className="inline-flex items-center gap-2 cursor-pointer self-start sm:self-auto bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-200">
                      <input
                        type="checkbox"
                        checked={formData.sectionSettings?.showCta !== false}
                        onChange={(e) => updateSectionSetting('showCta', e.target.checked)}
                        className="rounded text-amber-600 focus:ring-amber-500 h-4 w-4"
                      />
                      <span className="text-xs font-bold text-stone-800">
                        {formData.sectionSettings?.showCta !== false ? 'Bölüm Açık' : 'Bölüm Gizli'}
                      </span>
                    </label>
                  </div>

                  {formData.sectionSettings?.showCta === false ? (
                    <div className="p-6 bg-rose-50/60 rounded-xl border border-rose-200 text-center">
                      <EyeOff size={24} className="mx-auto text-rose-500 mb-2" />
                      <h4 className="text-xs font-bold text-rose-900">Bu Bölüm Katalogda Gösterilmeyecek</h4>
                      <p className="text-[11px] text-rose-600 mt-1 max-w-md mx-auto">
                        Teklif çağrısı şeridi yayında tamamen gizlenecektir.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 animate-in fade-in duration-150">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-stone-700">Teklif Çağrısı Başlığı</label>
                          <input
                            type="text"
                            value={formData.sectionSettings?.ctaTitle || ''}
                            onChange={(e) => updateSectionSetting('ctaTitle', e.target.value)}
                            placeholder="Projeniz için doğru yüzeyi bulun."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs text-stone-900 outline-none focus:border-amber-600 transition"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-stone-700">Buton Metni</label>
                          <input
                            type="text"
                            value={formData.sectionSettings?.ctaButtonText || ''}
                            onChange={(e) => updateSectionSetting('ctaButtonText', e.target.value)}
                            placeholder="Koleksiyonu Keşfet ↗"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs text-stone-900 outline-none focus:border-amber-600 transition"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-stone-700">Teklif Çağrısı Alt Açıklaması</label>
                        <input
                          type="text"
                          value={formData.sectionSettings?.ctaSubtitle || ''}
                          onChange={(e) => updateSectionSetting('ctaSubtitle', e.target.value)}
                          placeholder="Karoları keşfedin, seçeneklerinizi belirleyin ve teklif sürecini başlatın."
                          className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs text-stone-900 outline-none focus:border-amber-600 transition"
                        />
                      </div>

                      <div className="pt-2">
                        <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
                          Kurumsal İletişim Bilgileri (Alt Bilgide Görünür)
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-stone-700">Telefon</label>
                            <input
                              type="text"
                              value={formData.contactPhone || ''}
                              onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                              placeholder="+90 216 000 00 00"
                              className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white text-xs"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-stone-700">E-Posta</label>
                            <input
                              type="email"
                              value={formData.contactEmail || ''}
                              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                              placeholder="proje@marka.com"
                              className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white text-xs"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-stone-700">Showroom / Genel Merkez Adresi</label>
                            <input
                              type="text"
                              value={formData.contactAddress || ''}
                              onChange={(e) => setFormData({ ...formData, contactAddress: e.target.value })}
                              placeholder="Bilecik / İstanbul Showroom"
                              className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white text-xs"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-stone-700">Web Sitesi</label>
                            <input
                              type="text"
                              value={formData.websiteUrl || ''}
                              onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                              placeholder="https://www.marka.com"
                              className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Navigation Actions */}
              <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center sm:justify-between pt-4 pb-16 sm:pb-2 border-t border-stone-200 mt-6">
                <button
                  type="button"
                  onClick={() => setEditorStep(1)}
                  className="btn btn-outline flex items-center justify-center gap-1.5 h-12 text-xs font-bold rounded-xl w-full sm:w-auto sm:px-6"
                >
                  <ArrowLeft size={14} />
                  <span>Şablon Seçimi</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEditorStep(3)}
                  className="btn btn-primary flex items-center justify-center gap-1.5 h-12 text-xs font-bold rounded-xl w-full sm:w-auto sm:px-6"
                >
                  <span>Önizle & Yayınla</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: CANLI ÖNİZLEME & YAYINLAMA */}
          {editorStep === 3 && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-stone-900">
                    Kataloğunuz Canlı Önizlemede
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Aşağıdaki lookbook web yayınınızın birebir canlı önizlemesidir. Kontrol edip 'Yayına Al' butonuna basın.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5 w-full sm:w-auto sm:flex sm:items-center">
                  <button
                    type="button"
                    onClick={() => setEditorStep(2)}
                    className="btn btn-outline flex-1 justify-center h-11 text-xs font-bold rounded-xl"
                  >
                    <Edit size={13} />
                    <span>Bilgileri Düzenle</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSaveCatalog(true)}
                    disabled={saving}
                    className="btn btn-accent flex-1 justify-center h-11 text-xs font-bold rounded-xl"
                  >
                    {saving ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                    <span>Yayına Al & Link Üret</span>
                  </button>
                </div>
              </div>

              {/* Live Lookbook Container */}
              <div className="rounded-2xl border border-stone-300 overflow-hidden shadow-xl">
                <HtmlLookbookViewer
                  catalog={{
                    title: formData.title,
                    coverTitle: formData.title,
                    coverSubtitle: formData.coverSubtitle,
                    introText: formData.introText,
                    template: formData.template,
                    primaryColor: formData.primaryColor,
                    contactPhone: formData.contactPhone,
                    contactEmail: formData.contactEmail,
                    contactAddress: formData.contactAddress,
                    websiteUrl: formData.websiteUrl,
                    sectionSettings: formData.sectionSettings,
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
          SHARE MODAL
      ========================================================================= */}
      {sharingCatalog && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-stone-200 relative animate-in zoom-in-95 duration-150">
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
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                  Katalog Başlığı
                </span>
                <p className="text-sm font-bold text-stone-900">{sharingCatalog.title}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                  Web Bağlantısı (URL)
                </span>
                <div className="flex items-center gap-1.5 p-1 border border-stone-200 rounded-xl bg-stone-50">
                  <input
                    type="text"
                    readOnly
                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/katalog/${sharingCatalog.publicSlug}`}
                    className="w-full bg-transparent text-xs px-2 text-stone-700 outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${window.location.origin}/katalog/${sharingCatalog.publicSlug}`
                      );
                      setLinkCopied(true);
                      setTimeout(() => setLinkCopied(false), 2000);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-stone-900 text-white text-xs font-bold transition flex items-center gap-1 flex-shrink-0"
                  >
                    {linkCopied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    <span>{linkCopied ? 'Kopyalandı' : 'Kopyala'}</span>
                  </button>
                </div>
              </div>

              <div className="pt-2 text-center">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-2">
                  Mobil / Kiosk QR Kodu
                </span>
                <div className="inline-block p-3 bg-white border border-stone-200 rounded-xl shadow-2xs">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                      `${typeof window !== 'undefined' ? window.location.origin : ''}/katalog/${sharingCatalog.publicSlug}`
                    )}`}
                    alt="Katalog QR"
                    className="w-36 h-36 object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          STUDIO GUIDE MODAL (KULLANIM REHBERİ)
      ========================================================================= */}
      {showGuideModal && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowGuideModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-stone-200 relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8f5c29]">
                  Studio Rehberi
                </span>
                <h3 className="text-base font-bold text-stone-900">
                  3 Adımda Lüks Dijital Lookbook Hazırlama
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-800"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs text-stone-600">
              <div className="flex items-start gap-3 p-3 bg-[#f5f6f3] rounded-xl border border-stone-200">
                <span className="w-6 h-6 rounded-full bg-[#202522] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                  1
                </span>
                <div>
                  <strong className="text-stone-900 block text-xs mb-0.5">Şablon ve Renk Harmonisi Seçin</strong>
                  Doğal taş ve mermer için <em>Terra & Traverten</em>, monolitik lüks için <em>Obsidian & Altın</em> veya kentsel projeler için <em>Nordic Loft</em> gibi 6 mimari şablondan birini seçin.
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-[#f5f6f3] rounded-xl border border-stone-200">
                <span className="w-6 h-6 rounded-full bg-[#202522] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                  2
                </span>
                <div>
                  <strong className="text-stone-900 block text-xs mb-0.5">Koleksiyon Başlığı ve Karoları Belirleyin</strong>
                  Koleksiyonunuzun manifesto metnini yazın ve portföyünüzden bu yayında yer almasını istediğiniz seramikleri tek tıkla işaretleyin.
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-[#f5f6f3] rounded-xl border border-stone-200">
                <span className="w-6 h-6 rounded-full bg-[#202522] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                  3
                </span>
                <div>
                  <strong className="text-stone-900 block text-xs mb-0.5">Canlı Önizleyin ve Yayına Alın</strong>
                  Kataloğunuzun ziyaretçilere nasıl görüneceğini masaüstü ve mobilde birebir test edin; tek tıkla benzersiz paylaşılabilir web bağlantısı ve QR kodu üretin.
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="btn btn-primary w-full sm:w-auto"
              >
                Anladım
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
