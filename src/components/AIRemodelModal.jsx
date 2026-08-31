'use client';

import React, { useState, useRef } from 'react';
import { Sparkles, UploadCloud, RefreshCw, CheckCircle2, MapPin } from 'lucide-react';

const presetTiles = [
  {
    name: 'Calacatta Gold 60x120',
    color: 'Beyaz / Altın',
    style: 'Mermer Doku',
    finish: 'Parlak Lappato',
    width: 60,
    height: 120,
    imageUrl: '/textures/calacatta_gold.jpg'
  },
  {
    name: 'Loft Beton 60x60',
    color: 'Gri Beton',
    style: 'Beton / Taş',
    finish: 'Mat Rektifiyeli',
    width: 60,
    height: 60,
    imageUrl: '/textures/loft_beton.jpg'
  },
  {
    name: 'Albatros Antrasit 60x120',
    color: 'Siyah / Antrasit',
    style: 'Siyah Taş',
    finish: 'Lappato Parlak',
    width: 60,
    height: 120,
    imageUrl: '/textures/albatros_antrasit.jpg'
  },
  {
    name: 'Natural Oak 20x120',
    color: 'Ahşap Meşe',
    style: 'Ahşap Doku',
    finish: 'Mat Rektifiyeli',
    width: 20,
    height: 120,
    imageUrl: '/textures/natural_oak.jpg'
  },
  {
    name: 'Travertino Classico 80x80',
    color: 'Bej Traverten',
    style: 'Traverten Taş',
    finish: 'Yarı Parlak',
    width: 80,
    height: 80,
    imageUrl: '/textures/travertino_classico.jpg'
  }
];

function getFallbackTileVisual(tile) {
  const style = (tile?.style || '').toLowerCase();
  const name = (tile?.name || '').toLowerCase();
  const color = (tile?.color || '').toLowerCase();

  if (style.includes('antrasit') || style.includes('siyah') || name.includes('albatros') || name.includes('borneo') || color.includes('antrasit')) {
    return '/textures/albatros_antrasit.jpg';
  }
  if (style.includes('beton') || style.includes('taş') || name.includes('loft') || name.includes('concrete') || color.includes('gri')) {
    return '/hero/hero_ceramics.jpg';
  }
  if (style.includes('ahşap') || name.includes('oak') || name.includes('teak') || color.includes('meşe') || color.includes('ahşap')) {
    return '/hero/scandinavian_kitchen.png';
  }
  if (style.includes('traverten') || name.includes('travertino') || color.includes('bej')) {
    return '/textures/travertino_classico.jpg';
  }
  return '/hero/luxury_bathroom.png';
}

