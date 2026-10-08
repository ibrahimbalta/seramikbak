'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Sparkles, 
  Upload, 
  Camera, 
  Move, 
  Paintbrush, 
  RotateCcw, 
  Download, 
  Send, 
  X, 
  Check, 
  Layers, 
  Sliders, 
  ChevronRight, 
  Eye, 
  Maximize2, 
  RefreshCw,
  Info,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Scissors
} from 'lucide-react';
import { generateTilePreview, loadImage, downscaleImageForAI } from './TilePerspectiveEngine';
import MaskBrushEditor from './MaskBrushEditor';
import { 
  resolveSafeTextureUrl, 
  buildSurfaces, 
  validateUploadFile 
} from '../utils/renovationUtils';
import { analyzeRoomSurfaces } from '../services/RoomAnalysisService';


// Preset rooms for quick trial without uploading
const QUICK_ROOM_PRESETS = [
  {
    id: 'easy_bathroom',
    name: 'Modern Ferah Banyo',
    url: '/hero/easy_bathroom.jpg',
    floorQuad: [ [0, 71], [100, 71], [100, 100], [0, 100] ],
    wallQuad: [ [32, 19], [69, 19], [69, 71], [32, 71] ],
    obstacles: [
      { type: 'vanity', polygon: [[30, 54], [70, 54], [70, 69], [30, 69]] },
      { type: 'mirror', polygon: [[40, 24], [60, 24], [60, 51], [40, 51]] }
    ]
  },
  {
    id: 'easy_kitchen',
    name: 'Modern Ada Mutfak',
    url: '/hero/easy_kitchen.jpg',
    floorQuad: [ [0, 62], [100, 62], [100, 100], [0, 100] ],
    wallQuad: [ [31, 31], [69, 31], [69, 50], [31, 50] ]
  },
  {
    id: 'modern_living',
    name: 'Çağdaş Ferah Salon',
    url: '/hero/modern_living.png',
    fgUrl: '/hero/modern_living_fg.png',
    floorQuad: [ [0, 56], [100, 56], [100, 100], [0, 100] ],
    wallQuad: [ [0, 12], [100, 12], [100, 56], [0, 56] ]
  }
];

