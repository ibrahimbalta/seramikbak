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
  ShieldCheck
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

  const safeParseJSON = (str, fallback) => {
    if (!str) return fallback;
    try {
      return JSON.parse(str);
    } catch (e) {
      return fallback;
    }
  };

  const featuredProductIds = safeParseJSON(dealer.featuredProducts, []);
  const campaigns = safeParseJSON(dealer.dealerCampaigns, []);
  const referenceProjects = safeParseJSON(dealer.referenceProjects, []);
  const faqs = safeParseJSON(dealer.dealerFaqs, []);
  const servicesList = dealer.logisticsServices ? dealer.logisticsServices.split(',').filter(Boolean) : [];

  const featuredProductsList = products.filter(p => featuredProductIds.includes(p.id));

  const [openFaqIndex, setOpenFaqIndex] = useState(null);

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

  return (
    <div className="profile-page-wrapper">
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
                      shipping: '🚚 Nakliye Desteği',
                      showroom_stock: '🏬 Hazır Stok',
                      credit_card: '💳 Kart Taksiti',
                      install_support: '🛠️ Usta Desteği'
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
                <span className="stat-number">10+ Yıl</span>
                <span className="stat-label">Deneyim</span>
              </div>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat-item">
              <TrendingUp size={20} className="stat-icon" />
              <div className="hero-stat-content">
                <span className="stat-number">500+</span>
                <span className="stat-label">Mutlu Müşteri</span>
              </div>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat-item">
              <Building2 size={20} className="stat-icon" />
              <div className="hero-stat-content">
                <span className="stat-number">200 m²</span>
                <span className="stat-label">Showroom</span>
              </div>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="profile-actions" style={{ zIndex: 1 }}>
            <a 
              href={`https://wa.me/${dealer.phone.replace(/[\s\-\(\)\+]/g, '')}?text=Merhaba%2C%20SeramikBak%20profil%20sayfan%C4%B1zdan%20ula%C5%9F%C4%B1yorum.%20Showroom%27daki%20seramikleriniz%20hakk%C4%B1nda%20bilgi%20alabilir%20miyim%3F`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-whatsapp"
            >
              <MessageSquare size={16} />
              WhatsApp Destek
            </a>
            <a 
              href={`tel:${dealer.phone}`}
              className="btn-call"
            >
              <Phone size={16} />
              Hemen Ara
            </a>
            <a 
              href={`https://www.google.com/maps/dir/?api=1&destination=${dealer.lat},${dealer.lng}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-maps"
            >
              <Compass size={16} />
              Yol Tarifi
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
                          <div className="tile-face face-front"></div>
                          <div className="tile-face face-back"></div>
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

        {/* SECTION: CAMPAIGNS */}
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
        {dealer.inventories && dealer.inventories.length > 0 && (
          <div className="featured-products-section" style={{ marginTop: '48px' }}>
            <h2 className="section-main-heading" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Building2 size={24} style={{ color: 'var(--accent-gold)' }} />
              Şube Stokları & Hazır Envanter Listesi
            </h2>
            <p style={{ fontSize: '0.86rem', color: '#64748b', textAlign: 'center', marginTop: '-8px', marginBottom: '28px' }}>
              Bayimizin showroomunda sergilenen ve depolarında teslimata hazır bulunan güncel seramik envanteri.
            </p>
            <div className="featured-products-grid">
              {dealer.inventories.map(item => {
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
                      <img src={prod.imageUrl} alt={prod.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <span style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        fontSize: '0.68rem',
                        fontWeight: '800',
                        color: statusColor,
                        background: statusBg,
                        padding: '4px 10px',
                        borderRadius: '20px',
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
                      
                      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                        <div>
                          <span style={{ fontSize: '0.68rem', color: '#64748b', display: 'block' }}>Mevcut Stok</span>
                          <span style={{ fontSize: '0.9rem', fontWeight: '800', color: '#1e293b' }}>
                            {item.status === 'IN_STOCK' ? `${item.stock.toLocaleString('tr-TR')} m²` : (item.status === 'DISPLAY_ONLY' ? 'Teşhir / Numune' : 'Siparişle (3-7 Gün)')}
                          </span>
                        </div>
                        {item.price && (
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '0.68rem', color: '#64748b', display: 'block' }}>Bayi Özel Fiyatı</span>
                            <span style={{ fontSize: '0.95rem', fontWeight: '900', color: 'var(--accent-gold, #b38e47)' }}>
                              ₺{item.price.toLocaleString('tr-TR')} 
                              <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: '500' }}> / m²</span>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => handleFeatureClick(prod.id)}
                      className="featured-product-action-btn"
                    >
                      <span>Stoktan Teklif İsteyin</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

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
                    <img src={prod.imageUrl} alt={prod.name} />
                  </div>
                  <div className="featured-product-info">
                    <span className="featured-product-style">{prod.style} serisi</span>
                    <h3 className="featured-product-name">{prod.name}</h3>
                    <span className="featured-product-meta">Kod: {prod.code} • Ebat: {prod.width}x{prod.height} cm • Yüzey: {prod.finish}</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => handleFeatureClick(prod.id)}
                    className="featured-product-action-btn"
                  >
                    <span>Teklif Talebi Listesine Ekle</span>
                    <ArrowRight size={12} />
                  </button>
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
                      <img src={proj.imageUrl} alt={proj.title} />
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

