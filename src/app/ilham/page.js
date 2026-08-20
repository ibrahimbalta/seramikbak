'use client';

import { useState, useEffect } from 'react';
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
  HelpCircle,
  TrendingUp,
  Search,
  Building2,
  FileText
} from 'lucide-react';

export default function InspirationGalleryPage() {
  const [activeTab, setActiveTab] = useState('gallery'); // 'gallery', 'calculator', 'trends', 'blog'
  const [selectedArticle, setSelectedArticle] = useState(null);

  // Gallery Filter State
  const [selectedRoomFilter, setSelectedRoomFilter] = useState('ALL'); // 'ALL', 'Banyo', 'Mutfak', 'Salon', 'Dış Mekan'

  // Calculator State
  const [calcWidth, setCalcWidth] = useState('4');
  const [calcLength, setCalcLength] = useState('5');
  const [calcTileSize, setCalcTileSize] = useState('60x120'); // '60x120', '60x60', '80x80', '30x60', '20x120'
  const [calcWastePercent, setCalcWastePercent] = useState('10'); // 5, 10, 15
  const [calcResult, setCalcResult] = useState(null);

  // Calculation logic for Tile & Grout calculator
  const calculateMaterials = () => {
    const w = parseFloat(calcWidth) || 0;
    const l = parseFloat(calcLength) || 0;
    const area = w * l;

    if (area <= 0) return;

    const wasteFactor = 1 + (parseFloat(calcWastePercent) / 100);
    const totalAreaWithWaste = area * wasteFactor;

    // Box m² specs
    const boxM2Map = {
      '60x120': 1.44,
      '60x60': 1.44,
      '80x80': 1.28,
      '30x60': 1.44,
      '20x120': 1.20
    };

    const boxM2 = boxM2Map[calcTileSize] || 1.44;
    const boxesNeeded = Math.ceil(totalAreaWithWaste / boxM2);
    const totalPurchasedM2 = (boxesNeeded * boxM2).toFixed(2);
    const groutKgNeeded = (totalAreaWithWaste * 0.35).toFixed(1); // avg 0.35kg grout per m²

    setCalcResult({
      netArea: area.toFixed(2),
      totalAreaWithWaste: totalAreaWithWaste.toFixed(2),
      boxesNeeded,
      totalPurchasedM2,
      groutKgNeeded,
      boxM2
    });
  };

  // Gallery items data (16 Diverse Architectural Models)
  const [galleryItems, setGalleryItems] = useState([
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
  ]);

  // Educational & Technical Articles
  const [articles, setArticles] = useState([
    {
      id: 1,
      title: 'Rektifiyeli Seramik Nedir? Derz Aralıkları Nasıl Olmalıdır?',
      summary: 'Seramiklerin kenarlarının lazerle kesilerek dikleştirilmesi işlemine rektifiye denir. Peki montajda nelere dikkat edilmeli?',
      category: 'Teknik Rehber',
      readTime: '4 dk okuma',
      content: `
        <h3>Rektifiyeli Seramik Nedir?</h3>
        <p>Rektifiyeli seramik veya porselen karolar, pişirilme aşamasından sonra kenarlarının özel elmas bıçaklarla traşlanarak tam 90 derecelik dik açılara getirilmesi işlemidir. Standart seramiklerde kenarlar hafif yuvarlak gelirken, rektifiyeli ürünlerin kenarları keskin ve düzdür.</p>
        
        <h3>Rektifiyeli Seramiklerin Avantajları Nelerdir?</h3>
        <ul>
          <li><strong>Minimum Derz Boşluğu:</strong> Kenarları dik açılı olduğu için karolar birbirine 1mm - 1.5mm gibi incecik derzlerle döşenebilir.</li>
          <li><strong>Kesintisiz Yüzey Görünümü:</strong> Derz çizgileri çok az fark edildiği için oda olduğundan çok daha geniş ve modern görünür.</li>
          <li><strong>Kolay Temizlik:</strong> Kalın derz alanları olmadığı için kir birikimi minimuma iner.</li>
        </ul>

        <h3>Döşerken Nelere Dikkat Edilmelidir?</h3>
        <p>Zeminin şapı ve terazisi kusursuz olmalıdır. Montaj sırasında mutlaka profesyonel seramik klipsleri ve tesviye takozları kullanılmalıdır.</p>
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
        <p>Seramik seçiminde doğru karar verebilmek için odanın ışık alma durumu ve kullanım amacı dikkate alınmalıdır.</p>

        <h3>Parlak (Lappato / Full Lappato) Seramikler</h3>
        <ul>
          <li><strong>Nerede Kullanılmalı?</strong> Işığı az alan dar banyolar, holler ve duvar kaplamaları için mükemmeldir. Odayı ferah gösterir.</li>
          <li><strong>Önemli Uyarı:</strong> Islakken kayganlaşırlar. Bu nedenle banyo zeminleri veya dış mekan merdivenleri için önerilmez.</li>
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
      title: '2026 Banyo Tasarım Trendleri: Doğallığa Dönüş ve Toprak Tonları',
      summary: 'Bu yıl banyolarda mermer soğukluğundan ziyade sıcak traverten tonları, ham meşe ahşap dokuları ve yeşil bitkiler hakim.',
      category: 'Trendler',
      readTime: '3 dk okuma',
      content: `
        <h3>2026 Banyo Tasarımlarında Öne Çıkanlar</h3>
        <p>Banyolar artık evlerin kişisel spa merkezleri ve dinlenme köşeleri haline geldi. İşte öne çıkan trendler:</p>
        <ul>
          <li><strong>Sıcak Traverten ve Bej Tonları:</strong> Soğuk gri yerini kemik rengi, bej ve sıcak traverten dokularına bırakıyor.</li>
          <li><strong>Ahşap Görünümlü Porselen:</strong> Suya ve neme %100 dayanıklı ahşap desenli porselen karolar banyoya sıcaklık katar.</li>
          <li><strong>Mat Bronz Bataryalar:</strong> Klasik krom yerine fırçalanmış mat bronz batarya kombinasyonları.</li>
        </ul>
      `
    }
  ]);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data) {
          if (data.page_ilham_list && Array.isArray(data.page_ilham_list) && data.page_ilham_list.length >= 4) {
            // Ensure items have room tags
            const valid = data.page_ilham_list.some(item => item.room);
            if (valid) {
              setGalleryItems(data.page_ilham_list);
            }
          }
          if (data.page_blog_list && Array.isArray(data.page_blog_list) && data.page_blog_list.length > 0) {
            setArticles(data.page_blog_list);
          }
        }
      })
      .catch(err => console.error('Failed to load inspiration settings:', err));
  }, []);

  const filteredGallery = selectedRoomFilter === 'ALL'
    ? galleryItems
    : galleryItems.filter(item => item.room === selectedRoomFilter);

  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      fontFamily: 'Inter, system-ui, sans-serif',
      color: '#0f172a',
      position: 'relative',
      overflowX: 'hidden'
    }}>

      {/* Header navbar */}
      <header style={{
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        position: 'sticky',
        top: 0,
        zIndex: 20,
        boxShadow: '0 4px 30px rgba(0,0,0,0.02)'
      }}>
        <div style={{
          maxWidth: '1140px',
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
            fontWeight: '700'
          }}>
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
            <span style={{ fontSize: '1.1rem', fontWeight: '800' }}>SeramikBak İlham & Trend Hub</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div style={{
        maxWidth: '1140px',
        margin: '0 auto',
        padding: '40px 24px 100px 24px',
        position: 'relative',
        zIndex: 1
      }}>

        {/* Hero Section */}
        <section style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(179, 142, 71, 0.1)',
            color: '#8c6b30',
            padding: '6px 16px',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: '800',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '16px'
          }}>
            <Compass size={14} />
            <span>Mimari Fikirler & İnteraktif Trend Rehberi</span>
          </div>
          <h1 style={{
            fontSize: 'clamp(2.1rem, 4.5vw, 3rem)',
            fontWeight: '900',
            letterSpacing: '-0.025em',
            margin: '0 0 14px 0',
            color: '#0f172a'
          }}>Yaşam Alanınız İçin Kusursuz Seramik İlhamı</h1>
          <p style={{
            fontSize: '1.05rem',
            color: '#64748b',
            maxWidth: '680px',
            margin: '0 auto 24px auto',
            lineHeight: '1.6'
          }}>
            Evinizi dekore ederken veya banyonuzu yenilerken profesyonel mimari tasarımları inceleyin, seramik metrajınızı hesaplayın ve teknik rehberlerden yararlanın.
          </p>

          {/* Interactive Navigation Tabs */}
          <div style={{
            display: 'inline-flex',
            background: '#ffffff',
            padding: '6px',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '4px'
          }}>
            {[
              { id: 'gallery', label: 'Tasarım İlham Galerisi', icon: Sparkles },
              { id: 'calculator', label: 'Seramik & Derz Metraj Hesaplayıcı', icon: Calculator },
              { id: 'trends', label: '2026 Sezon Trendleri', icon: TrendingUp },
              { id: 'blog', label: 'Teknik Seçim Rehberleri', icon: BookOpen }
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
                    border: 'none',
                    background: isActive ? '#0f172a' : 'transparent',
                    color: isActive ? '#ffffff' : '#64748b',
                    fontWeight: '700',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Icon size={16} style={{ color: isActive ? '#b38e47' : '#94a3b8' }} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* TAB 1: DESIGN GALLERY */}
        {activeTab === 'gallery' && (
          <section style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={20} style={{ color: '#b38e47' }} />
                <span>Mimari Tasarım & Mekan Kombinasyonları</span>
              </h2>

              {/* Room Filter */}
              <div style={{ display: 'flex', gap: '6px', background: '#ffffff', padding: '4px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                {['ALL', 'Banyo', 'Mutfak', 'Salon', 'Dış Mekan'].map(room => (
                  <button
                    key={room}
                    onClick={() => setSelectedRoomFilter(room)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      border: 'none',
                      fontSize: '0.78rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      background: selectedRoomFilter === room ? '#b38e47' : 'transparent',
                      color: selectedRoomFilter === room ? '#ffffff' : '#64748b',
                      transition: 'all 0.2s'
                    }}
                  >
                    {room === 'ALL' ? 'Tüm Mekanlar' : room}
                  </button>
                ))}
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '24px'
            }}>
              {filteredGallery.map((item) => (
                <div key={item.id} style={{
                  background: '#ffffff',
                  border: '1px solid rgba(0, 0, 0, 0.05)',
                  borderRadius: '24px',
                  overflow: 'hidden',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.02)',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <div style={{ height: '230px', position: 'relative', background: '#e2e8f0', overflow: 'hidden' }}>
                    <img 
                      src={item.img} 
                      alt={item.title} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{
                      position: 'absolute',
                      top: '16px',
                      left: '16px',
                      background: 'rgba(15, 23, 42, 0.85)',
                      backdropFilter: 'blur(6px)',
                      color: '#ffffff',
                      padding: '4px 12px',
                      borderRadius: '8px',
                      fontSize: '0.72rem',
                      fontWeight: '800'
                    }}>{item.tag}</div>
                    <div style={{
                      position: 'absolute',
                      bottom: '16px',
                      right: '16px',
                      background: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(4px)',
                      color: '#0f172a',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      fontSize: '0.7rem',
                      fontWeight: '700'
                    }}>📍 {item.room}</div>
                  </div>

                  <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '10px', flexGrow: 1 }}>
                    <h4 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>{item.title}</h4>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0, lineHeight: '1.5' }}>{item.desc}</p>
                    
                    {item.tileRecommendation && (
                      <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '10px', border: '1px solid #f1f5f9', fontSize: '0.75rem' }}>
                        <span style={{ color: '#64748b', fontWeight: '600' }}>Önerilen Karo: </span>
                        <strong style={{ color: '#b38e47' }}>{item.tileRecommendation}</strong>
                      </div>
                    )}

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: 'auto',
                      paddingTop: '16px',
                      borderTop: '1px solid #f1f5f9'
                    }}>
                      <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600' }}>Stil: {item.style}</span>
                      <Link href={`/?q=${encodeURIComponent(item.style)}`} style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.8rem',
                        fontWeight: '800',
                        color: '#0f172a',
                        textDecoration: 'none'
                      }}>
                        <span>Koleksiyonu Gör</span>
                        <ChevronRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TAB 2: TILE & GROUT CALCULATOR */}
        {activeTab === 'calculator' && (
          <section style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '24px',
              padding: '32px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.02)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(179, 142, 71, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b38e47' }}>
                  <Calculator size={24} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: '900', margin: 0, color: '#0f172a' }}>
                    Seramik & Derz Metraj Hesaplayıcı
                  </h2>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '2px 0 0 0' }}>
                    Zemin veya duvar ölçülerinizi girin; kaç kutu seramik ve kaç kg derz harcı gerektiğini anında hesaplayın.
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>En (Metre)</label>
                  <input 
                    type="number" 
                    value={calcWidth} 
                    onChange={e => setCalcWidth(e.target.value)} 
                    placeholder="Örn: 4"
                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Boy (Metre)</label>
                  <input 
                    type="number" 
                    value={calcLength} 
                    onChange={e => setCalcLength(e.target.value)} 
                    placeholder="Örn: 5"
                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Seramik Ebat Seçimi</label>
                  <select 
                    value={calcTileSize} 
                    onChange={e => setCalcTileSize(e.target.value)}
                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', background: '#fff' }}
                  >
                    <option value="60x120">60x120 cm (Kutu: 1.44 m²)</option>
                    <option value="60x60">60x60 cm (Kutu: 1.44 m²)</option>
                    <option value="80x80">80x80 cm (Kutu: 1.28 m²)</option>
                    <option value="30x60">30x60 cm (Kutu: 1.44 m²)</option>
                    <option value="20x120">20x120 cm Ahşap (Kutu: 1.20 m²)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Kesim & Fire Oranı (%)</label>
                  <select 
                    value={calcWastePercent} 
                    onChange={e => setCalcWastePercent(e.target.value)}
                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', background: '#fff' }}
                  >
                    <option value="5">%5 (Düz Döşeme)</option>
                    <option value="10">%10 (Standart Önerilen)</option>
                    <option value="15">%15 (Çapraz / Balıksırtı Döşeme)</option>
                  </select>
                </div>
              </div>

              <button 
                onClick={calculateMaterials}
                style={{
                  background: '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px 28px',
                  fontWeight: '800',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Calculator size={18} style={{ color: '#b38e47' }} />
                <span>Malzeme İhtiyacını Hesapla</span>
              </button>

              {/* CALCULATION RESULTS DISPLAY */}
              {calcResult && (
                <div style={{ marginTop: '30px', padding: '24px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '800', margin: '0 0 16px 0', color: '#0f172a' }}>
                    📐 Hesaplanan İhtiyaç Özeti
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                    <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Net Kullanım Alanı</span>
                      <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0f172a', marginTop: '4px' }}>
                        {calcResult.netArea} m²
                      </div>
                    </div>

                    <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Fire Dahil Toplam M²</span>
                      <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#2563eb', marginTop: '4px' }}>
                        {calcResult.totalAreaWithWaste} m²
                      </div>
                    </div>

                    <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Alınması Gereken Kutu</span>
                      <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#b38e47', marginTop: '4px' }}>
                        {calcResult.boxesNeeded} Kutu
                      </div>
                      <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Top. {calcResult.totalPurchasedM2} m²</span>
                    </div>

                    <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Tahmini Derz Harcı</span>
                      <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#10b981', marginTop: '4px' }}>
                        ~{calcResult.groutKgNeeded} kg
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <Link href={`/?q=${calcTileSize}`} style={{
                      background: '#b38e47',
                      color: '#ffffff',
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
                      fontWeight: '700',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <span>Bayilerden Toplu Fiyat Teklifi Al</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* TAB 3: 2026 SEASON TREND RADAR */}
        {activeTab === 'trends' && (
          <section style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              
              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <Palette size={22} style={{ color: '#b38e47' }} />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>
                    2026 Favori Renk Paletleri
                  </h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                    <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>Sıcak Traverten & Kemik Bej</strong>
                    <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '4px 0 0 0' }}>Banyolarda otel spası atmosferi yaratan krem ve sıcak toprak tonları.</p>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                    <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>Ham Meşe & Doğal Ceviz</strong>
                    <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '4px 0 0 0' }}>Sıcak ahşap dokulu 20x120 cm derzsiz porselen karolar.</p>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                    <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>Brütist Beton & Açık Antrasit</strong>
                    <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '4px 0 0 0' }}>Modern minimalist salon ve ticari mekan tasarımları.</p>
                  </div>
                </div>
              </div>

              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <Lightbulb size={22} style={{ color: '#2563eb' }} />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>
                    Popüler Ebat Trendleri
                  </h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                    <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>60x120 cm Plaka Karolar (%45 Pay)</strong>
                    <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '4px 0 0 0' }}>Az derz çizgisiyle mekanları daha geniş gösteren en popüler ebat.</p>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                    <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>120x240 cm Dev Porselen Plakalar</strong>
                    <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '4px 0 0 0' }}>Villa salonları, tv arkası ve duş kabin duvarlarında dikişsiz lüks.</p>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                    <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>80x80 cm Kare Zemin Karoları</strong>
                    <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '4px 0 0 0' }}>Mutfak ve antre zeminlerinde pratik uygulama kolaylığı.</p>
                  </div>
                </div>
              </div>

            </div>
          </section>
        )}

        {/* TAB 4: EDUCATIONAL BLOG ARTICLES */}
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
                    border: '1px solid rgba(0, 0, 0, 0.05)',
                    borderRadius: '24px',
                    padding: '30px',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.01)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                      background: 'rgba(179, 142, 71, 0.1)',
                      color: '#b38e47',
                      padding: '3px 10px',
                      borderRadius: '6px',
                      fontSize: '0.72rem',
                      fontWeight: '800'
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
                    fontWeight: '800',
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
        )}

      </div>

      {/* Article Detail Overlay Modal */}
      {selectedArticle && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.5)',
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
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .article-detail-body h3 {
          font-size: 1.15rem;
          font-weight: 800;
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
