import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const settings = await prisma.systemSetting.findMany();
    
    // Map array to key-value object
    const settingsMap = {};
    settings.forEach(s => {
      settingsMap[s.key] = s.value;
    });

    // 1. Default About Content
    const defaultAbout = {
      hero_title: 'Yeniden Tanımlıyoruz',
      hero_subtitle: 'SeramikBak; üreticileri, bayileri ve tasarım severleri yapay zeka, Web 3D ve artırılmış gerçeklik teknolojileriyle bir araya getiren bağımsız, lüks bir dijital pazaryeri ve showroom ekosistemidir.',
      mission: 'Tüm yerel ve küresel markaların kataloglarını zengin detaylarla tek bir arama motorunda birleştirmek; bayilerin potansiyel müşterilere zahmetsizce ulaşabileceği B2B SaaS araçları sunmak ve tüketicilerin hayallerindeki mimari tasarımları hızlı fiyat teklifleriyle gerçeğe dönüştürmelerini sağlamak.',
      vision: 'Geleneksel ve zahmetli olan seramik alışverişi sürecini, fiziksel mağazalarda kaybolmadan, tamamen dijital, şeffaf ve kusursuz bir deneyime dönüştürmek. Üç boyutlu modelleme ve yapay zeka ile müşterilerin yaşam alanlarında seramikleri canlı olarak deneyimlemesini sağlayarak sektörün dijital lideri olmak.',
      stats: [
        { num: '100+', label: 'Karşılaştırılan Marka & Üretici' },
        { num: '10,000+', label: 'Aktif Seramik & Karo Ürünü' },
        { num: '500+', label: 'Türkiye Genelinde Yetkili Bayi' },
        { num: '2.5 Saniye', label: 'AI Destekli Arama ve Öneri Hızı' }
      ]
    };

    // 2. Default Contact Content
    const defaultContact = {
      address: 'Kozyatağı Mahallesi, Bayar Caddesi, Plaza 34, Kat: 8, No: 12, Kadıköy / İstanbul, Türkiye',
      email: 'destek@seramikbak.com',
      phone: '0850 123 45 67',
      whatsapp: '+90 850 123 45 67'
    };

    // 3. Default FAQs
    const defaultFaqs = [
      {
        q: "SeramikBak üzerinden doğrudan ürün siparişi verebiliyor muyum?",
        a: "SeramikBak, doğrudan satış yapan bir e-ticaret sitesi değildir; bağımsız bir dijital showroom ve arama motorudur. Beğendiğiniz ürünlerin detay sayfasından 'En Yakın Bayiyi Bul' butonuna basarak bölgenizdeki yetkili satıcılardan (bayilerden) anında teklif isteyebilir veya iletişime geçerek satın alma işlemlerinizi yapabilirsiniz."
      },
      {
        q: "Nasıl numune (örnek ürün) talep edebilirim?",
        a: "Ürünlerin detay sayfasında bulunan 'Bayiden Bilgi Al' formu üzerinden bayilere numune talebinizi iletebilirsiniz. Bayiler stok durumuna göre adresinize kargo ile numune karo gönderebilir veya sizi showrooma davet edebilir."
      },
      {
        q: "Yetkili bayi olarak platforma nasıl kaydolabilirim?",
        a: "Sitemizin üst barında yer alan veya sayfa altındaki 'Bayi Portalı' linkine tıklayarak 'Yeni Bayi Başvurusu' yapabilirsiniz. Bilgileriniz onaylandıktan sonra paneliniz aktifleşecek ve bölgenizden gelen satın alma taleplerini almaya başlayabileceksiniz."
      },
      {
        q: "3D Sanal Stüdyo'da kendi odamın fotoğrafını kullanabilir miyim?",
        a: "Evet! 3D Sanal Stüdyo alanında yer alan 'Kendi Odamı Tasarla' (Görsel Yükle) özelliğini kullanarak banyo, mutfak veya salonunuzun fotoğrafını yükleyebilirsiniz. Akıllı yapay zeka algoritması zemin veya duvar alanlarını saniyeler içinde analiz eder ve seçtiğiniz karoları odanıza döşer."
      },
      {
        q: "Farklı markaların ürün fiyatları neden değişiklik göstermektedir?",
        a: "Fiyatlar markaların üretim teknolojileri, malzeme kalitesi (porselen, seramik, rektifiyeli olması), boyutları ve bayilerin bölgesel nakliye/lojistik maliyetlerine göre değişiklik göstermektedir. Platformumuzdaki en ucuz bayi tekliflerini karşılaştırarak bütçenize en uygun satıcıyı seçebilirsiniz."
      }
    ];

    // 4. Default Inspiration Gallery
    const defaultIlham = [
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

    // 5. Default Blog Articles
    const defaultBlog = [
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

    // 6. Default Legal Content
    const defaultLegal = {
      kvkk: `
        <p>SeramikBak Teknoloji A.Ş. (“SeramikBak” veya “Şirket”) olarak, çevrimiçi ziyaretçilerimizin, bayilerimizin ve marka ortaklarımızın kişisel verilerinin korunmasına büyük önem veriyoruz. Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu (“Kanun”) kapsamında veri sorumlusu sıfatıyla tarafımızca toplanan verilerin işlenme şartlarını açıklamak amacıyla hazırlanmıştır.</p>
        <h3>1. Hangi Kişisel Verileri İşliyoruz?</h3>
        <p>SeramikBak platformunu kullanımınız sırasında aşağıdaki verileriniz işlenmektedir:</p>
        <ul>
          <li><strong>Kimlik ve İletişim Bilgileri:</strong> Adınız, soyadınız, telefon numaranız, e-posta adresiniz.</li>
          <li><strong>Konum Bilgileri:</strong> Bayi bulucu için tarayıcı izninizle toplanan yaklaşık coğrafi koordinatlarınız.</li>
          <li><strong>Kullanım ve İşlem Bilgileri:</strong> Arama geçmişiniz, tıkladığınız seramik modelleri.</li>
        </ul>
      `,
      kullanim: `
        <p>Lütfen SeramikBak internet sitesini (seramikbak.com) ve mobil uygulamasını kullanmadan önce bu kullanım koşullarını dikkatlice okuyunuz. Sitemizi kullanarak bu koşulları peşinen kabul etmiş sayılırsınız.</p>
        <h3>1. Hizmetin Niteliği</h3>
        <p>SeramikBak, seramik üreticisi markaları ve onların yetkili satıcılarını tüketicilerle buluşturan bağımsız bir arama motoru, karşılaştırma ve 3D görselleştirme portalıdır. SeramikBak, doğrudan seramik satışı yapmaz, ödeme tahsil etmez ve nakliye süreçlerini üstlenmez.</p>
      `,
      cerez: `
        <p>SeramikBak internet sitesinde, ziyaretçilerimize daha iyi bir kullanıcı deneyimi sunabilmek ve platform trafiğini analiz edebilmek amacıyla çerezler (cookies) kullanılmaktadır.</p>
        <h3>1. Kullandığımız Çerez Türleri</h3>
        <ul>
          <li><strong>Zorunlu Çerezler:</strong> Sitenin düzgün çalışması için zorunlu olan teknik çerezlerdir.</li>
          <li><strong>Performans Çerezleri:</strong> Aramaları ölçümleyerek sitemizi optimize etmemize yarayan çerezlerdir.</li>
        </ul>
      `
    };

    // Return the combined settings object
    return NextResponse.json({
      bank_name: settingsMap['bank_name'] || 'Akbank',
      bank_recipient: settingsMap['bank_recipient'] || 'SeramikBak Yazılım A.Ş.',
      bank_iban: settingsMap['bank_iban'] || 'TR98 0004 6001 5000 1234 5678 90',
      
      // Page contents loaded from database or falling back to defaults
      page_about_content: settingsMap['page_about_content'] ? JSON.parse(settingsMap['page_about_content']) : defaultAbout,
      page_contact_content: settingsMap['page_contact_content'] ? JSON.parse(settingsMap['page_contact_content']) : defaultContact,
      page_faq_list: settingsMap['page_faq_list'] ? JSON.parse(settingsMap['page_faq_list']) : defaultFaqs,
      page_ilham_list: settingsMap['page_ilham_list'] ? JSON.parse(settingsMap['page_ilham_list']) : defaultIlham,
      page_blog_list: settingsMap['page_blog_list'] ? JSON.parse(settingsMap['page_blog_list']) : defaultBlog,
      page_yasal_content: settingsMap['page_yasal_content'] ? JSON.parse(settingsMap['page_yasal_content']) : defaultLegal
    });
  } catch (error) {
    console.error('Failed to fetch system settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}
