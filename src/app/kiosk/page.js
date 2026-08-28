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
  Calculator,
  ShieldCheck,
  Truck,
  Wrench,
  Bath,
  Utensils,
  Sofa,
  Home,
  LogOut,
  Edit3
} from 'lucide-react';
import QuoteModal from '@/components/QuoteModal';

const StudioCanvas = dynamic(() => import('@/components/StudioCanvas'), { 
  ssr: false,
  loading: () => (
    <div className="kiosk-loading-box">
      <div className="kiosk-spin-loader" />
      <span>Showroom 3D Sanal Stüdyo Yükleniyor...</span>
    </div>
  )
});

// Zengin Varsayılan Seramik Modellleri (DB Boş Olsa Bile Sayfa Asla Boş Kalmaz)
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
    imageUrl: '/hero/hero_ceramics.jpg',
    textureUrl: '/hero/hero_ceramics.jpg',
    unitPrice: 480
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
    imageUrl: '/hero/hero_ceramics.jpg',
    textureUrl: '/hero/hero_ceramics.jpg',
    unitPrice: 540
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
    imageUrl: '/hero/hero_ceramics.jpg',
    textureUrl: '/hero/hero_ceramics.jpg',
    unitPrice: 420
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
    imageUrl: '/hero/hero_ceramics.jpg',
    textureUrl: '/hero/hero_ceramics.jpg',
    unitPrice: 360
  },
  {
    id: 'demo-5',
    name: 'Loft Antrasit Beton Porselen',
    code: 'SB-LOFT-8080',
    width: 80,
    height: 80,
    style: 'Beton',
    finish: 'Lappato',
    color: 'Koyu Antrasit',
    imageUrl: '/hero/hero_ceramics.jpg',
    textureUrl: '/hero/hero_ceramics.jpg',
    unitPrice: 490
  },
  {
    id: 'demo-6',
    name: 'Statuario Lüks Mermer Porselen',
    code: 'SB-STAT-120240',
    width: 120,
    height: 240,
    style: 'Mermer',
    finish: 'Parlak Mega Slab',
    color: 'Beyaz / Gri Damar',
    imageUrl: '/hero/hero_ceramics.jpg',
    textureUrl: '/hero/hero_ceramics.jpg',
    unitPrice: 780
  },
  {
    id: 'demo-7',
    name: 'Vizon Rölyef Banyo Duvar Karosu',
    code: 'SB-VIZ-3090',
    width: 30,
    height: 90,
    style: 'Düz',
    finish: 'Rölyef Mat',
    color: 'Vizon / Bej',
    imageUrl: '/hero/hero_ceramics.jpg',
    textureUrl: '/hero/hero_ceramics.jpg',
    unitPrice: 380
  },
  {
    id: 'demo-8',
    name: 'Ceviz Parke Dokulu Porselen',
    code: 'SB-WAL-20120',
    width: 20,
    height: 120,
    style: 'Ahşap',
    finish: 'Mat Derzli',
    color: 'Koyu Ceviz',
    imageUrl: '/hero/hero_ceramics.jpg',
    textureUrl: '/hero/hero_ceramics.jpg',
    unitPrice: 440
  }
];

