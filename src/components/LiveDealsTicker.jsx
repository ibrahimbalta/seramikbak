'use client';

import Link from 'next/link';
import { Activity, ArrowUpRight, Flame, Sparkles } from 'lucide-react';

export default function LiveDealsTicker() {
  const deals = [
    { id: 1, brand: 'VitrA', name: 'Calacatta Gold 60x120', dealer: 'Kadıköy Bayi', discount: '%35 İndirim', price: '₺490 / m²', city: 'İstanbul' },
    { id: 2, brand: 'NG Kütahya', name: 'Albatros Antrasit 80x80', dealer: 'Çankaya Showroom', discount: '%40 İndirim', price: '₺420 / m²', city: 'Ankara' },
    { id: 3, brand: 'Qua Seramik', name: 'Pulpis Grey 60x120', dealer: 'Alsancak Konsept Store', discount: '%30 İndirim', price: '₺450 / m²', city: 'İzmir' },
    { id: 4, brand: 'Bien Seramik', name: 'Travertino 120x240 Plaka', dealer: 'Nilüfer Bayi', discount: '%45 İndirim', price: '₺890 / m²', city: 'Bursa' },
    { id: 5, brand: 'Kütahya Seramik', name: 'Verso Mermer 60x120', dealer: 'Akdeniz Showroom', discount: '%38 İndirim', price: '₺510 / m²', city: 'Antalya' },
    { id: 6, brand: 'Graniser', name: 'Beton Gri 60x60 Outlet', dealer: 'Gebze Stok Depo', discount: '%50 Fırsat', price: '₺290 / m²', city: 'Kocaeli' }
  ];

  // Double the array for seamless infinite looping (Borsa Ticker effect)
  const tickerDeals = [...deals, ...deals];

  return (
    <div className="live-ticker-container">
      {/* Fixed Left Live Badge */}
      <Link href="/outlet" className="live-badge-link" title="Tüm Outlet ve Stoklu İndirimleri Gör">
        <div className="live-badge-content">
          <span className="live-pulse-dot" />
          <span>CANLI FIRSAT RADARI</span>
        </div>
      </Link>

      {/* Infinite Smooth Scrolling Ticker Track */}
      <div className="ticker-viewport">
        <div className="ticker-track">
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

      {/* Fixed Right Social Proof Badge (Desktop Only) */}
      <div className="ticker-social-proof">
        <Activity size={14} style={{ color: '#38bdf8' }} />
        <span>Bugün <strong>1,420 usta & mimar</strong> bayilerden fiyat topladı</span>
      </div>

      <style jsx>{`
        .live-ticker-container {
          background: linear-gradient(90deg, #070a12 0%, #0f172a 50%, #070a12 100%);
          border-top: 1px solid rgba(212, 175, 55, 0.3);
          border-bottom: 1px solid rgba(212, 175, 55, 0.3);
          padding: 10px 16px;
          margin: 20px 0;
          display: flex;
          align-items: center;
          gap: 16px;
          overflow: hidden;
          position: relative;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }

        :global(a.live-badge-link) {
          text-decoration: none !important;
          flex-shrink: 0;
          z-index: 2;
        }

        .live-badge-content {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          border-radius: 20px;
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.45);
          color: #f87171;
          font-size: 0.76rem;
          font-weight: 800;
          white-space: nowrap;
          box-shadow: 0 0 14px rgba(239, 68, 68, 0.25);
          transition: transform 0.2s ease, background 0.2s ease;
        }

        .live-badge-content:hover {
          transform: scale(1.03);
          background: rgba(239, 68, 68, 0.25);
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

        .ticker-viewport {
          flex: 1;
          overflow: hidden;
          position: relative;
          mask-image: linear-gradient(to right, transparent, black 4%, black 96%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 4%, black 96%, transparent);
        }

        .ticker-track {
          display: flex;
          align-items: center;
          gap: 16px;
          width: max-content;
          animation: tickerSlide 28s linear infinite;
        }

        .ticker-track:hover {
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
          background: rgba(255, 255, 255, 0.05) !important;
          padding: 6px 14px !important;
          border-radius: 12px !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          font-size: 0.8rem !important;
          white-space: nowrap !important;
          text-decoration: none !important;
          color: inherit !important;
          transition: all 0.2s ease !important;
          flex-shrink: 0 !important;
        }

        :global(a.ticker-deal-card:hover) {
          background: rgba(212, 175, 55, 0.15) !important;
          border-color: rgba(212, 175, 55, 0.4) !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 4px 12px rgba(212, 175, 55, 0.15) !important;
        }

        .deal-brand {
          font-weight: 800;
          color: #ffd700;
        }

        .deal-name {
          color: #f8fafc;
          font-weight: 600;
        }

        .deal-discount {
          padding: 2px 7px;
          border-radius: 6px;
          background: rgba(34, 197, 94, 0.18);
          border: 1px solid rgba(34, 197, 94, 0.3);
          color: #4ade80;
          font-weight: 800;
          font-size: 0.74rem;
        }

        .deal-price {
          font-weight: 900;
          color: #ffffff;
        }

        .deal-dealer {
          color: #94a3b8;
          font-size: 0.75rem;
        }

        :global(.deal-arrow) {
          color: #ffd700;
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
          font-size: 0.76rem;
          color: #cbd5e1;
          white-space: nowrap;
          border-left: 1px solid rgba(255, 255, 255, 0.12);
          padding-left: 14px;
          flex-shrink: 0;
        }

        @media (max-width: 960px) {
          .ticker-social-proof {
            display: none;
          }
          .live-ticker-container {
            padding: 8px 12px;
            margin: 14px 0;
            gap: 10px;
          }
        }
      `}</style>
    </div>
  );
}
