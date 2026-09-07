'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Camera, X, RefreshCw, Layers, CheckCircle2, Sliders, Smartphone,
  Download, Sparkles, Plus, Trash2, Send, MessageCircle, Calculator,
  Maximize2, ShieldCheck, Store, ChevronRight, AlertCircle, ChevronDown, ChevronUp,
  Target, Compass, CornerDownRight, Check, Move, Eye, Upload
} from 'lucide-react';

export default function ARRoomScannerModal({ isOpen, onClose, selectedProduct, currentDealer }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);

  const [stream, setStream] = useState(null);
  const [cameraLoading, setCameraLoading] = useState(true);
  const [cameraError, setCameraError] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [showMobilePanel, setShowMobilePanel] = useState(true);
  const [userPhotoBg, setUserPhotoBg] = useState(null);
  const [capturedSnapshot, setCapturedSnapshot] = useState(null);

  // Active Tab: 'SCANNER' | 'CALCULATOR' | 'QUOTE'
  const [activeTab, setActiveTab] = useState('SCANNER');

  // Surface Type: 'WALL' or 'FLOOR'
  const [surfaceType, setSurfaceType] = useState('WALL');

  // Room Measurement State (in meters) - Default Standard Bathroom (2.4m x 2.6m)
  const [roomWidth, setRoomWidth] = useState(2.4);  // meters (En)
  const [roomHeight, setRoomHeight] = useState(2.6); // meters (Boy)

  // Measurement Interaction Mode: 'DRAG' (4-Köşe Pinleri Sürükle) | 'TAP' (Noktadan Noktaya Dokunarak Ölç)
  const [measureMode, setMeasureMode] = useState('DRAG');
  const [tapStep, setTapStep] = useState(0); // 0: sol alt, 1: sağ alt (En), 2: üst/boy (Boy), 3: tamamlandı
  const [activePinIndex, setActivePinIndex] = useState(null);

  // 4 Interactive Corner Pins in Normalized Coordinates (0.0 to 1.0)
  // Ordered: [0: Sol Alt, 1: Sağ Alt, 2: Sağ Üst, 3: Sol Üst]
  const [corners, setCorners] = useState([
    { x: 0.18, y: 0.82, id: 'p0', label: '1. Sol Alt' },
    { x: 0.82, y: 0.82, id: 'p1', label: '2. Sağ Alt' },
    { x: 0.78, y: 0.28, id: 'p2', label: '3. Sağ Üst' },
    { x: 0.22, y: 0.28, id: 'p3', label: '4. Sol Üst' }
  ]);

  // Tile Dimensions & Calculation Info
  const tileW = (selectedProduct?.width || 60) / 100;
  const tileH = (selectedProduct?.height || 120) / 100;
  const tileM2PerBox = (tileW * tileH * 2) || 1.44;
  const tilePricePerM2 = selectedProduct?.trendyolPrice || selectedProduct?.koctasPrice || 450;

  // Cutout Subtractions List (Starts empty so Net Area = exact scanned room area)
  const [cutouts, setCutouts] = useState([]);

  // Tile Customization
  const [activeTileTexture, setActiveTileTexture] = useState(
    selectedProduct?.textureUrl || selectedProduct?.imageUrl || '/textures/calacatta_gold.jpg'
  );
  const [layStyle, setLayStyle] = useState('straight'); // straight, diagonal, herringbone
  const [groutColor, setGroutColor] = useState('#d4af37');

  // Quote & Lead Submission State
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientNotes, setClientNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Calculated Metrics
  const grossAreaM2 = parseFloat((roomWidth * roomHeight).toFixed(2));
  const cutoutAreaM2 = parseFloat(
    cutouts.reduce((acc, curr) => acc + curr.w * curr.h, 0).toFixed(2)
  );
  const netAreaM2 = Math.max(0, parseFloat((grossAreaM2 - cutoutAreaM2).toFixed(2)));
  const netWithWasteM2 = parseFloat((netAreaM2 * 1.10).toFixed(2));
  const boxCount = Math.ceil(netWithWasteM2 / tileM2PerBox);
  const totalTileCost = Math.round(netWithWasteM2 * tilePricePerM2);
  const adhesiveBags = Math.ceil(netWithWasteM2 / 5); // 1 çuval ~ 5m²
  const groutKg = Math.ceil(netWithWasteM2 * 0.4);   // ~0.4 kg/m²
  const estLaborCost = Math.round(netWithWasteM2 * 350); // Ortalama 350 TL/m² işçilik
  const totalEstMaterialCost = totalTileCost + (adhesiveBags * 280) + (groutKg * 45);
  const totalEstRenovationCost = totalEstMaterialCost + estLaborCost;

  // Track Mobile Screen
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update Tile Texture when product changes
  useEffect(() => {
    if (selectedProduct?.imageUrl || selectedProduct?.textureUrl) {
      setActiveTileTexture(selectedProduct.textureUrl || selectedProduct.imageUrl);
    }
  }, [selectedProduct]);

  // =========================================================================
  // CAMERA STREAM LIFECYCLE MANAGEMENT (ZERO LEAK ARCHITECTURE)
  // =========================================================================
  const stopCamera = useCallback(() => {
    try {
      if (streamRef.current) {
        const tracks = streamRef.current.getTracks();
        tracks.forEach((track) => {
          try {
            track.stop();
          } catch (e) {
            console.warn('Track stop error:', e);
          }
        });
        streamRef.current = null;
      }

      if (videoRef.current) {
        if (videoRef.current.srcObject) {
          const vStream = videoRef.current.srcObject;
          if (vStream && typeof vStream.getTracks === 'function') {
            vStream.getTracks().forEach((track) => {
              try {
                track.stop();
              } catch (e) {
                console.warn('Video track stop error:', e);
              }
            });
          }
          videoRef.current.srcObject = null;
        }
        try {
          videoRef.current.pause();
        } catch (e) {}
      }
    } catch (err) {
      console.error('Error stopping camera:', err);
    }
    setStream(null);
    setCameraLoading(false);
  }, []);

  const startCamera = useCallback(async () => {
    stopCamera();
    setCameraLoading(true);
    setCameraError('');

    if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Kamera erişimi tarayıcınızda desteklenmiyor. Sanal Showroom modu aktif.');
      setCameraLoading(false);
      return;
    }

    let mediaStream = null;

    // Strategy 1: Rear environment camera (ideal for AR measuring)
    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });
    } catch (e1) {
      // Strategy 2: User/front camera (laptops / webcams)
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: false
        });
      } catch (e2) {
        // Strategy 3: Any available video device
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
          });
        } catch (e3) {
          console.warn('All camera constraints failed:', e3);
        }
      }
    }

    if (mediaStream) {
      streamRef.current = mediaStream;
      setStream(mediaStream);
      setCameraError('');

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = async () => {
          try {
            await videoRef.current.play();
          } catch (pErr) {
            console.error('Video play error:', pErr);
          }
          setCameraLoading(false);
        };
      }
    } else {
      setCameraError('Kamera izni kısıtlı. Dokunmatik Lazer Sanal Showroom aktif.');
      setCameraLoading(false);
    }
  }, [stopCamera]);

  // Safe Close Handler
  const handleClose = useCallback(() => {
    stopCamera();
    if (onClose) onClose();
  }, [stopCamera, onClose]);

  // Manage camera on modal open/close & page navigation
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }
    startCamera();

    const handleBeforeUnload = () => stopCamera();
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);
      stopCamera();
    };
  }, [isOpen, startCamera, stopCamera]);

  // Global escape key listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  // =========================================================================
  // INTERACTIVE LAZER MEZURA & CORNER CALCULATION
  // =========================================================================
  // Helper: Convert screen pointer coordinates to normalized canvas coords (0.0 to 1.0)
  const getPointerNormalizedPos = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0.5, y: 0.5, pxX: 0, pxY: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX ?? (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
    const clientY = e.clientY ?? (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
    const normX = Math.max(0.04, Math.min(0.96, (clientX - rect.left) / rect.width));
    const normY = Math.max(0.04, Math.min(0.96, (clientY - rect.top) / rect.height));
    return {
      x: normX,
      y: normY,
      pxX: clientX - rect.left,
      pxY: clientY - rect.top
    };
  };

  // Recalculate room dimensions from current corners
  const updateDimensionsFromCorners = (updatedCorners) => {
    const c = updatedCorners;
    // P0: Sol Alt, P1: Sağ Alt -> En (Width)
    const normWidthDist = Math.hypot(c[1].x - c[0].x, c[1].y - c[0].y);
    // P0: Sol Alt, P3: Sol Üst -> Boy (Height)
    const normHeightDist = Math.hypot(c[3].x - c[0].x, c[3].y - c[0].y);

    // Scaling calibration: Full canvas width ~ 3.6m at standard room distance (~2m)
    const computedW = Math.max(0.8, Math.min(15.0, parseFloat((normWidthDist * 3.8).toFixed(1))));
    const computedH = Math.max(0.8, Math.min(12.0, parseFloat((normHeightDist * 3.6).toFixed(1))));

    setRoomWidth(computedW);
    setRoomHeight(computedH);
  };

  // Synchronize corners when user manually changes En/Boy via sliders/presets
  const updateCornersFromDimensions = (newW, newH) => {
    const normW = Math.max(0.2, Math.min(0.85, newW / 3.8));
    const normH = Math.max(0.2, Math.min(0.85, newH / 3.6));

    const centerX = 0.5;
    const centerY = 0.55;

    const halfW = normW / 2;
    const halfH = normH / 2;

    setCorners([
      { x: Math.max(0.05, centerX - halfW), y: Math.min(0.92, centerY + halfH), id: 'p0', label: '1. Sol Alt' },
      { x: Math.min(0.95, centerX + halfW), y: Math.min(0.92, centerY + halfH), id: 'p1', label: '2. Sağ Alt' },
      { x: Math.min(0.92, centerX + halfW * 0.94), y: Math.max(0.08, centerY - halfH), id: 'p2', label: '3. Sağ Üst' },
      { x: Math.max(0.08, centerX - halfW * 0.94), y: Math.max(0.08, centerY - halfH), id: 'p3', label: '4. Sol Üst' }
    ]);
  };

  // Quick Preset Room Sizer
  const applyRoomPreset = (w, h) => {
    setRoomWidth(w);
    setRoomHeight(h);
    updateCornersFromDimensions(w, h);
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(40);
  };

  // Canvas Pointer Event Handlers (Mouse & Touch on Canvas)
  const handleCanvasPointerDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { x, y, pxX, pxY } = getPointerNormalizedPos(e);
    const rect = canvas.getBoundingClientRect();

    // Mode A: Tap-to-Measure Step-by-Step
    if (measureMode === 'TAP') {
      if (tapStep === 0) {
        // Step 1: Place Sol Alt (P0)
        const updated = [...corners];
        updated[0] = { ...updated[0], x, y };
        setCorners(updated);
        setTapStep(1);
        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(40);
      } else if (tapStep === 1) {
        // Step 2: Place Sağ Alt (P1) -> Locks En
        const updated = [...corners];
        updated[1] = { ...updated[1], x, y };
        setCorners(updated);
        updateDimensionsFromCorners(updated);
        setTapStep(2);
        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50);
      } else if (tapStep === 2) {
        // Step 3: Place Sağ Üst (P2) & Sol Üst (P3) -> Locks Boy & Completes Quad
        const updated = [...corners];
        updated[2] = { ...updated[2], x, y };
        // Estimate P3 parallel to P0-P1
        const dx = updated[1].x - updated[0].x;
        const dy = updated[1].y - updated[0].y;
        updated[3] = { ...updated[3], x: Math.max(0.04, x - dx), y: y };
        setCorners(updated);
        updateDimensionsFromCorners(updated);
        setTapStep(3);
        setMeasureMode('DRAG');
        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([40, 50, 80]);
      }
      return;
    }

    // Mode B: Free Pin Dragging (Hit Test on 4 Pins)
    const hitRadiusPx = isMobile ? 38 : 26;
    let hitIndex = null;

    corners.forEach((corner, idx) => {
      const pinPxX = corner.x * rect.width;
      const pinPxY = corner.y * rect.height;
      const dist = Math.hypot(pxX - pinPxX, pxY - pinPxY);
      if (dist <= hitRadiusPx) {
        hitIndex = idx;
      }
    });

    if (hitIndex !== null) {
      setActivePinIndex(hitIndex);
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(25);
    }
  };

  const handleCanvasPointerMove = (e) => {
    if (activePinIndex === null || measureMode !== 'DRAG') return;
    const { x, y } = getPointerNormalizedPos(e);

    const updated = [...corners];
    updated[activePinIndex] = {
      ...updated[activePinIndex],
      x,
      y
    };

    setCorners(updated);
    updateDimensionsFromCorners(updated);
  };

  const handleCanvasPointerUp = () => {
    if (activePinIndex !== null) {
      setActivePinIndex(null);
    }
  };

  // Take Freeze Frame / Snapshot
  const handleTakeSnapshot = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      setCapturedSnapshot(dataUrl);
    }
  };

  // Upload Local Room Photo (Gallery fallback)
  const handleNativePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        setUserPhotoBg(evt.target.result);
        setCapturedSnapshot(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // =========================================================================
  // CANVAS RENDERING ENGINE (CAMERA + PERSPECTIVE TILES + LASER OVERLAY)
  // =========================================================================
  useEffect(() => {
    if (!isOpen) return;

    let animId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const tileImg = new Image();
    tileImg.crossOrigin = 'anonymous';
    tileImg.src = activeTileTexture;

    const userBgImg = new Image();
    if (userPhotoBg) userBgImg.src = userPhotoBg;

    const snapshotImg = new Image();
    if (capturedSnapshot) snapshotImg.src = capturedSnapshot;

    const renderARScanner = () => {
      const video = videoRef.current;
      const hasLiveVideo = !capturedSnapshot && !userPhotoBg && video && video.readyState === 4 && stream;

      // Handle Canvas Resolution
      if (hasLiveVideo) {
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth || 1280;
          canvas.height = video.videoHeight || 720;
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      } else if (capturedSnapshot && snapshotImg.complete && snapshotImg.naturalWidth > 0) {
        if (canvas.width !== snapshotImg.naturalWidth) {
          canvas.width = snapshotImg.naturalWidth;
          canvas.height = snapshotImg.naturalHeight;
        }
        ctx.drawImage(snapshotImg, 0, 0, canvas.width, canvas.height);
      } else if (userPhotoBg && userBgImg.complete && userBgImg.naturalWidth > 0) {
        if (canvas.width !== 1280) {
          canvas.width = 1280;
          canvas.height = 720;
        }
        ctx.drawImage(userBgImg, 0, 0, canvas.width, canvas.height);
      } else {
        if (canvas.width !== 1280) {
          canvas.width = 1280;
          canvas.height = 720;
        }
        // Procedural Virtual Showroom Backdrop
        const grad = ctx.createRadialGradient(
          canvas.width / 2, canvas.height / 3, 100,
          canvas.width / 2, canvas.height / 2, canvas.width / 1.1
        );
        grad.addColorStop(0, '#1e293b');
        grad.addColorStop(0.6, '#0f172a');
        grad.addColorStop(1, '#020617');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Perspective wall lines
        ctx.save();
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.15)';
        ctx.lineWidth = 1;
        const horizY = canvas.height * 0.45;
        ctx.beginPath();
        ctx.moveTo(0, horizY);
        ctx.lineTo(canvas.width, horizY);
        ctx.stroke();
        ctx.restore();
      }

      const w = canvas.width;
      const h = canvas.height;

      // Pixel coordinates for current corners
      const p0 = { x: corners[0].x * w, y: corners[0].y * h };
      const p1 = { x: corners[1].x * w, y: corners[1].y * h };
      const p2 = { x: corners[2].x * w, y: corners[2].y * h };
      const p3 = { x: corners[3].x * w, y: corners[3].y * h };

      // -------------------------------------------------------------
      // 1. TILE PATTERN RENDERING INSIDE 4-CORNER POLYGON
      // -------------------------------------------------------------
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.closePath();
      ctx.clip();

      if (tileImg.complete && tileImg.naturalWidth > 0) {
        ctx.globalAlpha = 0.88;
        const pattern = ctx.createPattern(tileImg, 'repeat');
        if (pattern) {
          ctx.save();
          const centerX = (p0.x + p1.x + p2.x + p3.x) / 4;
          const centerY = (p0.y + p1.y + p2.y + p3.y) / 4;
          ctx.translate(centerX, centerY);

          if (layStyle === 'diagonal') ctx.rotate(Math.PI / 4);
          if (layStyle === 'herringbone') ctx.rotate(Math.PI / 6);

          // Perspective scaling
          ctx.scale(0.38, surfaceType === 'FLOOR' ? 0.24 : 0.38);
          ctx.translate(-centerX, -centerY);

          ctx.fillStyle = pattern;
          ctx.fillRect(-w * 2, -h * 2, w * 5, h * 5);
          ctx.restore();
        }
      } else {
        ctx.fillStyle = 'rgba(212, 175, 55, 0.45)';
        ctx.fillRect(0, 0, w, h);
      }

      // Joint Grout Lines inside polygon
      ctx.strokeStyle = groutColor || '#d4af37';
      ctx.lineWidth = 1.8;
      ctx.globalAlpha = 0.65;

      const cols = Math.max(3, Math.round(roomWidth * 2.2));
      const rows = Math.max(3, Math.round(roomHeight * 2.2));

      for (let i = 1; i < cols; i++) {
        const t = i / cols;
        const botX = p0.x + (p1.x - p0.x) * t;
        const botY = p0.y + (p1.y - p0.y) * t;
        const topX = p3.x + (p2.x - p3.x) * t;
        const topY = p3.y + (p2.y - p3.y) * t;
        ctx.beginPath();
        ctx.moveTo(botX, botY);
        ctx.lineTo(topX, topY);
        ctx.stroke();
      }

      for (let j = 1; j < rows; j++) {
        const t = j / rows;
        const leftX = p0.x + (p3.x - p0.x) * t;
        const leftY = p0.y + (p3.y - p0.y) * t;
        const rightX = p1.x + (p2.x - p1.x) * t;
        const rightY = p1.y + (p2.y - p1.y) * t;
        ctx.beginPath();
        ctx.moveTo(leftX, leftY);
        ctx.lineTo(rightX, rightY);
        ctx.stroke();
      }
      ctx.restore();

      // -------------------------------------------------------------
      // 2. GLOWING LASER BOUNDARY LINES
      // -------------------------------------------------------------
      ctx.save();
      ctx.strokeStyle = '#10b981'; // Neon emerald laser
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = isMobile ? 8 : 12;
      ctx.lineWidth = isMobile ? 2.5 : 3.5;
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();

      // -------------------------------------------------------------
      // 3. LIVE DIMENSION MEASUREMENT BADGES ON EDGES
      // -------------------------------------------------------------
      ctx.save();
      ctx.font = `bold ${isMobile ? '12px' : '14px'} Outfit, system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Width Badge on Bottom Edge (P0 -> P1)
      const midBotX = (p0.x + p1.x) / 2;
      const midBotY = (p0.y + p1.y) / 2 + (isMobile ? 22 : 28);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(midBotX - (isMobile ? 55 : 65), midBotY - 14, isMobile ? 110 : 130, 28, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.fillText(`↔ En: ${roomWidth} m`, midBotX, midBotY);

      // Height Badge on Left Edge (P0 -> P3)
      const midLeftX = (p0.x + p3.x) / 2 - (isMobile ? 55 : 65);
      const midLeftY = (p0.y + p3.y) / 2;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
      ctx.strokeStyle = '#10b981';
      ctx.beginPath();
      ctx.roundRect(midLeftX - (isMobile ? 50 : 60), midLeftY - 14, isMobile ? 100 : 120, 28, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.fillText(`↕ Boy: ${roomHeight} m`, midLeftX, midLeftY);

      // Center Floating Live Net Area & Cost Pill
      const centerPolyX = (p0.x + p1.x + p2.x + p3.x) / 4;
      const centerPolyY = (p0.y + p1.y + p2.y + p3.y) / 4;
      const badgeW = isMobile ? 220 : 260;
      const badgeH = isMobile ? 50 : 56;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(centerPolyX - badgeW / 2, centerPolyY - badgeH / 2, badgeW, badgeH, 12);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#d4af37';
      ctx.font = `900 ${isMobile ? '13px' : '15px'} Outfit, sans-serif`;
      ctx.fillText(`Net: ${netAreaM2} m² (${boxCount} Kutu)`, centerPolyX, centerPolyY - 8);

      ctx.fillStyle = '#34d399';
      ctx.font = `800 ${isMobile ? '11px' : '12px'} Outfit, sans-serif`;
      ctx.fillText(`Tahmini: ~${totalEstMaterialCost.toLocaleString('tr-TR')} ₺`, centerPolyX, centerPolyY + 12);
      ctx.restore();

      // -------------------------------------------------------------
      // 4. INTERACTIVE DRAGGABLE CORNER PIN HANDLES
      // -------------------------------------------------------------
      const pinCoords = [p0, p1, p2, p3];
      pinCoords.forEach((p, idx) => {
        const isSelected = activePinIndex === idx;

        ctx.save();
        // Outer pulsing ring
        ctx.strokeStyle = isSelected ? '#10b981' : '#ffffff';
        ctx.lineWidth = isSelected ? 3 : 2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, isMobile ? 14 : 18, 0, Math.PI * 2);
        ctx.stroke();

        // Inner solid disc
        ctx.fillStyle = isSelected ? '#10b981' : '#d4af37';
        ctx.beginPath();
        ctx.arc(p.x, p.y, isMobile ? 8 : 10, 0, Math.PI * 2);
        ctx.fill();

        // Crosshair center
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(p.x - 4, p.y); ctx.lineTo(p.x + 4, p.y);
        ctx.moveTo(p.x, p.y - 4); ctx.lineTo(p.x, p.y + 4);
        ctx.stroke();

        // Pin Label (e.g. 1. Sol Alt)
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        const labelText = corners[idx]?.label || `P${idx + 1}`;
        const lblW = isMobile ? 70 : 80;
        ctx.roundRect(p.x - lblW / 2, p.y - (isMobile ? 32 : 36), lblW, 18, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${isMobile ? '9px' : '10px'} Outfit, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(labelText, p.x, p.y - (isMobile ? 23 : 27));

        ctx.restore();
      });

      animId = requestAnimationFrame(renderARScanner);
    };

    renderARScanner();
    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [
    isOpen,
    corners,
    roomWidth,
    roomHeight,
    netAreaM2,
    boxCount,
    totalEstMaterialCost,
    userPhotoBg,
    capturedSnapshot,
    activeTileTexture,
    layStyle,
    groutColor,
    surfaceType,
    stream,
    isMobile,
    activePinIndex
  ]);

  // Cutout Subtractions Handlers
  const addCutout = (type) => {
    const defaults = {
      'Kapı': { w: 0.9, h: 2.0 },
      'Pencere': { w: 1.2, h: 1.2 },
      'Duşakabin': { w: 1.0, h: 2.0 },
      'Mutfak Tezgahı': { w: 2.5, h: 0.6 }
    };
    const size = defaults[type] || { w: 1.0, h: 1.0 };
    setCutouts([...cutouts, { id: Date.now(), type, w: size.w, h: size.h }]);
  };

  const removeCutout = (id) => {
    setCutouts(cutouts.filter((c) => c.id !== id));
  };

  // Submit Lead API
  const handleSaveLead = async () => {
    if (!clientName || !clientPhone) {
      alert('Lütfen Ad Soyad ve Telefon numaranızı giriniz.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/ar/scan-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct?.id || 'demo-product-id',
          dealerId: currentDealer?.id || null,
          clientName,
          clientPhone,
          clientEmail: '',
          surfaceType,
          grossAreaM2,
          cutoutAreaM2,
          netAreaM2,
          boxCount,
          adhesiveBags,
          groutKg,
          notes: clientNotes
        })
      });

      const data = await res.json();
      if (data.success) {
        setSubmitSuccess(true);
      } else {
        alert(data.error || 'Teklif kaydı oluşturulamadı.');
      }
    } catch (err) {
      alert('Bağlantı hatası: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // WhatsApp Link Builder
  const getWhatsAppShareUrl = () => {
    const dealerPhone = currentDealer?.phone?.replace(/\D/g, '') || '905555555555';
    const text = encodeURIComponent(
      `Selamlar, SeramikBak AR Lazer Mezura ile odamın net metrajını çıkardım:\n\n` +
      `📦 *Ürün:* ${selectedProduct?.name || 'Seramik Karo'} (${selectedProduct?.width || 60}x${selectedProduct?.height || 120} cm)\n` +
      `📐 *Yüzey:* ${surfaceType === 'WALL' ? 'Duvar Kaplama' : 'Zemin Kaplama'}\n` +
      `📏 *Ölçüler:* En ${roomWidth}m x Boy ${roomHeight}m\n` +
      `📊 *Metraj:* Brüt ${grossAreaM2}m² | Düşülen Boşluk ${cutoutAreaM2}m² | *Net ${netAreaM2}m²*\n` +
      `📦 *Gerekli Kutu:* ${boxCount} Kutu (%10 fire payı dahil)\n` +
      `🧱 *Sarf Malzemesi:* ${adhesiveBags} Çuval Kalekim Yapıştırıcı + ${groutKg}kg Derz Dolgusu\n` +
      `💰 *Tahmini Malzeme Tutarı:* ${totalEstMaterialCost.toLocaleString('tr-TR')} ₺\n` +
      `🔨 *Tahmini Toplam (İşçilik Dahil):* ${totalEstRenovationCost.toLocaleString('tr-TR')} ₺\n\n` +
      `Müşteri: ${clientName || 'İsimsiz Müşteri'} (${clientPhone || 'Telefon belirtilmedi'})\n` +
      `Bu metraja göre malzeme temini ve teklif almak istiyorum.`
    );
    return `https://wa.me/${dealerPhone}?text=${text}`;
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 99999,
      background: '#090d16',
      display: 'flex',
      flexDirection: 'column',
      color: '#ffffff',
      fontFamily: 'Outfit, system-ui, -apple-system, sans-serif',
      height: '100dvh',
      width: '100vw',
      overflow: 'hidden'
    }}>
      {/* Top Header Navigation Bar */}
      <div style={{
        padding: isMobile ? '8px 12px' : '12px 20px',
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'stretch' : 'center',
        justifyContent: 'space-between',
        gap: isMobile ? '8px' : '12px',
        zIndex: 30,
        boxSizing: 'border-box'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#fff',
              padding: '4px 10px',
              borderRadius: '8px',
              fontWeight: '900',
              fontSize: isMobile ? '0.75rem' : '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <Sparkles size={14} />
              <span>AR Lazer Mezura</span>
            </div>
            <div>
              <h3 style={{
                margin: 0,
                fontSize: isMobile ? '0.85rem' : '0.95rem',
                fontWeight: '800',
                color: '#fff',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: isMobile ? '180px' : '320px'
              }}>
                {selectedProduct?.name || 'Canlı Kamera ile Oda Ölçümü'}
              </h3>
            </div>
          </div>

          <button
            onClick={handleClose}
            aria-label="Kapat"
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              color: '#fff',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'flex',
          background: 'rgba(255,255,255,0.06)',
          padding: '3px',
          borderRadius: '10px',
          gap: '4px',
          width: '100%',
          maxWidth: isMobile ? '100%' : '440px'
        }}>
          <button
            onClick={() => setActiveTab('SCANNER')}
            style={{
              flex: 1,
              padding: '7px 4px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'SCANNER' ? '#10b981' : 'transparent',
              color: activeTab === 'SCANNER' ? '#fff' : '#cbd5e1',
              fontWeight: '800',
              fontSize: isMobile ? '0.72rem' : '0.78rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              textAlign: 'center'
            }}
          >
            📷 AR Lazer Mezura
          </button>
          <button
            onClick={() => setActiveTab('CALCULATOR')}
            style={{
              flex: 1,
              padding: '7px 4px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'CALCULATOR' ? '#d4af37' : 'transparent',
              color: activeTab === 'CALCULATOR' ? '#000' : '#cbd5e1',
              fontWeight: '800',
              fontSize: isMobile ? '0.72rem' : '0.78rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              textAlign: 'center'
            }}
          >
            📐 Metraj ({netAreaM2}m²)
          </button>
          <button
            onClick={() => setActiveTab('QUOTE')}
            style={{
              flex: 1,
              padding: '7px 4px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'QUOTE' ? '#25D366' : 'transparent',
              color: activeTab === 'QUOTE' ? '#000' : '#cbd5e1',
              fontWeight: '800',
              fontSize: isMobile ? '0.72rem' : '0.78rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              textAlign: 'center'
            }}
          >
            📄 Teklif Al
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        
        {/* ================================================================= */}
        {/* TAB 1: AR CAMERA & LAZER MEZURA                                   */}
        {/* ================================================================= */}
        <div style={{
          flex: 1,
          position: 'relative',
          display: activeTab === 'SCANNER' ? 'flex' : 'none',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}>
          {/* Hidden HTML5 Video Stream */}
          <video ref={videoRef} playsInline muted autoPlay style={{ display: 'none' }} />

          {/* Hidden File Input for Native Camera Photo Upload */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            capture="environment"
            onChange={handleNativePhotoUpload}
            style={{ display: 'none' }}
          />

          {/* Interactive Canvas */}
          <canvas
            ref={canvasRef}
            onPointerDown={handleCanvasPointerDown}
            onPointerMove={handleCanvasPointerMove}
            onPointerUp={handleCanvasPointerUp}
            onPointerCancel={handleCanvasPointerUp}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              touchAction: 'none',
              cursor: activePinIndex !== null ? 'grabbing' : measureMode === 'TAP' ? 'crosshair' : 'grab'
            }}
          />

          {/* Floating Top Banner: Interactive Instructions & Mode Toggle */}
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 25,
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            justifyContent: 'center',
            width: 'calc(100% - 24px)',
            maxWidth: '520px'
          }}>
            {/* Tap-To-Measure vs Free-Drag Toggle */}
            <button
              onClick={() => {
                if (measureMode === 'DRAG') {
                  setMeasureMode('TAP');
                  setTapStep(0);
                } else {
                  setMeasureMode('DRAG');
                }
              }}
              style={{
                background: measureMode === 'TAP' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'rgba(15, 23, 42, 0.9)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                padding: '6px 14px',
                borderRadius: '20px',
                fontWeight: '800',
                fontSize: '0.75rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 14px rgba(0,0,0,0.5)'
              }}
            >
              <Target size={15} />
              <span>
                {measureMode === 'TAP' && tapStep === 0 && '🎯 1. Sol Alt Köşeye Dokunun'}
                {measureMode === 'TAP' && tapStep === 1 && `🎯 2. Sağ Alt Köşeye Dokunun (${roomWidth}m)`}
                {measureMode === 'TAP' && tapStep === 2 && `🎯 3. Tavan / Üste Dokunun (${roomHeight}m)`}
                {measureMode === 'TAP' && tapStep === 3 && '✅ Ölçüm Bitti (Pinleri Kaydırın)'}
                {measureMode === 'DRAG' && '📌 Pinleri Sürükle (Lazer Ölçüm)'}
              </span>
            </button>

            {/* Freeze Frame / Take Photo Button */}
            {!capturedSnapshot ? (
              <button
                onClick={handleTakeSnapshot}
                style={{
                  background: 'linear-gradient(135deg, #d4af37 0%, #b38e47 100%)',
                  color: '#000',
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontWeight: '900',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.4)'
                }}
              >
                <Camera size={15} />
                <span>📸 Fotoğraf Çek & Odana Döşe</span>
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => setCapturedSnapshot(null)}
                  style={{
                    background: 'rgba(239, 68, 68, 0.9)',
                    color: '#fff',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontWeight: '800',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <RefreshCw size={14} />
                  <span>Canlı Kameraya Dön</span>
                </button>
                <a
                  href={capturedSnapshot}
                  download={`seramikbak-olcum-${Date.now()}.png`}
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#fff',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontWeight: '800',
                    fontSize: '0.75rem',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Download size={14} />
                  <span>İndir</span>
                </a>
              </div>
            )}
          </div>

          {/* Camera Permission / Fallback Information Banner */}
          {cameraError && !userPhotoBg && (
            <div style={{
              position: 'absolute',
              top: '64px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 25,
              width: 'calc(100% - 24px)',
              maxWidth: '420px',
              background: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgba(239, 68, 68, 0.5)',
              backdropFilter: 'blur(12px)',
              borderRadius: '14px',
              padding: '12px 14px',
              textAlign: 'center',
              boxShadow: '0 8px 24px rgba(0,0,0,0.6)'
            }}>
              <div style={{ fontSize: '0.78rem', color: '#fca5a5', fontWeight: '700', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <AlertCircle size={16} />
                <span>{cameraError}</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <button
                  onClick={startCamera}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#fff',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.72rem',
                    fontWeight: '800',
                    cursor: 'pointer'
                  }}
                >
                  🔄 Canlı Kamerayı Yeniden Dene
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    background: 'linear-gradient(135deg, #d4af37 0%, #b38e47 100%)',
                    border: 'none',
                    color: '#000',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.72rem',
                    fontWeight: '900',
                    cursor: 'pointer'
                  }}
                >
                  🖼️ Fotoğraf Yükle
                </button>
              </div>
            </div>
          )}

          {/* Floating Controls Panel (Draggable & Collapsible) */}
          <div style={{
            position: 'absolute',
            bottom: isMobile ? '10px' : '18px',
            left: isMobile ? '10px' : '18px',
            right: isMobile ? '10px' : 'auto',
            background: 'rgba(15, 23, 42, 0.94)',
            backdropFilter: 'blur(14px)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            borderRadius: '16px',
            padding: isMobile ? '10px 12px' : '14px 16px',
            width: isMobile ? 'auto' : '310px',
            zIndex: 20,
            boxShadow: '0 12px 32px rgba(0,0,0,0.6)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showMobilePanel ? '8px' : '0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '900', color: '#10b981' }}>📐 LAZER MEZURA</span>
                <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>({roomWidth}m x {roomHeight}m)</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {/* Surface Toggle */}
                <div style={{ display: 'flex', gap: '3px' }}>
                  <button
                    onClick={() => setSurfaceType('WALL')}
                    style={{
                      padding: '3px 7px',
                      borderRadius: '6px',
                      fontSize: '0.68rem',
                      fontWeight: '800',
                      border: 'none',
                      background: surfaceType === 'WALL' ? '#10b981' : 'rgba(255,255,255,0.08)',
                      color: surfaceType === 'WALL' ? '#fff' : '#cbd5e1',
                      cursor: 'pointer'
                    }}
                  >
                    Duvar
                  </button>
                  <button
                    onClick={() => setSurfaceType('FLOOR')}
                    style={{
                      padding: '3px 7px',
                      borderRadius: '6px',
                      fontSize: '0.68rem',
                      fontWeight: '800',
                      border: 'none',
                      background: surfaceType === 'FLOOR' ? '#10b981' : 'rgba(255,255,255,0.08)',
                      color: surfaceType === 'FLOOR' ? '#fff' : '#cbd5e1',
                      cursor: 'pointer'
                    }}
                  >
                    Zemin
                  </button>
                </div>

                {isMobile && (
                  <button
                    onClick={() => setShowMobilePanel(!showMobilePanel)}
                    style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '2px' }}
                  >
                    {showMobilePanel ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                  </button>
                )}
              </div>
            </div>

            {showMobilePanel && (
              <>
                {/* 1-Tap Quick Room Presets */}
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: '800', marginBottom: '4px' }}>
                    HIZLI ODA ŞABLONLARI:
                  </div>
                  <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '3px' }}>
                    <button
                      onClick={() => applyRoomPreset(1.8, 2.2)}
                      style={{
                        padding: '3px 6px',
                        borderRadius: '6px',
                        border: '1px solid rgba(16,185,129,0.3)',
                        background: roomWidth === 1.8 && roomHeight === 2.2 ? '#10b981' : 'rgba(255,255,255,0.06)',
                        color: roomWidth === 1.8 && roomHeight === 2.2 ? '#fff' : '#cbd5e1',
                        fontSize: '0.65rem',
                        fontWeight: '800',
                        whiteSpace: 'nowrap',
                        cursor: 'pointer'
                      }}
                    >
                      🚿 Küçük (4m²)
                    </button>
                    <button
                      onClick={() => applyRoomPreset(2.4, 2.6)}
                      style={{
                        padding: '3px 6px',
                        borderRadius: '6px',
                        border: '1px solid rgba(16,185,129,0.3)',
                        background: roomWidth === 2.4 && roomHeight === 2.6 ? '#10b981' : 'rgba(255,255,255,0.06)',
                        color: roomWidth === 2.4 && roomHeight === 2.6 ? '#fff' : '#cbd5e1',
                        fontSize: '0.65rem',
                        fontWeight: '800',
                        whiteSpace: 'nowrap',
                        cursor: 'pointer'
                      }}
                    >
                      🛁 Banyo (6.2m²)
                    </button>
                    <button
                      onClick={() => applyRoomPreset(3.2, 2.8)}
                      style={{
                        padding: '3px 6px',
                        borderRadius: '6px',
                        border: '1px solid rgba(16,185,129,0.3)',
                        background: roomWidth === 3.2 && roomHeight === 2.8 ? '#10b981' : 'rgba(255,255,255,0.06)',
                        color: roomWidth === 3.2 && roomHeight === 2.8 ? '#fff' : '#cbd5e1',
                        fontSize: '0.65rem',
                        fontWeight: '800',
                        whiteSpace: 'nowrap',
                        cursor: 'pointer'
                      }}
                    >
                      👑 Ebeveyn (9m²)
                    </button>
                    <button
                      onClick={() => applyRoomPreset(3.0, 0.6)}
                      style={{
                        padding: '3px 6px',
                        borderRadius: '6px',
                        border: '1px solid rgba(16,185,129,0.3)',
                        background: roomWidth === 3.0 && roomHeight === 0.6 ? '#10b981' : 'rgba(255,255,255,0.06)',
                        color: roomWidth === 3.0 && roomHeight === 0.6 ? '#fff' : '#cbd5e1',
                        fontSize: '0.65rem',
                        fontWeight: '800',
                        whiteSpace: 'nowrap',
                        cursor: 'pointer'
                      }}
                    >
                      🍳 Tezgah (1.8m²)
                    </button>
                  </div>
                </div>

                {/* Width (En) Slider */}
                <div style={{ marginBottom: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#cbd5e1', marginBottom: '2px' }}>
                    <span>Genişlik (En):</span>
                    <strong style={{ color: '#10b981' }}>{roomWidth} Metre</strong>
                  </div>
                  <input
                    type="range"
                    min="0.8"
                    max="12.0"
                    step="0.1"
                    value={roomWidth}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setRoomWidth(val);
                      updateCornersFromDimensions(val, roomHeight);
                    }}
                    style={{ width: '100%', accentColor: '#10b981', height: '5px' }}
                  />
                </div>

                {/* Height (Boy) Slider */}
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#cbd5e1', marginBottom: '2px' }}>
                    <span>Yükseklik (Boy):</span>
                    <strong style={{ color: '#10b981' }}>{roomHeight} Metre</strong>
                  </div>
                  <input
                    type="range"
                    min="0.8"
                    max="10.0"
                    step="0.1"
                    value={roomHeight}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setRoomHeight(val);
                      updateCornersFromDimensions(roomWidth, val);
                    }}
                    style={{ width: '100%', accentColor: '#10b981', height: '5px' }}
                  />
                </div>

                {/* Laying Style Select */}
                <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                  {[
                    { id: 'straight', label: 'Düz Döşe' },
                    { id: 'diagonal', label: 'Çapraz' },
                    { id: 'herringbone', label: 'Balıksırtı' }
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setLayStyle(s.id)}
                      style={{
                        flex: 1,
                        padding: '4px 6px',
                        borderRadius: '6px',
                        border: 'none',
                        background: layStyle === s.id ? '#d4af37' : 'rgba(255,255,255,0.08)',
                        color: layStyle === s.id ? '#000' : '#cbd5e1',
                        fontWeight: '800',
                        fontSize: '0.68rem',
                        cursor: 'pointer'
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                {/* Quick Action Button: Go to Metraj */}
                <button
                  onClick={() => setActiveTab('CALCULATOR')}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#fff',
                    border: 'none',
                    padding: '8px',
                    borderRadius: '8px',
                    fontWeight: '900',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Calculator size={15} />
                  <span>Kapı/Pencere Düş & Malzeme Listesini Gör</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* ================================================================= */}
        {/* TAB 2: VATANDAŞ İÇİN NET METRAJ & MALZEME HESABI                  */}
        {/* ================================================================= */}
        <div style={{
          flex: 1,
          display: activeTab === 'CALCULATOR' ? 'flex' : 'none',
          flexDirection: isMobile ? 'column' : 'row',
          padding: isMobile ? '12px' : '24px',
          overflowY: 'auto',
          gap: isMobile ? '14px' : '24px',
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          {/* Left Column: Dimensions & Cutout Subtractions */}
          <div style={{ flex: 1.2, display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{
              background: 'rgba(30, 41, 59, 0.7)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px',
              padding: isMobile ? '14px' : '20px'
            }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Maximize2 size={16} />
                <span>Kamera ile Ölçülen Alan</span>
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Genişlik En (m)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={roomWidth}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setRoomWidth(val);
                      updateCornersFromDimensions(val, roomHeight);
                    }}
                    style={{
                      width: '100%',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '0.95rem',
                      fontWeight: '700',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Yükseklik Boy (m)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={roomHeight}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setRoomHeight(val);
                      updateCornersFromDimensions(roomWidth, val);
                    }}
                    style={{
                      width: '100%',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '0.95rem',
                      fontWeight: '700',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>
              <div style={{ marginTop: '10px', fontSize: '0.82rem', color: '#cbd5e1' }}>
                Brüt Ölçülen Alan: <strong style={{ color: '#fff' }}>{grossAreaM2} m²</strong>
              </div>
            </div>

            {/* Cutout Subtractions Card (Kapı, Pencere, vb.) */}
            <div style={{
              background: 'rgba(30, 41, 59, 0.7)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px',
              padding: isMobile ? '14px' : '20px'
            }}>
              <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'flex-start' : 'center',
                gap: '8px',
                marginBottom: '12px'
              }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#f87171', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Layers size={16} />
                    <span>Düşülecek Boşluklar (Net Metraj İçin)</span>
                  </h4>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Kapı, pencere veya dolap alanlarını seramikten düşün</span>
                </div>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => addCutout('Kapı')}
                    style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '5px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '700', cursor: 'pointer' }}
                  >
                    + 🚪 Kapı
                  </button>
                  <button
                    onClick={() => addCutout('Pencere')}
                    style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '5px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '700', cursor: 'pointer' }}
                  >
                    + 🪟 Pencere
                  </button>
                  <button
                    onClick={() => addCutout('Duşakabin')}
                    style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '5px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '700', cursor: 'pointer' }}
                  >
                    + 🚿 Duşakabin
                  </button>
                </div>
              </div>

              {cutouts.length === 0 ? (
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic', margin: '4px 0' }}>
                  Henüz düşülen boşluk yok. Yukarıdaki butonlarla kapı veya pencere ekleyebilirsiniz.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {cutouts.map((item) => (
                    <div key={item.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'rgba(15, 23, 42, 0.6)',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.06)'
                    }}>
                      <span style={{ fontWeight: '700', fontSize: '0.82rem', color: '#fff' }}>{item.type}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <input
                          type="number"
                          step="0.1"
                          value={item.w}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setCutouts(cutouts.map((c) => c.id === item.id ? { ...c, w: val } : c));
                          }}
                          style={{ width: '52px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.2)', padding: '4px 6px', borderRadius: '6px', color: '#fff', fontSize: '0.8rem' }}
                        />
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>m x</span>
                        <input
                          type="number"
                          step="0.1"
                          value={item.h}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setCutouts(cutouts.map((c) => c.id === item.id ? { ...c, h: val } : c));
                          }}
                          style={{ width: '52px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.2)', padding: '4px 6px', borderRadius: '6px', color: '#fff', fontSize: '0.8rem' }}
                        />
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>m =</span>
                        <strong style={{ color: '#f87171', fontSize: '0.82rem' }}>{(item.w * item.h).toFixed(2)} m²</strong>
                      </div>
                      <button
                        onClick={() => removeCutout(item.id)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Citizen Material & Cost Summary */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(30, 41, 59, 0.9) 100%)',
              border: '1px solid #10b981',
              borderRadius: '16px',
              padding: isMobile ? '16px' : '22px'
            }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '1.05rem', color: '#10b981', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={20} />
                <span>Vatandaş Malzeme & Maliyet Özeti</span>
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', fontSize: '0.84rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <span style={{ color: '#cbd5e1' }}>Brüt Alan:</span>
                  <strong style={{ color: '#fff' }}>{grossAreaM2} m²</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <span style={{ color: '#f87171' }}>Düşülen Boşluklar:</span>
                  <strong style={{ color: '#f87171' }}>- {cutoutAreaM2} m²</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <span style={{ color: '#10b981', fontWeight: '800' }}>Net Kaplama Alanı:</span>
                  <strong style={{ color: '#10b981', fontSize: '1.1rem' }}>{netAreaM2} m²</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <span style={{ color: '#cbd5e1' }}>Gerekli Seramik (+%10 Fire Paylı):</span>
                  <strong style={{ color: '#d4af37' }}>{netWithWasteM2} m² ({boxCount} Kutu)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <span style={{ color: '#cbd5e1' }}>Yapıştırıcı (25kg Kalekim Çuval):</span>
                  <strong style={{ color: '#fff' }}>{adhesiveBags} Çuval</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <span style={{ color: '#cbd5e1' }}>Derz Dolgusu:</span>
                  <strong style={{ color: '#fff' }}>{groutKg} kg</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <span style={{ color: '#cbd5e1' }}>Tahmini Usta İşçiliği (~350 TL/m²):</span>
                  <strong style={{ color: '#94a3b8' }}>~{estLaborCost.toLocaleString('tr-TR')} ₺</strong>
                </div>

                <div style={{
                  marginTop: '8px',
                  padding: '12px',
                  background: 'rgba(15, 23, 42, 0.85)',
                  borderRadius: '10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block' }}>Tahmini Toplam Malzeme</span>
                    <strong style={{ fontSize: '1.2rem', color: '#10b981', fontWeight: '900' }}>
                      {totalEstMaterialCost.toLocaleString('tr-TR')} ₺
                    </strong>
                  </div>
                  <button
                    onClick={() => setActiveTab('QUOTE')}
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: '#fff',
                      border: 'none',
                      padding: '10px 16px',
                      borderRadius: '10px',
                      fontWeight: '800',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span>Teklif Al</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* TAB 3: WHATSAPP PAYLAŞIMI & BAYİ TEKLİFİ                          */}
        {/* ================================================================= */}
        <div style={{
          flex: 1,
          display: activeTab === 'QUOTE' ? 'flex' : 'none',
          padding: isMobile ? '14px' : '28px',
          alignItems: 'center',
          justifyContent: 'center',
          overflowY: 'auto'
        }}>
          <div style={{
            background: 'rgba(30, 41, 59, 0.95)',
            border: '1px solid #10b981',
            borderRadius: '20px',
            padding: isMobile ? '18px' : '28px',
            maxWidth: '540px',
            width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)'
          }}>
            {!submitSuccess ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                  <Store size={26} style={{ color: '#10b981' }} />
                  <div>
                    <h3 style={{ margin: 0, fontSize: isMobile ? '1.1rem' : '1.25rem', color: '#fff', fontWeight: '900' }}>
                      Ustaya / Bayiye Tek Tıkla Gönder
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                      {currentDealer?.name ? `${currentDealer.name} Bayisine Özel Teklif` : 'En Yakın Yetkili Bayi ile Eşleştirilir'}
                    </span>
                  </div>
                </div>

                <div style={{
                  background: 'rgba(15, 23, 42, 0.7)',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  fontSize: '0.78rem',
                  marginBottom: '14px',
                  border: '1px solid rgba(255,255,255,0.08)'
                }}>
                  <div style={{ color: '#10b981', fontWeight: '800', marginBottom: '4px' }}>Gönderilecek Ölçüm Özeti:</div>
                  <div style={{ color: '#fff' }}>• Ürün: {selectedProduct?.name || 'Seramik Karo'}</div>
                  <div style={{ color: '#fff' }}>• Net Metraj: {netAreaM2} m² (+%10 fire dahil {netWithWasteM2} m²)</div>
                  <div style={{ color: '#fff' }}>• Kutu: {boxCount} Kutu | Yapıştırıcı: {adhesiveBags} Çuval | Derz: {groutKg} kg</div>
                  <div style={{ color: '#34d399', fontWeight: '800', marginTop: '2px' }}>• Yaklaşık Malzeme: ~{totalEstMaterialCost.toLocaleString('tr-TR')} ₺</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#cbd5e1', display: 'block', marginBottom: '3px' }}>Adınız Soyadınız *</label>
                    <input
                      type="text"
                      placeholder="Örn: Ahmet Yılmaz"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      style={{
                        width: '100%',
                        background: '#0f172a',
                        border: '1px solid rgba(255,255,255,0.2)',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '0.9rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#cbd5e1', display: 'block', marginBottom: '3px' }}>Telefon Numaranız *</label>
                    <input
                      type="tel"
                      placeholder="Örn: 0532 123 45 67"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      style={{
                        width: '100%',
                        background: '#0f172a',
                        border: '1px solid rgba(255,255,255,0.2)',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '0.9rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#cbd5e1', display: 'block', marginBottom: '3px' }}>Özel Notunuz / Adresiniz</label>
                    <textarea
                      rows="2"
                      placeholder="Örn: Kadıköy'deki dairem için usta montaj dahil teklif istiyorum..."
                      value={clientNotes}
                      onChange={(e) => setClientNotes(e.target.value)}
                      style={{
                        width: '100%',
                        background: '#0f172a',
                        border: '1px solid rgba(255,255,255,0.2)',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '0.85rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <a
                    href={getWhatsAppShareUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleSaveLead}
                    style={{
                      background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                      color: '#fff',
                      padding: '12px',
                      borderRadius: '12px',
                      fontWeight: '900',
                      fontSize: '0.92rem',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 6px 20px rgba(37,211,102,0.4)'
                    }}
                  >
                    <MessageCircle size={18} />
                    <span>WhatsApp ile Ustaya / Bayiye Gönder</span>
                  </a>

                  <button
                    onClick={handleSaveLead}
                    disabled={isSubmitting}
                    style={{
                      background: 'rgba(16, 185, 129, 0.15)',
                      border: '1px solid #10b981',
                      color: '#10b981',
                      padding: '11px',
                      borderRadius: '12px',
                      fontWeight: '800',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <Send size={15} />
                    <span>{isSubmitting ? 'Kaydediliyor...' : 'Teklifi Sisteme Kaydet & Bayiye İlet'}</span>
                  </button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <CheckCircle2 size={48} style={{ color: '#10b981', margin: '0 auto 12px auto' }} />
                <h3 style={{ margin: '0 0 6px 0', fontSize: '1.2rem', color: '#fff' }}>Ölçüm Talebiniz Alındı!</h3>
                <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.5', marginBottom: '20px' }}>
                  {netAreaM2} m² net kaplama alanınız ve malzeme listesi bayimize iletildi. En kısa sürede sizinle iletişime geçilecektir.
                </p>
                <button
                  onClick={handleClose}
                  style={{
                    background: '#10b981',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 24px',
                    borderRadius: '10px',
                    fontWeight: '900',
                    cursor: 'pointer'
                  }}
                >
                  Kapat
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
