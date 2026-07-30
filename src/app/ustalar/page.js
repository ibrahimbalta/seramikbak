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
  Sparkles,
  ShieldCheck,
  Loader2,
  Building2,
  ChevronRight,
  ArrowRight
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
    <div className="min-h-screen bg-[#090d16] text-slate-100 font-sans">
      {/* HEADER BAR */}
      <header className="bg-slate-900/90 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 sm:py-4 flex flex-wrap xs:flex-nowrap items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2.5 shrink-0 no-underline">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-black flex items-center justify-center font-black text-sm sm:text-base shadow-md shadow-amber-400/30">
              SB
            </div>
            <span className="text-base sm:text-xl font-black text-white tracking-tight">
              SeramikBak <span className="text-amber-400 text-xs sm:text-sm ml-1 font-bold">USTA REHBERİ</span>
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3 w-full xs:w-auto justify-end">
            <button
              onClick={() => setShowRegisterModal(true)}
              className="w-full xs:w-auto text-xs sm:text-sm font-extrabold text-black bg-gradient-to-r from-amber-400 to-yellow-300 border-0 py-2 px-3.5 sm:px-4 rounded-xl cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-amber-400/30 active:scale-95 transition-transform"
            >
              <Plus size={15} className="shrink-0" />
              <span>Usta Olarak Kaydol (Ücretsiz)</span>
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="bg-gradient-to-b from-slate-800/80 to-slate-950 border-b border-white/10 px-4 sm:px-6 py-8 sm:py-14 text-center relative overflow-hidden"
        style={{
          backgroundImage: 'linear-gradient(180deg, rgba(30, 41, 59, 0.85) 0%, rgba(9, 13, 22, 1) 100%), url("/hero/hero_ceramics.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center center'
        }}
      >
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 bg-amber-400/15 border border-amber-400/40 text-amber-200 px-3.5 py-1.5 rounded-full text-[0.72rem] sm:text-xs font-extrabold mb-3 sm:mb-4 max-w-full">
            <ShieldCheck size={14} className="shrink-0" />
            <span className="truncate">81 İLDE ONAYLI SERAMİK USTA VE UYGULAMA DİZİNİ</span>
          </div>

          <h1 className="text-xl sm:text-3xl md:text-4xl font-black text-white mb-3 sm:mb-4 leading-tight">
            Banyonuz ve Şantiyeniz İçin Bölgenizdeki Yetkili Seramik Ustalarını Bulun
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-slate-300 leading-relaxed mb-6 max-w-2xl mx-auto">
            Seramiği aldınız ancak kime döşeteceğinizi bilmiyor musunuz? Lazer terazili tecrübeli seramik ustalarıyla tek tıkla WhatsApp veya telefonla görüşün.
          </p>

          {/* Search & Filter Bar */}
          <form onSubmit={handleSearchSubmit} className="bg-slate-900/90 backdrop-blur-md border border-amber-400/30 rounded-2xl p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 shadow-2xl max-w-3xl mx-auto">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Usta adı, ilçe veya ebat (60x120)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800/80 border border-white/10 text-white text-xs sm:text-sm placeholder-slate-400 outline-none focus:border-amber-400 transition-colors box-border"
              />
            </div>

            <div className="relative">
              <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800/80 border border-white/10 text-white text-xs sm:text-sm outline-none focus:border-amber-400 transition-colors box-border"
              >
                <option value="ALL">Tüm Şehirler (81 İl)</option>
                {TURKEY_CITIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-extrabold text-xs sm:text-sm py-2.5 px-5 rounded-xl shadow-md shadow-amber-400/30 border-0 cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span>Ustaları Ara</span>
            </button>
          </form>
        </div>
      </section>

      {/* INSTALLERS GRID */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-0 mb-6">
          <div>
            <h2 className="text-base sm:text-xl font-extrabold text-white mb-0.5">
              {selectedCity !== 'ALL' ? `${selectedCity} Seramik Ustaları` : 'Onaylı Seramik Ustaları'}
            </h2>
            <span className="text-xs text-slate-400">
              Toplam {installers.length} onaylı usta ve uygulama ekibi listeleniyor
            </span>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 sm:py-24 text-slate-400">
            <Loader2 size={32} className="animate-spin mx-auto mb-3 text-amber-400" />
            <span className="text-xs sm:text-sm">Ustalar yükleniyor...</span>
          </div>
        ) : installers.length === 0 ? (
          <div className="bg-slate-800/40 border border-dashed border-white/15 rounded-2xl p-8 sm:p-12 text-center">
            <Wrench size={40} className="text-slate-500 mx-auto mb-4" />
            <h3 className="text-sm sm:text-base font-extrabold text-white mb-2">
              {selectedCity !== 'ALL' ? `${selectedCity} Şehrinde Henüz Kayıtlı Usta Bulunmuyor` : 'Aramanızla Eşleşen Usta Bulunamadı'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mb-5">
              Bu şehirde seramik ustası mısınız? Ücretsiz profil oluşturarak seramik bakan binlerce müşteriye hemen ulaşabilirsiniz.
            </p>
            <button
              onClick={() => { setShowRegisterModal(true); if (selectedCity !== 'ALL') setRegCity(selectedCity); }}
              className="bg-amber-400 text-black border-0 py-2.5 px-5 rounded-xl font-extrabold cursor-pointer text-xs sm:text-sm shadow-md active:scale-95 transition-transform"
            >
              Bu Şehirde Usta Olarak Kaydol
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {installers.map(inst => {
              const waText = encodeURIComponent(
                `Merhaba ${inst.name}, SeramikBak platformundaki Usta Rehberi profiliniz üzerinden ulaşıyorum. ` +
                `${inst.city} bölgesinde seramik kaplama / yenileme işimiz için bilgi ve teklif almak istiyoruz.`
              );
              const waLink = `https://wa.me/${inst.phone.replace(/[^\d]/g, '')}?text=${waText}`;

              return (
                <div key={inst.id} className="bg-slate-800/60 backdrop-blur-md border border-white/10 rounded-2xl p-4 sm:p-6 flex flex-col justify-between gap-4 shadow-xl hover:border-white/20 transition-all">
                  <div>
                    {/* Header */}
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="text-base sm:text-lg font-black text-white m-0">{inst.name}</h3>
                          {inst.verified && (
                            <span title="Onaylı Seramik Ustası" className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 px-2 py-0.5 rounded-full text-[0.65rem] font-extrabold inline-flex items-center gap-1">
                              <ShieldCheck size={12} className="shrink-0" />
                              Onaylı
                            </span>
                          )}
                        </div>
                        {inst.companyName && (
                          <div className="text-xs text-slate-300 font-semibold">{inst.companyName}</div>
                        )}
                      </div>

                      <div className="flex items-center gap-1 bg-amber-400/15 border border-amber-400/30 px-2 py-1 rounded-lg shrink-0">
                        <Star size={13} className="text-amber-400 fill-amber-400 shrink-0" />
                        <span className="text-xs font-black text-yellow-200">{inst.rating || '5.0'}</span>
                        <span className="text-[0.68rem] text-slate-400">({inst.reviewCount || 12})</span>
                      </div>
                    </div>

                    {/* Location & Experience Badges */}
                    <div className="flex flex-wrap gap-2 mb-3.5">
                      <span className="text-xs bg-white/5 text-slate-300 px-2.5 py-1 rounded-lg flex items-center gap-1 border border-white/5">
                        <MapPin size={12} className="text-red-400 shrink-0" />
                        <span className="truncate">{inst.city} {inst.district ? `/ ${inst.district}` : ''}</span>
                      </span>

                      <span className="text-xs bg-amber-400/10 text-amber-400 px-2.5 py-1 rounded-lg flex items-center gap-1 border border-amber-400/20 font-bold">
                        <Award size={12} className="shrink-0" />
                        <span>{inst.experienceYears} Yıl Usta Tecrübesi</span>
                      </span>
                    </div>

                    {/* Specialties */}
                    <div className="mb-3.5">
                      <span className="text-[0.68rem] text-slate-400 font-bold block mb-1.5">UZMANLIK ALANLARI:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {inst.specialties.split(',').map((spec, idx) => (
                          <span key={idx} className="text-[0.7rem] bg-slate-700/60 border border-white/5 text-slate-200 px-2 py-0.5 rounded-md">
                            {spec.trim()}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bio Notes */}
                    {inst.notes && (
                      <p className="text-xs text-slate-400 leading-relaxed m-0 bg-slate-900/50 p-2.5 rounded-xl border border-white/5 italic">
                        "{inst.notes}"
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white no-underline py-2.5 px-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95 transition-transform"
                    >
                      <MessageSquare size={15} className="shrink-0" />
                      <span className="truncate">WhatsApp Teklif</span>
                    </a>

                    <a
                      href={`tel:${inst.phone.replace(/[^\d+]/g, '')}`}
                      className="bg-white/10 border border-white/15 text-white no-underline py-2.5 px-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 hover:bg-white/15 transition-colors"
                    >
                      <Phone size={15} className="text-amber-400 shrink-0" />
                      <span className="truncate">Ustayla Görüş</span>
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
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-[9999] p-3 sm:p-5 overflow-y-auto" onClick={() => setShowRegisterModal(false)}>
          <div className="bg-slate-900 border border-amber-400/40 rounded-2xl sm:rounded-3xl max-w-lg w-full p-4 sm:p-7 relative shadow-2xl my-auto max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowRegisterModal(false)}
              className="absolute right-4 top-4 bg-white/10 border-0 text-slate-400 w-8 h-8 rounded-full cursor-pointer flex items-center justify-center hover:text-white"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black shrink-0 shadow-md shadow-amber-400/30">
                <Wrench size={22} />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white m-0">Usta Kayıt Formu</h3>
                <span className="text-xs text-amber-400 font-bold">81 İlde Seramik Alıcılarına Ulaşın</span>
              </div>
            </div>

            {regSuccess ? (
              <div className="bg-emerald-500/15 border border-emerald-500/40 rounded-2xl p-5 text-center">
                <CheckCircle2 size={40} className="text-emerald-400 mx-auto mb-2" />
                <h4 className="text-base text-white font-extrabold mb-1">Başvurunuz Alındı!</h4>
                <p className="text-xs sm:text-sm text-slate-300 mb-4">{regSuccess}</p>
                <button
                  onClick={() => { setShowRegisterModal(false); setRegSuccess(''); }}
                  className="bg-emerald-500 text-white border-0 py-2.5 px-5 rounded-xl font-extrabold cursor-pointer text-xs sm:text-sm"
                >
                  Tamam
                </button>
              </div>
            ) : (
              <form onSubmit={handleRegisterInstaller} className="flex flex-col gap-3.5">
                {regError && (
                  <div className="bg-red-500/15 border border-red-500/40 text-red-400 p-2.5 rounded-xl text-xs">
                    ⚠️ {regError}
                  </div>
                )}

                <div>
                  <label className="text-xs text-slate-300 block mb-1 font-bold">Adınız Soyadınız *</label>
                  <input
                    type="text"
                    placeholder="Örn: Mehmet Usta"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-white/15 text-white text-xs sm:text-sm outline-none focus:border-amber-400 transition-colors box-border"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-300 block mb-1 font-bold">Firma / Ekip Adı</label>
                    <input
                      type="text"
                      placeholder="Örn: Yıldız Yapı Dek."
                      value={regCompany}
                      onChange={(e) => setRegCompany(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-800 border border-white/15 text-white text-xs sm:text-sm outline-none focus:border-amber-400 transition-colors box-border"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 block mb-1 font-bold">Telefon Numaranız *</label>
                    <input
                      type="tel"
                      placeholder="Örn: 0532 123 45 67"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      required
                      className="w-full p-2.5 rounded-xl bg-slate-800 border border-white/15 text-white text-xs sm:text-sm outline-none focus:border-amber-400 transition-colors box-border"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-slate-300 block mb-1 font-bold">Hizmet Şehri *</label>
                    <select
                      value={regCity}
                      onChange={(e) => setRegCity(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-800 border border-white/15 text-white text-xs sm:text-sm outline-none focus:border-amber-400 transition-colors box-border"
                    >
                      {TURKEY_CITIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 block mb-1 font-bold">Hizmet İlçeleri</label>
                    <input
                      type="text"
                      placeholder="Örn: Kadıköy"
                      value={regDistrict}
                      onChange={(e) => setRegDistrict(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-800 border border-white/15 text-white text-xs sm:text-sm outline-none focus:border-amber-400 transition-colors box-border"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 block mb-1 font-bold">Tecrübe Yılı</label>
                    <input
                      type="number"
                      placeholder="15"
                      value={regExpYears}
                      onChange={(e) => setRegExpYears(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-800 border border-white/15 text-white text-xs sm:text-sm outline-none focus:border-amber-400 transition-colors box-border"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1 font-bold">Uzmanlık Alanlarınız (Virgülle Ayırın)</label>
                  <input
                    type="text"
                    placeholder="Örn: 60x120 Karo, Banyo Seramiği, Su İzolasyonu"
                    value={regSpecialties}
                    onChange={(e) => setRegSpecialties(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-white/15 text-white text-xs sm:text-sm outline-none focus:border-amber-400 transition-colors box-border"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1 font-bold">Hizmet Notunuz / Tanıtımınız</label>
                  <textarea
                    rows={2}
                    placeholder="Ekip mevcudunuz, lazerli terazi tecrübeniz veya iş teslim garantiniz..."
                    value={regNotes}
                    onChange={(e) => setRegNotes(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-white/15 text-white text-xs sm:text-sm outline-none focus:border-amber-400 transition-colors box-border"
                  />
                </div>

                <button
                  type="submit"
                  disabled={regLoading}
                  className="bg-gradient-to-r from-amber-400 to-amber-500 text-black border-0 p-3 rounded-xl font-extrabold text-xs sm:text-sm cursor-pointer mt-1 shadow-lg shadow-amber-400/30 active:scale-95 transition-transform"
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
