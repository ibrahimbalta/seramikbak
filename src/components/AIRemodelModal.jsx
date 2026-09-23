'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  MapPin, 
  Download, 
  Share2, 
  Calculator, 
  Package, 
  Layers, 
  X,
  SlidersHorizontal,
  Eye,
  Check,
  ChevronRight,
  Maximize2
} from 'lucide-react';

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

const architecturalScenes = [
  {
    id: 'luxury_bathroom',
    name: 'Lüks Ebeveyn Banyosu',
    subtitle: 'Zemin ve Duvar Uygulaması',
    icon: '🛁',
    areaM2: 24,
    beforeUrl: '/hero/luxury_bathroom.png',
    getRenderUrl: (tile) => {
      const nameLc = (tile?.name || '').toLowerCase();
      const colorLc = (tile?.color || '').toLowerCase();
      const styleLc = (tile?.style || '').toLowerCase();

      if (
        nameLc.includes('albatros') || 
        nameLc.includes('volcano') || 
        nameLc.includes('antrasit') || 
        nameLc.includes('siyah') || 
        colorLc.includes('siyah') || 
        colorLc.includes('antrasit') || 
        styleLc.includes('siyah')
      ) {
        return '/renders/luxury_bathroom_albatros_antrasit.jpg';
      }
      if (
        nameLc.includes('loft') || 
        nameLc.includes('beton') || 
        nameLc.includes('concrete') || 
        styleLc.includes('beton') || 
        colorLc.includes('gri')
      ) {
        return '/renders/luxury_bathroom_loft_beton.jpg';
      }
      if (
        nameLc.includes('oak') || 
        nameLc.includes('ahşap') || 
        nameLc.includes('teak') || 
        styleLc.includes('ahşap') || 
        colorLc.includes('ahşap') || 
        tile?.width === 20
      ) {
        return '/renders/luxury_bathroom_natural_oak.jpg';
      }
      return '/renders/luxury_bathroom_calacatta_gold.jpg';
    }
  },
  {
    id: 'modern_living',
    name: 'Geniş Çağdaş Salon',
    subtitle: 'Geniş Format Porselen Zemin',
    icon: '🛋️',
    areaM2: 45,
    beforeUrl: '/hero/modern_living.png',
    getRenderUrl: (tile) => {
      const nameLc = (tile?.name || '').toLowerCase();
      if (tile?.width === 20 || nameLc.includes('oak') || nameLc.includes('ahşap')) {
        return '/renders/modern_living_natural_oak.jpg';
      }
      return '/hero/modern_living.png';
    }
  },
  {
    id: 'scandinavian_kitchen',
    name: 'İskandinav Mutfak',
    subtitle: 'Mutfak Zemin & Tezgah Arası',
    icon: '🍽️',
    areaM2: 28,
    beforeUrl: '/hero/scandinavian_kitchen.png',
    getRenderUrl: () => '/hero/scandinavian_kitchen.png'
  },
  {
    id: 'modern_bathroom',
    name: 'Modern Mimari Banyo',
    subtitle: 'Armatür & Duvar Uyumu',
    icon: '🏛️',
    areaM2: 20,
    beforeUrl: '/hero/hero_ceramics.jpg',
    getRenderUrl: () => '/hero/hero_ceramics.jpg'
  }
];

