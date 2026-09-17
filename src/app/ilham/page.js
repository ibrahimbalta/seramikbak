'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Sparkles, 
  BookOpen, 
  ChevronRight, 
  X, 
  Calculator, 
  Eye, 
  Search, 
  Heart, 
  Share2, 
  Flame, 
  Newspaper, 
  Check, 
  RefreshCw,
  SlidersHorizontal,
  Maximize2
} from 'lucide-react';

// Kiosk'ta odanın ve dokunun doğru eşleşmesi için yardımcı fonksiyonlar
function getKioskProduct(item) {
  const style = item.style || 'Mermer';
  const name = item.tileRecommendation || item.title;
  let code = `SB-ILH-${item.id}`;
  let textureUrl = '/textures/calacatta_gold.jpg';
  let productId = 'kal-1';

  const lower = (name + ' ' + style + ' ' + (item.desc || '')).toLowerCase();

  if (lower.includes('ahşap') || lower.includes('ahsap') || lower.includes('wood') || lower.includes('oak') || lower.includes('meşe')) {
    textureUrl = '/textures/natural_oak.jpg';
    productId = 'vit-3';
    code = 'VIT-OAK-20120';
  } else if (lower.includes('teak') || lower.includes('ceviz')) {
    textureUrl = '/textures/teak_ahsap.jpg';
    productId = 'gra-3';
    code = 'GRA-TEAK-20120';
  } else if (lower.includes('travertin') || lower.includes('traver')) {
    textureUrl = '/textures/travertino_classico.jpg';
    productId = 'gra-4';
    code = 'GRA-TRAV-60120';
  } else if (lower.includes('loft') || (lower.includes('beton') && lower.includes('antrasit'))) {
    textureUrl = '/textures/loft_beton.jpg';
    productId = 'kut-3';
    code = 'KUT-BET-8080';
  } else if (lower.includes('beton') || lower.includes('cement') || lower.includes('çimento') || lower.includes('grej')) {
    textureUrl = '/textures/concrete_light_grey.jpg';
    productId = 'kal-3';
    code = 'KAL-BET-6060';
  } else if (lower.includes('nero') || lower.includes('marquina') || lower.includes('siyah') || lower.includes('antrasit') || lower.includes('bazalt')) {
    textureUrl = '/textures/albatros_antrasit.jpg';
    productId = 'kal-2';
    code = 'KAL-NERO-60120';
  } else if (lower.includes('taş') || lower.includes('tas') || lower.includes('bej') || lower.includes('vista') || lower.includes('kireç')) {
    textureUrl = '/textures/vista_bej.jpg';
    productId = 'vit-4';
    code = 'VIT-VIS-60120';
  } else if (lower.includes('silver') || lower.includes('white silver')) {
    textureUrl = '/textures/calacatta_gold.jpg';
    productId = 'gur-1';
    code = 'GUR-SILV-60120';
  } else {
    textureUrl = '/textures/calacatta_gold.jpg';
    productId = 'kal-1';
    code = 'KAL-CAL-60120';
  }

  const dimParts = (item.dimensions || '60x120 cm').replace(' cm', '').split('x');
  const w = parseInt(dimParts[0]) || 60;
  const h = parseInt(dimParts[1]) || 120;

  return {
    id: productId,
    name: item.tileRecommendation || item.title,
    code: code,
    width: w,
    height: h,
    style: item.style || 'Mermer',
    finish: item.finish || 'Parlak Rektifiye',
    color: item.colorNames?.[0] || 'Doğal Ton',
    imageUrl: item.img || textureUrl,
    textureUrl: textureUrl,
    unitPrice: 520,
    brand: { id: 'seramikbak', name: 'Seçkin Mimari Koleksiyon' }
  };
}

function getMappedRoom(roomStr) {
  if (!roomStr) return 'bathroom';
  const str = roomStr.toLowerCase();
  if (str.includes('mutfak')) return 'kitchen';
  if (str.includes('salon') || str.includes('yatak') || str.includes('antre') || str.includes('ofis') || str.includes('ticari')) return 'livingroom';
  if (str.includes('teras') || str.includes('bahçe') || str.includes('havuz') || str.includes('dış cephe') || str.includes('cephe')) return 'terrace';
  return 'bathroom';
}

