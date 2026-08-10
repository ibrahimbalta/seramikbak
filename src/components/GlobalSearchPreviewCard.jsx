'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Globe, Building2, Search, CheckCircle2, ArrowRight } from 'lucide-react';

const marketScenarios = [
  {
    id: 'eu',
    region: 'Avrupa (Almanya, İngiltere, Fransa)',
    flags: '🇩🇪 🇬🇧 🇫🇷',
    searchVolume: '8.450+ Aylık Mimar Araması',
    topQuery: 'marmor optik keramik 60x120 b2b import',
    bimDownloads: '1.840+ Revit/CAD',
    leadStatus: 'Google DE & UK 1. Sıra İndeksli'
  },
  {
    id: 'gulf',
    region: 'Körfez Bölgesi (Dubai, Suudi Arabistan, Katar)',
    flags: '🇦🇪 🇸🇦 🇶🇦',
    searchVolume: '6.200+ Aylık Şartname Araması',
    topQuery: 'large format porcelain slab luxury hotel spec',
    bimDownloads: '1.420+ BIM Nesnesi',
    leadStatus: 'Google Arabia Top Rank'
  },
  {
    id: 'us',
    region: 'Kuzey Amerika (ABD & Kanada)',
    flags: '🇺🇸 🇨🇦',
    searchVolume: '4.800+ Aylık B2B Distribütör',
    topQuery: 'porcelain tiles manufacturer direct supplier',
    bimDownloads: '960+ PBR Textures',
    leadStatus: 'Google US Rich Snippet'
  }
];

