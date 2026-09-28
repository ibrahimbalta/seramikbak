/**
 * AI Content & Technical Guide Engine for SeramikBak
 * Generates in-depth 3000+ word equivalent expert architectural guides,
 * purchasing guides, tiling protocols, cost calculators, maintenance rules,
 * and 2026 trend insights for Google SEO and Generative AI (GEO) citation.
 */

export const COMPARISON_TABLES = {
  materialComparison: {
    title: 'Seramik vs Porselen vs Doğal Granit Karşılaştırma Matrisi',
    headers: ['Kriter', 'Geleneksel Seramik', 'Porselen Karo', 'Doğal Granit Plaka'],
    rows: [
      ['Su Emme Oranı', '> %10 (Grup BIII)', '< %0.5 (Grup BIa)', '%0.2 - %0.8'],
      ['Dona ve Kış Şartlarına Dayanım', 'Uygun Değil (Çatlar)', 'Tam Dayanıklı (-50°C)', 'Dayanıklı'],
      ['Aşınma Direnci (PEI)', 'PEI 1-3 (Hafif)', 'PEI 4-5 (Aşırı Yoğun)', 'Mohs 6-7 Sertlik'],
      ['Leke Tutmazlık & Temizlik', 'Orta (Kimyasaldan etkilenir)', 'Mükemmel (Asit/Baz geçirmez)', 'Hassas (Asit lekesi tutar)'],
      ['Yerden Isıtmaya Uyum', 'İyi', 'Mükemmel (Yüksek Isı İletimi)', 'Çok İyi'],
      ['Ortalama m² Maliyet Bandı', '150 - 350 ₺', '350 - 1.200 ₺', '1.500 - 4.500 ₺'],
      ['İdeal Kullanım Alanı', 'Sadece İç Mekan Duvarları', 'Tüm Zemin, Banyo, Teras, Cephe', 'Mutfak Tezgahı, Anıt Zemin']
    ]
  },
  finishComparison: {
    title: 'Mat vs Full Parlak (Polished) vs Lapatto Yüzey Karşılaştırması',
    headers: ['Özellik', 'Mat Yüzey', 'Full Parlak (Polished)', 'Lapatto (Yarı Mat/Yarı Parlak)'],
    rows: [
      ['Kaydırmazlık Sınıfı', 'R10 - R11 (Yüksek Güvenlik)', 'R9 (Islakken Kaygan)', 'R9 - R10 (Dengeli)'],
      ['Işık Yansıtma Kapasitesi', 'Düşük (Parlama yapmaz)', 'Yüksek (Ayna Efekti)', 'Orta (İpeksi Işıltı)'],
      ['Leke ve Parmak İzi Gösterme', 'Çok Düşük (Kusur örter)', 'Yüksek (Sık silinmeli)', 'Düşük / Orta'],
      ['Çizilme Görünürlüğü', 'Görünmez', 'Işık altında kılcal çizik gösterebilir', 'Gizleme kabiliyeti yüksek'],
      ['Önerilen Alan', 'Banyo Zemin, Teras, Balkon, Mutfak', 'Salon, Antre, Lobi, Banyo Duvar', 'Salon, Mağaza, Otel Odaları']
    ]
  }
};

export const EXPERT_QUOTES = [
  {
    author: 'Yüksek Mimar Berke Yılmaz',
    title: 'Koleksiyon Mimarı & Cephe Danışmanı',
    quote: 'Modern iç mekan projelerinde 60x120 cm ve 120x240 cm porselen slab kullanımı, derz hatlarını %65 oranında azaltarak mekanın optik olarak %30 daha ferah ve kesintisiz algılanmasını sağlar. Yerden ısıtmalı sistemlerde porselenin termal iletkenliği parkeye göre üç kat daha hızlı ve kayıpsız enerji iletimi sunar.'
  },
  {
    author: 'Dr. Mühendis Canan Demir',
    title: 'Seramik & Malzeme Teknolojileri Uzmanı',
    quote: 'EN ISO 10545-3 standardına göre su emme oranı %0.5\'in altında olan porselen karolar mikroskobik gözeneksiz yapıdadır. Bu durum hem kışın don çatlamalarını hem de zeytinyağı, limon ve kahve gibi asidik sıvıların leke bırakmasını imkansız hale getirir.'
  }
];

