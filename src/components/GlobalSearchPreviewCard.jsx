'use client';

import React, { useState, useEffect } from 'react';
import { Globe, Search, Download, Layers2, Sparkles, Check, ArrowRight, ExternalLink, ShieldCheck } from 'lucide-react';

const searchScenarios = [
  {
    id: 'de',
    country: 'Almanya',
    flag: '🇩🇪',
    engine: 'Google.de',
    query: 'marmor optik keramik 60x120 türkei hersteller b2b',
    title: 'Calacatta Gold 60x120 Mermer Görünümlü Porselen Karo',
    url: 'https://seramikbak.com/de/koleksiyon/calacatta-gold',
    desc: 'Türk seramik üreticilerinin 60x120cm 4K PBR kaplamaları. Almanya & AB projeleri için doğrudan fabrikadan B2B sevkiyat.',
    price: '€32.50 / m²',
    currency: 'EUR',
    rating: '4.9 ★★★★★ (142 Proje Şartnamesi)',
    bimSpecs: ['Revit .RFA 2026', 'AutoCAD .DWG', '4K PBR Textures'],
    status: 'Google DE 1. Sayfa İndeksli'
  },
  {
    id: 'ae',
    country: 'BAE (Dubai)',
    flag: '🇦🇪',
    engine: 'Google.ae',
    query: 'large format porcelain slab 120x240 luxury hotel Dubai',
    title: 'Nero Marquina 120x240 Large Format Porcelain Slab',
    url: 'https://seramikbak.com/en/collection/nero-marquina-120x240',
    desc: 'Ultra-durable large format ceramic slabs for high-rise commercial towers and luxury villas in UAE & Gulf Region.',
    price: '$48.00 / m²',
    currency: 'USD',
    rating: '5.0 ★★★★★ (89 Architectural Offices)',
    bimSpecs: ['Revit .RFA', 'SketchUp .SKM', 'Corona V-Ray PBR'],
    status: 'Google AE Top Search Indexed'
  },
  {
    id: 'gb',
    country: 'İngiltere',
    flag: '🇬🇧',
    engine: 'Google.co.uk',
    query: 'b2b porcelain floor tiles supplier revit bim library London',
    title: 'Concrete Touch Antrasit 80x80 Porselen Karo',
    url: 'https://seramikbak.com/en-gb/tiles/concrete-touch-80x80',
    desc: 'Architectural grade matte ceramic tiles specifiable for London residential & commercial developments with full BIM files.',
    price: '£29.00 / m²',
    currency: 'GBP',
    rating: '4.8 ★★★★★ (64 London Specs)',
    bimSpecs: ['Revit Family', 'AutoCAD Hatch', '4K Seamless'],
    status: 'Google UK Rich Snippet Active'
  },
  {
    id: 'sa',
    country: 'Suudi Arabistan',
    flag: '🇸🇦',
    engine: 'Google.com.sa',
    query: 'سيراميك بورسلان فاخر للمشاريع توريد مباشر من المصنع',
    title: 'Travertino Classico Bej 60x120 Porselen Karo',
    url: 'https://seramikbak.com/ar/collection/travertino-beige',
    desc: 'مجموعة السيراميك التركي الفاخرة المعتمدة للمشاريع الفندقية والتجارية في الرياض وجدة مع ملفات Revit BIM.',
    price: '﷼135.00 / m²',
    currency: 'SAR',
    rating: '4.9 ★★★★★ (115 Project Demand)',
    bimSpecs: ['Revit .RFA', 'AutoCAD .DWG', 'PBR Materials'],
    status: 'Yandex / Google Arabia Live'
  }
];

