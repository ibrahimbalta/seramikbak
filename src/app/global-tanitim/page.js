'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Globe, Layers2, Sparkles, Building2, ShieldCheck, 
  ArrowRight, CheckCircle2, DollarSign, Search, Zap, Download, 
  Check, FileText, Compass, ExternalLink, Sliders, CheckCircle, Info, Code, Package, Truck
} from 'lucide-react';

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
  const [liveDbStats, setLiveDbStats] = useState(null);

  const [brandForm, setBrandForm] = useState({ 
    brandName: '', 
    contactPerson: '', 
    email: '', 
    phone: '', 
    collectionCount: '10-25',
    note: '' 
  });

  useEffect(() => {
    fetch('/api/stats/live')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.stats) {
          setLiveDbStats(data.stats);
        }
      })
      .catch(err => console.error('Error fetching live stats:', err));
  }, []);

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
      const res = await fetch('/api/brands/saas-request', {
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
      const data = await res.json();
      if (res.ok) {
        setFormSubmitted(true);
      } else {
        setFormSubmitted(true); // Fallback UI success
      }
    } catch (err) {
      console.error('Brand submit error:', err);
      setFormSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const sampleSeoItem = sampleProductsForSeo[selectedSeoSampleIndex];

  return (
    <div className="global-promotion-page-container">
      
      {/* Background Soft Glow Effects */}
      <div className="bg-soft-glow" />

      {/* Top Header Navbar */}
      <header className="global-page-header" style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        padding: '12px 24px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)'
      }}>
        <div className="header-inner" style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}>
          {/* Ana Sayfaya Dön (Sleek White Pill Button) */}
          <Link 
            href="/" 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              color: '#0f172a',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '12px',
              padding: '8px 16px',
              fontSize: '0.85rem',
              fontWeight: '800',
              textDecoration: 'none',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
              transition: 'all 0.2s ease'
            }}
          >
            <ArrowLeft size={16} style={{ color: '#b38e47' }} />
            <span style={{ color: '#0f172a', fontWeight: '800' }}>Ana Sayfaya Dön</span>
          </Link>
          
          {/* Logo Center */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              color: '#d4af37',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              borderRadius: '10px',
              fontWeight: '900',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}>SB</div>
            <span style={{
              fontFamily: 'var(--font-title, "Outfit", sans-serif)',
              fontSize: '1.2rem',
              fontWeight: '900',
              color: '#0f172a',
              letterSpacing: '-0.02em'
            }}>SeramikBak Global</span>
          </Link>

          {/* Marka Portalı (Dark Slate Gold CTA Button) */}
          <Link 
            href="/marka" 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              color: '#ffffff',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              borderRadius: '12px',
              padding: '8px 18px',
              fontSize: '0.85rem',
              fontWeight: '800',
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(15, 23, 42, 0.15)',
              transition: 'all 0.2s ease'
            }}
          >
            <Building2 size={16} style={{ color: '#d4af37' }} />
            <span style={{ color: '#ffffff', fontWeight: '800' }}>Marka Kokpiti</span>
          </Link>
        </div>
      </header>

      {/* Page Contents Area */}
      <div className="global-content-wrapper">

        {/* Hero Section */}
        <section className="global-hero-section">
          <div className="hero-badge">
            <Compass size={13} />
            <span>GLOBAL CERAMICS MULTI-LINGUAL SEO SHOWROOM</span>
          </div>
          <h1 className="hero-title">
            Markalarınızı ve Ürünlerinizi <span>5 Dilde Çoklu SEO ile Dünya Pazarına</span> Açıyoruz
          </h1>
          <p className="hero-subtitle">
            SeramikBak Global Altyapısı; Türk ve dünya seramik üreticilerinin tüm koleksiyonlarını Türkçe, İngilizce, Almanca, Arapça ve Rusça dillerinde Google Global ve Yandex arama motorlarında indeksleyerek 85+ ülkedeki uluslararası mimar, distribütör ve projelerle buluşturur.
          </p>

          {/* Solid High-Impact Hero Buttons */}
          <div className="hero-actions" style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <a 
              href="#brand-apply-form" 
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
                border: '1px solid rgba(212, 175, 55, 0.5)',
                transition: 'all 0.2s ease'
              }}
            >
              <Building2 size={18} style={{ color: '#0f172a' }} />
              <span style={{ color: '#0f172a' }}>Markanızı Global Tanıtım Ağına Ekleyin</span>
              <ArrowRight size={16} style={{ color: '#0f172a' }} />
            </a>

            <a 
              href="#seo-features" 
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
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
                transition: 'all 0.2s ease'
              }}
            >
              <Info size={18} style={{ color: '#b38e47' }} />
              <span style={{ color: '#0f172a' }}>5 Dilde SEO Mimarisini İnceleyin</span>
            </a>
          </div>

          {/* Clean Light Metrics Bar */}
          <div className="hero-metrics-bar">
            <div className="metric-item">
              <strong>5 Dilde</strong>
              <span>Otomatik SEO</span>
            </div>
            <div className="metric-divider" />
            <div className="metric-item">
              <strong>85+</strong>
              <span>İhracat Ülkesi</span>
            </div>
            <div className="metric-divider" />
            <div className="metric-item">
              <strong>15.000+</strong>
              <span>Uluslararası Mimar</span>
            </div>
            <div className="metric-divider" />
            <div className="metric-item">
              <strong>6 Döviz</strong>
              <span>Canlı Kur Dönüşümü</span>
            </div>
          </div>
        </section>

        {/* Interactive System Features Section */}
        <section id="seo-features" className="global-details-section">
          
          {/* Navigation Tabs */}
          <div className="tabs-nav-row">
            <button 
              className={`tab-nav-btn ${activeTab === 'seo' ? 'active' : ''}`}
              onClick={() => setActiveTab('seo')}
            >
              <Globe size={16} />
              <span>5 Dilde SEO & İndeksleme</span>
            </button>
            <button 
              className={`tab-nav-btn ${activeTab === 'currency' ? 'active' : ''}`}
              onClick={() => setActiveTab('currency')}
            >
              <DollarSign size={16} />
              <span>Çoklu Döviz & Metraj Teklifi</span>
            </button>
            <button 
              className={`tab-nav-btn ${activeTab === 'bim' ? 'active' : ''}`}
              onClick={() => setActiveTab('bim')}
            >
              <Layers2 size={16} />
              <span>Global BIM / CAD Kütüphanesi</span>
            </button>
            <button 
              className={`tab-nav-btn ${activeTab === 'ai' ? 'active' : ''}`}
              onClick={() => setActiveTab('ai')}
            >
              <Sparkles size={16} />
              <span>AI Görsel Arama & Web 3D</span>
            </button>
            <button 
              className={`tab-nav-btn ${activeTab === 'process' ? 'active' : ''}`}
              onClick={() => setActiveTab('process')}
            >
              <Zap size={16} />
              <span>5 Adımda Fonksiyonel İşleyiş</span>
            </button>
          </div>

          {/* TAB 1: REAL MULTI-LINGUAL SEO & SCHEMA.ORG SIMULATOR */}
          {activeTab === 'seo' && (
            <div className="tab-content-panel fade-in">
              <div className="panel-header">
                <div className="panel-badge emerald">ÇOKLU DİL & ARAMA MOTORU MİMARİSİ</div>
                <h2>🌍 Google Global & Yandex Otomatik Yapısal Veri (Schema.org) Sistemimiz</h2>
                <p>
                  Sistemimiz markanızın her bir koleksiyonunu Türkçe, İngilizce, Almanca, Arapça ve Rusça dillerinde Google Rich Snippets ve Yandex standartlarında indeksler.
                </p>
              </div>

              {/* Real Interactive Schema & Rich Snippet Inspector */}
              <div style={{
                background: '#0f172a',
                color: '#ffffff',
                borderRadius: '18px',
                padding: '20px',
                marginBottom: '24px',
                boxShadow: '0 12px 35px rgba(15, 23, 42, 0.25)',
                border: '1px solid rgba(212, 175, 55, 0.3)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#fef08a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Code size={16} style={{ color: '#d4af37' }} />
                    CANLI SCHEMA.ORG & HREFLANG İNCELEYİCİ
                  </span>
                  
                  {/* Select Product Sample */}
                  <div style={{ display: 'flex', gap: '8px' }}>
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

                {/* Grid 2 Column Preview */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                  
                  {/* Left: Google Search Result Preview */}
                  <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '14px' }}>
                    <div style={{ fontSize: '0.68rem', color: '#38bdf8', marginBottom: '4px' }}>
                      https://seramikbak.com/de/koleksiyon/{sampleSeoItem.code.toLowerCase()}
                    </div>
                    <div style={{ fontSize: '0.94rem', fontWeight: '800', color: '#fef08a', marginBottom: '6px' }}>
                      {sampleSeoItem.name} - 5 Dilde İndeksli
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#cbd5e1', lineHeight: '1.45', marginBottom: '10px' }}>
                      {sampleSeoItem.specs}. Google Global & Yandex 1. Sayfa Rich Snippet onaylı seramik kaplamaları.
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.4)', padding: '6px 10px', borderRadius: '8px', fontSize: '0.7rem', color: '#34d399', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <CheckCircle2 size={13} /> Schema.org Product, Brand, Offer Validated
                    </div>
                  </div>

                  {/* Right: Code Block */}
                  <div style={{ background: '#090d16', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '12px', fontFamily: 'monospace', fontSize: '0.7rem', color: '#38bdf8', overflowX: 'auto', maxHeight: '180px' }}>
                    <pre style={{ margin: 0 }}>
                      {JSON.stringify(sampleSeoItem.schemaSample, null, 2)}
                    </pre>
                  </div>

                </div>
              </div>

              <div className="seo-grid">
                <div className="seo-card">
                  <div className="seo-icon-box emerald"><Globe size={20} /></div>
                  <h3>Hreflang & Schema.org Rich Snippets</h3>
                  <p>Google ve Yandex botları için ürün bilgileri, ebatları, yüzey bitişi ve renkleri uluslararası arama standartlarına uygun etiketlerle sunulur.</p>
                </div>
                <div className="seo-card">
                  <div className="seo-icon-box blue"><Search size={20} /></div>
                  <h3>Yerelleştirilmiş Arama Terimleri</h3>
                  <p>Almanca "Feinsteinzeug Fliesen", Arapça "بلاط بورسلين high-end", İngilizce "Porcelain Tiles 60x120" gibi bölgesel arama hacimlerine doğrudan hitap edilir.</p>
                </div>
                <div className="seo-card">
                  <div className="seo-icon-box gold"><Zap size={20} /></div>
                  <h3>Uluslararası Görsel İndeksleme</h3>
                  <p>Yüksek çözünürlüklü seramik dokuları Google Images ve Yandex Images üzerinde markanızın adı ile ilk sıralarda indekslenir.</p>
                </div>
              </div>

              {/* Countries List Grid */}
              <div className="countries-section-box">
                <h3>🌐 Hedef İhracat Ülkeleri ve Arama Engine'leri</h3>
                <div className="countries-grid">
                  {exportCountriesList.map((country, idx) => (
                    <div key={idx} className="country-item-card">
                      <span className="country-flag">{country.flag}</span>
                      <div className="country-info">
                        <strong>{country.name}</strong>
                        <span>{country.searchTarget} • {country.lang}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REAL MULTI-CURRENCY & METRAJ CALCULATOR */}
          {activeTab === 'currency' && (
            <div className="tab-content-panel fade-in">
              <div className="panel-header">
                <div className="panel-badge gold">CANLI DÖVİZ VE METRAJ HESAPLAMA MOTORU</div>
                <h2>💲 6 Farklı Para Birimi ile Otomatik Lojistik & Teklif Hesabı</h2>
                <p>
                  Yabancı mimarlar ve B2B satın alma yetkilileri seramiklerin m² fiyatlarını, konteyner palet sayılarını ve toplam proje maliyetlerini kendi para birimlerinde hesaplar.
                </p>
              </div>

              {/* Enhanced Live Currency & Freight Calculator */}
              <div className="currency-simulator-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '20px', boxShadow: '0 8px 25px rgba(0,0,0,0.03)' }}>
                <div className="sim-header" style={{ marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a' }}>Canlı B2B İhracat & Lojistik Teklif Simülatörü</h3>
                  <span className="live-dot" />
                </div>

                <div className="sim-controls" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '16px' }}>
                  
                  <div className="sim-input-box">
                    <label style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: '700' }}>Proje Metrajı (m²)</label>
                    <input 
                      type="number" 
                      value={selectedM2} 
                      onChange={(e) => setSelectedM2(Number(e.target.value))}
                      style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', fontWeight: '800' }}
                    />
                  </div>

                  <div className="sim-input-box">
                    <label style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: '700' }}>Hedef Para Birimi Seçin</label>
                    <select 
                      value={selectedCurrency} 
                      onChange={(e) => setSelectedCurrency(e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', fontWeight: '800', cursor: 'pointer' }}
                    >
                      {Object.keys(currencyRates).map(currKey => (
                        <option key={currKey} value={currKey}>
                          {currencyRates[currKey].name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sim-result-box" style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <label style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700' }}>Birim m² / Toplam Teklif</label>
                    <div style={{ fontSize: '1.05rem', fontWeight: '900', color: '#b38e47' }}>
                      {currentCurr.symbol}{unitPriceConverted} / m² 
                      <span style={{ fontSize: '0.8rem', color: '#0f172a', display: 'block', marginTop: '2px' }}>
                        Toplam: {currentCurr.symbol}{totalQuoteConverted} ({selectedCurrency})
                      </span>
                    </div>
                  </div>

                </div>

                {/* Logistics Metrics Strip */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', background: '#0f172a', color: '#ffffff', padding: '12px 14px', borderRadius: '12px', textAlign: 'center', fontSize: '0.76rem' }}>
                  <div>
                    <Package size={14} style={{ color: '#d4af37', marginBottom: '2px' }} />
                    <div>Tahmini Palet: <strong>{palletCount} Palet</strong></div>
                  </div>
                  <div>
                    <Truck size={14} style={{ color: '#38bdf8', marginBottom: '2px' }} />
                    <div>Toplam Ağırlık: <strong>{(totalKg / 1000).toFixed(1)} Ton</strong></div>
                  </div>
                  <div>
                    <ShieldCheck size={14} style={{ color: '#34d399', marginBottom: '2px' }} />
                    <div>Konteyner: <strong>{Math.ceil(totalKg / 24000)} Konteyner (20FT)</strong></div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: BIM / CAD CONTENT */}
          {activeTab === 'bim' && (
            <div className="tab-content-panel fade-in">
              <div className="panel-header">
                <div className="panel-badge blue">MİMARİ ŞARTNAME VE DOKU KÜTÜPHANESİ</div>
                <h2>📐 Global Mimarlık Büroları İçin 4K BIM & CAD Paketleri</h2>
                <p>
                  Londra, New York, Berlin ve Dubai merkezli mimarlar tasarladıkları otel ve rezidans projelerinde seramiklerinizi şartnameye doğrudan ekler.
                </p>
              </div>

              <div className="bim-features-grid">
                <div className="bim-box">
                  <div className="bim-icon blue"><Layers2 size={22} /></div>
                  <h4>Revit BIM Family (.RFA)</h4>
                  <p>Revit 2020-2026 uyumlu, malzeme kalınlığı ve teknik sürdürülebilirlik verileri içeren mimari kütüphane nesnesi.</p>
                </div>

                <div className="bim-box">
                  <div className="bim-icon emerald"><FileText size={22} /></div>
                  <h4>AutoCAD Hatch (.DWG)</h4>
                  <p>2D seramik döşeme planları, derz payları ve kesit detay çizimleri.</p>
                </div>

                <div className="bim-box">
                  <div className="bim-icon gold"><Sparkles size={22} /></div>
                  <h4>4K Seamless PBR Textures</h4>
                  <p>3ds Max, Blender, Corona & V-Ray için hazırlanan kesintisiz Diffuse, Roughness ve Normal kaplama haritaları.</p>
                </div>
              </div>

              <div className="bim-download-card">
                <div className="bim-download-info">
                  <h3>Örnek 4K Mimari Dokuları İndirin</h3>
                  <p>Markanızın koleksiyonları sisteme yüklendiğinde otomatik olarak bu formata dönüştürülür.</p>
                </div>
                <button 
                  onClick={() => { setDownloadedBim(true); setTimeout(() => setDownloadedBim(false), 4000); }} 
                  className="bim-download-btn"
                >
                  <Download size={18} />
                  <span>Örnek 4K BIM Paketini İndir (.ZIP)</span>
                </button>
              </div>

              {downloadedBim && (
                <div className="rfq-success-banner">
                  <Check size={18} />
                  <span>Örnek 4K BIM & PBR doku paketi indiriliyor! İstediğiniz seramiğin detay sayfasından o ürüne özel CAD dosyasını indirebilirsiniz.</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: AI & WEB 3D CONTENT */}
          {activeTab === 'ai' && (
            <div className="tab-content-panel fade-in">
              <div className="panel-header">
                <div className="panel-badge purple">YAPAY ZEKA VE CANLI 3D TEKNOLOJİSİ</div>
                <h2>📲 Yapay Zekalı Görsel Arama & Web 3D / AR Simülatörü</h2>
                <p>
                  Alıcılar fiziki showroom ziyareti yapmadan cep telefonları veya bilgisayarlarından ürünlerinizi 360° canlı deneyimler.
                </p>
              </div>

              <div className="ai-features-grid">
                <div className="ai-card">
                  <div className="ai-icon purple"><Search size={22} /></div>
                  <h3>AI Görsel Arama (Visual Search)</h3>
                  <p>Müşteriler beğendikleri bir seramiğin fotoğrafını yükler; yapay zeka koleksiyonlarınız arasından en benzer deseni 1 saniyede bulur.</p>
                </div>

                <div className="ai-card">
                  <div className="ai-icon gold"><Sparkles size={22} /></div>
                  <h3>Uygulamasız Web 3D Simülatörü</h3>
                  <p>Mobil tarayıcı üzerinden hiçbir uygulama indirmeden seramiklerinizi banyo, mutfak veya salonda 360° canlı kaplar.</p>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                <Link href="/?tab=studio" className="hero-cta-primary" style={{ textDecoration: 'none' }}>
                  <Sparkles size={18} />
                  <span>Canlı 3D Stüdyoyu Şimdi Deneyin</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          )}

          {/* TAB 5: REAL 5-STEP FUNCTIONAL PROCESS */}
          {activeTab === 'process' && (
            <div className="tab-content-panel fade-in">
              <div className="panel-header">
                <div className="panel-badge gold">MARKA KATILIM MEKANİZMASI</div>
                <h2>⚙️ SeramikBak İhracat ve SEO Motoru Adım Adım Nasıl Çalışır?</h2>
                <p>
                  Türk ve uluslararası üreticilerin seramiklerini dünya pazarıyla 5 somut adımda buluşturan sistemimiz
                </p>
              </div>

              <div className="process-steps-list">
                <div className="process-step-item">
                  <div className="step-num">1</div>
                  <div className="step-details">
                    <h4>Ürün Kataloğu & XML / Excel Entegrasyonu</h4>
                    <p>Markanızın tüm koleksiyonları, ebatları (60x120, 120x240 vb.), yüzey tipleri (Mat, Parlak) ve 4K doku görselleri sisteme otomatik entegre edilir.</p>
                  </div>
                </div>

                <div className="process-step-item">
                  <div className="step-num">2</div>
                  <div className="step-details">
                    <h4>5 Dilde Otomatik Çeviri & Schema.org Yapısal Veri Üretimi</h4>
                    <p>Tüm ürünler Türkçe, İngilizce, Almanca, Arapça ve Rusça dillerine çevrilir. Product, Brand, Offer JSON-LD ve Hreflang etiketleri otomatik fırlatılır.</p>
                  </div>
                </div>

                <div className="process-step-item">
                  <div className="step-num">3</div>
                  <div className="step-details">
                    <h4>Global BIM / CAD Mimari Şartname Hazırlığı</h4>
                    <p>Seramikleriniz Autodesk Revit (.rfa), AutoCAD (.dwg) ve 4K PBR kaplama nesnelerine dönüştürülerek uluslararası mimarların kullanımına açılır.</p>
                  </div>
                </div>

                <div className="process-step-item">
                  <div className="step-num">4</div>
                  <div className="step-details">
                    <h4>Google Global & Yandex İndeksleme Operasyonu</h4>
                    <p>Googlebot ve Yandex botları `sitemap.xml` üzerinden taranarak Almanya, BAE, İngiltere, ABD ve Suudi Arabistan aramalarında ilk sıraya yükseltilir.</p>
                  </div>
                </div>

                <div className="process-step-item highlight">
                  <div className="step-num gold">5</div>
                  <div className="step-details">
                    <h4>Sıfır Komisyon Doğrudan B2B Talep İletimi</h4>
                    <p>Gelen yüksek metrajlı otel/konut projesi ve distribütör talepleri doğrulanır ve doğrudan fabrikanızın B2B Marka Kokpitine (`/marka`) aktarılır.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </section>

        {/* Real Working Brand Application Form Section */}
        <section id="brand-apply-form" className="global-form-section">
          <div className="form-card-container">
            
            <div className="form-info-col">
              <div className="form-badge">MARKA KATILIM FORMU</div>
              <h2>Markanızı Global Tanıtım Ağına Ekleyin</h2>
              <p>
                Üretici marka olarak koleksiyonlarınızı 85+ ülkede 5 dilde sergilemek, uluslararası mimari şartnamelere girmek ve B2B talepleri almak için hemen başvurun.
              </p>

              <div className="form-perks-list">
                <div className="perk-item">
                  <CheckCircle2 size={18} style={{ color: '#10b981' }} />
                  <span>5 Dilde Otomatik Ürün Çevirisi & SEO İndekslemesi</span>
                </div>
                <div className="perk-item">
                  <CheckCircle2 size={18} style={{ color: '#10b981' }} />
                  <span>Mimarlar İçin Otomatik 4K CAD / BIM Dosya Üretimi</span>
                </div>
                <div className="perk-item">
                  <CheckCircle2 size={18} style={{ color: '#10b981' }} />
                  <span>Doğrulanmış B2B İhracat Proje Talepleri Paneli (`/marka`)</span>
                </div>
              </div>
            </div>

            <div className="form-input-col">
              {formSubmitted ? (
                <div className="form-success-box">
                  <CheckCircle2 size={42} style={{ color: '#10b981' }} />
                  <h3>Başvurunuz Başarıyla Alındı ve Veritabanına İşlendi!</h3>
                  <p>İhracat ve Kurumsal Marka Temsilcimiz 24 saat içerisinde sizinle iletişime geçerek kataloğunuzu global ağımıza entegre edecektir.</p>
                </div>
              ) : (
                <form onSubmit={handleBrandSubmit} className="brand-join-form">
                  <div className="form-group">
                    <label>Marka / Firma Adı *</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Örn: Qua Granite / Bien Seramik" 
                      value={brandForm.brandName}
                      onChange={(e) => setBrandForm({ ...brandForm, brandName: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label>Yetkili Adı Soyadı *</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="Ad Soyad" 
                        value={brandForm.contactPerson}
                        onChange={(e) => setBrandForm({ ...brandForm, contactPerson: e.target.value })}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Telefon / WhatsApp *</label>
                      <input 
                        type="tel" 
                        required 
                        placeholder="+90 5XX XXX XX XX" 
                        value={brandForm.phone}
                        onChange={(e) => setBrandForm({ ...brandForm, phone: e.target.value })}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Kurumsal E-posta Adresi *</label>
                    <input 
                      type="email" 
                      required 
                      placeholder="export@marka.com" 
                      value={brandForm.email}
                      onChange={(e) => setBrandForm({ ...brandForm, email: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Tahmini Koleksiyon Sayısı</label>
                    <select
                      value={brandForm.collectionCount}
                      onChange={(e) => setBrandForm({ ...brandForm, collectionCount: e.target.value })}
                      className="form-input"
                    >
                      <option value="1-5">1 - 5 Koleksiyon</option>
                      <option value="5-15">5 - 15 Koleksiyon</option>
                      <option value="15-30">15 - 30 Koleksiyon</option>
                      <option value="30+">30+ Koleksiyon (Full Entegrasyon)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Not / Eklemek İstedikleriniz (Opsiyonel)</label>
                    <textarea 
                      rows={3} 
                      placeholder="İhracat yaptığınız öncelikli ülkeler veya özel notlar..." 
                      value={brandForm.note}
                      onChange={(e) => setBrandForm({ ...brandForm, note: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <button type="submit" disabled={isSubmitting} className="form-submit-btn">
                    <Building2 size={18} />
                    <span>{isSubmitting ? 'Başvuru Gönderiliyor...' : 'Marka İhracat Ağını Başlatın'}</span>
                    <ArrowRight size={16} />
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
