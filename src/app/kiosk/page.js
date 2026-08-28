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
  Sun,
  Moon,
  Compass,
  Palette,
  Grid,
  Filter,
  Maximize
} from 'lucide-react';

const StudioCanvas = dynamic(() => import('@/components/StudioCanvas'), { 
  ssr: false,
  loading: () => (
    <div className="kiosk-loading-box">
      <div className="kiosk-spin-loader" />
      <span>3D Sanal Stüdyo & Seramik Modelleri Yükleniyor...</span>
    </div>
  )
});

// Gerçek Seramik Doku Görselleri (Görsel Tekrarlama Glitch'i Olmaz)
const FALLBACK_PRODUCTS = [
  {
    id: 'demo-1',
    name: 'Calacatta Gold Porselen Seramik',
    code: 'SB-CAL-60120',
    width: 60,
    height: 120,
    style: 'Mermer',
    finish: 'Mat Rektifiye',
    color: 'Beyaz / Altın',
    brand: { id: 'b1', name: 'VitrA' },
    imageUrl: '/textures/calacatta_gold.jpg',
    textureUrl: '/textures/calacatta_gold.jpg'
  },
  {
    id: 'demo-2',
    name: 'Nero Marquina Siyah Mermer Karo',
    code: 'SB-NERO-60120',
    width: 60,
    height: 120,
    style: 'Mermer',
    finish: 'Lüks Parlak',
    color: 'Siyah',
    brand: { id: 'b2', name: 'NG Kütahya Seramik' },
    imageUrl: '/textures/albatros_antrasit.jpg',
    textureUrl: '/textures/albatros_antrasit.jpg'
  },
  {
    id: 'demo-3',
    name: 'Nordic Meşe Ahşap Doku Porselen',
    code: 'SB-OAK-20120',
    width: 20,
    height: 120,
    style: 'Ahşap',
    finish: 'Mat Ahşap',
    color: 'Doğal Meşe',
    brand: { id: 'b3', name: 'Bien Seramik' },
    imageUrl: '/textures/natural_oak.jpg',
    textureUrl: '/textures/natural_oak.jpg'
  },
  {
    id: 'demo-4',
    name: 'Urban Gri Beton Doku Karo',
    code: 'SB-BETON-6060',
    width: 60,
    height: 60,
    style: 'Beton',
    finish: 'Mat Endüstriyel',
    color: 'Gri',
    brand: { id: 'b4', name: 'Çanakkale Seramik' },
    imageUrl: '/textures/concrete_light_grey.jpg',
    textureUrl: '/textures/concrete_light_grey.jpg'
  },
  {
    id: 'demo-5',
    name: 'Loft Antrasit Beton Porselen',
    code: 'SB-LOFT-8080',
    width: 80,
    height: 80,
    style: 'Beton',
    finish: 'Lapatto',
    color: 'Koyu Antrasit',
    brand: { id: 'b5', name: 'Ege Seramik' },
    imageUrl: '/textures/loft_beton.jpg',
    textureUrl: '/textures/loft_beton.jpg'
  },
  {
    id: 'demo-6',
    name: 'Teak Doğal Ahşap Parke Karo',
    code: 'SB-TEAK-20120',
    width: 20,
    height: 120,
    style: 'Ahşap',
    finish: 'Mat Derzli',
    color: 'Koyu Meşe',
    brand: { id: 'b6', name: 'Yurtbay Seramik' },
    imageUrl: '/textures/teak_ahsap.jpg',
    textureUrl: '/textures/teak_ahsap.jpg'
  },
  {
    id: 'demo-7',
    name: 'Vista Bej Doğal Taş Karo',
    code: 'SB-VISTA-60120',
    width: 60,
    height: 120,
    style: 'Taş',
    finish: 'Rölyef Mat',
    color: 'Sıcak Bej',
    brand: { id: 'b7', name: 'Seramiksan' },
    imageUrl: '/textures/vista_bej.jpg',
    textureUrl: '/textures/vista_bej.jpg'
  },
  {
    id: 'demo-8',
    name: 'Travertino Classico Mermer Porselen',
    code: 'SB-TRAV-60120',
    width: 60,
    height: 120,
    style: 'Mermer',
    finish: 'Parlak Mega Slab',
    color: 'Krem Traverten',
    brand: { id: 'b8', name: 'Qua Granite' },
    imageUrl: '/textures/travertino_classico.jpg',
    textureUrl: '/textures/travertino_classico.jpg'
  }
];

