'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, Building2, Home, MapPin, Calculator, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

const CITIES = [
  'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya', 'Gaziantep', 
  'Şanlıurfa', 'Kocaeli', 'Mersin', 'Diyarbakır', 'Hatay', 'Manisa', 'Kayseri', 'Samsun',
  'Balıkesir', 'Kahramanmaraş', 'Van', 'Aydın', 'Denizli', 'Sakarya', 'Tekirdağ', 'Muğla',
  'Eskişehir', 'Trabzon', 'Diğer (Tüm 81 İl)'
];

export default function FastQuoteHeroWidget() {
  const router = useRouter();
  const [tab, setTab] = useState('bireysel'); // 'bireysel' or 'kurumsal'
  const [city, setCity] = useState('İstanbul');
  const [quantity, setQuantity] = useState('85');
  const [usageType, setUsageType] = useState('Banyo & Zemin');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Build query params to pre-fill the tender page
    const params = new URLSearchParams({
      city,
      m2: quantity || '50',
      type: tab === 'kurumsal' ? 'Şantiye & Proje' : usageType,
      source: 'hero_fast_quote'
    });
    router.push(`/proje-talep?${params.toString()}`);
  };

  return (
    <div className="fast-quote-widget-card glass-panel" aria-label="Hızlı Fiyat Teklifi ve Metraj İhalesi">
      {/* Top Header Badge */}
      <div className="quote-widget-top-strip">
        <div className="quote-badge">
          <Zap size={13} className="quote-badge-icon" />
          <span>24 SAATTE EN İYİ FİYAT GARANTİSİ</span>
        </div>
        <span className="quote-fee-free">Komisyonsuz • Ücretsiz</span>
      </div>

      <div className="quote-widget-header">
        <h3 className="quote-widget-title">
          {tab === 'bireysel' ? 'Yetkili Bayilerden Fiyat Teklifi Al' : 'Müteahhit & Proje Metraj İhalesi'}
        </h3>
        <p className="quote-widget-desc">
          {tab === 'bireysel' 
            ? 'Metrajınızı belirtin; bölgenizdeki yetkili showroomlar 24 saat içinde en iyi iskontolu teklifi sunsun.'
            : 'Şantiye metrajınızı girin; seramik üretici fabrikaları ve bölge bayileri doğrudan fiyat yarıştırsın.'}
        </p>
      </div>

      {/* Segment Switcher: Bireysel vs Kurumsal Proje */}
      <div className="quote-tab-pills">
        <button
          type="button"
          className={`quote-tab-btn ${tab === 'bireysel' ? 'active' : ''}`}
          onClick={() => { setTab('bireysel'); setQuantity('85'); }}
        >
          <Home size={13} />
          <span>Ev / Banyo Yenileme</span>
        </button>
        <button
          type="button"
          className={`quote-tab-btn ${tab === 'kurumsal' ? 'active' : ''}`}
          onClick={() => { setTab('kurumsal'); setQuantity('1500'); }}
        >
          <Building2 size={13} />
          <span>Müteahhit / Şantiye İhalesi</span>
        </button>
      </div>

      {/* Form Fields */}
      <form onSubmit={handleSubmit} className="quote-widget-form">
        <div className="quote-form-row">
          {/* City Selection */}
          <div className="quote-input-group">
            <label>
              <MapPin size={12} />
              <span>Teslimat İli</span>
            </label>
            <select 
              value={city} 
              onChange={(e) => setCity(e.target.value)}
              className="quote-select"
            >
              {CITIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Quantity m² */}
          <div className="quote-input-group">
            <label>
              <Calculator size={12} />
              <span>Metraj (m²)</span>
            </label>
            <input 
              type="number" 
              min="5" 
              max="500000"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Örn: 100"
              className="quote-input"
              required
            />
          </div>
        </div>

        {/* Quick m² Selector Chips */}
        <div className="quick-m2-chips">
          {tab === 'bireysel' ? (
            <>
              <button type="button" onClick={() => setQuantity('35')} className={`chip ${quantity === '35' ? 'active' : ''}`}>35 m² (Küçük)</button>
              <button type="button" onClick={() => setQuantity('85')} className={`chip ${quantity === '85' ? 'active' : ''}`}>85 m² (Daire)</button>
              <button type="button" onClick={() => setQuantity('200')} className={`chip ${quantity === '200' ? 'active' : ''}`}>200 m² (Villa)</button>
            </>
          ) : (
            <>
              <button type="button" onClick={() => setQuantity('500')} className={`chip ${quantity === '500' ? 'active' : ''}`}>500 m²</button>
              <button type="button" onClick={() => setQuantity('2500')} className={`chip ${quantity === '2500' ? 'active' : ''}`}>2.500 m²</button>
              <button type="button" onClick={() => setQuantity('10000')} className={`chip ${quantity === '10000' ? 'active' : ''}`}>10.000+ m²</button>
            </>
          )}
        </div>

        {/* Action Button */}
        <button type="submit" className="quote-submit-btn">
          <span>{tab === 'bireysel' ? 'Showroom Tekliflerini Getir' : 'Fabrika İhale Masasını Başlat'}</span>
          <ArrowRight size={15} />
        </button>

        {/* Micro-Trust Signals Footer */}
        <div className="quote-micro-trust">
          <div className="trust-point">
            <CheckCircle2 size={11} className="check-green" />
            <span>81 İl Yetkili Bayi Ağı</span>
          </div>
          <div className="trust-point">
            <CheckCircle2 size={11} className="check-green" />
            <span>%100 Ücretsiz & Komisyonsuz</span>
          </div>
          <div className="trust-point">
            <ShieldCheck size={11} className="check-gold" />
            <span>KVKK Korumalı Güvenli Teklif</span>
          </div>
        </div>
      </form>

      <style jsx>{`
        .fast-quote-widget-card {
          background: rgba(10, 14, 23, 0.88);
          backdrop-filter: blur(14px);
          border: 1px solid rgba(212, 175, 55, 0.4);
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.35);
          display: flex;
          flex-direction: column;
          gap: 14px;
          color: #f8fafc;
          text-align: left;
        }
        .quote-widget-top-strip {
          display: flex;
          align-items: center;
          justifyContent: space-between;
          font-size: 0.68rem;
        }
        .quote-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: linear-gradient(135deg, rgba(212, 175, 55, 0.25) 0%, rgba(245, 158, 11, 0.25) 100%);
          border: 1px solid #d4af37;
          color: #fef08a;
          font-weight: 800;
          padding: 3px 8px;
          border-radius: 6px;
          letter-spacing: 0.03em;
        }
        .quote-badge-icon {
          color: #f59e0b;
        }
        .quote-fee-free {
          color: #94a3b8;
          font-weight: 600;
        }
        .quote-widget-title {
          font-size: 1.15rem;
          font-weight: 800;
          color: #ffffff;
          margin: 0 0 4px 0;
          line-height: 1.25;
        }
        .quote-widget-desc {
          font-size: 0.76rem;
          color: #cbd5e1;
          margin: 0;
          line-height: 1.4;
        }
        .quote-tab-pills {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
          background: rgba(255, 255, 255, 0.05);
          padding: 4px;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .quote-tab-btn {
          display: flex;
          align-items: center;
          justifyContent: center;
          gap: 6px;
          background: transparent;
          border: none;
          color: #94a3b8;
          font-size: 0.74rem;
          font-weight: 700;
          padding: 7px 10px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .quote-tab-btn.active {
          background: #d4af37;
          color: #0b0f19;
          box-shadow: 0 2px 8px rgba(212, 175, 55, 0.35);
        }
        .quote-widget-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .quote-form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .quote-input-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .quote-input-group label {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.70rem;
          color: #cbd5e1;
          font-weight: 600;
        }
        .quote-select, .quote-input {
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #ffffff;
          padding: 8px 10px;
          border-radius: 8px;
          font-size: 0.82rem;
          font-weight: 600;
          outline: none;
          transition: border-color 0.2s ease;
        }
        .quote-select:focus, .quote-input:focus {
          border-color: #d4af37;
        }
        .quick-m2-chips {
          display: flex;
          gap: 6px;
        }
        .chip {
          flex: 1;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #cbd5e1;
          font-size: 0.68rem;
          font-weight: 600;
          padding: 4px 6px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .chip:hover {
          background: rgba(255, 255, 255, 0.12);
          color: #ffffff;
        }
        .chip.active {
          border-color: #d4af37;
          color: #fef08a;
          background: rgba(212, 175, 55, 0.15);
        }
        .quote-submit-btn {
          background: linear-gradient(135deg, #d4af37 0%, #b38e47 100%);
          border: none;
          color: #0b0f19;
          font-size: 0.86rem;
          font-weight: 800;
          padding: 10px 16px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s ease;
          box-shadow: 0 4px 14px rgba(212, 175, 55, 0.4);
        }
        .quote-submit-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(212, 175, 55, 0.5);
          filter: brightness(1.05);
        }
        .quote-micro-trust {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.66rem;
          color: #94a3b8;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding-top: 8px;
          flex-wrap: wrap;
          gap: 6px;
        }
        .trust-point {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .check-green { color: #22c55e; }
        .check-gold { color: #d4af37; }

        @media (max-width: 640px) {
          .quote-form-row {
            grid-template-columns: 1fr;
          }
          .quote-micro-trust {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
}
