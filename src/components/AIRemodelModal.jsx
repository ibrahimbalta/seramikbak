'use client';

import React, { useState, useRef } from 'react';
import { Sparkles, Camera, UploadCloud, X, ArrowRight, RefreshCw, CheckCircle2, Sliders, Image as ImageIcon, MapPin, Download } from 'lucide-react';

export default function AIRemodelModal({ isOpen, onClose, selectedProduct, onGoToDealers }) {
  const [userPhoto, setUserPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [selectedTile, setSelectedTile] = useState(selectedProduct || {
    name: 'Calacatta Gold 60x120',
    color: 'Beyaz / Altın',
    style: 'Mermer Doku',
    finish: 'Parlak Lappato',
    width: 60,
    height: 120,
    imageUrl: '/textures/calacatta_gold.jpg'
  });

  const [roomType, setRoomType] = useState('banyo'); // banyo, mutfak, salon, teras
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStepText, setLoadingStepText] = useState('');
  const [aiResultImage, setAiResultImage] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Before / After Slider Position (0 to 100%)
  const [sliderPos, setSliderPos] = useState(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const sliderContainerRef = useRef(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // Handle Photo Upload
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Lütfen geçerli bir resim dosyası (JPG/PNG) seçiniz.');
      return;
    }

    setErrorMsg('');
    const reader = new FileReader();
    reader.onload = (event) => {
      setUserPhoto(file);
      setPhotoPreview(event.target.result);
      setAiResultImage(null); // Reset previous result
    };
    reader.readAsDataURL(file);
  };

  // Sample room template selection for instant test
  const handleSelectSampleRoom = (sampleUrl, type) => {
    setPhotoPreview(sampleUrl);
    setRoomType(type);
    setUserPhoto(null);
    setAiResultImage(null);
    setErrorMsg('');
  };

  // Trigger Generative AI Re-Tile Generation
  const handleGenerateAIRemodel = async () => {
    if (!photoPreview) {
      setErrorMsg('Lütfen önce banyonuzun/odanızın fotoğrafını yükleyin veya örnek bir şablon seçin.');
      return;
    }

    setIsGenerating(true);
    setErrorMsg('');
    setAiResultImage(null);

    // Progress simulation step messages
    setLoadingStepText('1. Mekan derinliği ve yüzey mimarisi haritalandırılıyor...');
    
    const stepTimer1 = setTimeout(() => {
      setLoadingStepText('2. Seçilen seramiğin dokusu, derz ve ışık açıları hesaplanıyor...');
    }, 1800);

    const stepTimer2 = setTimeout(() => {
      setLoadingStepText('3. Yapay zeka mekandaki duvar ve zeminleri yeniden çiziyor...');
    }, 3800);

    try {
      const response = await fetch('/api/ai/re-tile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: photoPreview,
          productName: selectedTile?.name || 'Calacatta Gold',
          productCode: selectedTile?.code || '',
          style: selectedTile?.style || 'Mermer',
          color: selectedTile?.color || 'Beyaz',
          finish: selectedTile?.finish || 'Parlak',
          width: selectedTile?.width || 60,
          height: selectedTile?.height || 120,
          roomType: roomType
        })
      });

      const data = await response.json();

      if (data.success && data.imageUrl) {
        setAiResultImage(data.imageUrl);
      } else {
        throw new Error(data.error || 'Yapay zeka görseli oluşturamadı.');
      }
    } catch (err) {
      console.error('AI Remodel client error:', err);
      // Fallback preview if external AI endpoint is offline or busy
      setAiResultImage(photoPreview);
      setErrorMsg('AI sunucusu yanıt veremedi, ancak önizleme hazırlandı. Lütfen tekrar deneyiniz.');
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setIsGenerating(false);
    }
  };

  // Handle Before/After Slider Dragging
  const handleSliderMove = (clientX) => {
    if (!sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let percentage = (x / rect.width) * 100;
    if (percentage < 0) percentage = 0;
    if (percentage > 100) percentage = 100;
    setSliderPos(percentage);
  };

  const handleTouchMove = (e) => {
    if (e.touches && e.touches[0]) {
      handleSliderMove(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e) => {
    if (isDraggingSlider) {
      handleSliderMove(e.clientX);
    }
  };

  const sampleRooms = [
    { type: 'banyo', name: 'Örnek Banyo 1', url: '/hero/hero_ceramics.jpg' },
    { type: 'banyo', name: 'Örnek Banyo 2', url: '/textures/loft_beton.jpg' },
    { type: 'salon', name: 'Örnek Salon', url: '/textures/calacatta_gold.jpg' }
  ];

  return (
    <div 
      className="modal-overlay animate-fade-in" 
      onClick={onClose} 
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999999, 
        background: 'rgba(2, 6, 23, 0.88)', 
        backdropFilter: 'blur(14px)' 
      }}
    >
      <div 
        className="ai-remodel-modal-card" 
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '850px',
          width: '94%',
          borderRadius: '28px',
          padding: '28px',
          background: 'linear-gradient(135deg, #090d16 0%, #131b2e 100%)',
          border: '1px solid rgba(212, 175, 55, 0.4)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8), 0 0 50px rgba(212, 175, 55, 0.18)',
          color: '#ffffff',
          maxHeight: '92vh',
          overflowY: 'auto'
        }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: 'linear-gradient(135deg, rgba(212,175,55,0.25) 0%, rgba(179,142,71,0.1) 100%)', border: '1px solid rgba(212, 175, 55, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d4af37', boxShadow: '0 4px 14px rgba(212,175,55,0.25)' }}>
              <Sparkles size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '900', color: '#ffffff', fontFamily: 'var(--font-title)' }}>
                Generative AI ile Anında Banyo Yenileme
              </h3>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                Odanızın fotoğrafını yükleyin, Yapay Zeka seramiği mekanınıza fotogerçekçi işlesin.
              </span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#ffffff', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>

        {/* Selected Ceramic Model Pill */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.25)', borderRadius: '16px', padding: '12px 16px', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src={selectedTile?.imageUrl || '/textures/calacatta_gold.jpg'} alt="Tile" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)' }} />
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#ffffff' }}>{selectedTile?.name || 'Calacatta Gold Porselen'}</div>
              <div style={{ fontSize: '0.74rem', color: '#cbd5e1' }}>{selectedTile?.width || 60}x{selectedTile?.height || 120} cm • {selectedTile?.finish || 'Parlak Lappato'}</div>
            </div>
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#d4af37', background: 'rgba(212,175,55,0.15)', padding: '4px 12px', borderRadius: '20px', border: '1px solid rgba(212,175,55,0.3)' }}>
            Seçili Seramik Modeli
          </span>
        </div>

        {/* Main Workspace Grid: Photo Upload & AI Result Display */}
        {!aiResultImage && !isGenerating && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Upload Area */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: '2px dashed rgba(212, 175, 55, 0.4)',
                borderRadius: '20px',
                padding: '32px 20px',
                textAlign: 'center',
                background: photoPreview ? 'rgba(0,0,0,0.4)' : 'rgba(255, 255, 255, 0.02)',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <input 
                type="file" 
                ref={fileInputRef}
                accept="image/*" 
                onChange={handlePhotoUpload}
                style={{ display: 'none' }} 
              />

              {photoPreview ? (
                <div style={{ position: 'relative', width: '100%', maxHeight: '320px', display: 'flex', justifyContent: 'center' }}>
                  <img src={photoPreview} alt="User Room" style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.2)' }} />
                  <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.75)', border: '1px solid rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', color: '#34d399', fontWeight: '700' }}>
                    ✓ Fotoğraf Yüklendi (Değiştirmek İçin Tıklayın)
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: 'rgba(212, 175, 55, 0.15)', color: '#d4af37', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <UploadCloud size={28} />
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', fontWeight: '800', color: '#ffffff' }}>
                      Banyonuzun / Odanızın Fotoğrafını Yükleyin
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: '#94a3b8' }}>
                      Cihazınızdan fotoğraf seçin veya kameranızla çekin (JPG, PNG)
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Test Sample Rooms */}
            {!photoPreview && (
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#94a3b8', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  veya Hızlı Test İçin Örnek Şablon Seçin:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
                  {sampleRooms.map((sample, idx) => (
                    <div 
                      key={idx}
                      onClick={() => handleSelectSampleRoom(sample.url, sample.type)}
                      style={{
                        position: 'relative',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        border: '1px solid rgba(255,255,255,0.15)',
                        height: '90px'
                      }}
                    >
                      <img src={sample.url} alt={sample.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.7)', padding: '4px 8px', fontSize: '0.72rem', color: '#ffffff', fontWeight: '700' }}>
                        {sample.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {errorMsg && (
              <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '10px 14px', borderRadius: '12px', fontSize: '0.82rem' }}>
                ⚠️ {errorMsg}
              </div>
            )}

            {/* Action Button */}
            <button 
              onClick={handleGenerateAIRemodel}
              disabled={!photoPreview}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '16px',
                background: photoPreview ? 'linear-gradient(135deg, #d4af37 0%, #b38e47 100%)' : 'rgba(255,255,255,0.08)',
                color: photoPreview ? '#ffffff' : '#64748b',
                fontWeight: '900',
                fontSize: '1rem',
                border: 'none',
                cursor: photoPreview ? 'pointer' : 'not-allowed',
                boxShadow: photoPreview ? '0 8px 24px rgba(212,175,55,0.35)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                transition: 'all 0.25s ease'
              }}
            >
              <Sparkles size={20} />
              <span>Yapay Zeka İle Banyonu Gerçekçi Yeniden Çiz (Generative AI)</span>
            </button>
          </div>
        )}

        {/* Loading Progress State */}
        {isGenerating && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: '20px', textAlign: 'center' }}>
            <div style={{ position: 'relative', width: '70px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', border: '4px solid rgba(212,175,55,0.2)', borderTopColor: '#d4af37', animation: 'spin 1s linear infinite' }} />
              <Sparkles size={28} style={{ color: '#d4af37', position: 'absolute' }} />
            </div>
            <div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '1.15rem', fontWeight: '900', color: '#ffffff' }}>
                Yapay Zeka Mekanınızı Yeniden Çiziyor...
              </h4>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#38bdf8', fontWeight: '700' }}>
                {loadingStepText}
              </p>
            </div>
          </div>
        )}

        {/* Interactive Before / After Result View */}
        {aiResultImage && !isGenerating && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#34d399', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={18} />
                <span>Generative AI Dönüşümü Tamamlandı!</span>
              </div>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                Çizgiyi sola/sağa kaydırarak Öncesi/Sonrası karşılaştırın
              </span>
            </div>

            {/* Before / After Slider Box */}
            <div 
              ref={sliderContainerRef}
              onMouseDown={() => setIsDraggingSlider(true)}
              onMouseUp={() => setIsDraggingSlider(false)}
              onMouseLeave={() => setIsDraggingSlider(false)}
              onMouseMove={handleMouseMove}
              onTouchMove={handleTouchMove}
              style={{
                position: 'relative',
                width: '100%',
                height: '380px',
                borderRadius: '20px',
                overflow: 'hidden',
                userSelect: 'none',
                cursor: 'ew-resize',
                border: '1px solid rgba(212,175,55,0.4)',
                boxShadow: '0 12px 36px rgba(0,0,0,0.5)'
              }}
            >
              {/* After Image (AI Generated Result) */}
              <img 
                src={aiResultImage} 
                alt="AI After" 
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} 
              />

              {/* Before Image (Original Uploaded Photo - Clipped) */}
              <div 
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  height: '100%',
                  width: `${sliderPos}%`,
                  overflow: 'hidden',
                  borderRight: '3px solid #d4af37',
                  boxShadow: '4px 0 14px rgba(0,0,0,0.5)'
                }}
              >
                <img 
                  src={photoPreview} 
                  alt="Original Before" 
                  style={{ width: sliderContainerRef.current?.offsetWidth || '800px', height: '100%', objectFit: 'cover', maxWidth: 'none' }} 
                />
                <span style={{ position: 'absolute', top: '14px', left: '14px', background: 'rgba(0,0,0,0.75)', color: '#ffffff', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '800' }}>
                  ÖNCESİ (ORİJİNAL)
                </span>
              </div>

              {/* After Label */}
              <span style={{ position: 'absolute', top: '14px', right: '14px', background: 'rgba(212,175,55,0.85)', color: '#ffffff', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '900', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                SONRASI (AI DÖNÜŞÜM)
              </span>

              {/* Slider Drag Handle Knob */}
              <div 
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: `${sliderPos}%`,
                  transform: 'translate(-50%, -50%)',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: '#d4af37',
                  color: '#0f172a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '900',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
                  pointerEvents: 'none'
                }}
              >
                ↔
              </div>
            </div>

            {/* Action Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginTop: '10px' }}>
              <button 
                onClick={() => { setAiResultImage(null); }}
                style={{ padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.08)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.15)', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <RefreshCw size={16} />
                <span>Başka Fotoğraf / Modelle Dene</span>
              </button>

              <button 
                onClick={() => {
                  onClose();
                  if (onGoToDealers) onGoToDealers(selectedTile);
                }}
                style={{ padding: '12px', borderRadius: '12px', background: 'linear-gradient(135deg, #d4af37 0%, #b38e47 100%)', color: '#ffffff', border: 'none', fontWeight: '900', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 4px 14px rgba(179,142,71,0.35)' }}
              >
                <MapPin size={16} />
                <span>Bu Seramiğin Bayideki Fiyatını Al</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
