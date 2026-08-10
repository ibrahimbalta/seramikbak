'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Globe, Building2, Search, CheckCircle2, ArrowRight, Sparkles, Layers, TrendingUp, Zap } from 'lucide-react';

const marketScenarios = [
  {
    id: 'eu',
    region: 'Avrupa',
    subRegion: 'Almanya • İngiltere • Fransa',
    flags: '🇩🇪 🇬🇧 🇫🇷',
    searchVolume: '8.450+',
    searchUnit: 'Aylık Mimar Araması',
    topQuery: 'marmor optik keramik 60x120 b2b import',
    bimDownloads: '1.840+',
    bimUnit: 'Revit / CAD Şartnamesi',
    leadStatus: 'Google DE & UK 1. Sıra'
  },
  {
    id: 'gulf',
    region: 'Körfez Bölgesi',
    subRegion: 'Dubai • S. Arabistan • Katar',
    flags: '🇦🇪 🇸🇦 🇶🇦',
    searchVolume: '6.200+',
    searchUnit: 'Aylık Şartname Araması',
    topQuery: 'large format porcelain slab luxury hotel spec',
    bimDownloads: '1.420+',
    bimUnit: 'BIM Proje Dosyası',
    leadStatus: 'Google Arabia Top Rank'
  },
  {
    id: 'us',
    region: 'Kuzey Amerika',
    subRegion: 'ABD • Kanada',
    flags: '🇺🇸 🇨🇦',
    searchVolume: '4.800+',
    searchUnit: 'Aylık B2B Distribütör',
    topQuery: 'porcelain tiles manufacturer direct supplier',
    bimDownloads: '960+',
    bimUnit: '4K PBR Doku Paketi',
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

  const realImpressions = liveDbStats ? (liveDbStats.analyticsCount + (collectionCount * 1450)).toLocaleString('tr-TR') : (collectionCount * 1450).toLocaleString('tr-TR');
  const realBimDownloads = liveDbStats ? (liveDbStats.leadCount * 12 + collectionCount * 320) : collectionCount * 320;

  return (
    <div style={{
      background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.98) 0%, rgba(253, 251, 247, 0.95) 100%)',
      borderRadius: '20px',
      padding: '16px 18px',
      border: '1px solid rgba(197, 160, 89, 0.4)',
      borderTop: '3px solid #b38e47',
      boxShadow: '0 20px 45px rgba(15, 23, 42, 0.08), 0 2px 12px rgba(179, 142, 71, 0.08)',
      position: 'relative',
      overflow: 'hidden',
      color: '#0f172a',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: '100%',
      maxHeight: '430px',
      boxSizing: 'border-box'
    }}>

      {/* Decorative Ambient Radial Glow */}
      <div style={{
        position: 'absolute',
        top: '-40px',
        right: '-40px',
        width: '140px',
        height: '140px',
        background: 'radial-gradient(circle, rgba(212, 175, 55, 0.16) 0%, rgba(255, 255, 255, 0) 70%)',
        pointerEvents: 'none',
        borderRadius: '50%'
      }} />

      {/* 1. Header Row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: '6px',
        borderBottom: '1px solid rgba(226, 232, 240, 0.8)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: '#16a34a',
            boxShadow: '0 0 8px #16a34a'
          }} />
          <span style={{ fontSize: '0.68rem', fontWeight: '800', color: '#0f172a', letterSpacing: '0.03em' }}>
            GLOBAL İHRACAT & MARKA VİTRİNİ
          </span>
        </div>
        <div style={{
          fontSize: '0.65rem',
          color: '#b38e47',
          fontWeight: '800',
          background: 'linear-gradient(135deg, rgba(179, 142, 71, 0.12) 0%, rgba(212, 175, 55, 0.06) 100%)',
          padding: '2px 9px',
          borderRadius: '10px',
          border: '1px solid rgba(179, 142, 71, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <Globe size={11} />
          <span>5 Dilde Canlı SEO</span>
        </div>
      </div>

      {/* 2. Main Title */}
      <h3 style={{
        fontSize: '0.96rem',
        fontWeight: '900',
        color: '#0f172a',
        lineHeight: '1.3',
        margin: '4px 0 6px 0',
        fontFamily: 'var(--font-title, "Outfit", sans-serif)',
        letterSpacing: '-0.01em'
      }}>
        Koleksiyonlarınızı <span style={{
          background: 'linear-gradient(135deg, #b38e47 0%, #d4af37 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>Google Global'de İndeksliyor</span>, Mimarlık Şartnamelerine Ekliyoruz
      </h3>

      {/* 3. Luxury Segmented Market Switcher Tabs */}
      <div style={{
        display: 'flex',
        gap: '4px',
        marginBottom: '6px',
        background: 'rgba(241, 245, 249, 0.9)',
        padding: '3px',
        borderRadius: '12px',
        border: '1px solid rgba(226, 232, 240, 0.8)'
      }}>
        {marketScenarios.map((m, idx) => (
          <button
            key={m.id}
            onClick={() => setActiveMarket(idx)}
            style={{
              flex: 1,
              padding: '5px 6px',
              borderRadius: '9px',
              fontSize: '0.68rem',
              fontWeight: activeMarket === idx ? '800' : '600',
              background: activeMarket === idx ? 'linear-gradient(135deg, #ffffff 0%, #fefcf7 100%)' : 'transparent',
              color: activeMarket === idx ? '#0f172a' : '#64748b',
              border: activeMarket === idx ? '1px solid rgba(197, 160, 89, 0.4)' : 'none',
              boxShadow: activeMarket === idx ? '0 2px 8px rgba(179, 142, 71, 0.15)' : 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px'
            }}
          >
            <span style={{ fontSize: '0.75rem' }}>{m.flags}</span>
            <span>{m.region}</span>
          </button>
        ))}
      </div>

      {/* 4. Glassmorphic Market Stats & Search Terminal */}
      <div style={{
        background: '#ffffff',
        border: '1px solid rgba(226, 232, 240, 0.9)',
        borderRadius: '12px',
        padding: '8px 10px',
        marginBottom: '6px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '6px',
          marginBottom: '6px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(253, 251, 247, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%)',
            padding: '6px 8px',
            borderRadius: '8px',
            border: '1px solid #f1f5f9',
            borderLeft: '2px solid #b38e47'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: '600' }}>{scenario.searchUnit}</span>
              <TrendingUp size={13} style={{ color: '#b38e47' }} />
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: '900', color: '#b38e47', marginTop: '1px' }}>{scenario.searchVolume}</div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            padding: '6px 8px',
            borderRadius: '8px',
            border: '1px solid #f1f5f9',
            borderLeft: '2px solid #0f172a'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: '600' }}>{scenario.bimUnit}</span>
              <Layers size={13} style={{ color: '#0f172a' }} />
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: '900', color: '#0f172a', marginTop: '1px' }}>{scenario.bimDownloads}</div>
          </div>
        </div>

        {/* Live Search Terminal Strip */}
        <div style={{
          background: '#0f172a',
          color: '#ffffff',
          borderRadius: '8px',
          padding: '5px 8px',
          fontSize: '0.67rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <Search size={12} style={{ color: '#d4af37', flexShrink: 0 }} />
            <span style={{ color: '#94a3b8', fontSize: '0.6rem' }}>Arama:</span>
            <span style={{ fontWeight: '700', color: '#fef08a', overflow: 'hidden', textOverflow: 'ellipsis' }}>"{scenario.topQuery}"</span>
          </div>
          <span style={{
            fontSize: '0.6rem',
            color: '#34d399',
            fontWeight: '800',
            background: 'rgba(52, 211, 153, 0.15)',
            padding: '2px 6px',
            borderRadius: '6px',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            border: '1px solid rgba(52, 211, 153, 0.3)'
          }}>
            <Zap size={10} /> {scenario.leadStatus}
          </span>
        </div>
      </div>

      {/* 5. 3 Bullet Core Value Highlights */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginBottom: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.69rem', color: '#334155' }}>
          <CheckCircle2 size={13} style={{ color: '#16a34a', flexShrink: 0 }} />
          <span><strong>5 Dilde SEO:</strong> Google & Yandex aramalarında üst sırada indeksleme</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.69rem', color: '#334155' }}>
          <CheckCircle2 size={13} style={{ color: '#16a34a', flexShrink: 0 }} />
          <span><strong>BIM & 4K CAD:</strong> Yurt dışı mimarlık ofisleri projelere ekler</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.69rem', color: '#334155' }}>
          <CheckCircle2 size={13} style={{ color: '#16a34a', flexShrink: 0 }} />
          <span><strong>Doğrudan B2B:</strong> Komisyonsuz fabrika & mimarlık ekibi teması</span>
        </div>
      </div>

      {/* 6. Custom Gold Slider Calculator Panel */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(179, 142, 71, 0.08) 0%, rgba(212, 175, 55, 0.03) 100%)',
        border: '1px solid rgba(179, 142, 71, 0.3)',
        borderRadius: '11px',
        padding: '6px 10px',
        marginBottom: '6px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
          <span style={{ fontSize: '0.68rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Sparkles size={12} style={{ color: '#b38e47' }} />
            Tahmini İhracat SEO Potansiyeli
          </span>
          <span style={{
            fontSize: '0.65rem',
            fontWeight: '800',
            color: '#b38e47',
            background: '#ffffff',
            padding: '1px 7px',
            borderRadius: '8px',
            border: '1px solid rgba(179, 142, 71, 0.3)'
          }}>
            {collectionCount} Koleksiyon
          </span>
        </div>

        <div style={{ margin: '3px 0' }}>
          <input
            type="range"
            min="3"
            max="30"
            value={collectionCount}
            onChange={(e) => setCollectionCount(Number(e.target.value))}
            style={{
              width: '100%',
              height: '4px',
              borderRadius: '4px',
              accentColor: '#b38e47',
              cursor: 'pointer',
              background: 'rgba(179, 142, 71, 0.2)'
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.64rem', color: '#334155' }}>
          <div>Gösterim: <strong style={{ color: '#0f172a', fontSize: '0.7rem' }}>{realImpressions} Mimar/ay</strong></div>
          <div>CAD İndirme: <strong style={{ color: '#0f172a', fontSize: '0.7rem' }}>{realBimDownloads} Proje</strong></div>
        </div>
      </div>

      {/* 7. HIGH IMPACT METALLIC GOLD CTA BUTTON */}
      <Link 
        href="/global-tanitim#brand-apply-form" 
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          background: 'linear-gradient(135deg, #b38e47 0%, #d4af37 50%, #b38e47 100%)',
          color: '#0f172a',
          padding: '12px 18px',
          borderRadius: '12px',
          fontSize: '0.86rem',
          fontWeight: '900',
          textDecoration: 'none',
          boxShadow: '0 8px 24px rgba(179, 142, 71, 0.38)',
          transition: 'all 0.2s ease',
          textAlign: 'center',
          width: '100%',
          boxSizing: 'border-box',
          border: '1px solid rgba(212, 175, 55, 0.5)',
          cursor: 'pointer'
        }}
      >
        <Building2 size={17} style={{ color: '#0f172a', flexShrink: 0 }} />
        <span style={{ color: '#0f172a', fontWeight: '900', letterSpacing: '-0.01em' }}>Markanızı İhracat Ağına Ekleyin</span>
        <ArrowRight size={16} style={{ color: '#0f172a', flexShrink: 0 }} />
      </Link>

    </div>
  );
}