export default function GlobalSearchPreviewCard({ onOpenStudio }) {
  const [activeMarket, setActiveMarket] = useState(0);
  const [collectionCount, setCollectionCount] = useState(10);
  const [liveDbStats, setLiveDbStats] = useState(null);

  useEffect(() => {
    fetch('/api/stats/live')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.stats) {
          setLiveDbStats(data.stats);
        }
      })
      .catch(err => console.error('Live stats fetch error:', err));
  }, []);

  const scenario = marketScenarios[activeMarket];

  // Dynamic real DB counts fallback
  const realImpressions = liveDbStats ? (liveDbStats.analyticsCount + (collectionCount * 1450)).toLocaleString('tr-TR') : (collectionCount * 1450).toLocaleString('tr-TR');
  const realBimDownloads = liveDbStats ? (liveDbStats.leadCount * 12 + collectionCount * 320) : collectionCount * 320;

  return (
    <div style={{
      background: 'linear-gradient(135deg, #ffffff 0%, #fdfbf7 100%)',
      borderRadius: '20px',
      padding: '16px 18px',
      border: '1px solid rgba(197, 160, 89, 0.35)',
      borderTop: '3px solid #b38e47',
      boxShadow: '0 12px 35px rgba(15, 23, 42, 0.06), 0 2px 10px rgba(0, 0, 0, 0.02)',
      position: 'relative',
      overflow: 'hidden',
      color: '#0f172a',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: '100%',
      maxHeight: '430px'
    }}>
      {/* Background Glow */}
      <div style={{
        position: 'absolute',
        top: '-30px',
        right: '-30px',
        width: '120px',
        height: '120px',
        background: 'radial-gradient(circle, rgba(212, 175, 55, 0.12) 0%, rgba(255, 255, 255, 0) 70%)',
        pointerEvents: 'none',
        borderRadius: '50%'
      }} />

      {/* 1. Header Badge */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: '8px',
        borderBottom: '1px solid #f1f5f9'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: '#16a34a',
            boxShadow: '0 0 6px #16a34a'
          }} />
          <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#0f172a', letterSpacing: '0.02em' }}>
            GLOBAL İHRACAT & MARKA VİTRİNİ
          </span>
        </div>
        <span style={{
          fontSize: '0.65rem',
          color: '#b38e47',
          fontWeight: '800',
          background: 'rgba(179, 142, 71, 0.1)',
          padding: '2px 8px',
          borderRadius: '10px',
          border: '1px solid rgba(179, 142, 71, 0.25)'
        }}>
          5 Dilde Canlı SEO
        </span>
      </div>

      {/* 2. Headline */}
      <h3 style={{
        fontSize: '0.98rem',
        fontWeight: '900',
        color: '#0f172a',
        lineHeight: '1.3',
        margin: '6px 0 8px 0',
        fontFamily: 'var(--font-title, "Outfit", sans-serif)'
      }}>
        Koleksiyonlarınızı <span style={{ color: '#b38e47' }}>Google Global'de İndeksliyor</span>, Mimarlık Şartnamelerine Ekliyoruz
      </h3>

      {/* 3. Market Selector Tabs */}
      <div style={{
        display: 'flex',
        gap: '4px',
        marginBottom: '8px',
        background: '#f1f5f9',
        padding: '3px',
        borderRadius: '10px'
      }}>
        {marketScenarios.map((m, idx) => (
          <button
            key={m.id}
            onClick={() => setActiveMarket(idx)}
            style={{
              flex: 1,
              padding: '5px 6px',
              borderRadius: '8px',
              fontSize: '0.68rem',
              fontWeight: activeMarket === idx ? '800' : '600',
              background: activeMarket === idx ? '#ffffff' : 'transparent',
              color: activeMarket === idx ? '#0f172a' : '#64748b',
              border: activeMarket === idx ? '1px solid #cbd5e1' : 'none',
              boxShadow: activeMarket === idx ? '0 1px 4px rgba(0,0,0,0.05)' : 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px'
            }}
          >
            <span>{m.flags}</span>
            <span>{m.region.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      {/* 4. Live Market Metrics & Query Card */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '8px 10px',
        marginBottom: '8px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '6px',
          marginBottom: '6px'
        }}>
          <div style={{ background: '#f8fafc', padding: '6px 8px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: '600' }}>Aylık Mimar Araması</div>
            <div style={{ fontSize: '0.82rem', fontWeight: '900', color: '#b38e47' }}>
              {scenario.searchVolume}
            </div>
          </div>
          <div style={{ background: '#f8fafc', padding: '6px 8px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: '600' }}>İndirilen Revit/BIM</div>
            <div style={{ fontSize: '0.82rem', fontWeight: '900', color: '#0f172a' }}>
              {scenario.bimDownloads}
            </div>
          </div>
        </div>

        {/* Live Search Query Snippet */}
        <div style={{
          background: '#0f172a',
          color: '#ffffff',
          borderRadius: '8px',
          padding: '6px 8px',
          fontSize: '0.68rem',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <Search size={11} style={{ color: '#b38e47', flexShrink: 0 }} />
          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.6rem' }}>Arama: </span>
            <span style={{ fontWeight: '700', color: '#fef08a' }}>"{scenario.topQuery}"</span>
          </div>
        </div>
      </div>

      {/* 5. 3 Compact Core Value Props */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        marginBottom: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: '#334155' }}>
          <CheckCircle2 size={13} style={{ color: '#16a34a', flexShrink: 0 }} />
          <span><strong>5 Dilde SEO:</strong> Google & Yandex aramalarında üst sırada indeksleme</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: '#334155' }}>
          <CheckCircle2 size={13} style={{ color: '#16a34a', flexShrink: 0 }} />
          <span><strong>BIM & 4K CAD:</strong> Yurt dışı mimarlık ofisleri projelere ekler</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: '#334155' }}>
          <CheckCircle2 size={13} style={{ color: '#16a34a', flexShrink: 0 }} />
          <span><strong>Doğrudan B2B:</strong> Komisyonsuz fabrika & mimarlık ekibi teması</span>
        </div>
      </div>

      {/* 6. Compact Brand Impact Simulator */}
      <div style={{
        background: 'rgba(179, 142, 71, 0.06)',
        border: '1px solid rgba(179, 142, 71, 0.25)',
        borderRadius: '10px',
        padding: '6px 10px',
        marginBottom: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
          <span style={{ fontSize: '0.68rem', fontWeight: '800', color: '#0f172a' }}>
            📊 Tahmini İhracat SEO Potansiyeli
          </span>
          <span style={{ fontSize: '0.65rem', fontWeight: '800', color: '#b38e47' }}>
            {collectionCount} Koleksiyon
          </span>
        </div>

        <input
          type="range"
          min="3"
          max="30"
          value={collectionCount}
          onChange={(e) => setCollectionCount(Number(e.target.value))}
          style={{ width: '100%', accentColor: '#b38e47', cursor: 'pointer', height: '4px' }}
        />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.65rem', color: '#334155', marginTop: '2px' }}>
          <span>Gösterim: <strong>{realImpressions} Mimar/ay</strong></span>
          <span>CAD İndirme: <strong>{realBimDownloads} Proje</strong></span>
        </div>
      </div>

      {/* 7. Action Button */}
      <Link
        href="/global-tanitim#brand-apply-form"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          background: 'linear-gradient(135deg, #b38e47 0%, #d4af37 100%)',
          color: '#0f172a',
          padding: '9px 14px',
          borderRadius: '10px',
          fontSize: '0.78rem',
          fontWeight: '900',
          textDecoration: 'none',
          boxShadow: '0 4px 14px rgba(179, 142, 71, 0.25)',
          transition: 'all 0.2s ease',
          textAlign: 'center'
        }}
      >
        <Building2 size={14} />
        <span>Markanızı İhracat Ağına Ekleyin</span>
        <ArrowRight size={13} />
      </Link>

    </div>
  );
}
