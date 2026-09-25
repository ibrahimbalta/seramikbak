'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { 
  Sparkles, 
  QrCode, 
  Layers, 
  Eye, 
  RotateCcw, 
  Building2, 
  CheckCircle2, 
  X, 
  ChevronRight, 
  Search,
  Maximize2,
  Minimize2,
  Smartphone,
  FileText,
  LogOut,
  Home,
  ArrowLeft,
  Sun,
  Moon,
  Compass,
  Palette,
  Grid,
  Filter,
  Maximize,
  Calculator,
  Wrench,
  Truck,
  Menu,
  Lock,
  Crown,
  ArrowRight,
  Check,
  Percent,
  RotateCw,
  Send,
  Share2,
  Sliders,
  Tv,
  TrendingDown,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import QuoteModal from '@/components/QuoteModal';

const StudioCanvas = dynamic(() => import('@/components/StudioCanvas'), { 
  ssr: false,
  loading: () => (
    <div className="kiosk-loading-box">
      <div className="kiosk-spin-loader" />
      <span>3D Sanal Stüdyo & Seramik Modelleri Yükleniyor...</span>
    </div>
  )
});

// Marka Bazlı Zengin Seramik Koleksiyon Kütüphanesi
const BRAND_CATALOG = [
  // Kalebodur / Çanakkale
  { id: 'kal-1', name: 'Kalebodur Calacatta Gold Porselen', code: 'KAL-CAL-60120', width: 60, height: 120, style: 'Mermer', finish: 'Parlak Rektifiye', color: 'Beyaz / Altın', brand: { id: 'kalebodur', name: 'Kalebodur' }, imageUrl: '/textures/calacatta_gold.jpg', textureUrl: '/textures/calacatta_gold.jpg', unitPrice: 540 },
  { id: 'kal-2', name: 'Kalebodur Nero Marquina Siyah', code: 'KAL-NERO-60120', width: 60, height: 120, style: 'Mermer', finish: 'Lüks Parlak', color: 'Siyah Damarlı', brand: { id: 'kalebodur', name: 'Kalebodur' }, imageUrl: '/textures/albatros_antrasit.jpg', textureUrl: '/textures/albatros_antrasit.jpg', unitPrice: 560 },
  { id: 'kal-3', name: 'Kalebodur Urban Gri Beton Karo', code: 'KAL-BET-6060', width: 60, height: 60, style: 'Beton', finish: 'Mat Endüstriyel', color: 'Gri', brand: { id: 'kalebodur', name: 'Kalebodur' }, imageUrl: '/textures/concrete_light_grey.jpg', textureUrl: '/textures/concrete_light_grey.jpg', unitPrice: 410 },

  // Graniser
  { id: 'gra-1', name: 'Graniser Calacatta Mermer Porselen', code: 'GRA-CAL-60120', width: 60, height: 120, style: 'Mermer', finish: 'Parlak Rektifiye', color: 'Beyaz / Altın', brand: { id: 'graniser', name: 'Graniser' }, imageUrl: '/textures/calacatta_gold.jpg', textureUrl: '/textures/calacatta_gold.jpg', unitPrice: 520 },
  { id: 'gra-2', name: 'Graniser Loft Gri Beton Karo', code: 'GRA-BET-6060', width: 60, height: 60, style: 'Beton', finish: 'Mat Endüstriyel', color: 'Gri', brand: { id: 'graniser', name: 'Graniser' }, imageUrl: '/textures/concrete_light_grey.jpg', textureUrl: '/textures/concrete_light_grey.jpg', unitPrice: 380 },
  { id: 'gra-3', name: 'Graniser Teak Ahşap Doku Karo', code: 'GRA-TEAK-20120', width: 20, height: 120, style: 'Ahşap', finish: 'Mat Derzli', color: 'Koyu Meşe', brand: { id: 'graniser', name: 'Graniser' }, imageUrl: '/textures/teak_ahsap.jpg', textureUrl: '/textures/teak_ahsap.jpg', unitPrice: 440 },
  { id: 'gra-4', name: 'Graniser Travertino Bej Taş Karo', code: 'GRA-TRAV-60120', width: 60, height: 120, style: 'Taş', finish: 'Rölyef Mat', color: 'Bej', brand: { id: 'graniser', name: 'Graniser' }, imageUrl: '/textures/travertino_classico.jpg', textureUrl: '/textures/travertino_classico.jpg', unitPrice: 490 },

  // VitrA
  { id: 'vit-1', name: 'VitrA Marbleous Calacatta Gold', code: 'VIT-CAL-60120', width: 60, height: 120, style: 'Mermer', finish: 'Mat Rektifiye', color: 'Beyaz / Altın', brand: { id: 'vitra', name: 'VitrA' }, imageUrl: '/textures/calacatta_gold.jpg', textureUrl: '/textures/calacatta_gold.jpg', unitPrice: 580 },
  { id: 'vit-2', name: 'VitrA Cementmix Gri Beton Porselen', code: 'VIT-CEM-6060', width: 60, height: 60, style: 'Beton', finish: 'Lapatto', color: 'Açık Gri', brand: { id: 'vitra', name: 'VitrA' }, imageUrl: '/textures/concrete_light_grey.jpg', textureUrl: '/textures/concrete_light_grey.jpg', unitPrice: 420 },
  { id: 'vit-3', name: 'VitrA Oakwood Meşe Ahşap Karo', code: 'VIT-OAK-20120', width: 20, height: 120, style: 'Ahşap', finish: 'Mat Ahşap', color: 'Doğal Meşe', brand: { id: 'vitra', name: 'VitrA' }, imageUrl: '/textures/natural_oak.jpg', textureUrl: '/textures/natural_oak.jpg', unitPrice: 480 },
  { id: 'vit-4', name: 'VitrA Vista Bej Doğal Taş', code: 'VIT-VIS-60120', width: 60, height: 120, style: 'Taş', finish: 'Mat Rektifiye', color: 'Vizon Bej', brand: { id: 'vitra', name: 'VitrA' }, imageUrl: '/textures/vista_bej.jpg', textureUrl: '/textures/vista_bej.jpg', unitPrice: 510 },

  // NG Kütahya Seramik
  { id: 'kut-1', name: 'NG Kütahya Nero Marquina Siyah', code: 'KUT-NERO-60120', width: 60, height: 120, style: 'Mermer', finish: 'Lüks Parlak', color: 'Siyah Damarlı', brand: { id: 'kutahya', name: 'NG Kütahya Seramik' }, imageUrl: '/textures/albatros_antrasit.jpg', textureUrl: '/textures/albatros_antrasit.jpg', unitPrice: 540 },
  { id: 'kut-2', name: 'NG Kütahya Vista Bej Porselen', code: 'KUT-VIS-60120', width: 60, height: 120, style: 'Taş', finish: 'Mat Rektifiye', color: 'Bej', brand: { id: 'kutahya', name: 'NG Kütahya Seramik' }, imageUrl: '/textures/vista_bej.jpg', textureUrl: '/textures/vista_bej.jpg', unitPrice: 470 },
  { id: 'kut-3', name: 'NG Kütahya Loft Antrasit Beton', code: 'KUT-BET-8080', width: 80, height: 80, style: 'Beton', finish: 'Mat Endüstriyel', color: 'Antrasit', brand: { id: 'kutahya', name: 'NG Kütahya Seramik' }, imageUrl: '/textures/loft_beton.jpg', textureUrl: '/textures/loft_beton.jpg', unitPrice: 450 },

  // Bien Seramik
  { id: 'bie-1', name: 'Bien Nordic Meşe Ahşap Porselen', code: 'BIE-OAK-20120', width: 20, height: 120, style: 'Ahşap', finish: 'Mat Ahşap', color: 'Doğal Meşe', brand: { id: 'bien', name: 'Bien Seramik' }, imageUrl: '/textures/natural_oak.jpg', textureUrl: '/textures/natural_oak.jpg', unitPrice: 430 },
  { id: 'bie-2', name: 'Bien Calacatta Venato Mermer', code: 'BIE-CAL-60120', width: 60, height: 120, style: 'Mermer', finish: 'Parlak Mega Slab', color: 'Beyaz Gri', brand: { id: 'bien', name: 'Bien Seramik' }, imageUrl: '/textures/calacatta_gold.jpg', textureUrl: '/textures/calacatta_gold.jpg', unitPrice: 530 },

  // Ege Seramik
  { id: 'ege-1', name: 'Ege Loft Antrasit Beton Porselen', code: 'EGE-LOFT-8080', width: 80, height: 80, style: 'Beton', finish: 'Lapatto', color: 'Koyu Antrasit', brand: { id: 'ege', name: 'Ege Seramik' }, imageUrl: '/textures/loft_beton.jpg', textureUrl: '/textures/loft_beton.jpg', unitPrice: 460 },

  // Yurtbay Seramik
  { id: 'yur-1', name: 'Yurtbay Teak Doğal Ahşap Karo', code: 'YUR-TEAK-20120', width: 20, height: 120, style: 'Ahşap', finish: 'Mat Derzli', color: 'Koyu Meşe', brand: { id: 'yurtbay', name: 'Yurtbay Seramik' }, imageUrl: '/textures/teak_ahsap.jpg', textureUrl: '/textures/teak_ahsap.jpg', unitPrice: 420 },

  // Seramiksan
  { id: 'ser-1', name: 'Seramiksan Vista Bej Taş Karo', code: 'SER-VIS-60120', width: 60, height: 120, style: 'Taş', finish: 'Rölyef Mat', color: 'Sıcak Bej', brand: { id: 'seramiksan', name: 'Seramiksan' }, imageUrl: '/textures/vista_bej.jpg', textureUrl: '/textures/vista_bej.jpg', unitPrice: 440 },

  // Qua Granite
  { id: 'qua-1', name: 'Qua Travertino Classico Granite', code: 'QUA-TRAV-60120', width: 60, height: 120, style: 'Mermer', finish: 'Parlak Mega Slab', color: 'Krem Traverten', brand: { id: 'qua', name: 'Qua Granite' }, imageUrl: '/textures/travertino_classico.jpg', textureUrl: '/textures/travertino_classico.jpg', unitPrice: 590 },

  // Güral Seramik
  { id: 'gur-1', name: 'Güral Seramik White Silver 60x120 Full Lappato', code: 'GUR-SILV-60120', width: 60, height: 120, style: 'Mermer', finish: 'Full Lappato', color: 'Beyaz / Gümüş', brand: { id: 'gural', name: 'Güral Seramik' }, imageUrl: '/textures/calacatta_gold.jpg', textureUrl: '/textures/calacatta_gold.jpg', unitPrice: 550 },
  { id: 'gur-2', name: 'Güral Seramik West Wood 20x120 Mat Teak', code: 'GUR-WOOD-20120', width: 20, height: 120, style: 'Ahşap', finish: 'Mat', color: 'Teak', brand: { id: 'gural', name: 'Güral Seramik' }, imageUrl: '/textures/teak_ahsap.jpg', textureUrl: '/textures/teak_ahsap.jpg', unitPrice: 460 },
  { id: 'gur-3', name: 'Güral Seramik West Wood 20x120 Mat Kayın', code: 'GUR-KAYIN-20120', width: 20, height: 120, style: 'Ahşap', finish: 'Mat', color: 'Kayın', brand: { id: 'gural', name: 'Güral Seramik' }, imageUrl: '/textures/natural_oak.jpg', textureUrl: '/textures/natural_oak.jpg', unitPrice: 460 }
];

// Bayiler İçin 1-Tıkla Hazır Mimari Showroom Konseptleri
const SHOWROOM_PRESETS = [
  {
    id: 'calacatta_gold',
    title: 'Lüks Calacatta & Gold',
    badge: 'Katalog Başyapıtı',
    desc: 'Altın damarlı Calacatta mermer, sıcak meşe dolap ve parlak altın batarya uyumu.',
    icon: '👑',
    accentColor: '#d4af37',
    apply: (catalog, applyTile) => {
      const calacatta = catalog.find(p => p.name?.toLowerCase().includes('calacatta')) || catalog[0];
      const nero = catalog.find(p => p.name?.toLowerCase().includes('nero') || p.name?.toLowerCase().includes('antrasit')) || catalog[1];
      applyTile('floor', nero);
      applyTile('walls', calacatta);
      applyTile('accent', calacatta);
      return {
        roomType: 'bathroom',
        faucetColor: 'gold',
        cabinetColor: 'oak',
        showerGlass: 'clear',
        groutColor: '#ffffff',
        layPattern: 'flat',
        tileRotation: 0,
        timeOfDay: 'day',
        lightTemp: 'warm',
        lightIntensity: 1.15
      };
    }
  },
  {
    id: 'modern_loft',
    title: 'Modern Loft & Antrasit',
    badge: 'Mimari Trend',
    desc: 'Mat antrasit beton porselen, lüks füme cam ve mat siyah armatür ile endüstriyel lüks.',
    icon: '🖤',
    accentColor: '#64748b',
    apply: (catalog, applyTile) => {
      const concrete = catalog.find(p => p.style?.toLowerCase().includes('beton') || p.name?.toLowerCase().includes('beton') || p.name?.toLowerCase().includes('loft')) || catalog[2];
      applyTile('floor', concrete);
      applyTile('walls', concrete);
      applyTile('shower', concrete);
      return {
        roomType: 'bathroom',
        faucetColor: 'black',
        cabinetColor: 'anthracite',
        showerGlass: 'smoke',
        groutColor: '#333333',
        layPattern: 'diagonal',
        tileRotation: 0,
        timeOfDay: 'day',
        lightTemp: 'cool',
        lightIntensity: 1.0
      };
    }
  },
  {
    id: 'nordic_warm',
    title: 'İskandinav Meşe & Taş',
    badge: 'Sıcak & Dingin',
    desc: 'Doğal meşe ahşap porselen zemin, traverten taş duvarlar ve lüks bronz cam zarafeti.',
    icon: '🌿',
    accentColor: '#10b981',
    apply: (catalog, applyTile) => {
      const wood = catalog.find(p => p.style?.toLowerCase().includes('ahşap') || p.name?.toLowerCase().includes('ahşap') || p.name?.toLowerCase().includes('oak') || p.name?.toLowerCase().includes('meşe')) || catalog[5];
      const stone = catalog.find(p => p.style?.toLowerCase().includes('taş') || p.name?.toLowerCase().includes('travertino') || p.name?.toLowerCase().includes('vista')) || catalog[6];
      applyTile('floor', wood);
      applyTile('walls', stone);
      return {
        roomType: 'bathroom',
        faucetColor: 'chrome',
        cabinetColor: 'white',
        showerGlass: 'bronze',
        groutColor: '#d8cbb8',
        layPattern: 'herringbone',
        tileRotation: 90,
        timeOfDay: 'sunset',
        lightTemp: 'warm',
        lightIntensity: 1.1
      };
    }
  },
  {
    id: 'crittall_grid',
    title: 'Black & White Grid',
    badge: 'Art Deco & Çıtalı',
    desc: 'Siyah çıtalı kafes duşakabin, mermer zemin-duvar kontrastı ve vizon ceviz dolap.',
    icon: '🏁',
    accentColor: '#38bdf8',
    apply: (catalog, applyTile) => {
      const marbleWhite = catalog.find(p => p.name?.toLowerCase().includes('calacatta') || p.color?.toLowerCase().includes('beyaz')) || catalog[0];
      const marbleBlack = catalog.find(p => p.name?.toLowerCase().includes('nero') || p.color?.toLowerCase().includes('siyah')) || catalog[1];
      applyTile('floor', marbleWhite);
      applyTile('walls', marbleWhite);
      applyTile('shower', marbleBlack);
      return {
        roomType: 'bathroom',
        faucetColor: 'black',
        cabinetColor: 'walnut',
        showerGlass: 'grid',
        groutColor: '#888888',
        layPattern: 'staggered_50',
        tileRotation: 0,
        timeOfDay: 'day',
        lightTemp: 'neutral',
        lightIntensity: 1.05
      };
    }
  }
];

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

