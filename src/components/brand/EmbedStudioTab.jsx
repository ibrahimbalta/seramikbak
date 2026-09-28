'use client';

import React, { useState } from 'react';
import { 
  Box, Copy, Check, ExternalLink, Sparkles, Monitor, Smartphone, 
  Code, Eye, Sliders, ShieldCheck, CheckCircle2, QrCode
} from 'lucide-react';
import { slugify } from '@/lib/slugify';

export default function EmbedStudioTab({ brandInfo }) {
  const brandName = brandInfo?.name || 'VitrA';
  const brandSlug = brandInfo?.slug || slugify(brandName);

  const [themeColor, setThemeColor] = useState('#d4af37');
  const [defaultScene, setDefaultScene] = useState('banyo');
  const [allowFilterOtherBrands, setAllowFilterOtherBrands] = useState(false);
  const [activeCodeType, setActiveCodeType] = useState('iframe'); // 'iframe' | 'sdk' | 'kiosk'
  const [copied, setCopied] = useState(false);

  // Dynamic URLs
  const baseUrl = 'https://www.seramikbak.com';
  const embedUrl = `${baseUrl}/ilham?brand=${brandSlug}&scene=${defaultScene}&embed=true&color=${encodeURIComponent(themeColor)}`;
  const kioskUrl = `${baseUrl}/kiosk?brand=${brandSlug}&theme=${encodeURIComponent(themeColor)}`;

  // Code snippets
  const iframeSnippet = `<!-- SeramikBak 3D Room Visualizer Embed for ${brandName} -->
<iframe 
  src="${embedUrl}" 
  width="100%" 
  height="750px" 
  frameborder="0" 
  style="border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 10px 30px rgba(0,0,0,0.08);"
  allow="camera; accelerometer; gyroscope"
  loading="lazy"
></iframe>`;

  const sdkSnippet = `<!-- SeramikBak 3D Visualizer JavaScript SDK Modal -->
<div id="seramikbak-visualizer-btn"></div>
<script 
  src="${baseUrl}/studio-sdk.js" 
  data-brand="${brandSlug}" 
  data-theme="${themeColor}" 
  data-scene="${defaultScene}" 
  async
></script>
<!-- Butona tıklandığında markanızın 3D Sanal Stüdyosu modal olarak açılır -->`;

  const kioskSnippet = `<!-- Showroom Dokunmatik Kiosk Ekran Doğrudan Başlatıcı -->
URL: ${kioskUrl}
(Showroom dikey/yatay dokunmatik ekranlarınızda tarayıcıyı Kiosk / F11 tam ekran modunda açın)`;

  const currentSnippet = activeCodeType === 'iframe' 
    ? iframeSnippet 
    : activeCodeType === 'sdk' 
      ? sdkSnippet 
      : kioskSnippet;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Value Banner */}
      <div className="rounded-2xl p-6 md:p-8 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border border-amber-500/20 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Yıllık $25,000+ Yazılım Tasarrufu</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            White-Label 3D Sanal Stüdyo & Showroom Kiosk Entegrasyonu
          </h2>
          <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
            {brandName} resmi web sitenize veya yetkili bayi showroomlarınızdaki dokunmatik kiosk ekranlarına tek satır kodla SeramikBak WebAR & 3D Stüdyosu'nu entegre edin. Müşterileriniz ve mimarlar sadece sizin ürünlerinizi canlı mekana giydirsin.
          </p>
        </div>

        <div className="flex flex-col gap-2 shrink-0">
          <a
            href={kioskUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10"
          >
            <Monitor className="w-4 h-4" />
            <span>Kiosk Modunu Canlı Başlat</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <span className="text-[11px] text-slate-400 text-center">Tüm showroomlar için ücretsiz</span>
        </div>
      </div>

      {/* Configuration & Code Generator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Customization Controls */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-500" />
              <span>Görselleştirici Özelleştirme Ayarları</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">
                Marka Kurumsal Rengi (Vurgu Rengi)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={themeColor}
                  onChange={(e) => setThemeColor(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-slate-300 p-0.5"
                />
                <span className="text-xs font-mono font-bold text-slate-700">{themeColor}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">
                Varsayılan Açılış Sahnesi
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'banyo', label: 'Modern Banyo' },
                  { id: 'mutfak', label: 'Ada Mutfak' },
                  { id: 'salon', label: 'Geniş Salon' },
                  { id: 'teras', label: 'Açık Teras' }
                ].map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setDefaultScene(s.id)}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border text-center transition-all ${
                      defaultScene === s.id
                        ? 'border-amber-500 bg-amber-50 text-amber-800'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-800">Sadece {brandName} Ürünleri Gösterilsin</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Rakiplerin modelleri arama ve menüde kapatılır</div>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 font-bold">
                Aktif ✓
              </span>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="text-xs font-bold text-slate-800 mb-1">Entegrasyon Tipi Seçin:</div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveCodeType('iframe')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                    activeCodeType === 'iframe'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Iframe Embed
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCodeType('sdk')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                    activeCodeType === 'sdk'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  JS Modal SDK
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCodeType('kiosk')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                    activeCodeType === 'kiosk'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Kiosk Ekranı
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Generated Code & Instructions */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Code className="w-4 h-4 text-sky-500" />
                <span>Web Sitenize Ekleyeceğiniz Kod</span>
              </h3>
              <button
                type="button"
                onClick={handleCopy}
                className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Kopyalandı!' : 'Kodu Kopyala'}</span>
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed border border-slate-800">
              {currentSnippet}
            </pre>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Mobil uyumlu (iOS & Android tam uyumlu)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>WebAR ile telefonda canlı mekana yansıtma</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Sıfır sunucu yükü (SeramikBak CDN ile beslenir)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Bayi teklif formları doğrudan panelinize akar</span>
              </div>
            </div>
          </div>

          {/* Showroom Kiosk Info Box */}
          <div className="p-6 rounded-2xl bg-amber-50/50 border border-amber-200/80 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Showroom Mağazalarında QR Kod ile Telefona Aktarma</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Showroom kiosk ekranında tasarlanan oda, müşterinin telefonuna tek tıkla QR kod ile aktarılır. Müşteri evine gittiğinde banyosunda veya mutfağında tasarladığı {brandName} seramiklerini görmeye devam eder ve karar süreci %60 kısalır.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