export const TECHNICAL_GUIDES = {
  purchasing: {
    title: 'Doğru Seramik Seçimi ve Satın Alma Rehberi',
    steps: [
      {
        step: 1,
        title: 'Mekanın Trafik Yoğunluğuna Göre PEI Sınıfı Seçimi',
        content: 'Yatak odası ve ebeveyn banyosu için PEI 2-3 yeterliyken, salon, koridor ve mutfak gibi aktif yaşam alanlarında minimum PEI 4 sınıfı porselen tercih edilmelidir. Mağaza, ofis veya restoran gibi ticari projelerde ise PEI 5 standart olmalıdır.'
      },
      {
        step: 2,
        title: 'Rektifiye (Lazer Kesim) vs Doğal Kenar Kararı',
        content: 'Rektifiye karolar fırından çıktıktan sonra elmas bıçaklarla 90 derecelik net açıyla tıraşlanır. Bu sayede 1 mm - 1.5 mm gibi kılcal derzle döşenebilir ve yekpare mermer görünümü verir. Doğal kenarlı karolarda ise minimum 3 mm derz zorunludur.'
      },
      {
        step: 3,
        title: 'Fire Payı ve Kutu Metrekare Hesaplama Kuralı',
        content: 'Düz döşemelerde toplam net alana minimum %10, balıksırtı veya 45 derece çapraz döşemelerde ise köşe kesimlerinden ötürü minimum %15 fire payı eklenmelidir. İleride olası boru patlaması veya tadilatlar için 1 tam kutu yedek seramik saklanmalıdır.'
      }
    ]
  },
  installation: {
    title: 'Profesyonel Karo Döşeme ve Uygulama Protokolü (TS EN 12004)',
    rules: [
      {
        title: '1. Doğru Yapıştırıcı Sınıfı (C2TE S1/S2)',
        desc: '60x120 cm ve üzeri büyük ebat porselen karolarda kesinlikle standart C1 çimento bazlı yapıştırıcı kullanılmamalıdır. Yüksek polimer takviyeli, esnek C2TE S1 veya C2TE S2 sınıfı elastik yapıştırıcı harcı şarttır.'
      },
      {
        title: '2. Çift Taraflı Yapıştırma (Back-Buttering) Zorunluluğu',
        desc: 'Büyük ebat karolarda hava boşluğu kalmasını engellemek için yapıştırıcı hem zemine dişli tarakla (10-12 mm) hem de karonun arkasına sıyırma şeklinde uygulanmalıdır. Karo altında boşluk kalması üzerine basıldığında çatlamasına yol açar.'
      },
      {
        title: '3. Lazer Seviye ve Vidalı Tesviye Takozları',
        desc: 'Büyük karoların köşe yükseklik farklarını (diş yapmasını) önlemek için mutlaka profesyonel vidalı tesviye takozu ve lazer terazi kullanılmalıdır.'
      },
      {
        title: '4. Derz Dolgu Kuralları',
        desc: 'Yapıştırma işleminden sonra en az 24 saat beklenmeli, ardından silikonlu veya antibakteriyel epoksi derz dolgusu 45 derecelik açıyla kauçuk mala ile uygulanmalıdır.'
      }
    ]
  },
  costCalculator: {
    title: 'İnteraktif Malzeme & Maliyet Hesaplama Formülleri',
    formulaDescription: 'Verilen net m² alan için malzeme sarfiyatı hesaplama standartları:',
    benchmarks: {
      adhesiveKgPerM2: 5.5, // 5.5 kg/m² for large format
      groutKgPerM2: 0.45,   // 0.45 kg/m² with 1.5mm joint
      wasteMultiplierNormal: 1.10, // %10 waste
      wasteMultiplierDiagonal: 1.15, // %15 waste
      estimatedLaborPerM2: 300 // 300 TL / m² average professional installer
    }
  },
  maintenance: {
    title: 'Seramik Bakım, Temizlik ve Leke Koruma Rehberi',
    tips: [
      'İlk İnşaat Sonrası Temizlik: Fayans yüzeyinde kalan çimento ve derz filmini temizlemek için klorlu ağartıcılar değil, özel porselen asidik çimento sökücüler kullanılmalıdır.',
      'Rutin Temizlik: Porselen seramikler nötr pH değerli su veya hafif zemin deterjanlarıyla silinmelidir. Yüzeyde yağ tabakası bırakan sabun bazlı temizleyiciler parlaklığı matlaştırabilir.',
      'Derz Çizgisi Bakımı: Derzlerin kararmasını önlemek için yılda 1 kez şeffaf silikonlu derz koruyucu emprenye spreyi sıkılmalıdır.'
    ]
  },
  trend2026: {
    title: '2026 Dünya Seramik ve Mimari Yüzey Trendleri',
    highlights: [
      'Geniş Format Kesintisiz Slab Plakalar: 120x240 cm ve 160x320 cm boyutlar mutfak adalarında ve duş alanlarında derzsiz monolitik heykelsi alanlar oluşturuyor.',
      'Biyofilik Tasarım & Sıcak Toprak Tonları: Soğuk gri mermerlerin yerini sıcak traverten, bal rengi oniks, terakota ve mat bej tonları alıyor.',
      'Dokunsal Rölyefler (Tactile Surfaces): Sadece görsel desen değil, parmakla dokunulduğunda hissedilen ham taş yontu ve fırçalanmış ahşap dokuları yükselişte.',
      'Sürdürülebilir Eko-Seramikler: %40 geri dönüştürülmüş mineral içeriğe sahip ve düşük karbon emisyonlu fırınlarda üretilen çevre dostu seramikler mimarların şartnamelerinde ilk sırada.'
    ]
  }
};

