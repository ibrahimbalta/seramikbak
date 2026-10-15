/**
 * SeramikBak Dijital Katalog & Lookbook Şablon Kütüphanesi Kayıt Defteri (Registry)
 * 12 Ayrı Mimari ve Ticari Tasarım Ailesi
 */

export const CATALOG_CATEGORIES = [
  { id: 'all', label: 'Tüm Şablonlar' },
  { id: 'architectural', label: 'Mimari & Tasarım' },
  { id: 'minimal', label: 'Minimalist & Sanatsal' },
  { id: 'technical', label: 'Teknik & Şartname' },
  { id: 'commercial', label: 'Ticari & B2B İhracat' },
  { id: 'living', label: 'Yaşam Alanları & Perakende' }
];

export const CATALOG_STYLES = [
  { id: 'all', label: 'Tüm Stiller' },
  { id: 'editorial', label: 'Editoryal Monograf' },
  { id: 'minimalist', label: 'İskandinav Minimal' },
  { id: 'cad-bim', label: 'Mühendislik & BIM' },
  { id: 'luxury-stone', label: 'Lüks Doğal Taş' },
  { id: 'multi-lang', label: 'Çok Dilli İhracat' },
  { id: 'presentation', label: 'Mimari Pafta' }
];

export const CATALOG_DESIGN_FAMILIES = [
  // 1. Premium Mimari Lookbook
  {
    id: 'premium-mimari',
    aliasIds: ['milano'],
    name: 'Premium Mimari Lookbook',
    category: 'architectural',
    style: 'editorial',
    targetAudience: 'Mimarlar, İç Mimarlar, Tasarım Ofisleri, Proje Geliştiriciler',
    tag: '120×280 & Dev Ebat Matbaa Baskısı',
    badge: 'MİMARİ EDİTORYAL',
    aspect: 'A4 Dikey Çift Sayfa (Spread)',
    orientation: 'portrait',
    accentColor: '#b4823c',
    bgColor: '#18181b',
    darkTheme: true,
    coverImg: '/renders/modern_living_natural_oak.jpg',
    mockupImg: '/renders/modern_living_natural_oak.jpg',
    description: 'İtalyan Cersaie ve Milano matbaa standardında 2 sayfalı mimari monograf mizanpajı: Sol sayfada geniş yaşam alanı uygulaması ve teknik şartname özeti; sağ sayfada 120x280 dikey plaka ve doku yakın çekimleri.',
    supportedPages: [
      { type: 'cover', label: 'Kapak', desc: 'Minimalist koyu zemin ve altın tipografi' },
      { type: 'manifesto', label: 'Manifesto', desc: 'Tasarım vizyonu ve mimari felsefe' },
      { type: 'toc', label: 'İçindekiler', desc: 'Koleksiyon fihristi ve sayfa indeksleri' },
      { type: 'spread-left', label: 'Mekan Sayfası', desc: 'Geniş yaşam alanı ve teknik şartname' },
      { type: 'spread-right', label: 'Plaka Sayfası', desc: '120x280 dikey plaka ve yüzey detayı' },
      { type: 'specs', label: 'Teknik Standartlar', desc: 'TS EN 14411 standart matrisi' },
      { type: 'studio3d', label: '3D Studio & AR', desc: 'Canlı mekanda gör QR kodları' },
      { type: 'contact', label: 'Arka Kapak', desc: 'Mimari proje destek ve kurumsal iletişim' }
    ]
  },

  // 2. Minimal Koleksiyon Kataloğu
  {
    id: 'minimal-koleksiyon',
    aliasIds: ['minimal-editorial', 'nordic-minimal'],
    name: 'Minimal Koleksiyon Kataloğu',
    category: 'minimal',
    style: 'minimalist',
    targetAudience: 'Lüks Butikler, Çağdaş Konut Projeleri, Galeri Mekanları',
    tag: 'Japandi & İskandinav Estetiği',
    badge: 'MINIMAL WHITE-SPACE',
    aspect: 'A4 Dikey Asimetrik Grid',
    orientation: 'portrait',
    accentColor: '#78716c',
    bgColor: '#fcfbf9',
    darkTheme: false,
    coverImg: '/renders/luxury_bathroom_calacatta_gold.jpg',
    mockupImg: '/renders/luxury_bathroom_calacatta_gold.jpg',
    description: 'Yüksek oranda negatif boşluk (white-space), zarif tipografi ve asimetrik grid dengesiyle sakin, zamansız bir estetik sunan minimalist karo kataloğu.',
    supportedPages: [
      { type: 'cover', label: 'Tipografik Kapak', desc: 'Havadar başlık, narin tarih ve marka künyesi' },
      { type: 'toc', label: 'Kürasyon İndeksi', desc: 'Numaralı koleksiyon seçkisi ve boşluk dengesi' },
      { type: 'editorial', label: 'Editoryal Mekan', desc: 'Tekil geniş fotoğraf ve zarif alıntı metni' },
      { type: 'product-detail', label: 'Karo Detay', desc: 'Asimetrik ürün yerleşimi ve mikro ebat bilgileri' },
      { type: 'variants', label: 'Doku & Renk', desc: 'Yan yana sakin renk tonları ve yüzey eşleştirmeleri' },
      { type: 'specs', label: 'Özet Tablo', desc: 'İnce çizgili minimalist şartname tablosu' },
      { type: 'contact', label: 'Sessiz İletişim', desc: 'Merkezi marka logosu ve minimal iletişim bilgisi' }
    ]
  },

  // 3. Teknik Ürün Kataloğu
  {
    id: 'teknik-urun',
    aliasIds: ['spec-sheet', 'pro-technic'],
    name: 'Teknik Ürün Kataloğu',
    category: 'technical',
    style: 'cad-bim',
    targetAudience: 'İhale Heyetleri, İnşaat Mühendisleri, Yükleniciler, BIM Yöneticileri',
    tag: 'TS EN 14411 & BIM Standartları',
    badge: 'CAD / BIM / İHALE',
    aspect: 'A4 Dikey / Yatay CAD Formatı',
    orientation: 'portrait',
    accentColor: '#0284c7',
    bgColor: '#ffffff',
    darkTheme: false,
    coverImg: '/renders/luxury_bathroom_loft_beton.jpg',
    mockupImg: '/renders/luxury_bathroom_loft_beton.jpg',
    description: 'Resmi ihaleler, mimari şartnameler ve mühendislik dosyaları için modüler teknik matris formatı. PEI aşınma, R9-R13 kaymazlık, kutu/palet/konteyner lojistiği ve CAD kesitleri.',
    supportedPages: [
      { type: 'cover', label: 'Mühendislik Kapağı', desc: 'CAD pafta çerçevesi, revizyon ve onay blokları' },
      { type: 'norm-index', label: 'Standartlar Fihristi', desc: 'TS EN 14411 ve ISO 10545 test yöntemleri' },
      { type: 'matrix', label: 'Ebat & Kalınlık', desc: 'Rektifiye, kalınlık toleransı ve derz tablosu' },
      { type: 'product-tech', label: 'Ürün Şartnamesi', desc: 'Teknik detaylar, kırılma dayanımı ve aşınma sınıfı' },
      { type: 'logistics', label: 'Lojistik & Paketleme', desc: 'Kutu, palet m2 ağırlıkları ve yükleme hesapları' },
      { type: 'mounting', label: 'Uygulama Rehberi', desc: 'Yükseltilmiş döşeme ve yapıştırma harcı yönergeleri' },
      { type: 'contact', label: 'Şartname İrtibatı', desc: 'Teknik ofis ve proje teslim birimi iletişim bilgileri' }
    ]
  },

  // 4. Mimar ve Proje Sunumu
  {
    id: 'mimar-sunum',
    aliasIds: ['architectural-portfolio'],
    name: 'Mimar ve Proje Sunumu',
    category: 'architectural',
    style: 'presentation',
    targetAudience: 'Yatırımcı Sunumları, Yarışma Paftaları, Büyük Konsept Projeler',
    tag: 'Mimari Pafta & Konsept Sunum',
    badge: 'PROJE PAFTASI',
    aspect: 'A4 Yatay / Dikey Pafta',
    orientation: 'landscape',
    accentColor: '#4f46e5',
    bgColor: '#0f172a',
    darkTheme: true,
    coverImg: '/renders/modern_living_natural_oak.jpg',
    mockupImg: '/renders/modern_living_natural_oak.jpg',
    description: 'Otel, AVM ve karma projelerin mimari sunumları için tasarlanmış geniş pafta mizanpajı. Konsept moodboard, plan şeması ve malzeme paleti bir arada.',
    supportedPages: [
      { type: 'cover', label: 'Konsept Kapağı', desc: 'Proje adı, lokasyon ve mimari ofis künyesi' },
      { type: 'moodboard', label: 'Moodboard & Doku', desc: 'Malzeme eşleştirmeleri ve atmosfer fotoğrafları' },
      { type: 'project-case', label: 'Uygulama Paftası', desc: 'Mekan görseli ve malzeme çağrı okları' },
      { type: 'contact', label: 'Proje Kapanış', desc: 'Mimari danışmanlık iletişim kanalları' }
    ]
  },

  // 5. Banyo ve Mutfak Koleksiyonu
  {
    id: 'banyo-mutfak',
    aliasIds: ['wet-areas-collection'],
    name: 'Banyo ve Mutfak Koleksiyonu',
    category: 'living',
    style: 'editorial',
    targetAudience: 'Mutfak/Banyo Stüdyoları, Konut Mimarları, Bireysel Müşteriler',
    tag: 'Islak Hacim & Tezgah Arası',
    badge: 'ISLAK HACİM',
    aspect: 'A4 Dikey Yaşam Alanı',
    orientation: 'portrait',
    accentColor: '#0d9488',
    bgColor: '#f8fafc',
    darkTheme: false,
    coverImg: '/renders/luxury_bathroom_calacatta_gold.jpg',
    mockupImg: '/renders/luxury_bathroom_calacatta_gold.jpg',
    description: 'Banyo zemin-duvar uyumu, duş nişleri, tezgah arası dekofonlar ve suya dayanıklı porselen karolar için fonksiyonel ve ilham verici katalog yapısı.',
    supportedPages: [
      { type: 'cover', label: 'Banyo Kapağı', desc: 'Ferah banyo renderı ve koleksiyon başlığı' },
      { type: 'editorial', label: 'Mekan İlhamı', desc: 'Armatür, vitrifiye ve ayna ile seramik uyumu' },
      { type: 'product-detail', label: 'Zemin & Duvar', desc: 'Banyo duvarı ve zemin karo kombinasyonu' },
      { type: 'specs', label: 'Su & Leke Dayanımı', desc: 'Sıfır su emme ve kolay temizlik özellikleri' },
      { type: 'contact', label: 'Yetkili Bayiler', desc: 'Banyo tasarım merkezleri ve showroomlar' }
    ]
  },

  // 6. Doğal Taş ve Mermer Serisi
  {
    id: 'dogal-tas-mermer',
    aliasIds: ['verona'],
    name: 'Doğal Taş ve Mermer Serisi',
    category: 'architectural',
    style: 'luxury-stone',
    targetAudience: 'Villa, Rezidans, Lüks Konut Projeleri, Mermer İthalatçıları',
    tag: 'Bookmatch & Damar Eşleme',
    badge: 'İTALYAN MERMER',
    aspect: 'A4 Dikey Bookmatch Spread',
    orientation: 'portrait',
    accentColor: '#c59b27',
    bgColor: '#18181b',
    darkTheme: true,
    coverImg: '/renders/luxury_bathroom_calacatta_gold.jpg',
    mockupImg: '/renders/luxury_bathroom_calacatta_gold.jpg',
    description: 'İtalyan Carrara ve Verona taş ocakları ihtişamında lüks damar takipli monograf. A/B kelebek damar açılımları, altın ve antrasit parlak yüzeyler.',
    supportedPages: [
      { type: 'cover', label: 'Mermer Kapağı', desc: 'Simetrik damarlı koyu mermer kompozisyonu' },
      { type: 'bookmatch', label: 'Bookmatch Açılımı', desc: 'A ve B plakalarının kelebek birleşim sayfası' },
      { type: 'product-detail', label: 'Yüzey Varyantı', desc: 'Cilalı (Full Lappato) ve Honlu mat yüzeyler' },
      { type: 'contact', label: 'Exclusive Destek', desc: 'Lüks konut ve plaka seçim danışmanlığı' }
    ]
  },

  // 7. Renk ve Ebat Rehberi
  {
    id: 'renk-ebat-rehberi',
    aliasIds: ['palette-guide'],
    name: 'Renk ve Ebat Rehberi',
    category: 'living',
    style: 'minimalist',
    targetAudience: 'Mağaza Satış Ekipleri, Tasarımcılar, Renk Danışmanları',
    tag: 'Pantone & Modüler Ebat Matrisi',
    badge: 'RENK REHBERİ',
    aspect: 'A4 Dikey Renk Skalası',
    orientation: 'portrait',
    accentColor: '#e11d48',
    bgColor: '#ffffff',
    darkTheme: false,
    coverImg: '/renders/luxury_bathroom_albatros_antrasit.jpg',
    mockupImg: '/renders/luxury_bathroom_albatros_antrasit.jpg',
    description: 'RAL ve Pantone renk kodlarıyla zenginleştirilmiş kapsamlı renk kartelası. 30x60, 60x60, 60x120, 120x120 ebatların modüler dizilim alternatifleri.',
    supportedPages: [
      { type: 'cover', label: 'Kartela Kapağı', desc: 'Çok renkli modern grafik kompozisyon' },
      { type: 'swatches', label: 'Renk Skalası', desc: 'Sıcak, soğuk ve nötr tonların yan yana dizilimi' },
      { type: 'layouts', label: 'Dizilim Çeşitleri', desc: 'Balıksırtı, tuğla ve modüler döşeme şemaları' },
      { type: 'contact', label: 'Kartela Talebi', desc: 'Fiziksel numune sipariş bilgileri' }
    ]
  },

  // 8. Fuar ve Bayi Kataloğu
  {
    id: 'fuar-bayi',
    aliasIds: ['showroom'],
    name: 'Fuar ve Bayi Kataloğu',
    category: 'commercial',
    style: 'editorial',
    targetAudience: 'Bayiler, Yapı Marketler, Toptan Satış Noktaları, Fuar Ziyaretçileri',
    tag: 'Hızlı Sipariş & Teşhir Rehberi',
    badge: 'BAYİ & FUAR',
    aspect: 'A4 Dikey Hızlı Ürün Kartları',
    orientation: 'portrait',
    accentColor: '#d97706',
    bgColor: '#ffffff',
    darkTheme: false,
    coverImg: '/renders/luxury_bathroom_albatros_antrasit.jpg',
    mockupImg: '/renders/luxury_bathroom_albatros_antrasit.jpg',
    description: 'UNIBERA ve CERSAIE gibi uluslararası fuarlarda dağıtılmak üzere tasarlanmış, yan yana çoklu ürün kartları ve hızlı sipariş kodları içeren bayi kataloğu.',
    supportedPages: [
      { type: 'cover', label: 'Fuar Kapağı', desc: 'Dinamik etkinlik başlığı ve bayi stand kodu' },
      { type: 'grid-products', label: 'Ürün Matrisi', desc: 'Sayfa başına 4-6 kompakt ürün kartı' },
      { type: 'display-stand', label: 'Stand Teşhiri', desc: 'Bayi pano yerleşimleri ve kule stand önerileri' },
      { type: 'contact', label: 'Bayi Ağı', desc: 'Bölge satış müdürlükleri ve sipariş hattı' }
    ]
  },

  // 9. Modern İhracat Kataloğu
  {
    id: 'modern-ihracat',
    aliasIds: ['global-export'],
    name: 'Modern İhracat Kataloğu',
    category: 'commercial',
    style: 'multi-lang',
    targetAudience: 'Yurtdışı Distribütörler, Global Satın Almacılar, İhracat Ekipleri',
    tag: 'EN / DE / FR / AR Çok Dilli & Lojistik',
    badge: 'B2B GLOBAL EXPORT',
    aspect: 'A4 Dikey Çok Dilli Standart',
    orientation: 'portrait',
    accentColor: '#2563eb',
    bgColor: '#ffffff',
    darkTheme: false,
    coverImg: '/renders/luxury_bathroom_natural_oak.jpg',
    mockupImg: '/renders/luxury_bathroom_natural_oak.jpg',
    description: 'Konteyner yükleme kapasiteleri (20ft / 40ft), GTİP/HS Kodları, CE / ISO 9001 sertifikaları ve uluslararası sevkiyat şartlarını içeren global ihracat mizanpajı.',
    supportedPages: [
      { type: 'cover', label: 'Global Kapak', desc: 'Uluslararası B2B marka kapağı (İngilizce/Türkçe)' },
      { type: 'export-matrix', label: 'Konteyner Tablosu', desc: 'FCL / LCL ağırlık, palet ve metraj tablosu' },
      { type: 'certs', label: 'Sertifikalar & CE', desc: 'CE, ISO ve yeşil bina (LEED) belgeleri' },
      { type: 'contact', label: 'İhracat Ofisi', desc: 'Liman, gümrük ve global satış temsilcilikleri' }
    ]
  },

  // 10. Yeni Koleksiyon Lansmanı
  {
    id: 'yeni-lansman',
    aliasIds: ['collection-launch'],
    name: 'Yeni Koleksiyon Lansmanı',
    category: 'architectural',
    style: 'editorial',
    targetAudience: 'Tasarım Dergileri, Basın Mensupları, Trend Takipçileri',
    tag: 'Sezon Trendleri & Lansman Monografı',
    badge: 'YENİ SEZON LANSMAN',
    aspect: 'A4 Dikey Dinamik Magazin',
    orientation: 'portrait',
    accentColor: '#eab308',
    bgColor: '#09090b',
    darkTheme: true,
    coverImg: '/renders/modern_living_natural_oak.jpg',
    mockupImg: '/renders/modern_living_natural_oak.jpg',
    description: 'Yeni sezon seramik serilerini duyurmak için hazırlanan magazin tarzı yüksek tempolu editoryal bülten. Büyük tam boy manşet fotoğrafları ve tasarımcı röportajı.',
    supportedPages: [
      { type: 'cover', label: 'Magazin Kapağı', desc: 'Büyük lansman başlığı ve yıl damgası' },
      { type: 'editorial', label: 'Tasarım Hikayesi', desc: 'Koleksiyonun ilham kaynağı ve tasarımcı notu' },
      { type: 'hero-product', label: 'Yıldız Ürün', desc: 'Sezonun amiral gemisi karonun dev boy görseli' },
      { type: 'contact', label: 'Basın & Lansman', desc: 'Dijital basın kiti ve lansman irtibatı' }
    ]
  },

  // 11. Endüstriyel ve Ticari Projeler Kataloğu
  {
    id: 'endustriyel-ticari',
    aliasIds: ['lidya', 'commercial-heavy-duty'],
    name: 'Endüstriyel ve Ticari Projeler Kataloğu',
    category: 'commercial',
    style: 'cad-bim',
    targetAudience: 'AVM, Havalimanı, Metro, Hastane ve Fabrika Yatırımcıları',
    tag: 'Ağır Yük Dayanımı & R11/R12',
    badge: 'AĞIR HİZMET TİCARİ',
    aspect: 'A4 Dikey Proje Şartnamesi',
    orientation: 'portrait',
    accentColor: '#059669',
    bgColor: '#ffffff',
    darkTheme: false,
    coverImg: '/renders/luxury_bathroom_albatros_antrasit.jpg',
    mockupImg: '/renders/luxury_bathroom_albatros_antrasit.jpg',
    description: 'Yoğun insan ve araç trafiğine maruz kalan ticari zeminler için modüler porselen karo şartnamesi. R10-R12 kaymazlık sınıfları, asit dayanımı ve tel kafes modüler sistemler.',
    supportedPages: [
      { type: 'cover', label: 'Endüstriyel Kapak', desc: 'Sağlamlık ve mühendislik vurgulu kapak' },
      { type: 'traffic-class', label: 'Trafik Sınıfları', desc: 'UPEC ve PEI 5 ağır yaya trafiği standartları' },
      { type: 'chemical-slip', label: 'Asit & Kaymazlık', desc: 'Kimyasal direnç ve ıslak zemin R sınıfı matrisi' },
      { type: 'contact', label: 'Teknik Taahhüt', desc: 'Büyük ölçekli şantiye lojistik destek hattı' }
    ]
  },

  // 12. Dijital Ürün Broşürü
  {
    id: 'dijital-brosur',
    aliasIds: ['deco', 'digital-brochure-square'],
    name: 'Dijital Ürün Broşürü',
    category: 'minimal',
    style: 'minimalist',
    targetAudience: 'WhatsApp Müşterileri, E-Bülten Okurları, Sosyal Medya Paylaşımları',
    tag: '1:1 Kare Mobil & Hızlı Broşür',
    badge: '1:1 KARE DİJİTAL',
    aspect: '1:1 Kare Editoryal Broşür',
    orientation: 'portrait',
    accentColor: '#0f172a',
    bgColor: '#ffffff',
    darkTheme: false,
    coverImg: '/renders/luxury_bathroom_calacatta_gold.jpg',
    mockupImg: '/renders/luxury_bathroom_calacatta_gold.jpg',
    description: 'Mobil ekranlarda ve tabletlerde mükemmel okunan kare formatta dijital broşür. Dekofonlar, rölyefli bordürler ve tekil mekan fotoğrafları için kompakt sunum.',
    supportedPages: [
      { type: 'cover', label: 'Kare Kapak', desc: 'Instagram / mobil dostu kare kapak kompozisyonu' },
      { type: 'spread-deco', label: 'Mekan & Dekofon', desc: 'Sol: Tam kare mekan, Sağ: Ebat ve dekor detayları' },
      { type: 'swatch-grid', label: 'Varyasyon Grid', desc: 'Kompakt yüzey ve renk rozetleri' },
      { type: 'contact', label: 'Hızlı İletişim', desc: 'Tek tıkla WhatsApp ve web linkleri' }
    ]
  }
];

