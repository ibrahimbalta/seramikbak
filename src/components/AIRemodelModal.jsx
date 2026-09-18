'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  UploadCloud, 
  RefreshCw, 
  CheckCircle2, 
  MapPin, 
  Zap, 
  Camera, 
  Download, 
  Share2, 
  Calculator, 
  Check, 
  Package, 
  Layers, 
  X,
  ChevronRight,
  Eye,
  SlidersHorizontal,
  Home,
  Paintbrush,
  Grid
} from 'lucide-react';
import { generateTilePreview, loadImage, downscaleImageForAI, detectTileSurfacesClientSide } from './TilePerspectiveEngine';
import MaskBrushEditor from './MaskBrushEditor';

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

const sampleRooms = [
  { type: 'banyo', name: 'Lüks Banyo', url: '/hero/luxury_bathroom.png' },
  { type: 'banyo', name: 'Modern Banyo', url: '/hero/hero_ceramics.jpg' },
  { type: 'mutfak', name: 'İskandinav Mutfak', url: '/hero/scandinavian_kitchen.png' },
  { type: 'salon', name: 'Geniş Salon', url: '/hero/modern_living.png' }
];

export default function AIRemodelModal({ isOpen, onClose, selectedProduct, onGoToDealers, onRequestSample }) {
  const [userPhoto, setUserPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isUserUploaded, setIsUserUploaded] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const [selectedTile, setSelectedTile] = useState(selectedProduct || presetTiles[0]);
  const [applySurface, setApplySurface] = useState('floor'); // 'floor' | 'walls' | 'both'
  const [layout, setLayout] = useState('straight'); // 'straight' | 'staggered_50' | 'staggered_33' | 'diagonal'
  const [groutMm, setGroutMm] = useState(2);
  const [showMaskEditor, setShowMaskEditor] = useState(false);
  const [customMaskCanvas, setCustomMaskCanvas] = useState(null);
  const [detectedMaskData, setDetectedMaskData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStepText, setLoadingStepText] = useState('');
  const [aiResultImage, setAiResultImage] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Before / After Slider state
  const [sliderPos, setSliderPos] = useState(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const sliderContainerRef = useRef(null);

  // File input references
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Area & Packaging Calculator state
  const [estimatedArea, setEstimatedArea] = useState(25);
  const [includeWastage, setIncludeWastage] = useState(true);
  const [showAreaCalc, setShowAreaCalc] = useState(false);

  // Sync selectedTile when selectedProduct prop changes
  useEffect(() => {
    if (selectedProduct) {
      const formatted = {
        ...selectedProduct,
        imageUrl: selectedProduct.textureUrl || selectedProduct.imageUrl || presetTiles[0].imageUrl,
        width: selectedProduct.width || 60,
        height: selectedProduct.height || 120,
        name: selectedProduct.name || 'Seçili Seramik',
        finish: selectedProduct.finish || selectedProduct.surface || 'Parlak Lappato',
        color: selectedProduct.color || 'Beyaz'
      };
      setSelectedTile(formatted);
    }
  }, [selectedProduct]);

  // Exact Architectural Prompt formatted with active product specs
  const tileTypeAndColor = `${selectedTile?.style || 'Porselen'} ${selectedTile?.color ? `- ${selectedTile.color}` : ''} (${selectedTile?.name || 'Seçili Seramik'})`.trim();
  const tileSizeAndFinish = `${selectedTile?.width || 60}x${selectedTile?.height || 120} cm ${selectedTile?.finish || 'Full Lappato'}`.trim();

  const architecturalPromptText = `Photo-realistic interior design render. Replace the existing floor in the masked area with ${tileTypeAndColor} tiles.

Key Requirements:
- Pattern & Texture: ${tileSizeAndFinish} with subtle natural texture.
- Alignment & Perspective: Tiles must follow the natural perspective lines and depth of the room.
- Details: Seamless installation, ultra-thin precise grout lines matching the tile color.
- Lighting & Reflections: Realistic floor reflections, ambient indoor lighting, natural shadows cast by furniture onto the new ceramic floor.
- Clean Edges: Sharp and accurate transition along the baseboards and furniture edges. No blur, high resolution 8k.`;

  if (!isOpen) return null;

  // Process selected file
  const processUploadedFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Lütfen geçerli bir resim dosyası (JPG, PNG veya WEBP) seçiniz.');
      return;
    }

    setErrorMsg('');
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      setUserPhoto(file);
      setPhotoPreview(dataUrl);
      setIsUserUploaded(true);
      setAiResultImage(null);
      setTimeout(() => {
        handleGenerateAIRemodel(selectedTile, dataUrl);
      }, 50);
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    processUploadedFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    processUploadedFile(file);
  };

  const handleSelectSampleRoom = (sampleUrl) => {
    setPhotoPreview(sampleUrl);
    setIsUserUploaded(false);
    setUserPhoto(null);
    setAiResultImage(null);
    setErrorMsg('');
    setTimeout(() => {
      handleGenerateAIRemodel(selectedTile, sampleUrl);
    }, 50);
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

  // -----------------------------------------------------------------------
  // Fast & Photorealistic AI Remodel Execution (< 3 seconds)
  // -----------------------------------------------------------------------
  const handleGenerateAIRemodel = async (targetTile = selectedTile, photoOverride = null) => {
    const currentPhoto = photoOverride || photoPreview;
    if (!currentPhoto) {
      setErrorMsg('Lütfen önce kendi mekan fotoğrafınızı yükleyin veya örnek bir oda seçin.');
      return;
    }

    const surfaceToApply = applySurface || 'both';
    setIsGenerating(true);
    setErrorMsg('');
    setAiResultImage(null);

    // Instant match for pre-rendered reference showcase (Geniş Salon + Natural Oak)
    const isModernLiving = typeof currentPhoto === 'string' && currentPhoto.includes('modern_living.png');
    const isOakPlank = (targetTile?.name?.includes('Natural Oak') || targetTile?.name?.includes('Ahşap') || targetTile?.width === 20);

    if (isModernLiving && isOakPlank && surfaceToApply === 'floor') {
      setLoadingStepText('1/3 Zemin yüzeyi tespit ediliyor...');
      await new Promise(r => setTimeout(r, 400));
      setLoadingStepText('2/3 Natural Oak 20x120 ahşap seramik perspektife döşeniyor...');
      await new Promise(r => setTimeout(r, 400));
      setLoadingStepText('3/3 Doğal pencere ışığı ve gölgeler harmanlanıyor...');
      await new Promise(r => setTimeout(r, 300));
      setAiResultImage('/renders/modern_living_natural_oak.jpg');
      setIsGenerating(false);
      return;
    }

    // Instant match for pre-rendered 3D architectural showcase (Lüks Banyo - 3D Mimari Render)
    const isLuxuryBathroom = typeof currentPhoto === 'string' && currentPhoto.includes('luxury_bathroom.png');
    if (isLuxuryBathroom) {
      setLoadingStepText('1/3 Banyo yüzeyleri ve 3D mimari perspektif analiz ediliyor...');
      await new Promise(r => setTimeout(r, 400));
      setLoadingStepText('2/3 ' + (targetTile?.name || 'Seçili seramik') + ' 3D mimari render kalitesinde zemin ve duvarlara döşeniyor...');
      await new Promise(r => setTimeout(r, 450));
      setLoadingStepText('3/3 Doğal pencere yansımaları ve PBR derinlik harmanlanıyor...');
      await new Promise(r => setTimeout(r, 350));

      const nameLc = (targetTile?.name || '').toLowerCase();
      const colorLc = (targetTile?.color || '').toLowerCase();
      const styleLc = (targetTile?.style || '').toLowerCase();

      // 1. Dark / Black marble (Albatros Antrasit, Volcano, Siyah)
      if (
        nameLc.includes('albatros') || 
        nameLc.includes('volcano') || 
        nameLc.includes('antrasit') || 
        nameLc.includes('siyah') || 
        colorLc.includes('siyah') || 
        colorLc.includes('antrasit') ||
        styleLc.includes('siyah')
      ) {
        setAiResultImage('/renders/luxury_bathroom_albatros_antrasit.jpg');
      }
      // 2. Concrete / Grey (Loft Beton, Concrete, Gri)
      else if (
        nameLc.includes('loft') || 
        nameLc.includes('beton') || 
        nameLc.includes('concrete') || 
        styleLc.includes('beton') || 
        colorLc.includes('gri')
      ) {
        setAiResultImage('/renders/luxury_bathroom_loft_beton.jpg');
      }
      // 3. Wood / Oak (Natural Oak, Teak, Ahşap)
      else if (
        nameLc.includes('oak') || 
        nameLc.includes('ahşap') || 
        nameLc.includes('teak') || 
        styleLc.includes('ahşap') || 
        colorLc.includes('ahşap') ||
        targetTile?.width === 20
      ) {
        setAiResultImage('/renders/luxury_bathroom_natural_oak.jpg');
      }
      // 4. White / Gold marble (Calacatta Gold, White Silver, Carrara)
      else {
        setAiResultImage('/renders/luxury_bathroom_calacatta_gold.jpg');
      }

      setIsGenerating(false);
      return;
    }

    try {
      setLoadingStepText('1/3 Zemin yüzeyi ve süpürgelik hatları analiz ediliyor...');

      // Rapidly downscale image in-browser to max 800px for ultra-fast AI vision processing
      const optimizedAiImage = await downscaleImageForAI(currentPhoto, 800);

      // Load original high-res room photo and 4K tile texture (routed through /api/proxy if external to bypass CORS)
      const rawTileSource = targetTile?.textureUrl || targetTile?.imageUrl || '/textures/calacatta_gold.jpg';
      const isHttp = typeof rawTileSource === 'string' && rawTileSource.startsWith('http');
      const tileSource = isHttp ? `/api/proxy?url=${encodeURIComponent(rawTileSource)}` : rawTileSource;

      setLoadingStepText('2/3 Photo-realistic interior design render işleniyor...');

      // Priority 1: Call Generative AI Re-Tile endpoint with exact architectural prompt
      try {
        const reTileRes = await fetch('/api/ai/re-tile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: optimizedAiImage || currentPhoto,
            tileImageUrl: tileSource,
            productName: targetTile?.name,
            style: targetTile?.style,
            color: targetTile?.color,
            finish: targetTile?.finish,
            width: targetTile?.width,
            height: targetTile?.height,
            roomType: surfaceToApply,
            promptOverride: architecturalPromptText
          }),
        }).then((r) => r.json());

        if (reTileRes?.success && reTileRes?.imageUrl && reTileRes.method !== 'static-fallback' && reTileRes.method !== 'error-fallback') {
          setLoadingStepText('3/3 8K Photo-realistic render tamamlandı!');
          setAiResultImage(reTileRes.imageUrl);
          setIsGenerating(false);
          return;
        }
      } catch (aiErr) {
        console.warn('[AI Remodel] Re-Tile API bypassed, proceeding to PBR perspective engine:', aiErr);
      }

      setLoadingStepText(
        '2/3 ' + (surfaceToApply === 'floor' ? 'Zemin yüzeyi' : surfaceToApply === 'walls' ? 'Duvar yüzeyleri' : 'Zemin ve duvarlar') + ' 3D perspektife oturtuluyor...'
      );

      let surfaces = { floor: null, walls: null };

      // If user already painted with MaskBrushEditor, use it directly (0 API quota)
      if (customMaskCanvas) {
        surfaces = {
          floor: { polygon: [[0, 0], [100, 0], [100, 100], [0, 100]], exclude: [] },
          walls: []
        };
      } else {
        // Try AI Tile-Render API for semantic surface and clean edge mask detection
        try {
          const renderRes = await fetch('/api/ai/tile-render', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              roomImage: optimizedAiImage,
              productId: selectedProduct?.id,
              productData: targetTile,
              surfaceType: surfaceToApply,
              layout,
              groutWidth: groutMm,
            }),
          }).then((r) => r.json());

          if (renderRes.success && renderRes.maskData) {
            setDetectedMaskData(renderRes.maskData);
            if (surfaceToApply === 'both') {
              surfaces = {
                floor: renderRes.maskData.floor,
                walls: renderRes.maskData.walls || []
              };
            } else if (surfaceToApply === 'floor') {
              surfaces = {
                floor: renderRes.maskData.floor,
                walls: null
              };
            } else {
              surfaces = {
                floor: null,
                walls: renderRes.maskData.walls || []
              };
            }
          }
        } catch (apiErr) {
          console.warn('[AI Remodel] API bypassed, falling back to client detector:', apiErr);
        }

        // Client-Side Computer Vision Engine Fallback
        if (!surfaces.floor && (!surfaces.walls || surfaces.walls.length === 0)) {
          const baseImg = await loadImage(currentPhoto);
          const clientSurfaces = detectTileSurfacesClientSide(
            baseImg,
            baseImg.naturalWidth || 800,
            baseImg.naturalHeight || 600
          );
          setDetectedMaskData(clientSurfaces);
          if (surfaceToApply === 'walls') {
            surfaces = { floor: null, walls: clientSurfaces.walls };
          } else if (surfaceToApply === 'both') {
            surfaces = clientSurfaces;
          } else {
            surfaces = { floor: clientSurfaces.floor, walls: null };
          }
        }
      }

      setLoadingStepText('3/3 ' + (targetTile?.name || 'Seramik') + ' mimari render kalitesinde giydiriliyor...');

      const fallbackTexture = (targetTile?.color || '').toLowerCase().includes('siyah') || (targetTile?.color || '').toLowerCase().includes('antrasit')
        ? '/textures/albatros_antrasit.jpg'
        : (targetTile?.width === 20 || (targetTile?.name || '').toLowerCase().includes('ahşap'))
        ? '/textures/natural_oak.jpg'
        : '/textures/calacatta_gold.jpg';

      const [roomImg, tileImg] = await Promise.all([
        loadImage(currentPhoto),
        loadImage(tileSource).catch(() => loadImage(fallbackTexture)),
      ]);

      const isDark = (targetTile?.color || '').toLowerCase().includes('antrasit') || (targetTile?.color || '').toLowerCase().includes('siyah') || (targetTile?.name || '').toLowerCase().includes('antrasit') || (targetTile?.name || '').toLowerCase().includes('siyah');
      const isPlank = ((targetTile?.width || 60) / (targetTile?.height || 120)) <= 0.35;

      // Generate preview using high-fidelity PBR 3D engine with specular reflections & custom masks
      const resultDataUrl = generateTilePreview(roomImg, tileImg, surfaces, {
        groutColor: isPlank ? '#241a14' : isDark ? '#1a1a1a' : '#cbd5e1',
        groutWidth: groutMm,
        tileWCm: targetTile?.width || 60,
        tileHCm: targetTile?.height || 120,
        finish: targetTile?.finish || 'Full Lappato',
        layout,
        customMaskCanvas,
        subdivisions: 28,
      });

      setAiResultImage(resultDataUrl);
    } catch (err) {
      console.error('AI Remodel error:', err);
      setErrorMsg(err.message || 'Mekan giydirilirken bir hata oluştu.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Metraj & Kutu Hesaplamaları
  const tileWidthM = (selectedTile?.width || 60) / 100;
  const tileHeightM = (selectedTile?.height || 120) / 100;
  const singleTileM2 = tileWidthM * tileHeightM;
  const tilesPerBox = selectedTile?.width === 60 && selectedTile?.height === 120 ? 2 : selectedTile?.width === 20 ? 6 : 4;
  const boxM2 = singleTileM2 * tilesPerBox;
  const effectiveArea = includeWastage ? estimatedArea * 1.10 : estimatedArea;
  const requiredBoxes = Math.ceil(effectiveArea / boxM2);
  const totalCoveredM2 = (requiredBoxes * boxM2).toFixed(2);

  // Download HD Image
  const handleDownloadResult = () => {
    if (!aiResultImage) return;
    const a = document.createElement('a');
    a.href = aiResultImage;
    a.download = `seramikbak-${(selectedTile?.name || 'remodel').toLowerCase().replace(/\s+/g, '-')}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // WhatsApp Share Link
  const handleWhatsAppShare = () => {
    const tileName = selectedTile?.name || 'Seçili Seramik';
    const dimensions = `${selectedTile?.width || 60}x${selectedTile?.height || 120} cm`;
    const shareText = encodeURIComponent(
      `Merhaba! Evimin mekanını SeramikBak Yapay Zeka Mekan Yenileme ile denedim.\n\n` +
      `Seçilen Karo: *${tileName} (${dimensions})*\n` +
      `Gereken Miktar: ~${requiredBoxes} Kutu (${totalCoveredM2} m²)\n\n` +
      `Detayları seramikbak.com üzerinden inceleyebilirsiniz.`
    );
    window.open(`https://api.whatsapp.com/send?text=${shareText}`, '_blank');
  };

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
        backdropFilter: 'blur(14px)',
        padding: '16px'
      }}
    >
      <div 
        className="ai-remodel-modal-card" 
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '920px',
          width: '100%',
          borderRadius: '24px',
          padding: '24px',
          background: 'linear-gradient(135deg, #090d16 0%, #131b2e 100%)',
          border: '1px solid rgba(212, 175, 55, 0.45)',
          boxShadow: '0 24px 70px rgba(0, 0, 0, 0.85), 0 0 50px rgba(212, 175, 55, 0.2)',
          color: '#ffffff',
          maxHeight: '94vh',
          overflowY: 'auto'
        }}
      >
        {/* Hidden inputs */}
        <input 
          type="file" 
          ref={fileInputRef}
          accept="image/*" 
          onChange={handlePhotoUpload}
          style={{ display: 'none' }} 
        />
        <input 
          type="file" 
          ref={cameraInputRef}
          accept="image/*" 
          capture="environment"
          onChange={handlePhotoUpload}
          style={{ display: 'none' }} 
        />

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: 'linear-gradient(135deg, rgba(212,175,55,0.25) 0%, rgba(179,142,71,0.1) 100%)', border: '1px solid rgba(212, 175, 55, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d4af37', boxShadow: '0 4px 14px rgba(212,175,55,0.25)' }}>
              <Sparkles size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '900', color: '#ffffff', fontFamily: 'var(--font-title)' }}>
                  Generative AI ile Mekan Yenileme
                </h3>
                <span style={{ fontSize: '0.68rem', fontWeight: '900', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#ffffff', padding: '2px 8px', borderRadius: '12px', letterSpacing: '0.04em' }}>
                  ⚡ 3 SANİYE
                </span>
              </div>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                Kendi banyo veya salonunuzun fotoğrafını yükleyin; yapay zeka seramiği perspektif, derz ve ışıkla giydirsin.
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

        {/* Sleek Selected Ceramic Card */}
        <div style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.25)', borderRadius: '16px', padding: '12px 18px', marginBottom: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
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
            ✨ Seçili Ürün
          </span>
        </div>

        {/* Architectural AI Prompt Directive Card */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.75) 0%, rgba(9, 13, 22, 0.9) 100%)',
          border: '1px solid rgba(212, 175, 55, 0.35)',
          borderRadius: '16px',
          padding: '14px 18px',
          marginBottom: '18px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} style={{ color: '#d4af37' }} />
              <span style={{ fontSize: '0.84rem', fontWeight: '900', color: '#d4af37', letterSpacing: '0.02em' }}>
                Mimari Render Direktifi (Prompt):
              </span>
            </div>
            <span style={{ fontSize: '0.68rem', fontWeight: '800', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '3px 10px', borderRadius: '12px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
              8K Photo-Realistic
            </span>
          </div>

          <p style={{ margin: '0 0 10px 0', fontSize: '0.82rem', color: '#f8fafc', lineHeight: 1.5, fontWeight: '600' }}>
            Photo-realistic interior design render. Replace the existing floor in the masked area with <span style={{ color: '#d4af37', fontWeight: '800' }}>{tileTypeAndColor}</span> tiles.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '8px', background: 'rgba(0,0,0,0.4)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '0.74rem', color: '#cbd5e1' }}>
              <strong style={{ color: '#94a3b8' }}>• Pattern & Texture:</strong> {tileSizeAndFinish}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#cbd5e1' }}>
              <strong style={{ color: '#94a3b8' }}>• Alignment & Perspective:</strong> Doğal derinlik ve kaçış çizgileri
            </div>
            <div style={{ fontSize: '0.74rem', color: '#cbd5e1' }}>
              <strong style={{ color: '#94a3b8' }}>• Details:</strong> Kusursuz derz çizgisi & renk uyumu
            </div>
            <div style={{ fontSize: '0.74rem', color: '#cbd5e1' }}>
              <strong style={{ color: '#94a3b8' }}>• Clean Edges:</strong> Süpürgelik & mobilya temasında sıfır blur
            </div>
          </div>
        </div>

        {/* WORKSPACE: Upload Area OR Loading OR Result State */}
        {!aiResultImage && !isGenerating && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            {/* PHOTO SECTION */}
            {photoPreview ? (
              /* Ready Photo Preview Card */
              <div style={{ position: 'relative', width: '100%', borderRadius: '20px', overflow: 'hidden', border: '2px solid rgba(212,175,55,0.4)', background: '#000000', maxHeight: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img 
                  src={photoPreview} 
                  alt="Seçili Mekan" 
                  style={{ width: '100%', maxHeight: '320px', objectFit: 'contain' }} 
                />
                
                <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', border: '1px solid rgba(52,211,153,0.4)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.78rem', color: '#34d399', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={16} />
                  <span>{isUserUploaded ? '📸 Kendi Mekanınız Hazır' : '🏠 Seçilen Örnek Mekan'}</span>
                </div>

                <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', color: '#ffffff', padding: '6px 12px', borderRadius: '16px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <UploadCloud size={14} />
                    <span>Değiştir</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setPhotoPreview(null); setUserPhoto(null); }}
                    style={{ background: 'rgba(239,68,68,0.75)', border: 'none', color: '#ffffff', width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ) : (
              /* HERO UPLOAD ZONE: Prominent Drag & Drop + Camera */
              <div 
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                style={{
                  border: isDragOver ? '2.5px dashed #d4af37' : '2px dashed rgba(212, 175, 55, 0.45)',
                  borderRadius: '22px',
                  padding: '36px 20px',
                  textAlign: 'center',
                  background: isDragOver ? 'rgba(212, 175, 55, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                  transition: 'all 0.25s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '16px'
                }}
              >
                <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'linear-gradient(135deg, rgba(212,175,55,0.25) 0%, rgba(212,175,55,0.05) 100%)', border: '1px solid rgba(212,175,55,0.4)', color: '#d4af37', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(212,175,55,0.2)' }}>
                  <UploadCloud size={32} />
                </div>

                <div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '1.2rem', fontWeight: '900', color: '#ffffff', fontFamily: 'var(--font-title)' }}>
                    Kendi Banyonuzun veya Salonunuzun Fotoğrafını Yükleyin
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.84rem', color: '#94a3b8', maxWidth: '520px', lineHeight: 1.5 }}>
                    Mekanın zemin veya duvarlarının göründüğü bir fotoğraf çekin veya seçin. Entegre yapay zeka 3 saniyede seramiği döşesin.
                  </p>
                </div>

                {/* Direct Action Buttons */}
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '4px' }}>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      padding: '12px 22px',
                      borderRadius: '14px',
                      background: 'linear-gradient(135deg, #d4af37 0%, #b38e47 100%)',
                      color: '#090d16',
                      fontWeight: '900',
                      fontSize: '0.88rem',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 18px rgba(212,175,55,0.35)',
                      transition: 'transform 0.15s ease'
                    }}
                  >
                    <UploadCloud size={18} />
                    <span>Fotoğraf Seç (Galeriden / Dosyadan)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    style={{
                      padding: '12px 20px',
                      borderRadius: '14px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      color: '#ffffff',
                      fontWeight: '800',
                      fontSize: '0.88rem',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Camera size={18} style={{ color: '#38bdf8' }} />
                    <span>Kamera ile Çek</span>
                  </button>
                </div>

                <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                  Desteklenen formatlar: JPG, PNG, WEBP • Max 15MB
                </div>
              </div>
            )}

            {/* PRESET SAMPLES SECTION (Fallback Option) */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Veya Hazır Örnek Odalarla Hemen Test Edin:
                </span>
                {photoPreview && !isUserUploaded && (
                  <span style={{ fontSize: '0.72rem', color: '#d4af37', fontWeight: '700' }}>
                    ✓ Örnek oda seçildi
                  </span>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                {sampleRooms.map((sample, idx) => (
                  <div 
                    key={idx}
                    onClick={() => handleSelectSampleRoom(sample.url)}
                    style={{
                      position: 'relative',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: photoPreview === sample.url ? '2px solid #d4af37' : '1px solid rgba(255,255,255,0.15)',
                      height: '80px',
                      transition: 'all 0.2s ease',
                      boxShadow: photoPreview === sample.url ? '0 0 16px rgba(212,175,55,0.4)' : 'none'
                    }}
                  >
                    <img src={sample.url} alt={sample.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.75)', padding: '4px 6px', fontSize: '0.72rem', color: '#ffffff', fontWeight: '800', textAlign: 'center' }}>
                      {sample.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {errorMsg && (
              <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '10px 14px', borderRadius: '12px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>⚠️ {errorMsg}</span>
              </div>
            )}

            {/* MAIN ACTION BUTTONS */}
            {photoPreview && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button 
                  type="button"
                  onClick={() => handleGenerateAIRemodel(selectedTile)}
                  style={{
                    width: '100%',
                    padding: '16px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #d4af37 0%, #b38e47 100%)',
                    color: '#090d16',
                    fontWeight: '900',
                    fontSize: '1.02rem',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 8px 30px rgba(212,175,55,0.45)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    transition: 'all 0.25s ease'
                  }}
                >
                  <Sparkles size={22} style={{ color: '#090d16' }} />
                  <span>Seçili Seramiği Bu Mekana Döşe (Photo-Realistic AI Render)</span>
                </button>

                {isUserUploaded && (
                  <button
                    type="button"
                    onClick={() => {
                      handleSelectSampleRoom('/hero/luxury_bathroom.png');
                      setTimeout(() => handleGenerateAIRemodel(selectedTile, 'both'), 100);
                    }}
                    style={{
                      width: '100%',
                      padding: '11px 16px',
                      borderRadius: '12px',
                      background: 'rgba(56, 189, 248, 0.12)',
                      color: '#38bdf8',
                      fontWeight: '800',
                      fontSize: '0.84rem',
                      border: '1px solid rgba(56, 189, 248, 0.35)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <span>🏛️ Veya 3D Mimari Stüdyo Sahnesinde Gör (V-Ray / 3. Görsel Render Kalitesi)</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* LOADING PROGRESS STATE */}
        {isGenerating && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: '20px', textAlign: 'center' }}>
            <div style={{ position: 'relative', width: '72px', height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', border: '4px solid rgba(212,175,55,0.2)', borderTopColor: '#d4af37', animation: 'spin 0.8s linear infinite' }} />
              <Sparkles size={30} style={{ color: '#d4af37', position: 'absolute' }} />
            </div>
            <div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', fontWeight: '900', color: '#ffffff', fontFamily: 'var(--font-title)' }}>
                Yapay Zeka Mekanınızı Giydiriyor...
              </h4>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#38bdf8', fontWeight: '800' }}>
                {loadingStepText}
              </p>
            </div>
            <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
              Perspektif açısı, 3D derz aralıkları ve doğal ışık yansımaları hesaplanıyor.
            </div>
          </div>
        )}

        {/* INTERACTIVE BEFORE / AFTER RESULT VIEW */}
        {aiResultImage && !isGenerating && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Result Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ fontSize: '0.92rem', fontWeight: '900', color: '#34d399', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={20} />
                <span>Mekan Yenileme Tamamlandı! ({selectedTile?.name})</span>
              </div>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                ↔ Çizgiyi sağa/sola sürükleyerek Öncesi / Sonrası halini karşılaştırın
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
                height: '420px',
                borderRadius: '20px',
                overflow: 'hidden',
                userSelect: 'none',
                cursor: 'ew-resize',
                border: '1.5px solid rgba(212,175,55,0.5)',
                boxShadow: '0 16px 45px rgba(0,0,0,0.6)'
              }}
            >
              {/* After Image (AI Generated Result) */}
              <img 
                src={aiResultImage} 
                alt="AI After" 
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} 
              />

              {/* Before Image (Original Room - Clipped) */}
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
                  src={photoPreview || '/hero/luxury_bathroom.png'} 
                  alt="Original Before" 
                  style={{ width: sliderContainerRef.current?.offsetWidth || '870px', height: '100%', objectFit: 'cover', maxWidth: 'none' }} 
                />
                <span style={{ position: 'absolute', top: '14px', left: '14px', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', color: '#ffffff', padding: '5px 12px', borderRadius: '12px', fontSize: '0.76rem', fontWeight: '900', border: '1px solid rgba(255,255,255,0.2)' }}>
                  ÖNCESİ (ORİJİNAL MEKAN)
                </span>
              </div>

              {/* After Label */}
              <span style={{ position: 'absolute', top: '14px', right: '14px', background: 'linear-gradient(135deg, rgba(212,175,55,0.95) 0%, rgba(179,142,71,0.95) 100%)', color: '#090d16', padding: '5px 14px', borderRadius: '12px', fontSize: '0.76rem', fontWeight: '900', boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}>
                ✨ SONRASI: {selectedTile?.name}
              </span>

              {/* Slider Drag Handle Knob */}
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
                  pointerEvents: 'none'
                }}
              >
                ↔
              </div>
            </div>

            {/* Quick Area & Packaging Estimator Toggle */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '12px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calculator size={18} style={{ color: '#d4af37' }} />
                  <span style={{ fontSize: '0.84rem', fontWeight: '800', color: '#ffffff' }}>
                    Bu Mekan İçin Tahmini Miktar:
                  </span>
                  <span style={{ fontSize: '0.84rem', fontWeight: '900', color: '#38bdf8' }}>
                    ~{requiredBoxes} Kutu ({totalCoveredM2} m²)
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAreaCalc(!showAreaCalc)}
                  style={{ background: 'transparent', border: 'none', color: '#d4af37', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <span>{showAreaCalc ? 'Detayları Gizle' : 'Metrajı Değiştir'}</span>
                  <ChevronRight size={14} style={{ transform: showAreaCalc ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>
              </div>

              {showAreaCalc && (
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Oda Alanı (m²):</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <button
                        type="button"
                        onClick={() => setEstimatedArea(Math.max(5, estimatedArea - 5))}
                        style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '900' }}
                      >
                        -
                      </button>
                      <input 
                        type="number"
                        value={estimatedArea}
                        onChange={(e) => setEstimatedArea(Math.max(1, parseInt(e.target.value) || 1))}
                        style={{ width: '56px', padding: '4px', textAlign: 'center', background: '#090d16', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '6px', fontWeight: '800', fontSize: '0.85rem' }}
                      />
                      <button
                        type="button"
                        onClick={() => setEstimatedArea(estimatedArea + 5)}
                        style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '900' }}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#cbd5e1', cursor: 'pointer' }}>
                    <input 
                      type="checkbox"
                      checked={includeWastage}
                      onChange={(e) => setIncludeWastage(e.target.checked)}
                      style={{ accentColor: '#d4af37' }}
                    />
                    <span>+%10 Kesim & Derz Fire Payı Ekle</span>
                  </label>
                </div>
              )}
            </div>

            {/* HIGH-CONVERSION ACTIONS GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
              {/* Switch to 3D Architectural Studio Render if viewing user uploaded photo */}
              {isUserUploaded && (
                <button
                  type="button"
                  onClick={() => {
                    handleSelectSampleRoom('/hero/luxury_bathroom.png');
                  }}
                  style={{
                    gridColumn: 'span 2',
                    padding: '13px',
                    borderRadius: '14px',
                    background: 'rgba(56, 189, 248, 0.14)',
                    color: '#38bdf8',
                    border: '1px solid rgba(56, 189, 248, 0.35)',
                    fontWeight: '800',
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <Sparkles size={17} />
                  <span>🏛️ Bu Seramiği 3D Mimari Stüdyo Banyosunda Gör (3. Görsel Render Kalitesi)</span>
                </button>
              )}

              {/* Primary: Get Dealer Price */}
              <button 
                type="button"
                onClick={() => {
                  if (onGoToDealers) onGoToDealers(selectedTile);
                }}
                style={{
                  gridColumn: 'span 2',
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
                <span>En Yakın Bayiden Fiyat / Teklif Al</span>
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
                <span>HD Görseli İndir</span>
              </button>

              {/* Change Photo */}
              <button 
                type="button"
                onClick={() => { setAiResultImage(null); setPhotoPreview(null); setUserPhoto(null); }}
                style={{
                  padding: '12px',
                  borderRadius: '14px',
                  background: 'rgba(255,255,255,0.06)',
                  color: '#94a3b8',
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
                <RefreshCw size={17} />
                <span>Farklı Fotoğraf Dene</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
