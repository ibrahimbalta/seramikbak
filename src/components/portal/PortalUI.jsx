'use client';

import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Search,
  Bell,
  Calendar,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  User,
  AlertTriangle,
  Inbox,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

/**
 * StatusBadge — Unified semantic badge across Brand & Dealer Portals.
 */
export function StatusBadge({ variant = 'neutral', children, dot = false }) {
  const palette = {
    success: { bg: 'rgba(13, 155, 114, 0.1)', color: '#0D9B72', border: 'rgba(13, 155, 114, 0.25)' },
    warning: { bg: 'rgba(229, 154, 54, 0.12)', color: '#B4690E', border: 'rgba(229, 154, 54, 0.3)' },
    error: { bg: 'rgba(217, 76, 76, 0.1)', color: '#D94C4C', border: 'rgba(217, 76, 76, 0.25)' },
    info: { bg: 'rgba(71, 120, 232, 0.1)', color: '#4778E8', border: 'rgba(71, 120, 232, 0.25)' },
    gold: { bg: 'rgba(198, 160, 74, 0.14)', color: '#9A7828', border: 'rgba(198, 160, 74, 0.35)' },
    neutral: { bg: '#F1F3F6', color: '#4B5565', border: '#E5E8EE' }
  };
  const s = palette[variant] || palette.neutral;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '3px 9px',
        borderRadius: '999px',
        fontSize: '0.7rem',
        fontWeight: 700,
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        whiteSpace: 'nowrap',
        lineHeight: 1.3
      }}
    >
      {dot && (
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: s.color,
            flexShrink: 0
          }}
        />
      )}
      {children}
    </span>
  );
}

/**
 * SearchInput — Corporate SaaS search field.
 */
export function SearchInput({ value, onChange, placeholder = 'Ara...', style = {} }) {
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
        size={15}
        style={{
          position: 'absolute',
          left: '12px',
          color: 'var(--bp-text-secondary, #778196)',
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
          padding: '0 32px 0 36px',
          borderRadius: '10px',
          border: '1px solid var(--bp-border, #E5E8EE)',
          background: 'var(--bp-bg, #F6F7F9)',
          color: 'var(--bp-text-primary, #202633)',
          fontSize: '0.82rem',
          fontWeight: 500,
          outline: 'none',
          transition: 'border-color 0.15s ease, background 0.15s ease'
        }}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Aramayı temizle"
          style={{
            position: 'absolute',
            right: '8px',
            background: 'transparent',
            border: 'none',
            color: 'var(--bp-text-secondary, #778196)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            padding: '2px'
          }}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

/**
 * FilterPanel — Unified filter bar container.
 */
export function FilterPanel({ children, rightSlot, style = {} }) {
  return (
    <div
      style={{
        background: 'var(--bp-surface, #FFFFFF)',
        border: '1px solid var(--bp-border, #E5E8EE)',
        borderRadius: '14px',
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        boxShadow: '0 1px 3px rgba(32, 38, 51, 0.03)',
        ...style
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px', flex: 1 }}>
        {children}
      </div>
      {rightSlot && <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>{rightSlot}</div>}
    </div>
  );
}

/**
 * StatCard — Balanced KPI Card with icon, value, trend badge, and subtitle.
 */
export function StatCard({
  label,
  value,
  subtext,
  icon,
  trend,
  trendDirection = 'up',
  accentColor = 'var(--bp-text-primary, #202633)',
  onClick,
  isMobile = false
}) {
  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
      style={{
        background: 'var(--bp-surface, #FFFFFF)',
        border: '1px solid var(--bp-border, #E5E8EE)',
        borderRadius: '14px',
        padding: isMobile ? '14px' : '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '10px',
        boxShadow: '0 1px 3px rgba(32, 38, 51, 0.03)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease'
      }}
      className="bp-stat-card"
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <span
          style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            color: 'var(--bp-text-secondary, #778196)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}
        >
          {label}
        </span>
        {icon && (
          <span
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '9px',
              background: 'var(--bp-bg, #F6F7F9)',
              border: '1px solid var(--bp-border, #E5E8EE)',
              color: 'var(--bp-accent-gold, #C6A04A)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            {icon}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
        <span
          style={{
            fontSize: isMobile ? '1.35rem' : '1.75rem',
            fontWeight: 800,
            color: accentColor,
            letterSpacing: '-0.025em',
            lineHeight: 1.1
          }}
        >
          {value}
        </span>

        {trend && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '2px',
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '2px 7px',
              borderRadius: '999px',
              background: trendDirection === 'down' ? 'rgba(217, 76, 76, 0.1)' : 'rgba(13, 155, 114, 0.1)',
              color: trendDirection === 'down' ? '#D94C4C' : '#0D9B72'
            }}
          >
            {trendDirection === 'down' ? <ArrowDownRight size={12} /> : <ArrowUpRight size={12} />}
            {trend}
          </span>
        )}
      </div>

      {subtext && (
        <span style={{ fontSize: '0.74rem', color: 'var(--bp-text-secondary, #778196)', lineHeight: 1.35 }}>
          {subtext}
        </span>
      )}
    </div>
  );
}

/**
 * QuickActionCard — Quick Action Launcher Tile.
 */
export function QuickActionCard({ title, description, icon, onClick, badge }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: 'var(--bp-surface, #FFFFFF)',
        border: '1px solid var(--bp-border, #E5E8EE)',
        borderRadius: '12px',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        textAlign: 'left',
        cursor: 'pointer',
        width: '100%',
        transition: 'all 0.18s ease',
        boxShadow: '0 1px 2px rgba(32, 38, 51, 0.03)'
      }}
      className="bp-quick-action-card"
    >
      <div
        style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'rgba(198, 160, 74, 0.12)',
          border: '1px solid rgba(198, 160, 74, 0.28)',
          color: '#9A7828',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
      >
        {icon}
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--bp-text-primary, #202633)' }}>
            {title}
          </span>
          {badge && <StatusBadge variant="gold">{badge}</StatusBadge>}
        </div>
        {description && (
          <div
            style={{
              fontSize: '0.72rem',
              color: 'var(--bp-text-secondary, #778196)',
              marginTop: '2px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {description}
          </div>
        )}
      </div>
      <ChevronRight size={15} style={{ color: 'var(--bp-text-secondary, #778196)', flexShrink: 0 }} />
    </button>
  );
}

