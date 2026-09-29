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

  // Dynamic URLs and Origin Detection
  const [baseUrl, setBaseUrl] = useState('https://www.seramikbak.com');
  const [livePreviewActive, setLivePreviewActive] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.location.origin) {
      setBaseUrl(window.location.origin);
    }
  }, []);

  const embedUrl = `${baseUrl}/kiosk?brand=${encodeURIComponent(brandSlug)}&embed=true&scene=${encodeURIComponent(defaultScene)}&theme=${encodeURIComponent(themeColor)}`;
  const kioskUrl = `${baseUrl}/kiosk?brand=${encodeURIComponent(brandSlug)}&theme=${encodeURIComponent(themeColor)}`;

  // Code snippets
  const iframeSnippet = `<!-- SeramikBak White-Label 3D Visualizer Iframe Embed for ${brandName} -->
<div style="position: relative; width: 100%; height: 780px; max-width: 1440px; margin: 0 auto; border-radius: 16px; overflow: hidden; box-shadow: 0 16px 48px rgba(0,0,0,0.18);">
  <iframe 
    src="${embedUrl}" 
    width="100%" 
    height="100%" 
    style="border: none; width: 100%; height: 100%; display: block;"
    allow="camera; accelerometer; gyroscope; fullscreen"
    loading="lazy"
    title="${brandName} 3D Seramik Stüdyosu"
  ></iframe>
</div>`;

  const reactSnippet = `// React / Next.js Component for ${brandName}
'use client';
import React from 'react';

export default function BrandTileVisualizer() {
  return (
    <div className="w-full h-[780px] max-w-7xl mx-auto rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-950">
      <iframe
        src="${embedUrl}"
        className="w-full h-full border-0 block"
        allow="camera; accelerometer; gyroscope; fullscreen"
        loading="lazy"
        title="${brandName} 3D Seramik Stüdyosu"
      />
    </div>
  );
}`;

  const sdkSnippet = `<!-- 1. Tetikleyici Buton (Web sitenizde dilediğiniz yere yerleştirin) -->
<button 
  id="open-${brandSlug}-visualizer" 
  style="background: linear-gradient(135deg, ${themeColor} 0%, #aa8c2c 100%); color: #0b0f19; padding: 14px 28px; border-radius: 12px; font-weight: 800; font-size: 15px; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 10px; box-shadow: 0 6px 20px ${themeColor}40;"
>
  ✨ ${brandName} 3D Mekanında Gör
</button>

<!-- 2. SeramikBak 3D Studio SDK (Sayfanın </body> etiketinden hemen önce ekleyin) -->
<script 
  src="${baseUrl}/studio-sdk.js" 
  data-brand="${brandSlug}" 
  data-theme="${themeColor}" 
  data-scene="${defaultScene}" 
  data-button-id="open-${brandSlug}-visualizer" 
  async
></script>`;

  const kioskSnippet = `Showroom Kiosk URL (Dokunmatik Ekranlar & Mağaza İçi TV):
${kioskUrl}

Kurulum Tavsiyesi:
Showroom kiosk bilgisayarınızda (Windows / Android / Linux) Google Chrome veya Microsoft Edge tarayıcısını F11 (Kiosk Mode) ile başlatıp bu adresi ana sayfa yapınız.`;

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

  const handleDownloadTestHtml = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${brandName} - 3D Seramik Visualizer Entegrasyon Testi</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #0f172a;
      color: #f8fafc;
      margin: 0;
      padding: 32px 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-height: 100vh;
      box-sizing: border-box;
    }
    .header {
      max-width: 1200px;
      width: 100%;
      margin-bottom: 24px;
      text-align: center;
    }
    .badge {
      display: inline-block;
      padding: 4px 14px;
      border-radius: 20px;
      background: rgba(212, 175, 55, 0.15);
      border: 1px solid rgba(212, 175, 55, 0.4);
      color: #d4af37;
      font-weight: 800;
      font-size: 12px;
      letter-spacing: 0.05em;
      margin-bottom: 12px;
    }
    h1 {
      margin: 0 0 8px 0;
      font-size: 28px;
    }
    p {
      color: #94a3b8;
      margin: 0 0 24px 0;
      font-size: 15px;
    }
    .demo-actions {
      display: flex;
      gap: 16px;
      justify-content: center;
      margin-bottom: 30px;
      flex-wrap: wrap;
    }
    .sdk-button {
      background: linear-gradient(135deg, ${themeColor} 0%, #aa8c2c 100%);
      color: #0b0f19;
      padding: 14px 28px;
      border-radius: 12px;
      font-weight: 800;
      font-size: 15px;
      border: none;
      cursor: pointer;
      box-shadow: 0 6px 20px ${themeColor}40;
      transition: transform 0.2s;
    }
    .sdk-button:hover {
      transform: translateY(-2px);
    }
    .container {
      max-width: 1280px;
      width: 100%;
      background: #0b0f19;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.1);
      height: 760px;
    }
    iframe {
      width: 100%;
      height: 100%;
      border: none;
      display: block;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="badge">SERAMİKBAK WHITE-LABEL 3D ENTEGRASYON</div>
    <h1>${brandName} 3D Mekan Görselleştirici Test Sayfası</h1>
    <p>Bu dosya web sitenizde ${brandName} 3D görselleştiricisinin nasıl görüneceğini test etmek için üretilmiştir.</p>
    
    <div class="demo-actions">
      <!-- 1. JS SDK Pop-up Modal Test Butonu -->
      <button id="open-${brandSlug}-visualizer" class="sdk-button">
        ✨ Pop-up Modal ile 3D Stüdyoyu Aç (JS SDK)
      </button>
    </div>
  </div>

  <!-- 2. Iframe Doğrudan Gömülü Gösterim -->
  <div class="container">
    <iframe 
      src="${embedUrl}" 
      allow="camera; accelerometer; gyroscope; fullscreen"
      loading="lazy"
      title="${brandName} 3D Sanal Stüdyo"
    ></iframe>
  </div>

  <!-- SeramikBak Studio JavaScript SDK -->
  <script src="${baseUrl}/studio-sdk.js" 
    data-brand="${brandSlug}" 
    data-theme="${themeColor}" 
    data-scene="${defaultScene}" 
    data-button-id="open-${brandSlug}-visualizer" 
    async>
  </script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${brandSlug}-3d-visualizer-test.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  const handleTestModalInPage = () => {
    if (typeof window !== 'undefined') {
      if (window.SeramikBakStudio && window.SeramikBakStudio.open) {
        window.SeramikBakStudio.open({
          brand: brandSlug,
          theme: themeColor,
          scene: defaultScene,
          baseUrl: baseUrl
        });
      } else {
        const script = document.createElement('script');
        script.src = `${baseUrl}/studio-sdk.js`;
        script.onload = () => {
          if (window.SeramikBakStudio) {
            window.SeramikBakStudio.open({
              brand: brandSlug,
              theme: themeColor,
              scene: defaultScene,
              baseUrl: baseUrl
            });
          }
        };
        document.body.appendChild(script);
      }
    }
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

            <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '3px', borderRadius: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setLivePreviewActive(false)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  background: !livePreviewActive ? '#0f172a' : 'transparent',
                  color: !livePreviewActive ? '#ffffff' : '#64748b',
                  fontSize: '0.7rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Monitor size={13} /> Simülatör
              </button>
              <button
                type="button"
                onClick={() => setLivePreviewActive(true)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  background: livePreviewActive ? '#10b981' : 'transparent',
                  color: livePreviewActive ? '#ffffff' : '#64748b',
                  fontSize: '0.7rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Sparkles size={13} /> Canlı 3D Stüdyo
              </button>
            </div>
          </div>

          {/* SIMULATED DEVICE FRAME OR LIVE 3D IFRAME */}
          {livePreviewActive ? (
            <div style={{
              background: '#090d16',
              borderRadius: '16px',
              overflow: 'hidden',
              height: '360px',
              border: '2px solid rgba(212, 175, 55, 0.4)',
              boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.5)',
              position: 'relative'
            }}>
              <iframe
                src={embedUrl}
                style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                allow="camera; accelerometer; gyroscope; fullscreen"
                loading="lazy"
                title={`${brandName} Canlı Önizleme`}
              />
            </div>
          ) : (
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
                      WHITE-LABEL
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
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', maxWidth: '300px', marginTop: '4px' }}>
                    Seçilen Vurgu Rengi: <strong style={{ color: themeColor }}>{themeColor}</strong> • Yalnızca {brandName} Karoları Yüklendi
                  </div>

                  {/* Floating Action within Simulator */}
                  <div style={{
                    position: 'absolute',
                    bottom: '12px',
                    display: 'flex',
                    gap: '8px'
                  }}>
                    <button
                      type="button"
                      onClick={() => setLivePreviewActive(true)}
                      style={{
                        fontSize: '0.68rem',
                        padding: '5px 12px',
                        borderRadius: '20px',
                        background: themeColor,
                        color: '#090d16',
                        fontWeight: '800',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Sparkles size={11} /> Canlı 3D Stüdyoyu Aç
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Test & Action Toolbar */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '6px',
            borderTop: '1px solid #f1f5f9'
          }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleDownloadTestHtml}
                style={{
                  fontSize: '0.74rem',
                  color: '#065f46',
                  background: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  fontWeight: '800',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                {downloaded ? <Check size={13} /> : <Zap size={13} />}
                <span>{downloaded ? 'İndirildi!' : '📥 Test HTML Dosyasını İndir'}</span>
              </button>

              <button
                type="button"
                onClick={handleTestModalInPage}
                style={{
                  fontSize: '0.74rem',
                  color: '#1e293b',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  fontWeight: '800',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <Sparkles size={13} color="#d4af37" />
                <span>Modalı Test Et</span>
              </button>
            </div>

            <a
              href={embedUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '0.74rem',
                color: '#0284c7',
                fontWeight: '700',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                textDecoration: 'none'
              }}
            >
              Yeni Sekmede Aç <ExternalLink size={13} />
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
