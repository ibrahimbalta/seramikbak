'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { 
  Sparkles, 
  Layers, 
  RotateCcw, 
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
  ChevronLeft,
  ChevronRight,
  Check,
  ExternalLink,
  Phone,
  Grid,
  ChevronDown,
  Palette
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

// Built-in Brand Catalogs Fallback
const DEFAULT_BRAND_CATALOG = [
  { id: 'gur-1', name: 'Güral White Silver Full Lappato', code: 'GUR-SILV-60120', width: 60, height: 120, style: 'Mermer', finish: 'Full Lappato', color: 'Beyaz / Gümüş', brand: { id: 'gural', name: 'Güral Seramik' }, imageUrl: '/textures/calacatta_gold.jpg', textureUrl: '/textures/calacatta_gold.jpg' },
  { id: 'gur-2', name: 'Güral West Wood Mat Teak', code: 'GUR-WOOD-20120', width: 20, height: 120, style: 'Ahşap', finish: 'Mat', color: 'Teak', brand: { id: 'gural', name: 'Güral Seramik' }, imageUrl: '/textures/teak_ahsap.jpg', textureUrl: '/textures/teak_ahsap.jpg' },
  { id: 'gur-3', name: 'Güral West Wood Mat Kayın', code: 'GUR-KAYIN-20120', width: 20, height: 120, style: 'Ahşap', finish: 'Mat', color: 'Doğal Meşe', brand: { id: 'gural', name: 'Güral Seramik' }, imageUrl: '/textures/natural_oak.jpg', textureUrl: '/textures/natural_oak.jpg' },
  { id: 'kal-1', name: 'Kalebodur Calacatta Gold Porselen', code: 'KAL-CAL-60120', width: 60, height: 120, style: 'Mermer', finish: 'Parlak Rektifiye', color: 'Beyaz / Altın', brand: { id: 'kalebodur', name: 'Kalebodur' }, imageUrl: '/textures/calacatta_gold.jpg', textureUrl: '/textures/calacatta_gold.jpg' },
  { id: 'kal-2', name: 'Kalebodur Nero Marquina Siyah', code: 'KAL-NERO-60120', width: 60, height: 120, style: 'Mermer', finish: 'Lüks Parlak', color: 'Siyah', brand: { id: 'kalebodur', name: 'Kalebodur' }, imageUrl: '/textures/albatros_antrasit.jpg', textureUrl: '/textures/albatros_antrasit.jpg' },
  { id: 'vit-1', name: 'VitrA Marbleous Calacatta Porselen', code: 'VIT-CAL-60120', width: 60, height: 120, style: 'Mermer', finish: 'Mat Rektifiye', color: 'Beyaz / Gold', brand: { id: 'vitra', name: 'VitrA' }, imageUrl: '/textures/calacatta_gold.jpg', textureUrl: '/textures/calacatta_gold.jpg' },
  { id: 'vit-2', name: 'VitrA Cementmix Gri Beton Karo', code: 'VIT-CEM-6060', width: 60, height: 60, style: 'Beton', finish: 'Lapatto', color: 'Açık Gri', brand: { id: 'vitra', name: 'VitrA' }, imageUrl: '/textures/concrete_light_grey.jpg', textureUrl: '/textures/concrete_light_grey.jpg' },
  { id: 'bie-1', name: 'Bien Nordic Meşe Ahşap Karo', code: 'BIE-OAK-20120', width: 20, height: 120, style: 'Ahşap', finish: 'Mat Ahşap', color: 'Doğal Meşe', brand: { id: 'bien', name: 'Bien Seramik' }, imageUrl: '/textures/natural_oak.jpg', textureUrl: '/textures/natural_oak.jpg' }
];

const PANEL_BG_PRESETS = [
  { id: 'obsidian', label: 'Gece Mavisi', color: '#0b1120' },
  { id: 'oled', label: 'Derin Siyah', color: '#050505' },
  { id: 'graphite', label: 'Kömür Antrasit', color: '#18181b' },
  { id: 'stone', label: 'Sıcak Taş', color: '#1c1917' },
  { id: 'navy', label: 'Derin Lacivert', color: '#09152e' },
  { id: 'light', label: 'Açık Gri Stüdyo', color: '#f8fafc' },
  { id: 'white', label: 'Saf Beyaz', color: '#ffffff' }
];

