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
  Check,
  CheckSquare
} from 'lucide-react';
import { slugify } from '@/lib/slugify';
import './outlet.css';

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

const CATEGORIES = [
  { id: 'ALL', label: '🔥 Tüm Fırsatlar' },
  { id: 'PROJE_FAZLASI', label: '🏗️ Proje Fazlası' },
  { id: 'SERI_SONU', label: '📦 Seri Sonu' },
  { id: 'IKINCI_KALITE', label: '🏷️ 2. Kalite Palet' },
  { id: 'OUTLET', label: '✨ Depo Outlet' }
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
      {/* 1. TOP APP BAR - FROSTED GLASS */}
      <header className="outlet-header">
        <div className="outlet-header-container">
          <div className="outlet-header-left">
            <Link href="/" className="outlet-back-button" title="Ana Sayfaya Dön">
              <ChevronLeft size={20} />
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
            <Link href="/ustalar" className="header-cross-link" title="Garantili Seramik Ustası Bul">
              <Wrench size={14} style={{ color: '#b38e47' }} />
              <span className="btn-text-full">Usta Rehberi</span>
            </Link>

            <button
              onClick={() => { setShowAlertModal(true); setAlertCity(selectedCity || 'ALL'); }}
              className="outlet-btn-alert"
              title="WhatsApp Fırsat Alarmı Kur"
            >
              <Bell size={15} />
              <span className="btn-text-full">Fırsat Alarmı Kur</span>
              <span className="btn-text-short">Alarm</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO BANNER SECTION */}
      <section className="outlet-hero-wrap">
        <div className="outlet-hero-content">
          {/* Radar Live Indicator */}
          <div className="hero-radar-badge">
            <span className="radar-dot"></span>
            <ShieldCheck size={14} style={{ color: '#059669', flexShrink: 0 }} />
            <span>CANLI YETKİLİ BAYİ ŞANTİYE & DEPO FAZLASI BORSASI</span>
          </div>

          <h1 className="outlet-title">
            Depo Seri Sonları & <span className="gold-gradient-text">Proje Fazlası Stoklar</span>
          </h1>

          <p className="outlet-subtitle">
            81 ildeki yetkili bayilerin elinde kalan 30-200 m² şantiye artığı, son paletler ve 2. kalite seramikler doğrudan depo çıkış fiyatına.
            Balkon, teras, kiralık daire ve tadilatlarınızı %60'a varan indirimli paletlerle tamamlayın.
          </p>

          {/* 4 Feature Pillars */}
          <div className="hero-feature-pills">
            <div className="feature-pill pill-green">
              <Percent size={13} style={{ color: '#059669' }} />
              <span>%40 - %70 Tasarruf İmkanı</span>
            </div>
            <div className="feature-pill pill-blue">
              <Building2 size={13} style={{ color: '#2563eb' }} />
              <span>Yetkili Bayi Faturalı Stok</span>
            </div>
            <div className="feature-pill pill-gold">
              <Package size={13} style={{ color: '#b38e47' }} />
              <span>Anında Depodan Teslimat</span>
            </div>
            <div className="feature-pill pill-purple">
              <Bell size={13} style={{ color: '#7c3aed' }} />
              <span>WhatsApp Fırsat Bildirimi</span>
            </div>
          </div>

          {/* CATEGORY SWITCHER CHIPS */}
          <div className="outlet-chips-scroll">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                type="button"
                className={`outlet-chip ${selectedCategory === cat.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* SEARCH & FILTER BAR */}
          <form onSubmit={handleSearchSubmit} className="outlet-filter-card">
            <div className="filter-input-col">
              <Search size={18} className="filter-icon" />
              <input
                type="text"
                placeholder="Desen, ebat veya marka ara (örn: 60x120, mermer, ahşap)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="filter-text-box"
              />
            </div>

            <div className="filter-select-col">
              <MapPin size={18} className="filter-icon" />
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
              <Tag size={18} className="filter-icon" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="filter-select-box"
              >
                <option value="ALL">Kategori (Tümü)</option>
                <option value="PROJE_FAZLASI">Proje Fazlası</option>
                <option value="SERI_SONU">Seri Sonu</option>
                <option value="IKINCI_KALITE">2. Kalite Palet</option>
                <option value="OUTLET">Depo Outlet</option>
              </select>
            </div>

            <button type="submit" className="filter-action-btn">
              <Search size={16} />
              <span>Filtrele</span>
            </button>
          </form>
        </div>
      </section>

      {/* 3. MAIN CONTENT AREA */}
      <main className="outlet-main-container">
        {/* CRAFTSMAN DIRECTORY CALLOUT BANNER */}
        <div className="outlet-usta-banner">
          <div className="usta-banner-left">
            <div className="usta-icon-wrapper">
              <Wrench size={22} />
            </div>
            <div>
              <h4 className="usta-title">
                Bu Seramikleri Döşetecek Tecrübeli Seramik Ustası mı Arıyorsunuz?
              </h4>
              <p className="usta-desc">
                81 ilde lazer terazili, puanlanmış ve garantili seramik ustalarının canlı portfolyolarını hemen inceleyin.
              </p>
            </div>
          </div>

          <Link href="/ustalar" className="usta-cta-btn">
            <span>Ustaları Gör</span>
            <ArrowRight size={15} />
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

          {(selectedCity !== 'ALL' || selectedCategory !== 'ALL' || searchQuery) && (
            <button
              onClick={() => { setSelectedCity('ALL'); setSelectedCategory('ALL'); setSearchQuery(''); }}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                color: '#64748b',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Filtreleri Sıfırla
            </button>
          )}
        </div>

        {/* LOADING & EMPTY STATES */}
        {loading ? (
          <div className="outlet-loading-box">
            <Loader2 size={36} className="animate-spin" style={{ color: '#b38e47' }} />
            <span>Fırsat stokları taranıyor...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="outlet-empty-box">
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              background: '#fefce8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              <Tag size={36} style={{ color: '#b38e47' }} />
            </div>
            <h3 className="empty-title">Aradığınız Kriterlerde Fırsat Stoğu Bulunamadı</h3>
            <p className="empty-desc">
              Filtreleri sıfırlayarak tüm bayilerin proje fazlası seramik stoklarını görüntüleyebilirsiniz.
            </p>
            <button
              type="button"
              onClick={() => { setSelectedCity('ALL'); setSelectedCategory('ALL'); setSearchQuery(''); }}
              className="empty-reset-btn"
            >
              Tüm İlleri & Fırsatları Göster
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
                          <Building2 size={13} style={{ color: '#b38e47' }} />
                          <span>{d.name}</span>
                        </div>
                        <span className="dealer-location">
                          <MapPin size={11} />
                          {d.district ? `${d.district}, ` : ''}{d.city}
                        </span>
                      </div>
                    ) : item.brand ? (
                      <div className="dealer-row">
                        <div className="dealer-name-box">
                          <Sparkles size={13} style={{ color: '#2563eb' }} />
                          <span>{item.brand.name}</span>
                        </div>
                        <span style={{ fontSize: '0.7rem', color: '#2563eb', fontWeight: 700 }}>Fabrika Çıkışlı</span>
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

                    {/* Symmetrical Dual Action Buttons (50 / 50) */}
                    <div className="card-actions-grid">
                      {d?.phone ? (
                        <a
                          href={`https://wa.me/${d.phone.replace(/[\s\-\(\)\+]/g, '')}?text=${encodeURIComponent(`Merhaba, SeramikBak Outlet Borsası'nda yer alan "${item.title}" (${item.quantityM2} m², ₺${item.unitPrice}/m²) ilanınız için bilgi almak ve satın almak istiyorum.`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-wa"
                        >
                          <MessageSquare size={15} />
                          <span>WhatsApp Sor</span>
                        </a>
                      ) : (
                        <button
                          onClick={() => setSelectedItemForContact(item)}
                          className="btn-wa"
                          type="button"
                        >
                          <MessageSquare size={15} />
                          <span>Bilgi İste</span>
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedItemForContact(item)}
                        className="btn-quote"
                        type="button"
                      >
                        <Send size={15} />
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

      {/* LEAD CONTACT MODAL */}
      {selectedItemForContact && (
        <div className="modal-backdrop" onClick={() => setSelectedItemForContact(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-title">
                <Send size={18} style={{ color: '#2563eb' }} />
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
                <label className="field-label">Adınız Soyadınız *</label>
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
                  <label className="field-label">Telefon Numaranız *</label>
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
                  <label className="field-label">E-posta Adresiniz *</label>
                  <input
                    type="email"
                    placeholder="ornek@mail.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    required
                    className="field-input"
                  />
                </div>
              </div>

              <div className="form-field">
                <label className="field-label">Notunuz / Talep Detayı</label>
                <textarea
                  rows={2}
                  placeholder="Kaç m² ihtiyacınız var? Nakliye dahil mi olsun?"
                  value={contactNotes}
                  onChange={(e) => setContactNotes(e.target.value)}
                  className="field-textarea"
                />
              </div>

              <button
                type="submit"
                disabled={contactLoading}
                className="modal-submit-btn"
              >
                {contactLoading ? 'Gönderiliyor...' : 'Bayiye Teklif Talebini İlet'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* WHATSAPP OPPORTUNITY ALERT MODAL */}
      {showAlertModal && (
        <div className="modal-backdrop" onClick={() => setShowAlertModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-title">
                <Bell size={18} style={{ color: '#16a34a' }} />
                <h3>WhatsApp Fırsat Alarmı Kur</h3>
              </div>
              <button 
                onClick={() => setShowAlertModal(false)} 
                className="modal-close-btn"
                aria-label="Kapat"
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-summary-box">
              <span className="summary-badge" style={{ color: '#16a34a' }}>
                Ücretsiz Bildirim Servisi
              </span>
              <h4 className="summary-title">Bölgenize Yeni Bir Kelepir Stok Düştüğünde İlk Siz Öğrenin</h4>
              <span className="summary-details">
                Seçtiğiniz şehirde yetkili bayiler şantiye artığı veya seri sonu ilan girdiğinde WhatsApp'tan anında bilgi alın.
              </span>
            </div>

            {alertSuccess && (
              <div className="modal-success-alert">
                <CheckCircle2 size={16} />
                <span>{alertSuccess}</span>
              </div>
            )}

            {alertError && (
              <div className="modal-error-alert">
                ⚠️ {alertError}
              </div>
            )}

            <form onSubmit={handleSubscribeAlert} className="modal-form">
              <div className="form-field">
                <label className="field-label">Adınız Soyadınız *</label>
                <input
                  type="text"
                  placeholder="Örn: Mehmet Bey"
                  value={alertName}
                  onChange={(e) => setAlertName(e.target.value)}
                  required
                  className="field-input"
                />
              </div>

              <div className="form-field">
                <label className="field-label">WhatsApp Telefon Numaranız *</label>
                <input
                  type="tel"
                  placeholder="0532 123 45 67"
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
                    className="field-select"
                  >
                    <option value="ALL">Tüm Türkiye</option>
                    {TURKEY_CITIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label className="field-label">Fırsat Türü</label>
                  <select
                    value={alertCategory}
                    onChange={(e) => setAlertCategory(e.target.value)}
                    className="field-select"
                  >
                    <option value="ALL">Tüm Fırsatlar</option>
                    <option value="PROJE_FAZLASI">Proje Fazlası</option>
                    <option value="SERI_SONU">Seri Sonu</option>
                    <option value="IKINCI_KALITE">2. Kalite Palet</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={alertLoading}
                className="modal-submit-btn"
                style={{ background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)' }}
              >
                {alertLoading ? 'Kaydediliyor...' : '🔔 Fırsat Alarmını Ücretsiz Başlat'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
