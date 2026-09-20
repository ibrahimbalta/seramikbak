'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Activity, ArrowUpRight, Flame, ShoppingBag, Truck, FileCode, Tag } from 'lucide-react';

export default function LiveDealsTicker() {
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState(null);

  // Fetch real live stats & marketplace events from API
  useEffect(() => {
    fetch('/api/stats/live-ticker')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
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

  // Format ticker items: if real events exist, quadruple for smooth infinite loop; otherwise show live status
  const tickerItems = events.length > 0
    ? [...events, ...events, ...events, ...events]
    : [
        {
          id: 'real-status-1',
          badge: 'CANLI BİLGİ',
          time: 'Canlı',
          location: 'Türkiye',
          text: 'SeramikBak Fırsatlar: Aktif bayi teklifleri ve müşteri aramaları anlık takip edilmektedir',
          link: '/proje-talep'
        }
      ];

  const getEventIcon = (badge = '') => {
    if (badge.includes('NUMUNE')) return <Truck size={12} />;
    if (badge.includes('TEKLİF')) return <ShoppingBag size={12} />;
    if (badge.includes('MİMARİ')) return <FileCode size={12} />;
    if (badge.includes('STOK') || badge.includes('FIRSAT')) return <Tag size={12} />;
    return <Flame size={12} />;
  };

  const getBadgeStyle = (badge = '') => {
    if (badge.includes('TEKLİF')) {
      return { color: '#0284c7', background: '#f0f9ff', borderColor: '#bae6fd' };
    }
    if (badge.includes('MİMARİ')) {
      return { color: '#047857', background: '#ecfdf5', borderColor: '#a7f3d0' };
    }
    return { color: '#b45309', background: '#fef3c7', borderColor: '#fde68a' };
  };

  return (
    <div className="live-ticker-fullwidth-wrapper">
      <div className="live-ticker-bar">
        {/* Fixed Left Live Radar Badge */}
        <Link href="/outlet" className="live-badge-link" title="Fırsatlar">
          <div className="live-badge-content">
            <span className="live-pulse-dot" />
            <span>Fırsatlar</span>
          </div>
        </Link>

        {/* Endless Moving Track Viewport */}
        <div className="live-ticker-viewport">
          <div className="live-ticker-track">
            {tickerItems.map((item, idx) => {
              const bStyle = getBadgeStyle(item.badge || '');
              return (
                <Link
                  key={`${item.id}-${idx}`}
                  href={item.link || '/outlet'}
                  className="ticker-event-card"
                  title={`${item.location} - ${item.text}`}
                >
                  <span 
                    className="event-badge-tag"
                    style={{
                      color: bStyle.color,
                      background: bStyle.background,
                      borderColor: bStyle.borderColor
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
              );
            })}
          </div>
        </div>

        {/* Fixed Right Social Proof Badge */}
        <div className="ticker-social-proof">
          <Activity size={14} style={{ color: '#d97706' }} />
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
          background: #ffffff;
          border-top: 1px solid #e2e8f0;
          border-bottom: 1px solid #e2e8f0;
          padding: 8px 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          position: relative;
          box-shadow: 0 2px 10px rgba(15, 23, 42, 0.04);
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
          background: #fffbeb;
          border: 1px solid #fde68a;
          color: #b45309;
          font-size: 0.76rem;
          font-weight: 800;
          white-space: nowrap;
          box-shadow: 0 2px 8px rgba(217, 119, 6, 0.08);
          transition: transform 0.2s ease, background 0.2s ease, border-color 0.2s ease;
        }

        .live-badge-content:hover {
          transform: scale(1.03);
          background: #fef3c7;
          border-color: #f59e0b;
        }

        .live-pulse-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #d97706;
          display: inline-block;
          box-shadow: 0 0 6px rgba(217, 119, 6, 0.6);
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(217, 119, 6, 0.5);
          }
          70% {
            transform: scale(1);
            box-shadow: 0 0 0 6px rgba(217, 119, 6, 0);
          }
          100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(217, 119, 6, 0);
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
          animation: tickerSlide 180s linear infinite;
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
          background: #f8fafc !important;
          backdrop-filter: blur(8px) !important;
          padding: 6px 14px !important;
          border-radius: 12px !important;
          border: 1px solid #e2e8f0 !important;
          font-size: 0.80rem !important;
          white-space: nowrap !important;
          text-decoration: none !important;
          color: #1e293b !important;
          box-shadow: 0 1px 4px rgba(15, 23, 42, 0.04) !important;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
          flex-shrink: 0 !important;
        }

        :global(a.ticker-event-card:hover) {
          background: #ffffff !important;
          border-color: #b38e47 !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 4px 14px rgba(179, 142, 71, 0.15) !important;
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
          color: #64748b;
          font-weight: 700;
          font-size: 0.76rem;
        }

        .event-text {
          color: #1e293b;
          font-weight: 600;
        }

        .event-time {
          color: #94a3b8;
          font-size: 0.72rem;
          font-weight: 500;
        }

        :global(.event-arrow) {
          color: #d97706;
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
          color: #475569;
          white-space: nowrap;
          border-left: 1px solid #e2e8f0;
          padding-left: 16px;
          flex-shrink: 0;
          z-index: 5;
        }

        .ticker-social-proof strong {
          color: #b45309;
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
