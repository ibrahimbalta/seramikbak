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
      <p><strong>SeramikBak Teknoloji A.Ş.</strong> (“SeramikBak” veya “Şirket”) olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) uyarınca veri sorumlusu sıfatıyla, ziyaretçilerimizin, bayilerimizin ve marka ortaklarımızın kişisel verilerinin korunmasına ve güvenliğine büyük önem veriyoruz. Bu metin, verilerinizin toplanma yöntemleri, işlenme amaçları, aktarıldığı taraflar ve yasal haklarınız hakkında sizleri bilgilendirmek amacıyla hazırlanmıştır.</p>

      <h3>1. İşlenen Kişisel Veri Kategorileri</h3>
      <p>Platformumuzu kullanımınız ve üyelik süreçleriniz kapsamında aşağıdaki kişisel verileriniz işlenmektedir:</p>
      <ul>
        <li><strong>Kimlik Bilgileri:</strong> Adınız, soyadınız.</li>
        <li><strong>İletişim Bilgileri:</strong> E-posta adresiniz, telefon numaranız, kayıtlı bayi adresiniz.</li>
        <li><strong>Konum Bilgileri:</strong> Bayi Bulucu (Dealer Locator) özelliği aracılığıyla size en yakın yetkili bayiyi gösterebilmek için tarayıcınızın izniyle toplanan coğrafi koordinatlarınız.</li>
        <li><strong>Görsel Veriler:</strong> 3D Sanal Stüdyo hizmetimizi kullanırken sisteme yüklediğiniz mekan ve oda fotoğraflarınız.</li>
        <li><strong>İşlem ve Kullanım Güvenliği:</strong> IP adresiniz, tarayıcı log kayıtları, arama geçmişiniz ve favorilere eklediğiniz seramik ürünleri.</li>
      </ul>

      <h3>2. Kişisel Verilerin İşlenme Amaçları</h3>
      <p>Kişisel verileriniz, KVKK'nın 5. ve 6. maddelerinde belirtilen şartlara uygun olarak aşağıdaki amaçlarla işlenmektedir:</p>
      <ul>
        <li>Müşterilerin beğendiği seramik modellerine ilişkin bölgedeki en yakın bayilerden hızlı ve şeffaf fiyat teklifi (Lead) alabilmesini sağlamak.</li>
        <li>3D Sanal Stüdyo (Three.js destekli görselleştirici) aracılığıyla kullanıcıların kendi odalarının fotoğraflarına seramik döşeyerek tasarım yapabilmesini sağlamak.</li>
        <li>Bayi ve marka üyelik başvurularının değerlendirilmesi, SaaS aboneliklerinin kurulması ve faturalandırma süreçlerinin yönetilmesi.</li>
        <li>Platform performansının ölçümlenmesi, arama algoritmasının iyileştirilmesi ve kullanıcılara özelleştirilmiş tasarım önerileri sunulması.</li>
      </ul>

      <h3>3. İşlenen Verilerin Aktarılması</h3>
      <p>Toplanan kişisel verileriniz; işbu aydınlatma metnindeki amaçlarla sınırlı olmak üzere, kullanıcının teklif talebini ilettiği <strong>yetkili bayilere</strong>, platform altyapısını sağlayan teknik iş ortaklarımıza ve ilgili yasal mevzuat uyarınca talep edilmesi durumunda adli ve idari makamlara aktarılabilecektir. Verileriniz üçüncü şahıslara ticari amaçlarla asla satılmamaktadır.</p>

      <h3>4. Toplama Yöntemi ve Hukuki Sebebi</h3>
      <p>Kişisel verileriniz, web sitemiz üzerindeki üyelik formları, teklif talep formları, 3D stüdyo modülü ve otomatik log kayıt sistemleri aracılığıyla tamamen dijital ortamlarda toplanmaktadır. İşlemenin hukuki sebebi; bir sözleşmenin kurulması veya ifasıyla doğrudan doğruya ilgili olması (KVKK m. 5/2-c), veri sorumlusunun hukuki yükümlülüğünü yerine getirebilmesi (KVKK m. 5/2-ç) ve temel hak ve özgürlüklerinize zarar vermemek kaydıyla meşru menfaatlerimizdir (KVKK m. 5/2-f). Konum verileri ve yüklenen fotoğraflar tamamen sizin açık rızanıza dayanarak işlenmektedir.</p>

      <h3>5. İlgili Kişi Olarak Haklarınız</h3>
      <p>KVKK'nın 11. maddesi uyarınca, verilerinizin işlenip işlenmediğini öğrenme, işlenmişse bilgi talep etme, işlenme amacını öğrenme, verilerin düzeltilmesini veya silinmesini isteme haklarına sahipsiniz. Haklarınızı kullanmak için <strong>kvkk@seramikbak.com</strong> e-posta adresinden veya adresimize yazılı başvuru yaparak bizimle her zaman iletişime geçebilirsiniz.</p>
    `,
    kullanim: `
      <p>Bu web sitesini (<strong>seramikbak.com</strong>) veya mobil uygulamalarını ziyaret ederek ve kullanarak, aşağıda belirtilen kullanım koşullarını, yasal şartları ve kuralları peşinen kabul etmiş sayılırsınız. Bu koşulları kabul etmiyorsanız lütfen platformu kullanmayınız.</p>

      <h3>1. Hizmetlerin Tanımı ve Sorumluluk Sınırı</h3>
      <p>SeramikBak, Türkiye'nin önde gelen seramik üreticisi markaları ile onların yetkili satıcı bayilerini tüketicilerle bir araya getiren bağımsız bir dijital showroom, karşılaştırma ve 3D tasarım portalıdır. <strong>SeramikBak doğrudan seramik satışı yapmaz, ödeme tahsil etmez ve lojistik/nakliye süreçlerini üstlenmez.</strong></p>
      <p>Sitede sergilenen ürünler, stok durumları ve fiyat teklifleri tamamen bağımsız bayiler tarafından sağlanmaktadır. Alıcı ile yetkili bayi arasında gerçekleşecek ticari alışverişlerden, sözleşmelerden, ürün teslimatlarından veya olası ayıplı mallardan kaynaklanan hukuki uyuşmazlıklardan SeramikBak sorumlu tutulamaz. Her türlü talep doğrudan muhatap bayiye yönlendirilmelidir.</p>

      <h3>2. Fikri Mülkiyet Hakları</h3>
      <p>Platformda yer alan tüm yazılımlar, tasarım kodları, arayüz elementleri, 3D stüdyo döşeme algoritmaları, SeramikBak markası, tescilli logolar ve sergilenen ürünlerin dijital dokuları (textures) SeramikBak'a veya ilgili üretici markalara aittir. Yazılı izin olmaksızın bu içeriklerin kopyalanması, kazınması (scraping), çoğaltılması veya ticari amaçlarla başka platformlarda kullanılması 5846 sayılı Fikir ve Sanat Eserleri Kanunu uyarınca yasaktır.</p>

      <h3>3. Kullanıcıların Yükümlülükleri</h3>
      <p>Kullanıcılar, platformu kullanırken yalnızca hukuka uygun amaçlarla işlem yapabilirler. 3D Sanal Stüdyo modülüne yüklenecek oda fotoğraflarının telif haklarının kullanıcıya ait olması veya kullanım izninin bulunması gerekmektedir. Sisteme virüs, zararlı kod yüklenmesi veya sunucuların işleyişini bozacak siber saldırı girişimlerinde bulunulması durumunda SeramikBak her türlü adli ve cezai takibat hakkını saklı tutar.</p>

      <h3>4. Değişiklik ve Kesintiler</h3>
      <p>SeramikBak, teknolojik gelişmeler ve yasal gereklilikler doğrultusunda web sitesinde sunduğu hizmetleri, arayüz tasarımlarını ve işbu kullanım koşullarını önceden bildirmeksizin tek taraflı olarak değiştirme, askıya alma veya sonlandırma hakkına sahiptir.</p>
    `,
    cerez: `
      <p>SeramikBak olarak, platformumuzu (<strong>seramikbak.com</strong>) ziyaret eden kullanıcılarımızın deneyimini optimize etmek, site trafiğini analiz etmek ve sponsorlu reklam çalışmalarımızı kişiselleştirmek amacıyla çerezler (cookies) ve benzeri takip teknolojileri kullanmaktayız.</p>

      <h3>1. Çerez Nedir?</h3>
      <p>Çerezler, ziyaret ettiğiniz internet siteleri tarafından tarayıcınız aracılığıyla cihazınıza (bilgisayar, tablet veya telefon) kaydedilen küçük metin dosyalarıdır. Çerezler sitenin sizi hatırlamasına, tercihlerinizin kaydedilmesine ve daha hızlı bir internet deneyimi yaşamanıza yardımcı olur.</p>

      <h3>2. Kullandığımız Çerez Türleri</h3>
      <ul>
        <li><strong>Zorunlu Çerezler:</strong> Web sitesinin temel fonksiyonlarının (üye girişi yapılması, güvenlik önlemleri, favori listenizin tarayıcıda saklanması) çalışması için zorunlu olan teknik çerezlerdir.</li>
        <li><strong>Analitik ve Performans Çerezleri:</strong> Sitemizi kaç kişinin ziyaret ettiğini, hangi seramik modellerinin daha çok aratıldığını ölçümlememize yarayan ve platformumuzu optimize etmemizi sağlayan anonim çerezlerdir.</li>
        <li><strong>İşlevsel Çerezler:</strong> İl ve ilçe seçiminizi veya bayi arama tercihlerini hatırlayarak sonraki ziyaretlerinizde size kolaylık sağlayan çerezlerdir.</li>
        <li><strong>Hedefleme ve Reklam Çerezleri:</strong> B2B marka ortaklarımızın sponsorlu ürün kampanyalarını doğru kitlelere ulaştırmak ve ilgi alanlarınıza en uygun seramik tasarımlarını göstermek amacıyla kullanılan çerezlerdir.</li>
      </ul>

      <h3>3. Çerezleri Nasıl Kontrol Edebilirsiniz?</h3>
      <p>Tarayıcınızın ayarlarını değiştirerek çerezleri kabul etmeyebilir, mevcut çerezleri silebilir veya bir site çerez kaydetmek istediğinde uyarı alabilirsiniz. Çerezlerin engellenmesi durumunda, 3D Sanal Stüdyo tercihleriniz ve üyelik giriş fonksiyonlarınız gibi sitenin bazı dinamik özellikleri düzgün çalışmayabilir. Popüler tarayıcılarda çerez yönetim ayarları genellikle "Ayarlar -> Gizlilik ve Güvenlik" menüsü altında yer almaktadır.</p>
    `,
    'bayi-sozlesme': `
      <p>İşbu Yetkili Bayi Üyelik Sözleşmesi (“Sözleşme”), <strong>SeramikBak Teknoloji A.Ş.</strong> (bundan böyle “SeramikBak” olarak anılacaktır) ile platforma yetkili bayi sıfatıyla kaydolan ticari işletme/şahıs şirketi (bundan böyle “Bayi” olarak anılacaktır) arasında, elektronik ortamda onaylandığı tarihte yürürlüğe girmiştir.</p>

      <h3>1. Sözleşmenin Konusu ve Kapsamı</h3>
      <p>Bu Sözleşme, Bayi'nin yetkili satıcısı olduğu seramik üretici markalarının ürünlerini, kendi stok ve fiyat bilgileriyle birlikte SeramikBak platformunda dijital olarak sergilemesini; tüketicilerden gelen satın alma ve bilgi taleplerine (Lead) erişmesini ve SeramikBak'ın sunduğu B2B SaaS panelini (LITE, STANDART veya PREMIUM üyelik planları kapsamında) kullanma şartlarını düzenler.</p>

      <h3>2. Tarafların Hak ve Yükümlülükleri</h3>
      <ul>
        <li><strong>Veri ve Bilgi Doğruluğu:</strong> Bayi, platforma yüklediği veya XML/API entegrasyonu ile aktardığı ürün envanteri, stok miktarı, birim fiyat ve lojistik/teslimat bilgilerinin güncel ve doğru olduğunu taahhüt eder. Yanlış veya yanıltıcı bilgi sunulması sebebiyle tüketicilerin yaşayacağı mağduriyetlerden ve yasal yaptırımlardan doğrudan Bayi sorumludur.</li>
        <li><strong>Teklif Taleplerine Geri Dönüş:</strong> Bayi, tüketiciler tarafından kendisine yönlendirilen teklif ve numune taleplerine (Leads) makul iş süreleri içerisinde, en geç 48 saat içinde yazılı veya telefonla geri dönüş yapmayı taahhüt eder. Müşteri memnuniyetini zedeleyici şekilde talepleri yanıtsız bırakan bayilerin üyelik statüleri gözden geçirilir.</li>
        <li><strong>SaaS Abonelik ve Mali Hükümler:</strong> Bayi, seçtiği abonelik paketinin (LITE, STANDART, PREMIUM) ödeme koşullarına uymakla yükümlüdür. Ücretli paketlerdeki ödemelerin gecikmesi durumunda, SeramikBak bayi panelini ve ürün sergileme hizmetini askıya alma hakkına sahiptir.</li>
        <li><strong>Tüketici Mevzuatına Uyum:</strong> Bayi, nihai tüketicilerle gerçekleştireceği tüm satış işlemlerinde 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve ilgili diğer mevzuat hükümlerine uymak zorundadır.</li>
      </ul>

      <h3>3. Gizlilik ve Veri Güvenliği</h3>
      <p>Bayi, platform aracılığıyla kendisine iletilen tüketicilere ait kişisel verileri (ad, telefon, e-posta vb.) sadece ve sadece tekliflendirme ve satış işlemleri amacıyla işleyebilir. Bu verilerin KVKK düzenlemelerine aykırı olarak üçüncü şahıslarla paylaşılması, satılması veya başka pazarlama amaçlarıyla kullanılması kesinlikle yasaktır.</p>

      <h3>4. Sözleşmenin Süresi ve Feshi</h3>
      <p>İşbu Sözleşme onay tarihiyle başlar ve taraflardan biri feshedene kadar yürürlükte kalır. SeramikBak, Bayi'nin iş ahlakına uymaması, yanıltıcı fiyat vermesi, sahte stok beyan etmesi veya Sözleşme maddelerini ihlal etmesi durumunda, bayi üyeliğini tek taraflı olarak, tazminatsız ve derhal feshetme hakkına sahiptir.</p>

      <h3>5. Yetkili Mahkeme</h3>
      <p>Bu Sözleşme'nin uygulanmasından doğacak her türlü uyuşmazlığın çözümünde İstanbul (Anadolu) Mahkemeleri ve İcra Daireleri yetkilidir.</p>
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
