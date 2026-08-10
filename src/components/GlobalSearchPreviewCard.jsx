'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Globe, Building2, Search, CheckCircle2, ArrowRight, Sparkles, Layers, TrendingUp, ShieldCheck, Download, Zap } from 'lucide-react';

const marketScenarios = [
  {
    id: 'eu',
    region: 'Avrupa',
    subRegion: 'Almanya • İngiltere • Fransa',
    flags: '🇩🇪 🇬🇧 🇫🇷',
    searchVolume: '8.450+',
    searchUnit: 'Aylık Mimar Araması',
    topQuery: 'marmor optik keramik 60x120 b2b import',
    bimDownloads: '1.840+',
    bimUnit: 'Revit / CAD Şartnamesi',
    leadStatus: 'Google DE & UK 1. Sıra'
  },
  {
    id: 'gulf',
    region: 'Körfez Bölgesi',
    subRegion: 'Dubai • S. Arabistan • Katar',
    flags: '🇦🇪 🇸🇦 🇶🇦',
    searchVolume: '6.200+',
    searchUnit: 'Aylık Şartname Araması',
    topQuery: 'large format porcelain slab luxury hotel spec',
    bimDownloads: '1.420+',
    bimUnit: 'BIM Proje Dosyası',
    leadStatus: 'Google Arabia Top Rank'
  },
  {
    id: 'us',
    region: 'Kuzey Amerika',
    subRegion: 'ABD • Kanada',
    flags: '🇺🇸 🇨🇦',
    searchVolume: '4.800+',
    searchUnit: 'Aylık B2B Distribütör',
    topQuery: 'porcelain tiles manufacturer direct supplier',
    bimDownloads: '960+',
    bimUnit: '4K PBR Doku Paketi',
    leadStatus: 'Google US Rich Snippet'
  }
];

