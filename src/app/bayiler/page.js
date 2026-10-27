'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, Phone, Store, Search, Filter, ShieldCheck, Sparkles, Navigation, ArrowLeft, ChevronRight, Calculator, CheckCircle2 } from 'lucide-react';
import './bayiler.css';

const CITY_COORDS = {
  'istanbul': { lat: 41.0082, lng: 28.9784 },
  'ankara': { lat: 39.9334, lng: 32.8597 },
  'izmir': { lat: 38.4237, lng: 27.1428 },
  'bursa': { lat: 40.1885, lng: 29.0610 },
  'antalya': { lat: 36.8969, lng: 30.7133 },
  'adana': { lat: 37.0000, lng: 35.3213 },
  'kocaeli': { lat: 40.8533, lng: 29.8815 },
  'konya': { lat: 37.8746, lng: 32.4932 },
  'kutahya': { lat: 39.4200, lng: 29.9800 },
  'kütahya': { lat: 39.4200, lng: 29.9800 },
  'canakkale': { lat: 40.1553, lng: 26.4142 },
  'çanakkale': { lat: 40.1553, lng: 26.4142 },
  'eskişehir': { lat: 39.7767, lng: 30.5206 },
  'eskisehir': { lat: 39.7767, lng: 30.5206 }
};