/**
 * PageHeader / WelcomeBanner — Top-of-dashboard greeting + date range selector.
 */
export function PageHeader({
  title,
  subtitle,
  dateRange,
  onDateRangeChange,
  actions
}) {
  const ranges = [
    { id: '7d', label: 'Son 7 gün' },
    { id: '30d', label: 'Son 30 gün' },
    { id: '90d', label: 'Son 90 gün' },
    { id: 'custom', label: 'Özel tarih' }
  ];

  return (
    <div
      style={{
        background: 'var(--bp-surface, #FFFFFF)',
        border: '1px solid var(--bp-border, #E5E8EE)',
        borderRadius: '16px',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 1px 3px rgba(32, 38, 51, 0.03)'
      }}
    >
      <div>
        <h2
          style={{
            fontSize: 'clamp(1.15rem, 2vw, 1.45rem)',
            fontWeight: 800,
            color: 'var(--bp-text-primary, #202633)',
            margin: 0,
            letterSpacing: '-0.02em'
          }}
        >
          {title}
        </h2>
        {subtitle && (
          <p style={{ fontSize: '0.84rem', color: 'var(--bp-text-secondary, #778196)', margin: '4px 0 0 0' }}>
            {subtitle}
          </p>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        {onDateRangeChange && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: 'var(--bp-bg, #F6F7F9)',
              border: '1px solid var(--bp-border, #E5E8EE)',
              borderRadius: '10px',
              padding: '3px',
              gap: '2px'
            }}
          >
            {ranges.map((r) => {
              const active = dateRange === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => onDateRangeChange(r.id)}
                  style={{
                    border: 'none',
                    borderRadius: '7px',
                    padding: '6px 11px',
                    fontSize: '0.74rem',
                    fontWeight: active ? 700 : 600,
                    background: active ? 'var(--bp-surface, #FFFFFF)' : 'transparent',
                    color: active ? 'var(--bp-text-primary, #202633)' : 'var(--bp-text-secondary, #778196)',
                    boxShadow: active ? '0 1px 3px rgba(32, 38, 51, 0.08)' : 'none',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {r.label}
                </button>
              );
            })}
          </div>
        )}
        {actions}
      </div>
    </div>
  );
}

/**
 * NotificationPanel — Dropdown notification center in PortalHeader.
 */