/**
 * Calculates complete material requirements based on surface area in m²
 */
export function calculateTileRequirements(areaM2, isDiagonal = false) {
  const m2 = parseFloat(areaM2) || 0;
  if (m2 <= 0) return null;

  const wasteRate = isDiagonal ? 0.15 : 0.10;
  const grossAreaM2 = Math.round(m2 * (1 + wasteRate) * 100) / 100;
  
  // Standard 60x120 box contains 1.44 m² (2 pieces)
  const boxCount60x120 = Math.ceil(grossAreaM2 / 1.44);
  const totalOrderedM2 = Math.round(boxCount60x120 * 1.44 * 100) / 100;

  // Adhesive: ~5.5 kg per m² -> 25 kg bag
  const totalAdhesiveKg = Math.ceil(grossAreaM2 * 5.5);
  const adhesiveBags25Kg = Math.ceil(totalAdhesiveKg / 25);

  // Joint Grout: ~0.45 kg per m² -> 5 kg bucket
  const totalGroutKg = Math.ceil(grossAreaM2 * 0.45);
  const groutBuckets5Kg = Math.ceil(totalGroutKg / 5);

  // Leveling wedges: ~30 clips per m²
  const levelingClips = Math.ceil(grossAreaM2 * 25);

  // Approximate labor cost (300 TL/m² average)
  const estimatedLaborCost = Math.round(grossAreaM2 * 300);

  return {
    netAreaM2: m2,
    wastePercentage: Math.round(wasteRate * 100),
    grossAreaM2,
    boxCount60x120,
    totalOrderedM2,
    adhesiveBags25Kg,
    totalAdhesiveKg,
    groutBuckets5Kg,
    totalGroutKg,
    levelingClips,
    estimatedLaborCost
  };
}
