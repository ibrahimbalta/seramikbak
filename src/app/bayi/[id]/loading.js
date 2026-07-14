'use client';

import React from 'react';

export default function Loading() {
  return (
    <div className="loading-page-wrapper">
      <div className="loader-container">
        {/* Shimmering 3D Ceramic Tile Spinner */}
        <div className="ceramic-tile-spinner">
          <div className="tile-face face-front"></div>
          <div className="tile-face face-back"></div>
        </div>

        {/* Brand Name with Gold Text */}
        <h2 className="loader-brand-name">
          <span>Seramik</span>
          <span className="gold-text">Bak</span>
        </h2>

        {/* Progress Line & Text */}
        <p className="loader-status-text">Showroom Yükleniyor...</p>
        <div className="loader-progress-bar">
          <div className="loader-progress-line"></div>
        </div>
      </div>

      <style jsx>{`
        .loading-page-wrapper {
          position: fixed;
          inset: 0;
          background: radial-gradient(circle at center, #0b0f19 0%, #02040a 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 99999;
          font-family: 'Outfit', system-ui, -apple-system, sans-serif;
        }

        .loader-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
        }

        .ceramic-tile-spinner {
          width: 64px;
          height: 64px;
          position: relative;
          transform-style: preserve-3d;
          animation: spin3DTile 2.5s infinite cubic-bezier(0.68, -0.55, 0.27, 1.55);
        }

        .tile-face {
          position: absolute;
          inset: 0;
          border-radius: 12px;
          border: 2px solid #b38e47;
          box-shadow: 0 0 25px rgba(179, 142, 71, 0.4);
        }

        .face-front {
          background: linear-gradient(135deg, rgba(179, 142, 71, 0.2) 0%, rgba(30, 41, 59, 0.9) 100%);
          transform: translateZ(2px);
        }

        .face-back {
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(179, 142, 71, 0.2) 100%);
          transform: rotateY(180deg) translateZ(2px);
        }

        @keyframes spin3DTile {
          0% { transform: rotateY(0deg) rotateX(0deg); }
          50% { transform: rotateY(180deg) rotateX(180deg); }
          100% { transform: rotateY(360deg) rotateX(360deg); }
        }

        .loader-brand-name {
          font-size: 2.2rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: #ffffff;
          display: flex;
          gap: 4px;
          margin: 0;
          text-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        }

        .loader-brand-name .gold-text {
          color: #b38e47;
          background: linear-gradient(135deg, #b38e47 0%, #a27e3c 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .loader-status-text {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.5);
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin: 0;
          animation: pulseText 1.5s infinite ease-in-out;
        }

        @keyframes pulseText {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }

        .loader-progress-bar {
          width: 160px;
          height: 3px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          overflow: hidden;
          position: relative;
        }

        .loader-progress-line {
          width: 60px;
          height: 100%;
          background: linear-gradient(90deg, transparent, #b38e47, transparent);
          position: absolute;
          animation: progressScroll 1.5s infinite linear;
        }

        @keyframes progressScroll {
          0% { left: -60px; }
          100% { left: 160px; }
        }
      `}</style>
    </div>
  );
}
