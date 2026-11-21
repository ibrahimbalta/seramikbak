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
    <section className="home-trust-faq-section" style={{ margin: '60px 0 30px 0', width: '100%' }}>
      {/* Schema.org FAQPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* 1. NASIL ÇALIŞIR? 3 ADIMLI REHBER */}
      <div className="how-it-works-block" style={{ marginBottom: '60px' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', background: 'rgba(179,142,71,0.1)', border: '1px solid rgba(179,142,71,0.3)', borderRadius: '999px', fontSize: '0.78rem', color: '#B38E47', fontWeight: '700', marginBottom: '12px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            <Sparkles size={13} />
            <span>NASIL ÇALIŞIR?</span>
          </div>
          <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.3rem)', fontWeight: '800', color: '#242424', margin: '0 0 10px 0', letterSpacing: '-0.02em' }}>
            3 Adımda Dijital Seramik Showroom Deneyimi
          </h2>
          <p style={{ fontSize: '0.96rem', color: '#5C5A54', maxWidth: '640px', margin: '0 auto', lineHeight: '1.6' }}>
            Karoları tek platformda keşfedin, kendi mekânınızda yapay zekâ ve 3D ile deneyimleyin, yetkili bayilerden teklif alın.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {/* Step 1 */}
          <div className="glass-panel" style={{ padding: '30px 26px', borderRadius: '20px', position: 'relative', overflow: 'hidden', border: '1px solid #E8E2D5', background: '#FFFFFF', boxShadow: '0 8px 24px rgba(36,36,36,0.03)' }}>
            <div style={{ position: 'absolute', top: '18px', right: '22px', fontSize: '2.6rem', fontWeight: '900', color: 'rgba(179,142,71,0.14)', lineHeight: 1 }}>
              01
            </div>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#FAF9F6', border: '1px solid #E8E2D5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B38E47', marginBottom: '20px' }}>
              <Search size={22} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#242424', marginBottom: '10px', letterSpacing: '-0.01em' }}>
              01 — Keşfet
            </h3>
            <p style={{ fontSize: '0.92rem', color: '#5C5A54', lineHeight: '1.65', margin: 0 }}>
              Binlerce seramik modelini tek platformda karşılaştırın. Ebat, doku, yüzey ve mekân tipine göre projenize en uygun koleksiyonu seçin.
            </p>
          </div>

          {/* Step 2 */}
          <div className="glass-panel" style={{ padding: '30px 26px', borderRadius: '20px', position: 'relative', overflow: 'hidden', border: '1px solid #E8E2D5', background: '#FFFFFF', boxShadow: '0 8px 24px rgba(36,36,36,0.03)' }}>
            <div style={{ position: 'absolute', top: '18px', right: '22px', fontSize: '2.6rem', fontWeight: '900', color: 'rgba(179,142,71,0.14)', lineHeight: 1 }}>
              02
            </div>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#FAF9F6', border: '1px solid #E8E2D5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B38E47', marginBottom: '20px' }}>
              <Sparkles size={22} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#242424', marginBottom: '10px', letterSpacing: '-0.01em' }}>
              02 — Mekânında Dene
            </h3>
            <p style={{ fontSize: '0.92rem', color: '#5C5A54', lineHeight: '1.65', margin: 0 }}>
              3D Sanal Stüdyo ve AI teknolojisiyle seçiminizi gerçek mekânınızda görün. Derz rengi, döşeme yönü ve ışık uyumunu satın almadan önce test edin.
            </p>
          </div>

          {/* Step 3 */}
          <div className="glass-panel" style={{ padding: '30px 26px', borderRadius: '20px', position: 'relative', overflow: 'hidden', border: '1px solid #E8E2D5', background: '#FFFFFF', boxShadow: '0 8px 24px rgba(36,36,36,0.03)' }}>
            <div style={{ position: 'absolute', top: '18px', right: '22px', fontSize: '2.6rem', fontWeight: '900', color: 'rgba(179,142,71,0.14)', lineHeight: 1 }}>
              03
            </div>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#FAF9F6', border: '1px solid #E8E2D5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B38E47', marginBottom: '20px' }}>
              <CheckCircle2 size={22} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#242424', marginBottom: '10px', letterSpacing: '-0.01em' }}>
              03 — Teklif Al
            </h3>
            <p style={{ fontSize: '0.92rem', color: '#5C5A54', lineHeight: '1.65', margin: 0 }}>
              Türkiye genelindeki yetkili bayilerden ücretsiz fiyat teklifi alın. Metrajınıza uygun stok ve teslimat bilgisini doğrudan yetkili satıcıdan öğrenin.
            </p>
          </div>
        </div>
      </div>

      {/* 2. GÜVEN VE MARKA DEĞERİ (4 KART) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '16px', marginBottom: '60px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '20px', borderRadius: '16px', background: '#FAF9F6', border: '1px solid #E8E2D5' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(179,142,71,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B38E47', flexShrink: 0 }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#242424', marginBottom: '4px' }}>Orijinal Ürünler</div>
            <div style={{ fontSize: '0.8rem', color: '#5C5A54', lineHeight: '1.5' }}>Lider seramik üreticilerinin orijinal katalog koleksiyonları</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '20px', borderRadius: '16px', background: '#FAF9F6', border: '1px solid #E8E2D5' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(179,142,71,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B38E47', flexShrink: 0 }}>
            <Layers size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#242424', marginBottom: '4px' }}>Yetkili Bayi Ağı</div>
            <div style={{ fontSize: '0.8rem', color: '#5C5A54', lineHeight: '1.5' }}>Türkiye genelindeki yetkili showroom ve satış noktaları</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '20px', borderRadius: '16px', background: '#FAF9F6', border: '1px solid #E8E2D5' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(179,142,71,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B38E47', flexShrink: 0 }}>
            <Sparkles size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#242424', marginBottom: '4px' }}>AI Destekli Görselleştirme</div>
            <div style={{ fontSize: '0.8rem', color: '#5C5A54', lineHeight: '1.5' }}>Satın almadan önce kendi fotoğrafınızda ve 3D stüdyoda deneyim</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '20px', borderRadius: '16px', background: '#FAF9F6', border: '1px solid #E8E2D5' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(179,142,71,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B38E47', flexShrink: 0 }}>
            <Calculator size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#242424', marginBottom: '4px' }}>Ücretsiz Teklif Alma</div>
            <div style={{ fontSize: '0.8rem', color: '#5C5A54', lineHeight: '1.5' }}>Komisyonsuz ve ücretsiz doğrudan bayi fiyat teklifi talebi</div>
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
