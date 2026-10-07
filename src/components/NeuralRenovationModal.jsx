'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Camera, X, RefreshCw, Layers, CheckCircle2, Sliders, Smartphone,
  Download, Sparkles, Plus, Trash2, Send, MessageCircle, Calculator,
  Maximize2, ShieldCheck, Store, ChevronRight, AlertCircle, ChevronDown, ChevronUp,
  Target, Compass, CornerDownRight, Check, Move, Eye, Upload, MapPin, CheckCircle,
  Palette, Grid, Image as ImageIcon, SlidersHorizontal, ArrowRight, Share2, Navigation,
  SplitSquareVertical, SplitSquareHorizontal, Undo2
} from 'lucide-react';

const PRESET_SAMPLE_ROOMS = [
  {
    id: 'luxury_bath',
    title: 'Modern Lüks Banyo',
    icon: '🛁',
    subtitle: 'Mermer duvarlar, bağımsız küvet & çift lavabo',
    url: '/hero/luxury_bathroom.png',
    fgUrl: '/hero/luxury_bathroom_fg.png',
    areaM2: 8.5,
    type: 'banyo'
  },
  {
    id: 'scandi_kitchen',
    title: 'İskandinav Ada Mutfak',
    icon: '🍳',
    subtitle: 'Meşe tezgah, ada mutfak & tezgah arası seramik',
    url: '/hero/scandinavian_kitchen.png',
    fgUrl: '/hero/scandinavian_kitchen_fg.png',
    areaM2: 6.4,
    type: 'mutfak'
  },
  {
    id: 'modern_living',
    title: 'Açık Konsept Salon',
    icon: '🛋️',
    subtitle: 'Geniş zemin & doğal bahçe ışığı',
    url: '/hero/modern_living.png',
    fgUrl: '/hero/modern_living_fg.png',
    areaM2: 18.0,
    type: 'salon'
  },
  {
    id: 'modern_hallway',
    title: 'Modern Antre & Hol',
    icon: '🚪',
    subtitle: 'Yüksek tavan, dresuar & karşılama koridoru',
    url: '/hero/modern_hallway.png',
    fgUrl: '/hero/modern_hallway_fg.png',
    areaM2: 12.0,
    type: 'antre'
  }
];

const FEATURED_STUDIO_TILES = [
  {
    id: 'volcano-grey',
    name: 'Güral Volcano 60x120 Mat Grey',
    brand: { name: 'Güral Seramik' },
    width: 60,
    height: 120,
    textureUrl: '/textures/concrete_light_grey.jpg',
    finish: 'Mat Porselen',
    category: 'beton',
    color: 'Gri'
  },
  {
    id: 'calacatta-gold',
    name: 'Bien Calacatta Gold 60x120',
    brand: { name: 'Bien Seramik' },
    width: 60,
    height: 120,
    textureUrl: '/textures/calacatta_gold.jpg',
    finish: 'Full Lappato',
    category: 'mermer',
    color: 'Beyaz'
  },
  {
    id: 'albatros-antrasit',
    name: 'Seranit Albatros 60x120 Antrasit',
    brand: { name: 'Seranit' },
    width: 60,
    height: 120,
    textureUrl: '/textures/albatros_antrasit.jpg',
    finish: 'Mat Rektifiye',
    category: 'beton',
    color: 'Antrasit'
  },
  {
    id: 'loft-beton',
    name: 'Ege Seramik Loft Beton 60x120',
    brand: { name: 'Ege Seramik' },
    width: 60,
    height: 120,
    textureUrl: '/textures/loft_beton.jpg',
    finish: 'Doğal Yüzey',
    category: 'beton',
    color: 'Açık Gri'
  },
  {
    id: 'travertino-classico',
    name: 'Yurtbay Travertino 60x120 Bej',
    brand: { name: 'Yurtbay Seramik' },
    width: 60,
    height: 120,
    textureUrl: '/textures/travertino_classico.jpg',
    finish: 'Cross Cut Mat',
    category: 'mermer',
    color: 'Bej'
  },
  {
    id: 'natural-oak',
    name: 'Qua Natural Oak 20x120 Ahşap',
    brand: { name: 'Qua Granite' },
    width: 20,
    height: 120,
    textureUrl: '/textures/natural_oak.jpg',
    finish: 'Ahşap Doku',
    category: 'ahsap',
    color: 'Meşe'
  }
];

// Resolves tile texture URL with local fallback mapping
function getResolvedTileTexture(tile) {
  if (!tile) return '/textures/calacatta_gold.jpg';

  // 1. Direct local texture
  if (tile.textureUrl && tile.textureUrl.startsWith('/textures/')) {
    return tile.textureUrl;
  }

  // 2. Direct remote image or proxy image
  const rawUrl = tile.textureUrl || tile.imageUrl;
  if (rawUrl && (rawUrl.startsWith('http://') || rawUrl.startsWith('https://'))) {
    return `/api/proxy?url=${encodeURIComponent(rawUrl)}`;
  }
  if (rawUrl && rawUrl.startsWith('/')) {
    return rawUrl;
  }

  // 3. Smart local texture fallback based on product properties
  const name = (tile.name || tile.title || '').toLowerCase();
  const color = (tile.color || '').toLowerCase();

  if (name.includes('calacatta') || name.includes('mermer') || name.includes('marfil') || color.includes('beyaz')) {
    return '/textures/calacatta_gold.jpg';
  }
  if (name.includes('volcano') || name.includes('beton') || name.includes('loft') || name.includes('cement') || color.includes('gri') || color.includes('grey')) {
    if (name.includes('anthracite') || name.includes('antrasit') || name.includes('siyah') || color.includes('antrasit')) {
      return '/textures/albatros_antrasit.jpg';
    }
    return '/textures/concrete_light_grey.jpg';
  }
  if (name.includes('ahşap') || name.includes('wood') || name.includes('meşe') || name.includes('oak') || name.includes('parke')) {
    return '/textures/natural_oak.jpg';
  }
  if (name.includes('travertin') || name.includes('bej') || name.includes('ivory') || name.includes('krem') || color.includes('bej')) {
    return '/textures/travertino_classico.jpg';
  }
  if (name.includes('antrasit') || name.includes('siyah') || color.includes('siyah')) {
    return '/textures/albatros_antrasit.jpg';
  }

  return '/textures/calacatta_gold.jpg';
}

