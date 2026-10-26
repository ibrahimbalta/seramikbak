'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Wrench,
  Search,
  MapPin,
  Phone,
  MessageSquare,
  CheckCircle2,
  Star,
  Award,
  Plus,
  X,
  ShieldCheck,
  Loader2,
  Camera,
  FileText,
  Printer,
  Sparkles,
  Clock,
  Ruler,
  CheckSquare,
  Upload,
  ChevronLeft,
  ArrowRight,
  Check,
  Tag,
  Building2,
  Layers,
  Percent
} from 'lucide-react';
import './ustalar.css';

const TURKEY_CITIES = [
  "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Aksaray", "Amasya", "Ankara", "Antalya", "Ardahan", "Artvin",
  "Aydın", "Balıkesir", "Bartın", "Batman", "Bayburt", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur",
  "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Düzce", "Edirne", "Elazığ", "Erzincan",
  "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari", "Hatay", "Iğdır", "Isparta", "İstanbul",
  "İzmir", "Kahramanmaraş", "Karabük", "Karaman", "Kars", "Kastamonu", "Kayseri", "Kilis", "Kırıkkale", "Kırklareli",
  "Kırşehir", "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Mardin", "Mersin", "Muğla", "Muş",
  "Nevşehir", "Niğde", "Ordu", "Osmaniye", "Rize", "Sakarya", "Samsun", "Şanlıurfa", "Siirt", "Sinop",
  "Sivas", "Şırnak", "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Uşak", "Van", "Yalova", "Yozgat", "Zonguldak"
];

const POPULAR_CITIES = ['ALL', 'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Kocaeli', 'Gaziantep', 'Konya', 'Eskişehir', 'Mersin'];

