'use client';

import { useState } from 'react';
import { Calculator, ArrowRight, ShieldCheck, Bath, Utensils, Sofa, Home, ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '@/lib/languageContext';

export default function TileCalculatorWidget({ onOpenQuoteModal, onGoToDealers }) {
  const { t } = useLanguage();
  
  // Selection States
  const [roomType, setRoomType] = useState('banyo');
  const [areaM2, setAreaM2] = useState(25);
  const [tileSize, setTileSize] = useState('60x120');
  const [tileStyle, setTileStyle] = useState('mermer');
  const [includeLabor, setIncludeLabor] = useState(false); // Usta işçiliği dahil seçeneği
  const [layingStyle, setLayingStyle] = useState('duz'); // duz (%8 fire), capraz (%12 fire), baliksirti (%15 fire)

  // 1. Kutu içi metrekare standart haritası (Türkiye Pazar Standartları)
  const tileBoxMap = {
    '60x120': 1.44,   // 2 adet / kutu = 1.44 m²
    '80x80': 1.28,    // 2 adet / kutu = 1.28 m²
    '60x60': 1.44,    // 4 adet / kutu = 1.44 m²
    '30x60': 1.44,    // 8 adet / kutu = 1.44 m²
    '20x120': 1.44,   // 6 adet / kutu = 1.44 m² (Ahşap Parke Görünümlü)
    '120x240': 2.88   // 1 dev plaka / kutu = 2.88 m²
  };

  // 2. Döşeme tipine göre fire (wastage) oranı haritası
  const wastageMap = {
    'duz': 8,        // Standart Düz Döşeme: %8 fire
    'capraz': 12,    // Çapraz / Diyagonal Döşeme: %12 fire
    'baliksirti': 15 // Balıksırtı / Karmaşık Kırımlı: %15 fire
  };

  // 3. Dokuya göre 2026 ortalama m² malzeme fiyat aralığı (TL / m²)
  const stylePriceRangeMap = {
    'mermer': { min: 420, max: 680 },
    'ahsap': { min: 380, max: 590 },
    'beton': { min: 350, max: 540 },
    'duz': { min: 290, max: 450 },
    'lappato': { min: 520, max: 850 }
  };

  // Mekan seçilince önerilen varsayılanları otomatik güncelleme
  const handleRoomSelect = (id) => {
    setRoomType(id);
    if (id === 'banyo') {
      setLayingStyle('capraz'); // Banyoda kırım çok olduğu için %12 kesim fire önerilir
      if (tileStyle === 'duz') setTileStyle('mermer');
    } else if (id === 'teras') {
      setLayingStyle('duz');
      setTileStyle('beton');
    } else if (id === 'salon') {
      setLayingStyle('duz');
      setTileStyle('mermer');
    } else if (id === 'mutfak') {
      setLayingStyle('duz');
      setTileStyle('ahsap');
    }
  };

  // Metraj & Fire Hesaplama Mantığı
  const boxCoverage = tileBoxMap[tileSize] || 1.44;
  const activeWastagePercent = wastageMap[layingStyle] || 8;
  
  // Fire dahil toplam net satın alınacak m²
  const totalM2WithWastage = Math.round((areaM2 * (1 + activeWastagePercent / 100)) * 10) / 10;
  
  // Gerekli tam kutu sayısı
  const requiredBoxes = Math.ceil(totalM2WithWastage / boxCoverage);
  const actualPurchasedM2 = Math.round((requiredBoxes * boxCoverage) * 10) / 10;

  // Harç & Derz Yan Malzeme Hesaplamaları (2026 Fiyatları)
  // 1 Çuval 25kg Esnek Seramik Harcı = 5 m² alan kapatır (Fiyat: ~280 TL/çuval)
  const adhesiveBags = Math.ceil(totalM2WithWastage / 5);
  const adhesiveCost = adhesiveBags * 280;

  // 1 Pak 5kg Silikonlu Derz = 15 m² alan kapatır (Fiyat: ~180 TL/paket)
  const groutPacks = Math.ceil(totalM2WithWastage / 15);
  const groutCost = groutPacks * 180;

  // Banyo ve Teras için ilave Su İzolasyon & Lazer Takoz Seti desteği
  const extraMaterialCost = (roomType === 'banyo' || roomType === 'teras') ? Math.round(areaM2 * 60) : 0;

  // İşçilik maliyeti (Usta ortalama işçilik m² tarifesi: ~350 TL/m²)
  const laborCost = includeLabor ? Math.round(totalM2WithWastage * 350) : 0;

  // Toplam Bütçe Hesaplaması
  const priceConfig = stylePriceRangeMap[tileStyle] || { min: 380, max: 600 };
  const tileCostMin = Math.round(actualPurchasedM2 * priceConfig.min);
  const tileCostMax = Math.round(actualPurchasedM2 * priceConfig.max);

  const totalMinCost = tileCostMin + adhesiveCost + groutCost + extraMaterialCost + laborCost;
  const totalMaxCost = tileCostMax + adhesiveCost + groutCost + extraMaterialCost + laborCost;

  // Teklif Al / Bayiye Git Buton Tıklaması
  const handleRequestQuote = () => {
    const calcSummary = {
      areaM2,
      totalM2WithWastage,
      actualPurchasedM2,
      requiredBoxes,
      tileSize,
      tileStyle,
      roomType,
      adhesiveBags,
      groutPacks,
      includeLabor,
      estimatedMinCost: totalMinCost,
      estimatedMaxCost: totalMaxCost
    };

    if (onOpenQuoteModal) {
      onOpenQuoteModal(calcSummary);
    } else if (onGoToDealers) {
      onGoToDealers(calcSummary);
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
            <span>%{activeWastagePercent} Hassas Fire Hesabı</span>
          </div>
        </div>

        <h3 className="tile-calc-title">
          {t('calcTitle') || 'Projenizin Malzeme ve Kutu İhtiyacını Anında Hesaplayın'}
        </h3>
      </div>

      {/* Main Grid Layout */}
      <div className="tile-calc-grid">
        {/* Left Inputs */}
        <div className="tile-calc-inputs">
          
          {/* Mekan Seçimi */}
          <div className="calc-group">
            <label className="calc-label">MEKAN SEÇİMİ</label>
            <div className="room-selector-grid">
              {roomItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = roomType === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleRoomSelect(item.id)}
                    className={`room-btn ${isActive ? 'active' : ''}`}
                  >
                    <IconComponent size={15} className={`room-icon-svg ${isActive ? 'active' : ''}`} />
                    <span className="room-text">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Alan Slider */}
          <div className="calc-group">
            <div className="slider-header">
              <label className="calc-label">KAPLANACAK ALAN</label>
              <span className="area-badge">{areaM2} m²</span>
            </div>
            <input
              type="range"
              min="5"
              max="250"
              step="1"
              value={areaM2}
              onChange={(e) => setAreaM2(Number(e.target.value))}
              className="area-slider"
            />
          </div>

          {/* Ebat ve Doku Dropdownları */}
          <div className="dropdowns-row">
            <div className="select-box">
              <label className="select-label">SERAMİK EBADI</label>
              <div className="select-wrapper">
                <select
                  value={tileSize}
                  onChange={(e) => setTileSize(e.target.value)}
                  className="calc-select"
                >
                  <option value="60x120">60x120 cm</option>
                  <option value="80x80">80x80 cm</option>
                  <option value="60x60">60x60 cm</option>
                  <option value="30x60">30x60 cm</option>
                  <option value="20x120">20x120 cm (Ahşap)</option>
                  <option value="120x240">120x240 cm (Mega)</option>
                </select>
                <ChevronDown size={14} className="select-arrow" />
              </div>
            </div>

            <div className="select-box">
              <label className="select-label">DOKU / TARZ</label>
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
                  <option value="lappato">Lüks Lappato / Granit</option>
                </select>
                <ChevronDown size={14} className="select-arrow" />
              </div>
            </div>
          </div>

          {/* Extra Controls: Döşeme Şekli (Fire) & Usta İşçilik Toggle */}
          <div className="extra-controls-row">
            <div className="laying-style-selector">
              <label className="select-label">DÖŞEME DÜZENİ</label>
              <div className="laying-pills">
                <button
                  type="button"
                  onClick={() => setLayingStyle('duz')}
                  className={`pill-btn ${layingStyle === 'duz' ? 'active' : ''}`}
                >
                  Düz (%8 Fire)
                </button>
                <button
                  type="button"
                  onClick={() => setLayingStyle('capraz')}
                  className={`pill-btn ${layingStyle === 'capraz' ? 'active' : ''}`}
                >
                  Çapraz (%12 Fire)
                </button>
                <button
                  type="button"
                  onClick={() => setLayingStyle('baliksirti')}
                  className={`pill-btn ${layingStyle === 'baliksirti' ? 'active' : ''}`}
                >
                  Balıksırtı (%15)
                </button>
              </div>
            </div>

            <div className="labor-toggle-box">
              <label 
                className={`labor-toggle-label ${includeLabor ? 'active' : ''}`}
                onClick={() => setIncludeLabor(!includeLabor)}
              >
                <div className={`checkbox-custom ${includeLabor ? 'checked' : ''}`}>
                  {includeLabor && <Check size={12} strokeWidth={3} />}
                </div>
                <div className="labor-text-wrapper">
                  <span className="labor-title">Usta İşçiliği Dahil Et</span>
                  <span className="labor-sub">+350 ₺/m² Ortalama İşçilik</span>
                </div>
              </label>
            </div>
          </div>

        </div>

        {/* Right Results & Action */}
        <div className="tile-calc-results">
          <div className="results-inner-grid">
            <div className="result-item">
              <span className="result-label">GEREKLİ SERAMİK KUTUSU</span>
              <div className="result-value-row">
                <span className="result-main-val">{requiredBoxes} Kutu</span>
                <span className="result-sub-val">({totalM2WithWastage} m² Dahil)</span>
              </div>
            </div>

            <div className="result-item">
              <span className="result-label">HARÇ & DERZ İHTİYACI</span>
              <span className="result-main-val small">{adhesiveBags} Çuval Harç / {groutPacks} Pak Derz</span>
            </div>

            <div className="result-item budget-highlight">
              <div className="budget-label-row">
                <span className="result-label gold">TAHMİNİ BÜTÇE ARALIĞI</span>
                {includeLabor && <span className="labor-badge">Usta Dahil</span>}
              </div>
              <span className="result-main-val gold">
                ₺{totalMinCost.toLocaleString('tr-TR')} – ₺{totalMaxCost.toLocaleString('tr-TR')}
              </span>
            </div>
          </div>

          <button type="button" onClick={handleRequestQuote} className="calc-cta-button">
            <span>Bayilerden Teklif Al</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      <style jsx>{`
        .tile-calculator-card {
          background: linear-gradient(145deg, rgba(15, 23, 42, 0.92) 0%, rgba(30, 41, 59, 0.85) 100%);
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
          background: rgba(212, 175, 55, 0.14);
          border: 1px solid rgba(212, 175, 55, 0.4);
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
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
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
          border-color: rgba(255, 255, 255, 0.18);
          color: #ffffff;
        }

        .room-btn.active {
          background: rgba(212, 175, 55, 0.16);
          color: #ffffff;
          border: 1px solid rgba(212, 175, 55, 0.6);
          box-shadow: 0 4px 16px rgba(212, 175, 55, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.15);
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
          font-size: 0.78rem;
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
          background: rgba(212, 175, 55, 0.14);
          padding: 3px 10px;
          border-radius: 8px;
          border: 1px solid rgba(212, 175, 55, 0.4);
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
          background: rgba(15, 23, 42, 0.85);
          color: #f8fafc;
          border: 1px solid rgba(255, 255, 255, 0.14);
          font-size: 0.82rem;
          font-weight: 600;
          outline: none;
          cursor: pointer;
          appearance: none;
          -webkit-appearance: none;
          transition: border-color 0.2s ease;
        }

        .calc-select:hover {
          border-color: rgba(255, 255, 255, 0.25);
        }

        .calc-select:focus {
          border-color: rgba(212, 175, 55, 0.6);
        }

        .select-arrow {
          position: absolute;
          right: 12px;
          pointer-events: none;
          color: #94a3b8;
        }

        .extra-controls-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          align-items: flex-end;
          border-top: 1px dashed rgba(255, 255, 255, 0.1);
          padding-top: 12px;
        }

        .laying-pills {
          display: flex;
          gap: 4px;
          margin-top: 6px;
        }

        .pill-btn {
          flex: 1;
          padding: 6px 4px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.03);
          color: #94a3b8;
          font-size: 0.68rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
          text-align: center;
        }

        .pill-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #e2e8f0;
        }

        .pill-btn.active {
          background: rgba(56, 189, 248, 0.15);
          border-color: rgba(56, 189, 248, 0.4);
          color: #38bdf8;
        }

        .labor-toggle-label {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 10px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          cursor: pointer;
          user-select: none;
          transition: all 0.2s ease;
        }

        .labor-toggle-label:hover {
          background: rgba(255, 255, 255, 0.08);
        }

        .labor-toggle-label.active {
          background: rgba(16, 185, 129, 0.12);
          border-color: rgba(16, 185, 129, 0.4);
        }

        .checkbox-custom {
          width: 18px;
          height: 18px;
          border-radius: 5px;
          border: 1.5px solid #64748b;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          transition: all 0.2s ease;
        }

        .checkbox-custom.checked {
          background: #10b981;
          border-color: #10b981;
        }

        .labor-text-wrapper {
          display: flex;
          flex-direction: column;
        }

        .labor-title {
          font-size: 0.72rem;
          font-weight: 800;
          color: #f1f5f9;
        }

        .labor-sub {
          font-size: 0.62rem;
          color: #94a3b8;
        }

        .tile-calc-results {
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(14px);
          padding: 20px;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.12);
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
          background: rgba(212, 175, 55, 0.1);
          padding: 12px 14px;
          border-radius: 12px;
          border: 1px solid rgba(212, 175, 55, 0.35);
        }

        .budget-label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .labor-badge {
          font-size: 0.62rem;
          font-weight: 800;
          background: rgba(16, 185, 129, 0.2);
          color: #34d399;
          padding: 2px 6px;
          border-radius: 4px;
          border: 1px solid rgba(16, 185, 129, 0.4);
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
          font-size: 1.3rem;
          font-weight: 900;
          color: #ffffff;
        }

        .result-main-val.small {
          font-size: 0.92rem;
          color: #e2e8f0;
          font-weight: 700;
        }

        .result-main-val.gold {
          font-size: 1.22rem;
          color: #e5c158;
        }

        .result-sub-val {
          font-size: 0.78rem;
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
          box-shadow: 0 6px 20px rgba(212, 175, 55, 0.3);
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          white-space: nowrap;
          letter-spacing: 0.01em;
        }

        .calc-cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(212, 175, 55, 0.45);
          background: linear-gradient(135deg, #d4af37 0%, #e5c158 50%, #c5a059 100%);
        }

        @media (max-width: 640px) {
          .tile-calculator-card {
            padding: 14px;
            border-radius: 16px;
            margin: 12px 0 20px 0;
          }

          .tile-calc-header {
            margin-bottom: 10px;
          }

          .tile-calc-badges {
            gap: 6px;
            margin-bottom: 6px;
          }

          .badge-gold, .badge-trust {
            padding: 3px 8px;
            font-size: 0.65rem;
            border-radius: 12px;
          }

          .tile-calc-title {
            font-size: 0.92rem;
            line-height: 1.25;
          }

          .tile-calc-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .tile-calc-inputs {
            gap: 10px;
          }

          .calc-group {
            gap: 4px;
          }

          .calc-label {
            font-size: 0.68rem;
          }

          .room-selector-grid {
            gap: 6px;
          }

          .room-btn {
            flex-direction: row;
            padding: 6px 4px;
            border-radius: 8px;
            gap: 4px;
          }

          .room-text {
            font-size: 0.7rem;
          }

          .area-badge {
            font-size: 0.78rem;
            padding: 2px 6px;
          }

          .area-slider {
            height: 4px;
            margin-top: 2px;
          }

          .dropdowns-row, .extra-controls-row {
            grid-template-columns: 1fr;
            gap: 8px;
          }

          .select-box {
            gap: 3px;
          }

          .select-label {
            font-size: 0.68rem;
          }

          .calc-select {
            padding: 7px 22px 7px 8px;
            font-size: 0.75rem;
            border-radius: 8px;
          }

          .select-arrow {
            right: 8px;
          }

          .tile-calc-results {
            padding: 12px;
            border-radius: 12px;
            gap: 10px;
          }

          .results-inner-grid {
            gap: 6px;
          }

          .result-item {
            gap: 2px;
          }

          .result-item.budget-highlight {
            padding: 6px 10px;
            border-radius: 8px;
          }

          .result-label {
            font-size: 0.66rem;
          }

          .result-main-val {
            font-size: 1.05rem;
          }

          .result-main-val.small {
            font-size: 0.82rem;
          }

          .result-main-val.gold {
            font-size: 1.02rem;
          }

          .result-sub-val {
            font-size: 0.7rem;
          }

          .calc-cta-button {
            padding: 10px 14px;
            font-size: 0.82rem;
            border-radius: 10px;
          }
        }
      `}</style>
    </div>
  );
}