export default function ShowroomKioskPage() {
  const canvasContainerRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  // Ürün ve Marka Eyaletleri
  const [products, setProducts] = useState(BRAND_CATALOG);
  const [brands, setBrands] = useState([]);
  const [selectedBrandId, setSelectedBrandId] = useState('all');
  const [selectedDealer, setSelectedDealer] = useState(null);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [productPage, setProductPage] = useState(1);
  const [hasMoreProducts, setHasMoreProducts] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [totalBrandProducts, setTotalBrandProducts] = useState(0);

  // Kiosk Subscription & Yetkilendirme Durumu
  const [authChecking, setAuthChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);

  // 3D Sanal Stüdyo Yüzey Seçimleri
  const [selectedProduct, setSelectedProduct] = useState(BRAND_CATALOG[0]);
  const [floorProduct, setFloorProduct] = useState(BRAND_CATALOG[0]);
  const [wallProduct, setWallProduct] = useState(BRAND_CATALOG[0]);
  const [accentProduct, setAccentProduct] = useState(null);
  const [showerProduct, setShowerProduct] = useState(null);
  const [showerFloorProduct, setShowerFloorProduct] = useState(null);
  const [toiletWallProduct, setToiletWallProduct] = useState(null);
  const [stripeWallProduct, setStripeWallProduct] = useState(null);
  const [comparisonProduct, setComparisonProduct] = useState(null);

  const [isOffline, setIsOffline] = useState(false);

  // Yüzey Uygulama Açık/Kapalı
  const [applyFloor, setApplyFloor] = useState(true);
  const [applyWalls, setApplyWalls] = useState(true);
  const [applyAccent, setApplyAccent] = useState(false);
  const [applyShower, setApplyShower] = useState(false);
  const [applyShowerFloor, setApplyShowerFloor] = useState(false);
  const [applyToiletWall, setApplyToiletWall] = useState(false);
  const [applyStripeWall, setApplyStripeWall] = useState(false);

  // Aktif Uygulama Yüzeyi Hedefi ('floor' | 'walls' | 'shower' | 'showerFloor' | 'toilet' | 'accent' | 'stripe')
  const [activeTargetSurface, setActiveTargetSurface] = useState('floor');

  // Stüdyo Ortam & Fizik Ayarları
  const [roomType, setRoomType] = useState('bathroom'); // 'bathroom' | 'livingroom' | 'kitchen' | 'terrace'
  const [groutColor, setGroutColor] = useState('#888888');
  const [groutWidth, setGroutWidth] = useState('2');
  const [layPattern, setLayPattern] = useState('flat'); // 'flat' | 'diagonal' | 'herringbone' | 'staggered_50' | 'staggered_33'
  const [tileRotation, setTileRotation] = useState(0); // 0 or 90
  const [timeOfDay, setTimeOfDay] = useState('day'); // 'day' | 'sunrise' | 'sunset' | 'night'
  const [lightTemp, setLightTemp] = useState('neutral');
  const [lightIntensity, setLightIntensity] = useState(1.0); // 0.5 to 2.0
  const [faucetColor, setFaucetColor] = useState('chrome'); // 'chrome' | 'black' | 'gold' | 'rosegold'
  const [cabinetColor, setCabinetColor] = useState('oak'); // 'oak' | 'white' | 'anthracite' | 'walnut'
  const [showerGlass, setShowerGlass] = useState('clear'); // 'clear' | 'smoke' | 'bronze' | 'frosted' | 'grid'

  // Metraj & Canlı Satış Teklifi Hesaplama Eyaletleri (Kiosk Tablet Modu)
  const [areaM2, setAreaM2] = useState(18);
  const [layingStyle, setLayingStyle] = useState('capraz'); // 'duz' (%8), 'capraz' (%12), 'baliksirti' (%15)
  const [unitPriceM2, setUnitPriceM2] = useState(480);
  const [dealerDiscountPercent, setDealerDiscountPercent] = useState(0); // 0, 10, 15, 20, 25
  const [isVatIncluded, setIsVatIncluded] = useState(true);
  const [includeLabor, setIncludeLabor] = useState(true);
  const [laborRatePerM2, setLaborRatePerM2] = useState(250);
  const [includeShipping, setIncludeShipping] = useState(true);
  const [shippingCostInput, setShippingCostInput] = useState(1500);

  // Modlar & Görünüm
  const [comparisonMode, setComparisonMode] = useState(false);
  const [walkthroughMode, setWalkthroughMode] = useState(false);
  const [isPresentationMode, setIsPresentationMode] = useState(false); // Tam Ekran Müşteri Sunum Modu (Zen)
  const [bottomTab, setBottomTab] = useState('design'); // 'design' | 'atmosphere' | 'quote' | 'presets'
  const [isBottomDockCollapsed, setIsBottomDockCollapsed] = useState(false); // Alttaki menüyü gizle / 3D tam görünüm modu

  // Filtreler & Modallar
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('all');
  const [showQrModal, setShowQrModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [snapshotUrl, setSnapshotUrl] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSurfaceMenuOpen, setIsSurfaceMenuOpen] = useState(false);

  // Showroom'dan seçilip gelinen seramiği zemin ve duvara uygula + Online/Offline Dinleyici
  useEffect(() => {
    setMounted(true);
    if (typeof window === 'undefined') return;

    setIsOffline(!navigator.onLine);
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    let targetProduct = null;

    // 0. Bayi Oturumu Kontrolü (Giriş yapan bayinin bilgilerini yükle)
    try {
      const savedDealer = localStorage.getItem('sb_dealer_session');
      if (savedDealer) {
        const parsedDealer = JSON.parse(savedDealer);
        if (parsedDealer && (parsedDealer.id || parsedDealer.name)) {
          setSelectedDealer(parsedDealer);
          if (parsedDealer.brandId) {
            setSelectedBrandId(parsedDealer.brandId);
          }
        }
      }
    } catch (e) {
      console.warn('Kiosk dealer session read error:', e);
    }

    // 1. Session / Local Storage kontrolü (İlham, Showroom ve Mimar portalından tıklanınca anında aktarılan ürün)
    try {
      const stored = sessionStorage.getItem('kiosk_selected_product') || localStorage.getItem('kiosk_selected_product');
      if (stored) {
        targetProduct = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Kiosk storage read error:', e);
    }

    // 2. URL searchParams kontrolü (?productId=... &code=... &room=... &style=... &q=...)
    const urlParams = new URLSearchParams(window.location.search);
    const paramProductId = urlParams.get('productId') || urlParams.get('product') || urlParams.get('id');
    const paramCode = urlParams.get('code');
    const paramRoom = urlParams.get('room');
    const paramStyle = urlParams.get('style');
    const paramSearch = urlParams.get('search') || urlParams.get('q');

    if (paramSearch) {
      setSearchTerm(paramSearch);
    }
    if (paramStyle) {
      setSelectedStyle(paramStyle.toLowerCase());
    }
    if (paramRoom) {
      const r = paramRoom.toLowerCase();
      if (r === 'kitchen' || r === 'mutfak') {
        setRoomType('kitchen');
        setApplyWalls(false);
        setApplyShower(false);
        setApplyShowerFloor(false);
        setApplyToiletWall(false);
        setApplyAccent(false);
        setApplyStripeWall(true);
        setActiveTargetSurface('stripe');
      } else if (r === 'livingroom' || r === 'salon') {
        setRoomType('livingroom');
        setApplyWalls(false);
        setApplyShower(false);
        setApplyShowerFloor(false);
        setApplyToiletWall(false);
        setApplyStripeWall(false);
        setApplyAccent(false);
      } else if (r === 'terrace' || r === 'teras') {
        setRoomType('terrace');
        setApplyWalls(false);
        setApplyShower(false);
        setApplyShowerFloor(false);
        setApplyToiletWall(false);
        setApplyStripeWall(false);
        setApplyAccent(false);
      } else {
        setRoomType('bathroom');
        setApplyWalls(true);
      }
    }

    if (paramProductId && targetProduct && String(targetProduct.id) !== String(paramProductId)) {
      const match = BRAND_CATALOG.find(p => String(p.id) === String(paramProductId));
      if (match) targetProduct = match;
    }

    if (!targetProduct && (paramProductId || paramCode || paramSearch)) {
      targetProduct = BRAND_CATALOG.find(p =>
        (paramProductId && String(p.id) === String(paramProductId)) ||
        (paramCode && (p.code === paramCode || p.name?.toLowerCase().includes(paramCode.toLowerCase()))) ||
        (paramSearch && (p.name?.toLowerCase().includes(paramSearch.toLowerCase()) || p.style?.toLowerCase().includes(paramSearch.toLowerCase())))
      );
    }

    if (targetProduct) {
      let tex = targetProduct.textureUrl || targetProduct.imageUrl;
      let img = targetProduct.imageUrl || tex;
      if (!tex || tex.includes('hero_ceramics') || tex.includes('luxury_bathroom')) {
        tex = getTextureFallback(targetProduct);
      }

      const finalProd = {
        ...targetProduct,
        imageUrl: img || tex,
        textureUrl: tex || img,
        unitPrice: targetProduct.unitPrice || 480
      };

      setSelectedProduct(finalProd);
      setFloorProduct(finalProd);
      setWallProduct(finalProd);
      setApplyFloor(true);
      setApplyWalls(true);
      if (finalProd.unitPrice) {
        setUnitPriceM2(finalProd.unitPrice);
      }

      setProducts(prev => {
        const withoutTarget = prev.filter(p => p.id !== finalProd.id && p.code !== finalProd.code);
        return [finalProd, ...withoutTarget];
      });
    }
  }, []);

  // Veritabanından Markaları, Bayiyi ve Kiosk Abonelik Yetkisini Kontrol Et
  useEffect(() => {
    async function loadMetaDataAndAuth() {
      setAuthChecking(true);
      try {
        // 1. Determine dealer ID from URL search params or localStorage
        let targetDealerId = null;
        let savedDealerObj = null;

        if (typeof window !== 'undefined') {
          const urlParams = new URLSearchParams(window.location.search);
          const queryDealerId = urlParams.get('dealerId');
          if (queryDealerId) {
            targetDealerId = queryDealerId;
          }

          try {
            const saved = localStorage.getItem('sb_dealer_session');
            if (saved) {
              savedDealerObj = JSON.parse(saved);
              if (!targetDealerId && savedDealerObj?.id) {
                targetDealerId = savedDealerObj.id;
              }
            }
          } catch (e) {
            console.warn('Session parse error:', e);
          }
        }

        // 2. Fetch brands and auth status concurrently
        const authUrl = targetDealerId 
          ? `/api/dealers/kiosk-auth?dealerId=${encodeURIComponent(targetDealerId)}`
          : '/api/dealers/kiosk-auth';

        const [brandRes, authRes] = await Promise.all([
          fetch('/api/brands').then(r => r.json()).catch(() => null),
          fetch(authUrl).then(async r => {
            const data = await r.json().catch(() => ({}));
            return { ok: r.ok, status: r.status, data };
          }).catch(err => ({ ok: false, data: { message: 'Bağlantı hatası' } }))
        ]);

        if (brandRes && Array.isArray(brandRes)) {
          setBrands(brandRes);
        }

        if (authRes?.data?.authorized) {
          setIsAuthorized(true);
          setAuthError(null);
          if (authRes.data.dealer) {
            setSelectedDealer(authRes.data.dealer);
            if (authRes.data.dealer.brandId) {
              setSelectedBrandId(authRes.data.dealer.brandId);
            }
          } else if (savedDealerObj) {
            setSelectedDealer(savedDealerObj);
          }
          if (authRes.data.subscription) {
            setSubscriptionInfo(authRes.data.subscription);
          }
        } else {
          setIsAuthorized(false);
          setAuthError({
            reason: authRes?.data?.reason || 'NO_SUBSCRIPTION',
            message: authRes?.data?.message || 'Kiosk Teşhir Modu yalnızca aktif paket aboneliği olan bayilerimize özeldir.'
          });
          if (authRes?.data?.dealer) {
            setSelectedDealer(authRes.data.dealer);
          } else if (savedDealerObj) {
            setSelectedDealer(savedDealerObj);
          }
          if (authRes?.data?.subscription) {
            setSubscriptionInfo(authRes.data.subscription);
          }
        }
      } catch (err) {
        console.error('Kiosk meta & auth fetch error:', err);
        setIsAuthorized(false);
        setAuthError({
          reason: 'SERVER_ERROR',
          message: 'Yetkilendirme kontrolü sırasında bir hata oluştu.'
        });
      } finally {
        setAuthChecking(false);
      }
    }
    loadMetaDataAndAuth();
  }, []);

  // Seçilen Markaya, Stile ve Aramaya Göre Veritabanından Ürünleri Sayfalı Canlı Yükle
  useEffect(() => {
    if (!isAuthorized) return;
    let isSubscribed = true;
    async function loadProductsForBrand() {
      setIsLoadingProducts(true);
      setProductPage(1);
      setHasMoreProducts(true);
      try {
        const params = new URLSearchParams({
          page: '1',
          limit: '48'
        });
        if (selectedBrandId && selectedBrandId !== 'all') {
          params.set('brandId', selectedBrandId);
        }
        if (selectedStyle && selectedStyle !== 'all') {
          params.set('style', selectedStyle);
        }
        if (searchTerm && searchTerm.trim()) {
          params.set('search', searchTerm.trim());
        }

        const prodRes = await fetch(`/api/products?${params.toString()}`).then(r => r.json()).catch(() => null);

        if (isSubscribed && prodRes && prodRes.success && Array.isArray(prodRes.products)) {
          const sanitizedProducts = prodRes.products.map((p, idx) => {
            let img = p.imageUrl || p.textureUrl;
            let tex = p.textureUrl || p.imageUrl;
            if (!tex || tex.includes('hero_ceramics') || tex.includes('luxury_bathroom')) {
              const fallbackIdx = idx % BRAND_CATALOG.length;
              tex = BRAND_CATALOG[fallbackIdx].textureUrl;
            }
            if (!img) img = tex;
            return {
              ...p,
              imageUrl: img,
              textureUrl: tex,
              unitPrice: p.unitPrice || Math.round((p.width || 60) * (p.height || 120) * 0.08 + (p.finish === 'Parlak' ? 120 : 0) + 380)
            };
          });

          // Showroom'dan seçilen ürün eşleşmesi var mı kontrol et
          if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const paramProductId = urlParams.get('productId') || urlParams.get('product') || urlParams.get('id');
            const paramCode = urlParams.get('code');
            let storedProd = null;
            try {
              const stored = sessionStorage.getItem('kiosk_selected_product');
              if (stored) storedProd = JSON.parse(stored);
            } catch(e) {}

            const targetId = storedProd?.id || paramProductId;
            const targetCode = storedProd?.code || paramCode;

            if (targetId || targetCode) {
              const matched = sanitizedProducts.find(p =>
                (targetId && String(p.id) === String(targetId)) ||
                (targetCode && (p.code === targetCode || p.name?.toLowerCase().includes(String(targetCode).toLowerCase())))
              );
              if (matched) {
                setSelectedProduct(matched);
                setFloorProduct(matched);
                setWallProduct(matched);
                setApplyFloor(true);
                setApplyWalls(true);
                if (matched.unitPrice) setUnitPriceM2(matched.unitPrice);
              }
            }
          }

          setProducts(sanitizedProducts);
          setProductPage(1);
          setHasMoreProducts(prodRes.hasMore ?? (1 < prodRes.totalPages));
          setTotalBrandProducts(prodRes.total || sanitizedProducts.length);
        }
      } catch (err) {
        console.error('Kiosk brand products fetch error:', err);
      } finally {
        if (isSubscribed) setIsLoadingProducts(false);
      }
    }

    const timer = setTimeout(() => {
      loadProductsForBrand();
    }, searchTerm ? 350 : 0);

    return () => {
      isSubscribed = false;
      clearTimeout(timer);
    };
  }, [selectedBrandId, selectedStyle, searchTerm, isAuthorized]);

  // Kullanıcı Aşağı Kaydırdıkça Markanın Diğer Ürünlerini Canlı Yükle (Infinite Scroll)
  const loadMoreProducts = async () => {
    if (isLoadingMore || !hasMoreProducts || isLoadingProducts) return;
    setIsLoadingMore(true);
    try {
      const nextPage = productPage + 1;
      const params = new URLSearchParams({
        page: String(nextPage),
        limit: '48'
      });
      if (selectedBrandId && selectedBrandId !== 'all') {
        params.set('brandId', selectedBrandId);
      }
      if (selectedStyle && selectedStyle !== 'all') {
        params.set('style', selectedStyle);
      }
      if (searchTerm && searchTerm.trim()) {
        params.set('search', searchTerm.trim());
      }

      const res = await fetch(`/api/products?${params.toString()}`).then(r => r.json()).catch(() => null);
      if (res && res.success && Array.isArray(res.products) && res.products.length > 0) {
        const sanitized = res.products.map((p, idx) => {
          let img = p.imageUrl || p.textureUrl;
          let tex = p.textureUrl || p.imageUrl;
          if (!tex || tex.includes('hero_ceramics') || tex.includes('luxury_bathroom')) {
            const fallbackIdx = idx % BRAND_CATALOG.length;
            tex = BRAND_CATALOG[fallbackIdx].textureUrl;
          }
          if (!img) img = tex;
          return {
            ...p,
            imageUrl: img,
            textureUrl: tex,
            unitPrice: p.unitPrice || Math.round((p.width || 60) * (p.height || 120) * 0.08 + (p.finish === 'Parlak' ? 120 : 0) + 380)
          };
        });

        setProducts(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const uniqueNew = sanitized.filter(p => !existingIds.has(p.id));
          return [...prev, ...uniqueNew];
        });

        setProductPage(nextPage);
        setHasMoreProducts(res.hasMore ?? (nextPage < res.totalPages));
        if (res.total) setTotalBrandProducts(res.total);
      } else {
        setHasMoreProducts(false);
      }
    } catch (err) {
      console.error('Kiosk load more products error:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Liste Aşağı Kaydırıldığında Otomatik Tetikleme
  const handleProductsScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 280) {
      if (hasMoreProducts && !isLoadingMore && !isLoadingProducts) {
        loadMoreProducts();
      }
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Soldaki Ürün Kartına Tıklandığında Anında 3D Sanal Stüdyo Yüzeyine Uygula!
  const handleSelectProductForTarget = (product) => {
    setSelectedProduct(product);
    if (product.unitPrice) {
      setUnitPriceM2(product.unitPrice);
    }

    if (activeTargetSurface === 'floor') {
      setFloorProduct(product);
      setApplyFloor(true);
    } else if (activeTargetSurface === 'walls') {
      setWallProduct(product);
      setApplyWalls(true);
    } else if (activeTargetSurface === 'shower') {
      setShowerProduct(product);
      setApplyShower(true);
    } else if (activeTargetSurface === 'showerFloor') {
      setShowerFloorProduct(product);
      setApplyShowerFloor(true);
    } else if (activeTargetSurface === 'toilet') {
      setToiletWallProduct(product);
      setApplyToiletWall(true);
    } else if (activeTargetSurface === 'accent') {
      setAccentProduct(product);
      setApplyAccent(true);
    } else if (activeTargetSurface === 'stripe') {
      setStripeWallProduct(product);
      setApplyStripeWall(true);
    }

    // Mobilde ürün seçildiğinde 3D banyo görünümünü açmak için çekmeceyi kapat
    setIsMobileMenuOpen(false);
  };

  // Odalara göre dinamik ve mimari yüzey listesi
  const getRoomSurfaces = (room) => {
    if (room === 'bathroom') {
      return [
        { id: 'floor', name: 'Zemin Seramiği', shortName: 'Zemin', applied: applyFloor, product: floorProduct, toggle: () => setApplyFloor(!applyFloor) },
        { id: 'walls', name: 'Ana Duvarlar', shortName: 'Duvar', applied: applyWalls, product: wallProduct, toggle: () => setApplyWalls(!applyWalls) },
        { id: 'accent', name: 'Lavabo Arkası (Vurgu)', shortName: 'Vurgu', applied: applyAccent, product: accentProduct, toggle: () => setApplyAccent(!applyAccent) },
        { id: 'shower', name: 'Duş Duvarı', shortName: 'Duş Duvar', applied: applyShower, product: showerProduct, toggle: () => setApplyShower(!applyShower) },
        { id: 'showerFloor', name: 'Duş Tabanı', shortName: 'Duş Taban', applied: applyShowerFloor, product: showerFloorProduct, toggle: () => setApplyShowerFloor(!applyShowerFloor) },
        { id: 'toilet', name: 'Klozet Arkası', shortName: 'Klozet', applied: applyToiletWall, product: toiletWallProduct, toggle: () => setApplyToiletWall(!applyToiletWall) },
        { id: 'stripe', name: 'Yatay Bordür / Kuşak', shortName: 'Bordür', applied: applyStripeWall, product: stripeWallProduct, toggle: () => setApplyStripeWall(!applyStripeWall) },
      ];
    } else if (room === 'kitchen') {
      return [
        { id: 'floor', name: 'Zemin Seramiği', shortName: 'Zemin', applied: applyFloor, product: floorProduct, toggle: () => setApplyFloor(!applyFloor) },
        { id: 'stripe', name: 'Tezgah Arası (Mutfak Alnı)', shortName: 'Tezgah Arası', applied: applyStripeWall, product: stripeWallProduct, toggle: () => setApplyStripeWall(!applyStripeWall) },
        { id: 'walls', name: 'Mutfak Duvarı', shortName: 'Duvar', applied: applyWalls, product: wallProduct, toggle: () => setApplyWalls(!applyWalls) },
        { id: 'accent', name: 'Ada / Vurgu Duvarı', shortName: 'Vurgu', applied: applyAccent, product: accentProduct, toggle: () => setApplyAccent(!applyAccent) },
      ];
    } else {
      return [
        { id: 'floor', name: 'Zemin Seramiği', shortName: 'Zemin', applied: applyFloor, product: floorProduct, toggle: () => setApplyFloor(!applyFloor) },
        { id: 'walls', name: 'Ana Duvar', shortName: 'Duvar', applied: applyWalls, product: wallProduct, toggle: () => setApplyWalls(!applyWalls) },
        { id: 'accent', name: 'TV Arkası / Vurgu', shortName: 'Vurgu', applied: applyAccent, product: accentProduct, toggle: () => setApplyAccent(!applyAccent) },
        { id: 'stripe', name: 'Dekor Kuşak Şeridi', shortName: 'Bordür', applied: applyStripeWall, product: stripeWallProduct, toggle: () => setApplyStripeWall(!applyStripeWall) },
      ];
    }
  };

  // Zemin seramiğini tüm duvarlara tek tıkla uygula (Showroom Kombin Modu)
  const handleApplyFloorToAllSurfaces = () => {
    const prod = floorProduct || selectedProduct;
    if (!prod) return;
    setWallProduct(prod);
    setApplyWalls(true);
    setShowerProduct(prod);
    setApplyShower(true);
    setShowerFloorProduct(prod);
    setApplyShowerFloor(true);
    setToiletWallProduct(prod);
    setApplyToiletWall(true);
    setAccentProduct(prod);
    setApplyAccent(true);
    showTouchFeedback('✓ Zemin karosu tüm duvarlara kombinlendi');
  };

  // Hazır Showroom Konseptini Sahneye Uygula
  const handleApplyShowroomPreset = (preset) => {
    const config = preset.apply(products, (target, prod) => {
      if (target === 'floor') {
        setFloorProduct(prod);
        setApplyFloor(true);
      } else if (target === 'walls') {
        setWallProduct(prod);
        setApplyWalls(true);
      } else if (target === 'shower') {
        setShowerProduct(prod);
        setApplyShower(true);
      } else if (target === 'accent') {
        setAccentProduct(prod);
        setApplyAccent(true);
      }
    });

    if (config) {
      if (config.roomType) setRoomType(config.roomType);
      if (config.faucetColor) setFaucetColor(config.faucetColor);
      if (config.cabinetColor) setCabinetColor(config.cabinetColor);
      if (config.showerGlass) setShowerGlass(config.showerGlass);
      if (config.groutColor) setGroutColor(config.groutColor);
      if (config.layPattern) setLayPattern(config.layPattern);
      if (config.tileRotation !== undefined) setTileRotation(config.tileRotation);
      if (config.timeOfDay) setTimeOfDay(config.timeOfDay);
      if (config.lightTemp) setLightTemp(config.lightTemp);
      if (config.lightIntensity) setLightIntensity(config.lightIntensity);
    }

    showTouchFeedback(`✓ ${preset.title} konsepti uygulandı`);
  };

  // Mekan Değiştiğinde
  const handleRoomTypeChange = (newRoom) => {
    setRoomType(newRoom);
    if (newRoom === 'kitchen') {
      setApplyWalls(false);
      setApplyShower(false);
      setApplyShowerFloor(false);
      setApplyToiletWall(false);
      setApplyAccent(false);
      setApplyStripeWall(true);
      setActiveTargetSurface('stripe');
    } else if (newRoom !== 'bathroom') {
      setApplyWalls(false);
      setApplyShower(false);
      setApplyShowerFloor(false);
      setApplyToiletWall(false);
      setApplyStripeWall(false);
      setApplyAccent(false);
    } else {
      setApplyWalls(true);
    }
  };

  const [touchToastMsg, setTouchToastMsg] = useState(null);
  const touchToastTimerRef = useRef(null);

  const showTouchFeedback = (msg) => {
    if (touchToastTimerRef.current) clearTimeout(touchToastTimerRef.current);
    setTouchToastMsg(msg);
    touchToastTimerRef.current = setTimeout(() => {
      setTouchToastMsg(null);
    }, 2200);
  };

  // 3D Sahneden veya Mobil Çiplerden Bir Yüzeye Dokunulduğunda Seramiği Ekle / Çıkar
  const handleToggleTargetFromCanvas = (target) => {
    const prod = selectedProduct || BRAND_CATALOG[0];
    const prodShortName = prod?.name ? prod.name.split(' ')[0] : 'Seramik';

    if (target === 'floor') {
      if (applyFloor && activeTargetSurface === 'floor') {
        setApplyFloor(false);
        showTouchFeedback('Zemin seramik kaplaması kaldırıldı ✕');
      } else {
        setFloorProduct(prod);
        setApplyFloor(true);
        setActiveTargetSurface('floor');
        showTouchFeedback(`✓ Zemin: ${prodShortName} kaplaması eklendi`);
      }
    } else if (target === 'walls') {
      if (applyWalls && activeTargetSurface === 'walls') {
        setApplyWalls(false);
        showTouchFeedback('Ana Duvar kaplaması kaldırıldı ✕');
      } else {
        setWallProduct(prod);
        setApplyWalls(true);
        setActiveTargetSurface('walls');
        showTouchFeedback(`✓ Ana Duvar: ${prodShortName} kaplaması eklendi`);
      }
    } else if (target === 'shower') {
      if (applyShower && activeTargetSurface === 'shower') {
        setApplyShower(false);
        showTouchFeedback('Duş Duvarı kaplaması kaldırıldı ✕');
      } else {
        setShowerProduct(prod);
        setApplyShower(true);
        setActiveTargetSurface('shower');
        showTouchFeedback(`✓ Duş Duvarı: ${prodShortName} kaplaması eklendi`);
      }
    } else if (target === 'showerFloor') {
      if (applyShowerFloor && activeTargetSurface === 'showerFloor') {
        setApplyShowerFloor(false);
        showTouchFeedback('Duş Zemini kaplaması kaldırıldı ✕');
      } else {
        setShowerFloorProduct(prod);
        setApplyShowerFloor(true);
        setActiveTargetSurface('showerFloor');
        showTouchFeedback(`✓ Duş Zemini: ${prodShortName} kaplaması eklendi`);
      }
    } else if (target === 'toilet') {
      if (applyToiletWall && activeTargetSurface === 'toilet') {
        setApplyToiletWall(false);
        showTouchFeedback('Klozet Arkası kaplaması kaldırıldı ✕');
      } else {
        setToiletWallProduct(prod);
        setApplyToiletWall(true);
        setActiveTargetSurface('toilet');
        showTouchFeedback(`✓ Klozet Arkası: ${prodShortName} kaplaması eklendi`);
      }
    } else if (target === 'accent') {
      if (applyAccent && activeTargetSurface === 'accent') {
        setApplyAccent(false);
        showTouchFeedback('Lavabo Arkası kaplaması kaldırıldı ✕');
      } else {
        setAccentProduct(prod);
        setApplyAccent(true);
        setActiveTargetSurface('accent');
        showTouchFeedback(`✓ Lavabo Arkası: ${prodShortName} kaplaması eklendi`);
      }
    } else if (target === 'stripe') {
      if (applyStripeWall && activeTargetSurface === 'stripe') {
        setApplyStripeWall(false);
        showTouchFeedback('Yatay Bordür kaplaması kaldırıldı ✕');
      } else {
        setStripeWallProduct(prod);
        setApplyStripeWall(true);
        setActiveTargetSurface('stripe');
        showTouchFeedback(`✓ Yatay Bordür: ${prodShortName} kaplaması eklendi`);
      }
    }
  };

  // Teklif Oluşturma Modalını Aç ve Ekran Görüntüsü Al
  const handleOpenQuoteModal = () => {
    try {
      const canvasEl = document.querySelector('canvas');
      if (canvasEl) {
        const snap = canvasEl.toDataURL('image/jpeg', 0.9);
        setSnapshotUrl(snap);
      }
    } catch (e) {
      console.warn('Snapshot capture warning:', e);
    }
    setShowQuoteModal(true);
  };

  // Marka Seçimi Değiştiğinde
  const handleBrandChange = (brandId) => {
    setSelectedBrandId(brandId);
    setSelectedStyle('all'); // Marka seçildiğinde stil filtresini sıfırla ki tüm modeller gözüksün
  };

  // Tüm Markaların Listesini ve Toplam Sayılarını Derle
  const knownBrandNames = ['Kalebodur', 'Graniser', 'VitrA', 'NG Kütahya Seramik', 'Bien Seramik', 'Çanakkale Seramik', 'Yurtbay Seramik', 'Ege Seramik', 'Seramiksan', 'Qua Granite', 'Duratiles', 'Decovita', 'Hitit Seramik', 'Seranit', 'Güral Seramik', 'Termal Seramik', 'Uşak Seramik'];
  
  const uniqueBrandList = brands.length > 0 ? brands : knownBrandNames.map(name => ({
    id: name,
    name: name,
    _count: { products: 0 }
  }));

  const totalProductCountInDb = brands.reduce((acc, b) => acc + (b._count?.products || 0), 0) || products.length;

  const selectedBrandObj = selectedBrandId !== 'all' 
    ? uniqueBrandList.find(b => b.id === selectedBrandId || b.name === selectedBrandId)
    : null;
  const selectedBrandName = selectedBrandObj?.name || (selectedBrandId !== 'all' ? selectedBrandId : '');

  // Akıllı Ürün Filtreleme (Marka + Stil + Arama)
  const filteredProducts = products.filter(p => {
    let brandMatch = true;
    if (selectedBrandId !== 'all') {
      const bId = String(selectedBrandId).toLowerCase();
      const bName = String(selectedBrandName).toLowerCase();
      const pBrandId = String(p.brandId || '').toLowerCase();
      const pBrandName = String(p.brand?.name || '').toLowerCase();
      const pBrandIdObj = String(p.brand?.id || '').toLowerCase();

      brandMatch = 
        pBrandId === bId || 
        pBrandIdObj === bId || 
        (pBrandName && (
          pBrandName === bId || 
          pBrandName === bName || 
          pBrandName.includes(bId) || 
          (bId && bId.includes(pBrandName)) || 
          (bName && pBrandName.includes(bName)) || 
          (bName && bName.includes(pBrandName))
        ));
    }

    let styleLower = (p.style || '').toLowerCase();
    let nameLower = (p.name || '').toLowerCase();
    let codeLower = (p.code || '').toLowerCase();
    let brandNameLower = (p.brand?.name || '').toLowerCase();

    let styleMatch = true;
    if (selectedStyle === 'mermer') styleMatch = styleLower.includes('mermer') || nameLower.includes('mermer');
    else if (selectedStyle === 'ahsap') styleMatch = styleLower.includes('ahşap') || styleLower.includes('ahsap') || nameLower.includes('ahşap');
    else if (selectedStyle === 'beton') styleMatch = styleLower.includes('beton') || nameLower.includes('beton');
    else if (selectedStyle === 'tas') styleMatch = styleLower.includes('taş') || styleLower.includes('tas') || nameLower.includes('taş');

    let searchMatch = true;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      searchMatch = nameLower.includes(q) || codeLower.includes(q) || styleLower.includes(q) || brandNameLower.includes(q);
    }

    return brandMatch && styleMatch && searchMatch;
  });

  let displayProducts = products;
  if (selectedStyle !== 'all' || searchTerm) {
    displayProducts = filteredProducts;
  }
  if (displayProducts.length === 0 && !isLoadingProducts && !searchTerm && selectedStyle === 'all') {
    if (selectedBrandId !== 'all') {
      const bName = selectedBrandName || selectedBrandId;
      const brandMatchCatalog = BRAND_CATALOG.filter(p => 
        p.brand?.name?.toLowerCase().includes(bName.toLowerCase()) || 
        bName.toLowerCase().includes(p.brand?.name?.toLowerCase())
      );
      if (brandMatchCatalog.length > 0) {
        displayProducts = brandMatchCatalog;
      }
    } else {
      displayProducts = BRAND_CATALOG;
    }
  }

  // Her bir ürünün resim adresini doğrula ve garanti et
  displayProducts = displayProducts.map((p) => {
    let img = p.imageUrl || p.textureUrl;
    let tex = p.textureUrl || p.imageUrl;
    if (!img || img.length < 5 || img.includes('hero_ceramics') || img.includes('luxury_bathroom')) {
      img = getTextureFallback(p);
    }
    if (!tex || tex.length < 5 || tex.includes('hero_ceramics') || tex.includes('luxury_bathroom')) {
      tex = getTextureFallback(p);
    }
    return {
      ...p,
      imageUrl: img,
      textureUrl: tex
    };
  });

  // Metraj & Canlı Fiyat Hesaplama Matematiği
  const wastePercent = layingStyle === 'baliksirti' ? 15 : layingStyle === 'capraz' ? 12 : 8;
  const totalM2WithWaste = Math.round((areaM2 * (1 + wastePercent / 100)) * 10) / 10;
  const requiredBoxes = Math.ceil(totalM2WithWaste / 1.44);

  const unitPriceNum = Number(unitPriceM2) || 0;
  const discountRate = (Number(dealerDiscountPercent) || 0) / 100;
  const discountedUnitPrice = discountRate > 0 ? Math.round(unitPriceNum * (1 - discountRate)) : unitPriceNum;
  const tileCost = Math.round(totalM2WithWaste * discountedUnitPrice);
  const tileCostListPrice = Math.round(totalM2WithWaste * unitPriceNum);
  const totalDiscountSavings = tileCostListPrice - tileCost;

  const adhesiveBags = Math.ceil(totalM2WithWaste / 5);
  const adhesiveCost = adhesiveBags * 280;
  const groutPacks = Math.ceil(totalM2WithWaste / 15);
  const groutCost = groutPacks * 180;
  const laborRateNum = Number(laborRatePerM2) || 0;
  const laborCost = includeLabor ? Math.round(totalM2WithWaste * laborRateNum) : 0;
  const shippingNum = Number(shippingCostInput) || 0;
  const shippingCost = includeShipping ? shippingNum : 0;

  const subtotalBeforeVat = tileCost + adhesiveCost + groutCost + laborCost + shippingCost;
  const vatAmount = Math.round(subtotalBeforeVat * 0.20);
  const grandTotal = isVatIncluded ? subtotalBeforeVat + vatAmount : subtotalBeforeVat;

  if (!mounted || authChecking) {
    return (
      <main style={{ 
        minHeight: '100vh', 
        background: '#0b0f19', 
        color: '#f8fafc', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        flexDirection: 'column', 
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' 
      }}>
        <div style={{ 
          width: '44px', 
          height: '44px', 
          border: '3px solid rgba(245,158,11,0.2)', 
          borderTopColor: '#f59e0b', 
          borderRadius: '50%', 
          animation: 'kioskSpin 0.8s linear infinite' 
        }} />
        <h2 style={{ marginTop: '20px', fontSize: '1.25rem', fontWeight: '800', color: '#f8fafc', letterSpacing: '-0.02em' }}>
          Seramik<span style={{ color: '#f59e0b' }}>Bak</span> Kiosk
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '6px' }}>
          {authChecking ? 'Yetkili Bayi ve Abonelik Durumu Doğrulanıyor...' : '3D Showroom Sanal Stüdyosu Hazırlanıyor...'}
        </p>
        <style>{`@keyframes kioskSpin { to { transform: rotate(360deg); } }`}</style>
      </main>
    );
  }

  if (!isAuthorized) {
    return (
      <main style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at 50% 30%, #1a1a2e 0%, #0b0f19 80%)',
        color: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{
          maxWidth: '560px',
          width: '100%',
          background: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid rgba(245, 158, 11, 0.35)',
          borderRadius: '24px',
          padding: '40px 32px',
          textAlign: 'center',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(245, 158, 11, 0.1)',
          backdropFilter: 'blur(20px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px'
        }}>
          {/* Glowing Lock Icon */}
          <div style={{
            width: '76px',
            height: '76px',
            borderRadius: '22px',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.05) 100%)',
            border: '2px solid rgba(245, 158, 11, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fbbf24',
            boxShadow: '0 8px 24px rgba(245, 158, 11, 0.25)'
          }}>
            <Lock size={36} />
          </div>

          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              color: '#fbbf24',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '0.72rem',
              fontWeight: '800',
              marginBottom: '12px',
              letterSpacing: '0.04em'
            }}>
              <Crown size={12} />
              <span>BAYİ PAKET ABONELİĞİ GEREKİR</span>
            </div>
            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: '900',
              margin: '0 0 8px 0',
              color: '#ffffff',
              letterSpacing: '-0.02em'
            }}>
              Kiosk Teşhir Modu Kilitli
            </h1>
            <p style={{
              fontSize: '0.88rem',
              color: '#94a3b8',
              lineHeight: 1.6,
              margin: 0
            }}>
              {authError?.message || 'Kiosk Teşhir Modu, yalnızca aktif paket aboneliği (Lite, Standart veya Premium) bulunan SeramikBak yetkili bayileri tarafından kullanılabilir.'}
            </p>
          </div>

          {/* Dealer Info Card if identified */}
          {selectedDealer && (
            <div style={{
              width: '100%',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '14px 18px',
              textAlign: 'left',
              boxSizing: 'border-box'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: '700' }}>TANIMLI SHOWROOM:</span>
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: '800',
                  color: authError?.reason === 'PENDING_APPROVAL' ? '#fbbf24' : '#f87171',
                  background: authError?.reason === 'PENDING_APPROVAL' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                  padding: '2px 8px',
                  borderRadius: '6px'
                }}>
                  {authError?.reason === 'PENDING_APPROVAL' ? 'Onay Bekliyor' : authError?.reason === 'EXPIRED' ? 'Süresi Doldu' : 'Paket Yok'}
                </span>
              </div>
              <div style={{ fontSize: '0.92rem', fontWeight: '800', color: '#f8fafc' }}>
                {selectedDealer.name}
              </div>
              {selectedDealer.city && (
                <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '2px' }}>
                  {selectedDealer.city} {selectedDealer.district ? `· ${selectedDealer.district}` : ''}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', marginTop: '6px' }}>
            <Link
              href="/bayi"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                padding: '14px 20px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: '#ffffff',
                textDecoration: 'none',
                borderRadius: '12px',
                fontWeight: '800',
                fontSize: '0.9rem',
                boxShadow: '0 4px 16px rgba(245, 158, 11, 0.35)',
                boxSizing: 'border-box',
                transition: 'all 0.2s'
              }}
            >
              <span>{selectedDealer ? 'Bayi Paneline Dön & Paket Seç' : 'Bayi Girişi Yap'}</span>
              <ArrowRight size={16} />
            </Link>

            <Link
              href="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                width: '100%',
                padding: '12px 18px',
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#94a3b8',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                textDecoration: 'none',
                borderRadius: '12px',
                fontWeight: '700',
                fontSize: '0.82rem',
                boxSizing: 'border-box'
              }}
            >
              <Home size={14} />
              <span>Ana Sayfaya Dön</span>
            </Link>
          </div>

          {/* Support / Contact info */}
          <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '4px' }}>
            Paket abonelikleri hakkında bilgi almak için:{' '}
            <a
              href="https://wa.me/905321381061?text=Merhaba,%20Kiosk%20Teşhir%20Modu%20paket%20aboneliği%20hakkında%20bilgi%20almak%20istiyorum."
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#d4af37', textDecoration: 'underline', fontWeight: '700' }}
            >
              WhatsApp Destek Hattı
            </a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main 
      className="kiosk-page-container"
      style={{
        background: '#0b0f19',
        color: '#f8fafc',
        minHeight: '100vh',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      {/* Top Touch Kiosk Header */}
      <header className="kiosk-header">
        <div className="header-left">
          <Link 
            href="/bayi" 
            className="kiosk-nav-btn btn-nav-bayi" 
            title="Bayi Paneline Dön"
          >
            <Building2 size={15} style={{ flexShrink: 0 }} />
            <span className="btn-label-desktop">Bayi Paneli</span>
            <span className="btn-label-mobile">Bayi</span>
          </Link>
          <Link 
            href="/" 
            className="kiosk-nav-btn btn-nav-exit" 
            title="Ana Sayfaya Dön (Çıkış)"
          >
            <LogOut size={15} style={{ flexShrink: 0 }} />
            <span className="btn-label-desktop">Çıkış</span>
          </Link>
        </div>

        {/* Center: Symmetrical Dealer Showroom Capsule */}
        <div className="header-center">
          <div className="header-showroom-pill">
            <Crown size={14} className="showroom-crown-icon" />
            <div className="showroom-text-wrap">
              <span className="showroom-brand-name">
                {selectedDealer?.name || 'SeramikBak'}
              </span>
              <span className="showroom-tag-badge">Showroom</span>
            </div>
          </div>
        </div>

        {/* Top Header Actions */}
        <div className="header-right">
          {isOffline && (
            <span className="kiosk-offline-pill-badge">
              ⚡ Çevrimdışı Mod (Yerel 3D Aktif)
            </span>
          )}

          <button 
            onClick={() => setIsPresentationMode(!isPresentationMode)}
            className={`btn-mode-kiosk ${isPresentationMode ? 'active-purple' : ''}`}
            title="Müşteri Sunum Modu (Sol menüyü gizler, tam ekran 3D sunum yapar)"
          >
            <Eye size={16} />
            <span>{isPresentationMode ? 'Düzenleme Modu' : 'Müşteri Sunumu'}</span>
          </button>

          <button 
            onClick={() => setBottomTab(bottomTab === 'quote' ? 'design' : 'quote')}
            className={`btn-mode-kiosk ${bottomTab === 'quote' ? 'active-gold' : ''}`}
          >
            <Calculator size={16} />
            <span>Metraj & Fiyat Paneli</span>
          </button>


          <button onClick={() => setShowQrModal(true)} className="btn-secondary-kiosk">
            <QrCode size={16} />
            <span>QR ile İndir</span>
          </button>

          <button onClick={handleOpenQuoteModal} className="btn-primary-gold-kiosk">
            <FileText size={16} />
            <span>PDF Teklif Oluştur</span>
          </button>
        </div>
      </header>

      {/* Mobile Drawer Dark Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="kiosk-mobile-backdrop" 
          onClick={() => setIsMobileMenuOpen(false)}
          title="Menüyü Kapat"
        />
      )}

      {/* Main Touch Workspace Grid (Fixed Screen Viewport Locked) */}
      <div className={`kiosk-workspace-grid ${isPresentationMode ? 'presentation-mode' : ''}`}>
        {/* Left Side: Product & Brand Selector Sidebar (Mobile Slide-Out Drawer) */}
        <div className={`kiosk-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          {/* Mobile Drawer Top Header Bar */}
          <div className="mobile-drawer-header">
            <div className="drawer-title-row">
              <Layers size={16} className="icon-gold" />
              <span>3D Kaplama & Katalog Menüsü</span>
            </div>
            <button 
              onClick={() => setIsMobileMenuOpen(false)} 
              className="btn-close-drawer"
              title="Kapat"
            >
              <X size={18} />
            </button>
          </div>

          {/* Surface Target Selection Grid (Hangi Yüzey Kaplanacak?) */}
          <div className="sidebar-top-controls">
            <div 
              onClick={() => setIsSurfaceMenuOpen(!isSurfaceMenuOpen)}
              className="surface-accordion-header"
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', cursor: 'pointer', userSelect: 'none' }}
            >
              <div className="section-label-header" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <Layers size={14} className="icon-gold" />
                <span className="surface-step-title">1. Yüzey:</span>
                <span className="active-target-badge">
                  🎯 {getRoomSurfaces(roomType).find(s => s.id === activeTargetSurface)?.name || 'Zemin'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {(applyWalls || applyShower || applyToiletWall || applyAccent || applyStripeWall) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setApplyWalls(false);
                      setApplyShower(false);
                      setApplyShowerFloor(false);
                      setApplyToiletWall(false);
                      setApplyAccent(false);
                      setApplyStripeWall(false);
                    }}
                    style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.68rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                    title="Tüm duvar seramiklerini tek tıkla pasif yap / temizle"
                  >
                    <X size={12} />
                    <span>Temizle</span>
                  </button>
                )}
                <span className="accordion-toggle-pill">
                  {isSurfaceMenuOpen ? '▲ Kapat' : '▼ Tüm Yüzeyler'}
                </span>
              </div>
            </div>

            {isSurfaceMenuOpen && (
              <div className="surface-target-grid is-open">
                {getRoomSurfaces(roomType).map(surf => {
                  const isTarget = activeTargetSurface === surf.id;
                  const isApplied = surf.applied && surf.product;

                  return (
                    <div
                      key={surf.id}
                      className={`surface-card-btn ${isTarget ? 'is-target' : ''} ${isApplied ? 'has-tile' : 'no-tile'}`}
                      onClick={() => {
                        setActiveTargetSurface(surf.id);
                        if (!surf.applied && surf.product) {
                          surf.toggle();
                        }
                      }}
                    >
                      <div className="surface-info-col">
                        <div className="surface-title-row">
                          {isTarget && <span className="target-indicator-dot" title="Aktif Hedef">🎯</span>}
                          <span className="surface-name">{surf.name}</span>
                        </div>
                        {isApplied ? (
                          <span className="tile-applied-tag">
                            ✓ {surf.product.name.split(' ')[0]}
                          </span>
                        ) : (
                          <span className="tile-empty-tag">Döşenmedi</span>
                        )}
                      </div>

                      {isApplied ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            surf.toggle();
                          }}
                          className="btn-clear-tile"
                          title={`${surf.name} seramik kaplamasını kaldır`}
                        >
                          <X size={12} />
                          <span>Kaldır</span>
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveTargetSurface(surf.id);
                          }}
                          className={`btn-select-target ${isTarget ? 'active' : ''}`}
                        >
                          {isTarget ? 'Seçili' : 'Kapla'}
                        </button>
                      )}
                    </div>
                  );
                })}
                <button
                  onClick={handleApplyFloorToAllSurfaces}
                  style={{
                    gridColumn: 'span 2',
                    background: 'rgba(245, 158, 11, 0.12)',
                    border: '1px dashed rgba(245, 158, 11, 0.45)',
                    color: '#fbbf24',
                    borderRadius: '6px',
                    padding: '5px 8px',
                    fontSize: '0.66rem',
                    fontWeight: '800',
                    cursor: 'pointer',
                    marginTop: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px'
                  }}
                  title="Zemin seramiğini duş ve tüm duvarlara kombin uygula"
                >
                  <span>🎯</span>
                  <span>Zemin Karosunu Tüm Duvarlara Eşitle (Kombin)</span>
                </button>
              </div>
            )}

            {/* Marka Seçimi Dropdown (Tüm Markalar) */}
            <div className="brand-select-wrapper">
              <div className="section-label-header">
                <Building2 size={14} className="icon-gold" />
                <span>2. Marka Filtresi:</span>
              </div>
              <select
                value={selectedBrandId}
                onChange={(e) => handleBrandChange(e.target.value)}
                className="kiosk-brand-dropdown"
              >
                <option value="all">🏢 Tüm Markalar ({totalProductCountInDb} Model)</option>
                {uniqueBrandList.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name} {b._count?.products ? `(${b._count.products} Model)` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Input Box */}
            <div className="search-box-wrapper">
              <Search size={15} className="search-icon" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Model / SKU / Tarz Ara (ör. Calacatta, Mermer)..."
                className="search-input"
              />
            </div>

            {/* Style Filter Touch Pills */}
            <div className="filter-pills-row">
              {[
                { id: 'all', label: 'Tümü' },
                { id: 'mermer', label: 'Mermer' },
                { id: 'ahsap', label: 'Ahşap' },
                { id: 'beton', label: 'Beton' },
                { id: 'tas', label: 'Taş' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedStyle(tab.id)}
                  className={`filter-pill ${selectedStyle === tab.id ? 'active' : ''}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Products List Grid (Sadece Ürün Listesi İçeride Scroll Eder, Sayfa Bozulmaz!) */}
          <div 
            className="products-scroll-grid"
            onScroll={handleProductsScroll}
          >
            {isLoadingProducts ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '220px', color: '#94a3b8', width: '100%', gridColumn: 'span 2' }}>
                <div className="kiosk-spin-loader" />
                <span style={{ marginTop: '12px', fontSize: '0.85rem', fontWeight: '600', color: '#fbbf24' }}>Marka Ürünleri Canlı Yükleniyor...</span>
              </div>
            ) : displayProducts.length === 0 ? (
              <div style={{ padding: '30px 15px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem', gridColumn: 'span 2' }}>
                Seçilen filtreye uygun ürün bulunamadı.
              </div>
            ) : (
              <>
                {displayProducts.map(product => {
                  const isFloorSelected = floorProduct?.id === product.id;
                  const isWallSelected = wallProduct?.id === product.id;
                  const isShowerSelected = showerProduct?.id === product.id;
                  const isToiletSelected = toiletWallProduct?.id === product.id;

                  const isCurrentTarget = 
                    (activeTargetSurface === 'floor' && isFloorSelected) ||
                    (activeTargetSurface === 'walls' && isWallSelected) ||
                    (activeTargetSurface === 'shower' && isShowerSelected) ||
                    (activeTargetSurface === 'toilet' && isToiletSelected);

                  return (
                    <div
                      key={product.id}
                      onClick={() => handleSelectProductForTarget(product)}
                      className={`product-touch-card ${isCurrentTarget ? 'active' : ''}`}
                    >
                      <div className="card-thumb-wrapper">
                        <img
                          src={product.imageUrl || product.textureUrl || '/textures/calacatta_gold.jpg'}
                          alt={product.name}
                          className="card-thumb-img"
                          loading="lazy"
                          decoding="async"
                          onError={(e) => {
                            e.target.src = '/textures/calacatta_gold.jpg';
                          }}
                        />
                        <div className="tag-badges">
                          {isFloorSelected && <span className="tag-floor">ZEMİN</span>}
                          {isWallSelected && <span className="tag-wall">DUVAR</span>}
                          {isShowerSelected && <span className="tag-shower">DUŞ</span>}
                        </div>
                      </div>

                      <div className="card-info">
                        <span className="brand-name-pill">{product.brand?.name || 'Seramik Markası'}</span>
                        <h3 className="product-title">{product.name}</h3>
                        <p className="product-specs">
                          {product.width}x{product.height} cm • {product.style || 'Seramik'} • {product.finish || 'Mat'}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {/* Infinite Scroll Indicator & Loading More */}
                {isLoadingMore && (
                  <div className="kiosk-infinite-loading-pill">
                    <div className="kiosk-spin-loader-sm" />
                    <span>Daha fazla model yükleniyor...</span>
                  </div>
                )}

                {hasMoreProducts && !isLoadingMore && (
                  <button 
                    onClick={loadMoreProducts} 
                    className="kiosk-load-more-btn"
                    type="button"
                  >
                    <span>Daha Fazla Göster ({displayProducts.length} / {totalBrandProducts})</span>
                  </button>
                )}

                {!hasMoreProducts && displayProducts.length > 0 && (
                  <div className="kiosk-infinite-end-pill">
                    <span>✓ Markanın tüm modelleri listelendi ({displayProducts.length} Model)</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right Side: 3D Visualizer Canvas & Live Studio Controls */}
        <div className="kiosk-canvas-area">
          {/* Main 3D Visualizer Canvas Frame */}
          <div ref={canvasContainerRef} className="canvas-frame">
            <StudioCanvas
              activeProduct={selectedProduct}
              floorProduct={floorProduct}
              wallProduct={wallProduct}
              accentProduct={accentProduct}
              showerProduct={showerProduct}
              showerFloorProduct={showerFloorProduct}
              toiletWallProduct={toiletWallProduct}
              stripeWallProduct={stripeWallProduct}
              comparisonProduct={comparisonProduct}
              applyFloor={applyFloor}
              applyWalls={applyWalls}
              applyAccent={applyAccent}
              applyShower={applyShower}
              applyShowerFloor={applyShowerFloor}
              applyToiletWall={applyToiletWall}
              applyStripeWall={applyStripeWall}
              comparisonMode={comparisonMode}
              walkthroughMode={walkthroughMode}
              onToggleTarget={handleToggleTargetFromCanvas}
              roomType={roomType}
              groutColor={groutColor}
              groutWidth={groutWidth}
              layPattern={layPattern}
              tileRotation={tileRotation}
              timeOfDay={timeOfDay}
              lightTemp={lightTemp}
              lightIntensity={lightIntensity}
              faucetColor={faucetColor}
              cabinetColor={cabinetColor}
              showerGlass={showerGlass}
              onShowerGlassChange={setShowerGlass}
              extraTopLeft={
                <div className="kiosk-extra-top-left">
                  <button 
                    onClick={() => setIsMobileMenuOpen(true)} 
                    className="canvas-mobile-floating-menu-btn"
                    title="Kaplama & Seramik Menüsünü Aç"
                    type="button"
                  >
                    <Palette size={13} />
                    <span>Katalog</span>
                  </button>

                  {!isPresentationMode && (
                    <div className="canvas-active-target-pill">
                      <span className="pill-target-name">
                        {activeTargetSurface === 'floor' && (applyFloor ? `Zemin` : 'Zemin: Pasif')}
                        {activeTargetSurface === 'walls' && (applyWalls ? `Duvar` : 'Duvar: Pasif')}
                        {activeTargetSurface === 'shower' && (applyShower ? 'Duş' : 'Duş: Pasif')}
                        {activeTargetSurface === 'showerFloor' && (applyShowerFloor ? 'Duş Tab.' : 'Duş Tab.: Pasif')}
                        {activeTargetSurface === 'toilet' && (applyToiletWall ? 'Klozet' : 'Klozet: Pasif')}
                        {activeTargetSurface === 'accent' && (applyAccent ? 'Vurgu' : 'Vurgu: Pasif')}
                        {activeTargetSurface === 'stripe' && (applyStripeWall ? 'Bordür' : 'Bordür: Pasif')}
                      </span>
                      {(activeTargetSurface === 'floor' && applyFloor) && (
                        <button onClick={() => handleToggleTargetFromCanvas('floor')} className="pill-remove-btn" title="Zemin kaplamasını kaldır" type="button">✕</button>
                      )}
                      {(activeTargetSurface === 'walls' && applyWalls) && (
                        <button onClick={() => handleToggleTargetFromCanvas('walls')} className="pill-remove-btn" title="Duvar kaplamasını kaldır" type="button">✕</button>
                      )}
                    </div>
                  )}
                </div>
              }
              extraTopRight={
                <div className="kiosk-extra-top-right">
                  <button
                    onClick={() => setIsBottomDockCollapsed(!isBottomDockCollapsed)}
                    className={`canvas-focus-toggle-btn ${isBottomDockCollapsed ? 'active-gold' : ''}`}
                    title={isBottomDockCollapsed ? 'Tasarım Menüsünü Aç' : '3D Tam Görünüm (Menüyü Gizle)'}
                    type="button"
                  >
                    {isBottomDockCollapsed ? <Sliders size={13} /> : <Eye size={13} />}
                    <span>{isBottomDockCollapsed ? 'Menü' : '3D Odak'}</span>
                  </button>

                  <button 
                    onClick={toggleFullscreen} 
                    className="canvas-expand-touch-btn"
                    title="3D Stüdyo Tam Ekran Modu"
                    type="button"
                  >
                    {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                  </button>
                </div>
              }
            />

            {/* Touch Toast Notification Popup on 3D Canvas */}
            {touchToastMsg && (
              <div className="canvas-touch-toast">
                <Sparkles size={14} className="icon-gold animate-pulse" />
                <span>{touchToastMsg}</span>
              </div>
            )}

            {/* Müşteri Sunum Modu Floating Top Banner */}
            {isPresentationMode && (
              <div className="canvas-presentation-banner">
                <div className="pres-banner-left">
                  <Crown size={16} className="icon-gold" />
                  <span className="pres-dealer-name">{selectedDealer?.name || 'Yetkili Showroom'}</span>
                  <span className="pres-divider">•</span>
                  <span className="pres-prod-name">
                    {selectedProduct?.name || 'Seçili Seramik'} ({selectedProduct?.width}x{selectedProduct?.height} cm)
                  </span>
                  <span className="pres-price-pill">
                    ₺{discountedUnitPrice} / m²
                  </span>
                </div>
                <button
                  onClick={() => setIsPresentationMode(false)}
                  className="pres-exit-btn"
                  title="Düzenleme Moduna Dön"
                >
                  <Minimize2 size={13} />
                  <span>Düzenleme Moduna Dön</span>
                </button>
              </div>
            )}

            {/* Mobile Bottom Single Quick Surface Chips Bar */}
            <div className={`canvas-mobile-surface-chips ${isBottomDockCollapsed ? 'dock-collapsed' : ''}`}>
              {getRoomSurfaces(roomType).map(surf => {
                const isTarget = activeTargetSurface === surf.id;
                const isApplied = surf.applied && surf.product;

                return (
                  <button
                    key={surf.id}
                    onClick={() => {
                      setActiveTargetSurface(surf.id);
                      setIsMobileMenuOpen(true);
                    }}
                    className={`chip-surface-btn ${isTarget ? 'active' : ''} ${isApplied ? 'applied' : ''}`}
                    title={`${surf.name} kaplamasını seç & değiştir`}
                  >
                    {isApplied ? '✓ ' : '+ '}
                    {surf.shortName || surf.name.split(' ')[0]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Collapsible Bottom Showroom Dock (Görsel Tasarımı Tam Gösteren Gizlenebilir Menü) */}
          <div className={`kiosk-bottom-dock ${isBottomDockCollapsed ? 'is-collapsed' : 'is-expanded'}`}>
            {/* Dock Toggle / Collapse Header Bar */}
            <div 
              className="dock-toggle-bar"
              onClick={() => setIsBottomDockCollapsed(!isBottomDockCollapsed)}
              role="button"
              tabIndex={0}
              title={isBottomDockCollapsed ? 'Tasarım Menüsünü Aç' : 'Menüyü Gizle • 3D Alanı Büyüt'}
            >
              <div className="dock-toggle-left">
                <div className="dock-pill-indicator" />
                <span className="dock-toggle-title">
                  {isBottomDockCollapsed ? '🔼 3D Tasarım & Fiyat Menüsünü Aç' : '🔽 Menüyü Gizle • 3D Tam Görünüm'}
                </span>
              </div>
              <div className="dock-toggle-right">
                {isBottomDockCollapsed ? (
                  <div className="dock-collapsed-summary">
                    <span className="dock-summary-chip">₺{discountedUnitPrice}/m²</span>
                    <span className="dock-summary-chip gold">₺{grandTotal.toLocaleString('tr-TR')}</span>
                    <ChevronUp size={16} className="dock-chevron-icon" />
                  </div>
                ) : (
                  <div className="dock-collapsed-summary">
                    <span className="dock-collapse-hint">Görsel alanı tam görmek için dokunun</span>
                    <ChevronDown size={16} className="dock-chevron-icon" />
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Dock Content Body (Tabs + Panel) */}
            {!isBottomDockCollapsed && (
              <div className="dock-content-body">
                {/* Bottom Panel Toggle Tabs (4 Profesyonel Showroom Sekmesi) */}
                <div className="bottom-panel-tabs">
                  <button
                    onClick={() => setBottomTab('design')}
                    className={`panel-tab-btn ${bottomTab === 'design' ? 'active' : ''}`}
                  >
                    <Palette size={14} />
                    <span>3D Tasarım & Donatılar</span>
                  </button>

                  <button
              onClick={() => setBottomTab('atmosphere')}
              className={`panel-tab-btn ${bottomTab === 'atmosphere' ? 'active' : ''}`}
            >
              <Sun size={14} />
              <span>Işık & Atmosfer</span>
            </button>

            <button
              onClick={() => setBottomTab('quote')}
              className={`panel-tab-btn ${bottomTab === 'quote' ? 'active' : ''}`}
            >
              <Calculator size={14} />
              <span>Metraj, İskonto & Canlı Fiyat</span>
            </button>

            <button
              onClick={() => setBottomTab('presets')}
              className={`panel-tab-btn ${bottomTab === 'presets' ? 'active' : ''}`}
            >
              <Crown size={14} />
              <span>Showroom Konseptleri</span>
            </button>
          </div>

          {/* TAB 1: 3D Tasarım & Malzeme / Donatılar */}
          {bottomTab === 'design' && (
            <div className="studio-bottom-bar">
              {/* Row 1: Mekan Tipi, Dizim Şekli, Karo Rotasyonu, Duş Camı */}
              <div className="controls-row">
                <div className="ctrl-group">
                  <span className="ctrl-label">Mekan:</span>
                  <div className="btn-group-sm">
                    {[
                      { id: 'bathroom', label: 'Banyo' },
                      { id: 'livingroom', label: 'Salon' },
                      { id: 'kitchen', label: 'Mutfak' },
                      { id: 'terrace', label: 'Teras' }
                    ].map(r => (
                      <button
                        key={r.id}
                        onClick={() => handleRoomTypeChange(r.id)}
                        className={`btn-sm ${roomType === r.id ? 'active' : ''}`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="ctrl-group">
                  <span className="ctrl-label">Dizim:</span>
                  <div className="btn-group-sm">
                    {[
                      { id: 'flat', label: 'Düz Grid' },
                      { id: 'diagonal', label: 'Çapraz 45°' },
                      { id: 'herringbone', label: 'Balıksırtı' },
                      { id: 'staggered_50', label: 'Tuğla %50' }
                    ].map(pat => (
                      <button
                        key={pat.id}
                        onClick={() => setLayPattern(pat.id)}
                        className={`btn-sm ${layPattern === pat.id ? 'active-gold' : ''}`}
                      >
                        {pat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Karo Çevirme (0° / 90°) */}
                <div className="ctrl-group">
                  <span className="ctrl-label">Karo Yönü:</span>
                  <button
                    onClick={() => {
                      const nextRot = tileRotation === 0 ? 90 : 0;
                      setTileRotation(nextRot);
                      showTouchFeedback(`✓ Karo yönü ${nextRot}° yapıldı`);
                    }}
                    className={`btn-sm ${tileRotation === 90 ? 'active-gold' : ''}`}
                    title="Karo döşeme yönünü 90 derece çevir"
                  >
                    <RotateCw size={12} />
                    <span>{tileRotation === 90 ? '90° Yatay' : '0° Dikey'}</span>
                  </button>
                </div>

                {/* Duşakabin Camı Seçenekleri (Banyoda) */}
                {roomType === 'bathroom' && (
                  <div className="ctrl-group">
                    <span className="ctrl-label">Duş Camı:</span>
                    <div className="btn-group-sm">
                      {[
                        { id: 'clear', icon: '💎', label: 'Şeffaf' },
                        { id: 'smoke', icon: '🌫️', label: 'Füme' },
                        { id: 'bronze', icon: '✨', label: 'Bronz' },
                        { id: 'frosted', icon: '❄️', label: 'Buzlu' },
                        { id: 'grid', icon: '🏁', label: 'Grid' }
                      ].map(g => (
                        <button
                          key={g.id}
                          onClick={() => {
                            setShowerGlass(g.id);
                            showTouchFeedback(`Cam: ${g.label} uygulandı`);
                          }}
                          className={`btn-sm ${showerGlass === g.id ? 'active-gold' : ''}`}
                          title={g.label}
                        >
                          <span>{g.icon}</span>
                          <span>{g.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Row 2: Derz Rengi, Derz Kalınlığı, Armatür & Mobilya */}
              <div className="controls-row">
                <div className="ctrl-group">
                  <span className="ctrl-label">Derz Rengi:</span>
                  <div className="color-swatches">
                    {[
                      { color: '#ffffff', label: 'Beyaz' },
                      { color: '#888888', label: 'Gri' },
                      { color: '#333333', label: 'Antrasit' },
                      { color: '#d8cbb8', label: 'Bej' },
                      { color: '#d4af37', label: 'Altın' }
                    ].map(g => (
                      <button
                        key={g.color}
                        onClick={() => setGroutColor(g.color)}
                        style={{ background: g.color }}
                        className={`swatch-btn ${groutColor === g.color ? 'active' : ''}`}
                        title={g.label}
                      />
                    ))}
                  </div>
                </div>

                <div className="ctrl-group">
                  <span className="ctrl-label">Derz:</span>
                  <div className="btn-group-sm">
                    {['1', '2', '3', '5'].map(w => (
                      <button
                        key={w}
                        onClick={() => setGroutWidth(w)}
                        className={`btn-sm ${groutWidth === w ? 'active-gold' : ''}`}
                      >
                        {w} mm
                      </button>
                    ))}
                  </div>
                </div>

                <div className="ctrl-group">
                  <span className="ctrl-label">Armatür:</span>
                  <div className="btn-group-sm">
                    {[
                      { id: 'chrome', label: 'Krom' },
                      { id: 'black', label: 'Mat Siyah' },
                      { id: 'gold', label: 'Gold' },
                      { id: 'rosegold', label: 'Rose Gold' }
                    ].map(f => (
                      <button
                        key={f.id}
                        onClick={() => setFaucetColor(f.id)}
                        className={`btn-sm ${faucetColor === f.id ? 'active' : ''}`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="ctrl-group">
                  <span className="ctrl-label">Mobilya:</span>
                  <div className="btn-group-sm">
                    {[
                      { id: 'oak', label: 'Doğal Meşe' },
                      { id: 'white', label: 'Beyaz Lake' },
                      { id: 'anthracite', label: 'Antrasit' },
                      { id: 'walnut', label: 'Vizon Ceviz' }
                    ].map(c => (
                      <button
                        key={c.id}
                        onClick={() => setCabinetColor(c.id)}
                        className={`btn-sm ${cabinetColor === c.id ? 'active' : ''}`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Işık & Atmosfer */}
          {bottomTab === 'atmosphere' && (
            <div className="studio-bottom-bar">
              <div className="controls-row">
                <div className="ctrl-group">
                  <span className="ctrl-label">Zaman / Gökyüzü:</span>
                  <div className="btn-group-sm">
                    {[
                      { id: 'day', label: '☀️ Gündüz' },
                      { id: 'sunrise', label: '🌅 Gündoğumu' },
                      { id: 'sunset', label: '🌇 Günbatımı' },
                      { id: 'night', label: '🌙 Gece' }
                    ].map(tod => (
                      <button
                        key={tod.id}
                        onClick={() => setTimeOfDay(tod.id)}
                        className={`btn-sm ${timeOfDay === tod.id ? 'active-sky' : ''}`}
                      >
                        {tod.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="ctrl-group">
                  <span className="ctrl-label">Işık Sıcaklığı:</span>
                  <div className="btn-group-sm">
                    {[
                      { id: 'neutral', label: '⚪ Doğal Günışığı (4000K)' },
                      { id: 'warm', label: '🟡 Sıcak Amber (3000K)' },
                      { id: 'cool', label: '🔵 Modern Soğuk (6000K)' }
                    ].map(lt => (
                      <button
                        key={lt.id}
                        onClick={() => setLightTemp(lt.id)}
                        className={`btn-sm ${lightTemp === lt.id ? 'active-gold' : ''}`}
                      >
                        {lt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="ctrl-group">
                  <span className="ctrl-label">Aydınlatma Parlaklığı:</span>
                  <div className="slider-box" style={{ width: '130px' }}>
                    <input
                      type="range"
                      min="0.4"
                      max="2.0"
                      step="0.1"
                      value={lightIntensity}
                      onChange={(e) => setLightIntensity(parseFloat(e.target.value))}
                      className="kiosk-range-slider"
                    />
                    <span className="area-text">{Math.round(lightIntensity * 100)}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Metraj, İskonto & Canlı Fiyatlandırma */}
          {bottomTab === 'quote' && (
            <div className="sales-bottom-bar">
              {/* Row 1: Hızlı Metraj, Liste Fiyatı & Bayi İskontosu */}
              <div className="controls-row">
                <div className="ctrl-group">
                  <span className="ctrl-label">Alan (m²):</span>
                  <div className="btn-group-sm">
                    {[
                      { m2: 12, label: '12 m²' },
                      { m2: 18, label: '18 m²' },
                      { m2: 25, label: '25 m²' },
                      { m2: 45, label: '45 m²' }
                    ].map(tpl => (
                      <button
                        key={tpl.m2}
                        onClick={() => setAreaM2(tpl.m2)}
                        className={`btn-sm ${areaM2 === tpl.m2 ? 'active-gold' : ''}`}
                      >
                        {tpl.label}
                      </button>
                    ))}
                  </div>
                  <div className="slider-box" style={{ width: '100px' }}>
                    <input
                      type="range"
                      min="5"
                      max="150"
                      value={areaM2}
                      onChange={(e) => setAreaM2(Number(e.target.value))}
                      className="kiosk-range-slider"
                    />
                    <span className="area-text">{areaM2} m²</span>
                  </div>
                </div>

                <div className="ctrl-group">
                  <span className="ctrl-label">Liste Fiyatı:</span>
                  <div className="price-input-box">
                    <input
                      type="number"
                      value={unitPriceM2}
                      onChange={(e) => setUnitPriceM2(e.target.value)}
                      className="kiosk-num-input"
                    />
                    <span className="unit-label">₺/m²</span>
                  </div>
                </div>

                <div className="ctrl-group">
                  <span className="ctrl-label" style={{ color: '#4ade80' }}>
                    <Percent size={11} style={{ display: 'inline', marginRight: '2px' }} />
                    Bayi İskontosu:
                  </span>
                  <div className="btn-group-sm">
                    {[0, 10, 15, 20, 25].map(disc => (
                      <button
                        key={disc}
                        onClick={() => setDealerDiscountPercent(disc)}
                        className={`btn-sm ${dealerDiscountPercent === disc ? 'active-green' : ''}`}
                      >
                        {disc === 0 ? 'Net %0' : `-%${disc}`}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="ctrl-group">
                  <span className="ctrl-label">Dizim Fire %:</span>
                  <div className="btn-group-sm">
                    {[
                      { id: 'duz', label: 'Düz (%8)' },
                      { id: 'capraz', label: 'Çapraz (%12)' },
                      { id: 'baliksirti', label: 'Balıksırtı (%15)' }
                    ].map(style => (
                      <button
                        key={style.id}
                        onClick={() => setLayingStyle(style.id)}
                        className={`btn-sm ${layingStyle === style.id ? 'active-sky' : ''}`}
                      >
                        {style.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Row 2: Sarfiyat, Hizmetler, Toplam & Aksiyonlar */}
              <div className="totals-row">
                <div className="summary-pills">
                  <div className="sum-pill">
                    <span className="sum-title">Gereken Seramik</span>
                    <span className="sum-val">{totalM2WithWaste} m² ({requiredBoxes} Kutu)</span>
                  </div>
                  <div className="divider-v" />
                  <div className="sum-pill">
                    <span className="sum-title">Sarfiyat (Harç/Derz)</span>
                    <span className="sum-val">{adhesiveBags} Çuval / {groutPacks} Paket</span>
                  </div>
                  <div className="divider-v" />
                  
                  {/* Ustalık İşçilik Toggle */}
                  <div className="hizmet-box">
                    <button
                      onClick={() => setIncludeLabor(!includeLabor)}
                      className={`toggle-hizmet ${includeLabor ? 'active-green' : ''}`}
                    >
                      <Wrench size={13} />
                      <span>{includeLabor ? 'Ustalık Dahil' : '+ Ustalık'}</span>
                    </button>
                    {includeLabor && (
                      <input
                        type="number"
                        value={laborRatePerM2}
                        onChange={(e) => setLaborRatePerM2(e.target.value)}
                        className="kiosk-num-input-sm"
                        title="Ustalık ₺/m² bedeli"
                      />
                    )}
                  </div>

                  {/* Nakliye Toggle */}
                  <div className="hizmet-box">
                    <button
                      onClick={() => setIncludeShipping(!includeShipping)}
                      className={`toggle-hizmet ${includeShipping ? 'active-sky' : ''}`}
                    >
                      <Truck size={13} />
                      <span>{includeShipping ? 'Nakliye Dahil' : '+ Nakliye'}</span>
                    </button>
                    {includeShipping && (
                      <input
                        type="number"
                        value={shippingCostInput}
                        onChange={(e) => setShippingCostInput(e.target.value)}
                        className="kiosk-num-input-sm"
                        title="Nakliye ₺ tutarı"
                      />
                    )}
                  </div>

                  {/* KDV Dahil/Hariç Toggle */}
                  <button
                    onClick={() => setIsVatIncluded(!isVatIncluded)}
                    className="btn-sm"
                    style={{
                      background: isVatIncluded ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                      borderColor: isVatIncluded ? '#38bdf8' : '#334155',
                      color: isVatIncluded ? '#38bdf8' : '#94a3b8',
                      fontWeight: '800'
                    }}
                  >
                    {isVatIncluded ? 'KDV Dahil (%20)' : 'KDV Hariç'}
                  </button>
                </div>

                {/* Total Price & CTA Buttons */}
                <div className="price-cta-box">
                  <div className="price-col">
                    <span className="price-label">
                      Tahmini Toplam {isVatIncluded ? '(KDV Dahil)' : '(KDV Hariç)'}
                      {dealerDiscountPercent > 0 && (
                        <span style={{ color: '#4ade80', marginLeft: '4px', fontWeight: '800' }}>
                          (-₺{totalDiscountSavings.toLocaleString('tr-TR')} İskonto)
                        </span>
                      )}
                    </span>
                    <span className="price-val">₺{grandTotal.toLocaleString('tr-TR')}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() => setShowWhatsAppModal(true)}
                      className="btn-cta-whatsapp"
                      title="Müşteriye WhatsApp teklif mesajı gönder"
                    >
                      <Send size={15} />
                      <span>WhatsApp Teklifi</span>
                    </button>

                    <button onClick={handleOpenQuoteModal} className="btn-cta-pdf">
                      <FileText size={15} />
                      <span>PDF Teklif Çıkar</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Hazır Showroom Konseptleri */}
          {bottomTab === 'presets' && (
            <div className="studio-bottom-bar presets-bar">
              <div className="presets-cards-grid">
                {SHOWROOM_PRESETS.map(preset => (
                  <div
                    key={preset.id}
                    onClick={() => handleApplyShowroomPreset(preset)}
                    className="showroom-preset-card"
                  >
                    <div className="preset-card-top">
                      <span className="preset-icon">{preset.icon}</span>
                      <span className="preset-badge" style={{ borderColor: preset.accentColor, color: preset.accentColor }}>
                        {preset.badge}
                      </span>
                    </div>
                    <h4 className="preset-title">{preset.title}</h4>
                    <p className="preset-desc">{preset.desc}</p>
                    <button className="preset-apply-btn">
                      <span>Uygula & Canlandır</span>
                      <ChevronRight size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QR Code Download Modal */}
      {showQrModal && (
        <div className="kiosk-modal-backdrop">
          <div className="kiosk-modal-card">
            <button onClick={() => setShowQrModal(false)} className="btn-modal-close">
              <X size={18} />
            </button>

            <div className="qr-icon-header">
              <Smartphone size={28} />
            </div>

            <h3 className="modal-title">3D Tasarımı Telefonuna Al!</h3>
            <p className="modal-desc">
              Kameranızla QR kodu okutarak hazırladığınız 3D banyo seramik tasarımını kendi cep telefonunuzda inceleyebilirsiniz.
            </p>

            <div className="qr-img-box">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent('https://www.seramikbak.com/kiosk')}`}
                alt="Showroom QR"
                className="qr-img"
              />
            </div>

            <button onClick={() => setShowQrModal(false)} className="btn-modal-confirm">
              Anlaşıldı, Kapat
            </button>
          </div>
        </div>
      )}

      {/* Official Editable Quote Modal */}
      {showQuoteModal && (
        <QuoteModal
          isOpen={showQuoteModal}
          onClose={() => setShowQuoteModal(false)}
          selectedProduct={selectedProduct}
          selectedDealer={selectedDealer}
          snapshotUrl={snapshotUrl}
          calculationData={{
            areaM2,
            wastePercent,
            totalM2WithWaste,
            requiredBoxes,
            unitPriceM2: unitPriceNum,
            tileCost,
            includeAdhesive: true,
            adhesiveBags,
            adhesiveCost,
            includeGrout: true,
            groutPacks,
            groutCost,
            includeLabor,
            laborCost,
            includeShipping,
            shippingCost,
            subtotal: subtotalBeforeVat,
            vatAmount,
            grandTotal
          }}
        />
      )}

      {/* WhatsApp Quote Share Modal */}
      {showWhatsAppModal && (
        <div className="kiosk-modal-backdrop" onClick={() => setShowWhatsAppModal(false)}>
          <div className="kiosk-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px' }}>
            <button onClick={() => setShowWhatsAppModal(false)} className="btn-modal-close">
              <X size={18} />
            </button>
            <div className="qr-icon-header" style={{ background: 'rgba(34, 197, 94, 0.15)', borderColor: 'rgba(34, 197, 94, 0.4)', color: '#4ade80' }}>
              <Send size={26} />
            </div>
            <h3 className="modal-title">Müşteriye WhatsApp Teklifi Gönder</h3>
            <p className="modal-desc">
              Showroom'da hazırladığınız 3D tasarım ve fiyat teklifini müşterinizin cep telefonuna WhatsApp mesajı olarak iletin.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', margin: '14px 0', textAlign: 'left' }}>
              <div>
                <label style={{ fontSize: '0.70rem', color: '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>Müşteri Adı Soyadı</label>
                <input
                  type="text"
                  placeholder="Örn: Ahmet Yılmaz"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  style={{ width: '100%', background: '#090d16', border: '1px solid #1e293b', borderRadius: '8px', padding: '9px 12px', color: '#fff', fontSize: '0.85rem', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.70rem', color: '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>Müşteri Cep Telefonu</label>
                <input
                  type="tel"
                  placeholder="05XX XXX XX XX"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  style={{ width: '100%', background: '#090d16', border: '1px solid #1e293b', borderRadius: '8px', padding: '9px 12px', color: '#fff', fontSize: '0.85rem', outline: 'none' }}
                />
              </div>
              <div style={{ background: '#090d16', border: '1px solid #1e293b', borderRadius: '8px', padding: '10px', fontSize: '0.72rem', color: '#cbd5e1', lineHeight: '1.4' }}>
                <strong style={{ color: '#4ade80', display: 'block', marginBottom: '4px' }}>📋 Gönderilecek Teklif Özeti:</strong>
                • Ürün: <strong>{selectedProduct?.name || 'Seçili Seramik'}</strong><br />
                • Kaplanacak Alan: {areaM2} m² (Fire Dahil: {totalM2WithWaste} m²)<br />
                • Birim Fiyat: {discountedUnitPrice} ₺/m² {dealerDiscountPercent > 0 && <span style={{ color: '#4ade80' }}>(% {dealerDiscountPercent} Bayi İskontosu)</span>}<br />
                • Toplam Tutar: <strong>₺{grandTotal.toLocaleString('tr-TR')}</strong> (KDV {isVatIncluded ? 'Dahil' : 'Hariç'})
              </div>
            </div>
            <button
              onClick={() => {
                const dealerName = selectedDealer?.name || 'Yetkili Showroom';
                const cleanPhone = customerPhone.replace(/\D/g, '');
                const targetPhone = cleanPhone.startsWith('90') ? cleanPhone : cleanPhone.startsWith('0') ? '9' + cleanPhone : cleanPhone.length === 10 ? '90' + cleanPhone : cleanPhone;
                const msg = `Sayın ${customerName ? customerName : 'Müşterimiz'},\n\n${dealerName} yetkili showroomumuzda hazırladığımız 3D Sanal Stüdyo Seramik Tasarımınız ve Fiyat Teklifiniz:\n\n📌 Seçilen Model: ${selectedProduct?.name || 'Seramik'}\n📐 Alan: ${areaM2} m² (Fire ile ${totalM2WithWaste} m² - ${requiredBoxes} Kutu)\n💰 Birim Fiyat: ${discountedUnitPrice} ₺/m² ${dealerDiscountPercent > 0 ? `(%${dealerDiscountPercent} İskonto uygulandı)` : ''}\n💵 Toplam Tutar: ₺${grandTotal.toLocaleString('tr-TR')} (KDV ${isVatIncluded ? 'Dahil' : 'Hariç'})\n\n🔗 3D Showroom Modellerimizi Online İnceleyin:\nhttps://www.seramikbak.com/kiosk${selectedDealer?.id ? `?dealerId=${selectedDealer.id}` : ''}\n\nİyi günler dileriz.`;
                const url = targetPhone ? `https://wa.me/${targetPhone}?text=${encodeURIComponent(msg)}` : `https://wa.me/?text=${encodeURIComponent(msg)}`;
                window.open(url, '_blank');
                setShowWhatsAppModal(false);
                showTouchFeedback('✓ WhatsApp teklif mesajı açıldı');
              }}
              style={{ width: '100%', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <Send size={16} />
              <span>WhatsApp ile Gönder</span>
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .kiosk-page-container {
          height: 100vh;
          max-height: 100vh;
          background: #090d16;
          color: #ffffff;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .kiosk-loading-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 450px;
          background: #0f172a;
          color: #94a3b8;
          border-radius: 20px;
          border: 1px solid #1e293b;
          padding: 24px;
        }

        .kiosk-spin-loader {
          width: 44px;
          height: 44px;
          border: 4px solid #f59e0b;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .kiosk-header {
          height: 52px;
          flex-shrink: 0;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid #1e293b;
          padding: 6px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          z-index: 20;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .kiosk-nav-btn {
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 6px !important;
          padding: 0 12px !important;
          height: 36px !important;
          border-radius: 9px !important;
          font-weight: 800 !important;
          font-size: 0.78rem !important;
          text-decoration: none !important;
          white-space: nowrap !important;
          flex-shrink: 0 !important;
          backdrop-filter: blur(12px) !important;
          transition: all 0.2s ease !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2) !important;
        }

        .btn-nav-bayi {
          background: rgba(212, 175, 55, 0.15) !important;
          border: 1px solid rgba(212, 175, 55, 0.4) !important;
          color: #f3d375 !important;
        }

        .btn-nav-bayi:hover {
          background: #f59e0b !important;
          color: #0f172a !important;
          transform: translateY(-1px);
        }

        .btn-nav-exit {
          background: rgba(239, 68, 68, 0.15) !important;
          border: 1px solid rgba(239, 68, 68, 0.35) !important;
          color: #fca5a5 !important;
        }

        .btn-nav-exit:hover {
          background: #ef4444 !important;
          color: #ffffff !important;
          transform: translateY(-1px);
        }

        .btn-label-desktop {
          display: inline;
        }

        .btn-label-mobile {
          display: none;
        }

        /* Center Symmetrical Capsule */
        .header-center {
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 1;
          min-width: 0;
        }

        .header-showroom-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(15, 23, 42, 0.85);
          border: 1px solid rgba(245, 158, 11, 0.35);
          padding: 5px 14px;
          border-radius: 20px;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
          max-width: 100%;
        }

        .showroom-crown-icon {
          color: #fbbf24;
          flex-shrink: 0;
        }

        .showroom-text-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
          overflow: hidden;
          white-space: nowrap;
        }

        .showroom-brand-name {
          font-weight: 900;
          font-size: 0.92rem;
          color: #ffffff;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .showroom-tag-badge {
          background: rgba(245, 158, 11, 0.2);
          border: 1px solid rgba(245, 158, 11, 0.4);
          color: #fbbf24;
          font-size: 0.62rem;
          font-weight: 800;
          text-transform: uppercase;
          padding: 2px 7px;
          border-radius: 12px;
          flex-shrink: 0;
        }

        .brand-badge {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: #0f172a;
          font-weight: 900;
          font-size: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
        }

        .brand-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .brand-title {
          font-size: 1.15rem;
          font-weight: 900;
          color: #ffffff;
          margin: 0;
          letter-spacing: -0.02em;
        }

        .gold-accent {
          color: #fbbf24;
        }

        .kiosk-pill {
          background: rgba(245, 158, 11, 0.15);
          border: 1px solid rgba(245, 158, 11, 0.35);
          color: #fbbf24;
          font-size: 0.6rem;
          font-weight: 800;
          text-transform: uppercase;
          padding: 2px 8px;
          border-radius: 20px;
        }

        .dealer-sub-text {
          font-size: 0.68rem;
          color: #94a3b8;
          margin: 1px 0 0 0;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-mode-kiosk {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #090d16;
          border: 1px solid #1e293b;
          color: #94a3b8;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 6px 12px;
          border-radius: 8px;
          cursor: pointer;
        }

        .btn-mode-kiosk.active-gold {
          background: rgba(245, 158, 11, 0.2);
          color: #fbbf24;
          border-color: #f59e0b;
        }

        .btn-secondary-kiosk {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #1e293b;
          color: #e2e8f0;
          border: 1px solid #334155;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 0.72rem;
          font-weight: 700;
          cursor: pointer;
        }

        .btn-primary-gold-kiosk {
          display: flex;
          align-items: center;
          gap: 6px;
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: #0f172a;
          border: none;
          padding: 7px 16px;
          border-radius: 8px;
          font-size: 0.72rem;
          font-weight: 900;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
        }

        .btn-icon-kiosk {
          background: #1e293b;
          color: #94a3b8;
          border: none;
          padding: 7px;
          border-radius: 8px;
          cursor: pointer;
        }

        /* Fixed Viewport Grid */
        .kiosk-workspace-grid {
          flex: 1;
          height: calc(100vh - 56px);
          min-height: 0;
          display: grid;
          grid-template-columns: 360px 1fr;
          overflow: hidden;
          transition: grid-template-columns 0.3s ease;
        }

        .kiosk-workspace-grid.presentation-mode {
          grid-template-columns: 1fr;
        }

        .kiosk-workspace-grid.presentation-mode .kiosk-sidebar {
          display: none;
        }

        /* Left Sidebar: Fixed Container */
        .kiosk-sidebar {
          height: 100%;
          max-height: 100%;
          min-height: 0;
          background: #0f172a;
          border-right: 1px solid #1e293b;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          overflow: hidden;
        }

        .sidebar-top-controls {
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .section-label-header {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.68rem;
          font-weight: 800;
          color: #fbbf24;
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }

        .icon-gold {
          color: #f59e0b;
        }

        .surface-target-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3px;
          background: #090d16;
          padding: 3px;
          border-radius: 8px;
          border: 1px solid #1e293b;
        }

        .surface-card-btn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 3px 5px;
          border-radius: 5px;
          background: #0f172a;
          border: 1px solid #1e293b;
          cursor: pointer;
          transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .surface-card-btn:hover {
          border-color: rgba(245, 158, 11, 0.4);
          background: #151f32;
        }

        .surface-card-btn.is-target {
          border: 1px solid #f59e0b;
          background: rgba(245, 158, 11, 0.15);
          box-shadow: 0 0 8px rgba(245, 158, 11, 0.2);
        }

        .surface-info-col {
          display: flex;
          flex-direction: column;
          gap: 0px;
        }

        .surface-title-row {
          display: flex;
          align-items: center;
          gap: 3px;
        }

        .surface-name {
          font-size: 0.68rem;
          font-weight: 800;
          color: #f8fafc;
        }

        .target-indicator-dot {
          font-size: 0.65rem;
        }

        .tile-applied-tag {
          font-size: 0.60rem;
          font-weight: 800;
          color: #4ade80;
        }

        .tile-empty-tag {
          font-size: 0.58rem;
          color: #64748b;
        }

        .btn-clear-tile {
          display: flex;
          align-items: center;
          gap: 3px;
          background: rgba(239, 68, 68, 0.18);
          border: 1px solid rgba(239, 68, 68, 0.4);
          color: #fca5a5;
          border-radius: 6px;
          padding: 3px 8px;
          font-size: 0.65rem;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .btn-clear-tile:hover {
          background: #ef4444;
          color: #ffffff;
        }

        .btn-select-target {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.14);
          color: #94a3b8;
          border-radius: 6px;
          padding: 3px 9px;
          font-size: 0.68rem;
          font-weight: 700;
          cursor: pointer;
        }

        .btn-select-target.active {
          background: #f59e0b;
          border-color: #f59e0b;
          color: #0f172a;
          font-weight: 900;
        }

        .brand-select-wrapper {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .kiosk-brand-dropdown {
          background: #090d16;
          border: 1px solid #f59e0b;
          color: #fbbf24;
          font-size: 0.8rem;
          font-weight: 800;
          padding: 8px 10px;
          border-radius: 8px;
          outline: none;
          cursor: pointer;
          box-shadow: 0 0 8px rgba(245, 158, 11, 0.15);
        }

        .search-box-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 10px;
          color: #64748b;
        }

        .search-input {
          width: 100%;
          background: #090d16;
          border: 1px solid #1e293b;
          color: #ffffff;
          font-size: 0.72rem;
          padding: 7px 10px 7px 30px;
          border-radius: 8px;
          outline: none;
        }

        .filter-pills-row {
          display: flex;
          gap: 4px;
          overflow-x: auto;
          padding-bottom: 2px;
        }

        .filter-pill {
          background: #090d16;
          border: 1px solid #1e293b;
          color: #94a3b8;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 0.68rem;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
        }

        .filter-pill.active {
          background: #1e293b;
          color: #fbbf24;
          border-color: rgba(245, 158, 11, 0.4);
        }

        /* Products Grid: Scrolls independently without stretching the viewport! */
        .products-scroll-grid {
          flex: 1;
          min-height: 0;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          overflow-y: auto;
          padding-right: 2px;
          align-content: start;
        }

        .kiosk-spin-loader-sm {
          width: 16px;
          height: 16px;
          border: 2px solid #f59e0b;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .kiosk-infinite-loading-pill {
          grid-column: span 2;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 8px 12px;
          background: rgba(15, 23, 42, 0.9);
          border: 1px solid rgba(245, 158, 11, 0.35);
          border-radius: 20px;
          color: #fbbf24;
          font-size: 0.74rem;
          font-weight: 700;
          margin: 6px 0;
        }

        .kiosk-load-more-btn {
          grid-column: span 2;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px 14px;
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 8px;
          color: #94a3b8;
          font-size: 0.72rem;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s ease;
          margin: 6px 0;
        }

        .kiosk-load-more-btn:hover {
          background: #f59e0b;
          color: #0f172a;
          border-color: #f59e0b;
        }

        .kiosk-infinite-end-pill {
          grid-column: span 2;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px 12px;
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.3);
          border-radius: 8px;
          color: #4ade80;
          font-size: 0.70rem;
          font-weight: 700;
          margin: 6px 0;
        }

        .product-touch-card {
          background: #090d16;
          border: 1px solid #1e293b;
          border-radius: 10px;
          padding: 6px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 4px;
          transition: all 0.15s ease;
        }

        .product-touch-card.active {
          border-color: #f59e0b;
          box-shadow: 0 0 12px rgba(245, 158, 11, 0.35);
          background: #141c2e;
        }

        .card-thumb-wrapper {
          height: 85px;
          background: #1e293b;
          border-radius: 6px;
          overflow: hidden;
          position: relative;
        }

        .card-thumb-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .tag-badges {
          position: absolute;
          top: 3px;
          left: 3px;
          display: flex;
          gap: 3px;
        }

        .tag-floor {
          background: #f59e0b;
          color: #0f172a;
          font-size: 0.5rem;
          font-weight: 900;
          padding: 1px 5px;
          border-radius: 4px;
        }

        .tag-wall {
          background: #0284c7;
          color: #ffffff;
          font-size: 0.5rem;
          font-weight: 900;
          padding: 1px 5px;
          border-radius: 4px;
        }

        .tag-shower {
          background: #10b981;
          color: #ffffff;
          font-size: 0.5rem;
          font-weight: 900;
          padding: 1px 5px;
          border-radius: 4px;
        }

        .kiosk-offline-pill-badge {
          background: rgba(245, 158, 11, 0.15);
          border: 1px solid rgba(245, 158, 11, 0.4);
          color: #fbbf24;
          font-size: 0.68rem;
          font-weight: 800;
          padding: 6px 12px;
          border-radius: 20px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          backdrop-filter: blur(8px);
        }


        .card-info {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }

        .brand-name-pill {
          font-size: 0.58rem;
          color: #f59e0b;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }

        .product-title {
          font-size: 0.7rem;
          font-weight: 800;
          color: #ffffff;
          margin: 0;
          line-height: 1.2;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .product-specs {
          font-size: 0.62rem;
          color: #94a3b8;
          margin: 0;
        }

        /* Right Canvas Area: Fixed height */
        .kiosk-canvas-area {
          height: 100%;
          max-height: 100%;
          min-height: 0;
          background: #090d16;
          padding: 10px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          overflow: hidden;
        }

        .canvas-frame {
          flex: 1;
          min-height: 0;
          background: #090d16;
          border: 1px solid #1e293b;
          border-radius: 14px;
          overflow: hidden;
          position: relative;
        }

        /* Kiosk Extra Canvas Floating Controls */
        .kiosk-extra-top-left, .kiosk-extra-top-right {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .canvas-mobile-floating-menu-btn {
          display: none;
          align-items: center;
          gap: 5px;
          background: rgba(15, 23, 42, 0.92);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid #f59e0b;
          color: #fbbf24;
          font-weight: 800;
          font-size: 0.72rem;
          padding: 5px 10px;
          border-radius: 8px;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .canvas-mobile-floating-menu-btn:hover {
          background: #f59e0b;
          color: #0f172a;
          transform: translateY(-1px);
        }

        .canvas-active-target-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(15, 23, 42, 0.90);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(245, 158, 11, 0.35);
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 0.72rem;
          color: #f8fafc;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          white-space: nowrap;
        }

        .pill-target-name {
          font-weight: 800;
          color: #fbbf24;
        }

        .pill-remove-btn {
          background: rgba(239, 68, 68, 0.2);
          border: 1px solid rgba(239, 68, 68, 0.5);
          color: #fca5a5;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.60rem;
          cursor: pointer;
          padding: 0;
          transition: all 0.15s ease;
        }

        .pill-remove-btn:hover {
          background: #ef4444;
          color: #ffffff;
        }

        .canvas-focus-toggle-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: rgba(15, 23, 42, 0.90);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(56, 189, 248, 0.4);
          color: #38bdf8;
          padding: 5px 11px;
          border-radius: 8px;
          font-size: 0.72rem;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35);
          transition: all 0.2s ease;
        }

        .canvas-focus-toggle-btn:hover {
          background: rgba(56, 189, 248, 0.15);
          transform: translateY(-1px);
        }

        .canvas-focus-toggle-btn.active-gold {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          border-color: #f59e0b;
          color: #0f172a;
          box-shadow: 0 4px 16px rgba(245, 158, 11, 0.4);
        }

        .canvas-expand-touch-btn {
          background: rgba(15, 23, 42, 0.90);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #94a3b8;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .canvas-expand-touch-btn:hover {
          background: #1e293b;
          color: #ffffff;
          border-color: #f59e0b;
        }

        /* Collapsible Bottom Showroom Dock */
        .kiosk-bottom-dock {
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          background: #0f172a;
          border: 1px solid #1e293b;
          border-radius: 12px;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: hidden;
        }

        .kiosk-bottom-dock.is-collapsed {
          background: rgba(15, 23, 42, 0.96);
          border-color: rgba(245, 158, 11, 0.4);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        }

        .dock-toggle-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 14px;
          background: linear-gradient(90deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          cursor: pointer;
          user-select: none;
          transition: background 0.2s ease;
        }

        .dock-toggle-bar:hover {
          background: rgba(30, 41, 59, 0.95);
        }

        .dock-toggle-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .dock-pill-indicator {
          width: 28px;
          height: 4px;
          background: #f59e0b;
          border-radius: 2px;
          opacity: 0.85;
        }

        .dock-toggle-title {
          font-size: 0.74rem;
          font-weight: 800;
          color: #f8fafc;
          letter-spacing: 0.01em;
        }

        .dock-toggle-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .dock-collapsed-summary {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .dock-summary-chip {
          background: #090d16;
          border: 1px solid #334155;
          color: #94a3b8;
          font-size: 0.68rem;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: 6px;
        }

        .dock-summary-chip.gold {
          border-color: #f59e0b;
          color: #fbbf24;
        }

        .dock-collapse-hint {
          font-size: 0.64rem;
          color: #64748b;
          font-weight: 600;
        }

        .dock-chevron-icon {
          color: #f59e0b;
        }

        .dock-content-body {
          display: flex;
          flex-direction: column;
          animation: dockFadeIn 0.2s ease;
        }

        @keyframes dockFadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .bottom-panel-tabs {
          display: flex;
          gap: 6px;
          flex-shrink: 0;
          padding: 0 10px;
        }

        .panel-tab-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #0f172a;
          border: 1px solid #1e293b;
          color: #94a3b8;
          font-size: 0.7rem;
          font-weight: 800;
          padding: 5px 12px;
          border-radius: 8px 8px 0 0;
          cursor: pointer;
        }

        .panel-tab-btn.active {
          background: #1e293b;
          color: #fbbf24;
          border-color: #f59e0b;
          border-bottom-color: transparent;
        }

        .studio-bottom-bar, .sales-bottom-bar {
          flex-shrink: 0;
          background: #0f172a;
          border: 1px solid #1e293b;
          border-radius: 0 10px 14px 14px;
          padding: 10px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .controls-row {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .ctrl-group {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .ctrl-label {
          font-size: 0.65rem;
          color: #94a3b8;
          font-weight: 800;
          text-transform: uppercase;
        }

        .btn-group-sm {
          display: flex;
          gap: 3px;
        }

        .btn-sm {
          background: #090d16;
          border: 1px solid #1e293b;
          color: #94a3b8;
          font-size: 0.65rem;
          font-weight: 700;
          padding: 4px 8px;
          border-radius: 5px;
          cursor: pointer;
        }

        .btn-sm.active {
          background: #f59e0b;
          color: #0f172a;
          font-weight: 900;
        }

        .btn-sm.active-gold {
          background: rgba(245, 158, 11, 0.2);
          color: #fbbf24;
          border-color: #f59e0b;
          font-weight: 800;
        }

        .btn-sm.active-sky {
          background: rgba(56, 189, 248, 0.2);
          color: #38bdf8;
          border-color: #38bdf8;
          font-weight: 800;
        }

        .color-swatches {
          display: flex;
          gap: 4px;
        }

        .swatch-btn {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 2px solid #334155;
          cursor: pointer;
        }

        .swatch-btn.active {
          border-color: #f59e0b;
          transform: scale(1.12);
          box-shadow: 0 0 6px rgba(245, 158, 11, 0.5);
        }

        .price-input-box {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .kiosk-num-input {
          width: 65px;
          background: #090d16;
          border: 1px solid #334155;
          color: #fbbf24;
          font-weight: 800;
          font-size: 0.72rem;
          border-radius: 5px;
          padding: 2px 4px;
          outline: none;
          text-align: center;
        }

        .kiosk-num-input-sm {
          width: 50px;
          background: #090d16;
          border: 1px solid #334155;
          color: #ffffff;
          font-size: 0.68rem;
          border-radius: 4px;
          padding: 2px 4px;
          outline: none;
          text-align: center;
        }

        .unit-label {
          font-size: 0.62rem;
          color: #94a3b8;
        }

        .slider-box {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .kiosk-range-slider {
          accent-color: #f59e0b;
          width: 80px;
        }

        .area-text {
          font-size: 0.72rem;
          font-weight: 800;
          color: #fbbf24;
        }

        .totals-row {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          border-top: 1px dashed #1e293b;
          padding-top: 6px;
        }

        .summary-pills {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .sum-pill {
          display: flex;
          flex-direction: column;
        }

        .sum-title {
          font-size: 0.58rem;
          color: #64748b;
          font-weight: 700;
          text-transform: uppercase;
        }

        .sum-val {
          font-size: 0.7rem;
          font-weight: 800;
          color: #ffffff;
        }

        .divider-v {
          width: 1px;
          height: 20px;
          background: #1e293b;
        }

        .hizmet-box {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .toggle-hizmet {
          display: flex;
          align-items: center;
          gap: 4px;
          background: #090d16;
          border: 1px solid #1e293b;
          color: #64748b;
          padding: 3px 6px;
          border-radius: 5px;
          font-size: 0.65rem;
          font-weight: 700;
          cursor: pointer;
        }

        .toggle-hizmet.active-green {
          background: rgba(16, 185, 129, 0.15);
          color: #34d399;
          border-color: rgba(16, 185, 129, 0.4);
        }

        .toggle-hizmet.active-sky {
          background: rgba(56, 189, 248, 0.15);
          color: #38bdf8;
          border-color: rgba(56, 189, 248, 0.4);
        }

        .price-cta-box {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .price-col {
          text-align: right;
        }

        .price-label {
          display: block;
          font-size: 0.58rem;
          color: #94a3b8;
          font-weight: 700;
          text-transform: uppercase;
        }

        .price-val {
          font-size: 1rem;
          font-weight: 900;
          color: #fbbf24;
        }

        .btn-cta-pdf {
          display: flex;
          align-items: center;
          gap: 5px;
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: #0f172a;
          border: none;
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 0.72rem;
          font-weight: 900;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
          transition: all 0.2s ease;
        }

        .btn-cta-pdf:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(245, 158, 11, 0.45);
        }

        .btn-cta-whatsapp {
          display: flex;
          align-items: center;
          gap: 6px;
          background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
          color: #ffffff;
          border: none;
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 0.72rem;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(34, 197, 94, 0.35);
          transition: all 0.2s ease;
        }

        .btn-cta-whatsapp:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(34, 197, 94, 0.5);
        }

        .btn-mode-kiosk.active-purple {
          background: linear-gradient(135deg, rgba(168, 85, 247, 0.25) 0%, rgba(147, 51, 234, 0.15) 100%);
          border-color: #a855f7;
          color: #c084fc;
          font-weight: 800;
        }

        .btn-sm.active-green {
          background: rgba(34, 197, 94, 0.2);
          color: #4ade80;
          border-color: #22c55e;
          font-weight: 800;
        }

        /* Presentation Mode Floating Banner */
        .canvas-presentation-banner {
          position: absolute;
          top: 12px;
          left: 12px;
          right: 12px;
          background: rgba(15, 23, 42, 0.94);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(245, 158, 11, 0.45);
          padding: 8px 16px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
          z-index: 25;
          pointer-events: auto;
        }

        .pres-banner-left {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .pres-dealer-name {
          font-size: 0.85rem;
          font-weight: 900;
          color: #ffffff;
          letter-spacing: -0.01em;
        }

        .pres-divider {
          color: #475569;
          font-weight: 300;
        }

        .pres-prod-name {
          font-size: 0.82rem;
          font-weight: 700;
          color: #fbbf24;
        }

        .pres-price-pill {
          background: rgba(34, 197, 94, 0.15);
          border: 1px solid rgba(34, 197, 94, 0.4);
          color: #4ade80;
          padding: 2px 8px;
          border-radius: 6px;
          font-size: 0.72rem;
          font-weight: 800;
        }

        .pres-exit-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: #0f172a;
          border: none;
          border-radius: 8px;
          padding: 6px 14px;
          font-size: 0.74rem;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 2px 10px rgba(245, 158, 11, 0.3);
          transition: all 0.2s ease;
        }

        .pres-exit-btn:hover {
          transform: scale(1.03);
        }

        /* Showroom Preset Cards */
        .presets-bar {
          background: #0f172a;
          padding: 10px 14px;
        }

        .presets-cards-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }

        @media (max-width: 900px) {
          .presets-cards-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .showroom-preset-card {
          background: #090d16;
          border: 1px solid #1e293b;
          border-radius: 10px;
          padding: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .showroom-preset-card:hover {
          border-color: #f59e0b;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
        }

        .preset-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 2px;
        }

        .preset-icon {
          font-size: 1.2rem;
        }

        .preset-badge {
          font-size: 0.58rem;
          font-weight: 800;
          text-transform: uppercase;
          padding: 1px 6px;
          border-radius: 4px;
          border: 1px solid;
        }

        .preset-title {
          font-size: 0.75rem;
          font-weight: 800;
          color: #ffffff;
          margin: 0;
        }

        .preset-desc {
          font-size: 0.62rem;
          color: #94a3b8;
          margin: 0;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          flex: 1;
        }

        .preset-apply-btn {
          margin-top: 6px;
          background: rgba(245, 158, 11, 0.12);
          border: 1px solid rgba(245, 158, 11, 0.35);
          color: #fbbf24;
          font-size: 0.64rem;
          font-weight: 800;
          padding: 4px 8px;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: all 0.15s ease;
        }

        .preset-apply-btn:hover {
          background: #f59e0b;
          color: #0f172a;
        }

        /* Modal Styles */
        .kiosk-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: rgba(9, 13, 22, 0.85);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .kiosk-modal-card {
          background: #0f172a;
          border: 1px solid #1e293b;
          border-radius: 24px;
          width: 100%;
          max-width: 400px;
          padding: 24px;
          text-align: center;
          position: relative;
        }

        .btn-modal-close {
          position: absolute;
          top: 14px;
          right: 14px;
          background: #1e293b;
          color: #94a3b8;
          border: none;
          padding: 6px;
          border-radius: 50%;
          cursor: pointer;
        }

        .qr-icon-header {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: rgba(245, 158, 11, 0.15);
          color: #fbbf24;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 10px auto;
        }

        .modal-title {
          font-size: 1.1rem;
          font-weight: 800;
          color: #ffffff;
          margin: 0 0 6px 0;
        }

        .modal-desc {
          font-size: 0.72rem;
          color: #94a3b8;
          margin-bottom: 14px;
        }

        .qr-img-box {
          background: #ffffff;
          padding: 10px;
          border-radius: 14px;
          display: inline-block;
          margin-bottom: 14px;
        }

        .qr-img {
          width: 150px;
          height: 150px;
        }

        .btn-modal-confirm {
          width: 100%;
          background: #f59e0b;
          color: #0f172a;
          border: none;
          padding: 10px;
          border-radius: 8px;
          font-size: 0.78rem;
          font-weight: 900;
          cursor: pointer;
        }

        .btn-mobile-drawer-toggle {
          display: none;
        }

        .mobile-drawer-header {
          display: none;
        }

        .canvas-mobile-floating-menu-btn {
          display: none;
        }

        .canvas-mobile-surface-chips {
          display: none;
        }

        .kiosk-mobile-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(9, 13, 22, 0.8);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          z-index: 9998;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* ---------------------------------------------------- */
        /* RESPONSIVE DESIGN: TABLET & MOBILE VIEWPORTS         */
        /* ---------------------------------------------------- */

        /* Large Tablets & Laptops (<= 1024px) */
        @media (max-width: 1024px) {
          .kiosk-workspace-grid {
            grid-template-columns: 310px 1fr;
          }

          .kiosk-header {
            padding: 6px 12px;
          }

          .dealer-sub-text {
            display: none;
          }

          .brand-title {
            font-size: 1.05rem;
          }

          .btn-mode-kiosk span,
          .btn-secondary-kiosk span,
          .btn-primary-gold-kiosk span {
            font-size: 0.7rem;
          }
        }

        /* Tablets & Mobile Viewports (<= 1024px): Full 3D Viewport + Left Slide-Out Drawer */
        @media (max-width: 1024px) {
          .kiosk-pill {
            display: none !important;
          }

          .btn-mobile-drawer-toggle {
            display: flex;
            align-items: center;
            gap: 5px;
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: #0f172a;
            font-size: 0.7rem;
            font-weight: 900;
            padding: 5px 10px;
            border-radius: 8px;
            border: none;
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
            white-space: nowrap;
          }

          .kiosk-page-container {
            height: 100vh;
            max-height: 100vh;
            overflow: hidden;
            position: relative;
          }

          .kiosk-header {
            height: 46px;
            padding: 4px 8px;
            flex-wrap: nowrap;
            gap: 6px;
            justify-content: space-between;
            z-index: 20;
          }

          .header-left {
            gap: 4px;
            flex-shrink: 0;
          }

          .kiosk-nav-btn {
            height: 32px !important;
            padding: 0 8px !important;
            font-size: 0.70rem !important;
            border-radius: 7px !important;
            gap: 4px !important;
          }

          .btn-label-desktop {
            display: none !important;
          }

          .btn-label-mobile {
            display: inline !important;
          }

          /* Center Symmetrical Capsule */
          .header-center {
            padding: 0 2px;
            overflow: hidden;
            display: flex;
            justify-content: center;
          }

          .header-showroom-pill {
            padding: 3px 8px;
            gap: 5px;
            border-radius: 14px;
            max-width: 100%;
          }

          .showroom-crown-icon {
            width: 12px;
            height: 12px;
          }

          .showroom-brand-name {
            font-size: 0.74rem;
            max-width: 80px;
          }

          .showroom-tag-badge {
            display: none;
          }

          .header-right {
            overflow: visible;
            max-width: none;
            justify-content: flex-end;
            gap: 4px;
            flex-shrink: 0;
          }

          .btn-mode-kiosk,
          .btn-secondary-kiosk {
            display: none !important;
          }

          .btn-primary-gold-kiosk {
            height: 32px !important;
            padding: 0 10px !important;
            font-size: 0.70rem !important;
            border-radius: 7px !important;
            min-height: 32px;
          }

          .btn-primary-gold-kiosk span {
            font-size: 0.68rem;
          }

          .kiosk-workspace-grid {
            display: block;
            position: relative;
            height: calc(100vh - 46px);
            overflow: hidden;
          }

          /* 3D Visualizer Canvas Section on Mobile (Full Viewport Screen) */
          .kiosk-canvas-area {
            position: absolute;
            inset: 0;
            width: 100vw;
            height: 100%;
            z-index: 1;
            padding: 0;
            display: flex;
            flex-direction: column;
          }

          .canvas-frame {
            height: 100%;
            width: 100%;
            flex: 1;
            border-radius: 0;
            border: none;
            box-shadow: none;
            position: relative;
          }

          /* Touch Toast Notification Popup on 3D Canvas */
          .canvas-touch-toast {
            position: absolute;
            top: 12px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 100;
            background: rgba(15, 23, 42, 0.95);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid #f59e0b;
            color: #f8fafc;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.78rem;
            font-weight: 800;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
            display: flex;
            align-items: center;
            gap: 8px;
            animation: toastFadeInDown 0.25s cubic-bezier(0.16, 1, 0.3, 1);
            white-space: nowrap;
            pointer-events: none;
          }

          @keyframes toastFadeInDown {
            from {
              opacity: 0;
              transform: translate(-50%, -12px);
            }
            to {
              opacity: 1;
              transform: translate(-50%, 0);
            }
          }

          /* Kiosk Extra Top Controls on Mobile */
          .kiosk-extra-top-left, .kiosk-extra-top-right {
            display: flex;
            align-items: center;
            gap: 3px;
          }

          .canvas-mobile-floating-menu-btn {
            display: inline-flex !important;
            height: 28px;
            padding: 0 7px;
            font-size: 0.64rem;
            border-radius: 6px;
            align-items: center;
            gap: 3px;
          }

          .canvas-active-target-pill {
            height: 28px;
            padding: 0 6px;
            font-size: 0.62rem;
            border-radius: 6px;
            display: inline-flex;
            align-items: center;
            max-width: 80px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .canvas-focus-toggle-btn {
            height: 28px;
            padding: 0 7px;
            font-size: 0.64rem;
            border-radius: 6px;
            display: inline-flex;
            align-items: center;
            gap: 3px;
          }

          .canvas-expand-touch-btn {
            width: 28px;
            height: 28px;
            border-radius: 6px;
            padding: 0;
            display: inline-flex;
            align-items: center;
            justify-content: center;
          }

          /* Mobile Bottom Quick Surface Chips Bar */
          .canvas-mobile-surface-chips {
            display: flex;
            align-items: center;
            gap: 4px;
            overflow-x: auto;
            position: absolute;
            bottom: 8px;
            left: 8px;
            right: 8px;
            z-index: 15;
            background: rgba(15, 23, 42, 0.90);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            padding: 4px 6px;
            border-radius: 12px;
            border: 1px solid rgba(245, 158, 11, 0.3);
            -webkit-overflow-scrolling: touch;
            pointer-events: auto;
          }

          .chip-surface-btn {
            flex-shrink: 0;
            background: #090d16;
            border: 1px solid #1e293b;
            color: #94a3b8;
            font-size: 0.66rem;
            font-weight: 700;
            padding: 4px 8px;
            border-radius: 7px;
            cursor: pointer;
            white-space: nowrap;
            pointer-events: auto;
          }

          .chip-surface-btn.applied {
            background: rgba(34, 197, 94, 0.15);
            border-color: rgba(34, 197, 94, 0.5);
            color: #4ade80;
          }

          .chip-surface-btn.active {
            background: #f59e0b;
            color: #0f172a;
            border-color: #f59e0b;
            font-weight: 900;
            box-shadow: 0 2px 8px rgba(245, 158, 11, 0.4);
          }

          .chip-surface-btn.active.applied {
            background: #22c55e;
            color: #0f172a;
            border-color: #22c55e;
            font-weight: 900;
            box-shadow: 0 2px 8px rgba(34, 197, 94, 0.4);
          }

          /* Collapsible Bottom Showroom Dock on Mobile */
          .kiosk-bottom-dock {
            border-radius: 16px 16px 0 0;
            border: 1px solid rgba(245, 158, 11, 0.35);
            border-bottom: none;
            box-shadow: 0 -8px 30px rgba(0, 0, 0, 0.7);
            z-index: 30;
            max-height: 56vh;
            display: flex;
            flex-direction: column;
            flex-shrink: 0;
            transition: max-height 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          }

          .kiosk-bottom-dock.is-collapsed {
            max-height: 42px;
            border-radius: 12px 12px 0 0;
          }

          .dock-toggle-bar {
            padding: 8px 12px;
            min-height: 42px;
            flex-shrink: 0;
          }

          .dock-toggle-title {
            font-size: 0.70rem;
          }

          .dock-content-body {
            flex: 1;
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
            display: flex;
            flex-direction: column;
          }

          .bottom-panel-tabs {
            padding: 6px 6px 0;
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 4px;
            flex-shrink: 0;
            background: #090d16;
            border-bottom: 1px solid #1e293b;
          }

          .panel-tab-btn {
            border-radius: 7px;
            padding: 6px 4px;
            font-size: 0.65rem;
            justify-content: center;
            text-align: center;
            gap: 4px;
            min-height: 34px;
          }

          .panel-tab-btn.active {
            border-bottom-color: #f59e0b;
            background: #1e293b;
          }

          .studio-bottom-bar, .sales-bottom-bar {
            border-radius: 0;
            border: none;
            background: transparent;
            padding: 8px 10px;
            max-height: none;
            overflow-y: visible;
          }

          /* Left Slide-out Drawer Panel on Mobile */
          .kiosk-sidebar {
            position: fixed;
            top: 0;
            left: 0;
            bottom: 0;
            width: 88vw;
            max-width: 380px;
            height: 100vh;
            z-index: 9999;
            background: #0f172a;
            transform: translateX(-100%);
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 10px 0 30px rgba(0, 0, 0, 0.8);
            display: flex;
            flex-direction: column;
            gap: 10px;
            padding: 14px;
            overflow-y: auto;
            border-right: 1px solid #1e293b;
          }

          .kiosk-sidebar.mobile-open {
            transform: translateX(0);
          }

          .mobile-drawer-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding-bottom: 8px;
            border-bottom: 1px solid #1e293b;
            margin-bottom: 4px;
            flex-shrink: 0;
          }

          .drawer-title-row {
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: 900;
            font-size: 0.85rem;
            color: #fbbf24;
            text-transform: uppercase;
            letter-spacing: 0.02em;
          }

          .btn-close-drawer {
            background: #1e293b;
            color: #94a3b8;
            border: none;
            padding: 6px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .btn-close-drawer:active {
            background: #f59e0b;
            color: #0f172a;
          }

          .surface-step-title {
            font-size: 0.78rem;
            font-weight: 800;
            color: #fbbf24;
          }

          .active-target-badge {
            background: rgba(245, 158, 11, 0.15);
            border: 1px solid rgba(245, 158, 11, 0.4);
            color: #fbbf24;
            padding: 2px 7px;
            border-radius: 6px;
            font-size: 0.72rem;
            font-weight: 800;
          }

          .accordion-toggle-pill {
            font-size: 0.68rem;
            color: #94a3b8;
            background: #1e293b;
            padding: 3px 8px;
            border-radius: 6px;
            border: 1px solid #334155;
            font-weight: 800;
          }

          .surface-target-grid.is-collapsed-mobile {
            display: none !important;
          }

          .surface-target-grid.is-open {
            display: grid !important;
            animation: slideDownExpand 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          }

          @keyframes slideDownExpand {
            from {
              opacity: 0;
              transform: translateY(-8px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .surface-target-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 6px;
            padding: 6px;
          }

          .target-btn {
            padding: 8px 4px;
            font-size: 0.7rem;
            min-height: 38px;
          }

          .kiosk-brand-dropdown {
            padding: 7px 10px;
            font-size: 0.8rem;
            min-height: 36px;
          }

          .search-input {
            padding: 7px 10px 7px 32px;
            font-size: 0.75rem;
            min-height: 36px;
          }

          .filter-pill {
            padding: 4px 10px;
            font-size: 0.7rem;
            min-height: 30px;
          }

          .products-scroll-grid {
            flex: 1;
            min-height: 250px;
            overflow-y: auto;
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 6px;
            padding: 2px;
            content-visibility: auto;
          }

          .product-touch-card {
            padding: 5px;
            border-radius: 8px;
          }

          .card-thumb-wrapper {
            height: 75px;
            border-radius: 6px;
          }

          .studio-bottom-bar {
            padding: 10px;
            border-radius: 12px;
            width: 100%;
          }

          .sales-bottom-bar {
            padding: 14px;
            border-radius: 16px;
            background: #0f172a;
            border: 1px solid #1e293b;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
            display: flex;
            flex-direction: column;
            gap: 12px;
            width: 100%;
            max-height: 80vh;
            overflow-y: auto;
          }

          .sales-bottom-bar .controls-row {
            display: flex;
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
            padding-bottom: 0;
            overflow: visible;
          }

          .sales-bottom-bar .ctrl-group {
            background: #1e293b;
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 12px;
            padding: 10px 12px;
            display: flex;
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
            width: 100%;
          }

          .sales-bottom-bar .ctrl-label {
            font-size: 0.78rem;
            color: #fbbf24;
            font-weight: 800;
            letter-spacing: 0.03em;
          }

          .sales-bottom-bar .slider-box {
            display: flex;
            align-items: center;
            gap: 12px;
            width: 100%;
          }

          .sales-bottom-bar .kiosk-range-slider {
            flex: 1;
            height: 8px;
            border-radius: 4px;
            accent-color: #f59e0b;
            cursor: pointer;
          }

          .sales-bottom-bar .area-text {
            font-size: 1rem;
            font-weight: 900;
            color: #ffffff;
            background: #090d16;
            padding: 4px 10px;
            border-radius: 8px;
            border: 1px solid #f59e0b;
            min-width: 65px;
            text-align: center;
          }

          .sales-bottom-bar .price-input-box {
            display: flex;
            align-items: center;
            gap: 8px;
            width: 100%;
          }

          .sales-bottom-bar .kiosk-num-input {
            flex: 1;
            height: 40px;
            font-size: 1rem;
            font-weight: 900;
            color: #fbbf24;
            background: #090d16;
            border: 1px solid #334155;
            border-radius: 8px;
            padding: 0 10px;
            text-align: center;
          }

          .sales-bottom-bar .btn-group-sm {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 6px;
            width: 100%;
          }

          .sales-bottom-bar .btn-sm {
            padding: 8px 6px;
            font-size: 0.76rem;
            font-weight: 800;
            min-height: 38px;
            text-align: center;
            border-radius: 8px;
          }

          .sales-bottom-bar .totals-row {
            display: flex;
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
            margin-top: 4px;
          }

          .sales-bottom-bar .summary-pills {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
            width: 100%;
          }

          .sales-bottom-bar .sum-pill {
            background: #1e293b;
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 10px;
            padding: 8px 10px;
            display: flex;
            flex-direction: column;
            gap: 2px;
          }

          .sales-bottom-bar .sum-title {
            font-size: 0.68rem;
            color: #94a3b8;
            font-weight: 700;
          }

          .sales-bottom-bar .sum-val {
            font-size: 0.82rem;
            color: #ffffff;
            font-weight: 900;
          }

          .sales-bottom-bar .hizmet-box {
            display: flex;
            align-items: center;
            gap: 6px;
            background: #1e293b;
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 10px;
            padding: 6px 8px;
          }

          .sales-bottom-bar .toggle-hizmet {
            flex: 1;
            height: 34px;
            font-size: 0.75rem;
            font-weight: 800;
            border-radius: 6px;
          }

          .sales-bottom-bar .kiosk-num-input-sm {
            width: 60px;
            height: 34px;
            font-size: 0.85rem;
            font-weight: 800;
            border-radius: 6px;
          }

          .sales-bottom-bar .price-cta-box {
            display: flex;
            flex-direction: column;
            gap: 10px;
            background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
            border: 1px solid rgba(245, 158, 11, 0.4);
            border-radius: 14px;
            padding: 12px;
            align-items: stretch;
            width: 100%;
          }

          .sales-bottom-bar .price-col {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
          }

          .sales-bottom-bar .price-label {
            font-size: 0.75rem;
            color: #94a3b8;
            font-weight: 700;
          }

          .sales-bottom-bar .price-val {
            font-size: 1.3rem;
            color: #fbbf24;
            font-weight: 900;
          }

          .sales-bottom-bar .btn-primary-gold-lg {
            width: 100%;
            height: 44px;
            font-size: 0.88rem;
            font-weight: 900;
            justify-content: center;
            border-radius: 10px;
          }

          .controls-row {
            flex-wrap: nowrap;
            overflow-x: auto;
            gap: 12px;
            padding-bottom: 6px;
            -webkit-overflow-scrolling: touch;
          }

          .totals-row {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }

          .summary-pills {
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
          }

          .divider-v {
            display: none;
          }

          .ctrl-group {
            flex-shrink: 0;
          }

          .btn-sm {
            padding: 8px 12px;
            font-size: 0.75rem;
            min-height: 36px;
          }

          .swatch-btn {
            width: 32px;
            height: 32px;
          }
        }

        /* Compact Mobile Phones (<= 480px) */
        @media (max-width: 480px) {
          .kiosk-sidebar {
            width: 92vw;
          }

          .surface-target-grid {
            grid-template-columns: 1fr 1fr;
          }

          .products-scroll-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 5px;
          }

          .card-thumb-wrapper {
            height: 70px;
          }

          .product-touch-card {
            padding: 4px;
          }

          .product-title {
            font-size: 0.68rem;
            line-height: 1.15;
          }

          .product-specs {
            font-size: 0.58rem;
          }

          .overlay-sub-hint {
            display: none;
          }
        }
      `}</style>
    </main>
  );
}
