'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Globe, Ship, Layers2, Sparkles, Building2, ShieldCheck, 
  ArrowRight, FileCheck, CheckCircle2, Calculator, X, MessageSquare, 
  FileText, ArrowUpRight, ChevronRight, Info
} from 'lucide-react';

const portsData = [
  { id: 'hamburg', name: 'Hamburg Port', country: '🇩🇪 Almanya', currency: 'EUR (€)', ratePer20ft: 1850, days: '10 - 14 Gün' },
  { id: 'jebel_ali', name: 'Jebel Ali Port', country: '🇦🇪 Dubai / BAE', currency: 'USD ($)', ratePer20ft: 2200, days: '12 - 16 Gün' },
  { id: 'ny', name: 'Port of New York', country: '🇺🇸 ABD', currency: 'USD ($)', ratePer20ft: 3400, days: '16 - 22 Gün' },
  { id: 'london', name: 'Port of London', country: '🇬🇧 İngiltere', currency: 'GBP (£)', ratePer20ft: 2100, days: '12 - 15 Gün' },
  { id: 'jeddah', name: 'Jeddah Islamic Port', country: '🇸🇦 Suudi Arabistan', currency: 'SAR (﷼)', ratePer20ft: 2600, days: '8 - 12 Gün' },
  { id: 'hamad', name: 'Hamad Port', country: '🇶🇦 Katar', currency: 'USD ($)', ratePer20ft: 2450, days: '10 - 14 Gün' }
];

const tileSpecsData = [
  { id: '60x120', label: '60x120 cm (Standart Porselen - 9mm)', kgPerM2: 22, m2PerPallet: 34.56 },
  { id: '120x120', label: '120x120 cm (Büyük Ebat Porselen - 9.5mm)', kgPerM2: 23, m2PerPallet: 36.00 },
  { id: '60x60', label: '60x60 cm (Porselen Karo - 8.5mm)', kgPerM2: 20.5, m2PerPallet: 43.20 },
  { id: '120x240', label: '120x240 cm (Slab Dev Plaka - 12mm)', kgPerM2: 28, m2PerPallet: 28.80 }
];

