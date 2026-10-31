'use client';

import { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  X, 
  Trash2, 
  Send, 
  FileText, 
  CheckCircle, 
  MapPin, 
  Plus, 
  Minus, 
  Building2, 
  Calculator,
  Phone,
  MessageCircle
} from 'lucide-react';
import TileVisualPreview from './TileVisualPreview';
import { exportMetrajReportToPdf } from '@/lib/pdfReportExporter';
import { TURKEY_CITIES } from '@/lib/turkeyCities';

export default function QuoteCartDrawer({
  isOpen,
  onClose,
  cartItems = [],
  onRemoveItem,
  onUpdateQuantity,
  onClearCart,
  userLocationName = 'İstanbul',
  userCoords
}) {
  const [activeStep, setActiveStep] = useState('list'); // 'list' | 'form' | 'success'
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [projectName, setProjectName] = useState('Ev Tadilatı / Banyo Yenileme');
  const [projectNotes, setProjectNotes] = useState('');
  const [requestUsta, setRequestUsta] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccessCode, setSubmitSuccessCode] = useState('');

  // Konumdaki yetkili bayiler
  const [nearbyDealers, setNearbyDealers] = useState([]);
  const [selectedDealerId, setSelectedDealerId] = useState('');
  const [isLoadingDealers, setIsLoadingDealers] = useState(false);

  // Otomatik olarak kullanıcının bulunduğu şehirdeki yetkili bayileri yükle
  useEffect(() => {
    if (!isOpen) return;

    let lat = userCoords?.lat;
    let lng = userCoords?.lng;

    if (!lat || !lng) {
      const foundCity = TURKEY_CITIES.find(
        (c) => c.name.toLowerCase() === (userLocationName || '').toLowerCase()
      );
      if (foundCity) {
        lat = foundCity.lat;
        lng = foundCity.lng;
      } else {
        lat = 41.0082;
        lng = 28.9784;
      }
    }

    const firstProductBrandId = cartItems[0]?.brandId || cartItems[0]?.brand?.id || '';

    setIsLoadingDealers(true);
    const url = firstProductBrandId
      ? `/api/dealers/nearest?brandId=${encodeURIComponent(firstProductBrandId)}&lat=${lat}&lng=${lng}`
      : `/api/dealers/nearest?lat=${lat}&lng=${lng}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setNearbyDealers(data);
          setSelectedDealerId(data[0].id);
        } else {
          // Marka özelinde yoksa genel en yakın bayileri getir
          fetch(`/api/dealers/nearest?lat=${lat}&lng=${lng}`)
            .then((r) => r.json())
            .then((allData) => {
              if (Array.isArray(allData) && allData.length > 0) {
                setNearbyDealers(allData);
                setSelectedDealerId(allData[0].id);
              } else {
                setNearbyDealers([]);
              }
            });
        }
      })
      .catch((err) => {
        console.error('Failed to load nearby dealers for quote cart:', err);
      })
      .finally(() => {
        setIsLoadingDealers(false);
      });
  }, [isOpen, userLocationName, userCoords, cartItems]);

  if (!isOpen) return null;

  // Toplam m2
  const totalM2 = cartItems.reduce((acc, item) => acc + (item.quantityM2 || 25), 0);
  const activeDealer = nearbyDealers.find((d) => d.id === selectedDealerId) || nearbyDealers[0];

  const handleSubmitQuote = async (e) => {
    e.preventDefault();
    if (!clientName || !clientPhone) {
      alert('Lütfen adınızı ve telefon numaranızı giriniz.');
      return;
    }

    const targetDealer = activeDealer;
    if (!targetDealer) {
      alert('Lütfen teklif iletilecek yetkili bayiyi seçiniz.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Seçilen yetkili bayinin portalına lead oluştur
      const res = await fetch('/api/leads/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: cartItems[0]?.id || null,
          dealerId: targetDealer.id,
          clientName,
          clientPhone,
          clientEmail,
          notes: `[SEPET TEKLİF LİSTESİ] ${projectName} (${userLocationName}) - ${cartItems.length} Kalem Seramik: ` + 
                 cartItems.map(c => `${c.name} (${c.quantityM2 || 25}m²)`).join(', ') + 
                 (projectNotes ? ` | Not: ${projectNotes}` : ''),
          requestedUsta: requestUsta,
          projectDimensions: `${totalM2} m² Toplam Alan`
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const randomCode = 'SB-' + Math.floor(100000 + Math.random() * 900000);
        setSubmitSuccessCode(randomCode);
        setActiveStep('success');
      } else {
        alert(data.error || 'Teklif talebi bayiye iletilemedi. Lütfen bilgilerinizi kontrol ediniz.');
      }
    } catch (err) {
      console.error('Quote submit error:', err);
      alert('Teklif gönderilirken bir hata oluştu, lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadPdf = () => {
    exportMetrajReportToPdf({
      projectName: projectName || 'Seramik Yenileme Projesi',
      clientName: clientName || 'SeramikBak Ziyaretçisi',
      clientCity: userLocationName || 'İstanbul',
      clientPhone,
      products: cartItems,
      calcSummary: {
        adhesiveBags: Math.ceil(totalM2 * 0.2), // ~5kg per m2 -> 25kg bags
        groutBags: Math.ceil(totalM2 * 0.08),
        wastagePercent: 10
      },
      notes: projectNotes
    });
  };

  return (
    <div 
      className="quote-cart-overlay" 
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 999999,
        display: 'flex',
        justifyContent: 'flex-end',
        animation: 'fadeIn 0.2s ease'
      }}
    >
      <div 
        className="quote-cart-drawer" 
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '460px',
          height: '100%',
          background: '#ffffff',
          boxShadow: '-10px 0 30px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Drawer Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #e2e8f0',
          background: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #b38e47 0%, #d4af37 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(179,142,71,0.25)'
            }}>
              <ShoppingBag size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: '#0f172a' }}>
                Teklif & Numune Sepeti
              </h3>
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                {cartItems.length} Kalem Seramik Seçildi • <MapPin size={11} style={{ display: 'inline', color: '#b38e47' }} /> {userLocationName}
              </span>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '8px',
              padding: '6px',
              cursor: 'pointer',
              color: '#475569'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {activeStep === 'list' && (
            <>
              {cartItems.length === 0 ? (
                <div style={{
                  padding: '60px 20px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px',
                  color: '#94a3b8'
                }}>
                  <ShoppingBag size={48} strokeWidth={1.5} />
                  <h4 style={{ margin: 0, color: '#0f172a', fontSize: '1rem', fontWeight: '800' }}>
                    Sepetinizde Henüz Karo Yok
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.82rem', maxWidth: '280px', lineHeight: '1.5' }}>
                    Katalogdan beğendiğiniz seramik modellerini <strong>"+ Teklif Listesine Ekle"</strong> butonuyla buraya toplayabilir, tek tıkla bayilerden fiyat teklifi alabilirsiniz.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {cartItems.map((item, idx) => {
                    const m2 = item.quantityM2 || 25;
                    const estimatedBoxes = Math.ceil(m2 / 1.44);
                    return (
                      <div 
                        key={item.id || idx}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px',
                          padding: '12px',
                          display: 'flex',
                          gap: '12px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                        }}
                      >
                        {/* Thumbnail */}
                        <div style={{ width: '64px', height: '64px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, border: '1px solid #f1f5f9' }}>
                          <TileVisualPreview
                            style={item.style}
                            color={item.color}
                            finish={item.finish}
                            width={item.width}
                            height={item.height}
                            imageUrl={item.imageUrl}
                          />
                        </div>

                        {/* Details */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ fontWeight: '800', fontSize: '0.88rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {item.name}
                            </div>
                            <button
                              type="button"
                              onClick={() => onRemoveItem && onRemoveItem(item.id)}
                              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }}
                              title="Listeden Kaldır"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                          
                          <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                            {item.brand?.name || item.brand || 'Seramik'} • {item.width}x{item.height} cm • {item.finish}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
                            {/* m2 Counter */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f8fafc', padding: '2px 6px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                              <button
                                type="button"
                                onClick={() => onUpdateQuantity && onUpdateQuantity(item.id, Math.max(5, m2 - 5))}
                                style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                              >
                                <Minus size={11} />
                              </button>
                              <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#0f172a', minWidth: '36px', textAlign: 'center' }}>
                                {m2} m²
                              </span>
                              <button
                                type="button"
                                onClick={() => onUpdateQuantity && onUpdateQuantity(item.id, m2 + 5)}
                                style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                              >
                                <Plus size={11} />
                              </button>
                            </div>

                            {/* Box info & quote readiness */}
                            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
                              <span style={{ 
                                fontSize: '0.74rem', 
                                fontWeight: '800', 
                                color: '#0f172a',
                                background: '#f8fafc',
                                padding: '2px 8px',
                                borderRadius: '6px',
                                border: '1px solid #e2e8f0',
                                whiteSpace: 'nowrap'
                              }}>
                                ~{estimatedBoxes} Kutu
                              </span>
                              <span style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '2px', fontWeight: '600' }}>
                                Teklif Kapsamında
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {activeStep === 'form' && (
            <form onSubmit={handleSubmitQuote} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Yetkili Bayi Seçim ve Entegrasyon Kartı */}
              <div style={{
                padding: '12px 14px',
                background: '#f8fafc',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.80rem', fontWeight: '800', color: '#0f172a' }}>
                    <MapPin size={14} style={{ color: '#b38e47' }} />
                    <span>Konumunuz: <strong>{userLocationName}</strong></span>
                  </div>
                  <span style={{ fontSize: '0.68rem', color: '#059669', background: '#ecfdf5', padding: '2px 8px', borderRadius: '10px', fontWeight: '700' }}>
                    ✓ Bayi Portalı Entegre
                  </span>
                </div>

                <div>
                  <label style={{ fontSize: '0.74rem', fontWeight: '800', color: '#334155', display: 'block', marginBottom: '5px' }}>
                    Teklif İletilecek Yetkili Bayi Showroomu *
                  </label>
                  {isLoadingDealers ? (
                    <div style={{ fontSize: '0.76rem', color: '#64748b', padding: '10px', background: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1', textAlign: 'center' }}>
                      Bölgenizdeki yetkili bayiler taranıyor...
                    </div>
                  ) : nearbyDealers.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <select
                        value={selectedDealerId}
                        onChange={(e) => setSelectedDealerId(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '9px 10px',
                          borderRadius: '8px',
                          border: '1.5px solid #cbd5e1',
                          fontSize: '0.80rem',
                          fontWeight: '700',
                          color: '#0f172a',
                          background: '#ffffff',
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        {nearbyDealers.map(d => (
                          <option key={d.id} value={d.id}>
                            {d.name} ({d.brand?.name || 'Yetkili Bayi'}) • {d.district ? `${d.district}, ` : ''}{d.city} {d.distanceKm ? `(~${d.distanceKm} km)` : ''}
                          </option>
                        ))}
                      </select>

                      {/* Selected dealer mini details */}
                      {(() => {
                        const cur = activeDealer;
                        if (!cur) return null;
                        return (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            fontSize: '0.70rem',
                            color: '#475569',
                            background: '#ffffff',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0',
                            fontWeight: '600'
                          }}>
                            <span>🏢 {cur.name} ({cur.brand?.name})</span>
                            <span>📍 {cur.district ? `${cur.district}, ` : ''}{cur.city} {cur.distanceKm ? `(~${cur.distanceKm} km)` : ''}</span>
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.74rem', color: '#b45309', padding: '8px', background: '#fef3c7', borderRadius: '8px', border: '1px solid #fde68a' }}>
                      {userLocationName} bölgesinde doğrudan kayıtlı bayi bulunamadı; en yakın bölge temsilcisine yönlendirilecektir.
                    </div>
                  )}
                </div>

                <div style={{ fontSize: '0.67rem', color: '#64748b', lineHeight: '1.4', borderTop: '1px dashed #cbd5e1', paddingTop: '6px' }}>
                  ℹ️ <strong>SeramikBak Doğrudan Satıcı Değildir:</strong> SeramikBak aracılık veya komisyon almaz. Talebiniz ve malzeme listeniz doğrudan yukarıda seçtiğiniz yetkili bayinin kurumsal portalına iletilir; fiyat teklifi ve stok temini bayi tarafından sunulur.
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '800', color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Ad Soyad *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ahmet Yılmaz"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.82rem', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '800', color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Telefon *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="0555 123 4567"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.82rem', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '800', color: '#334155', display: 'block', marginBottom: '4px' }}>
                    E-Posta
                  </label>
                  <input
                    type="email"
                    placeholder="ornek@mail.com"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.82rem', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '800', color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Proje Adı / Mahalle
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.82rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '800', color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Özel Not / Nakliye / Kat Bilgisi
                </label>
                <textarea
                  rows={2}
                  placeholder="Örn: 3. kat asansörsüz, yapıştırıcı dahil fiyat rica ediyoruz..."
                  value={projectNotes}
                  onChange={(e) => setProjectNotes(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.82rem', outline: 'none' }}
                />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.80rem', color: '#334155', fontWeight: '600', padding: '8px 10px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <input
                  type="checkbox"
                  checked={requestUsta}
                  onChange={(e) => setRequestUsta(e.target.checked)}
                  style={{ accentColor: '#b38e47', width: '16px', height: '16px' }}
                />
                <span>Usta uygulama desteği & keşif de talep ediyorum</span>
              </label>

              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setActiveStep('list')}
                  style={{ flex: 1, padding: '12px', background: '#f1f5f9', border: 'none', borderRadius: '10px', fontWeight: '700', color: '#475569', cursor: 'pointer' }}
                >
                  Geri
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !activeDealer}
                  style={{ flex: 2, padding: '12px', background: 'linear-gradient(135deg, #b38e47 0%, #987532 100%)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Send size={15} />
                  <span>{isSubmitting ? 'İletiliyor...' : 'Teklif Talebini Gönder'}</span>
                </button>
              </div>
            </form>
          )}

          {activeStep === 'success' && (
            <div style={{ textAlign: 'center', padding: '30px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle size={32} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', color: '#0f172a' }}>
                Talebiniz Bayi Portalına İletildi!
              </h3>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b', maxWidth: '320px', lineHeight: '1.5' }}>
                {activeDealer ? (
                  <>Seçtiğiniz <strong>{activeDealer.name}</strong> ({activeDealer.brand?.name}) yetkili bayi portalına malzeme listeniz başarıyla iletildi. Yetkili bayi doğrudan sizinle iletişime geçecektir.</>
                ) : (
                  <>Yetkili bayi temsilcisi en kısa sürede özel iskonto ve stok bilgisiyle dönüş yapacaktır.</>
                )}
              </p>

              <div style={{ padding: '8px 16px', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1', fontSize: '0.80rem', fontWeight: '800', color: '#b38e47' }}>
                Teklif Referans No: {submitSuccessCode}
              </div>

              {/* Hızlı WhatsApp / İletişim Aksiyonları */}
              {activeDealer?.phone && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', marginTop: '6px' }}>
                  <a
                    href={`https://wa.me/${activeDealer.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                      `Merhaba ${activeDealer.name}, SeramikBak üzerinden ${submitSuccessCode} referans kodlu ${cartItems.length} kalemlik seramik teklif talebimi oluşturdum. Detayları ve fiyatlandırmayı görüşmek istiyorum.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      width: '100%',
                      padding: '11px',
                      background: '#25D366',
                      color: '#ffffff',
                      borderRadius: '10px',
                      fontWeight: '800',
                      fontSize: '0.84rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      textDecoration: 'none',
                      boxShadow: '0 4px 12px rgba(37,211,102,0.25)'
                    }}
                  >
                    <MessageCircle size={16} />
                    <span>Yetkili Bayiye WhatsApp'tan Ulaş</span>
                  </a>

                  <a
                    href={`tel:${activeDealer.phone.replace(/\s+/g, '')}`}
                    style={{
                      width: '100%',
                      padding: '9px',
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      color: '#0f172a',
                      borderRadius: '10px',
                      fontWeight: '700',
                      fontSize: '0.80rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      textDecoration: 'none'
                    }}
                  >
                    <Phone size={14} style={{ color: '#b38e47' }} />
                    <span>Bayiyi Telefonla Ara: {activeDealer.phone}</span>
                  </a>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  style={{
                    width: '100%',
                    padding: '11px',
                    borderRadius: '10px',
                    border: '1.5px solid #b38e47',
                    background: '#fffdfa',
                    color: '#b38e47',
                    fontWeight: '800',
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <FileText size={16} />
                  <span>Keşif & Malzeme Listesi PDF İndir</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (onClearCart) onClearCart();
                    onClose();
                  }}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '10px',
                    border: 'none',
                    background: '#f1f5f9',
                    color: '#475569',
                    fontWeight: '700',
                    fontSize: '0.80rem',
                    cursor: 'pointer'
                  }}
                >
                  Sepeti Kapat ve Aramaya Devam Et
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Bottom Actions */}
        {activeStep === 'list' && cartItems.length > 0 && (
          <div style={{
            padding: '16px 20px',
            borderTop: '1px solid #e2e8f0',
            background: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Toplam Metraj:</div>
                <div style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0f172a' }}>
                  {totalM2} m² <span style={{ fontSize: '0.80rem', fontWeight: '700', color: '#b38e47', marginLeft: '6px' }}>({cartItems.length} Kalem Seramik)</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDownloadPdf}
                title="Keşif Özeti PDF İndir"
                style={{
                  padding: '8px 12px',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  color: '#334155',
                  fontWeight: '700',
                  fontSize: '0.76rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <FileText size={14} style={{ color: '#b38e47' }} />
                <span>PDF İndir</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setActiveStep('form')}
              style={{
                width: '100%',
                padding: '14px',
                background: 'linear-gradient(135deg, #b38e47 0%, #987532 100%)',
                border: 'none',
                borderRadius: '12px',
                color: '#ffffff',
                fontWeight: '800',
                fontSize: '0.92rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(179,142,71,0.3)'
              }}
            >
              <Send size={16} />
              <span>Bayilerden Fiyat Teklifi İste</span>
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
