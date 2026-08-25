'use client';

import React, { useState, useEffect } from 'react';
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
  Smartphone
} from 'lucide-react';

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
  const [products, setProducts] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [selectedDealer, setSelectedDealer] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedGroutColor, setSelectedGroutColor] = useState('#eae6df');
  const [roomSizeM2, setRoomSizeM2] = useState(15);
  const [activeTab, setActiveTab] = useState('3d'); // '3d' | 'catalog'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showQrModal, setShowQrModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    async function loadKioskData() {
      try {
        const [prodRes, dealerRes] = await Promise.all([
          fetch('/api/products?limit=30').then(r => r.json()).catch(() => ({ products: [] })),
          fetch('/api/dealers').then(r => r.json()).catch(() => ({ dealers: [] }))
        ]);

        if (prodRes.products && prodRes.products.length > 0) {
          setProducts(prodRes.products);
          setSelectedProduct(prodRes.products[0]);
        }
        if (dealerRes.dealers && dealerRes.dealers.length > 0) {
          setDealers(dealerRes.dealers);
          setSelectedDealer(dealerRes.dealers[0]);
        }
      } catch (err) {
        console.error('Kiosk data error:', err);
      }
    }
    loadKioskData();
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
      <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between shrink-0">
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
                Showroom Kiosk Modu
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              {selectedDealer ? `${selectedDealer.name} Dokunmatik Ekran Stüdyosu` : 'Canlı Dokunmatik Showroom Ekranı'}
            </p>
          </div>
        </div>

        {/* Top Header Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowQrModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition-all cursor-pointer"
          >
            <QrCode className="w-4 h-4" />
            <span>Tasarımı Cebine Al (QR Kod)</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
            title="Tam Ekran"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Main Touch Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left Side: Touch Tile Selector Sidebar */}
        <div className="lg:col-span-4 bg-slate-900 border-r border-slate-800 p-5 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Dokunarak model ara (ör. Calacatta, Mermer)..."
              className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-2xl pl-10 pr-4 py-3.5 focus:outline-none focus:border-amber-500"
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
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === tab.id
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-950 border border-slate-800 text-slate-400'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Large Touch Product Cards */}
          <div className="grid grid-cols-2 gap-3 flex-1 overflow-y-auto">
            {filteredProducts.map(product => {
              const isSelected = selectedProduct?.id === product.id;
              return (
                <div
                  key={product.id}
                  onClick={() => setSelectedProduct(product)}
                  className={`bg-slate-950 border rounded-2xl p-3 cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected ? 'border-amber-500 ring-2 ring-amber-500/40 shadow-xl' : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="h-28 bg-slate-900 rounded-xl overflow-hidden mb-2 relative">
                    <img
                      src={product.imageUrl || product.textureUrl || '/textures/calacatta_gold.jpg'}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-amber-500 text-slate-950 p-1 rounded-full shadow">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
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

        {/* Right Side: 3D Visualizer Canvas & Controls */}
        <div className="lg:col-span-8 bg-slate-950 p-6 flex flex-col justify-between relative overflow-hidden">
          {/* Main 3D Canvas */}
          <div className="flex-1 rounded-3xl border border-slate-800 overflow-hidden relative shadow-2xl bg-slate-950">
            {selectedProduct && (
              <StudioCanvas
                selectedProduct={selectedProduct}
                groutColor={selectedGroutColor}
                roomSizeM2={roomSizeM2}
              />
            )}
          </div>

          {/* Bottom Touch Controls */}
          <div className="mt-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
            {/* Derz Rengi Seçici */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 font-bold">Derz Rengi:</span>
              <div className="flex items-center gap-2">
                {[
                  { name: 'Fildişi', hex: '#eae6df' },
                  { name: 'Gümüş Gri', hex: '#94a3b8' },
                  { name: 'Antrasit', hex: '#334155' },
                  { name: 'Siyah', hex: '#0f172a' }
                ].map(c => (
                  <button
                    key={c.hex}
                    onClick={() => setSelectedGroutColor(c.hex)}
                    className={`w-8 h-8 rounded-full border-2 transition-transform cursor-pointer ${
                      selectedGroutColor === c.hex ? 'border-amber-400 scale-110 shadow-lg shadow-amber-500/20' : 'border-slate-700'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            {/* Kaplanacak m² Slider */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 font-bold">Alan:</span>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={roomSizeM2}
                  onChange={(e) => setRoomSizeM2(Number(e.target.value))}
                  className="accent-amber-500 bg-slate-950 h-2 rounded-lg cursor-pointer w-32"
                />
                <span className="text-amber-400 text-xs font-extrabold w-12 text-right">{roomSizeM2} m²</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Scan Modal */}
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
              Kameranızla aşağıdaki QR kodu okutarak hazırladığınız 3D banyo tasarımını telefonunuzda açın.
            </p>

            <div className="bg-white p-4 rounded-2xl inline-block mb-6 shadow-xl">
              {/* QR Code SVG */}
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent('https://www.seramikbak.com')}`}
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
    </main>
  );
}