export function NotificationPanel({ notifications = [], onSelectNotification }) {
  const [open, setOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Bildirim Merkezi"
        style={{
          position: 'relative',
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'var(--bp-bg, #F6F7F9)',
          border: '1px solid var(--bp-border, #E5E8EE)',
          color: 'var(--bp-text-primary, #202633)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer'
        }}
      >
        <Bell size={17} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              minWidth: '17px',
              height: '17px',
              padding: '0 4px',
              borderRadius: '999px',
              background: '#D94C4C',
              color: '#FFFFFF',
              fontSize: '0.62rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #FFFFFF'
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: '46px',
            right: 0,
            width: '320px',
            maxWidth: '90vw',
            background: 'var(--bp-surface, #FFFFFF)',
            border: '1px solid var(--bp-border, #E5E8EE)',
            borderRadius: '14px',
            boxShadow: '0 16px 40px rgba(32, 38, 51, 0.14)',
            zIndex: 300,
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid var(--bp-border, #E5E8EE)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--bp-text-primary, #202633)' }}>
              Bildirim Merkezi
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{ background: 'transparent', border: 'none', color: 'var(--bp-text-secondary, #778196)', cursor: 'pointer' }}
            >
              <X size={14} />
            </button>
          </div>
          <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '24px 16px', textAlign: 'center', fontSize: '0.78rem', color: 'var(--bp-text-secondary, #778196)' }}>
                Yeni bildiriminiz bulunmuyor.
              </div>
            ) : (
              notifications.map((n, idx) => (
                <div
                  key={n.id || idx}
                  onClick={() => {
                    setOpen(false);
                    if (onSelectNotification) onSelectNotification(n);
                  }}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--bp-border, #E5E8EE)',
                    cursor: 'pointer',
                    background: n.read ? 'transparent' : 'rgba(198, 160, 74, 0.05)'
                  }}
                >
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--bp-text-primary, #202633)' }}>
                    {n.title}
                  </div>
                  {n.desc && (
                    <div style={{ fontSize: '0.72rem', color: 'var(--bp-text-secondary, #778196)', marginTop: '2px' }}>
                      {n.desc}
                    </div>
                  )}
                  {n.time && (
                    <div style={{ fontSize: '0.66rem', color: '#9CA3AF', marginTop: '4px' }}>
                      {n.time}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * PortalHeader — Sticky corporate header with breadcrumb, search, notifications, license date, plan badge, and user menu.
 */
export function PortalHeader({
  portalLabel = 'Marka Portalı',
  groupLabel,
  pageTitle,
  pageDescription,
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Ürün, katalog veya talep ara...',
  notifications = [],
  onSelectNotification,
  licenseExpiresAt,
  planLabel,
  userName,
  onLogout,
  isMobile = false,
  onOpenMobileMenu
}) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header
      className="no-print"
      style={{
        background: 'var(--bp-surface, #FFFFFF)',
        borderBottom: '1px solid var(--bp-border, #E5E8EE)',
        padding: isMobile ? '12px 16px' : '14px 28px',
        position: 'sticky',
        top: 0,
        zIndex: 90,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        flexWrap: 'wrap'
      }}
    >
      {/* Left: Mobile Drawer Button + Breadcrumb + Page Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
        {isMobile && onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            aria-label="Menüyü Aç"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: '#171B24',
              color: '#FFFFFF',
              border: '1px solid rgba(198, 160, 74, 0.45)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0
            }}
          >
            <Menu size={18} />
          </button>
        )}

        <div style={{ minWidth: 0 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.68rem',
              fontWeight: 600,
              color: 'var(--bp-text-secondary, #778196)',
              marginBottom: '2px'
            }}
          >
            <span>{portalLabel}</span>
            {groupLabel && (
              <>
                <ChevronRight size={11} />
                <span>{groupLabel}</span>
              </>
            )}
            <ChevronRight size={11} />
            <span style={{ color: 'var(--bp-accent-gold, #C6A04A)', fontWeight: 700 }}>{pageTitle}</span>
          </div>

          <h1
            style={{
              fontSize: isMobile ? '1rem' : '1.22rem',
              fontWeight: 800,
              color: 'var(--bp-text-primary, #202633)',
              margin: 0,
              letterSpacing: '-0.02em',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {pageTitle}
          </h1>
          {!isMobile && pageDescription && (
            <p style={{ fontSize: '0.74rem', color: 'var(--bp-text-secondary, #778196)', margin: '2px 0 0 0' }}>
              {pageDescription}
            </p>
          )}
        </div>
      </div>

      {/* Right: Search, License, Plan, Notifications, User */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        {!isMobile && onSearchChange && (
          <SearchInput
            value={searchValue}
            onChange={onSearchChange}
            placeholder={searchPlaceholder}
            style={{ width: '220px' }}
          />
        )}

        {!isMobile && licenseExpiresAt && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '999px',
              background: 'var(--bp-bg, #F6F7F9)',
              border: '1px solid var(--bp-border, #E5E8EE)',
              fontSize: '0.72rem',
              color: 'var(--bp-text-secondary, #778196)'
            }}
          >
            <Calendar size={13} style={{ color: 'var(--bp-accent-gold, #C6A04A)' }} />
            <span>
              Lisans Bitiş:{' '}
              <strong style={{ color: 'var(--bp-text-primary, #202633)' }}>
                {new Date(licenseExpiresAt).toLocaleDateString('tr-TR', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </strong>
            </span>
          </div>
        )}

        {planLabel && <StatusBadge variant="gold">{planLabel}</StatusBadge>}

        <NotificationPanel
          notifications={notifications}
          onSelectNotification={onSelectNotification}
        />

        {userName && (
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setUserMenuOpen((v) => !v)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                height: '38px',
                padding: '0 10px',
                borderRadius: '10px',
                background: 'var(--bp-bg, #F6F7F9)',
                border: '1px solid var(--bp-border, #E5E8EE)',
                color: 'var(--bp-text-primary, #202633)',
                cursor: 'pointer',
                fontSize: '0.78rem',
                fontWeight: 700
              }}
            >
              <span
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '7px',
                  background: '#171B24',
                  color: '#C6A04A',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.7rem',
                  fontWeight: 800
                }}
              >
                <User size={13} />
              </span>
              {!isMobile && (
                <span style={{ maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {userName}
                </span>
              )}
              <ChevronDown size={13} style={{ color: 'var(--bp-text-secondary, #778196)' }} />
            </button>

            {userMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '44px',
                  right: 0,
                  width: '200px',
                  background: 'var(--bp-surface, #FFFFFF)',
                  border: '1px solid var(--bp-border, #E5E8EE)',
                  borderRadius: '12px',
                  boxShadow: '0 14px 32px rgba(32, 38, 51, 0.14)',
                  padding: '6px',
                  zIndex: 300
                }}
              >
                <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--bp-border, #E5E8EE)', marginBottom: '4px' }}>
                  <div style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--bp-text-primary, #202633)' }}>{userName}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--bp-text-secondary, #778196)' }}>{portalLabel}</div>
                </div>
                {onLogout && (
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      onLogout();
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: 'none',
                      background: 'transparent',
                      color: '#D94C4C',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <LogOut size={14} />
                    <span>Çıkış Yap</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

/**
 * PortalSidebar — Collapsible dark corporate sidebar (#171B24) with grouped navigation & mobile drawer.
 */
export function PortalSidebar({
  entityName,
  entitySubtitle,
  entityLogoUrl,
  planLabel,
  groups = [],
  activeTab,
  onSelectTab,
  collapsed = false,
  onToggleCollapse,
  onLogout,
  isMobile = false,
  mobileOpen = false,
  onCloseMobile,
  topSlot,
  renderSubItems
}) {
  const [collapsedGroups, setCollapsedGroups] = useState({});

  const toggleGroup = (gid) => {
    setCollapsedGroups((prev) => ({ ...prev, [gid]: !prev[gid] }));
  };

  const sidebarContent = (
    <aside
      className="no-print"
      style={{
        width: isMobile ? '280px' : collapsed ? '74px' : '268px',
        background: 'var(--bp-sidebar-bg, #171B24)',
        color: '#D1D5DB',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        transition: 'width 0.24s cubic-bezier(0.4, 0, 0.2, 1)',
        borderRight: '1px solid var(--bp-sidebar-border, rgba(255,255,255,0.08))',
        position: isMobile ? 'fixed' : 'sticky',
        top: 0,
        left: 0,
        height: '100vh',
        maxHeight: '100vh',
        overflow: 'hidden',
        zIndex: isMobile ? 450 : 120,
        boxShadow: isMobile ? '12px 0 40px rgba(0,0,0,0.35)' : 'none'
      }}
    >
      {/* Top: SeramikBak + Brand/Dealer Identity + Collapse */}
      <div
        style={{
          padding: collapsed && !isMobile ? '16px 10px' : '16px 16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed && !isMobile ? 'center' : 'space-between',
          gap: '10px',
          flexShrink: 0
        }}
      >
        {collapsed && !isMobile ? (
          <button
            type="button"
            onClick={onToggleCollapse}
            title="Menüyü Genişlet"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: '#202633',
              border: '1.5px solid #C6A04A',
              color: '#FFFFFF',
              fontWeight: 900,
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            SB
          </button>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
              {entityLogoUrl ? (
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '9px',
                    background: '#FFFFFF',
                    border: '1.5px solid #C6A04A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '3px',
                    flexShrink: 0,
                    overflow: 'hidden'
                  }}
                >
                  <img
                    src={entityLogoUrl}
                    alt={entityName}
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  />
                </div>
              ) : (
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '9px',
                    background: '#202633',
                    border: '1.5px solid #C6A04A',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '0.95rem',
                    flexShrink: 0
                  }}
                >
                  SB
                </div>
              )}

              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: '0.88rem',
                    fontWeight: 800,
                    color: '#FFFFFF',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {entityName}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  {entitySubtitle && (
                    <span style={{ fontSize: '0.66rem', color: '#9CA3AF', fontWeight: 600 }}>
                      {entitySubtitle}
                    </span>
                  )}
                  {planLabel && (
                    <span
                      style={{
                        fontSize: '0.6rem',
                        fontWeight: 800,
                        padding: '1px 6px',
                        borderRadius: '999px',
                        background: 'rgba(198, 160, 74, 0.2)',
                        color: '#E7C978',
                        border: '1px solid rgba(198, 160, 74, 0.4)'
                      }}
                    >
                      {planLabel}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {isMobile ? (
              <button
                type="button"
                onClick={onCloseMobile}
                aria-label="Menüyü Kapat"
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#9CA3AF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={16} />
              </button>
            ) : (
              onToggleCollapse && (
                <button
                  type="button"
                  onClick={onToggleCollapse}
                  title="Menüyü Daralt"
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '7px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#9CA3AF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    flexShrink: 0
                  }}
                >
                  <ChevronLeft size={15} />
                </button>
              )
            )}
          </>
        )}
      </div>

      {/* Optional Profile / Showroom Slot */}
      {(!collapsed || isMobile) && topSlot && (
        <div style={{ padding: '12px 14px 4px 14px', flexShrink: 0 }}>{topSlot}</div>
      )}

      {/* Categorized Navigation */}
      <nav
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: collapsed && !isMobile ? '12px 8px' : '12px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          scrollbarWidth: 'thin'
        }}
      >
        {groups.map((group) => {
          const isGroupCollapsed = Boolean(collapsedGroups[group.id]);
          return (
            <div key={group.id} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {(!collapsed || isMobile) && group.label && (
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'transparent',
                    border: 'none',
                    padding: '4px 8px',
                    color: '#6B7280',
                    fontSize: '0.64rem',
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    cursor: 'pointer'
                  }}
                >
                  <span>{group.label}</span>
                  {isGroupCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                </button>
              )}

              {(!isGroupCollapsed || (collapsed && !isMobile)) &&
                group.items.map((item) => {
                  const isActive = activeTab === item.id || item.forceActive;
                  return (
                    <div key={item.id} style={{ display: 'flex', flexDirection: 'column' }}>
                      <button
                        type="button"
                        onClick={() => {
                          onSelectTab(item.id, item);
                          if (isMobile && onCloseMobile) onCloseMobile();
                        }}
                        title={item.label}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: collapsed && !isMobile ? 'center' : 'space-between',
                          gap: '10px',
                          padding: collapsed && !isMobile ? '10px 0' : '9px 11px',
                          borderRadius: '9px',
                          border: 'none',
                          borderLeft: isActive && !(collapsed && !isMobile) ? '3px solid #C6A04A' : '3px solid transparent',
                          background: isActive ? 'rgba(198, 160, 74, 0.14)' : 'transparent',
                          color: isActive ? '#F3DFAA' : '#B4BCC8',
                          fontSize: '0.8rem',
                          fontWeight: isActive ? 700 : 500,
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.15s ease'
                        }}
                        className="bp-sidebar-item"
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                          <span style={{ color: isActive ? '#C6A04A' : '#8A94A6', display: 'inline-flex', flexShrink: 0 }}>
                            {item.icon}
                          </span>
                          {(!collapsed || isMobile) && (
                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {item.label}
                            </span>
                          )}
                        </span>

                        {(!collapsed || isMobile) && item.badge && (
                          <span
                            style={{
                              fontSize: '0.62rem',
                              fontWeight: 800,
                              padding: '1px 6px',
                              borderRadius: '999px',
                              background: 'rgba(198, 160, 74, 0.2)',
                              color: '#E7C978',
                              flexShrink: 0
                            }}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>

                      {(!collapsed || isMobile) && renderSubItems && renderSubItems(item, isActive)}
                    </div>
                  );
                })}
            </div>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div
        style={{
          padding: collapsed && !isMobile ? '10px 8px' : '12px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          flexShrink: 0
        }}
      >
        {!isMobile && onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              gap: '10px',
              padding: '8px 10px',
              borderRadius: '8px',
              border: 'none',
              background: 'transparent',
              color: '#8A94A6',
              fontSize: '0.78rem',
              cursor: 'pointer'
            }}
          >
            {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            {!collapsed && <span>Paneli Daralt</span>}
          </button>
        )}

        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
              gap: '10px',
              padding: '8px 10px',
              borderRadius: '8px',
              border: 'none',
              background: 'rgba(217, 76, 76, 0.1)',
              color: '#F87171',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <LogOut size={16} />
            {(!collapsed || isMobile) && <span>Çıkış Yap</span>}
          </button>
        )}
      </div>
    </aside>
  );

  if (isMobile) {
    if (!mobileOpen) return null;
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.55)',
          backdropFilter: 'blur(3px)',
          zIndex: 440
        }}
        onClick={onCloseMobile}
      >
        <div onClick={(e) => e.stopPropagation()}>{sidebarContent}</div>
      </div>
    );
  }

  return sidebarContent;
}

