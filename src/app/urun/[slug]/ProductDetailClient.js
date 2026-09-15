'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Sparkles, 
  MapPin, 
  ShieldCheck, 
  Share2, 
  Copy, 
  Check, 
  ArrowLeft, 
  Layers, 
  Maximize2, 
  Phone, 
  Send, 
  Box, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight,
  ExternalLink,
  Info,
  Building2,
  Truck,
  Eye
} from 'lucide-react';
import { slugify } from '@/lib/slugify';
import AIRemodelModal from '@/components/AIRemodelModal';

const TURKEY_CITIES = [
  'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Amasya', 'Ankara', 'Antalya', 'Artvin', 'Aydın',
  'Balıkesir', 'Bilecik', 'Bingöl', 'Bitlis', 'Bolu', 'Burdur', 'Bursa', 'Çanakkale', 'Çankırı',
  'Çorum', 'Denizli', 'Diyarbakır', 'Edirne', 'Elazığ', 'Erzincan', 'Erzurum', 'Eskişehir', 'Gaziantep',
  'Giresun', 'Gümüşhane', 'Hakkari', 'Hatay', 'Isparta', 'Mersin', 'İstanbul', 'İzmir', 'Kars',
  'Kastamonu', 'Kayseri', 'Kırklareli', 'Kırşehir', 'Kocaeli', 'Konya', 'Kütahya', 'Malatya', 'Manisa',
  'Kahramanmaraş', 'Mardin', 'Muğla', 'Muş', 'Nevşehir', 'Niğde', 'Ordu', 'Rize', 'Sakarya',
  'Samsun', 'Siirt', 'Sinop', 'Sivas', 'Tekirdağ', 'Tokat', 'Trabzon', 'Tunceli', 'Şanlıurfa',
  'Uşak', 'Van', 'Yozgat', 'Zonguldak', 'Aksaray', 'Bayburt', 'Karaman', 'Kırıkkale', 'Batman',
  'Şırnak', 'Bartın', 'Ardahan', 'Iğdır', 'Yalova', 'Karabük', 'Kilis', 'Osmaniye', 'Düzce'
];

