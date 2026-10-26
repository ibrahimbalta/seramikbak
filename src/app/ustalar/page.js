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
  ChevronRight,
  Check,
  Tag,
  Building2,
  Layers,
  Percent,
  SlidersHorizontal
} from 'lucide-react';

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
      {/* 1. TOP APP BAR - PORCELAIN FROSTED GLASS */}
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
            <Link href="/outlet" className="header-outlet-link">
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

      {/* 2. HERO SECTION - PORCELAIN LUXURY & TRUST BADGES */}
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

        {/* 4. CROSS-PROMOTION BANNER: OUTLET & 3D STUDIO */}
        <section className="cross-promo-grid">
          <div className="promo-card promo-outlet">
            <div className="promo-badge">OUTLET STOK BORSASI</div>
            <h3 className="promo-title">Seramiğinizi Henüz Almadınız mı?</h3>
            <p className="promo-desc">
              81 ildeki yetkili bayilerin şantiye artığı, proje fazlası ve 2. kalite kelepir palet seramiklerini %60'a varan indirimlerle doğrudan bayiden satın alın.
            </p>
            <Link href="/outlet" className="promo-cta cta-gold">
              <span>Outlet Seramikleri İncele</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="promo-card promo-studio">
            <div className="promo-badge badge-blue">3D MEKÂN STÜDYOSU</div>
            <h3 className="promo-title">Ustanıza Göstermeden Önce Görün</h3>
            <p className="promo-desc">
              Kendi banyonuzun veya mutfağınızın fotoğrafını yükleyin, seçtiğiniz porselen seramiklerin odanızda nasıl duracağını yapay zekâ destekli 3D stüdyomuzda anında test edin.
            </p>
            <Link href="/mekanimda-gor" className="promo-cta cta-blue">
              <span>3D Mekân Stüdyosunu Aç</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </section>
      </main>

      {/* 5. MODAL 1: BEFORE & AFTER PORTFOLIO VIEWER */}
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

      {/* 6. MODAL 2: STANDARD CONTRACT TEMPLATE */}
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

      {/* 7. MODAL 3: USTA KAYIT FORMU */}
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

      {/* 8. COMPLETE PORCELAIN LUXURY STYLES */}
      <style jsx>{`
        /* Root & Background */
        .ustalar-page-root {
          min-height: 100vh;
          background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 40%, #ffffff 100%);
          background-image: radial-gradient(rgba(179, 142, 71, 0.08) 1px, transparent 1px);
          background-size: 24px 24px;
          color: #0f172a;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          width: 100%;
          max-width: 100vw;
          overflow-x: hidden;
        }

        /* 1. Frosted Glass App Bar */
        .ustalar-app-header {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(226, 232, 240, 0.85);
          position: sticky;
          top: 0;
          z-index: 100;
          padding: 10px 16px;
        }

        .ustalar-header-inner {
          max-width: 1280px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .ustalar-back-btn {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          color: #0f172a;
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          flex-shrink: 0;
          transition: all 0.2s ease;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05);
        }
        .ustalar-back-btn:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
        }

        .brand-monogram {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          border: 1.5px solid #b38e47;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          color: #ffffff;
          font-size: 0.95rem;
          box-shadow: 0 4px 10px rgba(15, 23, 42, 0.15);
          flex-shrink: 0;
        }

        .brand-title {
          font-size: 1.05rem;
          font-weight: 900;
          color: #0f172a;
          line-height: 1.1;
          letter-spacing: -0.01em;
        }

        .brand-subtitle {
          color: #b38e47;
          font-size: 0.68rem;
          font-weight: 850;
          letter-spacing: 0.08em;
        }

        .header-outlet-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          border-radius: 10px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          font-size: 0.8rem;
          font-weight: 700;
          color: #334155;
          text-decoration: none;
          transition: all 0.2s ease;
        }
        .header-outlet-link:hover {
          background: #ffffff;
          border-color: #b38e47;
          color: #0f172a;
        }

        .ustalar-header-reg-btn {
          font-size: 0.82rem;
          font-weight: 800;
          color: #ffffff;
          background: linear-gradient(135deg, #b38e47 0%, #93702e 100%);
          border: none;
          padding: 9px 16px;
          border-radius: 10px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 4px 14px rgba(179, 142, 71, 0.28);
          transition: all 0.2s ease;
          flex-shrink: 0;
        }
        .ustalar-header-reg-btn:hover {
          opacity: 0.95;
          transform: translateY(-1px);
        }

        .mobile-text {
          display: none;
        }
        .desktop-text {
          display: inline;
        }

        /* 2. Hero Section */
        .ustalar-hero-section {
          padding: 44px 16px 28px 16px;
          text-align: center;
          position: relative;
        }

        .ustalar-hero-container {
          max-width: 860px;
          margin: 0 auto;
        }

        .hero-trust-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          color: #065f46;
          padding: 6px 14px;
          border-radius: 9999px;
          font-size: 0.72rem;
          font-weight: 800;
          margin-bottom: 16px;
          letter-spacing: 0.04em;
        }

        .radar-pulse {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
          animation: pulseGreen 2s infinite;
        }

        @keyframes pulseGreen {
          0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
          }
          70% {
            transform: scale(1);
            box-shadow: 0 0 0 6px rgba(16, 185, 129, 0);
          }
          100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
          }
        }

        .hero-heading {
          font-size: clamp(1.6rem, 3.8vw, 2.7rem);
          font-weight: 900;
          color: #0f172a;
          margin: 0 0 14px 0;
          line-height: 1.2;
          letter-spacing: -0.025em;
        }

        .gold-gradient-text {
          background: linear-gradient(135deg, #b38e47 0%, #d4af37 50%, #93702e 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-lead {
          font-size: 0.95rem;
          color: #475569;
          line-height: 1.6;
          margin: 0 auto 22px auto;
          max-width: 720px;
        }

        /* Value Pillars */
        .hero-value-pills {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 22px;
        }

        .value-pill {
          font-size: 0.76rem;
          padding: 6px 12px;
          border-radius: 10px;
          font-weight: 750;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
        }
        .pill-green {
          background: #ecfdf5;
          border: 1px solid #d1fae5;
          color: #065f46;
        }
        .pill-blue {
          background: #eff6ff;
          border: 1px solid #dbeafe;
          color: #1e40af;
        }
        .pill-gold {
          background: #fefce8;
          border: 1px solid #fef08a;
          color: #854d0e;
        }
        .pill-purple {
          background: #faf5ff;
          border: 1px solid #f3e8ff;
          color: #6b21a8;
        }

        /* City Chips Carousel */
        .city-chips-carousel {
          display: flex;
          align-items: center;
          gap: 8px;
          overflow-x: auto;
          padding: 4px 4px 16px 4px;
          margin-bottom: 16px;
          scrollbar-width: none;
          -ms-overflow-style: none;
          justify-content: center;
        }
        .city-chips-carousel::-webkit-scrollbar {
          display: none;
        }

        .city-chip {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          color: #475569;
          font-size: 0.78rem;
          font-weight: 750;
          padding: 8px 14px;
          border-radius: 20px;
          white-space: nowrap;
          cursor: pointer;
          flex-shrink: 0;
          transition: all 0.2s ease;
          box-shadow: 0 2px 5px rgba(15, 23, 42, 0.03);
        }
        .city-chip:hover {
          border-color: #b38e47;
          color: #0f172a;
        }
        .city-chip.active {
          background: linear-gradient(135deg, #b38e47 0%, #93702e 100%);
          border-color: #b38e47;
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(179, 142, 71, 0.3);
        }

        /* Search Filter Form Card */
        .search-filter-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          padding: 10px;
          display: grid;
          grid-template-columns: 2fr 1.3fr auto;
          gap: 10px;
          box-shadow: 0 10px 30px -5px rgba(15, 23, 42, 0.08);
          max-width: 780px;
          margin: 0 auto;
          align-items: center;
        }

        .search-input-group,
        .city-select-group {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          pointer-events: none;
        }

        .porcelain-input {
          width: 100%;
          padding: 12px 14px 12px 38px;
          border-radius: 12px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          color: #0f172a;
          font-size: 0.88rem;
          font-weight: 500;
          box-sizing: border-box;
          outline: none;
          transition: all 0.2s ease;
        }
        .porcelain-input:focus {
          background: #ffffff;
          border-color: #b38e47;
          box-shadow: 0 0 0 3px rgba(179, 142, 71, 0.15);
        }

        .porcelain-select {
          width: 100%;
          padding: 12px 14px 12px 38px;
          border-radius: 12px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          color: #0f172a;
          font-size: 0.86rem;
          font-weight: 500;
          box-sizing: border-box;
          outline: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .porcelain-select:focus {
          background: #ffffff;
          border-color: #b38e47;
          box-shadow: 0 0 0 3px rgba(179, 142, 71, 0.15);
        }

        .search-submit-btn {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: #ffffff;
          border: none;
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 800;
          font-size: 0.88rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
          box-shadow: 0 4px 14px rgba(15, 23, 42, 0.2);
          transition: all 0.2s ease;
        }
        .search-submit-btn:hover {
          background: #000000;
          transform: translateY(-1px);
        }

        /* 3. Main Directory Layout */
        .ustalar-main-layout {
          max-width: 1280px;
          margin: 0 auto;
          padding: 24px 16px 60px 16px;
          width: 100%;
          box-sizing: border-box;
        }

        .directory-header-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 22px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .directory-title {
          font-size: 1.35rem;
          font-weight: 900;
          color: #0f172a;
          margin: 0 0 4px 0;
          letter-spacing: -0.015em;
        }

        .directory-subtitle {
          font-size: 0.84rem;
          color: #64748b;
          margin: 0;
        }

        .secondary-register-trigger {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          color: #b38e47;
          font-size: 0.8rem;
          font-weight: 800;
          padding: 8px 14px;
          border-radius: 10px;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05);
          transition: all 0.2s ease;
        }
        .secondary-register-trigger:hover {
          border-color: #b38e47;
          background: #fdfcf9;
        }

        /* Loading & Empty States */
        .loading-state-box {
          text-align: center;
          padding: 80px 20px;
          color: #64748b;
          font-weight: 600;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
        }

        .empty-state-box {
          background: #ffffff;
          border: 1px dashed #cbd5e1;
          border-radius: 24px;
          padding: 50px 24px;
          text-align: center;
          max-width: 640px;
          margin: 20px auto;
          box-shadow: 0 4px 20px rgba(15, 23, 42, 0.03);
        }

        .empty-state-icon {
          width: 64px;
          height: 64px;
          border-radius: 20px;
          background: #fefce8;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px auto;
        }

        .empty-state-title {
          font-size: 1.2rem;
          font-weight: 850;
          color: #0f172a;
          margin: 0 0 10px 0;
        }

        .empty-state-desc {
          font-size: 0.9rem;
          color: #64748b;
          line-height: 1.6;
          margin: 0 auto 22px auto;
        }

        .empty-cta-btn {
          background: linear-gradient(135deg, #b38e47 0%, #93702e 100%);
          color: #ffffff;
          border: none;
          padding: 11px 22px;
          border-radius: 12px;
          font-weight: 800;
          font-size: 0.88rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 4px 14px rgba(179, 142, 71, 0.3);
        }

        .empty-reset-btn {
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          color: #334155;
          padding: 11px 20px;
          border-radius: 12px;
          font-weight: 750;
          font-size: 0.86rem;
          cursor: pointer;
        }

        /* Installers Grid */
        .installers-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
          width: 100%;
          box-sizing: border-box;
        }

        /* Installer Card */
        .installer-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          padding: 18px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 12px;
          box-shadow: 0 4px 20px rgba(15, 23, 42, 0.04);
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          box-sizing: border-box;
          position: relative;
        }

        .installer-card:hover {
          transform: translateY(-3px);
          border-color: #b38e47;
          box-shadow: 0 16px 36px rgba(179, 142, 71, 0.12);
        }

        /* Card Top */
        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 10px;
        }

        .installer-avatar {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          background: linear-gradient(135deg, #0f172a 0%, #334155 100%);
          color: #ffffff;
          font-weight: 900;
          font-size: 1.15rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 10px rgba(15, 23, 42, 0.15);
        }

        .installer-name {
          font-size: 1.05rem;
          font-weight: 850;
          color: #0f172a;
          margin: 0;
          line-height: 1.25;
        }

        .verified-badge {
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          color: #059669;
          padding: 2px 7px;
          border-radius: 9999px;
          font-size: 0.68rem;
          font-weight: 800;
          display: inline-flex;
          align-items: center;
          gap: 3px;
        }

        .installer-meta {
          font-size: 0.78rem;
          color: #64748b;
          margin-top: 3px;
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .meta-company {
          font-weight: 600;
          color: #334155;
        }

        .rating-pill {
          display: flex;
          align-items: center;
          gap: 4px;
          background: #fefce8;
          border: 1px solid #fef08a;
          padding: 4px 8px;
          border-radius: 10px;
          flex-shrink: 0;
        }

        .rating-score {
          font-size: 0.8rem;
          font-weight: 900;
          color: #854d0e;
        }

        .rating-count {
          font-size: 0.7rem;
          color: #a16207;
          font-weight: 600;
        }

        /* Metrics Row */
        .card-metrics-row {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .metric-tag {
          font-size: 0.72rem;
          font-weight: 750;
          padding: 4px 8px;
          border-radius: 8px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          white-space: nowrap;
        }
        .tag-exp {
          background: #fef3c7;
          color: #92400e;
          border: 1px solid #fde68a;
        }
        .tag-price {
          background: #eff6ff;
          color: #1e40af;
          border: 1px solid #dbeafe;
        }
        .tag-guarantee {
          background: #ecfdf5;
          color: #065f46;
          border: 1px solid #d1fae5;
        }

        /* Specialties Chips */
        .specialties-row {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
        }

        .spec-chip {
          font-size: 0.7rem;
          background: #f1f5f9;
          color: #475569;
          border: 1px solid #e2e8f0;
          padding: 2px 7px;
          border-radius: 6px;
          font-weight: 600;
        }

        /* Quote Bubble */
        .installer-quote-bubble {
          background: #f8fafc;
          border-left: 3px solid #b38e47;
          border-radius: 0 8px 8px 0;
          padding: 8px 12px;
          font-size: 0.78rem;
          color: #475569;
          font-style: italic;
          line-height: 1.45;
        }
        .installer-quote-bubble p {
          margin: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        /* Trigger Buttons */
        .card-triggers-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .trigger-portfolio-btn {
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          color: #1d4ed8;
          padding: 7px 10px;
          border-radius: 10px;
          font-size: 0.74rem;
          font-weight: 800;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          transition: all 0.15s ease;
        }
        .trigger-portfolio-btn:hover {
          background: #dbeafe;
        }

        .trigger-contract-btn {
          background: #fefce8;
          border: 1px solid #fef08a;
          color: #854d0e;
          padding: 7px 10px;
          border-radius: 10px;
          font-size: 0.74rem;
          font-weight: 800;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          transition: all 0.15s ease;
        }
        .trigger-contract-btn:hover {
          background: #fef08a;
        }

        /* Symmetrical Dual Actions (50 / 50) */
        .card-dual-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-top: 4px;
        }

        .btn-whatsapp-action {
          background: linear-gradient(135deg, #25d366 0%, #16a34a 100%);
          color: #ffffff;
          text-decoration: none;
          min-height: 44px;
          padding: 10px 8px;
          border-radius: 12px;
          font-size: 0.82rem;
          font-weight: 850;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          box-shadow: 0 4px 12px rgba(37, 211, 102, 0.25);
          text-align: center;
          box-sizing: border-box;
          transition: all 0.15s ease;
        }
        .btn-whatsapp-action:hover {
          opacity: 0.95;
          transform: translateY(-1px);
        }

        .btn-call-action {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: #ffffff;
          text-decoration: none;
          min-height: 44px;
          padding: 10px 8px;
          border-radius: 12px;
          font-size: 0.82rem;
          font-weight: 850;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.18);
          text-align: center;
          box-sizing: border-box;
          transition: all 0.15s ease;
        }
        .btn-call-action:hover {
          background: #000000;
          transform: translateY(-1px);
        }

        /* 4. Cross Promotion Banner */
        .cross-promo-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-top: 48px;
        }

        .promo-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          padding: 26px 24px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-shadow: 0 6px 24px rgba(15, 23, 42, 0.04);
          position: relative;
          overflow: hidden;
        }

        .promo-outlet {
          border-top: 4px solid #b38e47;
        }
        .promo-studio {
          border-top: 4px solid #2563eb;
        }

        .promo-badge {
          align-self: flex-start;
          font-size: 0.7rem;
          font-weight: 850;
          padding: 4px 10px;
          border-radius: 6px;
          background: #fefce8;
          color: #854d0e;
          border: 1px solid #fef08a;
          margin-bottom: 12px;
          letter-spacing: 0.05em;
        }
        .badge-blue {
          background: #eff6ff;
          color: #1e40af;
          border-color: #dbeafe;
        }

        .promo-title {
          font-size: 1.2rem;
          font-weight: 850;
          color: #0f172a;
          margin: 0 0 8px 0;
        }

        .promo-desc {
          font-size: 0.88rem;
          color: #64748b;
          line-height: 1.55;
          margin: 0 0 20px 0;
        }

        .promo-cta {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.85rem;
          font-weight: 800;
          text-decoration: none;
          align-self: flex-start;
          transition: gap 0.2s ease;
        }
        .promo-cta:hover {
          gap: 10px;
        }
        .cta-gold {
          color: #b38e47;
        }
        .cta-blue {
          color: #2563eb;
        }

        /* 5. Modals Shared Styles */
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 16px;
        }

        .modal-card {
          background: #ffffff;
          border-radius: 24px;
          width: 100%;
          position: relative;
          box-shadow: 0 25px 60px -15px rgba(15, 23, 42, 0.25);
          max-height: 90vh;
          overflow-y: auto;
          box-sizing: border-box;
        }

        .modal-portfolio {
          max-width: 860px;
          padding: 26px;
        }

        .modal-contract {
          max-width: 780px;
          padding: 32px 28px;
        }

        .modal-register {
          max-width: 560px;
          padding: 26px;
        }

        .modal-close-btn {
          position: absolute;
          right: 18px;
          top: 18px;
          background: #f1f5f9;
          border: none;
          color: #64748b;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
          z-index: 10;
        }
        .modal-close-btn:hover {
          background: #e2e8f0;
          color: #0f172a;
        }

        .modal-header-row {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 20px;
          padding-right: 40px;
        }

        .modal-icon-badge {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .badge-blue-icon {
          background: #eff6ff;
          color: #2563eb;
          border: 1px solid #bfdbfe;
        }
        .badge-gold-icon {
          background: #fefce8;
          color: #b38e47;
          border: 1px solid #fef08a;
        }

        .modal-title {
          font-size: 1.25rem;
          font-weight: 900;
          color: #0f172a;
          margin: 0 0 2px 0;
          line-height: 1.25;
        }

        .modal-subtitle {
          font-size: 0.8rem;
          color: #64748b;
          font-weight: 600;
        }

        /* Portfolio Modal Content */
        .empty-portfolio-box {
          text-align: center;
          padding: 40px 20px;
          background: #f8fafc;
          border-radius: 18px;
          border: 1px dashed #cbd5e1;
        }

        .portfolio-tabs-row {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
          overflow-x: auto;
          padding-bottom: 4px;
        }

        .portfolio-tab-btn {
          background: #f1f5f9;
          color: #475569;
          border: 1px solid #e2e8f0;
          padding: 8px 14px;
          border-radius: 10px;
          font-size: 0.8rem;
          font-weight: 750;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.15s ease;
        }
        .portfolio-tab-btn.active {
          background: #2563eb;
          border-color: #2563eb;
          color: #ffffff;
        }

        .project-info-strip {
          background: #f8fafc;
          padding: 14px 16px;
          border-radius: 14px;
          border: 1px solid #e2e8f0;
          margin-bottom: 16px;
        }

        .project-title {
          font-size: 1.05rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 6px 0;
        }

        .project-meta-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
          font-size: 0.8rem;
          color: #475569;
        }

        .before-after-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 20px;
        }

        .comparison-card {
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);
        }

        .before-header {
          padding: 10px 14px;
          background: #fef2f2;
          border-bottom: 1px solid #fee2e2;
          font-size: 0.78rem;
          font-weight: 850;
          color: #b91c1c;
        }

        .after-header {
          padding: 10px 14px;
          background: #ecfdf5;
          border-bottom: 1px solid #d1fae5;
          font-size: 0.78rem;
          font-weight: 850;
          color: #047857;
        }

        .comparison-img-wrapper {
          height: 240px;
          overflow: hidden;
          background: #f1f5f9;
        }

        .comparison-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .modal-cta-footer {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          padding-top: 10px;
        }

        /* Contract Modal Content */
        .contract-header {
          text-align: center;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 16px;
          margin-bottom: 20px;
        }

        .contract-eyebrow {
          font-size: 0.72rem;
          font-weight: 850;
          color: #b38e47;
          letter-spacing: 0.06em;
          margin-bottom: 4px;
        }

        .contract-title {
          font-size: 1.25rem;
          font-weight: 900;
          color: #0f172a;
          margin: 0 0 6px 0;
        }

        .contract-subtitle {
          font-size: 0.8rem;
          color: #64748b;
          margin: 0;
        }

        .contract-body {
          display: flex;
          flex-direction: column;
          gap: 16px;
          font-size: 0.85rem;
          line-height: 1.6;
          color: #334155;
        }

        .contract-section {
          background: #f8fafc;
          padding: 14px 16px;
          border-radius: 14px;
          border: 1px solid #e2e8f0;
        }

        .contract-section-heading {
          font-size: 0.9rem;
          color: #0f172a;
          margin: 0 0 8px 0;
          font-weight: 850;
        }

        .contract-two-col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .contract-metrics-box {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 10px;
          background: #ffffff;
          padding: 12px;
          border-radius: 10px;
          border: 1px solid #cbd5e1;
        }

        .contract-rules-list {
          margin: 0;
          padding-left: 20px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .contract-signatures {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-top: 10px;
          text-align: center;
        }

        .signature-box {
          border-top: 1px solid #cbd5e1;
          padding-top: 12px;
        }

        .print-contract-btn {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: #ffffff;
          border: none;
          padding: 12px 26px;
          border-radius: 12px;
          font-weight: 800;
          font-size: 0.9rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 14px rgba(15, 23, 42, 0.2);
        }

        /* Register Modal Form */
        .register-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .form-label {
          font-size: 0.78rem;
          color: #334155;
          display: block;
          margin-bottom: 4px;
          font-weight: 750;
        }

        .form-input,
        .form-select,
        .form-textarea {
          width: 100%;
          padding: 10px 12px;
          border-radius: 10px;
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          color: #0f172a;
          font-size: 0.86rem;
          box-sizing: border-box;
          outline: none;
          transition: all 0.2s ease;
        }
        .form-input:focus,
        .form-select:focus,
        .form-textarea:focus {
          background: #ffffff;
          border-color: #b38e47;
          box-shadow: 0 0 0 3px rgba(179, 142, 71, 0.15);
        }

        .form-row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .form-row-3 {
          display: grid;
          grid-template-columns: 1.2fr 1.2fr 1fr;
          gap: 10px;
        }

        .photo-upload-container {
          background: #f8fafc;
          padding: 12px;
          border-radius: 14px;
          border: 1px solid #e2e8f0;
        }

        .photo-upload-title {
          font-size: 0.78rem;
          color: #0f172a;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .photo-upload-count {
          font-size: 0.72rem;
          color: #64748b;
          font-weight: 700;
        }

        .photo-dropzone {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
          border-radius: 10px;
          border: 2px dashed #b38e47;
          background: #fefce8;
          color: #854d0e;
          cursor: pointer;
          font-size: 0.82rem;
          font-weight: 750;
          margin-bottom: 10px;
          transition: all 0.2s ease;
        }
        .photo-dropzone:hover {
          background: #fef9c3;
        }

        .uploaded-thumbnails-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }

        .thumb-item {
          position: relative;
          height: 75px;
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid #cbd5e1;
        }
        .thumb-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .thumb-remove-btn {
          position: absolute;
          top: 4px;
          right: 4px;
          background: rgba(239, 68, 68, 0.9);
          color: #ffffff;
          border: none;
          border-radius: 50%;
          width: 22px;
          height: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .kvkk-check-row {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          margin: 4px 0;
        }

        .kvkk-label {
          font-size: 0.78rem;
          color: #475569;
          line-height: 1.4;
          cursor: pointer;
          user-select: none;
        }

        .form-submit-btn {
          background: linear-gradient(135deg, #b38e47 0%, #93702e 100%);
          color: #ffffff;
          border: none;
          padding: 13px;
          border-radius: 12px;
          font-weight: 850;
          font-size: 0.92rem;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(179, 142, 71, 0.3);
          transition: all 0.2s ease;
        }
        .form-submit-btn:hover {
          opacity: 0.95;
          transform: translateY(-1px);
        }

        .form-error-alert {
          background: #fef2f2;
          border: 1px solid #fee2e2;
          color: #b91c1c;
          padding: 10px 14px;
          border-radius: 10px;
          font-size: 0.84rem;
        }

        .register-success-box {
          background: #ecfdf5;
          border: 1px solid #d1fae5;
          border-radius: 16px;
          padding: 26px 20px;
          text-align: center;
        }

        /* 9. Mobile Responsive Overrides */
        @media (max-width: 768px) {
          .ustalar-app-header {
            padding: 8px 12px;
          }

          .desktop-text {
            display: none;
          }
          .mobile-text {
            display: inline;
          }

          .ustalar-header-reg-btn {
            padding: 7px 11px;
            font-size: 0.76rem;
            border-radius: 8px;
          }

          .ustalar-hero-section {
            padding: 26px 12px 18px 12px;
          }

          .hero-value-pills {
            justify-content: flex-start;
            overflow-x: auto;
            scrollbar-width: none;
            padding-bottom: 4px;
          }
          .hero-value-pills::-webkit-scrollbar {
            display: none;
          }

          .city-chips-carousel {
            justify-content: flex-start;
            padding-left: 2px;
            padding-right: 2px;
          }

          .search-filter-card {
            grid-template-columns: 1fr !important;
            gap: 8px !important;
            padding: 10px !important;
            border-radius: 16px !important;
          }

          .search-submit-btn {
            width: 100% !important;
            justify-content: center !important;
            padding: 12px !important;
          }

          .ustalar-main-layout {
            padding: 16px 12px 40px 12px !important;
          }

          .directory-header-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .secondary-register-trigger {
            width: 100%;
            justify-content: center;
          }

          .installers-grid {
            grid-template-columns: 100% !important;
            gap: 14px !important;
          }

          .installer-card {
            padding: 16px 14px !important;
          }

          .card-dual-actions {
            grid-template-columns: 1fr 1fr !important;
            gap: 6px !important;
          }

          .btn-whatsapp-action,
          .btn-call-action {
            font-size: 0.78rem !important;
            padding: 10px 4px !important;
            gap: 4px !important;
          }

          .cross-promo-grid {
            grid-template-columns: 1fr !important;
            gap: 14px !important;
            margin-top: 32px !important;
          }

          .before-after-grid {
            grid-template-columns: 1fr !important;
          }

          .comparison-img-wrapper {
            height: 200px;
          }

          .modal-cta-footer {
            grid-template-columns: 1fr !important;
          }

          .contract-two-col,
          .contract-signatures {
            grid-template-columns: 1fr !important;
            gap: 12px;
          }

          .form-row-2,
          .form-row-3 {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
