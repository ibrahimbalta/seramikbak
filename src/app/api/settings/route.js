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
        { num: '17', label: 'Karşılaştırılan Lider Marka & Üretici' },
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

    // 4. Default Inspiration Gallery (16 Rich Architectural Models)
    const defaultIlham = [
      // BANYO MODELLERİ
      {
        id: 1,
        title: 'Lüks Calacatta Camsı Banyo',
        desc: 'Geniş banyolarda kesintisiz damarlı mermer yansımaları ve lüks fırçalanmış pirinç detaylar.',
        style: 'Mermer',
        room: 'Banyo',
        tag: 'Premium Luxury',
        img: '/hero/luxury_bathroom.png',
        tileRecommendation: 'Calacatta Gold Full Lappato 60x120 cm'
      },
      {
        id: 2,
        title: 'Japandi Zen & Traverten Spa Banyo',
        desc: 'Toprak ve kemik tonlarında sıcak traverten dokulu seramikler ile banyoda huzurlu spa ortamı.',
        style: 'Traverten',
        room: 'Banyo',
        tag: 'Japandi Spa',
        img: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
        tileRecommendation: 'Travertino Bej Mat R10 60x120 cm'
      },
      {
        id: 3,
        title: 'Akdeniz Terrazzo & Pastel Banyo',
        desc: 'İtalyan terrazzo parçacıklı eğlenceli ve dinamik banyo duvar ve zemin kaplamaları.',
        style: 'Terrazzo',
        room: 'Banyo',
        tag: 'Mediterranean',
        img: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=800&q=80',
        tileRecommendation: 'Terrazzo Veneziano Pastel 60x60 cm'
      },
      {
        id: 4,
        title: 'Mat Antrasit & Siyah Minimalist Banyo',
        desc: 'Koyu gri ve antrasit bazalt dokusuyla lüks otel suitleri havasında modern tasarım.',
        style: 'Beton',
        room: 'Banyo',
        tag: 'Dark Luxury',
        img: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=800&q=80',
        tileRecommendation: 'Basalt Black Mat R10 60x120 cm'
      },

      // MUTFAK MODELLERİ
      {
        id: 5,
        title: 'İskandinav Meşe & Sıcak Mutfak',
        desc: 'Doğal ahşap dokulu porselen karolar ile mutfağınızda sıcacık ve davetkar bir atmosfer oluşturun.',
        style: 'Ahşap',
        room: 'Mutfak',
        tag: 'Minimalist',
        img: '/hero/scandinavian_kitchen.png',
        tileRecommendation: 'Meşe Mat Porselen 20x120 cm'
      },
      {
        id: 6,
        title: 'Statuario Beyaz Mutfak Adası',
        desc: 'Geniş mutfak adalarında kesintisiz dev porselen plakalar ile leke tutmaz hijyenik yüzeyler.',
        style: 'Mermer',
        room: 'Mutfak',
        tag: 'Modern Chic',
        img: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
        tileRecommendation: 'Statuario Extra Camsı Plaka 120x240 cm'
      },
      {
        id: 7,
        title: 'Rustic Doğal Taş Mutfak & Cotto',
        desc: 'Köy evi ve taş ev konseptine uygun pişmiş toprak görünümlü sıcak zemin karoları.',
        style: 'Doğal Taş',
        room: 'Mutfak',
        tag: 'Rustic Farmhouse',
        img: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=800&q=80',
        tileRecommendation: 'Cotto Natural Mat 30x60 cm'
      },
      {
        id: 8,
        title: 'Zümrüt Yeşil Balıksırtı Backsplash',
        desc: 'Mutfak tezgah arkasında parlak rölyefli zümrüt yeşili metro seramiklerin zamansız şıklığı.',
        style: 'Dekoratif',
        room: 'Mutfak',
        tag: 'Art Deco',
        img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
        tileRecommendation: 'Chevron Emerald Green 10x30 cm'
      },

      // SALON MODELLERİ
      {
        id: 9,
        title: 'Endüstriyel Beton Loft Salon',
        desc: 'Geniş açık alanlarda brütist beton görünüm ve modern minimalist mobilya kombinasyonu.',
        style: 'Beton',
        room: 'Salon',
        tag: 'Modern Loft',
        img: '/hero/modern_living.png',
        tileRecommendation: 'Concrete Touch Antrasit Mat 80x80 cm'
      },
      {
        id: 10,
        title: 'Emperador Kahve Villa Girişi & Antre',
        desc: 'Zengin kahve ve bronz mermer damarlarıyla gösterişli villa ve antre zeminleri.',
        style: 'Mermer',
        room: 'Salon',
        tag: 'Executive Luxury',
        img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
        tileRecommendation: 'Emperador Dark Parlak 80x160 cm'
      },
      {
        id: 11,
        title: 'Ceviz Parke Görünümlü Sıcak Salon',
        desc: 'Yerden ısıtmaya %100 uyumlu, çizilmeyen ve solmayan ceviz desenli derzsiz porselen.',
        style: 'Ahşap',
        room: 'Salon',
        tag: 'Warm Home',
        img: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80',
        tileRecommendation: 'Walnut Natural Mat 20x120 cm'
      },
      {
        id: 12,
        title: 'Bal Parıltılı Onyx Camsı Koridor',
        desc: 'Işıklı arkadan aydınlatmaya uygun camsı bal rengi onyx seramik serisi.',
        style: 'Onyx',
        room: 'Salon',
        tag: 'Glamour',
        img: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80',
        tileRecommendation: 'Onyx Amber High Gloss 120x120 cm'
      },

      // DIŞ MEKAN MODELLERİ
      {
        id: 13,
        title: 'Sıcak Traverten Teras & Dış Mekan',
        desc: 'R11 yüksek kaymazlık değerine sahip doğal traverten desenli karolar ile güvenli ve zamansız teraslar.',
        style: 'Traverten',
        room: 'Dış Mekan',
        tag: 'Doğal Taş',
        img: '/hero/hero_ceramics.jpg',
        tileRecommendation: 'Travertino Bej R11 Kaymaz 60x120 cm'
      },
      {
        id: 14,
        title: 'Turkuaz Cam Mozaik Havuz İçi & Veranda',
        desc: 'Güneş ışığında ışıl ışıl parıldayan %100 cam mozaik havuz ve süs havuzu kaplamaları.',
        style: 'Mozaik',
        room: 'Dış Mekan',
        tag: 'Resort Pool',
        img: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=800&q=80',
        tileRecommendation: 'Ocean Blue Glass Mosaic 30x30 cm'
      },
      {
        id: 15,
        title: 'Kaymaz R11 Kayrak Taş Bahçe Yolu',
        desc: 'Donmaya ve sert hava koşullarına dayanıklı 2 cm ekstra kalın kayrak görünümlü dış mekan karoları.',
        style: 'Doğal Taş',
        room: 'Dış Mekan',
        tag: 'Heavy Duty',
        img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
        tileRecommendation: 'Outdoor Slate R11 2cm 60x60 cm'
      },
      {
        id: 16,
        title: 'Modern Antrasit Dış Cephe Kaplama',
        desc: 'Binaların dış cephelerinde ısı ve yağmura karşı koruyucu mekanik montajlı porselen plakalar.',
        style: 'Beton',
        room: 'Dış Mekan',
        tag: 'Facade Design',
        img: '/images/dealer-banner-default.jpg',
        tileRecommendation: 'Facade Anthracite Porcelain 60x120 cm'
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
          <li><strong>Teklif Taleplerine Geri Dönüş:</strong> Bayi, tüketiciler tarafından kendisine yönlendirilen teklim ve numune taleplerine (Leads) makul iş süreleri içerisinde, en geç 48 saat içinde yazılı veya telefonla geri dönüş yapmayı taahhüt eder. Müşteri memnuniyetini zedeleyici şekilde talepleri yanıtsız bırakan bayilerin üyelik statüleri gözden geçirilir.</li>
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
