'use client';

import React, { useState, useRef } from 'react';
import {
  Upload,
  Sparkles,
  Link as LinkIcon,
  X,
  Check,
  RefreshCw,
  Image as ImageIcon,
  Sun,
  Moon,
  Layers,
  Eye
} from 'lucide-react';
import { removeBackgroundAndOptimize, uploadBrandImage } from '@/utils/imageCutout';

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
  const [originalFileUrl, setOriginalFileUrl] = useState('');
  const [colorMode, setColorMode] = useState('transparent'); // 'transparent' | 'white-contrast' | 'dark-contrast'
  const [hasCutout, setHasCutout] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  const fileInputRef = useRef(null);

  // Sync internal URL state with external value
  React.useEffect(() => {
    setUrlInput(value || '');
  }, [value]);

  // Handle local file selection
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProcessing(true);
    setPreviewError(false);

    try {
      // 1. Read raw file to remember original
      const reader = new FileReader();
      const rawDataUrl = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      setOriginalFileUrl(rawDataUrl);

      // 2. Perform background removal & auto-trim
      let finalDataUrl = rawDataUrl;
      // For logos: auto-remove solid background by default
      if (isLogo || file.type.includes('png') || file.type.includes('jpeg')) {
        const result = await removeBackgroundAndOptimize(file, {
          threshold: 40,
          feather: 16,
          floodFill: true,
          autoCrop: isLogo, // auto-trim whitespace for logos
          colorMode: colorMode
        });
        finalDataUrl = result.dataUrl;
        setHasCutout(true);
      }

      // 3. Upload to server (Cloudinary or local public storage)
      const sanitizedName = file.name ? file.name.replace(/\.[^/.]+$/, '') : 'catalog_asset';
      const remoteUrl = await uploadBrandImage(finalDataUrl, `${sanitizedName}_clean.png`, folder);

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

  // Re-process cutout with a different color adaptation mode (e.g. White Contrast for dark templates)
  const handleApplyColorMode = async (mode) => {
    if (!originalFileUrl && !value) return;
    setColorMode(mode);
    setProcessing(true);

    try {
      const source = originalFileUrl || value;
      const result = await removeBackgroundAndOptimize(source, {
        threshold: 40,
        feather: 16,
        floodFill: true,
        autoCrop: isLogo,
        colorMode: mode
      });

      const remoteUrl = await uploadBrandImage(result.dataUrl, `adapted_${mode}_${Date.now()}.png`, folder);
      onChange(remoteUrl);
      setUrlInput(remoteUrl);
      setHasCutout(true);
    } catch (err) {
      console.error('Renk modu uygulanamadı:', err);
    } finally {
      setProcessing(false);
    }
  };

  // One-click background removal for an existing image / URL
  const handleRemoveBgOnDemand = async () => {
    if (!value && !originalFileUrl) return;
    setProcessing(true);

    try {
      const source = originalFileUrl || value;
      const result = await removeBackgroundAndOptimize(source, {
        threshold: 42,
        feather: 18,
        floodFill: true,
        autoCrop: isLogo,
        colorMode: colorMode
      });

      const remoteUrl = await uploadBrandImage(result.dataUrl, `cutout_${Date.now()}.png`, folder);
      onChange(remoteUrl);
      setUrlInput(remoteUrl);
      setHasCutout(true);
    } catch (err) {
      alert('Arka plan kaldırılırken hata oluştu: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  // Revert back to original file if available
  const handleRevertOriginal = async () => {
    if (!originalFileUrl) return;
    setProcessing(true);
    try {
      const remoteUrl = await uploadBrandImage(originalFileUrl, `original_${Date.now()}.png`, folder);
      onChange(remoteUrl);
      setUrlInput(remoteUrl);
      setHasCutout(false);
      setColorMode('transparent');
    } finally {
      setProcessing(false);
    }
  };

  // Clear current image
  const handleClear = () => {
    onChange('');
    setUrlInput('');
    setOriginalFileUrl('');
    setHasCutout(false);
    setPreviewError(false);
  };

  // Use default
  const handleUseDefault = () => {
    if (defaultUrl) {
      onChange(defaultUrl);
      setUrlInput(defaultUrl);
      setOriginalFileUrl('');
      setHasCutout(false);
    }
  };

  return (
    <div className="space-y-3 p-4 sm:p-5 rounded-2xl bg-stone-50/80 border border-stone-200/90 shadow-2xs">
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
              className="cursor-pointer border-2 border-dashed border-stone-300 hover:border-amber-500 bg-white hover:bg-amber-50/30 transition-all rounded-xl p-5 text-center flex flex-col items-center justify-center gap-2 group"
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
                  {processing ? 'Görsel İşleniyor & Arka Plan Kaldırılıyor...' : 'Bilgisayarınızdan Görsel Seçin veya Sürükleyin'}
                </p>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  PNG, JPG, WebP veya SVG • {recommendedAspect}
                </p>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100/70 text-amber-900 rounded-full text-[11px] font-semibold mt-1">
                <Sparkles size={12} className="text-amber-700" />
                <span>Otomatik Arka Plan Temizleme & Şablon Uyumluluğu Aktif</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value);
                  onChange(e.target.value);
                }}
                placeholder="https://... görsel bağlantısını yapıştırın"
                className="flex-1 h-11 px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-sm text-stone-900 outline-none focus:border-amber-600 focus:ring-4 focus:ring-amber-500/10 transition shadow-2xs"
              />
              {value && (
                <button
                  type="button"
                  onClick={handleRemoveBgOnDemand}
                  disabled={processing}
                  className="h-11 px-3.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs flex-shrink-0 disabled:opacity-50"
                  title="URL'deki görselin arka planını kaldırıp şeffaf yap"
                >
                  <Sparkles size={13} className="text-amber-400" />
                  <span>Arka Planı Kaldır</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Live Preview & Actions Box */}
        {value ? (
          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-stone-200/90 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
            {/* Visual Preview */}
            <div className="flex items-center gap-3.5">
              {/* Checkerboard container to showcase transparency */}
              <div
                className="w-16 h-16 rounded-xl border border-stone-300 overflow-hidden flex items-center justify-center flex-shrink-0 shadow-2xs relative"
                style={{
                  backgroundImage:
                    'linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)',
                  backgroundSize: '12px 12px',
                  backgroundPosition: '0 0, 0 6px, 6px -6px, -6px 0px'
                }}
              >
                {!previewError ? (
                  <img
                    src={value}
                    alt="Yüklenen Görsel Önizleme"
                    className="max-w-full max-h-full object-contain p-1"
                    onError={() => setPreviewError(true)}
                  />
                ) : (
                  <div className="p-1 text-[10px] text-stone-400 text-center">Önizleme Yok</div>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-stone-900">
                    {isLogo ? 'Katalog Logosu Hazır' : 'Görsel Başarıyla Yüklendi'}
                  </span>
                  {hasCutout && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <Check size={11} /> Şeffaf / Cutout
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-stone-400 truncate max-w-xs md:max-w-sm">
                  {value}
                </p>
              </div>
            </div>

            {/* Smart Template Adaptation Controls (For Logos) */}
            <div className="flex flex-wrap items-center gap-1.5 self-start md:self-auto">
              {isLogo && (
                <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => handleApplyColorMode('transparent')}
                    disabled={processing}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-all flex items-center gap-1 ${
                      colorMode === 'transparent'
                        ? 'bg-white text-stone-900 shadow-2xs font-bold'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                    title="Orijinal renkleri koru (Şeffaf Arka Plan)"
                  >
                    <Eye size={12} />
                    <span>Orijinal</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyColorMode('white-contrast')}
                    disabled={processing}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-all flex items-center gap-1 ${
                      colorMode === 'white-contrast'
                        ? 'bg-white text-stone-900 shadow-2xs font-bold'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                    title="Koyu şablonlar (Milano, Monolith, Lidya) için logoyu beyaz kontrast yap"
                  >
                    <Moon size={12} className="text-amber-500" />
                    <span>Beyaz Kontrast</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyColorMode('dark-contrast')}
                    disabled={processing}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-all flex items-center gap-1 ${
                      colorMode === 'dark-contrast'
                        ? 'bg-white text-stone-900 shadow-2xs font-bold'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                    title="Açık şablonlar (Minimal, Deco) için logoyu koyu grafit kontrast yap"
                  >
                    <Sun size={12} className="text-amber-600" />
                    <span>Koyu Kontrast</span>
                  </button>
                </div>
              )}

              {/* On-demand Cutout button if not yet cutout */}
              {!hasCutout && (
                <button
                  type="button"
                  onClick={handleRemoveBgOnDemand}
                  disabled={processing}
                  className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 transition flex items-center gap-1"
                >
                  <Sparkles size={12} />
                  <span>Arka Planı Kaldır</span>
                </button>
              )}

              {/* Revert to original if cutout was applied */}
              {originalFileUrl && hasCutout && (
                <button
                  type="button"
                  onClick={handleRevertOriginal}
                  disabled={processing}
                  className="px-2.5 py-1.5 text-xs font-medium rounded-lg text-stone-600 hover:bg-stone-100 transition"
                  title="Orijinal dosyaya geri dön"
                >
                  Orijinale Dön
                </button>
              )}

              {/* Clear button */}
              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                title="Görseli Kaldır"
              >
                <X size={16} />
              </button>
            </div>
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
