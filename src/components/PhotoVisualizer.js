'use client';

import { useState, useEffect, useRef } from 'react';
import { Camera, Image as ImageIcon, Download, Sparkles, HelpCircle, Loader2, Sliders, RefreshCw, Upload, CheckCircle2 } from 'lucide-react';
import { cropWhiteBorders } from '../utils/imageTextureUtils';

// Preset Bathroom Photos for quick testing
const PRESET_BATHROOMS = [
  {
    id: 'preset_1',
    name: 'Modern Ferah Banyo (Örnek 1)',
    url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'preset_2',
    name: 'Geniş Lüks Banyo (Örnek 2)',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'preset_3',
    name: 'Minimal Banyo & Duş (Örnek 3)',
    url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80'
  }
];

export default function PhotoVisualizer({ activeProduct }) {
  const [selectedPreset, setSelectedPreset] = useState(PRESET_BATHROOMS[0]);
  const [userUploadedImageUrl, setUserUploadedImageUrl] = useState(null);
  const [backgroundImageObj, setBackgroundImageObj] = useState(null);

  // Generative AI States
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiResultImageObj, setAiResultImageObj] = useState(null);
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [sliderPos, setSliderPos] = useState(50); // 0 to 100%
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);

  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Current active background photo URL
  const currentRoomPhotoUrl = userUploadedImageUrl || selectedPreset?.url;

  // Load Background Image
  useEffect(() => {
    if (!currentRoomPhotoUrl) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = currentRoomPhotoUrl;
    img.onload = () => {
      setBackgroundImageObj(img);
      setAiResultImageObj(null);
      setIsCompareMode(false);
    };
  }, [currentRoomPhotoUrl]);

  // Redraw Visualizer Canvas
  useEffect(() => {
    draw();
  }, [backgroundImageObj, aiResultImageObj, isCompareMode, sliderPos]);

  // ChatGPT-Style Generative AI Re-Tiling Call
  const handleGenerateAiReTile = async () => {
    setAiGenerating(true);
    try {
      const response = await fetch('/api/ai/re-tile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: currentRoomPhotoUrl,
          productName: activeProduct?.name || 'Calacatta Gold',
          productCode: activeProduct?.code || 'CLM-60120',
          style: activeProduct?.style || 'Mermer',
          color: activeProduct?.color || 'Beyaz',
          finish: activeProduct?.finish || 'Parlak',
          width: activeProduct?.width || 60,
          height: activeProduct?.height || 120
        })
      });

      const data = await response.json();
      if (data.success && data.imageUrl) {
        const img = new Image();
        img.src = data.imageUrl;
        img.onload = () => {
          setAiResultImageObj(img);
          setIsCompareMode(true);
          setAiGenerating(false);
        };
      } else {
        throw new Error(data.error || 'AI görsel yanıtı alınamadı.');
      }
    } catch (err) {
      console.error('AI error:', err);
      setAiGenerating(false);
      alert('Yapay zeka banyo kaplama görseli oluşturulurken sunucu yanıt vermedi. Lütfen tekrar deneyin.');
    }
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas || !backgroundImageObj) return;

    const ctx = canvas.getContext('2d');
    const width = containerRef.current?.clientWidth || 800;
    const height = Math.min(width * (backgroundImageObj.naturalHeight / backgroundImageObj.naturalWidth), 550);

    canvas.width = width;
    canvas.height = height;

    // 1. Draw Uploaded Original Bathroom Photo (Left side or Full background)
    ctx.drawImage(backgroundImageObj, 0, 0, width, height);

    // 2. Draw Transformed AI Room (If AI image loaded or compare mode active)
    const activeResultImg = aiResultImageObj || backgroundImageObj;

    if (isCompareMode || aiResultImageObj) {
      const splitX = (sliderPos / 100) * width;

      // Draw AI Transformed Image on the Right Split
      ctx.save();
      ctx.beginPath();
      ctx.rect(splitX, 0, width - splitX, height);
      ctx.clip();
      ctx.drawImage(activeResultImg, 0, 0, width, height);
      ctx.restore();

      // Draw Split Line Divider
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(splitX, 0);
      ctx.lineTo(splitX, height);
      ctx.stroke();

      // Circular Slider Handle Knob
      ctx.fillStyle = '#d4af37';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(splitX, height / 2, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#0f172a';
      ctx.font = '900 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('↔', splitX, height / 2 + 4);
    }
  };

  // Split Slider Drag Interaction
  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const splitX = (sliderPos / 100) * canvas.width;

    if (Math.abs(mouseX - splitX) < 35) {
      setIsDraggingSlider(true);
    }
  };

  const handleMouseMove = (e) => {
    if (!isDraggingSlider) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const newPos = Math.max(5, Math.min(95, (mouseX / canvas.width) * 100));
    setSliderPos(newPos);
  };

  const handleMouseUp = () => setIsDraggingSlider(false);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setUserUploadedImageUrl(event.target.result);
      setSelectedPreset(null);
    };
    reader.readAsDataURL(file);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    const link = document.createElement('a');
    link.download = `seramikbak_ai_banyo_${activeProduct?.code || 'tasarim'}.jpg`;
    link.href = dataUrl;
    link.click();
  };

  const handleExportInstagramStory = () => {
    const canvas = canvasRef.current;
    if (!canvas || !backgroundImageObj) return;

    const storyCanvas = document.createElement('canvas');
    storyCanvas.width = 1080;
    storyCanvas.height = 1920;
    const sCtx = storyCanvas.getContext('2d');

    const bgGradient = sCtx.createLinearGradient(0, 0, 0, 1920);
    bgGradient.addColorStop(0, '#090d16');
    bgGradient.addColorStop(0.5, '#0f172a');
    bgGradient.addColorStop(1, '#020617');
    sCtx.fillStyle = bgGradient;
    sCtx.fillRect(0, 0, 1080, 1920);

    sCtx.fillStyle = '#d4af37';
    sCtx.font = '900 48px "Outfit", sans-serif';
    sCtx.textAlign = 'center';
    sCtx.fillText('SERAMİKBAK AI STÜDYO', 540, 140);

    sCtx.fillStyle = '#94a3b8';
    sCtx.font = '500 28px "Plus Jakarta Sans", sans-serif';
    sCtx.fillText('Fotoğraftan ChatGPT Tarzı Seramik Dönüşümü', 540, 190);

    const targetW = 960;
    const targetH = Math.min(1100, Math.round(targetW * (canvas.height / canvas.width)));
    const targetX = (1080 - targetW) / 2;
    const targetY = 260;

    sCtx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
    sCtx.lineWidth = 4;
    sCtx.strokeRect(targetX - 4, targetY - 4, targetW + 8, targetH + 8);
    sCtx.drawImage(canvas, targetX, targetY, targetW, targetH);

    const badgeY = targetY + targetH + 60;
    sCtx.fillStyle = 'rgba(30, 41, 59, 0.9)';
    sCtx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    sCtx.lineWidth = 2;
    sCtx.beginPath();
    sCtx.roundRect(targetX, badgeY, targetW, 280, 24);
    sCtx.fill();
    sCtx.stroke();

    sCtx.fillStyle = '#ffffff';
    sCtx.font = '800 36px "Outfit", sans-serif';
    sCtx.textAlign = 'left';
    sCtx.fillText(activeProduct?.name || 'Özel Tasarım Seramik', targetX + 40, badgeY + 70);

    sCtx.fillStyle = '#d4af37';
    sCtx.font = '600 28px "Plus Jakarta Sans", sans-serif';
    sCtx.fillText(`${activeProduct?.width || 60}x${activeProduct?.height || 120} cm • ${activeProduct?.finish || 'Parlak'} • ${activeProduct?.style || 'Mermer'}`, targetX + 40, badgeY + 120);

    sCtx.fillStyle = '#94a3b8';
    sCtx.font = '400 24px "Plus Jakarta Sans", sans-serif';
    sCtx.fillText('Kendi Banyonu Canlı Dönüştür ➔ seramikbak.com', targetX + 40, badgeY + 180);

    const dataUrl = storyCanvas.toDataURL('image/jpeg', 0.92);
    const link = document.createElement('a');
    link.download = `seramikbak_instagram_story_${activeProduct?.code || 'banyo'}.jpg`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 3-Step ChatGPT Workflow Header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '14px'
      }}>
        {/* Step 1: Upload Photo */}
        <div style={{
          padding: '16px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ background: 'var(--accent-gold, #d4af37)', color: '#0f172a', fontWeight: '900', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>1</div>
            <strong style={{ fontSize: '0.85rem', color: '#fff' }}>Banyo Fotoğrafını Yükle</strong>
          </div>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            style={{ display: 'none' }}
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: '10px',
              borderRadius: '8px',
              border: '1px dashed var(--accent-gold, #d4af37)',
              background: 'rgba(212, 175, 55, 0.08)',
              color: 'var(--accent-gold, #d4af37)',
              fontSize: '0.78rem',
              fontWeight: '800',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Upload size={14} />
            <span>{userUploadedImageUrl ? '📸 Yüklenen Fotoğrafı Değiştir' : '📸 Kendi Banyo Fotoğrafını Yükle'}</span>
          </button>

          {/* Presets Bar */}
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '2px' }}>
            {PRESET_BATHROOMS.map(preset => (
              <button
                key={preset.id}
                onClick={() => { setSelectedPreset(preset); setUserUploadedImageUrl(null); }}
                style={{
                  fontSize: '0.65rem',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: selectedPreset?.id === preset.id && !userUploadedImageUrl ? '1px solid var(--accent-gold, #d4af37)' : '1px solid rgba(255,255,255,0.06)',
                  background: selectedPreset?.id === preset.id && !userUploadedImageUrl ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255,255,255,0.02)',
                  color: selectedPreset?.id === preset.id && !userUploadedImageUrl ? 'var(--accent-gold, #d4af37)' : '#94a3b8',
                  cursor: 'pointer'
                }}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Selected Ceramic */}
        <div style={{
          padding: '16px',
          background: 'rgba(197, 160, 89, 0.06)',
          border: '1px solid rgba(197, 160, 89, 0.2)',
          borderRadius: '14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ background: 'var(--accent-gold, #d4af37)', color: '#0f172a', fontWeight: '900', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>2</div>
            <strong style={{ fontSize: '0.85rem', color: '#fff' }}>Döşenecek Seramik Modeli</strong>
          </div>
          <div>
            <span style={{ fontSize: '0.9rem', fontWeight: '900', color: '#fff', display: 'block' }}>{activeProduct?.name || 'Calacatta Gold Luxury'}</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--accent-gold, #d4af37)', fontWeight: '600' }}>
              {activeProduct?.width || 60}x{activeProduct?.height || 120} cm • {activeProduct?.finish || 'Parlak'} • {activeProduct?.style || 'Mermer'}
            </span>
          </div>
          <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>
            *Katalogdan herhangi bir seramik seçtiğinizde burası otomatik güncellenir.
          </span>
        </div>

        {/* Step 3: Generate AI */}
        <div style={{
          padding: '16px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '14px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ background: 'var(--accent-gold, #d4af37)', color: '#0f172a', fontWeight: '900', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>3</div>
            <strong style={{ fontSize: '0.85rem', color: '#fff' }}>ChatGPT Tarzı AI Döşeme</strong>
          </div>

          <button
            onClick={handleGenerateAiReTile}
            disabled={aiGenerating}
            style={{
              padding: '12px 18px',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, var(--accent-gold, #d4af37), #b8860b)',
              color: '#0f172a',
              cursor: 'pointer',
              fontWeight: '900',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 18px rgba(212, 175, 55, 0.4)'
            }}
          >
            {aiGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            <span>{aiGenerating ? 'AI Fotoğrafınızı Dönüştürüyor...' : '✨ Yapay Zeka ile Banyonu Döşe'}</span>
          </button>
        </div>
      </div>

      {/* Editor Main Canvas & Before/After Split */}
      <div style={{
        position: 'relative',
        background: '#020617',
        border: '1px solid rgba(212, 175, 55, 0.25)',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        
        {/* Canvas */}
        <div ref={containerRef} style={{ width: '100%', position: 'relative' }}>
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={(e) => e.touches.length === 1 && handleMouseDown({ clientX: e.touches[0].clientX })}
            onTouchMove={(e) => e.touches.length === 1 && handleMouseMove({ clientX: e.touches[0].clientX })}
            onTouchEnd={handleMouseUp}
            style={{
              display: 'block',
              maxWidth: '100%',
              cursor: isCompareMode ? 'col-resize' : 'default'
            }}
          />

          {/* Banner Badges */}
          <div style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            borderRadius: '10px',
            padding: '8px 14px',
            fontSize: '0.75rem',
            color: '#fff',
            fontWeight: '800',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Sparkles size={14} style={{ color: 'var(--accent-gold, #d4af37)' }} />
            <span>{aiResultImageObj ? 'ChatGPT Tarzı Dönüştürülmüş AI Görseli' : 'Yüklenen Orijinal Fotoğraf'}</span>
          </div>

          {aiResultImageObj && (
            <div style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '10px',
              padding: '6px 12px',
              fontSize: '0.72rem',
              color: '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Sliders size={12} style={{ color: 'var(--accent-gold, #d4af37)' }} />
              <span>Sürgüyü sağa-sola kaydırarak Öncesi/Sonrası kıyaslayın</span>
            </div>
          )}
        </div>

        {/* Bottom Toolbar */}
        <div style={{
          width: '100%',
          padding: '14px 24px',
          background: 'rgba(15, 23, 42, 0.9)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Seçili Görsel:</span>
            <strong style={{ fontSize: '0.82rem', color: '#fff' }}>
              {userUploadedImageUrl ? 'Yüklediğiniz Özel Banyo Fotoğrafı' : selectedPreset?.name}
            </strong>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {aiResultImageObj && (
              <button
                onClick={() => setIsCompareMode(!isCompareMode)}
                style={{
                  fontSize: '0.75rem',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--accent-gold, #d4af37)',
                  background: 'rgba(212, 175, 55, 0.15)',
                  color: 'var(--accent-gold, #d4af37)',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Sliders size={14} />
                <span>{isCompareMode ? 'Tam Görsele Geç' : 'Öncesi / Sonrası Sürgüsü'}</span>
              </button>
            )}

            <button
              onClick={handleDownload}
              style={{
                fontSize: '0.75rem',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: 'rgba(255,255,255,0.1)',
                color: '#fff',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Download size={14} />
              <span>Görseli İndir</span>
            </button>

            <button
              onClick={handleExportInstagramStory}
              style={{
                fontSize: '0.75rem',
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid rgba(225, 48, 108, 0.4)',
                background: 'rgba(225, 48, 108, 0.15)',
                color: '#f472b6',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Sparkles size={14} />
              <span>Instagram Story (9:16)</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
