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
  Camera
} from 'lucide-react';
import QuoteModal from '@/components/QuoteModal';

const StudioCanvas = dynamic(() => import('@/components/StudioCanvas'), { 
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center min-h-[500px] bg-slate-950 text-slate-400 rounded-3xl border border-slate-800 p-8">
      <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
      <span className="text-base font-bold text-slate-200">Showroom 3D Sanal Stüdyo Yükleniyor...</span>
    </div>
  )
});

export default function ShowroomKioskPage() {
  const canvasContainerRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [selectedDealer, setSelectedDealer] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [floorProduct, setFloorProduct] = useState(null);
  const [wallProduct, setWallProduct] = useState(null);
  const [activeTargetSurface, setActiveTargetSurface] = useState('floor'); // 'floor' | 'walls'
  const [selectedGroutColor, setSelectedGroutColor] = useState('#888888');
  
  // Metraj & Fiyatlama Eyaletleri
  const [roomType, setRoomType] = useState('banyo');
  const [areaM2, setAreaM2] = useState(18);
  const [layingStyle, setLayingStyle] = useState('capraz'); // 'duz' (%8), 'capraz' (%12), 'baliksirti' (%15)
  const [includeLabor, setIncludeLabor] = useState(true);
  const [includeShipping, setIncludeShipping] = useState(true);
  const [unitPriceM2, setUnitPriceM2] = useState(480);
  
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
          if (prodRes.products.length > 1) {
            setWallProduct(prodRes.products[1]);
          } else {
            setWallProduct(prodRes.products[0]);
          }
        }
        if (dealerRes.dealers && dealerRes.dealers.length > 0) {
          setDealers(dealerRes.dealers);
          setSelectedDealer(dealerRes.dealers[0]);
        }
      } catch (err) {
        console.error('Kiosk data loading error:', err);
      }
    }
    loadKioskData();
  }, []);

  // Fire oranı
  const wastePercent = layingStyle === 'baliksirti' ? 15 : layingStyle === 'capraz' ? 12 : 8;
  const totalM2WithWaste = Math.round((areaM2 * (1 + wastePercent / 100)) * 10) / 10;
  const coveragePerBox = 1.44;
  const requiredBoxes = Math.ceil(totalM2WithWaste / coveragePerBox);
  
  // Kalem Kalem Fiyatlar
  const tileCost = Math.round(totalM2WithWaste * unitPriceM2);
  const adhesiveBags = Math.ceil(totalM2WithWaste / 5);
  const adhesiveCost = adhesiveBags * 280;
  const groutPacks = Math.ceil(totalM2WithWaste / 15);
  const groutCost = groutPacks * 180;
  const laborCost = includeLabor ? Math.round(totalM2WithWaste * 250) : 0;
  const shippingCost = includeShipping ? 1500 : 0;

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
    if (activeTargetSurface === 'floor') {
      setFloorProduct(product);
    } else {
      setWallProduct(product);
    }
  };

  const handleOpenQuoteModal = () => {
    // 3D Canvas Snapshot Al
    try {
      const canvasEl = document.querySelector('canvas');
      if (canvasEl) {
        const snap = canvasEl.toDataURL('image/jpeg', 0.9);
        setSnapshotUrl(snap);
      }
    } catch (e) {
      console.warn('Snapshot screenshot exception:', e);
    }
    setShowQuoteModal(true);
  };

  const filteredProducts = products.filter(p => {
    if (selectedCategory === 'mermer' && !(p.style || '').toLowerCase().includes('mermer')) return false;
    if (selectedCategory === 'ahsap' && !(p.style || '').toLowerCase().includes('ahşap') && !(p.style || '').toLowerCase().includes('ahsap')) return false;
    if (selectedCategory === 'beton' && !(p.style || '').toLowerCase().includes('beton')) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (p.name || '').toLowerCase().includes(q) || (p.code || '').toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <main className="min-h-screen bg-slate-950 text-white font-sans selection:bg-amber-500 selection:text-slate-950 overflow-hidden flex flex-col">
      {/* Top Touch Kiosk Bar */}
      <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-6 py-3 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center font-black text-slate-950 text-xl shadow-lg shadow-amber-500/20">
            S
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                Seramik<span className="text-amber-400">Bak</span>
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                Tablet Showroom Ekranı
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              {selectedDealer ? `${selectedDealer.name} Dokunmatik Satış Portalı` : 'Showroom Satış Asistanı'}
            </p>
          </div>
        </div>

        {/* Top Header Actions */}
        <div className="flex items-center gap-3">
          {/* Bayi Seçici Dropdown */}
          {dealers.length > 0 && (
            <select
              value={selectedDealer?.id || ''}
              onChange={(e) => {
                const found = dealers.find(d => d.id === e.target.value);
                if (found) setSelectedDealer(found);
              }}
              className="bg-slate-950 border border-slate-800 text-amber-400 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
            >
              {dealers.map(d => (
                <option key={d.id} value={d.id}>{d.name} ({d.city})</option>
              ))}
            </select>
          )}

          <button
            onClick={() => setShowQrModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-amber-400" />
            <span>QR ile İndir</span>
          </button>

          <button
            onClick={handleOpenQuoteModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/25 hover:from-amber-400 hover:to-amber-500 transition-all cursor-pointer animate-pulse"
          >
            <FileText className="w-4 h-4" />
            <span>PDF Teklif Oluştur</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
            title="Tam Ekran"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Main Touch Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left Side: Touch Tile Selector Sidebar (4 Cols) */}
        <div className="lg:col-span-4 bg-slate-900 border-r border-slate-800 p-4 flex flex-col gap-3 overflow-y-auto custom-scrollbar">
          {/* Surface Target Toggle (Zemin / Duvar) */}
          <div className="bg-slate-950 p-1.5 rounded-2xl border border-slate-800 grid grid-cols-2 gap-2">
            <button
              onClick={() => setActiveTargetSurface('floor')}
              className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTargetSurface === 'floor'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Zemin Seramiği ({floorProduct ? floorProduct.name.split(' ')[0] : 'Seç'})</span>
            </button>

            <button
              onClick={() => setActiveTargetSurface('walls')}
              className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTargetSurface === 'walls'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Duvar Seramiği ({wallProduct ? wallProduct.name.split(' ')[0] : 'Seç'})</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Dokunarak model ara (ör. Calacatta, Mermer)..."
              className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Style Filter Touch Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[
              { id: 'all', label: 'Tümü' },
              { id: 'mermer', label: 'Mermer' },
              { id: 'ahsap', label: 'Ahşap' },
              { id: 'beton', label: 'Beton' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === tab.id
                    ? 'bg-slate-800 text-amber-400 border border-amber-500/50'
                    : 'bg-slate-950 border border-slate-800 text-slate-400'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Touch Product Cards Grid */}
          <div className="grid grid-cols-2 gap-3 flex-1 overflow-y-auto min-h-[300px] custom-scrollbar">
            {filteredProducts.map(product => {
              const isFloorSelected = floorProduct?.id === product.id;
              const isWallSelected = wallProduct?.id === product.id;
              const isCurrentTarget = activeTargetSurface === 'floor' ? isFloorSelected : isWallSelected;

              return (
                <div
                  key={product.id}
                  onClick={() => handleSelectProductForTarget(product)}
                  className={`bg-slate-950 border rounded-2xl p-2.5 cursor-pointer transition-all flex flex-col justify-between ${
                    isCurrentTarget
                      ? 'border-amber-500 ring-2 ring-amber-500/40 shadow-xl'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="h-24 bg-slate-900 rounded-xl overflow-hidden mb-2 relative">
                    <img
                      src={product.imageUrl || product.textureUrl || '/hero/hero_ceramics.jpg'}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    {isFloorSelected && (
                      <span className="absolute top-1.5 left-1.5 bg-amber-500 text-slate-950 font-black text-[9px] px-1.5 py-0.5 rounded-full">
                        ZEMİN
                      </span>
                    )}
                    {isWallSelected && (
                      <span className="absolute top-1.5 right-1.5 bg-sky-500 text-slate-950 font-black text-[9px] px-1.5 py-0.5 rounded-full">
                        DUVAR
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-xs leading-snug line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-[10px] text-amber-400 font-medium mt-0.5">
                      {product.width}x{product.height} cm • {product.finish || 'Mat'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: 3D Visualizer Canvas & Sales Calculator (8 Cols) */}
        <div className="lg:col-span-8 bg-slate-950 p-4 flex flex-col justify-between relative overflow-hidden">
          {/* Main 3D Canvas */}
          <div ref={canvasContainerRef} className="flex-1 rounded-3xl border border-slate-800 overflow-hidden relative shadow-2xl bg-slate-950 min-h-[360px]">
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

          {/* Bottom Live Calculation & Sales Bar */}
          <div className="mt-3 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
            {/* Top Row: Room Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-3">
              {/* Mekan Tipi */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-bold">Mekan:</span>
                <div className="flex items-center gap-1">
                  {[
                    { id: 'banyo', label: 'Banyo' },
                    { id: 'mutfak', label: 'Mutfak' },
                    { id: 'salon', label: 'Salon' },
                    { id: 'teras', label: 'Teras' }
                  ].map(r => (
                    <button
                      key={r.id}
                      onClick={() => setRoomType(r.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        roomType === r.id ? 'bg-amber-500 text-slate-950' : 'bg-slate-950 text-slate-400 hover:text-white'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Alan Slider */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 font-bold">Kaplanacak Alan:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="5"
                    max="150"
                    value={areaM2}
                    onChange={(e) => setAreaM2(Number(e.target.value))}
                    className="accent-amber-500 bg-slate-950 h-2 rounded-lg cursor-pointer w-28"
                  />
                  <span className="text-amber-400 text-xs font-extrabold w-12 text-right">{areaM2} m²</span>
                </div>
              </div>

              {/* Döşeme Düzeni (Fire) */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-bold">Dizim (Fire %):</span>
                <div className="flex items-center gap-1">
                  {[
                    { id: 'duz', label: 'Düz (%8)' },
                    { id: 'capraz', label: 'Çapraz (%12)' },
                    { id: 'baliksirti', label: 'Balıksırtı (%15)' }
                  ].map(style => (
                    <button
                      key={style.id}
                      onClick={() => setLayingStyle(style.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        layingStyle === style.id ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40' : 'bg-slate-950 text-slate-400'
                      }`}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Row: Itemized Price Summary & PDF Button */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Gereken Seramik</span>
                  <span className="text-white font-extrabold">{totalM2WithWaste} m² ({requiredBoxes} Kutu)</span>
                </div>
                <div className="h-6 w-px bg-slate-800" />
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Sarfiyat (Harç/Derz)</span>
                  <span className="text-slate-300 font-bold">{adhesiveBags} Çuval / {groutPacks} Pak</span>
                </div>
                <div className="h-6 w-px bg-slate-800" />
                {/* Usta Toggle */}
                <button
                  onClick={() => setIncludeLabor(!includeLabor)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    includeLabor ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-slate-950 text-slate-500'
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>{includeLabor ? 'Ustalık Dahil' : '+ Ustalık Ekle'}</span>
                </button>
                {/* Nakliye Toggle */}
                <button
                  onClick={() => setIncludeShipping(!includeShipping)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    includeShipping ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40' : 'bg-slate-950 text-slate-500'
                  }`}
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>{includeShipping ? 'Nakliye Dahil' : '+ Nakliye Ekle'}</span>
                </button>
              </div>

              {/* Total Price & CTA */}
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Tahmini Toplam (KDV Dahil)</span>
                  <span className="text-amber-400 text-lg font-black tracking-tight">₺{grandTotal.toLocaleString('tr-TR')}</span>
                </div>

                <button
                  onClick={handleOpenQuoteModal}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>Teklifi Çıkar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-8 text-center relative shadow-2xl">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-4">
              <Smartphone className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-bold text-white mb-2">Tasarımı Telefonuna Al!</h3>
            <p className="text-xs text-slate-300 mb-6">
              Kameranızla aşağıdaki QR kodu okutarak hazırladığınız 3D banyo tasarımını ve bayi teklifini telefonunuzda görün.
            </p>

            <div className="bg-white p-4 rounded-2xl inline-block mb-6 shadow-xl">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent('https://www.seramikbak.com/kiosk')}`}
                alt="Showroom QR"
                className="w-44 h-44 mx-auto"
              />
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl transition-all cursor-pointer"
            >
              Anlaşıldı, Kapat
            </button>
          </div>
        </div>
      )}

      {/* Official Quote Modal */}
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
            unitPriceM2,
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
    </main>
  );
}
