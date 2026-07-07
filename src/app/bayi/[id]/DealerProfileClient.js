'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  MapPin, 
  Phone, 
  Sparkles, 
  ChevronLeft, 
  Image as ImageIcon, 
  Send, 
  CheckCircle2, 
  Building2, 
  Compass, 
  Clock, 
  Mail, 
  ArrowRight,
  MessageSquare
} from 'lucide-react';

export default function DealerProfileClient({ dealer, products }) {
  const [galleryTab, setGalleryTab] = useState(dealer.virtualTourUrl ? '3d' : 'photos');
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  
  // Lead form states
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const images = dealer.showroomImages ? dealer.showroomImages.split(',').filter(Boolean) : [];
  const concepts = dealer.specialConcepts ? dealer.specialConcepts.split(',').filter(Boolean) : [];

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    if (!clientName || !clientPhone || !clientEmail || !selectedProductId) {
      setErrorMsg('Lütfen tüm zorunlu alanları doldurun.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/leads/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProductId,
          dealerId: dealer.id,
          clientName,
          clientPhone,
          clientEmail,
          notes
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg('Teklif talebiniz bayimize başarıyla ulaştırılmıştır! En kısa sürede sizinle iletişime geçilecektir.');
        setClientName('');
        setClientPhone('');
        setClientEmail('');
        setNotes('');
      } else {
        setErrorMsg(data.error || 'Teklif talebi gönderilemedi.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Bağlantı hatası oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#1e293b',
      paddingBottom: '60px'
    }}>
      {/* Header Bar */}
      <div style={{
        background: '#fff',
        borderBottom: '1px solid #e2e8f0',
        padding: '16px 24px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
      }}>
        <Link href="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          color: '#64748b',
          fontSize: '0.88rem',
          fontWeight: '600',
          textDecoration: 'none',
          transition: 'color 0.2s'
        }} onMouseEnter={(e) => e.target.style.color = '#0f172a'} onMouseLeave={(e) => e.target.style.color = '#64748b'}>
          <ChevronLeft size={16} />
          Geri Dön
        </Link>
        <span style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0f172a' }}>Yetkili Bayi Profili</span>
        <div style={{ width: '70px' }}></div>
      </div>

      {/* Main Container */}
      <div style={{
        maxWidth: '1200px',
        margin: '32px auto 0 auto',
        padding: '0 24px'
      }}>
        
        {/* Profile Card & Info Header */}
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '24px',
          marginBottom: '32px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '12px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              flexShrink: '0'
            }}>
              {dealer.logoUrl ? (
                <img src={dealer.logoUrl} alt={dealer.brand?.name} style={{ maxWidth: '85%', maxHeight: '85%', objectFit: 'contain' }} />
              ) : (
                <Building2 size={32} style={{ color: '#94a3b8' }} />
              )}
            </div>
            <div>
              <span style={{ 
                fontSize: '0.72rem', 
                fontWeight: '800', 
                background: 'rgba(212, 175, 55, 0.1)', 
                color: '#b38e47', 
                padding: '3px 8px', 
                borderRadius: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                {dealer.brand?.name || 'Kaleseramik'} YETKİLİ SATICISI
              </span>
              <h1 style={{ fontSize: '1.45rem', fontWeight: '800', margin: '4px 0 2px 0', color: '#0f172a' }}>{dealer.name}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: '#64748b' }}>
                <MapPin size={13} style={{ color: '#b38e47' }} />
                <span>{dealer.district}, {dealer.city}</span>
              </div>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <a 
              href={`https://wa.me/${dealer.phone.replace(/[\s\-\(\)\+]/g, '')}?text=Merhaba%2C%20SeramikBak%20profil%20sayfan%C4%B1zdan%20ula%C5%9F%C4%B1yorum.%20Showroom%27daki%20seramikleriniz%20hakk%C4%B1nda%20bilgi%20alabilir%20miyim%3F`} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 18px',
                background: '#e6f7ed',
                color: '#25d366',
                borderRadius: '10px',
                fontWeight: '700',
                fontSize: '0.85rem',
                textDecoration: 'none',
                border: '1px solid rgba(37, 211, 102, 0.2)',
                transition: 'all 0.2s'
              }}
            >
              <MessageSquare size={16} />
              WhatsApp Destek
            </a>
            <a 
              href={`https://www.google.com/maps/dir/?api=1&destination=${dealer.lat},${dealer.lng}`} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 18px',
                background: '#f1f5f9',
                color: '#1e293b',
                borderRadius: '10px',
                fontWeight: '700',
                fontSize: '0.85rem',
                textDecoration: 'none',
                border: '1px solid #cbd5e1',
                transition: 'all 0.2s'
              }}
            >
              <Compass size={16} />
              Yol Tarifi
            </a>
          </div>
        </div>

        {/* Showroom & Content Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
          gap: '32px'
        }} className="showroom-main-grid">
          
          {/* LEFT COLUMN: 3D TOUR & PHOTOS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Gallery Card */}
            <div style={{
              background: '#fff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '24px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              {/* Tab Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #f1f5f9',
                paddingBottom: '12px'
              }}>
                <span style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a' }}>Showroom Deneyimi</span>
                
                {/* Toggles */}
                {dealer.virtualTourUrl && images.length > 0 && (
                  <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '8px', gap: '2px' }}>
                    <button 
                      onClick={() => setGalleryTab('3d')}
                      style={{
                        padding: '6px 12px',
                        background: galleryTab === '3d' ? '#fff' : 'transparent',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        color: galleryTab === '3d' ? '#b38e47' : '#64748b',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        boxShadow: galleryTab === '3d' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none'
                      }}
                    >
                      <Sparkles size={12} />
                      3D Sanal Tur
                    </button>
                    <button 
                      onClick={() => setGalleryTab('photos')}
                      style={{
                        padding: '6px 12px',
                        background: galleryTab === 'photos' ? '#fff' : 'transparent',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        color: galleryTab === 'photos' ? '#b38e47' : '#64748b',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        boxShadow: galleryTab === 'photos' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none'
                      }}
                    >
                      <ImageIcon size={12} />
                      Fotoğraflar
                    </button>
                  </div>
                )}
              </div>

              {/* Tab Content */}
              {galleryTab === '3d' && dealer.virtualTourUrl ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{
                    width: '100%',
                    height: '420px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    background: '#000',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
                  }}>
                    <iframe 
                      src={dealer.virtualTourUrl} 
                      width="100%" 
                      height="100%" 
                      style={{ border: 'none' }}
                      allowFullScreen
                    />
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', textAlign: 'center', display: 'block' }}>
                    Showroom içinde gezinmek için tıklayıp sürükleyin, ilerlemek için zemin noktalarına dokunun.
                  </span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {images.length > 0 ? (
                    <>
                      <div style={{
                        width: '100%',
                        height: '350px',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        position: 'relative',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
                      }}>
                        <img 
                          src={images[activePhotoIndex] || images[0]} 
                          alt={`${dealer.name} Showroom`} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                      </div>
                      
                      {images.length > 1 && (
                        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                          {images.map((img, idx) => (
                            <button 
                              key={idx}
                              onClick={() => setActivePhotoIndex(idx)}
                              style={{
                                width: '70px',
                                height: '50px',
                                padding: '0',
                                borderRadius: '6px',
                                overflow: 'hidden',
                                flexShrink: '0',
                                cursor: 'pointer',
                                border: activePhotoIndex === idx ? '2.5px solid #b38e47' : '2.5px solid transparent',
                                opacity: activePhotoIndex === idx ? 1 : 0.6,
                                transition: 'all 0.2s'
                              }}
                            >
                              <img src={img} alt="Showroom Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '250px',
                      color: '#94a3b8',
                      gap: '8px'
                    }}>
                      <ImageIcon size={48} strokeWidth={1.5} />
                      <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Showroom görselleri yakında eklenecektir.</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Special Concepts Card */}
            {concepts.length > 0 && (
              <div style={{
                background: '#fff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                padding: '24px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
              }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#0f172a', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  Bu Showroom'da Sergilenen Özel Konseptler
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {concepts.map((concept, idx) => (
                    <span 
                      key={idx}
                      style={{
                        fontSize: '0.76rem',
                        fontWeight: '700',
                        background: 'rgba(212,175,55,0.08)',
                        color: '#b38e47',
                        padding: '6px 14px',
                        borderRadius: '20px',
                        border: '1px solid rgba(212,175,55,0.15)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      ✨ {concept.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: CONTACT INFO & QUOTE REQUEST */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Info and hours card */}
            <div style={{
              background: '#fff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '24px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>İletişim & Konum Bilgileri</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <MapPin size={16} style={{ color: '#b38e47', marginTop: '3px', flexShrink: 0 }} />
                  <div>
                    <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'block', fontWeight: '600' }}>Adres</span>
                    <span style={{ fontSize: '0.85rem', color: '#334155' }}>{dealer.address} • {dealer.district}, {dealer.city}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <Phone size={16} style={{ color: '#b38e47', marginTop: '3px', flexShrink: 0 }} />
                  <div>
                    <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'block', fontWeight: '600' }}>Telefon</span>
                    <a href={`tel:${dealer.phone}`} style={{ fontSize: '0.85rem', color: '#334155', textDecoration: 'none', fontWeight: '700' }}>{dealer.phone}</a>
                  </div>
                </div>

                {dealer.email && (
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <Mail size={16} style={{ color: '#b38e47', marginTop: '3px', flexShrink: 0 }} />
                    <div>
                      <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'block', fontWeight: '600' }}>E-Posta</span>
                      <a href={`mailto:${dealer.email}`} style={{ fontSize: '0.85rem', color: '#334155', textDecoration: 'none' }}>{dealer.email}</a>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                  <Clock size={16} style={{ color: '#b38e47', marginTop: '3px', flexShrink: 0 }} />
                  <div>
                    <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'block', fontWeight: '600' }}>Çalışma Saatleri</span>
                    <span style={{ fontSize: '0.82rem', color: '#334155', fontWeight: '600' }}>Her gün: 09:00 – 19:00</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct lead quote form */}
            <div style={{
              background: '#fff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '24px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
            }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' }}>Fiyat Teklifi ve Bilgi Alın</h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 16px 0' }}>
                Aşağıdaki formu doldurarak bu bayiden ilgilendiğiniz seramik ürünleri için palet bazında özel teklif veya showroom randevusu isteyin.
              </p>

              <form onSubmit={handleLeadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {successMsg && (
                  <div style={{
                    background: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    color: '#10b981',
                    borderRadius: '8px',
                    padding: '12px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px'
                  }}>
                    <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{successMsg}</span>
                  </div>
                )}

                {errorMsg && (
                  <div style={{
                    background: '#fef2f2',
                    border: '1px solid #fca5a5',
                    color: '#ef4444',
                    borderRadius: '8px',
                    padding: '12px',
                    fontSize: '0.8rem',
                    fontWeight: '600'
                  }}>
                    ⚠️ {errorMsg}
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569' }}>Adınız Soyadınız *</label>
                  <input 
                    type="text" 
                    value={clientName} 
                    onChange={(e) => setClientName(e.target.value)} 
                    placeholder="Örn: Ahmet Yılmaz"
                    required
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569' }}>Telefon Numaranız *</label>
                  <input 
                    type="tel" 
                    value={clientPhone} 
                    onChange={(e) => setClientPhone(e.target.value)} 
                    placeholder="Örn: 0532 123 45 67"
                    required
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569' }}>E-Posta Adresiniz *</label>
                  <input 
                    type="email" 
                    value={clientEmail} 
                    onChange={(e) => setClientEmail(e.target.value)} 
                    placeholder="Örn: ahmet@gmail.com"
                    required
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>

                {products.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569' }}>İlgilendiğiniz Ürün *</label>
                    <select 
                      value={selectedProductId} 
                      onChange={(e) => setSelectedProductId(e.target.value)} 
                      required
                      style={{
                        padding: '10px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.85rem',
                        background: '#fff'
                      }}
                    >
                      {products.map(prod => (
                        <option key={prod.id} value={prod.id}>{prod.name} ({prod.code})</option>
                      ))}
                    </select>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569' }}>Talebiniz / Notlar</label>
                  <textarea 
                    value={notes} 
                    onChange={(e) => setNotes(e.target.value)} 
                    placeholder="Metraj miktarı (m²), aradığınız ebat veya teslimat adresi gibi ek taleplerinizi buraya yazabilirsiniz..."
                    rows={3}
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  style={{
                    marginTop: '8px',
                    background: '#b38e47',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px',
                    fontWeight: '700',
                    fontSize: '0.9rem',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'background 0.2s',
                    boxShadow: '0 4px 6px rgba(179, 142, 71, 0.15)'
                  }}
                  onMouseEnter={(e) => { if(!loading) e.target.style.background = '#997535'; }}
                  onMouseLeave={(e) => { if(!loading) e.target.style.background = '#b38e47'; }}
                >
                  {loading ? (
                    <span>Gönderiliyor...</span>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>Teklif Talebi Gönder</span>
                    </>
                  )}
                </button>
              </form>
            </div>

          </div>

        </div>

      </div>
      
      {/* Dynamic Style overrides for responsive Grid */}
      <style jsx global>{`
        @media (max-width: 900px) {
          .showroom-main-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
