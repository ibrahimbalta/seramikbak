'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import BackToHomeButton from '@/components/BackToHomeButton';
import {
  Sparkles,
  Building2,
  ShieldCheck,
  Heart,
  Award,
  Cpu,
  Globe,
  Search,
  Box,
  BarChart3,
  ArrowRight,
  Layers,
  MapPin,
  CheckCircle2,
  Compass
} from 'lucide-react';

export default function AboutUsPage() {
  const [aboutData, setAboutData] = useState({
    hero_title: 'Seramik Seçimini Yeniden Tanımlıyoruz',
    hero_subtitle:
      'SeramikBak; üreticileri, yetkili bayileri, mimarları ve tasarım severleri yapay zeka, Web 3D ve artırılmış gerçeklik teknolojileriyle buluşturan bağımsız dijital showroom ve B2B ticaret ekosistemidir.',
    mission:
      'Tüm yerel ve küresel markaların kataloglarını zengin teknik detaylarla tek bir arama motorunda birleştirmek; bayilerin potansiyel müşterilere zahmetsizce ulaşabileceği B2B SaaS araçları sunmak ve tüketicilerin hayallerindeki mimari tasarımları şeffaf fiyat teklifleriyle gerçeğe dönüştürmek.',
    vision:
      'Geleneksel ve zahmetli olan seramik alışverişi sürecini, fiziksel mağazalarda kaybolmadan tamamen dijital, hızlı ve kusursuz bir deneyime dönüştürmek. 3D modelleme ve yapay zeka ile müşterilerin kendi mekânlarında seramikleri canlı deneyimlemesini sağlayarak sektörün küresel dijital lideri olmak.',
    stats: [
      { num: '17+', label: 'Lider Marka & Üretici' },
      { num: '10.000+', label: 'Aktif Seramik & Karo Ürünü' },
      { num: '500+', label: 'Türkiye Geneli Yetkili Bayi' },
      { num: '2.5 Sn', label: 'AI Destekli Arama & Öneri Hızı' }
    ]
  });

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.page_about_content) {
          setAboutData(data.page_about_content);
        }
      })
      .catch((err) => console.error('Failed to load about settings:', err));
  }, []);

  const statAccents = [
    { color: '#C5A04B', bg: 'rgba(197, 160, 75, 0.12)', icon: <Building2 size={18} /> },
    { color: '#6338F5', bg: 'rgba(99, 56, 245, 0.10)', icon: <Layers size={18} /> },
    { color: '#10A37F', bg: 'rgba(16, 163, 127, 0.12)', icon: <MapPin size={18} /> },
    { color: '#2563EB', bg: 'rgba(37, 99, 235, 0.10)', icon: <Sparkles size={18} /> }
  ];

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #F7F5F0 0%, #FFFFFF 45%, #F4F1EA 100%)',
        fontFamily: 'var(--font-body, "Plus Jakarta Sans", system-ui, sans-serif)',
        color: '#202938',
        position: 'relative',
        overflowX: 'hidden'
      }}
    >
      {/* Top Architectural Header */}
      <header
        style={{
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid #E5DFD5',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          boxShadow: '0 4px 24px rgba(17, 24, 39, 0.04)'
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '12px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <BackToHomeButton compactOnMobile />

          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '9px', textDecoration: 'none', color: '#111827' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #182030 0%, #0b0f19 100%)',
                color: '#F3E5AB',
                border: '1.5px solid #C5A04B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '0.92rem',
                boxShadow: '0 3px 10px rgba(17, 24, 39, 0.2)'
              }}
            >
              SB
            </div>
            <span style={{ fontSize: '1.08rem', fontWeight: 900, letterSpacing: '-0.02em' }}>SeramikBak</span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link
              href="/global-tanitim"
              className="about-header-secondary"
              style={{
                padding: '8px 14px',
                borderRadius: '10px',
                border: '1px solid #E2D9C8',
                background: '#FAF8F4',
                color: '#202938',
                fontSize: '0.8rem',
                fontWeight: 700,
                textDecoration: 'none',
                whiteSpace: 'nowrap'
              }}
            >
              Global İhracat
            </Link>
            <Link
              href="/iletisim"
              style={{
                padding: '8px 14px',
                borderRadius: '10px',
                background: '#111827',
                color: '#F3E5AB',
                fontSize: '0.8rem',
                fontWeight: 800,
                textDecoration: 'none',
                whiteSpace: 'nowrap'
              }}
            >
              İletişim
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '32px 20px 88px 20px',
          position: 'relative',
          zIndex: 1
        }}
      >
        {/* 1. ARCHITECTURAL DARK HERO BANNER */}
        <section
          className="about-hero-card"
          style={{
            position: 'relative',
            borderRadius: '26px',
            overflow: 'hidden',
            padding: '54px 48px',
            marginBottom: '32px',
            background: '#111827',
            border: '1px solid rgba(197, 160, 75, 0.35)',
            boxShadow: '0 24px 56px -14px rgba(17, 24, 39, 0.28)',
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.35fr) minmax(0, 0.9fr)',
            gap: '36px',
            alignItems: 'center'
          }}
        >
          <img
            src="/hero/wide_luxury_bathroom.jpg"
            alt="SeramikBak Mimari Showroom"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.28,
              zIndex: 0
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(95deg, rgba(17, 24, 39, 0.97) 0%, rgba(17, 24, 39, 0.88) 55%, rgba(24, 32, 48, 0.72) 100%)',
              zIndex: 1
            }}
          />

          <div style={{ position: 'relative', zIndex: 2 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                background: 'rgba(197, 160, 75, 0.16)',
                border: '1px solid rgba(212, 175, 55, 0.4)',
                color: '#F3E5AB',
                padding: '6px 14px',
                borderRadius: '999px',
                fontSize: '0.72rem',
                fontWeight: 800,
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
                marginBottom: '18px'
              }}
            >
              <Sparkles size={13} />
              <span>GELECEĞİN DİJİTAL SHOWROOM PLATFORMU</span>
            </div>

            <h1
              style={{
                fontSize: 'clamp(1.85rem, 4vw, 2.95rem)',
                fontWeight: 900,
                lineHeight: 1.14,
                letterSpacing: '-0.03em',
                color: '#FFFFFF',
                margin: '0 0 18px 0',
                fontFamily: 'var(--font-title, "Outfit", sans-serif)'
              }}
            >
              {aboutData.hero_title.includes('Yeniden Tanımlıyoruz') ? (
                <>
                  Seramik Seçimini{' '}
                  <span
                    style={{
                      background: 'linear-gradient(135deg, #F3E5AB 0%, #C5A04B 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}
                  >
                    Yeniden Tanımlıyoruz
                  </span>
                </>
              ) : (
                aboutData.hero_title
              )}
            </h1>

            <p
              style={{
                fontSize: '1.02rem',
                lineHeight: 1.65,
                color: '#CBD5E1',
                margin: '0 0 26px 0',
                maxWidth: '620px'
              }}
            >
              {aboutData.hero_subtitle}
            </p>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link
                href="/"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'linear-gradient(135deg, #F5B841 0%, #C5A04B 100%)',
                  color: '#111827',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  textDecoration: 'none',
                  boxShadow: '0 8px 20px rgba(197, 160, 75, 0.3)'
                }}
              >
                <span>Showroom&apos;u Keşfet</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/mekanimda-gor"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.22)',
                  color: '#FFFFFF',
                  padding: '12px 22px',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  textDecoration: 'none',
                  backdropFilter: 'blur(8px)'
                }}
              >
                <span>AI Mekânımda Gör</span>
              </Link>
            </div>
          </div>

          {/* Right: Architectural Trust Highlights Card */}
          <div
            className="about-hero-highlights"
            style={{
              position: 'relative',
              zIndex: 2,
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              borderRadius: '20px',
              padding: '24px',
              backdropFilter: 'blur(14px)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}
          >
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#F3E5AB', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Platform Ekosistem Gücü
            </div>
            {[
              { title: 'AI Görselleştirme & 3D Stüdyo', desc: 'Kendi mekân fotoğrafınızda anında seramik döşeme' },
              { title: '81 İl Yetkili Bayi Ağı', desc: 'Doğrudan stok, numune ve metraj bazlı fiyat teklifi' },
              { title: '5 Dilde Global SEO İhracatı', desc: '85+ ülkedeki mimarlara ve ithalatçılara erişim' },
              { title: 'BIM / Revit & Teknik Şartname', desc: 'Mimarlar için 4K PBR doku ve .rfa dosya desteği' }
            ].map((item) => (
              <div
                key={item.title}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  background: 'rgba(17, 24, 39, 0.55)',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}
              >
                <CheckCircle2 size={16} style={{ color: '#10A37F', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#FFFFFF' }}>{item.title}</div>
                  <div style={{ fontSize: '0.74rem', color: '#94A3B8', marginTop: '2px' }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 2. STATS GRID */}
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            marginBottom: '48px'
          }}
        >
          {aboutData.stats &&
            aboutData.stats.map((stat, idx) => {
              const acc = statAccents[idx % statAccents.length];
              return (
                <div
                  key={idx}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E5DFD5',
                    borderRadius: '18px',
                    padding: '22px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    boxShadow: '0 6px 20px -6px rgba(17, 24, 39, 0.06)'
                  }}
                >
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '13px',
                      background: acc.bg,
                      color: acc.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    {acc.icon}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: '1.65rem',
                        fontWeight: 900,
                        color: '#111827',
                        lineHeight: 1.1,
                        fontFamily: 'var(--font-title, "Outfit", sans-serif)'
                      }}
                    >
                      {stat.num}
                    </div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748B', marginTop: '4px' }}>
                      {stat.label}
                    </div>
                  </div>
                </div>
              );
            })}
        </section>

        {/* 3. VISION & MISSION SPLIT */}
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
            marginBottom: '56px'
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E5DFD5',
              borderTop: '4px solid #C5A04B',
              borderRadius: '20px',
              padding: '32px',
              boxShadow: '0 8px 24px -8px rgba(17, 24, 39, 0.06)'
            }}
          >
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'rgba(197, 160, 75, 0.12)',
                color: '#C5A04B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '18px'
              }}
            >
              <Award size={22} />
            </div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 900, margin: '0 0 12px 0', color: '#111827' }}>Vizyonumuz</h2>
            <p style={{ fontSize: '0.94rem', lineHeight: 1.68, color: '#475569', margin: 0 }}>{aboutData.vision}</p>
          </div>

          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E5DFD5',
              borderTop: '4px solid #111827',
              borderRadius: '20px',
              padding: '32px',
              boxShadow: '0 8px 24px -8px rgba(17, 24, 39, 0.06)'
            }}
          >
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'rgba(17, 24, 39, 0.07)',
                color: '#111827',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '18px'
              }}
            >
              <Cpu size={22} />
            </div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 900, margin: '0 0 12px 0', color: '#111827' }}>Misyonumuz</h2>
            <p style={{ fontSize: '0.94rem', lineHeight: 1.68, color: '#475569', margin: 0 }}>{aboutData.mission}</p>
          </div>
        </section>

        {/* 4. ECOSYSTEM BENEFITS (Kimin İçin Ne Sunuyoruz?) */}
        <section style={{ marginBottom: '60px' }}>
          <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 32px auto' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.72rem',
                fontWeight: 800,
                color: '#B38E47',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '8px'
              }}
            >
              <Compass size={13} />
              <span>BÜTÜNLEŞİK EKOSİSTEM</span>
            </span>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 900, margin: 0, color: '#111827', letterSpacing: '-0.02em' }}>
              Kimin İçin Ne Sunuyoruz?
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
              gap: '20px'
            }}
          >
            {[
              {
                icon: <Heart size={20} />,
                color: '#E11D48',
                bg: 'rgba(225, 29, 72, 0.09)',
                title: 'Tüketiciler & Ev Sahipleri',
                desc: 'Yüzlerce mağaza dolaşmak yerine tüm renk, ebat ve marka seçeneklerini saniyeler içinde karşılaştırın. AI & 3D stüdyo ile kendi banyo veya salonunuzda seramikleri canlı deneyip en yakın bayiden teklif alın.',
                href: '/',
                cta: 'Koleksiyonları Keşfet'
              },
              {
                icon: <Building2 size={20} />,
                color: '#C5A04B',
                bg: 'rgba(197, 160, 75, 0.14)',
                title: 'Markalar & Üreticiler',
                desc: 'Ürünlerinizi dijital ortamda 4K kaliteyle sergileyin. B2B marka kokpiti ile talep trendlerini takip edin, dijital lookbook kataloglar yayınlayın ve 5 dilde global ihracat ağına katılın.',
                href: '/marka',
                cta: 'Marka Portalına Git'
              },
              {
                icon: <ShieldCheck size={20} />,
                color: '#10A37F',
                bg: 'rgba(16, 163, 127, 0.12)',
                title: 'Yetkili Bayiler & Showroomlar',
                desc: 'Mağazanıza kiosk teşhir ekranı kurarak binlerce modeli dev ekranda sunun. Bölgenizden gelen müşteri taleplerine anında PDF & WhatsApp fiyat teklifi hazırlayıp satışlarınızı artırın.',
                href: '/bayi',
                cta: 'Bayi Portalına Git'
              }
            ].map((benefit, idx) => (
              <div
                key={idx}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E5DFD5',
                  borderRadius: '20px',
                  padding: '28px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '18px',
                  boxShadow: '0 6px 20px -6px rgba(17, 24, 39, 0.05)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '12px',
                        background: benefit.bg,
                        color: benefit.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      {benefit.icon}
                    </div>
                    <h3 style={{ fontSize: '1.08rem', fontWeight: 800, margin: 0, color: '#111827' }}>{benefit.title}</h3>
                  </div>
                  <p style={{ fontSize: '0.88rem', lineHeight: 1.6, color: '#475569', margin: 0 }}>{benefit.desc}</p>
                </div>

                <Link
                  href={benefit.href}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    color: '#111827',
                    textDecoration: 'none'
                  }}
                >
                  <span>{benefit.cta}</span>
                  <ArrowRight size={14} style={{ color: '#C5A04B' }} />
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* 5. GLOBAL SEO & EXPORT INFRASTRUCTURE */}
        <section
          style={{
            background: 'linear-gradient(135deg, #111827 0%, #1E293B 100%)',
            borderRadius: '26px',
            padding: '44px 34px',
            color: '#FFFFFF',
            marginBottom: '48px',
            boxShadow: '0 20px 48px rgba(17, 24, 39, 0.18)',
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid rgba(197, 160, 75, 0.3)'
          }}
        >
          <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 32px auto', position: 'relative', zIndex: 1 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(212, 175, 55, 0.14)',
                border: '1px solid rgba(212, 175, 55, 0.35)',
                color: '#F3E5AB',
                padding: '5px 15px',
                borderRadius: '999px',
                fontSize: '0.72rem',
                fontWeight: 800,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginBottom: '12px'
              }}
            >
              <Globe size={13} />
              <span>ÇOK DİLLİ GLOBAL SEO & İHRACAT HİZMETİMİZ</span>
            </div>

            <h2 style={{ fontSize: 'clamp(1.35rem, 3vw, 1.85rem)', fontWeight: 900, color: '#FFFFFF', margin: '0 0 12px 0', letterSpacing: '-0.02em' }}>
              Türk Seramiklerini 5 Dilde SEO Altyapımızla Uluslararası Pazarlara İhraç Ediyoruz
            </h2>
            <p style={{ fontSize: '0.92rem', color: '#CBD5E1', lineHeight: 1.65, margin: 0 }}>
              SeramikBak Global SEO Altyapısı; Türkiye&apos;deki seramik üreticilerinin tüm koleksiyonlarını Türkçe, İngilizce, Almanca, Arapça ve Rusça dillerinde Google Global ve Yandex arama motorlarında indeksleyerek B2B distribütörler ve mimarlık bürolarıyla buluşturur.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
              gap: '16px',
              position: 'relative',
              zIndex: 1,
              marginBottom: '28px'
            }}
          >
            {[
              {
                icon: <Globe size={18} />,
                color: '#F3E5AB',
                bg: 'rgba(212, 175, 55, 0.16)',
                title: '5 Dilde SEO İndeksleme',
                desc: 'Türkçe, İngilizce, Almanca, Arapça ve Rusça dillerinde hedef ülkelere özel içerik mimarisi.'
              },
              {
                icon: <Search size={18} />,
                color: '#38BDF8',
                bg: 'rgba(56, 189, 248, 0.16)',
                title: 'Google Global & Yandex',
                desc: 'Almanya, İngiltere, Körfez ülkeleri ve Rusya’daki B2B seramik ithalatçılarında üst sıra görünürlük.'
              },
              {
                icon: <Box size={18} />,
                color: '#C084FC',
                bg: 'rgba(168, 85, 247, 0.16)',
                title: 'BIM & 4K Revit (.rfa)',
                desc: 'Uluslararası mimarlık ofislerinin projelerine seramikleri 4K PBR kaplama olarak eklemesi.'
              },
              {
                icon: <BarChart3 size={18} />,
                color: '#4ADE80',
                bg: 'rgba(34, 197, 94, 0.16)',
                title: 'Doğrudan B2B Talepler',
                desc: 'Toplu konut, otel ve ticari projelere aracı olmadan fabrika üzerinden doğrudan teklif imkanı.'
              }
            ].map((feat) => (
              <div
                key={feat.title}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '18px',
                  padding: '22px'
                }}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: feat.bg,
                    color: feat.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '12px'
                  }}
                >
                  {feat.icon}
                </div>
                <h3 style={{ fontSize: '0.94rem', fontWeight: 800, margin: '0 0 6px 0', color: '#F8FAFC' }}>{feat.title}</h3>
                <p style={{ fontSize: '0.8rem', color: '#CBD5E1', margin: 0, lineHeight: 1.5 }}>{feat.desc}</p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <Link
              href="/global-tanitim#brand-apply-form"
              className="cta-btn-hover"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #F5B841 0%, #C5A04B 100%)',
                color: '#111827',
                padding: '12px 26px',
                borderRadius: '12px',
                fontSize: '0.88rem',
                fontWeight: 800,
                textDecoration: 'none',
                boxShadow: '0 6px 20px rgba(212, 175, 55, 0.25)'
              }}
            >
              <Building2 size={16} />
              <span>Markanızı Global Tanıtıma Ekleyin</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </section>

        {/* 6. BOTTOM CTA BANNER */}
        <section
          style={{
            background: '#FFFFFF',
            border: '1px solid #E5DFD5',
            borderRadius: '26px',
            padding: '44px 32px',
            textAlign: 'center',
            boxShadow: '0 12px 32px -10px rgba(17, 24, 39, 0.08)'
          }}
        >
          <h3 style={{ fontSize: 'clamp(1.35rem, 3vw, 1.8rem)', fontWeight: 900, margin: '0 0 12px 0', color: '#111827', letterSpacing: '-0.02em' }}>
            Yaşam Alanlarınızı Yenilemeye Hazır mısınız?
          </h3>
          <p style={{ fontSize: '0.95rem', color: '#64748B', maxWidth: '580px', margin: '0 auto 26px auto', lineHeight: 1.55 }}>
            Hemen arama motorumuzu kullanmaya başlayın, tarzınıza en uygun seramiği bulup 3D sanal stüdyomuzda canlı olarak test edin.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/"
              className="cta-btn-hover"
              style={{
                background: 'linear-gradient(135deg, #111827 0%, #1E293B 100%)',
                color: '#F3E5AB',
                padding: '13px 28px',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '0.88rem',
                textDecoration: 'none',
                boxShadow: '0 8px 20px rgba(17, 24, 39, 0.18)'
              }}
            >
              Showroom&apos;u Keşfet
            </Link>
            <Link
              href="/iletisim"
              style={{
                background: '#FAF8F4',
                border: '1px solid #E2D9C8',
                color: '#111827',
                padding: '13px 28px',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '0.88rem',
                textDecoration: 'none'
              }}
            >
              Bizimle İletişime Geçin
            </Link>
          </div>
        </section>
      </div>

      <style jsx global>{`
        .cta-btn-hover {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .cta-btn-hover:hover {
          transform: translateY(-2px);
        }
        @media (max-width: 900px) {
          .about-hero-card {
            grid-template-columns: 1fr !important;
            padding: 32px 20px !important;
          }
        }
        @media (max-width: 640px) {
          .about-header-secondary {
            display: none !important;
          }
        }
      `}</style>
    </main>
  );
}
