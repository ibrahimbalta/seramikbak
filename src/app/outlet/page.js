'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Search,
  MapPin,
  MessageSquare,
  Building2,
  ChevronLeft,
  Tag,
  Send,
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
    <div style={{ background: '#090d16', color: '#ffffff', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header Navigation */}
      <header style={{
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(239, 68, 68, 0.25)',
        position: 'sticky',
        top: 0,
        zIndex: 90,
        padding: '12px 16px'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '900',
              fontSize: '1rem',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
            }}>SB</div>
            <span style={{ fontSize: '1.1rem', fontWeight: '900', color: '#ffffff' }}>
              SeramikBak <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>OUTLET</span>
            </span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => { setShowAlertModal(true); setAlertCity(selectedCity || 'ALL'); }}
              style={{
                fontSize: '0.78rem',
                fontWeight: '800',
                color: '#ffffff',
                background: 'linear-gradient(135deg, #25d366 0%, #059669 100%)',
                border: 'none',
                padding: '8px 14px',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 14px rgba(37, 211, 102, 0.35)',
                transition: 'transform 0.2s ease'
              }}
            >
              <MessageSquare size={14} />
              <span>WhatsApp Fırsat Alarmı</span>
            </button>

            <Link href="/bayi" style={{
              fontSize: '0.78rem',
              fontWeight: '700',
              color: '#d4af37',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(212, 175, 55, 0.1)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              padding: '8px 12px',
              borderRadius: '10px'
            }}>
              <Building2 size={14} />
              <span>Bayi Girişi & İlan Ver</span>
            </Link>
          </div>
        </div>
      </header>

      {/* HERO BANNER */}
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
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#f87171',
            padding: '6px 14px',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: '800',
            marginBottom: '14px',
            maxWidth: '100%'
          }}>
            <Sparkles size={14} style={{ flexShrink: 0 }} />
            <span>BAYİLERDEN CANLI OUTLET & ŞANTİYE FAZLASI BORSASI</span>
          </div>

          <h1 style={{ fontSize: 'clamp(1.4rem, 4vw, 2.4rem)', fontWeight: '900', color: '#ffffff', margin: '0 0 14px 0', lineHeight: '1.25' }}>
            Depo Seri Sonları & Proje Fazlası Paletlerde %60'a Varan İndirimler
          </h1>

          <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: '1.6', margin: '0 0 20px 0' }}>
            Bayilerin elinde kalan son 30 m², 50 m² şantiye artığı ve 2. kalite stoklar uygun fiyata satışta!
            Kiralık evinizi, balkonunuzu veya ufak alan tadilatınızı bütçe dostu paletlerle tamamlayın.
          </p>

          <div style={{ marginBottom: '24px' }}>
            <button
              type="button"
              onClick={() => { setShowAlertModal(true); setAlertCity(selectedCity || 'ALL'); }}
              style={{
                background: 'linear-gradient(135deg, #25d366 0%, #059669 100%)',
                color: '#ffffff',
                fontWeight: '800',
                fontSize: '0.85rem',
                padding: '12px 20px',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 6px 20px rgba(37, 211, 102, 0.35)',
                transition: 'transform 0.2s ease',
                maxWidth: '100%'
              }}
            >
              <MessageSquare size={16} />
              <span>{selectedCity !== 'ALL' ? `${selectedCity} İçin WhatsApp Fırsat Alarmı Kur 🔔` : 'WhatsApp Fırsat Alarmı Kur (Tüm İller) 🔔'}</span>
            </button>
          </div>

          {/* Search & Filter Bar */}
          <form onSubmit={handleSearchSubmit} style={{
            background: 'rgba(15, 23, 42, 0.9)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '20px',
            padding: '12px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '10px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
          }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="text"
                placeholder="Desen, ebat veya ürün adı ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  borderRadius: '12px',
                  background: 'rgba(30, 41, 59, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  background: 'rgba(30, 41, 59, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  boxSizing: 'border-box'
                }}
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
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  background: 'rgba(30, 41, 59, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  boxSizing: 'border-box'
                }}
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
              style={{
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '12px',
                fontWeight: '800',
                fontSize: '0.85rem',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)',
                width: '100%'
              }}
            >
              Fırsatları Filtrele
            </button>
          </form>
        </div>
      </section>

      {/* MARKETPLACE LISTINGS GRID */}
      <main style={{ maxWidth: '1280px', margin: '30px auto', padding: '0 16px' }}>
        {/* CRAFTSMAN CALLOUT BANNER */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.12) 0%, rgba(179, 142, 71, 0.2) 100%)',
          border: '1px solid rgba(212, 175, 55, 0.35)',
          borderRadius: '16px',
          padding: '16px',
          marginBottom: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #d4af37 0%, #b38e47 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#000',
              flexShrink: 0
            }}>
              <Wrench size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.92rem', fontWeight: '800', color: '#ffffff', margin: '0 0 2px 0' }}>
                Bu Seramikleri Döşetecek Tecrübeli Usta mı Arıyorsunuz?
              </h4>
              <p style={{ fontSize: '0.78rem', color: '#cbd5e1', margin: 0 }}>
                81 ilde lazer terazili ve sertifikalı onaylı seramik ustalarıyla tek tıkla WhatsApp üzerinden iletişim kurun.
              </p>
            </div>
          </div>

          <Link href="/ustalar" style={{
            background: 'linear-gradient(135deg, #d4af37 0%, #fef08a 100%)',
            color: '#000000',
            textDecoration: 'none',
            padding: '9px 16px',
            borderRadius: '10px',
            fontWeight: '800',
            fontSize: '0.8rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 4px 14px rgba(212, 175, 55, 0.3)'
          }}>
            <span>Bölgenizdeki Ustaları Görün</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0, color: '#ffffff' }}>
              Depolarda Teslimata Hazır Fırsat Ürünleri
            </h2>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Toplam {items.length} adet kelepir seramik paleti bulundu
            </span>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
            <Sparkles size={32} className="animate-spin" style={{ margin: '0 auto 12px auto', color: '#ef4444' }} />
            <span>Fırsat paletleri yükleniyor...</span>
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 20px', background: 'rgba(30, 41, 59, 0.4)', borderRadius: '20px', border: '1px dashed rgba(255,255,255,0.1)' }}>
            <Tag size={40} style={{ color: '#ef4444', margin: '0 auto 16px auto' }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', margin: '0 0 8px 0' }}>Aradığınız Kriterlerde Outlet Ürünü Bulunamadı</h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
              Filtreleri sıfırlayarak tüm bayilerin proje fazlası stoklarını görüntüleyebilirsiniz.
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px'
          }}>
            {items.map((item) => {
              const d = item.dealer;
              const prod = item.product;
              const discountPercent = item.originalPrice && item.originalPrice > item.unitPrice
                ? Math.round(((item.originalPrice - item.unitPrice) / item.originalPrice) * 100)
                : null;
              const totalPalletValue = Math.round(item.unitPrice * item.quantityM2);

              return (
                <div key={item.id} style={{
                  background: 'rgba(30, 41, 59, 0.6)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                  transition: 'all 0.2s ease'
                }}>
                  {/* Image Header */}
                  <div style={{ position: 'relative', height: '190px', width: '100%', overflow: 'hidden' }}>
                    <img
                      src={item.imageUrl || (prod ? prod.imageUrl || getTextureFallback(item) : getTextureFallback(item))}
                      alt={item.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = getTextureFallback(item);
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, transparent 60%)'
                    }} />

                    {/* Top Left Badges */}
                    <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '70%' }}>
                      <span style={{
                        background: '#ef4444',
                        color: '#ffffff',
                        fontSize: '0.65rem',
                        fontWeight: '800',
                        padding: '3px 8px',
                        borderRadius: '10px',
                        boxShadow: '0 4px 10px rgba(239, 68, 68, 0.4)'
                      }}>
                        {item.badgeTag || 'Proje Fazlası'}
                      </span>
                      <span style={{
                        background: 'rgba(15, 23, 42, 0.85)',
                        color: '#cbd5e1',
                        fontSize: '0.6rem',
                        fontWeight: '700',
                        padding: '2px 6px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        backdropFilter: 'blur(4px)'
                      }}>
                        🏷️ {categoryLabelMap[item.category] || item.category}
                      </span>
                    </div>

                    {/* Discount Pill */}
                    {discountPercent && (
                      <div style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: '#ffffff',
                        fontWeight: '900',
                        fontSize: '0.72rem',
                        padding: '3px 8px',
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)'
                      }}>
                        %{discountPercent} İNDİRİM
                      </div>
                    )}

                    {/* Stock m² Pill */}
                    <div style={{ position: 'absolute', bottom: '10px', left: '10px' }}>
                      <span style={{
                        background: 'rgba(212, 175, 55, 0.9)',
                        color: '#000000',
                        fontWeight: '900',
                        fontSize: '0.7rem',
                        padding: '3px 8px',
                        borderRadius: '8px'
                      }}>
                        📦 Mevcut Stok: {item.quantityM2} m²
                      </span>
                    </div>
                  </div>

                  {/* Body Info */}
                  <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {/* Dealer info banner */}
                    {d && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                          <Building2 size={13} style={{ color: '#d4af37', flexShrink: 0 }} />
                          <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</span>
                        </div>
                        <span style={{ fontSize: '0.65rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
                          <MapPin size={10} />
                          {d.district}, {d.city}
                        </span>
                      </div>
                    )}

                    <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#ffffff', margin: 0, lineHeight: '1.4' }}>
                      {item.title}
                    </h3>

                    {(item.dimensions || item.colorFinish) && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '0.72rem', color: '#cbd5e1' }}>
                        {item.dimensions && <span>📏 {item.dimensions}</span>}
                        {item.colorFinish && <span>🎨 {item.colorFinish}</span>}
                      </div>
                    )}

                    {item.notes && (
                      <p style={{
                        fontSize: '0.74rem',
                        color: '#94a3b8',
                        background: 'rgba(15, 23, 42, 0.5)',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        margin: 0,
                        lineHeight: '1.4'
                      }}>
                        "{item.notes}"
                      </p>
                    )}

                    {/* Price Block */}
                    <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '8px' }}>
                      <div>
                        {item.originalPrice && (
                          <span style={{ fontSize: '0.7rem', color: '#94a3b8', textDecoration: 'line-through', display: 'block' }}>
                            ₺{item.originalPrice.toLocaleString('tr-TR')} / m²
                          </span>
                        )}
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                          <span style={{ fontSize: '1.3rem', fontWeight: '900', color: '#ef4444' }}>
                            ₺{item.unitPrice.toLocaleString('tr-TR')}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>/ m²</span>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <span style={{ fontSize: '0.65rem', color: '#94a3b8', display: 'block' }}>Palet Toplam Tutarı</span>
                        <span style={{ fontSize: '0.88rem', fontWeight: '800', color: '#ffffff' }}>
                          ₺{totalPalletValue.toLocaleString('tr-TR')}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '8px', marginTop: '4px' }}>
                      {d?.phone ? (
                        <a
                          href={`https://wa.me/${d.phone.replace(/[\s\-\(\)\+]/g, '')}?text=${encodeURIComponent(`Merhaba, SeramikBak Outlet Borsası'nda yer alan "${item.title}" (${item.quantityM2} m², ₺${item.unitPrice}/m²) ilanınız için bilgi almak / satın almak istiyorum.`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            padding: '9px',
                            borderRadius: '10px',
                            background: '#22c55e',
                            color: '#ffffff',
                            fontWeight: '800',
                            fontSize: '0.76rem',
                            textDecoration: 'none',
                            textAlign: 'center'
                          }}
                        >
                          <MessageSquare size={14} />
                          <span>WhatsApp Sor</span>
                        </a>
                      ) : null}

                      <button
                        onClick={() => setSelectedItemForContact(item)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '9px',
                          borderRadius: '10px',
                          background: 'linear-gradient(135deg, #b38e47 0%, #d4af37 100%)',
                          color: '#000000',
                          fontWeight: '800',
                          fontSize: '0.76rem',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <Send size={14} />
                        <span>Teklif Al</span>
                      </button>
                    </div>

                    {d && (
                      <Link
                        href={`/bayi/${slugify(d.name)}`}
                        style={{
                          fontSize: '0.7rem',
                          color: '#94a3b8',
                          textDecoration: 'none',
                          textAlign: 'center',
                          marginTop: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px'
                        }}
                        className="hover:text-white"
                      >
                        <span>Bayi Showroom Profilini İncele</span>
                        <ChevronLeft size={12} style={{ transform: 'rotate(180deg)' }} />
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
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(6px)',
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: '#0f172a',
            border: '1px solid rgba(212, 175, 55, 0.4)',
            borderRadius: '24px',
            maxWidth: '500px',
            width: '100%',
            padding: '20px',
            color: '#ffffff',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#d4af37' }}>
                <Send size={16} />
                Bayiden Fiyat Teklifi / Stok Rezerve Et
              </h3>
              <button onClick={() => setSelectedItemForContact(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '10px 12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ fontSize: '0.68rem', color: '#ef4444', fontWeight: '800', display: 'block' }}>
                {selectedItemForContact.badgeTag || 'Proje Fazlası'}
              </span>
              <h4 style={{ fontSize: '0.88rem', fontWeight: '800', color: '#ffffff', margin: '4px 0' }}>{selectedItemForContact.title}</h4>
              <span style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>
                Mevcut Stok: {selectedItemForContact.quantityM2} m² • Birim Fiyat: ₺{selectedItemForContact.unitPrice}/m²
              </span>
            </div>

            {contactSuccess && (
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#34d399', padding: '10px', borderRadius: '10px', fontSize: '0.8rem' }}>
                <CheckCircle2 size={16} style={{ display: 'inline', marginRight: '6px' }} />
                {contactSuccess}
              </div>
            )}

            {contactError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#f87171', padding: '10px', borderRadius: '10px', fontSize: '0.8rem' }}>
                ⚠️ {contactError}
              </div>
            )}

            <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Adınız Soyadınız *</label>
                <input
                  type="text"
                  placeholder="Örn: Ahmet Yılmaz"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.85rem', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Telefon Numaranız *</label>
                  <input
                    type="tel"
                    placeholder="0532 123 45 67"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.85rem', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>E-Posta Adresiniz *</label>
                  <input
                    type="email"
                    placeholder="ahmet@gmail.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.85rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Ek Not / Mesajınız</label>
                <textarea
                  rows={2}
                  placeholder="İstediğiniz m² miktarı veya nakliye adresi gibi ek sorularınızı yazabilirsiniz..."
                  value={contactNotes}
                  onChange={(e) => setContactNotes(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.82rem', boxSizing: 'border-box' }}
                />
              </div>

              <button
                type="submit"
                disabled={contactLoading}
                style={{
                  background: 'linear-gradient(135deg, #b38e47 0%, #d4af37 100%)',
                  color: '#000000',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '10px',
                  fontWeight: '800',
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  marginTop: '4px'
                }}
              >
                {contactLoading ? 'Gönderiliyor...' : 'Teklif Talebi Gönder'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* WHATSAPP ALERT SUBSCRIPTION MODAL */}
      {showAlertModal && (
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
        }} onClick={() => setShowAlertModal(false)}>
          <div style={{
            background: '#0f172a',
            border: '1px solid rgba(37, 211, 102, 0.4)',
            borderRadius: '24px',
            maxWidth: '480px',
            width: '100%',
            padding: '24px',
            position: 'relative',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowAlertModal(false)}
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
                background: 'linear-gradient(135deg, #25d366 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 14px rgba(37, 211, 102, 0.3)',
                flexShrink: 0
              }}>
                <MessageSquare size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#ffffff', margin: 0 }}>WhatsApp Fırsat Alarmı</h3>
                <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: '700' }}>Canlı Outlet & Şantiye Fazlası Bildirimi</span>
              </div>
            </div>

            <p style={{ fontSize: '0.84rem', color: '#cbd5e1', lineHeight: '1.5', marginBottom: '16px' }}>
              Seçtiğiniz şehirdeki seramik bayileri <strong>yeni bir kelepir palet, seri sonu veya 2. kalite stok</strong> yüklediğinde doğrudan WhatsApp hesabınıza bildirim gelsin!
            </p>

            {alertSuccess ? (
              <div style={{
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                borderRadius: '14px',
                padding: '20px',
                textAlign: 'center'
              }}>
                <CheckCircle2 size={36} style={{ color: '#10b981', marginBottom: '10px' }} />
                <h4 style={{ fontSize: '1.05rem', color: '#ffffff', fontWeight: '800', marginBottom: '6px' }}>Alarm Başarıyla Kuruldu!</h4>
                <p style={{ fontSize: '0.84rem', color: '#cbd5e1', margin: '0 0 16px 0' }}>{alertSuccess}</p>
                <button
                  onClick={() => { setShowAlertModal(false); setAlertSuccess(''); }}
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
              <form onSubmit={handleSubscribeAlert} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {alertError && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#f87171', padding: '10px 14px', borderRadius: '10px', fontSize: '0.82rem' }}>
                    ⚠️ {alertError}
                  </div>
                )}

                <div>
                  <label style={{ fontSize: '0.76rem', color: '#cbd5e1', display: 'block', marginBottom: '4px', fontWeight: '700' }}>Adınız Soyadınız *</label>
                  <input
                    type="text"
                    placeholder="Örn: Ahmet Yılmaz"
                    value={alertName}
                    onChange={(e) => setAlertName(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', background: 'rgba(30, 41, 59, 0.9)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.86rem', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.76rem', color: '#cbd5e1', display: 'block', marginBottom: '4px', fontWeight: '700' }}>WhatsApp Telefon Numaranız *</label>
                  <input
                    type="tel"
                    placeholder="Örn: 0532 123 45 67"
                    value={alertPhone}
                    onChange={(e) => setAlertPhone(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', background: 'rgba(30, 41, 59, 0.9)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.86rem', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.76rem', color: '#cbd5e1', display: 'block', marginBottom: '4px', fontWeight: '700' }}>Takip Edilecek Şehir</label>
                    <select
                      value={alertCity}
                      onChange={(e) => setAlertCity(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', background: 'rgba(30, 41, 59, 0.9)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.84rem', boxSizing: 'border-box' }}
                    >
                      <option value="ALL">Tüm İller</option>
                      {TURKEY_CITIES.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.76rem', color: '#cbd5e1', display: 'block', marginBottom: '4px', fontWeight: '700' }}>Stok Kapsamı</label>
                    <select
                      value={alertCategory}
                      onChange={(e) => setAlertCategory(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', background: 'rgba(30, 41, 59, 0.9)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.84rem', boxSizing: 'border-box' }}
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
                  style={{
                    background: 'linear-gradient(135deg, #25d366 0%, #059669 100%)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '12px',
                    fontWeight: '800',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    marginTop: '6px',
                    boxShadow: '0 6px 18px rgba(37, 211, 102, 0.35)'
                  }}
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
