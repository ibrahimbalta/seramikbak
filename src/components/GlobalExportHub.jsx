'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Globe, Ship, Layers2, Sparkles, Building2, ShieldCheck, 
  ArrowRight, FileCheck, CheckCircle2, Calculator, X, MessageSquare, 
  FileText, ArrowUpRight, ChevronRight, Info, Download, Check
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

const exportCountriesList = [
  { flag: '🇩🇪', name: 'Almanya (Germany)', port: 'Hamburg / Bremen', lang: 'Deutsch (DE)' },
  { flag: '🇦🇪', name: 'BAE (United Arab Emirates)', port: 'Jebel Ali / Abu Dhabi', lang: 'English / Arabic' },
  { flag: '🇺🇸', name: 'ABD (United States)', port: 'New York / Los Angeles', lang: 'English (US)' },
  { flag: '🇬🇧', name: 'İngiltere (United Kingdom)', port: 'London Gateway / Felixstowe', lang: 'English (UK)' },
  { flag: '🇸🇦', name: 'Suudi Arabistan (Saudi Arabia)', port: 'Jeddah / Dammam', lang: 'العربية (AR)' },
  { flag: '🇶🇦', name: 'Katar (Qatar)', port: 'Hamad Port', lang: 'English / Arabic' },
  { flag: '🇫🇷', name: 'Fransa (France)', port: 'Le Havre / Marseille', lang: 'Français' },
  { flag: '🇳🇱', name: 'Hollanda (Netherlands)', port: 'Rotterdam', lang: 'Dutch / English' },
  { flag: '🇮🇹', name: 'İtalya (Italy)', port: 'Genoa / Trieste', lang: 'Italiano' },
  { flag: '🇪🇸', name: 'İspanya (Spain)', port: 'Valencia / Barcelona', lang: 'Español' },
  { flag: '🇷🇺', name: 'Rusya (Russia)', port: 'Novorossiysk / St. Petersburg', lang: 'Русский (RU)' },
  { flag: '🇰🇼', name: 'Kuveyt (Kuwait)', port: 'Shuwaikh Port', lang: 'العربية / English' }
];

