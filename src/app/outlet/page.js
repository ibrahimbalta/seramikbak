'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Search,
  Filter,
  MapPin,
  MessageSquare,
  Building2,
  ExternalLink,
  ChevronLeft,
  Tag,
  ShieldCheck,
  Send,
  Phone,
  CheckCircle2,
  X,
  ArrowRight,
  Wrench
} from 'lucide-react';
import { slugify } from '@/lib/slugify';

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

export default function OutletMarketplacePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Contact Modal State
  const [selectedItemForContact, setSelectedItemForContact] = useState(null);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactNotes, setContactNotes] = useState('');
  const [contactLoading, setContactLoading] = useState(false);
  const [contactSuccess, setContactSuccess] = useState('');
  const [contactError, setContactError] = useState('');

  // WhatsApp Alert Subscription Modal State
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertName, setAlertName] = useState('');
  const [alertPhone, setAlertPhone] = useState('');
  const [alertCity, setAlertCity] = useState('ALL');
  const [alertCategory, setAlertCategory] = useState('ALL');
  const [alertLoading, setAlertLoading] = useState(false);
  const [alertSuccess, setAlertSuccess] = useState('');
  const [alertError, setAlertError] = useState('');

  const handleSubscribeAlert = async (e) => {
    e.preventDefault();
    setAlertError('');
    setAlertSuccess('');
    setAlertLoading(true);

    try {
      const res = await fetch('/api/outlet/subscribe-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: alertName,
          phone: alertPhone,
          city: alertCity,
          category: alertCategory
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAlertSuccess(data.message || 'WhatsApp Fırsat Bildirimi kuruldu!');
        setAlertPhone('');
        setAlertName('');
      } else {
        setAlertError(data.error || 'Abonelik oluşturulamadı.');
      }
    } catch (err) {
      setAlertError('Sunucu bağlantı hatası.');
    } finally {
      setAlertLoading(false);
    }
  };

  const fetchOutletItems = async () => {
    setLoading(true);
    try {
      let url = '/api/outlet?limit=100';
      if (selectedCity && selectedCity !== 'ALL') url += `&city=${encodeURIComponent(selectedCity)}`;
      if (selectedCategory && selectedCategory !== 'ALL') url += `&category=${encodeURIComponent(selectedCategory)}`;
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setItems(data.data || []);
        }
      }
    } catch (err) {
      console.error('Failed to fetch outlet items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutletItems();
  }, [selectedCity, selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOutletItems();
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItemForContact || !contactName || !contactPhone || !contactEmail) {
      setContactError('Lütfen ad, telefon ve e-posta alanlarını doldurun.');
      return;
    }
    setContactLoading(true);
    setContactError('');
    setContactSuccess('');

    try {
      const res = await fetch('/api/leads/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedItemForContact.productId || selectedItemForContact.id,
          dealerId: selectedItemForContact.dealerId,
          clientName: contactName,
          clientPhone: contactPhone,
          clientEmail: contactEmail,
          notes: `[Outlet / Proje Fazlası Talebi] Ürün: ${selectedItemForContact.title} (${selectedItemForContact.quantityM2} m², ₺${selectedItemForContact.unitPrice}/m²). ${contactNotes}`
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setContactSuccess('Talebiniz ilgili bayiye iletildi! Bayimiz en kısa sürede sizinle iletişime geçecektir.');
        setContactName('');
        setContactPhone('');
        setContactEmail('');
        setContactNotes('');
      } else {
        setContactError(data.error || 'Talep gönderilemedi.');
      }
    } catch (err) {
      console.error(err);
      setContactError('Sistemsel hata oluştu.');
    } finally {
      setContactLoading(false);
    }
  };

  const getTextureFallback = (item) => {
    const str = `${item?.dimensions || ''} ${item?.colorFinish || ''} ${item?.title || ''}`.toLowerCase();
    if (str.includes('ahşap') || str.includes('wood') || str.includes('oak')) return '/textures/natural_oak.jpg';
    if (str.includes('beton') || str.includes('concrete') || str.includes('grey') || str.includes('gri')) return '/textures/concrete_light_grey.jpg';
    if (str.includes('traver') || str.includes('bej') || str.includes('beige')) return '/textures/travertino_classico.jpg';
    return '/textures/calacatta_gold.jpg';
  };

  const categoryLabelMap = {
    PROJE_FAZLASI: 'Proje Fazlası (Şantiye Artığı)',
    SERI_SONU: 'Seri Sonu (Kapatıyoruz)',
    IKINCI_KALITE: '2. Kalite Palet',
    OUTLET: 'Depo Outlet'
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-white font-sans">
      {/* Header Navigation */}
      <header className="bg-slate-900/90 backdrop-blur-xl border-b border-red-500/25 sticky top-0 z-[90]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 sm:py-4 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2.5 shrink-0 no-underline">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 text-white flex items-center justify-center font-black text-sm sm:text-base shadow-md shadow-red-500/30">
              SB
            </div>
            <span className="text-base sm:text-xl font-black text-white tracking-tight">
              SeramikBak <span className="text-red-500 text-xs sm:text-sm ml-1 font-bold">OUTLET</span>
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={() => { setShowAlertModal(true); setAlertCity(selectedCity || 'ALL'); }}
              className="text-[0.75rem] sm:text-xs font-extrabold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 border-0 py-2 px-3 sm:px-4 rounded-xl cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/30 active:scale-95 transition-transform flex-1 sm:flex-initial"
            >
              <MessageSquare size={14} className="shrink-0" />
              <span>WhatsApp Fırsat Alarmı</span>
            </button>

            <Link href="/bayi" className="text-[0.75rem] sm:text-xs font-bold text-amber-400 no-underline flex items-center justify-center gap-1.5 bg-amber-400/10 border border-amber-400/30 py-2 px-3 sm:px-3.5 rounded-xl hover:bg-amber-400/20 transition-colors shrink-0">
              <Building2 size={14} className="shrink-0" />
              <span className="hidden xs:inline">Bayi Girişi & İlan Ver</span>
              <span className="xs:hidden">Bayi Girişi</span>
            </Link>
          </div>
        </div>
      </header>

      {/* HERO BANNER */}
      <section className="bg-gradient-to-b from-slate-800/80 to-slate-950 border-b border-white/10 px-4 sm:px-6 py-8 sm:py-14 text-center relative overflow-hidden"
        style={{
          backgroundImage: 'linear-gradient(180deg, rgba(30, 41, 59, 0.85) 0%, rgba(9, 13, 22, 1) 100%), url("/hero/hero_ceramics.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center center'
        }}
      >
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 bg-red-500/20 border border-red-500/40 text-red-400 px-3 sm:px-4 py-1.5 rounded-full text-[0.72rem] sm:text-xs font-extrabold mb-3 sm:mb-4 max-w-full">
            <Sparkles size={14} className="shrink-0" />
            <span className="truncate">BAYİLERDEN CANLI OUTLET & ŞANTİYE FAZLASI BORSASI</span>
          </div>

          <h1 className="text-xl sm:text-3xl md:text-4xl font-black text-white mb-3 sm:mb-4 leading-tight">
            Depo Seri Sonları & Proje Fazlası Paletlerde %60'a Varan İndirimler
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-slate-300 leading-relaxed mb-5 max-w-2xl mx-auto">
            Bayilerin elinde kalan son 30 m², 50 m² şantiye artığı ve 2. kalite stoklar uygun fiyata satışta!
            Kiralık evinizi, balkonunuzu veya ufak alan tadilatınızı bütçe dostu paletlerle tamamlayın.
          </p>

          <div className="mb-6 sm:mb-8">
            <button
              type="button"
              onClick={() => { setShowAlertModal(true); setAlertCity(selectedCity || 'ALL'); }}
              className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-extrabold text-xs sm:text-sm py-3 px-5 sm:px-6 rounded-xl border-0 cursor-pointer inline-flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/35 active:scale-95 transition-transform"
            >
              <MessageSquare size={18} className="shrink-0" />
              <span>{selectedCity !== 'ALL' ? `${selectedCity} İçin WhatsApp Fırsat Alarmı Kur 🔔` : 'WhatsApp Fırsat Alarmı Kur (Tüm İller) 🔔'}</span>
            </button>
          </div>

          {/* Search & Filter Bar */}
          <form onSubmit={handleSearchSubmit} className="bg-slate-900/90 backdrop-blur-md border border-red-500/30 rounded-2xl p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 shadow-2xl">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Desen, ebat veya ürün adı ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800/80 border border-white/10 text-white text-xs sm:text-sm placeholder-slate-400 outline-none focus:border-red-500 transition-colors box-border"
              />
            </div>

            <div>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-800/80 border border-white/10 text-white text-xs sm:text-sm outline-none focus:border-red-500 transition-colors box-border"
              >
                <option value="ALL">Tüm Şehirler</option>
                {TURKEY_CITIES.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-800/80 border border-white/10 text-white text-xs sm:text-sm outline-none focus:border-red-500 transition-colors box-border"
              >
                <option value="ALL">Tüm Kategoriler</option>
                <option value="PROJE_FAZLASI">Proje Fazlası (Şantiye Artığı)</option>
                <option value="SERI_SONU">Seri Sonu (Kapatıyoruz)</option>
                <option value="IKINCI_KALITE">2. Kalite Paletler</option>
                <option value="OUTLET">Depo Outlet</option>
              </select>
            </div>

            <button
              type="submit"
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0 py-2.5 px-5 rounded-xl font-extrabold text-xs sm:text-sm cursor-pointer shadow-md shadow-red-500/40 transition-all flex items-center justify-center gap-2"
            >
              <span>Fırsatları Filtrele</span>
            </button>
          </form>
        </div>
      </section>

      {/* MARKETPLACE LISTINGS GRID */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* CRAFTSMAN CALLOUT BANNER */}
        <div className="bg-gradient-to-r from-amber-500/15 to-amber-700/20 border border-amber-500/35 rounded-2xl p-4 sm:p-5 mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black shrink-0 shadow-md">
              <Wrench size={20} />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold text-white mb-0.5 leading-snug">
                Bu Seramikleri Döşetecek Tecrübeli Usta mı Arıyorsunuz?
              </h4>
              <p className="text-[0.76rem] sm:text-xs text-slate-300 leading-normal">
                81 ilde lazer terazili ve sertifikalı onaylı seramik ustalarıyla tek tıkla WhatsApp üzerinden iletişim kurun.
              </p>
            </div>
          </div>

          <Link href="/ustalar" className="w-full sm:w-auto shrink-0 bg-gradient-to-r from-amber-400 to-yellow-300 text-black no-underline py-2.5 px-4 rounded-xl font-extrabold text-xs sm:text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-transform">
            <span>Bölgenizdeki Ustaları Görün</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-0 mb-6">
          <div>
            <h2 className="text-base sm:text-xl font-extrabold text-white mb-0.5">
              Depolarda Teslimata Hazır Fırsat Ürünleri
            </h2>
            <span className="text-xs text-slate-400">
              Toplam {items.length} adet kelepir seramik paleti bulundu
            </span>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 sm:py-24 text-slate-400">
            <Sparkles size={32} className="animate-spin mx-auto mb-3 text-red-500" />
            <span className="text-xs sm:text-sm">Fırsat paletleri yükleniyor...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 sm:py-16 px-4 bg-slate-800/40 rounded-2xl border border-dashed border-white/10">
            <Tag size={40} className="text-red-500 mx-auto mb-4" />
            <h3 className="text-sm sm:text-base font-extrabold text-white mb-2">Aradığınız Kriterlerde Outlet Ürünü Bulunamadı</h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
              Filtreleri sıfırlayarak tüm bayilerin proje fazlası stoklarını görüntüleyebilirsiniz.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {items.map((item) => {
              const d = item.dealer;
              const prod = item.product;
              const discountPercent = item.originalPrice && item.originalPrice > item.unitPrice
                ? Math.round(((item.originalPrice - item.unitPrice) / item.originalPrice) * 100)
                : null;
              const totalPalletValue = Math.round(item.unitPrice * item.quantityM2);

              return (
                <div key={item.id} className="bg-slate-800/60 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden flex flex-col shadow-xl hover:border-white/20 transition-all">
                  {/* Image Header */}
                  <div className="relative h-44 sm:h-52 w-full overflow-hidden shrink-0">
                    <img
                      src={item.imageUrl || (prod ? prod.imageUrl || getTextureFallback(item) : getTextureFallback(item))}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = getTextureFallback(item);
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-transparent to-transparent" />

                    {/* Top Left Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5 max-w-[70%]">
                      <span className="bg-red-500 text-white text-[0.65rem] sm:text-xs font-extrabold px-2.5 py-1 rounded-xl shadow-md shadow-red-500/40 w-fit truncate">
                        {item.badgeTag || 'Proje Fazlası'}
                      </span>
                      <span className="bg-slate-900/85 text-slate-300 text-[0.6rem] sm:text-[0.65rem] font-bold px-2 py-0.5 rounded-lg border border-white/15 backdrop-blur-sm w-fit truncate">
                        🏷️ {categoryLabelMap[item.category] || item.category}
                      </span>
                    </div>

                    {/* Discount Pill */}
                    {discountPercent && (
                      <div className="absolute top-3 right-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-black text-[0.7rem] sm:text-xs px-2.5 py-1 rounded-xl shadow-md shadow-emerald-500/40">
                        %{discountPercent} İNDİRİM
                      </div>
                    )}

                    {/* Stock m² Pill */}
                    <div className="absolute bottom-3 left-3">
                      <span className="bg-amber-400 text-black font-black text-[0.68rem] sm:text-xs px-2.5 py-1 rounded-lg shadow-sm">
                        📦 Mevcut Stok: {item.quantityM2} m²
                      </span>
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col gap-3">
                    {/* Dealer info banner */}
                    {d && (
                      <div className="flex items-center justify-between border-b border-white/10 pb-2.5 gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Building2 size={14} className="text-amber-400 shrink-0" />
                          <span className="text-xs font-extrabold text-white truncate">{d.name}</span>
                        </div>
                        <span className="text-[0.68rem] text-slate-400 flex items-center gap-1 shrink-0">
                          <MapPin size={10} className="shrink-0" />
                          <span className="truncate max-w-[120px]">{d.district}, {d.city}</span>
                        </span>
                      </div>
                    )}

                    <h3 className="text-sm sm:text-base font-extrabold text-white m-0 leading-snug line-clamp-2">
                      {item.title}
                    </h3>

                    {(item.dimensions || item.colorFinish) && (
                      <div className="flex flex-wrap gap-2 text-xs text-slate-300">
                        {item.dimensions && <span className="bg-slate-900/50 px-2 py-0.5 rounded border border-white/5">📏 {item.dimensions}</span>}
                        {item.colorFinish && <span className="bg-slate-900/50 px-2 py-0.5 rounded border border-white/5">🎨 {item.colorFinish}</span>}
                      </div>
                    )}

                    {item.notes && (
                      <p className="text-[0.75rem] text-slate-400 bg-slate-900/50 p-2.5 rounded-xl border border-white/5 m-0 leading-relaxed italic line-clamp-2">
                        "{item.notes}"
                      </p>
                    )}

                    {/* Price Block */}
                    <div className="mt-auto pt-3 border-t border-white/10 flex items-end justify-between gap-2">
                      <div>
                        {item.originalPrice && (
                          <span className="text-[0.68rem] text-slate-400 line-through block">
                            ₺{item.originalPrice.toLocaleString('tr-TR')} / m²
                          </span>
                        )}
                        <div className="flex items-baseline gap-1">
                          <span className="text-base sm:text-xl font-black text-red-500">
                            ₺{item.unitPrice.toLocaleString('tr-TR')}
                          </span>
                          <span className="text-[0.7rem] text-slate-300">/ m²</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[0.65rem] text-slate-400 block">Palet Toplam Tutarı</span>
                        <span className="text-xs sm:text-sm font-extrabold text-white">
                          ₺{totalPalletValue.toLocaleString('tr-TR')}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      {d?.phone ? (
                        <a
                          href={`https://wa.me/${d.phone.replace(/[\s\-\(\)\+]/g, '')}?text=${encodeURIComponent(`Merhaba, SeramikBak Outlet Borsası'nda yer alan "${item.title}" (${item.quantityM2} m², ₺${item.unitPrice}/m²) ilanınız için bilgi almak / satın almak istiyorum.`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-emerald-500 text-white font-extrabold text-xs no-underline text-center shadow-md active:scale-95 transition-transform"
                        >
                          <MessageSquare size={14} className="shrink-0" />
                          <span className="truncate">WhatsApp Sor</span>
                        </a>
                      ) : null}

                      <button
                        onClick={() => setSelectedItemForContact(item)}
                        className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-black font-extrabold text-xs border-0 cursor-pointer shadow-md active:scale-95 transition-transform ${!d?.phone ? 'col-span-2' : ''}`}
                      >
                        <Send size={14} className="shrink-0" />
                        <span>Teklif Al</span>
                      </button>
                    </div>

                    {d && (
                      <Link
                        href={`/bayi/${slugify(d.name)}`}
                        className="text-[0.72rem] text-slate-400 no-underline text-center mt-1 flex items-center justify-center gap-1 hover:text-white transition-colors"
                      >
                        <span>Bayi Showroom Profilini İncele</span>
                        <ChevronLeft size={12} className="rotate-180 shrink-0" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* LEAD CONTACT MODAL */}
      {selectedItemForContact && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl sm:rounded-3xl max-w-lg w-full p-4 sm:p-6 text-white shadow-2xl relative my-auto max-h-[90vh] overflow-y-auto flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-sm sm:text-base font-extrabold m-0 flex items-center gap-2 text-amber-400">
                <Send size={18} className="shrink-0" />
                Bayiden Fiyat Teklifi / Stok Rezerve Et
              </h3>
              <button onClick={() => setSelectedItemForContact(null)} className="bg-transparent border-0 text-slate-400 cursor-pointer hover:text-white p-1">
                <X size={20} />
              </button>
            </div>

            <div className="bg-slate-800/80 p-3 rounded-xl border border-white/10">
              <span className="text-[0.7rem] text-red-400 font-extrabold block">
                {selectedItemForContact.badgeTag || 'Proje Fazlası'}
              </span>
              <h4 className="text-xs sm:text-sm font-extrabold text-white my-1">{selectedItemForContact.title}</h4>
              <span className="text-xs text-slate-300">
                Mevcut Stok: {selectedItemForContact.quantityM2} m² • Birim Fiyat: ₺{selectedItemForContact.unitPrice}/m²
              </span>
            </div>

            {contactSuccess && (
              <div className="bg-emerald-500/15 border border-emerald-500 text-emerald-400 p-3 rounded-xl text-xs sm:text-sm">
                <CheckCircle2 size={16} className="inline mr-1.5" />
                {contactSuccess}
              </div>
            )}

            {contactError && (
              <div className="bg-red-500/15 border border-red-500 text-red-400 p-3 rounded-xl text-xs sm:text-sm">
                ⚠️ {contactError}
              </div>
            )}

            <form onSubmit={handleContactSubmit} className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1 font-bold">Adınız Soyadınız *</label>
                <input
                  type="text"
                  placeholder="Örn: Ahmet Yılmaz"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-white/15 text-white text-xs sm:text-sm outline-none focus:border-amber-400 transition-colors box-border"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1 font-bold">Telefon Numaranız *</label>
                  <input
                    type="tel"
                    placeholder="0532 123 45 67"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-white/15 text-white text-xs sm:text-sm outline-none focus:border-amber-400 transition-colors box-border"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1 font-bold">E-Posta Adresiniz *</label>
                  <input
                    type="email"
                    placeholder="ahmet@gmail.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-white/15 text-white text-xs sm:text-sm outline-none focus:border-amber-400 transition-colors box-border"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1 font-bold">Ek Not / Mesajınız</label>
                <textarea
                  rows={2}
                  placeholder="İstediğiniz m² miktarı veya nakliye adresi gibi ek sorularınızı yazabilirsiniz..."
                  value={contactNotes}
                  onChange={(e) => setContactNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-white/15 text-white text-xs sm:text-sm outline-none focus:border-amber-400 transition-colors box-border"
                />
              </div>

              <button
                type="submit"
                disabled={contactLoading}
                className="bg-gradient-to-r from-amber-500 to-amber-400 text-black border-0 p-3 rounded-xl font-extrabold text-xs sm:text-sm cursor-pointer mt-1 shadow-md active:scale-95 transition-all"
              >
                {contactLoading ? 'Gönderiliyor...' : 'Teklif Talebi Gönder'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* WHATSAPP ALERT SUBSCRIPTION MODAL */}
      {showAlertModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-[9999] p-3 sm:p-5 overflow-y-auto" onClick={() => setShowAlertModal(false)}>
          <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl sm:rounded-3xl max-w-md w-full p-5 sm:p-7 relative shadow-2xl my-auto max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowAlertModal(false)}
              className="absolute right-4 top-4 bg-white/10 border-0 text-slate-400 w-8 h-8 rounded-full cursor-pointer flex items-center justify-center hover:text-white"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-emerald-500/30">
                <MessageSquare size={22} />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white m-0">WhatsApp Fırsat Alarmı</h3>
                <span className="text-xs text-emerald-400 font-bold">Canlı Outlet & Şantiye Fazlası Bildirimi</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-5">
              Seçtiğiniz şehirdeki seramik bayileri <strong>yeni bir kelepir palet, seri sonu veya 2. kalite stok</strong> yüklediğinde doğrudan WhatsApp hesabınıza bildirim gelsin!
            </p>

            {alertSuccess ? (
              <div className="bg-emerald-500/15 border border-emerald-500/40 rounded-2xl p-5 text-center">
                <CheckCircle2 size={36} className="text-emerald-400 mx-auto mb-2" />
                <h4 className="text-base text-white font-extrabold mb-1">Alarm Başarıyla Kuruldu!</h4>
                <p className="text-xs sm:text-sm text-slate-300 mb-4">{alertSuccess}</p>
                <button
                  onClick={() => { setShowAlertModal(false); setAlertSuccess(''); }}
                  className="bg-emerald-500 text-white border-0 py-2.5 px-5 rounded-xl font-extrabold cursor-pointer text-xs sm:text-sm"
                >
                  Tamam
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubscribeAlert} className="flex flex-col gap-3.5">
                {alertError && (
                  <div className="bg-red-500/15 border border-red-500/40 text-red-400 p-2.5 rounded-xl text-xs">
                    ⚠️ {alertError}
                  </div>
                )}

                <div>
                  <label className="text-xs text-slate-300 block mb-1 font-bold">Adınız Soyadınız *</label>
                  <input
                    type="text"
                    placeholder="Örn: Ahmet Yılmaz"
                    value={alertName}
                    onChange={(e) => setAlertName(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-white/15 text-white text-xs sm:text-sm outline-none focus:border-emerald-400 transition-colors box-border"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1 font-bold">WhatsApp Telefon Numaranız *</label>
                  <input
                    type="tel"
                    placeholder="Örn: 0532 123 45 67"
                    value={alertPhone}
                    onChange={(e) => setAlertPhone(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-white/15 text-white text-xs sm:text-sm outline-none focus:border-emerald-400 transition-colors box-border"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-300 block mb-1 font-bold">Takip Edilecek Şehir</label>
                    <select
                      value={alertCity}
                      onChange={(e) => setAlertCity(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-800 border border-white/15 text-white text-xs sm:text-sm outline-none focus:border-emerald-400 transition-colors box-border"
                    >
                      <option value="ALL">Tüm İller</option>
                      {TURKEY_CITIES.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 block mb-1 font-bold">Stok Kapsamı</label>
                    <select
                      value={alertCategory}
                      onChange={(e) => setAlertCategory(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-800 border border-white/15 text-white text-xs sm:text-sm outline-none focus:border-emerald-400 transition-colors box-border"
                    >
                      <option value="ALL">Tüm Fırsatlar</option>
                      <option value="PROJE_FAZLASI">Proje Fazlası</option>
                      <option value="SERI_SONU">Seri Sonu</option>
                      <option value="IKINCI_KALITE">2. Kalite Palet</option>
                      <option value="OUTLET">Depo Outlet</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={alertLoading}
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0 p-3 rounded-xl font-extrabold text-xs sm:text-sm cursor-pointer mt-2 shadow-lg shadow-emerald-500/35 active:scale-95 transition-transform"
                >
                  {alertLoading ? 'Kaydediliyor...' : '📲 WhatsApp Fırsat Alarmını Başlat'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