// Ensure backward-compatible property aliases
CATALOG_DESIGN_FAMILIES.forEach((item) => {
  if (!item.desc) item.desc = item.description;
  if (!item.accent) item.accent = item.accentColor;
});

/**
 * Şablon ID'sine göre ilgili şablon konfigürasyonunu çözümler (alias desteğiyle geriye dönük uyumlu)
 */
export function getTemplateConfig(templateId) {
  if (!templateId) return CATALOG_DESIGN_FAMILIES[0];
  const normalized = String(templateId).trim().toLowerCase();
  
  const found = CATALOG_DESIGN_FAMILIES.find(
    (t) => t.id === normalized || (t.aliasIds && t.aliasIds.includes(normalized))
  );
  return found || CATALOG_DESIGN_FAMILIES[0];
}

/**
 * Şablon filtreleme fonksiyonu
 */
export function filterTemplates({ category = 'all', style = 'all', searchQuery = '' } = {}) {
  return CATALOG_DESIGN_FAMILIES.filter((item) => {
    if (category && category !== 'all' && item.category !== category) return false;
    if (style && style !== 'all' && item.style !== style) return false;
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = item.name.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchAudience = item.targetAudience.toLowerCase().includes(q);
      const matchTag = item.tag.toLowerCase().includes(q);
      return matchName || matchDesc || matchAudience || matchTag;
    }
    return true;
  });
}
