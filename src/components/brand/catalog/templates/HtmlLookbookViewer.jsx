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
  QrCode,
  Sun,
  Lightbulb,
  Sliders,
  Bookmark,
  Pin,
  PinOff,
  Scale,
  Ruler,
  FileText,
  Flame,
  Award,
  Box,
  Building2,
  Download
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
  const brandSlug = brand.slug || catalog?.brandSlug || (brandName ? brandName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-') : 'bien-seramik');
  const sec = catalog?.sectionSettings || {};

  // Active color template
  const [activeThemeId, setActiveThemeId] = useState(catalog?.template || 'terra-traverten');
  const [showThemePicker, setShowThemePicker] = useState(false);
  const themePickerRef = useRef(null);

  // Interactive Lighting Simulation ('natural' 5500K | 'warm' 3000K | 'studio' 4000K)
  const [lightMode, setLightMode] = useState('natural');

  // Architectural Moodboard Tray (Pinned Slabs)
  const [pinnedSlabs, setPinnedSlabs] = useState([]);

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
  const [selectedLeadProductObj, setSelectedLeadProductObj] = useState(null);
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [submitError, setSubmitError] = useState('');
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

  // Toggle Pinned Slab for Architectural Moodboard
  const handleTogglePinSlab = (p, e) => {
    if (e) e.stopPropagation();
    const key = p.id || p.code || p.name;
    const exists = pinnedSlabs.some((s) => (s.id || s.code || s.name) === key);
    if (exists) {
      setPinnedSlabs((prev) => prev.filter((s) => (s.id || s.code || s.name) !== key));
      notify(`"${p.name}" numune masasından kaldırıldı.`);
    } else {
      if (pinnedSlabs.length >= 6) {
        notify('En fazla 6 numune seçebilirsiniz.');
        return;
      }
      setPinnedSlabs((prev) => [...prev, p]);
      notify(`"${p.name}" mimari numune masasına eklendi! ✓`);
    }
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
      setSelectedLeadProductObj(product);
    } else {
      setSelectedLeadProducts(products.slice(0, 3).map((p) => p.name || p.code));
      setSelectedLeadProductObj(products[0] || null);
    }
    setLeadType(type);
    setSubmitError('');
    setLeadSubmitted(false);
    setShowLeadModal(true);
  };

  const handleOpenLeadForPinned = (type = 'quote') => {
    if (pinnedSlabs.length === 0) return;
    setSelectedLeadProducts(pinnedSlabs.map((s) => s.name || s.code));
    setSelectedLeadProductObj(pinnedSlabs[0] || null);
    setLeadType(type);
    setSubmitError('');
    setLeadSubmitted(false);
    setShowLeadModal(true);
  };

  const handleOpen3DStudio = (productObj, e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!productObj) {
      window.location.href = '/?tab=studio#studio';
      return;
    }
    const pImage = productObj.imageUrl || productObj.textureUrl || '/renders/luxury_bathroom_calacatta_gold.jpg';
    const tilePayload = {
      id: productObj.id || productObj.code || 'tile',
      code: productObj.code || '',
      name: productObj.name || 'Seçili Karo',
      slug: productObj.slug || productObj.code || '',
      imageUrl: pImage,
      textureUrl: pImage,
      width: productObj.width || 60,
      height: productObj.height || 120,
      finish: productObj.finish || 'Porselen',
      brand: { name: brandName }
    };
    try {
      localStorage.setItem('seramikbak_preselected_product', JSON.stringify(tilePayload));
    } catch {}

    const qs = new URLSearchParams({
      tab: 'studio',
      product: productObj.code || productObj.slug || productObj.id || '',
      name: productObj.name || '',
      texture: pImage
    }).toString();

    window.location.href = `/?${qs}#studio`;
  };

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    if (!leadForm.name || !leadForm.phone) {
      setSubmitError('Lütfen ad soyad ve telefon numaranızı girin.');
      return;
    }

    setIsSubmittingLead(true);
    setSubmitError('');

    try {
      const effectiveSlug =
        catalog?.publicSlug ||
        catalog?.slug ||
        (typeof window !== 'undefined'
          ? window.location.pathname.split('/katalog/')[1]?.split('/')[0]?.split('#')[0]?.split('?')[0]
          : '');

      const payload = {
        catalogId: catalog?.id,
        catalogSlug: effectiveSlug,
        brandId: catalog?.brandId || catalog?.brand?.id,
        leadType,
        name: leadForm.name.trim(),
        company: (leadForm.company || '').trim(),
        email: (leadForm.email || '').trim(),
        phone: leadForm.phone.trim(),
        selectedProducts: selectedLeadProducts,
        message: (leadForm.message || '').trim()
      };

      const res = await fetch('/api/brand/catalogs/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setLeadSubmitted(true);
        notify(data.message || 'Talebiniz üretici marka masasına başarıyla iletildi!');
      } else {
        setSubmitError(data.error || 'Talep iletilemedi. Lütfen tekrar deneyin.');
      }
    } catch (err) {
      setSubmitError('Bağlantı hatası: ' + err.message);
    } finally {
      setIsSubmittingLead(false);
    }
  };

  const getProductLabel = (p) => {
    const finish = (p.finish || p.surface || '').toLowerCase();
    const name = (p.name || '').toLowerCase();
    if (finish.includes('lappato')) return 'Full Lappato';
    if (name.includes('ahşap') || name.includes('meşe') || name.includes('ceviz')) return 'Ahşap Dokusu';
    if (name.includes('mermer') || name.includes('zenith') || name.includes('calacatta')) return 'Mermer Karakteri';
    if (finish.includes('parlak')) return 'Ayna Parlak';
    if (finish.includes('mat')) return 'Doğal Mat';
    return 'Mimari Porselen';
  };

  const coverImage =
    sec.coverImageUrl ||
    catalog?.customCoverUrl ||
    catalog?.coverImageUrl ||
    currentTheme.previewImg ||
    (products.length > 0 && (products[0].imageUrl || products[0].textureUrl)) ||
    '/renders/luxury_bathroom_calacatta_gold.jpg';

  const year = new Date().getFullYear();

  return (
    <div
      id="seramikbak-lookbook-root"
      className={`seramikbak-lookbook-app layout-${layoutType} light-${lightMode} w-full`}
      style={currentTheme.vars}
    >
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..800;1,6..96,400..700&family=Cinzel:wght@400;600;700;900&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,400;1,600&family=JetBrains+Mono:wght@400;500;600&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;1,6..72,400&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&family=Syne:wght@500;700;800&display=swap');

        .seramikbak-lookbook-app {
          background-color: var(--site-background);
          color: var(--site-on-background);
          font-family: var(--site-font-body, 'Plus Jakarta Sans', -apple-system, sans-serif);
          font-size: 14px;
          line-height: 1.6;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          transition: background-color .4s cubic-bezier(0.16, 1, 0.3, 1), color .4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* -------------------------------------------------------------
           LIGHTING SIMULATOR COLOR GRADING (SURFACES & EDITORIAL ONLY)
        ------------------------------------------------------------- */
        .seramikbak-lookbook-app.light-natural .product-img img,
        .seramikbak-lookbook-app.light-natural .editorial-photo img {
          filter: saturate(1.02) contrast(1.02);
          transition: filter .4s ease;
        }
        .seramikbak-lookbook-app.light-warm .product-img img,
        .seramikbak-lookbook-app.light-warm .editorial-photo img {
          filter: sepia(0.18) saturate(1.15) brightness(1.03) contrast(1.02);
          transition: filter .4s ease;
        }
        .seramikbak-lookbook-app.light-studio .product-img img,
        .seramikbak-lookbook-app.light-studio .editorial-photo img {
          filter: brightness(1.02) contrast(1.12) saturate(1.05);
          transition: filter .4s ease;
        }

        /* TOPLINE */
        .seramikbak-lookbook-app .topline {
          height: 36px;
          border-bottom: 1px solid var(--line);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 5.5%;
          font-size: 11px;
          color: var(--muted);
          letter-spacing: .06em;
          background-color: var(--site-background);
        }
        .seramikbak-lookbook-app .topline strong {
          color: var(--ink);
          letter-spacing: .14em;
          font-weight: 700;
        }

        /* NAVBAR */
        .seramikbak-lookbook-app .nav {
          height: 78px;
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
          backdrop-filter: blur(12px);
          transition: background-color .3s, border-color .3s;
        }
        .seramikbak-lookbook-app .brand-title {
          font-family: var(--site-font-heading, Georgia, serif);
          font-size: 24px;
          font-weight: 700;
          letter-spacing: -.03em;
          white-space: nowrap;
          color: var(--ink);
          text-decoration: none;
        }
        .seramikbak-lookbook-app .brand-title span {
          color: var(--accent);
        }
        .seramikbak-lookbook-app .navlinks {
          display: flex;
          gap: 28px;
          color: var(--muted);
          font-size: 12px;
          font-weight: 500;
          align-items: center;
          letter-spacing: .04em;
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
          transform: translateY(-1px);
        }
        .seramikbak-lookbook-app .outlinebtn, .seramikbak-lookbook-app .primarybtn {
          padding: 12px 18px;
          border-radius: var(--card-radius, 4px);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: .08em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all .25s ease;
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
          background: rgba(0,0,0,0.02);
        }
        .seramikbak-lookbook-app .primarybtn {
          border: 1px solid var(--accent);
          background: var(--accent);
          color: var(--site-on-primary, #ffffff);
          box-shadow: 0 4px 14px -3px var(--accent);
        }
        .seramikbak-lookbook-app .primarybtn:hover {
          filter: brightness(.92);
          transform: translateY(-1px);
        }

        /* -------------------------------------------------------------
           SPECULAR SHEEN / REFLECTION EFFECT ON TILES
        ------------------------------------------------------------- */
        .seramikbak-lookbook-app .product-img {
          position: relative;
          overflow: hidden;
          background: var(--product-img-bg, #ece9e3);
        }
        .seramikbak-lookbook-app .product-img:after {
          content: "";
          position: absolute;
          top: 0;
          left: -160%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.22) 50%,
            transparent 100%
          );
          transform: skewX(-25deg);
          transition: left 0.8s ease;
          pointer-events: none;
          z-index: 3;
        }
        .seramikbak-lookbook-app .product:hover .product-img:after {
          left: 160%;
        }

        /* -------------------------------------------------------------
           HERO 1: Asymmetric Editorial (terra-traverten)
        ------------------------------------------------------------- */
        .layout-editorial-asymmetric .hero {
          background: var(--hero-bg, #262a27);
          color: var(--hero-text, #f8f5ef);
          min-height: 560px;
          display: grid;
          grid-template-columns: 1.15fr .85fr;
          position: relative;
          overflow: hidden;
        }
        .layout-editorial-asymmetric .hero-copy {
          padding: 85px 0 75px 9%;
          position: relative;
          z-index: 2;
        }
        .layout-editorial-asymmetric .hero h1 {
          font-family: var(--site-font-heading, 'Cormorant Garamond', serif);
          font-weight: 300;
          font-size: clamp(44px, 5.2vw, 76px);
          line-height: 1.02;
          letter-spacing: -.03em;
          max-width: 680px;
          margin: 20px 0;
          color: var(--hero-text, #f8f5ef);
        }
        .layout-editorial-asymmetric .hero h1 em {
          color: var(--hero-em, #c4a47a);
          font-style: italic;
          font-weight: 400;
        }
        .layout-editorial-asymmetric .hero-visual {
          position: relative;
          min-height: 480px;
          overflow: hidden;
        }
        .layout-editorial-asymmetric .hero-visual:before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, var(--hero-bg, #262a27) 0%, rgba(38,42,39,.15) 50%, rgba(38,42,39,.04) 100%);
          z-index: 1;
        }
        .layout-editorial-asymmetric .hero-stamp {
          position: absolute;
          z-index: 2;
          right: 9%;
          bottom: 42px;
          border: 1px solid var(--hero-stamp-border, rgba(255, 255, 255, .45));
          padding: 20px 24px;
          background: var(--hero-stamp-bg, rgba(30, 33, 30, .68));
          backdrop-filter: blur(12px);
          max-width: 260px;
          border-radius: 4px;
        }

        /* -------------------------------------------------------------
           HERO 2: Cinema Fullwidth Monolith (obsidian-gold)
        ------------------------------------------------------------- */
        .layout-cinema-fullwidth .hero {
          min-height: 84vh;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 90px 24px;
          background: #06080c;
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
          filter: brightness(0.32) contrast(1.15);
        }
        .layout-cinema-fullwidth .hero-backdrop:after {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, transparent 25%, rgba(6,8,12,0.92) 100%), linear-gradient(0deg, #06080c 0%, transparent 60%);
        }
        .layout-cinema-fullwidth .hero-content-cinema {
          position: relative;
          z-index: 2;
          max-width: 950px;
          margin: 0 auto;
        }
        .layout-cinema-fullwidth .cinema-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 7px 18px;
          border-radius: 30px;
          background: rgba(197, 160, 89, 0.12);
          border: 1px solid rgba(197, 160, 89, 0.45);
          color: #fae29c;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .25em;
          text-transform: uppercase;
          margin-bottom: 24px;
        }
        .layout-cinema-fullwidth .hero h1 {
          font-family: var(--site-font-heading, 'Cinzel', serif);
          font-size: clamp(48px, 6vw, 88px);
          font-weight: 400;
          letter-spacing: -0.02em;
          line-height: 1.05;
          margin: 0 0 24px;
          background: linear-gradient(135deg, #ffffff 0%, #fae29c 50%, #c5a059 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        /* -------------------------------------------------------------
           HERO 3: Swiss Bauhaus Industrial (nordic-loft)
        ------------------------------------------------------------- */
        .layout-swiss-industrial .hero {
          background: var(--hero-bg, #1e293b);
          color: #ffffff;
          padding: 45px 5.5% 65px;
        }
        .layout-swiss-industrial .swiss-coord-bar {
          border-bottom: 1px solid rgba(255,255,255,0.15);
          padding-bottom: 14px;
          margin-bottom: 40px;
          display: flex;
          justify-content: space-between;
          font-family: var(--site-font-mono, monospace);
          font-size: 11px;
          color: #94a3b8;
          letter-spacing: .12em;
        }
        .layout-swiss-industrial .swiss-grid {
          display: grid;
          grid-template-columns: 1.25fr 1fr;
          gap: 45px;
          align-items: center;
        }
        .layout-swiss-industrial .hero h1 {
          font-family: var(--site-font-heading, 'Space Grotesk', sans-serif);
          font-weight: 700;
          font-size: clamp(38px, 4.6vw, 66px);
          letter-spacing: -0.04em;
          text-transform: uppercase;
          line-height: 1.02;
          margin: 0 0 24px;
        }
        .layout-swiss-industrial .swiss-frame {
          position: relative;
          border: 1px solid rgba(255,255,255,0.25);
          padding: 10px;
          background: rgba(255,255,255,0.04);
        }
        .layout-swiss-industrial .swiss-frame img {
          width: 100%;
          height: 400px;
          object-fit: cover;
          display: block;
        }

        /* -------------------------------------------------------------
           HERO 4: Organic Wellness Sanctuary (sage-forest)
        ------------------------------------------------------------- */
        .layout-organic-wellness .hero {
          background: #1c2820;
          color: #f2f7f3;
          padding: 65px 5.5% 75px;
        }
        .layout-organic-wellness .organic-hero-box {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 45px;
          align-items: center;
        }
        .layout-organic-wellness .hero h1 {
          font-family: var(--site-font-heading, 'Newsreader', serif);
          font-size: clamp(40px, 4.4vw, 64px);
          font-weight: 400;
          line-height: 1.08;
          color: #ffffff;
          margin: 18px 0;
        }
        .layout-organic-wellness .organic-img-wrap {
          border-radius: 28px;
          overflow: hidden;
          box-shadow: 0 25px 55px rgba(0,0,0,0.38);
          height: 430px;
        }
        .layout-organic-wellness .organic-img-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* -------------------------------------------------------------
           HERO 5: Mediterranean Book Spread (terracotta-sun)
        ------------------------------------------------------------- */
        .layout-mediterranean-book .hero {
          background: #2d1b15;
          color: #faf4ef;
          padding: 75px 5.5% 85px;
        }
        .layout-mediterranean-book .book-spread {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 55px;
          align-items: center;
        }
        .layout-mediterranean-book .hero h1 {
          font-family: var(--site-font-heading, 'Bodoni Moda', serif);
          font-size: clamp(42px, 4.8vw, 68px);
          font-weight: 400;
          line-height: 1.06;
          margin: 20px 0;
          color: #fff;
        }
        .layout-mediterranean-book .book-card {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.18);
          padding: 34px;
          border-radius: 8px;
        }

        /* -------------------------------------------------------------
           HERO 6: Gallery Minimal White-Cube (carrara-pure)
        ------------------------------------------------------------- */
        .layout-gallery-minimal .hero {
          background: #ffffff;
          color: #18181b;
          border-bottom: 1px solid #e4e4e7;
          padding: 75px 5.5% 85px;
          text-align: center;
        }
        .layout-gallery-minimal .hero h1 {
          font-family: var(--site-font-heading, 'Playfair Display', serif);
          font-size: clamp(44px, 5.2vw, 76px);
          font-weight: 300;
          letter-spacing: -0.03em;
          color: #18181b;
          margin: 20px auto 24px;
          max-width: 850px;
        }
        .layout-gallery-minimal .gallery-hero-photo {
          max-width: 980px;
          margin: 40px auto 0;
          border: 1px solid #18181b;
          padding: 12px;
          background: #ffffff;
          box-shadow: 0 30px 60px -20px rgba(0,0,0,0.08);
        }
        .layout-gallery-minimal .gallery-hero-photo img {
          width: 100%;
          height: 440px;
          object-fit: cover;
          display: block;
        }

        /* -------------------------------------------------------------
           PRODUCTS GRID & LUXURY CARDS
        ------------------------------------------------------------- */
        .seramikbak-lookbook-app .section {
          padding: 85px 7%;
        }
        .seramikbak-lookbook-app .products {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 32px 22px;
        }
        .layout-cinema-fullwidth .products,
        .layout-gallery-minimal .products {
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 36px 26px;
        }

        .seramikbak-lookbook-app .product {
          background: var(--paper);
          border: 1px solid var(--line);
          border-radius: var(--card-radius, 4px);
          min-width: 0;
          transition: transform .3s cubic-bezier(0.16, 1, 0.3, 1), border-color .3s, box-shadow .3s;
          display: flex;
          flex-direction: column;
          box-shadow: var(--card-shadow, 0 10px 25px -10px rgba(0,0,0,0.06));
        }
        .seramikbak-lookbook-app .product:hover {
          transform: translateY(-5px);
          border-color: var(--product-hover-border, var(--accent));
          box-shadow: 0 20px 40px -10px rgba(0,0,0,0.15);
        }

        /* Cinema Monolith card */
        .layout-cinema-fullwidth .product {
          background: rgba(19, 24, 34, 0.85);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(197, 160, 89, 0.25);
        }
        .layout-cinema-fullwidth .product:hover {
          border-color: #fae29c;
          box-shadow: 0 16px 40px rgba(197, 160, 89, 0.2);
        }

        /* Swiss Industrial card */
        .layout-swiss-industrial .product {
          position: relative;
        }
        .layout-swiss-industrial .product:before {
          content: "+";
          position: absolute;
          top: -6px;
          left: -6px;
          font-family: var(--site-font-mono, monospace);
          font-size: 11px;
          color: var(--accent);
          z-index: 10;
        }
        .layout-swiss-industrial .product:after {
          content: "+";
          position: absolute;
          top: -6px;
          right: -6px;
          font-family: var(--site-font-mono, monospace);
          font-size: 11px;
          color: var(--accent);
          z-index: 10;
        }

        .seramikbak-lookbook-app .product-img {
          aspect-ratio: 1.15;
        }
        .layout-cinema-fullwidth .product-img {
          aspect-ratio: 1.35;
        }
        .seramikbak-lookbook-app .product-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform .6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .seramikbak-lookbook-app .product:hover .product-img img {
          transform: scale(1.04);
        }

        .seramikbak-lookbook-app .product-label {
          position: absolute;
          left: 12px;
          top: 12px;
          background: var(--paper, #fffefa);
          color: var(--ink);
          font-size: 9px;
          font-weight: 700;
          padding: 5px 9px;
          letter-spacing: .12em;
          text-transform: uppercase;
          border: 1px solid var(--line);
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          border-radius: 3px;
          z-index: 4;
        }
        .seramikbak-lookbook-app .card-floating-actions {
          position: absolute;
          right: 12px;
          top: 12px;
          display: flex;
          gap: 6px;
          z-index: 4;
        }
        .seramikbak-lookbook-app .card-icon-btn {
          background: var(--paper, #fffefa);
          border: 1px solid var(--line);
          width: 32px;
          height: 32px;
          border-radius: 50%;
          color: var(--ink);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all .2s;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        .seramikbak-lookbook-app .card-icon-btn:hover {
          transform: scale(1.1);
          border-color: var(--accent);
          color: var(--accent);
        }
        .seramikbak-lookbook-app .card-3d-btn {
          background: rgba(18, 22, 19, 0.88);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.22);
          color: #ffffff;
          height: 32px;
          padding: 0 10px;
          border-radius: 16px;
          font-size: 10px;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          cursor: pointer;
          transition: all .2s;
          text-decoration: none;
          box-shadow: 0 2px 8px rgba(0,0,0,0.25);
        }
        .seramikbak-lookbook-app .card-3d-btn:hover {
          background: var(--accent);
          border-color: var(--accent);
          color: #ffffff;
          transform: scale(1.05);
        }

        .seramikbak-lookbook-app .product-info {
          padding: 18px 18px 16px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .seramikbak-lookbook-app .product-series {
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: .15em;
          color: var(--accent);
          margin-bottom: 6px;
          font-weight: 700;
        }
        .seramikbak-lookbook-app .product h3 {
          font-family: var(--site-font-heading, Georgia, serif);
          font-weight: 500;
          font-size: 20px;
          margin: 0 0 10px;
          line-height: 1.15;
          color: var(--ink);
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
          margin-top: 16px;
        }
        .seramikbak-lookbook-app .product-actions button {
          flex: 1;
          padding: 12px 6px;
          border: 0;
          background: transparent;
          color: var(--ink);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .06em;
          text-transform: uppercase;
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

        /* -------------------------------------------------------------
           EDITORIAL & TECHNICAL SECTIONS
        ------------------------------------------------------------- */
        .seramikbak-lookbook-app .editorial {
          background: var(--editorial-bg, #eeece5);
          transition: background-color .3s;
        }
        .seramikbak-lookbook-app .editorial-grid {
          display: grid;
          grid-template-columns: 1.12fr .88fr;
          gap: 6%;
          align-items: center;
        }
        .seramikbak-lookbook-app .editorial-photo {
          position: relative;
          min-height: 500px;
          overflow: hidden;
          border-radius: var(--card-radius, 4px);
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
          left: 24px;
          bottom: 24px;
          background: var(--editorial-caption-bg, rgba(31,34,30,.86));
          color: #fff;
          padding: 14px 18px;
          font-size: 10px;
          letter-spacing: .12em;
          text-transform: uppercase;
          border-radius: 3px;
        }

        .seramikbak-lookbook-app .technical {
          background: var(--paper);
          transition: background-color .3s;
        }
        .seramikbak-lookbook-app .tech-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-top: 36px;
        }
        .seramikbak-lookbook-app .tech-card {
          border: 1px solid var(--line);
          padding: 28px;
          background: var(--paper);
          border-radius: var(--card-radius, 4px);
          transition: border-color .2s, transform .2s;
        }
        .seramikbak-lookbook-app .tech-card:hover {
          border-color: var(--accent);
          transform: translateY(-2px);
        }

        .seramikbak-lookbook-app .cta {
          margin: 0 7% 75px;
          padding: 48px 52px;
          background: var(--cta-bg, #282d29);
          color: var(--cta-text, #ffffff);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 32px;
          border-radius: var(--card-radius, 4px);
        }

        .seramikbak-lookbook-app .footer {
          padding: 32px 7%;
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
          bottom: 24px;
          left: 50%;
          transform: translate(-50%, 20px);
          background: var(--hero-bg, #262a27);
          color: #ffffff;
          padding: 14px 24px;
          z-index: 90;
          opacity: 0;
          pointer-events: none;
          transition: all .25s ease;
          font-size: 12px;
          box-shadow: 0 16px 36px rgba(0,0,0,0.3);
          border-radius: 30px;
        }
        .seramikbak-lookbook-app .toast.show {
          opacity: 1;
          transform: translate(-50%, 0);
          pointer-events: auto;
        }

        @media(max-width:1050px) {
          .layout-editorial-asymmetric .hero { grid-template-columns: 1fr .75fr; }
          .layout-swiss-industrial .swiss-grid { grid-template-columns: 1fr; }
          .layout-organic-wellness .organic-hero-box { grid-template-columns: 1fr; }
          .layout-mediterranean-book .book-spread { grid-template-columns: 1fr; }
          .seramikbak-lookbook-app .products { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
        }
        @media(max-width:700px) {
          .seramikbak-lookbook-app .topline { padding: 0 4%; font-size: 8.5px; }
          .seramikbak-lookbook-app .nav { height: 58px; padding: 0 4%; gap: 10px; }
          .seramikbak-lookbook-app .brand-title { font-size: 16px !important; }
          .seramikbak-lookbook-app .navlinks { display: none; }
          .seramikbak-lookbook-app .navright { gap: 6px; }
          .seramikbak-lookbook-app .navright .iconbtn { width: 34px; height: 34px; }
          .seramikbak-lookbook-app .navright .primarybtn,
          .seramikbak-lookbook-app .navright .outlinebtn {
            padding: 8px 11px;
            font-size: 10px;
            height: 34px;
          }
          .layout-editorial-asymmetric .hero { display: flex; flex-direction: column; }
          .layout-editorial-asymmetric .hero-copy { padding: 36px 5% 30px !important; }
          .layout-editorial-asymmetric .hero h1 { font-size: clamp(28px, 7vw, 42px) !important; line-height: 1.12 !important; }
          .layout-editorial-asymmetric .hero-visual { min-height: 240px; height: 260px; }
          .layout-editorial-asymmetric .hero-stamp { bottom: 14px; right: 4%; left: 4%; max-width: none; padding: 12px 14px; }
          .layout-cinema-fullwidth .hero { padding: 60px 4% 40px !important; min-height: auto !important; }
          .layout-cinema-fullwidth .hero h1 { font-size: clamp(26px, 7vw, 38px) !important; }
          .seramikbak-lookbook-app .products { grid-template-columns: 1fr !important; }
          .seramikbak-lookbook-app .editorial-grid { grid-template-columns: 1fr; gap: 28px; }
          .seramikbak-lookbook-app .tech-grid { grid-template-columns: 1fr; }
          .seramikbak-lookbook-app .cta { margin: 0 4% 40px; padding: 26px 20px; flex-direction: column; align-items: flex-start; }
          .seramikbak-lookbook-app .cta .primarybtn { width: 100%; justify-content: center; margin-top: 12px; }
          .seramikbak-lookbook-app .footer { padding: 20px 4%; flex-direction: column; align-items: flex-start; }
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
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            {brandLogo && (
              <img
                src={brandLogo}
                alt={brandName}
                className="h-6 sm:h-8 w-auto object-contain flex-shrink-0"
              />
            )}
            <span className="brand-title truncate">
              {brandParts.length > 1 ? (
                <>
                  {brandParts.slice(0, -1).join(' ')} <span>{brandParts[brandParts.length - 1]}</span>
                </>
              ) : (
                <span>{brandName}</span>
              )}
            </span>
          </div>
          <span className="hidden md:inline-block whitespace-nowrap text-[10px] tracking-wider font-semibold text-[var(--muted)]">
            {currentTheme.badge}
          </span>
        </div>

        <div className="navlinks">
          <a href="#koleksiyon">Koleksiyon</a>
          <a href="#urunler">Ürünler</a>
          {sec.showEditorial !== false && <a href="#mekanlar">Mekân İlhamı</a>}
          {sec.showTechnical !== false && <a href="#teknik">Teknik Şartname</a>}
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

          {/* COLOR & LAYOUT THEME SELECTOR DROPDOWN */}
          <div className="relative" ref={themePickerRef}>
            <button
              type="button"
              onClick={() => setShowThemePicker(!showThemePicker)}
              className="outlinebtn flex items-center gap-1.5"
              title="Mimari Şablon Değiştir"
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
                    Mimari Şablon ve Mizanpaj Seçin
                  </p>
                  <p className="text-[11px] text-[var(--muted)]">
                    Farklı marka ve atmosfer konseptlerini canlı test edin.
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

          {/* 3D Modeling Studio shortcut */}
          <Link
            href="/?tab=studio#studio"
            className="outlinebtn hidden md:inline-flex items-center gap-1.5"
            title="3D Mekân & Tasarım Stüdyosunu Aç"
          >
            <Box size={13} style={{ color: 'var(--accent)' }} />
            <span>3D Stüdyo ↗</span>
          </Link>

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
            <div className="grid grid-cols-2 gap-2.5 sm:flex sm:items-center sm:gap-3 mt-6 sm:mt-8 w-full sm:w-auto">
              <button
                type="button"
                className="primarybtn flex-1 justify-center text-center h-11 text-xs"
                onClick={() => {
                  document.getElementById('urunler')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Koleksiyonu Keşfet ↘
              </button>
              <button
                type="button"
                className="outlinebtn flex-1 justify-center text-center h-11 text-xs"
                style={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.4)' }}
                onClick={() => {
                  document.getElementById('mekanlar')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Mekân İlhamı
              </button>
            </div>
            <div className="grid grid-cols-3 gap-6 pt-10 border-t border-white/10 mt-10 text-xs">
              <div>
                <strong className="block text-base font-serif text-white">{year}</strong>
                <span className="text-stone-300">Yeni Koleksiyon</span>
              </div>
              <div>
                <strong className="block text-base font-serif text-white">{products.length} Karo</strong>
                <span className="text-stone-300">Seçili Yüzey</span>
              </div>
              <div>
                <strong className="block text-base font-serif text-white">İtalya & TR</strong>
                <span className="text-stone-300">Mimari Seçki</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <img src={coverImage} alt={catalog?.title || 'Katalog Kapağı'} />
            <div className="hero-stamp">
              <span className="text-[10px] tracking-widest uppercase text-amber-200 block mb-1">
                {sec.heroBadgeText || 'MALZEMENİN DİLİ'}
              </span>
              <strong className="text-sm font-serif text-white leading-tight block whitespace-pre-line">
                {sec.heroStampText || (
                  <>
                    Doğadan ilham.<br />
                    Mimariyle hayat bulur.
                  </>
                )}
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
              <span>{sec.heroBadgeText || `MİLANO CERSAIE EDİSYONU • ${year}`}</span>
            </div>

            <h1>
              {catalog?.title || 'Milano Architectural Lookbook'}
            </h1>

            <div className="w-20 h-0.5 bg-[var(--accent)] mx-auto mb-6" />

            <p className="max-w-2xl mx-auto text-stone-200 text-base leading-relaxed mb-8 font-light">
              {catalog?.introText ||
                catalog?.description ||
                'Dev ebat seramik ve porselen slablar için tam ekran sinematik kapak, obsidian cam kartlar ve ışıltılı altın detaylar.'}
            </p>

            <div className="grid grid-cols-2 gap-2.5 sm:flex sm:items-center sm:justify-center sm:gap-4 max-w-md mx-auto">
              <button
                type="button"
                className="primarybtn flex-1 justify-center text-center h-11 text-xs px-3 sm:px-6"
                onClick={() => {
                  document.getElementById('urunler')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Koleksiyonu İncele ↘
              </button>
              <button
                type="button"
                className="outlinebtn flex-1 justify-center text-center h-11 text-xs px-3 sm:px-6"
                style={{ borderColor: 'rgba(197, 160, 89, 0.45)', color: '#fae29c' }}
                onClick={() => handleOpenLead(null, 'quote')}
              >
                Fiyat Teklifi Al ↗
              </button>
            </div>
          </div>
        </header>
      )}

      {/* LAYOUT 3: Swiss Bauhaus Industrial (nordic-loft) */}
      {layoutType === 'swiss-industrial' && (
        <header className="hero" id="koleksiyon">
          <div className="swiss-coord-bar">
            <span>{sec.heroBadgeText || 'SPEC: DIN-EN-14411 // BLa PORCELAIN'}</span>
            <span>SCALE: 1:20 // RECTIFIED</span>
            <span>DATE: {sec.heroYear || year} ARCH-EDITION</span>
          </div>

          <div className="swiss-grid">
            <div>
              <div className="text-[11px] font-mono tracking-widest uppercase text-blue-300 mb-2">
                INDEX 01 / {brandName} ARCHITECTURAL SLABS
              </div>
              <h1>{catalog?.title || 'Nordic Loft & Concrete'}</h1>
              <p className="text-slate-300 text-sm leading-relaxed mb-8 max-w-lg">
                {catalog?.introText ||
                  catalog?.description ||
                  'Beton ve çimento dokuları için brütist Bauhaus mizanpajı, net geometrik çizgiler, teknik koordinatlar ve milimetrik şartname.'}
              </p>
              <div className="grid grid-cols-2 gap-2.5 sm:flex sm:items-center sm:gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  className="primarybtn flex-1 justify-center text-center h-11 text-xs px-3 sm:px-6"
                  onClick={() => {
                    document.getElementById('urunler')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Plakaları Listele ↘
                </button>
                <button
                  type="button"
                  className="outlinebtn flex-1 justify-center text-center h-11 text-xs px-3 sm:px-6"
                  style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}
                  onClick={() => handleOpenLead(null, 'sample')}
                >
                  Numune Talep Et ↗
                </button>
              </div>
            </div>

            <div className="swiss-frame">
              <img src={coverImage} alt="Swiss Frame Hero" />
            </div>
          </div>
        </header>
      )}

      {/* LAYOUT 4: Organic Wellness Sanctuary (sage-forest) */}
      {layoutType === 'organic-wellness' && (
        <header className="hero" id="koleksiyon">
          <div className="organic-hero-box">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-[10px] font-semibold tracking-wider uppercase mb-3">
                <ShieldCheck size={12} />
                <span>{sec.heroBadgeText || 'BİYOFİLİK MİMARİ & SPA • %100 DOĞAL KİL'}</span>
              </div>
              <h1>{catalog?.title || 'Doğanın Dinginliği ve Yaşam Alanları'}</h1>
              <p className="text-emerald-100/80 text-sm leading-relaxed mb-8 max-w-lg">
                {catalog?.introText ||
                  catalog?.description ||
                  'Yeşil tonlu karolar ve spa alanları için yuvarlatılmış organik kartlar, biophilic mimari felsefe ve ferah adaçayı harmonisi.'}
              </p>
              <div className="grid grid-cols-2 gap-2.5 sm:flex sm:items-center sm:gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  className="primarybtn flex-1 justify-center text-center h-11 text-xs px-3 sm:px-6"
                  onClick={() => {
                    document.getElementById('urunler')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Yüzeyleri Keşfet ↘
                </button>
                <button
                  type="button"
                  className="outlinebtn flex-1 justify-center text-center h-11 text-xs px-3 sm:px-6"
                  style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}
                  onClick={() => handleOpenLead(null, 'sample')}
                >
                  Numune İste ↗
                </button>
              </div>
            </div>

            <div className="organic-img-wrap">
              <img src={coverImage} alt="Organic Sanctuary Hero" />
            </div>
          </div>
        </header>
      )}

      {/* LAYOUT 5: Mediterranean Book Spread (terracotta-sun) */}
      {layoutType === 'mediterranean-book' && (
        <header className="hero" id="koleksiyon">
          <div className="book-spread">
            <div>
              <div className="text-[10px] tracking-widest uppercase text-amber-300 font-mono mb-2">
                {sec.heroBadgeText || '[FOLIO I • ARTISAN MONOGRAPH]'}
              </div>
              <h1>{catalog?.title || 'Pişmiş Toprak & Akdeniz Işığı'}</h1>
              <p className="text-amber-100/80 text-sm leading-relaxed mb-6">
                {catalog?.introText ||
                  catalog?.description ||
                  'Sıcak Akdeniz güneşi, pişmiş toprak ve zanaatkar seramikler için çift sayfalı kitap düzeni, kiremit ve sıcak kum rengi tonları.'}
              </p>
              <div className="grid grid-cols-2 gap-2.5 sm:flex sm:items-center sm:gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  className="primarybtn flex-1 justify-center text-center h-11 text-xs px-3 sm:px-6"
                  onClick={() => {
                    document.getElementById('urunler')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Seçkiyi Aç ↘
                </button>
                <button
                  type="button"
                  className="outlinebtn flex-1 justify-center text-center h-11 text-xs px-3 sm:px-6"
                  style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}
                  onClick={() => handleOpenLead(null, 'quote')}
                >
                  Fiyat Bilgisi Al ↗
                </button>
              </div>
            </div>

            <div className="book-card">
              <div className="aspect-[4/3] overflow-hidden rounded mb-3">
                <img src={coverImage} alt="Book Spread Hero" className="w-full h-full object-cover" />
              </div>
              <p className="text-[11px] text-amber-200/90 font-serif italic text-center">
                Atölye seramik geleneği ile modern mimarinin sıcak buluşması.
              </p>
            </div>
          </div>
        </header>
      )}

      {/* LAYOUT 6: Gallery Minimal White-Cube (carrara-pure) */}
      {layoutType === 'gallery-minimal' && (
        <header className="hero" id="koleksiyon">
          <div className="text-[10px] font-mono tracking-widest uppercase text-stone-500 mb-2">
            {sec.heroBadgeText || `BIENNALE CURATION // EXHIBITION CATALOGUE ${sec.heroYear || year}`}
          </div>
          <h1>{catalog?.title || 'Carrara & Pure Architectural Marble'}</h1>
          <p className="max-w-xl mx-auto text-stone-600 text-sm leading-relaxed mb-8">
            {catalog?.introText ||
              catalog?.description ||
              'Beyaz mermer, calacatta ve parlak porselen karolar için müze galerisi formatı, geniş negatif beyaz alan ve saf grafit hatlar.'}
          </p>
          <div className="grid grid-cols-2 gap-2.5 sm:flex sm:justify-center sm:gap-3 max-w-md mx-auto">
            <button
              type="button"
              className="primarybtn flex-1 justify-center text-center h-11 text-xs px-3 sm:px-6"
              onClick={() => {
                document.getElementById('urunler')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Sergiyi İncele ↘
            </button>
            <button
              type="button"
              className="outlinebtn flex-1 justify-center text-center h-11 text-xs px-3 sm:px-6"
              onClick={() => handleOpenLead(null, 'sample')}
            >
              Numune İste ↗
            </button>
          </div>

          <div className="gallery-hero-photo">
            <img src={coverImage} alt="Gallery Exhibition" />
          </div>
        </header>
      )}

      {/* =========================================================================
          ARCHITECTURAL MANIFESTO & CURATION RIBBON
      ========================================================================= */}
      {sec.showMonograph !== false && (
        <section className="border-b border-[var(--line)] bg-[var(--paper)] py-8 px-[5.5%] transition-colors duration-300" id="manifesto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-7xl mx-auto">
            <div className="lg:col-span-7 space-y-2">
              <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase text-[var(--accent)] font-bold">
                <span>{currentTheme.folioNumber || 'VOL. 26 // ED. 01'}</span>
                <span>&bull;</span>
                <span>{sec.heroStampText || currentTheme.brandInspiration || 'MİMARİ KÜRASYON'}</span>
              </div>
              <blockquote className="font-serif italic text-base sm:text-lg text-[var(--ink)] leading-relaxed">
                "{sec.monographQuote || currentTheme.monographQuote || 'Yüzey yalnızca bir kaplama değil; mekânın ışığını, akustik dengesini ve dokusal hafızasını belirleyen temel mimari dildir.'}"
              </blockquote>
              <p className="text-[11px] text-[var(--muted)] font-mono">
                {sec.monographAuthor || `— ${brandName} Tasarım & Malzeme İnovasyon Laboratuvarı`}
              </p>
            </div>

            <div className="lg:col-span-5 grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-lg border border-[var(--line)] bg-black/2">
                <span className="text-[10px] font-mono text-[var(--muted)] uppercase block mb-1">Standart</span>
                <strong className="text-xs text-[var(--ink)] block">{sec.spec1Label || 'EN 14411 BLa'}</strong>
                <span className="text-[10px] text-[var(--muted)]">{sec.spec1Desc || 'Tam Gövde Porselen'}</span>
              </div>
              <div className="p-3.5 rounded-lg border border-[var(--line)] bg-black/2">
                <span className="text-[10px] font-mono text-[var(--muted)] uppercase block mb-1">Su Emme</span>
                <strong className="text-xs text-[var(--ink)] block">{sec.spec2Label || 'E ≤ %0.05'}</strong>
                <span className="text-[10px] text-[var(--muted)]">{sec.spec2Desc || 'Sıfıra Yakın Geçirgenlik'}</span>
              </div>
              <div className="p-3.5 rounded-lg border border-[var(--line)] bg-black/2">
                <span className="text-[10px] font-mono text-[var(--muted)] uppercase block mb-1">Kenar Kesimi</span>
                <strong className="text-xs text-[var(--ink)] block">{sec.spec3Label || 'Lazer Rektifiye'}</strong>
                <span className="text-[10px] text-[var(--muted)]">{sec.spec3Desc || '1 mm Monokalibre Derz'}</span>
              </div>
              <div className="p-3.5 rounded-lg border border-[var(--line)] bg-black/2">
                <span className="text-[10px] font-mono text-[var(--muted)] uppercase block mb-1">Doku Çözünürlüğü</span>
                <strong className="text-xs text-[var(--ink)] block">{sec.spec4Label || '4K PBR Master'}</strong>
                <span className="text-[10px] text-[var(--muted)]">{sec.spec4Desc || 'Ultra HD Mikrotekstür'}</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          PRODUCTS SECTION
      ========================================================================= */}
      <section className="section" id="urunler">
        <div className="flex items-end justify-between gap-6 mb-8 flex-wrap">
          <div>
            <div className="text-[10px] font-bold tracking-widest uppercase text-[var(--accent)] mb-1">
              {sec.productsBadge || 'Koleksiyondan Seçkiler'}
            </div>
            <h2 className="text-3xl font-serif text-[var(--ink)]">
              {sec.productsTitle || 'Yüzeyleri Yakından Tanıyın'}
            </h2>
            <p className="text-xs text-[var(--muted)] mt-1 max-w-md">
              {sec.productsSubtitle || 'Her yüzeyin kendine özgü dokusunu, ölçüsünü, aşınma ve kayma direncini keşfedin.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a href="#teknik" className="text-xs font-bold text-[var(--accent)] hover:underline inline-flex items-center gap-1">
              <FileText size={14} />
              <span>Teknik Şartnameyi İncele&nbsp; ↗</span>
            </a>
          </div>
        </div>

        {/* Collection & Lighting Simulator Bar */}
        <div className="flex items-center justify-between py-3.5 border-y border-[var(--line)] mb-6 text-xs text-[var(--muted)] flex-wrap gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span><strong>Marka:</strong> {brandName}</span>
            <span>&bull;</span>
            <span><strong>Koleksiyon:</strong> {catalog?.title}</span>
            <span>&bull;</span>
            <span><strong>Seçki:</strong> {products.length} Karo</span>
          </div>

          {/* Interactive Light Mode Selector */}
          <div className="flex items-center gap-2 bg-[var(--paper)] border border-[var(--line)] p-1 rounded-lg">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] px-2">
              Işık Modu:
            </span>
            <button
              type="button"
              onClick={() => {
                setLightMode('natural');
                notify('Doğal Günışığı (5500K) aktif');
              }}
              className={`px-2.5 py-1 rounded text-[10px] font-bold transition flex items-center gap-1 ${
                lightMode === 'natural'
                  ? 'bg-[var(--accent)] text-white'
                  : 'text-[var(--ink)] hover:bg-black/5'
              }`}
              title="5500K Nötr Gün Işığı"
            >
              <Sun size={11} />
              <span>5500K Gün</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setLightMode('warm');
                notify('Sıcak Spot Işığı (3000K) aktif');
              }}
              className={`px-2.5 py-1 rounded text-[10px] font-bold transition flex items-center gap-1 ${
                lightMode === 'warm'
                  ? 'bg-[var(--accent)] text-white'
                  : 'text-[var(--ink)] hover:bg-black/5'
              }`}
              title="3000K Lüks Sıcak Aydınlatma"
            >
              <Lightbulb size={11} />
              <span>3000K Sıcak</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setLightMode('studio');
                notify('Galeri & Stüdyo Işığı (4000K) aktif');
              }}
              className={`px-2.5 py-1 rounded text-[10px] font-bold transition flex items-center gap-1 ${
                lightMode === 'studio'
                  ? 'bg-[var(--accent)] text-white'
                  : 'text-[var(--ink)] hover:bg-black/5'
              }`}
              title="4000K Net Galeri Işığı"
            >
              <Sparkles size={11} />
              <span>4000K Stüdyo</span>
            </button>
          </div>
        </div>

        {/* Filter Row */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-8 text-xs">
          <div className="relative flex-1 w-full min-w-0">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              ref={searchInputRef}
              type="search"
              placeholder="Karo adı veya ürün koduyla ara…"
              className="w-full pl-9 pr-3 py-2.5 border border-[var(--line)] bg-[var(--paper)] text-[var(--ink)] outline-none rounded text-xs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5 w-full sm:w-auto sm:flex sm:items-center">
            <select
              className="px-3 py-2.5 border border-[var(--line)] bg-[var(--paper)] text-[var(--ink)] outline-none rounded text-xs w-full sm:w-auto sm:min-w-[130px]"
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
            >
              <option value="all">Tüm Ebatlar</option>
              {sizeOptions.map((s) => (
                <option key={s} value={s}>
                  {s.replace('x', ' × ')} cm
                </option>
              ))}
            </select>

            <select
              className="px-3 py-2.5 border border-[var(--line)] bg-[var(--paper)] text-[var(--ink)] outline-none rounded text-xs w-full sm:w-auto sm:min-w-[130px]"
              value={selectedSurface}
              onChange={(e) => setSelectedSurface(e.target.value)}
            >
              <option value="all">Tüm Yüzeyler</option>
              <option value="mat">Doğal Mat</option>
              <option value="parlak">Ayna Parlak</option>
              <option value="lapato">Full Lappato</option>
            </select>
          </div>

          <span className="text-[11px] text-[var(--muted)] font-semibold sm:ml-auto">
            {filteredProducts.length} karo gösteriliyor
          </span>
        </div>

        {/* Product Cards Grid */}
        <div className="products">
          {filteredProducts.map((p, idx) => {
            const key = p.id || p.code || p.name || idx;
            const isFav = !!favorites[key];
            const isPinned = pinnedSlabs.some((s) => (s.id || s.code || s.name) === key);
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

                  <div className="card-floating-actions">
                    {/* 3D Modeling Quick Action */}
                    <button
                      type="button"
                      onClick={(e) => handleOpen3DStudio(p, e)}
                      className="card-3d-btn"
                      title="Bu ürünü 3D Mekân ve Modelleme Stüdyosunda Gör"
                    >
                      <Box size={12} className="text-amber-400" />
                      <span>3D</span>
                    </button>

                    {/* Pin to moodboard button */}
                    <button
                      type="button"
                      className="card-icon-btn"
                      aria-label="Numune tepsisine sabitle"
                      onClick={(e) => handleTogglePinSlab(p, e)}
                      title={isPinned ? 'Numune tepsisinden kaldır' : 'Mimari numune tepsisine ekle'}
                      style={{ color: isPinned ? 'var(--accent)' : 'inherit' }}
                    >
                      <Pin size={13} className={isPinned ? 'fill-current' : ''} />
                    </button>

                    {/* Favorite button */}
                    <button
                      type="button"
                      className="card-icon-btn"
                      aria-label="Favorilere ekle"
                      onClick={(e) => handleToggleFavorite(p, e)}
                      style={{ color: isFav ? 'var(--accent)' : 'inherit' }}
                      title={isFav ? 'Favorilerden çıkar' : 'Favorilere ekle'}
                    >
                      {isFav ? '♥' : '♡'}
                    </button>
                  </div>
                </div>

                <div className="product-info">
                  <div className="product-series">
                    {layoutType === 'gallery-minimal'
                      ? `EXHIBIT 0${idx + 1}`
                      : layoutType === 'swiss-industrial'
                      ? `SPEC-REF: #BLa-0${idx + 1}`
                      : `${brandName} &bull; Mimari Seçki`}
                  </div>
                  <h3>{p.name}</h3>
                  <div className="specs">
                    <span>{dimension}</span>
                    <span>{finish}</span>
                    {p.code && <span>Kod: {p.code}</span>}
                  </div>

                  {/* Architectural badges strip */}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[var(--line)] text-[10px] text-[var(--muted)]">
                    <span className="inline-flex items-center gap-1 font-mono">
                      <ShieldCheck size={11} className="text-emerald-600" />
                      <span>PEI IV</span>
                    </span>
                    <span>&bull;</span>
                    <span className="inline-flex items-center gap-1 font-mono">
                      <span>R10 Kaymaz</span>
                    </span>
                    <span>&bull;</span>
                    <span className="inline-flex items-center gap-1 font-mono">
                      <span>E ≤ %0.05</span>
                    </span>
                  </div>

                  <div className="product-actions">
                    <button
                      type="button"
                      onClick={() => setActiveDetailProduct(p)}
                      title="4K Doku Detayını İncele"
                    >
                      Doku Detayı ↗
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenLead(p, 'quote')}
                      title="Fiyat Teklifi & Numune İste"
                    >
                      Teklif Al +
                    </button>
                  </div>

                  <div className="pt-2.5 text-center border-t border-[var(--line)] mt-2.5">
                    <button
                      type="button"
                      onClick={(e) => handleOpen3DStudio(p, e)}
                      className="w-full py-2 px-3 rounded text-[11px] font-bold text-[var(--accent)] hover:bg-[var(--accent-light)] transition inline-flex items-center justify-center gap-1.5 group cursor-pointer"
                      title="Bu seramiği 3D banyo, mutfak veya salonda döşeyin"
                    >
                      <Box size={13} className="text-[var(--accent)] group-hover:scale-110 transition-transform" />
                      <span>3D Modellemede Gör & Döşe ↗</span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}

          {filteredProducts.length === 0 && (
            <div className="p-12 text-center border border-dashed border-[var(--line)] col-span-full bg-[var(--paper)] rounded">
              Aramanızla eşleşen karo bulunamadı. Filtreleri değiştirip tekrar deneyin.
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          FLOATING ARCHITECTURAL MOODBOARD TRAY
      ========================================================================= */}
      {pinnedSlabs.length > 0 && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-2xl w-[92%] bg-[var(--paper)] border border-[var(--line)] shadow-2xl rounded-2xl p-3.5 backdrop-blur-xl animate-in slide-in-from-bottom-6 duration-300"
          style={{ backgroundColor: 'var(--paper)', borderColor: 'var(--line)' }}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[var(--accent-light)] flex items-center justify-center flex-shrink-0" style={{ color: 'var(--accent)' }}>
                <Pin size={14} className="fill-current" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[var(--ink)] truncate">
                  Mimari Numune Tepsisi ({pinnedSlabs.length} Karo)
                </p>
                <div className="flex items-center gap-1.5 mt-1 overflow-x-auto py-0.5">
                  {pinnedSlabs.map((s, idx) => (
                    <div
                      key={s.id || idx}
                      className="relative group w-8 h-8 rounded border border-stone-300 overflow-hidden flex-shrink-0 shadow-2xs"
                      title={s.name}
                    >
                      <img src={s.imageUrl || s.textureUrl} alt={s.name} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={(e) => handleTogglePinSlab(s, e)}
                        className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] transition"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => setPinnedSlabs([])}
                className="text-[11px] text-[var(--muted)] hover:text-rose-600 px-2 py-1 font-semibold"
              >
                Temizle
              </button>
              <button
                type="button"
                onClick={() => handleOpenLeadForPinned('quote')}
                className="primarybtn text-[10px] py-2 px-3"
              >
                Tümüne Teklif İste ↗
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDITORIAL SECTION */}
      {sec.showEditorial !== false && (
        <section className="section editorial" id="mekanlar">
          <div className="editorial-grid">
            <div className="editorial-photo">
              <img
                src={sec.editorialImageUrl || '/renders/modern_living_natural_oak.jpg'}
                alt={sec.editorialTitle || 'Mekânda hayat bulan yüzeyler'}
              />
              <div className="photo-caption">{sec.editorialCaption || `Mekânlardan İlham Alın • ${sec.heroYear || year}`}</div>
            </div>

            <div className="space-y-4">
              <div className="text-[10px] font-bold tracking-widest uppercase text-[var(--accent)]">
                {sec.editorialBadge || 'Mekânda Hayat Bulan Yüzeyler'}
              </div>
              <h2 className="text-3xl font-serif text-[var(--ink)] whitespace-pre-line">
                {sec.editorialTitle || (
                  <>
                    Bir Yüzeyden<br />
                    Daha Fazlası.
                  </>
                )}
              </h2>
              <p className="text-xs text-[var(--muted)] leading-relaxed max-w-md">
                {sec.editorialText ||
                  'Doğru seramik ve porselen, mekânın ışığını, akustik dengesini ve mimari derinliğini belirler. Seçkin serileri yalnızca ürün olarak değil, mekânınızın bir parçası olarak keşfedin.'}
              </p>

              <div className="border-t border-[var(--line)] pt-3 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-[var(--line)]">
                  <strong>{sec.feature1Title || '01   Banyo ve Spa'}</strong>
                  <span className="text-[var(--muted)]">{sec.feature1Desc || 'Doğal Taş Dinginliği ↗'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[var(--line)]">
                  <strong>{sec.feature2Title || '02   Yaşam Alanları & Salon'}</strong>
                  <span className="text-[var(--muted)]">{sec.feature2Desc || 'Geniş Ebat Monolitik Slab ↗'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[var(--line)]">
                  <strong>{sec.feature3Title || '03   Mutfak ve Ticari Zeminler'}</strong>
                  <span className="text-[var(--muted)]">{sec.feature3Desc || 'Yüksek Trafik Dayanımı (PEI V) ↗'}</span>
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
      )}

      {/* TECHNICAL SECTION */}
      {sec.showTechnical !== false && (
        <section className="section technical" id="teknik">
          <div className="flex items-end justify-between gap-6 mb-8 flex-wrap">
            <div>
              <div className="text-[10px] font-bold tracking-widest uppercase text-[var(--accent)] mb-1">
                {sec.technicalBadge || 'Mimari Şartname & Kalite Güvencesi'}
              </div>
              <h2 className="text-3xl font-serif text-[var(--ink)]">
                {sec.technicalTitle || 'Mükemmel Estetik, Sarsılmaz Standartlar'}
              </h2>
              <p className="text-xs text-[var(--muted)] mt-1 max-w-md">
                {sec.technicalSubtitle || 'Avrupa Birliği EN 14411 standardına tam uyumlu teknik değerler.'}
              </p>
            </div>
            <a href="#urunler" className="text-xs font-bold text-[var(--accent)] hover:underline inline-flex items-center gap-1">
              <Ruler size={13} />
              <span>Tüm Karoları Karşılaştır ↗</span>
            </a>
          </div>

          <div className="tech-grid">
            <div className="tech-card">
              <small className="text-[10px] font-mono uppercase text-[var(--accent)] block mb-1">
                {sec.tech1Title || '01 // SU EMME DEĞERİ (E ≤ %0.05)'}
              </small>
              <h3 className="font-serif text-lg my-2 text-[var(--ink)]">{sec.tech1Heading || 'Sıfıra Yakın Su Emme'}</h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                {sec.tech1Desc || 'Donmaya, lekelenmeye ve kimyasallara karşı maksimum direnç sunan yüksek yoğunluklu porselen gövde.'}
              </p>
            </div>

            <div className="tech-card">
              <small className="text-[10px] font-mono uppercase text-[var(--accent)] block mb-1">
                {sec.tech2Title || '02 // R10 / R11 KAYMA DİRENCİ'}
              </small>
              <h3 className="font-serif text-lg my-2 text-[var(--ink)]">{sec.tech2Heading || 'Islak Hacim Güvenliği'}</h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                {sec.tech2Desc || 'Banyo, havuz kenarı ve lüks otel girişleri için mikrotekstür teknolojisiyle güvenli adımlar.'}
              </p>
            </div>

            <div className="tech-card">
              <small className="text-[10px] font-mono uppercase text-[var(--accent)] block mb-1">
                {sec.tech3Title || '03 // REKTİFİYE MİLİMETRİK KESİM'}
              </small>
              <h3 className="font-serif text-lg my-2 text-[var(--ink)]">{sec.tech3Heading || 'Derzsiz Süreklilik'}</h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                {sec.tech3Desc || 'Lazer kontrollü rektifiye kenarlar sayesinde 1 mm minimum derz aralığıyla kesintisiz yüzey akışı.'}
              </p>
            </div>
          </div>

          {/* ARCHITECTURAL BIM / CAD & SPECIFICATION DOWNLOADS */}
          <div className="mt-10 p-6 rounded-xl border border-[var(--line)] bg-[var(--paper)] shadow-2xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-[var(--accent)] font-bold mb-1">
                  BIM & CAD DİJİTAL MİMARİ KÜTÜPHANESİ
                </div>
                <h4 className="text-base font-serif font-bold text-[var(--ink)]">
                  Projeleriniz İçin Hazır 3D Model ve Teknik Şartnameler
                </h4>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  Revit (.RFA), AutoCAD (.DWG), SketchUp (.SKP) ve 4K PBR doku haritalarını doğrudan indirin.
                </p>
              </div>
              <button
                type="button"
                onClick={handlePrint}
                className="outlinebtn text-xs font-bold whitespace-nowrap self-start md:self-auto"
              >
                <Download size={13} />
                <span>Tüm Şartnameyi İndir (.PDF)</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs">
              <a
                href={sec.bimCadUrl || '#'}
                target={sec.bimCadUrl ? '_blank' : undefined}
                rel="noopener noreferrer"
                onClick={(e) => {
                  if (!sec.bimCadUrl) {
                    e.preventDefault();
                    notify(`${brandName} Autodesk Revit (.RFA) kütüphanesi indirildi.`);
                  }
                }}
                className="p-3.5 rounded-lg border border-[var(--line)] hover:border-[var(--accent)] bg-black/2 text-left transition flex items-center justify-between group cursor-pointer"
              >
                <div>
                  <strong className="block text-[11px] text-[var(--ink)]">Revit BIM (.RFA)</strong>
                  <span className="text-[10px] text-[var(--muted)]">Parametrik Slab Ailesi</span>
                </div>
                <Download size={13} className="text-[var(--muted)] group-hover:text-[var(--accent)] transition" />
              </a>

              <a
                href={sec.bimCadUrl || '#'}
                target={sec.bimCadUrl ? '_blank' : undefined}
                rel="noopener noreferrer"
                onClick={(e) => {
                  if (!sec.bimCadUrl) {
                    e.preventDefault();
                    notify(`${brandName} AutoCAD (.DWG) detay çizimleri indirildi.`);
                  }
                }}
                className="p-3.5 rounded-lg border border-[var(--line)] hover:border-[var(--accent)] bg-black/2 text-left transition flex items-center justify-between group cursor-pointer"
              >
                <div>
                  <strong className="block text-[11px] text-[var(--ink)]">AutoCAD (.DWG)</strong>
                  <span className="text-[10px] text-[var(--muted)]">1:20 Kesit & Plan Detayı</span>
                </div>
                <Download size={13} className="text-[var(--muted)] group-hover:text-[var(--accent)] transition" />
              </a>

              <a
                href={sec.ceLeedUrl || '#'}
                target={sec.ceLeedUrl ? '_blank' : undefined}
                rel="noopener noreferrer"
                onClick={(e) => {
                  if (!sec.ceLeedUrl) {
                    e.preventDefault();
                    notify(`${brandName} CE & LEED Sertifikası indirildi.`);
                  }
                }}
                className="p-3.5 rounded-lg border border-[var(--line)] hover:border-[var(--accent)] bg-black/2 text-left transition flex items-center justify-between group cursor-pointer"
              >
                <div>
                  <strong className="block text-[11px] text-[var(--ink)]">CE & LEED Sertifikası</strong>
                  <span className="text-[10px] text-[var(--muted)]">Yeşil Bina Uyumluluğu</span>
                </div>
                <Download size={13} className="text-[var(--muted)] group-hover:text-[var(--accent)] transition" />
              </a>

              <a
                href={sec.epdUrl || '#'}
                target={sec.epdUrl ? '_blank' : undefined}
                rel="noopener noreferrer"
                onClick={(e) => {
                  if (!sec.epdUrl) {
                    e.preventDefault();
                    notify(`${brandName} EPD Çevresel Ürün Beyanı indirildi.`);
                  }
                }}
                className="p-3.5 rounded-lg border border-[var(--line)] hover:border-[var(--accent)] bg-black/2 text-left transition flex items-center justify-between group cursor-pointer"
              >
                <div>
                  <strong className="block text-[11px] text-[var(--ink)]">EPD Çevresel Beyan</strong>
                  <span className="text-[10px] text-[var(--muted)]">Sürdürülebilirlik Raporu</span>
                </div>
                <Download size={13} className="text-[var(--muted)] group-hover:text-[var(--accent)] transition" />
              </a>
            </div>
          </div>
        </section>
      )}

      {/* CTA SECTION */}
      {sec.showCta !== false && (
        <section className="cta">
          <div>
            <h2 className="text-2xl font-serif font-normal mb-1">{sec.ctaTitle || 'Projeniz için doğru yüzeyi bulun.'}</h2>
            <p className="text-xs opacity-80">{sec.ctaSubtitle || 'Karoları keşfedin, seçeneklerinizi belirleyin ve teklif sürecini başlatın.'}</p>
          </div>
          <button
            type="button"
            className="primarybtn"
            onClick={() => {
              document.getElementById('urunler')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            {sec.ctaButtonText || 'Koleksiyonu Keşfet ↗'}
          </button>
        </section>
      )}

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

        {(catalog?.contactPhone || catalog?.contactEmail || catalog?.contactAddress || catalog?.websiteUrl || sec.contactPhone || sec.contactEmail || sec.contactAddress || sec.websiteUrl) && (
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-[var(--muted)] border-t border-[var(--line)] pt-3 w-full max-w-2xl my-2">
            {(sec.contactPhone || catalog?.contactPhone) && <span>📞 {sec.contactPhone || catalog?.contactPhone}</span>}
            {(sec.contactEmail || catalog?.contactEmail) && <span>✉️ {sec.contactEmail || catalog?.contactEmail}</span>}
            {(sec.contactAddress || catalog?.contactAddress) && <span>📍 {sec.contactAddress || catalog?.contactAddress}</span>}
            {(sec.websiteUrl || catalog?.websiteUrl) && (
              <span>
                🌐{' '}
                <a
                  href={sec.websiteUrl || catalog?.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-[var(--accent)]"
                >
                  {(sec.websiteUrl || catalog?.websiteUrl).replace(/^https?:\/\//, '')}
                </a>
              </span>
            )}
          </div>
        )}

        <p className="m-0">
          Bu dijital lookbook <Link href="/" className="font-bold underline text-inherit">SeramikBak</Link> altyapısı ile sunulmaktadır.
        </p>

        <p className="m-0">© {year} {brandName}. Tüm hakları saklıdır.</p>
      </footer>

      {/* TOAST NOTIFICATION */}
      <div className={`toast ${showToast ? 'show' : ''}`}>
        {toastMessage}
      </div>

      {/* PRODUCT DETAIL MODAL */}
      {activeDetailProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setActiveDetailProduct(null)}
        >
          <div
            className="relative max-w-2xl w-full bg-[var(--paper)] border border-[var(--line)] shadow-2xl p-6 rounded-xl animate-in zoom-in-95 duration-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: 'var(--paper)', borderColor: 'var(--line)' }}
          >
            <button
              type="button"
              onClick={() => setActiveDetailProduct(null)}
              className="absolute top-4 right-4 iconbtn"
              aria-label="Kapat"
            >
              <X size={15} />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="aspect-square bg-[var(--product-img-bg)] border border-[var(--line)] overflow-hidden rounded relative">
                <img
                  src={activeDetailProduct.imageUrl || activeDetailProduct.textureUrl}
                  alt={activeDetailProduct.name}
                  className="w-full h-full object-cover"
                />
                <span className="absolute left-2.5 bottom-2.5 bg-black/70 backdrop-blur-xs text-white text-[9px] px-2 py-1 rounded font-mono">
                  4K SURFACE DETAIL
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">
                    {brandName} Mimari Seçki
                  </div>
                  <h3 className="text-xl font-serif font-bold text-[var(--ink)] mt-1">
                    {activeDetailProduct.name}
                  </h3>
                  {activeDetailProduct.code && (
                    <p className="text-xs text-[var(--muted)] font-mono">Kod: {activeDetailProduct.code}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs border-y border-[var(--line)] py-3">
                  <div>
                    <span className="text-[10px] uppercase text-[var(--muted)] block">Ebat</span>
                    <strong>
                      {activeDetailProduct.width && activeDetailProduct.height
                        ? `${activeDetailProduct.width} × ${activeDetailProduct.height} cm`
                        : activeDetailProduct.size || 'Standart Ebat'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-[var(--muted)] block">Yüzey Bitişi</span>
                    <strong>{activeDetailProduct.finish || activeDetailProduct.surface || 'Porselen'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-[var(--muted)] block">Aşınma Sınıfı</span>
                    <strong>PEI IV / V (Yüksek Trafik)</strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-[var(--muted)] block">Kayma Direnci</span>
                    <strong>R10 Islak Zemin</strong>
                  </div>
                </div>

                <div className="pt-2 space-y-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      const p = activeDetailProduct;
                      setActiveDetailProduct(null);
                      handleOpen3DStudio(p, e);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-[var(--ink)] text-white font-bold text-xs hover:brightness-110 transition shadow-md cursor-pointer"
                  >
                    <Box size={14} className="text-amber-400" />
                    <span>Bu Seramiği 3D Modellemede Gör & Mekân Tasarla ↗</span>
                  </button>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const p = activeDetailProduct;
                        setActiveDetailProduct(null);
                        handleOpenLead(p, 'quote');
                      }}
                      className="primarybtn flex-1 justify-center text-xs"
                    >
                      Fiyat Teklifi Al ↗
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const p = activeDetailProduct;
                        setActiveDetailProduct(null);
                        handleOpenLead(p, 'sample');
                      }}
                      className="outlinebtn flex-1 justify-center text-xs"
                    >
                      Numune İste ↗
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LEAD MODAL */}
      {showLeadModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
          onClick={() => setShowLeadModal(false)}
        >
          <div
            className="relative max-w-lg w-full bg-white text-stone-900 rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.65)] border border-stone-200 overflow-hidden my-auto animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-stone-50 px-6 sm:px-8 py-5 border-b border-stone-200 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#a87943]">
                  <Building2 size={13} />
                  <span>{brandName} &bull; MİMARİ PROJE MASASI</span>
                </div>
                <h3 className="text-xl font-serif font-bold text-stone-900 mt-1">
                  {leadType === 'sample' ? 'Numune Talep Formu' : 'Fiyat Teklifi İsteyin'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowLeadModal(false)}
                className="w-9 h-9 rounded-full bg-white border border-stone-200 hover:bg-stone-100 flex items-center justify-center text-stone-500 hover:text-stone-800 transition shadow-2xs cursor-pointer"
                aria-label="Kapat"
              >
                <X size={16} />
              </button>
            </div>

            {leadSubmitted ? (
              <div className="p-8 sm:p-10 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 size={36} />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold text-stone-900">Talebiniz Başarıyla Alındı</h3>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed mt-1.5">
                    {leadType === 'sample' ? 'Numune talebiniz' : 'Fiyat teklifi talebiniz'} doğrudan <strong>{brandName}</strong> proje ve satış müdürlüğüne iletildi. Yetkili mimari temsilci en kısa sürede sizinle iletişime geçecektir.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowLeadModal(false);
                      setLeadSubmitted(false);
                      setLeadForm({ name: '', company: '', email: '', phone: '', message: '' });
                    }}
                    className="px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold transition shadow-sm"
                  >
                    Kapat
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleLeadSubmit} className="p-6 sm:p-8 space-y-4">
                {/* Selected Product Card Preview */}
                {selectedLeadProductObj ? (
                  <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-amber-50/70 border border-amber-200">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-200 flex-shrink-0 border border-amber-200">
                      <img
                        src={selectedLeadProductObj.imageUrl || selectedLeadProductObj.textureUrl || '/renders/luxury_bathroom_calacatta_gold.jpg'}
                        alt={selectedLeadProductObj.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block">
                        Talep Edilen Karo
                      </span>
                      <h4 className="text-xs font-bold text-stone-900 truncate">
                        {selectedLeadProductObj.name}
                      </h4>
                      <p className="text-[11px] text-stone-500 font-mono truncate">
                        {selectedLeadProductObj.code ? `Kod: ${selectedLeadProductObj.code} · ` : ''}
                        {selectedLeadProductObj.width && selectedLeadProductObj.height ? `${selectedLeadProductObj.width} × ${selectedLeadProductObj.height} cm` : ''}
                      </p>
                    </div>
                  </div>
                ) : selectedLeadProducts.length > 0 ? (
                  <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-700">
                    <strong className="text-stone-900 block text-[11px] mb-0.5">Seçili Karolar:</strong>
                    <span className="truncate block font-medium">{selectedLeadProducts.join(', ')}</span>
                  </div>
                ) : null}

                {submitError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <span className="font-bold">Hata:</span>
                    <span>{submitError}</span>
                  </div>
                )}

                <div className="space-y-3.5">
                  {/* Row 1: Ad Soyad & Telefon */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Adınız Soyadınız <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Örn: Mimar Selin Kaya"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 text-xs placeholder:text-stone-400 focus:outline-none focus:border-[#a87943] focus:ring-2 focus:ring-[#a87943]/15 transition shadow-2xs"
                        value={leadForm.name}
                        onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Telefon Numaranız <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="05XX XXX XX XX"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 text-xs placeholder:text-stone-400 focus:outline-none focus:border-[#a87943] focus:ring-2 focus:ring-[#a87943]/15 transition shadow-2xs"
                        value={leadForm.phone}
                        onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Row 2: Şirket & E-Posta */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Şirket / Mimarlık Ofisi <span className="text-[10px] text-stone-400 font-normal">(İsteğe bağlı)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Örn: Studio Arch Mimarlık"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 text-xs placeholder:text-stone-400 focus:outline-none focus:border-[#a87943] focus:ring-2 focus:ring-[#a87943]/15 transition shadow-2xs"
                        value={leadForm.company}
                        onChange={(e) => setLeadForm({ ...leadForm, company: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        E-Posta Adresi <span className="text-[10px] text-stone-400 font-normal">(İsteğe bağlı)</span>
                      </label>
                      <input
                        type="email"
                        placeholder="adiniz@sirketiniz.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 text-xs placeholder:text-stone-400 focus:outline-none focus:border-[#a87943] focus:ring-2 focus:ring-[#a87943]/15 transition shadow-2xs"
                        value={leadForm.email}
                        onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Row 3: Proje Notu / Metraj */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      {leadType === 'sample' ? 'Teslimat Adresi ve Proje Detayları' : 'Tahmini Metraj ve Proje Notlarınız'} <span className="text-[10px] text-stone-400 font-normal">(İsteğe bağlı)</span>
                    </label>
                    <textarea
                      rows={3}
                      placeholder={
                        leadType === 'sample'
                          ? 'Numunenin teslim edilmesini istediğiniz açık adres ve proje detayları...'
                          : 'Örn: Yaklaşık 250 m² salon ve ıslak hacim için m² teklifi rica ederiz...'
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 text-xs placeholder:text-stone-400 focus:outline-none focus:border-[#a87943] focus:ring-2 focus:ring-[#a87943]/15 transition shadow-2xs resize-none"
                      value={leadForm.message}
                      onChange={(e) => setLeadForm({ ...leadForm, message: e.target.value })}
                    />
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 text-[11px] text-stone-400 order-2 sm:order-1">
                    <ShieldCheck size={14} className="text-emerald-600 flex-shrink-0" />
                    <span>Doğrudan üretici fabrika masasına iletilir.</span>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end order-1 sm:order-2">
                    <button
                      type="button"
                      onClick={() => setShowLeadModal(false)}
                      className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 text-xs font-semibold transition cursor-pointer"
                      disabled={isSubmittingLead}
                    >
                      Vazgeç
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingLead}
                      className="px-5 py-2.5 rounded-xl bg-[#a87943] hover:bg-[#966b3a] text-white text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmittingLead && <Loader2 size={13} className="animate-spin" />}
                      <span>{isSubmittingLead ? 'İletiliyor...' : 'Talebi İlet ↗'}</span>
                    </button>
                  </div>
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
