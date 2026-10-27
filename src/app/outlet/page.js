'use client';

import { useState, useEffect, useMemo } from 'react';
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
  TrendingDown,
  Calculator,
  Flame,
  Truck
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
  { id: 'ALL', label: 'Tüm Fırsatlar', icon: Flame },
  { id: 'PROJE_FAZLASI', label: 'Proje Fazlası', icon: Layers },
  { id: 'SERI_SONU', label: 'Seri Sonu', icon: Package },
  { id: 'IKINCI_KALITE', label: '2. Kalite', icon: Tag },
  { id: 'OUTLET', label: 'Depo Outlet', icon: Sparkles }
];

export default function OutletMarketplacePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Custom m² requirement state per card for interactive labor/stock calculation
  const [customQuantities, setCustomQuantities] = useState({});

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
      const neededQty = customQuantities[selectedItemForContact.id] || selectedItemForContact.quantityM2;
      const res = await fetch('/api/leads/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedItemForContact.productId || selectedItemForContact.id,
          dealerId: selectedItemForContact.dealerId,
          clientName: contactName,
          clientPhone: contactPhone,
          clientEmail: contactEmail,
          notes: `[Outlet / Proje Fazlası Talebi] Ürün: ${selectedItemForContact.title} (${neededQty} m² talep edildi, Birim Fiyat: ₺${selectedItemForContact.unitPrice}/m²). ${contactNotes}`
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
    IKINCI_KALITE: '2. Kalite',
    OUTLET: 'Depo Outlet'
  };

  // Helper to handle custom quantity changes
  const handleQuantityChange = (itemId, maxM2, value) => {
    const val = parseInt(value, 10);
    if (isNaN(val) || val <= 0) {
      setCustomQuantities(prev => ({ ...prev, [itemId]: '' }));
    } else {
      setCustomQuantities(prev => ({ ...prev, [itemId]: Math.min(val, maxM2) }));
    }
  };

  return (
    <div className="outlet-root-layout">
      {/* 1. TOP APP BAR - FROSTED CRYSTAL GLASS */}
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
              <Wrench size={15} style={{ color: '#b38e47' }} />
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

      {/* 2. CANLI SERAMİK BORSASI TICKER BANNER */}
      <div className="outlet-ticker-wrap">
        <div className="outlet-ticker-tag">
          <Flame size={13} />
          <span>CANLI BORSA</span>
        </div>
        <div className="outlet-ticker-content">
          <div className="ticker-item">
            <span className="ticker-badge-green">%62 İNDİRİM</span>
            <strong>60x120 Calacatta Beyaz Şantiye Artığı</strong>
            <span>180 m² Kalan Stok (İstanbul Depo)</span>
          </div>
          <div className="ticker-item">
            <span className="ticker-badge-gold">SERİ SONU</span>
            <strong>30x60 Antrasit Teras Mat Porselen</strong>
            <span>95 m² Tek Palet (Ankara)</span>
          </div>
          <div className="ticker-item">
            <span className="ticker-badge-green">KELEPİR</span>
            <strong>80x80 Gri Mermer Dokulu 2. Kalite</strong>
            <span>220 m² Depo Çıkış (İzmir)</span>
          </div>
          <div className="ticker-item">
            <span className="ticker-badge-gold">PROJE FAZLASI</span>
            <strong>15x90 Ahşap Desen Balkon Seramiği</strong>
            <span>70 m² Anında Sevk (Bursa)</span>
          </div>
          <div className="ticker-item">
            <span className="ticker-badge-green">%55 FIRSAT</span>
            <strong>60x60 Açık Bej Traverten Rektifiye</strong>
            <span>140 m² Paletli (Antalya)</span>
          </div>
        </div>
      </div>

      {/* 3. HERO BANNER SECTION */}
      <section className="outlet-hero-wrap">
        <div className="outlet-hero-content">
          <div className="hero-radar-badge">
            <span className="radar-dot"></span>
            <ShieldCheck size={14} style={{ color: '#059669', flexShrink: 0 }} />
            <span>81 İL YETKİLİ BAYİ ŞANTİYE & DEPO FAZLASI BORSASI</span>
          </div>

          <h1 className="outlet-title">
            Depo Seri Sonları & <span className="gold-gradient-text">Proje Fazlası Stoklar</span>
          </h1>

          <p className="outlet-subtitle">
            81 ildeki yetkili bayilerin elinde kalan 30-250 m² şantiye artığı, son paletler ve 2. kalite seramikler doğrudan depo çıkış fiyatına.
            Balkon, teras, kiralık daire ve tadilatlarınızı %60'a varan indirimli paletlerle tamamlayın.
          </p>

          {/* 4 FEATURE PILLARS / METRICS DECK */}
          <div className="hero-metrics-grid">
            <div className="hero-metric-card">
              <div className="metric-icon-box metric-icon-green">
                <Percent size={20} />
              </div>
              <div className="metric-data">
                <span className="metric-val">%40 - %70</span>
                <span className="metric-lbl">Ortalama Palet Tasarrufu</span>
              </div>
            </div>

            <div className="hero-metric-card">
              <div className="metric-icon-box metric-icon-blue">
                <Building2 size={20} />
              </div>
              <div className="metric-data">
                <span className="metric-val">81 İl Bayi</span>
                <span className="metric-lbl">Yetkili Faturalı Stok</span>
              </div>
            </div>

            <div className="hero-metric-card">
              <div className="metric-icon-box metric-icon-gold">
                <Truck size={20} />
              </div>
              <div className="metric-data">
                <span className="metric-val">Aynı Gün</span>
                <span className="metric-lbl">Doğrudan Depodan Sevk</span>
              </div>
            </div>

            <div className="hero-metric-card">
              <div className="metric-icon-box metric-icon-purple">
                <Bell size={20} />
              </div>
              <div className="metric-data">
                <span className="metric-val">Anlık Alarm</span>
                <span className="metric-lbl">WhatsApp Kelepir Bildirimi</span>
              </div>
            </div>
          </div>

          {/* CATEGORY SWITCHER CHIPS */}
          <div className="outlet-chips-scroll">
            {CATEGORIES.map(cat => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  type="button"
                  className={`outlet-chip ${selectedCategory === cat.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  <Icon size={14} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
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
                <option value="IKINCI_KALITE">2. Kalite</option>
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

      {/* 4. MAIN CONTENT AREA */}
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
                81 ilde puanlanmış, tecrübeli ve garantili seramik ustalarının canlı portfolyolarını hemen inceleyin.
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
              className="results-clear-btn"
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
            {items.map((item, index) => {
              const d = item.dealer;
              const prod = item.product;
              const originalPrice = item.originalPrice || Math.round(item.unitPrice * 1.85);
              const discountPercent = originalPrice > item.unitPrice
                ? Math.round(((originalPrice - item.unitPrice) / originalPrice) * 100)
                : 45;

              // Custom quantity calculation
              const currentCustomQty = customQuantities[item.id] !== undefined && customQuantities[item.id] !== ''
                ? customQuantities[item.id]
                : item.quantityM2;

              const totalPalletValue = Math.round(item.unitPrice * currentCustomQty);
              const totalOriginalValue = Math.round(originalPrice * currentCustomQty);
              const totalSavings = totalOriginalValue - totalPalletValue;

              // Scarcity calculation
              const isLowStock = item.quantityM2 <= 60;
              const lotCode = `LOT #SB-${String(item.id || index + 101).slice(-4).padStart(4, '0')}`;

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
                      <span className="badge-lot">
                        <Tag size={10} />
                        {lotCode}
                      </span>
                      <span className="badge-tag">
                        {categoryLabelMap[item.category] || item.category}
                      </span>
                    </div>

                    {/* Discount Pill */}
                    <div className="badge-discount">
                      %{discountPercent} İNDİRİM
                    </div>

                    {/* Stock m² Pill */}
                    <div className="badge-stock">
                      <Package size={12} />
                      <span>{item.quantityM2} m² Stok</span>
                    </div>

                    {/* Instant tag */}
                    <div className="badge-instant">
                      <Check size={11} />
                      <span>Hemen Sevk</span>
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

                    {/* Scarcity Bar */}
                    <div className="scarcity-box">
                      <div className="scarcity-label-row">
                        <span className="scarcity-status">
                          <Flame size={12} />
                          {isLowStock ? 'Kritik Son Palet!' : 'Hızlı Tükenen Şantiye Artığı'}
                        </span>
                        <span className="scarcity-qty">
                          Depoda {item.quantityM2} m² mevcut
                        </span>
                      </div>
                      <div className="scarcity-bar-track">
                        <div
                          className="scarcity-bar-fill"
                          style={{ width: `${Math.min(100, Math.max(15, (item.quantityM2 / 200) * 100))}%` }}
                        />
                      </div>
                    </div>

                    {/* Interactive Pallet Calculator */}
                    <div className="pallet-calc-box">
                      <div className="calc-label-row">
                        <Calculator size={13} style={{ color: '#b38e47' }} />
                        <span>İhtiyaç Miktarı:</span>
                      </div>
                      <div className="calc-input-row">
                        <input
                          type="number"
                          min="1"
                          max={item.quantityM2}
                          value={currentCustomQty}
                          onChange={(e) => handleQuantityChange(item.id, item.quantityM2, e.target.value)}
                          className="calc-m2-input"
                          title={`En fazla ${item.quantityM2} m² girebilirsiniz`}
                        />
                        <span className="calc-m2-unit">m²</span>
                      </div>
                    </div>

                    {/* Price & Savings Matrix */}
                    <div className="price-matrix">
                      <div className="unit-price-box">
                        <span className="original-price">
                          ₺{originalPrice.toLocaleString('tr-TR')} / m²
                        </span>
                        <div className="current-price-row">
                          <span className="current-price">
                            ₺{item.unitPrice.toLocaleString('tr-TR')}
                          </span>
                          <span className="price-unit">/ m²</span>
                        </div>
                      </div>

                      <div className="total-price-box">
                        <span className="total-label">{currentCustomQty} m² Toplam</span>
                        <span className="total-value">
                          ₺{totalPalletValue.toLocaleString('tr-TR')}
                        </span>
                        {totalSavings > 0 && (
                          <span className="savings-pill">
                            ₺{totalSavings.toLocaleString('tr-TR')} Tasarruf
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Symmetrical Dual Action Buttons (50 / 50) */}
                    <div className="card-actions-grid">
                      {d?.phone ? (
                        <a
                          href={`https://wa.me/${d.phone.replace(/[\s\-\(\)\+]/g, '')}?text=${encodeURIComponent(`Merhaba, SeramikBak Outlet Borsası'nda yer alan "${item.title}" (${currentCustomQty} m², ₺${item.unitPrice}/m² - Toplam: ₺${totalPalletValue}) stoğu hakkında bilgi almak ve rezerve etmek istiyorum.`)}`}
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
                    <option value="IKINCI_KALITE">2. Kalite</option>
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
