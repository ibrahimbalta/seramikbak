'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Zap, Store, PackageCheck, Award, ArrowUpRight } from 'lucide-react';

const AUTHORIZED_BRANDS = [
  { name: 'VitrA', tag: 'Eczacıbaşı Yapı', slug: 'vitra', badge: 'Resmi Fabrika Ağı' },
  { name: 'Kütahya Seramik', tag: 'NG Kütahya', slug: 'kutahya-seramik', badge: 'Milli Sanayi Lideri' },
  { name: 'Çanakkale Seramik', tag: 'Kale Grubu', slug: 'canakkale-seramik', badge: 'Öncü Üretici' },
  { name: 'Bien Seramik', tag: 'Ercan Şirketler Grubu', slug: 'bien-seramik', badge: 'Tasarım Ödüllü' },
  { name: 'Ege Seramik', tag: 'İbrahim Polat Holding', slug: 'ege-seramik', badge: 'Global İhracatçı' },
  { name: 'Yurtbay Seramik', tag: 'Yurtbay Şirketler Grubu', slug: 'yurtbay-seramik', badge: 'Doğadan Sanata' },
  { name: 'Hitit Seramik', tag: 'Hitit Grubu', slug: 'hitit-seramik', badge: 'Endüstriyel Üretim' },
  { name: 'Qua Granite', tag: 'Allbatross Girişim', slug: 'qua-granite', badge: 'Teknik Granit' }
];

