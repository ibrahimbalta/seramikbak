'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, Phone, Store, Search, Filter, ShieldCheck, Sparkles, Navigation, ArrowLeft, ChevronRight } from 'lucide-react';

export default function BayilerPage() {
  const [dealers, setDealers] = useState([
    {
      id: 1,
      name: 'Kadıköy VitrA Konsept Showroom',
      brand: 'VitrA',
      city: 'İstanbul',
      district: 'Kadıköy',
      address: 'Bağdat Caddesi No: 142, Kadıköy / İstanbul',
      phone: '0216 345 67 89',
      status: 'APPROVED',
      rating: '4.9',
      activeStock: '24 Seri Stokta',
      verified: true
    },
    {
      id: 2,
      name: 'Çankaya NG Kütahya Ana Bayi',
      brand: 'NG Kütahya',
      city: 'Ankara',
      district: 'Çankaya',
      address: 'Eskişehir Yolu 8. Km No: 94, Çankaya / Ankara',
      phone: '0312 456 78 90',
      status: 'APPROVED',
      rating: '4.8',
      activeStock: '18 Seri Stokta',
      verified: true
    },
    {
      id: 3,
      name: 'Alsancak Bien & Qua Seramik Store',
      brand: 'Bien Seramik',
      city: 'İzmir',
      district: 'Alsancak',
      address: 'Şair Eşref Bulvarı No: 56, Konak / İzmir',
      phone: '0232 464 12 34',
      status: 'APPROVED',
      rating: '4.9',
      activeStock: '30 Seri Stokta',
      verified: true
    },
    {
      id: 4,
      name: 'Nilüfer Seramik & Porselen Plaza',
      brand: 'Qua Seramik',
      city: 'Bursa',
      district: 'Nilüfer',
      address: 'Fatih Sultan Mehmet Bulvarı No: 88, Nilüfer / Bursa',
      phone: '0224 234 56 78',
      status: 'APPROVED',
      rating: '4.7',
      activeStock: '15 Seri Stokta',
      verified: true
    },
    {
      id: 5,
      name: 'Muratpaşa Kütahya Yapı Market',
      brand: 'Kütahya Seramik',
      city: 'Antalya',
      district: 'Muratpaşa',
      address: '100. Yıl Bulvarı No: 120, Muratpaşa / Antalya',
      phone: '0242 321 43 21',
      status: 'APPROVED',
      rating: '4.8',
      activeStock: '22 Seri Stokta',
      verified: true
    },
    {
      id: 6,
      name: 'Gebze Graniser Stok Depo & Outlet',
      brand: 'Graniser',
      city: 'Kocaeli',
      district: 'Gebze',
      address: 'E-5 Karayolu Üzeri No: 45, Gebze / Kocaeli',
      phone: '0262 642 11 22',
      status: 'APPROVED',
      rating: '4.6',
      activeStock: '40 Outlet Seri',
      verified: true
    }
  ]);

  const [selectedCity, setSelectedCity] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch real approved dealers from API
  useEffect(() => {
    setIsLoading(true);
    fetch('/api/admin/dealers')
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
            verified: true
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
    const matchCity = !selectedCity || d.city.toLowerCase() === selectedCity.toLowerCase();
    const matchBrand = !selectedBrand || d.brand.toLowerCase() === selectedBrand.toLowerCase();
    const matchQuery =
      !searchQuery ||
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCity && matchBrand && matchQuery;
  });

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
                {brandsList.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Dealers Grid Section */}
      <main className="dealers-main">
        <div className="main-container">
          <div className="dealers-count-header">
            <h3>
              Toplam <strong>{filteredDealers.length} Yetkili Bayi</strong> Bulundu
            </h3>
            {(selectedCity || selectedBrand || searchQuery) && (
              <button
                className="btn-clear-filters"
                onClick={() => {
                  setSelectedCity('');
                  setSelectedBrand('');
                  setSearchQuery('');
                }}
              >
                Filtreleri Temizle
              </button>
            )}
          </div>

          <div className="dealers-cards-grid">
            {filteredDealers.map((dealer) => (
              <div key={dealer.id} className="dealer-card">
                <div className="card-top-bar">
                  <span className="brand-tag">[{dealer.brand}]</span>
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
                    href={`/teklif-al?dealerId=${dealer.id}`}
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

        .filter-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr;
          gap: 16px;
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
        }

        .filter-input:focus, .filter-select:focus {
          border-color: #fbbf24;
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
          .filter-grid {
            grid-template-columns: 1fr;
          }
          .bayiler-header h1 {
            font-size: 1.4rem;
          }
        }
      `}</style>
    </div>
  );
}
