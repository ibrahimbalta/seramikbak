'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Shield, FileText, Settings } from 'lucide-react';

function LegalContentReader() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('kvkk');

  // Dynamic States
  const [legalData, setLegalData] = useState({
    kvkk: `
      <p>SeramikBak Teknoloji A.Ş. (“SeramikBak” veya “Şirket”) olarak, çevrimiçi ziyaretçilerimizin, bayilerimizin ve marka ortaklarımızın kişisel verilerinin korunmasına büyük önem veriyoruz. Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu (“Kanun”) kapsamında veri sorumlusu sıfatıyla tarafımızca toplanan verilerin işlenme şartlarını açıklamak amacıyla hazırlanmıştır.</p>
      <h3>1. Hangi Kişisel Verileri İşliyoruz?</h3>
      <p>SeramikBak platformunu kullanımınız sırasında aşağıdaki verileriniz işlenmektedir:</p>
      <ul>
        <li><strong>Kimlik ve İletişim Bilgileri:</strong> Adınız, soyadınız, telefon numaranız, e-posta adresiniz (üye olurken veya bayilerden teklif isterken sağladığınız bilgiler).</li>
        <li><strong>Konum Bilgileri:</strong> Bayi bulucu aracılığıyla en yakın bayiyi göstermek için tarayıcı izninizle toplanan yaklaşık coğrafi koordinatlarınız.</li>
        <li><strong>Kullanım ve İşlem Bilgileri:</strong> Arama geçmişiniz, tıkladığınız ve karşılaştırdığınız seramik modelleri, stüdyoya yüklediğiniz zemin fotoğrafları.</li>
      </ul>
      <h3>2. Veri İşleme Amaçlarımız</h3>
      <p>Toplanan kişisel verileriniz, aşağıdaki hukuki ve ticari amaçlarla işlenmektedir:</p>
      <ul>
        <li>Beğendiğiniz seramik ürünleriyle ilgili size en yakın bayiden teklif/bilgi almanızı sağlamak.</li>
        <li>Odanızın fotoğrafına seramik giydirebilmeniz için 3D Sanal Stüdyo hizmetini sunmak.</li>
        <li>B2B marka ortaklarımızın reklam ve ürün analizlerini yürüterek platform performansını iyileştirmek.</li>
      </ul>
    `,
    kullanim: `
      <p>Lütfen SeramikBak internet sitesini (seramikbak.com) ve mobil uygulamasını kullanmadan önce bu kullanım koşullarını dikkatlice okuyunuz. Sitemizi kullanarak bu koşulları peşinen kabul etmiş sayılırsınız.</p>
      <h3>1. Hizmetin Niteliği</h3>
      <p>SeramikBak, seramik üreticisi markaları ve onun yetkili satıcılarını tüketicilerle buluşturan bağımsız bir arama motoru, karşılaştırma ve 3D görselleştirme portalıdır. SeramikBak, doğrudan seramik satışı yapmaz, ödeme tahsil etmez ve nakliye süreçlerini üstlenmez. Tüm ticari alışveriş ilişkisi son kullanıcı ile bağımsız yetkili bayiler arasında gerçekleşir.</p>
      <h3>2. Fikri Mülkiyet Hakları</h3>
      <p>Sitede yer alan tüm yazılımlar, tasarım kodları, logolar, 3D stüdyo algoritmaları ve sergilenen ürün görselleri/doku kaplamaları SeramikBak'a veya lisans ortaklarına aittir.</p>
    `,
    cerez: `
      <p>SeramikBak internet sitesinde, ziyaretçilerimize daha iyi bir kullanıcı deneyimi sunabilmek ve platform trafiğini analiz edebilmek amacıyla çerezler (cookies) kullanılmaktadır. Çerezler, tarayıcınız aracılığıyla bilgisayarınıza veya mobil cihazınıza kaydedilen küçük metin dosyalarıdır.</p>
      <h3>1. Kullandığımız Çerez Türleri</h3>
      <ul>
        <li><strong>Zorunlu Çerezler:</strong> Sitenin düzgün çalışması, üye girişi yapılabilmesi ve favori seramiklerinizin tarayıcıda saklanabilmesi için zorunlu olan teknik çerezlerdir.</li>
        <li><strong>Performans Çerezleri:</strong> Aramaları ölçümleyerek sitemizi optimize etmemize yarayan çerezlerdir.</li>
      </ul>
    `,
    'bayi-sozlesme': `
      <p>Bu sözleşme, SeramikBak Platformu ile platforma yetkili bayi olarak kayıt yaptıran ticari işletmeler (Bayi) arasındaki hak, yükümlülük ve üyelik şartlarını düzenler.</p>
      <h3>1. Hizmetin Tanımı ve Kapsamı</h3>
      <p>SeramikBak, Bayi'ye kendi marka yetkisinde bulunan seramik ürünlerinin envanter ve stok durumlarını dijital showroom ekranlarında sergileme ve son kullanıcılardan teklif talebi (lead) alma imkanı sunar.</p>
      <h3>2. Bayinin Yükümlülükleri</h3>
      <ul>
        <li><strong>Bilgi Doğruluğu:</strong> Bayi, platform üzerinde sergilediği fiyat, stok ve lojistik/teslimat bilgilerinin doğruluğunu garanti eder.</li>
        <li><strong>Müşteri Geri Dönüşleri:</strong> Bayi, platform üzerinden kendisine iletilen son kullanıcı teklif taleplerine makul iş süreleri (en geç 48 saat) içerisinde dönüş yapmayı taahhüt eder.</li>
        <li><strong>Üyelik ve Paketler:</strong> Bayi, seçtiği üyelik planı (LITE, STANDART, PREMIUM) kapsamındaki ödeme ve abonelik şartlarına uymakla yükümlüdür.</li>
      </ul>
      <h3>3. Sözleşmenin Feshi</h3>
      <p>SeramikBak, yanlış bilgi beyan eden, kullanıcıları yanıltıcı işlemler yapan veya B2B etik kurallarına uymayan bayilerin üyeliklerini tek taraflı olarak askıya alma veya iptal etme hakkını saklı tutar.</p>
    `
  });

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['kvkk', 'kullanim', 'cerez', 'bayi-sozlesme'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data && data.page_yasal_content) {
          setLegalData(data.page_yasal_content);
        }
      })
      .catch(err => console.error('Failed to load legal settings:', err));
  }, []);

  const tabs = [
    {
      id: 'kvkk',
      label: 'KVKK ve Gizlilik',
      icon: <Shield size={16} />,
      title: 'Kişisel Verilerin Korunması Kanunu (KVKK) ve Gizlilik Politikası',
      content: legalData.kvkk
    },
    {
      id: 'kullanim',
      label: 'Kullanım Koşulları',
      icon: <FileText size={16} />,
      title: 'SeramikBak Platformu Kullanım Koşulları',
      content: legalData.kullanim
    },
    {
      id: 'cerez',
      label: 'Çerez Politikası',
      icon: <Settings size={16} />,
      title: 'Çerez (Cookie) Kullanımı ve Bildirim Metni',
      content: legalData.cerez
    },
    {
      id: 'bayi-sozlesme',
      label: 'Bayi Üyelik Sözleşmesi',
      icon: <FileText size={16} />,
      title: 'SeramikBak Yetkili Bayi Üyelik Sözleşmesi',
      content: legalData['bayi-sozlesme'] || ''
    }
  ];

  const currentTab = tabs.find(t => t.id === activeTab) || tabs[0];

  return (
    <div style={{
      maxWidth: '1100px',
      margin: '0 auto',
      padding: '60px 24px 100px 24px',
      position: 'relative',
      zIndex: 1
    }}>
      
      {/* Title */}
      <section style={{ textAlign: 'center', marginBottom: '65px' }}>
        <h1 style={{
          fontSize: 'clamp(2rem, 4vw, 2.6rem)',
          fontWeight: '900',
          letterSpacing: '-0.025em',
          margin: '0 0 16px 0'
        }}>Yasal Bilgilendirme ve Uyumluluk</h1>
        <p style={{
          fontSize: '1.05rem',
          color: '#64748b',
          maxWidth: '550px',
          margin: '0 auto',
          lineHeight: '1.5'
        }}>
          SeramikBak platformunun kullanım kuralları, veri işleme esasları ve gizlilik hakları hakkında yasal detaylar.
        </p>
      </section>

      {/* Tabs Layout */}
      <div style={{
        display: 'flex',
        gap: '32px',
        alignItems: 'flex-start',
        flexWrap: 'wrap'
      }}>
        {/* Left Sidebar Tabs */}
        <aside style={{
          flex: '1 1 240px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          background: '#ffffff',
          border: '1px solid rgba(0, 0, 0, 0.04)',
          padding: '16px',
          borderRadius: '20px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.015)'
        }}>
          {tabs.map(tab => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  background: isActive ? '#0f172a' : 'transparent',
                  color: isActive ? '#ffffff' : '#475569',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  textAlign: 'left',
                  transition: 'all 0.2s ease-out'
                }}
                className={isActive ? '' : 'tab-button-hover'}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Right Content Area */}
        <div style={{
          flex: '3 1 600px',
          background: '#ffffff',
          border: '1px solid rgba(0, 0, 0, 0.04)',
          borderRadius: '24px',
          padding: '40px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.015)',
          minHeight: '400px'
        }}>
          <h2 style={{
            fontSize: '1.35rem',
            fontWeight: '900',
            color: '#0f172a',
            borderBottom: '1px solid #f1f5f9',
            paddingBottom: '16px',
            marginBottom: '24px',
            lineHeight: '1.3'
          }}>{currentTab.title}</h2>
          
          <div 
            style={{
              fontSize: '0.9rem',
              lineHeight: '1.65',
              color: '#334155'
            }}
            className="legal-doc-content"
            dangerouslySetInnerHTML={{ __html: currentTab.content }}
          />
        </div>
      </div>
    </div>
  );
}

