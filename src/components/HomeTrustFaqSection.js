'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Sparkles, 
  CheckCircle2, 
  ChevronDown, 
  ShieldCheck, 
  Clock, 
  Calculator, 
  Layers,
  ArrowRight
} from 'lucide-react';

const FAQ_ITEMS = [
  {
    q: "SeramikBak hizmeti ücretli mi?",
    a: "Hayır. SeramikBak platformunda ürün aramak, 3D Sanal Stüdyo'da oda tasarlamak, yapay zeka ile fotoğraf giydirmek ve yetkili bayilerden fiyat teklifi istemek tamamen ücretsizdir. Kullanıcılardan hiçbir komisyon veya ek ücret alınmaz."
  },
  {
    q: "Yetkili bayilerden fiyat teklifi nasıl alınır?",
    a: "Beğendiğiniz ürünün detay sayfasından veya ürün kartındaki 'Bayi Teklifi Al' butonuna tıklayarak ilinizi ve yaklaşık metrajınızı seçebilirsiniz. Talebiniz anında bölgenizdeki yetkili bayilere iletilir ve bayiler size doğrudan en güncel net fiyatı ve teslimat süresini bildirir."
  },
  {
    q: "3D Sanal Stüdyo için bilgisayara program yüklemem gerekir mi?",
    a: "Kesinlikle hayır! SeramikBak 3D Stüdyosu doğrudan modern web tarayıcılarında (Chrome, Safari, Edge vb.) WebGL teknolojisiyle çalışır. Akıllı telefonunuzdan, tabletinizden veya bilgisayarınızdan herhangi bir uygulama indirmeden hemen kullanabilirsiniz."
  },
  {
    q: "Platformda hangi seramik markaları yer alıyor?",
    a: "Türkiye'nin ve dünyanın en büyük 17 üreticisi yer almaktadır: Çanakkale Seramik, NG Kütahya Seramik, VitrA, Bien, Yurtbay Seramik, Seramiksan, Ege Seramik, Qua Granite, Decovita, Graniser, Güral Seramik, Hitit Seramik, Seranit, Termal Seramik, Uşak Seramik ve diğer seçkin üreticiler."
  },
  {
    q: "Odam için kaç metrekare seramik almam gerektiğini nasıl hesaplarım?",
    a: "Sitemizde yer alan Akıllı Metraj Hesaplayıcı ile odanızın en, boy ve yükseklik ölçülerini girdiğinizde gerekli net metrekare, köşe/kesim firesi (%10) ve satın almanız gereken net kutu adedi otomatik olarak hesaplanır."
  },
  {
    q: "Kendi banyomun veya mutfağımın fotoğrafını yükleyip seramik deneyebilir miyim?",
    a: "'Mekânımda Gör & Dene' özelliğimizle odanızın fotoğrafını yükleyebilirsiniz. Yapay zeka zemin ve duvar sınırlarını otomatik olarak algılar ve seçtiğiniz seramikleri gerçekçi ışık ve perspektif eşliğinde odanıza giydirir."
  }
];