export default function BrandConsumerStudioPage() {
  const [mounted, setMounted] = useState(false);
  const [brandInfo, setBrandInfo] = useState({
    id: '',
    name: 'Güral Seramik',
    slug: 'gural-seramik',
    logoUrl: '/logos/gural.png'
  });
  const [themeColor, setThemeColor] = useState('#d4af37');
  const [panelBg, setPanelBg] = useState('#0b1120');
  const [showBgPicker, setShowBgPicker] = useState(false);

  // Dynamic Contrast & Theme Helpers
  const isLight = React.useMemo(() => {
    if (!panelBg || typeof panelBg !== 'string') return false;
    let c = panelBg.replace('#', '');
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    if (c.length !== 6) return false;
    const num = parseInt(c, 16);
    if (isNaN(num)) return false;
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return (r * 299 + g * 587 + b * 114) / 1000 > 155;
  }, [panelBg]);

  const textColor = isLight ? '#0f172a' : '#f8fafc';
  const textMuted = isLight ? '#64748b' : '#94a3b8';
  const panelBorder = isLight ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.08)';
  const cardBg = isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.035)';
  const cardBorder = isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.07)';
  const cardShadow = isLight ? '0 2px 10px rgba(0, 0, 0, 0.06)' : 'none';
  const inputBg = isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.05)';
  const inputBorder = isLight ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.1)';

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
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // Filters & Left Sidebar State
  const [selectedStyle, setSelectedStyle] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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

  // URL Query Parameters Parsing & Real Catalog Fetching
  useEffect(() => {
    setMounted(true);
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    const queryBrand = urlParams.get('brand') || urlParams.get('brandSlug') || urlParams.get('brandId');
    const queryTheme = urlParams.get('theme') || urlParams.get('color') || urlParams.get('primary');
    const queryBg = urlParams.get('bg') || urlParams.get('panelBg');
    const queryScene = urlParams.get('scene') || urlParams.get('room');
    const queryProduct = urlParams.get('product') || urlParams.get('productId') || urlParams.get('code');

    if (queryTheme) {
      setThemeColor(queryTheme.startsWith('#') ? queryTheme : `#${queryTheme}`);
    }

    if (queryBg) {
      setPanelBg(queryBg.startsWith('#') ? queryBg : `#${queryBg}`);
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

    // Load Brand Metadata and ALL Products from DB (e.g. 320+ products for Güral)
    async function initBrandData() {
      setIsLoadingProducts(true);
      const targetBrandSlug = queryBrand || 'gural-seramik';

      try {
        // Parallel fetch for brand profile and products
        const [brandRes, prodRes] = await Promise.all([
          fetch('/api/brands').then(r => r.json()).catch(() => null),
          fetch(`/api/products?brandId=${encodeURIComponent(targetBrandSlug)}&limit=450`).then(r => r.json()).catch(() => null)
        ]);

        let matchedBrand = null;
        if (Array.isArray(brandRes)) {
          const normTarget = targetBrandSlug.toLowerCase().replace(/[-_\s]/g, '');
          matchedBrand = brandRes.find(b => {
            const normSlug = (b.slug || '').toLowerCase().replace(/[-_\s]/g, '');
            const normName = (b.name || '').toLowerCase().replace(/[-_\s]/g, '');
            const trClean = normName.replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ç/g, 'c').replace(/ğ/g, 'g');
            return (
              b.id === targetBrandSlug ||
              b.slug === targetBrandSlug ||
              normSlug === normTarget ||
              normSlug.startsWith(normTarget) ||
              normName.includes(normTarget) ||
              trClean.includes(normTarget) ||
              normTarget.includes(normSlug)
            );
          });

          if (matchedBrand) {
            setBrandInfo({
              id: matchedBrand.id,
              name: matchedBrand.name,
              slug: matchedBrand.slug || targetBrandSlug,
              logoUrl: matchedBrand.logoUrl || ''
            });
          }
        }

        let loadedProducts = [];

        // Check first API response
        if (prodRes && prodRes.products && prodRes.products.length > 0) {
          loadedProducts = prodRes.products;
        } else if (matchedBrand?.id) {
          // Retry with matched brand ID if slug query returned empty
          const retryRes = await fetch(`/api/products?brandId=${matchedBrand.id}&limit=450`).then(r => r.json()).catch(() => null);
          if (retryRes && retryRes.products && retryRes.products.length > 0) {
            loadedProducts = retryRes.products;
          }
        }

        if (loadedProducts.length > 0) {
          const sanitized = loadedProducts.map((p, idx) => {
            let tex = p.textureUrl || p.imageUrl;
            let img = p.imageUrl || tex;
            if (!tex || tex.includes('hero_ceramics') || tex.includes('luxury_bathroom')) {
              tex = DEFAULT_BRAND_CATALOG[idx % DEFAULT_BRAND_CATALOG.length].textureUrl;
            }
            if (!img) img = tex;
            return {
              ...p,
              imageUrl: img,
              textureUrl: tex
            };
          });

          setProducts(sanitized);

          // Find target or initial product
          let initial = sanitized[0];
          if (queryProduct) {
            const match = sanitized.find(p => 
              String(p.id) === queryProduct || 
              p.code?.toLowerCase() === queryProduct.toLowerCase() ||
              p.name?.toLowerCase().includes(queryProduct.toLowerCase())
            );
            if (match) initial = match;
          }

          setSelectedProduct(initial);
          setFloorProduct(initial);
          setWallProduct(initial);
          setIsLoadingProducts(false);
          return;
        }
      } catch (e) {
        console.warn('Brand metadata & products fetch error:', e);
      }

      // Fallback matching in local catalog if API returns nothing
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
      }
      setIsLoadingProducts(false);
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
      userSelect: 'none',
      display: 'flex',
      flexDirection: 'row'
    }}>

      {/* -------------------- 1. LEFT SIDEBAR: ALL BRAND CERAMIC PRODUCTS -------------------- */}
      <aside style={{
        width: isSidebarOpen ? '420px' : '0px',
        minWidth: isSidebarOpen ? '390px' : '0px',
        maxWidth: '440px',
        height: '100%',
        background: panelBg,
        borderRight: isSidebarOpen ? `1px solid ${panelBorder}` : 'none',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 60,
        position: 'relative',
        transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1), background 0.25s ease',
        overflow: 'hidden',
        boxShadow: isSidebarOpen ? (isLight ? '10px 0 35px rgba(0, 0, 0, 0.08)' : '10px 0 35px rgba(0, 0, 0, 0.45)') : 'none',
        flexShrink: 0
      }}>
        {/* Sidebar Header */}
        <div style={{
          padding: '14px 16px',
          borderBottom: `1px solid ${panelBorder}`,
          background: isLight ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.02)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: `${themeColor}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: themeColor }}>
              <Grid size={15} />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: '800', color: textColor }}>
                Koleksiyon Kataloğu
              </div>
              <div style={{ fontSize: '0.66rem', color: themeColor, fontWeight: '700' }}>
                {brandInfo.name} ({filteredProducts.length} Model)
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* Panel Background Color Switcher Trigger */}
            <button
              onClick={() => setShowBgPicker(!showBgPicker)}
              style={{
                background: showBgPicker ? `${themeColor}25` : (isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.06)'),
                border: `1px solid ${showBgPicker ? themeColor : panelBorder}`,
                borderRadius: '8px',
                color: showBgPicker ? themeColor : textMuted,
                height: '28px',
                padding: '0 8px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer',
                fontSize: '0.68rem',
                fontWeight: '700',
                transition: 'all 0.15s ease'
              }}
              title="Panel Arka Plan Rengini Değiştir"
            >
              <Palette size={13} />
              <span>Tema</span>
            </button>

            <button
              onClick={() => setIsSidebarOpen(false)}
              style={{
                background: isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.06)',
                border: `1px solid ${panelBorder}`,
                borderRadius: '8px',
                color: textMuted,
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title="Koleksiyon Panelini Gizle"
            >
              <ChevronLeft size={16} />
            </button>
          </div>
        </div>

        {/* Panel Background Color Palette Bar */}
        {showBgPicker && (
          <div style={{
            padding: '10px 16px',
            background: isLight ? 'rgba(0, 0, 0, 0.03)' : 'rgba(255, 255, 255, 0.03)',
            borderBottom: `1px solid ${panelBorder}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            flexShrink: 0
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.66rem', fontWeight: '800', color: textMuted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Panel Arka Plan Rengi
              </span>
              <span style={{ fontSize: '0.68rem', fontFamily: 'monospace', color: themeColor, fontWeight: '800' }}>
                {panelBg}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {PANEL_BG_PRESETS.map((p) => {
                const isCurrent = panelBg.toLowerCase() === p.color.toLowerCase();
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPanelBg(p.color)}
                    title={p.label}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: p.color,
                      border: isCurrent ? `2px solid ${themeColor}` : (isLight ? '1px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.2)'),
                      boxShadow: isCurrent ? `0 0 0 2px ${themeColor}50` : 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 0,
                      transform: isCurrent ? 'scale(1.15)' : 'scale(1)',
                      transition: 'transform 0.15s ease'
                    }}
                  >
                    {isCurrent && <Check size={11} color={p.id === 'light' || p.id === 'white' ? '#0f172a' : '#ffffff'} strokeWidth={3} />}
                  </button>
                );
              })}

              <label style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '2px 8px',
                borderRadius: '6px',
                background: isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.06)',
                border: `1px solid ${panelBorder}`,
                fontSize: '0.66rem',
                fontWeight: '700',
                color: textColor,
                cursor: 'pointer'
              }}>
                <span>Özel:</span>
                <input
                  type="color"
                  value={panelBg.startsWith('#') ? panelBg : '#0b1120'}
                  onChange={(e) => setPanelBg(e.target.value)}
                  style={{
                    width: '20px',
                    height: '20px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    padding: 0,
                    background: 'transparent'
                  }}
                />
              </label>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div style={{ padding: '12px 16px 8px 16px', flexShrink: 0 }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={13} color={textMuted} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder={`${brandInfo.name} modellerinde ara...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                height: '36px',
                background: inputBg,
                border: `1px solid ${inputBorder}`,
                borderRadius: '10px',
                padding: '0 30px 0 32px',
                color: textColor,
                fontSize: '0.76rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: textMuted, cursor: 'pointer', padding: '2px' }}
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Style Category Filter Pills */}
        <div style={{
          padding: '4px 16px 10px 16px',
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
          flexShrink: 0,
          scrollbarWidth: 'none'
        }}>
          {[
            { id: 'all', label: 'Tümü' },
            { id: 'mermer', label: 'Mermer' },
            { id: 'ahsap', label: 'Ahşap' },
            { id: 'beton', label: 'Beton' },
            { id: 'tas', label: 'Taş' }
          ].map(s => {
            const isSelected = selectedStyle === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setSelectedStyle(s.id)}
                style={{
                  padding: '5px 11px',
                  borderRadius: '8px',
                  border: isSelected ? `1px solid ${themeColor}` : `1px solid ${panelBorder}`,
                  background: isSelected ? `${themeColor}22` : (isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.04)'),
                  color: isSelected ? (isLight ? '#0f172a' : '#ffffff') : textMuted,
                  fontSize: '0.7rem',
                  fontWeight: isSelected ? '800' : '600',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s'
                }}
              >
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Target Surface Selector (Zemin / Duvar / Tüm Mekan) */}
        <div style={{
          padding: '0 16px 10px 16px',
          flexShrink: 0
        }}>
          <div style={{
            background: isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.04)',
            borderRadius: '10px',
            padding: '3px',
            display: 'flex',
            gap: '3px',
            border: `1px solid ${panelBorder}`
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
                  flex: 1,
                  padding: '5px 0',
                  borderRadius: '7px',
                  border: 'none',
                  fontSize: '0.7rem',
                  fontWeight: activeTargetSurface === t.id ? '800' : '600',
                  background: activeTargetSurface === t.id ? themeColor : 'transparent',
                  color: activeTargetSurface === t.id ? '#0b0f19' : textMuted,
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.15s'
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable 2-Column Product Grid */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '6px 12px 24px 12px',
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: '10px',
          alignContent: 'start',
          scrollbarWidth: 'thin'
        }}>
          {isLoadingProducts ? (
            <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '40px 0', color: textMuted, fontSize: '0.8rem' }}>
              <div style={{
                width: '28px',
                height: '28px',
                border: '2px solid rgba(212,175,55,0.2)',
                borderTopColor: themeColor,
                borderRadius: '50%',
                animation: 'sb-spin 0.8s linear infinite',
                margin: '0 auto 10px auto'
              }} />
              <span>{brandInfo.name} seramik koleksiyonu yükleniyor...</span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '40px 0', color: textMuted, fontSize: '0.78rem' }}>
              Aramanıza uygun seramik bulunamadı.
            </div>
          ) : (
            filteredProducts.map(tile => {
              const isSelected = selectedProduct?.id === tile.id;
              return (
                <div
                  key={tile.id}
                  onClick={() => handleApplyTile(tile)}
                  style={{
                    background: isSelected 
                      ? (isLight ? `${themeColor}18` : 'rgba(255, 255, 255, 0.08)') 
                      : cardBg,
                    border: isSelected ? `2px solid ${themeColor}` : `1px solid ${cardBorder}`,
                    borderRadius: '12px',
                    padding: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    boxSizing: 'border-box',
                    boxShadow: cardShadow,
                    minWidth: 0,
                    overflow: 'hidden',
                    transition: 'all 0.18s ease'
                  }}
                >
                  {/* Tile Image Swatch */}
                  <div style={{
                    width: '100%',
                    height: '92px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    background: isLight ? '#e2e8f0' : '#1e293b',
                    position: 'relative',
                    flexShrink: 0
                  }}>
                    <img 
                      src={tile.textureUrl || tile.imageUrl} 
                      alt={tile.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      loading="lazy"
                    />
                    <span style={{
                      position: 'absolute',
                      top: '5px',
                      left: '5px',
                      fontSize: '0.58rem',
                      fontWeight: '800',
                      padding: '2px 5px',
                      borderRadius: '4px',
                      background: 'rgba(15, 23, 42, 0.85)',
                      color: '#cbd5e1'
                    }}>
                      {tile.width || 60}x{tile.height || 120}
                    </span>
                    {isSelected && (
                      <span style={{
                        position: 'absolute',
                        top: '5px',
                        right: '5px',
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

                  {/* Tile Name & Finish */}
                  <div style={{ minWidth: 0 }}>
                    <div style={{
                      fontSize: '0.72rem',
                      fontWeight: '700',
                      color: textColor,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      lineHeight: '1.2'
                    }} title={tile.name}>
                      {tile.name}
                    </div>
                    <div style={{ 
                      fontSize: '0.62rem', 
                      color: textMuted, 
                      marginTop: '2px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {tile.finish || 'Porselen'}
                    </div>
                  </div>

                  {/* Quick Surface Assignment Buttons */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '4px', marginTop: '2px' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApplyTile(tile, 'floor');
                      }}
                      style={{
                        padding: '4px 0',
                        borderRadius: '6px',
                        border: 'none',
                        background: isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.08)',
                        color: isLight ? '#334155' : '#cbd5e1',
                        fontSize: '0.64rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        textAlign: 'center',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        minWidth: 0
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
                        padding: '4px 0',
                        borderRadius: '6px',
                        border: 'none',
                        background: isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.08)',
                        color: isLight ? '#334155' : '#cbd5e1',
                        fontSize: '0.64rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        textAlign: 'center',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        minWidth: 0
                      }}
                    >
                      Duvar
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* -------------------- 2. MAIN 3D VIEWPORT (HUGE UNBLOCKED CANVAS) -------------------- */}
      <main style={{
        flex: 1,
        height: '100%',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Floating Top Brand Header */}
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
          padding: '0 16px',
          boxSizing: 'border-box'
        }}>
          {/* Left: Re-open Sidebar Button + Brand Identity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '10px',
                  color: '#f8fafc',
                  padding: '6px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                <Grid size={13} color={themeColor} />
                <span>Koleksiyonu Aç</span>
              </button>
            )}

            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '9px',
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
                <Sparkles size={16} color="#ffffff" />
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: '800', color: '#f8fafc', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
                {brandInfo.name}
              </span>
              <span style={{ fontSize: '0.64rem', color: themeColor, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                3D Mekan Tasarımı
              </span>
            </div>
          </div>

          {/* Center: Room Scene Switcher */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '3px',
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
                    gap: '5px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '0.76rem',
                    fontWeight: isSelected ? '800' : '600',
                    color: isSelected ? '#0b0f19' : '#94a3b8',
                    background: isSelected ? themeColor : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>{r.icon}</span>
                  <span className="btn-label-desktop">{r.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right: Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleDownloadSnapshot}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '7px 12px',
                borderRadius: '9px',
                background: 'rgba(255, 255, 255, 0.07)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#f8fafc',
                fontSize: '0.76rem',
                fontWeight: '700',
                cursor: 'pointer'
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
                gap: '5px',
                padding: '7px 12px',
                borderRadius: '9px',
                background: 'rgba(255, 255, 255, 0.07)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#f8fafc',
                fontSize: '0.76rem',
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
                gap: '5px',
                padding: '7px 14px',
                borderRadius: '9px',
                background: `linear-gradient(135deg, ${themeColor} 0%, #b89628 100%)`,
                border: 'none',
                color: '#0b0f19',
                fontSize: '0.76rem',
                fontWeight: '800',
                cursor: 'pointer',
                boxShadow: `0 2px 10px ${themeColor}30`
              }}
              title="Seçtiğin seramik için ücretsiz numune veya fiyat teklifi iste"
            >
              <MessageCircle size={14} />
              <span>Numune İste</span>
            </button>

            <button
              onClick={toggleFullscreen}
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '9px',
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
              {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
          </div>
        </header>

        {/* 3D Canvas Container */}
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

        {/* Floating Quick Lighting & Pattern Pill (Top Right) */}
        <div style={{
          position: 'absolute',
          top: '84px',
          right: '16px',
          zIndex: 40,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {/* Day / Sunset / Night Lighting Controls */}
          <div style={{
            background: 'rgba(11, 15, 25, 0.85)',
            backdropFilter: 'blur(16px)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '3px',
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
                    fontSize: '0.7rem',
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

          {/* Lay Pattern Selector (Düz / Çapraz / Balıksırtı) */}
          <div style={{
            background: 'rgba(11, 15, 25, 0.85)',
            backdropFilter: 'blur(16px)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '3px',
            display: 'flex',
            gap: '3px'
          }}>
            {[
              { id: 'flat', label: 'Düz' },
              { id: 'diagonal', label: 'Çapraz' },
              { id: 'herringbone', label: 'Balıksırtı' }
            ].map(p => (
              <button
                key={p.id}
                onClick={() => setLayPattern(p.id)}
                style={{
                  padding: '4px 8px',
                  borderRadius: '7px',
                  border: 'none',
                  fontSize: '0.68rem',
                  fontWeight: layPattern === p.id ? '800' : '600',
                  background: layPattern === p.id ? themeColor : 'transparent',
                  color: layPattern === p.id ? '#0b0f19' : '#94a3b8',
                  cursor: 'pointer'
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Floating Applied Tile Status Badge (Bottom Right) */}
        <div style={{
          position: 'absolute',
          bottom: '16px',
          right: '16px',
          zIndex: 40,
          background: 'rgba(11, 15, 25, 0.88)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '8px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.62rem', color: '#94a3b8', fontWeight: '600' }}>Aktif Zemin Karosu</span>
            <span style={{ fontSize: '0.74rem', fontWeight: '800', color: '#f8fafc' }}>
              {floorProduct?.name?.length > 22 ? floorProduct.name.slice(0, 22) + '...' : floorProduct?.name}
            </span>
          </div>

          <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)' }} />

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.62rem', color: '#94a3b8', fontWeight: '600' }}>Aktif Duvar Karosu</span>
            <span style={{ fontSize: '0.74rem', fontWeight: '800', color: themeColor }}>
              {wallProduct?.name?.length > 22 ? wallProduct.name.slice(0, 22) + '...' : wallProduct?.name}
            </span>
          </div>
        </div>
      </main>

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
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
        }}>
          {toastMessage}
        </div>
      )}

      {/* -------------------- 3. DEALERS MODAL (EN YAKIN BAYİLER) -------------------- */}
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

      {/* -------------------- 4. SAMPLE & INQUIRY MODAL (NUMUNE TALEBİ) -------------------- */}
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

      {/* Global Responsive CSS */}
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