export default function LegalCompliancePage() {
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
        left: 0,
        right: 0,
        height: '400px',
        background: 'radial-gradient(circle at top, rgba(179, 142, 71, 0.05) 0%, transparent 60%)',
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

      {/* Reader wrapper with Next.js searchParams boundary */}
      <Suspense fallback={
        <div style={{ textAlign: 'center', padding: '100px 0', color: '#64748b' }}>
          <span>Yükleniyor...</span>
        </div>
      }>
        <LegalContentReader />
      </Suspense>

      <style jsx global>{`
        .back-link-hover:hover {
          color: #b38e47 !important;
          transform: translateX(-3px);
        }
        .tab-button-hover:hover {
          background: rgba(15, 23, 42, 0.04) !important;
          color: #0f172a !important;
        }
        
        /* Rendered Legal Doc styles */
        .legal-doc-content h3 {
          font-size: 1.1rem;
          font-weight: 800;
          margin-top: 24px;
          margin-bottom: 12px;
          color: #0f172a;
        }
        .legal-doc-content p {
          margin-bottom: 16px;
        }
        .legal-doc-content ul {
          padding-left: 20px;
          margin-bottom: 16px;
        }
        .legal-doc-content li {
          margin-bottom: 8px;
        }
      `}</style>
    </main>
  );
}
