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
    <div className="profile-page-wrapper">
      {/* Header Bar */}
      <div className="profile-header-bar">
        <Link href="/" className="back-link">
          <ChevronLeft size={16} />
          Geri Dön
        </Link>
        <div className="header-title-container">
          <span className="header-title">Yetkili Bayi Profili</span>
          <span className="header-dot"></span>
        </div>
        <div style={{ width: '100px' }} className="desktop-header-spacer"></div>
      </div>

      {/* Main Container */}
      <div className="profile-main-container">
        
        {/* Profile Card & Info Header */}
        <div className="profile-banner-card animate-fade-in">
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap', zIndex: 1 }}>
            <div className="profile-logo-box">
              {dealer.logoUrl ? (
                <img src={dealer.logoUrl} alt={dealer.brand?.name} style={{ maxWidth: '85%', maxHeight: '85%', objectFit: 'contain' }} />
              ) : (
                <Building2 size={36} style={{ color: 'var(--accent-gold)' }} />
              )}
            </div>
            <div>
              <span className="profile-badge">
                {dealer.brand?.name || 'QUA Granite'} YETKİLİ SATICISI
              </span>
              <h1 className="profile-name">{dealer.name}</h1>
              <div className="profile-location">
                <MapPin size={14} style={{ color: 'var(--accent-gold)', flexShrink: 0 }} />
                <span>{dealer.district}, {dealer.city}</span>
              </div>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="profile-actions" style={{ zIndex: 1 }}>
            <a 
              href={`https://wa.me/${dealer.phone.replace(/[\s\-\(\)\+]/g, '')}?text=Merhaba%2C%20SeramikBak%20profil%20sayfan%C4%B1zdan%20ula%C5%9F%C4%B1yorum.%20Showroom%27daki%20seramikleriniz%20hakk%C4%B1nda%20bilgi%20alabilir%20miyim%3F`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-whatsapp"
            >
              <MessageSquare size={16} />
              WhatsApp Destek
            </a>
            <a 
              href={`https://www.google.com/maps/dir/?api=1&destination=${dealer.lat},${dealer.lng}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-maps"
            >
              <Compass size={16} />
              Yol Tarifi
            </a>
          </div>
        </div>

        {/* Showroom & Content Grid */}
        <div className="showroom-main-grid">
          
          {/* LEFT COLUMN: 3D TOUR & PHOTOS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Gallery Card */}
            <div className="section-glass-card">
              {/* Tab Header */}
              <div className="gallery-header-row">
                <h3 className="section-title">Showroom Deneyimi</h3>
                
                {/* Toggles */}
                {dealer.virtualTourUrl && images.length > 0 && (
                  <div className="gallery-tab-toggle">
                    <button 
                      onClick={() => setGalleryTab('3d')}
                      className={`toggle-btn ${galleryTab === '3d' ? 'active' : ''}`}
                    >
                      <Sparkles size={12} />
                      3D Sanal Tur
                    </button>
                    <button 
                      onClick={() => setGalleryTab('photos')}
                      className={`toggle-btn ${galleryTab === 'photos' ? 'active' : ''}`}
                    >
                      <ImageIcon size={12} />
                      Fotoğraflar
                    </button>
                  </div>
                )}
              </div>

              {/* Tab Content */}
              {galleryTab === '3d' && dealer.virtualTourUrl ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div className="virtual-tour-iframe-container">
                    <iframe 
                      src={dealer.virtualTourUrl} 
                      width="100%" 
                      height="100%" 
                      style={{ border: 'none' }}
                      allowFullScreen
                    />
                  </div>
                  <span className="tour-hint">
                    Showroom içinde gezinmek için tıklayıp sürükleyin, ilerlemek için zemin noktalarına dokunun.
                  </span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {images.length > 0 ? (
                    <>
                      <div className="active-photo-container">
                        <img 
                          src={images[activePhotoIndex] || images[0]} 
                          alt={`${dealer.name} Showroom`} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                      </div>
                      
                      {images.length > 1 && (
                        <div className="thumbnail-list scrollbar-hidden">
                          {images.map((img, idx) => (
                            <button 
                              key={idx}
                              onClick={() => setActivePhotoIndex(idx)}
                              className={`thumbnail-btn ${activePhotoIndex === idx ? 'active' : ''}`}
                            >
                              <img src={img} alt="Showroom Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="no-images-placeholder">
                      <ImageIcon size={48} strokeWidth={1.5} style={{ color: 'var(--accent-gold)' }} />
                      <span>Showroom görselleri yakında eklenecektir.</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Special Concepts Card */}
            {concepts.length > 0 && (
              <div className="section-glass-card">
                <h3 className="section-subtitle">
                  Bu Showroom'da Sergilenen Özel Konseptler
                </h3>
                <div className="concepts-list">
                  {concepts.map((concept, idx) => (
                    <span 
                      key={idx}
                      className="concept-badge"
                    >
                      ✨ {concept.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: CONTACT INFO & QUOTE REQUEST */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Info and hours card */}
            <div className="section-glass-card">
              <h3 className="section-title">İletişim & Konum Bilgileri</h3>
              
              <div className="info-list">
                <div className="info-item">
                  <div className="info-icon-wrapper">
                    <MapPin size={18} />
                  </div>
                  <div className="info-content">
                    <span className="info-label">Adres</span>
                    <span className="info-value">{dealer.address} • {dealer.district}, {dealer.city}</span>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon-wrapper">
                    <Phone size={18} />
                  </div>
                  <div className="info-content">
                    <span className="info-label">Telefon</span>
                    <a href={`tel:${dealer.phone}`} className="info-value tel-link">{dealer.phone}</a>
                  </div>
                </div>

                {dealer.email && (
                  <div className="info-item">
                    <div className="info-icon-wrapper">
                      <Mail size={18} />
                    </div>
                    <div className="info-content">
                      <span className="info-label">E-Posta</span>
                      <a href={`mailto:${dealer.email}`} className="info-value mail-link">{dealer.email}</a>
                    </div>
                  </div>
                )}

                <div className="info-item border-top">
                  <div className="info-icon-wrapper">
                    <Clock size={18} />
                  </div>
                  <div className="info-content">
                    <span className="info-label">Çalışma Saatleri</span>
                    <span className="info-value highlight-value">Her gün: 09:00 – 19:00</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct lead quote form */}
            <div className="section-glass-card">
              <h3 className="section-title">Fiyat Teklifi ve Bilgi Alın</h3>
              <p className="form-desc">
                Aşağıdaki formu doldurarak bu bayiden ilgilendiğiniz seramik ürünleri için palet bazında özel teklif veya showroom randevusu isteyin.
              </p>

              <form onSubmit={handleLeadSubmit} className="quote-form-element">
                {successMsg && (
                  <div className="alert-box success">
                    <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: '1px' }} />
                    <span>{successMsg}</span>
                  </div>
                )}

                {errorMsg && (
                  <div className="alert-box error">
                    <span>⚠️ {errorMsg}</span>
                  </div>
                )}

                <div className="input-group">
                  <label className="input-label">Adınız Soyadınız *</label>
                  <input 
                    type="text" 
                    value={clientName} 
                    onChange={(e) => setClientName(e.target.value)} 
                    placeholder="Örn: Ahmet Yılmaz"
                    required
                    className="form-input"
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Telefon Numaranız *</label>
                  <input 
                    type="tel" 
                    value={clientPhone} 
                    onChange={(e) => setClientPhone(e.target.value)} 
                    placeholder="Örn: 0532 123 45 67"
                    required
                    className="form-input"
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">E-Posta Adresiniz *</label>
                  <input 
                    type="email" 
                    value={clientEmail} 
                    onChange={(e) => setClientEmail(e.target.value)} 
                    placeholder="Örn: ahmet@gmail.com"
                    required
                    className="form-input"
                  />
                </div>

                {products.length > 0 && (
                  <div className="input-group">
                    <label className="input-label">İlgilendiğiniz Ürün *</label>
                    <select 
                      value={selectedProductId} 
                      onChange={(e) => setSelectedProductId(e.target.value)} 
                      required
                      className="form-select"
                    >
                      {products.map(prod => (
                        <option key={prod.id} value={prod.id}>{prod.name} ({prod.code})</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="input-group">
                  <label className="input-label">Talebiniz / Notlar</label>
                  <textarea 
                    value={notes} 
                    onChange={(e) => setNotes(e.target.value)} 
                    placeholder="Metraj miktarı (m²), aradığınız ebat veya teslimat adresi gibi ek taleplerinizi buraya yazabilirsiniz..."
                    rows={3}
                    className="form-textarea"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="btn-submit"
                >
                  {loading ? (
                    <span>Gönderiliyor...</span>
                  ) : (
                    <>
                      <Send size={15} />
                      <span>Teklif Talebi Gönder</span>
                    </>
                  )}
                </button>
              </form>
            </div>

          </div>

        </div>

      </div>

      {/* CSS Styles */}
      <style jsx>{`
        .profile-page-wrapper {
          min-height: 100vh;
          background: radial-gradient(circle at 50% 0%, #ffffff 0%, #f1f5f9 100%);
          font-family: var(--font-body), system-ui, -apple-system, sans-serif;
          color: var(--text-primary);
          padding-bottom: 60px;
        }

        .profile-header-bar {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          padding: 16px 40px;
          position: sticky;
          top: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.02);
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 18px;
          background: rgba(0, 0, 0, 0.03);
          border: 1px solid rgba(0, 0, 0, 0.06);
          border-radius: 30px;
          color: var(--text-secondary);
          font-size: 0.82rem;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-family: var(--font-title);
        }

        .back-link:hover {
          background: #ffffff;
          color: var(--accent-gold);
          border-color: rgba(179, 142, 71, 0.35);
          box-shadow: 0 8px 20px rgba(179, 142, 71, 0.1);
          transform: translateX(-4px);
        }

        .header-title-container {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .header-title {
          font-size: 0.85rem;
          font-weight: 800;
          color: var(--text-primary);
          font-family: var(--font-title);
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .header-dot {
          width: 5px;
          height: 5px;
          background: var(--accent-gold);
          border-radius: 50%;
          display: inline-block;
        }

        .profile-main-container {
          max-width: 1200px;
          margin: 36px auto 0 auto;
          padding: 0 24px;
        }

        .profile-banner-card {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          border-radius: 24px;
          padding: 36px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-left: 5px solid var(--accent-gold);
          box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.35);
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 28px;
          margin-bottom: 36px;
          position: relative;
          overflow: hidden;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .profile-banner-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 30px 60px -15px rgba(15, 23, 42, 0.4);
        }

        .profile-banner-card::before {
          content: "";
          position: absolute;
          top: -50%;
          right: -20%;
          width: 350px;
          height: 350px;
          background: radial-gradient(circle, rgba(179, 142, 71, 0.15) 0%, transparent 70%);
          pointer-events: none;
        }

        .profile-logo-box {
          width: 80px;
          height: 80px;
          border-radius: 18px;
          background: #ffffff;
          border: 2px solid rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          flex-shrink: 0;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
          transition: transform 0.3s ease;
        }

        .profile-banner-card:hover .profile-logo-box {
          transform: scale(1.03);
          border-color: rgba(179, 142, 71, 0.4);
        }

        .profile-badge {
          font-size: 0.65rem;
          font-weight: 800;
          background: rgba(179, 142, 71, 0.15);
          color: #d4af37;
          border: 1px solid rgba(179, 142, 71, 0.3);
          padding: 4px 10px;
          border-radius: 6px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          display: inline-block;
          font-family: var(--font-title);
        }

        .profile-name {
          font-size: 1.85rem;
          font-weight: 800;
          margin: 6px 0 4px 0;
          color: #ffffff;
          font-family: var(--font-title);
          letter-spacing: -0.01em;
        }

        .profile-location {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.82rem;
          color: #94a3b8;
          font-weight: 500;
        }

        .profile-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .btn-whatsapp {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: #25d366;
          color: #ffffff;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.85rem;
          text-decoration: none;
          border: none;
          box-shadow: 0 4px 14px rgba(37, 211, 102, 0.3);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .btn-whatsapp:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(37, 211, 102, 0.45);
          background: #20ba59;
        }

        .btn-maps {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: rgba(255, 255, 255, 0.08);
          color: #ffffff;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.85rem;
          text-decoration: none;
          border: 1px solid rgba(255, 255, 255, 0.15);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(4px);
        }

        .btn-maps:hover {
          transform: translateY(-2px);
          background: #ffffff;
          color: #0f172a;
          border-color: #ffffff;
          box-shadow: 0 8px 24px rgba(255, 255, 255, 0.15);
        }

        .showroom-main-grid {
          display: grid;
          grid-template-columns: 1.35fr 1fr;
          gap: 32px;
        }

        .section-glass-card {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.7);
          border-radius: 24px;
          padding: 32px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.02), 0 1px 3px rgba(0, 0, 0, 0.01);
          display: flex;
          flex-direction: column;
          gap: 20px;
          transition: all 0.3s ease;
        }

        .section-glass-card:hover {
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.04);
          border-color: rgba(255, 255, 255, 1);
        }

        .section-title {
          font-size: 1.1rem;
          font-weight: 800;
          color: var(--text-primary);
          font-family: var(--font-title);
          margin: 0;
          letter-spacing: -0.01em;
        }

        .section-subtitle {
          font-size: 0.85rem;
          font-weight: 800;
          color: var(--text-primary);
          margin: 0 0 4px 0;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-family: var(--font-title);
        }

        .gallery-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          padding-bottom: 16px;
          gap: 12px;
          flex-wrap: wrap;
        }

        .gallery-tab-toggle {
          display: flex;
          background: #e2e8f0;
          padding: 3px;
          border-radius: 10px;
          gap: 2px;
          border: 1px solid rgba(0, 0, 0, 0.02);
        }

        .toggle-btn {
          padding: 8px 16px;
          background: transparent;
          border: none;
          border-radius: 8px;
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--text-secondary);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .toggle-btn.active {
          background: #ffffff;
          color: var(--accent-gold);
          box-shadow: 0 4px 10px rgba(0,0,0,0.06);
        }

        .virtual-tour-iframe-container {
          width: 100%;
          height: 440px;
          border-radius: 18px;
          overflow: hidden;
          background: #000;
          border: 1px solid rgba(179, 142, 71, 0.2);
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
        }

        .tour-hint {
          font-size: 0.72rem;
          color: var(--text-muted);
          text-align: center;
          display: block;
          font-weight: 600;
          margin-top: 4px;
        }

        .active-photo-container {
          width: 100%;
          height: 380px;
          border-radius: 18px;
          overflow: hidden;
          position: relative;
          border: 1px solid var(--border-color);
          box-shadow: 0 10px 30px rgba(0,0,0,0.05);
          transition: transform 0.3s ease;
        }

        .active-photo-container:hover {
          transform: scale(1.01);
        }

        .thumbnail-list {
          display: flex;
          gap: 10px;
          overflow-x: auto;
          padding-bottom: 6px;
        }

        .thumbnail-btn {
          width: 76px;
          height: 56px;
          padding: 0;
          border-radius: 10px;
          overflow: hidden;
          flex-shrink: 0;
          cursor: pointer;
          border: 2px solid transparent;
          opacity: 0.6;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .thumbnail-btn:hover {
          opacity: 0.9;
        }

        .thumbnail-btn.active {
          border-color: var(--accent-gold);
          opacity: 1;
          transform: scale(1.05);
          box-shadow: 0 6px 12px rgba(179, 142, 71, 0.2);
        }

        .no-images-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 280px;
          color: var(--text-muted);
          gap: 12px;
          background: rgba(0,0,0,0.01);
          border: 1.5px dashed var(--border-color);
          border-radius: 18px;
        }

        .no-images-placeholder span {
          font-size: 0.82rem;
          font-weight: 600;
        }

        .concepts-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .concept-badge {
          font-size: 0.75rem;
          font-weight: 700;
          background: rgba(179,142,71,0.06);
          color: var(--accent-gold);
          padding: 6px 14px;
          border-radius: 20px;
          border: 1px solid rgba(179,142,71,0.15);
          display: inline-flex;
          align-items: center;
          gap: 4px;
          transition: all 0.3s ease;
        }

        .concept-badge:hover {
          background: var(--accent-gold);
          color: #ffffff;
          border-color: var(--accent-gold);
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(179, 142, 71, 0.2);
        }

        .info-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .info-item {
          display: flex;
          gap: 14px;
          align-items: center;
          transition: transform 0.2s ease;
        }

        .info-item.border-top {
          border-top: 1px solid rgba(0, 0, 0, 0.05);
          padding-top: 16px;
        }

        .info-icon-wrapper {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: rgba(179, 142, 71, 0.08);
          border: 1px solid rgba(179, 142, 71, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent-gold);
          flex-shrink: 0;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .info-item:hover .info-icon-wrapper {
          background: var(--accent-gold);
          color: #ffffff;
          box-shadow: 0 6px 15px rgba(179, 142, 71, 0.3);
          transform: scale(1.06);
        }

        .info-content {
          display: flex;
          flex-direction: column;
        }

        .info-label {
          font-size: 0.7rem;
          color: var(--text-muted);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 2px;
        }

        .info-value {
          font-size: 0.85rem;
          color: var(--text-primary);
          font-weight: 600;
          line-height: 1.45;
        }

        .info-value.tel-link, .info-value.mail-link {
          text-decoration: none;
          font-weight: 700;
          transition: color 0.2s;
        }

        .info-value.tel-link:hover, .info-value.mail-link:hover {
          color: var(--accent-gold);
        }

        .info-value.highlight-value {
          color: var(--accent-green);
          font-weight: 700;
        }

        .form-desc {
          font-size: 0.82rem;
          color: var(--text-secondary);
          margin: 0 0 20px 0;
          line-height: 1.5;
        }

        .quote-form-element {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .alert-box {
          border-radius: 12px;
          padding: 14px;
          font-size: 0.8rem;
          font-weight: 600;
          display: flex;
          align-items: flex-start;
          gap: 8px;
          line-height: 1.4;
        }

        .alert-box.success {
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          color: #059669;
        }

        .alert-box.error {
          background: #fef2f2;
          border: 1px solid #fca5a5;
          color: #ef4444;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .input-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-secondary);
          margin-left: 2px;
        }

        .form-input, .form-select, .form-textarea {
          padding: 12px 16px;
          border-radius: 12px;
          border: 1px solid #cbd5e1;
          font-size: 0.88rem;
          background: rgba(248, 250, 252, 0.8);
          font-family: var(--font-body);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          width: 100%;
          outline: none;
        }

        .form-input:focus, .form-select:focus, .form-textarea:focus {
          border-color: var(--accent-gold);
          background: #ffffff;
          box-shadow: 0 4px 20px rgba(179, 142, 71, 0.08), 0 0 0 3px rgba(179, 142, 71, 0.15);
          transform: translateY(-1px);
        }

        .btn-submit {
          position: relative;
          overflow: hidden;
          margin-top: 8px;
          background: linear-gradient(135deg, var(--accent-gold) 0%, #a27e3c 100%);
          color: #fff;
          border: none;
          border-radius: 12px;
          padding: 14px;
          font-weight: 700;
          font-size: 0.95rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 8px 24px rgba(179, 142, 71, 0.25);
          font-family: var(--font-title);
        }

        .btn-submit::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 50%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transform: skewX(-20deg);
          transition: none;
        }

        .btn-submit:hover:not(:disabled)::after {
          left: 150%;
          transition: all 0.8s ease-in-out;
        }

        .btn-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(179, 142, 71, 0.4);
          background: linear-gradient(135deg, var(--accent-gold-hover) 0%, var(--accent-gold) 100%);
        }

        .btn-submit:disabled {
          background: #cbd5e1;
          color: #94a3b8;
          cursor: not-allowed;
          box-shadow: none;
        }

        .scrollbar-hidden::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hidden {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fade-in {
          animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
      <style jsx global>{`
        @media (max-width: 900px) {
          .showroom-main-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
          .profile-header-bar {
            padding: 16px 20px !important;
          }
          .desktop-header-spacer {
            display: none !important;
          }
          .profile-banner-card {
            padding: 24px !important;
          }
          .profile-name {
            font-size: 1.5rem !important;
          }
          .section-glass-card {
            padding: 20px !important;
          }
        }
      `}</style>
    </div>
  );
}
