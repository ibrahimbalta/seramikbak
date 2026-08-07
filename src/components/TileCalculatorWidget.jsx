'use client';

import { useState } from 'react';
import { Calculator, Package, Sparkles, Send, ArrowRight, ShieldCheck, Layers, Layers2 } from 'lucide-react';

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
      background: 'rgba(15, 23, 42, 0.72)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderRadius: '24px',
      padding: '32px',
      color: '#ffffff',
      border: '1px solid rgba(212, 175, 55, 0.35)',
      boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(212, 175, 55, 0.12)',
      position: 'relative',
      overflow: 'hidden',
      margin: '36px 0 10px 0'
    }}>
      {/* Subtle Ambient Radial Glow */}
      <div style={{
        position: 'absolute',
        top: '-80px',
        right: '-80px',
        width: '320px',
        height: '320px',
        background: 'radial-gradient(circle, rgba(212,175,55,0.2) 0%, rgba(0,0,0,0) 70%)',
        pointerEvents: 'none'
      }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '20px', background: 'rgba(212, 175, 55, 0.18)', border: '1px solid rgba(212, 175, 55, 0.4)', color: '#ffd700', fontSize: '0.8rem', fontWeight: '800', marginBottom: '8px' }}>
            <Calculator size={14} /> AKILLI MALİYET & METRAJ SİHİRBAZI
          </div>
          <h3 style={{ fontSize: '1.65rem', fontWeight: '800', margin: 0, color: '#f8fafc', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
            Projenizin Malzeme ve Kutu İhtiyacını Anında Hesaplayın
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(8px)', padding: '8px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)' }}>
          <ShieldCheck size={18} style={{ color: '#38bdf8' }} />
          <span style={{ fontSize: '0.82rem', color: '#e2e8f0', fontWeight: '600' }}>%100 Doğru Kutu & Fire Hesabı</span>
        </div>
      </div>

      {/* Grid Content */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '28px' }}>
        
        {/* Left Inputs Column */}
        <div style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(10px)', padding: '24px', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.1)' }}>
          
          {/* Room Type */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#cbd5e1', marginBottom: '10px' }}>1. Mekan Türü</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
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
                    padding: '10px 6px',
                    borderRadius: '10px',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    border: 'none',
                    cursor: 'pointer',
                    background: roomType === item.id ? '#d4af37' : 'rgba(255,255,255,0.08)',
                    color: roomType === item.id ? '#0f172a' : '#f1f5f9',
                    boxShadow: roomType === item.id ? '0 4px 12px rgba(212,175,55,0.4)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Area Slider / Input */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#cbd5e1' }}>2. Uygulama Alanı (m²)</label>
              <span style={{ fontSize: '1.05rem', fontWeight: '800', color: '#ffd700' }}>{areaM2} m²</span>
            </div>
            <input
              type="range"
              min="5"
              max="250"
              value={areaM2}
              onChange={(e) => setAreaM2(Number(e.target.value))}
              style={{
                width: '100%',
                accentColor: '#d4af37',
                cursor: 'pointer',
                height: '6px'
              }}
            />
          </div>

          {/* Tile Size & Style */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#cbd5e1', marginBottom: '6px' }}>Karo Ebadı</label>
              <select
                value={tileSize}
                onChange={(e) => setTileSize(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px',
                  borderRadius: '10px',
                  background: 'rgba(15, 23, 42, 0.85)',
                  color: '#f8fafc',
                  border: '1px solid rgba(255,255,255,0.2)',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              >
                <option value="60x120">60x120 cm</option>
                <option value="80x80">80x80 cm</option>
                <option value="120x240">120x240 cm (Mega)</option>
                <option value="30x60">30x60 cm</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#cbd5e1', marginBottom: '6px' }}>Seramik Dokusu</label>
              <select
                value={tileStyle}
                onChange={(e) => setTileStyle(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px',
                  borderRadius: '10px',
                  background: 'rgba(15, 23, 42, 0.85)',
                  color: '#f8fafc',
                  border: '1px solid rgba(255,255,255,0.2)',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              >
                <option value="mermer">Mermer Görünümlü</option>
                <option value="ahsap">Ahşap Dokulu</option>
                <option value="beton">Beton / Taş</option>
                <option value="duz">Düz / Modern</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Results Column */}
        <div style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.15) 0%, rgba(15,23,42,0.6) 100%)', backdropFilter: 'blur(12px)', padding: '24px', borderRadius: '18px', border: '1px solid rgba(212,175,55,0.3)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#f8fafc', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} style={{ color: '#ffd700' }} /> HESAPLANAN MALZEME GEREKSİNİMİ
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              <div style={{ background: 'rgba(15,23,42,0.65)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.12)' }}>
                <span style={{ fontSize: '0.75rem', color: '#cbd5e1', display: 'block' }}>Gerekli Seramik Kutusu</span>
                <span style={{ fontSize: '1.45rem', fontWeight: '900', color: '#ffffff' }}>{requiredBoxes} Kutu</span>
                <span style={{ fontSize: '0.72rem', color: '#38bdf8', display: 'block', marginTop: '2px' }}>({totalM2WithWastage} m² - %{wastagePercent} fire dahil)</span>
              </div>

              <div style={{ background: 'rgba(15,23,42,0.65)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.12)' }}>
                <span style={{ fontSize: '0.75rem', color: '#cbd5e1', display: 'block' }}>Harç & Derz İhtiyacı</span>
                <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#ffffff' }}>{adhesiveBags} Çuval / {groutPacks} Pak</span>
                <span style={{ fontSize: '0.72rem', color: '#e2e8f0', display: 'block', marginTop: '2px' }}>{adhesiveBags * 25} kg Yapıştırıcı</span>
              </div>
            </div>

            <div style={{ background: 'rgba(212,175,55,0.16)', padding: '16px', borderRadius: '14px', border: '1px solid rgba(212,175,55,0.4)', marginBottom: '20px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#ffd700', display: 'block', marginBottom: '4px' }}>TAHMİNİ ORTALAMA MALZEME BÜTÇESİ</span>
              <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#ffffff', textShadow: '0 2px 6px rgba(0,0,0,0.5)' }}>
                ₺{estimatedMinCost.toLocaleString('tr-TR')} - ₺{estimatedMaxCost.toLocaleString('tr-TR')}
              </div>
              <span style={{ fontSize: '0.72rem', color: '#e2e8f0' }}>* Bölgenizdeki yetkili bayi toptan indirimlerine göre değişiklik gösterebilir.</span>
            </div>
          </div>

          <button
            onClick={handleRequestQuote}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #d4af37 0%, #c59b27 100%)',
              color: '#0f172a',
              fontWeight: '900',
              fontSize: '0.96rem',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 8px 22px rgba(212, 175, 55, 0.4)',
              transition: 'all 0.2s ease'
            }}
          >
            <span>Bu Metraj İçin En Yakın Bayilerden Teklif Al</span>
            <ArrowRight size={18} />
          </button>

        </div>

      </div>
    </div>
  );
}
