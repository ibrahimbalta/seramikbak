'use client';

import { Flame, Activity, ShieldCheck, MapPin, Tag, ArrowUpRight } from 'lucide-react';

export default function LiveDealsTicker() {
  const deals = [
    { brand: 'VitrA', name: 'Calacatta Gold 60x120', dealer: 'Kadıköy Bayi', discount: '%35 İndirim', price: '₺490 / m²', city: 'İstanbul' },
    { brand: 'NG Kütahya', name: 'Albatros Antrasit 80x80', dealer: 'Çankaya Showroom', discount: '%40 İndirim', price: '₺420 / m²', city: 'Ankara' },
    { brand: 'Qua Seramik', name: 'Pulpis Grey 60x120', dealer: 'Alsancak Konsept Store', discount: '%30 İndirim', price: '₺450 / m²', city: 'İzmir' },
    { brand: 'Bien Seramik', name: 'Travertino 120x240 Plaka', dealer: 'Nilüfer Bayi', discount: '%45 İndirim', price: '₺890 / m²', city: 'Bursa' }
  ];

  return (
    <div style={{
      background: 'linear-gradient(90deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      borderTop: '1px solid rgba(212, 175, 55, 0.25)',
      borderBottom: '1px solid rgba(212, 175, 55, 0.25)',
      padding: '12px 24px',
      margin: '20px 0',
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Live Badge */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 12px',
        borderRadius: '20px',
        background: 'rgba(239, 68, 68, 0.15)',
        border: '1px solid rgba(239, 68, 68, 0.4)',
        color: '#f87171',
        fontSize: '0.78rem',
        fontWeight: '800',
        whiteSpace: 'nowrap',
        boxShadow: '0 0 12px rgba(239, 68, 68, 0.2)'
      }}>
        <span style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: '#ef4444',
          display: 'inline-block',
          boxShadow: '0 0 8px #ef4444'
        }} />
        <span>CANLI FIRSAT RADARI</span>
      </div>

      {/* Ticker Row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        flex: 1,
        overflowX: 'auto',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}>
        {deals.map((deal, idx) => (
          <div key={idx} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(255,255,255,0.04)',
            padding: '6px 14px',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.08)',
            fontSize: '0.82rem',
            whiteSpace: 'nowrap'
          }}>
            <span style={{ fontWeight: '800', color: '#d4af37' }}>[{deal.brand}]</span>
            <span style={{ color: '#f8fafc', fontWeight: '600' }}>{deal.name}</span>
            <span style={{ padding: '2px 6px', borderRadius: '6px', background: 'rgba(34,197,94,0.15)', color: '#4ade80', fontWeight: '700', fontSize: '0.75rem' }}>{deal.discount}</span>
            <span style={{ fontWeight: '800', color: '#ffffff' }}>{deal.price}</span>
            <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>• {deal.dealer} ({deal.city})</span>
          </div>
        ))}
      </div>

      {/* Social Proof Stats */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '0.78rem',
        color: '#cbd5e1',
        whiteSpace: 'nowrap',
        borderLeft: '1px solid rgba(255,255,255,0.1)',
        paddingLeft: '16px'
      }}>
        <Activity size={15} style={{ color: '#38bdf8' }} />
        <span>Bugün <strong>1,420 usta & mimar</strong> bayilerden fiyat topladı</span>
      </div>
    </div>
  );
}