export default function ProductDetailClient({ product, relatedProducts = [], authorizedDealers = [] }) {
  const [activeView, setActiveView] = useState('image'); // 'image' or 'texture'
  const [copied, setCopied] = useState(false);
  
  // Sample Modal State
  const [showSampleModal, setShowSampleModal] = useState(false);
  const [sampleSubmitting, setSampleSubmitting] = useState(false);
  const [sampleSuccess, setSampleSuccess] = useState('');
  const [sampleError, setSampleError] = useState('');
  const [sampleForm, setSampleForm] = useState({
    name: '',
    phone: '',
    email: '',
    city: 'İstanbul',
    district: '',
    address: '',
    notes: ''
  });

  // Quote Modal State
  const [showQuoteModal, setShowQuoteModal] = useState(false);

  // AI Remodel Modal State
  const [showAIRemodel, setShowAIRemodel] = useState(false);
  const [quoteSubmitting, setQuoteSubmitting] = useState(false);
  const [quoteSuccess, setQuoteSuccess] = useState('');
  const [quoteError, setQuoteError] = useState('');
  const [quoteForm, setQuoteForm] = useState({
    name: '',
    phone: '',
    email: '',
    city: 'İstanbul',
    areaM2: '150',
    notes: ''
  });

  const brandName = product.brand?.name || 'Seramik';
  const brandSlug = slugify(brandName);
  const productSlug = slugify(`${brandName} ${product.name}`);
  const pageUrl = typeof window !== 'undefined' ? window.location.href : `https://www.seramikbak.com/urun/${productSlug}`;

  // Copy Page Link
  const handleCopyLink = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // WhatsApp Share URL
  const whatsappShareText = encodeURIComponent(
    `Merhaba! SeramikBak'ta bu karoyu inceledim:\n\n*${brandName} - ${product.name} (${product.width}x${product.height} cm)*\nKod: ${product.code}\n\nİncelemek için tıkla: ${pageUrl}`
  );
  const whatsappUrl = `https://api.whatsapp.com/send?text=${whatsappShareText}`;

  // Launch 3D Kiosk
  const handleLaunch3DKiosk = () => {
    try {
      const selectedObj = {
        ...product,
        textureUrl: product.textureUrl || product.imageUrl || '/textures/calacatta_gold.jpg',
        imageUrl: product.imageUrl || product.textureUrl || '/textures/calacatta_gold.jpg',
        unitPrice: 480
      };
      sessionStorage.setItem('kiosk_selected_product', JSON.stringify(selectedObj));
      localStorage.setItem('kiosk_selected_product', JSON.stringify(selectedObj));
      window.location.href = `/kiosk?product=${product.id}`;
    } catch (e) {
      window.location.href = `/kiosk?product=${product.id}`;
    }
  };

  // Submit Sample Order
  const handleSampleSubmit = async (e) => {
    e.preventDefault();
    setSampleSubmitting(true);
    setSampleError('');
    try {
      const res = await fetch('/api/sample-orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          clientName: sampleForm.name,
          clientPhone: sampleForm.phone,
          clientEmail: sampleForm.email,
          city: sampleForm.city,
          district: sampleForm.district,
          address: sampleForm.address,
          notes: sampleForm.notes ? `[Ürün Sayfası Talebi] ${sampleForm.notes}` : '[Ürün Sayfası Talebi]'
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSampleSuccess(data.message || 'Numune talebiniz alındı!');
        setTimeout(() => {
          setShowSampleModal(false);
          setSampleSuccess('');
        }, 4000);
      } else {
        setSampleError(data.error || 'Numune talebi kaydedilemedi.');
      }
    } catch (err) {
      setSampleError('Bağlantı hatası oluştu, lütfen tekrar deneyin.');
    } finally {
      setSampleSubmitting(false);
    }
  };

  // Submit Quote Request
  const handleQuoteSubmit = async (e) => {
    e.preventDefault();
    setQuoteSubmitting(true);
    setQuoteError('');
    try {
      const res = await fetch('/api/leads/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          dealerId: authorizedDealers[0]?.id || null,
          clientName: quoteForm.name,
          clientPhone: quoteForm.phone,
          clientEmail: quoteForm.email,
          notes: `[Ürün Sayfası Fiyat Teklifi] İl: ${quoteForm.city}, Talep Edilen Metraj: ${quoteForm.areaM2} m². ${quoteForm.notes || ''}`
        })
      });
      const data = await res.json();
      if (res.ok) {
        setQuoteSuccess('Fiyat teklifi talebiniz en yakın yetkili bayiye iletildi. En kısa sürede sizinle iletişime geçilecektir.');
        setTimeout(() => {
          setShowQuoteModal(false);
          setQuoteSuccess('');
        }, 4000);
      } else {
        setQuoteError(data.error || 'Teklif gönderilirken bir hata oluştu.');
      }
    } catch (err) {
      setQuoteError('Bağlantı hatası, lütfen tekrar deneyin.');
    } finally {
      setQuoteSubmitting(false);
    }
  };

  // Ebat Alan Hesabı
  const tileAreaM2 = ((product.width * product.height) / 10000).toFixed(2);
  const tilesPerM2 = (10000 / (product.width * product.height)).toFixed(1);

  return (
    <div style={{ minHeight: '100vh', background: '#090d16', color: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Top Header / Breadcrumb */}
      <header style={{
        borderBottom: '1px solid rgba(212, 175, 55, 0.15)',
        background: 'rgba(11, 15, 25, 0.95)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        padding: '14px 20px'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: '#94a3b8' }}>
            <Link href="/" style={{ color: '#d4af37', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700' }}>
              <ArrowLeft size={16} />
              <span>Anasayfa</span>
            </Link>
            <ChevronRight size={14} style={{ opacity: 0.5 }} />
            <Link href={`/marka/${brandSlug}`} style={{ color: '#cbd5e1', textDecoration: 'none' }}>
              {brandName}
            </Link>
            <ChevronRight size={14} style={{ opacity: 0.5 }} />
            <span style={{ color: '#fff', fontWeight: '600', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {product.name}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleCopyLink}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255, 255, 255, 0.05)',
                color: copied ? '#10b981' : '#cbd5e1',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? 'Kopyalandı!' : 'Linki Kopyala'}</span>
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(37, 211, 102, 0.15)',
                color: '#25d366',
                border: '1px solid rgba(37, 211, 102, 0.3)',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: '600',
                textDecoration: 'none',
                cursor: 'pointer'
              }}
            >
              <Share2 size={14} />
              <span>WhatsApp</span>
            </a>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '30px 20px 80px' }}>
        
        {/* Top Product Hero Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '40px',
          alignItems: 'start'
        }}>
          
          {/* Left Column: Image & Texture View */}
          <div>
            <div style={{
              position: 'relative',
              borderRadius: '18px',
              overflow: 'hidden',
              background: '#0e1422',
              border: '1px solid rgba(212, 175, 55, 0.25)',
              boxShadow: '0 20px 45px rgba(0, 0, 0, 0.6)',
              aspectRatio: '1 / 1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {/* Main Image */}
              <img
                src={activeView === 'texture' ? (product.textureUrl || product.imageUrl) : product.imageUrl}
                alt={`${brandName} ${product.name}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: activeView === 'texture' ? 'cover' : 'contain',
                  transition: 'transform 0.3s ease',
                  background: '#090d16'
                }}
              />

              {/* Badges Overlay */}
              <div style={{ position: 'absolute', top: '16px', left: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{
                  background: 'linear-gradient(135deg, #b38e47 0%, #d4af37 100%)',
                  color: '#090d16',
                  fontSize: '0.72rem',
                  fontWeight: '800',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {brandName}
                </span>

                {product.isPremium && (
                  <span style={{
                    background: 'rgba(0, 0, 0, 0.75)',
                    color: '#d4af37',
                    border: '1px solid #d4af37',
                    fontSize: '0.7rem',
                    fontWeight: '700',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Sparkles size={12} />
                    <span>Lüks Koleksiyon</span>
                  </span>
                )}
              </div>

              {/* View Switcher: Karo vs Doku */}
              {product.textureUrl && (
                <div style={{
                  position: 'absolute',
                  bottom: '16px',
                  right: '16px',
                  display: 'flex',
                  background: 'rgba(9, 13, 22, 0.85)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '10px',
                  padding: '4px',
                  gap: '4px'
                }}>
                  <button
                    onClick={() => setActiveView('image')}
                    style={{
                      background: activeView === 'image' ? '#d4af37' : 'transparent',
                      color: activeView === 'image' ? '#090d16' : '#94a3b8',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    Karo Görünümü
                  </button>
                  <button
                    onClick={() => setActiveView('texture')}
                    style={{
                      background: activeView === 'texture' ? '#d4af37' : 'transparent',
                      color: activeView === 'texture' ? '#090d16' : '#94a3b8',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    4K Doku (Texture)
                  </button>
                </div>
              )}
            </div>

            {/* Quick Helper info below image */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '12px',
              padding: '10px 14px',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '10px',
              fontSize: '0.78rem',
              color: '#94a3b8'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Layers size={14} style={{ color: '#d4af37' }} />
                1 Karo = {tileAreaM2} m² ({tilesPerM2} adet/m²)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={14} style={{ color: '#10b981' }} />
                1. Kalite TSE & CE Garantili
              </span>
            </div>
          </div>

          {/* Right Column: Product Info & Conversion Actions */}
          <div>
            
            {/* Brand & SKU Header */}
            <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Link
                href={`/marka/${brandSlug}`}
                style={{
                  color: '#d4af37',
                  fontSize: '0.9rem',
                  fontWeight: '700',
                  textDecoration: 'none',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}
              >
                {brandName}
              </Link>
              <span style={{ color: '#475569' }}>•</span>
              <span style={{ color: '#64748b', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                KOD: {product.code}
              </span>
            </div>

            {/* Product Title */}
            <h1 style={{
              fontSize: '2.2rem',
              fontWeight: '800',
              color: '#fff',
              margin: '0 0 16px 0',
              lineHeight: 1.2
            }}>
              {product.name}
            </h1>

            {/* Quick Spec Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
              <span style={{
                background: 'rgba(212, 175, 55, 0.12)',
                color: '#d4af37',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                padding: '4px 12px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: '700'
              }}>
                📐 {product.width}x{product.height} cm
              </span>

              <span style={{
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#e2e8f0',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '4px 12px',
                borderRadius: '8px',
                fontSize: '0.8rem'
              }}>
                🎨 {product.finish} Yüzey
              </span>

              <span style={{
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#e2e8f0',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '4px 12px',
                borderRadius: '8px',
                fontSize: '0.8rem'
              }}>
                🏛️ {product.style} Dokusu
              </span>

              <span style={{
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#e2e8f0',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '4px 12px',
                borderRadius: '8px',
                fontSize: '0.8rem'
              }}>
                🎯 {product.color}
              </span>
            </div>

            {/* Action Box */}
            <div style={{
              background: 'linear-gradient(180deg, rgba(26, 35, 54, 0.6) 0%, rgba(15, 23, 42, 0.9) 100%)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '30px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)'
            }}>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Yetkili Bayi Tedarik & Teklif</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#d4af37' }}>
                    Metrajınıza Özel Fabrika/Bayi Fiyatı
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    fontSize: '0.72rem',
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#10b981',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontWeight: '700',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <CheckCircle2 size={12} />
                    Stokta Mevcut
                  </span>
                </div>
              </div>

              {/* Conversion Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <button
                  onClick={() => setShowQuoteModal(true)}
                  style={{
                    background: 'linear-gradient(135deg, #b38e47 0%, #d4af37 100%)',
                    color: '#090d16',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '14px 18px',
                    fontSize: '0.9rem',
                    fontWeight: '800',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 16px rgba(212, 175, 55, 0.35)',
                    transition: 'transform 0.15s ease'
                  }}
                >
                  <Send size={16} />
                  <span>En Yakın Bayiden Teklif Al</span>
                </button>

                <button
                  onClick={() => setShowSampleModal(true)}
                  style={{
                    background: 'rgba(212, 175, 55, 0.12)',
                    color: '#d4af37',
                    border: '1px solid rgba(212, 175, 55, 0.4)',
                    borderRadius: '12px',
                    padding: '14px 18px',
                    fontSize: '0.9rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <Box size={16} />
                  <span>15x15 Numune İste</span>
                </button>
              </div>

              {/* 3D Kiosk & Visualizer Button */}
              <button
                onClick={handleLaunch3DKiosk}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#fff',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '12px',
                  padding: '12px 18px',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Eye size={16} style={{ color: '#d4af37' }} />
                <span>3D Mekan Giydirme & Kiosk Studio'da Gör</span>
              </button>

              {/* AI ile Mekan Yenileme Button */}
              <button
                onClick={() => setShowAIRemodel(true)}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(139,92,246,0.15) 100%)',
                  color: '#93c5fd',
                  border: '1px solid rgba(59, 130, 246, 0.4)',
                  borderRadius: '12px',
                  padding: '12px 18px',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Sparkles size={16} style={{ color: '#60a5fa' }} />
                <span>⚡ AI ile Mekan Yenileme — Fotoğrafına Döşe</span>
              </button>
            </div>
          </div>

        </div>

        {/* Technical Data Sheet Section */}
        <section style={{ marginTop: '50px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <div style={{ width: '4px', height: '24px', background: '#d4af37', borderRadius: '2px' }} />
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#fff', margin: 0 }}>
              Teknik Özellikler & Şartname Değerleri (TDS)
            </h2>
          </div>

          <div style={{
            background: 'rgba(15, 23, 42, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            overflow: 'hidden'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <td style={{ padding: '14px 20px', color: '#94a3b8', width: '35%', fontWeight: '600' }}>Üretici Marka</td>
                  <td style={{ padding: '14px 20px', color: '#fff', fontWeight: '700' }}>{brandName}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <td style={{ padding: '14px 20px', color: '#94a3b8', fontWeight: '600' }}>Koleksiyon & Model Kodu</td>
                  <td style={{ padding: '14px 20px', color: '#d4af37', fontFamily: 'monospace', fontWeight: '700' }}>{product.code}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <td style={{ padding: '14px 20px', color: '#94a3b8', fontWeight: '600' }}>Ebat / Ölçü</td>
                  <td style={{ padding: '14px 20px', color: '#fff' }}>{product.width} cm x {product.height} cm</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <td style={{ padding: '14px 20px', color: '#94a3b8', fontWeight: '600' }}>Et Kalınlığı</td>
                  <td style={{ padding: '14px 20px', color: '#fff' }}>{product.thickness || 9.5} mm</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <td style={{ padding: '14px 20px', color: '#94a3b8', fontWeight: '600' }}>Yüzey Bitişi</td>
                  <td style={{ padding: '14px 20px', color: '#fff' }}>{product.finish || 'Mat'}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <td style={{ padding: '14px 20px', color: '#94a3b8', fontWeight: '600' }}>Doku & Tipoloji</td>
                  <td style={{ padding: '14px 20px', color: '#fff' }}>{product.style || 'Mermer'}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <td style={{ padding: '14px 20px', color: '#94a3b8', fontWeight: '600' }}>Aşınma Dayanımı (PEI)</td>
                  <td style={{ padding: '14px 20px', color: '#fff' }}>
                    {product.peiRating ? `PEI ${product.peiRating}` : 'PEI 3-4 (Konut & Ticari Yoğun Trafik)'}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <td style={{ padding: '14px 20px', color: '#94a3b8', fontWeight: '600' }}>Kaydırmazlık Sınıfı</td>
                  <td style={{ padding: '14px 20px', color: '#fff' }}>{product.slipResistance || 'R10 (Islak Zemin Güvenli)'}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <td style={{ padding: '14px 20px', color: '#94a3b8', fontWeight: '600' }}>Dona Dayanıklılık (Frost Resistance)</td>
                  <td style={{ padding: '14px 20px', color: '#fff' }}>
                    {product.frostResistance ? 'Evet (Dona Dayanıklı / Teras & Dış Cephe Uygun)' : 'İç Mekan'}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <td style={{ padding: '14px 20px', color: '#94a3b8', fontWeight: '600' }}>Kenar Tipi</td>
                  <td style={{ padding: '14px 20px', color: '#fff' }}>
                    {product.rectified ? 'Rektifiyeli (Lazer Kesim, Minimum 1mm Derz)' : 'Standart Derzli'}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '14px 20px', color: '#94a3b8', fontWeight: '600' }}>Tavsiye Edilen Alanlar</td>
                  <td style={{ padding: '14px 20px', color: '#d4af37' }}>{product.area || 'Banyo, Mutfak, Salon, Islak Hacim'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Authorized Dealers Section */}
        {authorizedDealers.length > 0 && (
          <section style={{ marginTop: '50px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '4px', height: '24px', background: '#d4af37', borderRadius: '2px' }} />
                <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#fff', margin: 0 }}>
                  Bu Karoyu İnceleyebileceğiniz Yetkili Showroomlar
                </h2>
              </div>
              <Link href="/bayiler" style={{ color: '#d4af37', fontSize: '0.85rem', textDecoration: 'none', fontWeight: '700' }}>
                Tüm Bayileri Gör →
              </Link>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px'
            }}>
              {authorizedDealers.slice(0, 3).map((dealer) => (
                <div
                  key={dealer.id}
                  style={{
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '14px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#d4af37', fontSize: '0.75rem', fontWeight: '700', marginBottom: '6px' }}>
                      <Building2 size={14} />
                      <span>{dealer.city} / {dealer.district}</span>
                    </div>
                    <div style={{ fontSize: '1.05rem', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>
                      {dealer.name}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.4, marginBottom: '14px' }}>
                      {dealer.address}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <a
                      href={`tel:${dealer.phone}`}
                      style={{
                        flex: 1,
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: '#fff',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        fontSize: '0.78rem',
                        fontWeight: '700',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <Phone size={13} style={{ color: '#10b981' }} />
                      <span>Ara</span>
                    </a>

                    <Link
                      href={`/bayi/${slugify(dealer.name)}`}
                      style={{
                        flex: 1.2,
                        background: 'rgba(212, 175, 55, 0.15)',
                        color: '#d4af37',
                        border: '1px solid rgba(212, 175, 55, 0.3)',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        fontSize: '0.78rem',
                        fontWeight: '700',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>Showroom İncele</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <section style={{ marginTop: '50px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '4px', height: '24px', background: '#d4af37', borderRadius: '2px' }} />
                <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#fff', margin: 0 }}>
                  {brandName} Diğer Koleksiyonları
                </h2>
              </div>
              <Link href={`/marka/${brandSlug}`} style={{ color: '#d4af37', fontSize: '0.85rem', textDecoration: 'none', fontWeight: '700' }}>
                Tüm Koleksiyonu Gör →
              </Link>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '20px'
            }}>
              {relatedProducts.map((rel) => {
                const relSlug = slugify(`${brandName} ${rel.name}`);
                return (
                  <Link
                    key={rel.id}
                    href={`/urun/${relSlug}`}
                    style={{
                      background: 'rgba(15, 23, 42, 0.6)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '14px',
                      overflow: 'hidden',
                      textDecoration: 'none',
                      transition: 'all 0.2s',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <div style={{ width: '100%', aspectRatio: '1 / 1', position: 'relative', background: '#0e1422' }}>
                      <img
                        src={rel.imageUrl}
                        alt={rel.name}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    </div>
                    <div style={{ padding: '14px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: '#d4af37', fontWeight: '700', textTransform: 'uppercase' }}>{brandName}</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#fff', margin: '4px 0 8px' }}>{rel.name}</div>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        📐 {rel.width}x{rel.height} cm • {rel.finish}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

      </main>

      {/* ---------------- SAMPLE ORDER MODAL ---------------- */}
      {showSampleModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#0e1422',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            borderRadius: '18px',
            maxWidth: '520px',
            width: '100%',
            padding: '28px',
            position: 'relative',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <button
              onClick={() => setShowSampleModal(false)}
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                fontSize: '1.2rem'
              }}
            >
              ✕
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Box size={22} style={{ color: '#d4af37' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff', margin: 0 }}>
                15x15 Kesit Numune Talebi
              </h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '20px' }}>
              <strong>{brandName} - {product.name}</strong> karosundan adresinize ücretsiz 15x15 cm kesit numune kutusu sevk edilsin.
            </p>

            {sampleSuccess ? (
              <div style={{
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                padding: '16px',
                borderRadius: '12px',
                color: '#10b981',
                fontSize: '0.88rem',
                textAlign: 'center',
                fontWeight: '600'
              }}>
                ✓ {sampleSuccess}
              </div>
            ) : (
              <form onSubmit={handleSampleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {sampleError && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#ef4444', padding: '10px', borderRadius: '8px', fontSize: '0.8rem' }}>
                    {sampleError}
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#cbd5e1', marginBottom: '4px' }}>Adınız Soyadınız *</label>
                  <input
                    type="text"
                    required
                    placeholder="Adınız Soyadınız"
                    value={sampleForm.name}
                    onChange={(e) => setSampleForm({ ...sampleForm, name: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)', background: '#090d16', color: '#fff', fontSize: '0.85rem', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#cbd5e1', marginBottom: '4px' }}>Telefon *</label>
                    <input
                      type="tel"
                      required
                      placeholder="05XX XXX XX XX"
                      value={sampleForm.phone}
                      onChange={(e) => setSampleForm({ ...sampleForm, phone: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)', background: '#090d16', color: '#fff', fontSize: '0.85rem', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#cbd5e1', marginBottom: '4px' }}>E-Posta *</label>
                    <input
                      type="email"
                      required
                      placeholder="ornek@mail.com"
                      value={sampleForm.email}
                      onChange={(e) => setSampleForm({ ...sampleForm, email: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)', background: '#090d16', color: '#fff', fontSize: '0.85rem', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#cbd5e1', marginBottom: '4px' }}>Şehir *</label>
                    <select
                      value={sampleForm.city}
                      onChange={(e) => setSampleForm({ ...sampleForm, city: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)', background: '#090d16', color: '#fff', fontSize: '0.85rem', boxSizing: 'border-box' }}
                    >
                      {TURKEY_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#cbd5e1', marginBottom: '4px' }}>İlçe</label>
                    <input
                      type="text"
                      placeholder="İlçe"
                      value={sampleForm.district}
                      onChange={(e) => setSampleForm({ ...sampleForm, district: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)', background: '#090d16', color: '#fff', fontSize: '0.85rem', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#cbd5e1', marginBottom: '4px' }}>Kargo Teslimat Adresi *</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Ofis veya ev teslimat adresiniz..."
                    value={sampleForm.address}
                    onChange={(e) => setSampleForm({ ...sampleForm, address: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)', background: '#090d16', color: '#fff', fontSize: '0.85rem', boxSizing: 'border-box' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={sampleSubmitting}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #b38e47 0%, #d4af37 100%)',
                    color: '#090d16',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px',
                    fontSize: '0.9rem',
                    fontWeight: '800',
                    cursor: 'pointer',
                    marginTop: '8px'
                  }}
                >
                  {sampleSubmitting ? 'Talebiniz İletiliyor...' : 'Numuneyi Ücretsiz Talep Et'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ---------------- QUOTE REQUEST MODAL ---------------- */}
      {showQuoteModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#0e1422',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            borderRadius: '18px',
            maxWidth: '500px',
            width: '100%',
            padding: '28px',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowQuoteModal(false)}
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                fontSize: '1.2rem'
              }}
            >
              ✕
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Send size={22} style={{ color: '#d4af37' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff', margin: 0 }}>
                En Yakın Bayiden Fiyat Teklifi Al
              </h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '20px' }}>
              <strong>{brandName} {product.name}</strong> için projenizin büyüklüğüne göre en avantajlı yetkili bayi teklifini hazırlayalım.
            </p>

            {quoteSuccess ? (
              <div style={{
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                padding: '16px',
                borderRadius: '12px',
                color: '#10b981',
                fontSize: '0.88rem',
                textAlign: 'center',
                fontWeight: '600'
              }}>
                ✓ {quoteSuccess}
              </div>
            ) : (
              <form onSubmit={handleQuoteSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {quoteError && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#ef4444', padding: '10px', borderRadius: '8px', fontSize: '0.8rem' }}>
                    {quoteError}
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#cbd5e1', marginBottom: '4px' }}>Ad Soyad / Firma Adı *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ad Soyad"
                    value={quoteForm.name}
                    onChange={(e) => setQuoteForm({ ...quoteForm, name: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)', background: '#090d16', color: '#fff', fontSize: '0.85rem', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#cbd5e1', marginBottom: '4px' }}>Telefon *</label>
                    <input
                      type="tel"
                      required
                      placeholder="05XX XXX XX XX"
                      value={quoteForm.phone}
                      onChange={(e) => setQuoteForm({ ...quoteForm, phone: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)', background: '#090d16', color: '#fff', fontSize: '0.85rem', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#cbd5e1', marginBottom: '4px' }}>E-Posta *</label>
                    <input
                      type="email"
                      required
                      placeholder="ornek@mail.com"
                      value={quoteForm.email}
                      onChange={(e) => setQuoteForm({ ...quoteForm, email: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)', background: '#090d16', color: '#fff', fontSize: '0.85rem', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#cbd5e1', marginBottom: '4px' }}>İl *</label>
                    <select
                      value={quoteForm.city}
                      onChange={(e) => setQuoteForm({ ...quoteForm, city: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)', background: '#090d16', color: '#fff', fontSize: '0.85rem', boxSizing: 'border-box' }}
                    >
                      {TURKEY_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#cbd5e1', marginBottom: '4px' }}>Tahmini Metraj (m²)</label>
                    <input
                      type="number"
                      placeholder="Örn: 200"
                      value={quoteForm.areaM2}
                      onChange={(e) => setQuoteForm({ ...quoteForm, areaM2: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)', background: '#090d16', color: '#fff', fontSize: '0.85rem', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={quoteSubmitting}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #b38e47 0%, #d4af37 100%)',
                    color: '#090d16',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px',
                    fontSize: '0.9rem',
                    fontWeight: '800',
                    cursor: 'pointer',
                    marginTop: '8px'
                  }}
                >
                  {quoteSubmitting ? 'İletiliyor...' : 'Teklif Talebini Gönder'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* AI ile Mekan Yenileme Modal */}
      {showAIRemodel && (
        <AIRemodelModal
          isOpen={showAIRemodel}
          onClose={() => setShowAIRemodel(false)}
          selectedProduct={product}
          onGoToDealers={() => {
            const dealersEl = document.getElementById('authorized-dealers-section');
            if (dealersEl) {
              dealersEl.scrollIntoView({ behavior: 'smooth' });
            } else {
              setShowQuoteModal(true);
            }
          }}
        />
      )}

    </div>
  );
}