export default function AIRemodelModal({ isOpen, onClose, selectedProduct, onGoToDealers, onRequestSample }) {
  const [selectedTile, setSelectedTile] = useState(selectedProduct || presetTiles[0]);
  const [activeSceneId, setActiveSceneId] = useState('luxury_bathroom');
  const [sliderPos, setSliderPos] = useState(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const sliderContainerRef = useRef(null);

  // Sync selectedTile when selectedProduct changes
  useEffect(() => {
    if (selectedProduct) {
      setSelectedTile({
        ...selectedProduct,
        imageUrl: selectedProduct.textureUrl || selectedProduct.imageUrl || presetTiles[0].imageUrl,
        width: selectedProduct.width || 60,
        height: selectedProduct.height || 120,
        name: selectedProduct.name || 'Seçili Seramik Modeli',
        finish: selectedProduct.finish || selectedProduct.surface || 'Full Lappato Parlak',
        color: selectedProduct.color || 'Beyaz / Mermer'
      });
    }
  }, [selectedProduct]);

  if (!isOpen) return null;

  const currentScene = architecturalScenes.find(s => s.id === activeSceneId) || architecturalScenes[0];
  const renderedImageUrl = currentScene.getRenderUrl(selectedTile);
  const beforeImageUrl = currentScene.beforeUrl;

  // Area & Box Calculator
  const tileM2 = ((selectedTile?.width || 60) * (selectedTile?.height || 120)) / 10000;
  const boxM2 = tileM2 * 2;
  const roomArea = currentScene.areaM2 || 25;
  const totalM2WithWaste = Math.round(roomArea * 1.10 * 10) / 10;
  const requiredBoxes = Math.ceil(totalM2WithWaste / (boxM2 || 1.44));

  // Slider Drag Handlers
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

  // WhatsApp Share
  const handleWhatsAppShare = () => {
    const url = typeof window !== 'undefined' ? window.location.href : 'https://seramikbak.com';
    const text = 'SeramikBak 3D Mimari Görselleştirme Stüdyosu: ' + (selectedTile?.name || 'Seçili Seramik') + ' (' + (selectedTile?.width || 60) + 'x' + (selectedTile?.height || 120) + ' cm) modelinin ' + currentScene.name + ' mekanında 3D mimari render görünümünü inceleyin: ' + url;
    window.open('https://api.whatsapp.com/send?text=' + encodeURIComponent(text), '_blank');
  };

  // Download HD Render
  const handleDownloadResult = () => {
    const link = document.createElement('a');
    link.href = renderedImageUrl;
    link.download = 'seramikbak-3d-' + (selectedTile?.name || 'seramik').toLowerCase().replace(/\s+/g, '-') + '-' + currentScene.id + '.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(5, 8, 16, 0.88)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        overflowY: 'auto'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(9, 13, 22, 0.99) 100%)',
          border: '1px solid rgba(212, 175, 55, 0.4)',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '1020px',
          maxHeight: '94vh',
          overflowY: 'auto',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 35px rgba(212, 175, 55, 0.25)',
          padding: '24px',
          position: 'relative',
          color: '#ffffff'
        }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: 'linear-gradient(135deg, rgba(212,175,55,0.25) 0%, rgba(179,142,71,0.1) 100%)', border: '1px solid rgba(212, 175, 55, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d4af37', boxShadow: '0 4px 14px rgba(212,175,55,0.25)' }}>
              <Sparkles size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '900', color: '#ffffff', fontFamily: 'var(--font-title)' }}>
                  3D Mimari Görselleştirme Stüdyosu
                </h3>
                <span style={{ fontSize: '0.68rem', fontWeight: '900', background: 'linear-gradient(135deg, #d4af37 0%, #b38e47 100%)', color: '#090d16', padding: '2px 8px', borderRadius: '12px', letterSpacing: '0.04em' }}>
                  ✨ 3D MİMARİ RENDER
                </span>
              </div>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                Küratörlü 3D mimari mekanlarda seramiğin duruşunu, derz aralıklarını ve doğal ışık yansımalarını inceleyin.
              </span>
            </div>
          </div>
          <button 
            onClick={onClose} 
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#ffffff', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Selected Ceramic Banner */}
        <div style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.25)', borderRadius: '16px', padding: '12px 18px', marginBottom: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <img 
              src={selectedTile?.imageUrl || '/textures/calacatta_gold.jpg'} 
              alt="Tile" 
              style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '12px', border: '1.5px solid #d4af37', boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }} 
            />
            <div>
              <div style={{ fontSize: '0.98rem', fontWeight: '900', color: '#ffffff' }}>
                {selectedTile?.name || 'Seçili Seramik Modeli'}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '2px' }}>
                {selectedTile?.width || 60}×{selectedTile?.height || 120} cm • {selectedTile?.finish || 'Full Lappato Parlak'} • {selectedTile?.style || 'Porselen Seramik'}
              </div>
            </div>
          </div>
          <span style={{ fontSize: '0.74rem', fontWeight: '800', color: '#d4af37', background: 'rgba(212,175,55,0.15)', padding: '5px 14px', borderRadius: '20px', border: '1px solid rgba(212,175,55,0.3)', whiteSpace: 'nowrap' }}>
            🏛️ Aktif 3D Render
          </span>
        </div>

        {/* 3D SCENE SELECTOR TABS */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.76rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Mekan Seçin (3D Mimari Sahne):
            </span>
            <span style={{ fontSize: '0.74rem', color: '#38bdf8', fontWeight: '700' }}>
              {currentScene.name} • {currentScene.subtitle}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
            {architecturalScenes.map((scene) => {
              const isActive = activeSceneId === scene.id;
              return (
                <button
                  key={scene.id}
                  type="button"
                  onClick={() => setActiveSceneId(scene.id)}
                  style={{
                    background: isActive ? 'linear-gradient(135deg, rgba(212,175,55,0.2) 0%, rgba(212,175,55,0.06) 100%)' : 'rgba(255,255,255,0.03)',
                    border: isActive ? '1.5px solid #d4af37' : '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '14px',
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease',
                    boxShadow: isActive ? '0 4px 16px rgba(212,175,55,0.25)' : 'none'
                  }}
                >
                  <span style={{ fontSize: '1.4rem' }}>{scene.icon}</span>
                  <div>
                    <div style={{ fontSize: '0.84rem', fontWeight: '800', color: isActive ? '#d4af37' : '#ffffff' }}>
                      {scene.name}
                    </div>
                    <div style={{ fontSize: '0.70rem', color: '#94a3b8', marginTop: '2px' }}>
                      ~{scene.areaM2} m² Alan
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* INTERACTIVE BEFORE / AFTER 3D SLIDER VIEW */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: '800', color: '#34d399', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={18} />
              <span>3D Render Hazır ({currentScene.name})</span>
            </div>
            <span style={{ fontSize: '0.76rem', color: '#cbd5e1' }}>
              ↔ Çizgiyi sağa/sola sürükleyerek Ham Mekan vs. Seramik Giydirilmiş 3D Render'ı karşılaştırın
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
              height: '440px',
              borderRadius: '20px',
              overflow: 'hidden',
              userSelect: 'none',
              cursor: 'ew-resize',
              border: '1.5px solid rgba(212,175,55,0.5)',
              boxShadow: '0 16px 45px rgba(0,0,0,0.6)',
              background: '#000000'
            }}
          >
            {/* After Image (3D Rendered Result) */}
            <img 
              src={renderedImageUrl} 
              alt="3D Architectural Render" 
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} 
            />

            {/* Before Image (Base Architectural Room - Clipped) */}
            <div 
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                width: sliderPos + '%',
                overflow: 'hidden',
                borderRight: '3px solid #d4af37',
                boxShadow: '4px 0 16px rgba(0,0,0,0.6)'
              }}
            >
              <img 
                src={beforeImageUrl} 
                alt="Base Architectural Room" 
                style={{ width: sliderContainerRef.current?.offsetWidth || '970px', height: '100%', objectFit: 'cover', maxWidth: 'none' }} 
              />
              <span style={{ position: 'absolute', top: '14px', left: '14px', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', color: '#ffffff', padding: '6px 14px', borderRadius: '12px', fontSize: '0.76rem', fontWeight: '900', border: '1px solid rgba(255,255,255,0.2)' }}>
                STANDART HAM MEKAN
              </span>
            </div>

            {/* After Label */}
            <span style={{ position: 'absolute', top: '14px', right: '14px', background: 'linear-gradient(135deg, rgba(212,175,55,0.95) 0%, rgba(179,142,71,0.95) 100%)', color: '#090d16', padding: '6px 16px', borderRadius: '12px', fontSize: '0.76rem', fontWeight: '900', boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}>
              ✨ 3D GİYDİRME: {selectedTile?.name}
            </span>

            {/* Slider Drag Handle Knob */}
            <div 
              style={{
                position: 'absolute',
                top: '50%',
                left: sliderPos + '%',
                transform: 'translate(-50%, -50%)',
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #d4af37 0%, #b38e47 100%)',
                color: '#090d16',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '900',
                fontSize: '1.1rem',
                boxShadow: '0 6px 20px rgba(0,0,0,0.7), 0 0 14px rgba(212,175,55,0.5)',
                pointerEvents: 'none'
              }}
            >
              ↔
            </div>
          </div>

          {/* QUICK CERAMIC PRESETS SWITCHER */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '12px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
              <span style={{ fontSize: '0.76rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Farklı Seramik Dokularını Bu Mekanda Deneyin:
              </span>
              <span style={{ fontSize: '0.72rem', color: '#d4af37', fontWeight: '700' }}>
                Seçili Dokuyu Değiştir
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '8px' }}>
              {presetTiles.map((tile, idx) => {
                const isSelected = selectedTile?.name === tile.name;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedTile(tile)}
                    style={{
                      background: isSelected ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.04)',
                      border: isSelected ? '1.5px solid #d4af37' : '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '10px',
                      padding: '8px 10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <img src={tile.imageUrl} alt={tile.name} style={{ width: '28px', height: '28px', borderRadius: '6px', objectFit: 'cover' }} />
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: '800', color: isSelected ? '#d4af37' : '#ffffff', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                        {tile.name}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                        {tile.style}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Area & Packaging Estimator Bar */}
          <div style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '16px', padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Calculator size={18} style={{ color: '#38bdf8' }} />
              <div>
                <span style={{ fontSize: '0.84rem', fontWeight: '800', color: '#ffffff' }}>
                  Bu {currentScene.name} İçin Tahmini Miktar:
                </span>
                <span style={{ fontSize: '0.84rem', fontWeight: '900', color: '#38bdf8', marginLeft: '8px' }}>
                  ~{requiredBoxes} Kutu ({totalM2WithWaste} m² — %10 fire payı dahil)
                </span>
              </div>
            </div>
            <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
              Standart Kutu: {boxM2.toFixed(2)} m²
            </span>
          </div>

          {/* Action CTAs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginTop: '6px' }}>
            {/* Dealer Quote */}
            <button 
              type="button"
              onClick={() => {
                if (onGoToDealers) onGoToDealers();
              }}
              style={{
                padding: '14px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #d4af37 0%, #b38e47 100%)',
                color: '#090d16',
                border: 'none',
                fontWeight: '900',
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 6px 20px rgba(212,175,55,0.4)'
              }}
            >
              <MapPin size={18} />
              <span>En Yakın Bayiden Fiyat Al</span>
            </button>

            {/* Sample Order */}
            <button 
              type="button"
              onClick={() => {
                if (onRequestSample) onRequestSample(selectedTile);
              }}
              style={{
                padding: '12px',
                borderRadius: '14px',
                background: 'rgba(59, 130, 246, 0.15)',
                color: '#93c5fd',
                border: '1px solid rgba(59, 130, 246, 0.35)',
                fontWeight: '800',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Package size={17} />
              <span>Ücretsiz Numune İste</span>
            </button>

            {/* WhatsApp Share */}
            <button 
              type="button"
              onClick={handleWhatsAppShare}
              style={{
                padding: '12px',
                borderRadius: '14px',
                background: 'rgba(37, 211, 102, 0.15)',
                color: '#4ade80',
                border: '1px solid rgba(37, 211, 102, 0.35)',
                fontWeight: '800',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Share2 size={17} />
              <span>WhatsApp ile Paylaş</span>
            </button>

            {/* Download HD */}
            <button 
              type="button"
              onClick={handleDownloadResult}
              style={{
                padding: '12px',
                borderRadius: '14px',
                background: 'rgba(255,255,255,0.06)',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.15)',
                fontWeight: '700',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Download size={17} />
              <span>HD 3D Render İndir</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
