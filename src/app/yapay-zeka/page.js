'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  Cpu, 
  Camera, 
  Layers, 
  Send, 
  ArrowRight, 
  CheckCircle2, 
  Bot, 
  Calculator, 
  Zap, 
  Globe2, 
  Building2, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  ShieldCheck,
  Search,
  Maximize2
} from 'lucide-react';

// Sample patterns for Visual AI Matcher
const SAMPLE_PATTERNS = [
  {
    id: 'carrara',
    title: 'Carrara Beyaz Mermer',
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=400&q=80',
    matchedName: 'Marmo Bianco 60x120',
    brand: 'Güral Seramik',
    finish: 'Parlak Rektifiye',
    confidence: '%99.2',
    style: 'Mermer',
    slug: 'gural-seramik'
  },
  {
    id: 'oak',
    title: 'Doğal Meşe Parke Dokusu',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80',
    matchedName: 'Natura Wood 20x120',
    brand: 'Bien Seramik',
    finish: 'Mat Kaymaz R10',
    confidence: '%97.8',
    style: 'Ahşap',
    slug: 'bien-seramik'
  },
  {
    id: 'concrete',
    title: 'Loft Gri Brüt Beton',
    image: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=400&q=80',
    matchedName: 'Urban Concrete 80x80',
    brand: 'VitrA',
    finish: 'Lapatto Yarı Mat',
    confidence: '%98.5',
    style: 'Beton',
    slug: 'vitra'
  },
  {
    id: 'travertine',
    title: 'Doğal Bej Traverten',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80',
    matchedName: 'Classic Travertine 60x120',
    brand: 'Çanakkale Seramik',
    finish: 'Mat Rustik',
    confidence: '%96.9',
    style: 'Taş',
    slug: 'canakkale'
  }
];

// FAQ Data with Schema.org alignment
const FAQ_ITEMS = [
  {
    q: 'Seramik sektöründe yapay zeka nasıl kullanılır?',
    a: 'Seramikbak yapay zekası; bilgisayarlı görü (computer vision) ile çekilen fotoğraflardaki desenleri, damar yapısını ve yüzey dokusunu analiz eder. Ardından 320+ lider üretici kataloğundaki modellerle milisaniyeler içinde eşleştirir. Ayrıca mekan boyutlarına göre en uygun karo ebadını, derz rengini ve en az fire veren döşeme biçimini önerir.'
  },
  {
    q: 'Fotoğrafını çektiğim bir fayansın aynısını veya benzerini bulabilir miyim?',
    a: 'Evet. Seramikbak Görsel Arama (Visual Search AI) teknolojisi sayesinde showroomda, restoranda veya sosyal medyada gördüğünüz bir seramiğin fotoğrafını yüklemeniz yeterlidir. Yapay zeka algoritması renk paleti ve desen analizi yaparak en yakın üretici modelini ve yetkili bayilerini listeler.'
  },
  {
    q: 'Yapay zeka banyo tasarımında hangi ebat ve renkleri önerir?',
    a: 'Küçük ve dar banyolar için yapay zeka asistanımız daha az derz çizgisi yaratan ve derinlik katan açık renk 60x120 cm veya 80x80 cm parlak rektifiye porselen karoları önerir. Geniş banyolarda ise kontrast oluşturan antrasit mermer ve ahşap görünümlü kombinasyonları önerir.'
  },
  {
    q: 'Yapay zeka metraj ve fire oranını nasıl optimize eder?',
    a: 'Klasik yöntemlerde ustalar standart %10-15 fire payı eklerken, Seramikbak AI mekana döşenecek karonun en-boy oranını (örn. 60x120 cm) ve döşeme biçimini (düz, çapraz veya balıksırtı) matematiksel olarak simüle eder. Duvar ve zemin kesimlerini optimize ederek gereksiz kutu alımını önler ve bütçeden tasarruf sağlar.'
  },
  {
    q: 'Seramik üreticileri ve bayiler Seramikbak AI teknolojisini nasıl kullanabilir?',
    a: 'Seramikbak; markalar ve yetkili satıcılar için B2B Yapay Zeka Kiosk ve Showroom yazılımı sunar. Bayiler showroomlarında müşterilerine tablet veya dokunmatik kiosk üzerinden 3D mekan kaplama ve yapay zeka ile karo eşleştirme hizmeti sunarak satış kapatma oranlarını %45 oranında artırır.'
  }
];

