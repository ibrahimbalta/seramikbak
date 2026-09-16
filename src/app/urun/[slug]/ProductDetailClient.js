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
  Eye,
  Ruler,
  Palette,
  Calculator,
  X
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
  const [showImageZoom, setShowImageZoom] = useState(false);

  // Area Calculator State
  const [showCalculator, setShowCalculator] = useState(false);
  const [customM2, setCustomM2] = useState('50');
  const [includeWastage, setIncludeWastage] = useState(true);
  
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
  const singleTileM2 = (product.width * product.height) / 10000;
  const tileAreaM2 = singleTileM2.toFixed(2);
  const tilesPerM2 = (1 / (singleTileM2 || 0.72)).toFixed(1);

  // Metraj Hesaplayıcı
  const parsedM2 = parseFloat(customM2) || 0;
  const targetArea = includeWastage ? parsedM2 * 1.1 : parsedM2;
  const calculatedTiles = Math.ceil(targetArea / (singleTileM2 || 0.72));
  const estimatedBoxes = Math.ceil(calculatedTiles / 2);

  const openQuoteWithCalculatedArea = () => {
    setQuoteForm(prev => ({ ...prev, areaM2: String(Math.round(targetArea)) }));
    setShowQuoteModal(true);
  };

  const currentDisplayImage = activeView === 'texture' ? (product.textureUrl || product.imageUrl) : product.imageUrl;

  return (
    <div style={{ minHeight: '100vh', background: '#080b11', color: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Top Header / Breadcrumb */}
      <header style={{
        borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
        background: 'rgba(8, 11, 17, 0.85)',
        backdropFilter: 'blur(16px)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        padding: '12px 20px'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          
          {/* Breadcrumb Path */}
          <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#94a3b8' }}>
            <Link 
              href="/" 
              style={{ 
                color: '#cbd5e1', 
                textDecoration: 'none', 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '6px', 
                fontWeight: '500',
                transition: 'color 0.15s'
              }}
            >
              <ArrowLeft size={14} />
              <span>Anasayfa</span>
            </Link>
            <ChevronRight size={13} style={{ opacity: 0.4 }} />
            <Link 
              href={`/marka/${brandSlug}`} 
              style={{ 
                color: '#cbd5e1', 
                textDecoration: 'none',
                fontWeight: '500'
              }}
            >
              {brandName}
            </Link>
            <ChevronRight size={13} style={{ opacity: 0.4 }} />
            <span style={{ color: '#fff', fontWeight: '600', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {product.name}
            </span>
          </nav>

          {/* Quick Actions (Share / Copy) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleCopyLink}
              title="Ürün bağlantısını kopyala"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255, 255, 255, 0.04)',
                color: copied ? '#34d399' : '#cbd5e1',
                border: copied ? '1px solid rgba(52, 211, 153, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)',
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '0.78rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              <span>{copied ? 'Kopyalandı' : 'Linki Kopyala'}</span>
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="WhatsApp üzerinden bayiye veya mimara ilet"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(37, 211, 102, 0.1)',
                color: '#25d366',
                border: '1px solid rgba(37, 211, 102, 0.25)',
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '0.78rem',
                fontWeight: '600',
                textDecoration: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <Share2 size={13} />
              <span>WhatsApp</span>
            </a>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 20px 80px' }}>
        
        {/* Top Product Hero Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '48px',
          alignItems: 'start'
        }}>
          
          {/* Left Column: Image & Texture View */}
          <div>
            <div style={{
              position: 'relative',
              borderRadius: '24px',
              overflow: 'hidden',
              background: 'linear-gradient(180deg, #111728 0%, #090d16 100%)',
              border: '1px solid rgba(255, 255, 255, 0.09)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              aspectRatio: '1 / 1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {/* Main Product Image */}
              <img
                src={currentDisplayImage}
                alt={`${brandName} ${product.name}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: activeView === 'texture' ? 'cover' : 'contain',
                  transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                  background: '#090d16'
                }}
              />

              {/* Minimal Badges Overlay (Top Left) */}
              <div style={{ position: 'absolute', top: '16px', left: '16px', display: 'flex', alignItems: 'center', gap: '8px', zIndex: 10 }}>
                <span style={{
                  background: 'rgba(9, 13, 22, 0.75)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#e2e8f0',
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase'
                }}>
                  {brandName}
                </span>

                {product.isPremium && (
                  <span style={{
                    background: 'rgba(212, 175, 55, 0.12)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(212, 175, 55, 0.35)',
                    color: '#f3d375',
                    fontSize: '0.7rem',
                    fontWeight: '600',
                    padding: '4px 10px',
                    borderRadius: '9999px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Sparkles size={11} style={{ color: '#d4af37' }} />
                    <span>Lüks Seri</span>
                  </span>
                )}
              </div>

              {/* Fullscreen Zoom Trigger (Top Right) */}
              <button
                onClick={() => setShowImageZoom(true)}
                title="Büyük boyutta incele"
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'rgba(9, 13, 22, 0.75)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#94a3b8',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  zIndex: 10
                }}
              >
                <Maximize2 size={15} />
              </button>

              {/* View Switcher: Segmented Pill (Bottom Floating) */}
              {product.textureUrl && (
                <div style={{
                  position: 'absolute',
                  bottom: '16px',
                  display: 'flex',
                  background: 'rgba(8, 12, 20, 0.8)',
                  backdropFilter: 'blur(14px)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '9999px',
                  padding: '3px',
                  gap: '2px',
                  zIndex: 10
                }}>
                  <button
                    onClick={() => setActiveView('image')}
                    style={{
                      background: activeView === 'image' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                      color: activeView === 'image' ? '#ffffff' : '#94a3b8',
                      border: activeView === 'image' ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid transparent',
                      padding: '5px 14px',
                      borderRadius: '9999px',
                      fontSize: '0.74rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Karo Görünümü
                  </button>
                  <button
                    onClick={() => setActiveView('texture')}
                    style={{
                      background: activeView === 'texture' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                      color: activeView === 'texture' ? '#ffffff' : '#94a3b8',
                      border: activeView === 'texture' ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid transparent',
                      padding: '5px 14px',
                      borderRadius: '9999px',
                      fontSize: '0.74rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    4K Doku (Texture)
                  </button>
                </div>
              )}
            </div>

            {/* Quick Architectural Info Bar Under Image */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '8px',
              marginTop: '14px',
              textAlign: 'center'
            }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '12px',
                padding: '10px 8px'
              }}>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginBottom: '2px' }}>
                  <Layers size={12} style={{ color: '#d4af37' }} />
                  <span>Karo Alanı</span>
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#fff' }}>
                  {tileAreaM2} m²
                </div>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '12px',
                padding: '10px 8px'
              }}>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginBottom: '2px' }}>
                  <ShieldCheck size={12} style={{ color: '#34d399' }} />
                  <span>Kalite Standardı</span>
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#fff' }}>
                  1. Sınıf TSE & CE
                </div>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '12px',
                padding: '10px 8px'
              }}>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginBottom: '2px' }}>
                  <Truck size={12} style={{ color: '#60a5fa' }} />
                  <span>Tedarik & Sevk</span>
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#fff' }}>
                  Fabrika / Yetkili Bayi
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Product Info & Conversion Actions */}
          <div>
            
            {/* Brand Link & SKU Meta */}
            <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <Link
                href={`/marka/${brandSlug}`}
                style={{
                  color: '#d4af37',
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  textDecoration: 'none',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span>{brandName}</span>
                <ChevronRight size={13} />
              </Link>

              <span style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#94a3b8',
                fontSize: '0.75rem',
                fontFamily: 'monospace',
                padding: '3px 8px',
                borderRadius: '6px'
              }}>
                KOD: {product.code}
              </span>
            </div>

            {/* Main Product Title */}
            <h1 style={{
              fontSize: '2.4rem',
              fontWeight: '800',
              color: '#ffffff',
              margin: '0 0 16px 0',
              lineHeight: 1.15,
              letterSpacing: '-0.02em'
            }}>
              {product.name}
            </h1>

            {/* Refined Architectural Spec Badges (Lucide Icons, No Emojis) */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '28px' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(212, 175, 55, 0.08)',
                color: '#e5c568',
                border: '1px solid rgba(212, 175, 55, 0.25)',
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '0.8rem',
                fontWeight: '600'
              }}>
                <Ruler size={13} style={{ color: '#d4af37' }} />
                <span>{product.width}×{product.height} cm</span>
              </div>

              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255, 255, 255, 0.03)',
                color: '#e2e8f0',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '0.8rem',
                fontWeight: '500'
              }}>
                <Sparkles size={13} style={{ color: '#94a3b8' }} />
                <span>{product.finish || 'Mat'} Yüzey</span>
              </div>

              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255, 255, 255, 0.03)',
                color: '#e2e8f0',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '0.8rem',
                fontWeight: '500'
              }}>
                <Layers size={13} style={{ color: '#94a3b8' }} />
                <span>{product.style || 'Mermer'} Dokusu</span>
              </div>

              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255, 255, 255, 0.03)',
                color: '#e2e8f0',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '0.8rem',
                fontWeight: '500'
              }}>
                <Palette size={13} style={{ color: '#94a3b8' }} />
                <span>{product.color || 'Antrasit'}</span>
              </div>
            </div>

            {/* Redesigned Minimal & Aesthetic Action Box */}
            <div style={{
              background: 'linear-gradient(180deg, rgba(16, 23, 38, 0.75) 0%, rgba(10, 15, 26, 0.95) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '20px',
              padding: '24px',
              marginBottom: '28px',
              boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.6)',
              position: 'relative'
            }}>
              
              {/* Header: Inquiry Status & Availability */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '600', marginBottom: '4px' }}>
                    Yetkili Bayi & Proje Tedariki
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#ffffff', letterSpacing: '-0.01em' }}>
                    Metrajınıza Özel İskontolu Teklif
                  </div>
                </div>

                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  padding: '5px 10px',
                  borderRadius: '9999px',
                  fontSize: '0.74rem',
                  fontWeight: '600',
                  color: '#34d399',
                  whiteSpace: 'nowrap'
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981' }} />
                  <span>Stokta Hazır</span>
                </div>
              </div>

              {/* Primary Dual Actions (Teklif Al & Numune İste) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                {/* Primary Gold Satin Button */}
                <button
                  onClick={() => setShowQuoteModal(true)}
                  style={{
                    background: 'linear-gradient(135deg, #d4af37 0%, #c49a2c 100%)',
                    color: '#090d16',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '13px 18px',
                    fontSize: '0.88rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 18px rgba(212, 175, 55, 0.25)',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                >
                  <Send size={15} />
                  <span>Teklif Talebi Al</span>
                </button>

                {/* Secondary Frosted Glass Button */}
                <button
                  onClick={() => setShowSampleModal(true)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    color: '#f1f5f9',
                    border: '1px solid rgba(255, 255, 255, 0.14)',
                    borderRadius: '12px',
                    padding: '13px 18px',
                    fontSize: '0.88rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Box size={15} style={{ color: '#d4af37' }} />
                  <span>15×15 Numune İste</span>
                </button>
              </div>

              {/* Interactive Visualizer Studio Suite (Segmented Twin Bar) */}
              <div style={{
                marginTop: '12px',
                paddingTop: '14px',
                borderTop: '1px solid rgba(255, 255, 255, 0.06)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '10px'
                }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '600' }}>
                    Dijital Görselleştirme Stüdyosu
                  </span>

                  <button
                    onClick={() => setShowCalculator(!showCalculator)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: showCalculator ? '#d4af37' : '#94a3b8',
                      fontSize: '0.73rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    <Calculator size={12} />
                    <span>{showCalculator ? 'Hesaplayıcıyı Gizle' : 'Metraj Hesapla'}</span>
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {/* 3D Kiosk Studio */}
                  <button
                    onClick={handleLaunch3DKiosk}
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      color: '#e2e8f0',
                      border: '1px solid rgba(255, 255, 255, 0.09)',
                      borderRadius: '12px',
                      padding: '11px 14px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Eye size={15} style={{ color: '#d4af37' }} />
                    <span>3D Kiosk Studio</span>
                  </button>

                  {/* AI ile Mekan Yenileme */}
                  <button
                    onClick={() => setShowAIRemodel(true)}
                    style={{
                      background: 'rgba(59, 130, 246, 0.06)',
                      color: '#93c5fd',
                      border: '1px solid rgba(59, 130, 246, 0.22)',
                      borderRadius: '12px',
                      padding: '11px 14px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Sparkles size={15} style={{ color: '#60a5fa' }} />
                    <span>AI Mekan Yenileme</span>
                  </button>
                </div>
              </div>

              {/* Optional Minimal Area Calculator Box */}
              {showCalculator && (
                <div style={{
                  marginTop: '16px',
                  padding: '16px',
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.07)',
                  borderRadius: '14px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calculator size={14} style={{ color: '#d4af37' }} />
                      <span>Hızlı Metraj & Kutu Hesaplayıcı</span>
                    </span>
                    <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={includeWastage} 
                        onChange={(e) => setIncludeWastage(e.target.checked)}
                        style={{ accentColor: '#d4af37' }}
                      />
                      <span>+%10 Kesim Firesi</span>
                    </label>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <input
                        type="number"
                        min="1"
                        value={customM2}
                        onChange={(e) => setCustomM2(e.target.value)}
                        placeholder="Metraj (m²)"
                        style={{
                          width: '100%',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          color: '#fff',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          fontSize: '0.85rem',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                      <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', color: '#64748b' }}>
                        m²
                      </span>
                    </div>

                    <button
                      onClick={openQuoteWithCalculatedArea}
                      style={{
                        background: 'rgba(212, 175, 55, 0.15)',
                        border: '1px solid rgba(212, 175, 55, 0.35)',
                        color: '#d4af37',
                        borderRadius: '8px',
                        padding: '8px 14px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Bu Metrajla Teklif Al →
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', textAlign: 'center', fontSize: '0.75rem' }}>
                    <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '6px', borderRadius: '6px' }}>
                      <div style={{ color: '#64748b' }}>Gereken Alan</div>
                      <div style={{ color: '#fff', fontWeight: '700', marginTop: '2px' }}>{targetArea.toFixed(1)} m²</div>
                    </div>
                    <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '6px', borderRadius: '6px' }}>
                      <div style={{ color: '#64748b' }}>Karo Adedi</div>
                      <div style={{ color: '#fff', fontWeight: '700', marginTop: '2px' }}>{calculatedTiles} adet</div>
                    </div>
                    <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '6px', borderRadius: '6px' }}>
                      <div style={{ color: '#64748b' }}>Tahmini Kutu</div>
                      <div style={{ color: '#fff', fontWeight: '700', marginTop: '2px' }}>~{estimatedBoxes} kutu</div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Quick Guarantees & Direct Line */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 18px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '14px',
              fontSize: '0.8rem',
              color: '#94a3b8'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={15} style={{ color: '#34d399' }} />
                <span>Mimari ve Kurumsal Proje İskontosu</span>
              </span>

              <a
                href={authorizedDealers[0]?.phone ? `tel:${authorizedDealers[0]?.phone}` : 'tel:08508880000'}
                style={{
                  color: '#d4af37',
                  textDecoration: 'none',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Phone size={13} />
                <span>Bayi Hattı</span>
              </a>
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

      {/* ---------------- FULLSCREEN IMAGE ZOOM MODAL ---------------- */}
      {showImageZoom && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.92)',
          backdropFilter: 'blur(16px)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}>
          <button
            onClick={() => setShowImageZoom(false)}
            style={{
              position: 'absolute',
              top: '24px',
              right: '24px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#fff',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
          
          <img
            src={currentDisplayImage}
            alt={`${brandName} ${product.name}`}
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              objectFit: 'contain',
              borderRadius: '12px',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)'
            }}
          />
        </div>
      )}

      {/* ---------------- SAMPLE ORDER MODAL ---------------- */}
      {showSampleModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(10px)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#0d131f',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            maxWidth: '500px',
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
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#94a3b8',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={15} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Box size={20} style={{ color: '#d4af37' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#fff', margin: 0 }}>
                15×15 Kesit Numune Talebi
              </h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '20px', lineHeight: 1.45 }}>
              <strong>{brandName} — {product.name}</strong> karosundan adresinize ücretsiz 15×15 cm kesit numune kutusu sevk edilsin.
            </p>

            {sampleSuccess ? (
              <div style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                padding: '16px',
                borderRadius: '12px',
                color: '#34d399',
                fontSize: '0.88rem',
                textAlign: 'center',
                fontWeight: '600'
              }}>
                ✓ {sampleSuccess}
              </div>
            ) : (
              <form onSubmit={handleSampleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {sampleError && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', padding: '10px', borderRadius: '8px', fontSize: '0.8rem' }}>
                    {sampleError}
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>Adınız Soyadınız *</label>
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
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>Telefon *</label>
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
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>E-Posta *</label>
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
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>Şehir *</label>
                    <select
                      value={sampleForm.city}
                      onChange={(e) => setSampleForm({ ...sampleForm, city: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)', background: '#090d16', color: '#fff', fontSize: '0.85rem', boxSizing: 'border-box' }}
                    >
                      {TURKEY_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>İlçe</label>
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
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>Kargo Teslimat Adresi *</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Ofis, şantiye veya ev teslimat adresiniz..."
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
                    background: 'linear-gradient(135deg, #d4af37 0%, #c49a2c 100%)',
                    color: '#090d16',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px',
                    fontSize: '0.88rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    marginTop: '6px'
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
          backdropFilter: 'blur(10px)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#0d131f',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
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
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#94a3b8',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={15} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Send size={20} style={{ color: '#d4af37' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#fff', margin: 0 }}>
                En Yakın Bayiden Fiyat Teklifi Al
              </h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '20px', lineHeight: 1.45 }}>
              <strong>{brandName} {product.name}</strong> için projenizin büyüklüğüne göre en avantajlı yetkili bayi teklifini hazırlayalım.
            </p>

            {quoteSuccess ? (
              <div style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                padding: '16px',
                borderRadius: '12px',
                color: '#34d399',
                fontSize: '0.88rem',
                textAlign: 'center',
                fontWeight: '600'
              }}>
                ✓ {quoteSuccess}
              </div>
            ) : (
              <form onSubmit={handleQuoteSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {quoteError && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', padding: '10px', borderRadius: '8px', fontSize: '0.8rem' }}>
                    {quoteError}
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>Ad Soyad / Firma Adı *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ad Soyad veya Firma"
                    value={quoteForm.name}
                    onChange={(e) => setQuoteForm({ ...quoteForm, name: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)', background: '#090d16', color: '#fff', fontSize: '0.85rem', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>Telefon *</label>
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
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>E-Posta *</label>
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
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>İl *</label>
                    <select
                      value={quoteForm.city}
                      onChange={(e) => setQuoteForm({ ...quoteForm, city: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)', background: '#090d16', color: '#fff', fontSize: '0.85rem', boxSizing: 'border-box' }}
                    >
                      {TURKEY_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>Tahmini Metraj (m²)</label>
                    <input
                      type="number"
                      placeholder="Örn: 150"
                      value={quoteForm.areaM2}
                      onChange={(e) => setQuoteForm({ ...quoteForm, areaM2: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)', background: '#090d16', color: '#fff', fontSize: '0.85rem', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>Proje Notları (Opsiyonel)</label>
                  <textarea
                    rows={2}
                    placeholder="Şantiye teslimi, uygulama desteği veya özel talepleriniz..."
                    value={quoteForm.notes}
                    onChange={(e) => setQuoteForm({ ...quoteForm, notes: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)', background: '#090d16', color: '#fff', fontSize: '0.85rem', boxSizing: 'border-box' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={quoteSubmitting}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #d4af37 0%, #c49a2c 100%)',
                    color: '#090d16',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px',
                    fontSize: '0.88rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    marginTop: '6px'
                  }}
                >
                  {quoteSubmitting ? 'İletiliyor...' : 'Teklif Talebini Gönder'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ---------------- AI REMODEL MODAL ---------------- */}
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
