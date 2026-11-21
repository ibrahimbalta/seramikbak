'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  UploadCloud,
  Layers,
  Eye,
  MapPin,
  Compass,
  Building2,
  ShieldCheck,
  CheckCircle,
  FileText,
  Box,
  Search,
  Store,
  ChevronRight,
  Camera,
  SlidersHorizontal
} from 'lucide-react';
import { slugify } from '@/lib/slugify';
import { TURKEY_CITIES } from '@/lib/turkeyCities';

/**
 * SECTION 6: AI İLE MEKÂNINI TASARLA
 * Flagship architectural showcase block with 3-step visual narrative.
 */
export function AiDesignShowcaseSection({ onOpenStudio }) {
  return (
    <section
      id="ai-design-showcase-section"
      style={{
        margin: '44px 0',
        borderRadius: '24px',
        background: 'linear-gradient(135deg, #18181B 0%, #242424 55%, #1C1917 100%)',
        border: '1px solid rgba(197, 160, 89, 0.32)',
        overflow: 'hidden',
        boxShadow: '0 24px 60px -15px rgba(24, 24, 27, 0.22)',
        color: '#FAF9F6'
      }}
    >
      <div
        className="ai-showcase-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          alignItems: 'stretch'
        }}
      >
        {/* Left: Visual & Editorial Pitch */}
        <div
          style={{
            padding: 'clamp(28px, 4vw, 48px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '24px',
            position: 'relative'
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '5px 14px',
                borderRadius: '999px',
                background: 'rgba(197, 160, 89, 0.16)',
                border: '1px solid rgba(197, 160, 89, 0.4)',
                color: '#F3E5AB',
                fontSize: '0.72rem',
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '18px'
              }}
            >
              <Sparkles size={13} style={{ color: '#D4AF37' }} />
              <span>AI DESTEKLİ DİJİTAL SERAMİK STÜDYOSU</span>
            </div>

            <h2
              style={{
                fontSize: 'clamp(1.75rem, 3.2vw, 2.5rem)',
                fontWeight: 900,
                color: '#FAF9F6',
                lineHeight: 1.15,
                letterSpacing: '-0.025em',
                margin: '0 0 14px 0',
                fontFamily: 'var(--font-title, "Outfit", sans-serif)'
              }}
            >
              Satın Almadan Önce
              <br />
              <span
                style={{
                  background: 'linear-gradient(135deg, #F3E5AB 0%, #D4AF37 50%, #B38E47 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Mekânınızda Görün.
              </span>
            </h2>

            <p
              style={{
                fontSize: '0.96rem',
                color: '#D6D3CD',
                lineHeight: 1.65,
                margin: 0,
                maxWidth: '520px'
              }}
            >
              Beğendiğiniz seramikleri kendi banyonuzda veya mutfağınızda yapay zekâ ile deneyin. Sonucu görün, karşılaştırın ve hayalinizdeki tasarıma karar verin.
            </p>
          </div>

          {/* 3-Step Horizontal / Stacked Process Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '12px'
            }}
          >
            {[
              {
                num: '01',
                title: 'Mekânınızın fotoğrafını yükleyin.',
                desc: 'Banyo, mutfak veya salon fotoğrafınızı çekin.',
                icon: <Camera size={17} />
              },
              {
                num: '02',
                title: 'Kataloğumuzdan seramik seçin.',
                desc: 'Binlerce gerçek doku ve ebadı tek tıkla uygulayın.',
                icon: <Layers size={17} />
              },
              {
                num: '03',
                title: 'Yeni tasarımınızı görün.',
                desc: 'Önce/sonra kıyaslayın ve yetkili bayiden teklif alın.',
                icon: <Eye size={17} />
              }
            ].map((step) => (
              <div
                key={step.num}
                style={{
                  background: 'rgba(250, 249, 246, 0.05)',
                  border: '1px solid rgba(250, 249, 246, 0.1)',
                  borderRadius: '14px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '9px',
                      background: 'rgba(197, 160, 89, 0.18)',
                      color: '#F3E5AB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {step.icon}
                  </span>
                  <span
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 900,
                      color: 'rgba(243, 229, 171, 0.45)',
                      letterSpacing: '0.05em'
                    }}
                  >
                    ADIM {step.num}
                  </span>
                </div>
                <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#FAF9F6', lineHeight: 1.3 }}>
                  {step.title}
                </div>
                <div style={{ fontSize: '0.73rem', color: '#A8A29E', lineHeight: 1.4 }}>
                  {step.desc}
                </div>
              </div>
            ))}
          </div>

          {/* CTA Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <Link
              href="/mekanimda-gor"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                background: 'linear-gradient(135deg, #B38E47 0%, #D4AF37 100%)',
                color: '#18181B',
                padding: '14px 26px',
                borderRadius: '12px',
                fontSize: '0.92rem',
                fontWeight: 800,
                textDecoration: 'none',
                boxShadow: '0 10px 25px rgba(179, 142, 71, 0.32)',
                transition: 'all 0.2s ease'
              }}
            >
              <Sparkles size={17} />
              <span>Mekânımı Tasarlamaya Başla</span>
              <ArrowRight size={16} />
            </Link>

            <button
              type="button"
              onClick={onOpenStudio}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(250, 249, 246, 0.08)',
                color: '#FAF9F6',
                border: '1px solid rgba(250, 249, 246, 0.2)',
                padding: '14px 22px',
                borderRadius: '12px',
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <Box size={16} style={{ color: '#D4AF37' }} />
              <span>3D Sanal Stüdyo</span>
            </button>
          </div>
        </div>

        {/* Right: Architectural Bathroom Visual Preview */}
        <div
          style={{
            position: 'relative',
            minHeight: '340px',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'flex-end',
            padding: '24px'
          }}
        >
          <img
            src="/hero/wide_luxury_bathroom.jpg"
            alt="AI ile Mekânını Tasarla - Lüks Banyo Seramik Uygulaması"
            loading="lazy"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, rgba(24,24,27,0.12) 0%, rgba(24,24,27,0.78) 100%)'
            }}
          />

          {/* Floating Material Specification Pill on Visual */}
          <div
            style={{
              position: 'relative',
              zIndex: 2,
              width: '100%',
              background: 'rgba(24, 24, 27, 0.86)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(197, 160, 89, 0.38)',
              borderRadius: '16px',
              padding: '16px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '14px',
              flexWrap: 'wrap'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img
                src="/hero/luxury_bathroom.png"
                alt="Calacatta Mermer Doku"
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '10px',
                  objectFit: 'cover',
                  border: '1.5px solid #D4AF37'
                }}
              />
              <div>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#F3E5AB', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  CANLI AI PERSPEKTİF MOTORU
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#FAF9F6' }}>
                  60×120 Rektifiyeli Porselen & Doğal Işık Koruma
                </div>
              </div>
            </div>
            <Link
              href="/mekanimda-gor"
              style={{
                background: 'rgba(250, 249, 246, 0.12)',
                border: '1px solid rgba(243, 229, 171, 0.35)',
                color: '#F3E5AB',
                padding: '8px 14px',
                borderRadius: '9px',
                fontSize: '0.76rem',
                fontWeight: 800,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <span>Şimdi Dene</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * SECTION 7: POPÜLER SERAMİK KOLEKSİYONLARI
 * 6 curated architectural ceramic categories with large visuals & "Koleksiyonu Keşfet" CTA.
 */
export function PopularCollectionsSection({ onSelectCollection }) {
  const collections = [
    {
      id: 'mermer',
      title: 'Mermer Görünümlü',
      subtitle: 'Calacatta, Carrara ve Onyx damarlı zamansız porselen serileri.',
      image: '/hero/luxury_bathroom.png',
      filterType: 'style',
      filterVal: 'Mermer',
      tag: '60×120 & 120×240'
    },
    {
      id: 'ahsap',
      title: 'Ahşap Görünümlü',
      subtitle: 'Doğal meşe, ceviz ve teak dokulu sıcak parke porselen karolar.',
      image: '/hero/modern_living.png',
      filterType: 'style',
      filterVal: 'Ahşap',
      tag: '20×120 Parke'
    },
    {
      id: 'beton',
      title: 'Beton Görünümlü',
      subtitle: 'Modern mimari ve minimalist loft mekânlar için endüstriyel yüzeyler.',
      image: '/hero/wide_living.jpg',
      filterType: 'style',
      filterVal: 'Beton',
      tag: 'Minimalist Loft'
    },
    {
      id: 'traverten',
      title: 'Traverten',
      subtitle: 'Doğal taş gözenekli, sıcak bej ve fildişi tonlarında organik dokular.',
      image: '/hero/scandinavian_kitchen.png',
      filterType: 'style',
      filterVal: 'Traverten',
      tag: 'Doğal Taş Estetiği'
    },
    {
      id: 'buyuk-ebat',
      title: 'Büyük Ebat Porselen',
      subtitle: 'Az derzli, yekpare zemin ve duvarlar için geniş ebat mimari plakalar.',
      image: '/hero/wide_luxury_bathroom.jpg',
      filterType: 'size',
      filterVal: '60x120',
      tag: '60×120 / 80×160'
    },
    {
      id: 'dekoratif',
      title: 'Dekoratif Seramikler',
      subtitle: '3D rölyef dokulu, geometrik ve mozaik vurgulu özel duvar serileri.',
      image: '/hero/wide_bathroom_3.jpg',
      filterType: 'style',
      filterVal: 'Dekor',
      tag: '3D Rölyef & Mozaik'
    }
  ];

  return (
    <section id="popular-collections-section" style={{ margin: '48px 0' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '24px'
        }}
      >
        <div>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              color: '#B38E47',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              display: 'block',
              marginBottom: '6px'
            }}
          >
            MİMARİ DOKU VE YÜZEY KÜTÜPHANESİ
          </span>
          <h2
            style={{
              fontSize: 'clamp(1.45rem, 2.5vw, 2rem)',
              fontWeight: 900,
              color: '#242424',
              margin: 0,
              letterSpacing: '-0.02em',
              fontFamily: 'var(--font-title, "Outfit", sans-serif)'
            }}
          >
            Popüler Seramik Koleksiyonları
          </h2>
        </div>
        <p style={{ fontSize: '0.88rem', color: '#57534E', margin: 0, maxWidth: '420px' }}>
          Mekânınızın mimari karakterine uygun seramik dokusunu seçin ve tüm üretici modellerini karşılaştırın.
        </p>
      </div>

      <div
        className="popular-collections-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '20px'
        }}
      >
        {collections.map((col) => (
          <div
            key={col.id}
            onClick={() => onSelectCollection(col.title, col.filterType, col.filterVal)}
            style={{
              background: '#FFFFFF',
              border: '1px solid #E7E5E4',
              borderRadius: '18px',
              overflow: 'hidden',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 4px 20px -4px rgba(24, 24, 27, 0.05)',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            className="architectural-collection-card"
          >
            <div style={{ position: 'relative', height: '210px', width: '100%', overflow: 'hidden', background: '#F5F5F4' }}>
              <img
                src={col.image}
                alt={col.title}
                loading="lazy"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.45s ease'
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg, rgba(24,24,27,0.05) 0%, rgba(24,24,27,0.45) 100%)'
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  background: 'rgba(24, 24, 27, 0.82)',
                  backdropFilter: 'blur(8px)',
                  color: '#F3E5AB',
                  border: '1px solid rgba(197, 160, 89, 0.4)',
                  padding: '4px 10px',
                  borderRadius: '999px',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  letterSpacing: '0.03em'
                }}
              >
                {col.tag}
              </span>
            </div>

            <div
              style={{
                padding: '18px 20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '14px',
                flex: 1
              }}
            >
              <div>
                <h3
                  style={{
                    fontSize: '1.12rem',
                    fontWeight: 800,
                    color: '#242424',
                    margin: '0 0 6px 0',
                    fontFamily: 'var(--font-title, "Outfit", sans-serif)'
                  }}
                >
                  {col.title}
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#57534E', margin: 0, lineHeight: 1.5 }}>
                  {col.subtitle}
                </p>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '12px',
                  borderTop: '1px solid #F5F5F4'
                }}
              >
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#B38E47' }}>
                  Koleksiyonu Keşfet
                </span>
                <span
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: '#FAF9F6',
                    border: '1px solid #E7E5E4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#242424'
                  }}
                >
                  <ArrowRight size={14} />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * SECTION 8: LİDER SERAMİK MARKALARI
 * Horizontal interactive brand showcase using real brand data & authentic brand links.
 */
