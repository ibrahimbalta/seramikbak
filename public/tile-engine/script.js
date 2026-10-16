/**
 * Tile Detection and Visualization Engine
 * Core Interactive Client Engine & High-Fidelity 3D Perspective Tile Renderer
 * Inspired directly by Tile-Detection-and-Visualization-Engine-main
 */

(function () {
    'use strict';

    // DOM Elements
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    // Sidebar
    const surfFloorBtn    = $('#surf-floor-btn');
    const surfWallBtn     = $('#surf-wall-btn');
    const surfBothBtn     = $('#surf-both-btn');
    const patternSelect   = $('#pattern-select');
    const tileWSlider     = $('#tile-w-slider');
    const tileHSlider     = $('#tile-h-slider');
    const tileWNum        = $('#tile-w-num');
    const tileHNum        = $('#tile-h-num');
    const tileSizeVal     = $('#tile-size-val');
    const groutSlider     = $('#grout-slider');
    const groutVal        = $('#grout-val');
    const deviceSelect    = $('#device-select');
    const resetSettingsBtn = $('#reset-settings-btn');
    const applySettingsBtn = $('#apply-settings-btn');

    // Step 1: Tile
    const tileImgPreview  = $('#tile-img-preview');
    const tileFileInput   = $('#tile-file-input');
    const browseTileBtn   = $('#browse-tile-btn');
    const tileFileName    = $('#tile-file-name');
    const tileDims        = $('#tile-dims');
    const tileDetailsNote = $('#tile-details-note');

    // Step 2: Room
    const roomImgPreview  = $('#room-img-preview');
    const roomFileInput   = $('#room-file-input');
    const browseRoomBtn   = $('#browse-room-btn');
    const analyzeRoomBtn  = $('#analyze-room-btn');
    const roomFileName    = $('#room-file-name');
    const roomDims        = $('#room-dims');
    const presetPills     = $$('.preset-pill');

    // Step 3: Masking
    const canvasViewport  = $('#canvas-viewport');
    const maskCanvas      = $('#mask-canvas');
    const brushCursor     = $('#brush-cursor');
    const brushSizeSlider = $('#brush-size-slider');
    const brushSizeDisplay= $('#brush-size-display');
    const zoomSlider      = $('#zoom-slider');
    const zoomDisplay     = $('#zoom-display');
    const opacitySlider   = $('#opacity-slider');
    const opacityDisplay  = $('#opacity-display');
    const maskUndoBtn     = $('#mask-undo-btn');
    const maskRedoBtn     = $('#mask-redo-btn');
    const maskClearBtn    = $('#mask-clear-btn');
    const generateBtn     = $('#generate-btn');

    // Layer View Buttons (QA & Inspection)
    const layerViewPills  = $$('.layer-pill');

    // Step 4: Result / Before-After
    const comparisonStage = $('#comparison-stage');
    const resultImg       = $('#result-img');
    const originalImg     = $('#original-img');
    const stageHandle     = $('#stage-handle');
    const downloadBtn     = $('#download-result-btn');
    const requestQuoteBtn = $('#request-quote-btn');

    // Overlay & Toast
    const loadingOverlay  = $('#loading-overlay');
    const loadingText     = $('#loading-text');
    const toast           = $('#toast');

    // State
    let activeSurface = 'floor'; // 'floor' | 'wall'
    let activeTileUrl = '/textures/calacatta_gold.jpg';
    let activeTileName = 'Calacatta Gold 60×120';
    let activeRoomUrl = '/hero/easy_bathroom.jpg';
    let activeRoomName = 'Modern Banyo';

    let tileImageEl = null;
    let roomImageEl = null;
    let roomFgImageEl = null;

    // Calibrated Room Geometries & Foreground Presets
    const ROOM_PRESETS = {
        'modern_living': {
            floorY: 0.52,
            ceilingY: 0.10,
            horizonY: 0.46,
            vanishingX: 0.50,
            vanishingY: 0.46,
            fgUrl: '/hero/modern_living_fg.png',
            isBathroom: false
        },
        'luxury_bathroom': {
            floorY: 0.835,
            ceilingY: 0.115,
            horizonY: 0.48,
            vanishingX: 0.50,
            vanishingY: 0.48,
            fgUrl: '/hero/luxury_bathroom_fg.png',
            isBathroom: true,
            layout: 'luxury'
        },
        'easy_kitchen': {
            floorY: 0.57,
            ceilingY: 0.15,
            horizonY: 0.46,
            vanishingX: 0.50,
            vanishingY: 0.46,
            fgUrl: '/hero/scandinavian_kitchen_fg.png',
            isBathroom: false
        },
        'scandinavian_kitchen': {
            floorY: 0.57,
            ceilingY: 0.15,
            horizonY: 0.46,
            vanishingX: 0.50,
            vanishingY: 0.46,
            fgUrl: '/hero/scandinavian_kitchen_fg.png',
            isBathroom: false
        },
        'easy_bathroom': {
            floorY: 0.72,
            ceilingY: 0.18,
            horizonY: 0.48,
            vanishingX: 0.50,
            vanishingY: 0.48,
            fgUrl: '/hero/easy_bathroom_fg.png',
            isBathroom: true,
            layout: 'easy'
        },
        'antrasit_gri_banyo': {
            floorY: 0.856,
            ceilingY: 0.176,
            horizonY: 0.48,
            vanishingX: 0.50,
            vanishingY: 0.48,
            fgUrl: null,
            isBathroom: true,
            layout: 'antrasit'
        }
    };

    function getRoomConfig(url, w, h, name = '') {
        const textToSearch = `${url || ''} ${name || ''}`.toLowerCase();
        for (const [key, conf] of Object.entries(ROOM_PRESETS)) {
            if (textToSearch.includes(key) || textToSearch.includes(key.replace(/_/g, ' '))) {
                return conf;
            }
        }
        const isPortrait = h > w;
        const isBathroom = Boolean(
            textToSearch.includes('bathroom') ||
            textToSearch.includes('banyo') ||
            textToSearch.includes('klozet') ||
            textToSearch.includes('toilet') ||
            textToSearch.includes('wc') ||
            textToSearch.includes('shower') ||
            textToSearch.includes('dus') ||
            textToSearch.includes('lavabo')
        );

        const isAntrasitLayout = isBathroom && (isPortrait || (w > 0 && h > 0 && Math.abs((w / h) - (475 / 625)) < 0.18));

        return {
            floorY: isAntrasitLayout ? 0.856 : (isBathroom ? (isPortrait ? 0.80 : 0.76) : (isPortrait ? 0.70 : 0.62)),
            ceilingY: isBathroom ? 0.16 : 0.16,
            horizonY: 0.48,
            vanishingX: 0.50,
            vanishingY: 0.48,
            fgUrl: null,
            isBathroom: isBathroom,
            layout: isAntrasitLayout ? 'antrasit' : (isBathroom ? 'general_bathroom' : 'general')
        };
    }

    let maskCtx = maskCanvas.getContext('2d');
    let maskHistory = [];
    let historyIndex = -1;

    let isDrawing = false;
    let lastPoint = null;

    let resultBlobUrl = null;

    // QA & Debug Layers (All 9 Layers)
    window.__debugLayers = window.__debugLayers || {};
    let currentLayerView = 'active'; // 'active' | 'wall' | 'floor' | 'protected' | 'overlay'
    let cachedMasks = {
        active: null,
        wall: null,
        floor: null,
        protected: null,
        overlay: null
    };

    // Toast feedback
    function showToast(msg, type = 'info', duration = 3000) {
        if (!toast) return;
        toast.textContent = msg;
        toast.className = `toast show ${type}`;
        setTimeout(() => {
            toast.className = 'toast';
        }, duration);
    }

    // Loading overlay
    function showLoading(msg = 'Yapay zekâ görselleştirme hazırlanıyor…') {
        if (loadingText) loadingText.textContent = msg;
        if (loadingOverlay) loadingOverlay.classList.add('active');
    }

    function hideLoading() {
        if (loadingOverlay) loadingOverlay.classList.remove('active');
    }

    // Helper: Image loader
    function loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = (e) => reject(new Error('Görsel yüklenemedi: ' + src));
            img.src = src;
        });
    }

    // Update Tile Size readouts
    function updateTileSizeDisplay() {
        const w = tileWSlider.value;
        const h = tileHSlider.value;
        tileWNum.textContent = `${w} cm`;
        tileHNum.textContent = `${h} cm`;
        tileSizeVal.textContent = `${w} cm × ${h} cm`;
        const tileCardTag = $('#tile-card-tag');
        if (tileCardTag) {
            tileCardTag.textContent = `${w}×${h} cm`;
        }
    }

    tileWSlider.addEventListener('input', updateTileSizeDisplay);
    tileHSlider.addEventListener('input', updateTileSizeDisplay);

    groutSlider.addEventListener('input', () => {
        groutVal.textContent = `${groutSlider.value} mm`;
    });

    brushSizeSlider.addEventListener('input', () => {
        brushSizeDisplay.textContent = `${brushSizeSlider.value}px`;
        updateBrushCursorSize();
    });

    zoomSlider.addEventListener('input', () => {
        zoomDisplay.textContent = `${zoomSlider.value}%`;
        const scale = zoomSlider.value / 100;
        maskCanvas.style.transform = `scale(${scale})`;
    });

    opacitySlider.addEventListener('input', () => {
        opacityDisplay.textContent = `${opacitySlider.value}%`;
        drawMaskViewport();
    });

    // Surface Switch
    function switchSurface(surf) {
        activeSurface = surf;
        surfFloorBtn.classList.toggle('active', surf === 'floor');
        surfWallBtn.classList.toggle('active', surf === 'wall');
        if (surfBothBtn) surfBothBtn.classList.toggle('active', surf === 'both');

        const qFloor = $('#quick-surf-floor');
        const qWall = $('#quick-surf-wall');
        const qBoth = $('#quick-surf-both');
        if (qFloor) qFloor.classList.toggle('active', surf === 'floor');
        if (qWall) qWall.classList.toggle('active', surf === 'wall');
        if (qBoth) qBoth.classList.toggle('active', surf === 'both');

        generateAutoMask();
        executeVisualization(true);
    }

    surfFloorBtn.addEventListener('click', () => switchSurface('floor'));
    surfWallBtn.addEventListener('click', () => switchSurface('wall'));
    if (surfBothBtn) {
        surfBothBtn.addEventListener('click', () => switchSurface('both'));
    }

    const qFloor = $('#quick-surf-floor');
    const qWall = $('#quick-surf-wall');
    const qBoth = $('#quick-surf-both');
    if (qFloor) qFloor.addEventListener('click', () => switchSurface('floor'));
    if (qWall) qWall.addEventListener('click', () => switchSurface('wall'));
    if (qBoth) qBoth.addEventListener('click', () => switchSurface('both'));

    patternSelect.addEventListener('change', () => {
        executeVisualization(true);
    });

    // Reset settings
    resetSettingsBtn.addEventListener('click', () => {
        surfFloorBtn.click();
        patternSelect.value = 'brick';
        tileWSlider.value = 60;
        tileHSlider.value = 120;
        groutSlider.value = 3;
        updateTileSizeDisplay();
        groutVal.textContent = '3 mm';
        showToast('Ayarlar varsayılana sıfırlandı.', 'info');
        executeVisualization(true);
    });

    applySettingsBtn.addEventListener('click', () => {
        executeVisualization(false);
    });

    // Preset Room Buttons
    presetPills.forEach((pill) => {
        pill.addEventListener('click', async () => {
            presetPills.forEach((p) => p.classList.remove('active'));
            pill.classList.add('active');
            const url = pill.dataset.preset;
            if (url) {
                await loadRoom(url, pill.textContent.trim());
                await executeVisualization(true);
            }
        });
    });

    // Browse Tile File
    browseTileBtn.addEventListener('click', () => tileFileInput.click());
    tileFileInput.addEventListener('change', async (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        await loadTile(url, file.name);
        await executeVisualization(false);
    });

    // Browse Room File
    browseRoomBtn.addEventListener('click', () => roomFileInput.click());
    roomFileInput.addEventListener('change', async (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        presetPills.forEach((p) => p.classList.remove('active'));
        const url = URL.createObjectURL(file);
        await loadRoom(url, file.name);
        await executeVisualization(false);
    });

    analyzeRoomBtn.addEventListener('click', async () => {
        showLoading('Yapay zekâ oda analizi ve yüzey tespiti yapılıyor…');
        setTimeout(async () => {
            generateAutoMask();
            hideLoading();
            showToast('Oda geometrisi ve zemin yüzeyi tespit edildi!', 'success');
            await executeVisualization(false);
        }, 350);
    });

    // Load Tile
    async function loadTile(url, name = 'Tile Texture') {
        try {
            activeTileUrl = url;
            activeTileName = name;
            tileImgPreview.src = url;
            tileFileName.textContent = name;
            tileDetailsNote.textContent = `Tile details: ${name}`;

            tileImageEl = await loadImage(url);
            tileDims.textContent = `${tileImageEl.naturalWidth}×${tileImageEl.naturalHeight}px`;
        } catch (err) {
            console.error('Tile load failed:', err);
        }
    }

    // Load Room
    async function loadRoom(url, name = 'Room Image') {
        try {
            activeRoomUrl = url;
            activeRoomName = name;
            roomImgPreview.src = url;
            originalImg.src = url;
            roomFileName.textContent = name;

            roomImageEl = await loadImage(url);
            roomDims.textContent = `${roomImageEl.naturalWidth}×${roomImageEl.naturalHeight}px`;

            const conf = getRoomConfig(url, roomImageEl.naturalWidth, roomImageEl.naturalHeight, name);
            if (conf.fgUrl) {
                try {
                    roomFgImageEl = await loadImage(conf.fgUrl);
                } catch (e) {
                    console.warn('FG layer not found, using algorithmic protection:', conf.fgUrl);
                    roomFgImageEl = null;
                }
            } else {
                roomFgImageEl = null;
            }

            setupMaskCanvas(roomImageEl.naturalWidth, roomImageEl.naturalHeight);
            generateAutoMask();
        } catch (err) {
            console.error('Room load failed:', err);
        }
    }

    // Setup Mask Canvas dimensions
    function setupMaskCanvas(w, h) {
        maskCanvas.width = w;
        maskCanvas.height = h;
        maskHistory = [];
        historyIndex = -1;
    }

    // Intelligent Mask Generation (Unified perspective plane, protecting furniture & fixtures without artificial holes)
    function generateAutoMask() {
        if (!roomImageEl) return;
        const w = maskCanvas.width;
        const h = maskCanvas.height;

        // Clear canvas
        maskCtx.clearRect(0, 0, w, h);

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = w;
        tempCanvas.height = h;
        const tCtx = tempCanvas.getContext('2d');
        tCtx.drawImage(roomImageEl, 0, 0, w, h);
        const rgbData = tCtx.getImageData(0, 0, w, h).data;

        // Foreground layer pixels if available (sofa, rug, table, chairs, shower glass, armatures, mirror, vanity)
        let fgData = null;
        if (roomFgImageEl) {
            const fgCanvas = document.createElement('canvas');
            fgCanvas.width = w;
            fgCanvas.height = h;
            const fgCtx = fgCanvas.getContext('2d');
            fgCtx.drawImage(roomFgImageEl, 0, 0, w, h);
            fgData = fgCtx.getImageData(0, 0, w, h).data;
        }

        const conf = getRoomConfig(activeRoomUrl, w, h, activeRoomName);
        const floorY = Math.round(h * conf.floorY);
        const ceilingY = Math.round(h * conf.ceilingY);
        const isPortrait = h > w;

        // Independent Mask Buffers (Zero Overlap Disjoint Partition)
        const activeImgData  = maskCtx.createImageData(w, h);
        const wallImgData    = maskCtx.createImageData(w, h);
        const floorImgData   = maskCtx.createImageData(w, h);
        const protImgData    = maskCtx.createImageData(w, h);
        const overlayImgData = maskCtx.createImageData(w, h);

        const mPx  = activeImgData.data;
        const wPx  = wallImgData.data;
        const fPx  = floorImgData.data;
        const prPx = protImgData.data;
        const ovPx = overlayImgData.data;

        for (let y = 0; y < h; y++) {
            const rowOffset = y * w * 4;
            const isFloorZone = y >= floorY;
            const isWallZone = y >= ceilingY && y < floorY;

            for (let x = 0; x < w; x++) {
                const idx = rowOffset + x * 4;
                const r = rgbData[idx];
                const g = rgbData[idx + 1];
                const b = rgbData[idx + 2];

                const lum = r * 0.299 + g * 0.587 + b * 0.114;
                const maxC = Math.max(r, g, b);
                const minC = Math.min(r, g, b);
                const chroma = maxC - minC;

                let isProtected = false;

                // 1. Precise foreground layer check (covers sofa, table, chairs, shower glass, armatures, mirror, vanity)
                if (fgData && fgData[idx + 3] > 18) {
                    isProtected = true;
                }

                // 2. Ceiling protection
                if (y < ceilingY) isProtected = true;

                // 3. Plant / Foliage protection (pure green chromaticity)
                if ((g > r + 18 && g > b + 18) || (2 * g - r - b > 28 && g > 45)) {
                    isProtected = true;
                }

                // 4. White porcelain ceramic fixture protection (toilet bowls, vessel sinks, freestanding tubs)
                if (conf.isBathroom && lum > 185 && chroma < 28 && y >= ceilingY && y <= Math.round(h * 0.90)) {
                    isProtected = true;
                }

                // 5. Floor rugs, bath mats and deep void protection
                if (isFloorZone && ((chroma > 45 && lum < 75) || (lum < 18))) {
                    isProtected = true;
                }

                // 6. Architectural and fixture geometry protection for bathrooms
                if (conf.isBathroom) {
                    if (conf.layout === 'luxury') {
                        // Shower cabin (duşakabin): walk-in glass, rain shower, niche, hose & drain
                        if (x < Math.round(w * 0.35) && y < floorY) {
                            isProtected = true;
                        }
                        // Wall niche above toilet with decorative items & plants
                        else if (x >= Math.round(w * 0.40) && x <= Math.round(w * 0.63) && y >= Math.round(h * 0.29) && y <= Math.round(h * 0.45)) {
                            isProtected = true;
                        }
                        // Flush actuator plate
                        else if (x >= Math.round(w * 0.47) && x <= Math.round(w * 0.55) && y >= Math.round(h * 0.48) && y <= Math.round(h * 0.58)) {
                            isProtected = true;
                        }
                        // Toilet bowl (klozet), brush & paper roll
                        else if (x >= Math.round(w * 0.44) && x <= Math.round(w * 0.62) && y >= Math.round(h * 0.60) && y <= Math.round(h * 0.86)) {
                            isProtected = true;
                        }
                        // Circular illuminated mirror (ayna)
                        else if (Math.pow((x - w * 0.786) / (w * 0.175), 2) + Math.pow((y - h * 0.254) / (h * 0.175), 2) <= 1.0) {
                            isProtected = true;
                        }
                        // Vanity cabinet (banyo dolabı), countertop, basin, faucet & toiletries
                        else if (x >= Math.round(w * 0.62) && x <= Math.round(w * 0.98) && y >= Math.round(h * 0.45) && y <= Math.round(h * 0.88)) {
                            isProtected = true;
                        }
                        // Wood slats & towel
                        else if (x >= Math.round(w * 0.92)) {
                            isProtected = true;
                        }
                        // Window blinds on left
                        else if (x <= Math.round(w * 0.12)) {
                            isProtected = true;
                        }
                    } else if (conf.layout === 'antrasit' || isPortrait) {
                        // Compact / portrait bathroom (e.g. Antrasit banyo)
                        // Toilet bowl (klozet)
                        if (x >= Math.round(w * 0.158) && x <= Math.round(w * 0.36) && y >= Math.round(h * 0.68) && y <= Math.round(h * 0.86)) {
                            isProtected = true;
                        }
                        // Flush plate
                        else if (x >= Math.round(w * 0.20) && x <= Math.round(w * 0.34) && y >= Math.round(h * 0.52) && y <= Math.round(h * 0.61)) {
                            isProtected = true;
                        }
                        // Vanity cabinet, countertop & vessel sink (banyo dolabı)
                        else if (x >= Math.round(w * 0.38) && x <= Math.round(w * 0.95) && y >= Math.round(h * 0.64) && y <= Math.round(h * 0.85)) {
                            isProtected = true;
                        }
                        // Upper wall cabinet & backlit mirror
                        else if (x >= Math.round(w * 0.38) && x <= Math.round(w * 0.95) && y >= Math.round(h * 0.17) && y <= Math.round(h * 0.64)) {
                            isProtected = true;
                        }
                        // Left towel radiator
                        else if (x < Math.round(w * 0.15) && y >= Math.round(h * 0.25) && y <= Math.round(h * 0.85)) {
                            isProtected = true;
                        }
                    } else if (conf.layout === 'easy' || (!roomFgImageEl && conf.isBathroom)) {
                        // Right shower cabin & glass partition (duşakabin)
                        if (x > Math.round(w * 0.68) && y < floorY) {
                            isProtected = true;
                        }
                        // Mirror above vanity
                        else if (x >= Math.round(w * 0.38) && x <= Math.round(w * 0.62) && y >= Math.round(h * 0.22) && y <= Math.round(h * 0.50)) {
                            isProtected = true;
                        }
                        // Vessel sink & faucet
                        else if (x >= Math.round(w * 0.42) && x <= Math.round(w * 0.58) && y >= Math.round(h * 0.48) && y <= Math.round(h * 0.58)) {
                            isProtected = true;
                        }
                        // Vanity countertop & drawers (banyo dolabı)
                        else if (x >= Math.round(w * 0.30) && x <= Math.round(w * 0.70) && y >= Math.round(h * 0.54) && y <= Math.round(h * 0.73)) {
                            isProtected = true;
                        }
                        // Left tall cabinet / towel
                        else if (x < Math.round(w * 0.15) && y < floorY) {
                            isProtected = true;
                        }
                    }
                }

                if (isProtected) {
                    // Protected Mask: White (255)
                    prPx[idx]     = 255;
                    prPx[idx + 1] = 255;
                    prPx[idx + 2] = 255;
                    prPx[idx + 3] = 255;

                    // Decision Overlay: Red tint on room image
                    ovPx[idx]     = Math.min(255, Math.round(r * 0.45 + 239 * 0.55));
                    ovPx[idx + 1] = Math.min(255, Math.round(g * 0.45 + 68  * 0.55));
                    ovPx[idx + 2] = Math.min(255, Math.round(b * 0.45 + 68  * 0.55));
                    ovPx[idx + 3] = 255;
                } else {
                    if (isFloorZone) {
                        // Floor Mask: White (255)
                        fPx[idx]     = 255;
                        fPx[idx + 1] = 255;
                        fPx[idx + 2] = 255;
                        fPx[idx + 3] = 255;

                        // Decision Overlay: Green tint on room image
                        ovPx[idx]     = Math.min(255, Math.round(r * 0.45 + 16  * 0.55));
                        ovPx[idx + 1] = Math.min(255, Math.round(g * 0.45 + 185 * 0.55));
                        ovPx[idx + 2] = Math.min(255, Math.round(b * 0.45 + 129 * 0.55));
                        ovPx[idx + 3] = 255;
                    } else if (isWallZone) {
                        // Wall Mask: White (255)
                        wPx[idx]     = 255;
                        wPx[idx + 1] = 255;
                        wPx[idx + 2] = 255;
                        wPx[idx + 3] = 255;

                        // Decision Overlay: Blue tint on room image
                        ovPx[idx]     = Math.min(255, Math.round(r * 0.45 + 99  * 0.55));
                        ovPx[idx + 1] = Math.min(255, Math.round(g * 0.45 + 102 * 0.55));
                        ovPx[idx + 2] = Math.min(255, Math.round(b * 0.45 + 241 * 0.55));
                        ovPx[idx + 3] = 255;
                    }

                    // Active Target Mask (Purple)
                    const isTarget = (activeSurface === 'floor' && isFloorZone) ||
                                     (activeSurface === 'wall' && isWallZone) ||
                                     (activeSurface === 'both' && (isFloorZone || isWallZone));
                    if (isTarget) {
                        mPx[idx]     = 168; // Purple R
                        mPx[idx + 1] = 85;  // Purple G
                        mPx[idx + 2] = 247; // Purple B
                        mPx[idx + 3] = 255; // Alpha
                    }
                }
            }
        }

        // Cache masks
        cachedMasks.active = activeImgData;
        cachedMasks.wall = wallImgData;
        cachedMasks.floor = floorImgData;
        cachedMasks.protected = protImgData;
        cachedMasks.overlay = overlayImgData;

        // Populate window.__debugLayers (All 9 Layers for QA verification)
        const cHelper = (data) => {
            const c = document.createElement('canvas');
            c.width = w; c.height = h;
            c.getContext('2d').putImageData(data, 0, 0);
            return c.toDataURL('image/png');
        };

        window.__debugLayers.original = activeRoomUrl;
        window.__debugLayers.rawMask = cHelper(activeImgData);
        window.__debugLayers.wallMask = cHelper(wallImgData);
        window.__debugLayers.floorMask = cHelper(floorImgData);
        window.__debugLayers.protectedMask = cHelper(protImgData);
        window.__debugLayers.finalApplyMask = cHelper(activeImgData);
        window.__debugLayers.decisionOverlay = cHelper(overlayImgData);

        renderCurrentLayerToCanvas();
        saveMaskState();
    }

    // Render current active layer view to canvas
    function renderCurrentLayerToCanvas() {
        if (!maskCanvas.width) return;
        const targetData = cachedMasks[currentLayerView] || cachedMasks.active;
        if (targetData) {
            maskCtx.putImageData(targetData, 0, 0);
        }
    }

    // Layer View Selector Click Events
    layerViewPills.forEach((pill) => {
        pill.addEventListener('click', () => {
            layerViewPills.forEach((p) => p.classList.remove('active'));
            pill.classList.add('active');
            currentLayerView = pill.dataset.view || 'active';
            renderCurrentLayerToCanvas();
            const names = {
                active: '🟣 Aktif Yüzey Maskesi',
                wall: '🧱 Düzeltilmiş Duvar Maskesi',
                floor: '🪵 Düzeltilmiş Zemin Maskesi',
                protected: '🛡️ Korunan Nesneler Maskesi',
                overlay: '🎯 Karar Destek Overlay (Kırmızı=Korunan, Yeşil=Zemin, Mavi=Duvar)'
            };
            showToast(names[currentLayerView] || 'Maske katmanı seçildi', 'info', 2000);
        });
    });

    // Mask State History (Undo / Redo)
    function saveMaskState() {
        if (!maskCanvas.width) return;
        const dataUrl = maskCanvas.toDataURL();
        maskHistory = maskHistory.slice(0, historyIndex + 1);
        maskHistory.push(dataUrl);
        if (maskHistory.length > 20) maskHistory.shift();
        historyIndex = maskHistory.length - 1;
        updateHistoryButtons();
    }

    function updateHistoryButtons() {
        maskUndoBtn.disabled = historyIndex <= 0;
        maskRedoBtn.disabled = historyIndex >= maskHistory.length - 1;
    }

    maskUndoBtn.addEventListener('click', async () => {
        if (historyIndex > 0) {
            historyIndex--;
            const img = await loadImage(maskHistory[historyIndex]);
            maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
            maskCtx.drawImage(img, 0, 0);
            updateHistoryButtons();
        }
    });

    maskRedoBtn.addEventListener('click', async () => {
        if (historyIndex < maskHistory.length - 1) {
            historyIndex++;
            const img = await loadImage(maskHistory[historyIndex]);
            maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
            maskCtx.drawImage(img, 0, 0);
            updateHistoryButtons();
        }
    });

    maskClearBtn.addEventListener('click', () => {
        maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
        saveMaskState();
        showToast('Maske temizlendi.', 'info');
    });

    // Interactive Purple Brush on Canvas
    function getCanvasCoordinates(e) {
        const rect = maskCanvas.getBoundingClientRect();
        const scaleX = maskCanvas.width / rect.width;
        const scaleY = maskCanvas.height / rect.height;
        let clientX = e.clientX ?? (e.touches && e.touches[0]?.clientX);
        let clientY = e.clientY ?? (e.touches && e.touches[0]?.clientY);
        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
    }

    function updateBrushCursorSize() {
        if (!brushCursor) return;
        const sz = brushSizeSlider.value;
        brushCursor.style.width = `${sz}px`;
        brushCursor.style.height = `${sz}px`;
    }

    canvasViewport.addEventListener('mouseenter', () => {
        brushCursor.style.display = 'block';
        updateBrushCursorSize();
    });

    canvasViewport.addEventListener('mouseleave', () => {
        brushCursor.style.display = 'none';
        isDrawing = false;
        lastPoint = null;
    });

    canvasViewport.addEventListener('mousemove', (e) => {
        const rect = canvasViewport.getBoundingClientRect();
        brushCursor.style.left = `${e.clientX - rect.left}px`;
        brushCursor.style.top = `${e.clientY - rect.top}px`;

        if (!isDrawing) return;
        const pt = getCanvasCoordinates(e);
        drawBrushStroke(lastPoint, pt);
        lastPoint = pt;
    });

    canvasViewport.addEventListener('mousedown', (e) => {
        isDrawing = true;
        const pt = getCanvasCoordinates(e);
        lastPoint = pt;
        drawBrushStroke(pt, pt);
    });

    // Mobile touch drawing support
    canvasViewport.addEventListener('touchstart', (e) => {
        if (e.touches && e.touches.length === 1) {
            e.preventDefault();
            isDrawing = true;
            const pt = getCanvasCoordinates(e);
            lastPoint = pt;
            drawBrushStroke(pt, pt);
        }
    }, { passive: false });

    canvasViewport.addEventListener('touchmove', (e) => {
        if (!isDrawing || (e.touches && e.touches.length !== 1)) return;
        e.preventDefault();
        const pt = getCanvasCoordinates(e);
        drawBrushStroke(lastPoint, pt);
        lastPoint = pt;
    }, { passive: false });

    window.addEventListener('mouseup', () => {
        if (isDrawing) {
            isDrawing = false;
            lastPoint = null;
            saveMaskState();
        }
    });

    window.addEventListener('touchend', () => {
        if (isDrawing) {
            isDrawing = false;
            lastPoint = null;
            saveMaskState();
        }
    });

    function drawBrushStroke(from, to) {
        if (!from || !to) return;
        const sz = parseInt(brushSizeSlider.value, 10);
        maskCtx.save();
        maskCtx.strokeStyle = '#b38e47';
        maskCtx.fillStyle = '#b38e47';
        maskCtx.lineWidth = sz;
        maskCtx.lineCap = 'round';
        maskCtx.lineJoin = 'round';

        maskCtx.beginPath();
        maskCtx.moveTo(from.x, from.y);
        maskCtx.lineTo(to.x, to.y);
        maskCtx.stroke();

        maskCtx.beginPath();
        maskCtx.arc(to.x, to.y, sz / 2, 0, Math.PI * 2);
        maskCtx.fill();
        maskCtx.restore();
    }

    // Draw viewport background
    function drawMaskViewport() {
        if (!roomImageEl) return;
        const op = (opacitySlider.value / 100).toFixed(2);
        maskCanvas.style.opacity = op;
        canvasViewport.style.backgroundImage = `url(${activeRoomUrl})`;
        canvasViewport.style.backgroundSize = 'contain';
        canvasViewport.style.backgroundRepeat = 'no-repeat';
        canvasViewport.style.backgroundPosition = 'center';
    }

    // Step 4: Visualization Rendering Algorithm (1-Point Perspective & Homography)
    async function renderTilesPerspective() {
        if (!roomImageEl || !tileImageEl) return null;
        const w = roomImageEl.naturalWidth;
        const h = roomImageEl.naturalHeight;

        // Base room image data
        const rCanvas = document.createElement('canvas');
        rCanvas.width = w;
        rCanvas.height = h;
        const rCtx = rCanvas.getContext('2d');
        rCtx.drawImage(roomImageEl, 0, 0, w, h);
        const roomImgData = rCtx.getImageData(0, 0, w, h);
        const roomPx = roomImgData.data;

        // Mask pixels - ALWAYS use the verified target surface mask (active mask or manual edits)
        let maskImgData;
        if (currentLayerView === 'active' || !cachedMasks.active) {
            maskImgData = maskCtx.getImageData(0, 0, w, h);
        } else {
            maskImgData = cachedMasks.active;
        }
        const maskPx = maskImgData.data;

        // Tile sizing from sliders
        const twMetric = parseInt(tileWSlider.value, 10) || 60;
        const thMetric = parseInt(tileHSlider.value, 10) || 120;
        const tileAspect = twMetric / thMetric;

        const baseTileW = Math.max(30, Math.round(w * 0.085 * (twMetric / 60)));
        const baseTileH = Math.max(30, Math.round(baseTileW / tileAspect));

        // Create tile swatch with grout
        const patCanvas = document.createElement('canvas');
        patCanvas.width = baseTileW;
        patCanvas.height = baseTileH;
        const pCtx = patCanvas.getContext('2d');
        pCtx.drawImage(tileImageEl, 0, 0, baseTileW, baseTileH);

        // Grout line
        const gw = parseInt(groutSlider.value, 10) || 3;
        const groutPxW = Math.max(1, Math.round(gw * 0.7));
        pCtx.strokeStyle = 'rgba(65, 60, 55, 0.55)';
        pCtx.lineWidth = groutPxW;
        pCtx.strokeRect(groutPxW / 2, groutPxW / 2, baseTileW - groutPxW, baseTileH - groutPxW);

        const tilePx = pCtx.getImageData(0, 0, baseTileW, baseTileH).data;

        // Perspective setup - Unified geometry from calibrated room config
        const conf = getRoomConfig(activeRoomUrl, w, h);
        const horizonY = Math.round(h * conf.horizonY);
        const floorHorizonY = Math.round(h * conf.floorY);
        const vx = Math.round(w * conf.vanishingX);
        const vy = horizonY;

        const cameraH = Math.max(120, (h - vy) * 0.65);
        const scaleFloorV = Math.max(160, Math.round(w * 0.40));
        const scaleFloorU = scaleFloorV * (baseTileW / baseTileH);

        const chosenPattern = patternSelect.value; // 'brick' | 'grid' | 'diagonal'

        const outImgData = rCtx.createImageData(w, h);
        const outBuf = new Uint32Array(outImgData.data.buffer);
        const roomBuf = new Uint32Array(roomPx.buffer);

        for (let y = 0; y < h; y++) {
            const rowOffset = y * w;
            const rowByteOffset = rowOffset * 4;
            const dy = y - vy;
            const isFloorPlane = y >= floorHorizonY;

            for (let x = 0; x < w; x++) {
                const pxIdx = rowOffset + x;
                const byteIdx = rowByteOffset + x * 4;
                const maskAlpha = maskPx[byteIdx + 3];

                if (maskAlpha < 10) {
                    outBuf[pxIdx] = roomBuf[pxIdx];
                    continue;
                }

                let srcX = 0;
                let srcY = 0;

                if (isFloorPlane) {
                    const absDy = Math.max(1.0, dy);
                    const z = cameraH / absDy;
                    const vCoord = z * scaleFloorV;
                    const uCoord = ((x - vx) / absDy) * scaleFloorU;

                    if (chosenPattern === 'diagonal') {
                        const diagU = (uCoord + vCoord) * 0.70710678;
                        const diagV = (vCoord - uCoord) * 0.70710678;
                        srcX = ((Math.floor(diagU) % baseTileW) + baseTileW) % baseTileW;
                        srcY = ((Math.floor(diagV) % baseTileH) + baseTileH) % baseTileH;
                    } else if (chosenPattern === 'brick') {
                        const rowIdx = Math.floor(vCoord / baseTileH);
                        const xOffset = (rowIdx % 2 !== 0) ? (baseTileW / 2) : 0;
                        srcY = ((Math.floor(vCoord) % baseTileH) + baseTileH) % baseTileH;
                        srcX = ((Math.floor(uCoord + xOffset) % baseTileW) + baseTileW) % baseTileW;
                    } else {
                        srcY = ((Math.floor(vCoord) % baseTileH) + baseTileH) % baseTileH;
                        srcX = ((Math.floor(uCoord) % baseTileW) + baseTileW) % baseTileW;
                    }
                } else {
                    const rowIdx = Math.floor(y / baseTileH);
                    const xOffset = (chosenPattern === 'brick' && (rowIdx % 2 !== 0)) ? (baseTileW / 2) : 0;
                    if (chosenPattern === 'diagonal') {
                        const diagU = ((x + xOffset) + y) * 0.70710678;
                        const diagV = (y - (x + xOffset)) * 0.70710678;
                        srcX = ((Math.floor(diagU) % baseTileW) + baseTileW) % baseTileW;
                        srcY = ((Math.floor(diagV) % baseTileH) + baseTileH) % baseTileH;
                    } else {
                        srcX = ((Math.floor(x + xOffset) % baseTileW) + baseTileW) % baseTileW;
                        srcY = ((Math.floor(y) % baseTileH) + baseTileH) % baseTileH;
                    }
                }

                const tileByteIdx = (srcY * baseTileW + srcX) * 4;
                const tR = tilePx[tileByteIdx];
                const tG = tilePx[tileByteIdx + 1];
                const tB = tilePx[tileByteIdx + 2];

                const rR = roomPx[byteIdx];
                const rG = roomPx[byteIdx + 1];
                const rB = roomPx[byteIdx + 2];

                // Natural depth darkening from realism.py
                let depthFactor = 1.0;
                if (isFloorPlane) {
                    const depthDist = Math.max(0, 1.0 - (dy / Math.max(1, h - floorHorizonY)));
                    depthFactor = 1.0 - (depthDist * 0.14);
                }

                // Ambient room luminance preservation
                const lum = (rR * 0.299 + rG * 0.587 + rB * 0.114) / 255.0;
                const lightFactor = Math.min(1.15, Math.max(0.18, (lum * 0.82 + 0.18) * depthFactor));

                const shadedR = Math.min(255, Math.round(tR * lightFactor));
                const shadedG = Math.min(255, Math.round(tG * lightFactor));
                const shadedB = Math.min(255, Math.round(tB * lightFactor));

                const alpha = maskAlpha / 255.0;
                const outR = Math.round(shadedR * alpha + rR * (1 - alpha));
                const outG = Math.round(shadedG * alpha + rG * (1 - alpha));
                const outB = Math.round(shadedB * alpha + rB * (1 - alpha));

                outBuf[pxIdx] = (255 << 24) | (outB << 16) | (outG << 8) | outR;
            }
        }

        rCtx.putImageData(outImgData, 0, 0);

        // Overlay foreground layer if available for razor-sharp furniture/object edges
        if (roomFgImageEl) {
            rCtx.drawImage(roomFgImageEl, 0, 0, w, h);
        }

        window.__debugLayers.perspectiveTile = patCanvas.toDataURL('image/png');
        window.__debugLayers.compositeResult = rCanvas.toDataURL('image/png');

        return new Promise((resolve) => {
            rCanvas.toBlob((blob) => resolve(blob), 'image/png');
        });
    }

    // Execute Full Visualization Pipeline
    async function executeVisualization(silent = false) {
        if (!silent) showLoading('Tile Detection & Visualization Engine çalışıyor…');

        try {
            const blob = await renderTilesPerspective();
            if (!blob) throw new Error('Render motoru çıktı üretemedi.');

            if (resultBlobUrl) URL.revokeObjectURL(resultBlobUrl);
            resultBlobUrl = URL.createObjectURL(blob);

            resultImg.src = resultBlobUrl;
            originalImg.src = activeRoomUrl;

            // Scroll result into view
            if (!silent) {
                const resCard = $('#card-step-4');
                if (resCard) resCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
                showToast('Seramik mekâna başarıyla döşendi!', 'success');
            }

            setSliderSplit(50);
        } catch (err) {
            console.error(err);
            if (!silent) showToast('Hata: ' + err.message, 'error');
        } finally {
            if (!silent) hideLoading();
        }
    }

    generateBtn.addEventListener('click', () => {
        executeVisualization(false);
    });

    // Before / After Slider Interaction
    function setSliderSplit(pct) {
        pct = Math.max(0, Math.min(100, pct));
        const container = $('#before-after-container');
        if (container) {
            container.style.setProperty('--split', pct + '%');
        }
    }

    let isDraggingSlider = false;

    function onSliderMove(e) {
        if (!isDraggingSlider) return;
        const container = $('#before-after-container');
        const rect = container.getBoundingClientRect();
        let clientX = e.clientX ?? (e.touches && e.touches[0]?.clientX);
        if (clientX == null || rect.width <= 0) return;
        const pct = ((clientX - rect.left) / rect.width) * 100;
        setSliderSplit(pct);
    }

    if (stageHandle) {
        stageHandle.addEventListener('mousedown', (e) => {
            isDraggingSlider = true;
            e.preventDefault();
        });
        stageHandle.addEventListener('touchstart', (e) => {
            isDraggingSlider = true;
        }, { passive: true });
    }

    const stageContainer = $('#before-after-container');
    if (stageContainer) {
        stageContainer.addEventListener('mousemove', onSliderMove);
        stageContainer.addEventListener('touchmove', onSliderMove, { passive: true });
        stageContainer.addEventListener('click', (e) => {
            const rect = stageContainer.getBoundingClientRect();
            if (rect.width <= 0) return;
            const pct = ((e.clientX - rect.left) / rect.width) * 100;
            setSliderSplit(pct);
        });
    }

    window.addEventListener('mouseup', () => { isDraggingSlider = false; });
    window.addEventListener('touchend', () => { isDraggingSlider = false; });

    // Download Result PNG
    downloadBtn.addEventListener('click', () => {
        if (!resultBlobUrl) {
            showToast('Lütfen önce görselleştirmeyi tamamlayın.', 'error');
            return;
        }
        const a = document.createElement('a');
        a.href = resultBlobUrl;
        a.download = `tile_visualization_${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        showToast('Görsel başarıyla indirildi.', 'success');
    });

    // Request Quote Integration
    requestQuoteBtn.addEventListener('click', () => {
        if (window !== window.parent) {
            window.parent.postMessage({
                type: 'REQUEST_QUOTE',
                product: activeTileName,
                tileUrl: activeTileUrl
            }, '*');
        } else {
            window.location.href = `/proje-talep?product=${encodeURIComponent(activeTileName)}`;
        }
    });

    // Mobile Settings Drawer (Open / Close / Backdrop)
    const sidebarEl = $('#sidebar');
    const sidebarBackdropEl = $('#sidebar-backdrop');
    const openSettingsBtnEl = $('#open-settings-btn');
    const sidebarCloseBtnEl = $('#sidebar-close-btn');

    function openMobileDrawer() {
        if (sidebarEl) sidebarEl.classList.add('open');
        if (sidebarBackdropEl) sidebarBackdropEl.classList.add('active');
    }

    function closeMobileDrawer() {
        if (sidebarEl) sidebarEl.classList.remove('open');
        if (sidebarBackdropEl) sidebarBackdropEl.classList.remove('active');
    }

    if (openSettingsBtnEl) openSettingsBtnEl.addEventListener('click', openMobileDrawer);
    if (sidebarCloseBtnEl) sidebarCloseBtnEl.addEventListener('click', closeMobileDrawer);
    if (sidebarBackdropEl) sidebarBackdropEl.addEventListener('click', closeMobileDrawer);

    // URL Parameters Initialization
    async function initFromUrlParams() {
        showLoading('Tile Detection & Visualization Engine başlatılıyor…');
        const params = new URLSearchParams(window.location.search);
        const tileParam = params.get('tile');
        const productParam = params.get('product');
        const roomParam = params.get('room');
        const widthParam = params.get('width');
        const heightParam = params.get('height');
        const surfaceParam = params.get('surface');

        if (widthParam && tileWSlider) {
            tileWSlider.value = parseInt(widthParam, 10);
        }
        if (heightParam && tileHSlider) {
            tileHSlider.value = parseInt(heightParam, 10);
        }
        updateTileSizeDisplay();

        if (surfaceParam === 'wall') {
            switchSurface('wall');
        } else if (surfaceParam === 'both') {
            switchSurface('both');
        }

        const initialTileUrl = tileParam || '/textures/calacatta_gold.jpg';
        const initialTileName = productParam || 'Calacatta Gold 60×120';
        const initialRoomUrl = roomParam || '/hero/easy_bathroom.jpg';

        await Promise.allSettled([
            loadTile(initialTileUrl, initialTileName),
            loadRoom(initialRoomUrl, 'Modern Banyo')
        ]);

        drawMaskViewport();

        // AUTOMATIC PERSPECTIVE TILE LAYING ON INITIAL LOAD ("seramikleri döşesin")
        await executeVisualization(true);
        hideLoading();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFromUrlParams);
    } else {
        initFromUrlParams();
    }
})();
