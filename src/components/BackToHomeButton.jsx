'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

/**
 * Standardized "Ana Sayfaya Dön" pill button used across portal login cards and subpages.
 */
export default function BackToHomeButton({
  variant = 'light',
  className = '',
  style = {},
  compactOnMobile = false,
}) {
  const isDark = variant === 'dark';

  return (
    <>
      <Link
        href="/"
        className={`sb-home-back-btn ${isDark ? 'sb-home-back-btn--dark' : 'sb-home-back-btn--light'} ${compactOnMobile ? 'sb-home-back-btn--compact' : ''} ${className}`.trim()}
        style={style}
      >
        <ArrowLeft size={14} style={{ flexShrink: 0 }} />
        <span className="sb-home-back-text-full">Ana Sayfaya Dön</span>
        {compactOnMobile && (
          <span className="sb-home-back-text-short">Ana Sayfa</span>
        )}
      </Link>

      <style jsx global>{`
        .sb-home-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          font-size: 0.82rem;
          font-weight: 600;
          padding: 6px 14px;
          border-radius: 10px;
          transition: all 0.2s;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .sb-home-back-btn--light {
          color: #475569;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
        }
        .sb-home-back-btn--light:hover {
          color: #b38e47;
          border-color: #cbd5e1;
        }
        .sb-home-back-btn--dark {
          color: #cbd5e1;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.14);
        }
        .sb-home-back-btn--dark:hover {
          color: #d4af37;
          border-color: rgba(212, 175, 55, 0.45);
        }
        .sb-home-back-text-short {
          display: none;
        }
        @media (max-width: 640px) {
          .sb-home-back-btn--compact {
            padding: 6px 10px;
            font-size: 0.78rem;
          }
          .sb-home-back-btn--compact .sb-home-back-text-full {
            display: none;
          }
          .sb-home-back-btn--compact .sb-home-back-text-short {
            display: inline;
          }
        }
      `}</style>
    </>
  );
}
