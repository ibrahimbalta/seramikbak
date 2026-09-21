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
  ChevronLeft
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

        // Convert file to Base64
        const reader = new FileReader();
        const base64Promise = new Promise((resolve) => {
          reader.onload = (event) => resolve(event.target.result);
          reader.readAsDataURL(file);
        });
        const base64Data = await base64Promise;

        // Upload to server API
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
          // Fallback to client base64 Data URL if server upload is read-only
          newUrls.push(base64Data);
        }
      }
      setUploadedPhotos(newUrls);
    } catch (err) {
      console.error('File upload error:', err);
      // Fallback to base64 data URL
      setUploadedPhotos(prev => [...prev]);
    } finally {
      setUploadingPhotos(false);
      e.target.value = '';
    }
  };

  const handleRemovePhoto = (index) => {
    setUploadedPhotos(prev => prev.filter((_, i) => i !== index));
  };

  // Before & After Portfolio Modal State
  const [selectedPortfolioInstaller, setSelectedPortfolioInstaller] = useState(null);
  const [activePortfolioIndex, setActivePortfolioIndex] = useState(0);

  // Standard Contract Modal State
  const [selectedContractInstaller, setSelectedContractInstaller] = useState(null);

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
          areaM2: '30 m²',
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
    <div style={{ minHeight: '100vh', background: '#090d16', color: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Header Navigation - Mobile App Bar */}
      <header className="ustalar-app-header">
        <div className="ustalar-header-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link href="/" className="ustalar-back-btn" title="Ana Sayfaya Dön">
              <ChevronLeft size={18} />
            </Link>

            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #182030 0%, #0b0f19 100%)',
                border: '1.5px solid #d4af37',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '900',
                color: '#ffffff',
                fontSize: '0.95rem',
                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.25)',
                flexShrink: 0
              }}>SB</div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '1rem', fontWeight: '900', color: '#ffffff', lineHeight: '1.1' }}>
                  SeramikBak
                </span>
                <span style={{ color: '#d4af37', fontSize: '0.68rem', fontWeight: '800', letterSpacing: '0.05em' }}>
                  USTA REHBERİ
                </span>
              </div>
            </Link>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setShowRegisterModal(true)}
              className="ustalar-header-reg-btn"
            >
              <Plus size={14} />
              <span className="btn-text-desktop">Usta Olarak Kaydol (Ücretsiz)</span>
              <span className="btn-text-mobile">Usta Kaydı</span>
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION - COMPACT ON MOBILE */}
      <section className="ustalar-hero-section">
        <div style={{ maxWidth: '840px', margin: '0 auto' }}>
          <div className="ustalar-badge-pill">
            <ShieldCheck size={13} style={{ flexShrink: 0 }} />
            <span>81 İLDE ONAYLI SERAMİK UYGULAMA REHBERİ</span>
          </div>

          <h1 className="ustalar-hero-title">
            Banyonuz & Şantiyeniz İçin Onaylı Seramik Ustalarını Bulun
          </h1>

          <p className="ustalar-hero-desc">
            Seramiği aldınız ancak kime döşeteceğinizi bilmiyor musunuz? Lazer terazili ve garanti sertifikalı ustaların canlı portfolyosunu inceleyin, güvenle çalışın.
          </p>

          {/* Quick Highlight Badges */}
          <div className="ustalar-feature-pills">
            <span className="feat-pill feat-green">
              <CheckSquare size={13} />
              Terazi & Derz Uyumlu
            </span>
            <span className="feat-pill feat-blue">
              <Camera size={13} />
              Canlı Şantiye Portfolyosu
            </span>
            <span className="feat-pill feat-gold">
              <FileText size={13} />
              Hazır Standart Sözleşme
            </span>
          </div>

          {/* QUICK CITY FILTER CHIPS */}
          <div className="mobile-city-chips">
            {['ALL', 'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Kocaeli', 'Gaziantep', 'Konya'].map(city => (
              <button
                key={city}
                type="button"
                className={`city-chip-btn ${selectedCity === city ? 'active' : ''}`}
                onClick={() => setSelectedCity(city)}
              >
                {city === 'ALL' ? '📍 Tüm İller' : city}
              </button>
            ))}
          </div>

          {/* Search & Filter Bar - Symmetrical on Mobile */}
          <form onSubmit={handleSearchSubmit} className="ustalar-filter-form">
            <div className="ustalar-input-wrapper">
              <Search size={16} className="ustalar-search-icon" />
              <input
                type="text"
                placeholder="Usta adı, ilçe veya ebat (60x120)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ustalar-text-input"
              />
            </div>

            <div className="ustalar-select-wrapper">
              <MapPin size={16} className="ustalar-pin-icon" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="ustalar-select-input"
              >
                <option value="ALL">Tüm Şehirler (81 İl)</option>
                {TURKEY_CITIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <button type="submit" className="ustalar-submit-btn">
              Ustaları Ara
            </button>
          </form>
        </div>
      </section>

      {/* INSTALLERS GRID */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '30px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: '0 0 4px 0', color: '#ffffff' }}>
              {selectedCity !== 'ALL' ? `${selectedCity} Seramik Ustaları` : 'Onaylı Seramik Ustaları'}
            </h2>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Toplam {installers.length} onaylı usta ve uygulama ekibi listeleniyor
            </span>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
            <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 12px auto' }} />
            <span>Ustalar yükleniyor...</span>
          </div>
        ) : installers.length === 0 ? (
          <div style={{
            background: 'rgba(30, 41, 59, 0.4)',
            border: '1px dashed rgba(255,255,255,0.15)',
            borderRadius: '20px',
            padding: '40px 20px',
            textAlign: 'center'
          }}>
            <Wrench size={40} style={{ color: '#64748b', margin: '0 auto 16px auto' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fff', margin: '0 0 8px 0' }}>
              {selectedCity !== 'ALL' ? `${selectedCity} Şehrinde Henüz Kayıtlı Usta Bulunmuyor` : 'Aramanızla Eşleşen Usta Bulunamadı'}
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8', maxWidth: '460px', margin: '0 auto 20px auto' }}>
              Bu şehirde seramik ustası mısınız? Ücretsiz profil oluşturarak seramik bakan binlerce müşteriye hemen ulaşabilirsiniz.
            </p>
            <button
              onClick={() => { setShowRegisterModal(true); if (selectedCity !== 'ALL') setRegCity(selectedCity); }}
              style={{
                background: '#d4af37',
                color: '#000000',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '10px',
                fontWeight: '800',
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}
            >
              Bu Şehirde Usta Olarak Kaydol
            </button>
          </div>
        ) : (
          <div className="installers-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))',
            gap: '16px'
          }}>
            {installers.map(inst => {
              const portfolioList = parsePortfolio(inst.portfolioBeforeAfter);
              const waText = encodeURIComponent(
                `Merhaba ${inst.name}, SeramikBak platformundaki Usta Rehberi profiliniz üzerinden ulaşıyorum. ` +
                `${inst.city} bölgesinde seramik kaplama / yenileme işimiz için bilgi ve teklif almak istiyoruz.`
              );
              const waLink = `https://wa.me/${inst.phone.replace(/[^\d]/g, '')}?text=${waText}`;

              return (
                <div key={inst.id} style={{
                  background: 'rgba(15, 23, 42, 0.85)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '16px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
                  transition: 'all 0.2s ease'
                }}>
                  <div>
                    {/* Top Row: Name + Verified + Rating */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <div style={{ flex: 1, minWidth: 0, paddingRight: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <h3 style={{ fontSize: '1.05rem', fontWeight: '900', color: '#ffffff', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {inst.name}
                          </h3>
                          {inst.verified && (
                            <span title="Onaylı Seramik Ustası" style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#10b981', padding: '1px 6px', borderRadius: '10px', fontSize: '0.65rem', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                              <ShieldCheck size={11} />
                              Onaylı
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          {inst.companyName && <span>🏢 {inst.companyName}</span>}
                          <span>📍 {inst.city} {inst.district ? `/ ${inst.district}` : ''}</span>
                        </div>
                      </div>

                      {/* Rating Badge */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(212, 175, 55, 0.15)', border: '1px solid rgba(212, 175, 55, 0.3)', padding: '3px 8px', borderRadius: '8px', flexShrink: 0 }}>
                        <Star size={12} style={{ color: '#d4af37', fill: '#d4af37' }} />
                        <span style={{ fontSize: '0.78rem', fontWeight: '900', color: '#fef08a' }}>{inst.rating || '5.0'}</span>
                        <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>({inst.reviewCount || 12})</span>
                      </div>
                    </div>

                    {/* Inline Info Badge Bar (Single Row!) */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.7rem', background: 'rgba(212, 175, 55, 0.1)', color: '#d4af37', padding: '3px 8px', borderRadius: '6px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Award size={11} />
                        {inst.experienceYears} Yıl Tecrübe
                      </span>

                      {inst.contractRateM2 && (
                        <span style={{ fontSize: '0.7rem', background: 'rgba(59, 130, 246, 0.12)', color: '#60a5fa', padding: '3px 8px', borderRadius: '6px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Ruler size={11} />
                          {inst.contractRateM2}
                        </span>
                      )}

                      {inst.guaranteeBadge !== false && (
                        <span style={{ fontSize: '0.7rem', background: 'rgba(16, 185, 129, 0.12)', color: '#34d399', padding: '3px 8px', borderRadius: '6px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <ShieldCheck size={11} />
                          Terazi & Derz Uyumlu
                        </span>
                      )}
                    </div>

                    {/* Specialties Tags (Compact) */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
                      {inst.specialties.split(',').slice(0, 3).map((spec, idx) => (
                        <span key={idx} style={{ fontSize: '0.68rem', background: 'rgba(51, 65, 85, 0.5)', color: '#cbd5e1', padding: '2px 6px', borderRadius: '4px' }}>
                          {spec.trim()}
                        </span>
                      ))}
                    </div>

                    {/* Bio Note (Truncated to 1 line) */}
                    {inst.notes && (
                      <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0 0 6px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontStyle: 'italic' }}>
                        "{inst.notes}"
                      </p>
                    )}

                    {/* Quick Modal Trigger Buttons */}
                    <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                      <button
                        onClick={() => {
                          setSelectedPortfolioInstaller(inst);
                          setActivePortfolioIndex(0);
                        }}
                        style={{
                          background: portfolioList.length > 0 ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                          border: portfolioList.length > 0 ? '1px solid rgba(59, 130, 246, 0.35)' : '1px solid rgba(255, 255, 255, 0.1)',
                          color: portfolioList.length > 0 ? '#60a5fa' : '#94a3b8',
                          padding: '5px 9px',
                          borderRadius: '6px',
                          fontSize: '0.7rem',
                          fontWeight: '800',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          flex: 1
                        }}
                      >
                        <Camera size={12} />
                        <span>{portfolioList.length > 0 ? `Portfolyo (${portfolioList.length})` : 'Portfolyo'}</span>
                      </button>

                      <button
                        onClick={() => setSelectedContractInstaller(inst)}
                        style={{
                          background: 'rgba(212, 175, 55, 0.12)',
                          border: '1px solid rgba(212, 175, 55, 0.3)',
                          color: '#fef08a',
                          padding: '5px 9px',
                          borderRadius: '6px',
                          fontSize: '0.7rem',
                          fontWeight: '800',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          flex: 1
                        }}
                      >
                        <FileText size={12} />
                        <span>Örnek Sözleşme</span>
                      </button>
                    </div>
                  </div>

                  {/* Symmetrical Dual Action Buttons */}
                  <div className="installer-card-actions" style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '8px',
                    marginTop: '8px'
                  }}>
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-wa-installer"
                      style={{
                        background: 'linear-gradient(135deg, #25d366 0%, #16a34a 100%)',
                        color: '#ffffff',
                        textDecoration: 'none',
                        padding: '11px 8px',
                        minHeight: '44px',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: '850',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        boxShadow: '0 4px 14px rgba(37, 211, 102, 0.25)',
                        textAlign: 'center',
                        boxSizing: 'border-box'
                      }}
                    >
                      <MessageSquare size={15} />
                      <span>WhatsApp Teklif</span>
                    </a>

                    <a
                      href={`tel:${inst.phone.replace(/[^\d+]/g, '')}`}
                      className="btn-call-installer"
                      style={{
                        background: 'linear-gradient(135deg, #d4af37 0%, #b38e47 100%)',
                        color: '#000000',
                        textDecoration: 'none',
                        padding: '11px 8px',
                        minHeight: '44px',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: '850',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        boxShadow: '0 4px 14px rgba(212, 175, 55, 0.25)',
                        textAlign: 'center',
                        boxSizing: 'border-box'
                      }}
                    >
                      <Phone size={15} />
                      <span>Hemen Ara</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* 1. BEFORE & AFTER PORTFOLIO GALLERY MODAL */}
      {selectedPortfolioInstaller && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.88)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }} onClick={() => setSelectedPortfolioInstaller(null)}>
          <div style={{
            background: '#0f172a',
            border: '1px solid rgba(59, 130, 246, 0.4)',
            borderRadius: '24px',
            maxWidth: '850px',
            width: '100%',
            padding: '24px',
            position: 'relative',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedPortfolioInstaller(null)}
              style={{
                position: 'absolute',
                right: '16px',
                top: '16px',
                background: 'rgba(255,255,255,0.08)',
                border: 'none',
                color: '#94a3b8',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={16} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                flexShrink: 0
              }}>
                <Camera size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#ffffff', margin: 0 }}>
                  {selectedPortfolioInstaller.name} — Canlı Proje Portfolyosu
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#60a5fa', fontWeight: '700' }}>
                  Öncesi (Eski Şantiye / Banyo) vs. Sonrası (Tamamlanan Seramik Kaplama)
                </span>
              </div>
            </div>

            {(() => {
              const pList = parsePortfolio(selectedPortfolioInstaller.portfolioBeforeAfter);
              if (!pList || pList.length === 0) {
                return (
                  <div style={{ textAlign: 'center', padding: '40px 20px', background: 'rgba(30, 41, 59, 0.4)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                    <Camera size={36} style={{ color: '#64748b', marginBottom: '12px' }} />
                    <h4 style={{ fontSize: '1rem', color: '#fff', margin: '0 0 6px 0' }}>Henüz Yüklenmiş Öncesi/Sonrası Fotoğrafı Yok</h4>
                    <p style={{ fontSize: '0.84rem', color: '#94a3b8', margin: 0 }}>
                      Bu usta ile WhatsApp veya telefon üzerinden iletişime geçerek referans şantiye fotoğraflarını isteyebilirsiniz.
                    </p>
                  </div>
                );
              }

              const currentProject = pList[activePortfolioIndex] || pList[0];

              return (
                <div>
                  {/* Project Selector Tabs */}
                  {pList.length > 1 && (
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
                      {pList.map((proj, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActivePortfolioIndex(idx)}
                          style={{
                            background: activePortfolioIndex === idx ? '#3b82f6' : 'rgba(30, 41, 59, 0.8)',
                            color: '#ffffff',
                            border: activePortfolioIndex === idx ? 'none' : '1px solid rgba(255,255,255,0.1)',
                            padding: '6px 14px',
                            borderRadius: '10px',
                            fontSize: '0.78rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          Proje #{idx + 1}: {proj.title || 'Şantiye Yenileme'}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Project Detail Header */}
                  <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '14px 16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '16px' }}>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#ffffff', margin: '0 0 6px 0' }}>
                      {currentProject.title || 'Banyo / Zemin Seramik Yenileme'}
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', fontSize: '0.78rem', color: '#cbd5e1' }}>
                      {currentProject.areaM2 && <span>📐 <strong>Uygulama Alanı:</strong> {currentProject.areaM2}</span>}
                      {currentProject.duration && <span>⏱️ <strong>Teslimat Süresi:</strong> {currentProject.duration}</span>}
                      {currentProject.ceramicUsed && <span>🧱 <strong>Kullanılan Seramik:</strong> {currentProject.ceramicUsed}</span>}
                    </div>
                  </div>

                  {/* BEFORE & AFTER SIDE BY SIDE IMAGE COMPARISON */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                    {/* BEFORE CARD */}
                    <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '16px', overflow: 'hidden' }}>
                      <div style={{ padding: '10px 14px', background: 'rgba(239, 68, 68, 0.2)', borderBottom: '1px solid rgba(239, 68, 68, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: '900', color: '#f87171' }}>🔴 ÖNCESİ (Eski Banyo / Şantiye)</span>
                      </div>
                      <div style={{ height: '240px', overflow: 'hidden', position: 'relative' }}>
                        <img
                          src={currentProject.beforeUrl || 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=80'}
                          alt="Öncesi"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    </div>

                    {/* AFTER CARD */}
                    <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '16px', overflow: 'hidden' }}>
                      <div style={{ padding: '10px 14px', background: 'rgba(16, 185, 129, 0.2)', borderBottom: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: '900', color: '#34d399' }}>🟢 SONRASI (Yeni Seramik Kaplama)</span>
                      </div>
                      <div style={{ height: '240px', overflow: 'hidden', position: 'relative' }}>
                        <img
                          src={currentProject.afterUrl || 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=600&auto=format&fit=crop&q=80'}
                          alt="Sonrası"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* 2. STANDARD CONTRACT TEMPLATE MODAL */}
      {selectedContractInstaller && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.88)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }} onClick={() => setSelectedContractInstaller(null)}>
          <div style={{
            background: '#ffffff',
            color: '#0f172a',
            borderRadius: '24px',
            maxWidth: '750px',
            width: '100%',
            padding: '30px',
            position: 'relative',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
            maxHeight: '90vh',
            overflowY: 'auto',
            fontFamily: 'Arial, sans-serif'
          }} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedContractInstaller(null)}
              style={{
                position: 'absolute',
                right: '20px',
                top: '20px',
                background: '#f1f5f9',
                border: 'none',
                color: '#64748b',
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={18} />
            </button>

            {/* Document Header */}
            <div style={{ textAlign: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '16px', marginBottom: '20px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#b38e47', letterSpacing: '1px', marginBottom: '4px' }}>KURUMSAL SERAMİK UYGULAMA VE KALİTE STANDARTLARI</div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0f172a', margin: '0 0 6px 0' }}>
                STANDART SERAMİK VE KARO UYGULAMA İŞ SÖZLEŞMESİ
              </h2>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                İşveren (Müşteri) ile Uzman Seramik Ustası (Yüklenici) Arasında Uygulama ve İş Teslim Belgesi
              </span>
            </div>

            {/* Contract Sections */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.84rem', lineHeight: '1.6', color: '#334155' }}>
              {/* Part 1: Parties */}
              <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ fontSize: '0.9rem', color: '#0f172a', margin: '0 0 8px 0', fontWeight: '800' }}>1. TARAFLAR VE İLETİŞİM</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                  <div>
                    <strong>YÜKLENİCİ USTA / FİRMA:</strong><br />
                    <span>Ad Soyad: {selectedContractInstaller.name}</span><br />
                    <span>Firma: {selectedContractInstaller.companyName || 'Bireysel Usta Uygulayıcı'}</span><br />
                    <span>Telefon: {selectedContractInstaller.phone}</span><br />
                    <span>Hizmet Bölgesi: {selectedContractInstaller.city} / {selectedContractInstaller.district || ''}</span>
                  </div>

                  <div>
                    <strong>İŞVEREN (MÜŞTERİ):</strong><br />
                    <span>Ad Soyad: ___________________________</span><br />
                    <span>Telefon: ___________________________</span><br />
                    <span>Uygulama Adresi: ___________________________</span>
                  </div>
                </div>
              </div>

              {/* Part 2: Subject & Pricing */}
              <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ fontSize: '0.9rem', color: '#0f172a', margin: '0 0 8px 0', fontWeight: '800' }}>2. İŞİN KONUSU VE BİRİM FİYAT</h4>
                <p style={{ margin: '0 0 8px 0' }}>
                  Bu sözleşme; İşveren tarafın belirlediği ıslak hacim (banyo/mutfak/balkon/teras) alanlarında seramik/porselen karo kaplama, derz dolgusu ve tesviye işçiliğinin yapılmasıdır.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px', background: '#fff', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  <div><strong>Tahmini m² Alanı:</strong> _____ m²</div>
                  <div><strong>m² İşçilik Fiyatı:</strong> {selectedContractInstaller.contractRateM2 || '280 ₺/m²'}</div>
                  <div><strong>Tahmini Teslim Süresi:</strong> _____ Gün</div>
                </div>
              </div>

              {/* Part 3: Realistic Uygulama Esasları & Teslim Koşulları */}
              <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ fontSize: '0.9rem', color: '#0f172a', margin: '0 0 8px 0', fontWeight: '800' }}>3. UYGULAMA ESASLARI VE TESLİMAT KOŞULLARI</h4>
                <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <li><strong>📏 Su Terazisi ve Eğim Kontrolü:</strong> Zemin ve duvar seramikleri su terazisine alınarak döşenecek, banyo ve balkon zeminlerinde gider süzgecine doğru gerekli su akış eğimi verilecektir.</li>
                  <li><strong>📐 Derz Aralığı ve Derz Artısı Kullanımı:</strong> Seramik cinsine ve ebadına uygun plastik derz artısı kullanılacak, yüzey kot ve hizalamaları özenle yapılacaktır.</li>
                  <li><strong>💧 Islak Hacim Zemin Hazırlığı:</strong> Seramik kaplaması öncesinde zemin ve duvar yüzeyi toz, harç kalıntısı ve oynak parçalardan temizlenerek harç yatağı oluşturulacaktır.</li>
                  <li><strong>🧹 Kaba Şantiye Temizliği:</strong> Uygulama bitiminde seramik yüzeylerindeki derz ve yapıştırıcı harç artıklarının kaba temizliği yapılarak alan teslim edilecektir.</li>
                  <li><strong>🤝 Müşteri Ortak Kontrolü ve Teslimat:</strong> İş tamamlandığında İşveren ve Yüklenici Usta alanı birlikte gezer; kırık, çatlak veya belirgin işçilik eksikleri teslimat sırasında tespit edilip düzeltilir.</li>
                </ul>
              </div>

              {/* Signatures Footer */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '10px', textAlign: 'center' }}>
                <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '10px' }}>
                  <strong>Yüklenici Usta İmza</strong><br />
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{selectedContractInstaller.name}</span>
                </div>

                <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '10px' }}>
                  <strong>İşveren Müşteri İmza</strong><br />
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Ad Soyad</span>
                </div>
              </div>

              {/* Print / Download Button */}
              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <button
                  onClick={() => window.print()}
                  style={{
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    fontWeight: '800',
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(15, 23, 42, 0.3)'
                  }}
                >
                  <Printer size={16} />
                  <span>Sözleşmeyi Yazdır / PDF İndir</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REGISTER INSTALLER MODAL */}
      {showRegisterModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }} onClick={() => setShowRegisterModal(false)}>
          <div style={{
            background: '#0f172a',
            border: '1px solid rgba(212, 175, 55, 0.4)',
            borderRadius: '24px',
            maxWidth: '540px',
            width: '100%',
            padding: '24px',
            position: 'relative',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowRegisterModal(false)}
              style={{
                position: 'absolute',
                right: '16px',
                top: '16px',
                background: 'rgba(255,255,255,0.08)',
                border: 'none',
                color: '#94a3b8',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={16} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #d4af37 0%, #b38e47 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#000000',
                boxShadow: '0 4px 14px rgba(212, 175, 55, 0.3)',
                flexShrink: 0
              }}>
                <Wrench size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#ffffff', margin: 0 }}>Usta Kayıt Formu</h3>
                <span style={{ fontSize: '0.78rem', color: '#d4af37', fontWeight: '700' }}>81 İlde Seramik Alıcılarına Ulaşın</span>
              </div>
            </div>

            {regSuccess ? (
              <div style={{
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                borderRadius: '14px',
                padding: '20px',
                textAlign: 'center'
              }}>
                <CheckCircle2 size={40} style={{ color: '#10b981', marginBottom: '10px' }} />
                <h4 style={{ fontSize: '1.05rem', color: '#ffffff', fontWeight: '800', marginBottom: '6px' }}>Başvurunuz Alındı!</h4>
                <p style={{ fontSize: '0.84rem', color: '#cbd5e1', margin: '0 0 16px 0' }}>{regSuccess}</p>
                <button
                  onClick={() => { setShowRegisterModal(false); setRegSuccess(''); }}
                  style={{
                    background: '#10b981',
                    color: '#ffffff',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '10px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                >
                  Tamam
                </button>
              </div>
            ) : (
              <form onSubmit={handleRegisterInstaller} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {regError && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#f87171', padding: '10px 14px', borderRadius: '10px', fontSize: '0.82rem' }}>
                    ⚠️ {regError}
                  </div>
                )}

                <div>
                  <label style={{ fontSize: '0.76rem', color: '#cbd5e1', display: 'block', marginBottom: '4px', fontWeight: '700' }}>Adınız Soyadınız *</label>
                  <input
                    type="text"
                    placeholder="Örn: Mehmet Usta"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', background: 'rgba(30, 41, 59, 0.9)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.86rem', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.76rem', color: '#cbd5e1', display: 'block', marginBottom: '4px', fontWeight: '700' }}>Firma / Ekip Adı</label>
                    <input
                      type="text"
                      placeholder="Örn: Yıldız Yapı Dek."
                      value={regCompany}
                      onChange={(e) => setRegCompany(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', background: 'rgba(30, 41, 59, 0.9)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.86rem', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.76rem', color: '#cbd5e1', display: 'block', marginBottom: '4px', fontWeight: '700' }}>Telefon Numaranız *</label>
                    <input
                      type="tel"
                      placeholder="Örn: 0532 123 45 67"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      required
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', background: 'rgba(30, 41, 59, 0.9)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.86rem', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.76rem', color: '#cbd5e1', display: 'block', marginBottom: '4px', fontWeight: '700' }}>Hizmet Şehri *</label>
                    <select
                      value={regCity}
                      onChange={(e) => setRegCity(e.target.value)}
                      style={{ width: '100%', padding: '10px 10px', borderRadius: '10px', background: 'rgba(30, 41, 59, 0.9)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.84rem', boxSizing: 'border-box' }}
                    >
                      {TURKEY_CITIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.76rem', color: '#cbd5e1', display: 'block', marginBottom: '4px', fontWeight: '700' }}>Hizmet İlçeleri</label>
                    <input
                      type="text"
                      placeholder="Örn: Kadıköy"
                      value={regDistrict}
                      onChange={(e) => setRegDistrict(e.target.value)}
                      style={{ width: '100%', padding: '10px 10px', borderRadius: '10px', background: 'rgba(30, 41, 59, 0.9)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.84rem', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.76rem', color: '#cbd5e1', display: 'block', marginBottom: '4px', fontWeight: '700' }}>Tahmini m² İşçilik Fiyatı</label>
                    <input
                      type="text"
                      placeholder="280 ₺/m²"
                      value={regContractRate}
                      onChange={(e) => setRegContractRate(e.target.value)}
                      style={{ width: '100%', padding: '10px 10px', borderRadius: '10px', background: 'rgba(30, 41, 59, 0.9)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.84rem', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.76rem', color: '#cbd5e1', display: 'block', marginBottom: '4px', fontWeight: '700' }}>Uzmanlık Alanlarınız (Virgülle Ayırın)</label>
                  <input
                    type="text"
                    placeholder="Örn: 60x120 Karo, Banyo Seramiği, Su İzolasyonu"
                    value={regSpecialties}
                    onChange={(e) => setRegSpecialties(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', background: 'rgba(30, 41, 59, 0.9)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.86rem', boxSizing: 'border-box' }}
                  />
                </div>

                {/* Local Device Photo Upload Section (Max 3 Photos) */}
                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(212,175,55,0.3)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.76rem', color: '#fef08a', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Camera size={14} />
                      📸 Örnek Şantiye Fotoğrafları (En Fazla 3 Adet):
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{uploadedPhotos.length}/3 Yüklendi</span>
                  </div>

                  {/* File Input Box */}
                  {uploadedPhotos.length < 3 && (
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '12px',
                      borderRadius: '10px',
                      border: '2px dashed rgba(212,175,55,0.4)',
                      background: 'rgba(30, 41, 59, 0.6)',
                      color: '#d4af37',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      marginBottom: '10px',
                      transition: 'all 0.2s ease'
                    }}>
                      <Upload size={16} />
                      <span>{uploadingPhotos ? 'Fotoğraflar Yükleniyor...' : '📁 Cihazından En Fazla 3 Adet Fotoğraf Seç'}</span>
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

                  {/* Thumbnail Previews */}
                  {uploadedPhotos.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                      {uploadedPhotos.map((url, idx) => (
                        <div key={idx} style={{ position: 'relative', height: '70px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.2)' }}>
                          <img src={url} alt={`Şantiye Görsel ${idx+1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(idx)}
                            style={{
                              position: 'absolute',
                              top: '4px',
                              right: '4px',
                              background: 'rgba(239, 68, 68, 0.9)',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '50%',
                              width: '20px',
                              height: '20px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer'
                            }}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ fontSize: '0.76rem', color: '#cbd5e1', display: 'block', marginBottom: '4px', fontWeight: '700' }}>Hizmet Notunuz / Tanıtımınız</label>
                  <textarea
                    rows={2}
                    placeholder="Ekip mevcudunuz, lazerli terazi tecrübeniz veya iş teslim garantiniz..."
                    value={regNotes}
                    onChange={(e) => setRegNotes(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', background: 'rgba(30, 41, 59, 0.9)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.82rem', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '6px', marginBottom: '6px' }}>
                  <input 
                    type="checkbox" 
                    id="installer-kvkk-check" 
                    checked={regKvkkAccepted} 
                    onChange={(e) => setRegKvkkAccepted(e.target.checked)} 
                    required
                    style={{ marginTop: '3px', cursor: 'pointer' }}
                  />
                  <label htmlFor="installer-kvkk-check" style={{ fontSize: '0.76rem', color: '#cbd5e1', lineHeight: '1.4', cursor: 'pointer', userSelect: 'none' }}>
                    Kişisel verilerimin işlenmesine ilişkin <Link href="/yasal?tab=kvkk" target="_blank" style={{ color: '#d4af37', fontWeight: '600', textDecoration: 'underline' }}>KVKK Aydınlatma Metni'ni</Link> okudum ve kabul ediyorum.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={regLoading}
                  style={{
                    background: 'linear-gradient(135deg, #d4af37 0%, #b38e47 100%)',
                    color: '#000000',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '12px',
                    fontWeight: '800',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    marginTop: '6px',
                    boxShadow: '0 6px 18px rgba(212, 175, 55, 0.3)'
                  }}
                >
                  {regLoading ? 'Kaydediliyor...' : '👷 Usta Profilimi Oluştur'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .ustalar-app-header {
          background: rgba(15, 23, 42, 0.92);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(212, 175, 55, 0.25);
          position: sticky;
          top: 0;
          z-index: 100;
          padding: 10px 14px;
        }

        .ustalar-header-inner {
          max-width: 1280px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .ustalar-back-btn {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          flex-shrink: 0;
          transition: all 0.2s ease;
        }
        .ustalar-back-btn:active {
          transform: scale(0.92);
          background: rgba(255, 255, 255, 0.15);
        }

        .ustalar-header-reg-btn {
          font-size: 0.78rem;
          font-weight: 850;
          color: #000000;
          background: linear-gradient(135deg, #d4af37 0%, #fef08a 100%);
          border: none;
          padding: 8px 14px;
          border-radius: 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 5px;
          box-shadow: 0 4px 14px rgba(212, 175, 55, 0.35);
          transition: transform 0.15s ease;
          flex-shrink: 0;
        }
        .ustalar-header-reg-btn:active {
          transform: scale(0.95);
        }

        .btn-text-mobile {
          display: none;
        }
        .btn-text-desktop {
          display: inline;
        }

        /* Hero Section */
        .ustalar-hero-section {
          background: linear-gradient(180deg, rgba(30, 41, 59, 0.85) 0%, rgba(9, 13, 22, 1) 100%), url("/hero/hero_ceramics.jpg");
          background-size: cover;
          background-position: center center;
          padding: 36px 16px 26px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          text-align: center;
        }

        .ustalar-badge-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(212, 175, 55, 0.15);
          border: 1px solid rgba(212, 175, 55, 0.45);
          color: #fef08a;
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 0.72rem;
          font-weight: 850;
          margin-bottom: 12px;
          max-width: 100%;
          letter-spacing: 0.03em;
        }

        .ustalar-hero-title {
          font-size: clamp(1.35rem, 3.8vw, 2.4rem);
          font-weight: 900;
          color: #ffffff;
          margin: 0 0 10px 0;
          line-height: 1.25;
          letter-spacing: -0.015em;
        }

        .ustalar-hero-desc {
          font-size: 0.88rem;
          color: #cbd5e1;
          line-height: 1.55;
          margin: 0 0 18px 0;
          max-width: 680px;
          margin-left: auto;
          margin-right: auto;
        }

        /* Feature Pills */
        .ustalar-feature-pills {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 16px;
        }

        .feat-pill {
          font-size: 0.75rem;
          padding: 5px 11px;
          border-radius: 12px;
          font-weight: 750;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          white-space: nowrap;
        }
        .feat-green {
          background: rgba(16, 185, 129, 0.14);
          border: 1px solid rgba(16, 185, 129, 0.35);
          color: #34d399;
        }
        .feat-blue {
          background: rgba(59, 130, 246, 0.14);
          border: 1px solid rgba(59, 130, 246, 0.35);
          color: #60a5fa;
        }
        .feat-gold {
          background: rgba(212, 175, 55, 0.14);
          border: 1px solid rgba(212, 175, 55, 0.35);
          color: #fef08a;
        }

        /* Mobile City Chips */
        .mobile-city-chips {
          display: flex;
          align-items: center;
          gap: 8px;
          overflow-x: auto;
          padding: 4px 2px 14px 2px;
          margin-bottom: 16px;
          scrollbar-width: none;
          -ms-overflow-style: none;
          justify-content: center;
        }
        .mobile-city-chips::-webkit-scrollbar {
          display: none;
        }

        .city-chip-btn {
          background: rgba(30, 41, 59, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #cbd5e1;
          font-size: 0.76rem;
          font-weight: 750;
          padding: 7px 13px;
          border-radius: 20px;
          white-space: nowrap;
          cursor: pointer;
          flex-shrink: 0;
          transition: all 0.15s ease;
        }
        .city-chip-btn:active {
          transform: scale(0.95);
        }
        .city-chip-btn.active {
          background: linear-gradient(135deg, #d4af37 0%, #b38e47 100%);
          border-color: #d4af37;
          color: #000000;
          font-weight: 850;
          box-shadow: 0 4px 12px rgba(212, 175, 55, 0.35);
        }

        /* Filter Form */
        .ustalar-filter-form {
          background: rgba(15, 23, 42, 0.92);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(212, 175, 55, 0.3);
          border-radius: 18px;
          padding: 12px;
          display: grid;
          grid-template-columns: 2fr 1.3fr auto;
          gap: 10px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
          max-width: 750px;
          margin: 0 auto;
          align-items: center;
        }

        .ustalar-input-wrapper,
        .ustalar-select-wrapper {
          position: relative;
        }

        .ustalar-search-icon,
        .ustalar-pin-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          pointer-events: none;
        }

        .ustalar-text-input {
          width: 100%;
          padding: 11px 12px 11px 36px;
          border-radius: 12px;
          background: rgba(30, 41, 59, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #ffffff;
          font-size: 0.85rem;
          box-sizing: border-box;
          outline: none;
        }
        .ustalar-text-input:focus {
          border-color: #d4af37;
        }

        .ustalar-select-input {
          width: 100%;
          padding: 11px 12px 11px 36px;
          border-radius: 12px;
          background: rgba(30, 41, 59, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #ffffff;
          font-size: 0.84rem;
          box-sizing: border-box;
          outline: none;
          cursor: pointer;
        }

        .ustalar-submit-btn {
          background: linear-gradient(135deg, #d4af37 0%, #b38e47 100%);
          color: #000000;
          border: none;
          padding: 11px 22px;
          border-radius: 12px;
          font-weight: 850;
          font-size: 0.86rem;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(212, 175, 55, 0.35);
          white-space: nowrap;
          transition: transform 0.15s ease;
        }
        .ustalar-submit-btn:active {
          transform: scale(0.97);
        }

        .btn-wa-installer:active,
        .btn-call-installer:active {
          transform: scale(0.97);
        }

        /* Mobile Responsive Overrides */
        @media (max-width: 768px) {
          .ustalar-app-header {
            padding: 8px 10px;
          }

          .btn-text-desktop {
            display: none;
          }
          .btn-text-mobile {
            display: inline;
          }

          .ustalar-header-reg-btn {
            padding: 7px 11px;
            font-size: 0.74rem;
            border-radius: 8px;
          }

          .ustalar-hero-section {
            padding: 24px 12px 20px 12px;
          }

          .ustalar-feature-pills {
            justify-content: flex-start;
            overflow-x: auto;
            scrollbar-width: none;
            padding-bottom: 4px;
          }
          .ustalar-feature-pills::-webkit-scrollbar {
            display: none;
          }

          .mobile-city-chips {
            justify-content: flex-start;
            padding-left: 2px;
            padding-right: 2px;
          }

          .ustalar-filter-form {
            grid-template-columns: 1fr !important;
            gap: 8px !important;
            padding: 10px !important;
            border-radius: 16px !important;
          }

          .ustalar-submit-btn {
            width: 100% !important;
            padding: 12px !important;
          }

          :global(.installers-grid) {
            grid-template-columns: 1fr !important;
            gap: 14px !important;
          }

          :global(.installer-card-actions) {
            grid-template-columns: 1fr 1fr !important;
            gap: 8px !important;
          }
        }
      `}</style>
    </div>
  );
}
