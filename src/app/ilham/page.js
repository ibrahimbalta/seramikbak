'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, BookOpen, Compass, ChevronRight, X, Clock, HelpCircle } from 'lucide-react';

export default function InspirationGalleryPage() {
  const [selectedArticle, setSelectedArticle] = useState(null);

  const galleryItems = [
    {
      title: 'İskandinav Ahşap Zarafeti',
      desc: 'Banyo ve mutfaklarda sıcacık, doğal bir doku.',
      style: 'Ahşap',
      tag: 'Minimalist',
      img: '/hero/scandinavian_kitchen.png'
    },
    {
      title: 'Lüks Calacatta Mermer',
      desc: 'Geniş banyolarda kesintisiz ve camsı parlak yansımalar.',
      style: 'Mermer',
      tag: 'Premium Luxury',
      img: '/hero/luxury_bathroom.png'
    },
    {
      title: 'Endüstriyel Beton & Loft',
      desc: 'Salon ve koridorlarda modern brütist gri tonlar.',
      style: 'Beton',
      tag: 'Modern',
      img: '/hero/modern_living.png'
    }
  ];

  const articles = [
    {
      id: 1,
      title: 'Rektifiyeli Seramik Nedir? Derz Aralıkları Nasıl Olmalıdır?',
      summary: 'Seramiklerin kenarlarının lazerle kesilerek dikleştirilmesi işlemine rektifiye denir. Peki montajda nelere dikkat edilmeli?',
      category: 'Teknik Rehber',
      readTime: '4 dk okuma',
      content: `
        <h3>Rektifiyeli Seramik Nedir?</h3>
        <p>Rektifiyeli seramik veya porselen karolar, pişirilme aşamasından sonra kenarlarının özel elmas bıçaklarla traşlanarak tam 90 derecelik dik açılara getirilmesi işlemidir. Standart seramiklerde kenarlar hafif yuvarlak ve pahlı gelirken, rektifiyeli ürünlerin kenarları jilet gibi düzdür.</p>
        
        <h3>Rektifiyeli Seramiklerin Avantajları Nelerdir?</h3>
        <ul>
          <li><strong>Minimum Derz Boşluğu:</strong> Kenarları dik açılı olduğu için karolar birbirine çok daha yakın döşenebilir. Genellikle 1mm - 1.5mm gibi incecik derzlerle neredeyse kesintisiz bir yüzey görünümü elde edilir.</li>
          <li><strong>Lüks ve Geniş Görünüm:</strong> Özellikle 60x120 cm gibi ebatlarda derz çizgileri çok az fark edildiği için oda olduğundan çok daha geniş, elit ve modern görünür.</li>
          <li><strong>Kolay Temizlik:</strong> Kalın derz dolguları zamanla kirlenir ve sararır. Rektifiyeli karolarda derz alanı minimumda olduğu için derz temizleme derdi de neredeyse yok denecek kadar azdır.</li>
        </ul>

        <h3>Döşerken Nelere Dikkat Edilmelidir?</h3>
        <p>Kenarlar tamamen dik olduğu için zeminin şapı ve terazisi kusursuz olmalıdır. En ufak yükseklik farkı (diş yapma) durumunda ayağınız kenara takılabilir. Rektifiyeli ürün döşerken mutlaka profesyonel seramik klipsleri ve takozları kullanılmalıdır.</p>
      `
    },
    {
      id: 2,
      title: 'Mat mı, Parlak (Cilalı) Porselen mi? Doğru Seçim Nasıl Yapılır?',
      summary: 'Zemin ve duvar karolarında mat ve parlak yüzeylerin kaymazlık, leke tutma ve ışık yansıtma karşılaştırması.',
      category: 'Tasarım İpuçları',
      readTime: '5 dk okuma',
      content: `
        <h3>Mat ve Parlak Karoların Karşılaştırması</h3>
        <p>Seramik seçiminde en çok kararsız kalınan noktalardan biri yüzey bitişidir. Doğru karar verebilmek için odanın ışık alma durumu ve kullanım amacı dikkate alınmalıdır.</p>

        <h3>Parlak (Lappato / Full Lappato) Seramikler</h3>
        <p>Parlak karolar, üzerlerindeki camsı veya cilalı sır tabakası sayesinde ışığı yansıtırlar.</p>
        <ul>
          <li><strong>Nerede Kullanılmalı?</strong> Işığı az alan dar banyolar, holler ve salon duvarları için mükemmeldir. Odayı aydınlık ve ferah gösterir.</li>
          <li><strong>Temizlik:</strong> Leke ve tozları kolay silinir ancak su damlası ve parmak izini mat karolara göre daha çok belli eder.</li>
          <li><strong>Önemli Uyarı:</strong> Islakken kayganlaşırlar. Bu nedenle banyo zeminleri veya dış mekan merdivenleri için önerilmez.</li>
        </ul>

        <h3>Mat Seramikler</h3>
        <p>Mat karolar ışığı soğurur ve daha doğal, taşsı/topraksı bir doku sunar.</p>
        <ul>
          <li><strong>Nerede Kullanılmalı?</strong> Banyo zeminleri, mutfak zeminleri, balkonlar, teraslar ve yaya trafiğinin yoğun olduğu alanlar.</li>
          <li><strong>Kaymazlık Değeri (R Derecesi):</strong> Islak zeminler için mutlaka R10 veya R11 sınıfı mat seramikler tercih edilmelidir. Bu değer karonun kaymaya karşı direncini gösterir.</li>
          <li><strong>Hissiyat:</strong> Yaşam alanlarına daha sıcak, sakin ve elit bir modernlik katar.</li>
        </ul>
      `
    },
    {
      id: 3,
      title: '2026 Banyo Tasarım Trendleri: Doğallığa Dönüş ve Toprak Tonları',
      summary: 'Bu yıl banyolarda mermer soğukluğundan ziyade sıcak traverten tonları, ham meşe ahşap dokuları ve yeşil bitkiler hakim.',
      category: 'Trendler',
      readTime: '3 dk okuma',
      content: `
        <h3>2026 Banyo Tasarımlarında Öne Çıkanlar</h3>
        <p>Banyolar artık sadece temizlenilen alanlar değil; evlerin kişisel spa merkezleri ve dinlenme köşeleri haline geldi. İşte 2026 yılında banyonuzu yenilerken ilham alabileceğiniz ana akımlar:</p>

        <h3>1. Sıcak Traverten ve Bej Tonları</h3>
        <p>Soğuk gri ve antrasit tonlar yerini kemik rengi, bej, sıcak krem ve traverten desenli seramiklere bırakıyor. Bu renkler banyoya lüks bir otel spası havası katıyor.</p>

        <h3>2. Ahşap Dokusu ile Islak Hacimlerin Uyumu</h3>
        <p>Seramik teknolojisindeki gelişmeler sayesinde gerçek ahşaptan ayırt edilemeyen porselen karolar üretiliyor. Duş kabininin arka duvarında veya zemininde kullanılan ahşap görünümlü seramikler banyoya sıcaklık kazandırıyor.</p>

        <h3>3. Metalik Dokunuşlar & Derz Tasarımları</h3>
        <p>Klasik krom bataryalar yerine mat fırçalanmış bronz veya altın bataryalar tercih ediliyor. Bu bataryalar sıcak traverten karolarla mükemmel bir görsel uyum yakalıyor.</p>
      `
    }
  ];

  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      fontFamily: 'Inter, system-ui, sans-serif',
      color: '#0f172a',
      position: 'relative',
      overflowX: 'hidden'
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: '10%',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(179, 142, 71, 0.05) 0%, transparent 60%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* Header navbar */}
      <header style={{
        background: 'rgba(255, 255, 255, 0.8)',
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
            <span style={{ fontSize: '1.1rem', fontWeight: '800' }}>SeramikBak</span>
          </div>
        </div>
      </header>

      {/* Page Contents */}
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '60px 24px 100px 24px',
        position: 'relative',
        zIndex: 1
      }}>

        {/* Intro */}
        <section style={{ textAlign: 'center', marginBottom: '60px' }}>
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
            marginBottom: '16px'
          }}>
            <Compass size={12} />
            <span>İlham Galerisi & Tasarım Fikirleri</span>
          </div>
          <h1 style={{
            fontSize: 'clamp(2rem, 4.5vw, 2.8rem)',
            fontWeight: '900',
            letterSpacing: '-0.025em',
            margin: '0 0 16px 0'
          }}>Yaşam Alanınız İçin En Güzel İlhamı Keşfedin</h1>
          <p style={{
            fontSize: '1.1rem',
            color: '#64748b',
            maxWidth: '650px',
            margin: '0 auto',
            lineHeight: '1.5'
          }}>
            Evinizi dekore ederken veya banyonuzu yenilerken profesyonel mimari fikirlerden ve teknik seramik rehberlerimizden yararlanın.
          </p>
        </section>

        {/* Gallery Visual Grid */}
        <section style={{ marginBottom: '80px' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} style={{ color: '#b38e47' }} />
            Mimari Tasarım & Stil Kombinasyonları
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            {galleryItems.map((item, idx) => (
              <div key={idx} style={{
                background: '#ffffff',
                border: '1px solid rgba(0, 0, 0, 0.04)',
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.01)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.25s'
              }} className="gallery-card-hover">
                <div style={{ height: '220px', position: 'relative', background: '#e2e8f0', overflow: 'hidden' }}>
                  <img 
                    src={item.img} 
                    alt={item.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
                    className="gallery-image"
                  />
                  <div style={{
                    position: 'absolute',
                    top: '16px',
                    left: '16px',
                    background: 'rgba(15, 23, 42, 0.85)',
                    backdropFilter: 'blur(4px)',
                    color: '#ffffff',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    fontSize: '0.7rem',
                    fontWeight: '700'
                  }}>{item.tag}</div>
                </div>
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0 }}>{item.title}</h4>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0, lineHeight: '1.4' }}>{item.desc}</p>
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '16px',
                    paddingTop: '16px',
                    borderTop: '1px solid #f1f5f9'
                  }}>
                    <span style={{ fontSize: '0.78rem', color: '#8c6b30', fontWeight: '600' }}>Tür: {item.style}</span>
                    <Link href={`/?q=${item.style.toLowerCase()}`} style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      fontSize: '0.78rem',
                      fontWeight: '700',
                      color: '#0f172a',
                      textDecoration: 'none'
                    }} className="link-hover">
                      <span>Benzer Ürünleri Gör</span>
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Blog & Educational Articles */}
        <section>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={20} style={{ color: '#b38e47' }} />
            Seramik ve Fayans Seçim Rehberleri (Blog)
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px'
          }}>
            {articles.map(article => (
              <div 
                key={article.id}
                onClick={() => setSelectedArticle(article)}
                style={{
                  background: '#ffffff',
                  border: '1px solid rgba(0, 0, 0, 0.04)',
                  borderRadius: '24px',
                  padding: '30px',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.01)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, border-color 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
                className="article-card-hover"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    background: 'rgba(179, 142, 71, 0.08)',
                    color: '#b38e47',
                    padding: '3px 10px',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    fontWeight: '700'
                  }}>{article.category}</span>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} />
                    {article.readTime}
                  </span>
                </div>
                
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0, lineHeight: '1.4', color: '#0f172a' }}>
                  {article.title}
                </h3>
                
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0, lineHeight: '1.5' }}>
                  {article.summary}
                </p>

                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  color: '#b38e47',
                  marginTop: 'auto',
                  paddingTop: '12px'
                }}>
                  <span>Devamını Oku</span>
                  <ChevronRight size={14} />
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* Article Detail Overlay Modal */}
      {selectedArticle && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '24px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '28px',
            width: '100%',
            maxWidth: '680px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            position: 'relative',
            animation: 'modalFadeIn 0.3s ease-out'
          }}>
            {/* Header / Banner area */}
            <div style={{
              padding: '24px 32px 16px 32px',
              borderBottom: '1px solid #f1f5f9',
              position: 'sticky',
              top: 0,
              background: '#ffffff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              zIndex: 5
            }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#b38e47', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{selectedArticle.category}</span>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '900', margin: '4px 0 0 0', tracking: '-0.02em', color: '#0f172a' }}>{selectedArticle.title}</h2>
              </div>
              <button 
                onClick={() => setSelectedArticle(null)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#475569',
                  transition: 'background 0.2s',
                  flexShrink: 0
                }}
                className="close-btn-hover"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content area */}
            <div 
              style={{ padding: '32px' }}
              className="article-detail-body"
              dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
            />

            {/* Footer */}
            <div style={{
              padding: '20px 32px',
              background: '#f8fafc',
              borderTop: '1px solid #f1f5f9',
              display: 'flex',
              justifyContent: 'flex-end'
            }}>
              <button 
                onClick={() => setSelectedArticle(null)}
                style={{
                  background: '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '10px 24px',
                  fontWeight: '700',
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .back-link-hover:hover {
          color: #b38e47 !important;
          transform: translateX(-3px);
        }
        .gallery-card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.03) !important;
        }
        .gallery-card-hover:hover .gallery-image {
          transform: scale(1.05);
        }
        .article-card-hover:hover {
          transform: translateY(-2px);
          border-color: rgba(179, 142, 71, 0.3) !important;
          box-shadow: 0 10px 30px rgba(179, 142, 71, 0.02) !important;
        }
        .link-hover:hover {
          color: #b38e47 !important;
        }
        .close-btn-hover:hover {
          background: #e2e8f0 !important;
          color: #0f172a !important;
        }
        
        /* Rendered Article styles */
        .article-detail-body h3 {
          font-size: 1.15rem;
          font-weight: 800;
          margin-top: 24px;
          margin-bottom: 12px;
          color: #0f172a;
        }
        .article-detail-body h3:first-of-type {
          margin-top: 0;
        }
        .article-detail-body p {
          font-size: 0.92rem;
          line-height: 1.65;
          color: #475569;
          margin-bottom: 16px;
        }
        .article-detail-body ul {
          padding-left: 20px;
          margin-bottom: 16px;
        }
        .article-detail-body li {
          font-size: 0.92rem;
          line-height: 1.6;
          color: #475569;
          margin-bottom: 8px;
        }
        
        @keyframes modalFadeIn {
          from {
            opacity: 0;
            transform: scale(0.96) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </main>
  );
}
