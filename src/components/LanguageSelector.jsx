'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/lib/languageContext';
import { Globe, ChevronDown } from 'lucide-react';

const languages = [
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷', label: 'TR' },
  { code: 'en', name: 'English', flag: '🇬🇧', label: 'EN' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', label: 'DE' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', label: 'AR' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺', label: 'RU' }
];

export default function LanguageSelector({ compact = false }) {
  const { lang, setLang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLangObj = languages.find(l => l.code === lang) || languages[0];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="language-selector-wrapper" style={{ position: 'relative', display: 'inline-block' }}>
      <style jsx>{`
        .lang-trigger-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 255, 255, 0.95);
          border: 1px solid #e2e8f0;
          padding: ${compact ? '5px 10px' : '7px 13px'};
          border-radius: 12px;
          font-size: ${compact ? '0.78rem' : '0.82rem'};
          font-weight: 700;
          color: #0f172a;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
        }
        .lang-trigger-btn:hover {
          border-color: #b38e47;
          background: #ffffff;
          box-shadow: 0 4px 14px rgba(179, 142, 71, 0.15);
        }
        .lang-dropdown-menu {
          position: absolute;
          top: calc(100% + 6px);
          right: 0;
          background: #ffffff;
          border: 1px solid rgba(226, 232, 240, 0.9);
          border-radius: 14px;
          box-shadow: 0 12px 32px rgba(15, 23, 42, 0.12);
          padding: 6px;
          min-width: 140px;
          z-index: 999;
          display: flex;
          flex-direction: column;
          gap: 2px;
          animation: langFadeIn 0.18s ease-out;
        }
        @keyframes langFadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .lang-option-btn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 8px 12px;
          border: none;
          background: transparent;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          color: #334155;
          cursor: pointer;
          transition: all 0.15s;
        }
        .lang-option-btn:hover {
          background: #f8fafc;
          color: #b38e47;
        }
        .lang-option-btn.active {
          background: rgba(179, 142, 71, 0.1);
          color: #987532;
          font-weight: 800;
        }
      `}</style>

      <button 
        type="button" 
        onClick={() => setIsOpen(!isOpen)} 
        className="lang-trigger-btn"
        aria-label="Select Language"
      >
        <span style={{ fontSize: '1rem', lineHeight: 1 }}>{currentLangObj.flag}</span>
        <span>{currentLangObj.label}</span>
        <ChevronDown size={13} style={{ color: '#64748b', transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'none' }} />
      </button>

      {isOpen && (
        <div className="lang-dropdown-menu">
          {languages.map(l => (
            <button
              key={l.code}
              type="button"
              onClick={() => {
                setLang(l.code);
                setIsOpen(false);
              }}
              className={`lang-option-btn ${lang === l.code ? 'active' : ''}`}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1rem' }}>{l.flag}</span>
                <span>{l.name}</span>
              </span>
              {lang === l.code && <span style={{ color: '#b38e47', fontWeight: '900', fontSize: '0.75rem' }}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
