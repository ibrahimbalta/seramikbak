'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { slugify } from '@/lib/slugify';
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
  Palette,
  ArrowLeft
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

const NeuralRenovationModal = dynamic(() => import('@/components/NeuralRenovationModal'), { ssr: false });

// Neutral high-resolution tile textures for 3D PBR rendering
const NEUTRAL_TEXTURES = [
  '/textures/calacatta_gold.jpg',
  '/textures/natural_oak.jpg',
  '/textures/concrete_light_grey.jpg',
  '/textures/albatros_antrasit.jpg'
];

const BRAND_NAME_DICTIONARY = {
  'bien-seramik': 'Bien Seramik',
  'bien': 'Bien Seramik',
  'vitra': 'VitrA',
  'kalebodur': 'Kalebodur',
  'kale': 'Kalebodur',
  'ng-kutahya-seramik': 'NG Kütahya Seramik',
  'ng-kutahya': 'NG Kütahya Seramik',
  'kutahya': 'NG Kütahya Seramik',
  'canakkale-seramik': 'Çanakkale Seramik',
  'canakkale': 'Çanakkale Seramik',
  'gural-seramik': 'Güral Seramik',
  'gural': 'Güral Seramik',
  'ege-seramik': 'Ege Seramik',
  'ege': 'Ege Seramik',
  'seramiksan': 'Seramiksan',
  'yurtbay-seramik': 'Yurtbay Seramik',
  'yurtbay': 'Yurtbay Seramik',
  'duratiles': 'DuraTiles',
  'qua-granite': 'Qua Granite',
  'qua': 'Qua Granite',
  'seranit': 'Seranit',
  'graniser': 'Graniser',
  'hitit-seramik': 'Hitit Seramik',
  'hitit': 'Hitit Seramik',
  'usak-seramik': 'Uşak Seramik',
  'usak': 'Uşak Seramik',
  'termal-seramik': 'Termal Seramik',
  'termal': 'Termal Seramik',
  'decovita': 'Decovita'
};

