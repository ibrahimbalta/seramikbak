'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Activity, ArrowUpRight, Flame, ShoppingBag, Truck, FileCode, Tag } from 'lucide-react';

export default function LiveDealsTicker() {
  const [events, setEvents] = useState([
    {
      id: 1,
      badge: 'TEKLİF TALEBİ',
      color: '#60a5fa',
      bg: 'rgba(59, 130, 246, 0.1)',
      border: 'rgba(59, 130, 246, 0.3)',
      time: '2 dk önce',
      location: 'İzmir / Karşıyaka',
      text: 'Bir müşteri 60x120 Mermer Serisi için 3 bayiden teklif istedi',
      link: '/teklif-al'
    },
    {
      id: 2,
      badge: 'STOK İNDİRİMİ',
      color: '#fbbf24',
      bg: 'rgba(245, 158, 11, 0.1)',
      border: 'rgba(245, 158, 11, 0.3)',
      time: '4 dk önce',
      location: 'İstanbul / Kadıköy',
      text: 'VitrA Yetkili Bayisi 50 m² stok fazlası Calacatta porselende %35 indirim tanımladı',
      link: '/outlet'
    },
    {
      id: 3,
      badge: 'NUMUNE KARGO',
      color: '#34d399',
      bg: 'rgba(16, 185, 129, 0.1)',
      border: 'rgba(16, 185, 129, 0.3)',
      time: '5 dk önce',
      location: 'Ankara / Çankaya',
      text: 'Kütahya Seramik Bayisi adrese ücretsiz numune karo gönderimi başlattı',
      link: '/numune-talep'
    },
    {
      id: 4,
      badge: 'MİMARİ DOKU',
      color: '#c084fc',
      bg: 'rgba(168, 85, 247, 0.1)',
      border: 'rgba(168, 85, 247, 0.3)',
      time: '8 dk önce',
      location: 'Bursa / Nilüfer',
      text: 'Bir mimarlık ofisi otel projesi için DWG ve 3D doku ZIP paketini indirdi',
      link: '/mimar-portali'
    },
    {
      id: 5,
      badge: 'TEKLİF TALEBİ',
      color: '#60a5fa',
      bg: 'rgba(59, 130, 246, 0.1)',
      border: 'rgba(59, 130, 246, 0.3)',
      time: '12 dk önce',
      location: 'Antalya / Muratpaşa',
      text: 'Bien Seramik 120x240 Traverten Plaka için toplu metraj fiyatı sorgulandı',
      link: '/teklif-al'
    }
  ]);

  const [stats, setStats] = useState(null);

  // Fetch real live stats & marketplace events from API
  useEffect(() => {
    fetch('/api/stats/live-ticker')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setEvents(data.data);
        }
      })
      .catch((err) => {
        console.warn('LiveDealsTicker: live-ticker API fetch error', err);
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

  // Quadruple the events array for smooth infinite endless scrolling track
  const tickerItems = [...events, ...events, ...events, ...events];

  const getEventIcon = (badge) => {
    if (badge.includes('NUMUNE')) return <Truck size={12} />;
    if (badge.includes('TEKLİF')) return <ShoppingBag size={12} />;
    if (badge.includes('MİMARİ')) return <FileCode size={12} />;
    if (badge.includes('STOK') || badge.includes('FIRSAT')) return <Tag size={12} />;
    return <Flame size={12} />;
  };

  return (
    <div className="live-ticker-fullwidth-wrapper">
      <div className="live-ticker-bar">
        {/* Fixed Left Live Radar Badge */}
        <Link href="/outlet" className="live-badge-link" title="Canlı Pazaryeri Hareketleri">
          <div className="live-badge-content">
            <span className="live-pulse-dot" />
            <span>CANLI PAZARYERİ</span>
          </div>
        </Link>

        {/* Endless Moving Track Viewport */}
        <div className="live-ticker-viewport">
          <div className="live-ticker-track">
            {tickerItems.map((item, idx) => (
              <Link
                key={`${item.id}-${idx}`}
                href={item.link || '/outlet'}
                className="ticker-event-card"
                title={`${item.location} - ${item.text}`}
              >
                <span 
                  className="event-badge-tag"
                  style={{
                    color: item.color || '#fbbf24',
                    background: item.bg || 'rgba(245, 158, 11, 0.1)',
                    borderColor: item.border || 'rgba(245, 158, 11, 0.3)'
                  }}
                >
                  {getEventIcon(item.badge || '')}
                  {item.badge}
                </span>
                <span className="event-location">[{item.location}]</span>
                <span className="event-text">{item.text}</span>
                <span className="event-time">• {item.time}</span>
                <ArrowUpRight size={13} className="event-arrow" />
              </Link>
            ))}
          </div>
        </div>

        {/* Fixed Right Social Proof Badge */}
        <div className="ticker-social-proof">
          <Activity size={14} style={{ color: '#fbbf24' }} />
          {stats && stats.todayLogsCount > 0 ? (
            <span>Bugün <strong>{stats.todayLogsCount} canlı arama & teklif</strong> gerçekleşti</span>
          ) : stats && stats.outletCount > 0 ? (
            <span>Sistemde <strong>{stats.outletCount} aktif fırsat</strong> ve <strong>{stats.dealerCount} bayi</strong> canlı</span>
          ) : (
            <span>Türkiye Seramik Bayileri <strong>Canlı Pazar Akışı</strong></span>
          )}
        </div>
      </div>

      <style jsx>{`
        .live-ticker-fullwidth-wrapper {
          width: 100vw;
          position: relative;
          left: 50%;
          right: 50%;
          margin-left: -50vw;
          margin-right: -50vw;
          margin-top: 14px;
          margin-bottom: 20px;
          overflow: hidden;
          z-index: 90;
        }

        .live-ticker-bar {
          width: 100vw;
          background: linear-gradient(90deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
          border-top: 1px solid rgba(245, 158, 11, 0.25);
          border-bottom: 1px solid rgba(245, 158, 11, 0.25);
          padding: 8px 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          position: relative;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
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
          padding: 6px 13px;
          border-radius: 20px;
          background: rgba(245, 158, 11, 0.12);
          border: 1px solid rgba(245, 158, 11, 0.4);
          color: #fbbf24;
          font-size: 0.76rem;
          font-weight: 800;
          white-space: nowrap;
          box-shadow: 0 2px 10px rgba(245, 158, 11, 0.15);
          transition: transform 0.2s ease, background 0.2s ease;
        }

        .live-badge-content:hover {
          transform: scale(1.03);
          background: rgba(245, 158, 11, 0.2);
        }

        .live-pulse-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #fbbf24;
          display: inline-block;
          box-shadow: 0 0 8px #fbbf24;
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(251, 191, 36, 0.7);
          }
          70% {
            transform: scale(1);
            box-shadow: 0 0 0 6px rgba(251, 191, 36, 0);
          }
          100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(251, 191, 36, 0);
          }
        }

        .live-ticker-viewport {
          flex: 1;
          min-width: 0;
          overflow: hidden;
          position: relative;
          mask-image: linear-gradient(to right, transparent 0%, black 2%, black 98%, transparent 100%);
          -webkit-mask-image: linear-gradient(to right, transparent 0%, black 2%, black 98%, transparent 100%);
        }

        .live-ticker-track {
          display: flex;
          align-items: center;
          gap: 18px;
          width: max-content;
          animation: tickerSlide 70s linear infinite;
        }

        .live-ticker-track:hover {
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

        :global(a.ticker-event-card) {
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
          background: rgba(30, 41, 59, 0.8) !important;
          backdrop-filter: blur(8px) !important;
          padding: 6px 14px !important;
          border-radius: 12px !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          font-size: 0.80rem !important;
          white-space: nowrap !important;
          text-decoration: none !important;
          color: #f1f5f9 !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2) !important;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
          flex-shrink: 0 !important;
        }

        :global(a.ticker-event-card:hover) {
          background: rgba(30, 41, 59, 0.95) !important;
          border-color: rgba(245, 158, 11, 0.4) !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 4px 14px rgba(245, 158, 11, 0.2) !important;
        }

        .event-badge-tag {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 7px;
          border-radius: 6px;
          font-size: 0.66rem;
          font-weight: 800;
          letter-spacing: 0.04em;
          border: 1px solid transparent;
          text-transform: uppercase;
        }

        .event-location {
          color: #94a3b8;
          font-weight: 700;
          font-size: 0.76rem;
        }

        .event-text {
          color: #f8fafc;
          font-weight: 600;
        }

        .event-time {
          color: #64748b;
          font-size: 0.72rem;
          font-weight: 500;
        }

        :global(.event-arrow) {
          color: #fbbf24;
          opacity: 0.7;
          transition: transform 0.2s ease, opacity 0.2s ease;
        }

        :global(a.ticker-event-card:hover .event-arrow) {
          opacity: 1;
          transform: translate(2px, -2px);
        }

        .ticker-social-proof {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.78rem;
          color: #cbd5e1;
          white-space: nowrap;
          border-left: 1px solid rgba(255, 255, 255, 0.1);
          padding-left: 16px;
          flex-shrink: 0;
          z-index: 5;
        }

        .ticker-social-proof strong {
          color: #fbbf24;
          font-weight: 800;
        }

        @media (max-width: 960px) {
          .ticker-social-proof {
            display: none;
          }
          .live-ticker-bar {
            padding: 8px 12px;
            gap: 12px;
          }
        }
      `}</style>
    </div>
  );
}
