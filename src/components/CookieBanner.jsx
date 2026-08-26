'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, Cookie, X } from 'lucide-react';
import { useLanguage } from '@/lib/languageContext';

export default function CookieBanner() {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already given cookie consent
    const consent = localStorage.getItem('sb_cookie_consent');
    if (!consent) {
      // Show banner after a slight delay for smooth page load
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('sb_cookie_consent', 'accepted_all');
    localStorage.setItem('sb_cookie_consent_date', new Date().toISOString());
    setIsVisible(false);
  };

  const handleAcceptEssential = () => {
    localStorage.setItem('sb_cookie_consent', 'essential_only');
    localStorage.setItem('sb_cookie_consent_date', new Date().toISOString());
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="cookie-banner-overlay">
      <div className="cookie-banner-card glass-panel">
        <div className="cookie-banner-content">
          <div className="cookie-banner-icon-box">
            <Cookie size={24} className="cookie-icon" />
          </div>
          
          <div className="cookie-banner-text">
            <h4>{t('cookieTitle') || 'Çerez (Cookie) Kullanımı ve Gizliliğiniz'}</h4>
            <p>
              SeramikBak olarak deneyiminizi iyileştirmek, Web 3D stüdyo tercihlerini hatırlamak ve anonim site trafiğini analiz etmek amacıyla çerezler kullanmaktayız. 
              Detaylı bilgi için <Link href="/yasal#cerez" className="cookie-link">Çerez Politikamız</Link> ve <Link href="/yasal#kvkk" className="cookie-link">KVKK Aydınlatma Metnimizi</Link> inceleyebilirsiniz.
            </p>
          </div>
        </div>

        <div className="cookie-banner-actions">
          <button 
            type="button" 
            onClick={handleAcceptEssential}
            className="cookie-btn-secondary"
          >
            Sadece Zorunlu Çerezler
          </button>
          <button 
            type="button" 
            onClick={handleAcceptAll}
            className="cookie-btn-primary"
          >
            Tümünü Kabul Et
          </button>
        </div>
      </div>

      <style jsx>{`
        .cookie-banner-overlay {
          position: fixed;
          bottom: 20px;
          left: 20px;
          right: 20px;
          max-width: 680px;
          margin: 0 auto;
          z-index: 99999;
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideUp {
          from {
            transform: translateY(100px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .cookie-banner-card {
          background: rgba(15, 23, 42, 0.92);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(212, 175, 55, 0.3);
          border-radius: 16px;
          padding: 18px 22px;
          box-shadow: 0 20px 48px rgba(0, 0, 0, 0.4), 0 0 24px rgba(212, 175, 55, 0.1);
          color: #f8fafc;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .cookie-banner-content {
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }

        .cookie-banner-icon-box {
          background: rgba(212, 175, 55, 0.14);
          border: 1px solid rgba(212, 175, 55, 0.3);
          padding: 10px;
          border-radius: 12px;
          color: #d4af37;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .cookie-banner-text h4 {
          font-size: 0.95rem;
          font-weight: 800;
          margin: 0 0 4px 0;
          color: #ffffff;
        }

        .cookie-banner-text p {
          font-size: 0.8rem;
          color: #94a3b8;
          line-height: 1.45;
          margin: 0;
        }

        .cookie-link {
          color: #d4af37;
          text-decoration: underline;
          font-weight: 600;
        }

        .cookie-link:hover {
          color: #e5c158;
        }

        .cookie-banner-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
          border-top: 1px dashed rgba(255, 255, 255, 0.1);
          padding-top: 12px;
        }

        .cookie-btn-secondary {
          padding: 8px 14px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #cbd5e1;
          font-size: 0.78rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .cookie-btn-secondary:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
        }

        .cookie-btn-primary {
          padding: 8px 18px;
          border-radius: 10px;
          background: linear-gradient(135deg, #c5a059 0%, #d4af37 50%, #b38e47 100%);
          border: none;
          color: #0f172a;
          font-size: 0.78rem;
          font-weight: 900;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 14px rgba(212, 175, 55, 0.3);
        }

        .cookie-btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(212, 175, 55, 0.45);
        }

        @media (max-width: 640px) {
          .cookie-banner-overlay {
            bottom: 12px;
            left: 12px;
            right: 12px;
          }

          .cookie-banner-card {
            padding: 14px;
          }

          .cookie-banner-actions {
            flex-direction: column;
            width: 100%;
          }

          .cookie-btn-secondary, .cookie-btn-primary {
            width: 100%;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}