export default function GlobalExportHub({ onOpen3DStudio }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [isBimModalOpen, setIsBimModalOpen] = useState(false);
  const [isCountriesModalOpen, setIsCountriesModalOpen] = useState(false);

  const [sqm, setSqm] = useState(1200);
  const [selectedTile, setSelectedTile] = useState(tileSpecsData[0]);
  const [selectedPort, setSelectedPort] = useState(portsData[0]);
  const [incoterm, setIncoterm] = useState('CIF'); // 'FOB' or 'CIF'
  const [showRfqSuccess, setShowRfqSuccess] = useState(false);
  const [downloadedBim, setDownloadedBim] = useState(false);

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

  const handle3DStudioClick = () => {
    if (onOpen3DStudio) {
      onOpen3DStudio();
    } else {
      const el = document.getElementById('studio3d-anchor');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="global-export-hub-container">
      <div className="global-export-banner-card">

        {/* Compact Header Badge & Tagline */}
        <div className="global-banner-header">
          <div className="global-pill-badge">
            <Globe size={13} className="globe-spin-icon" />
            <span>GLOBAL CERAMICS EXPORT PORTAL</span>
          </div>
          <h2 className="global-banner-title">
            Markalarınızı ve Koleksiyonlarınızı <span>85+ Ülkeye & 15.000+ Uluslararası Mimara</span> Açıyoruz
          </h2>
          <p className="global-banner-desc">
            SeramikBak Global altyapısı; yerli ve uluslararası seramik üreticilerini dünya genelindeki B2B distribütörler, mimarlık büroları ve yüksek metrajlı projeler ile buluşturan yeni nesil dijital ihracat portalıdır.
          </p>
        </div>

        {/* 4 Pillars Grid (Compact Layout) */}
        <div className="global-pillars-grid">

          {/* Pillar 1: Container Logistics */}
          <div className="global-pillar-card clickable" onClick={() => setIsModalOpen(true)}>
            <div className="pillar-top-row">
              <div className="pillar-icon-box gold">
                <Ship size={18} />
              </div>
              <span className="pillar-action-badge">Canlı Hesapla ⚡</span>
            </div>
            <h3>Konteyner Bazlı B2B İhracat Altyapısı</h3>
            <p>Fabrikadan dünya limanlarına palet ve 20ft konteyner bazlı lojistik & FOB/CIF navlun altyapısı.</p>

            <button className="pillar-trigger-btn gold">
              <Calculator size={13} />
              <span>İhracat Navlun & Konteyner Hesapla</span>
              <ArrowRight size={12} />
            </button>
          </div>

          {/* Pillar 2: Architectural BIM */}
          <div className="global-pillar-card clickable" onClick={() => setIsBimModalOpen(true)}>
            <div className="pillar-top-row">
              <div className="pillar-icon-box blue">
                <Layers2 size={18} />
              </div>
              <span className="pillar-action-badge blue">4K PBR Ready</span>
            </div>
            <h3>Global BIM / CAD Kütüphanesi</h3>
            <p>Uluslararası mimarlık büroları için Revit (.rfa), AutoCAD (.dwg) ve dikişsiz 4K PBR dokular.</p>

            <button className="pillar-trigger-btn blue">
              <Layers2 size={13} />
              <span>4K BIM / CAD Paketleri</span>
              <ArrowRight size={12} />
            </button>
          </div>

          {/* Pillar 3: Multi-lingual SEO */}
          <div className="global-pillar-card clickable" onClick={() => setIsCountriesModalOpen(true)}>
            <div className="pillar-top-row">
              <div className="pillar-icon-box emerald">
                <Globe size={18} />
              </div>
              <span className="pillar-action-badge emerald">85+ Ülke</span>
            </div>
            <h3>5 Dilde Dijital Showroom & SEO</h3>
            <p>Türkçe, İngilizce, Almanca, Arapça ve Rusça arama motoru indekslemesi ile Google Global görünürlük.</p>

            <button className="pillar-trigger-btn emerald">
              <Globe size={13} />
              <span>İhracat Ülkeleri & Diller</span>
              <ArrowRight size={12} />
            </button>
          </div>

          {/* Pillar 4: Web 3D / AR */}
          <div className="global-pillar-card clickable" onClick={handle3DStudioClick}>
            <div className="pillar-top-row">
              <div className="pillar-icon-box purple">
                <Sparkles size={18} />
              </div>
              <span className="pillar-action-badge purple">Web 3D Live</span>
            </div>
            <h3>Web 3D & AR Canlı Deneyim Engine</h3>
            <p>Uygulamasız tarayıcı üzerinden 360° sanal banyoda ve mekanda canlı karo kaplama simülatörü.</p>

            <button className="pillar-trigger-btn purple">
              <Sparkles size={13} />
              <span>3D Canlı Stüdyoyu Aç</span>
              <ArrowRight size={12} />
            </button>
          </div>

        </div>

        {/* Compact Integrated Metrics & High-Contrast CTA Bar */}
        <div className="global-metrics-and-cta-bar">
          <div className="global-metrics-mini">
            <div className="mini-metric">
              <strong>85+</strong> <span>İhracat Ülkesi</span>
            </div>
            <div className="mini-divider" />
            <div className="mini-metric">
              <strong>15.000+</strong> <span>Uluslararası Mimar</span>
            </div>
            <div className="mini-divider" />
            <div className="mini-metric">
              <strong>25.000+</strong> <span>Aylık BIM İndirme</span>
            </div>
            <div className="mini-divider" />
            <div className="mini-metric">
              <strong>5 Dilde</strong> <span>Canlı Katalog</span>
            </div>
          </div>

          <div className="global-cta-buttons-mini">
            <button onClick={() => setIsHowItWorksOpen(true)} className="global-how-it-works-btn">
              <Info size={14} />
              <span>İhracat Mekanizması Nasıl Çalışır?</span>
            </button>
            <Link href="/marka" className="global-brand-join-btn">
              <Building2 size={15} />
              <span>Markanızı İhracat Ağına Ekleyin</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

      </div>

      {/* MODAL 1: HOW EXPORT MATCHING ENGINE WORKS FOR BRANDS */}
      {isHowItWorksOpen && (
        <div className="export-modal-overlay" onClick={() => setIsHowItWorksOpen(false)}>
          <div className="export-modal-card glass-panel" style={{ maxWidth: '840px' }} onClick={(e) => e.stopPropagation()}>
            <div className="export-modal-header">
              <div className="modal-title-box">
                <div className="modal-icon-gold">
                  <Globe size={22} />
                </div>
                <div>
                  <h3>🌐 SeramikBak İhracat Eşleştirme Motoru Nasıl Çalışır?</h3>
                  <p>Üretici markaların seramik koleksiyonlarını dünya pazarına 5 adımda bağlayan teknolojik altyapımız</p>
                </div>
              </div>
              <button className="export-modal-close" onClick={() => setIsHowItWorksOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="how-it-works-steps-grid">
              
              <div className="how-step-card">
                <div className="step-num-badge">1</div>
                <div>
                  <h4>5 Dilde Otomatik SEO & Arama Motoru İndekslemesi</h4>
                  <p>Markanızın tüm ürünleri Türkçe, İngilizce, Almanca, Arapça ve Rusça indekslenir. Dubai, Hamburg veya New York'taki bir alıcı Google Global'de arama yaptığında ürünleriniz en üstte listelenir.</p>
                </div>
              </div>

              <div className="how-step-card">
                <div className="step-num-badge">2</div>
                <div>
                  <h4>Global BIM / CAD Mimari Şartname Entegrasyonu</h4>
                  <p>Uluslararası mimarlık ofisleri basılı katalog yerine Revit (.rfa), AutoCAD (.dwg) ve 4K dikişsiz PBR dokuları indirir. Seramikleriniz doğrudan yurt dışındaki dev otel ve konut projelerinin şartnamesine girer.</p>
                </div>
              </div>

              <div className="how-step-card">
                <div className="step-num-badge">3</div>
                <div>
                  <h4>Canlı B2B Konteyner & Navlun Fiyatlama Engine</h4>
                  <p>Yabancı distribütör metrajını ve ebadını girdiğinde; tonaj, palet sayısı, 20ft konteyner adedi ve Hamburg, Dubai, NY liman navlun bedeli otomatik hesaplanır. İhracat belirsizliği ortadan kalkar.</p>
                </div>
              </div>

              <div className="how-step-card">
                <div className="step-num-badge">4</div>
                <div>
                  <h4>Uygulamasız Web 3D & AR Canlı Mekan Görselleştirici</h4>
                  <p>Alıcılar fiziki showroom ziyareti yapmadan cep telefonu veya bilgisayar üzerinden seramiklerinizi 360° sanal banyoda veya kendi mekanlarında AR ile canlı dener.</p>
                </div>
              </div>

              <div className="how-step-card highlight">
                <div className="step-num-badge gold">5</div>
                <div>
                  <h4>Onaylı B2B İhracat Taleplerinin Marka Kokpitine İletilmesi</h4>
                  <p>Gelen yüksek metrajlı proje ve distribütör alım talepleri doğrulanır (Firma adı, Ülke, Proje m²) ve doğrudan markanızın B2B İhracat Paneline (`/marka`) ve ihracat müdürünüze aktarılır.</p>
                </div>
              </div>

            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
              <Link href="/marka" className="global-brand-join-btn" style={{ padding: '12px 24px', fontSize: '0.88rem' }}>
                <Building2 size={16} />
                <span>Markanızı İhracat Ağına Dahil Edin</span>
                <ArrowRight size={14} />
              </Link>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: INTERACTIVE CONTAINER & LOGISTICS EXPORT CALCULATOR MODAL */}
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

      {/* MODAL 3: 4K BIM / CAD ARCHITECTURAL DOWNLOAD MODAL */}
      {isBimModalOpen && (
        <div className="export-modal-overlay" onClick={() => setIsBimModalOpen(false)}>
          <div className="export-modal-card glass-panel" style={{ maxWidth: '720px' }} onClick={(e) => e.stopPropagation()}>
            <div className="export-modal-header">
              <div className="modal-title-box">
                <div className="modal-icon-gold">
                  <Layers2 size={22} />
                </div>
                <div>
                  <h3>📐 Global BIM / CAD Mimari Doku Kütüphanesi</h3>
                  <p>Revit (.RFA), AutoCAD (.DWG) ve 4K Seamless PBR Doku Paketleri</p>
                </div>
              </div>
              <button className="export-modal-close" onClick={() => setIsBimModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', margin: '10px 0' }}>
              <p style={{ fontSize: '0.85rem', color: '#e2e8f0', lineHeight: 1.6, margin: 0 }}>
                SeramikBak, uluslararası mimarlık ve iç mimarlık büroları için tüm markaların koleksiyonlarını **4K Seamless PBR (Diffuse, Roughness, Normal Map)** ve **Autodesk Revit / AutoCAD** formatlarında sunar.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '14px', borderRadius: '12px' }}>
                  <div style={{ fontWeight: '800', color: '#d4af37', fontSize: '0.9rem', marginBottom: '4px' }}>Revit BIM Family (.RFA)</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Revit 2020-2026 Uyumlu Şartname Nesnesi</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '14px', borderRadius: '12px' }}>
                  <div style={{ fontWeight: '800', color: '#38bdf8', fontSize: '0.9rem', marginBottom: '4px' }}>AutoCAD Hatch (.DWG)</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>2D Seramik Döşeme Planları & Derz Çizimleri</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '14px', borderRadius: '12px' }}>
                  <div style={{ fontWeight: '800', color: '#34d399', fontSize: '0.9rem', marginBottom: '4px' }}>4K Seamless PBR Textures</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>3ds Max, Blender, Corona & V-Ray Hazır</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '14px', borderRadius: '12px' }}>
                  <div style={{ fontWeight: '800', color: '#c084fc', fontSize: '0.9rem', marginBottom: '4px' }}>SketchUp Material (.SKM)</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Tek Tıkla İç Mimari Modellere Ekleme</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button 
                  onClick={() => { setDownloadedBim(true); setTimeout(() => setDownloadedBim(false), 3000); }} 
                  className="proforma-request-btn"
                  style={{ flex: 1 }}
                >
                  <Download size={16} />
                  <span>Örnek 4K BIM Paketini İndir (.ZIP)</span>
                </button>
              </div>

              {downloadedBim && (
                <div className="rfq-success-banner">
                  <Check size={16} />
                  <span>Örnek 4K PBR ve BIM kütüphanesi indiriliyor. İstediğiniz seramiğin detay sayfasından o ürüne özel 4K CAD dosyasını indirebilirsiniz.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: 85+ EXPORT COUNTRIES & REGIONAL HUBS MODAL */}
      {isCountriesModalOpen && (
        <div className="export-modal-overlay" onClick={() => setIsCountriesModalOpen(false)}>
          <div className="export-modal-card glass-panel" style={{ maxWidth: '780px' }} onClick={(e) => e.stopPropagation()}>
            <div className="export-modal-header">
              <div className="modal-title-box">
                <div className="modal-icon-gold">
                  <Globe size={22} />
                </div>
                <div>
                  <h3>🌍 85+ İhracat Ülkesi & Desteklenen Diller</h3>
                  <p>SeramikBak Global Ağının Hizmet Verdiği Bölgesel İhracat Limanları ve Diller</p>
                </div>
              </div>
              <button className="export-modal-close" onClick={() => setIsCountriesModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', margin: '14px 0', maxHeight: '50vh', overflowY: 'auto' }}>
              {exportCountriesList.map((country, idx) => (
                <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '10px 12px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.4rem' }}>{country.flag}</span>
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '0.82rem', color: '#f1f5f9' }}>{country.name}</div>
                    <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Liman: {country.port} | {country.lang}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <Link href="/marka" className="global-brand-join-btn">
                <Building2 size={15} />
                <span>Markanızı Bu İhracat Ağına Dahil Edin</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .global-export-hub-container {
          width: 100%;
          margin: 16px 0 24px 0;
        }

        .global-export-banner-card {
          background: linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.88) 100%);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(197, 160, 89, 0.35);
          border-top: 2px solid rgba(212, 175, 55, 0.5);
          border-radius: 20px;
          padding: 24px 28px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4), 0 0 60px rgba(179, 142, 71, 0.12);
          color: #ffffff;
          display: flex;
          flex-direction: column;
          gap: 18px;
          position: relative;
          overflow: hidden;
        }

        .global-banner-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 6px;
          max-width: 760px;
          margin: 0 auto;
        }

        .global-pill-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(197, 160, 89, 0.18);
          border: 1px solid rgba(197, 160, 89, 0.45);
          color: #fef08a;
          font-size: 0.68rem;
          font-weight: 800;
          padding: 4px 14px;
          border-radius: 20px;
          letter-spacing: 0.08em;
          box-shadow: 0 2px 10px rgba(179, 142, 71, 0.2);
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
          font-size: 1.35rem;
          font-weight: 900;
          line-height: 1.3;
          letter-spacing: -0.01em;
          margin: 0;
          color: #ffffff;
        }

        .global-banner-title span {
          background: linear-gradient(135deg, #d4af37 0%, #fef08a 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .global-banner-desc {
          font-size: 0.82rem;
          color: #e2e8f0;
          font-weight: 500;
          line-height: 1.5;
          margin: 0;
        }

        .global-pillars-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
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
            padding: 18px 14px;
          }
          .global-banner-title {
            font-size: 1.15rem;
          }
        }

        .global-pillar-card {
          background: rgba(255, 255, 255, 0.035);
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 14px;
          padding: 14px 14px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }

        .global-pillar-card.clickable {
          cursor: pointer;
        }

        .global-pillar-card:hover {
          background: rgba(255, 255, 255, 0.07);
          border-color: rgba(197, 160, 89, 0.5);
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(0, 0, 0, 0.35);
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
          font-size: 0.6rem;
          font-weight: 800;
          padding: 2px 7px;
          border-radius: 10px;
        }

        .pillar-action-badge.blue { background: rgba(2, 132, 199, 0.2); border-color: rgba(2, 132, 199, 0.4); color: #38bdf8; }
        .pillar-action-badge.emerald { background: rgba(16, 185, 129, 0.2); border-color: rgba(16, 185, 129, 0.4); color: #34d399; }
        .pillar-action-badge.purple { background: rgba(168, 85, 247, 0.2); border-color: rgba(168, 85, 247, 0.4); color: #c084fc; }

        .pillar-icon-box {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pillar-icon-box.gold { background: rgba(212, 175, 55, 0.15); color: #d4af37; }
        .pillar-icon-box.blue { background: rgba(2, 132, 199, 0.15); color: #38bdf8; }
        .pillar-icon-box.emerald { background: rgba(16, 185, 129, 0.15); color: #34d399; }
        .pillar-icon-box.purple { background: rgba(168, 85, 247, 0.15); color: #c084fc; }

        .global-pillar-card h3 {
          font-size: 0.85rem;
          font-weight: 800;
          margin: 0;
          color: #ffffff;
          line-height: 1.3;
        }

        .global-pillar-card p {
          font-size: 0.74rem;
          color: #cbd5e1;
          line-height: 1.45;
          margin: 0;
          flex: 1;
        }

        .pillar-trigger-btn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 10px;
          border-radius: 8px;
          font-size: 0.7rem;
          font-weight: 800;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-top: 2px;
        }

        .pillar-trigger-btn.gold { background: rgba(212, 175, 55, 0.2); color: #fef08a; border: 1px solid rgba(212, 175, 55, 0.4); }
        .pillar-trigger-btn.gold:hover { background: #d4af37; color: #0b0f17; }

        .pillar-trigger-btn.blue { background: rgba(2, 132, 199, 0.2); color: #38bdf8; border: 1px solid rgba(2, 132, 199, 0.4); }
        .pillar-trigger-btn.blue:hover { background: #0284c7; color: #ffffff; }

        .pillar-trigger-btn.emerald { background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.4); }
        .pillar-trigger-btn.emerald:hover { background: #10b981; color: #ffffff; }

        .pillar-trigger-btn.purple { background: rgba(168, 85, 247, 0.2); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.4); }
        .pillar-trigger-btn.purple:hover { background: #a855f7; color: #ffffff; }

        /* Integrated Mini Metrics & High-Contrast CTA Bar */
        .global-metrics-and-cta-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 14px;
          padding: 10px 16px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .global-metrics-mini {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .mini-metric {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 0.75rem;
          color: #e2e8f0;
          font-weight: 500;
        }

        .mini-metric strong {
          font-size: 1rem;
          color: #fef08a;
          font-weight: 900;
        }

        .mini-divider {
          width: 1px;
          height: 16px;
          background: rgba(255, 255, 255, 0.15);
        }

        @media (max-width: 640px) {
          .global-metrics-mini { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
          .mini-divider { display: none; }
        }

        .global-cta-buttons-mini {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .global-how-it-works-btn {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.25);
          color: #ffffff !important;
          padding: 8px 14px;
          border-radius: 9px;
          font-size: 0.76rem;
          font-weight: 800;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .global-how-it-works-btn:hover {
          background: rgba(255, 255, 255, 0.18);
          border-color: rgba(212, 175, 55, 0.6);
          color: #fef08a !important;
        }

        .global-brand-join-btn {
          background: linear-gradient(135deg, #d4af37 0%, #b38e47 100%);
          color: #0b0f17 !important;
          border: none;
          padding: 8px 16px;
          border-radius: 9px;
          font-size: 0.78rem;
          font-weight: 900;
          cursor: pointer;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 4px 16px rgba(212, 175, 55, 0.35);
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .global-brand-join-btn:hover {
          background: linear-gradient(135deg, #fef08a 0%, #d4af37 100%);
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(212, 175, 55, 0.5);
        }

        /* EXPORT CALCULATOR & MODAL STYLES */
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

        .how-it-works-steps-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin: 10px 0;
        }

        .how-step-card {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 14px;
          padding: 14px 16px;
        }

        .how-step-card.highlight {
          background: rgba(212, 175, 55, 0.08);
          border: 1px solid rgba(212, 175, 55, 0.3);
        }

        .step-num-badge {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
          font-size: 0.9rem;
          font-weight: 900;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .step-num-badge.gold {
          background: linear-gradient(135deg, #d4af37 0%, #b38e47 100%);
          color: #0b0f17;
        }

        .how-step-card h4 {
          font-size: 0.9rem;
          font-weight: 800;
          color: #f8fafc;
          margin: 0 0 4px 0;
        }

        .how-step-card p {
          font-size: 0.78rem;
          color: #94a3b8;
          line-height: 1.5;
          margin: 0;
        }
      `}</style>
    </div>
  );
}
