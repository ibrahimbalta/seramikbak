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
  Menu
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
  { id: 'qua-1', name: 'Qua Travertino Classico Granite', code: 'QUA-TRAV-60120', width: 60, height: 120, style: 'Mermer', finish: 'Parlak Mega Slab', color: 'Krem Traverten', brand: { id: 'qua', name: 'Qua Granite' }, imageUrl: '/textures/travertino_classico.jpg', textureUrl: '/textures/travertino_classico.jpg', unitPrice: 590 }
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

  // Showroom'dan seçilip gelinen seramiği zemin ve duvara uygula
  useEffect(() => {
    setMounted(true);
    if (typeof window === 'undefined') return;

    let targetProduct = null;

    // 1. Session Storage kontrolü (Showroom kartına tıklanınca anında yazılan ürün)
    try {
      const stored = sessionStorage.getItem('kiosk_selected_product');
      if (stored) {
        targetProduct = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Kiosk sessionStorage read error:', e);
    }

    // 2. URL searchParams kontrolü (?productId=... &code=...)
    const urlParams = new URLSearchParams(window.location.search);
    const paramProductId = urlParams.get('productId') || urlParams.get('product') || urlParams.get('id');
    const paramCode = urlParams.get('code');

    if (!targetProduct && (paramProductId || paramCode)) {
      targetProduct = BRAND_CATALOG.find(p =>
        (paramProductId && String(p.id) === String(paramProductId)) ||
        (paramCode && (p.code === paramCode || p.name?.toLowerCase().includes(paramCode.toLowerCase())))
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
        const exists = prev.some(p => p.id === finalProd.id || (p.code && p.code === finalProd.code));
        if (!exists) {
          return [finalProd, ...prev];
        }
        return prev;
      });
    }
  }, []);

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
  const [timeOfDay, setTimeOfDay] = useState('day'); // 'day' | 'sunrise' | 'sunset' | 'night'
  const [lightTemp, setLightTemp] = useState('neutral');
  const [faucetColor, setFaucetColor] = useState('chrome');
  const [cabinetColor, setCabinetColor] = useState('oak');

  // Metraj & Canlı Satış Teklifi Hesaplama Eyaletleri (Kiosk Tablet Modu)
  const [areaM2, setAreaM2] = useState(18);
  const [layingStyle, setLayingStyle] = useState('capraz'); // 'duz' (%8), 'capraz' (%12), 'baliksirti' (%15)
  const [unitPriceM2, setUnitPriceM2] = useState(480);
  const [includeLabor, setIncludeLabor] = useState(true);
  const [laborRatePerM2, setLaborRatePerM2] = useState(250);
  const [includeShipping, setIncludeShipping] = useState(true);
  const [shippingCostInput, setShippingCostInput] = useState(1500);

  // Modlar & Görünüm
  const [comparisonMode, setComparisonMode] = useState(false);
  const [walkthroughMode, setWalkthroughMode] = useState(false);
  const [bottomTab, setBottomTab] = useState('studio'); // 'studio' | 'quote'

  // Filtreler & Modallar
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('all');
  const [showQrModal, setShowQrModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [snapshotUrl, setSnapshotUrl] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Veritabanından Markaları ve Bayileri Yükle
  useEffect(() => {
    async function loadMetaData() {
      try {
        const [brandRes, dealerRes] = await Promise.all([
          fetch('/api/brands').then(r => r.json()).catch(() => null),
          fetch('/api/dealers').then(r => r.json()).catch(() => null)
        ]);

        if (brandRes && Array.isArray(brandRes)) {
          setBrands(brandRes);
        }

        if (dealerRes && dealerRes.dealers && dealerRes.dealers.length > 0) {
          setSelectedDealer(dealerRes.dealers[0]);
        }
      } catch (err) {
        console.error('Kiosk meta data fetch error:', err);
      }
    }
    loadMetaData();
  }, []);

  // Seçilen Markaya (veya Tüm Markalara) Göre Veritabanından Ürünleri Canlı Yükle
  useEffect(() => {
    let isSubscribed = true;
    async function loadProductsForBrand() {
      setIsLoadingProducts(true);
      try {
        const url = selectedBrandId !== 'all' 
          ? `/api/products?brandId=${encodeURIComponent(selectedBrandId)}&limit=2000`
          : `/api/products?limit=2000`;

        const prodRes = await fetch(url).then(r => r.json()).catch(() => null);

        if (isSubscribed && prodRes && prodRes.products && prodRes.products.length > 0) {
          const sanitizedProducts = prodRes.products.map((p, idx) => {
            let img = p.imageUrl || p.textureUrl;
            let tex = p.textureUrl || p.imageUrl;
            if (!tex || tex.includes('hero_ceramics') || tex.includes('luxury_bathroom')) {
              const fallbackIdx = idx % BRAND_CATALOG.length;
              tex = BRAND_CATALOG[fallbackIdx].textureUrl;
            }
            if (!img) {
              img = tex;
            }
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

          setProducts(prev => {
            if (selectedProduct && !sanitizedProducts.some(p => p.id === selectedProduct.id || (p.code && p.code === selectedProduct.code))) {
              return [selectedProduct, ...sanitizedProducts];
            }
            return sanitizedProducts;
          });
        }
      } catch (err) {
        console.error('Kiosk brand products fetch error:', err);
      } finally {
        if (isSubscribed) setIsLoadingProducts(false);
      }
    }
    loadProductsForBrand();
    return () => { isSubscribed = false; };
  }, [selectedBrandId]);

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

  // Mekan Değiştiğinde (Salon, Mutfak, Teras seçilince banyo duvar kaplamalarını pasif yap)
  const handleRoomTypeChange = (newRoom) => {
    setRoomType(newRoom);
    if (newRoom !== 'bathroom') {
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

  // 3D Sahneden Bir Yüzeye Tıklandığında O Yüzeyi Hedef Yap
  const handleToggleTargetFromCanvas = (target) => {
    if (target === 'floor') setActiveTargetSurface('floor');
    else if (target === 'walls') setActiveTargetSurface('walls');
    else if (target === 'shower') setActiveTargetSurface('shower');
    else if (target === 'showerFloor') setActiveTargetSurface('showerFloor');
    else if (target === 'toilet') setActiveTargetSurface('toilet');
    else if (target === 'accent') setActiveTargetSurface('accent');
    else if (target === 'stripe') setActiveTargetSurface('stripe');
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

  // Akıllı Ürün Filtreleme (Marka + Stil + Arama)
  const filteredProducts = products.filter(p => {
    let brandMatch = true;
    if (selectedBrandId !== 'all') {
      const bId = String(selectedBrandId).toLowerCase();
      const pBrandId = String(p.brandId || '').toLowerCase();
      const pBrandName = String(p.brand?.name || '').toLowerCase();
      const pBrandIdObj = String(p.brand?.id || '').toLowerCase();

      brandMatch = pBrandId === bId || pBrandIdObj === bId || pBrandName.includes(bId);
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

  let displayProducts = filteredProducts;
  if (displayProducts.length === 0 && !isLoadingProducts && selectedBrandId === 'all') {
    displayProducts = BRAND_CATALOG;
  }

  // Tüm Markaların Listesini ve Toplam Sayılarını Derle
  const knownBrandNames = ['Kalebodur', 'Graniser', 'VitrA', 'NG Kütahya Seramik', 'Bien Seramik', 'Çanakkale Seramik', 'Yurtbay Seramik', 'Ege Seramik', 'Seramiksan', 'Qua Granite', 'Duratiles', 'Decovita', 'Hitit Seramik', 'Seranit', 'Güral Seramik', 'Termal Seramik', 'Uşak Seramik'];
  
  const uniqueBrandList = brands.length > 0 ? brands : knownBrandNames.map(name => ({
    id: name,
    name: name,
    _count: { products: 0 }
  }));

  const totalProductCountInDb = brands.reduce((acc, b) => acc + (b._count?.products || 0), 0) || products.length;

  // Metraj & Canlı Fiyat Hesaplama Matematiği
  const wastePercent = layingStyle === 'baliksirti' ? 15 : layingStyle === 'capraz' ? 12 : 8;
  const totalM2WithWaste = Math.round((areaM2 * (1 + wastePercent / 100)) * 10) / 10;
  const requiredBoxes = Math.ceil(totalM2WithWaste / 1.44);

  const unitPriceNum = Number(unitPriceM2) || 0;
  const tileCost = Math.round(totalM2WithWaste * unitPriceNum);
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
  const grandTotal = subtotalBeforeVat + vatAmount;

  if (!mounted) {
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
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '6px' }}>3D Showroom Sanal Stüdyosu Hazırlanıyor...</p>
        <style>{`@keyframes kioskSpin { to { transform: rotate(360deg); } }`}</style>
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
          <Link href="/" className="btn-exit-kiosk" title="Ana Sayfaya Dön (Çıkış)">
            <LogOut size={16} />
            <span>Çıkış</span>
          </Link>
          <div>
            <div className="brand-title-row">
              <h1 className="brand-title">Seramik<span className="gold-accent">Bak</span></h1>
              <span className="kiosk-pill">3D Sanal Stüdyo Kiosk</span>
            </div>
            <p className="dealer-sub-text">
              {selectedDealer ? `${selectedDealer.name} Dokunmatik Satış Portalı` : 'Showroom Satış Asistanı'}
            </p>
          </div>
        </div>

        {/* Top Header Actions */}
        <div className="header-right">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="btn-mobile-drawer-toggle"
            title="Mobil Çekmece Menüyü Aç/Kapat"
          >
            <Menu size={16} />
            <span>Menü & Kaplamalar</span>
          </button>

          <button 
            onClick={() => setBottomTab(bottomTab === 'quote' ? 'studio' : 'quote')}
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

          <button onClick={toggleFullscreen} className="btn-icon-kiosk" title="Tam Ekran">
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
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
      <div className="kiosk-workspace-grid">
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
            <div className="section-label-header">
              <Layers size={14} className="icon-gold" />
              <span>1. Kaplanacak Yüzeyi Seçin:</span>
            </div>

            <div className="surface-target-grid">
              <button
                onClick={() => {
                  if (activeTargetSurface === 'floor') {
                    setApplyFloor(!applyFloor);
                  } else {
                    setActiveTargetSurface('floor');
                  }
                }}
                className={`target-btn ${activeTargetSurface === 'floor' ? 'active' : ''} ${!applyFloor ? 'is-off' : ''}`}
              >
                <span>Zemin ({applyFloor && floorProduct ? floorProduct.name.split(' ')[0] : 'Pasif'})</span>
                {applyFloor && (
                  <span 
                    onClick={(e) => { e.stopPropagation(); setApplyFloor(false); }}
                    style={{ marginLeft: 'auto', background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444', borderRadius: '4px', padding: '1px 5px', fontSize: '0.65rem', fontWeight: '800' }}
                    title="Zemin kaplamasını kaldır (Pasif Yap)"
                  >
                    ✕
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  if (activeTargetSurface === 'walls') {
                    setApplyWalls(!applyWalls);
                  } else {
                    setActiveTargetSurface('walls');
                  }
                }}
                className={`target-btn ${activeTargetSurface === 'walls' ? 'active' : ''} ${!applyWalls ? 'is-off' : ''}`}
              >
                <span>Duvar ({applyWalls && wallProduct ? wallProduct.name.split(' ')[0] : 'Pasif'})</span>
                {applyWalls && (
                  <span 
                    onClick={(e) => { e.stopPropagation(); setApplyWalls(false); }}
                    style={{ marginLeft: 'auto', background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444', borderRadius: '4px', padding: '1px 5px', fontSize: '0.65rem', fontWeight: '800' }}
                    title="Duvar seramiğini kaldır (Pasif Yap)"
                  >
                    ✕
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  if (activeTargetSurface === 'shower') {
                    setApplyShower(!applyShower);
                  } else {
                    setActiveTargetSurface('shower');
                  }
                }}
                className={`target-btn ${activeTargetSurface === 'shower' ? 'active' : ''} ${!applyShower ? 'is-off' : ''}`}
              >
                <span>Duş Duvarı ({applyShower ? 'Aktif' : 'Pasif'})</span>
                {applyShower && (
                  <span 
                    onClick={(e) => { e.stopPropagation(); setApplyShower(false); }}
                    style={{ marginLeft: 'auto', background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444', borderRadius: '4px', padding: '1px 5px', fontSize: '0.65rem', fontWeight: '800' }}
                    title="Duş kaplamasını kaldır"
                  >
                    ✕
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  if (activeTargetSurface === 'showerFloor') {
                    setApplyShowerFloor(!applyShowerFloor);
                  } else {
                    setActiveTargetSurface('showerFloor');
                  }
                }}
                className={`target-btn ${activeTargetSurface === 'showerFloor' ? 'active' : ''} ${!applyShowerFloor ? 'is-off' : ''}`}
              >
                <span>Duş Zemini ({applyShowerFloor ? 'Aktif' : 'Pasif'})</span>
                {applyShowerFloor && (
                  <span 
                    onClick={(e) => { e.stopPropagation(); setApplyShowerFloor(false); }}
                    style={{ marginLeft: 'auto', background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444', borderRadius: '4px', padding: '1px 5px', fontSize: '0.65rem', fontWeight: '800' }}
                    title="Duş tabanı kaplamasını kaldır"
                  >
                    ✕
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  if (activeTargetSurface === 'toilet') {
                    setApplyToiletWall(!applyToiletWall);
                  } else {
                    setActiveTargetSurface('toilet');
                  }
                }}
                className={`target-btn ${activeTargetSurface === 'toilet' ? 'active' : ''} ${!applyToiletWall ? 'is-off' : ''}`}
              >
                <span>Klozet Arkası ({applyToiletWall ? 'Aktif' : 'Pasif'})</span>
                {applyToiletWall && (
                  <span 
                    onClick={(e) => { e.stopPropagation(); setApplyToiletWall(false); }}
                    style={{ marginLeft: 'auto', background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444', borderRadius: '4px', padding: '1px 5px', fontSize: '0.65rem', fontWeight: '800' }}
                    title="Klozet arkası seramiğini kaldır"
                  >
                    ✕
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  if (activeTargetSurface === 'accent') {
                    setApplyAccent(!applyAccent);
                  } else {
                    setActiveTargetSurface('accent');
                  }
                }}
                className={`target-btn ${activeTargetSurface === 'accent' ? 'active' : ''} ${!applyAccent ? 'is-off' : ''}`}
              >
                <span>Vurgu Duvarı ({applyAccent ? 'Aktif' : 'Pasif'})</span>
                {applyAccent && (
                  <span 
                    onClick={(e) => { e.stopPropagation(); setApplyAccent(false); }}
                    style={{ marginLeft: 'auto', background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444', borderRadius: '4px', padding: '1px 5px', fontSize: '0.65rem', fontWeight: '800' }}
                    title="Vurgu seramiğini kaldır"
                  >
                    ✕
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  if (activeTargetSurface === 'stripe') {
                    setApplyStripeWall(!applyStripeWall);
                  } else {
                    setActiveTargetSurface('stripe');
                  }
                }}
                className={`target-btn ${activeTargetSurface === 'stripe' ? 'active' : ''} ${!applyStripeWall ? 'is-off' : ''}`}
              >
                <span>Yatay Bordür ({applyStripeWall ? 'Aktif' : 'Pasif'})</span>
                {applyStripeWall && (
                  <span 
                    onClick={(e) => { e.stopPropagation(); setApplyStripeWall(false); }}
                    style={{ marginLeft: 'auto', background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444', borderRadius: '4px', padding: '1px 5px', fontSize: '0.65rem', fontWeight: '800' }}
                    title="Yatay bordürü kaldır"
                  >
                    ✕
                  </span>
                )}
              </button>
            </div>

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
          <div className="products-scroll-grid">
            {isLoadingProducts ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '220px', color: '#94a3b8', width: '100%' }}>
                <div className="kiosk-spin-loader" />
                <span style={{ marginTop: '12px', fontSize: '0.85rem', fontWeight: '500' }}>Marka Ürünleri Çekiliyor...</span>
              </div>
            ) : displayProducts.length === 0 ? (
              <div style={{ padding: '30px 15px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                Seçilen filtreye uygun ürün bulunamadı.
              </div>
            ) : (
              displayProducts.map(product => {
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
              })
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
              timeOfDay={timeOfDay}
              lightTemp={lightTemp}
              faucetColor={faucetColor}
              cabinetColor={cabinetColor}
            />

            {/* Mobile Floating Left Drawer Trigger Button */}
            <button 
              onClick={() => setIsMobileMenuOpen(true)} 
              className="canvas-mobile-floating-menu-btn"
              title="Kaplama & Seramik Menüsünü Aç"
            >
              <Menu size={16} />
              <span>Menü & Kaplamalar</span>
            </button>

            {/* Target Surface Overlay Badge inside 3D Canvas */}
            <div className="canvas-active-target-overlay">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span className="overlay-label">Aktif Yüzey Hedefi:</span>
                <strong className="overlay-target-name">
                  {activeTargetSurface === 'floor' && (applyFloor ? `Zemin (${floorProduct?.name?.split(' ')[0] || 'Seramik'})` : 'Zemin (Kaplama Yok)')}
                  {activeTargetSurface === 'walls' && (applyWalls ? `Duvar (${wallProduct?.name?.split(' ')[0] || 'Seramik'})` : 'Duvar (Kaplama Yok - Pasif)')}
                  {activeTargetSurface === 'shower' && (applyShower ? 'Duş Duvarı' : 'Duş Duvarı (Kaplama Yok)')}
                  {activeTargetSurface === 'showerFloor' && (applyShowerFloor ? 'Duş Zemini' : 'Duş Zemini (Kaplama Yok)')}
                  {activeTargetSurface === 'toilet' && (applyToiletWall ? 'Klozet Arkası' : 'Klozet Arkası (Kaplama Yok)')}
                  {activeTargetSurface === 'accent' && (applyAccent ? 'Lavabo Arkası' : 'Lavabo Arkası (Kaplama Yok)')}
                  {activeTargetSurface === 'stripe' && (applyStripeWall ? 'Yatay Bordür' : 'Yatay Bordür (Kaplama Yok)')}
                </strong>
                
                {/* Quick Toggle / Clear button on current target */}
                {activeTargetSurface === 'walls' && applyWalls && (
                  <button
                    onClick={() => setApplyWalls(false)}
                    style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.5)', color: '#fca5a5', padding: '2px 8px', borderRadius: '6px', fontSize: '0.68rem', fontWeight: '800', cursor: 'pointer' }}
                    title="Duvar seramiğini pasif yap / kaldır"
                  >
                    ✕ Duvarı Pasif Yap
                  </button>
                )}
                {activeTargetSurface === 'walls' && !applyWalls && (
                  <button
                    onClick={() => setApplyWalls(true)}
                    style={{ background: 'rgba(34, 197, 94, 0.2)', border: '1px solid rgba(34, 197, 94, 0.5)', color: '#86efac', padding: '2px 8px', borderRadius: '6px', fontSize: '0.68rem', fontWeight: '800', cursor: 'pointer' }}
                    title="Duvar seramik kaplamasını aktif et"
                  >
                    + Duvar Kapla
                  </button>
                )}
                {activeTargetSurface === 'floor' && applyFloor && (
                  <button
                    onClick={() => setApplyFloor(false)}
                    style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.5)', color: '#fca5a5', padding: '2px 8px', borderRadius: '6px', fontSize: '0.68rem', fontWeight: '800', cursor: 'pointer' }}
                    title="Zemin seramiğini pasif yap / kaldır"
                  >
                    ✕ Zemini Pasif Yap
                  </button>
                )}
                {activeTargetSurface === 'floor' && !applyFloor && (
                  <button
                    onClick={() => setApplyFloor(true)}
                    style={{ background: 'rgba(34, 197, 94, 0.2)', border: '1px solid rgba(34, 197, 94, 0.5)', color: '#86efac', padding: '2px 8px', borderRadius: '6px', fontSize: '0.68rem', fontWeight: '800', cursor: 'pointer' }}
                    title="Zemin seramik kaplamasını aktif et"
                  >
                    + Zemin Kapla
                  </button>
                )}
              </div>
              <span className="overlay-sub-hint">(Sol menüden seçeceğiniz seramik buraya uygulanır)</span>
            </div>

            {/* Canvas Mobile Expand Button */}
            <button 
              onClick={toggleFullscreen} 
              className="canvas-expand-touch-btn"
              title="3D Stüdyo Tam Ekran Modu"
            >
              {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              <span>{isFullscreen ? 'Küçült' : 'Büyüt'}</span>
            </button>

            {/* Mobile Quick Surface Chips Bar at Bottom of 3D Canvas */}
            <div className="canvas-mobile-surface-chips">
              {[
                { id: 'floor', label: 'Zemin' },
                { id: 'walls', label: 'Duvar' },
                { id: 'shower', label: 'Duş' },
                { id: 'showerFloor', label: 'Duş Zem' },
                { id: 'toilet', label: 'Klozet' },
                { id: 'accent', label: 'Vurgu' },
                { id: 'stripe', label: 'Bordür' }
              ].map(chip => (
                <button
                  key={chip.id}
                  onClick={() => {
                    setActiveTargetSurface(chip.id);
                    setIsMobileMenuOpen(true);
                  }}
                  className={`chip-surface-btn ${activeTargetSurface === chip.id ? 'active' : ''}`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bottom Panel Toggle Tabs (3D Stüdyo Kontrolleri / Metraj & Fiyatlama) */}
          <div className="bottom-panel-tabs">
            <button
              onClick={() => setBottomTab('studio')}
              className={`panel-tab-btn ${bottomTab === 'studio' ? 'active' : ''}`}
            >
              <Palette size={14} />
              <span>3D Stüdyo & Ortam Kontrolleri</span>
            </button>

            <button
              onClick={() => setBottomTab('quote')}
              className={`panel-tab-btn ${bottomTab === 'quote' ? 'active' : ''}`}
            >
              <Calculator size={14} />
              <span>Metraj & Canlı Satış Teklifi Hazırlama</span>
            </button>
          </div>

          {/* Bottom Live Studio Control Bar (3D Stüdyo Kontrolleri) */}
          {bottomTab === 'studio' && (
            <div className="studio-bottom-bar">
              {/* Control Row 1: Mekan Tipi & Dizim Şekli */}
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
                  <span className="ctrl-label">Dizim Deseni:</span>
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

                <div className="ctrl-group">
                  <span className="ctrl-label">Derz Rengi:</span>
                  <div className="color-swatches">
                    {[
                      { color: '#ffffff', label: 'Beyaz' },
                      { color: '#888888', label: 'Gri' },
                      { color: '#333333', label: 'Antrasit' },
                      { color: '#d8cbb8', label: 'Bej' }
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
              </div>

              {/* Control Row 2: Ortam Işığı & Mobilya / Armatür */}
              <div className="controls-row">
                <div className="ctrl-group">
                  <span className="ctrl-label">Atmosfer / Işık:</span>
                  <div className="btn-group-sm">
                    {[
                      { id: 'day', label: 'Gündüz' },
                      { id: 'sunrise', label: 'Gündoğumu' },
                      { id: 'sunset', label: 'Günbatımı' },
                      { id: 'night', label: 'Gece' }
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
                  <span className="ctrl-label">Armatür:</span>
                  <div className="btn-group-sm">
                    {[
                      { id: 'chrome', label: 'Krom' },
                      { id: 'black', label: 'Mat Siyah' },
                      { id: 'gold', label: 'Gold' }
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
                      { id: 'oak', label: 'Meşe' },
                      { id: 'white', label: 'Beyaz' },
                      { id: 'anthracite', label: 'Antrasit' },
                      { id: 'walnut', label: 'Ceviz' }
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

          {/* Bottom Live Quote & Metraj Sales Assistant Bar (Satış Temsilcisi & Müşteri Teklif Paneli) */}
          {bottomTab === 'quote' && (
            <div className="sales-bottom-bar">
              {/* Row 1: Live Interactive Calculations */}
              <div className="controls-row">
                {/* Kaplanacak Alan Slider */}
                <div className="ctrl-group">
                  <span className="ctrl-label">Alan (m²):</span>
                  <div className="slider-box">
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

                {/* Birim Fiyat (Satış Temsilcisi Elle Müdahale Edebilir) */}
                <div className="ctrl-group">
                  <span className="ctrl-label">Seramik m² Fiyatı:</span>
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

                {/* Dizim Fire Oranı */}
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

              {/* Row 2: Totals & Create PDF Quote CTA */}
              <div className="totals-row">
                <div className="summary-pills">
                  <div className="sum-pill">
                    <span className="sum-title">Gereken Seramik</span>
                    <span className="sum-val">{totalM2WithWaste} m² ({requiredBoxes} Kutu)</span>
                  </div>
                  <div className="divider-v" />
                  <div className="sum-pill">
                    <span className="sum-title">Sarfiyat (Harç/Derz)</span>
                    <span className="sum-val">{adhesiveBags} Çuval / {groutPacks} Pak</span>
                  </div>
                  <div className="divider-v" />
                  
                  {/* Ustalık İşçilik Toggle */}
                  <div className="hizmet-box">
                    <button
                      onClick={() => setIncludeLabor(!includeLabor)}
                      className={`toggle-hizmet ${includeLabor ? 'active-green' : ''}`}
                    >
                      <Wrench size={14} />
                      <span>{includeLabor ? 'Ustalık' : '+ Ustalık'}</span>
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
                      <Truck size={14} />
                      <span>{includeShipping ? 'Nakliye' : '+ Nakliye'}</span>
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
                </div>

                {/* Total Price & CTA */}
                <div className="price-cta-box">
                  <div className="price-col">
                    <span className="price-label">Tahmini Toplam (KDV Dahil)</span>
                    <span className="price-val">₺{grandTotal.toLocaleString('tr-TR')}</span>
                  </div>

                  <button onClick={handleOpenQuoteModal} className="btn-cta-pdf">
                    <FileText size={16} />
                    <span>PDF Teklifi Çıkar & Düzenle</span>
                  </button>
                </div>
              </div>
            </div>
          )}
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
          height: 56px;
          flex-shrink: 0;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid #1e293b;
          padding: 8px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          z-index: 20;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .btn-exit-kiosk {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 0 14px;
          height: 38px;
          border-radius: 10px;
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.08) 100%);
          border: 1px solid rgba(239, 68, 68, 0.35);
          color: #fca5a5;
          font-weight: 800;
          font-size: 0.82rem;
          text-decoration: none;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .btn-exit-kiosk:hover {
          background: #ef4444;
          border-color: #ef4444;
          color: #ffffff;
          transform: translateY(-1px) scale(1.03);
          box-shadow: 0 4px 16px rgba(239, 68, 68, 0.4);
        }

        .btn-exit-kiosk:active {
          transform: translateY(0) scale(0.95);
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
          gap: 4px;
          background: #090d16;
          padding: 4px;
          border-radius: 8px;
          border: 1px solid #1e293b;
        }

        .target-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6px 4px;
          border-radius: 6px;
          border: 1px solid transparent;
          background: #0f172a;
          color: #94a3b8;
          font-size: 0.68rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s ease;
          text-align: center;
        }

        .target-btn.active {
          background: #f59e0b;
          color: #0f172a;
          font-weight: 900;
          box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
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

        .canvas-active-target-overlay {
          position: absolute;
          top: 10px;
          left: 10px;
          background: rgba(15, 23, 42, 0.88);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(245, 158, 11, 0.4);
          padding: 6px 12px;
          border-radius: 10px;
          display: flex;
          flex-direction: column;
          gap: 1px;
          pointer-events: none;
          z-index: 10;
        }

        .overlay-label {
          font-size: 0.58rem;
          color: #94a3b8;
          font-weight: 700;
          text-transform: uppercase;
        }

        .overlay-target-name {
          font-size: 0.78rem;
          font-weight: 900;
          color: #fbbf24;
        }

        .overlay-sub-hint {
          font-size: 0.55rem;
          color: #64748b;
        }

        .canvas-expand-touch-btn {
          position: absolute;
          top: 10px;
          right: 10px;
          background: rgba(15, 23, 42, 0.88);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(245, 158, 11, 0.4);
          color: #fbbf24;
          padding: 6px 12px;
          border-radius: 10px;
          font-size: 0.75rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          z-index: 12;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35);
          transition: all 0.2s ease;
        }

        .canvas-expand-touch-btn:hover {
          background: #f59e0b;
          color: #0f172a;
          border-color: #f59e0b;
        }

        .bottom-panel-tabs {
          display: flex;
          gap: 6px;
          flex-shrink: 0;
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

        /* Mobile & Medium Tablets (<= 768px): Full 3D Viewport + Left Slide-Out Drawer */
        @media (max-width: 768px) {
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
            height: 48px;
            padding: 4px 8px;
            flex-wrap: nowrap;
            gap: 4px;
            z-index: 20;
          }

          .header-left {
            gap: 6px;
            flex-shrink: 0;
          }

          .brand-title {
            font-size: 0.95rem;
          }

          .header-right {
            overflow-x: auto;
            max-width: 100%;
            justify-content: flex-end;
            gap: 4px;
            -webkit-overflow-scrolling: touch;
          }

          .btn-mode-kiosk span,
          .btn-secondary-kiosk span {
            display: none;
          }

          .btn-primary-gold-kiosk span {
            font-size: 0.65rem;
          }

          .btn-mode-kiosk,
          .btn-secondary-kiosk,
          .btn-primary-gold-kiosk {
            flex-shrink: 0;
            padding: 5px 8px;
            font-size: 0.68rem;
            min-height: 32px;
          }

          .kiosk-workspace-grid {
            display: block;
            position: relative;
            height: calc(100vh - 48px);
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

          /* Mobile Floating Drawer Trigger Button over 3D Canvas */
          .canvas-mobile-floating-menu-btn {
            display: flex;
            align-items: center;
            gap: 5px;
            position: absolute;
            top: 8px;
            left: 8px;
            z-index: 15;
            background: rgba(15, 23, 42, 0.92);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border: 1px solid #f59e0b;
            color: #fbbf24;
            font-weight: 800;
            font-size: 0.72rem;
            padding: 6px 12px;
            border-radius: 18px;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
            cursor: pointer;
            transition: transform 0.15s ease;
          }

          .canvas-mobile-floating-menu-btn:active {
            transform: scale(0.95);
          }

          .canvas-active-target-overlay {
            position: absolute;
            top: 46px;
            left: 8px;
            max-width: calc(100% - 60px);
            padding: 3px 8px;
            border-radius: 8px;
            background: rgba(15, 23, 42, 0.92);
            backdrop-filter: blur(8px);
            border: 1px solid rgba(245, 158, 11, 0.3);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .overlay-label {
            font-size: 0.5rem;
          }

          .overlay-target-name {
            font-size: 0.68rem;
          }

          .overlay-sub-hint {
            display: none !important;
          }

          /* Mobile Bottom Quick Surface Chips Bar */
          .canvas-mobile-surface-chips {
            display: flex;
            align-items: center;
            gap: 6px;
            overflow-x: auto;
            position: absolute;
            bottom: 12px;
            left: 10px;
            right: 10px;
            z-index: 15;
            background: rgba(15, 23, 42, 0.88);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            padding: 6px;
            border-radius: 14px;
            border: 1px solid rgba(245, 158, 11, 0.3);
            -webkit-overflow-scrolling: touch;
          }

          .chip-surface-btn {
            flex-shrink: 0;
            background: #090d16;
            border: 1px solid #1e293b;
            color: #94a3b8;
            font-size: 0.68rem;
            font-weight: 700;
            padding: 5px 10px;
            border-radius: 8px;
            cursor: pointer;
            white-space: nowrap;
          }

          .chip-surface-btn.active {
            background: #f59e0b;
            color: #0f172a;
            border-color: #f59e0b;
            font-weight: 900;
            box-shadow: 0 2px 8px rgba(245, 158, 11, 0.4);
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
            padding: 10px;
            font-size: 0.85rem;
            min-height: 42px;
          }

          .search-input {
            padding: 9px 10px 9px 34px;
            font-size: 0.78rem;
            min-height: 40px;
          }

          .filter-pill {
            padding: 6px 12px;
            font-size: 0.72rem;
            min-height: 34px;
          }

          .products-scroll-grid {
            flex: 1;
            min-height: 250px;
            overflow-y: auto;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          }

          .product-touch-card {
            padding: 8px;
          }

          .card-thumb-wrapper {
            height: 95px;
          }

          .studio-bottom-bar,
          .sales-bottom-bar {
            padding: 10px;
            border-radius: 12px;
            width: 100%;
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
            grid-template-columns: 1fr 1fr;
          }

          .product-title {
            font-size: 0.72rem;
          }

          .product-specs {
            font-size: 0.62rem;
          }

          .overlay-sub-hint {
            display: none;
          }
        }
      `}</style>
    </main>
  );
}