export default function RoomRenovationModal({ 
  isOpen, 
  onClose, 
  product, 
  relatedProducts = [], 
  onOpenQuote 
}) {
  // Active product selection (allows switching tiles on the same room)
  const [currentProduct, setCurrentProduct] = useState(product);

  // Background room photo state
  const [roomPhotoUrl, setRoomPhotoUrl] = useState(QUICK_ROOM_PRESETS[0].url);
  const [roomImgObj, setRoomImgObj] = useState(null);
  const [isCustomUpload, setIsCustomUpload] = useState(false);

  // Surface target: 'floor' | 'walls' | 'both'
  const [activeSurface, setActiveSurface] = useState('floor');

  // Perspective 4-corner quads (percentages [0-100])
  // [ Top-Left, Top-Right, Bottom-Right, Bottom-Left ]
  const [floorQuad, setFloorQuad] = useState(QUICK_ROOM_PRESETS[0].floorQuad);
  const [wallQuad, setWallQuad] = useState(QUICK_ROOM_PRESETS[0].wallQuad);

  // AI Room Analysis & Obstacle Detection state
  const [isAnalyzingRoom, setIsAnalyzingRoom] = useState(false);
  const [detectedObstacles, setDetectedObstacles] = useState([]);
  const [detectedWalls, setDetectedWalls] = useState([]);

  // Active pin editor mode ('none' | 'floor' | 'walls')
  const [pinEditingMode, setPinEditingMode] = useState('none');
  const [draggedPinIndex, setDraggedPinIndex] = useState(null);

  // Brush mask editor modal toggle
  const [isBrushOpen, setIsBrushOpen] = useState(false);
  const [customMaskCanvas, setCustomMaskCanvas] = useState(null);

  // Tiling & Grout options
  const [groutColor, setGroutColor] = useState('#222222');
  const [groutWidth, setGroutWidth] = useState(1.5);
  const [layout, setLayout] = useState('straight');
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  // Render & Comparison state
  const [renderedDataUrl, setRenderedDataUrl] = useState(null);
  const [beforeDataUrl, setBeforeDataUrl] = useState(null);
  const [tileOrientation, setTileOrientation] = useState('vertical'); // 'vertical' | 'horizontal'
  const [isRendering, setIsRendering] = useState(false);
  const [renderError, setRenderError] = useState(null);
  const [sliderPos, setSliderPos] = useState(50); // 0 to 100
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);

  // SegFormer AI Python Microservice states
  const [pythonAiOnline, setPythonAiOnline] = useState(false);
  const [engineMode, setEngineMode] = useState('webgl'); // 'python' | 'webgl'
  const [pythonMask, setPythonMask] = useState(null);
  const [isNeuralRendering, setIsNeuralRendering] = useState(false);

  // DOM References
  const stageRef = useRef(null);
  const fileInputRef = useRef(null);

  // Sync initial product when opened
  useEffect(() => {
    if (product) {
      setCurrentProduct(product);
    }
  }, [product, isOpen]);

  // Check Python SegFormer AI Microservice Health on Open
  useEffect(() => {
    if (isOpen) {
      let isCancelled = false;
      fetch('/api/ai/python-visualizer')
        .then((res) => res.json())
        .then((data) => {
          if (!isCancelled && data?.online) {
            setPythonAiOnline(true);
            setEngineMode('python');
          } else if (!isCancelled) {
            setPythonAiOnline(false);
            setEngineMode('webgl');
          }
        })
        .catch(() => {
          if (!isCancelled) {
            setPythonAiOnline(false);
            setEngineMode('webgl');
          }
        });
      return () => {
        isCancelled = true;
      };
    }
  }, [isOpen]);

  // Load room photo image object
  useEffect(() => {
    if (!roomPhotoUrl) return;
    let isCancelled = false;
    loadImage(roomPhotoUrl)
      .then((img) => {
        if (!isCancelled) {
          setRoomImgObj(img);
          setRenderError(null);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          console.error('Room image load error:', err);
          setRenderError('Oda fotoğrafı yüklenemedi. Lütfen başka bir görsel seçin.');
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [roomPhotoUrl]);

  // Core Render Trigger
  const triggerRender = useCallback(async () => {
    if (!roomImgObj || !currentProduct) return;
    setIsRendering(true);
    setRenderError(null);

    try {
      // 1. Resolve safe texture URL
      const textureUrl = resolveSafeTextureUrl(currentProduct.textureUrl || currentProduct.imageUrl);

      // Option 2: SegFormer Python Neural Render Engine (when online and active)
      if (engineMode === 'python' && pythonAiOnline) {
        setIsNeuralRendering(true);
        try {
          const widthNum = Number(currentProduct.width) || 60;
          const scaleMultiplier = widthNum <= 30 ? 0.6 : (widthNum >= 120 ? 1.4 : 1.0);
          const pyRes = await fetch('/api/ai/python-visualizer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'apply',
              room_image: roomPhotoUrl,
              tile_image: textureUrl,
              mask: pythonMask,
              pattern: (layout === 'staggered_50' || layout === 'staggered_33') ? 'brick' : 'grid',
              tile_scale: scaleMultiplier,
              surface: activeSurface === 'walls' ? 'wall' : (activeSurface === 'both' ? 'both' : 'floor')
            })
          });

          const pyData = await pyRes.json();
          if (pyData?.success && pyData?.renderedImage) {
            setRenderedDataUrl(pyData.renderedImage);
            setBeforeDataUrl(roomPhotoUrl);
            if (pyData.mask && !pythonMask) {
              setPythonMask(pyData.mask);
            }
            setIsRendering(false);
            setIsNeuralRendering(false);
            return;
          }
        } catch (pyErr) {
          console.warn('[RoomRenovationModal] Python SegFormer fallback to WebGL:', pyErr);
        } finally {
          setIsNeuralRendering(false);
        }
      }

      // Option 1 & Fallback: Client-Side WebGL / Canvas PBR Engine
      const tileImg = await loadImage(textureUrl);

      // 2. Prepare surface quads based on active selection with multi-surface and obstacle awareness
      const activePreset = !isCustomUpload ? QUICK_ROOM_PRESETS.find((p) => p.url === roomPhotoUrl) : null;
      const surfaces = {
        floor: (activeSurface === 'floor' || activeSurface === 'both') ? {
          polygon: floorQuad,
          exclude: []
        } : null,
        walls: (activeSurface === 'walls' || activeSurface === 'both') ? (
          detectedWalls.length > 0 
            ? detectedWalls 
            : [{ polygon: wallQuad, exclude: [] }]
        ) : [],
        obstacles: detectedObstacles.length > 0 
          ? detectedObstacles 
          : (activePreset?.obstacles || [])
      };

      // Resolve preset foreground fixture layer (bathtubs, vanity, mirrors)
      let foregroundImg = null;
      if (!isCustomUpload && activePreset?.fgUrl) {
        try {
          foregroundImg = await loadImage(activePreset.fgUrl);
        } catch {
          foregroundImg = null;
        }
      }

      // 3. Render using client-side TilePerspectiveEngine
      const result = generateTilePreview(roomImgObj, tileImg, surfaces, {
        groutColor,
        groutWidth,
        tileWCm: Number(currentProduct.width) || 60,
        tileHCm: Number(currentProduct.height) || 120,
        layout,
        orientation: tileOrientation,
        customMaskCanvas,
        foregroundImg,
        obstacles: detectedObstacles,
        finish: currentProduct.finish || 'Lappato Parlak'
      });

      const rendered = (result && result.renderedDataUrl) ? result.renderedDataUrl : result.toString();
      const before = (result && result.beforeDataUrl) ? result.beforeDataUrl : roomPhotoUrl;

      setRenderedDataUrl(rendered);
      setBeforeDataUrl(before);
    } catch (err) {
      console.error('Render preview error:', err);
      setRenderError('Seramik dokusu uygulanamadı. Lütfen tekrar deneyin.');
    } finally {
      setIsRendering(false);
    }
  }, [roomImgObj, currentProduct, activeSurface, floorQuad, wallQuad, detectedWalls, detectedObstacles, groutColor, groutWidth, layout, tileOrientation, customMaskCanvas, roomPhotoUrl, isCustomUpload, engineMode, pythonAiOnline, pythonMask]);

  // Trigger re-render whenever geometry, product, surface or styling changes
  useEffect(() => {
    if (isOpen && roomImgObj && currentProduct) {
      const timer = setTimeout(() => {
        triggerRender();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, roomImgObj, currentProduct, activeSurface, floorQuad, wallQuad, detectedWalls, detectedObstacles, groutColor, groutWidth, layout, tileOrientation, customMaskCanvas, engineMode, pythonMask, triggerRender]);

  // Handle Photo Upload (Processed purely in browser memory + AI Surface Analysis)
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate MIME type
    if (!file.type.startsWith('image/')) {
      setRenderError('Lütfen geçerli bir görsel dosyası seçin (JPEG, PNG, WebP).');
      return;
    }

    // Validate size (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      setRenderError('Görsel boyutu en fazla 20MB olabilir.');
      return;
    }

    // Clean previous render state immediately
    setRenderedDataUrl(null);
    setBeforeDataUrl(null);
    setRenderError(null);
    setDetectedObstacles([]);
    setDetectedWalls([]);
    setPythonMask(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const rawDataUrl = event.target.result;
      try {
        // Downscale large phone cameras (e.g. 12-48MP) to 1500px in-memory for smooth rendering
        const optimizedDataUrl = await downscaleImageForAI(rawDataUrl, 1500);
        setRoomPhotoUrl(optimizedDataUrl);
        setIsCustomUpload(true);
        setCustomMaskCanvas(null); // Reset brush mask on new room photo

        // 1. Sensible initial fallback
        setFloorQuad([ [10, 62], [90, 62], [100, 100], [0, 100] ]);
        setWallQuad([ [10, 15], [90, 15], [90, 62], [10, 62] ]);
        setPinEditingMode('none');

        // Asynchronous SegFormer AI segmentation if Python is online
        if (pythonAiOnline) {
          fetch('/api/ai/python-visualizer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'segment',
              room_image: optimizedDataUrl,
              surface: activeSurface === 'walls' ? 'wall' : (activeSurface === 'both' ? 'both' : 'floor')
            })
          })
            .then((r) => r.json())
            .then((data) => {
              if (data?.success && data?.mask) {
                setPythonMask(data.mask);
              }
            })
            .catch((e) => console.warn('[SegFormer] Initial segment error:', e));
        }

        // 2. Trigger asynchronous AI Architectural Room Analysis
        setIsAnalyzingRoom(true);
        try {
          const analysis = await analyzeRoomSurfaces(optimizedDataUrl, activeSurface);
          if (analysis?.floor?.polygon && analysis.floor.polygon.length >= 4) {
            setFloorQuad(analysis.floor.polygon);
          }
          if (Array.isArray(analysis?.walls) && analysis.walls.length > 0) {
            setDetectedWalls(analysis.walls);
            setWallQuad(analysis.walls[0].polygon);
          }
          if (Array.isArray(analysis?.obstacles) && analysis.obstacles.length > 0) {
            setDetectedObstacles(analysis.obstacles);
          }
        } catch (aiErr) {
          console.warn('[RoomRenovationModal] Room AI Analysis fallback used:', aiErr);
        } finally {
          setIsAnalyzingRoom(false);
        }
      } catch (err) {
        console.error('Image optimization error:', err);
        setRoomPhotoUrl(rawDataUrl);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Preset Selection
  const handleSelectPreset = (preset) => {
    setRenderedDataUrl(null);
    setBeforeDataUrl(null);
    setRenderError(null);
    setDetectedObstacles([]);
    setDetectedWalls([]);
    setRoomPhotoUrl(preset.url);
    setFloorQuad(preset.floorQuad);
    setWallQuad(preset.wallQuad);
    setIsCustomUpload(false);
    setCustomMaskCanvas(null);
    setPinEditingMode('none');
  };

  // Reset Pins to default
  const handleResetPins = () => {
    const activePreset = !isCustomUpload ? QUICK_ROOM_PRESETS.find((p) => p.url === roomPhotoUrl) : null;
    const defaultFloor = activePreset ? activePreset.floorQuad : [ [15, 65], [85, 65], [100, 100], [0, 100] ];
    const defaultWall = activePreset ? activePreset.wallQuad : [ [10, 15], [90, 15], [90, 65], [10, 65] ];

    if (pinEditingMode === 'floor' || activeSurface === 'floor') {
      setFloorQuad(defaultFloor);
    } else if (pinEditingMode === 'walls' || activeSurface === 'walls') {
      setWallQuad(defaultWall);
    } else {
      setFloorQuad(defaultFloor);
      setWallQuad(defaultWall);
    }
  };

  // Save Mask from MaskBrushEditor
  const handleSaveBrushMask = ({ maskCanvas }) => {
    setCustomMaskCanvas(maskCanvas);
    setIsBrushOpen(false);
  };

  // Pin Dragging Mechanics (Mouse & Touch)
  const handleStagePointerDown = (e, index) => {
    e.stopPropagation();
    setDraggedPinIndex(index);
  };

  const handleStagePointerMove = (e) => {
    if (draggedPinIndex === null || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const xPct = Math.max(0, Math.min(100, Math.round(((clientX - rect.left) / rect.width) * 100)));
    const yPct = Math.max(0, Math.min(100, Math.round(((clientY - rect.top) / rect.height) * 100)));

    if (pinEditingMode === 'floor') {
      setFloorQuad((prev) => {
        const copy = [...prev];
        copy[draggedPinIndex] = [xPct, yPct];
        return copy;
      });
    } else if (pinEditingMode === 'walls') {
      setWallQuad((prev) => {
        const copy = [...prev];
        copy[draggedPinIndex] = [xPct, yPct];
        return copy;
      });
    }
  };

  const handleStagePointerUp = () => {
    if (draggedPinIndex !== null) {
      setDraggedPinIndex(null);
    }
  };

  // Slider Drag Mechanics
  const handleSliderMove = (clientX) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let pct = Math.round((x / rect.width) * 100);
    pct = Math.max(0, Math.min(100, pct));
    setSliderPos(pct);
  };

  // Global window listener for silky-smooth slider dragging
  useEffect(() => {
    if (!isDraggingSlider) return;

    const onPointerMove = (e) => {
      const clientX = e.touches && e.touches[0] ? e.touches[0].clientX : e.clientX;
      handleSliderMove(clientX);
    };

    const onPointerUp = () => {
      setIsDraggingSlider(false);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('touchmove', onPointerMove);
    window.addEventListener('touchend', onPointerUp);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);
    };
  }, [isDraggingSlider]);

  // Download High-Res Result
  const handleDownload = () => {
    if (!renderedDataUrl) return;
    const link = document.createElement('a');
    const safeCode = currentProduct?.code ? currentProduct.code.replace(/[^a-zA-Z0-9_-]/g, '_') : 'tasarim';
    link.download = `seramikbak_mekanimda_${safeCode}.jpg`;
    link.href = renderedDataUrl;
    link.click();
  };

  // Quote Request Trigger (Passes currentProduct & snapshotUrl to parent)
  const handleQuoteClick = () => {
    if (onOpenQuote) {
      onOpenQuote(currentProduct, renderedDataUrl);
    }
  };

  if (!isOpen) return null;

  // Active pins being edited
  const currentActiveQuad = pinEditingMode === 'walls' ? wallQuad : floorQuad;

  return (
    <div className="sb-renovation-overlay">
      <div className="sb-renovation-modal">
        {/* MODAL HEADER */}
        <div className="sb-renovation-header">
          <div className="sb-renovation-title-box">
            <div className="sb-header-meta-row">
              <div className="sb-renovation-badge">
                <Sparkles size={13} style={{ color: '#d4af37' }} />
                <span>Gerçek Doku & Perspektif Korumalı</span>
              </div>

              {pythonAiOnline ? (
                <div className="sb-engine-switcher">
                  <button
                    type="button"
                    onClick={() => { setEngineMode('python'); setRenderedDataUrl(null); }}
                    className={`sb-engine-btn ${engineMode === 'python' ? 'active-python' : ''}`}
                    title="NVIDIA SegFormer-B3 Derin Öğrenme Modeli (PyTorch)"
                  >
                    <span className="sb-engine-dot-green" />
                    <span>SegFormer AI (PyTorch)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setEngineMode('webgl'); setRenderedDataUrl(null); }}
                    className={`sb-engine-btn ${engineMode === 'webgl' ? 'active-webgl' : ''}`}
                    title="Hızlı Tarayıcı İçi WebGL / Canvas Motoru"
                  >
                    <span className="sb-engine-dot-yellow" />
                    <span>WebGL Motoru</span>
                  </button>
                </div>
              ) : (
                <div className="sb-engine-badge-webgl">
                  <span className="sb-engine-dot-yellow" />
                  <span>WebGL Hızlı Motor</span>
                </div>
              )}
            </div>

            <h2 className="sb-renovation-title">
              Mekânımda Yenile & Görselleştir
            </h2>
            <p className="sb-renovation-subtitle">
              Kendi banyonuzun veya mutfağınızın fotoğrafında seçtiğiniz seramiği orijinal ışık ve perspektifiyle deneyin.
            </p>
          </div>

          {/* Active Product Mini Pill */}
          <div className="sb-renovation-active-pill">
            <div className="sb-pill-thumb">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={currentProduct.imageUrl || currentProduct.textureUrl || '/textures/calacatta_gold.jpg'} 
                alt={currentProduct.name} 
              />
            </div>
            <div className="sb-pill-info">
              <div className="sb-pill-name">{currentProduct.name}</div>
              <div className="sb-pill-meta">
                {currentProduct.brand?.name || 'Seramik'} • {currentProduct.width}×{currentProduct.height} cm • {currentProduct.finish}
              </div>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="sb-renovation-close-btn"
            title="Kapat"
          >
            <X size={20} />
          </button>
        </div>

        {/* BRUSH EDITOR SUB-SCREEN OVERLAY */}
        {isBrushOpen && (
          <div className="sb-brush-overlay-container">
            <MaskBrushEditor
              backgroundImage={beforeDataUrl || roomPhotoUrl}
              initialMask={customMaskCanvas || {
                floor: { polygon: floorQuad },
                walls: [{ polygon: wallQuad }]
              }}
              onSaveMask={handleSaveBrushMask}
              onCancel={() => setIsBrushOpen(false)}
            />
          </div>
        )}

        {/* MAIN BODY WORKSPACE */}
        <div className="sb-renovation-body">
          {/* TOOLBAR CONTROLS */}
          <div className="sb-renovation-toolbar">
            {/* 1. Photo Source Selection */}
            <div className="sb-toolbar-group">
              <span className="sb-toolbar-label">Mekân Fotoğrafı:</span>
              <div className="sb-source-btn-row">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/jpeg,image/png,image/webp,image/heic"
                  style={{ display: 'none' }}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`sb-toolbar-btn ${isCustomUpload ? 'active-gold' : ''}`}
                >
                  <Camera size={14} />
                  <span>{isCustomUpload ? 'Fotoğrafı Değiştir' : 'Fotoğraf Yükle'}</span>
                </button>

                {QUICK_ROOM_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className={`sb-toolbar-btn ${roomPhotoUrl === preset.url && !isCustomUpload ? 'active-gold' : ''}`}
                  >
                    <span>{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Surface Selection */}
            <div className="sb-toolbar-group">
              <span className="sb-toolbar-label">Uygulama Alanı:</span>
              <div className="sb-surface-toggle-group">
                <button
                  onClick={() => { setActiveSurface('floor'); setPinEditingMode('none'); setPythonMask(null); }}
                  className={`sb-surface-btn ${activeSurface === 'floor' ? 'active' : ''}`}
                >
                  Zemin
                </button>
                <button
                  onClick={() => { setActiveSurface('walls'); setPinEditingMode('none'); setPythonMask(null); }}
                  className={`sb-surface-btn ${activeSurface === 'walls' ? 'active' : ''}`}
                >
                  Duvarlar
                </button>
                <button
                  onClick={() => { setActiveSurface('both'); setPinEditingMode('none'); setPythonMask(null); }}
                  className={`sb-surface-btn ${activeSurface === 'both' ? 'active' : ''}`}
                >
                  Zemin + Duvar
                </button>
              </div>
            </div>

            {/* 3. Surface Adjustment & Mask Brush */}
            <div className="sb-toolbar-group">
              <span className="sb-toolbar-label">Hassas Uyum:</span>
              <div className="sb-adjust-btn-row">
                <button
                  onClick={() => setPinEditingMode(pinEditingMode === 'floor' ? 'none' : 'floor')}
                  className={`sb-toolbar-btn ${pinEditingMode === 'floor' ? 'active-sky' : ''}`}
                  title="Zemin köşe noktalarını sürükleyerek odaya oturtun"
                >
                  <Move size={14} />
                  <span>{pinEditingMode === 'floor' ? 'Zemin Pinlerini Tamamla' : 'Zemin Pinleri'}</span>
                </button>

                <button
                  onClick={() => setPinEditingMode(pinEditingMode === 'walls' ? 'none' : 'walls')}
                  className={`sb-toolbar-btn ${pinEditingMode === 'walls' ? 'active-sky' : ''}`}
                  title="Duvar köşe noktalarını sürükleyerek odaya oturtun"
                >
                  <Move size={14} />
                  <span>{pinEditingMode === 'walls' ? 'Duvar Pinlerini Tamamla' : 'Duvar Pinleri'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsBrushOpen(true)}
                  className={`sb-toolbar-btn ${customMaskCanvas ? 'has-mask' : ''}`}
                  title="Küvet, lavabo ve mobilyaları seramikten korumak için maskeyi düzenleyin"
                >
                  <Scissors size={14} />
                  <span>{customMaskCanvas ? '✓ Küvet/Eşya Maskesi Aktif' : 'Küvet & Eşya Silgisi'}</span>
                </button>

                {customMaskCanvas && (
                  <button
                    type="button"
                    onClick={() => setCustomMaskCanvas(null)}
                    className="sb-btn-reset-mask"
                    title="Özel maskeyi kaldır ve tam poligonu kullan"
                  >
                    ✕ Maskeyi Kaldır
                  </button>
                )}

                <button
                  onClick={handleResetPins}
                  className="sb-toolbar-btn"
                  title="Köşe noktalarını varsayılana döndür"
                >
                  <RotateCcw size={14} />
                  <span>Sıfırla</span>
                </button>
              </div>
            </div>

            {/* 4. Advanced Grout & Layout Trigger */}
            <div className="sb-toolbar-group ml-auto">
              <button
                onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                className={`sb-toolbar-btn ${showAdvancedSettings ? 'active-gold' : ''}`}
              >
                <Sliders size={14} />
                <span>Derz & Dizilim</span>
              </button>
            </div>
          </div>

          {/* ADVANCED SETTINGS PANEL */}
          {showAdvancedSettings && (
            <div className="sb-advanced-panel">
              <div className="sb-advanced-item">
                <label>Derz Rengi:</label>
                <div className="sb-color-choices">
                  {[
                    { color: '#222222', name: 'Antrasit' },
                    { color: '#94a3b8', name: 'Açık Gri' },
                    { color: '#ffffff', name: 'Beyaz' },
                    { color: '#b59368', name: 'Bej / Altın' }
                  ].map((c) => (
                    <button
                      key={c.color}
                      onClick={() => setGroutColor(c.color)}
                      className={`sb-color-dot ${groutColor === c.color ? 'active' : ''}`}
                      style={{ background: c.color }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              <div className="sb-advanced-item">
                <label>Derz Payı: <strong>{groutWidth} mm</strong></label>
                <input
                  type="range"
                  min="1"
                  max="4"
                  step="0.5"
                  value={groutWidth}
                  onChange={(e) => setGroutWidth(parseFloat(e.target.value))}
                />
              </div>

              <div className="sb-advanced-item">
                <label>Dizilim Şekli:</label>
                <select 
                  value={layout} 
                  onChange={(e) => setLayout(e.target.value)}
                  className="sb-select"
                >
                  <option value="straight">Düz Rektifiye Izgara</option>
                  <option value="staggered_50">1/2 Şaşırtmalı (Running Bond)</option>
                  <option value="staggered_33">1/3 Şaşırtmalı</option>
                  <option value="diagonal">45° Çapraz Dizilim</option>
                </select>
              </div>

              <div className="sb-advanced-item">
                <label>Karo Yönü:</label>
                <select 
                  value={tileOrientation} 
                  onChange={(e) => setTileOrientation(e.target.value)}
                  className="sb-select"
                >
                  <option value="vertical">Boyuna (Derinlik Boyunca)</option>
                  <option value="horizontal">Enine (Yatay Döşeme)</option>
                </select>
              </div>
            </div>
          )}

          {/* PIN ADJUSTMENT GUIDANCE BANNER */}
          {pinEditingMode !== 'none' && (
            <div className="sb-pin-guide-banner">
              <Move size={15} style={{ color: '#38bdf8' }} />
              <span>
                <strong>{pinEditingMode === 'floor' ? 'Zemin' : 'Duvar'} Köşe Noktaları:</strong> Fotoğraf üzerindeki altın renkli 4 köşe dairesini sürükleyerek odanızın zemin veya duvar çizgileriyle hizalayın.
              </span>
              <button 
                onClick={() => setPinEditingMode('none')}
                className="sb-btn-pin-done"
              >
                Tamamla
              </button>
            </div>
          )}

          {/* ERROR ALERT */}
          {renderError && (
            <div className="sb-error-banner">
              <AlertCircle size={16} />
              <span>{renderError}</span>
              <button onClick={() => triggerRender()} className="sb-btn-retry">
                <RefreshCw size={13} />
                <span>Tekrar Dene</span>
              </button>
            </div>
          )}

          {/* INTERACTIVE STAGE & BEFORE/AFTER SPLIT VIEW */}
          <div className="sb-stage-outer-box">
            <div 
              ref={stageRef}
              className="sb-renovation-stage"
              style={{
                aspectRatio: roomImgObj ? `${roomImgObj.naturalWidth} / ${roomImgObj.naturalHeight}` : '16 / 9'
              }}
              onPointerMove={pinEditingMode !== 'none' ? handleStagePointerMove : undefined}
              onPointerUp={pinEditingMode !== 'none' ? handleStagePointerUp : undefined}
            >
              {/* BASE ORIGINAL PHOTO (LEFT SIDE) */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={beforeDataUrl || roomPhotoUrl} 
                alt="Orijinal Mekân" 
                className="sb-stage-base-img"
              />

              {/* RENDERED TILED RESULT (RIGHT SIDE VIA CLIP-PATH) */}
              {renderedDataUrl && (
                <div 
                  className="sb-stage-tiled-layer"
                  style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={renderedDataUrl} 
                    alt="Yenilenmiş Mekân" 
                    className="sb-stage-tiled-img"
                  />
                </div>
              )}

              {/* BEFORE / AFTER SLIDER SEPARATOR */}
              {pinEditingMode === 'none' && renderedDataUrl && (
                <div 
                  className="sb-split-divider"
                  style={{ left: `${sliderPos}%` }}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    setIsDraggingSlider(true);
                  }}
                >
                  <div className="sb-split-line" />
                  <div className="sb-split-handle">
                    <span>↔</span>
                  </div>
                </div>
              )}

            {/* FULL STAGE SLIDER TOUCH/MOUSE LISTENER */}
            {pinEditingMode === 'none' && isDraggingSlider && (
              <div 
                className="sb-split-drag-overlay"
                onPointerMove={(e) => handleSliderMove(e.clientX)}
                onPointerUp={() => setIsDraggingSlider(false)}
                onPointerLeave={() => setIsDraggingSlider(false)}
              />
            )}

            {/* INTERACTIVE CORNER PIN EDITING OVERLAY */}
            {pinEditingMode !== 'none' && (
              <svg className="sb-pin-svg-overlay">
                {/* Polygon Outline */}
                <polygon
                  points={currentActiveQuad.map(([x, y]) => `${x}%,${y}%`).join(' ')}
                  className="sb-pin-polygon"
                />

                {/* 4 Draggable Pin Handles */}
                {currentActiveQuad.map(([x, y], idx) => (
                  <g 
                    key={idx} 
                    className="sb-pin-handle-group"
                    onPointerDown={(e) => handleStagePointerDown(e, idx)}
                  >
                    <circle
                      cx={`${x}%`}
                      cy={`${y}%`}
                      r="16"
                      className="sb-pin-circle-halo"
                    />
                    <circle
                      cx={`${x}%`}
                      cy={`${y}%`}
                      r="9"
                      className="sb-pin-circle"
                    />
                    <text
                      x={`${x}%`}
                      y={`${y}%`}
                      dy="4"
                      textAnchor="middle"
                      className="sb-pin-label"
                    >
                      {idx + 1}
                    </text>
                  </g>
                ))}
              </svg>
            )}

            {/* WATERMARK LABELS */}
            {pinEditingMode === 'none' && (
              <>
                <div className="sb-label-before">Orijinal Mekân</div>
                <div className="sb-label-after">
                  <Sparkles size={11} style={{ color: '#d4af37', display: 'inline', marginRight: '4px' }} />
                  {currentProduct.name} ({currentProduct.width}×{currentProduct.height} cm)
                </div>
              </>
            )}

            {/* RENDERING & AI ANALYSIS LOADER SPINNER */}
            {(isRendering || isAnalyzingRoom || isNeuralRendering) && (
              <div className="sb-rendering-overlay">
                <div className="sb-render-spinner" />
                <div className="sb-render-spinnerText">
                  {isAnalyzingRoom
                    ? 'SegFormer AI ile Mekân & Yüzeyler Analiz Ediliyor...'
                    : isNeuralRendering
                    ? '🚀 SegFormer AI (PyTorch) Seramiği Odaya Giydiriyor...'
                    : 'Doku, Perspektif & Işık Hesaplanıyor...'}
                </div>
              </div>
            )}

            {/* AI DETECTED OBSTACLES BADGE */}
            {detectedObstacles.length > 0 && pinEditingMode === 'none' && !isAnalyzingRoom && (
              <div className="sb-ai-fixture-badge">
                <Sparkles size={11} style={{ color: '#38bdf8' }} />
                <span>AI: {detectedObstacles.length} Nesne/Vitrifiye Korumada</span>
              </div>
            )}
            </div>
          </div>

          {/* SLIDER QUICK BUTTONS */}
          <div className="sb-slider-quick-bar">
            <button 
              onClick={() => setSliderPos(100)} 
              className={`sb-quick-btn ${sliderPos === 100 ? 'active' : ''}`}
            >
              %100 Orijinal
            </button>
            <button 
              onClick={() => setSliderPos(50)} 
              className={`sb-quick-btn ${sliderPos === 50 ? 'active' : ''}`}
            >
              50 / 50 Karşılaştır
            </button>
            <button 
              onClick={() => setSliderPos(0)} 
              className={`sb-quick-btn ${sliderPos === 0 ? 'active' : ''}`}
            >
              %100 Yenilenmiş
            </button>
          </div>

          {/* HORIZONTAL PRODUCT CAROUSEL ("AYNI MEKÂNDA FARKLI SERAMİK DENE") */}
          <div className="sb-carousel-section">
            <div className="sb-carousel-header">
              <span className="sb-carousel-title">
                <Layers size={14} style={{ color: '#d4af37' }} />
                <span>Bu Mekânda Diğer Seramikleri Dene:</span>
              </span>
              <span className="sb-carousel-note">Fotoğraf ve köşe ayarlarınız korunarak anında uygulanır</span>
            </div>

            <div className="sb-carousel-track">
              {/* Main Product First */}
              <div 
                onClick={() => setCurrentProduct(product)}
                className={`sb-carousel-card ${currentProduct.id === product.id ? 'active' : ''}`}
              >
                <div className="sb-card-img">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={product.imageUrl || product.textureUrl || '/textures/calacatta_gold.jpg'} alt={product.name} />
                  {currentProduct.id === product.id && (
                    <span className="sb-card-active-badge"><Check size={11} /></span>
                  )}
                </div>
                <div className="sb-card-name">{product.name}</div>
                <div className="sb-card-dim">{product.width}×{product.height} cm</div>
              </div>

              {/* Related / Alternative Products */}
              {relatedProducts.map((rel) => (
                <div 
                  key={rel.id}
                  onClick={() => setCurrentProduct(rel)}
                  className={`sb-carousel-card ${currentProduct.id === rel.id ? 'active' : ''}`}
                >
                  <div className="sb-card-img">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={rel.imageUrl || rel.textureUrl || '/textures/calacatta_gold.jpg'} alt={rel.name} />
                    {currentProduct.id === rel.id && (
                      <span className="sb-card-active-badge"><Check size={11} /></span>
                    )}
                  </div>
                  <div className="sb-card-name">{rel.name}</div>
                  <div className="sb-card-dim">{rel.width}×{rel.height} cm</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* MODAL FOOTER ACTIONS */}
        <div className="sb-renovation-footer">
          <div className="sb-footer-left">
            <span className="sb-footer-privacy">
              🔒 Fotoğrafınız sunucuya kaydedilmez; yalnızca tarayıcınızda işlenir.
            </span>
          </div>

          <div className="sb-footer-right">
            <button
              onClick={handleDownload}
              disabled={!renderedDataUrl}
              className="sb-btn-download"
            >
              <Download size={16} />
              <span>Görseli İndir</span>
            </button>

            <button
              onClick={handleQuoteClick}
              className="sb-btn-quote"
            >
              <Send size={16} />
              <span>Bu Ürün İçin Teklif Al →</span>
            </button>
          </div>
        </div>
      </div>

      {/* COMPONENT SCOPED LUXURY STYLES */}
      <style jsx>{`
        .sb-renovation-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(4, 8, 16, 0.88);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }

        .sb-renovation-modal {
          background: #0b1120;
          border: 1px solid rgba(212, 175, 55, 0.25);
          box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px rgba(212, 175, 55, 0.12);
          border-radius: 20px;
          width: 100%;
          max-width: 1200px;
          max-height: 94vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          color: #f8fafc;
          font-family: inherit;
        }

        .sb-renovation-header {
          padding: 18px 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          background: rgba(15, 23, 42, 0.6);
        }

        .sb-renovation-title-box {
          flex: 1;
        }

        .sb-header-meta-row {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 6px;
        }

        .sb-renovation-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.72rem;
          font-weight: 700;
          color: #f3d375;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          background: rgba(212, 175, 55, 0.12);
          border: 1px solid rgba(212, 175, 55, 0.25);
          padding: 3px 10px;
          border-radius: 9999px;
        }

        .sb-engine-switcher {
          display: inline-flex;
          align-items: center;
          background: rgba(15, 23, 42, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 9999px;
          padding: 2px;
          gap: 2px;
        }

        .sb-engine-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 3px 10px;
          border-radius: 9999px;
          font-size: 0.68rem;
          font-weight: 700;
          border: 1px solid transparent;
          background: transparent;
          color: #94a3b8;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .sb-engine-btn:hover {
          color: #ffffff;
        }

        .sb-engine-btn.active-python {
          background: rgba(16, 185, 129, 0.16);
          border-color: rgba(16, 185, 129, 0.45);
          color: #34d399;
          box-shadow: 0 0 10px rgba(16, 185, 129, 0.25);
        }

        .sb-engine-btn.active-webgl {
          background: rgba(212, 175, 55, 0.16);
          border-color: rgba(212, 175, 55, 0.45);
          color: #f3d375;
          box-shadow: 0 0 10px rgba(212, 175, 55, 0.25);
        }

        .sb-engine-dot-green {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 8px #10b981;
          display: inline-block;
          animation: pulseGreen 2s infinite ease-in-out;
        }

        .sb-engine-dot-yellow {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #d4af37;
          display: inline-block;
        }

        .sb-engine-badge-webgl {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.68rem;
          font-weight: 700;
          color: #94a3b8;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 3px 9px;
          border-radius: 9999px;
        }

        @keyframes pulseGreen {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.55; transform: scale(0.9); }
        }


        .sb-renovation-title {
          font-size: 1.25rem;
          font-weight: 800;
          color: #ffffff;
          margin: 0;
          letter-spacing: -0.02em;
        }

        .sb-renovation-subtitle {
          font-size: 0.8rem;
          color: #94a3b8;
          margin: 2px 0 0;
        }

        .sb-renovation-active-pill {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 6px 12px;
          border-radius: 12px;
        }

        .sb-pill-thumb {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          overflow: hidden;
          background: #1e293b;
          flex-shrink: 0;
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .sb-pill-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .sb-pill-info {
          display: flex;
          flex-direction: column;
        }

        .sb-pill-name {
          font-size: 0.82rem;
          font-weight: 700;
          color: #f8fafc;
        }

        .sb-pill-meta {
          font-size: 0.72rem;
          color: #94a3b8;
        }

        .sb-renovation-close-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #cbd5e1;
          width: 38px;
          height: 38px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .sb-renovation-close-btn:hover {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
          border-color: rgba(239, 68, 68, 0.4);
        }

        .sb-renovation-body {
          flex: 1;
          overflow-y: auto;
          padding: 16px 24px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .sb-renovation-toolbar {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
          padding: 10px 14px;
          background: rgba(15, 23, 42, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 14px;
        }

        .sb-toolbar-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .sb-toolbar-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: #94a3b8;
          white-space: nowrap;
        }

        .sb-source-btn-row, .sb-adjust-btn-row {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .sb-toolbar-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.76rem;
          font-weight: 600;
          padding: 6px 12px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #e2e8f0;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .sb-toolbar-btn:hover {
          background: rgba(255, 255, 255, 0.09);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .sb-toolbar-btn.active-gold {
          background: rgba(212, 175, 55, 0.18);
          border-color: #d4af37;
          color: #f3d375;
        }

        .sb-toolbar-btn.active-sky {
          background: rgba(56, 189, 248, 0.2);
          border-color: #38bdf8;
          color: #38bdf8;
        }

        .sb-toolbar-btn.has-mask {
          border-color: #10b981;
          color: #34d399;
          background: rgba(16, 185, 129, 0.15);
        }

        .sb-surface-toggle-group {
          display: flex;
          background: rgba(0, 0, 0, 0.35);
          padding: 3px;
          border-radius: 9px;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .sb-surface-btn {
          font-size: 0.74rem;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 6px;
          background: transparent;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          transition: all 0.15s;
        }

        .sb-surface-btn.active {
          background: #d4af37;
          color: #0b0f19;
          font-weight: 700;
        }

        .sb-advanced-panel {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
          padding: 12px 18px;
          background: rgba(15, 23, 42, 0.95);
          border: 1px solid rgba(212, 175, 55, 0.2);
          border-radius: 12px;
          font-size: 0.8rem;
        }

        .sb-advanced-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .sb-color-choices {
          display: flex;
          gap: 6px;
        }

        .sb-color-dot {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.2);
          cursor: pointer;
          transition: transform 0.15s;
        }

        .sb-color-dot.active {
          transform: scale(1.18);
          border-color: #d4af37;
          box-shadow: 0 0 8px #d4af37;
        }

        .sb-select {
          background: #1e293b;
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #f8fafc;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 0.76rem;
        }

        .sb-pin-guide-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 16px;
          background: rgba(56, 189, 248, 0.12);
          border: 1px solid rgba(56, 189, 248, 0.3);
          border-radius: 10px;
          font-size: 0.78rem;
          color: #bae6fd;
          gap: 12px;
        }

        .sb-btn-pin-done {
          background: #38bdf8;
          color: #0b1120;
          font-weight: 700;
          border: none;
          padding: 4px 12px;
          border-radius: 6px;
          cursor: pointer;
        }

        .sb-error-banner {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 16px;
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 10px;
          color: #fca5a5;
          font-size: 0.78rem;
        }

        .sb-btn-retry {
          margin-left: auto;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: rgba(239, 68, 68, 0.2);
          border: 1px solid rgba(239, 68, 68, 0.4);
          color: #ffffff;
          padding: 3px 8px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.72rem;
        }

        /* STAGE CONTAINER */
        .sb-stage-outer-box {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #020617;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 6px;
          overflow: hidden;
          min-height: 380px;
        }

        .sb-renovation-stage {
          position: relative;
          width: auto;
          height: auto;
          max-width: 100%;
          max-height: 520px;
          background: #020617;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.1);
          user-select: none;
          touch-action: none;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7);
        }

        .sb-stage-base-img, .sb-stage-tiled-img {
          width: 100%;
          height: 100%;
          max-height: 520px;
          object-fit: fill;
          display: block;
        }

        .sb-btn-reset-mask {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.35);
          color: #fca5a5;
          padding: 5px 10px;
          border-radius: 8px;
          font-size: 0.72rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .sb-btn-reset-mask:hover {
          background: rgba(239, 68, 68, 0.3);
          color: #ffffff;
        }

        .sb-stage-tiled-layer {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .sb-split-divider {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 3px;
          transform: translateX(-50%);
          cursor: ew-resize;
          z-index: 30;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .sb-split-line {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 2px;
          background: #d4af37;
          box-shadow: 0 0 10px rgba(212, 175, 55, 0.8);
        }

        .sb-split-handle {
          width: 36px;
          height: 36px;
          background: #d4af37;
          border: 3px solid #0b1120;
          border-radius: 50%;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #0b1120;
          font-weight: 900;
          font-size: 13px;
          z-index: 31;
        }

        .sb-split-drag-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 40;
          cursor: ew-resize;
        }

        /* PIN SVG OVERLAY */
        .sb-pin-svg-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 25;
          pointer-events: auto;
        }

        .sb-pin-polygon {
          fill: rgba(56, 189, 248, 0.22);
          stroke: #38bdf8;
          stroke-width: 2.5;
          stroke-dasharray: 4, 4;
        }

        .sb-pin-handle-group {
          cursor: grab;
        }

        .sb-pin-handle-group:active {
          cursor: grabbing;
        }

        .sb-pin-circle-halo {
          fill: rgba(56, 189, 248, 0.2);
          transition: r 0.15s;
        }

        .sb-pin-handle-group:hover .sb-pin-circle-halo {
          r: 22;
          fill: rgba(56, 189, 248, 0.35);
        }

        .sb-pin-circle {
          fill: #d4af37;
          stroke: #0b1120;
          stroke-width: 2.5;
        }

        .sb-pin-label {
          fill: #0b1120;
          font-size: 10px;
          font-weight: 800;
          pointer-events: none;
        }

        /* WATERMARKS */
        .sb-label-before, .sb-label-after {
          position: absolute;
          bottom: 12px;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 0.72rem;
          font-weight: 700;
          backdrop-filter: blur(8px);
          pointer-events: none;
          z-index: 10;
        }

        .sb-label-before {
          left: 14px;
          background: rgba(15, 23, 42, 0.85);
          color: #cbd5e1;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .sb-label-after {
          right: 14px;
          background: rgba(15, 23, 42, 0.9);
          color: #f3d375;
          border: 1px solid rgba(212, 175, 55, 0.4);
        }

        .sb-ai-fixture-badge {
          position: absolute;
          top: 14px;
          right: 14px;
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(15, 23, 42, 0.88);
          border: 1px solid rgba(56, 189, 248, 0.45);
          color: #7dd3fc;
          padding: 5px 10px;
          border-radius: 8px;
          font-size: 0.72rem;
          font-weight: 700;
          z-index: 20;
          backdrop-filter: blur(8px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
        }

        /* LOADER */
        .sb-rendering-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(11, 17, 32, 0.65);
          backdrop-filter: blur(4px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          z-index: 50;
        }

        .sb-render-spinner {
          width: 38px;
          height: 38px;
          border: 3px solid rgba(212, 175, 55, 0.2);
          border-top-color: #d4af37;
          border-radius: 50%;
          animation: sb-spin 0.8s linear infinite;
        }

        @keyframes sb-spin {
          to { transform: rotate(360deg); }
        }

        .sb-render-spinnerText {
          font-size: 0.82rem;
          font-weight: 600;
          color: #f3d375;
        }

        /* SLIDER QUICK BAR */
        .sb-slider-quick-bar {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .sb-quick-btn {
          font-size: 0.74rem;
          font-weight: 600;
          padding: 4px 12px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #94a3b8;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s;
        }

        .sb-quick-btn.active, .sb-quick-btn:hover {
          background: rgba(212, 175, 55, 0.15);
          border-color: #d4af37;
          color: #f3d375;
        }

        /* CAROUSEL TRACK */
        .sb-carousel-section {
          background: rgba(15, 23, 42, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 14px;
          padding: 12px 16px;
        }

        .sb-carousel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
        }

        .sb-carousel-title {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8rem;
          font-weight: 700;
          color: #f8fafc;
        }

        .sb-carousel-note {
          font-size: 0.7rem;
          color: #64748b;
        }

        .sb-carousel-track {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          padding-bottom: 6px;
        }

        .sb-carousel-track::-webkit-scrollbar {
          height: 6px;
        }

        .sb-carousel-track::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 999px;
        }

        .sb-carousel-card {
          flex: 0 0 110px;
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          padding: 8px;
          cursor: pointer;
          transition: all 0.15s;
          display: flex;
          flex-direction: column;
        }

        .sb-carousel-card:hover {
          background: rgba(30, 41, 59, 0.9);
          border-color: rgba(255, 255, 255, 0.25);
          transform: translateY(-2px);
        }

        .sb-carousel-card.active {
          border-color: #d4af37;
          background: rgba(212, 175, 55, 0.12);
          box-shadow: 0 0 12px rgba(212, 175, 55, 0.25);
        }

        .sb-card-img {
          position: relative;
          width: 100%;
          height: 64px;
          border-radius: 6px;
          overflow: hidden;
          background: #020617;
          margin-bottom: 6px;
        }

        .sb-card-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .sb-card-active-badge {
          position: absolute;
          top: 4px;
          right: 4px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #d4af37;
          color: #0b1120;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .sb-card-name {
          font-size: 0.72rem;
          font-weight: 700;
          color: #f8fafc;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sb-card-dim {
          font-size: 0.68rem;
          color: #94a3b8;
        }

        /* BRUSH SUB-SCREEN */
        .sb-brush-overlay-container {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(4, 8, 16, 0.95);
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        /* FOOTER ACTIONS */
        .sb-renovation-footer {
          padding: 16px 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(15, 23, 42, 0.6);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }

        .sb-footer-privacy {
          font-size: 0.74rem;
          color: #64748b;
        }

        .sb-footer-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .sb-btn-download {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #f8fafc;
          font-size: 0.84rem;
          font-weight: 600;
          padding: 10px 18px;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.15s;
        }

        .sb-btn-download:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.12);
        }

        .sb-btn-download:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .sb-btn-quote {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #d4af37 0%, #b89327 100%);
          border: none;
          color: #0b1120;
          font-size: 0.88rem;
          font-weight: 800;
          padding: 10px 22px;
          border-radius: 10px;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(212, 175, 55, 0.35);
          transition: all 0.15s;
        }

        .sb-btn-quote:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(212, 175, 55, 0.5);
        }

        @media (max-width: 768px) {
          .sb-renovation-backdrop {
            padding: 0 !important;
          }
          .sb-renovation-modal {
            width: 100vw !important;
            height: 100dvh !important;
            max-height: 100dvh !important;
            border-radius: 0 !important;
            border: none !important;
          }
          .sb-renovation-header {
            padding: 8px 12px !important;
            flex-wrap: nowrap !important;
            gap: 8px !important;
          }
          .sb-renovation-badge {
            display: none !important;
          }
          .sb-renovation-title {
            font-size: 0.88rem !important;
            line-height: 1.2 !important;
          }
          .sb-renovation-subtitle {
            display: none !important;
          }
          .sb-renovation-active-pill {
            display: none !important;
          }
          .sb-renovation-close-btn {
            width: 28px !important;
            height: 28px !important;
            padding: 4px !important;
            flex-shrink: 0 !important;
          }
          .sb-renovation-body {
            padding: 6px 8px !important;
            gap: 8px !important;
          }

          /* Compact Horizontal Scrollable Toolbars */
          .sb-renovation-toolbar {
            padding: 6px 8px !important;
            gap: 6px !important;
            display: flex !important;
            flex-direction: column !important;
          }
          .sb-toolbar-group {
            display: flex !important;
            align-items: center !important;
            gap: 6px !important;
            width: 100% !important;
            overflow-x: auto !important;
            white-space: nowrap !important;
            scrollbar-width: none !important;
            -webkit-overflow-scrolling: touch !important;
            padding-bottom: 2px !important;
          }
          .sb-toolbar-group::-webkit-scrollbar {
            display: none !important;
          }
          .sb-toolbar-label {
            font-size: 0.65rem !important;
            color: #94a3b8 !important;
            flex-shrink: 0 !important;
            margin-right: 2px !important;
          }
          .sb-source-btn-row, .sb-adjust-btn-row {
            display: flex !important;
            align-items: center !important;
            gap: 4px !important;
            flex-shrink: 0 !important;
          }
          .sb-toolbar-btn {
            padding: 4px 8px !important;
            font-size: 0.68rem !important;
            border-radius: 6px !important;
            gap: 4px !important;
            min-height: 28px !important;
            flex-shrink: 0 !important;
          }
          .sb-surface-toggle-group {
            padding: 2px !important;
            border-radius: 6px !important;
            flex-shrink: 0 !important;
          }
          .sb-surface-btn {
            padding: 3px 7px !important;
            font-size: 0.66rem !important;
            border-radius: 4px !important;
          }
          .sb-btn-reset-mask {
            padding: 3px 6px !important;
            font-size: 0.65rem !important;
            flex-shrink: 0 !important;
          }

          /* Compact Stage */
          .sb-stage-outer-box {
            min-height: unset !important;
            padding: 2px !important;
            border-radius: 10px !important;
          }
          .sb-renovation-stage {
            max-height: 38vh !important;
            min-height: 200px !important;
            border-radius: 8px !important;
          }
          .sb-stage-base-img, .sb-stage-tiled-img {
            max-height: 38vh !important;
          }
          .sb-split-handle {
            width: 26px !important;
            height: 26px !important;
            font-size: 10px !important;
          }
          .sb-ai-fixture-badge {
            top: 8px !important;
            right: 8px !important;
            padding: 3px 7px !important;
            font-size: 0.62rem !important;
            border-radius: 6px !important;
          }
          .sb-label-before, .sb-label-after {
            bottom: 6px !important;
            padding: 2px 6px !important;
            font-size: 0.62rem !important;
          }
          .sb-label-before {
            left: 8px !important;
          }
          .sb-label-after {
            right: 8px !important;
          }

          /* Compact Slider Controls */
          .sb-slider-quick-bar {
            gap: 4px !important;
          }
          .sb-quick-btn {
            padding: 3px 7px !important;
            font-size: 0.66rem !important;
            border-radius: 5px !important;
          }

          /* Compact Carousel */
          .sb-carousel-section {
            padding: 6px 8px !important;
            border-radius: 10px !important;
            margin-top: 2px !important;
          }
          .sb-carousel-header {
            margin-bottom: 6px !important;
          }
          .sb-carousel-title {
            font-size: 0.72rem !important;
          }
          .sb-carousel-note {
            display: none !important;
          }
          .sb-carousel-card {
            flex: 0 0 80px !important;
            padding: 5px !important;
            border-radius: 8px !important;
          }
          .sb-card-img {
            height: 42px !important;
            margin-bottom: 3px !important;
          }
          .sb-card-name {
            font-size: 0.64rem !important;
          }
          .sb-card-dim {
            font-size: 0.58rem !important;
          }

          /* Compact Footer */
          .sb-renovation-footer {
            padding: 8px 12px !important;
            gap: 8px !important;
          }
          .sb-footer-privacy {
            display: none !important;
          }
          .sb-footer-right {
            width: 100% !important;
            justify-content: stretch !important;
            gap: 8px !important;
          }
          .sb-btn-download, .sb-btn-quote {
            flex: 1 !important;
            justify-content: center !important;
            padding: 8px 10px !important;
            font-size: 0.76rem !important;
            border-radius: 8px !important;
          }
        }
      `}</style>
    </div>
  );
}
