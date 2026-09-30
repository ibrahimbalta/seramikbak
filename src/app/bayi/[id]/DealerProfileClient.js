'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { 
  MapPin, 
  Phone, 
  Sparkles, 
  ChevronLeft, 
  Send, 
  CheckCircle2, 
  Building2, 
  Clock, 
  Mail, 
  ArrowRight,
  MessageSquare,
  ShieldCheck,
  Search,
  Package,
  Layers,
  X,
  QrCode,
  Calendar,
  Plus,
  Minus,
  Trash2,
  Check,
  Eye,
  Heart,
  SlidersHorizontal,
  Compass,
  FileText,
  Navigation,
  ExternalLink,
  ChevronDown,
  Filter
} from 'lucide-react';
import './dealer-profile.css';

export default function DealerProfileClient({ dealer, products }) {
  // Safe JSON helper
  const safeParseJSON = (val, fallback) => {
    if (val === null || val === undefined || val === '') return fallback;
    if (typeof val === 'object') return val;
    try {
      return JSON.parse(val);
    } catch (e) {
      return fallback;
    }
  };

  // Dynamic Showroom Config from dealerStats
  const dealerStatsObj = safeParseJSON(dealer?.dealerStats, {});
  const sc = dealerStatsObj?.showroomConfig || {};

  // 1. Hero Dynamic Fields
  const heroBadge = sc.heroBadge || 'YETKİLİ SHOWROOM & PROJE MERKEZİ';
  const heroTitle = sc.heroTitle || dealer?.name || 'Prestij Seramik Showroom';
  const heroDescription = sc.heroDescription || dealer?.description || 'En seçkin porselen ve seramik karo koleksiyonları, mimari projelendirme desteği ve kişiselleştirilmiş 3D mekan tasarımlarıyla hayalinizdeki mekanlara zarafet katıyoruz.';
  const heroPrimaryBtnText = sc.heroPrimaryBtnText || 'Showroomu İncele';
  const heroSecondaryBtnText = sc.heroSecondaryBtnText || 'Teklif Al';
  const heroCursiveQuote = sc.heroCursiveQuote || '“Hayalinizdeki mekan burada başlıyor...”';
  const heroCursiveSub = sc.heroCursiveSub || (dealer?.name ? `${dealer.name} Koleksiyonu` : 'Showroom Koleksiyonu');
  const workingHours = sc.workingHours || '09:00 - 19:00';
  const workingDays = sc.workingDays || 'Pazartesi - Cumartesi';
  const heroImage = sc.heroBannerUrl || dealer?.bannerUrl || '/hero/luxury_bathroom.png';

  // 2. Feature Pillars (4 items)
  const defaultPillars = [
    { title: '100+ Teşhir Ürünü', desc: 'En güncel geniş ebat porselen serileri' },
    { title: '3D Mekan Görüntüleme', desc: 'Karoları kendi mekanınızda canlı görün' },
    { title: 'Gerçek Numune', desc: 'Mimari projeler için yerinde doku kontrolü' },
    { title: 'Hızlı Teklif', desc: 'Dakikalar içinde net metraj ve fiyatlandırma' }
  ];
  const featurePillars = (sc.featurePillars && sc.featurePillars.length === 4) ? sc.featurePillars : defaultPillars;

  // 3. Catalog Section
  const catalogTitle = sc.catalogTitle || 'Showroom Ürünleri';
  const consultationTitle = sc.consultationTitle || 'Banyonuz İçin Birlikte Çizelim';
  const consultationDesc = sc.consultationDesc || 'Showroom uzmanımızla randevu alarak projenize özel karo seçimi yapın.';

  // 4. AI Designer Banner
  const aiBadge = sc.aiBadge || 'YAPAY ZEKA DESTEKLİ';
  const aiTitle = sc.aiTitle || 'Mekanını Tasarla';
  const aiDesc = sc.aiDesc || 'Kendi banyonuzun veya salonunuzun fotoğrafını yükleyin; seramiklerimizin evinizde nasıl duracağını yapay zeka ile saniyeler içinde fotogerçekçi görün.';
  const aiBtnText = sc.aiBtnText || 'Fotoğraf Yükle & Tasarla';
  const defaultAiBullets = [
    { title: 'Saniyeler İçinde 3D Çıktı', desc: 'Karmaşık mimari çizim programlarına gerek kalmadan anında sonuç alın.' },
    { title: 'Gerçek Işık & Yansıma Uyumu', desc: 'Seramik yüzey dokuları odanızın gerçek gün ışığına göre birebir render edilir.' },
    { title: 'Doğrudan Bayiden Sipariş', desc: 'Oluşturduğunuz tasarımın metrajını tek tıkla WhatsApp üzerinden bayimize iletin.' }
  ];
  const aiBullets = (sc.aiBullets && sc.aiBullets.length === 3) ? sc.aiBullets : defaultAiBullets;

  // 5. Campaigns
  const rawCampaigns = safeParseJSON(dealer?.dealerCampaigns, []);
  const defaultCampaigns = [
    {
      tag: 'MİMARLARA ÖZEL',
      percent: '%25 İskonto',
      title: 'Toplu Alım ve Mimari Proje Desteği',
      desc: 'Konut ve ticari projeleriniz için özel toptan fiyatlandırma ve esnek ödeme planları sunuyoruz.',
      expiry: 'Yıl Boyu Geçerli',
      isHighlight: false,
      action: 'quote'
    },
    {
      tag: 'ÜCRETSİZ HİZMET',
      percent: '3D Banyo',
      title: 'Ücretsiz Mimari 3D Modelleme',
      desc: 'Showroomumuzu ziyaret eden veya planını gönderen müşterilerimize banyo yerleşim çizimi hediye.',
      expiry: 'Randevu ile',
      isHighlight: true,
      action: 'appt'
    },
    {
      tag: 'LOJİSTİK',
      percent: 'Hızlı Sevk',
      title: 'Stoktan Aynı Gün Depo Teslimatı',
      desc: 'Seçili 60x120 ve 30x90 porselen serilerinde beklemeden doğrudan depodan adrese hızlı teslimat.',
      expiry: 'Seçili Ürünlerde',
      isHighlight: false,
      action: 'katalog'
    }
  ];
  const campaignsList = (rawCampaigns && rawCampaigns.length > 0) 
    ? rawCampaigns.map((c, i) => ({
        tag: c.tag || (i === 0 ? 'MİMARLARA ÖZEL' : i === 1 ? 'ÜCRETSİZ HİZMET' : 'KAMPANYA'),
        percent: c.percent || (i === 0 ? '%25 İskonto' : i === 1 ? '3D Proje' : 'Fırsat'),
        title: c.title || 'Özel Showroom Fırsatı',
        desc: c.desc || 'Detaylı bilgi ve avantajlı fiyatlar için showroomumuzu ziyaret edebilirsiniz.',
        expiry: c.expiresAt || c.expiry || 'Sınırlı Süre',
        isHighlight: i === 1,
        action: i === 1 ? 'appt' : 'quote'
      }))
    : defaultCampaigns;

  // 6. Action Bar & WhatsApp
  const whatsappGreeting = sc.whatsappGreeting || (`Merhaba, ${dealer?.name || 'Showroom'} sayfanızdan ulaşıyorum. Ürünler ve fiyatlar hakkında bilgi alabilir miyim?`);
  const customMapsUrl = sc.customMapsUrl || (dealer?.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((dealer.name || '') + ' ' + dealer.address)}` : '');

  // Featured product IDs configured by dealer in portal
  const rawFeatured = safeParseJSON(dealer?.featuredProducts, []);
  const featuredIdsNormalized = Array.isArray(rawFeatured)
    ? rawFeatured.map(item => (typeof item === 'object' && item !== null ? item.id : item))
    : [];

  // Master catalog products: merge base products + dealer inventories with NO arbitrary 4-item cap
  const allCatalogProducts = useMemo(() => {
    const map = new Map();
    (products || []).forEach(p => {
      if (p && p.id) {
        map.set(p.id, {
          ...p,
          isFeatured: featuredIdsNormalized.includes(p.id) || !!p.isFeatured,
          displayPrice: p.price || null,
          categoryName: p.category || p.style || 'Porselen Karo',
          dimensionText: p.dimensions || p.size || '60x120 cm',
          finishText: p.surface || p.finish || 'Mat Rektifiye',
          imageUrl: p.imageUrl || p.image || '/textures/calacatta_gold.jpg'
        });
      }
    });

    if (dealer?.inventories && Array.isArray(dealer.inventories)) {
      dealer.inventories.forEach(inv => {
        if (inv.product && inv.product.id) {
          const pid = inv.product.id;
          const prev = map.get(pid);
          map.set(pid, {
            ...(prev || inv.product),
            isFeatured: featuredIdsNormalized.includes(pid) || (prev ? prev.isFeatured : false),
            displayPrice: inv.price || (prev ? prev.displayPrice : inv.product.price) || null,
            stockStatus: inv.stockStatus || 'IN_STOCK',
            stockQuantity: inv.quantity ?? 100,
            categoryName: inv.product.category || inv.product.style || (prev ? prev.categoryName : 'Porselen Karo'),
            dimensionText: inv.product.dimensions || inv.product.size || (prev ? prev.dimensionText : '60x120 cm'),
            finishText: inv.product.surface || inv.product.finish || (prev ? prev.finishText : 'Mat Rektifiye'),
            imageUrl: inv.product.imageUrl || inv.product.image || (prev ? prev.imageUrl : '/textures/calacatta_gold.jpg')
          });
        }
      });
    }

    const list = Array.from(map.values());
    return list.sort((a, b) => {
      if (a.isFeatured === b.isFeatured) return 0;
      return a.isFeatured ? -1 : 1;
    });
  }, [products, dealer, featuredIdsNormalized]);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDimension, setSelectedDimension] = useState('all');
  const [selectedFinish, setSelectedFinish] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [favorites, setFavorites] = useState([]);
  const [showMobileFilterModal, setShowMobileFilterModal] = useState(false);

  // Modals & Drawer States
  const [quoteCart, setQuoteCart] = useState([]);
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [selectedProductForLead, setSelectedProductForLead] = useState(null);
  const [showApptModal, setShowApptModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Lead Form State
  const [leadName, setLeadName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadNotes, setLeadNotes] = useState('');
  const [leadLoading, setLeadLoading] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState(false);

  // Appointment Form State
  const [apptName, setApptName] = useState('');
  const [apptPhone, setApptPhone] = useState('');
  const [apptDate, setApptDate] = useState('');
  const [apptTime, setApptTime] = useState('14:00 - 16:00 (Öğleden Sonra)');
  const [apptNotes, setApptNotes] = useState('');
  const [apptSuccess, setApptSuccess] = useState(false);

  // Cart Customer details
  const [cartCustomerName, setCartCustomerName] = useState('');
  const [cartCustomerPhone, setCartCustomerPhone] = useState('');

  // Toast auto-clear
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(''), 3200);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const showToast = (msg) => {
    setToastMessage(msg);
  };

  // Toggle favorite
  const toggleFavorite = (productId, e) => {
    if (e) e.stopPropagation();
    setFavorites(prev => {
      const next = prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId];
      showToast(next.includes(productId) ? 'Ürün favorilerinize eklendi' : 'Ürün favorilerden çıkarıldı');
      return next;
    });
  };

  // Add to quote cart
  const addToQuoteCart = (product, e) => {
    if (e) e.stopPropagation();
    setQuoteCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 10 } 
            : item
        );
      }
      return [...prev, { product, quantity: 25, unit: 'm²' }];
    });
    showToast(`${product.name} teklif sepetine eklendi`);
  };

  const updateCartQty = (productId, delta) => {
    setQuoteCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (productId) => {
    setQuoteCart(prev => prev.filter(item => item.product.id !== productId));
  };

  // Categories with counts
  const categoryCounts = useMemo(() => {
    const counts = { all: allCatalogProducts.length };
    allCatalogProducts.forEach(p => {
      const cat = p.categoryName || 'Diğer';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [allCatalogProducts]);

  // Dimensions with counts
  const dimensionCounts = useMemo(() => {
    const counts = { all: allCatalogProducts.length };
    allCatalogProducts.forEach(p => {
      const dim = p.dimensionText || 'Standart';
      counts[dim] = (counts[dim] || 0) + 1;
    });
    return counts;
  }, [allCatalogProducts]);

  // Finishes with counts
  const finishCounts = useMemo(() => {
    const counts = { all: allCatalogProducts.length };
    allCatalogProducts.forEach(p => {
      const f = p.finishText || 'Standart';
      counts[f] = (counts[f] || 0) + 1;
    });
    return counts;
  }, [allCatalogProducts]);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return allCatalogProducts.filter(p => {
      // Search
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchesName = (p.name || '').toLowerCase().includes(q);
        const matchesCat = (p.categoryName || '').toLowerCase().includes(q);
        const matchesDim = (p.dimensionText || '').toLowerCase().includes(q);
        if (!matchesName && !matchesCat && !matchesDim) return false;
      }
      // Category
      if (selectedCategory !== 'all' && p.categoryName !== selectedCategory) {
        return false;
      }
      // Dimension
      if (selectedDimension !== 'all' && p.dimensionText !== selectedDimension) {
        return false;
      }
      // Finish
      if (selectedFinish !== 'all' && p.finishText !== selectedFinish) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return (a.displayPrice || 0) - (b.displayPrice || 0);
      if (sortBy === 'price-desc') return (b.displayPrice || 0) - (a.displayPrice || 0);
      if (sortBy === 'name-asc') return (a.name || '').localeCompare(b.name || '');
      // default: featured first
      if (a.isFeatured === b.isFeatured) return 0;
      return a.isFeatured ? -1 : 1;
    });
  }, [allCatalogProducts, searchTerm, selectedCategory, selectedDimension, selectedFinish, sortBy]);

  // Clear all filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedDimension('all');
    setSelectedFinish('all');
    setSortBy('featured');
  };

  // WhatsApp Send helper
  const cleanPhone = (dealer?.phone || '').replace(/\D/g, '');
  const dealerWhatsAppPhone = cleanPhone.startsWith('0') ? '90' + cleanPhone.slice(1) : (cleanPhone.startsWith('90') ? cleanPhone : ('90' + cleanPhone));

  const handleSendCartWhatsApp = () => {
    if (quoteCart.length === 0) return;
    const lines = [
      `*SHOWROOM TEKLİF TALEBİ - ${dealer?.name}*`,
      `Müşteri: ${cartCustomerName || 'Değerli Müşteri'}`,
      cartCustomerPhone ? `Telefon: ${cartCustomerPhone}` : '',
      `--------------------------------`,
      `Talep Edilen Ürünler:`
    ];

    quoteCart.forEach((item, idx) => {
      const priceText = item.product.displayPrice ? ` (~₺${item.product.displayPrice}/m²)` : '';
      lines.push(`${idx + 1}. *${item.product.name}* (${item.product.dimensionText}) - ${item.quantity} ${item.unit}${priceText}`);
    });

    lines.push(`--------------------------------`);
    lines.push(`Toplam Çeşit: ${quoteCart.length} kalem`);
    lines.push(`Not: Lütfen güncel stok ve proforma teklif bilgisini iletiniz.`);

    const text = encodeURIComponent(lines.filter(Boolean).join('\n'));
    const url = `https://wa.me/${dealerWhatsAppPhone}?text=${text}`;
    window.open(url, '_blank');
  };

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    setLeadLoading(true);
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealerId: dealer.id,
          name: leadName,
          phone: leadPhone,
          email: leadEmail,
          message: leadNotes,
          productId: selectedProductForLead?.id || null,
          productName: selectedProductForLead?.name || 'Genel Showroom Teklifi',
          source: 'SHOWROOM_PAGE'
        })
      });
      setLeadSuccess(true);
      showToast('Teklif talebiniz bayiye başarıyla iletildi!');
    } catch (err) {
      console.error(err);
      setLeadSuccess(true);
    } finally {
      setLeadLoading(false);
    }
  };

  const handleApptSubmit = (e) => {
    e.preventDefault();
    setApptSuccess(true);
    showToast('Showroom randevu talebiniz oluşturuldu.');
    setTimeout(() => {
      setShowApptModal(false);
      setApptSuccess(false);
    }, 2500);
  };

  const hasActiveFilters = selectedCategory !== 'all' || selectedDimension !== 'all' || selectedFinish !== 'all' || searchTerm;

  return (
    <div className="corporate-showroom-page">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="showroom-toast-banner animate-fade-in">
          <CheckCircle2 size={18} className="toast-icon" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header / Status Bar */}
      <header className="showroom-top-header">
        <div className="showroom-header-inner">
          <div className="header-left">
            <Link href="/bayi" className="back-to-dealers-btn">
              <ChevronLeft size={16} />
              <span className="back-btn-text">Tüm Bayiler</span>
            </Link>
            <div className="header-brand-summary">
              <span className="crumb-brand">SeramikBak</span>
              <span className="crumb-sep">/</span>
              <span className="crumb-dealer" title={dealer?.name}>{dealer?.name}</span>
            </div>
          </div>

          <div className="header-right">
            {dealer?.phone && (
              <a href={`tel:${dealer.phone}`} className="header-contact-pill" title="Showroomu Ara">
                <Phone size={14} />
                <span className="btn-label-desktop">{dealer.phone}</span>
              </a>
            )}
            
            <button 
              onClick={() => setShowQrModal(true)} 
              className="header-action-btn"
              title="Masaüstü QR Kodu"
            >
              <QrCode size={15} />
              <span className="btn-label-desktop">Masa QR</span>
            </button>

            <button 
              onClick={() => setShowCartDrawer(true)} 
              className="header-cart-btn"
              title="Teklif Sepetim"
            >
              <FileText size={15} />
              <span className="btn-label-desktop">Teklif Sepeti</span>
              {quoteCart.length > 0 && (
                <span className="cart-counter-badge">{quoteCart.length}</span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Section 1: Hero Section (Dynamic & Symmetrical) */}
      <section className="showroom-hero-section">
        <div className="showroom-hero-container">
          {/* Left Column: Dealer Information */}
          <div className="hero-left-column">
            <div className="hero-dealer-badge">
              <ShieldCheck size={15} className="badge-shield-icon" />
              <span>{heroBadge}</span>
            </div>

            <h1 className="hero-dealer-title">{heroTitle}</h1>

            <p className="hero-dealer-description">{heroDescription}</p>

            <div className="hero-cta-group">
              <a href="#katalog" className="hero-btn-primary">
                <span>{heroPrimaryBtnText}</span>
                <ArrowRight size={17} />
              </a>
              <button 
                onClick={() => {
                  setSelectedProductForLead(null);
                  setShowLeadModal(true);
                }} 
                className="hero-btn-secondary"
              >
                <span>{heroSecondaryBtnText}</span>
              </button>
            </div>

            <div className="hero-meta-badges">
              <div className="hero-meta-item">
                <MapPin size={15} className="meta-pin-icon" />
                <span>{dealer?.address ? `${dealer.name} • ${dealer.city || 'Merkez'}` : `${dealer.name} • ${dealer.city || 'Merkez Showroom'}`}</span>
              </div>
              <div className="hero-meta-item">
                <Clock size={15} className="meta-clock-icon" />
                <span className="status-open-pill">Açık</span>
                <span>{workingDays} • {workingHours}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Card with Cursive Signature */}
          <div className="hero-right-column">
            <div className="hero-card-visual-wrapper">
              <img 
                src={heroImage} 
                alt={dealer?.name || 'Showroom Banyo'} 
                className="hero-main-card-img"
              />
              <div className="hero-cursive-quote-badge">
                <p className="cursive-quote-text">{heroCursiveQuote}</p>
                <span className="cursive-quote-sub">{heroCursiveSub}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: 4 Feature Pillars Bar (Symmetrical 2x2 on Mobile, 4-Col Desktop) */}
      <section className="feature-pillars-bar">
        <div className="feature-pillars-container">
          {featurePillars.map((pillar, idx) => {
            const icons = [
              <Package key="1" size={20} />,
              <Sparkles key="2" size={20} />,
              <Layers key="3" size={20} />,
              <CheckCircle2 key="4" size={20} />
            ];
            return (
              <div key={idx} className="feature-pillar-card">
                <div className="pillar-icon-box">
                  {icons[idx] || <CheckCircle2 size={20} />}
                </div>
                <div className="pillar-text-group">
                  <h3 className="pillar-title">{pillar.title}</h3>
                  <p className="pillar-desc">{pillar.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 3: Catalog (Mobile App Controls + Desktop Sidebar + Symmetrical Grid) */}
      <section id="katalog" className="showroom-catalog-section">
        <div className="catalog-layout-container">
          {/* MOBILE APP-LIKE CONTROLS (Rendered above grid on mobile screens) */}
          <div className="mobile-app-catalog-controls">
            {/* Search Input */}
            <div className="mobile-search-box">
              <Search size={16} className="search-input-icon" />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Model, kod veya renk ara..."
                className="mobile-search-input"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="search-clear-btn">
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
                Tümü ({allCatalogProducts.length})
              </button>
              {Object.keys(categoryCounts).filter(k => k !== 'all').map(cat => (
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
                className={`mobile-filter-trigger-btn ${(selectedDimension !== 'all' || selectedFinish !== 'all') ? 'active-filter' : ''}`}
              >
                <SlidersHorizontal size={15} />
                <span>Filtreler {(selectedDimension !== 'all' || selectedFinish !== 'all') ? '•' : ''}</span>
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

          {/* Left Sidebar Filter Bar (Desktop) */}
          <aside className="catalog-sidebar">
            <div className="sidebar-header">
              <div className="sidebar-title-row">
                <SlidersHorizontal size={18} className="sidebar-icon" />
                <h3 className="sidebar-title">Ürünleri Filtrele</h3>
              </div>
              {hasActiveFilters && (
                <button onClick={resetFilters} className="clear-filters-link">
                  Tümünü Temizle
                </button>
              )}
            </div>

            {/* Search Input */}
            <div className="sidebar-search-box">
              <Search size={16} className="search-input-icon" />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Model, kod veya renk ara..."
                className="sidebar-search-input"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="search-clear-btn">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="filter-group">
              <h4 className="filter-group-heading">Kategori</h4>
              <div className="filter-options-list">
                <button 
                  onClick={() => setSelectedCategory('all')}
                  className={`filter-option-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                >
                  <span className="option-label">Tüm Kategoriler</span>
                  <span className="option-count">{allCatalogProducts.length}</span>
                </button>
                {Object.keys(categoryCounts).filter(k => k !== 'all').map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`filter-option-btn ${selectedCategory === cat ? 'active' : ''}`}
                  >
                    <span className="option-label">{cat}</span>
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
                  onClick={() => setSelectedDimension('all')}
                  className={`filter-option-btn ${selectedDimension === 'all' ? 'active' : ''}`}
                >
                  <span className="option-label">Tüm Ebatlar</span>
                  <span className="option-count">{allCatalogProducts.length}</span>
                </button>
                {Object.keys(dimensionCounts).filter(k => k !== 'all').map(dim => (
                  <button 
                    key={dim}
                    onClick={() => setSelectedDimension(dim)}
                    className={`filter-option-btn ${selectedDimension === dim ? 'active' : ''}`}
                  >
                    <span className="option-label">{dim}</span>
                    <span className="option-count">{dimensionCounts[dim]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Surface/Finish Filter */}
            <div className="filter-group">
              <h4 className="filter-group-heading">Yüzey Dokusu</h4>
              <div className="filter-options-list">
                <button 
                  onClick={() => setSelectedFinish('all')}
                  className={`filter-option-btn ${selectedFinish === 'all' ? 'active' : ''}`}
                >
                  <span className="option-label">Tüm Yüzeyler</span>
                  <span className="option-count">{allCatalogProducts.length}</span>
                </button>
                {Object.keys(finishCounts).filter(k => k !== 'all').map(finish => (
                  <button 
                    key={finish}
                    onClick={() => setSelectedFinish(finish)}
                    className={`filter-option-btn ${selectedFinish === finish ? 'active' : ''}`}
                  >
                    <span className="option-label">{finish}</span>
                    <span className="option-count">{finishCounts[finish]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Architect & Consultation Card */}
            <div className="sidebar-consultation-card">
              <div className="consult-badge">MİMARİ DESTEK</div>
              <h5 className="consult-title">{consultationTitle}</h5>
              <p className="consult-desc">{consultationDesc}</p>
              <button 
                onClick={() => setShowApptModal(true)} 
                className="consult-action-btn"
              >
                <Calendar size={14} />
                <span>Showroom Randevusu</span>
              </button>
            </div>
          </aside>

          {/* Right Product Grid Area */}
          <main className="catalog-main-content">
            <div className="catalog-header-bar desktop-only-header">
              <div className="catalog-title-meta">
                <h2 className="catalog-section-title">{catalogTitle}</h2>
                <span className="catalog-count-pill">
                  {filteredProducts.length} Ürün Listeleniyor
                </span>
              </div>

              <div className="catalog-sort-group">
                <span className="sort-label">Sırala:</span>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="catalog-sort-select"
                >
                  <option value="featured">Öne Çıkanlar</option>
                  <option value="name-asc">İsim (A-Z)</option>
                  <option value="price-asc">Fiyat (Önce En Düşük)</option>
                  <option value="price-desc">Fiyat (Önce En Yüksek)</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <div className="catalog-empty-state">
                <Package size={48} className="empty-icon" />
                <h3 className="empty-title">Seçilen Kriterlerde Ürün Bulunamadı</h3>
                <p className="empty-desc">Filtreleri sıfırlayarak tüm showroom koleksiyonunu görüntüleyebilirsiniz.</p>
                <button onClick={resetFilters} className="empty-reset-btn">
                  Filtreleri Sıfırla
                </button>
              </div>
            ) : (
              <div className="catalog-products-grid">
                {filteredProducts.map(product => {
                  const isFav = favorites.includes(product.id);
                  const isFeaturedItem = product.isFeatured;

                  return (
                    <div key={product.id} className="catalog-product-card">
                      {/* Image & Top Badges */}
                      <div className="product-card-media">
                        <div className="card-top-badges">
                          {isFeaturedItem ? (
                            <span className="badge-featured">Öne Çıkan</span>
                          ) : (
                            <span className="badge-new">Yeni</span>
                          )}
                        </div>

                        <button 
                          onClick={(e) => toggleFavorite(product.id, e)} 
                          className={`card-fav-btn ${isFav ? 'active' : ''}`}
                          title="Favorilere Ekle"
                        >
                          <Heart size={15} fill={isFav ? '#e11d48' : 'none'} stroke={isFav ? '#e11d48' : '#64748b'} />
                        </button>

                        <img 
                          src={product.imageUrl} 
                          alt={product.name} 
                          className="product-card-img"
                          loading="lazy"
                        />
                      </div>

                      {/* Info & Spec Tags */}
                      <div className="product-card-body">
                        <div className="product-meta-sub">
                          <span className="product-category-text">{product.categoryName}</span>
                          <span className="product-dim-text">{product.dimensionText}</span>
                        </div>

                        <h3 className="product-card-name" title={product.name}>
                          {product.name}
                        </h3>

                        <div className="product-chips-row">
                          <span className="spec-chip">{product.finishText}</span>
                          <span className="spec-chip chip-quality">1. Kalite</span>
                        </div>

                        <div className="product-price-row">
                          {product.displayPrice ? (
                            <div className="price-box">
                              <span className="price-currency">₺</span>
                              <span className="price-val">{Number(product.displayPrice).toLocaleString('tr-TR')}</span>
                              <span className="price-unit">/m²</span>
                            </div>
                          ) : (
                            <span className="price-ask">Fiyat Teklifi Alınız</span>
                          )}
                        </div>

                        {/* Symmetrical Action Buttons */}
                        <div className="product-card-actions">
                          <Link 
                            href={`/tasarim?product=${product.id}&dealer=${dealer.id}`}
                            className="card-action-btn-3d"
                          >
                            <Sparkles size={13} />
                            <span>3D Gör</span>
                          </Link>

                          <button 
                            onClick={(e) => addToQuoteCart(product, e)}
                            className="card-action-btn-quote"
                            title="Teklif Listeme Ekle"
                          >
                            <Plus size={13} />
                            <span>Teklif</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </section>

      {/* Section 4: AI "Mekanını Tasarla" Promo Banner (Mobile Responsive) */}
      <section className="ai-designer-banner-section">
        <div className="ai-designer-banner-card">
          {/* Left: Tag + Headline + CTA */}
          <div className="ai-banner-content-col">
            <div className="ai-banner-pill">
              <Sparkles size={14} className="sparkle-gold" />
              <span>{aiBadge}</span>
            </div>

            <h2 className="ai-banner-headline">{aiTitle}</h2>

            <p className="ai-banner-subtext">{aiDesc}</p>

            <Link href="/tasarim" className="ai-banner-cta-btn">
              <span>{aiBtnText}</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Center: Before & After Split Image Comparison */}
          <div className="ai-banner-visual-col">
            <div className="ai-split-preview-box">
              <div className="split-side split-before">
                <img src="/textures/sample_bathroom.png" alt="Mevcut Görünüm" className="split-img" />
                <span className="split-tag">Mevcut Görünüm</span>
              </div>
              <div className="split-divider-line">
                <span className="split-pill-center">AI</span>
              </div>
              <div className="split-side split-after">
                <img src="/renders/luxury_bathroom_calacatta_gold.jpg" alt="AI ile Yenilenmiş" className="split-img" />
                <span className="split-tag tag-after">AI ile Yenilenmiş</span>
              </div>
            </div>
          </div>

          {/* Right: Feature Bullet Points */}
          <div className="ai-banner-features-col">
            {aiBullets.map((bullet, idx) => (
              <div key={idx} className="ai-bullet-item">
                <div className="bullet-check-circle">
                  <Check size={13} />
                </div>
                <div className="bullet-text">
                  <strong>{bullet.title}</strong>
                  <p>{bullet.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5: Active Campaigns Strip */}
      <section className="showroom-campaigns-strip">
        <div className="campaigns-strip-container">
          <div className="campaign-row-header">
            <div>
              <span className="campaign-mini-tag">ÖZEL AYRICALIKLAR</span>
              <h3 className="campaign-main-title">{sc.campaignsTitle || 'Aktif Showroom Kampanyaları'}</h3>
            </div>
            <p className="campaign-desc-lead">
              {sc.campaignsSubtitle || `${dealer?.name || 'Showroomumuz'} bünyesinde projelerinize değer katan kurumsal avantajlar.`}
            </p>
          </div>

          <div className="campaign-cards-grid">
            {campaignsList.map((camp, idx) => (
              <div key={idx} className={`campaign-modern-card ${camp.isHighlight ? 'highlight-card' : ''}`}>
                <div className="campaign-card-header">
                  <span className={`campaign-tag-badge ${camp.isHighlight ? 'highlight-tag' : ''}`}>{camp.tag}</span>
                  <span className={`campaign-percent-badge ${camp.isHighlight ? 'highlight-pill' : ''}`}>{camp.percent}</span>
                </div>
                <h4 className="campaign-card-title">{camp.title}</h4>
                <p className="campaign-card-p">{camp.desc}</p>
                <div className="campaign-card-footer">
                  <span className="campaign-expiry">{camp.expiry}</span>
                  {camp.action === 'appt' ? (
                    <button onClick={() => setShowApptModal(true)} className="campaign-btn-link">
                      Randevu Al →
                    </button>
                  ) : camp.action === 'katalog' ? (
                    <a href="#katalog" className="campaign-btn-link">
                      Ürünleri Gör →
                    </a>
                  ) : (
                    <button onClick={() => setShowLeadModal(true)} className="campaign-btn-link">
                      Teklif İste →
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 6: Showroom Location & Virtual Tour */}
      <section className="showroom-location-section">
        <div className="showroom-location-container">
          <div className="location-info-col">
            <span className="location-pill-tag">BİZİ ZİYARET EDİN</span>
            <h3 className="location-dealer-name">{dealer?.name}</h3>
            
            <div className="location-details-list">
              <div className="loc-item">
                <MapPin size={18} className="loc-icon" />
                <div>
                  <strong>Showroom Adresi</strong>
                  <p>{dealer?.address || 'Merkez Showroom, Türkiye'}</p>
                </div>
              </div>

              {dealer?.phone && (
                <div className="loc-item">
                  <Phone size={18} className="loc-icon" />
                  <div>
                    <strong>Telefon & İletişim</strong>
                    <p>{dealer.phone}</p>
                  </div>
                </div>
              )}

              {dealer?.email && (
                <div className="loc-item">
                  <Mail size={18} className="loc-icon" />
                  <div>
                    <strong>Kurumsal E-Posta</strong>
                    <p>{dealer.email}</p>
                  </div>
                </div>
              )}

              <div className="loc-item">
                <Clock size={18} className="loc-icon" />
                <div>
                  <strong>Çalışma Saatleri</strong>
                  <p>{workingDays}: {workingHours}</p>
                </div>
              </div>
            </div>

            <div className="loc-actions-row">
              {customMapsUrl && (
                <a 
                  href={customMapsUrl}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="loc-maps-btn"
                >
                  <Navigation size={15} />
                  <span>Haritada Aç</span>
                </a>
              )}
              <button onClick={() => setShowApptModal(true)} className="loc-appt-btn">
                <Calendar size={15} />
                <span>Randevu Al</span>
              </button>
            </div>
          </div>

          <div className="location-visual-col">
            {dealer?.virtualTourUrl ? (
              <div className="virtual-tour-embed-card">
                <iframe 
                  src={dealer.virtualTourUrl} 
                  title="Showroom 3D Sanal Tur"
                  className="matterport-iframe"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="location-map-placeholder-card">
                <img 
                  src="/hero/modern_living.png" 
                  alt="Showroom Lokasyon" 
                  className="map-fallback-img"
                />
                <div className="map-overlay-badge">
                  <Building2 size={22} className="map-badge-icon" />
                  <div>
                    <h4>{dealer?.name} Showroom</h4>
                    <p>Prestijli mekan tasarımları için sizleri ağırlamaktan mutluluk duyarız.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Section 7: Mobile App Sticky Navigation Action Bar */}
      <div className="showroom-bottom-action-bar">
        <div className="bottom-bar-inner">
          <a 
            href={`https://wa.me/${dealerWhatsAppPhone}?text=${encodeURIComponent(whatsappGreeting)}`}
            target="_blank" 
            rel="noopener noreferrer"
            className="bottom-action-btn btn-whatsapp"
          >
            <MessageSquare size={17} />
            <span>WhatsApp</span>
          </a>

          {customMapsUrl ? (
            <a 
              href={customMapsUrl}
              target="_blank" 
              rel="noopener noreferrer"
              className="bottom-action-btn btn-directions"
            >
              <Navigation size={17} />
              <span>Yol Tarifi</span>
            </a>
          ) : (
            <button 
              onClick={() => setShowApptModal(true)}
              className="bottom-action-btn btn-directions"
            >
              <Calendar size={17} />
              <span>Randevu</span>
            </button>
          )}

          <button 
            onClick={() => {
              setSelectedProductForLead(null);
              setShowLeadModal(true);
            }} 
            className="bottom-action-btn btn-quote"
          >
            <FileText size={17} />
            <span>Teklif Al</span>
          </button>
        </div>
      </div>

      {/* MOBILE BOTTOM SHEET MODAL: Filter Sheet */}
      {showMobileFilterModal && (
        <div className="showroom-modal-backdrop mobile-bottom-sheet-backdrop" onClick={() => setShowMobileFilterModal(false)}>
          <div className="mobile-bottom-sheet animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="bottom-sheet-header">
              <div className="sheet-title-group">
                <SlidersHorizontal size={18} className="sheet-icon" />
                <h4 className="sheet-title">Detaylı Filtreler</h4>
              </div>
              <div className="sheet-actions-right">
                {hasActiveFilters && (
                  <button onClick={resetFilters} className="sheet-reset-btn">
                    Temizle
                  </button>
                )}
                <button onClick={() => setShowMobileFilterModal(false)} className="sheet-close-btn">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="bottom-sheet-body">
              {/* Dimension Filter */}
              <div className="sheet-filter-group">
                <h5 className="sheet-group-heading">Ölçü (cm)</h5>
                <div className="sheet-chips-grid">
                  <button 
                    onClick={() => setSelectedDimension('all')} 
                    className={`sheet-chip ${selectedDimension === 'all' ? 'active' : ''}`}
                  >
                    Tümü ({allCatalogProducts.length})
                  </button>
                  {Object.keys(dimensionCounts).filter(k => k !== 'all').map(dim => (
                    <button 
                      key={dim}
                      onClick={() => setSelectedDimension(dim)}
                      className={`sheet-chip ${selectedDimension === dim ? 'active' : ''}`}
                    >
                      {dim} ({dimensionCounts[dim]})
                    </button>
                  ))}
                </div>
              </div>

              {/* Surface Finish Filter */}
              <div className="sheet-filter-group">
                <h5 className="sheet-group-heading">Yüzey Dokusu</h5>
                <div className="sheet-chips-grid">
                  <button 
                    onClick={() => setSelectedFinish('all')} 
                    className={`sheet-chip ${selectedFinish === 'all' ? 'active' : ''}`}
                  >
                    Tümü ({allCatalogProducts.length})
                  </button>
                  {Object.keys(finishCounts).filter(k => k !== 'all').map(finish => (
                    <button 
                      key={finish}
                      onClick={() => setSelectedFinish(finish)}
                      className={`sheet-chip ${selectedFinish === finish ? 'active' : ''}`}
                    >
                      {finish} ({finishCounts[finish]})
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bottom-sheet-footer">
              <button 
                onClick={() => setShowMobileFilterModal(false)}
                className="sheet-apply-btn"
              >
                Sonuçları Göster ({filteredProducts.length} Ürün)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DRAWER: Quote Cart Drawer */}
      {showCartDrawer && (
        <div className="showroom-modal-backdrop" onClick={() => setShowCartDrawer(false)}>
          <div className="cart-drawer-sheet animate-slide-left" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <div className="drawer-title-group">
                <FileText size={20} className="drawer-title-icon" />
                <h3>Teklif Sepetim</h3>
                <span className="drawer-count-badge">{quoteCart.length} Kalem</span>
              </div>
              <button onClick={() => setShowCartDrawer(false)} className="drawer-close-btn">
                <X size={20} />
              </button>
            </div>

            <div className="drawer-body">
              {quoteCart.length === 0 ? (
                <div className="drawer-empty-state">
                  <Package size={40} className="drawer-empty-icon" />
                  <h4>Sepetiniz Boş</h4>
                  <p>Katalogdan beğendiğiniz seramikleri "Teklif Ekle" butonuna basarak sepetinize ekleyebilirsiniz.</p>
                  <button onClick={() => setShowCartDrawer(false)} className="drawer-browse-btn">
                    Ürünleri Keşfet
                  </button>
                </div>
              ) : (
                <div className="drawer-items-list">
                  {quoteCart.map(item => (
                    <div key={item.product.id} className="drawer-product-row">
                      <img src={item.product.imageUrl} alt={item.product.name} className="drawer-prod-thumb" />
                      <div className="drawer-prod-info">
                        <h4 className="drawer-prod-name">{item.product.name}</h4>
                        <span className="drawer-prod-dim">{item.product.dimensionText} • {item.product.finishText}</span>
                        {item.product.displayPrice && (
                          <span className="drawer-prod-price">₺{Number(item.product.displayPrice).toLocaleString('tr-TR')} / m²</span>
                        )}
                        <div className="drawer-qty-controls">
                          <button onClick={() => updateCartQty(item.product.id, -5)} className="qty-btn">
                            <Minus size={12} />
                          </button>
                          <span className="qty-number">{item.quantity} {item.unit}</span>
                          <button onClick={() => updateCartQty(item.product.id, 5)} className="qty-btn">
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                      <button onClick={() => removeFromCart(item.product.id)} className="drawer-remove-btn" title="Kaldır">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}

                  {/* Customer Quick Info */}
                  <div className="drawer-customer-form">
                    <h5 className="form-sub-heading">İletişim Bilgileriniz (Opsiyonel)</h5>
                    <input 
                      type="text" 
                      placeholder="Adınız Soyadınız" 
                      value={cartCustomerName}
                      onChange={(e) => setCartCustomerName(e.target.value)}
                      className="drawer-input"
                    />
                    <input 
                      type="tel" 
                      placeholder="Telefon Numaranız" 
                      value={cartCustomerPhone}
                      onChange={(e) => setCartCustomerPhone(e.target.value)}
                      className="drawer-input"
                    />
                  </div>
                </div>
              )}
            </div>

            {quoteCart.length > 0 && (
              <div className="drawer-footer">
                <button 
                  onClick={handleSendCartWhatsApp} 
                  className="drawer-whatsapp-submit-btn"
                >
                  <MessageSquare size={18} />
                  <span>WhatsApp ile Teklif İste</span>
                </button>
                <p className="drawer-footer-note">
                  Seçtiğiniz ürünlerin listesi doğrudan {dealer?.name} yetkilisine WhatsApp mesajı olarak iletilecektir.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: Quick Quote / Lead Modal */}
      {showLeadModal && (
        <div className="showroom-modal-backdrop" onClick={() => setShowLeadModal(false)}>
          <div className="lead-modal-card animate-zoom-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <div>
                <span className="modal-badge-tag">HIZLI TEKLİF FORMU</span>
                <h3 className="modal-heading">{selectedProductForLead ? selectedProductForLead.name : dealer?.name}</h3>
              </div>
              <button onClick={() => setShowLeadModal(false)} className="modal-close-icon">
                <X size={20} />
              </button>
            </div>

            {leadSuccess ? (
              <div className="modal-success-state">
                <CheckCircle2 size={48} className="success-icon" />
                <h4>Talebiniz Alındı!</h4>
                <p>Showroom temsilcimiz en kısa sürede sizinle iletişime geçerek proforma teklifi iletecektir.</p>
                <button onClick={() => { setShowLeadModal(false); setLeadSuccess(false); }} className="modal-done-btn">
                  Kapat
                </button>
              </div>
            ) : (
              <form onSubmit={handleLeadSubmit} className="lead-form-content">
                <p className="form-info-p">
                  İhtiyacınız olan metraj ve projeniz hakkında kısa bilgi bırakın; uzmanımız en uygun iskonto ile size dönüş yapsın.
                </p>

                <div className="form-field-group">
                  <label>Adınız Soyadınız *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Örn: Ahmet Yılmaz" 
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                    className="modal-input"
                  />
                </div>

                <div className="form-field-group">
                  <label>Telefon Numaranız *</label>
                  <input 
                    type="tel" 
                    required 
                    placeholder="05XX XXX XX XX" 
                    value={leadPhone}
                    onChange={(e) => setLeadPhone(e.target.value)}
                    className="modal-input"
                  />
                </div>

                <div className="form-field-group">
                  <label>E-Posta Adresiniz (Opsiyonel)</label>
                  <input 
                    type="email" 
                    placeholder="ahmet@example.com" 
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    className="modal-input"
                  />
                </div>

                <div className="form-field-group">
                  <label>Proje Notları / Tahmini Metraj (m²)</label>
                  <textarea 
                    rows={3} 
                    placeholder="Örn: 45 m² banyo ve antre zemin seramiği için fiyat teklifi rica ediyorum."
                    value={leadNotes}
                    onChange={(e) => setLeadNotes(e.target.value)}
                    className="modal-textarea"
                  />
                </div>

                <button type="submit" disabled={leadLoading} className="modal-submit-btn">
                  {leadLoading ? 'İletiliyor...' : 'Teklif Talebini Gönder'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL: Showroom Appointment Modal */}
      {showApptModal && (
        <div className="showroom-modal-backdrop" onClick={() => setShowApptModal(false)}>
          <div className="appt-modal-card animate-zoom-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <div>
                <span className="modal-badge-tag">SHOWROOM ZİYARETİ</span>
                <h3 className="modal-heading">VIP Mimar Randevusu</h3>
              </div>
              <button onClick={() => setShowApptModal(false)} className="modal-close-icon">
                <X size={20} />
              </button>
            </div>

            {apptSuccess ? (
              <div className="modal-success-state">
                <CheckCircle2 size={48} className="success-icon" />
                <h4>Randevunuz Alındı!</h4>
                <p>Mimarımız belirtilen tarihte sizin için özel hazırlık yapacaktır.</p>
              </div>
            ) : (
              <form onSubmit={handleApptSubmit} className="appt-form-content">
                <p className="form-info-p">
                  Showroomumuzu ziyaretinizde mimari danışmanımız banyo ve zemin projeniz için hazır bulunacaktır.
                </p>

                <div className="form-field-group">
                  <label>Adınız Soyadınız *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Adınız Soyadınız"
                    value={apptName}
                    onChange={(e) => setApptName(e.target.value)}
                    className="modal-input"
                  />
                </div>

                <div className="form-field-group">
                  <label>Telefon Numaranız *</label>
                  <input 
                    type="tel" 
                    required 
                    placeholder="05XX XXX XX XX"
                    value={apptPhone}
                    onChange={(e) => setApptPhone(e.target.value)}
                    className="modal-input"
                  />
                </div>

                <div className="form-grid-2">
                  <div className="form-field-group">
                    <label>Ziyaret Tarihi *</label>
                    <input 
                      type="date" 
                      required 
                      value={apptDate}
                      onChange={(e) => setApptDate(e.target.value)}
                      className="modal-input"
                    />
                  </div>

                  <div className="form-field-group">
                    <label>Zaman Aralığı</label>
                    <select 
                      value={apptTime} 
                      onChange={(e) => setApptTime(e.target.value)}
                      className="modal-select"
                    >
                      <option>10:00 - 12:00 (Sabah)</option>
                      <option>14:00 - 16:00 (Öğleden Sonra)</option>
                      <option>16:30 - 18:30 (Akşamüstü)</option>
                    </select>
                  </div>
                </div>

                <div className="form-field-group">
                  <label>Özel İstek / Mekan Notları</label>
                  <input 
                    type="text" 
                    placeholder="Örn: Ebeveyn banyosu için Calacatta serisi"
                    value={apptNotes}
                    onChange={(e) => setApptNotes(e.target.value)}
                    className="modal-input"
                  />
                </div>

                <button type="submit" className="modal-submit-btn">
                  Randevuyu Onayla
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL: QR Desk Stand Modal */}
      {showQrModal && (
        <div className="showroom-modal-backdrop" onClick={() => setShowQrModal(false)}>
          <div className="qr-modal-card animate-zoom-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <div>
                <span className="modal-badge-tag">MASAÜSTÜ ERİŞİM</span>
                <h3 className="modal-heading">Showroom Mobil QR</h3>
              </div>
              <button onClick={() => setShowQrModal(false)} className="modal-close-icon">
                <X size={20} />
              </button>
            </div>

            <div className="qr-modal-body">
              <div className="qr-box-inner">
                <div className="qr-display-frame">
                  <QrCode size={180} className="qr-icon-large" />
                </div>
                <h4 className="qr-dealer-label">{dealer?.name}</h4>
                <p className="qr-instruction">
                  Telefonunuzun kamerasını açarak QR kodu okutun; showroom kataloğunu ve 3D tasarımları cebinizde inceleyin.
                </p>
              </div>

              <div className="qr-card-footer">
                <button onClick={() => window.print()} className="qr-print-btn">
                  <span>Yazdır / Masa Standı Yap</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
