'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, ChevronDown, Sparkles, Navigation, PackageCheck, Store } from 'lucide-react';

const CITIES = [
  { city: 'İstanbul', district: 'Kadıköy', dealersCount: 4, samplesCount: 12 },
  { city: 'İstanbul', district: 'Beşiktaş', dealersCount: 3, samplesCount: 9 },
  { city: 'İstanbul', district: 'Ataşehir', dealersCount: 5, samplesCount: 14 },
  { city: 'Ankara', district: 'Çankaya', dealersCount: 6, samplesCount: 18 },
  { city: 'İzmir', district: 'Karşıyaka', dealersCount: 4, samplesCount: 11 },
  { city: 'İzmir', district: 'Alsancak', dealersCount: 3, samplesCount: 8 },
  { city: 'Bursa', district: 'Nilüfer', dealersCount: 4, samplesCount: 10 },
  { city: 'Antalya', district: 'Muratpaşa', dealersCount: 5, samplesCount: 15 },
  { city: 'Kocaeli', district: 'Izmit', dealersCount: 3, samplesCount: 7 },
  { city: 'Adana', district: 'Seyhan', dealersCount: 3, samplesCount: 6 }
];

export default function LocalDealerRadarBar({ onOpenSampleModal, onScrollToMap }) {
  const [selectedLoc, setSelectedLoc] = useState(CITIES[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);

  // Auto-detect location via Browser Geolocation API if available
  useEffect(() => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      setIsDetecting(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsDetecting(false);
          // Haversine or proximity check could go here; fallback keeps default Kadıköy or selects randomly
        },
        () => {
          setIsDetecting(false);
        },
        { timeout: 4000 }
      );
    }
  }, []);

  return (
    <div className="local-dealer-radar-wrapper">
      <div className="local-dealer-radar-card">
        {/* Left Section: Live Location Indicator & City Selector */}
        <div className="radar-left-group">
          <div className="radar-live-badge">
            <span className="radar-pulse-ring" />
            <MapPin size={15} className="radar-pin-icon" />
          </div>

          <div className="radar-location-selector-box">
            <span className="radar-label">LOKASYONUNUZ:</span>
            <div className="radar-dropdown-trigger" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              <strong>{selectedLoc.district} / {selectedLoc.city}</strong>
              <ChevronDown size={14} className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`} />
            </div>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="radar-dropdown-menu">
                <div className="dropdown-header">
                  <Navigation size={12} />
                  <span>Bölge Seçiniz:</span>
                </div>
                {CITIES.map((loc, idx) => (
                  <button
                    key={idx}
                    className={`dropdown-item ${loc.district === selectedLoc.district ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedLoc(loc);
                      setIsDropdownOpen(false);
                    }}
                  >
                    <span className="item-name">{loc.district} / {loc.city}</span>
                    <span className="item-stats">{loc.dealersCount} Bayi</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Middle Section: Dynamic Status Message & Stats */}
        <div className="radar-message-content">
          <p>
            <span className="loc-name">{selectedLoc.district} / {selectedLoc.city}</span> bölgesinde{' '}
            <strong className="accent-dealer"><Store size={13} className="inline-icon" /> {selectedLoc.dealersCount} Yetkili Bayi</strong> ve{' '}
            <strong className="accent-sample"><PackageCheck size={13} className="inline-icon" /> {selectedLoc.samplesCount} Aktif Numune Stoğu</strong> var.
          </p>
        </div>

        {/* Right Section: Quick Action Buttons */}
        <div className="radar-actions-group">
          <button
            onClick={() => {
              if (onScrollToMap) onScrollToMap();
              else window.location.href = `/bayiler?city=${encodeURIComponent(selectedLoc.city)}`;
            }}
            className="radar-btn btn-view-dealers"
            title="Bölgenizdeki yetkili bayileri haritada görüntüleyin"
          >
            <MapPin size={14} />
            <span>Haritada Bayileri Gör</span>
          </button>

          <button
            onClick={() => {
              if (onOpenSampleModal) onOpenSampleModal();
              else window.location.href = '/numune-talep';
            }}
            className="radar-btn btn-request-sample"
            title="Adresinize 1-Tıkla ücretsiz numune karo isteyin"
          >
            <Sparkles size={14} />
            <span>Ücretsiz Numune İste</span>
          </button>
        </div>
      </div>

      <style jsx>{`
        .local-dealer-radar-wrapper {
          width: 100%;
          margin: 16px 0 20px 0;
          position: relative;
          z-index: 40;
        }

        .local-dealer-radar-card {
          width: 100%;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f172a 100%);
          border: 1px solid rgba(245, 158, 11, 0.4);
          border-radius: 16px;
          padding: 12px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.25), 0 0 24px rgba(245, 158, 11, 0.12);
          box-sizing: border-box;
          backdrop-filter: blur(12px);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .local-dealer-radar-card:hover {
          border-color: rgba(251, 191, 36, 0.7);
          box-shadow: 0 12px 35px rgba(15, 23, 42, 0.35), 0 0 30px rgba(245, 158, 11, 0.2);
        }

        .radar-left-group {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }

        .radar-live-badge {
          position: relative;
          width: 34px;
          height: 34px;
          border-radius: 10px;
          background: rgba(245, 158, 11, 0.15);
          border: 1px solid rgba(245, 158, 11, 0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fbbf24;
          flex-shrink: 0;
        }

        .radar-pulse-ring {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 10px;
          border: 2px solid rgba(245, 158, 11, 0.6);
          animation: pulseRing 2s infinite cubic-bezier(0.4, 0, 0.6, 1);
        }

        @keyframes pulseRing {
          0% {
            transform: scale(0.95);
            opacity: 0.8;
          }
          100% {
            transform: scale(1.35);
            opacity: 0;
          }
        }

        .radar-location-selector-box {
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .radar-label {
          font-size: 0.58rem;
          font-weight: 800;
          color: #94a3b8;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .radar-dropdown-trigger {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #ffffff;
          font-size: 0.90rem;
          cursor: pointer;
          user-select: none;
          padding: 2px 0;
        }

        .radar-dropdown-trigger strong {
          color: #fbbf24;
          font-weight: 800;
        }

        :global(.dropdown-arrow) {
          color: #94a3b8;
          transition: transform 0.2s ease;
        }

        :global(.dropdown-arrow.open) {
          transform: rotate(180deg);
          color: #fbbf24;
        }

        /* Dropdown Menu */
        .radar-dropdown-menu {
          position: absolute;
          top: 100%;
          left: 0;
          margin-top: 8px;
          width: 220px;
          background: #0f172a;
          border: 1px solid rgba(245, 158, 11, 0.4);
          border-radius: 12px;
          padding: 8px;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5);
          z-index: 100;
          max-height: 240px;
          overflow-y: auto;
        }

        .dropdown-header {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.65rem;
          font-weight: 700;
          color: #94a3b8;
          padding: 4px 8px 6px 8px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          margin-bottom: 4px;
        }

        .dropdown-item {
          width: 100%;
          background: transparent;
          border: none;
          color: #e2e8f0;
          font-size: 0.78rem;
          padding: 7px 10px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          transition: background 0.15s ease;
          text-align: left;
        }

        .dropdown-item:hover, .dropdown-item.active {
          background: rgba(245, 158, 11, 0.15);
          color: #fbbf24;
        }

        .item-stats {
          font-size: 0.68rem;
          color: #94a3b8;
          font-weight: 600;
        }

        /* Middle Message Content */
        .radar-message-content {
          flex: 1;
          color: #cbd5e1;
          font-size: 0.84rem;
          line-height: 1.35;
        }

        .radar-message-content p {
          margin: 0;
        }

        .loc-name {
          color: #ffffff;
          font-weight: 700;
        }

        .accent-dealer {
          color: #60a5fa;
          font-weight: 800;
        }

        .accent-sample {
          color: #34d399;
          font-weight: 800;
        }

        :global(.inline-icon) {
          vertical-align: -2px;
          margin-right: 2px;
        }

        /* Right Actions Group */
        .radar-actions-group {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }

        .radar-btn {
          padding: 8px 14px;
          border-radius: 10px;
          font-size: 0.78rem;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          white-space: nowrap;
          border: none;
        }

        .btn-view-dealers {
          background: linear-gradient(135deg, rgba(30, 58, 138, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%);
          border: 1px solid rgba(96, 165, 250, 0.4);
          color: #93c5fd;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .btn-view-dealers:hover {
          background: linear-gradient(135deg, rgba(30, 58, 138, 0.9) 0%, rgba(30, 41, 59, 0.95) 100%);
          border-color: rgba(96, 165, 250, 0.8);
          color: #ffffff;
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(59, 130, 246, 0.3);
        }

        .btn-request-sample {
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          color: #0f172a;
          box-shadow: 0 4px 14px rgba(245, 158, 11, 0.3);
        }

        .btn-request-sample:hover {
          background: linear-gradient(135deg, #fcd34d 0%, #fbbf24 100%);
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(245, 158, 11, 0.45);
        }

        @media (max-width: 900px) {
          .local-dealer-radar-card {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
            padding: 14px;
          }
          .radar-actions-group {
            width: 100%;
            display: grid;
            grid-template-columns: 1fr 1fr;
          }
          .radar-btn {
            justify-content: center;
          }
        }

        @media (max-width: 520px) {
          .radar-actions-group {
            grid-template-columns: 1fr;
            gap: 8px;
          }
        }
      `}</style>
    </div>
  );
}
