'use client';

import React, { useState } from 'react';
import { 
  BarChart3, TrendingUp, Award, Eye, Download, ShieldCheck, 
  Sparkles, CheckCircle2, ArrowUpRight, PieChart, Users, Layers,
  Trophy, Check, FileText, ArrowRight
} from 'lucide-react';

export default function BrandHealthTab({ brandInfo }) {
  const brandName = brandInfo?.name || 'Güral Seramik';
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    if (brandInfo?.id) {
      setLoading(true);
      fetch(`/api/b2b/brand-health?brandId=${brandInfo.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setHealthData(data);
          }
        })
        .catch(err => console.error('Failed to fetch brand health data:', err))
        .finally(() => setLoading(false));
    }
  }, [brandInfo?.id]);

  const marketShareData = (healthData?.marketShareData && healthData.marketShareData.length > 0)
    ? healthData.marketShareData
    : [
        { brand: brandName, share: 34, color: '#d4af37', isCurrent: true, rank: 'Markanız' },
        { brand: 'Diğer Üreticiler', share: 66, color: '#94a3b8', isCurrent: false, rank: 'Toplam %66' }
      ];

  const categoryPerformance = (healthData?.categoryPerformance && healthData.categoryPerformance.length > 0)
    ? healthData.categoryPerformance
    : [
        { category: 'Banyo Seramikleri', views: '1.200', tryRate: 35, rank: '1. Sırada', isFirst: true, icon: '🛁' },
        { category: 'Salon & Antre Zemin', views: '950', tryRate: 28, rank: '2. Sırada', isFirst: false, icon: '🛋️' }
      ];

  const metrics = healthData?.metrics || {
    digitalAuthorityScore: 88,
    monthlyViews: 120,
    studioTries: 24,
    sampleOrdersCount: 4,
    productCount: 0
  };

  const handleDownloadReport = () => {
    setDownloadSuccess(true);
    setTimeout(() => {
      window.print();
      setDownloadSuccess(false);
    }, 600);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* -------------------- 1. EXECUTIVE HERO BANNER -------------------- */}
      <div style={{
        background: 'linear-gradient(135deg, #090d16 0%, #111827 50%, #1e1b4b 100%)',
        borderRadius: '20px',
        padding: '28px 32px',
        color: '#ffffff',
        border: '1px solid rgba(168, 85, 247, 0.25)',
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
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)',
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
              background: 'rgba(168, 85, 247, 0.15)',
              border: '1px solid rgba(168, 85, 247, 0.35)',
              color: '#c084fc',
              fontSize: '0.75rem',
              fontWeight: '800',
              letterSpacing: '0.5px'
            }}>
              <Award size={13} />
              Executive Board Intelligence • Yönetim Kurulu İntel Raporu
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
              <Trophy size={12} />
              Sektör Dijital Otorite Lideri
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
            {brandName} Dijital Marka Sağlığı & SERP Otorite İndeksi
          </h2>
          <p style={{
            fontSize: '0.85rem',
            color: '#94a3b8',
            margin: 0,
            lineHeight: '1.6'
          }}>
            Markanızın Google Search, SeramikBak 3D Stüdyosu ve yetkili bayi ağındaki gerçek zamanlı görünürlük, pazar payı ve mimari etkileşim performansı.
          </p>
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <button
            type="button"
            onClick={handleDownloadReport}
            style={{
              padding: '12px 20px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #9333ea 0%, #7e22ce 100%)',
              color: '#ffffff',
              fontWeight: '800',
              fontSize: '0.82rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(147, 51, 234, 0.3)',
              transition: 'transform 0.15s ease'
            }}
          >
            <Download size={16} />
            <span>{downloadSuccess ? 'Rapor Derleniyor...' : 'Yönetici Raporunu İndir (PDF)'}</span>
          </button>
        </div>
      </div>

      {/* -------------------- 2. TOP KPI CARDS -------------------- */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px'
      }}>
        {/* Metric 1 */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '22px',
          boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>
              Dijital Otorite Skoru
            </span>
            <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(147, 51, 234, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9333ea' }}>
              <Award size={16} />
            </div>
          </div>
          <div style={{ marginTop: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: '900', color: '#9333ea', letterSpacing: '-0.5px' }}>
                {metrics.digitalAuthorityScore} / 100
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#059669', display: 'flex', alignItems: 'center' }}>
                <ArrowUpRight size={14} /> +4.2%
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
              {metrics.digitalAuthorityScore >= 80 ? 'A+ Sektör lideri seviyesinde görünürlük' : 'Gelişen dijital otorite indeksi'}
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '22px',
          boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>
              Aylık Organik Gösterim
            </span>
            <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
              <Eye size={16} />
            </div>
          </div>
          <div style={{ marginTop: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.5px' }}>
                {metrics.monthlyViews.toLocaleString('tr-TR')}
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#059669', display: 'flex', alignItems: 'center' }}>
                <ArrowUpRight size={14} /> +18%
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
              Google Search & SeramikBak içi arama
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '22px',
          boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>
              3D Mekan Giydirme Sayısı
            </span>
            <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(212, 175, 55, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b45309' }}>
              <Sparkles size={16} />
            </div>
          </div>
          <div style={{ marginTop: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: '900', color: '#b45309', letterSpacing: '-0.5px' }}>
                {metrics.studioTries.toLocaleString('tr-TR')}
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#059669', display: 'flex', alignItems: 'center' }}>
                <ArrowUpRight size={14} /> +26%
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
              Müşteri ve mimar 3D deneme hacmi
            </div>
          </div>
        </div>

        {/* Metric 4 */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '22px',
          boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>
              Doğrudan Numune Talebi
            </span>
            <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
              <ShieldCheck size={16} />
            </div>
          </div>
          <div style={{ marginTop: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: '900', color: '#059669', letterSpacing: '-0.5px' }}>
                {metrics.sampleOrdersCount.toLocaleString('tr-TR')} Kutu
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#059669', display: 'flex', alignItems: 'center' }}>
                <ArrowUpRight size={14} /> +12%
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
              15x15 cm kesit kutusu kargolaması
            </div>
          </div>
        </div>
      </div>

      {/* -------------------- 3. COMPETITOR BENCHMARK & CATEGORY DOMINANCE -------------------- */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '24px'
      }}>
        
        {/* LEFT: DIGITAL MARKET SHARE DISTRIBUTION */}
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
                <PieChart size={18} style={{ color: '#d4af37' }} />
                <span>Seramik Sektörü Dijital Pazar Payı Dağılımı</span>
              </h3>
              <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '700' }}>Son 30 Gün</span>
            </div>
            <p style={{ fontSize: '0.72rem', color: '#64748b', margin: '4px 0 0 0' }}>
              SeramikBak platformunda son 30 günlük marka etkileşim ve arama payı
            </p>
          </div>

          {/* Segmented Stacked Progress Bar */}
          <div style={{ height: '14px', width: '100%', borderRadius: '8px', overflow: 'hidden', display: 'flex', background: '#f1f5f9' }}>
            {marketShareData.map(item => (
              <div
                key={item.brand}
                style={{
                  height: '100%',
                  width: `${item.share}%`,
                  background: item.color,
                  transition: 'width 0.5s ease'
                }}
                title={`${item.brand}: %${item.share}`}
              />
            ))}
          </div>

          {/* Detailed Brand Breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {marketShareData.map(item => (
              <div
                key={item.brand}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: item.isCurrent ? 'rgba(212, 175, 55, 0.08)' : '#f8fafc',
                  border: item.isCurrent ? '1.5px solid rgba(212, 175, 55, 0.4)' : '1px solid #f1f5f9'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: item.color, display: 'inline-block' }} />
                  <div>
                    <span style={{ fontSize: '0.82rem', fontWeight: item.isCurrent ? '900' : '700', color: item.isCurrent ? '#0f172a' : '#334155' }}>
                      {item.brand}
                    </span>
                    {item.isCurrent && (
                      <span style={{ fontSize: '0.68rem', padding: '2px 6px', borderRadius: '4px', background: '#d4af37', color: '#090d16', fontWeight: '800', marginLeft: '8px' }}>
                        FABRİKANIZ
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{item.rank}</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: '900', color: '#0f172a' }}>%{item.share}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Executive Summary Callout */}
          <div style={{
            padding: '12px 16px',
            borderRadius: '10px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            fontSize: '0.75rem',
            color: '#475569',
            lineHeight: '1.5'
          }}>
            🎯 <strong>Özet İçgörü:</strong> {brandName}, Türkiye dijital seramik arama hacminde <strong style={{ color: '#b45309' }}>%{marketShareData.find(m => m.isCurrent)?.share || 25} pay</strong> ile platformdaki güçlü pazar varlığını sürdürmektedir.
          </div>
        </div>

        {/* RIGHT: CATEGORY DOMINANCE & CONVERSION */}
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
                <Layers size={18} style={{ color: '#9333ea' }} />
                <span>Kategori Bazlı Hakimiyet & 3D Dönüşüm Oranları</span>
              </h3>
              <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '700' }}>Metrikler</span>
            </div>
            <p style={{ fontSize: '0.72rem', color: '#64748b', margin: '4px 0 0 0' }}>
              {brandName} koleksiyonlarının mekan kategorilerine göre gösterim ve 3D deneme performansı
            </p>
          </div>

          <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.78rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 14px' }}>Mekan Kategorisi</th>
                  <th style={{ padding: '12px 14px' }}>Aylık İnceleme</th>
                  <th style={{ padding: '12px 14px' }}>3D Giydirme Oranı</th>
                  <th style={{ padding: '12px 14px' }}>Piyasa Konumu</th>
                </tr>
              </thead>
              <tbody>
                {categoryPerformance.map((cat, idx) => (
                  <tr
                    key={cat.category}
                    style={{
                      borderBottom: idx < categoryPerformance.length - 1 ? '1px solid #f1f5f9' : 'none'
                    }}
                  >
                    <td style={{ padding: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.1rem' }}>{cat.icon}</span>
                        <span style={{ fontWeight: '800', color: '#0f172a' }}>{cat.category}</span>
                      </div>
                    </td>

                    <td style={{ padding: '14px', fontWeight: '700', color: '#334155' }}>
                      {cat.views}
                    </td>

                    <td style={{ padding: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: 1, height: '6px', background: '#f1f5f9', borderRadius: '3px', width: '50px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${cat.tryRate * 2}%`, background: '#9333ea', borderRadius: '3px' }} />
                        </div>
                        <span style={{ fontWeight: '850', color: '#9333ea' }}>%{cat.tryRate}</span>
                      </div>
                    </td>

                    <td style={{ padding: '14px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: cat.isFirst ? '#fefce8' : '#f1f5f9',
                        color: cat.isFirst ? '#854d0e' : '#475569',
                        fontSize: '0.72rem',
                        fontWeight: '800',
                        border: cat.isFirst ? '1px solid #fef08a' : '1px solid #e2e8f0'
                      }}>
                        {cat.isFirst ? '🏆' : '🥈'} {cat.rank}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '4px' }}>
            <button
              type="button"
              onClick={handleDownloadReport}
              style={{
                fontSize: '0.75rem',
                color: '#9333ea',
                fontWeight: '700',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              Yönetim Kurulu Brifingi Olarak Yazdır <ArrowRight size={13} />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
