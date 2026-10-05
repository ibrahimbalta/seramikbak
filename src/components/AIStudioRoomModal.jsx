'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  MapPin, 
  Download, 
  Share2, 
  Calculator, 
  Package, 
  X, 
  SlidersHorizontal, 
  Loader2, 
  ExternalLink,
  Layers,
  Check
} from 'lucide-react';
import { generateTilePreview, loadImage } from './TilePerspectiveEngine';
import { cropWhiteBorders } from '../utils/imageTextureUtils';

const presetTiles = [
  {
    id: 'calacatta_gold',
    name: 'Calacatta Gold 60x120',
    color: 'Beyaz / Altın',
    style: 'Mermer Doku',
    finish: 'Parlak Lappato',
    width: 60,
    height: 120,
    imageUrl: '/textures/calacatta_gold.jpg'
  },
  {
    id: 'loft_beton',
    name: 'Loft Beton 60x60',
    color: 'Gri Beton',
    style: 'Beton / Taş',
    finish: 'Mat Rektifiyeli',
    width: 60,
    height: 60,
    imageUrl: '/textures/loft_beton.jpg'
  },
  {
    id: 'albatros_antrasit',
    name: 'Albatros Antrasit 60x120',
    color: 'Siyah / Antrasit',
    style: 'Siyah Taş',
    finish: 'Lappato Parlak',
    width: 60,
    height: 120,
    imageUrl: '/textures/albatros_antrasit.jpg'
  },
  {
    id: 'natural_oak',
    name: 'Natural Oak 20x120',
    color: 'Ahşap Meşe',
    style: 'Ahşap Doku',
    finish: 'Mat Rektifiyeli',
    width: 20,
    height: 120,
    imageUrl: '/textures/natural_oak.jpg'
  },
  {
    id: 'travertino_classico',
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
    name: 'Lüks Ege Villası Banyosu',
    subtitle: 'Zemin & Vurgu Duvarı',
    icon: '🛁',
    areaM2: 22,
    beforeUrl: '/hero/luxury_bathroom.png',
    surfaces: {
      floor: {
        polygon: [
          [8, 54],
          [92, 54],
          [100, 100],
          [0, 100]
        ]
      },
      walls: [
        {
          polygon: [
            [14, 12],
            [86, 12],
            [92, 54],
            [8, 54]
          ]
        }
      ]
    },
    // Optional pre-rendered static fallbacks if user chooses defaults without changing layout
    getStaticRender: (tile, layout) => {
      if (layout !== 'straight') return null;
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
      if (nameLc.includes('calacatta') || nameLc.includes('gold')) {
        return '/renders/luxury_bathroom_calacatta_gold.jpg';
      }
      return null;
    }
  },
  {
    id: 'modern_living',
    name: 'Bosphorus Loft Rezidans',
    subtitle: 'Geniş Format Salon Zemin',
    icon: '🛋️',
    areaM2: 46,
    beforeUrl: '/hero/modern_living.png',
    surfaces: {
      floor: {
        polygon: [
          [5, 52],
          [95, 52],
          [100, 100],
          [0, 100]
        ]
      }
    },
    getStaticRender: (tile, layout) => {
      if (layout !== 'straight') return null;
      const nameLc = (tile?.name || '').toLowerCase();
      if (tile?.width === 20 || nameLc.includes('oak') || nameLc.includes('ahşap')) {
        return '/renders/modern_living_natural_oak.jpg';
      }
      return null;
    }
  },
  {
    id: 'scandinavian_kitchen',
    name: 'İskandinav Ada Mutfak',
    subtitle: 'Mutfak Zemin & Ada Kaplama',
    icon: '🍳',
    areaM2: 28,
    beforeUrl: '/hero/scandinavian_kitchen.png',
    surfaces: {
      floor: {
        polygon: [
          [8, 56],
          [92, 56],
          [100, 100],
          [0, 100]
        ]
      }
    },
    getStaticRender: () => null
  },
  {
    id: 'architectural_terrace',
    name: 'Modern Mimari Teras',
    subtitle: 'Açık Alan Kaymaz Zemin',
    icon: '☀️',
    areaM2: 34,
    beforeUrl: '/hero/hero_ceramics.jpg',
    surfaces: {
      floor: {
        polygon: [
          [0, 60],
          [100, 60],
          [100, 100],
          [0, 100]
        ]
      }
    },
    getStaticRender: () => null
  }
];

const layoutOptions = [
  { id: 'straight', label: 'Düz Sıralı', desc: 'Standart 0° Grid' },
  { id: 'staggered_50', label: '1/2 Şaşırtmalı', desc: 'Tuğla / Derz Kaydırmalı' },
  { id: 'staggered_33', label: '1/3 Parke', desc: 'Ahşap & Plank Dizilimi' },
  { id: 'diagonal', label: 'Çapraz (45°)', desc: 'Diyagonal Açılı' }
];

