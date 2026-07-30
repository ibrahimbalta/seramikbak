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
  Upload
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
      {/* HEADER BAR */}
      <header style={{
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #d4af37 0%, #b38e47 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '900',
              color: '#000',
              fontSize: '1.1rem'
            }}>SB</div>
            <span style={{ fontSize: '1.1rem', fontWeight: '900', color: '#ffffff' }}>
              SeramikBak <span style={{ color: '#d4af37', fontSize: '0.8rem' }}>USTA REHBERİ</span>
            </span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setShowRegisterModal(true)}
              style={{
                fontSize: '0.8rem',
                fontWeight: '800',
                color: '#000000',
                background: 'linear-gradient(135deg, #d4af37 0%, #fef08a 100%)',
                border: 'none',
                padding: '9px 16px',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 14px rgba(212, 175, 55, 0.35)',
                transition: 'transform 0.2s ease'
              }}
            >
              <Plus size={15} />
              <span>Usta Olarak Kaydol (Ücretsiz)</span>
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section style={{
        background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.8) 0%, rgba(9, 13, 22, 1) 100%), url("/hero/hero_ceramics.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        padding: '40px 16px 30px 16px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '840px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(212, 175, 55, 0.15)',
            border: '1px solid rgba(212, 175, 55, 0.4)',
            color: '#fef08a',
            padding: '6px 14px',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: '800',
            marginBottom: '14px',
            maxWidth: '100%'
          }}>
            <ShieldCheck size={14} style={{ flexShrink: 0 }} />
            <span>81 İLDE ONAYLI SERAMİK USTA VE UYGULAMA DİZİNİ</span>
          </div>

          <h1 style={{ fontSize: 'clamp(1.4rem, 4vw, 2.4rem)', fontWeight: '900', color: '#ffffff', margin: '0 0 14px 0', lineHeight: '1.25' }}>
            Banyonuz ve Şantiyeniz İçin Bölgenizdeki Yetkili Seramik Ustalarını Bulun
          </h1>

          <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: '1.6', margin: '0 0 24px 0' }}>
            Seramiği aldınız ancak kime döşeteceğinizi bilmiyor musunuz? Lazer terazili ve garanti sertifikalı seramik ustalarıyla canlı projelerini görün, hazır sözleşmeyle güvenle çalışın.
          </p>

          {/* Feature Highlights Badges */}
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '24px' }}>
            <span style={{ fontSize: '0.78rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.35)', color: '#34d399', padding: '6px 12px', borderRadius: '12px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <CheckSquare size={14} />
              Terazi & Derz Uyum İlkeli Uygulama
            </span>
            <span style={{ fontSize: '0.78rem', background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.35)', color: '#60a5fa', padding: '6px 12px', borderRadius: '12px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Camera size={14} />
              Öncesi / Sonrası Canlı Şantiye Portfolyosu
            </span>
            <span style={{ fontSize: '0.78rem', background: 'rgba(212, 175, 55, 0.15)', border: '1px solid rgba(212, 175, 55, 0.35)', color: '#fef08a', padding: '6px 12px', borderRadius: '12px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={14} />
              Hazır Standart Uygulama Sözleşmesi
            </span>
          </div>

          {/* Search & Filter Bar */}
          <form onSubmit={handleSearchSubmit} style={{
            background: 'rgba(15, 23, 42, 0.9)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            borderRadius: '20px',
            padding: '12px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '10px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            maxWidth: '750px',
            margin: '0 auto'
          }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="text"
                placeholder="Usta adı, ilçe veya ebat (60x120)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  borderRadius: '12px',
                  background: 'rgba(30, 41, 59, 0.8)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff',
                  fontSize: '0.85rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ position: 'relative' }}>
              <MapPin size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  borderRadius: '12px',
                  background: 'rgba(30, 41, 59, 0.8)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff',
                  fontSize: '0.85rem',
                  boxSizing: 'border-box'
                }}
              >
                <option value="ALL">Tüm Şehirler (81 İl)</option>
                {TURKEY_CITIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              style={{
                background: 'linear-gradient(135deg, #d4af37 0%, #b38e47 100%)',
                color: '#000000',
                fontWeight: '800',
                fontSize: '0.88rem',
                border: 'none',
                borderRadius: '12px',
                padding: '10px 20px',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(212, 175, 55, 0.3)',
                width: '100%'
              }}
            >
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
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
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

                  {/* Compact Bottom Actions */}
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '6px', marginTop: '4px' }}>
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        background: 'linear-gradient(135deg, #25d366 0%, #059669 100%)',
                        color: '#ffffff',
                        textDecoration: 'none',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        fontWeight: '800',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '5px',
                        boxShadow: '0 3px 10px rgba(37, 211, 102, 0.2)',
                        textAlign: 'center'
                      }}
                    >
                      <MessageSquare size={13} />
                      <span>WhatsApp Teklif</span>
                    </a>

                    <a
                      href={`tel:${inst.phone.replace(/[^\d+]/g, '')}`}
                      style={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#ffffff',
                        textDecoration: 'none',
                        padding: '8px',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        fontWeight: '800',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        textAlign: 'center'
                      }}
                    >
                      <Phone size={13} style={{ color: '#d4af37' }} />
                      <span>Ara</span>
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
    </div>
  );
}
