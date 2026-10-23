'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Printer,
  Share2,
  ArrowLeft,
  Loader2,
  AlertCircle,
  ExternalLink,
  Search,
  QrCode,
  Sparkles,
  X,
  Layers,
  ChevronDown,
  Check,
  Copy,
  Mail,
  MessageCircle,
  RotateCcw,
  Building2,
  User,
  Phone,
  Package,
  Eye,
  CheckCircle2,
  Tag,
  BookOpen,
  ZoomIn,
  ShieldCheck,
  Sliders,
  MapPin,
  Globe,
  ArrowDown,
  ChevronRight,
  Filter,
  CheckSquare,
  Square,
  Palette,
  Heart
} from 'lucide-react';
import CatalogTemplateRenderer from '@/components/brand/catalog/templates/CatalogTemplateRenderer';
import {
  LOOKBOOK_COLOR_TEMPLATES,
  getLookbookTheme
} from '@/components/brand/catalog/templates/lookbookThemes';
import { prepareAndPrintCatalog } from '@/utils/printCatalog';

function LinkedInIcon({ size = 16, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

export default function PublicCatalogViewerPage() {
  const params = useParams();
  const slug = params?.slug;

  const [catalog, setCatalog] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPrinting, setIsPrinting] = useState(false);

  // Active Color Theme (6 Lüks Renk Şablonu)
  const [selectedThemeId, setSelectedThemeId] = useState('terra-traverten');
  const [showThemePicker, setShowThemePicker] = useState(false);
  const themePickerRef = useRef(null);

  // View Mode: 'lookbook' (Mimari Web Şablonu) | 'pages' (A4 Baskı Simülatörü)
  const [viewerMode, setViewerMode] = useState('lookbook');

  // Real-time Filters & Search (Kullanıcı Şablonu Filtreleme Mekanizması)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSize, setSelectedSize] = useState('all');
  const [selectedSurface, setSelectedSurface] = useState('all');
  const searchInputRef = useRef(null);

  // High-Res Texture Zoom Modal
  const [activeDetailProduct, setActiveDetailProduct] = useState(null);

  // Favorites state (localStorage sync)
  const [favorites, setFavorites] = useState({});

  // Toast notification state
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const toastTimeoutRef = useRef(null);

  // Enhanced Share Menu & QR Modal
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const shareMenuRef = useRef(null);

  // B2B Lead Generation Modal (Quote & Sample Request)
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [leadType, setLeadType] = useState('quote'); // 'quote' | 'sample'
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [selectedLeadProducts, setSelectedLeadProducts] = useState([]);
  const [leadForm, setLeadForm] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Toast Helper
  const notify = (msg) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    setShowToast(true);
    toastTimeoutRef.current = setTimeout(() => {
      setShowToast(false);
    }, 3200);
  };

  // Toggle favorite
  const handleToggleFavorite = (p, e) => {
    if (e) e.stopPropagation();
    const key = p.id || p.code || p.name;
    const nextState = !favorites[key];
    const newFavorites = { ...favorites, [key]: nextState };
    setFavorites(newFavorites);
    try {
      localStorage.setItem('seramikbak_catalog_favs', JSON.stringify(newFavorites));
    } catch (_) {}
    notify(nextState ? `"${p.name}" favorilere eklendi.` : `"${p.name}" favorilerden çıkarıldı.`);
  };

  // Load saved favorites
  useEffect(() => {
    try {
      const saved = localStorage.getItem('seramikbak_catalog_favs');
      if (saved) setFavorites(JSON.parse(saved));
    } catch (_) {}
  }, []);

  // Fetch catalog on mount
  useEffect(() => {
    if (slug) {
      fetchCatalog();
    }
  }, [slug]);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target)) {
        setShowShareMenu(false);
      }
      if (themePickerRef.current && !themePickerRef.current.contains(event.target)) {
        setShowThemePicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchCatalog = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/brand/catalogs/public/${slug}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setCatalog(data.catalog);
        setProducts(data.catalog.products || []);
        // Set template if available on catalog
        if (data.catalog.template) {
          setSelectedThemeId(data.catalog.template);
        }
      } else {
        setError(data.error || 'Katalog bulunamadı veya henüz yayına alınmamış.');
      }
    } catch (err) {
      setError('Bağlantı hatası: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = async () => {
    if (isPrinting) return;
    setIsPrinting(true);
    try {
      fetch(`/api/brand/catalogs/public/${slug}?download=true`).catch(() => {});
      await prepareAndPrintCatalog({ stageId: 'seramikbak-catalog-app' });
    } finally {
      setIsPrinting(false);
    }
  };

  // Social Sharing Handlers
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = catalog?.title
    ? `${catalog.title} - ${catalog.brand?.name || 'SeramikBak'}`
    : 'SeramikBak Dijital Mimari Lookbook';

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(currentUrl);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = currentUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      notify('Katalog bağlantısı panoya kopyalandı! ✓');
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Kopyalama hatası:', err);
    }
  };

  const handleWhatsAppShare = () => {
    const text = `${shareTitle}\n${currentUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    setShowShareMenu(false);
  };

  const handleLinkedInShare = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`,
      '_blank'
    );
    setShowShareMenu(false);
  };

  const handleEmailShare = () => {
    const subject = shareTitle;
    const body = `Merhaba,\n\n"${catalog?.title}" dijital seramik ürün kataloğunu aşağıdaki bağlantıdan inceleyebilirsiniz:\n\n${currentUrl}\n\nSeramikBak B2B Dijital Sergi & Katalog Platformu`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    setShowShareMenu(false);
  };

  // Lead Form Submission
  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!leadForm.name.trim() || !leadForm.email.trim() || !leadForm.phone.trim()) {
      setSubmitError('Lütfen ad, e-posta ve telefon alanlarını doldurunuz.');
      return;
    }

    setIsSubmittingLead(true);
    try {
      const res = await fetch('/api/brand/catalogs/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          catalogId: catalog.id,
          brandId: catalog.brandId,
          type: leadType,
          name: leadForm.name,
          company: leadForm.company,
          email: leadForm.email,
          phone: leadForm.phone,
          message: leadForm.message,
          requestedProducts: selectedLeadProducts
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setLeadSubmitted(true);
        notify(
          leadType === 'sample'
            ? 'Numune talebiniz üretici markaya iletildi!'
            : 'Fiyat teklifi talebiniz başarıyla alındı!'
        );
      } else {
        setSubmitError(data.error || 'Talep gönderilemedi. Lütfen tekrar deneyiniz.');
      }
    } catch (err) {
      setSubmitError('Bağlantı hatası: ' + err.message);
    } finally {
      setIsSubmittingLead(false);
    }
  };

  // Active theme object & variables
  const currentTheme = useMemo(() => {
    return getLookbookTheme(selectedThemeId);
  }, [selectedThemeId]);

  // Derived filter options from actual products in catalog
  const sizeOptions = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      if (p.width && p.height) {
        set.add(`${p.width}x${p.height}`);
      } else if (p.size) {
        set.add(p.size.replace(/\s+/g, '').toLowerCase());
      }
    });
    return Array.from(set);
  }, [products]);

  const surfaceOptions = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      const val = (p.finish || p.surface || '').toLowerCase();
      if (val.includes('lappato') || val.includes('lapato')) set.add('lapato');
      else if (val.includes('parlak') || val.includes('glossy') || val.includes('polish')) set.add('parlak');
      else if (val.includes('mat') || val.includes('matte')) set.add('mat');
    });
    return Array.from(set);
  }, [products]);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLocaleLowerCase('tr').trim();
    return products.filter((p) => {
      const name = (p.name || '').toLocaleLowerCase('tr');
      const code = (p.code || '').toLocaleLowerCase('tr');
      const matchesSearch = !q || name.includes(q) || code.includes(q);

      // Size match
      let matchesSize = true;
      if (selectedSize !== 'all') {
        const pSize = p.width && p.height
          ? `${p.width}x${p.height}`
          : (p.size || '').replace(/\s+/g, '').toLowerCase();
        matchesSize = pSize.includes(selectedSize.replace(/\s+/g, '').toLowerCase());
      }

      // Surface match
      let matchesSurface = true;
      if (selectedSurface !== 'all') {
        const finish = (p.finish || p.surface || '').toLowerCase();
        if (selectedSurface === 'lapato') {
          matchesSurface = finish.includes('lappato') || finish.includes('lapato');
        } else if (selectedSurface === 'parlak') {
          matchesSurface = finish.includes('parlak') || finish.includes('glossy') || finish.includes('polish');
        } else if (selectedSurface === 'mat') {
          matchesSurface = finish.includes('mat') || finish.includes('matte');
        }
      }

      return matchesSearch && matchesSize && matchesSurface;
    });
  }, [products, searchQuery, selectedSize, selectedSurface]);

  // Helper to open lead modal for a specific product
  const handleOpenLeadForProduct = (product, type = 'quote') => {
    if (product) {
      setSelectedLeadProducts([product.name || product.code || 'Seramik Ürün']);
    }
    setLeadType(type);
    setLeadSubmitted(false);
    setShowLeadModal(true);
  };

  // Helper to label product finish / type
  const getProductLabel = (p) => {
    const finish = (p.finish || p.surface || '').toLowerCase();
    const name = (p.name || '').toLowerCase();
    if (finish.includes('lappato')) return 'Full Lappato';
    if (name.includes('ahşap') || name.includes('meşe') || name.includes('ceviz')) return 'Ahşap etkisi';
    if (name.includes('mermer') || name.includes('zenith')) return 'Mermer etkisi';
    if (finish.includes('parlak')) return 'Parlak yüzey';
    if (finish.includes('mat')) return 'Doğal doku';
    return 'Mimari karo';
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f5f0] flex flex-col items-center justify-center p-6 text-stone-900 font-sans">
        <div className="w-12 h-12 rounded-full bg-white border border-stone-200 shadow-sm flex items-center justify-center mb-4">
          <Loader2 size={24} className="animate-spin text-[#a87943]" />
        </div>
        <p className="text-xs font-mono font-semibold tracking-widest text-stone-600 uppercase">
          Katalog Hazırlanıyor...
        </p>
      </div>
    );
  }

  // Error State
  if (error || !catalog) {
    return (
      <div className="min-h-screen bg-[#f7f5f0] flex flex-col items-center justify-center p-6 text-stone-900 text-center font-sans">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mb-4 shadow-sm">
          <AlertCircle size={28} />
        </div>
        <h1 className="text-xl font-bold mb-2 tracking-tight">Katalog Görüntülenemedi</h1>
        <p className="text-xs text-stone-500 max-w-sm mb-6 leading-relaxed">
          {error || 'İstenen dijital katalog bulunamadı veya henüz yayına alınmamış olabilir.'}
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchCatalog}
            className="px-4 py-2 rounded-md bg-[#a87943] text-white text-xs font-bold shadow-sm transition hover:brightness-95 flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw size={13} />
            <span>Tekrar Dene</span>
          </button>
          <Link
            href="/"
            className="px-4 py-2 rounded-md bg-white border border-stone-200 text-stone-700 text-xs font-bold transition hover:bg-stone-50"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    );
  }

  const brand = catalog.brand || {};
  const brandName = brand.name || 'Bien Seramik';
  const coverImage =
    catalog.customCoverUrl ||
    catalog.coverImageUrl ||
    (products.length > 0 && (products[0].imageUrl || products[0].textureUrl)) ||
    '/renders/luxury_bathroom_calacatta_gold.jpg';

  const year = new Date().getFullYear();

  return (
    <main
      id="seramikbak-catalog-app"
      className="app"
      style={currentTheme.vars}
    >
      {/* =========================================================================
          EXACT CSS EMBEDDED FROM USER'S ATTACHED DESIGN FILE
      ========================================================================= */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;750;800&display=swap');

        * {
          box-sizing: border-box;
        }
        html {
          scroll-behavior: smooth;
        }
        body {
          margin: 0;
          font-family: var(--site-font-body, Inter, sans-serif);
          font-size: 14px;
          background-color: var(--site-background, #f7f5f0);
          color: var(--ink, #242824);
        }
        button, input, select {
          font: inherit;
        }
        button {
          cursor: pointer;
        }

        .app {
          min-height: 100vh;
          background-color: var(--site-background);
          color: var(--site-on-background);
          border-radius: 0;
          transition: background-color .3s, color .3s;
        }

        .topline {
          height: 34px;
          border-bottom: 1px solid var(--line);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 5.5%;
          font-size: 11px;
          color: var(--muted);
          letter-spacing: .04em;
          background-color: var(--site-background);
        }
        .topline strong {
          color: var(--ink);
          letter-spacing: .12em;
        }

        .nav {
          height: 76px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 5.5%;
          background: var(--paper);
          border-bottom: 1px solid var(--line);
          gap: 24px;
          position: sticky;
          top: 0;
          z-index: 40;
          transition: background-color .3s, border-color .3s;
        }
        .brand {
          font-size: 22px;
          font-weight: 750;
          letter-spacing: -.07em;
          white-space: nowrap;
          color: var(--ink);
          text-decoration: none;
        }
        .brand span {
          color: var(--accent);
        }
        .navlinks {
          display: flex;
          gap: 27px;
          color: var(--muted);
          font-size: 12px;
          align-items: center;
        }
        .navlinks a {
          text-decoration: none;
          color: inherit;
          transition: color .2s;
        }
        .navlinks a:hover {
          color: var(--accent);
        }
        .navright {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .iconbtn {
          background: transparent;
          border: 1px solid var(--line);
          width: 38px;
          height: 38px;
          border-radius: 50%;
          color: var(--ink);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all .2s;
        }
        .iconbtn:hover {
          border-color: var(--accent);
          color: var(--accent);
        }
        .outlinebtn, .primarybtn {
          padding: 12px 17px;
          border-radius: 3px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: .04em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all .2s;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          text-decoration: none;
        }
        .outlinebtn {
          border: 1px solid var(--line);
          background: transparent;
          color: var(--ink);
        }
        .outlinebtn:hover {
          border-color: var(--accent);
          color: var(--accent);
        }
        .primarybtn {
          border: 1px solid var(--accent);
          background: var(--accent);
          color: var(--site-on-primary, #ffffff);
        }
        .primarybtn:hover {
          filter: brightness(.94);
        }

        .hero {
          background: var(--hero-bg, #262a27);
          color: var(--hero-text, #f8f5ef);
          min-height: 510px;
          display: grid;
          grid-template-columns: 1.1fr .9fr;
          position: relative;
          overflow: hidden;
          transition: background-color .3s;
        }
        .hero-copy {
          padding: 78px 0 68px 9%;
          position: relative;
          z-index: 2;
        }
        .eyebrow {
          font-size: 10px;
          letter-spacing: .24em;
          text-transform: uppercase;
          color: var(--hero-eyebrow, #c7a77c);
          font-weight: 700;
        }
        .hero h1 {
          font-family: var(--site-font-heading, Georgia, serif);
          font-weight: 400;
          font-size: clamp(44px, 5.2vw, 74px);
          line-height: 1.04;
          letter-spacing: -.045em;
          max-width: 670px;
          margin: 24px 0 22px;
          color: var(--hero-text, #f8f5ef);
        }
        .hero h1 em {
          color: var(--hero-em, #c4a47a);
          font-style: italic;
          font-weight: 400;
        }
        .hero p {
          max-width: 480px;
          color: #c8c9c2;
          font-size: 15px;
          line-height: 1.8;
          margin: 0 0 30px;
        }
        .hero-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        .hero .primarybtn {
          padding: 15px 22px;
        }
        .hero .outlinebtn {
          border-color: #77786f;
          color: #f5f0e8;
        }
        .hero-meta {
          display: flex;
          gap: 30px;
          margin-top: 42px;
          color: #b9b9b1;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: .12em;
        }
        .hero-meta strong {
          display: block;
          color: #f7f3eb;
          font-size: 13px;
          letter-spacing: 0;
          margin-bottom: 5px;
        }
        .hero-visual {
          position: relative;
          min-height: 440px;
          overflow: hidden;
        }
        .hero-visual:before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, var(--hero-bg, #262a27) 0%, rgba(38,42,39,.12) 45%, rgba(38,42,39,.06) 100%);
          z-index: 1;
        }
        .hero-visual img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          position: absolute;
          inset: 0;
          filter: brightness(.78) saturate(.85);
        }
        .hero-stamp {
          position: absolute;
          z-index: 2;
          right: 9%;
          bottom: 38px;
          border: 1px solid var(--hero-stamp-border, rgba(255, 255, 255, .45));
          padding: 18px 20px;
          background: var(--hero-stamp-bg, rgba(30, 33, 30, .62));
          backdrop-filter: blur(8px);
          max-width: 230px;
        }
        .hero-stamp span {
          display: block;
          color: var(--hero-eyebrow, #d6b78d);
          font-size: 9px;
          letter-spacing: .18em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .hero-stamp strong {
          font-family: var(--site-font-heading, Georgia, serif);
          font-size: 20px;
          font-weight: 400;
          line-height: 1.2;
          color: #ffffff;
        }

        .section {
          padding: 76px 7%;
        }
        .section-head {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 30px;
        }
        .section-kicker {
          font-size: 10px;
          letter-spacing: .2em;
          text-transform: uppercase;
          color: var(--accent);
          font-weight: 750;
        }
        .section h2 {
          font-family: var(--site-font-heading, Georgia, serif);
          font-weight: 400;
          font-size: clamp(32px, 3.4vw, 47px);
          letter-spacing: -.035em;
          margin: 10px 0 0;
          line-height: 1.1;
          color: var(--ink);
        }
        .section-intro {
          max-width: 480px;
          color: var(--muted);
          line-height: 1.7;
          margin: 13px 0 0;
        }
        .textlink {
          color: var(--ink);
          font-size: 11px;
          font-weight: 700;
          text-decoration: none;
          border-bottom: 1px solid var(--accent);
          padding-bottom: 7px;
          white-space: nowrap;
          cursor: pointer;
        }

        .collection-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 17px 0;
          border-top: 1px solid var(--line);
          border-bottom: 1px solid var(--line);
          gap: 15px;
          margin-bottom: 25px;
        }
        .collection-bar .meta {
          display: flex;
          gap: 26px;
          flex-wrap: wrap;
          color: var(--muted);
          font-size: 11px;
        }
        .collection-bar .meta strong {
          color: var(--ink);
          font-weight: 650;
          margin-right: 5px;
        }

        .filterrow {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 26px;
        }
        .search {
          flex: 1;
          min-width: 190px;
          position: relative;
        }
        .search input {
          width: 100%;
          padding: 13px 15px;
          border: 1px solid var(--line);
          background: var(--paper);
          outline: none;
          color: var(--ink);
          border-radius: 2px;
          font-size: 13px;
          transition: border-color .2s;
        }
        .search input:focus {
          border-color: var(--accent);
        }
        .filterrow select {
          padding: 13px 32px 13px 13px;
          border: 1px solid var(--line);
          background: var(--paper);
          color: var(--ink);
          border-radius: 2px;
          min-width: 140px;
          font-size: 13px;
          outline: none;
          cursor: pointer;
          transition: border-color .2s;
        }
        .filterrow select:focus {
          border-color: var(--accent);
        }
        .filter-count {
          margin-left: auto;
          font-size: 11px;
          color: var(--muted);
          font-weight: 600;
        }

        .products {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 28px 18px;
        }
        .product {
          background: var(--paper);
          border: 1px solid var(--line);
          min-width: 0;
          transition: transform .25s, border-color .25s, box-shadow .25s;
          display: flex;
          flex-direction: column;
        }
        .product:hover {
          transform: translateY(-4px);
          border-color: var(--product-hover-border, #c5b49a);
          box-shadow: 0 10px 24px -10px rgba(0,0,0,0.08);
        }
        .product-img {
          aspect-ratio: 1.13;
          background: var(--product-img-bg, #ece9e3);
          overflow: hidden;
          position: relative;
        }
        .product-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform .5s ease;
        }
        .product:hover .product-img img {
          transform: scale(1.035);
        }
        .product-label {
          position: absolute;
          left: 12px;
          top: 12px;
          background: var(--paper, #fffefa);
          color: var(--ink);
          font-size: 9px;
          padding: 6px 8px;
          letter-spacing: .1em;
          text-transform: uppercase;
          border: 1px solid var(--line);
          box-shadow: 0 2px 6px rgba(0,0,0,0.04);
          z-index: 2;
        }
        .fav {
          position: absolute;
          right: 12px;
          top: 10px;
          background: var(--paper, #fffefa);
          border: 1px solid var(--line);
          width: 30px;
          height: 30px;
          border-radius: 50%;
          font-size: 16px;
          color: #666;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all .2s;
          z-index: 2;
          box-shadow: 0 2px 6px rgba(0,0,0,0.04);
        }
        .fav:hover {
          transform: scale(1.1);
        }
        .product-info {
          padding: 16px 15px 14px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .product-series {
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: .13em;
          color: var(--accent);
          margin-bottom: 7px;
          font-weight: 700;
        }
        .product h3 {
          font-family: var(--site-font-heading, Georgia, serif);
          font-weight: 400;
          font-size: 21px;
          margin: 0 0 9px;
          line-height: 1.15;
          color: var(--ink);
        }
        .specs {
          font-size: 11px;
          color: var(--muted);
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .specs span+span:before {
          content: "·";
          margin-right: 8px;
          color: var(--accent);
        }
        .product-actions {
          display: flex;
          border-top: 1px solid var(--line);
          margin-top: 15px;
        }
        .product-actions button, .product-actions a {
          flex: 1;
          padding: 12px 6px;
          border: 0;
          background: transparent;
          color: var(--ink);
          font-size: 10px;
          font-weight: 700;
          cursor: pointer;
          transition: all .2s;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-align: center;
        }
        .product-actions button+button, .product-actions a+button {
          border-left: 1px solid var(--line);
          color: var(--site-on-primary, #ffffff);
          background: var(--accent);
        }
        .product-actions button:hover, .product-actions a:hover {
          filter: brightness(.94);
        }

        .empty {
          padding: 45px;
          text-align: center;
          border: 1px dashed var(--line);
          color: var(--muted);
          grid-column: 1/-1;
          background: var(--paper);
        }

        .editorial {
          background: var(--editorial-bg, #eeece5);
          transition: background-color .3s;
        }
        .editorial-grid {
          display: grid;
          grid-template-columns: 1.12fr .88fr;
          gap: 5%;
          align-items: center;
        }
        .editorial-photo {
          position: relative;
          min-height: 500px;
          overflow: hidden;
        }
        .editorial-photo img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .photo-caption {
          position: absolute;
          left: 22px;
          bottom: 22px;
          background: var(--editorial-caption-bg, rgba(31,34,30,.84));
          color: #fff;
          padding: 13px 16px;
          font-size: 10px;
          letter-spacing: .1em;
          text-transform: uppercase;
        }
        .editorial-copy {
          padding: 20px 0;
        }
        .editorial-copy h2 {
          font-family: var(--site-font-heading, Georgia, serif);
          font-weight: 400;
          font-size: clamp(35px, 4vw, 56px);
          line-height: 1.1;
          color: var(--ink);
          margin: 10px 0 16px;
        }
        .editorial-copy p {
          line-height: 1.9;
          color: var(--muted);
          max-width: 440px;
        }
        .editorial-list {
          margin: 28px 0 30px;
          border-top: 1px solid var(--line);
        }
        .editorial-list div {
          display: flex;
          justify-content: space-between;
          padding: 14px 0;
          border-bottom: 1px solid var(--line);
          font-size: 12px;
          color: var(--ink);
        }
        .editorial-list span {
          color: var(--muted);
        }

        .technical {
          background: var(--paper);
          transition: background-color .3s;
        }
        .tech-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-top: 32px;
        }
        .tech-card {
          border: 1px solid var(--line);
          padding: 24px;
          background: var(--paper);
          transition: border-color .2s, transform .2s;
        }
        .tech-card:hover {
          border-color: var(--accent);
          transform: translateY(-2px);
        }
        .tech-card small {
          font-size: 9px;
          letter-spacing: .16em;
          text-transform: uppercase;
          color: var(--accent);
          font-weight: 700;
        }
        .tech-card h3 {
          font-family: var(--site-font-heading, Georgia, serif);
          font-size: 22px;
          font-weight: 400;
          margin: 12px 0 8px;
          color: var(--ink);
        }
        .tech-card p {
          color: var(--muted);
          font-size: 12px;
          line-height: 1.7;
          margin: 0;
        }

        .cta {
          margin: 0 7% 70px;
          padding: 42px 48px;
          background: var(--cta-bg, #282d29);
          color: var(--cta-text, #ffffff);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 28px;
          transition: background-color .3s;
        }
        .cta h2 {
          font-family: var(--site-font-heading, Georgia, serif);
          font-size: clamp(28px, 3vw, 40px);
          font-weight: 400;
          margin: 0 0 9px;
        }
        .cta p {
          color: #c2c4bb;
          margin: 0;
          line-height: 1.7;
          font-size: 12px;
        }

        .footer {
          padding: 28px 7%;
          border-top: 1px solid var(--line);
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: var(--muted);
          font-size: 10px;
          gap: 20px;
          background: var(--site-background);
        }

        .toast {
          position: fixed;
          bottom: 22px;
          left: 50%;
          transform: translate(-50%, 20px);
          background: var(--hero-bg, #262a27);
          color: #ffffff;
          padding: 14px 22px;
          z-index: 80;
          opacity: 0;
          pointer-events: none;
          transition: all .25s ease;
          font-size: 12px;
          box-shadow: 0 12px 30px rgba(0,0,0,0.25);
          border-radius: 4px;
          border: 1px solid rgba(255,255,255,0.15);
        }
        .toast.show {
          opacity: 1;
          transform: translate(-50%, 0);
          pointer-events: auto;
        }

        .mobile-menu {
          display: none;
        }

        @media(max-width:1000px) {
          .navlinks { gap: 14px; }
          .hero { grid-template-columns: 1fr .72fr; }
          .hero-copy { padding-left: 6%; }
          .products { grid-template-columns: repeat(3, minmax(0, 1fr)); }
          .section { padding: 60px 5%; }
          .editorial-grid { gap: 4%; }
          .editorial-photo { min-height: 420px; }
        }
        @media(max-width:700px) {
          .topline { padding: 0 5%; font-size: 9px; }
          .nav { height: 64px; padding: 0 5%; }
          .navlinks { display: none; }
          .navright .outlinebtn { display: none; }
          .mobile-menu { display: inline-flex; }
          .hero { display: flex; flex-direction: column; }
          .hero-copy { padding: 52px 6% 30px; }
          .hero h1 { font-size: 42px; margin: 18px 0; }
          .hero p { font-size: 13px; }
          .hero-meta { gap: 20px; margin-top: 28px; }
          .hero-visual { min-height: 260px; }
          .hero-visual:before { background: linear-gradient(180deg, var(--hero-bg, #262a27) 0%, rgba(38,42,39,.08) 45%); }
          .hero-stamp { right: 6%; bottom: 18px; }
          .section { padding: 50px 5%; }
          .section-head { align-items: flex-start; flex-direction: column; margin-bottom: 24px; }
          .section h2 { font-size: 32px; }
          .collection-bar { align-items: flex-start; flex-direction: column; }
          .collection-bar .meta { gap: 12px; }
          .filterrow select { flex: 1; min-width: calc(50% - 6px); }
          .search { flex-basis: 100%; }
          .filter-count { width: 100%; margin: 0; }
          .products { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px 10px; }
          .product-info { padding: 12px 10px; }
          .product h3 { font-size: 17px; }
          .product-label { left: 7px; top: 7px; font-size: 8px; }
          .fav { right: 7px; top: 7px; }
          .product-actions button, .product-actions a { font-size: 9px; padding: 11px 3px; }
          .editorial-grid { grid-template-columns: 1fr; gap: 28px; }
          .editorial-photo { min-height: 300px; }
          .editorial-copy { padding: 0; }
          .tech-grid { grid-template-columns: 1fr; }
          .cta { margin: 0 5% 40px; padding: 30px 24px; align-items: flex-start; flex-direction: column; }
          .footer { padding: 24px 5%; flex-direction: column; align-items: flex-start; }
          .hero-actions .primarybtn, .hero-actions .outlinebtn { font-size: 10px; }
        }
        @media(max-width:380px) {
          .products { grid-template-columns: 1fr; }
          .product-img { aspect-ratio: 1.35; }
          .hero h1 { font-size: 36px; }
        }

        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          .nav, .topline, .hero-actions, .filterrow, .cta, .toast, .no-print {
            display: none !important;
          }
          body, .app {
            background-color: #ffffff !important;
            color: #000000 !important;
          }
        }
      `}</style>

      {/* =========================================================================
          TOPLINE
      ========================================================================= */}
      <div className="topline">
        <span>
          SeramikBak <span style={{ padding: '0 8px' }}>/</span> Mimari Koleksiyonlar
        </span>
        <strong>ÜRÜNÜ KEŞFET · MEKÂNINDA DENE · TEKLİF AL</strong>
      </div>

      {/* =========================================================================
          NAVBAR
      ========================================================================= */}
      <nav className="nav">
        <div className="flex items-center gap-3">
          <Link href="/" className="brand" title="SeramikBak">
            Seramik<span>Bak</span>
          </Link>
          <span style={{ fontSize: '10px', letterSpacing: '.08em', color: 'var(--muted)', fontWeight: 600 }}>
            MİMARİ KATALOG
          </span>
        </div>

        <div className="navlinks">
          <a href="#koleksiyon">Koleksiyon</a>
          <a href="#urunler">Ürünler</a>
          <a href="#mekanlar">Mekân İlhamı</a>
          <a href="#teknik">Teknik Bilgiler</a>
        </div>

        <div className="navright">
          {/* Quick Search Focus */}
          <button
            type="button"
            className="iconbtn"
            aria-label="Ara"
            onClick={() => searchInputRef.current?.focus()}
            title="Ürün Ara"
          >
            <Search size={15} />
          </button>

          {/* COLOR THEME SELECTOR DROPDOWN (Farklı Renklerde Şablonlar) */}
          <div className="relative" ref={themePickerRef}>
            <button
              type="button"
              onClick={() => setShowThemePicker(!showThemePicker)}
              className="outlinebtn flex items-center gap-1.5"
              title="Şablon Rengini Değiştir"
              style={{ fontSize: '10px' }}
            >
              <Palette size={13} style={{ color: 'var(--accent)' }} />
              <span className="hidden sm:inline">{currentTheme.name.split(' ')[0]}</span>
              <ChevronDown size={11} />
            </button>

            {showThemePicker && (
              <div
                className="absolute right-0 mt-2 w-72 rounded-lg bg-[var(--paper)] border border-[var(--line)] shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                style={{ backgroundColor: 'var(--paper)', borderColor: 'var(--line)' }}
              >
                <div className="px-3 py-2 border-b border-[var(--line)] mb-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">
                    Şablon Renk Paleti Seçin
                  </p>
                  <p className="text-[11px] text-[var(--muted)]">
                    Kataloğu farklı renk ve atmosfer şablonlarında görüntüleyin.
                  </p>
                </div>

                <div className="space-y-1">
                  {LOOKBOOK_COLOR_TEMPLATES.map((tmpl) => {
                    const isCurrent = selectedThemeId === tmpl.id;
                    return (
                      <button
                        key={tmpl.id}
                        type="button"
                        onClick={() => {
                          setSelectedThemeId(tmpl.id);
                          setShowThemePicker(false);
                          notify(`"${tmpl.name}" şablonu uygulandı.`);
                        }}
                        className={`w-full px-3 py-2 rounded text-left flex items-center justify-between text-xs transition cursor-pointer ${
                          isCurrent
                            ? 'bg-[var(--accent-light)] font-bold text-[var(--ink)]'
                            : 'hover:bg-black/5 text-[var(--ink)]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {/* Color Swatch Circle */}
                          <div
                            className="w-4 h-4 rounded-full border border-stone-300 shadow-2xs flex-shrink-0"
                            style={{ backgroundColor: tmpl.colorSample.primary }}
                          />
                          <div className="min-w-0">
                            <span className="block text-xs truncate leading-tight">{tmpl.name}</span>
                            <span className="text-[9px] text-[var(--muted)] block truncate">{tmpl.tag}</span>
                          </div>
                        </div>
                        {isCurrent && <Check size={14} style={{ color: 'var(--accent)' }} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Social Share Dropdown */}
          <div className="relative" ref={shareMenuRef}>
            <button
              type="button"
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="iconbtn"
              aria-label="Paylaş"
              title="Kataloğu Paylaş"
            >
              <Share2 size={15} />
            </button>

            {showShareMenu && (
              <div
                className="absolute right-0 mt-2 w-56 rounded-lg bg-[var(--paper)] border border-[var(--line)] shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                style={{ backgroundColor: 'var(--paper)', borderColor: 'var(--line)' }}
              >
                <div className="px-3 py-2 border-b border-[var(--line)] mb-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink)]">
                    Kataloğu Paylaş
                  </p>
                  <p className="text-[10px] text-[var(--muted)] truncate">{catalog.title}</p>
                </div>

                <button
                  type="button"
                  onClick={handleWhatsAppShare}
                  className="w-full px-3 py-2 rounded hover:bg-black/5 text-xs text-left flex items-center gap-2.5 text-[var(--ink)] transition cursor-pointer"
                >
                  <MessageCircle size={14} className="text-emerald-600" />
                  <span>WhatsApp ile Paylaş</span>
                </button>

                <button
                  type="button"
                  onClick={handleLinkedInShare}
                  className="w-full px-3 py-2 rounded hover:bg-black/5 text-xs text-left flex items-center gap-2.5 text-[var(--ink)] transition cursor-pointer"
                >
                  <LinkedInIcon size={14} className="text-blue-600" />
                  <span>LinkedIn'de Paylaş</span>
                </button>

                <button
                  type="button"
                  onClick={handleEmailShare}
                  className="w-full px-3 py-2 rounded hover:bg-black/5 text-xs text-left flex items-center gap-2.5 text-[var(--ink)] transition cursor-pointer"
                >
                  <Mail size={14} style={{ color: 'var(--accent)' }} />
                  <span>E-posta ile Gönder</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowQrModal(true);
                    setShowShareMenu(false);
                  }}
                  className="w-full px-3 py-2 rounded hover:bg-black/5 text-xs text-left flex items-center gap-2.5 text-[var(--ink)] transition cursor-pointer"
                >
                  <QrCode size={14} />
                  <span>QR Kodu Göster</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="w-full px-3 py-2 rounded hover:bg-black/5 text-xs text-left flex items-center gap-2.5 text-[var(--ink)] transition cursor-pointer"
                >
                  {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  <span>{copied ? 'Kopyalandı! ✓' : 'Bağlantıyı Kopyala'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Download PDF button */}
          <button
            type="button"
            className="outlinebtn"
            onClick={handlePrint}
            disabled={isPrinting}
            title="Kataloğu PDF Olarak İndir"
          >
            {isPrinting ? <Loader2 size={13} className="animate-spin" /> : null}
            <span>Kataloğu İndir ↗</span>
          </button>

          {/* Mobile menu shortcut */}
          <button
            type="button"
            className="mobile-menu iconbtn"
            onClick={() => {
              document.getElementById('urunler')?.scrollIntoView({ behavior: 'smooth' });
            }}
            aria-label="Ürünlere git"
          >
            ☰
          </button>
        </div>
      </nav>

      {/* =========================================================================
          HERO SECTION (#koleksiyon)
      ========================================================================= */}
      <header className="hero" id="koleksiyon">
        <div className="hero-copy">
          <div className="eyebrow">{brandName} · {catalog.title}</div>
          <h1>
            Yüzeylerde<br />
            <em>zamansız</em> bir ifade.
          </h1>
          <p>
            {catalog.introText ||
              catalog.description ||
              'Doğal taşın karakteri, mermerin zarafeti ve çağdaş mimarinin yalın çizgileri. Mekânlara değer katan yüzeyleri keşfedin.'}
          </p>
          <div className="hero-actions">
            <button
              type="button"
              className="primarybtn"
              onClick={() => {
                document.getElementById('urunler')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Koleksiyonu keşfet&nbsp; ↘
            </button>
            <button
              type="button"
              className="outlinebtn"
              onClick={() => {
                document.getElementById('mekanlar')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Mekân ilhamı
            </button>
          </div>
          <div className="hero-meta">
            <div>
              <strong>{year}</strong>Yeni koleksiyon
            </div>
            <div>
              <strong>{products.length} seçili yüzey</strong>Örnek ürünler
            </div>
            <div>
              <strong>Mimari seçki</strong>İç ve dış mekân
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <img
            src={coverImage}
            alt={catalog.title}
          />
          <div className="hero-stamp">
            <span>Malzemenin dili</span>
            <strong>
              Doğadan ilham.<br />
              Mimariyle hayat bulur.
            </strong>
          </div>
        </div>
      </header>

      {/* =========================================================================
          PRODUCTS SECTION (#urunler)
      ========================================================================= */}
      <section className="section" id="urunler">
        <div className="section-head">
          <div>
            <div className="section-kicker">Koleksiyondan seçkiler</div>
            <h2>Yüzeyleri yakından tanıyın.</h2>
            <p className="section-intro">
              Her yüzeyin kendine özgü dokusunu, ölçüsünü ve karakterini keşfedin. Size uygun ürünü filtreleyerek kolayca bulun.
            </p>
          </div>
          <a className="textlink" href="#teknik">
            Teknik özellikleri incele&nbsp; ↗
          </a>
        </div>

        {/* Collection Bar */}
        <div className="collection-bar">
          <div className="meta">
            <span>
              <strong>Marka</strong> {brandName}
            </span>
            <span>
              <strong>Koleksiyon</strong> {catalog.title}
            </span>
            <span>
              <strong>Seçki</strong> {products.length} ürün
            </span>
          </div>
          <span style={{ fontSize: '10px', color: 'var(--muted)' }}>
            Doğrulanmış Üretici Verisi &bull; TS EN 14411 Standartları
          </span>
        </div>

        {/* Filter Row */}
        <div className="filterrow">
          <div className="search">
            <input
              ref={searchInputRef}
              id="search"
              type="search"
              placeholder="Ürün adı veya koduyla ara…"
              aria-label="Ürün ara"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            id="sizeFilter"
            aria-label="Ebat filtrele"
            value={selectedSize}
            onChange={(e) => setSelectedSize(e.target.value)}
          >
            <option value="all">Tüm ebatlar</option>
            {sizeOptions.map((s) => (
              <option key={s} value={s}>
                {s.replace('x', ' × ')} cm
              </option>
            ))}
          </select>

          <select
            id="surfaceFilter"
            aria-label="Yüzey filtrele"
            value={selectedSurface}
            onChange={(e) => setSelectedSurface(e.target.value)}
          >
            <option value="all">Tüm yüzeyler</option>
            <option value="mat">Mat</option>
            <option value="parlak">Parlak</option>
            <option value="lapato">Full Lappato</option>
          </select>

          <span className="filter-count" id="resultCount">
            {filteredProducts.length} ürün gösteriliyor
          </span>
        </div>

        {/* Product Cards Grid */}
        <div className="products" id="products">
          {filteredProducts.map((p) => {
            const key = p.id || p.code || p.name;
            const isFav = !!favorites[key];
            const pImage =
              p.imageUrl ||
              p.textureUrl ||
              '/renders/luxury_bathroom_calacatta_gold.jpg';
            const dimension =
              p.width && p.height
                ? `${p.width} × ${p.height} cm`
                : p.size || 'Standart Ebat';
            const finish = p.finish || (p.surface === 'lapato' ? 'Full Lappato' : p.surface === 'mat' ? 'Mat' : 'Parlak');
            const label = getProductLabel(p);

            return (
              <article
                key={key}
                className="product"
                data-name={p.name}
                data-code={p.code}
                data-size={dimension}
                data-surface={finish}
              >
                <div className="product-img">
                  <img src={pImage} alt={p.name} />
                  <span className="product-label">{label}</span>
                  <button
                    type="button"
                    className="fav"
                    aria-label="Favorilere ekle"
                    onClick={(e) => handleToggleFavorite(p, e)}
                    style={{ color: isFav ? 'var(--accent)' : '#444' }}
                    title={isFav ? 'Favorilerden çıkar' : 'Favorilere ekle'}
                  >
                    {isFav ? '♥' : '♡'}
                  </button>
                </div>

                <div className="product-info">
                  <div className="product-series">{brandName} · Mimari seçki</div>
                  <h3>{p.name}</h3>
                  <div className="specs">
                    <span>{dimension}</span>
                    <span>{finish}</span>
                    {p.code && <span>Kod: {p.code}</span>}
                  </div>

                  <div className="product-actions">
                    <button
                      type="button"
                      onClick={() => setActiveDetailProduct(p)}
                      title="4K Doku Detayını İncele"
                    >
                      Detayları gör ↗
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenLeadForProduct(p, 'quote')}
                      title="Fiyat Teklifi & Numune İste"
                    >
                      Teklif al&nbsp; +
                    </button>
                  </div>

                  {/* 3D Mekanda Gör Direct Link */}
                  {p.slug && (
                    <div className="pt-2 text-center border-t border-[var(--line)] mt-2">
                      <Link
                        href={`/mekan-dene?product=${p.slug}`}
                        className="text-[10px] font-semibold text-[var(--accent)] hover:underline inline-flex items-center gap-1"
                      >
                        <Sparkles size={11} />
                        <span>Mekânında Gör (3D) ↗</span>
                      </Link>
                    </div>
                  )}
                </div>
              </article>
            );
          })}

          {filteredProducts.length === 0 && (
            <div className="empty" id="empty">
              Aramanızla eşleşen ürün bulunamadı. Filtreleri değiştirip tekrar deneyin.
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          EDITORIAL SECTION (#mekanlar)
      ========================================================================= */}
      <section className="section editorial" id="mekanlar">
        <div className="editorial-grid">
          <div className="editorial-photo">
            <img
              src="/renders/modern_living_natural_oak.jpg"
              alt="Mekânda hayat bulan yüzeyler"
            />
            <div className="photo-caption">Mekânlardan ilham alın · {year}</div>
          </div>

          <div className="editorial-copy">
            <div className="section-kicker">Mekânda hayat bulan yüzeyler</div>
            <h2>
              Bir yüzeyden<br />
              daha fazlası.
            </h2>
            <p>
              Doğru yüzey, mekânın ışığını, ölçüsünü ve karakterini değiştirir. Koleksiyonu yalnızca ürün olarak değil, yaşam alanınızın bir parçası olarak keşfedin.
            </p>

            <div className="editorial-list">
              <div>
                <strong>01 &nbsp; Banyo ve spa</strong>
                <span>Doğal dinginlik ↗</span>
              </div>
              <div>
                <strong>02 &nbsp; Yaşam alanları</strong>
                <span>Sade mimari ↗</span>
              </div>
              <div>
                <strong>03 &nbsp; Mutfak ve detaylar</strong>
                <span>Günlük estetik ↗</span>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {products[0]?.slug ? (
                <Link
                  href={`/mekan-dene?product=${products[0].slug}`}
                  className="primarybtn"
                >
                  <Sparkles size={13} />
                  <span>Mekânında gör&nbsp; ↗</span>
                </Link>
              ) : (
                <button
                  type="button"
                  className="primarybtn"
                  onClick={() => notify('3D Mekânında Gör simülatörü açılıyor...')}
                >
                  Mekânında gör&nbsp; ↗
                </button>
              )}

              <button
                type="button"
                className="outlinebtn"
                onClick={() => handleOpenLeadForProduct(null, 'sample')}
              >
                Fiziksel Numune İste
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          TECHNICAL SECTION (#teknik)
      ========================================================================= */}
      <section className="section technical" id="teknik">
        <div className="section-head">
          <div>
            <div className="section-kicker">Karar verirken güvenle</div>
            <h2>
              Güzel olduğu kadar<br />
              bilinçli bir seçim.
            </h2>
            <p className="section-intro">
              Teknik detaylar doğru ürünü seçmenize yardımcı olur. Her bilgi, ürünün doğrulanmış teknik dokümanıyla desteklenmelidir.
            </p>
          </div>
          <a className="textlink" href="#urunler">
            Ürünleri karşılaştır&nbsp; ↗
          </a>
        </div>

        <div className="tech-grid">
          <div className="tech-card">
            <small>01 / Teknik şeffaflık</small>
            <h3>Doğru ürün bilgisi</h3>
            <p>Ebat, yüzey, ürün kodu ve TS EN 14411 standart değerlerini ürün bazında açıkça görüntüleyin.</p>
          </div>
          <div className="tech-card">
            <small>02 / Kolay keşif</small>
            <h3>İhtiyacınıza göre filtre</h3>
            <p>Projenizin ölçüsüne, görünümüne ve kullanım alanına en uygun seramik seçeneklerini hızla bulun.</p>
          </div>
          <div className="tech-card">
            <small>03 / Sonraki adım</small>
            <h3>Numune ve teklif</h3>
            <p>Beğendiğiniz seriyi kaydedin; proje metrajınıza özel fiyat teklifi veya fiziksel numune talebine geçin.</p>
          </div>
        </div>

        {/* TS EN 14411 Specification Table for Architects & Specifiers */}
        <div className="mt-12 overflow-x-auto border border-[var(--line)] bg-[var(--paper)]">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/5 border-b border-[var(--line)] font-bold text-[var(--ink)]">
              <tr>
                <th className="py-3 px-4">Teknik Parametre</th>
                <th className="py-3 px-4">Test Standardı</th>
                <th className="py-3 px-4">Şartname Değeri</th>
                <th className="py-3 px-4">Uygunluk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)] text-[var(--muted)]">
              <tr>
                <td className="py-3 px-4 font-semibold text-[var(--ink)]">Su Emme Oranı</td>
                <td className="py-3 px-4">TS EN ISO 10545-3</td>
                <td className="py-3 px-4">E ≤ %0.5 (Grup BIa Porselen Karo)</td>
                <td className="py-3 px-4 text-emerald-600 font-bold">✓ Tam Uyumlu</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-[var(--ink)]">Kırılma Dayanımı</td>
                <td className="py-3 px-4">TS EN ISO 10545-4</td>
                <td className="py-3 px-4">≥ 2000 N (Kalınlık ≥ 7.5 mm)</td>
                <td className="py-3 px-4 text-emerald-600 font-bold">✓ Yüksek Mukavemet</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-[var(--ink)]">Kenar Rektifikasyonu</td>
                <td className="py-3 px-4">TS EN ISO 10545-2</td>
                <td className="py-3 px-4">Lazer Hassasiyetinde Gönyelenmiş (1.5mm derz)</td>
                <td className="py-3 px-4 text-emerald-600 font-bold">✓ Rektifiye</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-[var(--ink)]">Donma & Termal Şok Dayanımı</td>
                <td className="py-3 px-4">TS EN ISO 10545-12</td>
                <td className="py-3 px-4">Dayanıklı (İç ve Dış Mekan / Cephe Kaplama)</td>
                <td className="py-3 px-4 text-emerald-600 font-bold">✓ Donmaya Dayanıklı</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* =========================================================================
          81 PROVINCES DEALER LOCATOR
      ========================================================================= */}
      <section className="px-[7%] pb-12">
        <div className="border border-[var(--line)] bg-[var(--paper)] p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-[10px] font-bold tracking-widest uppercase text-[var(--accent)]">
              Yetkili Showroom & Bayi Ağı (81 İl)
            </span>
            <h3 className="text-xl font-serif text-[var(--ink)]">
              Ürünleri Yakınınızdaki Showroom'da Canlı İnceleyin
            </h3>
            <p className="text-xs text-[var(--muted)] max-w-xl">
              Bien Seramik'in Türkiye genelindeki yüzlerce yetkili bayisinde dokunsal plaka örneklerini, ışık yansımalarını ve derz kombinasyonlarını test edebilirsiniz.
            </p>
          </div>
          <Link
            href={`/bayiler?brand=${brand.slug || 'bien-seramik'}`}
            className="outlinebtn flex items-center gap-2 flex-shrink-0"
          >
            <MapPin size={14} style={{ color: 'var(--accent)' }} />
            <span>En Yakın Bayiyi Bul ↗</span>
          </Link>
        </div>
      </section>

      {/* =========================================================================
          CTA SECTION
      ========================================================================= */}
      <section className="cta">
        <div>
          <h2>Projeniz için doğru yüzeyi bulun.</h2>
          <p>Ürünleri keşfedin, seçeneklerinizi belirleyin ve teklif sürecini başlatın.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            className="primarybtn"
            onClick={() => {
              document.getElementById('urunler')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Koleksiyonu keşfet&nbsp; ↗
          </button>
          <button
            type="button"
            className="outlinebtn"
            style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}
            onClick={() => handleOpenLeadForProduct(null, 'quote')}
          >
            Teklif Masası
          </button>
        </div>
      </section>

      {/* =========================================================================
          FOOTER
      ========================================================================= */}
      <footer className="footer">
        <div className="brand" style={{ fontSize: '18px' }}>
          Seramik<span>Bak</span>
        </div>
        <span>Marka ve ürün bilgileri ilgili veri kaynağından doğrulanmalıdır.</span>
        <span>© SeramikBak · Mimari keşif deneyimi</span>
      </footer>

      {/* =========================================================================
          FLOATING TOAST NOTIFICATION
      ========================================================================= */}
      <div
        className={`toast ${showToast ? 'show' : ''}`}
        role="status"
        aria-live="polite"
      >
        {toastMessage}
      </div>

      {/* =========================================================================
          HIGH-RES TEXTURE LIGHTBOX MODAL
      ========================================================================= */}
      {activeDetailProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setActiveDetailProduct(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-[var(--paper)] border border-[var(--line)] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: 'var(--paper)', borderColor: 'var(--line)' }}
          >
            <div className="flex items-center justify-between p-4 border-b border-[var(--line)]">
              <div>
                <span className="text-[10px] font-mono tracking-wider uppercase text-[var(--accent)] font-bold">
                  4K Yüzey & Doku İncelemesi
                </span>
                <h3 className="text-lg font-serif text-[var(--ink)]">
                  {activeDetailProduct.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveDetailProduct(null)}
                className="iconbtn"
                aria-label="Kapat"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
              <div className="relative aspect-square bg-[var(--product-img-bg)] border border-[var(--line)] overflow-hidden">
                <img
                  src={
                    activeDetailProduct.imageUrl ||
                    activeDetailProduct.textureUrl ||
                    '/renders/luxury_bathroom_calacatta_gold.jpg'
                  }
                  alt={activeDetailProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <span className="text-[10px] text-[var(--muted)] uppercase tracking-wider block">
                      Ürün Kodu
                    </span>
                    <p className="font-mono text-sm font-bold text-[var(--ink)]">
                      {activeDetailProduct.code || 'BY-60120'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-black/5 border border-[var(--line)]">
                      <span className="text-[10px] text-[var(--muted)] block">Ebat</span>
                      <strong className="text-[var(--ink)]">
                        {activeDetailProduct.width && activeDetailProduct.height
                          ? `${activeDetailProduct.width} × ${activeDetailProduct.height} cm`
                          : activeDetailProduct.size || 'Standart Ebat'}
                      </strong>
                    </div>

                    <div className="p-3 bg-black/5 border border-[var(--line)]">
                      <span className="text-[10px] text-[var(--muted)] block">Yüzey Bitişi</span>
                      <strong className="text-[var(--ink)]">
                        {activeDetailProduct.finish || 'Mat'}
                      </strong>
                    </div>
                  </div>

                  <p className="text-xs text-[var(--muted)] leading-relaxed">
                    {activeDetailProduct.description ||
                      'Doğal seramik sırlama teknolojisiyle üretilmiş yüksek aşınma dayanımlı porselen karo yüzeyi. Kolay temizlenebilir leke tutmaz koruyucu katman.'}
                  </p>
                </div>

                <div className="space-y-2 pt-4 border-t border-[var(--line)]">
                  {activeDetailProduct.slug && (
                    <Link
                      href={`/mekan-dene?product=${activeDetailProduct.slug}`}
                      className="outlinebtn w-full justify-center"
                    >
                      <Sparkles size={14} style={{ color: 'var(--accent)' }} />
                      <span>Bu Seramiği 3D Mekânda Dene</span>
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      const p = activeDetailProduct;
                      setActiveDetailProduct(null);
                      handleOpenLeadForProduct(p, 'quote');
                    }}
                    className="primarybtn w-full justify-center"
                  >
                    Bu Ürün İçin Fiyat & Numune İste
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          B2B LEAD / RFQ / SAMPLE MODAL
      ========================================================================= */}
      {showLeadModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowLeadModal(false)}
        >
          <div
            className="relative max-w-lg w-full bg-[var(--paper)] border border-[var(--line)] shadow-2xl p-6 sm:p-8 overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: 'var(--paper)', borderColor: 'var(--line)' }}
          >
            <button
              type="button"
              onClick={() => setShowLeadModal(false)}
              className="absolute top-4 right-4 iconbtn"
              aria-label="Kapat"
            >
              <X size={15} />
            </button>

            {leadSubmitted ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xl font-serif text-[var(--ink)]">Talebiniz Alındı</h3>
                <p className="text-xs text-[var(--muted)] leading-relaxed max-w-xs mx-auto">
                  {leadType === 'sample'
                    ? 'Fiziksel numune talebiniz ve teslimat bilgileriniz Bien Seramik mimari proje departmanına iletildi.'
                    : 'Projenize özel metraj ve fiyat teklifi talebiniz başarıyla üretici markaya ulaştı.'}
                </p>

                <div className="pt-4 flex flex-col sm:flex-row gap-2 justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      const msg = `Merhaba, SeramikBak üzerinden "${catalog.title}" kataloğunuz için teklif/numune talebinde bulundum. (${leadForm.name} - ${leadForm.phone})`;
                      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
                    }}
                    className="primarybtn justify-center"
                  >
                    <MessageCircle size={14} />
                    <span>WhatsApp ile Temsilciye Yaz</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowLeadModal(false)}
                    className="outlinebtn justify-center"
                  >
                    Kapat
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleLeadSubmit} className="space-y-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">
                    B2B Mimari & Ticari Masası
                  </span>
                  <h3 className="text-xl font-serif text-[var(--ink)]">
                    {leadType === 'sample' ? 'Fiziksel Numune Talep Edin' : 'Proje Fiyat Teklifi İsteyin'}
                  </h3>
                  <p className="text-xs text-[var(--muted)]">
                    Seçili seramik karolar için doğrudan {brandName} yetkili proje departmanına talep iletin.
                  </p>
                </div>

                {/* Lead Type Tabs */}
                <div className="flex border border-[var(--line)] p-0.5 bg-black/5 text-xs">
                  <button
                    type="button"
                    onClick={() => setLeadType('quote')}
                    className={`flex-1 py-1.5 font-bold transition text-center ${
                      leadType === 'quote'
                        ? 'bg-[var(--paper)] text-[var(--ink)] shadow-2xs'
                        : 'text-[var(--muted)] hover:text-[var(--ink)]'
                    }`}
                  >
                    Fiyat Teklifi
                  </button>
                  <button
                    type="button"
                    onClick={() => setLeadType('sample')}
                    className={`flex-1 py-1.5 font-bold transition text-center ${
                      leadType === 'sample'
                        ? 'bg-[var(--paper)] text-[var(--ink)] shadow-2xs'
                        : 'text-[var(--muted)] hover:text-[var(--ink)]'
                    }`}
                  >
                    Fiziksel Numune
                  </button>
                </div>

                {/* Selected Products List */}
                {selectedLeadProducts.length > 0 && (
                  <div className="p-2.5 bg-black/5 border border-[var(--line)] text-xs">
                    <span className="text-[10px] text-[var(--muted)] block mb-1">Talep Edilen Ürünler:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedLeadProducts.map((pName, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-[var(--paper)] text-[var(--ink)] border border-[var(--line)] text-[10px] font-medium"
                        >
                          {pName}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {submitError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded">
                    {submitError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-[var(--ink)] mb-1">
                      Ad Soyad *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Adınız Soyadınız"
                      value={leadForm.name}
                      onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                      className="w-full p-2.5 border border-[var(--line)] bg-[var(--paper)] text-[var(--ink)] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[var(--ink)] mb-1">
                      Firma / Ofis Adı
                    </label>
                    <input
                      type="text"
                      placeholder="Mimarlık Ofisi / Şirket"
                      value={leadForm.company}
                      onChange={(e) => setLeadForm({ ...leadForm, company: e.target.value })}
                      className="w-full p-2.5 border border-[var(--line)] bg-[var(--paper)] text-[var(--ink)] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[var(--ink)] mb-1">
                      E-posta *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="ornek@mimarlik.com"
                      value={leadForm.email}
                      onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                      className="w-full p-2.5 border border-[var(--line)] bg-[var(--paper)] text-[var(--ink)] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[var(--ink)] mb-1">
                      Telefon *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="05XX XXX XX XX"
                      value={leadForm.phone}
                      onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                      className="w-full p-2.5 border border-[var(--line)] bg-[var(--paper)] text-[var(--ink)] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[var(--ink)] mb-1">
                    {leadType === 'sample' ? 'Teslimat Adresi ve Proje Detayları' : 'Tahmini Metraj ve Proje Notları'}
                  </label>
                  <textarea
                    rows={3}
                    placeholder={
                      leadType === 'sample'
                        ? 'Numunenin gönderilmesini istediğiniz adres ve teslim alacak kişi bilgisi...'
                        : 'Örn: Yaklaşık 450 m² salon ve ıslak hacim için porselen karo teklifi rica ederiz...'
                    }
                    value={leadForm.message}
                    onChange={(e) => setLeadForm({ ...leadForm, message: e.target.value })}
                    className="w-full p-2.5 border border-[var(--line)] bg-[var(--paper)] text-[var(--ink)] outline-none text-xs resize-none"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowLeadModal(false)}
                    className="outlinebtn"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingLead}
                    className="primarybtn"
                  >
                    {isSubmittingLead ? <Loader2 size={13} className="animate-spin" /> : null}
                    <span>Talebi İlet ↗</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          QR CODE MODAL
      ========================================================================= */}
      {showQrModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowQrModal(false)}
        >
          <div
            className="relative max-w-sm w-full bg-[var(--paper)] border border-[var(--line)] shadow-2xl p-6 text-center space-y-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: 'var(--paper)', borderColor: 'var(--line)' }}
          >
            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 iconbtn"
              aria-label="Kapat"
            >
              <X size={15} />
            </button>

            <span className="text-[10px] font-bold tracking-widest uppercase text-[var(--accent)] block">
              Mobil & Tablet QR Kodu
            </span>
            <h3 className="text-lg font-serif text-[var(--ink)]">{catalog.title}</h3>
            <p className="text-xs text-[var(--muted)]">
              Kameranızla okutarak bu mimari lookbook'u mobil cihazınızda açabilirsiniz.
            </p>

            <div className="p-4 bg-white border border-[var(--line)] inline-block mx-auto shadow-xs">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                  currentUrl
                )}`}
                alt="Katalog QR"
                className="w-44 h-44 object-contain"
              />
            </div>

            <button
              type="button"
              onClick={handleCopyLink}
              className="outlinebtn w-full justify-center"
            >
              {copied ? 'Bağlantı Kopyalandı! ✓' : 'Bağlantıyı Kopyala'}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
