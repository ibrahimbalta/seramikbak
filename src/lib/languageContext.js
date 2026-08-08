'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { dictionaries } from './dictionary';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState('tr');

  useEffect(() => {
    // Detect saved language or browser language
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('seramikbak_lang');
      if (savedLang && dictionaries[savedLang]) {
        setLangState(savedLang);
        applyLanguageSettings(savedLang);
      } else {
        const browserLang = navigator.language?.slice(0, 2)?.toLowerCase();
        if (browserLang && dictionaries[browserLang]) {
          setLangState(browserLang);
          applyLanguageSettings(browserLang);
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
