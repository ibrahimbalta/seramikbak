'use client';

import { useState } from 'react';
import { Calculator, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

export default function TileCalculatorWidget({ onOpenQuoteModal }) {
  const [roomType, setRoomType] = useState('banyo');
  const [areaM2, setAreaM2] = useState(25);
  const [tileSize, setTileSize] = useState('60x120');
  const [wastagePercent, setWastagePercent] = useState(10);
  const [tileStyle, setTileStyle] = useState('mermer');

  // Tile coverage per box in m²
  const tileBoxMap = {
    '60x120': 1.44,
    '80x80': 1.28,
    '120x240': 2.88,
    '30x60': 1.44
  };

  // Average price per m² according to style
  const stylePriceMap = {
    'mermer': 420,
    'ahsap': 360,
    'beton': 320,
    'duz': 280
  };

  const boxCoverage = tileBoxMap[tileSize] || 1.44;
  const totalM2WithWastage = Math.round(areaM2 * (1 + wastagePercent / 100) * 10) / 10;
  const requiredBoxes = Math.ceil(totalM2WithWastage / boxCoverage);
  
  // 1 bag of 25kg adhesive covers ~5 m²
  const adhesiveBags = Math.ceil(totalM2WithWastage / 5);
  // 1 pack of 5kg grout covers ~15 m²
  const groutPacks = Math.ceil(totalM2WithWastage / 15);

  const basePricePerM2 = stylePriceMap[tileStyle] || 400;
  const estimatedMinCost = Math.round(totalM2WithWastage * basePricePerM2 * 0.9);
  const estimatedMaxCost = Math.round(totalM2WithWastage * basePricePerM2 * 1.15);

  const handleRequestQuote = () => {
    if (onOpenQuoteModal) {
      onOpenQuoteModal({
        areaM2,
        totalM2WithWastage,
        requiredBoxes,
        tileSize,
        roomType
      });
    } else {
      const dealerSec = document.getElementById('resmi-yetkili-bayiler-section');
      if (dealerSec) {
        dealerSec.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.42) 0%, rgba(15, 23, 42, 0.28) 100%)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderRadius: '20px',
      padding: '20px 24px',
      color: '#ffffff',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 16px 40px rgba(0, 0, 0, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
      margin: '24px 0 16px 0',
      transition: 'all 0.3s ease'
    }}>
      {/* Top Header Row (Compact Single Line) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '16px', background: 'rgba(212, 175, 55, 0.2)', border: '1px solid rgba(212, 175, 55, 0.4)', color: '#ffd700', fontSize: '0.75rem', fontWeight: '800' }}>
            <Calculator size={13} /> METRAJ & MALİYET ROBOTU
          </div>
          <h4 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0, color: '#ffffff', textShadow: '0 2px 6px rgba(0,0,0,0.6)' }}>
            Projenizin Malzeme ve Kutu İhtiyacını Anında Hesaplayın
          </h4>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#e2e8f0', background: 'rgba(0,0,0,0.25)', padding: '4px 12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <ShieldCheck size={14} style={{ color: '#38bdf8' }} />
          <span>%100 Doğru Kutu & Fire Hesabı</span>
        </div>
      </div>

      {/* Main Inputs & Calculation Grid (Compact Height) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px', alignItems: 'center' }}>
        
        {/* Left Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          {/* Room Type Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#e2e8f0', minWidth: '80px' }}>Mekan:</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', flex: 1 }}>
              {[
                { id: 'banyo', label: 'Banyo 🛁' },
                { id: 'mutfak', label: 'Mutfak 🍳' },
                { id: 'salon', label: 'Salon 🛋️' },
                { id: 'teras', label: 'Teras 🏡' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setRoomType(item.id)}
                  style={{
                    padding: '6px 4px',
                    borderRadius: '8px',
                    fontSize: '0.76rem',
                    fontWeight: '700',
                    border: 'none',
                    cursor: 'pointer',
                    background: roomType === item.id ? '#d4af37' : 'rgba(255,255,255,0.1)',
                    color: roomType === item.id ? '#0f172a' : '#f8fafc',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Area Slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#e2e8f0', minWidth: '80px' }}>Alan (m²):</span>
            <input
              type="range"
              min="5"
              max="250"
              value={areaM2}
              onChange={(e) => setAreaM2(Number(e.target.value))}
              style={{
                flex: 1,
                accentColor: '#d4af37',
                cursor: 'pointer',
                height: '5px'
              }}
            />
            <span style={{ fontSize: '0.95rem', fontWeight: '800', color: '#ffd700', minWidth: '45px', textAlign: 'right' }}>{areaM2} m²</span>
          </div>

          {/* Size & Style Dropdowns */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <select
              value={tileSize}
              onChange={(e) => setTileSize(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 10px',
                borderRadius: '8px',
                background: 'rgba(15, 23, 42, 0.7)',
                color: '#f8fafc',
                border: '1px solid rgba(255,255,255,0.2)',
                fontSize: '0.8rem',
                outline: 'none'
              }}
            >
              <option value="60x120">Ebat: 60x120 cm</option>
              <option value="80x80">Ebat: 80x80 cm</option>
              <option value="120x240">Ebat: 120x240 cm (Mega)</option>
              <option value="30x60">Ebat: 30x60 cm</option>
            </select>

            <select
              value={tileStyle}
              onChange={(e) => setTileStyle(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 10px',
                borderRadius: '8px',
                background: 'rgba(15, 23, 42, 0.7)',
                color: '#f8fafc',
                border: '1px solid rgba(255,255,255,0.2)',
                fontSize: '0.8rem',
                outline: 'none'
              }}
            >
              <option value="mermer">Doku: Mermer</option>
              <option value="ahsap">Doku: Ahşap</option>
              <option value="beton">Doku: Beton / Taş</option>
              <option value="duz">Doku: Düz / Modern</option>
            </select>
          </div>
        </div>

        {/* Right Results & Action (Inline Compact Box) */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(10px)',
          padding: '14px 18px',
          borderRadius: '14px',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: '#cbd5e1', display: 'block' }}>Gerekli Seramik Kutusu</span>
              <span style={{ fontSize: '1.25rem', fontWeight: '900', color: '#ffffff' }}>{requiredBoxes} Kutu <small style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 'normal' }}>({totalM2WithWastage} m²)</small></span>
            </div>

            <div>
              <span style={{ fontSize: '0.72rem', color: '#cbd5e1', display: 'block' }}>Harç / Derz</span>
              <span style={{ fontSize: '0.95rem', fontWeight: '800', color: '#ffffff' }}>{adhesiveBags} Çuval / {groutPacks} Pak</span>
            </div>

            <div>
              <span style={{ fontSize: '0.72rem', color: '#ffd700', fontWeight: '700', display: 'block' }}>Tahmini Bütçe</span>
              <span style={{ fontSize: '1.15rem', fontWeight: '900', color: '#ffffff' }}>₺{estimatedMinCost.toLocaleString('tr-TR')} - ₺{estimatedMaxCost.toLocaleString('tr-TR')}</span>
            </div>
          </div>

          <button
            onClick={handleRequestQuote}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #d4af37 0%, #c59b27 100%)',
              color: '#0f172a',
              fontWeight: '900',
              fontSize: '0.85rem',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: '0 4px 14px rgba(212, 175, 55, 0.35)',
              transition: 'all 0.2s ease'
            }}
          >
            <span>Bu Metraj İçin En Yakın Bayilerden Teklif Al</span>
            <ArrowRight size={15} />
          </button>
        </div>

      </div>
    </div>
  );
}
