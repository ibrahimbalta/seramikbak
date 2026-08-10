'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Globe, Building2, TrendingUp, Layers2, Sparkles, Check, ArrowRight, ShieldCheck, Search, FileCheck, CheckCircle2, ChevronRight } from 'lucide-react';

const marketScenarios = [
  {
    id: 'eu',
    region: 'Avrupa (Almanya, İngiltere, Fransa)',
    flags: '🇩🇪 🇬🇧 🇫🇷',
    searchVolume: '8.450+ Aylık Mimar Araması',
    topQuery: 'marmor optik keramik 60x120 b2b import',
    bimDownloads: '1.840+ Revit & CAD İndirmesi',
    activeProjects: 'Otel Renovasyonları & Lüks Konut Projeleri',
    currency: '€ EUR / £ GBP',
    leadStatus: 'Google DE & UK 1. Sayfa İndeksli'
  },
  {
    id: 'gulf',
    region: 'Körfez Bölgesi (Dubai, Suudi Arabistan, Katar)',
    flags: '🇦🇪 🇸🇦 🇶🇦',
    searchVolume: '6.200+ Aylık Proje Şartnamesi',
    topQuery: 'large format porcelain slab luxury hotel spec',
    bimDownloads: '1.420+ BIM Nesnesi Şartnamede',
    activeProjects: 'Ticari Kuleler, Karma Yaşam & Resort Oteller',
    currency: '$ USD / ﷼ SAR',
    leadStatus: 'Google Arabia & Yandex Top Rank'
  },
  {
    id: 'us',
    region: 'Kuzey Amerika (ABD & Kanada)',
    flags: '🇺🇸 🇨🇦',
    searchVolume: '4.800+ Aylık Distribütör Talebi',
    topQuery: 'architectural porcelain tiles manufacturer direct supplier',
    bimDownloads: '960+ 4K Seamless PBR İndirmesi',
    activeProjects: 'Multifamily Konut & Kurumsal Genel Merkezler',
    currency: '$ USD',
    leadStatus: 'Google US Rich Snippet Active'
  }
];

