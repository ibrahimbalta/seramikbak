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
    const finishSelect    = $('#finish-select');
    const groutColorInput = $('#grout-color-input');
    const groutColorVal   = $('#grout-color-val');
    const groutSwatches   = $('.grout-swatch');
    const sizeChips       = $('.size-chip');
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
        const w = parseInt(tileWSlider.value, 10) || 60;
        const h = parseInt(tileHSlider.value, 10) || 120;
        tileWNum.textContent = `${w} cm`;
        tileHNum.textContent = `${h} cm`;
        tileSizeVal.textContent = `${w} cm × ${h} cm`;
        const tileCardTag = $('#tile-card-tag');
        if (tileCardTag) {
            tileCardTag.textContent = `${w}×${h} cm`;
        }
        sizeChips.forEach((chip) => {
            const cw = parseInt(chip.dataset.w, 10);
            const ch = parseInt(chip.dataset.h, 10);
            chip.classList.toggle('active', cw === w && ch === h);
        });
    }

    tileWSlider.addEventListener('input', updateTileSizeDisplay);
    tileHSlider.addEventListener('input', updateTileSizeDisplay);

    // Quick Size Chips handler
    sizeChips.forEach((chip) => {
        chip.addEventListener('click', () => {
            const w = parseInt(chip.dataset.w, 10);
            const h = parseInt(chip.dataset.h, 10);
            if (w && tileWSlider) tileWSlider.value = w;
            if (h && tileHSlider) tileHSlider.value = h;
            updateTileSizeDisplay();
            executeVisualization(true);
        });
    });

    // Grout Color Swatches handler
    groutSwatches.forEach((swatch) => {
        swatch.addEventListener('click', () => {
            groutSwatches.forEach((s) => s.classList.remove('active'));
            swatch.classList.add('active');
            const color = swatch.dataset.color;
            const name = swatch.dataset.name;
            if (groutColorInput) groutColorInput.value = color;
            if (groutColorVal) groutColorVal.textContent = name;
            executeVisualization(true);
        });
    });

    // Finish Select handler
    if (finishSelect) {
        finishSelect.addEventListener('change', () => {
            executeVisualization(true);
        });
    }

    // Helper: Hex color to RGB
    function hexToRgb(hex) {
        let clean = (hex || '#cfd4dc').replace('#', '').trim();
        if (clean.length === 3) {
            clean = clean.split('').map((c) => c + c).join('');
        }
        const num = parseInt(clean, 16) || 0xcfd4dc;
        return {
            r: (num >> 16) & 255,
            g: (num >> 8) & 255,
            b: num & 255
        };
    }

    // Helper: Sub-pixel Bilinear Texture Sampling (Eliminates pixelation & aliasing)
    function sampleBilinear(uNorm, vNorm, texPx, texW, texH) {
        const u = ((uNorm % 1.0) + 1.0) % 1.0;
        const v = ((vNorm % 1.0) + 1.0) % 1.0;

        const px = u * (texW - 1);
        const py = v * (texH - 1);

        const x0 = px | 0;
        const y0 = py | 0;
        const x1 = (x0 + 1 < texW) ? x0 + 1 : 0;
        const y1 = (y0 + 1 < texH) ? y0 + 1 : 0;

        const fx = px - x0;
        const fy = py - y0;
        const fx1 = 1.0 - fx;
        const fy1 = 1.0 - fy;

        const w00 = fx1 * fy1;
        const w10 = fx * fy1;
        const w01 = fx1 * fy;
        const w11 = fx * fy;

        const idx00 = (y0 * texW + x0) * 4;
        const idx10 = (y0 * texW + x1) * 4;
        const idx01 = (y1 * texW + x0) * 4;
        const idx11 = (y1 * texW + x1) * 4;

        const r = texPx[idx00] * w00 + texPx[idx10] * w10 + texPx[idx01] * w01 + texPx[idx11] * w11;
        const g = texPx[idx00 + 1] * w00 + texPx[idx10 + 1] * w10 + texPx[idx01 + 1] * w01 + texPx[idx11 + 1] * w11;
        const b = texPx[idx00 + 2] * w00 + texPx[idx10 + 2] * w10 + texPx[idx01 + 2] * w01 + texPx[idx11 + 2] * w11;

        return [r, g, b];
    }

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

        // Base room canvas
        const rCanvas = document.createElement('canvas');
        rCanvas.width = w;
        rCanvas.height = h;
        const rCtx = rCanvas.getContext('2d');
        rCtx.drawImage(roomImageEl, 0, 0, w, h);
        const roomImgData = rCtx.getImageData(0, 0, w, h);
        const roomPx = roomImgData.data;

        // Target surface mask
        let maskImgData;
        if (currentLayerView === 'active' || !cachedMasks.active) {
            maskImgData = maskCtx.getImageData(0, 0, w, h);
        } else {
            maskImgData = cachedMasks.active;
        }
        const maskPx = maskImgData.data;

        // Metrics from UI
        const twMetric = parseInt(tileWSlider.value, 10) || 60;
        const thMetric = parseInt(tileHSlider.value, 10) || 120;
        const gw = parseInt(groutSlider.value, 10) || 2;
        const chosenPattern = patternSelect.value || 'offset3'; // 'offset3' | 'brick' | 'grid' | 'diagonal' | 'herringbone'
        const finishType = finishSelect ? finishSelect.value : 'satin'; // 'glossy' | 'satin' | 'matte'

        // Grout color
        const groutHex = groutColorInput ? groutColorInput.value : '#cfd4dc';
        const { r: groutR, g: groutG, b: groutB } = hexToRgb(groutHex);

        // High-Resolution Tile Texture Canvas (Preserve full crisp photographic detail!)
        const texNativeW = tileImageEl.naturalWidth || 600;
        const texNativeH = tileImageEl.naturalHeight || 1200;
        const maxTexDim = 1600; // Optimal studio balance: extreme sharpness + smooth 60fps performance
        let texW = texNativeW;
        let texH = texNativeH;
        if (texW > maxTexDim || texH > maxTexDim) {
            const ratio = maxTexDim / Math.max(texW, texH);
            texW = Math.round(texW * ratio);
            texH = Math.round(texH * ratio);
        }
        const texCanvas = document.createElement('canvas');
        texCanvas.width = texW;
        texCanvas.height = texH;
        const texCtx = texCanvas.getContext('2d');
        texCtx.drawImage(tileImageEl, 0, 0, texW, texH);
        const texPx = texCtx.getImageData(0, 0, texW, texH).data;

        // 3D Perspective Geometry from calibrated room parameters
        const conf = getRoomConfig(activeRoomUrl, w, h, activeRoomName);
        const floorHorizonY = Math.round(h * conf.floorY);
        const ceilingY = Math.round(h * conf.ceilingY);
        const vx = Math.round(w * conf.vanishingX);
        const vy = Math.round(h * conf.horizonY);

        // Camera and Metric focal scaling for Floor
        // In realistic interior room photography, bottom width represents ~260cm of floor width
        const camHeightCm = 145.0; // Human standing eye-level
        const focalMetricY = (h - vy) * 1.85;
        const focalMetricX = (w / 260.0) * focalMetricY;

        // Grout & Bevel physical dimensions in centimeters
        const gHalfCm = Math.max(0.06, gw / 20.0); // e.g. 2mm -> 0.1cm half-width
        const bevelWidthCm = gHalfCm + 0.16;      // 1.6mm tactile bevel transition

        const outImgData = rCtx.createImageData(w, h);
        const outBuf = new Uint32Array(outImgData.data.buffer);
        const roomBuf = new Uint32Array(roomPx.buffer);

        for (let y = 0; y < h; y++) {
            const rowOffset = y * w;
            const rowByteOffset = rowOffset * 4;
            const dy = y - vy;
            const isFloorPlane = y >= floorHorizonY;

            // Pre-calculate per-row perspective depths
            let zFloorCm = 0;
            let uFloorScale = 0;
            let vCoordBase = 0;
            let yWallCm = 0;

            if (isFloorPlane) {
                const absDy = Math.max(1.0, dy);
                zFloorCm = (focalMetricY * camHeightCm) / absDy;
                uFloorScale = zFloorCm / focalMetricX;
                vCoordBase = zFloorCm;
            } else {
                // Wall plane starts at floor joint (floorHorizonY) and stacks upward!
                const wallH = Math.max(1, floorHorizonY - ceilingY);
                yWallCm = (floorHorizonY - y) * (240.0 / wallH);
            }

            for (let x = 0; x < w; x++) {
                const pxIdx = rowOffset + x;
                const byteIdx = rowByteOffset + x * 4;
                const maskAlpha = maskPx[byteIdx + 3];

                if (maskAlpha < 10) {
                    outBuf[pxIdx] = roomBuf[pxIdx];
                    continue;
                }

                let uMetric = 0;
                let vMetric = 0;

                if (isFloorPlane) {
                    uMetric = (x - vx) * uFloorScale;
                    vMetric = vCoordBase;
                } else {
                    // Wall metric coordinates: aligned from floor baseline
                    uMetric = (x - vx) * (260.0 / w);
                    vMetric = yWallCm;
                }

                // Compute local coordinates inside tile according to chosen pattern
                let locU = 0;
                let locV = 0;

                if (chosenPattern === 'offset3') {
                    // 1/3 Stagger (Modern architectural standard for 60x120 tiles)
                    const rowIdx = Math.floor(vMetric / thMetric);
                    const shift = (((rowIdx % 3) + 3) % 3) * (twMetric / 3.0);
                    const colIdx = Math.floor((uMetric + shift) / twMetric);
                    locU = ((uMetric + shift) - colIdx * twMetric);
                    locV = (vMetric - rowIdx * thMetric);
                } else if (chosenPattern === 'brick') {
                    // 1/2 Stagger (Classic brick pattern)
                    const rowIdx = Math.floor(vMetric / thMetric);
                    const shift = (((rowIdx % 2) + 2) % 2) * (twMetric * 0.5);
                    const colIdx = Math.floor((uMetric + shift) / twMetric);
                    locU = ((uMetric + shift) - colIdx * twMetric);
                    locV = (vMetric - rowIdx * thMetric);
                } else if (chosenPattern === 'diagonal') {
                    // 45° Diamond rotation
                    const dU = (uMetric + vMetric) * 0.70710678;
                    const dV = (vMetric - uMetric) * 0.70710678;
                    const colIdx = Math.floor(dU / twMetric);
                    const rowIdx = Math.floor(dV / thMetric);
                    locU = (dU - colIdx * twMetric);
                    locV = (dV - rowIdx * thMetric);
                } else if (chosenPattern === 'herringbone') {
                    // Balıksırtı / Herringbone parquet pattern
                    const hU = (uMetric + vMetric) * 0.70710678;
                    const hV = (vMetric - uMetric) * 0.70710678;
                    const strip = Math.floor(hU / twMetric);
                    const isEven = ((strip % 2) + 2) % 2 === 0;
                    if (isEven) {
                        const rowIdx = Math.floor(hV / thMetric);
                        locU = hU - strip * twMetric;
                        locV = hV - rowIdx * thMetric;
                    } else {
                        const rowIdx = Math.floor(hV / twMetric);
                        const colIdx = Math.floor(hU / thMetric);
                        locU = hV - rowIdx * twMetric;
                        locV = hU - colIdx * thMetric;
                    }
                } else {
                    // Standard straight grid
                    const colIdx = Math.floor(uMetric / twMetric);
                    const rowIdx = Math.floor(vMetric / thMetric);
                    locU = (uMetric - colIdx * twMetric);
                    locV = (vMetric - rowIdx * thMetric);
                }

                // Wrap locU and locV cleanly in [0, twMetric) and [0, thMetric)
                locU = ((locU % twMetric) + twMetric) % twMetric;
                locV = ((locV % thMetric) + thMetric) % thMetric;

                // 3D Beveled Grout & Micro-Depth
                const distLeft = locU;
                const distRight = twMetric - locU;
                const distTop = locV;
                const distBottom = thMetric - locV;

                const minDistU = Math.min(distLeft, distRight);
                const minDistV = Math.min(distTop, distBottom);
                const minDist = Math.min(minDistU, minDistV);

                let tR, tG, tB;

                if (minDist < gHalfCm) {
                    // Inside the grout joint - apply concave ambient shadow
                    const depthRelief = 0.80 + 0.20 * (minDist / gHalfCm);
                    tR = groutR * depthRelief;
                    tG = groutG * depthRelief;
                    tB = groutB * depthRelief;
                } else if (minDist < bevelWidthCm) {
                    // On the beveled edge of the ceramic tile
                    const uNorm = (locU - gHalfCm) / Math.max(0.01, twMetric - 2 * gHalfCm);
                    const vNorm = (locV - gHalfCm) / Math.max(0.01, thMetric - 2 * gHalfCm);
                    const [sR, sG, sB] = sampleBilinear(uNorm, vNorm, texPx, texW, texH);

                    // Directional 3D bevel lighting (upper-left key light)
                    const isTopOrLeft = (minDistU === distLeft || minDistV === distTop);
                    const bevelRatio = (minDist - gHalfCm) / (bevelWidthCm - gHalfCm);
                    const bevelFactor = isTopOrLeft
                        ? (1.0 + 0.16 * (1.0 - bevelRatio))  // Soft micro-highlight on top/left
                        : (1.0 - 0.14 * (1.0 - bevelRatio)); // Subtle micro-shadow on bottom/right

                    tR = Math.min(255, sR * bevelFactor);
                    tG = Math.min(255, sG * bevelFactor);
                    tB = Math.min(255, sB * bevelFactor);
                } else {
                    // Flat face of the tile - crisp sub-pixel bilinear sampling
                    const uNorm = (locU - gHalfCm) / Math.max(0.01, twMetric - 2 * gHalfCm);
                    const vNorm = (locV - gHalfCm) / Math.max(0.01, thMetric - 2 * gHalfCm);
                    const [sR, sG, sB] = sampleBilinear(uNorm, vNorm, texPx, texW, texH);
                    tR = sR;
                    tG = sG;
                    tB = sB;
                }

                const rR = roomPx[byteIdx];
                const rG = roomPx[byteIdx + 1];
                const rB = roomPx[byteIdx + 2];

                // Original room luminance [0, 1]
                const roomLum = (rR * 0.299 + rG * 0.587 + rB * 0.114) / 255.0;

                // 1. Natural photographic depth falloff for floor plane
                let depthFactor = 1.0;
                if (isFloorPlane) {
                    const depthDist = Math.max(0, 1.0 - (dy / Math.max(1, h - floorHorizonY)));
                    depthFactor = 1.0 - (depthDist * 0.12);
                }

                // 2. Contact shadow preservation & Ambient Occlusion (under vanity, toilet, baseboard)
                const shadowFactor = Math.min(1.15, Math.max(0.12, Math.pow(Math.max(0.02, roomLum), 0.72) * 1.08 * depthFactor));

                // 3. Ambient bounce light color tinting (5-8% room ambient warmth/coolness)
                const lumClamp = Math.max(0.12, roomLum * 255.0);
                const tintR = 0.94 + 0.06 * (rR / lumClamp);
                const tintG = 0.94 + 0.06 * (rG / lumClamp);
                const tintB = 0.94 + 0.06 * (rB / lumClamp);

                let shadedR = Math.min(255, tR * shadowFactor * tintR);
                let shadedG = Math.min(255, tG * shadowFactor * tintG);
                let shadedB = Math.min(255, tB * shadowFactor * tintB);

                // 4. Specular Glaze Highlights (reflects ceiling downlights & vanity mirrors)
                if (finishType === 'glossy' && roomLum > 0.58) {
                    const spec = Math.pow((roomLum - 0.58) / 0.42, 2.2) * 0.55;
                    shadedR = Math.min(255, shadedR + 255 * spec);
                    shadedG = Math.min(255, shadedG + 255 * spec);
                    shadedB = Math.min(255, shadedB + 255 * spec);
                } else if (finishType === 'satin' && roomLum > 0.68) {
                    const spec = Math.pow((roomLum - 0.68) / 0.32, 1.8) * 0.22;
                    shadedR = Math.min(255, shadedR + 255 * spec);
                    shadedG = Math.min(255, shadedG + 255 * spec);
                    shadedB = Math.min(255, shadedB + 255 * spec);
                }

                // 5. Seamless Mask Alpha Blending
                const alpha = maskAlpha / 255.0;
                const outR = Math.round(shadedR * alpha + rR * (1 - alpha));
                const outG = Math.round(shadedG * alpha + rG * (1 - alpha));
                const outB = Math.round(shadedB * alpha + rB * (1 - alpha));

                outBuf[pxIdx] = (255 << 24) | (outB << 16) | (outG << 8) | outR;
            }
        }

        rCtx.putImageData(outImgData, 0, 0);

        // Overlay foreground layer if available for razor-sharp furniture/fixture edges
        if (roomFgImageEl) {
            rCtx.drawImage(roomFgImageEl, 0, 0, w, h);
        }

        window.__debugLayers.perspectiveTile = texCanvas.toDataURL('image/png');
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
        const finishParam = params.get('finish');

        if (finishParam && finishSelect) {
            const fLower = finishParam.toLowerCase();
            if (fLower.includes('mat')) {
                finishSelect.value = 'matte';
            } else if (fLower.includes('parlak') || fLower.includes('gloss')) {
                finishSelect.value = 'glossy';
            } else {
                finishSelect.value = 'satin';
            }
        }

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
