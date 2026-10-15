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
  Linkedin,
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
import { prepareAndPrintCatalog } from '@/utils/printCatalog';

export default function PublicCatalogViewerPage() {
  const params = useParams();
  const slug = params?.slug;

  const [catalog, setCatalog] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPrinting, setIsPrinting] = useState(false);

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

  // Handle B2B Lead Form Submit
  const handleLeadSubmit = (e) => {
    e.preventDefault();
    const isQuote = leadType === 'quote';
    const recipientEmail = catalog?.brand?.email || 'destek@seramikbak.com';
    const subject = `[${isQuote ? 'Fiyat Teklifi Talebi' : 'Numune Talebi'}] ${catalog?.title || 'Katalog'} - ${leadForm.company || leadForm.name}`;

    const productListText =
      selectedProducts.length > 0
        ? selectedProducts.map((p) => `• ${p}`).join('\n')
        : 'Tüm Katalog Ürünleri';

    const body = [
      `--- ${isQuote ? 'B2B FİYAT TEKLİFİ TALEBİ' : 'SERAMİK NUMUNE TALEBİ'} ---`,
      '',
      `Katalog: ${catalog?.title || ''}`,
      `Marka: ${catalog?.brand?.name || 'SeramikBak'}`,
      `Katalog Bağlantısı: ${currentUrl}`,
      '',
      'MÜŞTERİ BİLGİLERİ:',
      `Ad Soyad: ${leadForm.name}`,
      `Firma Adı: ${leadForm.company || 'Belirtilmedi'}`,
      `E-posta: ${leadForm.email}`,
      `Telefon: ${leadForm.phone}`,
      '',
      'TALEP EDİLEN ÜRÜNLER:',
      productListText,
      '',
      'MESAJ / PROJE NOTLARI:',
      leadForm.message || 'Özel bir not belirtilmedi.',
      '',
      '-------------------------------------------',
      'Bu talep SeramikBak Dijital Katalog B2B Modülü üzerinden oluşturulmuştur.'
    ].join('\n');

    const mailtoUrl = `mailto:${encodeURIComponent(recipientEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    if (typeof window !== 'undefined') {
      window.open(mailtoUrl, '_blank') || (window.location.href = mailtoUrl);
    }

    setLeadSubmitted(true);
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
      {/* Top Sticky Header */}
      <header className="sticky top-0 z-40 bg-neutral-950/95 backdrop-blur-md border-b border-white/10 px-4 md:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-xs text-neutral-400 hover:text-white flex items-center gap-1.5 transition"
            title="SeramikBak Ana Sayfa"
          >
            <ArrowLeft size={15} />
            <span className="hidden sm:inline font-semibold">SeramikBak</span>
          </Link>

          <div className="h-4 w-px bg-white/20" />

          <div>
            <h1 className="text-sm font-bold text-white tracking-wide truncate max-w-xs md:max-w-md">
              {catalog.title}
            </h1>
            <p className="text-[11px] text-neutral-400 font-medium flex items-center gap-1.5">
              <span>{brand.name || 'Marka'}</span>
              <span>&bull;</span>
              <span>
                {products.length > 0
                  ? `${products.length} Seramik Ürün`
                  : `${catalog.customCanvasPages?.length || 0} Özel Tasarım Sayfası`}
              </span>
              {catalog.viewCount > 0 && (
                <>
                  <span>&bull;</span>
                  <span className="inline-flex items-center gap-1 text-neutral-400">
                    <Eye size={11} className="text-amber-400" />
                    <span>{catalog.viewCount}</span>
                  </span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Table of Contents Toggle */}
          <button
            type="button"
            onClick={() => {
              setShowTocDrawer(!showTocDrawer);
              setShowProductDrawer(false);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              showTocDrawer
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            title="Katalog İçindekiler"
          >
            <Layers size={14} className="text-amber-400" />
            <span className="hidden md:inline">İçindekiler</span>
          </button>

          {/* Quick Product Search inside Catalog */}
          {products.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setShowProductDrawer(!showProductDrawer);
                setShowTocDrawer(false);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
                showProductDrawer
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Search size={14} className="text-amber-400" />
              <span>Ürün Ara ({products.length})</span>
            </button>
          )}

          {/* QR Code Modal Trigger */}
          <button
            type="button"
            onClick={() => setShowQrModal(true)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            title="QR Kod ile Mobil Cihazda Aç"
          >
            <QrCode size={15} />
          </button>

          {/* Enhanced Share Dropdown */}
          <div className="relative" ref={shareMenuRef}>
            <button
              type="button"
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              aria-expanded={showShareMenu}
            >
              <Share2 size={14} className={showShareMenu ? 'text-amber-400' : ''} />
              <span className="hidden sm:inline">Paylaş</span>
              <ChevronDown
                size={12}
                className={`transition-transform duration-200 ${showShareMenu ? 'rotate-180' : ''}`}
              />
            </button>

            {showShareMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-neutral-950 border border-white/15 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-white/10 mb-1">
                  <p className="text-[11px] font-bold text-white">Kataloğu Paylaş</p>
                  <p className="text-[10px] text-neutral-400 truncate">{catalog.title}</p>
                </div>

                <button
                  type="button"
                  onClick={handleWhatsAppShare}
                  className="w-full px-3 py-2 rounded-xl hover:bg-white/10 text-xs text-left flex items-center gap-2.5 text-neutral-200 hover:text-white transition cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <MessageCircle size={14} />
                  </div>
                  <span>WhatsApp ile Paylaş</span>
                </button>

                <button
                  type="button"
                  onClick={handleLinkedInShare}
                  className="w-full px-3 py-2 rounded-xl hover:bg-white/10 text-xs text-left flex items-center gap-2.5 text-neutral-200 hover:text-white transition cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                    <Linkedin size={14} />
                  </div>
                  <span>LinkedIn'de Paylaş</span>
                </button>

                <button
                  type="button"
                  onClick={handleEmailShare}
                  className="w-full px-3 py-2 rounded-xl hover:bg-white/10 text-xs text-left flex items-center gap-2.5 text-neutral-200 hover:text-white transition cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Mail size={14} />
                  </div>
                  <span>E-posta ile Gönder</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className={`w-full px-3 py-2 rounded-xl text-xs text-left flex items-center gap-2.5 transition cursor-pointer ${
                    copied
                      ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                      : 'hover:bg-white/10 text-neutral-200 hover:text-white'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                      copied ? 'bg-emerald-500 text-neutral-950' : 'bg-white/10 text-neutral-300'
                    }`}
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                  </div>
                  <span>{copied ? 'Kopyalandı! ✓' : 'Bağlantıyı Kopyala'}</span>
                </button>
              </div>
            )}
          </div>

          {/* PDF Download / Print */}
          <button
            type="button"
            onClick={handlePrint}
            disabled={isPrinting}
            className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-neutral-950 text-xs font-bold flex items-center gap-1.5 shadow-md transition cursor-pointer"
          >
            {isPrinting ? <Loader2 size={15} className="animate-spin" /> : <Printer size={15} />}
            <span>{isPrinting ? 'PDF Hazırlanıyor...' : 'PDF İndir / Yazdır'}</span>
          </button>
        </div>
      </header>

      {/* Collapsible Table of Contents Navigation Drawer */}
      {showTocDrawer && (
        <div className="bg-neutral-950/95 border-b border-white/10 px-4 md:px-8 py-5 no-print animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="max-w-5xl mx-auto space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen size={16} className="text-amber-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Katalog İçindekiler & Bölümler
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTocDrawer(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {/* Section 1: Cover */}
              <button
                type="button"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  setShowTocDrawer(false);
                }}
                className="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition group cursor-pointer"
              >
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block mb-1">
                  Bölüm 01
                </span>
                <p className="text-xs font-bold text-white group-hover:text-amber-300 transition">
                  Katalog Kapağı & Sunum
                </p>
                <p className="text-[11px] text-neutral-400 mt-0.5">{catalog.title}</p>
              </button>

              {/* Section 2: Products */}
              <button
                type="button"
                onClick={() => {
                  setShowProductDrawer(true);
                  setShowTocDrawer(false);
                }}
                className="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition group cursor-pointer"
              >
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block mb-1">
                  Bölüm 02
                </span>
                <p className="text-xs font-bold text-white group-hover:text-amber-300 transition">
                  Seramik Ürün Koleksiyonu
                </p>
                <p className="text-[11px] text-neutral-400 mt-0.5">{products.length} Seçili Model</p>
              </button>

              {/* Section 3: Surface Finishes / Categories */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-left">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block mb-1">
                  Yüzey Seçenekleri
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {availableFinishes.length > 0 ? (
                    availableFinishes.map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => {
                          setSearchQuery(f);
                          setShowProductDrawer(true);
                          setShowTocDrawer(false);
                        }}
                        className="px-2 py-0.5 rounded-md bg-white/10 hover:bg-amber-500/20 text-neutral-300 hover:text-amber-300 text-[10px] font-medium transition cursor-pointer"
                      >
                        {f}
                      </button>
                    ))
                  ) : (
                    <span className="text-[11px] text-neutral-400">Tüm yüzeyler</span>
                  )}
                </div>
              </div>

              {/* Section 4: Lead Generator Quick Jump */}
              <button
                type="button"
                onClick={() => {
                  setShowTocDrawer(false);
                  setLeadType('quote');
                  setLeadSubmitted(false);
                  setShowLeadModal(true);
                }}
                className="p-3.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-left transition group cursor-pointer"
              >
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block mb-1">
                  B2B Hızlı İşlem
                </span>
                <p className="text-xs font-bold text-amber-300 group-hover:text-amber-200 transition">
                  Fiyat & Numune Masası
                </p>
                <p className="text-[11px] text-neutral-400 mt-0.5">Doğrudan teklif oluşturun &rarr;</p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Collapsible Product Search & Direct Navigation Drawer */}
      {showProductDrawer && (
        <div className="bg-neutral-950 border-b border-white/10 px-4 md:px-8 py-5 no-print animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="max-w-5xl mx-auto space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Katalog içindeki seramikleri ad, ebat veya renge göre filtrele..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/10 border border-white/15 text-xs text-white placeholder-neutral-400 focus:outline-none focus:border-amber-400"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowProductDrawer(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-64 overflow-y-auto pr-1">
              {filteredProducts.map((p) => (
                <div
                  key={p.id}
                  className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-amber-500/50 flex items-center justify-between gap-3 transition"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={p.imageUrl || p.textureUrl || '/placeholder.png'}
                      alt={p.name}
                      className="w-11 h-11 rounded-lg object-cover border border-white/10 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{p.name}</p>
                      <p className="text-[10px] text-neutral-400 font-mono">
                        {p.width && p.height ? `${p.width}x${p.height} cm` : p.finish || ''}
                      </p>
                    </div>
                  </div>

                  {p.slug && (
                    <div className="flex flex-col gap-1.5 flex-shrink-0">
                      <Link
                        href={`/urun/${p.slug}`}
                        className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-[10px] flex items-center justify-center gap-1"
                      >
                        <span>Detay</span>
                        <ExternalLink size={10} />
                      </Link>
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/mekan-dene?product=${p.slug}`}
                          className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-amber-300 text-[9px] font-semibold text-center whitespace-nowrap"
                        >
                          Mekânda Gör
                        </Link>
                        <Link
                          href={`/urun/${p.slug}?studio=3d`}
                          className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[9px] font-bold text-center whitespace-nowrap border border-amber-500/30"
                        >
                          3D Studio
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Lookbook Container */}
      <main className="flex-1 p-4 md:p-8 flex justify-center overflow-x-hidden">
        <div className="w-full max-w-5xl">
          <CatalogTemplateRenderer catalog={catalog} products={products} mode="preview" />
        </div>
      </main>

      {/* B2B Lead Generation Floating Panel (Bottom-Right) */}
      <div className="fixed bottom-6 right-6 z-40 no-print flex flex-col items-end" ref={leadPanelRef}>
        {/* Expandable Action Card */}
        {showLeadPanel && (
          <div className="mb-3 w-80 rounded-2xl bg-neutral-950/95 backdrop-blur-md border border-amber-500/30 shadow-2xl p-4 text-white space-y-3.5 animate-in fade-in slide-in-from-bottom-3 duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Sparkles size={15} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">B2B Proje Masası</h4>
                  <p className="text-[10px] text-amber-400/90 font-medium">Hızlı Kurumsal Servis</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowLeadPanel(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition"
              >
                <X size={14} />
              </button>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              Mimari projeler, bayi ve toptan alımlarınız için doğrudan marka temsilcisinden özel fiyat veya fiziksel numune talep edin.
            </p>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setLeadType('quote');
                  setLeadSubmitted(false);
                  setShowLeadModal(true);
                  setShowLeadPanel(false);
                }}
                className="w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer"
              >
                <FileText size={15} />
                <span>Fiyat Teklifi İste</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setLeadType('sample');
                  setLeadSubmitted(false);
                  setShowLeadModal(true);
                  setShowLeadPanel(false);
                }}
                className="w-full py-2.5 px-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs flex items-center justify-center gap-2 border border-white/10 transition cursor-pointer"
              >
                <Package size={15} className="text-amber-400" />
                <span>Numune Talep Et</span>
              </button>
            </div>
          </div>
        )}

        {/* Floating Action Trigger Button with gentle pulse */}
        <button
          type="button"
          onClick={() => setShowLeadPanel(!showLeadPanel)}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-xs shadow-2xl shadow-amber-500/30 hover:shadow-amber-500/50 transition-all duration-300 hover:scale-105 cursor-pointer ring-2 ring-amber-400/50"
          aria-label="B2B Fiyat Teklifi ve Numune Talebi"
        >
          {/* Gentle Pulse Dot */}
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neutral-950 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-neutral-950"></span>
          </span>

          <Sparkles size={16} className="text-neutral-950" />
          <span className="tracking-wide">B2B Fiyat & Numune</span>
        </button>
      </div>

      {/* Scroll to Top Floating Button (Bottom-Left) */}
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-6 left-6 z-40 no-print w-11 h-11 rounded-full bg-neutral-950/90 hover:bg-neutral-900 text-amber-400 border border-amber-500/30 hover:border-amber-400 shadow-xl backdrop-blur-md flex items-center justify-center transition-all duration-300 hover:scale-110 cursor-pointer group ${
          showScrollTop ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        aria-label="Sayfanın Başına Dön"
        title="Sayfanın Başına Dön"
      >
        <ChevronUp size={20} className="group-hover:-translate-y-0.5 transition-transform" />
      </button>

      {/* B2B Lead Generation Contact Form Modal */}
      {showLeadModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto no-print">
          <div className="bg-neutral-950 border border-white/15 text-white rounded-3xl max-w-xl w-full p-6 md:p-8 space-y-6 shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 mb-2">
                  <Sparkles size={11} />
                  <span>
                    {leadType === 'sample' ? 'Mimari Numune Hizmeti' : 'Kurumsal B2B Fiyat Teklifi'}
                  </span>
                </div>
                <h3 className="text-lg md:text-xl font-extrabold text-white">
                  {leadType === 'sample' ? 'Seramik Numune Talebi' : 'Fiyat Teklifi Talebi'}
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  <strong>{catalog.title}</strong> kataloğundaki ürünler için teklif oluşturun.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowLeadModal(false)}
                className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition"
              >
                <X size={18} />
              </button>
            </div>

            {leadSubmitted ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                  <CheckCircle2 size={36} />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">Talebiniz Başarıyla Hazırlandı!</h4>
                  <p className="text-xs text-neutral-400 max-w-md mx-auto mt-1 leading-relaxed">
                    E-posta istemciniz otomatik olarak açıldı. Talebiniz temsilcimize iletilmek üzere hazırlandı.
                  </p>
                </div>
                <div className="pt-2 flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setLeadSubmitted(false)}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition cursor-pointer"
                  >
                    Yeni Talep Oluştur
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowLeadModal(false)}
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition cursor-pointer"
                  >
                    Kapat
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleLeadSubmit} className="space-y-4">
                {/* Switch between Quote & Sample */}
                <div className="grid grid-cols-2 p-1 rounded-xl bg-white/5 border border-white/10">
                  <button
                    type="button"
                    onClick={() => setLeadType('quote')}
                    className={`py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                      leadType === 'quote'
                        ? 'bg-amber-500 text-neutral-950 shadow-md'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Fiyat Teklifi İste
                  </button>
                  <button
                    type="button"
                    onClick={() => setLeadType('sample')}
                    className={`py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                      leadType === 'sample'
                        ? 'bg-amber-500 text-neutral-950 shadow-md'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Numune Talep Et
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-[11px] font-semibold text-neutral-300 mb-1.5 flex items-center gap-1.5">
                      <User size={13} className="text-amber-400" />
                      <span>Ad Soyad *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={leadForm.name}
                      onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                      placeholder="Örn: Selin Yılmaz"
                      className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/15 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-neutral-300 mb-1.5 flex items-center gap-1.5">
                      <Building2 size={13} className="text-amber-400" />
                      <span>Firma Adı</span>
                    </label>
                    <input
                      type="text"
                      value={leadForm.company}
                      onChange={(e) => setLeadForm({ ...leadForm, company: e.target.value })}
                      placeholder="Örn: Yılmaz Mimarlık A.Ş."
                      className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/15 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-[11px] font-semibold text-neutral-300 mb-1.5 flex items-center gap-1.5">
                      <Mail size={13} className="text-amber-400" />
                      <span>E-posta Adresi *</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={leadForm.email}
                      onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                      placeholder="selin@mimarlik.com"
                      className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/15 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-neutral-300 mb-1.5 flex items-center gap-1.5">
                      <Phone size={13} className="text-amber-400" />
                      <span>Telefon *</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={leadForm.phone}
                      onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                      placeholder="05XX XXX XX XX"
                      className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/15 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* İlgilenilen Ürünler (Auto-filled Tags) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-semibold text-neutral-300 flex items-center gap-1.5">
                      <Tag size={13} className="text-amber-400" />
                      <span>İlgilenilen Ürünler ({selectedProducts.length} Seçili)</span>
                    </label>
                    {products.length > 0 && (
                      <div className="flex items-center gap-2 text-[10px]">
                        <button
                          type="button"
                          onClick={selectAllProducts}
                          className="text-amber-400 hover:underline cursor-pointer"
                        >
                          Tümünü Seç
                        </button>
                        <span className="text-neutral-600">&bull;</span>
                        <button
                          type="button"
                          onClick={clearAllProducts}
                          className="text-neutral-400 hover:underline cursor-pointer"
                        >
                          Temizle
                        </button>
                      </div>
                    )}
                  </div>

                  {products.length > 0 ? (
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/15 max-h-36 overflow-y-auto flex flex-wrap gap-1.5">
                      {products.map((p) => {
                        const pName = p.name || p.sku || `Ürün #${p.id}`;
                        const isSelected = selectedProducts.includes(pName);
                        return (
                          <button
                            key={p.id || pName}
                            type="button"
                            onClick={() => toggleProductSelection(pName)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition cursor-pointer ${
                              isSelected
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-white/5 text-neutral-400 border border-white/10 hover:text-white'
                            }`}
                          >
                            <span>{pName}</span>
                            {isSelected ? (
                              <Check size={11} className="text-amber-400" />
                            ) : (
                              <span className="text-neutral-600">+</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <input
                      type="text"
                      placeholder="Örn: 60x120 Mermer Serisi, Mat Yüzey..."
                      className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/15 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                    />
                  )}
                  <p className="text-[10px] text-neutral-500 mt-1">
                    İlgilendiğiniz seramik ürünlerini etiketlere tıklayarak belirleyebilirsiniz.
                  </p>
                </div>

                {/* Mesaj */}
                <div>
                  <label className="text-[11px] font-semibold text-neutral-300 mb-1.5 flex items-center gap-1.5">
                    <FileText size={13} className="text-amber-400" />
                    <span>Proje Notları & Mesaj</span>
                  </label>
                  <textarea
                    rows={3}
                    value={leadForm.message}
                    onChange={(e) => setLeadForm({ ...leadForm, message: e.target.value })}
                    placeholder={
                      leadType === 'sample'
                        ? 'Numune kiti için teslimat adresi veya özel yüzey beklentilerinizi yazınız...'
                        : 'Tahmini metraj (m²), proje lokasyonu, uygulama alanı ve termin planınız...'
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/15 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 transition cursor-pointer"
                >
                  <Send size={15} />
                  <span>
                    {leadType === 'sample' ? 'Numune Talebini Gönder' : 'Teklif Talebini Gönder'}
                  </span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* QR Code Share Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 no-print">
          <div className="bg-white text-neutral-900 rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <span className="text-sm font-extrabold">Web Kataloğu QR Kodu</span>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="text-neutral-400 hover:text-neutral-800"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 inline-block mx-auto">
              {products[0]?.qrCodeUrl ? (
                <img src={products[0].qrCodeUrl} alt="QR Code" className="w-40 h-40 mx-auto" />
              ) : (
                <QrCode size={140} className="text-neutral-900 mx-auto" />
              )}
            </div>
            <p className="text-xs text-neutral-500">
              Mobil cihazınızın kamerasıyla okutarak <strong>{catalog.title}</strong> kataloğuna anında
              erişebilirsiniz.
            </p>
            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded-xl bg-neutral-900 text-white text-xs font-bold"
            >
              Tamam
            </button>
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
                  <Linkedin size={16} />
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

          {/* Bottom Branding Bar */}
          <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
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
