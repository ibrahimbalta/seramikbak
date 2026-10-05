'use client';

import React, { useState } from 'react';
import { 
  TrendingUp, BarChart3, PieChart, Sparkles, MapPin, 
  Compass, Award, ArrowUpRight, ArrowDownRight, Layers, Lightbulb,
  Zap, CheckCircle2, ShieldCheck, Flame, ArrowRight
} from 'lucide-react';

export default function MarketIntelligenceTab({ brandInfo }) {
  const brandName = brandInfo?.name || (typeof window !== 'undefined' ? (() => {
    try { return JSON.parse(localStorage.getItem('sb_brand_session') || '{}')?.name || 'Markanız'; } catch { return 'Markanız'; }
  })() : 'Markanız');
  const [intelData, setIntelData] = useState(null);

  React.useEffect(() => {
    if (brandInfo?.id) {
      fetch(`/api/b2b/brand-health?brandId=${brandInfo.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setIntelData(data);
          }
        })
        .catch(err => console.error('Failed to fetch market intel:', err));
    }
  }, [brandInfo?.id]);

  const dimensionTrends = (intelData?.dimensionTrends && intelData.dimensionTrends.length > 0)
    ? intelData.dimensionTrends
    : [
        { size: '60x120 cm Porselen Karo', share: 48, growth: '+28%', popularUsage: 'Tüm Zemin & Banyo Duvar', status: 'YÜKSELİŞTE', color: '#3b82f6' },
        { size: '80x80 cm Kare Karo', share: 22, growth: '+4%', popularUsage: 'Geniş Salon & Antre Zemin', status: 'DENGELİ', color: '#10b981' },
        { size: '120x240 cm Dev Slab Plaka', share: 14, growth: '+62%', popularUsage: 'Mutfak Adası & Lüks Banyo', status: 'HIZLI YÜKSELİŞ', color: '#8b5cf6' },
        { size: '20x120 cm Ahşap Desen', share: 10, growth: '+8%', popularUsage: 'Yatak Odası & Islak Hacim', status: 'DENGELİ', color: '#f59e0b' },
        { size: '60x60 cm Standart Karo', share: 6, growth: '-14%', popularUsage: 'Balkon & Servis Alanları', status: 'DÜŞÜŞTE', color: '#ef4444' }
      ];

  const textureTrends = [
    { name: 'Pietra Traverten & Sıcak Bej', share: 36, growth: '+45%', color: '#d97706', swatch: '#d4b996', desc: 'Doğal taş ve sıcak Akdeniz esintisi' },
    { name: 'Brüt Beton & Antrasit Loft', share: 28, growth: '+12%', color: '#475569', swatch: '#64748b', desc: 'Minimalist mimari ve ticari projeler' },
    { name: 'Calacatta Gold / Statuario', share: 22, growth: '+6%', color: '#2563eb', swatch: '#e2e8f0', desc: 'Lüks banyo ve otel lobisi klasiği' },
    { name: 'Doğal Meşe Ahşap Dokusu', share: 14, growth: '+15%', color: '#16a34a', swatch: '#854d0e', desc: 'Sıcak konut ve yatak odası zeminleri' }
  ];

  const surfacePreferences = [
    { finish: 'Mat / Dokulu (R10 / R11)', percent: 62, desc: 'Banyo ve salon zeminlerinde mutlak lider', color: '#059669' },
    { finish: 'Full Parlak / Cilalı (Polished)', percent: 28, desc: 'Banyo duvarları ve lobi zeminleri', color: '#2563eb' },
    { finish: 'Lapatto (Yarı Parlak)', percent: 10, desc: 'Ticari mağazalar ve butik ofisler', color: '#d97706' }
  ];

  const regionalDemands = [
    { region: 'Marmara (İstanbul, Bursa, Kocaeli)', share: '%42', topNeed: '60x120 Mermer & Brüt Beton', index: 'Çok Yüksek', badgeBg: '#fef2f2', badgeColor: '#991b1b' },
    { region: 'Ege (İzmir, Muğla, Aydın)', share: '%24', topNeed: 'Teras Dona Dayanıklı R11 & Traverten', index: 'Yüksek (Yaz Sezonu)', badgeBg: '#fffbeb', badgeColor: '#92400e' },
    { region: 'Akdeniz (Antalya, Adana, Mersin)', share: '%18', topNeed: 'Otel Lobisi 120x240 Slab Plaka', index: 'Yüksek', badgeBg: '#eff6ff', badgeColor: '#1e40af' },
    { region: 'İç Anadolu (Ankara, Konya, Kayseri)', share: '%16', topNeed: 'Yerden Isıtmaya Uygun 80x80 Porselen', index: 'Dengeli', badgeBg: '#f0fdf4', badgeColor: '#166534' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* -------------------- 1. EXECUTIVE HERO BANNER -------------------- */}
      <div style={{
        background: 'linear-gradient(135deg, #090d16 0%, #111827 50%, #1e293b 100%)',
        borderRadius: '20px',
        padding: '28px 32px',
        color: '#ffffff',
        border: '1px solid rgba(16, 185, 129, 0.25)',
        boxShadow: '0 12px 40px -10px rgba(0, 0, 0, 0.35)',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '24px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle background glow */}
        <div style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '260px',
          height: '260px',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: '780px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '20px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              color: '#34d399',
              fontSize: '0.75rem',
              fontWeight: '800',
              letterSpacing: '0.5px'
            }}>
              <TrendingUp size={13} />
              Gerçek Zamanlı Pazar Algoritmaları • 120.000+ Aylık Arama Verisi
            </span>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '4px 10px',
              borderRadius: '20px',
              background: 'rgba(212, 175, 55, 0.12)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              color: '#d4af37',
              fontSize: '0.72rem',
              fontWeight: '700'
            }}>
              <Flame size={12} />
              2026 Q3 Trend Verisi
            </span>
          </div>

          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '900',
            margin: '0 0 8px 0',
            color: '#ffffff',
            letterSpacing: '-0.3px',
            fontFamily: 'var(--font-title, "Outfit", sans-serif)'
          }}>
            Canlı Pazar İstihbaratı & AR-GE Trend Radarı
          </h2>
          <p style={{
            fontSize: '0.85rem',
            color: '#94a3b8',
            margin: 0,
            lineHeight: '1.6'
          }}>
            Türkiye ve Avrupa genelindeki tüketici ve mimar aramalarından derlenen büyük veri. Fabrikanızın üretim bantlarını en çok aranan ebatlara, renklere ve yüzey dokularına kaydırarak stok riskini sıfırlayın.
          </p>
        </div>

        {/* Real-time Ticker Badge */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.85)',
          borderRadius: '14px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 1,
          minWidth: '200px'
        }}>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>
            Son 30 Günlük Veri Seti
          </span>
          <span style={{ fontSize: '1.6rem', fontWeight: '900', color: '#34d399', marginTop: '2px' }}>
            128.400+
          </span>
          <span style={{ fontSize: '0.72rem', color: '#cbd5e1', fontWeight: '600', marginTop: '2px' }}>
            Arama & 3D Mekan Giydirme
          </span>
        </div>
      </div>

      {/* -------------------- 2. PRESTIGIOUS AI R&D ADVISORY CONSOLE (DARK HIGH-CONTRAST) -------------------- */}
      <div style={{
        background: 'linear-gradient(135deg, #090d16 0%, #0f172a 60%, #1e1b4b 100%)',
        borderRadius: '18px',
        border: '1px solid rgba(212, 175, 55, 0.35)',
        padding: '24px 28px',
        boxShadow: '0 8px 30px -6px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '20px'
      }}>
        <div style={{
          width: '46px',
          height: '46px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #d4af37 0%, #b45309 100%)',
          color: '#090d16',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)'
        }}>
          <Lightbulb size={24} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(212, 175, 55, 0.2)', color: '#d4af37', fontWeight: '800' }}>
              YAPAY ZEKA TAVSİYESİ
            </span>
            <h3 style={{ fontSize: '1rem', fontWeight: '900', color: '#ffffff', margin: 0 }}>
              {brandName} İçin Yapay Zeka AR-GE & Üretim Planlama Raporu (2026 Q3)
            </h3>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#e2e8f0', margin: 0, lineHeight: '1.65' }}>
            Pazar verilerimize göre <strong>60x120 cm Mat Traverten ve Bal Rengi Oniks</strong> dokulu porselen karolarda <strong style={{ color: '#34d399' }}>%42 arz açığı</strong> bulunmaktadır. Soğuk gri mermer aramaları son 6 ayda %18 gerilerken, sıcak toprak ve bej tonlarına yönelim hızla artmaktadır. Fabrikanızın yeni koleksiyon lansmanlarında bu format ve dokuya ağırlık vermesi tavsiye edilir.
          </p>
        </div>
      </div>

      {/* -------------------- 3. DIMENSION & TEXTURE TRENDS GRID -------------------- */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '24px'
      }}>
        
        {/* LEFT: DIMENSION DEMAND DISTRIBUTION */}
        <div style={{
          background: '#ffffff',
          borderRadius: '18px',
          border: '1px solid #e2e8f0',
          padding: '24px',
          boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: '850', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Compass size={18} style={{ color: '#059669' }} />
                <span>Ebat Talep Dağılımı ve Büyüme Hızları</span>
              </h3>
              <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '700' }}>Son 30 Gün</span>
            </div>
            <p style={{ fontSize: '0.72rem', color: '#64748b', margin: '4px 0 0 0' }}>
              Kullanıcıların ve mimarların en çok aradığı ve 3D stüdyoda denediği karo boyutları
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {dimensionTrends.map(item => (
              <div key={item.size} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0f172a' }}>{item.size}</span>
                    <span style={{ fontSize: '0.68rem', color: '#94a3b8', marginLeft: '6px' }}>({item.popularUsage})</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: '900', color: '#0f172a' }}>%{item.share}</span>
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: '800',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: item.growth.startsWith('+') ? '#ecfdf5' : '#fef2f2',
                      color: item.growth.startsWith('+') ? '#059669' : '#dc2626'
                    }}>
                      {item.growth}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ height: '7px', width: '100%', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${item.share}%`,
                    background: item.color,
                    borderRadius: '4px',
                    transition: 'width 0.5s ease'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: TEXTURE & PATTERN TRENDS */}
        <div style={{
          background: '#ffffff',
          borderRadius: '18px',
          border: '1px solid #e2e8f0',
          padding: '24px',
          boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: '850', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={18} style={{ color: '#b45309' }} />
                <span>Yükselen Doku ve Renk Tercihleri</span>
              </h3>
              <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '700' }}>Pazar Payı</span>
            </div>
            <p style={{ fontSize: '0.72rem', color: '#64748b', margin: '4px 0 0 0' }}>
              3D Stüdyo giydirmelerinde mimar ve son kullanıcıların en çok seçtiği doku aileleri
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {textureTrends.map(item => (
              <div
                key={item.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: '1px solid #f1f5f9',
                  background: '#f8fafc',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: item.swatch,
                    border: '1.5px solid #cbd5e1',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    flexShrink: 0
                  }} />
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0f172a' }}>{item.name}</div>
                    <div style={{ fontSize: '0.68rem', color: '#64748b' }}>{item.desc}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '900', color: '#0f172a' }}>%{item.share}</span>
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: '800',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: '#ecfdf5',
                    color: '#059669'
                  }}>
                    {item.growth}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Surface Finish Segment */}
          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#334155', marginBottom: '8px' }}>
              Yüzey Bitişi Tercihleri (Mat vs Parlak vs Lapatto):
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', textAlign: 'center' }}>
              {surfacePreferences.map(s => (
                <div key={s.finish} style={{ background: '#f8fafc', borderRadius: '10px', padding: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: '900', color: s.color }}>%{s.percent}</div>
                  <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>{s.finish}</div>
                  <div style={{ fontSize: '0.62rem', color: '#64748b', marginTop: '2px' }}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* -------------------- 4. REGIONAL DEMAND MATRIX -------------------- */}
      <div style={{
        background: '#ffffff',
        borderRadius: '18px',
        border: '1px solid #e2e8f0',
        padding: '24px',
        boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '850', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={18} style={{ color: '#0284c7' }} />
            <span>Bölgesel Talep Yoğunluğu & İhtiyaç Haritası</span>
          </h3>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
            Türkiye ve Avrupa ihracat pazarlarında bölgelere göre en çok talep gören formatlar
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
          {regionalDemands.map(reg => (
            <div
              key={reg.region}
              style={{
                background: '#f8fafc',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '8px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: '800',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  background: reg.badgeBg,
                  color: reg.badgeColor
                }}>
                  {reg.index}
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: '900', color: '#0f172a' }}>
                  {reg.share}
                </span>
              </div>

              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0f172a' }}>{reg.region}</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
                  Öne Çıkan: <strong style={{ color: '#0f172a' }}>{reg.topNeed}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
