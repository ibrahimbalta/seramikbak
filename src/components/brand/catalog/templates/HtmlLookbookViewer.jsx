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
  SlidersHorizontal,
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
  Download,
  Phone,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Heart,
  Store,
  Globe,
  Menu
} from 'lucide-react';
import { prepareAndPrintCatalog } from '@/utils/printCatalog';
import {
  LOOKBOOK_COLOR_TEMPLATES,
  getLookbookTheme
} from './lookbookThemes';
import './showroom-catalog.css';

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
  const brandName = brand.name || catalog?.brandName || 'Seramik Markası';
  const brandLogo = catalog?.customLogoUrl || brand.logoUrl;
  const brandPhone = catalog?.sectionSettings?.contactPhone || brand.phone || catalog?.phone || '';
  const brandEmail = catalog?.sectionSettings?.contactEmail || brand.email || catalog?.email || '';
  const brandAddress = catalog?.sectionSettings?.contactAddress || brand.address || catalog?.address || '';
  const brandWebsite = catalog?.sectionSettings?.websiteUrl || brand.website || catalog?.website || '';

  const sec = catalog?.sectionSettings || {};

  // Active color/layout template
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

  // Real-time Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSize, setSelectedSize] = useState('all');
  const [selectedSurface, setSelectedSurface] = useState('all');
  const [sortBy, setSortBy] = useState('featured'); // 'featured' | 'name-asc' | 'price-asc' | 'price-desc'
  const [showMobileFilterModal, setShowMobileFilterModal] = useState(false);
  const searchInputRef = useRef(null);

  // Favorites state
  const [favorites, setFavorites] = useState({});

  // Toast notification state
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const toastTimeoutRef = useRef(null);

  // Quote Cart Drawer State (Showroom Ergonomics)
  const [quoteCart, setQuoteCart] = useState([]);
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [cartSubmitting, setCartSubmitting] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);
  const [cartError, setCartError] = useState('');
  const [quoteForm, setQuoteForm] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
    city: '',
    message: ''
  });

  // Detail Modal state (4K inspection)
  const [activeDetailProduct, setActiveDetailProduct] = useState(null);

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
  const shareTitle = `${brandName} — ${catalog?.title || 'Dijital Mimari Katalog'}`;

  const notify = (msg) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    setShowToast(true);
    toastTimeoutRef.current = setTimeout(() => {
      setShowToast(false);
    }, 3200);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      notify('Katalog bağlantısı panoya kopyalandı! ✓');
      setTimeout(() => setCopied(false), 2400);
    } catch {
      notify('Bağlantı kopyalanamadı.');
    }
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `Merhaba, ${shareTitle} incelemeniz için paylaşıyorum:\n${currentUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
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
      await prepareAndPrintCatalog({ stageId: 'seramikbak-showroom-catalog-root' });
    } finally {
      setIsPrinting(false);
    }
  };

  const handleToggleFavorite = (p, e) => {
    if (e) e.stopPropagation();
    const key = p.id || p.code || p.name;
    const nextState = !favorites[key];
    setFavorites((prev) => ({ ...prev, [key]: nextState }));
    notify(nextState ? `"${p.name}" favorilere eklendi.` : `"${p.name}" favorilerden çıkarıldı.`);
  };

  // Add product to quote cart
  const handleAddToQuoteCart = (product, e) => {
    if (e) e.stopPropagation();
    if (!product) return;
    const key = product.id || product.code || product.name;
    const exists = quoteCart.find((item) => (item.id || item.code || item.name) === key);

    if (exists) {
      notify(`"${product.name}" zaten teklif listenizde.`);
      setShowCartDrawer(true);
      return;
    }

    const newItem = {
      id: key,
      name: product.name || 'Seramik Karo',
      code: product.code || '',
      imageUrl: product.imageUrl || product.textureUrl || '/renders/luxury_bathroom_calacatta_gold.jpg',
      dimensionText: product.width && product.height ? `${product.width}x${product.height} cm` : (product.size || 'Standart'),
      finishText: product.finish || product.surface || 'Porselen',
      displayPrice: product.displayPrice || product.price || null,
      m2: 25 // default sensible quantity
    };

    setQuoteCart((prev) => [...prev, newItem]);
    notify(`"${product.name}" teklif listenize eklendi! ✓`);
  };

  const handleRemoveFromCart = (key) => {
    setQuoteCart((prev) => prev.filter((item) => item.id !== key));
  };

  const handleUpdateCartM2 = (key, val) => {
    const num = Math.max(1, parseInt(val, 10) || 1);
    setQuoteCart((prev) =>
      prev.map((item) => (item.id === key ? { ...item, m2: num } : item))
    );
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

  // Submit consolidated quote cart
  const handleCartSubmit = async (e) => {
    e.preventDefault();
    if (!quoteForm.name || !quoteForm.phone) {
      setCartError('Lütfen ad soyad ve telefon numaranızı girin.');
      return;
    }

    setCartSubmitting(true);
    setCartError('');

    try {
      const effectiveSlug =
        catalog?.publicSlug ||
        catalog?.slug ||
        (typeof window !== 'undefined'
          ? window.location.pathname.split('/katalog/')[1]?.split('/')[0]?.split('#')[0]?.split('?')[0]
          : '');

      const productsSummary = quoteCart.map(
        (i) => `${i.name} (Kod: ${i.code || '-'}, Ölçü: ${i.dimensionText}, Miktar: ${i.m2} m²)`
      );

      const payload = {
        catalogId: catalog?.id,
        catalogSlug: effectiveSlug,
        brandId: catalog?.brandId || catalog?.brand?.id,
        leadType: 'quote',
        name: quoteForm.name.trim(),
        company: (quoteForm.company || '').trim(),
        email: (quoteForm.email || '').trim(),
        phone: quoteForm.phone.trim(),
        selectedProducts: productsSummary,
        message: `[Şehir: ${quoteForm.city || 'Belirtilmedi'}] ${quoteForm.message || ''}`.trim()
      };

      const res = await fetch('/api/brand/catalogs/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCartSuccess(true);
        notify(data.message || 'Teklif talebiniz üretici marka masasına iletildi!');
      } else {
        setCartError(data.error || 'Talep iletilemedi. Lütfen tekrar deneyin.');
      }
    } catch (err) {
      setCartError('Bağlantı hatası: ' + err.message);
    } finally {
      setCartSubmitting(false);
    }
  };

  // Categories extraction & counts
  const categoryCounts = useMemo(() => {
    const counts = { all: products.length };
    products.forEach((p) => {
      const cat = p.categoryName || p.category || (p.type === 'porcelain' ? 'Porselen' : 'Seramik');
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [products]);

  // Dimension extraction & counts
  const dimensionCounts = useMemo(() => {
    const counts = { all: products.length };
    products.forEach((p) => {
      let dim = 'Standart';
      if (p.width && p.height) {
        dim = `${p.width}x${p.height}`;
      } else if (p.size) {
        dim = p.size.replace(/\s+/g, '');
      }
      counts[dim] = (counts[dim] || 0) + 1;
    });
    return counts;
  }, [products]);

  // Finish extraction & counts
  const finishCounts = useMemo(() => {
    const counts = { all: products.length };
    products.forEach((p) => {
      const f = (p.finish || p.surface || '').toLowerCase();
      let key = 'Diğer';
      if (f.includes('parlak') || f.includes('polish')) key = 'Parlak';
      else if (f.includes('mat')) key = 'Mat';
      else if (f.includes('lapato') || f.includes('lappato')) key = 'Full Lappato';
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [products]);

  // Filter & Sort Products
  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLocaleLowerCase('tr').trim();
    let result = products.filter((p) => {
      const name = (p.name || '').toLocaleLowerCase('tr');
      const code = (p.code || '').toLocaleLowerCase('tr');
      const cat = (p.categoryName || p.category || '').toLocaleLowerCase('tr');
      const matchesSearch = !q || name.includes(q) || code.includes(q) || cat.includes(q);

      let matchesCategory = true;
      if (selectedCategory !== 'all') {
        const itemCat = p.categoryName || p.category || (p.type === 'porcelain' ? 'Porselen' : 'Seramik');
        matchesCategory = itemCat.toLowerCase() === selectedCategory.toLowerCase();
      }

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
          matchesSurface = finish.includes('parlak') || finish.includes('polish');
        } else if (selectedSurface === 'mat') {
          matchesSurface = finish.includes('mat');
        }
      }

      return matchesSearch && matchesCategory && matchesSize && matchesSurface;
    });

    if (sortBy === 'price-asc') {
      result.sort((a, b) => (Number(a.displayPrice || a.price || 0) - Number(b.displayPrice || b.price || 0)));
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => (Number(b.displayPrice || b.price || 0) - Number(a.displayPrice || a.price || 0)));
    } else if (sortBy === 'name-asc') {
      result.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'tr'));
    }

    return result;
  }, [products, searchQuery, selectedCategory, selectedSize, selectedSurface, sortBy]);

  // Standout Featured items (first 8 or marked as featured)
  const featuredShowcaseProducts = useMemo(() => {
    const marked = products.filter((p) => p.isFeatured || p.featured);
    if (marked.length > 0) return marked.slice(0, 8);
    return products.slice(0, Math.min(8, products.length));
  }, [products]);

  const hasActiveFilters = selectedCategory !== 'all' || selectedSize !== 'all' || selectedSurface !== 'all' || searchQuery;

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedSize('all');
    setSelectedSurface('all');
    setSearchQuery('');
  };

  const handleFloatingCategoryClick = (catName) => {
    setSelectedCategory(catName);
    document.getElementById('katalog')?.scrollIntoView({ behavior: 'smooth' });
    notify(`"${catName}" kategorisindeki karolar listeleniyor.`);
  };

  const coverImage =
    sec.coverImageUrl ||
    catalog?.customCoverUrl ||
    catalog?.coverImageUrl ||
    currentTheme.previewImg ||
    (products.length > 0 && (products[0].imageUrl || products[0].textureUrl)) ||
    '/renders/luxury_bathroom_calacatta_gold.jpg';

  const year = sec.heroYear || new Date().getFullYear();
  const layoutType = currentTheme?.layoutType || 'editorial-asymmetric';

  // ---------------------------------------------------------------------------
  // 6 BESPOKE ARCHITECTURAL HERO LAYOUT RENDERERS
  // ---------------------------------------------------------------------------
  const renderBespokeHero = () => {
    switch (layoutType) {
      case 'cinema-fullwidth':
        return (
          <section id="koleksiyon" className="flagship-showroom-hero hero-layout-cinema-fullwidth">
            <div className="flagship-hero-bg-wrapper">
              <img
                src={coverImage}
                alt={catalog?.title || 'Kapak'}
                className="flagship-hero-bg-img"
                style={{ opacity: 0.22, filter: 'brightness(0.7) contrast(1.2)' }}
              />
              <div className="flagship-hero-gradient-overlay" />
            </div>

            <div className="flagship-hero-inner">
              <div className="cinema-top-pill">
                <Sparkles size={13} className="text-[#fae29c]" />
                <span>{sec.heroBadgeText || `${brandName.toUpperCase()} MONOLITHIC SLABS // CERSAIE ED.`}</span>
                <Sparkles size={13} className="text-[#fae29c]" />
              </div>

              <h1 className="cinema-hero-h1">
                {catalog?.title ? (
                  <>
                    {catalog.title} <span className="cinema-gold-glow">MONOLITHIC SLABS</span>
                  </>
                ) : (
                  <>
                    Işığın ve Gölgenin <br />
                    <span className="cinema-gold-glow">Monolitik Dansı</span>
                  </>
                )}
              </h1>

              <p className="cinema-hero-desc">
                {catalog?.introText ||
                  catalog?.description ||
                  'Büyük ebat porselen plakalarla mekânlarınıza derzsiz heykelsi bir kimlik, mimari derinlik ve monolitik asalet kazandırıyoruz.'}
              </p>

              {/* Central Monolithic Slab Showcase Stage */}
              <div className="cinema-slab-stage">
                <div className="cinema-slab-img-wrap">
                  <img src={coverImage} alt="Monolithic Slab" className="cinema-slab-img" />
                  <div className="cinema-slab-overlay-dim">
                    <span>SLAB SPEC: 160×320 CM // BLa PORCELAIN</span>
                  </div>
                </div>

                <div className="cinema-slab-metrics-grid">
                  <div className="cinema-metric-box">
                    <span className="cinema-metric-val">160×320</span>
                    <span className="cinema-metric-label">Dev Ebat Slab</span>
                  </div>
                  <div className="cinema-metric-box">
                    <span className="cinema-metric-val">MOHS 9</span>
                    <span className="cinema-metric-label">Elmas Sertlik</span>
                  </div>
                  <div className="cinema-metric-box">
                    <span className="cinema-metric-val">&lt; 0.05%</span>
                    <span className="cinema-metric-label">Su Emme Oranı</span>
                  </div>
                  <div className="cinema-metric-box">
                    <span className="cinema-metric-val">1200°C</span>
                    <span className="cinema-metric-label">Sinterlenmiş Gövde</span>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flagship-cta-row justify-center">
                <button
                  type="button"
                  onClick={() => {
                    document.getElementById('katalog')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flagship-btn-primary"
                  style={{
                    background: 'linear-gradient(135deg, #fae29c 0%, #c5a059 100%)',
                    color: '#07090e',
                    fontWeight: 700,
                    boxShadow: '0 10px 30px rgba(197, 160, 89, 0.4)'
                  }}
                >
                  <span>Monolitik Kataloğu Keşfet</span>
                  <ArrowRight size={16} />
                </button>

                <button
                  type="button"
                  onClick={() => setShowCartDrawer(true)}
                  className="flagship-btn-video"
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    borderColor: 'rgba(197, 160, 89, 0.4)',
                    color: '#fae29c'
                  }}
                >
                  <FileText size={15} />
                  <span>{sec.ctaButtonText || 'Teklif & Numune İste'}</span>
                </button>
              </div>
            </div>
          </section>
        );

      case 'swiss-industrial':
        return (
          <section id="koleksiyon" className="flagship-showroom-hero hero-layout-swiss-industrial">
            <div className="swiss-blueprint-header">
              <div className="swiss-header-tag">
                <span>NORM:</span> <span className="val">DIN EN 14411 (BLa)</span>
              </div>
              <div className="swiss-header-tag">
                <span>SCALE:</span> <span className="val">1:20 RECTIFIED</span>
              </div>
              <div className="swiss-header-tag">
                <span>GRID:</span> <span className="val">BAUHAUS MODULAR</span>
              </div>
              <div className="swiss-header-tag">
                <span>CALIBER:</span> <span className="val">0.0 MM JOINTS</span>
              </div>
            </div>

            <div className="flagship-hero-inner">
              <div className="swiss-content-pane">
                <div className="swiss-corner-mark swiss-corner-tl" />
                <div className="swiss-corner-mark swiss-corner-tr" />
                <div className="swiss-corner-mark swiss-corner-bl" />
                <div className="swiss-corner-mark swiss-corner-br" />

                <span className="swiss-code-index">
                  {sec.heroBadgeText || `[INDEX: ${brandName.toUpperCase()} // BRUTALIST LOFT SPEC. ${year}]`}
                </span>

                <h1 className="swiss-hero-h1">
                  {catalog?.title ? (
                    catalog.title
                  ) : (
                    <>BRÜT BETON &amp; ENDÜSTRİYEL MİMARİ</>
                  )}
                </h1>

                <p className="swiss-hero-desc">
                  {catalog?.introText ||
                    catalog?.description ||
                    'Form işlevi takip eder. Ham çimento, mikrobeton dokuları ve milimetrik rektifiye hassasiyetle modern kentsel yaşam alanları.'}
                </p>

                <div className="swiss-blueprint-dimension-bar">
                  <span>&larr; 1200 mm &rarr;</span>
                  <span>TOLERANS: &plusmn;0.2 mm</span>
                  <span>&uarr; 2800 mm &darr;</span>
                </div>

                <div className="swiss-params-matrix">
                  <div className="swiss-param-cell">
                    <span className="swiss-param-title">YANGIN NORMU</span>
                    <span className="swiss-param-val">A1 Yanmaz</span>
                  </div>
                  <div className="swiss-param-cell">
                    <span className="swiss-param-title">KAYMA DİRENCİ</span>
                    <span className="swiss-param-val">DIN R10 / B</span>
                  </div>
                  <div className="swiss-param-cell">
                    <span className="swiss-param-title">YÜK DAYANIMI</span>
                    <span className="swiss-param-val">&gt; 2200 N</span>
                  </div>
                </div>

                <div className="flagship-cta-row">
                  <button
                    type="button"
                    onClick={() => {
                      document.getElementById('katalog')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="flagship-btn-primary"
                    style={{ borderRadius: 0, fontFamily: 'monospace', textTransform: 'uppercase' }}
                  >
                    <span>Teknik Kataloğu Aç</span>
                    <ArrowRight size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowCartDrawer(true)}
                    className="flagship-btn-video"
                    style={{ borderRadius: 0, fontFamily: 'monospace', textTransform: 'uppercase' }}
                  >
                    <FileText size={15} />
                    <span>{sec.ctaButtonText || 'Şartname & Fiyat Al'}</span>
                  </button>
                </div>
              </div>

              <div className="swiss-visual-pane">
                <span className="swiss-blueprint-crosshair cross-tl">+</span>
                <span className="swiss-blueprint-crosshair cross-tr">+</span>
                <span className="swiss-blueprint-crosshair cross-bl">+</span>
                <span className="swiss-blueprint-crosshair cross-br">+</span>

                <img src={coverImage} alt="Bauhaus Concrete" className="swiss-visual-img" />

                <div className="swiss-bottom-meta-box">
                  <span>SPEC-SERIES // {brandName.toUpperCase()}</span>
                  <span>CALC: 22.4 KG/M&sup2;</span>
                </div>
              </div>
            </div>
          </section>
        );

      case 'organic-wellness':
        return (
          <section id="koleksiyon" className="flagship-showroom-hero hero-layout-organic-wellness">
            <div className="organic-sanctuary-card">
              <div className="organic-content-col">
                <div className="organic-leaf-badge">
                  <Sparkles size={14} />
                  <span>{sec.heroBadgeText || 'BİYOFİLİK YAŞAM & WELLNESS SANCTUARY'}</span>
                </div>

                <h1 className="organic-hero-h1">
                  {catalog?.title ? (
                    catalog.title
                  ) : (
                    <>Doğanın Dingin Ritmini <br />Mekânlarınıza Taşıyın</>
                  )}
                </h1>

                <p className="organic-hero-desc">
                  {catalog?.introText ||
                    catalog?.description ||
                    'Doğal kil mineralleri, dinlendirici yeşil tonları ve yumuşak dokularla evinizi yenileyen spa ve huzur alanları.'}
                </p>

                <div className="organic-eco-chips-row">
                  <span className="organic-eco-chip">🍃 %100 Doğal Kil &amp; Mineral</span>
                  <span className="organic-eco-chip">💧 Su İtici &amp; Anti-Bakteriyel</span>
                  <span className="organic-eco-chip">☀️ Sıfır Kimyasal Salınım</span>
                </div>

                <div className="flagship-cta-row">
                  <button
                    type="button"
                    onClick={() => {
                      document.getElementById('katalog')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="flagship-btn-primary"
                    style={{ borderRadius: '9999px', background: '#4d6b53', color: '#ffffff' }}
                  >
                    <span>Doğal Koleksiyonu Keşfet</span>
                    <ArrowRight size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowCartDrawer(true)}
                    className="flagship-btn-video"
                    style={{ borderRadius: '9999px', background: 'rgba(255, 255, 255, 0.1)', color: '#ffffff' }}
                  >
                    <FileText size={15} />
                    <span>{sec.ctaButtonText || 'Wellness Teklifi İste'}</span>
                  </button>
                </div>
              </div>

              <div className="organic-arched-portal">
                <img src={coverImage} alt="Organic Nature" className="organic-arched-img" />
                <div className="organic-wellness-seal">
                  <span className="seal-badge-text">{brandName}</span>
                  <span className="seal-sub-text">100% Organik Kil Dokusu</span>
                </div>
              </div>
            </div>
          </section>
        );

      case 'mediterranean-book':
        return (
          <section id="koleksiyon" className="flagship-showroom-hero hero-layout-mediterranean-book">
            <div className="mediterranean-book-spread">
              <div className="book-gutter-spine" />

              <div className="mediterranean-left-page">
                <span className="mediterranean-chapter-mark">
                  {sec.heroBadgeText || 'CAPITOLO V // TERRACOTTA & AKDENİZ SEÇKİSİ'}
                </span>

                <h1 className="mediterranean-hero-h1">
                  {catalog?.title ? (
                    catalog.title
                  ) : (
                    <>Pişmiş Toprak &amp; Akdeniz Güneşi</>
                  )}
                </h1>

                <div className="mediterranean-ornament-line">
                  <span className="orn-bar" />
                  <span>✦ ─── ❖ ─── ✦</span>
                  <span className="orn-bar" />
                </div>

                <p className="mediterranean-hero-desc">
                  {catalog?.introText ||
                    catalog?.description ||
                    'Güneşte kurutulmuş toprağın kadim sıcaklığı. El yapımı zanaatkar ruhu ile çağdaş villa mimarisinin sıcak buluşması.'}
                </p>

                <div className="mediterranean-atelier-stamp">
                  <Bookmark size={20} className="text-[#b85d38] flex-shrink-0" />
                  <div className="atelier-stamp-text">
                    <strong>BOTTEGA ARTIGIANA // TOSCANA 1928</strong>
                    <span>Geleneksel fırınlama ve doğal kil zanaatı sertifikalı seçki.</span>
                  </div>
                </div>

                <div className="flagship-cta-row">
                  <button
                    type="button"
                    onClick={() => {
                      document.getElementById('katalog')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="flagship-btn-primary"
                    style={{ background: '#b85d38', borderColor: '#b85d38', color: '#ffffff' }}
                  >
                    <span>Monografiyi Aç</span>
                    <ArrowRight size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowCartDrawer(true)}
                    className="flagship-btn-video"
                    style={{ borderColor: '#b85d38', color: '#b85d38' }}
                  >
                    <FileText size={15} />
                    <span>{sec.ctaButtonText || 'Numune & Fiyat Talep Et'}</span>
                  </button>
                </div>
              </div>

              <div className="mediterranean-right-page">
                <div className="artisan-tile-matting">
                  <img src={coverImage} alt="Terracotta Artisan" className="artisan-tile-img" />
                  <div className="wax-seal-badge">
                    <span className="wax-seal-top">ATELIER</span>
                    <span className="wax-seal-year">{year}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );

      case 'gallery-minimal':
        return (
          <section id="koleksiyon" className="flagship-showroom-hero hero-layout-gallery-minimal">
            <div className="gallery-curatorial-wrapper">
              <div className="gallery-content-col">
                <span className="gallery-room-index">
                  {sec.heroBadgeText || 'ROOM 06 // BIENNALE ARCHITECTURAL MARBLE SELECTION'}
                </span>

                <h1 className="gallery-hero-h1">
                  {catalog?.title ? (
                    catalog.title
                  ) : (
                    <>Saf Mermer &amp; <br />Heykelsi Monokrom</>
                  )}
                </h1>

                <p className="gallery-hero-desc">
                  {catalog?.introText ||
                    catalog?.description ||
                    'Gereksiz her şeyden arındırılmış saf zarafet. Kusursuz beyaz mermerin heykelsi dokusu, mimari sükûnet ve çağdaş sanat mekânları.'}
                </p>

                <div className="gallery-curatorial-table">
                  <div className="gallery-cur-row">
                    <span className="gallery-cur-label">KÜRATÖR SEÇKİSİ</span>
                    <span className="gallery-cur-val">{brandName} Arşivi</span>
                  </div>
                  <div className="gallery-cur-row">
                    <span className="gallery-cur-label">MALZEME TÜRÜ</span>
                    <span className="gallery-cur-val">Porselen &amp; Sinterlenmiş Taş</span>
                  </div>
                  <div className="gallery-cur-row">
                    <span className="gallery-cur-label">YÜZEY DERİNLİĞİ</span>
                    <span className="gallery-cur-val">Calacatta &amp; Statuario Damar</span>
                  </div>
                </div>

                <div className="flagship-cta-row">
                  <button
                    type="button"
                    onClick={() => {
                      document.getElementById('katalog')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="flagship-btn-primary"
                    style={{ background: '#18181b', color: '#ffffff', borderRadius: 0 }}
                  >
                    <span>Sergiyi Gez</span>
                    <ArrowRight size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowCartDrawer(true)}
                    className="flagship-btn-video"
                    style={{ borderColor: '#18181b', color: '#18181b', borderRadius: 0 }}
                  >
                    <FileText size={15} />
                    <span>{sec.ctaButtonText || 'Küratör Teklifi Al'}</span>
                  </button>
                </div>
              </div>

              <div className="gallery-art-frame">
                <img src={coverImage} alt="White Marble" className="gallery-art-img" />
                <div className="gallery-wall-plaque">
                  <span className="plaque-num">EXHIBIT // NO. 06</span>
                  <h4 className="plaque-title">{catalog?.title || 'Calacatta Pure'}</h4>
                  <p className="plaque-meta">{brandName} &bull; Sinterlenmiş Mermer Levha &bull; {year}</p>
                </div>
              </div>
            </div>
          </section>
        );

      case 'editorial-asymmetric':
      default:
        return (
          <section id="koleksiyon" className="flagship-showroom-hero hero-layout-editorial-asymmetric">
            <div className="flagship-hero-bg-wrapper">
              <img
                src={coverImage}
                alt={catalog?.title || 'Kapak'}
                className="flagship-hero-bg-img"
                style={{ opacity: 0.2 }}
              />
              <div className="flagship-hero-gradient-overlay" />
            </div>

            <div className="flagship-hero-inner">
              <div className="flagship-hero-content-col">
                <div className="editorial-folio-header">
                  <span className="folio-stamp">{currentTheme.folioNumber || 'VOL. 26 // ED. 01'}</span>
                  <span className="folio-subline">
                    {sec.heroBadgeText || `${brandName.toUpperCase()} &bull; MİLANO EDİTORYAL SEÇKİSİ`}
                  </span>
                </div>

                <h1 className="editorial-hero-h1">
                  {catalog?.title ? (
                    <>
                      {catalog.title} <em className="editorial-italic-em">Koleksiyonu</em>
                    </>
                  ) : (
                    <>
                      Doğal Taş &amp; <br />
                      <em className="editorial-italic-em">Traverten Dokuları</em>
                    </>
                  )}
                </h1>

                <p className="editorial-hero-desc">
                  {catalog?.introText ||
                    catalog?.description ||
                    'En seçkin porselen ve seramik karo serileri, mimari projelendirme desteği ve kişiselleştirilmiş 3D mekan deneyimiyle mekanlarınıza değer katıyoruz.'}
                </p>

                <div className="editorial-spec-strip">
                  <div className="editorial-spec-item">
                    <span className="editorial-spec-label">MENŞEİ / FORMAT</span>
                    <span className="editorial-spec-val">İtalyan Seçkisi</span>
                  </div>
                  <div className="editorial-spec-item">
                    <span className="editorial-spec-label">YÜZEY DOKUSU</span>
                    <span className="editorial-spec-val">Honlu &amp; Doğal Mat</span>
                  </div>
                  <div className="editorial-spec-item">
                    <span className="editorial-spec-label">STANDART</span>
                    <span className="editorial-spec-val">EN 14411 BLa</span>
                  </div>
                </div>

                <div className="flagship-cta-row">
                  <button
                    type="button"
                    onClick={() => {
                      document.getElementById('katalog')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="flagship-btn-primary"
                  >
                    <span>Koleksiyonu İncele</span>
                    <ArrowRight size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowCartDrawer(true)}
                    className="flagship-btn-video"
                  >
                    <FileText size={15} />
                    <span>{sec.ctaButtonText || 'Teklif & Numune İste'}</span>
                  </button>
                </div>
              </div>

              <div className="editorial-hero-visual-col">
                <div className="editorial-mag-frame">
                  <img src={coverImage} alt="Magazine Cut" className="editorial-mag-img" />
                  <div className="editorial-brass-seal">
                    <span className="brass-seal-top">CERTIFICATO</span>
                    <span className="brass-seal-sub">{brandName} &bull; Orijinal Taş</span>
                  </div>
                </div>

                <div className="editorial-floating-swatch">
                  <img src={coverImage} alt="Swatch" className="swatch-thumb" />
                  <div className="swatch-info">
                    <span className="swatch-label">{brandName} SEÇKİSİ</span>
                    <span className="swatch-name">{catalog?.title || 'Travertino Navona'}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
    }
  };

  return (
    <div
      id="seramikbak-showroom-catalog-root"
      className={`corporate-showroom-page layout-${layoutType}`}
      style={currentTheme.vars}
    >
      {/* Toast Notification */}
      {showToast && (
        <div className="showroom-toast-banner">
          <CheckCircle2 size={18} className="toast-icon" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* =========================================================================
          TOPLINE BAR
      ========================================================================= */}
      <div className="showroom-topline-bar">
        <span>
          <strong>{brandName.toUpperCase()}</strong> <span style={{ padding: '0 8px' }}>/</span> RESMİ DİJİTAL MİMARİ KATALOG
        </span>
        <strong>ÜRÜNÜ KEŞFET · 3D MEKÂNINDA DENE · HIZLI TEKLİF AL</strong>
      </div>

      {/* =========================================================================
          STICKY SHOWROOM HEADER
      ========================================================================= */}
      <header className="showroom-top-header">
        <div className="showroom-header-inner">
          {/* Brand Identity Wrap */}
          <div className="header-dealer-brand">
            {brandLogo ? (
              <div className="header-dealer-logo-wrap">
                <img
                  src={brandLogo}
                  alt={brandName}
                  className="header-dealer-main-logo"
                />
              </div>
            ) : (
              <div className="header-dealer-avatar-fallback">
                {brandName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="header-dealer-brand-text">
              <span className="header-dealer-main-name">{brandName}</span>
              <span className="header-dealer-badge-text">
                {currentTheme.badge || 'DİJİTAL KATALOG'}
              </span>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="header-nav-menu">
            <a href="#koleksiyon" className="header-nav-link">Koleksiyon</a>
            <a href="#kategoriler" className="header-nav-link">Kategoriler</a>
            {featuredShowcaseProducts.length > 0 && (
              <a href="#öne-çıkanlar" className="header-nav-link">Öne Çıkanlar</a>
            )}
            <a href="#katalog" className="header-nav-link">Katalog ({products.length})</a>
            {sec.showMonograph !== false && (
              <a href="#standartlar" className="header-nav-link">Standartlar</a>
            )}
            {sec.showEditorial !== false && (
              <a href="#mekanlar" className="header-nav-link">Mekân İlhamı</a>
            )}
            <a href="#iletisim" className="header-nav-link">İletişim</a>
          </nav>

          {/* Action Buttons */}
          <div className="header-actions-group">
            {brandPhone && (
              <a href={`tel:${brandPhone}`} className="header-phone-link hidden lg:inline-flex" title="Markayı Ara">
                <Phone size={14} />
                <span>{brandPhone}</span>
              </a>
            )}

            {/* Template Switcher Dropdown */}
            <div className="relative" ref={themePickerRef}>
              <button
                type="button"
                onClick={() => setShowThemePicker(!showThemePicker)}
                className="header-icon-action-btn"
                title="Şablon Tasarımı Değiştir"
              >
                <Palette size={16} />
              </button>

              {showThemePicker && (
                <div
                  className="absolute right-0 mt-2 w-72 rounded-xl bg-[var(--paper)] border border-[var(--line)] shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  style={{ backgroundColor: 'var(--paper)', borderColor: 'var(--line)' }}
                >
                  <div className="px-3 py-2 border-b border-[var(--line)] mb-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--site-primary)]">
                      Showroom Şablonunu Seçin
                    </p>
                    <p className="text-[11px] text-[var(--muted)]">
                      Tüm tasarımlar showroom formatına uygun olarak hazırlanmıştır.
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
                          className={`w-full px-3 py-2 rounded-lg text-left flex items-center justify-between text-xs transition cursor-pointer ${
                            isCurrent
                              ? 'bg-[var(--accent-light,#efe5d6)] font-bold text-[var(--ink)]'
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
                          {isCurrent && <Check size={14} style={{ color: 'var(--site-primary)' }} />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Share Menu */}
            <div className="relative" ref={shareMenuRef}>
              <button
                type="button"
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="header-icon-action-btn"
                title="Kataloğu Paylaş"
              >
                <Share2 size={16} />
              </button>

              {showShareMenu && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-xl bg-[var(--paper)] border border-[var(--line)] shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  style={{ backgroundColor: 'var(--paper)', borderColor: 'var(--line)' }}
                >
                  <div className="px-3 py-2 border-b border-[var(--line)] mb-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink)]">
                      Kataloğu Paylaş
                    </p>
                    <p className="text-[10px] text-[var(--muted)] truncate">{catalog?.title || brandName}</p>
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
                    <Mail size={14} style={{ color: 'var(--site-primary)' }} />
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

            {/* Print / Download PDF */}
            <button
              type="button"
              onClick={handlePrint}
              disabled={isPrinting}
              className="header-icon-action-btn hidden sm:flex"
              title="Kataloğu PDF Olarak İndir / Yazdır"
            >
              {isPrinting ? <Loader2 size={16} className="animate-spin" /> : <Printer size={16} />}
            </button>

            {/* Teklif Al Pill Button */}
            <button
              type="button"
              onClick={() => setShowCartDrawer(true)}
              className="header-quote-pill-btn"
              title="Hızlı Fiyat Teklifi İste"
            >
              <FileText size={14} />
              <span>Teklif Al</span>
            </button>

            {/* Cart / Teklif Listem Drawer Button */}
            <button
              type="button"
              onClick={() => setShowCartDrawer(true)}
              className={`header-cart-icon-btn ${quoteCart.length > 0 ? 'has-items' : ''}`}
              title={quoteCart.length > 0 ? `Teklif Listem (${quoteCart.length} karo)` : 'Teklif Listem'}
            >
              <ShoppingBag size={18} />
              {quoteCart.length > 0 && (
                <span className="cart-counter-badge">{quoteCart.length}</span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          BESPOKE ARCHITECTURAL HERO BANNER (6 DISTINCT LAYOUT STRUCTURES)
      ========================================================================= */}
      {renderBespokeHero()}

      {/* =========================================================================
          FLOATING CATEGORIES BAR (OVERLAPPING HERO BOTTOM)
      ========================================================================= */}
      <div className={`flagship-categories-bar-wrapper categories-bar-${layoutType.split('-')[0]}`} id="kategoriler">
        <div className="flagship-categories-card">
          <div
            onClick={() => handleFloatingCategoryClick('Seramik')}
            className={`cat-floating-item ${selectedCategory === 'Seramik' ? 'active' : ''}`}
            role="button"
            tabIndex={0}
          >
            <img src="/textures/calacatta_gold.jpg" alt="Seramik Karo" className="cat-floating-thumb" />
            <div className="cat-floating-text">
              <strong className="cat-floating-main">Seramik</strong>
              <span className="cat-floating-sub">Duvar & Zemin</span>
            </div>
            <ArrowRight size={14} className="cat-floating-arrow" />
          </div>

          <div
            onClick={() => handleFloatingCategoryClick('Porselen')}
            className={`cat-floating-item ${selectedCategory === 'Porselen' ? 'active' : ''}`}
            role="button"
            tabIndex={0}
          >
            <img src="/textures/travertino_classico.jpg" alt="Porselen Seramik" className="cat-floating-thumb" />
            <div className="cat-floating-text">
              <strong className="cat-floating-main">Porselen</strong>
              <span className="cat-floating-sub">Geniş Ebat Slab</span>
            </div>
            <ArrowRight size={14} className="cat-floating-arrow" />
          </div>

          <div
            onClick={() => handleFloatingCategoryClick('Banyo')}
            className={`cat-floating-item ${selectedCategory === 'Banyo' ? 'active' : ''}`}
            role="button"
            tabIndex={0}
          >
            <img src="/hero/luxury_bathroom.png" alt="Banyo & Yaşam" className="cat-floating-thumb" />
            <div className="cat-floating-text">
              <strong className="cat-floating-main">Banyo & Yaşam</strong>
              <span className="cat-floating-sub">Islak Hacim</span>
            </div>
            <ArrowRight size={14} className="cat-floating-arrow" />
          </div>

          <div
            onClick={() => handleFloatingCategoryClick('Dekoratif')}
            className={`cat-floating-item ${selectedCategory === 'Dekoratif' ? 'active' : ''}`}
            role="button"
            tabIndex={0}
          >
            <img src="/textures/natural_oak.jpg" alt="Dekoratif Dokular" className="cat-floating-thumb" />
            <div className="cat-floating-text">
              <strong className="cat-floating-main">Dekoratif</strong>
              <span className="cat-floating-sub">Ahşap & Mermer</span>
            </div>
            <ArrowRight size={14} className="cat-floating-arrow" />
          </div>
        </div>
      </div>

      {/* =========================================================================
          SLOGAN & SCRIPT SUBLINE STRIP
      ========================================================================= */}
      <div className="flagship-slogan-strip">
        <div className="slogan-divider-group">
          <span className="slogan-line" />
          <span className="slogan-caps-text">
            {brandName.toUpperCase()} &bull; MODERN YAŞAM ALANLARI İÇİN MİMARİ YÜZEYLER
          </span>
          <span className="slogan-line" />
        </div>
        <div className="slogan-script-text">
          {sec.monographQuote ? `“${sec.monographQuote.slice(0, 50)}...”` : '“Daha Güzel ve Zamansız Mekanlar...”'}
        </div>
      </div>

      {/* =========================================================================
          FEATURED SHOWCASE SECTION (#öne-çıkanlar)
      ========================================================================= */}
      {featuredShowcaseProducts.length > 0 && (
        <section id="öne-çıkanlar" className="showroom-featured-showcase-section">
          <div className="featured-showcase-header">
            <div className="featured-badge-pill">
              <Sparkles size={12} />
              <span>MİMARİ TEŞHİR SEÇKİSİ</span>
            </div>
            <div className="featured-title-row-flex">
              <div>
                <h2 className="featured-section-title">Öne Çıkan Karolar</h2>
                <p className="featured-section-subtitle">
                  {brandName} koleksiyonunda projeler için en çok tercih edilen geniş ebat ve yüksek dayanımlı seriler.
                </p>
              </div>
              <div className="featured-count-badge">
                <span className="count-num">{featuredShowcaseProducts.length}</span>
                <span className="count-txt">Öne Çıkan Karo</span>
              </div>
            </div>
          </div>

          <div className="catalog-products-grid">
            {featuredShowcaseProducts.map((p, idx) => {
              const key = p.id || p.code || p.name || idx;
              const isFav = !!favorites[key];
              const pImage = p.imageUrl || p.textureUrl || '/renders/luxury_bathroom_calacatta_gold.jpg';
              const dimension = p.width && p.height ? `${p.width}x${p.height} cm` : (p.size || 'Standart Ebat');
              const finish = p.finish || p.surface || 'Porselen';

              return (
                <div key={`featured-${key}`} className={`catalog-product-card showroom-luxury-card layout-card-${layoutType}`}>
                  <div className="product-card-media">
                    <div className="card-top-badges">
                      <span className="badge-featured">
                        <Sparkles size={10} />
                        <span>Seçki</span>
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleToggleFavorite(p, e)}
                      className="card-fav-btn"
                      title={isFav ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
                    >
                      <Heart size={15} fill={isFav ? '#e11d48' : 'none'} stroke={isFav ? '#e11d48' : '#64748b'} />
                    </button>

                    <img
                      src={pImage}
                      alt={p.name}
                      className="product-card-img"
                      loading="lazy"
                    />
                  </div>

                  <div className="product-card-body">
                    <div className="product-meta-sub">
                      <span className="product-category-text">{p.categoryName || 'Porselen'}</span>
                      <span className="product-dim-text">{dimension}</span>
                    </div>

                    <h3 className="product-card-name" title={p.name}>
                      {p.name}
                    </h3>

                    <div className="product-chips-row">
                      <span className="spec-chip">{finish}</span>
                      <span className="spec-chip">1. Kalite</span>
                    </div>

                    <div className="product-price-row">
                      {p.displayPrice || p.price ? (
                        <div className="price-box">
                          <span className="price-currency">₺</span>
                          <span className="price-val">{Number(p.displayPrice || p.price).toLocaleString('tr-TR')}</span>
                          <span className="price-unit">/m²</span>
                        </div>
                      ) : (
                        <span className="price-ask">Fiyat Teklifi Alınız</span>
                      )}
                    </div>

                    <div className="product-card-actions">
                      <Link
                        href={`/?tab=studio&product=${encodeURIComponent(p.slug || p.code || p.name || p.id)}#studio`}
                        onClick={(e) => handleOpen3DStudio(p, e)}
                        className="card-action-btn-3d"
                        title="3D Mekânda Canlı Gör"
                      >
                        <Box size={13} />
                        <span>3D Gör</span>
                      </Link>

                      <button
                        type="button"
                        onClick={(e) => handleAddToQuoteCart(p, e)}
                        className="card-action-btn-quote"
                        title="Teklif Listeme Ekle"
                      >
                        <Plus size={13} />
                        <span>Teklif Al</span>
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
          MAIN DIGITAL CATALOG SECTION (#katalog)
      ========================================================================= */}
      <section id="katalog" className="showroom-catalog-section">
        <div className="catalog-layout-container">
          {/* MOBILE APP-LIKE CONTROLS */}
          <div className="mobile-app-catalog-controls">
            <div className="mobile-catalog-header-title">
              <span className="mobile-catalog-badge">DİJİTAL MİMARİ KATALOG</span>
              <h2 className="mobile-catalog-main-title">{catalog?.title || 'Katalog Ürünleri'}</h2>
              <p className="mobile-catalog-sub-text">Tüm seramik ve porselen serileri ({products.length} model)</p>
            </div>

            {/* Mobile Search Box */}
            <div className="mobile-search-box">
              <Search size={16} className="search-input-icon" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Model, kod veya renk ara..."
                className="mobile-search-input"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="search-clear-btn">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Horizontal Category Scroll Bar */}
            <div className="mobile-category-scroll-bar">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`mobile-cat-pill ${selectedCategory === 'all' ? 'active' : ''}`}
              >
                Tümü ({products.length})
              </button>
              {Object.keys(categoryCounts)
                .filter((k) => k !== 'all')
                .map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`mobile-cat-pill ${selectedCategory === cat ? 'active' : ''}`}
                  >
                    {cat} ({categoryCounts[cat]})
                  </button>
                ))}
            </div>

            {/* Symmetrical Actions Bar (Filter Trigger + Sort + Count) */}
            <div className="mobile-filter-sort-row">
              <button
                onClick={() => setShowMobileFilterModal(true)}
                className="mobile-filter-trigger-btn"
              >
                <SlidersHorizontal size={15} />
                <span>Filtreler {hasActiveFilters ? '•' : ''}</span>
              </button>

              <div className="mobile-sort-select-wrapper">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="mobile-sort-select"
                >
                  <option value="featured">Öne Çıkanlar</option>
                  <option value="name-asc">A-Z Sırala</option>
                  <option value="price-asc">Fiyat (Düşük)</option>
                  <option value="price-desc">Fiyat (Yüksek)</option>
                </select>
              </div>

              <div className="mobile-product-count-badge">
                {filteredProducts.length} Ürün
              </div>
            </div>
          </div>

          {/* Desktop Left Sidebar */}
          <aside className="catalog-sidebar">
            <div className="sidebar-header">
              <div className="sidebar-title-row">
                <SlidersHorizontal size={18} className="sidebar-icon" />
                <h3 className="sidebar-title">Ürünleri Filtrele</h3>
              </div>
              {hasActiveFilters && (
                <button onClick={resetFilters} className="clear-filters-link">
                  Temizle
                </button>
              )}
            </div>

            {/* Search Box */}
            <div className="sidebar-search-box">
              <Search size={16} className="search-input-icon" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Model veya kod ara..."
                className="sidebar-search-input"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="search-clear-btn">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="filter-group">
              <h4 className="filter-group-heading">Kategori</h4>
              <div className="filter-options-list">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className={`filter-option-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                >
                  <span>Tüm Kategoriler</span>
                  <span className="option-count">{products.length}</span>
                </button>
                {Object.keys(categoryCounts)
                  .filter((k) => k !== 'all')
                  .map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`filter-option-btn ${selectedCategory === cat ? 'active' : ''}`}
                    >
                      <span>{cat}</span>
                      <span className="option-count">{categoryCounts[cat]}</span>
                    </button>
                  ))}
              </div>
            </div>

            {/* Dimension Filter */}
            <div className="filter-group">
              <h4 className="filter-group-heading">Ölçü (cm)</h4>
              <div className="filter-options-list">
                <button
                  type="button"
                  onClick={() => setSelectedSize('all')}
                  className={`filter-option-btn ${selectedSize === 'all' ? 'active' : ''}`}
                >
                  <span>Tüm Ebatlar</span>
                  <span className="option-count">{products.length}</span>
                </button>
                {Object.keys(dimensionCounts)
                  .filter((k) => k !== 'all')
                  .slice(0, 6)
                  .map((dim) => (
                    <button
                      key={dim}
                      type="button"
                      onClick={() => setSelectedSize(dim)}
                      className={`filter-option-btn ${selectedSize === dim ? 'active' : ''}`}
                    >
                      <span>{dim} cm</span>
                      <span className="option-count">{dimensionCounts[dim]}</span>
                    </button>
                  ))}
              </div>
            </div>

            {/* Surface/Finish Filter */}
            <div className="filter-group">
              <h4 className="filter-group-heading">Yüzey Bitişi</h4>
              <div className="filter-options-list">
                <button
                  type="button"
                  onClick={() => setSelectedSurface('all')}
                  className={`filter-option-btn ${selectedSurface === 'all' ? 'active' : ''}`}
                >
                  <span>Tüm Yüzeyler</span>
                  <span className="option-count">{products.length}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSurface('mat')}
                  className={`filter-option-btn ${selectedSurface === 'mat' ? 'active' : ''}`}
                >
                  <span>Doğal Mat</span>
                  <span className="option-count">{finishCounts['Mat'] || 0}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSurface('parlak')}
                  className={`filter-option-btn ${selectedSurface === 'parlak' ? 'active' : ''}`}
                >
                  <span>Ayna Parlak</span>
                  <span className="option-count">{finishCounts['Parlak'] || 0}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSurface('lapato')}
                  className={`filter-option-btn ${selectedSurface === 'lapato' ? 'active' : ''}`}
                >
                  <span>Full Lappato</span>
                  <span className="option-count">{finishCounts['Full Lappato'] || 0}</span>
                </button>
              </div>
            </div>

            {/* Consultation Card */}
            <div className="sidebar-consultation-card">
              <div className="consult-badge">MİMARİ DANIŞMA</div>
              <h4 className="consult-title">Projenize Özel Karo</h4>
              <p className="consult-desc">
                Mimari ekibimizden proje metrajı ve özel toplu alım fiyatlandırması talep edin.
              </p>
              <button
                type="button"
                onClick={() => setShowCartDrawer(true)}
                className="consult-action-btn"
              >
                <FileText size={14} />
                <span>Teklif Masasını Aç</span>
              </button>
            </div>
          </aside>

          {/* Right Main Products Area */}
          <main className="catalog-main-content">
            {/* Desktop Only Header */}
            <div className="desktop-only-header">
              <div className="catalog-title-meta">
                <h2 className="catalog-section-title">Dijital Katalog Koleksiyonu</h2>
                <span className="catalog-count-pill">{filteredProducts.length} Karo</span>
              </div>

              <div className="catalog-sort-group">
                <span className="sort-label">Sırala:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="catalog-sort-select"
                >
                  <option value="featured">Öne Çıkanlar</option>
                  <option value="name-asc">A-Z İsim</option>
                  <option value="price-asc">Fiyat (Düşükten Yükseğe)</option>
                  <option value="price-desc">Fiyat (Yüksekten Düşüğe)</option>
                </select>
              </div>
            </div>

            {/* Symmetrical 4-Column Product Grid */}
            <div className="catalog-products-grid">
              {filteredProducts.map((p, idx) => {
                const key = p.id || p.code || p.name || idx;
                const isFav = !!favorites[key];
                const pImage = p.imageUrl || p.textureUrl || '/renders/luxury_bathroom_calacatta_gold.jpg';
                const dimension = p.width && p.height ? `${p.width}x${p.height} cm` : (p.size || 'Standart Ebat');
                const finish = p.finish || p.surface || 'Porselen';

                return (
                  <div key={key} className={`catalog-product-card showroom-luxury-card layout-card-${layoutType}`}>
                    <div className="product-card-media">
                      <div className="card-top-badges">
                        <span className="badge-featured">
                          {p.categoryName || 'Porselen'}
                        </span>
                        {p.isNew && <span className="badge-new">Yeni</span>}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleToggleFavorite(p, e)}
                        className="card-fav-btn"
                        title={isFav ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
                      >
                        <Heart size={15} fill={isFav ? '#e11d48' : 'none'} stroke={isFav ? '#e11d48' : '#64748b'} />
                      </button>

                      <img
                        src={pImage}
                        alt={p.name}
                        className="product-card-img"
                        loading="lazy"
                        onClick={() => setActiveDetailProduct(p)}
                        style={{ cursor: 'pointer' }}
                        title="Doku detayını incelemek için tıklayın"
                      />
                    </div>

                    <div className="product-card-body">
                      <div className="product-meta-sub">
                        <span className="product-category-text">{p.categoryName || 'Karo'}</span>
                        <span className="product-dim-text">{dimension}</span>
                      </div>

                      <h3
                        className="product-card-name"
                        title={p.name}
                        onClick={() => setActiveDetailProduct(p)}
                        style={{ cursor: 'pointer' }}
                      >
                        {p.name}
                      </h3>

                      <div className="product-chips-row">
                        <span className="spec-chip">{finish}</span>
                        <span className="spec-chip">1. Kalite</span>
                        {p.code && <span className="spec-chip">Kod: {p.code}</span>}
                      </div>

                      <div className="product-price-row">
                        {p.displayPrice || p.price ? (
                          <div className="price-box">
                            <span className="price-currency">₺</span>
                            <span className="price-val">{Number(p.displayPrice || p.price).toLocaleString('tr-TR')}</span>
                            <span className="price-unit">/m²</span>
                          </div>
                        ) : (
                          <span className="price-ask">Fiyat Teklifi Alınız</span>
                        )}
                      </div>

                      <div className="product-card-actions">
                        <Link
                          href={`/?tab=studio&product=${encodeURIComponent(p.slug || p.code || p.name || p.id)}#studio`}
                          onClick={(e) => handleOpen3DStudio(p, e)}
                          className="card-action-btn-3d"
                          title="3D Mekân Stüdyosunda Gör"
                        >
                          <Box size={13} />
                          <span>3D Gör</span>
                        </Link>

                        <button
                          type="button"
                          onClick={(e) => handleAddToQuoteCart(p, e)}
                          className="card-action-btn-quote"
                          title="Teklif Listeme Ekle"
                        >
                          <Plus size={13} />
                          <span>Teklif Al</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredProducts.length === 0 && (
              <div className="p-16 text-center border border-dashed border-[var(--line)] bg-[var(--paper)] rounded-2xl my-6">
                <Package size={36} className="mx-auto text-[var(--muted)] mb-3 opacity-60" />
                <h4 className="font-bold text-base text-[var(--ink)] mb-1">Aramanızla Eşleşen Karo Bulunamadı</h4>
                <p className="text-xs text-[var(--muted)] max-w-sm mx-auto mb-4">
                  Seçtiğiniz filtreleme kriterlerine uygun karo bulunamadı. Filtreleri sıfırlayarak tüm kataloğu inceleyebilirsiniz.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="px-4 py-2 rounded-lg bg-[var(--site-primary)] text-white text-xs font-bold"
                >
                  Filtreleri Sıfırla
                </button>
              </div>
            )}
          </main>
        </div>
      </section>

      {/* =========================================================================
          MİMARİ STANDARTLAR & KALİTE GÜVENCESİ (#standartlar)
      ========================================================================= */}
      {sec.showMonograph !== false && (
        <section id="standartlar" className={`showroom-standards-section layout-standards-${layoutType}`}>
          <div className="standards-container">
            <div className="section-header-centered">
              <span className="section-badge-centered">
                {sec.heroStampText || currentTheme.brandInspiration || 'MİMARİ KALİTE GÜVENCESİ'}
              </span>
              <h2 className="section-title-centered">
                {sec.technicalTitle || 'Avrupa Standartlarında Teknik Hassasiyet'}
              </h2>
              <p className="section-desc-centered">
                "{sec.monographQuote || currentTheme.monographQuote || 'Yüzey yalnızca bir kaplama değil; mekânın ışığını, akustik dengesini ve dokusal hafızasını belirleyen temel mimari dildir.'}"
              </p>
            </div>

            <div className="standards-grid">
              <div className="standard-card">
                <div className="standard-card-icon">
                  <ShieldCheck size={22} />
                </div>
                <h3 className="standard-card-title">{sec.spec1Label || 'EN 14411 BLa'}</h3>
                <p className="standard-card-desc">
                  {sec.spec1Desc || 'Tam Gövde Porselen: Maksimum kırılma ve mekanik yük dayanımı.'}
                </p>
              </div>

              <div className="standard-card">
                <div className="standard-card-icon">
                  <Flame size={22} />
                </div>
                <h3 className="standard-card-title">{sec.spec2Label || 'E ≤ %0.05'}</h3>
                <p className="standard-card-desc">
                  {sec.spec2Desc || 'Sıfıra yakın su emme oranı ile donmaya ve termal şoklara tam direnç.'}
                </p>
              </div>

              <div className="standard-card">
                <div className="standard-card-icon">
                  <Ruler size={22} />
                </div>
                <h3 className="standard-card-title">{sec.spec3Label || 'Lazer Rektifiye'}</h3>
                <p className="standard-card-desc">
                  {sec.spec3Desc || '1 mm monokalibre minimum derz aralığıyla kesintisiz yüzey akışı.'}
                </p>
              </div>

              <div className="standard-card">
                <div className="standard-card-icon">
                  <Award size={22} />
                </div>
                <h3 className="standard-card-title">{sec.spec4Label || '4K PBR Master'}</h3>
                <p className="standard-card-desc">
                  {sec.spec4Desc || 'Ultra HD mikrotekstür teknolojisi ve ışık yansıma kontrolü.'}
                </p>
              </div>
            </div>

            {/* BIM / CAD / EPD Links */}
            {(sec.bimCadUrl || sec.ceLeedUrl || sec.epdUrl) && (
              <div className="flex items-center justify-center gap-4 mt-8 flex-wrap">
                {sec.bimCadUrl && (
                  <a
                    href={sec.bimCadUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[var(--line)] bg-[var(--paper)] text-xs font-bold text-[var(--ink)] hover:border-[var(--site-primary)]"
                  >
                    <Download size={14} />
                    <span>BIM / Revit (.rfa) İndir</span>
                  </a>
                )}
                {sec.ceLeedUrl && (
                  <a
                    href={sec.ceLeedUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[var(--line)] bg-[var(--paper)] text-xs font-bold text-[var(--ink)] hover:border-[var(--site-primary)]"
                  >
                    <ShieldCheck size={14} />
                    <span>CE & DoP Sertifikası</span>
                  </a>
                )}
                {sec.epdUrl && (
                  <a
                    href={sec.epdUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[var(--line)] bg-[var(--paper)] text-xs font-bold text-[var(--ink)] hover:border-[var(--site-primary)]"
                  >
                    <Award size={14} />
                    <span>EPD Yeşil Bina Belgesi</span>
                  </a>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* =========================================================================
          EDITORIAL LIVING SPACES SECTION (#mekanlar)
      ========================================================================= */}
      {sec.showEditorial !== false && (
        <section id="mekanlar" className="showroom-spaces-section">
          <div className="spaces-container">
            <div className="section-header-centered">
              <span className="section-badge-centered">
                {sec.editorialBadge || 'Mekânda Hayat Bulan Yüzeyler'}
              </span>
              <h2 className="section-title-centered">
                {sec.editorialTitle ? sec.editorialTitle.replace('\n', ' ') : 'Mekân İlhamı ve Yaşam Alanları'}
              </h2>
              <p className="section-desc-centered">
                {sec.editorialText ||
                  'Doğru seramik ve porselen, mekânın ışığını, akustik dengesini ve mimari derinliğini belirler. Seçkin serileri mekânınızın bir parçası olarak keşfedin.'}
              </p>
            </div>

            <div className="spaces-grid">
              <div className="space-card">
                <div className="space-card-img-wrap">
                  <img
                    src="/hero/luxury_bathroom.png"
                    alt="Banyo ve Spa İlhamı"
                    className="space-card-img"
                  />
                </div>
                <div className="space-card-body">
                  <span className="space-card-badge">01 // ISLAK HACİM</span>
                  <h3 className="space-card-title">{sec.feature1Title || 'Banyo ve Spa Alanları'}</h3>
                  <p className="space-card-desc">
                    {sec.feature1Desc || 'Doğal taş dinginliği, kaymaz yüzey dokuları ve su itici hijyenik seramikler.'}
                  </p>
                </div>
              </div>

              <div className="space-card">
                <div className="space-card-img-wrap">
                  <img
                    src="/renders/modern_living_natural_oak.jpg"
                    alt="Yaşam Alanları & Salon"
                    className="space-card-img"
                  />
                </div>
                <div className="space-card-body">
                  <span className="space-card-badge">02 // MONOLİTİK ZEMİN</span>
                  <h3 className="space-card-title">{sec.feature2Title || 'Yaşam Alanları & Salon'}</h3>
                  <p className="space-card-desc">
                    {sec.feature2Desc || 'Geniş ebat porselen slablar ile derzsiz ferahlık ve heykelsi mimari duruş.'}
                  </p>
                </div>
              </div>

              <div className="space-card">
                <div className="space-card-img-wrap">
                  <img
                    src="/textures/calacatta_gold.jpg"
                    alt="Mutfak & Ticari Zeminler"
                    className="space-card-img"
                  />
                </div>
                <div className="space-card-body">
                  <span className="space-card-badge">03 // YÜKSEK TRAFİK</span>
                  <h3 className="space-card-title">{sec.feature3Title || 'Mutfak & Ticari Zeminler'}</h3>
                  <p className="space-card-desc">
                    {sec.feature3Desc || 'Ağır yaya trafiğine, çizilmeye ve lekelere karşı PEI V sınıfı dayanım.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          CONTACT & DIRECT QUOTATION STRIP (#iletisim)
      ========================================================================= */}
      <footer id="iletisim" className="showroom-contact-strip">
        <div className="contact-strip-container">
          <div className="contact-cta-box">
            {brandLogo && (
              <div className="flex justify-center mb-4">
                <div className="inline-flex items-center justify-center bg-white border border-stone-200/90 rounded-xl px-4 py-2 shadow-xs">
                  <img
                    src={brandLogo}
                    alt={brandName}
                    className="max-h-12 max-w-[200px] object-contain"
                  />
                </div>
              </div>
            )}
            <span className="section-badge-centered">
              {brandName.toUpperCase()} PROJE MERKEZİ
            </span>
            <h2 className="text-3xl font-serif font-extrabold text-[var(--ink)] mb-3">
              {sec.ctaTitle || 'Projeniz İçin Doğru Yüzeyi Belirleyin'}
            </h2>
            <p className="text-sm text-[var(--muted)] max-w-xl mx-auto mb-6">
              {sec.ctaSubtitle ||
                'Kataloğumuzdaki tüm ürünler için doğrudan mimari satış ekibimizden proje bazlı fiyatlandırma ve fiziki numune talep edebilirsiniz.'}
            </p>

            <div className="flex items-center justify-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => setShowCartDrawer(true)}
                className="flagship-btn-primary"
              >
                <FileText size={16} />
                <span>Teklif Masasına Ürün Ekle</span>
              </button>

              {brandPhone && (
                <a
                  href={`https://api.whatsapp.com/send?phone=${brandPhone.replace(/[^0-9]/g, '')}&text=${encodeURIComponent(`Merhaba, ${brandName} dijital kataloğunuzdaki ürünler hakkında bilgi almak istiyorum.`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flagship-btn-video"
                  style={{ background: '#25D366', borderColor: '#25D366', color: '#ffffff' }}
                >
                  <MessageCircle size={16} />
                  <span>WhatsApp ile Hızlı İletişim</span>
                </a>
              )}
            </div>

            {/* Corporate Info Grid */}
            <div className="contact-cards-row">
              {brandPhone && (
                <a href={`tel:${brandPhone}`} className="contact-card-item">
                  <Phone size={18} className="contact-card-icon" />
                  <span className="contact-card-label">Kurumsal Telefon</span>
                  <span className="contact-card-val">{brandPhone}</span>
                </a>
              )}

              {brandEmail && (
                <a href={`mailto:${brandEmail}`} className="contact-card-item">
                  <Mail size={18} className="contact-card-icon" />
                  <span className="contact-card-label">E-posta</span>
                  <span className="contact-card-val">{brandEmail}</span>
                </a>
              )}

              {brandAddress && (
                <div className="contact-card-item">
                  <MapPin size={18} className="contact-card-icon" />
                  <span className="contact-card-label">Merkez Adres</span>
                  <span className="contact-card-val" title={brandAddress}>{brandAddress}</span>
                </div>
              )}

              {brandWebsite && (
                <a href={brandWebsite.startsWith('http') ? brandWebsite : `https://${brandWebsite}`} target="_blank" rel="noreferrer" className="contact-card-item">
                  <Globe size={18} className="contact-card-icon" />
                  <span className="contact-card-label">Resmi Web Sitesi</span>
                  <span className="contact-card-val">{brandWebsite.replace(/^https?:\/\//, '')}</span>
                </a>
              )}
            </div>
          </div>

          <div className="mt-8 text-xs text-[var(--muted)] flex items-center justify-between flex-wrap gap-4 border-t border-[var(--line)] pt-6">
            <span>© {year} {brandName}. Tüm hakları saklıdır.</span>
            <span>SeramikBak Dijital Mimari Showroom Altyapısı</span>
          </div>
        </div>
      </footer>

      {/* =========================================================================
          QUOTE CART SLIDE-OVER DRAWER (Showroom Ergonomics)
      ========================================================================= */}
      {showCartDrawer && (
        <div className="quote-drawer-backdrop" onClick={() => setShowCartDrawer(false)}>
          <div className="quote-drawer-content" onClick={(e) => e.stopPropagation()}>
            <div className="quote-drawer-header">
              <div className="quote-drawer-title-row">
                <ShoppingBag size={20} className="text-[var(--site-primary)]" />
                <h3 className="quote-drawer-title">
                  Teklif & Numune Listem ({quoteCart.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCartDrawer(false)}
                className="p-1 rounded-full hover:bg-black/5 text-[var(--muted)]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="quote-drawer-body">
              {cartSuccess ? (
                <div className="p-8 text-center bg-emerald-50 border border-emerald-200 rounded-2xl my-6">
                  <CheckCircle2 size={44} className="mx-auto text-emerald-600 mb-3" />
                  <h4 className="text-base font-extrabold text-emerald-900 mb-1">
                    Talebiniz Başarıyla İletildi!
                  </h4>
                  <p className="text-xs text-emerald-800 leading-relaxed mb-4">
                    {brandName} kurumsal satış ve mimari proje masası ekibimiz, talep ettiğiniz karolar ve metrajlar için en kısa sürede sizinle iletişime geçecektir.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setCartSuccess(false);
                      setQuoteCart([]);
                      setShowCartDrawer(false);
                    }}
                    className="px-4 py-2 bg-emerald-700 text-white rounded-lg text-xs font-bold"
                  >
                    Tamam, Kapat
                  </button>
                </div>
              ) : (
                <>
                  {quoteCart.length === 0 ? (
                    <div className="p-12 text-center text-[var(--muted)]">
                      <ShoppingBag size={40} className="mx-auto mb-3 opacity-40" />
                      <p className="text-sm font-bold text-[var(--ink)] mb-1">Listenizde Henüz Karo Yok</p>
                      <p className="text-xs mb-4">Katalogdaki beğendiğiniz karoların üzerindeki "Teklif Al" butonuna basarak buraya ekleyebilirsiniz.</p>
                      <button
                        type="button"
                        onClick={() => setShowCartDrawer(false)}
                        className="px-4 py-2 rounded-lg bg-[var(--site-primary)] text-white text-xs font-bold"
                      >
                        Ürünleri İncele
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs text-[var(--muted)] mb-3">
                        Eklediğiniz karolar ve yaklaşık metraj ihtiyacınız:
                      </p>

                      <div className="space-y-2 mb-6">
                        {quoteCart.map((item) => (
                          <div key={item.id} className="quote-item-row">
                            <img src={item.imageUrl} alt={item.name} className="quote-item-thumb" />
                            <div className="quote-item-details">
                              <h5 className="quote-item-name">{item.name}</h5>
                              <span className="quote-item-meta">{item.dimensionText} &bull; {item.finishText}</span>
                            </div>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <input
                                type="number"
                                min="1"
                                value={item.m2}
                                onChange={(e) => handleUpdateCartM2(item.id, e.target.value)}
                                className="quote-item-m2-input"
                                title="Tahmini metraj (m²)"
                              />
                              <span className="text-xs text-[var(--muted)]">m²</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveFromCart(item.id)}
                                className="p-1.5 text-stone-400 hover:text-rose-600 transition"
                                title="Listeden Kaldır"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Lead Form */}
                      <form onSubmit={handleCartSubmit} className="space-y-3 pt-4 border-t border-[var(--line)]">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--ink)] mb-1">
                          İletişim & Proje Bilgileriniz
                        </h4>

                        <div>
                          <label className="block text-[11px] font-bold text-[var(--ink)] mb-1">
                            Ad Soyad *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Örn: Mimar Selim Yılmaz"
                            value={quoteForm.name}
                            onChange={(e) => setQuoteForm({ ...quoteForm, name: e.target.value })}
                            className="w-full px-3 py-2 text-xs border border-[var(--line)] rounded-lg outline-none bg-[var(--site-background)] text-[var(--ink)]"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-bold text-[var(--ink)] mb-1">
                              Telefon *
                            </label>
                            <input
                              type="tel"
                              required
                              placeholder="05XX XXX XX XX"
                              value={quoteForm.phone}
                              onChange={(e) => setQuoteForm({ ...quoteForm, phone: e.target.value })}
                              className="w-full px-3 py-2 text-xs border border-[var(--line)] rounded-lg outline-none bg-[var(--site-background)] text-[var(--ink)]"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-[var(--ink)] mb-1">
                              Proje Şehri
                            </label>
                            <input
                              type="text"
                              placeholder="İstanbul, Ankara..."
                              value={quoteForm.city}
                              onChange={(e) => setQuoteForm({ ...quoteForm, city: e.target.value })}
                              className="w-full px-3 py-2 text-xs border border-[var(--line)] rounded-lg outline-none bg-[var(--site-background)] text-[var(--ink)]"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-[var(--ink)] mb-1">
                            E-posta Adresi
                          </label>
                          <input
                            type="email"
                            placeholder="mimar@proje.com"
                            value={quoteForm.email}
                            onChange={(e) => setQuoteForm({ ...quoteForm, email: e.target.value })}
                            className="w-full px-3 py-2 text-xs border border-[var(--line)] rounded-lg outline-none bg-[var(--site-background)] text-[var(--ink)]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-[var(--ink)] mb-1">
                            Firma / Mimarlık Ofisi
                          </label>
                          <input
                            type="text"
                            placeholder="Örn: Kolektif Mimarlık"
                            value={quoteForm.company}
                            onChange={(e) => setQuoteForm({ ...quoteForm, company: e.target.value })}
                            className="w-full px-3 py-2 text-xs border border-[var(--line)] rounded-lg outline-none bg-[var(--site-background)] text-[var(--ink)]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-[var(--ink)] mb-1">
                            Proje Notları / Özel Talepler
                          </label>
                          <textarea
                            rows={2}
                            placeholder="Örn: 2026 son çeyreği teslim villa projesi için fiziki numune ve iskonto tablosu rica ediyoruz."
                            value={quoteForm.message}
                            onChange={(e) => setQuoteForm({ ...quoteForm, message: e.target.value })}
                            className="w-full px-3 py-2 text-xs border border-[var(--line)] rounded-lg outline-none bg-[var(--site-background)] text-[var(--ink)]"
                          />
                        </div>

                        {cartError && (
                          <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                            {cartError}
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={cartSubmitting}
                          className="w-full py-3 rounded-lg bg-[var(--site-primary)] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md hover:brightness-105 transition"
                        >
                          {cartSubmitting ? (
                            <>
                              <Loader2 size={15} className="animate-spin" />
                              <span>İletiliyor...</span>
                            </>
                          ) : (
                            <>
                              <FileText size={15} />
                              <span>Teklif & Numune Talebini Gönder ({quoteCart.length} Ürün)</span>
                            </>
                          )}
                        </button>
                      </form>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          4K TEXTURE DETAIL MODAL
      ========================================================================= */}
      {activeDetailProduct && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setActiveDetailProduct(null)}
        >
          <div
            className="bg-[var(--paper)] border border-[var(--line)] rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: 'var(--paper)', borderColor: 'var(--line)' }}
          >
            <button
              type="button"
              onClick={() => setActiveDetailProduct(null)}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition"
            >
              <X size={16} />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-6 bg-[var(--site-background)] flex items-center justify-center relative min-h-[300px]">
                <img
                  src={activeDetailProduct.imageUrl || activeDetailProduct.textureUrl}
                  alt={activeDetailProduct.name}
                  className="max-h-72 max-w-full object-contain rounded-lg shadow-lg"
                />
              </div>

              <div className="p-6 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--site-primary)] block mb-1">
                    {activeDetailProduct.categoryName || 'MİMARİ PORSELEN'}
                  </span>
                  <h3 className="text-xl font-serif font-bold text-[var(--ink)] mb-2">
                    {activeDetailProduct.name}
                  </h3>
                  {activeDetailProduct.code && (
                    <p className="text-xs text-[var(--muted)] font-mono mb-4">
                      Ürün Kodu: {activeDetailProduct.code}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-3 mb-6 text-xs">
                    <div className="p-2.5 rounded-lg border border-[var(--line)] bg-black/2">
                      <span className="text-[10px] text-[var(--muted)] block">Ebat</span>
                      <strong className="text-[var(--ink)]">
                        {activeDetailProduct.width && activeDetailProduct.height
                          ? `${activeDetailProduct.width} × ${activeDetailProduct.height} cm`
                          : activeDetailProduct.size || 'Standart'}
                      </strong>
                    </div>
                    <div className="p-2.5 rounded-lg border border-[var(--line)] bg-black/2">
                      <span className="text-[10px] text-[var(--muted)] block">Yüzey</span>
                      <strong className="text-[var(--ink)]">
                        {activeDetailProduct.finish || activeDetailProduct.surface || 'Mat'}
                      </strong>
                    </div>
                    <div className="p-2.5 rounded-lg border border-[var(--line)] bg-black/2">
                      <span className="text-[10px] text-[var(--muted)] block">Su Emme</span>
                      <strong className="text-[var(--ink)]">E ≤ %0.05</strong>
                    </div>
                    <div className="p-2.5 rounded-lg border border-[var(--line)] bg-black/2">
                      <span className="text-[10px] text-[var(--muted)] block">Kenar</span>
                      <strong className="text-[var(--ink)]">Rektifiye (1 mm)</strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-[var(--line)]">
                  <Link
                    href={`/?tab=studio&product=${encodeURIComponent(activeDetailProduct.slug || activeDetailProduct.code || activeDetailProduct.name || activeDetailProduct.id)}#studio`}
                    onClick={(e) => handleOpen3DStudio(activeDetailProduct, e)}
                    className="flex-1 py-2.5 rounded-lg border border-[var(--line)] text-center text-xs font-bold text-[var(--ink)] hover:border-[var(--site-primary)] flex items-center justify-center gap-1.5"
                  >
                    <Box size={14} />
                    <span>3D Gör & Döşe</span>
                  </Link>
                  <button
                    type="button"
                    onClick={(e) => {
                      handleAddToQuoteCart(activeDetailProduct, e);
                      setActiveDetailProduct(null);
                    }}
                    className="flex-1 py-2.5 rounded-lg bg-[var(--site-primary)] text-white text-center text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <Plus size={14} />
                    <span>Teklif Listeme Ekle</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          QR CODE MODAL
      ========================================================================= */}
      {showQrModal && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowQrModal(false)}
        >
          <div
            className="bg-[var(--paper)] border border-[var(--line)] rounded-2xl max-w-sm w-full p-6 text-center relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: 'var(--paper)', borderColor: 'var(--line)' }}
          >
            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="absolute top-3 right-3 text-[var(--muted)] hover:text-[var(--ink)]"
            >
              <X size={18} />
            </button>

            <h3 className="font-serif font-bold text-lg text-[var(--ink)] mb-1">
              {brandName} Dijital Katalog
            </h3>
            <p className="text-xs text-[var(--muted)] mb-4">
              Mobil cihazınızdan taratarak kataloğu anında açın.
            </p>

            <div className="w-52 h-52 mx-auto bg-white p-3 rounded-xl border border-stone-200 shadow-inner flex items-center justify-center mb-4">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(currentUrl)}`}
                alt="Katalog QR Kodu"
                className="w-full h-full object-contain"
              />
            </div>

            <button
              type="button"
              onClick={handleCopyLink}
              className="w-full py-2.5 rounded-lg bg-[var(--site-primary)] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? 'Kopyalandı! ✓' : 'Bağlantıyı Kopyala'}</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          MOBILE FILTER BOTTOM SHEET MODAL
      ========================================================================= */}
      {showMobileFilterModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center animate-in fade-in duration-200"
          onClick={() => setShowMobileFilterModal(false)}
        >
          <div
            className="bg-[var(--paper)] rounded-t-3xl w-full max-h-[80vh] overflow-y-auto p-6 shadow-2xl animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: 'var(--paper)' }}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[var(--line)] mb-4">
              <h3 className="font-bold text-base text-[var(--ink)]">Filtreler</h3>
              <button
                type="button"
                onClick={() => setShowMobileFilterModal(false)}
                className="p-1 rounded-full text-[var(--muted)]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <h4 className="text-xs font-bold uppercase text-[var(--muted)] mb-2">Ölçü (cm)</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedSize('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                      selectedSize === 'all'
                        ? 'bg-[var(--site-primary)] text-white border-[var(--site-primary)]'
                        : 'border-[var(--line)] text-[var(--ink)]'
                    }`}
                  >
                    Tüm Ebatlar
                  </button>
                  {Object.keys(dimensionCounts)
                    .filter((k) => k !== 'all')
                    .map((dim) => (
                      <button
                        key={dim}
                        type="button"
                        onClick={() => setSelectedSize(dim)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                          selectedSize === dim
                            ? 'bg-[var(--site-primary)] text-white border-[var(--site-primary)]'
                            : 'border-[var(--line)] text-[var(--ink)]'
                        }`}
                      >
                        {dim} cm ({dimensionCounts[dim]})
                      </button>
                    ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase text-[var(--muted)] mb-2">Yüzey Bitişi</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedSurface('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                      selectedSurface === 'all'
                        ? 'bg-[var(--site-primary)] text-white border-[var(--site-primary)]'
                        : 'border-[var(--line)] text-[var(--ink)]'
                    }`}
                  >
                    Tüm Yüzeyler
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedSurface('mat')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                      selectedSurface === 'mat'
                        ? 'bg-[var(--site-primary)] text-white border-[var(--site-primary)]'
                        : 'border-[var(--line)] text-[var(--ink)]'
                    }`}
                  >
                    Doğal Mat
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedSurface('parlak')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                      selectedSurface === 'parlak'
                        ? 'bg-[var(--site-primary)] text-white border-[var(--site-primary)]'
                        : 'border-[var(--line)] text-[var(--ink)]'
                    }`}
                  >
                    Ayna Parlak
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedSurface('lapato')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                      selectedSurface === 'lapato'
                        ? 'bg-[var(--site-primary)] text-white border-[var(--site-primary)]'
                        : 'border-[var(--line)] text-[var(--ink)]'
                    }`}
                  >
                    Full Lappato
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-[var(--line)] mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  resetFilters();
                  setShowMobileFilterModal(false);
                }}
                className="flex-1 py-3 rounded-xl border border-[var(--line)] text-xs font-bold text-[var(--ink)]"
              >
                Temizle
              </button>
              <button
                type="button"
                onClick={() => setShowMobileFilterModal(false)}
                className="flex-1 py-3 rounded-xl bg-[var(--site-primary)] text-white text-xs font-bold"
              >
                Uygula ({filteredProducts.length} Karo)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