export default function HomeTrustFaqSection({ onNavigateToStudio }) {
  const [openIdx, setOpenIdx] = useState(null);

  const toggleFaq = (idx) => {
    setOpenIdx(prev => (prev === idx ? null : idx));
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": FAQ_ITEMS.map(item => ({
      "@type": "Question",
      "name": item.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.a
      }
    }))
  };

  return (
    <section className="home-trust-faq-section" style={{ margin: '60px 0 30px 0', width: '100%' }}>
      {/* Schema.org FAQPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* 1. NASIL ÇALIŞIR? 3 ADIMLI REHBER */}
      <div className="how-it-works-block" style={{ marginBottom: '60px' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '999px', fontSize: '0.8rem', color: '#d4af37', fontWeight: '700', marginBottom: '12px' }}>
            <Sparkles size={13} />
            <span>KOLAY VE ŞEFFAF SÜREÇ</span>
          </div>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: '800', color: 'var(--text-primary)', margin: '0 0 10px 0' }}>
            3 Kolay Adımda Hayalinizdeki Mekân
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', maxWidth: '640px', margin: '0 auto', lineHeight: '1.6' }}>
            Karoları tek tek bayileri gezmeden keşfedin, odanızda 3D görün ve doğrudan yetkili bayiden en iyi teklifi alın.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {/* Step 1 */}
          <div className="glass-panel" style={{ padding: '28px 24px', borderRadius: '16px', position: 'relative', overflow: 'hidden', border: '1px solid var(--border-color)', background: 'var(--bg-card, #ffffff)' }}>
            <div style={{ position: 'absolute', top: '16px', right: '20px', fontSize: '2.4rem', fontWeight: '900', color: 'rgba(212,175,55,0.15)', lineHeight: 1 }}>
              01
            </div>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(212,175,55,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d4af37', marginBottom: '18px' }}>
              <Search size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>
              Model ve Tarzınızı Seçin
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.6', margin: 0 }}>
              17 lider markanın 25.000+ seramik modelini ebat, renk, mermer/ahşap/beton dokusu ve yüzey tipine göre saniyeler içinde filtreleyin.
            </p>
          </div>

          {/* Step 2 */}
          <div className="glass-panel" style={{ padding: '28px 24px', borderRadius: '16px', position: 'relative', overflow: 'hidden', border: '1px solid var(--border-color)', background: 'var(--bg-card, #ffffff)' }}>
            <div style={{ position: 'absolute', top: '16px', right: '20px', fontSize: '2.4rem', fontWeight: '900', color: 'rgba(212,175,55,0.15)', lineHeight: 1 }}>
              02
            </div>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(59,130,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', marginBottom: '18px' }}>
              <Sparkles size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>
              3D Odanızda Canlı Deneyin
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.6', margin: 0 }}>
              İnteraktif 3D Sanal Stüdyo&apos;da veya kendi banyonuzun fotoğrafında derz rengi, döşeme yönü ve mobilyalarla karoları canlı görün.
            </p>
          </div>

          {/* Step 3 */}
          <div className="glass-panel" style={{ padding: '28px 24px', borderRadius: '16px', position: 'relative', overflow: 'hidden', border: '1px solid var(--border-color)', background: 'var(--bg-card, #ffffff)' }}>
            <div style={{ position: 'absolute', top: '16px', right: '20px', fontSize: '2.4rem', fontWeight: '900', color: 'rgba(212,175,55,0.15)', lineHeight: 1 }}>
              03
            </div>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', marginBottom: '18px' }}>
              <CheckCircle2 size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>
              Yetkili Bayiden Teklif Alın
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.6', margin: 0 }}>
              81 ildeki en yakın yetkili bayilere doğrudan talep gönderin. Ücretsiz, hızlı ve birinci elden rekabetçi fiyat teklifini cebinize alın.
            </p>
          </div>
        </div>
      </div>

      {/* 2. GÜVEN & AVANTAJLAR ŞERİDİ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '60px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderRadius: '12px', background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.15)' }}>
          <ShieldCheck size={26} style={{ color: '#d4af37', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-primary)' }}>%100 Orijinal Ürünler</div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Üretici onaylı 1. sınıf kalite</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderRadius: '12px', background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.15)' }}>
          <Clock size={26} style={{ color: '#3b82f6', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-primary)' }}>Hızlı Bayi Yanıtı</div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Ortalama 15 dk geri dönüş</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderRadius: '12px', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)' }}>
          <Calculator size={26} style={{ color: '#10b981', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-primary)' }}>Akıllı Metraj & Fire</div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Eksiksiz kutu ve alan hesabı</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderRadius: '12px', background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.15)' }}>
          <Layers size={26} style={{ color: '#8b5cf6', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-primary)' }}>81 İlde Geniş Ağ</div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Türkiye çapında yetkili satıcılar</div>
          </div>
        </div>
      </div>

      {/* 3. SIKÇA SORULAN SORULAR (FAQ ACCORDION) */}
      <div className="home-faq-container" style={{ maxWidth: '860px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: 'clamp(1.4rem, 2.5vw, 1.9rem)', fontWeight: '800', color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
            Sıkça Sorulan Sorular
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>
            SeramikBak kullanımı, bayi fiyat teklifleri ve 3D stüdyo hakkında merak ettikleriniz.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="glass-panel"
                style={{
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-card, #ffffff)',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease'
                }}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  style={{
                    width: '100%',
                    padding: '18px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    color: 'var(--text-primary)',
                    fontFamily: 'inherit'
                  }}
                  aria-expanded={isOpen}
                >
                  <span style={{ fontSize: '0.96rem', fontWeight: '700', lineHeight: '1.4' }}>
                    {item.q}
                  </span>
                  <ChevronDown
                    size={18}
                    style={{
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.25s ease',
                      color: isOpen ? '#d4af37' : 'var(--text-muted)',
                      flexShrink: 0
                    }}
                  />
                </button>

                {isOpen && (
                  <div
                    style={{
                      padding: '0 20px 20px 20px',
                      fontSize: '0.9rem',
                      lineHeight: '1.65',
                      color: 'var(--text-secondary)',
                      borderTop: '1px solid var(--border-subtle, #f1f5f9)',
                      paddingTop: '14px'
                    }}
                  >
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Callout box under FAQ */}
        <div style={{ marginTop: '36px', padding: '24px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(212,175,55,0.08) 0%, rgba(212,175,55,0.02) 100%)', border: '1px solid rgba(212,175,55,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '4px' }}>
              Sorunuza yanıt bulamadınız mı?
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Mimar ve teknik danışmanlarımız aklınıza takılan her konuda yardımcı olmaya hazır.
            </div>
          </div>
          <Link
            href="/iletisim"
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              background: '#d4af37',
              color: '#000000',
              fontWeight: '700',
              fontSize: '0.88rem',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>Bize Ulaşın</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