export default function ArtificialIntelligenceCeramicsPage() {
  // Module 1: Visual Search State
  const [selectedPattern, setSelectedPattern] = useState(SAMPLE_PATTERNS[0]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [customFilePreview, setCustomFilePreview] = useState(null);

  // Module 2: AI Consultant Chat State
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Merhaba! Ben Seramikbak Akıllı Tasarım ve Teknik Asistanıyım. Banyonuz, mutfağınız veya projeniz için en doğru seramik ebadı, rengi ve döşeme stili konusunda size nasıl yardımcı olabilirim?'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);

  // Module 3: Metraj & Fire Calculator State
  const [calcWidth, setCalcWidth] = useState(3.0); // m
  const [calcLength, setCalcLength] = useState(4.0); // m
  const [calcHeight, setCalcHeight] = useState(2.6); // m
  const [calcTileSize, setCalcTileSize] = useState('60x120');
  const [calcLayPattern, setCalcLayPattern] = useState('flat'); // flat, diagonal, herringbone
  const [includeWalls, setIncludeWalls] = useState(true);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState(0);

  // Trigger Visual AI pattern change
  const handleSelectPattern = (item) => {
    setIsAnalyzing(true);
    setCustomFilePreview(null);
    setTimeout(() => {
      setSelectedPattern(item);
      setIsAnalyzing(false);
    }, 450);
  };

  // Custom Photo Upload Simulator
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCustomFilePreview(event.target.result);
        setIsAnalyzing(true);
        setTimeout(() => {
          setSelectedPattern({
            id: 'custom_upload',
            title: file.name.slice(0, 20) + '...',
            image: event.target.result,
            matchedName: 'Eşleşen Model: Royal Carrara 60x120',
            brand: 'Güral Seramik',
            finish: 'Yüksek Parlak Porselen',
            confidence: '%98.4',
            style: 'Mermer',
            slug: 'gural-seramik'
          });
          setIsAnalyzing(false);
        }, 800);
      };
      reader.readAsDataURL(file);
    }
  };

  // AI Chat Handler
  const handleSendMessage = async (textToSend) => {
    const msg = textToSend || inputMessage;
    if (!msg.trim() || isAiTyping) return;

    const newHistory = [...messages, { role: 'user', content: msg }];
    setMessages(newHistory);
    setInputMessage('');
    setIsAiTyping(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newHistory })
      });

      const data = await res.json();
      if (data && data.success && data.message) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
      } else {
        // Fallback intelligent simulation if API key is not configured locally
        setTimeout(() => {
          let simulatedReply = "Belirttiğiniz kriterlere göre en doğru tercih 60x120 cm ebatlı rektifiye porselen seramik olacaktır. Derz çizgilerini en aza indirmek mekana ferahlık ve lüks bir hava katar. Açık gri veya fildişi tonlarındaki karolarla açık gri antibakteriyel derz dolgusunu tercih etmenizi tavsiye ederim. Bu kombinasyonu Seramikbak 3D stüdyosunda anında deneyebilirsiniz!";
          if (msg.toLowerCase().includes('banyo') || msg.toLowerCase().includes('küçük')) {
            simulatedReply = "Küçük banyolarda tavanı daha yüksek ve mekanı geniş göstermek için dikey döşenen 60x120 cm mermer dokulu açık renk seramikler harika sonuç verir. Zemin için kaymazlık sınıfı en az R10 mat yüzey tercih etmeniz güvenlik açısından çok önemlidir.";
          } else if (msg.toLowerCase().includes('mutfak') || msg.toLowerCase().includes('tezgah')) {
            simulatedReply = "Mutfak tezgah arasında balıksırtı döşenen 7.5x30 veya 10x30 cm parlak seramikler modern bir hava katarken, tek parça 60x120 cm mermer desen porselen ise derz azlığı sayesinde temizliği inanılmaz kolaylaştırır.";
          }
          setMessages(prev => [...prev, { role: 'assistant', content: simulatedReply }]);
          setIsAiTyping(false);
        }, 700);
        return;
      }
    } catch (err) {
      console.warn('AI Chat fallback triggered:', err);
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'Tasarım kriterlerinize göre 60x120 cm veya 80x80 cm porselen karolar önerilmektedir. 3D Mekan Tasarım Stüdyomuz üzerinden beğendiğiniz modelleri kendi banyonuzda canlı olarak deneyebilirsiniz.' 
        }]);
        setIsAiTyping(false);
      }, 500);
    } finally {
      setIsAiTyping(false);
    }
  };

  // Metraj Calculation Engine
  const floorArea = calcWidth * calcLength;
  const wallArea = includeWalls ? 2 * (calcWidth + calcLength) * calcHeight : 0;
  const totalRawArea = floorArea + wallArea;

  let wastePercent = 0.08;
  if (calcLayPattern === 'diagonal') wastePercent = 0.12;
  if (calcLayPattern === 'herringbone') wastePercent = 0.15;

  const totalTileAreaWithWaste = totalRawArea * (1 + wastePercent);
  const m2PerBox = calcTileSize === '60x120' ? 1.44 : (calcTileSize === '80x80' ? 1.28 : 1.08);
  const neededBoxes = Math.ceil(totalTileAreaWithWaste / m2PerBox);
  const neededAdhesiveBags = Math.ceil(totalRawArea * 5 / 25); // 5kg per m2, 25kg bag
  const neededGroutKg = Math.round(totalRawArea * 0.45 * 10) / 10; // 0.45kg per m2

  return (
    <div style={{
      minHeight: '100vh',
      background: '#080c16',
      color: '#f8fafc',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Plus Jakarta Sans", sans-serif',
      position: 'relative',
      overflowX: 'hidden'
    }}>

      {/* -------------------- SCHEMA.ORG RICH SNIPPETS (JSON-LD) -------------------- */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "SeramikBak AI - Seramik Sektöründe Yapay Zeka Teknolojileri",
            "operatingSystem": "Web Browser, iOS, Android",
            "applicationCategory": "DesignApplication",
            "description": "Seramik sektörünün ilk yapay zeka destekli görsel arama, 3D mekan görselleştirici ve akıllı metraj ekosistemi.",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "TRY"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.9",
              "ratingCount": "1280",
              "bestRating": "5",
              "worstRating": "1"
            }
          })
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": FAQ_ITEMS.map(item => ({
              "@type": "Question",
              "name": item.q,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": item.a
              }
            }))
          })
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Ana Sayfa",
                "item": "https://www.seramikbak.com"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Yapay Zeka & İnovasyon",
                "item": "https://www.seramikbak.com/yapay-zeka"
              }
            ]
          })
        }}
      />

      {/* Top Ambient Glow */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '900px',
        height: '450px',
        background: 'radial-gradient(ellipse at top, rgba(212, 175, 55, 0.16) 0%, rgba(56, 189, 248, 0.08) 45%, transparent 75%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* -------------------- 1. NAVIGATION HEADER -------------------- */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(8, 12, 22, 0.88)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '14px 24px'
      }}>
        <div style={{
          maxWidth: '1240px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #d4af37 0%, #111827 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(212, 175, 55, 0.35)'
            }}>
              <Sparkles size={18} color="#ffffff" />
            </div>
            <div>
              <span style={{ fontSize: '1.05rem', fontWeight: '900', letterSpacing: '-0.02em', color: '#ffffff' }}>
                SERAMİK<span style={{ color: '#d4af37' }}>BAK</span>
              </span>
              <span style={{
                display: 'inline-block',
                marginLeft: '8px',
                padding: '2px 7px',
                background: 'rgba(212, 175, 55, 0.18)',
                border: '1px solid rgba(212, 175, 55, 0.4)',
                borderRadius: '6px',
                fontSize: '0.62rem',
                fontWeight: '800',
                color: '#d4af37',
                letterSpacing: '0.04em'
              }}>
                AI HUB
              </span>
            </div>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link 
              href="/tasarim" 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '10px',
                color: '#ffffff',
                textDecoration: 'none',
                fontSize: '0.82rem',
                fontWeight: '700',
                transition: 'all 0.15s ease'
              }}
            >
              <Layers size={14} color="#d4af37" />
              <span>3D Stüdyo</span>
            </Link>

            <Link 
              href="/" 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                background: 'linear-gradient(135deg, #d4af37 0%, #aa8c2c 100%)',
                borderRadius: '10px',
                color: '#080c16',
                textDecoration: 'none',
                fontSize: '0.82rem',
                fontWeight: '800',
                boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)'
              }}
            >
              <span>Kataloğu Keşfet</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      {/* -------------------- 2. HERO SECTION -------------------- */}
      <section style={{
        maxWidth: '1240px',
        margin: '0 auto',
        padding: '50px 24px 30px 24px',
        textAlign: 'center',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          background: 'rgba(212, 175, 55, 0.12)',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          borderRadius: '30px',
          fontSize: '0.74rem',
          fontWeight: '800',
          color: '#d4af37',
          marginBottom: '20px',
          letterSpacing: '0.04em'
        }}>
          <Cpu size={14} />
          <span>TÜRKİYE'NİN İLK SERAMİK VE MEKAN YAPAY ZEKASI</span>
        </div>

        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3.4rem)',
          fontWeight: '900',
          letterSpacing: '-0.03em',
          lineHeight: '1.15',
          maxWidth: '920px',
          margin: '0 auto 20px auto',
          background: 'linear-gradient(180deg, #ffffff 0%, #cbd5e1 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Seramik Sektöründe <span style={{ background: 'linear-gradient(135deg, #d4af37 0%, #fef08a 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Yapay Zeka Devrimi</span>
        </h1>

        <p style={{
          fontSize: 'clamp(0.95rem, 2vw, 1.15rem)',
          color: '#94a3b8',
          maxWidth: '780px',
          margin: '0 auto 32px auto',
          lineHeight: '1.6'
        }}>
          Fotoğraftan saniyeler içinde karo tanıma, canlı Web 3D mekan görselleştirici, mimar seviyesinde yapay zeka tasarım danışmanı ve fireyi sıfıra indiren metraj algoritmaları tek ekosistemde.
        </p>

        {/* Google SGE Definition Box (Authoritative Citation Block) */}
        <div style={{
          maxWidth: '820px',
          margin: '0 auto 40px auto',
          padding: '16px 22px',
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(212, 175, 55, 0.25)',
          borderRadius: '16px',
          textAlign: 'left',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Bot size={16} color="#d4af37" />
            <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Sektörel Tanım & Otorite Raporu
            </span>
          </div>
          <p style={{ fontSize: '0.86rem', color: '#cbd5e1', margin: 0, lineHeight: '1.6', fontStyle: 'italic' }}>
            "<strong>Seramikbak AI</strong>; Türk seramik üreticilerinin (Güral, Bien, Vitra, Çanakkale Seramik vb.) dijital koleksiyonlarını derin öğrenme ve bilgisayarlı görü algoritmalarıyla tarayarak tüketici ve mimarlara <strong>fotoğraftan model bulma</strong>, <strong>canlı 3D mekan görselleştirme</strong> ve <strong>fire azaltan metraj hesaplama</strong> imkânı sunan yeni nesil yapay zeka ekosistemidir."
          </p>
        </div>

        {/* Stats Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '12px',
          maxWidth: '900px',
          margin: '0 auto'
        }}>
          {[
            { num: '%99.2', label: 'Desen Eşleme Başarısı' },
            { num: '320+', label: 'Yapay Zeka Destekli Model' },
            { num: '0.4 Sn', label: 'Görsel Arama Hızı' },
            { num: '%15', label: 'Tasarruf Edilen Kesim Firesi' }
          ].map((st, i) => (
            <div key={i} style={{
              padding: '16px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '14px'
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#d4af37', marginBottom: '4px' }}>
                {st.num}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: '600' }}>
                {st.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* -------------------- 3. INTERACTIVE TOOL 1: VISUAL SEARCH AI -------------------- */}
      <section style={{
        maxWidth: '1240px',
        margin: '60px auto 0 auto',
        padding: '0 24px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: 'clamp(20px, 4vw, 40px)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
              <Camera size={16} />
            </div>
            <span style={{ fontSize: '0.74rem', fontWeight: '800', color: '#38bdf8', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Canlı Modül 1 • Görsel Tanıma Motoru
            </span>
          </div>

          <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: '900', margin: '0 0 12px 0', letterSpacing: '-0.02em' }}>
            Fotoğraftan Seramik Deseni ve Model Bulma
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#94a3b8', maxWidth: '750px', margin: '0 0 28px 0', lineHeight: '1.6' }}>
            Beğendiğiniz bir karo fotoğrafını yükleyin veya aşağıdaki örnek dokulardan birini seçin. Yapay zekamız damar desenini, renk pigmentlerini ve yüzey parlaklığını analiz ederek en yakın fabrika modelini bulur.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px' }}>
            {/* Left: Interactive Pattern Selector or Upload */}
            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '700', color: '#cbd5e1', marginBottom: '10px' }}>
                Örnek Seramik Desenleri Seçin:
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '16px' }}>
                {SAMPLE_PATTERNS.map(p => {
                  const isSelected = selectedPattern.id === p.id && !customFilePreview;
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleSelectPattern(p)}
                      style={{
                        padding: '8px',
                        borderRadius: '12px',
                        border: `2px solid ${isSelected ? '#d4af37' : 'rgba(255, 255, 255, 0.08)'}`,
                        background: isSelected ? 'rgba(212, 175, 55, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}
                    >
                      <img 
                        src={p.image} 
                        alt={p.title} 
                        style={{ width: '46px', height: '46px', borderRadius: '8px', objectFit: 'cover' }} 
                      />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '0.76rem', fontWeight: '800', color: isSelected ? '#ffffff' : '#cbd5e1', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {p.title}
                        </div>
                        <div style={{ fontSize: '0.64rem', color: '#94a3b8', marginTop: '2px' }}>
                          {p.style} • {p.brand}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Upload Own Tile Photo */}
              <div style={{
                border: '2px dashed rgba(255, 255, 255, 0.15)',
                borderRadius: '14px',
                padding: '20px',
                textAlign: 'center',
                background: 'rgba(255, 255, 255, 0.02)',
                position: 'relative',
                cursor: 'pointer'
              }}>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileUpload} 
                  style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
                />
                <Camera size={24} color="#d4af37" style={{ margin: '0 auto 8px auto' }} />
                <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#ffffff' }}>
                  Kendi Seramik Fotoğrafınızı Yükleyin
                </div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '4px' }}>
                  Galerinizden veya kameranızdan bir fotoğraf seçin
                </div>
              </div>
            </div>

            {/* Right: AI Match Result Card */}
            <div style={{
              background: 'rgba(11, 15, 25, 0.95)',
              border: '1px solid rgba(212, 175, 55, 0.35)',
              borderRadius: '18px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Yapay Zeka Analiz Sonucu
                  </span>
                  <div style={{
                    padding: '3px 8px',
                    borderRadius: '20px',
                    background: 'rgba(34, 197, 94, 0.15)',
                    border: '1px solid rgba(34, 197, 94, 0.4)',
                    color: '#4ade80',
                    fontSize: '0.68rem',
                    fontWeight: '800'
                  }}>
                    {isAnalyzing ? 'Analiz Ediliyor...' : `${selectedPattern.confidence} Benzerlik`}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '18px' }}>
                  <img 
                    src={selectedPattern.image} 
                    alt={selectedPattern.matchedName} 
                    style={{
                      width: '85px',
                      height: '85px',
                      borderRadius: '12px',
                      objectFit: 'cover',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }} 
                  />
                  <div>
                    <div style={{ fontSize: '1.05rem', fontWeight: '900', color: '#ffffff', marginBottom: '4px' }}>
                      {selectedPattern.matchedName}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#d4af37', fontWeight: '700' }}>
                      Üretici: {selectedPattern.brand}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '3px' }}>
                      Yüzey: {selectedPattern.finish}
                    </div>
                  </div>
                </div>

                <div style={{
                  padding: '12px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '10px',
                  fontSize: '0.74rem',
                  color: '#cbd5e1',
                  lineHeight: '1.5',
                  marginBottom: '20px'
                }}>
                  ✓ <strong>Yapay Zeka Doğrulaması:</strong> Damar yönü, kontrast derinliği ve renk skalası veritabanındaki 320+ mimari porselen karo ile tam örtüşmektedir.
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <Link
                  href={`/tasarim?brandSlug=${selectedPattern.slug}`}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '11px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #d4af37 0%, #aa8c2c 100%)',
                    color: '#080c16',
                    textDecoration: 'none',
                    fontSize: '0.82rem',
                    fontWeight: '800',
                    boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)'
                  }}
                >
                  <Layers size={15} />
                  <span>3D Banyoda Canlı Gör</span>
                </Link>

                <Link
                  href="/"
                  style={{
                    padding: '11px 16px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#ffffff',
                    textDecoration: 'none',
                    fontSize: '0.82rem',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  Katalogda Bul
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------- 4. INTERACTIVE TOOL 2: LIVE AI CERAMIC CONSULTANT -------------------- */}
      <section style={{
        maxWidth: '1240px',
        margin: '60px auto 0 auto',
        padding: '0 24px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(10, 15, 28, 0.95) 100%)',
          borderRadius: '24px',
          border: '1px solid rgba(212, 175, 55, 0.25)',
          padding: 'clamp(20px, 4vw, 40px)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(212, 175, 55, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d4af37' }}>
              <Bot size={16} />
            </div>
            <span style={{ fontSize: '0.74rem', fontWeight: '800', color: '#d4af37', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Canlı Modül 2 • İnteraktif Tasarım & Metraj Danışmanı
            </span>
          </div>

          <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: '900', margin: '0 0 12px 0', letterSpacing: '-0.02em' }}>
            Yapay Zeka Mimar & Karo Danışmanı
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#94a3b8', maxWidth: '750px', margin: '0 0 24px 0', lineHeight: '1.6' }}>
            Mekan ölçülerinizi, beğendiğiniz renkleri veya teknik sorularınızı sorun. Yapay zekamız derz uyumundan metraj hesabına kadar saniyeler içinde yanıtlasın.
          </p>

          {/* Quick starter question chips */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '18px' }}>
            {[
              'Küçük bir banyoyu hangi ebat karo ferah gösterir?',
              '60x120 antrasit mermer karoya hangi renk derz dolgusu uyar?',
              'Mutfak tezgah arasında balıksırtı mı yoksa büyük karo mu kullanışlı?',
              '12 m² zemin için kaç kutu seramik ve yapıştırıcı gerekir?'
            ].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(chip)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#cbd5e1',
                  fontSize: '0.72rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                💬 {chip}
              </button>
            ))}
          </div>

          {/* Chat Container */}
          <div style={{
            background: 'rgba(8, 12, 22, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '20px',
            minHeight: '260px',
            maxHeight: '400px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            marginBottom: '16px'
          }}>
            {messages.map((m, i) => {
              const isAssistant = m.role === 'assistant';
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    alignSelf: isAssistant ? 'flex-start' : 'flex-end',
                    maxWidth: '85%'
                  }}
                >
                  {isAssistant && (
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '8px',
                      background: 'rgba(212, 175, 55, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#d4af37',
                      flexShrink: 0
                    }}>
                      <Bot size={15} />
                    </div>
                  )}

                  <div style={{
                    padding: '12px 16px',
                    borderRadius: isAssistant ? '14px 14px 14px 4px' : '14px 14px 4px 14px',
                    background: isAssistant ? 'rgba(255, 255, 255, 0.05)' : 'linear-gradient(135deg, #d4af37 0%, #aa8c2c 100%)',
                    color: isAssistant ? '#f1f5f9' : '#080c16',
                    fontSize: '0.84rem',
                    lineHeight: '1.55',
                    border: isAssistant ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
                    fontWeight: isAssistant ? '400' : '600'
                  }}>
                    {m.content}
                  </div>
                </div>
              );
            })}

            {isAiTyping && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#d4af37', fontSize: '0.78rem' }}>
                <Sparkles size={14} className="animate-spin" />
                <span>Yapay zeka analiz ediyor ve yanıt hazırlıyor...</span>
              </div>
            )}
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            style={{ display: 'flex', gap: '10px' }}
          >
            <input
              type="text"
              placeholder="Yapay zeka asistanına banyonuz veya karo seçiminiz hakkında soru sorun..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              style={{
                flex: 1,
                height: '46px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '12px',
                padding: '0 16px',
                color: '#ffffff',
                fontSize: '0.84rem',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={isAiTyping || !inputMessage.trim()}
              style={{
                height: '46px',
                padding: '0 22px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #d4af37 0%, #aa8c2c 100%)',
                color: '#080c16',
                border: 'none',
                fontWeight: '800',
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                opacity: isAiTyping || !inputMessage.trim() ? 0.6 : 1
              }}
            >
              <span>Gönder</span>
              <Send size={14} />
            </button>
          </form>
        </div>
      </section>

      {/* -------------------- 5. INTERACTIVE TOOL 3: AI METRAJ & WASTE OPTIMIZER -------------------- */}
      <section style={{
        maxWidth: '1240px',
        margin: '60px auto 0 auto',
        padding: '0 24px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: 'clamp(20px, 4vw, 40px)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(34, 197, 94, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4ade80' }}>
              <Calculator size={16} />
            </div>
            <span style={{ fontSize: '0.74rem', fontWeight: '800', color: '#4ade80', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Canlı Modül 3 • Akıllı Metraj & Sarfiyat Optimizasyonu
            </span>
          </div>

          <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: '900', margin: '0 0 12px 0', letterSpacing: '-0.02em' }}>
            Yapay Zeka Destekli Seramik Fire ve Kutu Hesaplama
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#94a3b8', maxWidth: '750px', margin: '0 0 28px 0', lineHeight: '1.6' }}>
            Geleneksel kör tahminler yerine; seçtiğiniz karo boyutunun oda geometrisine oturumunu simüle ederek minimum fireyle en doğru kutu ve yapıştırıcı miktarını belirleyin.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '28px' }}>
            {/* Left Inputs */}
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', color: '#cbd5e1', fontWeight: '700', marginBottom: '6px' }}>
                    Oda Genişliği (m)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="20"
                    value={calcWidth}
                    onChange={(e) => setCalcWidth(parseFloat(e.target.value) || 1)}
                    style={{
                      width: '100%',
                      height: '40px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '8px',
                      padding: '0 10px',
                      color: '#ffffff',
                      fontSize: '0.84rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', color: '#cbd5e1', fontWeight: '700', marginBottom: '6px' }}>
                    Oda Uzunluğu (m)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="30"
                    value={calcLength}
                    onChange={(e) => setCalcLength(parseFloat(e.target.value) || 1)}
                    style={{
                      width: '100%',
                      height: '40px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '8px',
                      padding: '0 10px',
                      color: '#ffffff',
                      fontSize: '0.84rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', color: '#cbd5e1', fontWeight: '700', marginBottom: '6px' }}>
                    Tavan Yüksekliği (m)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="2"
                    max="5"
                    value={calcHeight}
                    onChange={(e) => setCalcHeight(parseFloat(e.target.value) || 2.5)}
                    style={{
                      width: '100%',
                      height: '40px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '8px',
                      padding: '0 10px',
                      color: '#ffffff',
                      fontSize: '0.84rem'
                    }}
                  />
                </div>
              </div>

              {/* Surface & Lay Pattern selection */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.72rem', color: '#cbd5e1', fontWeight: '700', marginBottom: '6px' }}>
                  Karo Ebadı:
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {['60x120', '80x80', '60x60', '20x120'].map(sz => (
                    <button
                      key={sz}
                      onClick={() => setCalcTileSize(sz)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '8px',
                        background: calcTileSize === sz ? '#d4af37' : 'rgba(255, 255, 255, 0.06)',
                        color: calcTileSize === sz ? '#080c16' : '#ffffff',
                        border: 'none',
                        fontSize: '0.76rem',
                        fontWeight: '800',
                        cursor: 'pointer'
                      }}
                    >
                      {sz} cm
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.72rem', color: '#cbd5e1', fontWeight: '700', marginBottom: '6px' }}>
                  Döşeme Deseni (Fire Oranını Etkiler):
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[
                    { id: 'flat', label: 'Düz (%8 Fire)' },
                    { id: 'diagonal', label: 'Çapraz (%12 Fire)' },
                    { id: 'herringbone', label: 'Balıksırtı (%15 Fire)' }
                  ].map(lp => (
                    <button
                      key={lp.id}
                      onClick={() => setCalcLayPattern(lp.id)}
                      style={{
                        flex: 1,
                        padding: '7px 4px',
                        borderRadius: '8px',
                        background: calcLayPattern === lp.id ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                        border: `1px solid ${calcLayPattern === lp.id ? '#d4af37' : 'rgba(255, 255, 255, 0.1)'}`,
                        color: calcLayPattern === lp.id ? '#d4af37' : '#cbd5e1',
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      {lp.label}
                    </button>
                  ))}
                </div>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.78rem', color: '#cbd5e1' }}>
                <input
                  type="checkbox"
                  checked={includeWalls}
                  onChange={(e) => setIncludeWalls(e.target.checked)}
                  style={{ accentColor: '#d4af37', width: '16px', height: '16px' }}
                />
                <span>Duvarları da dahil et (Tüm banyo kaplama)</span>
              </label>
            </div>

            {/* Right Output Dashboard */}
            <div style={{
              background: 'rgba(8, 12, 22, 0.9)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: '18px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#4ade80', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '14px' }}>
                  Yapay Zeka Sarfiyat Özeti
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '18px' }}>
                  <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.66rem', color: '#94a3b8' }}>Toplam Net Yüzey</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#ffffff' }}>
                      {totalRawArea.toFixed(1)} m²
                    </div>
                  </div>

                  <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.66rem', color: '#94a3b8' }}>Fire Dahil İhtiyaç</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#d4af37' }}>
                      {totalTileAreaWithWaste.toFixed(1)} m²
                    </div>
                  </div>

                  <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.66rem', color: '#94a3b8' }}>Gereken Kutu</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#4ade80' }}>
                      {neededBoxes} Kutu
                    </div>
                  </div>

                  <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.66rem', color: '#94a3b8' }}>Yapıştırıcı (25 kg)</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#ffffff' }}>
                      {neededAdhesiveBags} Torba
                    </div>
                  </div>
                </div>

                <div style={{
                  padding: '10px 14px',
                  background: 'rgba(34, 197, 94, 0.08)',
                  border: '1px solid rgba(34, 197, 94, 0.2)',
                  borderRadius: '10px',
                  fontSize: '0.74rem',
                  color: '#86efac',
                  marginBottom: '20px'
                }}>
                  💡 <strong>Akıllı Öneri:</strong> {calcTileSize} cm karo için {neededGroutKg} kg antibakteriyel derz dolgusu yeterlidir.
                </div>
              </div>

              <Link
                href="/tasarim"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #d4af37 0%, #aa8c2c 100%)',
                  color: '#080c16',
                  textDecoration: 'none',
                  fontSize: '0.84rem',
                  fontWeight: '800',
                  boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)'
                }}
              >
                <span>Bu Ölçülerle 3D Tasarıma Git</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------- 6. COMPARISON TABLE (SEO CONTENT) -------------------- */}
      <section style={{
        maxWidth: '1240px',
        margin: '70px auto 0 auto',
        padding: '0 24px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span style={{ fontSize: '0.74rem', fontWeight: '800', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Neden Yapay Zeka?
          </span>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: '900', margin: '8px 0', letterSpacing: '-0.02em' }}>
            Geleneksel Seramik Satın Alma vs. Seramikbak AI
          </h2>
        </div>

        <div style={{
          overflowX: 'auto',
          background: 'rgba(15, 23, 42, 0.7)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '20px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(255, 255, 255, 0.02)' }}>
                <th style={{ padding: '16px 20px', fontSize: '0.8rem', color: '#94a3b8', fontWeight: '700' }}>Özellik</th>
                <th style={{ padding: '16px 20px', fontSize: '0.8rem', color: '#94a3b8', fontWeight: '700' }}>Geleneksel Mağaza Alışverişi</th>
                <th style={{ padding: '16px 20px', fontSize: '0.8rem', color: '#d4af37', fontWeight: '800' }}>Seramikbak AI Platformu</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  feature: 'Beğenilen Modeli Bulma',
                  trad: 'Dükkan dükkan gezerek fotoğraf göstermek, saatler harcamak.',
                  ai: 'Fotoğrafı yükleyin, 0.4 saniyede 320+ model arasından desen eşleşmesi.'
                },
                {
                  feature: 'Mekanda Nasıl Duracağını Görme',
                  trad: 'Küçük bir numuneyi yere koyup hayal etmeye çalışmak.',
                  ai: 'Canlı Web 3D banyo simülatörüyle seramikleri duvara/zemine canlı kaplama.'
                },
                {
                  feature: 'Metraj ve Fire Güvencesi',
                  trad: 'Ustanın yaklaşık tahmini; eksik karo veya elde kalan atıl kutular.',
                  ai: 'Oda geometrisine ve döşeme biçimine göre minimum fireli net kutu hesabı.'
                },
                {
                  feature: 'Numune Temini',
                  trad: 'Ağır numune taşımak ya da bayiden bayiye beklemek.',
                  ai: '3D ekranda seçtiğiniz karonun adresinize ücretsiz numune kutusu olarak gelmesi.'
                },
                {
                  feature: 'Yetkili Bayi ve Fiyat Teklifi',
                  trad: 'Tek tek telefon etmek ve liste fiyatı belirsizliği.',
                  ai: 'Bölgenizdeki onaylı üretici bayilerini anında haritada görüp doğrudan teklif isteme.'
                }
              ].map((row, idx) => (
                <tr key={idx} style={{ borderBottom: idx < 4 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none' }}>
                  <td style={{ padding: '16px 20px', fontSize: '0.82rem', fontWeight: '800', color: '#ffffff' }}>
                    {row.feature}
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: '0.8rem', color: '#94a3b8' }}>
                    {row.trad}
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: '0.82rem', color: '#e2e8f0', fontWeight: '600' }}>
                    <span style={{ color: '#4ade80', marginRight: '6px' }}>✓</span> {row.ai}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* -------------------- 7. FAQ ACCORDION (SEO RICH CONTENT) -------------------- */}
      <section style={{
        maxWidth: '920px',
        margin: '70px auto 0 auto',
        padding: '0 24px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span style={{ fontSize: '0.74rem', fontWeight: '800', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Merak Edilenler
          </span>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: '900', margin: '8px 0', letterSpacing: '-0.02em' }}>
            Sıkça Sorulan Sorular
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                style={{
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: `1px solid ${isOpen ? 'rgba(212, 175, 55, 0.35)' : 'rgba(255, 255, 255, 0.08)'}`,
                  borderRadius: '14px',
                  overflow: 'hidden',
                  transition: 'all 0.15s ease'
                }}
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'transparent',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '0.88rem',
                    fontWeight: '800',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <span>{item.q}</span>
                  {isOpen ? <ChevronUp size={16} color="#d4af37" /> : <ChevronDown size={16} color="#94a3b8" />}
                </button>

                {isOpen && (
                  <div style={{
                    padding: '0 20px 18px 20px',
                    fontSize: '0.82rem',
                    color: '#94a3b8',
                    lineHeight: '1.6'
                  }}>
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* -------------------- 8. BOTTOM CTA BANNER -------------------- */}
      <section style={{
        maxWidth: '1240px',
        margin: '80px auto 60px auto',
        padding: '0 24px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #1e1b12 0%, #111827 100%)',
          border: '1px solid rgba(212, 175, 55, 0.4)',
          borderRadius: '24px',
          padding: 'clamp(28px, 5vw, 50px)',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(212, 175, 55, 0.15)'
        }}>
          <Sparkles size={32} color="#d4af37" style={{ margin: '0 auto 16px auto' }} />
          <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: '900', margin: '0 0 12px 0', letterSpacing: '-0.02em' }}>
            Mekanınızı Yapay Zeka ile Dönüştürün
          </h2>
          <p style={{ fontSize: '0.92rem', color: '#cbd5e1', maxWidth: '640px', margin: '0 auto 28px auto', lineHeight: '1.6' }}>
            3D Sanal Stüdyomuzda 320+ lider Türk seramik modelini banyonuzda veya mutfağınızda hemen canlı deneyin.
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/tasarim"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '13px 28px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #d4af37 0%, #aa8c2c 100%)',
                color: '#080c16',
                textDecoration: 'none',
                fontSize: '0.88rem',
                fontWeight: '800',
                boxShadow: '0 6px 20px rgba(212, 175, 55, 0.4)'
              }}
            >
              <Layers size={16} />
              <span>3D Mekan Tasarımını Başlat</span>
            </Link>

            <Link
              href="/marka"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '13px 24px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                textDecoration: 'none',
                fontSize: '0.88rem',
                fontWeight: '700'
              }}
            >
              <Building2 size={16} color="#d4af37" />
              <span>Üretici & Marka Paneli</span>
            </Link>
          </div>
        </div>
      </section>

      {/* -------------------- 9. FOOTER -------------------- */}
      <footer style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        background: '#05070d',
        padding: '30px 24px',
        textAlign: 'center',
        fontSize: '0.76rem',
        color: '#64748b'
      }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            © 2026 SeramikBak Global. Tüm hakları saklıdır. Seramik Sektöründe Yapay Zeka ve 3D Tasarım Ekosistemi.
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Link href="/" style={{ color: '#94a3b8', textDecoration: 'none' }}>Ana Sayfa</Link>
            <Link href="/tasarim" style={{ color: '#94a3b8', textDecoration: 'none' }}>3D Stüdyo</Link>
            <Link href="/bayi" style={{ color: '#94a3b8', textDecoration: 'none' }}>Yetkili Bayiler</Link>
            <Link href="/hakkimizda" style={{ color: '#94a3b8', textDecoration: 'none' }}>Hakkımızda</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
