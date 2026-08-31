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
  const [includeLabor, setIncludeLabor] = useState(false); // Usta işçilik seçeneği
  const [layingStyle, setLayingStyle] = useState('duz'); // duz (%8 fire), capraz (%12 fire), baliksirti (%15 fire)

  // 1. Seramik Ebadına Göre Kutu m², Malzeme Çarpanı & Usta İşçilik Tarifesi (2026 Türkiye Pazar Standartları)
  const tileSizeConfigMap = {
    '60x120': {
      label: '60x120 cm (Porselen)',
      coverage: 1.44,
      priceMultiplier: 1.15, // Porselen ebat farkı
      baseLaborRate: 420     // Büyük ebat usta işçiliği (₺/m²)
    },
    '80x80': {
      label: '80x80 cm (Granit)',
      coverage: 1.28,
      priceMultiplier: 1.10,
      baseLaborRate: 400
    },
    '60x60': {
      label: '60x60 cm (Standart)',
      coverage: 1.44,
      priceMultiplier: 1.0,
      baseLaborRate: 340     // Standart işçilik
    },
    '30x60': {
      label: '30x60 cm (Duvar/Zemin)',
      coverage: 1.44,
      priceMultiplier: 0.92,
      baseLaborRate: 320
    },
    '20x120': {
      label: '20x120 cm (Ahşap Porselen)',
      coverage: 1.44,
      priceMultiplier: 1.12,
      baseLaborRate: 460     // Derzli/şaşırtmalı ahşap dizim işçiliği
    },
    '120x240': {
      label: '120x240 cm (Mega Slab)',
      coverage: 2.88,
      priceMultiplier: 1.65, // Dev plaka porselen
      baseLaborRate: 750     // Çift usta + vakumlu vantuz + takoz işçiliği
    }
  };

  // 2. Döşeme düzenine göre fire (wastage) ve işçilik zorluk çarpanı
  const layingConfigMap = {
    'duz': { wastage: 8, laborMultiplier: 1.0, label: 'Düz (%8)' },
    'capraz': { wastage: 12, laborMultiplier: 1.15, label: 'Çapraz (%12)' },
    'baliksirti': { wastage: 15, laborMultiplier: 1.25, label: 'Balıksırtı (%15)' }
  };

  // 3. Dokuya göre baz m² malzeme fiyat aralığı (TL / m²)
  const stylePriceRangeMap = {
    'mermer': { min: 390, max: 640 },
    'ahsap': { min: 360, max: 560 },
    'beton': { min: 320, max: 500 },
    'duz': { min: 270, max: 420 },
    'lappato': { min: 490, max: 790 }
  };

  // Mekan seçilince otomatik önerileri güncelleme
  const handleRoomSelect = (id) => {
    setRoomType(id);
    if (id === 'banyo') {
      setLayingStyle('capraz'); // Banyoda kırımlar çok olduğu için %12 kesim fire
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

  // Dinamik Metraj & Maliyet Hesaplama Mantığı
  const sizeConfig = tileSizeConfigMap[tileSize] || tileSizeConfigMap['60x120'];
  const layingConfig = layingConfigMap[layingStyle] || layingConfigMap['duz'];
  const styleConfig = stylePriceRangeMap[tileStyle] || stylePriceRangeMap['mermer'];

  // Fire dahil satın alınacak m² ve kutu sayısı
  const activeWastagePercent = layingConfig.wastage;
  const totalM2WithWastage = Math.round((areaM2 * (1 + activeWastagePercent / 100)) * 10) / 10;
  const requiredBoxes = Math.ceil(totalM2WithWastage / sizeConfig.coverage);
  const actualPurchasedM2 = Math.round((requiredBoxes * sizeConfig.coverage) * 10) / 10;

  // Yan Malzeme (Harç & Derz)
  const adhesiveBags = Math.ceil(totalM2WithWastage / 5);
  const adhesiveCost = adhesiveBags * 280;

  const groutPacks = Math.ceil(totalM2WithWastage / 15);
  const groutCost = groutPacks * 180;

  // Banyo & Teras İzolasyon İlavesi
  const extraMaterialCost = (roomType === 'banyo' || roomType === 'teras') ? Math.round(areaM2 * 55) : 0;

  // Ebat ve Döşeme Zorluğuna Göre Dinamik Usta İşçilik Fiyatı (₺ / m²)
  const dynamicLaborRatePerM2 = Math.round(sizeConfig.baseLaborRate * layingConfig.laborMultiplier);
  const laborCost = includeLabor ? Math.round(totalM2WithWastage * dynamicLaborRatePerM2) : 0;

  // Seramik Malzeme Bütçesi
  const tileCostMin = Math.round(actualPurchasedM2 * styleConfig.min * sizeConfig.priceMultiplier);
  const tileCostMax = Math.round(actualPurchasedM2 * styleConfig.max * sizeConfig.priceMultiplier);

  // Toplam Bütçe
  const totalMinCost = tileCostMin + adhesiveCost + groutCost + extraMaterialCost + laborCost;
  const totalMaxCost = tileCostMax + adhesiveCost + groutCost + extraMaterialCost + laborCost;

  // Teklif Al / Bayiye Git
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
      laborRatePerM2: dynamicLaborRatePerM2,
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
      {/* Top Header */}
      <div className="tile-calc-header">
        <div className="tile-calc-badges">
          <div className="badge-gold">
            <Calculator size={13} />
            <span>MALİYET & METRAJ ROBOTU</span>
          </div>
          <div className="badge-trust">
            <ShieldCheck size={14} style={{ color: '#38bdf8' }} />
            <span>%{activeWastagePercent} Fire Hesabı</span>
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
                    <IconComponent size={14} className={`room-icon-svg ${isActive ? 'active' : ''}`} />
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
                  <option value="60x120">60x120 cm (Porselen)</option>
                  <option value="80x80">80x80 cm (Granit)</option>
                  <option value="60x60">60x60 cm (Standart)</option>
                  <option value="30x60">30x60 cm (Zemin/Duvar)</option>
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

          {/* Symmetrical & Uniform Bottom Grid (Nizami Hizalı) */}
          <div className="extra-controls-grid">
            {/* Döşeme Düzeni */}
            <div className="extra-control-col">
              <label className="select-label">DÖŞEME DÜZENİ</label>
              <div className="laying-pills">
                {Object.keys(layingConfigMap).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setLayingStyle(key)}
                    className={`pill-btn ${layingStyle === key ? 'active' : ''}`}
                  >
                    {layingConfigMap[key].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Usta İşçiliği */}
            <div className="extra-control-col">
              <label className="select-label">USTA İŞÇİLİĞİ</label>
              <button
                type="button"
                onClick={() => setIncludeLabor(!includeLabor)}
                className={`labor-toggle-btn ${includeLabor ? 'active' : ''}`}
              >
                <div className={`checkbox-custom ${includeLabor ? 'checked' : ''}`}>
                  {includeLabor && <Check size={11} strokeWidth={3.5} />}
                </div>
                <span>
                  {includeLabor ? `Usta Dahil (+${dynamicLaborRatePerM2} ₺/m²)` : `Usta İşçiliği Ekle (~${dynamicLaborRatePerM2} ₺/m²)`}
                </span>
              </button>
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
              <span className="budget-breakdown-info">
                *Seramik + Harç/Derz {includeLabor ? `+ Usta (${dynamicLaborRatePerM2} ₺/m²)` : ''} maliyetidir.
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
          background: rgba(15, 23, 42, 0.48);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 20px;
          padding: 24px;
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.2);
          margin: 20px 0 16px 0;
          transition: all 0.3s ease;
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
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
          border-radius: 16px;
          background: rgba(212, 175, 55, 0.12);
          border: 1px solid rgba(212, 175, 55, 0.3);
          color: #d4af37;
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.03em;
        }

        .badge-trust {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #94a3b8;
          font-size: 0.7rem;
          font-weight: 700;
        }

        .tile-calc-title {
          font-size: 1.1rem;
          font-weight: 800;
          margin: 0;
          color: #f8fafc;
          line-height: 1.35;
          letter-spacing: -0.01em;
        }

        .tile-calc-grid {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 20px;
          align-items: stretch;
          width: 100%;
          min-width: 0;
        }

        .tile-calc-inputs {
          display: flex;
          flex-direction: column;
          gap: 14px;
          width: 100%;
          min-width: 0;
        }

        .calc-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          width: 100%;
          min-width: 0;
        }

        .calc-label {
          font-size: 0.68rem;
          font-weight: 800;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .room-selector-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 6px;
          width: 100%;
          min-width: 0;
        }

        .room-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px 6px;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          cursor: pointer;
          background: rgba(255, 255, 255, 0.03);
          color: #cbd5e1;
          transition: all 0.2s ease;
          white-space: nowrap;
          min-width: 0;
        }

        .room-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #ffffff;
        }

        .room-btn.active {
          background: rgba(212, 175, 55, 0.15);
          color: #ffffff;
          border-color: rgba(212, 175, 55, 0.5);
        }

        .room-icon-svg {
          color: #94a3b8;
          flex-shrink: 0;
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
          font-size: 0.82rem;
          font-weight: 800;
          color: #d4af37;
          background: rgba(212, 175, 55, 0.12);
          padding: 2px 8px;
          border-radius: 6px;
          border: 1px solid rgba(212, 175, 55, 0.3);
        }

        .area-slider {
          width: 100%;
          accent-color: #d4af37;
          cursor: pointer;
          height: 5px;
          margin-top: 2px;
          border-radius: 4px;
        }

        .dropdowns-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          width: 100%;
          min-width: 0;
        }

        .select-box {
          display: flex;
          flex-direction: column;
          gap: 4px;
          width: 100%;
          min-width: 0;
        }

        .select-label {
          font-size: 0.68rem;
          font-weight: 800;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .select-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
          min-width: 0;
        }

        .calc-select {
          width: 100%;
          min-width: 0;
          padding: 8px 28px 8px 10px;
          border-radius: 10px;
          background: rgba(15, 23, 42, 0.85);
          color: #f8fafc;
          border: 1px solid rgba(255, 255, 255, 0.12);
          font-size: 0.78rem;
          font-weight: 600;
          outline: none;
          cursor: pointer;
          appearance: none;
          -webkit-appearance: none;
          transition: border-color 0.2s ease;
          text-overflow: ellipsis;
        }

        .calc-select:hover {
          border-color: rgba(255, 255, 255, 0.22);
        }

        .calc-select:focus {
          border-color: rgba(212, 175, 55, 0.5);
        }

        .select-arrow {
          position: absolute;
          right: 10px;
          pointer-events: none;
          color: #94a3b8;
        }

        /* Perfectly Symmetrical & Uniform Extra Controls Grid */
        .extra-controls-grid {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 10px;
          align-items: flex-start;
          padding-top: 4px;
          width: 100%;
          min-width: 0;
        }

        .extra-control-col {
          display: flex;
          flex-direction: column;
          gap: 4px;
          width: 100%;
          min-width: 0;
        }

        .laying-pills {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 4px;
          height: 38px;
          width: 100%;
          min-width: 0;
        }

        .pill-btn {
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
          border-radius: 9px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.03);
          color: #94a3b8;
          font-size: 0.68rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
          text-align: center;
          min-width: 0;
        }

        .pill-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #e2e8f0;
        }

        .pill-btn.active {
          background: rgba(56, 189, 248, 0.14);
          border-color: rgba(56, 189, 248, 0.4);
          color: #38bdf8;
        }

        .labor-toggle-btn {
          height: 38px;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 0 10px;
          border-radius: 9px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.03);
          color: #94a3b8;
          font-size: 0.72rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          user-select: none;
          white-space: nowrap;
          min-width: 0;
        }

        .labor-toggle-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #e2e8f0;
        }

        .labor-toggle-btn.active {
          background: rgba(16, 185, 129, 0.14);
          border-color: rgba(16, 185, 129, 0.45);
          color: #34d399;
        }

        .checkbox-custom {
          width: 15px;
          height: 15px;
          border-radius: 4px;
          border: 1.5px solid #64748b;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          flex-shrink: 0;
        }

        .checkbox-custom.checked {
          background: #10b981;
          border-color: #10b981;
        }

        .tile-calc-results {
          background: rgba(15, 23, 42, 0.42);
          backdrop-filter: blur(14px);
          padding: 16px;
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 12px;
          width: 100%;
          min-width: 0;
          box-sizing: border-box;
        }

        .results-inner-grid {
          display: flex;
          flex-direction: column;
          gap: 10px;
          width: 100%;
          min-width: 0;
        }

        .result-item {
          display: flex;
          flex-direction: column;
          gap: 3px;
          width: 100%;
          min-width: 0;
        }

        .result-item.budget-highlight {
          background: rgba(212, 175, 55, 0.08);
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid rgba(212, 175, 55, 0.3);
        }

        .budget-label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .labor-badge {
          font-size: 0.6rem;
          font-weight: 800;
          background: rgba(16, 185, 129, 0.2);
          color: #34d399;
          padding: 1px 5px;
          border-radius: 4px;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .result-label {
          font-size: 0.66rem;
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
          gap: 6px;
        }

        .result-main-val {
          font-size: 1.2rem;
          font-weight: 900;
          color: #ffffff;
        }

        .result-main-val.small {
          font-size: 0.88rem;
          color: #e2e8f0;
          font-weight: 700;
        }

        .result-main-val.gold {
          font-size: 1.15rem;
          color: #e5c158;
        }

        .result-sub-val {
          font-size: 0.74rem;
          color: #38bdf8;
          font-weight: 700;
        }

        .budget-breakdown-info {
          font-size: 0.6rem;
          color: #94a3b8;
          margin-top: 4px;
          line-height: 1.25;
        }

        .calc-cta-button {
          width: 100%;
          padding: 11px 16px;
          border-radius: 10px;
          background: linear-gradient(135deg, #c5a059 0%, #d4af37 50%, #b38e47 100%);
          color: #0f172a;
          font-weight: 900;
          font-size: 0.85rem;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          box-shadow: 0 4px 16px rgba(212, 175, 55, 0.25);
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .calc-cta-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(212, 175, 55, 0.38);
          background: linear-gradient(135deg, #d4af37 0%, #e5c158 50%, #c5a059 100%);
        }

        @media (max-width: 640px) {
          .tile-calculator-card {
            padding: 12px;
            border-radius: 16px;
            margin: 10px 0;
            width: 100%;
            max-width: 100%;
            box-sizing: border-box;
          }

          .tile-calc-header {
            margin-bottom: 8px;
          }

          .tile-calc-title {
            font-size: 0.92rem;
            line-height: 1.25;
          }

          .tile-calc-badges {
            margin-bottom: 6px;
            gap: 6px;
          }

          .badge-gold, .badge-trust {
            padding: 2px 7px;
            font-size: 0.62rem;
          }

          .tile-calc-grid {
            grid-template-columns: 1fr;
            gap: 10px;
            width: 100%;
          }

          .tile-calc-inputs {
            gap: 8px;
            width: 100%;
          }

          .calc-group {
            gap: 3px;
            width: 100%;
          }

          .calc-label, .select-label, .result-label {
            font-size: 0.62rem;
          }

          .room-selector-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 4px;
            width: 100%;
          }

          .room-btn {
            padding: 6px 2px;
            gap: 3px;
            border-radius: 8px;
            min-width: 0;
          }

          .room-text {
            font-size: 0.66rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .area-badge {
            font-size: 0.74rem;
            padding: 1px 6px;
          }

          .dropdowns-row {
            grid-template-columns: 1fr 1fr;
            gap: 6px;
            width: 100%;
          }

          .calc-select {
            padding: 6px 18px 6px 6px;
            font-size: 0.7rem;
            border-radius: 8px;
            width: 100%;
            text-overflow: ellipsis;
          }

          .select-arrow {
            right: 4px;
          }

          .extra-controls-grid {
            grid-template-columns: 1fr;
            gap: 8px;
            padding-top: 2px;
            width: 100%;
          }

          .extra-control-col {
            width: 100%;
          }

          .laying-pills {
            grid-template-columns: repeat(3, 1fr);
            height: 34px;
            gap: 4px;
            width: 100%;
          }

          .pill-btn {
            height: 34px;
            font-size: 0.64rem;
            padding: 0 4px;
            border-radius: 7px;
            min-width: 0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .labor-toggle-btn {
            height: 34px;
            font-size: 0.68rem;
            padding: 0 8px;
            gap: 6px;
            border-radius: 7px;
            width: 100%;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .checkbox-custom {
            width: 13px;
            height: 13px;
          }

          .tile-calc-results {
            padding: 10px 12px;
            border-radius: 12px;
            gap: 8px;
            width: 100%;
          }

          .results-inner-grid {
            gap: 5px;
            width: 100%;
          }

          .result-item.budget-highlight {
            padding: 8px 10px;
            border-radius: 8px;
          }

          .result-main-val {
            font-size: 1rem;
          }

          .result-main-val.gold {
            font-size: 1rem;
          }

          .result-main-val.small {
            font-size: 0.78rem;
          }

          .result-sub-val {
            font-size: 0.66rem;
          }

          .budget-breakdown-info {
            font-size: 0.58rem;
            margin-top: 2px;
          }

          .calc-cta-button {
            padding: 9px 12px;
            font-size: 0.78rem;
            border-radius: 8px;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
