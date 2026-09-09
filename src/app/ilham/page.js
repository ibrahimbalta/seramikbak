'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Sparkles, 
  BookOpen, 
  Compass, 
  ChevronRight, 
  X, 
  Clock, 
  Calculator, 
  Layers, 
  Eye, 
  Palette, 
  Lightbulb, 
  CheckCircle2, 
  TrendingUp, 
  Search, 
  Building2, 
  Heart, 
  Share2, 
  ExternalLink, 
  Flame, 
  Newspaper, 
  Rss, 
  ArrowRight, 
  SlidersHorizontal, 
  Maximize2, 
  Check, 
  Award,
  Zap,
  RefreshCw,
  Copy
} from 'lucide-react';

export default function InspirationGalleryPage() {
  // Main Navigation Tabs
  const [activeTab, setActiveTab] = useState('gallery'); // 'gallery', 'news', 'beforeAfter', 'calculator', 'blog'
  
  // Gallery Filters
  const [selectedRoomFilter, setSelectedRoomFilter] = useState('ALL');
  const [selectedStyleFilter, setSelectedStyleFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selected Article for Reading Modal
  const [selectedArticle, setSelectedArticle] = useState(null);

  // Selected Image for Full View Modal
  const [previewItem, setPreviewItem] = useState(null);

  // Moodboard / Saved Inspirations State (saved to localStorage)
  const [savedIds, setSavedIds] = useState([]);
  const [showMoodboardModal, setShowMoodboardModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Before / After State
  const [activeBeforeAfterId, setActiveBeforeAfterId] = useState(1);
  const [beforeAfterView, setBeforeAfterView] = useState('after'); // 'before' | 'after'

  // Calculator State
  const [calcWidth, setCalcWidth] = useState('4');
  const [calcLength, setCalcLength] = useState('5');
  const [calcTileSize, setCalcTileSize] = useState('60x120');
  const [calcWastePercent, setCalcWastePercent] = useState('10');
  const [calcResult, setCalcResult] = useState(null);

  // Load Saved Moodboard from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('sb_ilham_moodboard');
      if (stored) {
        setSavedIds(JSON.parse(stored));
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const toggleSaveMoodboard = (id, e) => {
    if (e) e.stopPropagation();
    setSavedIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      try {
        localStorage.setItem('sb_ilham_moodboard', JSON.stringify(next));
      } catch (err) {}
      return next;
    });
  };

  // Calculation logic for Tile & Grout calculator
  const calculateMaterials = () => {
    const w = parseFloat(calcWidth) || 0;
    const l = parseFloat(calcLength) || 0;
    const area = w * l;

    if (area <= 0) return;

    const wasteFactor = 1 + (parseFloat(calcWastePercent) / 100);
    const totalAreaWithWaste = area * wasteFactor;

    const boxM2Map = {
      '60x120': 1.44,
      '60x60': 1.44,
      '80x80': 1.28,
      '120x240': 2.88,
      '30x60': 1.44,
      '20x120': 1.20
    };

    const boxM2 = boxM2Map[calcTileSize] || 1.44;
    const boxesNeeded = Math.ceil(totalAreaWithWaste / boxM2);
    const totalPurchasedM2 = (boxesNeeded * boxM2).toFixed(2);
    const groutKgNeeded = (totalAreaWithWaste * 0.35).toFixed(1);

    setCalcResult({
      netArea: area.toFixed(2),
      totalAreaWithWaste: totalAreaWithWaste.toFixed(2),
      boxesNeeded,
      totalPurchasedM2,
      groutKgNeeded,
      boxM2
    });
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. EXPANDED GALLERY ITEMS (28+ Diverse Architectural & Design Models)
  // ─────────────────────────────────────────────────────────────────────────────
  const [galleryItems, setGalleryItems] = useState([
    // BANYO & SPA
    {
      id: 1,
      title: 'Lüks Calacatta Camsı Banyo & Spa',
      desc: 'Geniş banyolarda kesintisiz damarlı mermer yansımaları ve fırçalanmış pirinç armatür detayları.',
      style: 'Mermer',
      room: 'Banyo & Spa',
      tag: 'Trend 2026',
      dimensions: '60x120 cm',
      finish: 'Parlak Lappato',
      colors: ['#FFFFFF', '#C5A880', '#2D3748'],
      colorNames: ['Altın Damarlı Beyaz', 'Fırçalanmış Pirinç', 'Koyu Grafit'],
      img: '/hero/luxury_bathroom.png',
      tileRecommendation: 'Calacatta Gold Full Lappato 60x120 cm'
    },
    {
      id: 2,
      title: 'Japandi Zen & Sıcak Traverten Spa Banyo',
      desc: 'Toprak ve kemik tonlarında sıcak traverten dokulu seramikler ile banyoda huzurlu doğal spa ortamı.',
      style: 'Doğal Taş',
      room: 'Banyo & Spa',
      tag: 'Japandi Minimal',
      dimensions: '60x120 cm',
      finish: 'Mat R10',
      colors: ['#E2D4C3', '#9C8570', '#3D342B'],
      colorNames: ['Kemik Beji', 'Sıcak Traverten', 'Ceviz Ağacı'],
      img: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1000&q=80',
      tileRecommendation: 'Travertino Romano Mat 60x120 cm'
    },
    {
      id: 3,
      title: 'Akdeniz Terrazzo & Pastel Banyo',
      desc: 'İtalyan terrazzo parçacıklı enerjik ve dinamik banyo duvar ve zemin kaplamaları.',
      style: 'Terrazzo',
      room: 'Banyo & Spa',
      tag: 'Mediterranean',
      dimensions: '60x60 cm',
      finish: 'Yarı Mat',
      colors: ['#ECE7E1', '#8C9A8E', '#D9826C'],
      colorNames: ['Kırık Beyaz', 'Adaçayı Yeşili', 'Terracotta'],
      img: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1000&q=80',
      tileRecommendation: 'Terrazzo Veneziano Pastel 60x60 cm'
    },
    {
      id: 4,
      title: 'Mat Antrasit & Siyah Lüks Suite Banyo',
      desc: 'Koyu antrasit bazalt dokusuyla 5 yıldızlı otel süiti havasında monokrom lüks tasarım.',
      style: 'Beton',
      room: 'Banyo & Spa',
      tag: 'Dark Luxury',
      dimensions: '60x120 cm',
      finish: 'Mat R10',
      colors: ['#1A202C', '#4A5568', '#D4AF37'],
      colorNames: ['Koyu Bazalt', 'Duman Grisi', 'Altın Işıltı'],
      img: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=1000&q=80',
      tileRecommendation: 'Basalt Anthracite Mat 60x120 cm'
    },
    {
      id: 5,
      title: 'Mikro Çimento & Grej Yağmur Duş Alanı',
      desc: 'Eksiz derzsiz görünüm sağlayan pürüzsüz mikro çimento efektli sıcak gri banyo karoları.',
      style: 'Beton',
      room: 'Banyo & Spa',
      tag: 'Seamless Minimal',
      dimensions: '80x80 cm',
      finish: 'Mat R10',
      colors: ['#D1D5DB', '#9CA3AF', '#374151'],
      colorNames: ['Grej', 'Açık Beton', 'Mat Füme'],
      img: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1000&q=80',
      tileRecommendation: 'Microcement Greige R10 80x80 cm'
    },

    // MUTFAK & ADA
    {
      id: 6,
      title: 'Statuario Beyaz Dev Mutfak Adası',
      desc: 'Kesintisiz 120x240 cm dev porselen plakalar ile çizilmez, leke tutmaz ve hijyenik ada tezgahı.',
      style: 'Mermer',
      room: 'Mutfak & Ada',
      tag: 'Dev Porselen Plaka',
      dimensions: '120x240 cm',
      finish: 'Saten Mat',
      colors: ['#FFFFFF', '#718096', '#1A202C'],
      colorNames: ['Saf Statuario', 'Gri Damar', 'Kömür Siyahı'],
      img: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1000&q=80',
      tileRecommendation: 'Statuario Extra Slab 120x240 cm'
    },
    {
      id: 7,
      title: 'İskandinav Meşe & Sıcak Mutfak Zemin',
      desc: 'Doğal ahşap dokulu porselen karolar ile mutfağınızda sıcacık ve leke tutmayan bir atmosfer.',
      style: 'Ahşap',
      room: 'Mutfak & Ada',
      tag: 'Nordic Style',
      dimensions: '20x120 cm',
      finish: 'Mat Doğal Doku',
      colors: ['#C4A482', '#FFFFFF', '#4A5568'],
      colorNames: ['Doğal Meşe', 'Krem', 'Antrasit'],
      img: '/hero/scandinavian_kitchen.png',
      tileRecommendation: 'Natural Oak Porselen Parke 20x120 cm'
    },
    {
      id: 8,
      title: 'Zümrüt Yeşil Balıksırtı Metro Backsplash',
      desc: 'Mutfak tezgah arkasında parlak rölyefli zümrüt yeşili çinilerin zamansız Fransız şıklığı.',
      style: 'Mozaik',
      room: 'Mutfak & Ada',
      tag: 'Artisan Zanaat',
      dimensions: '10x30 cm',
      finish: 'Parlak Rölyef',
      colors: ['#0F5132', '#D4AF37', '#F8F9FA'],
      colorNames: ['Zümrüt Yeşili', 'Pirinç Altın', 'Beyaz Mermer'],
      img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80',
      tileRecommendation: 'Chevron Emerald Green Gloss 10x30 cm'
    },
    {
      id: 9,
      title: 'Rustic Doğal Taş Mutfak & Cotto Sıcaklığı',
      desc: 'Köy evi ve taş villa konseptine uygun pişmiş toprak görünümlü rustik zemin karoları.',
      style: 'Doğal Taş',
      room: 'Mutfak & Ada',
      tag: 'Rustic Farmhouse',
      dimensions: '30x60 cm',
      finish: 'Mat Eskitme',
      colors: ['#B86B43', '#E5D3B3', '#4A3B32'],
      colorNames: ['Cotto Pişmiş Toprak', 'Taş Beji', 'Kestane'],
      img: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1000&q=80',
      tileRecommendation: 'Cotto Antico Mat 30x60 cm'
    },
    {
      id: 10,
      title: 'Mat Siyah Mermer & Altın Çizgili Tezgah',
      desc: 'Sahara Noir esintili siyah zemin üzeri altın damarlı mutfak panelleri ile dramatik estetik.',
      style: 'Mermer',
      room: 'Mutfak & Ada',
      tag: 'Luxury Contrast',
      dimensions: '60x120 cm',
      finish: 'Honed İpeksi Mat',
      colors: ['#111827', '#EAB308', '#F3F4F6'],
      colorNames: ['Sahara Noir Siyah', 'Altın Damar', 'İnci Beyazı'],
      img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
      tileRecommendation: 'Sahara Noir Gold 60x120 cm'
    },

    // SALON & ANTRE
    {
      id: 11,
      title: 'Endüstriyel Beton Loft Salon Zemin',
      desc: 'Geniş açık plan salonlarda brütist beton görünüm ve modern minimalist mobilya kombinasyonu.',
      style: 'Beton',
      room: 'Salon & Antre',
      tag: 'Modern Loft',
      dimensions: '80x80 cm',
      finish: 'Mat R9',
      colors: ['#4B5563', '#9CA3AF', '#D4AF37'],
      colorNames: ['Brüt Beton', 'Açık Duman', 'Bronz Detay'],
      img: '/hero/modern_living.png',
      tileRecommendation: 'Loft Concrete Grey 80x80 cm'
    },
    {
      id: 12,
      title: 'Emperador Kahve Villa Girişi & Antre',
      desc: 'Zengin kahve ve bronz mermer damarlarıyla gösterişli villa ve antre zeminleri.',
      style: 'Mermer',
      room: 'Salon & Antre',
      tag: 'Executive Luxury',
      dimensions: '60x120 cm',
      finish: 'High Gloss Camsı',
      colors: ['#4A3728', '#A0816C', '#FFFFFF'],
      colorNames: ['Koyu Emperador', 'Bronz Damar', 'Beyaz Çizgiler'],
      img: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=80',
      tileRecommendation: 'Emperador Dark Gloss 60x120 cm'
    },
    {
      id: 13,
      title: 'Ceviz Parke Görünümlü Derzsiz Salon',
      desc: 'Yerden ısıtmaya %100 uyumlu, çizilmeyen ve solmayan ceviz desenli derzsiz porselen.',
      style: 'Ahşap',
      room: 'Salon & Antre',
      tag: 'Warm Home',
      dimensions: '20x120 cm',
      finish: 'Mat R10',
      colors: ['#654321', '#8B5A2B', '#D2B48C'],
      colorNames: ['Koyu Ceviz', 'Orta Meşe', 'Kum Beji'],
      img: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1000&q=80',
      tileRecommendation: 'Walnut Prestige Mat 20x120 cm'
    },
    {
      id: 14,
      title: 'Simetrik Bookmatch Calacatta TV Duvarı',
      desc: 'Salonların odak noktasında ayna simetrisiyle birleşen iki parça bookmatch dev porselen şömine duvarı.',
      style: 'Mermer',
      room: 'Salon & Antre',
      tag: 'Bookmatch Efekt',
      dimensions: '120x240 cm',
      finish: 'Ayna Parlaklığı',
      colors: ['#FFFFFF', '#4B5563', '#CA8A04'],
      colorNames: ['Beyaz Zemin', 'Antrasit Damar', 'Bal Sarısı'],
      img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80',
      tileRecommendation: 'Calacatta Bookmatch Twin Slab 120x240 cm'
    },
    {
      id: 15,
      title: 'Bal Parıltılı Amber Onyx Koridor Duvarı',
      desc: 'Işıklı arkadan aydınlatmaya uygun camsı bal rengi amber onyx lüks seramik serisi.',
      style: 'Onyx',
      room: 'Salon & Antre',
      tag: 'Translucent Glamour',
      dimensions: '60x120 cm',
      finish: 'Kristal Parlak',
      colors: ['#D97706', '#FEF3C7', '#78350F'],
      colorNames: ['Amber Balı', 'Krem İpeği', 'Karamel'],
      img: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80',
      tileRecommendation: 'Onyx Amber High Gloss 60x120 cm'
    },

    // YATAK ODASI & SUİT
    {
      id: 16,
      title: 'Huzurlu Meşe & Akustik Yatak Başı Duvarı',
      desc: 'Yatak arkasında sıcak ahşap ve keten dokulu porselen karolar ile sakinleştirici dinlenme alanı.',
      style: 'Ahşap',
      room: 'Yatak Odası & Suit',
      tag: 'Zen Bedroom',
      dimensions: '20x120 cm',
      finish: 'Mat İpeksi',
      colors: ['#C29B38', '#EDE8E1', '#333333'],
      colorNames: ['Sıcak Meşe', 'Keten Beji', 'Mat Kömür'],
      img: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1000&q=80',
      tileRecommendation: 'Scandinavian Oak Fluted 20x120 cm'
    },
    {
      id: 17,
      title: 'Bej Keten Dokulu Master Suite Zemin',
      desc: 'Halı yumuşaklığını porselenin hijyeni ve dayanıklılığıyla buluşturan tekstil dokulu karolar.',
      style: 'Doğal Taş',
      room: 'Yatak Odası & Suit',
      tag: 'Textile Surface',
      dimensions: '60x120 cm',
      finish: 'Mat Soft',
      colors: ['#F3EFEA', '#A89F91', '#4A4238'],
      colorNames: ['Keten Ekru', 'Vizon Grisi', 'Toprak'],
      img: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1000&q=80',
      tileRecommendation: 'Linen Touch Bej 60x120 cm'
    },

    // TERAS, BAHÇE & HAVUZ
    {
      id: 18,
      title: 'Sıcak Traverten Teras & Dış Mekan (R11)',
      desc: 'R11 yüksek kaymazlık değerine sahip doğal traverten karolar ile güvenli ve zamansız teraslar.',
      style: 'Doğal Taş',
      room: 'Teras, Bahçe & Havuz',
      tag: 'R11 Kaymaz Dış Mekan',
      dimensions: '60x120 cm',
      finish: 'R11 Kaymaz Antislip',
      colors: ['#D6C5B3', '#8C7764', '#4E3E31'],
      colorNames: ['Doğal Traverten', 'Toprak Grisi', 'Ceviz Kahvesi'],
      img: '/hero/hero_ceramics.jpg',
      tileRecommendation: 'Travertino Bej R11 Kaymaz 60x120 cm'
    },
    {
      id: 19,
      title: 'Turkuaz Cam Mozaik Sonsuzluk Havuzu',
      desc: 'Güneş ışığında suyun rengini büyüleyici kılan %100 kristal cam mozaik havuz kaplamaları.',
      style: 'Mozaik',
      room: 'Teras, Bahçe & Havuz',
      tag: 'Resort Pool',
      dimensions: '30x30 cm',
      finish: 'Camsı Parlak',
      colors: ['#0284C7', '#38BDF8', '#E0F2FE'],
      colorNames: ['Ege Turkuazı', 'Gökyüzü Mavisi', 'Su Yeşili'],
      img: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1000&q=80',
      tileRecommendation: 'Ocean Turquoise Glass Mosaic 30x30 cm'
    },
    {
      id: 20,
      title: '2 cm Ekstra Kalın Kayrak Taş Bahçe Patikası',
      desc: 'Donmaya ve araç yüküne dayanıklı, harçsız çim üzerine doğrudan döşenebilen 20mm kalın porselen karolar.',
      style: 'Doğal Taş',
      room: 'Teras, Bahçe & Havuz',
      tag: '20 mm Heavy Duty',
      dimensions: '60x60 cm',
      finish: 'R11 Pürüzlü Taş Doku',
      colors: ['#374151', '#4B5563', '#16A34A'],
      colorNames: ['Antrasit Kayrak', 'Volkanik Gri', 'Çim Yeşili'],
      img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80',
      tileRecommendation: 'Outdoor Slate 20mm R11 60x60 cm'
    },
    {
      id: 21,
      title: 'Akdeniz Villa Verandası & Açık Mutfak',
      desc: 'Güneş ışınlarına karşı solmayan, yağmur ve lekelere dirençli dış mekan teras ve veranda seramikleri.',
      style: 'Beton',
      room: 'Teras, Bahçe & Havuz',
      tag: 'Outdoor Living',
      dimensions: '60x120 cm',
      finish: 'Mat R11',
      colors: ['#D1D5DB', '#F3F4F6', '#854D0E'],
      colorNames: ['Kumtaşı Grisi', 'Açık Bej', 'Teak Ahşap'],
      img: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1000&q=80',
      tileRecommendation: 'Sandstone Greige R11 60x120 cm'
    },

    // OFİS, KAFE & TİCARİ
    {
      id: 22,
      title: 'Brütist Beton Kafe & Butik Restoran Zemin',
      desc: 'Ağır yaya trafiğine dirençli, temizliği kolay ve modern endüstriyel havayı yansıtan porselen karolar.',
      style: 'Beton',
      room: 'Ofis, Kafe & Ticari',
      tag: 'High Traffic PEI 5',
      dimensions: '80x80 cm',
      finish: 'Mat R10',
      colors: ['#374151', '#9CA3AF', '#B45309'],
      colorNames: ['Koyu Çimento', 'Gri Beton', 'Deri Kahvesi'],
      img: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1000&q=80',
      tileRecommendation: 'Industrial Loft Concrete 80x80 cm'
    },
    {
      id: 23,
      title: 'Lüks Otel Lobisi & Karşılama Bankosu',
      desc: 'Derin siyah ve altın mermer damarlarıyla ziyaretçileri büyüleyen prestijli ticari zemin kaplamaları.',
      style: 'Mermer',
      room: 'Ofis, Kafe & Ticari',
      tag: 'Commercial Prestige',
      dimensions: '120x240 cm',
      finish: 'Cilalı Ayna Yüzey',
      colors: ['#0F172A', '#D4AF37', '#64748B'],
      colorNames: ['Gece Siyahı', 'Altın Damar', 'Çelik Mavi'],
      img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80',
      tileRecommendation: 'Nero Portoro Ultra Gloss 120x240 cm'
    },
    {
      id: 24,
      title: 'Açık Plan Plaza & Mimarlık Ofisi Zemin',
      desc: 'Tekerlekli çalışma koltuklarına dayanıklı, çizilme direnci maksimum gri mimari porselen plakalar.',
      style: 'Beton',
      room: 'Ofis, Kafe & Ticari',
      tag: 'Office Design',
      dimensions: '60x120 cm',
      finish: 'Mat PEI 5',
      colors: ['#E5E7EB', '#6B7280', '#1F2937'],
      colorNames: ['İpek Gri', 'Grafit', 'Antrasit Profil'],
      img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80',
      tileRecommendation: 'Plaza Cement Silk Grey 60x120 cm'
    },

    // DIŞ CEPHE & MİMARİ
    {
      id: 25,
      title: 'Mekanik Montajlı Havalandırmalı Porselen Cephe',
      desc: 'Binaların dış kabuğunu ısı köprülerinden ve yağmurdan koruyan UV dayanımlı porselen plakalar.',
      style: 'Beton',
      room: 'Dış Cephe & Mimari',
      tag: 'Ventilated Facade',
      dimensions: '60x120 cm',
      finish: 'Mat Dış Cephe',
      colors: ['#1F2937', '#374151', '#9CA3AF'],
      colorNames: ['Koyu Grafit', 'Bazalt Grisi', 'Alüminyum'],
      img: '/images/dealer-banner-default.jpg',
      tileRecommendation: 'Facade Anthracite Porcelain 60x120 cm'
    },
    {
      id: 26,
      title: 'Doğal Taş Dokulu Modern Villa Dış Cephe',
      desc: 'Ahşap kompozit ve cam cephelerle mükemmel kontrast oluşturan hafif ve dayanıklı taş görünümlü plakalar.',
      style: 'Doğal Taş',
      room: 'Dış Cephe & Mimari',
      tag: 'Villa Architecture',
      dimensions: '60x120 cm',
      finish: 'Rölyefli Taş Doku',
      colors: ['#D6D3D1', '#78716C', '#292524'],
      colorNames: ['Kireçtaşı Beji', 'Kaya Grisi', 'Antrasit Doğrama'],
      img: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1000&q=80',
      tileRecommendation: 'Limestone Relief Facade 60x120 cm'
    },
    {
      id: 27,
      title: 'Akdeniz Beyaz Kireçtaşı Villa Giriş Verandası',
      desc: 'Yaz sıcaklarında ayak yakmayan, ışığı yumuşak yansıtan doğal kemik tonlu geniş format dış karolar.',
      style: 'Doğal Taş',
      room: 'Dış Cephe & Mimari',
      tag: 'Mediterranean Villa',
      dimensions: '80x80 cm',
      finish: 'Mat R10',
      colors: ['#F5F5F4', '#D6D3D1', '#1C1917'],
      colorNames: ['Kireç Beyazı', 'Kum Grisi', 'Doğal Ahşap'],
      img: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1000&q=80',
      tileRecommendation: 'Antalya Limestone Warm White 80x80 cm'
    },
    {
      id: 28,
      title: 'İtalyan Terrazzo Kafe Giriş Kaplaması',
      desc: 'Renkli mermer agregalı terrazzo porselen ile müşterileri karşılayan ikonik tasarım zemini.',
      style: 'Terrazzo',
      room: 'Ofis, Kafe & Ticari',
      tag: 'Boutique Retail',
      dimensions: '60x60 cm',
      finish: 'Mat Pürüzsüz',
      colors: ['#F4ECE4', '#A8836E', '#2C3E50'],
      colorNames: ['Krem Terrazzo', 'Terracotta Agrega', 'Koyu Lacivert'],
      img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80',
      tileRecommendation: 'Terrazzo Milano Rosso 60x60 cm'
    }
  ]);

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. LIVE CERAMIC INDUSTRY AGENDA & NEWS (Seramiğin Nabzı)
  // ─────────────────────────────────────────────────────────────────────────────
  const liveNewsItems = [
    {
      id: 'news-1',
      badge: 'CANLI FUAR GÜNDEMİ',
      badgeColor: '#ef4444',
      date: 'Eylül 2026',
      title: 'Cersaie 2026 Bologna Fuarı: 160x320 cm Dev Plakalar ve Doğal Dokular Damga Vurdu',
      summary: 'İtalya Bologna’da düzenlenen dünyanın en büyük seramik fuarında, dikişsiz ek yeri bırakmayan dev format porselen plakalar (Slabs) ve dokunma hissi uyandıran 3D rölyefli mat yüzeyler öne çıktı.',
      source: 'Cersaie Official / Bologna',
      readTime: '3 dk okuma',
      trendScore: '+%84 İlgi',
      stats: 'Dev Plakalar pazarın %32’sine ulaştı'
    },
    {
      id: 'news-2',
      badge: 'TÜRKİYE ÜRETİCİLERİ',
      badgeColor: '#b38e47',
      date: '2026 Sezonu',
      title: 'UNICERA İstanbul Zirvesi: Türk Üreticilerden Küresel İhracat ve Yeşil Fırınlama Hamlesi',
      summary: 'Bien, VitrA, NG Kütahya, Ege Seramik ve Qua Granite gibi lider üreticiler, doğalgaz tüketimini %40 azaltan yeni nesil ekolojik fırın teknolojilerini ve 2026-2027 ihracat koleksiyonlarını tanıttı.',
      source: 'TSF / UNICERA Raporu',
      readTime: '4 dk okuma',
      trendScore: '142 Ülkeye İhracat',
      stats: 'Türkiye Avrupa’nın 2. büyük üreticisi'
    },
    {
      id: 'news-3',
      badge: 'MİMARİ TREND DEĞİŞİMİ',
      badgeColor: '#10b981',
      date: 'Yeni Trend',
      title: 'Soğuk Beyaz Mermer Yerini Sıcak Traverten ve Kemik Bej Tonlarına Bırakıyor',
      summary: 'İç mimarlar bu sezon banyolarda steril soğuk gri tonlar yerine, sıcak traverten, kum beji ve ceviz ahşap kombinasyonlarını (Japandi & Wabi-Sabi) birinci sıraya taşıdı.',
      source: 'Architectural Digest Mimari Raporu',
      readTime: '2 dk okuma',
      trendScore: '+%72 Talep Artışı',
      stats: 'Kemik beji seramik aramaları zirvede'
    },
    {
      id: 'news-4',
      badge: 'TEKNOLOJİ & İNOVASYON',
      badgeColor: '#2563eb',
      date: '2026 İnovasyon',
      title: '2 cm Ekstra Kalın Dış Mekan Karoları: Çim ve Teraslarda Harçsız Devrim',
      summary: '20 mm kalınlığındaki dış mekan porselen karolar, harç ve yapıştırıcı gerektirmeden çakıl, çim veya ayarlanabilir ayaklar üzerine doğrudan serilerek teras yenilemelerini 1 güne indirdi.',
      source: 'SeramikBak Teknik Departman',
      readTime: '3 dk okuma',
      trendScore: 'R11 Yüksek Kaymazlık',
      stats: 'Teras projelerinde %60 montaj hızı'
    }
  ];

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. BEFORE / AFTER RENOVATION SHOWCASE
  // ─────────────────────────────────────────────────────────────────────────────
  const beforeAfterProjects = [
    {
      id: 1,
      title: 'Eski 90’lar Banyonun Lüks Calacatta Mermer Spa Dönüşümü',
      location: 'Bağdat Caddesi, İstanbul',
      m2: '14 m²',
      beforeDesc: 'Küçük sararmış 20x20 fayanslar, kalın sarı derzler ve daraltıcı kabin.',
      afterDesc: '60x120 Calacatta Gold rektifiyeli parlak porselen karolar, gizli ledler ve fırçalanmış pirinç armatürler ile 5 yıldızlı otel banyosu ferahlığı.',
      beforeImg: 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&w=1000&q=80',
      afterImg: '/hero/luxury_bathroom.png',
      tilesUsed: ['Calacatta Gold 60x120 cm', 'Basalt Gri 60x60 cm Mat'],
      budgetSavings: 'Doğrudan Bayi Teklifi ile %28 Tasarruf'
    },
    {
      id: 2,
      title: 'Karanlık Mutfaktan İskandinav Meşe & Statuario Plakalı Aydınlık Yaşama',
      location: 'Çankaya, Ankara',
      m2: '22 m²',
      beforeDesc: 'Çizilmiş laminat zemin, yağ lekesi tutmuş eski tezgah arası fayanslar.',
      afterDesc: 'Suya dayanıklı 20x120 ham meşe porselen parke ve 120x240 kesintisiz leke tutmaz beyaz mermer ada tezgahı.',
      beforeImg: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1000&q=80',
      afterImg: '/hero/scandinavian_kitchen.png',
      tilesUsed: ['Natural Oak 20x120 cm Mat', 'Statuario Extra Slab 120x240 cm'],
      budgetSavings: 'Mimar & Bayi Kampanyası ile %32 Tasarruf'
    }
  ];

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. EDUCATIONAL & TECHNICAL ARTICLES
  // ─────────────────────────────────────────────────────────────────────────────
  const [articles, setArticles] = useState([
    {
      id: 1,
      title: 'Rektifiyeli Seramik Nedir? Derz Aralıkları Neden 1mm Olmalıdır?',
      summary: 'Seramiklerin kenarlarının lazerle traşlanarak 90 derece dikleştirilmesi işlemine rektifiye denir. Kesintisiz mekan algısı sağlar.',
      category: 'Teknik Rehber',
      readTime: '4 dk okuma',
      content: `
        <h3>Rektifiyeli Seramik Nedir?</h3>
        <p>Rektifiyeli seramik veya porselen karolar, pişirilme aşamasından sonra kenarlarının özel elmas bıçaklarla traşlanarak tam 90 derecelik dik açılara getirilmesi işlemidir. Standart seramiklerde kenarlar hafif yuvarlak gelirken, rektifiyeli ürünlerin kenarları keskin ve düzdür.</p>
        
        <h3>Rektifiyeli Seramiklerin Avantajları Nelerdir?</h3>
        <ul>
          <li><strong>Minimum Derz Boşluğu:</strong> Kenarları dik açılı olduğu için karolar birbirine 1mm - 1.5mm gibi incecik derzlerle döşenebilir.</li>
          <li><strong>Kesintisiz Yüzey Görünümü:</strong> Derz çizgileri çok az fark edildiği için oda olduğundan çok daha geniş ve modern görünür.</li>
          <li><strong>Kolay Temizlik:</strong> Kalın derz alanları olmadığı için kir birikimi ve küf oluşumu minimuma iner.</li>
        </ul>

        <h3>Döşerken Nelere Dikkat Edilmelidir?</h3>
        <p>Zeminin şapı ve terazisi kusursuz olmalıdır. Montaj sırasında mutlaka profesyonel seramik klipsleri ve tesviye takozları kullanılmalıdır.</p>
      `
    },
    {
      id: 2,
      title: 'Mat mı, Parlak (Full Lappato) Seramik mi? Mekana Göre Doğru Tercih',
      summary: 'Zemin ve duvar karolarında mat ve parlak yüzeylerin kaymazlık, leke tutma, ışık yansıtma ve temizlik karşılaştırması.',
      category: 'Tasarım İpuçları',
      readTime: '5 dk okuma',
      content: `
        <h3>Mat ve Parlak Karoların Karşılaştırması</h3>
        <p>Seramik seçiminde doğru karar verebilmek için odanın ışık alma durumu ve kullanım amacı dikkate alınmalıdır.</p>

        <h3>Parlak (Lappato / Full Lappato) Seramikler</h3>
        <ul>
          <li><strong>Nerede Kullanılmalı?</strong> Işığı az alan dar banyolar, holler, salon şömine arkaları ve duvar kaplamaları için mükemmeldir. Odayı ayna gibi ferah gösterir.</li>
          <li><strong>Önemli Uyarı:</strong> Islakken kayganlaşırlar. Bu nedenle banyo duş zeminleri veya dış mekan merdivenleri için önerilmez.</li>
        </ul>

        <h3>Mat Seramikler</h3>
        <ul>
          <li><strong>Nerede Kullanılmalı?</strong> Banyo zeminleri, mutfak zeminleri, balkonlar, teraslar ve yaya trafiğinin yoğun olduğu alanlar.</li>
          <li><strong>Kaymazlık Değeri (R Derecesi):</strong> Islak zeminler için mutlaka R10 veya R11 sınıfı mat seramikler tercih edilmelidir.</li>
        </ul>
      `
    },
    {
      id: 3,
      title: '2026 Banyo Tasarım Trendleri: Doğallığa Dönüş, Traverten ve Japandi',
      summary: 'Bu yıl banyolarda mermer soğukluğundan ziyade sıcak traverten tonları, ham meşe ahşap dokuları ve yeşil bitkiler hakim.',
      category: 'Trendler',
      readTime: '3 dk okuma',
      content: `
        <h3>2026 Banyo Tasarımlarında Öne Çıkanlar</h3>
        <p>Banyolar artık evlerin kişisel spa merkezleri ve dinlenme köşeleri haline geldi. İşte öne çıkan trendler:</p>
        <ul>
          <li><strong>Sıcak Traverten ve Bej Tonları:</strong> Soğuk gri yerini kemik rengi, bej ve sıcak traverten dokularına bırakıyor.</li>
          <li><strong>Ahşap Görünümlü Porselen:</strong> Suya ve neme %100 dayanıklı ahşap desenli porselen karolar banyoya sıcaklık katar.</li>
          <li><strong>Mat Bronz ve Pirinç Bataryalar:</strong> Klasik krom yerine fırçalanmış mat bronz batarya kombinasyonları.</li>
          <li><strong>Gömme Niş Aydınlatmaları:</strong> Duş nişlerinde gizli led profillerle seramik dokusunu vurgulama.</li>
        </ul>
      `
    },
    {
      id: 4,
      title: 'Dev Porselen Plakalar (Slabs): Mutfak Tezgahı ve Banyolarda Kullanım',
      summary: '120x240 cm ve 160x320 cm dev porselen plakaların montaj teknikleri, dikişsiz mutfak adaları ve banyo zemin avantajları.',
      category: 'Mimari İnceleme',
      readTime: '6 dk okuma',
      content: `
        <h3>Büyük Ebatlı Porselen Plakaların Yükselişi</h3>
        <p>Geleneksel mermer ve granitin yerini hızla porselen plakalar (slabs) alıyor. Neden?</p>
        <ul>
          <li><strong>Leke ve Asit Geçirimsizliği:</strong> Doğal mermer limon ve yağdan leke tutarken, porselen plaka sıfır emiciliğe sahiptir.</li>
          <li><strong>Çizilme ve Isı Direnci:</strong> Sıcak tencere doğrudan tezgahın üzerine konulabilir, bıçakla çizilmez.</li>
          <li><strong>Görsel Kesintisizlik:</strong> 120x240 cm tek plaka bir banyo duvarını baştan başa kaplar, hiçbir derz çizgisi kalmaz.</li>
        </ul>
      `
    }
  ]);

  // Filtered Gallery logic
  const filteredGallery = useMemo(() => {
    return galleryItems.filter(item => {
      const matchRoom = selectedRoomFilter === 'ALL' || item.room === selectedRoomFilter;
      const matchStyle = selectedStyleFilter === 'ALL' || item.style === selectedStyleFilter;
      const matchQuery = !searchQuery.trim() || (
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tileRecommendation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.style.toLowerCase().includes(searchQuery.toLowerCase())
      );
      return matchRoom && matchStyle && matchQuery;
    });
  }, [galleryItems, selectedRoomFilter, selectedStyleFilter, searchQuery]);

  // Saved items for moodboard modal
  const savedGalleryItems = useMemo(() => {
    return galleryItems.filter(item => savedIds.includes(item.id));
  }, [galleryItems, savedIds]);

  // Current active before/after project
  const currentProject = beforeAfterProjects.find(p => p.id === activeBeforeAfterId) || beforeAfterProjects[0];

  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #090d16 0%, #0f172a 400px, #f8fafc 400px, #f1f5f9 100%)',
      fontFamily: 'Inter, system-ui, sans-serif',
      color: '#0f172a',
      position: 'relative',
      overflowX: 'hidden'
    }}>

      {/* ─────────────────────────────────────────────────────────────────────────────
          TOP BAR & NAVIGATION
      ───────────────────────────────────────────────────────────────────────────── */}
      <header style={{
        background: 'rgba(15, 23, 42, 0.92)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        boxShadow: '0 4px 30px rgba(0,0,0,0.3)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '14px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px'
        }}>
          <Link href="/" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            textDecoration: 'none',
            color: '#cbd5e1',
            fontSize: '0.84rem',
            fontWeight: '700',
            transition: 'color 0.2s'
          }}>
            <ArrowLeft size={16} />
            <span>Ana Sayfaya Dön</span>
          </Link>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #b38e47 0%, #d4af37 100%)',
              color: '#090d16',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '900',
              fontSize: '0.95rem'
            }}>SB</div>
            <span style={{ fontSize: '1.05rem', fontWeight: '850', color: '#ffffff', letterSpacing: '-0.01em' }}>
              SeramikBak <span style={{ color: '#d4af37' }}>İlham & Gündem Hub</span>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setShowMoodboardModal(true)}
              style={{
                background: savedIds.length > 0 ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                border: savedIds.length > 0 ? '1px solid #d4af37' : '1px solid rgba(255, 255, 255, 0.15)',
                color: savedIds.length > 0 ? '#d4af37' : '#cbd5e1',
                padding: '6px 14px',
                borderRadius: '10px',
                fontSize: '0.78rem',
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <Heart size={14} fill={savedIds.length > 0 ? '#d4af37' : 'none'} />
              <span>İlham Panom ({savedIds.length})</span>
            </button>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────────────────────
          CANLI SERAMİK GÜNDEMİ TICKER (Live News Ticker)
      ───────────────────────────────────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(90deg, #111827 0%, #1e293b 100%)',
        borderBottom: '1px solid rgba(212, 175, 55, 0.25)',
        padding: '8px 16px',
        overflow: 'hidden'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(239, 68, 68, 0.18)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#f87171',
            padding: '3px 9px',
            borderRadius: '6px',
            fontSize: '0.68rem',
            fontWeight: '900',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            flexShrink: 0
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 1.5s infinite' }}></span>
            <span>Canlı Gündem</span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            overflowX: 'auto',
            whiteSpace: 'nowrap',
            fontSize: '0.78rem',
            color: '#e2e8f0',
            scrollbarWidth: 'none'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <strong style={{ color: '#d4af37' }}>Cersaie 2026:</strong> 160x320 cm dev plakalar ve traverten damgası vuruyor.
            </span>
            <span style={{ color: '#64748b' }}>&bull;</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <strong style={{ color: '#10b981' }}>Trend Analizi:</strong> Soğuk beyaz mermerden sıcak kemik bejine geçiş (+%72 talep).
            </span>
            <span style={{ color: '#64748b' }}>&bull;</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <strong style={{ color: '#38bdf8' }}>Dış Mekan:</strong> 2cm kalınlığındaki harçsız teras porselenleri yükselişte.
            </span>
            <span style={{ color: '#64748b' }}>&bull;</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <strong style={{ color: '#fbbf24' }}>UNICERA İstanbul:</strong> Türk seramik devlerinin yeni ihracat koleksiyonları yayında.
            </span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          HERO & INTERACTIVE TAB SELECTOR
      ───────────────────────────────────────────────────────────────────────────── */}
      <section style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 24px 28px 24px',
        textAlign: 'center',
        color: '#ffffff'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(212, 175, 55, 0.15)',
          border: '1px solid rgba(212, 175, 55, 0.35)',
          color: '#d4af37',
          padding: '6px 16px',
          borderRadius: '20px',
          fontSize: '0.75rem',
          fontWeight: '800',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: '16px'
        }}>
          <Sparkles size={14} />
          <span>2026 Mimari Seramik Trendleri & Canlı Sektör Radarı</span>
        </div>

        <h1 style={{
          fontSize: 'clamp(2.1rem, 4.2vw, 3.2rem)',
          fontWeight: '950',
          letterSpacing: '-0.03em',
          margin: '0 0 16px 0',
          color: '#ffffff',
          lineHeight: '1.2'
        }}>
          Yaşam Alanınız İçin Kusursuz Seramik İlhamı
        </h1>

        <p style={{
          fontSize: '1.05rem',
          color: '#94a3b8',
          maxWidth: '720px',
          margin: '0 auto 28px auto',
          lineHeight: '1.6'
        }}>
          Banyo, mutfak, salon veya terasınızı yenilerken 28+ seçkin mimari projeden ilham alın; seramiğin canlı gündemini takip edin ve 3D stüdyoda kendi odanızda canlı deneyin.
        </p>

        {/* 5 Main Section Navigation Tabs */}
        <div style={{
          display: 'inline-flex',
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(16px)',
          padding: '6px',
          borderRadius: '18px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '6px'
        }}>
          {[
            { id: 'gallery', label: 'Tasarım İlham Galerisi', count: '28+ Mekan', icon: Sparkles },
            { id: 'news', label: 'Seramiğin Gündemi & Trendler', count: 'Canlı Nabız', icon: Newspaper },
            { id: 'beforeAfter', label: 'Önce / Sonra Dönüşümler', count: 'Gerçek Projeler', icon: Eye },
            { id: 'calculator', label: 'Metraj & Derz Hesaplayıcı', count: 'Akıllı Araç', icon: Calculator },
            { id: 'blog', label: 'Teknik Seçim Rehberleri', count: '4 Rehber', icon: BookOpen }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '10px 18px',
                  borderRadius: '12px',
                  border: isActive ? '1px solid #d4af37' : '1px solid transparent',
                  background: isActive ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' : 'transparent',
                  color: isActive ? '#d4af37' : '#94a3b8',
                  fontWeight: '800',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? '0 4px 15px rgba(212,175,55,0.2)' : 'none'
                }}
              >
                <Icon size={16} style={{ color: isActive ? '#d4af37' : '#64748b' }} />
                <span>{tab.label}</span>
                <span style={{
                  fontSize: '0.68rem',
                  padding: '1px 6px',
                  borderRadius: '6px',
                  background: isActive ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                  color: isActive ? '#d4af37' : '#64748b'
                }}>{tab.count}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────────
          MAIN CONTENT CONTAINER
      ───────────────────────────────────────────────────────────────────────────── */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '30px 24px 120px 24px',
        position: 'relative',
        zIndex: 2
      }}>

        {/* ═════════════════════════════════════════════════════════════════════════
            TAB 1: ENRICHED INSPIRATION GALLERY
        ═════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'gallery' && (
          <section style={{ animation: 'fadeIn 0.3s ease-out' }}>
            
            {/* Filter & Search Toolbar */}
            <div style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '20px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 8px 30px rgba(0,0,0,0.03)',
              marginBottom: '32px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              {/* Room Tabs */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Mekan Kategorileri ({filteredGallery.length} Model Listeleniyor)
                  </span>
                  {savedIds.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowMoodboardModal(true)}
                      style={{ background: 'none', border: 'none', color: '#b38e47', fontSize: '0.75rem', fontWeight: '750', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Heart size={12} fill="#b38e47" />
                      <span>{savedIds.length} Görsel Panonuzda</span>
                    </button>
                  )}
                </div>

                <div style={{
                  display: 'flex',
                  gap: '8px',
                  overflowX: 'auto',
                  paddingBottom: '4px',
                  scrollbarWidth: 'none'
                }}>
                  {[
                    { id: 'ALL', label: 'Tüm Mekanlar' },
                    { id: 'Banyo & Spa', label: '🛁 Banyo & Spa' },
                    { id: 'Mutfak & Ada', label: '🍳 Mutfak & Ada' },
                    { id: 'Salon & Antre', label: '🛋️ Salon & Antre' },
                    { id: 'Yatak Odası & Suit', label: '🛏️ Yatak Odası' },
                    { id: 'Teras, Bahçe & Havuz', label: '🌿 Teras & Havuz' },
                    { id: 'Ofis, Kafe & Ticari', label: '☕ Ticari & Ofis' },
                    { id: 'Dış Cephe & Mimari', label: '🏢 Dış Cephe' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedRoomFilter(tab.id)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '10px',
                        border: selectedRoomFilter === tab.id ? '1.5px solid #d4af37' : '1px solid #e2e8f0',
                        background: selectedRoomFilter === tab.id ? '#0f172a' : '#f8fafc',
                        color: selectedRoomFilter === tab.id ? '#d4af37' : '#475569',
                        fontSize: '0.8rem',
                        fontWeight: '750',
                        whiteSpace: 'nowrap',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Secondary Style & Search Row */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                paddingTop: '12px',
                borderTop: '1px solid #f1f5f9'
              }}>
                {/* Style Pills */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: '750', color: '#94a3b8', marginRight: '4px' }}>Stil:</span>
                  {['ALL', 'Mermer', 'Beton', 'Ahşap', 'Doğal Taş', 'Terrazzo', 'Mozaik'].map(st => (
                    <button
                      key={st}
                      onClick={() => setSelectedStyleFilter(st)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: 'none',
                        fontSize: '0.74rem',
                        fontWeight: '700',
                        background: selectedStyleFilter === st ? '#b38e47' : '#f1f5f9',
                        color: selectedStyleFilter === st ? '#ffffff' : '#64748b',
                        cursor: 'pointer'
                      }}
                    >
                      {st === 'ALL' ? 'Tümü' : st}
                    </button>
                  ))}
                </div>

                {/* Search Bar */}
                <div style={{ position: 'relative', width: '100%', maxWidth: '280px' }}>
                  <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Seramik veya stil ara..."
                    style={{
                      width: '100%',
                      padding: '8px 12px 8px 34px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.8rem',
                      outline: 'none'
                    }}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Editor's Choice Spotlight Banner */}
            {selectedRoomFilter === 'ALL' && !searchQuery && selectedStyleFilter === 'ALL' && (
              <div style={{
                background: 'linear-gradient(135deg, #111827 0%, #0f172a 100%)',
                borderRadius: '24px',
                border: '1.5px solid rgba(212, 175, 55, 0.4)',
                overflow: 'hidden',
                boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                marginBottom: '36px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                alignItems: 'center'
              }}>
                <div style={{ height: '340px', position: 'relative', overflow: 'hidden' }}>
                  <img
                    src="/hero/luxury_bathroom.png"
                    alt="Haftanın İlhamı - Lüks Calacatta Camsı Banyo"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '20px',
                    left: '20px',
                    background: 'linear-gradient(135deg, #b38e47 0%, #d4af37 100%)',
                    color: '#090d16',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontWeight: '900',
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 15px rgba(212,175,55,0.4)'
                  }}>
                    <Award size={15} />
                    <span>Haftanın Editör Seçimi</span>
                  </div>
                </div>

                <div style={{ padding: '36px', color: '#ffffff', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.72rem', color: '#d4af37', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      2026 Sezon Zirvesi &bull; İtalyan Calacatta Trendi
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.6rem', fontWeight: '900', margin: 0, lineHeight: '1.25' }}>
                    Camsı Beyaz Calacatta & Pirinç Armatür Banyo Kombinasyonu
                  </h3>

                  <p style={{ fontSize: '0.9rem', color: '#94a3b8', margin: 0, lineHeight: '1.6' }}>
                    Geniş ebatlı 60x120 cm rektifiyeli tam parlak porselen karolar ile dikişsiz ayna ferahlığı. Işık kırılmalarıyla banyonuzu 2 kat daha aydınlık gösterir.
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{ background: 'rgba(255,255,255,0.06)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.76rem' }}>
                      <span style={{ color: '#94a3b8' }}>Önerilen Model: </span>
                      <strong style={{ color: '#d4af37' }}>Calacatta Gold 60x120 cm</strong>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.06)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.76rem', color: '#10b981', fontWeight: '750' }}>
                      ✓ Rektifiyeli &bull; 1mm Derz
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '6px' }}>
                    <Link
                      href="/?q=Calacatta&tab=studio"
                      style={{
                        background: 'linear-gradient(135deg, #b38e47 0%, #d4af37 100%)',
                        color: '#090d16',
                        padding: '10px 20px',
                        borderRadius: '10px',
                        textDecoration: 'none',
                        fontSize: '0.84rem',
                        fontWeight: '850',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 4px 15px rgba(212,175,55,0.3)'
                      }}
                    >
                      <Sparkles size={16} />
                      <span>3D Stüdyoda Canlı Gör</span>
                    </Link>

                    <Link
                      href="/proje-talep?style=Mermer&product=Calacatta"
                      style={{
                        background: 'rgba(255,255,255,0.08)',
                        color: '#ffffff',
                        border: '1px solid rgba(255,255,255,0.18)',
                        padding: '10px 18px',
                        borderRadius: '10px',
                        textDecoration: 'none',
                        fontSize: '0.84rem',
                        fontWeight: '750',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>En Yakın Bayiden Fiyat İste</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Gallery Cards Grid (28 Models) */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))',
              gap: '26px'
            }}>
              {filteredGallery.map((item) => {
                const isSaved = savedIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    style={{
                      background: '#ffffff',
                      border: '1px solid rgba(0, 0, 0, 0.06)',
                      borderRadius: '24px',
                      overflow: 'hidden',
                      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.03)',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      position: 'relative'
                    }}
                  >
                    {/* Image Area */}
                    <div style={{ height: '240px', position: 'relative', background: '#e2e8f0', overflow: 'hidden' }}>
                      <img 
                        src={item.img} 
                        alt={item.title} 
                        loading="lazy"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      
                      {/* Top Badges */}
                      <div style={{
                        position: 'absolute',
                        top: '14px',
                        left: '14px',
                        background: 'rgba(15, 23, 42, 0.88)',
                        backdropFilter: 'blur(6px)',
                        color: '#ffffff',
                        padding: '4px 10px',
                        borderRadius: '8px',
                        fontSize: '0.7rem',
                        fontWeight: '800',
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}>{item.tag}</div>

                      {/* Save to Moodboard Heart Button */}
                      <button
                        type="button"
                        onClick={(e) => toggleSaveMoodboard(item.id, e)}
                        title={isSaved ? "İlham Panomdan Çıkar" : "İlham Panoma Kaydet"}
                        style={{
                          position: 'absolute',
                          top: '14px',
                          right: '14px',
                          background: isSaved ? '#d4af37' : 'rgba(15, 23, 42, 0.75)',
                          backdropFilter: 'blur(6px)',
                          border: isSaved ? '1px solid #b38e47' : '1px solid rgba(255,255,255,0.2)',
                          color: isSaved ? '#090d16' : '#ffffff',
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        <Heart size={17} fill={isSaved ? '#090d16' : 'none'} />
                      </button>

                      {/* Room & Spec Badges */}
                      <div style={{
                        position: 'absolute',
                        bottom: '14px',
                        left: '14px',
                        display: 'flex',
                        gap: '6px'
                      }}>
                        <div style={{
                          background: 'rgba(255, 255, 255, 0.94)',
                          backdropFilter: 'blur(6px)',
                          color: '#0f172a',
                          padding: '3px 9px',
                          borderRadius: '6px',
                          fontSize: '0.7rem',
                          fontWeight: '800'
                        }}>
                          📍 {item.room}
                        </div>
                        {item.finish && (
                          <div style={{
                            background: 'rgba(15, 23, 42, 0.82)',
                            backdropFilter: 'blur(6px)',
                            color: '#d4af37',
                            padding: '3px 9px',
                            borderRadius: '6px',
                            fontSize: '0.68rem',
                            fontWeight: '750'
                          }}>
                            {item.finish}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Content Area */}
                    <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '10px', flexGrow: 1 }}>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: '850', margin: 0, color: '#0f172a', lineHeight: '1.35' }}>
                        {item.title}
                      </h4>
                      
                      <p style={{ fontSize: '0.84rem', color: '#64748b', margin: 0, lineHeight: '1.5' }}>
                        {item.desc}
                      </p>

                      {/* Color Palette Indicators */}
                      {item.colors && item.colors.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                          <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '700' }}>Renk Paleti:</span>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            {item.colors.map((c, cIdx) => (
                              <span
                                key={cIdx}
                                title={item.colorNames?.[cIdx] || c}
                                style={{
                                  width: '18px',
                                  height: '18px',
                                  borderRadius: '50%',
                                  background: c,
                                  border: '1px solid rgba(0,0,0,0.15)',
                                  display: 'inline-block'
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Recommended Tile Spec Box */}
                      {item.tileRecommendation && (
                        <div style={{
                          background: '#f8fafc',
                          padding: '10px 12px',
                          borderRadius: '12px',
                          border: '1px solid #f1f5f9',
                          fontSize: '0.76rem',
                          marginTop: '4px'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#64748b', fontWeight: '600' }}>Önerilen Karo:</span>
                            <span style={{ color: '#b38e47', fontWeight: '800' }}>{item.dimensions}</span>
                          </div>
                          <div style={{ fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>
                            {item.tileRecommendation}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px',
                        marginTop: 'auto',
                        paddingTop: '16px',
                        borderTop: '1px solid #f1f5f9'
                      }}>
                        <Link
                          href={`/?q=${encodeURIComponent(item.style)}&tab=studio`}
                          style={{
                            background: '#0f172a',
                            color: '#ffffff',
                            padding: '8px 14px',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            fontSize: '0.78rem',
                            fontWeight: '800',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.2s'
                          }}
                        >
                          <Sparkles size={13} style={{ color: '#d4af37' }} />
                          <span>3D Canlı Gör</span>
                        </Link>

                        <Link
                          href={`/proje-talep?style=${encodeURIComponent(item.style)}&room=${encodeURIComponent(item.room)}`}
                          style={{
                            background: 'rgba(212, 175, 55, 0.12)',
                            color: '#8c6b30',
                            border: '1px solid rgba(212, 175, 55, 0.3)',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            fontSize: '0.78rem',
                            fontWeight: '800',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <span>Fiyat İste</span>
                          <ChevronRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ═════════════════════════════════════════════════════════════════════════
            TAB 2: SERAMİĞİN GÜNDEMİ & CANLI TREND RADARI
        ═════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'news' && (
          <section style={{ animation: 'fadeIn 0.3s ease-out' }}>
            
            {/* Agenda Header & Market Pulse */}
            <div style={{
              background: '#ffffff',
              borderRadius: '24px',
              padding: '28px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
              marginBottom: '32px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
                    <Flame size={22} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: '900', margin: 0, color: '#0f172a' }}>
                      Seramiğin Gündemi & Canlı Sektör Raporu
                    </h2>
                    <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '2px 0 0 0' }}>
                      Cersaie Bologna, UNICERA ve iç mimarlık dünyasından en son üretim teknolojileri, hammadde ve renk analizleri.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', padding: '6px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.74rem', color: '#64748b' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span>
                  <span>Veriler Günlük Canlı Güncellenir</span>
                </div>
              </div>

              {/* Real Market Pulse Metric Cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '16px'
              }}>
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>
                    En Çok Tercih Edilen Ebat
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: '950', color: '#0f172a', margin: '4px 0' }}>
                    60x120 cm (%48 Pay)
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#10b981', fontWeight: '750' }}>
                    ↑ Derzsiz kesintisiz banyo ve salon standardı
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>
                    Yükselen Doku & Renk
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: '950', color: '#b38e47', margin: '4px 0' }}>
                    Sıcak Traverten & Bej
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#b38e47', fontWeight: '750' }}>
                    ↑ Soğuk griye göre +%72 talep artışı
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>
                    2026 İnovasyon Lideri
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: '950', color: '#2563eb', margin: '4px 0' }}>
                    2 cm Dış Mekan Karoları
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#2563eb', fontWeight: '750' }}>
                    Harçsız çim & yükseltilmiş döşeme
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>
                    Türkiye Üretim Gücü
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: '950', color: '#059669', margin: '4px 0' }}>
                    Avrupa 2.si &bull; 140+ Ülke
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#059669', fontWeight: '750' }}>
                    Global porselen ihracat rekoru
                  </div>
                </div>
              </div>
            </div>

            {/* Live News Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: '24px'
            }}>
              {liveNewsItems.map(item => (
                <div
                  key={item.id}
                  style={{
                    background: '#ffffff',
                    borderRadius: '20px',
                    padding: '26px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.02)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                      padding: '3px 10px',
                      borderRadius: '6px',
                      fontSize: '0.7rem',
                      fontWeight: '900',
                      background: `${item.badgeColor}15`,
                      color: item.badgeColor,
                      border: `1px solid ${item.badgeColor}35`
                    }}>
                      {item.badge}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '600' }}>{item.date}</span>
                  </div>

                  <h3 style={{ fontSize: '1.18rem', fontWeight: '850', margin: 0, color: '#0f172a', lineHeight: '1.35' }}>
                    {item.title}
                  </h3>

                  <p style={{ fontSize: '0.85rem', color: '#475569', margin: 0, lineHeight: '1.6' }}>
                    {item.summary}
                  </p>

                  <div style={{
                    background: '#f8fafc',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #f1f5f9',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.74rem',
                    marginTop: '4px'
                  }}>
                    <span style={{ color: '#64748b' }}>Kaynak: <strong>{item.source}</strong></span>
                    <span style={{ color: '#b38e47', fontWeight: '800' }}>{item.trendScore}</span>
                  </div>

                  <div style={{
                    marginTop: 'auto',
                    paddingTop: '12px',
                    borderTop: '1px solid #f1f5f9',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{item.readTime}</span>
                    <Link
                      href={`/?q=${encodeURIComponent(item.badge)}`}
                      style={{
                        fontSize: '0.8rem',
                        fontWeight: '800',
                        color: '#0f172a',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <span>İlgili Karoları İncele</span>
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ═════════════════════════════════════════════════════════════════════════
            TAB 3: BEFORE / AFTER RENOVATION SHOWCASE
        ═════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'beforeAfter' && (
          <section style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <div style={{
              background: '#ffffff',
              borderRadius: '24px',
              padding: '32px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: '900', margin: 0, color: '#0f172a' }}>
                    Önce & Sonra: Gerçek Mekan Dönüşüm Vitrini
                  </h2>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0 0' }}>
                    Eski ve yıpranmış mekanların SeramikBak porselen karoları ile nasıl 5 yıldızlı yaşam alanlarına dönüştüğünü inceleyin.
                  </p>
                </div>

                {/* Project Selector Tabs */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  {beforeAfterProjects.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setActiveBeforeAfterId(p.id)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '10px',
                        border: activeBeforeAfterId === p.id ? '1.5px solid #d4af37' : '1px solid #e2e8f0',
                        background: activeBeforeAfterId === p.id ? '#0f172a' : '#f8fafc',
                        color: activeBeforeAfterId === p.id ? '#d4af37' : '#64748b',
                        fontSize: '0.8rem',
                        fontWeight: '800',
                        cursor: 'pointer'
                      }}
                    >
                      Proje {p.id}: {p.location.split(',')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* View Toggle Bar (Before vs After) */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <div style={{
                  display: 'inline-flex',
                  background: '#f1f5f9',
                  padding: '4px',
                  borderRadius: '12px'
                }}>
                  <button
                    onClick={() => setBeforeAfterView('before')}
                    style={{
                      padding: '8px 24px',
                      borderRadius: '8px',
                      border: 'none',
                      background: beforeAfterView === 'before' ? '#ef4444' : 'transparent',
                      color: beforeAfterView === 'before' ? '#ffffff' : '#64748b',
                      fontSize: '0.82rem',
                      fontWeight: '800',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    ⏮️ Önceki Hali (Eski Döşeme)
                  </button>
                  <button
                    onClick={() => setBeforeAfterView('after')}
                    style={{
                      padding: '8px 24px',
                      borderRadius: '8px',
                      border: 'none',
                      background: beforeAfterView === 'after' ? '#10b981' : 'transparent',
                      color: beforeAfterView === 'after' ? '#ffffff' : '#64748b',
                      fontSize: '0.82rem',
                      fontWeight: '800',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    ✨ SeramikBak ile Yenilenmiş Hali
                  </button>
                </div>
              </div>

              {/* Image & Detail Comparison Area */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '24px',
                alignItems: 'center'
              }}>
                <div style={{ height: '360px', borderRadius: '18px', overflow: 'hidden', position: 'relative', border: '1px solid #e2e8f0' }}>
                  <img
                    src={beforeAfterView === 'after' ? currentProject.afterImg : currentProject.beforeImg}
                    alt={currentProject.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'all 0.3s' }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '16px',
                    left: '16px',
                    background: beforeAfterView === 'after' ? '#10b981' : '#ef4444',
                    color: '#ffffff',
                    padding: '4px 12px',
                    borderRadius: '6px',
                    fontSize: '0.74rem',
                    fontWeight: '900'
                  }}>
                    {beforeAfterView === 'after' ? 'DÖNÜŞÜM SONRASI' : 'ÖNCEKİ HALİ'}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <span style={{ fontSize: '0.72rem', color: '#b38e47', fontWeight: '800', textTransform: 'uppercase' }}>
                    📍 {currentProject.location} &bull; {currentProject.m2}
                  </span>

                  <h3 style={{ fontSize: '1.4rem', fontWeight: '900', margin: 0, color: '#0f172a' }}>
                    {currentProject.title}
                  </h3>

                  <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '800', color: beforeAfterView === 'after' ? '#10b981' : '#ef4444', marginBottom: '4px' }}>
                      {beforeAfterView === 'after' ? '✓ Yapılan İyileştirmeler:' : '✕ Yaşanan Problemler:'}
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#334155', margin: 0, lineHeight: '1.5' }}>
                      {beforeAfterView === 'after' ? currentProject.afterDesc : currentProject.beforeDesc}
                    </p>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: '750', display: 'block', marginBottom: '6px' }}>
                      Kullanılan Karolar & Malzemeler:
                    </span>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {currentProject.tilesUsed.map((t, tIdx) => (
                        <span key={tIdx} style={{ background: '#f1f5f9', color: '#0f172a', padding: '4px 10px', borderRadius: '6px', fontSize: '0.76rem', fontWeight: '750' }}>
                          ✓ {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '8px' }}>
                    <Link
                      href="/proje-talep"
                      style={{
                        background: '#0f172a',
                        color: '#ffffff',
                        padding: '10px 20px',
                        borderRadius: '10px',
                        textDecoration: 'none',
                        fontSize: '0.82rem',
                        fontWeight: '800',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Calculator size={15} style={{ color: '#d4af37' }} />
                      <span>Benim Mekanım İçin Fiyat Al</span>
                    </Link>
                    <Link
                      href="/?tab=studio"
                      style={{
                        background: '#f1f5f9',
                        color: '#0f172a',
                        border: '1px solid #cbd5e1',
                        padding: '10px 16px',
                        borderRadius: '10px',
                        textDecoration: 'none',
                        fontSize: '0.82rem',
                        fontWeight: '750',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Sparkles size={14} />
                      <span>3D Simülasyon Yap</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ═════════════════════════════════════════════════════════════════════════
            TAB 4: MATERIAL & GROUT CALCULATOR
        ═════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'calculator' && (
          <section style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '24px',
              padding: '36px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.02)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'rgba(179, 142, 71, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b38e47' }}>
                  <Calculator size={24} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: '900', margin: 0, color: '#0f172a' }}>
                    Seramik & Derz Metraj Hesaplayıcı
                  </h2>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '2px 0 0 0' }}>
                    Zemin veya duvar ölçülerinizi girin; kaç kutu seramik ve kaç kg derz harcı gerektiğini anında öğrenin.
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '750', color: '#334155', marginBottom: '6px' }}>En (Metre)</label>
                  <input 
                    type="number" 
                    value={calcWidth} 
                    onChange={e => setCalcWidth(e.target.value)} 
                    placeholder="Örn: 4"
                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '750', color: '#334155', marginBottom: '6px' }}>Boy (Metre)</label>
                  <input 
                    type="number" 
                    value={calcLength} 
                    onChange={e => setCalcLength(e.target.value)} 
                    placeholder="Örn: 5"
                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '750', color: '#334155', marginBottom: '6px' }}>Seramik Ebat Seçimi</label>
                  <select 
                    value={calcTileSize} 
                    onChange={e => setCalcTileSize(e.target.value)}
                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', background: '#fff' }}
                  >
                    <option value="60x120">60x120 cm (Kutu: 1.44 m²)</option>
                    <option value="60x60">60x60 cm (Kutu: 1.44 m²)</option>
                    <option value="80x80">80x80 cm (Kutu: 1.28 m²)</option>
                    <option value="120x240">120x240 cm Dev Plaka (Kutu: 2.88 m²)</option>
                    <option value="30x60">30x60 cm (Kutu: 1.44 m²)</option>
                    <option value="20x120">20x120 cm Ahşap Parke (Kutu: 1.20 m²)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '750', color: '#334155', marginBottom: '6px' }}>Kesim & Fire Oranı (%)</label>
                  <select 
                    value={calcWastePercent} 
                    onChange={e => setCalcWastePercent(e.target.value)}
                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', background: '#fff' }}
                  >
                    <option value="5">%5 (Düz & Basit Döşeme)</option>
                    <option value="10">%10 (Standart Önerilen)</option>
                    <option value="15">%15 (Çapraz / Balıksırtı / Köşeli Döşeme)</option>
                  </select>
                </div>
              </div>

              <button 
                onClick={calculateMaterials}
                style={{
                  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px 28px',
                  fontWeight: '800',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 15px rgba(15, 23, 42, 0.2)'
                }}
              >
                <Calculator size={18} style={{ color: '#d4af37' }} />
                <span>Malzeme İhtiyacını Hesapla</span>
              </button>

              {/* CALCULATION RESULTS DISPLAY */}
              {calcResult && (
                <div style={{ marginTop: '30px', padding: '24px', background: '#f8fafc', borderRadius: '16px', border: '1.5px solid #d4af37' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '850', margin: '0 0 16px 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={20} style={{ color: '#10b981' }} />
                    <span>Hesaplanan İhtiyaç Özeti</span>
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                    <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Net Alan</span>
                      <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0f172a', marginTop: '4px' }}>
                        {calcResult.netArea} m²
                      </div>
                    </div>

                    <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Fire Dahil Satın Alınacak</span>
                      <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#2563eb', marginTop: '4px' }}>
                        {calcResult.totalAreaWithWaste} m²
                      </div>
                    </div>

                    <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Gereken Kutu</span>
                      <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#b38e47', marginTop: '4px' }}>
                        {calcResult.boxesNeeded} Kutu
                      </div>
                      <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Top. {calcResult.totalPurchasedM2} m²</span>
                    </div>

                    <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Tahmini Derz Dolgusu</span>
                      <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#10b981', marginTop: '4px' }}>
                        ~{calcResult.groutKgNeeded} kg
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <Link href={`/?q=${calcTileSize}`} style={{
                      background: 'linear-gradient(135deg, #b38e47 0%, #d4af37 100%)',
                      color: '#090d16',
                      textDecoration: 'none',
                      padding: '10px 20px',
                      borderRadius: '10px',
                      fontSize: '0.82rem',
                      fontWeight: '800',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <span>{calcTileSize} cm Seramik Modellerini İncele</span>
                      <ChevronRight size={16} />
                    </Link>
                    <Link href={`/proje-talep?m2=${calcResult.totalAreaWithWaste}&size=${calcTileSize}`} style={{
                      background: '#ffffff',
                      color: '#0f172a',
                      border: '1px solid #cbd5e1',
                      textDecoration: 'none',
                      padding: '10px 20px',
                      borderRadius: '10px',
                      fontSize: '0.82rem',
                      fontWeight: '750',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <span>Bayilerden Bu Metraj İçin Fiyat Teklifi İste</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ═════════════════════════════════════════════════════════════════════════
            TAB 5: EDUCATIONAL BLOG & TECHNICAL GUIDES
        ═════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'blog' && (
          <section style={{ animation: 'fadeIn 0.3s ease-out' }}>
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
                    border: '1px solid rgba(0, 0, 0, 0.06)',
                    borderRadius: '24px',
                    padding: '30px',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.02)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    transition: 'transform 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                      background: 'rgba(179, 142, 71, 0.12)',
                      color: '#8c6b30',
                      padding: '4px 12px',
                      borderRadius: '8px',
                      fontSize: '0.72rem',
                      fontWeight: '800'
                    }}>{article.category}</span>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} />
                      {article.readTime}
                    </span>
                  </div>
                  
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '850', margin: 0, lineHeight: '1.4', color: '#0f172a' }}>
                    {article.title}
                  </h3>
                  
                  <p style={{ fontSize: '0.86rem', color: '#64748b', margin: 0, lineHeight: '1.6' }}>
                    {article.summary}
                  </p>

                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.82rem',
                    fontWeight: '800',
                    color: '#b38e47',
                    marginTop: 'auto',
                    paddingTop: '12px'
                  }}>
                    <span>Detaylı Rehberi Oku</span>
                    <ChevronRight size={14} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          MOODBOARD MODAL / DRAWER (Benim İlham Panom)
      ───────────────────────────────────────────────────────────────────────────── */}
      {showMoodboardModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '780px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
            position: 'relative'
          }}>
            <div style={{
              padding: '24px 30px',
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
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '900', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Heart size={20} fill="#d4af37" color="#d4af37" />
                  <span>Benim İlham Panom ({savedGalleryItems.length} Görsel)</span>
                </h3>
                <p style={{ margin: '3px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                  Beğendiğiniz tasarım modelleri bu panoda toplanır. Mimarla paylaşabilir veya bayiden teklif alabilirsiniz.
                </p>
              </div>

              <button 
                onClick={() => setShowMoodboardModal(false)}
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
                  color: '#475569'
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '24px 30px' }}>
              {savedGalleryItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                  <Heart size={48} style={{ color: '#cbd5e1', marginBottom: '12px' }} />
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '1.1rem', color: '#0f172a', fontWeight: '800' }}>
                    Henüz İlham Panonuza Model Eklemediniz
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.84rem' }}>
                    Galerideki beğendiğiniz fotoğrafların sağ üstündeki kalp butonuna basarak bu panoya toplayabilirsiniz.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                  {savedGalleryItems.map(item => (
                    <div key={item.id} style={{ borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden', background: '#f8fafc' }}>
                      <div style={{ height: '130px', position: 'relative' }}>
                        <img src={item.img} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button
                          onClick={() => toggleSaveMoodboard(item.id)}
                          style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', width: '24px', height: '24px', borderRadius: '50%', cursor: 'pointer' }}
                        >
                          <X size={13} />
                        </button>
                      </div>
                      <div style={{ padding: '10px' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#0f172a', lineHeight: '1.2' }}>{item.title}</div>
                        <div style={{ fontSize: '0.7rem', color: '#b38e47', marginTop: '4px', fontWeight: '700' }}>{item.tileRecommendation}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {savedGalleryItems.length > 0 && (
              <div style={{
                padding: '18px 30px',
                background: '#f8fafc',
                borderTop: '1px solid #f1f5f9',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <button
                  onClick={() => {
                    setSavedIds([]);
                    localStorage.removeItem('sb_ilham_moodboard');
                  }}
                  style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.78rem', fontWeight: '750', cursor: 'pointer' }}
                >
                  Panoyu Temizle
                </button>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2500);
                    }}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      color: '#0f172a',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: '750',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {copiedLink ? <Check size={14} style={{ color: '#10b981' }} /> : <Copy size={14} />}
                    <span>{copiedLink ? 'Link Kopyalandı!' : 'Panoyu Paylaş'}</span>
                  </button>

                  <Link
                    href={`/proje-talep?notes=${encodeURIComponent(`İlham Panomdaki Modeller: ${savedGalleryItems.map(x => x.tileRecommendation).join(', ')}`)}`}
                    style={{
                      background: 'linear-gradient(135deg, #b38e47 0%, #d4af37 100%)',
                      color: '#090d16',
                      padding: '8px 18px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontSize: '0.8rem',
                      fontWeight: '850',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>Bu İlhamlarla Teklif İste</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          ARTICLE DETAIL MODAL
      ───────────────────────────────────────────────────────────────────────────── */}
      {selectedArticle && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(8px)',
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
            position: 'relative'
          }}>
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
                <span style={{ fontSize: '0.72rem', color: '#b38e47', fontWeight: '800', textTransform: 'uppercase' }}>{selectedArticle.category}</span>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '900', margin: '4px 0 0 0', color: '#0f172a' }}>{selectedArticle.title}</h2>
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
                  color: '#475569'
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div 
              style={{ padding: '32px' }}
              className="article-detail-body"
              dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
            />

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
                  fontWeight: '750',
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

      {/* ─────────────────────────────────────────────────────────────────────────────
          GLOBAL STYLES & ANIMATIONS
      ───────────────────────────────────────────────────────────────────────────── */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0% { transform: scale(0.95); opacity: 0.8; }
          50% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.8; }
        }
        .article-detail-body h3 {
          font-size: 1.18rem;
          font-weight: 850;
          margin-top: 24px;
          margin-bottom: 12px;
          color: #0f172a;
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
      `}</style>
    </main>
  );
}