export default function InstallersDirectoryPage() {
  const [installers, setInstallers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [selectedCity, setSelectedCity] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Register Modal State
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [regName, setRegName] = useState('');
  const [regCompany, setRegCompany] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCity, setRegCity] = useState('İstanbul');
  const [regDistrict, setRegDistrict] = useState('');
  const [regExpYears, setRegExpYears] = useState('12');
  const [regSpecialties, setRegSpecialties] = useState('');
  const [regContractRate, setRegContractRate] = useState('280 ₺/m²');
  const [regNotes, setRegNotes] = useState('');
  const [regKvkkAccepted, setRegKvkkAccepted] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [regSuccess, setRegSuccess] = useState('');
  const [regError, setRegError] = useState('');

  // Local Device Photo Upload State (Max 3 Photos)
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState([]);

  // Before & After Portfolio Modal State
  const [selectedPortfolioInstaller, setSelectedPortfolioInstaller] = useState(null);
  const [activePortfolioIndex, setActivePortfolioIndex] = useState(0);

  // Standard Contract Modal State
  const [selectedContractInstaller, setSelectedContractInstaller] = useState(null);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (uploadedPhotos.length + files.length > 3) {
      alert('En fazla 3 adet şantiye fotoğrafı yükleyebilirsiniz!');
      return;
    }

    setUploadingPhotos(true);
    try {
      const newUrls = [...uploadedPhotos];
      for (const file of files) {
        if (newUrls.length >= 3) break;

        const reader = new FileReader();
        const base64Promise = new Promise((resolve) => {
          reader.onload = (event) => resolve(event.target.result);
          reader.readAsDataURL(file);
        });
        const base64Data = await base64Promise;

        try {
          const res = await fetch('/api/dealers/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              base64Data,
              filename: file.name,
              folder: 'seramikbak/installers'
            })
          });

          const data = await res.json();
          const uploadedUrl = data.url || data.fileUrl;
          if (res.ok && uploadedUrl) {
            newUrls.push(uploadedUrl);
          } else {
            newUrls.push(base64Data);
          }
        } catch {
          newUrls.push(base64Data);
        }
      }
      setUploadedPhotos(newUrls);
    } catch (err) {
      console.error('File upload error:', err);
    } finally {
      setUploadingPhotos(false);
      e.target.value = '';
    }
  };

  const handleRemovePhoto = (index) => {
    setUploadedPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const fetchInstallers = async () => {
    setLoading(true);
    try {
      let url = '/api/installers?limit=100';
      if (selectedCity && selectedCity !== 'ALL') url += `&city=${encodeURIComponent(selectedCity)}`;
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setInstallers(data.installers || []);
        }
      }
    } catch (err) {
      console.error('Failed to fetch installers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstallers();
  }, [selectedCity]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchInstallers();
  };

  const handleRegisterInstaller = async (e) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    if (!regKvkkAccepted) {
      setRegError('Lütfen KVKK Aydınlatma Metni\'ni okuyup onaylayınız.');
      return;
    }

    setRegLoading(true);

    try {
      let portfolioData = null;
      if (uploadedPhotos.length > 0) {
        portfolioData = uploadedPhotos.map((url, idx) => ({
          title: `${regName} - Tamamlanan Şantiye Projesi #${idx + 1}`,
          areaM2: '35 m²',
          duration: '3 Gün',
          ceramicUsed: regSpecialties || '60x120 Porselen Granit',
          beforeUrl: url,
          afterUrl: url
        }));
      }

      const res = await fetch('/api/installers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          companyName: regCompany,
          phone: regPhone,
          city: regCity,
          district: regDistrict,
          experienceYears: regExpYears,
          specialties: regSpecialties,
          contractRateM2: regContractRate,
          guaranteeBadge: true,
          portfolioBeforeAfter: portfolioData ? JSON.stringify(portfolioData) : null,
          notes: regNotes
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRegSuccess(data.message || 'Tebrikler! Seramik ustası başvurunuz başarıyla alındı. Yönetici onayından sonra rehberde yayınlanacaktır.');
        setRegName('');
        setRegPhone('');
        setRegCompany('');
        setRegSpecialties('');
        setUploadedPhotos([]);
        setRegNotes('');
        fetchInstallers();
      } else {
        setRegError(data.error || 'Profil oluşturulurken bir hata oluştu.');
      }
    } catch (err) {
      setRegError('Sunucu bağlantı hatası.');
    } finally {
      setRegLoading(false);
    }
  };

  const parsePortfolio = (jsonString) => {
    if (!jsonString) return [];
    try {
      if (typeof jsonString === 'object') return jsonString;
      return JSON.parse(jsonString);
    } catch (e) {
      return [];
    }
  };

  return (
    <div className="ustalar-page-root">
      {/* 1. TOP APP BAR - FROSTED GLASS */}
      <header className="ustalar-app-header">
        <div className="ustalar-header-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link href="/" className="ustalar-back-btn" title="Ana Sayfaya Dön">
              <ChevronLeft size={20} />
            </Link>

            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
              <div className="brand-monogram">SB</div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="brand-title">SeramikBak</span>
                <span className="brand-subtitle">USTA REHBERİ</span>
              </div>
            </Link>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link href="/outlet" className="header-cross-link" title="Kelepir Stok & Outlet Seramikler">
              <Tag size={14} style={{ color: '#b38e47' }} />
              <span className="desktop-text">Outlet Borsası</span>
            </Link>

            <button
              onClick={() => setShowRegisterModal(true)}
              className="ustalar-header-reg-btn"
            >
              <Plus size={15} />
              <span className="desktop-text">Usta Olarak Kaydol (Ücretsiz)</span>
              <span className="mobile-text">Usta Kaydı</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="ustalar-hero-section">
        <div className="ustalar-hero-container">
          {/* Trust Radar Badge */}
          <div className="hero-trust-badge">
            <span className="radar-pulse"></span>
            <ShieldCheck size={14} style={{ color: '#059669', flexShrink: 0 }} />
            <span>81 İLDE ONAYLI SERAMİK & FAYANS UYGULAMA REHBERİ</span>
          </div>

          <h1 className="hero-heading">
            Eviniz ve Şantiyeniz İçin <span className="gold-gradient-text">Garantili Seramik Ustaları</span>
          </h1>

          <p className="hero-lead">
            Seramiği aldınız ancak kime döşeteceğinizi bilmiyor musunuz? 60x120 porselen, granit ve ıslak hacimlerde 
            lazer terazili çalışan, puanlanmış ustaların canlı iş portfolyolarını inceleyin, ücretsiz teklif alın.
          </p>

          {/* Quick Value Pillars */}
          <div className="hero-value-pills">
            <div className="value-pill pill-green">
              <CheckSquare size={13} style={{ color: '#059669' }} />
              <span>Lazer Terazi & Derz Garantisi</span>
            </div>
            <div className="value-pill pill-blue">
              <Camera size={13} style={{ color: '#2563eb' }} />
              <span>Canlı Şantiye Öncesi / Sonrası</span>
            </div>
            <div className="value-pill pill-gold">
              <FileText size={13} style={{ color: '#b38e47' }} />
              <span>Standart İki Taraflı Sözleşme</span>
            </div>
            <div className="value-pill pill-purple">
              <Clock size={13} style={{ color: '#7c3aed' }} />
              <span>Hızlı Keşif & WhatsApp Teklif</span>
            </div>
          </div>

          {/* QUICK CITY CHIPS CAROUSEL */}
          <div className="city-chips-carousel">
            {POPULAR_CITIES.map(city => (
              <button
                key={city}
                type="button"
                className={`city-chip ${selectedCity === city ? 'active' : ''}`}
                onClick={() => setSelectedCity(city)}
              >
                {city === 'ALL' ? '📍 Tüm İller' : city}
              </button>
            ))}
          </div>

          {/* SEARCH & FILTER BAR */}
          <form onSubmit={handleSearchSubmit} className="search-filter-card">
            <div className="search-input-group">
              <Search size={18} className="input-icon" />
              <input
                type="text"
                placeholder="Usta adı, ilçe veya uzmanlık (örn: 60x120, banyo, teras)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="porcelain-input"
              />
            </div>

            <div className="city-select-group">
              <MapPin size={18} className="input-icon" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="porcelain-select"
              >
                <option value="ALL">Tüm Şehirler (81 İl)</option>
                {TURKEY_CITIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <button type="submit" className="search-submit-btn">
              <Search size={16} />
              <span>Usta Ara</span>
            </button>
          </form>
        </div>
      </section>

      {/* 3. MAIN DIRECTORY LISTINGS */}
      <main className="ustalar-main-layout">
        {/* CROSS OUTLET BANNER */}
        <div className="ustalar-outlet-banner">
          <div className="outlet-banner-left">
            <div className="outlet-icon-wrapper">
              <Percent size={22} />
            </div>
            <div>
              <h4 className="outlet-banner-title">
                Seramiğinizi Henüz Almadınız mı? Şantiye Fazlası Outlet Borsasını İnceleyin
              </h4>
              <p className="outlet-banner-desc">
                81 ildeki bayilerden kelepir paletler, seri sonu ve 2. kalite seramikleri %60'a varan indirimlerle bulun.
              </p>
            </div>
          </div>

          <Link href="/outlet" className="outlet-cta-btn">
            <span>Outlet Borsası</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        {/* Section Header */}
        <div className="directory-header-row">
          <div>
            <h2 className="directory-title">
              {selectedCity !== 'ALL' ? `${selectedCity} Seramik & Fayans Ustaları` : 'Onaylı Seramik ve Fayans Ustaları'}
            </h2>
            <p className="directory-subtitle">
              Bölgenizde aktif <span style={{ fontWeight: 800, color: '#0f172a' }}>{installers.length}</span> uzman usta ve uygulama ekibi listeleniyor
            </p>
          </div>

          <button
            onClick={() => { setShowRegisterModal(true); if (selectedCity !== 'ALL') setRegCity(selectedCity); }}
            className="secondary-register-trigger"
          >
            <Plus size={14} />
            <span>Ben de Ustayı(m) Ekle</span>
          </button>
        </div>

        {/* LOADING STATE */}
        {loading ? (
          <div className="loading-state-box">
            <Loader2 size={36} className="animate-spin" style={{ color: '#b38e47' }} />
            <p>Onaylı seramik ustaları yükleniyor...</p>
          </div>
        ) : installers.length === 0 ? (
          /* EMPTY STATE */
          <div className="empty-state-box">
            <div className="empty-state-icon">
              <Wrench size={36} style={{ color: '#b38e47' }} />
            </div>
            <h3 className="empty-state-title">
              {selectedCity !== 'ALL' ? `${selectedCity} Şehrinde Henüz Kayıtlı Usta Bulunmuyor` : 'Aramanızla Eşleşen Usta Bulunamadı'}
            </h3>
            <p className="empty-state-desc">
              Bu bölgede seramik veya fayans döşeme ustası mısınız? SeramikBak üzerinden seramik araştıran binlerce ev sahibine ve şantiye yöneticisine anında ulaşmak için ücretsiz profilinizi oluşturun.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => { setShowRegisterModal(true); if (selectedCity !== 'ALL') setRegCity(selectedCity); }}
                className="empty-cta-btn"
              >
                <Plus size={15} />
                <span>Bu Şehirde Usta Olarak Kaydol</span>
              </button>
              {selectedCity !== 'ALL' && (
                <button
                  onClick={() => setSelectedCity('ALL')}
                  className="empty-reset-btn"
                >
                  Tüm İlleri Listele
                </button>
              )}
            </div>
          </div>
        ) : (
          /* INSTALLERS GRID */
          <div className="installers-grid">
            {installers.map(inst => {
              const portfolioList = parsePortfolio(inst.portfolioBeforeAfter);
              const waText = encodeURIComponent(
                `Merhaba ${inst.name}, SeramikBak Usta Rehberi profiliniz üzerinden ulaşıyorum. ` +
                `${inst.city} bölgesinde seramik / fayans kaplama işimiz için keşif ve teklif almak istiyoruz.`
              );
              const waLink = `https://wa.me/${inst.phone.replace(/[^\d]/g, '')}?text=${waText}`;

              return (
                <article key={inst.id} className="installer-card">
                  {/* Top Header Card */}
                  <div className="card-top">
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', minWidth: 0 }}>
                      <div className="installer-avatar">
                        {inst.name.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <h3 className="installer-name" title={inst.name}>{inst.name}</h3>
                          {inst.verified && (
                            <span className="verified-badge" title="SeramikBak Tarafından Doğrulanmış Usta">
                              <ShieldCheck size={12} />
                              Onaylı Usta
                            </span>
                          )}
                        </div>

                        <div className="installer-meta">
                          {inst.companyName && (
                            <span className="meta-company">🏢 {inst.companyName}</span>
                          )}
                          <span className="meta-location">
                            📍 {inst.city}{inst.district ? ` / ${inst.district}` : ''}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Rating Badge */}
                    <div className="rating-pill">
                      <Star size={13} style={{ color: '#eab308', fill: '#eab308' }} />
                      <span className="rating-score">{inst.rating || '5.0'}</span>
                      <span className="rating-count">({inst.reviewCount || 12})</span>
                    </div>
                  </div>

                  {/* Highlights Bar */}
                  <div className="card-metrics-row">
                    <span className="metric-tag tag-exp">
                      <Award size={12} />
                      {inst.experienceYears} Yıl Tecrübe
                    </span>

                    {inst.contractRateM2 && (
                      <span className="metric-tag tag-price">
                        <Ruler size={12} />
                        {inst.contractRateM2}
                      </span>
                    )}

                    {inst.guaranteeBadge !== false && (
                      <span className="metric-tag tag-guarantee">
                        <Check size={12} />
                        Terazi & Derz Garantisi
                      </span>
                    )}
                  </div>

                  {/* Specialties Pills */}
                  {inst.specialties && (
                    <div className="specialties-row">
                      {inst.specialties.split(',').slice(0, 3).map((spec, idx) => (
                        <span key={idx} className="spec-chip">
                          {spec.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Bio Quote Bubble */}
                  {inst.notes && (
                    <div className="installer-quote-bubble">
                      <p>"{inst.notes}"</p>
                    </div>
                  )}

                  {/* Interactive Trigger Buttons */}
                  <div className="card-triggers-row">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPortfolioInstaller(inst);
                        setActivePortfolioIndex(0);
                      }}
                      className="trigger-portfolio-btn"
                    >
                      <Camera size={13} />
                      <span>{portfolioList.length > 0 ? `Portfolyo (${portfolioList.length})` : 'Canlı Portfolyo'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedContractInstaller(inst)}
                      className="trigger-contract-btn"
                    >
                      <FileText size={13} />
                      <span>Standart Sözleşme</span>
                    </button>
                  </div>

                  {/* Symmetrical Dual Action CTA Buttons (50 / 50) */}
                  <div className="card-dual-actions">
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-whatsapp-action"
                    >
                      <MessageSquare size={16} />
                      <span>WhatsApp Teklif</span>
                    </a>

                    <a
                      href={`tel:${inst.phone.replace(/[^\d+]/g, '')}`}
                      className="btn-call-action"
                    >
                      <Phone size={16} />
                      <span>Hemen Ara</span>
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* 4. MODAL 1: BEFORE & AFTER PORTFOLIO VIEWER */}
      {selectedPortfolioInstaller && (
        <div className="modal-backdrop" onClick={() => setSelectedPortfolioInstaller(null)}>
          <div className="modal-card modal-portfolio" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedPortfolioInstaller(null)}
              className="modal-close-btn"
              title="Kapat"
            >
              <X size={18} />
            </button>

            <div className="modal-header-row">
              <div className="modal-icon-badge badge-blue-icon">
                <Camera size={22} />
              </div>
              <div>
                <h3 className="modal-title">
                  {selectedPortfolioInstaller.name} — Şantiye Portfolyosu
                </h3>
                <span className="modal-subtitle">
                  Öncesi (Eski Banyo / Şantiye) vs. Sonrası (Tamamlanan Seramik Döşeme)
                </span>
              </div>
            </div>

            {(() => {
              const pList = parsePortfolio(selectedPortfolioInstaller.portfolioBeforeAfter);
              if (!pList || pList.length === 0) {
                return (
                  <div className="empty-portfolio-box">
                    <Camera size={40} style={{ color: '#94a3b8', marginBottom: '12px' }} />
                    <h4 style={{ fontSize: '1.05rem', color: '#0f172a', fontWeight: 800, margin: '0 0 6px 0' }}>
                      Henüz Yüklenmiş Şantiye Görseli Bulunmuyor
                    </h4>
                    <p style={{ fontSize: '0.86rem', color: '#64748b', margin: '0 0 16px 0' }}>
                      Bu usta ile WhatsApp üzerinden iletişime geçerek referans şantiye fotoğraflarını isteyebilirsiniz.
                    </p>
                    <a
                      href={`https://wa.me/${selectedPortfolioInstaller.phone.replace(/[^\d]/g, '')}?text=${encodeURIComponent(`Merhaba ${selectedPortfolioInstaller.name}, referans şantiye fotoğraflarınızı görebilir miyim?`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-whatsapp-action"
                      style={{ maxWidth: '280px', margin: '0 auto' }}
                    >
                      <MessageSquare size={16} />
                      <span>WhatsApp'tan Fotoğraf İste</span>
                    </a>
                  </div>
                );
              }

              const currentProject = pList[activePortfolioIndex] || pList[0];

              return (
                <div>
                  {/* Multi-Project Tabs */}
                  {pList.length > 1 && (
                    <div className="portfolio-tabs-row">
                      {pList.map((proj, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActivePortfolioIndex(idx)}
                          className={`portfolio-tab-btn ${activePortfolioIndex === idx ? 'active' : ''}`}
                        >
                          Proje #{idx + 1}: {proj.title || 'Şantiye Yenileme'}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Project Info Strip */}
                  <div className="project-info-strip">
                    <h4 className="project-title">{currentProject.title || 'Banyo / Zemin Seramik Yenileme'}</h4>
                    <div className="project-meta-pills">
                      {currentProject.areaM2 && <span>📐 <strong>Uygulama Alanı:</strong> {currentProject.areaM2}</span>}
                      {currentProject.duration && <span>⏱️ <strong>Teslim Süresi:</strong> {currentProject.duration}</span>}
                      {currentProject.ceramicUsed && <span>🧱 <strong>Kullanılan Malzeme:</strong> {currentProject.ceramicUsed}</span>}
                    </div>
                  </div>

                  {/* Before / After Images Side by Side */}
                  <div className="before-after-grid">
                    <div className="comparison-card before-card">
                      <div className="comparison-header before-header">
                        <span>🔴 ÖNCESİ (Eski Hali)</span>
                      </div>
                      <div className="comparison-img-wrapper">
                        <img
                          src={currentProject.beforeUrl || 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=80'}
                          alt="Öncesi"
                          className="comparison-img"
                        />
                      </div>
                    </div>

                    <div className="comparison-card after-card">
                      <div className="comparison-header after-header">
                        <span>🟢 SONRASI (Tamamlanan Uygulama)</span>
                      </div>
                      <div className="comparison-img-wrapper">
                        <img
                          src={currentProject.afterUrl || 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=600&auto=format&fit=crop&q=80'}
                          alt="Sonrası"
                          className="comparison-img"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Modal Footer Direct Contact */}
                  <div className="modal-cta-footer">
                    <a
                      href={`https://wa.me/${selectedPortfolioInstaller.phone.replace(/[^\d]/g, '')}?text=${encodeURIComponent(`Merhaba ${selectedPortfolioInstaller.name}, portfolyonuzdaki Proje #${activePortfolioIndex + 1} benzeri bir iş için fiyat teklifi almak istiyorum.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-whatsapp-action"
                    >
                      <MessageSquare size={16} />
                      <span>Bu İş İçin WhatsApp Teklif Al</span>
                    </a>

                    <a
                      href={`tel:${selectedPortfolioInstaller.phone.replace(/[^\d+]/g, '')}`}
                      className="btn-call-action"
                    >
                      <Phone size={16} />
                      <span>Ustayı Hemen Ara</span>
                    </a>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* 5. MODAL 2: STANDARD CONTRACT TEMPLATE */}
      {selectedContractInstaller && (
        <div className="modal-backdrop" onClick={() => setSelectedContractInstaller(null)}>
          <div className="modal-card modal-contract" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedContractInstaller(null)}
              className="modal-close-btn"
              title="Kapat"
            >
              <X size={18} />
            </button>

            {/* Document Header */}
            <div className="contract-header">
              <div className="contract-eyebrow">SERAMİKBAK GÜVENCELİ UYGULAMA VE KALİTE STANDARTLARI</div>
              <h2 className="contract-title">
                STANDART SERAMİK VE KARO UYGULAMA İŞ SÖZLEŞMESİ
              </h2>
              <p className="contract-subtitle">
                İşveren (Müşteri) ile Uzman Seramik Ustası (Yüklenici) Arasında Uygulama, Tesviye ve Teslim Belgesi
              </p>
            </div>

            {/* Document Body */}
            <div className="contract-body">
              {/* Section 1 */}
              <div className="contract-section">
                <h4 className="contract-section-heading">1. TARAFLAR VE İLETİŞİM BİLGİLERİ</h4>
                <div className="contract-two-col">
                  <div>
                    <strong>YÜKLENİCİ USTA / EKİP:</strong><br />
                    <span>Ad Soyad: {selectedContractInstaller.name}</span><br />
                    <span>Firma: {selectedContractInstaller.companyName || 'Bireysel Seramik Ustası'}</span><br />
                    <span>Telefon: {selectedContractInstaller.phone}</span><br />
                    <span>Hizmet Bölgesi: {selectedContractInstaller.city} / {selectedContractInstaller.district || 'Merkez'}</span>
                  </div>

                  <div>
                    <strong>İŞVEREN (MÜŞTERİ):</strong><br />
                    <span>Ad Soyad: ___________________________</span><br />
                    <span>Telefon: ___________________________</span><br />
                    <span>Uygulama Adresi: ___________________________</span>
                  </div>
                </div>
              </div>

              {/* Section 2 */}
              <div className="contract-section">
                <h4 className="contract-section-heading">2. İŞİN KAPSAMI VE BİRİM İŞÇİLİK ÜCRETİ</h4>
                <p style={{ margin: '0 0 10px 0' }}>
                  Bu sözleşme; İşveren tarafından temin edilen seramik, granit ve yapıştırıcı harç malzemelerinin ilgili ıslak hacim veya zemin alanlarına teknik şartlara uygun olarak döşenmesi, tesviyesi ve derz dolgusunun tamamlanması taahhüdüdür.
                </p>
                <div className="contract-metrics-box">
                  <div><strong>Tahmini m² Alanı:</strong> _____ m²</div>
                  <div><strong>m² Birim Fiyatı:</strong> {selectedContractInstaller.contractRateM2 || '280 ₺/m²'}</div>
                  <div><strong>Tahmini Teslimat Süresi:</strong> _____ İş Günü</div>
                </div>
              </div>

              {/* Section 3 */}
              <div className="contract-section">
                <h4 className="contract-section-heading">3. TEKNİK UYGULAMA VE TESLİMAT ESASLARI</h4>
                <ul className="contract-rules-list">
                  <li><strong>📏 Lazer Terazi & Eğim Kontrolü:</strong> Zemin ve duvar karoları su/lazer terazisi ile gönyesinde döşenecek, banyo ve teras zeminlerinde gider süzgecine doğru gerekli su akış meyli verilecektir.</li>
                  <li><strong>📐 Derz Artısı ve Kalibre Hizalama:</strong> Seramik ebadına uygun plastik derz artısı kullanılacak, tırnak yapması ve kot farkı oluşumu engellenecektir.</li>
                  <li><strong>💧 Zemin Temizliği & Astar Hazırlığı:</strong> Döşeme öncesinde zemin tozu, oynak parçalar temizlenecek ve yapıştırıcı harcın tam yapışması sağlanacaktır.</li>
                  <li><strong>🧹 Kaba Şantiye Temizliği:</strong> İş bitiminde derz ve harç artıkları sünger ve özel temizleyici ile kabaca temizlenerek teslim edilecektir.</li>
                  <li><strong>🤝 Müşteri Ortak Kabulü:</strong> İş bitiminde müşteri ve usta alanı birlikte inceler; kırık, çatlak veya belirgin işçilik kusurları teslimat sırasında tespit edilip düzeltilir.</li>
                </ul>
              </div>

              {/* Signatures */}
              <div className="contract-signatures">
                <div className="signature-box">
                  <strong>Yüklenici Usta İmza</strong><br />
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{selectedContractInstaller.name}</span>
                </div>

                <div className="signature-box">
                  <strong>İşveren Müşteri İmza</strong><br />
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Ad Soyad</span>
                </div>
              </div>

              {/* Print Action */}
              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <button
                  onClick={() => window.print()}
                  className="print-contract-btn"
                >
                  <Printer size={16} />
                  <span>Sözleşmeyi Yazdır / PDF İndir</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL 3: USTA KAYIT FORMU */}
      {showRegisterModal && (
        <div className="modal-backdrop" onClick={() => setShowRegisterModal(false)}>
          <div className="modal-card modal-register" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowRegisterModal(false)}
              className="modal-close-btn"
              title="Kapat"
            >
              <X size={18} />
            </button>

            <div className="modal-header-row">
              <div className="modal-icon-badge badge-gold-icon">
                <Wrench size={22} />
              </div>
              <div>
                <h3 className="modal-title">Seramik Ustası Kayıt Formu</h3>
                <span className="modal-subtitle">81 İldeki Seramik Alıcılarına ve Projelere Ücretsiz Ulaşın</span>
              </div>
            </div>

            {regSuccess ? (
              <div className="register-success-box">
                <CheckCircle2 size={44} style={{ color: '#059669', marginBottom: '12px' }} />
                <h4 style={{ fontSize: '1.15rem', color: '#0f172a', fontWeight: 800, marginBottom: '8px' }}>
                  Başvurunuz Başarıyla Alındı!
                </h4>
                <p style={{ fontSize: '0.88rem', color: '#475569', margin: '0 0 20px 0', lineHeight: 1.5 }}>
                  {regSuccess}
                </p>
                <button
                  onClick={() => { setShowRegisterModal(false); setRegSuccess(''); }}
                  className="empty-cta-btn"
                >
                  Tamam, Teşekkürler
                </button>
              </div>
            ) : (
              <form onSubmit={handleRegisterInstaller} className="register-form">
                {regError && (
                  <div className="form-error-alert">
                    ⚠️ {regError}
                  </div>
                )}

                <div>
                  <label className="form-label">Adınız Soyadınız *</label>
                  <input
                    type="text"
                    placeholder="Örn: Ahmet Usta"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-row-2">
                  <div>
                    <label className="form-label">Firma / Ekip Adı</label>
                    <input
                      type="text"
                      placeholder="Örn: Yıldız Seramik & Dekorasyon"
                      value={regCompany}
                      onChange={(e) => setRegCompany(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div>
                    <label className="form-label">Telefon Numaranız *</label>
                    <input
                      type="tel"
                      placeholder="Örn: 0532 123 45 67"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      required
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-row-3">
                  <div>
                    <label className="form-label">Hizmet Şehri *</label>
                    <select
                      value={regCity}
                      onChange={(e) => setRegCity(e.target.value)}
                      className="form-select"
                    >
                      {TURKEY_CITIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Hizmet İlçeleri</label>
                    <input
                      type="text"
                      placeholder="Örn: Kadıköy, Üsküdar"
                      value={regDistrict}
                      onChange={(e) => setRegDistrict(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div>
                    <label className="form-label">Tahmini m² İşçilik</label>
                    <input
                      type="text"
                      placeholder="280 ₺/m²"
                      value={regContractRate}
                      onChange={(e) => setRegContractRate(e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-row-2">
                  <div>
                    <label className="form-label">Tecrübe (Yıl)</label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={regExpYears}
                      onChange={(e) => setRegExpYears(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div>
                    <label className="form-label">Uzmanlık Alanlarınız</label>
                    <input
                      type="text"
                      placeholder="Örn: 60x120 Karo, Banyo, Teras, İzolasyon"
                      value={regSpecialties}
                      onChange={(e) => setRegSpecialties(e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>

                {/* Photo Upload Area */}
                <div className="photo-upload-container">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span className="photo-upload-title">
                      <Camera size={15} />
                      Şantiye Referans Fotoğrafları (En Fazla 3 Adet)
                    </span>
                    <span className="photo-upload-count">{uploadedPhotos.length} / 3 Yüklendi</span>
                  </div>

                  {uploadedPhotos.length < 3 && (
                    <label className="photo-dropzone">
                      <Upload size={18} />
                      <span>{uploadingPhotos ? 'Fotoğraflar İşleniyor...' : 'Cihazınızdan Şantiye Fotoğrafı Seçin'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        disabled={uploadingPhotos}
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                      />
                    </label>
                  )}

                  {uploadedPhotos.length > 0 && (
                    <div className="uploaded-thumbnails-grid">
                      {uploadedPhotos.map((url, idx) => (
                        <div key={idx} className="thumb-item">
                          <img src={url} alt={`Şantiye Görseli ${idx + 1}`} />
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(idx)}
                            className="thumb-remove-btn"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="form-label">Tanıtım ve İşçilik Notunuz</label>
                  <textarea
                    rows={2}
                    placeholder="Ekip mevcudunuz, lazerli terazi donanımınız veya iş teslim taahhüdünüz..."
                    value={regNotes}
                    onChange={(e) => setRegNotes(e.target.value)}
                    className="form-textarea"
                  />
                </div>

                <div className="kvkk-check-row">
                  <input
                    type="checkbox"
                    id="installer-kvkk-check"
                    checked={regKvkkAccepted}
                    onChange={(e) => setRegKvkkAccepted(e.target.checked)}
                    required
                    style={{ marginTop: '2px', cursor: 'pointer' }}
                  />
                  <label htmlFor="installer-kvkk-check" className="kvkk-label">
                    Kişisel verilerimin işlenmesine ilişkin <Link href="/yasal?tab=kvkk" target="_blank" style={{ color: '#b38e47', fontWeight: 700, textDecoration: 'underline' }}>KVKK Aydınlatma Metni'ni</Link> okudum ve onaylıyorum.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={regLoading}
                  className="form-submit-btn"
                >
                  {regLoading ? 'Kaydınız Oluşturuluyor...' : '👷 Usta Profilimi Ücretsiz Oluştur'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
