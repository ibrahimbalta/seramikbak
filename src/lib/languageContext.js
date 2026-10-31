'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { dictionaries } from './dictionary';

const LanguageContext = createContext();

const SUPPORTED_LANGUAGES = ['tr', 'en', 'de', 'ar', 'ru', 'fr', 'es'];

/**
 * Synchronizes Google Translate cookie so the entire DOM across all components,
 * cards, forms, and footers gets translated automatically.
 */
function setGoogleTranslateCookie(targetLang) {
  if (typeof document === 'undefined') return;
  const cookieValue = targetLang === 'tr' ? '/tr/tr' : `/tr/${targetLang}`;

  const host = window.location.hostname;
  // Clear any existing cookie
  document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${host};`;

  // Set fresh cookie
  document.cookie = `googtrans=${cookieValue}; path=/; max-age=31536000`;
  document.cookie = `googtrans=${cookieValue}; path=/; domain=${host}; max-age=31536000`;

  if (host.includes('.')) {
    const parts = host.split('.');
    if (parts.length >= 2) {
      const rootDomain = parts.slice(-2).join('.');
      document.cookie = `googtrans=${cookieValue}; path=/; domain=.${rootDomain}; max-age=31536000`;
    }
  }
}

/**
 * Triggers Google Translate hidden dropdown element to change the page language in real-time.
 */
function triggerGoogleTranslateDOM(targetLang) {
  if (typeof document === 'undefined') return;

  const performChange = () => {
    const select = document.querySelector('.goog-te-combo');
    if (select) {
      if (select.value !== targetLang) {
        select.value = targetLang;
        select.dispatchEvent(new Event('change'));
      }
      return true;
    }
    return false;
  };

  if (!performChange()) {
    // If Google Translate element is still initializing, retry briefly
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (performChange() || attempts > 20) {
        clearInterval(interval);
      }
    }, 250);
  }
}

/**
 * Automatically detects user country and language via:
 * 1. navigator.language (browser locale)
 * 2. Timezone (zero-latency client signal)
 * 3. Fast Geo IP fallback
 */
async function detectUserLanguage() {
  if (typeof window === 'undefined') return 'tr';

  // 1. Browser locale check (Zero-latency)
  const navLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
  if (navLang.startsWith('de')) return 'de';
  if (navLang.startsWith('fr')) return 'fr';
  if (navLang.startsWith('es')) return 'es';
  if (navLang.startsWith('ar')) return 'ar';
  if (navLang.startsWith('ru')) return 'ru';
  if (navLang.startsWith('tr')) return 'tr';
  if (navLang.startsWith('en')) return 'en';

  // 2. Client TimeZone check (Zero-latency geographic proxy)
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (tz.includes('Berlin') || tz.includes('Vienna') || tz.includes('Zurich')) return 'de';
    if (tz.includes('Paris') || tz.includes('Brussels')) return 'fr';
    if (tz.includes('Madrid')) return 'es';
    if (tz.includes('Moscow') || tz.includes('Minsk') || tz.includes('Almaty')) return 'ru';
    if (tz.includes('Riyadh') || tz.includes('Dubai') || tz.includes('Cairo') || tz.includes('Baghdad') || tz.includes('Kuwait')) return 'ar';
    if (tz.includes('Istanbul')) return 'tr';
  } catch (e) {
    // Ignore timezone detection errors
  }

  // 3. Fast lightweight Geo Lookup fallback (1.2s timeout)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);
    const res = await fetch('https://get.geojs.io/v1/ip/country.json', { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      const country = data?.country?.toUpperCase();
      if (['DE', 'AT', 'CH'].includes(country)) return 'de';
      if (['FR', 'BE', 'LU'].includes(country)) return 'fr';
      if (['ES', 'MX', 'AR', 'CO', 'CL'].includes(country)) return 'es';
      if (['SA', 'AE', 'EG', 'QA', 'KW', 'OM', 'BH', 'IQ', 'JO'].includes(country)) return 'ar';
      if (['RU', 'BY', 'KZ', 'UA', 'UZ'].includes(country)) return 'ru';
      if (['TR', 'CY'].includes(country)) return 'tr';
      return 'en'; // Default for rest of world
    }
  } catch (e) {
    // Ignore geo lookup errors
  }

  return 'tr';
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState('tr');
  const [autoNotice, setAutoNotice] = useState(false);
  const autoNoticeTimerRef = useRef(null);

  const applyLanguageSettings = useCallback((selectedLang, isUserManualAction = false) => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = selectedLang;
      document.documentElement.dir = selectedLang === 'ar' ? 'rtl' : 'ltr';
      if (selectedLang === 'ar') {
        document.body.classList.add('rtl-mode');
      } else {
        document.body.classList.remove('rtl-mode');
      }

      // Dynamic International SEO Title & Meta Description
      const dict = dictionaries[selectedLang] || dictionaries['tr'];
      if (dict && dict.seoTitle) {
        document.title = dict.seoTitle;
      }
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc && dict && dict.seoDescription) {
        metaDesc.setAttribute('content', dict.seoDescription);
      }

      // Full-Page Google Translate DOM Engine Synchronization
      setGoogleTranslateCookie(selectedLang);
      triggerGoogleTranslateDOM(selectedLang);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check URL override: ?lang=de
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlLang = urlParams.get('lang');
      if (urlLang && SUPPORTED_LANGUAGES.includes(urlLang)) {
        setLangState(urlLang);
        localStorage.setItem('seramikbak_lang', urlLang);
        applyLanguageSettings(urlLang, true);
        return;
      }
    } catch (e) {
      // Ignore search params error
    }

    // Check previously saved user choice
    const savedLang = localStorage.getItem('seramikbak_lang');
    if (savedLang && SUPPORTED_LANGUAGES.includes(savedLang)) {
      setLangState(savedLang);
      applyLanguageSettings(savedLang, false);
      return;
    }

    // Automatic Location & Browser Language Detection for first-time visitors
    detectUserLanguage().then((detected) => {
      if (detected && detected !== 'tr' && SUPPORTED_LANGUAGES.includes(detected)) {
        setLangState(detected);
        localStorage.setItem('seramikbak_lang', detected);
        document.cookie = `seramikbak_lang=${detected}; path=/; max-age=31536000`;
        applyLanguageSettings(detected, false);

        // Show non-intrusive auto-translate banner
        setAutoNotice(true);
        autoNoticeTimerRef.current = setTimeout(() => {
          setAutoNotice(false);
        }, 10000);
      } else {
        setLangState('tr');
        applyLanguageSettings('tr', false);
      }
    });

    return () => {
      if (autoNoticeTimerRef.current) clearTimeout(autoNoticeTimerRef.current);
    };
  }, [applyLanguageSettings]);

  const setLang = (newLang) => {
    if (SUPPORTED_LANGUAGES.includes(newLang)) {
      setLangState(newLang);
      localStorage.setItem('seramikbak_lang', newLang);
      document.cookie = `seramikbak_lang=${newLang}; path=/; max-age=31536000`;
      setAutoNotice(false);
      applyLanguageSettings(newLang, true);
    }
  };

  const restoreOriginal = () => {
    setLang('tr');
    setAutoNotice(false);
  };

  const dismissAutoNotice = () => {
    setAutoNotice(false);
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
    <LanguageContext.Provider value={{ 
      lang, 
      setLang, 
      t, 
      translateStyle, 
      translateFinish,
      autoNotice,
      dismissAutoNotice,
      restoreOriginal
    }}>
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
      translateFinish: (f) => f,
      autoNotice: false,
      dismissAutoNotice: () => {},
      restoreOriginal: () => {}
    };
  }
  return context;
}
