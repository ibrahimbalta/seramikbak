'use client';

import React, { useState, useRef } from 'react';
import {
  Upload,
  Link as LinkIcon,
  X,
  Check,
  RefreshCw,
  Image as ImageIcon,
  Layers,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { optimizeImageForCatalog, uploadBrandImage } from '@/utils/imageCutout';

export default function ImageUploadWithCutout({
  label = 'Görsel Yükle',
  description = 'Bilgisayarınızdan yerel görsel seçebilir veya doğrudan bağlantı ekleyebilirsiniz.',
  value = '',
  onChange,
  defaultUrl = '',
  defaultLabel = 'Varsayılanı Kullan',
  isLogo = false,
  folder = 'seramikbak/catalogs',
  recommendedAspect = 'Kare veya Yatay Logo'
}) {
  const [activeTab, setActiveTab] = useState('local'); // 'local' | 'url'
  const [urlInput, setUrlInput] = useState(value || '');
  const [processing, setProcessing] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  const fileInputRef = useRef(null);

  // Sync internal URL state with external value
  React.useEffect(() => {
    setUrlInput(value || '');
  }, [value]);

  // Handle local file selection - NO BACKGROUND DELETION, 100% QUALITY PRESERVED
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProcessing(true);
    setPreviewError(false);

    try {
      // 1. Optimize image resolution for high-end web catalog WITHOUT deleting background
      const optimized = await optimizeImageForCatalog(file, {
        maxWidth: isLogo ? 800 : 1920,
        maxHeight: isLogo ? 600 : 1440,
        quality: 0.94,
        isLogo: isLogo
      });

      // 2. Upload to server (Cloudinary or local public storage)
      const sanitizedName = file.name ? file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_\-]/g, '_') : 'catalog_asset';
      const ext = isLogo ? 'png' : 'webp';
      const remoteUrl = await uploadBrandImage(optimized.dataUrl, `${sanitizedName}_optimized.${ext}`, folder);

      onChange(remoteUrl);
      setUrlInput(remoteUrl);
    } catch (err) {
      console.error('Görsel işleme hatası:', err);
      alert('Görsel işlenirken bir sorun oluştu: ' + (err.message || 'Bilinmeyen hata'));
    } finally {
      setProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Clear current image
  const handleClear = () => {
    onChange('');
    setUrlInput('');
    setPreviewError(false);
  };

  // Use default
  const handleUseDefault = () => {
    if (defaultUrl) {
      onChange(defaultUrl);
      setUrlInput(defaultUrl);
    }
  };

  return (
    <div className="space-y-3.5 p-4 sm:p-5 rounded-2xl bg-stone-50/90 border border-stone-200/90 shadow-2xs">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-stone-200/70">
        <div>
          <label className="text-xs sm:text-sm font-bold text-stone-900 uppercase tracking-wide flex items-center gap-2">
            {isLogo ? <Layers size={16} className="text-amber-600" /> : <ImageIcon size={16} className="text-amber-600" />}
            <span>{label}</span>
          </label>
          {description && (
            <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {/* Tab switch (Local / URL) */}
        <div className="flex items-center gap-1 bg-stone-200/70 p-1 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('local')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'local'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Upload size={13} />
            <span>Bilgisayardan Yükle</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'url'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <LinkIcon size={13} />
            <span>Bağlantı (URL)</span>
          </button>
        </div>
      </div>

      {/* Main Upload / Input Area */}
      <div className="space-y-3">
        {activeTab === 'local' ? (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              onChange={handleFileChange}
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer border-2 border-dashed border-stone-300 hover:border-amber-500 bg-white hover:bg-amber-50/20 transition-all rounded-xl p-5 text-center flex flex-col items-center justify-center gap-2 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs">
                {processing ? (
                  <RefreshCw size={22} className="animate-spin text-amber-600" />
                ) : (
                  <Upload size={22} />
                )}
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-stone-800">
                  {processing ? 'Görsel İşleniyor & Optimize Ediliyor...' : 'Bilgisayarınızdan Görsel Seçin veya Sürükleyin'}
                </p>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  PNG, JPG, WebP veya SVG • {recommendedAspect}
                </p>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-100 text-stone-700 rounded-full text-[11px] font-medium mt-1">
                <ShieldCheck size={12} className="text-emerald-600" />
                <span>Orijinal görsel dokusu, renkleri ve arka planı tam korunur</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => {
                setUrlInput(e.target.value);
                onChange(e.target.value);
              }}
              placeholder="https://... görsel bağlantısını yapıştırın"
              className="w-full h-11 px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-sm text-stone-900 outline-none focus:border-amber-600 focus:ring-4 focus:ring-amber-500/10 transition shadow-2xs"
            />
          </div>
        )}

        {/* Live Preview Box - Styled to show how it fits seamlessly into the catalog */}
        {value ? (
          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold text-stone-900">
                  {isLogo ? 'Katalog Logo Rozeti' : 'Katalog Görseli (Şablona Uyarlanmış)'}
                </span>
                <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md font-medium">
                  Doğal Arka Plan Korundu
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-semibold text-amber-700 hover:text-amber-800 hover:underline"
                >
                  Değiştir
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title="Görseli Kaldır"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* PREVIEW CONTAINER: Fits the real catalog lookbook frame */}
            {isLogo ? (
              /* Logo Preview: Rendered exactly like the top showroom header badge */
              <div className="flex items-center gap-4 p-3 bg-stone-100/70 rounded-xl">
                <div className="h-12 min-w-[120px] max-w-[200px] bg-white border border-stone-200 rounded-xl px-3 py-1.5 shadow-xs flex items-center justify-center">
                  {!previewError ? (
                    <img
                      src={value}
                      alt="Logo Önizleme"
                      className="max-h-full max-w-full object-contain"
                      onError={() => setPreviewError(true)}
                    />
                  ) : (
                    <span className="text-[11px] text-stone-400">Yüklenemedi</span>
                  )}
                </div>
                <div className="text-xs text-stone-600 leading-snug">
                  <p className="font-semibold text-stone-900">Katalog Üst Bar & Kapak Uyumu</p>
                  <p className="text-[11px] text-stone-400">
                    Logonuz beyaz veya renkli zemin fark etmeksizin lüks mimari çerçeve içine kusursuz oturur, sırıtmaz.
                  </p>
                </div>
              </div>
            ) : (
              /* Cover / Room Photo Preview: Rendered with architectural framing and subtle vignette */
              <div className="relative w-full h-44 sm:h-52 rounded-xl overflow-hidden border border-stone-200 bg-stone-900 shadow-inner group">
                {!previewError ? (
                  <>
                    <img
                      src={value}
                      alt="Kapak Görseli Önizleme"
                      className="w-full h-full object-cover object-center"
                      onError={() => setPreviewError(true)}
                    />
                    {/* Architectural gradient overlay matching Lookbook standards */}
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/25 to-transparent pointer-events-none" />

                    {/* Simulation badge so user sees realistic catalog look */}
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-stone-900/80 backdrop-blur-md border border-white/20 text-white text-[10px] font-mono tracking-wider flex items-center gap-1.5 shadow-md">
                      <Sparkles size={11} className="text-amber-400" />
                      <span>MİMARİ LOOKBOOK KAPAK GÖRÜNÜMÜ</span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <span className="text-[10px] uppercase font-mono tracking-widest text-amber-300 font-bold block mb-0.5">
                        ŞABLON KATALOG EDİTÖRÜ
                      </span>
                      <p className="text-xs font-semibold text-white/90 drop-shadow">
                        Görsel orantılı ölçeklendi, mimari gradyan ile başlıkların altında sırıtmadan bütünleşti.
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-stone-400">
                    Görsel yüklenemedi veya geçersiz URL.
                  </div>
                )}
              </div>
            )}
          </div>
        ) : defaultUrl ? (
          <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
            <span className="text-xs text-stone-600">
              Şu an varsayılan profil görseli kullanılacaktır.
            </span>
            <button
              type="button"
              onClick={handleUseDefault}
              className="text-xs font-bold text-amber-700 hover:text-amber-800 underline"
            >
              {defaultLabel}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
