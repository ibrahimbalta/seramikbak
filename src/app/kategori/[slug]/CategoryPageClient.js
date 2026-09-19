'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  ArrowLeft, 
  ChevronRight, 
  Search, 
  Eye, 
  HelpCircle, 
  Layers, 
  Send, 
  Box, 
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { slugify } from '@/lib/slugify';
import TileVisualPreview from '@/components/TileVisualPreview';

export default function CategoryPageClient({ category, products = [], otherCategories = [] }) {
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [selectedFinish, setSelectedFinish] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // Extract unique brands
  const brands = useMemo(() => {
    const map = new Map();
    products.forEach(p => {
      if (p.brand) map.set(p.brand.id, p.brand.name);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [products]);

  // Extract unique finishes
  const finishes = useMemo(() => {
    const set = new Set();
    products.forEach(p => { if (p.finish) set.add(p.finish); });
    return Array.from(set);
  }, [products]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (selectedBrand !== 'ALL' && p.brand?.id !== selectedBrand) return false;
      if (selectedFinish !== 'ALL' && p.finish !== selectedFinish) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = p.name?.toLowerCase().includes(q);
        const matchBrand = p.brand?.name?.toLowerCase().includes(q);
        const matchCode = p.code?.toLowerCase().includes(q);
        if (!matchName && !matchBrand && !matchCode) return false;
      }
      return true;
    });
  }, [products, selectedBrand, selectedFinish, searchQuery]);

  return (
    <div style={{ minHeight: '100vh', background: '#090d16', color: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Top Header / Breadcrumbs */}
      <header style={{
        borderBottom: '1px solid rgba(212, 175, 55, 0.15)',
        background: 'rgba(11, 15, 25, 0.95)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        padding: '14px 20px'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: '#94a3b8' }}>
            <Link href="/" style={{ color: '#d4af37', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700' }}>
              <ArrowLeft size={16} />
              <span>Anasayfa</span>
            </Link>
            <ChevronRight size={14} style={{ opacity: 0.5 }} />
            <span style={{ color: '#cbd5e1' }}>Kategoriler</span>
            <ChevronRight size={14} style={{ opacity: 0.5 }} />
            <span style={{ color: '#fff', fontWeight: '600' }}>{category.h1}</span>
          </div>

          <Link
            href="/#studio"
            style={{
              fontSize: '0.8rem',
              color: '#090d16',
              background: 'linear-gradient(135deg, #b38e47 0%, #d4af37 100%)',
              padding: '6px 14px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '800',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Eye size={14} />
            <span>3D Stüdyo</span>
          </Link>
        </div>
      </header>

      {/* Category Hero Banner */}
      <section style={{
        background: 'linear-gradient(180deg, rgba(20, 29, 47, 0.9) 0%, rgba(9, 13, 22, 1) 100%)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '45px 20px'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <span style={{
              background: 'rgba(212, 175, 55, 0.15)',
              color: '#d4af37',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: '700'
            }}>
              2026 Karo Koleksiyonu
            </span>
            <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
              • {filteredProducts.length} Model Listeleniyor
            </span>
          </div>

          <h1 style={{ fontSize: '2.4rem', fontWeight: '800', color: '#fff', margin: '0 0 12px 0', lineHeight: 1.2 }}>
            {category.h1}
          </h1>

          <p style={{ fontSize: '0.95rem', color: '#94a3b8', maxWidth: '800px', margin: '0 0 24px 0', lineHeight: 1.5 }}>
            {category.heroDescription}
          </p>

          {/* Sibling Category Pills */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {otherCategories.map(cat => (
              <Link
                key={cat.slug}
                href={`/kategori/${cat.slug}`}
                style={{
                  background: cat.slug === category.slug ? '#d4af37' : 'rgba(255, 255, 255, 0.04)',
                  color: cat.slug === category.slug ? '#090d16' : '#cbd5e1',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  textDecoration: 'none',
                  transition: 'all 0.15s'
                }}
              >
                {cat.h1}
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* Main Content & Products Grid */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 20px 80px' }}>
        
        {/* Filters Bar */}
        <div className="category-filters-bar" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '30px',
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '14px',
          padding: '16px'
        }}>
          
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '700' }}>Marka:</span>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              style={{
                background: '#090d16',
                color: '#fff',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: '600'
              }}
            >
              <option value="ALL">Tüm Markalar ({brands.length})</option>
              {brands.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>

            {finishes.length > 0 && (
              <>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '700', marginLeft: '10px' }}>Yüzey:</span>
                <select
                  value={selectedFinish}
                  onChange={(e) => setSelectedFinish(e.target.value)}
                  style={{
                    background: '#090d16',
                    color: '#fff',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: '600'
                  }}
                >
                  <option value="ALL">Tüm Yüzeyler</option>
                  {finishes.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </>
            )}
          </div>

          {/* Search Box */}
          <div className="category-search-box" style={{ position: 'relative', width: '260px' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '11px', color: '#64748b' }} />
            <input
              type="text"
              placeholder="Model veya marka ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 34px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                background: '#090d16',
                color: '#fff',
                fontSize: '0.82rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length === 0 ? (
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            padding: '60px 20px',
            borderRadius: '16px',
            textAlign: 'center',
            color: '#94a3b8'
          }}>
            Bu filtreye uygun seramik modeli bulunamadı. Lütfen filtreleri sıfırlayın.
          </div>
        ) : (
          <div className="category-products-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '22px',
            marginBottom: '70px'
          }}>
            {filteredProducts.map((p) => {
              const brandName = p.brand?.name || 'Seramik';
              const productSlug = slugify(`${brandName} ${p.name}`);

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
                        brandName={brandName}
                      />
                    </div>

                    <div style={{ padding: '14px 14px 8px' }}>
                      <div style={{ fontSize: '0.72rem', color: '#d4af37', fontWeight: '700', textTransform: 'uppercase' }}>
                        {brandName}
                      </div>
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
                      href={`/urun/${productSlug}?view=3d`}
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
                      title="3D Tasarımda Gör"
                    >
                      3D
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* FAQ Section (Google Rich Results FAQPage) */}
        {category.faqs && category.faqs.length > 0 && (
          <section style={{
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '18px',
            padding: '30px',
            marginBottom: '60px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <HelpCircle size={22} style={{ color: '#d4af37' }} />
              <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#fff', margin: 0 }}>
                {category.h1} Hakkında Sıkça Sorulan Sorular
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {category.faqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    style={{
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      borderRadius: '12px',
                      background: 'rgba(9, 13, 22, 0.7)',
                      overflow: 'hidden'
                    }}
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                      style={{
                        width: '100%',
                        padding: '16px 20px',
                        background: 'transparent',
                        border: 'none',
                        color: '#fff',
                        textAlign: 'left',
                        fontWeight: '700',
                        fontSize: '0.92rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px'
                      }}
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        size={16}
                        style={{
                          color: '#d4af37',
                          transform: isOpen ? 'rotate(180deg)' : 'none',
                          transition: 'transform 0.2s ease',
                          flexShrink: 0
                        }}
                      />
                    </button>

                    {isOpen && (
                      <div style={{ padding: '0 20px 16px', fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.6 }}>
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

      </main>

      <style jsx>{`
        @media (max-width: 768px) {
          :global(.category-filters-bar) {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px !important;
            padding: 12px !important;
          }
          :global(.category-search-box) {
            width: 100% !important;
          }
          :global(.category-products-grid) {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 10px !important;
            margin-bottom: 40px !important;
          }
        }
      `}</style>

    </div>
  );
}
