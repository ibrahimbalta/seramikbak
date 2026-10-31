'use client';

import React from 'react';
import { useLanguage } from '@/lib/languageContext';

const notices = {
  de: {
    text: 'Standort erkannt: Deutschsprachige Region • Seite wurde automatisch übersetzt.',
    revertBtn: 'Orijinal Türkçe',
    flag: '🇩🇪'
  },
  en: {
    text: 'Location detected: International • Page automatically translated to English.',
    revertBtn: 'Original (Türkçe)',
    flag: '🌍'
  },
  fr: {
    text: 'Emplacement détecté • Page automatiquement traduite en français.',
    revertBtn: 'Original (Türkçe)',
    flag: '🇫🇷'
  },
  es: {
    text: 'Ubicación detectada • Página traducida automáticamente al español.',
    revertBtn: 'Original (Türkçe)',
    flag: '🇪🇸'
  },
  ar: {
    text: 'تم اكتشاف المنطقة • تمت ترجمة الصفحة تلقائياً إلى العربية.',
    revertBtn: 'النسخة الأصلية (Türkçe)',
    flag: '🇸🇦'
  },
  ru: {
    text: 'Регион определен • Страница автоматически переведена на русский язык.',
    revertBtn: 'Оригинал (Türkçe)',
    flag: '🇷🇺'
  }
};

export default function AutoTranslateNotice() {
  const { lang, autoNotice, dismissAutoNotice, restoreOriginal } = useLanguage();

  if (!autoNotice || lang === 'tr') return null;

  const config = notices[lang] || notices.en;

  return (
    <div className="auto-translate-toast" role="status" aria-live="polite">
      <span>{config.flag}</span>
      <span>{config.text}</span>
      <button 
        type="button" 
        onClick={restoreOriginal}
        className="auto-translate-btn"
      >
        {config.revertBtn}
      </button>
      <button 
        type="button" 
        onClick={dismissAutoNotice}
        className="auto-translate-close"
        aria-label="Kapat"
      >
        ×
      </button>
    </div>
  );
}
