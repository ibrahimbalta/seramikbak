'use client';

import React from 'react';
import Link from 'next/link';
import { Globe, Ship, Layers2, Sparkles, Building2, ShieldCheck, ArrowRight, FileCheck, CheckCircle2 } from 'lucide-react';

export default function GlobalExportHub() {
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
          <div className="global-pillar-card">
            <div className="pillar-icon-box gold">
              <Ship size={22} />
            </div>
            <h3>Konteyner Bazlı B2B İhracat Altyapısı</h3>
            <p>Fabrikadan doğrudan dünya limanlarına (Hamburg, Dubai, New York, Londra, Riyad) palet ve konteyner bazlı lojistik ve FOB/CIF fiyatlama altyapısı.</p>
            <div className="pillar-tag">FOB & CIF Export Ready</div>
          </div>

          <div className="global-pillar-card">
            <div className="pillar-icon-box blue">
              <Layers2 size={22} />
            </div>
            <h3>Global BIM / CAD Kütüphanesi</h3>
            <p>Uluslararası mimarlık ve iç mimarlık büroları için Revit (.rfa), AutoCAD (.dwg) ve dikişsiz 4K Seamless PBR doku paketleri.</p>
            <div className="pillar-tag">Architectural BIM Certified</div>
          </div>

          <div className="global-pillar-card">
            <div className="pillar-icon-box emerald">
              <Globe size={22} />
            </div>
            <h3>5 Dilde Dijital Showroom & SEO</h3>
            <p>Türkçe, İngilizce, Almanca, Arapça ve Rusça otomatik arama motoru indekslemesi ile Google Global ve Yandex'te üst sıralarda görünürlük.</p>
            <div className="pillar-tag">Multi-lingual Global Index</div>
          </div>

          <div className="global-pillar-card">
            <div className="pillar-icon-box purple">
              <Sparkles size={22} />
            </div>
            <h3>Web 3D & AR Canlı Deneyim Engine</h3>
            <p>Uygulama indirme zorunluluğu olmadan dünya genelindeki alıcılar ve mimarlar için tarayıcı üzerinden 360° mekan ve AR kaplama.</p>
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
        }

        .global-pillar-card:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(197, 160, 89, 0.4);
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
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

        @media (max-width: 640px) {
          .metric-divider { display: none; }
          .global-metrics-bar { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; text-align: center; }
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
      `}</style>
    </div>
  );
}
