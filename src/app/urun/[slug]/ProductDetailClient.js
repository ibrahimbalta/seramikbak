'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { 
  Sparkles, 
  MapPin, 
  ShieldCheck, 
  Share2, 
  Copy, 
  Check, 
  ArrowLeft, 
  Layers, 
  Maximize2, 
  Phone, 
  Send, 
  Box, 
  ChevronRight,
  Building2,
  Eye,
  Calculator,
  X,
  Camera,
  CheckCircle2
} from 'lucide-react';
import { slugify } from '@/lib/slugify';
import { generateTilePreview, loadImage } from '@/components/TilePerspectiveEngine';

const RoomRenovationModal = dynamic(() => import('@/components/RoomRenovationModal'), { ssr: false });

const TURKEY_CITIES = [
  'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Amasya', 'Ankara', 'Antalya', 'Artvin', 'Aydın',
  'Balıkesir', 'Bilecik', 'Bingöl', 'Bitlis', 'Bolu', 'Burdur', 'Bursa', 'Çanakkale', 'Çankırı',
  'Çorum', 'Denizli', 'Diyarbakır', 'Edirne', 'Elazığ', 'Erzincan', 'Erzurum', 'Eskişehir', 'Gaziantep',
  'Giresun', 'Gümüşhane', 'Hakkari', 'Hatay', 'Isparta', 'Mersin', 'İstanbul', 'İzmir', 'Kars',
  'Kastamonu', 'Kayseri', 'Kırklareli', 'Kırşehir', 'Kocaeli', 'Konya', 'Kütahya', 'Malatya', 'Manisa',
  'Kahramanmaraş', 'Mardin', 'Muğla', 'Muş', 'Nevşehir', 'Niğde', 'Ordu', 'Rize', 'Sakarya',
  'Samsun', 'Siirt', 'Sinop', 'Sivas', 'Tekirdağ', 'Tokat', 'Trabzon', 'Tunceli', 'Şanlıurfa',
  'Uşak', 'Van', 'Yozgat', 'Zonguldak', 'Aksaray', 'Bayburt', 'Karaman', 'Kırıkkale', 'Batman',
  'Şırnak', 'Bartın', 'Ardahan', 'Iğdır', 'Yalova', 'Karabük', 'Kilis', 'Osmaniye', 'Düzce'
];