export function LeadingBrandsSection({ brands = [], selectedBrand, onSelectBrand }) {
  const featuredNames = [
    'NG Kütahya Seramik',
    'Bien Seramik',
    'Ege Seramik',
    'VitrA',
    'Güral Seramik',
    'QUA Granite',
    'Yurtbay Seramik',
    'Çanakkale Seramik'
  ];

  const displayBrands = brands.length > 0
    ? brands.filter((b) => b.name?.toLowerCase() !== 'kalebodur')
    : featuredNames.map((name, i) => ({ id: `brand-${i}`, name, slug: slugify(name) }));

  return (
    <section
      id="leading-brands-section"
      style={{
        margin: '44px 0',
        padding: '28px 26px',
        background: '#FFFFFF',
        border: '1px solid #E7E5E4',
        borderRadius: '20px',
        boxShadow: '0 4px 18px -4px rgba(24, 24, 27, 0.04)'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '20px'
        }}
      >
        <div>
          <span
            style={{
              fontSize: '0.68rem',
              fontWeight: 800,
              color: '#B38E47',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              display: 'block',
              marginBottom: '4px'
            }}
          >
            TÜRKİYE&apos;NİN ÖNCÜ ÜRETİCİLERİ TEK PLATFORMDA
          </span>
          <h2
            style={{
              fontSize: '1.35rem',
              fontWeight: 900,
              color: '#242424',
              margin: 0,
              fontFamily: 'var(--font-title, "Outfit", sans-serif)'
            }}
          >
            Lider Seramik Markaları
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {selectedBrand && (
            <button
              type="button"
              onClick={() => onSelectBrand('')}
              style={{
                background: '#FAF9F6',
                border: '1px solid #D6D3CD',
                color: '#242424',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Tüm Markaları Göster ✕
            </button>
          )}
        </div>
      </div>

      {/* Horizontal Scrollable Brand Cards */}
      <div
        style={{
          display: 'flex',
          alignItems: 'stretch',
          gap: '12px',
          overflowX: 'auto',
          paddingBottom: '8px',
          scrollbarWidth: 'thin'
        }}
      >
        {displayBrands.map((brand) => {
          const isSelected = selectedBrand === brand.id;
          const brandSlug = brand.slug || slugify(brand.name || 'marka');
          return (
            <div
              key={brand.id}
              style={{
                minWidth: '205px',
                background: isSelected ? '#242424' : '#FAF9F6',
                border: isSelected ? '1.5px solid #D4AF37' : '1px solid #E7E5E4',
                borderRadius: '14px',
                padding: '14px 16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '12px',
                flexShrink: 0,
                transition: 'all 0.2s ease'
              }}
            >
              <div
                onClick={() => onSelectBrand(isSelected ? '' : brand.id)}
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}
              >
                {brand.logoUrl ? (
                  <img
                    src={brand.logoUrl}
                    alt={brand.name}
                    loading="lazy"
                    style={{
                      maxHeight: '28px',
                      maxWidth: '120px',
                      objectFit: 'contain',
                      filter: isSelected ? 'brightness(1.2)' : 'none'
                    }}
                  />
                ) : (
                  <span
                    style={{
                      fontSize: '0.9rem',
                      fontWeight: 900,
                      color: isSelected ? '#FAF9F6' : '#242424',
                      letterSpacing: '0.02em',
                      fontFamily: 'var(--font-title, "Outfit", sans-serif)'
                    }}
                  >
                    {brand.name}
                  </span>
                )}
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: isSelected ? '#D4AF37' : '#D6D3CD',
                    flexShrink: 0
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', paddingTop: '8px', borderTop: isSelected ? '1px solid rgba(255,255,255,0.12)' : '1px solid #E7E5E4' }}>
                <button
                  type="button"
                  onClick={() => onSelectBrand(isSelected ? '' : brand.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: 0,
                    color: isSelected ? '#F3E5AB' : '#57534E',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {isSelected ? '✓ Seçili Marka' : 'Modelleri Filtrele'}
                </button>

                <Link
                  href={`/marka/${brandSlug}`}
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    color: '#B38E47',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px'
                  }}
                >
                  <span>Sayfa</span>
                  <ChevronRight size={12} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/**
 * SECTION 10: YETKİLİ BAYİ AĞI
 * Integrated city & dealer search block on the homepage.
 */
export function AuthorizedDealerNetworkSection({
  brands = [],
  userLocationName,
  onSelectCityAndOpenDealers
}) {
  const [selectedCityName, setSelectedCityName] = useState(
    (userLocationName || 'İstanbul').replace(' Merkez', '').replace(' Showroom', '').trim() || 'İstanbul'
  );
  const [selectedBrandId, setSelectedBrandId] = useState('');

  return (
    <section
      id="authorized-dealer-network-section"
      style={{
        margin: '48px 0',
        background: '#FFFFFF',
        border: '1px solid #E7E5E4',
        borderRadius: '22px',
        padding: 'clamp(24px, 3.5vw, 40px)',
        boxShadow: '0 8px 30px -6px rgba(24, 24, 27, 0.05)'
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '28px',
          alignItems: 'center'
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '999px',
              background: 'rgba(179, 142, 71, 0.12)',
              color: '#926F28',
              fontSize: '0.7rem',
              fontWeight: 800,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: '12px'
            }}
          >
            <MapPin size={13} />
            <span>TÜRKİYE GENELİ YETKİLİ SATIŞ NOKTALARI</span>
          </div>

          <h2
            style={{
              fontSize: 'clamp(1.45rem, 2.5vw, 2rem)',
              fontWeight: 900,
              color: '#242424',
              margin: '0 0 10px 0',
              letterSpacing: '-0.02em',
              fontFamily: 'var(--font-title, "Outfit", sans-serif)'
            }}
          >
            Size En Yakın Yetkili Bayiyi Bulun.
          </h2>
          <p style={{ fontSize: '0.92rem', color: '#57534E', margin: '0 0 20px 0', lineHeight: 1.6 }}>
            Türkiye genelindeki yetkili satış noktalarını keşfedin. Projeniz için size en yakın bayiden doğrudan fiyat ve stok teklifi alın.
          </p>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya'].map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => {
                  setSelectedCityName(city);
                  onSelectCityAndOpenDealers(city, selectedBrandId);
                }}
                style={{
                  background: selectedCityName === city ? '#242424' : '#FAF9F6',
                  color: selectedCityName === city ? '#F3E5AB' : '#57534E',
                  border: '1px solid #E7E5E4',
                  padding: '6px 13px',
                  borderRadius: '999px',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                📍 {city}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive City & Brand Finder Box */}
        <div
          style={{
            background: '#FAF9F6',
            border: '1px solid #E7E5E4',
            borderRadius: '18px',
            padding: '22px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '0.74rem', fontWeight: 800, color: '#242424' }}>İl Seçimi</label>
              <select
                value={selectedCityName}
                onChange={(e) => setSelectedCityName(e.target.value)}
                style={{
                  height: '42px',
                  padding: '0 12px',
                  borderRadius: '10px',
                  border: '1px solid #D6D3CD',
                  background: '#FFFFFF',
                  color: '#242424',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  outline: 'none'
                }}
              >
                {TURKEY_CITIES.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '0.74rem', fontWeight: 800, color: '#242424' }}>Marka (İsteğe Bağlı)</label>
              <select
                value={selectedBrandId}
                onChange={(e) => setSelectedBrandId(e.target.value)}
                style={{
                  height: '42px',
                  padding: '0 12px',
                  borderRadius: '10px',
                  border: '1px solid #D6D3CD',
                  background: '#FFFFFF',
                  color: '#242424',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  outline: 'none'
                }}
              >
                <option value="">Tüm Yetkili Markalar</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '4px' }}>
            <button
              type="button"
              onClick={() => onSelectCityAndOpenDealers(selectedCityName, selectedBrandId)}
              style={{
                flex: 1,
                height: '44px',
                background: 'linear-gradient(135deg, #242424 0%, #18181B 100%)',
                color: '#F3E5AB',
                border: '1px solid #D4AF37',
                borderRadius: '11px',
                fontSize: '0.86rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <MapPin size={16} style={{ color: '#D4AF37' }} />
              <span>Haritada Yetkili Bayileri Göster</span>
              <ArrowRight size={15} />
            </button>

            <Link
              href="/bayiler"
              style={{
                height: '44px',
                padding: '0 16px',
                background: '#FFFFFF',
                color: '#242424',
                border: '1px solid #D6D3CD',
                borderRadius: '11px',
                fontSize: '0.82rem',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              Tüm Bayi Dizini
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * SECTION 11: MİMARLAR VE PROFESYONELLER
 * Dedicated architectural library showcase for architects, interior designers, and project firms.
 */
export function ArchitectsProfessionalsSection() {
  return (
    <section
      id="architects-professionals-section"
      style={{
        margin: '48px 0',
        borderRadius: '22px',
        background: 'linear-gradient(135deg, #242424 0%, #18181B 100%)',
        border: '1px solid rgba(197, 160, 89, 0.35)',
        padding: 'clamp(28px, 4vw, 44px)',
        color: '#FAF9F6',
        boxShadow: '0 20px 50px -15px rgba(24, 24, 27, 0.18)'
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '32px',
          alignItems: 'center'
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '999px',
              background: 'rgba(197, 160, 89, 0.16)',
              border: '1px solid rgba(197, 160, 89, 0.38)',
              color: '#F3E5AB',
              fontSize: '0.7rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '14px'
            }}
          >
            <Compass size={13} />
            <span>MİMARLAR, İÇ MİMARLAR VE PROJE FİRMALARI</span>
          </div>

          <h2
            style={{
              fontSize: 'clamp(1.6rem, 2.8vw, 2.25rem)',
              fontWeight: 900,
              color: '#FAF9F6',
              margin: '0 0 12px 0',
              lineHeight: 1.18,
              letterSpacing: '-0.02em',
              fontFamily: 'var(--font-title, "Outfit", sans-serif)'
            }}
          >
            Profesyonel Projeler İçin
            <br />
            <span style={{ color: '#D4AF37' }}>Dijital Seramik Kütüphanesi.</span>
          </h2>

          <p style={{ fontSize: '0.92rem', color: '#D6D3CD', lineHeight: 1.65, margin: '0 0 24px 0', maxWidth: '520px' }}>
            Konut, otel ve ticari projeleriniz için üretici markaların teknik şartname verilerine, yüksek çözünürlüklü PBR yüzey dokularına ve toplu proje ihale havuzuna tek merkezden erişin.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <Link
              href="/mimar"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #B38E47 0%, #D4AF37 100%)',
                color: '#18181B',
                padding: '13px 24px',
                borderRadius: '11px',
                fontSize: '0.88rem',
                fontWeight: 800,
                textDecoration: 'none',
                boxShadow: '0 8px 20px rgba(179, 142, 71, 0.28)'
              }}
            >
              <Compass size={16} />
              <span>Mimar Portalı</span>
              <ArrowRight size={15} />
            </Link>

            <Link
              href="/proje-talep"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(250, 249, 246, 0.08)',
                color: '#FAF9F6',
                border: '1px solid rgba(250, 249, 246, 0.2)',
                padding: '13px 20px',
                borderRadius: '11px',
                fontSize: '0.86rem',
                fontWeight: 700,
                textDecoration: 'none'
              }}
            >
              <Building2 size={16} style={{ color: '#D4AF37' }} />
              <span>B2B Proje & İhale Talebi</span>
            </Link>
          </div>
        </div>

        {/* Right: 4 Architectural Feature Boxes */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '14px'
          }}
        >
          {[
            {
              title: 'Geniş Ürün Koleksiyonları',
              desc: 'Lider üreticilerin büyük ebat porselen ve teknik granit serileri.',
              icon: <Layers size={18} />
            },
            {
              title: 'Teknik Ürün Bilgileri',
              desc: 'PEI aşınma sınıfı, R9–R11 kaymazlık, kalınlık ve rektifiye verileri.',
              icon: <FileText size={18} />
            },
            {
              title: '3D Tasarım & Sunum',
              desc: 'Müşteri sunumları için moodboard, 3D mekan ve metraj reçetesi.',
              icon: <Box size={18} />
            },
            {
              title: 'BIM & CAD Kaynakları',
              desc: 'Revit, AutoCAD, ArchiCAD ve 3ds Max uyumlu kesintisiz dokular.',
              icon: <Compass size={18} />
            }
          ].map((feat, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(250, 249, 246, 0.05)',
                border: '1px solid rgba(250, 249, 246, 0.1)',
                borderRadius: '14px',
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(197, 160, 89, 0.18)',
                  color: '#F3E5AB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {feat.icon}
              </div>
              <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#FAF9F6' }}>
                {feat.title}
              </h4>
              <p style={{ margin: 0, fontSize: '0.76rem', color: '#A8A29E', lineHeight: 1.45 }}>
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * SECTION 14: İLHAM GALERİSİ
 * Architectural room applications (Banyo, Mutfak, Salon, Dış Mekân / Teras) linking to collections.
 */
export function InspirationGallerySection({ onSelectInspiration }) {
  const galleryItems = [
    {
      id: 'banyo-calacatta',
      space: 'Banyo Mimarisi',
      title: 'Calacatta Gold & Doğal Meşe Banyo',
      material: '60×120 Full Lappato Mermer Porselen',
      image: '/hero/wide_luxury_bathroom.jpg',
      query: 'Mermer',
      filterType: 'style'
    },
    {
      id: 'mutfak-iskandinav',
      space: 'Mutfak & Tezgah Arası',
      title: 'İskandinav Traverten & Sıcak Bej Mutfak',
      material: '60×120 Doğal Traverten Dokulu Karo',
      image: '/hero/scandinavian_kitchen.png',
      query: 'Traverten',
      filterType: 'style'
    },
    {
      id: 'salon-modern',
      space: 'Salon & Yaşam Alanı',
      title: 'Modern Loft & Geniş Ebat Beton Zemin',
      material: '80×160 Mat Antrasit Beton Porselen',
      image: '/hero/modern_living.png',
      query: 'Beton',
      filterType: 'style'
    },
    {
      id: 'dis-mekan-teras',
      space: 'Dış Mekân & Teras',
      title: 'R11 Kaymaz Doğal Taş & Ahşap Teras',
      material: '20×120 Dona Dayanıklı Dış Mekân Serisi',
      image: '/hero/wide_terrace.jpg',
      query: 'Ahşap',
      filterType: 'style'
    }
  ];

  return (
    <section id="inspiration-gallery-section" style={{ margin: '48px 0' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '22px'
        }}
      >
        <div>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              color: '#B38E47',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              display: 'block',
              marginBottom: '6px'
            }}
          >
            MEKÂN UYGULAMALARI VE MİMARİ STİLLER
          </span>
          <h2
            style={{
              fontSize: 'clamp(1.45rem, 2.5vw, 2rem)',
              fontWeight: 900,
              color: '#242424',
              margin: 0,
              letterSpacing: '-0.02em',
              fontFamily: 'var(--font-title, "Outfit", sans-serif)'
            }}
          >
            İlham Galerisi
          </h2>
        </div>

        <Link
          href="/ilham"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.84rem',
            fontWeight: 800,
            color: '#B38E47',
            textDecoration: 'none'
          }}
        >
          <span>Tüm İlham & Trend Galerisini Gör</span>
          <ArrowRight size={15} />
        </Link>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
          gap: '18px'
        }}
      >
        {galleryItems.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelectInspiration(item.query, item.filterType, item.query)}
            style={{
              position: 'relative',
              height: '290px',
              borderRadius: '18px',
              overflow: 'hidden',
              cursor: 'pointer',
              border: '1px solid #E7E5E4',
              boxShadow: '0 6px 20px -4px rgba(24, 24, 27, 0.08)'
            }}
            className="architectural-collection-card"
          >
            <img
              src={item.image}
              alt={item.title}
              loading="lazy"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.45s ease'
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, rgba(24,24,27,0.08) 0%, rgba(24,24,27,0.86) 100%)'
              }}
            />
            <span
              style={{
                position: 'absolute',
                top: '14px',
                left: '14px',
                background: 'rgba(250, 249, 246, 0.92)',
                color: '#242424',
                padding: '4px 10px',
                borderRadius: '999px',
                fontSize: '0.68rem',
                fontWeight: 800
              }}
            >
              {item.space}
            </span>

            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '18px',
                color: '#FAF9F6'
              }}
            >
              <div style={{ fontSize: '0.72rem', color: '#F3E5AB', fontWeight: 700, marginBottom: '3px' }}>
                {item.material}
              </div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.02rem', fontWeight: 800, color: '#FAF9F6', lineHeight: 1.25 }}>
                {item.title}
              </h3>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  color: '#D4AF37'
                }}
              >
                <span>Bu Dokuyu Keşfet</span>
                <ArrowRight size={13} />
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