function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 9999;
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export default function BayilerPage() {
  const [dealers, setDealers] = useState([]);

  const [selectedCity, setSelectedCity] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // GPS Nearest Geolocation States
  const [userCoords, setUserCoords] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [sortByNearest, setSortByNearest] = useState(false);
  const [metrajSummary, setMetrajSummary] = useState(null);

  const requestUserLocation = () => {
    setIsLocating(true);
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
          setSortByNearest(true);
          setIsLocating(false);
        },
        (err) => {
          console.warn('Geolocation failed or denied, using Istanbul central default', err);
          setUserCoords({ lat: 41.0082, lng: 28.9784 });
          setSortByNearest(true);
          setIsLocating(false);
        },
        { timeout: 7000, enableHighAccuracy: true }
      );
    } else {
      setUserCoords({ lat: 41.0082, lng: 28.9784 });
      setSortByNearest(true);
      setIsLocating(false);
    }
  };

  // Parse URL search parameters & read metraj data on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const brandParam = params.get('brand');
      const cityParam = params.get('city');
      const qParam = params.get('q') || params.get('search');
      const nearbyParam = params.get('nearby');
      if (brandParam) setSelectedBrand(brandParam);
      if (cityParam) setSelectedCity(cityParam);
      if (qParam) setSearchQuery(qParam);
      if (nearbyParam === 'true' || nearbyParam === '1') {
        requestUserLocation();
      }

      try {
        const saved = localStorage.getItem('seramikbak_metraj_quote');
        if (saved) {
          setMetrajSummary(JSON.parse(saved));
        }
      } catch (e) {}
    }
  }, []);

  // Fetch real approved dealers from API
  useEffect(() => {
    setIsLoading(true);
    fetch('/api/dealers')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const formatted = data.map((d, idx) => ({
            id: d.id || idx,
            name: d.name || 'Yetkili Seramik Bayisi',
            brand: d.brand?.name || d.brandName || 'Yetkili Marka',
            city: d.city || 'İstanbul',
            district: d.district || 'Merkez',
            address: d.address || 'Bayi Adresi',
            phone: d.phone || '0850 123 45 67',
            status: d.status || 'APPROVED',
            rating: '4.8',
            activeStock: 'Stokta Var',
            verified: true,
            lat: d.lat ? parseFloat(d.lat) : null,
            lng: d.lng ? parseFloat(d.lng) : null
          }));
          setDealers(formatted);
        }
      })
      .catch((err) => {
        console.warn('BayilerPage: dealers fetch error, fallback to curated list', err);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const citiesList = Array.from(new Set(dealers.map((d) => d.city).filter(Boolean)));
  const brandsList = Array.from(new Set(dealers.map((d) => d.brand).filter(Boolean)));

  const filteredDealers = dealers.filter((d) => {
    if (!d) return false;
    const dCity = (d.city || '').toLowerCase();
    const dBrand = (d.brand || '').toLowerCase();
    const dName = (d.name || '').toLowerCase();
    const dDistrict = (d.district || '').toLowerCase();
    const dAddress = (d.address || '').toLowerCase();

    const sCity = (selectedCity || '').toLowerCase().trim();
    const sBrand = (selectedBrand || '').toLowerCase().trim();

    const matchCity = !sCity || dCity === sCity;
    const matchBrand = !sBrand || dBrand === sBrand || dBrand.includes(sBrand) || sBrand.includes(dBrand);
    const q = (searchQuery || '').toLowerCase().trim();
    const matchQuery =
      !q ||
      dName.includes(q) ||
      dDistrict.includes(q) ||
      dAddress.includes(q) ||
      dCity.includes(q);
    return matchCity && matchBrand && matchQuery;
  });

  const displayedDealers = (() => {
    const list = filteredDealers.map((d, index) => {
      const cityKey = (d.city || '').toLowerCase();
      const dLat = d.lat || CITY_COORDS[cityKey]?.lat || (41.0082 + ((index % 10) * 0.015));
      const dLng = d.lng || CITY_COORDS[cityKey]?.lng || (28.9784 + ((index % 10) * 0.015));
      const distance = userCoords ? calculateDistanceKm(userCoords.lat, userCoords.lng, dLat, dLng) : null;
      return {
        ...d,
        distanceKm: distance
      };
    });

    if (sortByNearest && userCoords) {
      return [...list].sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
    }
    return list;
  })();

  return (
    <div className="bayiler-page-root">
      {/* Page Header */}
      <header className="bayiler-header">
        <div className="header-container">
          <Link href="/" className="back-link">
            <ArrowLeft size={16} />
            <span>Ana Sayfaya Dön</span>
          </Link>
          <div className="header-badge">
            <Sparkles size={13} className="sparkle-icon" />
            <span>TÜRKİYE YETKİLİ SERAMİK BAYİLERİ</span>
          </div>
          <h1>Yetkili Seramik Bayileri ve Showroom Rehberi</h1>
          <p>
            Bölgenizdeki Kütahya, Bien, Vitra, Ege, Qua ve Graniser yetkili satıcılarını inceleyin, doğrudan fiyat teklifi isteyin ve canlı stok sorgulayın.
          </p>
        </div>
      </header>

      {/* Smart Metraj Summary Info Banner (Eğer Akıllı Metraj Robotundan Gelindiyse) */}
      {metrajSummary && (
        <div className="metraj-banner-container">
          <div className="metraj-info-banner">
            <div className="metraj-banner-top">
              <div className="metraj-badge">
                <Calculator size={14} />
                <span>Akıllı Metraj Hesabınız</span>
              </div>
              <span className="metraj-budget-pill">
                Tahmini Bütçe: ₺{metrajSummary.estimatedMinCost?.toLocaleString('tr-TR')} – ₺{metrajSummary.estimatedMaxCost?.toLocaleString('tr-TR')}
              </span>
            </div>
            <p className="metraj-desc-text">
              <strong>{metrajSummary.areaM2} m² {metrajSummary.roomType ? metrajSummary.roomType.toUpperCase() : 'MEKAN'}</strong> projeniz için <strong>{metrajSummary.requiredBoxes} Kutu (~{metrajSummary.actualPurchasedM2} m²)</strong> seramik ve harç/derz ihtiyacınız aktarıldı. Size en yakın yetkili bayileri aşağıda mesafelerine göre listeledik; seçtiğiniz bayiden anında fiyat teklifi alabilirsiniz.
            </p>
            <button 
              type="button" 
              className="metraj-banner-close" 
              onClick={() => { localStorage.removeItem('seramikbak_metraj_quote'); setMetrajSummary(null); }}
              title="Özeti Gizle"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Filter Bar Section */}
      <section className="filter-section">
        <div className="filter-container">
          <div className="filter-grid">
            {/* Search Input */}
            <div className="filter-input-group">
              <label>
                <Search size={14} />
                <span>Bayi / İlçe Ara</span>
              </label>
              <input
                type="text"
                placeholder="Örn: Kadıköy, Nilüfer veya Bayi Adı..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="filter-input"
              />
            </div>

            {/* City Dropdown */}
            <div className="filter-input-group">
              <label>
                <MapPin size={14} />
                <span>Şehir Seçin</span>
              </label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="filter-select"
              >
                <option value="">Tüm Şehirler ({citiesList.length})</option>
                {citiesList.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Brand Dropdown */}
            <div className="filter-input-group">
              <label>
                <Store size={14} />
                <span>Marka Seçin</span>
              </label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="filter-select"
              >
                <option value="">Tüm Markalar ({brandsList.length})</option>
                {selectedBrand && !brandsList.some(b => b.toLowerCase() === selectedBrand.toLowerCase()) && (
                  <option value={selectedBrand}>{selectedBrand}</option>
                )}
                {brandsList.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>

            {/* GPS Geolocation Nearest Button */}
            <div className="filter-input-group locate-group">
              <label>
                <Navigation size={14} />
                <span>Konum Sıralaması</span>
              </label>
              <button 
                type="button" 
                onClick={requestUserLocation} 
                className={`btn-locate-nearest ${sortByNearest ? 'active' : ''}`}
                disabled={isLocating}
              >
                <Navigation size={14} className={isLocating ? 'animate-spin' : ''} />
                <span>{isLocating ? 'Konum Alınıyor...' : sortByNearest ? '📍 En Yakın Konum Aktif' : '📍 En Yakın Bayileri Bul'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Dealers Grid Section */}
      <main className="dealers-main">
        <div className="main-container">
          <div className="dealers-count-header">
            <h3>
              Toplam <strong>{displayedDealers.length} Yetkili Bayi</strong> Bulundu
              {sortByNearest && <span className="nearest-active-note">● En yakından uzağa sıralandı</span>}
            </h3>
            {(selectedCity || selectedBrand || searchQuery || sortByNearest) && (
              <button
                className="btn-clear-filters"
                onClick={() => {
                  setSelectedCity('');
                  setSelectedBrand('');
                  setSearchQuery('');
                  setSortByNearest(false);
                }}
              >
                Filtreleri Temizle
              </button>
            )}
          </div>

          <div className="dealers-cards-grid">
            {displayedDealers.map((dealer) => (
              <div key={dealer.id} className="dealer-card">
                <div className="card-top-bar">
                  <div className="card-tags-group">
                    <span className="brand-tag">[{dealer.brand}]</span>
                    {dealer.distanceKm !== null && dealer.distanceKm !== undefined && (
                      <span className="distance-pill">
                        <Navigation size={11} />
                        <span>{dealer.distanceKm} km</span>
                      </span>
                    )}
                  </div>
                  <span className="verified-badge">
                    <ShieldCheck size={13} />
                    <span>Yetkili Bayi</span>
                  </span>
                </div>

                <Link href={`/bayi/${dealer.id}`} style={{ textDecoration: 'none' }}>
                  <h4 className="dealer-name hover:text-amber-400 transition-colors">{dealer.name}</h4>
                </Link>

                <div className="dealer-info-rows">
                  <div className="info-row">
                    <MapPin size={15} className="row-icon text-amber" />
                    <span>{dealer.address}</span>
                  </div>
                  <div className="info-row">
                    <Phone size={15} className="row-icon text-blue" />
                    <span>{dealer.phone}</span>
                  </div>
                </div>

                <div className="card-footer-actions">
                  <Link
                    href={`/proje-talep?dealerId=${dealer.id}${metrajSummary ? `&m2=${metrajSummary.areaM2}&type=${encodeURIComponent(metrajSummary.roomType || '')}` : ''}`}
                    className="btn-card-action primary"
                  >
                    <span>Fiyat Teklifi Al</span>
                    <ChevronRight size={14} />
                  </Link>

                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(dealer.name + ' ' + dealer.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-card-action secondary"
                  >
                    <Navigation size={13} />
                    <span>Yol Tarifi</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