export default function ShowroomKioskPage() {
  const canvasContainerRef = useRef(null);

  // Ürün ve Marka Eyaletleri
  const [products, setProducts] = useState(FALLBACK_PRODUCTS);
  const [brands, setBrands] = useState([]);
  const [selectedBrandId, setSelectedBrandId] = useState('all');

  // 3D Sanal Stüdyo Yüzey Seçimleri
  const [selectedProduct, setSelectedProduct] = useState(FALLBACK_PRODUCTS[0]);
  const [floorProduct, setFloorProduct] = useState(FALLBACK_PRODUCTS[0]);
  const [wallProduct, setWallProduct] = useState(FALLBACK_PRODUCTS[1] || FALLBACK_PRODUCTS[0]);
  const [accentProduct, setAccentProduct] = useState(null);
  const [showerProduct, setShowerProduct] = useState(null);
  const [showerFloorProduct, setShowerFloorProduct] = useState(null);
  const [toiletWallProduct, setToiletWallProduct] = useState(null);
  const [stripeWallProduct, setStripeWallProduct] = useState(null);
  const [comparisonProduct, setComparisonProduct] = useState(null);

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

  // Modlar & Görünüm
  const [comparisonMode, setComparisonMode] = useState(false);
  const [walkthroughMode, setWalkthroughMode] = useState(false);

  // Filtreler & Modallar
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('all');
  const [showQrModal, setShowQrModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Veritabanından Tüm Ürünleri ve Markaları Yükle
  useEffect(() => {
    async function loadData() {
      try {
        const [prodRes, brandRes] = await Promise.all([
          fetch('/api/products?limit=200').then(r => r.json()).catch(() => null),
          fetch('/api/brands').then(r => r.json()).catch(() => null)
        ]);

        if (prodRes && prodRes.products && prodRes.products.length > 0) {
          // Temiz doku yolları atanmasını kontrol et
          const sanitizedProducts = prodRes.products.map((p, idx) => {
            let tex = p.textureUrl || p.imageUrl;
            if (!tex || tex.includes('hero_ceramics') || tex.includes('luxury_bathroom')) {
              const fallbackIdx = idx % FALLBACK_PRODUCTS.length;
              tex = FALLBACK_PRODUCTS[fallbackIdx].textureUrl;
            }
            return {
              ...p,
              imageUrl: tex,
              textureUrl: tex
            };
          });
          setProducts(sanitizedProducts);
          setSelectedProduct(sanitizedProducts[0]);
          setFloorProduct(sanitizedProducts[0]);
          setWallProduct(sanitizedProducts[1] || sanitizedProducts[0]);
        }

        if (brandRes && Array.isArray(brandRes)) {
          setBrands(brandRes);
        }
      } catch (err) {
        console.error('Kiosk data fetch error:', err);
      }
    }
    loadData();
  }, []);

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

  // Akıllı Ürün Filtreleme (Marka + Stil + Arama)
  const filteredProducts = products.filter(p => {
    const brandMatch = selectedBrandId === 'all' || p.brandId === selectedBrandId || (p.brand && p.brand.id === selectedBrandId);
    
    const styleLower = (p.style || '').toLowerCase();
    const nameLower = (p.name || '').toLowerCase();
    const codeLower = (p.code || '').toLowerCase();
    const brandNameLower = (p.brand?.name || '').toLowerCase();

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

  const displayProducts = filteredProducts.length > 0 ? filteredProducts : FALLBACK_PRODUCTS;

  // Tüm Markaların Listesini Topla
  const uniqueBrandList = brands.length > 0 ? brands : Array.from(
    new Set(displayProducts.map(p => p.brand?.name).filter(Boolean))
  ).map((name, i) => ({ id: `b-${i}`, name }));

  return (
    <main className="kiosk-page-container">
      {/* Top Touch Kiosk Header */}
      <header className="kiosk-header">
        <div className="header-left">
          <Link href="/" className="btn-exit-kiosk" title="Kiosk Modundan Çık">
            <LogOut size={16} />
            <span>Ana Sayfa</span>
          </Link>

          <div className="brand-badge">S</div>
          <div>
            <div className="brand-title-row">
              <h1 className="brand-title">Seramik<span className="gold-accent">Bak</span></h1>
              <span className="kiosk-pill">3D Sanal Stüdyo & Showroom Kiosk</span>
            </div>
            <p className="dealer-sub-text">
              Tüm Markaların Seramik Koleksiyonları ve Canlı 3D Simülasyon Ekranı
            </p>
          </div>
        </div>

        {/* Top Header Actions */}
        <div className="header-right">
          <button 
            onClick={() => {
              const newMode = !comparisonMode;
              setComparisonMode(newMode);
              if (newMode && !comparisonProduct && products.length > 1) {
                setComparisonProduct(products[1]);
              }
            }}
            className={`btn-mode-kiosk ${comparisonMode ? 'active-gold' : ''}`}
          >
            <span>⚖️ 3D Kıyasla</span>
          </button>

          <button 
            onClick={() => setWalkthroughMode(!walkthroughMode)}
            className={`btn-mode-kiosk ${walkthroughMode ? 'active-sky' : ''}`}
          >
            <span>🎥 360° İç Gezinti</span>
          </button>

          <button onClick={() => setShowQrModal(true)} className="btn-secondary-kiosk">
            <QrCode size={16} />
            <span>QR ile İndir</span>
          </button>

          <button onClick={toggleFullscreen} className="btn-icon-kiosk" title="Tam Ekran">
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>
      </header>

      {/* Main Touch Workspace Grid */}
      <div className="kiosk-workspace-grid">
        {/* Left Side: Product Selector Sidebar */}
        <div className="kiosk-sidebar">
          {/* Surface Target Selection Grid (Hangi Yüzey Kaplanacak?) */}
          <div className="section-label-header">
            <Layers size={14} className="icon-gold" />
            <span>1. Kaplanacak Yüzeyi Seçin:</span>
          </div>

          <div className="surface-target-grid">
            <button
              onClick={() => setActiveTargetSurface('floor')}
              className={`target-btn ${activeTargetSurface === 'floor' ? 'active' : ''}`}
            >
              <span>Zemin ({floorProduct ? floorProduct.name.split(' ')[0] : 'Seç'})</span>
            </button>

            <button
              onClick={() => setActiveTargetSurface('walls')}
              className={`target-btn ${activeTargetSurface === 'walls' ? 'active' : ''}`}
            >
              <span>Duvar ({wallProduct ? wallProduct.name.split(' ')[0] : 'Seç'})</span>
            </button>

            <button
              onClick={() => setActiveTargetSurface('shower')}
              className={`target-btn ${activeTargetSurface === 'shower' ? 'active' : ''}`}
            >
              <span>Duş Duvarı</span>
            </button>

            <button
              onClick={() => setActiveTargetSurface('showerFloor')}
              className={`target-btn ${activeTargetSurface === 'showerFloor' ? 'active' : ''}`}
            >
              <span>Duş Zemini</span>
            </button>

            <button
              onClick={() => setActiveTargetSurface('toilet')}
              className={`target-btn ${activeTargetSurface === 'toilet' ? 'active' : ''}`}
            >
              <span>Klozet Arkası</span>
            </button>

            <button
              onClick={() => setActiveTargetSurface('accent')}
              className={`target-btn ${activeTargetSurface === 'accent' ? 'active' : ''}`}
            >
              <span>Vurgu Duvarı</span>
            </button>

            <button
              onClick={() => setActiveTargetSurface('stripe')}
              className={`target-btn ${activeTargetSurface === 'stripe' ? 'active' : ''}`}
            >
              <span>Yatay Bordür</span>
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
              onChange={(e) => setSelectedBrandId(e.target.value)}
              className="kiosk-brand-dropdown"
            >
              <option value="all">🏢 Tüm Markalar ({displayProducts.length} Model)</option>
              {uniqueBrandList.map(b => (
                <option key={b.id} value={b.id}>
                  {b.name}
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

          {/* Products List Grid (FİYATSIZ, TEMİZ KARO DOKULARI) */}
          <div className="products-scroll-grid">
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
                      src={product.textureUrl || product.imageUrl || '/textures/calacatta_gold.jpg'}
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
            })}
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

            {/* Target Surface Overlay Badge inside 3D Canvas */}
            <div className="canvas-active-target-overlay">
              <span className="overlay-label">Aktif Yüzey Hedefi:</span>
              <strong className="overlay-target-name">
                {activeTargetSurface === 'floor' && 'Zemin Seramiği'}
                {activeTargetSurface === 'walls' && 'Ana Duvar Seramiği'}
                {activeTargetSurface === 'shower' && 'Duş Kabini Duvarı'}
                {activeTargetSurface === 'showerFloor' && 'Duş Kabini Zemini'}
                {activeTargetSurface === 'toilet' && 'Klozet Arkası Vurgu Duvarı'}
                {activeTargetSurface === 'accent' && 'Lavabo Arkası Vurgu Duvarı'}
                {activeTargetSurface === 'stripe' && 'Yatay Bordür Kuşağı'}
              </strong>
              <span className="overlay-sub-hint">(Sol menüden seçeceğiniz seramik buraya uygulanır)</span>
            </div>
          </div>

          {/* Bottom Live 3D Studio Control Bar (FİYATSIZ, TAM SANAL STÜDYO KONTROLLERİ) */}
          <div className="studio-bottom-bar">
            {/* Control Row 1: Mekan Tipi & Dizim Şekli */}
            <div className="controls-row">
              {/* Simülasyon Sahnesi */}
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
                      onClick={() => setRoomType(r.id)}
                      className={`btn-sm ${roomType === r.id ? 'active' : ''}`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dizim Deseni */}
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

              {/* Derz Rengi */}
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
              {/* Günün Saati */}
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

              {/* Armatür Metali */}
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

              {/* Mobilya Ahşap Dokusu */}
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

      <style jsx>{`
        .kiosk-page-container {
          min-height: 100vh;
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
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid #1e293b;
          padding: 10px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          z-index: 20;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .btn-exit-kiosk {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.4);
          color: #ef4444;
          padding: 8px 14px;
          border-radius: 10px;
          font-size: 0.75rem;
          font-weight: 800;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .btn-exit-kiosk:hover {
          background: #ef4444;
          color: #ffffff;
        }

        .brand-badge {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: #0f172a;
          font-weight: 900;
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
        }

        .brand-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .brand-title {
          font-size: 1.25rem;
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
          font-size: 0.65rem;
          font-weight: 800;
          text-transform: uppercase;
          padding: 2px 8px;
          border-radius: 20px;
        }

        .dealer-sub-text {
          font-size: 0.72rem;
          color: #94a3b8;
          margin: 2px 0 0 0;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .btn-mode-kiosk {
          background: #090d16;
          border: 1px solid #1e293b;
          color: #94a3b8;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 8px 14px;
          border-radius: 10px;
          cursor: pointer;
        }

        .btn-mode-kiosk.active-gold {
          background: rgba(245, 158, 11, 0.2);
          color: #fbbf24;
          border-color: #f59e0b;
        }

        .btn-mode-kiosk.active-sky {
          background: rgba(56, 189, 248, 0.2);
          color: #38bdf8;
          border-color: #38bdf8;
        }

        .btn-secondary-kiosk {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #1e293b;
          color: #e2e8f0;
          border: 1px solid #334155;
          padding: 8px 14px;
          border-radius: 10px;
          font-size: 0.75rem;
          font-weight: 700;
          cursor: pointer;
        }

        .btn-icon-kiosk {
          background: #1e293b;
          color: #94a3b8;
          border: none;
          padding: 8px;
          border-radius: 10px;
          cursor: pointer;
        }

        .kiosk-workspace-grid {
          flex: 1;
          display: grid;
          grid-template-columns: 380px 1fr;
          overflow: hidden;
        }

        .kiosk-sidebar {
          background: #0f172a;
          border-right: 1px solid #1e293b;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          overflow-y: auto;
        }

        .section-label-header {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.72rem;
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
          gap: 6px;
          background: #090d16;
          padding: 6px;
          border-radius: 10px;
          border: 1px solid #1e293b;
        }

        .target-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px 6px;
          border-radius: 6px;
          border: 1px solid transparent;
          background: #0f172a;
          color: #94a3b8;
          font-size: 0.7rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s ease;
          text-align: center;
        }

        .target-btn.active {
          background: #f59e0b;
          color: #0f172a;
          font-weight: 900;
          box-shadow: 0 2px 10px rgba(245, 158, 11, 0.3);
        }

        .brand-select-wrapper {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .kiosk-brand-dropdown {
          background: #090d16;
          border: 1px solid #334155;
          color: #ffffff;
          font-size: 0.8rem;
          font-weight: 800;
          padding: 10px 12px;
          border-radius: 10px;
          outline: none;
          cursor: pointer;
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
          font-size: 0.75rem;
          padding: 8px 12px 8px 32px;
          border-radius: 10px;
          outline: none;
        }

        .filter-pills-row {
          display: flex;
          gap: 6px;
          overflow-x: auto;
          padding-bottom: 2px;
        }

        .filter-pill {
          background: #090d16;
          border: 1px solid #1e293b;
          color: #94a3b8;
          padding: 5px 12px;
          border-radius: 8px;
          font-size: 0.7rem;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
        }

        .filter-pill.active {
          background: #1e293b;
          color: #fbbf24;
          border-color: rgba(245, 158, 11, 0.4);
        }

        .products-scroll-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          overflow-y: auto;
          flex: 1;
        }

        .product-touch-card {
          background: #090d16;
          border: 1px solid #1e293b;
          border-radius: 12px;
          padding: 8px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 6px;
          transition: all 0.15s ease;
        }

        .product-touch-card.active {
          border-color: #f59e0b;
          box-shadow: 0 0 14px rgba(245, 158, 11, 0.35);
          background: #141c2e;
        }

        .card-thumb-wrapper {
          height: 100px;
          background: #1e293b;
          border-radius: 8px;
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
          top: 4px;
          left: 4px;
          display: flex;
          gap: 4px;
        }

        .tag-floor {
          background: #f59e0b;
          color: #0f172a;
          font-size: 0.55rem;
          font-weight: 900;
          padding: 2px 6px;
          border-radius: 6px;
        }

        .tag-wall {
          background: #0284c7;
          color: #ffffff;
          font-size: 0.55rem;
          font-weight: 900;
          padding: 2px 6px;
          border-radius: 6px;
        }

        .tag-shower {
          background: #10b981;
          color: #ffffff;
          font-size: 0.55rem;
          font-weight: 900;
          padding: 2px 6px;
          border-radius: 6px;
        }

        .card-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .brand-name-pill {
          font-size: 0.6rem;
          color: #f59e0b;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }

        .product-title {
          font-size: 0.75rem;
          font-weight: 800;
          color: #ffffff;
          margin: 0;
          line-height: 1.25;
        }

        .product-specs {
          font-size: 0.65rem;
          color: #94a3b8;
          margin: 0;
        }

        .kiosk-canvas-area {
          background: #090d16;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .canvas-frame {
          flex: 1;
          background: #090d16;
          border: 1px solid #1e293b;
          border-radius: 18px;
          overflow: hidden;
          position: relative;
          min-height: 420px;
        }

        .canvas-active-target-overlay {
          position: absolute;
          top: 14px;
          left: 14px;
          background: rgba(15, 23, 42, 0.88);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(245, 158, 11, 0.4);
          padding: 8px 14px;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          pointer-events: none;
          z-index: 10;
        }

        .overlay-label {
          font-size: 0.62rem;
          color: #94a3b8;
          font-weight: 700;
          text-transform: uppercase;
        }

        .overlay-target-name {
          font-size: 0.85rem;
          font-weight: 900;
          color: #fbbf24;
        }

        .overlay-sub-hint {
          font-size: 0.6rem;
          color: #64748b;
        }

        .studio-bottom-bar {
          background: #0f172a;
          border: 1px solid #1e293b;
          border-radius: 16px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .controls-row {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .ctrl-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .ctrl-label {
          font-size: 0.7rem;
          color: #94a3b8;
          font-weight: 800;
          text-transform: uppercase;
        }

        .btn-group-sm {
          display: flex;
          gap: 4px;
        }

        .btn-sm {
          background: #090d16;
          border: 1px solid #1e293b;
          color: #94a3b8;
          font-size: 0.68rem;
          font-weight: 700;
          padding: 5px 10px;
          border-radius: 6px;
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
          gap: 6px;
        }

        .swatch-btn {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          border: 2px solid #334155;
          cursor: pointer;
        }

        .swatch-btn.active {
          border-color: #f59e0b;
          transform: scale(1.15);
          box-shadow: 0 0 8px rgba(245, 158, 11, 0.5);
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

        @media (max-width: 900px) {
          .kiosk-workspace-grid {
            grid-template-columns: 1fr;
          }
          .kiosk-sidebar {
            max-height: 350px;
          }
        }
      `}</style>
    </main>
  );
}
