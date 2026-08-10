'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Globe, Layers2, Sparkles, Building2, ShieldCheck, 
  ArrowRight, CheckCircle2, DollarSign, Search, Zap, Download, 
  Check, FileText, Compass, ExternalLink, Sliders, CheckCircle, Info
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

export default function GlobalPromotionPage() {
  const [activeTab, setActiveTab] = useState('seo'); // 'seo', 'currency', 'bim', 'ai', 'process'
  const [downloadedBim, setDownloadedBim] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [brandForm, setBrandForm] = useState({ brandName: '', contactPerson: '', email: '', phone: '', note: '' });

  const samplePriceM2 = 450; // TRY base
  const currencyRates = {
    TRY: { symbol: '₺', rate: 1, name: 'Türk Lirası' },
    USD: { symbol: '$', rate: 0.027, name: 'US Dollar' },
    EUR: { symbol: '€', rate: 0.025, name: 'Euro' },
    GBP: { symbol: '£', rate: 0.021, name: 'British Pound' },
    SAR: { symbol: '﷼', rate: 0.10, name: 'Saudi Riyal' },
    RUB: { symbol: '₽', rate: 2.40, name: 'Russian Ruble' }
  };

  const currentCurr = currencyRates[selectedCurrency];
  const convertedPrice = (samplePriceM2 * currentCurr.rate).toFixed(2);

  const handleBrandSubmit = (e) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  return (
    <div className="global-promotion-page-container">
      
      {/* Background Soft Glow Effects */}
      <div className="bg-soft-glow" />

      {/* Top Header Navbar (Matching /ilham Page) */}
      <header className="global-page-header">
        <div className="header-inner">
          <Link href="/" className="back-link">
            <ArrowLeft size={16} />
            <span>Ana Sayfaya Dön</span>
          </Link>
          
          <div className="header-brand">
            <div className="logo-icon">SB</div>
            <span className="logo-text">SeramikBak Global</span>
          </div>

          <Link href="/marka" className="header-join-btn">
            <Building2 size={15} />
            <span>Marka Portalı</span>
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

          <div className="hero-actions">
            <a href="#brand-apply-form" className="hero-cta-primary">
              <Building2 size={16} />
              <span>Markanızı Global Tanıtım Ağına Ekleyin</span>
              <ArrowRight size={15} />
            </a>
            <a href="#seo-features" className="hero-cta-secondary">
              <Info size={16} />
              <span>5 Dilde SEO Mimarisini İnceleyin</span>
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

        {/* Interactive Tabs Section */}
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
              <span>Çoklu Döviz (Multi-Currency)</span>
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
              <span>5 Adımda Eşleştirme Motoru</span>
            </button>
          </div>

          {/* Tab 1: Multi-lingual SEO Content */}
          {activeTab === 'seo' && (
            <div className="tab-content-panel fade-in">
              <div className="panel-header">
                <div className="panel-badge emerald">ÇOKLU DİL & ARAMA MOTORU YÖNETİMİ</div>
                <h2>🌍 Google Global & Yandex Üst Sıra Sıralama Mimarisi</h2>
                <p>
                  SeramikBak altyapısı, markanızın eklediği her seramik modelini otomatik olarak 5 uluslararası dile çevirir ve arama motorları için optimize eder.
                </p>
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

          {/* Tab 2: Multi-Currency Content */}
          {activeTab === 'currency' && (
            <div className="tab-content-panel fade-in">
              <div className="panel-header">
                <div className="panel-badge gold">CANLI DÖVİZ VE FİYAT HESAPLAMA</div>
                <h2>💲 6 Farklı Para Birimi ile Uluslararası Teklif Alma</h2>
                <p>
                  Yabancı mimarlar ve B2B satın alma yetkilileri seramiklerin m² fiyatlarını ve bütçe hesaplamalarını anında kendi yerel para birimlerinde görür.
                </p>
              </div>

              {/* Interactive Currency Converter Simulator */}
              <div className="currency-simulator-card">
                <div className="sim-header">
                  <h3>Canlı Kur Dönüşüm Simülatörü</h3>
                  <span className="live-dot" />
                </div>

                <div className="sim-controls">
                  <div className="sim-input-box">
                    <label>Örnek Seramik m² Fiyatı (TRY)</label>
                    <div className="sim-val">₺{samplePriceM2} / m²</div>
                  </div>

                  <div className="sim-input-box">
                    <label>Hedef Para Birimi Seçin</label>
                    <select 
                      value={selectedCurrency} 
                      onChange={(e) => setSelectedCurrency(e.target.value)}
                      className="sim-select"
                    >
                      {Object.keys(currencyRates).map(currKey => (
                        <option key={currKey} value={currKey}>
                          {currKey} - {currencyRates[currKey].name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sim-result-box">
                    <label>Müşterinin Göreceği m² Fiyatı</label>
                    <div className="sim-result-val">
                      {currentCurr.symbol}{convertedPrice} <span>/ m² ({selectedCurrency})</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="currency-cards-grid">
                <div className="curr-card">
                  <strong>$ USD (US Dollar)</strong>
                  <span>Kuzey Amerika, Orta Doğu & Küresel B2B İhracat</span>
                </div>
                <div className="curr-card">
                  <strong>€ EUR (Euro)</strong>
                  <span>Almanya, Fransa, Hollanda & Avrupa Birliği</span>
                </div>
                <div className="curr-card">
                  <strong>£ GBP (British Pound)</strong>
                  <span>İngiltere & Birleşik Krallık Mimari Projeleri</span>
                </div>
                <div className="curr-card">
                  <strong>﷼ SAR (Saudi Riyal)</strong>
                  <span>Suudi Arabistan VISION 2030 Dev Projeleri</span>
                </div>
                <div className="curr-card">
                  <strong>₽ RUB (Russian Ruble)</strong>
                  <span>Rusya Federasyonu & BDT Bölgesi</span>
                </div>
                <div className="curr-card">
                  <strong>₺ TRY (Türk Lirası)</strong>
                  <span>Yerel Türkiye Projeleri & Bayi Ağı</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: BIM / CAD Content */}
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

          {/* Tab 4: AI & Web 3D Content */}
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

          {/* Tab 5: Process Step-by-Step */}
          {activeTab === 'process' && (
            <div className="tab-content-panel fade-in">
              <div className="panel-header">
                <div className="panel-badge gold">MARKA KATILIM MEKANİZMASI</div>
                <h2>⚙️ SeramikBak İhracat ve SEO Motoru Nasıl Çalışır?</h2>
                <p>
                  Türk ve uluslararası üreticilerin seramiklerini dünya pazarıyla 5 adımda buluşturan sistemimiz
                </p>
              </div>

              <div className="process-steps-list">
                <div className="process-step-item">
                  <div className="step-num">1</div>
                  <div className="step-details">
                    <h4>5 Dilde Otomatik SEO & Google/Yandex İndekslemesi</h4>
                    <p>Markanızın tüm ürünleri Türkçe, İngilizce, Almanca, Arapça ve Rusça indekslenir. Dubai, Hamburg veya New York'taki bir alıcı Google Global'de arama yaptığında ürünleriniz en üstte listelenir.</p>
                  </div>
                </div>

                <div className="process-step-item">
                  <div className="step-num">2</div>
                  <div className="step-details">
                    <h4>Çoklu Döviz Cinsi ile Uluslararası Fiyat Görünürlüğü</h4>
                    <p>Alıcılar $ USD, € EUR, £ GBP, ﷼ SAR, ₽ RUB veya ₺ TRY cinsinden canlı fiyatları ve metraj bütçelerini kendi para birimlerinde hesaplayarak teklif talebi gönderir.</p>
                  </div>
                </div>

                <div className="process-step-item">
                  <div className="step-num">3</div>
                  <div className="step-details">
                    <h4>Global BIM / CAD Mimari Şartname Entegrasyonu</h4>
                    <p>Uluslararası mimarlık ofisleri basılı katalog yerine Revit (.rfa), AutoCAD (.dwg) ve 4K dikişsiz PBR dokuları indirir. Seramikleriniz doğrudan yurt dışındaki dev otel ve konut projelerinin şartnamesine girer.</p>
                  </div>
                </div>

                <div className="process-step-item">
                  <div className="step-num">4</div>
                  <div className="step-details">
                    <h4>Yapay Zekalı Görsel Arama & Web 3D/AR Simülatörü</h4>
                    <p>Alıcılar fotoğraf yükleyerek seramiklerinizi arayabilir ve fiziki showroom ziyareti yapmadan cep telefonu veya bilgisayar üzerinden seramiklerinizi 360° sanal banyoda veya kendi mekanlarında AR ile canlı dener.</p>
                  </div>
                </div>

                <div className="process-step-item highlight">
                  <div className="step-num gold">5</div>
                  <div className="step-details">
                    <h4>Onaylı Uluslararası Proje Taleplerinin Marka Kokpitine İletilmesi</h4>
                    <p>Gelen yüksek metrajlı proje ve distribütör alım talepleri doğrulanır (Firma adı, Ülke, Proje m²) ve doğrudan markanızın B2B İhracat Paneline (`/marka`) ve ihracat müdürünüze aktarılır.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </section>

        {/* Brand Application Form Section */}
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
                  <h3>Başvurunuz Başarıyla Alındı!</h3>
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
                    <label>Not / Eklemek İstedikleriniz (Opsiyonel)</label>
                    <textarea 
                      rows="3" 
                      placeholder="Koleksiyon sayısı, ebatlar ve hedef ihracat pazarlarınız..." 
                      value={brandForm.note}
                      onChange={(e) => setBrandForm({ ...brandForm, note: e.target.value })}
                      className="form-textarea"
                    />
                  </div>

                  <button type="submit" className="form-submit-btn">
                    <Building2 size={18} />
                    <span>Marka Başvurusunu Gönder</span>
                    <ArrowRight size={16} />
                  </button>
                </form>
              )}
            </div>

          </div>
        </section>

      </div>

      {/* Page Footer */}
      <footer className="global-page-footer">
        <p>© 2026 SeramikBak Global Portal. Tüm Hakları Saklıdır. Türkiye'nin ve Dünya Seramiğinin İhracat Vitrini.</p>
      </footer>

      <style jsx>{`
        .global-promotion-page-container {
          min-height: 100vh;
          background: #f8fafc;
          color: #0f172a;
          font-family: var(--font-body, sans-serif);
          position: relative;
          overflow-x: hidden;
        }

        .bg-soft-glow {
          position: absolute;
          top: 0;
          left: 10%;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(179, 142, 71, 0.06) 0%, transparent 60%);
          pointer-events: none;
          z-index: 0;
        }

        .global-page-header {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
          position: sticky;
          top: 0;
          z-index: 1000;
          padding: 14px 24px;
          box-shadow: 0 4px 25px rgba(0, 0, 0, 0.03);
        }

        .header-inner {
          max-width: 1100px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .back-link {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #0f172a;
          text-decoration: none;
          font-size: 0.88rem;
          font-weight: 700;
          transition: color 0.2s;
        }

        .back-link:hover {
          color: #b38e47;
        }

        .header-brand {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .logo-icon {
          width: 34px;
          height: 34px;
          background: #0f172a;
          color: #b38e47;
          border-radius: 8px;
          font-weight: 900;
          font-size: 0.95rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logo-text {
          font-family: var(--font-title);
          font-size: 1.15rem;
          font-weight: 800;
          color: #0f172a;
        }

        .header-join-btn {
          background: #0f172a;
          color: #ffffff;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 800;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
        }

        .header-join-btn:hover {
          background: #b38e47;
          color: #ffffff;
        }

        .global-content-wrapper {
          max-width: 1100px;
          margin: 0 auto;
          padding: 50px 24px 80px 24px;
          position: relative;
          z-index: 1;
        }

        /* HERO SECTION */
        .global-hero-section {
          text-align: center;
          margin-bottom: 50px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(179, 142, 71, 0.1);
          border: 1px solid rgba(179, 142, 71, 0.25);
          color: #8c6b30;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 0.05em;
          margin-bottom: 16px;
        }

        .hero-title {
          font-size: clamp(2rem, 4.5vw, 2.8rem);
          font-weight: 900;
          letter-spacing: -0.025em;
          line-height: 1.25;
          margin: 0 0 16px 0;
          color: #0f172a;
        }

        .hero-title span {
          color: #b45309;
        }

        .hero-subtitle {
          font-size: 1.05rem;
          color: #64748b;
          max-width: 760px;
          margin: 0 auto 24px auto;
          line-height: 1.6;
        }

        .hero-actions {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .hero-cta-primary {
          background: linear-gradient(135deg, #b38e47 0%, #987532 100%);
          color: #ffffff;
          padding: 12px 24px;
          border-radius: 12px;
          font-size: 0.88rem;
          font-weight: 900;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 6px 20px rgba(179, 142, 71, 0.25);
          transition: all 0.2s;
        }

        .hero-cta-primary:hover {
          background: linear-gradient(135deg, #987532 0%, #7c5c22 100%);
          transform: translateY(-2px);
        }

        .hero-cta-secondary {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          color: #334155;
          padding: 12px 20px;
          border-radius: 12px;
          font-size: 0.85rem;
          font-weight: 700;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
        }

        .hero-cta-secondary:hover {
          background: #f1f5f9;
          border-color: #94a3b8;
        }

        .hero-metrics-bar {
          display: flex;
          align-items: center;
          gap: 24px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          padding: 16px 28px;
          border-radius: 16px;
          margin-top: 32px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
        }

        .metric-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
          text-align: center;
        }

        .metric-item strong {
          font-size: 1.2rem;
          color: #b45309;
          font-weight: 900;
        }

        .metric-item span {
          font-size: 0.75rem;
          color: #64748b;
          font-weight: 600;
        }

        .metric-divider {
          width: 1px;
          height: 28px;
          background: #e2e8f0;
        }

        @media (max-width: 640px) {
          .hero-metrics-bar { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
          .metric-divider { display: none; }
        }

        /* DETAILS TABS SECTION */
        .global-details-section {
          margin-top: 40px;
        }

        .tabs-nav-row {
          display: flex;
          gap: 10px;
          overflow-x: auto;
          padding-bottom: 8px;
          border-bottom: 1px solid #e2e8f0;
        }

        .tab-nav-btn {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          color: #475569;
          padding: 10px 18px;
          border-radius: 12px;
          font-size: 0.82rem;
          font-weight: 800;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          white-space: nowrap;
          transition: all 0.2s;
        }

        .tab-nav-btn.active, .tab-nav-btn:hover {
          background: #0f172a;
          border-color: #0f172a;
          color: #ffffff;
        }

        .tab-content-panel {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          padding: 32px;
          margin-top: 24px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
        }

        .fade-in {
          animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .panel-header {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 24px;
        }

        .panel-badge {
          display: inline-block;
          font-size: 0.65rem;
          font-weight: 900;
          padding: 4px 10px;
          border-radius: 6px;
          letter-spacing: 0.08em;
          width: fit-content;
        }

        .panel-badge.emerald { background: #dcfce7; color: #15803d; }
        .panel-badge.gold { background: #fef3c7; color: #92400e; }
        .panel-badge.blue { background: #e0f2fe; color: #0369a1; }
        .panel-badge.purple { background: #f3e8ff; color: #6b21a8; }

        .panel-header h2 {
          font-family: var(--font-title);
          font-size: 1.4rem;
          font-weight: 900;
          margin: 0;
          color: #0f172a;
        }

        .panel-header p {
          font-size: 0.9rem;
          color: #64748b;
          margin: 0;
        }

        .seo-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        @media (max-width: 768px) {
          .seo-grid { grid-template-columns: 1fr; }
        }

        .seo-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 18px;
          border-radius: 14px;
        }

        .seo-icon-box {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
        }

        .seo-icon-box.emerald { background: #dcfce7; color: #16a34a; }
        .seo-icon-box.blue { background: #e0f2fe; color: #0284c7; }
        .seo-icon-box.gold { background: #fef3c7; color: #d97706; }

        .seo-card h3 {
          font-size: 0.92rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 6px 0;
        }

        .seo-card p {
          font-size: 0.8rem;
          color: #64748b;
          line-height: 1.5;
          margin: 0;
        }

        .countries-section-box h3 {
          font-size: 1rem;
          font-weight: 800;
          color: #b45309;
          margin: 0 0 14px 0;
        }

        .countries-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }

        @media (max-width: 768px) {
          .countries-grid { grid-template-columns: 1fr; }
        }

        .country-item-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 10px 12px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .country-flag {
          font-size: 1.3rem;
        }

        .country-info {
          display: flex;
          flex-direction: column;
        }

        .country-info strong {
          font-size: 0.82rem;
          color: #0f172a;
        }

        .country-info span {
          font-size: 0.7rem;
          color: #64748b;
        }

        /* CURRENCY STYLES */
        .currency-simulator-card {
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 24px;
        }

        .sim-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .sim-header h3 {
          font-size: 0.95rem;
          font-weight: 800;
          color: #b45309;
          margin: 0;
        }

        .live-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 8px #10b981;
        }

        .sim-controls {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        @media (max-width: 768px) {
          .sim-controls { grid-template-columns: 1fr; }
        }

        .sim-input-box {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .sim-input-box label {
          font-size: 0.75rem;
          color: #64748b;
          font-weight: 700;
        }

        .sim-val {
          font-size: 1.15rem;
          font-weight: 900;
          color: #0f172a;
        }

        .sim-select {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          color: #0f172a;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 0.85rem;
          outline: none;
        }

        .sim-result-val {
          font-size: 1.25rem;
          font-weight: 900;
          color: #059669;
        }

        .sim-result-val span {
          font-size: 0.75rem;
          color: #64748b;
        }

        .currency-cards-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        @media (max-width: 768px) {
          .currency-cards-grid { grid-template-columns: repeat(2, 1fr); }
        }

        .curr-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 14px;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .curr-card strong {
          font-size: 0.9rem;
          color: #b45309;
        }

        .curr-card span {
          font-size: 0.75rem;
          color: #64748b;
        }

        /* BIM STYLES */
        .bim-features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        @media (max-width: 768px) {
          .bim-features-grid { grid-template-columns: 1fr; }
        }

        .bim-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 18px;
          border-radius: 14px;
        }

        .bim-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
        }

        .bim-icon.blue { background: #e0f2fe; color: #0284c7; }
        .bim-icon.emerald { background: #dcfce7; color: #16a34a; }
        .bim-icon.gold { background: #fef3c7; color: #d97706; }

        .bim-box h4 {
          font-size: 0.9rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 6px 0;
        }

        .bim-box p {
          font-size: 0.8rem;
          color: #64748b;
          margin: 0;
          line-height: 1.45;
        }

        .bim-download-card {
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          padding: 20px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }

        .bim-download-info h3 {
          font-size: 0.95rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 4px 0;
        }

        .bim-download-info p {
          font-size: 0.78rem;
          color: #64748b;
          margin: 0;
        }

        .bim-download-btn {
          background: linear-gradient(135deg, #b38e47 0%, #987532 100%);
          color: #ffffff;
          border: none;
          padding: 10px 18px;
          border-radius: 10px;
          font-size: 0.82rem;
          font-weight: 900;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
        }

        .bim-download-btn:hover {
          background: linear-gradient(135deg, #987532 0%, #7c5c22 100%);
        }

        .rfq-success-banner {
          background: #dcfce7;
          border: 1px solid #86efac;
          color: #15803d;
          padding: 12px;
          border-radius: 10px;
          font-size: 0.8rem;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 14px;
        }

        /* AI & 3D STYLES */
        .ai-features-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        @media (max-width: 768px) {
          .ai-features-grid { grid-template-columns: 1fr; }
        }

        .ai-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 20px;
          border-radius: 14px;
        }

        .ai-icon {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
        }

        .ai-icon.purple { background: #f3e8ff; color: #9333ea; }
        .ai-icon.gold { background: #fef3c7; color: #d97706; }

        .ai-card h3 {
          font-size: 0.95rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 6px 0;
        }

        .ai-card p {
          font-size: 0.82rem;
          color: #64748b;
          line-height: 1.5;
          margin: 0;
        }

        /* PROCESS STEPS */
        .process-steps-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .process-step-item {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 16px;
          border-radius: 14px;
        }

        .process-step-item.highlight {
          background: #fef3c7;
          border-color: #fde68a;
        }

        .step-num {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: #0f172a;
          color: #ffffff;
          font-size: 0.9rem;
          font-weight: 900;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .step-num.gold {
          background: linear-gradient(135deg, #b38e47 0%, #987532 100%);
          color: #ffffff;
        }

        .step-details h4 {
          font-size: 0.92rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 4px 0;
        }

        .step-details p {
          font-size: 0.8rem;
          color: #64748b;
          line-height: 1.5;
          margin: 0;
        }

        /* FORM SECTION */
        .global-form-section {
          margin-top: 60px;
        }

        .form-card-container {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 24px;
          padding: 40px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.05);
        }

        @media (max-width: 868px) {
          .form-card-container { grid-template-columns: 1fr; padding: 24px; }
        }

        .form-info-col {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .form-badge {
          font-size: 0.65rem;
          font-weight: 900;
          color: #b45309;
          background: #fef3c7;
          padding: 4px 10px;
          border-radius: 6px;
          width: fit-content;
        }

        .form-info-col h2 {
          font-family: var(--font-title);
          font-size: 1.6rem;
          font-weight: 900;
          color: #0f172a;
          margin: 0;
          line-height: 1.3;
        }

        .form-info-col p {
          font-size: 0.9rem;
          color: #64748b;
          line-height: 1.55;
          margin: 0;
        }

        .form-perks-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 14px;
        }

        .perk-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.85rem;
          color: #334155;
          font-weight: 600;
        }

        .form-input-col {
          display: flex;
          flex-direction: column;
        }

        .brand-join-form {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        @media (max-width: 640px) {
          .form-row-2 { grid-template-columns: 1fr; }
        }

        .form-group label {
          font-size: 0.75rem;
          font-weight: 700;
          color: #475569;
        }

        .form-input, .form-textarea {
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          color: #0f172a;
          padding: 10px 14px;
          border-radius: 10px;
          font-size: 0.85rem;
          outline: none;
          transition: border-color 0.2s;
        }

        .form-input:focus, .form-textarea:focus {
          border-color: #b38e47;
          background: #ffffff;
        }

        .form-submit-btn {
          background: linear-gradient(135deg, #b38e47 0%, #987532 100%);
          color: #ffffff;
          border: none;
          padding: 12px;
          border-radius: 12px;
          font-size: 0.88rem;
          font-weight: 900;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 4px 20px rgba(179, 142, 71, 0.25);
          transition: all 0.2s;
          margin-top: 6px;
        }

        .form-submit-btn:hover {
          background: linear-gradient(135deg, #987532 0%, #7c5c22 100%);
        }

        .form-success-box {
          background: #dcfce7;
          border: 1px solid #86efac;
          border-radius: 16px;
          padding: 30px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 12px;
        }

        .form-success-box h3 {
          font-size: 1.2rem;
          color: #065f46;
          margin: 0;
        }

        .form-success-box p {
          font-size: 0.85rem;
          color: #047857;
          line-height: 1.5;
          margin: 0;
        }

        .global-page-footer {
          border-top: 1px solid #e2e8f0;
          background: #ffffff;
          padding: 24px;
          text-align: center;
          color: #64748b;
          font-size: 0.8rem;
          margin-top: 60px;
        }
      `}</style>

    </div>
  );
}