export default function GlobalSearchPreviewCard({ onOpenStudio }) {
  const [activeTab, setActiveTab] = useState(0);
  const [downloadingFormat, setDownloadingFormat] = useState(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const scenario = searchScenarios[activeTab];

  const handleDownloadBim = (format) => {
    setDownloadingFormat(format);
    setDownloadSuccess(false);
    setTimeout(() => {
      setDownloadingFormat(null);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3500);
    }, 1000);
  };

  return (
    <div style={{
      background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)',
      borderRadius: '24px',
      padding: '22px 24px',
      border: '1px solid rgba(212, 175, 55, 0.35)',
      boxShadow: '0 20px 45px rgba(0, 0, 0, 0.35), 0 0 40px rgba(179, 142, 71, 0.1)',
      position: 'relative',
      overflow: 'hidden',
      color: '#ffffff'
    }}>
      {/* Background Accent Glow */}
      <div style={{
        position: 'absolute',
        top: '-60px',
        right: '-60px',
        width: '180px',
        height: '180px',
        background: 'radial-gradient(circle, rgba(212, 175, 55, 0.18) 0%, rgba(0, 0, 0, 0) 70%)',
        pointerEvents: 'none',
        borderRadius: '50%'
      }} />

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        paddingBottom: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#22c55e',
            boxShadow: '0 0 10px #22c55e'
          }} />
          <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#ffffff', letterSpacing: '0.04em' }}>
            KÜRESEL ARAMA MOTORLARI & BIM ŞARTNAME ENTEGRASYONU
          </span>
        </div>
        <span style={{ fontSize: '0.72rem', color: '#d4af37', fontWeight: '800', background: 'rgba(212,175,55,0.15)', padding: '3px 9px', borderRadius: '10px', border: '1px solid rgba(212,175,55,0.3)' }}>
          5 Dilde Canlı SEO
        </span>
      </div>

      {/* Country Market Selection Tabs */}
      <div style={{
        display: 'flex',
        gap: '6px',
        marginBottom: '16px',
        overflowX: 'auto',
        paddingBottom: '4px'
      }}>
        {searchScenarios.map((item, idx) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(idx)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: activeTab === idx ? 'linear-gradient(135deg, #d4af37 0%, #b38e47 100%)' : 'rgba(255, 255, 255, 0.05)',
              color: activeTab === idx ? '#0f172a' : '#cbd5e1',
              border: activeTab === idx ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
              padding: '6px 12px',
              borderRadius: '12px',
              fontSize: '0.74rem',
              fontWeight: activeTab === idx ? '800' : '600',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease',
              boxShadow: activeTab === idx ? '0 4px 12px rgba(212, 175, 55, 0.3)' : 'none'
            }}
          >
            <span style={{ fontSize: '0.95rem' }}>{item.flag}</span>
            <span>{item.country}</span>
          </button>
        ))}
      </div>

      {/* Simulated Search Bar */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.8)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '14px',
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '14px',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4)'
      }}>
        <Search size={15} style={{ color: '#d4af37', flexShrink: 0 }} />
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {scenario.engine} • Canlı İndekslenmiş Arama Sorgusu
          </div>
          <div style={{ fontSize: '0.8rem', color: '#f8fafc', fontWeight: '600', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
            "{scenario.query}"
          </div>
        </div>
        <span style={{ fontSize: '0.65rem', color: '#34d399', background: 'rgba(52, 211, 153, 0.15)', padding: '2px 8px', borderRadius: '8px', border: '1px solid rgba(52, 211, 153, 0.3)', whiteSpace: 'nowrap', fontWeight: '700' }}>
          1. Sıra ⚡
        </span>
      </div>

      {/* Live Google Rich Snippet Result Box */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.04)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        padding: '14px 16px',
        marginBottom: '16px'
      }}>
        <div style={{ fontSize: '0.68rem', color: '#38bdf8', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Globe size={11} />
          <span>{scenario.url}</span>
        </div>
        <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#fef08a', marginBottom: '6px', lineHeight: '1.3' }}>
          {scenario.title}
        </div>
        <p style={{ fontSize: '0.75rem', color: '#cbd5e1', lineHeight: '1.45', margin: '0 0 10px 0' }}>
          {scenario.desc}
        </p>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '10px',
          padding: '8px 12px',
          border: '1px solid rgba(255,255,255,0.06)'
        }}>
          <div>
            <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Canlı İhracat Fiyatı & Değerlendirme</div>
            <div style={{ fontSize: '0.84rem', fontWeight: '900', color: '#ffffff' }}>
              {scenario.price} <span style={{ fontSize: '0.7rem', color: '#fbbf24', fontWeight: '700', marginLeft: '6px' }}>{scenario.rating}</span>
            </div>
          </div>
          <span style={{ fontSize: '0.68rem', color: '#34d399', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '3px' }}>
            <ShieldCheck size={13} /> Schema.org Onaylı
          </span>
        </div>
      </div>

      {/* BIM / CAD Spec Downloads Section */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Layers2 size={13} style={{ color: '#d4af37' }} />
            MİMARİ BIM / CAD ŞARTNAME NESNELERİ:
          </span>
          <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Revit 2020-2026 & CAD Uyumlu</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
          {scenario.bimSpecs.map((spec, i) => (
            <button
              key={i}
              onClick={() => handleDownloadBim(spec)}
              disabled={downloadingFormat === spec}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(212, 175, 55, 0.25)',
                borderRadius: '10px',
                padding: '8px 6px',
                color: '#ffffff',
                fontSize: '0.68rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(212, 175, 55, 0.2)';
                e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.6)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.25)';
              }}
            >
              <Download size={11} style={{ color: '#d4af37' }} />
              <span>{downloadingFormat === spec ? 'İndiriliyor...' : spec}</span>
            </button>
          ))}
        </div>

        {downloadSuccess && (
          <div style={{
            marginTop: '8px',
            background: 'rgba(34, 197, 94, 0.15)',
            border: '1px solid rgba(34, 197, 94, 0.4)',
            color: '#4ade80',
            padding: '6px 10px',
            borderRadius: '8px',
            fontSize: '0.7rem',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Check size={13} />
            <span>4K BIM Nesnesi & PBR Doku Paketi Hazırlandı! Detay sayfasından indirebilirsiniz.</span>
          </div>
        )}
      </div>

      {/* Bottom Action Footer */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '8px',
        textAlign: 'center',
        paddingTop: '10px',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '8px 4px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '0.74rem', fontWeight: '800', color: '#ffffff' }}>⚡ Google & Yandex</div>
          <div style={{ fontSize: '0.64rem', color: '#94a3b8', marginTop: '2px' }}>5 Dilde İndeksli</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '8px 4px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '0.74rem', fontWeight: '800', color: '#ffffff' }}>📐 4K BIM Arşivi</div>
          <div style={{ fontSize: '0.64rem', color: '#94a3b8', marginTop: '2px' }}>Revit & CAD .DWG</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '8px 4px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '0.74rem', fontWeight: '800', color: '#ffffff' }}>🤝 Doğrudan Temas</div>
          <div style={{ fontSize: '0.64rem', color: '#94a3b8', marginTop: '2px' }}>Fabrika B2B Bağlantı</div>
        </div>
      </div>
    </div>
  );
}
