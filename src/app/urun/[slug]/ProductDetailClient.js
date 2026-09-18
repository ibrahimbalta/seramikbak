'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
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
  AlertCircle, 
  ChevronRight,
  ExternalLink,
  Info,
  Building2,
  Truck,
  Eye,
  Ruler,
  Palette,
  Calculator,
  X
} from 'lucide-react';
import { slugify } from '@/lib/slugify';
import AIRemodelModal from '@/components/AIRemodelModal';
import { generateTilePreview, loadImage } from '@/components/TilePerspectiveEngine';

// 3D Kiosk Studio Canvas (Loaded dynamically on client side without SSR)
const StudioCanvas = dynamic(() => import('@/components/StudioCanvas'), { 
  ssr: false,
  loading: () => (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      background: '#070a10'
    }}>
      <div style={{
        width: '38px',
        height: '38px',
        borderRadius: '50%',
        border: '3px solid rgba(212, 175, 55, 0.2)',
        borderTopColor: '#d4af37',
        animation: 'spin 0.8s linear infinite'
      }} />
      <span style={{ fontSize: '0.84rem', fontWeight: '700', color: '#d4af37' }}>
        3D Kiosk Tasarımı Yükleniyor...
      </span>
      <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
        3D mimari mekan ve seramik dokusu hazırlanıyor
      </span>
    </div>
  )
});

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
  const [copied, setCopied] = useState(false);
  const [showImageZoom, setShowImageZoom] = useState(false);

  // 3D Kiosk State for 'room' mode
  const [kioskRoomType, setKioskRoomType] = useState('bathroom'); // 'bathroom' | 'livingroom' | 'kitchen' | 'terrace'
  const [kioskTimeOfDay, setKioskTimeOfDay] = useState('day'); // 'day' | 'night'
  const [kioskApplyFloor, setKioskApplyFloor] = useState(true);
  const [kioskApplyWalls, setKioskApplyWalls] = useState(true);

  // Dynamic Nearest Dealers State (strictly for this product's brand)
  const [liveDealers, setLiveDealers] = useState(authorizedDealers);
  const [userCoords, setUserCoords] = useState(null);

  // Detect user geolocation to sort nearest dealers for this specific brand
  useEffect(() => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserCoords({ lat, lng });

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
        (err) => {
          console.log('Location permission denied or unavailable, using initial dealers:', err.message);
        },
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

  // AI Remodel Modal State
  const [showAIRemodel, setShowAIRemodel] = useState(false);
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

  // Copy Page Link
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

  // Launch 3D Kiosk
  const handleLaunch3DKiosk = () => {
    try {
      const selectedObj = {
        ...product,
        textureUrl: product.textureUrl || product.imageUrl || '/textures/calacatta_gold.jpg',
        imageUrl: product.imageUrl || product.textureUrl || '/textures/calacatta_gold.jpg',
        width: tileWidth,
        height: tileHeight,
        style: product.style || 'Porselen',
        finish: product.finish || 'Lappato',
        unitPrice: 480
      };
      sessionStorage.setItem('kiosk_selected_product', JSON.stringify(selectedObj));
      localStorage.setItem('kiosk_selected_product', JSON.stringify(selectedObj));
      window.open(`/kiosk?product=${product.id}&room=${kioskRoomType || 'bathroom'}`, '_blank');
    } catch (e) {
      window.open(`/kiosk?product=${product.id}&room=${kioskRoomType || 'bathroom'}`, '_blank');
    }
  };

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
          notes: sampleForm.notes ? `[Ürün Sayfası Talebi] ${sampleForm.notes}` : '[Ürün Sayfası Talebi]'
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSampleSuccess(data.message || 'Numune talebiniz alındı!');
        setTimeout(() => {
          setShowSampleModal(false);
          setSampleSuccess('');
        }, 4000);
      } else {
        setSampleError(data.error || 'Numune talebi kaydedilemedi.');
      }
    } catch (err) {
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
          notes: `[Ürün Sayfası Fiyat Teklifi] İl: ${quoteForm.city}, Talep Edilen Metraj: ${quoteForm.areaM2} m². ${quoteForm.notes || ''}`
        })
      });
      const data = await res.json();
      if (res.ok) {
        setQuoteSuccess('Fiyat teklifi talebiniz en yakın yetkili bayiye iletildi. En kısa sürede sizinle iletişime geçilecektir.');
        setTimeout(() => {
          setShowQuoteModal(false);
          setQuoteSuccess('');
        }, 4000);
      } else {
        setQuoteError(data.error || 'Teklif gönderilirken bir hata oluştu.');
      }
    } catch (err) {
      setQuoteError('Bağlantı hatası, lütfen tekrar deneyin.');
    } finally {
      setQuoteSubmitting(false);
    }
  };

  // Dimensions & Accurate Metric Calculations
  const tileWidth = Number(product.width) || 60;
  const tileHeight = Number(product.height) || tileWidth;
  const productDimensions = `${tileWidth}×${tileHeight} cm`;
  const isSquareTile = Math.abs(tileWidth - tileHeight) < 5;

  // Ebat Alan Hesabı (Gerçek Ölçülere Göre)
  const singleTileM2 = (tileWidth * tileHeight) / 10000;
  const tileAreaM2 = singleTileM2 > 0 ? singleTileM2.toFixed(2) : '0.36';
  const tilesPerM2 = singleTileM2 > 0 ? (1 / singleTileM2).toFixed(1) : '2.8';

  // Tiles per box calculation (Standart üretici paketleme kuralları: ~1.44 m²)
  const tilesPerBox = tileWidth === 60 && tileHeight === 120 ? 2 :
                      tileWidth === 60 && tileHeight === 60 ? 4 :
                      tileWidth === 80 && tileHeight === 80 ? 2 :
                      tileWidth === 20 && tileHeight === 120 ? 6 :
                      tileWidth === 30 && tileHeight === 60 ? 8 :
                      Math.max(1, Math.round(1.44 / (singleTileM2 || 0.72)));
  const boxM2 = (singleTileM2 * tilesPerBox).toFixed(2);

  // Metraj Hesaplayıcı
  const parsedM2 = parseFloat(customM2) || 0;
  const targetArea = includeWastage ? parsedM2 * 1.1 : parsedM2;
  const calculatedTiles = Math.ceil(targetArea / (singleTileM2 || 0.72));
  const estimatedBoxes = Math.ceil(calculatedTiles / tilesPerBox);

  const openQuoteWithCalculatedArea = () => {
    setQuoteForm(prev => ({ ...prev, areaM2: String(Math.round(targetArea)) }));
    setShowQuoteModal(true);
  };

  // Dynamic Product Subtitle based on real fields
  const productStyle = product.style || 'Porselen Seramik';
  const productFinish = product.finish || 'Lappato';
  const productSubtitle = 
    `Doğal ${productStyle.toLowerCase()} dokusu, zengin detayları ve ${productFinish} yüzey işçiliği ile üretilmiş ${productDimensions} mimari porselen karo.`;

  // Kiosk Product configuration for 3D StudioCanvas
  const kioskProduct = {
    ...product,
    imageUrl: product.imageUrl || product.textureUrl || '/textures/calacatta_gold.jpg',
    textureUrl: product.textureUrl || product.imageUrl || '/textures/calacatta_gold.jpg',
    width: tileWidth,
    height: tileHeight,
    style: productStyle,
    finish: productFinish,
    unitPrice: 480
  };

  const handleSelectRoomView = () => {
    setActiveView('room');
    try {
      sessionStorage.setItem('kiosk_selected_product', JSON.stringify(kioskProduct));
      localStorage.setItem('kiosk_selected_product', JSON.stringify(kioskProduct));
    } catch (e) {}
  };

  // Dynamic Room Render state (Birebir ürün dokusunun mimari mekanda sergilenmesi)
  const [roomRenderImage, setRoomRenderImage] = useState(null);
  const [isRoomRendering, setIsRoomRendering] = useState(false);

  useEffect(() => {
    if (activeView === 'room' && !roomRenderImage && !isRoomRendering) {
      let isMounted = true;
      setIsRoomRendering(true);

      const generateProductRoom = async () => {
        try {
          const nameLc = (product.name || '').toLowerCase();
          const styleLc = (product.style || '').toLowerCase();
          const colorLc = (product.color || '').toLowerCase();

          // 1. Curated match if exact curated showcase exists
          if (nameLc.includes('albatros') || (colorLc.includes('siyah') && styleLc.includes('mermer') && !nameLc.includes('storia'))) {
            if (isMounted) {
              setRoomRenderImage('/renders/luxury_bathroom_albatros_antrasit.jpg');
              setIsRoomRendering(false);
            }
            return;
          }
          if (nameLc.includes('loft') || (styleLc.includes('beton') && colorLc.includes('gri') && !colorLc.includes('green'))) {
            if (isMounted) {
              setRoomRenderImage('/renders/luxury_bathroom_loft_beton.jpg');
              setIsRoomRendering(false);
            }
            return;
          }
          if (nameLc.includes('oak') || nameLc.includes('ahşap') || styleLc.includes('ahşap')) {
            if (isMounted) {
              setRoomRenderImage('/renders/luxury_bathroom_natural_oak.jpg');
              setIsRoomRendering(false);
            }
            return;
          }
          if (nameLc.includes('calacatta') || nameLc.includes('altın') || (colorLc.includes('beyaz') && styleLc.includes('mermer') && !colorLc.includes('green') && !nameLc.includes('storia'))) {
            if (isMounted) {
              setRoomRenderImage('/renders/luxury_bathroom_calacatta_gold.jpg');
              setIsRoomRendering(false);
            }
            return;
          }

          // 2. Dynamic 3D Room Render with the product's EXACT tile texture & dimensions
          const rawTileSource = product.textureUrl || product.imageUrl || '/textures/calacatta_gold.jpg';
          const isHttp = typeof rawTileSource === 'string' && rawTileSource.startsWith('http');
          const tileSource = isHttp ? `/api/proxy?url=${encodeURIComponent(rawTileSource)}` : rawTileSource;

          const [roomImg, tileImg] = await Promise.all([
            loadImage('/hero/luxury_bathroom.png'),
            loadImage(tileSource).catch(() => loadImage('/hero/hero_ceramics.jpg'))
          ]);

          const isDark = colorLc.includes('antrasit') || colorLc.includes('siyah') || colorLc.includes('koyu') || colorLc.includes('green') || nameLc.includes('green') || nameLc.includes('storia');
          const isPlank = (tileWidth / tileHeight) <= 0.35 || (tileHeight / tileWidth) <= 0.35;

          const surfaces = {
            floor: {
              polygon: [[0, 68], [100, 68], [100, 100], [0, 100]],
              exclude: [[[35, 62], [65, 62], [65, 85], [35, 85]]]
            },
            walls: []
          };

          const renderedUrl = generateTilePreview(roomImg, tileImg, surfaces, {
            groutColor: isPlank ? '#241a14' : isDark ? '#16221a' : '#cbd5e1',
            groutWidth: 1.4,
            tileWCm: tileWidth,
            tileHCm: tileHeight,
            finish: product.finish || 'Full Lappato',
            layout: 'straight',
            subdivisions: 28,
          });

          if (isMounted) {
            setRoomRenderImage(renderedUrl);
            setIsRoomRendering(false);
          }
        } catch (err) {
          console.warn('[ProductDetailClient] Room render error:', err);
          if (isMounted) {
            setRoomRenderImage('/hero/luxury_bathroom.png');
            setIsRoomRendering(false);
          }
        }
      };

      generateProductRoom();

      return () => {
        isMounted = false;
      };
    }
  }, [activeView, roomRenderImage, isRoomRendering, product, tileWidth, tileHeight]);

  const currentDisplayImage = 
    activeView === 'texture' 
      ? (product.textureUrl || product.imageUrl) 
      : activeView === 'room'
      ? (roomRenderImage || '/hero/luxury_bathroom.png')
      : product.imageUrl;

  return (
    <div style={{ minHeight: '100vh', background: '#080b11', color: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Top Header / Breadcrumb */}
      <header style={{
        borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
        background: 'rgba(8, 11, 17, 0.85)',
        backdropFilter: 'blur(16px)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        padding: '12px 20px'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          
          {/* Breadcrumb Path */}
          <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#94a3b8' }}>
            <Link 
              href="/" 
              style={{ 
                color: '#cbd5e1', 
                textDecoration: 'none', 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '6px', 
                fontWeight: '500',
                transition: 'color 0.15s'
              }}
            >
              <ArrowLeft size={14} />
              <span>Anasayfa</span>
            </Link>
            <ChevronRight size={13} style={{ opacity: 0.4 }} />
            <Link 
              href={`/marka/${brandSlug}`} 
              style={{ 
                color: '#cbd5e1', 
                textDecoration: 'none', 
                fontWeight: '500'
              }}
            >
              {brandName}
            </Link>
            <ChevronRight size={13} style={{ opacity: 0.4 }} />
            <span style={{ color: '#fff', fontWeight: '600', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {product.name}
            </span>
          </nav>

          {/* Quick Actions (Share / Copy) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleCopyLink}
              title="Ürün bağlantısını kopyala"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255, 255, 255, 0.04)',
                color: copied ? '#34d399' : '#cbd5e1',
                border: copied ? '1px solid rgba(52, 211, 153, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)',
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '0.78rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              <span>{copied ? 'Kopyalandı' : 'Linki Kopyala'}</span>
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="WhatsApp üzerinden bayiye veya mimara ilet"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(37, 211, 102, 0.1)',
                color: '#25d366',
                border: '1px solid rgba(37, 211, 102, 0.25)',
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '0.78rem',
                fontWeight: '600',
                textDecoration: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <Share2 size={13} />
              <span>WhatsApp</span>
            </a>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 20px 80px' }}>
        
        {/* Top Product Hero Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '48px',
          alignItems: 'start'
        }}>
          
          {/* Left Column: Architectural Presentation Stage */}
          <div>
            <div style={{
              position: 'relative',
              borderRadius: '24px',
              overflow: 'hidden',
              background: 'radial-gradient(ellipse at 50% 40%, rgba(30, 48, 40, 0.45) 0%, rgba(13, 20, 32, 0.75) 45%, #070a10 100%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 30px 60px -15px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
              aspectRatio: isSquareTile ? '1 / 1' : '4 / 5',
              maxHeight: isSquareTile ? '580px' : '620px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {/* 3D Kiosk Studio Canvas or Standard Image */}
              {activeView === 'room' ? (
                <div style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, zIndex: 1 }}>
                  <StudioCanvas
                    activeProduct={kioskProduct}
                    floorProduct={kioskProduct}
                    wallProduct={kioskProduct}
                    applyFloor={kioskApplyFloor}
                    applyWalls={kioskApplyWalls}
                    roomType={kioskRoomType}
                    timeOfDay={kioskTimeOfDay}
                  />
                </div>
              ) : (
                <img
                  src={currentDisplayImage}
                  alt={`${brandName} ${product.name}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: activeView === 'texture' ? 'cover' : 'contain',
                    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                    padding: activeView === 'image' ? (isSquareTile ? '20px' : '28px') : '0'
                  }}
                />
              )}

              {/* Gloss Sheen Reflection for Full Lappato / Polished Karolar */}
              {activeView !== 'room' && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  pointerEvents: 'none',
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0) 35%, rgba(255, 255, 255, 0.03) 70%, rgba(255, 255, 255, 0) 100%)',
                  mixBlendMode: 'overlay'
                }} />
              )}

              {/* Minimal Badges Overlay (Top Left) */}
              <div style={{ position: 'absolute', top: '18px', left: '18px', display: 'flex', alignItems: 'center', gap: '8px', zIndex: 15 }}>
                <span style={{
                  background: 'rgba(7, 10, 16, 0.85)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  color: '#e2e8f0',
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  padding: '5px 12px',
                  borderRadius: '9999px',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#d4af37', display: 'inline-block' }} />
                  {brandName}
                </span>

                <span style={{
                  background: 'rgba(212, 175, 55, 0.12)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(212, 175, 55, 0.35)',
                  color: '#f3d375',
                  fontSize: '0.7rem',
                  fontWeight: '600',
                  padding: '5px 12px',
                  borderRadius: '9999px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  <Sparkles size={11} style={{ color: '#d4af37' }} />
                  <span>{product.finish || 'Full Lappato'}</span>
                </span>
              </div>

              {/* Fullscreen Zoom Trigger (Top Right) */}
              {activeView !== 'room' && (
                <button
                  onClick={() => setShowImageZoom(true)}
                  title="Büyük boyutta incele"
                  style={{
                    position: 'absolute',
                    top: '18px',
                    right: '18px',
                    background: 'rgba(7, 10, 16, 0.85)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#e2e8f0',
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    zIndex: 15
                  }}
                >
                  <Maximize2 size={15} />
                </button>
              )}

              {/* 3D Kiosk View Overlay Controls when in 'room' mode */}
              {activeView === 'room' && (
                <div style={{
                  position: 'absolute',
                  top: '64px',
                  left: '14px',
                  right: '14px',
                  background: 'rgba(9, 13, 22, 0.92)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(212, 175, 55, 0.35)',
                  padding: '8px 12px',
                  borderRadius: '12px',
                  fontSize: '0.74rem',
                  color: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  zIndex: 20
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ 
                      background: 'rgba(212, 175, 55, 0.2)', 
                      color: '#d4af37', 
                      fontSize: '0.66rem', 
                      fontWeight: '800', 
                      padding: '2px 7px', 
                      borderRadius: '6px',
                      letterSpacing: '0.05em'
                    }}>
                      3D KIOSK
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>
                      👆 360° Çevirerek İncele
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      onClick={handleLaunch3DKiosk}
                      title="3D Kiosk Stüdyosu'nda Tam Ekran Aç"
                      style={{
                        background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.3) 0%, rgba(212, 175, 55, 0.15) 100%)',
                        border: '1px solid rgba(212, 175, 55, 0.5)',
                        color: '#ffffff',
                        fontWeight: '700',
                        cursor: 'pointer',
                        fontSize: '0.7rem',
                        padding: '4px 10px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <ExternalLink size={11} />
                      <span>Kiosk&apos;ta Aç</span>
                    </button>

                    <button
                      onClick={() => setShowAIRemodel(true)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#f3d375',
                        fontWeight: '600',
                        cursor: 'pointer',
                        fontSize: '0.7rem',
                        padding: '4px 10px',
                        borderRadius: '8px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      Evinde Dene →
                    </button>
                  </div>
                </div>
              )}

              {/* Room Selector Pills for 3D Kiosk mode */}
              {activeView === 'room' && (
                <div style={{
                  position: 'absolute',
                  bottom: '60px',
                  display: 'flex',
                  alignItems: 'center',
                  background: 'rgba(7, 10, 16, 0.92)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '9999px',
                  padding: '3px 4px',
                  gap: '3px',
                  zIndex: 20,
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)'
                }}>
                  {[
                    { id: 'bathroom', label: 'Banyo' },
                    { id: 'livingroom', label: 'Salon' },
                    { id: 'kitchen', label: 'Mutfak' },
                    { id: 'terrace', label: 'Teras' }
                  ].map(r => (
                    <button
                      key={r.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setKioskRoomType(r.id);
                      }}
                      style={{
                        background: kioskRoomType === r.id ? 'rgba(212, 175, 55, 0.25)' : 'transparent',
                        color: kioskRoomType === r.id ? '#ffffff' : '#94a3b8',
                        border: kioskRoomType === r.id ? '1px solid rgba(212, 175, 55, 0.4)' : '1px solid transparent',
                        padding: '4px 9px',
                        borderRadius: '9999px',
                        fontSize: '0.68rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {r.label}
                    </button>
                  ))}

                  <div style={{ width: '1px', height: '14px', background: 'rgba(255, 255, 255, 0.15)', margin: '0 2px' }} />

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setKioskTimeOfDay(prev => prev === 'day' ? 'night' : 'day');
                    }}
                    title={kioskTimeOfDay === 'day' ? 'Gece Atmosferine Geç' : 'Gündüz Atmosferine Geç'}
                    style={{
                      background: 'transparent',
                      color: kioskTimeOfDay === 'day' ? '#fbbf24' : '#60a5fa',
                      border: 'none',
                      padding: '4px 7px',
                      borderRadius: '9999px',
                      fontSize: '0.68rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px'
                    }}
                  >
                    {kioskTimeOfDay === 'day' ? '☀️ Gündüz' : '🌙 Gece'}
                  </button>
                </div>
              )}

              {/* View Switcher: Segmented Pill (Bottom Floating) */}
              <div style={{
                position: 'absolute',
                bottom: '18px',
                display: 'flex',
                background: 'rgba(7, 10, 16, 0.9)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                borderRadius: '9999px',
                padding: '4px',
                gap: '4px',
                zIndex: 20,
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
              }}>
                <button
                  onClick={() => setActiveView('image')}
                  style={{
                    background: activeView === 'image' ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.25) 0%, rgba(212, 175, 55, 0.1) 100%)' : 'transparent',
                    color: activeView === 'image' ? '#ffffff' : '#94a3b8',
                    border: activeView === 'image' ? '1px solid rgba(212, 175, 55, 0.4)' : '1px solid transparent',
                    padding: '6px 14px',
                    borderRadius: '9999px',
                    fontSize: '0.74rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <Layers size={13} style={{ color: activeView === 'image' ? '#d4af37' : '#94a3b8' }} />
                  <span>Plaka ({tileWidth}×{tileHeight})</span>
                </button>

                {product.textureUrl && (
                  <button
                    onClick={() => setActiveView('texture')}
                    style={{
                      background: activeView === 'texture' ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.25) 0%, rgba(212, 175, 55, 0.1) 100%)' : 'transparent',
                      color: activeView === 'texture' ? '#ffffff' : '#94a3b8',
                      border: activeView === 'texture' ? '1px solid rgba(212, 175, 55, 0.4)' : '1px solid transparent',
                      padding: '6px 14px',
                      borderRadius: '9999px',
                      fontSize: '0.74rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <Eye size={13} style={{ color: activeView === 'texture' ? '#d4af37' : '#94a3b8' }} />
                    <span>4K Doku</span>
                  </button>
                )}

                <button
                  onClick={handleSelectRoomView}
                  style={{
                    background: activeView === 'room' ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.25) 0%, rgba(212, 175, 55, 0.1) 100%)' : 'transparent',
                    color: activeView === 'room' ? '#ffffff' : '#94a3b8',
                    border: activeView === 'room' ? '1px solid rgba(212, 175, 55, 0.4)' : '1px solid transparent',
                    padding: '6px 14px',
                    borderRadius: '9999px',
                    fontSize: '0.74rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <Sparkles size={13} style={{ color: activeView === 'room' ? '#d4af37' : '#94a3b8' }} />
                  <span>Mimari Mekân</span>
                </button>
              </div>
            </div>

            {/* Architectural Under-Stage Specifications Ribbon */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '10px',
              marginTop: '16px',
              textAlign: 'center'
            }}>
              <div style={{
                background: 'rgba(15, 23, 42, 0.55)',
                border: '1px solid rgba(255, 255, 255, 0.07)',
                borderRadius: '14px',
                padding: '12px 10px'
              }}>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                  Plaka Alanı
                </div>
                <div style={{ fontSize: '0.92rem', fontWeight: '800', color: '#ffffff' }}>
                  {tileAreaM2} m²
                </div>
                <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '2px' }}>
                  Tek Karo ({tileWidth}×{tileHeight} cm)
                </div>
              </div>

              <div style={{
                background: 'rgba(15, 23, 42, 0.55)',
                border: '1px solid rgba(255, 255, 255, 0.07)',
                borderRadius: '14px',
                padding: '12px 10px'
              }}>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                  Kalite Sınıfı
                </div>
                <div style={{ fontSize: '0.92rem', fontWeight: '800', color: '#34d399' }}>
                  1. Sınıf Porselen
                </div>
                <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '2px' }}>
                  TSE EN 14411
                </div>
              </div>

              <div style={{
                background: 'rgba(15, 23, 42, 0.55)',
                border: '1px solid rgba(255, 255, 255, 0.07)',
                borderRadius: '14px',
                padding: '12px 10px'
              }}>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                  Kenar Bitişi
                </div>
                <div style={{ fontSize: '0.92rem', fontWeight: '800', color: '#f3d375' }}>
                  {product.rectified ? 'Lazer Rektifiye' : 'Rektifiyeli Kesim'}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '2px' }}>
                  {product.rectified ? '1 mm Sıfır Derz' : 'Hassas Derz'}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Architectural Storytelling & Haute-Couture Conversion Suite */}
          <div>
            
            {/* Editorial Eyebrow & Model Identifier */}
            <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <Link
                href={`/marka/${brandSlug}`}
                style={{
                  color: '#d4af37',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  textDecoration: 'none',
                  textTransform: 'uppercase',
                  letterSpacing: '0.18em',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>{brandName}</span>
                <span style={{ color: '#64748b' }}>•</span>
                <span style={{ color: '#94a3b8', fontWeight: '500' }}>ARCHITECTURAL COLLECTION</span>
                <ChevronRight size={13} style={{ color: '#d4af37' }} />
              </Link>

              <span style={{
                background: 'rgba(212, 175, 55, 0.06)',
                border: '1px solid rgba(212, 175, 55, 0.2)',
                color: '#e5c568',
                fontSize: '0.72rem',
                fontFamily: 'monospace',
                padding: '4px 10px',
                borderRadius: '6px',
                letterSpacing: '0.06em'
              }}>
                REF: {product.code}
              </span>
            </div>

            {/* Main Product Title & Architectural Subtitle */}
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: '800',
              color: '#ffffff',
              margin: '0 0 8px 0',
              lineHeight: 1.15,
              letterSpacing: '-0.025em'
            }}>
              {product.name}
            </h1>

            <p style={{
              fontSize: '0.92rem',
              color: '#94a3b8',
              margin: '0 0 22px 0',
              lineHeight: 1.5,
              fontWeight: '400'
            }}>
              {productSubtitle}
            </p>

            {/* Architectural Spec Matrix (4-Grid Luxury Tiles) */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '8px',
              marginBottom: '26px'
            }}>
              <div style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '10px 12px'
              }}>
                <div style={{ fontSize: '0.66rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '600' }}>
                  Format
                </div>
                <div style={{ fontSize: '0.86rem', fontWeight: '700', color: '#ffffff', marginTop: '3px' }}>
                  {tileWidth}×{tileHeight} cm
                </div>
              </div>

              <div style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '10px 12px'
              }}>
                <div style={{ fontSize: '0.66rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '600' }}>
                  Yüzey
                </div>
                <div style={{ fontSize: '0.86rem', fontWeight: '700', color: '#e5c568', marginTop: '3px' }}>
                  {product.finish || 'Mat / Parlak'}
                </div>
              </div>

              <div style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '10px 12px'
              }}>
                <div style={{ fontSize: '0.66rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '600' }}>
                  Dokusu
                </div>
                <div style={{ fontSize: '0.86rem', fontWeight: '700', color: '#ffffff', marginTop: '3px' }}>
                  {product.style || 'Porselen'}
                </div>
              </div>

              <div style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '10px 12px'
              }}>
                <div style={{ fontSize: '0.66rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '600' }}>
                  Ton
                </div>
                <div style={{ fontSize: '0.86rem', fontWeight: '700', color: '#ffffff', marginTop: '3px' }}>
                  {product.color || 'Standart'}
                </div>
              </div>
            </div>

            {/* AI Mekânsal Dönüşüm Stüdyosu — The Magnet & Hero Feature */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(20, 30, 48, 0.9) 0%, rgba(10, 15, 26, 0.95) 100%)',
              border: '1px solid rgba(212, 175, 55, 0.35)',
              borderRadius: '20px',
              padding: '24px',
              marginBottom: '22px',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.7), 0 0 35px rgba(212, 175, 55, 0.08)'
            }}>
              {/* Subtle Ambient Decorative Glow */}
              <div style={{
                position: 'absolute',
                top: '-40px',
                right: '-40px',
                width: '180px',
                height: '180px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, rgba(212, 175, 55, 0) 70%)',
                pointerEvents: 'none'
              }} />

              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.25) 0%, rgba(212, 175, 55, 0.05) 100%)',
                    border: '1px solid rgba(212, 175, 55, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#f3d375',
                    flexShrink: 0
                  }}>
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: '700',
                      color: '#d4af37',
                      textTransform: 'uppercase',
                      letterSpacing: '0.12em',
                      display: 'block'
                    }}>
                      MİMARİ YAPAY ZEKA SİMÜLASYONU
                    </span>
                    <h3 style={{
                      fontSize: '1.08rem',
                      fontWeight: '700',
                      color: '#ffffff',
                      margin: '2px 0 0',
                      letterSpacing: '-0.01em'
                    }}>
                      Bu Seramiği Kendi Odanızda Görün
                    </h3>
                  </div>
                </div>

                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: '700',
                  color: '#34d399',
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  padding: '3px 9px',
                  borderRadius: '9999px',
                  whiteSpace: 'nowrap'
                }}>
                  ● Canlı Render
                </span>
              </div>

              <p style={{
                fontSize: '0.84rem',
                color: '#94a3b8',
                lineHeight: 1.5,
                margin: '0 0 18px 0'
              }}>
                Banyonuzun veya salonunuzun bir fotoğrafını yükleyin. Yapay zeka motorumuz küvet, lavabo ve mobilyalarınıza dokunmadan bu seramiği mimari 3D render kalitesinde odanıza döşesin.
              </p>

              {/* Dual Action Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.9fr', gap: '10px' }}>
                <button
                  onClick={() => setShowAIRemodel(true)}
                  style={{
                    background: 'linear-gradient(135deg, #f5d77f 0%, #d4af37 50%, #aa7c11 100%)',
                    color: '#070a10',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '12px 18px',
                    fontSize: '0.86rem',
                    fontWeight: '800',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 6px 20px -2px rgba(212, 175, 55, 0.4)',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                >
                  <Sparkles size={16} />
                  <span>Fotoğraf Yükle & Gör</span>
                </button>

                <button
                  onClick={handleLaunch3DKiosk}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    color: '#f1f5f9',
                    border: '1px solid rgba(255, 255, 255, 0.14)',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    fontSize: '0.84rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '7px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Eye size={15} style={{ color: '#d4af37' }} />
                  <span>3D Kiosk Modeli</span>
                </button>
              </div>
            </div>

            {/* Haute-Couture Conversion Suite (Teklif & Numune) */}
            <div style={{
              background: 'rgba(13, 18, 30, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '20px',
              padding: '24px',
              marginBottom: '24px',
              boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.6)'
            }}>
              {/* Status Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '18px',
                paddingBottom: '14px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#10b981',
                    display: 'inline-block',
                    boxShadow: '0 0 10px #10b981'
                  }} />
                  <span style={{ fontSize: '0.84rem', fontWeight: '700', color: '#f8fafc' }}>
                    Yetkili Bayi & Fabrika Tedariki
                  </span>
                </div>

                <span style={{
                  fontSize: '0.74rem',
                  color: '#94a3b8',
                  background: 'rgba(255, 255, 255, 0.03)',
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}>
                  Stokta Hazır • 1. Kalite
                </span>
              </div>

              {/* Primary Dual Actions (Teklif Al & Numune İste) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <button
                    onClick={() => setShowQuoteModal(true)}
                    style={{
                      width: '100%',
                      background: 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)',
                      color: '#070a10',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '14px 18px',
                      fontSize: '0.9rem',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 6px 20px -2px rgba(212, 175, 55, 0.35)',
                      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                  >
                    <Send size={16} />
                    <span>Teklif Talebi Al</span>
                  </button>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', textAlign: 'center', marginTop: '6px' }}>
                    Metrajınıza özel bayi fiyatı
                  </div>
                </div>

                <div>
                  <button
                    onClick={() => setShowSampleModal(true)}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.04)',
                      color: '#f8fafc',
                      border: '1px solid rgba(255, 255, 255, 0.14)',
                      borderRadius: '12px',
                      padding: '14px 18px',
                      fontSize: '0.9rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Box size={16} style={{ color: '#d4af37' }} />
                    <span>15×15 Numune İste</span>
                  </button>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', textAlign: 'center', marginTop: '6px' }}>
                    Özel kargo kutusuyla adrese teslim
                  </div>
                </div>
              </div>

              {/* Area Calculator Accordion Trigger */}
              <button
                onClick={() => setShowCalculator(!showCalculator)}
                style={{
                  width: '100%',
                  background: showCalculator ? 'rgba(212, 175, 55, 0.06)' : 'rgba(255, 255, 255, 0.02)',
                  border: showCalculator ? '1px solid rgba(212, 175, 55, 0.25)' : '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '10px',
                  padding: '11px 16px',
                  color: showCalculator ? '#d4af37' : '#94a3b8',
                  fontSize: '0.82rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calculator size={15} style={{ color: '#d4af37' }} />
                  <span>Metraj ve Kutu Adedi Hesaplayıcı</span>
                </span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {showCalculator ? 'Hesaplayıcıyı Kapat ▲' : 'Metrajı Hesapla ▼'}
                </span>
              </button>

              {/* Area Calculator Drawer */}
              {showCalculator && (
                <div style={{
                  marginTop: '14px',
                  padding: '18px',
                  background: 'rgba(0, 0, 0, 0.35)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '14px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#fff' }}>
                      Kaplanacak Net Alanı Girin
                    </span>
                    <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'inline-flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={includeWastage} 
                        onChange={(e) => setIncludeWastage(e.target.checked)}
                        style={{ accentColor: '#d4af37' }}
                      />
                      <span>+%10 Mimari Kesim & Fire Payı</span>
                    </label>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <input
                        type="number"
                        min="1"
                        value={customM2}
                        onChange={(e) => setCustomM2(e.target.value)}
                        placeholder="Metraj (m²)"
                        style={{
                          width: '100%',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          color: '#fff',
                          borderRadius: '10px',
                          padding: '10px 14px',
                          fontSize: '0.9rem',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                      <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.8rem', color: '#64748b' }}>
                        m²
                      </span>
                    </div>

                    <button
                      onClick={openQuoteWithCalculatedArea}
                      style={{
                        background: 'rgba(212, 175, 55, 0.18)',
                        border: '1px solid rgba(212, 175, 55, 0.4)',
                        color: '#f3d375',
                        borderRadius: '10px',
                        padding: '10px 18px',
                        fontSize: '0.84rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Bu Metrajla Teklif Al →
                    </button>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '14px', flexWrap: 'wrap' }}>
                    {['15', '30', '50', '100', '200'].map((val) => (
                      <button
                        key={val}
                        onClick={() => setCustomM2(val)}
                        style={{
                          background: customM2 === val ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                          border: customM2 === val ? '1px solid rgba(212, 175, 55, 0.4)' : '1px solid rgba(255, 255, 255, 0.07)',
                          color: customM2 === val ? '#d4af37' : '#94a3b8',
                          borderRadius: '6px',
                          padding: '4px 10px',
                          fontSize: '0.72rem',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        {val} m²
                      </button>
                    ))}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', textAlign: 'center', fontSize: '0.78rem' }}>
                    <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <div style={{ color: '#64748b' }}>Gereken Alan</div>
                      <div style={{ color: '#fff', fontWeight: '800', marginTop: '3px', fontSize: '0.92rem' }}>{targetArea.toFixed(1)} m²</div>
                    </div>
                    <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <div style={{ color: '#64748b' }}>Karo Adedi</div>
                      <div style={{ color: '#fff', fontWeight: '800', marginTop: '3px', fontSize: '0.92rem' }}>{calculatedTiles} adet</div>
                    </div>
                    <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <div style={{ color: '#64748b' }}>Tahmini Kutu</div>
                      <div style={{ color: '#fff', fontWeight: '800', marginTop: '3px', fontSize: '0.92rem' }}>~{estimatedBoxes} kutu</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Technical Data Sheet Section */}
        <section style={{ marginTop: '50px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <div style={{ width: '4px', height: '24px', background: '#d4af37', borderRadius: '2px' }} />
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#fff', margin: 0 }}>
              Teknik Özellikler & Şartname Değerleri (TDS)
            </h2>
          </div>

          <div style={{
            background: 'rgba(15, 23, 42, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            overflow: 'hidden'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <td style={{ padding: '14px 20px', color: '#94a3b8', width: '35%', fontWeight: '600' }}>Üretici Marka</td>
                  <td style={{ padding: '14px 20px', color: '#fff', fontWeight: '700' }}>{brandName}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <td style={{ padding: '14px 20px', color: '#94a3b8', fontWeight: '600' }}>Koleksiyon & Model Kodu</td>
                  <td style={{ padding: '14px 20px', color: '#d4af37', fontFamily: 'monospace', fontWeight: '700' }}>{product.code}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <td style={{ padding: '14px 20px', color: '#94a3b8', fontWeight: '600' }}>Ebat / Ölçü</td>
                  <td style={{ padding: '14px 20px', color: '#fff' }}>{product.width} cm x {product.height} cm</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <td style={{ padding: '14px 20px', color: '#94a3b8', fontWeight: '600' }}>Et Kalınlığı</td>
                  <td style={{ padding: '14px 20px', color: '#fff' }}>{product.thickness || 9.5} mm</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <td style={{ padding: '14px 20px', color: '#94a3b8', fontWeight: '600' }}>Yüzey Bitişi</td>
                  <td style={{ padding: '14px 20px', color: '#fff' }}>{product.finish || 'Mat'}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <td style={{ padding: '14px 20px', color: '#94a3b8', fontWeight: '600' }}>Doku & Tipoloji</td>
                  <td style={{ padding: '14px 20px', color: '#fff' }}>{product.style || 'Mermer'}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <td style={{ padding: '14px 20px', color: '#94a3b8', fontWeight: '600' }}>Aşınma Dayanımı (PEI)</td>
                  <td style={{ padding: '14px 20px', color: '#fff' }}>
                    {product.peiRating ? `PEI ${product.peiRating}` : 'PEI 3-4 (Konut & Ticari Yoğun Trafik)'}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <td style={{ padding: '14px 20px', color: '#94a3b8', fontWeight: '600' }}>Kaydırmazlık Sınıfı</td>
                  <td style={{ padding: '14px 20px', color: '#fff' }}>{product.slipResistance || 'R10 (Islak Zemin Güvenli)'}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <td style={{ padding: '14px 20px', color: '#94a3b8', fontWeight: '600' }}>Dona Dayanıklılık (Frost Resistance)</td>
                  <td style={{ padding: '14px 20px', color: '#fff' }}>
                    {product.frostResistance ? 'Evet (Dona Dayanıklı / Teras & Dış Cephe Uygun)' : 'İç Mekan'}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <td style={{ padding: '14px 20px', color: '#94a3b8', fontWeight: '600' }}>Kenar Tipi</td>
                  <td style={{ padding: '14px 20px', color: '#fff' }}>
                    {product.rectified ? 'Rektifiyeli (Lazer Kesim, Minimum 1mm Derz)' : 'Standart Derzli'}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '14px 20px', color: '#94a3b8', fontWeight: '600' }}>Tavsiye Edilen Alanlar</td>
                  <td style={{ padding: '14px 20px', color: '#d4af37' }}>{product.area || 'Banyo, Mutfak, Salon, Islak Hacim'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Authorized Dealers Section */}
        {((liveDealers && liveDealers.length > 0) || (authorizedDealers && authorizedDealers.length > 0)) && (() => {
          const displayDealers = liveDealers && liveDealers.length > 0 ? liveDealers : authorizedDealers;
          return (
            <section style={{ marginTop: '50px' }} id="authorized-dealers-section">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '4px', height: '24px', background: '#d4af37', borderRadius: '2px' }} />
                  <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#fff', margin: 0 }}>
                    Bu Karoyu İnceleyebileceğiniz En Yakın Yetkili Showroomlar
                  </h2>
                </div>
                <Link href="/bayiler" style={{ color: '#d4af37', fontSize: '0.85rem', textDecoration: 'none', fontWeight: '700' }}>
                  Tüm Bayileri Gör →
                </Link>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '16px'
              }}>
                {displayDealers.slice(0, 3).map((dealer) => (
                  <div
                    key={dealer.id}
                    style={{
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '14px',
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#d4af37', fontSize: '0.75rem', fontWeight: '700' }}>
                          <Building2 size={14} />
                          <span>{dealer.city} / {dealer.district}</span>
                        </div>
                        {typeof dealer.distanceKm === 'number' && (
                          <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: '700', background: 'rgba(56, 189, 248, 0.1)', padding: '2px 8px', borderRadius: '6px' }}>
                            {dealer.distanceKm} km
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '1.05rem', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>
                        {dealer.name}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.4, marginBottom: '14px' }}>
                        {dealer.address}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <a
                        href={`tel:${dealer.phone}`}
                        style={{
                          flex: 1,
                          background: 'rgba(255, 255, 255, 0.05)',
                          color: '#fff',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          fontSize: '0.78rem',
                          fontWeight: '700',
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <Phone size={13} style={{ color: '#10b981' }} />
                        <span>Ara</span>
                      </a>

                      <Link
                        href={`/bayi/${slugify(dealer.name)}`}
                        style={{
                          flex: 1.2,
                          background: 'rgba(212, 175, 55, 0.15)',
                          color: '#d4af37',
                          border: '1px solid rgba(212, 175, 55, 0.3)',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          fontSize: '0.78rem',
                          fontWeight: '700',
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <span>Showroom İncele</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })()}

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <section style={{ marginTop: '50px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '4px', height: '24px', background: '#d4af37', borderRadius: '2px' }} />
                <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#fff', margin: 0 }}>
                  {brandName} Diğer Koleksiyonları
                </h2>
              </div>
              <Link href={`/marka/${brandSlug}`} style={{ color: '#d4af37', fontSize: '0.85rem', textDecoration: 'none', fontWeight: '700' }}>
                Tüm Koleksiyonu Gör →
              </Link>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '20px'
            }}>
              {relatedProducts.map((rel) => {
                const relSlug = slugify(`${brandName} ${rel.name}`);
                return (
                  <Link
                    key={rel.id}
                    href={`/urun/${relSlug}`}
                    style={{
                      background: 'rgba(15, 23, 42, 0.6)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '14px',
                      overflow: 'hidden',
                      textDecoration: 'none',
                      transition: 'all 0.2s',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <div style={{ width: '100%', aspectRatio: '1 / 1', position: 'relative', background: '#0e1422' }}>
                      <img
                        src={rel.imageUrl}
                        alt={rel.name}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    </div>
                    <div style={{ padding: '14px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: '#d4af37', fontWeight: '700', textTransform: 'uppercase' }}>{brandName}</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#fff', margin: '4px 0 8px' }}>{rel.name}</div>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        📐 {rel.width}x{rel.height} cm • {rel.finish}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

      </main>

      {/* ---------------- FULLSCREEN IMAGE ZOOM MODAL ---------------- */}
      {showImageZoom && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.92)',
          backdropFilter: 'blur(16px)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}>
          <button
            onClick={() => setShowImageZoom(false)}
            style={{
              position: 'absolute',
              top: '24px',
              right: '24px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#fff',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
          
          <img
            src={currentDisplayImage}
            alt={`${brandName} ${product.name}`}
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              objectFit: 'contain',
              borderRadius: '12px',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)'
            }}
          />
        </div>
      )}

      {/* ---------------- SAMPLE ORDER MODAL ---------------- */}
      {showSampleModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(10px)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#0d131f',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            maxWidth: '500px',
            width: '100%',
            padding: '28px',
            position: 'relative',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <button
              onClick={() => setShowSampleModal(false)}
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#94a3b8',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={15} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Box size={20} style={{ color: '#d4af37' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#fff', margin: 0 }}>
                15×15 Kesit Numune Talebi
              </h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '20px', lineHeight: 1.45 }}>
              <strong>{brandName} — {product.name}</strong> karosundan adresinize ücretsiz 15×15 cm kesit numune kutusu sevk edilsin.
            </p>

            {sampleSuccess ? (
              <div style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                padding: '16px',
                borderRadius: '12px',
                color: '#34d399',
                fontSize: '0.88rem',
                textAlign: 'center',
                fontWeight: '600'
              }}>
                ✓ {sampleSuccess}
              </div>
            ) : (
              <form onSubmit={handleSampleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {sampleError && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', padding: '10px', borderRadius: '8px', fontSize: '0.8rem' }}>
                    {sampleError}
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>Adınız Soyadınız *</label>
                  <input
                    type="text"
                    required
                    placeholder="Adınız Soyadınız"
                    value={sampleForm.name}
                    onChange={(e) => setSampleForm({ ...sampleForm, name: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)', background: '#090d16', color: '#fff', fontSize: '0.85rem', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>Telefon *</label>
                    <input
                      type="tel"
                      required
                      placeholder="05XX XXX XX XX"
                      value={sampleForm.phone}
                      onChange={(e) => setSampleForm({ ...sampleForm, phone: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)', background: '#090d16', color: '#fff', fontSize: '0.85rem', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>E-Posta *</label>
                    <input
                      type="email"
                      required
                      placeholder="ornek@mail.com"
                      value={sampleForm.email}
                      onChange={(e) => setSampleForm({ ...sampleForm, email: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)', background: '#090d16', color: '#fff', fontSize: '0.85rem', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>Şehir *</label>
                    <select
                      value={sampleForm.city}
                      onChange={(e) => setSampleForm({ ...sampleForm, city: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)', background: '#090d16', color: '#fff', fontSize: '0.85rem', boxSizing: 'border-box' }}
                    >
                      {TURKEY_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>İlçe</label>
                    <input
                      type="text"
                      placeholder="İlçe"
                      value={sampleForm.district}
                      onChange={(e) => setSampleForm({ ...sampleForm, district: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)', background: '#090d16', color: '#fff', fontSize: '0.85rem', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>Kargo Teslimat Adresi *</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Ofis, şantiye veya ev teslimat adresiniz..."
                    value={sampleForm.address}
                    onChange={(e) => setSampleForm({ ...sampleForm, address: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)', background: '#090d16', color: '#fff', fontSize: '0.85rem', boxSizing: 'border-box' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={sampleSubmitting}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #d4af37 0%, #c49a2c 100%)',
                    color: '#090d16',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px',
                    fontSize: '0.88rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    marginTop: '6px'
                  }}
                >
                  {sampleSubmitting ? 'Talebiniz İletiliyor...' : 'Numuneyi Ücretsiz Talep Et'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ---------------- QUOTE REQUEST MODAL ---------------- */}
      {showQuoteModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(10px)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#0d131f',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            maxWidth: '500px',
            width: '100%',
            padding: '28px',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowQuoteModal(false)}
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#94a3b8',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={15} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Send size={20} style={{ color: '#d4af37' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#fff', margin: 0 }}>
                En Yakın Bayiden Fiyat Teklifi Al
              </h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '20px', lineHeight: 1.45 }}>
              <strong>{brandName} {product.name}</strong> için projenizin büyüklüğüne göre en avantajlı yetkili bayi teklifini hazırlayalım.
            </p>

            {quoteSuccess ? (
              <div style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                padding: '16px',
                borderRadius: '12px',
                color: '#34d399',
                fontSize: '0.88rem',
                textAlign: 'center',
                fontWeight: '600'
              }}>
                ✓ {quoteSuccess}
              </div>
            ) : (
              <form onSubmit={handleQuoteSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {quoteError && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', padding: '10px', borderRadius: '8px', fontSize: '0.8rem' }}>
                    {quoteError}
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>Ad Soyad / Firma Adı *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ad Soyad veya Firma"
                    value={quoteForm.name}
                    onChange={(e) => setQuoteForm({ ...quoteForm, name: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)', background: '#090d16', color: '#fff', fontSize: '0.85rem', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>Telefon *</label>
                    <input
                      type="tel"
                      required
                      placeholder="05XX XXX XX XX"
                      value={quoteForm.phone}
                      onChange={(e) => setQuoteForm({ ...quoteForm, phone: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)', background: '#090d16', color: '#fff', fontSize: '0.85rem', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>E-Posta *</label>
                    <input
                      type="email"
                      required
                      placeholder="ornek@mail.com"
                      value={quoteForm.email}
                      onChange={(e) => setQuoteForm({ ...quoteForm, email: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)', background: '#090d16', color: '#fff', fontSize: '0.85rem', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>İl *</label>
                    <select
                      value={quoteForm.city}
                      onChange={(e) => setQuoteForm({ ...quoteForm, city: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)', background: '#090d16', color: '#fff', fontSize: '0.85rem', boxSizing: 'border-box' }}
                    >
                      {TURKEY_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>Tahmini Metraj (m²)</label>
                    <input
                      type="number"
                      placeholder="Örn: 150"
                      value={quoteForm.areaM2}
                      onChange={(e) => setQuoteForm({ ...quoteForm, areaM2: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)', background: '#090d16', color: '#fff', fontSize: '0.85rem', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>Proje Notları (Opsiyonel)</label>
                  <textarea
                    rows={2}
                    placeholder="Şantiye teslimi, uygulama desteği veya özel talepleriniz..."
                    value={quoteForm.notes}
                    onChange={(e) => setQuoteForm({ ...quoteForm, notes: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)', background: '#090d16', color: '#fff', fontSize: '0.85rem', boxSizing: 'border-box' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={quoteSubmitting}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #d4af37 0%, #c49a2c 100%)',
                    color: '#090d16',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px',
                    fontSize: '0.88rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    marginTop: '6px'
                  }}
                >
                  {quoteSubmitting ? 'İletiliyor...' : 'Teklif Talebini Gönder'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ---------------- AI REMODEL MODAL ---------------- */}
      {showAIRemodel && (
        <AIRemodelModal
          isOpen={showAIRemodel}
          onClose={() => setShowAIRemodel(false)}
          selectedProduct={product}
          onGoToDealers={() => {
            setShowAIRemodel(false);
            const dealersEl = document.getElementById('authorized-dealers-section');
            if (dealersEl) {
              dealersEl.scrollIntoView({ behavior: 'smooth' });
            } else {
              setShowQuoteModal(true);
            }
          }}
          onRequestSample={() => {
            setShowAIRemodel(false);
            setShowSampleModal(true);
          }}
        />
      )}

    </div>
  );
}