export default function GlobalSearchPreviewCard({ onOpenStudio }) {
  const [activeMarket, setActiveMarket] = useState(0);
  const [collectionCount, setCollectionCount] = useState(10);
  const [showAnalysing, setShowAnalysing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);

  const scenario = marketScenarios[activeMarket];

  const handleSimulateAnalysis = () => {
    setShowAnalysing(true);
    setAnalyzed(false);
    setTimeout(() => {
      setShowAnalysing(false);
      setAnalyzed(true);
    }, 1200);
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #ffffff 0%, #fdfbf7 100%)',
      borderRadius: '24px',
      padding: '24px 26px',
      border: '1px solid rgba(197, 160, 89, 0.35)',
      borderTop: '3px solid #b38e47',
      boxShadow: '0 20px 45px rgba(15, 23, 42, 0.07), 0 4px 18px rgba(0, 0, 0, 0.03)',
      position: 'relative',
      overflow: 'hidden',
      color: '#0f172a'
    }}>
      {/* Subtle Decorative Background Element */}
      <div style={{
        position: 'absolute',
        top: '-40px',
        right: '-40px',
        width: '160px',
        height: '160px',
        background: 'radial-gradient(circle, rgba(212, 175, 55, 0.1) 0%, rgba(255, 255, 255, 0) 70%)',
        pointerEvents: 'none',
        borderRadius: '50%'
      }} />

      {/* Header Badge & Sub-title */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '14px',
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#16a34a',
            boxShadow: '0 0 8px #16a34a'
          }} />
          <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#0f172a', letterSpacing: '0.03em' }}>
            SERAMİK ÜRETİCİLERİ VE MARKALAR İÇİN GLOBAL İHRACAT ALTYAPISI
          </span>
        </div>
        <span style={{
          fontSize: '0.72rem',
          color: '#b38e47',
          fontWeight: '800',
          background: 'rgba(179, 142, 71, 0.1)',
          padding: '4px 10px',
          borderRadius: '12px',
          border: '1px solid rgba(179, 142, 71, 0.3)'
        }}>
          B2B Marka Vitrini
        </span>
      </div>

      {/* Main Catchy Headline */}
      <h3 style={{
        fontSize: '1.15rem',
        fontWeight: '900',
        color: '#0f172a',
        lineHeight: '1.35',
        margin: '0 0 14px 0',
        fontFamily: 'var(--font-title, "Outfit", sans-serif)'
      }}>
        Ürünlerinizi <span style={{ color: '#b38e47' }}>5 Dilde Google Global'de İndeksliyor</span>, Uluslararası Mimarlık Şartnamelerine Ekliyoruz
      </h3>

      {/* Market Selector Tabs */}
      <div style={{
        display: 'flex',
        gap: '6px',
        marginBottom: '14px',
        background: '#f1f5f9',
        padding: '4px',
        borderRadius: '14px'
      }}>
        {marketScenarios.map((m, idx) => (
          <button
            key={m.id}
            onClick={() => setActiveMarket(idx)}
            style={{
              flex: 1,
              padding: '8px 10px',
              borderRadius: '10px',
              fontSize: '0.74rem',
              fontWeight: activeMarket === idx ? '800' : '600',
              background: activeMarket === idx ? '#ffffff' : 'transparent',
              color: activeMarket === idx ? '#0f172a' : '#64748b',
              border: activeMarket === idx ? '1px solid #cbd5e1' : 'none',
              boxShadow: activeMarket === idx ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <span>{m.flags}</span>
            <span>{m.region.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      {/* Live Market Performance Card */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '14px 16px',
        marginBottom: '16px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '10px',
          fontSize: '0.75rem'
        }}>
          <span style={{ fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Globe size={14} style={{ color: '#b38e47' }} />
            {scenario.region}
          </span>
          <span style={{ color: '#16a34a', fontWeight: '700', background: '#dcfce7', padding: '2px 8px', borderRadius: '8px', fontSize: '0.68rem' }}>
            {scenario.leadStatus}
          </span>
        </div>

        {/* 2 Grid Key Metrics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '10px',
          marginBottom: '12px'
        }}>
          <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: '600' }}>Aylık Mimar & Proje İlgisi</div>
            <div style={{ fontSize: '0.95rem', fontWeight: '900', color: '#b38e47', marginTop: '2px' }}>
              {scenario.searchVolume}
            </div>
          </div>
          <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: '600' }}>İndirilen BIM / Revit Nesnesi</div>
            <div style={{ fontSize: '0.95rem', fontWeight: '900', color: '#0f172a', marginTop: '2px' }}>
              {scenario.bimDownloads}
            </div>
          </div>
        </div>

        {/* Live Search Query Snippet */}
        <div style={{
          background: '#0f172a',
          color: '#ffffff',
          borderRadius: '12px',
          padding: '10px 12px',
          fontSize: '0.74rem'
        }}>
          <div style={{ fontSize: '0.64rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '3px' }}>
            <Search size={11} style={{ color: '#b38e47' }} />
            Bölgesel Arama Motorunda Üst Sıra Arama Sorgusu:
          </div>
          <div style={{ fontWeight: '700', color: '#fef08a' }}>
            "{scenario.topQuery}"
          </div>
        </div>
      </div>

      {/* 3 Core Brand Value Props */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        marginBottom: '18px'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.78rem', color: '#334155' }}>
          <CheckCircle2 size={16} style={{ color: '#16a34a', flexShrink: 0, marginTop: '2px' }} />
          <span><strong>5 Dilde Otomatik SEO:</strong> Koleksiyonlarınız Türkçe, İngilizce, Almanca, Arapça ve Rusça Google aramalarında indekslenir.</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.78rem', color: '#334155' }}>
          <CheckCircle2 size={16} style={{ color: '#16a34a', flexShrink: 0, marginTop: '2px' }} />
          <span><strong>Global BIM & Revit Kütüphanesi:</strong> Ürünlerinizin 4K PBR dokuları ve CAD dosyaları mimarlarca projelere indirilir.</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.78rem', color: '#334155' }}>
          <CheckCircle2 size={16} style={{ color: '#16a34a', flexShrink: 0, marginTop: '2px' }} />
          <span><strong>Sıfır Komisyon, Doğrudan B2B İletişim:</strong> Yabancı distribütör ve proje talepleri doğrudan markanızın ekibine iletilir.</span>
        </div>
      </div>

      {/* Interactive Brand Impact Simulator */}
      <div style={{
        background: 'rgba(179, 142, 71, 0.06)',
        border: '1px solid rgba(179, 142, 71, 0.25)',
        borderRadius: '16px',
        padding: '12px 14px',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.76rem', fontWeight: '800', color: '#0f172a' }}>
            📊 Markanız İçin Tahmini İhracat SEO Potansiyeli
          </span>
          <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#b38e47' }}>
            {collectionCount} Koleksiyon
          </span>
        </div>

        <input
          type="range"
          min="3"
          max="30"
          value={collectionCount}
          onChange={(e) => setCollectionCount(Number(e.target.value))}
          style={{ width: '100%', accentColor: '#b38e47', cursor: 'pointer', marginBottom: '8px' }}
        />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: '#334155' }}>
          <span>Tahmini Aylık SEO Gösterimi: <strong>{(collectionCount * 1450).toLocaleString('tr-TR')} Mimar</strong></span>
          <span>Tahmini CAD İndirme: <strong>{collectionCount * 320} Proje</strong></span>
        </div>
      </div>

      {/* Call To Action Buttons */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <Link
          href="/global-tanitim#brand-apply-form"
          style={{
            flex: 1,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, #b38e47 0%, #d4af37 100%)',
            color: '#0f172a',
            padding: '12px 18px',
            borderRadius: '14px',
            fontSize: '0.84rem',
            fontWeight: '900',
            textDecoration: 'none',
            boxShadow: '0 6px 20px rgba(179, 142, 71, 0.3)',
            transition: 'all 0.2s ease'
          }}
        >
          <Building2 size={16} />
          <span>Markanızı İhracat Ağına Ekleyin</span>
          <ArrowRight size={14} />
        </Link>
      </div>

    </div>
  );
}
