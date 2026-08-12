'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Globe, Layers2, Sparkles, Building2, ShieldCheck, 
  ArrowRight, CheckCircle2, DollarSign, Search, Zap, Download, 
  Check, FileText, Compass, Code, Package, Truck, Info
} from 'lucide-react';
import './global-tanitim.css';

const exportCountriesList = [
  { flag: '🇩🇪', name: 'Almanya (Germany)', searchTarget: 'Google DE / Yandex', lang: 'Deutsch (DE)', region: 'Avrupa' },
  { flag: '🇦🇪', name: 'BAE (United Arab Emirates)', searchTarget: 'Google AE / Arabia', lang: 'English / Arabic', region: 'Orta Doğu' },
  { flag: '🇺🇸', name: 'ABD (United States)', searchTarget: 'Google US / Bing', lang: 'English (US)', region: 'Amerika' },
  { flag: '🇬🇧', name: 'İngiltere (United Kingdom)', searchTarget: 'Google UK', lang: 'English (UK)', region: 'Avrupa' },
  { flag: '🇸🇦', name: 'Suudi Arabistan (Saudi Arabia)', searchTarget: 'Google SA / Arabia', lang: 'العربية (AR)', region: 'Orta Doğu' },
  { flag: '🇶🇦', name: 'Katar (Qatar)', searchTarget: 'Google QA / Arabia', lang: 'English / Arabic', region: 'Orta Doğu' },
  { flag: '🇫🇷', name: 'Fransa (France)', searchTarget: 'Google FR', lang: 'Français', region: 'Avrupa' },
  { flag: '🇳🇱', name: 'Hollanda (Netherlands)', searchTarget: 'Google NL', lang: 'Dutch / English', region: 'Avrupa' },
  { flag: '🇮🇹', name: 'İtalya (Italy)', searchTarget: 'Google IT', lang: 'Italiano', region: 'Avrupa' },
  { flag: '🇪🇸', name: 'İspanya (Spain)', searchTarget: 'Google ES', lang: 'Español', region: 'Avrupa' },
  { flag: '🇷🇺', name: 'Rusya (Russia)', searchTarget: 'Yandex RU / Google RU', lang: 'Русский (RU)', region: 'BDT' },
  { flag: '🇰🇼', name: 'Kuveyt (Kuwait)', searchTarget: 'Google KW', lang: 'العربية / English', region: 'Orta Doğu' }
];

const sampleProductsForSeo = [
  {
    name: 'Calacatta Gold 60x120 Mermer Görünümlü Porselen',
    code: 'CAL-60120-GLD',
    priceTry: 480,
    specs: '60x120 cm • Parlak • Mermer Desen • R9 Kaymazlık • 9.5 mm',
    schemaSample: {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "Calacatta Gold 60x120 Porcelain Tile Export",
      "sku": "CAL-60120-GLD",
      "brand": { "@type": "Brand", "name": "SeramikBak Global" },
      "offers": { "@type": "Offer", "priceCurrency": "EUR", "price": "34.50", "availability": "https://schema.org/InStock" }
    }
  },
  {
    name: 'Concrete Touch Antrasit 80x80 Mat Beton Desen',
    code: 'CNC-8080-ANT',
    priceTry: 420,
    specs: '80x80 cm • Mat • Beton Desen • R10 Kaymazlık • Donmaya Dayanıklı',
    schemaSample: {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "Concrete Touch Anthracite 80x80 Matte Tile",
      "sku": "CNC-8080-ANT",
      "brand": { "@type": "Brand", "name": "SeramikBak Global" },
      "offers": { "@type": "Offer", "priceCurrency": "USD", "price": "29.00", "availability": "https://schema.org/InStock" }
    }
  }
];