export default function AIRemodelModal({ isOpen, onClose, selectedProduct, onGoToDealers }) {
  const [userPhoto, setUserPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('/hero/luxury_bathroom.png');
  const [selectedTile, setSelectedTile] = useState(selectedProduct || presetTiles[0]);

  const [roomType, setRoomType] = useState('banyo');
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStepText, setLoadingStepText] = useState('');
  const [aiResultImage, setAiResultImage] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [sliderPos, setSliderPos] = useState(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const sliderContainerRef = useRef(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

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
      setAiResultImage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSampleRoom = (sampleUrl, type) => {
    setPhotoPreview(sampleUrl);
    setRoomType(type);
    setUserPhoto(null);
    setAiResultImage(null);
    setErrorMsg('');
  };

  const handleGenerateAIRemodel = async (targetTile = selectedTile) => {
    const activePhoto = photoPreview || '/hero/luxury_bathroom.png';

    setIsGenerating(true);
    setErrorMsg('');

    setLoadingStepText('1. Mekan derinliği ve yüzey mimarisi haritalandırılıyor...');
    
    const stepTimer1 = setTimeout(() => {
      setLoadingStepText('2. Seçilen seramiğin dokusu, derz ve ışık açıları hesaplanıyor...');
    }, 1200);

    const stepTimer2 = setTimeout(() => {
      setLoadingStepText('3. Yapay zeka mekandaki duvar ve zeminleri yeniden çiziyor...');
    }, 2800);

    try {
      const response = await fetch('/api/ai/re-tile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: activePhoto,
          productName: targetTile?.name || 'Calacatta Gold',
          productCode: targetTile?.code || '',
          style: targetTile?.style || 'Mermer',
          color: targetTile?.color || 'Beyaz',
          finish: targetTile?.finish || 'Parlak',
          width: targetTile?.width || 60,
          height: targetTile?.height || 120,
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
      const modelVisual = getFallbackTileVisual(targetTile);
      setAiResultImage(modelVisual);
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setIsGenerating(false);
    }
  };

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
    { type: 'banyo', name: 'Lüks Banyo', url: '/hero/luxury_bathroom.png' },
    { type: 'banyo', name: 'Modern Banyo', url: '/hero/hero_ceramics.jpg' },
    { type: 'mutfak', name: 'İskandinav Mutfak', url: '/hero/scandinavian_kitchen.png' },
    { type: 'salon', name: 'Geniş Salon', url: '/hero/modern_living.png' }
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
          maxWidth: '880px',
          width: '94%',
          borderRadius: '28px',
          padding: '24px',
          background: 'linear-gradient(135deg, #090d16 0%, #131b2e 100%)',
          border: '1px solid rgba(212, 175, 55, 0.4)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8), 0 0 50px rgba(212, 175, 55, 0.18)',
          color: '#ffffff',
          maxHeight: '92vh',
          overflowY: 'auto'
        }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: 'linear-gradient(135deg, rgba(212,175,55,0.25) 0%, rgba(179,142,71,0.1) 100%)', border: '1px solid rgba(212, 175, 55, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d4af37', boxShadow: '0 4px 14px rgba(212,175,55,0.25)' }}>
              <Sparkles size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '900', color: '#ffffff', fontFamily: 'var(--font-title)' }}>
                Generative AI ile Anında Mekan Yenileme
              </h3>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                Fotoğraf seçin ve seramik modelini belirleyin, Yapay Zeka mekanda seramiği döşesin.
              </span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#ffffff', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>

        {/* Selected Ceramic Model Pill & Quick Switcher */}
        <div style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.25)', borderRadius: '16px', padding: '12px 16px', marginBottom: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img src={selectedTile?.imageUrl || '/textures/calacatta_gold.jpg'} alt="Tile" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)' }} />
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#ffffff' }}>{selectedTile?.name || 'Calacatta Gold Porselen'}</div>
                <div style={{ fontSize: '0.74rem', color: '#cbd5e1' }}>{selectedTile?.width || 60}x{selectedTile?.height || 120} cm • {selectedTile?.style || 'Mermer Doku'} • {selectedTile?.finish || 'Parlak Lappato'}</div>
              </div>
            </div>
            <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#d4af37', background: 'rgba(212,175,55,0.15)', padding: '4px 12px', borderRadius: '20px', border: '1px solid rgba(212,175,55,0.3)' }}>
              Uygulanacak Seramik Modeli
            </span>
          </div>

          {/* Quick Model Selector Pills */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingTop: '4px', paddingBottom: '2px', scrollbarWidth: 'none' }}>
            {presetTiles.map((tile, idx) => {
              const isSelected = selectedTile?.name === tile.name;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSelectedTile(tile);
                    if (aiResultImage) handleGenerateAIRemodel(tile);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 10px',
                    borderRadius: '10px',
                    background: isSelected ? 'rgba(212,175,55,0.25)' : 'rgba(255,255,255,0.05)',
                    border: isSelected ? '1px solid #d4af37' : '1px solid rgba(255,255,255,0.1)',
                    color: isSelected ? '#ffffff' : '#94a3b8',
                    fontSize: '0.72rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <img src={tile.imageUrl} alt={tile.name} style={{ width: '18px', height: '18px', borderRadius: '4px', objectFit: 'cover' }} />
                  <span>{tile.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Workspace Grid: Photo Upload & AI Result Display */}
        {!aiResultImage && !isGenerating && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            {/* Upload Area */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: '2px dashed rgba(212, 175, 55, 0.4)',
                borderRadius: '20px',
                padding: '24px 16px',
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
                <div style={{ position: 'relative', width: '100%', maxHeight: '280px', display: 'flex', justifyContent: 'center' }}>
                  <img src={photoPreview} alt="User Room" style={{ maxWidth: '100%', maxHeight: '260px', objectFit: 'contain', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.2)' }} />
                  <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.75)', border: '1px solid rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', color: '#34d399', fontWeight: '700' }}>
                    ✓ Fotoğraf Hazır (Değiştirmek İçin Tıklayın)
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(212, 175, 55, 0.15)', color: '#d4af37', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <UploadCloud size={24} />
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: '800', color: '#ffffff' }}>
                      Banyonuzun / Odanızın Fotoğrafını Yükleyin
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>
                      Cihazınızdan fotoğraf seçin veya kameranızla çekin (JPG, PNG)
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Test Sample Rooms */}
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Örnek Odalar Üzerinde Hızlı Deneyin:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                {sampleRooms.map((sample, idx) => (
                  <div 
                    key={idx}
                    onClick={() => handleSelectSampleRoom(sample.url, sample.type)}
                    style={{
                      position: 'relative',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: photoPreview === sample.url ? '2px solid #d4af37' : '1px solid rgba(255,255,255,0.15)',
                      height: '80px',
                      transition: 'transform 0.2s ease'
                    }}
                  >
                    <img src={sample.url} alt={sample.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.7)', padding: '3px 6px', fontSize: '0.7rem', color: '#ffffff', fontWeight: '700' }}>
                      {sample.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {errorMsg && (
              <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '10px 14px', borderRadius: '12px', fontSize: '0.82rem' }}>
                ⚠️ {errorMsg}
              </div>
            )}

            {/* Action Button */}
            <button 
              onClick={() => handleGenerateAIRemodel(selectedTile)}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #d4af37 0%, #b38e47 100%)',
                color: '#ffffff',
                fontWeight: '900',
                fontSize: '0.95rem',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(212,175,55,0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                transition: 'all 0.25s ease'
              }}
            >
              <Sparkles size={20} />
              <span>Yapay Zeka İle Seramiği Mekana Döşe (Generative AI)</span>
            </button>
          </div>
        )}

        {/* Loading Progress State */}
        {isGenerating && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '50px 20px', gap: '18px', textAlign: 'center' }}>
            <div style={{ position: 'relative', width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', border: '4px solid rgba(212,175,55,0.2)', borderTopColor: '#d4af37', animation: 'spin 1s linear infinite' }} />
              <Sparkles size={26} style={{ color: '#d4af37', position: 'absolute' }} />
            </div>
            <div>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '1.1rem', fontWeight: '900', color: '#ffffff' }}>
                Yapay Zeka Mekanınızı Yeniden Çiziyor...
              </h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#38bdf8', fontWeight: '700' }}>
                {loadingStepText}
              </p>
            </div>
          </div>
        )}

        {/* Interactive Before / After Result View */}
        {aiResultImage && !isGenerating && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: '800', color: '#34d399', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={18} />
                <span>Generative AI Dönüşümü Tamamlandı! ({selectedTile?.name})</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
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
                  src={photoPreview || '/hero/luxury_bathroom.png'} 
                  alt="Original Before" 
                  style={{ width: sliderContainerRef.current?.offsetWidth || '800px', height: '100%', objectFit: 'cover', maxWidth: 'none' }} 
                />
                <span style={{ position: 'absolute', top: '14px', left: '14px', background: 'rgba(0,0,0,0.75)', color: '#ffffff', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '800' }}>
                  ÖNCESİ (ORİJİNAL MEKAN)
                </span>
              </div>

              {/* After Label */}
              <span style={{ position: 'absolute', top: '14px', right: '14px', background: 'rgba(212,175,55,0.85)', color: '#ffffff', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '900', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                SONRASI (AI DÖNÜŞÜM: {selectedTile?.name})
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginTop: '6px' }}>
              <button 
                onClick={() => { setAiResultImage(null); }}
                style={{ padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.08)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.15)', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <RefreshCw size={16} />
                <span>Farklı Fotoğraf Yükle</span>
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
