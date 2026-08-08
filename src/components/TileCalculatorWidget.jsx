'use client';

import { useState } from 'react';
import { Calculator, ArrowRight, ShieldCheck } from 'lucide-react';

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
    <div className="tile-calculator-card">
      {/* Top Header Section */}
      <div className="tile-calc-header">
        <div className="tile-calc-badges">
          <div className="badge-gold">
            <Calculator size={13} />
            <span>MALİYET ROBOTU</span>
          </div>
          <div className="badge-trust">
            <ShieldCheck size={14} style={{ color: '#38bdf8' }} />
            <span>%100 Doğru Fire Hesabı</span>
          </div>
        </div>

        <h3 className="tile-calc-title">
          Projenizin Malzeme ve Kutu İhtiyacını Anında Hesaplayın
        </h3>
      </div>

      {/* Main Grid Layout */}
      <div className="tile-calc-grid">
        {/* Left Inputs */}
        <div className="tile-calc-inputs">
          
          {/* Mekan Seçimi */}
          <div className="calc-group">
            <label className="calc-label">Mekan Seçin</label>
            <div className="room-selector-grid">
              {[
                { id: 'banyo', icon: '🛁', label: 'Banyo' },
                { id: 'mutfak', icon: '🍳', label: 'Mutfak' },
                { id: 'salon', icon: '🛋️', label: 'Salon' },
                { id: 'teras', icon: '🏡', label: 'Teras' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setRoomType(item.id)}
                  className={`room-btn ${roomType === item.id ? 'active' : ''}`}
                >
                  <span className="room-icon">{item.icon}</span>
                  <span className="room-text">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Alan Slider */}
          <div className="calc-group">
            <div className="slider-header">
              <label className="calc-label">Kaplanacak Alan</label>
              <span className="area-badge">{areaM2} m²</span>
            </div>
            <input
              type="range"
              min="5"
              max="250"
              value={areaM2}
              onChange={(e) => setAreaM2(Number(e.target.value))}
              className="area-slider"
            />
          </div>

          {/* Ebat ve Doku Dropdownları */}
          <div className="dropdowns-row">
            <div className="select-box">
              <label className="select-label">Seramik Ebadı</label>
              <select
                value={tileSize}
                onChange={(e) => setTileSize(e.target.value)}
                className="calc-select"
              >
                <option value="60x120">60x120 cm</option>
                <option value="80x80">80x80 cm</option>
                <option value="120x240">120x240 cm (Mega)</option>
                <option value="30x60">30x60 cm</option>
              </select>
            </div>

            <div className="select-box">
              <label className="select-label">Doku / Tarz</label>
              <select
                value={tileStyle}
                onChange={(e) => setTileStyle(e.target.value)}
                className="calc-select"
              >
                <option value="mermer">Mermer Doku</option>
                <option value="ahsap">Ahşap Doku</option>
                <option value="beton">Beton / Taş</option>
                <option value="duz">Düz / Modern</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Results & Action */}
        <div className="tile-calc-results">
          <div className="results-inner-grid">
            <div className="result-item">
              <span className="result-label">Gerekli Seramik Kutusu</span>
              <div className="result-value-row">
                <span className="result-main-val">{requiredBoxes} Kutu</span>
                <span className="result-sub-val">({totalM2WithWastage} m²)</span>
              </div>
            </div>

            <div className="result-item">
              <span className="result-label">Harç & Derz İhtiyacı</span>
              <span className="result-main-val small">{adhesiveBags} Çuval / {groutPacks} Pak</span>
            </div>

            <div className="result-item budget-highlight">
              <span className="result-label gold">Tahmini Bütçe Aralığı</span>
              <span className="result-main-val gold">
                ₺{estimatedMinCost.toLocaleString('tr-TR')} - ₺{estimatedMaxCost.toLocaleString('tr-TR')}
              </span>
            </div>
          </div>

          <button onClick={handleRequestQuote} className="calc-cta-button">
            <span>Bayilerden Teklif Al</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      <style jsx>{`
        .tile-calculator-card {
          background: linear-gradient(180deg, rgba(15, 23, 42, 0.65) 0%, rgba(15, 23, 42, 0.45) 100%);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 20px;
          padding: 20px 24px;
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.18);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.2);
          margin: 24px 0 16px 0;
          transition: all 0.3s ease;
        }

        .tile-calc-header {
          margin-bottom: 18px;
        }

        .tile-calc-badges {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 10px;
        }

        .badge-gold {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 14px;
          background: rgba(212, 175, 55, 0.18);
          border: 1px solid rgba(212, 175, 55, 0.4);
          color: #ffd700;
          font-size: 0.73rem;
          font-weight: 800;
          white-space: nowrap;
        }

        .badge-trust {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 14px;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #e2e8f0;
          font-size: 0.73rem;
          font-weight: 700;
          white-space: nowrap;
        }

        .tile-calc-title {
          font-size: 1.15rem;
          font-weight: 800;
          margin: 0;
          color: #ffffff;
          line-height: 1.3;
          text-shadow: 0 2px 6px rgba(0, 0, 0, 0.6);
        }

        .tile-calc-grid {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 20px;
          align-items: stretch;
        }

        .tile-calc-inputs {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .calc-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .calc-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: #cbd5e1;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .room-selector-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 6px;
          width: 100%;
        }

        .room-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 8px 4px;
          border-radius: 10px;
          font-size: 0.76rem;
          font-weight: 700;
          border: 1px solid rgba(255, 255, 255, 0.1);
          cursor: pointer;
          background: rgba(255, 255, 255, 0.06);
          color: #f8fafc;
          transition: all 0.2s ease;
          gap: 2px;
          white-space: nowrap;
        }

        .room-btn:hover {
          background: rgba(255, 255, 255, 0.12);
        }

        .room-btn.active {
          background: linear-gradient(135deg, #d4af37 0%, #b38e47 100%);
          color: #0f172a;
          border-color: #ffd700;
          box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
        }

        .room-icon {
          font-size: 1.1rem;
          line-height: 1;
        }

        .room-text {
          font-size: 0.72rem;
          font-weight: 800;
        }

        .slider-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .area-badge {
          font-size: 0.95rem;
          font-weight: 900;
          color: #ffd700;
          background: rgba(212, 175, 55, 0.15);
          padding: 2px 8px;
          border-radius: 6px;
          border: 1px solid rgba(212, 175, 55, 0.3);
        }

        .area-slider {
          width: 100%;
          accent-color: #d4af37;
          cursor: pointer;
          height: 6px;
          margin-top: 4px;
        }

        .dropdowns-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .select-box {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .select-label {
          font-size: 0.72rem;
          font-weight: 700;
          color: #94a3b8;
        }

        .calc-select {
          width: 100%;
          padding: 8px 10px;
          border-radius: 10px;
          background: rgba(15, 23, 42, 0.85);
          color: #f8fafc;
          border: 1px solid rgba(255, 255, 255, 0.2);
          font-size: 0.8rem;
          font-weight: 600;
          outline: none;
          cursor: pointer;
        }

        .tile-calc-results {
          background: rgba(0, 0, 0, 0.35);
          backdrop-filter: blur(12px);
          padding: 16px;
          border-radius: 16px;
          border: 1px solid rgba(212, 175, 55, 0.3);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 14px;
        }

        .results-inner-grid {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .result-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .result-item.budget-highlight {
          background: rgba(212, 175, 55, 0.08);
          padding: 8px 10px;
          border-radius: 10px;
          border: 1px solid rgba(212, 175, 55, 0.2);
        }

        .result-label {
          font-size: 0.72rem;
          color: #cbd5e1;
          font-weight: 600;
        }

        .result-label.gold {
          color: #ffd700;
          font-weight: 700;
        }

        .result-value-row {
          display: flex;
          align-items: baseline;
          gap: 6px;
        }

        .result-main-val {
          font-size: 1.2rem;
          font-weight: 900;
          color: #ffffff;
        }

        .result-main-val.small {
          font-size: 0.95rem;
        }

        .result-main-val.gold {
          font-size: 1.15rem;
          color: #ffd700;
        }

        .result-sub-val {
          font-size: 0.75rem;
          color: #38bdf8;
          font-weight: 600;
        }

        .calc-cta-button {
          width: 100%;
          padding: 12px 16px;
          border-radius: 12px;
          background: linear-gradient(135deg, #d4af37 0%, #b38e47 100%);
          color: #0f172a;
          font-weight: 900;
          font-size: 0.88rem;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 4px 16px rgba(212, 175, 55, 0.4);
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .calc-cta-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(212, 175, 55, 0.5);
        }

        @media (max-width: 640px) {
          .tile-calculator-card {
            padding: 16px;
            border-radius: 16px;
            margin: 16px 0 12px 0;
          }

          .tile-calc-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .tile-calc-title {
            font-size: 1rem;
          }

          .room-btn {
            padding: 6px 2px;
          }

          .room-icon {
            font-size: 1rem;
          }

          .room-text {
            font-size: 0.7rem;
          }

          .calc-cta-button {
            padding: 11px 14px;
            font-size: 0.85rem;
          }
        }
      `}</style>
    </div>
  );
}
