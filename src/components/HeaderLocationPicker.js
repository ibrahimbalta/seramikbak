'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, ChevronDown, Check, Sparkles } from 'lucide-react';
import { TURKEY_CITIES, findNearestCity } from '@/lib/turkeyCities';

export default function HeaderLocationPicker({ 
  userLocationName, 
  userCoords, 
  onLocationChange, 
  onDetectLocation, 
  isLocating 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  // Dışarı tıklanınca modal/dropdown'u kapat
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // İlk yüklemede localStorage'da kayıtlı şehir var mı kontrol et
  useEffect(() => {
    try {
      const saved = localStorage.getItem('seramikbak_user_city');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.name && parsed.lat && parsed.lng && userLocationName !== parsed.name) {
          onLocationChange(parsed.name, parsed.lat, parsed.lng);
        }
      }
    } catch (e) {
      // LocalStorage desteği yoksa devam et
    }
  }, []);

  const handleCitySelect = (city) => {
    try {
      localStorage.setItem('seramikbak_user_city', JSON.stringify({
        name: city.name,
        lat: city.lat,
        lng: city.lng
      }));
    } catch (e) {}
    onLocationChange(city.name, city.lat, city.lng);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleGPSDetect = () => {
    if (onDetectLocation) {
      onDetectLocation();
      setIsOpen(false);
    }
  };

  const filteredCities = TURKEY_CITIES.filter(c => 
    c.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  const majorCities = TURKEY_CITIES.filter(c => c.isMajor);

  // Şehir adından sade gösterim
  const displayCity = userLocationName 
    ? userLocationName.replace(' Merkez', '').replace(' Showroom', '').replace(' (Varsayılan)', '').replace(' (GPS)', '')
    : 'İstanbul';

  return (
    <div className="location-picker-wrapper" ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="header-location-btn"
        title="Şehir ve Teslimat Bölgesi Seç"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          height: '33px',
          padding: '0 10px',
          borderRadius: '16px',
          border: '1px solid rgba(179, 142, 71, 0.35)',
          background: '#ffffff',
          color: '#0f172a',
          fontSize: '0.76rem',
          fontWeight: '700',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxSizing: 'border-box'
        }}
      >
        <MapPin size={13} style={{ color: 'var(--accent-gold, #b38e47)', flexShrink: 0 }} />
        <span style={{ maxWidth: '85px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {displayCity}
        </span>
        <ChevronDown size={11} style={{ color: '#64748b', transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'none' }} />
      </button>

      {isOpen && (
        <div 
          className="location-dropdown-panel"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '320px',
            maxHeight: '440px',
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid rgba(0,0,0,0.08)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'fadeInLocation 0.2s ease'
          }}
        >
          {/* Header */}
          <div style={{ padding: '14px 16px 10px 16px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={16} style={{ color: '#b38e47' }} />
                <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0f172a' }}>Teslimat & Bayi Şehri</span>
              </div>
              <span style={{ fontSize: '0.68rem', color: '#64748b', background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>
                81 İl
              </span>
            </div>
            
            {/* Canlı GPS Butonu */}
            <button
              type="button"
              onClick={handleGPSDetect}
              disabled={isLocating}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: '8px',
                border: '1px solid rgba(179, 142, 71, 0.4)',
                background: 'linear-gradient(135deg, rgba(179, 142, 71, 0.1) 0%, rgba(212, 175, 55, 0.05) 100%)',
                color: '#987532',
                fontSize: '0.78rem',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
            >
              <Navigation size={14} className={isLocating ? 'animate-pulse' : ''} />
              <span>{isLocating ? 'Konum Algılanıyor...' : 'Mevcut Konumumu Bul (GPS)'}</span>
            </button>
          </div>

          {/* Şehir Arama Kutusu */}
          <div style={{ padding: '10px 16px', borderBottom: '1px solid #f1f5f9' }}>
            <input
              type="text"
              placeholder="İl ara (örn. İzmir, Ankara)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.80rem',
                outline: 'none',
                color: '#0f172a'
              }}
            />
          </div>

          {/* Popüler İller Hızlı Seçim */}
          {!searchQuery && (
            <div style={{ padding: '8px 16px', background: '#fafafa', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '0.70rem', fontWeight: '700', color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase' }}>
                Popüler Metropoller
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {majorCities.slice(0, 7).map(mc => (
                  <button
                    key={mc.name}
                    type="button"
                    onClick={() => handleCitySelect(mc)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      border: displayCity === mc.name ? '1px solid #b38e47' : '1px solid #e2e8f0',
                      background: displayCity === mc.name ? '#b38e47' : '#ffffff',
                      color: displayCity === mc.name ? '#ffffff' : '#334155',
                      fontSize: '0.74rem',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    {mc.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Şehir Listesi */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '6px 8px', maxHeight: '220px' }}>
            {filteredCities.length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center', fontSize: '0.78rem', color: '#94a3b8' }}>
                Eşleşen il bulunamadı.
              </div>
            ) : (
              filteredCities.map((c) => {
                const isSelected = displayCity.toLowerCase() === c.name.toLowerCase();
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => handleCitySelect(c)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      background: isSelected ? 'rgba(179, 142, 71, 0.12)' : 'transparent',
                      color: isSelected ? '#b38e47' : '#1e293b',
                      fontSize: '0.80rem',
                      fontWeight: isSelected ? '800' : '600',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.background = '#f8fafc';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <span>{c.name}</span>
                    {isSelected && <Check size={14} style={{ color: '#b38e47' }} />}
                  </button>
                );
              })
            )}
          </div>

          {/* Bilgi Notu */}
          <div style={{ padding: '8px 16px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', fontSize: '0.68rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Sparkles size={12} style={{ color: '#b38e47', flexShrink: 0 }} />
            <span>Fiyatlar ve stok durumu seçtiğiniz ile göre filtrelenir.</span>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeInLocation {
          from {
            opacity: 0;
            transform: translateY(-6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
