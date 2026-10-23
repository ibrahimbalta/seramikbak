'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Sparkles,
  ExternalLink,
  X,
  Package,
  MapPin,
  Check,
  ChevronDown,
  Palette,
  Eye,
  CheckCircle2,
  Loader2,
  MessageCircle,
  Mail,
  Copy,
  BookOpen,
  Layers,
  ArrowRight,
  ShieldCheck,
  Compass,
  Maximize2,
  Share2,
  Printer,
  QrCode
} from 'lucide-react';
import { prepareAndPrintCatalog } from '@/utils/printCatalog';
import {
  LOOKBOOK_COLOR_TEMPLATES,
  getLookbookTheme
} from './lookbookThemes';

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

export default function HtmlLookbookViewer({
  catalog,
  products = [],
  mode = 'preview', // 'preview' | 'view' | 'print'
  onOpenLeadModal
}) {
  const brand = catalog?.brand || {};
  const brandName = brand.name || catalog?.brandName || 'Bien Seramik';
  const brandLogo = catalog?.customLogoUrl || brand.logoUrl;
  const brandParts = brandName.trim().split(/\s+/);

  // Active color template
  const [activeThemeId, setActiveThemeId] = useState(catalog?.template || 'terra-traverten');
  const [showThemePicker, setShowThemePicker] = useState(false);
  const themePickerRef = useRef(null);

  // Sync if catalog.template changes
  useEffect(() => {
    if (catalog?.template) {
      setActiveThemeId(catalog.template);
    }
  }, [catalog?.template]);

  // Click outside to close theme picker
  useEffect(() => {
    const handleDocClick = (e) => {
      if (themePickerRef.current && !themePickerRef.current.contains(e.target)) {
        setShowThemePicker(false);
      }
    };
    document.addEventListener('mousedown', handleDocClick);
    return () => document.removeEventListener('mousedown', handleDocClick);
  }, []);

  const currentTheme = useMemo(() => {
    return getLookbookTheme(activeThemeId);
  }, [activeThemeId]);

  const layoutType = currentTheme.layoutType || 'editorial-asymmetric';

  // Real-time Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSize, setSelectedSize] = useState('all');
  const [selectedSurface, setSelectedSurface] = useState('all');
  const searchInputRef = useRef(null);

  // Favorites state
  const [favorites, setFavorites] = useState({});

  // Toast notification state
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const toastTimeoutRef = useRef(null);

  // Detail Modal & Lead Modal state
  const [activeDetailProduct, setActiveDetailProduct] = useState(null);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [leadType, setLeadType] = useState('quote');
  const [selectedLeadProducts, setSelectedLeadProducts] = useState([]);
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [leadForm, setLeadForm] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    message: ''
  });

  // Social Share & Print State
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const shareMenuRef = useRef(null);

  // Close share menu on outside click
  useEffect(() => {
    const handleShareDocClick = (e) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(e.target)) {
        setShowShareMenu(false);
      }
    };
    document.addEventListener('mousedown', handleShareDocClick);
    return () => document.removeEventListener('mousedown', handleShareDocClick);
  }, []);

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = catalog?.title
    ? `${catalog.title} - ${brandName}`
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
      console.error(err);
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
    const subject = encodeURIComponent(shareTitle);
    const body = encodeURIComponent(`İncelemenizi tavsiye ederim:\n${currentUrl}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setShowShareMenu(false);
  };

  const handlePrint = async () => {
    if (isPrinting) return;
    setIsPrinting(true);
    try {
      if (catalog?.slug) {
        fetch(`/api/brand/catalogs/public/${catalog.slug}?download=true`).catch(() => {});
      }
      await prepareAndPrintCatalog({ stageId: 'seramikbak-lookbook-root' });
    } finally {
      setIsPrinting(false);
    }
  };

  const notify = (msg) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    setShowToast(true);
    toastTimeoutRef.current = setTimeout(() => {
      setShowToast(false);
    }, 3200);
  };

  const handleToggleFavorite = (p, e) => {
    if (e) e.stopPropagation();
    const key = p.id || p.code || p.name;
    const nextState = !favorites[key];
    setFavorites((prev) => ({ ...prev, [key]: nextState }));
    notify(nextState ? `"${p.name}" favorilere eklendi.` : `"${p.name}" favorilerden çıkarıldı.`);
  };

  // Derive filter options
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

  // Filtered products list
  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLocaleLowerCase('tr').trim();
    return products.filter((p) => {
      const name = (p.name || '').toLocaleLowerCase('tr');
      const code = (p.code || '').toLocaleLowerCase('tr');
      const matchesSearch = !q || name.includes(q) || code.includes(q);

      let matchesSize = true;
      if (selectedSize !== 'all') {
        const pSize = p.width && p.height
          ? `${p.width}x${p.height}`
          : (p.size || '').replace(/\s+/g, '').toLowerCase();
        matchesSize = pSize.includes(selectedSize.replace(/\s+/g, '').toLowerCase());
      }

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

  const handleOpenLead = (product, type = 'quote') => {
    if (typeof onOpenLeadModal === 'function') {
      onOpenLeadModal({ product, type });
      return;
    }
    if (product) {
      setSelectedLeadProducts([product.name || product.code || 'Seramik Ürün']);
    } else {
      setSelectedLeadProducts(products.slice(0, 3).map((p) => p.name || p.code));
    }
    setLeadType(type);
    setLeadSubmitted(false);
    setShowLeadModal(true);
  };

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

  const coverImage =
    catalog?.customCoverUrl ||
    catalog?.coverImageUrl ||
    currentTheme.previewImg ||
    (products.length > 0 && (products[0].imageUrl || products[0].textureUrl)) ||
    '/renders/luxury_bathroom_calacatta_gold.jpg';

  const year = new Date().getFullYear();

  return (
    <div
      id="seramikbak-lookbook-root"
      className={`seramikbak-lookbook-app layout-${layoutType} w-full`}
      style={currentTheme.vars}
    >
      <style jsx global>{`
        .seramikbak-lookbook-app {
          background-color: var(--site-background);
          color: var(--site-on-background);
          font-family: var(--site-font-body, Inter, sans-serif);
          font-size: 14px;
          line-height: 1.5;
          transition: background-color .3s ease, color .3s ease;
        }

        .seramikbak-lookbook-app .topline {
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
        .seramikbak-lookbook-app .topline strong {
          color: var(--ink);
          letter-spacing: .12em;
        }

        .seramikbak-lookbook-app .nav {
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
          z-index: 30;
          transition: background-color .3s, border-color .3s;
        }
        .seramikbak-lookbook-app .brand-title {
          font-size: 22px;
          font-weight: 750;
          letter-spacing: -.07em;
          white-space: nowrap;
          color: var(--ink);
          text-decoration: none;
        }
        .seramikbak-lookbook-app .brand-title span {
          color: var(--accent);
        }
        .seramikbak-lookbook-app .navlinks {
          display: flex;
          gap: 27px;
          color: var(--muted);
          font-size: 12px;
          align-items: center;
        }
        .seramikbak-lookbook-app .navlinks a {
          text-decoration: none;
          color: inherit;
          transition: color .2s;
        }
        .seramikbak-lookbook-app .navlinks a:hover {
          color: var(--accent);
        }
        .seramikbak-lookbook-app .navright {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .seramikbak-lookbook-app .iconbtn {
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
        .seramikbak-lookbook-app .iconbtn:hover {
          border-color: var(--accent);
          color: var(--accent);
        }
        .seramikbak-lookbook-app .outlinebtn, .seramikbak-lookbook-app .primarybtn {
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
        .seramikbak-lookbook-app .outlinebtn {
          border: 1px solid var(--line);
          background: transparent;
          color: var(--ink);
        }
        .seramikbak-lookbook-app .outlinebtn:hover {
          border-color: var(--accent);
          color: var(--accent);
        }
        .seramikbak-lookbook-app .primarybtn {
          border: 1px solid var(--accent);
          background: var(--accent);
          color: var(--site-on-primary, #ffffff);
        }
        .seramikbak-lookbook-app .primarybtn:hover {
          filter: brightness(.94);
        }

        /* -------------------------------------------------------------
           HERO STYLES FOR DIFFERENT LAYOUTS
        ------------------------------------------------------------- */
        /* 1. Asymmetric Editorial (terra-traverten) */
        .layout-editorial-asymmetric .hero {
          background: var(--hero-bg, #262a27);
          color: var(--hero-text, #f8f5ef);
          min-height: 520px;
          display: grid;
          grid-template-columns: 1.1fr .9fr;
          position: relative;
          overflow: hidden;
        }
        .layout-editorial-asymmetric .hero-copy {
          padding: 78px 0 68px 9%;
          position: relative;
          z-index: 2;
        }
        .layout-editorial-asymmetric .hero h1 {
          font-family: var(--site-font-heading, Georgia, serif);
          font-weight: 400;
          font-size: clamp(40px, 4.8vw, 68px);
          line-height: 1.05;
          letter-spacing: -.045em;
          max-width: 670px;
          margin: 24px 0 22px;
          color: var(--hero-text, #f8f5ef);
        }
        .layout-editorial-asymmetric .hero h1 em {
          color: var(--hero-em, #c4a47a);
          font-style: italic;
        }
        .layout-editorial-asymmetric .hero-visual {
          position: relative;
          min-height: 440px;
          overflow: hidden;
        }
        .layout-editorial-asymmetric .hero-visual:before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, var(--hero-bg, #262a27) 0%, rgba(38,42,39,.12) 45%, rgba(38,42,39,.06) 100%);
          z-index: 1;
        }
        .layout-editorial-asymmetric .hero-stamp {
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

        /* 2. Cinema Fullwidth Monolith (obsidian-gold) */
        .layout-cinema-fullwidth .hero {
          min-height: 82vh;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 80px 24px;
          background: #080a0f;
          color: #ffffff;
          overflow: hidden;
        }
        .layout-cinema-fullwidth .hero-backdrop {
          position: absolute;
          inset: 0;
          z-index: 0;
        }
        .layout-cinema-fullwidth .hero-backdrop img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: brightness(0.38) contrast(1.1);
        }
        .layout-cinema-fullwidth .hero-backdrop:after {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, transparent 30%, rgba(8,10,15,0.85) 100%), linear-gradient(0deg, #0a0d14 0%, transparent 60%);
        }
        .layout-cinema-fullwidth .hero-content-cinema {
          position: relative;
          z-index: 2;
          max-width: 900px;
          margin: 0 auto;
        }
        .layout-cinema-fullwidth .cinema-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 30px;
          background: rgba(197, 160, 89, 0.15);
          border: 1px solid rgba(197, 160, 89, 0.4);
          color: #c5a059;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: .2em;
          text-transform: uppercase;
          margin-bottom: 20px;
        }
        .layout-cinema-fullwidth .hero h1 {
          font-family: 'Georgia', serif;
          font-size: clamp(44px, 5.5vw, 84px);
          font-weight: 300;
          letter-spacing: -0.04em;
          line-height: 1.05;
          color: #ffffff;
          margin: 0 0 20px;
        }
        .layout-cinema-fullwidth .hero h1 em {
          font-style: italic;
          color: #c5a059;
        }

        /* 3. Swiss Bauhaus Industrial (nordic-loft) */
        .layout-swiss-industrial .hero {
          background: var(--hero-bg, #1e293b);
          color: #ffffff;
          padding: 40px 5.5% 60px;
        }
        .layout-swiss-industrial .swiss-coord-bar {
          border-bottom: 1px solid rgba(255,255,255,0.15);
          padding-bottom: 12px;
          margin-bottom: 35px;
          display: flex;
          justify-content: space-between;
          font-family: monospace;
          font-size: 11px;
          color: #94a3b8;
          letter-spacing: .1em;
        }
        .layout-swiss-industrial .swiss-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 40px;
          align-items: center;
        }
        .layout-swiss-industrial .hero h1 {
          font-family: 'Inter', sans-serif;
          font-weight: 850;
          font-size: clamp(36px, 4.4vw, 62px);
          letter-spacing: -0.05em;
          text-transform: uppercase;
          line-height: 1.02;
          margin: 0 0 22px;
        }
        .layout-swiss-industrial .swiss-frame {
          position: relative;
          border: 1px solid rgba(255,255,255,0.25);
          padding: 8px;
          background: rgba(255,255,255,0.05);
        }
        .layout-swiss-industrial .swiss-frame img {
          width: 100%;
          height: 380px;
          object-fit: cover;
          display: block;
        }

        /* 4. Organic Wellness Sanctuary (sage-forest) */
        .layout-organic-wellness .hero {
          background: #1c2820;
          color: #f2f7f3;
          padding: 60px 5.5% 70px;
        }
        .layout-organic-wellness .organic-hero-box {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          align-items: center;
        }
        .layout-organic-wellness .hero h1 {
          font-family: 'Georgia', serif;
          font-size: clamp(38px, 4.2vw, 60px);
          font-weight: 400;
          line-height: 1.1;
          color: #ffffff;
          margin: 16px 0;
        }
        .layout-organic-wellness .organic-img-wrap {
          border-radius: 28px;
          overflow: hidden;
          box-shadow: 0 20px 45px rgba(0,0,0,0.35);
          height: 420px;
        }
        .layout-organic-wellness .organic-img-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* 5. Mediterranean Book Spread (terracotta-sun) */
        .layout-mediterranean-book .hero {
          background: #2d1b15;
          color: #faf4ef;
          padding: 70px 5.5% 80px;
        }
        .layout-mediterranean-book .book-spread {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 50px;
          align-items: center;
        }
        .layout-mediterranean-book .hero h1 {
          font-family: 'Georgia', serif;
          font-size: clamp(40px, 4.5vw, 64px);
          font-weight: 400;
          line-height: 1.1;
          margin: 18px 0;
          color: #fff;
        }
        .layout-mediterranean-book .book-card {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.15);
          padding: 30px;
          border-radius: 8px;
        }

        /* 6. Gallery Minimal White-Cube (carrara-pure) */
        .layout-gallery-minimal .hero {
          background: #ffffff;
          color: #18181b;
          border-bottom: 1px solid #e4e4e7;
          padding: 70px 5.5% 80px;
          text-align: center;
        }
        .layout-gallery-minimal .hero h1 {
          font-family: 'Georgia', serif;
          font-size: clamp(42px, 5vw, 72px);
          font-weight: 300;
          letter-spacing: -0.03em;
          color: #18181b;
          margin: 18px auto 20px;
          max-width: 800px;
        }
        .layout-gallery-minimal .gallery-hero-photo {
          max-width: 960px;
          margin: 35px auto 0;
          border: 1px solid #18181b;
          padding: 10px;
          background: #ffffff;
        }
        .layout-gallery-minimal .gallery-hero-photo img {
          width: 100%;
          height: 420px;
          object-fit: cover;
          display: block;
        }

        /* -------------------------------------------------------------
           PRODUCTS GRID STYLING PER LAYOUT
        ------------------------------------------------------------- */
        .seramikbak-lookbook-app .section {
          padding: 76px 7%;
        }
        .seramikbak-lookbook-app .products {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 28px 18px;
        }

        /* 3-column slab grid for cinema-fullwidth and gallery-minimal */
        .layout-cinema-fullwidth .products,
        .layout-gallery-minimal .products {
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 32px 22px;
        }

        .seramikbak-lookbook-app .product {
          background: var(--paper);
          border: 1px solid var(--line);
          min-width: 0;
          transition: transform .25s, border-color .25s, box-shadow .25s;
          display: flex;
          flex-direction: column;
        }
        .seramikbak-lookbook-app .product:hover {
          transform: translateY(-4px);
          border-color: var(--product-hover-border, #c5b49a);
          box-shadow: 0 10px 24px -10px rgba(0,0,0,0.12);
        }

        /* Organic wellness rounded cards */
        .layout-organic-wellness .product {
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0,0,0,0.04);
        }

        /* Obsidian glass cards */
        .layout-cinema-fullwidth .product {
          background: rgba(19, 24, 34, 0.7);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(197, 160, 89, 0.2);
        }
        .layout-cinema-fullwidth .product:hover {
          border-color: #c5a059;
          box-shadow: 0 12px 30px rgba(197, 160, 89, 0.15);
        }

        .seramikbak-lookbook-app .product-img {
          aspect-ratio: 1.13;
          background: var(--product-img-bg, #ece9e3);
          overflow: hidden;
          position: relative;
        }
        .layout-cinema-fullwidth .product-img {
          aspect-ratio: 1.35;
        }
        .seramikbak-lookbook-app .product-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform .5s ease;
        }
        .seramikbak-lookbook-app .product:hover .product-img img {
          transform: scale(1.035);
        }

        .seramikbak-lookbook-app .product-label {
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
        .seramikbak-lookbook-app .fav {
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
        }
        .seramikbak-lookbook-app .fav:hover {
          transform: scale(1.1);
        }
        .seramikbak-lookbook-app .product-info {
          padding: 16px 15px 14px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .seramikbak-lookbook-app .product-series {
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: .13em;
          color: var(--accent);
          margin-bottom: 7px;
          font-weight: 700;
        }
        .seramikbak-lookbook-app .product h3 {
          font-family: var(--site-font-heading, Georgia, serif);
          font-weight: 400;
          font-size: 20px;
          margin: 0 0 9px;
          line-height: 1.15;
          color: var(--ink);
        }
        .layout-swiss-industrial .product h3 {
          font-family: 'Inter', sans-serif;
          font-weight: 700;
          font-size: 17px;
          letter-spacing: -0.02em;
        }
        .seramikbak-lookbook-app .specs {
          font-size: 11px;
          color: var(--muted);
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .seramikbak-lookbook-app .specs span+span:before {
          content: "·";
          margin-right: 8px;
          color: var(--accent);
        }
        .seramikbak-lookbook-app .product-actions {
          display: flex;
          border-top: 1px solid var(--line);
          margin-top: 15px;
        }
        .seramikbak-lookbook-app .product-actions button {
          flex: 1;
          padding: 12px 6px;
          border: 0;
          background: transparent;
          color: var(--ink);
          font-size: 10px;
          font-weight: 700;
          cursor: pointer;
          transition: all .2s;
          text-align: center;
        }
        .seramikbak-lookbook-app .product-actions button+button {
          border-left: 1px solid var(--line);
          color: var(--site-on-primary, #ffffff);
          background: var(--accent);
        }
        .seramikbak-lookbook-app .product-actions button:hover {
          filter: brightness(.94);
        }

        .seramikbak-lookbook-app .editorial {
          background: var(--editorial-bg, #eeece5);
          transition: background-color .3s;
        }
        .seramikbak-lookbook-app .editorial-grid {
          display: grid;
          grid-template-columns: 1.12fr .88fr;
          gap: 5%;
          align-items: center;
        }
        .seramikbak-lookbook-app .editorial-photo {
          position: relative;
          min-height: 480px;
          overflow: hidden;
        }
        .seramikbak-lookbook-app .editorial-photo img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .seramikbak-lookbook-app .photo-caption {
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

        .seramikbak-lookbook-app .technical {
          background: var(--paper);
          transition: background-color .3s;
        }
        .seramikbak-lookbook-app .tech-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-top: 32px;
        }
        .seramikbak-lookbook-app .tech-card {
          border: 1px solid var(--line);
          padding: 24px;
          background: var(--paper);
          transition: border-color .2s;
        }
        .seramikbak-lookbook-app .tech-card:hover {
          border-color: var(--accent);
        }

        .seramikbak-lookbook-app .cta {
          margin: 0 7% 70px;
          padding: 42px 48px;
          background: var(--cta-bg, #282d29);
          color: var(--cta-text, #ffffff);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 28px;
        }

        .seramikbak-lookbook-app .footer {
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

        .seramikbak-lookbook-app .toast {
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
        }
        .seramikbak-lookbook-app .toast.show {
          opacity: 1;
          transform: translate(-50%, 0);
          pointer-events: auto;
        }

        @media(max-width:1000px) {
          .layout-editorial-asymmetric .hero { grid-template-columns: 1fr .72fr; }
          .layout-swiss-industrial .swiss-grid { grid-template-columns: 1fr; }
          .layout-organic-wellness .organic-hero-box { grid-template-columns: 1fr; }
          .layout-mediterranean-book .book-spread { grid-template-columns: 1fr; }
          .seramikbak-lookbook-app .products { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
        }
        @media(max-width:700px) {
          .seramikbak-lookbook-app .topline { padding: 0 5%; font-size: 9px; }
          .seramikbak-lookbook-app .nav { height: 64px; padding: 0 5%; }
          .seramikbak-lookbook-app .navlinks { display: none; }
          .layout-editorial-asymmetric .hero { display: flex; flex-direction: column; }
          .seramikbak-lookbook-app .products { grid-template-columns: 1fr !important; }
          .seramikbak-lookbook-app .editorial-grid { grid-template-columns: 1fr; gap: 28px; }
          .seramikbak-lookbook-app .tech-grid { grid-template-columns: 1fr; }
          .seramikbak-lookbook-app .cta { margin: 0 5% 40px; padding: 30px 24px; flex-direction: column; align-items: flex-start; }
          .seramikbak-lookbook-app .footer { padding: 24px 5%; flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      {/* TOPLINE */}
      <div className="topline">
        <span>
          {brandName} <span style={{ padding: '0 8px' }}>/</span> Mimari Koleksiyonlar
        </span>
        <strong>ÜRÜNÜ KEŞFET · MEKÂNINDA DENE · TEKLİF AL</strong>
      </div>

      {/* NAVBAR */}
      <nav className="nav">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            {brandLogo && (
              <img
                src={brandLogo}
                alt={brandName}
                className="h-7 sm:h-8 w-auto object-contain"
              />
            )}
            <span className="brand-title">
              {brandParts.length > 1 ? (
                <>
                  {brandParts.slice(0, -1).join(' ')} <span>{brandParts[brandParts.length - 1]}</span>
                </>
              ) : (
                <span>{brandName}</span>
              )}
            </span>
          </div>
          <span style={{ fontSize: '10px', letterSpacing: '.08em', color: 'var(--muted)', fontWeight: 600 }}>
            {currentTheme.badge}
          </span>
        </div>

        <div className="navlinks">
          <a href="#koleksiyon">Koleksiyon</a>
          <a href="#urunler">Ürünler</a>
          <a href="#mekanlar">Mekân İlhamı</a>
          <a href="#teknik">Teknik Bilgiler</a>
        </div>

        <div className="navright">
          {/* Quick Search */}
          <button
            type="button"
            className="iconbtn"
            aria-label="Ara"
            onClick={() => searchInputRef.current?.focus()}
            title="Ürün Ara"
          >
            <Search size={15} />
          </button>

          {/* COLOR THEME SELECTOR DROPDOWN */}
          <div className="relative" ref={themePickerRef}>
            <button
              type="button"
              onClick={() => setShowThemePicker(!showThemePicker)}
              className="outlinebtn flex items-center gap-1.5"
              title="Şablon Değiştir"
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
                    Şablon ve Mizanpaj Seçin
                  </p>
                  <p className="text-[11px] text-[var(--muted)]">
                    Farklı mimari mizanpaj ve renkleri canlı test edin.
                  </p>
                </div>

                <div className="space-y-1">
                  {LOOKBOOK_COLOR_TEMPLATES.map((tmpl) => {
                    const isCurrent = activeThemeId === tmpl.id;
                    return (
                      <button
                        key={tmpl.id}
                        type="button"
                        onClick={() => {
                          setActiveThemeId(tmpl.id);
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
                          <div
                            className="w-4 h-4 rounded-full border border-stone-300 shadow-2xs flex-shrink-0"
                            style={{ backgroundColor: tmpl.colorSample.primary }}
                          />
                          <div className="min-w-0">
                            <span className="block text-xs truncate leading-tight">{tmpl.name}</span>
                            <span className="text-[9px] text-[var(--muted)] block truncate">{tmpl.style}</span>
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
                  <p className="text-[10px] text-[var(--muted)] truncate">{catalog?.title || 'Katalog'}</p>
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
            className="outlinebtn flex items-center gap-1.5"
            onClick={handlePrint}
            disabled={isPrinting}
            title="Kataloğu PDF Olarak İndir / Yazdır"
          >
            {isPrinting ? <Loader2 size={13} className="animate-spin" /> : <Printer size={13} />}
            <span className="hidden sm:inline">Kataloğu İndir ↗</span>
          </button>

          <button
            type="button"
            className="primarybtn"
            onClick={() => handleOpenLead(null, 'quote')}
            title="Fiyat Teklifi Masası"
          >
            Teklif Al ↗
          </button>
        </div>
      </nav>

      {/* =========================================================================
          DISTINCT HERO DESIGNS ACCORDING TO TEMPLATE LAYOUT
      ========================================================================= */}

      {/* LAYOUT 1: Asymmetric Editorial (terra-traverten) */}
      {layoutType === 'editorial-asymmetric' && (
        <header className="hero" id="koleksiyon">
          <div className="hero-copy">
            <div className="eyebrow" style={{ color: 'var(--hero-eyebrow)' }}>{brandName} &bull; {catalog?.title}</div>
            <h1>
              Yüzeylerde<br />
              <em>zamansız</em> bir ifade.
            </h1>
            <p>
              {catalog?.introText ||
                catalog?.description ||
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
            <img src={coverImage} alt={catalog?.title || 'Katalog Kapağı'} />
            <div className="hero-stamp">
              <span>Malzemenin dili</span>
              <strong>
                Doğadan ilham.<br />
                Mimariyle hayat bulur.
              </strong>
            </div>
          </div>
        </header>
      )}

      {/* LAYOUT 2: Cinema Fullwidth Monolith (obsidian-gold) */}
      {layoutType === 'cinema-fullwidth' && (
        <header className="hero" id="koleksiyon">
          <div className="hero-backdrop">
            <img src={coverImage} alt={catalog?.title || 'Katalog Kapağı'} />
          </div>

          <div className="hero-content-cinema">
            <div className="cinema-badge">
              <Sparkles size={12} />
              <span>MİLANO CERSAIE EDİSYONU &bull; {year}</span>
            </div>

            <h1>
              {catalog?.title || 'Milano Architectural Lookbook'}
            </h1>

            <div className="w-16 h-0.5 bg-[var(--accent)] mx-auto mb-6" />

            <p className="max-w-xl mx-auto text-stone-200 text-base leading-relaxed mb-8">
              {catalog?.introText ||
                catalog?.description ||
                'Dev ebat porselen karolar ve monolitik yüzey mimarisi. Obsidian taşın derinliği ile şampanya altınının zamansız buluşması.'}
            </p>

            <div className="flex items-center justify-center gap-3 flex-wrap">
              <button
                type="button"
                className="primarybtn"
                style={{ padding: '14px 26px', fontSize: '11px' }}
                onClick={() => {
                  document.getElementById('urunler')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Koleksiyonu Keşfet ↘
              </button>
              <button
                type="button"
                className="outlinebtn"
                style={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.3)', padding: '14px 24px' }}
                onClick={() => handleOpenLead(null, 'quote')}
              >
                Proje Teklifi Al +
              </button>
            </div>

            <div className="mt-12 inline-flex items-center gap-4 text-xs font-mono text-stone-300 border border-white/20 px-4 py-2 rounded-full backdrop-blur-md">
              <ShieldCheck size={14} style={{ color: 'var(--accent)' }} />
              <span>TS EN 14411 GRUP BIA &bull; DEV EBAT SLAB SERİSİ &bull; {products.length} KARO</span>
            </div>
          </div>
        </header>
      )}

      {/* LAYOUT 3: Swiss Bauhaus Industrial (nordic-loft) */}
      {layoutType === 'swiss-industrial' && (
        <header className="hero" id="koleksiyon">
          <div className="swiss-coord-bar">
            <span>[ NORDIC ARCHITECTURAL SERIES &bull; {brandName.toUpperCase()} ]</span>
            <span>MİMARİ KOORDİNAT: TS EN 14411 / {year}</span>
          </div>

          <div className="swiss-grid">
            <div>
              <span className="text-[10px] font-mono tracking-widest text-[#94a3b8] uppercase block mb-3">
                // ENDÜSTRİYEL VE MODÜLER YÜZEY MİMARİSİ
              </span>
              <h1>
                Brüt ve Yalın<br />
                Mimari Formlar.
              </h1>
              <p className="text-stone-300 text-sm leading-relaxed mb-6 max-w-md">
                {catalog?.introText ||
                  catalog?.description ||
                  'Çimento, beton ve ham ahşap tonlarıyla kentsel loft projeleri için tasarlanan net ve işlevsel yüzey koleksiyonu.'}
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ background: '#ffffff', color: '#0f172a' }}
                  onClick={() => {
                    document.getElementById('urunler')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Karoları İncele
                  <ArrowRight size={14} />
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.3)' }}
                  onClick={() => handleOpenLead(null, 'sample')}
                >
                  Teknik Şartname & Numune
                </button>
              </div>
            </div>

            <div className="swiss-frame">
              <img src={coverImage} alt="Nordic Loft" />
              <div className="p-2 text-right font-mono text-[9px] text-stone-400">
                FRAME REF: LOFT-CONCRETE-{year}
              </div>
            </div>
          </div>
        </header>
      )}

      {/* LAYOUT 4: Organic Wellness Sanctuary (sage-forest) */}
      {layoutType === 'organic-wellness' && (
        <header className="hero" id="koleksiyon">
          <div className="organic-hero-box">
            <div>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-white/10 text-[#92b69a] inline-block mb-3 border border-white/15">
                BİOFİLİK MİMARİ &bull; DOĞA & WELLNESS
              </span>
              <h1>
                Doğanın Dinginliğiyle<br />
                Nefes Alan Yüzeyler.
              </h1>
              <p className="text-stone-300 text-sm leading-relaxed mb-6 max-w-md">
                {catalog?.introText ||
                  catalog?.description ||
                  'Organik mineral sırlar ve doğal taş dokularıyla banyo, spa ve yaşam alanlarına huzur getiren biophilic seramik koleksiyonu.'}
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="primarybtn"
                  style={{ borderRadius: '24px', padding: '13px 24px' }}
                  onClick={() => {
                    document.getElementById('urunler')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Doğal Dokuları Keşfet ↘
                </button>
                <button
                  type="button"
                  className="outlinebtn"
                  style={{ borderRadius: '24px', color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}
                  onClick={() => handleOpenLead(null, 'sample')}
                >
                  Numune İste
                </button>
              </div>
            </div>

            <div className="organic-img-wrap">
              <img src={coverImage} alt="Wellness Sanctuary" />
            </div>
          </div>
        </header>
      )}

      {/* LAYOUT 5: Mediterranean Book Spread (terracotta-sun) */}
      {layoutType === 'mediterranean-book' && (
        <header className="hero" id="koleksiyon">
          <div className="book-spread">
            <div>
              <span className="text-[10px] font-bold tracking-widest text-[#e0906e] uppercase block mb-2">
                AKDENİZ VİLLALARI &bull; ARTISAN LOOKBOOK
              </span>
              <h1>
                Güneşin ve Pişmiş Toprağın<br />
                Zamansız Sıcaklığı.
              </h1>
              <p className="text-stone-300 text-sm leading-relaxed mb-6">
                {catalog?.introText ||
                  catalog?.description ||
                  'Geleneksel zanaat ruhu ve pişmiş kil zenginliği. Sıcak avlular, mutfaklar ve yazlık villalar için otantik seramik sanatı.'}
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="primarybtn"
                  style={{ padding: '13px 22px' }}
                  onClick={() => {
                    document.getElementById('urunler')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Koleksiyonu Aç ↘
                </button>
                <button
                  type="button"
                  className="outlinebtn"
                  style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}
                  onClick={() => handleOpenLead(null, 'quote')}
                >
                  Fiyat & Proje Teklifi
                </button>
              </div>
            </div>

            <div className="book-card">
              <img
                src={coverImage}
                alt="Mediterranean Villa"
                className="w-full h-72 object-cover rounded mb-4"
              />
              <p className="text-xs font-serif italic text-stone-300">
                "Toprak, ışık ve ateşin buluştuğu yüzeyler; mekâna Akdeniz rüzgarının dinginliğini taşır."
              </p>
            </div>
          </div>
        </header>
      )}

      {/* LAYOUT 6: Gallery Minimal White-Cube (carrara-pure) */}
      {layoutType === 'gallery-minimal' && (
        <header className="hero" id="koleksiyon">
          <span className="text-[11px] font-mono tracking-widest text-stone-500 uppercase block mb-2">
            EXHIBITION NO. 01 &bull; {brandName.toUpperCase()} &bull; {year}
          </span>
          <h1>
            {catalog?.title || 'Carrara Pure Marble Exhibition'}
          </h1>
          <p className="text-stone-600 text-sm max-w-lg mx-auto mb-6">
            {catalog?.introText ||
              catalog?.description ||
              'Beyaz mermerin saf heykelsi güzelliği. Calacatta ve statuario damarlarının mimari galeri sunumu.'}
          </p>

          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                document.getElementById('urunler')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Sergiyi İncele
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => handleOpenLead(null, 'sample')}
            >
              Fiziksel Numune Talep Et
            </button>
          </div>

          <div className="gallery-hero-photo">
            <img src={coverImage} alt="Gallery Exhibition" />
          </div>
        </header>
      )}

      {/* =========================================================================
          PRODUCTS SECTION
      ========================================================================= */}
      <section className="section" id="urunler">
        <div className="flex items-end justify-between gap-6 mb-8 flex-wrap">
          <div>
            <div className="text-[10px] font-bold tracking-widest uppercase text-[var(--accent)] mb-1">
              Koleksiyondan Seçkiler
            </div>
            <h2 className="text-3xl font-serif text-[var(--ink)]">Yüzeyleri Yakından Tanıyın</h2>
            <p className="text-xs text-[var(--muted)] mt-1 max-w-md">
              Her yüzeyin kendine özgü dokusunu, ölçüsünü ve karakterini keşfedin.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a href="#teknik" className="text-xs font-bold text-[var(--accent)] hover:underline">
              Teknik özellikleri incele&nbsp; ↗
            </a>
          </div>
        </div>

        {/* Collection Bar */}
        <div className="flex items-center justify-between py-3 border-y border-[var(--line)] mb-6 text-xs text-[var(--muted)] flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <span><strong>Marka:</strong> {brandName}</span>
            <span>&bull;</span>
            <span><strong>Koleksiyon:</strong> {catalog?.title}</span>
            <span>&bull;</span>
            <span><strong>Seçki:</strong> {products.length} ürün</span>
          </div>
          <span className="text-[10px] font-mono">
            Şablon Modeli: {currentTheme.name}
          </span>
        </div>

        {/* Filter Row */}
        <div className="flex items-center gap-3 flex-wrap mb-8 text-xs">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              ref={searchInputRef}
              type="search"
              placeholder="Ürün adı veya koduyla ara…"
              className="w-full pl-9 pr-3 py-2.5 border border-[var(--line)] bg-[var(--paper)] text-[var(--ink)] outline-none rounded"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="px-3 py-2.5 border border-[var(--line)] bg-[var(--paper)] text-[var(--ink)] outline-none rounded min-w-[130px]"
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
            className="px-3 py-2.5 border border-[var(--line)] bg-[var(--paper)] text-[var(--ink)] outline-none rounded min-w-[130px]"
            value={selectedSurface}
            onChange={(e) => setSelectedSurface(e.target.value)}
          >
            <option value="all">Tüm yüzeyler</option>
            <option value="mat">Mat</option>
            <option value="parlak">Parlak</option>
            <option value="lapato">Full Lappato</option>
          </select>

          <span className="text-[11px] text-[var(--muted)] font-semibold ml-auto">
            {filteredProducts.length} ürün gösteriliyor
          </span>
        </div>

        {/* Product Cards Grid */}
        <div className="products">
          {filteredProducts.map((p, idx) => {
            const key = p.id || p.code || p.name || idx;
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
              <article key={key} className="product">
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
                  <div className="product-series">
                    {layoutType === 'gallery-minimal' ? `EXHIBIT 0${idx + 1}` : `${brandName} · Mimari seçki`}
                  </div>
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
                      onClick={() => handleOpenLead(p, 'quote')}
                      title="Fiyat Teklifi & Numune İste"
                    >
                      Teklif al&nbsp; +
                    </button>
                  </div>

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
            <div className="p-12 text-center border border-dashed border-[var(--line)] col-span-full bg-[var(--paper)]">
              Aramanızla eşleşen ürün bulunamadı. Filtreleri değiştirip tekrar deneyin.
            </div>
          )}
        </div>
      </section>

      {/* EDITORIAL SECTION */}
      <section className="section editorial" id="mekanlar">
        <div className="editorial-grid">
          <div className="editorial-photo">
            <img
              src="/renders/modern_living_natural_oak.jpg"
              alt="Mekânda hayat bulan yüzeyler"
            />
            <div className="photo-caption">Mekânlardan ilham alın &bull; {year}</div>
          </div>

          <div className="space-y-4">
            <div className="text-[10px] font-bold tracking-widest uppercase text-[var(--accent)]">
              Mekânda Hayat Bulan Yüzeyler
            </div>
            <h2 className="text-3xl font-serif text-[var(--ink)]">
              Bir Yüzeyden<br />
              Daha Fazlası.
            </h2>
            <p className="text-xs text-[var(--muted)] leading-relaxed max-w-md">
              Doğru yüzey, mekânın ışığını, ölçüsünü ve karakterini değiştirir. Koleksiyonu yalnızca ürün olarak değil, yaşam alanınızın bir parçası olarak keşfedin.
            </p>

            <div className="border-t border-[var(--line)] pt-3 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-[var(--line)]">
                <strong>01 &nbsp; Banyo ve spa</strong>
                <span className="text-[var(--muted)]">Doğal dinginlik ↗</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[var(--line)]">
                <strong>02 &nbsp; Yaşam alanları</strong>
                <span className="text-[var(--muted)]">Sade mimari ↗</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[var(--line)]">
                <strong>03 &nbsp; Mutfak ve detaylar</strong>
                <span className="text-[var(--muted)]">Günlük estetik ↗</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                className="primarybtn"
                onClick={() => handleOpenLead(null, 'sample')}
              >
                Mekânında Gör / Numune İste ↗
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* TECHNICAL SECTION */}
      <section className="section technical" id="teknik">
        <div className="flex items-end justify-between gap-6 mb-8 flex-wrap">
          <div>
            <div className="text-[10px] font-bold tracking-widest uppercase text-[var(--accent)] mb-1">
              Karar Verirken Güvenle
            </div>
            <h2 className="text-3xl font-serif text-[var(--ink)]">
              Güzel Olduğu Kadar Bilinçli Bir Seçim
            </h2>
            <p className="text-xs text-[var(--muted)] mt-1 max-w-md">
              Teknik detaylar doğru ürünü seçmenize yardımcı olur.
            </p>
          </div>
          <a href="#urunler" className="text-xs font-bold text-[var(--accent)] hover:underline">
            Ürünleri karşılaştır ↗
          </a>
        </div>

        <div className="tech-grid">
          <div className="tech-card">
            <small>01 / Teknik şeffaflık</small>
            <h3 className="font-serif text-lg my-2 text-[var(--ink)]">Doğru ürün bilgisi</h3>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              Ebat, yüzey, ürün kodu ve teknik değerleri ürün bazında açıkça görüntüleyin.
            </p>
          </div>

          <div className="tech-card">
            <small>02 / Kolay keşif</small>
            <h3 className="font-serif text-lg my-2 text-[var(--ink)]">İhtiyacınıza göre filtre</h3>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              Projenizin ölçüsüne, görünümüne ve kullanım alanına uygun seramik seçeneklerini bulun.
            </p>
          </div>

          <div className="tech-card">
            <small>03 / Sonraki adım</small>
            <h3 className="font-serif text-lg my-2 text-[var(--ink)]">Numune ve teklif</h3>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              Beğendiğiniz ürünü kaydedin, numune veya fiyat teklifi talebine geçin.
            </p>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="cta">
        <div>
          <h2 className="text-2xl font-serif font-normal mb-1">Projeniz için doğru yüzeyi bulun.</h2>
          <p className="text-xs opacity-80">Ürünleri keşfedin, seçeneklerinizi belirleyin ve teklif sürecini başlatın.</p>
        </div>
        <button
          type="button"
          className="primarybtn"
          onClick={() => {
            document.getElementById('urunler')?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          Koleksiyonu keşfet&nbsp; ↗
        </button>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="flex items-center gap-2.5">
          {brandLogo && (
            <img
              src={brandLogo}
              alt={brandName}
              className="h-6 w-auto object-contain"
            />
          )}
          <div className="brand-title" style={{ fontSize: '18px' }}>
            {brandParts.length > 1 ? (
              <>
                {brandParts.slice(0, -1).join(' ')} <span>{brandParts[brandParts.length - 1]}</span>
              </>
            ) : (
              <span>{brandName}</span>
            )}
          </div>
        </div>
        <span>Marka ve ürün bilgileri ilgili veri kaynağından doğrulanmalıdır.</span>
        <span>© {year} {brandName} &bull; Mimari keşif deneyimi</span>
      </footer>

      {/* FLOATING TOAST NOTIFICATION */}
      <div className={`toast ${showToast ? 'show' : ''}`} role="status" aria-live="polite">
        {toastMessage}
      </div>

      {/* DETAIL LIGHTBOX MODAL */}
      {activeDetailProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={() => setActiveDetailProduct(null)}
        >
          <div
            className="relative max-w-3xl w-full bg-[var(--paper)] border border-[var(--line)] shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: 'var(--paper)', borderColor: 'var(--line)' }}
          >
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3 mb-4">
              <h3 className="text-base font-serif font-bold text-[var(--ink)]">
                {activeDetailProduct.name} &bull; 4K Doku İncelemesi
              </h3>
              <button
                type="button"
                onClick={() => setActiveDetailProduct(null)}
                className="iconbtn"
                aria-label="Kapat"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="aspect-square bg-stone-100 overflow-hidden border border-[var(--line)]">
                <img
                  src={activeDetailProduct.imageUrl || activeDetailProduct.textureUrl || '/renders/luxury_bathroom_calacatta_gold.jpg'}
                  alt={activeDetailProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex flex-col justify-between space-y-3">
                <div className="space-y-2 text-xs">
                  <p><strong>Ürün Kodu:</strong> {activeDetailProduct.code || 'Standart'}</p>
                  <p><strong>Ebat:</strong> {activeDetailProduct.width && activeDetailProduct.height ? `${activeDetailProduct.width}x${activeDetailProduct.height} cm` : (activeDetailProduct.size || 'Standart')}</p>
                  <p><strong>Yüzey:</strong> {activeDetailProduct.finish || 'Mat'}</p>
                  <p className="text-[var(--muted)] leading-relaxed pt-2">
                    Yüksek mukavemetli porselen karo yüzeyi. TS EN 14411 standartlarına tam uyumlu.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const p = activeDetailProduct;
                    setActiveDetailProduct(null);
                    handleOpenLead(p, 'quote');
                  }}
                  className="primarybtn w-full justify-center"
                >
                  Bu Ürün İçin Teklif Al
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LEAD MODAL */}
      {showLeadModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
          onClick={() => setShowLeadModal(false)}
        >
          <div
            className="relative max-w-md w-full bg-[var(--paper)] border border-[var(--line)] shadow-2xl p-6"
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
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 size={36} className="text-emerald-600 mx-auto" />
                <h3 className="text-lg font-serif font-bold text-[var(--ink)]">Talebiniz Alındı</h3>
                <p className="text-xs text-[var(--muted)]">
                  Talebiniz üretici marka proje masasına iletildi.
                </p>
                <button
                  type="button"
                  onClick={() => setShowLeadModal(false)}
                  className="outlinebtn mx-auto mt-4"
                >
                  Kapat
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setLeadSubmitted(true);
                  notify('Talebiniz başarıyla alındı!');
                }}
                className="space-y-4"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">
                    {brandName} Mimari Masası
                  </span>
                  <h3 className="text-lg font-serif font-bold text-[var(--ink)]">
                    {leadType === 'sample' ? 'Numune Talep Edin' : 'Fiyat Teklifi İsteyin'}
                  </h3>
                </div>

                <div className="space-y-2.5 text-xs">
                  <input
                    type="text"
                    required
                    placeholder="Adınız Soyadınız"
                    className="w-full p-2.5 border border-[var(--line)] bg-[var(--paper)] text-[var(--ink)] outline-none rounded"
                    value={leadForm.name}
                    onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Telefon Numaranız"
                    className="w-full p-2.5 border border-[var(--line)] bg-[var(--paper)] text-[var(--ink)] outline-none rounded"
                    value={leadForm.phone}
                    onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                  />
                  <textarea
                    rows={3}
                    placeholder="Metraj veya proje notlarınız..."
                    className="w-full p-2.5 border border-[var(--line)] bg-[var(--paper)] text-[var(--ink)] outline-none rounded resize-none"
                    value={leadForm.message}
                    onChange={(e) => setLeadForm({ ...leadForm, message: e.target.value })}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowLeadModal(false)}
                    className="outlinebtn"
                  >
                    Vazgeç
                  </button>
                  <button type="submit" className="primarybtn">
                    Talebi İlet ↗
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      {/* QR Code Modal */}
      {showQrModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setShowQrModal(false)}
        >
          <div
            className="relative max-w-sm w-full bg-[var(--paper)] rounded-2xl border border-[var(--line)] p-6 shadow-2xl text-center space-y-4"
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: 'var(--paper)', borderColor: 'var(--line)' }}
          >
            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-black/5 text-[var(--muted)]"
            >
              <X size={18} />
            </button>
            <div className="w-12 h-12 rounded-full bg-[var(--accent-light)] flex items-center justify-center mx-auto" style={{ color: 'var(--accent)' }}>
              <QrCode size={24} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--ink)]">Katalog QR Kodu</h3>
              <p className="text-xs text-[var(--muted)] mt-1">
                Kameranızla okutarak bu mimari lookbook'u mobil cihazınızda anında açabilirsiniz.
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-stone-200 inline-block mx-auto shadow-xs">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(currentUrl)}`}
                alt="Katalog QR Kodu"
                className="w-48 h-48 block"
              />
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="primarybtn w-full justify-center text-xs"
              >
                {copied ? 'Bağlantı Kopyalandı! ✓' : 'Bağlantıyı Kopyala'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