function resolveBrandName(slug) {
  if (!slug) return 'Seramik';
  const clean = slug.toLowerCase().trim();
  if (BRAND_NAME_DICTIONARY[clean]) return BRAND_NAME_DICTIONARY[clean];
  return clean
    .split(/[-_]/)
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function generateBrandFallbacks(brand) {
  const bName = brand?.name || 'Seramik';
  const bId = brand?.id || brand?.slug || 'brand';
  const cleanPrefix = (brand?.slug || bName).replace(/[^a-zA-Z0-9]/g, '').slice(0, 3).toUpperCase() || 'SRM';
  return [
    { id: `${bId}-f1`, name: `${bName} Calacatta Gold Porselen`, code: `${cleanPrefix}-CAL-60120`, width: 60, height: 120, style: 'Mermer', finish: 'Parlak Rektifiye', color: 'Beyaz / Gold', brand: { id: bId, name: bName }, imageUrl: '/textures/calacatta_gold.jpg', textureUrl: '/textures/calacatta_gold.jpg' },
    { id: `${bId}-f2`, name: `${bName} Doğal Meşe Parke Porselen`, code: `${cleanPrefix}-OAK-20120`, width: 20, height: 120, style: 'Ahşap', finish: 'Mat Rektifiye', color: 'Doğal Meşe', brand: { id: bId, name: bName }, imageUrl: '/textures/natural_oak.jpg', textureUrl: '/textures/natural_oak.jpg' },
    { id: `${bId}-f3`, name: `${bName} Urban Beton Gri Zemin`, code: `${cleanPrefix}-BET-6060`, width: 60, height: 60, style: 'Beton', finish: 'Mat', color: 'Açık Gri', brand: { id: bId, name: bName }, imageUrl: '/textures/concrete_light_grey.jpg', textureUrl: '/textures/concrete_light_grey.jpg' },
    { id: `${bId}-f4`, name: `${bName} Nero Antrasit Lüks Mermer`, code: `${cleanPrefix}-NER-60120`, width: 60, height: 120, style: 'Mermer', finish: 'Full Lappato', color: 'Siyah / Antrasit', brand: { id: bId, name: bName }, imageUrl: '/textures/albatros_antrasit.jpg', textureUrl: '/textures/albatros_antrasit.jpg' }
  ];
}

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
  // Detect if accessed in White-Label Brand Mode via URL parameter (?brand=... or ?brandSlug=... or ?brandId=...)
  const [isBrandMode, setIsBrandMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      return !!(urlParams.get('brand') || urlParams.get('brandSlug') || urlParams.get('brandId'));
    }
    return false;
  });

  const [brandInfo, setBrandInfo] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const qBrand = urlParams.get('brand') || urlParams.get('brandSlug') || urlParams.get('brandId');
        if (qBrand) {
          return {
            id: '',
            name: resolveBrandName(qBrand),
            slug: qBrand,
            logoUrl: ''
          };
        }
      } catch {}
    }

    // Default: SeramikBak Public Studio for general consumers
    return {
      id: '',
      name: 'SeramikBak',
      slug: '',
      logoUrl: ''
    };
  });
  const [logoError, setLogoError] = useState(false);
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

  // Products & Surface Application (Initialized cleanly with active brand fallbacks)
  const initialFallbacks = React.useMemo(() => generateBrandFallbacks(brandInfo), []);
  const [products, setProducts] = useState(initialFallbacks);
  const [selectedProduct, setSelectedProduct] = useState(initialFallbacks[0]);
  const [floorProduct, setFloorProduct] = useState(initialFallbacks[0]);
  const [wallProduct, setWallProduct] = useState(initialFallbacks[0]);
  const [stripeWallProduct, setStripeWallProduct] = useState(null);
  const [activeTargetSurface, setActiveTargetSurface] = useState('both'); // 'floor' | 'walls' | 'both'
  const [applyFloor, setApplyFloor] = useState(true);
  const [applyWalls, setApplyWalls] = useState(true);
  const [applyStripeWall, setApplyStripeWall] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // Filters & Left Sidebar State
  const [selectedStyle, setSelectedStyle] = useState('all');
  const [availableBrands, setAvailableBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(16);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileTab, setMobileTab] = useState('split'); // 'split' | '3d' | 'catalog'

  // Modals & Feedback
  const [showNeuralRenovation, setShowNeuralRenovation] = useState(false);
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

    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

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

    // Load Brand Metadata and Products (Public vs White-Label Mode)
    async function initBrandData() {
      setIsLoadingProducts(true);

      // ONLY activate White-Label Brand Mode if URL query explicitly provides brand/brandSlug/brandId!
      const targetBrandSlug = queryBrand;

      if (targetBrandSlug) {
        // =========================================================================
        // 1. WHITE-LABEL BRAND MODE (Only accessed via brand portal or embed snippet)
        // =========================================================================
        setIsBrandMode(true);
        try {
          const [brandRes, prodRes] = await Promise.all([
            fetch('/api/brands').then(r => r.json()).catch(() => null),
            fetch(`/api/products?brandId=${encodeURIComponent(targetBrandSlug)}&limit=500`).then(r => r.json()).catch(() => null)
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
          }

          if (!matchedBrand) {
            matchedBrand = {
              id: targetBrandSlug,
              name: resolveBrandName(targetBrandSlug),
              slug: targetBrandSlug,
              logoUrl: ''
            };
          }

          setBrandInfo({
            id: matchedBrand.id,
            name: matchedBrand.name,
            slug: matchedBrand.slug || targetBrandSlug,
            logoUrl: matchedBrand.logoUrl || ''
          });
          setLogoError(false);

          if (typeof document !== 'undefined') {
            document.title = `${matchedBrand.name} - 3D Mimari Mekan & Tasarım Stüdyosu | SeramikBak`;
          }

          let loadedProducts = [];

          if (prodRes && prodRes.products && prodRes.products.length > 0) {
            loadedProducts = prodRes.products;
          } else if (matchedBrand?.id && matchedBrand.id !== targetBrandSlug) {
            const retryRes = await fetch(`/api/products?brandId=${encodeURIComponent(matchedBrand.id)}&limit=500`).then(r => r.json()).catch(() => null);
            if (retryRes && retryRes.products && retryRes.products.length > 0) {
              loadedProducts = retryRes.products;
            }
          }

          // Strict brand isolation: reject any product belonging to another brand
          const strictlyBrandProducts = loadedProducts.filter(p => {
            if (p.brandId && matchedBrand.id && p.brandId === matchedBrand.id) return true;
            if (p.brand?.id && matchedBrand.id && p.brand.id === matchedBrand.id) return true;
            if (p.brand?.name && matchedBrand.name && p.brand.name.toLowerCase() === matchedBrand.name.toLowerCase()) return true;
            return false;
          });

          const activeCatalog = strictlyBrandProducts.length > 0
            ? strictlyBrandProducts
            : (loadedProducts.length > 0 ? loadedProducts : generateBrandFallbacks(matchedBrand));

          const sanitized = activeCatalog.map((p, idx) => {
            let tex = p.textureUrl || p.imageUrl;
            let img = p.imageUrl || tex;
            if (!tex || tex.includes('hero_ceramics') || tex.includes('luxury_bathroom')) {
              tex = NEUTRAL_TEXTURES[idx % NEUTRAL_TEXTURES.length];
            }
            if (!img) img = tex;
            return {
              ...p,
              imageUrl: img,
              textureUrl: tex,
              brand: p.brand || { id: matchedBrand.id, name: matchedBrand.name }
            };
          });

          setProducts(sanitized);

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
        } catch (e) {
          console.warn('Brand metadata & products fetch error:', e);
          const fallbackBrand = {
            id: targetBrandSlug,
            name: resolveBrandName(targetBrandSlug),
            slug: targetBrandSlug,
            logoUrl: ''
          };
          const localMatches = generateBrandFallbacks(fallbackBrand);
          setProducts(localMatches);
          setSelectedProduct(localMatches[0]);
          setFloorProduct(localMatches[0]);
          setWallProduct(localMatches[0]);
          setIsLoadingProducts(false);
          return;
        }
      }

      // =========================================================================
      // 2. PUBLIC CONSUMER MODE (Standard SeramikBak 3D Studio for normal users)
      // =========================================================================
      setIsBrandMode(false);
      setBrandInfo({
        id: '',
        name: 'SeramikBak',
        slug: '',
        logoUrl: ''
      });

      if (typeof document !== 'undefined') {
        document.title = '3D Mimari Mekan & Seramik Tasarım Stüdyosu | SeramikBak';
      }

      try {
        const [prodRes, brandsRes] = await Promise.all([
          fetch('/api/products?limit=500').then(r => r.json()).catch(() => null),
          fetch('/api/brands').then(r => r.json()).catch(() => null)
        ]);

        if (Array.isArray(brandsRes)) {
          setAvailableBrands(brandsRes);
        }

        let loadedProducts = [];
        if (prodRes && prodRes.products && prodRes.products.length > 0) {
          loadedProducts = prodRes.products;
        }

        const activeCatalog = loadedProducts.length > 0
          ? loadedProducts
          : generateBrandFallbacks({ name: 'SeramikBak', id: 'sb', slug: 'seramikbak' });

        const sanitized = activeCatalog.map((p, idx) => {
          let tex = p.textureUrl || p.imageUrl;
          let img = p.imageUrl || tex;
          if (!tex || tex.includes('hero_ceramics') || tex.includes('luxury_bathroom')) {
            tex = NEUTRAL_TEXTURES[idx % NEUTRAL_TEXTURES.length];
          }
          if (!img) img = tex;
          return {
            ...p,
            imageUrl: img,
            textureUrl: tex,
            brand: p.brand || { id: 'sb', name: 'SeramikBak' }
          };
        });

        setProducts(sanitized);

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
      } catch (err) {
        console.warn('Public studio initialization error:', err);
        const fallbacks = generateBrandFallbacks({ name: 'SeramikBak', id: 'sb', slug: 'seramikbak' });
        setProducts(fallbacks);
        setSelectedProduct(fallbacks[0]);
        setFloorProduct(fallbacks[0]);
        setWallProduct(fallbacks[0]);
        setIsLoadingProducts(false);
      }
    }

    initBrandData();

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Fetch Dealers when modal opens
  const handleOpenDealersModal = async () => {
    setShowDealersModal(true);
    setLoadingDealers(true);
    try {
      const brandIdParam = isBrandMode && brandInfo?.id ? `?brandId=${brandInfo.id}` : '';
      const res = await fetch(`/api/dealers${brandIdParam}`).then(r => r.json()).catch(() => null);
      if (Array.isArray(res) && res.length > 0) {
        setDealers(res);
      } else {
        setDealers([
          { id: 'd1', name: isBrandMode ? `${brandInfo.name} Merkez Showroom` : 'SeramikBak Merkez Showroom', city: 'İstanbul', district: 'Kadıköy', phone: '0216 444 00 00', address: 'Bağdat Caddesi No: 120' },
          { id: 'd2', name: isBrandMode ? `${brandInfo.name} Konsept Mağaza` : 'SeramikBak Konsept Showroom', city: 'Ankara', district: 'Çankaya', phone: '0312 444 00 00', address: 'Turan Güneş Bulvarı No: 45' },
          { id: 'd3', name: isBrandMode ? `${brandInfo.name} Ege Bölge Bayi` : 'SeramikBak Ege Bölge Showroom', city: 'İzmir', district: 'Alsancak', phone: '0232 444 00 00', address: 'Şair Eşref Bulvarı No: 18' }
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
    let brandMatch = true;
    if (!isBrandMode && selectedBrand !== 'all') {
      const pbName = (p.brand?.name || '').toLowerCase();
      const sel = selectedBrand.toLowerCase();
      brandMatch = pbName.includes(sel) || sel.includes(pbName) || (p.brandId === selectedBrand);
    }
    let styleMatch = true;
    if (selectedStyle !== 'all') {
      const s = (p.style || '').toLowerCase();
      const n = (p.name || '').toLowerCase();
      styleMatch = s.includes(selectedStyle) || n.includes(selectedStyle);
    }
    let searchMatch = true;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const bn = (p.brand?.name || '').toLowerCase();
      searchMatch = (p.name || '').toLowerCase().includes(q) || 
                    (p.code || '').toLowerCase().includes(q) ||
                    bn.includes(q);
    }
    return brandMatch && styleMatch && searchMatch;
  });

  // Reset pagination on filter or search change
  useEffect(() => {
    setVisibleCount(16);
  }, [searchTerm, selectedStyle, selectedBrand]);

  // Lazy progressive slice (loads 16 initially, more as user scrolls)
  const displayedProducts = filteredProducts.slice(0, visibleCount);

  // Smooth scroll handler to auto-load next batch before reaching the bottom
  const handleGridScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 280) {
      if (visibleCount < filteredProducts.length) {
        setVisibleCount(prev => Math.min(prev + 12, filteredProducts.length));
      }
    }
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      maxHeight: '100dvh',
      overflow: 'hidden',
      position: 'relative',
      background: panelBg,
      color: textColor,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      userSelect: 'none',
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      transition: 'background 0.3s ease, color 0.2s ease'
    }}>

      {/* -------------------- 1. LEFT SIDEBAR: ALL BRAND CERAMIC PRODUCTS -------------------- */}
      <aside style={{
        width: isMobile ? '100%' : (isSidebarOpen ? '420px' : '0px'),
        minWidth: isMobile ? '100%' : (isSidebarOpen ? '390px' : '0px'),
        maxWidth: isMobile ? '100%' : '440px',
        height: isMobile ? (mobileTab === '3d' ? '0px' : (mobileTab === 'catalog' ? '100%' : '58vh')) : '100%',
        background: panelBg,
        borderRight: !isMobile && isSidebarOpen ? `1px solid ${panelBorder}` : 'none',
        borderTop: isMobile && mobileTab === 'split' ? `1px solid ${panelBorder}` : 'none',
        display: isMobile && mobileTab === '3d' ? 'none' : 'flex',
        flexDirection: 'column',
        zIndex: isMobile ? 30 : 60,
        position: 'relative',
        transition: isMobile ? 'none' : 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1), background 0.25s ease',
        overflow: 'hidden',
        boxShadow: !isMobile && isSidebarOpen ? (isLight ? '10px 0 35px rgba(0, 0, 0, 0.08)' : '10px 0 35px rgba(0, 0, 0, 0.45)') : 'none',
        flexShrink: isMobile ? 1 : 0,
        flex: isMobile && mobileTab !== '3d' ? '1 1 0%' : 'none',
        order: isMobile ? 2 : 1
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
                {isBrandMode ? brandInfo.name : (selectedBrand === 'all' ? 'Tüm Markalar' : selectedBrand)} ({filteredProducts.length} Model)
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
              title="Tüm Stüdyo & Panel Temasını Değiştir"
            >
              <Palette size={13} />
              <span>Tema</span>
            </button>

            {isMobile ? (
              <button
                onClick={() => setMobileTab('3d')}
                style={{
                  background: `${themeColor}20`,
                  border: `1px solid ${themeColor}40`,
                  borderRadius: '8px',
                  color: themeColor,
                  height: '28px',
                  padding: '0 8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  fontSize: '0.68rem',
                  fontWeight: '800'
                }}
                title="3D Mekanı Büyüt"
              >
                <Maximize2 size={12} />
                <span>3D Büyüt</span>
              </button>
            ) : (
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
            )}
          </div>
        </div>

        {/* Studio & Panel Background Color Palette Bar */}
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
                Genel Stüdyo & Panel Teması
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

        {/* Prominent Neural AI Room Scanner CTA in Sidebar */}
        <div style={{ padding: '12px 16px 4px 16px', flexShrink: 0 }}>
          <button
            onClick={() => setShowNeuralRenovation(true)}
            style={{
              width: '100%',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #d4af37 0%, #aa8c2c 100%)',
              border: 'none',
              color: '#0b0f19',
              fontSize: '0.82rem',
              fontWeight: '800',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(212, 175, 55, 0.35)',
              transition: 'transform 0.15s ease'
            }}
          >
            <Sparkles size={16} />
            <span>✨ Kendi Odamda Gör (AI)</span>
            <span style={{ fontSize: '0.62rem', padding: '2px 6px', background: 'rgba(0,0,0,0.22)', color: '#ffffff', borderRadius: '6px', fontWeight: '900' }}>YENİ</span>
          </button>
        </div>

        {/* Search Bar */}
        <div style={{ padding: '10px 16px 8px 16px', flexShrink: 0 }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={13} color={textMuted} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder={isBrandMode ? `${brandInfo.name} modellerinde ara...` : 'Tüm seramik modellerinde ara...'}
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

        {/* Public Mode: Brand Selector Dropdown */}
        {!isBrandMode && availableBrands.length > 0 && (
          <div style={{ padding: '0 16px 8px 16px', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <span style={{ fontSize: '0.68rem', fontWeight: '700', color: textMuted, whiteSpace: 'nowrap' }}>
              Marka:
            </span>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              style={{
                flex: 1,
                height: '32px',
                background: inputBg,
                border: `1px solid ${inputBorder}`,
                borderRadius: '8px',
                color: textColor,
                fontSize: '0.74rem',
                fontWeight: '700',
                padding: '0 8px',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="all" style={{ background: panelBg, color: textColor }}>Tüm Üretici Markalar ({products.length} Ürün)</option>
              {availableBrands.map(b => (
                <option key={b.id} value={b.name} style={{ background: panelBg, color: textColor }}>
                  {b.name} {b._count?.products ? `(${b._count.products})` : ''}
                </option>
              ))}
            </select>
          </div>
        )}

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

        {/* Scrollable 2-Column Product Grid with Lazy Progressive Loading */}
        <div 
          onScroll={handleGridScroll}
          style={{
            flex: '1 1 0%',
            minHeight: 0,
            overflowY: 'auto',
            padding: '8px 14px 28px 14px',
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gridAutoRows: 'max-content',
            gap: '12px',
            alignContent: 'start',
            scrollbarWidth: 'thin'
          }}
        >
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
              <span>{isBrandMode ? brandInfo.name : 'SeramikBak'} seramik koleksiyonu yükleniyor...</span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '40px 0', color: textMuted, fontSize: '0.78rem' }}>
              Aramanıza uygun seramik bulunamadı.
            </div>
          ) : (
            displayedProducts.map(tile => {
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
                    borderRadius: '14px',
                    padding: '9px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    boxSizing: 'border-box',
                    boxShadow: cardShadow,
                    minWidth: 0,
                    minHeight: '215px',
                    height: 'auto',
                    flexShrink: 0,
                    transition: 'all 0.18s ease'
                  }}
                >
                  {/* Tile Image Swatch - High Quality, Prominent Texture View */}
                  <div style={{
                    width: '100%',
                    height: '115px',
                    minHeight: '115px',
                    maxHeight: '115px',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    background: isLight ? '#f1f5f9' : '#1e293b',
                    position: 'relative',
                    flexShrink: 0
                  }}>
                    <img 
                      src={tile.textureUrl || tile.imageUrl} 
                      alt={tile.name}
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover', 
                        display: 'block' 
                      }}
                      loading="lazy"
                    />
                    <span style={{
                      position: 'absolute',
                      top: '6px',
                      left: '6px',
                      fontSize: '0.6rem',
                      fontWeight: '800',
                      padding: '2px 6px',
                      borderRadius: '5px',
                      background: 'rgba(15, 23, 42, 0.88)',
                      backdropFilter: 'blur(4px)',
                      color: '#cbd5e1'
                    }}>
                      {tile.width || 60}x{tile.height || 120}
                    </span>
                    {isSelected && (
                      <span style={{
                        position: 'absolute',
                        top: '6px',
                        right: '6px',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: themeColor,
                        color: '#0b0f19',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                      }}>
                        <Check size={12} strokeWidth={3} />
                      </span>
                    )}
                  </div>

                  {/* Tile Name & Finish */}
                  <div style={{ minWidth: 0, marginTop: '2px' }}>
                    <div style={{
                      fontSize: '0.74rem',
                      fontWeight: '700',
                      color: textColor,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      lineHeight: '1.25'
                    }} title={tile.name}>
                      {tile.name}
                    </div>
                    {!isBrandMode && (tile.brand?.name || tile.brandName) && (
                      <div style={{
                        fontSize: '0.62rem',
                        fontWeight: '700',
                        color: themeColor,
                        marginTop: '1px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {tile.brand?.name || tile.brandName}
                      </div>
                    )}
                    <div style={{ 
                      fontSize: '0.62rem', 
                      color: textMuted, 
                      marginTop: '2px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {tile.finish || 'Porselen'} • {tile.color || 'Mat'}
                    </div>
                  </div>

                  {/* Quick Surface Assignment Buttons */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', 
                    gap: '4px', 
                    marginTop: 'auto',
                    paddingTop: '4px'
                  }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApplyTile(tile, 'floor');
                      }}
                      style={{
                        padding: '5px 0',
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
                        minWidth: 0,
                        transition: 'background 0.15s ease'
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
                        padding: '5px 0',
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
                        minWidth: 0,
                        transition: 'background 0.15s ease'
                      }}
                    >
                      Duvar
                    </button>
                  </div>
                </div>
              );
            })
          )}

          {/* Lazy Load More Sentinel & Button */}
          {visibleCount < filteredProducts.length && (
            <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '14px 0 8px 0' }}>
              <button
                onClick={() => setVisibleCount(prev => Math.min(prev + 16, filteredProducts.length))}
                style={{
                  background: isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.06)',
                  border: `1px solid ${panelBorder}`,
                  borderRadius: '10px',
                  color: textMuted,
                  padding: '9px 16px',
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  width: '100%',
                  transition: 'all 0.15s ease'
                }}
              >
                Daha Fazla Ürün Yükle (+{Math.min(16, filteredProducts.length - visibleCount)})
                <span style={{ display: 'block', fontSize: '0.64rem', opacity: 0.7, marginTop: '2px' }}>
                  ({filteredProducts.length} modelden {displayedProducts.length} tanesi gösteriliyor - kaydırarak da yüklenir)
                </span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* -------------------- 2. MAIN 3D VIEWPORT (HUGE UNBLOCKED CANVAS) -------------------- */}
      <main style={{
        flex: isMobile ? (mobileTab === '3d' ? 1 : 'none') : 1,
        width: isMobile ? '100%' : 'auto',
        height: isMobile ? (mobileTab === 'catalog' ? '0px' : (mobileTab === '3d' ? '100%' : '42vh')) : '100%',
        minHeight: isMobile ? (mobileTab === 'catalog' ? '0px' : (mobileTab === '3d' ? '100%' : '42vh')) : 'auto',
        maxHeight: isMobile ? (mobileTab === 'split' ? '42vh' : 'none') : 'none',
        position: 'relative',
        overflow: 'hidden',
        display: isMobile && mobileTab === 'catalog' ? 'none' : 'block',
        order: isMobile ? 1 : 2,
        flexShrink: 0
      }}>
        {/* Floating Top Brand Header */}
        <header style={{
          position: 'absolute',
          top: isMobile ? '8px' : '14px',
          left: isMobile ? '8px' : '16px',
          right: isMobile ? '8px' : '16px',
          zIndex: 50,
          height: isMobile ? '46px' : '52px',
          background: isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(11, 15, 25, 0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '14px',
          border: `1px solid ${panelBorder}`,
          boxShadow: isLight ? '0 10px 30px rgba(0, 0, 0, 0.08)' : '0 10px 30px rgba(0, 0, 0, 0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: isMobile ? '0 8px' : '0 12px',
          boxSizing: 'border-box',
          gap: '8px',
          transition: 'all 0.25s ease'
        }}>
          {/* Left: Re-open Sidebar Button / Mobile View Switcher + Brand Identity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '6px' : '10px', minWidth: 0, flexShrink: 0 }}>
            {!isBrandMode && (
              <a
                href="/"
                style={{
                  height: isMobile ? '30px' : '34px',
                  padding: isMobile ? '0 8px' : '0 10px',
                  borderRadius: '8px',
                  background: isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.07)',
                  border: `1px solid ${panelBorder}`,
                  color: textColor,
                  fontSize: isMobile ? '0.7rem' : '0.75rem',
                  fontWeight: '700',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
                title="SeramikBak Anasayfasına Dön"
              >
                <ArrowLeft size={13} />
                <span className="btn-label-desktop">Anasayfa</span>
              </a>
            )}

            {!isMobile && !isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                style={{
                  height: '36px',
                  background: isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.08)',
                  border: `1px solid ${panelBorder}`,
                  borderRadius: '10px',
                  color: textColor,
                  padding: '0 12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxSizing: 'border-box'
                }}
              >
                <Grid size={14} color={themeColor} />
                <span className="btn-label-desktop">Koleksiyon</span>
              </button>
            )}

            {isMobile && mobileTab === '3d' && (
              <button
                onClick={() => setMobileTab('split')}
                style={{
                  height: '32px',
                  background: `${themeColor}22`,
                  border: `1px solid ${themeColor}40`,
                  borderRadius: '8px',
                  color: themeColor,
                  padding: '0 8px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.7rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxSizing: 'border-box'
                }}
                title="Seramik Kataloğunu Aç"
              >
                <Grid size={13} />
                <span>Katalog</span>
              </button>
            )}

            <div style={{
              width: isMobile ? '30px' : '36px',
              height: isMobile ? '30px' : '36px',
              borderRadius: '9px',
              background: isBrandMode && brandInfo.logoUrl && !logoError ? '#ffffff' : `linear-gradient(135deg, ${themeColor} 0%, #b89628 100%)`,
              border: `1px solid ${panelBorder}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              overflow: 'hidden',
              flexShrink: 0,
              padding: isBrandMode && brandInfo.logoUrl && !logoError ? '2px' : 0,
              boxSizing: 'border-box'
            }}>
              {isBrandMode && brandInfo.logoUrl && !logoError ? (
                <img 
                  src={brandInfo.logoUrl} 
                  alt={brandInfo.name} 
                  onError={() => setLogoError(true)}
                  style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} 
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '7px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0b0f19',
                  fontWeight: '900',
                  fontSize: isMobile ? '0.78rem' : '0.88rem',
                  fontFamily: 'var(--font-title, sans-serif)'
                }}>
                  {isBrandMode ? (brandInfo.name ? brandInfo.name.charAt(0).toUpperCase() : 'B') : 'SB'}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
              <span style={{ 
                fontSize: isMobile ? '0.78rem' : '0.86rem', 
                fontWeight: '800', 
                color: textColor, 
                letterSpacing: '-0.01em', 
                lineHeight: 1.15,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {isBrandMode ? brandInfo.name : 'SeramikBak'}
              </span>
              <span className="brand-studio-title" style={{ 
                fontSize: '0.58rem', 
                color: themeColor, 
                fontWeight: '750', 
                textTransform: 'uppercase', 
                letterSpacing: '0.04em',
                lineHeight: 1.2
              }}>
                {isBrandMode ? '3D Mekan Stüdyosu' : '3D Tasarım Stüdyosu'}
              </span>
            </div>
          </div>

          {/* Center: Room Scene Switcher */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            background: isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.05)',
            padding: '3px',
            borderRadius: '10px',
            border: `1px solid ${panelBorder}`,
            height: isMobile ? '34px' : '38px',
            boxSizing: 'border-box',
            flexShrink: 0
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
                    height: '100%',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: isMobile ? '0 6px' : '0 10px',
                    borderRadius: '7px',
                    border: 'none',
                    fontSize: isMobile ? '0.72rem' : '0.76rem',
                    fontWeight: isSelected ? '800' : '600',
                    color: isSelected ? '#0b0f19' : textMuted,
                    background: isSelected ? themeColor : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    whiteSpace: 'nowrap',
                    boxShadow: isSelected ? `0 2px 8px ${themeColor}40` : 'none'
                  }}
                  title={r.label}
                >
                  <span style={{ fontSize: '0.85rem' }}>{r.icon}</span>
                  <span className="btn-label-desktop">{r.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right: Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '4px' : '6px', flexShrink: 0 }}>
            <button
              onClick={() => setShowNeuralRenovation(true)}
              style={{
                height: isMobile ? '34px' : '36px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: isMobile ? '0 9px' : '0 13px',
                borderRadius: '9px',
                background: 'linear-gradient(135deg, rgba(212,175,55,0.2) 0%, rgba(212,175,55,0.06) 100%)',
                border: '1px solid #d4af37',
                color: '#d4af37',
                fontSize: isMobile ? '0.72rem' : '0.76rem',
                fontWeight: '800',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxSizing: 'border-box',
                boxShadow: '0 2px 10px rgba(212,175,55,0.2)'
              }}
              title="Kendi odanın veya banyonun fotoğrafını yükle, seçtiğin seramiği gerçekçi giydir"
            >
              <Sparkles size={14} color="#d4af37" />
              <span>Odamda Gör (AI)</span>
            </button>

            <button
              onClick={handleDownloadSnapshot}
              style={{
                height: isMobile ? '34px' : '36px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: isMobile ? '0 8px' : '0 11px',
                borderRadius: '9px',
                background: isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.07)',
                border: `1px solid ${panelBorder}`,
                color: textColor,
                fontSize: '0.76rem',
                fontWeight: '700',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxSizing: 'border-box'
              }}
              title="Tasarladığın mekanı yüksek çözünürlüklü fotoğraf olarak kaydet"
            >
              <Camera size={14} color={themeColor} />
              <span className="btn-label-desktop">Fotoğraf</span>
            </button>

            {/* Mobile View Toggle Button (3D Full vs Split) */}
            {isMobile ? (
              <button
                onClick={() => setMobileTab(mobileTab === '3d' ? 'split' : '3d')}
                style={{
                  height: '34px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '0 8px',
                  borderRadius: '9px',
                  background: mobileTab === '3d' ? themeColor : (isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.08)'),
                  border: `1px solid ${panelBorder}`,
                  color: mobileTab === '3d' ? '#0b0f19' : textColor,
                  fontSize: '0.7rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxSizing: 'border-box'
                }}
                title={mobileTab === '3d' ? 'Bölünmüş Görünüme Dön' : '3D Tam Ekran'}
              >
                {mobileTab === '3d' ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                <span>{mobileTab === '3d' ? 'Böl' : '3D'}</span>
              </button>
            ) : (
              <>
                <button
                  onClick={handleOpenDealersModal}
                  style={{
                    height: '36px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '0 11px',
                    borderRadius: '9px',
                    background: isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.07)',
                    border: `1px solid ${panelBorder}`,
                    color: textColor,
                    fontSize: '0.76rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    boxSizing: 'border-box'
                  }}
                  title="Bu seramikleri yerinde görmek için yetkili bayileri bulun"
                >
                  <MapPin size={14} color="#38bdf8" />
                  <span className="btn-label-desktop">Bayiler</span>
                </button>

                <button
                  onClick={() => setShowSampleModal(true)}
                  style={{
                    height: '36px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '0 13px',
                    borderRadius: '9px',
                    background: `linear-gradient(135deg, ${themeColor} 0%, #b89628 100%)`,
                    border: 'none',
                    color: '#0b0f19',
                    fontSize: '0.76rem',
                    fontWeight: '800',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    boxShadow: `0 2px 10px ${themeColor}30`,
                    boxSizing: 'border-box'
                  }}
                  title="Seçtiğin seramik için ücretsiz numune veya fiyat teklifi iste"
                >
                  <MessageCircle size={14} />
                  <span>Numune</span>
                </button>

                <button
                  onClick={toggleFullscreen}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '9px',
                    background: isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.06)',
                    border: `1px solid ${panelBorder}`,
                    color: textMuted,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    flexShrink: 0,
                    boxSizing: 'border-box'
                  }}
                  title={isFullscreen ? 'Tam Ekrandan Çık' : 'Tam Ekran'}
                >
                  {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                </button>
              </>
            )}
          </div>
        </header>

        {/* 3D Canvas Container */}
        <div style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, background: panelBg }}>
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
              backgroundColor={panelBg}
              topOffset={isMobile ? 58 : 74}
              showSnapshot={false}
            />
          )}
        </div>

        {/* Floating Bottom Catalog Opener on Mobile Full 3D Mode */}
        {isMobile && mobileTab === '3d' && (
          <button
            onClick={() => setMobileTab('split')}
            style={{
              position: 'absolute',
              bottom: '22px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 60,
              background: `linear-gradient(135deg, ${themeColor} 0%, #aa8c2c 100%)`,
              color: '#0b0f19',
              border: 'none',
              borderRadius: '30px',
              padding: '11px 24px',
              fontWeight: '800',
              fontSize: '0.82rem',
              boxShadow: `0 8px 25px ${themeColor}60`,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            <Grid size={16} />
            <span>Koleksiyonu Aç ({filteredProducts.length} Model)</span>
          </button>
        )}

        {/* Floating Applied Tile Status Badge (Bottom Right) */}
        <div style={{
          position: 'absolute',
          bottom: isMobile ? '8px' : '16px',
          right: isMobile ? '8px' : '16px',
          zIndex: 40,
          background: isLight ? 'rgba(255, 255, 255, 0.94)' : 'rgba(11, 15, 25, 0.88)',
          backdropFilter: 'blur(16px)',
          border: `1px solid ${panelBorder}`,
          borderRadius: isMobile ? '8px' : '12px',
          padding: isMobile ? '4px 8px' : '8px 14px',
          display: isMobile && mobileTab === 'split' ? 'none' : 'flex',
          alignItems: 'center',
          gap: isMobile ? '6px' : '12px',
          boxShadow: isLight ? '0 8px 24px rgba(0, 0, 0, 0.08)' : '0 8px 24px rgba(0, 0, 0, 0.4)'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.62rem', color: textMuted, fontWeight: '600' }}>Aktif Zemin Karosu</span>
            <span style={{ fontSize: '0.74rem', fontWeight: '800', color: textColor }}>
              {floorProduct?.name?.length > 22 ? floorProduct.name.slice(0, 22) + '...' : floorProduct?.name}
            </span>
          </div>

          <div style={{ width: '1px', height: '24px', background: panelBorder }} />

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.62rem', color: textMuted, fontWeight: '600' }}>Aktif Duvar Karosu</span>
            <span style={{ fontSize: '0.74rem', fontWeight: '800', color: themeColor }}>
              {wallProduct?.name?.length > 22 ? wallProduct.name.slice(0, 22) + '...' : wallProduct?.name}
            </span>
          </div>

          <div style={{ width: '1px', height: '24px', background: panelBorder }} />

          <button
            onClick={() => setShowNeuralRenovation(true)}
            style={{
              height: '32px',
              padding: '0 12px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #d4af37 0%, #aa8c2c 100%)',
              border: 'none',
              color: '#0b0f19',
              fontSize: '0.74rem',
              fontWeight: '800',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 10px rgba(212, 175, 55, 0.35)'
            }}
            title="Seçili seramiği kendi odanın fotoğrafında gör"
          >
            <Sparkles size={13} />
            <span>Odamda Gör (AI)</span>
          </button>
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
                    {isBrandMode ? brandInfo.name : 'SeramikBak'} Yetkili Showroom & Bayileri
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
                      href={`https://wa.me/905321381061?text=${encodeURIComponent(`Merhaba, ${isBrandMode ? brandInfo.name : 'SeramikBak'} web sitesinden 3D mekanımda tasarladığım ${selectedProduct?.name} (${selectedProduct?.code}) modeli hakkında numune ve fiyat bilgisi almak istiyorum.`)}`}
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

      {/* -------------------- 5. NEURAL RENOVATION ENGINE (GERÇEK ODAYA GİYDİRME) -------------------- */}
      {showNeuralRenovation && (
        <NeuralRenovationModal
          isOpen={showNeuralRenovation}
          onClose={() => setShowNeuralRenovation(false)}
          activeTile={selectedProduct}
          onSelectAlternativeTile={(tile) => handleApplyTile(tile)}
          availableProducts={products}
        />
      )}

      {/* Global Responsive CSS */}
      <style>{`
        @media (max-width: 1080px) {
          .btn-label-desktop {
            display: none !important;
          }
          .brand-studio-title {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
