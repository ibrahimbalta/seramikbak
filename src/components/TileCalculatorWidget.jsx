'use client';

import { useState } from 'react';
import { Calculator, ArrowRight, ShieldCheck, Bath, Utensils, Sofa, Home, ChevronDown } from 'lucide-react';

export default function TileCalculatorWidget({ onOpenQuoteModal, onGoToDealers }) {
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
    if (onGoToDealers) {
      onGoToDealers({
        areaM2,
        totalM2WithWastage,
        requiredBoxes,
        tileSize,
        roomType
      });
    } else if (onOpenQuoteModal) {
      onOpenQuoteModal({
        areaM2,
        totalM2WithWastage,
        requiredBoxes,
        tileSize,
        roomType
      });
    } else {
      const dealerSec = document.getElementById('bayi-bul-section') || document.getElementById('resmi-yetkili-bayiler-section');
      if (dealerSec) {
        dealerSec.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const roomItems = [
    { id: 'banyo', icon: Bath, label: 'Banyo' },
    { id: 'mutfak', icon: Utensils, label: 'Mutfak' },
    { id: 'salon', icon: Sofa, label: 'Salon' },
    { id: 'teras', icon: Home, label: 'Teras' }
  ];

  return (
    <div className="tile-calculator-card">
      {/* Top Header Section */}
      <div className="tile-calc-header">
        <div className="tile-calc-badges">
          <div className="badge-gold">
            <Calculator size={13} />
            <span>MALİYET & METRAJ ROBOTU</span>
          </div>
          <div className="badge-trust">
            <ShieldCheck size={14} style={{ color: '#38bdf8' }} />
            <span>%100 Hassas Fire Hesabı</span>
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
            <label className="calc-label">Mekan Seçimi</label>
            <div className="room-selector-grid">
              {roomItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = roomType === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setRoomType(item.id)}
                    className={`room-btn ${isActive ? 'active' : ''}`}
                  >
                    <IconComponent size={16} className={`room-icon-svg ${isActive ? 'active' : ''}`} />
                    <span className="room-text">{item.label}</span>
                  </button>
                );
              })}
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
              <div className="select-wrapper">
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
                <ChevronDown size={14} className="select-arrow" />
              </div>
            </div>

            <div className="select-box">
              <label className="select-label">Doku / Tarz</label>
              <div className="select-wrapper">
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
                <ChevronDown size={14} className="select-arrow" />
              </div>
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
                <span className="result-sub-val">({totalM2WithWastage} m² Dahil)</span>
              </div>
            </div>

            <div className="result-item">
              <span className="result-label">Harç & Derz İhtiyacı</span>
              <span className="result-main-val small">{adhesiveBags} Çuval Harç / {groutPacks} Pak Derz</span>
            </div>

            <div className="result-item budget-highlight">
              <span className="result-label gold">Tahmini Bütçe Aralığı</span>
              <span className="result-main-val gold">
                ₺{estimatedMinCost.toLocaleString('tr-TR')} – ₺{estimatedMaxCost.toLocaleString('tr-TR')}
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
          background: linear-gradient(145deg, rgba(15, 23, 42, 0.85) 0%, rgba(30, 41, 59, 0.75) 100%);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 20px;
          padding: 24px;
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: 0 20px 48px rgba(0, 0, 0, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.15);
          margin: 24px 0 16px 0;
          transition: all 0.3s ease;
        }

        .tile-calc-header {
          margin-bottom: 20px;
        }

        .tile-calc-badges {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 12px;
        }

        .badge-gold {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          border-radius: 20px;
          background: rgba(212, 175, 55, 0.12);
          border: 1px solid rgba(212, 175, 55, 0.35);
          color: #d4af37;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.04em;
          white-space: nowrap;
        }

        .badge-trust {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #94a3b8;
          font-size: 0.72rem;
          font-weight: 700;
          white-space: nowrap;
        }

        .tile-calc-title {
          font-size: 1.15rem;
          font-weight: 800;
          margin: 0;
          color: #f8fafc;
          line-height: 1.35;
          letter-spacing: -0.01em;
        }

        .tile-calc-grid {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 24px;
          align-items: stretch;
        }

        .tile-calc-inputs {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .calc-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .calc-label {
          font-size: 0.72rem;
          font-weight: 800;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .room-selector-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          width: 100%;
        }

        .room-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 10px 6px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          cursor: pointer;
          background: rgba(255, 255, 255, 0.04);
          color: #cbd5e1;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          gap: 6px;
          white-space: nowrap;
        }

        .room-btn:hover {
          background: rgba(255, 255, 255, 0.09);
          border-color: rgba(255, 255, 255, 0.16);
          color: #ffffff;
        }

        .room-btn.active {
          background: rgba(212, 175, 55, 0.14);
          color: #ffffff;
          border: 1px solid rgba(212, 175, 55, 0.5);
          box-shadow: 0 4px 16px rgba(212, 175, 55, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        .room-icon-svg {
          color: #94a3b8;
          transition: color 0.2s ease;
        }

        .room-btn:hover .room-icon-svg {
          color: #cbd5e1;
        }

        .room-btn.active .room-icon-svg {
          color: #d4af37;
        }

        .room-text {
          font-size: 0.75rem;
          font-weight: 700;
        }

        .slider-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .area-badge {
          font-size: 0.88rem;
          font-weight: 800;
          color: #d4af37;
          background: rgba(212, 175, 55, 0.12);
          padding: 3px 10px;
          border-radius: 8px;
          border: 1px solid rgba(212, 175, 55, 0.3);
        }

        .area-slider {
          width: 100%;
          accent-color: #d4af37;
          cursor: pointer;
          height: 6px;
          margin-top: 4px;
          border-radius: 4px;
        }

        .dropdowns-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .select-box {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .select-label {
          font-size: 0.72rem;
          font-weight: 800;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .select-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .calc-select {
          width: 100%;
          padding: 10px 32px 10px 12px;
          border-radius: 12px;
          background: rgba(15, 23, 42, 0.75);
          color: #f8fafc;
          border: 1px solid rgba(255, 255, 255, 0.12);
          font-size: 0.82rem;
          font-weight: 600;
          outline: none;
          cursor: pointer;
          appearance: none;
          -webkit-appearance: none;
          transition: border-color 0.2s ease;
        }

        .calc-select:hover {
          border-color: rgba(255, 255, 255, 0.22);
        }

        .calc-select:focus {
          border-color: rgba(212, 175, 55, 0.5);
        }

        .select-arrow {
          position: absolute;
          right: 12px;
          pointer-events: none;
          color: #94a3b8;
        }

        .tile-calc-results {
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(14px);
          padding: 20px;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 16px;
          box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.05);
        }

        .results-inner-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .result-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .result-item.budget-highlight {
          background: rgba(212, 175, 55, 0.08);
          padding: 10px 14px;
          border-radius: 12px;
          border: 1px solid rgba(212, 175, 55, 0.25);
        }

        .result-label {
          font-size: 0.72rem;
          color: #94a3b8;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .result-label.gold {
          color: #d4af37;
          font-weight: 800;
        }

        .result-value-row {
          display: flex;
          align-items: baseline;
          gap: 8px;
        }

        .result-main-val {
          font-size: 1.25rem;
          font-weight: 900;
          color: #ffffff;
        }

        .result-main-val.small {
          font-size: 0.92rem;
          color: #e2e8f0;
          font-weight: 700;
        }

        .result-main-val.gold {
          font-size: 1.2rem;
          color: #e5c158;
        }

        .result-sub-val {
          font-size: 0.76rem;
          color: #38bdf8;
          font-weight: 700;
        }

        .calc-cta-button {
          width: 100%;
          padding: 13px 18px;
          border-radius: 12px;
          background: linear-gradient(135deg, #c5a059 0%, #d4af37 50%, #b38e47 100%);
          color: #0f172a;
          font-weight: 900;
          font-size: 0.88rem;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 6px 20px rgba(212, 175, 55, 0.28);
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          white-space: nowrap;
          letter-spacing: 0.01em;
        }

        .calc-cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(212, 175, 55, 0.4);
          background: linear-gradient(135deg, #d4af37 0%, #e5c158 50%, #c5a059 100%);
        }

        @media (max-width: 640px) {
          .tile-calculator-card {
            padding: 18px;
            border-radius: 16px;
            margin: 16px 0 12px 0;
          }

          .tile-calc-grid {
            grid-template-columns: 1fr;
            gap: 18px;
          }

          .tile-calc-title {
            font-size: 1.05rem;
          }

          .room-btn {
            padding: 8px 4px;
          }

          .room-text {
            font-size: 0.72rem;
          }

          .calc-cta-button {
            padding: 12px 16px;
            font-size: 0.86rem;
          }
        }
      `}</style>
    </div>
  );
}