export default function GlobalPromotionPage() {
  const [activeTab, setActiveTab] = useState('seo'); // 'seo', 'currency', 'bim', 'ai', 'process'
  const [downloadedBim, setDownloadedBim] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [selectedM2, setSelectedM2] = useState(2500);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [selectedSeoSampleIndex, setSelectedSeoSampleIndex] = useState(0);

  const [brandForm, setBrandForm] = useState({ 
    brandName: '', 
    contactPerson: '', 
    email: '', 
    phone: '', 
    collectionCount: '10-25',
    note: '' 
  });

  const currencyRates = {
    TRY: { symbol: '₺', rate: 1, name: 'Türk Lirası (TRY)' },
    USD: { symbol: '$', rate: 0.027, name: 'US Dollar (USD)' },
    EUR: { symbol: '€', rate: 0.025, name: 'Euro (EUR)' },
    GBP: { symbol: '£', rate: 0.021, name: 'British Pound (GBP)' },
    SAR: { symbol: '﷼', rate: 0.10, name: 'Saudi Riyal (SAR)' },
    RUB: { symbol: '₽', rate: 2.40, name: 'Russian Ruble (RUB)' }
  };

  const currentCurr = currencyRates[selectedCurrency];
  const samplePriceM2 = 450;
  const unitPriceConverted = (samplePriceM2 * currentCurr.rate).toFixed(2);
  const totalQuoteConverted = (samplePriceM2 * selectedM2 * currentCurr.rate).toLocaleString('en-US', { maximumFractionDigits: 2 });
  
  // Real logistics calculation
  const totalKg = Math.round(selectedM2 * 22.5); // ~22.5 kg/m² standard porcelain
  const palletCount = Math.ceil(selectedM2 / 64); // ~64 m² per pallet

  const handleBrandSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await fetch('/api/brands/saas-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandId: brandForm.brandName,
          plan: 'ENTERPRISE_GLOBAL_EXPORTS',
          paymentSender: brandForm.contactPerson,
          paymentDate: new Date().toISOString(),
          paymentNote: `E-posta: ${brandForm.email} | Tel: ${brandForm.phone} | Koleksiyon Sayısı: ${brandForm.collectionCount} | Not: ${brandForm.note}`
        })
      });
      setFormSubmitted(true);
    } catch (err) {
      console.error('Brand submit error:', err);
      setFormSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const sampleSeoItem = sampleProductsForSeo[selectedSeoSampleIndex];

  return (
    <div className="gt-page-bg">

      {/* Top Header Navbar */}
      <header className="gt-header-bar">
        <div className="gt-header-content">
          {/* Ana Sayfaya Dön */}
          <Link href="/" className="gt-btn-back">
            <ArrowLeft size={16} style={{ color: '#b38e47', flexShrink: 0 }} />
            <span className="gt-btn-back-text-full">Ana Sayfaya Dön</span>
            <span className="gt-btn-back-text-short">Ana Sayfa</span>
          </Link>
          
          {/* Logo Center */}
          <Link href="/" className="gt-logo-link">
            <div className="gt-logo-badge">SB</div>
            <span className="gt-logo-title">SeramikBak Global</span>
          </Link>

          {/* Marka Portalı */}
          <Link href="/marka" className="gt-btn-dashboard">
            <Building2 size={16} style={{ color: '#d4af37', flexShrink: 0 }} />
            <span className="gt-btn-dash-text-full">Marka Kokpiti</span>
            <span className="gt-btn-dash-text-short">Kokpit</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <div className="gt-main-container">

        {/* HERO SECTION */}
        <section className="gt-hero-section">
          
          <div className="gt-hero-badge">
            <Compass size={14} style={{ flexShrink: 0 }} />
            <span>GLOBAL CERAMICS MULTI-LINGUAL SEO SHOWROOM</span>
          </div>

          <h1 className="gt-hero-h1">
            Markalarınızı ve Ürünlerinizi <span style={{
              background: 'linear-gradient(135deg, #b38e47 0%, #d4af37 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>5 Dilde Çoklu SEO ile Dünya Pazarına</span> Açıyoruz
          </h1>

          <p className="gt-hero-p">
            SeramikBak Global Altyapısı; Türkiye'deki seramik üreticilerinin tüm koleksiyonlarını Türkçe, İngilizce, Almanca, Arapça ve Rusça dillerinde Google Global ve Yandex arama motorlarında indeksleyerek 85+ ülkedeki uluslararası mimar, distribütör ve projelerle buluşturur.
          </p>

          {/* Hero Buttons */}
          <div className="gt-hero-buttons">
            <a 
              href="#brand-apply-form" 
              className="gt-hero-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #b38e47 0%, #d4af37 50%, #b38e47 100%)',
                color: '#0f172a',
                padding: '14px 28px',
                borderRadius: '14px',
                fontSize: '0.92rem',
                fontWeight: '900',
                textDecoration: 'none',
                boxShadow: '0 8px 25px rgba(179, 142, 71, 0.35)',
                border: '1px solid rgba(212, 175, 55, 0.5)'
              }}
            >
              <Building2 size={18} style={{ color: '#0f172a', flexShrink: 0 }} />
              <span>Markanızı Global Tanıtım Ağına Ekleyin</span>
              <ArrowRight size={16} style={{ color: '#0f172a', flexShrink: 0 }} />
            </a>

            <a 
              href="#seo-features" 
              className="gt-hero-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#ffffff',
                color: '#0f172a',
                border: '1px solid #cbd5e1',
                padding: '14px 26px',
                borderRadius: '14px',
                fontSize: '0.92rem',
                fontWeight: '800',
                textDecoration: 'none',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)'
              }}
            >
              <Info size={18} style={{ color: '#b38e47', flexShrink: 0 }} />
              <span>5 Dilde SEO Mimarisini İnceleyin</span>
            </a>
          </div>

          {/* Metrics Bar */}
          <div className="gt-metrics-grid">
            <div className="gt-metric-item">
              <strong className="gt-metric-val" style={{ display: 'block', fontSize: '1.7rem', fontWeight: '900', color: '#b38e47' }}>5 Dilde</strong>
              <span className="gt-metric-lbl" style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: '700' }}>Otomatik SEO İndeks</span>
            </div>
            <div className="gt-metric-item gt-metric-item-bordered">
              <strong className="gt-metric-val" style={{ display: 'block', fontSize: '1.7rem', fontWeight: '900', color: '#0f172a' }}>85+</strong>
              <span className="gt-metric-lbl" style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: '700' }}>İhracat Ülkesi</span>
            </div>
            <div className="gt-metric-item gt-metric-item-bordered">
              <strong className="gt-metric-val" style={{ display: 'block', fontSize: '1.7rem', fontWeight: '900', color: '#b38e47' }}>15.000+</strong>
              <span className="gt-metric-lbl" style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: '700' }}>Uluslararası Mimar</span>
            </div>
          </div>

        </section>

        {/* NAVIGATION TABS BAR */}
        <section id="seo-features" style={{ marginBottom: '40px' }}>
          
          <div className="gt-tabs-container">
            {[
              { id: 'seo', label: '5 Dilde SEO & İndeksleme', icon: Globe },
              { id: 'currency', label: 'Otomatik Metraj & Lojistik Teklifi', icon: Package },
              { id: 'bim', label: 'Global BIM / CAD Kütüphanesi', icon: Layers2 },
              { id: 'ai', label: 'AI Görsel Arama & Web 3D', icon: Sparkles },
              { id: 'process', label: '5 Adımda Fonksiyonel İşleyiş', icon: Zap }
            ].map(tab => {
              const IconComp = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="gt-tab-btn"
                  style={{
                    background: isActive ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' : 'transparent',
                    color: isActive ? '#ffffff' : '#475569',
                    border: isActive ? '1px solid rgba(212, 175, 55, 0.4)' : 'none',
                    boxShadow: isActive ? '0 4px 14px rgba(15, 23, 42, 0.15)' : 'none',
                    padding: '10px 18px',
                    borderRadius: '12px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.85rem',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <IconComp size={16} style={{ color: isActive ? '#d4af37' : '#64748b', flexShrink: 0 }} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: SEO & SCHEMA.ORG SIMULATOR */}
          {activeTab === 'seo' && (
            <div className="gt-tab-panel">
              
              <div style={{ marginBottom: '24px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#059669', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 12px', borderRadius: '12px' }}>
                  ÇOKLU DİL & ARAMA MOTORU MİMARİSİ
                </span>
                <h2 style={{ fontSize: 'clamp(1.2rem, 3.5vw, 1.6rem)', fontWeight: '900', color: '#0f172a', margin: '8px 0 6px 0' }}>
                  🌍 Google Global & Yandex Otomatik Yapısal Veri (Schema.org) Sistemimiz
                </h2>
                <p style={{ color: '#64748b', margin: 0, fontSize: '0.94rem' }}>
                  Sistemimiz markanızın her bir koleksiyonunu Türkçe, İngilizce, Almanca, Arapça ve Rusça dillerinde Google Rich Snippets ve Yandex standartlarında indeksler.
                </p>
              </div>

              {/* Real Interactive Schema & Rich Snippet Inspector */}
              <div className="gt-inspector-box">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#fef08a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Code size={16} style={{ color: '#d4af37', flexShrink: 0 }} />
                    CANLI SCHEMA.ORG & HREFLANG İNCELEYİCİ
                  </span>
                  
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {sampleProductsForSeo.map((sp, idx) => (
                      <button
                        key={sp.code}
                        onClick={() => setSelectedSeoSampleIndex(idx)}
                        style={{
                          background: selectedSeoSampleIndex === idx ? 'linear-gradient(135deg, #d4af37 0%, #b38e47 100%)' : 'rgba(255,255,255,0.08)',
                          color: selectedSeoSampleIndex === idx ? '#0f172a' : '#e2e8f0',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '0.74rem',
                          fontWeight: '800',
                          cursor: 'pointer'
                        }}
                      >
                        {sp.code}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="gt-inspector-grid">
                  <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '14px' }}>
                    <div style={{ fontSize: '0.68rem', color: '#38bdf8', marginBottom: '4px', wordBreak: 'break-all' }}>
                      https://seramikbak.com/de/koleksiyon/{sampleSeoItem.code.toLowerCase()}
                    </div>
                    <div style={{ fontSize: '0.94rem', fontWeight: '800', color: '#fef08a', marginBottom: '6px' }}>
                      {sampleSeoItem.name} - 5 Dilde İndeksli
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#cbd5e1', lineHeight: '1.45', marginBottom: '10px' }}>
                      {sampleSeoItem.specs}. Google Global & Yandex 1. Sayfa Rich Snippet onaylı seramik kaplamaları.
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.4)', padding: '6px 10px', borderRadius: '8px', fontSize: '0.7rem', color: '#34d399', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <CheckCircle2 size={13} style={{ flexShrink: 0 }} /> Schema.org Product, Brand, Offer Validated
                    </div>
                  </div>

                  <div style={{ background: '#090d16', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '12px', fontFamily: 'monospace', fontSize: '0.7rem', color: '#38bdf8', overflowX: 'auto', maxHeight: '180px' }}>
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                      {JSON.stringify(sampleSeoItem.schemaSample, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>

              {/* 3 Core Cards */}
              <div className="gt-cards-3col">
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                    <Globe size={20} />
                  </div>
                  <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0' }}>Hreflang & Schema.org Rich Snippets</h3>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0, lineHeight: '1.5' }}>Google ve Yandex botları için ürün bilgileri, ebatları, yüzey bitişi ve renkleri uluslararası arama standartlarına uygun etiketlerle sunulur.</p>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.1)', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                    <Search size={20} />
                  </div>
                  <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0' }}>Yerelleştirilmiş Arama Terimleri</h3>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0, lineHeight: '1.5' }}>Almanca "Feinsteinzeug Fliesen", Arapça "بلاط بورسلين high-end", İngilizce "Porcelain Tiles 60x120" gibi bölgesel arama hacimlerine hitap edilir.</p>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(179, 142, 71, 0.1)', color: '#b38e47', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                    <Zap size={20} />
                  </div>
                  <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0' }}>Uluslararası Görsel İndeksleme</h3>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0, lineHeight: '1.5' }}>Yüksek çözünürlüklü seramik dokuları Google Images ve Yandex Images üzerinde markanızın adı ile ilk sıralarda indekslenir.</p>
                </div>
              </div>

              {/* Export Countries Grid */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', marginBottom: '16px' }}>🌐 Hedef İhracat Ülkeleri ve Arama Engine'leri</h3>
                <div className="gt-countries-grid">
                  {exportCountriesList.map((country, idx) => (
                    <div key={idx} className="gt-country-card" style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', border: '1px solid #f1f5f9', padding: '10px 12px', borderRadius: '10px' }}>
                      <span className="gt-country-flag" style={{ fontSize: '1.3rem', flexShrink: 0 }}>{country.flag}</span>
                      <div style={{ overflow: 'hidden' }}>
                        <strong className="gt-country-title" style={{ display: 'block', fontSize: '0.8rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{country.name}</strong>
                        <span className="gt-country-sub" style={{ fontSize: '0.68rem', color: '#64748b', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{country.searchTarget} • {country.lang}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: MULTI-CURRENCY & METRAJ CALCULATOR */}
          {activeTab === 'currency' && (
            <div className="gt-tab-panel">
              
              <div style={{ marginBottom: '24px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#b38e47', background: 'rgba(179, 142, 71, 0.1)', padding: '4px 12px', borderRadius: '12px' }}>
                  CANLI DÖVİZ VE METRAJ HESAPLAMA MOTORU
                </span>
                <h2 style={{ fontSize: 'clamp(1.2rem, 3.5vw, 1.6rem)', fontWeight: '900', color: '#0f172a', margin: '8px 0 6px 0' }}>
                  💲 6 Farklı Para Birimi ile Otomatik Lojistik & Teklif Hesabı
                </h2>
                <p style={{ color: '#64748b', margin: 0, fontSize: '0.94rem' }}>
                  Yabancı mimarlar ve B2B satın alma yetkilileri seramiklerin m² fiyatlarını, konteyner palet sayılarını ve toplam proje maliyetlerini kendi para birimlerinde hesaplar.
                </p>
              </div>

              {/* Interactive Currency Simulator */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '20px', boxShadow: '0 8px 25px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Canlı B2B İhracat & Lojistik Teklif Simülatörü</h3>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a', boxShadow: '0 0 8px #16a34a', flexShrink: 0 }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', color: '#64748b', fontWeight: '700', marginBottom: '4px' }}>Proje Metrajı (m²)</label>
                    <input 
                      type="number" 
                      value={selectedM2} 
                      onChange={(e) => setSelectedM2(Number(e.target.value))}
                      style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', fontWeight: '800', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', color: '#64748b', fontWeight: '700', marginBottom: '4px' }}>Hedef Para Birimi Seçin</label>
                    <select 
                      value={selectedCurrency} 
                      onChange={(e) => setSelectedCurrency(e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', fontWeight: '800', cursor: 'pointer', boxSizing: 'border-box' }}
                    >
                      {Object.keys(currencyRates).map(currKey => (
                        <option key={currKey} value={currKey}>
                          {currencyRates[currKey].name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <label style={{ display: 'block', fontSize: '0.72rem', color: '#64748b', fontWeight: '700' }}>Birim m² / Toplam Teklif</label>
                    <div style={{ fontSize: '1.05rem', fontWeight: '900', color: '#b38e47' }}>
                      {currentCurr.symbol}{unitPriceConverted} / m² 
                      <span style={{ fontSize: '0.8rem', color: '#0f172a', display: 'block', marginTop: '2px' }}>
                        Toplam: {currentCurr.symbol}{totalQuoteConverted} ({selectedCurrency})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="gt-logistics-strip">
                  <div>
                    <Package size={16} style={{ color: '#d4af37', marginBottom: '2px', flexShrink: 0 }} />
                    <div>Tahmini Palet: <strong>{palletCount} Palet</strong></div>
                  </div>
                  <div>
                    <Truck size={16} style={{ color: '#38bdf8', marginBottom: '2px', flexShrink: 0 }} />
                    <div>Toplam Ağırlık: <strong>{(totalKg / 1000).toFixed(1)} Ton</strong></div>
                  </div>
                  <div>
                    <ShieldCheck size={16} style={{ color: '#34d399', marginBottom: '2px', flexShrink: 0 }} />
                    <div>Konteyner: <strong>{Math.ceil(totalKg / 24000)} Konteyner (20FT)</strong></div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: BIM / CAD LIBRARY */}
          {activeTab === 'bim' && (
            <div className="gt-tab-panel">
              
              <div style={{ marginBottom: '24px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#0284c7', background: 'rgba(56, 189, 248, 0.1)', padding: '4px 12px', borderRadius: '12px' }}>
                  MİMARİ ŞARTNAME VE DOKU KÜTÜPHANESİ
                </span>
                <h2 style={{ fontSize: 'clamp(1.2rem, 3.5vw, 1.6rem)', fontWeight: '900', color: '#0f172a', margin: '8px 0 6px 0' }}>
                  📐 Global Mimarlık Büroları İçin 4K BIM & CAD Paketleri
                </h2>
                <p style={{ color: '#64748b', margin: 0, fontSize: '0.94rem' }}>
                  Londra, New York, Berlin ve Dubai merkezli mimarlar tasarladıkları otel ve rezidans projelerinde seramiklerinizi şartnameye doğrudan ekler.
                </p>
              </div>

              <div className="gt-cards-3col">
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.1)', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                    <Layers2 size={22} />
                  </div>
                  <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0' }}>Revit BIM Family (.RFA)</h4>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0, lineHeight: '1.5' }}>Revit 2020-2026 uyumlu, malzeme kalınlığı ve teknik sürdürülebilirlik verileri içeren mimari kütüphane nesnesi.</p>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                    <FileText size={22} />
                  </div>
                  <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0' }}>AutoCAD Hatch (.DWG)</h4>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0, lineHeight: '1.5' }}>2D seramik döşeme planları, derz payları ve kesit detay çizimleri.</p>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(179, 142, 71, 0.1)', color: '#b38e47', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                    <Sparkles size={22} />
                  </div>
                  <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0' }}>4K Seamless PBR Textures</h4>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0, lineHeight: '1.5' }}>3ds Max, Blender, Corona & V-Ray için hazırlanan kesintisiz Diffuse, Roughness ve Normal kaplama haritaları.</p>
                </div>
              </div>

              <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#ffffff', borderRadius: '18px', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fef08a', margin: '0 0 4px 0' }}>Örnek 4K Mimari Dokuları İndirin</h3>
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>Markanızın koleksiyonları sisteme yüklendiğinde otomatik olarak bu formata dönüştürülür.</p>
                </div>

                <button 
                  onClick={() => { setDownloadedBim(true); setTimeout(() => setDownloadedBim(false), 4000); }} 
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    background: 'linear-gradient(135deg, #b38e47 0%, #d4af37 100%)',
                    color: '#0f172a',
                    border: 'none',
                    padding: '12px 20px',
                    borderRadius: '12px',
                    fontWeight: '900',
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    width: '100%',
                    maxWidth: '320px'
                  }}
                >
                  <Download size={18} style={{ flexShrink: 0 }} />
                  <span>Örnek 4K BIM Paketini İndir (.ZIP)</span>
                </button>
              </div>

              {downloadedBim && (
                <div style={{ marginTop: '14px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#065f46', padding: '12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Check size={18} style={{ flexShrink: 0 }} />
                  <span>Örnek 4K BIM & PBR doku paketi indiriliyor! İstediğiniz seramiğin detay sayfasından o ürüne özel CAD dosyasını indirebilirsiniz.</span>
                </div>
              )}

            </div>
          )}

          {/* TAB 4: AI & WEB 3D */}
          {activeTab === 'ai' && (
            <div className="gt-tab-panel">
              
              <div style={{ marginBottom: '24px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#8b5cf6', background: 'rgba(139, 92, 246, 0.1)', padding: '4px 12px', borderRadius: '12px' }}>
                  YAPAY ZEKA VE CANLI 3D TEKNOLOJİSİ
                </span>
                <h2 style={{ fontSize: 'clamp(1.2rem, 3.5vw, 1.6rem)', fontWeight: '900', color: '#0f172a', margin: '8px 0 6px 0' }}>
                  📲 Yapay Zekalı Görsel Arama & Web 3D / AR Simülatörü
                </h2>
                <p style={{ color: '#64748b', margin: 0, fontSize: '0.94rem' }}>
                  Alıcılar fiziki showroom ziyareti yapmadan cep telefonları veya bilgisayarlarından ürünlerinizi 360° canlı deneyimler.
                </p>
              </div>

              <div className="gt-cards-3col">
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                    <Search size={22} />
                  </div>
                  <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0' }}>AI Görsel Arama (Visual Search)</h3>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0, lineHeight: '1.5' }}>Müşteriler beğendikleri bir seramiğin fotoğrafını yükler; yapay zeka koleksiyonlarınız arasından en benzer deseni 1 saniyede bulur.</p>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(179, 142, 71, 0.1)', color: '#b38e47', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                    <Sparkles size={22} />
                  </div>
                  <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0' }}>Uygulamasız Web 3D Simülatörü</h3>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0, lineHeight: '1.5' }}>Mobil tarayıcı üzerinden hiçbir uygulama indirmeden seramiklerinizi banyo, mutfak veya salonda 360° canlı kaplar.</p>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Link 
                  href="/?tab=studio" 
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                    color: '#ffffff',
                    border: '1px solid rgba(212, 175, 55, 0.4)',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    fontSize: '0.88rem',
                    fontWeight: '900',
                    textDecoration: 'none',
                    width: '100%',
                    maxWidth: '320px'
                  }}
                >
                  <Sparkles size={18} style={{ color: '#d4af37', flexShrink: 0 }} />
                  <span>Canlı 3D Stüdyoyu Şimdi Deneyin</span>
                  <ArrowRight size={16} style={{ flexShrink: 0 }} />
                </Link>
              </div>

            </div>
          )}

          {/* TAB 5: 5-STEP PROCESS FLOW */}
          {activeTab === 'process' && (
            <div className="gt-tab-panel">
              
              <div style={{ marginBottom: '24px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#b38e47', background: 'rgba(179, 142, 71, 0.1)', padding: '4px 12px', borderRadius: '12px' }}>
                  MARKA KATILIM MEKANİZMASI
                </span>
                <h2 style={{ fontSize: 'clamp(1.2rem, 3.5vw, 1.6rem)', fontWeight: '900', color: '#0f172a', margin: '8px 0 6px 0' }}>
                  ⚙️ SeramikBak İhracat ve SEO Motoru Adım Adım Nasıl Çalışır?
                </h2>
                <p style={{ color: '#64748b', margin: 0, fontSize: '0.94rem' }}>
                  Türk ve uluslararası üreticilerin seramiklerini dünya pazarıyla 5 somut adımda buluşturan sistemimiz:
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {[
                  { num: '1', title: 'Ürün Kataloğu & XML / Excel Entegrasyonu', desc: 'Markanızın tüm koleksiyonları, ebatları (60x120, 120x240 vb.), yüzey tipleri (Mat, Parlak) ve 4K doku görselleri sisteme otomatik entegre edilir.' },
                  { num: '2', title: '5 Dilde Otomatik Çeviri & Schema.org Yapısal Veri Üretimi', desc: 'Tüm ürünler Türkçe, İngilizce, Almanca, Arapça ve Rusça dillerine çevrilir. Product, Brand, Offer JSON-LD ve Hreflang etiketleri otomatik fırlatılır.' },
                  { num: '3', title: 'Global BIM / CAD Mimari Şartname Hazırlığı', desc: 'Seramikleriniz Autodesk Revit (.rfa), AutoCAD (.dwg) ve 4K PBR kaplama nesnelerine dönüştürülerek uluslararası mimarların kullanımına açılır.' },
                  { num: '4', title: 'Google Global & Yandex İndeksleme Operasyonu', desc: 'Googlebot ve Yandex botları sitemap.xml üzerinden taranarak Almanya, BAE, İngiltere, ABD ve Suudi Arabistan aramalarında ilk sıraya yükseltilir.' },
                  { num: '5', title: 'Sıfır Komisyon Doğrudan B2B Talep İletimi', desc: 'Gelen yüksek metrajlı otel/konut projesi ve distribütör talepleri doğrulanır ve doğrudan fabrikanızın B2B Marka Kokpitine (/marka) aktarılır.', gold: true }
                ].map((step, idx) => (
                  <div 
                    key={idx} 
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '14px',
                      background: step.gold ? 'linear-gradient(135deg, rgba(253, 251, 247, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%)' : '#f8fafc',
                      border: step.gold ? '1px solid rgba(197, 160, 89, 0.4)' : '1px solid #f1f5f9',
                      borderLeft: step.gold ? '4px solid #b38e47' : '4px solid #0f172a',
                      borderRadius: '14px',
                      padding: '16px'
                    }}
                  >
                    <div style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      background: step.gold ? 'linear-gradient(135deg, #b38e47 0%, #d4af37 100%)' : 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                      color: step.gold ? '#0f172a' : '#d4af37',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '900',
                      fontSize: '0.9rem',
                      flexShrink: 0
                    }}>
                      {step.num}
                    </div>

                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' }}>{step.title}</h4>
                      <p style={{ fontSize: '0.84rem', color: '#475569', margin: 0, lineHeight: '1.5' }}>{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

        </section>

        {/* MARKA BAŞVURU FORMU SECTION */}
        <section id="brand-apply-form" className="gt-form-section">
          <div className="gt-form-grid">
            
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#b38e47', background: 'rgba(179, 142, 71, 0.1)', padding: '4px 12px', borderRadius: '12px' }}>
                MARKA KATILIM FORMU
              </span>
              <h2 style={{ fontSize: 'clamp(1.3rem, 4vw, 1.8rem)', fontWeight: '900', color: '#0f172a', margin: '10px 0 12px 0' }}>
                Markanızı Global Tanıtım Ağına Ekleyin
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.94rem', lineHeight: '1.6', marginBottom: '24px' }}>
                Üretici marka olarak koleksiyonlarınızı 85+ ülkede 5 dilde sergilemek, uluslararası mimari şartnamelere girmek ve B2B talepleri almak için hemen başvurun.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.86rem', color: '#334155', fontWeight: '700' }}>
                  <CheckCircle2 size={18} style={{ color: '#10b981', flexShrink: 0 }} />
                  <span>5 Dilde Otomatik Ürün Çevirisi & SEO İndekslemesi</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.86rem', color: '#334155', fontWeight: '700' }}>
                  <CheckCircle2 size={18} style={{ color: '#10b981', flexShrink: 0 }} />
                  <span>Mimarlar İçin Otomatik 4K CAD / BIM Dosya Üretimi</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.86rem', color: '#334155', fontWeight: '700' }}>
                  <CheckCircle2 size={18} style={{ color: '#10b981', flexShrink: 0 }} />
                  <span>Doğrulanmış B2B İhracat Proje Talepleri Paneli (`/marka`)</span>
                </div>
              </div>
            </div>

            <div>
              {formSubmitted ? (
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', borderRadius: '18px', padding: '30px', textAlign: 'center' }}>
                  <CheckCircle2 size={48} style={{ color: '#10b981', margin: '0 auto 12px auto' }} />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#065f46', margin: '0 0 8px 0' }}>Başvurunuz Başarıyla Alındı!</h3>
                  <p style={{ fontSize: '0.88rem', color: '#047857', margin: 0 }}>İhracat ve Kurumsal Marka Temsilcimiz 24 saat içerisinde sizinle iletişime geçerek kataloğunuzu global ağımıza entegre edecektir.</p>
                </div>
              ) : (
                <form onSubmit={handleBrandSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>Marka / Firma Adı *</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Örn: Qua Granite / Bien Seramik" 
                      value={brandForm.brandName}
                      onChange={(e) => setBrandForm({ ...brandForm, brandName: e.target.value })}
                      style={{ width: '100%', padding: '11px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div className="gt-form-row-2col">
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>Yetkili Adı Soyadı *</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="Ad Soyad" 
                        value={brandForm.contactPerson}
                        onChange={(e) => setBrandForm({ ...brandForm, contactPerson: e.target.value })}
                        style={{ width: '100%', padding: '11px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>Telefon / WhatsApp *</label>
                      <input 
                        type="tel" 
                        required 
                        placeholder="+90 5XX XXX XX XX" 
                        value={brandForm.phone}
                        onChange={(e) => setBrandForm({ ...brandForm, phone: e.target.value })}
                        style={{ width: '100%', padding: '11px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>Kurumsal E-posta Adresi *</label>
                    <input 
                      type="email" 
                      required 
                      placeholder="export@marka.com" 
                      value={brandForm.email}
                      onChange={(e) => setBrandForm({ ...brandForm, email: e.target.value })}
                      style={{ width: '100%', padding: '11px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>Tahmini Koleksiyon Sayısı</label>
                    <select
                      value={brandForm.collectionCount}
                      onChange={(e) => setBrandForm({ ...brandForm, collectionCount: e.target.value })}
                      style={{ width: '100%', padding: '11px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', cursor: 'pointer', boxSizing: 'border-box' }}
                    >
                      <option value="1-5">1 - 5 Koleksiyon</option>
                      <option value="5-15">5 - 15 Koleksiyon</option>
                      <option value="15-30">15 - 30 Koleksiyon</option>
                      <option value="30+">30+ Koleksiyon (Full Entegrasyon)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>Not / Eklemek İstedikleriniz (Opsiyonel)</label>
                    <textarea 
                      rows={3} 
                      placeholder="İhracat yaptığınız öncelikli ülkeler veya özel notlar..." 
                      value={brandForm.note}
                      onChange={(e) => setBrandForm({ ...brandForm, note: e.target.value })}
                      style={{ width: '100%', padding: '11px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }}
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="gt-btn-submit"
                  >
                    <Building2 size={18} style={{ flexShrink: 0 }} />
                    <span>{isSubmitting ? 'Başvuru Gönderiliyor...' : 'Marka İhracat Ağını Başlatın'}</span>
                    <ArrowRight size={16} style={{ flexShrink: 0 }} />
                  </button>

                </form>
              )}
            </div>

          </div>
        </section>

      </div>
    </div>
  );
}