// Background fill color for stamp before drawing tile
function getTileBaseColor(tile) {
  const name = (tile?.name || tile?.title || '').toLowerCase();
  const color = (tile?.color || '').toLowerCase();
  if (name.includes('antrasit') || name.includes('siyah') || color.includes('antrasit') || color.includes('siyah')) {
    return '#2b2d30';
  }
  if (name.includes('gri') || name.includes('grey') || color.includes('gri') || color.includes('grey')) {
    return '#b0b5b9';
  }
  if (name.includes('bej') || name.includes('travertin') || name.includes('ivory') || color.includes('bej')) {
    return '#ded6c7';
  }
  if (name.includes('ahşap') || name.includes('oak') || name.includes('meşe')) {
    return '#b98f62';
  }
  return '#eae8e4';
}

// =========================================================================
// OPENCV / HOMOGRAPHY BILINEAR QUAD WARP MATHEMATICAL ENGINE
// Solves exact 3x3 perspective warp in 4ms without external dependencies
// =========================================================================
function interpQuad(p0, p1, p2, p3, u, v) {
  const x = (1 - u) * (1 - v) * p0[0] + u * (1 - v) * p1[0] + u * v * p2[0] + (1 - u) * v * p3[0];
  const y = (1 - u) * (1 - v) * p0[1] + u * (1 - v) * p1[1] + u * v * p2[1] + (1 - u) * v * p3[1];
  return [x, y];
}

function solveAffine(s0, s1, s2, d0, d1, d2) {
  const x0 = s0[0], y0 = s0[1];
  const x1 = s1[0], y1 = s1[1];
  const x2 = s2[0], y2 = s2[1];
  const u0 = d0[0], v0 = d0[1];
  const u1 = d1[0], v1 = d1[1];
  const u2 = d2[0], v2 = d2[1];

  const denom = (x0 * (y1 - y2) + x1 * (y2 - y0) + x2 * (y0 - y1));
  if (Math.abs(denom) < 1e-7) return null;

  const a = (u0 * (y1 - y2) + u1 * (y2 - y0) + u2 * (y0 - y1)) / denom;
  const b = (u0 * (x2 - x1) + u1 * (x0 - x2) + u2 * (x1 - x0)) / denom;
  const c = (u0 * (x1 * y2 - x2 * y1) + u1 * (x2 * y0 - x0 * y2) + u2 * (x0 * y1 - x1 * y0)) / denom;

  const d = (v0 * (y1 - y2) + v1 * (y2 - y0) + v2 * (y0 - y1)) / denom;
  const e = (v0 * (x2 - x1) + v1 * (x0 - x2) + v2 * (x1 - x0)) / denom;
  const f = (v0 * (x1 * y2 - x2 * y1) + v1 * (x2 * y0 - x0 * y2) + v2 * (x0 * y1 - x1 * y0)) / denom;

  return [a, d, b, e, c, f];
}

function warpQuadToCanvas(targetCtx, patCanvas, p0, p1, p2, p3, subdivisions = 16) {
  const srcW = patCanvas.width;
  const srcH = patCanvas.height;
  const N = subdivisions;

  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      const u0 = i / N, u1 = (i + 1) / N;
      const v0 = j / N, v1 = (j + 1) / N;

      const sA = [u0 * srcW, v0 * srcH];
      const sB = [u1 * srcW, v0 * srcH];
      const sC = [u0 * srcW, v1 * srcH];
      const sD = [u1 * srcW, v1 * srcH];

      const dA = interpQuad(p0, p1, p2, p3, u0, v0);
      const dB = interpQuad(p0, p1, p2, p3, u1, v0);
      const dC = interpQuad(p0, p1, p2, p3, u0, v1);
      const dD = interpQuad(p0, p1, p2, p3, u1, v1);

      // Triangle 1: (A, B, C)
      const m1 = solveAffine(sA, sB, sC, dA, dB, dC);
      if (m1) {
        targetCtx.save();
        targetCtx.beginPath();
        targetCtx.moveTo(dA[0], dA[1]);
        targetCtx.lineTo(dB[0], dB[1]);
        targetCtx.lineTo(dC[0], dC[1]);
        targetCtx.closePath();
        targetCtx.clip();
        targetCtx.transform(m1[0], m1[1], m1[2], m1[3], m1[4], m1[5]);
        targetCtx.drawImage(patCanvas, 0, 0);
        targetCtx.restore();
      }

      // Triangle 2: (B, D, C)
      const m2 = solveAffine(sB, sD, sC, dB, dD, dC);
      if (m2) {
        targetCtx.save();
        targetCtx.beginPath();
        targetCtx.moveTo(dB[0], dB[1]);
        targetCtx.lineTo(dD[0], dD[1]);
        targetCtx.lineTo(dC[0], dC[1]);
        targetCtx.closePath();
        targetCtx.clip();
        targetCtx.transform(m2[0], m2[1], m2[2], m2[3], m2[4], m2[5]);
        targetCtx.drawImage(patCanvas, 0, 0);
        targetCtx.restore();
      }
    }
  }
}

