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
  Square
} from 'lucide-react';
import CatalogTemplateRenderer from '@/components/brand/catalog/templates/CatalogTemplateRenderer';
import { prepareAndPrintCatalog } from '@/utils/printCatalog';

function LinkedInIcon({ size = 16, className = "" }) {
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

  // View Mode: 'lookbook' (Architectural Monograph) | 'pages' (A4 Print Simulator)
  const [viewerMode, setViewerMode] = useState('lookbook');

  // Real-time Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDimension, setSelectedDimension] = useState('ALL');
  const [selectedFinish, setSelectedFinish] = useState('ALL');
  const [selectedUsageArea, setSelectedUsageArea] = useState('ALL');
  const [showMobileFilterModal, setShowMobileFilterModal] = useState(false);

  // High-Res Texture Zoom Modal
  const [activeDetailProduct, setActiveDetailProduct] = useState(null);

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

  // Scroll Position tracker
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchCatalog();
    }
  }, [slug]);

  // Pre-select products for lead form when products load
  useEffect(() => {
    if (products && products.length > 0) {
      setSelectedLeadProducts(products.map((p) => p.name || p.code || 'Seramik Ürün'));
    }
  }, [products]);

  // Scroll listener for sticky header styling
  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== 'undefined') {
        setScrolled(window.scrollY > 40);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Click outside listener for Share dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target)) {
        setShowShareMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Listen for B2B Lead Modal triggers
  useEffect(() => {
    const handleOpenLeadModal = (e) => {
      const p = e.detail?.product;
      if (p) {
        setSelectedLeadProducts([p.name || p.code || 'Seramik Ürün']);
      }
      if (e.detail?.type) {
        setLeadType(e.detail.type);
      }
      setLeadSubmitted(false);
      setShowLeadModal(true);
    };
    window.addEventListener('seramikbak-open-lead-modal', handleOpenLeadModal);
    return () => window.removeEventListener('seramikbak-open-lead-modal', handleOpenLeadModal);
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
      await prepareAndPrintCatalog({ stageId: 'seramikbak-catalog-article' });
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
          brandId: catalog.brandId,
          catalogId: catalog.id,
          catalogTitle: catalog.title,
          leadType,
          customerName: leadForm.name.trim(),
          companyName: leadForm.company?.trim() || null,
          email: leadForm.email.trim(),
          phone: leadForm.phone.trim(),
          customerMessage: leadForm.message?.trim() || null,
          selectedProducts: selectedLeadProducts
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setLeadSubmitted(true);
      } else {
        setSubmitError(data.error || 'Talep iletilemedi. Lütfen tekrar deneyin.');
      }
    } catch (err) {
      setSubmitError('Bağlantı hatası: ' + err.message);
    } finally {
      setIsSubmittingLead(false);
    }
  };

  // Extract Unique Metadata for Dynamic Filters
  const uniqueDimensions = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      if (p.width && p.height) {
        set.add(`${p.width}x${p.height}`);
      }
    });
    return Array.from(set);
  }, [products]);

  const uniqueFinishes = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      if (p.finish) set.add(p.finish);
    });
    return Array.from(set);
  }, [products]);

  const uniqueUsageAreas = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      if (p.area) {
        p.area.split(',').forEach((a) => set.add(a.trim()));
      }
    });
    return Array.from(set);
  }, [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name?.toLowerCase().includes(q) ||
        p.code?.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q) ||
        p.color?.toLowerCase().includes(q) ||
        p.finish?.toLowerCase().includes(q);

      const matchesDim =
        selectedDimension === 'ALL' ||
        `${p.width}x${p.height}` === selectedDimension;

      const matchesFinish =
        selectedFinish === 'ALL' ||
        (p.finish && p.finish.toLowerCase() === selectedFinish.toLowerCase());

      const matchesArea =
        selectedUsageArea === 'ALL' ||
        (p.area && p.area.toLowerCase().includes(selectedUsageArea.toLowerCase()));

      return matchesSearch && matchesDim && matchesFinish && matchesArea;
    });
  }, [products, searchQuery, selectedDimension, selectedFinish, selectedUsageArea]);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedDimension !== 'ALL' ||
    selectedFinish !== 'ALL' ||
    selectedUsageArea !== 'ALL';

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedDimension('ALL');
    setSelectedFinish('ALL');
    setSelectedUsageArea('ALL');
  };

  // Open Lead Modal with single pre-selected product
  const handleOpenLeadForProduct = (product, type = 'quote') => {
    if (product) {
      setSelectedLeadProducts([product.name || product.code || 'Seramik Ürün']);
    }
    setLeadType(type);
    setLeadSubmitted(false);
    setShowLeadModal(true);
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex flex-col items-center justify-center p-6 text-stone-900">
        <div className="w-12 h-12 rounded-2xl bg-white border border-stone-200/80 shadow-md flex items-center justify-center mb-4">
          <Loader2 size={24} className="animate-spin text-[#b4823c]" />
        </div>
        <p className="text-xs font-mono font-semibold tracking-widest text-stone-500 uppercase">
          Katalog Hazırlanıyor...
        </p>
      </div>
    );
  }

  // Error State
  if (error || !catalog) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex flex-col items-center justify-center p-6 text-stone-900 text-center">
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
            className="px-4 py-2 rounded-xl bg-[#b4823c] text-white text-xs font-bold shadow-sm transition hover:bg-[#9a6c2d] flex items-center gap-1.5"
          >
            <RotateCcw size={13} />
            <span>Tekrar Dene</span>
          </button>
          <Link
            href="/"
            className="px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 text-xs font-bold transition hover:bg-stone-50"
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

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-900 antialiased font-sans selection:bg-[#b4823c] selection:text-white">
      {/* Google Fonts for Architectural Editorial & Clean Monograph Layout */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

        .font-serif-architect {
          font-family: 'Cormorant Garamond', Georgia, serif;
        }
        .font-sans-clean {
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        @media print {
          @page {
            size: A4 portrait;
            margin: 12mm 10mm;
          }
          body {
            background-color: #ffffff !important;
            color: #0f172a !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
          .print-break-inside-avoid {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}</style>

      {/* =========================================================================
          TOP UNIFIED ARCHITECTURAL NAVBAR
      ========================================================================= */}
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 no-print ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-xs border-b border-stone-200/80 py-3'
            : 'bg-[#faf8f5]/90 backdrop-blur-sm border-b border-stone-200/60 py-3.5'
        } px-4 sm:px-8`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand & SeramikBak link */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/"
              className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 flex items-center gap-1 transition flex-shrink-0"
              title="SeramikBak Ana Sayfa"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline font-mono text-[11px] font-semibold text-stone-500">
                SeramikBak
              </span>
            </Link>

            <div className="h-4 w-px bg-stone-300 hidden sm:block flex-shrink-0" />

            {/* Brand Logo / Name */}
            <div className="flex items-center gap-2 min-w-0">
              {brand.logoUrl ? (
                <img
                  src={brand.logoUrl}
                  alt={brandName}
                  className="h-6 sm:h-7 w-auto object-contain flex-shrink-0"
                />
              ) : (
                <span className="font-serif-architect font-bold text-base sm:text-lg tracking-wider text-stone-900 flex-shrink-0">
                  {brandName}
                </span>
              )}

              <span className="text-stone-300 hidden md:inline">&bull;</span>

              <h1 className="text-xs sm:text-sm font-semibold text-stone-700 truncate hidden md:block">
                {catalog.title}
              </h1>
            </div>
          </div>

          {/* Section Jump Anchors (Desktop) */}
          <nav className="hidden lg:flex items-center gap-6 text-[11px] font-medium tracking-widest uppercase text-stone-500">
            <a href="#section-hero" className="hover:text-stone-900 transition">Kapak</a>
            <span className="text-stone-300">&bull;</span>
            <a href="#section-meta" className="hover:text-stone-900 transition">Özet</a>
            <span className="text-stone-300">&bull;</span>
            <a href="#section-products" className="hover:text-stone-900 transition">
              Ürünler ({products.length})
            </a>
            <span className="text-stone-300">&bull;</span>
            <a href="#section-specs" className="hover:text-stone-900 transition">Teknik Standartlar</a>
            <span className="text-stone-300">&bull;</span>
            <a href="#section-contact" className="hover:text-stone-900 transition">İletişim</a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* View Mode Toggle: Lookbook vs A4 Print Pages */}
            <div className="hidden sm:flex items-center gap-1 bg-stone-100 p-0.5 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setViewerMode('lookbook')}
                className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1 transition cursor-pointer ${
                  viewerMode === 'lookbook'
                    ? 'bg-white text-stone-900 shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                title="İnteraktif Web Lookbook Görünümü"
              >
                <BookOpen size={12} className="text-[#b4823c]" />
                <span>Lookbook</span>
              </button>

              <button
                type="button"
                onClick={() => setViewerMode('pages')}
                className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1 transition cursor-pointer ${
                  viewerMode === 'pages'
                    ? 'bg-white text-stone-900 shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                title="A4 Baskı Sayfa Simülatörü"
              >
                <Layers size={12} className="text-[#b4823c]" />
                <span>A4 Sayfalar</span>
              </button>
            </div>

            {/* Share Dropdown */}
            <div className="relative" ref={shareMenuRef}>
              <button
                type="button"
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="p-2 sm:px-3 sm:py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                title="Kataloğu Paylaş"
              >
                <Share2 size={13} className="text-[#b4823c]" />
                <span className="hidden sm:inline">Paylaş</span>
              </button>

              {showShareMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-stone-200 shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-stone-100 mb-1">
                    <p className="text-[11px] font-bold text-stone-900 uppercase tracking-wider">
                      Kataloğu Paylaş
                    </p>
                    <p className="text-[10px] text-stone-500 truncate">{catalog.title}</p>
                  </div>

                  <button
                    type="button"
                    onClick={handleWhatsAppShare}
                    className="w-full px-3 py-2 rounded-xl hover:bg-stone-50 text-xs text-left flex items-center gap-2.5 text-stone-700 transition cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <MessageCircle size={14} />
                    </div>
                    <span>WhatsApp ile Gönder</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleLinkedInShare}
                    className="w-full px-3 py-2 rounded-xl hover:bg-stone-50 text-xs text-left flex items-center gap-2.5 text-stone-700 transition cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                      <LinkedInIcon size={14} />
                    </div>
                    <span>LinkedIn'de Paylaş</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleEmailShare}
                    className="w-full px-3 py-2 rounded-xl hover:bg-stone-50 text-xs text-left flex items-center gap-2.5 text-stone-700 transition cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded-lg bg-amber-100 text-[#b4823c] flex items-center justify-center">
                      <Mail size={14} />
                    </div>
                    <span>E-posta ile Gönder</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowQrModal(true);
                      setShowShareMenu(false);
                    }}
                    className="w-full px-3 py-2 rounded-xl hover:bg-stone-50 text-xs text-left flex items-center gap-2.5 text-stone-700 transition cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center">
                      <QrCode size={14} />
                    </div>
                    <span>QR Kodunu Göster</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className={`w-full px-3 py-2 rounded-xl text-xs text-left flex items-center gap-2.5 transition cursor-pointer ${
                      copied ? 'bg-emerald-50 text-emerald-800 font-bold' : 'hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <div className="w-6 h-6 rounded-lg bg-stone-100 text-stone-600 flex items-center justify-center">
                      {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    </div>
                    <span>{copied ? 'Kopyalandı! ✓' : 'Bağlantıyı Kopyala'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Print/PDF */}
            <button
              type="button"
              onClick={handlePrint}
              disabled={isPrinting}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
              title="Kataloğu PDF Olarak İndir / Yazdır"
            >
              {isPrinting ? <Loader2 size={13} className="animate-spin text-[#b4823c]" /> : <Printer size={13} className="text-[#b4823c]" />}
              <span className="hidden sm:inline">PDF</span>
            </button>

            {/* Primary B2B Action */}
            <button
              type="button"
              onClick={() => {
                setLeadType('quote');
                setLeadSubmitted(false);
                setShowLeadModal(true);
              }}
              className="px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-[#b4823c] to-[#9a6c2d] hover:from-[#a07231] hover:to-[#885f26] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-amber-900/10 transition cursor-pointer"
            >
              <Package size={13} />
              <span className="hidden xs:inline">Fiyat & Numune İste</span>
              <span className="xs:hidden">Teklif</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area: Lookbook vs A4 Pages */}
      {viewerMode === 'pages' ? (
        <main className="max-w-5xl mx-auto p-4 sm:p-8 flex justify-center">
          <CatalogTemplateRenderer catalog={catalog} products={products} mode="preview" />
        </main>
      ) : (
        <article id="seramikbak-catalog-article" className="w-full">
          {/* =========================================================================
              SECTION 1: HERO COVER (Editoryal Lüks Kapak)
          ========================================================================= */}
          <section
            id="section-hero"
            className="relative min-h-[85vh] sm:min-h-[88vh] flex flex-col justify-between p-6 sm:p-12 md:p-16 lg:p-20 overflow-hidden bg-[#1c1917] text-white border-b border-stone-200"
          >
            {/* Background Image with Cinematic Architectural Vignette */}
            <div className="absolute inset-0 z-0">
              <img
                src={coverImage}
                alt={catalog.title}
                className="w-full h-full object-cover object-center filter brightness-45 contrast-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#141210] via-black/40 to-black/30" />
            </div>

            {/* Top Tagline */}
            <div className="relative z-10 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[11px] font-mono tracking-[0.25em] text-[#d4af37] uppercase font-bold">
                  {brandName} &bull; MİMARİ KOLEKSİYON
                </span>
                <p className="text-xs text-stone-300 font-light tracking-widest uppercase">
                  ARCHITECTURAL PORCELAIN LOOKBOOK &bull; {new Date().getFullYear()}
                </p>
              </div>

              <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-mono text-stone-200">
                <ShieldCheck size={13} className="text-[#d4af37]" />
                <span>TS EN 14411 GRUP BIA</span>
              </div>
            </div>

            {/* Center Editorial Title & Summary */}
            <div className="relative z-10 max-w-4xl my-auto py-12 space-y-5">
              <div className="w-12 h-0.5 bg-[#d4af37]" />

              <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-serif-architect font-normal text-white leading-[1.05] tracking-tight drop-shadow-lg">
                {catalog.title}
              </h1>

              <p className="text-base sm:text-xl text-stone-200 font-light max-w-2xl leading-relaxed tracking-wide drop-shadow">
                {catalog.introText ||
                  catalog.description ||
                  `${brandName} markasının doğal taş, mermer ve beton dokularını geniş format porselen mukavemetiyle buluşturan lüks mimari yüzey seçkisi.`}
              </p>

              {/* Cover Action CTAs */}
              <div className="pt-4 flex flex-wrap items-center gap-3 no-print">
                <a
                  href="#section-products"
                  className="px-6 py-3.5 rounded-full bg-gradient-to-r from-[#b4823c] to-[#9a6c2d] hover:from-[#a07231] hover:to-[#885f26] text-white font-bold text-xs tracking-wider uppercase shadow-xl transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <span>Koleksiyonu Keşfet</span>
                  <ArrowDown size={14} className="animate-bounce" />
                </a>

                {products[0]?.slug && (
                  <Link
                    href={`/mekan-dene?product=${products[0].slug}`}
                    className="px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs tracking-wider uppercase backdrop-blur-md border border-white/25 transition cursor-pointer inline-flex items-center gap-2"
                  >
                    <Sparkles size={14} className="text-[#d4af37]" />
                    <span>Mekânında Gör (3D)</span>
                  </Link>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setLeadType('sample');
                    setLeadSubmitted(false);
                    setShowLeadModal(true);
                  }}
                  className="px-6 py-3.5 rounded-full bg-stone-900/60 hover:bg-stone-900 text-stone-200 font-semibold text-xs tracking-wider uppercase backdrop-blur-md border border-white/15 transition cursor-pointer inline-flex items-center gap-2"
                >
                  <Package size={14} />
                  <span>Numune İste</span>
                </button>
              </div>
            </div>

            {/* Bottom Hero Strip */}
            <div className="relative z-10 pt-4 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-3 text-stone-300 text-xs font-mono">
              <div>
                <span>PORSELEN & SERAMİK YÜZEY ÇÖZÜMLERİ</span>
              </div>
              <div className="flex items-center gap-3">
                <span>{products.length} MİMARİ KARO</span>
                <span>&bull;</span>
                <span>REKTİFİYE & MAT & LAPPATO</span>
              </div>
            </div>
          </section>

          {/* =========================================================================
              SECTION 2: KOLEKSİYON BİLGİ ALANI (Doğrulanmış Metadata Bar)
          ========================================================================= */}
          <section id="section-meta" className="border-b border-stone-200 bg-white py-10 px-6 sm:px-12">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                {/* Column 1: Koleksiyon & Ürün Sayısı */}
                <div className="space-y-1.5 border-l-2 border-[#b4823c] pl-4">
                  <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-stone-400 block">
                    Koleksiyon Kapsamı
                  </span>
                  <h4 className="text-lg font-bold text-stone-900">{brandName}</h4>
                  <p className="text-xs text-stone-600">
                    {products.length} Doğrulanmış Mimari Karo
                  </p>
                </div>

                {/* Column 2: Ürün Ebatları (Dinamik) */}
                {uniqueDimensions.length > 0 && (
                  <div className="space-y-1.5 border-l-2 border-stone-300 pl-4">
                    <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-stone-400 block">
                      Üretim Ebatları
                    </span>
                    <h4 className="text-sm sm:text-base font-bold text-stone-900 truncate">
                      {uniqueDimensions.slice(0, 3).join(', ')} cm
                    </h4>
                    <p className="text-xs text-stone-600">
                      {uniqueDimensions.length > 3 ? `+ ${uniqueDimensions.length - 3} Farklı Format` : 'Standart Mimari Boyutlar'}
                    </p>
                  </div>
                )}

                {/* Column 3: Yüzey & Doku */}
                {uniqueFinishes.length > 0 && (
                  <div className="space-y-1.5 border-l-2 border-stone-300 pl-4">
                    <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-stone-400 block">
                      Yüzey & Doku
                    </span>
                    <h4 className="text-sm sm:text-base font-bold text-stone-900 truncate">
                      {uniqueFinishes.join(', ')}
                    </h4>
                    <p className="text-xs text-stone-600">Lazer Rektifiye Kenar</p>
                  </div>
                )}

                {/* Column 4: Standart & Doküman */}
                <div className="space-y-1.5 border-l-2 border-stone-300 pl-4">
                  <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-stone-400 block">
                    Kalite Standardı
                  </span>
                  <h4 className="text-sm sm:text-base font-bold text-stone-900">
                    TS EN 14411
                  </h4>
                  <p className="text-xs text-stone-600">Grup BIa Porselen Karo</p>
                </div>
              </div>
            </div>
          </section>

          {/* =========================================================================
              SECTION 3: CANLI FİLTRELEME & ARAMA ÇUBUĞU
          ========================================================================= */}
          <section className="bg-stone-50 border-b border-stone-200 py-6 px-6 sm:px-12 sticky top-14 z-30 shadow-2xs backdrop-blur-md bg-stone-50/95 no-print">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Search Box */}
              <div className="relative flex-1 max-w-md">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Karo adı veya model kodu ile ara..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-stone-200 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#b4823c] focus:ring-2 focus:ring-[#b4823c]/20 transition shadow-2xs"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Filter Pills (Dimensions & Finishes) */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Dimension Filter */}
                {uniqueDimensions.length > 1 && (
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 mr-1 hidden sm:inline">
                      Ebat:
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedDimension('ALL')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        selectedDimension === 'ALL'
                          ? 'bg-stone-900 text-white'
                          : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      Tümü
                    </button>
                    {uniqueDimensions.map((dim) => (
                      <button
                        key={dim}
                        type="button"
                        onClick={() => setSelectedDimension(dim)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                          selectedDimension === dim
                            ? 'bg-[#b4823c] text-white'
                            : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        {dim}
                      </button>
                    ))}
                  </div>
                )}

                {/* Finish Filter */}
                {uniqueFinishes.length > 1 && (
                  <div className="flex items-center gap-1 ml-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 mr-1 hidden sm:inline">
                      Yüzey:
                    </span>
                    {uniqueFinishes.map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setSelectedFinish(selectedFinish === f ? 'ALL' : f)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                          selectedFinish === f
                            ? 'bg-[#b4823c] text-white'
                            : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                )}

                {/* Reset Filters */}
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="px-2.5 py-1 text-xs text-rose-600 hover:bg-rose-50 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1 ml-1"
                  >
                    <X size={12} />
                    <span>Temizle</span>
                  </button>
                )}
              </div>

              {/* Counter */}
              <div className="text-xs font-mono text-stone-500 flex-shrink-0">
                <strong className="text-stone-900">{filteredProducts.length}</strong> / {products.length} Model
              </div>
            </div>
          </section>

          {/* =========================================================================
              SECTION 4: PROFESYONEL ÜRÜN LİSTELEME GRID (Visual First)
          ========================================================================= */}
          <section id="section-products" className="py-16 sm:py-24 px-6 sm:px-12 max-w-7xl mx-auto">
            <div className="space-y-8">
              <div className="flex items-end justify-between border-b border-stone-200 pb-4">
                <div>
                  <span className="text-[11px] font-mono tracking-widest text-[#b4823c] font-bold uppercase block">
                    PORSELEN & SERAMİK SEÇKİSİ
                  </span>
                  <h2 className="text-2xl sm:text-4xl font-serif-architect font-bold text-stone-900 mt-1">
                    Koleksiyon Karoları
                  </h2>
                </div>
                <p className="text-xs text-stone-500 hidden sm:block">
                  Yüzey detaylarını incelemek için karoya tıklayın.
                </p>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="py-20 text-center bg-white rounded-2xl border border-stone-200 p-8 space-y-3">
                  <Search size={24} className="text-stone-400 mx-auto" />
                  <p className="text-sm font-semibold text-stone-800">
                    Filtre kriterlerinize uygun seramik bulunamadı.
                  </p>
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold transition hover:bg-stone-800 cursor-pointer"
                  >
                    Tüm Ürünleri Göster
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-7">
                  {filteredProducts.map((p) => {
                    const dimensions =
                      p.width && p.height ? `${p.width}×${p.height} cm` : 'Standart Format';
                    const img = p.imageUrl || p.textureUrl || '/placeholder.png';
                    const code = p.code || p.sku || '';

                    return (
                      <div
                        key={p.id}
                        className="group bg-white rounded-2xl border border-stone-200/90 hover:border-[#b4823c] transition-all duration-300 shadow-2xs hover:shadow-md flex flex-col justify-between overflow-hidden print-break-inside-avoid"
                      >
                        {/* Image Container with Hover Zoom */}
                        <div
                          onClick={() => setActiveDetailProduct(p)}
                          className="relative aspect-square bg-stone-100 overflow-hidden cursor-pointer"
                        >
                          <img
                            src={img}
                            alt={p.name}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />

                          {/* Subtle Top Badges */}
                          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                            {p.finish && (
                              <span className="px-2 py-0.5 rounded-md bg-stone-900/75 backdrop-blur-md text-[10px] font-mono text-white font-medium">
                                {p.finish}
                              </span>
                            )}
                          </div>

                          {/* Hover Zoom Overlay */}
                          <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 text-white font-medium text-xs backdrop-blur-2xs transition-opacity duration-200 no-print">
                            <ZoomIn size={15} className="text-[#d4af37]" />
                            <span>Dokuyu İncele</span>
                          </div>
                        </div>

                        {/* Product Info */}
                        <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                          <div onClick={() => setActiveDetailProduct(p)} className="cursor-pointer space-y-0.5">
                            <h3 className="text-sm font-bold text-stone-900 group-hover:text-[#b4823c] transition-colors truncate">
                              {p.name}
                            </h3>
                            <div className="flex items-center justify-between text-[11px] text-stone-500 font-mono">
                              <span>{dimensions}</span>
                              {p.thickness && <span>{p.thickness} mm</span>}
                            </div>
                            {code && (
                              <p className="text-[10px] text-stone-400 font-mono">
                                Kod: {code}
                              </p>
                            )}
                          </div>

                          {/* Quick Actions Row */}
                          <div className="pt-2.5 border-t border-stone-100 flex items-center gap-1.5 no-print">
                            {p.slug && (
                              <Link
                                href={`/mekan-dene?product=${p.slug}`}
                                className="p-2 rounded-lg bg-stone-100 hover:bg-[#b4823c] hover:text-white text-stone-700 text-[11px] font-semibold transition flex items-center justify-center"
                                title="Mekânında 3D Gör"
                              >
                                <Sparkles size={13} />
                              </Link>
                            )}

                            <button
                              type="button"
                              onClick={() => handleOpenLeadForProduct(p, 'sample')}
                              className="flex-1 py-1.5 px-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-[#b4823c] text-[11px] font-bold border border-[#b4823c]/30 flex items-center justify-center gap-1 transition cursor-pointer"
                              title="Numune Talep Et"
                            >
                              <Package size={11} />
                              <span>Numune</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenLeadForProduct(p, 'quote')}
                              className="flex-1 py-1.5 px-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-[11px] font-bold flex items-center justify-center gap-1 transition cursor-pointer shadow-2xs"
                              title="Fiyat Teklifi Al"
                            >
                              <Tag size={11} />
                              <span>Teklif</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* =========================================================================
              SECTION 5: MEKÂN VE AMBİYANS VİTRİNİ (Split Lifestyle Spreads)
          ========================================================================= */}
          {products.length > 0 && (
            <section className="bg-white border-t border-b border-stone-200 py-20 px-6 sm:px-12">
              <div className="max-w-7xl mx-auto space-y-16">
                <div className="text-center max-w-2xl mx-auto space-y-2">
                  <span className="text-[11px] font-mono tracking-widest text-[#b4823c] font-bold uppercase block">
                    MİMARİ AMBİYANS
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-serif-architect font-bold text-stone-900">
                    Mekânlarda Yaşayan Yüzeyler
                  </h2>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    {brandName} porselen seramiklerinin villa, rezidans, lobi ve banyo alanlarındaki mimari uyumu.
                  </p>
                </div>

                {products.slice(0, 2).map((prod, idx) => {
                  const isReversed = idx % 2 === 1;
                  const renderImg =
                    prod.lifestyleUrl ||
                    (idx === 0
                      ? '/renders/luxury_bathroom_calacatta_gold.jpg'
                      : '/renders/modern_living_natural_oak.jpg');
                  const slabImg = prod.imageUrl || prod.textureUrl || renderImg;

                  return (
                    <div
                      key={prod.id}
                      className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center ${
                        isReversed ? 'lg:flex-row-reverse' : ''
                      } print-break-inside-avoid`}
                    >
                      {/* Left: Big Lifestyle Photo */}
                      <div className={`lg:col-span-7 ${isReversed ? 'lg:order-2' : 'lg:order-1'}`}>
                        <div className="relative rounded-3xl overflow-hidden shadow-lg aspect-[16/10] bg-stone-900 group">
                          <img
                            src={renderImg}
                            alt={prod.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-mono">
                            {idx === 0 ? 'Özel Konut & Villa Tasarımı' : 'Lüks Karşılama Alanı'}
                          </div>
                        </div>
                      </div>

                      {/* Right: Slab Detail & Specs */}
                      <div className={`lg:col-span-5 space-y-5 ${isReversed ? 'lg:order-1' : 'lg:order-2'}`}>
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono tracking-widest text-[#b4823c] font-bold uppercase block">
                            ÖNE ÇIKAN MİMARİ SERİ
                          </span>
                          <h3 className="text-2xl sm:text-3xl font-serif-architect font-bold text-stone-900">
                            {prod.name}
                          </h3>
                          <p className="text-xs text-stone-600 leading-relaxed">
                            Doğal taş ve mermer damarlarının zarafetini geniş format porselen mukavemetiyle buluşturan lüks mimari yüzey.
                          </p>
                        </div>

                        {/* Slab Thumbnail */}
                        <div
                          onClick={() => setActiveDetailProduct(prod)}
                          className="relative rounded-2xl overflow-hidden border border-stone-200 bg-stone-100 aspect-[16/9] cursor-pointer shadow-sm group/slab"
                        >
                          <img
                            src={slabImg}
                            alt={prod.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover/slab:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/35 opacity-0 group-hover/slab:opacity-100 flex items-center justify-center gap-1.5 text-white text-xs font-medium backdrop-blur-2xs transition-opacity">
                            <ZoomIn size={15} className="text-[#d4af37]" />
                            <span>Dokuyu 4K Yakınlaştır</span>
                          </div>
                        </div>

                        {/* Dimensions & Specs */}
                        <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs font-mono">
                          <span className="font-bold text-stone-900">
                            {prod.width && prod.height ? `${prod.width}×${prod.height} cm` : 'Format Detayı'}
                          </span>
                          <span className="text-stone-500">&bull;</span>
                          <span className="text-stone-700">{prod.finish || 'Mat Rektifiye'}</span>
                          <span className="text-stone-500">&bull;</span>
                          <span className="text-[#b4823c] font-bold">TS EN 14411</span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3 no-print">
                          {prod.slug && (
                            <Link
                              href={`/mekan-dene?product=${prod.slug}`}
                              className="flex-1 py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition"
                            >
                              <Sparkles size={14} className="text-[#d4af37]" />
                              <span>Mekânda 3D Gör</span>
                            </Link>
                          )}

                          <button
                            type="button"
                            onClick={() => handleOpenLeadForProduct(prod, 'sample')}
                            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#b4823c] to-[#9a6c2d] hover:from-[#a07231] hover:to-[#885f26] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
                          >
                            <Package size={14} />
                            <span>Numune İste</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* =========================================================================
              SECTION 6: TEKNİK STANDARTLAR VE LOJİSTİK MATRİSİ (TS EN 14411)
          ========================================================================= */}
          <section id="section-specs" className="py-20 px-6 sm:px-12 max-w-6xl mx-auto space-y-10">
            <div className="space-y-2 border-b border-stone-200 pb-4">
              <span className="text-[11px] font-mono tracking-widest text-[#b4823c] font-bold uppercase flex items-center gap-2">
                <ShieldCheck size={14} />
                <span>ULUSLARARASI ŞARTNAME UYGUNLUĞU</span>
              </span>
              <h2 className="text-2xl sm:text-4xl font-serif-architect font-bold text-stone-900">
                Teknik Özellikler & Standartlar
              </h2>
              <p className="text-xs text-stone-500 font-mono">
                Standart: TS EN 14411 - ISO 13006 Grup BIa Porselen Karo
              </p>
            </div>

            {/* Technical Specifications Table */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase text-[11px]">
                      <th className="py-3 px-4 font-bold">Fiziksel & Kimyasal Parametre</th>
                      <th className="py-3 px-4 font-bold">Test Standardı</th>
                      <th className="py-3 px-4 font-bold">Beyan Edilen Değer</th>
                      <th className="py-3 px-4 font-bold text-right">Durum</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {[
                      { param: 'Su Emme Oranı (Water Absorption)', std: 'EN ISO 10545-3', val: '≤ % 0.1 (Grup BIa Porselen)' },
                      { param: 'Kırılma Dayanımı (Breaking Strength)', std: 'EN ISO 10545-4', val: '≥ 2000 N (Kalınlığa Göre)' },
                      { param: 'Eğilme Dayanımı (Modulus of Rupture)', std: 'EN ISO 10545-4', val: '≥ 45 N/mm²' },
                      { param: 'Yüzey Aşınma Direnci (PEI)', std: 'EN ISO 10545-7', val: 'PEI III - PEI V (Yoğun Trafik)' },
                      { param: 'Dona Dayanıklılık (Frost Resistance)', std: 'EN ISO 10545-12', val: 'Tam Dayanıklı (Donma Riski Yok)' },
                      { param: 'Leke Tutmazlık (Stain Resistance)', std: 'EN ISO 10545-14', val: 'Sınıf 5 (Kolay Temizlenebilir)' },
                      { param: 'Kimyasal Dayanım (Chemical Resistance)', std: 'EN ISO 10545-13', val: 'Sınıf A / LA / HA' }
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-stone-50/50 transition">
                        <td className="py-3 px-4 font-medium text-stone-900">{row.param}</td>
                        <td className="py-3 px-4 text-stone-500">{row.std}</td>
                        <td className="py-3 px-4 text-[#b4823c] font-semibold">{row.val}</td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            UYGUN
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Packaging and Pallet Matrix */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-stone-900">
                Paketleme ve Lojistik Bilgileri
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
                <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-1">
                  <span className="font-bold text-stone-900 block">60×120 cm (9 mm)</span>
                  <p className="text-stone-500 text-[11px]">Kutu: 2 Adet &bull; 1.44 m² &bull; 29.5 kg</p>
                  <p className="text-[#b4823c] font-bold text-[11px]">Palet: 32 Kutu &bull; 46.08 m²</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-1">
                  <span className="font-bold text-stone-900 block">60×60 cm (8.5 mm)</span>
                  <p className="text-stone-500 text-[11px]">Kutu: 4 Adet &bull; 1.44 m² &bull; 26.8 kg</p>
                  <p className="text-[#b4823c] font-bold text-[11px]">Palet: 36 Kutu &bull; 51.84 m²</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-1">
                  <span className="font-bold text-stone-900 block">30×60 cm (8.5 mm)</span>
                  <p className="text-stone-500 text-[11px]">Kutu: 8 Adet &bull; 1.44 m² &bull; 25.5 kg</p>
                  <p className="text-[#b4823c] font-bold text-[11px]">Palet: 40 Kutu &bull; 57.60 m²</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-1">
                  <span className="font-bold text-stone-900 block">15×60 cm (8.5 mm)</span>
                  <p className="text-stone-500 text-[11px]">Kutu: 11 Adet &bull; 0.99 m² &bull; 18.0 kg</p>
                  <p className="text-[#b4823c] font-bold text-[11px]">Palet: 48 Kutu &bull; 47.52 m²</p>
                </div>
              </div>
            </div>
          </section>

          {/* =========================================================================
              SECTION 7: KURUMSAL İLETİŞİM, BAYİ & COLOPHON
          ========================================================================= */}
          <section id="section-contact" className="border-t border-stone-200 bg-white py-16 px-6 sm:px-12">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
              <div className="md:col-span-8 space-y-5">
                <span className="text-[11px] font-mono tracking-widest text-[#b4823c] font-bold uppercase block">
                  PROJE MASASI & YETKİLİ SATIŞ
                </span>
                <h3 className="text-2xl sm:text-4xl font-serif-architect font-bold text-stone-900">
                  {brandName} Mimari Satış & Numune Servisi
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-xl">
                  Mimari projeler, toplu konutlar ve bayi alımları için doğrudan marka yetkilisi ve en yakın yetkili satış noktası üzerinden fiyat ve fiziksel numune desteği alabilirsiniz.
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-stone-700 font-mono">
                  {brand.website && (
                    <a
                      href={brand.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 hover:text-[#b4823c] underline underline-offset-4"
                    >
                      <Globe size={13} className="text-[#b4823c]" />
                      <span>{brand.website}</span>
                    </a>
                  )}

                  <Link
                    href={`/bayiler?brand=${brand.slug || 'bien-seramik'}`}
                    className="inline-flex items-center gap-1.5 text-[#b4823c] font-bold hover:underline"
                  >
                    <MapPin size={13} />
                    <span>81 İldeki Yetkili Bayileri Gör &rarr;</span>
                  </Link>
                </div>

                <div className="pt-2 flex flex-wrap gap-3 no-print">
                  <button
                    type="button"
                    onClick={() => {
                      setLeadType('sample');
                      setLeadSubmitted(false);
                      setShowLeadModal(true);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#b4823c] to-[#9a6c2d] hover:from-[#a07231] hover:to-[#885f26] text-white font-bold text-xs flex items-center gap-2 shadow-sm cursor-pointer transition"
                  >
                    <Package size={14} />
                    <span>Fiziksel Numune Talep Et</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLeadType('quote');
                      setLeadSubmitted(false);
                      setShowLeadModal(true);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs flex items-center gap-2 shadow-sm cursor-pointer transition"
                  >
                    <Tag size={14} />
                    <span>Kurumsal Fiyat Teklifi İste</span>
                  </button>
                </div>
              </div>

              {/* QR Code Container */}
              <div className="md:col-span-4 p-6 rounded-2xl bg-stone-50 border border-stone-200 text-center space-y-3">
                <div className="p-3 bg-white rounded-xl border border-stone-200 inline-block shadow-2xs">
                  {products[0]?.qrCodeUrl ? (
                    <img
                      src={products[0].qrCodeUrl}
                      alt="Katalog QR Kodu"
                      className="w-28 h-28 mx-auto"
                    />
                  ) : (
                    <QrCode size={112} className="text-stone-900 mx-auto" />
                  )}
                </div>
                <div className="text-xs space-y-0.5">
                  <p className="font-bold text-stone-900">Mobil Cihazla Okutun</p>
                  <p className="text-[11px] text-stone-500 font-mono">
                    Bu kataloğu telefonunuzun kamerasıyla açın
                  </p>
                </div>
              </div>
            </div>
          </section>
        </article>
      )}

      {/* =========================================================================
          ARCHITECTURAL DETAIL & 4K TEXTURE ZOOM MODAL
      ========================================================================= */}
      {activeDetailProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 no-print animate-in fade-in duration-150">
          <div className="relative max-w-4xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-stone-200 flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 px-7 border-b border-stone-100 bg-stone-50/70">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-[#b4823c] font-bold uppercase block">
                  {brandName} &bull; MİMARİ KARO DETAYI
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-stone-900">
                  {activeDetailProduct.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveDetailProduct(null)}
                className="p-1.5 rounded-full text-stone-400 hover:text-stone-800 hover:bg-stone-200 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 flex flex-col items-center justify-center bg-stone-100">
              <img
                src={activeDetailProduct.imageUrl || activeDetailProduct.textureUrl}
                alt={activeDetailProduct.name}
                className="max-h-[55vh] w-auto object-contain rounded-xl shadow-lg transition-transform duration-300 hover:scale-125 cursor-zoom-in"
              />
              <p className="text-[11px] text-stone-500 mt-3 font-mono">
                Damar ve yüzey rölyefini incelemek için görselin üzerine gelin.
              </p>
            </div>

            {/* Modal Footer */}
            <div className="p-4 px-7 border-t border-stone-200 bg-white flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-xs font-mono text-stone-600">
                <span className="font-bold text-stone-900">
                  {activeDetailProduct.width && activeDetailProduct.height
                    ? `${activeDetailProduct.width}×${activeDetailProduct.height} cm`
                    : 'Format'}
                </span>
                <span>&bull;</span>
                <span>{activeDetailProduct.finish || 'Mat Rektifiye'}</span>
                {activeDetailProduct.code && (
                  <>
                    <span>&bull;</span>
                    <span className="text-stone-400">Kod: {activeDetailProduct.code}</span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                {activeDetailProduct.slug && (
                  <Link
                    href={`/mekan-dene?product=${activeDetailProduct.slug}`}
                    className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs flex items-center gap-1.5 transition"
                  >
                    <Sparkles size={13} className="text-[#b4823c]" />
                    <span>Mekânda 3D Gör</span>
                  </Link>
                )}

                <button
                  type="button"
                  onClick={() => {
                    handleOpenLeadForProduct(activeDetailProduct, 'sample');
                    setActiveDetailProduct(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#b4823c] to-[#9a6c2d] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
                >
                  <Package size={13} />
                  <span>Numune İste</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          QR MODAL
      ========================================================================= */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 no-print animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-stone-200 relative animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <span className="text-sm font-bold text-stone-900">Katalog QR Kodu</span>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-800"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 inline-block mx-auto">
              {products[0]?.qrCodeUrl ? (
                <img
                  src={products[0].qrCodeUrl}
                  alt="QR Code"
                  className="w-36 h-36 mx-auto"
                />
              ) : (
                <QrCode size={130} className="text-stone-900 mx-auto" />
              )}
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              Mobil cihazınızın kamerasıyla okutarak <strong>{catalog.title}</strong> kataloğunu anında cebinizde açabilirsiniz.
            </p>

            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition cursor-pointer"
            >
              Kapat
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          B2B LEAD GENERATION (QUOTE & SAMPLE) MODAL
      ========================================================================= */}
      {showLeadModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 no-print overflow-hidden animate-in fade-in duration-150">
          <div className="bg-white text-stone-900 rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl border border-stone-200 relative animate-in zoom-in-95 duration-150 overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-[#b4823c] via-amber-400 to-[#b4823c] flex-shrink-0" />

            {/* Header */}
            <div className="flex items-start justify-between border-b border-stone-100 px-6 py-4 flex-shrink-0 bg-white">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-[#b4823c] font-bold uppercase block">
                  {leadType === 'sample' ? 'MİMARİ NUMUNE SERVİSİ' : 'KURUMSAL FİYAT TEKLİFİ'}
                </span>
                <h3 className="text-lg font-bold text-stone-900">
                  {leadType === 'sample' ? 'Seramik Numune Talebi' : 'Fiyat Teklifi İsteği'}
                </h3>
                <p className="text-xs text-stone-500 truncate max-w-xs sm:max-w-md">
                  {brandName} yetkililerine doğrudan iletilir.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowLeadModal(false)}
                className="p-1.5 rounded-full text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {leadSubmitted ? (
                <div className="py-6 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                    <CheckCircle2 size={32} />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-stone-900">Talebiniz Markaya İletildi!</h4>
                    <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 leading-relaxed">
                      Talebiniz <strong>{brandName}</strong> proje ve satış masasına kaydedildi. En kısa sürede sizinle iletişime geçilecektir.
                    </p>
                  </div>

                  {leadForm.phone && (
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(
                        `Merhaba, "${catalog.title}" kataloğundan ${selectedLeadProducts.join(
                          ', '
                        )} ürünleri için talep oluşturdum.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition"
                    >
                      <MessageCircle size={14} />
                      <span>WhatsApp'tan Anında Bilgi Al</span>
                    </a>
                  )}

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setShowLeadModal(false)}
                      className="px-6 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold transition hover:bg-stone-800"
                    >
                      Tamam
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleLeadSubmit} className="space-y-4">
                  {submitError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                      {submitError}
                    </div>
                  )}

                  {/* Switcher */}
                  <div className="grid grid-cols-2 p-1 rounded-xl bg-stone-100 gap-1 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setLeadType('quote')}
                      className={`py-2 rounded-lg transition ${
                        leadType === 'quote'
                          ? 'bg-white text-stone-900 shadow-2xs'
                          : 'text-stone-500 hover:text-stone-900'
                      }`}
                    >
                      Fiyat Teklifi
                    </button>
                    <button
                      type="button"
                      onClick={() => setLeadType('sample')}
                      className={`py-2 rounded-lg transition ${
                        leadType === 'sample'
                          ? 'bg-white text-stone-900 shadow-2xs'
                          : 'text-stone-500 hover:text-stone-900'
                      }`}
                    >
                      Fiziksel Numune
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-stone-700 block mb-1">
                        Ad Soyad *
                      </label>
                      <input
                        type="text"
                        required
                        value={leadForm.name}
                        onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                        placeholder="Örn: Ayşe Kaya"
                        className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-[#b4823c]"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-stone-700 block mb-1">
                        Firma / Mimarlık Ofisi
                      </label>
                      <input
                        type="text"
                        value={leadForm.company}
                        onChange={(e) => setLeadForm({ ...leadForm, company: e.target.value })}
                        placeholder="Örn: Kaya Mimarlık"
                        className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-[#b4823c]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-stone-700 block mb-1">
                        E-posta *
                      </label>
                      <input
                        type="email"
                        required
                        value={leadForm.email}
                        onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                        placeholder="ornek@mimarlik.com"
                        className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-[#b4823c]"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-stone-700 block mb-1">
                        Telefon *
                      </label>
                      <input
                        type="tel"
                        required
                        value={leadForm.phone}
                        onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                        placeholder="05XX XXX XX XX"
                        className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-[#b4823c]"
                      />
                    </div>
                  </div>

                  {/* Selected Products Preview */}
                  <div>
                    <span className="text-[11px] font-bold text-stone-700 block mb-1">
                      İlgilenilen Ürünler ({selectedLeadProducts.length})
                    </span>
                    <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-700 max-h-24 overflow-y-auto space-y-1">
                      {selectedLeadProducts.slice(0, 5).map((pname, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-[11px]">
                          <Check size={12} className="text-[#b4823c]" />
                          <span className="truncate">{pname}</span>
                        </div>
                      ))}
                      {selectedLeadProducts.length > 5 && (
                        <p className="text-[10px] text-stone-400 pl-4 font-mono">
                          + {selectedLeadProducts.length - 5} Diğer Ürün
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-stone-700 block mb-1">
                      Proje Notu / Mesaj
                    </label>
                    <textarea
                      rows={2}
                      value={leadForm.message}
                      onChange={(e) => setLeadForm({ ...leadForm, message: e.target.value })}
                      placeholder="Proje konumu, tahmini m² miktarı veya numune gönderim adresi..."
                      className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-[#b4823c]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingLead}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#b4823c] to-[#9a6c2d] hover:from-[#a07231] hover:to-[#885f26] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
                  >
                    {isSubmittingLead ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Package size={14} />
                    )}
                    <span>
                      {leadType === 'sample' ? 'Ücretsiz Numune Talebini İlet' : 'Fiyat Teklifi Talebini Gönder'}
                    </span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          FOOTER (Corporate & Platform Disclaimer)
      ========================================================================= */}
      <footer className="border-t border-stone-200 bg-white py-10 px-6 sm:px-12 text-stone-500 text-xs no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <p className="font-semibold text-stone-800">
              {brandName} &bull; {catalog.title}
            </p>
            <p className="text-[11px] text-stone-400 mt-0.5">
              Tüm görsel ve model hakları ilgili üretici markanın tescilli mülkiyetindedir.
            </p>
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            <span>Dijital Mimari Sergi Platformu:</span>
            <Link href="/" className="font-bold text-[#b4823c] hover:underline flex items-center gap-1">
              <span>SeramikBak.com</span>
              <Sparkles size={11} />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
