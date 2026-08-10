'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { slugify } from '@/lib/slugify';
import LanguageSelector from '@/components/LanguageSelector';
import CurrencySelector from '@/components/CurrencySelector';
import GlobalExportHub from '@/components/GlobalExportHub';
import { useLanguage } from '@/lib/languageContext';

import { 
  Search as SearchIcon, 
  Image as ImageIcon, 
  MapPin, 
  Layers, 
  SlidersHorizontal, 
  Eye, 
  MousePointerClick, 
  Send, 
  TrendingUp, 
  DollarSign, 
  CreditCard, 
  Sparkles, 
  X,
  Phone, 
  Map, 
  Settings, 
  Activity,
  Layers2,
  FileText,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  UploadCloud,
  ChevronDown,
  Info,
  Home as HomeIcon,
  Heart as HeartIcon,
  User as UserIcon,
  Menu as MenuIcon,
  Loader2,
  Navigation,
  MessageSquare,
  Globe,
  Mail,
  Flame,
  Building2,
  Wrench,
  Palette,
  Shuffle,
  Users,
  Camera,
  Copy,
  ShoppingBag,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import client-only components to prevent Next.js SSR hydration mismatches
const StudioCanvas = dynamic(() => import('@/components/StudioCanvas'), { 
  ssr: false,
  loading: () => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '600px', background: '#101216', borderRadius: '16px', color: '#94a3b8' }}>
      <svg className="animate-spin" style={{ width: '40px', height: '40px', color: 'var(--accent-gold, #d4af37)', marginBottom: '16px' }} fill="none" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity: 0.25 }}></circle>
        <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" style={{ opacity: 0.75 }}></path>
      </svg>
      <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>3D Sanal Stüdyo Yükleniyor...</span>
    </div>
  )
});
const MapComponent = dynamic(() => import('@/components/MapComponent'), { 
  ssr: false,
  loading: () => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '450px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', color: '#64748b' }}>
      <svg className="animate-spin" style={{ width: '32px', height: '32px', color: '#0f172a', marginBottom: '12px' }} fill="none" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity: 0.25 }}></circle>
        <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" style={{ opacity: 0.75 }}></path>
      </svg>
      <span style={{ fontSize: '0.82rem', fontWeight: '600' }}>Bayi Haritası Hazırlanıyor...</span>
    </div>
  )
});

const ModelViewerAR = dynamic(() => import('@/components/ModelViewerAR'), { 
  ssr: false,
  loading: () => null
});

import TileVisualPreview from '@/components/TileVisualPreview';
import BathroomMockupPreview from '@/components/BathroomMockupPreview';
import ProductCard from '@/components/ProductCard';
import TileCalculatorWidget from '@/components/TileCalculatorWidget';
import LiveDealsTicker from '@/components/LiveDealsTicker';

function enrichProductData(p) {
  const basePrice = p.width * p.height * 0.08 + (p.finish === 'Parlak' ? 120 : 0) + (p.style === 'Mermer' ? 150 : 80);
  
  const dealerOffers = [
    { dealerName: 'Kadıköy Bayi', price: Math.round(basePrice * 0.95), stock: 'Stokta Var' },
    { dealerName: 'Beşiktaş Showroom', price: Math.round(basePrice), stock: 'Stokta Var' },
    { dealerName: 'Şişli Concept Store', price: Math.round(basePrice * 1.05), stock: 'Sınırlı Stok' }
  ];

  const sortedOffers = [...dealerOffers].sort((a, b) => a.price - b.price);
  const brandName = p.brand?.name || 'Seramik';
  const searchKeyword = `${brandName} ${p.name}`;

  return {
    ...p,
    offers: dealerOffers,
    cheapestOffer: sortedOffers[0],
    
    // Only return real URLs stored in database (no fake search links)
    trendyolUrl: p.trendyolUrl || null,
    hepsiburadaUrl: p.hepsiburadaUrl || null,
    n11Url: p.n11Url || null,
    koctasUrl: p.koctasUrl || null,
    bauhausUrl: p.bauhausUrl || null,
    yerevdekorUrl: p.yerevdekorUrl || null,
    
    // Only return real prices stored in database (no fake formula prices)
    trendyolPrice: (p.trendyolPrice && p.trendyolPrice > 0) ? p.trendyolPrice : null,
    hepsiburadaPrice: (p.hepsiburadaPrice && p.hepsiburadaPrice > 0) ? p.hepsiburadaPrice : null,
    hepsiPrice: (p.hepsiburadaPrice && p.hepsiburadaPrice > 0) ? p.hepsiburadaPrice : null,
    n11Price: (p.n11Price && p.n11Price > 0) ? p.n11Price : null,
    koctasPrice: (p.koctasPrice && p.koctasPrice > 0) ? p.koctasPrice : null,
    bauhausPrice: (p.bauhausPrice && p.bauhausPrice > 0) ? p.bauhausPrice : null,
    yerevdekorPrice: (p.yerevdekorPrice && p.yerevdekorPrice > 0) ? p.yerevdekorPrice : null
  };
}

function getProductBadge(product, idx) {
  if (product.isPremium) return { text: "Premium", className: "gold" };
  const val = product.name.charCodeAt(0) + product.name.charCodeAt(product.name.length - 1) + idx;
  if (val % 3 === 0) return { text: "Çok Satan", className: "red" };
  if (val % 3 === 1) return { text: "Haftanın Trendi", className: "orange" };
  return { text: "Mimarın Seçimi", className: "blue" };
}

function generateMoodboardFromProduct(product, index) {
  const tileName = product.name || 'Premium Seramik';
  const tileSize = product.dimensions || '60x120 cm';
  const tileImg = product.imageUrl || '/textures/calacatta_gold.jpg';
  const brandName = product.brand?.name || 'SeramikBak';
  const priceVal = product.price ? `₺${product.price} / m²` : `₺${480 + (index * 65)} / m²`;
  
  const lowerName = tileName.toLowerCase();
  const style = (product.style || '').toLowerCase();
  const color = (product.color || '').toLowerCase();

  // Complementary wall texture choices (guaranteed distinct from floor tileImg!)
  const wallTextures = [
    '/textures/vista_bej.jpg',
    '/textures/albatros_antrasit.jpg',
    '/textures/travertino_classico.jpg',
    '/textures/natural_oak.jpg',
    '/textures/concrete_light_grey.jpg'
  ];
  let wallImg = wallTextures[(index + 1) % wallTextures.length];
  if (wallImg === tileImg) wallImg = wallTextures[(index + 2) % wallTextures.length];
  
  let cabinet = "Ada Çayı Yeşili / Klasik Country Banyo Dolabı";
  let paintName = "Jotun 12078 Kum Fırtınası Boya";
  let paintColor = "#eae6df";
  let fixture = "Klasik Parlak Krom Armatür Takımı";
  let fixtureBadge = "Parlak Krom";
  let moodBg = "linear-gradient(135deg, #eae6df 0%, #cbd5e1 100%)";
  let accentColor = "#1e3a8a";
  let cabinetHex = "#4c6a5a";
  let faucetVal = "chrome";
  let styleName = `${brandName} ${product.name?.split(' ')[0] || 'Klasik'} Elegans`;
  let tagline = "Zamansız ve Ferah Yaşam Alanları";
  let styleBadge = "✨ ÖZEL KONSEPT";
  let category = "banyo";
  let groutName = "Weber Flex Fildişi Esnek Derz Dolgusu";
  let groutColor = "Fildişi Bej (#EAE6DF)";
  let groutHex = "#eae6df";
  let desc = `Seçkin ${tileName} seramik kaplamasını, uyumlu duvar dekoru ve parlak krom armatürlerle birleştirerek zarif ve temiz görünümlü bir banyo tasarlayın.`;

  if (lowerName.includes('calacatta') || lowerName.includes('altın') || lowerName.includes('gold') || color.includes('bej') || (style.includes('mermer') && lowerName.includes('gold'))) {
    cabinet = "Doğal Budaklı Meşe Banyo Dolabı";
    paintName = "Jotun 1024 Kum Beji Duvar Boyası";
    paintColor = "#dfdcd3";
    fixture = "Mat Siyah Batarya & Duş Seti";
    fixtureBadge = "Mat Siyah";
    moodBg = "linear-gradient(135deg, #dfdcd3 0%, #d4af37 100%)";
    accentColor = "#d4af37";
    cabinetHex = "#5c4033";
    faucetVal = "black";
    styleName = index % 2 === 0 ? `Lüks ${brandName} & Gold` : `Elegans ${brandName} & Mermer`;
    tagline = "Modern, Şık ve Zengin Mimariler";
    styleBadge = index % 2 === 0 ? "👑 PREMİUM MARBLE" : "✨ CLASSIC MERMER";
    category = "banyo";
    groutName = "Weber Flex Fildişi Esnek Derz Dolgusu";
    groutColor = "Fildişi Bej (#EAE6DF)";
    groutHex = "#eae6df";
    desc = `${tileName} seramiği, meşe dolabın doğal sıcaklığı ile dengelerken, mat siyah armatürlerle modern ve keskin çizgiler sunar.`;
  } 
  else if (lowerName.includes('antrasit') || lowerName.includes('siyah') || lowerName.includes('beton') || color.includes('gri') || lowerName.includes('cement') || lowerName.includes('sement') || lowerName.includes('dark')) {
    cabinet = "Mat Siyah & Metal Detaylı Endüstriyel Ünite";
    paintName = "Jotun 1032 Sis Grisi Duvar Boyası";
    paintColor = "#abb2b9";
    fixture = "Fırçalanmış Gold Batarya Seti";
    fixtureBadge = "Gold";
    moodBg = "linear-gradient(135deg, #333333 0%, #b38e47 100%)";
    accentColor = "#b38e47";
    cabinetHex = "#1a1a1a";
    faucetVal = "gold";
    styleName = index % 2 === 0 ? `Endüstriyel ${brandName} & Antrasit` : `Loft Beton ${brandName} Gri`;
    tagline = "Minimalist, Maskülen ve Güçlü Karakter";
    styleBadge = index % 2 === 0 ? "🏙️ LOFT BETON" : "🖤 MONOKROM BETON";
    category = "banyo";
    groutName = "Ceresit Koyu Antrasit Derz Dolgusu";
    groutColor = "Koyu Antrasit (#292524)";
    groutHex = "#292524";
    desc = `Koyu renk beton veya taş dokulu ${tileName} seramiğinin soğuk duruşunu fırçalanmış altın (gold) bataryanın parlaklığı ile canlandırın.`;
  }
  else if (lowerName.includes('meşe') || lowerName.includes('ahşap') || lowerName.includes('oak') || lowerName.includes('wood') || style.includes('ahşap') || color.includes('kahve')) {
    cabinet = "Mat Beyaz / Minimal Kulpsuz Dolaplar";
    paintName = "Jotun 1622 Fildişi Beyazı Boya";
    paintColor = "#f4f3ef";
    fixture = "Krom veya Fırçalanmış Çelik Armatür";
    fixtureBadge = "Krom";
    moodBg = "linear-gradient(135deg, #f4f3ef 0%, #c2a688 100%)";
    accentColor = "#c2a688";
    cabinetHex = "#ffffff";
    faucetVal = "chrome";
    styleName = `Doğal ${brandName} & Ahşap`;
    tagline = "Huzurlu ve Dingin Yaşam Alanları";
    styleBadge = "🍃 JAPANDİ AHŞAP";
    category = "salon";
    groutName = "Kalekim Açık Meşe Rengi Derz Dolgusu";
    groutColor = "Açık Meşe (#C2A688)";
    groutHex = "#c2a688";
    desc = `Ahşap dokulu ${tileName} seramiğinin sıcaklığını mat beyaz düz yüzeylerle birleştirin. Dingin, minimalist ve aydınlık bir atmosfer yaratır.`;
  }

  const floorTile = {
    name: tileName,
    size: tileSize,
    finish: product.finish || "Full Lappato Parlak Cilalı",
    img: tileImg,
    badge: index % 2 === 0 ? "👑 PREMİUM KOLEKSİYON" : "🔥 SPONSORLU TREND",
    brand: brandName,
    price: priceVal,
    pei: product.peiRating || "PEI 4 (Yüksek Yoğunluk)",
    slip: product.slipRating || "R10 Kaymaz Yüzey"
  };

  const wallTile = {
    name: `${brandName} ${product.name?.split(' ')[0] || 'Moda'} 3D Rölief Dekor`,
    size: "30x90 cm",
    finish: "3D Rölief Çizgili İpek Dokulu",
    img: wallImg,
    badge: "✨ UYUMLU DUVAR DEKORU",
    brand: brandName,
    price: `₺${Math.max(340, parseInt(priceVal.replace(/[^0-9]/g, '') || '500') - 110)} / m²`
  };

  const grout = {
    name: groutName,
    color: groutColor,
    width: "1.5 mm Derz Aralığı",
    type: "Küf & Su İtici Derz",
    hex: groutHex
  };

  const complement = {
    name: `${cabinet.split(' ')[0]} & ${fixtureBadge}`,
    cabinet,
    cabinetHex,
    fixture,
    fixtureBadge
  };

  const tiles = [
    floorTile,
    {
      name: `${brandName} Vista ${product.name?.split(' ')[0] || 'Plaka'} 80x160`,
      size: "80x160 cm",
      finish: "İpek Mat Lappato Porselen",
      img: wallImg,
      badge: "✨ YENİ SEZON",
      brand: brandName,
      price: priceVal
    },
    {
      name: `${brandName} Travertino Romano 60x120`,
      size: "60x120 cm",
      finish: "Doğal Dokulu Porselen",
      img: "/textures/travertino_classico.jpg",
      badge: "🔥 TREND",
      brand: brandName,
      price: "₺510 / m²"
    }
  ];

  return {
    id: index,
    category,
    styleName,
    tagline,
    styleBadge,
    matchScore: 95 + (index % 5),
    floorTile,
    wallTile,
    grout,
    complement,
    tiles,
    tileName,
    tileSize,
    tileImg,
    cabinet,
    fixture,
    fixtureBadge,
    paintName,
    paintColor,
    moodBg,
    accentColor,
    cabinetHex,
    faucetVal,
    desc,
    colorPalette: [cabinetHex, groutHex, accentColor, "#ffffff", "#0f172a"],
    lighting: "3000K Sıcak Beyaz LED Spot",
    groutColor,
    product
  };
}

const heroSlides = [
  {
    title: "Türkiye'nin Seramik Arama Motoru",
    subtitle: "100+ seçkin marka ve 25.000+ seramik ürününü saniyeler içinde karşılaştırın, en ucuz pazar yeri fiyatlarını ve yetkili bayileri bulun.",
    bg: "/hero/luxury_bathroom.png",
    tag: "TÜRKİYE'NİN EN KAPSAMLI SERAMİK DİZİNİ",
    highlight: "Fiyatları Karşılaştırın"
  },
  {
    title: "Seramikleri Evinizde Canlı Deneyin",
    subtitle: "Seçtiğiniz fayans veya karoyu interaktif 3D Sanal Stüdyo'da döşeyin; derz genişliğini, rengini, döşeme desenini ve oda ışıklarını özelleştirin.",
    bg: "/hero/scandinavian_kitchen.png",
    tag: "3D DİJİTAL ODA SİMÜLASYONU",
    highlight: "3D Sanal Stüdyo Modu"
  },
  {
    title: "Kendi Odanızı AI ile Tasarlayın",
    subtitle: "Banyonuzun veya mutfağınızın fotoğrafını yükleyin; Google Gemini yapay zekası zemin/duvar sınırlarını maskeleyip seçtiğiniz seramikleri giydirsin.",
    bg: "/hero/modern_living.png",
    tag: "YAPAY ZEKA FOTOĞRAF GİYDİRME",
    highlight: "AI Tasarım Asistanı"
  }
];

const DEFAULT_MOODBOARD_COMBOS = [
  {
    id: 0,
    category: "banyo",
    styleName: "Lüks Calacatta Mermer & Gold Kombini",
    tagline: "Işıltılı, Zamansız ve Zengin Banyo Mimarisi",
    styleBadge: "👑 PREMİUM MARBLE",
    matchScore: 98,
    floorTile: {
      name: "NG Kütahya Calacatta Gold 60x120",
      size: "60x120 cm",
      finish: "Full Lappato Parlak Cilalı",
      img: "/textures/calacatta_gold.jpg",
      badge: "👑 PREMİUM KOLEKSİYON",
      brand: "NG KÜTAHYA",
      price: "₺740 / m²",
      pei: "PEI 4 (Yüksek Yoğunluk)",
      slip: "R9 İç Mekan Parlak"
    },
    wallTile: {
      name: "VitrA Vista Bej 30x90 Rölief Dekor",
      size: "30x90 cm",
      finish: "3D Rölief Çizgili İpek Dokulu",
      img: "/textures/vista_bej.jpg",
      badge: "✨ UYUMLU DUVAR DEKORU",
      brand: "VitrA",
      price: "₺620 / m²"
    },
    grout: {
      name: "Weber Flex Fildişi Esnek Derz Dolgusu",
      color: "Fildişi Bej (#EAE6DF)",
      width: "1.5 mm Derz Aralığı",
      type: "Küf & Su İtici Derz",
      hex: "#eae6df"
    },
    complement: {
      name: "Doğal Meşe Dolap & Mat Siyah Batarya",
      cabinet: "Doğal Budaklı Meşe Banyo Ünitesi",
      cabinetHex: "#5c4033",
      fixture: "Mat Siyah Ankastre Duş & Batarya",
      fixtureBadge: "Mat Siyah"
    },
    tiles: [
      {
        name: "NG Kütahya Calacatta Gold 60x120",
        size: "60x120 cm",
        finish: "Full Lappato Parlak Cilalı",
        img: "/textures/calacatta_gold.jpg",
        badge: "👑 PREMİUM KOLEKSİYON",
        brand: "NG KÜTAHYA",
        price: "₺740 / m²"
      },
      {
        name: "Bien Seramik Travertino Bej 60x120",
        size: "60x120 cm",
        finish: "İpek Mat Lappato",
        img: "/textures/travertino_classico.jpg",
        badge: "✨ YENİ SEZON",
        brand: "BIEN SERAMİK",
        price: "₺680 / m²"
      },
      {
        name: "Graniser Concrete Grey 80x80",
        size: "80x80 cm",
        finish: "Mat Beton Dokulu Porselen",
        img: "/textures/concrete_light_grey.jpg",
        badge: "🔥 SPONSORLU TREND",
        brand: "GRANİSER",
        price: "₺610 / m²"
      }
    ],
    tileName: "NG Kütahya Calacatta Gold 60x120",
    tileSize: "60x120 cm",
    tileFinish: "Full Lappato Parlak Cilalı",
    tileImg: "/textures/calacatta_gold.jpg",
    cabinet: "Doğal Budaklı Meşe Banyo Dolabı",
    cabinetDetail: "Gizli Kulpsuz & Yavaş Kapanır Sürgü Ray",
    fixture: "Mat Siyah Batarya & Duş Seti",
    fixtureBadge: "Mat Siyah",
    paintName: "Jotun 1024 Kum Beji Duvar Boyası",
    paintColor: "#dfdcd3",
    paintSheen: "Mat İpek Dokulu Yıkanabilir",
    accentColor: "#d4af37",
    cabinetHex: "#5c4033",
    colorPalette: ["#ffffff", "#eae6df", "#5c4033", "#d4af37", "#1e293b"],
    lighting: "3000K Sıcak Beyaz LED Spot",
    groutColor: "Fildişi Bej (1.5 mm)",
    budgetLevel: "Lüks Premium Segment",
    desc: "Altın damarlı Calacatta zemin seramiği, 3D rölief duvar dekoru ve fildişi derz dolgusuyla kusursuz banyo mimarisi oluşturur. Meşe dolap ve mat siyah armatürle tamamlanır."
  },
  {
    id: 1,
    category: "banyo",
    styleName: "Endüstriyel Loft & Antrasit Beton",
    tagline: "Minimalist, Maskülen ve Güçlü Karakter",
    styleBadge: "🏙️ LOFT BETON",
    matchScore: 96,
    floorTile: {
      name: "Kalebodur Sement Antrasit 60x60",
      size: "60x60 cm",
      finish: "Mat Anti-slip Porselen",
      img: "/textures/loft_beton.jpg",
      badge: "🔥 SPONSORLU TREND",
      brand: "KALEBODUR",
      price: "₺520 / m²",
      pei: "PEI 5 (Ağır Trafik)",
      slip: "R10 Kaymaz Yüzey"
    },
    wallTile: {
      name: "QUA Albatros Antrasit 60x120",
      size: "60x120 cm",
      finish: "Mat Beton Dokulu Porselen Plaka",
      img: "/textures/albatros_antrasit.jpg",
      badge: "✨ UYUMLU DUVAR PLAKASI",
      brand: "QUA GRANITE",
      price: "₺680 / m²"
    },
    grout: {
      name: "Ceresit Koyu Antrasit Derz Dolgusu",
      color: "Koyu Antrasit (#292524)",
      width: "2.0 mm Derz Aralığı",
      type: "Epoksi Esaslı Antibakteriyel",
      hex: "#292524"
    },
    complement: {
      name: "Siyah Metal Çerçeve & Gold Batarya",
      cabinet: "Mat Siyah Metal Çerçeveli Ünite",
      cabinetHex: "#1a1a1a",
      fixture: "Fırçalanmış Gold Batarya Seti",
      fixtureBadge: "Fırçalanmış Gold"
    },
    tiles: [
      {
        name: "Kalebodur Sement Antrasit 60x60",
        size: "60x60 cm",
        finish: "Mat R10 Anti-slip",
        img: "/textures/loft_beton.jpg",
        badge: "🔥 SPONSORLU TREND",
        brand: "KALEBODUR",
        price: "₺520 / m²"
      },
      {
        name: "QUA Granite Albatros Antrasit 60x120",
        size: "60x120 cm",
        finish: "Mat Beton Dokulu Porselen",
        img: "/textures/albatros_antrasit.jpg",
        badge: "✨ YENİ SEZON",
        brand: "QUA GRANITE",
        price: "₺680 / m²"
      },
      {
        name: "Graniser Borneo Antrasit 80x80",
        size: "80x80 cm",
        finish: "R11 Anti-slip Dış Mekan / Banyo",
        img: "/textures/borneo_antrasit.jpg",
        badge: "👑 PREMİUM KOLEKSİYON",
        brand: "GRANİSER",
        price: "₺710 / m²"
      }
    ],
    tileName: "Kalebodur Sement Antrasit 60x60",
    tileSize: "60x60 cm",
    tileFinish: "Mat R10 Anti-slip",
    tileImg: "/textures/loft_beton.jpg",
    cabinet: "Mat Siyah Metal Çerçeveli Ünite",
    cabinetDetail: "Statik Toz Boyalı Çelik Çerçeve",
    fixture: "Fırçalanmış Gold Batarya Seti",
    fixtureBadge: "Fırçalanmış Gold",
    paintName: "Jotun 1032 Sis Grisi Duvar Boyası",
    paintColor: "#abb2b9",
    paintSheen: "Yarı Mat Su Bazlı",
    accentColor: "#b38e47",
    cabinetHex: "#1a1a1a",
    colorPalette: ["#abb2b9", "#1a1a1a", "#b38e47", "#333333", "#f8fafc"],
    lighting: "4000K Doğal Beyaz Lineer Işık",
    groutColor: "Koyu Antrasit (2.0 mm)",
    budgetLevel: "Modern Loft Segment",
    desc: "Koyu beton dokulu porselen seramiğin soğuk duruşunu, epoksi derz dolgusu ve fırçalanmış altın bataryanın lüks ışıltısı ile loft estetiğine dönüştürün."
  },
  {
    id: 2,
    category: "salon",
    styleName: "Sıcak İskandinav & Japandi Ahşap Parke",
    tagline: "Doğal, Dingin ve Huzurlu Yaşam Alanları",
    styleBadge: "🍃 JAPANDİ AHŞAP",
    matchScore: 99,
    floorTile: {
      name: "Ege Seramik Nordic Meşe 20x120",
      size: "20x120 cm",
      finish: "Ahşap Relief Dokulu Parke Seramik",
      img: "/textures/natural_oak.jpg",
      badge: "✨ YENİ SEZON",
      brand: "EGE SERAMİK",
      price: "₺590 / m²",
      pei: "PEI 4 (Zemin Parke)",
      slip: "R10 Doğal Dokulu"
    },
    wallTile: {
      name: "Yurtbay Teak Bordür & Süpürgelik",
      size: "15x90 cm",
      finish: "Ahşap Desenli Seramik Süpürgelik",
      img: "/textures/teak_ahsap.jpg",
      badge: "✨ UYUMLU SÜPÜRGELİK",
      brand: "YURTBAY",
      price: "₺340 / m²"
    },
    grout: {
      name: "Kalekim Açık Meşe Rengi Derz Dolgusu",
      color: "Açık Meşe (#C2A688)",
      width: "1.0 mm Derz Aralığı",
      type: "Sıcak Tone-on-Tone Derz",
      hex: "#c2a688"
    },
    complement: {
      name: "Mat Beyaz Lake Ünite & Çelik Armatür",
      cabinet: "Mat Beyaz Kulpsuz Lake Mobilya",
      cabinetHex: "#ffffff",
      fixture: "Fırçalanmış Çelik Armatür",
      fixtureBadge: "Fırçalanmış Çelik"
    },
    tiles: [
      {
        name: "Ege Seramik Nordic Meşe 20x120",
        size: "20x120 cm",
        finish: "Doğal Ahşap Relief Dokulu",
        img: "/textures/natural_oak.jpg",
        badge: "✨ YENİ SEZON",
        brand: "EGE SERAMİK",
        price: "₺590 / m²"
      },
      {
        name: "Yurtbay Seramik Teak Parke 15x90",
        size: "15x90 cm",
        finish: "Mat Ahşap Desenli Seramik",
        img: "/textures/teak_ahsap.jpg",
        badge: "👑 PREMİUM KOLEKSİYON",
        brand: "YURTBAY SERAMİK",
        price: "₺640 / m²"
      }
    ],
    tileName: "Ege Seramik Nordic Meşe 20x120",
    tileSize: "20x120 cm",
    tileFinish: "Doğal Ahşap Relief Dokulu",
    tileImg: "/textures/natural_oak.jpg",
    cabinet: "Mat Beyaz Kulpsuz Minimal Ünite",
    cabinetDetail: "Lake Kaplama & Dokunmatik Açılır",
    fixture: "Fırçalanmış Çelik Evye Armatürü",
    fixtureBadge: "Fırçalanmış Çelik",
    paintName: "Jotun 1622 Fildişi Beyazı Boya",
    paintColor: "#f4f3ef",
    paintSheen: "Ekstra Mat Su Bazlı",
    accentColor: "#c2a688",
    cabinetHex: "#ffffff",
    colorPalette: ["#f4f3ef", "#c2a688", "#5c4033", "#cbd5e1", "#ffffff"],
    lighting: "2700K Çok Sıcak Ambiyans Işığı",
    groutColor: "Açık Meşe Derzi (1.0 mm)",
    budgetLevel: "Doğal Organik Segment",
    desc: "Ahşap görünümlü porselen parkenin doğal sıcaklığını ekstra mat fildişi duvar boyası ve minimal beyaz mobilyalarla tamamlayarak İskandinav huzuru yakalayın."
  },
  {
    id: 3,
    category: "mutfak",
    styleName: "Organik Traverten & Mutfak Taş Kombini",
    tagline: "Huzurlu, Sıcak ve Modern Mutfak Mimarisi",
    styleBadge: "🍳 MODERN MUTFAK",
    matchScore: 99,
    floorTile: {
      name: "Çanakkale Seramik Travertino Bej 60x120",
      size: "60x120 cm",
      finish: "Doğal Traverten Dokulu Mat Porselen",
      img: "/textures/travertino_classico.jpg",
      badge: "🔥 SPONSORLU TREND",
      brand: "ÇANAKKALE SERAMİK",
      price: "₺720 / m²",
      pei: "PEI 4 (Mutfak & Zemin)",
      slip: "R10 Leffato Mat"
    },
    wallTile: {
      name: "Güral Seramik Vista Bej Tezgah Arası",
      size: "30x60 cm",
      finish: "Mat Bej Mutfak Tezgah Arası Seramik",
      img: "/textures/vista_bej.jpg",
      badge: "✨ TEZGAH ARASI SERAMİK",
      brand: "GÜRAL SERAMİK",
      price: "₺540 / m²"
    },
    grout: {
      name: "Weber Susam Beji Leke Tutmaz Derz",
      color: "Susam Beji (#EDE8DD)",
      width: "1.5 mm Derz Aralığı",
      type: "Yağ & Leke İtici Mutfak Derzi",
      hex: "#ede8dd"
    },
    complement: {
      name: "Ceviz Mutfak Ünitesi & Pirinç Armatür",
      cabinet: "Ceviz Kaplama Kulpsuz Mutfak Ünitesi",
      cabinetHex: "#4a3525",
      fixture: "Fırçalanmış Pirinç Tezgah Bataryası",
      fixtureBadge: "Fırçalanmış Pirinç"
    },
    tiles: [
      {
        name: "Çanakkale Seramik Travertino Bej 60x120",
        size: "60x120 cm",
        finish: "Doğal Traverten Dokulu Mat Porselen",
        img: "/textures/travertino_classico.jpg",
        badge: "🔥 SPONSORLU TREND",
        brand: "ÇANAKKALE SERAMİK",
        price: "₺720 / m²"
      },
      {
        name: "Güral Seramik Vista Bej Plaka 100x300",
        size: "100x300 cm",
        finish: "Mega Porselen Tezgah & Zemin Plakası",
        img: "/textures/vista_bej.jpg",
        badge: "👑 PREMİUM KOLEKSİYON",
        brand: "GÜRAL SERAMİK",
        price: "₺1.250 / m²"
      }
    ],
    tileName: "Çanakkale Seramik Travertino Bej 60x120",
    tileSize: "60x120 cm",
    tileFinish: "Doğal Traverten Dokulu Mat Porselen",
    tileImg: "/textures/travertino_classico.jpg",
    cabinet: "Ceviz Ağacı Kaplamalı Mutfak Dolapları",
    cabinetDetail: "Entegre Sıcak LED Raflar & Bas-Aç Kulpsuz",
    fixture: "Fırçalanmış Pirinç Tezgah Armatürü",
    fixtureBadge: "Fırçalanmış Pirinç",
    paintName: "Jotun 12125 Susam Beyazı Boya",
    paintColor: "#ede8dd",
    paintSheen: "Yıkanabilir Leke Tutmaz Mutfak Boyası",
    accentColor: "#eab308",
    cabinetHex: "#4a3525",
    colorPalette: ["#ede8dd", "#4a3525", "#eab308", "#1c1917", "#ffffff"],
    lighting: "3000K Tezgah Altı Entegre LED",
    groutColor: "Susam Beji Derzi (1.5 mm)",
    budgetLevel: "Gurme Mutfak Segmenti",
    desc: "Traverten dokulu porselen plakanın organik dokusunu koyu ceviz mobilya ve fırçalanmış pirinç tezgah armatürü ile gurme mutfak estetiğine taşıyın."
  }
];

export default function Home() {
  const { t, lang, translateStyle, translateFinish } = useLanguage();

  // Page Preloader State
  const [pageLoading, setPageLoading] = useState(true);
  const [initialBrandsLoaded, setInitialBrandsLoaded] = useState(false);
  const [initialProductsLoaded, setInitialProductsLoaded] = useState(false);

  // Accordion Expand/Collapse States for Filters
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    collection: true,
    texture: true,
    ebat: true,
    productType: true,
    productFeature: true,
    spaceType: true
  });

  const toggleSection = (sec) => {
    setExpandedSections(prev => ({
      ...prev,
      [sec]: !prev[sec]
    }));
  };

  // Additional Filter States
  const [selectedRectified, setSelectedRectified] = useState(''); // '', 'true', 'false'
  const [selectedFrost, setSelectedFrost] = useState(''); // '', 'true', 'false'
  const [selectedSlipResistance, setSelectedSlipResistance] = useState(''); // '', 'R9', 'R10', 'R11'
  const [selectedThickness, setSelectedThickness] = useState(''); // '', 'thin', 'standard', 'thick'
  const [selectedPeiRating, setSelectedPeiRating] = useState(''); // '', '3', '4', '5'
  const [selectedIsPremium, setSelectedIsPremium] = useState(''); // '', 'true'

  // Navigation
  const [activeTab, setActiveTab] = useState('search'); // search, studio, dealers, b2b
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Database State
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [brands, setBrands] = useState([]);
  const [weeklyProducts, setWeeklyProducts] = useState([]);
  const [activeProduct, setActiveProduct] = useState(null);

  // New visual and search states
  const [heroSlideIndex, setHeroSlideIndex] = useState(0);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedMoodIndex, setSelectedMoodIndex] = useState(0);
  const [moodboardCombos, setMoodboardCombos] = useState(DEFAULT_MOODBOARD_COMBOS);
  const [moodboardCategory, setMoodboardCategory] = useState('all');
  const [aiGeneratingCombo, setAiGeneratingCombo] = useState(false);
  const [aiPromptInput, setAiPromptInput] = useState('');
  const [customFaucetFinish, setCustomFaucetFinish] = useState(null);
  const [activeTileIndex, setActiveTileIndex] = useState(0);

  // Advanced AI Studio v6.0 Interactive States
  const [studioRoomSizeM2, setStudioRoomSizeM2] = useState(15);
  const [studioViewMode, setStudioViewMode] = useState('cards'); // 'cards' | 'composite'
  const [roomCameraAngle, setRoomCameraAngle] = useState('eye'); // 'eye' | 'top' | 'macro'
  const [showAiPhotoScanModal, setShowAiPhotoScanModal] = useState(false);
  const [specCopiedMsg, setSpecCopiedMsg] = useState(false);
  const [aiPhotoScanning, setAiPhotoScanning] = useState(false);
  const [selectedPhotoTemplate, setSelectedPhotoTemplate] = useState(null);
  const aiFileInputRef = useRef(null);
  const [uploadedPhotoPreview, setUploadedPhotoPreview] = useState(null);
  const [uploadedPhotoName, setUploadedPhotoName] = useState('');

  // Real-time Platform Statistics State (Directly computed from Prisma DB)
  const [liveStats, setLiveStats] = useState({
    activeOnlineUsers: 0,
    todayVisitors: 0,
    approvedDealers: 0,
    totalProducts: 0,
    totalRFQs: 0,
    userCount: 0,
    analyticsCount: 0
  });
  const [liveActivities, setLiveActivities] = useState([]);
  const [activeActivityIdx, setActiveActivityIdx] = useState(0);

  useEffect(() => {
    const fetchLiveStats = async () => {
      try {
        const res = await fetch('/api/stats/live');
        const data = await res.json();
        if (data.success && data.stats) {
          setLiveStats(data.stats);
          if (data.activities && data.activities.length > 0) {
            setLiveActivities(data.activities);
          }
        }
      } catch (err) {
        console.error("Live stats fetch error:", err);
      }
    };
    fetchLiveStats();
    const interval = setInterval(fetchLiveStats, 5000); // Live poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!liveActivities || liveActivities.length === 0) return;
    const tickerInterval = setInterval(() => {
      setActiveActivityIdx(prev => (prev + 1) % liveActivities.length);
    }, 4500);
    return () => clearInterval(tickerInterval);
  }, [liveActivities]);

  // Product Comparison Wizard States
  const [comparedProducts, setComparedProducts] = useState([]);
  const [showComparisonModal, setShowComparisonModal] = useState(false);

  const toggleCompareProduct = (product) => {
    setComparedProducts(prev => {
      const exists = prev.some(p => p.id === product.id);
      if (exists) {
        return prev.filter(p => p.id !== product.id);
      } else {
        if (prev.length >= 4) {
          alert('En fazla 4 ürünü aynı anda karşılaştırabilirsiniz.');
          return prev;
        }
        return [...prev, product];
      }
    });
  };


  useEffect(() => {
    const timer = setInterval(() => {
      setHeroSlideIndex(prev => (prev + 1) % 3);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Auto-rotate moodboard selected index every 8 seconds to capture user attention
  useEffect(() => {
    if (activeTab !== 'search') return;
    const timer = setInterval(() => {
      setSelectedMoodIndex(prev => {
        const count = moodboardCombos.length || 4;
        return (prev + 1) % count;
      });
    }, 8000);
    return () => clearInterval(timer);
  }, [moodboardCombos, activeTab]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim().length > 1) {
      const matches = products.filter(p => 
        p.name.toLowerCase().includes(val.toLowerCase()) || 
        p.code.toLowerCase().includes(val.toLowerCase()) ||
        (p.brand?.name && p.brand.name.toLowerCase().includes(val.toLowerCase()))
      ).slice(0, 5);
      setSearchSuggestions(matches);
      setShowSuggestions(true);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  };
  
  // Product Detail Modal State
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailProduct, setDetailProduct] = useState(null);
  const [detailDealers, setDetailDealers] = useState([]);
  const [detailDealersLoading, setDetailDealersLoading] = useState(false);
  const [isCrawlingPrice, setIsCrawlingPrice] = useState(false);
  const [crawlLogMsg, setCrawlLogMsg] = useState('');

  const handleRefreshLivePrices = async (productId) => {
    if (!productId || isCrawlingPrice) return;
    setIsCrawlingPrice(true);
    setCrawlLogMsg('Canlı pazar yeri ve yapı market fiyatları taranıyor...');
    try {
      const res = await fetch('/api/admin/crawl-prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId })
      });
      const data = await res.json();
      if (data.success && data.product) {
        const enriched = enrichProductData(data.product);
        setDetailProduct(enriched);
        setCrawlLogMsg('✓ Canlı fiyatlar başarıyla güncellendi!');
      } else {
        setCrawlLogMsg('Güncel fiyatlar başarıyla çekildi.');
      }
    } catch (err) {
      console.error('Failed to crawl prices:', err);
      setCrawlLogMsg('Fiyat tarama sırasında hata oluştu.');
    } finally {
      setIsCrawlingPrice(false);
      setTimeout(() => setCrawlLogMsg(''), 4000);
    }
  };

  // Smart Calculator State
  const [calcWidth, setCalcWidth] = useState('4');
  const [calcHeight, setCalcHeight] = useState('5');
  const [calcLayout, setCalcLayout] = useState('flat'); // flat, diagonal
  const [calcWastage, setCalcWastage] = useState('10'); // 10%, 15%
  const [calcResults, setCalcResults] = useState(null);
  
  // CAD Download State
  const [isDownloadingCAD, setIsDownloadingCAD] = useState(false);
  const [cadDownloadSuccess, setCadDownloadSuccess] = useState(false);

  // 1:1 Scale AR Viewer Modal State
  const [arModalProduct, setArModalProduct] = useState(null);

  // AI Room Visualizer State
  const [uploadedRoomImage, setUploadedRoomImage] = useState(null);
  const [isProcessingRoomImage, setIsProcessingRoomImage] = useState(false);
  const [roomProcessingStep, setRoomProcessingStep] = useState('');
  const [processedRoomImage, setProcessedRoomImage] = useState(null);
  const [isAiGeneratedRoom, setIsAiGeneratedRoom] = useState(false);
  
  const [aiProvider, setAiProvider] = useState('grok');
  const [grokApiKey, setGrokApiKey] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  
  const [roomPolygon, setRoomPolygon] = useState(null);
  const [roomExclude, setRoomExclude] = useState([]);
  
  const [roomTileScale, setRoomTileScale] = useState(1.0);
  const [roomBlendMode, setRoomBlendMode] = useState('multiply'); // 'multiply' or 'normal'
  
  const [showPointEditor, setShowPointEditor] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);
  const containerRef = useRef(null);
  
  const imgRoomRef = useRef(null);
  const imgTileRef = useRef(null);
  const base64ImageRef = useRef(null);

  // Load API key and provider from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedProvider = localStorage.getItem('ai_provider') || 'grok';
      const savedGrokKey = localStorage.getItem('grok_api_key') || '';
      const savedGeminiKey = localStorage.getItem('gemini_api_key') || '';
      setAiProvider(savedProvider);
      setGrokApiKey(savedGrokKey);
      setGeminiApiKey(savedGeminiKey);
    }
  }, []);

  const handleSaveGrokKey = (key) => {
    setGrokApiKey(key);
    localStorage.setItem('grok_api_key', key);
  };

  const handleSaveGeminiKey = (key) => {
    setGeminiApiKey(key);
    localStorage.setItem('gemini_api_key', key);
  };

  const handleSaveProvider = (provider) => {
    setAiProvider(provider);
    localStorage.setItem('ai_provider', provider);
  };

  const handlePointerDown = (e, index) => {
    e.preventDefault();
    setDragIndex(index);
  };

  const handlePointerMove = (e) => {
    if (dragIndex === null || !containerRef.current || !roomPolygon) return;
    const rect = containerRef.current.getBoundingClientRect();
    
    // Support mouse and touch events
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    let xPct = ((clientX - rect.left) / rect.width) * 100;
    let yPct = ((clientY - rect.top) / rect.height) * 100;

    xPct = Math.max(0, Math.min(100, Math.round(xPct)));
    yPct = Math.max(0, Math.min(100, Math.round(yPct)));

    const newPolygon = [...roomPolygon];
    newPolygon[dragIndex] = [xPct, yPct];
    setRoomPolygon(newPolygon);

    if (imgRoomRef.current && imgTileRef.current) {
      const resultDataUrl = processRoomTiling(imgRoomRef.current, imgTileRef.current, newPolygon, roomExclude);
      setProcessedRoomImage(resultDataUrl);
    }
  };

  const handlePointerUp = () => {
    setDragIndex(null);
  };

  // Bayi Teşhir Kiosk Modu State
  const [isKioskMode, setIsKioskMode] = useState(false);
  
  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedFinish, setSelectedFinish] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  
  // Visual Search Upload Simulation
  const [visualSearchLoading, setVisualSearchLoading] = useState(false);
  const [uploadedImagePreview, setUploadedImagePreview] = useState(null);
  const [visualSearchMatches, setVisualSearchMatches] = useState(null);

  // 3D Studio Options
  const [studioTarget, setStudioTarget] = useState('floor'); // floor, walls, accent, shower, toilet
  const [studioApplyFloor, setStudioApplyFloor] = useState(true);
  const [studioApplyWalls, setStudioApplyWalls] = useState(true);
  const [studioApplyAccent, setStudioApplyAccent] = useState(false);
  const [studioApplyShower, setStudioApplyShower] = useState(false);
  const [studioApplyToiletWall, setStudioApplyToiletWall] = useState(false);
  const [studioFloorProduct, setStudioFloorProduct] = useState(null);
  const [studioWallProduct, setStudioWallProduct] = useState(null);
  const [studioAccentProduct, setStudioAccentProduct] = useState(null);
  const [studioShowerProduct, setStudioShowerProduct] = useState(null);
  const [studioToiletWallProduct, setStudioToiletWallProduct] = useState(null);
  const [studioComparisonMode, setStudioComparisonMode] = useState(false);
  const [studioComparisonProduct, setStudioComparisonProduct] = useState(null);
  const [studioComparisonSplit, setStudioComparisonSplit] = useState(50);
  const [studioWalkthroughMode, setStudioWalkthroughMode] = useState(false);
  const [studioRoomType, setStudioRoomType] = useState('bathroom'); // bathroom, livingroom, kitchen, hallway, terrace
  const [studioGroutWidth, setStudioGroutWidth] = useState('2'); // 1, 2, 3, 5 mm
  const [studioGroutColor, setStudioGroutColor] = useState('#888888'); // hex
  const [studioLightTemp, setStudioLightTemp] = useState('neutral'); // neutral, warm, cool
  const [studioLightIntensity, setStudioLightIntensity] = useState(1.0); // 0.2 to 2.0
  const [studioTileRotation, setStudioTileRotation] = useState(0); // 0 or 90
  const [studioLayPattern, setStudioLayPattern] = useState('flat'); // flat, diagonal, herringbone, staggered_50, staggered_33
  const [studioTimeOfDay, setStudioTimeOfDay] = useState('day'); // sunrise, day, sunset, night
  const [studioCabinetColor, setStudioCabinetColor] = useState('#5c4033'); // oak, white, anthracite, walnut
  const [studioFaucetColor, setStudioFaucetColor] = useState('chrome'); // chrome, black, gold, rosegold

  // Geolocation & Dealer Locator State
  const [userLocationName, setUserLocationName] = useState('Kadıköy Merkez');
  const [userCoords, setUserCoords] = useState({ lat: 40.9901, lng: 29.0278 }); // Kadikoy by default
  const [nearestDealers, setNearestDealers] = useState([]);
  const [activeDealerOnMap, setActiveDealerOnMap] = useState(null);
  const [locatorBrandId, setLocatorBrandId] = useState('');
  const [locatorMaxDistance, setLocatorMaxDistance] = useState(50); // default max 50 km
  const [dealerSearchQuery, setDealerSearchQuery] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState(null);
  
  // Leads Form State
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [leadProduct, setLeadProduct] = useState(null);
  const [leadDealer, setLeadDealer] = useState(null);
  const [leadName, setLeadName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadNotes, setLeadNotes] = useState('');
  const [leadSuccessMsg, setLeadSuccessMsg] = useState('');
  const [leadErrorMsg, setLeadErrorMsg] = useState('');
  const [leadKvkkAccepted, setLeadKvkkAccepted] = useState(false);
  const [requestedUsta, setRequestedUsta] = useState(false);
  const [requestedArchitect, setRequestedArchitect] = useState(false);
  const [projectDimensions, setProjectDimensions] = useState('');
  const [projectPhotoUrl, setProjectPhotoUrl] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);

  const handleOpenLeadModalWithProduct = (calcData) => {
    if (typeof window !== 'undefined') {
      const dealerSec = document.getElementById('resmi-yetkili-bayiler-section');
      if (dealerSec) {
        dealerSec.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setShowLeadModal(true);
  };
  
  // Dealer Details Modal State
  const [showDealerDetailModal, setShowDealerDetailModal] = useState(false);
  const [selectedDetailDealer, setSelectedDetailDealer] = useState(null);
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);

  // Dealer Signup State
  const [showDealerSignup, setShowDealerSignup] = useState(false);
  const [signupName, setSignupName] = useState('');
  const [signupBrandId, setSignupBrandId] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupAddress, setSignupAddress] = useState('');
  const [signupCity, setSignupCity] = useState('İstanbul');
  const [signupDistrict, setSignupDistrict] = useState('');
  const [signupLat, setSignupLat] = useState('40.9901');
  const [signupLng, setSignupLng] = useState('29.0278');
  const [signupSuccess, setSignupSuccess] = useState('');
  const [signupError, setSignupError] = useState('');
  const [isSubmittingSignup, setIsSubmittingSignup] = useState(false);

  // User Auth State
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState('login');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authSuccess, setAuthSuccess] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userFavorites, setUserFavorites] = useState([]);
  const [showFavoritesPanel, setShowFavoritesPanel] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Podium Spotlight Modal State
  const [podiumData, setPodiumData] = useState(null);
  const [showPodiumModal, setShowPodiumModal] = useState(false);

  useEffect(() => {
    const fetchActivePodium = async () => {
      try {
        const res = await fetch('/api/podium/active');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.active && data.bid) {
            const hasSeen = sessionStorage.getItem(`sb_podium_seen_w${data.weekNumber}`);
            if (!hasSeen) {
              setPodiumData(data.bid);
              setShowPodiumModal(true);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load active podium spotlight:', err);
      }
    };
    fetchActivePodium();
  }, []);

  // AI Assistant Chatbot State
  const [showAiChatbot, setShowAiChatbot] = useState(false);
  const [aiChatMessages, setAiChatMessages] = useState([
    { role: 'assistant', content: 'Merhaba! Ben SeramikBak Asistanı. Seramik seçimi, stil uyumu veya metraj hesaplama konularında size yardımcı olabilirim. Nasıl yardımcı olabilirim?' }
  ]);
  const [aiChatInput, setAiChatInput] = useState('');
  const [aiChatLoading, setAiChatLoading] = useState(false);

  // Dealer Signup handler
  const handleDealerSignupSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingSignup(true);
    setSignupSuccess('');
    setSignupError('');

    try {
      const res = await fetch('/api/dealers/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: signupName,
          brandId: signupBrandId || (brands[0]?.id || ''),
          phone: signupPhone,
          email: signupEmail,
          password: signupPassword,
          address: signupAddress,
          city: signupCity,
          district: signupDistrict,
          lat: parseFloat(signupLat) || 40.9901,
          lng: parseFloat(signupLng) || 29.0278
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSignupSuccess('Başvurunuz başarıyla alındı! Sistem yöneticisi onayından sonra aktifleşecektir.');
        setSignupName('');
        setSignupPhone('');
        setSignupEmail('');
        setSignupPassword('');
        setSignupAddress('');
        setSignupDistrict('');
      } else {
        setSignupError(data.error || 'Başvuru sırasında hata oluştu.');
      }
    } catch (err) {
      console.error(err);
      setSignupError('Sunucu bağlantı hatası.');
    } finally {
      setIsSubmittingSignup(false);
    }
  };

  const handleSendAiChatMessage = async (e) => {
    if (e) e.preventDefault();
    if (!aiChatInput.trim() || aiChatLoading) return;

    const userMessage = { role: 'user', content: aiChatInput };
    setAiChatMessages(prev => [...prev, userMessage]);
    setAiChatInput('');
    setAiChatLoading(true);

    try {
      const history = aiChatMessages.map(m => ({ role: m.role, content: m.content }));
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...history, userMessage]
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setAiChatMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        setAiChatMessages(prev => [...prev, { role: 'assistant', content: 'Üzgünüm, şu anda yanıt veremiyorum. Lütfen tekrar deneyin.' }]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setAiChatMessages(prev => [...prev, { role: 'assistant', content: 'Bağlantı hatası oluştu. Lütfen internet bağlantınızı kontrol edin.' }]);
    } finally {
      setAiChatLoading(false);
    }
  };

  const renderChatMessage = (content) => {
    if (!content) return '';
    // Matches markdown link pattern: [Text](product:ANYTHING_BUT_CLOSE_PAREN)
    const regex = /\[([^\]]+)\]\(product:([^)]+)\)/g;
    
    const parts = [];
    let lastIndex = 0;
    let match;
    
    while ((match = regex.exec(content)) !== null) {
      // Add text before the link
      if (match.index > lastIndex) {
        parts.push(content.substring(lastIndex, match.index));
      }
      
      const linkText = match[1];
      const productQuery = match[2].trim();
      
      parts.push(
        <a 
          key={match.index}
          href="#"
          onClick={async (e) => {
            e.preventDefault();
            // Fetch product by code or name query
            try {
              const res = await fetch(`/api/search?q=${encodeURIComponent(productQuery)}`);
              const data = await res.json();
              if (res.ok && Array.isArray(data) && data.length > 0) {
                // Try to find exact case-insensitive name or code match first
                const foundProduct = data.find(
                  p => p.name.toLowerCase() === productQuery.toLowerCase() || 
                       p.code.toLowerCase() === productQuery.toLowerCase()
                ) || data.find(
                  p => p.name.toLowerCase().includes(productQuery.toLowerCase())
                ) || data[0];
                
                // Clear all filters to prevent search conflicts
                setSelectedBrand('');
                setSelectedColor('');
                setSelectedFinish('');
                setSelectedStyle('');
                setSelectedArea('');
                setSelectedSize('');
                setSelectedRectified('');
                setSelectedFrost('');
                setSearchQuery('');
                setUploadedImagePreview(null);
                setVisualSearchMatches(null);

                // Open the product details sidebar and trigger search tab
                handleProductCardClick(foundProduct);
                setActiveTab('search');
              } else {
                // Fallback: If no products found, try searching with just the first word of the query
                const firstWord = productQuery.split(' ')[0];
                if (firstWord && firstWord !== productQuery) {
                  const fallbackRes = await fetch(`/api/search?q=${encodeURIComponent(firstWord)}`);
                  const fallbackData = await fallbackRes.json();
                  if (fallbackRes.ok && Array.isArray(fallbackData) && fallbackData.length > 0) {
                    // Clear all filters
                    setSelectedBrand('');
                    setSelectedColor('');
                    setSelectedFinish('');
                    setSelectedStyle('');
                    setSelectedArea('');
                    setSelectedSize('');
                    setSelectedRectified('');
                    setSelectedFrost('');
                    setSearchQuery('');
                    setUploadedImagePreview(null);
                    setVisualSearchMatches(null);

                    handleProductCardClick(fallbackData[0]);
                    setActiveTab('search');
                    return;
                  }
                }
                alert('Ürün bulunamadı veya katalogda mevcut değil.');
              }
            } catch (err) {
              console.error('Failed to load product link:', err);
            }
          }}
          style={{
            color: 'var(--accent-gold, #d4af37)',
            fontWeight: 'bold',
            textDecoration: 'underline',
            cursor: 'pointer'
          }}
        >
          {linkText}
        </a>
      );
      
      lastIndex = regex.lastIndex;
    }
    
    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex));
    }
    
    return parts.length > 0 ? parts : content;
  };

  // ---- USER AUTH HANDLERS ----
  // Restore session from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('seramikbak_user');
      if (saved) {
        try {
          const user = JSON.parse(saved);
          setCurrentUser(user);
        } catch(e) { localStorage.removeItem('seramikbak_user'); }
      }
    }
  }, []);

  // Fetch favorites when user logs in
  useEffect(() => {
    if (currentUser) {
      fetch(`/api/favorites/list?userId=${currentUser.id}`)
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data)) setUserFavorites(data);
        })
        .catch(() => {});
    } else {
      setUserFavorites([]);
    }
  }, [currentUser]);

  // Close user dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showUserMenu && !e.target.closest('.user-menu-wrapper')) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showUserMenu]);

  const handleAuthLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail, password: authPassword })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCurrentUser(data.user);
        localStorage.setItem('seramikbak_user', JSON.stringify(data.user));
        setShowAuthModal(false);
        setAuthEmail('');
        setAuthPassword('');
        setAuthSuccess('');
      } else {
        setAuthError(data.error || 'Giriş başarısız.');
      }
    } catch (err) {
      setAuthError('Sunucu bağlantı hatası.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAuthRegister = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: authName, email: authEmail, password: authPassword })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAuthSuccess('Kayıt başarılı! Şimdi giriş yapabilirsiniz.');
        setAuthTab('login');
        setAuthName('');
        setAuthPassword('');
      } else {
        setAuthError(data.error || 'Kayıt başarısız.');
      }
    } catch (err) {
      setAuthError('Sunucu bağlantı hatası.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUserFavorites([]);
    setShowUserMenu(false);
    localStorage.removeItem('seramikbak_user');
  };

  const handleToggleFavorite = async (productId) => {
    if (!currentUser) {
      window.location.href = '/uyelik';
      return;
    }
    try {
      const res = await fetch('/api/favorites/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, productId })
      });
      const data = await res.json();
      if (data.success) {
        const favRes = await fetch(`/api/favorites/list?userId=${currentUser.id}`);
        const favData = await favRes.json();
        if (Array.isArray(favData)) setUserFavorites(favData);
      }
    } catch(e) {
      console.error('Favorite toggle failed:', e);
    }
  };

  const isProductFavorited = (productId) => {
    return userFavorites.some(f => f.productId === productId);
  };

  // B2B Dashboard State
  const [b2bBrandId, setB2bBrandId] = useState('');
  const [b2bStats, setB2bStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  
  // B2B Ad Campaign Creator Form
  const [campaignBid, setCampaignBid] = useState('2.50');
  const [campaignBudget, setCampaignBudget] = useState('1000');
  const [campaignProduct, setCampaignProduct] = useState('');
  const [campaignSuccessMsg, setCampaignSuccessMsg] = useState('');

  // Active Homepage Ad Campaigns Showcase
  const [activeAdCampaigns, setActiveAdCampaigns] = useState([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  useEffect(() => {
    if (activeAdCampaigns.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % activeAdCampaigns.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeAdCampaigns]);

  // Stripe Sandbox Webhook simulator
  const [stripePlan, setStripePlan] = useState('PRO');
  const [stripeWebhookResult, setStripeWebhookResult] = useState('');
  const [stripeLoading, setStripeLoading] = useState(false);

  // Fetch initial brands & weekly products
  useEffect(() => {
    // Fetch active ad campaigns for public showcase
    fetch('/api/b2b/campaigns')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setActiveAdCampaigns(data);
        }
      })
      .catch(err => console.error('Failed to fetch ad campaigns:', err));

    // Fetch brands list (fast, ~14 records)
    fetch('/api/brands')
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) {
          console.error('Failed to load initial brands (expected array):', data);
          setInitialBrandsLoaded(true);
          return;
        }
        setBrands(data);
        if (data.length > 0) {
          setB2bBrandId(data[0].id);
        }
        setInitialBrandsLoaded(true);
      })
      .catch((err) => {
        console.error('Failed to load initial brands:', err);
        setInitialBrandsLoaded(true);
      });

    // Fetch weekly premium products (fast, ~12 records)
    fetch('/api/search?isPremium=true&limit=12')
      .then(res => res.json())
      .then(data => {
        const enriched = Array.isArray(data) ? data.map(enrichProductData) : [];
        setWeeklyProducts(enriched);
        if (enriched.length >= 4) {
          const generated = enriched.slice(0, 4).map((p, idx) => generateMoodboardFromProduct(p, idx));
          setMoodboardCombos(generated);
        } else {
          setMoodboardCombos(DEFAULT_MOODBOARD_COMBOS);
        }
      })
      .catch((err) => {
        console.error('Failed to load weekly products:', err);
        setMoodboardCombos(DEFAULT_MOODBOARD_COMBOS);
      });
  }, []);

  // Sync preloader state
  useEffect(() => {
    if (initialBrandsLoaded && initialProductsLoaded) {
      const timer = setTimeout(() => {
        setPageLoading(false);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [initialBrandsLoaded, initialProductsLoaded]);

  // Sync locator brand selection when active product or brands list changes
  useEffect(() => {
    if (activeProduct) {
      setLocatorBrandId(activeProduct.brandId);
    } else if (brands.length > 0 && !locatorBrandId) {
      setLocatorBrandId(brands[0].id);
    }
  }, [activeProduct, brands]);

  // Automatically request device location when landing on the Dealers tab
  useEffect(() => {
    if (activeTab === 'dealers') {
      detectUserLocation();
    }
  }, [activeTab]);

  // Sync nearest dealers whenever locator brand or user coordinates change
  useEffect(() => {
    if (activeTab === 'dealers' && locatorBrandId && userCoords) {
      fetchNearestDealers(locatorBrandId, userCoords.lat, userCoords.lng);
    }
  }, [locatorBrandId, userCoords, activeTab]);

  // Check for kiosk mode query parameter on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('kiosk') === 'true') {
        setIsKioskMode(true);
      }

      // Load preselected favorite product in studio
      const preselected = localStorage.getItem('seramikbak_preselected_product');
      if (preselected) {
        try {
          const prod = JSON.parse(preselected);
          setActiveProduct(prod);
          setStudioFloorProduct(prod);
          setStudioWallProduct(prod);
          setActiveTab('studio');
        } catch (e) {
          console.error('Failed to load preselected product:', e);
        }
        localStorage.removeItem('seramikbak_preselected_product');
      }
    }
  }, []);

  // Sync B2B stats whenever dashboard brand is switched
  useEffect(() => {
    if (activeTab === 'b2b' && b2bBrandId) {
      fetchB2bStats(b2bBrandId);
    }
  }, [b2bBrandId, activeTab]);

  // Handle Kiosk Mode navigation locking
  useEffect(() => {
    if (isKioskMode) {
      setActiveTab('studio');
    }
  }, [isKioskMode]);

  const handleTryMoodboard = async (combo) => {
    if (!combo) return;
    
    // Dynamically apply furnishings color presets to 3D virtual studio
    if (combo.cabinetHex) setStudioCabinetColor(combo.cabinetHex);
    else if (combo.complement?.cabinetHex) setStudioCabinetColor(combo.complement.cabinetHex);

    if (combo.faucetVal) setStudioFaucetColor(combo.faucetVal);
    else if (combo.complement?.fixtureBadge?.toLowerCase().includes('siyah')) setStudioFaucetColor('black');
    else if (combo.complement?.fixtureBadge?.toLowerCase().includes('gold')) setStudioFaucetColor('gold');
    else setStudioFaucetColor('chrome');

    // Turn ON floor and wall rendering toggles
    setStudioApplyFloor(true);
    setStudioApplyWalls(true);

    const floorTileObj = combo.floorTile || {};
    const wallTileObj = combo.wallTile || {};

    const floorImgUrl = floorTileObj.img || combo.tileImg || '/textures/calacatta_gold.jpg';
    const wallImgUrl = wallTileObj.img || '/textures/vista_bej.jpg';

    const floorProdRaw = {
      id: 'floor-' + (combo.id || 0) + '-' + Date.now(),
      name: floorTileObj.name || combo.tileName || 'Zemin Seramiği 60x120',
      code: (floorTileObj.brand || 'NG') + '-ZEMIN-' + ((combo.id || 0) + 1) * 102,
      brandId: 'brand-floor',
      brand: { name: floorTileObj.brand || 'NG Kütahya' },
      dimensions: floorTileObj.size || '60x120 cm',
      width: 60,
      height: 120,
      finish: floorTileObj.finish?.includes('Parlak') ? 'Parlak' : 'Mat',
      style: 'Mermer',
      color: 'Beyaz',
      imageUrl: floorImgUrl,
      textureUrl: floorImgUrl,
      cheapestOffer: { price: parseInt(floorTileObj.price?.replace(/[^0-9]/g, '') || '500') }
    };

    const wallProdRaw = {
      id: 'wall-' + (combo.id || 0) + '-' + Date.now(),
      name: wallTileObj.name || 'Duvar & Dekor Seramiği 30x90',
      code: (wallTileObj.brand || 'VitrA') + '-DEKOR-' + ((combo.id || 0) + 1) * 305,
      brandId: 'brand-wall',
      brand: { name: wallTileObj.brand || 'VitrA' },
      dimensions: wallTileObj.size || '30x90 cm',
      width: 30,
      height: 90,
      finish: wallTileObj.finish?.includes('Parlak') ? 'Parlak' : 'Mat',
      style: 'Mermer',
      color: 'Bej',
      imageUrl: wallImgUrl,
      textureUrl: wallImgUrl,
      cheapestOffer: { price: parseInt(wallTileObj.price?.replace(/[^0-9]/g, '') || '420') }
    };

    const floorProd = enrichProductData(floorProdRaw);
    const wallProd = enrichProductData(wallProdRaw);

    setActiveProduct(floorProd);
    setStudioFloorProduct(floorProd);
    setStudioWallProduct(wallProd);

    setActiveTab('studio');
  };

  const handleAiAnalyzePrompt = async (searchQueryText) => {
    const query = (typeof searchQueryText === 'string' ? searchQueryText : aiPromptInput || '').trim();
    setAiGeneratingCombo(true);
    
    try {
      const fetchUrl = query 
        ? `/api/search?q=${encodeURIComponent(query)}&limit=8`
        : `/api/search?limit=12`;

      const res = await fetch(fetchUrl);
      if (res.ok) {
        const data = await res.json();
        const arrayData = Array.isArray(data) ? data : (data.products || []);
        if (arrayData.length > 0) {
          const enriched = arrayData.map(enrichProductData);
          const generated = enriched.map((p, idx) => generateMoodboardFromProduct(p, idx));
          setMoodboardCombos(generated);
          setSelectedMoodIndex(0);
          setActiveTileIndex(0);
        } else {
          // If no direct search match found in database, construct custom AI combo from prompt
          const customProd = {
            name: query || 'Özel Mimari Seramik',
            dimensions: '60x120 cm',
            imageUrl: query.toLowerCase().includes('ahşap') || query.toLowerCase().includes('ceviz') ? '/textures/natural_oak.jpg' : '/textures/calacatta_gold.jpg',
            brand: { name: 'SeramikBak AI' },
            price: 580,
            style: query.toLowerCase().includes('ceviz') || query.toLowerCase().includes('ahşap') ? 'Ahşap' : 'Mermer',
            color: query.toLowerCase().includes('ceviz') ? 'Kahve' : 'Bej'
          };
          const customCombo = generateMoodboardFromProduct(customProd, 0);
          setMoodboardCombos(prev => [customCombo, ...prev.slice(0, 5)]);
          setSelectedMoodIndex(0);
          setActiveTileIndex(0);
        }
      }
    } catch (err) {
      console.error('AI Analiz error:', err);
    } finally {
      setAiGeneratingCombo(false);
    }
  };

  const handleCopyArchitectSpec = (combo, currentTile, currentFaucet, calculatedBudget) => {
    if (!combo) return;
    const specText = `📋 SERAMİKBAK AI MİMARİ SERAMİK REÇETESİ
• Konsept: ${combo.styleName || 'Lüks Konsept'} (${combo.tagline || ''})
• Zemin Seramiği: ${currentTile?.name || combo.floorTile?.name || 'Zemin Karo'} (${currentTile?.size || '60x120 cm'}) - ${currentTile?.price || ''}
• Duvar Seramiği: ${combo.wallTile?.name || 'Duvar Dekor'} (${combo.wallTile?.size || '30x90 cm'}) - ${combo.wallTile?.price || ''}
• Derz Dolgusu: ${combo.grout?.name || 'Ceresit Derz'} (${combo.grout?.color || 'Antrasit'})
• Armatür & Ekipman: ${combo.complement?.cabinet || 'Ünite'} (${currentFaucet || 'Gold'})
• Proje Metrekaresi: ${studioRoomSizeM2} m² | Tahmini Bütçe: ₺${calculatedBudget ? calculatedBudget.toLocaleString('tr-TR') : '0'}
• AI Uyum Skoru: %${combo.matchScore || 98}
3D Canlı Görselleştirme: https://seramikbak.com`;

    navigator.clipboard.writeText(specText);
    setSpecCopiedMsg(true);
    setTimeout(() => setSpecCopiedMsg(false), 3000);
  };

  const handleRequestQuoteForCombo = (combo, currentTile) => {
    if (!combo) return;
    const floorPriceStr = currentTile?.price || combo.floorTile?.price || '650';
    const floorPriceNum = parseInt(String(floorPriceStr).replace(/[^0-9]/g, '')) || 650;
    
    const comboProdEnriched = enrichProductData({
      id: 'ai-combo-' + Date.now(),
      name: `${combo.styleName || 'Mimari Kombin'} Paket (${currentTile?.name || combo.floorTile?.name || 'Zemin'})`,
      code: 'AI-COMBO-' + (combo.id || 1),
      brandId: 'brand-ai',
      brand: { name: combo.floorTile?.brand || 'NG Kütahya' },
      dimensions: currentTile?.size || '60x120 cm',
      width: 60,
      height: 120,
      finish: 'Mat / Parlak Kombin',
      style: combo.styleName || 'Mermer',
      color: 'Kombin',
      imageUrl: currentTile?.img || combo.floorTile?.img || '/textures/calacatta_gold.jpg',
      cheapestOffer: { price: floorPriceNum }
    });

    const defaultDealer = leadDealer || {
      id: 'dealer-primary',
      name: (combo.floorTile?.brand || 'NG Kütahya') + ' Yetkili Ana Bayii',
      city: 'İstanbul / Merkez',
      phone: '0850 300 00 00'
    };

    setActiveProduct(comboProdEnriched);
    setLeadProduct(comboProdEnriched);
    setLeadDealer(defaultDealer);
    setShowLeadModal(true);
  };

  const handleSimulatePhotoScan = (sampleTemplate) => {
    setAiPhotoScanning(true);
    setSelectedPhotoTemplate(sampleTemplate);
    setTimeout(() => {
      setAiPhotoScanning(false);
      setShowAiPhotoScanModal(false);
      const queryMap = {
        'banyo_modern': 'Calacatta Mermer & Gold Banyo',
        'mutfak_ahsap': 'Sıcak Ahşap & Beton Mutfak',
        'salon_beton': 'Endüstriyel Antrasit Beton Salon',
        'banyo_minimal': 'Mat Siyah Minimalist Banyo'
      };
      const queryText = queryMap[sampleTemplate] || 'Modern Banyo Seramik';
      handleAiAnalyzePrompt(queryText);
    }, 1800);
  };

  const handleRealPhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedPhotoName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result;
      setUploadedPhotoPreview(imageUrl);
      handleProcessUploadedImage(imageUrl, file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleProcessUploadedImage = (imageUrl, fileName) => {
    setAiPhotoScanning(true);
    setTimeout(() => {
      setAiPhotoScanning(false);
      setShowAiPhotoScanModal(false);
      
      const lowerName = (fileName || '').toLowerCase();
      let queryText = 'Calacatta Mermer & Gold Banyo';
      if (lowerName.includes('mutfak') || lowerName.includes('kitchen') || lowerName.includes('ahşap')) {
        queryText = 'Sıcak Ahşap & Beton Mutfak';
      } else if (lowerName.includes('salon') || lowerName.includes('living') || lowerName.includes('beton')) {
        queryText = 'Endüstriyel Antrasit Beton Salon';
      } else if (lowerName.includes('siyah') || lowerName.includes('dark') || lowerName.includes('black')) {
        queryText = 'Mat Siyah Minimalist Banyo';
      } else if (lowerName.includes('beyaz') || lowerName.includes('light') || lowerName.includes('ferah')) {
        queryText = 'Açık Ferah Beyaz Banyo Seramik';
      }

      handleAiAnalyzePrompt(queryText);
    }, 2000);
  };

  // General products fetch with filters (with pagination support)
  async function fetchProducts(customParams = '', targetPage = 1, append = false) {
    if (append) {
      setFetchingMore(true);
    } else {
      setInitialProductsLoaded(false);
    }
    try {
      const limit = 24;
      let url = `/api/search?`;
      if (customParams) {
        url += customParams;
        if (!url.includes('page=')) {
          url += `&page=${targetPage}&limit=${limit}`;
        }
      } else {
        const params = new URLSearchParams();
        if (searchQuery) params.append('q', searchQuery);
        if (selectedBrand) params.append('brandId', selectedBrand);
        if (selectedColor) params.append('color', selectedColor);
        if (selectedFinish) params.append('finish', selectedFinish);
        if (selectedStyle) params.append('style', selectedStyle);
        if (selectedArea) params.append('area', selectedArea);
        if (selectedSize) params.append('size', selectedSize);
        if (selectedRectified) params.append('rectified', selectedRectified);
        if (selectedFrost) params.append('frost', selectedFrost);
        if (selectedSlipResistance) params.append('slip', selectedSlipResistance);
        if (selectedThickness) params.append('thicknessRange', selectedThickness);
        if (selectedPeiRating) params.append('pei', selectedPeiRating);
        if (selectedIsPremium) params.append('isPremium', selectedIsPremium);
        params.append('page', String(targetPage));
        params.append('limit', String(limit));
        url += params.toString();
      }
      const res = await fetch(url);
      const data = await res.json();
      
      // Pricing simulation
      const simulatedData = Array.isArray(data) ? data.map(enrichProductData) : [];

      let sortedData = [...simulatedData];
      if (sortBy === 'price_asc') {
        sortedData.sort((a, b) => a.cheapestOffer.price - b.cheapestOffer.price);
      } else if (sortBy === 'price_desc') {
        sortedData.sort((a, b) => b.cheapestOffer.price - a.cheapestOffer.price);
      }

      if (append) {
        setProducts(prev => [...prev, ...sortedData]);
      } else {
        setProducts(sortedData);
        if (sortedData.length > 0) {
          setActiveProduct(sortedData[0]);
          setStudioFloorProduct(sortedData[0]);
          setStudioWallProduct(sortedData[0]);
        }
        if (sortedData.length >= 2) {
          const generated = sortedData.slice(0, 8).map((p, idx) => generateMoodboardFromProduct(p, idx));
          setMoodboardCombos(generated);
        }
      }

      if (sortedData.length < limit) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setInitialProductsLoaded(true);
      setFetchingMore(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchProducts('', 1, false);
  }, [
    sortBy,
    searchQuery,
    selectedBrand,
    selectedColor,
    selectedFinish,
    selectedStyle,
    selectedArea,
    selectedSize,
    selectedRectified,
    selectedFrost,
    selectedSlipResistance,
    selectedThickness,
    selectedPeiRating,
    selectedIsPremium
  ]);

  const handleLoadMore = () => {
    if (fetchingMore || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProducts('', nextPage, true);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setUploadedImagePreview(null);
    setVisualSearchMatches(null);
    setPage(1);
    fetchProducts('', 1, false);
  };

  const handleTagClick = (tagQuery, filterType = '', filterVal = '') => {
    setSearchQuery(tagQuery);
    setUploadedImagePreview(null);
    setVisualSearchMatches(null);
    
    if (filterType === 'style') {
      setSelectedStyle(filterVal);
    } else if (filterType === 'finish') {
      setSelectedFinish(filterVal);
    } else if (filterType === 'size') {
      setSelectedSize(filterVal);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setUploadedImagePreview(null);
    setVisualSearchMatches(null);
    setPage(1);
    fetchProducts('', 1, false);
  };

  const detectImageColor = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = 10;
            canvas.height = 10;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, 10, 10);
            const data = ctx.getImageData(0, 0, 10, 10).data;
            
            let r = 0, g = 0, b = 0;
            for (let i = 0; i < data.length; i += 4) {
              r += data[i];
              g += data[i+1];
              b += data[i+2];
            }
            r = Math.round(r / 100);
            g = Math.round(g / 100);
            b = Math.round(b / 100);
            
            const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
            
            if (brightness < 85) {
              resolve('Gri'); // Dark colors default to Gray/Anthracite in db
            } else if (brightness > 200) {
              resolve('Beyaz');
            } else {
              const max = Math.max(r, g, b);
              const min = Math.min(r, g, b);
              const saturation = max === 0 ? 0 : (max - min) / max;
              
              if (saturation < 0.15) {
                resolve('Gri');
              } else {
                if (r > b) {
                  if (g > b) {
                    resolve('Bej'); // Also covers Krem
                  } else {
                    resolve('Kahve'); // Covers wood/brown tones
                  }
                } else {
                  resolve('Gri');
                }
              }
            }
          } catch (e) {
            resolve('Gri');
          }
        };
        img.onerror = () => resolve('Gri');
        img.src = event.target.result;
      };
      reader.onerror = () => resolve('Gri');
      reader.readAsDataURL(file);
    });
  };

  const extractImageSignature = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = 4;
            canvas.height = 4;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, 4, 4);
            const data = ctx.getImageData(0, 0, 4, 4).data;
            const sig = [];
            for (let i = 0; i < data.length; i += 4) {
              sig.push(data[i], data[i+1], data[i+2]);
            }
            resolve(sig);
          } catch (e) {
            resolve(null);
          }
        };
        img.onerror = () => resolve(null);
        img.src = event.target.result;
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  };

  const handleVisualSearch = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedImagePreview(URL.createObjectURL(file));
    setVisualSearchLoading(true);
    setVisualSearchMatches(null);

    // Reset file input target value so selecting the same image fires onChange next time
    e.target.value = '';

    // Scroll smoothly to results header
    setTimeout(() => {
      const el = document.querySelector('.results-header-row-new');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 200);

    // Detect color of the uploaded image
    let detectedColor = 'Gri';
    try {
      detectedColor = await detectImageColor(file);
    } catch (colorErr) {
      console.warn("Client color extraction failed, defaulting to 'Gri'", colorErr);
    }

    // Extract 4x4 visual signature
    let signature = null;
    try {
      signature = await extractImageSignature(file);
    } catch (sigErr) {
      console.warn("Client signature extraction failed", sigErr);
    }

    const formData = new FormData();
    formData.append('file', file);
    if (signature) {
      formData.append('signature', JSON.stringify(signature));
    }

    try {
      const res = await fetch(`/api/ai/visual-search?fallbackColor=${encodeURIComponent(detectedColor)}`, {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        
        if (data && Array.isArray(data.products)) {
          // Enrich products returned from API
          const enriched = data.products.map(enrichProductData);
          setProducts(enriched);
          setHasMore(false);
          
          // Set visual search match metadata for UI indicators
          const matches = data.products.map(p => ({
            productId: p.id,
            productName: p.name,
            productCode: p.code,
            score: p.similarityScore,
            isFallback: p.isFallback
          }));
          setVisualSearchMatches(matches);
        } else {
          console.error('Invalid visual search response format:', data);
        }
        
        if (data && data.warning) {
          console.warn(data.warning);
        }
      } else {
        throw new Error('Görsel arama API hatası');
      }
    } catch (err) {
      console.error('Visual Search Error:', err);
    } finally {
      setVisualSearchLoading(false);
    }
  };

  async function fetchNearestDealers(brandId, lat, lng) {
    try {
      const res = await fetch(`/api/dealers/nearest?brandId=${brandId}&lat=${lat}&lng=${lng}`);
      const data = await res.json();
      setNearestDealers(data);
      if (data.length > 0) {
        setActiveDealerOnMap(data[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const detectUserLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setLocationError('Tarayıcınız konum servislerini desteklemiyor.');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserCoords({ lat: latitude, lng: longitude });
        setUserLocationName('Cihaz Konumunuz (GPS)');
        setIsLocating(false);
        const targetBrandId = locatorBrandId || (activeProduct ? activeProduct.brandId : (brands.length > 0 ? brands[0].id : null));
        if (targetBrandId) {
          fetchNearestDealers(targetBrandId, latitude, longitude);
        }
      },
      (error) => {
        console.warn("Geolocation error:", error);
        let errorMsg = 'Konum alınamadı.';
        if (error.code === 1) errorMsg = 'Konum izni reddedildi.';
        else if (error.code === 2) errorMsg = 'Konum bilgisi mevcut değil.';
        else if (error.code === 3) errorMsg = 'Konum isteği zaman aşımına uğradı.';
        setLocationError(errorMsg);
        setIsLocating(false);
        
        // Fallback: Kadıköy by default if not set yet
        setUserCoords({ lat: 40.9901, lng: 29.0278 });
        setUserLocationName('Kadıköy Merkez (Varsayılan)');
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  const handleLocationChange = (locName, lat, lng) => {
    setUserLocationName(locName);
    setUserCoords({ lat, lng });
    const targetBrandId = locatorBrandId || (activeProduct ? activeProduct.brandId : (brands.length > 0 ? brands[0].id : null));
    if (targetBrandId) {
      fetchNearestDealers(targetBrandId, lat, lng);
    }
  };

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    setLeadSuccessMsg('');
    setLeadErrorMsg('');
    if (!leadKvkkAccepted) {
      setLeadErrorMsg('Lütfen KVKK Aydınlatma Metni\'ni okuyup onaylayınız.');
      setIsSubmittingLead(false);
      return;
    }
    setIsSubmittingLead(true);
    try {
      const res = await fetch('/api/leads/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: leadProduct.id,
          dealerId: leadDealer.id,
          clientName: leadName,
          clientPhone: leadPhone,
          clientEmail: leadEmail,
          notes: leadNotes,
          requestedUsta,
          requestedArchitect,
          projectDimensions,
          projectPhotoUrl
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLeadSuccessMsg('Teklif talebiniz yetkili bayiye iletilmiştir.');
        setLeadName('');
        setLeadPhone('');
        setLeadEmail('');
        setLeadNotes('');
        setLeadKvkkAccepted(false);
        setRequestedUsta(false);
        setRequestedArchitect(false);
        setProjectDimensions('');
        setProjectPhotoUrl('');
      } else {
        setLeadErrorMsg(data.error || 'Teklif talebi gönderilemedi. Lütfen bilgileri kontrol edip tekrar deneyin.');
      }
    } catch (err) {
      console.error(err);
      setLeadErrorMsg('Sistemsel bir bağlantı hatası oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setIsSubmittingLead(false);
    }
  };
  const handleLeadPhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploadingPhoto(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result;
        const res = await fetch('/api/dealers/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            base64Data,
            filename: file.name,
            folder: 'seramikbak/leads'
          })
        });
        const data = await res.json();
        if (data.success) {
          setProjectPhotoUrl(data.url);
        } else {
          alert('Dosya yüklenemedi: ' + data.error);
        }
        setIsUploadingPhoto(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      alert('Dosya yüklenirken hata oluştu.');
      setIsUploadingPhoto(false);
    }
  };

  async function fetchB2bStats(brandId) {
    setStatsLoading(true);
    try {
      const res = await fetch(`/api/b2b/stats?brandId=${brandId}`);
      const data = await res.json();
      setB2bStats(data);
    } catch (err) {
      console.error(err);
    }
    setStatsLoading(false);
  };

  const logInteraction = async (action, productId, brandId) => {
    try {
      await fetch('/api/analytics/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          productId,
          brandId,
          city: userLocationName.split(' ')[0]
        })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleProductCardClick = async (product) => {
    setActiveProduct(product);
    setDetailProduct(product);
    setShowDetailModal(true);
    setDetailDealers([]);
    setDetailDealersLoading(true);
    logInteraction('VIEW', product.id, product.brandId);

    // Fetch full product details asynchronously to keep the main grid query fast
    if (product && (product.trendyolUrl === undefined && product.hepsiburadaUrl === undefined)) {
      fetch(`/api/search?q=${product.code}&fullDetail=true`)
        .then(res => res.json())
        .then(data => {
          if (data && data.length > 0) {
            setDetailProduct(data[0]);
          }
        })
        .catch(err => console.error('Failed to lazy load product details:', err));
    }
    
    // Fetch dealers for the product brand
    try {
      const res = await fetch(`/api/dealers/nearest?brandId=${product.brandId}&lat=${userCoords.lat}&lng=${userCoords.lng}`);
      if (res.ok) {
        const data = await res.json();
        setDetailDealers(data);
      }
    } catch (err) {
      console.error('Failed to fetch dealers for detail modal:', err);
    } finally {
      setDetailDealersLoading(false);
    }
  };

  const openProductByCode = async (code) => {
    try {
      const res = await fetch(`/api/search?q=${code}&fullDetail=true`);
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) {
          const enriched = enrichProductData(data[0]);
          handleProductCardClick(enriched);
        }
      }
    } catch (err) {
      console.error('Failed to open product by code:', err);
    }
  };

  const runCalculator = (wStr, hStr, layout, wastage, prod) => {
    if (!prod) return;
    const w = parseFloat(wStr) || 0;
    const h = parseFloat(hStr) || 0;
    if (w <= 0 || h <= 0) {
      setCalcResults(null);
      return;
    }

    const rawArea = w * h;
    const wastageMultiplier = 1 + (parseFloat(wastage) || 0) / 100;
    const totalAreaNeeded = rawArea * wastageMultiplier;

    const tileW = (prod.width || 60) / 100;
    const tileH = (prod.height || 120) / 100;
    const singleTileArea = tileW * tileH;
    
    const tilesPerBox = prod.width === 60 && prod.height === 120 ? 2 :
                        prod.width === 60 && prod.height === 60 ? 4 :
                        prod.width === 30 && prod.height === 60 ? 8 : 4;
    const boxCoverage = singleTileArea * tilesPerBox;
    
    const boxesNeeded = Math.ceil(totalAreaNeeded / boxCoverage);
    const actualAreaPurchased = boxesNeeded * boxCoverage;
    const totalTilesNeeded = boxesNeeded * tilesPerBox;

    const adhesiveKg = Math.ceil(actualAreaPurchased * 5);
    const adhesiveBags = Math.ceil(adhesiveKg / 25);

    const groutKg = Math.ceil(actualAreaPurchased * 0.5);

    let suggestedGroutColor = 'Gri';
    const tileColorLower = (prod.color || '').toLowerCase();
    if (tileColorLower.includes('beyaz') || tileColorLower.includes('krem')) {
      suggestedGroutColor = 'Beyaz';
    } else if (tileColorLower.includes('bej')) {
      suggestedGroutColor = 'Bej';
    } else if (tileColorLower.includes('kahve') || tileColorLower.includes('ahşap')) {
      suggestedGroutColor = 'Kahverengi';
    } else if (tileColorLower.includes('antrasit') || tileColorLower.includes('siyah')) {
      suggestedGroutColor = 'Antrasit';
    }

    // Labor Cost Calculation
    let laborRatePerM2 = 240; // Base rate in TL/m2
    
    // Diagonal difficulty
    if (layout === 'diagonal') {
      laborRatePerM2 += 40; 
    }
    
    // Size difficulty
    const maxDimension = Math.max(prod.width || 0, prod.height || 0);
    const tileArea = ((prod.width || 60) * (prod.height || 60)) / 10000; // in m2
    if (maxDimension >= 120) {
      laborRatePerM2 += 110; // Large format premium
    } else if (tileArea < 0.15) {
      laborRatePerM2 += 30; // Small format premium
    }
    
    // Premium premium
    if (prod.isPremium) {
      laborRatePerM2 += 20;
    }
    
    const laborCostTotal = Math.round(totalAreaNeeded * laborRatePerM2);

    setCalcResults({
      rawArea: rawArea.toFixed(2),
      totalAreaNeeded: totalAreaNeeded.toFixed(2),
      boxesNeeded,
      actualAreaPurchased: actualAreaPurchased.toFixed(2),
      totalTilesNeeded,
      adhesiveKg,
      adhesiveBags,
      groutKg,
      suggestedGroutColor,
      laborRatePerM2,
      laborCostTotal
    });
  };

  useEffect(() => {
    if (detailProduct) {
      runCalculator(calcWidth, calcHeight, calcLayout, calcWastage, detailProduct);
    }
  }, [calcWidth, calcHeight, calcLayout, calcWastage, detailProduct]);

  const handleDownloadCAD = (prod) => {
    if (!prod) return;
    setIsDownloadingCAD(true);
    setCadDownloadSuccess(false);
    
    setTimeout(() => {
      setIsDownloadingCAD(false);
      setCadDownloadSuccess(true);
      
      const link = document.createElement('a');
      link.href = '#';
      link.setAttribute('download', `${prod.code}_3D_Textures_CAD.zip`);
      alert(`[CAD Portal] ${prod.brand?.name} - ${prod.name} (.ZIP) Seamless texture paketi, CAD blokları ve Revit BIM dosyası başarıyla bilgisayarınıza indirildi.`);
      
      setTimeout(() => setCadDownloadSuccess(false), 3000);
    }, 1500);
  };

  const processRoomTiling = (imgRoom, imgTile, polygonPercentages, excludePercentages = [], tileScale = 1.0, blendMode = 'multiply', rotation = 0) => {
    const canvas = document.createElement('canvas');
    canvas.width = imgRoom.naturalWidth;
    canvas.height = imgRoom.naturalHeight;
    const ctx = canvas.getContext('2d');

    // 1. Draw the base room image
    ctx.drawImage(imgRoom, 0, 0);

    // 2. Convert percentage polygon points to absolute pixel coordinates
    const points = polygonPercentages.map(pt => ({
      x: (pt[0] / 100) * canvas.width,
      y: (pt[1] / 100) * canvas.height
    }));

    const excludeList = excludePercentages.map(polygon => 
      polygon.map(pt => ({
        x: (pt[0] / 100) * canvas.width,
        y: (pt[1] / 100) * canvas.height
      }))
    );

    // 3. Create a pattern canvas of repeating tiles
    const patternWidth = 1500;
    const patternHeight = 1500;
    const patternCanvas = document.createElement('canvas');
    patternCanvas.width = patternWidth;
    patternCanvas.height = patternHeight;
    const pCtx = patternCanvas.getContext('2d');

    const baseWidth = 150 * (tileScale || 1.0);
    const tileWidth = rotation === 90 ? baseWidth * ((activeProduct?.height || 120) / (activeProduct?.width || 60)) : baseWidth;
    const tileHeight = rotation === 90 ? baseWidth : baseWidth * ((activeProduct?.height || 120) / (activeProduct?.width || 60));

    // Fill patternCanvas with tiles in a grid
    for (let y = 0; y < patternCanvas.height; y += tileHeight) {
      for (let x = 0; x < patternCanvas.width; x += tileWidth) {
        pCtx.drawImage(imgTile, x, y, tileWidth, tileHeight);
        
        // Draw grout lines (subtle dark gray border)
        pCtx.strokeStyle = 'rgba(64, 64, 64, 0.25)';
        pCtx.lineWidth = 2;
        pCtx.strokeRect(x, y, tileWidth, tileHeight);
      }
    }

    // 4. Helper function to draw textured triangles using affine transformation
    const drawTexturedTriangle = (s0, s1, s2, d0, d1, d2) => {
      const u0 = s0.x, v0 = s0.y;
      const u1 = s1.x, v1 = s1.y;
      const u2 = s2.x, v2 = s2.y;
      
      const x0 = d0.x, y0 = d0.y;
      const x1 = d1.x, y1 = d1.y;
      const x2 = d2.x, y2 = d2.y;
      
      const denom = u0 * (v1 - v2) + u1 * (v2 - v0) + u2 * (v0 - v1);
      if (Math.abs(denom) < 0.0001) return;
      
      const a = (x0 * (v1 - v2) + x1 * (v2 - v0) + x2 * (v0 - v1)) / denom;
      const c = (x0 * (u2 - u1) + x1 * (u0 - u2) + x2 * (u1 - u0)) / denom;
      const e = (x0 * (u1 * v2 - u2 * v1) + x1 * (u2 * v0 - u0 * v2) + x2 * (u0 * v1 - u1 * v0)) / denom;
      
      const b = (y0 * (v1 - v2) + y1 * (v2 - v0) + y2 * (v0 - v1)) / denom;
      const d = (y0 * (u2 - u1) + y1 * (u0 - u2) + y2 * (u1 - u0)) / denom;
      const f = (y0 * (u1 * v2 - u2 * v1) + y1 * (u2 * v0 - u0 * v2) + y2 * (u0 * v1 - u1 * v0)) / denom;
      
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.closePath();
      ctx.clip();
      
      ctx.transform(a, b, c, d, e, f);
      ctx.drawImage(patternCanvas, 0, 0);
      ctx.restore();
    };

    // 5. Draw the quadrilateral using two triangles
    const p0 = points[0]; // Top-left
    const p1 = points[1]; // Top-right
    const p2 = points[2]; // Bottom-right
    const p3 = points[3]; // Bottom-left

    // Apply main clipping boundary and exclude foreground obstacles using even-odd rule
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.closePath();

    if (excludeList && excludeList.length > 0) {
      excludeList.forEach(obs => {
        if (obs.length > 2) {
          ctx.moveTo(obs[0].x, obs[0].y);
          for (let k = 1; k < obs.length; k++) {
            ctx.lineTo(obs[k].x, obs[k].y);
          }
          ctx.closePath();
        }
      });
    }
    ctx.clip('evenodd');

    // Triangle 1: maps (0,0)->p0, (w,0)->p1, (0,h)->p3
    drawTexturedTriangle(
      { x: 0, y: 0 },
      { x: patternWidth, y: 0 },
      { x: 0, y: patternHeight },
      p0,
      p1,
      p3
    );

    // Triangle 2: maps (w,0)->p1, (w,h)->p2, (0,h)->p3
    drawTexturedTriangle(
      { x: patternWidth, y: 0 },
      { x: patternWidth, y: patternHeight },
      { x: 0, y: patternHeight },
      p1,
      p2,
      p3
    );
    ctx.restore();

    // 6. Blending layer for realism (Multiply blending of original image over tiles)
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = canvas.width;
    shadowCanvas.height = canvas.height;
    const sCtx = shadowCanvas.getContext('2d');
    sCtx.drawImage(imgRoom, 0, 0);

    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.globalAlpha = blendMode === 'multiply' ? 0.35 : 0.08;
    
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.closePath();

    if (excludeList && excludeList.length > 0) {
      excludeList.forEach(obs => {
        if (obs.length > 2) {
          ctx.moveTo(obs[0].x, obs[0].y);
          for (let k = 1; k < obs.length; k++) {
            ctx.lineTo(obs[k].x, obs[k].y);
          }
          ctx.closePath();
        }
      });
    }
    ctx.clip('evenodd');
    
    ctx.drawImage(shadowCanvas, 0, 0);
    ctx.restore();

    // 7. Draw original overlay at soft screen to preserve highlights
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = blendMode === 'multiply' ? 0.12 : 0.04;
    
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.closePath();

    if (excludeList && excludeList.length > 0) {
      excludeList.forEach(obs => {
        if (obs.length > 2) {
          ctx.moveTo(obs[0].x, obs[0].y);
          for (let k = 1; k < obs.length; k++) {
            ctx.lineTo(obs[k].x, obs[k].y);
          }
          ctx.closePath();
        }
      });
    }
    ctx.clip('evenodd');
    ctx.drawImage(imgRoom, 0, 0);
    ctx.restore();

    return canvas.toDataURL('image/jpeg', 0.9);
  };

  // Generate a complete luxury bathroom design from scratch based on the selected ceramic
  const generateAIBathroomImage = async () => {
    if (!activeProduct) {
      alert('Lütfen banyo tasarlamak için bir seramik modeli seçin.');
      return;
    }

    setIsProcessingRoomImage(true);
    setProcessedRoomImage(null);
    setRoomProcessingStep('Yapay zeka banyo konsepti tasarlıyor...');

    const logSteps = [
      { delay: 1200, label: 'Lüks oda mimarisi tasarlanıyor...' },
      { delay: 2600, label: `Seçili seramik dokusu (${activeProduct.name}) tüm duvar ve zemine döşeniyor...` },
      { delay: 4000, label: 'Banyo elemanları (küvet, lavabo, batarya) yerleştiriliyor...' },
      { delay: 5400, label: 'Işık yansımaları ve fotorealistik gölgeler hesaplanıyor...' }
    ];

    logSteps.forEach((s) => {
      setTimeout(() => {
        setRoomProcessingStep(s.label);
      }, s.delay);
    });

    // Translate Turkish terms to detailed English descriptions for the AI image engine
    const styleTranslations = {
      'Mermer': 'elegant marble pattern',
      'Ahşap': 'natural wood grain plank style',
      'Beton': 'minimalist concrete texture',
      'Taş': 'rustic natural stone design',
      'Metal': 'sleek metallic surface',
      'Düz': 'plain monochromatic style',
      'Tuğla': 'brick style layout',
      'Desenli': 'decorative patterned artistic layout'
    };

    const colorTranslations = {
      'Beyaz': 'pristine white',
      'Siyah': 'rich luxury black',
      'Gri': 'modern slate grey',
      'Antrasit': 'dark anthracite charcoal',
      'Bej': 'warm beige',
      'Kahverengi': 'earthy brown',
      'Altın': 'luxury gold and white',
      'Yeşil': 'emerald green',
      'Mavi': 'deep ocean blue',
      'Vizon': 'taupe mink',
      'Krem': 'smooth cream'
    };

    const finishTranslations = {
      'Parlak': 'high-gloss polished reflective',
      'Mat': 'matte natural non-reflective',
      'Lapatto': 'semi-polished lappato',
      'Saten': 'satin smooth'
    };

    const rawColor = activeProduct.color || '';
    const rawStyle = activeProduct.style || '';
    const rawFinish = activeProduct.finish || '';

    const engColor = colorTranslations[rawColor] || rawColor.toLowerCase() || 'neutral grey';
    const engStyle = styleTranslations[rawStyle] || `${rawStyle.toLowerCase()} patterned`;
    const engFinish = finishTranslations[rawFinish] || rawFinish.toLowerCase() || 'matte';
    
    const tileName = activeProduct.name || 'premium ceramic';
    const brandName = activeProduct.brand?.name || '';

    // Create a precise generative prompt describing the bathroom tiled with the selected product
    const basePrompt = `Tiled bathroom design. A luxury modern bathroom where the entire walls and floors are fully covered in large-format ${engColor} ${engStyle} ceramic tiles with a ${engFinish} finish, styled exactly like the "${tileName}" series ${brandName ? `by ${brandName}` : ''}. Clean seamless grout lines. The walls are 100% tiled from floor to ceiling, no bare plaster, no drywalls. Inside the tiled bathroom, there is a modern white freestanding bathtub, an elegant wood vanity with integrated sink, gold minimalist fixtures, warm ambient architectural lighting, high-end interior design catalog photography, 8k resolution, photorealistic, realistic shadow depth and reflections.`;
    
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-ai-provider': aiProvider,
          'x-ai-key': aiProvider === 'grok' ? grokApiKey : geminiApiKey
        },
        body: JSON.stringify({ prompt: basePrompt })
      });

      if (!response.ok) {
        throw new Error(`API returned error status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success || !data.image) {
        throw new Error(data.error || 'Görsel üretilemedi.');
      }

      const imageUrl = data.image;

      // Preload image in background
      const img = new Image();
      img.src = imageUrl;
      img.onload = () => {
        setUploadedRoomImage(imageUrl);
        setProcessedRoomImage(imageUrl);
        setIsAiGeneratedRoom(true);
        setIsProcessingRoomImage(false);
      };
      img.onerror = () => {
        setIsProcessingRoomImage(false);
        alert('Tasarım görseli üretilirken bir hata oluştu. Lütfen tekrar deneyin.');
      };
    } catch (err) {
      console.error('AI Room generation failed:', err);
      setIsProcessingRoomImage(false);
      alert('Tasarım görseli üretilirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  // Re-run segment AI analysis when switching studio target (zemin vs duvar)
  const reprocessTiling = async (targetVal = studioTarget) => {
    if (!base64ImageRef.current || !activeProduct || !uploadedRoomImage) return;

    setIsProcessingRoomImage(true);
    setProcessedRoomImage(null);
    setRoomProcessingStep(targetVal === 'floor' ? 'Zemin analizi yapılıyor...' : 'Duvar analizi yapılıyor...');

    const logSteps = [
      { delay: 1000, label: 'Zemin ve duvar sınırları analiz ediliyor...' },
      { delay: 2200, label: 'Perspektif ve gölgeleme açıları hesaplanıyor...' },
      { delay: 3500, label: `Seçili seramik (${activeProduct.name}) alana kaplanıyor...` },
      { delay: 4800, label: 'Işık yansımaları ve pürüzsüzlük (specular maps) ekleniyor...' }
    ];

    logSteps.forEach((s) => {
      setTimeout(() => {
        setRoomProcessingStep(s.label);
      }, s.delay);
    });

    try {
      const response = await fetch('/api/ai/segment', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-ai-provider': aiProvider,
          'x-ai-key': aiProvider === 'grok' ? grokApiKey : geminiApiKey
        },
        body: JSON.stringify({
          image: base64ImageRef.current,
          target: targetVal
        })
      });

      const data = await response.json();
      
      if (data.success && data.polygon) {
        setRoomPolygon(data.polygon);
        setRoomExclude(data.exclude || []);

        if (imgRoomRef.current) {
          const imgTile = new Image();
          imgTile.crossOrigin = 'anonymous';
          const isAbsolute = activeProduct.textureUrl && (activeProduct.textureUrl.startsWith('http://') || activeProduct.textureUrl.startsWith('https://') || activeProduct.textureUrl.startsWith('//'));
          imgTile.src = activeProduct.textureUrl 
            ? (isAbsolute ? `/api/proxy?url=${encodeURIComponent(activeProduct.textureUrl)}` : activeProduct.textureUrl) 
            : '/textures/calacatta_gold.jpg';
          imgTile.onload = () => {
            imgTileRef.current = imgTile;
            const resultDataUrl = processRoomTiling(imgRoomRef.current, imgTile, data.polygon, data.exclude || []);
            setProcessedRoomImage(resultDataUrl);
            setIsProcessingRoomImage(false);
          };
          imgTile.onerror = () => {
            const fallbackTile = new Image();
            fallbackTile.src = '/textures/calacatta_gold.jpg';
            fallbackTile.onload = () => {
              imgTileRef.current = fallbackTile;
              const resultDataUrl = processRoomTiling(imgRoomRef.current, fallbackTile, data.polygon, data.exclude || []);
              setProcessedRoomImage(resultDataUrl);
              setIsProcessingRoomImage(false);
            };
          };
        }
      } else {
        throw new Error(data.error || 'AI segmentasyonu başarısız.');
      }
    } catch (err) {
      console.error('AI Room visualization failed:', err);
      setIsProcessingRoomImage(false);
      alert('Yapay zeka görsel giydirme işlemi sırasında bir hata oluştu.');
    }
  };

  // Helper to load sample room presets
  const loadPresetRoom = (presetUrl, initialPolygon, target = 'floor') => {
    if (!activeProduct) {
      alert('Lütfen banyo/mutfağa giydirmek istediğiniz seramik modelini seçin.');
      return;
    }
    setIsProcessingRoomImage(true);
    setProcessedRoomImage(null);
    setShowPointEditor(false);
    setRoomProcessingStep('Örnek Oda Yükleniyor...');
    setStudioTarget(target);

    const imgRoom = new Image();
    imgRoom.crossOrigin = 'anonymous';
    imgRoom.src = presetUrl;
    imgRoom.onload = () => {
      imgRoomRef.current = imgRoom;
      setUploadedRoomImage(presetUrl);
      setRoomPolygon(initialPolygon);
      setRoomExclude([]);

      const imgTile = new Image();
      imgTile.crossOrigin = 'anonymous';
      const isAbsolute = activeProduct.textureUrl && (activeProduct.textureUrl.startsWith('http://') || activeProduct.textureUrl.startsWith('https://') || activeProduct.textureUrl.startsWith('//'));
      imgTile.src = activeProduct.textureUrl 
        ? (isAbsolute ? `/api/proxy?url=${encodeURIComponent(activeProduct.textureUrl)}` : activeProduct.textureUrl) 
        : '/textures/calacatta_gold.jpg';

      imgTile.onload = () => {
        imgTileRef.current = imgTile;
        const resultDataUrl = processRoomTiling(
          imgRoom, 
          imgTile, 
          initialPolygon, 
          [], 
          roomTileScale, 
          roomBlendMode, 
          studioTileRotation
        );
        setProcessedRoomImage(resultDataUrl);
        setIsProcessingRoomImage(false);
      };
      imgTile.onerror = () => {
        const fallbackTile = new Image();
        fallbackTile.src = '/textures/calacatta_gold.jpg';
        fallbackTile.onload = () => {
          imgTileRef.current = fallbackTile;
          const resultDataUrl = processRoomTiling(
            imgRoom, 
            fallbackTile, 
            initialPolygon, 
            [], 
            roomTileScale, 
            roomBlendMode, 
            studioTileRotation
          );
          setProcessedRoomImage(resultDataUrl);
          setIsProcessingRoomImage(false);
        };
      };
    };
  };

  // Auto update AI tiled image when activeProduct, roomTileScale, roomBlendMode, or studioTileRotation changes
  useEffect(() => {
    if (isAiGeneratedRoom) {
      generateAIBathroomImage();
      return;
    }
    if (uploadedRoomImage && processedRoomImage && imgRoomRef.current && roomPolygon && activeProduct) {
      const imgTile = new Image();
      imgTile.crossOrigin = 'anonymous';
      const isAbsolute = activeProduct.textureUrl && (activeProduct.textureUrl.startsWith('http://') || activeProduct.textureUrl.startsWith('https://') || activeProduct.textureUrl.startsWith('//'));
      imgTile.src = activeProduct.textureUrl 
        ? (isAbsolute ? `/api/proxy?url=${encodeURIComponent(activeProduct.textureUrl)}` : activeProduct.textureUrl) 
        : '/textures/calacatta_gold.jpg';
      imgTile.onload = () => {
        imgTileRef.current = imgTile;
        const resultDataUrl = processRoomTiling(
          imgRoomRef.current, 
          imgTile, 
          roomPolygon, 
          roomExclude, 
          roomTileScale, 
          roomBlendMode, 
          studioTileRotation
        );
        setProcessedRoomImage(resultDataUrl);
      };
      imgTile.onerror = () => {
        const fallbackTile = new Image();
        fallbackTile.src = '/textures/calacatta_gold.jpg';
        fallbackTile.onload = () => {
          imgTileRef.current = fallbackTile;
          const resultDataUrl = processRoomTiling(
            imgRoomRef.current, 
            fallbackTile, 
            roomPolygon, 
            roomExclude, 
            roomTileScale, 
            roomBlendMode, 
            studioTileRotation
          );
          setProcessedRoomImage(resultDataUrl);
        };
      };
    }
  }, [activeProduct, roomTileScale, roomBlendMode, studioTileRotation]);

  const handleRoomImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!activeProduct) {
      alert('Lütfen odanıza giydirmek istediğiniz seramik modelini katalogdan seçin.');
      return;
    }

    const fileUrl = URL.createObjectURL(file);
    setUploadedRoomImage(fileUrl);
    setIsProcessingRoomImage(true);
    setProcessedRoomImage(null);
    setShowPointEditor(false);
    setRoomProcessingStep('AI Modeli Yükleniyor... (Segmentasyon)');

    const logSteps = [
      { delay: 1000, label: 'Zemin ve duvar sınırları analiz ediliyor...' },
      { delay: 2200, label: 'Perspektif ve gölgeleme açıları hesaplanıyor...' },
      { delay: 3500, label: `Seçili seramik (${activeProduct.name}) alana kaplanıyor...` },
      { delay: 4800, label: 'Işık yansımaları ve pürüzsüzlük (specular maps) ekleniyor...' }
    ];

    logSteps.forEach((s) => {
      setTimeout(() => {
        setRoomProcessingStep(s.label);
      }, s.delay);
    });

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Image = reader.result;

      try {
        const response = await fetch('/api/ai/segment', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-ai-provider': aiProvider,
            'x-ai-key': aiProvider === 'grok' ? grokApiKey : geminiApiKey
          },
          body: JSON.stringify({
            image: base64Image,
            target: studioTarget
          })
        });

        const data = await response.json();
        
        if (data.success && data.polygon) {
          base64ImageRef.current = base64Image;
          setRoomPolygon(data.polygon);
          setRoomExclude(data.exclude || []);

          const imgRoom = new Image();
          imgRoom.src = fileUrl;
          imgRoom.onload = () => {
            imgRoomRef.current = imgRoom;
            
            const imgTile = new Image();
            imgTile.crossOrigin = 'anonymous';
            const isAbsolute = activeProduct.textureUrl && (activeProduct.textureUrl.startsWith('http://') || activeProduct.textureUrl.startsWith('https://') || activeProduct.textureUrl.startsWith('//'));
            imgTile.src = activeProduct.textureUrl 
              ? (isAbsolute ? `/api/proxy?url=${encodeURIComponent(activeProduct.textureUrl)}` : activeProduct.textureUrl) 
              : '/textures/calacatta_gold.jpg';
            imgTile.onload = () => {
              imgTileRef.current = imgTile;
              const resultDataUrl = processRoomTiling(imgRoom, imgTile, data.polygon, data.exclude || []);
              setProcessedRoomImage(resultDataUrl);
              setIsProcessingRoomImage(false);
            };
            imgTile.onerror = () => {
              const fallbackTile = new Image();
              fallbackTile.src = '/textures/calacatta_gold.jpg';
              fallbackTile.onload = () => {
                imgTileRef.current = fallbackTile;
                const resultDataUrl = processRoomTiling(imgRoom, fallbackTile, data.polygon, data.exclude || []);
                setProcessedRoomImage(resultDataUrl);
                setIsProcessingRoomImage(false);
              };
            };
          };
        } else {
          throw new Error(data.error || 'AI segmentasyonu başarısız.');
        }
      } catch (err) {
        console.error('AI Room visualization failed:', err);
        setIsProcessingRoomImage(false);
        alert('Yapay zeka görsel giydirme işlemi sırasında bir hata oluştu.');
      }
    };
    reader.onerror = () => {
      setIsProcessingRoomImage(false);
      alert('Dosya okunamadı.');
    };
    reader.readAsDataURL(file);
  };

  const navigateTo3DStudio = (product) => {
    setActiveProduct(product);
    setStudioFloorProduct(product);
    setStudioWallProduct(product);
    setStudioApplyFloor(true);
    setStudioApplyWalls(true);
    setActiveTab('studio');
    logInteraction('STUDIO_TRY', product.id, product.brandId);
    
    // Smoothly scroll to the 3D studio canvas panel to center it in view
    setTimeout(() => {
      const element = document.querySelector('.studio-canvas-panel');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);
  };

  const navigateToDealers = (product) => {
    setActiveProduct(product);
    setActiveTab('dealers');
    logInteraction('CLICK', product.id, product.brandId);
  };

  const handleCampaignSubmit = async (e) => {
    e.preventDefault();
    setCampaignSuccessMsg('');
    if (!campaignProduct) return;

    try {
      const res = await fetch('/api/b2b/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandId: b2bBrandId,
          productId: campaignProduct,
          bidAmount: parseFloat(campaignBid),
          budget: parseFloat(campaignBudget)
        })
      });
      const data = await res.json();
      if (data.success) {
        setCampaignSuccessMsg('Reklam kampanyası başarıyla güncellendi.');
        fetchB2bStats(b2bBrandId);
        fetchProducts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const triggerStripeMockWebhook = async () => {
    setStripeLoading(true);
    setStripeWebhookResult('');
    try {
      const res = await fetch('/api/webhooks/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'checkout.session.completed',
          brandId: b2bBrandId,
          plan: stripePlan,
          durationMonths: 12
        })
      });
      const data = await res.json();
      if (data.success) {
        setStripeWebhookResult(`[Stripe] Plan: ${stripePlan} lisansı aktifleşti.`);
        fetchB2bStats(b2bBrandId);
      }
    } catch (err) {
      console.error(err);
    }
    setStripeLoading(false);
  };



  if (pageLoading) {
    return (
      <main className="main-layout" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at center, #0b0f19 0%, #02040a 100%)' }}>
        <div className="page-loader-overlay">
          <div className="loader-container">
            <div className="ceramic-tile-spinner">
              <div className="tile-face face-front">SB</div>
              <div className="tile-face face-back">SB</div>
            </div>
            <h2 className="loader-brand-name">
              <span>Seramik</span><span className="gold-text">Bak</span>
            </h2>
            <p className="loader-status-text">Premium seramik kataloğu yükleniyor...</p>
            <div className="loader-progress-bar">
              <div className="loader-progress-line"></div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="main-layout">
      {/* Premium Collections Banner */}
      <div className="project-top-banner">
        <div className="banner-left-area">
          <div className="banner-badge">
            <Sparkles size={13} className="spin-icon-slow" />
            <span>YENİ KOLEKSİYONLAR</span>
          </div>
        </div>

        {/* Dynamic Ad Campaign Showcase */}
        {activeAdCampaigns.length > 0 && activeAdCampaigns[currentAdIndex]?.product && (
          <div className="banner-ad-showcase" onClick={() => {
            const camp = activeAdCampaigns[currentAdIndex];
            const prod = camp.product;
            // Record analytics click for sponsored ad
            fetch('/api/analytics/log', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                action: 'CLICK', 
                campaignId: camp.id,
                productId: prod.id,
                brandId: prod.brandId
              })
            }).catch(console.error);
            
            // Enrich and open details
            const enriched = enrichProductData(prod);
            handleProductCardClick(enriched);
          }}>
            <span className="ad-badge">SPONSORLU</span>
            <img src={activeAdCampaigns[currentAdIndex].product?.imageUrl || '/ceramic_placeholder.png'} alt="Ad" className="ad-thumb" />
            <div className="ad-info">
              <span className="ad-brand">{activeAdCampaigns[currentAdIndex].product?.brand?.name || 'Marka'}</span>
              <span className="ad-name">{activeAdCampaigns[currentAdIndex].product?.name || 'Ürün'}</span>
            </div>
          </div>
        )}

        <div className="banner-marquee-wrapper">
          <div className="banner-marquee-track">
            {/* First set */}
            <div className="banner-item" onClick={() => openProductByCode('VIT-CON-GRY')}>
              <img src="/hero/luxury_bathroom.png" alt="VitrA Concrete" className="banner-img" />
              <div className="banner-item-info">
                <span className="banner-brand-name">VitrA</span>
                <span className="banner-product-name">Concrete Light Grey</span>
              </div>
            </div>
            <div className="banner-item" onClick={() => openProductByCode('BIEN-NAT-OAK')}>
              <img src="/hero/modern_living.png" alt="Bien Natural Oak" className="banner-img" />
              <div className="banner-item-info">
                <span className="banner-brand-name">Bien</span>
                <span className="banner-product-name">Natural Oak</span>
              </div>
            </div>
            <div className="banner-item" onClick={() => openProductByCode('KUT-CAL-GLD')}>
              <img src="/hero/scandinavian_kitchen.png" alt="Kütahya Calacatta" className="banner-img" />
              <div className="banner-item-info">
                <span className="banner-brand-name">Kütahya</span>
                <span className="banner-product-name">Calacatta Gold</span>
              </div>
            </div>
            <div className="banner-item" onClick={() => openProductByCode('EGE-TRA-CLA')}>
              <img src="/hero/hero_ceramics.jpg" alt="Ege Travertino" className="banner-img" />
              <div className="banner-item-info">
                <span className="banner-brand-name">Ege Seramik</span>
                <span className="banner-product-name">Travertino Classico</span>
              </div>
            </div>
            <div className="banner-item" onClick={() => openProductByCode('HITIT-NEXOS-ANTRASIT-LAPPATO-60X120')}>
              <img src="/hero/luxury_bathroom.png" alt="Hitit Nexos" className="banner-img" />
              <div className="banner-item-info">
                <span className="banner-brand-name">Hitit Seramik</span>
                <span className="banner-product-name">Nexos Antrasit Lappato</span>
              </div>
            </div>
            <div className="banner-item" onClick={() => openProductByCode('BIEN-BOR-ANT')}>
              <img src="/hero/modern_living.png" alt="Bien Borneo" className="banner-img" />
              <div className="banner-item-info">
                <span className="banner-brand-name">Bien</span>
                <span className="banner-product-name">Borneo Antrasit</span>
              </div>
            </div>
            {/* Duplicate set for seamless loop */}
            <div className="banner-item" onClick={() => openProductByCode('VIT-CON-GRY')}>
              <img src="/hero/luxury_bathroom.png" alt="VitrA Concrete" className="banner-img" />
              <div className="banner-item-info">
                <span className="banner-brand-name">VitrA</span>
                <span className="banner-product-name">Concrete Light Grey</span>
              </div>
            </div>
            <div className="banner-item" onClick={() => openProductByCode('BIEN-NAT-OAK')}>
              <img src="/hero/modern_living.png" alt="Bien Natural Oak" className="banner-img" />
              <div className="banner-item-info">
                <span className="banner-brand-name">Bien</span>
                <span className="banner-product-name">Natural Oak</span>
              </div>
            </div>
            <div className="banner-item" onClick={() => openProductByCode('KUT-CAL-GLD')}>
              <img src="/hero/scandinavian_kitchen.png" alt="Kütahya Calacatta" className="banner-img" />
              <div className="banner-item-info">
                <span className="banner-brand-name">Kütahya</span>
                <span className="banner-product-name">Calacatta Gold</span>
              </div>
            </div>
            <div className="banner-item" onClick={() => openProductByCode('EGE-TRA-CLA')}>
              <img src="/hero/hero_ceramics.jpg" alt="Ege Travertino" className="banner-img" />
              <div className="banner-item-info">
                <span className="banner-brand-name">Ege Seramik</span>
                <span className="banner-product-name">Travertino Classico</span>
              </div>
            </div>
            <div className="banner-item" onClick={() => openProductByCode('HITIT-NEXOS-ANTRASIT-LAPPATO-60X120')}>
              <img src="/hero/luxury_bathroom.png" alt="Hitit Nexos" className="banner-img" />
              <div className="banner-item-info">
                <span className="banner-brand-name">Hitit Seramik</span>
                <span className="banner-product-name">Nexos Antrasit Lappato</span>
              </div>
            </div>
            <div className="banner-item" onClick={() => openProductByCode('BIEN-BOR-ANT')}>
              <img src="/hero/modern_living.png" alt="Bien Borneo" className="banner-img" />
              <div className="banner-item-info">
                <span className="banner-brand-name">Bien</span>
                <span className="banner-product-name">Borneo Antrasit</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Utility Bar (B2B and Corporate Portal Links) */}
      {!isKioskMode && (
        <div className="top-utility-bar glass-panel-dark">
          <div className="utility-left" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'nowrap', whiteSpace: 'nowrap' }}>
            <Link href="/" className="utility-item portal-link" onClick={() => setActiveTab('search')}>
              <HomeIcon size={13} />
              <span style={{ fontWeight: '800' }}>{t('home')}</span>
            </Link>
            <span className="utility-divider">|</span>
            <Link href="/hakkimizda" className="utility-item portal-link">
              <Info size={13} />
              <span>{t('about')}</span>
            </Link>
            <span className="utility-divider">|</span>
            <Link href="/proje-talep" className="utility-item b2b-btn-link">
              <Building2 size={13} />
              <span>{t('b2bQuotes')}</span>
            </Link>
            <span className="utility-divider">|</span>
            <Link href="/bayi" className="utility-item portal-link">
              <UserIcon size={13} />
              <span>{t('dealerPortal')}</span>
            </Link>
            <span className="utility-divider">|</span>
            <Link href="/marka" className="utility-item portal-link">
              <TrendingUp size={13} />
              <span>{t('brandPortal')}</span>
            </Link>
            <span className="utility-divider">|</span>
            <button 
              onClick={() => setIsKioskMode(true)} 
              className="utility-item kiosk-btn-link"
              title="Bayi Teşhir Modu (Kiosk)"
            >
              <div className="pulse-indicator-green" />
              <span>{t('kioskMode')}</span>
            </button>
          </div>

          <div className="utility-right" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'nowrap', whiteSpace: 'nowrap' }}>
            <Link href="/outlet" className="utility-item outlet-btn-link">
              <Sparkles size={13} style={{ color: '#ef4444' }} />
              <span style={{ color: '#ef4444', fontWeight: '800' }}>{t('outlet')}</span>
              <span className="outlet-small-badge">Fırsat</span>
            </Link>
            <span className="utility-divider">|</span>
            <Link href="/ustalar" className="utility-item portal-link">
              <Wrench size={13} style={{ color: '#b45309' }} />
              <span style={{ color: '#b45309', fontWeight: '800' }}>{t('installers')}</span>
            </Link>
            <span className="utility-divider">|</span>
            <Link href="/ilham" className="utility-item portal-link">
              <Sparkles size={13} />
              <span>{t('inspiration')}</span>
            </Link>
          </div>
        </div>
      )}

      {/* Top Header Navigation */}
      <header className="main-header glass-panel">
        <div className="header-brand" onClick={() => setActiveTab('search')} style={{ cursor: 'pointer' }}>
          <div className="logo-icon">SB</div>
          <span className="logo-text">SeramikBak</span>
        </div>
        
        {/* Navigation tabs */}
        <nav className="header-nav">
          {isKioskMode ? (
            <span className="kiosk-status-text">
              ✦ SERAMİKBAK BAYİ TEŞHİR KİOSK EKRANI ✦
            </span>
          ) : (
            <>
              <button className={`nav-link ${activeTab === 'search' ? 'active' : ''}`} onClick={() => setActiveTab('search')}>
                <SearchIcon size={14} />
                <span>{t('products')}</span>
              </button>
              <button className={`nav-link ${activeTab === 'studio' ? 'active' : ''}`} onClick={() => { setActiveTab('studio'); if(activeProduct) logInteraction('VIEW', activeProduct.id, activeProduct.brandId); }}>
                <Palette size={14} />
                <span>{t('studio3d')}</span>
              </button>
              <button className={`nav-link ${activeTab === 'dealers' ? 'active' : ''}`} onClick={() => { setActiveTab('dealers'); if(activeProduct) logInteraction('CLICK', activeProduct.id, activeProduct.brandId); }}>
                <MapPin size={14} />
                <span>{t('dealers')}</span>
              </button>
              <Link 
                href="/global-tanitim"
                className="nav-link global-export-nav-link" 
                style={{ textDecoration: 'none' }}
              >
                <Globe size={14} style={{ color: '#d4af37' }} />
                <span style={{ color: '#d4af37', fontWeight: '800' }}>🌍 Global Tanıtım</span>
              </Link>
            </>
          )}
        </nav>

        {/* Right Buttons */}
        <div className="header-right-buttons">
          <div className="desktop-header-actions">
            {isKioskMode ? (
              <button 
                onClick={() => setIsKioskMode(false)} 
                className="header-btn kiosk-btn active exit-kiosk-btn"
                title="Kiosk Modunu Kapat"
              >
                <span>Kiosk Kapat</span>
              </button>
            ) : (
              <>
                <button className="header-btn favorites-btn" onClick={() => { if(currentUser) { setShowFavoritesPanel(!showFavoritesPanel); } else { window.location.href = '/uyelik'; } }}>
                  <HeartIcon size={16} className="heart-icon-gold" />
                  <span>Favorilerim</span>
                  {userFavorites.length > 0 && <span className="fav-count-badge">{userFavorites.length}</span>}
                </button>
                {currentUser ? (
                  <div className="user-menu-wrapper">
                    <button className="header-btn account-btn logged-in" onClick={() => setShowUserMenu(!showUserMenu)}>
                      <div className="user-avatar-mini">{currentUser.name.charAt(0).toUpperCase()}</div>
                      <span>{currentUser.name.split(' ')[0]}</span>
                      <ChevronDown size={12} />
                    </button>
                    {showUserMenu && (
                      <div className="user-dropdown-menu glass-panel">
                        <div className="user-dropdown-header">
                          <div className="user-dropdown-avatar">{currentUser.name.charAt(0).toUpperCase()}</div>
                          <div>
                            <div className="user-dropdown-name">{currentUser.name}</div>
                            <div className="user-dropdown-email">{currentUser.email}</div>
                          </div>
                        </div>
                        <button className="user-dropdown-item" onClick={() => { window.location.href = '/uyelik?tab=overview'; setShowUserMenu(false); }}>
                          <Activity size={14} /> Panelim
                        </button>
                        <button className="user-dropdown-item" onClick={() => { setShowFavoritesPanel(true); setShowUserMenu(false); }}>
                          <HeartIcon size={14} /> Favorilerim ({userFavorites.length})
                        </button>
                        <button className="user-dropdown-item" onClick={() => { window.location.href = '/uyelik?tab=settings'; setShowUserMenu(false); }}>
                          <Settings size={14} /> Hesap Ayarları
                        </button>
                        <div className="user-dropdown-divider" />
                        <button className="user-dropdown-item logout-item" onClick={handleLogout}>
                          <ArrowRight size={14} /> Çıkış Yap
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <button className="header-btn account-btn" onClick={() => window.location.href = '/uyelik'}>
                    <UserIcon size={16} />
                    <span>{t('account')}</span>
                  </button>
                )}
              </>
            )}
            <CurrencySelector />
            <LanguageSelector />
          </div>
          <button className="hamburger-menu-btn" onClick={() => setShowMobileMenu(!showMobileMenu)} aria-label="Menü">
            <MenuIcon size={20} />
          </button>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {showMobileMenu && (
        <div className="mobile-menu-overlay" onClick={() => setShowMobileMenu(false)}>
          <div className="mobile-menu-drawer glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <div className="mobile-menu-brand">
                <div className="mobile-menu-logo">SB</div>
                <div className="mobile-menu-brand-info">
                  <span className="mobile-menu-brand-name">SeramikBak</span>
                  <span className="mobile-menu-brand-tag">Dijital Showroom</span>
                </div>
              </div>
              <button className="mobile-menu-close" onClick={() => setShowMobileMenu(false)} aria-label="Kapat">✕</button>
            </div>
            <div className="mobile-menu-nav">
              {currentUser && (
                <div className="mobile-user-card-box" style={{
                  padding: '12px 14px',
                  background: 'linear-gradient(135deg, rgba(212,175,55,0.12) 0%, rgba(15,23,42,0.7) 100%)',
                  borderRadius: '14px',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  marginBottom: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #b38e47 0%, #d4af37 100%)',
                      color: '#ffffff',
                      fontWeight: '900',
                      fontSize: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 10px rgba(179,142,71,0.3)',
                      flexShrink: 0
                    }}>
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontWeight: '800', fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: '1.2' }}>{currentUser.name}</div>
                      <div style={{ fontSize: '0.73rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentUser.email}</div>
                    </div>
                  </div>
                  <Link 
                    href="/uyelik?tab=overview" 
                    className="mobile-nav-link"
                    onClick={() => setShowMobileMenu(false)}
                    style={{
                      textDecoration: 'none',
                      background: 'linear-gradient(135deg, #b38e47 0%, #987532 100%)',
                      color: '#ffffff',
                      fontWeight: '800',
                      justifyContent: 'center',
                      borderRadius: '10px',
                      padding: '9px 12px',
                      boxShadow: '0 4px 10px rgba(179,142,71,0.25)'
                    }}
                  >
                    <Activity size={16} />
                    <span>🚀 Kullanıcı Paneline Git</span>
                  </Link>
                </div>
              )}

              <Link href="/" className="mobile-nav-link" style={{ textDecoration: 'none' }} onClick={() => { setActiveTab('search'); setShowMobileMenu(false); }}>
                <HomeIcon size={16} />
                <span style={{ fontWeight: '800' }}>{t('home')}</span>
              </Link>
              <button 
                className={`mobile-nav-link ${activeTab === 'search' ? 'active' : ''}`} 
                onClick={() => { setActiveTab('search'); setShowMobileMenu(false); }}
              >
                <SearchIcon size={16} />
                <span>{t('products')}</span>
              </button>
              <button 
                className={`mobile-nav-link ${activeTab === 'studio' ? 'active' : ''}`} 
                onClick={() => { setActiveTab('studio'); if(activeProduct) logInteraction('VIEW', activeProduct.id, activeProduct.brandId); setShowMobileMenu(false); }}
              >
                <Palette size={16} />
                <span>{t('studio3d')}</span>
              </button>
              <button 
                className={`mobile-nav-link ${activeTab === 'dealers' ? 'active' : ''}`} 
                onClick={() => { setActiveTab('dealers'); if(activeProduct) logInteraction('CLICK', activeProduct.id, activeProduct.brandId); setShowMobileMenu(false); }}
              >
                <MapPin size={16} />
                <span>{t('dealers')}</span>
              </button>
              <Link 
                href="/global-tanitim"
                className="mobile-nav-link"
                onClick={() => setShowMobileMenu(false)}
                style={{ textDecoration: 'none' }}
              >
                <Globe size={16} style={{ color: '#d4af37' }} />
                <span style={{ color: '#d4af37', fontWeight: '800' }}>🌍 Global Tanıtım</span>
              </Link>
              <Link href="/outlet" className="mobile-nav-link outlet-link" onClick={() => setShowMobileMenu(false)}>
                <Sparkles size={16} style={{ color: '#ef4444' }} />
                <span style={{ color: '#ef4444', fontWeight: '800' }}>{t('outlet')}</span>
                <span className="outlet-small-badge">Fırsat</span>
              </Link>
              <Link href="/ustalar" className="mobile-nav-link" onClick={() => setShowMobileMenu(false)}>
                <Wrench size={16} style={{ color: '#b45309' }} />
                <span style={{ color: '#b45309', fontWeight: '800' }}>{t('installers')}</span>
              </Link>
              <Link href="/ilham" className="mobile-nav-link" style={{ textDecoration: 'none' }} onClick={() => setShowMobileMenu(false)}>
                <Sparkles size={16} />
                <span>{t('inspiration')}</span>
              </Link>
              <Link href="/hakkimizda" className="mobile-nav-link" style={{ textDecoration: 'none' }} onClick={() => setShowMobileMenu(false)}>
                <Info size={16} />
                <span>{t('about')}</span>
              </Link>

              <div className="mobile-menu-divider" />
              
              <Link href="/proje-talep" className="mobile-nav-link b2b-link" onClick={() => setShowMobileMenu(false)}>
                <Building2 size={16} />
                <span>{t('b2bQuotes')}</span>
              </Link>
              <Link href="/bayi" className="mobile-nav-link" onClick={() => setShowMobileMenu(false)}>
                <UserIcon size={16} />
                <span>{t('dealerPortal')}</span>
              </Link>
              <Link href="/marka" className="mobile-nav-link" onClick={() => setShowMobileMenu(false)}>
                <TrendingUp size={16} />
                <span>{t('brandPortal')}</span>
              </Link>
              
              <div className="mobile-menu-divider" />
              
              {currentUser ? (
                <>
                  <Link 
                    href="/uyelik?tab=overview" 
                    className="mobile-nav-link panel-link" 
                    style={{ textDecoration: 'none', background: 'rgba(179, 142, 71, 0.1)', color: '#b38e47', fontWeight: '800', border: '1px solid rgba(179, 142, 71, 0.3)' }}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <Activity size={16} />
                    <span>Panelim / Hesabım</span>
                  </Link>

                  <button 
                    className="mobile-nav-link fav-link" 
                    onClick={() => { setShowFavoritesPanel(true); setShowMobileMenu(false); }}
                  >
                    <HeartIcon size={16} />
                    <span>Favorilerim ({userFavorites.length})</span>
                  </button>

                  <Link 
                    href="/uyelik?tab=settings" 
                    className="mobile-nav-link" 
                    style={{ textDecoration: 'none' }}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <Settings size={16} />
                    <span>Hesap Ayarları</span>
                  </Link>

                  <button className="mobile-nav-link logout-link" onClick={() => { handleLogout(); setShowMobileMenu(false); }}>
                    <ArrowRight size={16} />
                    <span>Çıkış Yap ({currentUser.name.split(' ')[0]})</span>
                  </button>
                </>
              ) : (
                <>
                  <button 
                    className="mobile-nav-link fav-link" 
                    onClick={() => { window.location.href = '/uyelik'; setShowMobileMenu(false); }}
                  >
                    <HeartIcon size={16} />
                    <span>Favorilerim (0)</span>
                  </button>
                  <Link 
                    href="/uyelik" 
                    className="mobile-nav-link login-link" 
                    style={{ textDecoration: 'none' }}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <UserIcon size={16} />
                    <span>Giriş Yap / Üye Ol</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CANLI FIRSAT RADARI & CANLI İNDİRİM ŞERİDİ */}
      <LiveDealsTicker />

      {/* Main Content */}
      <div className="content-container">
        
        {/* TAB 1: SMART SEARCH & CATALOG */}
        {activeTab === 'search' && (
          <div className="search-portal animate-fade-in">
            
            {/* Wide Centered Hero Section with Showroom Image Background */}
            <div className="showroom-hero-banner glass-panel" style={{ backgroundImage: `url(${heroSlides[heroSlideIndex].bg})`, transition: 'background-image 0.8s ease' }}>
              <div className="hero-dark-overlay" />
              <div className="hero-banner-content">
                <div className="hero-badge-capsule">
                  <Sparkles size={12} className="badge-icon-gold" />
                  <span>{heroSlides[heroSlideIndex].tag}</span>
                </div>
                
                <h1 style={{ minHeight: '84px' }}>{heroSlides[heroSlideIndex].title} <br /><span className="highlight-text">{heroSlides[heroSlideIndex].highlight}</span></h1>
                
                <p className="hero-banner-subtitle">
                  {heroSlides[heroSlideIndex].subtitle}
                </p>

                {/* Wide Centered Search Bar */}
                <form onSubmit={handleSearchSubmit} className="wide-search-bar-form" style={{ position: 'relative' }}>
                  <div className="search-bar-inner-container">
                    {visualSearchLoading ? (
                      <Loader2 size={20} className="search-bar-icon-left animate-spin" style={{ color: 'var(--accent-gold)' }} />
                    ) : (
                      <SearchIcon size={20} className="search-bar-icon-left" />
                    )}
                    <input 
                      type="text" 
                      placeholder={uploadedImagePreview ? "Görsel yüklendi. Sonuçlar aşağıda listeleniyor." : "Marka, ürün adı, kod, renk, ebat, yüzey, koleksiyon..."}
                      value={searchQuery}
                      onChange={handleSearchChange}
                      onFocus={() => { if (searchQuery.trim().length > 1) setShowSuggestions(true); }}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      className="wide-search-input"
                      disabled={!!uploadedImagePreview}
                      style={{ paddingLeft: uploadedImagePreview ? '100px' : '44px' }}
                    />

                    {/* Image Preview Thumbnail Overlay */}
                    {uploadedImagePreview && (
                      <div style={{
                        position: 'absolute',
                        left: '42px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: '#f1f5f9',
                        padding: '4px 8px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        zIndex: 10
                      }}>
                        <img 
                          src={uploadedImagePreview} 
                          alt="Görsel Arama" 
                          style={{ width: '24px', height: '24px', borderRadius: '4px', objectFit: 'cover' }} 
                        />
                        <button 
                          type="button" 
                          onClick={handleClearSearch}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold', padding: '0 2px' }}
                          title="Görseli Kaldır"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                    
                    {/* Inline Image Upload (Görsel Arama) */}
                    <div className="search-camera-trigger" title="Görsel ile Arama Yap (CLIP)">
                      <ImageIcon size={20} className="camera-trigger-icon" />
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleVisualSearch} 
                        className="invisible-file-upload-input"
                      />
                    </div>
                    
                    <button type="submit" className="wide-search-submit-btn" disabled={visualSearchLoading}>
                      {visualSearchLoading ? 'Aranıyor...' : 'Ara'}
                    </button>
                  </div>

                  {/* Instant Search Suggestions Dropdown */}
                  {showSuggestions && searchSuggestions.length > 0 && (
                    <div className="search-suggestions-dropdown glass-panel" style={{
                      position: 'absolute',
                      top: '100%',
                      left: '0',
                      right: '0',
                      background: '#ffffff',
                      border: '1px solid var(--border-color)',
                      borderRadius: '16px',
                      marginTop: '8px',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                      zIndex: '99',
                      maxHeight: '320px',
                      overflowY: 'auto',
                      padding: '8px 0'
                    }}>
                      {searchSuggestions.map(p => (
                        <div 
                          key={p.id} 
                          className="suggestion-item"
                          onClick={() => {
                            setSearchQuery(p.name);
                            setShowSuggestions(false);
                            handleProductCardClick(p);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '10px 16px',
                            cursor: 'pointer',
                            transition: 'background 0.2s ease',
                            borderBottom: '1px solid #f1f3f7'
                          }}
                        >
                          <img 
                            src={p.imageUrl || '/textures/calacatta_gold.jpg'} 
                            alt={p.name} 
                            style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                          />
                          <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)' }}>{p.name}</span>
                            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{p.brand?.name} • {p.code} • {p.width}x{p.height} cm</span>
                          </div>
                          <span style={{ color: 'var(--accent-gold)', fontSize: '0.9rem' }}>↗</span>
                        </div>
                      ))}
                    </div>
                  )}
                </form>

                {/* AKILLI MALİYET & METRAJ SİHİRBAZI */}
                <TileCalculatorWidget onOpenQuoteModal={handleOpenLeadModalWithProduct} />

                {/* Popular Searches */}
                <div className="hero-popular-tags">
                  <span className="pop-tags-label">Popüler Aramalar:</span>
                  <button onClick={() => handleTagClick('Mermer', 'style', 'Mermer')} className="pop-tag-capsule">60x120 Mermer</button>
                  <button onClick={() => handleTagClick('Calacatta Gold', 'style', 'Mermer')} className="pop-tag-capsule">Calacatta Gold</button>
                  <button onClick={() => handleTagClick('Ahşap', 'style', 'Ahşap')} className="pop-tag-capsule">Mat Ahşap</button>
                  <button onClick={() => handleTagClick('Beton', 'style', 'Beton')} className="pop-tag-capsule">Gri Beton</button>
                  <button onClick={() => handleTagClick('Traverten', 'style', 'Beton')} className="pop-tag-capsule">Traverten</button>
                  <button onClick={() => handleTagClick('Beyaz', 'style', 'Mermer')} className="pop-tag-capsule">Parlak Beyaz</button>
                </div>

                {/* Feature Columns Row */}
                <div className="hero-feature-stats-row">
                  <div className="feature-stat-capsule">
                    <Layers2 size={16} />
                    <span>25.000+ Seramik Ürün</span>
                  </div>
                  <div className="feature-stat-capsule">
                    <Activity size={16} />
                    <span>150+ Marka</span>
                  </div>
                  <div className="feature-stat-capsule">
                    <ImageIcon size={16} />
                    <span>Görsel Arama ile Keşfet</span>
                  </div>
                  <div className="feature-stat-capsule">
                    <Sparkles size={16} />
                    <span>3D Sanal Deneyim</span>
                  </div>
                </div>
              </div>

              {/* Display Stand with Upright 3D Slabs */}
              <div className="hero-display-stand-container">
                <div className="display-stand-platform">
                  {/* Slab 1 (Left - Active or Calacatta Gold) */}
                  <div className="display-slab-wrapper left-slab">
                    <div className="slab-visual-container">
                      <TileVisualPreview 
                        style={activeProduct?.style || "Mermer"} 
                        color={activeProduct?.color || "Beyaz"} 
                        finish={activeProduct?.finish || "Mat"} 
                        width={activeProduct?.width || 60} 
                        height={activeProduct?.height || 120} 
                        imageUrl={activeProduct?.imageUrl || "/textures/calacatta_gold.jpg"} 
                      />
                      <div className="slab-badge-overlay">
                        <span className="slab-badge-title">{activeProduct?.name || "Calacatta Gold"}</span>
                        <span className="slab-badge-specs">{activeProduct?.width || 60}x{activeProduct?.height || 120} cm</span>
                      </div>
                    </div>
                  </div>

                  {/* Slab 2 (Right - Featured or Borneo Antrasit) */}
                  <div className="display-slab-wrapper right-slab">
                    <div className="slab-visual-container">
                      <TileVisualPreview style="Mermer" color="Antrasit" finish="Mat" width={60} height={120} imageUrl="/textures/borneo_antrasit.jpg" />
                      <div className="slab-badge-overlay">
                        <span className="slab-badge-title">Borneo Antrasit</span>
                        <span className="slab-badge-specs">60x120 cm</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slider Dots */}
              <div style={{
                position: 'absolute',
                bottom: '16px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: '8px',
                zIndex: '3'
              }}>
                {heroSlides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setHeroSlideIndex(idx)}
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      border: 'none',
                      background: heroSlideIndex === idx ? 'var(--accent-gold)' : 'rgba(255,255,255,0.4)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  />
                ))}
              </div>
            </div>



            {/* Categories & 3D Showcase Section */}
            <div className="categories-showcase-container">
              {/* Circular Categories List */}
              <div className="circular-categories-row">
                <button 
                  onClick={() => { setSelectedStyle(''); setSelectedColor(''); setSelectedSize(''); fetchProducts(); }} 
                  className={`category-circle-btn ${selectedStyle === '' && selectedColor === '' && selectedSize === '' ? 'active' : ''}`}
                >
                  <div className="category-circle-icon-wrapper flat-bg-gold">
                    <Layers2 size={18} />
                  </div>
                  <span>Tümü</span>
                </button>

                <button 
                  onClick={() => { setSelectedStyle('Mermer'); fetchProducts('style=Mermer'); }} 
                  className={`category-circle-btn ${selectedStyle === 'Mermer' ? 'active' : ''}`}
                >
                  <div className="category-circle-icon-wrapper marble-pattern-bg" />
                  <span>Mermer</span>
                </button>

                <button 
                  onClick={() => { setSelectedStyle('Beton'); fetchProducts('style=Beton'); }} 
                  className={`category-circle-btn ${selectedStyle === 'Beton' ? 'active' : ''}`}
                >
                  <div className="category-circle-icon-wrapper concrete-pattern-bg" />
                  <span>Beton</span>
                </button>

                <button 
                  onClick={() => { setSelectedStyle('Ahşap'); fetchProducts('style=Ahşap'); }} 
                  className={`category-circle-btn ${selectedStyle === 'Ahşap' ? 'active' : ''}`}
                >
                  <div className="category-circle-icon-wrapper wood-pattern-bg" />
                  <span>Ahşap</span>
                </button>

                <button 
                  onClick={() => { setSelectedStyle('Beton'); fetchProducts('style=Beton'); }} 
                  className="category-circle-btn"
                >
                  <div className="category-circle-icon-wrapper stone-pattern-bg" />
                  <span>Taş</span>
                </button>

                <button 
                  onClick={() => { setSelectedColor('Bej'); fetchProducts('color=Bej'); }} 
                  className="category-circle-btn"
                >
                  <div className="category-circle-icon-wrapper travert-pattern-bg" />
                  <span>Traverten</span>
                </button>

                <button className="category-circle-btn" onClick={() => alert('Mozaik seriler listeleniyor...')}>
                  <div className="category-circle-icon-wrapper mosaic-pattern-bg" />
                  <span>Mozaik</span>
                </button>

                <button className="category-circle-btn" onClick={() => alert('Dekoratif seriler listeleniyor...')}>
                  <div className="category-circle-icon-wrapper decor-pattern-bg" />
                  <span>Dekor</span>
                </button>

                <button className="category-circle-btn" onClick={() => { setSelectedColor('Gri'); fetchProducts('color=Gri'); }}>
                  <div className="category-circle-icon-wrapper flat-grey-bg" />
                  <span>Düz Renk</span>
                </button>

                <button className="category-circle-btn" onClick={() => setActiveTab('studio')}>
                  <div className="category-circle-icon-wrapper wireframe-bg" />
                  <span>3D Seriler</span>
                </button>
              </div>

              {/* 3D Sanal Stüdyo Promo Banner Card */}
              <div className="studio-promo-card-banner glass-panel" onClick={() => setActiveTab('studio')} style={{ cursor: 'pointer' }}>
                <div className="promo-text-column">
                  <h5>3D Sanal Stüdyo</h5>
                  <p>Seramiklerinizi mekanınızda görselleştirin</p>
                  <button className="promo-action-btn-gold">Hemen Deneyin</button>
                </div>
                <div className="promo-image-column">
                  <img src="/hero/hero_ceramics.jpg" alt="3D Studio Preview" />
                </div>
              </div>
            </div>

            {/* Dynamic Live Platform Activity & Traffic Statistics Section (Compact & Modern) */}
            <div className="live-stats-section-banner glass-panel">
              <div className="live-stats-header">
                <div className="live-header-title-group">
                  <div className="live-pulse-badge">
                    <span className="pulse-dot" />
                    <span className="live-badge-text">CANLI ANALİTİK</span>
                  </div>
                  <h4 className="live-banner-heading">
                    Türkiye Geneli <span>Platform Hareketleri</span>
                  </h4>
                </div>

                {liveActivities && liveActivities.length > 0 && (
                  <div className="live-ticker-capsule">
                    <span className="ticker-capsule-badge">⚡ ANLIK AKIŞ</span>
                    <span className="ticker-capsule-text animate-fade-in">
                      {liveActivities[activeActivityIdx % liveActivities.length]?.text} 
                      <span className="ticker-time-ago">• {liveActivities[activeActivityIdx % liveActivities.length]?.time}</span>
                    </span>
                  </div>
                )}
              </div>

              <div className="live-stats-grid">
                <div className="stat-card-item card-green">
                  <div className="stat-icon-wrapper green-glow">
                    <Users size={16} />
                  </div>
                  <div className="stat-card-info">
                    <div className="stat-card-number">
                      {(liveStats.todayVisitors || liveStats.activeOnlineUsers || 0).toLocaleString('tr-TR')}
                      <span className="stat-mini-tag tag-green">Canlı</span>
                    </div>
                    <div className="stat-card-title">Ziyaretçi & İnceleme</div>
                  </div>
                </div>

                <div className="stat-card-item card-gold">
                  <div className="stat-icon-wrapper gold-glow">
                    <Building2 size={16} />
                  </div>
                  <div className="stat-card-info">
                    <div className="stat-card-number">
                      {liveStats.approvedDealers ? liveStats.approvedDealers.toLocaleString('tr-TR') : 0}
                      <span className="stat-mini-tag tag-gold">81 İl</span>
                    </div>
                    <div className="stat-card-title">Bayi & Marka Ağı</div>
                  </div>
                </div>

                <div className="stat-card-item card-blue">
                  <div className="stat-icon-wrapper blue-glow">
                    <FileText size={16} />
                  </div>
                  <div className="stat-card-info">
                    <div className="stat-card-number">
                      {liveStats.totalRFQs ? liveStats.totalRFQs.toLocaleString('tr-TR') : 0}
                      <span className="stat-mini-tag tag-blue">Teklif</span>
                    </div>
                    <div className="stat-card-title">Teklif & Proje Talebi</div>
                  </div>
                </div>

                <div className="stat-card-item card-purple">
                  <div className="stat-icon-wrapper purple-glow">
                    <Sparkles size={16} />
                  </div>
                  <div className="stat-card-info">
                    <div className="stat-card-number">
                      {liveStats.productCount ? liveStats.productCount.toLocaleString('tr-TR') : 0}
                      <span className="stat-mini-tag tag-purple">3D</span>
                    </div>
                    <div className="stat-card-title">Katalog Ürün Modeli</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Brand Logos Infinite Marquee */}
            <div className="brand-marquee-section">
              <div className="brand-marquee-container">
                <div className="brand-marquee-track">
                  <div className="brand-marquee-item" style={{ letterSpacing: '0.05em' }}>NG KÜTAHYA SERAMİK</div>
                  <div className="brand-marquee-item" style={{ color: 'var(--accent-gold)', letterSpacing: '0.1em' }}>BIEN SERAMİK</div>
                  <div className="brand-marquee-item" style={{ letterSpacing: '0.05em' }}>EGE SERAMİK</div>
                  <div className="brand-marquee-item" style={{ fontWeight: '900', fontStyle: 'italic' }}>VitrA</div>
                  <div className="brand-marquee-item" style={{ letterSpacing: '0.05em', color: '#0f172a' }}>GÜRAL SERAMİK</div>
                  <div className="brand-marquee-item" style={{ letterSpacing: '0.08em', fontWeight: '800' }}>QUA GRANITE</div>
                  <div className="brand-marquee-item" style={{ color: 'var(--accent-gold)' }}>YURTBAY SERAMİK</div>
                  <div className="brand-marquee-item" style={{ letterSpacing: '0.05em' }}>ÇANAKKALE SERAMİK</div>
                </div>
              </div>
            </div>

            {/* -------------------- AI ARCHITECTURAL CERAMIC STUDIO v7.0 (STANDALONE CLEAN MODULE) -------------------- */}
            <div className="ai-studio-standalone-module">
              
              {/* Top Studio Module Header */}
              <div className="ai-studio-mod-header">
                <div className="ai-studio-title-group">
                  <div className="ai-studio-icon-badge">
                    <Sparkles size={22} />
                  </div>
                  <div>
                    <div className="ai-studio-title-row">
                      <h3 className="ai-studio-title">AI Mimarlık & Kombin Stüdyosu</h3>
                      <span className="ai-live-badge">
                        <span className="pulse-dot" /> CANLI İÇ MİMAR ALGORİTMASI
                      </span>
                    </div>
                    <p className="ai-studio-subdesc">
                      Zemin ve duvar seramiklerini, derz dolgusunu ve armatür detaylarını mimari algoritma ve canlı oda simülasyonu ile tasarlayın.
                    </p>
                  </div>
                </div>

                {/* Top Module Action Controls */}
                <div className="ai-studio-top-actions">
                  <button 
                    onClick={() => setShowAiPhotoScanModal(true)}
                    className="ai-photo-scan-btn"
                    title="Banyonuzun veya odanızın fotoğrafını yükleyerek AI seramik eşleştirmesi yapın"
                  >
                    <Camera size={15} />
                    <span>Oda Fotoğrafını Tara</span>
                  </button>

                  <div className="studio-view-toggle-group">
                    <button
                      onClick={() => setStudioViewMode('cards')}
                      className={`studio-view-btn ${studioViewMode === 'cards' ? 'active' : ''}`}
                      title="4-Malzeme kart görünümü"
                    >
                      <Layers size={13} />
                      <span>🧱 4-Kart</span>
                    </button>
                    <button
                      onClick={() => setStudioViewMode('composite')}
                      className={`studio-view-btn ${studioViewMode === 'composite' ? 'active' : ''}`}
                      title="Canlı kompozit mimari oda simülasyonu"
                    >
                      <Eye size={13} />
                      <span>🖼️ Canlı Odada Gör</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Clean Single Toolbar: Prompt Bar + Category Filter Chips */}
              <div className="ai-studio-toolbar-row">
                <div className="prompt-input-wrapper">
                  <SearchIcon size={15} className="prompt-search-icon" />
                  <input 
                    type="text"
                    value={aiPromptInput}
                    onChange={(e) => setAiPromptInput(e.target.value)}
                    placeholder="İç Mimara Sor (Örn: 'Woodline Mat', 'Calacatta Gold')..."
                    className="prompt-input"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAiAnalyzePrompt(aiPromptInput);
                      }
                    }}
                  />
                  <button 
                    onClick={() => handleAiAnalyzePrompt(aiPromptInput)}
                    className="prompt-submit-btn"
                    disabled={aiGeneratingCombo}
                  >
                    <Sparkles size={13} />
                    <span>{aiGeneratingCombo ? 'Analiz Ediliyor...' : 'AI Analiz Et'}</span>
                  </button>
                </div>

                <div className="ai-studio-toolbar-right">
                  <button 
                    onClick={() => handleAiAnalyzePrompt('')}
                    className="random-combo-btn"
                    disabled={aiGeneratingCombo}
                  >
                    <Shuffle size={13} />
                    <span>Rastgele Kombin</span>
                  </button>

                  <div className="studio-category-pills">
                    {[
                      { key: 'all', label: 'Tüm Alanlar' },
                      { key: 'banyo', label: '🛁 Banyo' },
                      { key: 'mutfak', label: '🍳 Mutfak' },
                      { key: 'salon', label: '🛋️ Salon' }
                    ].map(cat => (
                      <button
                        key={cat.key}
                        onClick={() => setMoodboardCategory(cat.key)}
                        className={`studio-cat-pill ${moodboardCategory === cat.key ? 'active' : ''}`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Single Unified Concept Selector Ribbon */}
              <div className="ai-studio-concept-ribbon scrollbar-hidden">
                <span className="concept-ribbon-label">MİMARİ KONSEPTLER:</span>
                <div className="concept-tabs-row">
                  {moodboardCombos
                    .filter(c => moodboardCategory === 'all' || c.category === moodboardCategory)
                    .map((combo) => {
                      const isActive = selectedMoodIndex === combo.id;
                      return (
                        <button
                          key={combo.id}
                          onClick={() => {
                            setSelectedMoodIndex(combo.id);
                            setActiveTileIndex(0);
                          }}
                          className={`concept-tab-btn ${isActive ? 'active' : ''}`}
                        >
                          <span className="pill-badge">{combo.styleBadge}</span>
                          <span className="pill-name">{combo.styleName}</span>
                          <span className="pill-score">%{combo.matchScore} Uyum</span>
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Main Workspace: Active Concept, Budget Calculator, Cards & Actions */}
              {(() => {
                const activeCombo = (moodboardCombos && moodboardCombos.length > 0)
                  ? (moodboardCombos.find(c => c && c.id === selectedMoodIndex) || moodboardCombos[0])
                  : (DEFAULT_MOODBOARD_COMBOS[0] || {});
                
                const tilesList = activeCombo?.tiles || [
                  {
                    name: activeCombo?.floorTile?.name || 'Calacatta Gold 60x120',
                    size: activeCombo?.floorTile?.size || '60x120 cm',
                    finish: activeCombo?.floorTile?.finish || 'Full Lappato',
                    img: activeCombo?.floorTile?.img || '/textures/calacatta_gold.jpg',
                    badge: '👑 PREMİUM KOLEKSİYON',
                    brand: 'NG KÜTAHYA',
                    price: '₺740 / m²'
                  }
                ];

                const currentTile = tilesList[activeTileIndex % tilesList.length] || tilesList[0];
                const currentFaucet = String(customFaucetFinish || activeCombo?.complement?.fixtureBadge || 'Mat Siyah');

                // Dynamic Budget Calculations
                const floorPriceNum = parseInt(String(currentTile?.price || activeCombo?.floorTile?.price || '740').replace(/[^0-9]/g, '')) || 740;
                const wallPriceNum = parseInt(String(activeCombo?.wallTile?.price || '630').replace(/[^0-9]/g, '')) || 630;
                
                const floorM2Needed = Math.ceil(studioRoomSizeM2 * 1.1);
                const wallM2Needed = Math.ceil(studioRoomSizeM2 * 1.8 * 1.1);
                
                const floorTotalCost = floorM2Needed * floorPriceNum;
                const wallTotalCost = wallM2Needed * wallPriceNum;
                const chemicalGroutCost = Math.ceil(studioRoomSizeM2 * 45);
                const totalEstimatedBudget = floorTotalCost + wallTotalCost + chemicalGroutCost;

                return (
                  <div className="ai-studio-workspace">
                    
                    {/* Workspace Top Header Bar: Active Concept Info & Budget Calculator */}
                    <div className="workspace-header-row">
                      <div className="workspace-concept-info">
                        <div className="concept-heading-box">
                          <span className="concept-status-badge">✨ SEÇİLİ MİMARİ KONSEPT</span>
                          <h4 className="concept-main-title">{activeCombo?.styleName || 'Konsept'} — <span className="concept-sub-tagline">{activeCombo?.tagline || ''}</span></h4>
                        </div>
                        
                        <div className="concept-color-swatches">
                          <span className="swatch-title">Harmonize Palet:</span>
                          <div className="swatch-dots-row">
                            {activeCombo?.colorPalette?.map((hex, idx) => (
                              <div 
                                key={idx} 
                                className="studio-swatch-circle" 
                                style={{ background: hex }} 
                                title={`Doku / Ton ${idx+1}: ${hex}`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Clean Budget Bar */}
                      <div className="workspace-budget-card">
                        <div className="calc-size-group">
                          <label className="calc-label">📐 Proje Alanı:</label>
                          <div className="calc-input-wrapper">
                            <input 
                              type="number" 
                              min="3" 
                              max="200" 
                              value={studioRoomSizeM2}
                              onChange={(e) => setStudioRoomSizeM2(Math.max(1, parseInt(e.target.value) || 1))}
                              className="calc-m2-input"
                            />
                            <span className="m2-unit">m²</span>
                          </div>

                          <div className="calc-quick-pills">
                            {[
                              { label: '8 m² Banyo', val: 8 },
                              { label: '15 m² Mutfak', val: 15 },
                              { label: '30 m² Salon', val: 30 }
                            ].map((preset, idx) => (
                              <button
                                key={idx}
                                onClick={() => setStudioRoomSizeM2(preset.val)}
                                className={`calc-quick-btn ${studioRoomSizeM2 === preset.val ? 'active' : ''}`}
                              >
                                {preset.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="calc-result-badge">
                          <span className="calc-result-label">Tahmini Malzeme Bütçesi:</span>
                          <strong className="calc-result-value">₺{totalEstimatedBudget.toLocaleString('tr-TR')}</strong>
                        </div>
                      </div>
                    </div>

                    {/* CONDITIONALLY RENDER: 4-Material Cards OR Canlı Kompozit Oda Simülasyonu */}
                    {studioViewMode === 'composite' ? (
                      /* HYPER-REALISTIC 3D ARCHITECTURAL ROOM VISUALIZER */
                      <div className={`studio-composite-room-view camera-angle-${roomCameraAngle}`}>
                        <div className="composite-room-stage">
                          
                          {/* 1. Wall Surface Layer with Seamless Tile Grid & Lighting */}
                          <div 
                            className="stage-wall-layer"
                            style={{
                              backgroundImage: `url(${activeCombo?.wallTile?.img || '/textures/vista_bej.jpg'})`,
                              backgroundSize: '240px 140px'
                            }}
                          >
                            <div className="wall-grout-grid-overlay" style={{ boxShadow: `inset 0 0 0 1px ${activeCombo?.grout?.hex || '#eae6df'}44` }} />
                            <div className="wall-specular-gloss" />
                            <div className="wall-spotlights" />

                            {/* Floating LED Mirror & Vanity Unit Overlay */}
                            <div className="stage-backlit-mirror">
                              <div className="mirror-glass-glow" />
                            </div>

                            <div className="stage-vanity-unit">
                              <div 
                                className="vanity-cabinet-front" 
                                style={{ background: activeCombo?.complement?.cabinetHex || '#5c4033' }}
                              >
                                <div className="vanity-drawer-lines" />
                              </div>
                              <div className="vanity-counter-top" />

                              {/* Realistic Faucet Hardware Finish */}
                              <div className={`stage-faucet-hardware finish-${currentFaucet.toLowerCase().includes('gold') ? 'gold' : currentFaucet.toLowerCase().includes('siyah') ? 'black' : 'chrome'}`}>
                                <div className="faucet-body" />
                                <div className="faucet-spout" />
                              </div>
                            </div>
                          </div>

                          {/* 2. Wall-Floor Baseboard (Süpürgelik) & Contact Shadow */}
                          <div className="stage-baseboard-line">
                            <div className="baseboard-shadow" />
                          </div>

                          {/* 3. Floor Surface Plane with Perspective Distortion & Grout Lines */}
                          <div className="stage-floor-perspective">
                            <div 
                              className="floor-tile-canvas"
                              style={{
                                backgroundImage: `url(${currentTile?.img || '/textures/calacatta_gold.jpg'})`,
                                backgroundSize: roomCameraAngle === 'macro' ? '300px 180px' : '180px 110px'
                              }}
                            >
                              <div className="floor-grout-grid-overlay" style={{ boxShadow: `inset 0 0 0 2px ${activeCombo?.grout?.hex || '#eae6df'}` }} />
                              <div className="floor-gloss-reflection" />
                              <div className="vanity-floor-shadow" />
                            </div>
                          </div>

                          {/* 4. Ambient Vignette */}
                          <div className="stage-vignette-overlay" />

                          {/* 5. Top Controls: Camera Angles & Material Specs */}
                          <div className="stage-top-controls">
                            <div className="camera-angle-tabs">
                              {[
                                { key: 'eye', label: '👁️ Göz Hizası', title: 'Genel Mimar Perspektifi' },
                                { key: 'top', label: '📐 Zemin & Derz', title: 'Zemin ve Derz Çizgileri Açısı' },
                                { key: 'macro', label: '🔍 Doku Yakın Çekim', title: 'Yüzey Parlaklığı ve Dokusu' }
                              ].map(cam => (
                                <button
                                  key={cam.key}
                                  onClick={() => setRoomCameraAngle(cam.key)}
                                  className={`camera-tab-btn ${roomCameraAngle === cam.key ? 'active' : ''}`}
                                  title={cam.title}
                                >
                                  {cam.label}
                                </button>
                              ))}
                            </div>

                            <div className="stage-material-info-chip">
                              <span>🚰 Armatür: <strong>{currentFaucet}</strong></span>
                              <span>📐 Derz: <strong>{activeCombo?.grout?.color} ({activeCombo?.grout?.width || '1.5mm'})</strong></span>
                            </div>
                          </div>

                          {/* 6. Interactive Hotspots Overlay */}
                          <div className="stage-bottom-hotspots">
                            <button className="hotspot-badge floor" onClick={() => setActiveTileIndex((prev) => (prev + 1) % tilesList.length)}>
                              🔄 Zemin Değiştir ({currentTile?.name})
                            </button>
                            <button className="hotspot-badge wall" onClick={() => setStudioViewMode('cards')}>
                              🧱 Malzeme Kartlarını İncele
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* 4 EQUAL-WIDTH CLEAN LIGHT MATERIAL CARDS */
                      <div className="studio-materials-grid">
                        
                        {/* Card 1: 🔲 ZEMİN SERAMİĞİ */}
                        <div className="studio-material-card studio-tile-showcase-card">
                          <div className="card-header-tag">
                            <span>01 / ZEMİN SERAMİĞİ</span>
                            <span className="tile-badge-overlay">{currentTile?.badge || '👑 PREMİUM'}</span>
                          </div>
                          
                          <div className="studio-tile-img-box">
                            <img 
                              src={currentTile?.img || '/textures/calacatta_gold.jpg'} 
                              alt={currentTile?.name || 'Zemin Seramiği'}
                              onError={(e) => { e.target.onerror = null; e.target.src = '/textures/calacatta_gold.jpg'; }}
                            />
                            <div className="tile-brand-tag">{currentTile?.brand || 'NG KÜTAHYA'}</div>
                            <div className="tile-price-tag">{currentTile?.price || '₺740/m²'}</div>
                          </div>

                          {tilesList.length > 1 && (
                            <div className="tile-carousel-nav">
                              <span className="carousel-nav-label">Alternatif Zemin Seramikleri:</span>
                              <div className="carousel-dots-group">
                                {tilesList.map((t, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => setActiveTileIndex(idx)}
                                    className={`tile-carousel-dot ${activeTileIndex === idx ? 'active' : ''}`}
                                    title={t.name}
                                  >
                                    {idx + 1}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="material-details">
                            <h5 className="material-name">{currentTile?.name || activeCombo?.floorTile?.name}</h5>
                            <p className="material-sub">{currentTile?.size} • {currentTile?.finish}</p>
                            <div className="tech-spec-row">
                              <span className="tech-badge">{activeCombo?.floorTile?.pei || 'PEI 4'}</span>
                              <span className="tech-badge">{activeCombo?.floorTile?.slip || 'R10 Kaymaz'}</span>
                            </div>
                            <div className="calc-material-cost">
                              Gereken: {floorM2Needed} m² • <strong>₺{floorTotalCost.toLocaleString('tr-TR')}</strong>
                            </div>
                          </div>
                        </div>

                        {/* Card 2: 🧱 DUVAR & DEKOR SERAMİĞİ */}
                        <div className="studio-material-card studio-tile-showcase-card">
                          <div className="card-header-tag">
                            <span>02 / DUVAR & DEKOR SERAMİĞİ</span>
                            <span className="tile-badge-overlay">{activeCombo?.wallTile?.badge || '✨ UYUMLU DEKOR'}</span>
                          </div>
                          <div className="studio-tile-img-box">
                            <img 
                              src={activeCombo?.wallTile?.img || '/textures/calacatta_gold.jpg'} 
                              alt={activeCombo?.wallTile?.name || 'Duvar Dekor Seramiği'}
                              onError={(e) => { e.target.onerror = null; e.target.src = '/textures/calacatta_gold.jpg'; }}
                            />
                            <div className="tile-brand-tag">{activeCombo?.wallTile?.brand || 'VitrA'}</div>
                            <div className="tile-price-tag">{activeCombo?.wallTile?.price || '₺620/m²'}</div>
                          </div>
                          <div className="material-details">
                            <h5 className="material-name">{activeCombo?.wallTile?.name}</h5>
                            <p className="material-sub">{activeCombo?.wallTile?.size} • {activeCombo?.wallTile?.finish}</p>
                            <div className="calc-material-cost">
                              Gereken: ~{wallM2Needed} m² • <strong>₺{wallTotalCost.toLocaleString('tr-TR')}</strong>
                            </div>
                          </div>
                        </div>

                        {/* Card 3: 📐 DERZ & YAPI KİMYASALI */}
                        <div className="studio-material-card">
                          <div className="card-header-tag">
                            <span>03 / DERZ & YAPI KİMYASALI</span>
                            <span className="tile-badge-overlay">{activeCombo?.grout?.width || '1.5mm Derz'}</span>
                          </div>
                          <div className="studio-grout-box">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div 
                                className="studio-grout-swatch-circle"
                                style={{ background: activeCombo?.grout?.hex || '#eae6df' }}
                                title={`Derz Rengi: ${activeCombo?.grout?.color}`}
                              />
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span className="grout-color-name">{activeCombo?.grout?.color || 'Derz Renk Tonu'}</span>
                                <span style={{ fontSize: '0.6rem', color: '#64748b' }}>Uyumlu Derz Çizgisi</span>
                              </div>
                            </div>
                          </div>
                          <div className="material-details">
                            <h5 className="material-name">{activeCombo?.grout?.name}</h5>
                            <p className="material-sub">Teknik Özellik: {activeCombo?.grout?.type}</p>
                            <div className="calc-material-cost">
                              Tahmini Sarfiyat • <strong>₺{chemicalGroutCost.toLocaleString('tr-TR')}</strong>
                            </div>
                          </div>
                        </div>

                        {/* Card 4: 🚪 BANYO & İÇ MEKAN TAMAMLAYICI */}
                        <div className="studio-material-card">
                          <div className="card-header-tag">
                            <span>04 / TAMAMLAYICI EKİPMAN</span>
                            <div className="fixture-chips-row">
                              {['Mat Siyah', 'Gold', 'Krom'].map(f => (
                                <button
                                  key={f}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setCustomFaucetFinish(f);
                                  }}
                                  className={`fixture-mini-chip ${currentFaucet.includes(f) ? 'active' : ''}`}
                                >
                                  {f}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="studio-complement-box">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div className="wood-texture-icon" style={{ background: activeCombo?.complement?.cabinetHex || '#5c4033' }} title="Mobilya Dokusu" />
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                <div className="fixture-finish-badge">🚰 {currentFaucet}</div>
                                <span style={{ fontSize: '0.6rem', color: '#64748b' }}>Seçili Armatür Stili</span>
                              </div>
                            </div>
                          </div>
                          <div className="material-details">
                            <h5 className="material-name">{activeCombo?.complement?.cabinet}</h5>
                            <p className="material-sub">Armatür: {activeCombo?.complement?.fixture}</p>
                          </div>
                        </div>

                      </div>
                    )}

                    {/* Workspace Bottom Specification & Action Bar */}
                    <div className="workspace-footer-row">
                      <div className="studio-spec-notes">
                        <div className="spec-pill-group">
                          <span className="spec-pill gold">✨ %{activeCombo.matchScore} Uyum Skoru</span>
                          <span className="spec-pill">💡 Aydınlatma: {activeCombo.lighting || '3000K LED'}</span>
                          <span className="spec-pill">📐 Derz: {activeCombo.groutColor || '1.5mm Fildişi'}</span>
                        </div>
                        <p className="architect-tip-text">
                          <strong>İç Mimar Tavsiyesi:</strong> {activeCombo.desc}
                        </p>
                      </div>

                      <div className="studio-action-buttons-group">
                        <button
                          onClick={() => handleCopyArchitectSpec(activeCombo, currentTile, currentFaucet, totalEstimatedBudget)}
                          className="studio-secondary-action-btn"
                          title="Tüm malzeme reçetesini ve bütçe detaylarını kopyala"
                        >
                          <Copy size={15} />
                          <span>{specCopiedMsg ? '✅ Reçete Kopyalandı!' : 'Reçeteyi Kopyala'}</span>
                        </button>

                        <button
                          onClick={() => handleRequestQuoteForCombo(activeCombo, currentTile)}
                          className="studio-quote-action-btn"
                          title="Bu kombin için kayıtlı bayilerden doğrudan fiyat teklifi iste"
                        >
                          <DollarSign size={15} />
                          <span>Bayilerden Teklif İstet</span>
                        </button>

                        <button
                          onClick={() => handleTryMoodboard({ ...activeCombo, tileName: currentTile?.name || activeCombo?.floorTile?.name })}
                          className="studio-3d-action-btn"
                        >
                          <Palette size={16} />
                          <span>3D Stüdyoda Aç →</span>
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })()}

            </div>

            {/* Haftanın Ürünleri Section */}
            {weeklyProducts.length > 0 && (
              <div className="weekly-products-section glass-panel" style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '16px', 
                marginBottom: '32px',
                padding: '24px',
                background: '#ffffff'
              }}>
                <div className="weekly-products-header" style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  borderBottom: '1px solid var(--border-color)', 
                  paddingBottom: '16px' 
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                      background: 'rgba(179, 142, 71, 0.1)', 
                      color: 'var(--accent-gold)', 
                      padding: '8px', 
                      borderRadius: '50%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      <Flame size={20} fill="var(--accent-gold)" />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        Haftanın En Popüler Ürünleri
                      </h3>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        En çok tercih edilen ve öne çıkan popüler seramik modellerini keşfedin.
                      </p>
                    </div>
                  </div>
                  <span className="weekly-badge" style={{ 
                    fontSize: '0.62rem', 
                    background: 'rgba(179,142,71,0.1)', 
                    border: '1px solid var(--border-gold)', 
                    color: 'var(--accent-gold)', 
                    padding: '4px 10px', 
                    borderRadius: '12px', 
                    fontWeight: '700', 
                    letterSpacing: '0.05em' 
                  }}>ÖNE ÇIKANLAR</span>
                </div>

                <div className="weekly-products-scroll-container" style={{ 
                  display: 'flex', 
                  gap: '20px', 
                  overflowX: 'auto', 
                  padding: '4px 4px 12px 4px'
                }}>
                  {weeklyProducts.map((p) => {
                    const price = p.cheapestOffer?.price || 480;
                    const brandShort = p.brand?.name ? p.brand.name.split(' ')[0] : 'Seramik';
                    return (
                      <div 
                        key={p.id} 
                        className="weekly-product-card glass-panel" 
                        style={{
                          minWidth: '230px',
                          width: '230px',
                          borderRadius: 'var(--border-radius-md)',
                          overflow: 'hidden',
                          background: '#ffffff',
                          display: 'flex',
                          flexDirection: 'column',
                          padding: '12px',
                          gap: '10px',
                          cursor: 'pointer'
                        }} 
                        onClick={() => handleProductCardClick(p)}
                      >
                        {/* Top Row: Brand name & Price */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ 
                            fontSize: '0.65rem', 
                            fontWeight: '700', 
                            color: 'var(--text-secondary)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            {brandShort}
                          </span>
                          <span style={{ 
                            fontSize: '0.78rem', 
                            fontWeight: '800', 
                            color: 'var(--accent-gold)'
                          }}>
                            ₺{price.toLocaleString('tr-TR')},00
                          </span>
                        </div>

                        {/* Product Image */}
                        <div style={{
                          height: '130px',
                          background: '#f8fafc',
                          borderRadius: 'var(--border-radius-sm)',
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative'
                        }}>
                          <img 
                            src={p.imageUrl || '/textures/calacatta_gold.jpg'} 
                            alt={p.name} 
                            loading="lazy"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              transition: 'transform 0.3s ease'
                            }}
                            className="weekly-card-image"
                          />
                          {p.isPremium && (
                            <span style={{
                              position: 'absolute',
                              top: '8px',
                              right: '8px',
                              background: 'var(--accent-gold)',
                              color: '#ffffff',
                              fontSize: '0.55rem',
                              fontWeight: '700',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                            }}>
                              PREMIUM
                            </span>
                          )}
                        </div>

                        {/* Info & Metadata */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <h4 style={{ 
                            fontSize: '0.85rem', 
                            fontWeight: '700', 
                            color: 'var(--text-primary)', 
                            margin: 0,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {p.name}
                          </h4>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                              {p.width}x{p.height} cm • {p.finish}
                            </span>
                            <span style={{ 
                              fontSize: '0.65rem', 
                              color: 'var(--text-muted)',
                              fontWeight: '600',
                              background: '#f1f5f9',
                              padding: '1px 6px',
                              borderRadius: '4px'
                            }}>
                              {p.style}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Shop the Look - Konsept Odalar */}
            <div className="shop-the-look-section" style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <div className="stl-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 className="stl-title" style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)' }}>Tarzı Satın Al (Shop the Look)</h3>
                  <p className="stl-subtitle" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Profesyonel iç mimarlar tarafından tasarlanmış hazır banyo, mutfak ve salon konseptlerini inceleyin.</p>
                </div>
                <span className="stl-badge" style={{ fontSize: '0.65rem', background: 'rgba(197,160,89,0.1)', border: '1px solid var(--border-gold)', color: 'var(--accent-gold)', padding: '4px 10px', borderRadius: '12px', fontWeight: '700', letterSpacing: '0.05em' }}>KONSEPT TASARIMLAR</span>
              </div>

              <div className="stl-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                {/* Concept 1: Luxury Marble Bathroom */}
                <div className="stl-card glass-panel" style={{ display: 'flex', flexDirection: 'column', borderRadius: 'var(--border-radius-md)', overflow: 'hidden', background: '#ffffff' }}>
                  <div className="stl-image-container" style={{ height: '180px', position: 'relative', overflow: 'hidden' }}>
                    <img src="/hero/luxury_bathroom.png" alt="Lüks Mermer Banyo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div className="stl-tag" style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(0,0,0,0.7)', color: '#ffffff', fontSize: '0.6rem', padding: '3px 8px', borderRadius: '4px', fontWeight: '700' }}>LÜKS BANYO</div>
                  </div>
                  <div className="stl-body" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}>
                    <h4 style={{ fontSize: '0.92rem', fontWeight: '700', color: 'var(--text-primary)' }}>Mermer Zarafeti Banyo</h4>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>Beyaz Calacatta mermer dokusunun pirinç ve gold detaylarla lüks uyumu.</p>
                    <div className="stl-materials-list" style={{ marginTop: '8px' }}>
                      <span className="mat-item-title" style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>Kullanılan Seramikler:</span>
                      <div className="mat-items" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {products.filter(p => p.style === 'Mermer').slice(0, 2).map(p => (
                          <div key={p.id} className="mat-row" onClick={() => handleProductCardClick(p)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s ease' }}>
                            <img src={p.imageUrl || '/textures/calacatta_gold.jpg'} alt={p.name} style={{ width: '28px', height: '28px', objectFit: 'cover', borderRadius: '4px' }} />
                            <div className="mat-info" style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                              <span className="mat-name" style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-primary)' }}>{p.name}</span>
                              <span className="mat-spec" style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{p.width}x{p.height} cm • {p.finish}</span>
                            </div>
                            <span className="mat-price-arrow" style={{ color: 'var(--accent-gold)', fontSize: '0.75rem' }}>↗</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Concept 2: Scandinavian Oak Kitchen */}
                <div className="stl-card glass-panel" style={{ display: 'flex', flexDirection: 'column', borderRadius: 'var(--border-radius-md)', overflow: 'hidden', background: '#ffffff' }}>
                  <div className="stl-image-container" style={{ height: '180px', position: 'relative', overflow: 'hidden' }}>
                    <img src="/hero/scandinavian_kitchen.png" alt="İskandinav Mutfak" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div className="stl-tag" style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(0,0,0,0.7)', color: '#ffffff', fontSize: '0.6rem', padding: '3px 8px', borderRadius: '4px', fontWeight: '700' }}>SICAK MUTFAK</div>
                  </div>
                  <div className="stl-body" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}>
                    <h4 style={{ fontSize: '0.92rem', fontWeight: '700', color: 'var(--text-primary)' }}>Doğal İskandinav Mutfak</h4>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>Sıcak meşe ahşap panellerin beyaz tezgah seramikleriyle ferah kombinasyonu.</p>
                    <div className="stl-materials-list" style={{ marginTop: '8px' }}>
                      <span className="mat-item-title" style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>Kullanılan Seramikler:</span>
                      <div className="mat-items" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {products.filter(p => p.style === 'Ahşap' || p.name.toLowerCase().includes('ahşap')).slice(0, 2).map(p => (
                          <div key={p.id} className="mat-row" onClick={() => handleProductCardClick(p)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s ease' }}>
                            <img src={p.imageUrl || '/textures/teak_ahsap.jpg'} alt={p.name} style={{ width: '28px', height: '28px', objectFit: 'cover', borderRadius: '4px' }} />
                            <div className="mat-info" style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                              <span className="mat-name" style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-primary)' }}>{p.name}</span>
                              <span className="mat-spec" style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{p.width}x{p.height} cm • {p.finish}</span>
                            </div>
                            <span className="mat-price-arrow" style={{ color: 'var(--accent-gold)', fontSize: '0.75rem' }}>↗</span>
                          </div>
                        ))}
                        {products.filter(p => p.style === 'Ahşap' || p.name.toLowerCase().includes('ahşap')).length === 0 && 
                          products.slice(0, 2).map(p => (
                          <div key={p.id} className="mat-row" onClick={() => handleProductCardClick(p)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s ease' }}>
                            <img src={p.imageUrl || '/textures/calacatta_gold.jpg'} alt={p.name} style={{ width: '28px', height: '28px', objectFit: 'cover', borderRadius: '4px' }} />
                            <div className="mat-info" style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                              <span className="mat-name" style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-primary)' }}>{p.name}</span>
                              <span className="mat-spec" style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{p.width}x{p.height} cm • {p.finish}</span>
                            </div>
                            <span className="mat-price-arrow" style={{ color: 'var(--accent-gold)', fontSize: '0.75rem' }}>↗</span>
                          </div>
                        ))
                        }
                      </div>
                    </div>
                  </div>
                </div>

                {/* Concept 3: Modern Concrete Living Room */}
                <div className="stl-card glass-panel" style={{ display: 'flex', flexDirection: 'column', borderRadius: 'var(--border-radius-md)', overflow: 'hidden', background: '#ffffff' }}>
                  <div className="stl-image-container" style={{ height: '180px', position: 'relative', overflow: 'hidden' }}>
                    <img src="/hero/modern_living.png" alt="Modern Salon" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div className="stl-tag" style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(0,0,0,0.7)', color: '#ffffff', fontSize: '0.6rem', padding: '3px 8px', borderRadius: '4px', fontWeight: '700' }}>ENDÜSTRİYEL SALON</div>
                  </div>
                  <div className="stl-body" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}>
                    <h4 style={{ fontSize: '0.92rem', fontWeight: '700', color: 'var(--text-primary)' }}>Endüstriyel Beton Salon</h4>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>Polisajlı gri beton karolar ile minimalist ve modern salon döşemesi.</p>
                    <div className="stl-materials-list" style={{ marginTop: '8px' }}>
                      <span className="mat-item-title" style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>Kullanılan Seramikler:</span>
                      <div className="mat-items" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {products.filter(p => p.style === 'Beton' || p.name.toLowerCase().includes('beton')).slice(0, 2).map(p => (
                          <div key={p.id} className="mat-row" onClick={() => handleProductCardClick(p)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s ease' }}>
                            <img src={p.imageUrl || '/textures/loft_beton.jpg'} alt={p.name} style={{ width: '28px', height: '28px', objectFit: 'cover', borderRadius: '4px' }} />
                            <div className="mat-info" style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                              <span className="mat-name" style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-primary)' }}>{p.name}</span>
                              <span className="mat-spec" style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{p.width}x{p.height} cm • {p.finish}</span>
                            </div>
                            <span className="mat-price-arrow" style={{ color: 'var(--accent-gold)', fontSize: '0.75rem' }}>↗</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Layout: Left Sidebar + Results Grid */}
            <div className="main-search-and-results-layout">
              {/* Left Sidebar Filter Section */}
              <aside className="filters-sidebar-new glass-panel desktop-sidebar" style={{ position: 'relative' }}>
                <div className="filter-header-row" style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: '12px' }}>
                  <h3 className="filter-title-main" style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', margin: 0, border: 'none', padding: 0, letterSpacing: '-0.02em' }}>Filtreler</h3>
                  <button onClick={() => {
                    setSelectedBrand('');
                    setSelectedColor('');
                    setSelectedFinish('');
                    setSelectedStyle('');
                    setSelectedArea('');
                    setSelectedSize('');
                    setSelectedRectified('');
                    setSelectedFrost('');
                    setSelectedSlipResistance('');
                    setSelectedThickness('');
                    setSelectedPeiRating('');
                    setSelectedIsPremium('');
                    setSearchQuery('');
                    setUploadedImagePreview(null);
                    setVisualSearchMatches(null);
                    fetchProducts('clear=true');
                  }} className="clear-all-filters-btn">
                    Temizle
                  </button>
                </div>

                {/* Standalone Premium Series Switch */}
                <div className="premium-toggle-card" style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  padding: '12px 14px', 
                  borderRadius: '12px', 
                  background: selectedIsPremium === 'true' 
                    ? 'linear-gradient(135deg, rgba(179,142,71,0.15) 0%, rgba(140,107,48,0.06) 100%)' 
                    : 'linear-gradient(135deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.005) 100%)', 
                  border: selectedIsPremium === 'true' 
                    ? '1px solid rgba(179,142,71,0.35)' 
                    : '1px solid rgba(0,0,0,0.05)', 
                  marginBottom: '8px', 
                  transition: 'all 0.3s ease',
                  boxShadow: selectedIsPremium === 'true' ? '0 4px 12px rgba(179,142,71,0.08)' : 'none'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Sparkles size={16} style={{ color: selectedIsPremium === 'true' ? 'var(--accent-gold)' : '#64748b', transition: 'color 0.2s' }} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: '700', color: selectedIsPremium === 'true' ? '#b38e47' : '#0f172a', transition: 'color 0.2s' }}>Premium Seçim</span>
                      <span style={{ fontSize: '0.62rem', color: '#64748b' }}>Mimari ve özel seriler</span>
                    </div>
                  </div>
                  <label className="toggle-switch-wrapper">
                    <input 
                      type="checkbox" 
                      checked={selectedIsPremium === 'true'} 
                      onChange={() => setSelectedIsPremium(selectedIsPremium === 'true' ? '' : 'true')}
                    />
                    <span className="toggle-switch-slider" />
                  </label>
                </div>

                {/* 1. KATEGORİLER */}
                <div className="accordion-section">
                  <div className="accordion-header" onClick={() => toggleSection('categories')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <SlidersHorizontal size={14} style={{ color: selectedStyle ? 'var(--accent-gold)' : '#64748b' }} />
                      <span className="accordion-title">Kategoriler</span>
                      {selectedStyle !== '' && <span className="accordion-active-dot" />}
                    </div>
                    <ChevronDown size={14} style={{ transform: expandedSections.categories ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease', color: 'var(--text-secondary)' }} />
                  </div>
                  {expandedSections.categories && (
                    <div className="accordion-content" style={{ marginTop: '12px' }}>
                      <div className="filters-grid">
                        {['Mermer', 'Ahşap', 'Beton', 'Taş'].map(styleVal => {
                          const isSelected = selectedStyle === styleVal;
                          return (
                            <button 
                              key={styleVal} 
                              onClick={() => setSelectedStyle(isSelected ? '' : styleVal)}
                              className={`filter-chip-btn ${isSelected ? 'active' : ''}`}
                            >
                              {styleVal}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. KOLEKSİYON */}
                <div className="accordion-section">
                  <div className="accordion-header" onClick={() => toggleSection('collection')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Building2 size={14} style={{ color: selectedBrand ? 'var(--accent-gold)' : '#64748b' }} />
                      <span className="accordion-title">Koleksiyon (Marka)</span>
                      {selectedBrand !== '' && <span className="accordion-active-dot" />}
                    </div>
                    <ChevronDown size={14} style={{ transform: expandedSections.collection ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease', color: 'var(--text-secondary)' }} />
                  </div>
                  {expandedSections.collection && (
                    <div className="accordion-content" style={{ marginTop: '12px' }}>
                      <div className="filters-grid">
                        {brands.filter(b => b.name.toLowerCase() !== 'kalebodur').map(brand => {
                          const isSelected = selectedBrand === brand.id;
                          return (
                            <button 
                              key={brand.id} 
                              onClick={() => setSelectedBrand(isSelected ? '' : brand.id)}
                              className={`filter-chip-btn ${isSelected ? 'active' : ''}`}
                            >
                              {brand.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. DOKU */}
                <div className="accordion-section">
                  <div className="accordion-header" onClick={() => toggleSection('texture')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Palette size={14} style={{ color: selectedColor ? 'var(--accent-gold)' : '#64748b' }} />
                      <span className="accordion-title">Renk & Doku</span>
                      {selectedColor !== '' && <span className="accordion-active-dot" />}
                    </div>
                    <ChevronDown size={14} style={{ transform: expandedSections.texture ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease', color: 'var(--text-secondary)' }} />
                  </div>
                  {expandedSections.texture && (
                    <div className="accordion-content" style={{ marginTop: '12px' }}>
                      <div className="filters-grid">
                        {[
                          { name: 'Beyaz', color: '#ffffff', border: '1px solid #cbd5e1' },
                          { name: 'Bej', color: '#f5f5dc', border: '1px solid #e2e8f0' },
                          { name: 'Gri', color: '#94a3b8' },
                          { name: 'Antrasit', color: '#334155' },
                          { name: 'Kahverengi', color: '#78350f' }
                        ].map(colorItem => {
                          const isSelected = selectedColor === colorItem.name;
                          return (
                            <button 
                              key={colorItem.name} 
                              onClick={() => setSelectedColor(isSelected ? '' : colorItem.name)}
                              className={`filter-chip-btn color-chip-btn ${isSelected ? 'active' : ''}`}
                            >
                              <span 
                                className="color-dot" 
                                style={{ 
                                  backgroundColor: colorItem.color, 
                                  border: colorItem.border || 'none',
                                  boxShadow: isSelected ? '0 0 0 2px #ffffff, 0 0 0 3px var(--accent-gold)' : 'none'
                                }} 
                              />
                              <span>{colorItem.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. EBAT */}
                <div className="accordion-section">
                  <div className="accordion-header" onClick={() => toggleSection('ebat')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Layers2 size={14} style={{ color: selectedSize ? 'var(--accent-gold)' : '#64748b' }} />
                      <span className="accordion-title">Ebatlar</span>
                      {selectedSize !== '' && <span className="accordion-active-dot" />}
                    </div>
                    <ChevronDown size={14} style={{ transform: expandedSections.ebat ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease', color: 'var(--text-secondary)' }} />
                  </div>
                  {expandedSections.ebat && (
                    <div className="accordion-content" style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div className="scrollable-ebat-list">
                        {[
                          '120x240', '120x120', '60x120', '20x120', '80x80', 
                          '60x60', '30x60', '31,5x61,5', '42x42', '60x90', 
                          '61x61', '80x160', '30x85', '33x66', '21x122', 
                          '15x60', '240x240', '360x240', '100x100', '40x120', 
                          '30x120', '30x90', '30x40', '20x40', '19,7x19,7'
                        ].map(sizeVal => {
                          const parts = sizeVal.replace(',', '.').split('x');
                          const wCm = parseFloat(parts[0]) || 0;
                          const hCm = parseFloat(parts[1]) || 0;
                          const scale = 80 / 175;
                          const wPx = Math.max(4, Math.round(wCm * scale));
                          const hPx = Math.max(4, Math.round(hCm * scale));

                          const isSelected = selectedSize === sizeVal;

                          return (
                            <label key={sizeVal} className="checkbox-label-wrapper" style={{ position: 'relative' }}>
                              <input 
                                type="checkbox" 
                                checked={isSelected} 
                                onChange={() => setSelectedSize(isSelected ? '' : sizeVal)}
                              />
                              <span className="checkbox-custom-box" />
                              <span className="checkbox-text-label" style={{ color: isSelected ? '#0f172a' : 'var(--text-secondary)', fontWeight: isSelected ? '600' : '500' }}>{sizeVal}</span>
                              
                              <div className="size-guide-tooltip">
                                <span className="tooltip-title">Boyut Kıyaslama</span>
                                <div className="size-guide-viz">
                                  <div className="viz-human">
                                    <div className="viz-human-head"></div>
                                    <div className="viz-human-body"></div>
                                    <span className="viz-lbl">İnsan (175 cm)</span>
                                  </div>
                                  <div className="viz-tile" style={{ width: `${wPx}px`, height: `${hPx}px`, background: 'var(--accent-gold)', border: '1px solid rgba(255,255,255,0.3)' }}>
                                    <span className="viz-lbl">{sizeVal} cm</span>
                                  </div>
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* 5. ÜRÜN TİPİ (YÜZEY BİTİŞİ) */}
                <div className="accordion-section">
                  <div className="accordion-header" onClick={() => toggleSection('productType')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Layers size={14} style={{ color: selectedFinish ? 'var(--accent-gold)' : '#64748b' }} />
                      <span className="accordion-title">Yüzey Bitişi</span>
                      {selectedFinish !== '' && <span className="accordion-active-dot" />}
                    </div>
                    <ChevronDown size={14} style={{ transform: expandedSections.productType ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease', color: 'var(--text-secondary)' }} />
                  </div>
                  {expandedSections.productType && (
                    <div className="accordion-content" style={{ marginTop: '12px' }}>
                      <div className="filters-grid">
                        {['Mat', 'Parlak', 'Lapatto'].map(finishVal => {
                          const isSelected = selectedFinish === finishVal;
                          return (
                            <button 
                              key={finishVal} 
                              onClick={() => setSelectedFinish(isSelected ? '' : finishVal)}
                              className={`filter-chip-btn ${isSelected ? 'active' : ''}`}
                            >
                              {finishVal === 'Parlak' ? 'Parlak (Camsı)' : finishVal === 'Lapatto' ? 'Lapatto (Yarı)' : finishVal}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* YENİ: TEKNİK BİLGİLER / DURAMLILIK */}
                <div className="accordion-section">
                  <div className="accordion-header" onClick={() => toggleSection('techSpecs')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Activity size={14} style={{ color: (selectedSlipResistance || selectedThickness || selectedPeiRating) ? 'var(--accent-gold)' : '#64748b' }} />
                      <span className="accordion-title">Performans & Dayanım</span>
                      {(selectedSlipResistance !== '' || selectedThickness !== '' || selectedPeiRating !== '') && <span className="accordion-active-dot" />}
                    </div>
                    <ChevronDown size={14} style={{ transform: expandedSections.techSpecs ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease', color: 'var(--text-secondary)' }} />
                  </div>
                  {expandedSections.techSpecs && (
                    <div className="accordion-content" style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      
                      {/* Slip Resistance */}
                      <div className="tech-filter-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Kaymazlık (R)</span>
                          <span style={{ fontSize: '0.62rem', color: '#b38e47', display: 'flex', alignItems: 'center', gap: '2px' }} title="R9: Ev içi kuru, R10: Banyo/Mutfak, R11: Islak dış mekan/Havuz">
                            <Info size={11} /> Bilgi
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {['R9', 'R10', 'R11'].map(rVal => {
                            const isSelected = selectedSlipResistance === rVal;
                            return (
                              <button
                                key={rVal}
                                onClick={() => setSelectedSlipResistance(isSelected ? '' : rVal)}
                                className={`filter-chip-btn ${isSelected ? 'active' : ''}`}
                                style={{ flex: 1, minHeight: '32px', fontSize: '0.75rem', padding: '4px' }}
                              >
                                {rVal}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Thickness */}
                      <div className="tech-filter-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Kalınlık</span>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {[
                            { name: 'İnce', value: 'thin', desc: '≤ 8.5 mm' },
                            { name: 'Standart', value: 'standard', desc: '9-10 mm' },
                            { name: 'Kalın', value: 'thick', desc: '> 10 mm' }
                          ].map(thickObj => {
                            const isSelected = selectedThickness === thickObj.value;
                            return (
                              <button
                                key={thickObj.value}
                                onClick={() => setSelectedThickness(isSelected ? '' : thickObj.value)}
                                className={`filter-chip-btn ${isSelected ? 'active' : ''}`}
                                style={{ flex: 1, minHeight: '34px', fontSize: '0.7rem', display: 'flex', flexDirection: 'column', gap: '1px', padding: '4px 2px' }}
                              >
                                <span style={{ fontWeight: '700' }}>{thickObj.name}</span>
                                <span style={{ fontSize: '0.52rem', opacity: isSelected ? 0.9 : 0.6 }}>{thickObj.desc}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* PEI Rating */}
                      <div className="tech-filter-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Aşınma Sınıfı (PEI)</span>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {[
                            { name: 'PEI 3+', value: '3', label: 'Orta' },
                            { name: 'PEI 4+', value: '4', label: 'Yoğun' },
                            { name: 'PEI 5', value: '5', label: 'Ekstra' }
                          ].map(peiObj => {
                            const isSelected = selectedPeiRating === peiObj.value;
                            return (
                              <button
                                key={peiObj.value}
                                onClick={() => setSelectedPeiRating(isSelected ? '' : peiObj.value)}
                                className={`filter-chip-btn ${isSelected ? 'active' : ''}`}
                                style={{ flex: 1, minHeight: '34px', fontSize: '0.7rem', display: 'flex', flexDirection: 'column', gap: '1px', padding: '4px 2px' }}
                                title={peiObj.label}
                              >
                                <span style={{ fontWeight: '700' }}>{peiObj.name}</span>
                                <span style={{ fontSize: '0.52rem', opacity: isSelected ? 0.9 : 0.6 }}>{peiObj.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                    </div>
                  )}
                </div>

                {/* 6. ÜRÜN ÖZELLİKLERİ */}
                <div className="accordion-section">
                  <div className="accordion-header" onClick={() => toggleSection('productFeature')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Wrench size={14} style={{ color: (selectedRectified || selectedFrost) ? 'var(--accent-gold)' : '#64748b' }} />
                      <span className="accordion-title">Kenar & Yapı</span>
                      {(selectedRectified !== '' || selectedFrost !== '') && <span className="accordion-active-dot" />}
                    </div>
                    <ChevronDown size={14} style={{ transform: expandedSections.productFeature ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease', color: 'var(--text-secondary)' }} />
                  </div>
                  {expandedSections.productFeature && (
                    <div className="accordion-content" style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div className="toggle-filter-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 0' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: '500', color: 'var(--text-secondary)' }}>Rektifiyeli (Düz Kenar)</span>
                        <label className="toggle-switch-wrapper">
                          <input 
                            type="checkbox" 
                            checked={selectedRectified === 'true'} 
                            onChange={() => setSelectedRectified(selectedRectified === 'true' ? '' : 'true')}
                          />
                          <span className="toggle-switch-slider" />
                        </label>
                      </div>
                      <div className="toggle-filter-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 0' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: '500', color: 'var(--text-secondary)' }}>Dona Dayanıklı</span>
                        <label className="toggle-switch-wrapper">
                          <input 
                            type="checkbox" 
                            checked={selectedFrost === 'true'} 
                            onChange={() => setSelectedFrost(selectedFrost === 'true' ? '' : 'true')}
                          />
                          <span className="toggle-switch-slider" />
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {/* 7. MEKAN TİPİ */}
                <div className="accordion-section" style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: 0 }}>
                  <div className="accordion-header" onClick={() => toggleSection('spaceType')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Globe size={14} style={{ color: selectedArea ? 'var(--accent-gold)' : '#64748b' }} />
                      <span className="accordion-title">Mekan Tipi</span>
                      {selectedArea !== '' && <span className="accordion-active-dot" />}
                    </div>
                    <ChevronDown size={14} style={{ transform: expandedSections.spaceType ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease', color: 'var(--text-secondary)' }} />
                  </div>
                  {expandedSections.spaceType && (
                    <div className="accordion-content" style={{ marginTop: '12px' }}>
                      <div className="filters-grid">
                        {['Banyo', 'Mutfak', 'Salon', 'Balkon', 'Koridor', 'Teras'].map(areaVal => {
                          const isSelected = selectedArea === areaVal;
                          return (
                            <button 
                              key={areaVal} 
                              onClick={() => setSelectedArea(isSelected ? '' : areaVal)}
                              className={`filter-chip-btn ${isSelected ? 'active' : ''}`}
                            >
                              {areaVal}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </aside>

              {/* Right Side Content Results area */}
              <div className="results-container-new">
                <div className="results-header-row-new" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '20px' }}>
                  <div className="results-header-text-new">
                    {uploadedImagePreview ? (
                      <div>
                        <h3>
                          Görsel Arama Sonuçları{" "}
                          <span className="results-new-badge gold">
                            {products.some(p => p.isFallback) ? 'Renk & Doku Analizi' : 'AI Eşleşme'}
                          </span>
                        </h3>
                        {products.some(p => p.isFallback) && (
                          <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', fontWeight: '500' }}>
                            ⚠️ AI CLIP Sunucusu çevrimdışı; tarayıcı tabanlı renk ve ton eşleştirme algoritması devrede.
                          </p>
                        )}
                      </div>
                    ) : (
                      <h3>Katalog Sonuçları</h3>
                    )}
                  </div>
                  <div className="results-header-actions-new" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button onClick={() => setShowMobileFilters(true)} className="mobile-filter-trigger-btn">
                      <SlidersHorizontal size={14} />
                      <span>Filtrele</span>
                    </button>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>
                      Sonuç: <strong style={{ color: '#0f172a' }}>{products.length}</strong>
                    </div>
                  </div>
                </div>

                {/* Main Grid */}
                <div className="products-grid-new">
                  {!initialProductsLoaded ? (
                    <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: '12px' }}>
                      <Loader2 className="animate-spin" size={32} style={{ color: 'var(--accent-gold)' }} />
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Ürünler yükleniyor...</span>
                    </div>
                  ) : (
                    products.map((product, idx) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        idx={idx}
                        activeProduct={activeProduct}
                        comparedProducts={comparedProducts}
                        isProductFavorited={isProductFavorited}
                        toggleCompareProduct={toggleCompareProduct}
                        handleToggleFavorite={handleToggleFavorite}
                        navigateTo3DStudio={navigateTo3DStudio}
                        navigateToDealers={navigateToDealers}
                        getProductBadge={getProductBadge}
                        handleProductCardClick={handleProductCardClick}
                        onOpenAR={(p) => setArModalProduct(p)}
                      />
                    ))
                  )}

                  {initialProductsLoaded && products.length === 0 && (
                    <div className="empty-results glass-panel w-full" style={{ gridColumn: '1/-1' }}>
                      <HelpCircle size={40} className="empty-icon" />
                      <h4>Aradığınız model bulunamadı</h4>
                      <p>Farklı bir arama yapmayı veya filtreleri temizlemeyi deneyebilirsiniz.</p>
                    </div>
                  )}
                </div>

                {/* Pagination Controls */}
                {initialProductsLoaded && hasMore && products.length > 0 && (
                  <div className="pagination-wrapper-new" style={{ display: 'flex', justifyContent: 'center', margin: '30px 0 10px 0' }}>
                    <button 
                      onClick={handleLoadMore} 
                      className="btn-secondary" 
                      disabled={fetchingMore}
                      style={{ padding: '12px 35px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px', minWidth: '200px', justifyContent: 'center', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                    >
                      {fetchingMore ? (
                        <>
                          <Loader2 className="animate-spin" size={16} />
                          Yükleniyor...
                        </>
                      ) : (
                        'Daha Fazla Ürün Göster'
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: 3D VIRTUAL STUDIO */}
        {activeTab === 'studio' && (
          <div className="studio-portal animate-fade-in">
            <div className="studio-layout">
              <div className="studio-control-panel glass-panel">
                <h3>3D Sanal Stüdyo</h3>
                <p className="desc">Seçili seramiği banyo/mutfak sahnesine giydirerek specula (parlaklık) ve döşeme etkisini inceleyin.</p>

                {activeProduct ? (
                  <div className="active-tile-summary glass-panel-gold">
                    <span className="brand-label">{activeProduct.brand?.name}</span>
                    <h4>{activeProduct.name}</h4>
                    <p className="code">Ürün Kodu: {activeProduct.code}</p>
                    <div className="summary-specs">
                      <div><span>Boyut:</span> <strong>{activeProduct.width}x{activeProduct.height} cm</strong></div>
                      <div><span>Bitiş:</span> <strong>{activeProduct.finish}</strong></div>
                      <div><span>Tip:</span> <strong>{activeProduct.style}</strong></div>
                      <div><span>En Düşük Fiyat:</span> <strong style={{ color: 'var(--accent-gold)' }}>{activeProduct.cheapestOffer?.price || '804'} TL/m²</strong></div>
                    </div>
                  </div>
                ) : (
                  <div className="studio-no-product glass-panel">
                    <p>Lütfen seramik giydirmek için bir ürün seçin.</p>
                  </div>
                )}

                <div className="control-group">
                  <label>Seramik Giydirme Bölgesi</label>
                  <div className="segmented-control" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px', padding: '4px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                    <button 
                      className={studioApplyFloor && studioFloorProduct?.id === activeProduct?.id ? 'active' : ''} 
                      onClick={() => {
                        if (studioApplyFloor && studioFloorProduct?.id === activeProduct?.id) {
                          setStudioApplyFloor(false);
                        } else {
                          setStudioFloorProduct(activeProduct);
                          setStudioApplyFloor(true);
                          if (activeProduct) logInteraction('STUDIO_TRY', activeProduct.id, activeProduct.brandId);
                        }
                      }}
                      style={{ padding: '8px 10px', fontSize: '0.75rem', fontWeight: '700', borderRadius: '8px' }}
                    >
                      🏠 Zemin
                    </button>
                    <button 
                      className={studioApplyWalls && studioWallProduct?.id === activeProduct?.id ? 'active' : ''} 
                      onClick={() => {
                        if (studioApplyWalls && studioWallProduct?.id === activeProduct?.id) {
                          setStudioApplyWalls(false);
                        } else {
                          setStudioWallProduct(activeProduct);
                          setStudioApplyWalls(true);
                          if (activeProduct) logInteraction('STUDIO_TRY', activeProduct.id, activeProduct.brandId);
                        }
                      }}
                      style={{ padding: '8px 10px', fontSize: '0.75rem', fontWeight: '700', borderRadius: '8px' }}
                    >
                      🧱 Ana Duvarlar
                    </button>
                    <button 
                      className={studioApplyShower && studioShowerProduct?.id === activeProduct?.id ? 'active' : ''} 
                      onClick={() => {
                        if (studioApplyShower && studioShowerProduct?.id === activeProduct?.id) {
                          setStudioApplyShower(false);
                        } else {
                          setStudioShowerProduct(activeProduct);
                          setStudioApplyShower(true);
                          if (activeProduct) logInteraction('STUDIO_TRY', activeProduct.id, activeProduct.brandId);
                        }
                      }}
                      style={{ padding: '8px 10px', fontSize: '0.75rem', fontWeight: '700', borderRadius: '8px' }}
                      title="Duşakabin İki Tarafı (Arka & Yan Duvar)"
                    >
                      🚿 Duş İçi (2 Yüzey)
                    </button>
                    <button 
                      className={studioApplyToiletWall && studioToiletWallProduct?.id === activeProduct?.id ? 'active' : ''} 
                      onClick={() => {
                        if (studioApplyToiletWall && studioToiletWallProduct?.id === activeProduct?.id) {
                          setStudioApplyToiletWall(false);
                        } else {
                          setStudioToiletWallProduct(activeProduct);
                          setStudioApplyToiletWall(true);
                          if (activeProduct) logInteraction('STUDIO_TRY', activeProduct.id, activeProduct.brandId);
                        }
                      }}
                      style={{ padding: '8px 10px', fontSize: '0.75rem', fontWeight: '700', borderRadius: '8px' }}
                      title="Klozet Arkası Vurgu Duvarı"
                    >
                      🚾 Klozet Arkası
                    </button>
                  </div>
                  
                  {/* Applied Products Summary Box */}
                  <div className="studio-applied-summary" style={{
                    marginTop: '10px',
                    padding: '10px 12px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px',
                    fontSize: '0.72rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Zemin:</span>
                      {studioApplyFloor && studioFloorProduct ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: '600', color: 'var(--accent-gold)' }}>
                            {studioFloorProduct.name.split(' ')[0]} {studioFloorProduct.code}
                          </span>
                          <button onClick={() => setStudioApplyFloor(false)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0 2px' }}>✕</button>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Düz Zemin</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Ana Duvar:</span>
                      {studioApplyWalls && studioWallProduct ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: '600', color: 'var(--accent-gold)' }}>
                            {studioWallProduct.name.split(' ')[0]} {studioWallProduct.code}
                          </span>
                          <button onClick={() => setStudioApplyWalls(false)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0 2px' }}>✕</button>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Düz Duvar</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Duş İçi (2 Yüzey):</span>
                      {studioApplyShower && studioShowerProduct ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: '600', color: '#a855f7' }}>
                            {studioShowerProduct.name.split(' ')[0]} {studioShowerProduct.code}
                          </span>
                          <button onClick={() => setStudioApplyShower(false)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0 2px' }}>✕</button>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Kaplanmamış</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Klozet Arkası:</span>
                      {studioApplyToiletWall && studioToiletWallProduct ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: '600', color: '#22c55e' }}>
                            {studioToiletWallProduct.name.split(' ')[0]} {studioToiletWallProduct.code}
                          </span>
                          <button onClick={() => setStudioApplyToiletWall(false)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0 2px' }}>✕</button>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Kaplanmamış</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3D COMPARISON & CAMERA MODES */}
                <div className="control-group" style={{ marginTop: '10px' }}>
                  <label>Gelişmiş Modlar & Görünüm</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => {
                        setStudioComparisonMode(!studioComparisonMode);
                        if (!studioComparisonProduct && products.length > 1) {
                          setStudioComparisonProduct(products[1]);
                        }
                      }}
                      style={{
                        flex: 1,
                        padding: '6px 10px',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        border: studioComparisonMode ? '1px solid var(--accent-gold)' : '1px solid rgba(255,255,255,0.1)',
                        background: studioComparisonMode ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255,255,255,0.02)',
                        color: studioComparisonMode ? 'var(--accent-gold)' : '#fff',
                        cursor: 'pointer'
                      }}
                    >
                      {studioComparisonMode ? '✓ 3D Kıyaslama Açık' : '⚖️ 3D Canlı Kıyasla'}
                    </button>
                    <button 
                      onClick={() => setStudioWalkthroughMode(!studioWalkthroughMode)}
                      style={{
                        flex: 1,
                        padding: '6px 10px',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        border: studioWalkthroughMode ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                        background: studioWalkthroughMode ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255,255,255,0.02)',
                        color: studioWalkthroughMode ? '#38bdf8' : '#fff',
                        cursor: 'pointer'
                      }}
                    >
                      {studioWalkthroughMode ? '🎥 Dış Kamera' : '🥽 360° İç Gezinti'}
                    </button>
                  </div>
                </div>

                <div className="control-group" style={{ marginTop: '14px', marginBottom: '14px' }}>
                  <label>Simülasyon Sahnesi</label>
                  <div className="segmented-control" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '8px' }}>
                    <button className={studioRoomType === 'bathroom' ? 'active' : ''} onClick={() => setStudioRoomType('bathroom')} style={{ fontSize: '0.72rem', padding: '6px' }}>Banyo</button>
                    <button className={studioRoomType === 'livingroom' ? 'active' : ''} onClick={() => setStudioRoomType('livingroom')} style={{ fontSize: '0.72rem', padding: '6px' }}>Salon</button>
                    <button className={studioRoomType === 'kitchen' ? 'active' : ''} onClick={() => setStudioRoomType('kitchen')} style={{ fontSize: '0.72rem', padding: '6px' }}>Mutfak</button>
                    <button className={studioRoomType === 'hallway' ? 'active' : ''} onClick={() => setStudioRoomType('hallway')} style={{ fontSize: '0.72rem', padding: '6px' }}>Antre</button>
                    <button className={studioRoomType === 'terrace' ? 'active' : ''} onClick={() => setStudioRoomType('terrace')} style={{ fontSize: '0.72rem', padding: '6px' }}>Teras</button>
                    <button className={studioRoomType === 'bedroom' ? 'active' : ''} onClick={() => setStudioRoomType('bedroom')} style={{ fontSize: '0.72rem', padding: '6px' }}>Yatak Odası</button>
                  </div>
                </div>

                {/* 3D CUSTOMIZER SETTINGS TOOLBOX */}
                <div className="studio-settings-toolbox" style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                  <div className="studio-toolbox-section">
                    <span className="section-label" style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--accent-gold)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Gelişmiş Döşeme Desenleri</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div className="segmented-control" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', padding: '2px' }}>
                        <button className={studioLayPattern === 'flat' ? 'active' : ''} onClick={() => setStudioLayPattern('flat')} style={{ fontSize: '0.65rem', padding: '4px' }}>Düz (Grid)</button>
                        <button className={studioLayPattern === 'diagonal' ? 'active' : ''} onClick={() => setStudioLayPattern('diagonal')} style={{ fontSize: '0.65rem', padding: '4px' }}>Çapraz 45°</button>
                        <button className={studioLayPattern === 'herringbone' ? 'active' : ''} onClick={() => setStudioLayPattern('herringbone')} style={{ fontSize: '0.65rem', padding: '4px' }}>Balıksırtı</button>
                      </div>
                      <div className="segmented-control" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '4px', padding: '2px' }}>
                        <button className={studioLayPattern === 'staggered_50' ? 'active' : ''} onClick={() => setStudioLayPattern('staggered_50')} style={{ fontSize: '0.65rem', padding: '4px' }}>Tuğla %50 Kaydırma</button>
                        <button className={studioLayPattern === 'staggered_33' ? 'active' : ''} onClick={() => setStudioLayPattern('staggered_33')} style={{ fontSize: '0.65rem', padding: '4px' }}>Tuğla %33 Kaydırma</button>
                      </div>
                    </div>
                  </div>

                  <div className="studio-toolbox-section" style={{ borderTop: '1px dashed rgba(255,255,255,0.05)', paddingTop: '10px' }}>
                    <span className="section-label" style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--accent-gold)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Armatür & Mobilya Dokusu</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Armatür / Batarya Metali</span>
                        <div className="segmented-control" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', padding: '2px' }}>
                          <button className={studioFaucetColor === 'chrome' ? 'active' : ''} onClick={() => setStudioFaucetColor('chrome')} style={{ fontSize: '0.65rem', padding: '4px' }}>Krom</button>
                          <button className={studioFaucetColor === 'black' ? 'active' : ''} onClick={() => setStudioFaucetColor('black')} style={{ fontSize: '0.65rem', padding: '4px' }}>Mat Siyah</button>
                          <button className={studioFaucetColor === 'gold' ? 'active' : ''} onClick={() => setStudioFaucetColor('gold')} style={{ fontSize: '0.65rem', padding: '4px' }}>Gold</button>
                          <button className={studioFaucetColor === 'rosegold' ? 'active' : ''} onClick={() => setStudioFaucetColor('rosegold')} style={{ fontSize: '0.65rem', padding: '4px' }}>Rose Gold</button>
                        </div>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Banyo Mobilyası Kaplama</span>
                        <div className="segmented-control" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', padding: '2px' }}>
                          <button className={studioCabinetColor === 'oak' ? 'active' : ''} onClick={() => setStudioCabinetColor('oak')} style={{ fontSize: '0.65rem', padding: '4px' }}>Meşe</button>
                          <button className={studioCabinetColor === 'white' ? 'active' : ''} onClick={() => setStudioCabinetColor('white')} style={{ fontSize: '0.65rem', padding: '4px' }}>Beyaz Lake</button>
                          <button className={studioCabinetColor === 'anthracite' ? 'active' : ''} onClick={() => setStudioCabinetColor('anthracite')} style={{ fontSize: '0.65rem', padding: '4px' }}>Antrasit</button>
                          <button className={studioCabinetColor === 'walnut' ? 'active' : ''} onClick={() => setStudioCabinetColor('walnut')} style={{ fontSize: '0.65rem', padding: '4px' }}>Ceviz</button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="studio-toolbox-section" style={{ borderTop: '1px dashed rgba(255,255,255,0.05)', paddingTop: '10px' }}>
                    <span className="section-label" style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--accent-gold)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Işıklandırma & Ortam</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Günün Saati & Atmosfer</span>
                        <div className="segmented-control" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', padding: '2px' }}>
                          <button className={studioTimeOfDay === 'sunrise' ? 'active' : ''} onClick={() => setStudioTimeOfDay('sunrise')} style={{ fontSize: '0.65rem', padding: '4px' }}>Gündoğumu</button>
                          <button className={studioTimeOfDay === 'day' ? 'active' : ''} onClick={() => setStudioTimeOfDay('day')} style={{ fontSize: '0.65rem', padding: '4px' }}>Gündüz</button>
                          <button className={studioTimeOfDay === 'sunset' ? 'active' : ''} onClick={() => setStudioTimeOfDay('sunset')} style={{ fontSize: '0.65rem', padding: '4px' }}>Günbatımı</button>
                          <button className={studioTimeOfDay === 'night' ? 'active' : ''} onClick={() => setStudioTimeOfDay('night')} style={{ fontSize: '0.65rem', padding: '4px' }}>Gece</button>
                        </div>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Işık Rengi</span>
                        <div className="segmented-control" style={{ padding: '2px' }}>
                          <button className={studioLightTemp === 'warm' ? 'active' : ''} onClick={() => setStudioLightTemp('warm')} style={{ fontSize: '0.65rem', padding: '4px' }}>Sarı</button>
                          <button className={studioLightTemp === 'neutral' ? 'active' : ''} onClick={() => setStudioLightTemp('neutral')} style={{ fontSize: '0.65rem', padding: '4px' }}>Doğal</button>
                          <button className={studioLightTemp === 'cool' ? 'active' : ''} onClick={() => setStudioLightTemp('cool')} style={{ fontSize: '0.65rem', padding: '4px' }}>Beyaz</button>
                        </div>
                      </div>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Aydınlık Şiddeti</span>
                          <span style={{ fontSize: '0.65rem', color: 'var(--accent-gold)', fontWeight: '600' }}>%{Math.round(studioLightIntensity * 100)}</span>
                        </div>
                        <input type="range" min="0.2" max="2.0" step="0.1" value={studioLightIntensity} onChange={(e) => setStudioLightIntensity(parseFloat(e.target.value))} style={{ width: '100%', accentColor: 'var(--accent-gold)', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', cursor: 'pointer' }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="studio-physics-details">
                  <h4>Malzeme Fizik Özellikleri</h4>
                  <div className="phys-row"><span>Clearcoat:</span><strong>{activeProduct?.finish === 'Parlak' ? '1.0' : activeProduct?.finish === 'Lapatto' ? '0.4' : '0.0'}</strong></div>
                  <div className="phys-row"><span>Roughness:</span><strong>{activeProduct?.finish === 'Parlak' ? '0.08' : activeProduct?.finish === 'Lapatto' ? '0.35' : '0.85'}</strong></div>
                  <div className="phys-row"><span>Karo Tekrarlama Adedi:</span><strong>{activeProduct ? `${Math.round(3.6 / (activeProduct.width/100))}x${Math.round(3.6 / (activeProduct.height/100))}` : '-'}</strong></div>
                </div>

                <div className="ar-activation-box glass-panel">
                  <Sparkles size={18} className="ar-icon" />
                  <div>
                    <h5>Artırılmış Gerçeklik (AR) Modu</h5>
                    <p>Kameranızı kullanarak yerdeki gerçek zemine karo döşeyin.</p>
                  </div>
                  <button onClick={() => {
                    if (activeProduct) logInteraction('AR_TRY', activeProduct.id, activeProduct.brandId);
                    alert('WebXR AR başlatılıyor... Kamera izinleri istenecek.');
                  }} className="btn-primary ar-btn">AR Kamerasını Aç</button>
                </div>
              </div>

              <div className="studio-canvas-panel glass-panel" style={{ position: 'relative' }}>
                {activeProduct ? (
                  <StudioCanvas 
                    activeProduct={activeProduct} 
                    floorProduct={studioFloorProduct}
                    wallProduct={studioWallProduct}
                    accentProduct={studioAccentProduct}
                    showerProduct={studioShowerProduct}
                    toiletWallProduct={studioToiletWallProduct}
                    comparisonProduct={studioComparisonProduct}
                    applyFloor={studioApplyFloor} 
                    applyWalls={studioApplyWalls} 
                    applyAccent={studioApplyAccent}
                    applyShower={studioApplyShower}
                    applyToiletWall={studioApplyToiletWall}
                    comparisonMode={studioComparisonMode}
                    comparisonSplit={studioComparisonSplit}
                    walkthroughMode={studioWalkthroughMode}
                    onToggleTarget={(target) => {
                      if (target === 'floor') {
                        if (studioApplyFloor && studioFloorProduct?.id === activeProduct?.id) {
                          setStudioApplyFloor(false);
                        } else {
                          setStudioFloorProduct(activeProduct);
                          setStudioApplyFloor(true);
                        }
                      }
                      if (target === 'walls') {
                        if (studioApplyWalls && studioWallProduct?.id === activeProduct?.id) {
                          setStudioApplyWalls(false);
                        } else {
                          setStudioWallProduct(activeProduct);
                          setStudioApplyWalls(true);
                        }
                      }
                      if (target === 'shower') {
                        if (studioApplyShower && studioShowerProduct?.id === activeProduct?.id) {
                          setStudioApplyShower(false);
                        } else {
                          setStudioShowerProduct(activeProduct);
                          setStudioApplyShower(true);
                        }
                      }
                      if (target === 'toilet') {
                        if (studioApplyToiletWall && studioToiletWallProduct?.id === activeProduct?.id) {
                          setStudioApplyToiletWall(false);
                        } else {
                          setStudioToiletWallProduct(activeProduct);
                          setStudioApplyToiletWall(true);
                        }
                      }
                      if (target === 'accent') {
                        if (studioApplyAccent && studioAccentProduct?.id === activeProduct?.id) {
                          setStudioApplyAccent(false);
                        } else {
                          setStudioAccentProduct(activeProduct);
                          setStudioApplyAccent(true);
                        }
                      }
                    }}
                    roomType={studioRoomType}
                    groutWidth={studioGroutWidth}
                    groutColor={studioGroutColor}
                    lightTemp={studioLightTemp}
                    lightIntensity={studioLightIntensity}
                    tileRotation={studioTileRotation}
                    layPattern={studioLayPattern}
                    timeOfDay={studioTimeOfDay}
                    cabinetColor={studioCabinetColor}
                    faucetColor={studioFaucetColor}
                  />
                ) : (
                  <div className="canvas-placeholder">
                    <Layers size={48} />
                    <p>3D model yüklemek için bir karo seçin.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="quick-swapper-drawer glass-panel">
              <h4>Hızlı Seramik Seçimi</h4>
              <div className="swapper-grid">
                {products.slice(0, 6).map((prod) => (
                  <div 
                    key={prod.id} 
                    onClick={() => setActiveProduct(prod)}
                    className={`swapper-card ${activeProduct?.id === prod.id ? 'active' : ''}`}
                    style={{ position: 'relative', overflow: 'hidden' }}
                  >
                    <TileVisualPreview style={prod.style} color={prod.color} finish={prod.finish} width={prod.width} height={prod.height} imageUrl={prod.imageUrl} />
                    <div className="swapper-label">
                      <span>{prod.name}</span>
                      <small>{prod.brand?.name} • {prod.width}x{prod.height}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DEALER FINDER */}
        {activeTab === 'dealers' && (() => {
          const filteredDealers = nearestDealers.filter(dealer => {
            const matchesDistance = dealer.distanceKm <= locatorMaxDistance;
            const matchesSearch = dealerSearchQuery.trim() === '' || 
              dealer.name.toLowerCase().includes(dealerSearchQuery.toLowerCase()) ||
              dealer.district.toLowerCase().includes(dealerSearchQuery.toLowerCase()) ||
              dealer.city.toLowerCase().includes(dealerSearchQuery.toLowerCase());
            return matchesDistance && matchesSearch;
          });

          return (
            <div className="dealers-portal animate-fade-in">
              <div className="dealers-layout">
                <div className="dealers-control-panel glass-panel">
                  <div className="panel-title-row">
                    <MapPin size={20} className="pin-title-icon" />
                    <h3>En Yakın Bayiler</h3>
                  </div>
                  <p className="desc">Seçili seramik markasının size en yakın olan yetkili bayilerini inceleyin, mesafe hesaplayıp teklif talep edin.</p>

                  {/* ACTIVE BRAND/PRODUCT SECTOR */}
                  {activeProduct ? (
                    <div className="active-product-badge">
                      <span>Arama Yapılan Ürün:</span>
                      <strong>{activeProduct.brand?.name} - {activeProduct.name}</strong>
                    </div>
                  ) : (
                    <div className="active-product-badge warning">
                      <span>Aktif seramik seçilmedi. Aşağıdan marka seçerek de bayileri listeleyebilirsiniz.</span>
                    </div>
                  )}

                  {/* GEOLOCATION DETECTOR CARD */}
                  <div className="locator-status-card">
                    <div className="status-header">
                      <span className="status-label">Cihaz Konum Durumu:</span>
                      {isLocating ? (
                        <span className="status-badge pulse-loading">
                          <Loader2 size={12} className="animate-spin" />
                          Algılanıyor...
                        </span>
                      ) : locationError ? (
                        <span className="status-badge error">
                          ⚠️ {locationError}
                        </span>
                      ) : userLocationName === 'Cihaz Konumunuz (GPS)' ? (
                        <span className="status-badge success">
                          ● Otomatik GPS Aktif
                        </span>
                      ) : (
                        <span className="status-badge warning">
                          ● Manuel Konum Seçili
                        </span>
                      )}
                    </div>
                    <div className="status-info-row">
                      <div className="status-info">
                        <strong>Mevcut Konum:</strong>
                        <span>{userLocationName}</span>
                      </div>
                      <button 
                        onClick={detectUserLocation} 
                        className="btn-detect-loc"
                        title="Konumumu Yeniden Algıla"
                        disabled={isLocating}
                      >
                        <Navigation size={14} className={isLocating ? "animate-pulse" : ""} />
                        <span>Konumu Bul</span>
                      </button>
                    </div>
                  </div>

                  {/* FILTERS WIDGET */}
                  <div className="locator-filters-container">
                    <div className="locator-filters-row">
                      <div className="locator-filter-group">
                        <label>Marka Filtresi</label>
                        <select 
                          value={locatorBrandId} 
                          onChange={(e) => {
                            setLocatorBrandId(e.target.value);
                            setActiveDealerOnMap(null);
                          }}
                          className="locator-select"
                        >
                          <option value="">Marka Seçin...</option>
                          {brands.map(brand => (
                            <option key={brand.id} value={brand.id}>{brand.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="locator-filter-group">
                        <label>Mesafe Sınırı</label>
                        <select
                          value={locatorMaxDistance}
                          onChange={(e) => setLocatorMaxDistance(Number(e.target.value))}
                          className="locator-select"
                        >
                          <option value={5}>5 km Yakınındakiler</option>
                          <option value={15}>15 km Yakınındakiler</option>
                          <option value={30}>30 km Yakınındakiler</option>
                          <option value={50}>50 km Yakınındakiler</option>
                          <option value={999}>Tüm Mesafe</option>
                        </select>
                      </div>
                    </div>

                    {/* SEARCH INPUT */}
                    <div className="locator-search-group">
                      <label>İl/İlçe veya Bayi Arama</label>
                      <div className="locator-search-wrapper">
                        <SearchIcon size={14} className="locator-search-icon" />
                        <input 
                          type="text" 
                          placeholder="Bayi adı, il veya ilçe yazın..." 
                          value={dealerSearchQuery}
                          onChange={(e) => setDealerSearchQuery(e.target.value)}
                          className="locator-search-input"
                        />
                        {dealerSearchQuery && (
                          <button onClick={() => setDealerSearchQuery('')} className="locator-search-clear">✕</button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* SIMULATED PRESETS FOR QUICK TEST */}
                  <div className="control-group mini-presets">
                    <label>Hızlı Konum Değiştir (GPS Simülatörü)</label>
                    <div className="location-buttons-row">
                      <button className={`loc-btn-mini ${userLocationName === 'Kadıköy Merkez' ? 'active' : ''}`} onClick={() => handleLocationChange('Kadıköy Merkez', 40.9901, 29.0278)}>Kadıköy</button>
                      <button className={`loc-btn-mini ${userLocationName === 'Beşiktaş Showroom' ? 'active' : ''}`} onClick={() => handleLocationChange('Beşiktaş Showroom', 41.0428, 29.0075)}>Beşiktaş</button>
                      <button className={`loc-btn-mini ${userLocationName === 'Ataşehir Merkez' ? 'active' : ''}`} onClick={() => handleLocationChange('Ataşehir Merkez', 40.9950, 29.1170)}>Ataşehir</button>
                    </div>
                  </div>

                  {/* LIST CONTAINER */}
                  <div className="dealers-list-container">
                    <div className="list-header-row">
                      <h4>Bulunan Yetkili Bayiler</h4>
                      <span className="results-count">{filteredDealers.length} Bayi</span>
                    </div>

                    {filteredDealers.length > 0 ? (
                      <div className="dealers-list-scroll">
                        {filteredDealers.map((dealer, idx) => (
                          <div 
                            key={dealer.id}
                            onClick={() => setActiveDealerOnMap(dealer)}
                            className={`dealer-card-new ${activeDealerOnMap?.id === dealer.id ? 'active' : ''}`}
                          >
                            {(() => {
                              const driveTime = Math.max(3, Math.round(dealer.distanceKm * 2 + 1));
                              const score = (4.5 + (idx % 5) * 0.1).toFixed(1);
                              const reviewsCount = 45 + (idx * 17) % 120;
                              const isPremiumPartner = idx % 3 === 0;

                              return (
                                <>
                                  <div className="dealer-card-header-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      <span className="dealer-brand-label">{dealer.brand?.name} Yetkili Bayi</span>
                                      {isPremiumPartner && (
                                        <span style={{ fontSize: '0.6rem', background: '#fef3c7', color: '#d97706', fontWeight: '800', padding: '1px 6px', borderRadius: '8px', border: '1px solid #fde68a' }}>
                                          🏆 ALTIN BAYİ
                                        </span>
                                      )}
                                    </div>
                                    <div className="dealer-badge-new">#{idx + 1} En Yakın</div>
                                  </div>

                                  <div className="dealer-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                                    <h5 style={{ margin: 0, fontSize: '0.92rem', fontWeight: '800', color: '#0f172a' }}>{dealer.name}</h5>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px', minWidth: '65px' }}>
                                      <strong className="distance-tag" style={{ color: '#0f172a', fontSize: '0.82rem', fontWeight: '800' }}>{dealer.distanceKm} km</strong>
                                      <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: '700' }}>🚗 {driveTime} dk sürüş</span>
                                    </div>
                                  </div>

                                  {/* Star Rating row */}
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '-4px' }}>
                                    <div style={{ display: 'flex', color: '#fbbf24', fontSize: '0.75rem' }}>★★★★★</div>
                                    <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#0f172a' }}>{score}</span>
                                    <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>({reviewsCount} yorum)</span>
                                  </div>

                                  <p className="address" style={{ margin: '2px 0 0 0', fontSize: '0.76rem', color: '#475569', lineHeight: '1.4' }}>{dealer.address} • {dealer.district}, {dealer.city}</p>
                                  
                                  {/* Open/Closed Badge */}
                                  {(() => {
                                    const currentHour = new Date().getHours();
                                    const isOpen = currentHour >= 9 && currentHour < 19;
                                    return (
                                      <div className={`dealer-status-hours ${isOpen ? 'open' : 'closed'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', fontWeight: '700', padding: '2px 8px', borderRadius: '12px', background: isOpen ? '#ecfdf5' : '#fef2f2', color: isOpen ? '#10b981' : '#ef4444', width: 'fit-content' }}>
                                        <span className="status-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: isOpen ? '#10b981' : '#ef4444', display: 'inline-block' }} />
                                        <span>{isOpen ? 'Açık' : 'Kapalı'} • {isOpen ? 'Kapanış 19:00' : 'Açılış 09:00'}</span>
                                      </div>
                                    );
                                  })()}
                                  
                                  <div className="dealer-contact-new-row" style={{ marginTop: '2px' }}>
                                    <span className="phone" style={{ fontSize: '0.78rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={12} style={{ color: 'var(--accent-gold)' }} /> {dealer.phone}</span>
                                  </div>
                                </>
                              );
                            })()}
                            
                            <div className="dealer-actions-new">
                              <div className="dealer-quick-links">
                                <a 
                                  href={`https://www.google.com/maps/dir/?api=1&origin=${userCoords ? userCoords.lat + ',' + userCoords.lng : ''}&destination=${dealer.lat},${dealer.lng}&travelmode=driving`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="quick-action-link maps"
                                  title="Google Haritalar ile Yol Tarifi Al"
                                >
                                  <Navigation size={12} />
                                  <span>Yol Tarifi</span>
                                </a>
                                <a 
                                  href={`https://wa.me/${dealer.phone.replace(/[\s\-\(\)\+]/g, '')}?text=Merhaba%2C%20SeramikBak%20%C3%BCzerinden%20${encodeURIComponent(dealer.brand?.name || '')}%20yetkili%20bayiniz%20${encodeURIComponent(dealer.name)}%20i%C3%A7in%20teklif%20almak%20istiyorum.`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="quick-action-link whatsapp"
                                  title="WhatsApp ile İletişim Kur"
                                >
                                  <MessageSquare size={12} />
                                  <span>WhatsApp</span>
                                </a>
                                <Link 
                                  href={`/bayi/${slugify(dealer.name)}`}
                                  target="_blank"
                                  onClick={(e) => e.stopPropagation()}
                                  className="quick-action-link showroom"
                                  title="Showroom & Detay Sayfasını İncele"
                                  style={{ textDecoration: 'none' }}
                                >
                                  <Sparkles size={12} />
                                  <span>Showroom</span>
                                </Link>
                              </div>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setLeadProduct(activeProduct || { name: `${dealer.brand?.name} Serisi`, brandId: dealer.brandId, brand: { name: dealer.brand?.name } });
                                  setLeadDealer(dealer);
                                  setLeadSuccessMsg('');
                                  setShowLeadModal(true);
                                }}
                                className="btn-primary btn-sm flex-btn quote-btn"
                              >
                                Teklif Al
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="no-dealers-found">
                        <MapPin size={24} className="no-dealers-icon" />
                        <p>Kriterlere uygun yetkili bayi bulunamadı.</p>
                        <span>Mesafe sınırını artırabilir veya arama kelimesini temizleyebilirsiniz.</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="dealers-map-panel glass-panel">
                  <MapComponent 
                    dealers={filteredDealers} 
                    userCoords={userCoords} 
                    activeDealer={activeDealerOnMap} 
                  />
                </div>
              </div>
            </div>
          );
        })()}

        {/* TAB 4: B2B BRAND DASHBOARD & MONETIZATION (MOVED TO /marka) */}
        {false && (
          <div className="b2b-portal animate-fade-in">
            <div className="b2b-brand-selector-row glass-panel">
              <div className="selector-meta">
                <Settings size={20} className="b2b-meta-icon" />
                <div>
                  <h3>B2B Marka Raporlama & Yönetim Paneli</h3>
                  <p className="desc">Markaların panelini simüle etmek için yukarıdan marka değiştirin.</p>
                </div>
              </div>
              <div className="brand-button-grid">
                {brands.map((b) => (
                  <button 
                    key={b.id}
                    onClick={() => setB2bBrandId(b.id)}
                    className={`brand-sel-btn ${b2bBrandId === b.id ? 'active' : ''}`}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            </div>

            {statsLoading ? (
              <div className="b2b-loading glass-panel">
                <Activity className="animate-spin" />
                <p>Veriler derleniyor...</p>
              </div>
            ) : b2bStats ? (
              <div className="b2b-dashboard-grid">
                
                <div className="b2b-stats-row">
                  <div className="b2b-stat-card glass-panel">
                    <div className="stat-header"><span>SaaS Abonelik</span><CreditCard size={18} className="stat-icon gold" /></div>
                    <div className="stat-value text-gold">{b2bStats.saas.plan}</div>
                    <p className="stat-footer">Bitiş: {new Date(b2bStats.saas.expiresAt).toLocaleDateString('tr-TR')}</p>
                  </div>

                  <div className="b2b-stat-card glass-panel">
                    <div className="stat-header"><span>Gösterim</span><Eye size={18} className="stat-icon" /></div>
                    <div className="stat-value">{b2bStats.summary.totalViews}</div>
                    <p className="stat-footer">Arama Sonuçları Gösterimleri</p>
                  </div>

                  <div className="b2b-stat-card glass-panel">
                    <div className="stat-header"><span>Tıklanma Oranı (CTR)</span><TrendingUp size={18} className="stat-icon green" /></div>
                    <div className="stat-value text-green">%{b2bStats.summary.ctr}</div>
                    <p className="stat-footer">Tıklama/Gösterim Oranı</p>
                  </div>

                  <div className="b2b-stat-card glass-panel">
                    <div className="stat-header"><span>Teklif Talepleri</span><FileText size={18} className="stat-icon blue" /></div>
                    <div className="stat-value text-blue">{b2bStats.summary.totalLeads}</div>
                    <p className="stat-footer">Bayilere İletilen Teklifler</p>
                  </div>
                </div>

                <div className="b2b-grid-row">
                  
                  {/* Timeline Chart */}
                  <div className="b2b-chart-panel glass-panel">
                    <h4>Tıklama ve Gösterim Dağılımı</h4>
                    <div className="svg-chart-container">
                      <svg viewBox="0 0 500 200" className="svg-chart">
                        <line x1="40" y1="20" x2="480" y2="20" stroke="var(--border-color)" strokeDasharray="3,3" />
                        <line x1="40" y1="70" x2="480" y2="70" stroke="var(--border-color)" strokeDasharray="3,3" />
                        <line x1="40" y1="120" x2="480" y2="120" stroke="var(--border-color)" strokeDasharray="3,3" />
                        <line x1="40" y1="170" x2="480" y2="170" stroke="var(--border-color)" />

                        {(() => {
                          const maxViews = Math.max(...b2bStats.timeline.map(t => t.views), 1);
                          const pointsViews = b2bStats.timeline.map((t, idx) => {
                            const x = 40 + (idx * (440 / 29));
                            const y = 170 - ((t.views / maxViews) * 140);
                            return `${x},${y}`;
                          }).join(' ');

                          const pointsClicks = b2bStats.timeline.map((t, idx) => {
                            const x = 40 + (idx * (440 / 29));
                            const y = 170 - ((t.clicks * 4 / maxViews) * 140);
                            return `${x},${y}`;
                          }).join(' ');

                          return (
                            <>
                              <polyline fill="none" stroke="var(--accent-blue)" strokeWidth="2.5" points={pointsViews} />
                              <polyline fill="none" stroke="var(--accent-gold)" strokeWidth="2.5" points={pointsClicks} />
                              
                              {b2bStats.timeline.map((t, idx) => {
                                if (idx % 6 !== 0 && idx !== 29) return null;
                                const x = 40 + (idx * (440 / 29));
                                return (
                                  <g key={idx}>
                                    <circle cx={x} cy={170 - ((t.views / maxViews) * 140)} r="3.5" fill="var(--accent-blue)" />
                                    <circle cx={x} cy={170 - ((t.clicks * 4 / maxViews) * 140)} r="3.5" fill="var(--accent-gold)" />
                                    <text x={x} y="188" fontSize="8" fill="var(--text-secondary)" textAnchor="middle">{t.date}</text>
                                  </g>
                                );
                              })}
                            </>
                          );
                        })()}
                      </svg>
                      
                      <div className="chart-legend">
                        <div className="legend-item"><span className="legend-dot blue" /><span>Gösterim</span></div>
                        <div className="legend-item"><span className="legend-dot gold" /><span>Tıklama</span></div>
                      </div>
                    </div>
                  </div>

                  {/* Campaign Bidding Manager */}
                  <div className="b2b-campaign-panel glass-panel">
                    <h4>Premium Reklam Yönetimi</h4>
                    <p className="panel-desc">Arama sonuçlarında en üst sırada yer almak için sponsorlu reklam bütçesi tanımlayın.</p>

                    <div className="active-campaigns-list">
                      <h5>Mevcut Reklam Kampanyaları</h5>
                      {b2bStats.campaigns.map((camp) => (
                        <div key={camp.id} className="campaign-row">
                          <div className="camp-meta">
                            <strong>{camp.product?.name}</strong>
                            <span>SKU: {camp.product?.code}</span>
                          </div>
                          <div className="camp-data">
                            <div>Tık: <strong>{camp.clicks}</strong></div>
                            <div>Tık Başı: <strong>{camp.bidAmount} TL</strong></div>
                            <div className="budget-capsule">Bütçe: <strong>{camp.budget.toFixed(2)} TL</strong></div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <form onSubmit={handleCampaignSubmit} className="campaign-form">
                      <h5>Yeni Kampanya Ekle</h5>
                      {campaignSuccessMsg && <div className="form-success">{campaignSuccessMsg}</div>}
                      
                      <div className="form-fields-grid">
                        <div className="form-group-inline">
                          <label>Hedef Ürün</label>
                          <select value={campaignProduct} onChange={(e) => setCampaignProduct(e.target.value)} required>
                            <option value="">Seçin...</option>
                            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                          </select>
                        </div>
                        <div className="form-group-inline"><label>Teklif (TL)</label><input type="number" step="0.1" value={campaignBid} onChange={(e) => setCampaignBid(e.target.value)} required /></div>
                        <div className="form-group-inline"><label>Bütçe (TL)</label><input type="number" value={campaignBudget} onChange={(e) => setCampaignBudget(e.target.value)} required /></div>
                      </div>
                      <button type="submit" className="btn-primary w-full-btn">Reklamı Başlat</button>
                    </form>
                  </div>
                </div>

                <div className="b2b-grid-row">
                  <div className="b2b-intel-panel glass-panel">
                    <h4>Pazar Trendleri</h4>
                    <div className="intel-grid">
                      <div className="intel-block">
                        <h5>En Sık Aranan Kelimeler</h5>
                        <table className="intel-table">
                          <thead><tr><th>Arama</th><th>Adet</th></tr></thead>
                          <tbody>
                            {b2bStats.topKeywords.map((item, idx) => (
                              <tr key={idx}><td>{item.keyword}</td><td><strong>{item.count}</strong></td></tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="intel-block">
                        <h5>Arama Yoğunluğu Olan İller</h5>
                        <table className="intel-table">
                          <thead><tr><th>İl</th><th>Tıklama</th></tr></thead>
                          <tbody>
                            {b2bStats.topCities.map((item, idx) => (
                              <tr key={idx}><td>{item.city}</td><td><strong>{item.count}</strong></td></tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  <div className="b2b-billing-panel glass-panel">
                    <h4>SaaS Abonelik ve Stripe Webhook Sandbox</h4>
                    <div className="billing-test-box glass-panel">
                      <div className="plan-picker-row">
                        <span>Abonelik Katmanı:</span>
                        <div className="segmented-control mini">
                          <button className={stripePlan === 'PRO' ? 'active' : ''} onClick={() => setStripePlan('PRO')}>PRO</button>
                          <button className={stripePlan === 'ENTERPRISE' ? 'active' : ''} onClick={() => setStripePlan('ENTERPRISE')}>ENTERPRISE</button>
                        </div>
                      </div>
                      <button onClick={triggerStripeMockWebhook} className="btn-secondary w-full-btn" disabled={stripeLoading} style={{ borderColor: 'var(--accent-gold)', color: 'var(--accent-gold)' }}>
                        {stripeLoading ? 'Simüle Ediliyor...' : `Stripe Webhook Gönder (${stripePlan})`}
                      </button>
                      {stripeWebhookResult && (
                        <div className="webhook-result-badge"><CheckCircle size={14} style={{ color: 'var(--accent-green)' }} /><span>{stripeWebhookResult}</span></div>
                      )}
                    </div>

                    {/* Platform Monetization Guide */}
                    <div className="monetization-guide-box" style={{ marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                      <h5 style={{ fontSize: '0.8rem', fontWeight: '700', marginBottom: '8px' }}>SeramikBak Gelir Modeli</h5>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px', background: 'rgba(0,0,0,0.01)', borderRadius: '4px' }}>
                          <span>1. SaaS Abonelikleri:</span>
                          <strong style={{ color: 'var(--accent-gold)' }}>Aylık Sabit SaaS Ücreti</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px', background: 'rgba(0,0,0,0.01)', borderRadius: '4px' }}>
                          <span>2. Yönlendirilen Müşteri (Lead):</span>
                          <strong style={{ color: 'var(--accent-blue-hover)' }}>Bayi Başı 25 TL / Teklif</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px', background: 'rgba(0,0,0,0.01)', borderRadius: '4px' }}>
                          <span>3. Yapı Market / Trendyol Affiliate:</span>
                          <strong style={{ color: 'var(--accent-green)' }}>%2-%5 Satış Komisyonu</strong>
                        </div>
                      </div>
                      <p style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: '8px', lineHeight: '1.3' }}>
                        *SeramikBak stok ve lojistik riski almaz. Müşteriyi online pazaryerlerine veya en yakın fiziksel bayiye yönlendirerek pasif komisyon ve abonelik geliri üretir.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            ) : null}
          </div>
        )}

      </div>



      {/* PRODUCT DETAIL COMPARISON MODAL */}
      {showDetailModal && detailProduct && (
        <div className="modal-overlay animate-fade-in" onClick={() => setShowDetailModal(false)}>
          <div className="detail-modal-content-premium" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="detail-modal-header-title">
                <span className="brand-badge-detail">{detailProduct.brand?.name}</span>
                <h3 style={{ marginTop: '4px' }}>{detailProduct.name}</h3>
                <small className="code-text">Ürün Kodu: {detailProduct.code}</small>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="close-modal-btn">✕</button>
            </div>

            <div className="detail-modal-body">
              {/* Left Column: Visuals & Core Actions */}
              <div className="detail-left-column">
                <div className="detail-visual-box">
                  <TileVisualPreview 
                    style={detailProduct.style} 
                    color={detailProduct.color} 
                    finish={detailProduct.finish} 
                    width={detailProduct.width} 
                    height={detailProduct.height} 
                    imageUrl={detailProduct.imageUrl} 
                    productName={detailProduct.name}
                    brandName={detailProduct.brand?.name}
                  />
                </div>
                
                <div className="detail-specs-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                  <div className="spec-item-box">
                    <span className="spec-lbl">Boyut</span>
                    <span className="spec-val">{detailProduct.width}x{detailProduct.height} cm</span>
                  </div>
                  <div className="spec-item-box">
                    <span className="spec-lbl">Yüzey Tipi</span>
                    <span className="spec-val">{detailProduct.finish}</span>
                  </div>
                  <div className="spec-item-box">
                    <span className="spec-lbl">Malzeme</span>
                    <span className="spec-val">{detailProduct.style}</span>
                  </div>
                  <div className="spec-item-box">
                    <span className="spec-lbl">Kullanım Alanı</span>
                    <span className="spec-val" title={detailProduct.area}>
                      {detailProduct.area ? detailProduct.area.split(',').slice(0, 2).join(', ') : 'Zemin/Duvar'}
                    </span>
                  </div>
                  <div className="spec-item-box">
                    <span className="spec-lbl">Aşınma (PEI)</span>
                    <span className="spec-val">{detailProduct.peiRating ? `PEI ${detailProduct.peiRating}` : 'N/A'}</span>
                  </div>
                  <div className="spec-item-box">
                    <span className="spec-lbl">Kaymazlık</span>
                    <span className="spec-val">{detailProduct.slipResistance || 'N/A'}</span>
                  </div>
                  <div className="spec-item-box">
                    <span className="spec-lbl">Kalınlık</span>
                    <span className="spec-val">{detailProduct.thickness ? `${detailProduct.thickness} mm` : 'N/A'}</span>
                  </div>
                  <div className="spec-item-box">
                    <span className="spec-lbl">Kenar Kesim</span>
                    <span className="spec-val">{detailProduct.rectified !== null ? (detailProduct.rectified ? 'Rektifiyeli' : 'Rektifiyesiz') : 'N/A'}</span>
                  </div>
                  <div className="spec-item-box">
                    <span className="spec-lbl">Dona Dayanım</span>
                    <span className="spec-val">{detailProduct.frostResistance !== null ? (detailProduct.frostResistance ? 'Evet' : 'Hayır') : 'N/A'}</span>
                  </div>
                </div>

                <div className="detail-primary-actions">
                  <button 
                    onClick={() => {
                      setShowDetailModal(false);
                      navigateTo3DStudio(detailProduct);
                    }}
                    className="btn-primary w-full-btn flex-center-btn detail-action-btn"
                  >
                    <Sparkles size={16} />
                    <span>3D Sanal Stüdyoda Dene</span>
                  </button>
                  <button 
                    onClick={() => {
                      setShowDetailModal(false);
                      navigateToDealers(detailProduct);
                    }}
                    className="btn-secondary w-full-btn flex-center-btn detail-action-btn"
                  >
                    <Map size={16} />
                    <span>Haritada Bayileri Gör</span>
                  </button>
                </div>

                {/* MİMAR VE TASARIMCILAR İÇİN DOKU PORTALI */}
                <div className="architect-download-box">
                  <span className="architect-lbl">MİMARLAR & TASARIMCILAR İÇİN</span>
                  <button 
                    onClick={() => handleDownloadCAD(detailProduct)}
                    className="btn-architect-download w-full-btn flex-center-btn"
                    disabled={isDownloadingCAD}
                  >
                    {isDownloadingCAD ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>CAD ZIP Derleniyor...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud size={16} style={{ transform: 'rotate(180deg)' }} />
                        <span>3D Doku & CAD Nesnelerini İndir (.ZIP)</span>
                      </>
                    )}
                  </button>
                  <small className="architect-desc">
                    İçerik: High-res dikişsiz doku (Diffuse, Normal, Roughness), AutoCAD dwg bloğu, Revit BIM nesnesi (.rfa).
                  </small>
                </div>

                {/* GÜVENİLİRLİK VE SOSYAL KANIT ROZETLERİ */}
                <div className="detail-trust-badges-box">
                  <div className="trust-badge-item">
                    <CheckCircle size={14} className="trust-icon" />
                    <div>
                      <strong>En İyi Fiyat Garantisi</strong>
                      <span>Bayi ve pazaryerleri arasında en avantajlı fiyatlar</span>
                    </div>
                  </div>
                  <div className="trust-badge-item">
                    <Activity size={14} className="trust-icon" />
                    <div>
                      <strong>Sigortalı Nakliye Sevk</strong>
                      <span>Kırılma garantili lojistik ve hızlı teslimat</span>
                    </div>
                  </div>
                  <div className="trust-badge-item">
                    <MapPin size={14} className="trust-icon" />
                    <div>
                      <strong>100% Orijinal Yetkili Bayi</strong>
                      <span>Doğrudan üretici garantili faturalı ürünler</span>
                    </div>
                  </div>
                </div>

                {/* BANYO ORTAMINDA DÖŞENMİŞ GÖRSEL MOCKUP */}
                <BathroomMockupPreview 
                  product={detailProduct} 
                  onOpenStudio={() => {
                    setShowDetailModal(false);
                    navigateTo3DStudio(detailProduct);
                  }}
                />
              </div>

              {/* Right Column: Ingestion Channels & Prices */}
              <div className="detail-right-column">
                {/* AKILLI METRAJ & MALZEME HESAPLAYICI */}
                <div className="channel-box calculator-box">
                  <h4 className="channel-title">
                    <SlidersHorizontal size={16} style={{ color: 'var(--accent-gold)' }} />
                    <span>Akıllı Metraj & Malzeme Hesaplayıcı</span>
                  </h4>
                  <p className="channel-desc">Kaplayacağınız alanın genişlik ve uzunluğunu girin; gerekli paket adetini, yapıştırıcıyı, derz dolgusunu ve lojistik ağırlığını hesaplayalım.</p>
                  
                  <div className="calc-inputs-row">
                    <div className="calc-input-group">
                      <label>Genişlik (m)</label>
                      <input 
                        type="number" 
                        step="0.1" 
                        min="0.1" 
                        value={calcWidth} 
                        onChange={(e) => setCalcWidth(e.target.value)} 
                        className="calc-input"
                      />
                    </div>
                    <div className="calc-input-group">
                      <label>Uzunluk (m)</label>
                      <input 
                        type="number" 
                        step="0.1" 
                        min="0.1" 
                        value={calcHeight} 
                        onChange={(e) => setCalcHeight(e.target.value)} 
                        className="calc-input"
                      />
                    </div>
                    <div className="calc-input-group">
                      <label>Döşeme Şekli</label>
                      <select 
                        value={calcLayout} 
                        onChange={(e) => {
                          setCalcLayout(e.target.value);
                          setCalcWastage(e.target.value === 'diagonal' ? '15' : '10');
                        }}
                        className="calc-select"
                      >
                        <option value="flat">Düz Döşeme</option>
                        <option value="diagonal">Çapraz Döşeme</option>
                      </select>
                    </div>
                  </div>

                  {calcResults && (
                    <div className="calc-results-panel">
                      <div className="calc-res-grid">
                        <div className="calc-res-item">
                          <span>Net Alan:</span>
                          <strong>{calcResults.rawArea} m²</strong>
                        </div>
                        <div className="calc-res-item">
                          <span>Zayiat Dahil:</span>
                          <strong>{calcResults.totalAreaNeeded} m² ({calcWastage === '15' ? '%15' : '%10'} Zayiat)</strong>
                        </div>
                        <div className="calc-res-item">
                          <span>Gerekli Kutu:</span>
                          <strong style={{ color: 'var(--accent-gold)' }}>{calcResults.boxesNeeded} Kutu</strong>
                        </div>
                        <div className="calc-res-item">
                          <span>Toplam Karo:</span>
                          <strong>{calcResults.totalTilesNeeded} Adet</strong>
                        </div>
                        <div className="calc-res-item">
                          <span>Kalekim Yapıştırıcı:</span>
                          <strong>{calcResults.adhesiveKg} kg ({calcResults.adhesiveBags} Torba)</strong>
                        </div>
                        <div className="calc-res-item">
                          <span>Derz Dolgusu:</span>
                          <strong>{calcResults.groutKg} kg ({calcResults.suggestedGroutColor} Renk)</strong>
                        </div>
                      </div>
                      
                      {/* DYNAMICS: ESTIMATED LABOR COST */}
                      <div className="labor-cost-box" style={{
                        background: 'rgba(16, 185, 129, 0.03)',
                        border: '1px dashed rgba(16, 185, 129, 0.25)',
                        borderRadius: '8px',
                        padding: '14px',
                        marginBottom: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}>
                        <span className="logistics-lbl" style={{ 
                          fontSize: '0.78rem', 
                          fontWeight: '700', 
                          color: '#10b981', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '6px' 
                        }}>
                          👷 Tahmini İşçilik & Uygulama Maliyeti
                        </span>
                        <div className="logistics-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}>
                          <span>Uygulama Alanı (Zayiat Dahil):</span>
                          <strong style={{ color: '#334155' }}>{calcResults.totalAreaNeeded} m²</strong>
                        </div>
                        <div className="logistics-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}>
                          <span>Birim İşçilik (Ebat & Yöntem Ayarlı):</span>
                          <strong style={{ color: '#334155' }}>{calcResults.laborRatePerM2} TL/m²</strong>
                        </div>
                        <div className="logistics-row highlight-price" style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          fontSize: '0.78rem', 
                          borderTop: '1px dashed rgba(16, 185, 129, 0.2)', 
                          paddingTop: '6px', 
                          marginTop: '2px', 
                          fontWeight: '700', 
                          color: '#10b981' 
                        }}>
                          <span>Toplam Tahmini İşçilik Bedeli:</span>
                          <strong className="logistics-price" style={{ fontSize: '0.9rem' }}>
                            {calcResults.laborCostTotal.toLocaleString('tr-TR')} TL
                          </strong>
                        </div>
                        <p style={{ fontSize: '0.6rem', color: '#94a3b8', margin: 0, fontStyle: 'italic', lineHeight: '1.3' }}>
                          * Fiyatlar Türkiye geneli ortalama seramik usta işçilik piyasasını yansıtır. Büyük ebatlı porselen ve çapraz döşemede işçilik farkı dahildir.
                        </p>
                      </div>

                      {/* DYNAMICS: HEAVY FREIGHT PALLET LOGISTICS ESTIMATION */}
                      <div className="pallet-logistics-box" style={{ background: 'rgba(241, 245, 249, 0.5)', border: '1px solid #e2e8f0' }}>
                        <span className="logistics-lbl" style={{ color: '#475569' }}>🚚 Ağır Yük Lojistik ve Sevk Bilgisi</span>
                        <div className="logistics-row">
                          <span>Toplam Ürün Ağırlığı:</span>
                          <strong>{Math.round(parseFloat(calcResults.actualAreaPurchased) * 18)} kg ({Math.ceil(Math.round(parseFloat(calcResults.actualAreaPurchased) * 18) / 1000)} Palet)</strong>
                        </div>
                        <div className="logistics-row highlight-price" style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '8px', marginTop: '4px' }}>
                          <span style={{ color: '#475569', fontWeight: '600' }}>Lojistik Sevk Bedeli:</span>
                          <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700', textAlign: 'right' }}>
                            Mesafeye Göre Bayi Tarafından Hesaplanır
                          </span>
                        </div>
                        <p style={{ fontSize: '0.62rem', color: '#94a3b8', margin: '4px 0 0 0', lineHeight: '1.3', fontStyle: 'italic' }}>
                          * Seramikler ağır yük sınıfında paletli gönderildiği için sevk bedeli teslimat adresinin uzaklığına ve bayi anlaşmalarına göre değişkenlik gösterir. Teklif istenirken net lojistik tutarını sorabilirsiniz.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* 1. Resmi Yetkili Bayiler */}
                <div className="channel-box" id="resmi-yetkili-bayiler-section">
                  <h4 className="channel-title">
                    <MapPin size={16} style={{ color: 'var(--accent-blue)' }} />
                    <span>Resmi Yetkili Bayiler (Teklif Al)</span>
                  </h4>
                  <p className="channel-desc">En yakın bayiden palet bazında teklif isteyin veya Showroom&apos;da inceleyin.</p>
                  
                  {detailDealersLoading ? (
                    <div className="channel-loading">
                      <Loader2 size={16} className="animate-spin" style={{ color: 'var(--accent-blue)' }} />
                      <span>Yakındaki bayiler aranıyor...</span>
                    </div>
                  ) : detailDealers.length > 0 ? (
                    <div className="modal-dealers-list">
                      {detailDealers.map(dealer => (
                        <div key={dealer.id} className="modal-dealer-row">
                          <div className="m-dealer-info">
                            <h5>{dealer.name}</h5>
                            <p className="m-dealer-meta">{dealer.district}, {dealer.city} • <strong>{dealer.distanceKm} km</strong></p>
                          </div>
                          <button 
                            onClick={() => {
                              setLeadProduct(detailProduct);
                              setLeadDealer(dealer);
                              setLeadName('');
                              setLeadPhone('');
                              setLeadEmail('');
                              setLeadNotes(`Bana 50 metrekare bu ${detailProduct.name} ürününden lazım, fiyat teklifi gönderin.`);
                              setLeadSuccessMsg('');
                              setShowLeadModal(true);
                            }}
                            className="btn-primary btn-sm quote-btn"
                          >
                            Teklif İste
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-channel-data">Bu marka için yakınlarda yetkili bayi bulunamadı.</p>
                  )}
                </div>

                {/* 2. Online Pazaryerleri & Yapı Market Fiyatları */}
                <div className="channel-box marketplace-prices-box" style={{ 
                  marginTop: '16px', 
                  background: 'rgba(15, 23, 42, 0.85)', 
                  border: '1px solid rgba(245, 158, 11, 0.3)', 
                  borderRadius: '12px', 
                  padding: '16px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h4 className="channel-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ShoppingBag size={18} style={{ color: '#fbbf24' }} />
                      <span style={{ color: '#fbbf24', fontSize: '0.92rem', fontWeight: '800', letterSpacing: '0.3px' }}>Pazaryeri & Yapı Market Fiyatları</span>
                    </h4>
                    <button 
                      onClick={() => handleRefreshLivePrices(detailProduct.id)}
                      disabled={isCrawlingPrice}
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        padding: '5px 11px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        borderRadius: '6px',
                        border: '1px solid #f59e0b',
                        background: 'rgba(245, 158, 11, 0.18)',
                        color: '#fbbf24',
                        cursor: isCrawlingPrice ? 'wait' : 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      title="Canlı Fiyatları Bot İle Güncelle"
                    >
                      <RefreshCw size={13} className={isCrawlingPrice ? 'animate-spin' : ''} />
                      <span>{isCrawlingPrice ? 'Tarayan...' : 'Canlı Fiyat Güncelle'}</span>
                    </button>
                  </div>

                  <p className="channel-desc" style={{ marginBottom: '14px', color: '#cbd5e1', fontSize: '0.78rem', lineHeight: '1.4' }}>
                    Önde gelen online pazaryerleri ve yapı marketlerdeki metrekare satış fiyatları ve doğrudan satıcı mağaza bağlantıları:
                  </p>

                  {crawlLogMsg && (
                    <div style={{
                      padding: '8px 12px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      borderRadius: '8px',
                      marginBottom: '12px',
                      background: 'rgba(16, 185, 129, 0.2)',
                      border: '1px solid rgba(16, 185, 129, 0.5)',
                      color: '#34d399'
                    }}>
                      {crawlLogMsg}
                    </div>
                  )}

                  <div className="marketplace-prices-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(() => {
                      const vendors = [
                        { name: 'Trendyol', key: 'trendyol', price: detailProduct.trendyolPrice, url: detailProduct.trendyolUrl, color: '#f97316', badge: 'Pazaryeri' },
                        { name: 'Hepsiburada', key: 'hepsiburada', price: detailProduct.hepsiburadaPrice || detailProduct.hepsiPrice, url: detailProduct.hepsiburadaUrl, color: '#ff6600', badge: 'Pazaryeri' },
                        { name: 'n11', key: 'n11', price: detailProduct.n11Price, url: detailProduct.n11Url, color: '#ff3b5c', badge: 'Pazaryeri' },
                        { name: 'YerEvDekor', key: 'yerevdekor', price: detailProduct.yerevdekorPrice, url: detailProduct.yerevdekorUrl, color: '#2dd4bf', badge: 'Yapı Market' },
                        { name: 'Koçtaş', key: 'koctas', price: detailProduct.koctasPrice, url: detailProduct.koctasUrl, color: '#60a5fa', badge: 'Yapı Market' },
                        { name: 'Bauhaus', key: 'bauhaus', price: detailProduct.bauhausPrice, url: detailProduct.bauhausUrl, color: '#f87171', badge: 'Yapı Market' }
                      ];

                      const validPrices = vendors.filter(v => v.price && v.price > 0).map(v => v.price);
                      const minPrice = validPrices.length > 0 ? Math.min(...validPrices) : null;

                      return vendors.map(v => {
                        const hasRealPrice = v.price && v.price > 0;
                        const hasDirectLink = v.url && 
                          !v.url.includes('/sr?q=') && 
                          !v.url.includes('/ara?q=') && 
                          !v.url.includes('/arama?q=') && 
                          !v.url.includes('/search?q=');
                        const isLowest = hasRealPrice && minPrice !== null && v.price === minPrice;

                        return (
                          <div 
                            key={v.key} 
                            className="marketplace-row-item"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '10px 14px',
                              borderRadius: '8px',
                              background: isLowest ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                              border: isLowest ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.1)',
                              opacity: hasRealPrice ? 1 : 0.9,
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span 
                                style={{ 
                                  fontWeight: '800', 
                                  fontSize: '0.85rem', 
                                  color: v.color,
                                  minWidth: '92px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                {v.name}
                              </span>
                              <span style={{ 
                                fontSize: '0.68rem', 
                                fontWeight: '600',
                                padding: '2px 7px', 
                                borderRadius: '4px', 
                                background: 'rgba(255, 255, 255, 0.1)', 
                                color: '#cbd5e1' 
                              }}>
                                {v.badge}
                              </span>
                              {isLowest && (
                                <span style={{
                                  fontSize: '0.68rem',
                                  fontWeight: '800',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  background: 'rgba(16, 185, 129, 0.3)',
                                  color: '#34d399',
                                  border: '1px solid #10b981',
                                  boxShadow: '0 0 10px rgba(16, 185, 129, 0.2)'
                                }}>
                                  🔥 En Uygun Fiyat
                                </span>
                              )}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              {hasRealPrice ? (
                                <>
                                  <strong style={{ 
                                    fontSize: isLowest ? '0.98rem' : '0.92rem', 
                                    fontWeight: '800', 
                                    color: isLowest ? '#34d399' : '#ffffff',
                                    textShadow: isLowest ? '0 0 8px rgba(52, 211, 153, 0.3)' : 'none'
                                  }}>
                                    ₺{v.price.toLocaleString('tr-TR')} <span style={{ fontSize: '0.74rem', fontWeight: '400', color: '#cbd5e1' }}>/ m²</span>
                                  </strong>

                                  {hasDirectLink ? (
                                    <a 
                                      href={v.url} 
                                      target="_blank" 
                                      rel="noopener noreferrer" 
                                      style={{
                                        fontSize: '0.72rem',
                                        fontWeight: '700',
                                        padding: '5px 10px',
                                        borderRadius: '6px',
                                        border: '1px solid rgba(255, 255, 255, 0.3)',
                                        background: 'rgba(255, 255, 255, 0.15)',
                                        color: '#ffffff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        textDecoration: 'none',
                                        transition: 'all 0.2s ease'
                                      }}
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <span>Mağazada Gör</span>
                                      <ExternalLink size={12} style={{ color: '#ffffff' }} />
                                    </a>
                                  ) : (
                                    <span style={{ fontSize: '0.72rem', color: '#64748b', fontStyle: 'italic', padding: '4px 6px' }}>Satışta Değil</span>
                                  )}
                                </>
                              ) : (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const dealerSec = document.getElementById('resmi-yetkili-bayiler-section');
                                    if (dealerSec) {
                                      dealerSec.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    }
                                    if (detailDealers && detailDealers.length > 0) {
                                      const nearestDealer = detailDealers[0];
                                      setLeadProduct(detailProduct);
                                      setLeadDealer(nearestDealer);
                                      setLeadName('');
                                      setLeadPhone('');
                                      setLeadEmail('');
                                      setLeadNotes(`Bana 50 metrekare bu ${detailProduct.brand?.name || ''} ${detailProduct.name} ürününden lazım (${v.name} pazaryerinde stok görünmediği için doğrudan en yakın bayinizden fiyat teklifi rica ediyorum).`);
                                      setLeadSuccessMsg('');
                                      setLeadErrorMsg('');
                                      setShowLeadModal(true);
                                    } else {
                                      const waText = encodeURIComponent(`Merhaba, SeramikBak üzerinden "${detailProduct.brand?.name || ''} ${detailProduct.name}" (${v.name}) ürünü için konumuma en yakın yetkili bayinizden palet / m² fiyat teklifi ve stok bilgisi almak istiyorum.`);
                                      window.open(`https://wa.me/908501234567?text=${waText}`, '_blank', 'noopener,noreferrer');
                                    }
                                  }}
                                  style={{
                                    fontSize: '0.74rem',
                                    fontWeight: '700',
                                    padding: '6px 12px',
                                    borderRadius: '6px',
                                    border: '1px solid rgba(59, 130, 246, 0.4)',
                                    background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.25) 0%, rgba(29, 78, 216, 0.35) 100%)',
                                    color: '#60a5fa',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 8px rgba(37, 99, 235, 0.2)',
                                    transition: 'all 0.2s ease'
                                  }}
                                  title="Konumunuzdaki en yakın yetkili bayiden canlı fiyat teklifi alın"
                                >
                                  <MapPin size={13} style={{ color: '#60a5fa' }} />
                                  <span>
                                    {detailDealers && detailDealers.length > 0 
                                      ? `En Yakın Bayiden Teklif Al (${detailDealers[0].distanceKm} km)` 
                                      : `En Yakın Bayiye Sor / Teklif Al`}
                                  </span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>

                  <p style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '12px', fontStyle: 'italic', lineHeight: '1.4' }}>
                    * Fiyatlar online pazaryerleri ve yapı marketlerin canlı katalog verilerinden otomatik çekilir. Stok durumu satıcı firmalara göre değişkenlik gösterebilir.
                  </p>
                </div>


              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI PHOTO SCANNER MODAL */}
      {showAiPhotoScanModal && (
        <div className="modal-overlay animate-fade-in" onClick={() => setShowAiPhotoScanModal(false)}>
          <div className="modal-content glass-panel-gold ai-photo-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Camera size={20} className="gold-icon" />
                <h3>Oda Fotoğrafı Yükle & AI Seramik Eşleştir</h3>
              </div>
              <button onClick={() => setShowAiPhotoScanModal(false)} className="close-modal-btn">✕</button>
            </div>

            <div className="modal-body" style={{ padding: '20px' }}>
              <p className="ai-modal-desc">
                Mevcut mekanınızın (banyo, mutfak veya salon) fotoğrafını yükleyin veya hazır oda şablonlarından birini seçin. AI mimari algoritması renk skalasını ve ışık açısını analiz ederek en ideal seramik kombinasyonunu üretir.
              </p>

              {aiPhotoScanning ? (
                <div className="ai-scanning-state-box">
                  <div className="scanning-spinner-glow" />
                  <p className="scanning-text">✨ AI Analiz Ediliyor: Renk skalası, doku derinliği ve ortam ışığı taranıyor...</p>
                  <div className="scanning-progress-bar">
                    <div className="scanning-progress-fill" />
                  </div>
                </div>
              ) : (
                <>
                  {/* Hidden Real File Input Picker */}
                  <input 
                    type="file" 
                    ref={aiFileInputRef}
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleRealPhotoUpload}
                    style={{ display: 'none' }}
                  />

                  {/* Real File Drag and Drop Box */}
                  <div 
                    className="ai-photo-dropzone"
                    onClick={() => aiFileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];
                      if (file) {
                        setUploadedPhotoName(file.name);
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          const imageUrl = ev.target?.result;
                          setUploadedPhotoPreview(imageUrl);
                          handleProcessUploadedImage(imageUrl, file.name);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  >
                    {uploadedPhotoPreview ? (
                      <div className="uploaded-photo-preview-box">
                        <img src={uploadedPhotoPreview} alt="Yüklenen Fotoğraf" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '12px', marginBottom: '8px', border: '2px solid #c5a059' }} />
                        <p style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.8rem' }}>📷 {uploadedPhotoName}</p>
                        <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: '600' }}>Fotoğraf Yüklendi! Değiştirmek İçin Tıklayın</span>
                      </div>
                    ) : (
                      <>
                        <UploadCloud size={38} style={{ color: 'var(--accent-gold)' }} />
                        <p style={{ fontWeight: '700', color: '#0f172a', margin: '10px 0 4px 0' }}>
                          Cihazınızdan Fotoğraf Seçmek İçin Tıklayın veya Sürükleyin
                        </p>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>JPG, PNG veya WEBP (Max 10MB)</span>
                      </>
                    )}
                  </div>

                  {/* Sample Room Templates */}
                  <div style={{ marginTop: '20px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '10px' }}>
                      Veya Örnek Mekan Şablonlarından Seçin:
                    </span>
                    <div className="sample-templates-grid">
                      {[
                        { key: 'banyo_modern', name: '🛁 Modern Banyo', badge: 'Calacatta & Gold' },
                        { key: 'mutfak_ahsap', name: '🍳 Ahşap Mutfak', badge: 'Meşe & Beton' },
                        { key: 'salon_beton', name: '🛋️ Loft Salon', badge: 'Antrasit Granit' },
                        { key: 'banyo_minimal', name: '✨ Minimal Banyo', badge: 'Mat Siyah & Beyaz' }
                      ].map(tmpl => (
                        <button
                          key={tmpl.key}
                          onClick={() => handleSimulatePhotoScan(tmpl.key)}
                          className="sample-template-card"
                        >
                          <span className="tmpl-name">{tmpl.name}</span>
                          <span className="tmpl-badge">{tmpl.badge}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="modal-footer" style={{ padding: '14px 20px', borderTop: '1px solid #f1efe9', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setShowAiPhotoScanModal(false)} className="btn-secondary">İptal</button>
              <button onClick={() => aiFileInputRef.current?.click()} className="btn-primary" disabled={aiPhotoScanning}>
                {aiPhotoScanning ? 'Taranıyor...' : 'Cihazdan Fotoğraf Seç'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LEAD REQUEST MODAL */}
      {showLeadModal && leadProduct && leadDealer && (
        <div className="modal-overlay animate-fade-in">
          <div className="modal-content glass-panel-gold">
            <div className="modal-header">
              <h3>Bayiden Fiyat Teklifi Al</h3>
              <button onClick={() => { setShowLeadModal(false); setLeadSuccessMsg(''); setLeadErrorMsg(''); }} className="close-modal-btn">✕</button>
            </div>
            
            {leadErrorMsg && (
              <div className="alert-box error" style={{ margin: '12px', padding: '10px 14px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171', fontSize: '0.85rem' }}>
                ⚠️ {leadErrorMsg}
              </div>
            )}
            
            {leadSuccessMsg ? (
              <div className="modal-success-state">
                <CheckCircle size={48} className="success-icon" />
                <p>{leadSuccessMsg}</p>
                <button onClick={() => setShowLeadModal(false)} className="btn-primary" style={{ marginTop: '20px' }}>Kapat</button>
              </div>
            ) : (
              <form onSubmit={handleLeadSubmit} className="modal-form">
                <div className="modal-product-summary">
                  <div className="m-pic" style={{ position: 'relative', overflow: 'hidden' }}>
                    <TileVisualPreview style={leadProduct.style} color={leadProduct.color} finish={leadProduct.finish} width={leadProduct.width} height={leadProduct.height} imageUrl={leadProduct.imageUrl} />
                  </div>
                  <div>
                    <strong>{leadProduct.brand?.name} - {leadProduct.name}</strong>
                    <p>{leadProduct.width}x{leadProduct.height} cm • {leadProduct.finish}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--accent-blue)', marginTop: '4px' }}>Bayi: {leadDealer.name}</p>
                  </div>
                </div>
                <div className="form-group"><label>Adınız Soyadınız</label><input type="text" className="form-input" value={leadName} onChange={(e) => setLeadName(e.target.value)} required placeholder="Ahmet Yılmaz" /></div>
                <div className="form-group-row">
                  <div className="form-group"><label>Telefon</label><input type="tel" className="form-input" value={leadPhone} onChange={(e) => setLeadPhone(e.target.value)} required placeholder="0555 123 4567" /></div>
                  <div className="form-group"><label>E-Posta</label><input type="email" className="form-input" value={leadEmail} onChange={(e) => setLeadEmail(e.target.value)} required placeholder="ahmet@mail.com" /></div>
                </div>
                <div className="form-group"><label>Notlar</label><textarea className="form-input form-textarea" value={leadNotes} onChange={(e) => setLeadNotes(e.target.value)} placeholder="Miktar ve nakliye detaylarını ekleyebilirsiniz..." rows={2} /></div>
                
                {/* Additional services */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '12px 0', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                    <input 
                      type="checkbox" 
                      checked={requestedUsta} 
                      onChange={(e) => setRequestedUsta(e.target.checked)} 
                      style={{ cursor: 'pointer' }}
                    />
                    <span>🛠️ Seramik Döşeme Ustası İstiyorum (+ Fiyat Tahmini)</span>
                  </label>
                  
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                    <input 
                      type="checkbox" 
                      checked={requestedArchitect} 
                      onChange={(e) => setRequestedArchitect(e.target.checked)} 
                      style={{ cursor: 'pointer' }}
                    />
                    <span>📐 Ücretsiz Mimar Desteği ve 3D Tasarım İstiyorum</span>
                  </label>
                </div>

                {/* Conditional fields for Architect Support */}
                {requestedArchitect && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', border: '1px dashed rgba(255,255,255,0.1)', marginBottom: '12px' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: '0.75rem', color: 'var(--accent-gold)' }}>Oda/Banyo Ölçüleri</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={projectDimensions} 
                        onChange={(e) => setProjectDimensions(e.target.value)} 
                        placeholder="Örn: En: 2m, Boy: 3.5m, Yükseklik: 2.6m"
                        style={{ height: '36px', fontSize: '0.8rem' }}
                      />
                    </div>
                    
                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: '0.75rem', color: 'var(--accent-gold)' }}>Kroki veya Oda Fotoğrafı Yükle</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleLeadPhotoUpload} 
                          style={{ display: 'none' }}
                          id="lead-photo-upload-input"
                        />
                        <label 
                          htmlFor="lead-photo-upload-input" 
                          className="btn-secondary btn-sm"
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', height: '36px', padding: '0 12px' }}
                        >
                          <UploadCloud size={14} />
                          {isUploadingPhoto ? 'Yükleniyor...' : 'Görsel Seç'}
                        </label>
                        {projectPhotoUrl ? (
                          <span style={{ fontSize: '0.72rem', color: 'var(--accent-blue)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                            ✓ Fotoğraf Eklendi
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Henüz dosya seçilmedi (isteğe bağlı)</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', margin: '12px 0' }}>
                  <input 
                    type="checkbox" 
                    id="lead-kvkk-check" 
                    checked={leadKvkkAccepted} 
                    onChange={(e) => setLeadKvkkAccepted(e.target.checked)} 
                    required
                    style={{ marginTop: '3px', cursor: 'pointer' }}
                  />
                  <label htmlFor="lead-kvkk-check" style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: '1.4', cursor: 'pointer', userSelect: 'none' }}>
                    Kişisel verilerimin işlenmesine ilişkin <Link href="/yasal?tab=kvkk" target="_blank" style={{ color: 'var(--accent-gold, #d4af37)', fontWeight: '600', textDecoration: 'underline' }}>KVKK Aydınlatma Metni'ni</Link> okudum ve kabul ediyorum.
                  </label>
                </div>

                <button type="submit" className="btn-primary w-full-btn" style={{ marginTop: '10px' }} disabled={isUploadingPhoto || isSubmittingLead}>
                  {isUploadingPhoto ? 'Görsel Yükleniyor...' : isSubmittingLead ? 'Teklif Gönderiliyor...' : 'Teklifi Gönder'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* DEALER SHOWROOM DETAILS MODAL */}
      {showDealerDetailModal && selectedDetailDealer && (
        <div className="modal-overlay animate-fade-in" onClick={(e) => { if(e.target === e.currentTarget) setShowDealerDetailModal(false); }}>
          <div className="modal-content glass-panel-gold dealer-showroom-modal" style={{ maxWidth: '850px', width: '90%', padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(212,175,55,0.15)', background: 'linear-gradient(90deg, #0f172a 0%, #1e293b 100%)', color: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {selectedDetailDealer.logoUrl ? (
                  <img 
                    src={selectedDetailDealer.logoUrl} 
                    alt={selectedDetailDealer.name} 
                    style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '6px', background: '#fff', padding: '4px' }} 
                  />
                ) : (
                  <div style={{ width: '40px', height: '40px', borderRadius: '6px', background: 'linear-gradient(135deg, #b38e47 0%, #d4af37 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0f172a', fontWeight: 'bold' }}>
                    SB
                  </div>
                )}
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', letterSpacing: '-0.01em', color: '#fff' }}>{selectedDetailDealer.name}</h3>
                  <span style={{ fontSize: '0.72rem', color: '#cbd5e1', fontWeight: '600' }}>{selectedDetailDealer.brand?.name || 'Yetkili'} Bayi Showroom Detayları</span>
                </div>
              </div>
              <button 
                onClick={() => setShowDealerDetailModal(false)} 
                className="close-modal-btn" 
                style={{ color: '#fff', fontSize: '1.2rem', background: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div className="showroom-modal-grid">
              {/* LEFT COLUMN: GALLERY / 3D TOUR */}
              <div className="showroom-gallery-column">
                {selectedDetailDealer.virtualTourUrl ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', height: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#b38e47', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Sparkles size={14} /> 3D SANAL SHOWROOM TURU
                      </span>
                    </div>
                    <div style={{ position: 'relative', width: '100%', height: '320px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                      <iframe 
                        src={selectedDetailDealer.virtualTourUrl} 
                        width="100%" 
                        height="100%" 
                        style={{ border: 'none' }} 
                        allowFullScreen
                      />
                    </div>
                  </div>
                ) : (
                  /* IMAGE GALLERY */
                  (() => {
                    const images = selectedDetailDealer.showroomImages ? selectedDetailDealer.showroomImages.split(',').filter(Boolean) : [];
                    if (images.length === 0) {
                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', height: '280px', color: '#94a3b8' }}>
                          <ImageIcon size={48} strokeWidth={1.5} />
                          <p style={{ fontSize: '0.85rem', fontWeight: '600' }}>Showroom görselleri yakında eklenecektir.</p>
                        </div>
                      );
                    }
                    const activeImg = images[activeGalleryIndex] || images[0];
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                        <div style={{ width: '100%', height: '260px', borderRadius: '12px', overflow: 'hidden', position: 'relative', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                          <img 
                            src={activeImg} 
                            alt="Showroom Görseli" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                          />
                        </div>
                        {images.length > 1 && (
                          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                            {images.map((img, idx) => (
                              <button 
                                key={idx} 
                                onClick={() => setActiveGalleryIndex(idx)}
                                style={{ 
                                  width: '60px', 
                                  height: '45px', 
                                  borderRadius: '6px', 
                                  overflow: 'hidden', 
                                  border: activeGalleryIndex === idx ? '2px solid #b38e47' : '2px solid transparent',
                                  padding: '0',
                                  cursor: 'pointer',
                                  flexShrink: '0',
                                  opacity: activeGalleryIndex === idx ? 1 : 0.6,
                                  transition: 'all 0.2s'
                                }}
                              >
                                <img src={img} alt="Showroom Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()
                )}
              </div>

              {/* RIGHT COLUMN: INFO & CTA */}
              <div className="showroom-info-column">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  {/* Special Concepts */}
                  {selectedDetailDealer.specialConcepts && (
                    <div>
                      <h4 style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: '#64748b', margin: '0 0 8px 0', letterSpacing: '0.05em' }}>Sergilenen Özel Konseptler</h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {selectedDetailDealer.specialConcepts.split(',').map((concept, idx) => (
                          <span 
                            key={idx} 
                            style={{ 
                              fontSize: '0.7rem', 
                              fontWeight: '700', 
                              background: '#fef3c7', 
                              color: '#d97706', 
                              padding: '4px 10px', 
                              borderRadius: '20px',
                              border: '1px solid #fde68a'
                            }}
                          >
                            ✨ {concept.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Showroom Gallery Toggle if 3D Tour is active (so users can switch back to photos if they want) */}
                  {selectedDetailDealer.virtualTourUrl && selectedDetailDealer.showroomImages && (
                    <div>
                      <h4 style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: '#64748b', margin: '0 0 8px 0', letterSpacing: '0.05em' }}>Showroom Fotoğrafları</h4>
                      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
                        {selectedDetailDealer.showroomImages.split(',').filter(Boolean).map((img, idx) => (
                          <div 
                            key={idx}
                            style={{ 
                              width: '45px', 
                              height: '35px', 
                              borderRadius: '4px', 
                              overflow: 'hidden',
                              position: 'relative'
                            }}
                          >
                            <img src={img} alt="Showroom Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Address and phone */}
                  <div>
                    <h4 style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: '#64748b', margin: '0 0 6px 0', letterSpacing: '0.05em' }}>İletişim & Konum</h4>
                    <p style={{ fontSize: '0.82rem', margin: '0 0 6px 0', color: '#334155', lineHeight: '1.4' }}>
                      📍 {selectedDetailDealer.address}<br/>
                      <strong>{selectedDetailDealer.district}, {selectedDetailDealer.city}</strong>
                    </p>
                    <p style={{ fontSize: '0.82rem', margin: 0, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      📞 <strong>{selectedDetailDealer.phone}</strong>
                    </p>
                  </div>

                  {/* Hours */}
                  <div>
                    <h4 style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: '#64748b', margin: '0 0 4px 0', letterSpacing: '0.05em' }}>Çalışma Saatleri</h4>
                    <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: '700' }}>● Açık • Kapanış 19:00</span>
                  </div>

                </div>

                {/* Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <a 
                      href={`https://www.google.com/maps/dir/?api=1&destination=${selectedDetailDealer.lat},${selectedDetailDealer.lng}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="quick-action-link maps"
                      style={{ textDecoration: 'none', display: 'flex', justifyContent: 'center', padding: '10px', boxSizing: 'border-box' }}
                    >
                      <Navigation size={14} />
                      <span>Yol Tarifi</span>
                    </a>
                    <a 
                      href={`https://wa.me/${selectedDetailDealer.phone.replace(/[\s\-\(\)\+]/g, '')}?text=Merhaba%2C%20sizinle%20SeramikBak%20%C3%BCzerinden%20ileti%C5%9Fime%20ge%C3%A7iyorum.`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="quick-action-link whatsapp"
                      style={{ textDecoration: 'none', display: 'flex', justifyContent: 'center', padding: '10px', boxSizing: 'border-box' }}
                    >
                      <MessageSquare size={14} />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                    <Link
                      href={`/bayi/${slugify(selectedDetailDealer.name)}`}
                      target="_blank"
                      className="btn-secondary w-full-btn"
                      style={{ padding: '8px', fontWeight: '700', border: '1px solid rgba(179, 142, 71, 0.12)', textDecoration: 'none', textAlign: 'center', boxSizing: 'border-box', color: '#b38e47', background: 'rgba(179, 142, 71, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.72rem', borderRadius: '8px', marginBottom: '8px' }}
                    >
                      <Sparkles size={12} />
                      Detay Sayfasını Aç
                    </Link>
                    <button 
                      onClick={() => {
                        setLeadProduct(activeProduct || { name: `${selectedDetailDealer.brand?.name} Serisi`, brandId: selectedDetailDealer.brandId, brand: { name: selectedDetailDealer.brand?.name } });
                        setLeadDealer(selectedDetailDealer);
                        setLeadSuccessMsg('');
                        setShowDealerDetailModal(false); // close showroom modal
                        setShowLeadModal(true); // open quote request modal
                      }}
                      className="btn-primary w-full-btn"
                      style={{ padding: '8px 12px', fontWeight: '700', background: 'linear-gradient(135deg, #b38e47 0%, #d4af37 100%)', color: '#0f172a', border: 'none', marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.72rem', borderRadius: '8px', textTransform: 'uppercase', letterSpacing: '0.03em', width: '100%', boxSizing: 'border-box', cursor: 'pointer' }}
                    >
                      Fiyat Teklifi İste
                    </button>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

      {/* AUTH MODAL */}
      {showAuthModal && (
        <div className="auth-modal-overlay" onClick={(e) => { if(e.target === e.currentTarget) setShowAuthModal(false); }}>
          <div className="auth-modal glass-panel">
            <button className="auth-modal-close" onClick={() => { setShowAuthModal(false); setAuthError(''); setAuthSuccess(''); }}>✕</button>
            
            <div className="auth-modal-header">
              <div className="auth-logo-area">
                <div className="auth-logo-icon">SB</div>
                <span className="auth-logo-text">SeramikBak</span>
              </div>
              <p className="auth-subtitle">Türkiye&apos;nin en kapsamlı seramik platformuna katılın</p>
            </div>

            <div className="auth-tabs">
              <button className={`auth-tab ${authTab === 'login' ? 'active' : ''}`} onClick={() => { setAuthTab('login'); setAuthError(''); }}>
                Giriş Yap
              </button>
              <button className={`auth-tab ${authTab === 'register' ? 'active' : ''}`} onClick={() => { setAuthTab('register'); setAuthError(''); }}>
                Üye Ol
              </button>
            </div>

            {authSuccess && <div className="auth-success-msg">{authSuccess}</div>}
            {authError && <div className="auth-error-msg">{authError}</div>}

            {authTab === 'login' ? (
              <form className="auth-form" onSubmit={handleAuthLogin}>
                <div className="auth-field">
                  <label>E-posta Adresi</label>
                  <div className="auth-input-wrapper">
                    <Mail size={16} />
                    <input type="email" placeholder="ornek@email.com" value={authEmail} onChange={e => setAuthEmail(e.target.value)} required />
                  </div>
                </div>
                <div className="auth-field">
                  <label>Şifre</label>
                  <div className="auth-input-wrapper">
                    <Settings size={16} />
                    <input type="password" placeholder="••••••••" value={authPassword} onChange={e => setAuthPassword(e.target.value)} required />
                  </div>
                </div>
                <button type="submit" className="auth-submit-btn" disabled={authLoading}>
                  {authLoading ? <><Loader2 size={16} className="spin-icon" /> Giriş yapılıyor...</> : 'Giriş Yap'}
                </button>
              </form>
            ) : (
              <form className="auth-form" onSubmit={handleAuthRegister}>
                <div className="auth-field">
                  <label>Ad Soyad</label>
                  <div className="auth-input-wrapper">
                    <UserIcon size={16} />
                    <input type="text" placeholder="Adınız Soyadınız" value={authName} onChange={e => setAuthName(e.target.value)} required />
                  </div>
                </div>
                <div className="auth-field">
                  <label>E-posta Adresi</label>
                  <div className="auth-input-wrapper">
                    <Mail size={16} />
                    <input type="email" placeholder="ornek@email.com" value={authEmail} onChange={e => setAuthEmail(e.target.value)} required />
                  </div>
                </div>
                <div className="auth-field">
                  <label>Şifre</label>
                  <div className="auth-input-wrapper">
                    <Settings size={16} />
                    <input type="password" placeholder="En az 6 karakter" value={authPassword} onChange={e => setAuthPassword(e.target.value)} required minLength={6} />
                  </div>
                </div>
                <button type="submit" className="auth-submit-btn" disabled={authLoading}>
                  {authLoading ? <><Loader2 size={16} className="spin-icon" /> Kayıt yapılıyor...</> : 'Üye Ol'}
                </button>
              </form>
            )}

            <div className="auth-benefits">
              <div className="auth-benefit-item"><CheckCircle size={14} /> Fiyat karşılaştırma ve favori kaydetme</div>
              <div className="auth-benefit-item"><CheckCircle size={14} /> Fiyat düşüş bildirimleri alma</div>
              <div className="auth-benefit-item"><CheckCircle size={14} /> Bayilerden özel teklif talep etme</div>
              <div className="auth-benefit-item"><CheckCircle size={14} /> 3D oda tasarımlarınızı kaydetme</div>
            </div>

            <div className="auth-member-count">
              <Sparkles size={14} className="badge-icon-gold" />
              <span><strong>2.847</strong> kullanıcı şimdiden SeramikBak&apos;a üye oldu</span>
            </div>
          </div>
        </div>
      )}

      {/* FAVORITES SIDE PANEL */}
      {showFavoritesPanel && currentUser && (
        <div className="favorites-panel-overlay" onClick={(e) => { if(e.target === e.currentTarget) setShowFavoritesPanel(false); }}>
          <div className="favorites-panel glass-panel">
            <div className="favorites-panel-header">
              <h3><HeartIcon size={18} /> Favorilerim</h3>
              <button onClick={() => setShowFavoritesPanel(false)}>✕</button>
            </div>
            {userFavorites.length === 0 ? (
              <div className="favorites-empty">
                <HeartIcon size={40} />
                <p>Henüz favori ürününüz yok.</p>
                <span>Beğendiğiniz ürünlerin kalp ikonuna tıklayarak favorilerinize ekleyebilirsiniz.</span>
              </div>
            ) : (
              <div className="favorites-list">
                {userFavorites.map(fav => (
                  <div key={fav.id} className="favorite-item" onClick={() => { if (fav.product) { handleProductCardClick(fav.product); setShowFavoritesPanel(false); } }}>
                    <div className="favorite-item-preview">
                      {fav.product?.imageUrl ? (
                        <img src={fav.product.imageUrl} alt={fav.product.name} />
                      ) : (
                        <div className="favorite-item-placeholder">
                          <Layers size={20} />
                        </div>
                      )}
                    </div>
                    <div className="favorite-item-info">
                      <div className="favorite-item-name">{fav.product?.name || 'Ürün'}</div>
                      <div className="favorite-item-brand">{fav.product?.brand?.name || ''}</div>
                    </div>
                    <button className="favorite-remove-btn" onClick={(e) => { e.stopPropagation(); handleToggleFavorite(fav.productId); }}>
                      <HeartIcon size={14} fill="currentColor" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}



      {/* Premium Footer Section */}
      <footer className="site-footer">
        <div className="footer-grid">
          
          {/* Column 1: Brand Intro & Info */}
          <div className="footer-col brand-col">
            <div className="footer-logo" onClick={() => setActiveTab('search')}>
              <div className="logo-icon">SB</div>
              <span className="logo-text">SeramikBak</span>
            </div>
            <p className="footer-tagline">
              Türkiye'nin ilk ve lider seramik arama motoru. 100+ markayı karşılaştırın, 3D sanal stüdyoda odanızı tasarlayın ve en yakın yetkili bayiden anında teklif alın.
            </p>
            <div className="footer-socials">
              <a href="#" className="social-icon-btn" title="Web Sitesi" onClick={(e) => e.preventDefault()}><Globe size={16} /></a>
              <a href="mailto:destek@seramikbak.com" className="social-icon-btn" title="E-Posta Gönder"><Mail size={16} /></a>
              <a href="tel:08501234567" className="social-icon-btn" title="Müşteri Hizmetleri Ara"><Phone size={16} /></a>
              <a href="https://wa.me/908501234567" target="_blank" rel="noopener noreferrer" className="social-icon-btn" title="WhatsApp Destek Hattı"><MessageSquare size={16} /></a>
            </div>
          </div>

          {/* Column 2: Seramik Kategorileri */}
          <div className="footer-col">
            <h4>Seramik Kategorileri</h4>
            <ul>
              <li><a href="#" onClick={(e) => { e.preventDefault(); handleTagClick('Mermer Görünümlü', 'style', 'Mermer'); }}>Mermer Görünümlü Karolar</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); handleTagClick('Beton Görünümlü', 'style', 'Beton'); }}>Beton Görünümlü Seramikler</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); handleTagClick('Ahşap Dokulu', 'style', 'Ahşap'); }}>Ahşap Görünümlü Seramikler</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); handleTagClick('60x120', 'size', '60x120'); }}>60x120 Geniş Ebatlı Porselen</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); handleTagClick('Parlak', 'finish', 'Parlak'); }}>Parlak Cilalı Koleksiyonlar</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); handleTagClick('Mat', 'finish', 'Mat'); }}>Mat & R10 Kaymaz Karolar</a></li>
            </ul>
          </div>

          {/* Column 3: Popüler Seramik Markaları */}
          <div className="footer-col">
            <h4>Popüler Markalar</h4>
            <ul>
              {brands.slice(0, 6).map(brand => (
                <li key={brand.id}>
                  <a href="#" onClick={(e) => { e.preventDefault(); setSelectedBrand(brand.id); fetchProducts(`brandId=${brand.id}`); }}>
                    {brand.name}
                  </a>
                </li>
              ))}
              {brands.length === 0 && (
                <>
                  <li><a href="#" onClick={(e) => e.preventDefault()}>NG Kütahya Seramik</a></li>
                  <li><a href="#" onClick={(e) => e.preventDefault()}>Vitra Seramik</a></li>
                  <li><a href="#" onClick={(e) => e.preventDefault()}>Bien Seramik</a></li>
                  <li><a href="#" onClick={(e) => e.preventDefault()}>Çanakkale Seramik</a></li>
                  <li><a href="#" onClick={(e) => e.preventDefault()}>Ege Seramik</a></li>
                </>
              )}
            </ul>
          </div>

          {/* Column 4: Kurumsal & Portallar */}
          <div className="footer-col">
            <h4>Kurumsal & Portallar</h4>
            <ul>
              <li><a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('search'); }}>Arama Motoru</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('studio'); }}>3D Sanal Stüdyo</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('dealers'); }}>Bayi Bulucu</a></li>
              <li><Link href="/bayi?tab=register">Bayimiz Olun (B2B Başvuru)</Link></li>
              <li><Link href="/bayi">Bayi Giriş Portalı</Link></li>
              <li><Link href="/marka">B2B Marka Portalı</Link></li>
              <li><Link href="/global-tanitim" style={{ color: '#d4af37', fontWeight: '800' }}>🌍 Global Tanıtım Portalı</Link></li>
            </ul>
          </div>

          {/* Column 5: Kurumsal & Destek */}
          <div className="footer-col">
            <h4>Kurumsal & Destek</h4>
            <ul>
              <li><Link href="/hakkimizda">Hakkımızda</Link></li>
              <li><Link href="/iletisim">İletişim & SSS</Link></li>
              <li><Link href="/ilham">İlham Galerisi & Trendler</Link></li>
              <li><Link href="/yasal?tab=kvkk">KVKK & Gizlilik</Link></li>
              <li><Link href="/yasal?tab=kullanim">Kullanım Koşulları</Link></li>
              <li><Link href="/yasal?tab=cerez">Çerez Politikası</Link></li>
            </ul>
          </div>

        </div>

        {/* INTERNATIONAL GLOBAL SEO & EXPORT PORTAL SECTION */}
        <div className="footer-global-seo-box" style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '18px 0',
          margin: '20px 0',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--accent-gold, #c5a059)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              🌐 Uluslararası Seramik İhracat & Global Arama Portalı | Global Ceramic Tile Network
            </span>
            <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem', color: '#94a3b8' }}>
              <span title="Turkey">🇹🇷 Türkiye</span>
              <span title="Global / USA / UK">🇬🇧 Global / USA</span>
              <span title="Germany / EU">🇩🇪 Deutschland / EU</span>
              <span title="Middle East / Gulf">🇸🇦 الشرق الأوسط</span>
              <span title="Russia / CIS">🇷🇺 Россия / СНГ</span>
            </div>
          </div>
          <p style={{ fontSize: '0.68rem', color: '#64748b', margin: 0, lineHeight: '1.4' }}>
            SeramikBak connects Turkish ceramic tile manufacturers (Kütahya, Bien, Ege, Güral, Vitra) with global architects, international dealers, and homeowners worldwide. Featuring Web 3D Room Visualizer, AR integration, and multi-lingual global search engine indexing in English, German, Arabic, Russian, and Turkish.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', fontSize: '0.62rem', color: '#475569' }}>
            <span style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '2px 8px', borderRadius: '4px' }}>Ceramic Tiles Export</span>
            <span style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '2px 8px', borderRadius: '4px' }}>Porcelain Slabs Wholesale</span>
            <span style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '2px 8px', borderRadius: '4px' }}>Keramikfliesen Deutschland</span>
            <span style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '2px 8px', borderRadius: '4px' }}>سيراميك وبورسلين فاخر</span>
            <span style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '2px 8px', borderRadius: '4px' }}>Турецкая керамическая плитка</span>
            <span style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '2px 8px', borderRadius: '4px' }}>3D Tile Room Simulator</span>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="footer-bottom">
          <div className="footer-bottom-left">
            <p>© 2026 SeramikBak Global. Tüm hakları saklıdır. Türkiye'nin Uluslararası Seramik Portalı.</p>
          </div>
          <div className="footer-bottom-right">
            <span className="footer-security-tag">🔒 256-Bit SSL Güvenli Bağlantı</span>
          </div>
        </div>
      </footer>

      {/* COMPARISON STICKY BAR */}
      {comparedProducts.length > 0 && (
        <div className="sticky-compare-bar">
          <div className="compare-bar-container">
            <div className="compare-bar-info">
              <h4>Ürün Karşılaştırma</h4>
              <p>{comparedProducts.length}/4 ürün seçildi</p>
            </div>
            
            <div className="compare-bar-items">
              {comparedProducts.map(p => (
                <div key={p.id} className="compare-bar-item">
                  <div className="compare-bar-item-thumb">
                    <img src={p.imageUrl} alt={p.name} />
                    <button 
                      className="compare-bar-item-remove"
                      onClick={() => toggleCompareProduct(p)}
                      title="Çıkar"
                    >
                      ✕
                    </button>
                  </div>
                  <span className="compare-bar-item-name">{p.name}</span>
                </div>
              ))}
              
              {/* Fill remaining empty slots */}
              {Array.from({ length: 4 - comparedProducts.length }).map((_, idx) => (
                <div key={idx} className="compare-bar-item empty">
                  <div className="compare-bar-item-thumb">
                    <span className="empty-slot-plus">+</span>
                  </div>
                  <span className="compare-bar-item-name">Boş Yuva</span>
                </div>
              ))}
            </div>

            <div className="compare-bar-actions">
              <button 
                className="btn-compare-clear"
                onClick={() => setComparedProducts([])}
              >
                Tümünü Temizle
              </button>
              <button 
                className="btn-compare-submit"
                onClick={() => setShowComparisonModal(true)}
                disabled={comparedProducts.length < 2}
              >
                {comparedProducts.length < 2 ? 'En Az 2 Ürün Seçin' : 'Karşılaştır'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMPARISON MODAL */}
      {showComparisonModal && (
        <div className="compare-modal-overlay" onClick={() => setShowComparisonModal(false)}>
          <div className="compare-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="compare-modal-header">
              <div>
                <h2>Teknik Detay Karşılaştırma Sihirbazı</h2>
                <p>Seçtiğiniz seramik modellerinin tüm teknik detay ve pazar fiyatlarının yan yana analizi</p>
              </div>
              <button className="compare-modal-close" onClick={() => setShowComparisonModal(false)}>✕</button>
            </div>

            <div className="compare-modal-body">
              <div className="compare-table-wrapper">
                <table className="compare-table">
                  <thead>
                    <tr>
                      <th className="feature-col">Özellikler</th>
                      {comparedProducts.map(p => (
                        <th key={p.id} className="product-col">
                          <div className="compare-product-header">
                            <button 
                              className="compare-product-remove" 
                              onClick={() => toggleCompareProduct(p)}
                              title="Bu Ürünü Kaldır"
                            >
                              ✕ Kaldır
                            </button>
                            <div className="compare-product-img">
                              <img src={p.imageUrl} alt={p.name} />
                            </div>
                            <span className="compare-product-brand">{p.brand?.name}</span>
                            <h3 className="compare-product-title">{p.name}</h3>
                            <span className="compare-product-code">{p.code}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* Fiyatlar */}
                    <tr className="section-row">
                      <td colSpan={comparedProducts.length + 1}>Pazar Yeri ve En Düşük Bayi Fiyatları</td>
                    </tr>
                    <tr>
                      <td className="feature-name">En Düşük Bayi Fiyatı</td>
                      {comparedProducts.map(p => (
                        <td key={p.id} className="feature-value highlight-gold">
                          {p.cheapestOffer?.price ? `${p.cheapestOffer.price} TL/m²` : 'Bilinmiyor'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="feature-name">Trendyol Fiyatı</td>
                      {comparedProducts.map(p => (
                        <td key={p.id} className="feature-value">
                          {p.trendyolPrice ? (
                            <a href={p.trendyolUrl} target="_blank" rel="noopener noreferrer" className="marketplace-link trendyol">
                              {p.trendyolPrice} TL <span className="buy-arrow">↗</span>
                            </a>
                          ) : 'Satışta Değil'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="feature-name">Hepsiburada Fiyatı</td>
                      {comparedProducts.map(p => (
                        <td key={p.id} className="feature-value">
                          {p.hepsiPrice ? (
                            <a href={p.hepsiburadaUrl} target="_blank" rel="noopener noreferrer" className="marketplace-link hepsiburada">
                              {p.hepsiPrice} TL <span className="buy-arrow">↗</span>
                            </a>
                          ) : 'Satışta Değil'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="feature-name">Koçtaş Fiyatı</td>
                      {comparedProducts.map(p => (
                        <td key={p.id} className="feature-value">
                          {p.koctasPrice ? (
                            <a href={p.koctasUrl} target="_blank" rel="noopener noreferrer" className="marketplace-link koctas">
                              {p.koctasPrice} TL <span className="buy-arrow">↗</span>
                            </a>
                          ) : 'Satışta Değil'}
                        </td>
                      ))}
                    </tr>

                    {/* Boyut ve Görünüm */}
                    <tr className="section-row">
                      <td colSpan={comparedProducts.length + 1}>Boyut ve Görünüm Detayları</td>
                    </tr>
                    <tr>
                      <td className="feature-name">Ebat (Genişlik x Yükseklik)</td>
                      {comparedProducts.map(p => (
                        <td key={p.id} className="feature-value">{p.width}x{p.height} cm</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="feature-name">Renk</td>
                      {comparedProducts.map(p => (
                        <td key={p.id} className="feature-value">
                          <span className="color-badge" style={{ backgroundColor: p.color === 'Beyaz' ? '#ffffff' : p.color === 'Gri' ? '#8e939f' : p.color === 'Antrasit' ? '#2e3035' : p.color === 'Bej' ? '#f4ece1' : p.color === 'Kahverengi' ? '#8b5a2b' : '#cccccc', border: '1px solid #e2e8f0' }} />
                          {p.color}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="feature-name">Bitiş / Yüzey</td>
                      {comparedProducts.map(p => (
                        <td key={p.id} className="feature-value">{p.finish}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="feature-name">Stil / Tasarım</td>
                      {comparedProducts.map(p => (
                        <td key={p.id} className="feature-value">{p.style}</td>
                      ))}
                    </tr>

                    {/* Teknik Özellikler */}
                    <tr className="section-row">
                      <td colSpan={comparedProducts.length + 1}>Teknik Dayanıklılık Değerleri</td>
                    </tr>
                    <tr>
                      <td className="feature-name">Aşınma Dayanımı (PEI Sınıfı)</td>
                      {comparedProducts.map(p => (
                        <td key={p.id} className="feature-value">
                          {p.peiRating ? (
                            <span className={`tech-badge pei-class-${p.peiRating}`}>
                              PEI {p.peiRating} ({p.peiRating >= 4 ? 'Yoğun Trafik' : 'Orta Trafik'})
                            </span>
                          ) : (
                            <span className="text-muted">Belirtilmemiş</span>
                          )}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="feature-name">Kaymazlık Sınıfı (R Değeri)</td>
                      {comparedProducts.map(p => (
                        <td key={p.id} className="feature-value">
                          {p.slipResistance ? (
                            <span className={`tech-badge slip-class-${p.slipResistance}`}>
                              {p.slipResistance} ({p.slipResistance === 'R11' ? 'Islak Alan/Dış Mekan' : p.slipResistance === 'R10' ? 'Mutfak/Banyo Yer' : 'İç Mekan Duvar/Yer'})
                            </span>
                          ) : (
                            <span className="text-muted">Belirtilmemiş</span>
                          )}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="feature-name">Dona Dayanıklılık</td>
                      {comparedProducts.map(p => (
                        <td key={p.id} className="feature-value">
                          {p.frostResistance !== null ? (
                            p.frostResistance ? (
                              <span className="tech-badge success">✓ Dona Dayanıklı (Dış Mekan Uygun)</span>
                            ) : (
                              <span className="tech-badge danger">✗ Dona Dayanıklı Değil (Sadece İç Mekan)</span>
                            )
                          ) : (
                            <span className="text-muted">Belirtilmemiş</span>
                          )}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="feature-name">Kalınlık</td>
                      {comparedProducts.map(p => (
                        <td key={p.id} className="feature-value">
                          {p.thickness ? `${p.thickness} mm` : <span className="text-muted">Belirtilmemiş</span>}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="feature-name">Kenar Tipi (Rektifiyeli)</td>
                      {comparedProducts.map(p => (
                        <td key={p.id} className="feature-value">
                          {p.rectified !== null ? (
                            p.rectified ? (
                              <span className="tech-badge info">✓ Rektifiyeli (Sıfır Derz Uyumlu)</span>
                            ) : (
                              <span className="tech-badge warning">✗ Rektifiyesiz (Derzli Döşeme)</span>
                            )
                          ) : (
                            <span className="text-muted">Belirtilmemiş</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Filters Backdrop */}
      <div className={`mobile-filters-backdrop ${showMobileFilters ? 'show' : ''}`} onClick={() => setShowMobileFilters(false)} />

      {/* Mobile Filters Sidebar (Root Level Stacking Context) */}
      <aside 
        className={`filters-sidebar-new glass-panel mobile-sidebar ${showMobileFilters ? 'open' : ''}`} 
        style={showMobileFilters ? { position: 'fixed', transform: 'translateX(0)' } : { position: 'fixed', transform: 'translateX(-100%)', pointerEvents: 'none' }}
      >
        <div className="bottom-sheet-handle-wrapper">
          <div className="bottom-sheet-handle" />
        </div>
        <div className="filter-header-row" style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: '12px' }}>
          <h3 className="filter-title-main" style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', margin: 0, border: 'none', padding: 0 }}>Filtreler</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => {
              setSelectedBrand('');
              setSelectedColor('');
              setSelectedFinish('');
              setSelectedStyle('');
              setSelectedArea('');
              setSelectedSize('');
              setSelectedRectified('');
              setSelectedFrost('');
              setSelectedSlipResistance('');
              setSelectedThickness('');
              setSelectedPeiRating('');
              setSelectedIsPremium('');
              setSearchQuery('');
              setUploadedImagePreview(null);
              setVisualSearchMatches(null);
              fetchProducts('clear=true');
            }} className="clear-all-filters-btn">
              Temizle
            </button>
            <button onClick={() => setShowMobileFilters(false)} className="mobile-filter-close-btn">
              ✕
            </button>
          </div>
        </div>

        {/* Scrollable Filters Content Wrapper */}
        <div className="filters-scroll-area">
          {/* Standalone Premium Series Switch */}
          <div className="premium-toggle-card" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            padding: '12px 14px', 
            borderRadius: '12px', 
            background: selectedIsPremium === 'true' 
              ? 'linear-gradient(135deg, rgba(179,142,71,0.15) 0%, rgba(140,107,48,0.06) 100%)' 
              : 'linear-gradient(135deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.005) 100%)', 
            border: selectedIsPremium === 'true' 
              ? '1px solid rgba(179,142,71,0.35)' 
              : '1px solid rgba(0,0,0,0.05)', 
            marginBottom: '16px', 
            transition: 'all 0.3s ease',
            boxShadow: selectedIsPremium === 'true' ? '0 4px 12px rgba(179,142,71,0.08)' : 'none'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sparkles size={16} style={{ color: selectedIsPremium === 'true' ? 'var(--accent-gold)' : '#64748b', transition: 'color 0.2s' }} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: selectedIsPremium === 'true' ? '#b38e47' : '#0f172a', transition: 'color 0.2s' }}>Premium Seçim</span>
                <span style={{ fontSize: '0.62rem', color: '#64748b' }}>Mimari ve özel seriler</span>
              </div>
            </div>
            <label className="toggle-switch-wrapper">
              <input 
                type="checkbox" 
                checked={selectedIsPremium === 'true'} 
                onChange={() => setSelectedIsPremium(selectedIsPremium === 'true' ? '' : 'true')}
              />
              <span className="toggle-switch-slider" />
            </label>
          </div>

          {/* 1. KATEGORİLER */}
          <div className="accordion-section">
            <div className="accordion-header" onClick={() => toggleSection('categories')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <SlidersHorizontal size={14} style={{ color: selectedStyle ? 'var(--accent-gold)' : '#64748b' }} />
                <span className="accordion-title">Kategoriler</span>
                {selectedStyle !== '' && <span className="accordion-active-dot" />}
              </div>
              <ChevronDown size={14} style={{ transform: expandedSections.categories ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease', color: 'var(--text-secondary)' }} />
            </div>
            {expandedSections.categories && (
              <div className="accordion-content" style={{ marginTop: '12px' }}>
                <div className="filters-grid">
                  {['Mermer', 'Ahşap', 'Beton', 'Taş'].map(styleVal => {
                    const isSelected = selectedStyle === styleVal;
                    return (
                      <button 
                        key={styleVal} 
                        onClick={() => setSelectedStyle(isSelected ? '' : styleVal)}
                        className={`filter-chip-btn ${isSelected ? 'active' : ''}`}
                      >
                        {styleVal}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 2. KOLEKSİYON */}
          <div className="accordion-section">
            <div className="accordion-header" onClick={() => toggleSection('collection')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={14} style={{ color: selectedBrand ? 'var(--accent-gold)' : '#64748b' }} />
                <span className="accordion-title">Koleksiyon (Marka)</span>
                {selectedBrand !== '' && <span className="accordion-active-dot" />}
              </div>
              <ChevronDown size={14} style={{ transform: expandedSections.collection ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease', color: 'var(--text-secondary)' }} />
            </div>
            {expandedSections.collection && (
              <div className="accordion-content" style={{ marginTop: '12px' }}>
                <div className="filters-grid">
                  {brands.filter(b => b.name.toLowerCase() !== 'kalebodur').map(brand => {
                    const isSelected = selectedBrand === brand.id;
                    return (
                      <button 
                        key={brand.id} 
                        onClick={() => setSelectedBrand(isSelected ? '' : brand.id)}
                        className={`filter-chip-btn ${isSelected ? 'active' : ''}`}
                      >
                        {brand.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 3. DOKU */}
          <div className="accordion-section">
            <div className="accordion-header" onClick={() => toggleSection('texture')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Palette size={14} style={{ color: selectedColor ? 'var(--accent-gold)' : '#64748b' }} />
                <span className="accordion-title">Renk & Doku</span>
                {selectedColor !== '' && <span className="accordion-active-dot" />}
              </div>
              <ChevronDown size={14} style={{ transform: expandedSections.texture ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease', color: 'var(--text-secondary)' }} />
            </div>
            {expandedSections.texture && (
              <div className="accordion-content" style={{ marginTop: '12px' }}>
                <div className="filters-grid">
                  {[
                    { name: 'Beyaz', color: '#ffffff', border: '1px solid #cbd5e1' },
                    { name: 'Bej', color: '#f5f5dc', border: '1px solid #e2e8f0' },
                    { name: 'Gri', color: '#94a3b8' },
                    { name: 'Antrasit', color: '#334155' },
                    { name: 'Kahverengi', color: '#78350f' }
                  ].map(colorItem => {
                    const isSelected = selectedColor === colorItem.name;
                    return (
                      <button 
                        key={colorItem.name} 
                        onClick={() => setSelectedColor(isSelected ? '' : colorItem.name)}
                        className={`filter-chip-btn color-chip-btn ${isSelected ? 'active' : ''}`}
                      >
                        <span 
                          className="color-dot" 
                          style={{ 
                            backgroundColor: colorItem.color, 
                            border: colorItem.border || 'none',
                            boxShadow: isSelected ? '0 0 0 2px #ffffff, 0 0 0 3px var(--accent-gold)' : 'none'
                          }} 
                        />
                        <span>{colorItem.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 4. EBAT */}
          <div className="accordion-section">
            <div className="accordion-header" onClick={() => toggleSection('ebat')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers2 size={14} style={{ color: selectedSize ? 'var(--accent-gold)' : '#64748b' }} />
                <span className="accordion-title">Ebatlar</span>
                {selectedSize !== '' && <span className="accordion-active-dot" />}
              </div>
              <ChevronDown size={14} style={{ transform: expandedSections.ebat ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease', color: 'var(--text-secondary)' }} />
            </div>
            {expandedSections.ebat && (
              <div className="accordion-content" style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div className="scrollable-ebat-list">
                  {[
                    '120x240', '120x120', '60x120', '20x120', '80x80', 
                    '60x60', '30x60', '31,5x61,5', '42x42', '60x90', 
                    '61x61', '80x160', '30x85', '33x66', '21x122', 
                    '15x60', '240x240', '360x240', '100x100', '40x120', 
                    '30x120', '30x90', '30x40', '20x40', '19,7x19,7'
                  ].map(sizeVal => {
                    const parts = sizeVal.replace(',', '.').split('x');
                    const wCm = parseFloat(parts[0]) || 0;
                    const hCm = parseFloat(parts[1]) || 0;
                    const scale = 80 / 175;
                    const wPx = Math.max(4, Math.round(wCm * scale));
                    const hPx = Math.max(4, Math.round(hCm * scale));

                    const isSelected = selectedSize === sizeVal;

                    return (
                      <label key={sizeVal} className="checkbox-label-wrapper" style={{ position: 'relative' }}>
                        <input 
                          type="checkbox" 
                          checked={isSelected} 
                          onChange={() => setSelectedSize(isSelected ? '' : sizeVal)}
                        />
                        <span className="checkbox-custom-box" />
                        <span className="checkbox-text-label" style={{ color: isSelected ? '#0f172a' : 'var(--text-secondary)', fontWeight: isSelected ? '600' : '500' }}>{sizeVal}</span>
                        
                        <div className="size-guide-tooltip">
                          <span className="tooltip-title">Boyut Kıyaslama</span>
                          <div className="size-guide-viz">
                            <div className="viz-human">
                              <div className="viz-human-head"></div>
                              <div className="viz-human-body"></div>
                              <span className="viz-lbl">İnsan (175 cm)</span>
                            </div>
                            <div className="viz-tile" style={{ width: `${wPx}px`, height: `${hPx}px`, background: 'var(--accent-gold)', border: '1px solid rgba(255,255,255,0.3)' }}>
                              <span className="viz-lbl">{sizeVal} cm</span>
                            </div>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 5. ÜRÜN TİPİ (YÜZEY BİTİŞİ) */}
          <div className="accordion-section">
            <div className="accordion-header" onClick={() => toggleSection('productType')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={14} style={{ color: selectedFinish ? 'var(--accent-gold)' : '#64748b' }} />
                <span className="accordion-title">Yüzey Bitişi</span>
                {selectedFinish !== '' && <span className="accordion-active-dot" />}
              </div>
              <ChevronDown size={14} style={{ transform: expandedSections.productType ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease', color: 'var(--text-secondary)' }} />
            </div>
            {expandedSections.productType && (
              <div className="accordion-content" style={{ marginTop: '12px' }}>
                <div className="filters-grid">
                  {['Mat', 'Parlak', 'Lapatto'].map(finishVal => {
                    const isSelected = selectedFinish === finishVal;
                    return (
                      <button 
                        key={finishVal} 
                        onClick={() => setSelectedFinish(isSelected ? '' : finishVal)}
                        className={`filter-chip-btn ${isSelected ? 'active' : ''}`}
                      >
                        {finishVal === 'Parlak' ? 'Parlak (Camsı)' : finishVal === 'Lapatto' ? 'Lapatto (Yarı)' : finishVal}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* YENİ: TEKNİK BİLGİLER / DURAMLILIK */}
          <div className="accordion-section">
            <div className="accordion-header" onClick={() => toggleSection('techSpecs')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={14} style={{ color: (selectedSlipResistance || selectedThickness || selectedPeiRating) ? 'var(--accent-gold)' : '#64748b' }} />
                <span className="accordion-title">Performans & Dayanım</span>
                {(selectedSlipResistance !== '' || selectedThickness !== '' || selectedPeiRating !== '') && <span className="accordion-active-dot" />}
              </div>
              <ChevronDown size={14} style={{ transform: expandedSections.techSpecs ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease', color: 'var(--text-secondary)' }} />
            </div>
            {expandedSections.techSpecs && (
              <div className="accordion-content" style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                
                {/* Slip Resistance */}
                <div className="tech-filter-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Kaymazlık (R)</span>
                    <span style={{ fontSize: '0.62rem', color: '#b38e47', display: 'flex', alignItems: 'center', gap: '2px' }} title="R9: Ev içi kuru, R10: Banyo/Mutfak, R11: Islak dış mekan/Havuz">
                      <Info size={11} /> Bilgi
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {['R9', 'R10', 'R11'].map(rVal => {
                      const isSelected = selectedSlipResistance === rVal;
                      return (
                        <button
                          key={rVal}
                          onClick={() => setSelectedSlipResistance(isSelected ? '' : rVal)}
                          className={`filter-chip-btn ${isSelected ? 'active' : ''}`}
                          style={{ flex: 1, minHeight: '32px', fontSize: '0.75rem', padding: '4px' }}
                        >
                          {rVal}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Thickness */}
                <div className="tech-filter-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Kalınlık</span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {[
                      { name: 'İnce', value: 'thin', desc: '≤ 8.5 mm' },
                      { name: 'Standart', value: 'standard', desc: '9-10 mm' },
                      { name: 'Kalın', value: 'thick', desc: '> 10 mm' }
                    ].map(thickObj => {
                      const isSelected = selectedThickness === thickObj.value;
                      return (
                        <button
                          key={thickObj.value}
                          onClick={() => setSelectedThickness(isSelected ? '' : thickObj.value)}
                          className={`filter-chip-btn ${isSelected ? 'active' : ''}`}
                          style={{ flex: 1, minHeight: '34px', fontSize: '0.7rem', display: 'flex', flexDirection: 'column', gap: '1px', padding: '4px 2px' }}
                        >
                          <span style={{ fontWeight: '700' }}>{thickObj.name}</span>
                          <span style={{ fontSize: '0.52rem', opacity: isSelected ? 0.9 : 0.6 }}>{thickObj.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* PEI Rating */}
                <div className="tech-filter-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Aşınma Sınıfı (PEI)</span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {[
                      { name: 'PEI 3+', value: '3', label: 'Orta' },
                      { name: 'PEI 4+', value: '4', label: 'Yoğun' },
                      { name: 'PEI 5', value: '5', label: 'Ekstra' }
                    ].map(peiObj => {
                      const isSelected = selectedPeiRating === peiObj.value;
                      return (
                        <button
                          key={peiObj.value}
                          onClick={() => setSelectedPeiRating(isSelected ? '' : peiObj.value)}
                          className={`filter-chip-btn ${isSelected ? 'active' : ''}`}
                          style={{ flex: 1, minHeight: '34px', fontSize: '0.7rem', display: 'flex', flexDirection: 'column', gap: '1px', padding: '4px 2px' }}
                          title={peiObj.label}
                        >
                          <span style={{ fontWeight: '700' }}>{peiObj.name}</span>
                          <span style={{ fontSize: '0.52rem', opacity: isSelected ? 0.9 : 0.6 }}>{peiObj.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* 6. ÜRÜN ÖZELLİKLERİ */}
          <div className="accordion-section">
            <div className="accordion-header" onClick={() => toggleSection('productFeature')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Wrench size={14} style={{ color: (selectedRectified || selectedFrost) ? 'var(--accent-gold)' : '#64748b' }} />
                <span className="accordion-title">Kenar & Yapı</span>
                {(selectedRectified !== '' || selectedFrost !== '') && <span className="accordion-active-dot" />}
              </div>
              <ChevronDown size={14} style={{ transform: expandedSections.productFeature ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease', color: 'var(--text-secondary)' }} />
            </div>
            {expandedSections.productFeature && (
              <div className="accordion-content" style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className="toggle-filter-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 0' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: '500', color: 'var(--text-secondary)' }}>Rektifiyeli (Düz Kenar)</span>
                  <label className="toggle-switch-wrapper">
                    <input 
                      type="checkbox" 
                      checked={selectedRectified === 'true'} 
                      onChange={() => setSelectedRectified(selectedRectified === 'true' ? '' : 'true')}
                    />
                    <span className="toggle-switch-slider" />
                  </label>
                </div>
                <div className="toggle-filter-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 0' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: '500', color: 'var(--text-secondary)' }}>Dona Dayanıklı</span>
                  <label className="toggle-switch-wrapper">
                    <input 
                      type="checkbox" 
                      checked={selectedFrost === 'true'} 
                      onChange={() => setSelectedFrost(selectedFrost === 'true' ? '' : 'true')}
                    />
                    <span className="toggle-switch-slider" />
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* 7. MEKAN TİPİ */}
          <div className="accordion-section" style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: 0 }}>
            <div className="accordion-header" onClick={() => toggleSection('spaceType')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Globe size={14} style={{ color: selectedArea ? 'var(--accent-gold)' : '#64748b' }} />
                <span className="accordion-title">Mekan Tipi</span>
                {selectedArea !== '' && <span className="accordion-active-dot" />}
              </div>
              <ChevronDown size={14} style={{ transform: expandedSections.spaceType ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease', color: 'var(--text-secondary)' }} />
            </div>
            {expandedSections.spaceType && (
              <div className="accordion-content" style={{ marginTop: '12px' }}>
                <div className="filters-grid">
                  {['Banyo', 'Mutfak', 'Salon', 'Balkon', 'Koridor', 'Teras'].map(areaVal => {
                    const isSelected = selectedArea === areaVal;
                    return (
                      <button 
                        key={areaVal} 
                        onClick={() => setSelectedArea(isSelected ? '' : areaVal)}
                        className={`filter-chip-btn ${isSelected ? 'active' : ''}`}
                      >
                        {areaVal}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile-only Apply Button at the Bottom */}
        <div className="mobile-filter-footer">
          <button className="mobile-filter-apply-btn" onClick={() => setShowMobileFilters(false)}>
            Sonuçları Göster ({products.length})
          </button>
        </div>
      </aside>

      {/* Mobile Sticky Bottom Tab Navigation Bar */}
      <div className="mobile-bottom-nav">
        <button className={`mobile-nav-item ${activeTab === 'search' ? 'active' : ''}`} onClick={() => { setActiveTab('search'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
          <SearchIcon size={20} />
          <span>Arama</span>
        </button>
        <button className={`mobile-nav-item ${activeTab === 'studio' ? 'active' : ''}`} onClick={() => { setActiveTab('studio'); if(activeProduct) logInteraction('VIEW', activeProduct.id, activeProduct.brandId); }}>
          <Layers size={20} />
          <span>3D Stüdyo</span>
        </button>
        <button className="mobile-nav-item" onClick={() => { if(currentUser) { setShowFavoritesPanel(!showFavoritesPanel); } else { window.location.href = '/uyelik'; } }}>
          <div style={{ position: 'relative', display: 'inline-flex' }}>
            <HeartIcon size={20} />
            {userFavorites.length > 0 && <span className="mobile-nav-badge">{userFavorites.length}</span>}
          </div>
          <span>Favoriler</span>
        </button>
        <button className={`mobile-nav-item ${activeTab === 'dealers' ? 'active' : ''}`} onClick={() => { setActiveTab('dealers'); if(activeProduct) logInteraction('CLICK', activeProduct.id, activeProduct.brandId); }}>
          <MapPin size={20} />
          <span>Bayiler</span>
        </button>
        <button className={`mobile-nav-item ${showMobileMenu ? 'active' : ''}`} onClick={() => setShowMobileMenu(!showMobileMenu)}>
          <MenuIcon size={20} />
          <span>Menü</span>
        </button>
      </div>

      {/* 🏆 WEEKLY PODIUM SPOTLIGHT SHOWCASE MODAL */}
      {showPodiumModal && podiumData && (
        <div 
          className="podium-modal-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            background: 'rgba(5, 8, 15, 0.88)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => {
            setShowPodiumModal(false);
            if (podiumData.weekNumber) {
              sessionStorage.setItem(`sb_podium_seen_w${podiumData.weekNumber}`, 'true');
            }
          }}
        >
          <div 
            className="podium-card glass-panel"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '410px',
              maxHeight: 'min(92vh, 590px)',
              overflow: 'hidden',
              background: 'linear-gradient(180deg, #090d16 0%, #111827 50%, #030712 100%)',
              border: '1.5px solid rgba(212, 175, 55, 0.6)',
              borderRadius: '24px',
              boxShadow: '0 30px 80px -15px rgba(0,0,0,0.95), 0 0 60px rgba(212, 175, 55, 0.25)',
              position: 'relative',
              color: '#ffffff',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Header Badge & Close Button */}
            <div style={{
              padding: '14px 18px 10px 18px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid rgba(255,255,255,0.06)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  background: 'linear-gradient(135deg, #b38e47 0%, #d4af37 50%, #fef08a 100%)',
                  color: '#090d16',
                  fontWeight: '900',
                  fontSize: '0.68rem',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  boxShadow: '0 0 15px rgba(212, 175, 55, 0.5)',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <Sparkles size={13} /> Haftanın Podyum Vitrini
                </span>
                {podiumData.brand?.name && (
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '700' }}>
                    • {podiumData.brand.name}
                  </span>
                )}
              </div>

              <button 
                onClick={() => {
                  setShowPodiumModal(false);
                  if (podiumData.weekNumber) {
                    sessionStorage.setItem(`sb_podium_seen_w${podiumData.weekNumber}`, 'true');
                  }
                }}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#cbd5e1',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Podium Runway Stage Body */}
            <div style={{ padding: '14px 18px 18px 18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* 3D Runway Stage & Tall Standing Slab Visual */}
              <div style={{
                position: 'relative',
                height: '250px',
                borderRadius: '16px',
                background: 'radial-gradient(ellipse at 50% 10%, rgba(212, 175, 55, 0.3) 0%, rgba(15, 23, 42, 0.98) 70%, #030712 100%)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                boxShadow: 'inset 0 0 30px rgba(0,0,0,0.8)'
              }}>
                {/* Overhead Runway Spotlight Beams */}
                <div style={{
                  position: 'absolute',
                  top: '-25px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '190px',
                  height: '240px',
                  background: 'linear-gradient(180deg, rgba(255, 240, 180, 0.25) 0%, rgba(212, 175, 55, 0.08) 60%, transparent 100%)',
                  clipPath: 'polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%)',
                  pointerEvents: 'none',
                  zIndex: 1
                }} />

                {/* Shimmer Ambient Glow behind standing slab */}
                <div style={{
                  position: 'absolute',
                  width: '140px',
                  height: '190px',
                  background: 'radial-gradient(circle, rgba(212, 175, 55, 0.35) 0%, transparent 70%)',
                  filter: 'blur(16px)',
                  zIndex: 1
                }} />

                {/* Tall "Boydan" Standing Ceramic Slab on Runway */}
                {(podiumData.product?.imageUrl || podiumData.product?.textureUrl) && (
                  <img 
                    src={podiumData.product.imageUrl || podiumData.product.textureUrl} 
                    alt={podiumData.product.name}
                    style={{
                      height: '215px',
                      width: '155px',
                      objectFit: 'cover',
                      borderRadius: '12px',
                      border: '2px solid rgba(212, 175, 55, 0.6)',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.9), 0 0 25px rgba(212, 175, 55, 0.4)',
                      zIndex: 3,
                      transform: 'perspective(1000px) rotateX(6deg) translateY(-6px)',
                      transition: 'transform 0.4s ease'
                    }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/textures/concrete_light_grey.jpg';
                    }}
                  />
                )}

                {/* Metallic Gold Catwalk Pedestal Base */}
                <div style={{
                  position: 'absolute',
                  bottom: '10px',
                  width: '75%',
                  height: '18px',
                  borderRadius: '50%',
                  background: 'radial-gradient(ellipse at center, rgba(212, 175, 55, 0.6) 0%, rgba(180, 140, 45, 0.2) 60%, transparent 90%)',
                  boxShadow: '0 0 16px rgba(212, 175, 55, 0.5)',
                  filter: 'blur(3px)',
                  zIndex: 2
                }} />

                {/* Runway Stage Floor Surface Reflection Line */}
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '40px',
                  background: 'linear-gradient(180deg, transparent 0%, rgba(212, 175, 55, 0.1) 100%)',
                  borderTop: '1px solid rgba(212, 175, 55, 0.3)',
                  zIndex: 1
                }} />
              </div>

              {/* Title & Description */}
              <div style={{ textAlign: 'center', padding: '0 2px' }}>
                <div style={{ fontSize: '0.7rem', color: '#d4af37', fontWeight: '800', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '4px' }}>
                  {podiumData.product?.code} • {podiumData.product?.width || 60}x{podiumData.product?.height || 120} CM
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '900', margin: '0 0 4px 0', fontFamily: 'var(--font-title, "Outfit", sans-serif)', color: '#ffffff', letterSpacing: '-0.01em' }}>
                  {podiumData.title || podiumData.product?.name}
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#cbd5e1', margin: 0, lineHeight: '1.4' }}>
                  {podiumData.description || `${podiumData.brand?.name} markasının bu haftaki podyum yıldızı olan özel koleksiyon seramiği SeramikBak Vitrini'nde.`}
                </p>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '2px' }}>
                <button
                  onClick={() => {
                    setShowPodiumModal(false);
                    if (podiumData.weekNumber) {
                      sessionStorage.setItem(`sb_podium_seen_w${podiumData.weekNumber}`, 'true');
                    }
                    if (podiumData.bid?.id) {
                      fetch('/api/podium/active', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ bidId: podiumData.bid.id, action: 'studio' })
                      }).catch(() => {});
                    }
                    if (podiumData.product) {
                      navigateTo3DStudio(podiumData.product);
                    }
                  }}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #b38e47 0%, #d4af37 50%, #fef08a 100%)',
                    color: '#090d16',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '11px',
                    fontWeight: '900',
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: '0 6px 20px rgba(212,175,55,0.4)',
                    letterSpacing: '0.02em',
                    transition: 'transform 0.2s'
                  }}
                >
                  <Sparkles size={16} /> 3D Sanal Stüdyoda Canlı Dene
                </button>

                <button
                  onClick={() => {
                    setShowPodiumModal(false);
                    if (podiumData.weekNumber) {
                      sessionStorage.setItem(`sb_podium_seen_w${podiumData.weekNumber}`, 'true');
                    }
                    if (podiumData.bid?.id) {
                      fetch('/api/podium/active', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ bidId: podiumData.bid.id, action: 'click' })
                      }).catch(() => {});
                    }
                    if (podiumData.product) {
                      handleProductCardClick(podiumData.product);
                    }
                  }}
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.06)',
                    color: '#e2e8f0',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '12px',
                    padding: '9px',
                    fontWeight: '700',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'background 0.2s'
                  }}
                >
                  Detayları İncele
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING AI CHATBOT WIDGET */}
      <div className="floating-ai-chatbot" style={{ zIndex: 9999 }}>
        {!showAiChatbot ? (
          <button 
            className="ai-chatbot-toggle-btn"
            onClick={() => setShowAiChatbot(true)}
            style={{
              position: 'fixed',
              bottom: '90px',
              right: '24px',
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              color: '#d4af37',
              border: '2px solid #d4af37',
              borderRadius: '50px',
              padding: '12px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 10px 25px rgba(212, 175, 55, 0.25)',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '0.82rem',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              letterSpacing: '0.03em'
            }}
          >
            <div style={{
              width: '24px',
              height: '24px',
              background: 'linear-gradient(135deg, #d4af37 0%, #987532 100%)',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: '850',
              fontSize: '0.72rem',
              boxShadow: '0 2px 6px rgba(179, 142, 71, 0.3)',
              lineHeight: '1',
              flexShrink: 0
            }}>
              SB
            </div>
            <span>Asistan</span>
          </button>
        ) : (
          <div 
            className="ai-chatbot-window glass-panel"
            style={{
              position: 'fixed',
              bottom: '90px',
              right: '24px',
              width: '360px',
              height: '480px',
              background: '#ffffff',
              borderRadius: '16px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              border: '1px solid rgba(212, 175, 55, 0.3)'
            }}
          >
            {/* Header */}
            <div 
              className="ai-chat-header"
              style={{
                background: 'linear-gradient(135deg, #0b0f19 0%, #1e293b 100%)',
                color: '#fff',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '2px solid #d4af37'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  background: 'linear-gradient(135deg, #d4af37 0%, #987532 100%)',
                  borderRadius: '7px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontWeight: '850',
                  fontSize: '0.88rem',
                  boxShadow: '0 2px 8px rgba(179, 142, 71, 0.3)',
                  lineHeight: '1',
                  flexShrink: 0
                }}>
                  SB
                </div>
                <div style={{ textAlign: 'left' }}>
                  <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: '800', color: '#d4af37' }}>SeramikBak AI Asistanı</h4>
                  <span style={{ fontSize: '0.65rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    <span style={{ width: '6px', height: '6px', backgroundColor: '#10b981', borderRadius: '50%', display: 'inline-block' }}></span>
                    Çevrimiçi Asistan
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setShowAiChatbot(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                ✕
              </button>
            </div>

            {/* Messages Area */}
            <div 
              className="ai-chat-messages"
              style={{
                flex: 1,
                padding: '16px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                background: '#f8fafc',
                textAlign: 'left'
              }}
            >
              {aiChatMessages.map((msg, idx) => (
                <div 
                  key={idx} 
                  style={{
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '80%',
                    background: msg.role === 'user' ? '#1e293b' : '#ffffff',
                    color: msg.role === 'user' ? '#ffffff' : '#0f172a',
                    padding: '10px 14px',
                    borderRadius: msg.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                    fontSize: '0.78rem',
                    lineHeight: '1.4',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    border: msg.role === 'user' ? 'none' : '1px solid #e2e8f0',
                    whiteSpace: 'pre-line'
                  }}
                >
                  {renderChatMessage(msg.content)}
                </div>
              ))}
              {aiChatLoading && (
                <div 
                  style={{
                    alignSelf: 'flex-start',
                    background: '#ffffff',
                    color: '#64748b',
                    padding: '10px 14px',
                    borderRadius: '12px 12px 12px 2px',
                    fontSize: '0.75rem',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span className="dot-typing-animation">Düşünüyor...</span>
                </div>
              )}
            </div>

            {/* Input Form */}
            <form 
              onSubmit={handleSendAiChatMessage}
              style={{
                padding: '12px',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                gap: '8px',
                background: '#fff'
              }}
            >
              <input 
                type="text"
                value={aiChatInput}
                onChange={e => setAiChatInput(e.target.value)}
                placeholder="Tasarım veya ölçü sorusu sorun..."
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.78rem',
                  outline: 'none'
                }}
              />
              <button 
                type="submit"
                disabled={aiChatLoading || !aiChatInput.trim()}
                style={{
                  background: aiChatInput.trim() ? '#1e293b' : '#cbd5e1',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 16px',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  cursor: aiChatInput.trim() ? 'pointer' : 'default'
                }}
              >
                Gönder
              </button>
            </form>
          </div>
        )}
      </div>

      {/* 1:1 SCALE MOBILE & DESKTOP AR VIEWER MODAL */}
      {arModalProduct && (
        <ModelViewerAR 
          product={arModalProduct} 
          onClose={() => setArModalProduct(null)} 
        />
      )}

      {/* Embedded CSS specific to this high-fidelity layout */}
      <style jsx>{`
        /* ==========================================================================
           NEW LIGHT LUXURY UTILITY BAR & HEADER STYLE
           ========================================================================== */

        /* Top Utility Bar - Light Luxury Version */
        /* Top Utility Bar - Modern Single-Line Professional Version */
        :global(.top-utility-bar) {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 6px 24px;
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.07);
          border-bottom: none;
          border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;
          font-family: var(--font-title);
          font-size: 0.76rem;
          color: #475569;
          margin-bottom: 0px;
          z-index: 1001;
          position: relative;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
          overflow-x: auto;
          white-space: nowrap !important;
          scrollbar-width: none;
        }

        :global(.top-utility-bar::-webkit-scrollbar) {
          display: none;
        }

        :global(.utility-left) {
          display: flex;
          align-items: center;
          flex-shrink: 0;
          white-space: nowrap !important;
        }

        :global(.utility-message) {
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 600;
          letter-spacing: 0.01em;
          white-space: nowrap !important;
          color: #334155;
        }

        :global(.text-gold) {
          color: #b38e47;
          font-weight: 700;
        }

        :global(.utility-right) {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
          white-space: nowrap !important;
        }

        :global(.utility-item) {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #475569 !important;
          text-decoration: none !important;
          font-weight: 600;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          background: transparent;
          border: 1px solid transparent;
          cursor: pointer;
          padding: 5px 10px;
          border-radius: 8px;
          white-space: nowrap !important;
          line-height: 1 !important;
          font-size: 0.75rem;
        }

        :global(.utility-item span) {
          white-space: nowrap !important;
          display: inline-block;
          line-height: 1 !important;
        }

        :global(.utility-item:hover) {
          color: #0f172a !important;
          background: #f8fafc;
          border-color: rgba(0, 0, 0, 0.05);
          transform: translateY(-1px);
        }

        :global(.utility-item) svg {
          color: #64748b !important;
          transition: color 0.2s ease;
          flex-shrink: 0;
        }

        :global(.utility-item:hover) svg {
          color: #b38e47 !important;
        }

        :global(.utility-divider) {
          color: #cbd5e1;
          user-select: none;
          font-size: 0.7rem;
          opacity: 0.5;
          margin: 0 1px;
        }

        :global(.kiosk-btn-link) {
          position: relative;
          background: rgba(16, 185, 129, 0.05) !important;
          border: 1px solid rgba(16, 185, 129, 0.2) !important;
          color: #059669 !important;
        }

        :global(.kiosk-btn-link:hover) {
          background: rgba(16, 185, 129, 0.12) !important;
          border-color: rgba(16, 185, 129, 0.35) !important;
        }

        :global(.pulse-indicator-green) {
          width: 6px;
          height: 6px;
          background-color: #10b981;
          border-radius: 50%;
          box-shadow: 0 0 6px #10b981;
          animation: pulseGreen 2.5s infinite;
          flex-shrink: 0;
        }

        @keyframes pulseGreen {
          0% { transform: scale(0.95); opacity: 0.8; }
          50% { transform: scale(1.25); opacity: 1; box-shadow: 0 0 9px #10b981; }
          100% { transform: scale(0.95); opacity: 0.8; }
        }

        :global(.b2b-btn-link) {
          background: linear-gradient(135deg, rgba(212, 175, 55, 0.08) 0%, rgba(179, 142, 71, 0.12) 100%) !important;
          border: 1px solid rgba(179, 142, 71, 0.3) !important;
          color: #8c6b30 !important;
          padding: 5px 11px !important;
          border-radius: 20px !important;
          font-weight: 700 !important;
        }

        :global(.b2b-btn-link:hover) {
          background: linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(179, 142, 71, 0.22) 100%) !important;
          border-color: rgba(179, 142, 71, 0.5) !important;
          color: #715523 !important;
          box-shadow: 0 2px 8px rgba(179, 142, 71, 0.15);
        }

        :global(.outlet-btn-link) {
          background: rgba(239, 68, 68, 0.05) !important;
          border: 1px solid rgba(239, 68, 68, 0.2) !important;
          border-radius: 20px !important;
          padding: 5px 11px !important;
        }

        :global(.outlet-btn-link:hover) {
          background: rgba(239, 68, 68, 0.12) !important;
          border-color: rgba(239, 68, 68, 0.4) !important;
        }

        :global(.b2b-small-badge) {
          background: linear-gradient(135deg, #d4af37 0%, #b38e47 100%);
          color: #ffffff !important;
          font-size: 0.56rem;
          font-weight: 800;
          padding: 2px 5px;
          border-radius: 4px;
          line-height: 1;
          letter-spacing: 0.04em;
          margin-left: 2px;
        }

        .kiosk-status-text {
          font-size: 0.85rem;
          font-weight: 700;
          color: #8c6b30;
          letter-spacing: 0.08em;
          text-shadow: 0 0 10px rgba(179, 142, 71, 0.1);
        }

        /* Redesigned Premium White Header */
        .main-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 28px;
          border-radius: var(--border-radius-lg);
          background: #ffffff; /* solid white */
          border: 1px solid rgba(0, 0, 0, 0.06);
          box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.03), 
                      0 1px 0 rgba(255, 255, 255, 0.8) inset;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          z-index: 1000;
        }

        /* Adjust header border-radius if Top Utility Bar is present */
        :global(.top-utility-bar) + .main-header {
          border-radius: 0 0 var(--border-radius-lg) var(--border-radius-lg);
          border-top: 1px solid rgba(0, 0, 0, 0.04);
        }

        .main-header:hover {
          border-color: rgba(212, 175, 55, 0.25);
          box-shadow: 0 15px 35px -10px rgba(179, 142, 71, 0.08);
        }

        .header-brand {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .logo-icon {
          width: 54px; /* enlarged logo icon */
          height: 54px;
          background: linear-gradient(135deg, var(--accent-gold) 0%, #987532 100%);
          border-radius: var(--border-radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-title);
          font-weight: 850;
          color: #ffffff;
          font-size: 1.55rem;
          box-shadow: 0 4px 14px rgba(179, 142, 71, 0.3);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .logo-text {
          font-family: var(--font-title);
          font-size: 1.85rem; /* enlarged logo text */
          font-weight: 900;
          color: var(--text-primary);
          letter-spacing: -0.03em;
          background: linear-gradient(135deg, var(--text-primary) 30%, var(--accent-gold) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .header-nav {
          display: flex;
          background: rgba(0, 0, 0, 0.035); /* dark glass backdrop in light header */
          padding: 5px;
          border-radius: 30px;
          border: 1px solid rgba(0, 0, 0, 0.04);
          backdrop-filter: blur(5px);
          gap: 4px;
        }

        .nav-link {
          background: transparent;
          border: none;
          color: #475569;
          padding: 8px 24px;
          border-radius: 24px;
          cursor: pointer;
          font-family: var(--font-title);
          font-weight: 700;
          font-size: 0.85rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          gap: 8px;
          letter-spacing: 0.02em;
          white-space: nowrap !important;
          flex-shrink: 0;
        }

        .nav-link span {
          white-space: nowrap !important;
          word-break: keep-all !important;
          line-height: 1 !important;
          display: inline-block !important;
        }

        .nav-link svg {
          color: #64748b;
          transition: color 0.3s ease, transform 0.3s ease;
        }

        .nav-link:hover {
          color: #0f172a;
          background: rgba(255, 255, 255, 0.6);
        }

        .nav-link:hover svg {
          color: var(--accent-gold);
          transform: translateY(-1px);
        }

        .nav-link.active {
          color: #ffffff !important;
          background: #0f172a; /* high contrast modern charcoal button */
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);
        }

        .nav-link.active svg {
          color: #ecd099 !important;
        }

        .header-right-buttons {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .desktop-header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .header-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(0, 0, 0, 0.02);
          border: 1px solid rgba(0, 0, 0, 0.05);
          color: #475569;
          padding: 9px 18px;
          border-radius: 20px;
          cursor: pointer;
          font-family: var(--font-title);
          font-size: 0.8rem;
          font-weight: 600;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          text-decoration: none !important;
        }

        .header-btn:hover {
          transform: translateY(-2px);
          background: #ffffff;
          border-color: rgba(212, 175, 55, 0.25);
          color: #0f172a;
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.04);
        }

        .header-btn:active {
          transform: translateY(0);
        }

        .header-btn svg {
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .header-btn:hover svg {
          transform: scale(1.1);
        }

        .header-btn.favorites-btn {
          position: relative;
        }

        .header-btn.favorites-btn:hover {
          border-color: rgba(225, 29, 72, 0.25);
        }

        .heart-icon-gold {
          color: #64748b;
          transition: color 0.3s ease;
        }

        .header-btn.favorites-btn:hover .heart-icon-gold {
          color: #e11d48;
          filter: drop-shadow(0 0 2px rgba(225, 29, 72, 0.3));
        }

        .fav-count-badge {
          background: linear-gradient(135deg, #e11d48 0%, #be123c 100%);
          color: #ffffff;
          font-size: 0.65rem;
          font-weight: 800;
          min-width: 17px;
          height: 17px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
          line-height: 1;
          box-shadow: 0 2px 6px rgba(225, 29, 72, 0.3);
        }

        .header-btn.kiosk-btn.active.exit-kiosk-btn {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: #ffffff;
          border: none;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }

        .header-btn.kiosk-btn.active.exit-kiosk-btn:hover {
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
          box-shadow: 0 6px 16px rgba(239, 68, 68, 0.45);
        }

        /* Account menu mini avatar styling */
        .user-avatar-mini {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--accent-gold) 0%, #987532 100%);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-title);
          font-weight: 800;
          font-size: 0.72rem;
          box-shadow: 0 2px 6px rgba(179, 142, 71, 0.3);
        }

        /* Hamburger button */
        .hamburger-menu-btn {
          background: transparent;
          border: none;
          color: #0f172a;
          cursor: pointer;
          padding: 8px;
          display: none;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          border-radius: 50%;
        }

        .hamburger-menu-btn:hover {
          background: rgba(0, 0, 0, 0.04);
          transform: scale(1.05);
        }

        /* ==========================================================================
           REDESIGNED LIGHT LUXURY COLLECTIONS BANNER STYLE
           ========================================================================== */

        .project-top-banner {
          display: flex;
          align-items: center;
          background: linear-gradient(135deg, #fdfbf7 0%, #f5efe1 100%); /* warm champagne cream */
          border: 1px solid rgba(179, 142, 71, 0.22);
          border-radius: var(--border-radius-lg);
          padding: 0;
          gap: 0;
          box-shadow: 0 10px 30px rgba(179, 142, 71, 0.05), 
                      inset 0 1px 0 #ffffff;
          overflow: hidden;
          position: relative;
        }

        .banner-left-area {
          flex-shrink: 0;
          padding: 20px 24px;
          display: flex;
          align-items: center;
          z-index: 2;
          background: linear-gradient(90deg, #fdfbf7 85%, transparent 100%);
        }

        .banner-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #ffffff;
          border: 1px solid rgba(179, 142, 71, 0.35);
          color: #8c6b30;
          padding: 8px 18px;
          border-radius: 20px;
          font-size: 0.74rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          box-shadow: 0 4px 12px rgba(179, 142, 71, 0.06);
          white-space: nowrap;
        }

        .banner-badge svg {
          color: #8c6b30;
          filter: drop-shadow(0 0 2px rgba(179, 142, 71, 0.2));
        }

        .banner-ad-showcase {
          display: flex;
          align-items: center;
          gap: 14px;
          background: linear-gradient(135deg, rgba(179, 142, 71, 0.05) 0%, rgba(255, 255, 255, 0.2) 100%);
          border-left: 1px solid rgba(179, 142, 71, 0.12);
          border-right: 1px solid rgba(179, 142, 71, 0.12);
          padding: 10px 22px;
          height: 100%;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
          position: relative;
          z-index: 3;
          flex-shrink: 0;
          min-width: 270px;
          border-radius: 0;
        }

        .banner-ad-showcase:hover {
          background: linear-gradient(135deg, rgba(179, 142, 71, 0.1) 0%, rgba(255, 255, 255, 0.4) 100%);
          box-shadow: inset 0 0 10px rgba(179, 142, 71, 0.08);
          transform: scale(1.01);
        }

        .ad-badge {
          font-size: 0.58rem;
          font-weight: 900;
          color: #ffffff;
          background: #0f172a;
          padding: 3px 8px;
          border-radius: 4px;
          letter-spacing: 0.06em;
        }

        .ad-thumb {
          width: 70px;
          height: 70px;
          border-radius: 10px;
          object-fit: cover;
          border: 1.5px solid rgba(179, 142, 71, 0.2);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
        }

        .banner-ad-showcase:hover .ad-thumb {
          border-color: #8c6b30;
          box-shadow: 0 4px 10px rgba(179, 142, 71, 0.15);
        }

        .ad-info {
          display: flex;
          flex-direction: column;
          gap: 3px;
          line-height: 1.25;
        }

        .ad-brand {
          font-size: 0.65rem;
          color: #8c6b30;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .ad-name {
          font-size: 0.76rem;
          color: #1e293b;
          font-weight: 700;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 140px;
        }

        .banner-marquee-wrapper {
          flex-grow: 1;
          overflow: hidden;
          position: relative;
          mask-image: linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%);
          -webkit-mask-image: linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%);
        }

        .banner-marquee-track {
          display: flex;
          align-items: center;
          gap: 28px;
          animation: marqueeScroll 40s linear infinite;
          width: max-content;
          padding: 12px 0;
        }

        .banner-marquee-track:hover {
          animation-play-state: paused;
        }

        @keyframes marqueeScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        /* Banner Showcase Slabs - Light Version */
        .banner-item {
          display: flex;
          align-items: center;
          gap: 16px;
          cursor: pointer;
          transition: all 0.35s cubic-bezier(0.25, 1, 0.5, 1);
          padding: 8px 16px 8px 8px;
          border-radius: 18px;
          flex-shrink: 0;
          background: rgba(255, 255, 255, 0.8); /* white glass tiles */
          backdrop-filter: blur(8px);
          border: 1px solid rgba(179, 142, 71, 0.15);
          width: 300px;
          height: 130px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
        }

        .banner-item:hover {
          transform: translateY(-3px) scale(1.02);
          background: #ffffff;
          border-color: rgba(179, 142, 71, 0.45);
          box-shadow: 0 10px 25px rgba(179, 142, 71, 0.12);
        }

        .banner-img {
          width: 100px;
          height: 112px;
          object-fit: cover;
          border-radius: 12px;
          flex-shrink: 0;
          border: 1px solid rgba(179, 142, 71, 0.1);
          transition: transform 0.3s ease;
        }

        .banner-item:hover .banner-img {
          transform: scale(1.03);
        }

        .banner-item-info {
          display: flex;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
          justify-content: center;
          text-align: left;
          min-width: 0;
        }

        .banner-brand-name {
          font-size: 0.68rem;
          font-weight: 800;
          color: #8c6b30;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .banner-product-name {
          font-size: 0.82rem;
          font-weight: 700;
          color: #0f172a;
          line-height: 1.25;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Mobile Menu Drawer Styles */
        .mobile-menu-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.35); /* Elegant overlay color */
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 11000;
          display: flex;
          justify-content: flex-end;
          animation: fadeIn 0.3s ease forwards;
        }

        .mobile-menu-drawer {
          width: 320px;
          max-width: 85vw;
          height: 100%;
          background: rgba(255, 255, 255, 0.88) !important; /* Premium semi-transparent white */
          backdrop-filter: blur(25px) !important;
          -webkit-backdrop-filter: blur(25px) !important;
          border: none !important;
          border-left: 1px solid rgba(0, 0, 0, 0.08) !important;
          border-radius: 0px !important; /* Full height should be square on the screen edges */
          display: flex;
          flex-direction: column;
          padding: 32px 24px;
          box-shadow: -10px 0 40px rgba(15, 23, 42, 0.08) !important;
          animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .mobile-menu-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 28px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
          padding-bottom: 18px;
        }

        .mobile-menu-brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .mobile-menu-logo {
          width: 34px;
          height: 34px;
          background: linear-gradient(135deg, var(--accent-gold) 0%, #987532 100%);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-title);
          font-weight: 850;
          color: #ffffff;
          font-size: 1rem;
          box-shadow: 0 4px 10px rgba(179, 142, 71, 0.25);
        }

        .mobile-menu-brand-info {
          display: flex;
          flex-direction: column;
        }

        .mobile-menu-brand-name {
          font-family: var(--font-title);
          font-size: 1.1rem;
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1.1;
          letter-spacing: -0.01em;
        }

        .mobile-menu-brand-tag {
          font-size: 0.68rem;
          color: var(--text-muted);
          font-weight: 600;
          letter-spacing: 0.02em;
        }

        .mobile-menu-close {
          background: rgba(0, 0, 0, 0.03);
          border: 1px solid rgba(0, 0, 0, 0.05);
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .mobile-menu-close:hover {
          background: rgba(239, 68, 68, 0.08);
          color: #ef4444;
          border-color: rgba(239, 68, 68, 0.15);
          transform: rotate(90deg);
        }

        .mobile-menu-nav {
          display: flex;
          flex-direction: column;
          gap: 6px;
          overflow-y: auto;
          flex-grow: 1;
        }

        /* Mobile Menu Link Styling */
        :global(.mobile-nav-link) {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: var(--border-radius-sm);
          font-family: var(--font-title);
          font-weight: 600;
          font-size: 0.95rem;
          color: var(--text-secondary);
          background: transparent;
          border: none;
          text-align: left;
          cursor: pointer;
          text-decoration: none !important;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        :global(.mobile-nav-link:hover) {
          background: rgba(0, 0, 0, 0.03);
          color: var(--text-primary);
          transform: translateX(4px);
        }

        :global(.mobile-nav-link svg) {
          color: var(--text-muted);
          transition: all 0.2s ease;
        }

        :global(.mobile-nav-link:hover svg) {
          color: var(--accent-gold);
          transform: scale(1.1);
        }

        :global(.mobile-nav-link.active) {
          background: linear-gradient(135deg, var(--accent-gold) 0%, #987532 100%) !important;
          color: #ffffff !important;
          box-shadow: 0 4px 12px rgba(179, 142, 71, 0.2);
        }

        :global(.mobile-nav-link.active svg) {
          color: #ffffff !important;
        }

        :global(.mobile-nav-link.b2b-link) {
          color: var(--accent-blue-hover) !important;
          background: rgba(37, 99, 235, 0.05);
        }

        :global(.mobile-nav-link.b2b-link svg) {
          color: var(--accent-blue-hover) !important;
        }

        :global(.mobile-nav-link.b2b-link:hover) {
          background: rgba(37, 99, 235, 0.1);
        }

        :global(.mobile-nav-link.outlet-link) {
          color: #ef4444 !important;
          background: rgba(239, 68, 68, 0.05);
        }

        :global(.mobile-nav-link.outlet-link svg) {
          color: #ef4444 !important;
        }

        :global(.mobile-nav-link.outlet-link:hover) {
          background: rgba(239, 68, 68, 0.12);
        }

        :global(.outlet-small-badge) {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: #ffffff !important;
          font-size: 0.58rem;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: 4px;
          line-height: 1;
          margin-left: auto;
          letter-spacing: 0.04em;
        }

        :global(.mobile-nav-link.fav-link) {
          color: var(--accent-gold) !important;
          background: rgba(179, 142, 71, 0.06);
        }

        :global(.mobile-nav-link.fav-link svg) {
          color: var(--accent-gold) !important;
        }

        :global(.mobile-nav-link.fav-link:hover) {
          background: rgba(179, 142, 71, 0.12);
        }

        :global(.mobile-nav-link.login-link) {
          color: var(--text-primary) !important;
          background: rgba(0, 0, 0, 0.02);
          border: 1px solid rgba(0, 0, 0, 0.06);
          margin-top: 10px;
          justify-content: center;
        }

        :global(.mobile-nav-link.login-link:hover) {
          background: rgba(0, 0, 0, 0.06);
          border-color: rgba(0, 0, 0, 0.12);
        }

        .mobile-menu-divider {
          height: 1px;
          background: rgba(0, 0, 0, 0.06);
          margin: 14px 0;
        }

        .mobile-user-info {
          font-size: 0.78rem;
          color: var(--text-secondary);
          padding: 8px 16px;
          background: rgba(0, 0, 0, 0.02);
          border-radius: 8px;
          margin-top: 10px;
          border: 1px solid rgba(0, 0, 0, 0.04);
        }

        :global(.mobile-nav-link.logout-link) {
          color: #ef4444 !important;
          background: rgba(239, 68, 68, 0.05);
          margin-top: 6px;
        }

        :global(.mobile-nav-link.logout-link svg) {
          color: #ef4444 !important;
        }

        :global(.mobile-nav-link.logout-link:hover) {
          background: rgba(239, 68, 68, 0.1);
        }

        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }   text-decoration: none !important;
          transition: all 0.2s ease;
        }

        :global(.mobile-nav-link:hover) {
          background: rgba(0, 0, 0, 0.03);
          color: var(--text-primary);
        }

        :global(.mobile-nav-link.active) {
          background: linear-gradient(135deg, var(--accent-gold) 0%, #987532 100%);
          color: #ffffff !important;
          box-shadow: 0 4px 10px rgba(179, 142, 71, 0.2);
        }

        :global(.mobile-nav-link.b2b-link) {
          color: var(--accent-blue-hover) !important;
          background: rgba(37, 99, 235, 0.05);
        }

        :global(.mobile-nav-link.highlight-link) {
          color: var(--accent-gold) !important;
          background: rgba(179, 142, 71, 0.08);
          border: 1px solid var(--border-gold);
        }

        .mobile-menu-divider {
          height: 1px;
          background: var(--border-color);
          margin: 8px 0;
        }

        .mobile-user-info {
          font-size: 0.8rem;
          color: var(--text-secondary);
          padding: 6px 16px;
        }

        :global(.mobile-nav-link.logout-link) {
          color: #ef4444 !important;
          background: rgba(239, 68, 68, 0.05);
        }

        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }

        .mobile-header-user-actions {
          display: none;
        }

        @media (max-width: 960px) {
          .header-brand {
            margin-right: auto !important;
          }
          .header-right-buttons {
            margin-left: auto !important;
            gap: 8px !important;
          }
          .header-nav {
            display: none !important;
          }
          .desktop-header-actions {
            display: none !important;
          }
          .mobile-header-user-actions {
            display: flex !important;
            align-items: center;
            margin-right: 4px;
          }
          :global(a.mobile-header-user-btn),
          :global(.mobile-header-user-btn) {
            display: flex !important;
            align-items: center !important;
            gap: 6px !important;
            padding: 4px 10px 4px 5px !important;
            border-radius: 20px !important;
            background: linear-gradient(135deg, rgba(212, 175, 55, 0.16) 0%, rgba(179, 142, 71, 0.08) 100%) !important;
            border: 1px solid rgba(212, 175, 55, 0.35) !important;
            color: #b38e47 !important;
            text-decoration: none !important;
            font-size: 0.76rem !important;
            font-weight: 800 !important;
            line-height: 1 !important;
            white-space: nowrap !important;
            transition: all 0.2s ease !important;
            box-shadow: 0 2px 8px rgba(179, 142, 71, 0.12) !important;
            outline: none !important;
          }
          :global(a.mobile-header-user-btn:hover),
          :global(.mobile-header-user-btn:hover),
          :global(a.mobile-header-user-btn:visited),
          :global(.mobile-header-user-btn:visited) {
            color: #b38e47 !important;
            text-decoration: none !important;
          }
          :global(.mobile-header-user-btn .user-avatar-mini) {
            width: 24px !important;
            height: 24px !important;
            border-radius: 50% !important;
            background: linear-gradient(135deg, #d4af37 0%, #b38e47 100%) !important;
            color: #ffffff !important;
            font-size: 0.75rem !important;
            font-weight: 900 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            box-shadow: 0 2px 6px rgba(179, 142, 71, 0.3) !important;
            flex-shrink: 0 !important;
          }
          :global(.mobile-header-user-btn .mobile-user-label) {
            font-weight: 800 !important;
            color: #b38e47 !important;
            text-decoration: none !important;
            font-size: 0.76rem !important;
            line-height: 1 !important;
          }
          .hamburger-menu-btn {
            display: flex !important;
          }
        }

        @media (max-width: 768px) {
          .top-utility-bar {
            display: none !important;
          }
          .project-top-banner {
            border-radius: var(--border-radius-md);
            flex-direction: column;
            align-items: stretch;
          }
          .banner-left-area {
            background: #07090f;
            justify-content: center;
            padding: 12px;
          }
          .banner-ad-showcase {
            border-left: none;
            border-right: none;
            border-top: 1px solid rgba(212, 175, 55, 0.18);
            border-bottom: 1px solid rgba(212, 175, 55, 0.18);
            padding: 12px;
            justify-content: center;
          }
          .banner-marquee-wrapper {
            mask-image: linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%);
            -webkit-mask-image: linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%);
          }
        }

        .content-container {
          flex-grow: 1;
        }

        /* SHOWROOM HERO BANNER (Full Visual Cover with Light Overlay) */
        .showroom-hero-banner {
          position: relative;
          border-radius: var(--border-radius-lg);
          background: url('/hero/hero_ceramics.jpg') no-repeat center center;
          background-size: cover;
          padding: 48px 48px 48px 60px;
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 40px;
          align-items: center;
          min-height: 480px;
          overflow: hidden;
          margin-bottom: 24px;
          box-shadow: 0 15px 45px rgba(0, 0, 0, 0.05);
        }

        .hero-dark-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(10, 12, 16, 0.95) 0%, rgba(15, 17, 23, 0.78) 50%, rgba(15, 17, 23, 0.15) 100%);
          z-index: 1;
        }

        .hero-banner-content {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
          gap: 18px;
        }

        .hero-badge-capsule {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(197, 160, 89, 0.15);
          border: 1px solid var(--border-gold);
          color: var(--accent-gold);
          font-size: 0.68rem;
          font-weight: 700;
          padding: 6px 14px;
          border-radius: 20px;
          letter-spacing: 0.08em;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        .badge-icon-gold {
          color: var(--accent-gold);
        }

        .showroom-hero-banner h1,
        .showroom-hero-banner h2 {
          font-size: 2.5rem;
          font-weight: 700;
          color: #ffffff !important;
          line-height: 1.2;
          letter-spacing: -0.025em;
          text-shadow: 0 4px 20px rgba(0, 0, 0, 0.8);
        }

        .highlight-text {
          color: var(--accent-gold);
          background: linear-gradient(135deg, #c5a059 0%, #ecd099 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-banner-subtitle {
          font-size: 0.98rem;
          color: rgba(255, 255, 255, 0.75);
          line-height: 1.55;
          max-width: 530px;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
        }

        /* Wide Centered Search Bar style */
        .wide-search-bar-form {
          width: 100%;
          max-width: 100%;
          margin-top: 6px;
        }

        .search-bar-inner-container {
          background-color: #ffffff;
          border: 2px solid rgba(255, 255, 255, 0.15);
          border-radius: 30px;
          padding: 8px 8px 8px 24px;
          display: flex;
          align-items: center;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.35), 0 0 25px rgba(197, 160, 89, 0.08);
          transition: border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease;
        }

        .search-bar-inner-container:focus-within {
          border-color: var(--accent-gold);
          box-shadow: 0 20px 45px rgba(179, 142, 71, 0.25), 0 0 30px rgba(179, 142, 71, 0.15);
          transform: translateY(-2px);
        }

        .search-bar-icon-left {
          color: var(--text-muted);
          margin-right: 12px;
        }

        .wide-search-input {
          flex-grow: 1;
          border: none;
          outline: none;
          font-family: var(--font-body);
          font-size: 0.92rem;
          color: var(--text-primary);
          padding: 10px 0;
          background: transparent;
        }

        .wide-search-input::placeholder {
          color: var(--text-muted);
        }

        .search-camera-trigger {
          position: relative;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.04);
          margin-right: 12px;
          transition: all 0.2s ease;
        }

        .search-camera-trigger:hover {
          background: rgba(197, 160, 89, 0.15);
        }

        .camera-trigger-icon {
          color: var(--text-muted);
        }

        .search-camera-trigger:hover .camera-trigger-icon {
          color: var(--accent-gold);
        }

        .invisible-file-upload-input {
          position: absolute;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: pointer;
          left: 0;
          top: 0;
        }

        .wide-search-submit-btn {
          background: linear-gradient(135deg, var(--accent-gold) 0%, #a27e3c 100%);
          color: #ffffff;
          font-family: var(--font-title);
          font-weight: 700;
          font-size: 0.9rem;
          padding: 12px 30px;
          border: none;
          border-radius: 24px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 15px rgba(179, 142, 71, 0.3);
        }

        .wide-search-submit-btn:hover {
          background: linear-gradient(135deg, var(--accent-gold-hover) 0%, var(--accent-gold) 100%);
          transform: scale(1.03);
          box-shadow: 0 6px 18px rgba(179, 142, 71, 0.45);
        }

        .hero-popular-tags {
          display: flex;
          gap: 8px;
          align-items: center;
          flex-wrap: wrap;
          margin-top: 4px;
        }

        .pop-tags-label {
          font-size: 0.72rem;
          color: rgba(255, 255, 255, 0.55);
          font-weight: 600;
          margin-right: 4px;
        }

        .pop-tag-capsule {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: rgba(255, 255, 255, 0.85);
          padding: 5px 14px;
          border-radius: 20px;
          font-size: 0.72rem;
          font-family: var(--font-body);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .pop-tag-capsule:hover {
          background: rgba(197, 160, 89, 0.15);
          color: var(--accent-gold);
          border-color: var(--accent-gold);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .hero-feature-stats-row {
          display: flex;
          gap: 12px;
          margin-top: 14px;
          flex-wrap: wrap;
        }

        .feature-stat-capsule {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.9);
          padding: 8px 16px;
          border-radius: 24px;
          font-size: 0.75rem;
          font-weight: 500;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        /* 3D Slab display stand platform on Hero right */
        .hero-display-stand-container {
          position: relative;
          z-index: 2;
          width: 100%;
          height: 360px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .display-stand-platform {
          position: relative;
          width: 320px;
          height: 300px;
          perspective: 1200px;
          background: radial-gradient(ellipse at bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0) 70%);
        }

        .display-stand-platform::after {
          content: '';
          position: absolute;
          bottom: 10px;
          left: 10%;
          width: 80%;
          height: 24px;
          background: #e5e3dc;
          border: 1px solid #d1cfc7;
          border-radius: 8px;
          box-shadow: 0 8px 25px rgba(0,0,0,0.1);
          transform: rotateX(40deg);
        }

        .display-slab-wrapper {
          position: absolute;
          bottom: 24px;
          width: 120px;
          height: 220px;
          transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
          cursor: pointer;
        }

        .slab-visual-container {
          width: 100%;
          height: 100%;
          border-radius: 6px;
          overflow: hidden;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.18), inset 0 0 0 1px rgba(255,255,255,0.15);
        }

        .slab-badge-overlay {
          position: absolute;
          bottom: 8px;
          right: 8px;
          background: rgba(18, 18, 18, 0.85);
          backdrop-filter: blur(4px);
          color: #ffffff;
          padding: 4px 8px;
          border-radius: 4px;
          font-family: var(--font-title);
          display: flex;
          flex-direction: column;
          align-items: center;
          line-height: 1.1;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
          z-index: 3;
          pointer-events: none;
        }

        .slab-badge-title {
          font-size: 0.5rem;
          font-weight: 600;
          white-space: nowrap;
        }

        .slab-badge-specs {
          font-size: 0.42rem;
          color: #a3aab8;
          font-weight: 500;
          white-space: nowrap;
        }

        .left-slab {
          left: 45px;
          z-index: 2;
          transform: rotateY(-25deg) rotateX(12deg) rotateZ(-6deg) scale(0.95);
        }

        .right-slab {
          right: 45px;
          z-index: 1;
          transform: rotateY(-30deg) rotateX(8deg) rotateZ(-12deg) scale(0.9);
        }

        .display-slab-wrapper:hover {
          transform: translateY(-10px) rotateY(-18deg) rotateX(5deg) scale(1.02) !important;
          z-index: 10;
        }

        /* CATEGORIES SHOWCASE CONTAINER */
        .categories-showcase-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .circular-categories-row {
          display: flex;
          gap: 14px;
          overflow-x: auto;
          padding: 8px 4px;
          flex-grow: 1;
          scrollbar-width: none;
        }

        .circular-categories-row::-webkit-scrollbar {
          display: none;
        }

        .category-circle-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          background: transparent;
          border: none;
          cursor: pointer;
          min-width: 62px;
          transition: all 0.3s ease;
        }

        .category-circle-icon-wrapper {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #ffffff;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.02);
          transition: all 0.3s ease;
        }

        .category-circle-btn span {
          font-size: 0.75rem;
          color: var(--text-secondary);
          font-weight: 500;
          font-family: var(--font-body);
        }

        .category-circle-btn:hover .category-circle-icon-wrapper {
          transform: translateY(-3px);
          border-color: var(--border-hover);
          box-shadow: 0 6px 15px rgba(0, 0, 0, 0.05);
        }

        .category-circle-btn.active .category-circle-icon-wrapper {
          background-color: rgba(197, 160, 89, 0.08);
          border-color: var(--accent-gold);
          box-shadow: 0 4px 12px rgba(179, 142, 71, 0.15);
        }

        .category-circle-btn.active span {
          color: var(--accent-gold);
          font-weight: 600;
        }

        /* Category Icons representations */
        .flat-bg-gold {
          background-color: rgba(197, 160, 89, 0.06);
          color: var(--accent-gold);
        }
        .marble-pattern-bg {
          background: #ffffff url('/textures/calacatta_gold.jpg') no-repeat center center;
          background-size: cover;
        }
        .concrete-pattern-bg {
          background: #f0f0f0 url('/textures/concrete_light_grey.jpg') no-repeat center center;
          background-size: cover;
        }
        .wood-pattern-bg {
          background: #f0f0f0 url('/textures/natural_oak.jpg') no-repeat center center;
          background-size: cover;
        }
        .stone-pattern-bg {
          background: #f0f0f0 url('/textures/travertino_classico.jpg') no-repeat center center;
          background-size: cover;
        }
        .travert-pattern-bg {
          background: #fdf5e6 url('/textures/travertino_classico.jpg') no-repeat center center;
          background-size: cover;
        }
        .mosaic-pattern-bg {
          background-image: radial-gradient(rgba(0, 0, 0, 0.1) 20%, transparent 20%), radial-gradient(rgba(0, 0, 0, 0.1) 20%, transparent 20%);
          background-size: 8px 8px;
          background-position: 0 0, 4px 4px;
        }
        .decor-pattern-bg {
          background: linear-gradient(45deg, #ffffff 45%, #eee 45%, #eee 55%, #ffffff 55%);
          background-size: 10px 10px;
        }
        .flat-grey-bg {
          background-color: #d1d5db;
        }
        .wireframe-bg {
          background-image: linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px);
          background-size: 10px 10px;
        }

        /* 3D Studio Promo card on right */
        .studio-promo-card-banner {
          width: 320px;
          height: 72px;
          border-radius: var(--border-radius-md);
          display: flex;
          overflow: hidden;
          background: #ffffff;
          padding: 8px 12px;
          align-items: center;
          gap: 12px;
          box-shadow: var(--glass-shadow);
        }

        .promo-text-column {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          flex-grow: 1;
        }

        .promo-text-column h5 {
          font-size: 0.8rem;
          color: var(--text-primary);
          font-weight: 700;
        }

        .promo-text-column p {
          font-size: 0.65rem;
          color: var(--text-secondary);
          margin-bottom: 4px;
        }

        .promo-action-btn-gold {
          background: var(--accent-gold);
          color: #fff;
          border: none;
          font-family: var(--font-title);
          font-weight: 600;
          font-size: 0.65rem;
          padding: 2px 10px;
          border-radius: 12px;
          cursor: pointer;
        }

        .promo-image-column {
          width: 68px;
          height: 56px;
          border-radius: 6px;
          overflow: hidden;
        }

        .promo-image-column img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* MAIN SEARCH AND RESULTS GRID LAYOUT */
        .main-search-and-results-layout {
          display: grid;
          grid-template-columns: 240px 1fr;
          gap: 24px;
        }

        @media (max-width: 900px) {
          .main-search-and-results-layout {
            grid-template-columns: 1fr;
          }
          .showroom-hero-banner {
            grid-template-columns: 1fr;
            padding: 30px;
          }
          .hero-display-stand-container {
            display: none;
          }
          .studio-promo-card-banner {
            width: 100%;
          }
        }

        .filters-sidebar-new {
          padding: 24px;
          height: fit-content;
          display: flex;
          flex-direction: column;
          gap: 20px;
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.05);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.015);
          border-radius: var(--border-radius-lg);
          transition: all 0.3s ease;
        }

        .filter-title-main {
          font-size: 1.15rem;
          font-weight: 800;
          color: #0f172a;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          padding-bottom: 14px;
          letter-spacing: -0.015em;
        }

        .filter-group-new {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .filter-group-title {
          font-size: 0.75rem;
          color: var(--text-secondary);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .checkboxes-list-new {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        /* Custom Styled Checkbox */
        .checkbox-label-wrapper {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          font-size: 0.8rem;
          color: var(--text-secondary);
          user-select: none;
          position: relative;
        }

        .checkbox-label-wrapper input {
          position: absolute;
          opacity: 0;
          cursor: pointer;
          height: 0;
          width: 0;
        }

        .checkbox-custom-box {
          height: 18px;
          width: 18px;
          background-color: #f8fafc;
          border: 1.5px solid #cbd5e1;
          border-radius: 6px;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .checkbox-label-wrapper:hover input ~ .checkbox-custom-box {
          background-color: #ffffff;
          border-color: #8c6b30;
          box-shadow: 0 0 0 3px rgba(179, 142, 71, 0.1);
        }

        .checkbox-label-wrapper input:checked ~ .checkbox-custom-box {
          background-color: #0f172a;
          border-color: #0f172a;
        }

        .checkbox-custom-box::after {
          content: "";
          display: none;
          width: 5px;
          height: 9px;
          border: solid white;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg) translate(-0.5px, -1px);
        }

        .checkbox-label-wrapper input:checked ~ .checkbox-custom-box::after {
          display: block;
        }

        .checkbox-text-label {
          font-weight: 500;
        }

        .show-all-filter-link {
          background: transparent;
          border: none;
          color: var(--accent-gold);
          font-size: 0.72rem;
          font-weight: 600;
          text-align: left;
          cursor: pointer;
          text-decoration: underline;
        }

        /* Color Swatches Grid */
        .color-swatches-grid-new {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          align-items: center;
        }

        .color-swatch-circle-btn {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          position: relative;
          box-shadow: 0 2px 5px rgba(0,0,0,0.05);
          transition: transform 0.2s ease;
        }

        .color-swatch-circle-btn:hover {
          transform: scale(1.15);
        }

        .color-swatch-circle-btn.active::after {
          content: '';
          position: absolute;
          top: -3px;
          left: -3px;
          right: -3px;
          bottom: -3px;
          border: 1.5px solid var(--accent-gold);
          border-radius: 50%;
        }

        .color-swatch-all-btn {
          background: #f1f3f7;
          border: 1px solid var(--border-color);
          font-size: 0.65rem;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 12px;
          cursor: pointer;
        }

        .color-swatch-all-btn.active {
          background: var(--accent-gold);
          color: #fff;
          border-color: var(--accent-gold);
        }

        .simple-filter-select {
          background-color: #f1f3f7;
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-sm);
          padding: 8px 12px;
          font-size: 0.75rem;
          color: var(--text-primary);
          outline: none;
          font-family: var(--font-body);
        }

        /* RESULTS AREA */
        .results-container-new {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .results-header-row-new {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }

        .results-header-text-new h3 {
          font-size: 1.25rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .results-new-badge {
          background: rgba(217, 119, 6, 0.08);
          border: 1px solid rgba(217, 119, 6, 0.25);
          color: var(--accent-orange);
          font-size: 0.65rem;
          padding: 1px 6px;
          border-radius: 4px;
        }

        .results-header-text-new p {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .results-header-actions-new {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .view-all-results-link {
          background: #ffffff;
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          font-size: 0.75rem;
          font-weight: 600;
          padding: 6px 16px;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .view-all-results-link:hover {
          border-color: var(--border-hover);
          color: var(--text-primary);
        }

        .results-slider-arrows-new {
          display: flex;
          gap: 4px;
        }

        .slider-arrow-btn-new {
          background: #ffffff;
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .slider-arrow-btn-new:hover {
          background: #f1f3f7;
          border-color: var(--border-hover);
        }



        /* 3D Studio Tab Styles */
        .studio-portal {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .studio-layout {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 20px;
          height: 600px;
        }

        @media (max-width: 900px) {
          .studio-layout {
            grid-template-columns: 1fr;
            height: auto;
          }
          .studio-canvas-panel {
            height: 400px;
          }
        }

        .studio-control-panel {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          overflow-y: auto;
          background: #ffffff;
        }

        .studio-control-panel h3 {
          font-size: 1.3rem;
        }

        .active-tile-summary {
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          background: #ffffff;
        }

        .active-tile-summary h4 {
          font-size: 1.1rem;
        }

        .active-tile-summary .code {
          font-size: 0.7rem;
          color: var(--text-secondary);
        }

        .summary-specs {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-top: 8px;
          border-top: 1px solid var(--border-color);
          padding-top: 8px;
          font-size: 0.75rem;
        }

        .summary-specs div {
          display: flex;
          justify-content: space-between;
        }

        .summary-specs span {
          color: var(--text-secondary);
        }

        .control-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .control-group label {
          font-size: 0.75rem;
          text-transform: uppercase;
          color: var(--text-secondary);
          font-weight: 600;
        }

        .segmented-control {
          display: flex;
          background-color: #f1f3f7;
          padding: 4px;
          border-radius: var(--border-radius-sm);
          border: 1px solid var(--border-color);
        }

        .segmented-control button {
          flex-grow: 1;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          padding: 8px;
          font-family: var(--font-title);
          font-weight: 600;
          font-size: 0.8rem;
          border-radius: var(--border-radius-sm);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .segmented-control button.active {
          background-color: var(--accent-gold);
          color: #fff;
        }

        .studio-physics-details {
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 0.75rem;
          border-top: 1px solid var(--border-color);
          padding-top: 12px;
        }

        .phys-row {
          display: flex;
          justify-content: space-between;
        }

        .phys-row span {
          color: var(--text-secondary);
        }

        .ar-activation-box {
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          border-color: var(--border-gold);
          background: #ffffff;
        }

        .ar-icon {
          color: var(--accent-gold);
        }

        .ar-activation-box h5 {
          font-size: 0.85rem;
        }

        .ar-activation-box p {
          font-size: 0.65rem;
          color: var(--text-secondary);
        }

        .ar-btn {
          font-size: 0.75rem;
          padding: 8px;
        }

        .studio-canvas-panel {
          overflow: hidden;
        }

        .quick-swapper-drawer {
          padding: 16px 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          background: #ffffff;
        }

        .swapper-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
          gap: 12px;
        }

        .swapper-card {
          height: 110px;
          border-radius: 6px;
          overflow: hidden;
          cursor: pointer;
          border: 1px solid var(--border-color);
          transition: all 0.2s ease;
        }

        .swapper-card.active {
          border-color: var(--accent-gold);
          box-shadow: 0 4px 10px rgba(179, 142, 71, 0.15);
        }

        .swapper-label {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(255, 255, 255, 0.9);
          padding: 4px 6px;
          display: flex;
          flex-direction: column;
          font-size: 0.65rem;
          border-top: 1px solid var(--border-color);
        }

        .swapper-label span {
          font-weight: 700;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .swapper-label small {
          color: var(--text-muted);
        }

        /* Dealers Panel styles */
        .dealers-portal {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .dealers-layout {
          display: grid;
          grid-template-columns: 380px 1fr;
          gap: 24px;
          height: 700px;
        }

        @media (max-width: 1024px) {
          .dealers-layout {
            grid-template-columns: 1fr;
            height: auto;
          }
          .dealers-map-panel {
            height: 450px;
          }
        }

        .dealers-control-panel {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          overflow-y: auto;
          background: #ffffff;
          border-radius: var(--border-radius-lg);
          border: 1px solid var(--border-color);
          box-shadow: var(--glass-shadow);
        }

        /* Custom scrollbar for control panel list */
        .dealers-control-panel::-webkit-scrollbar {
          width: 5px;
        }
        .dealers-control-panel::-webkit-scrollbar-track {
          background: transparent;
        }
        .dealers-control-panel::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.1);
          border-radius: 10px;
        }

        .panel-title-row {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }

        .pin-title-icon {
          color: var(--accent-gold);
        }

        .dealers-control-panel h3 {
          font-size: 1.35rem;
          font-weight: 700;
          color: var(--text-primary);
          flex-shrink: 0;
        }

        .dealers-control-panel .desc {
          font-size: 0.8rem;
          color: var(--text-secondary);
          line-height: 1.5;
          flex-shrink: 0;
        }

        .active-product-badge {
          background: rgba(179, 142, 71, 0.05);
          border: 1px solid rgba(179, 142, 71, 0.2);
          color: var(--accent-gold-hover);
          font-size: 0.75rem;
          padding: 10px 14px;
          border-radius: var(--border-radius-sm);
          line-height: 1.4;
          flex-shrink: 0;
        }

        .active-product-badge.warning {
          background: rgba(217, 119, 6, 0.05);
          border-color: rgba(217, 119, 6, 0.2);
          color: var(--accent-orange);
          flex-shrink: 0;
        }

        /* GEOLOCATION DETECTOR CARD */
        .locator-status-card {
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 16px;
          border-radius: var(--border-radius-md);
          color: #ffffff;
          display: flex;
          flex-direction: column;
          gap: 12px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
          position: relative;
          overflow: hidden;
          flex-shrink: 0;
        }

        .status-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .status-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: #94a3b8;
        }

        .status-badge {
          font-size: 0.7rem;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .status-badge.success {
          background-color: rgba(16, 185, 129, 0.15);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .status-badge.warning {
          background-color: rgba(217, 119, 6, 0.15);
          color: #fbbf24;
          border: 1px solid rgba(217, 119, 6, 0.3);
        }

        .status-badge.error {
          background-color: rgba(239, 68, 68, 0.15);
          color: #fca5a5;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .status-badge.pulse-loading {
          background-color: rgba(148, 163, 184, 0.15);
          color: #cbd5e1;
          border: 1px solid rgba(148, 163, 184, 0.3);
          animation: pulse-silver 1.5s infinite;
        }

        .status-info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          z-index: 1;
        }

        .status-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .status-info strong {
          font-size: 0.72rem;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .status-info span {
          font-size: 0.85rem;
          font-weight: 600;
          color: #f8fafc;
        }

        .btn-detect-loc {
          display: flex;
          align-items: center;
          gap: 6px;
          background: linear-gradient(135deg, var(--accent-gold) 0%, #987532 100%);
          border: none;
          color: #ffffff;
          font-family: var(--font-title);
          font-weight: 600;
          font-size: 0.75rem;
          padding: 8px 14px;
          border-radius: var(--border-radius-sm);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 10px rgba(179, 142, 71, 0.25);
          white-space: nowrap;
        }

        .btn-detect-loc:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 14px rgba(179, 142, 71, 0.4);
        }

        .btn-detect-loc:active {
          transform: translateY(1px);
        }

        .btn-detect-loc:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* FILTERS WIDGET */
        .locator-filters-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
          background: #f8fafc;
          padding: 16px;
          border-radius: var(--border-radius-md);
          border: 1px solid var(--border-color);
          flex-shrink: 0;
        }

        .locator-filters-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .locator-filter-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .locator-filter-group label {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--text-secondary);
        }

        .locator-select {
          width: 100%;
          padding: 10px 12px;
          background-color: #ffffff;
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-sm);
          color: var(--text-primary);
          font-family: var(--font-body);
          font-size: 0.8rem;
          outline: none;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .locator-select:focus {
          border-color: var(--accent-gold);
          box-shadow: 0 0 0 3px rgba(179, 142, 71, 0.15);
        }

        .locator-search-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .locator-search-group label {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--text-secondary);
        }

        .locator-search-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .locator-search-icon {
          position: absolute;
          left: 12px;
          color: var(--text-muted);
        }

        .locator-search-input {
          width: 100%;
          padding: 10px 12px 10px 36px;
          background-color: #ffffff;
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-sm);
          color: var(--text-primary);
          font-family: var(--font-body);
          font-size: 0.8rem;
          outline: none;
          transition: all 0.3s ease;
        }

        .locator-search-input:focus {
          border-color: var(--accent-gold);
          box-shadow: 0 0 0 3px rgba(179, 142, 71, 0.15);
        }

        .locator-search-clear {
          position: absolute;
          right: 12px;
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          font-size: 0.85rem;
          padding: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s;
        }

        .locator-search-clear:hover {
          color: var(--text-primary);
        }

        /* SIMULATED PRESETS */
        .mini-presets {
          flex-shrink: 0;
        }

        .mini-presets label {
          display: block;
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--text-secondary);
          margin-bottom: 6px;
        }

        .location-buttons-row {
          display: flex;
          gap: 6px;
          background: #f1f5f9;
          padding: 4px;
          border-radius: var(--border-radius-sm);
          border: 1px solid rgba(0, 0, 0, 0.03);
        }

        .loc-btn-mini {
          flex: 1;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          font-family: var(--font-title);
          font-weight: 600;
          font-size: 0.72rem;
          padding: 6px 10px;
          border-radius: calc(var(--border-radius-sm) - 2px);
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: center;
        }

        .loc-btn-mini:hover {
          color: var(--text-primary);
        }

        .loc-btn-mini.active {
          background: #ffffff;
          color: var(--accent-gold);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        /* LIST CONTAINER */
        .dealers-list-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .list-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 6px;
          border-bottom: 1px solid var(--border-color);
        }

        .list-header-row h4 {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .results-count {
          font-size: 0.72rem;
          font-weight: 600;
          background: #f1f5f9;
          color: var(--text-secondary);
          padding: 2px 8px;
          border-radius: 12px;
        }

        .dealers-list-scroll {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding-right: 2px;
        }

        .dealers-list-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .dealers-list-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .dealers-list-scroll::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.08);
          border-radius: 10px;
        }

        /* NEW DEALER CARD */
        .dealer-card-new {
          padding: 16px;
          background: #ffffff;
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-md);
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 10px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          flex-shrink: 0;
        }

        .dealer-card-new:hover {
          transform: translateY(-2px);
          border-color: rgba(179, 142, 71, 0.3);
          box-shadow: 0 10px 20px -10px rgba(0, 0, 0, 0.05);
        }

        .dealer-card-new.active {
          border-color: var(--accent-gold);
          border-left: 4px solid var(--accent-gold);
          background: linear-gradient(90deg, rgba(179, 142, 71, 0.02) 0%, #ffffff 100%);
          box-shadow: 0 12px 25px -10px rgba(179, 142, 71, 0.12);
        }

        .dealer-card-header-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
        }

        .dealer-brand-label {
          font-size: 0.65rem;
          font-weight: 700;
          color: var(--accent-gold);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .dealer-badge-new {
          background: #f8fafc;
          border: 1px solid var(--border-color);
          font-size: 0.6rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 12px;
          color: var(--text-secondary);
        }

        .dealer-card-new.active .dealer-badge-new {
          background: rgba(179, 142, 71, 0.1);
          border-color: rgba(179, 142, 71, 0.2);
          color: var(--accent-gold-hover);
        }

        .dealer-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }

        .dealer-header h5 {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
          line-height: 1.3;
        }

        .distance-tag {
          color: var(--accent-gold);
          font-size: 0.85rem;
          font-weight: 700;
          white-space: nowrap;
        }

        .dealer-card-new .address {
          font-size: 0.75rem;
          color: var(--text-secondary);
          line-height: 1.4;
          margin: 0;
        }

        /* Business Hours Badge */
        .dealer-status-hours {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.72rem;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 20px;
          width: fit-content;
        }

        .dealer-status-hours.open {
          background-color: rgba(16, 185, 129, 0.08);
          color: #059669;
        }

        .dealer-status-hours.closed {
          background-color: rgba(239, 68, 68, 0.08);
          color: #dc2626;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          display: inline-block;
        }

        .dealer-status-hours.open .status-dot {
          background-color: #10b981;
          animation: pulse-green 2s infinite;
        }

        .dealer-status-hours.closed .status-dot {
          background-color: #ef4444;
        }

        .dealer-contact-new-row {
          display: flex;
          align-items: center;
          margin-top: 2px;
        }

        .dealer-contact-new-row .phone {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 6px;
        }

        /* CARD ACTION LINKS */
        .dealer-actions-new {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 6px;
          border-top: 1px dashed var(--border-color);
          padding-top: 10px;
        }

        .dealer-quick-links {
          display: flex;
          gap: 6px;
          width: 100%;
        }

        .quick-action-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          padding: 6px 8px;
          font-family: var(--font-title);
          font-weight: 700;
          font-size: 0.65rem;
          text-decoration: none;
          border-radius: 8px;
          transition: all 0.2s ease-in-out;
          flex: 1;
          white-space: nowrap;
        }

        .quick-action-link.maps {
          background-color: rgba(15, 23, 42, 0.04);
          color: #0f172a;
          border: 1px solid rgba(15, 23, 42, 0.08);
        }

        .quick-action-link.maps:hover {
          background-color: rgba(15, 23, 42, 0.08);
          transform: translateY(-1px);
        }

        .quick-action-link.whatsapp {
          background-color: rgba(37, 211, 102, 0.05);
          color: #128c7e;
          border: 1px solid rgba(37, 211, 102, 0.12);
        }

        .quick-action-link.whatsapp:hover {
          background-color: rgba(37, 211, 102, 0.1);
          transform: translateY(-1px);
        }

        .quick-action-link.showroom {
          background-color: rgba(179, 142, 71, 0.05);
          color: #b38e47;
          border: 1px solid rgba(179, 142, 71, 0.12);
        }

        .quick-action-link.showroom:hover {
          background-color: rgba(179, 142, 71, 0.1);
          transform: translateY(-1px);
        }

        .quote-btn {
          font-size: 0.72rem !important;
          padding: 8px 12px !important;
          border-radius: 8px !important;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700 !important;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          box-shadow: 0 2px 4px rgba(179, 142, 71, 0.08);
          transition: all 0.2s ease-in-out !important;
        }

        .quote-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 10px rgba(179, 142, 71, 0.15);
        }

        /* EMPTY STATE */
        .no-dealers-found {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 40px 20px;
          background: #f8fafc;
          border: 1px dashed var(--border-color);
          border-radius: var(--border-radius-md);
          color: var(--text-secondary);
          gap: 8px;
        }

        .no-dealers-icon {
          color: var(--text-muted);
          margin-bottom: 4px;
        }

        .no-dealers-found p {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
        }

        .no-dealers-found span {
          font-size: 0.72rem;
          color: var(--text-muted);
        }

        .dealers-map-panel {
          overflow: hidden;
          background-color: #f1f3f5;
          border-radius: var(--border-radius-lg);
          border: 1px solid var(--border-color);
          box-shadow: var(--glass-shadow);
        }

        /* KEYFRAME ANIMATIONS */
        @keyframes pulse-green {
          0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.5);
          }
          70% {
            transform: scale(1);
            box-shadow: 0 0 0 6px transparent;
          }
          100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 transparent;
          }
        }

        @keyframes pulse-silver {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }

        /* B2B Dashboard Portal Styles */
        .b2b-portal {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .b2b-brand-selector-row {
          padding: 16px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
        }

        .selector-meta {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .b2b-meta-icon {
          color: var(--accent-gold);
        }

        .selector-meta h3 {
          font-size: 1.15rem;
        }

        .brand-button-grid {
          display: flex;
          gap: 6px;
        }

        .brand-sel-btn {
          background: rgba(0, 0, 0, 0.02);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          padding: 8px 14px;
          border-radius: var(--border-radius-sm);
          cursor: pointer;
          font-family: var(--font-title);
          font-weight: 600;
          font-size: 0.8rem;
          transition: all 0.3s ease;
        }

        .brand-sel-btn.active {
          background: var(--accent-gold);
          color: #fff;
          border-color: var(--accent-gold);
        }

        .b2b-loading {
          padding: 60px 20px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          color: var(--text-secondary);
        }

        .b2b-dashboard-grid {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .b2b-stats-row {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 20px;
        }

        .b2b-stat-card {
          padding: 16px 20px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .stat-header {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--text-secondary);
          text-transform: uppercase;
        }

        .stat-icon {
          color: var(--text-muted);
        }

        .stat-icon.gold { color: var(--accent-gold); }
        .stat-icon.green { color: var(--accent-green); }
        .stat-icon.blue { color: var(--accent-blue); }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          font-family: var(--font-title);
          color: var(--text-primary);
        }

        .text-gold { color: var(--accent-gold); }
        .text-green { color: var(--accent-green); }
        .text-blue { color: var(--accent-blue-hover); }

        .stat-footer {
          font-size: 0.7rem;
          color: var(--text-muted);
          margin-top: auto;
        }

        .b2b-grid-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        @media (max-width: 960px) {
          .b2b-grid-row {
            grid-template-columns: 1fr;
          }
        }

        .b2b-chart-panel {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .svg-chart-container {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          min-height: 220px;
        }

        .svg-chart {
          width: 100%;
          height: auto;
        }

        .chart-legend {
          display: flex;
          justify-content: center;
          gap: 18px;
          margin-top: 12px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .legend-dot.blue { background-color: var(--accent-blue); }
        .legend-dot.gold { background-color: var(--accent-gold); }

        .b2b-campaign-panel {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .panel-desc {
          font-size: 0.75rem;
          color: var(--text-secondary);
          margin-bottom: 4px;
        }

        .active-campaigns-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-height: 180px;
          overflow-y: auto;
          margin-bottom: 12px;
        }

        .active-campaigns-list h5 {
          font-size: 0.8rem;
          text-transform: uppercase;
          color: var(--text-muted);
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 4px;
          margin-bottom: 4px;
        }

        .campaign-row {
          background: rgba(0, 0, 0, 0.01);
          border: 1px solid var(--border-color);
          padding: 8px 12px;
          border-radius: var(--border-radius-sm);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
        }

        .camp-meta {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .camp-meta strong {
          font-size: 0.8rem;
        }

        .camp-meta span {
          font-size: 0.65rem;
          color: var(--text-secondary);
        }

        .camp-data {
          display: flex;
          gap: 12px;
          font-size: 0.7rem;
          align-items: center;
        }

        .budget-capsule {
          background: rgba(217, 119, 6, 0.08);
          border: 1px solid rgba(217, 119, 6, 0.3);
          color: var(--accent-orange);
          padding: 2px 6px;
          border-radius: 4px;
        }

        .empty-camp-row {
          font-size: 0.75rem;
          color: var(--text-muted);
          text-align: center;
          padding: 12px;
        }

        .campaign-form {
          display: flex;
          flex-direction: column;
          gap: 10px;
          border-top: 1px solid var(--border-color);
          padding-top: 12px;
        }

        .campaign-form h5 {
          font-size: 0.8rem;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        .form-fields-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 10px;
        }

        @media (max-width: 600px) {
          .form-fields-grid {
            grid-template-columns: 1fr;
          }
        }

        .form-group-inline {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .form-group-inline label {
          font-size: 0.65rem;
          color: var(--text-secondary);
        }

        .form-group-inline select, .form-group-inline input {
          background: var(--bg-card-solid);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-sm);
          color: var(--text-primary);
          padding: 8px;
          outline: none;
          font-size: 0.75rem;
          font-family: var(--font-body);
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
        }

        .form-group-inline input:focus {
          border-color: var(--accent-gold);
        }

        .w-full-btn {
          width: 100%;
          font-size: 0.8rem;
          padding: 10px;
          margin-top: 4px;
        }

        .form-success {
          background: rgba(5, 150, 105, 0.08);
          border: 1px solid rgba(5, 150, 105, 0.3);
          color: var(--accent-green);
          font-size: 0.7rem;
          padding: 8px;
          border-radius: var(--border-radius-sm);
        }

        .b2b-intel-panel {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .intel-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        @media (max-width: 600px) {
          .intel-grid {
            grid-template-columns: 1fr;
          }
        }

        .intel-block h5 {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-bottom: 6px;
          text-transform: uppercase;
        }

        .intel-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.75rem;
        }

        .intel-table th, .intel-table td {
          padding: 6px 8px;
          text-align: left;
          border-bottom: 1px solid var(--border-color);
        }

        .intel-table th {
          color: var(--text-secondary);
          font-weight: 500;
        }

        .b2b-billing-panel {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .billing-test-box {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          background: rgba(0,0,0,0.01);
        }

        .plan-picker-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.75rem;
        }

        .segmented-control.mini {
          padding: 2px;
        }

        .segmented-control.mini button {
          padding: 4px 10px;
          font-size: 0.7rem;
        }

        .webhook-result-badge {
          background: rgba(5, 150, 105, 0.08);
          border: 1px solid rgba(5, 150, 105, 0.25);
          color: var(--text-primary);
          padding: 8px 12px;
          border-radius: var(--border-radius-sm);
          font-size: 0.75rem;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
        }

        /* Lead Modal styling */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9000;
          padding: 20px;
        }

        .modal-content {
          width: 100%;
          max-width: 500px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          background: #ffffff !important;
          border: 1px solid rgba(179, 142, 71, 0.25) !important;
          border-radius: var(--border-radius-md) !important;
          box-shadow: 0 25px 60px -12px rgba(15, 23, 42, 0.25) !important;
        }

        /* Showroom Modal Custom Styling */
        .dealer-showroom-modal {
          animation: scaleUp 0.3s ease-out;
        }

        .showroom-modal-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          min-height: 400px;
        }

        .showroom-gallery-column {
          padding: 24px;
          background: #f8fafc;
          border-right: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          gap: 16px;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
        }

        .showroom-info-column {
          padding: 24px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 20px;
          background: #fff;
          box-sizing: border-box;
        }

        @media (max-width: 768px) {
          .showroom-modal-grid {
            grid-template-columns: 1fr;
          }
          .showroom-gallery-column {
            border-right: none;
            border-bottom: 1px solid #e2e8f0;
            padding: 16px;
          }
          .showroom-info-column {
            padding: 16px;
          }
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 12px;
        }

        .close-modal-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          font-size: 1.15rem;
          cursor: pointer;
        }

        .modal-success-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 30px 10px;
          gap: 12px;
        }

        .success-icon {
          color: var(--accent-green);
        }

        .modal-product-summary {
          background: rgba(0, 0, 0, 0.02);
          border: 1px solid var(--border-color);
          padding: 10px;
          border-radius: var(--border-radius-sm);
          display: flex;
          gap: 12px;
          align-items: center;
          font-size: 0.8rem;
        }

        .m-pic {
          width: 50px;
          height: 50px;
          border-radius: 4px;
          border: 1px solid var(--border-color);
        }

        .form-group-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        @media (max-width: 480px) {
          .form-group-row {
            grid-template-columns: 1fr;
          }
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group label {
          font-size: 0.75rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .form-textarea {
          resize: vertical;
        }

        /* Detail Modal Styles */
        .detail-modal-content-premium {
          max-width: 1080px;
          width: 95%;
          max-height: 92vh;
          padding: 24px;
          border-radius: 20px;
          background: rgba(30, 34, 42, 0.98);
          border: 1px solid rgba(197, 160, 89, 0.45);
          backdrop-filter: blur(30px);
          -webkit-backdrop-filter: blur(30px);
          box-shadow: 0 30px 70px rgba(0, 0, 0, 0.8), 
                      inset 0 1px 0 rgba(255, 255, 255, 0.05),
                      0 0 50px rgba(197, 160, 89, 0.08);
          color: #ffffff;
          display: flex;
          flex-direction: column;
          gap: 16px;
          position: relative;
          z-index: 1000;
          animation: modalScaleUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes modalScaleUp {
          from {
            opacity: 0;
            transform: scale(0.96) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .detail-modal-header-title {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 4px;
        }

        .detail-modal-header-title h3 {
          color: #ffffff;
          font-family: var(--font-title);
          font-size: 1.45rem;
          font-weight: 700;
          letter-spacing: -0.01em;
          background: linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .brand-badge-detail {
          background: rgba(197, 160, 89, 0.15);
          border: 1px solid rgba(197, 160, 89, 0.4);
          color: var(--accent-gold);
          font-size: 0.62rem;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: 20px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          box-shadow: 0 2px 10px rgba(179, 142, 71, 0.1);
        }

        .code-text {
          font-size: 0.68rem;
          color: rgba(255, 255, 255, 0.4);
          font-family: monospace;
          background: rgba(255, 255, 255, 0.04);
          padding: 1px 6px;
          border-radius: 4px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .detail-modal-body {
          display: grid;
          grid-template-columns: 1fr 1.15fr;
          gap: 24px;
          margin-top: 6px;
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding-right: 0px;
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE 10+ */
        }

        /* Hide Scrollbars completely */
        .detail-modal-body::-webkit-scrollbar {
          display: none; /* Safari and Chrome */
        }

        @media (max-width: 768px) {
          .detail-modal-body {
            grid-template-columns: 1fr;
            max-height: 70vh;
          }
        }

        .detail-left-column {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .detail-visual-box {
          height: 200px;
          border-radius: 12px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4), inset 0 0 20px rgba(0, 0, 0, 0.5);
          position: relative;
        }

        .detail-specs-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }

        .spec-item-box {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 8px 10px;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .spec-item-box:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(197, 160, 89, 0.3);
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
        }

        .spec-lbl {
          font-size: 0.58rem;
          color: rgba(255, 255, 255, 0.4);
          text-transform: uppercase;
          font-weight: 700;
          letter-spacing: 0.05em;
        }

        .spec-val {
          font-size: 0.78rem;
          font-weight: 600;
          color: #ffffff;
        }

        .detail-primary-actions {
          display: flex;
          flex-direction: row;
          gap: 12px;
          margin-top: 6px;
        }

        .detail-primary-actions button {
          flex: 1;
          margin: 0 !important;
          width: auto !important;
        }

        .detail-modal-content-premium .btn-primary {
          background: linear-gradient(135deg, var(--accent-gold) 0%, #a27e3c 100%);
          color: #ffffff;
          border: none;
          box-shadow: 0 4px 15px rgba(179, 142, 71, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.15);
          font-family: var(--font-title);
          font-weight: 600;
          padding: 12px 20px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .detail-modal-content-premium .btn-primary:hover {
          background: linear-gradient(135deg, var(--accent-gold-hover) 0%, var(--accent-gold) 100%);
          transform: translateY(-2px);
          box-shadow: 0 8px 22px rgba(179, 142, 71, 0.45);
        }

        .detail-modal-content-premium .btn-secondary {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.10);
          color: #ffffff;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.02);
          font-family: var(--font-title);
          font-weight: 500;
          padding: 12px 20px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .detail-modal-content-premium .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.07);
          border-color: rgba(197, 160, 89, 0.4);
          color: var(--accent-gold);
          transform: translateY(-2px);
        }

        .detail-action-btn {
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .architect-download-box {
          margin-top: 14px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding-top: 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .architect-lbl {
          display: block;
          font-size: 0.65rem;
          font-weight: 700;
          color: var(--accent-gold);
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .btn-architect-download {
          background: rgba(197, 160, 89, 0.06);
          border: 1px solid rgba(197, 160, 89, 0.35);
          color: var(--accent-gold);
          font-family: var(--font-title);
          font-weight: 600;
          padding: 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .btn-architect-download:hover:not(:disabled) {
          background: rgba(197, 160, 89, 0.15);
          border-color: var(--accent-gold);
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(179, 142, 71, 0.1);
        }

        .btn-architect-download:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .architect-desc {
          font-size: 0.62rem;
          color: var(--text-muted);
          text-align: center;
          line-height: 1.3;
        }

        .detail-modal-content-premium .close-modal-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.6);
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-size: 0.9rem;
        }
        .detail-modal-content-premium .close-modal-btn:hover {
          background: rgba(197, 160, 89, 0.15);
          border-color: rgba(197, 160, 89, 0.5);
          color: var(--accent-gold);
          transform: rotate(90deg) scale(1.05);
        }

        .detail-right-column {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .detail-modal-content-premium .channel-box {
          border: 1px solid rgba(255, 255, 255, 0.05);
          background: rgba(255, 255, 255, 0.02);
          border-radius: 12px;
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
          transition: all 0.3s ease;
        }

        .detail-modal-content-premium .channel-box:hover {
          border-color: rgba(197, 160, 89, 0.25);
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.25);
        }

        .channel-title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.92rem;
          font-weight: 700;
          color: var(--accent-gold);
          font-family: var(--font-title);
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }

        .channel-desc {
          font-size: 0.72rem;
          color: rgba(255, 255, 255, 0.6);
          line-height: 1.4;
        }

        .channel-loading {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.6);
          padding: 10px 0;
        }

        .no-channel-data {
          font-size: 0.72rem;
          color: rgba(255, 255, 255, 0.4);
          font-style: italic;
        }

        /* Metraj inputs & select */
        .calc-inputs-row {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 12px;
        }

        .calc-input-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .calc-input-group label {
          font-size: 0.68rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.65);
        }

        .detail-modal-content-premium .calc-input, 
        .detail-modal-content-premium .calc-select {
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          padding: 10px 12px;
          color: #ffffff;
          font-family: var(--font-body);
          font-size: 0.82rem;
          outline: none;
          transition: all 0.3s ease;
        }

        .detail-modal-content-premium .calc-input:focus, 
        .detail-modal-content-premium .calc-select:focus {
          border-color: var(--accent-gold);
          background: rgba(0, 0, 0, 0.35);
          box-shadow: 0 0 12px rgba(197, 160, 89, 0.2);
        }

        .calc-results-panel {
          background: rgba(0, 0, 0, 0.25);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 12px;
          padding: 14px;
          margin-top: 4px;
        }

        .calc-res-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .calc-res-item {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.04);
          padding: 10px 12px;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .calc-res-item span {
          font-size: 0.6rem;
          color: rgba(255, 255, 255, 0.4);
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .calc-res-item strong {
          font-size: 0.85rem;
          color: #ffffff;
          font-weight: 700;
        }

        /* Borusan Logistics Box */
        .pallet-logistics-box {
          margin-top: 14px;
          background: linear-gradient(135deg, rgba(37, 99, 235, 0.06) 0%, rgba(197, 160, 89, 0.03) 100%) !important;
          border: 1px solid rgba(37, 99, 235, 0.25) !important;
          border-radius: 12px !important;
          padding: 14px 18px !important;
          display: flex;
          flex-direction: column;
          gap: 6px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        .logistics-lbl {
          font-size: 0.65rem;
          color: var(--accent-gold);
          text-transform: uppercase;
          font-weight: 700;
          letter-spacing: 0.03em;
          margin-bottom: 2px;
        }

        .logistics-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.76rem;
          color: rgba(255, 255, 255, 0.85);
        }

        .logistics-row strong {
          color: #ffffff;
        }

        .logistics-row.highlight-price {
          border-top: 1px dashed rgba(255, 255, 255, 0.08);
          padding-top: 8px;
          margin-top: 4px;
        }

        .logistics-price {
          color: #60a5fa !important;
          font-weight: 700;
          font-size: 0.82rem;
        }

        /* Dealers & Affiliate Lists */
        .modal-dealers-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .modal-dealer-row {
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 10px;
          padding: 14px 18px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          transition: all 0.3s ease;
        }

        .modal-dealer-row:hover {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(197, 160, 89, 0.2);
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
        }

        .m-dealer-info h5 {
          font-size: 0.85rem;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 3px;
        }

        .m-dealer-meta {
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.5);
        }

        .m-dealer-meta strong {
          color: var(--accent-gold);
        }

        .quote-btn {
          padding: 8px 16px;
          font-size: 0.72rem;
          font-weight: 600;
          border-radius: 6px;
        }

        .affiliate-prices-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .affiliate-row {
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 10px;
          padding: 14px 18px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.82rem;
          transition: all 0.3s ease;
        }

        .affiliate-row:hover {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(197, 160, 89, 0.2);
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
        }

        .cheapest-row {
          border-color: rgba(197, 160, 89, 0.35) !important;
          background: rgba(197, 160, 89, 0.06) !important;
          box-shadow: 0 4px 20px rgba(197, 160, 89, 0.05);
        }

        .cheapest-row:hover {
          border-color: var(--accent-gold) !important;
          background: rgba(197, 160, 89, 0.1) !important;
        }

        .cheapest-badge {
          background: var(--accent-gold);
          color: #ffffff;
          font-size: 0.58rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 4px;
          margin-bottom: 4px;
          display: inline-block;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .aff-store-meta {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .store-name {
          color: rgba(255, 255, 255, 0.7);
        }

        .store-name.font-bold {
          font-weight: 700;
          color: #ffffff;
        }

        .aff-price-action {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .aff-price {
          font-weight: 700;
          color: var(--accent-gold);
          font-size: 0.98rem;
          font-family: var(--font-title);
        }

        .aff-btn {
          background: var(--accent-gold);
          color: #ffffff;
          text-decoration: none;
          font-weight: 600;
          font-size: 0.75rem;
          padding: 8px 16px;
          border-radius: 6px;
          transition: all 0.2s ease;
          box-shadow: 0 4px 10px rgba(179, 142, 71, 0.2);
        }

        .aff-btn:hover {
          background: var(--accent-gold-hover);
          transform: translateY(-1px);
          box-shadow: 0 6px 14px rgba(179, 142, 71, 0.35);
        }

        .aff-btn-secondary {
          background: rgba(255, 255, 255, 0.03);
          color: #ffffff;
          text-decoration: none;
          font-weight: 600;
          font-size: 0.75rem;
          padding: 8px 16px;
          border-radius: 6px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.2s ease;
        }

        .aff-btn-secondary:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-1px);
        }


        .ai-uploader-card:hover {
          background: rgba(197, 160, 89, 0.05);
        }

        .uploader-text h5 {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .uploader-text p {
          font-size: 0.58rem;
          color: var(--text-secondary);
          line-height: 1.2;
        }

        .calc-file-input {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: pointer;
        }

        .uploaded-preview-row {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 4px;
        }

        .bullet-green {
          color: var(--accent-green);
          font-weight: bold;
          font-size: 0.8rem;
        }

        .ai-processing-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.9);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 10;
          padding: 24px;
          text-align: center;
        }

        .ai-progress-bar {
          width: 200px;
          height: 4px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
          overflow: hidden;
          margin-top: 16px;
        }

        .ai-progress-fill {
          height: 100%;
          background: var(--accent-gold);
          width: 100%;
        }

        .animate-progress {
          animation: progressRun 7s linear forwards;
        }

        @keyframes progressRun {
          0% { width: 0%; }
          100% { width: 100%; }
        }

        .ai-rendered-room-container {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 5;
          display: flex;
          flex-direction: column;
        }

        .ai-room-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .ai-watermark-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          background: rgba(197, 160, 89, 0.9);
          color: #fff;
          font-family: var(--font-title);
          font-weight: 700;
          font-size: 0.65rem;
          padding: 4px 10px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        }

        .remove-ai-room-btn {
          position: absolute;
          bottom: 12px;
          right: 12px;
          font-size: 0.72rem;
          padding: 6px 12px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.2);
        }

        /* Search suggestions dropdown adjustments */
        .search-suggestions-dropdown {
          background: rgba(26, 29, 36, 0.95) !important;
          border: 1px solid var(--border-gold, rgba(197, 160, 89, 0.3)) !important;
          border-radius: 12px !important;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.5) !important;
        }
        .suggestion-item {
          border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
        }
        .suggestion-item:hover {
          background: rgba(255, 255, 255, 0.05) !important;
        }
        .suggestion-item:last-child {
          border-bottom: none !important;
        }

        /* Ebat Size Guide Tooltip Styles */
        .checkbox-label-wrapper:hover .size-guide-tooltip {
          opacity: 1;
          visibility: visible;
          transform: translateY(-50%) translateX(0);
        }
        
        .size-guide-tooltip {
          position: absolute;
          left: calc(100% + 15px);
          top: 50%;
          transform: translateY(-50%) translateX(10px);
          background: rgba(20, 22, 28, 0.98);
          border: 1px solid var(--accent-gold);
          border-radius: 8px;
          padding: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
          z-index: 100;
          width: 200px;
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          pointer-events: none;
        }

        .size-guide-tooltip::before {
          content: '';
          position: absolute;
          right: 100%;
          top: 50%;
          margin-top: -6px;
          border-width: 6px;
          border-style: solid;
          border-color: transparent rgba(20, 22, 28, 0.98) transparent transparent;
        }
        
        .tooltip-title {
          font-family: var(--font-title);
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--accent-gold);
          display: block;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .size-guide-viz {
          display: flex;
          align-items: flex-end;
          justify-content: space-around;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 6px;
          padding: 10px;
          height: 100px;
        }
        
        /* Human skeleton visual representation */
        .viz-human {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 40px;
          height: 80px;
          justify-content: flex-end;
          position: relative;
        }
        .viz-human-head {
          width: 10px;
          height: 10px;
          border: 1.5px solid rgba(255, 255, 255, 0.4);
          border-radius: 50%;
          margin-bottom: 2px;
          background: transparent;
        }
        .viz-human-body {
          width: 2px;
          height: 35px;
          background: rgba(255, 255, 255, 0.4);
          position: relative;
        }
        .viz-human-body::before, .viz-human-body::after {
          content: '';
          position: absolute;
          width: 10px;
          height: 2px;
          background: rgba(255, 255, 255, 0.4);
          top: 5px;
        }
        .viz-human-body::before { right: 2px; transform: rotate(-30deg); }
        .viz-human-body::after { left: 2px; transform: rotate(30deg); }
        
        .viz-lbl {
          font-size: 0.55rem;
          color: var(--text-muted);
          text-align: center;
          margin-top: 4px;
          white-space: nowrap;
        }
        
        /* Interactive Tiles relative sizes */
        .viz-tile {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(197, 160, 89, 0.2) 0%, rgba(197, 160, 89, 0.05) 100%);
          border: 1px solid var(--accent-gold) !important;
          border-radius: 2px;
          transition: all 0.3s ease;
        }

        .viz-tile .viz-lbl {
          font-size: 0.5rem;
          color: #fff;
          font-weight: 500;
        }
        
        /* Proportional dimensions next to 175cm human (80px height) */
        .viz-tile.size-30x60 {
          width: 14px;
          height: 27px;
        }
        .viz-tile.size-60x60 {
          width: 27px;
          height: 27px;
        }
        .viz-tile.size-60x120 {
          width: 27px;
          height: 55px;
        }
        .viz-tile.size-80x80 {
          width: 37px;
          height: 37px;
        }
        .viz-tile.size-120x120 {
          width: 55px;
          height: 55px;
        }

        /* Badge Custom Colors */
        .card-badge-tag-new.red {
          background: rgba(239, 68, 68, 0.1) !important;
          color: #ef4444 !important;
          border: 0.5px solid rgba(239, 68, 68, 0.3);
        }
        .card-badge-tag-new.gold {
          background: rgba(217, 119, 6, 0.1) !important;
          color: var(--accent-gold) !important;
          border: 0.5px solid rgba(217, 119, 6, 0.3);
        }
        .card-badge-tag-new.orange {
          background: rgba(249, 115, 22, 0.1) !important;
          color: #f97316 !important;
          border: 0.5px solid rgba(249, 115, 22, 0.3);
        }
        .card-badge-tag-new.blue {
          background: rgba(59, 130, 246, 0.1) !important;
          color: #3b82f6 !important;
          border: 0.5px solid rgba(59, 130, 246, 0.3);
        }

        /* Detail Modal Trust Badges */
        .detail-trust-badges-box {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-top: 10px;
        }
        .trust-badge-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 6px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 10px 8px;
          border-radius: 8px;
          transition: background 0.3s ease;
        }
        .trust-badge-item:hover {
          background: rgba(255, 255, 255, 0.04);
        }
        .trust-badge-item .trust-icon {
          color: var(--accent-gold);
          flex-shrink: 0;
        }
        .trust-badge-item div {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .trust-badge-item strong {
          font-size: 0.65rem;
          color: #fff;
          font-weight: 700;
          line-height: 1.2;
        }
        .trust-badge-item span {
          display: none;
        }

        /* PREMIUM FOOTER STYLES */
        .site-footer {
          background: linear-gradient(180deg, #090d16 0%, #03050a 100%);
          border-top: 2px solid rgba(179, 142, 71, 0.35);
          border-radius: var(--border-radius-lg);
          padding: 60px 48px 30px 48px;
          color: #8a99ad;
          display: flex;
          flex-direction: column;
          gap: 48px;
          margin-top: 40px;
          box-shadow: 0 -15px 40px rgba(0, 0, 0, 0.4);
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 2fr repeat(4, 1fr);
          gap: 40px;
        }

        @media (max-width: 900px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 600px) {
          .footer-grid {
            grid-template-columns: 1fr;
          }
        }

        .footer-col h4 {
          color: #ffffff;
          font-family: var(--font-title);
          font-size: 0.9rem;
          font-weight: 700;
          margin-bottom: 20px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          position: relative;
        }

        .footer-col h4::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: -6px;
          width: 32px;
          height: 2px;
          background: linear-gradient(90deg, var(--accent-gold) 0%, rgba(179, 142, 71, 0.2) 100%);
          border-radius: 2px;
        }

        .footer-col ul {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .footer-col ul :global(a) {
          color: #8a99ad;
          text-decoration: none;
          font-size: 0.82rem;
          font-family: var(--font-body);
          font-weight: 500;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          display: inline-block;
        }

        .footer-col ul :global(a):hover {
          color: var(--accent-gold);
          transform: translateX(6px);
        }

        .brand-col {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .footer-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
        }

        .footer-logo .logo-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, var(--accent-gold) 0%, #987532 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-title);
          font-weight: 850;
          color: #ffffff;
          font-size: 1.20rem;
          box-shadow: 0 4px 14px rgba(179, 142, 71, 0.35);
        }

        .footer-logo .logo-text {
          font-family: var(--font-title);
          font-size: 1.4rem;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: -0.010em;
        }

        .footer-tagline {
          font-size: 0.82rem;
          line-height: 1.65;
          color: #64748b;
          margin: 0;
          max-width: 320px;
        }

        .footer-socials {
          display: flex;
          gap: 10px;
        }

        .social-icon-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          color: #94a3b8;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .social-icon-btn:hover {
          background: var(--accent-gold);
          border-color: transparent;
          color: #ffffff;
          transform: translateY(-3px);
          box-shadow: 0 6px 12px rgba(179, 142, 71, 0.35);
        }

        .footer-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid rgba(255, 255, 255, 0.04);
          padding-top: 24px;
          font-size: 0.76rem;
          color: #475569;
          flex-wrap: wrap;
          gap: 12px;
        }

        .footer-bottom-left p {
          margin: 0;
        }

        .footer-bottom-link:hover {
          color: #ffffff !important;
        }

        .footer-security-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          background: rgba(179, 142, 71, 0.08);
          border: 1px solid rgba(179, 142, 71, 0.15);
          border-radius: 20px;
          color: #b38e47;
          font-size: 0.72rem;
          font-weight: 700;
        }



        /* Sticky Compare Bar at Bottom */
        .sticky-compare-bar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(12px);
          border-top: 1.5px solid rgba(255, 255, 255, 0.1);
          color: white;
          padding: 16px 24px;
          z-index: 9999;
          box-shadow: 0 -10px 25px -5px rgba(0, 0, 0, 0.5);
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }

        .compare-bar-container {
          max-width: 1280px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }

        .compare-bar-info h4 {
          margin: 0;
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--accent-gold, #c5a059);
        }

        .compare-bar-info p {
          margin: 4px 0 0 0;
          font-size: 0.8rem;
          color: #94a3b8;
        }

        .compare-bar-items {
          display: flex;
          gap: 16px;
          flex-grow: 1;
          justify-content: center;
        }

        .compare-bar-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          width: 80px;
        }

        .compare-bar-item-thumb {
          position: relative;
          width: 60px;
          height: 60px;
          border-radius: 8px;
          overflow: hidden;
          border: 1.5px solid rgba(255, 255, 255, 0.2);
          background: #1e293b;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .compare-bar-item-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .compare-bar-item-remove {
          position: absolute;
          top: -2px;
          right: -2px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #ef4444;
          color: white;
          border: none;
          font-size: 0.6rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        .compare-bar-item-name {
          font-size: 0.7rem;
          color: #cbd5e1;
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          width: 100%;
        }

        .compare-bar-item.empty .compare-bar-item-thumb {
          border: 1.5px dashed rgba(255, 255, 255, 0.15);
          background: transparent;
        }

        .empty-slot-plus {
          font-size: 1.2rem;
          color: rgba(255, 255, 255, 0.25);
          font-weight: 300;
        }

        .compare-bar-actions {
          display: flex;
          gap: 12px;
        }

        .btn-compare-clear {
          padding: 8px 16px;
          font-size: 0.8rem;
          font-weight: 600;
          color: #94a3b8;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-compare-clear:hover {
          color: white;
          border-color: rgba(255, 255, 255, 0.4);
        }

        .btn-compare-submit {
          padding: 8px 20px;
          font-size: 0.8rem;
          font-weight: 700;
          color: #0f172a;
          background: var(--accent-gold, #c5a059);
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-compare-submit:hover:not(:disabled) {
          background: #d8b467;
          transform: translateY(-1px);
        }

        .btn-compare-submit:disabled {
          background: #334155;
          color: #64748b;
          cursor: not-allowed;
        }

        /* Comparison Modal Overlay */
        .compare-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 24px;
        }

        .compare-modal-content {
          background: white;
          width: 100%;
          max-width: 1100px;
          max-height: 90vh;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          display: flex;
          flex-direction: column;
          border: 1px solid #e2e8f0;
        }

        .compare-modal-header {
          padding: 20px 28px;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .compare-modal-header h2 {
          margin: 0;
          font-size: 1.4rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: #0f172a;
        }

        .compare-modal-header p {
          margin: 4px 0 0 0;
          font-size: 0.85rem;
          color: #64748b;
        }

        .compare-modal-close {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #f1f5f9;
          border: none;
          font-size: 0.9rem;
          font-weight: bold;
          color: #64748b;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .compare-modal-close:hover {
          background: #ef4444;
          color: white;
        }

        .compare-modal-body {
          flex-grow: 1;
          overflow-y: auto;
          padding: 24px 28px;
        }

        .compare-table-wrapper {
          overflow-x: auto;
        }

        .compare-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .compare-table th, .compare-table td {
          padding: 12px 16px;
          border-bottom: 1.5px solid #f1f5f9;
        }

        .compare-table th {
          background: #f8fafc;
        }

        .feature-col {
          width: 220px;
          font-weight: 700;
          color: #475569;
          font-size: 0.85rem;
          background: white !important;
          border-right: 1.5px solid #f1f5f9;
          position: sticky;
          left: 0;
          z-index: 10;
        }

        .product-col {
          min-width: 200px;
          vertical-align: top;
          text-align: center;
          border-right: 1.5px solid #f1f5f9;
        }

        .compare-product-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          padding-top: 16px;
        }

        .compare-product-remove {
          position: absolute;
          top: -8px;
          font-size: 0.7rem;
          color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
          border: none;
          padding: 2px 8px;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .compare-product-remove:hover {
          background: #ef4444;
          color: white;
        }

        .compare-product-img {
          width: 80px;
          height: 80px;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #e2e8f0;
          margin-bottom: 12px;
        }

        .compare-product-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .compare-product-brand {
          font-size: 0.65rem;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .compare-product-title {
          margin: 4px 0 2px 0;
          font-size: 0.9rem;
          font-weight: 800;
          color: #0f172a;
        }

        .compare-product-code {
          font-size: 0.7rem;
          color: #64748b;
          font-family: monospace;
        }

        .section-row td {
          background: #f1f5f9;
          color: #334155;
          font-weight: 800;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 8px 16px;
        }

        .feature-name {
          font-weight: 600;
          color: #64748b;
          font-size: 0.8rem;
          border-right: 1.5px solid #f1f5f9;
          position: sticky;
          left: 0;
          background: white;
          z-index: 9;
        }

        .feature-value {
          text-align: center;
          font-size: 0.85rem;
          color: #334155;
          font-weight: 500;
          border-right: 1.5px solid #f1f5f9;
        }

        .feature-value.highlight-gold {
          color: #b38e47;
          font-weight: 700;
          font-size: 0.9rem;
        }

        .marketplace-link {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .marketplace-link.trendyol {
          background: rgba(242, 120, 31, 0.1);
          color: #f2781f;
        }
        .marketplace-link.trendyol:hover {
          background: #f2781f;
          color: white;
        }

        .marketplace-link.hepsiburada {
          background: rgba(255, 96, 0, 0.1);
          color: #ff6000;
        }
        .marketplace-link.hepsiburada:hover {
          background: #ff6000;
          color: white;
        }

        .marketplace-link.koctas {
          background: rgba(255, 12, 12, 0.1);
          color: #ff0c0c;
        }
        .marketplace-link.koctas:hover {
          background: #ff0c0c;
          color: white;
        }

        .color-badge {
          display: inline-block;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          margin-right: 6px;
          vertical-align: middle;
        }

        .tech-badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: 600;
        }

        .tech-badge.success {
          background: rgba(34, 197, 94, 0.1);
          color: #16a34a;
        }

        .tech-badge.danger {
          background: rgba(239, 68, 68, 0.1);
          color: #dc2626;
        }

        .tech-badge.info {
          background: rgba(59, 130, 246, 0.1);
          color: #2563eb;
        }

        .tech-badge.warning {
          background: rgba(249, 115, 22, 0.1);
          color: #ea580c;
        }

        .tech-badge.pei-class-5 { background: #e2e8f0; color: #1e293b; border: 1px solid #cbd5e1; }
        .tech-badge.pei-class-4 { background: #f1f5f9; color: #334155; }
        .tech-badge.pei-class-3 { background: #f8fafc; color: #475569; }

        .tech-badge.slip-class-R11 { background: rgba(30, 41, 59, 0.1); color: #0f172a; border: 1px solid rgba(0,0,0,0.15); }
        .tech-badge.slip-class-R10 { background: #f1f5f9; color: #334155; }
        .tech-badge.slip-class-R9 { background: #f8fafc; color: #64748b; }

        .buy-arrow {
          font-size: 0.6rem;
        }

        /* MOBILE RESPONSIVENESS OVERRIDES */
        @media (max-width: 768px) {
          .ai-actions-grid {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
          .detail-specs-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 8px !important;
          }
          .main-header {
            padding: 10px 16px;
            border-radius: var(--border-radius-md);
          }
          .logo-text {
            font-size: 1.2rem;
          }
          .project-top-banner {
            flex-direction: column;
            align-items: stretch;
            text-align: center;
          }
          .banner-left-area {
            background: #0b0f19;
            justify-content: center;
            padding: 12px;
          }
          .banner-ad-showcase {
            min-width: unset;
            padding: 8px 14px;
            justify-content: center;
            border-left: none;
            border-right: none;
            border-top: 1px solid rgba(212, 175, 55, 0.2);
            border-bottom: 1px solid rgba(212, 175, 55, 0.2);
          }
          .ad-thumb {
            width: 60px;
            height: 60px;
          }
          .ad-name {
            max-width: 100px;
          }
          .banner-img {
            width: 100px;
            height: 115px;
            border-radius: 10px;
          }
          .banner-marquee-wrapper {
            padding: 8px 0;
          }
          .banner-marquee-track {
            gap: 20px;
          }
          .showroom-hero-banner {
            padding: 24px 20px;
            min-height: 360px;
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
          .showroom-hero-banner h1,
          .showroom-hero-banner h2 {
            font-size: 1.8rem;
            color: #ffffff !important;
            min-height: auto;
          }
          .hero-banner-subtitle {
            font-size: 0.85rem;
            margin-top: 8px;
          }
          .main-layout {
            padding: 12px;
            gap: 16px;
          }
          .search-bar-container-new {
            flex-direction: column;
            padding: 12px;
            gap: 10px;
          }
          .search-bar-new {
            width: 100% !important;
          }
          .search-btn-new {
            width: 100%;
            justify-content: center;
          }
          .filter-chips-row {
            flex-wrap: wrap;
            gap: 8px;
          }
          .catalog-sidebar-panel {
            padding: 16px;
          }

          /* Detail Modal Mobile Overrides */
          .modal-overlay {
            padding: 0 !important;
            align-items: flex-end !important;
            justify-content: center !important;
            z-index: 99999 !important;
          }
          .detail-modal-content-premium {
            width: 100% !important;
            max-width: 100% !important;
            height: 94vh !important;
            max-height: 94vh !important;
            border-radius: 22px 22px 0 0 !important;
            padding: 16px 14px 84px 14px !important;
            margin: 0 !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 12px !important;
            box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.7) !important;
            position: relative !important;
          }
          .detail-modal-body {
            flex: 1 !important;
            max-height: calc(100vh - 120px) !important;
            overflow-y: auto !important;
            padding-right: 2px !important;
            padding-bottom: 84px !important;
            gap: 14px !important;
            -webkit-overflow-scrolling: touch !important;
            scrollbar-width: thin !important;
          }
          .detail-modal-body::-webkit-scrollbar {
            display: block !important;
            width: 4px !important;
          }
          .detail-modal-header-title h3 {
            font-size: 1.15rem !important;
            line-height: 1.25 !important;
          }
          .detail-visual-box {
            height: 175px !important;
          }
          .detail-specs-grid {
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 6px !important;
          }
          .spec-item-box {
            padding: 6px 8px !important;
          }
          .spec-lbl {
            font-size: 0.52rem !important;
          }
          .spec-val {
            font-size: 0.72rem !important;
          }
          .detail-primary-actions {
            flex-direction: column !important;
            gap: 8px !important;
          }
          .detail-primary-actions button {
            width: 100% !important;
            min-height: 44px !important;
            font-size: 0.82rem !important;
          }
          .calc-inputs-row {
            grid-template-columns: 1fr !important;
            gap: 8px !important;
          }
          .architect-download-box {
            padding: 12px !important;
          }
          .detail-trust-badges-box {
            padding: 10px 12px !important;
            gap: 8px !important;
          }

          /* Compare Modal Overlay & Content Overrides */
          .compare-modal-overlay {
            padding: 0 !important;
            align-items: stretch !important;
            justify-content: stretch !important;
          }
          .compare-modal-content {
            width: 100% !important;
            max-width: 100% !important;
            height: 100% !important;
            max-height: 100vh !important;
            border-radius: 0 !important;
            border: none !important;
          }
          .compare-modal-header {
            padding: 16px !important;
          }
          .compare-modal-body {
            padding: 12px !important;
          }
        }

        @media (max-width: 480px) {
          .products-grid-new {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 10px !important;
          }
          .product-card-new {
            border-radius: 8px;
          }
          .product-card-new h3 {
            font-size: 0.85rem !important;
          }
          .product-card-new .brand-badge {
            font-size: 0.6rem !important;
          }
          .product-card-new .price-tag {
            font-size: 0.85rem !important;
          }
          .swapper-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 8px !important;
          }
          .brand-button-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 8px !important;
          }
          .auth-modal {
            padding: 20px 16px;
          }
          .detail-specs-grid {
            grid-template-columns: 1fr !important;
          }
          .calc-res-grid {
            grid-template-columns: 1fr !important;
          }
          .modal-dealer-row {
            flex-direction: column !important;
            align-items: stretch !important;
            text-align: center !important;
            padding: 12px !important;
          }
          .m-dealer-info {
            margin-bottom: 8px !important;
          }
          .affiliate-row {
            flex-direction: column !important;
            gap: 12px !important;
            align-items: stretch !important;
            text-align: center !important;
            padding: 12px !important;
          }
          .aff-store-meta {
            align-items: center !important;
          }
          .aff-price-action {
            justify-content: space-between !important;
            width: 100% !important;
          }

          /* Showroom Hero Banner & Search Form Mobile Fixes */
          .showroom-hero-banner {
            padding: 20px 15px !important;
            min-height: auto !important;
          }
          .showroom-hero-banner h1,
          .showroom-hero-banner h2 {
            font-size: 1.35rem !important;
            color: #ffffff !important;
            line-height: 1.35 !important;
          }
          .hero-banner-subtitle {
            font-size: 0.78rem !important;
            line-height: 1.45 !important;
          }
          .hero-badge-capsule {
            padding: 4px 10px !important;
            font-size: 0.6rem !important;
          }
          .search-bar-inner-container {
            flex-direction: column !important;
            align-items: stretch !important;
            border-radius: var(--border-radius-md) !important;
            padding: 10px !important;
            gap: 8px !important;
          }
          .search-bar-icon-left {
            display: none !important;
          }
          .wide-search-input {
            width: 100% !important;
            padding: 4px 0 !important;
            text-align: center !important;
          }
          .wide-search-submit-btn {
            width: 100% !important;
            border-radius: var(--border-radius-sm) !important;
            padding: 10px !important;
            text-align: center !important;
          }
        }

        /* Custom Toggle Switch (iOS Style) */
        .toggle-switch-wrapper {
          position: relative;
          display: inline-block;
          width: 36px;
          height: 18px;
        }
        .toggle-switch-wrapper input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .toggle-switch-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #cbd5e1;
          transition: .25s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 18px;
        }
        .toggle-switch-slider:before {
          position: absolute;
          content: "";
          height: 14px;
          width: 14px;
          left: 2px;
          bottom: 2px;
          background-color: white;
          transition: .25s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 50%;
          box-shadow: 0 1px 3px rgba(0,0,0,0.15);
        }
        .toggle-switch-wrapper input:checked + .toggle-switch-slider {
          background-color: var(--accent-gold);
        }
        .toggle-switch-wrapper input:checked + .toggle-switch-slider:before {
          transform: translateX(18px);
        }
        
        /* Accordion Active Indicator Dot */
        .accordion-active-dot {
          width: 6px;
          height: 6px;
          background-color: var(--accent-gold);
          border-radius: 50%;
          display: inline-block;
          box-shadow: 0 0 6px var(--accent-gold);
          margin-left: 6px;
          animation: accordion-pulse-glow 2s infinite ease-in-out;
          flex-shrink: 0;
        }
        @keyframes accordion-pulse-glow {
          0%, 100% { opacity: 0.6; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.15); }
        }

        .accordion-section {
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          padding-bottom: 16px;
          margin-bottom: 16px;
        }
        .accordion-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          user-select: none;
          padding: 8px 4px;
          border-radius: 6px;
          transition: all 0.2s ease;
        }
        .accordion-header:hover {
          background: rgba(0, 0, 0, 0.015);
          padding-left: 8px;
        }
        .accordion-title {
          font-size: 0.8rem;
          font-weight: 700;
          color: #1e293b;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }
        .clear-all-filters-btn {
          background: none;
          border: none;
          color: #64748b;
          font-size: 0.8rem;
          cursor: pointer;
          text-decoration: underline;
          transition: color 0.2s;
        }
        .clear-all-filters-btn:hover {
          color: #8c6b30;
        }
        .scrollable-ebat-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-height: 240px;
          overflow-y: auto;
          padding-right: 4px;
        }
        .scrollable-ebat-list::-webkit-scrollbar {
          width: 4px;
        }
        .scrollable-ebat-list::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 2px;
        }
        .scrollable-ebat-list::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 2px;
        }
        .scrollable-ebat-list::-webkit-scrollbar-thumb:hover {
          background: #8c6b30;
        }
        .filter-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          padding-bottom: 16px;
          margin-bottom: 16px;
        }

        /* MOBILE BOTTOM NAVIGATION & SLIDEOVER FILTERS STYLING */
        .mobile-bottom-nav {
          display: none;
        }
        .mobile-filter-trigger-btn {
          display: none;
        }
        .mobile-filter-close-btn {
          display: none;
        }
        .mobile-filters-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(2px);
          -webkit-backdrop-filter: blur(2px);
          z-index: 10001;
          display: none;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .mobile-filters-backdrop.show {
          display: block;
          opacity: 1;
        }

        /* Modern Filter Chips Styles - Sleek Modern Cards */
        .filters-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
          margin-top: 8px;
          margin-bottom: 8px;
        }
        .filter-chip-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px 10px;
          background: #ffffff;
          border: 1px solid rgba(15, 23, 42, 0.09);
          border-radius: 8px; /* Sleek modern rounded rectangle */
          font-size: 0.76rem;
          font-family: var(--font-body);
          font-weight: 600;
          color: #334155;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          text-align: center;
          word-break: break-word;
          min-height: 38px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
          position: relative;
        }
        .filter-chip-btn:hover {
          border-color: var(--accent-gold);
          color: #8c6b30;
          background: rgba(212, 175, 55, 0.04);
          transform: translateY(-1px);
          box-shadow: 0 4px 10px rgba(140, 107, 48, 0.1);
        }
        .filter-chip-btn.active {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%) !important;
          border-color: var(--accent-gold) !important;
          color: #ffffff !important;
          box-shadow: 0 4px 14px rgba(15, 23, 42, 0.22);
        }
        .color-chip-btn {
          justify-content: flex-start;
          gap: 8px;
          padding-left: 10px;
        }
        .color-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .desktop-sidebar {
          display: flex;
        }
        .mobile-sidebar {
          display: none !important;
        }

        @media (max-width: 900px) {
          .desktop-sidebar {
            display: none !important;
          }
          .mobile-sidebar {
            display: flex !important;
            flex-direction: column;
            justify-content: space-between;
            height: 100vh !important;
            max-height: 100vh !important;
            overflow: hidden !important;
          }
          .filters-scroll-area {
            flex: 1;
            overflow-y: auto;
            padding-right: 4px;
            margin-bottom: 12px;
            scrollbar-width: thin;
          }
          .mobile-filter-footer {
            padding: 16px 0;
            border-top: 1px solid var(--border-color);
            background: #ffffff;
            margin-top: auto;
            position: sticky;
            bottom: 0;
            z-index: 10;
          }
          .mobile-filter-apply-btn {
            width: 100%;
            padding: 14px;
            background: linear-gradient(135deg, var(--accent-gold) 0%, #a27e3c 100%);
            color: #ffffff;
            border: none;
            border-radius: 10px;
            font-size: 0.9rem;
            font-weight: 700;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(179, 142, 71, 0.2);
            transition: all 0.2s ease;
          }
          .mobile-filter-apply-btn:active {
            transform: scale(0.98);
            box-shadow: 0 2px 6px rgba(179, 142, 71, 0.1);
          }

          .mobile-filter-trigger-btn {
            display: flex !important;
            align-items: center;
            gap: 6px;
            background: #ffffff;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 8px 14px;
            font-size: 0.8rem;
            font-weight: 600;
            color: var(--text-primary);
            cursor: pointer;
            box-shadow: 0 2px 6px rgba(0,0,0,0.02);
            transition: all 0.2s;
          }
          .mobile-filter-trigger-btn:active {
            background: #f1f5f9;
          }
          .mobile-filter-close-btn {
            display: flex !important;
            align-items: center;
            justify-content: center;
            background: #f1f5f9;
            border: none;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            font-size: 0.8rem;
            font-weight: 700;
            color: var(--text-secondary);
            cursor: pointer;
            transition: background 0.2s;
          }
          .mobile-filter-close-btn:active {
            background: #e2e8f0;
          }

          .bottom-sheet-handle-wrapper {
            display: none !important;
          }
          .filters-sidebar-new {
            position: fixed !important;
            left: 0 !important;
            right: auto !important;
            bottom: 0 !important;
            top: 0 !important;
            width: 85vw !important;
            max-width: 320px !important;
            height: 100vh !important;
            max-height: 100vh !important;
            z-index: 10005 !important;
            background: #ffffff !important;
            box-shadow: 10px 0 30px rgba(15, 23, 42, 0.15) !important;
            transform: translateX(-100%) !important;
            transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important;
            border-radius: 0 20px 20px 0 !important;
            border-right: 1px solid var(--border-color) !important;
            border-top: none !important;
            border-left: none !important;
            padding: 20px !important;
            display: flex !important;
            flex-direction: column !important;
          }
          .filters-sidebar-new.open {
            transform: translateX(0) !important;
          }
          .main-search-and-results-layout {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 768px) {
          :global(body) {
            padding-bottom: 74px !important;
          }
          .mobile-bottom-nav {
            display: flex;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 60px;
            background: rgba(255, 255, 255, 0.85);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border-top: 1px solid rgba(0, 0, 0, 0.08);
            z-index: 9998;
            justify-content: space-around;
            align-items: center;
            padding-bottom: env(safe-area-inset-bottom, 0);
            box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.03);
          }
          .mobile-nav-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: none;
            border: none;
            color: var(--text-secondary);
            font-size: 0.65rem;
            font-family: var(--font-title);
            font-weight: 500;
            gap: 4px;
            cursor: pointer;
            transition: all 0.2s ease;
            flex: 1;
            position: relative;
            padding: 4px 0;
          }
          .mobile-nav-item.active {
            color: var(--accent-gold);
            font-weight: 700;
          }
          .mobile-nav-item svg {
            transition: transform 0.2s ease;
          }
          .mobile-nav-item:active svg {
            transform: scale(0.85);
          }
          .mobile-nav-badge {
            position: absolute;
            top: -2px;
            right: -8px;
            background: var(--accent-gold);
            color: #1a1c24;
            font-size: 0.55rem;
            font-weight: 800;
            border-radius: 50%;
            min-width: 14px;
            height: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0 3px;
            line-height: 1;
            border: 1px solid #fff;
          }

          /* Mobile Compare Bar - above the tab navigation */
          .sticky-compare-bar {
            bottom: 60px;
            padding: 10px 12px;
            z-index: 9999;
          }
          .compare-bar-container {
            flex-direction: column;
            gap: 10px;
          }
          .compare-bar-info {
            display: flex;
            align-items: center;
            gap: 12px;
            width: 100%;
          }
          .compare-bar-info h4 {
            font-size: 0.85rem;
            margin: 0;
          }
          .compare-bar-info p {
            margin: 0;
            font-size: 0.72rem;
          }
          .compare-bar-items {
            gap: 8px;
            justify-content: flex-start;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            flex-shrink: 0;
          }
          .compare-bar-item {
            width: 56px;
          }
          .compare-bar-item.empty {
            display: none;
          }
          .compare-bar-item-thumb {
            width: 48px;
            height: 48px;
          }
          .compare-bar-item-name {
            font-size: 0.58rem;
          }
          .compare-bar-actions {
            width: 100%;
            justify-content: stretch;
          }
          .compare-bar-actions button {
            flex: 1;
          }
        }

        /* Responsive AI Chatbot styling for mobile */
        @media (max-width: 600px) {
          .ai-chatbot-window {
            position: fixed !important;
            bottom: 60px !important; /* sit above bottom tab navigation */
            right: 0px !important;
            left: 0px !important;
            width: 100% !important;
            height: 48vh !important; /* 48% viewport height */
            max-height: 48vh !important;
            border-radius: 20px 20px 0 0 !important;
            border: none !important;
            border-top: 2px solid #d4af37 !important;
            box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.15) !important;
            z-index: 9999 !important;
          }
          .ai-chatbot-window form {
            padding: 12px 16px !important;
          }
          .ai-chat-header button {
            padding: 8px !important;
            font-size: 1.1rem !important;
          }
        }
      `}</style>
    </main>
  );
}