export default function InspirationGalleryPage() {
  // Navigation Tabs: 'gallery' | 'news' | 'beforeAfter' | 'calculator' | 'blog'
  const [activeTab, setActiveTab] = useState('gallery');
  
  // Gallery Filters
  const [selectedRoomFilter, setSelectedRoomFilter] = useState('ALL');
  const [selectedStyleFilter, setSelectedStyleFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [previewItem, setPreviewItem] = useState(null);
  const [showMoodboardModal, setShowMoodboardModal] = useState(false);

  // Moodboard / Saved Items
  const [savedIds, setSavedIds] = useState([]);

  // Calculator State
  const [calcWidth, setCalcWidth] = useState('4');
  const [calcLength, setCalcLength] = useState('5');
  const [calcTileSize, setCalcTileSize] = useState('60x120');
  const [calcWastePercent, setCalcWastePercent] = useState('10');
  const [calcResult, setCalcResult] = useState(null);

  // Load Saved Moodboard from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('sb_ilham_moodboard');
      if (stored) {
        setSavedIds(JSON.parse(stored));
      }
    } catch (e) {}
  }, []);

  const toggleSaveMoodboard = (id, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setSavedIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      try {
        localStorage.setItem('sb_ilham_moodboard', JSON.stringify(next));
      } catch (err) {}
      return next;
    });
  };

  // 3D Kiosk Sayfasını Açma ve Seramik Modelini Seçili Olarak Aktarma
  const openInKiosk = (item, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const kioskProd = getKioskProduct(item);
    const room = getMappedRoom(item.room);
    try {
      sessionStorage.setItem('kiosk_selected_product', JSON.stringify(kioskProd));
      localStorage.setItem('kiosk_selected_product', JSON.stringify(kioskProd));
    } catch (err) {}

    const searchParam = encodeURIComponent(kioskProd.name);
    const styleParam = encodeURIComponent(kioskProd.style ? kioskProd.style.toLowerCase() : 'all');
    window.location.href = `/kiosk?productId=${encodeURIComponent(kioskProd.id)}&code=${encodeURIComponent(kioskProd.code)}&room=${room}&style=${styleParam}&search=${searchParam}`;
  };

  // Hesaplayıcı Formülü
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
  // 1. GENİŞ MİMARİ SERAMİK İLHAM KOLEKSİYONU
  // ─────────────────────────────────────────────────────────────────────────────
  const galleryItems = [
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
      style: 'Mermer',
      room: 'Salon & Antre',
      tag: 'Translucent Glamour',
      dimensions: '60x120 cm',
      finish: 'Kristal Parlak',
      colors: ['#D97706', '#FEF3C7', '#78350F'],
      colorNames: ['Amber Balı', 'Krem İpeği', 'Karamel'],
      img: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80',
      tileRecommendation: 'Onyx Amber High Gloss 60x120 cm'
    },
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
  ];

  // Filtrelenmiş Galeri Listesi
  const filteredGallery = useMemo(() => {
    return galleryItems.filter(item => {
      let matchRoom = true;
      if (selectedRoomFilter !== 'ALL') {
        matchRoom = item.room.toLowerCase().includes(selectedRoomFilter.toLowerCase()) ||
                    selectedRoomFilter.toLowerCase().includes(item.room.toLowerCase());
      }

      let matchStyle = true;
      if (selectedStyleFilter !== 'ALL') {
        matchStyle = item.style.toLowerCase() === selectedStyleFilter.toLowerCase();
      }

      let matchSearch = true;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        matchSearch = item.title.toLowerCase().includes(q) ||
                      item.desc.toLowerCase().includes(q) ||
                      item.style.toLowerCase().includes(q) ||
                      item.room.toLowerCase().includes(q) ||
                      (item.tileRecommendation && item.tileRecommendation.toLowerCase().includes(q));
      }

      return matchRoom && matchStyle && matchSearch;
    });
  }, [galleryItems, selectedRoomFilter, selectedStyleFilter, searchQuery]);

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', color: '#0f172a', fontFamily: 'inherit' }}>
      
      {/* ─────────────────────────────────────────────────────────────────────────────
          1. ZARİF & FERAH ÜST HEADER
      ───────────────────────────────────────────────────────────────────────────── */}
      <header style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Link
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: '#64748b',
                textDecoration: 'none',
                fontSize: '0.86rem',
                fontWeight: '650',
                padding: '6px 12px',
                borderRadius: '8px',
                background: '#f1f5f9',
                transition: 'all 0.2s'
              }}
            >
              <ArrowLeft size={16} />
              <span>Ana Sayfa</span>
            </Link>

            <div style={{ height: '18px', width: '1px', background: '#cbd5e1' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.05rem', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.02em' }}>
                SeramikBak <span style={{ color: '#b38e47', fontWeight: '800' }}>İlham</span>
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => setShowMoodboardModal(true)}
              style={{
                background: savedIds.length > 0 ? 'rgba(212, 175, 55, 0.12)' : '#ffffff',
                border: savedIds.length > 0 ? '1px solid #d4af37' : '1px solid #e2e8f0',
                color: savedIds.length > 0 ? '#997328' : '#64748b',
                padding: '7px 14px',
                borderRadius: '10px',
                fontSize: '0.82rem',
                fontWeight: '750',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <Heart size={15} fill={savedIds.length > 0 ? '#d4af37' : 'none'} color={savedIds.length > 0 ? '#d4af37' : 'currentColor'} />
              <span>İlham Panom ({savedIds.length})</span>
            </button>

            <Link
              href="/kiosk"
              style={{
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                color: '#d4af37',
                border: '1px solid rgba(212, 175, 55, 0.4)',
                padding: '7px 15px',
                borderRadius: '10px',
                textDecoration: 'none',
                fontSize: '0.82rem',
                fontWeight: '800',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            >
              <Sparkles size={15} />
              <span>3D Kiosk Stüdyo</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────────────────────
          2. FERAH HERO & MİNİMALİST SEKME MENÜSÜ
      ───────────────────────────────────────────────────────────────────────────── */}
      <section style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '36px 24px 20px 24px',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(212, 175, 55, 0.12)',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          color: '#8c6b30',
          padding: '5px 14px',
          borderRadius: '20px',
          fontSize: '0.74rem',
          fontWeight: '800',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          marginBottom: '14px'
        }}>
          <Sparkles size={13} />
          <span>Mimari Tasarım Galerisi & 3D Kiosk Deneyimi</span>
        </div>

        <h1 style={{
          fontSize: 'clamp(1.9rem, 3.8vw, 2.7rem)',
          fontWeight: '900',
          letterSpacing: '-0.03em',
          margin: '0 0 12px 0',
          color: '#0f172a',
          lineHeight: '1.2'
        }}>
          Yaşam Alanınız İçin Kusursuz Seramik Kombinasyonları
        </h1>

        <p style={{
          fontSize: '0.98rem',
          color: '#64748b',
          maxWidth: '680px',
          margin: '0 auto 24px auto',
          lineHeight: '1.55'
        }}>
          Banyo, mutfak ve salonlar için 28+ seçkin mimari projeyi inceleyin; beğendiğiniz seramik modellerini 3D Kiosk stüdyoda kendi odanızda canlı deneyin.
        </p>

        {/* Minimalist Segmented Tabs */}
        <div style={{
          display: 'inline-flex',
          background: '#ffffff',
          padding: '5px',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '4px'
        }}>
          {[
            { id: 'gallery', label: 'Tasarım İlham Galerisi', icon: Sparkles },
            { id: 'news', label: 'Sektör & Trend Raporu', icon: Newspaper },
            { id: 'beforeAfter', label: 'Öncesi / Sonrası', icon: Eye },
            { id: 'calculator', label: 'Metraj & Derz Hesapla', icon: Calculator },
            { id: 'blog', label: 'Seçim Rehberleri', icon: BookOpen }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  background: isActive ? '#0f172a' : 'transparent',
                  color: isActive ? '#d4af37' : '#64748b',
                  fontSize: '0.82rem',
                  fontWeight: isActive ? '800' : '650',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────────
          ANA İÇERİK ALANI
      ───────────────────────────────────────────────────────────────────────────── */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px 60px 24px' }}>
        
        {/* ═════════════════════════════════════════════════════════════════════════
            SEKME 1: TASARIM İLHAM GALERİSİ
        ═════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'gallery' && (
          <section>
            
            {/* SADELEŞTİRİLMİŞ TEK SATIR FİLTRE VE ARAMA PANELİ */}
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '16px 20px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
              marginBottom: '28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}>
              {/* Mekan Filtreleri */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                overflowX: 'auto',
                paddingBottom: '2px',
                scrollbarWidth: 'none'
              }}>
                <span style={{ fontSize: '0.76rem', fontWeight: '800', color: '#94a3b8', whiteSpace: 'nowrap', marginRight: '4px' }}>
                  Mekan:
                </span>
                {[
                  { id: 'ALL', label: 'Tüm Mekanlar' },
                  { id: 'Banyo & Spa', label: 'Banyo & Spa' },
                  { id: 'Mutfak & Ada', label: 'Mutfak & Ada' },
                  { id: 'Salon & Antre', label: 'Salon & Antre' },
                  { id: 'Yatak Odası & Suit', label: 'Yatak Odası' },
                  { id: 'Teras, Bahçe & Havuz', label: 'Teras & Bahçe' },
                  { id: 'Ofis, Kafe & Ticari', label: 'Ticari & Ofis' },
                  { id: 'Dış Cephe & Mimari', label: 'Dış Cephe' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedRoomFilter(tab.id)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      border: selectedRoomFilter === tab.id ? '1.5px solid #0f172a' : '1px solid #e2e8f0',
                      background: selectedRoomFilter === tab.id ? '#0f172a' : '#ffffff',
                      color: selectedRoomFilter === tab.id ? '#ffffff' : '#475569',
                      fontSize: '0.78rem',
                      fontWeight: '700',
                      whiteSpace: 'nowrap',
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Alt Satır: Stil Filtreleri ve Hızlı Arama */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                paddingTop: '12px',
                borderTop: '1px solid #f1f5f9'
              }}>
                {/* Stil Butonları */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.76rem', fontWeight: '800', color: '#94a3b8', marginRight: '4px' }}>Stil:</span>
                  {['ALL', 'Mermer', 'Beton', 'Ahşap', 'Doğal Taş', 'Terrazzo', 'Mozaik'].map(st => (
                    <button
                      key={st}
                      onClick={() => setSelectedStyleFilter(st)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: 'none',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        background: selectedStyleFilter === st ? '#b38e47' : '#f1f5f9',
                        color: selectedStyleFilter === st ? '#ffffff' : '#475569',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      {st === 'ALL' ? 'Tümü' : st}
                    </button>
                  ))}

                  {(selectedRoomFilter !== 'ALL' || selectedStyleFilter !== 'ALL' || searchQuery) && (
                    <button
                      onClick={() => {
                        setSelectedRoomFilter('ALL');
                        setSelectedStyleFilter('ALL');
                        setSearchQuery('');
                      }}
                      style={{
                        padding: '4px 8px',
                        background: 'none',
                        border: 'none',
                        color: '#ef4444',
                        fontSize: '0.72rem',
                        fontWeight: '750',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '2px',
                        marginLeft: '4px'
                      }}
                    >
                      <RefreshCw size={11} />
                      <span>Filtreleri Temizle</span>
                    </button>
                  )}
                </div>

                {/* Arama Input */}
                <div style={{ position: 'relative', width: '100%', maxWidth: '270px' }}>
                  <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Model veya stil ara..."
                    style={{
                      width: '100%',
                      padding: '7px 12px 7px 32px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.8rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* RAFİNE & KOMPAKT HAFTANIN EDİTÖR SEÇİMİ (SPOTLIGHT) */}
            {selectedRoomFilter === 'ALL' && !searchQuery && selectedStyleFilter === 'ALL' && (
              <div style={{
                background: '#0f172a',
                borderRadius: '20px',
                border: '1px solid rgba(212, 175, 55, 0.35)',
                overflow: 'hidden',
                boxShadow: '0 12px 30px rgba(15, 23, 42, 0.12)',
                marginBottom: '32px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                alignItems: 'center'
              }}>
                <div style={{ height: '280px', position: 'relative', overflow: 'hidden' }}>
                  <img
                    src="/hero/luxury_bathroom.png"
                    alt="Haftanın İlhamı - Lüks Calacatta Camsı Banyo"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '16px',
                    left: '16px',
                    background: '#d4af37',
                    color: '#090d16',
                    padding: '4px 12px',
                    borderRadius: '6px',
                    fontSize: '0.7rem',
                    fontWeight: '900',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase'
                  }}>
                    Haftanın Seçimi
                  </div>
                </div>

                <div style={{ padding: '28px', color: '#ffffff', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#d4af37', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    2026 İTALYAN CALACATTA TRENDİ
                  </div>
                  <h2 style={{ fontSize: '1.45rem', fontWeight: '900', margin: 0, lineHeight: '1.25' }}>
                    Camsı Beyaz Calacatta & Pirinç Armatür Banyo
                  </h2>
                  <p style={{ fontSize: '0.84rem', color: '#94a3b8', margin: 0, lineHeight: '1.5' }}>
                    60x120 cm rektifiyeli tam parlak porselen karolar ile dikişsiz ayna ferahlığı ve fırçalanmış pirinç armatür zarafeti.
                  </p>

                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'rgba(255,255,255,0.06)',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.12)',
                    fontSize: '0.76rem',
                    width: 'fit-content'
                  }}>
                    <span style={{ color: '#94a3b8' }}>Önerilen Model:</span>
                    <strong style={{ color: '#d4af37' }}>Calacatta Gold 60x120 cm</strong>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '6px' }}>
                    <button
                      onClick={(e) => openInKiosk(galleryItems[0], e)}
                      style={{
                        background: 'linear-gradient(135deg, #b38e47 0%, #d4af37 100%)',
                        color: '#090d16',
                        padding: '9px 18px',
                        borderRadius: '8px',
                        border: 'none',
                        fontSize: '0.82rem',
                        fontWeight: '850',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 14px rgba(212,175,55,0.35)'
                      }}
                    >
                      <Sparkles size={15} />
                      <span>3D Kioskta Canlı Gör</span>
                    </button>

                    <Link
                      href="/proje-talep?style=Mermer&product=Calacatta"
                      style={{
                        background: 'rgba(255,255,255,0.08)',
                        color: '#ffffff',
                        border: '1px solid rgba(255,255,255,0.18)',
                        padding: '9px 16px',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontSize: '0.82rem',
                        fontWeight: '750',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>Fiyat Teklifi Al</span>
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* MİMARİ İLHAM KARTLARI IZGARASI */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '24px'
            }}>
              {filteredGallery.map(item => {
                const isSaved = savedIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    style={{
                      background: '#ffffff',
                      borderRadius: '16px',
                      border: '1px solid #e2e8f0',
                      overflow: 'hidden',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s, box-shadow 0.2s'
                    }}
                  >
                    {/* Görsel Alanı */}
                    <div 
                      style={{ position: 'relative', height: '220px', overflow: 'hidden', cursor: 'pointer', background: '#e2e8f0' }}
                      onClick={() => setPreviewItem(item)}
                    >
                      <img
                        src={item.img}
                        alt={item.title}
                        loading="lazy"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                      />

                      {/* Etiket */}
                      <div style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        background: 'rgba(15, 23, 42, 0.75)',
                        backdropFilter: 'blur(8px)',
                        color: '#ffffff',
                        padding: '3px 10px',
                        borderRadius: '6px',
                        fontSize: '0.7rem',
                        fontWeight: '800'
                      }}>
                        {item.tag}
                      </div>

                      {/* Kalp / Favori Butonu */}
                      <button
                        type="button"
                        onClick={(e) => toggleSaveMoodboard(item.id, e)}
                        style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: 'rgba(255,255,255,0.9)',
                          backdropFilter: 'blur(4px)',
                          border: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          color: isSaved ? '#e11d48' : '#64748b'
                        }}
                      >
                        <Heart size={15} fill={isSaved ? '#e11d48' : 'none'} />
                      </button>

                      {/* Boyut ve Bitiş */}
                      <div style={{
                        position: 'absolute',
                        bottom: '10px',
                        left: '12px',
                        background: 'rgba(0,0,0,0.65)',
                        backdropFilter: 'blur(4px)',
                        color: '#f8fafc',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.68rem',
                        fontWeight: '750'
                      }}>
                        {item.style} &bull; {item.dimensions}
                      </div>
                    </div>

                    {/* Kart Gövdesi */}
                    <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: '850', margin: 0, color: '#0f172a', lineHeight: '1.35' }}>
                        {item.title}
                      </h3>

                      <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0, lineHeight: '1.45', flexGrow: 1 }}>
                        {item.desc}
                      </p>

                      {/* Renk Paleti */}
                      {item.colors && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                          <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: '700' }}>Renkler:</span>
                          <div style={{ display: 'flex', gap: '3px' }}>
                            {item.colors.map((c, idx) => (
                              <span
                                key={idx}
                                title={item.colorNames?.[idx] || c}
                                style={{
                                  width: '14px',
                                  height: '14px',
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

                      {/* Önerilen Model */}
                      {item.tileRecommendation && (
                        <div style={{
                          background: '#f8fafc',
                          padding: '6px 10px',
                          borderRadius: '8px',
                          border: '1px solid #f1f5f9',
                          fontSize: '0.74rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginTop: '2px'
                        }}>
                          <span style={{ color: '#64748b' }}>Öneri:</span>
                          <strong style={{ color: '#0f172a' }}>{item.tileRecommendation}</strong>
                        </div>
                      )}

                      {/* Aksiyon Butonları */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px',
                        paddingTop: '12px',
                        marginTop: '4px',
                        borderTop: '1px solid #f1f5f9'
                      }}>
                        {/* 3D Kiosk'ta Aç Butonu */}
                        <button
                          type="button"
                          onClick={(e) => openInKiosk(item, e)}
                          style={{
                            background: '#0f172a',
                            color: '#ffffff',
                            padding: '7px 13px',
                            borderRadius: '8px',
                            border: 'none',
                            fontSize: '0.78rem',
                            fontWeight: '800',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          <Sparkles size={13} style={{ color: '#d4af37' }} />
                          <span>3D Kioskta Gör</span>
                        </button>

                        <Link
                          href={`/proje-talep?style=${encodeURIComponent(item.style)}&room=${encodeURIComponent(item.room)}`}
                          style={{
                            background: 'rgba(212, 175, 55, 0.12)',
                            color: '#8c6b30',
                            border: '1px solid rgba(212, 175, 55, 0.3)',
                            padding: '7px 11px',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            fontSize: '0.76rem',
                            fontWeight: '800',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <span>Fiyat İste</span>
                          <ChevronRight size={13} />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredGallery.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                marginTop: '20px'
              }}>
                <Search size={32} style={{ color: '#94a3b8', margin: '0 auto 12px auto' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>Aradığınız kriterlere uygun model bulunamadı</h3>
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Filtreleri sıfırlayarak tüm 28+ mimari ilham projesini inceleyebilirsiniz.</p>
                <button
                  onClick={() => {
                    setSelectedRoomFilter('ALL');
                    setSelectedStyleFilter('ALL');
                    setSearchQuery('');
                  }}
                  style={{
                    marginTop: '10px',
                    padding: '8px 16px',
                    background: '#0f172a',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: '750',
                    cursor: 'pointer'
                  }}
                >
                  Tüm Modelleri Göster
                </button>
              </div>
            )}
          </section>
        )}

        {/* ═════════════════════════════════════════════════════════════════════════
            SEKME 2: SEKTÖR & TREND RAPORU
        ═════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'news' && (
          <section>
            <div style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '24px',
              border: '1px solid #e2e8f0',
              marginBottom: '28px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
                  <Flame size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: '900', margin: 0, color: '#0f172a' }}>
                    Seramiğin Gündemi & Trend Raporu
                  </h2>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
                    Cersaie Bologna, UNICERA ve iç mimarlık dünyasından en son ebat, hammadde ve renk analizleri.
                  </p>
                </div>
              </div>

              {/* İstatistik Kutuları */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '14px'
              }}>
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>En Popüler Ebat</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#0f172a', margin: '4px 0' }}>60x120 cm (%48 Pay)</div>
                  <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: '750' }}>Kesintisiz derzsiz zemin standardı</div>
                </div>

                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Yükselen Trend</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#b38e47', margin: '4px 0' }}>Sıcak Traverten & Bej</div>
                  <div style={{ fontSize: '0.72rem', color: '#b38e47', fontWeight: '750' }}>Soğuk griye kıyasla +%72 talep</div>
                </div>

                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Dış Mekan İnovasyonu</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#2563eb', margin: '4px 0' }}>2 cm Kalın Porselen</div>
                  <div style={{ fontSize: '0.72rem', color: '#2563eb', fontWeight: '750' }}>Harçsız çim & yükseltilmiş döşeme</div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ═════════════════════════════════════════════════════════════════════════
            SEKME 3: ÖNCESİ / SONRASI
        ═════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'beforeAfter' && (
          <section>
            <div style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '24px',
              border: '1px solid #e2e8f0',
              marginBottom: '28px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
                  <Eye size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: '900', margin: 0, color: '#0f172a' }}>
                    Gerçek Proje Dönüşümleri (Öncesi / Sonrası)
                  </h2>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
                    Eski seramiklerin modern 60x120 ve derzsiz porselen karolarla yenilenme farkı.
                  </p>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '20px'
              }}>
                <div style={{ borderRadius: '14px', overflow: 'hidden', border: '1px solid #e2e8f0', position: 'relative' }}>
                  <img src="/hero/luxury_bathroom.png" alt="Banyo Yenileme" style={{ width: '100%', height: '240px', objectFit: 'cover' }} />
                  <div style={{ padding: '14px', background: '#ffffff' }}>
                    <div style={{ fontWeight: '850', color: '#0f172a' }}>30 Yıllık Banyonun Calacatta Dönüşümü</div>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0 10px 0' }}>Eski sararmış 20x20 fayanslar yerine kesintisiz 60x120 Calacatta Lappato uygulandı.</p>
                    <button
                      onClick={(e) => openInKiosk(galleryItems[0], e)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        background: '#0f172a',
                        color: '#d4af37',
                        border: 'none',
                        fontSize: '0.76rem',
                        fontWeight: '800',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Sparkles size={12} />
                      <span>3D Kioskta Canlı Gör</span>
                    </button>
                  </div>
                </div>

                <div style={{ borderRadius: '14px', overflow: 'hidden', border: '1px solid #e2e8f0', position: 'relative' }}>
                  <img src="/hero/scandinavian_kitchen.png" alt="Mutfak Yenileme" style={{ width: '100%', height: '240px', objectFit: 'cover' }} />
                  <div style={{ padding: '14px', background: '#ffffff' }}>
                    <div style={{ fontWeight: '850', color: '#0f172a' }}>Karanlık Mutfaktan İskandinav Ferahlığına</div>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0 10px 0' }}>Suya dayanıksız laminat parke yerine 20x120 Meşe Porselen Parke kaplandı.</p>
                    <button
                      onClick={(e) => openInKiosk(galleryItems[6], e)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        background: '#0f172a',
                        color: '#d4af37',
                        border: 'none',
                        fontSize: '0.76rem',
                        fontWeight: '800',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Sparkles size={12} />
                      <span>3D Kioskta Canlı Gör</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ═════════════════════════════════════════════════════════════════════════
            SEKME 4: METRAJ & DERZ HESAPLAYICI
        ═════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'calculator' && (
          <section>
            <div style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '28px',
              border: '1px solid #e2e8f0',
              maxWidth: '720px',
              margin: '0 auto'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(212, 175, 55, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b38e47' }}>
                  <Calculator size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: '900', margin: 0, color: '#0f172a' }}>
                    Akıllı Karo Kutu & Derz Hesaplayıcı
                  </h2>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
                    Oda ölçülerinizi girin, gereken paket sayısını ve derz dolgusunu anında hesaplayın.
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px' }}>
                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: '750', color: '#64748b', display: 'block', marginBottom: '4px' }}>Genişlik (Metre):</label>
                  <input
                    type="number"
                    value={calcWidth}
                    onChange={(e) => setCalcWidth(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: '750', color: '#64748b', display: 'block', marginBottom: '4px' }}>Uzunluk (Metre):</label>
                  <input
                    type="number"
                    value={calcLength}
                    onChange={(e) => setCalcLength(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: '750', color: '#64748b', display: 'block', marginBottom: '4px' }}>Karo Ebatı:</label>
                  <select
                    value={calcTileSize}
                    onChange={(e) => setCalcTileSize(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', background: '#ffffff' }}
                  >
                    <option value="60x120">60x120 cm (1.44 m²/kutu)</option>
                    <option value="60x60">60x60 cm (1.44 m²/kutu)</option>
                    <option value="80x80">80x80 cm (1.28 m²/kutu)</option>
                    <option value="20x120">20x120 cm (1.20 m²/kutu)</option>
                  </select>
                </div>
              </div>

              <button
                onClick={calculateMaterials}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '10px',
                  background: '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: '800',
                  cursor: 'pointer'
                }}
              >
                Hesapla
              </button>

              {calcResult && (
                <div style={{ marginTop: '20px', padding: '16px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '700' }}>Net Alan</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0f172a' }}>{calcResult.netArea} m²</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '750' }}>Fire Dahil (%10)</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: '900', color: '#b38e47' }}>{calcResult.totalAreaWithWaste} m²</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '750' }}>Gereken Kutu</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: '900', color: '#10b981' }}>{calcResult.boxesNeeded} Kutu</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '750' }}>Derz Dolgusu</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: '900', color: '#2563eb' }}>~{calcResult.groutKgNeeded} kg</div>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ═════════════════════════════════════════════════════════════════════════
            SEKME 5: SEÇİM REHBERLERİ
        ═════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'blog' && (
          <section>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px'
            }}>
              {[
                { title: '60x120 Seramik Döşeme Rehberi', desc: 'Büyük format porselen karolarda klips ve derz artı kullanımının püf noktaları.', tag: 'Uygulama' },
                { title: 'R10 ve R11 Kaymazlık Değerleri Ne Anlama Gelir?', desc: 'Banyo ıslak hacimleri ve teraslar için doğru kaymazlık sınıfı seçimi.', tag: 'Teknik Bilgi' },
                { title: 'Lappato vs Mat: Hangi Bitiş Tercih Edilmeli?', desc: 'Işık yansıması, temizlik kolaylığı ve leke tutmazlık karşılaştırması.', tag: 'Tasarım' }
              ].map((art, idx) => (
                <div key={idx} style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#b38e47', textTransform: 'uppercase' }}>{art.tag}</span>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '850', color: '#0f172a', margin: 0 }}>{art.title}</h3>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0, lineHeight: '1.45' }}>{art.desc}</p>
                </div>
              ))}
            </div>
          </section>
        )}

      </main>

      {/* ─────────────────────────────────────────────────────────────────────────────
          HIZLI ÖNİZLEME MODALI (QUICK VIEW)
      ───────────────────────────────────────────────────────────────────────────── */}
      {previewItem && (
        <div 
          onClick={() => setPreviewItem(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              maxWidth: '740px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
              position: 'relative'
            }}
          >
            <button
              onClick={() => setPreviewItem(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(0,0,0,0.6)',
                color: '#ffffff',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 10
              }}
            >
              <X size={18} />
            </button>

            <div style={{ height: '360px', width: '100%', overflow: 'hidden', position: 'relative' }}>
              <img src={previewItem.img} alt={previewItem.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{
                position: 'absolute',
                bottom: '16px',
                left: '16px',
                background: 'rgba(15, 23, 42, 0.85)',
                color: '#d4af37',
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '0.74rem',
                fontWeight: '800'
              }}>
                {previewItem.style} &bull; {previewItem.dimensions}
              </div>
            </div>

            <div style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: '900', color: '#0f172a', margin: '0 0 8px 0' }}>
                {previewItem.title}
              </h2>
              <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: '1.5', margin: '0 0 16px 0' }}>
                {previewItem.desc}
              </p>

              <div style={{
                background: '#f8fafc',
                padding: '14px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '10px',
                marginBottom: '20px'
              }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700' }}>Önerilen Seramik Modeli:</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: '900', color: '#0f172a' }}>{previewItem.tileRecommendation}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700' }}>Yüzey Bitişi:</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: '850', color: '#b38e47' }}>{previewItem.finish}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {/* 3D Kioskta Aç */}
                <button
                  type="button"
                  onClick={(e) => {
                    setPreviewItem(null);
                    openInKiosk(previewItem, e);
                  }}
                  style={{
                    flex: 1,
                    minWidth: '200px',
                    padding: '12px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                    color: '#d4af37',
                    border: '1px solid rgba(212, 175, 55, 0.4)',
                    fontSize: '0.88rem',
                    fontWeight: '850',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <Sparkles size={16} />
                  <span>Bu Modeli 3D Kioskta Canlı İncele</span>
                </button>

                <Link
                  href={`/proje-talep?style=${encodeURIComponent(previewItem.style)}&room=${encodeURIComponent(previewItem.room)}`}
                  style={{
                    padding: '12px 20px',
                    borderRadius: '10px',
                    background: 'rgba(212, 175, 55, 0.12)',
                    color: '#8c6b30',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    fontSize: '0.88rem',
                    fontWeight: '800',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  Fiyat Teklifi Al
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          İLHAM PANOM MODALI (MOODBOARD)
      ───────────────────────────────────────────────────────────────────────────── */}
      {showMoodboardModal && (
        <div 
          onClick={() => setShowMoodboardModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '85vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
              padding: '24px',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Heart size={20} fill="#e11d48" color="#e11d48" />
                <h2 style={{ fontSize: '1.25rem', fontWeight: '900', margin: 0, color: '#0f172a' }}>
                  Kaydettiğiniz İlham Modelleri ({savedIds.length})
                </h2>
              </div>
              <button
                onClick={() => setShowMoodboardModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            {savedIds.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                <Heart size={36} style={{ color: '#cbd5e1', margin: '0 auto 10px auto' }} />
                <p>Henüz favorilere model eklemediniz. Kartların üzerindeki kalp ikonuna tıklayarak beğendiğiniz seramikleri buraya kaydedebilirsiniz.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '14px' }}>
                {galleryItems.filter(x => savedIds.includes(x.id)).map(item => (
                  <div key={item.id} style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                    <img src={item.img} alt={item.title} style={{ width: '100%', height: '110px', objectFit: 'cover' }} />
                    <div style={{ padding: '8px' }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</div>
                      <button
                        onClick={(e) => {
                          setShowMoodboardModal(false);
                          openInKiosk(item, e);
                        }}
                        style={{
                          marginTop: '6px',
                          width: '100%',
                          padding: '4px',
                          borderRadius: '6px',
                          background: '#0f172a',
                          color: '#d4af37',
                          border: 'none',
                          fontSize: '0.7rem',
                          fontWeight: '800',
                          cursor: 'pointer'
                        }}
                      >
                        3D Kioskta Aç
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
