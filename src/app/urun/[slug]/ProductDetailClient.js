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
  CheckCircle2,
  CheckCircle
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

  const singleTileM2 = (tileWidth * tileHeight) / 10000;
  const tileAreaM2 = singleTileM2 > 0 ? singleTileM2.toFixed(2) : '0.36';

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

  const productStyle = product.style || 'Porselen';
  const productFinish = product.finish || 'Mat';
  const productSubtitle = `Doğal ${productStyle.toLowerCase()} dokusu, ${productFinish.toLowerCase()} yüzeyi ve ${productDimensions} ebadıyla mimari mekanlar için tasarlanmıştır.`;

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
          finish: product.finish || 'Mat',
          style: product.style || 'Mermer',
          color: product.color || 'Gri',
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
            finish: product.finish || 'Mat',
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
    <div className="sb-light-page">
      
      {/* ---------------- 1. CLEAN APP HEADER BAR ---------------- */}
      <header className="sb-nav-bar">
        <div className="sb-nav-inner">
          <Link href="/" className="sb-nav-back" title="Ana Sayfaya Dön">
            <ArrowLeft size={18} />
          </Link>

          <div className="sb-nav-title-box">
            <span className="sb-nav-brand">{brandName}</span>
            <span className="sb-nav-model">{product.name}</span>
          </div>

          <div className="sb-nav-actions">
            <button onClick={handleCopyLink} className="sb-nav-btn" title="Bağlantıyı Kopyala">
              {copied ? <Check size={16} className="sb-green-icon" /> : <Copy size={16} />}
            </button>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="sb-nav-btn sb-wa-color" title="WhatsApp Paylaş">
              <Share2 size={16} />
            </a>
          </div>
        </div>
      </header>

      {/* ---------------- 2. MAIN PRODUCT VIEWPORT ---------------- */}
      <main className="sb-main-shell">
        
        {/* TOP HERO: Gallery & Core Details */}
        <div className="sb-hero-layout">
          
          {/* Gallery Column */}
          <div className="sb-gallery-col">
            <div className="sb-stage-card">
              <img
                src={currentDisplayImage}
                alt={`${brandName} ${product.name}`}
                className="sb-stage-photo"
                style={{
                  objectFit: activeView === 'image' ? 'contain' : 'cover'
                }}
                onError={(e) => {
                  const fallback = getTextureFallback(product);
                  if (e.currentTarget.src !== fallback) e.currentTarget.src = fallback;
                }}
              />

              {/* Minimal Clean Badges */}
              <div className="sb-stage-top-left">
                <span className="sb-pill-badge">{brandName}</span>
                <span className="sb-pill-badge sb-badge-gold">{product.finish || 'Mat'}</span>
              </div>

              {/* Zoom Trigger */}
              <button 
                onClick={() => setShowImageZoom(true)} 
                className="sb-stage-zoom" 
                title="Büyük Boyut"
              >
                <Maximize2 size={15} />
              </button>
            </div>

            {/* Gallery View Tabs (Sits Cleanly Below The Image) */}
            <div className="sb-view-row">
              <button
                type="button"
                onClick={() => setActiveView('image')}
                className={`sb-view-tab ${activeView === 'image' ? 'active' : ''}`}
              >
                <Layers size={13} />
                <span>Plaka</span>
              </button>

              {product.textureUrl && (
                <button
                  type="button"
                  onClick={() => setActiveView('texture')}
                  className={`sb-view-tab ${activeView === 'texture' ? 'active' : ''}`}
                >
                  <Eye size={13} />
                  <span>Doku Detayı</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => { setRenovationProduct(product); setShowRenovationModal(true); }}
                className="sb-view-tab sb-tab-accent"
              >
                <Camera size={13} />
                <span>Mekânımda Gör</span>
              </button>

              <button
                type="button"
                onClick={handleGoTo3DStudio}
                className="sb-view-tab"
              >
                <Sparkles size={13} />
                <span>3D Stüdyo</span>
              </button>
            </div>

            {/* 3 Metric Summary Strip */}
            <div className="sb-strip-3">
              <div className="sb-strip-cell">
                <span className="sb-cell-lbl">Format</span>
                <span className="sb-cell-val">{tileWidth}×{tileHeight} cm</span>
              </div>
              <div className="sb-strip-cell">
                <span className="sb-cell-lbl">Tek Plaka</span>
                <span className="sb-cell-val">{tileAreaM2} m²</span>
              </div>
              <div className="sb-strip-cell">
                <span className="sb-cell-lbl">Kenar Kesimi</span>
                <span className="sb-cell-val">{product.rectified ? 'Rektifiye (1mm)' : 'Derzli'}</span>
              </div>
            </div>
          </div>

          {/* Details & Actions Column */}
          <div className="sb-details-col">
            
            {/* Identity & Ref */}
            <div className="sb-brand-line">
              <Link href={`/marka/${brandSlug}`} className="sb-brand-link">
                <span>{brandName}</span>
                <ChevronRight size={13} />
              </Link>
              {product.code && (
                <span className="sb-code-tag">Ref: {product.code}</span>
              )}
            </div>

            <h1 className="sb-title-text">{product.name}</h1>
            <p className="sb-sub-text">{productSubtitle}</p>

            {/* Symmetrical Quick Specs */}
            <div className="sb-specs-grid-4">
              <div className="sb-spec-box">
                <span className="sb-s-lbl">Ebat</span>
                <span className="sb-s-val">{tileWidth}×{tileHeight} cm</span>
              </div>
              <div className="sb-spec-box">
                <span className="sb-s-lbl">Yüzey Bitişi</span>
                <span className="sb-s-val">{product.finish || 'Mat'}</span>
              </div>
              <div className="sb-spec-box">
                <span className="sb-s-lbl">Tipoloji</span>
                <span className="sb-s-val">{product.style || 'Porselen'}</span>
              </div>
              <div className="sb-spec-box">
                <span className="sb-s-lbl">Paket Kutu</span>
                <span className="sb-s-val">{boxM2} m² ({tilesPerBox} Adet)</span>
              </div>
            </div>

            {/* Symmetrical Action Hub */}
            <div className="sb-actions-panel">
              <div className="sb-panel-caption">
                <Sparkles size={13} className="sb-gold-icon" />
                <span>Simülasyon & Tasarım</span>
              </div>

              <div className="sb-grid-2">
                <button
                  type="button"
                  onClick={() => { setRenovationProduct(product); setShowRenovationModal(true); }}
                  className="sb-btn-primary-gold"
                >
                  <Camera size={16} />
                  <span>Mekânımda Gör & Dene</span>
                </button>

                <button
                  type="button"
                  onClick={handleGoTo3DStudio}
                  className="sb-btn-dark-slate"
                >
                  <Eye size={16} />
                  <span>3D Tasarım Stüdyosu</span>
                </button>
              </div>

              <div className="sb-divider" />

              <div className="sb-panel-caption">
                <ShieldCheck size={13} className="sb-gold-icon" />
                <span>Teklif & Ücretsiz Numune</span>
              </div>

              <div className="sb-grid-2">
                <button
                  type="button"
                  onClick={() => setShowQuoteModal(true)}
                  className="sb-btn-outline-gold"
                >
                  <Send size={15} />
                  <span>Fiyat Teklifi Al</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowSampleModal(true)}
                  className="sb-btn-outline-dark"
                >
                  <Box size={15} />
                  <span>15×15 Numune İste</span>
                </button>
              </div>

              {/* Compact Metraj Calculator Drawer */}
              <div className="sb-calc-container">
                <button
                  type="button"
                  onClick={() => setShowCalculator(!showCalculator)}
                  className="sb-calc-toggle"
                >
                  <span className="sb-calc-toggle-title">
                    <Calculator size={14} className="sb-gold-icon" />
                    <span>Metraj & Kutu Adedi Hesaplayıcı</span>
                  </span>
                  <span className="sb-calc-toggle-ind">
                    {showCalculator ? 'Kapat ▲' : 'Hesapla ▼'}
                  </span>
                </button>

                {showCalculator && (
                  <div className="sb-calc-body">
                    <div className="sb-calc-top-row">
                      <span className="sb-calc-h">Net Alan:</span>
                      <label className="sb-calc-cb-lbl">
                        <input
                          type="checkbox"
                          checked={includeWastage}
                          onChange={(e) => setIncludeWastage(e.target.checked)}
                          className="sb-cb"
                        />
                        <span>+%10 Kesim Fire Payı</span>
                      </label>
                    </div>

                    <div className="sb-calc-input-line">
                      <div className="sb-calc-in-wrap">
                        <input
                          type="number"
                          min="1"
                          value={customM2}
                          onChange={(e) => setCustomM2(e.target.value)}
                          placeholder="50"
                          className="sb-calc-number-input"
                        />
                        <span className="sb-calc-suffix">m²</span>
                      </div>

                      <button
                        type="button"
                        onClick={openQuoteWithCalculatedArea}
                        className="sb-calc-cta"
                      >
                        Teklif İste →
                      </button>
                    </div>

                    <div className="sb-calc-quick-pills">
                      {['15', '30', '50', '100', '200'].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setCustomM2(val)}
                          className={`sb-q-pill ${customM2 === val ? 'active' : ''}`}
                        >
                          {val} m²
                        </button>
                      ))}
                    </div>

                    <div className="sb-grid-3" style={{ marginTop: '10px' }}>
                      <div className="sb-calc-kpi">
                        <span className="sb-kpi-lbl">Toplam Alan</span>
                        <span className="sb-kpi-val">{targetArea.toFixed(1)} m²</span>
                      </div>
                      <div className="sb-calc-kpi">
                        <span className="sb-kpi-lbl">Karo Adedi</span>
                        <span className="sb-kpi-val">{calculatedTiles} adet</span>
                      </div>
                      <div className="sb-calc-kpi">
                        <span className="sb-kpi-lbl">Tahmini Kutu</span>
                        <span className="sb-kpi-val">~{estimatedBoxes} kutu</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>

        {/* ---------------- 3. CLEAN SEGMENTED TABS & DATA ---------------- */}
        <section className="sb-tabs-section">
          
          <div className="sb-segmented-bar">
            <button
              type="button"
              onClick={() => setActiveTab('specs')}
              className={`sb-seg-btn ${activeTab === 'specs' ? 'active' : ''}`}
            >
              <span>Teknik Şartname (TDS)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('dealers')}
              className={`sb-seg-btn ${activeTab === 'dealers' ? 'active' : ''}`}
            >
              <span>Showroomlar ({displayDealers.length})</span>
            </button>

            {relatedProducts.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab('related')}
                className={`sb-seg-btn ${activeTab === 'related' ? 'active' : ''}`}
              >
                <span>Diğer Modeller ({relatedProducts.length})</span>
              </button>
            )}
          </div>

          {/* TAB 1: Clean TDS Table / Spec Grid */}
          {activeTab === 'specs' && (
            <div className="sb-tab-pane">
              <div className="sb-tds-grid">
                <div className="sb-tds-row">
                  <span className="sb-tds-k">Üretici Marka</span>
                  <span className="sb-tds-v sb-bold-gold">{brandName}</span>
                </div>
                <div className="sb-tds-row">
                  <span className="sb-tds-k">Model & Seri Kodu</span>
                  <span className="sb-tds-v font-mono">{product.code || 'MİMARİ-SERİ'}</span>
                </div>
                <div className="sb-tds-row">
                  <span className="sb-tds-k">Ebat / Ölçü</span>
                  <span className="sb-tds-v">{tileWidth} cm × {tileHeight} cm</span>
                </div>
                <div className="sb-tds-row">
                  <span className="sb-tds-k">Et Kalınlığı</span>
                  <span className="sb-tds-v">{product.thickness || 9.5} mm</span>
                </div>
                <div className="sb-tds-row">
                  <span className="sb-tds-k">Yüzey Bitişi</span>
                  <span className="sb-tds-v">{product.finish || 'Mat'}</span>
                </div>
                <div className="sb-tds-row">
                  <span className="sb-tds-k">Doku & Tipoloji</span>
                  <span className="sb-tds-v">{product.style || 'Porselen'}</span>
                </div>
                <div className="sb-tds-row">
                  <span className="sb-tds-k">Aşınma Dayanımı (PEI)</span>
                  <span className="sb-tds-v">{product.peiRating ? `PEI ${product.peiRating}` : 'PEI 3-4 (Konut & Ticari)'}</span>
                </div>
                <div className="sb-tds-row">
                  <span className="sb-tds-k">Kaydırmazlık</span>
                  <span className="sb-tds-v">{product.slipResistance || 'R10 (Islak Zemin Uyumlu)'}</span>
                </div>
                <div className="sb-tds-row">
                  <span className="sb-tds-k">Dona Dayanıklılık</span>
                  <span className="sb-tds-v">{product.frostResistance ? 'Evet (Dış Mekan & Teras)' : 'İç Mekan'}</span>
                </div>
                <div className="sb-tds-row">
                  <span className="sb-tds-k">Kenar Tipi</span>
                  <span className="sb-tds-v">{product.rectified ? 'Rektifiye (Lazer Kesim 1mm)' : 'Hassas Derzli'}</span>
                </div>
                <div className="sb-tds-row">
                  <span className="sb-tds-k">Tavsiye Edilen Alan</span>
                  <span className="sb-tds-v">{product.area || 'Banyo, Mutfak, Salon, Zemin & Duvar'}</span>
                </div>
                <div className="sb-tds-row">
                  <span className="sb-tds-k">Kalite Belgesi</span>
                  <span className="sb-tds-v sb-green-text">TSE EN 14411 (1. Kalite)</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Showroom Dealers */}
          {activeTab === 'dealers' && (
            <div className="sb-tab-pane">
              {displayDealers.length === 0 ? (
                <div className="sb-empty-card">
                  <p>Bu marka için kayıtlı bayi showroomu bulunamadı.</p>
                </div>
              ) : (
                <div className="sb-dealers-deck">
                  {displayDealers.slice(0, 6).map((dealer) => (
                    <div key={dealer.id} className="sb-dealer-box">
                      <div>
                        <div className="sb-dealer-header">
                          <span className="sb-dealer-city-tag">
                            <Building2 size={13} />
                            <span>{dealer.city} / {dealer.district}</span>
                          </span>
                          {typeof dealer.distanceKm === 'number' && (
                            <span className="sb-dist-chip">{dealer.distanceKm} km</span>
                          )}
                        </div>
                        <h4 className="sb-dealer-title">{dealer.name}</h4>
                        <p className="sb-dealer-address">{dealer.address}</p>
                      </div>

                      <div className="sb-grid-2" style={{ marginTop: '14px' }}>
                        <a href={`tel:${dealer.phone}`} className="sb-btn-dealer-call">
                          <Phone size={13} style={{ color: '#059669' }} />
                          <span>Hemen Ara</span>
                        </a>
                        <Link href={`/bayi/${slugify(dealer.name)}`} className="sb-btn-dealer-view">
                          <span>Showroom İncele</span>
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
            <div className="sb-tab-pane">
              <div className="sb-related-deck">
                {relatedProducts.map((rel) => {
                  const relSlug = slugify(`${brandName} ${rel.name}`);
                  return (
                    <Link key={rel.id} href={`/urun/${relSlug}`} className="sb-rel-tile">
                      <div className="sb-rel-thumb">
                        <img src={rel.imageUrl} alt={rel.name} className="sb-rel-pic" />
                      </div>
                      <div className="sb-rel-caption">
                        <span className="sb-rel-b">{brandName}</span>
                        <div className="sb-rel-t">{rel.name}</div>
                        <span className="sb-rel-dim">{rel.width}×{rel.height} cm • {rel.finish}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

        </section>

      </main>

      {/* ---------------- 4. REFINED MOBILE STICKY BOTTOM BAR ---------------- */}
      <div className="sb-bottom-bar">
        <div className="sb-bar-left">
          <div className="sb-bar-thumb">
            <img src={currentDisplayImage} alt={product.name} className="sb-bar-pic" />
          </div>
          <div className="sb-bar-meta">
            <span className="sb-bar-brand">{brandName}</span>
            <span className="sb-bar-name">{product.name}</span>
          </div>
        </div>

        <div className="sb-bar-actions">
          <button
            type="button"
            onClick={() => { setRenovationProduct(product); setShowRenovationModal(true); }}
            className="sb-bar-cam-btn"
            title="Mekânımda Dene"
          >
            <Camera size={16} />
          </button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="sb-bar-wa-btn"
            title="WhatsApp İle Sor"
          >
            <Share2 size={16} />
          </a>

          <button
            type="button"
            onClick={() => setShowQuoteModal(true)}
            className="sb-bar-quote-btn"
          >
            <Send size={13} />
            <span>Teklif Al</span>
          </button>
        </div>
      </div>

      {/* ---------------- 5. ZOOM MODAL ---------------- */}
      {showImageZoom && (
        <div className="sb-lightbox-bg" onClick={() => setShowImageZoom(false)}>
          <button onClick={() => setShowImageZoom(false)} className="sb-lightbox-close">
            <X size={18} />
          </button>
          <img
            src={currentDisplayImage}
            alt={product.name}
            className="sb-lightbox-img"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* ---------------- 6. SAMPLE REQUEST MODAL ---------------- */}
      {showSampleModal && (
        <div className="sb-lightbox-bg" onClick={(e) => { if (e.target === e.currentTarget) setShowSampleModal(false); }}>
          <div className="sb-modal-card">
            <button onClick={() => setShowSampleModal(false)} className="sb-modal-close-icon">
              <X size={16} />
            </button>

            <div className="sb-m-heading">
              <Box size={20} className="sb-gold-icon" />
              <h3>15×15 Ücretsiz Numune Talebi</h3>
            </div>
            <p className="sb-m-intro">
              <strong>{brandName} — {product.name}</strong> modelinden adresinize ücretsiz 15×15 cm kesit numune kutusu sevk edilir.
            </p>

            {sampleSuccess ? (
              <div className="sb-m-success">
                <CheckCircle size={18} />
                <span>{sampleSuccess}</span>
              </div>
            ) : (
              <form onSubmit={handleSampleSubmit} className="sb-m-form">
                {sampleError && <div className="sb-m-err">{sampleError}</div>}

                <div>
                  <label className="sb-m-lbl">Adınız Soyadınız *</label>
                  <input
                    type="text"
                    required
                    placeholder="Adınız Soyadınız"
                    value={sampleForm.name}
                    onChange={(e) => setSampleForm({ ...sampleForm, name: e.target.value })}
                    className="sb-m-input"
                  />
                </div>

                <div className="sb-grid-2">
                  <div>
                    <label className="sb-m-lbl">Telefon *</label>
                    <input
                      type="tel"
                      required
                      placeholder="05XX XXX XX XX"
                      value={sampleForm.phone}
                      onChange={(e) => setSampleForm({ ...sampleForm, phone: e.target.value })}
                      className="sb-m-input"
                    />
                  </div>
                  <div>
                    <label className="sb-m-lbl">E-Posta *</label>
                    <input
                      type="email"
                      required
                      placeholder="ornek@mail.com"
                      value={sampleForm.email}
                      onChange={(e) => setSampleForm({ ...sampleForm, email: e.target.value })}
                      className="sb-m-input"
                    />
                  </div>
                </div>

                <div className="sb-grid-2">
                  <div>
                    <label className="sb-m-lbl">Şehir *</label>
                    <select
                      value={sampleForm.city}
                      onChange={(e) => setSampleForm({ ...sampleForm, city: e.target.value })}
                      className="sb-m-input"
                    >
                      {TURKEY_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="sb-m-lbl">İlçe</label>
                    <input
                      type="text"
                      placeholder="İlçe"
                      value={sampleForm.district}
                      onChange={(e) => setSampleForm({ ...sampleForm, district: e.target.value })}
                      className="sb-m-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="sb-m-lbl">Kargo Teslimat Adresi *</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Ofis veya teslimat adresiniz..."
                    value={sampleForm.address}
                    onChange={(e) => setSampleForm({ ...sampleForm, address: e.target.value })}
                    className="sb-m-input"
                  />
                </div>

                <button type="submit" disabled={sampleSubmitting} className="sb-btn-primary-gold sb-btn-w100">
                  {sampleSubmitting ? 'Talebiniz İletiliyor...' : 'Numuneyi Ücretsiz Talep Et'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ---------------- 7. QUOTE REQUEST MODAL ---------------- */}
      {showQuoteModal && (
        <div className="sb-lightbox-bg" onClick={(e) => { if (e.target === e.currentTarget) setShowQuoteModal(false); }}>
          <div className="sb-modal-card">
            <button onClick={() => setShowQuoteModal(false)} className="sb-modal-close-icon">
              <X size={16} />
            </button>

            <div className="sb-m-heading">
              <Send size={20} className="sb-gold-icon" />
              <h3>Yetkili Bayiden Fiyat Teklifi Al</h3>
            </div>
            <p className="sb-m-intro">
              <strong>{brandName} {product.name}</strong> için projenize özel indirimli bayi teklifi hazırlanır.
            </p>

            {quoteSuccess ? (
              <div className="sb-m-success">
                <CheckCircle size={18} />
                <span>{quoteSuccess}</span>
              </div>
            ) : (
              <form onSubmit={handleQuoteSubmit} className="sb-m-form">
                {quoteError && <div className="sb-m-err">{quoteError}</div>}

                <div>
                  <label className="sb-m-lbl">Ad Soyad / Firma Adı *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ad Soyad veya Firma"
                    value={quoteForm.name}
                    onChange={(e) => setQuoteForm({ ...quoteForm, name: e.target.value })}
                    className="sb-m-input"
                  />
                </div>

                <div className="sb-grid-2">
                  <div>
                    <label className="sb-m-lbl">Telefon *</label>
                    <input
                      type="tel"
                      required
                      placeholder="05XX XXX XX XX"
                      value={quoteForm.phone}
                      onChange={(e) => setQuoteForm({ ...quoteForm, phone: e.target.value })}
                      className="sb-m-input"
                    />
                  </div>
                  <div>
                    <label className="sb-m-lbl">E-Posta *</label>
                    <input
                      type="email"
                      required
                      placeholder="ornek@mail.com"
                      value={quoteForm.email}
                      onChange={(e) => setQuoteForm({ ...quoteForm, email: e.target.value })}
                      className="sb-m-input"
                    />
                  </div>
                </div>

                <div className="sb-grid-2">
                  <div>
                    <label className="sb-m-lbl">Şehir *</label>
                    <select
                      value={quoteForm.city}
                      onChange={(e) => setQuoteForm({ ...quoteForm, city: e.target.value })}
                      className="sb-m-input"
                    >
                      {TURKEY_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="sb-m-lbl">Tahmini Metraj (m²)</label>
                    <input
                      type="number"
                      placeholder="150"
                      value={quoteForm.areaM2}
                      onChange={(e) => setQuoteForm({ ...quoteForm, areaM2: e.target.value })}
                      className="sb-m-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="sb-m-lbl">Proje Notları (Opsiyonel)</label>
                  <textarea
                    rows={2}
                    placeholder="Şantiye teslimi, uygulama ve usta talepleri..."
                    value={quoteForm.notes}
                    onChange={(e) => setQuoteForm({ ...quoteForm, notes: e.target.value })}
                    className="sb-m-input"
                  />
                </div>

                <button type="submit" disabled={quoteSubmitting} className="sb-btn-primary-gold sb-btn-w100">
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

      {/* ---------------- 9. CLEAN PROFESSIONAL STYLING ---------------- */}
      <style jsx>{`
        /* General Page Container (Clean, Bright, Luxury Palette) */
        .sb-light-page {
          min-height: 100vh;
          background: #f8fafc;
          color: #0f172a;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          width: 100%;
          max-width: 100vw;
          overflow-x: hidden;
        }

        /* 1. Navigation App Bar */
        .sb-nav-bar {
          position: sticky;
          top: 0;
          z-index: 40;
          background: rgba(255, 255, 255, 0.94);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid #e2e8f0;
          padding: 10px 16px;
        }

        .sb-nav-inner {
          max-width: 1120px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .sb-nav-back {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          color: #1e293b;
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          flex-shrink: 0;
          transition: all 0.15s;
        }
        .sb-nav-back:hover { background: #e2e8f0; }

        .sb-nav-title-box {
          display: flex;
          flex-direction: column;
          min-width: 0;
          flex: 1;
        }

        .sb-nav-brand {
          font-size: 0.68rem;
          color: #b48c36;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          line-height: 1.1;
        }

        .sb-nav-model {
          font-size: 0.88rem;
          font-weight: 700;
          color: #0f172a;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sb-nav-actions {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
        }

        .sb-nav-btn {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          color: #475569;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.15s;
        }
        .sb-nav-btn:hover { background: #e2e8f0; color: #0f172a; }
        .sb-wa-color { color: #16a34a; background: #f0fdf4; border-color: #bbf7d0; }

        /* 2. Main Layout Shell */
        .sb-main-shell {
          max-width: 1120px;
          margin: 0 auto;
          padding: 20px 16px 80px;
        }

        .sb-hero-layout {
          display: grid;
          grid-template-columns: 460px 1fr;
          gap: 28px;
          align-items: start;
        }

        /* Gallery Column */
        .sb-gallery-col {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .sb-stage-card {
          position: relative;
          aspect-ratio: 1 / 1;
          max-height: 460px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
        }

        .sb-stage-photo {
          width: 100%;
          height: 100%;
          transition: transform 0.25s;
        }

        .sb-stage-top-left {
          position: absolute;
          top: 12px;
          left: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
          z-index: 10;
        }

        .sb-pill-badge {
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(8px);
          border: 1px solid #e2e8f0;
          color: #334155;
          font-size: 0.68rem;
          font-weight: 700;
          padding: 3px 9px;
          border-radius: 9999px;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
        }

        .sb-badge-gold {
          color: #b48c36;
          border-color: #fde68a;
          background: #fffbeb;
        }

        .sb-stage-zoom {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(8px);
          border: 1px solid #e2e8f0;
          color: #475569;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
          z-index: 10;
        }

        /* View Row: Sits Cleanly Under Image (No Overlap) */
        .sb-view-row {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 5px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        }

        .sb-view-tab {
          flex: 1;
          background: transparent;
          border: none;
          color: #64748b;
          font-size: 0.72rem;
          font-weight: 600;
          padding: 7px 6px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.15s;
        }

        .sb-view-tab.active {
          background: #0f172a;
          color: #ffffff;
          font-weight: 700;
        }

        .sb-tab-accent {
          color: #b48c36;
          font-weight: 700;
        }

        /* 3-Strip Metrics */
        .sb-strip-3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }

        .sb-strip-cell {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 8px 6px;
          text-align: center;
          box-shadow: 0 1px 2px rgba(0,0,0,0.02);
        }

        .sb-cell-lbl {
          display: block;
          font-size: 0.65rem;
          color: #64748b;
          text-transform: uppercase;
          font-weight: 600;
          margin-bottom: 2px;
        }

        .sb-cell-val {
          display: block;
          font-size: 0.82rem;
          font-weight: 700;
          color: #0f172a;
        }

        /* Details Column */
        .sb-details-col {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .sb-brand-line {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .sb-brand-link {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          color: #b48c36;
          font-size: 0.8rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          text-decoration: none;
        }

        .sb-code-tag {
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          color: #64748b;
          font-size: 0.72rem;
          font-family: monospace;
          padding: 2px 8px;
          border-radius: 6px;
        }

        .sb-title-text {
          font-size: 1.65rem;
          font-weight: 800;
          color: #0f172a;
          line-height: 1.2;
          margin: 0;
          letter-spacing: -0.015em;
        }

        .sb-sub-text {
          font-size: 0.88rem;
          color: #64748b;
          line-height: 1.45;
          margin: 0;
        }

        /* Specs Grid 4 */
        .sb-specs-grid-4 {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
        }

        .sb-spec-box {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 9px 10px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        }

        .sb-s-lbl {
          display: block;
          font-size: 0.65rem;
          color: #64748b;
          text-transform: uppercase;
          font-weight: 600;
          margin-bottom: 2px;
        }

        .sb-s-val {
          display: block;
          font-size: 0.84rem;
          font-weight: 700;
          color: #0f172a;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Action Panel Card */
        .sb-actions-panel {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
        }

        .sb-panel-caption {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.74rem;
          font-weight: 700;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .sb-divider {
          height: 1px;
          background: #f1f5f9;
          margin: 2px 0;
        }

        /* Symmetrical Action Buttons */
        .sb-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .sb-grid-3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }

        .sb-btn-primary-gold {
          background: linear-gradient(135deg, #d4af37 0%, #b8860b 100%);
          color: #000;
          border: none;
          border-radius: 10px;
          padding: 11px 12px;
          font-size: 0.82rem;
          font-weight: 800;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          box-shadow: 0 2px 8px rgba(180, 140, 54, 0.25);
          transition: opacity 0.15s;
          white-space: nowrap;
        }
        .sb-btn-primary-gold:hover { opacity: 0.94; }

        .sb-btn-dark-slate {
          background: #0f172a;
          color: #ffffff;
          border: none;
          border-radius: 10px;
          padding: 11px 12px;
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: background 0.15s;
          white-space: nowrap;
        }
        .sb-btn-dark-slate:hover { background: #1e293b; }

        .sb-btn-outline-gold {
          background: #fffdf5;
          border: 1px solid #d4af37;
          color: #996515;
          border-radius: 10px;
          padding: 10px 12px;
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          white-space: nowrap;
          transition: background 0.15s;
        }
        .sb-btn-outline-gold:hover { background: #fef3c7; }

        .sb-btn-outline-dark {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          color: #334155;
          border-radius: 10px;
          padding: 10px 12px;
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          white-space: nowrap;
          transition: all 0.15s;
        }
        .sb-btn-outline-dark:hover { background: #f8fafc; border-color: #94a3b8; }

        .sb-btn-w100 { width: 100%; }

        /* Calculator Widget */
        .sb-calc-container {
          margin-top: 2px;
        }

        .sb-calc-toggle {
          width: 100%;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 9px 12px;
          color: #475569;
          font-size: 0.78rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          transition: background 0.15s;
        }
        .sb-calc-toggle:hover { background: #f1f5f9; }

        .sb-calc-toggle-title {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .sb-calc-toggle-ind {
          font-size: 0.72rem;
          color: #64748b;
        }

        .sb-calc-body {
          margin-top: 8px;
          padding: 14px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
        }

        .sb-calc-top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .sb-calc-h {
          font-size: 0.78rem;
          font-weight: 700;
          color: #0f172a;
        }

        .sb-calc-cb-lbl {
          font-size: 0.74rem;
          color: #64748b;
          display: flex;
          align-items: center;
          gap: 5px;
          cursor: pointer;
        }

        .sb-cb { accent-color: #b48c36; }

        .sb-calc-input-line {
          display: flex;
          gap: 8px;
          margin-bottom: 8px;
        }

        .sb-calc-in-wrap {
          position: relative;
          flex: 1;
        }

        .sb-calc-number-input {
          width: 100%;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          color: #0f172a;
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 0.88rem;
          font-weight: 600;
          box-sizing: border-box;
          outline: none;
        }

        .sb-calc-suffix {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 0.78rem;
          color: #64748b;
        }

        .sb-calc-cta {
          background: #0f172a;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          padding: 8px 14px;
          font-size: 0.78rem;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
        }

        .sb-calc-quick-pills {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .sb-q-pill {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          color: #475569;
          border-radius: 6px;
          padding: 4px 9px;
          font-size: 0.72rem;
          font-weight: 600;
          cursor: pointer;
        }
        .sb-q-pill.active {
          background: #0f172a;
          color: #fff;
          border-color: #0f172a;
        }

        .sb-calc-kpi {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 8px 4px;
          text-align: center;
        }

        .sb-kpi-lbl {
          display: block;
          font-size: 0.62rem;
          color: #64748b;
          text-transform: uppercase;
        }

        .sb-kpi-val {
          display: block;
          font-size: 0.85rem;
          font-weight: 800;
          color: #0f172a;
          margin-top: 2px;
        }

        /* 3. Segmented Tabs & Content */
        .sb-tabs-section {
          margin-top: 32px;
        }

        .sb-segmented-bar {
          display: flex;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 4px;
          gap: 4px;
          margin-bottom: 16px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        }

        .sb-seg-btn {
          flex: 1;
          background: transparent;
          border: none;
          color: #64748b;
          font-size: 0.82rem;
          font-weight: 600;
          padding: 9px 12px;
          border-radius: 8px;
          cursor: pointer;
          text-align: center;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .sb-seg-btn.active {
          background: #0f172a;
          color: #ffffff;
          font-weight: 700;
        }

        .sb-tab-pane {
          animation: sbFade 0.2s ease-out;
        }

        /* TDS Grid */
        .sb-tds-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.02);
        }

        .sb-tds-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px;
          background: #f8fafc;
          border-radius: 10px;
          gap: 10px;
        }

        .sb-tds-k {
          font-size: 0.78rem;
          color: #64748b;
          font-weight: 600;
        }

        .sb-tds-v {
          font-size: 0.82rem;
          color: #0f172a;
          font-weight: 700;
          text-align: right;
        }

        .sb-bold-gold { color: #b48c36; }
        .sb-green-text { color: #059669; }

        /* Dealers Deck */
        .sb-dealers-deck {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 14px;
        }

        .sb-dealer-box {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-shadow: 0 2px 8px rgba(0,0,0,0.02);
        }

        .sb-dealer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 6px;
        }

        .sb-dealer-city-tag {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 0.74rem;
          color: #b48c36;
          font-weight: 700;
        }

        .sb-dist-chip {
          font-size: 0.72rem;
          color: #0284c7;
          font-weight: 700;
          background: #f0f9ff;
          padding: 2px 8px;
          border-radius: 6px;
        }

        .sb-dealer-title {
          font-size: 0.96rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 6px 0;
        }

        .sb-dealer-address {
          font-size: 0.78rem;
          color: #64748b;
          line-height: 1.4;
          margin: 0;
        }

        .sb-btn-dealer-call {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          color: #166534;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 0.78rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          text-decoration: none;
        }

        .sb-btn-dealer-view {
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          color: #334155;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 0.78rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
        }

        /* Related Deck */
        .sb-related-deck {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 14px;
        }

        .sb-rel-tile {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          overflow: hidden;
          text-decoration: none;
          display: flex;
          flex-direction: column;
          box-shadow: 0 2px 6px rgba(0,0,0,0.02);
          transition: transform 0.15s;
        }
        .sb-rel-tile:hover { transform: translateY(-3px); }

        .sb-rel-thumb {
          width: 100%;
          aspect-ratio: 1 / 1;
          background: #f8fafc;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .sb-rel-pic {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .sb-rel-caption {
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .sb-rel-b {
          font-size: 0.68rem;
          color: #b48c36;
          font-weight: 700;
          text-transform: uppercase;
        }

        .sb-rel-t {
          font-size: 0.86rem;
          font-weight: 700;
          color: #0f172a;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sb-rel-dim {
          font-size: 0.74rem;
          color: #64748b;
        }

        .sb-empty-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 32px;
          text-align: center;
          color: #64748b;
          font-size: 0.86rem;
        }

        /* 4. Refined Mobile Sticky Bottom Bar */
        .sb-bottom-bar {
          display: none;
        }

        /* 5. Modals (Clean White Cards) */
        .sb-lightbox-bg {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }

        .sb-lightbox-close {
          position: absolute;
          top: 20px;
          right: 20px;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid #e2e8f0;
          color: #0f172a;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .sb-lightbox-img {
          max-width: 90vw;
          max-height: 85vh;
          object-fit: contain;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        }

        .sb-modal-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          max-width: 460px;
          width: 100%;
          padding: 24px;
          position: relative;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
        }

        .sb-modal-close-icon {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 30px;
          height: 30px;
          border-radius: 8px;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          color: #64748b;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .sb-m-heading {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
        }
        .sb-m-heading h3 {
          font-size: 1.15rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
        }

        .sb-m-intro {
          font-size: 0.8rem;
          color: #64748b;
          line-height: 1.45;
          margin: 0 0 16px 0;
        }

        .sb-m-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .sb-m-lbl {
          display: block;
          font-size: 0.74rem;
          color: #334155;
          margin-bottom: 4px;
          font-weight: 600;
        }

        .sb-m-input {
          width: 100%;
          padding: 9px 12px;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          color: #0f172a;
          font-size: 0.86rem;
          box-sizing: border-box;
          outline: none;
        }
        .sb-m-input:focus { border-color: #b48c36; }

        .sb-m-success {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          color: #166534;
          font-size: 0.85rem;
          font-weight: 600;
          padding: 16px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .sb-m-err {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          font-size: 0.8rem;
          padding: 10px;
          border-radius: 8px;
        }

        .sb-gold-icon { color: #b48c36; }
        .sb-green-icon { color: #16a34a; }

        @keyframes sbFade { from { opacity: 0; } to { opacity: 1; } }

        /* ---------------- MOBILE OVERRIDES ---------------- */
        @media (max-width: 768px) {
          .sb-nav-bar {
            padding: 8px 12px;
          }

          .sb-main-shell {
            padding: 10px 12px 80px;
          }

          .sb-hero-layout {
            grid-template-columns: 100%;
            gap: 14px;
          }

          .sb-stage-card {
            aspect-ratio: 1 / 1;
            max-height: 330px;
            border-radius: 16px;
          }

          .sb-title-text {
            font-size: 1.35rem;
          }

          .sb-sub-text {
            font-size: 0.82rem;
          }

          .sb-specs-grid-4 {
            grid-template-columns: repeat(2, 1fr);
            gap: 6px;
          }

          .sb-spec-box {
            padding: 7px 10px;
          }

          .sb-s-val {
            font-size: 0.78rem;
          }

          .sb-actions-panel {
            padding: 12px;
            border-radius: 14px;
            gap: 10px;
          }

          .sb-btn-primary-gold,
          .sb-btn-dark-slate,
          .sb-btn-outline-gold,
          .sb-btn-outline-dark {
            padding: 10px 8px;
            font-size: 0.76rem;
            border-radius: 9px;
          }

          .sb-tds-grid {
            grid-template-columns: 100%;
            gap: 6px;
            padding: 10px;
          }

          .sb-tds-row {
            padding: 8px 10px;
          }

          .sb-dealers-deck {
            grid-template-columns: 100%;
          }

          .sb-related-deck {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }

          /* Mobile Bottom Sticky Bar */
          .sb-bottom-bar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(14px);
            -webkit-backdrop-filter: blur(14px);
            border-top: 1px solid #e2e8f0;
            padding: 8px 14px;
            z-index: 50;
            box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.06);
            height: 56px;
            box-sizing: border-box;
          }

          .sb-bar-left {
            display: flex;
            align-items: center;
            gap: 10px;
            min-width: 0;
            flex: 1;
            padding-right: 8px;
          }

          .sb-bar-thumb {
            width: 36px;
            height: 36px;
            border-radius: 8px;
            overflow: hidden;
            background: #f1f5f9;
            border: 1px solid #cbd5e1;
            flex-shrink: 0;
          }

          .sb-bar-pic {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .sb-bar-meta {
            display: flex;
            flex-direction: column;
            min-width: 0;
            line-height: 1.2;
          }

          .sb-bar-brand {
            font-size: 0.65rem;
            color: #b48c36;
            font-weight: 800;
            text-transform: uppercase;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .sb-bar-name {
            font-size: 0.84rem;
            font-weight: 700;
            color: #0f172a;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .sb-bar-actions {
            display: flex;
            align-items: center;
            gap: 6px;
            flex-shrink: 0;
          }

          .sb-bar-cam-btn,
          .sb-bar-wa-btn {
            width: 36px;
            height: 36px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            text-decoration: none;
            cursor: pointer;
            flex-shrink: 0;
          }

          .sb-bar-cam-btn {
            background: #fffdf5;
            border: 1px solid #fde68a;
            color: #b48c36;
          }

          .sb-bar-wa-btn {
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            color: #16a34a;
          }

          .sb-bar-quote-btn {
            background: linear-gradient(135deg, #d4af37 0%, #b8860b 100%);
            color: #000;
            border: none;
            border-radius: 10px;
            padding: 9px 14px;
            font-size: 0.78rem;
            font-weight: 800;
            display: flex;
            align-items: center;
            gap: 5px;
            cursor: pointer;
            white-space: nowrap;
            box-shadow: 0 2px 6px rgba(180, 140, 54, 0.25);
          }
        }
      `}</style>

    </div>
  );
}
