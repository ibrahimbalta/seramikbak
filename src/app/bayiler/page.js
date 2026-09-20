'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, Phone, Store, Search, Filter, ShieldCheck, Sparkles, Navigation, ArrowLeft, ChevronRight, Calculator, CheckCircle2 } from 'lucide-react';

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

                <h4 className="dealer-name">{dealer.name}</h4>

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

      <style jsx>{`
        .bayiler-page-root {
          min-height: 100vh;
          background: #0f172a;
          color: #f8fafc;
          font-family: inherit;
          padding-bottom: 60px;
        }

        .bayiler-header {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f172a 100%);
          border-bottom: 1px solid rgba(245, 158, 11, 0.25);
          padding: 40px 24px;
          text-align: center;
          position: relative;
        }

        .header-container {
          max-width: 900px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        :global(.back-link) {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #94a3b8;
          font-size: 0.82rem;
          text-decoration: none;
          margin-bottom: 16px;
          align-self: flex-start;
          transition: color 0.2s ease;
        }

        :global(.back-link:hover) {
          color: #fbbf24;
        }

        .header-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(245, 158, 11, 0.12);
          border: 1px solid rgba(245, 158, 11, 0.35);
          color: #fbbf24;
          font-size: 0.72rem;
          font-weight: 800;
          padding: 4px 12px;
          border-radius: 20px;
          letter-spacing: 0.06em;
          margin-bottom: 12px;
        }

        :global(.sparkle-icon) {
          color: #fbbf24;
        }

        .bayiler-header h1 {
          font-size: 1.8rem;
          font-weight: 800;
          color: #ffffff;
          margin: 0 0 8px 0;
          letter-spacing: -0.02em;
        }

        .bayiler-header p {
          color: #94a3b8;
          font-size: 0.92rem;
          max-width: 680px;
          margin: 0;
          line-height: 1.5;
        }

        /* Filter Section */
        .filter-section {
          background: #1e293b;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding: 20px 24px;
        }

        .filter-container {
          max-width: 1100px;
          margin: 0 auto;
        }

        .metraj-banner-container {
          max-width: 1100px;
          margin: 20px auto 0;
          padding: 0 24px;
        }

        .metraj-info-banner {
          background: linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(15, 23, 42, 0.85) 100%);
          border: 1.5px solid rgba(212, 175, 55, 0.4);
          border-radius: 14px;
          padding: 14px 18px;
          position: relative;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
        }

        .metraj-banner-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 6px;
        }

        .metraj-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(212, 175, 55, 0.2);
          color: #f59e0b;
          padding: 3px 10px;
          border-radius: 999px;
          font-size: 0.74rem;
          font-weight: 800;
          border: 1px solid rgba(212, 175, 55, 0.35);
        }

        .metraj-budget-pill {
          font-size: 0.86rem;
          font-weight: 900;
          color: #fbbf24;
          background: rgba(15, 23, 42, 0.8);
          padding: 3px 10px;
          border-radius: 8px;
          border: 1px solid rgba(251, 191, 36, 0.3);
        }

        .metraj-desc-text {
          font-size: 0.82rem;
          color: #cbd5e1;
          margin: 0;
          line-height: 1.45;
        }

        .metraj-banner-close {
          position: absolute;
          top: 10px;
          right: 12px;
          background: none;
          border: none;
          color: #94a3b8;
          font-size: 0.85rem;
          cursor: pointer;
          transition: color 0.2s;
        }

        .metraj-banner-close:hover {
          color: #ffffff;
        }

        .filter-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr 1fr 1fr;
          gap: 14px;
          align-items: flex-end;
        }

        .filter-input-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .filter-input-group label {
          font-size: 0.72rem;
          font-weight: 700;
          color: #94a3b8;
          display: flex;
          align-items: center;
          gap: 5px;
          text-transform: uppercase;
        }

        .filter-input, .filter-select {
          background: #0f172a;
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #ffffff;
          padding: 10px 14px;
          border-radius: 10px;
          font-size: 0.88rem;
          outline: none;
          transition: border-color 0.2s ease;
          height: 42px;
          box-sizing: border-box;
        }

        .filter-input:focus, .filter-select:focus {
          border-color: #fbbf24;
        }

        .btn-locate-nearest {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          height: 42px;
          background: rgba(255, 255, 255, 0.05);
          border: 1.5px solid rgba(255, 255, 255, 0.15);
          color: #f8fafc;
          border-radius: 10px;
          padding: 0 10px;
          font-size: 0.78rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          width: 100%;
          white-space: nowrap;
          box-sizing: border-box;
        }

        .btn-locate-nearest:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(212, 175, 55, 0.4);
        }

        .btn-locate-nearest.active {
          background: linear-gradient(135deg, rgba(212, 175, 55, 0.25) 0%, rgba(16, 185, 129, 0.25) 100%);
          border-color: #10b981;
          color: #34d399;
          box-shadow: 0 0 14px rgba(16, 185, 129, 0.2);
        }

        .card-tags-group {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .distance-pill {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          background: rgba(16, 185, 129, 0.15);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.35);
          padding: 2px 7px;
          border-radius: 6px;
          font-size: 0.68rem;
          font-weight: 800;
        }

        .nearest-active-note {
          font-size: 0.74rem;
          color: #34d399;
          font-weight: 700;
          margin-left: 10px;
        }

        /* Main Dealers Section */
        .dealers-main {
          padding: 32px 24px;
        }

        .main-container {
          max-width: 1100px;
          margin: 0 auto;
        }

        .dealers-count-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .dealers-count-header h3 {
          font-size: 1.05rem;
          font-weight: 600;
          color: #cbd5e1;
          margin: 0;
        }

        .dealers-count-header strong {
          color: #fbbf24;
        }

        .btn-clear-filters {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #94a3b8;
          font-size: 0.78rem;
          padding: 4px 10px;
          border-radius: 6px;
          cursor: pointer;
        }

        .btn-clear-filters:hover {
          color: #ffffff;
          border-color: #ffffff;
        }

        /* Cards Grid */
        .dealers-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
        }

        .dealer-card {
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.75) 0%, rgba(15, 23, 42, 0.85) 100%);
          border: 1px solid rgba(245, 158, 11, 0.3);
          border-radius: 16px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 14px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
          transition: all 0.28s ease;
        }

        .dealer-card:hover {
          transform: translateY(-3px);
          border-color: rgba(251, 191, 36, 0.6);
          box-shadow: 0 8px 26px rgba(245, 158, 11, 0.2);
        }

        .card-top-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .brand-tag {
          color: #fbbf24;
          font-weight: 800;
          font-size: 0.82rem;
        }

        .verified-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #34d399;
          font-size: 0.68rem;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 6px;
        }

        .dealer-name {
          font-size: 1.05rem;
          font-weight: 800;
          color: #ffffff;
          margin: 0;
          line-height: 1.3;
        }

        .dealer-info-rows {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .info-row {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          font-size: 0.82rem;
          color: #94a3b8;
          line-height: 1.4;
        }

        :global(.row-icon) {
          flex-shrink: 0;
          margin-top: 2px;
        }

        :global(.text-amber) {
          color: #fbbf24;
        }

        :global(.text-blue) {
          color: #60a5fa;
        }

        .card-footer-actions {
          display: grid;
          grid-template-columns: 1.3fr 1fr;
          gap: 10px;
          margin-top: 6px;
        }

        :global(.btn-card-action) {
          padding: 9px 12px;
          border-radius: 10px;
          font-size: 0.78rem;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          text-decoration: none !important;
          transition: all 0.2s ease;
        }

        :global(.btn-card-action.primary) {
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          color: #0f172a !important;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.25);
        }

        :global(.btn-card-action.primary:hover) {
          background: linear-gradient(135deg, #fcd34d 0%, #fbbf24 100%);
          transform: translateY(-1px);
        }

        :global(.btn-card-action.secondary) {
          background: rgba(30, 58, 138, 0.5);
          border: 1px solid rgba(96, 165, 250, 0.3);
          color: #93c5fd !important;
        }

        :global(.btn-card-action.secondary:hover) {
          background: rgba(30, 58, 138, 0.8);
          color: #ffffff !important;
        }

        @media (max-width: 768px) {
          .bayiler-header {
            padding: 24px 14px 18px;
          }
          .bayiler-header h1 {
            font-size: 1.35rem;
            line-height: 1.25;
          }
          .bayiler-header p {
            font-size: 0.82rem;
            line-height: 1.45;
          }
          .filter-section {
            padding: 10px 12px 16px;
          }
          .filter-grid {
            grid-template-columns: 1fr;
            gap: 10px;
          }
          .metraj-banner-container {
            margin: 12px auto 0;
            padding: 0 12px;
          }
          .metraj-info-banner {
            padding: 12px 14px;
            border-radius: 12px;
          }
          .metraj-desc-text {
            font-size: 0.76rem;
            line-height: 1.4;
          }
          .btn-locate-nearest {
            height: 40px;
            font-size: 0.78rem;
          }
          .dealers-container {
            padding: 0 12px 100px;
          }
          .dealers-cards-grid {
            grid-template-columns: 1fr;
            gap: 14px;
          }
          .dealer-card {
            padding: 16px 14px;
            border-radius: 14px;
          }
          .card-footer-actions {
            grid-template-columns: 1fr;
            gap: 8px;
          }
          :global(.btn-card-action) {
            padding: 10px 14px;
            font-size: 0.82rem;
            border-radius: 10px;
          }
        }
      `}</style>
    </div>
  );
}