/**
 * EmptyState — Consistent empty state box.
 */
export function EmptyState({ icon, title, description, action }) {
  return (
    <div
      style={{
        background: 'var(--bp-surface, #FFFFFF)',
        border: '1px dashed var(--bp-border, #E5E8EE)',
        borderRadius: '14px',
        padding: '40px 24px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px'
      }}
    >
      <div
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          background: 'var(--bp-bg, #F6F7F9)',
          color: 'var(--bp-text-secondary, #778196)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '4px'
        }}
      >
        {icon || <Inbox size={20} />}
      </div>
      <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--bp-text-primary, #202633)' }}>
        {title}
      </div>
      {description && (
        <div style={{ fontSize: '0.78rem', color: 'var(--bp-text-secondary, #778196)', maxWidth: '420px' }}>
          {description}
        </div>
      )}
      {action && <div style={{ marginTop: '8px' }}>{action}</div>}
    </div>
  );
}

/**
 * LoadingSkeleton — Clean skeleton loader.
 */
export function LoadingSkeleton({ rows = 3, height = '72px' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          style={{
            height,
            borderRadius: '12px',
            background: 'linear-gradient(90deg, #ECEFF4 25%, #F6F7F9 50%, #ECEFF4 75%)',
            backgroundSize: '200% 100%',
            border: '1px solid var(--bp-border, #E5E8EE)'
          }}
        />
      ))}
    </div>
  );
}

