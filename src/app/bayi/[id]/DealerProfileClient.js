'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  MapPin, 
  Phone, 
  Sparkles, 
  ChevronLeft, 
  Image as ImageIcon, 
  Send, 
  CheckCircle2, 
  Building2, 
  Compass, 
  Clock, 
  Mail, 
  ArrowRight,
  MessageSquare,
  Star,
  Award,
  TrendingUp,
  ShieldCheck,
  FileText,
  Download,
  Search,
  Truck,
  Wrench,
  Package,
  CreditCard,
  Layers,
  Calculator,
  Flame,
  X,
  QrCode,
  Printer,
  ShoppingBag,
  Calendar,
  Coffee,
  Maximize2,
  Minimize2,
  Plus,
  Minus,
  Trash2,
  Check,
  Eye,
  EyeOff,
  Share2
} from 'lucide-react';
import './dealer-profile.css';

export default function DealerProfileClient({ dealer, products }) {
  const [galleryTab, setGalleryTab] = useState(dealer.virtualTourUrl ? '3d' : 'photos');
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [iframeLoading, setIframeLoading] = useState(true);

  // Kiosk & Tablet Presentation Mode states
  const [kioskMode, setKioskMode] = useState(false);
  const [showPricesInKiosk, setShowPricesInKiosk] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Quote Cart states
  const [quoteCart, setQuoteCart] = useState([]);
  const [showCartDrawer, setShowCartDrawer] = useState(false);

  // Appointment Modal states
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [apptName, setApptName] = useState('');
  const [apptPhone, setApptPhone] = useState('');
  const [apptDate, setApptDate] = useState('');
  const [apptTimeSlot, setApptTimeSlot] = useState('14:00 - 16:00 (Öğleden Sonra)');
  const [apptProjectType, setApptProjectType] = useState('Banyo Yenileme');
  const [apptNotes, setApptNotes] = useState('');
  const [apptSuccess, setApptSuccess] = useState(false);

  // QR Modal states
  const [showQrModal, setShowQrModal] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');

  // Live showroom open/closed status
  const [isOpenNow, setIsOpenNow] = useState(true);

  const handleTabChange = (tab) => {
    setGalleryTab(tab);
    if (tab === '3d') {
      setIframeLoading(true);
    }
  };
  
  // Lead form states
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Calculator modal states
  const [showCalculatorModal, setShowCalculatorModal] = useState(false);
  const [calcWidth, setCalcWidth] = useState('');
  const [calcLength, setCalcLength] = useState('');
  const [calcHeight, setCalcHeight] = useState('');
  const [calcWastePercent, setCalcWastePercent] = useState(10);

  const images = dealer.showroomImages ? dealer.showroomImages.split(',').filter(Boolean) : [];
  const concepts = dealer.specialConcepts ? dealer.specialConcepts.split(',').filter(Boolean) : [];
  const bannerBgImage = dealer.bannerUrl || (images.length > 0 ? images[0] : '/images/dealer-banner-default.jpg');

  // Inventory search & filter states
  const [inventorySearchTerm, setInventorySearchTerm] = useState('');
  const [inventoryStyleFilter, setInventoryStyleFilter] = useState('all');
  const [inventoryStatusFilter, setInventoryStatusFilter] = useState('all');

  const safeParseJSON = (val, fallback) => {
    if (val === null || val === undefined || val === '') return fallback;
    if (typeof val === 'object') return val;
    try {
      return JSON.parse(val);
    } catch (e) {
      return fallback;
    }
  };

  const featuredProductIds = safeParseJSON(dealer.featuredProducts, []);
  const featuredIdsNormalized = Array.isArray(featuredProductIds)
    ? featuredProductIds.map(item => (typeof item === 'object' && item !== null ? item.id : item))
    : [];

  const campaigns = safeParseJSON(dealer.dealerCampaigns, []);
  const referenceProjects = safeParseJSON(dealer.referenceProjects, []);
  const faqs = safeParseJSON(dealer.dealerFaqs, []);
  const dealerStats = safeParseJSON(dealer.dealerStats, { experience: '10+ Yıl', happyClients: '500+', showroomArea: '200 m²' });
  const servicesList = dealer.logisticsServices ? dealer.logisticsServices.split(',').filter(Boolean) : [];

  const featuredProductsList = products.filter(p => featuredIdsNormalized.includes(p.id));

  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const trackAction = (action) => {
    if (!dealer?.id) return;
    try {
      fetch('/api/analytics/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, dealerId: dealer.id, city: dealer.city })
      }).catch(() => {});
    } catch (e) {}
  };

  const getTextureFallback = (prod) => {
    if (!prod) return '/textures/calacatta_gold.jpg';
    const str = `${prod.style || ''} ${prod.color || ''} ${prod.name || ''}`.toLowerCase();
    if (str.includes('ahşap') || str.includes('wood') || str.includes('oak') || str.includes('teak')) {
      return '/textures/natural_oak.jpg';
    }
    if (str.includes('beton') || str.includes('concrete') || str.includes('cement') || str.includes('stark')) {
      return '/textures/concrete_light_grey.jpg';
    }
    if (str.includes('taş') || str.includes('stone') || str.includes('traver') || str.includes('bej') || str.includes('beige') || str.includes('roca')) {
      return '/textures/vista_bej.jpg';
    }
    if (str.includes('antrasit') || str.includes('fume') || str.includes('charcoal') || str.includes('dark') || str.includes('grey') || str.includes('gray')) {
      return '/textures/albatros_antrasit.jpg';
    }
    return '/textures/calacatta_gold.jpg';
  };

  useEffect(() => {
    if (dealer?.id) {
      trackAction('VIEW');
    }
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
      const hour = new Date().getHours();
      setIsOpenNow(hour >= 9 && hour < 19);

      try {
        const saved = localStorage.getItem(`seramikbak_cart_${dealer.id}`);
        if (saved) {
          setQuoteCart(JSON.parse(saved));
        }
      } catch (e) {}
    }
  }, [dealer?.id]);

  const saveCart = (newCart) => {
    setQuoteCart(newCart);
    try {
      localStorage.setItem(`seramikbak_cart_${dealer.id}`, JSON.stringify(newCart));
    } catch (e) {}
  };

  const addToCart = (product, defaultM2 = 30) => {
    const existingIndex = quoteCart.findIndex(item => item.id === product.id);
    let updated;
    if (existingIndex > -1) {
      updated = [...quoteCart];
      updated[existingIndex].m2 = (parseFloat(updated[existingIndex].m2) || 0) + defaultM2;
    } else {
      updated = [
        ...quoteCart,
        {
          id: product.id,
          name: product.name,
          code: product.code || '',
          style: product.style || '',
          finish: product.finish || '',
          width: product.width || 60,
          height: product.height || 120,
          price: product.price || product.unitPrice || 0,
          imageUrl: product.imageUrl || getTextureFallback(product),
          m2: defaultM2
        }
      ];
    }
    saveCart(updated);
    setShowCartDrawer(true);
    trackAction('ADD_TO_CART');
  };

  const removeFromCart = (id) => {
    const updated = quoteCart.filter(item => item.id !== id);
    saveCart(updated);
  };

  const updateCartM2 = (id, delta) => {
    const updated = quoteCart.map(item => {
      if (item.id === id) {
        const newM2 = Math.max(1, (parseFloat(item.m2) || 0) + delta);
        return { ...item, m2: newM2 };
      }
      return item;
    });
    saveCart(updated);
  };

  const clearCart = () => {
    saveCart([]);
  };

  const toggleFullscreen = () => {
    if (typeof document === 'undefined') return;
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    }
  };

  const sendCartToWhatsApp = () => {
    if (quoteCart.length === 0) return;
    const cleanPhone = (dealer.phone || '').replace(/[\s\-\(\)\+]/g, '');
    let totalM2 = 0;
    let totalEstimatedPrice = 0;
    let hasPrice = false;

    const itemsText = quoteCart.map((item, idx) => {
      const m2 = parseFloat(item.m2) || 30;
      totalM2 += m2;
      const itemPrice = parseFloat(item.price) || 0;
      if (itemPrice > 0) {
        hasPrice = true;
        totalEstimatedPrice += itemPrice * m2;
      }
      return `${idx + 1}) *${item.name}* (${item.code ? `Kod: ${item.code}, ` : ''}${item.width}x${item.height} cm) - *${m2} m²*` + (itemPrice > 0 ? ` [₺${itemPrice.toLocaleString('tr-TR')}/m²]` : '');
    }).join('\n');

    const grossTileM2 = totalM2 * 1.1; // 10% fire
    const totalKalekimBags = Math.ceil((grossTileM2 * 4.5) / 25);
    const totalGroutKg = Math.ceil(grossTileM2 * 0.45);
    const totalBoxes = Math.ceil(grossTileM2 / 1.44);

    let msg = `*SERAMİK TEKLİF & SİPARİŞ LİSTESİ*\n` +
      `*${dealer.name}* Yetkili Showroom'una\n` +
      `─────────────────────────────\n` +
      `Merhaba, SeramikBak showroom profilinizden seçtiğim ürünler için stok teyidi ve en uygun fiyat teklifinizi rica ediyorum:\n\n` +
      `*SEÇİLEN SERAMİKLER:*\n${itemsText}\n\n` +
      `*TOPLAM METRAJ & ŞANTİYE İHTİYACI:*\n` +
      `• Net İhtiyaç: *${totalM2.toFixed(1)} m²*\n` +
      `• Fireli Sipariş: *${grossTileM2.toFixed(1)} m²* (~${totalBoxes} Kutu)\n` +
      `• Tahmini Yapıştırıcı (Kalekim): *${totalKalekimBags} Torba* (25kg Flex)\n` +
      `• Tahmini Derz Dolgusu: *${totalGroutKg} kg*\n` +
      (hasPrice ? `• Tahmini Malzeme Tutarı: *₺${totalEstimatedPrice.toLocaleString('tr-TR')}*\n` : '') +
      `─────────────────────────────\n` +
      `Depo stok durumunuzu ve teslimat sürenizi öğrenebilir miyim? Teşekkürler.`;

    const encoded = encodeURIComponent(msg);
    const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    trackAction('WHATSAPP_CART_QUOTE');
    window.open(waUrl, '_blank');
  };

  const fillLeadFormWithCart = () => {
    let summary = quoteCart.map(i => `${i.name} (${i.code || i.width + 'x' + i.height}) - ${i.m2} m²`).join(', ');
    setNotes(prev => prev ? `${prev} • Sepet: ${summary}` : `Seçilen Seramikler: ${summary}`);
    setShowCartDrawer(false);
    const el = document.getElementById('quote-form-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAppointmentSubmit = async (e) => {
    e.preventDefault();
    if (!apptName || !apptPhone || !apptDate) return;

    try {
      fetch('/api/leads/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealerId: dealer.id,
          clientName: apptName,
          clientPhone: apptPhone,
          clientEmail: 'randevu@seramikbak.com',
          notes: `[SHOWROOM VIP RANDEVU] Tarih: ${apptDate}, Saat Dilimi: ${apptTimeSlot}, Proje Türü: ${apptProjectType}. Not: ${apptNotes}`
        })
      }).catch(() => {});
    } catch(err) {}

    const cleanPhone = (dealer.phone || '').replace(/[\s\-\(\)\+]/g, '');
    const msg = `*SHOWROOM ZİYARET & 3D MİMAR RANDEVUSU TALEBİ*\n` +
      `*${dealer.name}* Mağazasına\n` +
      `─────────────────────────────\n` +
      `Merhaba, Seramik showroomunuzu ziyaret edip 3D mimari banyo danışmanlığı eşliğinde seramik seçmek için randevu oluşturmak istiyorum:\n\n` +
      `• *Müşteri:* ${apptName}\n` +
      `• *Telefon:* ${apptPhone}\n` +
      `• *Tarih:* ${apptDate}\n` +
      `• *Tercih Edilen Saat:* ${apptTimeSlot}\n` +
      `• *Proje Türü:* ${apptProjectType}\n` +
      (apptNotes ? `• *Özel Not:* ${apptNotes}\n` : '') +
      `─────────────────────────────\n` +
      `Randevu müsaitliğinizi teyit eder misiniz? Teşekkürler.`;

    setApptSuccess(true);
    trackAction('APPOINTMENT_REQUEST');

    setTimeout(() => {
      const encoded = encodeURIComponent(msg);
      const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
      window.open(waUrl, '_blank');
      setShowAppointmentModal(false);
      setApptSuccess(false);
    }, 1200);
  };

  const handleFeatureClick = (prodId) => {
    setSelectedProductId(prodId);
    const element = document.getElementById('quote-form-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const isPanoramicImage = dealer.virtualTourUrl && 
    (/\.(jpg|jpeg|png|webp|gif)($|\?)/i.test(dealer.virtualTourUrl) || 
     dealer.virtualTourUrl.includes('res.cloudinary.com') ||
     dealer.virtualTourUrl.includes('/uploads/showroom/') ||
     dealer.virtualTourUrl.startsWith('data:image/'));

  useEffect(() => {
    if (galleryTab === '3d' && isPanoramicImage) {
      setIframeLoading(true);
      // 1. Check/load CSS
      if (!document.getElementById('pannellum-css')) {
        const link = document.createElement('link');
        link.id = 'pannellum-css';
        link.rel = 'stylesheet';
        link.href = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css';
        document.head.appendChild(link);
      }

      // 2. Load script & initialize
      const initViewer = () => {
        const container = document.getElementById('panorama-container');
        if (container) {
          container.innerHTML = ''; // Clean previous DOM leftovers
        }
        if (window.pannellum) {
          window.pannellum.viewer('panorama-container', {
            type: 'equirectangular',
            panorama: dealer.virtualTourUrl,
            autoLoad: true,
            compass: false,
            mouseZoom: true
          });
          setIframeLoading(false);
        }
      };

      if (!window.pannellum) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js';
        script.onload = initViewer;
        document.body.appendChild(script);
      } else {
        setTimeout(initViewer, 100);
      }
    }
  }, [galleryTab, dealer.virtualTourUrl, isPanoramicImage]);

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    if (!clientName || !clientPhone || !clientEmail || !selectedProductId) {
      setErrorMsg('Lütfen tüm zorunlu alanları doldurun.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/leads/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProductId,
          dealerId: dealer.id,
          clientName,
          clientPhone,
          clientEmail,
          notes
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg('Teklif talebiniz bayimize başarıyla ulaştırılmıştır! En kısa sürede sizinle iletişime geçilecektir.');
        setClientName('');
        setClientPhone('');
        setClientEmail('');
        setNotes('');
      } else {
        setErrorMsg(data.error || 'Teklif talebi gönderilemedi.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Bağlantı hatası oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const hexToRgb = (hex) => {
    if (!hex) return '212, 175, 55';
    let c = hex.replace('#', '');
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    const num = parseInt(c, 16);
    return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
  };

  const primaryColor = dealer.themePrimary || '#d4af37';
  const primaryRgb = hexToRgb(primaryColor);

  // Parse Background Color from themePreset (Format: PRESET|#hex)
  const rawTheme = dealer.themePreset || 'GOLD|#f8f9fc';
  const themeParts = rawTheme.split('|');
  const bgColor = themeParts[1] || '#f8f9fc';

  const isColorDark = (hex) => {
    if (!hex) return false;
    let c = hex.replace('#', '');
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    const num = parseInt(c, 16);
    if (isNaN(num)) return false;
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness < 130;
  };

  const isDarkTheme = isColorDark(bgColor);

  return (
    <div 
      className={`profile-page-wrapper ${isDarkTheme ? 'dark-theme-mode' : 'light-theme-mode'} ${kioskMode ? 'kiosk-mode-active' : ''}`} 
      style={{ 
        '--accent-gold': primaryColor, 
        '--accent-gold-rgb': primaryRgb,
        '--bg-dark': bgColor,
        backgroundColor: bgColor 
      }}
    >
      {/* Header Bar */}
      <div className="profile-header-bar">
        <Link href="/" className="back-link">
          <ChevronLeft size={16} />
          <span>Geri Dön</span>
        </Link>
        <div className="header-title-container">
          <div className="official-dealer-badge">
            <span className="dealer-badge-seal">
              <ShieldCheck size={13} strokeWidth={2.6} />
            </span>
            <span className="dealer-badge-title">Yetkili Bayi</span>
            <span className="dealer-badge-tag">
              <span className={`dealer-badge-live-dot ${isOpenNow ? 'online' : 'away'}`}></span>
              <span>{isOpenNow ? 'Açık' : 'Yarın 09:00'}</span>
            </span>
          </div>
        </div>
        <div className="header-quick-tools">
          <button
            type="button"
            onClick={() => setKioskMode(!kioskMode)}
            className={`btn-header-tool ${kioskMode ? 'active-kiosk' : ''}`}
            title="Showroom iPad / TV için Müşteri Satış Sunum Modu"
          >
            <Maximize2 size={14} />
            <span className="hide-mobile">{kioskMode ? 'Kiosk Açık' : 'Kiosk Satış'}</span>
          </button>
          <button
            type="button"
            onClick={() => setShowQrModal(true)}
            className="btn-header-tool"
            title="Masa Üstü Showroom QR Standı & Dijital Kartvizit"
          >
            <QrCode size={14} />
            <span className="hide-mobile">Masa QR</span>
          </button>
          {quoteCart.length > 0 && (
            <button
              type="button"
              onClick={() => setShowCartDrawer(true)}
              className="btn-header-tool cart-highlight"
              title="Seçilen Seramikler ve Teklif Listesi"
            >
              <ShoppingBag size={14} />
              <span>Teklif ({quoteCart.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* KIOSK / PRESENTATION MODE TOP CONTROLLER BAR */}
      {kioskMode && (
        <div className="kiosk-top-control-bar animate-fade-in">
          <div className="kiosk-brand-info">
            <span className="kiosk-live-dot"></span>
            <span className="kiosk-tag">SHOWROOM SATIŞ & DİJİTAL SUNUM MODU</span>
            <span className="kiosk-store-name">{dealer.name}</span>
          </div>
          <div className="kiosk-actions">
            <button
              type="button"
              onClick={() => setShowPricesInKiosk(!showPricesInKiosk)}
              className="kiosk-btn"
              title="Fiyatları Gizle / Göster"
            >
              {showPricesInKiosk ? <Eye size={14} /> : <EyeOff size={14} />}
              <span>{showPricesInKiosk ? 'Fiyatlar Açık' : 'Fiyatlar Gizli'}</span>
            </button>
            <button
              type="button"
              onClick={toggleFullscreen}
              className="kiosk-btn"
              title="Tam Ekran Aç / Kapa"
            >
              {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              <span>{isFullscreen ? 'Küçült' : 'Tam Ekran'}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowQrModal(true)}
              className="kiosk-btn"
            >
              <QrCode size={14} />
              <span>Müşteri QR</span>
            </button>
            <Link
              href="/?tab=studio#studio"
              className="kiosk-btn gold"
            >
              <Sparkles size={14} />
              <span>3D Banyo Stüdyosu</span>
            </Link>
            <button
              type="button"
              onClick={() => setKioskMode(false)}
              className="kiosk-btn exit"
            >
              <X size={14} />
              <span>Kiosk'tan Çık</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="profile-main-container">
        
        {/* Profile Card & Info Header — PREMIUM CINEMATIC HERO */}
        <div 
          className="profile-banner-card animate-fade-in"
          style={{
            backgroundImage: `url('${bannerBgImage}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* AI ERA LIVE STATUS HUD BAR */}
          <div className="ai-hero-live-bar">
            <div className={`ai-status-pill ${isOpenNow ? 'status-open' : 'status-closed'}`}>
              <span className={`live-dot-pulse ${isOpenNow ? 'pulse-green' : 'pulse-amber'}`}></span>
              <span>{isOpenNow ? '🟢 Şu An Açık • Ziyarete Hazır (09:00 - 19:00)' : '🌙 Şu An Kapalı • Yarın 09:00\'da Açılıyor'}</span>
            </div>
            <button 
              type="button"
              onClick={() => setShowAppointmentModal(true)}
              className="ai-badge-pill clickable-pill"
            >
              <Coffee size={12} style={{ color: 'var(--accent-gold)' }} />
              <span>Kahvemizi İçin & Mimar Randevusu</span>
            </button>
            <div className="ai-stock-pill">
              <span>📦 {dealer.inventories?.length || 0}+ Seri Stokta</span>
            </div>
            <button
              type="button"
              onClick={() => setShowQrModal(true)}
              className="ai-badge-pill clickable-pill hide-mobile"
            >
              <QrCode size={12} />
              <span>Masa Standı QR</span>
            </button>
          </div>

          <div className="profile-banner-info">
            <div className="profile-logo-box">
              {dealer.logoUrl ? (
                <img src={dealer.logoUrl} alt={dealer.brand?.name} style={{ maxWidth: '85%', maxHeight: '85%', objectFit: 'contain' }} />
              ) : (
                <Building2 size={36} style={{ color: 'var(--accent-gold)' }} />
              )}
            </div>
            <div className="profile-text-group">
              <div className="profile-badges-row">
                <span className="profile-badge">
                  {dealer.brand?.name || 'QUA Granite'} YETKİLİ SATICISI
                </span>
                <span className="verified-badge">
                  <ShieldCheck size={14} />
                  Onaylı Bayi
                </span>
              </div>
              <h1 className="profile-name">{dealer.name}</h1>
              <div className="profile-location">
                <MapPin size={14} style={{ color: 'var(--accent-gold)', flexShrink: 0 }} />
                <span>{dealer.district}, {dealer.city}</span>
              </div>
              {servicesList.length > 0 && (
                <div className="header-services-badges">
                  {servicesList.map(s => {
                    const labelMap = {
                      studio_3d: '✨ 3D Mimar Destek',
                      shipping: '🚚 Nakliye Desteği',
                      install_support: '🛠️ Usta Desteği',
                      sample_box: '📦 Numune Kargo',
                      credit_card: '💳 Kart Taksiti',
                      b2b_discount: '🏢 Proje İskontosu',
                      showroom_stock: '🏬 Hazır Stok'
                    };
                    return labelMap[s] ? (
                      <span key={s} className="service-badge">
                        {labelMap[s]}
                      </span>
                    ) : null;
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Stats Row */}
          <div className="hero-stats">
            <div className="hero-stat-item">
              <Award size={20} className="stat-icon" />
              <div className="hero-stat-content">
                <span className="stat-number">{dealerStats.experience || '10+ Yıl'}</span>
                <span className="stat-label">Deneyim</span>
              </div>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat-item">
              <TrendingUp size={20} className="stat-icon" />
              <div className="hero-stat-content">
                <span className="stat-number">{dealerStats.happyClients || '500+'}</span>
                <span className="stat-label">Mutlu Müşteri</span>
              </div>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat-item">
              <Building2 size={20} className="stat-icon" />
              <div className="hero-stat-content">
                <span className="stat-number">{dealerStats.showroomArea || '200 m²'}</span>
                <span className="stat-label">Showroom</span>
              </div>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="profile-actions" style={{ zIndex: 1 }}>
            <Link 
              href={featuredProductsList.length > 0 && featuredProductsList[0].code 
                ? `/?code=${encodeURIComponent(featuredProductsList[0].code)}&tab=studio#studio` 
                : "/?tab=studio#studio"} 
              onClick={() => {
                if (featuredProductsList.length > 0) {
                  try {
                    const prod = featuredProductsList[0];
                    const selectedObj = {
                      ...prod,
                      textureUrl: prod.textureUrl || prod.imageUrl || getTextureFallback(prod),
                      imageUrl: prod.imageUrl || prod.textureUrl || getTextureFallback(prod)
                    };
                    localStorage.setItem('seramikbak_preselected_product', JSON.stringify(selectedObj));
                    sessionStorage.setItem('kiosk_selected_product', JSON.stringify(selectedObj));
                  } catch(e) {}
                }
              }}
              className="btn-3d-studio-hero"
            >
              <Sparkles size={15} />
              <span>3D Banyo Stüdyosu'nda Kapla</span>
            </Link>

            <div className="hero-contact-buttons-group">
              <a 
                href={`https://wa.me/${(dealer.phone || '').replace(/[\s\-\(\)\+]/g, '')}?text=Merhaba%2C%20SeramikBak%20profil%20sayfan%C4%B1zdan%20ula%C5%9F%C4%B1yorum.%20Showroom%27daki%20seramikleriniz%20hakk%C4%B1nda%20bilgi%20alabilir%20miyim%3F`} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={() => trackAction('WHATSAPP')}
                className="btn-whatsapp"
              >
                <MessageSquare size={14} />
                <span>WhatsApp</span>
              </a>
              <a 
                href={`tel:${dealer.phone}`}
                onClick={() => trackAction('PHONE')}
                className="btn-call"
              >
                <Phone size={14} />
                <span>Hemen Ara</span>
              </a>
              <a 
                href={`https://www.google.com/maps/dir/?api=1&destination=${dealer.lat},${dealer.lng}`} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={() => trackAction('DIRECTIONS')}
                className="btn-maps"
              >
                <Compass size={14} />
                <span>Yol Tarifi</span>
              </a>
            </div>

            {/* Social Media Links */}
            {(dealer.socialInstagram || dealer.socialFacebook || dealer.socialLinkedin || dealer.socialYoutube || dealer.socialWebsite) && (
              <div className="hero-social-links-row">
                {dealer.socialInstagram && (
                  <a href={dealer.socialInstagram.startsWith('http') ? dealer.socialInstagram : `https://${dealer.socialInstagram}`} target="_blank" rel="noopener noreferrer" className="social-icon-circle-btn" title="Instagram Sayfası">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                  </a>
                )}
                {dealer.socialFacebook && (
                  <a href={dealer.socialFacebook.startsWith('http') ? dealer.socialFacebook : `https://${dealer.socialFacebook}`} target="_blank" rel="noopener noreferrer" className="social-icon-circle-btn" title="Facebook Sayfası">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                  </a>
                )}
                {dealer.socialLinkedin && (
                  <a href={dealer.socialLinkedin.startsWith('http') ? dealer.socialLinkedin : `https://${dealer.socialLinkedin}`} target="_blank" rel="noopener noreferrer" className="social-icon-circle-btn" title="LinkedIn Sayfası">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                  </a>
                )}
                {dealer.socialYoutube && (
                  <a href={dealer.socialYoutube.startsWith('http') ? dealer.socialYoutube : `https://${dealer.socialYoutube}`} target="_blank" rel="noopener noreferrer" className="social-icon-circle-btn" title="YouTube Kanalı">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><polygon points="10 15 15 12 10 9 10 15"/></svg>
                  </a>
                )}
                {dealer.socialWebsite && (
                  <a href={dealer.socialWebsite.startsWith('http') ? dealer.socialWebsite : `https://${dealer.socialWebsite}`} target="_blank" rel="noopener noreferrer" className="social-icon-circle-btn" title="Resmi İnternet Sitesi">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* QUICK STORE ACTIONS & TOOLS BAR */}
        <div className="quick-actions-store-bar">
          <span className="quick-actions-bar-title">⚡ Hızlı Mağaza Araçları:</span>
          <div className="quick-actions-bar-scroll">
            <Link 
              href={featuredProductsList.length > 0 && featuredProductsList[0].code 
                ? `/?code=${encodeURIComponent(featuredProductsList[0].code)}&tab=studio#studio` 
                : "/?tab=studio#studio"}
              className="quick-action-chip primary-chip"
              onClick={() => {
                if (featuredProductsList.length > 0) {
                  try {
                    const prod = featuredProductsList[0];
                    const selectedObj = {
                      ...prod,
                      textureUrl: prod.textureUrl || prod.imageUrl || getTextureFallback(prod),
                      imageUrl: prod.imageUrl || prod.textureUrl || getTextureFallback(prod)
                    };
                    localStorage.setItem('seramikbak_preselected_product', JSON.stringify(selectedObj));
                    sessionStorage.setItem('kiosk_selected_product', JSON.stringify(selectedObj));
                  } catch(e) {}
                }
              }}
            >
              <Sparkles size={14} />
              <span>🎮 3D Banyo Stüdyosu</span>
            </Link>

            <button
              type="button"
              onClick={() => setKioskMode(!kioskMode)}
              className={`quick-action-chip ${kioskMode ? 'gold-chip' : ''}`}
            >
              <Maximize2 size={14} />
              <span>📺 {kioskMode ? 'Kiosk Modundan Çık' : 'Kiosk Satış Modu'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowAppointmentModal(true)}
              className="quick-action-chip highlight-chip"
            >
              <Coffee size={14} style={{ color: '#d4af37' }} />
              <span>☕ Showroom Ziyaret & Mimar Randevusu</span>
            </button>

            <button
              type="button"
              onClick={() => setShowQrModal(true)}
              className="quick-action-chip"
            >
              <QrCode size={14} />
              <span>📱 Masa QR Standı</span>
            </button>

            {quoteCart.length > 0 && (
              <button
                type="button"
                onClick={() => setShowCartDrawer(true)}
                className="quick-action-chip gold-chip"
              >
                <ShoppingBag size={14} />
                <span>🛒 Teklif Sepetim ({quoteCart.length} Ürün)</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                const el = document.querySelector('.featured-products-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="quick-action-chip"
            >
              <Building2 size={14} />
              <span>📦 Stoklu Seramik Envanteri</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const el = document.querySelector('.showroom-outlet-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="quick-action-chip highlight-chip"
            >
              <Flame size={14} style={{ color: '#ef4444' }} />
              <span>🔥 Outlet & Fırsat Karoları</span>
            </button>

            <button
              type="button"
              onClick={() => setShowCalculatorModal(true)}
              className="quick-action-chip gold-chip"
            >
              <Calculator size={14} />
              <span>📐 Metraj & Sarfiyat Hesaplayıcı</span>
            </button>

            {dealer.pdfCatalogUrl ? (
              <a
                href={dealer.pdfCatalogUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="quick-action-chip"
              >
                <FileText size={14} />
                <span>📄 E-Katalog & Broşür</span>
              </a>
            ) : (
              <button
                type="button"
                onClick={() => {
                  const el = document.querySelector('.showroom-services-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="quick-action-chip"
              >
                <FileText size={14} />
                <span>✨ Şube Ayrıcalıkları</span>
              </button>
            )}

            <a
              href={`https://wa.me/${(dealer.phone || '').replace(/[\s\-\(\)\+]/g, '')}?text=Merhaba%2C%20Showroom%20sayfan%C4%B1zdaki%20seramik%20stoklar%C4%B1%20ve%20m%C2%B2%20fiyatlar%C4%B1%20hakk%C4%B1nda%20bilgi%20alabilir%20miyim%3F`}
              target="_blank"
              rel="noopener noreferrer"
              className="quick-action-chip whatsapp-chip"
            >
              <MessageSquare size={14} />
              <span>💬 WhatsApp Canlı Mimar</span>
            </a>
          </div>
        </div>

        {/* Showroom & Content Grid */}
        <div className="showroom-main-grid">
          
          {/* LEFT COLUMN: 3D TOUR & PHOTOS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Gallery Card */}
            <div className="section-glass-card">
              {/* Tab Header */}
              <div className="gallery-header-row">
                <h3 className="section-title">Showroom Deneyimi</h3>
                
                {/* Toggles */}
                {dealer.virtualTourUrl && images.length > 0 && (
                  <div className="gallery-tab-toggle">
                    <button 
                      onClick={() => handleTabChange('3d')}
                      className={`toggle-btn ${galleryTab === '3d' ? 'active' : ''}`}
                    >
                      <Sparkles size={12} />
                      3D Sanal Tur
                    </button>
                    <button 
                      onClick={() => handleTabChange('photos')}
                      className={`toggle-btn ${galleryTab === 'photos' ? 'active' : ''}`}
                    >
                      <ImageIcon size={12} />
                      Fotoğraflar
                    </button>
                  </div>
                )}
              </div>

              {/* Tab Content */}
              {galleryTab === '3d' && dealer.virtualTourUrl ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div className="virtual-tour-iframe-container" style={{ position: 'relative' }}>
                    {iframeLoading && (
                      <div className="iframe-skeleton-loader">
                        <div className="ceramic-tile-spinner mini">
                          <div className="tile-face face-front">SB</div>
                          <div className="tile-face face-back">SB</div>
                        </div>
                        <span>Sanal Tur Hazırlanıyor...</span>
                      </div>
                    )}
                    {isPanoramicImage ? (
                      <div 
                        id="panorama-container" 
                        style={{ width: '100%', height: '100%', position: 'relative' }}
                      />
                    ) : (
                      <iframe 
                        src={dealer.virtualTourUrl} 
                        width="100%" 
                        height="100%" 
                        style={{ border: 'none' }}
                        allowFullScreen
                        onLoad={() => setIframeLoading(false)}
                      />
                    )}
                  </div>
                  <span className="tour-hint">
                    {isPanoramicImage 
                      ? "Görseli 360° döndürmek için tıklayıp sürükleyin, yakınlaştırmak için fare tekerleğini kullanın."
                      : "Showroom içinde gezinmek için tıklayıp sürükleyin, ilerlemek için zemin noktalarına dokunun."}
                  </span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {images.length > 0 ? (
                    <>
                      <div className="active-photo-container">
                        <img 
                          src={images[activePhotoIndex] || images[0]} 
                          alt={`${dealer.name} Showroom`} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                      </div>
                      
                      {images.length > 1 && (
                        <div className="thumbnail-list scrollbar-hidden">
                          {images.map((img, idx) => (
                            <button 
                              key={idx}
                              onClick={() => setActivePhotoIndex(idx)}
                              className={`thumbnail-btn ${activePhotoIndex === idx ? 'active' : ''}`}
                            >
                              <img src={img} alt="Showroom Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="no-images-placeholder">
                      <ImageIcon size={48} strokeWidth={1.5} style={{ color: 'var(--accent-gold)' }} />
                      <span>Showroom görselleri yakında eklenecektir.</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Special Concepts Card */}
            {concepts.length > 0 && (
              <div className="section-glass-card">
                <h3 className="section-subtitle">
                  Bu Showroom'da Sergilenen Özel Konseptler
                </h3>
                <div className="concepts-list">
                  {concepts.map((concept, idx) => (
                    <span 
                      key={idx}
                      className="concept-badge"
                    >
                      ✨ {concept.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* About Us Card */}
            {dealer.aboutText && (
              <div className="section-glass-card">
                <h3 className="section-subtitle">Hakkımızda</h3>
                <p style={{ margin: 0, fontSize: '0.86rem', color: '#475569', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                  {dealer.aboutText}
                </p>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: CONTACT INFO & QUOTE REQUEST */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Info and hours card */}
            <div className="section-glass-card">
              <h3 className="section-title">İletişim & Konum Bilgileri</h3>
              
              <div className="info-list">
                <div className="info-item">
                  <div className="info-icon-wrapper">
                    <MapPin size={18} />
                  </div>
                  <div className="info-content">
                    <span className="info-label">Adres</span>
                    <span className="info-value">{dealer.address} • {dealer.district}, {dealer.city}</span>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon-wrapper">
                    <Phone size={18} />
                  </div>
                  <div className="info-content">
                    <span className="info-label">Telefon</span>
                    <a href={`tel:${dealer.phone}`} className="info-value tel-link">{dealer.phone}</a>
                  </div>
                </div>

                {dealer.email && (
                  <div className="info-item">
                    <div className="info-icon-wrapper">
                      <Mail size={18} />
                    </div>
                    <div className="info-content">
                      <span className="info-label">E-Posta</span>
                      <a href={`mailto:${dealer.email}`} className="info-value mail-link">{dealer.email}</a>
                    </div>
                  </div>
                )}

                <div className="info-item border-top">
                  <div className="info-icon-wrapper">
                    <Clock size={18} />
                  </div>
                  <div className="info-content">
                    <span className="info-label">Çalışma Saatleri</span>
                    <span className="info-value highlight-value">Her gün: 09:00 – 19:00</span>
                  </div>
                </div>
              </div>
            </div>

            {/* PDF Catalog Card */}
            {dealer.pdfCatalogUrl && (
              <div className="section-glass-card animate-fade-in" style={{
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.85) 100%)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                padding: '24px',
                borderRadius: '20px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: 'rgba(212, 175, 55, 0.15)',
                      border: '1px solid rgba(212, 175, 55, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#d4af37',
                      flexShrink: 0
                    }}>
                      <FileText size={24} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {dealer.pdfCatalogName || 'İndirilebilir Ürün Kataloğu & Broşür'}
                      </h3>
                      <p style={{ fontSize: '0.78rem', color: '#cbd5e1', margin: '4px 0 0 0' }}>
                        Bayimizin güncel seramik koleksiyonunu ve fiyat broşürünü PDF olarak indirin.
                      </p>
                    </div>
                  </div>
                  <a
                    href={dealer.pdfCatalogUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackAction('PDF_DOWNLOAD')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 20px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #b38e47 0%, #d4af37 100%)',
                      color: '#000000',
                      fontWeight: '800',
                      fontSize: '0.85rem',
                      textDecoration: 'none',
                      boxShadow: '0 4px 14px rgba(212, 175, 55, 0.3)',
                      transition: 'all 0.2s ease'
                    }}
                    className="hover-gold-solid-btn"
                  >
                    <Download size={16} />
                    <span>Kataloğu İndir (PDF)</span>
                  </a>
                </div>
              </div>
            )}

            {/* Direct lead quote form */}
            <div className="section-glass-card" id="quote-form-section">
              <h3 className="section-title">Fiyat Teklifi ve Bilgi Alın</h3>
              <p className="form-desc">
                Aşağıdaki formu doldurarak bu bayiden ilgilendiğiniz seramik ürünleri için palet bazında özel teklif veya showroom randevusu isteyin.
              </p>

              <form onSubmit={handleLeadSubmit} className="quote-form-element">
                {successMsg && (
                  <div className="alert-box success">
                    <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: '1px' }} />
                    <span>{successMsg}</span>
                  </div>
                )}

                {errorMsg && (
                  <div className="alert-box error">
                    <span>⚠️ {errorMsg}</span>
                  </div>
                )}

                <div className="input-group">
                  <label className="input-label">Adınız Soyadınız *</label>
                  <input 
                    type="text" 
                    value={clientName} 
                    onChange={(e) => setClientName(e.target.value)} 
                    placeholder="Örn: Ahmet Yılmaz"
                    required
                    className="form-input"
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Telefon Numaranız *</label>
                  <input 
                    type="tel" 
                    value={clientPhone} 
                    onChange={(e) => setClientPhone(e.target.value)} 
                    placeholder="Örn: 0532 123 45 67"
                    required
                    className="form-input"
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">E-Posta Adresiniz *</label>
                  <input 
                    type="email" 
                    value={clientEmail} 
                    onChange={(e) => setClientEmail(e.target.value)} 
                    placeholder="Örn: ahmet@gmail.com"
                    required
                    className="form-input"
                  />
                </div>

                {products.length > 0 && (
                  <div className="input-group">
                    <label className="input-label">İlgilendiğiniz Ürün *</label>
                    <select 
                      value={selectedProductId} 
                      onChange={(e) => setSelectedProductId(e.target.value)} 
                      required
                      className="form-select"
                    >
                      {products.map(prod => (
                        <option key={prod.id} value={prod.id}>{prod.name} ({prod.code})</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="input-group">
                  <label className="input-label">Hızlı Talep Konusu (Tek Tıkla Seçin)</label>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                    {[
                      '📐 3D Sanal Banyo Tasarımı İstiyorum',
                      '🚚 Nakliye & Şantiye Teslimat Bilgisi',
                      '💰 Toptan Palet Fiyat İskontosu',
                      '📦 Gerçek Numune Karo Talebi'
                    ].map((preset, pIdx) => (
                      <button
                        key={pIdx}
                        type="button"
                        onClick={() => setNotes(prev => prev ? `${prev} • ${preset}` : preset)}
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: '700',
                          padding: '4px 10px',
                          borderRadius: '16px',
                          background: 'rgba(212, 175, 55, 0.12)',
                          color: 'var(--accent-gold, #b38e47)',
                          border: '1px solid rgba(212, 175, 55, 0.3)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                  <textarea 
                    value={notes} 
                    onChange={(e) => setNotes(e.target.value)} 
                    placeholder="Metraj miktarı (m²), aradığınız ebat veya teslimat adresi gibi ek taleplerinizi buraya yazabilirsiniz..."
                    rows={3}
                    className="form-textarea"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="btn-submit"
                >
                  {loading ? (
                    <span>Gönderiliyor...</span>
                  ) : (
                    <>
                      <Send size={15} />
                      <span>Teklif Talebi Gönder</span>
                    </>
                  )}
                </button>
              </form>
            </div>

          </div>

        </div>

        {/* SECTION: SHOWROOM PRIVILEGES & SERVICES */}
        {servicesList.length > 0 && (
          <div className="showroom-services-section" style={{ marginTop: '56px' }}>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <span style={{
                fontSize: '0.78rem',
                fontWeight: '800',
                color: 'var(--accent-gold)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                background: 'rgba(var(--accent-gold-rgb, 179,142,71), 0.1)',
                padding: '6px 16px',
                borderRadius: '20px',
                border: '1px solid rgba(var(--accent-gold-rgb, 179,142,71), 0.25)',
                display: 'inline-block'
              }}>
                MÜŞTERİ AYRICALIKLARI
              </span>
              <h2 className="section-main-heading" style={{ marginTop: '12px', marginBottom: '8px' }}>
                Showroom Hizmetlerimiz & Ayrıcalıklarınız
              </h2>
              <p style={{ fontSize: '0.86rem', color: '#64748b', maxWidth: '660px', margin: '0 auto' }}>
                Seramik seçimi ve mekan yenileme sürecinizde yetkili bayimizin sunduğu ücretsiz mimarlık, sigortalı nakliye ve işçilik garantisi avantajları.
              </p>
            </div>

            <div className="services-showcase-grid">
              {servicesList.map(serviceId => {
                const map = {
                  studio_3d: {
                    title: '3D Sanal Banyo & Mimar Destek',
                    desc: 'Banyonuzun ölçülerine göre karoları 3D sanal stüdyoda canlı döşeyip tasarım ve metraj raporu çıkarıyoruz.',
                    Icon: Sparkles
                  },
                  shipping: {
                    title: 'Sigortalı Nakliye & Kapıya Teslim',
                    desc: 'Paletli ve kırılma sigortalı araçlarımızla seramiklerinizi şantiyenize veya adresinize güvenle ulaştırıyoruz.',
                    Icon: Truck
                  },
                  install_support: {
                    title: 'Sertifikalı Usta & İşçilik Garantisi',
                    desc: 'Bölgenizdeki tecrübeli seramik ustalarıyla buluşturuyor, derz ve kaplama işçiliğini garantili sunuyoruz.',
                    Icon: Wrench
                  },
                  sample_box: {
                    title: 'Ücretsiz Numune Kargo Desteği',
                    desc: 'Beğendiğiniz seramik dokularını yerinde görmek için adresinize gerçek numune karosu talep edebilirsiniz.',
                    Icon: Package
                  },
                  credit_card: {
                    title: 'Kart Taksiti & Esnek Ödeme Planı',
                    desc: 'Tüm banka kartlarına özel taksit seçenekleri ve mimari projelere özel vadeli ödeme çözümleri sunuyoruz.',
                    Icon: CreditCard
                  },
                  b2b_discount: {
                    title: 'B2B & Toplu Proje İskontoları',
                    desc: 'Müteahhit, mimar ve otel projeleri için fabrika teslimi toptan palet fiyatları ve özel iskonto avantajı.',
                    Icon: Building2
                  },
                  showroom_stock: {
                    title: 'Showroom & Hazır Depo Stoğu',
                    desc: 'Binlerce karo çeşidini canlı teşhir alanında inceleme ve depodan anında teslim alabilme imkanı.',
                    Icon: Building2
                  }
                };
                const s = map[serviceId];
                if (!s) return null;
                const IconComponent = s.Icon;
                return (
                  <div key={serviceId} className="service-card-modern">
                    <div className="service-icon-box">
                      <IconComponent size={22} />
                    </div>
                    <h3>{s.title}</h3>
                    <p>{s.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION: OUTLET & PROJE FAZLASI BORSASI */}
        {dealer.outletListings && dealer.outletListings.length > 0 && (
          <div className="showroom-outlet-section" style={{ marginTop: '48px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              borderRadius: '24px',
              padding: '32px 24px',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  color: '#f87171',
                  padding: '6px 16px',
                  borderRadius: '20px',
                  fontSize: '0.78rem',
                  fontWeight: '800',
                  letterSpacing: '0.5px',
                  marginBottom: '12px'
                }}>
                  <Sparkles size={14} />
                  BAYİDEN OUTLET & PROJE FAZLASI BORSASI
                </div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#ffffff', margin: '0 0 8px 0' }}>
                  🔥 Outlet & Proje Fazlası Fırsat Paletleri
                </h2>
                <p style={{ fontSize: '0.88rem', color: '#94a3b8', maxWidth: '680px', margin: '0 auto', lineHeight: '1.6' }}>
                  Bayimizin deposunda kalan son 30-50 m² şantiye fazlası, seri sonu ve 2. kalite paletler uygun fiyata satışta! Kiralık daire yenileyecekler ve ufak tadilat yapacaklar için büyük fırsat.
                </p>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
                gap: '24px'
              }}>
                {dealer.outletListings.map((item) => {
                  const prod = item.product;
                  const discountPercent = item.originalPrice && item.originalPrice > item.unitPrice
                    ? Math.round(((item.originalPrice - item.unitPrice) / item.originalPrice) * 100)
                    : null;
                  const totalPalletValue = Math.round(item.unitPrice * item.quantityM2);

                  const categoryLabelMap = {
                    PROJE_FAZLASI: 'Proje Fazlası',
                    SERI_SONU: 'Seri Sonu',
                    IKINCI_KALITE: '2. Kalite',
                    OUTLET: 'Outlet'
                  };

                  return (
                    <div key={item.id} style={{
                      background: 'rgba(30, 41, 59, 0.7)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '20px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                    }} className="hover:transform hover:-translate-y-1">
                      {/* Image Header */}
                      <div style={{ position: 'relative', height: '190px', width: '100%', overflow: 'hidden' }}>
                        <img
                          src={item.imageUrl || (prod ? prod.imageUrl || getTextureFallback(prod) : '/textures/calacatta_gold.jpg')}
                          alt={item.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = getTextureFallback(prod);
                          }}
                        />
                        <div style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'linear-gradient(to top, rgba(15, 23, 42, 0.9) 0%, transparent 60%)'
                        }} />

                        {/* Top Left Badges */}
                        <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <span style={{
                            background: '#ef4444',
                            color: '#ffffff',
                            fontSize: '0.68rem',
                            fontWeight: '800',
                            padding: '4px 10px',
                            borderRadius: '12px',
                            boxShadow: '0 4px 10px rgba(239, 68, 68, 0.4)'
                          }}>
                            {item.badgeTag || 'Outlet / Proje Fazlası'}
                          </span>
                          <span style={{
                            background: 'rgba(15, 23, 42, 0.85)',
                            color: '#cbd5e1',
                            fontSize: '0.62rem',
                            fontWeight: '700',
                            padding: '3px 8px',
                            borderRadius: '10px',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            backdropFilter: 'blur(4px)'
                          }}>
                            🏷️ {categoryLabelMap[item.category] || item.category}
                          </span>
                        </div>

                        {/* Discount Pill Top Right */}
                        {discountPercent && (
                          <div style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            color: '#ffffff',
                            fontWeight: '900',
                            fontSize: '0.75rem',
                            padding: '4px 10px',
                            borderRadius: '14px',
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)'
                          }}>
                            %{discountPercent} İNDİRİM
                          </div>
                        )}

                        {/* Quantity Bottom Left */}
                        <div style={{ position: 'absolute', bottom: '12px', left: '12px' }}>
                          <span style={{
                            background: 'rgba(212, 175, 55, 0.9)',
                            color: '#000000',
                            fontWeight: '900',
                            fontSize: '0.72rem',
                            padding: '4px 10px',
                            borderRadius: '10px'
                          }}>
                            📦 Mevcut Stok: {item.quantityM2} m²
                          </span>
                        </div>
                      </div>

                      {/* Content Body */}
                      <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#ffffff', margin: 0, lineHeight: '1.4' }}>
                          {item.title}
                        </h3>

                        {(item.dimensions || item.colorFinish) && (
                          <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem', color: '#cbd5e1' }}>
                            {item.dimensions && <span>📏 {item.dimensions}</span>}
                            {item.colorFinish && <span>🎨 {item.colorFinish}</span>}
                          </div>
                        )}

                        {item.notes && (
                          <p style={{
                            fontSize: '0.78rem',
                            color: '#94a3b8',
                            background: 'rgba(15, 23, 42, 0.5)',
                            padding: '10px 12px',
                            borderRadius: '10px',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            margin: 0,
                            lineHeight: '1.5'
                          }}>
                            "{item.notes}"
                          </p>
                        )}

                        {/* Pricing Row */}
                        <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                          <div>
                            {item.originalPrice && (
                              <span style={{ fontSize: '0.75rem', color: '#94a3b8', textDecoration: 'line-through', display: 'block' }}>
                                ₺{item.originalPrice.toLocaleString('tr-TR')} / m²
                              </span>
                            )}
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                              <span style={{ fontSize: '1.35rem', fontWeight: '900', color: '#f87171' }}>
                                ₺{item.unitPrice.toLocaleString('tr-TR')}
                              </span>
                              <span style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>/ m²</span>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '0.65rem', color: '#94a3b8', display: 'block' }}>Palet Toplam Tutarı</span>
                            <span style={{ fontSize: '0.9rem', fontWeight: '800', color: '#ffffff' }}>
                              ₺{totalPalletValue.toLocaleString('tr-TR')}
                            </span>
                          </div>
                        </div>

                        {/* Buttons */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '6px' }}>
                          <a
                            href={`https://wa.me/${(dealer.phone || '').replace(/[\s\-\(\)\+]/g, '')}?text=${encodeURIComponent(`Merhaba, ${dealer.name} showroom sayfanızdaki "${item.title}" (${item.quantityM2} m², ₺${item.unitPrice}/m²) outlet stoğunuzu satın almak / bilgi almak istiyorum.`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => trackAction('WHATSAPP')}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              padding: '10px',
                              borderRadius: '10px',
                              background: '#22c55e',
                              color: '#ffffff',
                              fontWeight: '800',
                              fontSize: '0.78rem',
                              textDecoration: 'none',
                              textAlign: 'center'
                            }}
                          >
                            <MessageSquare size={14} />
                            <span>WhatsApp Sor</span>
                          </a>

                          <button
                            onClick={() => {
                              setNotes(`İlgilenilen Outlet Ürün: ${item.title} - ${item.quantityM2} m² (Birim Fiyat: ₺${item.unitPrice}/m²)`);
                              const el = document.getElementById('quote-form-section');
                              if (el) el.scrollIntoView({ behavior: 'smooth' });
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              padding: '10px',
                              borderRadius: '10px',
                              background: 'linear-gradient(135deg, #b38e47 0%, #d4af37 100%)',
                              color: '#000000',
                              fontWeight: '800',
                              fontSize: '0.78rem',
                              border: 'none',
                              cursor: 'pointer'
                            }}
                          >
                            <Send size={14} />
                            <span>Teklif / Rezerve</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {campaigns.length > 0 && (
          <div className="showroom-campaigns-section" style={{ marginTop: '48px' }}>
            <h2 className="section-main-heading">
              Aktif Kampanyalar & Fırsatlar
            </h2>
            <div className="campaigns-grid">
              {campaigns.map((camp, idx) => (
                <div key={idx} className="campaign-card">
                  <span className="campaign-badge">AKTİF FIRSAT</span>
                  <h3 className="campaign-card-title">{camp.title}</h3>
                  <p className="campaign-card-desc">{camp.desc}</p>
                  {camp.expiresAt && (
                    <div className="campaign-card-footer">
                      🕒 Son Geçerlilik: {camp.expiresAt}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION: SHOWROOM ENVANTERİ */}
        {dealer.inventories && dealer.inventories.length > 0 && (() => {
          const filteredInventories = dealer.inventories.filter(item => {
            if (!item?.product) return false;
            const prod = item.product;
            const q = inventorySearchTerm.toLowerCase().trim();
            const textMatch = !q || 
              (prod.name && prod.name.toLowerCase().includes(q)) ||
              (prod.code && prod.code.toLowerCase().includes(q)) ||
              (prod.style && prod.style.toLowerCase().includes(q)) ||
              (prod.finish && prod.finish.toLowerCase().includes(q)) ||
              (prod.color && prod.color.toLowerCase().includes(q));

            const styleMatch = inventoryStyleFilter === 'all' || 
              (prod.style && prod.style.toLowerCase().includes(inventoryStyleFilter.toLowerCase()));

            const statusMatch = inventoryStatusFilter === 'all' || item.status === inventoryStatusFilter;

            return textMatch && styleMatch && statusMatch;
          });

          return (
            <div className="featured-products-section" style={{ marginTop: '56px' }}>
              <h2 className="section-main-heading" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Building2 size={24} style={{ color: 'var(--accent-gold)' }} />
                Şube Stokları & Hazır Envanter Listesi
              </h2>
              <p style={{ fontSize: '0.86rem', color: '#64748b', textAlign: 'center', marginTop: '-8px', marginBottom: '24px' }}>
                Bayimizin showroomunda sergilenen ve depolarında teslimata hazır bulunan güncel seramik envanteri.
              </p>

              {/* Live Search & Filter Bar */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                borderRadius: '18px',
                padding: '16px 20px',
                marginBottom: '28px',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '14px',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 300px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '8px 14px' }}>
                  <Search size={16} style={{ color: '#94a3b8' }} />
                  <input
                    type="text"
                    value={inventorySearchTerm}
                    onChange={(e) => setInventorySearchTerm(e.target.value)}
                    placeholder="Envanterde seramik modeli, ebat veya kod ara... (Örn: Calacatta, 60x120)"
                    style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '0.84rem', color: '#0f172a' }}
                  />
                  {inventorySearchTerm && (
                    <button type="button" onClick={() => setInventorySearchTerm('')} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 'bold' }}>✕</button>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginRight: '2px' }}>Stil:</span>
                  {['all', 'Mermer', 'Beton', 'Ahşap', 'Taş'].map(styleKey => (
                    <button
                      key={styleKey}
                      type="button"
                      onClick={() => setInventoryStyleFilter(styleKey)}
                      style={{
                        border: '1px solid',
                        borderColor: inventoryStyleFilter === styleKey ? 'var(--accent-gold)' : '#cbd5e1',
                        background: inventoryStyleFilter === styleKey ? 'var(--accent-gold)' : '#ffffff',
                        color: inventoryStyleFilter === styleKey ? '#ffffff' : '#475569',
                        borderRadius: '20px',
                        padding: '5px 14px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {styleKey === 'all' ? 'Tüm Stiller' : styleKey}
                    </button>
                  ))}
                </div>
              </div>

              {filteredInventories.length > 0 ? (
                <div className="featured-products-grid">
                  {filteredInventories.map(item => {
                    if (!item.product) return null;
                    const prod = item.product;
                    
                    let statusLabel = 'Stokta Var';
                    let statusColor = '#10b981';
                    let statusBg = '#ecfdf5';

                    if (item.status === 'DISPLAY_ONLY') {
                      statusLabel = 'Teşhir Ürünü';
                      statusColor = '#d97706';
                      statusBg = '#fffbeb';
                    } else if (item.status === 'ORDER_ONLY') {
                      statusLabel = 'Sipariş Üzerine';
                      statusColor = '#2563eb';
                      statusBg = '#eff6ff';
                    }

                    return (
                      <div key={item.id} className="featured-product-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <div className="featured-product-image-container" style={{ position: 'relative' }}>
                          <img 
                            src={prod.imageUrl || getTextureFallback(prod)} 
                            alt={prod.name} 
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = getTextureFallback(prod);
                            }}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
                          />
                          <span style={{
                            position: 'absolute',
                            top: '8px',
                            left: '8px',
                            fontSize: '0.6rem',
                            fontWeight: '800',
                            color: statusColor,
                            background: statusBg,
                            padding: '3px 8px',
                            borderRadius: '16px',
                            border: `1px solid ${statusColor}33`,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                          }}>
                            {statusLabel}
                          </span>
                        </div>
                        <div className="featured-product-info" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <span className="featured-product-style">{prod.style} serisi</span>
                          <h3 className="featured-product-name">{prod.name}</h3>
                          <span className="featured-product-meta" style={{ flex: 1 }}>Kod: {prod.code} • Ebat: {prod.width}x{prod.height} cm • Yüzey: {prod.finish}</span>
                          
                          <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '6px' }}>
                            <div>
                              <span style={{ fontSize: '0.6rem', color: '#64748b', display: 'block' }}>Mevcut Stok</span>
                              <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#1e293b' }}>
                                {item.status === 'IN_STOCK' ? `${item.stock.toLocaleString('tr-TR')} m²` : (item.status === 'DISPLAY_ONLY' ? 'Teşhir / Numune' : 'Siparişle (3-7 Gün)')}
                              </span>
                            </div>
                            {(!kioskMode || showPricesInKiosk) && item.price && (
                              <div style={{ textAlign: 'right' }}>
                                <span style={{ fontSize: '0.6rem', color: '#64748b', display: 'block' }}>Bayi Özel Fiyatı</span>
                                <span style={{ fontSize: '0.82rem', fontWeight: '900', color: 'var(--accent-gold, #b38e47)' }}>
                                  ₺{item.price.toLocaleString('tr-TR')} 
                                  <span style={{ fontSize: '0.58rem', color: '#64748b', fontWeight: '500' }}> / m²</span>
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="product-card-actions-group" style={{ display: 'flex', gap: '6px' }}>
                          <Link 
                            href={prod.code ? `/?code=${encodeURIComponent(prod.code)}&tab=studio#studio` : `/?tab=studio#studio`}
                            onClick={() => {
                              try {
                                const selectedObj = {
                                  ...prod,
                                  unitPrice: item.price || prod.unitPrice,
                                  textureUrl: prod.textureUrl || prod.imageUrl || getTextureFallback(prod),
                                  imageUrl: prod.imageUrl || prod.textureUrl || getTextureFallback(prod)
                                };
                                localStorage.setItem('seramikbak_preselected_product', JSON.stringify(selectedObj));
                                sessionStorage.setItem('kiosk_selected_product', JSON.stringify(selectedObj));
                              } catch(e) {}
                            }}
                            className="btn-3d-try-card"
                            title="Bu ürünü 3D Sanal Banyo Stüdyosu'nda canlı uygulayın"
                            style={{ flex: '1 1 auto', textDecoration: 'none' }}
                          >
                            <Sparkles size={12} />
                            3D Gör
                          </Link>
                          <button
                            type="button"
                            onClick={() => addToCart({ ...prod, price: item.price || prod.unitPrice }, 30)}
                            className={`btn-add-quote-cart ${quoteCart.some(i => i.id === prod.id) ? 'added' : ''}`}
                            title="Teklif listesine ekle"
                          >
                            {quoteCart.some(i => i.id === prod.id) ? (
                              <>
                                <Check size={12} />
                                <span>Listede</span>
                              </>
                            ) : (
                              <>
                                <Plus size={12} />
                                <span>+ Teklife Ekle</span>
                              </>
                            )}
                          </button>
                          <button 
                            type="button" 
                            onClick={() => handleFeatureClick(prod.id)}
                            className="featured-product-action-btn icon-only-btn"
                            title="Doğrudan Teklif Formuna Doldur"
                          >
                            <ArrowRight size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '36px 20px', background: 'rgba(255, 255, 255, 0.6)', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                  <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>Aradığınız kriterlere uygun seramik stok kaydı bulunamadı.</p>
                  <button type="button" onClick={() => { setInventorySearchTerm(''); setInventoryStyleFilter('all'); }} style={{ marginTop: '10px', padding: '6px 16px', borderRadius: '8px', border: 'none', background: 'var(--accent-gold)', color: '#fff', fontSize: '0.78rem', fontWeight: 'bold', cursor: 'pointer' }}>Filtreleri Temizle</button>
                </div>
              )}
            </div>
          );
        })()}

        {/* SECTION: FEATURED PRODUCTS */}
        {featuredProductsList.length > 0 && (
          <div className="featured-products-section" style={{ marginTop: '48px' }}>
            <h2 className="section-main-heading">
              Showroom Öne Çıkan Ürünler
            </h2>
            <div className="featured-products-grid">
              {featuredProductsList.map(prod => (
                <div key={prod.id} className="featured-product-card">
                  <div className="featured-product-image-container">
                    <img 
                      src={prod.imageUrl || getTextureFallback(prod)} 
                      alt={prod.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = getTextureFallback(prod);
                      }}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  </div>
                  <div className="featured-product-info">
                    <span className="featured-product-style">{prod.style} serisi</span>
                    <h3 className="featured-product-name">{prod.name}</h3>
                    <span className="featured-product-meta">Kod: {prod.code} • Ebat: {prod.width}x{prod.height} cm • Yüzey: {prod.finish}</span>
                  </div>
                  <div className="product-card-actions-group" style={{ display: 'flex', gap: '6px' }}>
                    <Link 
                      href={prod.code ? `/?code=${encodeURIComponent(prod.code)}&tab=studio#studio` : `/?tab=studio#studio`}
                      onClick={() => {
                        try {
                          const selectedObj = {
                            ...prod,
                            textureUrl: prod.textureUrl || prod.imageUrl || getTextureFallback(prod),
                            imageUrl: prod.imageUrl || prod.textureUrl || getTextureFallback(prod)
                          };
                          localStorage.setItem('seramikbak_preselected_product', JSON.stringify(selectedObj));
                          sessionStorage.setItem('kiosk_selected_product', JSON.stringify(selectedObj));
                        } catch(e) {}
                      }}
                      className="btn-3d-try-card"
                      title="Bu ürünü 3D Sanal Banyo Stüdyosu'nda canlı uygulayın"
                      style={{ flex: '1 1 auto', textDecoration: 'none' }}
                    >
                      <Sparkles size={12} />
                      3D Gör
                    </Link>
                    <button
                      type="button"
                      onClick={() => addToCart(prod, 30)}
                      className={`btn-add-quote-cart ${quoteCart.some(i => i.id === prod.id) ? 'added' : ''}`}
                      title="Teklif listesine ekle"
                    >
                      {quoteCart.some(i => i.id === prod.id) ? (
                        <>
                          <Check size={12} />
                          <span>Listede</span>
                        </>
                      ) : (
                        <>
                          <Plus size={12} />
                          <span>+ Teklife Ekle</span>
                        </>
                      )}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => handleFeatureClick(prod.id)}
                      className="featured-product-action-btn icon-only-btn"
                      title="Doğrudan Teklif Formuna Doldur"
                    >
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION: REFERENCE PROJECTS */}
        {referenceProjects.length > 0 && (
          <div className="reference-projects-section" style={{ marginTop: '48px' }}>
            <h2 className="section-main-heading">
              Referans Projelerimiz
            </h2>
            <div className="projects-grid">
              {referenceProjects.map((proj, idx) => {
                const targetUrl = proj.linkUrl || proj.url || proj.link;
                return (
                  <div key={idx} className="project-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    {proj.imageUrl && (
                      <div className="project-card-image-container">
                        {targetUrl ? (
                          <a href={targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`} target="_blank" rel="noopener noreferrer" style={{ display: 'block', width: '100%', height: '100%' }}>
                            <img 
                              src={proj.imageUrl} 
                              alt={proj.title}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/textures/calacatta_gold.jpg';
                              }}
                              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                            />
                          </a>
                        ) : (
                          <img 
                            src={proj.imageUrl} 
                            alt={proj.title}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/textures/calacatta_gold.jpg';
                            }}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                          />
                        )}
                      </div>
                    )}
                    <div className="project-card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <h3 className="project-card-title">{proj.title}</h3>
                      <p className="project-card-desc">{proj.desc}</p>

                      <div style={{ marginTop: 'auto', paddingTop: '14px' }}>
                        {targetUrl ? (
                          <a 
                            href={targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontSize: '0.8rem',
                              fontWeight: '800',
                              color: 'var(--accent-gold, #b38e47)',
                              textDecoration: 'none'
                            }}
                          >
                            <span>Projeyi Detaylı İncele</span>
                            <ArrowRight size={14} />
                          </a>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setNotes(prev => prev ? `${prev} • "${proj.title}" referansı hakkında bilgi almak istiyorum.` : `"${proj.title}" referansı hakkında bilgi almak istiyorum.`);
                              const el = document.querySelector('#quote-form-section');
                              if (el) el.scrollIntoView({ behavior: 'smooth' });
                            }}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontSize: '0.78rem',
                              fontWeight: '800',
                              color: 'var(--accent-gold, #b38e47)',
                              background: 'transparent',
                              border: 'none',
                              padding: 0,
                              cursor: 'pointer'
                            }}
                          >
                            <span>Bu Proje Hakkında Bilgi Al</span>
                            <ArrowRight size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION: FAQ */}
        {faqs.length > 0 && (
          <div className="faq-section" style={{ marginTop: '48px' }}>
            <h2 className="section-main-heading">
              Sıkça Sorulan Sorular
            </h2>
            <div className="faq-accordion">
              {faqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div key={idx} className="faq-item">
                    <button 
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="faq-question-btn"
                    >
                      <span className="faq-question-text">{faq.q}</span>
                      <span className="faq-toggle-icon">{isOpen ? '−' : '+'}</span>
                    </button>
                    {isOpen && (
                      <div className="faq-answer-content">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* Mobile Sticky Action Bar — 4 Button Premium */}
      <div className="mobile-sticky-actions">
        <a 
          href={`tel:${dealer.phone}`}
          className="btn-call-mobile"
        >
          <Phone size={18} />
          <span>Ara</span>
        </a>
        <a 
          href={`https://wa.me/${(dealer.phone || '').replace(/[\s\-\(\)\+]/g, '')}?text=Merhaba%2C%20SeramikBak%20profil%20sayfan%C4%B1zdan%20ula%C5%9F%C4%B1yorum.%20Showroom%27daki%20seramikleriniz%20hakk%C4%B1nda%20bilgi%20alabilir%20miyim%3F`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="btn-whatsapp-mobile"
        >
          <MessageSquare size={18} />
          <span>WhatsApp</span>
        </a>
        <a 
          href={`https://www.google.com/maps/dir/?api=1&destination=${dealer.lat},${dealer.lng}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="btn-maps-mobile"
        >
          <Compass size={18} />
          <span>Yol Tarifi</span>
        </a>
        <button 
          type="button"
          onClick={() => {
            const el = document.getElementById('quote-form-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="btn-quote-mobile"
        >
          <Send size={18} />
          <span>Teklif Al</span>
        </button>
      </div>
      {/* FLOATING QUOTE CART PILL */}
      {quoteCart.length > 0 && !showCartDrawer && (
        <div className="floating-cart-pill-container animate-bounce-subtle">
          <button 
            type="button" 
            onClick={() => setShowCartDrawer(true)}
            className="floating-cart-pill-btn"
          >
            <ShoppingBag size={18} />
            <span className="cart-pill-title">Teklif Sepetim</span>
            <span className="cart-pill-badge">{quoteCart.length}</span>
          </button>
        </div>
      )}

      {/* QUOTE CART DRAWER / MODAL */}
      {showCartDrawer && (
        <div className="cart-drawer-overlay" onClick={() => setShowCartDrawer(false)}>
          <div className="cart-drawer-content" onClick={(e) => e.stopPropagation()}>
            <div className="cart-drawer-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="cart-header-icon-box">
                  <ShoppingBag size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                    Showroom Teklif Sepetim
                  </h3>
                  <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                    {dealer.name} • {quoteCart.length} Seramik Seçildi
                  </span>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setShowCartDrawer(false)}
                className="cart-drawer-close-btn"
              >
                ✕
              </button>
            </div>

            <div className="cart-drawer-body">
              {quoteCart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
                  <ShoppingBag size={48} strokeWidth={1.5} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                  <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>Teklif sepetiniz henüz boş.</p>
                  <span style={{ fontSize: '0.78rem' }}>Showroomdaki karoların üzerindeki "+ Teklife Ekle" butonuna tıklayarak sepetinize seramik ekleyebilirsiniz.</span>
                </div>
              ) : (
                <>
                  <div className="cart-items-scroll-list">
                    {quoteCart.map((item) => {
                      const m2 = parseFloat(item.m2) || 30;
                      const boxCount = Math.ceil(m2 / 1.44);
                      const unitPrice = parseFloat(item.price) || 0;
                      const itemTotal = unitPrice > 0 ? unitPrice * m2 : 0;

                      return (
                        <div key={item.id} className="cart-item-row">
                          <img 
                            src={item.imageUrl} 
                            alt={item.name} 
                            className="cart-item-thumb"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/textures/calacatta_gold.jpg';
                            }}
                          />
                          <div className="cart-item-info">
                            <h4 className="cart-item-title">{item.name}</h4>
                            <span className="cart-item-meta">
                              {item.code ? `Kod: ${item.code} • ` : ''}{item.width}x{item.height} cm • ~{boxCount} Kutu
                            </span>
                            {unitPrice > 0 && (
                              <span className="cart-item-price">
                                ₺{unitPrice.toLocaleString('tr-TR')} / m² {itemTotal > 0 ? `(₺${itemTotal.toLocaleString('tr-TR')})` : ''}
                              </span>
                            )}
                          </div>
                          <div className="cart-item-stepper">
                            <button 
                              type="button" 
                              onClick={() => updateCartM2(item.id, -5)}
                              className="cart-step-btn"
                              title="5 m² Azalt"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="cart-m2-val">{m2} m²</span>
                            <button 
                              type="button" 
                              onClick={() => updateCartM2(item.id, 5)}
                              className="cart-step-btn"
                              title="5 m² Artır"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <button 
                            type="button" 
                            onClick={() => removeFromCart(item.id)}
                            className="cart-item-del-btn"
                            title="Listeden Çıkar"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Summary & Consumables Calculation Box */}
                  {(() => {
                    const totalM2 = quoteCart.reduce((acc, curr) => acc + (parseFloat(curr.m2) || 0), 0);
                    const grossTileM2 = totalM2 * 1.1; // 10% fire
                    const totalBoxes = Math.ceil(grossTileM2 / 1.44);
                    const totalKalekimBags = Math.ceil((grossTileM2 * 4.5) / 25);
                    const totalGroutKg = Math.ceil(grossTileM2 * 0.45);
                    const totalWeightKg = Math.round(grossTileM2 * 22);

                    return (
                      <div className="cart-summary-card">
                        <div className="cart-summary-header-row">
                          <span className="summary-title">Şantiye & Malzeme İhtiyacı</span>
                          <button type="button" onClick={clearCart} className="btn-clear-cart">
                            Temizle
                          </button>
                        </div>

                        <div className="cart-summary-grid">
                          <div className="summary-grid-item">
                            <span className="grid-label">Net Metraj</span>
                            <span className="grid-val">{totalM2.toFixed(1)} m²</span>
                          </div>
                          <div className="summary-grid-item highlight">
                            <span className="grid-label">Fireli Sipariş (+%10)</span>
                            <span className="grid-val">{grossTileM2.toFixed(1)} m²</span>
                          </div>
                          <div className="summary-grid-item">
                            <span className="grid-label">Kutu / Paket</span>
                            <span className="grid-val">~{totalBoxes} Kutu</span>
                          </div>
                          <div className="summary-grid-item">
                            <span className="grid-label">Kalekim Yapıştırıcı</span>
                            <span className="grid-val">{totalKalekimBags} Torba (25kg)</span>
                          </div>
                          <div className="summary-grid-item">
                            <span className="grid-label">Derz Dolgusu</span>
                            <span className="grid-val">{totalGroutKg} kg</span>
                          </div>
                          <div className="summary-grid-item">
                            <span className="grid-label">Tahmini Yük</span>
                            <span className="grid-val">~{(totalWeightKg / 1000).toFixed(2)} Ton</span>
                          </div>
                        </div>

                        <div className="cart-actions-column">
                          <button
                            type="button"
                            onClick={sendCartToWhatsApp}
                            className="btn-cart-whatsapp"
                          >
                            <MessageSquare size={16} />
                            <span>WhatsApp ile Bayiye Proforma Gönder</span>
                          </button>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <button
                              type="button"
                              onClick={fillLeadFormWithCart}
                              className="btn-cart-fill-form"
                            >
                              <Send size={14} />
                              <span>Teklif Formuna Doldur</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => window.print()}
                              className="btn-cart-print"
                            >
                              <Printer size={14} />
                              <span>Yazdır / PDF</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SHOWROOM ZİYARET & VIP MİMAR RANDEVUSU MODALI */}
      {showAppointmentModal && (
        <div className="appointment-modal-overlay" onClick={() => setShowAppointmentModal(false)}>
          <div className="appointment-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="appointment-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="appointment-icon-box">
                  <Coffee size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                    Showroom Ziyaret & VIP Mimar Randevusu
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {dealer.name} • 3D Mimari Tasarım Eşliğinde Banyonuzu Seçin
                  </span>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setShowAppointmentModal(false)}
                className="appointment-close-btn"
              >
                ✕
              </button>
            </div>

            <div className="appointment-modal-body">
              <p className="appointment-intro-text">
                Showroom'umuza gelin, sıcak bir kahve eşliğinde banyonuzun veya mekanınızın ölçülerini 
                <strong> 3D Sanal Banyo Stüdyomuzda</strong> canlı kaplayalım ve şantiye metrajınızı birlikte çıkaralım.
              </p>

              {apptSuccess ? (
                <div className="appointment-success-box">
                  <CheckCircle2 size={32} style={{ color: '#10b981', margin: '0 auto 8px' }} />
                  <h4 style={{ margin: '0 0 4px', fontSize: '1.05rem', color: '#0f172a' }}>Randevu Talebiniz Alındı!</h4>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
                    Bayimizin WhatsApp hattına yönlendiriliyorsunuz. Müsaitlik anında teyit edilecektir.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleAppointmentSubmit} className="appointment-form-grid">
                  <div className="appt-input-group">
                    <label>Adınız Soyadınız *</label>
                    <input 
                      type="text" 
                      value={apptName} 
                      onChange={(e) => setApptName(e.target.value)} 
                      placeholder="Örn: Selin Demir"
                      required
                    />
                  </div>

                  <div className="appt-input-group">
                    <label>Telefon Numaranız *</label>
                    <input 
                      type="tel" 
                      value={apptPhone} 
                      onChange={(e) => setApptPhone(e.target.value)} 
                      placeholder="Örn: 0532 987 65 43"
                      required
                    />
                  </div>

                  <div className="appt-input-group">
                    <label>Ziyaret Tarihi *</label>
                    <input 
                      type="date" 
                      value={apptDate} 
                      onChange={(e) => setApptDate(e.target.value)} 
                      required
                    />
                  </div>

                  <div className="appt-input-group">
                    <label>Tercih Edilen Saat Dilimi</label>
                    <select 
                      value={apptTimeSlot} 
                      onChange={(e) => setApptTimeSlot(e.target.value)}
                    >
                      <option value="10:00 - 13:00 (Sabah Kuşağı)">10:00 - 13:00 (Sabah Kuşağı)</option>
                      <option value="14:00 - 16:00 (Öğleden Sonra)">14:00 - 16:00 (Öğleden Sonra)</option>
                      <option value="16:00 - 19:00 (Akşamüstü)">16:00 - 19:00 (Akşamüstü)</option>
                    </select>
                  </div>

                  <div className="appt-input-group full-width">
                    <label>Proje Türü</label>
                    <div className="appt-project-pills">
                      {[
                        'Banyo Yenileme',
                        'Mutfak & Zemin',
                        'Komple Daire / Villa',
                        'Ticari / Mimar Projesi'
                      ].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setApptProjectType(type)}
                          className={`appt-pill-btn ${apptProjectType === type ? 'active' : ''}`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="appt-input-group full-width">
                    <label>Özel Not veya Aradığınız Ebat (Opsiyonel)</label>
                    <textarea 
                      value={apptNotes} 
                      onChange={(e) => setApptNotes(e.target.value)}
                      placeholder="Örn: 60x120 mermer desen ve antrasit banyo karoları bakmak istiyoruz..."
                      rows={2}
                    />
                  </div>

                  <button type="submit" className="btn-submit-appointment">
                    <Calendar size={16} />
                    <span>Randevu Oluştur ve WhatsApp'tan Onay Al</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MASA ÜSTÜ SHOWROOM QR STANDI MODALI */}
      {showQrModal && (
        <div className="qr-modal-overlay" onClick={() => setShowQrModal(false)}>
          <div className="qr-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="qr-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <QrCode size={20} style={{ color: 'var(--accent-gold)' }} />
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>
                  Showroom Masası QR Standı & Dijital Kartvizit
                </h3>
              </div>
              <button type="button" onClick={() => setShowQrModal(false)} className="qr-close-btn">
                ✕
              </button>
            </div>

            <div className="qr-modal-body">
              <div className="qr-desk-stand-card" id="printable-qr-stand">
                <div className="qr-stand-header">
                  {dealer.logoUrl && (
                    <img src={dealer.logoUrl} alt={dealer.name} className="qr-stand-logo" />
                  )}
                  <h2 className="qr-stand-dealer-name">{dealer.name}</h2>
                  <span className="qr-stand-badge">YETKİLİ DİJİTAL SHOWROOM</span>
                </div>

                <div className="qr-code-display-box">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&data=${encodeURIComponent(currentUrl || `https://seramikbak.com/bayi/${dealer.id}`)}`}
                    alt={`${dealer.name} Showroom QR Kodu`}
                    className="qr-img-element"
                  />
                </div>

                <div className="qr-stand-instructions">
                  <h4>📱 Telefonunuzla Okutun</h4>
                  <p>
                    Showroom'daki tüm seramik serilerini, depo stoklarımızı ve 
                    <strong> 3D Banyo Tasarım Stüdyosu'nu</strong> cep telefonunuzda açın!
                  </p>
                </div>

                <div className="qr-stand-footer">
                  <span>📍 {dealer.district}, {dealer.city}</span>
                  <span>📞 {dealer.phone}</span>
                </div>
              </div>

              <div className="qr-actions-row">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="btn-print-qr-stand"
                >
                  <Printer size={16} />
                  <span>🖨️ Masa Standını Yazdır (A5 / A6)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.clipboard) {
                      navigator.clipboard.writeText(currentUrl);
                      alert('Showroom bağlantısı panoya kopyalandı!');
                    }
                  }}
                  className="btn-copy-url"
                >
                  <Share2 size={16} />
                  <span>Linki Kopyala</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GELİŞMİŞ SERAMİK & USTA SARFİYAT HESAPLAYICI MODALI */}
      {showCalculatorModal && (
        <div className="calculator-modal-overlay" onClick={() => setShowCalculatorModal(false)}>
          <div className="calculator-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="calculator-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ padding: '8px', borderRadius: '12px', background: 'rgba(212, 175, 55, 0.15)', color: 'var(--accent-gold)' }}>
                  <Calculator size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                    Akıllı Metraj & Usta Sarfiyat Hesaplayıcı
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Karo, Kutu, Flex Kalekim (Torba) ve Derz Dolgusu İhtiyacını Anında Hesaplayın
                  </span>
                </div>
              </div>
              <button type="button" onClick={() => setShowCalculatorModal(false)} className="calculator-modal-close-btn">
                ✕
              </button>
            </div>

            <div className="calculator-modal-body">
              <div className="calculator-grid-inputs">
                <div className="calc-input-group">
                  <label>Zemin Eni (Metre)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    value={calcWidth} 
                    onChange={(e) => setCalcWidth(e.target.value)} 
                    placeholder="Örn: 3.5"
                  />
                </div>
                <div className="calc-input-group">
                  <label>Zemin Boyu (Metre)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    value={calcLength} 
                    onChange={(e) => setCalcLength(e.target.value)} 
                    placeholder="Örn: 4.0"
                  />
                </div>
                <div className="calc-input-group">
                  <label>Duvar Yüksekliği (Opsiyonel / m)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    value={calcHeight} 
                    onChange={(e) => setCalcHeight(e.target.value)} 
                    placeholder="Örn: 2.6 (Banyo için)"
                  />
                </div>
                <div className="calc-input-group">
                  <label>Fire & Kesim Payı (%)</label>
                  <select value={calcWastePercent} onChange={(e) => setCalcWastePercent(Number(e.target.value))}>
                    <option value={5}>%5 (Düz Döşeme)</option>
                    <option value={10}>%10 (Standart - Önerilen)</option>
                    <option value={15}>%15 (Diyagonal / Bol Kesimli)</option>
                  </select>
                </div>
              </div>

              {/* Calculation Summary Box */}
              {(() => {
                const w = parseFloat(calcWidth) || 0;
                const l = parseFloat(calcLength) || 0;
                const h = parseFloat(calcHeight) || 0;
                
                const floorNet = w * l;
                const wallNet = h > 0 ? 2 * (w + l) * h : 0;
                const netM2 = floorNet + wallNet;
                const grossM2 = netM2 * (1 + calcWastePercent / 100);
                const boxM2 = 1.44; // standard box size for 60x120 or 60x60
                const numBoxes = grossM2 > 0 ? Math.ceil(grossM2 / boxM2) : 0;
                const totalWeightKg = Math.round(grossM2 * 22); // ~22kg per m² porcelain tile
                const kalekimBags = grossM2 > 0 ? Math.ceil((grossM2 * 4.5) / 25) : 0;
                const groutKg = grossM2 > 0 ? Math.ceil(grossM2 * 0.45) : 0;

                return (
                  <div className="calculator-results-card">
                    <div className="calc-res-item">
                      <span className="res-label">Net Alan</span>
                      <span className="res-value">{netM2.toFixed(2)} m²</span>
                    </div>
                    <div className="calc-res-item">
                      <span className="res-label">Fireli Sipariş (+%{calcWastePercent})</span>
                      <span className="res-value highlight">{grossM2.toFixed(2)} m²</span>
                    </div>
                    <div className="calc-res-item">
                      <span className="res-label">Kutu / Paket</span>
                      <span className="res-value badge">{numBoxes} Paket</span>
                    </div>
                    <div className="calc-res-item">
                      <span className="res-label">Flex Kalekim Harcı</span>
                      <span className="res-value badge">{kalekimBags} Torba (25kg)</span>
                    </div>
                    <div className="calc-res-item">
                      <span className="res-label">Derz Dolgusu</span>
                      <span className="res-value badge">{groutKg} kg</span>
                    </div>
                    <div className="calc-res-item">
                      <span className="res-label">Yaklaşık Ağırlık</span>
                      <span className="res-value">~{(totalWeightKg / 1000).toFixed(2)} Ton ({totalWeightKg} kg)</span>
                    </div>

                    {grossM2 > 0 && (
                      <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                        <button
                          type="button"
                          onClick={() => {
                            const quoteMsg = `Hesaplanan Metraj & Sarfiyat: Net ${netM2.toFixed(2)} m², Fireli ${grossM2.toFixed(2)} m² (${numBoxes} Kutu), ${kalekimBags} Torba 25kg Kalekim, ${groutKg} kg Derz Dolgusu (~${totalWeightKg} kg)`;
                            setNotes(prev => prev ? `${prev} • ${quoteMsg}` : quoteMsg);
                            setShowCalculatorModal(false);
                            const el = document.querySelector('#quote-form-section');
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="btn-apply-calc-quote"
                        >
                          <Send size={15} />
                          Bu Metraj ve Sarfiyatla Bayiden Fiyat Teklifi İsteyin
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const cleanPhone = (dealer.phone || '').replace(/[\s\-\(\)\+]/g, '');
                            const msg = `*SERAMİK & SARFİYAT HESAP RAPORU*\n*${dealer.name}* Mağazasına\n` +
                              `─────────────────────────────\n` +
                              `Mekanım için yapılan metraj ve malzeme hesabı:\n` +
                              `• Net Alan: *${netM2.toFixed(2)} m²*\n` +
                              `• Fireli Sipariş: *${grossM2.toFixed(2)} m²* (~${numBoxes} Kutu)\n` +
                              `• Kalekim İhtiyacı: *${kalekimBags} Torba* (25kg Flex)\n` +
                              `• Derz Dolgusu: *${groutKg} kg*\n` +
                              `• Tahmini Tonaj: *~${(totalWeightKg / 1000).toFixed(2)} Ton*\n` +
                              `─────────────────────────────\n` +
                              `Bu sarfiyata göre toplam fiyat teklifi alabilir miyim?`;
                            const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}` : `https://wa.me/?text=${encodeURIComponent(msg)}`;
                            window.open(waUrl, '_blank');
                          }}
                          className="btn-calc-whatsapp"
                        >
                          <MessageSquare size={15} />
                          WhatsApp ile Bayiye İlet
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

