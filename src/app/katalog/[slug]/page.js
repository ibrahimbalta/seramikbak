'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams } from 'next/navigation';
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
  ChevronUp,
  ChevronDown,
  Check,
  Copy,
  Mail,
  Send,
  MessageCircle,
  RotateCcw,
  Building2,
  User,
  Phone,
  Calendar,
  Package,
  Eye,
  FileText,
  CheckCircle2,
  Tag,
  BookOpen
} from 'lucide-react';
import Link from 'next/link';
import CatalogTemplateRenderer from '@/components/brand/catalog/templates/CatalogTemplateRenderer';
import HtmlLookbookViewer from '@/components/brand/catalog/templates/HtmlLookbookViewer';
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
  const [viewerMode, setViewerMode] = useState('lookbook'); // 'lookbook' (HTML Luxury Editorial) | 'pages' (A4 Print Simulator)

  // Interactive Product Search & QR Modal
  const [searchQuery, setSearchQuery] = useState('');
  const [showProductDrawer, setShowProductDrawer] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showTocDrawer, setShowTocDrawer] = useState(false);

  // Enhanced Share Menu & Feedback
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  // Scroll to Top
  const [showScrollTop, setShowScrollTop] = useState(false);

  // B2B Lead Generation (Quote & Sample Request)
  const [showLeadPanel, setShowLeadPanel] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [leadType, setLeadType] = useState('quote'); // 'quote' | 'sample'
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [leadForm, setLeadForm] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const shareMenuRef = useRef(null);
  const leadPanelRef = useRef(null);

  useEffect(() => {
    if (slug) {
      fetchCatalog();
    }
  }, [slug]);

  // Pre-select all catalog products when products load
  useEffect(() => {
    if (products && products.length > 0) {
      setSelectedProducts(products.map((p) => p.name || p.sku || 'Seramik Ürün'));
    }
  }, [products]);

  // Track scroll position for scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== 'undefined') {
        setShowScrollTop(window.scrollY > 300);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Click outside listener for Share dropdown and Lead panel
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target)) {
        setShowShareMenu(false);
      }
      if (leadPanelRef.current && !leadPanelRef.current.contains(event.target)) {
        setShowLeadPanel(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Listen for B2B Lead Modal triggers from catalog templates
  useEffect(() => {
    const handleOpenLeadModal = (e) => {
      const p = e.detail?.product;
      if (p) {
        setSelectedProducts([p.name || p.sku || 'Seramik Ürün']);
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
      await prepareAndPrintCatalog({ stageId: 'catalog-print-stage' });
    } finally {
      setIsPrinting(false);
    }
  };

  // Enhanced Social Sharing Handlers
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = catalog?.title
    ? `${catalog.title} - ${catalog.brand?.name || 'SeramikBak'}`
    : 'SeramikBak Dijital Lookbook';

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
    const body = `Merhaba,\n\n"${catalog?.title}" dijital seramik lookbook ve ürün kataloğunu aşağıdaki bağlantıdan inceleyebilirsiniz:\n\n${currentUrl}\n\nSeramikBak B2B Dijital Sergi ve Katalog Sistemi`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    setShowShareMenu(false);
  };

  // Product Tag Selection for Lead Form
  const toggleProductSelection = (productName) => {
    setSelectedProducts((prev) =>
      prev.includes(productName)
        ? prev.filter((p) => p !== productName)
        : [...prev, productName]
    );
  };

  const selectAllProducts = () => {
    setSelectedProducts(products.map((p) => p.name || p.sku || 'Seramik Ürün'));
  };

  const clearAllProducts = () => {
    setSelectedProducts([]);
  };

  // Handle B2B Lead Form Submit (Direct DB save to Brand Portal)
  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    if (!leadForm.name?.trim() || !leadForm.phone?.trim()) {
      alert('Lütfen Ad Soyad ve Telefon numarası giriniz.');
      return;
    }

    setIsSubmittingLead(true);
    setSubmitError('');

    try {
      const res = await fetch('/api/brand/catalogs/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          catalogId: catalog?.id,
          catalogSlug: slug,
          brandId: catalog?.brandId || catalog?.brand?.id,
          leadType,
          name: leadForm.name,
          company: leadForm.company,
          email: leadForm.email,
          phone: leadForm.phone,
          selectedProducts,
          message: leadForm.message
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setLeadSubmitted(true);
      } else {
        setSubmitError(data.error || 'Talep iletilemedi.');
      }
    } catch (err) {
      setSubmitError('Bağlantı hatası: ' + err.message);
    } finally {
      setIsSubmittingLead(false);
    }
  };

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.code?.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q) ||
        p.color?.toLowerCase().includes(q) ||
        p.finish?.toLowerCase().includes(q)
    );
  }, [products, searchQuery]);

  // Unique surface finishes for Table of Contents / Quick Filter
  const availableFinishes = useMemo(() => {
    const finishes = new Set();
    products.forEach((p) => {
      if (p.finish) finishes.add(p.finish);
    });
    return Array.from(finishes);
  }, [products]);

  // Enhanced Loading State with Skeleton Pulse Animation
  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col no-print">
        {/* Header Skeleton */}
        <div className="border-b border-white/10 px-4 md:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/10 animate-pulse" />
            <div className="space-y-1.5">
              <div className="w-44 h-4 rounded-md bg-white/15 animate-pulse" />
              <div className="w-24 h-2.5 rounded-md bg-white/10 animate-pulse" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-28 h-8 rounded-xl bg-white/10 animate-pulse hidden sm:block" />
            <div className="w-9 h-8 rounded-xl bg-white/10 animate-pulse" />
            <div className="w-28 h-8 rounded-xl bg-amber-500/30 animate-pulse" />
          </div>
        </div>

        {/* Catalog Lookbook Canvas Skeleton */}
        <div className="flex-1 p-4 md:p-8 flex flex-col items-center justify-center max-w-5xl mx-auto w-full">
          <div className="w-full bg-neutral-900/60 rounded-3xl border border-white/10 p-6 md:p-10 shadow-2xl backdrop-blur-sm space-y-8 animate-pulse">
            {/* Hero Cover Banner Skeleton */}
            <div className="w-full h-64 md:h-80 rounded-2xl bg-neutral-800/80 relative overflow-hidden flex flex-col justify-end p-6 md:p-8">
              <div className="w-24 h-5 rounded-full bg-amber-500/30 mb-3" />
              <div className="w-3/4 md:w-1/2 h-8 rounded-lg bg-neutral-700/80 mb-2" />
              <div className="w-1/2 md:w-1/3 h-4 rounded-md bg-neutral-700/50" />
            </div>

            {/* Lookbook Tile Preview Grid Skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-2xl bg-neutral-800/60 border border-white/5 p-3 space-y-3">
                  <div className="aspect-square rounded-xl bg-neutral-700/50" />
                  <div className="w-3/4 h-3.5 rounded bg-neutral-700/70" />
                  <div className="w-1/2 h-2.5 rounded bg-neutral-700/40" />
                </div>
              ))}
            </div>
          </div>

          {/* Loading status badge */}
          <div className="mt-8 flex items-center gap-3 px-5 py-2.5 rounded-full bg-neutral-900/90 border border-amber-500/30 shadow-xl text-xs font-semibold text-neutral-300">
            <Loader2 size={16} className="animate-spin text-amber-500" />
            <span>SeramikBak Dijital Lookbook Yükleniyor...</span>
          </div>
        </div>
      </div>
    );
  }

  // Enhanced Error State with Retry Button
  if (error || !catalog) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-white p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-5 shadow-lg shadow-rose-500/10">
          <AlertCircle size={32} />
        </div>
        <h1 className="text-2xl font-bold mb-2 tracking-tight">Katalog Görüntülenemedi</h1>
        <p className="text-sm text-neutral-400 max-w-md mb-8 leading-relaxed">
          {error || 'İstenen dijital katalog bulunamadı veya henüz yayına alınmamış olabilir.'}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={fetchCatalog}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer"
          >
            <RotateCcw size={14} />
            <span>Tekrar Dene</span>
          </button>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs flex items-center gap-2 transition"
          >
            <ArrowLeft size={14} />
            <span>Ana Sayfaya Dön</span>
          </Link>
        </div>
      </div>
    );
  }

  const brand = catalog.brand || {};

  return (
    <div className="min-h-screen bg-neutral-900 flex flex-col text-white relative">
      {/* Top Streamlined Architectural Publication Header */}
      <header className="sticky top-0 z-40 bg-[#0d0f12]/90 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 no-print select-none">
        {/* Left: Brand & Catalog Title */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/"
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 flex items-center gap-1 transition flex-shrink-0"
            title="SeramikBak Ana Sayfa"
          >
            <ArrowLeft size={16} />
            <span className="hidden md:inline font-mono text-[11px] text-stone-400">SeramikBak</span>
          </Link>

          <div className="h-4 w-px bg-white/20 hidden md:block flex-shrink-0" />

          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm font-bold text-white tracking-wider uppercase truncate max-w-[150px] xs:max-w-xs md:max-w-md font-sans">
              {brand.name || 'SERAMİK'} &bull; <span className="font-light text-stone-300">{catalog.title}</span>
            </h1>
          </div>
        </div>

        {/* Center: Subtle Section Navigation (Desktop) */}
        <nav className="hidden lg:flex items-center gap-6 text-[11px] font-sans font-medium tracking-widest uppercase text-stone-300">
          <a href="#section-cover" className="hover:text-amber-400 transition">Kapak</a>
          <span className="text-white/20">&bull;</span>
          <a href="#section-manifesto" className="hover:text-amber-400 transition">Felsefe</a>
          <span className="text-white/20">&bull;</span>
          <a href="#section-spreads" className="hover:text-amber-400 transition">Mekanlar</a>
          <span className="text-white/20">&bull;</span>
          <a href="#section-grid" className="hover:text-amber-400 transition">Koleksiyon</a>
          <span className="text-white/20">&bull;</span>
          <a href="#section-specs" className="hover:text-amber-400 transition">Standartlar</a>
          <span className="text-white/20">&bull;</span>
          <a href="#section-contact" className="hover:text-amber-400 transition">İletişim</a>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Format Switcher */}
          <div className="hidden sm:flex items-center gap-1 bg-white/5 border border-white/10 p-0.5 rounded-xl text-[11px]">
            <button
              type="button"
              onClick={() => setViewerMode('lookbook')}
              className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                viewerMode === 'lookbook'
                  ? 'bg-amber-500 text-neutral-950 shadow-xs'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              Lookbook
            </button>
            <button
              type="button"
              onClick={() => setViewerMode('pages')}
              className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                viewerMode === 'pages'
                  ? 'bg-amber-500 text-neutral-950 shadow-xs'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              A4 Baskı
            </button>
          </div>

          {/* Share Button */}
          <div className="relative flex-shrink-0" ref={shareMenuRef}>
            <button
              type="button"
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              title="Kataloğu Paylaş"
            >
              <Share2 size={14} className={showShareMenu ? 'text-amber-400' : ''} />
              <span className="hidden sm:inline">Paylaş</span>
            </button>

            {showShareMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-neutral-950 border border-white/15 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-white/10 mb-1">
                  <p className="text-[11px] font-bold text-white uppercase tracking-wider">Kataloğu Paylaş</p>
                  <p className="text-[10px] text-stone-400 truncate">{catalog.title}</p>
                </div>

                <button
                  type="button"
                  onClick={handleWhatsAppShare}
                  className="w-full px-3 py-2 rounded-xl hover:bg-white/10 text-xs text-left flex items-center gap-2.5 text-stone-200 hover:text-white transition cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <MessageCircle size={14} />
                  </div>
                  <span>WhatsApp ile Paylaş</span>
                </button>

                <button
                  type="button"
                  onClick={handleLinkedInShare}
                  className="w-full px-3 py-2 rounded-xl hover:bg-white/10 text-xs text-left flex items-center gap-2.5 text-stone-200 hover:text-white transition cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                    <LinkedInIcon size={14} />
                  </div>
                  <span>LinkedIn'de Paylaş</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="w-full px-3 py-2 rounded-xl hover:bg-white/10 text-xs text-left flex items-center gap-2.5 text-stone-200 hover:text-white transition cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-lg bg-white/10 text-stone-300 flex items-center justify-center">
                    {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  </div>
                  <span>{copied ? 'Kopyalandı! ✓' : 'Bağlantıyı Kopyala'}</span>
                </button>
              </div>
            )}
          </div>

          {/* PDF Button */}
          <button
            type="button"
            onClick={handlePrint}
            disabled={isPrinting}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            title="PDF Olarak Yazdır / İndir"
          >
            {isPrinting ? <Loader2 size={14} className="animate-spin" /> : <Printer size={14} />}
            <span className="hidden sm:inline">{isPrinting ? 'Hazırlanıyor...' : 'PDF'}</span>
          </button>

          {/* Primary Lead CTA Button */}
          <button
            type="button"
            onClick={() => {
              setLeadType('sample');
              setLeadSubmitted(false);
              setShowLeadModal(true);
            }}
            className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition cursor-pointer"
          >
            <Package size={13} />
            <span className="hidden xs:inline">Teklif & Numune</span>
            <span className="xs:hidden">Talep</span>
          </button>
        </div>
      </header>

      {/* Main Lookbook Container */}
      <main className="flex-1 flex justify-center overflow-x-hidden">
        {viewerMode === 'lookbook' ? (
          <div className="w-full">
            <HtmlLookbookViewer
              catalog={catalog}
              products={products}
              mode="preview"
              onOpenLeadModal={({ product, type }) => {
                if (product) {
                  setSelectedProducts([product.name || product.sku || 'Seramik Ürün']);
                }
                if (type) {
                  setLeadType(type);
                }
                setLeadSubmitted(false);
                setShowLeadModal(true);
              }}
            />
          </div>
        ) : (
          <div className="w-full max-w-5xl p-4 md:p-8">
            <CatalogTemplateRenderer catalog={catalog} products={products} mode="preview" />
          </div>
        )}
      </main>

      {/* Scroll to Top Floating Button (Bottom-Left) */}
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-4 sm:bottom-6 left-3 sm:left-6 z-40 no-print w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-neutral-950/90 hover:bg-neutral-900 text-amber-400 border border-amber-500/30 hover:border-amber-400 shadow-xl backdrop-blur-md flex items-center justify-center transition-all duration-300 hover:scale-110 cursor-pointer group ${
          showScrollTop ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        aria-label="Sayfanın Başına Dön"
        title="Sayfanın Başına Dön"
      >
        <ChevronUp size={20} className="group-hover:-translate-y-0.5 transition-transform" />
      </button>

      {/* B2B Lead Generation Contact Form Modal (Premium Luminous Architectural Styling) */}
      {showLeadModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 no-print overflow-hidden animate-in fade-in duration-200">
          <div className="bg-white text-slate-900 rounded-2xl sm:rounded-3xl max-w-xl w-full max-h-[90dvh] flex flex-col shadow-2xl border border-stone-200/90 relative animate-in zoom-in-95 duration-200 overflow-hidden">
            {/* Top Architectural Bronze Bar */}
            <div className="h-1.5 bg-gradient-to-r from-[#b4823c] via-amber-400 to-[#b4823c] flex-shrink-0" />

            {/* Pinned Sticky Header */}
            <div className="flex items-start justify-between border-b border-stone-100 px-5 sm:px-7 py-3 sm:py-3.5 flex-shrink-0 bg-white">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-[#fbf6ee] text-[#b4823c] border border-[#e8d5b5] shadow-2xs mb-1">
                  <Sparkles size={11} className="text-[#b4823c]" />
                  <span>
                    {leadType === 'sample' ? 'Mimari Numune Masası' : 'Kurumsal B2B Fiyat Teklifi'}
                  </span>
                </div>
                <h3 className="text-lg sm:text-2xl font-serif font-extrabold text-slate-900 tracking-tight">
                  {leadType === 'sample' ? 'Seramik Numune Talebi' : 'Fiyat Teklifi Talebi'}
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-500 font-medium truncate max-w-xs sm:max-w-md">
                  <span className="font-semibold text-slate-800">{catalog.title}</span> için doğrudan iletilir.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowLeadModal(false)}
                className="p-1.5 sm:p-2 rounded-full text-slate-400 hover:text-slate-800 hover:bg-stone-100 transition cursor-pointer flex-shrink-0"
                title="Kapat"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Modal Body */}
            <div className="p-4 sm:p-6 sm:px-7 overflow-y-auto flex-1 overscroll-contain space-y-4">
              {leadSubmitted ? (
                <div className="py-6 sm:py-8 text-center space-y-4">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 shadow-sm">
                    <CheckCircle2 size={32} />
                  </div>
                  <div>
                    <h4 className="text-base sm:text-lg font-bold text-slate-900">Talebiniz Marka Yetkilisine İletildi!</h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto mt-1.5 leading-relaxed">
                      Talebiniz <strong>{brand.name || 'marka'}</strong> dijital katalog masasına başarıyla kaydedildi. Yetkililerimiz en kısa sürede sizinle iletişime geçecektir.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 max-w-sm mx-auto text-left text-xs space-y-1">
                    <div className="flex justify-between text-slate-600">
                      <span>Talep Sahibi:</span>
                      <strong className="text-slate-900">{leadForm.name}</strong>
                    </div>
                    {leadForm.company && (
                      <div className="flex justify-between text-slate-600">
                        <span>Firma:</span>
                        <strong className="text-slate-900">{leadForm.company}</strong>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-600">
                      <span>Telefon:</span>
                      <strong className="text-slate-900">{leadForm.phone}</strong>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Kapsam:</span>
                      <strong className="text-[#b4823c]">{selectedProducts.length} Seçili Seramik Ürün</strong>
                    </div>
                  </div>
                  <div className="pt-2 flex justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setLeadSubmitted(false);
                        setLeadForm({ name: '', company: '', email: '', phone: '', message: '' });
                      }}
                      className="px-4 py-2.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-xs font-bold text-slate-700 transition cursor-pointer shadow-2xs"
                    >
                      Yeni Talep Oluştur
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowLeadModal(false)}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#b4823c] to-[#9a6c2d] hover:from-[#a07231] hover:to-[#885f26] text-white font-extrabold text-xs shadow-md transition cursor-pointer"
                    >
                      Tamam
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleLeadSubmit} className="space-y-4">
                  {submitError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                      <AlertCircle size={15} className="flex-shrink-0" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  {/* Switch between Quote & Sample */}
                  <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-stone-100/90 border border-stone-200/80 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setLeadType('quote')}
                      className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        leadType === 'quote'
                          ? 'bg-white text-slate-900 shadow-xs border border-stone-200/80'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      <Tag size={13} className={leadType === 'quote' ? 'text-[#b4823c]' : ''} />
                      <span>Fiyat Teklifi İste</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setLeadType('sample')}
                      className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        leadType === 'sample'
                          ? 'bg-white text-slate-900 shadow-xs border border-stone-200/80'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      <Package size={13} className={leadType === 'sample' ? 'text-[#b4823c]' : ''} />
                      <span>Numune Talep Et</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                        <User size={13} className="text-[#b4823c]" />
                        <span>Ad Soyad *</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={leadForm.name}
                        onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                        placeholder="Örn: Selin Yılmaz"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50/70 border border-stone-200 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#b4823c] focus:ring-4 focus:ring-amber-500/10 transition shadow-2xs"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                        <Building2 size={13} className="text-[#b4823c]" />
                        <span>Firma / Proje Ofisi</span>
                      </label>
                      <input
                        type="text"
                        value={leadForm.company}
                        onChange={(e) => setLeadForm({ ...leadForm, company: e.target.value })}
                        placeholder="Örn: Yılmaz Mimarlık"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50/70 border border-stone-200 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#b4823c] focus:ring-4 focus:ring-amber-500/10 transition shadow-2xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                        <Mail size={13} className="text-[#b4823c]" />
                        <span>E-posta Adresi *</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={leadForm.email}
                        onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                        placeholder="selin@mimarlik.com"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50/70 border border-stone-200 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#b4823c] focus:ring-4 focus:ring-amber-500/10 transition shadow-2xs"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                        <Phone size={13} className="text-[#b4823c]" />
                        <span>Telefon Numarası *</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={leadForm.phone}
                        onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                        placeholder="05XX XXX XX XX"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50/70 border border-stone-200 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#b4823c] focus:ring-4 focus:ring-amber-500/10 transition shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* İlgilenilen Ürünler (Auto-filled Tags) */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                        <Tag size={13} className="text-[#b4823c]" />
                        <span>İlgilenilen Ürünler ({selectedProducts.length} Seçili)</span>
                      </label>
                      {products.length > 0 && (
                        <div className="flex items-center gap-2 text-xs">
                          <button
                            type="button"
                            onClick={selectAllProducts}
                            className="font-bold text-[#b4823c] hover:underline cursor-pointer"
                          >
                            Tümünü Seç
                          </button>
                          <span className="text-slate-300">&bull;</span>
                          <button
                            type="button"
                            onClick={clearAllProducts}
                            className="font-medium text-slate-500 hover:text-slate-800 cursor-pointer"
                          >
                            Temizle
                          </button>
                        </div>
                      )}
                    </div>

                    {products.length > 0 ? (
                      <div className="p-2.5 rounded-2xl bg-stone-50/80 border border-stone-200/90 max-h-32 overflow-y-auto flex flex-wrap gap-1.5">
                        {products.map((p) => {
                          const pName = p.name || p.sku || `Ürün #${p.id}`;
                          const isSelected = selectedProducts.includes(pName);
                          return (
                            <button
                              key={p.id || pName}
                              type="button"
                              onClick={() => toggleProductSelection(pName)}
                              className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                                isSelected
                                  ? 'bg-[#fbf6ee] text-[#8d6225] border border-[#e8d5b5] shadow-2xs'
                                  : 'bg-white text-slate-600 border border-stone-200 hover:border-amber-300 hover:text-slate-900'
                              }`}
                            >
                              <span>{pName}</span>
                              {isSelected ? (
                                <Check size={12} className="text-[#b4823c]" />
                              ) : (
                                <span className="text-slate-400 font-bold">+</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <input
                        type="text"
                        placeholder="Örn: 60x120 Mermer Serisi, Mat Yüzey..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50/70 border border-stone-200 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#b4823c] focus:ring-4 focus:ring-amber-500/10 transition shadow-2xs"
                      />
                    )}
                  </div>

                  {/* Mesaj */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <FileText size={13} className="text-[#b4823c]" />
                      <span>Proje Notları & Mesaj</span>
                    </label>
                    <textarea
                      rows={3}
                      value={leadForm.message}
                      onChange={(e) => setLeadForm({ ...leadForm, message: e.target.value })}
                      placeholder={
                        leadType === 'sample'
                          ? 'Numune kiti teslimat adresi veya özel yüzey beklentilerinizi yazınız...'
                          : 'Tahmini metraj (m²), proje lokasyonu ve termin planınız...'
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50/70 border border-stone-200 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#b4823c] focus:ring-4 focus:ring-amber-500/10 transition shadow-2xs resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingLead}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#b4823c] to-[#9a6c2d] hover:from-[#a07231] hover:to-[#885f26] disabled:opacity-60 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-900/15 transition-all cursor-pointer active:scale-[0.99]"
                  >
                    {isSubmittingLead ? (
                      <>
                        <Loader2 size={16} className="animate-spin text-white" />
                        <span>Talep Markaya İletiliyor...</span>
                      </>
                    ) : (
                      <>
                        <Send size={15} />
                        <span>
                          {leadType === 'sample' ? 'Numune Talebini Gönder' : 'Teklif Talebini Gönder'}
                        </span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* QR Code Share Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 no-print overflow-hidden animate-in fade-in duration-150">
          <div className="bg-white text-neutral-900 rounded-2xl max-w-sm w-full max-h-[90dvh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-3.5 flex-shrink-0">
              <span className="text-sm font-extrabold">Web Kataloğu QR Kodu</span>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-800 transition"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-5 overflow-y-auto flex-1 text-center space-y-4">
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 inline-block mx-auto">
                {products[0]?.qrCodeUrl ? (
                  <img src={products[0].qrCodeUrl} alt="QR Code" className="w-36 h-36 sm:w-40 sm:h-40 mx-auto" />
                ) : (
                  <QrCode size={130} className="text-neutral-900 mx-auto" />
                )}
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Mobil cihazınızın kamerasıyla okutarak <strong>{catalog.title}</strong> kataloğuna anında
                erişebilirsiniz.
              </p>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="w-full py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition cursor-pointer"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Footer */}
      <footer className="border-t border-white/10 bg-neutral-950 text-neutral-400 text-xs no-print">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-10 space-y-8">
          {/* Top Row: Meta Cards & Quick B2B Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Meta Info Card */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Katalog Bilgileri
                </h4>
              </div>
              <ul className="space-y-1.5 text-[11px]">
                <li className="flex items-center justify-between">
                  <span>Marka:</span>
                  <span className="font-semibold text-white">{brand.name || 'SeramikBak'}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Toplam Ürün:</span>
                  <span className="font-semibold text-white">{products.length} Seramik Ürün</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Tasarım Şablonu:</span>
                  <span className="font-semibold text-white">
                    {catalog.templateId || 'Lookbook Modern'}
                  </span>
                </li>
                {catalog.createdAt && (
                  <li className="flex items-center justify-between">
                    <span>Yayın Tarihi:</span>
                    <span className="font-semibold text-white">
                      {new Date(catalog.createdAt).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </li>
                )}
                {catalog.viewCount > 0 && (
                  <li className="flex items-center justify-between">
                    <span>Görüntülenme:</span>
                    <span className="font-semibold text-amber-400">
                      {catalog.viewCount} Ziyaret
                    </span>
                  </li>
                )}
              </ul>
            </div>

            {/* B2B Services Card */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Kurumsal Satış & Destek
                </h4>
              </div>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Mimarlık ofisleri, müteahhitler ve toptan alıcılar için özel iskonto oranları ve fiziksel numune desteği sağlanmaktadır.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setLeadType('quote');
                    setLeadSubmitted(false);
                    setShowLeadModal(true);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold text-[11px] border border-amber-500/30 transition cursor-pointer"
                >
                  Fiyat Teklifi Al
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLeadType('sample');
                    setLeadSubmitted(false);
                    setShowLeadModal(true);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white font-semibold text-[11px] border border-white/10 transition cursor-pointer"
                >
                  Numune İste
                </button>
              </div>
            </div>

            {/* Social Sharing Row Card */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Kataloğu Paylaş
                </h4>
              </div>
              <p className="text-[11px] text-neutral-400">
                Bu dijital lookbook kataloğunu iş ortaklarınız ve müşterilerinizle paylaşın:
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleWhatsAppShare}
                  className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition cursor-pointer"
                  title="WhatsApp ile Paylaş"
                >
                  <MessageCircle size={16} />
                </button>
                <button
                  type="button"
                  onClick={handleLinkedInShare}
                  className="p-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 transition cursor-pointer"
                  title="LinkedIn'de Paylaş"
                >
                  <LinkedInIcon size={16} />
                </button>
                <button
                  type="button"
                  onClick={handleEmailShare}
                  className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 transition cursor-pointer"
                  title="E-posta ile Paylaş"
                >
                  <Mail size={16} />
                </button>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className={`px-3 py-2 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 border transition cursor-pointer ${
                    copied
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-white/5 hover:bg-white/10 text-white border-white/10'
                  }`}
                  title="Bağlantıyı Kopyala"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? 'Kopyalandı!' : 'Kopyala'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Trademark & Independence Disclaimer */}
          <div className="pt-6 pb-2 border-t border-white/10 text-center">
            <p className="text-[11px] text-neutral-400/80 leading-relaxed max-w-4xl mx-auto">
              Bu dijital katalogda adı geçen tüm seramik markaları, logolar ve model serileri ilgili üretici şirketlerin tescilli mülkiyetindedir. SeramikBak, bağımsız bir dijital sergileme ve katalog altyapısı teknolojisi olup bahsi geçen markalarla resmi bir temsilcilik ya da ortaklık bağı bulunmamaktadır.
            </p>
          </div>

          {/* Bottom Branding Bar */}
          <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <p className="text-[11px] text-neutral-500">
              &copy; {new Date().getFullYear()} {brand.name || 'SeramikBak'} &bull; Tüm hakları saklıdır.
            </p>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="text-neutral-500">Dijital Lookbook & Sergi Altyapısı:</span>
              <Link
                href="/"
                className="font-bold text-amber-400 hover:text-amber-300 transition flex items-center gap-1"
              >
                <span>SeramikBak.com</span>
                <Sparkles size={11} className="text-amber-400" />
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
