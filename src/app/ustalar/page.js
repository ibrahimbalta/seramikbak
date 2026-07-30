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
  Loader2
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
  const [regNotes, setRegNotes] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [regSuccess, setRegSuccess] = useState('');
  const [regError, setRegError] = useState('');

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
            Seramiği aldınız ancak kime döşeteceğinizi bilmiyor musunuz? Lazer terazili tecrübeli seramik ustalarıyla tek tıkla WhatsApp veya telefonla görüşün.
          </p>

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
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px'
          }}>
            {installers.map(inst => {
              const waText = encodeURIComponent(
                `Merhaba ${inst.name}, SeramikBak platformundaki Usta Rehberi profiliniz üzerinden ulaşıyorum. ` +
                `${inst.city} bölgesinde seramik kaplama / yenileme işimiz için bilgi ve teklif almak istiyoruz.`
              );
              const waLink = `https://wa.me/${inst.phone.replace(/[^\d]/g, '')}?text=${waText}`;

              return (
                <div key={inst.id} style={{
                  background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '20px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '16px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                  transition: 'transform 0.2s ease, border-color 0.2s ease'
                }}>
                  <div>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                          <h3 style={{ fontSize: '1.1rem', fontWeight: '900', color: '#ffffff', margin: 0 }}>{inst.name}</h3>
                          {inst.verified && (
                            <span title="Onaylı Seramik Ustası" style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#10b981', padding: '2px 8px', borderRadius: '12px', fontSize: '0.68rem', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <ShieldCheck size={12} />
                              Onaylı
                            </span>
                          )}
                        </div>
                        {inst.companyName && (
                          <div style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: '600' }}>{inst.companyName}</div>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(212, 175, 55, 0.15)', border: '1px solid rgba(212, 175, 55, 0.3)', padding: '4px 8px', borderRadius: '8px' }}>
                        <Star size={13} style={{ color: '#d4af37', fill: '#d4af37' }} />
                        <span style={{ fontSize: '0.8rem', fontWeight: '900', color: '#fef08a' }}>{inst.rating || '5.0'}</span>
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>({inst.reviewCount || 12})</span>
                      </div>
                    </div>

                    {/* Location & Experience Badges */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
                      <span style={{ fontSize: '0.75rem', background: 'rgba(255, 255, 255, 0.06)', color: '#cbd5e1', padding: '4px 10px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={12} style={{ color: '#ef4444' }} />
                        {inst.city} {inst.district ? `/ ${inst.district}` : ''}
                      </span>

                      <span style={{ fontSize: '0.75rem', background: 'rgba(212, 175, 55, 0.1)', color: '#d4af37', padding: '4px 10px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '700' }}>
                        <Award size={12} />
                        {inst.experienceYears} Yıl Usta Tecrübesi
                      </span>
                    </div>

                    {/* Specialties */}
                    <div style={{ marginBottom: '14px' }}>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700', display: 'block', marginBottom: '6px' }}>UZMANLIK ALANLARI:</span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {inst.specialties.split(',').map((spec, idx) => (
                          <span key={idx} style={{ fontSize: '0.72rem', background: 'rgba(51, 65, 85, 0.6)', border: '1px solid rgba(255,255,255,0.08)', color: '#e2e8f0', padding: '3px 8px', borderRadius: '6px' }}>
                            {spec.trim()}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bio Notes */}
                    {inst.notes && (
                      <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: '1.5', margin: 0, background: 'rgba(0,0,0,0.2)', padding: '10px 12px', borderRadius: '10px' }}>
                        "{inst.notes}"
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px', marginTop: '12px' }}>
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        background: 'linear-gradient(135deg, #25d366 0%, #059669 100%)',
                        color: '#ffffff',
                        textDecoration: 'none',
                        padding: '10px',
                        borderRadius: '10px',
                        fontSize: '0.78rem',
                        fontWeight: '800',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        boxShadow: '0 4px 12px rgba(37, 211, 102, 0.25)',
                        textAlign: 'center'
                      }}
                    >
                      <MessageSquare size={15} />
                      <span>WhatsApp Teklif</span>
                    </a>

                    <a
                      href={`tel:${inst.phone.replace(/[^\d+]/g, '')}`}
                      style={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#ffffff',
                        textDecoration: 'none',
                        padding: '10px',
                        borderRadius: '10px',
                        fontSize: '0.78rem',
                        fontWeight: '800',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        textAlign: 'center'
                      }}
                    >
                      <Phone size={15} style={{ color: '#d4af37' }} />
                      <span>Ustayla Görüş</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

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
            maxWidth: '520px',
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
                    <label style={{ fontSize: '0.76rem', color: '#cbd5e1', display: 'block', marginBottom: '4px', fontWeight: '700' }}>Tecrübe Yılı</label>
                    <input
                      type="number"
                      placeholder="15"
                      value={regExpYears}
                      onChange={(e) => setRegExpYears(e.target.value)}
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