export default function GlobalSearchPreviewCard({ onOpenStudio }) {
  const [activeMarket, setActiveMarket] = useState(0);
  const [collectionCount, setCollectionCount] = useState(10);
  const [liveDbStats, setLiveDbStats] = useState(null);

  useEffect(() => {
    fetch('/api/stats/live')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.stats) {
          setLiveDbStats(data.stats);
        }
      })
      .catch(err => console.error('Live stats fetch error:', err));
  }, []);

  const scenario = marketScenarios[activeMarket];

  const realImpressions = liveDbStats ? (liveDbStats.analyticsCount + (collectionCount * 1450)).toLocaleString('tr-TR') : (collectionCount * 1450).toLocaleString('tr-TR');
  const realBimDownloads = liveDbStats ? (liveDbStats.leadCount * 12 + collectionCount * 320) : collectionCount * 320;

  return (
    <div className="luxury-search-preview-card">

      {/* Decorative Ambient Radial Glow */}
      <div className="card-ambient-glow" />

      {/* 1. Header Row */}
      <div className="card-top-bar">
        <div className="brand-pulse-badge">
          <span className="pulse-dot" />
          <span className="badge-text">GLOBAL İHRACAT & MARKA VİTRİNİ</span>
        </div>
        <div className="seo-live-pill">
          <Globe size={11} className="spin-slow" />
          <span>5 Dilde Canlı SEO</span>
        </div>
      </div>

      {/* 2. Main Title */}
      <h3 className="card-main-title">
        Koleksiyonlarınızı <span className="gold-gradient-text">Google Global'de İndeksliyor</span>, Mimarlık Şartnamelerine Ekliyoruz
      </h3>

      {/* 3. Luxury Segmented Market Switcher Tabs */}
      <div className="market-tabs-wrapper">
        {marketScenarios.map((m, idx) => (
          <button
            key={m.id}
            onClick={() => setActiveMarket(idx)}
            className={`market-tab-btn ${activeMarket === idx ? 'active' : ''}`}
          >
            <span className="tab-flags">{m.flags}</span>
            <span className="tab-label">{m.region}</span>
          </button>
        ))}
      </div>

      {/* 4. Glassmorphic Market Stats & Search Terminal */}
      <div className="market-preview-box">
        <div className="stats-grid-row">
          <div className="stat-glass-card gold-border">
            <div className="stat-card-header">
              <span className="stat-label">{scenario.searchUnit}</span>
              <TrendingUp size={13} className="gold-icon" />
            </div>
            <div className="stat-number gold-num">{scenario.searchVolume}</div>
          </div>

          <div className="stat-glass-card slate-border">
            <div className="stat-card-header">
              <span className="stat-label">{scenario.bimUnit}</span>
              <Layers size={13} className="slate-icon" />
            </div>
            <div className="stat-number slate-num">{scenario.bimDownloads}</div>
          </div>
        </div>

        {/* Live Search Terminal Strip */}
        <div className="search-terminal-strip">
          <div className="terminal-left">
            <Search size={12} className="terminal-search-icon" />
            <span className="terminal-prefix">Arama:</span>
            <span className="terminal-query">"{scenario.topQuery}"</span>
          </div>
          <span className="terminal-status-badge">
            <Zap size={10} /> {scenario.leadStatus}
          </span>
        </div>
      </div>

      {/* 5. 3 Bullet Core Value Highlights */}
      <div className="value-props-list">
        <div className="prop-item">
          <div className="prop-check-icon">
            <CheckCircle2 size={13} />
          </div>
          <span><strong>5 Dilde SEO:</strong> Google & Yandex aramalarında üst sırada indeksleme</span>
        </div>
        <div className="prop-item">
          <div className="prop-check-icon">
            <CheckCircle2 size={13} />
          </div>
          <span><strong>BIM & 4K CAD:</strong> Yurt dışı mimarlık ofisleri projelere ekler</span>
        </div>
        <div className="prop-item">
          <div className="prop-check-icon">
            <CheckCircle2 size={13} />
          </div>
          <span><strong>Doğrudan B2B:</strong> Komisyonsuz fabrika & mimarlık ekibi teması</span>
        </div>
      </div>

      {/* 6. Custom Gold Slider Calculator Panel */}
      <div className="calculator-panel">
        <div className="calc-top-row">
          <span className="calc-title">
            <Sparkles size={12} className="calc-sparkle" />
            Tahmini İhracat SEO Potansiyeli
          </span>
          <span className="calc-collection-badge">
            {collectionCount} Koleksiyon
          </span>
        </div>

        <div className="range-input-container">
          <input
            type="range"
            min="3"
            max="30"
            value={collectionCount}
            onChange={(e) => setCollectionCount(Number(e.target.value))}
            className="luxury-custom-slider"
          />
        </div>

        <div className="calc-results-row">
          <div className="calc-res-item">
            <span>Gösterim:</span>
            <strong>{realImpressions} Mimar/ay</strong>
          </div>
          <div className="calc-res-item align-right">
            <span>CAD İndirme:</span>
            <strong>{realBimDownloads} Proje</strong>
          </div>
        </div>
      </div>

      {/* 7. Metallic Gold CTA Button */}
      <Link href="/global-tanitim#brand-apply-form" className="luxury-cta-gold-btn">
        <Building2 size={15} />
        <span>Markanızı İhracat Ağına Ekleyin</span>
        <ArrowRight size={14} className="cta-arrow" />
      </Link>

      <style jsx>{`
        .luxury-search-preview-card {
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.98) 0%, rgba(253, 251, 247, 0.95) 100%);
          border-radius: 20px;
          padding: 16px 18px;
          border: 1px solid rgba(197, 160, 89, 0.4);
          border-top: 3px solid #b38e47;
          box-shadow: 0 20px 45px rgba(15, 23, 42, 0.08), 0 2px 12px rgba(179, 142, 71, 0.08);
          position: relative;
          overflow: hidden;
          color: #0f172a;
          display: flex;
          flex-direction: column;
          justifyContent: space-between;
          height: 100%;
          max-height: 430px;
          box-sizing: border-box;
          backdrop-filter: blur(10px);
        }

        .card-ambient-glow {
          position: absolute;
          top: -40px;
          right: -40px;
          width: 140px;
          height: 140px;
          background: radial-gradient(circle, rgba(212, 175, 55, 0.16) 0%, rgba(255, 255, 255, 0) 70%);
          pointer-events: none;
          border-radius: 50%;
        }

        .card-top-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 6px;
          border-bottom: 1px solid rgba(226, 232, 240, 0.8);
        }

        .brand-pulse-badge {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .pulse-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #16a34a;
          box-shadow: 0 0 8px #16a34a;
          animation: pulseGlow 2s infinite;
        }

        @keyframes pulseGlow {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.25); opacity: 0.7; }
        }

        .badge-text {
          font-size: 0.68rem;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: 0.03em;
        }

        .seo-live-pill {
          font-size: 0.65rem;
          color: #b38e47;
          font-weight: 800;
          background: linear-gradient(135deg, rgba(179, 142, 71, 0.12) 0%, rgba(212, 175, 55, 0.06) 100%);
          padding: 2px 9px;
          border-radius: 10px;
          border: 1px solid rgba(179, 142, 71, 0.3);
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .spin-slow {
          animation: spinSlow 12s linear infinite;
        }

        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .card-main-title {
          font-size: 0.96rem;
          font-weight: 900;
          color: #0f172a;
          line-height: 1.3;
          margin: 4px 0 6px 0;
          font-family: var(--font-title, "Outfit", sans-serif);
          letter-spacing: -0.01em;
        }

        .gold-gradient-text {
          background: linear-gradient(135deg, #b38e47 0%, #d4af37 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .market-tabs-wrapper {
          display: flex;
          gap: 4px;
          margin-bottom: 6px;
          background: rgba(241, 245, 249, 0.9);
          padding: 3px;
          border-radius: 12px;
          border: 1px solid rgba(226, 232, 240, 0.8);
        }

        .market-tab-btn {
          flex: 1;
          padding: 5px 6px;
          border-radius: 9px;
          font-size: 0.68rem;
          font-weight: 600;
          background: transparent;
          color: #64748b;
          border: none;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
        }

        .market-tab-btn:hover {
          color: #0f172a;
          background: rgba(255, 255, 255, 0.6);
        }

        .market-tab-btn.active {
          background: linear-gradient(135deg, #ffffff 0%, #fefcf7 100%);
          color: #0f172a;
          font-weight: 800;
          border: 1px solid rgba(197, 160, 89, 0.4);
          box-shadow: 0 2px 8px rgba(179, 142, 71, 0.15);
        }

        .tab-flags {
          font-size: 0.75rem;
        }

        .market-preview-box {
          background: #ffffff;
          border: 1px solid rgba(226, 232, 240, 0.9);
          border-radius: 12px;
          padding: 8px 10px;
          margin-bottom: 6px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
        }

        .stats-grid-row {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 6px;
          margin-bottom: 6px;
        }

        .stat-glass-card {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          padding: 6px 8px;
          border-radius: 8px;
          border: 1px solid #f1f5f9;
        }

        .stat-glass-card.gold-border {
          border-left: 2px solid #b38e47;
          background: linear-gradient(135deg, rgba(253, 251, 247, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%);
        }

        .stat-glass-card.slate-border {
          border-left: 2px solid #0f172a;
        }

        .stat-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .stat-label {
          font-size: 0.6rem;
          color: #64748b;
          font-weight: 600;
        }

        .gold-icon { color: #b38e47; }
        .slate-icon { color: #0f172a; }

        .stat-number {
          font-size: 0.85rem;
          font-weight: 900;
          margin-top: 1px;
        }

        .gold-num { color: #b38e47; }
        .slate-num { color: #0f172a; }

        .search-terminal-strip {
          background: #0f172a;
          color: #ffffff;
          border-radius: 8px;
          padding: 5px 8px;
          font-size: 0.67rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.3);
        }

        .terminal-left {
          display: flex;
          align-items: center;
          gap: 5px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .terminal-search-icon {
          color: #d4af37;
          flex-shrink: 0;
        }

        .terminal-prefix {
          color: #94a3b8;
          font-size: 0.6rem;
        }

        .terminal-query {
          font-weight: 700;
          color: #fef08a;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .terminal-status-badge {
          font-size: 0.6rem;
          color: #34d399;
          font-weight: 800;
          background: rgba(52, 211, 153, 0.15);
          padding: 2px 6px;
          border-radius: 6px;
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 3px;
          border: 1px solid rgba(52, 211, 153, 0.3);
        }

        .value-props-list {
          display: flex;
          flex-direction: column;
          gap: 3px;
          margin-bottom: 6px;
        }

        .prop-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.69rem;
          color: #334155;
        }

        .prop-check-icon {
          color: #16a34a;
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }

        .calculator-panel {
          background: linear-gradient(135deg, rgba(179, 142, 71, 0.08) 0%, rgba(212, 175, 55, 0.03) 100%);
          border: 1px solid rgba(179, 142, 71, 0.3);
          border-radius: 11px;
          padding: 6px 10px;
          margin-bottom: 6px;
        }

        .calc-top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 2px;
        }

        .calc-title {
          font-size: 0.68rem;
          font-weight: 800;
          color: #0f172a;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .calc-sparkle { color: #b38e47; }

        .calc-collection-badge {
          font-size: 0.65rem;
          font-weight: 800;
          color: #b38e47;
          background: #ffffff;
          padding: 1px 7px;
          border-radius: 8px;
          border: 1px solid rgba(179, 142, 71, 0.3);
        }

        .range-input-container {
          margin: 3px 0;
        }

        .luxury-custom-slider {
          width: 100%;
          height: 4px;
          border-radius: 4px;
          accent-color: #b38e47;
          cursor: pointer;
          background: rgba(179, 142, 71, 0.2);
        }

        .calc-results-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.64rem;
          color: #334155;
        }

        .calc-res-item strong {
          color: #0f172a;
          font-size: 0.7rem;
          margin-left: 2px;
        }

        .luxury-cta-gold-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          background: linear-gradient(135deg, #b38e47 0%, #d4af37 50%, #b38e47 100%);
          background-size: 200% auto;
          color: #0f172a;
          padding: 9px 14px;
          border-radius: 10px;
          font-size: 0.78rem;
          font-weight: 900;
          text-decoration: none;
          box-shadow: 0 4px 16px rgba(179, 142, 71, 0.35);
          transition: all 0.25s ease;
          text-align: center;
          border: none;
          cursor: pointer;
        }

        .luxury-cta-gold-btn:hover {
          background-position: right center;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(179, 142, 71, 0.5);
        }

        .cta-arrow {
          transition: transform 0.2s ease;
        }

        .luxury-cta-gold-btn:hover .cta-arrow {
          transform: translateX(3px);
        }
      `}</style>
    </div>
  );
}
