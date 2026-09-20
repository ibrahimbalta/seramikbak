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
                  <option value="60x120">60x120 cm</option>
                  <option value="80x80">80x80 cm</option>
                  <option value="60x60">60x60 cm</option>
                  <option value="30x60">30x60 cm</option>
                  <option value="20x120">20x120 cm</option>
                  <option value="120x240">120x240 cm</option>
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
                  <option value="mermer">Mermer</option>
                  <option value="ahsap">Ahşap</option>
                  <option value="beton">Beton & Taş</option>
                  <option value="duz">Düz Renk</option>
                  <option value="lappato">Lüks Lappato</option>
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
              <span className="result-label">GEREKLİ KUTU</span>
              <div className="result-value-row">
                <span className="result-main-val">{requiredBoxes} Kutu</span>
                <span className="result-sub-val">({totalM2WithWastage} m²)</span>
              </div>
            </div>

            <div className="result-item">
              <span className="result-label">HARÇ & DERZ</span>
              <span className="result-main-val small">{adhesiveBags} Çuval / {groutPacks} Paket</span>
            </div>

            <div className="result-item budget-highlight">
              <div className="budget-label-row">
                <span className="result-label gold">TAHMİNİ BÜTÇE</span>
                {includeLabor && <span className="labor-badge">Usta Dahil</span>}
              </div>
              <span className="result-main-val gold">
                ₺{totalMinCost.toLocaleString('tr-TR')} – ₺{totalMaxCost.toLocaleString('tr-TR')}
              </span>
              <span className="budget-breakdown-info">
                *Seramik + Harç/Derz {includeLabor ? `+ Usta (${dynamicLaborRatePerM2} ₺/m²)` : ''} dahil tahmini maliyet.
              </span>
            </div>
          </div>

          <button type="button" onClick={handleRequestQuote} className="calc-cta-button">
            <span>Bayilerden Fiyat Teklifi Al</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>

      <style jsx>{`
        .tile-calculator-card {
          background: #ffffff;
          border-radius: 16px;
          padding: 24px;
          color: #0f172a;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 20px rgba(15, 23, 42, 0.04);
          margin: 0;
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
          border-radius: 999px;
          background: rgba(179, 142, 71, 0.1);
          border: 1px solid rgba(179, 142, 71, 0.25);
          color: #b38e47;
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.03em;
        }

        .badge-trust {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 999px;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          color: #1d4ed8;
          font-size: 0.7rem;
          font-weight: 700;
        }

        .tile-calc-title {
          font-size: 1.15rem;
          font-weight: 800;
          margin: 0;
          color: #0f172a;
          line-height: 1.35;
          letter-spacing: -0.01em;
        }

        .tile-calc-grid {
          display: grid;
          grid-template-columns: 1.25fr 0.75fr;
          gap: 20px;
          align-items: stretch;
          width: 100%;
          min-width: 0;
        }

        .tile-calc-inputs {
          display: flex;
          flex-direction: column;
          gap: 16px;
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
          font-size: 0.7rem;
          font-weight: 800;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .room-selector-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          width: 100%;
          min-width: 0;
        }

        .room-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 9px 8px;
          border-radius: 10px;
          border: 1.5px solid #e2e8f0;
          cursor: pointer;
          background: #f8fafc;
          color: #334155;
          transition: all 0.2s ease;
          white-space: nowrap;
          min-width: 0;
        }

        .room-btn:hover {
          background: #f1f5f9;
          border-color: #cbd5e1;
          color: #0f172a;
        }

        .room-btn.active {
          background: #fffbeb;
          color: #b38e47;
          border-color: #b38e47;
          font-weight: 800;
          box-shadow: 0 2px 8px rgba(179, 142, 71, 0.15);
        }

        .room-icon-svg {
          color: #64748b;
          flex-shrink: 0;
        }

        .room-btn.active .room-icon-svg {
          color: #b38e47;
        }

        .room-text {
          font-size: 0.76rem;
          font-weight: 700;
        }

        .slider-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .area-badge {
          font-size: 0.85rem;
          font-weight: 800;
          color: #b38e47;
          background: #fffbeb;
          padding: 3px 10px;
          border-radius: 8px;
          border: 1.5px solid #fde68a;
        }

        .area-slider {
          width: 100%;
          accent-color: #b38e47;
          cursor: pointer;
          height: 6px;
          margin-top: 4px;
          border-radius: 999px;
          background: #e2e8f0;
        }

        .dropdowns-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          width: 100%;
          min-width: 0;
        }

        .select-box {
          display: flex;
          flex-direction: column;
          gap: 5px;
          width: 100%;
          min-width: 0;
        }

        .select-label {
          font-size: 0.7rem;
          font-weight: 800;
          color: #475569;
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
          padding: 10px 30px 10px 12px;
          border-radius: 10px;
          background: #f8fafc;
          color: #0f172a;
          border: 1.5px solid #e2e8f0;
          font-size: 0.82rem;
          font-weight: 700;
          outline: none;
          cursor: pointer;
          appearance: none;
          -webkit-appearance: none;
          transition: all 0.2s ease;
          text-overflow: ellipsis;
        }

        .calc-select:hover {
          border-color: #cbd5e1;
          background: #ffffff;
        }

        .calc-select:focus {
          border-color: #b38e47;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(179, 142, 71, 0.15);
        }

        .select-arrow {
          position: absolute;
          right: 10px;
          pointer-events: none;
          color: #64748b;
        }

        /* Extra Controls Grid */
        .extra-controls-grid {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 12px;
          align-items: flex-start;
          padding-top: 2px;
          width: 100%;
          min-width: 0;
        }

        .extra-control-col {
          display: flex;
          flex-direction: column;
          gap: 5px;
          width: 100%;
          min-width: 0;
        }

        .laying-pills {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 5px;
          height: 40px;
          width: 100%;
          min-width: 0;
        }

        .pill-btn {
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
          border-radius: 9px;
          border: 1.5px solid #e2e8f0;
          background: #f8fafc;
          color: #475569;
          font-size: 0.72rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
          text-align: center;
          min-width: 0;
        }

        .pill-btn:hover {
          background: #f1f5f9;
          border-color: #cbd5e1;
          color: #0f172a;
        }

        .pill-btn.active {
          background: #eff6ff;
          border-color: #3b82f6;
          color: #1d4ed8;
          font-weight: 800;
          box-shadow: 0 2px 6px rgba(59, 130, 246, 0.12);
        }

        .labor-toggle-btn {
          height: 40px;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 0 10px;
          border-radius: 9px;
          border: 1.5px solid #e2e8f0;
          background: #f8fafc;
          color: #475569;
          font-size: 0.74rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          user-select: none;
          white-space: nowrap;
          min-width: 0;
        }

        .labor-toggle-btn:hover {
          background: #f1f5f9;
          border-color: #cbd5e1;
          color: #0f172a;
        }

        .labor-toggle-btn.active {
          background: #ecfdf5;
          border-color: #10b981;
          color: #047857;
          font-weight: 800;
          box-shadow: 0 2px 6px rgba(16, 185, 129, 0.12);
        }

        .checkbox-custom {
          width: 16px;
          height: 16px;
          border-radius: 4px;
          border: 1.5px solid #94a3b8;
          background: #ffffff;
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
          background: #f8fafc;
          padding: 18px;
          border-radius: 14px;
          border: 1.5px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 12px;
          width: 100%;
          min-width: 0;
          box-sizing: border-box;
          box-shadow: 0 2px 8px rgba(15, 23, 42, 0.02);
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
          background: #ffffff;
          padding: 12px 14px;
          border-radius: 12px;
          border: 1.5px solid #fde68a;
          box-shadow: 0 2px 10px rgba(179, 142, 71, 0.08);
        }

        .budget-label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .labor-badge {
          font-size: 0.62rem;
          font-weight: 800;
          background: #ecfdf5;
          color: #047857;
          padding: 2px 6px;
          border-radius: 4px;
          border: 1px solid #a7f3d0;
        }

        .result-label {
          font-size: 0.68rem;
          color: #64748b;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .result-label.gold {
          color: #b38e47;
          font-weight: 800;
        }

        .result-value-row {
          display: flex;
          align-items: baseline;
          gap: 6px;
        }

        .result-main-val {
          font-size: 1.25rem;
          font-weight: 900;
          color: #0f172a;
        }

        .result-main-val.small {
          font-size: 0.9rem;
          color: #334155;
          font-weight: 800;
        }

        .result-main-val.gold {
          font-size: 1.35rem;
          color: #b38e47;
          font-weight: 900;
          letter-spacing: -0.01em;
        }

        .result-sub-val {
          font-size: 0.78rem;
          color: #2563eb;
          font-weight: 800;
        }

        .budget-breakdown-info {
          font-size: 0.66rem;
          color: #64748b;
          margin-top: 4px;
          line-height: 1.3;
        }

        .calc-cta-button {
          width: 100%;
          padding: 12px 16px;
          border-radius: 10px;
          background: linear-gradient(135deg, #b38e47 0%, #987532 100%);
          color: #ffffff;
          font-weight: 800;
          font-size: 0.88rem;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          box-shadow: 0 4px 14px rgba(179, 142, 71, 0.3);
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .calc-cta-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 22px rgba(179, 142, 71, 0.42);
        }

        @media (max-width: 640px) {
          .tile-calculator-card {
            padding: 0;
            border-radius: 0;
            border: none;
            box-shadow: none;
            background: transparent;
            width: 100%;
            max-width: 100%;
            box-sizing: border-box;
          }

          .tile-calc-header {
            margin-bottom: 8px;
          }

          .tile-calc-title {
            font-size: 0.88rem;
            line-height: 1.3;
            font-weight: 800;
          }

          .tile-calc-badges {
            margin-bottom: 4px;
            gap: 5px;
          }

          .badge-gold {
            display: none;
          }

          .badge-trust {
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
            letter-spacing: 0.04em;
          }

          .room-selector-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 4px;
            width: 100%;
          }

          .room-btn {
            flex-direction: column;
            gap: 3px;
            padding: 5px 1px;
            border-radius: 8px;
            height: 46px;
            min-width: 0;
          }

          .room-icon-svg {
            width: 14px;
            height: 14px;
          }

          .room-text {
            font-size: 0.66rem;
            font-weight: 750;
            white-space: nowrap;
            overflow: visible;
            text-overflow: clip;
            text-align: center;
          }

          .slider-header {
            margin-bottom: 1px;
          }

          .area-badge {
            font-size: 0.76rem;
            padding: 2px 7px;
          }

          .area-slider {
            height: 5px;
            margin-top: 2px;
          }

          .dropdowns-row {
            grid-template-columns: 1fr 1fr;
            gap: 6px;
            width: 100%;
          }

          .calc-select {
            padding: 5px 18px 5px 7px;
            font-size: 0.72rem;
            height: 32px;
            border-radius: 7px;
            width: 100%;
            line-height: 1;
          }

          .select-arrow {
            right: 5px;
            width: 12px;
            height: 12px;
          }

          .extra-controls-grid {
            grid-template-columns: 1fr;
            gap: 7px;
            padding-top: 0;
            width: 100%;
          }

          .extra-control-col {
            width: 100%;
          }

          .laying-pills {
            grid-template-columns: repeat(3, 1fr);
            height: 30px;
            gap: 4px;
            width: 100%;
          }

          .pill-btn {
            height: 30px;
            font-size: 0.65rem;
            padding: 0 2px;
            border-radius: 6px;
            min-width: 0;
            white-space: nowrap;
            text-align: center;
          }

          .labor-toggle-btn {
            height: 30px;
            font-size: 0.67rem;
            padding: 0 8px;
            gap: 6px;
            border-radius: 6px;
            width: 100%;
            white-space: nowrap;
          }

          .checkbox-custom {
            width: 13px;
            height: 13px;
          }

          .tile-calc-results {
            padding: 8px 10px;
            border-radius: 10px;
            gap: 8px;
            width: 100%;
            background: #f8fafc;
          }

          .results-inner-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 6px;
            width: 100%;
          }

          .result-item {
            background: #ffffff;
            padding: 6px 8px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            gap: 1px;
          }

          .result-item.budget-highlight {
            grid-column: 1 / -1;
            padding: 7px 10px;
            border-radius: 8px;
            background: #fffbeb;
            border: 1.5px solid #fde68a;
          }

          .result-main-val {
            font-size: 0.95rem;
          }

          .result-main-val.gold {
            font-size: 1.05rem;
          }

          .result-main-val.small {
            font-size: 0.74rem;
          }

          .result-sub-val {
            font-size: 0.66rem;
          }

          .budget-breakdown-info {
            font-size: 0.58rem;
            margin-top: 2px;
            line-height: 1.2;
          }

          .calc-cta-button {
            padding: 8px 12px;
            font-size: 0.78rem;
            border-radius: 7px;
            width: 100%;
            height: 36px;
          }
        }
      `}</style>
    </div>
  );
}
