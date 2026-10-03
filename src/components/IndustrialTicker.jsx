'use client';

import React from 'react';
import Link from 'next/link';
import { Activity, ShieldCheck, TrendingUp, Building2, Layers, Sparkles } from 'lucide-react';

export default function IndustrialTicker() {
  return (
    <div className="industrial-ticker-wrap">
      <div className="industrial-ticker-inner">
        {/* Left Badge: Sector Status */}
        <div className="ticker-badge">
          <span className="live-indicator-dot" />
          <span className="ticker-badge-text">CANLI PİYASA & BORSA VERİLERİ</span>
        </div>

        {/* Marquee / Metrics Stream */}
        <div className="ticker-metrics-stream">
          <div className="metric-pill">
            <Layers size={13} className="pill-icon gold" />
            <span className="pill-label">Fabrika Kataloğu:</span>
            <span className="pill-val">25.400+ Onaylı Ürün</span>
          </div>

          <div className="ticker-separator">•</div>

          <div className="metric-pill">
            <Building2 size={13} className="pill-icon blue" />
            <span className="pill-label">Yetkili Showroom Ağı:</span>
            <span className="pill-val">81 İl • 1.250+ Nokta</span>
          </div>

          <div className="ticker-separator">•</div>

          <div className="metric-pill">
            <TrendingUp size={13} className="pill-icon emerald" />
            <span className="pill-label">Aktif Proje İhale Hacmi:</span>
            <span className="pill-val">₺18.4 Milyon (Metraj İhalesi Açık)</span>
          </div>

          <div className="ticker-separator">•</div>

          <div className="metric-pill">
            <ShieldCheck size={13} className="pill-icon gold" />
            <span className="pill-label">Standart:</span>
            <span className="pill-val">TMMOB & TSE Şartname Uyumlu</span>
          </div>

          <div className="ticker-separator">•</div>

          <div className="metric-pill">
            <Activity size={13} className="pill-icon emerald" />
            <span className="pill-label">B2B Stok Borsası:</span>
            <span className="pill-val">Anlık Takas Aktif</span>
          </div>
        </div>

        {/* Right Action: Quick Tender Link */}
        <div className="ticker-right-action">
          <Link href="/proje-talep" className="ticker-action-btn">
            <Sparkles size={12} />
            <span>Şantiye Metraj İhalesi Aç</span>
            <span className="ticker-btn-arrow">→</span>
          </Link>
        </div>
      </div>

      <style jsx>{`
        .industrial-ticker-wrap {
          background: #080a0f;
          border-bottom: 1px solid rgba(212, 175, 55, 0.25);
          color: #cbd5e1;
          font-size: 0.73rem;
          padding: 6px 16px;
          position: relative;
          z-index: 45;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .industrial-ticker-wrap::-webkit-scrollbar {
          display: none;
        }
        .industrial-ticker-inner {
          max-width: 1440px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justifyContent: space-between;
          gap: 16px;
          white-space: nowrap;
        }
        .ticker-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(212, 175, 55, 0.12);
          border: 1px solid rgba(212, 175, 55, 0.35);
          padding: 3px 8px;
          border-radius: 6px;
          color: #fef08a;
          font-weight: 800;
          font-size: 0.68rem;
          letter-spacing: 0.04em;
          flex-shrink: 0;
        }
        .live-indicator-dot {
          width: 7px;
          height: 7px;
          background: #22c55e;
          border-radius: 50%;
          display: inline-block;
          box-shadow: 0 0 8px #22c55e;
          animation: pulseGlow 1.8s infinite;
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.85); }
        }
        .ticker-metrics-stream {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .metric-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }
        .pill-label {
          color: #94a3b8;
          font-weight: 500;
        }
        .pill-val {
          color: #ffffff;
          font-weight: 700;
        }
        .pill-icon.gold { color: #d4af37; }
        .pill-icon.blue { color: #38bdf8; }
        .pill-icon.emerald { color: #34d399; }
        .ticker-separator {
          color: #475569;
          font-size: 0.8rem;
        }
        .ticker-right-action {
          flex-shrink: 0;
        }
        .ticker-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: linear-gradient(135deg, rgba(212, 175, 55, 0.25) 0%, rgba(180, 140, 40, 0.35) 100%);
          border: 1px solid rgba(212, 175, 55, 0.5);
          color: #fef08a;
          padding: 3px 10px;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 700;
          font-size: 0.70rem;
          transition: all 0.2s ease;
        }
        .ticker-action-btn:hover {
          background: #d4af37;
          color: #0b0f19;
          border-color: #d4af37;
        }
        .ticker-btn-arrow {
          font-size: 0.8rem;
          transition: transform 0.2s ease;
        }
        .ticker-action-btn:hover .ticker-btn-arrow {
          transform: translateX(2px);
        }
        @media (max-width: 900px) {
          .ticker-right-action {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
