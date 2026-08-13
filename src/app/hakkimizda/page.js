'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Sparkles, 
  Building2, 
  ShieldCheck, 
  Heart, 
  Award, 
  Cpu, 
  Globe, 
  Search, 
  Layers, 
  ChevronRight, 
  CheckCircle2,
  Box,
  TrendingUp,
  BarChart3
} from 'lucide-react';

export default function AboutUsPage() {
  const [aboutData, setAboutData] = useState({
    hero_title: 'Türk Seramik Sektörünü Yapay Zeka & 5 Dilde Global SEO Altyapımızla Dünya Pazarlarına Taşıyoruz',
    hero_subtitle: 'SeramikBak; Türkiye’nin lider seramik üreticilerini, yetkili bayilerini ve uluslararası mimarlık bürolarını Web 3D, BIM/Revit şartname entegrasyonu ve 5 dilde dinamik arama motoru indekslemesiyle buluşturan yeni nesil küresel B2B dijital ekosistemdir.',
    mission: 'Tüm yerel ve küresel üreticilerin seramik koleksiyonlarını 5 farklı dilde yapılandırarak tek bir akıllı arama motorunda birleştirmek; bayilerin potansiyel müşterilere zahmetsizce ulaşabileceği B2B SaaS araçları sunmak ve Türk seramiğini uluslararası mimarlık projelerinin ilk tercihi haline getirmek.',
    vision: 'Geleneksel ve zahmetli seramik tedarik süreçlerini; yapay zeka destekli görsel arama, 3D oda simülasyonu ve çok dilli küresel SEO mimarisi ile tamamen şeffaf, dijital ve yüksek katma değerli bir ihracat ekosistemine dönüştürmek.',
    stats: [
      { num: '100+', label: 'Karşılaştırılan Marka & Üretici' },
      { num: '5 Dilde', label: 'Google Global & Yandex SEO İndeksi' },
      { num: '500+', label: 'Türkiye Genelinde Yetkili Bayi' },
      { num: '4K BIM / CAD', label: 'Revit Şartname Kaplama Nesnesi' },
      { num: '2.5 Saniye', label: 'AI Görsel Arama & Öneri Hızı' }
    ]
  });

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data && data.page_about_content) {
          setAboutData(prev => ({ ...prev, ...data.page_about_content }));
        }
      })
      .catch(err => console.error('Failed to load about settings:', err));
  }, []);

  return (
    <main style={{
      minHeight: '100vh',
      background: '#f8fafc',
      fontFamily: 'var(--font-body, "Plus Jakarta Sans", system-ui, sans-serif)',
      color: '#0f172a',
      position: 'relative',
      overflowX: 'hidden'
    }}>
      {/* Background ambient lighting */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '500px',
        background: 'radial-gradient(circle at 50% 0%, rgba(179, 142, 71, 0.12) 0%, rgba(15, 23, 42, 0) 70%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* Sticky Header / Navbar */}
      <header style={{
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        boxShadow: '0 4px 20px rgba(15, 23, 42, 0.03)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Link href="/" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            textDecoration: 'none',
            color: '#0f172a',
            fontSize: '0.85rem',
            fontWeight: '700',
            transition: 'color 0.2s'
          }} className="back-link-hover">
            <ArrowLeft size={16} />
            <span>Ana Sayfaya Dön</span>
          </Link>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '9px',
              background: '#0f172a',
              color: '#d4af37',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '900',
              fontSize: '1rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>SB</div>
            <span style={{ fontSize: '1.15rem', fontWeight: '800', tracking: '-0.02em', color: '#0f172a' }}>SeramikBak</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '50px 24px 100px 24px',
        position: 'relative',
        zIndex: 1
      }}>
        
        {/* Executive Hero Banner Section */}
        <section style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(179, 142, 71, 0.1)',
            border: '1px solid rgba(179, 142, 71, 0.3)',
            color: '#b38e47',
            padding: '6px 18px',
            borderRadius: '30px',
            fontSize: '0.78rem',
            fontWeight: '800',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            marginBottom: '24px'
          }}>
            <Globe size={14} />
            <span>KÜRESEL DİJİTAL SHOWROOM & GLOBAL SEO MİMARİSİ</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.1rem, 4.5vw, 3.4rem)',
            fontWeight: '900',
            lineHeight: '1.2',
            letterSpacing: '-0.03em',
            color: '#0f172a',
            maxWidth: '1000px',
            margin: '0 auto 24px auto',
            fontFamily: 'var(--font-title, "Outfit", sans-serif)'
          }}>
            Türk Seramik Koleksiyonlarını <span style={{
              background: 'linear-gradient(135deg, #b38e47 0%, #d4af37 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>5 Dilde SEO Altyapımızla</span> Dünya Pazarlarında Görünür Kılıyoruz
          </h1>

          <p style={{
            fontSize: '1.1rem',
            lineHeight: '1.7',
            color: '#475569',
            maxWidth: '860px',
            margin: '0 auto 36px auto',
            fontWeight: '500'
          }}>
            {aboutData.hero_subtitle}
          </p>

          {/* 5 Language Badges Row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            flexWrap: 'wrap'
          }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#1e293b', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '6px 16px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>🇹🇷 Türkçe</span>
            <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#1e293b', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '6px 16px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>🇬🇧 English</span>
            <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#1e293b', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '6px 16px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>🇩🇪 Deutsch</span>
            <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#1e293b', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '6px 16px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>🇸🇦 العربية</span>
            <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#1e293b', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '6px 16px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>🇷🇺 Русский</span>
          </div>
        </section>

        {/* Stats Grid Bar */}
        <section style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '70px'
        }}>
          {aboutData.stats && aboutData.stats.map((stat, idx) => (
            <div key={idx} style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '20px',
              padding: '24px 20px',
              textAlign: 'center',
              boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)',
              transition: 'transform 0.2s ease, boxShadow 0.2s ease'
            }} className="stat-card-hover">
              <div style={{
                fontSize: '1.9rem',
                fontWeight: '900',
                color: '#b38e47',
                marginBottom: '6px',
                fontFamily: 'var(--font-title, "Outfit", sans-serif)'
              }}>{stat.num}</div>
              <div style={{
                fontSize: '0.82rem',
                fontWeight: '700',
                color: '#64748b',
                lineHeight: '1.4'
              }}>{stat.label}</div>
            </div>
          ))}
        </section>

        {/* SPECIAL SECTION: Global SEO & Export Infrastructure (Showcase of Expertise) */}
        <section style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          borderRadius: '28px',
          padding: '48px 40px',
          color: '#ffffff',
          marginBottom: '70px',
          boxShadow: '0 20px 48px rgba(15, 23, 42, 0.2)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-100px',
            right: '-100px',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(179, 142, 71, 0.18) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />

          <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 40px auto', position: 'relative', zIndex: 1 }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(212, 175, 55, 0.12)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              color: '#d4af37',
              padding: '5px 14px',
              borderRadius: '20px',
              fontSize: '0.72rem',
              fontWeight: '800',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: '14px'
            }}>
              <TrendingUp size={13} />
              <span>TEKNOLOJİK ÜSTÜNLÜK & İHRACAT MİMARİSİ</span>
            </div>
            
            <h2 style={{ fontSize: '1.9rem', fontWeight: '900', color: '#ffffff', margin: '0 0 14px 0', letterSpacing: '-0.02em' }}>
              Uluslararası Pazarlar İçin Geliştirdiğimiz Global SEO Teknolojimiz
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#94a3b8', lineHeight: '1.6', margin: 0 }}>
              SeramikBak sadece bir dijital katalog değil; Türkiye'deki seramik fabrikalarının ürünlerini küresel arama motorlarında ilk sıraya taşıyan gelişmiş bir B2B arama ve şartname altyapısıdır.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '20px',
            position: 'relative',
            zIndex: 1
          }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '20px', padding: '24px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(212, 175, 55, 0.15)', color: '#d4af37', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Globe size={20} />
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: '800', margin: '0 0 8px 0', color: '#f8fafc' }}>5 Dilde Semantik SEO İndeksi</h4>
              <p style={{ fontSize: '0.84rem', color: '#cbd5e1', margin: 0, lineHeight: '1.55' }}>
                Ürün adları, ebatlar, renkler ve yüzey tipleri Türkçe, İngilizce, Almanca, Arapça ve Rusça dillerinde yerel arama alışkanlıklarına göre indekslenir.
              </p>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '20px', padding: '24px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Search size={20} />
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: '800', margin: '0 0 8px 0', color: '#f8fafc' }}>Google Global & Yandex Sıralaması</h4>
              <p style={{ fontSize: '0.84rem', color: '#cbd5e1', margin: 0, lineHeight: '1.55' }}>
                Almanya, İngiltere, Körfez ülkeleri ve Rusya'daki B2B seramik ithalatçılarının aramalarında üst sırada çıkmanızı sağlayan dinamik SEO mimarisi.
              </p>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '20px', padding: '24px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Box size={20} />
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: '800', margin: '0 0 8px 0', color: '#f8fafc' }}>BIM & 4K Revit (.rfa) Şartnamesi</h4>
              <p style={{ fontSize: '0.84rem', color: '#cbd5e1', margin: 0, lineHeight: '1.55' }}>
                Yurt dışındaki uluslararası mimarlık bürolarının projelere seramiklerinizi dikişsiz 4K PBR kaplama ve Revit nesnesi olarak doğrudan eklemesini sağlar.
              </p>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '20px', padding: '24px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <BarChart3 size={20} />
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: '800', margin: '0 0 8px 0', color: '#f8fafc' }}>Komisyonsuz Doğrudan B2B Eşleşme</h4>
              <p style={{ fontSize: '0.84rem', color: '#cbd5e1', margin: 0, lineHeight: '1.55' }}>
                Yüksek metrajlı toplu konut, otel ve ticari projelere aracı olmadan fabrika & ana bayi üzerinden doğrudan teklif sunma imkanı.
              </p>
            </div>
          </div>
        </section>

        {/* Vision & Mission Split */}
        <section style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
          marginBottom: '70px'
        }}>
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '24px',
            padding: '36px 32px',
            boxShadow: '0 4px 20px rgba(15, 23, 42, 0.03)'
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'rgba(179, 142, 71, 0.1)',
              color: '#b38e47',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px'
            }}>
              <Award size={22} />
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: '800', marginBottom: '14px', color: '#0f172a' }}>Vizyonumuz</h3>
            <p style={{ fontSize: '0.92rem', lineHeight: '1.65', color: '#475569', margin: 0 }}>
              {aboutData.vision}
            </p>
          </div>

          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '24px',
            padding: '36px 32px',
            boxShadow: '0 4px 20px rgba(15, 23, 42, 0.03)'
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'rgba(15, 23, 42, 0.06)',
              color: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px'
            }}>
              <Cpu size={22} />
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: '800', marginBottom: '14px', color: '#0f172a' }}>Misyonumuz</h3>
            <p style={{ fontSize: '0.92rem', lineHeight: '1.65', color: '#475569', margin: 0 }}>
              {aboutData.mission}
            </p>
          </div>
        </section>

        {/* Ecosystem Benefits */}
        <section style={{ marginBottom: '70px' }}>
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <h2 style={{
              fontSize: '1.8rem',
              fontWeight: '800',
              color: '#0f172a',
              margin: '0 0 10px 0'
            }}>Kimin İçin Ne Sunuyoruz?</h2>
            <p style={{ fontSize: '0.94rem', color: '#64748b', margin: 0 }}>
              Üretici, bayi ve tüketicileri tek bir dijital platformda buluşturan şeffaf ekosistemimiz.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            {[
              {
                icon: <Heart size={20} />,
                title: 'Tüketiciler & Mimar Adayları İçin',
                desc: 'Yüzlerce mağazayı gezmeden tüm renk, ebat ve marka seçeneklerini saniyeler içinde karşılaştırın. 3D sanal stüdyomuzda banyonuzda canlı deneyip bölgenizdeki bayilerden hızlı teklif alın.'
              },
              {
                icon: <Building2 size={20} />,
                title: 'Markalar & Üreticiler İçin',
                desc: 'Ürün koleksiyonlarınızı 5 farklı dilde Google Global indeksine kaydedin. Bölgesel pazar trend analitiği ve B2B Marka Portalı ile uluslararası projelere şartname malzemesi verin.'
              },
              {
                icon: <ShieldCheck size={20} />,
                title: 'Yetkili Bayiler & Showroomlar İçin',
                desc: 'Showroomunuza kurumsal Teşhir Kiosk ekranı kurarak binlerce seramiği 3D sunun. Bölgenizden gelen gerçek satın alma taleplerini (lead) yanıtlayarak cironuzu artırın.'
              }
            ].map((benefit, idx) => (
              <div key={idx} style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '24px',
                padding: '32px 28px',
                boxShadow: '0 4px 16px rgba(15, 23, 42, 0.02)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '16px'
                }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: idx === 0 ? 'rgba(239, 68, 68, 0.08)' : idx === 1 ? 'rgba(179, 142, 71, 0.08)' : 'rgba(34, 197, 94, 0.08)',
                    color: idx === 0 ? '#ef4444' : idx === 1 ? '#b38e47' : '#22c55e',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>{benefit.icon}</div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>{benefit.title}</h4>
                </div>
                <p style={{ fontSize: '0.88rem', lineHeight: '1.6', color: '#64748b', margin: 0 }}>{benefit.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Banner */}
        <section style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          borderRadius: '28px',
          padding: '50px 36px',
          textAlign: 'center',
          color: '#ffffff',
          boxShadow: '0 20px 40px rgba(15, 23, 42, 0.15)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            bottom: '-120px',
            right: '-120px',
            width: '280px',
            height: '280px',
            background: 'radial-gradient(circle, rgba(179, 142, 71, 0.18) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />

          <h3 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '0 0 14px 0', letterSpacing: '-0.02em' }}>
            Markanızı ve Koleksiyonlarınızı Global İhracat Ağına Ekleyin
          </h3>
          <p style={{ fontSize: '0.98rem', color: '#94a3b8', maxWidth: '640px', margin: '0 auto 30px auto', lineHeight: '1.6' }}>
            5 dilde SEO altyapımızla ürünlerinizi küresel mimarlık projelerine şartname olarak kaydedin, doğrudan B2B ihracat talepleri toplayın.
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/global-tanitim#brand-apply-form" style={{
              background: 'linear-gradient(135deg, #b38e47 0%, #d4af37 100%)',
              color: '#111827',
              padding: '14px 30px',
              borderRadius: '14px',
              fontWeight: '800',
              fontSize: '0.9rem',
              textDecoration: 'none',
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: '0 8px 24px rgba(212, 175, 55, 0.25)'
            }} className="cta-btn-hover">
              Markanızı Global Tanıtıma Ekleyin
            </Link>
            <Link href="/iletisim" style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              padding: '14px 30px',
              borderRadius: '14px',
              fontWeight: '700',
              fontSize: '0.9rem',
              textDecoration: 'none',
              transition: 'background 0.2s'
            }}>
              Bizimle İletişime Geçin
            </Link>
          </div>
        </section>

      </div>

      {/* Global hover styles */}
      <style jsx global>{`
        .back-link-hover:hover {
          color: #b38e47 !important;
          transform: translateX(-3px);
        }
        .stat-card-hover:hover {
          transform: translateY(-2px);
          border-color: #cbd5e1 !important;
        }
        .cta-btn-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(212, 175, 55, 0.35) !important;
        }
      `}</style>
    </main>
  );
}
