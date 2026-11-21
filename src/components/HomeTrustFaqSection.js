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
  },
  {
    q: "Banyo ve ıslak zeminlerde mat mı yoksa parlak seramik mi tercih edilmeli?",
    a: "Banyo zemini, duş içi ve balkon gibi ıslak alanlarda kayma riskini önlemek için R9 veya R10 kaymazlık sınıfına sahip mat seramikler tavsiye edilir. Parlak (full lappato) seramikler ise ışığı yansıtarak ferahlık kattığı için banyo duvarları ve salon zeminleri için mükemmel bir tercihtir."
  },
  {
    q: "Küçük banyolar için hangi seramik ebatları uygundur?",
    a: "Küçük banyolarda daha az derz çizgisi oluşturduğu ve alanı kesintisiz gösterdiği için 60x120 cm rektifiyeli büyük ebat karolar sıklıkla tercih edilmektedir. Açık tonlu mermer ve traverten desenleri mekânı çok daha geniş hissettirir."
  },
  {
    q: "Bir banyo için kaç kutu seramik ve ne kadar fire hesabı yapılmalıdır?",
    a: "Net zemin ve duvar alanına köşe kesimleri ve desen uyumu için standart düz döşemede %10, çapraz veya balıksırtı döşemede %15 fire payı eklenmelidir. Platformumuzdaki Akıllı Metraj Robotu seçtiğiniz karo ebadına göre gereken tam kutu adedini ve paket metrajını anında hesaplar."
  },
  {
    q: "Rektifiyeli seramik ne demektir, derzsiz döşenebilir mi?",
    a: "Rektifiye, seramik kenarlarının fırından çıktıktan sonra lazerle 90 derece dik kesilerek milimetrik ölçüye getirilmesidir. 1-2 mm gibi son derece ince derzlerle döşenmesini sağlayarak modern, yekpare bir görünüm sunar."
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
    <section className="home-trust-faq-section" style={{ margin: '36px 0 24px 0', width: '100%', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Schema.org FAQPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* 1. NASIL ÇALIŞIR? 3 ADIMLI REHBER & GÜVEN KARTLARI (Section K: Kırık beyaz ve açık taş tonu) */}
      <div
        className="how-it-works-block"
        style={{
          background: 'var(--sb-bg-primary, #F6F3EE)',
          border: '1px solid var(--sb-border, #E5DED3)',
          borderRadius: '24px',
          padding: 'clamp(28px, 4vw, 44px)',
          boxShadow: '0 8px 28px -8px rgba(41, 40, 36, 0.04)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 14px', background: 'rgba(181,139,80,0.12)', border: '1px solid rgba(181,139,80,0.3)', borderRadius: '999px', fontSize: '0.72rem', color: 'var(--sb-accent-bronze, #B58B50)', fontWeight: '800', marginBottom: '12px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            <Sparkles size={13} />
            <span>NASIL ÇALIŞIR?</span>
          </div>
          <h2 style={{ fontSize: 'clamp(1.45rem, 2.4vw, 1.95rem)', fontWeight: '800', color: 'var(--sb-text-primary, #292824)', margin: '0 0 10px 0', letterSpacing: '-0.02em', fontFamily: 'var(--font-title, "Outfit", sans-serif)' }}>
            3 Adımda Dijital Seramik Showroom Deneyimi
          </h2>
          <p style={{ fontSize: '0.92rem', color: 'var(--sb-text-secondary, #77736B)', maxWidth: '620px', margin: '0 auto', lineHeight: '1.6' }}>
            Karoları tek platformda keşfedin, kendi mekânınızda yapay zekâ ve 3D ile deneyimleyin, yetkili bayilerden teklif alın.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '18px', marginBottom: '24px' }}>
          {/* Step 1 */}
          <div style={{ padding: '26px 24px', borderRadius: '18px', position: 'relative', overflow: 'hidden', border: '1px solid var(--sb-border, #E5DED3)', background: 'var(--sb-surface, #FFFFFF)', boxShadow: '0 4px 16px -4px rgba(41,40,36,0.03)' }}>
            <div style={{ position: 'absolute', top: '16px', right: '20px', fontSize: '2.3rem', fontWeight: '900', color: 'rgba(181,139,80,0.14)', lineHeight: 1 }}>
              01
            </div>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'var(--sb-bg-primary, #F6F3EE)', border: '1px solid var(--sb-border, #E5DED3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--sb-accent-bronze, #B58B50)', marginBottom: '18px' }}>
              <Search size={20} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--sb-text-primary, #292824)', marginBottom: '8px', letterSpacing: '-0.01em' }}>
              01 — Keşfet
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--sb-text-secondary, #77736B)', lineHeight: '1.6', margin: 0 }}>
              Binlerce seramik modelini tek platformda karşılaştırın. Ebat, doku, yüzey ve mekân tipine göre projenize en uygun koleksiyonu seçin.
            </p>
          </div>

          {/* Step 2 */}
          <div style={{ padding: '26px 24px', borderRadius: '18px', position: 'relative', overflow: 'hidden', border: '1px solid var(--sb-border, #E5DED3)', background: 'var(--sb-surface, #FFFFFF)', boxShadow: '0 4px 16px -4px rgba(41,40,36,0.03)' }}>
            <div style={{ position: 'absolute', top: '16px', right: '20px', fontSize: '2.3rem', fontWeight: '900', color: 'rgba(181,139,80,0.14)', lineHeight: 1 }}>
              02
            </div>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'var(--sb-bg-primary, #F6F3EE)', border: '1px solid var(--sb-border, #E5DED3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--sb-accent-bronze, #B58B50)', marginBottom: '18px' }}>
              <Sparkles size={20} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--sb-text-primary, #292824)', marginBottom: '8px', letterSpacing: '-0.01em' }}>
              02 — Mekânında Dene
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--sb-text-secondary, #77736B)', lineHeight: '1.6', margin: 0 }}>
              3D Sanal Stüdyo ve AI teknolojisiyle seçiminizi gerçek mekânınızda görün. Derz rengi, döşeme yönü ve ışık uyumunu satın almadan önce test edin.
            </p>
          </div>

          {/* Step 3 */}
          <div style={{ padding: '26px 24px', borderRadius: '18px', position: 'relative', overflow: 'hidden', border: '1px solid var(--sb-border, #E5DED3)', background: 'var(--sb-surface, #FFFFFF)', boxShadow: '0 4px 16px -4px rgba(41,40,36,0.03)' }}>
            <div style={{ position: 'absolute', top: '16px', right: '20px', fontSize: '2.3rem', fontWeight: '900', color: 'rgba(181,139,80,0.14)', lineHeight: 1 }}>
              03
            </div>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'var(--sb-bg-primary, #F6F3EE)', border: '1px solid var(--sb-border, #E5DED3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--sb-accent-bronze, #B58B50)', marginBottom: '18px' }}>
              <CheckCircle2 size={20} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--sb-text-primary, #292824)', marginBottom: '8px', letterSpacing: '-0.01em' }}>
              03 — Teklif Al
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--sb-text-secondary, #77736B)', lineHeight: '1.6', margin: 0 }}>
              Türkiye genelindeki yetkili bayilerden ücretsiz fiyat teklifi alın. Metrajınıza uygun stok ve teslimat bilgisini doğrudan yetkili satıcıdan öğrenin.
            </p>
          </div>
        </div>

        {/* 2. GÜVEN VE MARKA DEĞERİ (4 KART) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '18px', borderRadius: '16px', background: 'var(--sb-bg-secondary, #EAE5DC)', border: '1px solid var(--sb-border, #E5DED3)' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'var(--sb-surface, #FFFFFF)', border: '1px solid var(--sb-border, #E5DED3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--sb-accent-bronze, #B58B50)', flexShrink: 0 }}>
              <ShieldCheck size={19} />
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--sb-text-primary, #292824)', marginBottom: '3px' }}>Orijinal Ürünler</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--sb-text-secondary, #77736B)', lineHeight: '1.45' }}>Lider seramik üreticilerinin orijinal katalog koleksiyonları</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '18px', borderRadius: '16px', background: 'var(--sb-bg-secondary, #EAE5DC)', border: '1px solid var(--sb-border, #E5DED3)' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'var(--sb-surface, #FFFFFF)', border: '1px solid var(--sb-border, #E5DED3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--sb-accent-bronze, #B58B50)', flexShrink: 0 }}>
              <Layers size={19} />
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--sb-text-primary, #292824)', marginBottom: '3px' }}>Yetkili Bayi Ağı</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--sb-text-secondary, #77736B)', lineHeight: '1.45' }}>Türkiye genelindeki yetkili showroom ve satış noktaları</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '18px', borderRadius: '16px', background: 'var(--sb-bg-secondary, #EAE5DC)', border: '1px solid var(--sb-border, #E5DED3)' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'var(--sb-surface, #FFFFFF)', border: '1px solid var(--sb-border, #E5DED3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--sb-accent-bronze, #B58B50)', flexShrink: 0 }}>
              <Sparkles size={19} />
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--sb-text-primary, #292824)', marginBottom: '3px' }}>AI Destekli Görselleştirme</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--sb-text-secondary, #77736B)', lineHeight: '1.45' }}>Satın almadan önce kendi fotoğrafınızda ve 3D stüdyoda deneyim</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '18px', borderRadius: '16px', background: 'var(--sb-bg-secondary, #EAE5DC)', border: '1px solid var(--sb-border, #E5DED3)' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'var(--sb-surface, #FFFFFF)', border: '1px solid var(--sb-border, #E5DED3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--sb-accent-bronze, #B58B50)', flexShrink: 0 }}>
              <Calculator size={19} />
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--sb-text-primary, #292824)', marginBottom: '3px' }}>Ücretsiz Teklif Alma</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--sb-text-secondary, #77736B)', lineHeight: '1.45' }}>Komisyonsuz ve ücretsiz doğrudan bayi fiyat teklifi talebi</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. SIKÇA SORULAN SORULAR (Section L: Açık nötr yüzey) */}
      <div
        className="home-faq-container"
        style={{
          background: 'var(--sb-surface, #FFFFFF)',
          border: '1px solid var(--sb-border, #E5DED3)',
          borderRadius: '24px',
          padding: 'clamp(28px, 4vw, 44px)',
          boxShadow: '0 8px 28px -8px rgba(41, 40, 36, 0.04)'
        }}
      >
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--sb-accent-bronze, #B58B50)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '6px' }}>
              YARDIM VE REHBER
            </span>
            <h2 style={{ fontSize: 'clamp(1.4rem, 2.3vw, 1.85rem)', fontWeight: '800', color: 'var(--sb-text-primary, #292824)', margin: '0 0 8px 0', letterSpacing: '-0.02em', fontFamily: 'var(--font-title, "Outfit", sans-serif)' }}>
              Sıkça Sorulan Sorular
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--sb-text-secondary, #77736B)', margin: 0 }}>
              SeramikBak kullanımı, bayi fiyat teklifleri ve 3D stüdyo hakkında merak ettikleriniz.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openIdx === idx;
              return (
                <div
                  key={idx}
                  style={{
                    borderRadius: '14px',
                    border: isOpen ? '1px solid var(--sb-accent-bronze, #B58B50)' : '1px solid var(--sb-border, #E5DED3)',
                    background: isOpen ? 'var(--sb-bg-primary, #F6F3EE)' : 'var(--sb-surface, #FFFFFF)',
                    overflow: 'hidden',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '16px',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      color: 'var(--sb-text-primary, #292824)',
                      fontFamily: 'inherit'
                    }}
                    aria-expanded={isOpen}
                  >
                    <span style={{ fontSize: '0.94rem', fontWeight: '700', lineHeight: '1.4' }}>
                      {item.q}
                    </span>
                    <ChevronDown
                      size={18}
                      style={{
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.25s ease',
                        color: isOpen ? 'var(--sb-accent-bronze, #B58B50)' : 'var(--sb-text-secondary, #77736B)',
                        flexShrink: 0
                      }}
                    />
                  </button>

                  {isOpen && (
                    <div
                      style={{
                        padding: '14px 20px 18px 20px',
                        fontSize: '0.88rem',
                        lineHeight: '1.65',
                        color: 'var(--sb-text-secondary, #77736B)',
                        borderTop: '1px solid var(--sb-border, #E5DED3)'
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
          <div style={{ marginTop: '28px', padding: '22px 24px', borderRadius: '16px', background: 'var(--sb-bg-primary, #F6F3EE)', border: '1px solid var(--sb-warm-beige, #D8C9B5)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '0.98rem', fontWeight: '800', color: 'var(--sb-text-primary, #292824)', marginBottom: '4px' }}>
                Sorunuza yanıt bulamadınız mı?
              </div>
              <div style={{ fontSize: '0.84rem', color: 'var(--sb-text-secondary, #77736B)' }}>
                Mimar ve teknik danışmanlarımız aklınıza takılan her konuda yardımcı olmaya hazır.
              </div>
            </div>
            <Link
              href="/iletisim"
              style={{
                padding: '11px 22px',
                borderRadius: '12px',
                background: 'var(--sb-surface-dark, #252522)',
                border: '1px solid var(--sb-accent-bronze, #B58B50)',
                color: '#F3E5AB',
                fontWeight: '700',
                fontSize: '0.86rem',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>Bize Ulaşın</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
