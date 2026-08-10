'use client';

import React, { useState, useRef, useEffect } from 'react';
import { DollarSign, ChevronDown } from 'lucide-react';

export const currencies = [
  { code: 'TRY', symbol: '₺', name: 'Türk Lirası', label: '₺ TRY', rate: 1.0 },
  { code: 'USD', symbol: '$', name: 'US Dollar', label: '$ USD', rate: 0.027 },
  { code: 'EUR', symbol: '€', name: 'Euro', label: '€ EUR', rate: 0.025 },
  { code: 'GBP', symbol: '£', name: 'British Pound', label: '£ GBP', rate: 0.021 },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal', label: '﷼ SAR', rate: 0.10 },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble', label: '₽ RUB', rate: 2.40 }
];

export default function CurrencySelector({ compact = false, onCurrencyChange }) {
  const [selectedCurrency, setSelectedCurrency] = useState(currencies[0]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const savedCurr = localStorage.getItem('seramikbak_currency');
    if (savedCurr) {
      const found = currencies.find(c => c.code === savedCurr);
      if (found) {
        setSelectedCurrency(found);
        if (onCurrencyChange) onCurrencyChange(found);
      }
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (curr) => {
    setSelectedCurrency(curr);
    localStorage.setItem('seramikbak_currency', curr.code);
    setIsOpen(false);
    if (onCurrencyChange) onCurrencyChange(curr);
  };

  return (
    <div ref={dropdownRef} className="currency-selector-wrapper" style={{ position: 'relative', display: 'inline-block' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="currency-trigger-btn"
        title="Döviz Cinsi Seçin / Select Currency"
      >
        <DollarSign size={compact ? 13 : 15} style={{ color: 'var(--accent-gold, #c5a059)' }} />
        <span>{selectedCurrency.label}</span>
        <ChevronDown size={12} style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
      </button>

      {isOpen && (
        <div className="currency-dropdown-menu">
          {currencies.map(curr => (
            <button
              key={curr.code}
              onClick={() => handleSelect(curr)}
              className={`currency-option-btn ${selectedCurrency.code === curr.code ? 'active' : ''}`}
            >
              <span>{curr.symbol} {curr.name}</span>
              <span className="currency-code">{curr.code}</span>
            </button>
          ))}
        </div>
      )}

      <style jsx>{`
        .currency-trigger-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 255, 255, 0.95);
          border: 1px solid #e2e8f0;
          padding: ${compact ? '5px 10px' : '7px 12px'};
          border-radius: 12px;
          font-size: ${compact ? '0.78rem' : '0.82rem'};
          font-weight: 700;
          color: #0f172a;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
        }
        .currency-trigger-btn:hover {
          border-color: #b38e47;
          background: #ffffff;
          box-shadow: 0 4px 14px rgba(179, 142, 71, 0.15);
        }
        .currency-dropdown-menu {
          position: absolute;
          top: calc(100% + 6px);
          right: 0;
          background: #ffffff;
          border: 1px solid rgba(226, 232, 240, 0.9);
          border-radius: 14px;
          box-shadow: 0 12px 32px rgba(15, 23, 42, 0.12);
          padding: 6px;
          min-width: 160px;
          z-index: 999;
          display: flex;
          flex-direction: column;
          gap: 2px;
          animation: currFadeIn 0.18s ease-out;
        }
        @keyframes currFadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .currency-option-btn {
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
        .currency-option-btn:hover {
          background: #f8fafc;
          color: #b38e47;
        }
        .currency-option-btn.active {
          background: rgba(179, 142, 71, 0.1);
          color: #987532;
          font-weight: 800;
        }
        .currency-code {
          font-size: 0.68rem;
          color: #94a3b8;
          font-weight: 700;
        }
      `}</style>
    </div>
  );
}