export default function BrandAuthorityStrip({ onBrandClick }) {
  return (
    <section className="brand-authority-section" aria-label="Resmi Üretici Fabrikalar ve Güven Ekosistemi">
      {/* Top Header Tag */}
      <div className="authority-header">
        <div className="authority-title-row">
          <div className="title-left">
            <Award size={18} className="gold-icon" />
            <h3>Türkiye'nin Lider Seramik Üreticileri & Resmi Dağıtım Ağı</h3>
          </div>
          <div className="title-right-badge">
            <span>T.C. Sanayi Standartlarında • Doğrulanmış Bayi Ekosistemi</span>
          </div>
        </div>
      </div>

      {/* Brands Grid / Logo Showcase */}
      <div className="brands-logo-grid">
        {AUTHORIZED_BRANDS.map((brand, idx) => (
          <div 
            key={idx}
            className="brand-corporate-card"
            onClick={() => onBrandClick ? onBrandClick(brand.name) : null}
            role="button"
            tabIndex={0}
          >
            <div className="brand-card-top">
              <span className="brand-corp-name">{brand.name}</span>
              <span className="brand-corp-badge">{brand.badge}</span>
            </div>
            <div className="brand-card-sub">
              <span>{brand.tag}</span>
              <ArrowUpRight size={13} className="brand-card-arrow" />
            </div>
          </div>
        ))}
      </div>

      {/* 4 Pillars of Institutional Trust */}
      <div className="trust-pillars-grid">
        <div className="trust-pillar-item">
          <div className="pillar-icon-box gold">
            <ShieldCheck size={22} />
          </div>
          <div className="pillar-content">
            <h4>%100 Orijinal 1. Kalite Fabrika Garantisi</h4>
            <p>Spot veya kaynağı belirsiz ürünlere sıfır tolerans. Yalnızca tescilli fabrika bandından çıkan 1. sınıf ürünler.</p>
          </div>
        </div>

        <div className="trust-pillar-item">
          <div className="pillar-icon-box emerald">
            <Zap size={22} />
          </div>
          <div className="pillar-content">
            <h4>24 Saatte Bağlayıcı Proje & Bayi Teklifi</h4>
            <p>Metrajınızı iletin, bölgenizdeki en yakın yetkili bayilerden ve fabrikadan en avantajlı iskontolu teklifi tek tıkla toplayın.</p>
          </div>
        </div>

        <div className="trust-pillar-item">
          <div className="pillar-icon-box blue">
            <Store size={22} />
          </div>
          <div className="pillar-content">
            <h4>81 İl Doğrulanmış Konsept Showroom Ağı</h4>
            <p>1.250+ yetkili teşhir mağazası, canlı stok haritası ve dokunmatik 3D Kiosk deneyimiyle yerinde inceleme imkanı.</p>
          </div>
        </div>

        <div className="trust-pillar-item">
          <div className="pillar-icon-box purple">
            <PackageCheck size={22} />
          </div>
          <div className="pillar-content">
            <h4>Adrese Teslim Mimari & Bireysel Numune Kutusu</h4>
            <p>Kararsız kaldığınız karo modellerinin kesit numunesini doğrudan ofisinize veya şantiyenize kargo ile ulaştırıyoruz.</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .brand-authority-section {
          max-width: 1440px;
          margin: 24px auto 16px auto;
          padding: 0 16px;
        }
        .authority-header {
          margin-bottom: 14px;
        }
        .authority-title-row {
          display: flex;
          align-items: center;
          justifyContent: space-between;
          flex-wrap: wrap;
          gap: 10px;
          border-bottom: 1px solid rgba(212, 175, 55, 0.25);
          padding-bottom: 10px;
        }
        .title-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .gold-icon {
          color: #d4af37;
        }
        .title-left h3 {
          font-size: 1.05rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
          letter-spacing: -0.01em;
        }
        :global(.dark) .title-left h3 {
          color: #f8fafc;
        }
        .title-right-badge {
          background: rgba(15, 23, 42, 0.05);
          border: 1px solid rgba(15, 23, 42, 0.12);
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 0.72rem;
          color: #64748b;
          font-weight: 600;
        }
        :global(.dark) .title-right-badge {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.12);
          color: #94a3b8;
        }
        .brands-logo-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-bottom: 20px;
        }
        .brand-corporate-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 10px 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        :global(.dark) .brand-corporate-card {
          background: #11141c;
          border-color: #1e2433;
        }
        .brand-corporate-card:hover {
          border-color: #d4af37;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
        }
        .brand-card-top {
          display: flex;
          align-items: center;
          justifyContent: space-between;
        }
        .brand-corp-name {
          font-weight: 800;
          font-size: 0.95rem;
          color: #0f172a;
        }
        :global(.dark) .brand-corp-name {
          color: #f1f5f9;
        }
        .brand-corp-badge {
          font-size: 0.65rem;
          font-weight: 700;
          background: rgba(212, 175, 55, 0.12);
          color: #b45309;
          padding: 2px 6px;
          border-radius: 4px;
        }
        :global(.dark) .brand-corp-badge {
          color: #fef08a;
          background: rgba(212, 175, 55, 0.2);
        }
        .brand-card-sub {
          display: flex;
          align-items: center;
          justifyContent: space-between;
          font-size: 0.72rem;
          color: #64748b;
        }
        .brand-card-arrow {
          color: #94a3b8;
          transition: all 0.2s ease;
        }
        .brand-corporate-card:hover .brand-card-arrow {
          color: #d4af37;
          transform: translate(2px, -2px);
        }

        .trust-pillars-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 16px;
        }
        :global(.dark) .trust-pillars-grid {
          background: linear-gradient(180deg, #0e121a 0%, #090c12 100%);
          border-color: #1e2433;
        }
        .trust-pillar-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }
        .pillar-icon-box {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justifyContent: center;
          flex-shrink: 0;
        }
        .pillar-icon-box.gold { background: rgba(212, 175, 55, 0.15); color: #d4af37; }
        .pillar-icon-box.emerald { background: rgba(34, 197, 94, 0.15); color: #22c55e; }
        .pillar-icon-box.blue { background: rgba(14, 165, 233, 0.15); color: #0284c7; }
        .pillar-icon-box.purple { background: rgba(168, 85, 247, 0.15); color: #a855f7; }
        
        .pillar-content h4 {
          font-size: 0.82rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 4px 0;
          line-height: 1.25;
        }
        :global(.dark) .pillar-content h4 {
          color: #f8fafc;
        }
        .pillar-content p {
          font-size: 0.72rem;
          color: #64748b;
          margin: 0;
          line-height: 1.4;
        }
        :global(.dark) .pillar-content p {
          color: #94a3b8;
        }

        @media (max-width: 1024px) {
          .brands-logo-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .trust-pillars-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }
        }
        @media (max-width: 640px) {
          .brands-logo-grid {
            grid-template-columns: 1fr;
          }
          .trust-pillars-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
