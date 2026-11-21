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
        margin: '32px 0',
        borderRadius: '22px',
        background: 'linear-gradient(135deg, var(--sb-surface-dark, #252522) 0%, #1E1D1A 100%)',
        border: '1px solid rgba(181, 139, 80, 0.35)',
        overflow: 'hidden',
        boxShadow: '0 20px 50px -15px rgba(37, 37, 34, 0.2)',
        color: '#F6F3EE'
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
                background: 'rgba(181, 139, 80, 0.16)',
                border: '1px solid rgba(181, 139, 80, 0.42)',
                color: '#D8C9B5',
                fontSize: '0.72rem',
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '18px'
              }}
            >
              <Sparkles size={13} style={{ color: 'var(--sb-accent-bronze, #B58B50)' }} />
              <span>AI DESTEKLİ DİJİTAL SERAMİK STÜDYOSU</span>
            </div>

            <h2
              style={{
                fontSize: 'clamp(1.75rem, 3.2vw, 2.5rem)',
                fontWeight: 900,
                color: '#F6F3EE',
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
                  background: 'linear-gradient(135deg, #EAE5DC 0%, #D8C9B5 45%, #B58B50 100%)',
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
                color: '#D8C9B5',
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
                  background: 'rgba(246, 243, 238, 0.05)',
                  border: '1px solid rgba(216, 201, 181, 0.14)',
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
                      background: 'rgba(181, 139, 80, 0.18)',
                      color: '#D8C9B5',
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
                      color: 'rgba(216, 201, 181, 0.5)',
                      letterSpacing: '0.05em'
                    }}
                  >
                    ADIM {step.num}
                  </span>
                </div>
                <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#F6F3EE', lineHeight: 1.3 }}>
                  {step.title}
                </div>
                <div style={{ fontSize: '0.73rem', color: '#B8B2A6', lineHeight: 1.4 }}>
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
                background: 'linear-gradient(135deg, #B58B50 0%, #C99F63 100%)',
                color: '#252522',
                padding: '14px 26px',
                borderRadius: '12px',
                fontSize: '0.92rem',
                fontWeight: 800,
                textDecoration: 'none',
                boxShadow: '0 10px 25px rgba(181, 139, 80, 0.28)',
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
                background: 'rgba(246, 243, 238, 0.08)',
                color: '#F6F3EE',
                border: '1px solid rgba(216, 201, 181, 0.25)',
                padding: '14px 22px',
                borderRadius: '12px',
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <Box size={16} style={{ color: 'var(--sb-accent-bronze, #B58B50)' }} />
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
              background: 'linear-gradient(180deg, rgba(37,37,34,0.08) 0%, rgba(37,37,34,0.72) 100%)'
            }}
          />

          {/* Floating Material Specification Pill on Visual */}
          <div
            style={{
              position: 'relative',
              zIndex: 2,
              width: '100%',
              background: 'rgba(37, 37, 34, 0.88)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(181, 139, 80, 0.42)',
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
                  border: '1.5px solid var(--sb-accent-bronze, #B58B50)'
                }}
              />
              <div>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#D8C9B5', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  CANLI AI PERSPEKTİF MOTORU
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#F6F3EE' }}>
                  60×120 Rektifiyeli Porselen & Doğal Işık Koruma
                </div>
              </div>
            </div>
            <Link
              href="/mekanimda-gor"
              style={{
                background: 'rgba(246, 243, 238, 0.12)',
                border: '1px solid rgba(216, 201, 181, 0.38)',
                color: '#D8C9B5',
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
    <section
      id="popular-collections-section"
      style={{
        margin: '32px 0',
        padding: 'clamp(22px, 3vw, 32px)',
        background: 'var(--sb-bg-primary, #F6F3EE)',
        border: '1px solid var(--sb-border, #E5DED3)',
        borderRadius: '22px'
      }}
    >
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
              color: 'var(--sb-accent-bronze, #B58B50)',
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
              color: 'var(--sb-text-primary, #292824)',
              margin: 0,
              letterSpacing: '-0.02em',
              fontFamily: 'var(--font-title, "Outfit", sans-serif)'
            }}
          >
            Popüler Seramik Koleksiyonları
          </h2>
        </div>
        <p style={{ fontSize: '0.88rem', color: 'var(--sb-text-secondary, #77736B)', margin: 0, maxWidth: '420px' }}>
          Mekânınızın mimari karakterine uygun seramik dokusunu seçin ve tüm üretici modellerini karşılaştırın.
        </p>
      </div>

      <div
        className="popular-collections-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '18px'
        }}
      >
        {collections.map((col) => (
          <div
            key={col.id}
            onClick={() => onSelectCollection(col.title, col.filterType, col.filterVal)}
            style={{
              background: 'var(--sb-surface, #FFFFFF)',
              border: '1px solid var(--sb-border, #E5DED3)',
              borderRadius: '18px',
              overflow: 'hidden',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 4px 18px -4px rgba(41, 40, 36, 0.05)',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            className="architectural-collection-card"
          >
            <div style={{ position: 'relative', height: '210px', width: '100%', overflow: 'hidden', background: 'var(--sb-bg-secondary, #EAE5DC)' }}>
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
                  background: 'linear-gradient(180deg, rgba(37,37,34,0.04) 0%, rgba(37,37,34,0.4) 100%)'
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  background: 'rgba(37, 37, 34, 0.85)',
                  backdropFilter: 'blur(8px)',
                  color: '#F6F3EE',
                  border: '1px solid rgba(181, 139, 80, 0.45)',
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
                    color: 'var(--sb-text-primary, #292824)',
                    margin: '0 0 6px 0',
                    fontFamily: 'var(--font-title, "Outfit", sans-serif)'
                  }}
                >
                  {col.title}
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--sb-text-secondary, #77736B)', margin: 0, lineHeight: 1.5 }}>
                  {col.subtitle}
                </p>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '12px',
                  borderTop: '1px solid var(--sb-border, #E5DED3)'
                }}
              >
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--sb-accent-bronze, #B58B50)' }}>
                  Koleksiyonu Keşfet
                </span>
                <span
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: 'var(--sb-bg-primary, #F6F3EE)',
                    border: '1px solid var(--sb-border, #E5DED3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--sb-text-primary, #292824)'
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
function BrandCardLogo({ brand, isSelected }) {
  const [logoFailed, setLogoFailed] = useState(false);

  // Known broken seed placeholder paths (/logos/xxx.png) that do not exist in public/
  const hasValidLogo =
    brand?.logoUrl &&
    !logoFailed &&
    !brand.logoUrl.startsWith('/logos/');

  const getBrandTypographyStyle = (name = '') => {
    const lower = name.toLowerCase();
    if (lower.includes('vitra')) {
      return { fontWeight: 900, fontStyle: 'italic', fontSize: '1.15rem', letterSpacing: '-0.02em' };
    }
    if (lower.includes('qua')) {
      return { fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', fontSize: '0.88rem' };
    }
    if (lower.includes('bien')) {
      return { fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '0.88rem', color: isSelected ? '#F3E5AB' : '#926F28' };
    }
    if (lower.includes('kütahya') || lower.includes('kutahya')) {
      return { fontWeight: 900, letterSpacing: '0.04em', textTransform: 'uppercase', fontSize: '0.84rem' };
    }
    return { fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', fontSize: '0.86rem' };
  };

  const initials = (brand?.name || 'SB')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minHeight: '34px', minWidth: 0 }}>
      {hasValidLogo ? (
        <img
          src={brand.logoUrl}
          alt={brand.name}
          loading="lazy"
          onError={() => setLogoFailed(true)}
          style={{
            maxHeight: '30px',
            maxWidth: '130px',
            objectFit: 'contain',
            filter: isSelected ? 'brightness(1.15)' : 'none'
          }}
        />
      ) : (
        <>
          <span
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '9px',
              background: isSelected
                ? 'rgba(181, 139, 80, 0.22)'
                : 'linear-gradient(135deg, #252522 0%, #3A3832 100%)',
              border: '1px solid rgba(181, 139, 80, 0.45)',
              color: '#D8C9B5',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.72rem',
              fontWeight: 900,
              letterSpacing: '0.04em',
              flexShrink: 0
            }}
          >
            {initials}
          </span>
          <span
            style={{
              color: isSelected ? '#F6F3EE' : 'var(--sb-text-primary, #292824)',
              fontFamily: 'var(--font-title, "Outfit", sans-serif)',
              lineHeight: 1.2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              ...getBrandTypographyStyle(brand?.name)
            }}
          >
            {brand?.name}
          </span>
        </>
      )}
    </div>
  );
}

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
        margin: '32px 0',
        padding: '28px 26px',
        background: 'var(--sb-surface, #FFFFFF)',
        border: '1px solid var(--sb-border, #E5DED3)',
        borderRadius: '22px',
        boxShadow: '0 4px 18px -4px rgba(41, 40, 36, 0.04)'
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
              color: 'var(--sb-accent-bronze, #B58B50)',
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
              color: 'var(--sb-text-primary, #292824)',
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
                background: 'var(--sb-bg-primary, #F6F3EE)',
                border: '1px solid var(--sb-border, #E5DED3)',
                color: 'var(--sb-text-primary, #292824)',
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
                minWidth: '220px',
                background: isSelected ? 'var(--sb-surface-dark, #252522)' : 'var(--sb-bg-primary, #F6F3EE)',
                border: isSelected ? '1.5px solid var(--sb-accent-bronze, #B58B50)' : '1px solid var(--sb-border, #E5DED3)',
                borderRadius: '16px',
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
                <BrandCardLogo brand={brand} isSelected={isSelected} />
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: isSelected ? 'var(--sb-accent-bronze, #B58B50)' : 'var(--sb-warm-beige, #D8C9B5)',
                    flexShrink: 0
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', paddingTop: '8px', borderTop: isSelected ? '1px solid rgba(246, 243, 238, 0.14)' : '1px solid var(--sb-border, #E5DED3)' }}>
                <button
                  type="button"
                  onClick={() => onSelectBrand(isSelected ? '' : brand.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: 0,
                    color: isSelected ? '#D8C9B5' : 'var(--sb-text-secondary, #77736B)',
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
                    color: 'var(--sb-accent-bronze, #B58B50)',
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
        margin: '32px 0',
        background: 'var(--sb-bg-secondary, #EAE5DC)',
        border: '1px solid var(--sb-border, #E5DED3)',
        borderRadius: '22px',
        padding: 'clamp(24px, 3.5vw, 40px)',
        boxShadow: '0 8px 26px -6px rgba(41, 40, 36, 0.05)'
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
              background: 'rgba(181, 139, 80, 0.14)',
              border: '1px solid rgba(181, 139, 80, 0.3)',
              color: '#8E6832',
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
              color: 'var(--sb-text-primary, #292824)',
              margin: '0 0 10px 0',
              letterSpacing: '-0.02em',
              fontFamily: 'var(--font-title, "Outfit", sans-serif)'
            }}
          >
            Size En Yakın Yetkili Bayiyi Bulun.
          </h2>
          <p style={{ fontSize: '0.92rem', color: 'var(--sb-text-secondary, #77736B)', margin: '0 0 20px 0', lineHeight: 1.6 }}>
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
                  background: selectedCityName === city ? 'var(--sb-surface-dark, #252522)' : 'var(--sb-surface, #FFFFFF)',
                  color: selectedCityName === city ? '#F6F3EE' : 'var(--sb-text-secondary, #77736B)',
                  border: selectedCityName === city ? '1px solid var(--sb-accent-bronze, #B58B50)' : '1px solid var(--sb-border, #E5DED3)',
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
            background: 'var(--sb-surface, #FFFFFF)',
            border: '1px solid var(--sb-border, #E5DED3)',
            borderRadius: '18px',
            padding: '22px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            boxShadow: '0 4px 16px rgba(41, 40, 36, 0.04)'
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--sb-text-primary, #292824)' }}>İl Seçimi</label>
              <select
                value={selectedCityName}
                onChange={(e) => setSelectedCityName(e.target.value)}
                style={{
                  height: '42px',
                  padding: '0 12px',
                  borderRadius: '10px',
                  border: '1px solid var(--sb-border, #E5DED3)',
                  background: 'var(--sb-bg-primary, #F6F3EE)',
                  color: 'var(--sb-text-primary, #292824)',
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
              <label style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--sb-text-primary, #292824)' }}>Marka (İsteğe Bağlı)</label>
              <select
                value={selectedBrandId}
                onChange={(e) => setSelectedBrandId(e.target.value)}
                style={{
                  height: '42px',
                  padding: '0 12px',
                  borderRadius: '10px',
                  border: '1px solid var(--sb-border, #E5DED3)',
                  background: 'var(--sb-bg-primary, #F6F3EE)',
                  color: 'var(--sb-text-primary, #292824)',
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
                background: 'var(--sb-surface-dark, #252522)',
                color: '#F6F3EE',
                border: '1px solid var(--sb-accent-bronze, #B58B50)',
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
              <MapPin size={16} style={{ color: 'var(--sb-accent-bronze, #B58B50)' }} />
              <span>Haritada Yetkili Bayileri Göster</span>
              <ArrowRight size={15} />
            </button>

            <Link
              href="/bayiler"
              style={{
                height: '44px',
                padding: '0 16px',
                background: 'var(--sb-bg-primary, #F6F3EE)',
                color: 'var(--sb-text-primary, #292824)',
                border: '1px solid var(--sb-border, #E5DED3)',
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
        margin: '32px 0',
        borderRadius: '22px',
        background: 'linear-gradient(135deg, var(--sb-surface-dark, #252522) 0%, #1E1D1A 100%)',
        border: '1px solid rgba(181, 139, 80, 0.35)',
        padding: 'clamp(28px, 4vw, 44px)',
        color: '#F6F3EE',
        boxShadow: '0 20px 50px -15px rgba(37, 37, 34, 0.2)'
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
              background: 'rgba(181, 139, 80, 0.16)',
              border: '1px solid rgba(181, 139, 80, 0.42)',
              color: '#D8C9B5',
              fontSize: '0.7rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '14px'
            }}
          >
            <Compass size={13} style={{ color: 'var(--sb-accent-bronze, #B58B50)' }} />
            <span>MİMARLAR, İÇ MİMARLAR VE PROJE FİRMALARI</span>
          </div>

          <h2
            style={{
              fontSize: 'clamp(1.6rem, 2.8vw, 2.25rem)',
              fontWeight: 900,
              color: '#F6F3EE',
              margin: '0 0 12px 0',
              lineHeight: 1.18,
              letterSpacing: '-0.02em',
              fontFamily: 'var(--font-title, "Outfit", sans-serif)'
            }}
          >
            Profesyonel Projeler İçin
            <br />
            <span style={{ color: 'var(--sb-accent-bronze, #B58B50)' }}>Dijital Seramik Kütüphanesi.</span>
          </h2>

          <p style={{ fontSize: '0.92rem', color: '#D8C9B5', lineHeight: 1.65, margin: '0 0 24px 0', maxWidth: '520px' }}>
            Konut, otel ve ticari projeleriniz için üretici markaların teknik şartname verilerine, yüksek çözünürlüklü PBR yüzey dokularına ve toplu proje ihale havuzuna tek merkezden erişin.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <Link
              href="/mimar"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #B58B50 0%, #C99F63 100%)',
                color: '#252522',
                padding: '13px 24px',
                borderRadius: '11px',
                fontSize: '0.88rem',
                fontWeight: 800,
                textDecoration: 'none',
                boxShadow: '0 8px 20px rgba(181, 139, 80, 0.28)'
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
                background: 'rgba(246, 243, 238, 0.08)',
                color: '#F6F3EE',
                border: '1px solid rgba(216, 201, 181, 0.25)',
                padding: '13px 20px',
                borderRadius: '11px',
                fontSize: '0.86rem',
                fontWeight: 700,
                textDecoration: 'none'
              }}
            >
              <Building2 size={16} style={{ color: 'var(--sb-accent-bronze, #B58B50)' }} />
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
                background: 'rgba(246, 243, 238, 0.05)',
                border: '1px solid rgba(216, 201, 181, 0.14)',
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
                  background: 'rgba(181, 139, 80, 0.18)',
                  color: '#D8C9B5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {feat.icon}
              </div>
              <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#F6F3EE' }}>
                {feat.title}
              </h4>
              <p style={{ margin: 0, fontSize: '0.76rem', color: '#B8B2A6', lineHeight: 1.45 }}>
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
    <section
      id="inspiration-gallery-section"
      style={{
        margin: '32px 0',
        padding: 'clamp(22px, 3vw, 32px)',
        background: 'var(--sb-bg-primary, #F6F3EE)',
        border: '1px solid var(--sb-border, #E5DED3)',
        borderRadius: '22px'
      }}
    >
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
              color: 'var(--sb-accent-bronze, #B58B50)',
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
              color: 'var(--sb-text-primary, #292824)',
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
            color: 'var(--sb-accent-bronze, #B58B50)',
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
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
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
              border: '1px solid var(--sb-border, #E5DED3)',
              boxShadow: '0 6px 20px -4px rgba(41, 40, 36, 0.08)'
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
                background: 'linear-gradient(180deg, rgba(37,37,34,0.06) 0%, rgba(37,37,34,0.84) 100%)'
              }}
            />
            <span
              style={{
                position: 'absolute',
                top: '14px',
                left: '14px',
                background: 'rgba(246, 243, 238, 0.94)',
                color: 'var(--sb-text-primary, #292824)',
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
                color: '#F6F3EE'
              }}
            >
              <div style={{ fontSize: '0.72rem', color: '#D8C9B5', fontWeight: 700, marginBottom: '3px' }}>
                {item.material}
              </div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.02rem', fontWeight: 800, color: '#F6F3EE', lineHeight: 1.25 }}>
                {item.title}
              </h3>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  color: 'var(--sb-accent-bronze, #B58B50)'
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
