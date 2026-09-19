'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  MapPin, 
  Phone, 
  ArrowLeft, 
  Layers, 
  SlidersHorizontal, 
  Sparkles, 
  Download, 
  Globe, 
  ShieldCheck, 
  ExternalLink,
  ChevronRight,
  Search,
  Eye,
  Box
} from 'lucide-react';
import { slugify } from '@/lib/slugify';
import TileVisualPreview from '@/components/TileVisualPreview';

export default function BrandShowcaseClient({ brand, products = [], dealers = [] }) {
  const [selectedStyle, setSelectedStyle] = useState('ALL');
  const [selectedFinish, setSelectedFinish] = useState('ALL');
  const [selectedCity, setSelectedCity] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Extract unique filter values
  const styles = useMemo(() => {
    const set = new Set();
    products.forEach(p => { if (p.style) set.add(p.style); });
    return Array.from(set);
  }, [products]);

  const finishes = useMemo(() => {
    const set = new Set();
    products.forEach(p => { if (p.finish) set.add(p.finish); });
    return Array.from(set);
  }, [products]);

  const cities = useMemo(() => {
    const set = new Set();
    dealers.forEach(d => { if (d.city) set.add(d.city); });
    return Array.from(set).sort();
  }, [dealers]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (selectedStyle !== 'ALL' && p.style !== selectedStyle) return false;
      if (selectedFinish !== 'ALL' && p.finish !== selectedFinish) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = p.name?.toLowerCase().includes(q);
        const matchCode = p.code?.toLowerCase().includes(q);
        if (!matchName && !matchCode) return false;
      }
      return true;
    });
  }, [products, selectedStyle, selectedFinish, searchQuery]);

  // Filter dealers
  const filteredDealers = useMemo(() => {
    if (selectedCity === 'ALL') return dealers;
    return dealers.filter(d => d.city === selectedCity);
  }, [dealers, selectedCity]);

  return (
    <div style={{ minHeight: '100vh', background: '#090d16', color: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Navigation Header */}
      <header style={{
        borderBottom: '1px solid rgba(212, 175, 55, 0.15)',
        background: 'rgba(11, 15, 25, 0.95)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        padding: '14px 20px'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: '#94a3b8' }}>
            <Link href="/" style={{ color: '#d4af37', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700' }}>
              <ArrowLeft size={16} />
              <span>Anasayfa</span>
            </Link>
            <ChevronRight size={14} style={{ opacity: 0.5 }} />
            <Link href="/bayiler" style={{ color: '#cbd5e1', textDecoration: 'none' }}>
              Markalar
            </Link>
            <ChevronRight size={14} style={{ opacity: 0.5 }} />
            <span style={{ color: '#fff', fontWeight: '600' }}>
              {brand.name}
            </span>
          </div>

          <Link
            href="/marka"
            style={{
              fontSize: '0.78rem',
              color: '#d4af37',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              padding: '6px 12px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '700'
            }}
          >
            Marka Girişi (B2B Portal) →
          </Link>
        </div>
      </header>

      {/* Brand Hero Banner */}
      <section style={{
        background: 'linear-gradient(180deg, rgba(20, 29, 47, 0.9) 0%, rgba(9, 13, 22, 1) 100%)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '50px 20px'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '28px', flexWrap: 'wrap' }}>
            
            {/* Brand Logo */}
            <div style={{
              width: '110px',
              height: '110px',
              borderRadius: '20px',
              background: '#0b0f19',
              border: '2px solid rgba(212, 175, 55, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '12px',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.5)',
              overflow: 'hidden'
            }}>
              {brand.logoUrl ? (
                <img
                  src={brand.logoUrl}
                  alt={`${brand.name} Logo`}
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                />
              ) : (
                <Building2 size={44} style={{ color: '#d4af37' }} />
              )}
            </div>

            {/* Brand Title & Badges */}
            <div style={{ flex: 1, minWidth: '280px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#10b981',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <ShieldCheck size={14} />
                  Yetkili Üretici
                </span>
                <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                  Türkiye Seramik & Porselen Karo
                </span>
              </div>

              <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#fff', margin: '0 0 10px 0', lineHeight: 1.2 }}>
                {brand.name}
              </h1>

              <p style={{ fontSize: '0.9rem', color: '#94a3b8', maxWidth: '720px', margin: 0, lineHeight: 1.5 }}>
                {brand.name} seramik, porselen karo ve banyo koleksiyonlarını inceleyin. Türkiye genelindeki yetkili showroom ve bayilerini bulun, doğrudan fiyat teklifi ve numune talep edin.
              </p>
            </div>

            {/* Quick Stats Pills */}
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '14px 22px',
                borderRadius: '14px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#d4af37' }}>{products.length}</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Aktif Karo Modeli</div>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '14px 22px',
                borderRadius: '14px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#10b981' }}>{dealers.length}</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Yetkili Showroom</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 20px 80px' }}>
        
        {/* Products Section Header & Filters */}
        <div style={{ marginBottom: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#fff', margin: '0 0 6px 0' }}>
                {brand.name} Karo Koleksiyonları
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
                Toplam {filteredProducts.length} model listeleniyor
              </p>
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative', width: '280px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }} />
              <input
                type="text"
                placeholder="Karo adı veya kod ile ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 36px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  background: 'rgba(0, 0, 0, 0.4)',
                  color: '#fff',
                  fontSize: '0.82rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: '700' }}>Doku:</span>
            <button
              onClick={() => setSelectedStyle('ALL')}
              style={{
                background: selectedStyle === 'ALL' ? '#d4af37' : 'rgba(255, 255, 255, 0.05)',
                color: selectedStyle === 'ALL' ? '#090d16' : '#cbd5e1',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Tümü
            </button>
            {styles.map(s => (
              <button
                key={s}
                onClick={() => setSelectedStyle(s)}
                style={{
                  background: selectedStyle === s ? '#d4af37' : 'rgba(255, 255, 255, 0.05)',
                  color: selectedStyle === s ? '#090d16' : '#cbd5e1',
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                {s}
              </button>
            ))}

            {finishes.length > 0 && (
              <>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: '700', marginLeft: '12px' }}>Yüzey:</span>
                <button
                  onClick={() => setSelectedFinish('ALL')}
                  style={{
                    background: selectedFinish === 'ALL' ? '#d4af37' : 'rgba(255, 255, 255, 0.05)',
                    color: selectedFinish === 'ALL' ? '#090d16' : '#cbd5e1',
                    border: 'none',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Tümü
                </button>
                {finishes.map(f => (
                  <button
                    key={f}
                    onClick={() => setSelectedFinish(f)}
                    style={{
                      background: selectedFinish === f ? '#d4af37' : 'rgba(255, 255, 255, 0.05)',
                      color: selectedFinish === f ? '#090d16' : '#cbd5e1',
                      border: 'none',
                      padding: '6px 14px',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    {f}
                  </button>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            padding: '60px 20px',
            borderRadius: '16px',
            textAlign: 'center',
            color: '#94a3b8'
          }}>
            Filtrelere uygun seramik karosu bulunamadı. Lütfen filtreleri sıfırlayın.
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '22px',
            marginBottom: '70px'
          }}>
            {filteredProducts.map((p) => {
              const productSlug = slugify(`${brand.name} ${p.name}`);
              return (
                <div
                  key={p.id}
                  style={{
                    background: 'rgba(15, 23, 42, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s ease, border-color 0.2s ease'
                  }}
                >
                  <Link href={`/urun/${productSlug}`} style={{ textDecoration: 'none', display: 'block' }}>
                    <div style={{ width: '100%', aspectRatio: '1 / 1', background: '#0a0e1a', position: 'relative', overflow: 'hidden' }}>
                      <TileVisualPreview
                        style={p.style}
                        color={p.color}
                        finish={p.finish}
                        width={p.width}
                        height={p.height}
                        imageUrl={p.imageUrl}
                        productName={p.name}
                        brandName={brand.name}
                      />
                    </div>

                    <div style={{ padding: '14px 14px 8px' }}>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'monospace' }}>KOD: {p.code}</div>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#fff', margin: '4px 0 6px 0' }}>
                        {p.name}
                      </h3>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        {p.finish} • {p.style}
                      </div>
                    </div>
                  </Link>

                  <div style={{ padding: '8px 14px 14px', marginTop: 'auto', display: 'flex', gap: '8px' }}>
                    <Link
                      href={`/urun/${productSlug}`}
                      style={{
                        flex: 1,
                        background: 'linear-gradient(135deg, #b38e47 0%, #d4af37 100%)',
                        color: '#090d16',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 10px',
                        fontSize: '0.75rem',
                        fontWeight: '800',
                        textDecoration: 'none',
                        textAlign: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px'
                      }}
                    >
                      <Eye size={13} />
                      <span>İncele</span>
                    </Link>

                    <Link
                      href={`/kiosk?product=${p.id}`}
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: '#cbd5e1',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        padding: '8px 10px',
                        fontSize: '0.75rem',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="3D Mekanda Gör"
                    >
                      3D
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Authorized Dealers Directory for this Brand */}
        <section style={{
          background: 'rgba(15, 23, 42, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '20px',
          padding: '30px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '4px', height: '22px', background: '#d4af37', borderRadius: '2px' }} />
                <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#fff', margin: 0 }}>
                  {brand.name} Yetkili Bayileri & Showroomları
                </h2>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '4px 0 0' }}>
                Numune görmek, canlı renk seçmek ve doğrudan fiyat teklifi almak için en yakın şubeyi seçin.
              </p>
            </div>

            {/* City Filter */}
            {cities.length > 0 && (
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                style={{
                  padding: '9px 14px',
                  borderRadius: '10px',
                  background: '#090d16',
                  color: '#fff',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  fontSize: '0.82rem',
                  fontWeight: '600'
                }}
              >
                <option value="ALL">Tüm Şehirler ({dealers.length} Bayi)</option>
                {cities.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            )}
          </div>

          {filteredDealers.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>
              Seçili şehirde henüz yetkili bayi kaydı bulunmuyor.
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '16px'
            }}>
              {filteredDealers.map(dealer => (
                <div
                  key={dealer.id}
                  style={{
                    background: 'rgba(9, 13, 22, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '14px',
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#d4af37', fontSize: '0.75rem', fontWeight: '700', marginBottom: '6px' }}>
                      <Building2 size={14} />
                      <span>{dealer.city} / {dealer.district}</span>
                    </div>

                    <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#fff', margin: '0 0 8px 0' }}>
                      {dealer.name}
                    </h3>

                    <p style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.4, margin: '0 0 14px 0' }}>
                      {dealer.address}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <a
                      href={`tel:${dealer.phone}`}
                      style={{
                        flex: 1,
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: '#fff',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        fontSize: '0.78rem',
                        fontWeight: '700',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <Phone size={13} style={{ color: '#10b981' }} />
                      <span>Ara</span>
                    </a>

                    <Link
                      href={`/bayi/${slugify(dealer.name)}`}
                      style={{
                        flex: 1.3,
                        background: 'rgba(212, 175, 55, 0.15)',
                        color: '#d4af37',
                        border: '1px solid rgba(212, 175, 55, 0.3)',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        fontSize: '0.78rem',
                        fontWeight: '700',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>Showroom Sayfası</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
