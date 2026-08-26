'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  RefreshCw, 
  Search, 
  Plus, 
  AlertTriangle, 
  Package, 
  MessageSquare, 
  Phone, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  X, 
  Building2, 
  Sparkles, 
  Layers,
  ArrowRight,
  Filter,
  Flame,
  ShieldCheck
} from 'lucide-react';

const TURKEY_CITIES = [
  'Tüm İller', 'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya',
  'Gaziantep', 'Kocaeli', 'Kayseri', 'Mersin', 'Eskişehir', 'Diyarbakır', 'Samsun', 'Denizli'
];

export default function DealerStockExchangePage() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTypeTab, setActiveTypeTab] = useState('ALL'); // 'ALL' | 'NEED_STOCK' | 'HAVE_STOCK'
  const [selectedCity, setSelectedCity] = useState('Tüm İller');
  const [searchQuery, setSearchQuery] = useState('');
  
  // New Offer Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formType, setFormType] = useState('NEED_STOCK');
  const [formProductName, setFormProductName] = useState('');
  const [formBrandName, setFormBrandName] = useState('NG Kütahya Seramik');
  const [formQuantityM2, setFormQuantityM2] = useState('20');
  const [formCity, setFormCity] = useState('İstanbul');
  const [formDistrict, setFormDistrict] = useState('Kadıköy');
  const [formUrgent, setFormUrgent] = useState(true);
  const [formNotes, setFormNotes] = useState('');
  const [formContactName, setFormContactName] = useState('');
  const [formContactPhone, setFormContactPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  useEffect(() => {
    fetchStockOffers();
  }, [activeTypeTab, selectedCity]);

  const fetchStockOffers = async () => {
    setLoading(true);
    try {
      let url = `/api/b2b/stock-exchange?type=${activeTypeTab}&city=${encodeURIComponent(selectedCity === 'Tüm İller' ? 'ALL' : selectedCity)}`;
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
      
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setOffers(data.offers || []);
      }
    } catch (err) {
      console.error('Fetch Stock Offers Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchStockOffers();
  };

  const handleCreateOffer = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');

    if (!formProductName || !formContactName || !formContactPhone || !formCity) {
      setSubmitError('Lütfen Seramik Adı, Şehir, İletişim Kişisi ve Telefon alanlarını doldurun.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/b2b/stock-exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: formType,
          productName: formProductName,
          brandName: formBrandName,
          quantityM2: parseInt(formQuantityM2, 10) || 10,
          city: formCity,
          district: formDistrict,
          urgent: formUrgent,
          notes: formNotes,
          contactName: formContactName,
          contactPhone: formContactPhone
        })
      });

      const data = await res.json();
      if (data.success) {
        setSubmitSuccess('B2B Stok Takas İlanınız Başarıyla Yayınlandı!');
        setTimeout(() => {
          setShowCreateModal(false);
          setSubmitSuccess('');
          setFormProductName('');
          setFormNotes('');
          fetchStockOffers();
        }, 1200);
      } else {
        setSubmitError(data.error || 'İlan kaydedilemedi.');
      }
    } catch (err) {
      console.error('Create Stock Offer Error:', err);
      setSubmitError('Bir sunucu hatası oluştu.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkMatched = async (offerId) => {
    try {
      const res = await fetch('/api/b2b/stock-exchange', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: offerId, status: 'MATCHED' })
      });
      const data = await res.json();
      if (data.success) {
        fetchStockOffers();
      }
    } catch (err) {
      console.error('Update status error:', err);
    }
  };

  const needCount = offers.filter(o => o.type === 'NEED_STOCK').length;
  const haveCount = offers.filter(o => o.type === 'HAVE_STOCK').length;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #090d16 0%, #0f172a 100%)',
      color: '#ffffff',
      fontFamily: 'Outfit, sans-serif',
      paddingBottom: '80px'
    }}>
      {/* Header Banner */}
      <div style={{
        background: 'radial-gradient(circle at 50% 0%, rgba(212,175,55,0.15) 0%, rgba(15,23,42,0.95) 70%)',
        borderBottom: '1px solid rgba(212,175,55,0.3)',
        padding: '40px 24px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(212, 175, 55, 0.15)',
            border: '1px solid rgba(212, 175, 55, 0.4)',
            color: '#d4af37',
            padding: '6px 16px',
            borderRadius: '20px',
            fontWeight: '800',
            fontSize: '0.82rem',
            marginBottom: '16px'
          }}>
            <Building2 size={16} />
            <span>SeramikBak B2B Yetkili Bayi Ağı</span>
          </div>

          <h1 style={{ fontSize: '2.2rem', fontWeight: '900', margin: '0 0 12px 0', letterSpacing: '-0.5px' }}>
            🤝 Bayiler Arası <span style={{ background: 'linear-gradient(135deg, #d4af37 0%, #fef08a 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Stok Borsa & Takas Ağı</span>
          </h1>
          <p style={{ fontSize: '0.95rem', color: '#cbd5e1', maxWidth: '750px', margin: '0 auto', lineHeight: '1.6' }}>
            Eksik seramik projelerinizi diğer bayilerin stoklarından tamamlayın; elinizdeki fazla stokları takas yapıp anında nakite çevirin!
          </p>

          {/* Stats Bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            marginTop: '32px',
            textAlign: 'left'
          }}>
            <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '16px', padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.8rem', color: '#f87171', fontWeight: '800' }}>🚨 Acil Stok Aranıyor</span>
                <Flame size={18} style={{ color: '#ef4444' }} />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#ffffff' }}>{needCount} İlan</div>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Müşteri bekleyen acil eksik talepleri</span>
            </div>

            <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '16px', padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: '800' }}>📦 Fazla / Takaslık Stok</span>
                <Package size={18} style={{ color: '#10b981' }} />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#ffffff' }}>{haveCount} İlan</div>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Depoda teslime hazır fazla stoklar</span>
            </div>

            <div style={{ background: 'rgba(212, 175, 55, 0.12)', border: '1px solid rgba(212, 175, 55, 0.3)', borderRadius: '16px', padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.8rem', color: '#d4af37', fontWeight: '800' }}>⚡ Ort. Eşleşme Süresi</span>
                <ShieldCheck size={18} style={{ color: '#d4af37' }} />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#ffffff' }}>~4 Saniye</div>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Çapraz bayi ile WhatsApp bağlantısı</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div style={{ maxWidth: '1100px', margin: '30px auto', padding: '0 24px' }}>
        
        {/* Controls Toolbar */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          background: 'rgba(30, 41, 59, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          padding: '16px 20px',
          backdropFilter: 'blur(12px)',
          marginBottom: '24px'
        }}>
          {/* Type Tabs */}
          <div style={{ display: 'flex', gap: '8px', background: 'rgba(15, 23, 42, 0.8)', padding: '4px', borderRadius: '12px' }}>
            {[
              { id: 'ALL', label: 'Tüm İlanlar' },
              { id: 'NEED_STOCK', label: '🚨 Stok Aranıyor' },
              { id: 'HAVE_STOCK', label: '📦 Takaslık Mal Var' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTypeTab(tab.id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  background: activeTypeTab === tab.id ? 'linear-gradient(135deg, #d4af37 0%, #b38e47 100%)' : 'transparent',
                  color: activeTypeTab === tab.id ? '#000' : '#cbd5e1',
                  fontWeight: '800',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Filters & Action Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              style={{
                background: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff',
                padding: '10px 14px',
                borderRadius: '12px',
                fontSize: '0.85rem',
                fontWeight: '600'
              }}
            >
              {TURKEY_CITIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                background: 'linear-gradient(135deg, #d4af37 0%, #b38e47 100%)',
                color: '#000',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '12px',
                fontWeight: '900',
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 16px rgba(212, 175, 55, 0.35)'
              }}
            >
              <Plus size={18} />
              <span>Stok / Takas İlanı Aç</span>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#cbd5e1' }}>
            <RefreshCw size={36} className="animate-spin" style={{ color: '#d4af37', marginBottom: '12px' }} />
            <p style={{ fontSize: '0.95rem', fontWeight: '600' }}>B2B Stok İlanları Yükleniyor...</p>
          </div>
        )}

        {/* Offers Grid */}
        {!loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: '20px' }}>
            {offers.map(offer => {
              const isNeed = offer.type === 'NEED_STOCK';
              const cleanPhone = (offer.contactPhone || '').replace(/[^\d]/g, '');
              const waText = encodeURIComponent(`Merhaba ${offer.contactName}, SeramikBak B2B Stok Borsası'ndaki "${offer.productName}" ilanınız için ulaşıyorum.`);
              const waUrl = `https://wa.me/90${cleanPhone.slice(-10)}?text=${waText}`;

              return (
                <div
                  key={offer.id}
                  style={{
                    background: 'rgba(30, 41, 59, 0.7)',
                    border: isNeed ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(16, 185, 129, 0.4)',
                    borderRadius: '20px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    backdropFilter: 'blur(8px)',
                    transition: 'transform 0.2s ease',
                    boxShadow: isNeed ? '0 8px 24px rgba(239,68,68,0.1)' : '0 8px 24px rgba(16,185,129,0.1)'
                  }}
                >
                  <div>
                    {/* Header Badge */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '8px',
                        fontSize: '0.72rem',
                        fontWeight: '900',
                        background: isNeed ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                        color: isNeed ? '#f87171' : '#34d399',
                        border: isNeed ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(16,185,129,0.4)'
                      }}>
                        {isNeed ? '🚨 STOK ARANACAK (EKSİK HASSAS)' : '📦 FAZLA STOK / TAKASLIK'}
                      </span>

                      {offer.urgent && (
                        <span style={{ fontSize: '0.7rem', color: '#fef08a', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          ⚡ 24 Saat İçi Acil
                        </span>
                      )}
                    </div>

                    {/* Product Name & Brand */}
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: '0 0 6px 0', color: '#ffffff', lineHeight: '1.3' }}>
                      {offer.productName}
                    </h3>
                    <span style={{ fontSize: '0.8rem', color: '#d4af37', fontWeight: '700', display: 'block', marginBottom: '12px' }}>
                      {offer.brandName || 'Marka Belirtilmedi'}
                    </span>

                    {/* Meta info */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Layers size={14} style={{ color: '#94a3b8' }} />
                        <span>Miktar: <strong style={{ color: '#fff' }}>{offer.quantityM2} m²</strong></span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={14} style={{ color: '#94a3b8' }} />
                        <span>{offer.city} / {offer.district || 'Merkez'}</span>
                      </div>
                    </div>

                    {/* Notes Box */}
                    {offer.notes && (
                      <div style={{
                        background: 'rgba(15, 23, 42, 0.6)',
                        padding: '10px 12px',
                        borderRadius: '10px',
                        fontSize: '0.78rem',
                        color: '#94a3b8',
                        lineHeight: '1.4',
                        marginBottom: '16px',
                        borderLeft: '3px solid #d4af37'
                      }}>
                        "{offer.notes}"
                      </div>
                    )}
                  </div>

                  {/* Footer Action Buttons */}
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '14px', marginTop: '10px' }}>
                    <div style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: '700', marginBottom: '10px' }}>
                      👤 {offer.contactName}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: '#fff',
                          padding: '10px',
                          borderRadius: '10px',
                          fontWeight: '800',
                          fontSize: '0.8rem',
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          boxShadow: '0 4px 12px rgba(16,185,129,0.3)'
                        }}
                      >
                        <MessageSquare size={14} />
                        <span>WhatsApp</span>
                      </a>

                      <a
                        href={`tel:${offer.contactPhone}`}
                        style={{
                          background: 'rgba(255,255,255,0.1)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          color: '#fff',
                          padding: '10px',
                          borderRadius: '10px',
                          fontWeight: '700',
                          fontSize: '0.8rem',
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <Phone size={14} />
                        <span>Ara</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Offer Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: '#0f172a',
            border: '1px solid rgba(212, 175, 55, 0.4)',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '560px',
            padding: '28px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '900', color: '#fff' }}>
                ➕ Yeni B2B Stok / Takas İlanı Aç
              </h3>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {submitError && (
              <div style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid #ef4444', color: '#f87171', padding: '10px', borderRadius: '10px', fontSize: '0.82rem', marginBottom: '14px' }}>
                ⚠️ {submitError}
              </div>
            )}

            {submitSuccess && (
              <div style={{ background: 'rgba(16,185,129,0.2)', border: '1px solid #10b981', color: '#34d399', padding: '10px', borderRadius: '10px', fontSize: '0.82rem', marginBottom: '14px' }}>
                ✅ {submitSuccess}
              </div>
            )}

            <form onSubmit={handleCreateOffer} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Type Switcher */}
              <div>
                <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: '700', display: 'block', marginBottom: '6px' }}>İlan Tipi *</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setFormType('NEED_STOCK')}
                    style={{
                      padding: '12px',
                      borderRadius: '12px',
                      border: formType === 'NEED_STOCK' ? '2px solid #ef4444' : '1px solid rgba(255,255,255,0.1)',
                      background: formType === 'NEED_STOCK' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(30, 41, 59, 0.6)',
                      color: formType === 'NEED_STOCK' ? '#f87171' : '#cbd5e1',
                      fontWeight: '800',
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    🚨 Acil Stok Aranıyor (Eksik)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormType('HAVE_STOCK')}
                    style={{
                      padding: '12px',
                      borderRadius: '12px',
                      border: formType === 'HAVE_STOCK' ? '2px solid #10b981' : '1px solid rgba(255,255,255,0.1)',
                      background: formType === 'HAVE_STOCK' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(30, 41, 59, 0.6)',
                      color: formType === 'HAVE_STOCK' ? '#34d399' : '#cbd5e1',
                      fontWeight: '800',
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    📦 Fazla / Takaslık Mal Var
                  </button>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Seramik / Karo Adı ve Ebadı *</label>
                <input
                  type="text"
                  placeholder="Örn: Calacatta Gold 60x120 Rektifiyeli Porselen"
                  value={formProductName}
                  onChange={(e) => setFormProductName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', background: 'rgba(30, 41, 59, 0.9)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.86rem', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Seramik Markası</label>
                  <input
                    type="text"
                    placeholder="Örn: NG Kütahya / Vitra"
                    value={formBrandName}
                    onChange={(e) => setFormBrandName(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', background: 'rgba(30, 41, 59, 0.9)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.86rem', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Miktar (m²)</label>
                  <input
                    type="number"
                    placeholder="20"
                    value={formQuantityM2}
                    onChange={(e) => setFormQuantityM2(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', background: 'rgba(30, 41, 59, 0.9)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.86rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Şehir *</label>
                  <input
                    type="text"
                    placeholder="Örn: İstanbul"
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', background: 'rgba(30, 41, 59, 0.9)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.86rem', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: '700', display: 'block', marginBottom: '4px' }}>İlçe</label>
                  <input
                    type="text"
                    placeholder="Örn: Kadıköy"
                    value={formDistrict}
                    onChange={(e) => setFormDistrict(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', background: 'rgba(30, 41, 59, 0.9)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.86rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: '700', display: 'block', marginBottom: '4px' }}>İletişim Kişisi / Bayi *</label>
                  <input
                    type="text"
                    placeholder="Örn: Yıldız Yapı / Mehmet B."
                    value={formContactName}
                    onChange={(e) => setFormContactName(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', background: 'rgba(30, 41, 59, 0.9)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.86rem', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Telefon / WhatsApp *</label>
                  <input
                    type="tel"
                    placeholder="Örn: 0532 123 45 67"
                    value={formContactPhone}
                    onChange={(e) => setFormContactPhone(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', background: 'rgba(30, 41, 59, 0.9)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.86rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Açıklama / İhtiyaç Notu</label>
                <textarea
                  rows={2}
                  placeholder="Müşteri projesi için eksik kaldı, teslim alabiliriz veya depomuzdan verebiliriz..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', background: 'rgba(30, 41, 59, 0.9)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.82rem', boxSizing: 'border-box' }}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  background: 'linear-gradient(135deg, #d4af37 0%, #b38e47 100%)',
                  color: '#000',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '12px',
                  fontWeight: '900',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  marginTop: '8px'
                }}
              >
                {submitting ? 'Yayınlanıyor...' : '🚀 B2B İlanı Yayınla'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