/**
 * ConfirmDialog — Clean modal confirmation dialog.
 */
export function ConfirmDialog({
  open,
  title,
  description,
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
        background: 'rgba(23, 27, 36, 0.55)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 500,
        padding: '16px'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          background: 'var(--bp-surface, #FFFFFF)',
          border: '1px solid var(--bp-border, #E5E8EE)',
          borderRadius: '16px',
          padding: '22px',
          boxShadow: '0 24px 48px rgba(23, 27, 36, 0.2)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              background: variant === 'danger' ? 'rgba(217, 76, 76, 0.12)' : 'rgba(13, 155, 114, 0.12)',
              color: variant === 'danger' ? '#D94C4C' : '#0D9B72',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {variant === 'danger' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
          </div>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--bp-text-primary, #202633)' }}>
            {title}
          </h3>
        </div>
        {description && (
          <p style={{ margin: '0 0 18px 0', fontSize: '0.82rem', color: 'var(--bp-text-secondary, #778196)', lineHeight: 1.5 }}>
            {description}
          </p>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '8px 14px',
              borderRadius: '9px',
              border: '1px solid var(--bp-border, #E5E8EE)',
              background: 'var(--bp-surface, #FFFFFF)',
              color: 'var(--bp-text-primary, #202633)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              padding: '8px 16px',
              borderRadius: '9px',
              border: 'none',
              background: variant === 'danger' ? '#D94C4C' : '#0D9B72',
              color: '#FFFFFF',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