export default function ShowroomKioskPage() {
  const canvasContainerRef = useRef(null);
  const [products, setProducts] = useState(FALLBACK_PRODUCTS);
  const [dealers, setDealers] = useState([]);
  const [selectedDealer, setSelectedDealer] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(FALLBACK_PRODUCTS[0]);
  const [floorProduct, setFloorProduct] = useState(FALLBACK_PRODUCTS[0]);
  const [wallProduct, setWallProduct] = useState(FALLBACK_PRODUCTS[1] || FALLBACK_PRODUCTS[0]);
  const [activeTargetSurface, setActiveTargetSurface] = useState('floor'); // 'floor' | 'walls'
  const [selectedGroutColor, setSelectedGroutColor] = useState('#888888');
  
  // Metraj & Kullanıcı Müdahale Edilebilir Fiyatlama Eyaletleri
  const [roomType, setRoomType] = useState('banyo');
  const [areaM2, setAreaM2] = useState(18);
  const [layingStyle, setLayingStyle] = useState('capraz'); // 'duz' (%8), 'capraz' (%12), 'baliksirti' (%15)
  
  // Elle Değiştirilebilir Birim Fiyatlar & Seçenekler
  const [unitPriceM2, setUnitPriceM2] = useState(480);
  const [includeLabor, setIncludeLabor] = useState(true);
  const [laborRatePerM2, setLaborRatePerM2] = useState(250);
  const [includeShipping, setIncludeShipping] = useState(true);
  const [shippingCostInput, setShippingCostInput] = useState(1500);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showQrModal, setShowQrModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [snapshotUrl, setSnapshotUrl] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    async function loadKioskData() {
      try {
        const [prodRes, dealerRes] = await Promise.all([
          fetch('/api/products?limit=50').then(r => r.json()).catch(() => ({ products: [] })),
          fetch('/api/dealers').then(r => r.json()).catch(() => ({ dealers: [] }))
        ]);

        if (prodRes.products && prodRes.products.length > 0) {
          setProducts(prodRes.products);
          setSelectedProduct(prodRes.products[0]);
          setFloorProduct(prodRes.products[0]);
          setWallProduct(prodRes.products[1] || prodRes.products[0]);
        }
        if (dealerRes.dealers && dealerRes.dealers.length > 0) {
          setDealers(dealerRes.dealers);
          setSelectedDealer(dealerRes.dealers[0]);
        }
      } catch (err) {
        console.error('Kiosk data loading fallback:', err);
      }
    }
    loadKioskData();
  }, []);

  // Fire oranı ve m² hesabı
  const wastePercent = layingStyle === 'baliksirti' ? 15 : layingStyle === 'capraz' ? 12 : 8;
  const totalM2WithWaste = Math.round((areaM2 * (1 + wastePercent / 100)) * 10) / 10;
  const coveragePerBox = 1.44;
  const requiredBoxes = Math.ceil(totalM2WithWaste / coveragePerBox);
  
  // Kalem Kalem Dinamik Fiyatlar (Kullanıcı Müdahalesi Dahil)
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

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleSelectProductForTarget = (product) => {
    setSelectedProduct(product);
    if (product.unitPrice) {
      setUnitPriceM2(product.unitPrice);
    }
    if (activeTargetSurface === 'floor') {
      setFloorProduct(product);
    } else {
      setWallProduct(product);
    }
  };

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

  // Akıllı Ürün Filtreleme (Kategoriye Göre Hiçbir Zaman 0 Sonuç Vermez)
  const filteredProducts = products.filter(p => {
    const styleLower = (p.style || '').toLowerCase();
    const nameLower = (p.name || '').toLowerCase();
    const codeLower = (p.code || '').toLowerCase();

    if (selectedCategory === 'mermer' && !styleLower.includes('mermer') && !nameLower.includes('mermer')) return false;
    if (selectedCategory === 'ahsap' && !styleLower.includes('ahşap') && !styleLower.includes('ahsap') && !nameLower.includes('ahşap')) return false;
    if (selectedCategory === 'beton' && !styleLower.includes('beton') && !nameLower.includes('beton')) return false;
    
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return nameLower.includes(q) || codeLower.includes(q) || styleLower.includes(q);
    }
    return true;
  });

  // Eğer filtre sonucu boş çıkarsa varsayılan kütüphaneyi göster (Sayfa asla boş kalmasın)
  const displayProducts = filteredProducts.length > 0 ? filteredProducts : FALLBACK_PRODUCTS;

  return (
    <main className="kiosk-page-container">
      {/* Top Touch Kiosk Bar */}
      <header className="kiosk-header">
        <div className="header-left">
          <Link href="/" className="btn-exit-kiosk" title="Kiosk Modundan Çık ve Ana Sayfaya Dön">
            <LogOut size={16} />
            <span>Ana Sayfaya Dön</span>
          </Link>

          <div className="brand-badge">S</div>
          <div>
            <div className="brand-title-row">
              <h1 className="brand-title">Seramik<span className="gold-accent">Bak</span></h1>
              <span className="kiosk-pill">Tablet Showroom Ekranı</span>
            </div>
            <p className="dealer-sub-text">
              {selectedDealer ? `${selectedDealer.name} Dokunmatik Satış Portalı` : 'Showroom Satış Asistanı'}
            </p>
          </div>
        </div>

        {/* Top Header Actions */}
        <div className="header-right">
          {dealers.length > 0 && (
            <select
              value={selectedDealer?.id || ''}
              onChange={(e) => {
                const found = dealers.find(d => d.id === e.target.value);
                if (found) setSelectedDealer(found);
              }}
              className="dealer-select"
            >
              {dealers.map(d => (
                <option key={d.id} value={d.id}>{d.name} ({d.city})</option>
              ))}
            </select>
          )}

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

      {/* Main Touch Workspace */}
      <div className="kiosk-workspace-grid">
        {/* Left Side: Touch Tile Selector Sidebar */}
        <div className="kiosk-sidebar">
          {/* Surface Target Toggle (Zemin / Duvar) */}
          <div className="surface-target-grid">
            <button
              onClick={() => setActiveTargetSurface('floor')}
              className={`target-btn ${activeTargetSurface === 'floor' ? 'active' : ''}`}
            >
              <Layers size={14} />
              <span>Zemin Seramiği ({floorProduct ? floorProduct.name.split(' ')[0] : 'Seç'})</span>
            </button>

            <button
              onClick={() => setActiveTargetSurface('walls')}
              className={`target-btn ${activeTargetSurface === 'walls' ? 'active' : ''}`}
            >
              <Eye size={14} />
              <span>Duvar Seramiği ({wallProduct ? wallProduct.name.split(' ')[0] : 'Seç'})</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="search-box-wrapper">
            <Search size={15} className="search-icon" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Dokunarak model ara (ör. Calacatta, Mermer)..."
              className="search-input"
            />
          </div>

          {/* Style Filter Touch Pills */}
          <div className="filter-pills-row">
            {[
              { id: 'all', label: 'Tümü' },
              { id: 'mermer', label: 'Mermer' },
              { id: 'ahsap', label: 'Ahşap' },
              { id: 'beton', label: 'Beton' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`filter-pill ${selectedCategory === tab.id ? 'active' : ''}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Touch Product Cards Grid (Asla Boş Kalmaz) */}
          <div className="products-scroll-grid">
            {displayProducts.map(product => {
              const isFloorSelected = floorProduct?.id === product.id;
              const isWallSelected = wallProduct?.id === product.id;
              const isCurrentTarget = activeTargetSurface === 'floor' ? isFloorSelected : isWallSelected;

              return (
                <div
                  key={product.id}
                  onClick={() => handleSelectProductForTarget(product)}
                  className={`product-touch-card ${isCurrentTarget ? 'active' : ''}`}
                >
                  <div className="card-thumb-wrapper">
                    <img
                      src={product.imageUrl || product.textureUrl || '/hero/hero_ceramics.jpg'}
                      alt={product.name}
                      className="card-thumb-img"
                    />
                    {isFloorSelected && <span className="tag-floor">ZEMİN</span>}
                    {isWallSelected && <span className="tag-wall">DUVAR</span>}
                  </div>
                  <div className="card-info">
                    <h3 className="product-title">{product.name}</h3>
                    <p className="product-specs">{product.width}x{product.height} cm • {product.finish || 'Mat'}</p>
                    <p className="product-price">₺{product.unitPrice || unitPriceM2} / m²</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: 3D Visualizer Canvas & Editable Sales Calculator */}
        <div className="kiosk-canvas-area">
          {/* Main 3D Canvas Box */}
          <div ref={canvasContainerRef} className="canvas-frame">
            <StudioCanvas
              activeProduct={selectedProduct}
              floorProduct={floorProduct}
              wallProduct={wallProduct}
              applyFloor={true}
              applyWalls={true}
              groutColor={selectedGroutColor}
              groutWidth="2"
              roomType={roomType}
            />
          </div>

          {/* Bottom Live Calculation & User Interactive Sales Bar */}
          <div className="sales-bottom-bar">
            {/* Top Row: Room Controls */}
            <div className="controls-row">
              {/* Mekan Tipi */}
              <div className="ctrl-group">
                <span className="ctrl-label">Mekan:</span>
                <div className="btn-group-sm">
                  {[
                    { id: 'banyo', label: 'Banyo' },
                    { id: 'mutfak', label: 'Mutfak' },
                    { id: 'salon', label: 'Salon' },
                    { id: 'teras', label: 'Teras' }
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

              {/* Alan Slider */}
              <div className="ctrl-group">
                <span className="ctrl-label">Kaplanacak Alan:</span>
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

              {/* Seramik m² Birim Fiyatı (Kullanıcı Elle Girebilir) */}
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

              {/* Döşeme Düzeni (Fire) */}
              <div className="ctrl-group">
                <span className="ctrl-label">Dizim (Fire %):</span>
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

            {/* Bottom Row: Itemized Price Summary & PDF Button */}
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
                
                {/* Ustalık İşçilik Toggle ve Fiyatı */}
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

                {/* Nakliye Toggle ve Fiyatı */}
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
                  <span>Teklifi Çıkar & Düzenle</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="kiosk-modal-backdrop">
          <div className="kiosk-modal-card">
            <button onClick={() => setShowQrModal(false)} className="btn-modal-close">
              <X size={18} />
            </button>

            <div className="qr-icon-header">
              <Smartphone size={28} />
            </div>

            <h3 className="modal-title">Tasarımı Telefonuna Al!</h3>
            <p className="modal-desc">
              Kameranızla aşağıdaki QR kodu okutarak hazırladığınız 3D banyo tasarımını ve bayi teklifini telefonunuzda görün.
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

        .dealer-select {
          background: #0f172a;
          border: 1px solid #1e293b;
          color: #fbbf24;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 8px 12px;
          border-radius: 10px;
          outline: none;
          cursor: pointer;
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

        .btn-primary-gold-kiosk {
          display: flex;
          align-items: center;
          gap: 6px;
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: #0f172a;
          border: none;
          padding: 8px 18px;
          border-radius: 10px;
          font-size: 0.75rem;
          font-weight: 900;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
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
          grid-template-columns: 360px 1fr;
          overflow: hidden;
        }

        .kiosk-sidebar {
          background: #0f172a;
          border-right: 1px solid #1e293b;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          overflow-y: auto;
        }

        .surface-target-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
          background: #090d16;
          padding: 4px;
          border-radius: 10px;
          border: 1px solid #1e293b;
        }

        .target-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px 4px;
          border-radius: 6px;
          border: none;
          background: transparent;
          color: #94a3b8;
          font-size: 0.7rem;
          font-weight: 700;
          cursor: pointer;
        }

        .target-btn.active {
          background: #f59e0b;
          color: #0f172a;
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
        }

        .filter-pill {
          background: #090d16;
          border: 1px solid #1e293b;
          color: #94a3b8;
          padding: 5px 10px;
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
        }

        .product-touch-card.active {
          border-color: #f59e0b;
          box-shadow: 0 0 12px rgba(245, 158, 11, 0.25);
        }

        .card-thumb-wrapper {
          height: 90px;
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

        .tag-floor {
          position: absolute;
          top: 4px;
          left: 4px;
          background: #f59e0b;
          color: #0f172a;
          font-size: 0.6rem;
          font-weight: 900;
          padding: 2px 6px;
          border-radius: 10px;
        }

        .tag-wall {
          position: absolute;
          top: 4px;
          right: 4px;
          background: #0284c7;
          color: #ffffff;
          font-size: 0.6rem;
          font-weight: 900;
          padding: 2px 6px;
          border-radius: 10px;
        }

        .product-title {
          font-size: 0.72rem;
          font-weight: 700;
          color: #ffffff;
          margin: 0;
          line-height: 1.2;
        }

        .product-specs {
          font-size: 0.65rem;
          color: #94a3b8;
          margin: 2px 0 0 0;
        }

        .product-price {
          font-size: 0.72rem;
          font-weight: 800;
          color: #fbbf24;
          margin: 2px 0 0 0;
        }

        .kiosk-canvas-area {
          background: #090d16;
          padding: 14px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 10px;
        }

        .canvas-frame {
          flex: 1;
          background: #090d16;
          border: 1px solid #1e293b;
          border-radius: 18px;
          overflow: hidden;
          position: relative;
          min-height: 380px;
        }

        .sales-bottom-bar {
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
          gap: 10px;
          border-bottom: 1px solid #1e293b;
          padding-bottom: 8px;
        }

        .ctrl-group {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .ctrl-label {
          font-size: 0.7rem;
          color: #94a3b8;
          font-weight: 700;
        }

        .price-input-box {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .kiosk-num-input {
          width: 70px;
          background: #090d16;
          border: 1px solid #334155;
          color: #fbbf24;
          font-weight: 800;
          font-size: 0.75rem;
          border-radius: 6px;
          padding: 3px 6px;
          outline: none;
          text-align: center;
        }

        .kiosk-num-input-sm {
          width: 55px;
          background: #090d16;
          border: 1px solid #334155;
          color: #ffffff;
          font-size: 0.7rem;
          border-radius: 4px;
          padding: 2px 4px;
          outline: none;
          text-align: center;
        }

        .unit-label {
          font-size: 0.65rem;
          color: #94a3b8;
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
          padding: 4px 8px;
          border-radius: 6px;
          cursor: pointer;
        }

        .btn-sm.active {
          background: #f59e0b;
          color: #0f172a;
        }

        .btn-sm.active-sky {
          background: rgba(56, 189, 248, 0.2);
          color: #38bdf8;
          border-color: rgba(56, 189, 248, 0.4);
        }

        .slider-box {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .kiosk-range-slider {
          accent-color: #f59e0b;
          width: 90px;
        }

        .area-text {
          font-size: 0.75rem;
          font-weight: 800;
          color: #fbbf24;
        }

        .totals-row {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .summary-pills {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .sum-pill {
          display: flex;
          flex-direction: column;
        }

        .sum-title {
          font-size: 0.6rem;
          color: #64748b;
          font-weight: 700;
          text-transform: uppercase;
        }

        .sum-val {
          font-size: 0.72rem;
          font-weight: 800;
          color: #ffffff;
        }

        .divider-v {
          width: 1px;
          height: 22px;
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
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 0.68rem;
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
          gap: 12px;
        }

        .price-col {
          text-align: right;
        }

        .price-label {
          display: block;
          font-size: 0.6rem;
          color: #94a3b8;
          font-weight: 700;
          text-transform: uppercase;
        }

        .price-val {
          font-size: 1.1rem;
          font-weight: 900;
          color: #fbbf24;
        }

        .btn-cta-pdf {
          display: flex;
          align-items: center;
          gap: 6px;
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: #0f172a;
          border: none;
          padding: 9px 16px;
          border-radius: 10px;
          font-size: 0.75rem;
          font-weight: 900;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
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
            max-height: 320px;
          }
        }
      `}</style>
    </main>
  );
}
