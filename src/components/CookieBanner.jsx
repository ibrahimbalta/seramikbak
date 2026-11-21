'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cookie } from 'lucide-react';
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
      <div className="cookie-banner-card">
        <div className="cookie-banner-content">
          <div className="cookie-banner-icon-box">
            <Cookie size={22} className="cookie-icon" />
          </div>
          
          <div className="cookie-banner-text">
            <h4>{(t('cookieTitle') && t('cookieTitle') !== 'cookieTitle') ? t('cookieTitle') : 'Çerez (Cookie) Kullanımı ve Gizliliğiniz'}</h4>
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
          animation: slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideUp {
          from {
            transform: translateY(30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .cookie-banner-card {
          background: rgba(255, 255, 255, 0.96);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 18px 22px;
          box-shadow: 0 18px 40px -8px rgba(15, 23, 42, 0.14), 0 4px 12px rgba(15, 23, 42, 0.05);
          color: #0f172a;
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
          background: #fffbeb;
          border: 1px solid #fde68a;
          padding: 10px;
          border-radius: 12px;
          color: #b38e47;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .cookie-banner-text h4 {
          font-size: 0.92rem;
          font-weight: 800;
          margin: 0 0 4px 0;
          color: #0f172a;
        }

        .cookie-banner-text p {
          font-size: 0.8rem;
          color: #475569;
          line-height: 1.5;
          margin: 0;
        }

        .cookie-link {
          color: #b38e47;
          text-decoration: underline;
          font-weight: 700;
        }

        .cookie-link:hover {
          color: #967434;
        }

        .cookie-banner-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
          border-top: 1px solid #f1f5f9;
          padding-top: 12px;
        }

        .cookie-btn-secondary {
          padding: 8px 14px;
          border-radius: 10px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          color: #475569;
          font-size: 0.78rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .cookie-btn-secondary:hover {
          background: #f1f5f9;
          color: #0f172a;
          border-color: #cbd5e1;
        }

        .cookie-btn-primary {
          padding: 8px 18px;
          border-radius: 10px;
          background: linear-gradient(135deg, #b38e47 0%, #c89d4c 100%);
          border: none;
          color: #ffffff;
          font-size: 0.78rem;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 2px 10px rgba(179, 142, 71, 0.24);
        }

        .cookie-btn-primary:hover {
          transform: translateY(-1px);
          filter: brightness(1.04);
          box-shadow: 0 6px 16px rgba(179, 142, 71, 0.34);
        }

        @media (max-width: 640px) {
          .cookie-banner-overlay {
            bottom: 84px;
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
