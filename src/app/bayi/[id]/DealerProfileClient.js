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
  Layers
} from 'lucide-react';
import './dealer-profile.css';

export default function DealerProfileClient({ dealer, products }) {
  const [galleryTab, setGalleryTab] = useState(dealer.virtualTourUrl ? '3d' : 'photos');
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [iframeLoading, setIframeLoading] = useState(true);

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
  }, [dealer?.id]);

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

  return (
    <div className="profile-page-wrapper" style={{ '--accent-gold': primaryColor, '--accent-gold-rgb': primaryRgb }}>
      {/* Header Bar */}
      <div className="profile-header-bar">
        <Link href="/" className="back-link">
          <ChevronLeft size={16} />
          Geri Dön
        </Link>
        <div className="header-title-container">
          <span className="header-title">Yetkili Bayi Profili</span>
          <span className="header-dot"></span>
        </div>
        <div style={{ width: '100px' }} className="desktop-header-spacer"></div>
      </div>

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
              href={featuredProductsList.length > 0 ? `/kiosk?productId=${encodeURIComponent(featuredProductsList[0].id)}&code=${encodeURIComponent(featuredProductsList[0].code || '')}` : "/kiosk"} 
              onClick={() => {
                if (featuredProductsList.length > 0) {
                  try {
                    const prod = featuredProductsList[0];
                    const selectedObj = {
                      ...prod,
                      textureUrl: prod.textureUrl || prod.imageUrl || getTextureFallback(prod),
                      imageUrl: prod.imageUrl || prod.textureUrl || getTextureFallback(prod)
                    };
                    sessionStorage.setItem('kiosk_selected_product', JSON.stringify(selectedObj));
                  } catch(e) {}
                }
              }}
              className="btn-3d-studio-hero"
            >
              <Sparkles size={16} />
              3D Banyo Stüdyosu'nda Kapla
            </Link>
            <a 
              href={`https://wa.me/${dealer.phone.replace(/[\s\-\(\)\+]/g, '')}?text=Merhaba%2C%20SeramikBak%20profil%20sayfan%C4%B1zdan%20ula%C5%9F%C4%B1yorum.%20Showroom%27daki%20seramikleriniz%20hakk%C4%B1nda%20bilgi%20alabilir%20miyim%3F`} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={() => trackAction('WHATSAPP')}
              className="btn-whatsapp"
            >
              <MessageSquare size={16} />
              WhatsApp Destek
            </a>
            <a 
              href={`tel:${dealer.phone}`}
              onClick={() => trackAction('PHONE')}
              className="btn-call"
            >
              <Phone size={16} />
              Hemen Ara
            </a>
            <a 
              href={`https://www.google.com/maps/dir/?api=1&destination=${dealer.lat},${dealer.lng}`} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={() => trackAction('DIRECTIONS')}
              className="btn-maps"
            >
              <Compass size={16} />
              Yol Tarifi
            </a>

            {/* Social Media Links */}
            {(dealer.socialInstagram || dealer.socialFacebook || dealer.socialLinkedin || dealer.socialYoutube || dealer.socialWebsite) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
                {dealer.socialInstagram && (
                  <a href={dealer.socialInstagram.startsWith('http') ? dealer.socialInstagram : `https://${dealer.socialInstagram}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(255,255,255,0.12)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.25)', backdropFilter: 'blur(4px)', transition: 'all 0.2s' }} title="Instagram Sayfası">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                  </a>
                )}
                {dealer.socialFacebook && (
                  <a href={dealer.socialFacebook.startsWith('http') ? dealer.socialFacebook : `https://${dealer.socialFacebook}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(255,255,255,0.12)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.25)', backdropFilter: 'blur(4px)', transition: 'all 0.2s' }} title="Facebook Sayfası">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                  </a>
                )}
                {dealer.socialLinkedin && (
                  <a href={dealer.socialLinkedin.startsWith('http') ? dealer.socialLinkedin : `https://${dealer.socialLinkedin}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(255,255,255,0.12)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.25)', backdropFilter: 'blur(4px)', transition: 'all 0.2s' }} title="LinkedIn Sayfası">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                  </a>
                )}
                {dealer.socialYoutube && (
                  <a href={dealer.socialYoutube.startsWith('http') ? dealer.socialYoutube : `https://${dealer.socialYoutube}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(255,255,255,0.12)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.25)', backdropFilter: 'blur(4px)', transition: 'all 0.2s' }} title="YouTube Kanalı">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><polygon points="10 15 15 12 10 9 10 15"/></svg>
                  </a>
                )}
                {dealer.socialWebsite && (
                  <a href={dealer.socialWebsite.startsWith('http') ? dealer.socialWebsite : `https://${dealer.socialWebsite}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(255,255,255,0.12)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.25)', backdropFilter: 'blur(4px)', transition: 'all 0.2s' }} title="Resmi İnternet Sitesi">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                  </a>
                )}
              </div>
            )}
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
                  <label className="input-label">Talebiniz / Notlar</label>
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
                  🔥 Kapatıyoruz / Proje Fazlası Fırsat Paletleri
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
                            {item.badgeTag || 'Kapatıyoruz / Proje Fazlası'}
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
                            href={`https://wa.me/${dealer.phone.replace(/[\s\-\(\)\+]/g, '')}?text=${encodeURIComponent(`Merhaba, ${dealer.name} showroom sayfanızdaki "${item.title}" (${item.quantityM2} m², ₺${item.unitPrice}/m²) outlet stoğunuzu satın almak / bilgi almak istiyorum.`)}`}
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
                            {item.price && (
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
                        <div className="product-card-actions-group" style={{ display: 'flex', gap: '8px' }}>
                          <Link 
                            href={`/kiosk?productId=${encodeURIComponent(prod.id)}&code=${encodeURIComponent(prod.code || '')}`}
                            onClick={() => {
                              try {
                                const selectedObj = {
                                  ...prod,
                                  unitPrice: item.price || prod.unitPrice,
                                  textureUrl: prod.textureUrl || prod.imageUrl || getTextureFallback(prod),
                                  imageUrl: prod.imageUrl || prod.textureUrl || getTextureFallback(prod)
                                };
                                sessionStorage.setItem('kiosk_selected_product', JSON.stringify(selectedObj));
                              } catch(e) {}
                            }}
                            className="btn-3d-try-card"
                            title="Bu ürünü 3D Sanal Banyo Stüdyosu'nda canlı uygulayın"
                            style={{ flex: 1, textDecoration: 'none' }}
                          >
                            <Sparkles size={13} />
                            3D'de Kapla
                          </Link>
                          <button 
                            type="button" 
                            onClick={() => handleFeatureClick(prod.id)}
                            className="featured-product-action-btn"
                            style={{ flex: 1 }}
                          >
                            <span>Stoktan Teklif İsteyin</span>
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
                  <div className="product-card-actions-group">
                    <Link 
                      href={`/kiosk?productId=${encodeURIComponent(prod.id)}&code=${encodeURIComponent(prod.code || '')}`}
                      onClick={() => {
                        try {
                          const selectedObj = {
                            ...prod,
                            textureUrl: prod.textureUrl || prod.imageUrl || getTextureFallback(prod),
                            imageUrl: prod.imageUrl || prod.textureUrl || getTextureFallback(prod)
                          };
                          sessionStorage.setItem('kiosk_selected_product', JSON.stringify(selectedObj));
                        } catch(e) {}
                      }}
                      className="btn-3d-try-card"
                      title="Bu ürünü 3D Sanal Banyo Stüdyosu'nda canlı uygulayın"
                    >
                      <Sparkles size={13} />
                      3D'de Kapla
                    </Link>
                    <button 
                      type="button" 
                      onClick={() => handleFeatureClick(prod.id)}
                      className="featured-product-action-btn"
                    >
                      <span>Teklif Talebi Ekle</span>
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
              {referenceProjects.map((proj, idx) => (
                <div key={idx} className="project-card">
                  {proj.imageUrl && (
                    <div className="project-card-image-container">
                      <img 
                        src={proj.imageUrl} 
                        alt={proj.title}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/textures/calacatta_gold.jpg';
                        }}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                    </div>
                  )}
                  <div className="project-card-body">
                    <h3 className="project-card-title">{proj.title}</h3>
                    <p className="project-card-desc">{proj.desc}</p>
                  </div>
                </div>
              ))}
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
          href={`https://wa.me/${dealer.phone.replace(/[\s\-\(\)\+]/g, '')}?text=Merhaba%2C%20SeramikBak%20profil%20sayfan%C4%B1zdan%20ula%C5%9F%C4%B1yorum.%20Showroom%27daki%20seramikleriniz%20hakk%C4%B1nda%20bilgi%20alabilir%20miyim%3F`} 
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
    </div>
  );
}

