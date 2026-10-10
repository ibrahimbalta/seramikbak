'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  X,
  Home as HomeIcon,
  Building2,
  Globe,
  Camera,
  MapPin,
  Smartphone,
  TrendingUp,
  Send,
  CheckCircle,
  Truck,
  ShieldCheck,
  Zap,
  Download,
  Eye,
  ArrowRight,
  FileText,
  SlidersHorizontal,
  ChevronRight,
  Maximize2,
  Check,
  Star,
  Users,
  Compass,
  PhoneCall,
  Store,
  Layers,
  Palette
} from 'lucide-react';

export default function HowItWorksModal({
  isOpen,
  onClose,
  initialTab = 'customers'
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const sliderContainerRef = useRef(null);

  // Sample tile choices for interactive preview
  const sampleTiles = [
    {
      id: 'statuario',
      name: 'Statuario Gold',
      size: '60x120 cm',
      finish: 'Full Lappato Porselen',
      texture: '/textures/calacatta_gold.jpg',
      tag: 'Full Parlak'
    },
    {
      id: 'oak',
      name: 'Natural Oak Ahşap',
      size: '20x120 cm',
      finish: 'Mat R10 Kaymaz',
      texture: '/textures/natural_oak.jpg',
      tag: 'Doğal Ahşap'
    },
    {
      id: 'antrasit',
      name: 'Borneo Antrasit',
      size: '60x60 cm',
      finish: 'Saten Mat Granit',
      texture: '/textures/borneo_antrasit.jpg',
      tag: 'Koyu Mermer'
    }
  ];

  const [selectedSampleTile, setSelectedSampleTile] = useState(sampleTiles[0]);

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Handle Before/After slider drag
  const handleSliderMove = (clientX) => {
    if (!sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percentage);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    handleSliderMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    handleSliderMove(e.clientX);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay animate-fade-in hiw-overlay"
      onClick={onClose}
      style={{ zIndex: 99999 }}
    >
      <div
        className="hiw-modal-shell"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Pull Handle */}
        <div className="hiw-pull-handle" />

        {/* Modal Header */}
        <div className="hiw-header">
          <div className="hiw-header-left">
            <div className="hiw-badge-icon">
              <Sparkles size={20} />
            </div>
            <div className="hiw-header-titles">
              <span className="hiw-top-label">NASIL ÇALIŞIR?</span>
              <h3 className="hiw-title">SeramikBak Platform Rehberi</h3>
              <p className="hiw-subtitle">
                Türkiye&apos;nin ve Dünyanın Lider Akıllı Seramik, 3D Teşhir & İhracat Portalı
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="hiw-close-btn"
            aria-label="Kapat"
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        {/* Segmented 3-Tab Bar (Light Theme) */}
        <div className="hiw-tabs-nav">
          <button
            type="button"
            onClick={() => setActiveTab('customers')}
            className={`hiw-tab-btn ${activeTab === 'customers' ? 'active' : ''}`}
          >
            <HomeIcon size={16} />
            <span className="tab-text-full">Müşteriler İçin (Nasıl Çalışır?)</span>
            <span className="tab-text-short">Müşteriler</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('dealers')}
            className={`hiw-tab-btn ${activeTab === 'dealers' ? 'active' : ''}`}
          >
            <Building2 size={16} />
            <span className="tab-text-full">Seramik Bayileri İçin</span>
            <span className="tab-text-short">Bayiler</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('brands')}
            className={`hiw-tab-btn ${activeTab === 'brands' ? 'active' : ''}`}
          >
            <Globe size={16} />
            <span className="tab-text-full">Markalar & Üreticiler</span>
            <span className="tab-text-short">Markalar</span>
          </button>
        </div>

        {/* ============================================================== */}
        {/* TAB 1: CUSTOMERS (EXACT VISUALS & LIGHT LUXURY FROM IMAGE 2)   */}
        {/* ============================================================== */}
        {activeTab === 'customers' && (
          <div className="hiw-tab-pane animate-fade-in">
            {/* Top Interactive Hero Preview Card */}
            <div className="hiw-hero-card">
              <div className="hiw-hero-info">
                <div className="hiw-pill-badge gold">
                  <Sparkles size={13} />
                  <span>3D SANAL GÖRSELLEŞTİRİCİ</span>
                </div>
                <h2 className="hiw-hero-heading">
                  Hayalindeki Mekânı 3 Adımda Görselleştir
                </h2>
                <p className="hiw-hero-desc">
                  SeramikBak ile seçtiğin seramiği kendi banyo veya salonunda anında deneyebilir,
                  yanlış renk ve desen seçme riskini ortadan kaldırarak hayalindeki tasarımı gerçeğe dönüştürebilirsin.
                </p>

                {/* 3 Value Pillars */}
                <div className="hiw-feature-chips">
                  <div className="hiw-feature-chip">
                    <div className="chip-icon-box">
                      <Layers size={15} />
                    </div>
                    <div className="chip-texts">
                      <strong>Gerçek Ürünler</strong>
                      <span>Katalogdaki binlerce modeli doğrudan dene.</span>
                    </div>
                  </div>

                  <div className="hiw-feature-chip">
                    <div className="chip-icon-box">
                      <ShieldCheck size={15} />
                    </div>
                    <div className="chip-texts">
                      <strong>Güvenli & Yerel İşlem</strong>
                      <span>Fotoğrafların gizlidir, tarayıcında güvenle işlenir.</span>
                    </div>
                  </div>

                  <div className="hiw-feature-chip">
                    <div className="chip-icon-box">
                      <Zap size={15} />
                    </div>
                    <div className="chip-texts">
                      <strong>Anında Sonuç</strong>
                      <span>Yapay zeka ve 3D derinlik motoruyla saniyeler içinde hazır.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interactive Before/After Visualizer Frame (From Image 2) */}
              <div className="hiw-hero-visual-frame">
                <div
                  className="hiw-before-after-box"
                  ref={sliderContainerRef}
                  onMouseDown={() => setIsDragging(true)}
                  onTouchStart={() => setIsDragging(true)}
                >
                  {/* Before (Original Room) */}
                  <img
                    src="/hero/easy_bathroom.jpg"
                    alt="Mekan Öncesi"
                    className="hiw-ba-img"
                  />

                  {/* After (With Tile Applied in Real Perspective) */}
                  <div
                    className="hiw-after-layer"
                    style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}
                  >
                    <img
                      src="/hero/luxury_bathroom.png"
                      alt="Mekan Sonrası Seramik Uygulanmış"
                      className="hiw-ba-img"
                    />
                    <div
                      className="hiw-tile-texture-overlay"
                      style={{
                        backgroundImage: `url(${selectedSampleTile.texture})`,
                        mixBlendMode: 'soft-light'
                      }}
                    />
                  </div>

                  {/* Badges: Öncesi / Sonrası */}
                  <span className="hiw-ba-badge before">Öncesi</span>
                  <span className="hiw-ba-badge after">Sonrası</span>

                  {/* Draggable Divider Handle */}
                  <div
                    className="hiw-ba-slider-line"
                    style={{ left: `${sliderPos}%` }}
                  >
                    <div className="hiw-ba-slider-knob">
                      <span>⟷</span>
                    </div>
                  </div>
                </div>

                {/* Floating Tile Swatch Selector (As on Image 2) */}
                <div className="hiw-floating-tile-card">
                  <div className="tile-card-header">
                    <img
                      src={selectedSampleTile.texture}
                      alt={selectedSampleTile.name}
                      className="tile-card-thumb"
                    />
                    <div className="tile-card-info">
                      <span className="tile-card-badge">{selectedSampleTile.tag}</span>
                      <strong className="tile-card-name">{selectedSampleTile.name}</strong>
                      <span className="tile-card-meta">{selectedSampleTile.size} • {selectedSampleTile.finish}</span>
                    </div>
                  </div>

                  {/* Interactive Swatch Dots */}
                  <div className="tile-swatches-row">
                    <span className="swatches-label">Numuneyi Değiştir:</span>
                    <div className="swatches-pills">
                      {sampleTiles.map((tile) => (
                        <button
                          key={tile.id}
                          type="button"
                          onClick={() => setSelectedSampleTile(tile)}
                          className={`swatch-pill-btn ${selectedSampleTile.id === tile.id ? 'active' : ''}`}
                          title={tile.name}
                        >
                          <img src={tile.texture} alt={tile.name} />
                          <span>{tile.name.split(' ')[0]}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <Link
                    href="/tasarim"
                    onClick={onClose}
                    className="tile-card-action-btn"
                  >
                    <Sparkles size={14} />
                    <span>Bu Ürünü Mekânında Dene</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Section 2: 4-Step Visual Process Grid (Directly from Image 2) */}
            <div className="hiw-steps-section">
              <div className="hiw-section-header">
                <span className="hiw-section-step-tag">ADIM ADIM REHBER</span>
                <h3 className="hiw-section-title">Nasıl Çalışır? 4 Kolay Adımda Hayalindeki Mekân</h3>
              </div>

              <div className="hiw-steps-grid">
                {/* Step 01 */}
                <div className="hiw-step-col">
                  <div className="step-num-pill">01</div>
                  <h4 className="step-title">Mekânını Yükle veya Seç</h4>
                  <p className="step-desc">
                    Kendi banyo veya oda fotoğrafını yükle ya da galerideki hazır mimari şablonlardan birini seç.
                  </p>
                  <div className="step-mockup-card">
                    <div className="mockup-header-dots">
                      <span /><span /><span />
                    </div>
                    <div className="mockup-body upload-demo">
                      <div className="mockup-phone-preview">
                        <Camera size={26} className="mockup-camera-icon" />
                        <span className="mockup-upload-btn">📷 Fotoğraf Yükle</span>
                      </div>
                      <div className="mockup-templates-strip">
                        <img src="/hero/easy_bathroom.jpg" alt="Hazır Banyo" className="active" />
                        <img src="/hero/easy_kitchen.jpg" alt="Hazır Mutfak" />
                        <img src="/hero/modern_living.png" alt="Hazır Salon" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 02 */}
                <div className="hiw-step-col">
                  <div className="step-num-pill">02</div>
                  <h4 className="step-title">Yüzeyi Belirle & Düzenle</h4>
                  <p className="step-desc">
                    Zemin veya duvar yüzeyini seç, köşe pinleriyle perspektifi ayarla, fırça ile maskeyi düzelt.
                  </p>
                  <div className="step-mockup-card">
                    <div className="mockup-header-dots">
                      <span /><span /><span />
                    </div>
                    <div className="mockup-body surface-demo">
                      <div className="surface-buttons-overlay">
                        <span className="surface-btn active">✓ Zemin</span>
                        <span className="surface-btn">Duvar</span>
                      </div>
                      <div className="perspective-mesh-preview">
                        <img src="/hero/easy_bathroom.jpg" alt="Perspektif Ağı" />
                        <div className="mesh-overlay-grid">
                          <span className="pin p1" />
                          <span className="pin p2" />
                          <span className="pin p3" />
                          <span className="pin p4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 03 */}
                <div className="hiw-step-col">
                  <div className="step-num-pill">03</div>
                  <h4 className="step-title">Ürünü Canlı Dene</h4>
                  <p className="step-desc">
                    Seçtiğin seramiğin gerçek dokusu, odana 3D perspektif ve ışık uyumuyla uygulanır. Tek tıkla değiştir.
                  </p>
                  <div className="step-mockup-card">
                    <div className="mockup-header-dots">
                      <span /><span /><span />
                    </div>
                    <div className="mockup-body catalog-demo">
                      <div className="catalog-render-view">
                        <img src="/hero/luxury_bathroom.png" alt="Seramik Döşendi" />
                        <span className="render-live-badge">✨ 3D Render</span>
                      </div>
                      <div className="catalog-tiles-carousel">
                        <div className="mini-tile active">
                          <img src="/textures/calacatta_gold.jpg" alt="Calacatta" />
                        </div>
                        <div className="mini-tile">
                          <img src="/textures/borneo_antrasit.jpg" alt="Borneo" />
                        </div>
                        <div className="mini-tile">
                          <img src="/textures/natural_oak.jpg" alt="Oak" />
                        </div>
                        <div className="mini-tile">
                          <img src="/textures/travertino_classico.jpg" alt="Traverten" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 04 */}
                <div className="hiw-step-col">
                  <div className="step-num-pill">04</div>
                  <h4 className="step-title">Karşılaştır & Teklif Al</h4>
                  <p className="step-desc">
                    Öncesi/sonrası karşılaştır, yüksek kaliteli görseli indir veya en yakın yetkili bayiden fiyat teklifi al.
                  </p>
                  <div className="step-mockup-card">
                    <div className="mockup-header-dots">
                      <span /><span /><span />
                    </div>
                    <div className="mockup-body actions-demo">
                      <div className="split-compare-mini">
                        <img src="/hero/easy_bathroom.jpg" alt="Öncesi" className="half-left" />
                        <img src="/hero/luxury_bathroom.png" alt="Sonrası" className="half-right" />
                        <span className="split-divider-line" />
                      </div>
                      <div className="mockup-buttons-stack">
                        <button type="button" className="mockup-btn outline">
                          <Download size={12} />
                          <span>Görseli İndir</span>
                        </button>
                        <button type="button" className="mockup-btn primary">
                          <MapPin size={12} />
                          <span>Bayiden Teklif Al</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Bottom Trust & Advantages Bar (From Image 2) */}
            <div className="hiw-trust-bar">
              <div className="trust-item">
                <div className="trust-icon-circle">
                  <Palette size={18} />
                </div>
                <div className="trust-texts">
                  <strong>Geniş Ürün Yelpazesi</strong>
                  <span>Binlerce seramik, porselen ve doğaltaş seçeneği</span>
                </div>
              </div>

              <div className="trust-item">
                <div className="trust-icon-circle">
                  <Truck size={18} />
                </div>
                <div className="trust-texts">
                  <strong>Hızlı & Sigortalı Teslimat</strong>
                  <span>Türkiye&apos;nin her yerine güvenli ve hasarsız sevkiyat</span>
                </div>
              </div>

              <div className="trust-item">
                <div className="trust-icon-circle">
                  <ShieldCheck size={18} />
                </div>
                <div className="trust-texts">
                  <strong>Güvenli Alışveriş</strong>
                  <span>Yetkili üretici bayileriyle doğrudan bağlantı</span>
                </div>
              </div>

              <div className="trust-item">
                <div className="trust-icon-circle">
                  <PhoneCall size={18} />
                </div>
                <div className="trust-texts">
                  <strong>Uzman Danışmanlık</strong>
                  <span>Metrekare, usta ve malzeme seçiminde tam destek</span>
                </div>
              </div>
            </div>

            {/* Bottom Primary Actions Bar */}
            <div className="hiw-modal-action-footer">
              <Link
                href="/tasarim"
                onClick={onClose}
                className="hiw-primary-btn"
              >
                <Camera size={18} />
                <span>Hemen Mekânında Gör & Dene</span>
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="hiw-secondary-btn"
              >
                <span>Koleksiyonları İncele</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: DEALERS (YETKİLİ SERAMİK BAYİLERİ & SHOWROOM SAAS)      */}
        {/* ============================================================== */}
        {activeTab === 'dealers' && (
          <div className="hiw-tab-pane animate-fade-in">
            {/* Top Showcase Card for Dealers */}
            <div className="hiw-hero-card dealer-theme">
              <div className="hiw-hero-info">
                <div className="hiw-pill-badge amber">
                  <Building2 size={13} />
                  <span>YETKİLİ BAYİ & SHOWROOM SAAS</span>
                </div>
                <h2 className="hiw-hero-heading">
                  Showroom&apos;unuzu Dijitalleştirin, Şehrinizdeki Müşterileri Çekin
                </h2>
                <p className="hiw-hero-desc">
                  SeramikBak Bayi Portalı; yetkili seramik bayilerinin yerel stoklarını sergilediği,
                  bölgenizdeki seramik arayan ev sahiplerini mağazanıza yönlendiren ve showroom tabletlerinizde
                  3D Teşhir Kiosk hizmeti sunan yeni nesil mağaza teknolojisidir.
                </p>

                {/* 3 Dealer Pillars */}
                <div className="hiw-feature-chips">
                  <div className="hiw-feature-chip">
                    <div className="chip-icon-box amber">
                      <MapPin size={15} />
                    </div>
                    <div className="chip-texts">
                      <strong>Bölgesel Harita Görünürlüğü</strong>
                      <span>Şehrinizde seramik arayan müşteriler doğrudan mağazanızı bulsun.</span>
                    </div>
                  </div>

                  <div className="hiw-feature-chip">
                    <div className="chip-icon-box amber">
                      <Smartphone size={15} />
                    </div>
                    <div className="chip-texts">
                      <strong>Showroom 3D Kiosk Lisansı</strong>
                      <span>Tablette müşterinizin ev fotoğrafına seramiklerinizi canlı döşeyin.</span>
                    </div>
                  </div>

                  <div className="hiw-feature-chip">
                    <div className="chip-icon-box amber">
                      <Send size={15} />
                    </div>
                    <div className="chip-texts">
                      <strong>Canlı Teklif & Sipariş</strong>
                      <span>Bölgenizden gelen m² fiyat taleplerini anında WhatsApp&apos;tan yanıtlayın.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dealer Showcase Graphic Card */}
              <div className="hiw-hero-visual-frame dealer-visual">
                <div className="dealer-preview-card">
                  <div className="dealer-preview-badge">
                    <Store size={14} />
                    <span>Yetkili Showroom Arayüzü</span>
                  </div>
                  <h4 className="dealer-preview-title">Kadıköy Seramik & Mermer Showroom</h4>
                  <div className="dealer-preview-tags">
                    <span className="d-tag">VitrA Yetkili Bayi</span>
                    <span className="d-tag">Çanakkale Seramik</span>
                    <span className="d-tag">Bien Seramik</span>
                  </div>

                  <div className="dealer-stats-grid">
                    <div className="d-stat">
                      <span className="d-stat-val">1.480+</span>
                      <span className="d-stat-lbl">Aylık Ziyaretçi</span>
                    </div>
                    <div className="d-stat">
                      <span className="d-stat-val">64</span>
                      <span className="d-stat-lbl">Canlı Teklif</span>
                    </div>
                    <div className="d-stat">
                      <span className="d-stat-val">%98</span>
                      <span className="d-stat-lbl">Stok Eşleşmesi</span>
                    </div>
                  </div>

                  <div className="dealer-mini-mockup-table">
                    <div className="table-row head">
                      <span>Ürün Adı</span>
                      <span>Stok</span>
                      <span>Durum</span>
                    </div>
                    <div className="table-row">
                      <span>Statuario 60x120</span>
                      <strong className="text-green">480 m²</strong>
                      <span className="status-pill active">Stokta</span>
                    </div>
                    <div className="table-row">
                      <span>Natural Oak 20x120</span>
                      <strong className="text-green">260 m²</strong>
                      <span className="status-pill active">Stokta</span>
                    </div>
                  </div>

                  <Link href="/bayi" onClick={onClose} className="dealer-preview-cta">
                    <Building2 size={15} />
                    <span>Bayi Paneline Giriş Yap</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* 4 Steps for Dealers */}
            <div className="hiw-steps-section">
              <div className="hiw-section-header">
                <span className="hiw-section-step-tag amber">BAYİ ENTEGRASYON SÜRECİ</span>
                <h3 className="hiw-section-title">Bayiler İçin 4 Adımda Dijitalleşme & Satış Artışı</h3>
              </div>

              <div className="hiw-steps-grid">
                {/* Dealer Step 1 */}
                <div className="hiw-step-col">
                  <div className="step-num-pill amber">01</div>
                  <h4 className="step-title">Showroomunuzu Kaydedin</h4>
                  <p className="step-desc">
                    Şehriniz, adresiniz ve yetkili olduğunuz markalarla (VitrA, Kale, Bien vb.) onaylı showroom profilinizi açın.
                  </p>
                  <div className="step-mockup-card">
                    <div className="mockup-header-dots">
                      <span /><span /><span />
                    </div>
                    <div className="mockup-body dealer-card-demo">
                      <div className="dealer-badge-sample">
                        <CheckCircle size={16} color="#d97706" />
                        <span>Doğrulanmış Yetkili Bayi</span>
                      </div>
                      <p className="dealer-sample-name">Örnek Showroom A.Ş.</p>
                      <span className="dealer-sample-city">📍 Beşiktaş, İstanbul</span>
                    </div>
                  </div>
                </div>

                {/* Dealer Step 2 */}
                <div className="hiw-step-col">
                  <div className="step-num-pill amber">02</div>
                  <h4 className="step-title">Stok & Fiyatları Yükleyin</h4>
                  <p className="step-desc">
                    Excel, XML veya ERP entegrasyonuyla mağazanızdaki karo stoklarını yükleyin, bölgenizdeki aramalarda canlı çıkın.
                  </p>
                  <div className="step-mockup-card">
                    <div className="mockup-header-dots">
                      <span /><span /><span />
                    </div>
                    <div className="mockup-body dealer-card-demo">
                      <div className="stock-sync-preview">
                        <FileText size={18} color="#d97706" />
                        <span>Excel / ERP Canlı Senkronizasyon</span>
                      </div>
                      <div className="stock-progress-bar">
                        <div className="bar-fill" style={{ width: '85%' }} />
                      </div>
                      <span className="stock-count-text">850 m² aktif karo stoğu yüklendi</span>
                    </div>
                  </div>
                </div>

                {/* Dealer Step 3 */}
                <div className="hiw-step-col">
                  <div className="step-num-pill amber">03</div>
                  <h4 className="step-title">Showroomda 3D Kiosk Kullanın</h4>
                  <p className="step-desc">
                    Müşteriniz cep telefonuyla odasını göstersin; siz showroom tabletinde seramiğinizi evine canlı döşeyip satışı kapatın.
                  </p>
                  <div className="step-mockup-card">
                    <div className="mockup-header-dots">
                      <span /><span /><span />
                    </div>
                    <div className="mockup-body dealer-card-demo">
                      <div className="kiosk-mode-box">
                        <Smartphone size={22} color="#d97706" />
                        <strong>Tablet Kiosk Modu Aktif</strong>
                        <span>Dokunmatik ekranda 3D mekan teşhiri</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dealer Step 4 */}
                <div className="hiw-step-col">
                  <div className="step-num-pill amber">04</div>
                  <h4 className="step-title">Teklifleri Satışa Çevirin</h4>
                  <p className="step-desc">
                    Müşterilerin gönderdiği metrekare taleplerini WhatsApp veya bayi panelinizden anında yanıtlayıp satışı tamamlayın.
                  </p>
                  <div className="step-mockup-card">
                    <div className="mockup-header-dots">
                      <span /><span /><span />
                    </div>
                    <div className="mockup-body dealer-card-demo">
                      <div className="lead-bubble-sample">
                        <strong>Yeni Müşteri Teklifi (45 m²)</strong>
                        <span>Statuario Gold 60x120 cm</span>
                        <div className="wa-reply-btn">
                          <span>💬 WhatsApp&apos;tan Yanıtla</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dealer Trust & Benefits */}
            <div className="hiw-trust-bar">
              <div className="trust-item">
                <div className="trust-icon-circle amber">
                  <Users size={18} />
                </div>
                <div className="trust-texts">
                  <strong>Hazır Alıcı Kitlesi</strong>
                  <span>Şehrinizdeki binlerce ev sahibi ve müteahhit doğrudan size ulaşır</span>
                </div>
              </div>

              <div className="trust-item">
                <div className="trust-icon-circle amber">
                  <Layers size={18} />
                </div>
                <div className="trust-texts">
                  <strong>B2B Stok Borsası</strong>
                  <span>Fazla veya beklemedeki partileri diğer bayilerle takas edin</span>
                </div>
              </div>

              <div className="trust-item">
                <div className="trust-icon-circle amber">
                  <CheckCircle size={18} />
                </div>
                <div className="trust-texts">
                  <strong>Komisyonsuz Model</strong>
                  <span>Müşteriyle doğrudan temas, komisyon veya gizli kesinti yok</span>
                </div>
              </div>

              <div className="trust-item">
                <div className="trust-icon-circle amber">
                  <TrendingUp size={18} />
                </div>
                <div className="trust-texts">
                  <strong>Pazar Trend Analitiği</strong>
                  <span>Bölgenizde en çok aranan ebat ve renkleri önceden görün</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions for Dealers */}
            <div className="hiw-modal-action-footer">
              <Link
                href="/bayi"
                onClick={onClose}
                className="hiw-primary-btn amber"
              >
                <Building2 size={18} />
                <span>Hemen Bayi Başvurusu Yap / Giriş Yap</span>
              </Link>
              <Link
                href="/kiosk"
                onClick={onClose}
                className="hiw-secondary-btn"
              >
                <span>Showroom Kiosk Deneyimini Gör</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: BRANDS & MANUFACTURERS (SERAMİK ÜRETİCİLERİ & FABRİKALAR) */}
        {/* ============================================================== */}
        {activeTab === 'brands' && (
          <div className="hiw-tab-pane animate-fade-in">
            {/* Top Showcase Card for Brands */}
            <div className="hiw-hero-card brand-theme">
              <div className="hiw-hero-info">
                <div className="hiw-pill-badge blue">
                  <Globe size={13} />
                  <span>SERAMİK MARKALARI & İMALATÇILARI İÇİN</span>
                </div>
                <h2 className="hiw-hero-heading">
                  Koleksiyonlarınızı 3D Dijitalleştirin, Global Bayi & İhracat Ağı Kurun
                </h2>
                <p className="hiw-hero-desc">
                  SeramikBak; VitrA, Kalebodur, Kütahya, Bien, Ege, QUA gibi Türkiye&apos;nin lider üreticilerinin seramik
                  koleksiyonlarını Web-3D ve AR altyapısına dönüştürerek hem yurt içi bayi ağına hem de 16+ ülkede ihracat
                  alıcılarına sunar.
                </p>

                {/* 3 Brand Pillars */}
                <div className="hiw-feature-chips">
                  <div className="hiw-feature-chip">
                    <div className="chip-icon-box blue">
                      <Globe size={15} />
                    </div>
                    <div className="chip-texts">
                      <strong>Global 3D Teşhir</strong>
                      <span>Tüm karo ve porselen serilerinizi Web-3D ve AR formatında sergileyin.</span>
                    </div>
                  </div>

                  <div className="hiw-feature-chip">
                    <div className="chip-icon-box blue">
                      <Send size={15} />
                    </div>
                    <div className="chip-texts">
                      <strong>16+ Ülke İhracat Hub</strong>
                      <span>Uluslararası mimar, müteahhit ve ithalatçılara doğrudan ulaşın.</span>
                    </div>
                  </div>

                  <div className="hiw-feature-chip">
                    <div className="chip-icon-box blue">
                      <TrendingUp size={15} />
                    </div>
                    <div className="chip-texts">
                      <strong>Gerçek Zamanlı Trend Analitiği</strong>
                      <span>Hangi bölgede hangi ebat, desen ve rengin arandığını anlık izleyin.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Brand Showcase Graphic Card */}
              <div className="hiw-hero-visual-frame brand-visual">
                <div className="brand-preview-card">
                  <div className="brand-preview-badge">
                    <Globe size={14} />
                    <span>Global B2B Üretici Paneli</span>
                  </div>
                  <h4 className="brand-preview-title">Üretici Portföy Yönetimi & İhracat</h4>
                  <div className="brand-preview-tags">
                    <span className="b-tag">3D Dijital İkiz</span>
                    <span className="b-tag">BIM / CAD Hazır</span>
                    <span className="b-tag">16 Dil İhracat</span>
                  </div>

                  <div className="brand-stats-grid">
                    <div className="b-stat">
                      <span className="b-stat-val">2.800+</span>
                      <span className="b-stat-lbl">Koleksiyon Karosu</span>
                    </div>
                    <div className="b-stat">
                      <span className="b-stat-val">340+</span>
                      <span className="b-stat-lbl">Aktif Bayi Ağı</span>
                    </div>
                    <div className="b-stat">
                      <span className="b-stat-val">16</span>
                      <span className="b-stat-lbl">İhracat Ülkesi</span>
                    </div>
                  </div>

                  <div className="brand-export-flags">
                    <span className="flag-chip">🇩🇪 Almanya</span>
                    <span className="flag-chip">🇮🇹 İtalya</span>
                    <span className="flag-chip">🇦🇪 BAE</span>
                    <span className="flag-chip">🇺🇸 ABD</span>
                    <span className="flag-chip">🇫🇷 Fransa</span>
                  </div>

                  <Link href="/marka" onClick={onClose} className="brand-preview-cta">
                    <Globe size={15} />
                    <span>Marka Portalına Giriş Yap</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* 4 Steps for Brands */}
            <div className="hiw-steps-section">
              <div className="hiw-section-header">
                <span className="hiw-section-step-tag blue">ÜRETİCİ ENTEGRASYON SÜRECİ</span>
                <h3 className="hiw-section-title">Markalar İçin 4 Adımda Dijital Teşhir & İhracat</h3>
              </div>

              <div className="hiw-steps-grid">
                {/* Brand Step 1 */}
                <div className="hiw-step-col">
                  <div className="step-num-pill blue">01</div>
                  <h4 className="step-title">Koleksiyonları 3D&apos;ye Aktarın</h4>
                  <p className="step-desc">
                    Yüksek çözünürlüklü doku taramalarını, rölyef ve derz haritalarını 3D motorumuza bağlayıp dijital ikizleri oluşturun.
                  </p>
                  <div className="step-mockup-card">
                    <div className="mockup-header-dots">
                      <span /><span /><span />
                    </div>
                    <div className="mockup-body brand-card-demo">
                      <div className="texture-scan-box">
                        <Layers size={18} color="#0284c7" />
                        <span>PBR 3D Yüzey Taraması (60x120, 120x240)</span>
                      </div>
                      <span className="scan-status-text">✓ Fotogerçekçi Derinlik ve Işık Yansıması</span>
                    </div>
                  </div>
                </div>

                {/* Brand Step 2 */}
                <div className="hiw-step-col">
                  <div className="step-num-pill blue">02</div>
                  <h4 className="step-title">Bayi Ağınızı Yönetin</h4>
                  <p className="step-desc">
                    Türkiye genelindeki tüm yetkili bayilerinizi tek noktadan dijital katalog ve stok havuzuna bağlayın.
                  </p>
                  <div className="step-mockup-card">
                    <div className="mockup-header-dots">
                      <span /><span /><span />
                    </div>
                    <div className="mockup-body brand-card-demo">
                      <div className="dealer-network-box">
                        <Compass size={18} color="#0284c7" />
                        <strong>81 İl Bayi Dağıtımı</strong>
                        <span>Yeni serileri tek tıkla tüm bayilere açın</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Brand Step 3 */}
                <div className="hiw-step-col">
                  <div className="step-num-pill blue">03</div>
                  <h4 className="step-title">Global Mimari Şartnameler</h4>
                  <p className="step-desc">
                    16 dilde otomatik katalog ve BIM/CAD nesneleriyle yurt dışı mimari ve otel projelerinin şartnamelerine girin.
                  </p>
                  <div className="step-mockup-card">
                    <div className="mockup-header-dots">
                      <span /><span /><span />
                    </div>
                    <div className="mockup-body brand-card-demo">
                      <div className="bim-spec-box">
                        <FileText size={18} color="#0284c7" />
                        <strong>BIM / Revit / CAD İndirilebilir</strong>
                        <span>Global Mimar & Müteahhit Erişimleri</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Brand Step 4 */}
                <div className="hiw-step-col">
                  <div className="step-num-pill blue">04</div>
                  <h4 className="step-title">Pazar Trendlerini Analiz Edin</h4>
                  <p className="step-desc">
                    Kullanıcıların en çok denediği ebat, renk ve desenleri gerçek zamanlı izleyip fabrika üretimini optimize edin.
                  </p>
                  <div className="step-mockup-card">
                    <div className="mockup-header-dots">
                      <span /><span /><span />
                    </div>
                    <div className="mockup-body brand-card-demo">
                      <div className="analytics-trend-box">
                        <TrendingUp size={18} color="#0284c7" />
                        <strong>Büyük Veri & Pazar Eğilimi</strong>
                        <span>En çok aranan: 60x120 Mermer & Traverten</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Brand Trust & Benefits */}
            <div className="hiw-trust-bar">
              <div className="trust-item">
                <div className="trust-icon-circle blue">
                  <FileText size={18} />
                </div>
                <div className="trust-texts">
                  <strong>Sıfır Baskı Maliyeti</strong>
                  <span>Kağıt katalog yerine 365 gün güncellenen dijital arşiv</span>
                </div>
              </div>

              <div className="trust-item">
                <div className="trust-icon-circle blue">
                  <Globe size={18} />
                </div>
                <div className="trust-texts">
                  <strong>365 Gün Global Fuar</strong>
                  <span>Yurt dışı fuar giderlerini azaltan 7/24 açık dijital stand</span>
                </div>
              </div>

              <div className="trust-item">
                <div className="trust-icon-circle blue">
                  <ShieldCheck size={18} />
                </div>
                <div className="trust-texts">
                  <strong>Orijinal Ürün Koruması</strong>
                  <span>Resmi telif, yüksek çözünürlüklü marka ve logo koruması</span>
                </div>
              </div>

              <div className="trust-item">
                <div className="trust-icon-circle blue">
                  <Star size={18} />
                </div>
                <div className="trust-texts">
                  <strong>Podium & Vitrin Önceliği</strong>
                  <span>Yeni koleksiyonları ana sayfada milyonlara öne çıkarma</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions for Brands */}
            <div className="hiw-modal-action-footer">
              <Link
                href="/marka"
                onClick={onClose}
                className="hiw-primary-btn blue"
              >
                <Globe size={18} />
                <span>Marka & Üretici Portalına Gir</span>
              </Link>
              <Link
                href="/global-tanitim"
                onClick={onClose}
                className="hiw-secondary-btn"
              >
                <span>Global İhracat Ağını Keşfet</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Styled JSX (Clean Modern Light Luxury Theme Matching Image 2) */}
      <style jsx>{`
        .hiw-overlay {
          background: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(14px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          position: fixed;
          inset: 0;
          overflow-y: auto;
        }

        .hiw-modal-shell {
          background: #ffffff;
          border-radius: 28px;
          border: 1px solid rgba(212, 175, 55, 0.35);
          box-shadow: 0 25px 70px -15px rgba(15, 23, 42, 0.22), 0 0 30px rgba(212, 175, 55, 0.08);
          max-width: 1040px;
          width: 96%;
          max-height: 92vh;
          overflow-y: auto;
          color: #0f172a;
          padding: 28px 34px;
          position: relative;
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 #f8fafc;
          box-sizing: border-box;
        }

        .hiw-pull-handle {
          display: none;
        }

        /* Header */
        .hiw-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 16px;
          margin-bottom: 20px;
          gap: 16px;
        }

        .hiw-header-left {
          display: flex;
          align-items: center;
          gap: 14px;
          min-width: 0;
        }

        .hiw-badge-icon {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          background: linear-gradient(135deg, rgba(212, 175, 55, 0.18) 0%, rgba(180, 130, 60, 0.08) 100%);
          border: 1px solid rgba(212, 175, 55, 0.4);
          color: #b4823c;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 14px rgba(180, 130, 60, 0.15);
        }

        .hiw-top-label {
          font-size: 0.7rem;
          font-weight: 850;
          color: #b4823c;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .hiw-title {
          font-size: 1.35rem;
          font-weight: 900;
          color: #0f172a;
          margin: 1px 0 0 0;
          font-family: var(--font-title, inherit);
          letter-spacing: -0.01em;
          line-height: 1.25;
        }

        .hiw-subtitle {
          font-size: 0.8rem;
          color: #64748b;
          font-weight: 500;
          margin: 2px 0 0 0;
        }

        .hiw-close-btn {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          color: #475569;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .hiw-close-btn:hover {
          background: #f1f5f9;
          color: #0f172a;
          transform: rotate(90deg);
        }

        /* 3-Tab Segmented Switcher (Light Modern) */
        .hiw-tabs-nav {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 6px;
          background: #f1f5f9;
          padding: 5px;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          margin-bottom: 22px;
        }

        .hiw-tab-btn {
          padding: 11px 14px;
          border-radius: 12px;
          border: none;
          background: transparent;
          color: #64748b;
          font-weight: 750;
          font-size: 0.86rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .hiw-tab-btn:hover {
          color: #0f172a;
          background: rgba(255, 255, 255, 0.6);
        }

        .hiw-tab-btn.active {
          background: linear-gradient(135deg, #b4823c 0%, #92641f 100%);
          color: #ffffff;
          box-shadow: 0 4px 14px rgba(180, 130, 60, 0.3);
        }

        .tab-text-full {
          display: inline;
        }
        .tab-text-short {
          display: none;
        }

        /* Tab Pane Shell */
        .hiw-tab-pane {
          display: flex;
          flex-direction: column;
          gap: 22px;
        }

        /* Hero Card (Light Warm Luxury, As Image 2) */
        .hiw-hero-card {
          background: linear-gradient(135deg, #fdfbf7 0%, #f9f8f4 60%, #f4f2ec 100%);
          border: 1px solid rgba(212, 175, 55, 0.35);
          border-radius: 22px;
          padding: 24px;
          display: grid;
          grid-template-columns: 1.05fr 1fr;
          gap: 24px;
          align-items: center;
          box-shadow: 0 10px 30px rgba(180, 130, 60, 0.06);
        }

        .hiw-hero-card.dealer-theme {
          background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 60%, #fef9c3 100%);
          border-color: rgba(245, 158, 11, 0.4);
        }

        .hiw-hero-card.brand-theme {
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 60%, #f8fafc 100%);
          border-color: rgba(2, 132, 199, 0.35);
        }

        .hiw-pill-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.72rem;
          font-weight: 850;
          padding: 4px 10px;
          border-radius: 20px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .hiw-pill-badge.gold {
          background: rgba(180, 130, 60, 0.12);
          border: 1px solid rgba(180, 130, 60, 0.3);
          color: #92641f;
        }

        .hiw-pill-badge.amber {
          background: rgba(217, 119, 6, 0.12);
          border: 1px solid rgba(217, 119, 6, 0.3);
          color: #b45309;
        }

        .hiw-pill-badge.blue {
          background: rgba(2, 132, 199, 0.12);
          border: 1px solid rgba(2, 132, 199, 0.3);
          color: #0369a1;
        }

        .hiw-hero-heading {
          font-size: 1.45rem;
          font-weight: 900;
          color: #0f172a;
          margin: 0 0 8px 0;
          line-height: 1.25;
          letter-spacing: -0.01em;
          font-family: var(--font-title, inherit);
        }

        .hiw-hero-desc {
          font-size: 0.85rem;
          color: #475569;
          line-height: 1.6;
          margin: 0 0 16px 0;
        }

        /* 3 Value Pillars */
        .hiw-feature-chips {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .hiw-feature-chip {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255, 255, 255, 0.85);
          border: 1px solid rgba(226, 232, 240, 0.9);
          padding: 8px 12px;
          border-radius: 12px;
          box-shadow: 0 2px 6px rgba(15, 23, 42, 0.03);
        }

        .chip-icon-box {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          background: rgba(180, 130, 60, 0.12);
          color: #92641f;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .chip-icon-box.amber {
          background: rgba(217, 119, 6, 0.12);
          color: #b45309;
        }

        .chip-icon-box.blue {
          background: rgba(2, 132, 199, 0.12);
          color: #0369a1;
        }

        .chip-texts {
          display: flex;
          flex-direction: column;
        }

        .chip-texts strong {
          font-size: 0.8rem;
          color: #0f172a;
          font-weight: 750;
        }

        .chip-texts span {
          font-size: 0.72rem;
          color: #64748b;
        }

        /* Interactive Before/After Visualizer Frame (From Image 2) */
        .hiw-hero-visual-frame {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .hiw-before-after-box {
          position: relative;
          height: 230px;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12);
          border: 2px solid #ffffff;
          user-select: none;
          cursor: ew-resize;
        }

        .hiw-ba-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .hiw-after-layer {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }

        .hiw-tile-texture-overlay {
          position: absolute;
          inset: 0;
          background-size: 200px 200px;
          opacity: 0.35;
          pointer-events: none;
        }

        .hiw-ba-badge {
          position: absolute;
          bottom: 12px;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
          z-index: 3;
        }

        .hiw-ba-badge.before {
          left: 12px;
          background: rgba(255, 255, 255, 0.95);
          color: #0f172a;
        }

        .hiw-ba-badge.after {
          right: 12px;
          background: rgba(180, 130, 60, 0.95);
          color: #ffffff;
        }

        .hiw-ba-slider-line {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 2px;
          background: #ffffff;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.4);
          transform: translateX(-50%);
          z-index: 4;
        }

        .hiw-ba-slider-knob {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #ffffff;
          color: #0f172a;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          font-weight: 900;
        }

        /* Floating Product Card (From Image 2) */
        .hiw-floating-tile-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 10px 14px;
          box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .tile-card-header {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .tile-card-thumb {
          width: 44px;
          height: 44px;
          border-radius: 8px;
          object-fit: cover;
          border: 1px solid #e2e8f0;
          flex-shrink: 0;
        }

        .tile-card-info {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .tile-card-badge {
          font-size: 0.65rem;
          color: #92641f;
          font-weight: 800;
          text-transform: uppercase;
        }

        .tile-card-name {
          font-size: 0.88rem;
          color: #0f172a;
          font-weight: 850;
        }

        .tile-card-meta {
          font-size: 0.72rem;
          color: #64748b;
        }

        .tile-swatches-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 4px;
          border-top: 1px dashed #e2e8f0;
          gap: 8px;
        }

        .swatches-label {
          font-size: 0.7rem;
          color: #64748b;
          font-weight: 700;
        }

        .swatches-pills {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .swatch-pill-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          padding: 3px 8px;
          border-radius: 20px;
          font-size: 0.68rem;
          cursor: pointer;
          color: #334155;
          font-weight: 700;
          transition: all 0.2s ease;
        }

        .swatch-pill-btn img {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          object-fit: cover;
        }

        .swatch-pill-btn.active {
          background: #fef3c7;
          border-color: #d97706;
          color: #92400e;
        }

        .tile-card-action-btn {
          background: linear-gradient(135deg, #b4823c 0%, #92641f 100%);
          color: #ffffff;
          border-radius: 10px;
          padding: 8px 12px;
          font-size: 0.78rem;
          font-weight: 800;
          text-decoration: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          box-shadow: 0 4px 12px rgba(180, 130, 60, 0.25);
          transition: transform 0.2s ease;
        }

        .tile-card-action-btn:hover {
          transform: translateY(-1px);
        }

        /* 4-Step Process Section */
        .hiw-steps-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .hiw-section-header {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .hiw-section-step-tag {
          font-size: 0.7rem;
          font-weight: 850;
          color: #b4823c;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .hiw-section-step-tag.amber {
          color: #d97706;
        }

        .hiw-section-step-tag.blue {
          color: #0284c7;
        }

        .hiw-section-title {
          font-size: 1.15rem;
          font-weight: 900;
          color: #0f172a;
          margin: 0;
          letter-spacing: -0.01em;
        }

        .hiw-steps-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
        }

        .hiw-step-col {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          padding: 16px 14px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 4px 14px rgba(15, 23, 42, 0.04);
          transition: all 0.2s ease;
        }

        .hiw-step-col:hover {
          border-color: rgba(180, 130, 60, 0.4);
          box-shadow: 0 8px 20px rgba(180, 130, 60, 0.08);
          transform: translateY(-2px);
        }

        .step-num-pill {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #b4823c 0%, #92641f 100%);
          color: #ffffff;
          font-size: 0.85rem;
          font-weight: 900;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 10px;
          box-shadow: 0 4px 10px rgba(180, 130, 60, 0.25);
        }

        .step-num-pill.amber {
          background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
          box-shadow: 0 4px 10px rgba(217, 119, 6, 0.25);
        }

        .step-num-pill.blue {
          background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
          box-shadow: 0 4px 10px rgba(2, 132, 199, 0.25);
        }

        .step-title {
          font-size: 0.92rem;
          font-weight: 850;
          color: #0f172a;
          margin: 0 0 6px 0;
          line-height: 1.3;
        }

        .step-desc {
          font-size: 0.76rem;
          color: #64748b;
          line-height: 1.5;
          margin: 0 0 12px 0;
          flex: 1;
        }

        /* Mockup Cards inside each step */
        .step-mockup-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .mockup-header-dots {
          display: flex;
          gap: 4px;
          padding: 2px 4px;
        }

        .mockup-header-dots span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #cbd5e1;
        }

        /* Mockup Step 1 Content */
        .mockup-phone-preview {
          background: #0f172a;
          border-radius: 10px;
          padding: 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          color: #ffffff;
        }

        .mockup-camera-icon {
          color: #b4823c;
        }

        .mockup-upload-btn {
          font-size: 0.65rem;
          font-weight: 800;
          background: rgba(255, 255, 255, 0.15);
          padding: 3px 8px;
          border-radius: 6px;
        }

        .mockup-templates-strip {
          display: flex;
          gap: 4px;
          margin-top: 6px;
        }

        .mockup-templates-strip img {
          width: 33%;
          height: 38px;
          object-fit: cover;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
        }

        .mockup-templates-strip img.active {
          border-color: #b4823c;
        }

        /* Mockup Step 2 Content */
        .surface-demo {
          position: relative;
        }

        .surface-buttons-overlay {
          display: flex;
          gap: 4px;
          margin-bottom: 6px;
        }

        .surface-btn {
          font-size: 0.62rem;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: 4px;
          background: #e2e8f0;
          color: #334155;
        }

        .surface-btn.active {
          background: #0f172a;
          color: #ffffff;
        }

        .perspective-mesh-preview {
          position: relative;
          height: 80px;
          border-radius: 8px;
          overflow: hidden;
        }

        .perspective-mesh-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .mesh-overlay-grid {
          position: absolute;
          inset: 0;
          background: rgba(212, 175, 55, 0.22);
          border: 1.5px dashed #b4823c;
        }

        .mesh-overlay-grid .pin {
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #ffffff;
          border: 2px solid #b4823c;
        }

        .mesh-overlay-grid .p1 { top: 30%; left: 15%; }
        .mesh-overlay-grid .p2 { top: 30%; right: 15%; }
        .mesh-overlay-grid .p3 { bottom: 5%; right: 5%; }
        .mesh-overlay-grid .p4 { bottom: 5%; left: 5%; }

        /* Mockup Step 3 Content */
        .catalog-render-view {
          position: relative;
          height: 60px;
          border-radius: 8px;
          overflow: hidden;
        }

        .catalog-render-view img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .render-live-badge {
          position: absolute;
          top: 4px;
          right: 4px;
          font-size: 0.58rem;
          font-weight: 800;
          background: rgba(0, 0, 0, 0.65);
          color: #ffffff;
          padding: 2px 5px;
          border-radius: 4px;
        }

        .catalog-tiles-carousel {
          display: flex;
          gap: 4px;
          margin-top: 6px;
          background: #0f172a;
          padding: 4px;
          border-radius: 8px;
        }

        .mini-tile {
          flex: 1;
          height: 24px;
          border-radius: 4px;
          overflow: hidden;
          opacity: 0.6;
          border: 1px solid transparent;
        }

        .mini-tile.active {
          opacity: 1;
          border-color: #b4823c;
        }

        .mini-tile img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* Mockup Step 4 Content */
        .split-compare-mini {
          position: relative;
          height: 60px;
          border-radius: 8px;
          overflow: hidden;
          display: flex;
        }

        .half-left, .half-right {
          width: 50%;
          height: 100%;
          object-fit: cover;
        }

        .split-divider-line {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 50%;
          width: 2px;
          background: #ffffff;
          transform: translateX(-50%);
        }

        .mockup-buttons-stack {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-top: 6px;
        }

        .mockup-btn {
          border-radius: 6px;
          padding: 4px 6px;
          font-size: 0.62rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          cursor: pointer;
          border: none;
        }

        .mockup-btn.outline {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          color: #334155;
        }

        .mockup-btn.primary {
          background: #b4823c;
          color: #ffffff;
        }

        /* Dealer & Brand Visual Graphic Cards */
        .dealer-preview-card, .brand-preview-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 16px;
          box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .dealer-preview-badge, .brand-preview-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.7rem;
          font-weight: 800;
          color: #d97706;
          text-transform: uppercase;
        }

        .brand-preview-badge {
          color: #0284c7;
        }

        .dealer-preview-title, .brand-preview-title {
          font-size: 1rem;
          font-weight: 900;
          color: #0f172a;
          margin: 0;
        }

        .dealer-preview-tags, .brand-preview-tags {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .d-tag, .b-tag {
          font-size: 0.68rem;
          font-weight: 750;
          padding: 3px 8px;
          border-radius: 6px;
          background: #fef3c7;
          color: #92400e;
        }

        .b-tag {
          background: #e0f2fe;
          color: #0369a1;
        }

        .dealer-stats-grid, .brand-stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          background: #f8fafc;
          padding: 10px;
          border-radius: 10px;
          text-align: center;
        }

        .d-stat-val, .b-stat-val {
          display: block;
          font-size: 1.05rem;
          font-weight: 900;
          color: #0f172a;
        }

        .d-stat-lbl, .b-stat-lbl {
          font-size: 0.65rem;
          color: #64748b;
          font-weight: 600;
        }

        .dealer-mini-mockup-table {
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 0.72rem;
          background: #f8fafc;
          padding: 8px;
          border-radius: 8px;
        }

        .table-row {
          display: flex;
          justify-content: space-between;
          padding: 3px 0;
        }

        .table-row.head {
          font-weight: 800;
          color: #64748b;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 4px;
        }

        .text-green {
          color: #16a34a;
        }

        .status-pill.active {
          background: #dcfce7;
          color: #15803d;
          font-size: 0.62rem;
          font-weight: 800;
          padding: 1px 6px;
          border-radius: 4px;
        }

        .brand-export-flags {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .flag-chip {
          font-size: 0.72rem;
          font-weight: 750;
          background: #f1f5f9;
          padding: 3px 8px;
          border-radius: 6px;
          color: #334155;
        }

        .dealer-preview-cta, .brand-preview-cta {
          background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
          color: #ffffff;
          border-radius: 10px;
          padding: 9px;
          font-size: 0.8rem;
          font-weight: 800;
          text-decoration: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .brand-preview-cta {
          background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
        }

        /* Mockup Demos for Dealers & Brands */
        .dealer-card-demo, .brand-card-demo {
          padding: 10px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .dealer-badge-sample {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 0.68rem;
          font-weight: 800;
          color: #d97706;
        }

        .dealer-sample-name {
          font-size: 0.8rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
        }

        .dealer-sample-city {
          font-size: 0.68rem;
          color: #64748b;
        }

        .stock-sync-preview, .texture-scan-box {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.68rem;
          font-weight: 750;
          color: #0f172a;
        }

        .stock-progress-bar {
          height: 6px;
          background: #e2e8f0;
          border-radius: 3px;
          overflow: hidden;
        }

        .bar-fill {
          height: 100%;
          background: #d97706;
          border-radius: 3px;
        }

        .stock-count-text, .scan-status-text {
          font-size: 0.65rem;
          color: #16a34a;
          font-weight: 750;
        }

        .kiosk-mode-box, .dealer-network-box, .bim-spec-box, .analytics-trend-box {
          display: flex;
          flex-direction: column;
          gap: 3px;
          font-size: 0.68rem;
        }

        .kiosk-mode-box strong, .dealer-network-box strong, .bim-spec-box strong, .analytics-trend-box strong {
          color: #0f172a;
          font-weight: 800;
        }

        .kiosk-mode-box span, .dealer-network-box span, .bim-spec-box span, .analytics-trend-box span {
          color: #64748b;
        }

        .lead-bubble-sample {
          background: #ffffff;
          border: 1px solid #fed7aa;
          border-radius: 8px;
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .lead-bubble-sample strong {
          font-size: 0.72rem;
          color: #9a3412;
        }

        .lead-bubble-sample span {
          font-size: 0.68rem;
          color: #64748b;
        }

        .wa-reply-btn {
          margin-top: 4px;
          background: #22c55e;
          color: #ffffff;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 0.65rem;
          font-weight: 800;
          text-align: center;
        }

        /* Trust Bar (Bottom Strip) */
        .hiw-trust-bar {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 14px 18px;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }

        .trust-item {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .trust-icon-circle {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(180, 130, 60, 0.12);
          color: #b4823c;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .trust-icon-circle.amber {
          background: rgba(217, 119, 6, 0.12);
          color: #d97706;
        }

        .trust-icon-circle.blue {
          background: rgba(2, 132, 199, 0.12);
          color: #0284c7;
        }

        .trust-texts {
          display: flex;
          flex-direction: column;
        }

        .trust-texts strong {
          font-size: 0.78rem;
          color: #0f172a;
          font-weight: 800;
        }

        .trust-texts span {
          font-size: 0.7rem;
          color: #64748b;
          line-height: 1.3;
        }

        /* Action Footer */
        .hiw-modal-action-footer {
          display: flex;
          align-items: center;
          gap: 12px;
          padding-top: 4px;
        }

        .hiw-primary-btn {
          flex: 1;
          height: 48px;
          border-radius: 14px;
          background: linear-gradient(135deg, #b4823c 0%, #92641f 100%);
          color: #ffffff;
          font-size: 0.92rem;
          font-weight: 850;
          text-decoration: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 4px 18px rgba(180, 130, 60, 0.3);
          transition: all 0.2s ease;
        }

        .hiw-primary-btn.amber {
          background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
          box-shadow: 0 4px 18px rgba(217, 119, 6, 0.3);
        }

        .hiw-primary-btn.blue {
          background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
          box-shadow: 0 4px 18px rgba(2, 132, 199, 0.3);
        }

        .hiw-primary-btn:hover {
          transform: translateY(-1px);
        }

        .hiw-secondary-btn {
          height: 48px;
          padding: 0 24px;
          border-radius: 14px;
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          color: #334155;
          font-size: 0.86rem;
          font-weight: 750;
          text-decoration: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s ease;
        }

        .hiw-secondary-btn:hover {
          background: #f1f5f9;
          color: #0f172a;
        }

        /* Responsive Breakpoints */
        @media (max-width: 900px) {
          .hiw-hero-card {
            grid-template-columns: 1fr;
          }
          .hiw-steps-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .hiw-trust-bar {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .hiw-overlay {
            padding: 0;
            align-items: flex-end;
          }
          .hiw-modal-shell {
            width: 100%;
            max-width: 100%;
            border-radius: 24px 24px 0 0;
            padding: 12px 16px 28px 16px;
            max-height: 90vh;
            border-bottom: none;
            border-left: none;
            border-right: none;
          }
          .hiw-pull-handle {
            display: block;
            width: 40px;
            height: 4px;
            border-radius: 2px;
            background: #cbd5e1;
            margin: 0 auto 12px auto;
          }
          .tab-text-full {
            display: none;
          }
          .tab-text-short {
            display: inline;
          }
          .hiw-steps-grid {
            grid-template-columns: 1fr;
          }
          .hiw-trust-bar {
            grid-template-columns: 1fr;
          }
          .hiw-modal-action-footer {
            flex-direction: column;
          }
          .hiw-primary-btn, .hiw-secondary-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
