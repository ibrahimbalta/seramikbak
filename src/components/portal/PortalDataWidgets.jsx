'use client';

import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender
} from '@tanstack/react-table';
import { TrendingUp, ShieldCheck, ArrowUpDown, Layers } from 'lucide-react';
import { SearchInput, StatusBadge, EmptyState } from './PortalUI';

/**
 * PerformanceChart — Recharts-powered interactive Area/Line chart for Brand & Dealer Portals.
 */
export function PerformanceChart({
  title = 'Marka Dijital Performansı',
  subtitle = 'Seçili dönemdeki görüntülenme, tıklanma ve talep hareketliliği.',
  data = [],
  metric = 'views',
  onMetricChange,
  metricOptions = [
    { id: 'views', label: 'Görüntülenme', color: '#4778E8' },
    { id: 'clicks', label: 'Tıklanma', color: '#C6A04A' },
    { id: 'leads', label: 'Bayi Talepleri', color: '#0D9B72' }
  ],
  dateFilter = '30d',
  onDateFilterChange
}) {
  const activeOption = metricOptions.find((m) => m.id === metric) || metricOptions[0];

  const chartData = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return [];
    const sliceCount = dateFilter === '7d' ? 7 : dateFilter === '90d' ? data.length : 30;
    const sliced = data.slice(-sliceCount);
    return sliced.map((d, idx) => ({
      date: d.date || `Gün ${idx + 1}`,
      value: Number(d[metric] ?? d.value ?? 0)
    }));
  }, [data, metric, dateFilter]);

  return (
    <div
      style={{
        background: 'var(--bp-surface, #FFFFFF)',
        border: '1px solid var(--bp-border, #E5E8EE)',
        borderRadius: '16px',
        padding: '22px 24px',
        boxShadow: '0 1px 3px rgba(32, 38, 51, 0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div>
          <h3
            style={{
              fontSize: '1.02rem',
              fontWeight: 800,
              color: 'var(--bp-text-primary, #202633)',
              margin: '0 0 4px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <TrendingUp size={17} style={{ color: activeOption.color }} />
            <span>{title}</span>
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--bp-text-secondary, #778196)', margin: 0 }}>
            {subtitle}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Metric Tabs */}
          <div
            style={{
              display: 'inline-flex',
              background: 'var(--bp-bg, #F6F7F9)',
              border: '1px solid var(--bp-border, #E5E8EE)',
              borderRadius: '9px',
              padding: '3px',
              gap: '2px'
            }}
          >
            {metricOptions.map((opt) => {
              const isSel = opt.id === metric;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onMetricChange && onMetricChange(opt.id)}
                  style={{
                    border: 'none',
                    borderRadius: '6px',
                    padding: '5px 10px',
                    fontSize: '0.72rem',
                    fontWeight: isSel ? 700 : 600,
                    background: isSel ? 'var(--bp-surface, #FFFFFF)' : 'transparent',
                    color: isSel ? 'var(--bp-text-primary, #202633)' : 'var(--bp-text-secondary, #778196)',
                    boxShadow: isSel ? '0 1px 2px rgba(32, 38, 51, 0.08)' : 'none',
                    cursor: 'pointer'
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {/* Date Filter Pills */}
          {onDateFilterChange && (
            <div
              style={{
                display: 'inline-flex',
                background: 'var(--bp-bg, #F6F7F9)',
                border: '1px solid var(--bp-border, #E5E8EE)',
                borderRadius: '9px',
                padding: '3px',
                gap: '2px'
              }}
            >
              {[
                { id: '7d', label: '7 gün' },
                { id: '30d', label: '30 gün' },
                { id: '90d', label: '90 gün' }
              ].map((d) => {
                const isSel = dateFilter === d.id;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => onDateFilterChange(d.id)}
                    style={{
                      border: 'none',
                      borderRadius: '6px',
                      padding: '5px 8px',
                      fontSize: '0.7rem',
                      fontWeight: isSel ? 700 : 600,
                      background: isSel ? '#171B24' : 'transparent',
                      color: isSel ? '#FFFFFF' : 'var(--bp-text-secondary, #778196)',
                      cursor: 'pointer'
                    }}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div style={{ width: '100%', height: '240px', minWidth: 0 }}>
        {chartData.length === 0 ? (
          <EmptyState
            title="Henüz dönem verisi bulunmuyor"
            description="Ziyaretçi ve talep etkileşimleri oluştukça grafik otomatik olarak güncellenecektir."
          />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id={`bpChartGrad-${activeOption.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={activeOption.color} stopOpacity={0.22} />
                  <stop offset="95%" stopColor={activeOption.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F4" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#778196' }}
                axisLine={{ stroke: '#E5E8EE' }}
                tickLine={false}
                minTickGap={24}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#778196' }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  background: '#171B24',
                  border: '1px solid rgba(198, 160, 74, 0.35)',
                  borderRadius: '10px',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  boxShadow: '0 10px 25px rgba(23, 27, 36, 0.25)'
                }}
                labelStyle={{ color: '#C6A04A', fontWeight: 700, marginBottom: '4px' }}
                formatter={(val) => [`${Number(val).toLocaleString('tr-TR')}`, activeOption.label]}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={activeOption.color}
                strokeWidth={2.5}
                fillOpacity={1}
                fill={`url(#bpChartGrad-${activeOption.id})`}
                activeDot={{ r: 5, stroke: '#FFFFFF', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

/**
 * MarketShareCard — Modern donut / progress visualization using real share metrics.
 */
export function MarketShareCard({
  title = 'Pazar Payı ve Marka Konumu',
  subtitle = 'SeramikBak pazar yeri genelinde görüntülenme payınız.',
  sharePercent = 0,
  rankLabel,
  rankSubLabel,
  categories = []
}) {
  const clamped = Math.max(0, Math.min(100, Number(sharePercent) || 0));

  return (
    <div
      style={{
        background: 'var(--bp-surface, #FFFFFF)',
        border: '1px solid var(--bp-border, #E5E8EE)',
        borderRadius: '16px',
        padding: '22px 24px',
        boxShadow: '0 1px 3px rgba(32, 38, 51, 0.03)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '16px'
      }}
    >
      <div>
        <h3
          style={{
            fontSize: '1.02rem',
            fontWeight: 800,
            color: 'var(--bp-text-primary, #202633)',
            margin: '0 0 4px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <ShieldCheck size={17} style={{ color: 'var(--bp-accent-gold, #C6A04A)' }} />
          <span>{title}</span>
        </h3>
        <p style={{ fontSize: '0.78rem', color: 'var(--bp-text-secondary, #778196)', margin: 0 }}>
          {subtitle}
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', width: '108px', height: '108px', flexShrink: 0 }}>
          <svg width="108" height="108" viewBox="0 0 36 36">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#EEF0F4"
              strokeWidth="3.6"
            />
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#C6A04A"
              strokeDasharray={`${clamped}, 100`}
              strokeWidth="3.6"
              strokeLinecap="round"
            />
          </svg>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
              fontWeight: 800,
              color: 'var(--bp-text-primary, #202633)'
            }}
          >
            %{clamped.toFixed(1)}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: '140px' }}>
          {rankLabel && (
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--bp-text-primary, #202633)' }}>
              {rankLabel}
            </div>
          )}
          {rankSubLabel && (
            <div style={{ fontSize: '0.74rem', color: 'var(--bp-text-secondary, #778196)', marginTop: '3px' }}>
              {rankSubLabel}
            </div>
          )}
        </div>
      </div>

      {categories.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--bp-border, #E5E8EE)', paddingTop: '12px' }}>
          {categories.map((cat) => (
            <div key={cat.label} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--bp-text-primary, #202633)' }}>{cat.label}</span>
                <span style={{ fontWeight: 700, color: 'var(--bp-text-secondary, #778196)' }}>%{cat.percent}</span>
              </div>
              <div style={{ height: '6px', borderRadius: '999px', background: '#EEF0F4', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${Math.min(100, Math.max(0, cat.percent))}%`,
                    height: '100%',
                    borderRadius: '999px',
                    background: cat.color || '#C6A04A'
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * DataTable — TanStack Table wrapper with sorting, global filtering, and automatic mobile card rendering.
 */
export function DataTable({
  data = [],
  columns = [],
  searchPlaceholder = 'Tabloda ara...',
  emptyTitle = 'Kayıt bulunamadı',
  emptyDescription = 'Filtre kriterlerinize uygun veri bulunmuyor.',
  isMobile = false,
  renderMobileCard,
  headerActions
}) {
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel()
  });

  const rows = table.getRowModel().rows;

  return (
    <div
      style={{
        background: 'var(--bp-surface, #FFFFFF)',
        border: '1px solid var(--bp-border, #E5E8EE)',
        borderRadius: '14px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(32, 38, 51, 0.03)'
      }}
    >
      <div
        style={{
          padding: '14px 18px',
          borderBottom: '1px solid var(--bp-border, #E5E8EE)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px'
        }}
      >
        <SearchInput
          value={globalFilter}
          onChange={setGlobalFilter}
          placeholder={searchPlaceholder}
          style={{ maxWidth: isMobile ? '100%' : '280px' }}
        />
        {headerActions && <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>{headerActions}</div>}
      </div>

      {rows.length === 0 ? (
        <div style={{ padding: '20px' }}>
          <EmptyState title={emptyTitle} description={emptyDescription} />
        </div>
      ) : isMobile && renderMobileCard ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '12px' }}>
          {rows.map((row) => (
            <div key={row.id}>{renderMobileCard(row.original)}</div>
          ))}
        </div>
      ) : (
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} style={{ background: 'var(--bp-bg, #F6F7F9)', borderBottom: '1px solid var(--bp-border, #E5E8EE)' }}>
                  {hg.headers.map((header) => {
                    const canSort = header.column.getCanSort();
                    return (
                      <th
                        key={header.id}
                        onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                        style={{
                          padding: '11px 16px',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          color: 'var(--bp-text-secondary, #778196)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          cursor: canSort ? 'pointer' : 'default',
                          whiteSpace: 'nowrap',
                          userSelect: 'none'
                        }}
                      >
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {canSort && <ArrowUpDown size={11} style={{ opacity: 0.6 }} />}
                        </span>
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  style={{
                    borderBottom: '1px solid var(--bp-border, #E5E8EE)',
                    transition: 'background 0.12s ease'
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      style={{
                        padding: '12px 16px',
                        fontSize: '0.82rem',
                        color: 'var(--bp-text-primary, #202633)',
                        verticalAlign: 'middle'
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/**
 * PortalProductCard — Consistent product card for Brand & Dealer catalogs.
 */
export function PortalProductCard({ product, actions }) {
  return (
    <div
      style={{
        background: 'var(--bp-surface, #FFFFFF)',
        border: '1px solid var(--bp-border, #E5E8EE)',
        borderRadius: '14px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 1px 3px rgba(32, 38, 51, 0.03)'
      }}
    >
      <div style={{ position: 'relative', height: '150px', background: 'var(--bp-bg, #F6F7F9)', overflow: 'hidden' }}>
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}>
            <Layers size={28} />
          </div>
        )}
        <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
          <StatusBadge variant={product.isActive === false ? 'neutral' : 'success'} dot>
            {product.isActive === false ? 'Pasif' : 'Aktif'}
          </StatusBadge>
        </div>
      </div>

      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        <div>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--bp-accent-gold, #C6A04A)', textTransform: 'uppercase' }}>
            {product.code || 'SKU'}
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--bp-text-primary, #202633)', marginTop: '2px' }}>
            {product.name}
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', fontSize: '0.72rem', color: 'var(--bp-text-secondary, #778196)' }}>
          {product.width && product.height && <span>{product.width}×{product.height} cm</span>}
          {product.finish && <span>• {product.finish}</span>}
          {product.style && <span>• {product.style}</span>}
        </div>

        {actions && (
          <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid var(--bp-border, #E5E8EE)', display: 'flex', gap: '8px' }}>
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