const groutColors = [
  { id: '#f8fafc', name: 'Beyaz / Fildişi', color: '#f8fafc' },
  { id: '#94a3b8', name: 'Doğal Çimento Gri', color: '#94a3b8' },
  { id: '#262626', name: 'Antrasit Siyah', color: '#262626' },
  { id: '#d4c4b0', name: 'Sıcak Bej', color: '#d4c4b0' }
];

export default function AIStudioRoomModal({ 
  isOpen, 
  onClose, 
  selectedProduct, 
  onGoToDealers, 
  onRequestSample 
}) {
  const [selectedTile, setSelectedTile] = useState(selectedProduct || presetTiles[0]);
  const [activeSceneId, setActiveSceneId] = useState('luxury_bathroom');
  const [sliderPos, setSliderPos] = useState(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  
  // Customization
  const [activeLayout, setActiveLayout] = useState('straight');
  const [activeGroutColor, setActiveGroutColor] = useState('#94a3b8');
  const [groutWidth, setGroutWidth] = useState(1.5);
  
  // Rendering state
  const [renderedImageUrl, setRenderedImageUrl] = useState('');
  const [isRendering, setIsRendering] = useState(false);
  const renderCacheRef = useRef(new Map());

  const sliderContainerRef = useRef(null);

  // Sync selectedTile when selectedProduct prop changes
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

  const currentScene = architecturalScenes.find(s => s.id === activeSceneId) || architecturalScenes[0];

  // Helper: Proxy URL for remote images to avoid CORS taint in canvas
  const getSafeImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('data:') || url.startsWith('/')) return url;
    return `/api/proxy?url=${encodeURIComponent(url)}`;
  };

  // Perform client-side 3D PBR perspective render (0 API credits)
  const triggerRender = useCallback(async () => {
    if (!isOpen || !selectedTile) return;

    // 1. Check for pre-baked high-res static render first
    const staticRender = currentScene.getStaticRender(selectedTile, activeLayout);
    if (staticRender && activeGroutColor === '#94a3b8') {
      setRenderedImageUrl(staticRender);
      return;
    }

    // 2. Check memory cache for this specific configuration
    const cacheKey = `${currentScene.id}_${selectedTile.id || selectedTile.name}_${selectedTile.imageUrl}_${activeLayout}_${activeGroutColor}_${groutWidth}`;
    if (renderCacheRef.current.has(cacheKey)) {
      setRenderedImageUrl(renderCacheRef.current.get(cacheKey));
      return;
    }

    setIsRendering(true);
    try {
      // Load room photo and tile texture
      const roomImg = await loadImage(currentScene.beforeUrl);
      const rawTileImg = await loadImage(getSafeImageUrl(selectedTile.imageUrl || presetTiles[0].imageUrl));
      
      // Clean white borders from vendor catalogs
      const cleanedTile = cropWhiteBorders(rawTileImg);

      // Execute PBR Perspective Engine
      const resultDataUrl = generateTilePreview(
        roomImg,
        cleanedTile,
        currentScene.surfaces,
        {
          tileWCm: selectedTile.width || 60,
          tileHCm: selectedTile.height || 120,
          finish: selectedTile.finish || 'Lappato',
          layout: activeLayout,
          groutColor: activeGroutColor,
          groutWidth: groutWidth,
          subdivisions: 28
        }
      );

      renderCacheRef.current.set(cacheKey, resultDataUrl);
      setRenderedImageUrl(resultDataUrl);
    } catch (err) {
      console.warn('[AIStudioRoomModal] Render failed, falling back to base room:', err);
      // Fallback to room before image or static render
      setRenderedImageUrl(staticRender || currentScene.beforeUrl);
    } finally {
      setIsRendering(false);
    }
  }, [isOpen, selectedTile, currentScene, activeLayout, activeGroutColor, groutWidth]);

  // Re-render whenever scene, tile, layout, or grout changes
  useEffect(() => {
    if (isOpen) {
      triggerRender();
    }
  }, [isOpen, triggerRender]);

  if (!isOpen) return null;

  // Area & Packaging Calculation
  const tileM2 = ((selectedTile?.width || 60) * (selectedTile?.height || 120)) / 10000;
  const boxM2 = tileM2 * 2;
  const roomArea = currentScene.areaM2 || 22;
  const wasteMultiplier = activeLayout === 'diagonal' ? 1.15 : 1.10;
  const totalM2WithWaste = Math.round(roomArea * wasteMultiplier * 10) / 10;
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
    const text = `SeramikBak 3D Mimari Mekan Stüdyosu: ${selectedTile?.name || 'Seçili Seramik'} (${selectedTile?.width || 60}x${selectedTile?.height || 120} cm) modelinin ${currentScene.name} mekanında 3D fotorealistik uygulamasını inceleyin: ${url}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Download HD Render
  const handleDownloadResult = () => {
    if (!renderedImageUrl) return;
    const link = document.createElement('a');
    link.href = renderedImageUrl;
    link.download = `seramikbak-3d-${(selectedTile?.name || 'seramik').toLowerCase().replace(/\s+/g, '-')}-${currentScene.id}.jpg`;
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
        WebkitBackdropFilter: 'blur(12px)',
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
          maxWidth: '1040px',
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
                  3D Mimari Mekan Stüdyosu
                </h3>
                <span style={{ fontSize: '0.68rem', fontWeight: '900', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#ffffff', padding: '2px 8px', borderRadius: '12px', letterSpacing: '0.04em' }}>
                  ⚡ CANLI 3D GÖRSELLEŞTİRME
                </span>
              </div>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                Gerçek mimari mekanlarda seramiğin perspektif duruşunu, derz aralıklarını ve doğal ışık yansımalarını canlı inceleyin.
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

        {/* Selected Ceramic Details Banner */}
        <div style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.25)', borderRadius: '16px', padding: '12px 18px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <img 
              src={selectedTile?.imageUrl || '/textures/calacatta_gold.jpg'} 
              alt={selectedTile?.name} 
              style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '12px', border: '1.5px solid #d4af37', boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }} 
            />
            <div>
              <div style={{ fontSize: '0.98rem', fontWeight: '900', color: '#ffffff' }}>
                {selectedTile?.name || 'Seçili Seramik Modeli'}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '2px' }}>
                {selectedTile?.width || 60}×{selectedTile?.height || 120} cm • {selectedTile?.finish || 'Full Lappato Parlak'} • {selectedTile?.brand?.name || selectedTile?.style || 'Porselen Seramik'}
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <a 
              href={`/tasarim?product=${encodeURIComponent(selectedTile?.id || selectedTile?.code || '')}&brand=${encodeURIComponent(selectedTile?.brand?.slug || '')}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.74rem',
                fontWeight: '800',
                color: '#d4af37',
                background: 'rgba(212,175,55,0.15)',
                padding: '6px 14px',
                borderRadius: '20px',
                border: '1px solid rgba(212,175,55,0.35)',
                textDecoration: 'none'
              }}
            >
              <span>3D Tasarım Stüdyosunda Aç</span>
              <ExternalLink size={13} />
            </a>
          </div>
        </div>

        {/* 3D SCENE SELECTOR TABS */}
        <div style={{ marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.76rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Mekan Seçin (Mimari Sahne):
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
              <span>Canlı 3D Mekan Giydirme Hazır ({currentScene.name})</span>
            </div>
            <span style={{ fontSize: '0.76rem', color: '#cbd5e1' }}>
              ↔ Çizgiyi sağa/sola sürükleyerek Ham Mekan vs. Seramik Giydirilmiş Görünümü karşılaştırın
            </span>
          </div>

          {/* Slider Container */}
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
            {renderedImageUrl && (
              <img 
                src={renderedImageUrl} 
                alt="3D Architectural Render" 
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            )}

            {/* Before Image (Base Room Photo - Clipped) */}
            <div 
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                width: `${sliderPos}%`,
                overflow: 'hidden',
                borderRight: '3px solid #d4af37',
                boxShadow: '4px 0 16px rgba(0,0,0,0.6)'
              }}
            >
              <img 
                src={currentScene.beforeUrl} 
                alt="Base Architectural Room" 
                style={{ width: sliderContainerRef.current?.offsetWidth || '1000px', height: '100%', objectFit: 'cover', maxWidth: 'none' }} 
              />
              <span style={{ position: 'absolute', top: '14px', left: '14px', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', color: '#ffffff', padding: '6px 14px', borderRadius: '12px', fontSize: '0.76rem', fontWeight: '900', border: '1px solid rgba(255,255,255,0.2)' }}>
                STANDART HAM MEKAN
              </span>
            </div>

            {/* After Label */}
            <span style={{ position: 'absolute', top: '14px', right: '14px', background: 'linear-gradient(135deg, rgba(212,175,55,0.95) 0%, rgba(179,142,71,0.95) 100%)', color: '#090d16', padding: '6px 16px', borderRadius: '12px', fontSize: '0.76rem', fontWeight: '900', boxShadow: '0 4px 12px rgba(0,0,0,0.4)', zIndex: 2 }}>
              ✨ 3D GİYDİRME: {selectedTile?.name}
            </span>

            {/* Slider Knob */}
            <div 
              style={{
                position: 'absolute',
                top: '50%',
                left: `${sliderPos}%`,
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
                pointerEvents: 'none',
                zIndex: 3
              }}
            >
              ↔
            </div>

            {/* Loading Overlay */}
            {isRendering && (
              <div 
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(5, 8, 16, 0.65)',
                  backdropFilter: 'blur(4px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  zIndex: 10
                }}
              >
                <Loader2 className="animate-spin" size={28} style={{ color: '#d4af37' }} />
                <span style={{ fontSize: '0.9rem', fontWeight: '800', color: '#ffffff' }}>
                  Perspektif & Işık Hesaplaması Yapılıyor...
                </span>
              </div>
            )}
          </div>

          {/* CUSTOMIZATION BAR: LAYOUT & GROUT CONTROLS */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '14px 16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              
              {/* Layout Patterns */}
              <div>
                <div style={{ fontSize: '0.74rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.04em' }}>
                  Döşeme Şekli (Layout):
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                  {layoutOptions.map((opt) => {
                    const isSelected = activeLayout === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setActiveLayout(opt.id)}
                        style={{
                          background: isSelected ? 'rgba(212,175,55,0.18)' : 'rgba(255,255,255,0.04)',
                          border: isSelected ? '1.5px solid #d4af37' : '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '8px',
                          padding: '6px 10px',
                          textAlign: 'left',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '0.78rem', fontWeight: '800', color: isSelected ? '#d4af37' : '#ffffff' }}>
                            {opt.label}
                          </div>
                          <div style={{ fontSize: '0.66rem', color: '#94a3b8' }}>
                            {opt.desc}
                          </div>
                        </div>
                        {isSelected && <Check size={14} style={{ color: '#d4af37' }} />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Grout Color & Width */}
              <div>
                <div style={{ fontSize: '0.74rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.04em' }}>
                  Derz Rengi & Kalınlığı:
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                  {groutColors.map((g) => {
                    const isSelected = activeGroutColor === g.id;
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setActiveGroutColor(g.id)}
                        style={{
                          flex: 1,
                          padding: '6px 8px',
                          borderRadius: '8px',
                          background: isSelected ? 'rgba(212,175,55,0.18)' : 'rgba(255,255,255,0.04)',
                          border: isSelected ? '1.5px solid #d4af37' : '1px solid rgba(255,255,255,0.1)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          justifyContent: 'center'
                        }}
                        title={g.name}
                      >
                        <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: g.color, border: '1px solid #475569' }} />
                        <span style={{ fontSize: '0.70rem', color: isSelected ? '#d4af37' : '#cbd5e1', fontWeight: '700' }}>
                          {g.name.split(' ')[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setGroutWidth(1.2)}
                    style={{
                      flex: 1,
                      padding: '5px',
                      borderRadius: '6px',
                      background: groutWidth <= 1.5 ? 'rgba(212,175,55,0.18)' : 'rgba(255,255,255,0.04)',
                      border: groutWidth <= 1.5 ? '1px solid #d4af37' : '1px solid rgba(255,255,255,0.08)',
                      fontSize: '0.70rem',
                      fontWeight: '700',
                      color: groutWidth <= 1.5 ? '#d4af37' : '#94a3b8',
                      cursor: 'pointer'
                    }}
                  >
                    1.2mm Rektifiyeli
                  </button>
                  <button
                    type="button"
                    onClick={() => setGroutWidth(2.5)}
                    style={{
                      flex: 1,
                      padding: '5px',
                      borderRadius: '6px',
                      background: groutWidth > 1.5 ? 'rgba(212,175,55,0.18)' : 'rgba(255,255,255,0.04)',
                      border: groutWidth > 1.5 ? '1px solid #d4af37' : '1px solid rgba(255,255,255,0.08)',
                      fontSize: '0.70rem',
                      fontWeight: '700',
                      color: groutWidth > 1.5 ? '#d4af37' : '#94a3b8',
                      cursor: 'pointer'
                    }}
                  >
                    2.5mm Standart
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* QUICK CERAMIC PRESETS SWITCHER */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '12px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
              <span style={{ fontSize: '0.76rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Farklı Seramik Dokularını Bu Mekanda Deneyin:
              </span>
              <span style={{ fontSize: '0.72rem', color: '#d4af37', fontWeight: '700' }}>
                Tek Tıkla Dokuyu Değiştir
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
                  ~{requiredBoxes} Kutu ({totalM2WithWaste} m² — %{activeLayout === 'diagonal' ? '15' : '10'} fire payı dahil)
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
                if (onGoToDealers) onGoToDealers(selectedTile);
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
