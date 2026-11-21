'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  X,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Sparkles,
  CheckCircle,
  Clock,
  AlertCircle,
  Info,
  Crown,
  Eye,
  QrCode,
  Calculator,
  Calendar,
  TrendingUp,
  Layers,
  Filter
} from 'lucide-react';

/**
 * 1. PremiumButton
 * Unified button component with consistent heights, border radii (10px), and architectural bronze/gold/dark variants.
 */
export function PremiumButton({
  children,
  onClick,
  type = 'button',
  variant = 'gold', // 'gold' | 'dark' | 'outline' | 'ghost' | 'success' | 'danger'
  size = 'md', // 'sm' | 'md' | 'lg'
  icon,
  disabled = false,
  fullWidth = false,
  style = {},
  title = '',
  className = ''
}) {
  const sizeStyles = {
    sm: { height: '34px', padding: '0 12px', fontSize: '0.75rem', borderRadius: '8px', gap: '6px' },
    md: { height: '40px', padding: '0 16px', fontSize: '0.82rem', borderRadius: '10px', gap: '8px' },
    lg: { height: '46px', padding: '0 22px', fontSize: '0.88rem', borderRadius: '12px', gap: '8px' }
  }[size] || { height: '40px', padding: '0 16px', fontSize: '0.82rem', borderRadius: '10px', gap: '8px' };

  const variantStyles = {
    gold: {
      background: 'linear-gradient(135deg, #C5A04B 0%, #C5A04B 100%)',
      color: '#090d16',
      border: '1px solid rgba(212, 175, 55, 0.5)',
      boxShadow: '0 4px 14px rgba(179, 142, 71, 0.25)',
      fontWeight: 800
    },
    dark: {
      background: 'linear-gradient(135deg, var(--dp-text-primary, #202938) 0%, #1e293b 100%)',
      color: '#fde68a',
      border: '1.5px solid #C5A04B',
      boxShadow: '0 4px 12px rgba(15, 23, 42, 0.14)',
      fontWeight: 800
    },
    outline: {
      background: '#ffffff',
      color: 'var(--dp-text-primary, #202938)',
      border: '1.5px solid var(--dp-border, #E4E8EF)',
      boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
      fontWeight: 700
    },
    ghost: {
      background: 'rgba(15, 23, 42, 0.04)',
      color: '#334155',
      border: '1px solid transparent',
      boxShadow: 'none',
      fontWeight: 700
    },
    success: {
      background: 'linear-gradient(135deg, #10A37F 0%, #10A37F 100%)',
      color: '#ffffff',
      border: 'none',
      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.22)',
      fontWeight: 800
    },
    danger: {
      background: 'rgba(239, 68, 68, 0.08)',
      color: '#DC5353',
      border: '1px solid rgba(239, 68, 68, 0.25)',
      boxShadow: 'none',
      fontWeight: 700
    }
  }[variant] || {};

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`dealer-premium-btn ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: fullWidth ? '100%' : 'auto',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        fontFamily: 'var(--font-body, "Plus Jakarta Sans", sans-serif)',
        ...sizeStyles,
        ...variantStyles,
        ...style
      }}
    >
      {icon && <span style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}>{icon}</span>}
      <span>{children}</span>
    </button>
  );
}

/**
 * 2. StatusBadge
 * Standardized semantic status badge (Green: success/active, Orange: pending, Red: error/critical, Blue: info, Gold: pro)
 */
export function StatusBadge({ status, label, size = 'sm' }) {
  const normalized = String(status || '').toUpperCase();

  let config = {
    bg: 'rgba(37, 99, 235, 0.1)',
    color: '#2563eb',
    border: 'rgba(37, 99, 235, 0.25)',
    dot: '#2563eb',
    text: label || status || 'Bilgi'
  };

  if (['ACTIVE', 'COMPLETED', 'WON', 'IN_STOCK', 'APPROVED', 'SUCCESS'].includes(normalized)) {
    config = {
      bg: 'rgba(16, 185, 129, 0.12)',
      color: '#10A37F',
      border: 'rgba(16, 185, 129, 0.28)',
      dot: '#10A37F',
      text: label || (normalized === 'COMPLETED' || normalized === 'WON' ? 'Tamamlandı' : normalized === 'IN_STOCK' ? 'Stokta' : 'Aktif')
    };
  } else if (['PENDING', 'WAITING', 'PENDING_APPROVAL', 'LOW_STOCK'].includes(normalized)) {
    config = {
      bg: 'rgba(217, 119, 6, 0.12)',
      color: '#E9A23B',
      border: 'rgba(217, 119, 6, 0.28)',
      dot: '#f59e0b',
      text: label || 'Bekliyor'
    };
  } else if (['RESPONDED', 'VIEWED', 'INFO', 'DISPLAY_ONLY'].includes(normalized)) {
    config = {
      bg: 'rgba(37, 99, 235, 0.11)',
      color: '#2563eb',
      border: 'rgba(37, 99, 235, 0.25)',
      dot: '#3b82f6',
      text: label || (normalized === 'RESPONDED' ? 'Teklif Verildi' : normalized === 'VIEWED' ? 'İncelendi' : 'Bilgi')
    };
  } else if (['LOST', 'REJECTED', 'OUT_OF_STOCK', 'SOLD', 'ERROR', 'EXPIRED'].includes(normalized)) {
    config = {
      bg: 'rgba(220, 38, 38, 0.1)',
      color: '#DC5353',
      border: 'rgba(220, 38, 38, 0.25)',
      dot: '#DC5353',
      text: label || (normalized === 'LOST' ? 'İptal / Kayıp' : normalized === 'SOLD' ? 'Satıldı' : 'Kritik')
    };
  } else if (['PREMIUM', 'PRO', 'VIP'].includes(normalized)) {
    config = {
      bg: 'linear-gradient(135deg, rgba(179, 142, 71, 0.18) 0%, rgba(212, 175, 55, 0.12) 100%)',
      color: '#926f28',
      border: 'rgba(179, 142, 71, 0.4)',
      dot: '#C5A04B',
      text: label || 'PREMIUM'
    };
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: size === 'sm' ? '3px 10px' : '5px 12px',
        borderRadius: '999px',
        background: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
        fontSize: size === 'sm' ? '0.7rem' : '0.75rem',
        fontWeight: 800,
        letterSpacing: '0.01em',
        whiteSpace: 'nowrap'
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: config.dot,
          flexShrink: 0
        }}
      />
      <span>{config.text}</span>
    </span>
  );
}

/**
 * 3. StatCard
 * Modern metric card with Lucide icon, large stat value, period comparison badge, and mini SVG sparkline.
 */
export function StatCard({
  title,
  value,
  unit = '',
  changeText = '',
  changeType = 'neutral', // 'positive' | 'warning' | 'info' | 'neutral'
  icon,
  accentColor = '#C5A04B',
  sparklinePoints = [15, 28, 22, 38, 34, 48, 55],
  onClick,
  isMobile = false
}) {
  const pathData = useMemo(() => {
    const pts = Array.isArray(sparklinePoints) && sparklinePoints.length > 1
      ? sparklinePoints
      : [10, 20, 18, 28, 25, 36, 42];
    const max = Math.max(...pts, 1);
    const min = Math.min(...pts, 0);
    const range = Math.max(max - min, 1);
    const width = 92;
    const height = 30;
    const coords = pts.map((v, i) => {
      const x = (i / (pts.length - 1)) * width;
      const y = height - ((v - min) / range) * (height - 8) - 4;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    return {
      line: `M ${coords.join(' L ')}`,
      area: `M 0,${height} L ${coords.join(' L ')} L ${width},${height} Z`
    };
  }, [sparklinePoints]);

  const badgeColors = {
    positive: { bg: 'rgba(16, 185, 129, 0.1)', color: '#10A37F' },
    warning: { bg: 'rgba(217, 119, 6, 0.12)', color: '#E9A23B' },
    info: { bg: 'rgba(37, 99, 235, 0.1)', color: '#2563eb' },
    neutral: { bg: 'rgba(100, 116, 139, 0.1)', color: '#475569' }
  }[changeType] || { bg: 'rgba(100, 116, 139, 0.1)', color: '#475569' };

  return (
    <div
      onClick={onClick}
      style={{
        background: '#ffffff',
        border: '1px solid var(--dp-border, #E4E8EF)',
        borderRadius: '16px',
        padding: isMobile ? '16px 14px' : '20px 22px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '14px',
        boxShadow: '0 4px 16px -4px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.02)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        position: 'relative',
        overflow: 'hidden'
      }}
      className="dealer-stat-card"
    >
      {/* Top Row: Icon + Title & Change Pill */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <div
            style={{
              width: isMobile ? '36px' : '42px',
              height: isMobile ? '36px' : '42px',
              borderRadius: '11px',
              background: `${accentColor}15`,
              border: `1px solid ${accentColor}30`,
              color: accentColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            {icon}
          </div>
          <span
            style={{
              fontSize: isMobile ? '0.76rem' : '0.82rem',
              fontWeight: 700,
              color: 'var(--dp-text-secondary, #758195)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {title}
          </span>
        </div>

        {changeText && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              padding: '3px 8px',
              borderRadius: '999px',
              background: badgeColors.bg,
              color: badgeColors.color,
              fontSize: '0.68rem',
              fontWeight: 800,
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            {changeType === 'positive' && <ArrowUpRight size={12} />}
            <span>{changeText}</span>
          </span>
        )}
      </div>

      {/* Bottom Row: Big Metric Value + Mini Performance Sparkline */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: isMobile ? '1.45rem' : '1.75rem',
              fontWeight: 900,
              color: 'var(--dp-text-primary, #202938)',
              lineHeight: 1.1,
              letterSpacing: '-0.025em',
              fontFamily: 'var(--font-title, "Outfit", sans-serif)'
            }}
          >
            {value}
            {unit && (
              <span
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: 'var(--dp-text-secondary, #758195)',
                  marginLeft: '5px'
                }}
              >
                {unit}
              </span>
            )}
          </div>
        </div>

        {/* Mini SVG Sparkline */}
        <svg
          width="92"
          height="30"
          viewBox="0 0 92 30"
          style={{ flexShrink: 0, overflow: 'visible' }}
          aria-hidden="true"
        >
          <path d={pathData.area} fill={`${accentColor}16`} />
          <path
            d={pathData.line}
            fill="none"
            stroke={accentColor}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}

/**
 * 4. PageHeader
 * Standardized page/section header with title, subtitle, and right-aligned action slot or date filter.
 */
export function Breadcrumb({ items = [] }) {
  if (!items || items.length === 0) return null;
  return (
    <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', fontSize: '0.7rem', fontWeight: 600, color: 'var(--dp-text-secondary, #758195)', marginBottom: '4px' }}>
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <React.Fragment key={idx}>
            {idx > 0 && <ChevronRight size={11} style={{ opacity: 0.55 }} />}
            <span style={{ color: isLast ? '#C5A04B' : 'var(--dp-text-secondary, #758195)', fontWeight: isLast ? 700 : 600 }}>
              {item}
            </span>
          </React.Fragment>
        );
      })}
    </nav>
  );
}

export function PageHeader({ title, subtitle, icon, actions, breadcrumb, isMobile = false }) {
  return (
    <div
      style={{
        background: 'var(--dp-surface, #FFFFFF)',
        border: '1px solid var(--dp-border, #E4E8EF)',
        borderRadius: '16px',
        padding: isMobile ? '14px 16px' : '18px 22px',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'flex-start' : 'center',
        justifyContent: 'space-between',
        gap: '14px',
        boxShadow: '0 1px 3px rgba(32, 41, 56, 0.03)'
      }}
    >
      <div>
        {breadcrumb && <Breadcrumb items={breadcrumb} />}
        <h1
          style={{
            fontSize: isMobile ? '1.22rem' : '1.42rem',
            fontWeight: 800,
            color: 'var(--dp-text-primary, #202938)',
            margin: '0 0 3px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            letterSpacing: '-0.02em',
            fontFamily: 'var(--font-title, "Outfit", sans-serif)'
          }}
        >
          {icon && <span style={{ color: '#C5A04B', display: 'inline-flex' }}>{icon}</span>}
          <span>{title}</span>
        </h1>
        {subtitle && (
          <p style={{ fontSize: '0.82rem', color: 'var(--dp-text-secondary, #758195)', margin: 0, fontWeight: 500 }}>
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', width: isMobile ? '100%' : 'auto' }}>
          {actions}
        </div>
      )}
    </div>
  );
}

export function FormField({ label, error, hint, required = false, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      {label && (
        <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--dp-text-primary, #202938)' }}>
          {label} {required && <span style={{ color: '#DC5353' }}>*</span>}
        </label>
      )}
      {children}
      {hint && !error && (
        <span style={{ fontSize: '0.7rem', color: 'var(--dp-text-secondary, #758195)' }}>{hint}</span>
      )}
      {error && (
        <span style={{ fontSize: '0.7rem', color: '#DC5353', fontWeight: 600 }}>{error}</span>
      )}
    </div>
  );
}

export function UpgradePlanCard({ title, description, onUpgrade, onBack }) {
  return (
    <div
      style={{
        background: 'var(--dp-surface, #FFFFFF)',
        border: '1px solid var(--dp-border, #E4E8EF)',
        borderRadius: '18px',
        padding: '44px 28px',
        textAlign: 'center',
        boxShadow: '0 8px 28px rgba(32, 41, 56, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        maxWidth: '600px',
        margin: '24px auto'
      }}
    >
      <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: '#111827', border: '1.5px solid #C5A04B', color: '#C5A04B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Crown size={26} />
      </div>
      <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--dp-text-primary, #202938)' }}>{title}</h3>
      <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--dp-text-secondary, #758195)', maxWidth: '460px', lineHeight: 1.6 }}>{description}</p>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {onUpgrade && <PremiumButton variant="gold" icon={<Crown size={15} />} onClick={onUpgrade}>Premium Pakete Yükselt</PremiumButton>}
        {onBack && <PremiumButton variant="outline" onClick={onBack}>Panoya Dön</PremiumButton>}
      </div>
    </div>
  );
}

/**
 * 5. SearchInput
 * Clean search field with clear button and optional dropdown suggestions.
 */
export function SearchInput({
  value,
  onChange,
  placeholder = 'Ürün, koleksiyon veya özellik ara...',
  onClear,
  style = {},
  dark = false
}) {
  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        ...style
      }}
    >
      <Search
        size={16}
        style={{
          position: 'absolute',
          left: '12px',
          color: dark ? '#94a3b8' : 'var(--dp-text-secondary, #758195)',
          pointerEvents: 'none'
        }}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          height: '38px',
          padding: '0 34px 0 36px',
          borderRadius: '10px',
          border: dark ? '1px solid rgba(255,255,255,0.14)' : '1.5px solid var(--dp-border, #E4E8EF)',
          background: dark ? 'rgba(255,255,255,0.06)' : 'var(--dp-bg, #F5F6F8)',
          color: dark ? 'var(--dp-bg, #F5F6F8)' : 'var(--dp-text-primary, #202938)',
          fontSize: '0.82rem',
          fontWeight: 600,
          outline: 'none',
          transition: 'all 0.2s ease',
          boxSizing: 'border-box'
        }}
      />
      {value && (
        <button
          type="button"
          onClick={() => (onClear ? onClear() : onChange(''))}
          style={{
            position: 'absolute',
            right: '8px',
            background: 'transparent',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          aria-label="Temizle"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

/**
 * 6. FilterPanel
 * Pill-based filter bar for date ranges or status tabs.
 */
export function FilterPanel({ options = [], activeId, onChange, icon }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        background: '#ffffff',
        border: '1px solid var(--dp-border, #E4E8EF)',
        borderRadius: '11px',
        padding: '4px',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
        flexWrap: 'wrap'
      }}
    >
      {icon && (
        <span style={{ padding: '0 6px 0 8px', color: '#C5A04B', display: 'inline-flex', alignItems: 'center' }}>
          {icon}
        </span>
      )}
      {options.map((opt) => {
        const isActive = activeId === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            style={{
              background: isActive ? 'linear-gradient(135deg, var(--dp-text-primary, #202938) 0%, #1e293b 100%)' : 'transparent',
              color: isActive ? '#fde68a' : 'var(--dp-text-secondary, #758195)',
              border: isActive ? '1px solid rgba(212, 175, 55, 0.4)' : '1px solid transparent',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.75rem',
              fontWeight: isActive ? 800 : 700,
              cursor: 'pointer',
              transition: 'all 0.18s ease',
              whiteSpace: 'nowrap'
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * 7. QuickActionCard
 * Four-card grid item for quick dealer workflows (Ürün Kataloğu, AI Görselleştirici, Teklif Oluştur, Destek Al)
 */
export function QuickActionCard({ title, description, icon, badge, onClick, href, accentColor = '#C5A04B' }) {
  const content = (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid var(--dp-border, #E4E8EF)',
        borderRadius: '16px',
        padding: '18px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '14px',
        boxShadow: '0 4px 14px -4px rgba(15, 23, 42, 0.04)',
        cursor: 'pointer',
        transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        height: '100%',
        boxSizing: 'border-box'
      }}
      className="dealer-quick-action-card"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: `${accentColor}15`,
            border: `1px solid ${accentColor}30`,
            color: accentColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          {icon}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <h4
              style={{
                margin: 0,
                fontSize: '0.9rem',
                fontWeight: 800,
                color: 'var(--dp-text-primary, #202938)',
                fontFamily: 'var(--font-title, "Outfit", sans-serif)'
              }}
            >
              {title}
            </h4>
            {badge && (
              <span
                style={{
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  padding: '2px 7px',
                  borderRadius: '999px',
                  background: 'rgba(179, 142, 71, 0.14)',
                  color: '#926f28'
                }}
              >
                {badge}
              </span>
            )}
          </div>
          <p
            style={{
              margin: '3px 0 0 0',
              fontSize: '0.76rem',
              color: 'var(--dp-text-secondary, #758195)',
              lineHeight: 1.35
            }}
          >
            {description}
          </p>
        </div>
      </div>

      <div
        style={{
          width: '30px',
          height: '30px',
          borderRadius: '8px',
          background: 'var(--dp-bg, #F5F6F8)',
          border: '1px solid var(--dp-border, #E4E8EF)',
          color: '#475569',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
      >
        <ChevronRight size={15} />
      </div>
    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        target={href.startsWith('http') ? '_blank' : undefined}
        rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
        style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
      >
        {content}
      </a>
    );
  }

  return (
    <div onClick={onClick} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onClick?.()}>
      {content}
    </div>
  );
}

/**
 * 8. SalesPerformanceChart
 * Responsive interactive SVG chart with Günlük / Haftalık / Aylık filters, hover tooltips,
 * computed strictly from real dealer leads & saved quotes data.
 */
export function SalesPerformanceChart({ leads = [], savedQuotesList = [], isMobile = false, onCreateQuote }) {
  const [period, setPeriod] = useState('monthly'); // 'daily' | 'weekly' | 'monthly'
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const chartSeries = useMemo(() => {
    const now = new Date();
    const allItems = [];

    // Combine real saved quotes (with exact grandTotal) and real leads
    savedQuotesList.forEach((q) => {
      const dateStr = q.createdAt || q.date;
      const dt = dateStr ? new Date(dateStr) : now;
      const amount = Number(q?.calculations?.grandTotal || q?.grandTotal || 0);
      allItems.push({
        date: isNaN(dt.getTime()) ? now : dt,
        amount,
        type: 'quote'
      });
    });

    leads.forEach((l) => {
      const dt = l.createdAt ? new Date(l.createdAt) : now;
      // Estimate lead value only if price exists on product, otherwise track count & m2
      const prodPrice = Number(l?.product?.price || 0);
      allItems.push({
        date: isNaN(dt.getTime()) ? now : dt,
        amount: prodPrice > 0 ? prodPrice * 35 : 0,
        type: 'lead'
      });
    });

    const buckets = [];
    if (period === 'daily') {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const label = d.toLocaleDateString('tr-TR', { weekday: 'short', day: 'numeric' });
        const dayItems = allItems.filter(
          (it) =>
            it.date.getDate() === d.getDate() &&
            it.date.getMonth() === d.getMonth() &&
            it.date.getFullYear() === d.getFullYear()
        );
        const totalAmount = dayItems.reduce((acc, cur) => acc + cur.amount, 0);
        const count = dayItems.length;
        buckets.push({ label, amount: totalAmount, count });
      }
    } else if (period === 'weekly') {
      // Last 4 weeks
      for (let i = 3; i >= 0; i--) {
        const end = new Date(now);
        end.setDate(now.getDate() - i * 7);
        const start = new Date(end);
        start.setDate(end.getDate() - 6);
        const label = `${start.getDate()} ${start.toLocaleDateString('tr-TR', { month: 'short' })}`;
        const weekItems = allItems.filter((it) => it.date >= start && it.date <= end);
        const totalAmount = weekItems.reduce((acc, cur) => acc + cur.amount, 0);
        const count = weekItems.length;
        buckets.push({ label, amount: totalAmount, count });
      }
    } else {
      // Last 6 months
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const label = d.toLocaleDateString('tr-TR', { month: 'short' });
        const monthItems = allItems.filter(
          (it) => it.date.getMonth() === d.getMonth() && it.date.getFullYear() === d.getFullYear()
        );
        const totalAmount = monthItems.reduce((acc, cur) => acc + cur.amount, 0);
        const count = monthItems.length;
        buckets.push({ label, amount: totalAmount, count });
      }
    }

    return buckets;
  }, [leads, savedQuotesList, period]);

  const totalVolume = useMemo(
    () => chartSeries.reduce((sum, b) => sum + b.amount, 0),
    [chartSeries]
  );
  const totalCount = useMemo(
    () => chartSeries.reduce((sum, b) => sum + b.count, 0),
    [chartSeries]
  );

  // SVG coordinate calculation
  const width = 640;
  const height = 210;
  const padLeft = 44;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 34;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const maxVal = useMemo(() => {
    const m = Math.max(...chartSeries.map((b) => (totalVolume > 0 ? b.amount : b.count)), 1);
    return m;
  }, [chartSeries, totalVolume]);

  const points = useMemo(() => {
    return chartSeries.map((b, i) => {
      const val = totalVolume > 0 ? b.amount : b.count;
      const x = padLeft + (chartSeries.length > 1 ? (i / (chartSeries.length - 1)) * plotW : plotW / 2);
      const y = padTop + plotH - (val / maxVal) * (plotH - 12);
      return { x, y, ...b, displayVal: val };
    });
  }, [chartSeries, totalVolume, maxVal, plotW, plotH]);

  const linePath = useMemo(() => {
    if (points.length === 0) return '';
    return points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  }, [points]);

  const areaPath = useMemo(() => {
    if (points.length === 0) return '';
    const first = points[0];
    const last = points[points.length - 1];
    const base = padTop + plotH;
    return `${linePath} L ${last.x.toFixed(1)},${base} L ${first.x.toFixed(1)},${base} Z`;
  }, [points, linePath, plotH]);

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid var(--dp-border, #E4E8EF)',
        borderRadius: '18px',
        padding: isMobile ? '18px 14px' : '24px 26px',
        boxShadow: '0 4px 18px -4px rgba(15, 23, 42, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '18px'
      }}
    >
      {/* Header & Period Switcher */}
      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3
              style={{
                margin: 0,
                fontSize: '1.05rem',
                fontWeight: 800,
                color: 'var(--dp-text-primary, #202938)',
                fontFamily: 'var(--font-title, "Outfit", sans-serif)'
              }}
            >
              Satış & Teklif Performansı
            </h3>
            <StatusBadge status="ACTIVE" label="Canlı Veri" />
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: 'var(--dp-text-secondary, #758195)' }}>
            {totalVolume > 0
              ? `Seçili dönemde toplam ₺${totalVolume.toLocaleString('tr-TR')} teklif hacmi (${totalCount} işlem)`
              : `Seçili dönemde toplam ${totalCount} müşteri talebi ve teklif hareketi`}
          </p>
        </div>

        <FilterPanel
          activeId={period}
          onChange={setPeriod}
          options={[
            { id: 'daily', label: 'Günlük' },
            { id: 'weekly', label: 'Haftalık' },
            { id: 'monthly', label: 'Aylık' }
          ]}
        />
      </div>

      {/* SVG Responsive Chart */}
      <div style={{ position: 'relative', width: '100%' }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', height: isMobile ? '190px' : '220px', overflow: 'visible', display: 'block' }}
        >
          <defs>
            <linearGradient id="dealerGoldArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C5A04B" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#C5A04B" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid Lines */}
          {[0, 0.5, 1].map((ratio, idx) => {
            const y = padTop + ratio * plotH;
            const labelVal = Math.round(maxVal * (1 - ratio));
            return (
              <g key={idx}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke="var(--dp-bg, #F5F6F8)"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
                <text
                  x={padLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="10"
                  fontWeight="600"
                  fill="#94a3b8"
                >
                  {totalVolume > 0
                    ? labelVal >= 1000
                      ? `₺${(labelVal / 1000).toFixed(0)}B`
                      : `₺${labelVal}`
                    : `${labelVal}`}
                </text>
              </g>
            );
          })}

          {/* Area & Line */}
          <path d={areaPath} fill="url(#dealerGoldArea)" />
          <path
            d={linePath}
            fill="none"
            stroke="#C5A04B"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive Data Nodes & X-Axis Labels */}
          {points.map((pt, idx) => {
            const isHovered = hoveredIdx === idx;
            return (
              <g
                key={idx}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Invisible larger hit target */}
                <rect x={pt.x - 24} y={padTop} width="48" height={plotH} fill="transparent" />

                {/* Vertical Guide Line on Hover */}
                {isHovered && (
                  <line
                    x1={pt.x}
                    y1={padTop}
                    x2={pt.x}
                    y2={padTop + plotH}
                    stroke="#C5A04B"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                )}

                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 6 : 4.5}
                  fill="#ffffff"
                  stroke="#C5A04B"
                  strokeWidth={isHovered ? 3 : 2.5}
                />

                {/* X-Axis Date Label */}
                <text
                  x={pt.x}
                  y={height - 10}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight={isHovered ? '800' : '600'}
                  fill={isHovered ? 'var(--dp-text-primary, #202938)' : 'var(--dp-text-secondary, #758195)'}
                >
                  {pt.label}
                </text>

                {/* Tooltip Box */}
                {isHovered && (
                  <g transform={`translate(${Math.min(Math.max(pt.x - 65, 10), width - 145)}, ${Math.max(pt.y - 54, 4)})`}>
                    <rect
                      width="130"
                      height="42"
                      rx="8"
                      fill="var(--dp-text-primary, #202938)"
                      stroke="#C5A04B"
                      strokeWidth="1"
                    />
                    <text x="65" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="#fde68a">
                      {pt.label}
                    </text>
                    <text x="65" y="32" textAnchor="middle" fontSize="11" fontWeight="800" fill="#ffffff">
                      {pt.amount > 0
                        ? `₺${pt.amount.toLocaleString('tr-TR')} (${pt.count})`
                        : `${pt.count} Talep / Teklif`}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

/**
 * 9. ProductCard (Collection & Product Showcase Card)
 * Used in Popular Collections on Dashboard and in the Dealer Product Catalog tab.
 */
export function ProductCard({
  product,
  brandName,
  onInspect,
  onCreateQuote,
  onCreateQr,
  compact = false
}) {
  const imgUrl = product?.imageUrl || product?.textureUrl || '/hero/luxury_bathroom.png';
  const title = product?.name || 'Seramik Koleksiyonu';
  const code = product?.code || 'SB-SERI';
  const dimensions = product?.dimensions || (product?.width && product?.height ? `${product.width}x${product.height} cm` : '60x120 cm');
  const surface = product?.finish || product?.surface || product?.style || 'Porselen';
  const price = product?.price;

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid var(--dp-border, #E4E8EF)',
        borderRadius: '16px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: '0 4px 14px -4px rgba(15, 23, 42, 0.05)',
        transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
      className="dealer-collection-card"
    >
      {/* Image Header */}
      <div
        style={{
          position: 'relative',
          height: compact ? '145px' : '180px',
          width: '100%',
          background: 'var(--dp-bg, #F5F6F8)',
          overflow: 'hidden'
        }}
      >
        <img
          src={imgUrl}
          alt={title}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = '/hero/luxury_bathroom.png';
          }}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.35s ease'
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(15,23,42,0.05) 0%, rgba(15,23,42,0.55) 100%)'
          }}
        />
        <span
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            background: 'rgba(15, 23, 42, 0.82)',
            backdropFilter: 'blur(8px)',
            color: '#fde68a',
            border: '1px solid rgba(212, 175, 55, 0.35)',
            padding: '3px 9px',
            borderRadius: '6px',
            fontSize: '0.66rem',
            fontWeight: 800
          }}
        >
          {brandName || (typeof product?.brand === 'object' ? product?.brand?.name : product?.brand) || 'Koleksiyon'}
        </span>
        <span
          style={{
            position: 'absolute',
            bottom: '10px',
            right: '10px',
            background: 'rgba(255, 255, 255, 0.92)',
            color: 'var(--dp-text-primary, #202938)',
            padding: '2px 8px',
            borderRadius: '6px',
            fontSize: '0.68rem',
            fontWeight: 800
          }}
        >
          {dimensions}
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
        <div>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.03em' }}>
            KOD: {code} • {surface}
          </div>
          <h4
            style={{
              margin: '3px 0 0 0',
              fontSize: '0.94rem',
              fontWeight: 800,
              color: 'var(--dp-text-primary, #202938)',
              lineHeight: 1.3,
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {title}
          </h4>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            paddingTop: '8px',
            borderTop: '1px solid var(--dp-bg, #F5F6F8)',
            marginTop: 'auto'
          }}
        >
          {price ? (
            <span style={{ fontSize: '0.92rem', fontWeight: 900, color: '#C5A04B' }}>
              ₺{Number(price).toLocaleString('tr-TR')} <span style={{ fontSize: '0.68rem', color: 'var(--dp-text-secondary, #758195)', fontWeight: 600 }}>/m²</span>
            </span>
          ) : (
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--dp-text-secondary, #758195)' }}>
              3D Stüdyo Uyumlu
            </span>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {onCreateQuote && (
              <button
                type="button"
                onClick={() => onCreateQuote(product)}
                title="Bu Model İçin Hızlı Teklif Oluştur"
                style={{
                  background: 'var(--dp-bg, #F5F6F8)',
                  border: '1px solid var(--dp-border, #E4E8EF)',
                  color: 'var(--dp-text-primary, #202938)',
                  padding: '5px 9px',
                  borderRadius: '8px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Calculator size={12} style={{ color: '#C5A04B' }} />
                <span>Teklif</span>
              </button>
            )}
            {onCreateQr && (
              <button
                type="button"
                onClick={() => onCreateQr(product)}
                title="QR Etiket Bas"
                style={{
                  background: 'var(--dp-bg, #F5F6F8)',
                  border: '1px solid var(--dp-border, #E4E8EF)',
                  color: 'var(--dp-text-primary, #202938)',
                  padding: '5px 8px',
                  borderRadius: '8px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center'
                }}
              >
                <QrCode size={13} style={{ color: 'var(--dp-text-primary, #202938)' }} />
              </button>
            )}
            <button
              type="button"
              onClick={() => onInspect?.(product)}
              style={{
                background: 'linear-gradient(135deg, #C5A04B 0%, #C5A04B 100%)',
                border: 'none',
                color: '#090d16',
                padding: '5px 11px',
                borderRadius: '8px',
                fontSize: '0.72rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>İncele</span>
              <ChevronRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 10. EmptyState
 * Clean empty state card with icon, title, subtitle, and optional CTA button.
 */
export function EmptyState({ icon, title, description, actionLabel, onAction }) {
  return (
    <div
      style={{
        background: '#ffffff',
        border: '1.5px dashed var(--dp-border, #E4E8EF)',
        borderRadius: '16px',
        padding: '40px 24px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px'
      }}
    >
      <div
        style={{
          width: '52px',
          height: '52px',
          borderRadius: '14px',
          background: 'rgba(179, 142, 71, 0.12)',
          color: '#C5A04B',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {icon || <Layers size={24} />}
      </div>
      <div>
        <h4 style={{ margin: '0 0 4px 0', fontSize: '0.98rem', fontWeight: 800, color: 'var(--dp-text-primary, #202938)' }}>
          {title}
        </h4>
        {description && (
          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--dp-text-secondary, #758195)', maxWidth: '420px', lineHeight: 1.5 }}>
            {description}
          </p>
        )}
      </div>
      {actionLabel && onAction && (
        <PremiumButton variant="gold" size="sm" onClick={onAction}>
          {actionLabel}
        </PremiumButton>
      )}
    </div>
  );
}

/**
 * 11. LoadingSkeleton
 * Shimmer loading skeleton for cards and tables.
 */
export function LoadingSkeleton({ rows = 3, height = '56px' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
      {Array.from({ length: rows }).map((_, idx) => (
        <div
          key={idx}
          style={{
            height,
            width: '100%',
            borderRadius: '12px',
            background: 'linear-gradient(90deg, var(--dp-bg, #F5F6F8) 25%, var(--dp-border, #E4E8EF) 50%, var(--dp-bg, #F5F6F8) 75%)',
            backgroundSize: '200% 100%',
            animation: 'pulse 1.5s ease-in-out infinite'
          }}
        />
      ))}
    </div>
  );
}

/**
 * 12. DataTable
 * Responsive SaaS table component that renders a structured table on desktop and clean stacked cards on mobile.
 */
export function DataTable({
  columns = [],
  data = [],
  isMobile = false,
  emptyTitle = 'Kayıt Bulunamadı',
  emptyDescription = 'Seçili kriterlere uygun veri bulunmuyor.',
  renderMobileCard
}) {
  if (!data || data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  if (isMobile && renderMobileCard) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {data.map((row, idx) => (
          <React.Fragment key={row.id || idx}>{renderMobileCard(row, idx)}</React.Fragment>
        ))}
      </div>
    );
  }

  return (
    <div
      style={{
        width: '100%',
        overflowX: 'auto',
        borderRadius: '14px',
        border: '1px solid var(--dp-border, #E4E8EF)',
        background: '#ffffff'
      }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
        <thead>
          <tr style={{ background: 'var(--dp-bg, #F5F6F8)', borderBottom: '1.5px solid var(--dp-border, #E4E8EF)', textAlign: 'left' }}>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  padding: '13px 16px',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  color: '#475569',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  whiteSpace: 'nowrap'
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rIdx) => (
            <tr
              key={row.id || rIdx}
              style={{
                borderBottom: rIdx === data.length - 1 ? 'none' : '1px solid var(--dp-bg, #F5F6F8)',
                transition: 'background 0.15s ease'
              }}
            >
              {columns.map((col) => (
                <td key={col.key} style={{ padding: '14px 16px', color: '#1e293b', verticalAlign: 'middle' }}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * 13. ConfirmDialog
 * Reusable confirmation dialog modal.
 */
export function ConfirmDialog({
  open,
  title = 'İşlemi Onayla',
  description = 'Bu işlemi gerçekleştirmek istediğinize emin misiniz?',
  confirmLabel = 'Onayla',
  cancelLabel = 'Vazgeç',
  variant = 'danger',
  onConfirm,
  onCancel
}) {
  if (!open) return null;
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '18px',
          border: '1px solid var(--dp-border, #E4E8EF)',
          padding: '24px',
          maxWidth: '420px',
          width: '100%',
          boxShadow: '0 20px 50px rgba(15, 23, 42, 0.25)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: 800, color: 'var(--dp-text-primary, #202938)' }}>{title}</h3>
        <p style={{ margin: '0 0 20px 0', fontSize: '0.85rem', color: 'var(--dp-text-secondary, #758195)', lineHeight: 1.5 }}>{description}</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <PremiumButton variant="outline" size="sm" onClick={onCancel}>
            {cancelLabel}
          </PremiumButton>
          <PremiumButton variant={variant} size="sm" onClick={onConfirm}>
            {confirmLabel}
          </PremiumButton>
        </div>
      </div>
    </div>
  );
}
