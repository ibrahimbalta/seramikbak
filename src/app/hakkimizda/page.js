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
  Box, 
  TrendingUp, 
  BarChart3,
  ArrowRight
} from 'lucide-react';

export default function AboutUsPage() {
  const [aboutData, setAboutData] = useState({
    hero_title: 'Seramik Seçimini Yeniden Tanımlıyoruz',
    hero_subtitle: 'SeramikBak; üreticileri, bayileri ve tasarım severleri yapay zeka, Web 3D ve artırılmış gerçeklik teknolojileriyle bir araya getiren bağımsız, lüks bir dijital pazaryeri ve showroom ekosistemidir.',
    mission: 'Tüm yerel ve küresel markaların kataloglarını zengin detaylarla tek bir arama motorunda birleştirmek; bayilerin potansiyel müşterilere zahmetsizce ulaşabileceği B2B SaaS araçları sunmak ve tüketicilerin hayallerindeki mimari tasarımları hızlı fiyat teklifleriyle gerçeğe dönüştürmelerini sağlamak.',
    vision: 'Geleneksel ve zahmetli olan seramik alışverişi sürecini, fiziksel mağazalarda kaybolmadan, tamamen dijital, şeffaf ve kusursuz bir deneyime dönüştürmek. Üç boyutlu modelleme ve yapay zeka ile müşterilerin yaşam alanlarında seramikleri canlı olarak deneyimlemesini sağlayarak sektörün dijital lideri olmak.',
    stats: [
      { num: '100+', label: 'Karşılaştırılan Marka & Üretici' },
      { num: '10,000+', label: 'Aktif Seramik & Karo Ürünü' },
      { num: '500+', label: 'Türkiye Genelinde Yetkili Bayi' },
      { num: '2.5 Saniye', label: 'AI Destekli Arama ve Öneri Hızı' }
    ]
  });

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data && data.page_about_content) {
          setAboutData(data.page_about_content);
        }
      })
      .catch(err => console.error('Failed to load about settings:', err));
  }, []);

  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      fontFamily: 'var(--font-body, "Plus Jakarta Sans", system-ui, sans-serif)',
      color: '#0f172a',
      position: 'relative',
      overflowX: 'hidden'
    }}>
      {/* Background patterns */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '400px',
        background: 'radial-gradient(circle at top, rgba(179, 142, 71, 0.08) 0%, transparent 60%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* Header / Navbar */}
      <header style={{
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        boxShadow: '0 4px 30px rgba(0,0,0,0.02)'
      }}>
        <div style={{
          maxWidth: '1100px',
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
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: '#0f172a',
              color: '#b38e47',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '900',
              fontSize: '1rem'
            }}>SB</div>
            <span style={{ fontSize: '1.1rem', fontWeight: '800', tracking: '-0.02em' }}>SeramikBak</span>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '60px 24px 100px 24px',
        position: 'relative',
        zIndex: 1
      }}>
        
        {/* Original Hero Section */}
        <section style={{ textAlign: 'center', marginBottom: '80px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(179, 142, 71, 0.1)',
            color: '#8c6b30',
            padding: '6px 16px',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '20px'
          }}>
            <Sparkles size={12} />
            <span>GELECEĞİN DİJİTAL SHOWROOM PLATFORMU</span>
          </div>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.2rem)',
            fontWeight: '900',
            lineHeight: '1.15',
            letterSpacing: '-0.03em',
            color: '#0f172a',
            margin: '0 0 24px 0',
            fontFamily: 'var(--font-title, "Outfit", sans-serif)'
          }}>
            {aboutData.hero_title.includes('Yeniden Tanımlıyoruz') ? (
              <>
                Seramik Seçimini <span style={{
                  background: 'linear-gradient(135deg, #b38e47 0%, #8c6b30 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>Yeniden Tanımlıyoruz</span>
              </>
            ) : aboutData.hero_title}
          </h1>
          <p style={{
            fontSize: '1.15rem',
            lineHeight: '1.6',
            color: '#475569',
            maxWidth: '720px',
            margin: '0 auto'
          }}>
            {aboutData.hero_subtitle}
          </p>
        </section>

        {/* Original Stats Grid */}
        <section style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '24px',
          marginBottom: '80px'
        }}>
          {aboutData.stats && aboutData.stats.map((stat, idx) => (
            <div key={idx} style={{
              background: '#ffffff',
              border: '1px solid rgba(0, 0, 0, 0.04)',
              borderRadius: '20px',
              padding: '30px 24px',
              textAlign: 'center',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.01)'
            }}>
              <div style={{
                fontSize: '2.2rem',
                fontWeight: '900',
                color: '#b38e47',
                marginBottom: '8px',
                fontFamily: 'var(--font-title, "Outfit", sans-serif)'
              }}>{stat.num}</div>
              <div style={{
                fontSize: '0.85rem',
                fontWeight: '600',
                color: '#64748b',
                lineHeight: '1.4'
              }}>{stat.label}</div>
            </div>
          ))}
        </section>

        {/* Original Vision & Mission Split */}
        <section style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '40px',
          marginBottom: '80px'
        }}>
          <div style={{
            background: '#ffffff',
            border: '1px solid rgba(0, 0, 0, 0.04)',
            borderRadius: '24px',
            padding: '40px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.01)'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(179, 142, 71, 0.1)',
              color: '#b38e47',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '24px'
            }}>
              <Award size={24} />
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '16px', color: '#0f172a' }}>Vizyonumuz</h3>
            <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#475569', margin: 0 }}>
              {aboutData.vision}
            </p>
          </div>

          <div style={{
            background: '#ffffff',
            border: '1px solid rgba(0, 0, 0, 0.04)',
            borderRadius: '24px',
            padding: '40px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.01)'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(15, 23, 42, 0.06)',
              color: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '24px'
            }}>
              <Cpu size={24} />
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '16px', color: '#0f172a' }}>Misyonumuz</h3>
            <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#475569', margin: 0 }}>
              {aboutData.mission}
            </p>
          </div>
        </section>

        {/* Original Ecosystem Benefits (Kimin İçin Ne Sunuyoruz?) */}
        <section style={{ marginBottom: '80px' }}>
          <h2 style={{
            fontSize: '1.75rem',
            fontWeight: '800',
            textAlign: 'center',
            marginBottom: '40px',
            color: '#0f172a'
          }}>Kimin İçin Ne Sunuyoruz?</h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            {[
              {
                icon: <Heart size={20} />,
                title: 'Tüketiciler İçin',
                desc: 'Yüzlerce bayiyi dolaşmak yerine tüm renk, ebat ve marka seçeneklerini saniyeler içinde karşılaştırın. 3D sanal stüdyo ile banyo veya mutfağınızda seramikleri canlı döşeyip deneyin ve doğrudan teklif isteyin.'
              },
              {
                icon: <Building2 size={20} />,
                title: 'Markalar & Üreticiler İçin',
                desc: 'Ürünlerinizi dijital ortamda en şık haliyle sergileyin. Akıllı arama önerileri ve B2B marka portalı ile tüketici trendlerini takip edin, hedefli reklam kampanyalarıyla en popüler ürünlerinizi öne çıkarın.'
              },
              {
                icon: <ShieldCheck size={20} />,
                title: 'Yetkili Bayiler İçin',
                desc: 'Showroomunuza teşhir kiosk kurarak binlerce ürünü dev ekranda müşterilerinize sunun. Bölgenizden gelen satın alma taleplerini (lead) anında yanıtlayarak satışlarınızı ve kurumsal gücünüzü artırın.'
              }
            ].map((benefit, idx) => (
              <div key={idx} style={{
                background: '#ffffff',
                border: '1px solid rgba(0, 0, 0, 0.04)',
                borderRadius: '24px',
                padding: '32px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.01)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '16px'
                }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: idx === 0 ? 'rgba(239, 68, 68, 0.08)' : idx === 1 ? 'rgba(179, 142, 71, 0.08)' : 'rgba(34, 197, 94, 0.08)',
                    color: idx === 0 ? '#ef4444' : idx === 1 ? '#b38e47' : '#22c55e',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>{benefit.icon}</div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>{benefit.title}</h4>
                </div>
                <p style={{ fontSize: '0.88rem', lineHeight: '1.55', color: '#64748b', margin: 0 }}>{benefit.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ADDED SPECIAL SECTION: Global SEO & İhracat Hizmeti Altyapımız */}
        <section style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          borderRadius: '28px',
          padding: '48px 36px',
          color: '#ffffff',
          marginBottom: '80px',
          boxShadow: '0 20px 48px rgba(15, 23, 42, 0.18)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-100px',
            right: '-100px',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(179, 142, 71, 0.16) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />

          <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 36px auto', position: 'relative', zIndex: 1 }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(212, 175, 55, 0.12)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              color: '#d4af37',
              padding: '5px 16px',
              borderRadius: '20px',
              fontSize: '0.74rem',
              fontWeight: '800',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: '14px'
            }}>
              <Globe size={13} />
              <span>ÇOK DİLLİ GLOBAL SEO & İHRACAT HİZMETİMİZ</span>
            </div>
            
            <h2 style={{ fontSize: '1.85rem', fontWeight: '900', color: '#ffffff', margin: '0 0 14px 0', letterSpacing: '-0.02em' }}>
              Türk Seramiklerini 5 Dilde SEO Altyapımızla Uluslararası Pazarlara İhraç Ediyoruz
            </h2>
            <p style={{ fontSize: '0.94rem', color: '#cbd5e1', lineHeight: '1.65', margin: 0 }}>
              SeramikBak Global SEO Altyapısı; Türkiye'deki seramik üreticilerinin tüm koleksiyonlarını Türkçe, İngilizce, Almanca, Arapça ve Rusça dillerinde Google Global ve Yandex arama motorlarında indeksleyerek B2B distribütörler, mimarlık büroları ve yüksek metrajlı projeler ile buluşturur.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '20px',
            position: 'relative',
            zIndex: 1,
            marginBottom: '32px'
          }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '20px', padding: '24px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(212, 175, 55, 0.15)', color: '#d4af37', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                <Globe size={18} />
              </div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '800', margin: '0 0 6px 0', color: '#f8fafc' }}>5 Dilde SEO İndeksleme</h4>
              <p style={{ fontSize: '0.82rem', color: '#cbd5e1', margin: 0, lineHeight: '1.5' }}>
                Türkçe, İngilizce, Almanca, Arapça ve Rusça dillerinde hedef ülkelere özel içerik mimarisi ve üst sıra görünürlüğü.
              </p>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '20px', padding: '24px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                <Search size={18} />
              </div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '800', margin: '0 0 6px 0', color: '#f8fafc' }}>Google Global & Yandex</h4>
              <p style={{ fontSize: '0.82rem', color: '#cbd5e1', margin: 0, lineHeight: '1.5' }}>
                Almanya, İngiltere, Körfez ülkeleri ve Rusya'daki B2B seramik ithalatçılarının aramalarında üst sıra konumlandırma.
              </p>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '20px', padding: '24px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                <Box size={18} />
              </div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '800', margin: '0 0 6px 0', color: '#f8fafc' }}>BIM & 4K Revit (.rfa) Şartnamesi</h4>
              <p style={{ fontSize: '0.82rem', color: '#cbd5e1', margin: 0, lineHeight: '1.5' }}>
                Uluslararası mimarlık bürolarının projelerine seramikleri 4K dikişsiz PBR kaplama ve Revit nesnesi olarak eklemesi.
              </p>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '20px', padding: '24px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                <BarChart3 size={18} />
              </div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '800', margin: '0 0 6px 0', color: '#f8fafc' }}>Doğrudan B2B İhracat Talepleri</h4>
              <p style={{ fontSize: '0.82rem', color: '#cbd5e1', margin: 0, lineHeight: '1.5' }}>
                Yüksek metrajlı toplu konut, otel ve ticari projelere aracı olmadan fabrika & ana bayi üzerinden doğrudan teklif imkanı.
              </p>
            </div>
          </div>

          <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <Link 
              href="/global-tanitim#brand-apply-form" 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #b38e47 0%, #d4af37 100%)',
                color: '#111827',
                padding: '12px 26px',
                borderRadius: '14px',
                fontSize: '0.88rem',
                fontWeight: '800',
                textDecoration: 'none',
                boxShadow: '0 6px 20px rgba(212, 175, 55, 0.25)',
                transition: 'all 0.2s ease'
              }}
              className="cta-btn-hover"
            >
              <Building2 size={16} />
              <span>Markanızı Global Tanıtıma Ekleyin</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </section>

        {/* Original CTA Banner */}
        <section style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          borderRadius: '30px',
          padding: '60px 40px',
          textAlign: 'center',
          color: '#ffffff',
          boxShadow: '0 20px 40px rgba(15, 23, 42, 0.15)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Accent light in banner */}
          <div style={{
            position: 'absolute',
            bottom: '-150px',
            right: '-150px',
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(179, 142, 71, 0.15) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />

          <h3 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '0 0 16px 0', letterSpacing: '-0.02em' }}>
            Yaşam Alanlarınızı Yenilemeye Hazır mısınız?
          </h3>
          <p style={{ fontSize: '1rem', color: '#94a3b8', maxWidth: '600px', margin: '0 auto 32px auto', lineHeight: '1.5' }}>
            Hemen arama motorumuzu kullanmaya başlayın, tarzınıza en uygun seramiği bulup 3D sanal stüdyomuzda canlı olarak test edin.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/" style={{
              background: 'linear-gradient(135deg, #b38e47 0%, #8c6b30 100%)',
              color: '#ffffff',
              padding: '14px 32px',
              borderRadius: '30px',
              fontWeight: '700',
              fontSize: '0.9rem',
              textDecoration: 'none',
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: '0 4px 15px rgba(179, 142, 71, 0.3)'
            }} className="cta-btn-hover">
              Showroom'u Keşfet
            </Link>
            <Link href="/iletisim" style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              padding: '14px 32px',
              borderRadius: '30px',
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

      {/* Styled JSX for animations */}
      <style jsx global>{`
        .back-link-hover:hover {
          color: #b38e47 !important;
          transform: translateX(-3px);
        }
        .cta-btn-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(179, 142, 71, 0.4) !important;
        }
      `}</style>
    </main>
  );
}
