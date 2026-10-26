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
  Wrench,
  Percent,
  Package,
  Layers,
  Ruler,
  Palette,
  Phone,
  Mail,
  Loader2,
  Bell,
  Clock,
  ShieldCheck,
  Check
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
        setContactSuccess('Talebiniz ilgili bayiye iletildi! Bayi temsilcisi en kısa sürede sizinle iletişime geçecektir.');
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
    PROJE_FAZLASI: 'Proje Fazlası',
    SERI_SONU: 'Seri Sonu',
    IKINCI_KALITE: '2. Kalite Palet',
    OUTLET: 'Depo Outlet'
  };

  return (
    <div className="outlet-root-layout">
      {/* Background Architectural Grid Pattern */}
      <div className="outlet-bg-grid" />

      {/* HEADER NAVIGATION - Matches SeramikBak Global App Bar */}
      <header className="outlet-header glass-panel">
        <div className="outlet-header-container">
          <div className="outlet-header-left">
            <Link href="/" className="outlet-back-button" title="Ana Sayfaya Dön">
              <ChevronLeft size={18} />
            </Link>

            <Link href="/" className="outlet-brand-link">
              <div className="outlet-sb-logo">SB</div>
              <div className="outlet-brand-text">
                <span className="brand-name">SeramikBak</span>
                <span className="brand-badge">OUTLET BORSASI</span>
              </div>
            </Link>
          </div>

          <div className="outlet-header-right">
            <button
              onClick={() => { setShowAlertModal(true); setAlertCity(selectedCity || 'ALL'); }}
              className="outlet-btn-alert"
              title="WhatsApp Fırsat Alarmı"
            >
              <Bell size={14} className="bell-icon" />
              <span className="btn-text-full">Fırsat Alarmı Kur</span>
              <span className="btn-text-short">Alarm</span>
            </button>

            <Link href="/bayi" className="outlet-btn-dealer">
              <Building2 size={14} />
              <span className="btn-text-full">Bayi Girişi</span>
              <span className="btn-text-short">İlan Ver</span>
            </Link>
          </div>
        </div>
      </header>

      {/* HERO BANNER SECTION */}
      <section className="outlet-hero-wrap">
        <div className="outlet-hero-content">
          <div className="outlet-top-badge">
            <Sparkles size={13} style={{ color: '#dc2626' }} />
            <span>TÜRKİYE YETKİLİ BAYİ STOK & PROJE FAZLASI BORSASI</span>
          </div>

          <h1 className="outlet-title">
            Depo Seri Sonları & Proje Fazlası Stoklar
          </h1>

          <p className="outlet-subtitle">
            Yetkili bayilerin elinde kalan 30-150 m² şantiye artığı, son paletler ve 2. kalite seramikler doğrudan depo/şantiye fiyatına.
            Balkon, kiralık daire ve mimari tadilatlarınızı bütçe dostu paletlerle tamamlayın.
          </p>

          {/* WhatsApp Alarm Quick Trigger */}
          <div className="outlet-alarm-row">
            <button
              className="outlet-hero-alarm-btn"
              type="button"
              onClick={() => { setShowAlertModal(true); setAlertCity(selectedCity || 'ALL'); }}
            >
              <MessageSquare size={16} />
              <span>
                {selectedCity !== 'ALL' 
                  ? `${selectedCity} İçin WhatsApp Fırsat Alarmı Kur 🔔` 
                  : 'WhatsApp Fırsat Alarmı Kur 🔔'}
              </span>
            </button>
          </div>

          {/* CATEGORY SWITCHER CHIPS */}
          <div className="outlet-chips-scroll">
            <button
              type="button"
              className={`outlet-chip ${selectedCategory === 'ALL' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('ALL')}
            >
              🔥 Tüm Fırsatlar
            </button>
            <button
              type="button"
              className={`outlet-chip ${selectedCategory === 'PROJE_FAZLASI' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('PROJE_FAZLASI')}
            >
              🏗️ Proje Fazlası
            </button>
            <button
              type="button"
              className={`outlet-chip ${selectedCategory === 'SERI_SONU' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('SERI_SONU')}
            >
              📦 Seri Sonu
            </button>
            <button
              type="button"
              className={`outlet-chip ${selectedCategory === 'IKINCI_KALITE' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('IKINCI_KALITE')}
            >
              🏷️ 2. Kalite Palet
            </button>
            <button
              type="button"
              className={`outlet-chip ${selectedCategory === 'OUTLET' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('OUTLET')}
            >
              ✨ Depo Outlet
            </button>
          </div>

          {/* SEARCH & FILTER BAR */}
          <form onSubmit={handleSearchSubmit} className="outlet-filter-card">
            <div className="filter-input-col">
              <Search size={16} className="filter-icon" />
              <input
                type="text"
                placeholder="Desen, ebat veya marka ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="filter-text-box"
              />
            </div>

            <div className="filter-select-col">
              <MapPin size={14} className="filter-icon" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="filter-select-box"
              >
                <option value="ALL">Tüm Şehirler (81 İl)</option>
                {TURKEY_CITIES.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div className="filter-select-col">
              <Tag size={14} className="filter-icon" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="filter-select-box"
              >
                <option value="ALL">Kategori (Tümü)</option>
                <option value="PROJE_FAZLASI">Proje Fazlası</option>
                <option value="SERI_SONU">Seri Sonu</option>
                <option value="IKINCI_KALITE">2. Kalite</option>
                <option value="OUTLET">Depo Outlet</option>
              </select>
            </div>

            <button type="submit" className="filter-action-btn">
              <Search size={15} />
              <span>Filtrele</span>
            </button>
          </form>
        </div>
      </section>

      {/* MAIN CONTENT AREA */}
      <main className="outlet-main-container">
        
        {/* CRAFTSMAN DIRECTORY CALLOUT BANNER */}
        <div className="outlet-usta-banner">
          <div className="usta-banner-left">
            <div className="usta-icon-wrapper">
              <Wrench size={20} />
            </div>
            <div>
              <h4 className="usta-title">
                Bu Seramikleri Döşetecek Tecrübeli Usta mı Arıyorsunuz?
              </h4>
              <p className="usta-desc">
                81 ilde lazer terazili, puanlanmış ve garantili seramik ustalarıyla hemen iletişime geçin.
              </p>
            </div>
          </div>

          <Link href="/ustalar" className="usta-cta-btn">
            <span>Ustaları Gör</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* SECTION HEADER */}
        <div className="outlet-results-header">
          <div>
            <h2 className="results-heading">
              Depolarda Teslimata Hazır Fırsat Ürünleri
            </h2>
            <span className="results-count">
              Toplam {items.length} adet kelepir seramik paleti listeleniyor
            </span>
          </div>
        </div>

        {/* LOADING & EMPTY STATES */}
        {loading ? (
          <div className="outlet-loading-box">
            <Sparkles size={32} className="outlet-spin" style={{ color: '#b38e47' }} />
            <span>Fırsat paletleri taranıyor...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="outlet-empty-box">
            <Tag size={42} style={{ color: '#94a3b8', margin: '0 auto 14px auto' }} />
            <h3 className="empty-title">Aradığınız Kriterlerde Stok Bulunamadı</h3>
            <p className="empty-desc">
              Filtreleri sıfırlayarak tüm bayilerin proje fazlası seramik stoklarını görüntüleyebilirsiniz.
            </p>
            <button
              type="button"
              onClick={() => { setSelectedCity('ALL'); setSelectedCategory('ALL'); setSearchQuery(''); }}
              className="empty-reset-btn"
            >
              Filtreleri Temizle
            </button>
          </div>
        ) : (
          /* PRODUCT CARDS GRID */
          <div className="outlet-grid">
            {items.map((item) => {
              const d = item.dealer;
              const prod = item.product;
              const discountPercent = item.originalPrice && item.originalPrice > item.unitPrice
                ? Math.round(((item.originalPrice - item.unitPrice) / item.originalPrice) * 100)
                : null;
              const totalPalletValue = Math.round(item.unitPrice * item.quantityM2);

              return (
                <div key={item.id} className="outlet-card">
                  
                  {/* Card Media Header */}
                  <div className="card-media">
                    <img
                      src={item.imageUrl || (prod ? prod.imageUrl || getTextureFallback(item) : getTextureFallback(item))}
                      alt={item.title}
                      className="card-img"
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = getTextureFallback(item);
                      }}
                    />
                    <div className="card-media-overlay" />

                    {/* Top Left Badges */}
                    <div className="badges-top-left">
                      <span className="badge-tag">
                        {item.badgeTag || 'Proje Fazlası'}
                      </span>
                      <span className="badge-cat">
                        {categoryLabelMap[item.category] || item.category}
                      </span>
                    </div>

                    {/* Discount Pill */}
                    {discountPercent ? (
                      <div className="badge-discount">
                        %{discountPercent} İNDİRİM
                      </div>
                    ) : null}

                    {/* Stock m² Pill */}
                    <div className="badge-stock">
                      <Package size={12} />
                      <span>{item.quantityM2} m² Stok</span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="card-body">
                    
                    {/* Dealer / Origin Row */}
                    {d ? (
                      <div className="dealer-row">
                        <div className="dealer-name-box">
                          <Building2 size={13} className="gold-icon" />
                          <span className="dealer-title">{d.name}</span>
                        </div>
                        <span className="dealer-location">
                          <MapPin size={11} />
                          {d.district}, {d.city}
                        </span>
                      </div>
                    ) : item.brand ? (
                      <div className="dealer-row">
                        <div className="dealer-name-box">
                          <Sparkles size={13} style={{ color: '#2563eb' }} />
                          <span className="brand-title">{item.brand.name}</span>
                        </div>
                        <span className="factory-badge">Fabrika Çıkışlı</span>
                      </div>
                    ) : null}

                    {/* Title */}
                    <h3 className="card-title" title={item.title}>
                      {item.title}
                    </h3>

                    {/* Dimensions & Color Specs */}
                    {(item.dimensions || item.colorFinish) && (
                      <div className="specs-row">
                        {item.dimensions && (
                          <span className="spec-pill">
                            <Ruler size={11} /> {item.dimensions}
                          </span>
                        )}
                        {item.colorFinish && (
                          <span className="spec-pill">
                            <Palette size={11} /> {item.colorFinish}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Dealer Notes if any */}
                    {item.notes && (
                      <p className="card-notes">
                        "{item.notes}"
                      </p>
                    )}

                    {/* Price Matrix */}
                    <div className="price-matrix">
                      <div className="unit-price-box">
                        {item.originalPrice && (
                          <span className="original-price">
                            ₺{item.originalPrice.toLocaleString('tr-TR')} / m²
                          </span>
                        )}
                        <div className="current-price-row">
                          <span className="current-price">
                            ₺{item.unitPrice.toLocaleString('tr-TR')}
                          </span>
                          <span className="price-unit">/ m²</span>
                        </div>
                      </div>

                      <div className="total-price-box">
                        <span className="total-label">Palet Tutarı</span>
                        <span className="total-value">
                          ₺{totalPalletValue.toLocaleString('tr-TR')}
                        </span>
                      </div>
                    </div>

                    {/* Symmetrical Dual Action Buttons */}
                    <div className="card-actions-grid">
                      {d?.phone ? (
                        <a
                          href={`https://wa.me/${d.phone.replace(/[\s\-\(\)\+]/g, '')}?text=${encodeURIComponent(`Merhaba, SeramikBak Outlet Borsası'nda yer alan "${item.title}" (${item.quantityM2} m², ₺${item.unitPrice}/m²) ilanınız için bilgi almak ve satın almak istiyorum.`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-wa"
                        >
                          <MessageSquare size={14} />
                          <span>WhatsApp Sor</span>
                        </a>
                      ) : null}

                      <button
                        onClick={() => setSelectedItemForContact(item)}
                        className="btn-quote"
                        type="button"
                      >
                        <Send size={14} />
                        <span>Teklif Al</span>
                      </button>
                    </div>

                    {/* Dealer Profile Footer Link */}
                    {d && (
                      <Link
                        href={`/bayi/${slugify(d.name)}`}
                        className="dealer-profile-link"
                      >
                        <span>🏬 Bayi Profilini & Diğer Stoklarını Gör</span>
                        <ArrowRight size={11} />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* LEAD CONTACT MODAL (White Porcelain Theme) */}
      {selectedItemForContact && (
        <div className="modal-backdrop" onClick={() => setSelectedItemForContact(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-title">
                <Send size={17} style={{ color: '#2563eb' }} />
                <h3>Bayiden Fiyat Teklifi / Stok Rezerve Et</h3>
              </div>
              <button 
                onClick={() => setSelectedItemForContact(null)} 
                className="modal-close-btn"
                aria-label="Kapat"
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-summary-box">
              <span className="summary-badge">
                {selectedItemForContact.badgeTag || 'Proje Fazlası'}
              </span>
              <h4 className="summary-title">{selectedItemForContact.title}</h4>
              <span className="summary-details">
                Mevcut Stok: {selectedItemForContact.quantityM2} m² • Birim Fiyat: ₺{selectedItemForContact.unitPrice}/m²
              </span>
            </div>

            {contactSuccess && (
              <div className="modal-success-alert">
                <CheckCircle2 size={16} />
                <span>{contactSuccess}</span>
              </div>
            )}

            {contactError && (
              <div className="modal-error-alert">
                ⚠️ {contactError}
              </div>
            )}

            <form onSubmit={handleContactSubmit} className="modal-form">
              <div className="form-field">
                <label className="field-label">Adınız Soyadınız <span className="req">*</span></label>
                <input
                  type="text"
                  placeholder="Örn: Ahmet Yılmaz"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  required
                  className="field-input"
                />
              </div>

              <div className="form-grid-2">
                <div className="form-field">
                  <label className="field-label">Telefon Numaranız <span className="req">*</span></label>
                  <input
                    type="tel"
                    placeholder="0532 123 45 67"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    required
                    className="field-input"
                  />
                </div>

                <div className="form-field">
                  <label className="field-label">E-Posta Adresiniz <span className="req">*</span></label>
                  <input
                    type="email"
                    placeholder="ahmet@gmail.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    required
                    className="field-input"
                  />
                </div>
              </div>

              <div className="form-field">
                <label className="field-label">Ek Not / Mesajınız</label>
                <textarea
                  rows={2}
                  placeholder="İstediğiniz m² miktarı, nakliye adresi veya sorularınızı yazabilirsiniz..."
                  value={contactNotes}
                  onChange={(e) => setContactNotes(e.target.value)}
                  className="field-input"
                  style={{ resize: 'vertical' }}
                />
              </div>

              <button
                type="submit"
                disabled={contactLoading}
                className="modal-submit-btn"
              >
                {contactLoading ? (
                  <>
                    <Loader2 size={16} className="outlet-spin" />
                    <span>İletiliyor...</span>
                  </>
                ) : (
                  <>
                    <Send size={15} />
                    <span>Teklif Talebi Gönder</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* WHATSAPP ALERT SUBSCRIPTION MODAL (White Porcelain Theme) */}
      {showAlertModal && (
        <div className="modal-backdrop" onClick={() => setShowAlertModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowAlertModal(false)}
              className="modal-close-btn"
              style={{ position: 'absolute', right: '16px', top: '16px' }}
              aria-label="Kapat"
            >
              <X size={18} />
            </button>

            <div className="modal-header-row">
              <div className="wa-icon-box">
                <MessageSquare size={20} />
              </div>
              <div>
                <h3 className="modal-wa-title">WhatsApp Fırsat Alarmı</h3>
                <span className="modal-wa-sub">Canlı Outlet & Şantiye Fazlası Bildirimi</span>
              </div>
            </div>

            <p className="modal-wa-text">
              Seçtiğiniz şehirdeki seramik bayileri <strong>yeni bir kelepir palet, seri sonu veya 2. kalite stok</strong> yüklediğinde doğrudan WhatsApp hesabınıza anında bildirim gelsin!
            </p>

            {alertSuccess ? (
              <div className="modal-wa-success">
                <CheckCircle2 size={36} style={{ color: '#16a34a', marginBottom: '8px' }} />
                <h4 style={{ fontSize: '1.05rem', color: '#0f172a', fontWeight: '800', marginBottom: '4px' }}>Alarm Başarıyla Kuruldu!</h4>
                <p style={{ fontSize: '0.84rem', color: '#475569', margin: '0 0 16px 0' }}>{alertSuccess}</p>
                <button
                  onClick={() => { setShowAlertModal(false); setAlertSuccess(''); }}
                  className="wa-complete-btn"
                >
                  Tamam
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubscribeAlert} className="modal-form">
                {alertError && (
                  <div className="modal-error-alert">
                    ⚠️ {alertError}
                  </div>
                )}

                <div className="form-field">
                  <label className="field-label">Adınız Soyadınız <span className="req">*</span></label>
                  <input
                    type="text"
                    placeholder="Örn: Ahmet Yılmaz"
                    value={alertName}
                    onChange={(e) => setAlertName(e.target.value)}
                    required
                    className="field-input"
                  />
                </div>

                <div className="form-field">
                  <label className="field-label">WhatsApp Telefon Numaranız <span className="req">*</span></label>
                  <input
                    type="tel"
                    placeholder="Örn: 0532 123 45 67"
                    value={alertPhone}
                    onChange={(e) => setAlertPhone(e.target.value)}
                    required
                    className="field-input"
                  />
                </div>

                <div className="form-grid-2">
                  <div className="form-field">
                    <label className="field-label">Takip Edilecek Şehir</label>
                    <select
                      value={alertCity}
                      onChange={(e) => setAlertCity(e.target.value)}
                      className="field-input"
                    >
                      <option value="ALL">Tüm İller (81 İl)</option>
                      {TURKEY_CITIES.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-field">
                    <label className="field-label">Stok Kapsamı</label>
                    <select
                      value={alertCategory}
                      onChange={(e) => setAlertCategory(e.target.value)}
                      className="field-input"
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
                  className="wa-submit-action"
                >
                  {alertLoading ? (
                    <>
                      <Loader2 size={16} className="outlet-spin" />
                      <span>Kaydediliyor...</span>
                    </>
                  ) : (
                    <>
                      <MessageSquare size={16} />
                      <span>📲 WhatsApp Fırsat Alarmını Başlat</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* LUXURY PORCELAIN LIGHT THEME & MOBILE RESPONSIVE CSS */}
      <style jsx>{`
        .outlet-root-layout {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%);
          color: #0f172a;
          font-family: var(--font-body, "Plus Jakarta Sans", sans-serif);
          width: 100%;
          max-width: 100vw;
          overflow-x: hidden;
          position: relative;
        }

        .outlet-bg-grid {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(15, 23, 42, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(15, 23, 42, 0.03) 1px, transparent 1px);
          background-size: 24px 24px;
          pointer-events: none;
        }

        /* HEADER */
        .outlet-header {
          position: sticky;
          top: 0;
          z-index: 90;
          background: rgba(255, 255, 255, 0.88);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid #e2e8f0;
          padding: 10px 16px;
        }

        .outlet-header-container {
          max-width: 1280px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .outlet-header-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .outlet-back-button {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          color: #475569;
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          transition: all 0.2s;
        }

        .outlet-back-button:hover {
          color: #0f172a;
          border-color: #cbd5e1;
          transform: translateY(-1px);
        }

        .outlet-brand-link {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }

        .outlet-sb-logo {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          color: #ffffff;
          border: 1px solid #d4af37;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 0.95rem;
          box-shadow: 0 4px 10px rgba(15, 23, 42, 0.15);
        }

        .outlet-brand-text {
          display: flex;
          flex-direction: column;
        }

        .brand-name {
          font-size: 1.05rem;
          font-weight: 900;
          color: #0f172a;
          line-height: 1.1;
          font-family: var(--font-title, "Outfit", sans-serif);
        }

        .brand-badge {
          color: #dc2626;
          font-size: 0.66rem;
          font-weight: 800;
          letter-spacing: 0.04em;
        }

        .outlet-header-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .outlet-btn-alert {
          font-size: 0.8rem;
          font-weight: 800;
          color: #ffffff;
          background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
          border: none;
          padding: 8px 14px;
          border-radius: 9px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 3px 10px rgba(22, 163, 74, 0.25);
          transition: transform 0.15s;
        }

        .outlet-btn-alert:hover {
          transform: translateY(-1px);
        }

        .outlet-btn-dealer {
          font-size: 0.8rem;
          font-weight: 700;
          color: #0f172a;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          padding: 8px 14px;
          border-radius: 9px;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
        }

        .outlet-btn-dealer:hover {
          border-color: #cbd5e1;
          background: #f8fafc;
        }

        .btn-text-short {
          display: none;
        }

        /* HERO SECTION */
        .outlet-hero-wrap {
          padding: 36px 16px 20px 16px;
          position: relative;
          z-index: 2;
        }

        .outlet-hero-content {
          max-width: 960px;
          margin: 0 auto;
          text-align: center;
        }

        .outlet-top-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(220, 38, 38, 0.08);
          color: #dc2626;
          border: 1px solid rgba(220, 38, 38, 0.2);
          padding: 5px 14px;
          border-radius: 100px;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.03em;
          margin-bottom: 12px;
        }

        .outlet-title {
          font-size: 2.1rem;
          font-weight: 900;
          color: #0f172a;
          margin: 0 0 10px 0;
          letter-spacing: -0.02em;
          font-family: var(--font-title, "Outfit", sans-serif);
        }

        .outlet-subtitle {
          font-size: 0.92rem;
          color: #64748b;
          max-width: 720px;
          margin: 0 auto 16px auto;
          line-height: 1.55;
        }

        .outlet-alarm-row {
          margin-bottom: 20px;
        }

        .outlet-hero-alarm-btn {
          background: #ffffff;
          border: 1.5px solid #16a34a;
          color: #15803d;
          padding: 9px 18px;
          border-radius: 100px;
          font-weight: 800;
          font-size: 0.84rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 14px rgba(22, 163, 74, 0.12);
          transition: all 0.2s;
        }

        .outlet-hero-alarm-btn:hover {
          background: #f0fdf4;
          transform: translateY(-1px);
        }

        /* CHIPS BAR */
        .outlet-chips-scroll {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-bottom: 22px;
          flex-wrap: wrap;
        }

        .outlet-chip {
          padding: 8px 16px;
          border-radius: 10px;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          color: #475569;
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
        }

        .outlet-chip:hover {
          border-color: #94a3b8;
          color: #0f172a;
        }

        .outlet-chip.active {
          background: #0f172a;
          color: #ffffff;
          border-color: #0f172a;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);
        }

        /* FILTER CARD */
        .outlet-filter-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          padding: 8px;
          box-shadow: 0 12px 32px rgba(15, 23, 42, 0.06);
          display: grid;
          grid-template-columns: 2fr 1.3fr 1.3fr auto;
          gap: 8px;
          align-items: center;
        }

        .filter-input-col,
        .filter-select-col {
          position: relative;
          display: flex;
          align-items: center;
        }

        .filter-icon {
          position: absolute;
          left: 12px;
          color: #94a3b8;
          pointer-events: none;
        }

        .filter-text-box,
        .filter-select-box {
          width: 100%;
          padding: 11px 12px 11px 36px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          font-size: 0.84rem;
          color: #0f172a;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.2s, background 0.2s;
        }

        .filter-text-box:focus,
        .filter-select-box:focus {
          border-color: #2563eb;
          background: #ffffff;
        }

        .filter-action-btn {
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          color: #ffffff;
          border: none;
          padding: 11px 22px;
          border-radius: 12px;
          font-size: 0.86rem;
          font-weight: 800;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);
          transition: all 0.2s;
        }

        .filter-action-btn:hover {
          background: #0f172a;
          transform: translateY(-1px);
        }

        /* MAIN CONTAINER */
        .outlet-main-container {
          max-width: 1280px;
          margin: 10px auto 60px auto;
          padding: 0 16px;
          position: relative;
          z-index: 2;
        }

        /* USTA BANNER */
        .outlet-usta-banner {
          background: #ffffff;
          border: 1px solid rgba(179, 142, 71, 0.35);
          border-radius: 16px;
          padding: 16px 20px;
          margin-bottom: 26px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 14px;
          box-shadow: 0 4px 16px rgba(179, 142, 71, 0.06);
        }

        .usta-banner-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .usta-icon-wrapper {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: linear-gradient(135deg, #d4af37 0%, #b38e47 100%);
          color: #000000;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(212, 175, 55, 0.25);
        }

        .usta-title {
          font-size: 0.94rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 2px 0;
        }

        .usta-desc {
          font-size: 0.8rem;
          color: #64748b;
          margin: 0;
        }

        .usta-cta-btn {
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          color: #ffffff;
          text-decoration: none;
          padding: 9px 18px;
          border-radius: 10px;
          font-weight: 800;
          font-size: 0.82rem;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 3px 10px rgba(15, 23, 42, 0.12);
          transition: all 0.2s;
        }

        .usta-cta-btn:hover {
          transform: translateY(-1px);
        }

        /* RESULTS HEADER */
        .outlet-results-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .results-heading {
          font-size: 1.25rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 2px 0;
          font-family: var(--font-title, "Outfit", sans-serif);
        }

        .results-count {
          font-size: 0.8rem;
          color: #64748b;
        }

        /* STATES */
        .outlet-loading-box {
          text-align: center;
          padding: 70px 0;
          color: #64748b;
          font-weight: 600;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .outlet-empty-box {
          text-align: center;
          padding: 60px 20px;
          background: #ffffff;
          border-radius: 20px;
          border: 1px dashed #cbd5e1;
        }

        .empty-title {
          font-size: 1.15rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 8px 0;
        }

        .empty-desc {
          font-size: 0.86rem;
          color: #64748b;
          margin: 0 0 18px 0;
        }

        .empty-reset-btn {
          background: #0f172a;
          color: #ffffff;
          border: none;
          padding: 9px 20px;
          border-radius: 10px;
          font-weight: 700;
          font-size: 0.84rem;
          cursor: pointer;
        }

        /* PRODUCT GRID */
        .outlet-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
          gap: 22px;
        }

        /* PRODUCT CARD */
        .outlet-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 6px 20px rgba(15, 23, 42, 0.04);
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .outlet-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 16px 36px rgba(15, 23, 42, 0.09);
          border-color: #cbd5e1;
        }

        .card-media {
          position: relative;
          height: 195px;
          width: 100%;
          overflow: hidden;
          background: #f1f5f9;
        }

        .card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }

        .outlet-card:hover .card-img {
          transform: scale(1.04);
        }

        .card-media-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(15, 23, 42, 0.75) 0%, transparent 60%);
          pointer-events: none;
        }

        .badges-top-left {
          position: absolute;
          top: 10px;
          left: 10px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          max-width: 65%;
        }

        .badge-tag {
          background: #dc2626;
          color: #ffffff;
          font-size: 0.65rem;
          font-weight: 800;
          padding: 3px 8px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);
          align-self: flex-start;
        }

        .badge-cat {
          background: rgba(15, 23, 42, 0.85);
          color: #f8fafc;
          font-size: 0.62rem;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 6px;
          backdrop-filter: blur(4px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          align-self: flex-start;
        }

        .badge-discount {
          position: absolute;
          top: 10px;
          right: 10px;
          background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
          color: #ffffff;
          font-weight: 900;
          font-size: 0.72rem;
          padding: 4px 9px;
          border-radius: 10px;
          box-shadow: 0 3px 10px rgba(22, 163, 74, 0.35);
        }

        .badge-stock {
          position: absolute;
          bottom: 10px;
          left: 10px;
          background: rgba(15, 23, 42, 0.9);
          color: #fef08a;
          font-weight: 800;
          font-size: 0.68rem;
          padding: 3px 8px;
          border-radius: 7px;
          display: flex;
          align-items: center;
          gap: 5px;
          border: 1px solid rgba(254, 240, 138, 0.25);
        }

        /* CARD BODY */
        .card-body {
          padding: 16px;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .dealer-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 8px;
          gap: 8px;
        }

        .dealer-name-box {
          display: flex;
          align-items: center;
          gap: 6px;
          min-width: 0;
        }

        .gold-icon {
          color: #b38e47;
          flex-shrink: 0;
        }

        .dealer-title {
          font-size: 0.75rem;
          font-weight: 800;
          color: #0f172a;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .brand-title {
          font-size: 0.75rem;
          font-weight: 800;
          color: #2563eb;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .dealer-location {
          font-size: 0.68rem;
          color: #64748b;
          display: flex;
          align-items: center;
          gap: 3px;
          flex-shrink: 0;
        }

        .factory-badge {
          font-size: 0.65rem;
          background: #eff6ff;
          color: #2563eb;
          border: 1px solid #bfdbfe;
          padding: 1px 6px;
          border-radius: 6px;
          font-weight: 700;
          flex-shrink: 0;
        }

        .card-title {
          font-size: 0.96rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .specs-row {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .spec-pill {
          font-size: 0.72rem;
          color: #475569;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          padding: 2px 7px;
          border-radius: 6px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .card-notes {
          font-size: 0.74rem;
          color: #64748b;
          background: #f8fafc;
          padding: 8px 10px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          margin: 0;
          line-height: 1.4;
          font-style: italic;
        }

        /* PRICE MATRIX */
        .price-matrix {
          margin-top: auto;
          padding-top: 10px;
          border-top: 1px solid #f1f5f9;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 8px;
        }

        .unit-price-box {
          display: flex;
          flex-direction: column;
        }

        .original-price {
          font-size: 0.72rem;
          color: #94a3b8;
          text-decoration: line-through;
          line-height: 1;
          margin-bottom: 2px;
        }

        .current-price-row {
          display: flex;
          align-items: baseline;
          gap: 3px;
        }

        .current-price {
          font-size: 1.35rem;
          font-weight: 900;
          color: #dc2626;
          line-height: 1;
        }

        .price-unit {
          font-size: 0.74rem;
          color: #64748b;
          font-weight: 700;
        }

        .total-price-box {
          text-align: right;
          flex-shrink: 0;
        }

        .total-label {
          font-size: 0.65rem;
          color: #64748b;
          display: block;
          text-transform: uppercase;
          font-weight: 700;
        }

        .total-value {
          font-size: 0.95rem;
          font-weight: 800;
          color: #0f172a;
          line-height: 1.2;
        }

        /* ACTIONS */
        .card-actions-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-top: 4px;
        }

        .btn-wa {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 10px 8px;
          min-height: 42px;
          border-radius: 10px;
          background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
          color: #ffffff;
          font-weight: 800;
          font-size: 0.8rem;
          text-decoration: none;
          box-shadow: 0 3px 10px rgba(22, 163, 74, 0.2);
          transition: transform 0.15s;
        }

        .btn-wa:hover {
          transform: translateY(-1px);
        }

        .btn-quote {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 10px 8px;
          min-height: 42px;
          border-radius: 10px;
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          color: #ffffff;
          font-weight: 800;
          font-size: 0.8rem;
          border: none;
          cursor: pointer;
          box-shadow: 0 3px 10px rgba(15, 23, 42, 0.12);
          transition: transform 0.15s;
        }

        .btn-quote:hover {
          transform: translateY(-1px);
        }

        .dealer-profile-link {
          font-size: 0.72rem;
          color: #475569;
          text-decoration: none;
          text-align: center;
          padding: 6px;
          border-radius: 8px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          transition: all 0.15s;
        }

        .dealer-profile-link:hover {
          color: #0f172a;
          border-color: #cbd5e1;
        }

        /* MODALS (White Porcelain Theme) */
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }

        .modal-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 22px;
          max-width: 480px;
          width: 100%;
          padding: 24px;
          color: #0f172a;
          box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.25);
          display: flex;
          flex-direction: column;
          gap: 14px;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 12px;
        }

        .modal-header-title {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .modal-header-title h3 {
          font-size: 1.05rem;
          font-weight: 800;
          margin: 0;
          color: #0f172a;
        }

        .modal-close-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          color: #64748b;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s;
        }

        .modal-close-btn:hover {
          color: #0f172a;
          background: #e2e8f0;
        }

        .modal-summary-box {
          background: #f8fafc;
          padding: 12px 14px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }

        .summary-badge {
          font-size: 0.68rem;
          color: #dc2626;
          font-weight: 800;
          display: block;
        }

        .summary-title {
          font-size: 0.92rem;
          font-weight: 800;
          color: #0f172a;
          margin: 4px 0;
        }

        .summary-details {
          font-size: 0.74rem;
          color: #64748b;
        }

        .modal-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .form-field {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .field-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: #334155;
        }

        .req {
          color: #ef4444;
        }

        .field-input {
          width: 100%;
          padding: 10px 12px;
          border-radius: 9px;
          border: 1px solid #cbd5e1;
          font-size: 0.84rem;
          background: #ffffff;
          color: #0f172a;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .field-input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .form-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .modal-submit-btn {
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          color: #ffffff;
          border: none;
          padding: 12px;
          border-radius: 10px;
          font-weight: 800;
          font-size: 0.88rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          margin-top: 4px;
          box-shadow: 0 4px 14px rgba(15, 23, 42, 0.15);
          transition: all 0.2s;
        }

        .modal-submit-btn:hover:not(:disabled) {
          background: #0f172a;
          transform: translateY(-1px);
        }

        .modal-success-alert {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          color: #166534;
          padding: 10px 12px;
          border-radius: 10px;
          font-size: 0.8rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .modal-error-alert {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #b91c1c;
          padding: 10px 12px;
          border-radius: 10px;
          font-size: 0.8rem;
        }

        /* WA MODAL */
        .modal-header-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }

        .wa-icon-box {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(22, 163, 74, 0.25);
        }

        .modal-wa-title {
          font-size: 1.1rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
        }

        .modal-wa-sub {
          font-size: 0.74rem;
          color: #16a34a;
          font-weight: 700;
        }

        .modal-wa-text {
          font-size: 0.84rem;
          color: #475569;
          line-height: 1.5;
          margin-bottom: 6px;
        }

        .modal-wa-success {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 14px;
          padding: 20px;
          text-align: center;
        }

        .wa-complete-btn {
          background: #16a34a;
          color: #ffffff;
          border: none;
          padding: 10px 24px;
          border-radius: 10px;
          font-weight: 800;
          font-size: 0.86rem;
          cursor: pointer;
        }

        .wa-submit-action {
          background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
          color: #ffffff;
          border: none;
          padding: 12px;
          border-radius: 11px;
          font-weight: 800;
          font-size: 0.9rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 4px 14px rgba(22, 163, 74, 0.3);
          transition: transform 0.15s;
        }

        .wa-submit-action:hover:not(:disabled) {
          transform: translateY(-1px);
        }

        .outlet-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* RESPONSIVE DESIGN (TABLETS & SMARTPHONES) */
        @media (max-width: 900px) {
          .outlet-filter-card {
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }

          .filter-action-btn {
            grid-column: span 2;
            justify-content: center;
          }
        }

        @media (max-width: 640px) {
          .outlet-header {
            padding: 8px 12px;
          }

          .btn-text-full {
            display: none;
          }

          .btn-text-short {
            display: inline;
          }

          .outlet-hero-wrap {
            padding: 24px 12px 16px 12px;
          }

          .outlet-title {
            font-size: 1.5rem;
          }

          .outlet-subtitle {
            font-size: 0.84rem;
          }

          .outlet-chips-scroll {
            justify-content: flex-start;
            overflow-x: auto;
            flex-wrap: nowrap;
            padding-bottom: 6px;
            -webkit-overflow-scrolling: touch;
          }

          .outlet-chip {
            padding: 7px 12px;
            font-size: 0.78rem;
          }

          .outlet-filter-card {
            grid-template-columns: 1fr;
            padding: 12px;
            gap: 10px;
          }

          .filter-action-btn {
            grid-column: span 1;
            width: 100%;
            justify-content: center;
          }

          .outlet-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .outlet-card {
            border-radius: 18px;
          }

          .card-media {
            height: 180px;
          }

          .outlet-usta-banner {
            flex-direction: column;
            align-items: flex-start;
          }

          .usta-cta-btn {
            width: 100%;
            justify-content: center;
            box-sizing: border-box;
          }

          .form-grid-2 {
            grid-template-columns: 1fr;
          }

          .card-actions-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>
    </div>
  );
}
