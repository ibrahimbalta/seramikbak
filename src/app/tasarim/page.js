'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { 
  Sparkles, 
  Layers, 
  RotateCcw, 
  Building2, 
  X, 
  Search,
  Maximize2,
  Minimize2,
  Camera,
  MapPin,
  MessageCircle,
  Sun,
  Sunset,
  Moon,
  ChevronUp,
  ChevronDown,
  Check,
  ExternalLink,
  Phone,
  Sliders,
  Share2,
  Grid
} from 'lucide-react';

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
      background: '#080c16',
      color: '#94a3b8',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      gap: '16px'
    }}>
      <div style={{
        width: '42px',
        height: '42px',
        border: '3px solid rgba(212, 175, 55, 0.2)',
        borderTopColor: '#d4af37',
        borderRadius: '50%',
        animation: 'sb-spin 0.8s linear infinite'
      }} />
      <span style={{ fontSize: '0.9rem', fontWeight: '600', letterSpacing: '0.02em' }}>
        3D Mekan & Seramik Stüdyosu Yükleniyor...
      </span>
      <style>{`@keyframes sb-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
});

// Built-in Luxury Brand Catalogs Fallback
const DEFAULT_BRAND_CATALOG = [
  { id: 'gur-1', name: 'White Silver Full Lappato', code: 'GUR-SILV-60120', width: 60, height: 120, style: 'Mermer', finish: 'Full Lappato', color: 'Beyaz / Gümüş', brand: { id: 'gural', name: 'Güral Seramik' }, imageUrl: '/textures/calacatta_gold.jpg', textureUrl: '/textures/calacatta_gold.jpg' },
  { id: 'gur-2', name: 'West Wood Mat Teak', code: 'GUR-WOOD-20120', width: 20, height: 120, style: 'Ahşap', finish: 'Mat', color: 'Teak', brand: { id: 'gural', name: 'Güral Seramik' }, imageUrl: '/textures/teak_ahsap.jpg', textureUrl: '/textures/teak_ahsap.jpg' },
  { id: 'gur-3', name: 'West Wood Mat Kayın', code: 'GUR-KAYIN-20120', width: 20, height: 120, style: 'Ahşap', finish: 'Mat', color: 'Doğal Meşe', brand: { id: 'gural', name: 'Güral Seramik' }, imageUrl: '/textures/natural_oak.jpg', textureUrl: '/textures/natural_oak.jpg' },
  { id: 'kal-1', name: 'Calacatta Gold Porselen', code: 'KAL-CAL-60120', width: 60, height: 120, style: 'Mermer', finish: 'Parlak Rektifiye', color: 'Beyaz / Altın', brand: { id: 'kalebodur', name: 'Kalebodur' }, imageUrl: '/textures/calacatta_gold.jpg', textureUrl: '/textures/calacatta_gold.jpg' },
  { id: 'kal-2', name: 'Nero Marquina Damarlı Siyah', code: 'KAL-NERO-60120', width: 60, height: 120, style: 'Mermer', finish: 'Lüks Parlak', color: 'Siyah', brand: { id: 'kalebodur', name: 'Kalebodur' }, imageUrl: '/textures/albatros_antrasit.jpg', textureUrl: '/textures/albatros_antrasit.jpg' },
  { id: 'vit-1', name: 'Marbleous Calacatta Porselen', code: 'VIT-CAL-60120', width: 60, height: 120, style: 'Mermer', finish: 'Mat Rektifiye', color: 'Beyaz / Gold', brand: { id: 'vitra', name: 'VitrA' }, imageUrl: '/textures/calacatta_gold.jpg', textureUrl: '/textures/calacatta_gold.jpg' },
  { id: 'vit-2', name: 'Cementmix Gri Beton Karo', code: 'VIT-CEM-6060', width: 60, height: 60, style: 'Beton', finish: 'Lapatto', color: 'Açık Gri', brand: { id: 'vitra', name: 'VitrA' }, imageUrl: '/textures/concrete_light_grey.jpg', textureUrl: '/textures/concrete_light_grey.jpg' },
  { id: 'bie-1', name: 'Nordic Meşe Ahşap Karo', code: 'BIE-OAK-20120', width: 20, height: 120, style: 'Ahşap', finish: 'Mat Ahşap', color: 'Doğal Meşe', brand: { id: 'bien', name: 'Bien Seramik' }, imageUrl: '/textures/natural_oak.jpg', textureUrl: '/textures/natural_oak.jpg' },
  { id: 'ege-1', name: 'Loft Antrasit Beton Porselen', code: 'EGE-LOFT-8080', width: 80, height: 80, style: 'Beton', finish: 'Lapatto', color: 'Antrasit', brand: { id: 'ege', name: 'Ege Seramik' }, imageUrl: '/textures/loft_beton.jpg', textureUrl: '/textures/loft_beton.jpg' },
  { id: 'gra-4', name: 'Travertino Bej Taş Karo', code: 'GRA-TRAV-60120', width: 60, height: 120, style: 'Taş', finish: 'Rölyef Mat', color: 'Sıcak Bej', brand: { id: 'graniser', name: 'Graniser' }, imageUrl: '/textures/travertino_classico.jpg', textureUrl: '/textures/travertino_classico.jpg' }
];

export default function BrandConsumerStudioPage() {
  const [mounted, setMounted] = useState(false);
  const [brandInfo, setBrandInfo] = useState({
    name: 'Güral Seramik',
    slug: 'gural-seramik',
    logoUrl: '/logos/gural.png'
  });
  const [themeColor, setThemeColor] = useState('#d4af37');

  // 3D Scene Controls
  const [roomType, setRoomType] = useState('bathroom'); // 'bathroom' | 'kitchen' | 'livingroom' | 'terrace'
  const [timeOfDay, setTimeOfDay] = useState('day'); // 'day' | 'sunset' | 'night'
  const [layPattern, setLayPattern] = useState('flat'); // 'flat' | 'diagonal' | 'herringbone'

  // Products & Surface Application
  const [products, setProducts] = useState(DEFAULT_BRAND_CATALOG);
  const [selectedProduct, setSelectedProduct] = useState(DEFAULT_BRAND_CATALOG[0]);
  const [floorProduct, setFloorProduct] = useState(DEFAULT_BRAND_CATALOG[0]);
  const [wallProduct, setWallProduct] = useState(DEFAULT_BRAND_CATALOG[0]);
  const [stripeWallProduct, setStripeWallProduct] = useState(null);
  const [activeTargetSurface, setActiveTargetSurface] = useState('both'); // 'floor' | 'walls' | 'both'
  const [applyFloor, setApplyFloor] = useState(true);
  const [applyWalls, setApplyWalls] = useState(true);
  const [applyStripeWall, setApplyStripeWall] = useState(false);

  // Filters & Drawer State
  const [selectedStyle, setSelectedStyle] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDrawerCollapsed, setIsDrawerCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Modals & Feedback
  const [showDealersModal, setShowDealersModal] = useState(false);
  const [showSampleModal, setShowSampleModal] = useState(false);
  const [dealers, setDealers] = useState([]);
  const [loadingDealers, setLoadingDealers] = useState(false);
  const [sampleForm, setSampleForm] = useState({ name: '', phone: '', city: '', note: '' });
  const [sampleSuccess, setSampleSuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2800);
  };

  // URL Query Parameters Parsing
  useEffect(() => {
    setMounted(true);
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    const queryBrand = urlParams.get('brand') || urlParams.get('brandSlug') || urlParams.get('brandId');
    const queryTheme = urlParams.get('theme') || urlParams.get('color') || urlParams.get('primary');
    const queryScene = urlParams.get('scene') || urlParams.get('room');
    const queryProduct = urlParams.get('product') || urlParams.get('productId') || urlParams.get('code');

    if (queryTheme) {
      setThemeColor(queryTheme.startsWith('#') ? queryTheme : `#${queryTheme}`);
    }

    if (queryScene) {
      const s = queryScene.toLowerCase();
      if (s === 'mutfak' || s === 'kitchen') {
        setRoomType('kitchen');
        setApplyWalls(false);
        setApplyStripeWall(true);
      } else if (s === 'salon' || s === 'livingroom') {
        setRoomType('livingroom');
        setApplyWalls(false);
        setApplyStripeWall(false);
      } else if (s === 'teras' || s === 'terrace') {
        setRoomType('terrace');
        setApplyWalls(false);
        setApplyStripeWall(false);
      } else {
        setRoomType('bathroom');
        setApplyWalls(true);
      }
    }

    // Load Brand Metadata and Isolated Catalog
    async function initBrandData() {
      const targetBrandSlug = queryBrand || 'gural-seramik';

      try {
        const brandRes = await fetch('/api/brands').then(r => r.json()).catch(() => null);
        if (Array.isArray(brandRes)) {
          const matched = brandRes.find(b => 
            b.slug === targetBrandSlug ||
            b.id === targetBrandSlug ||
            b.name?.toLowerCase().includes(targetBrandSlug.toLowerCase()) ||
            targetBrandSlug.toLowerCase().includes(b.slug)
          );
          if (matched) {
            setBrandInfo({
              id: matched.id,
              name: matched.name,
              slug: matched.slug,
              logoUrl: matched.logoUrl
            });

            // Fetch products specifically for this brand
            const prodRes = await fetch(`/api/products?brandId=${matched.id}&limit=80`).then(r => r.json()).catch(() => null);
            if (prodRes && prodRes.products && prodRes.products.length > 0) {
              const cleaned = prodRes.products.map(p => ({
                ...p,
                imageUrl: p.imageUrl || p.textureUrl || '/textures/calacatta_gold.jpg',
                textureUrl: p.textureUrl || p.imageUrl || '/textures/calacatta_gold.jpg'
              }));
              setProducts(cleaned);
              setSelectedProduct(cleaned[0]);
              setFloorProduct(cleaned[0]);
              setWallProduct(cleaned[0]);
              return;
            }
          }
        }
      } catch (e) {
        console.warn('Brand metadata fetch error:', e);
      }

      // Fallback matching in local catalog
      const bLower = targetBrandSlug.toLowerCase();
      const localMatches = DEFAULT_BRAND_CATALOG.filter(p =>
        p.brand?.id?.toLowerCase().includes(bLower) ||
        p.brand?.name?.toLowerCase().includes(bLower) ||
        bLower.includes(p.brand?.id?.toLowerCase())
      );
      if (localMatches.length > 0) {
        setProducts(localMatches);
        setSelectedProduct(localMatches[0]);
        setFloorProduct(localMatches[0]);
        setWallProduct(localMatches[0]);
        setBrandInfo({
          name: localMatches[0].brand.name,
          slug: localMatches[0].brand.id,
          logoUrl: ''
        });
      }
    }

    initBrandData();
  }, []);

  // Fetch Dealers when modal opens
  const handleOpenDealersModal = async () => {
    setShowDealersModal(true);
    setLoadingDealers(true);
    try {
      const brandIdParam = brandInfo?.id ? `?brandId=${brandInfo.id}` : '';
      const res = await fetch(`/api/dealers${brandIdParam}`).then(r => r.json()).catch(() => null);
      if (Array.isArray(res) && res.length > 0) {
        setDealers(res);
      } else {
        // Fallback demo dealers for the brand
        setDealers([
          { id: 'd1', name: `${brandInfo.name} Merkez Showroom`, city: 'İstanbul', district: 'Kadıköy', phone: '0216 444 00 00', address: 'Bağdat Caddesi No: 120' },
          { id: 'd2', name: `${brandInfo.name} Konsept Mağaza`, city: 'Ankara', district: 'Çankaya', phone: '0312 444 00 00', address: 'Turan Güneş Bulvarı No: 45' },
          { id: 'd3', name: `${brandInfo.name} Ege Bölge Bayi`, city: 'İzmir', district: 'Alsancak', phone: '0232 444 00 00', address: 'Şair Eşref Bulvarı No: 18' }
        ]);
      }
    } catch (e) {
      console.warn('Dealers fetch error:', e);
    } finally {
      setLoadingDealers(false);
    }
  };

  // High-Resolution Snapshot Capture
  const handleDownloadSnapshot = () => {
    try {
      const canvasEl = document.querySelector('canvas');
      if (canvasEl) {
        const dataUrl = canvasEl.toDataURL('image/png', 1.0);
        const link = document.createElement('a');
        link.download = `${brandInfo.slug || 'marka'}-3d-tasarimim.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('📸 3D Tasarımınız yüksek çözünürlükte kaydedildi!');
      } else {
        showToast('Görsel alınamadı, lütfen sayfayı yenileyiniz.');
      }
    } catch (e) {
      console.error('Snapshot error:', e);
      showToast('Ekran görüntüsü alınırken bir sorun oluştu.');
    }
  };

  // Fullscreen Toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Apply Ceramic Tile to Selected Surface
  const handleApplyTile = (tile, target = activeTargetSurface) => {
    setSelectedProduct(tile);
    const tileName = tile.name.length > 25 ? tile.name.slice(0, 25) + '...' : tile.name;

    if (target === 'floor') {
      setFloorProduct(tile);
      setApplyFloor(true);
      showToast(`✓ Zemin: ${tileName} kaplandı`);
    } else if (target === 'walls') {
      setWallProduct(tile);
      setApplyWalls(true);
      if (roomType === 'kitchen') {
        setStripeWallProduct(tile);
        setApplyStripeWall(true);
      }
      showToast(`✓ Duvar: ${tileName} kaplandı`);
    } else {
      // Both surfaces
      setFloorProduct(tile);
      setWallProduct(tile);
      setApplyFloor(true);
      setApplyWalls(true);
      if (roomType === 'kitchen') {
        setStripeWallProduct(tile);
        setApplyStripeWall(true);
      }
      showToast(`✓ Mekan: ${tileName} ile kaplandı`);
    }
  };

  // Filter Catalog Products
  const filteredProducts = products.filter(p => {
    let styleMatch = true;
    if (selectedStyle !== 'all') {
      const s = (p.style || '').toLowerCase();
      const n = (p.name || '').toLowerCase();
      styleMatch = s.includes(selectedStyle) || n.includes(selectedStyle);
    }
    let searchMatch = true;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      searchMatch = (p.name || '').toLowerCase().includes(q) || (p.code || '').toLowerCase().includes(q);
    }
    return styleMatch && searchMatch;
  });

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      position: 'relative',
      background: '#080c16',
      color: '#f8fafc',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      userSelect: 'none'
    }}>

      {/* -------------------- 1. TOP FLOATING BRAND HEADER BAR -------------------- */}
      <header style={{
        position: 'absolute',
        top: '16px',
        left: '16px',
        right: '16px',
        zIndex: 50,
        height: '56px',
        background: 'rgba(11, 15, 25, 0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 18px',
        boxSizing: 'border-box'
      }}>
        {/* Left: Brand Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: `linear-gradient(135deg, ${themeColor} 0%, #111827 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 2px 10px ${themeColor}35`,
            overflow: 'hidden',
            flexShrink: 0
          }}>
            {brandInfo.logoUrl ? (
              <img src={brandInfo.logoUrl} alt={brandInfo.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : (
              <Sparkles size={18} color="#ffffff" />
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.92rem', fontWeight: '800', color: '#f8fafc', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
              {brandInfo.name}
            </span>
            <span style={{ fontSize: '0.66rem', color: themeColor, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              3D Mekan Tasarım Stüdyosu
            </span>
          </div>
        </div>

        {/* Center: Room Scene Switcher */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '4px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          {[
            { id: 'bathroom', label: 'Banyo', icon: '🛁' },
            { id: 'kitchen', label: 'Mutfak', icon: '🍳' },
            { id: 'livingroom', label: 'Salon', icon: '🛋️' },
            { id: 'terrace', label: 'Teras', icon: '☀️' }
          ].map(r => {
            const isSelected = roomType === r.id;
            return (
              <button
                key={r.id}
                onClick={() => {
                  setRoomType(r.id);
                  if (r.id === 'kitchen') {
                    setApplyWalls(false);
                    setApplyStripeWall(true);
                  } else if (r.id === 'livingroom' || r.id === 'terrace') {
                    setApplyWalls(false);
                    setApplyStripeWall(false);
                  } else {
                    setApplyWalls(true);
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '9px',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: isSelected ? '800' : '600',
                  color: isSelected ? '#0b0f19' : '#94a3b8',
                  background: isSelected ? themeColor : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease'
                }}
              >
                <span>{r.icon}</span>
                <span>{r.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Consumer Action CTAs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handleDownloadSnapshot}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.07)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#f8fafc',
              fontSize: '0.78rem',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'background 0.15s'
            }}
            title="Tasarladığın mekanı yüksek çözünürlüklü fotoğraf olarak kaydet"
          >
            <Camera size={14} color={themeColor} />
            <span className="btn-label-desktop">Fotoğrafı İndir</span>
          </button>

          <button
            onClick={handleOpenDealersModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.07)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#f8fafc',
              fontSize: '0.78rem',
              fontWeight: '700',
              cursor: 'pointer'
            }}
            title="Bu seramikleri yerinde görmek için yetkili bayileri bulun"
          >
            <MapPin size={14} color="#38bdf8" />
            <span className="btn-label-desktop">En Yakın Bayi</span>
          </button>

          <button
            onClick={() => setShowSampleModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '10px',
              background: `linear-gradient(135deg, ${themeColor} 0%, #b89628 100%)`,
              border: 'none',
              color: '#0b0f19',
              fontSize: '0.78rem',
              fontWeight: '800',
              cursor: 'pointer',
              boxShadow: `0 2px 12px ${themeColor}35`
            }}
            title="Seçtiğin seramik için ücretsiz numune veya fiyat teklifi iste"
          >
            <MessageCircle size={14} />
            <span>Numune Talep Et</span>
          </button>

          <button
            onClick={toggleFullscreen}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            title={isFullscreen ? 'Tam Ekrandan Çık' : 'Tam Ekran'}
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>
      </header>

      {/* -------------------- 2. FULL VIEWPORT 3D CANVAS -------------------- */}
      <div style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
        {mounted && (
          <StudioCanvas
            activeProduct={selectedProduct}
            floorProduct={floorProduct}
            wallProduct={wallProduct}
            stripeWallProduct={stripeWallProduct}
            applyFloor={applyFloor}
            applyWalls={applyWalls}
            applyStripeWall={applyStripeWall}
            roomType={roomType}
            timeOfDay={timeOfDay}
            layPattern={layPattern}
            lightIntensity={1.05}
          />
        )}
      </div>

      {/* -------------------- 3. FLOATING QUICK MOOD & PATTERN PILLS -------------------- */}
      <div style={{
        position: 'absolute',
        top: '84px',
        right: '16px',
        zIndex: 40,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        {/* Surface Target Selector */}
        <div style={{
          background: 'rgba(11, 15, 25, 0.85)',
          backdropFilter: 'blur(16px)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '4px',
          display: 'flex',
          gap: '3px'
        }}>
          {[
            { id: 'both', label: 'Tüm Mekan' },
            { id: 'floor', label: 'Zemin' },
            { id: 'walls', label: 'Duvar' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTargetSurface(t.id)}
              style={{
                padding: '5px 10px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '0.72rem',
                fontWeight: activeTargetSurface === t.id ? '800' : '600',
                background: activeTargetSurface === t.id ? themeColor : 'transparent',
                color: activeTargetSurface === t.id ? '#0b0f19' : '#94a3b8',
                cursor: 'pointer'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Day / Sunset / Night Lighting Controls */}
        <div style={{
          background: 'rgba(11, 15, 25, 0.85)',
          backdropFilter: 'blur(16px)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '4px',
          display: 'flex',
          gap: '3px'
        }}>
          {[
            { id: 'day', label: 'Gündüz', icon: Sun },
            { id: 'sunset', label: 'Gün Batımı', icon: Sunset },
            { id: 'night', label: 'Gece', icon: Moon }
          ].map(m => {
            const Icon = m.icon;
            const isSelected = timeOfDay === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setTimeOfDay(m.id)}
                style={{
                  padding: '5px 8px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '0.72rem',
                  fontWeight: isSelected ? '800' : '600',
                  background: isSelected ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                  color: isSelected ? '#f8fafc' : '#94a3b8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Icon size={12} color={isSelected ? themeColor : '#94a3b8'} />
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* -------------------- 4. LUXURY BOTTOM CERAMIC CATALOG SHELF -------------------- */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: isDrawerCollapsed ? 'translateY(calc(100% - 38px))' : 'translateY(0)'
      }}>
        {/* Drawer Toggle Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '-1px' }}>
          <button
            onClick={() => setIsDrawerCollapsed(!isDrawerCollapsed)}
            style={{
              background: 'rgba(11, 15, 25, 0.94)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderBottom: 'none',
              padding: '6px 20px',
              borderRadius: '12px 12px 0 0',
              color: '#cbd5e1',
              fontSize: '0.74rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 -4px 15px rgba(0,0,0,0.2)'
            }}
          >
            <Layers size={13} color={themeColor} />
            <span>{brandInfo.name} Seramik Koleksiyonu ({filteredProducts.length} Model)</span>
            {isDrawerCollapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {/* Shelf Body */}
        <div style={{
          background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.96) 0%, rgba(8, 12, 22, 0.98) 100%)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '14px 20px 20px 20px',
          boxShadow: '0 -15px 40px rgba(0, 0, 0, 0.6)'
        }}>
          {/* Top Filter Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            marginBottom: '14px',
            flexWrap: 'wrap'
          }}>
            {/* Style Filters */}
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
              {[
                { id: 'all', label: 'Tüm Koleksiyon' },
                { id: 'mermer', label: 'Mermer Doku' },
                { id: 'ahsap', label: 'Doğal Ahşap' },
                { id: 'beton', label: 'Modern Beton' },
                { id: 'tas', label: 'Doğal Taş' }
              ].map(s => {
                const isSelected = selectedStyle === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedStyle(s.id)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '8px',
                      border: isSelected ? `1px solid ${themeColor}` : '1px solid rgba(255, 255, 255, 0.08)',
                      background: isSelected ? `${themeColor}20` : 'rgba(255, 255, 255, 0.04)',
                      color: isSelected ? '#ffffff' : '#94a3b8',
                      fontSize: '0.74rem',
                      fontWeight: isSelected ? '800' : '600',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div style={{
              position: 'relative',
              width: '240px',
              maxWidth: '100%'
            }}>
              <Search size={13} color="#64748b" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Model adı veya kod ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  height: '32px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '0 10px 0 30px',
                  color: '#f8fafc',
                  fontSize: '0.74rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Horizontal Tile Swatches Carousel */}
          <div style={{
            display: 'flex',
            gap: '12px',
            overflowX: 'auto',
            paddingBottom: '6px',
            scrollSnapType: 'x mandatory'
          }}>
            {filteredProducts.map((tile) => {
              const isSelected = selectedProduct?.id === tile.id;
              return (
                <div
                  key={tile.id}
                  onClick={() => handleApplyTile(tile)}
                  style={{
                    flexShrink: 0,
                    width: '180px',
                    background: isSelected ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                    border: isSelected ? `2px solid ${themeColor}` : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    padding: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    scrollSnapAlign: 'start',
                    boxSizing: 'border-box'
                  }}
                >
                  {/* Swatch Image */}
                  <div style={{
                    width: '100%',
                    height: '84px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    background: '#1e293b',
                    position: 'relative'
                  }}>
                    <img 
                      src={tile.textureUrl || tile.imageUrl} 
                      alt={tile.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <span style={{
                      position: 'absolute',
                      top: '6px',
                      left: '6px',
                      fontSize: '0.62rem',
                      fontWeight: '800',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: 'rgba(15, 23, 42, 0.85)',
                      color: '#cbd5e1'
                    }}>
                      {tile.width || 60}x{tile.height || 120} cm
                    </span>
                    {isSelected && (
                      <span style={{
                        position: 'absolute',
                        top: '6px',
                        right: '6px',
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        background: themeColor,
                        color: '#0b0f19',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Check size={11} strokeWidth={3} />
                      </span>
                    )}
                  </div>

                  {/* Tile Info */}
                  <div>
                    <div style={{
                      fontSize: '0.74rem',
                      fontWeight: '700',
                      color: '#f8fafc',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {tile.name}
                    </div>
                    <div style={{ fontSize: '0.64rem', color: '#94a3b8', marginTop: '2px' }}>
                      {tile.finish || 'Mat Rektifiye'}
                    </div>
                  </div>

                  {/* Quick Action Buttons */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginTop: '2px' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApplyTile(tile, 'floor');
                      }}
                      style={{
                        padding: '4px',
                        borderRadius: '6px',
                        border: 'none',
                        background: 'rgba(255, 255, 255, 0.08)',
                        color: '#cbd5e1',
                        fontSize: '0.62rem',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      Zemin
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApplyTile(tile, 'walls');
                      }}
                      style={{
                        padding: '4px',
                        borderRadius: '6px',
                        border: 'none',
                        background: 'rgba(255, 255, 255, 0.08)',
                        color: '#cbd5e1',
                        fontSize: '0.62rem',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      Duvar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* -------------------- TOAST FEEDBACK NOTIFICATION -------------------- */}
      {toastMessage && (
        <div style={{
          position: 'absolute',
          top: '84px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 90,
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '30px',
          padding: '8px 20px',
          color: '#ffffff',
          fontSize: '0.82rem',
          fontWeight: '700',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
          animation: 'sb-fade-in 0.2s ease'
        }}>
          {toastMessage}
        </div>
      )}

      {/* -------------------- 5. DEALERS MODAL (EN YAKIN BAYİLER) -------------------- */}
      {showDealersModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          background: 'rgba(5, 8, 16, 0.85)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            maxWidth: '620px',
            width: '100%',
            maxHeight: '85vh',
            background: '#0b0f19',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '20px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '18px 22px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#111827'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
                  <MapPin size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: '#f8fafc' }}>
                    {brandInfo.name} Yetkili Showroom & Bayileri
                  </h3>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                    Seramikleri mağazada canlı görüp dokunmak için en yakın noktayı seçin
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowDealersModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal List */}
            <div style={{ padding: '16px 20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {loadingDealers ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8', fontSize: '0.85rem' }}>
                  Yetkili bayiler yükleniyor...
                </div>
              ) : dealers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8', fontSize: '0.85rem' }}>
                  Kayıtlı bayi bulunamadı.
                </div>
              ) : (
                dealers.map(d => (
                  <div
                    key={d.id}
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '12px',
                      padding: '14px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: '800', color: '#f8fafc' }}>
                        {d.name}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#38bdf8', fontWeight: '600', marginTop: '2px' }}>
                        {d.city} {d.district ? `· ${d.district}` : ''}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '4px' }}>
                        {d.address || 'Showroom Merkez Adresi'}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      {d.phone && (
                        <a
                          href={`tel:${d.phone}`}
                          style={{
                            padding: '8px 12px',
                            borderRadius: '8px',
                            background: 'rgba(255, 255, 255, 0.08)',
                            color: '#ffffff',
                            textDecoration: 'none',
                            fontSize: '0.74rem',
                            fontWeight: '700',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Phone size={12} />
                          <span>Ara</span>
                        </a>
                      )}
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${brandInfo.name} ${d.name} ${d.city}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          padding: '8px 12px',
                          borderRadius: '8px',
                          background: themeColor,
                          color: '#0b0f19',
                          textDecoration: 'none',
                          fontSize: '0.74rem',
                          fontWeight: '800',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <ExternalLink size={12} />
                        <span>Yol Tarifi</span>
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* -------------------- 6. SAMPLE & INQUIRY MODAL (NUMUNE TALEBİ) -------------------- */}
      {showSampleModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          background: 'rgba(5, 8, 16, 0.85)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            maxWidth: '500px',
            width: '100%',
            background: '#0b0f19',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '18px 22px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#111827'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: '#f8fafc' }}>
                  Ücretsiz Numune & Fiyat Talebi
                </h3>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                  {selectedProduct?.name} için numune kargo talebi oluşturun
                </span>
              </div>
              <button
                onClick={() => { setShowSampleModal(false); setSampleSuccess(false); }}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px' }}>
              {sampleSuccess ? (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
                    <Check size={24} />
                  </div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', color: '#ffffff' }}>Talebiniz Alındı!</h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>
                    {brandInfo.name} yetkili temsilcisi numune gönderimi için sizinle 24 saat içinde iletişime geçecektir.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSampleSuccess(true);
                  }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
                >
                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', color: '#cbd5e1', fontWeight: '700', marginBottom: '4px' }}>
                      Adınız Soyadınız
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="Ahmet Yılmaz"
                      value={sampleForm.name}
                      onChange={(e) => setSampleForm({ ...sampleForm, name: e.target.value })}
                      style={{
                        width: '100%',
                        height: '38px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        padding: '0 12px',
                        color: '#f8fafc',
                        fontSize: '0.82rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', color: '#cbd5e1', fontWeight: '700', marginBottom: '4px' }}>
                      Telefon Numaranız
                    </label>
                    <input
                      required
                      type="tel"
                      placeholder="0532 000 00 00"
                      value={sampleForm.phone}
                      onChange={(e) => setSampleForm({ ...sampleForm, phone: e.target.value })}
                      style={{
                        width: '100%',
                        height: '38px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        padding: '0 12px',
                        color: '#f8fafc',
                        fontSize: '0.82rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', color: '#cbd5e1', fontWeight: '700', marginBottom: '4px' }}>
                      Şehir / Teslimat Adresi
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="İstanbul, Kadıköy"
                      value={sampleForm.city}
                      onChange={(e) => setSampleForm({ ...sampleForm, city: e.target.value })}
                      style={{
                        width: '100%',
                        height: '38px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        padding: '0 12px',
                        color: '#f8fafc',
                        fontSize: '0.82rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                    <button
                      type="submit"
                      style={{
                        flex: 1,
                        height: '42px',
                        borderRadius: '10px',
                        background: `linear-gradient(135deg, ${themeColor} 0%, #aa8c2c 100%)`,
                        color: '#0b0f19',
                        fontWeight: '800',
                        fontSize: '0.85rem',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      Numune Talebini İlet
                    </button>

                    <a
                      href={`https://wa.me/905321381061?text=${encodeURIComponent(`Merhaba, ${brandInfo.name} web sitesinden 3D mekanımda tasarladığım ${selectedProduct?.name} (${selectedProduct?.code}) modeli hakkında numune ve fiyat bilgisi almak istiyorum.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '0 16px',
                        borderRadius: '10px',
                        background: '#25D366',
                        color: '#ffffff',
                        fontWeight: '800',
                        fontSize: '0.82rem',
                        textDecoration: 'none'
                      }}
                    >
                      <MessageCircle size={15} />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Global CSS for Responsive Mobile View */}
      <style>{`
        @media (max-width: 768px) {
          .btn-label-desktop {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
