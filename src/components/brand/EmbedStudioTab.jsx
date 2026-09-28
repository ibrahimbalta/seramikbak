'use client';

import React, { useState } from 'react';
import { 
  Box, Copy, Check, ExternalLink, Sparkles, Monitor, Smartphone, 
  Code, Eye, Sliders, ShieldCheck, CheckCircle2, QrCode, Layers,
  Palette, RefreshCw, Maximize2, Shield, ArrowRight, Zap, CheckCircle
} from 'lucide-react';
import { slugify } from '@/lib/slugify';

export default function EmbedStudioTab({ brandInfo }) {
  const brandName = brandInfo?.name || 'Güral Seramik';
  const brandSlug = brandInfo?.slug || slugify(brandName);

  const [themeColor, setThemeColor] = useState('#d4af37');
  const [defaultScene, setDefaultScene] = useState('banyo');
  const [deviceView, setDeviceView] = useState('tablet'); // 'tablet' | 'kiosk'
  const [activeCodeType, setActiveCodeType] = useState('iframe'); // 'iframe' | 'react' | 'sdk' | 'kiosk'
  const [copied, setCopied] = useState(false);

  // Preset luxury brand colors
  const colorPresets = [
    { label: 'Vurgu Altın', hex: '#d4af37' },
    { label: 'Obsidyen Siyah', hex: '#0f172a' },
    { label: 'Kraliyet Mavisi', hex: '#1d4ed8' },
    { label: 'İtalyan Terracotta', hex: '#c2410c' },
    { label: 'Doğal Adaçayı', hex: '#047857' },
    { label: 'Platin Gri', hex: '#475569' }
  ];

  const scenes = [
    { id: 'banyo', label: 'Modern Ebeveyn Banyosu', tag: 'En Popüler', icon: '🛁', desc: '60x120 & Mat Calacatta mermer kaplama' },
    { id: 'mutfak', label: 'Ada Tezgahlı Açık Mutfak', tag: 'Trend', icon: '🍳', desc: '80x80 & Parlak Statuario zemin' },
    { id: 'salon', label: 'Geniş Loft Salon', tag: 'Büyük Ebat', icon: '🛋️', desc: '120x240 Dev Slab porselen' },
    { id: 'teras', label: 'Açık Teras & Havuz Kenarı', tag: '20mm Kalın', icon: '☀️', desc: '60x60 Dona Dayanıklı R11 kaydırmaz' }
  ];

  // Dynamic URLs
  const baseUrl = 'https://www.seramikbak.com';
  const embedUrl = `${baseUrl}/ilham?brand=${encodeURIComponent(brandSlug)}&scene=${encodeURIComponent(defaultScene)}&embed=true&color=${encodeURIComponent(themeColor)}`;
  const kioskUrl = `${baseUrl}/kiosk?brand=${encodeURIComponent(brandSlug)}&theme=${encodeURIComponent(themeColor)}`;

  // Code snippets
  const iframeSnippet = `<!-- SeramikBak 3D Room Visualizer Iframe Embed for ${brandName} -->
<iframe 
  src="${embedUrl}" 
  width="100%" 
  height="780" 
  style="border: none; border-radius: 16px; box-shadow: 0 12px 36px rgba(0,0,0,0.08);"
  allow="camera; accelerometer; gyroscope; fullscreen"
  loading="lazy"
></iframe>`;

  const reactSnippet = `// React / Next.js Component for ${brandName}
import React from 'react';

export default function BrandTileVisualizer() {
  return (
    <div className="w-full rounded-2xl overflow-hidden shadow-2xl border border-slate-200 aspect-[16/10]">
      <iframe
        src="${embedUrl}"
        className="w-full h-full border-0"
        allow="camera; accelerometer; gyroscope; fullscreen"
        loading="lazy"
        title="${brandName} 3D Seramik Stüdyosu"
      />
    </div>
  );
}`;

  const sdkSnippet = `<!-- SeramikBak 3D Visualizer JavaScript SDK Modal -->
<button id="open-${brandSlug}-visualizer" style="background:${themeColor}; color:#fff; padding:12px 24px; border-radius:10px; font-weight:700; border:none; cursor:pointer;">
  🏠 ${brandName} Karolarını Mekanında Canlı Gör (3D)
</button>

<script src="${baseUrl}/studio-sdk.js" data-brand="${brandSlug}" data-theme="${themeColor}" data-scene="${defaultScene}" async></script>`;

  const kioskSnippet = `<!-- Showroom Dikey / Yatay Dokunmatik Kiosk Doğrudan Başlatıcı -->
Doğrudan Kiosk Tarayıcı URL:
${kioskUrl}

Tavsiye: Showroom kiosk bilgisayarınızda Chrome/Edge tarayıcısını F11 (Kiosk Mode) ile açarak ana sayfa olarak bu linki tanımlayın.`;

  const currentSnippet = activeCodeType === 'iframe' 
    ? iframeSnippet 
    : activeCodeType === 'react'
      ? reactSnippet
      : activeCodeType === 'sdk' 
        ? sdkSnippet 
        : kioskSnippet;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* -------------------- 1. EXECUTIVE HERO BANNER -------------------- */}
      <div style={{
        background: 'linear-gradient(135deg, #090d16 0%, #111827 50%, #1e293b 100%)',
        borderRadius: '20px',
        padding: '28px 32px',
        color: '#ffffff',
        border: '1px solid rgba(212, 175, 55, 0.25)',
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
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, transparent 70%)',
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
              background: 'rgba(212, 175, 55, 0.15)',
              border: '1px solid rgba(212, 175, 55, 0.35)',
              color: '#d4af37',
              fontSize: '0.75rem',
              fontWeight: '800',
              letterSpacing: '0.5px'
            }}>
              <Sparkles size={13} />
              Yıllık $25,000+ Yazılım & Ar-Ge Tasarrufu
            </span>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '4px 10px',
              borderRadius: '20px',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#34d399',
              fontSize: '0.72rem',
              fontWeight: '700'
            }}>
              <CheckCircle size={12} />
              White-Label SDK Dahil
            </span>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '4px 10px',
              borderRadius: '20px',
              background: 'rgba(56, 189, 248, 0.12)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              color: '#38bdf8',
              fontSize: '0.72rem',
              fontWeight: '700'
            }}>
              <Zap size={12} />
              60 FPS WebGL / WebAR
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
            White-Label 3D Sanal Stüdyo & Showroom Kiosk Entegrasyonu
          </h2>
          <p style={{
            fontSize: '0.85rem',
            color: '#94a3b8',
            margin: 0,
            lineHeight: '1.6'
          }}>
            {brandName} resmi web sitenize veya yetkili bayi showroomlarınızdaki dokunmatik kiosk ekranlarına tek satır kodla SeramikBak 3D Stüdyosu'nu entegre edin. Müşterileriniz ve mimarlar sadece sizin ürünlerinizi canlı mekana giydirsin.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative', zIndex: 1, minWidth: '220px' }}>
          <a
            href={kioskUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '12px 20px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #d4af37 0%, #b38e47 100%)',
              color: '#090d16',
              fontWeight: '800',
              fontSize: '0.82rem',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              textDecoration: 'none',
              boxShadow: '0 8px 20px rgba(212, 175, 55, 0.3)',
              transition: 'transform 0.15s ease'
            }}
          >
            <Monitor size={16} />
            <span>Kiosk Modunu Canlı Başlat</span>
            <ExternalLink size={14} />
          </a>
          <span style={{ fontSize: '0.7rem', color: '#64748b', textAlign: 'center' }}>
            Yetkili bayiler & showroomlar için sınırsız
          </span>
        </div>
      </div>

      {/* -------------------- 2. INTERACTIVE WORKBENCH: CONTROLS & LIVE SIMULATOR -------------------- */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '24px'
      }}>
        
        {/* LEFT COLUMN: CUSTOMIZATION CONSOLE */}
        <div style={{
          background: '#ffffff',
          borderRadius: '18px',
          border: '1px solid #e2e8f0',
          padding: '24px',
          boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(212, 175, 55, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b45309' }}>
                <Sliders size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Görselleştirici Özelleştirme</h3>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Markanızın kurumsal kimliğine göre uyarlayın</span>
              </div>
            </div>
            <span style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: '6px', background: '#f1f5f9', color: '#475569', fontWeight: '700' }}>
              Canlı Önizleme
            </span>
          </div>

          {/* Color Picker with Luxury Presets */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>
              Marka Kurumsal Rengi (Vurgu & Butonlar)
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <input
                type="color"
                value={themeColor}
                onChange={(e) => setThemeColor(e.target.value)}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  border: '2px solid #e2e8f0',
                  cursor: 'pointer',
                  padding: '2px',
                  background: 'none'
                }}
              />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '800', fontFamily: 'monospace', color: '#0f172a' }}>{themeColor}</span>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Tüm 3D arayüz butonları bu renkle boyanır</span>
              </div>
            </div>

            {/* Presets */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {colorPresets.map(preset => (
                <button
                  key={preset.hex}
                  type="button"
                  onClick={() => setThemeColor(preset.hex)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    border: themeColor === preset.hex ? '1.5px solid #0f172a' : '1px solid #e2e8f0',
                    background: themeColor === preset.hex ? '#f8fafc' : '#ffffff',
                    fontSize: '0.72rem',
                    fontWeight: themeColor === preset.hex ? '800' : '600',
                    color: '#334155',
                    cursor: 'pointer'
                  }}
                >
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: preset.hex, display: 'inline-block' }} />
                  <span>{preset.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Scene Selection Cards */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>
              Varsayılan Açılış Sahnesi
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {scenes.map(s => {
                const isSelected = defaultScene === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setDefaultScene(s.id)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: isSelected ? `2px solid ${themeColor}` : '1px solid #e2e8f0',
                      background: isSelected ? 'rgba(212, 175, 55, 0.05)' : '#ffffff',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '1.2rem' }}>{s.icon}</span>
                      <span style={{ fontSize: '0.62rem', padding: '2px 6px', borderRadius: '4px', background: isSelected ? '#0f172a' : '#f1f5f9', color: isSelected ? '#ffffff' : '#64748b', fontWeight: '700' }}>
                        {s.tag}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', fontWeight: '800', color: isSelected ? '#0f172a' : '#334155' }}>
                      {s.label}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '2px', lineHeight: '1.3' }}>
                      {s.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Catalog Isolation Shield */}
          <div style={{
            padding: '14px 16px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
            border: '1px solid #bbf7d0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <ShieldCheck size={16} />
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#065f46' }}>
                  Katalog İzolasyonu (%100 Sadece {brandName})
                </div>
                <div style={{ fontSize: '0.68rem', color: '#047857', marginTop: '1px' }}>
                  Rakip markaların modelleri, reklamları ve önerileri tamamen gizlenir.
                </div>
              </div>
            </div>
            <span style={{
              fontSize: '0.68rem',
              fontWeight: '800',
              padding: '3px 8px',
              borderRadius: '6px',
              background: '#059669',
              color: '#ffffff',
              letterSpacing: '0.5px'
            }}>
              AKTİF
            </span>
          </div>

          {/* Integration Type Switcher */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>
              Entegrasyon Formatı
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
              {[
                { id: 'iframe', label: 'Iframe' },
                { id: 'react', label: 'React / Next' },
                { id: 'sdk', label: 'JS SDK' },
                { id: 'kiosk', label: 'Kiosk Link' }
              ].map(tab => {
                const isActive = activeCodeType === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveCodeType(tab.id)}
                    style={{
                      padding: '8px 6px',
                      borderRadius: '8px',
                      border: isActive ? '1.5px solid #0f172a' : '1px solid #e2e8f0',
                      background: isActive ? '#0f172a' : '#f8fafc',
                      color: isActive ? '#ffffff' : '#475569',
                      fontSize: '0.73rem',
                      fontWeight: isActive ? '800' : '600',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE SIMULATOR DISPLAY */}
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
                <Eye size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Canlı Cihaz Simülatörü</h3>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Seçtiğiniz ayarlarla anlık 3D oda simülasyonu</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '3px', borderRadius: '8px' }}>
              <button
                type="button"
                onClick={() => setDeviceView('tablet')}
                style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: 'none',
                  background: deviceView === 'tablet' ? '#ffffff' : 'transparent',
                  color: deviceView === 'tablet' ? '#0f172a' : '#64748b',
                  fontSize: '0.7rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  boxShadow: deviceView === 'tablet' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                <Monitor size={13} /> Tablet
              </button>
              <button
                type="button"
                onClick={() => setDeviceView('kiosk')}
                style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: 'none',
                  background: deviceView === 'kiosk' ? '#ffffff' : 'transparent',
                  color: deviceView === 'kiosk' ? '#0f172a' : '#64748b',
                  fontSize: '0.7rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  boxShadow: deviceView === 'kiosk' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                <Smartphone size={13} /> Dikey Kiosk
              </button>
            </div>
          </div>

          {/* SIMULATED DEVICE FRAME */}
          <div style={{
            background: '#090d16',
            borderRadius: '16px',
            padding: deviceView === 'tablet' ? '12px' : '16px 36px',
            border: '2px solid #1e293b',
            boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.4)',
            position: 'relative'
          }}>
            {/* Screen Inner Frame */}
            <div style={{
              background: '#111827',
              borderRadius: '10px',
              overflow: 'hidden',
              height: '280px',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative'
            }}>
              {/* Virtual App Header */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.95)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '8px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: '#fff',
                fontSize: '0.72rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: themeColor }} />
                  <span style={{ fontWeight: '800', letterSpacing: '0.5px' }}>{brandName} 3D STÜDYO</span>
                </div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.62rem', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px', color: '#94a3b8' }}>
                    {defaultScene.toUpperCase()} SAHNESİ
                  </span>
                  <span style={{ fontSize: '0.62rem', background: themeColor, color: '#090d16', padding: '2px 6px', borderRadius: '4px', fontWeight: '800' }}>
                    CANLI AR
                  </span>
                </div>
              </div>

              {/* Virtual 3D Room Render View */}
              <div style={{
                flex: 1,
                background: defaultScene === 'banyo' 
                  ? 'radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)'
                  : defaultScene === 'mutfak'
                    ? 'radial-gradient(circle at center, #334155 0%, #0f172a 100%)'
                    : 'radial-gradient(circle at center, #182030 0%, #090d16 100%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                padding: '16px',
                textAlign: 'center',
                position: 'relative'
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>
                  {defaultScene === 'banyo' ? '🛁' : defaultScene === 'mutfak' ? '🍳' : defaultScene === 'salon' ? '🛋️' : '☀️'}
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#ffffff' }}>
                  {brandName} 3D Sanal Mekan Motoru
                </div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', maxWidth: '280px', marginTop: '4px' }}>
                  Seçilen Vurgu Rengi: <strong style={{ color: themeColor }}>{themeColor}</strong> • Yalnızca {brandName} Karoları Yüklendi
                </div>

                {/* Floating Tile Swatches Bar inside Simulator */}
                <div style={{
                  position: 'absolute',
                  bottom: '12px',
                  display: 'flex',
                  gap: '8px',
                  background: 'rgba(15, 23, 42, 0.85)',
                  backdropFilter: 'blur(8px)',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  {['Calacatta 60x120', 'Traverten Mat', 'Beton Antrasit'].map((tile, i) => (
                    <span key={tile} style={{
                      fontSize: '0.62rem',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      background: i === 0 ? themeColor : 'rgba(255, 255, 255, 0.08)',
                      color: i === 0 ? '#090d16' : '#cbd5e1',
                      fontWeight: i === 0 ? '800' : '600'
                    }}>
                      {tile}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px' }}>
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
              💡 Önizleme iframe & WebGL donanım ivmeli çalışır.
            </span>
            <a
              href={embedUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '0.75rem',
                color: '#0284c7',
                fontWeight: '700',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                textDecoration: 'none'
              }}
            >
              Tam Ekranda Test Et <ArrowRight size={13} />
            </a>
          </div>
        </div>

      </div>

      {/* -------------------- 3. CODE SNIPPET TERMINAL (DARK IDE STYLE) -------------------- */}
      <div style={{
        background: '#ffffff',
        borderRadius: '18px',
        border: '1px solid #e2e8f0',
        padding: '24px',
        boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5' }}>
              <Code size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                {activeCodeType === 'iframe' && 'Iframe Entegrasyon Kodu'}
                {activeCodeType === 'react' && 'React / Next.js Component Kodu'}
                {activeCodeType === 'sdk' && 'JavaScript Pop-up SDK Kodu'}
                {activeCodeType === 'kiosk' && 'Showroom Kiosk Ekran Başlatıcı'}
              </h3>
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                Kopyalayıp web sitenize veya kiosk tarayıcısına doğrudan yapıştırın
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '10px',
              background: copied ? '#10b981' : '#0f172a',
              color: '#ffffff',
              fontSize: '0.78rem',
              fontWeight: '800',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'background 0.2s'
            }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? 'Koda Kopyalandı!' : 'Kodu Kopyala'}</span>
          </button>
        </div>

        {/* Dark IDE Window */}
        <div style={{
          background: '#090d16',
          borderRadius: '12px',
          border: '1px solid #1e293b',
          overflow: 'hidden'
        }}>
          {/* Mac OS Window Header */}
          <div style={{
            background: '#111827',
            padding: '8px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
            </div>
            <span style={{ fontSize: '0.68rem', fontFamily: 'monospace', color: '#64748b', marginLeft: '6px' }}>
              {activeCodeType === 'iframe' && 'embed-visualizer.html'}
              {activeCodeType === 'react' && 'BrandVisualizer.jsx'}
              {activeCodeType === 'sdk' && 'studio-sdk-modal.html'}
              {activeCodeType === 'kiosk' && 'kiosk-config.txt'}
            </span>
          </div>

          <pre style={{
            padding: '16px 20px',
            margin: 0,
            fontSize: '0.78rem',
            fontFamily: 'Consolas, Monaco, "Courier New", monospace',
            color: '#e2e8f0',
            lineHeight: '1.6',
            overflowX: 'auto',
            whiteSpace: 'pre-wrap'
          }}>
            {currentSnippet}
          </pre>
        </div>

        {/* Feature Checkpoints */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '12px',
          marginTop: '16px',
          paddingTop: '16px',
          borderTop: '1px solid #f1f5f9'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#475569' }}>
            <CheckCircle2 size={16} style={{ color: '#10b981', flexShrink: 0 }} />
            <span>Mobil & Tablet tam responsive (iOS & Android)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#475569' }}>
            <CheckCircle2 size={16} style={{ color: '#10b981', flexShrink: 0 }} />
            <span>WebAR: Müşteri telefonuyla odayı canlı tarar</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#475569' }}>
            <CheckCircle2 size={16} style={{ color: '#10b981', flexShrink: 0 }} />
            <span>Sıfır Sunucu Maliyeti (SeramikBak CDN)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#475569' }}>
            <CheckCircle2 size={16} style={{ color: '#10b981', flexShrink: 0 }} />
            <span>Alınan tüm teklif formları bu panele düşer</span>
          </div>
        </div>
      </div>

      {/* -------------------- 4. SHOWROOM TO SMARTPHONE HAND-OFF CARD -------------------- */}
      <div style={{
        background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
        borderRadius: '18px',
        border: '1px solid #fde68a',
        padding: '22px 26px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '18px'
      }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          background: 'rgba(217, 119, 6, 0.15)',
          color: '#b45309',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <QrCode size={24} />
        </div>
        <div>
          <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#78350f', margin: '0 0 4px 0' }}>
            Showroom Mağazalarında QR Kod ile Müşterinin Telefonuna Aktarma
          </h4>
          <p style={{ fontSize: '0.78rem', color: '#92400e', margin: 0, lineHeight: '1.55' }}>
            Showroom kiosk ekranında tasarlanan oda, müşterinin telefonuna tek tıkla QR kod ile aktarılır. Müşteri evine gittiğinde banyosunda veya mutfağında tasarladığı {brandName} seramiklerini görmeye devam eder ve karar süreci %60 oranında kısalır.
          </p>
        </div>
      </div>

    </div>
  );
}
