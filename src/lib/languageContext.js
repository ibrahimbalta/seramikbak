'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { dictionaries } from './dictionary';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState('tr');

  useEffect(() => {
    // Detect saved language or automatic browser/country locale
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('seramikbak_lang');
      if (savedLang && dictionaries[savedLang]) {
        setLangState(savedLang);
        applyLanguageSettings(savedLang);
      } else {
        // Smart Country & Browser Auto-Detection
        const userLanguages = Array.from(navigator.languages || [navigator.language || '']);
        let detected = 'tr';

        for (const fullLang of userLanguages) {
          const code = fullLang.toLowerCase().split('-')[0];
          if (code === 'de' || code === 'at' || code === 'ch') { detected = 'de'; break; }
          if (code === 'ar' || code === 'sa' || code === 'ae' || code === 'qa' || code === 'eg' || code === 'kw') { detected = 'ar'; break; }
          if (code === 'ru' || code === 'by' || code === 'kz') { detected = 'ru'; break; }
          if (code === 'en' || code === 'gb' || code === 'us' || code === 'ca' || code === 'au') { detected = 'en'; break; }
          if (code === 'tr') { detected = 'tr'; break; }
        }

        if (dictionaries[detected]) {
          setLangState(detected);
          applyLanguageSettings(detected);
        }
      }
    }
  }, []);

  const applyLanguageSettings = (selectedLang) => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = selectedLang;
      document.documentElement.dir = selectedLang === 'ar' ? 'rtl' : 'ltr';
      if (selectedLang === 'ar') {
        document.body.classList.add('rtl-mode');
      } else {
        document.body.classList.remove('rtl-mode');
      }
    }
  };

  const setLang = (newLang) => {
    if (dictionaries[newLang]) {
      setLangState(newLang);
      localStorage.setItem('seramikbak_lang', newLang);
      document.cookie = `seramikbak_lang=${newLang}; path=/; max-age=31536000`;
      applyLanguageSettings(newLang);
    }
  };

  const t = (key) => {
    const dict = dictionaries[lang] || dictionaries['tr'];
    return dict[key] || dictionaries['tr'][key] || key;
  };

  const translateStyle = (styleName) => {
    if (!styleName) return '';
    const dict = dictionaries[lang] || dictionaries['tr'];
    return dict.styles?.[styleName] || styleName;
  };

  const translateFinish = (finishName) => {
    if (!finishName) return '';
    const dict = dictionaries[lang] || dictionaries['tr'];
    return dict.finishes?.[finishName] || finishName;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, translateStyle, translateFinish }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      lang: 'tr',
      setLang: () => {},
      t: (key) => dictionaries['tr'][key] || key,
      translateStyle: (s) => s,
      translateFinish: (f) => f
    };
  }
  return context;
}
