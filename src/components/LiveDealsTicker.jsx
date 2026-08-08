'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Activity, ArrowUpRight } from 'lucide-react';

export default function LiveDealsTicker() {
  const [deals, setDeals] = useState([
    { id: 1, brand: 'VitrA', name: 'Calacatta Gold 60x120', dealer: 'Kadıköy Bayi', discount: '%35 İndirim', price: '₺490 / m²', city: 'İstanbul' },
    { id: 2, brand: 'NG Kütahya', name: 'Albatros Antrasit 80x80', dealer: 'Çankaya Showroom', discount: '%40 İndirim', price: '₺420 / m²', city: 'Ankara' },
    { id: 3, brand: 'Qua Seramik', name: 'Pulpis Grey 60x120', dealer: 'Alsancak Konsept Store', discount: '%30 İndirim', price: '₺450 / m²', city: 'İzmir' },
    { id: 4, brand: 'Bien Seramik', name: 'Travertino 120x240 Plaka', dealer: 'Nilüfer Bayi', discount: '%45 İndirim', price: '₺890 / m²', city: 'Bursa' },
    { id: 5, brand: 'Kütahya Seramik', name: 'Verso Mermer 60x120', dealer: 'Akdeniz Showroom', discount: '%38 İndirim', price: '₺510 / m²', city: 'Antalya' },
    { id: 6, brand: 'Graniser', name: 'Beton Gri 60x60 Outlet', dealer: 'Gebze Stok Depo', discount: '%50 Fırsat', price: '₺290 / m²', city: 'Kocaeli' }
  ]);

  const [stats, setStats] = useState(null);

  // Fetch real live outlet deals & system stats from API
  useEffect(() => {
    fetch('/api/outlet?limit=12')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          const formatted = data.data.map((item, idx) => ({
            id: item.id || idx,
            brand: item.brand?.name || item.badgeTag || 'Outlet',
            name: item.title || item.dimensions || 'Seramik Ürün',
            dealer: item.dealer?.name || 'Yetkili Bayi',
            discount: item.discountBadge || item.category || 'Outlet Fırsatı',
            price: item.pricePerM2 ? `₺${item.pricePerM2} / m²` : 'Özel Fiyat',
            city: item.dealer?.city || 'Türkiye'
          }));
          setDeals(formatted);
        }
      })
      .catch((err) => {
        console.warn('LiveDealsTicker: using default deals list', err);
      });

    fetch('/api/stats/ticker')
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && resData.data) {
          setStats(resData.data);
        }
      })
      .catch((err) => {
        console.warn('LiveDealsTicker: stats fetch error', err);
      });
  }, []);

  // Quadruple the deals array for an unbroken, 100% seamless infinite loop across wide screens
  const tickerDeals = [...deals, ...deals, ...deals, ...deals];

  return (
    <div className="outlet-radar-fullwidth-wrapper">
      <div className="outlet-radar-ticker-bar">
        {/* Fixed Left Live Badge */}
        <Link href="/outlet" className="live-badge-link" title="Tüm Outlet ve Stoklu İndirimleri Gör">
          <div className="live-badge-content">
            <span className="live-pulse-dot" />
            <span>Outlet</span>
          </div>
        </Link>

        {/* Viewport with min-width: 0 & Endless Ticker Track */}
        <div className="outlet-radar-viewport">
          <div className="outlet-radar-track">
            {tickerDeals.map((deal, idx) => (
              <Link
                key={`${deal.id}-${idx}`}
                href="/outlet"
                className="ticker-deal-card"
                title={`${deal.brand} ${deal.name} - Outlet İlanına Git`}
              >
                <span className="deal-brand">[{deal.brand}]</span>
                <span className="deal-name">{deal.name}</span>
                <span className="deal-discount">{deal.discount}</span>
                <span className="deal-price">{deal.price}</span>
                <span className="deal-dealer">• {deal.dealer} ({deal.city})</span>
                <ArrowUpRight size={13} className="deal-arrow" />
              </Link>
            ))}
          </div>
        </div>

        {/* Fixed Right Social Proof (Desktop Only - 100% Real Live Database Metrics) */}
        <div className="ticker-social-proof">
          <Activity size={14} style={{ color: '#0284c7' }} />
          {stats && stats.outletCount > 0 ? (
            <span>Sistemde <strong>{stats.outletCount} aktif outlet fırsatı</strong> ve <strong>{stats.dealerCount} bayi</strong> yayında</span>
          ) : stats && stats.todayLogsCount > 0 ? (
            <span>Bugün <strong>{stats.todayLogsCount} canlı arama & teklif</strong> kaydedildi</span>
          ) : (
            <span>Canlı Türkiye <strong>Bayi & Stok Fırsatları</strong> Radarı</span>
          )}
        </div>
      </div>

      <style jsx>{`
        /* Full-Bleed 100vw Breakout Wrapper: Spans 100% full screen width edge-to-edge */
        .outlet-radar-fullwidth-wrapper {
          width: 100vw;
          position: relative;
          left: 50%;
          right: 50%;
          margin-left: -50vw;
          margin-right: -50vw;
          margin-top: 14px;
          margin-bottom: 20px;
          overflow: hidden;
          z-index: 100;
        }

        /* Soft Warm Light Luxury Glass Styling - Harmonious with Page Header */
        .outlet-radar-ticker-bar {
          width: 100vw;
          background: linear-gradient(90deg, #fbf9f5 0%, #ffffff 50%, #fbf9f5 100%);
          border-top: 1px solid rgba(179, 142, 71, 0.18);
          border-bottom: 1px solid rgba(179, 142, 71, 0.18);
          padding: 10px 24px;
          display: flex;
          align-items: center;
          gap: 20px;
          position: relative;
          box-shadow: 0 4px 20px rgba(15, 23, 42, 0.03);
          box-sizing: border-box;
          overflow: hidden;
        }

        :global(a.live-badge-link) {
          text-decoration: none !important;
          flex-shrink: 0;
          z-index: 5;
        }

        .live-badge-content {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          border-radius: 20px;
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.28);
          color: #dc2626;
          font-size: 0.78rem;
          font-weight: 800;
          white-space: nowrap;
          box-shadow: 0 2px 8px rgba(239, 68, 68, 0.1);
          transition: transform 0.2s ease, background 0.2s ease;
        }

        .live-badge-content:hover {
          transform: scale(1.03);
          background: rgba(239, 68, 68, 0.14);
        }

        .live-pulse-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #ef4444;
          display: inline-block;
          box-shadow: 0 0 8px #ef4444;
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
          }
          70% {
            transform: scale(1);
            box-shadow: 0 0 0 6px rgba(239, 68, 68, 0);
          }
          100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
          }
        }

        /* Viewport MUST have min-width: 0 to prevent flexbox item collapsing */
        .outlet-radar-viewport {
          flex: 1;
          min-width: 0;
          overflow: hidden;
          position: relative;
          mask-image: linear-gradient(to right, transparent 0%, black 2%, black 98%, transparent 100%);
          -webkit-mask-image: linear-gradient(to right, transparent 0%, black 2%, black 98%, transparent 100%);
        }

        .outlet-radar-track {
          display: flex;
          align-items: center;
          gap: 20px;
          width: max-content;
          animation: tickerSlide 75s linear infinite;
        }

        .outlet-radar-track:hover {
          animation-play-state: paused;
        }

        @keyframes tickerSlide {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        :global(a.ticker-deal-card) {
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
          background: #ffffff !important;
          padding: 7px 16px !important;
          border-radius: 12px !important;
          border: 1px solid rgba(0, 0, 0, 0.07) !important;
          font-size: 0.82rem !important;
          white-space: nowrap !important;
          text-decoration: none !important;
          color: #1e293b !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02) !important;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
          flex-shrink: 0 !important;
        }

        :global(a.ticker-deal-card:hover) {
          background: #ffffff !important;
          border-color: rgba(179, 142, 71, 0.35) !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 4px 14px rgba(179, 142, 71, 0.12) !important;
        }

        .deal-brand {
          font-weight: 800;
          color: #b38e47;
        }

        .deal-name {
          color: #1e293b;
          font-weight: 600;
        }

        .deal-discount {
          padding: 2px 7px;
          border-radius: 6px;
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.25);
          color: #059669;
          font-weight: 800;
          font-size: 0.74rem;
        }

        .deal-price {
          font-weight: 900;
          color: #0f172a;
        }

        .deal-dealer {
          color: #334155;
          font-weight: 600;
          font-size: 0.76rem;
        }

        :global(.deal-arrow) {
          color: #b38e47;
          opacity: 0.7;
          transition: transform 0.2s ease, opacity 0.2s ease;
        }

        :global(a.ticker-deal-card:hover .deal-arrow) {
          opacity: 1;
          transform: translate(2px, -2px);
        }

        .ticker-social-proof {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.78rem;
          color: #475569;
          white-space: nowrap;
          border-left: 1px solid rgba(0, 0, 0, 0.08);
          padding-left: 16px;
          flex-shrink: 0;
          z-index: 5;
        }

        .ticker-social-proof strong {
          color: #0f172a;
        }

        @media (max-width: 960px) {
          .ticker-social-proof {
            display: none;
          }
          .outlet-radar-ticker-bar {
            padding: 8px 12px;
            gap: 12px;
          }
        }
      `}</style>
    </div>
  );
}