export default function GlobalExportHub() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sqm, setSqm] = useState(1200);
  const [selectedTile, setSelectedTile] = useState(tileSpecsData[0]);
  const [selectedPort, setSelectedPort] = useState(portsData[0]);
  const [incoterm, setIncoterm] = useState('CIF'); // 'FOB' or 'CIF'
  const [showRfqSuccess, setShowRfqSuccess] = useState(false);

  // Calculation Math
  const totalWeightKg = Math.round(sqm * selectedTile.kgPerM2);
  const totalWeightTon = (totalWeightKg / 1000).toFixed(1);
  const totalPallets = Math.ceil(sqm / selectedTile.m2PerPallet);

  // Max payload 20ft container: ~21,500 kg
  const container20ftCount = Math.ceil(totalWeightKg / 21500);

  // Freight estimate (CIF includes ocean freight + insurance)
  const baseFreightUSD = incoterm === 'CIF' ? container20ftCount * selectedPort.ratePer20ft : 450 * container20ftCount;
  const freightRangeLow = Math.round(baseFreightUSD * 0.95);
  const freightRangeHigh = Math.round(baseFreightUSD * 1.10);

  const handleWhatsAppSend = () => {
    const text = encodeURIComponent(
      `Merhaba SeramikBak İhracat Ekibi! B2B İhracat Navlun ve Konteyner Sorgusu:\n\n` +
      `📦 Metraj: ${sqm} m²\n` +
      `📐 Ebat: ${selectedTile.label}\n` +
      `🚢 Hedef Liman: ${selectedPort.country} (${selectedPort.name})\n` +
      `📄 Teslim Şekli: ${incoterm}\n` +
      `⚖️ Brüt Ağırlık: ${totalWeightTon} Ton (${totalPallets} Palet)\n` +
      `🚢 Konteyner: ${container20ftCount}x 20ft FCL Container\n\n` +
      `Resmi proforma teklifi ve fabrika teslim şartlarını almak istiyorum.`
    );
    window.open(`https://wa.me/905321234567?text=${text}`, '_blank');
  };

  return (
    <div className="global-export-hub-container">
      <div className="global-export-banner-card">

        {/* Top Header Badge & Tagline */}
        <div className="global-banner-header">
          <div className="global-pill-badge">
            <Globe size={14} className="globe-spin-icon" />
            <span>GLOBAL CERAMICS EXPORT & SHOWROOM PLATFORM</span>
          </div>
          <h2 className="global-banner-title">
            Markalarınızı ve Koleksiyonlarınızı <span>85+ Ülkeye & 15.000+ Uluslararası Mimara</span> Açıyoruz
          </h2>
          <p className="global-banner-desc">
            SeramikBak Global altyapısı; yerli ve uluslararası seramik üreticilerini dünya genelindeki B2B distribütörler, mimarlık ofisleri ve yüksek metrajlı projeler ile buluşturan yeni nesil dijital ihracat portalıdır.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="global-pillars-grid">

          {/* Pillar 1: Container Logistics */}
          <div className="global-pillar-card clickable" onClick={() => setIsModalOpen(true)}>
            <div className="pillar-top-row">
              <div className="pillar-icon-box gold">
                <Ship size={22} />
              </div>
              <span className="pillar-action-badge">Canlı Hesapla ⚡</span>
            </div>
            <h3>Konteyner Bazlı B2B İhracat Altyapısı</h3>
            <p>Fabrikadan doğrudan dünya limanlarına (Hamburg, Dubai, New York, Londra, Riyad) palet ve konteyner bazlı lojistik ve FOB/CIF fiyatlama altyapısı.</p>

            <button className="pillar-trigger-btn gold">
              <Calculator size={14} />
              <span>İhracat Navlun & Konteyner Hesapla</span>
              <ArrowRight size={13} />
            </button>
            <div className="pillar-tag">FOB & CIF Export Ready</div>
          </div>

          {/* Pillar 2: Architectural BIM */}
          <div className="global-pillar-card">
            <div className="pillar-top-row">
              <div className="pillar-icon-box blue">
                <Layers2 size={22} />
              </div>
            </div>
            <h3>Global BIM / CAD Kütüphanesi</h3>
            <p>Uluslararası mimarlık ve iç mimarlık büroları için Revit (.rfa), AutoCAD (.dwg) ve dikişsiz 4K Seamless PBR doku paketleri.</p>

            <button className="pillar-trigger-btn blue" onClick={() => alert('CAD & BIM İndirme Portalı: İstediğiniz seramiğin detay sayfasından .ZIP formatında tüm 4K dikişsiz dokuları ve AutoCAD dosyalarını 1 tıkla indirebilirsiniz.')}>
              <Layers2 size={14} />
              <span>4K BIM / CAD Paketlerini İncele</span>
              <ArrowRight size={13} />
            </button>
            <div className="pillar-tag">Architectural BIM Certified</div>
          </div>

          {/* Pillar 3: Multi-lingual SEO */}
          <div className="global-pillar-card">
            <div className="pillar-top-row">
              <div className="pillar-icon-box emerald">
                <Globe size={22} />
              </div>
            </div>
            <h3>5 Dilde Dijital Showroom & SEO</h3>
            <p>Türkçe, İngilizce, Almanca, Arapça ve Rusça otomatik arama motoru indekslemesi ile Google Global ve Yandex'te üst sıralarda görünürlük.</p>

            <button className="pillar-trigger-btn emerald" onClick={() => alert('Desteklenen Küresel Diller: Türkçe (TR), English (EN), Deutsch (DE), العربية (AR), Русский (RU). Üst menüden dilediğiniz dili seçebilirsiniz.')}>
              <Globe size={14} />
              <span>85+ İhracat Ülkesi & Diller</span>
              <ArrowRight size={13} />
            </button>
            <div className="pillar-tag">Multi-lingual Global Index</div>
          </div>

          {/* Pillar 4: Web 3D / AR */}
          <div className="global-pillar-card">
            <div className="pillar-top-row">
              <div className="pillar-icon-box purple">
                <Sparkles size={22} />
              </div>
            </div>
            <h3>Web 3D & AR Canlı Deneyim Engine</h3>
            <p>Uygulama indirme zorunluluğu olmadan dünya genelindeki alıcılar ve mimarlar için tarayıcı üzerinden 360° mekan ve AR kaplama.</p>

            <button className="pillar-trigger-btn purple" onClick={() => { const el = document.getElementById('studio3d-anchor'); if(el) el.scrollIntoView({ behavior: 'smooth' }); }}>
              <Sparkles size={14} />
              <span>3D Canlı Stüdyoyu Aç</span>
              <ArrowRight size={13} />
            </button>
            <div className="pillar-tag">App-Free Web3D / AR</div>
          </div>

        </div>

        {/* Global Performance Metrics Bar */}
        <div className="global-metrics-bar">
          <div className="metric-item">
            <strong>85+</strong>
            <span>İhracat Hedef Ülkesi</span>
          </div>
          <div className="metric-divider" />
          <div className="metric-item">
            <strong>15.000+</strong>
            <span>Kayıtlı Uluslararası Mimar</span>
          </div>
          <div className="metric-divider" />
          <div className="metric-item">
            <strong>25.000+</strong>
            <span>Aylık CAD/BIM İndirme</span>
          </div>
          <div className="metric-divider" />
          <div className="metric-item">
            <strong>5 Dilde</strong>
            <span>Canlı Kur & Katalog</span>
          </div>
        </div>

        {/* Call to Action Bar */}
        <div className="global-cta-row">
          <div className="cta-text-group">
            <CheckCircle2 size={18} style={{ color: '#10b981' }} />
            <span>Markanızın seramik kataloglarını dünya pazarına açmak ve global B2B projelerden teklif almak ister misiniz?</span>
          </div>
          <Link href="/marka" className="global-brand-join-btn">
            <Building2 size={16} />
            <span>Markanızı İhracat Ağına Ekleyin</span>
            <ArrowRight size={14} />
          </Link>
        </div>

      </div>

      {/* INTERACTIVE CONTAINER & LOGISTICS EXPORT CALCULATOR MODAL */}
      {isModalOpen && (
        <div className="export-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="export-modal-card glass-panel" onClick={(e) => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div className="export-modal-header">
              <div className="modal-title-box">
                <div className="modal-icon-gold">
                  <Ship size={22} />
                </div>
                <div>
                  <h3>🚢 B2B İhracat Navlun & Konteyner Hesaplayıcı</h3>
                  <p>Fabrikadan dünya limanlarına otomatik konteyner, palet ve navlun maliyeti hesaplama portalı</p>
                </div>
              </div>
              <button className="export-modal-close" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            {/* Modal Body: Controls & Real-Time Calculation */}
            <div className="export-modal-body">
              
              {/* Left Column: Input Form */}
              <div className="export-form-column">
                
                {/* SQM Slider & Input */}
                <div className="input-group">
                  <div className="input-label-row">
                    <label>Proje Metrajı (m²)</label>
                    <span className="sqm-badge-value">{sqm.toLocaleString('tr-TR')} m²</span>
                  </div>
                  <input 
                    type="range" 
                    min="100" 
                    max="10000" 
                    step="50" 
                    value={sqm} 
                    onChange={(e) => setSqm(parseInt(e.target.value) || 100)} 
                    className="export-range-slider"
                  />
                  <div className="quick-sqm-presets">
                    {[500, 1200, 2500, 5000].map(val => (
                      <button 
                        key={val} 
                        onClick={() => setSqm(val)}
                        className={`preset-btn ${sqm === val ? 'active' : ''}`}
                      >
                        {val.toLocaleString('tr-TR')} m²
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tile Spec Selection */}
                <div className="input-group">
                  <label>Seramik Ebadı & Kalınlık Tipi</label>
                  <select 
                    value={selectedTile.id} 
                    onChange={(e) => setSelectedTile(tileSpecsData.find(t => t.id === e.target.value))}
                    className="export-select-input"
                  >
                    {tileSpecsData.map(tile => (
                      <option key={tile.id} value={tile.id}>{tile.label}</option>
                    ))}
                  </select>
                </div>

                {/* Destination Port Selection */}
                <div className="input-group">
                  <label>Hedef Liman (Destination Port)</label>
                  <select 
                    value={selectedPort.id} 
                    onChange={(e) => setSelectedPort(portsData.find(p => p.id === e.target.value))}
                    className="export-select-input"
                  >
                    {portsData.map(port => (
                      <option key={port.id} value={port.id}>{port.country} - {port.name}</option>
                    ))}
                  </select>
                </div>

                {/* Incoterms Trade Terms */}
                <div className="input-group">
                  <label>Teslim Şekli (Incoterms 2020)</label>
                  <div className="incoterm-buttons">
                    <button 
                      onClick={() => setIncoterm('CIF')} 
                      className={`incoterm-btn ${incoterm === 'CIF' ? 'active' : ''}`}
                    >
                      <strong>CIF (Cost, Insurance & Freight)</strong>
                      <span>Sigortalı Deniz Navlunu Dahil (Hedef Liman Teslim)</span>
                    </button>
                    <button 
                      onClick={() => setIncoterm('FOB')} 
                      className={`incoterm-btn ${incoterm === 'FOB' ? 'active' : ''}`}
                    >
                      <strong>FOB (Free On Board)</strong>
                      <span>Türkiye Çıkış Limanı Teslim (Ambarlı/Alsancak/Mersin)</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* Right Column: Live Calculation Results Card */}
              <div className="export-results-column">
                <div className="results-card-inner">
                  <div className="results-card-title">
                    <span>OTOMATİK SEVKIYAT VE NAVLUN RAPORU</span>
                    <span className="live-status-dot" />
                  </div>

                  <div className="results-stats-grid">
                    
                    <div className="result-stat-box">
                      <span className="stat-label">Brüt Tonaj</span>
                      <strong className="stat-val-highlight">{totalWeightTon} Ton</strong>
                      <span className="stat-sub">~{totalWeightKg.toLocaleString('tr-TR')} kg</span>
                    </div>

                    <div className="result-stat-box">
                      <span className="stat-label">Palet İhtiyacı</span>
                      <strong className="stat-val-highlight">{totalPallets} Palet</strong>
                      <span className="stat-sub">Export Euro-Palet</span>
                    </div>

                    <div className="result-stat-box full-width">
                      <span className="stat-label">Konteyner İhtiyacı (FCL)</span>
                      <strong className="stat-val-gold">{container20ftCount}x 20ft Heavy FCL Container</strong>
                      <span className="stat-sub">Max payload ~21.5 Ton / Konteyner</span>
                    </div>

                    <div className="result-stat-box">
                      <span className="stat-label">Tahmini Transit Süre</span>
                      <strong className="stat-val-white">{selectedPort.days}</strong>
                      <span className="stat-sub">{selectedPort.name}</span>
                    </div>

                    <div className="result-stat-box">
                      <span className="stat-label">Tahmini Navlun Aralığı</span>
                      <strong className="stat-val-green">${freightRangeLow.toLocaleString()} - ${freightRangeHigh.toLocaleString()} USD</strong>
                      <span className="stat-sub">{incoterm} bazında liman navlunu</span>
                    </div>

                  </div>

                  {/* Actions Inside Calculator Modal */}
                  <div className="results-action-group">
                    <button onClick={() => setShowRfqSuccess(true)} className="proforma-request-btn">
                      <FileText size={16} />
                      <span>Resmi İhracat Proforma Teklifi Al</span>
                    </button>

                    <button onClick={handleWhatsAppSend} className="whatsapp-export-btn">
                      <MessageSquare size={16} />
                      <span>İhracat Temsilcisine WhatsApp'tan İlet</span>
                    </button>
                  </div>

                  {showRfqSuccess && (
                    <div className="rfq-success-banner">
                      <CheckCircle2 size={16} style={{ color: '#10b981' }} />
                      <span>İhracat talebiniz kaydedildi. Müşteri temsilcimiz proforma faturayı e-posta adresinize gönderecektir.</span>
                    </div>
                  )}

                  <div className="export-disclaimer">
                    <ShieldCheck size={14} style={{ color: '#d4af37', flexShrink: 0, marginTop: '2px' }} />
                    <span>
                      <strong>Yasal Uyarı & Şeffaf Fiyatlandırma:</strong> Bu araç uluslararası alıcılar için <em>Ön İhracat Lojistik Simülasyonudur (Pre-Export Estimate)</em>. Hesaplanan tonaj ve navlun değerleri hukuken bağlayıcı teklif (binding offer) niteliğinde olmayıp; nihai bedel fabrika resmi kantar tartımı, çelik çemberleme ve güncel deniz navlun kurlarına göre <strong>resmi proforma faturada</strong> kesinleşir.
                    </span>
                  </div>

                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      <style jsx>{`
        .global-export-hub-container {
          width: 100%;
          margin: 36px 0;
        }

        .global-export-banner-card {
          background: linear-gradient(135deg, #0d121c 0%, #161e2e 50%, #0d121c 100%);
          border: 1px solid rgba(197, 160, 89, 0.35);
          border-radius: 24px;
          padding: 36px 32px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08);
          color: #ffffff;
          display: flex;
          flex-direction: column;
          gap: 32px;
          position: relative;
          overflow: hidden;
        }

        .global-banner-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 12px;
          max-width: 820px;
          margin: 0 auto;
        }

        .global-pill-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(197, 160, 89, 0.15);
          border: 1px solid rgba(197, 160, 89, 0.4);
          color: #d4af37;
          font-size: 0.72rem;
          font-weight: 800;
          padding: 5px 16px;
          border-radius: 20px;
          letter-spacing: 0.08em;
        }

        .globe-spin-icon {
          animation: spinSlow 12s linear infinite;
        }

        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .global-banner-title {
          font-family: var(--font-title);
          font-size: 2rem;
          font-weight: 900;
          line-height: 1.25;
          letter-spacing: -0.02em;
          margin: 0;
          color: #ffffff;
        }

        .global-banner-title span {
          background: linear-gradient(135deg, #d4af37 0%, #fef08a 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .global-banner-desc {
          font-size: 0.9rem;
          color: #94a3b8;
          line-height: 1.6;
          margin: 0;
        }

        .global-pillars-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        @media (max-width: 1024px) {
          .global-pillars-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .global-pillars-grid {
            grid-template-columns: 1fr;
          }
          .global-export-banner-card {
            padding: 24px 16px;
          }
          .global-banner-title {
            font-size: 1.45rem;
          }
        }

        .global-pillar-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 16px;
          padding: 22px 18px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }

        .global-pillar-card.clickable {
          cursor: pointer;
        }

        .global-pillar-card:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(197, 160, 89, 0.4);
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
        }

        .pillar-top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .pillar-action-badge {
          background: rgba(212, 175, 55, 0.2);
          border: 1px solid rgba(212, 175, 55, 0.4);
          color: #fef08a;
          font-size: 0.65rem;
          font-weight: 800;
          padding: 3px 8px;
          border-radius: 12px;
          animation: pulse 2s infinite alternate;
        }

        .pillar-icon-box {
          width: 46px;
          height: 46px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pillar-icon-box.gold { background: rgba(212, 175, 55, 0.15); color: #d4af37; }
        .pillar-icon-box.blue { background: rgba(2, 132, 199, 0.15); color: #38bdf8; }
        .pillar-icon-box.emerald { background: rgba(16, 185, 129, 0.15); color: #34d399; }
        .pillar-icon-box.purple { background: rgba(168, 85, 247, 0.15); color: #c084fc; }

        .global-pillar-card h3 {
          font-size: 0.95rem;
          font-weight: 800;
          margin: 0;
          color: #f8fafc;
          line-height: 1.35;
        }

        .global-pillar-card p {
          font-size: 0.78rem;
          color: #94a3b8;
          line-height: 1.5;
          margin: 0;
          flex: 1;
        }

        .pillar-trigger-btn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          border-radius: 10px;
          font-size: 0.75rem;
          font-weight: 800;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-top: 4px;
        }

        .pillar-trigger-btn.gold { background: rgba(212, 175, 55, 0.2); color: #fef08a; border: 1px solid rgba(212, 175, 55, 0.4); }
        .pillar-trigger-btn.gold:hover { background: #d4af37; color: #0b0f17; }

        .pillar-trigger-btn.blue { background: rgba(2, 132, 199, 0.2); color: #38bdf8; border: 1px solid rgba(2, 132, 199, 0.4); }
        .pillar-trigger-btn.blue:hover { background: #0284c7; color: #ffffff; }

        .pillar-trigger-btn.emerald { background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.4); }
        .pillar-trigger-btn.emerald:hover { background: #10b981; color: #ffffff; }

        .pillar-trigger-btn.purple { background: rgba(168, 85, 247, 0.2); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.4); }
        .pillar-trigger-btn.purple:hover { background: #a855f7; color: #ffffff; }

        .pillar-tag {
          font-size: 0.62rem;
          font-weight: 700;
          color: #d4af37;
          background: rgba(212, 175, 55, 0.1);
          padding: 3px 8px;
          border-radius: 4px;
          width: fit-content;
          letter-spacing: 0.04em;
        }

        .global-metrics-bar {
          display: flex;
          align-items: center;
          justify-content: space-around;
          background: rgba(0, 0, 0, 0.35);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 18px 24px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .metric-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }

        .metric-item strong {
          font-family: var(--font-title);
          font-size: 1.4rem;
          font-weight: 900;
          color: #d4af37;
        }

        .metric-item span {
          font-size: 0.72rem;
          color: #94a3b8;
          font-weight: 600;
        }

        .metric-divider {
          width: 1px;
          height: 30px;
          background: rgba(255, 255, 255, 0.1);
        }

        .global-cta-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: linear-gradient(135deg, rgba(197, 160, 89, 0.12) 0%, rgba(197, 160, 89, 0.04) 100%);
          border: 1px solid rgba(197, 160, 89, 0.3);
          padding: 16px 24px;
          border-radius: 16px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .cta-text-group {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.84rem;
          font-weight: 700;
          color: #f1f5f9;
        }

        .global-brand-join-btn {
          background: linear-gradient(135deg, #d4af37 0%, #b38e47 100%);
          color: #0b0f17;
          border: none;
          padding: 10px 20px;
          border-radius: 10px;
          font-size: 0.82rem;
          font-weight: 800;
          cursor: pointer;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 18px rgba(212, 175, 55, 0.35);
          transition: all 0.25s ease;
          white-space: nowrap;
        }

        .global-brand-join-btn:hover {
          background: linear-gradient(135deg, #fef08a 0%, #d4af37 100%);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(212, 175, 55, 0.5);
        }

        /* EXPORT CALCULATOR MODAL STYLES */
        .export-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(5, 8, 15, 0.85);
          backdrop-filter: blur(16px);
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .export-modal-card {
          background: linear-gradient(135deg, #0d121c 0%, #161e2e 100%);
          border: 1px solid rgba(212, 175, 55, 0.4);
          border-radius: 24px;
          max-width: 960px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 25px 70px rgba(0, 0, 0, 0.8), 0 0 50px rgba(212, 175, 55, 0.15);
          padding: 28px;
          color: #ffffff;
          display: flex;
          flex-direction: column;
          gap: 24px;
          animation: modalFadeUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes modalFadeUp {
          from { opacity: 0; transform: translateY(20px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .export-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding-bottom: 16px;
        }

        .modal-title-box {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .modal-icon-gold {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: rgba(212, 175, 55, 0.15);
          border: 1px solid rgba(212, 175, 55, 0.4);
          color: #d4af37;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .modal-title-box h3 {
          font-family: var(--font-title);
          font-size: 1.25rem;
          font-weight: 800;
          margin: 0;
          color: #f8fafc;
        }

        .modal-title-box p {
          font-size: 0.78rem;
          color: #94a3b8;
          margin: 2px 0 0 0;
        }

        .export-modal-close {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #94a3b8;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .export-modal-close:hover {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }

        .export-modal-body {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        @media (max-width: 768px) {
          .export-modal-body {
            grid-template-columns: 1fr;
          }
          .export-modal-card {
            padding: 18px;
          }
        }

        .export-form-column {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .input-group label {
          font-size: 0.78rem;
          font-weight: 700;
          color: #cbd5e1;
        }

        .input-label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .sqm-badge-value {
          font-size: 0.85rem;
          font-weight: 900;
          color: #d4af37;
          background: rgba(212, 175, 55, 0.15);
          padding: 2px 8px;
          border-radius: 6px;
        }

        .export-range-slider {
          accent-color: #d4af37;
          height: 6px;
          border-radius: 3px;
          cursor: pointer;
        }

        .quick-sqm-presets {
          display: flex;
          gap: 6px;
        }

        .preset-btn {
          flex: 1;
          padding: 5px;
          border-radius: 6px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.03);
          color: #94a3b8;
          font-size: 0.68rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }

        .preset-btn.active, .preset-btn:hover {
          background: rgba(212, 175, 55, 0.2);
          color: #fef08a;
          border-color: rgba(212, 175, 55, 0.4);
        }

        .export-select-input {
          background: rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #ffffff;
          padding: 10px 12px;
          border-radius: 10px;
          font-size: 0.82rem;
          outline: none;
        }

        .export-select-input option {
          background: #0f172a;
          color: #ffffff;
        }

        .incoterm-buttons {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .incoterm-btn {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 2px;
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.02);
          color: #cbd5e1;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }

        .incoterm-btn.active {
          background: rgba(212, 175, 55, 0.15);
          border-color: rgba(212, 175, 55, 0.5);
          color: #ffffff;
        }

        .incoterm-btn strong {
          font-size: 0.8rem;
          color: #d4af37;
        }

        .incoterm-btn span {
          font-size: 0.68rem;
          color: #94a3b8;
        }

        /* Results Card */
        .export-results-column {
          display: flex;
        }

        .results-card-inner {
          background: rgba(0, 0, 0, 0.45);
          border: 1px solid rgba(212, 175, 55, 0.3);
          border-radius: 18px;
          padding: 20px;
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .results-card-title {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.7rem;
          font-weight: 900;
          color: #d4af37;
          letter-spacing: 0.08em;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding-bottom: 10px;
        }

        .live-status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 8px #10b981;
        }

        .results-stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }

        .result-stat-box {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          padding: 10px 12px;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .result-stat-box.full-width {
          grid-column: span 2;
          background: rgba(212, 175, 55, 0.08);
          border-color: rgba(212, 175, 55, 0.25);
        }

        .stat-label {
          font-size: 0.65rem;
          color: #94a3b8;
          font-weight: 700;
          text-transform: uppercase;
        }

        .stat-val-highlight {
          font-size: 1.1rem;
          font-weight: 900;
          color: #ffffff;
        }

        .stat-val-gold {
          font-size: 0.95rem;
          font-weight: 900;
          color: #d4af37;
        }

        .stat-val-white {
          font-size: 0.95rem;
          font-weight: 900;
          color: #f1f5f9;
        }

        .stat-val-green {
          font-size: 0.9rem;
          font-weight: 900;
          color: #34d399;
        }

        .stat-sub {
          font-size: 0.62rem;
          color: #64748b;
        }

        .results-action-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 8px;
        }

        .proforma-request-btn {
          background: linear-gradient(135deg, #d4af37 0%, #b38e47 100%);
          color: #0b0f17;
          border: none;
          padding: 12px;
          border-radius: 12px;
          font-size: 0.84rem;
          font-weight: 900;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 4px 16px rgba(212, 175, 55, 0.3);
          transition: all 0.2s;
        }

        .proforma-request-btn:hover {
          background: linear-gradient(135deg, #fef08a 0%, #d4af37 100%);
          transform: translateY(-2px);
        }

        .whatsapp-export-btn {
          background: rgba(34, 197, 94, 0.15);
          border: 1px solid rgba(34, 197, 94, 0.4);
          color: #4ade80;
          padding: 10px;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 800;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
        }

        .whatsapp-export-btn:hover {
          background: #22c55e;
          color: #ffffff;
        }

        .rfq-success-banner {
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.4);
          color: #34d399;
          padding: 10px 12px;
          border-radius: 10px;
          font-size: 0.72rem;
          display: flex;
          align-items: center;
          gap: 8px;
          line-height: 1.4;
        }

        .export-disclaimer {
          display: flex;
          align-items: flex-start;
          gap: 6px;
          font-size: 0.62rem;
          color: #64748b;
          line-height: 1.4;
        }
      `}</style>
    </div>
  );
}