export default function ProductDetailClient({ product, relatedProducts = [], authorizedDealers = [] }) {
  const [activeView, setActiveView] = useState('image'); // 'image' | 'texture' | 'room'
  const [activeTab, setActiveTab] = useState('specs'); // 'specs' | 'dealers' | 'related'
  const [copied, setCopied] = useState(false);
  const [showImageZoom, setShowImageZoom] = useState(false);
  const [showRenovationModal, setShowRenovationModal] = useState(false);
  const [renovationProduct, setRenovationProduct] = useState(product);

  // Auto 3D Studio or Renovation Modal trigger via URL params (?view=3d, ?view=renovate)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const viewParam = urlParams.get('view');
      if (viewParam === '3d' || viewParam === 'studio') {
        handleGoTo3DStudio();
      } else if (viewParam === 'renovate' || viewParam === 'remodel' || viewParam === 'try') {
        setShowRenovationModal(true);
      } else if (viewParam === 'room') {
        setActiveView('room');
      }
    }
  }, []);

  // Geolocation-based nearest dealers
  const [liveDealers, setLiveDealers] = useState(authorizedDealers);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const bId = product.brandId || product.brand?.id || '';
          const pId = product.id || '';
          fetch(`/api/dealers/nearest?brandId=${encodeURIComponent(bId)}&productId=${encodeURIComponent(pId)}&lat=${lat}&lng=${lng}`)
            .then(res => res.json())
            .then(data => {
              if (Array.isArray(data) && data.length > 0) {
                setLiveDealers(data);
              }
            })
            .catch(err => console.warn('Could not fetch nearest dealers by location:', err));
        },
        () => {},
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 }
      );
    }
  }, [product.brandId, product.id]);

  // Area Calculator State
  const [showCalculator, setShowCalculator] = useState(false);
  const [customM2, setCustomM2] = useState('50');
  const [includeWastage, setIncludeWastage] = useState(true);
  
  // Sample Modal State
  const [showSampleModal, setShowSampleModal] = useState(false);
  const [sampleSubmitting, setSampleSubmitting] = useState(false);
  const [sampleSuccess, setSampleSuccess] = useState('');
  const [sampleError, setSampleError] = useState('');
  const [sampleForm, setSampleForm] = useState({
    name: '',
    phone: '',
    email: '',
    city: 'İstanbul',
    district: '',
    address: '',
    notes: ''
  });

  // Quote Modal State
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteSubmitting, setQuoteSubmitting] = useState(false);
  const [quoteSuccess, setQuoteSuccess] = useState('');
  const [quoteError, setQuoteError] = useState('');
  const [quoteForm, setQuoteForm] = useState({
    name: '',
    phone: '',
    email: '',
    city: 'İstanbul',
    areaM2: '150',
    notes: ''
  });

  const brandName = product.brand?.name || 'Seramik';
  const brandSlug = slugify(brandName);
  const productSlug = slugify(`${brandName} ${product.name}`);
  const pageUrl = typeof window !== 'undefined' ? window.location.href : `https://www.seramikbak.com/urun/${productSlug}`;

  // Copy Link
  const handleCopyLink = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // WhatsApp Share URL
  const whatsappShareText = encodeURIComponent(
    `Merhaba! SeramikBak'ta bu karoyu inceledim:\n\n*${brandName} - ${product.name} (${product.width}x${product.height} cm)*\nKod: ${product.code}\n\nİncelemek için tıkla: ${pageUrl}`
  );
  const whatsappUrl = `https://api.whatsapp.com/send?text=${whatsappShareText}`;

  // Submit Sample Order
  const handleSampleSubmit = async (e) => {
    e.preventDefault();
    setSampleSubmitting(true);
    setSampleError('');
    try {
      const res = await fetch('/api/sample-orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          clientName: sampleForm.name,
          clientPhone: sampleForm.phone,
          clientEmail: sampleForm.email,
          city: sampleForm.city,
          district: sampleForm.district,
          address: sampleForm.address,
          notes: sampleForm.notes ? `[Ürün Sayfası] ${sampleForm.notes}` : '[Ürün Sayfası]'
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSampleSuccess(data.message || 'Numune talebiniz alındı!');
        setTimeout(() => {
          setShowSampleModal(false);
          setSampleSuccess('');
        }, 3500);
      } else {
        setSampleError(data.error || 'Numune talebi kaydedilemedi.');
      }
    } catch {
      setSampleError('Bağlantı hatası oluştu, lütfen tekrar deneyin.');
    } finally {
      setSampleSubmitting(false);
    }
  };

  // Submit Quote Request
  const handleQuoteSubmit = async (e) => {
    e.preventDefault();
    setQuoteSubmitting(true);
    setQuoteError('');
    try {
      const activeDealers = liveDealers.length > 0 ? liveDealers : authorizedDealers;
      const res = await fetch('/api/leads/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          dealerId: activeDealers[0]?.id || null,
          clientName: quoteForm.name,
          clientPhone: quoteForm.phone,
          clientEmail: quoteForm.email,
          notes: `[Fiyat Teklifi] İl: ${quoteForm.city}, Metraj: ${quoteForm.areaM2} m². ${quoteForm.notes || ''}`
        })
      });
      const data = await res.json();
      if (res.ok) {
        setQuoteSuccess('Fiyat teklifi talebiniz yetkili bayiye iletildi. En kısa sürede sizinle iletişime geçilecektir.');
        setTimeout(() => {
          setShowQuoteModal(false);
          setQuoteSuccess('');
        }, 3500);
      } else {
        setQuoteError(data.error || 'Teklif gönderilirken bir hata oluştu.');
      }
    } catch {
      setQuoteError('Bağlantı hatası, lütfen tekrar deneyin.');
    } finally {
      setQuoteSubmitting(false);
    }
  };

  // Dimensions & Metric Calculations
  const tileWidth = Number(product.width) || 60;
  const tileHeight = Number(product.height) || tileWidth;
  const productDimensions = `${tileWidth}×${tileHeight} cm`;
  const isSquareTile = Math.abs(tileWidth - tileHeight) < 5;

  const singleTileM2 = (tileWidth * tileHeight) / 10000;
  const tileAreaM2 = singleTileM2 > 0 ? singleTileM2.toFixed(2) : '0.72';

  const tilesPerBox = tileWidth === 60 && tileHeight === 120 ? 2 :
                      tileWidth === 60 && tileHeight === 60 ? 4 :
                      tileWidth === 80 && tileHeight === 80 ? 2 :
                      tileWidth === 20 && tileHeight === 120 ? 6 :
                      tileWidth === 30 && tileHeight === 60 ? 8 :
                      Math.max(1, Math.round(1.44 / (singleTileM2 || 0.72)));
  const boxM2 = (singleTileM2 * tilesPerBox).toFixed(2);

  // Metraj Calculator
  const parsedM2 = parseFloat(customM2) || 0;
  const targetArea = includeWastage ? parsedM2 * 1.1 : parsedM2;
  const calculatedTiles = Math.ceil(targetArea / (singleTileM2 || 0.72));
  const estimatedBoxes = Math.ceil(calculatedTiles / tilesPerBox);

  const openQuoteWithCalculatedArea = () => {
    setQuoteForm(prev => ({ ...prev, areaM2: String(Math.round(targetArea)) }));
    setShowQuoteModal(true);
  };

  const productStyle = product.style || 'Porselen Seramik';
  const productFinish = product.finish || 'Lappato';
  const productSubtitle = `Doğal ${productStyle.toLowerCase()} dokusu, ${productFinish} yüzeyi ve ${productDimensions} ebatıyla mimari mekanlara zarafet katar.`;

  // Texture fallback
  const getTextureFallback = (prod) => {
    if (!prod) return '/textures/calacatta_gold.jpg';
    const str = `${prod.style || ''} ${prod.color || ''} ${prod.name || ''}`.toLowerCase();
    if (str.includes('teak') || str.includes('ceviz') || str.includes('walnut')) return '/textures/teak_ahsap.jpg';
    if (str.includes('ahşap') || str.includes('wood') || str.includes('oak') || str.includes('meşe')) return '/textures/natural_oak.jpg';
    if (str.includes('beton') || str.includes('concrete') || str.includes('cement') || str.includes('loft')) {
      return (str.includes('antrasit') || str.includes('koyu') || str.includes('black')) ? '/textures/loft_beton.jpg' : '/textures/concrete_light_grey.jpg';
    }
    if (str.includes('bej') || str.includes('beige')) return '/textures/vista_bej.jpg';
    if (str.includes('traverten') || str.includes('travertino')) return '/textures/travertino_classico.jpg';
    if (str.includes('antrasit') || str.includes('siyah') || str.includes('nero') || str.includes('marquina')) return '/textures/albatros_antrasit.jpg';
    return '/textures/calacatta_gold.jpg';
  };

  const handleGoTo3DStudio = (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (typeof window !== 'undefined') {
      try {
        const enrichedForStudio = {
          ...product,
          id: product.id,
          name: product.name,
          slug: product.slug,
          code: product.code || product.sku,
          brandId: product.brandId || product.brand?.id,
          brand: product.brand,
          imageUrl: product.imageUrl,
          textureUrl: product.textureUrl || product.imageUrl,
          width: parseFloat(product.width) || tileWidth || 60,
          height: parseFloat(product.height) || tileHeight || 120,
          finish: product.finish || 'Full Lappato',
          style: product.style || 'Mermer',
          color: product.color || 'Beyaz',
          rectified: product.rectified,
          material: product.material,
          category: product.category,
          thickness: product.thickness
        };
        localStorage.setItem('seramikbak_preselected_product', JSON.stringify(enrichedForStudio));
      } catch (err) {
        console.error('Failed to set preselected product in localStorage:', err);
      }
      const targetParam = product.slug || product.code || product.id;
      window.location.href = `/?tab=studio&product=${encodeURIComponent(targetParam)}#studio`;
    }
  };

  // 3D Room Render preview
  const [roomRenderImage, setRoomRenderImage] = useState(null);

  useEffect(() => {
    if (activeView === 'room' && !roomRenderImage) {
      let isMounted = true;
      const generateProductRoom = async () => {
        try {
          const rawTileSource = product.textureUrl || product.imageUrl || '/textures/calacatta_gold.jpg';
          const isHttp = typeof rawTileSource === 'string' && rawTileSource.startsWith('http');
          const tileSource = isHttp ? `/api/proxy?url=${encodeURIComponent(rawTileSource)}` : rawTileSource;

          const [roomImg, tileImg] = await Promise.all([
            loadImage('/hero/luxury_bathroom.png'),
            loadImage(tileSource).catch(() => loadImage('/hero/hero_ceramics.jpg'))
          ]);

          const surfaces = {
            floor: {
              polygon: [[0, 68], [100, 68], [100, 100], [0, 100]],
              exclude: [[[35, 62], [65, 62], [65, 85], [35, 85]]]
            },
            walls: []
          };

          const renderedUrl = generateTilePreview(roomImg, tileImg, surfaces, {
            groutColor: '#cbd5e1',
            groutWidth: 1.4,
            tileWCm: tileWidth,
            tileHCm: tileHeight,
            finish: product.finish || 'Full Lappato',
            layout: 'straight',
            subdivisions: 28,
          });

          if (isMounted) {
            setRoomRenderImage(renderedUrl);
          }
        } catch {
          if (isMounted) setRoomRenderImage('/hero/luxury_bathroom.png');
        }
      };
      generateProductRoom();
      return () => { isMounted = false; };
    }
  }, [activeView, roomRenderImage, product, tileWidth, tileHeight]);

  const currentDisplayImage = 
    activeView === 'texture' 
      ? (product.textureUrl || product.imageUrl || getTextureFallback(product)) 
      : activeView === 'room'
      ? (roomRenderImage || '/hero/luxury_bathroom.png')
      : (product.imageUrl || product.textureUrl || getTextureFallback(product));

  const displayDealers = liveDealers.length > 0 ? liveDealers : authorizedDealers;

  return (
    <div className="sb-app-page">
      
      {/* ---------------- 1. COMPACT APP BAR / HEADER ---------------- */}
      <header className="sb-app-bar">
        <div className="sb-app-bar-inner">
          <Link href="/" className="sb-back-btn" title="Ana Sayfaya Dön">
            <ArrowLeft size={16} />
          </Link>

          <div className="sb-header-meta">
            <span className="sb-header-brand">{brandName}</span>
            <span className="sb-header-title">{product.name}</span>
          </div>

          <div className="sb-header-actions">
            <button onClick={handleCopyLink} className="sb-icon-btn" title="Bağlantıyı Kopyala">
              {copied ? <Check size={15} style={{ color: '#10b981' }} /> : <Copy size={15} />}
            </button>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="sb-icon-btn sb-wa-btn" title="WhatsApp Paylaş">
              <Share2 size={15} />
            </a>
          </div>
        </div>
      </header>

      {/* ---------------- 2. MAIN APP SHELL ---------------- */}
      <main className="sb-app-container">
        
        {/* HERO SECTION: Symmetrical 2-Column or Stack on Mobile */}
        <div className="sb-hero-grid">
          
          {/* Left Column: Stage & Gallery */}
          <div className="sb-stage-wrap">
            <div className="sb-stage-card">
              <img
                src={currentDisplayImage}
                alt={`${brandName} ${product.name}`}
                className="sb-stage-img"
                style={{
                  objectFit: activeView === 'image' ? 'contain' : 'cover'
                }}
                onError={(e) => {
                  const fallback = getTextureFallback(product);
                  if (e.currentTarget.src !== fallback) e.currentTarget.src = fallback;
                }}
              />

              {/* Badges Top-Left */}
              <div className="sb-stage-badges">
                <span className="sb-badge-brand">{brandName}</span>
                <span className="sb-badge-finish">
                  <Sparkles size={11} style={{ color: '#d4af37' }} />
                  {product.finish || 'Lappato'}
                </span>
              </div>

              {/* Zoom Button Top-Right */}
              <button 
                onClick={() => setShowImageZoom(true)} 
                className="sb-zoom-btn" 
                title="Tam Boyut İncele"
              >
                <Maximize2 size={14} />
              </button>

              {/* View Switcher Pills */}
              <div className="sb-view-tabs">
                <button
                  type="button"
                  onClick={() => setActiveView('image')}
                  className={`sb-view-pill ${activeView === 'image' ? 'active' : ''}`}
                >
                  <Layers size={12} />
                  <span>Plaka</span>
                </button>

                {product.textureUrl && (
                  <button
                    type="button"
                    onClick={() => setActiveView('texture')}
                    className={`sb-view-pill ${activeView === 'texture' ? 'active' : ''}`}
                  >
                    <Eye size={12} />
                    <span>Doku</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => { setRenovationProduct(product); setShowRenovationModal(true); }}
                  className="sb-view-pill sb-pill-gold"
                >
                  <Camera size={12} />
                  <span>Mekânımda Gör</span>
                </button>

                <button
                  type="button"
                  onClick={handleGoTo3DStudio}
                  className="sb-view-pill"
                >
                  <Sparkles size={12} />
                  <span>3D Stüdyo</span>
                </button>
              </div>
            </div>

            {/* Symmetrical 3-Metric Mini Ribbon */}
            <div className="sb-metric-strip">
              <div className="sb-metric-item">
                <span className="sb-metric-lbl">Plaka Alanı</span>
                <span className="sb-metric-val">{tileAreaM2} m²</span>
              </div>
              <div className="sb-metric-item">
                <span className="sb-metric-lbl">Kalite Sınıfı</span>
                <span className="sb-metric-val sb-text-green">1. Kalite TSE</span>
              </div>
              <div className="sb-metric-item">
                <span className="sb-metric-lbl">Kenar Bitişi</span>
                <span className="sb-metric-val sb-text-gold">{product.rectified ? 'Rektifiye (1mm)' : 'Derzli'}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Title, Quick Specs & App Action Hub */}
          <div className="sb-info-wrap">
            
            {/* Identity Bar */}
            <div className="sb-identity-row">
              <Link href={`/marka/${brandSlug}`} className="sb-brand-chip">
                <span>{brandName}</span>
                <ChevronRight size={12} />
              </Link>
              {product.code && (
                <span className="sb-ref-chip">KOD: {product.code}</span>
              )}
            </div>

            <h1 className="sb-product-title">{product.name}</h1>
            <p className="sb-product-desc">{productSubtitle}</p>

            {/* Symmetrical 4-Card Quick Specs Grid */}
            <div className="sb-quick-specs-grid">
              <div className="sb-spec-chip">
                <span className="sb-chip-lbl">Ebat</span>
                <span className="sb-chip-val">{tileWidth}×{tileHeight} cm</span>
              </div>
              <div className="sb-spec-chip">
                <span className="sb-chip-lbl">Yüzey</span>
                <span className="sb-chip-val sb-text-gold">{product.finish || 'Lappato'}</span>
              </div>
              <div className="sb-spec-chip">
                <span className="sb-chip-lbl">Doku</span>
                <span className="sb-chip-val">{product.style || 'Porselen'}</span>
              </div>
              <div className="sb-spec-chip">
                <span className="sb-chip-lbl">Paket / Kutu</span>
                <span className="sb-chip-val">{boxM2} m² ({tilesPerBox} adet)</span>
              </div>
            </div>

            {/* ================= APP ACTION HUB ================= */}
            <div className="sb-action-hub-card">
              
              {/* Row 1: Symmetrical 3D & AI Experience */}
              <div className="sb-hub-sub-title">
                <Sparkles size={13} className="sb-gold-icon" />
                <span>Simülasyon & Görselleştirme</span>
              </div>

              <div className="sb-grid-2">
                <button
                  type="button"
                  onClick={() => { setRenovationProduct(product); setShowRenovationModal(true); }}
                  className="sb-btn-gold"
                >
                  <Camera size={15} />
                  <span>Mekânımda Gör & Dene</span>
                </button>

                <button
                  type="button"
                  onClick={handleGoTo3DStudio}
                  className="sb-btn-glass"
                >
                  <Eye size={15} />
                  <span>3D Tasarım Stüdyosu</span>
                </button>
              </div>

              {/* Row 2: Symmetrical Commerce Actions */}
              <div className="sb-hub-divider" />

              <div className="sb-hub-sub-title">
                <ShieldCheck size={13} className="sb-gold-icon" />
                <span>Fiyat Teklifi & Fiziksel Numune</span>
              </div>

              <div className="sb-grid-2">
                <button
                  type="button"
                  onClick={() => setShowQuoteModal(true)}
                  className="sb-btn-gold-light"
                >
                  <Send size={15} />
                  <span>Fiyat Teklifi Al</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowSampleModal(true)}
                  className="sb-btn-glass"
                >
                  <Box size={15} className="sb-gold-icon" />
                  <span>15×15 Numune İste</span>
                </button>
              </div>

              {/* Row 3: Compact Metraj Calculator Trigger */}
              <div className="sb-calc-trigger-row">
                <button
                  type="button"
                  onClick={() => setShowCalculator(!showCalculator)}
                  className="sb-calc-toggle-btn"
                >
                  <span className="sb-calc-toggle-left">
                    <Calculator size={14} className="sb-gold-icon" />
                    <span>Metraj & Kutu Adedi Hesapla</span>
                  </span>
                  <span className="sb-calc-toggle-arrow">
                    {showCalculator ? 'Kapat ▲' : 'Hesapla ▼'}
                  </span>
                </button>

                {showCalculator && (
                  <div className="sb-calc-drawer">
                    <div className="sb-calc-header">
                      <span className="sb-calc-title">Net Kaplanacak Alan:</span>
                      <label className="sb-calc-fire-label">
                        <input
                          type="checkbox"
                          checked={includeWastage}
                          onChange={(e) => setIncludeWastage(e.target.checked)}
                          className="sb-checkbox"
                        />
                        <span>+%10 Fire Payı</span>
                      </label>
                    </div>

                    <div className="sb-calc-input-row">
                      <div className="sb-calc-input-box">
                        <input
                          type="number"
                          min="1"
                          value={customM2}
                          onChange={(e) => setCustomM2(e.target.value)}
                          placeholder="50"
                          className="sb-calc-input"
                        />
                        <span className="sb-calc-unit">m²</span>
                      </div>

                      <button
                        type="button"
                        onClick={openQuoteWithCalculatedArea}
                        className="sb-calc-quote-btn"
                      >
                        Bu Metrajla Teklif Al →
                      </button>
                    </div>

                    {/* Fast Presets */}
                    <div className="sb-calc-presets">
                      {['15', '30', '50', '100', '200'].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setCustomM2(val)}
                          className={`sb-preset-chip ${customM2 === val ? 'active' : ''}`}
                        >
                          {val} m²
                        </button>
                      ))}
                    </div>

                    {/* Result Pills */}
                    <div className="sb-grid-3" style={{ marginTop: '10px' }}>
                      <div className="sb-calc-res-box">
                        <span className="sb-res-lbl">Gereken Alan</span>
                        <span className="sb-res-val">{targetArea.toFixed(1)} m²</span>
                      </div>
                      <div className="sb-calc-res-box">
                        <span className="sb-res-lbl">Karo Adedi</span>
                        <span className="sb-res-val">{calculatedTiles} adet</span>
                      </div>
                      <div className="sb-calc-res-box">
                        <span className="sb-res-lbl">Tahmini Kutu</span>
                        <span className="sb-res-val">~{estimatedBoxes} kutu</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>

        {/* ---------------- 3. APP SEGMENTED TABS & SECONDARY CONTENT ---------------- */}
        <section className="sb-secondary-section">
          
          {/* Symmetrical 3-Tab Segmented Switcher */}
          <div className="sb-tabs-bar">
            <button
              type="button"
              onClick={() => setActiveTab('specs')}
              className={`sb-tab-btn ${activeTab === 'specs' ? 'active' : ''}`}
            >
              <span>Teknik Şartname (TDS)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('dealers')}
              className={`sb-tab-btn ${activeTab === 'dealers' ? 'active' : ''}`}
            >
              <span>Yetkili Showroomlar ({displayDealers.length})</span>
            </button>

            {relatedProducts.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab('related')}
                className={`sb-tab-btn ${activeTab === 'related' ? 'active' : ''}`}
              >
                <span>Koleksiyonlar ({relatedProducts.length})</span>
              </button>
            )}
          </div>

          {/* TAB 1: Modern Symmetrical TDS Spec Matrix */}
          {activeTab === 'specs' && (
            <div className="sb-tab-content">
              <div className="sb-specs-matrix">
                <div className="sb-matrix-row">
                  <span className="sb-matrix-key">Üretici Marka</span>
                  <span className="sb-matrix-val sb-text-gold">{brandName}</span>
                </div>
                <div className="sb-matrix-row">
                  <span className="sb-matrix-key">Model & Kod</span>
                  <span className="sb-matrix-val font-mono">{product.code || 'MİMARİ-SERİ'}</span>
                </div>
                <div className="sb-matrix-row">
                  <span className="sb-matrix-key">Ebat / Ölçü</span>
                  <span className="sb-matrix-val">{tileWidth} cm × {tileHeight} cm</span>
                </div>
                <div className="sb-matrix-row">
                  <span className="sb-matrix-key">Et Kalınlığı</span>
                  <span className="sb-matrix-val">{product.thickness || 9.5} mm</span>
                </div>
                <div className="sb-matrix-row">
                  <span className="sb-matrix-key">Yüzey Bitişi</span>
                  <span className="sb-matrix-val">{product.finish || 'Mat / Lappato'}</span>
                </div>
                <div className="sb-matrix-row">
                  <span className="sb-matrix-key">Doku & Tipoloji</span>
                  <span className="sb-matrix-val">{product.style || 'Porselen'}</span>
                </div>
                <div className="sb-matrix-row">
                  <span className="sb-matrix-key">Aşınma Dayanımı (PEI)</span>
                  <span className="sb-matrix-val">{product.peiRating ? `PEI ${product.peiRating}` : 'PEI 3-4 (Yoğun Trafik)'}</span>
                </div>
                <div className="sb-matrix-row">
                  <span className="sb-matrix-key">Kaydırmazlık</span>
                  <span className="sb-matrix-val">{product.slipResistance || 'R10 (Islak Zemin Uyumlu)'}</span>
                </div>
                <div className="sb-matrix-row">
                  <span className="sb-matrix-key">Don Dayanımı</span>
                  <span className="sb-matrix-val">{product.frostResistance ? 'Evet (Dış Cephe/Teras)' : 'İç Mekan'}</span>
                </div>
                <div className="sb-matrix-row">
                  <span className="sb-matrix-key">Kenar Bitişi</span>
                  <span className="sb-matrix-val">{product.rectified ? 'Rektifiye (1mm Derz)' : 'Hassas Derzli'}</span>
                </div>
                <div className="sb-matrix-row">
                  <span className="sb-matrix-key">Tavsiye Alanlar</span>
                  <span className="sb-matrix-val">{product.area || 'Banyo, Mutfak, Salon, Islak Hacim'}</span>
                </div>
                <div className="sb-matrix-row">
                  <span className="sb-matrix-key">Kalite Belgesi</span>
                  <span className="sb-matrix-val sb-text-green">TSE EN 14411 - 1. Kalite</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Showroom Dealers Cards */}
          {activeTab === 'dealers' && (
            <div className="sb-tab-content">
              {displayDealers.length === 0 ? (
                <div className="sb-empty-card">
                  <p>Bu marka için kayıtlı bayi bulunamadı.</p>
                </div>
              ) : (
                <div className="sb-dealers-grid">
                  {displayDealers.slice(0, 6).map((dealer) => (
                    <div key={dealer.id} className="sb-dealer-card">
                      <div>
                        <div className="sb-dealer-top">
                          <span className="sb-dealer-city">
                            <Building2 size={13} />
                            <span>{dealer.city} / {dealer.district}</span>
                          </span>
                          {typeof dealer.distanceKm === 'number' && (
                            <span className="sb-dealer-dist">{dealer.distanceKm} km</span>
                          )}
                        </div>
                        <div className="sb-dealer-name">{dealer.name}</div>
                        <div className="sb-dealer-addr">{dealer.address}</div>
                      </div>

                      <div className="sb-grid-2" style={{ marginTop: '12px' }}>
                        <a href={`tel:${dealer.phone}`} className="sb-btn-glass sb-btn-sm">
                          <Phone size={13} style={{ color: '#10b981' }} />
                          <span>Ara</span>
                        </a>
                        <Link href={`/bayi/${slugify(dealer.name)}`} className="sb-btn-outline-gold sb-btn-sm">
                          <span>Showroom</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Related Collections */}
          {activeTab === 'related' && relatedProducts.length > 0 && (
            <div className="sb-tab-content">
              <div className="sb-related-grid">
                {relatedProducts.map((rel) => {
                  const relSlug = slugify(`${brandName} ${rel.name}`);
                  return (
                    <Link key={rel.id} href={`/urun/${relSlug}`} className="sb-rel-card">
                      <div className="sb-rel-thumb-box">
                        <img src={rel.imageUrl} alt={rel.name} className="sb-rel-img" />
                      </div>
                      <div className="sb-rel-info">
                        <span className="sb-rel-brand">{brandName}</span>
                        <div className="sb-rel-title">{rel.name}</div>
                        <span className="sb-rel-specs">{rel.width}×{rel.height} cm • {rel.finish}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

        </section>

      </main>

      {/* ---------------- 4. NATIVE MOBILE STICKY BOTTOM BAR ---------------- */}
      <div className="sb-mobile-sticky-bar">
        <div className="sb-sticky-left">
          <div className="sb-sticky-thumb-box">
            <img src={currentDisplayImage} alt={product.name} className="sb-sticky-thumb" />
          </div>
          <div className="sb-sticky-text">
            <span className="sb-sticky-brand">{brandName}</span>
            <span className="sb-sticky-name">{product.name}</span>
          </div>
        </div>

        <div className="sb-sticky-right">
          <button
            type="button"
            onClick={() => { setRenovationProduct(product); setShowRenovationModal(true); }}
            className="sb-sticky-cam-btn"
            title="Mekânımda Dene"
          >
            <Camera size={16} />
          </button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="sb-sticky-wa-btn"
            title="WhatsApp İle Sor"
          >
            <Share2 size={16} />
          </a>

          <button
            type="button"
            onClick={() => setShowQuoteModal(true)}
            className="sb-sticky-quote-btn"
          >
            <Send size={13} />
            <span>Teklif Al</span>
          </button>
        </div>
      </div>

      {/* ---------------- 5. FULLSCREEN IMAGE ZOOM MODAL ---------------- */}
      {showImageZoom && (
        <div className="sb-modal-backdrop" onClick={() => setShowImageZoom(false)}>
          <button onClick={() => setShowImageZoom(false)} className="sb-modal-close-round">
            <X size={18} />
          </button>
          <img
            src={currentDisplayImage}
            alt={product.name}
            className="sb-zoom-preview-img"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* ---------------- 6. SAMPLE ORDER MODAL ---------------- */}
      {showSampleModal && (
        <div className="sb-modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setShowSampleModal(false); }}>
          <div className="sb-form-modal-card">
            <button onClick={() => setShowSampleModal(false)} className="sb-form-close-btn">
              <X size={16} />
            </button>

            <div className="sb-modal-title-row">
              <Box size={20} className="sb-gold-icon" />
              <h3>15×15 Kesit Numune Talebi</h3>
            </div>
            <p className="sb-modal-sub">
              <strong>{brandName} — {product.name}</strong> modelinden adresinize ücretsiz numune kutusu sevk edilir.
            </p>

            {sampleSuccess ? (
              <div className="sb-success-box">
                <CheckCircle2 size={18} />
                <span>{sampleSuccess}</span>
              </div>
            ) : (
              <form onSubmit={handleSampleSubmit} className="sb-modal-form">
                {sampleError && <div className="sb-error-box">{sampleError}</div>}

                <div>
                  <label className="sb-form-lbl">Adınız Soyadınız *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ad Soyad"
                    value={sampleForm.name}
                    onChange={(e) => setSampleForm({ ...sampleForm, name: e.target.value })}
                    className="sb-form-input"
                  />
                </div>

                <div className="sb-grid-2">
                  <div>
                    <label className="sb-form-lbl">Telefon *</label>
                    <input
                      type="tel"
                      required
                      placeholder="05XX XXX XX XX"
                      value={sampleForm.phone}
                      onChange={(e) => setSampleForm({ ...sampleForm, phone: e.target.value })}
                      className="sb-form-input"
                    />
                  </div>
                  <div>
                    <label className="sb-form-lbl">E-Posta *</label>
                    <input
                      type="email"
                      required
                      placeholder="ornek@mail.com"
                      value={sampleForm.email}
                      onChange={(e) => setSampleForm({ ...sampleForm, email: e.target.value })}
                      className="sb-form-input"
                    />
                  </div>
                </div>

                <div className="sb-grid-2">
                  <div>
                    <label className="sb-form-lbl">Şehir *</label>
                    <select
                      value={sampleForm.city}
                      onChange={(e) => setSampleForm({ ...sampleForm, city: e.target.value })}
                      className="sb-form-input"
                    >
                      {TURKEY_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="sb-form-lbl">İlçe</label>
                    <input
                      type="text"
                      placeholder="İlçe"
                      value={sampleForm.district}
                      onChange={(e) => setSampleForm({ ...sampleForm, district: e.target.value })}
                      className="sb-form-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="sb-form-lbl">Kargo Teslimat Adresi *</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Ofis veya teslimat adresiniz..."
                    value={sampleForm.address}
                    onChange={(e) => setSampleForm({ ...sampleForm, address: e.target.value })}
                    className="sb-form-input"
                  />
                </div>

                <button type="submit" disabled={sampleSubmitting} className="sb-btn-gold sb-btn-full">
                  {sampleSubmitting ? 'Talebiniz İletiliyor...' : 'Numuneyi Ücretsiz Talep Et'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ---------------- 7. QUOTE REQUEST MODAL ---------------- */}
      {showQuoteModal && (
        <div className="sb-modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setShowQuoteModal(false); }}>
          <div className="sb-form-modal-card">
            <button onClick={() => setShowQuoteModal(false)} className="sb-form-close-btn">
              <X size={16} />
            </button>

            <div className="sb-modal-title-row">
              <Send size={20} className="sb-gold-icon" />
              <h3>Yetkili Bayiden Fiyat Teklifi Al</h3>
            </div>
            <p className="sb-modal-sub">
              <strong>{brandName} {product.name}</strong> için projenize özel avantajlı bayi fiyatı sunulur.
            </p>

            {quoteSuccess ? (
              <div className="sb-success-box">
                <CheckCircle2 size={18} />
                <span>{quoteSuccess}</span>
              </div>
            ) : (
              <form onSubmit={handleQuoteSubmit} className="sb-modal-form">
                {quoteError && <div className="sb-error-box">{quoteError}</div>}

                <div>
                  <label className="sb-form-lbl">Ad Soyad / Firma Adı *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ad Soyad veya Firma"
                    value={quoteForm.name}
                    onChange={(e) => setQuoteForm({ ...quoteForm, name: e.target.value })}
                    className="sb-form-input"
                  />
                </div>

                <div className="sb-grid-2">
                  <div>
                    <label className="sb-form-lbl">Telefon *</label>
                    <input
                      type="tel"
                      required
                      placeholder="05XX XXX XX XX"
                      value={quoteForm.phone}
                      onChange={(e) => setQuoteForm({ ...quoteForm, phone: e.target.value })}
                      className="sb-form-input"
                    />
                  </div>
                  <div>
                    <label className="sb-form-lbl">E-Posta *</label>
                    <input
                      type="email"
                      required
                      placeholder="ornek@mail.com"
                      value={quoteForm.email}
                      onChange={(e) => setQuoteForm({ ...quoteForm, email: e.target.value })}
                      className="sb-form-input"
                    />
                  </div>
                </div>

                <div className="sb-grid-2">
                  <div>
                    <label className="sb-form-lbl">Şehir *</label>
                    <select
                      value={quoteForm.city}
                      onChange={(e) => setQuoteForm({ ...quoteForm, city: e.target.value })}
                      className="sb-form-input"
                    >
                      {TURKEY_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="sb-form-lbl">Tahmini Metraj (m²)</label>
                    <input
                      type="number"
                      placeholder="150"
                      value={quoteForm.areaM2}
                      onChange={(e) => setQuoteForm({ ...quoteForm, areaM2: e.target.value })}
                      className="sb-form-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="sb-form-lbl">Proje Notları (Opsiyonel)</label>
                  <textarea
                    rows={2}
                    placeholder="Şantiye teslimi, usta veya uygulama talebi..."
                    value={quoteForm.notes}
                    onChange={(e) => setQuoteForm({ ...quoteForm, notes: e.target.value })}
                    className="sb-form-input"
                  />
                </div>

                <button type="submit" disabled={quoteSubmitting} className="sb-btn-gold sb-btn-full">
                  {quoteSubmitting ? 'İletiliyor...' : 'Teklif Talebini Gönder'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ---------------- 8. ROOM RENOVATION MODAL ---------------- */}
      {showRenovationModal && (
        <RoomRenovationModal
          isOpen={showRenovationModal}
          onClose={() => setShowRenovationModal(false)}
          product={renovationProduct || product}
          relatedProducts={relatedProducts}
          onOpenQuote={(chosenProduct) => {
            setShowRenovationModal(false);
            setShowQuoteModal(true);
            if (chosenProduct) {
              setQuoteForm(prev => ({
                ...prev,
                notes: `Mekânımda Yenile simülasyonu ile seçildi: ${chosenProduct.name} (${chosenProduct.width}x${chosenProduct.height} cm, Kod: ${chosenProduct.code})`
              }));
            }
          }}
        />
      )}

      {/* ---------------- 9. CLEAN MOBILE APP STYLES ---------------- */}
      <style jsx>{`
        .sb-app-page {
          min-height: 100vh;
          background: #080b11;
          color: #f8fafc;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          width: 100%;
          max-width: 100vw;
          overflow-x: hidden;
        }

        /* 1. Header */
        .sb-app-bar {
          position: sticky;
          top: 0;
          z-index: 40;
          background: rgba(8, 11, 17, 0.92);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding: 8px 16px;
        }

        .sb-app-bar-inner {
          max-width: 1140px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .sb-back-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          flex-shrink: 0;
          transition: background 0.15s;
        }
        .sb-back-btn:hover { background: rgba(255, 255, 255, 0.12); }

        .sb-header-meta {
          display: flex;
          flex-direction: column;
          min-width: 0;
          flex: 1;
        }

        .sb-header-brand {
          font-size: 0.65rem;
          color: #d4af37;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          line-height: 1.1;
        }

        .sb-header-title {
          font-size: 0.85rem;
          font-weight: 700;
          color: #ffffff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sb-header-actions {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
        }

        .sb-icon-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #cbd5e1;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.15s;
        }
        .sb-icon-btn:hover { color: #fff; background: rgba(255, 255, 255, 0.12); }
        .sb-wa-btn { color: #25d366; background: rgba(37, 211, 102, 0.1); border-color: rgba(37, 211, 102, 0.25); }

        /* 2. Main Shell */
        .sb-app-container {
          max-width: 1140px;
          margin: 0 auto;
          padding: 16px 14px 75px;
        }

        .sb-hero-grid {
          display: grid;
          grid-template-columns: 460px 1fr;
          gap: 24px;
          align-items: start;
        }

        /* Stage Card */
        .sb-stage-wrap {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .sb-stage-card {
          position: relative;
          aspect-ratio: 4 / 3;
          max-height: 380px;
          background: radial-gradient(ellipse at 50% 40%, rgba(26, 40, 32, 0.5) 0%, #0a0e18 100%);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.6);
        }

        .sb-stage-img {
          width: 100%;
          height: 100%;
          transition: transform 0.3s;
        }

        .sb-stage-badges {
          position: absolute;
          top: 10px;
          left: 10px;
          display: flex;
          align-items: center;
          gap: 6px;
          z-index: 10;
        }

        .sb-badge-brand {
          background: rgba(7, 10, 16, 0.85);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(212, 175, 55, 0.35);
          color: #f1f5f9;
          font-size: 0.64rem;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 9999px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .sb-badge-finish {
          background: rgba(212, 175, 55, 0.14);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(212, 175, 55, 0.35);
          color: #f3d375;
          font-size: 0.64rem;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .sb-zoom-btn {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: rgba(7, 10, 16, 0.85);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.14);
          color: #cbd5e1;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
        }

        .sb-view-tabs {
          position: absolute;
          bottom: 10px;
          display: flex;
          align-items: center;
          gap: 3px;
          background: rgba(7, 10, 16, 0.9);
          backdrop-filter: blur(14px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 9999px;
          padding: 3px;
          z-index: 10;
          max-width: calc(100% - 20px);
          overflow-x: auto;
          scrollbar-width: none;
        }
        .sb-view-tabs::-webkit-scrollbar { display: none; }

        .sb-view-pill {
          background: transparent;
          border: 1px solid transparent;
          color: #94a3b8;
          font-size: 0.68rem;
          font-weight: 600;
          padding: 4px 9px;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          gap: 4px;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.15s;
        }
        .sb-view-pill.active {
          background: rgba(212, 175, 55, 0.2);
          border-color: rgba(212, 175, 55, 0.4);
          color: #fff;
        }
        .sb-pill-gold {
          color: #f3d375;
          border-color: rgba(212, 175, 55, 0.3);
        }

        /* Metric Strip */
        .sb-metric-strip {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 6px;
        }

        .sb-metric-item {
          background: rgba(15, 23, 42, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 10px;
          padding: 6px 8px;
          text-align: center;
        }

        .sb-metric-lbl {
          display: block;
          font-size: 0.62rem;
          color: #64748b;
          text-transform: uppercase;
          font-weight: 600;
        }

        .sb-metric-val {
          display: block;
          font-size: 0.78rem;
          font-weight: 700;
          color: #ffffff;
          margin-top: 1px;
        }

        /* Right Column Info */
        .sb-info-wrap {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .sb-identity-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .sb-brand-chip {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          color: #d4af37;
          font-size: 0.76rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          text-decoration: none;
        }

        .sb-ref-chip {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #94a3b8;
          font-size: 0.68rem;
          font-family: monospace;
          padding: 2px 7px;
          border-radius: 5px;
        }

        .sb-product-title {
          font-size: 1.55rem;
          font-weight: 800;
          color: #ffffff;
          line-height: 1.2;
          margin: 0;
          letter-spacing: -0.01em;
        }

        .sb-product-desc {
          font-size: 0.82rem;
          color: #94a3b8;
          line-height: 1.45;
          margin: 0;
        }

        /* Quick Specs Grid */
        .sb-quick-specs-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 6px;
        }

        .sb-spec-chip {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 10px;
          padding: 7px 10px;
        }

        .sb-chip-lbl {
          display: block;
          font-size: 0.62rem;
          color: #64748b;
          text-transform: uppercase;
          font-weight: 600;
        }

        .sb-chip-val {
          display: block;
          font-size: 0.8rem;
          font-weight: 700;
          color: #fff;
          margin-top: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Action Hub Card */
        .sb-action-hub-card {
          background: rgba(13, 19, 32, 0.8);
          border: 1px solid rgba(212, 175, 55, 0.28);
          border-radius: 14px;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.4);
        }

        .sb-hub-sub-title {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.72rem;
          font-weight: 700;
          color: #cbd5e1;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .sb-hub-divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.06);
          margin: 2px 0;
        }

        /* Symmetrical Buttons */
        .sb-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .sb-grid-3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 6px;
        }

        .sb-btn-gold {
          background: linear-gradient(135deg, #d4af37 0%, #b8860b 100%);
          color: #070a10;
          border: none;
          border-radius: 10px;
          padding: 10px 12px;
          font-size: 0.78rem;
          font-weight: 800;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          box-shadow: 0 4px 12px rgba(212, 175, 55, 0.25);
          transition: opacity 0.15s;
          white-space: nowrap;
        }
        .sb-btn-gold:hover { opacity: 0.92; }

        .sb-btn-gold-light {
          background: rgba(212, 175, 55, 0.18);
          border: 1px solid rgba(212, 175, 55, 0.4);
          color: #f3d375;
          border-radius: 10px;
          padding: 10px 12px;
          font-size: 0.78rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          white-space: nowrap;
          transition: background 0.15s;
        }
        .sb-btn-gold-light:hover { background: rgba(212, 175, 55, 0.25); }

        .sb-btn-glass {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #f8fafc;
          border-radius: 10px;
          padding: 10px 12px;
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          text-decoration: none;
          white-space: nowrap;
          transition: background 0.15s;
        }
        .sb-btn-glass:hover { background: rgba(255, 255, 255, 0.1); }

        .sb-btn-outline-gold {
          background: rgba(212, 175, 55, 0.08);
          border: 1px solid rgba(212, 175, 55, 0.3);
          color: #d4af37;
          border-radius: 8px;
          padding: 7px 10px;
          font-size: 0.74rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
        }

        .sb-btn-sm {
          padding: 7px 10px;
          font-size: 0.74rem;
          border-radius: 8px;
        }

        .sb-btn-full {
          width: 100%;
          padding: 11px;
          font-size: 0.84rem;
        }

        /* Calculator Drawer */
        .sb-calc-trigger-row {
          margin-top: 4px;
        }

        .sb-calc-toggle-btn {
          width: 100%;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          padding: 8px 12px;
          color: #94a3b8;
          font-size: 0.76rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
        }

        .sb-calc-toggle-left {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .sb-calc-toggle-arrow {
          font-size: 0.7rem;
          color: #64748b;
        }

        .sb-calc-drawer {
          margin-top: 8px;
          padding: 12px;
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
        }

        .sb-calc-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .sb-calc-title {
          font-size: 0.75rem;
          font-weight: 700;
          color: #fff;
        }

        .sb-calc-fire-label {
          font-size: 0.7rem;
          color: #94a3b8;
          display: flex;
          align-items: center;
          gap: 4px;
          cursor: pointer;
        }

        .sb-checkbox { accent-color: #d4af37; }

        .sb-calc-input-row {
          display: flex;
          gap: 8px;
          margin-bottom: 8px;
        }

        .sb-calc-input-box {
          position: relative;
          flex: 1;
        }

        .sb-calc-input {
          width: 100%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #fff;
          border-radius: 8px;
          padding: 8px 10px;
          font-size: 0.85rem;
          box-sizing: border-box;
          outline: none;
        }

        .sb-calc-unit {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 0.75rem;
          color: #64748b;
        }

        .sb-calc-quote-btn {
          background: rgba(212, 175, 55, 0.18);
          border: 1px solid rgba(212, 175, 55, 0.4);
          color: #f3d375;
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 0.76rem;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
        }

        .sb-calc-presets {
          display: flex;
          gap: 5px;
          flex-wrap: wrap;
        }

        .sb-preset-chip {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #94a3b8;
          border-radius: 6px;
          padding: 3px 8px;
          font-size: 0.68rem;
          font-weight: 600;
          cursor: pointer;
        }
        .sb-preset-chip.active {
          background: rgba(212, 175, 55, 0.2);
          border-color: #d4af37;
          color: #f3d375;
        }

        .sb-calc-res-box {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 6px;
          padding: 6px 4px;
          text-align: center;
        }

        .sb-res-lbl {
          display: block;
          font-size: 0.6rem;
          color: #64748b;
        }

        .sb-res-val {
          display: block;
          font-size: 0.78rem;
          font-weight: 800;
          color: #fff;
          margin-top: 2px;
        }

        /* 3. Segmented Tabs & Content */
        .sb-secondary-section {
          margin-top: 28px;
        }

        .sb-tabs-bar {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 4px;
          gap: 4px;
          margin-bottom: 16px;
        }

        .sb-tab-btn {
          background: transparent;
          border: none;
          color: #94a3b8;
          font-size: 0.78rem;
          font-weight: 600;
          padding: 8px 12px;
          border-radius: 8px;
          cursor: pointer;
          text-align: center;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .sb-tab-btn.active {
          background: rgba(212, 175, 55, 0.16);
          color: #f3d375;
          font-weight: 700;
        }

        .sb-tab-content {
          animation: sbFade 0.2s ease-out;
        }

        /* TDS Matrix */
        .sb-specs-matrix {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 6px;
          background: rgba(13, 19, 32, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 14px;
          padding: 12px;
        }

        .sb-matrix-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 10px;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 8px;
          gap: 8px;
        }

        .sb-matrix-key {
          font-size: 0.74rem;
          color: #94a3b8;
          font-weight: 600;
        }

        .sb-matrix-val {
          font-size: 0.78rem;
          color: #ffffff;
          font-weight: 700;
          text-align: right;
        }

        /* Dealers Grid */
        .sb-dealers-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 12px;
        }

        .sb-dealer-card {
          background: rgba(13, 19, 32, 0.75);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 14px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .sb-dealer-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 4px;
        }

        .sb-dealer-city {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.7rem;
          color: #d4af37;
          font-weight: 700;
        }

        .sb-dealer-dist {
          font-size: 0.68rem;
          color: #38bdf8;
          font-weight: 700;
          background: rgba(56, 189, 248, 0.1);
          padding: 1px 6px;
          border-radius: 4px;
        }

        .sb-dealer-name {
          font-size: 0.92rem;
          font-weight: 700;
          color: #fff;
          margin-bottom: 4px;
        }

        .sb-dealer-addr {
          font-size: 0.74rem;
          color: #94a3b8;
          line-height: 1.35;
        }

        /* Related Products Grid */
        .sb-related-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 12px;
        }

        .sb-rel-card {
          background: rgba(13, 19, 32, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          overflow: hidden;
          text-decoration: none;
          display: flex;
          flex-direction: column;
          transition: transform 0.15s;
        }
        .sb-rel-card:hover { transform: translateY(-2px); }

        .sb-rel-thumb-box {
          width: 100%;
          aspect-ratio: 1 / 1;
          background: #090d16;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .sb-rel-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .sb-rel-info {
          padding: 10px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .sb-rel-brand {
          font-size: 0.65rem;
          color: #d4af37;
          font-weight: 700;
          text-transform: uppercase;
        }

        .sb-rel-title {
          font-size: 0.82rem;
          font-weight: 700;
          color: #fff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sb-rel-specs {
          font-size: 0.7rem;
          color: #94a3b8;
        }

        .sb-empty-card {
          background: rgba(15, 23, 42, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 24px;
          text-align: center;
          color: #94a3b8;
          font-size: 0.82rem;
        }

        /* 4. Mobile Sticky Bottom Bar */
        .sb-mobile-sticky-bar {
          display: none;
        }

        /* 5. Modals */
        .sb-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.88);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }

        .sb-modal-close-round {
          position: absolute;
          top: 20px;
          right: 20px;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .sb-zoom-preview-img {
          max-width: 90vw;
          max-height: 85vh;
          object-fit: contain;
          border-radius: 10px;
        }

        .sb-form-modal-card {
          background: #0c111e;
          border: 1px solid rgba(212, 175, 55, 0.35);
          border-radius: 16px;
          max-width: 460px;
          width: 100%;
          padding: 20px;
          position: relative;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.8);
        }

        .sb-form-close-btn {
          position: absolute;
          top: 14px;
          right: 14px;
          width: 28px;
          height: 28px;
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #94a3b8;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .sb-modal-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
        }
        .sb-modal-title-row h3 {
          font-size: 1.05rem;
          font-weight: 800;
          color: #fff;
          margin: 0;
        }

        .sb-modal-sub {
          font-size: 0.76rem;
          color: #94a3b8;
          line-height: 1.4;
          margin: 0 0 14px 0;
        }

        .sb-modal-form {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .sb-form-lbl {
          display: block;
          font-size: 0.7rem;
          color: #94a3b8;
          margin-bottom: 3px;
          font-weight: 600;
        }

        .sb-form-input {
          width: 100%;
          padding: 8px 10px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: #070a12;
          color: #fff;
          font-size: 0.82rem;
          box-sizing: border-box;
          outline: none;
        }

        .sb-success-box {
          background: rgba(16, 185, 129, 0.12);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #34d399;
          font-size: 0.82rem;
          font-weight: 600;
          padding: 14px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .sb-error-box {
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #ef4444;
          font-size: 0.76rem;
          padding: 8px;
          border-radius: 6px;
        }

        .sb-text-gold { color: #f3d375; }
        .sb-text-green { color: #34d399; }
        .sb-gold-icon { color: #d4af37; }

        @keyframes sbFade { from { opacity: 0; } to { opacity: 1; } }

        /* ---------------- MOBILE RESPONSIVE OVERRIDES ---------------- */
        @media (max-width: 768px) {
          .sb-app-bar {
            padding: 6px 10px;
          }

          .sb-app-container {
            padding: 8px 8px 75px;
          }

          .sb-hero-grid {
            grid-template-columns: 100%;
            gap: 10px;
          }

          .sb-stage-card {
            aspect-ratio: 4 / 3;
            max-height: 270px;
            border-radius: 14px;
          }

          .sb-product-title {
            font-size: 1.22rem;
          }

          .sb-product-desc {
            font-size: 0.78rem;
          }

          .sb-quick-specs-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 4px;
          }

          .sb-spec-chip {
            padding: 5px 8px;
          }

          .sb-chip-val {
            font-size: 0.75rem;
          }

          .sb-action-hub-card {
            padding: 10px;
            border-radius: 12px;
            gap: 8px;
          }

          .sb-btn-gold,
          .sb-btn-gold-light,
          .sb-btn-glass {
            padding: 8px 8px;
            font-size: 0.74rem;
            border-radius: 8px;
          }

          .sb-specs-matrix {
            grid-template-columns: 100%;
            gap: 4px;
            padding: 8px;
          }

          .sb-matrix-row {
            padding: 6px 8px;
          }

          .sb-dealers-grid {
            grid-template-columns: 100%;
          }

          .sb-related-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
          }

          /* Mobile Bottom Sticky Bar Display */
          .sb-mobile-sticky-bar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: rgba(8, 11, 17, 0.95);
            backdrop-filter: blur(18px);
            -webkit-backdrop-filter: blur(18px);
            border-top: 1px solid rgba(212, 175, 55, 0.25);
            padding: 6px 12px;
            z-index: 50;
            box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.6);
            height: 52px;
            box-sizing: border-box;
          }

          .sb-sticky-left {
            display: flex;
            align-items: center;
            gap: 8px;
            min-width: 0;
            flex: 1;
            padding-right: 6px;
          }

          .sb-sticky-thumb-box {
            width: 32px;
            height: 32px;
            border-radius: 6px;
            overflow: hidden;
            background: #000;
            border: 1px solid rgba(212, 175, 55, 0.3);
            flex-shrink: 0;
          }

          .sb-sticky-thumb {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .sb-sticky-text {
            display: flex;
            flex-direction: column;
            min-width: 0;
            line-height: 1.15;
          }

          .sb-sticky-brand {
            font-size: 0.62rem;
            color: #d4af37;
            font-weight: 800;
            text-transform: uppercase;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .sb-sticky-name {
            font-size: 0.78rem;
            font-weight: 700;
            color: #fff;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .sb-sticky-right {
            display: flex;
            align-items: center;
            gap: 6px;
            flex-shrink: 0;
          }

          .sb-sticky-cam-btn,
          .sb-sticky-wa-btn {
            width: 34px;
            height: 34px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            text-decoration: none;
            cursor: pointer;
            flex-shrink: 0;
          }

          .sb-sticky-cam-btn {
            background: rgba(212, 175, 55, 0.12);
            border: 1px solid rgba(212, 175, 55, 0.35);
            color: #d4af37;
          }

          .sb-sticky-wa-btn {
            background: rgba(37, 211, 102, 0.12);
            border: 1px solid rgba(37, 211, 102, 0.3);
            color: #25d366;
          }

          .sb-sticky-quote-btn {
            background: linear-gradient(135deg, #d4af37 0%, #b8860b 100%);
            color: #070a10;
            border: none;
            border-radius: 8px;
            padding: 8px 12px;
            font-size: 0.74rem;
            font-weight: 850;
            display: flex;
            align-items: center;
            gap: 5px;
            cursor: pointer;
            white-space: nowrap;
          }
        }
      `}</style>

    </div>
  );
}