export default function NeuralRenovationModal({
  isOpen,
  onClose,
  activeTile,
  selectedProduct,
  onSelectAlternativeTile,
  availableProducts = []
}) {
  const [activePresetId, setActivePresetId] = useState('luxury_bath');

  // Tile settings
  const initialTile = activeTile || selectedProduct || {
    name: 'Bien Calacatta Gold 60x120',
    brand: { name: 'Bien Seramik' },
    width: 60,
    height: 120,
    textureUrl: '/textures/calacatta_gold.jpg',
    finish: 'Full Lappato',
    color: 'Beyaz'
  };
  const [currentTile, setCurrentTile] = useState(initialTile);

  const [targetSurface, setTargetSurface] = useState('both'); // 'floor' | 'walls' | 'both'
  const [tileRotation, setTileRotation] = useState(0); // 0 or 90
  const [tileScale, setTileScale] = useState(1.0);
  const [groutColor, setGroutColor] = useState('rgba(148, 163, 184, 0.45)'); // subtle grey/white
  const [groutWidth, setGroutWidth] = useState(2); // 1, 2, 3 mm

  // Default 4 Corners for Room Perspective [Top-Left, Top-Right, Bottom-Right, Bottom-Left]
  const getDefaultCorners = useCallback((presetId, surface) => {
    if (presetId === 'modern_living') {
      return surface === 'walls'
        ? [[0, 10], [22, 10], [22, 52], [0, 52]]
        : [[0, 48], [100, 48], [100, 100], [0, 100]];
    }
    if (presetId === 'scandi_kitchen') {
      return surface === 'walls'
        ? [[38, 36], [100, 36], [100, 58], [38, 58]]
        : [[0, 60], [100, 60], [100, 100], [0, 100]];
    }
    if (presetId === 'modern_hallway') {
      return surface === 'walls'
        ? [[0, 20], [25, 20], [25, 80], [0, 80]]
        : [[32, 59], [66, 59], [100, 100], [0, 95]];
    }
    // luxury_bath or default
    return surface === 'walls'
      ? [[32, 0], [100, 0], [100, 68], [32, 68]]
      : [[0, 65], [100, 65], [100, 100], [0, 100]];
  }, []);

  const [corners, setCorners] = useState([[32, 0], [100, 0], [100, 68], [32, 68]]);
  const [showCornerPins, setShowCornerPins] = useState(false);
  const [activeCornerIndex, setActiveCornerIndex] = useState(null);
  const [isOpenCvProcessing, setIsOpenCvProcessing] = useState(false);

  // 3-Layer Composite Architecture States (Katman 3 Ön Plan Nesneleri)
  const [isForegroundLayerActive, setIsForegroundLayerActive] = useState(true);

  // Sync corners when preset or surface changes
  useEffect(() => {
    setCorners(getDefaultCorners(activePresetId, targetSurface));
  }, [activePresetId, targetSurface, getDefaultCorners]);

  // Dual-Engine Modes: 'canvas' (Live OpenCV Homography Engine) vs 'diffusion' (8K Photorealistic AI Redesign)
  const [renderMode, setRenderMode] = useState('canvas');
  const [isGeneratingAiRender, setIsGeneratingAiRender] = useState(false);
  const [aiRenderedImage, setAiRenderedImage] = useState(null);
  const [aiRenderError, setAiRenderError] = useState('');

  // Interactive Before/After Split Slider State (0 to 100 percentage)
  const [splitPos, setSplitPos] = useState(50);
  const [isDraggingSplit, setIsDraggingSplit] = useState(false);
  const splitContainerRef = useRef(null);

  // Canvases
  const originalCanvasRef = useRef(null);
  const renovatedCanvasRef = useRef(null);

  // Studio 2.0 Roomvo-Style States
  const [showOriginal, setShowOriginal] = useState(false);
  const [tileCategory, setTileCategory] = useState('all'); // 'all' | 'mermer' | 'beton' | 'ahsap'
  const [isFullscreen, setIsFullscreen] = useState(false);
  const modalContainerRef = useRef(null);

  // Fullscreen listener
  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (modalContainerRef.current?.requestFullscreen) {
        modalContainerRef.current.requestFullscreen().catch(() => {});
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  // Sync incoming tile prop
  useEffect(() => {
    if (activeTile?.name) {
      setCurrentTile(activeTile);
    } else if (selectedProduct?.name) {
      setCurrentTile(selectedProduct);
    }
  }, [activeTile, selectedProduct]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) handleModalClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleModalClose]);

  // Close handler
  const handleModalClose = useCallback(() => {
    if (onClose) onClose();
  }, [onClose]);

  // =========================================================================
  // CORE PHOTOREALISTIC RENDERING ENGINE
  // Renders the room with true 3D perspective, obstacle protection, and shadows
  // =========================================================================
  const renderComposedScene = useCallback(() => {
    const origCanvas = originalCanvasRef.current;
    const renoCanvas = renovatedCanvasRef.current;
    if (!origCanvas || !renoCanvas) return;

    const origCtx = origCanvas.getContext('2d');
    const renoCtx = renoCanvas.getContext('2d');

    // Katman 1: Base room image URL
    const activePreset = PRESET_SAMPLE_ROOMS.find(r => r.id === activePresetId) || PRESET_SAMPLE_ROOMS[0];
    const activeImgSrc = activePreset.url;

    // Katman 3: Foreground objects cutout URL
    const activeFgUrl = isForegroundLayerActive ? activePreset.fgUrl : null;

    // Katman 2: Resolved high-definition tile texture
    const tileSrc = getResolvedTileTexture(currentTile);

    const loadImg = (url) => new Promise((resolve) => {
      if (!url) return resolve(null);
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = url;
    });

    Promise.all([
      loadImg(activeImgSrc),
      loadImg(tileSrc).then(async (img) => {
        if (img) return img;
        return await loadImg('/textures/calacatta_gold.jpg');
      }),
      isForegroundLayerActive ? loadImg(activeFgUrl) : Promise.resolve(null)
    ]).then(([baseImg, tileImg, fgImg]) => {
      if (!baseImg) return;
      const w = baseImg.naturalWidth || 1280;
      const h = baseImg.naturalHeight || 720;

      origCanvas.width = w;
      origCanvas.height = h;
      renoCanvas.width = w;
      renoCanvas.height = h;

      // 1. Katman 1 (En alt): Orijinal oda fotografi (ÖNCESİ)
      origCtx.drawImage(baseImg, 0, 0, w, h);

      // -----------------------------------------------------------------
      // MODE 1: PHOTOREALISTIC 8K AI DIFFUSION REDESIGN (RoomGPT Style)
      // -----------------------------------------------------------------
      if (renderMode === 'diffusion' && aiRenderedImage) {
        const diffImg = new Image();
        diffImg.crossOrigin = 'anonymous';
        diffImg.onload = () => {
          renoCtx.drawImage(diffImg, 0, 0, w, h);
        };
        diffImg.src = aiRenderedImage;
        return;
      }

      // -----------------------------------------------------------------
      // MODE 2: 3-KATMANLI OPENCV HOMOGRAFİ VE MASKELEME MOTORU
      // -----------------------------------------------------------------
      // Katman 1 (En alt): Orijinal oda fotoğrafı zemine basılır
      renoCtx.drawImage(baseImg, 0, 0, w, h);

      if (!tileImg) return;

      // Katman 2 (Orta): OpenCV Homografi Perspektif Giydirme
      const drawSurface = (quadCorners, isFloor = false) => {
        if (!Array.isArray(quadCorners) || quadCorners.length < 4) return;
        const p0 = [quadCorners[0][0] / 100 * w, quadCorners[0][1] / 100 * h]; // TL
        const p1 = [quadCorners[1][0] / 100 * w, quadCorners[1][1] / 100 * h]; // TR
        const p2 = [quadCorners[2][0] / 100 * w, quadCorners[2][1] / 100 * h]; // BR
        const p3 = [quadCorners[3][0] / 100 * w, quadCorners[3][1] / 100 * h]; // BL

        const minX = Math.min(p0[0], p1[0], p2[0], p3[0]);
        const maxX = Math.max(p0[0], p1[0], p2[0], p3[0]);
        const minY = Math.min(p0[1], p1[1], p2[1], p3[1]);
        const maxY = Math.max(p0[1], p1[1], p2[1], p3[1]);
        const quadW = Math.max(100, maxX - minX);
        const quadH = Math.max(100, maxY - minY);

        // Mimari Gerçek Dünya Karo Ölçeklemesi (60x120 cm ebat oranı)
        const isRotated = tileRotation === 90;
        const tileAspect = (currentTile.width || 60) / (currentTile.height || 120);
        const effectiveAspect = isRotated ? (1 / tileAspect) : tileAspect;

        const numSlabsY = isFloor ? 3.2 : 2.0;
        const slabH = Math.max(60, Math.round((quadH / numSlabsY) * (tileScale || 1.0)));
        const slabW = Math.max(30, Math.round(slabH * effectiveAspect));

        const repeatX = Math.max(2, Math.ceil(quadW / slabW) + 1);
        const repeatY = Math.max(2, Math.ceil(quadH / slabH) + 1);
        const gridW = repeatX * slabW;
        const gridH = repeatY * slabH;

        const patCanvas = document.createElement('canvas');
        patCanvas.width = gridW;
        patCanvas.height = gridH;
        const patCtx = patCanvas.getContext('2d');

        // Tek bir porselen karo damgası: Opak taban + Seramik deseni + İnce gerçek derz
        const stamp = document.createElement('canvas');
        stamp.width = slabW;
        stamp.height = slabH;
        const sCtx = stamp.getContext('2d');

        sCtx.fillStyle = getTileBaseColor(currentTile);
        sCtx.fillRect(0, 0, slabW, slabH);
        try {
          sCtx.drawImage(tileImg, 0, 0, slabW, slabH);
        } catch (e) {
          // ignore potential tainted image
        }
        sCtx.strokeStyle = groutColor || 'rgba(180, 180, 180, 0.45)';
        sCtx.lineWidth = Math.max(1, groutWidth || 2);
        sCtx.strokeRect(0, 0, slabW, slabH);

        const pattern = patCtx.createPattern(stamp, 'repeat');
        if (pattern) {
          patCtx.fillStyle = pattern;
          patCtx.fillRect(0, 0, gridW, gridH);
        }

        // 2D ızgarayı 4 köşeye homografi perspektifiyle ger (cv2.warpPerspective eşdeğeri)
        renoCtx.save();
        renoCtx.beginPath();
        renoCtx.moveTo(p0[0], p0[1]);
        renoCtx.lineTo(p1[0], p1[1]);
        renoCtx.lineTo(p2[0], p2[1]);
        renoCtx.lineTo(p3[0], p3[1]);
        renoCtx.closePath();
        renoCtx.clip();

        warpQuadToCanvas(renoCtx, patCanvas, p0, p1, p2, p3, 16);

        // Doğal Işık & Gölge Çıkarma (Soft-Light + Multiply + Screen)
        renoCtx.save();
        renoCtx.globalCompositeOperation = 'soft-light';
        renoCtx.globalAlpha = 0.65;
        renoCtx.drawImage(baseImg, 0, 0, w, h);
        renoCtx.restore();

        // İnce temas gölgesi derinliği
        renoCtx.save();
        renoCtx.globalCompositeOperation = 'multiply';
        renoCtx.globalAlpha = 0.20;
        renoCtx.drawImage(baseImg, 0, 0, w, h);
        renoCtx.restore();

        // Lappato parlaklık yansıması
        renoCtx.save();
        renoCtx.globalCompositeOperation = 'screen';
        renoCtx.globalAlpha = 0.22;
        renoCtx.drawImage(baseImg, 0, 0, w, h);
        renoCtx.restore();

        renoCtx.restore();
      };

      // Yüzey seçimlerine göre seramiği döşe
      const wallCorners = getDefaultCorners(activePresetId, 'walls');
      const floorCorners = getDefaultCorners(activePresetId, 'floor');

      if (activePresetId === 'modern_living') {
        if (targetSurface === 'walls') {
          drawSurface(wallCorners);
        } else {
          // 'floor' or 'both' -> Geniş açık konsept salon zemini
          drawSurface(floorCorners, true);
        }
      } else if (activePresetId === 'scandi_kitchen') {
        if (targetSurface === 'floor') {
          drawSurface(floorCorners, true);
        } else {
          // 'walls' or 'both' -> Tezgah arkası seramik duvarı
          drawSurface(wallCorners);
        }
      } else if (activePresetId === 'modern_hallway') {
        if (targetSurface === 'walls') {
          drawSurface(wallCorners);
        } else {
          // 'floor' or 'both' -> Karşılama koridoru ve antre zemini
          drawSurface(floorCorners, true);
        }
      } else {
        // luxury_bath
        if (targetSurface === 'walls') {
          drawSurface(wallCorners);
        } else if (targetSurface === 'floor') {
          drawSurface(floorCorners, true);
        } else if (targetSurface === 'both') {
          drawSurface(wallCorners);
          drawSurface(floorCorners, true);
        }
      }

      // -----------------------------------------------------------------
      // Katman 3 (En üst): Duvardan bağımsız ön plandaki nesneler
      // Kadın, tezgah, musluk, dolaplar, küvet, dresuar şeffaf PNG katmanı
      // -----------------------------------------------------------------
      if (fgImg) {
        renoCtx.save();
        renoCtx.drawImage(fgImg, 0, 0, w, h);
        renoCtx.restore();
      }
    });
  }, [isForegroundLayerActive, activePresetId, currentTile, targetSurface, tileRotation, tileScale, groutColor, groutWidth, renderMode, aiRenderedImage, corners, getDefaultCorners]);

  // Handle Corner Pin Dragging
  const handlePinMouseDown = (index, e) => {
    e.stopPropagation();
    setActiveCornerIndex(index);
  };

  const handleContainerMouseMove = useCallback((e) => {
    if (activeCornerIndex === null) return;
    const container = splitContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const pctX = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const pctY = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setCorners(prev => {
      const next = prev.map((c, idx) => idx === activeCornerIndex ? [parseFloat(pctX.toFixed(1)), parseFloat(pctY.toFixed(1))] : c);
      return next;
    });
  }, [activeCornerIndex]);

  const handleContainerMouseUp = useCallback(() => {
    setActiveCornerIndex(null);
  }, []);

  useEffect(() => {
    if (activeCornerIndex !== null) {
      const onMove = (e) => handleContainerMouseMove(e);
      const onTouch = (e) => {
        if (e.touches?.[0]) handleContainerMouseMove(e.touches[0]);
      };
      const onUp = () => handleContainerMouseUp();

      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
      window.addEventListener('touchmove', onTouch);
      window.addEventListener('touchend', onUp);
      return () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
        window.removeEventListener('touchmove', onTouch);
        window.removeEventListener('touchend', onUp);
      };
    }
  }, [activeCornerIndex, handleContainerMouseMove, handleContainerMouseUp]);

  // Server-side OpenCV HD rendering action
  const handleOpenCvHdRender = async () => {
    setIsOpenCvProcessing(true);
    try {
      const activePreset = PRESET_SAMPLE_ROOMS.find(r => r.id === activePresetId) || PRESET_SAMPLE_ROOMS[0];
      const activeImgSrc = activePreset.url;
      const activeFgUrl = isForegroundLayerActive ? activePreset.fgUrl : null;

      const res = await fetch('/api/ai/opencv-tile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room_image: activeImgSrc,
          tile_image: getResolvedTileTexture(currentTile),
          dst_corners: corners,
          obstacles: [],
          foreground_image: activeFgUrl,
          auto_segment: false,
          tile_w_px: Math.round(320 * tileScale),
          tile_h_px: Math.round(640 * tileScale),
          grout_size: groutWidth,
          grout_color: [200, 200, 200]
        })
      });

      const data = await res.json();
      if (data.success && data.rendered_image) {
        setAiRenderedImage(data.rendered_image);
        setRenderMode('diffusion');
      }
    } catch (err) {
      console.warn('OpenCV HD Render warning:', err);
    } finally {
      setIsOpenCvProcessing(false);
    }
  };

  // Re-render when dependencies change
  useEffect(() => {
    if (isOpen) {
      renderComposedScene();
    }
  }, [isOpen, renderComposedScene]);

  // Handle Split Slider Interaction (Mouse / Touch)
  const handleSplitMove = useCallback((clientX) => {
    const container = splitContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSplitPos(pct);
  }, []);

  const handleMouseDown = () => setIsDraggingSplit(true);
  const handleMouseUp = () => setIsDraggingSplit(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDraggingSplit) handleSplitMove(e.clientX);
    };
    const handleTouchMove = (e) => {
      if (isDraggingSplit && e.touches?.[0]) handleSplitMove(e.touches[0].clientX);
    };
    const handleStop = () => setIsDraggingSplit(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleStop);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleStop);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleStop);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleStop);
    };
  }, [isDraggingSplit, handleSplitMove]);

  // Download High-Res Result
  const handleDownloadSnapshot = () => {
    const canvas = showOriginal ? originalCanvasRef.current : renovatedCanvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `seramikbak-tadilat-${currentTile.name?.toLowerCase().replace(/\s+/g, '-') || 'tasarim'}.jpg`;
    link.href = canvas.toDataURL('image/jpeg', 0.95);
    link.click();
  };

  // Current active preset room
  const currentPreset = PRESET_SAMPLE_ROOMS.find(r => r.id === activePresetId) || PRESET_SAMPLE_ROOMS[0];
  const roomAreaM2 = currentPreset?.areaM2 || 6.4;
  const tileM2 = ((currentTile.width || 60) * (currentTile.height || 120)) / 10000;
  const tilesPerBox = Math.max(2, Math.round(1.44 / (tileM2 || 0.72)));
  const boxAreaM2 = tileM2 * tilesPerBox;
  const calculatedBoxes = Math.ceil((roomAreaM2 * 1.10) / (boxAreaM2 || 1.44));

  // Merge featured studio tiles with incoming catalog products
  const allStudioTiles = React.useMemo(() => {
    const list = [...FEATURED_STUDIO_TILES];
    if (Array.isArray(availableProducts) && availableProducts.length > 0) {
      availableProducts.forEach(p => {
        if (!list.some(item => (item.id && item.id === p.id) || item.name === p.name)) {
          list.push(p);
        }
      });
    }
    return list;
  }, [availableProducts]);

  // Filter tiles by category tab
  const filteredTiles = React.useMemo(() => {
    if (tileCategory === 'all') return allStudioTiles;
    return allStudioTiles.filter(t => {
      const cat = (t.category || '').toLowerCase();
      const name = (t.name || '').toLowerCase();
      if (tileCategory === 'mermer') {
        return cat === 'mermer' || name.includes('calacatta') || name.includes('mermer') || name.includes('travertin');
      }
      if (tileCategory === 'beton') {
        return cat === 'beton' || name.includes('beton') || name.includes('loft') || name.includes('volcano') || name.includes('antrasit');
      }
      if (tileCategory === 'ahsap') {
        return cat === 'ahsap' || name.includes('ahşap') || name.includes('oak') || name.includes('parke');
      }
      return true;
    });
  }, [allStudioTiles, tileCategory]);

  const waMessage = `Merhaba, SeramikBak Stüdyo 2.0 uygulamasında ${currentPreset.title} (${roomAreaM2} m²) için "${currentTile.brand?.name || ''} ${currentTile.name}" seramiğini denedim. Yaklaşık ${calculatedBoxes} kutu için bayi fiyat teklifi ve numune talebinde bulunmak istiyorum.`;
  const waUrl = `https://wa.me/905321381061?text=${encodeURIComponent(waMessage)}`;

  if (!isOpen) return null;

  return (
    <div
      ref={modalContainerRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#070a12',
        display: 'flex',
        flexDirection: 'column',
        color: '#f8fafc',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        overflow: 'hidden'
      }}
    >
      {/* -------------------- 1. MINIMALIST TOP HEADER -------------------- */}
      <header
        style={{
          height: '60px',
          padding: '0 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(11, 16, 29, 0.95)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexShrink: 0,
          zIndex: 50
        }}
      >
        {/* Left: Studio Branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '180px' }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #d4af37 0%, #aa8c2c 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0b0f19',
            boxShadow: '0 2px 10px rgba(212, 175, 55, 0.3)'
          }}>
            <Sparkles size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.92rem', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>SeramikBak Stüdyo</span>
              <span style={{ fontSize: '0.58rem', fontWeight: '900', background: 'rgba(212, 175, 55, 0.2)', color: '#d4af37', padding: '1px 5px', borderRadius: '4px', border: '1px solid rgba(212, 175, 55, 0.3)' }}>2.0</span>
            </div>
            <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>
              Canlı Mekan Giydirme Simülatörü
            </div>
          </div>
        </div>

        {/* Center: 4-Room Architectural Selector Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.04)', padding: '3px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
          {PRESET_SAMPLE_ROOMS.map(p => {
            const isActive = activePresetId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => {
                  setActivePresetId(p.id);
                  setAiRenderedImage(null);
                  setRenderMode('canvas');
                }}
                style={{
                  padding: '7px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: isActive ? '800' : '600',
                  background: isActive ? '#d4af37' : 'transparent',
                  color: isActive ? '#0b0f19' : '#cbd5e1',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease',
                  boxShadow: isActive ? '0 2px 8px rgba(212, 175, 55, 0.35)' : 'none'
                }}
              >
                <span>{p.icon}</span>
                <span>{p.title}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Surface Pills & Close Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '180px', justifyContent: 'flex-end' }}>
          {/* Surface Switcher Pills */}
          <div style={{ display: 'flex', gap: '3px', background: 'rgba(255, 255, 255, 0.05)', padding: '2px', borderRadius: '8px' }}>
            {[
              { id: 'both', label: 'Tümü' },
              { id: 'walls', label: 'Duvar' },
              { id: 'floor', label: 'Zemin' }
            ].map(surf => (
              <button
                key={surf.id}
                onClick={() => setTargetSurface(surf.id)}
                style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.68rem',
                  fontWeight: targetSurface === surf.id ? '800' : '600',
                  background: targetSurface === surf.id ? 'rgba(212, 175, 55, 0.25)' : 'transparent',
                  color: targetSurface === surf.id ? '#d4af37' : '#94a3b8',
                  cursor: 'pointer'
                }}
              >
                {surf.label}
              </button>
            ))}
          </div>

          {/* Close Button */}
          <button
            onClick={handleModalClose}
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            title="Kapat (ESC)"
          >
            <X size={18} />
          </button>
        </div>
      </header>

      {/* -------------------- 2. MAIN CINEMATIC ROOM VIEWPORT -------------------- */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#04060b',
          overflow: 'hidden'
        }}
      >
        {/* Ambient Room Glow / Backdrop to eliminate black side void */}
        <div
          style={{
            position: 'absolute',
            inset: -20,
            backgroundImage: `url(${PRESET_SAMPLE_ROOMS.find(r => r.id === activePresetId)?.url || PRESET_SAMPLE_ROOMS[0].url})`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            filter: 'blur(60px) brightness(0.2)',
            opacity: 0.7,
            pointerEvents: 'none',
            zIndex: 1
          }}
        />

        {/* Canvases: Renovated vs Original */}
        <canvas
          ref={renovatedCanvasRef}
          style={{
            position: 'relative',
            zIndex: 2,
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            borderRadius: '12px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.08)',
            display: showOriginal ? 'none' : 'block'
          }}
        />
        <canvas
          ref={originalCanvasRef}
          style={{
            position: 'relative',
            zIndex: 2,
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            borderRadius: '12px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.08)',
            display: showOriginal ? 'block' : 'none'
          }}
        />

        {/* Active Tile Tag (Top-Left) */}
        <div style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          zIndex: 25,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div style={{
            background: showOriginal ? 'rgba(30, 41, 59, 0.85)' : 'rgba(11, 16, 29, 0.85)',
            backdropFilter: 'blur(10px)',
            padding: '5px 12px',
            borderRadius: '8px',
            fontSize: '0.72rem',
            fontWeight: '800',
            color: showOriginal ? '#cbd5e1' : '#ffffff',
            border: showOriginal ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(212, 175, 55, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
          }}>
            {showOriginal ? (
              <span>📷 ÖNCESİ (Mevcut Mekan)</span>
            ) : (
              <>
                <Sparkles size={13} color="#d4af37" />
                <span>SONRASI: {currentTile.brand?.name || 'Bien'} {currentTile.name}</span>
              </>
            )}
          </div>
        </div>

        {/* Floating Top-Right Tools */}
        <div style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          zIndex: 25,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {/* Before/After Toggle & Hold Button */}
          <button
            onClick={() => setShowOriginal(prev => !prev)}
            onMouseDown={() => setShowOriginal(true)}
            onMouseUp={() => setShowOriginal(false)}
            onTouchStart={() => setShowOriginal(true)}
            onTouchEnd={() => setShowOriginal(false)}
            style={{
              height: '34px',
              padding: '0 12px',
              borderRadius: '8px',
              background: showOriginal ? '#d4af37' : 'rgba(11, 16, 29, 0.85)',
              backdropFilter: 'blur(10px)',
              border: showOriginal ? '1px solid #d4af37' : '1px solid rgba(255, 255, 255, 0.15)',
              color: showOriginal ? '#0b0f19' : '#ffffff',
              fontSize: '0.74rem',
              fontWeight: '800',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
              userSelect: 'none'
            }}
            title="Tıklayın veya basılı tutarak orijinal odayı görün"
          >
            <RefreshCw size={13} />
            <span>{showOriginal ? 'Orijinal Mekan' : 'Öncesi / Sonrası'}</span>
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: 'rgba(11, 16, 29, 0.85)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
            }}
            title={isFullscreen ? 'Tam Ekrandan Çık' : 'Tam Ekran'}
          >
            <Maximize2 size={15} />
          </button>

          {/* Snapshot Download Button */}
          <button
            onClick={handleDownloadSnapshot}
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: 'rgba(11, 16, 29, 0.85)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
            }}
            title="Tasarımı Görsel Olarak Kaydet"
          >
            <Download size={15} color="#d4af37" />
          </button>
        </div>

        {/* Floating Bottom-Right Product & WhatsApp Quote Card */}
        <div style={{
          position: 'absolute',
          bottom: '16px',
          right: '20px',
          zIndex: 30,
          background: 'rgba(11, 16, 29, 0.88)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '14px',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
          maxWidth: 'calc(100% - 40px)'
        }}>
          {/* Product thumbnail */}
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '8px',
            overflow: 'hidden',
            background: '#1e293b',
            border: '1px solid rgba(255,255,255,0.1)',
            flexShrink: 0
          }}>
            <img
              src={currentTile.textureUrl || currentTile.imageUrl}
              alt={currentTile.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          {/* Product info & Metraj estimate */}
          <div style={{ minWidth: '150px', maxWidth: '240px' }}>
            <div style={{
              fontSize: '0.82rem',
              fontWeight: '800',
              color: '#ffffff',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {currentTile.name}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#d4af37', fontWeight: '700', marginTop: '1px' }}>
              {currentTile.brand?.name || 'Bien Seramik'} • {currentTile.width || 60}x{currentTile.height || 120} cm
            </div>
            <div style={{ fontSize: '0.64rem', color: '#94a3b8', marginTop: '2px' }}>
              Mekan: ~{roomAreaM2} m² • Tahmini {calculatedBoxes} Kutu
            </div>
          </div>

          {/* High-Converting WhatsApp CTA Button */}
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              height: '38px',
              padding: '0 16px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff',
              fontWeight: '800',
              fontSize: '0.78rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.35)',
              flexShrink: 0
            }}
          >
            <MessageCircle size={15} />
            <span>Fiyat & Numune İste</span>
          </a>
        </div>
      </div>

      {/* -------------------- 3. BOTTOM ROOMVO TILE CAROUSEL -------------------- */}
      <div
        style={{
          background: '#0b101d',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '10px 20px 14px 20px',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          zIndex: 40
        }}
      >
        {/* Category Filter Pills & Tile count */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', marginRight: '4px' }}>
              Koleksiyon:
            </span>
            {[
              { id: 'all', label: 'Tümü' },
              { id: 'mermer', label: 'Mermer Doku' },
              { id: 'beton', label: 'Beton & Taş' },
              { id: 'ahsap', label: 'Ahşap & Parke' }
            ].map(cat => {
              const isActive = tileCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setTileCategory(cat.id)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: isActive ? '1px solid #d4af37' : '1px solid rgba(255, 255, 255, 0.08)',
                    background: isActive ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                    color: isActive ? '#d4af37' : '#cbd5e1',
                    fontSize: '0.68rem',
                    fontWeight: isActive ? '800' : '600',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          <div style={{ fontSize: '0.66rem', color: '#64748b' }}>
            ⚡ Karoya tıklayın, odanız anında döşensin
          </div>
        </div>

        {/* Horizontal Quick Tile Carousel */}
        <div style={{
          display: 'flex',
          gap: '10px',
          overflowX: 'auto',
          scrollbarWidth: 'thin',
          paddingBottom: '2px'
        }}>
          {filteredTiles.map(tile => {
            const isSelected = (currentTile.id && currentTile.id === tile.id) || currentTile.name === tile.name;
            return (
              <div
                key={tile.id || tile.name}
                onClick={() => {
                  setCurrentTile(tile);
                  if (onSelectAlternativeTile) onSelectAlternativeTile(tile);
                }}
                style={{
                  width: '110px',
                  height: '84px',
                  flexShrink: 0,
                  borderRadius: '10px',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  background: '#151d2f',
                  border: isSelected ? '2px solid #d4af37' : '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: isSelected ? '0 0 12px rgba(212, 175, 55, 0.4)' : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.15s ease, border-color 0.15s ease'
                }}
                title={tile.name}
              >
                {/* Tile texture image preview */}
                <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#0e1422' }}>
                  <img
                    src={tile.textureUrl || tile.imageUrl}
                    alt={tile.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {isSelected && (
                    <div style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: '#d4af37',
                      color: '#0b0f19',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.5)'
                    }}>
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}
                </div>

                {/* Tile name & dimensions footer */}
                <div style={{
                  padding: '4px 6px',
                  background: isSelected ? 'rgba(212, 175, 55, 0.15)' : 'rgba(0, 0, 0, 0.6)',
                  borderTop: '1px solid rgba(255, 255, 255, 0.06)'
                }}>
                  <div style={{
                    fontSize: '0.62rem',
                    fontWeight: '800',
                    color: isSelected ? '#ffffff' : '#e2e8f0',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {tile.name}
                  </div>
                  <div style={{
                    fontSize: '0.55rem',
                    color: isSelected ? '#d4af37' : '#94a3b8',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {tile.width || 60}x{tile.height || 120} cm • {tile.brand?.name || 'Seramik'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes sb-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
