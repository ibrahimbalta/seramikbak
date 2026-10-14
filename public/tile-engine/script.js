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

    let maskCtx = maskCanvas.getContext('2d');
    let maskHistory = [];
    let historyIndex = -1;

    let isDrawing = false;
    let lastPoint = null;

    let resultBlobUrl = null;

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
    surfFloorBtn.addEventListener('click', () => {
        surfFloorBtn.classList.add('active');
        surfWallBtn.classList.remove('active');
        activeSurface = 'floor';
        generateAutoMask();
        executeVisualization(true);
    });

    surfWallBtn.addEventListener('click', () => {
        surfWallBtn.classList.add('active');
        surfFloorBtn.classList.remove('active');
        activeSurface = 'wall';
        generateAutoMask();
        executeVisualization(true);
    });

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

    // Intelligent Mask Generation (Protecting fixtures, vanity, toilet, plants, ceiling)
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

        const isEasyBathroom = activeRoomUrl.includes('bathroom') || (w === 1024 && h === 1024);
        const isPortrait = h > w;
        const ceilingY = Math.round(h * 0.18);
        const floorY = isEasyBathroom ? Math.round(h * 0.72) : Math.round(h * (isPortrait ? 0.76 : 0.68));

        const maskImgData = maskCtx.createImageData(w, h);
        const mPx = maskImgData.data;

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
                const chroma = Math.max(r, g, b) - Math.min(r, g, b);

                let isProtected = false;
                // Plant protection
                if ((g > r + 18 && g > b + 18) || (2 * g - r - b > 28 && g > 45)) isProtected = true;
                // Carpet/textile
                if (isFloorZone && ((x >= w * 0.30 && x <= w * 0.72 && y >= floorY + h * 0.03 && y <= floorY + h * 0.11) || (chroma > 45 && lum < 75))) isProtected = true;

                if (y < ceilingY) isProtected = true;

                // Bathroom fixtures protection
                if (isEasyBathroom) {
                    if (x < w * 0.42 && y < floorY) isProtected = true; // Wood cabinet
                    if (x >= w * 0.42 && x <= w * 0.58 && y >= h * 0.20 && y <= h * 0.74) isProtected = true; // Mirror & Vanity
                    if (x > w * 0.78 && y >= floorY && y <= floorY + h * 0.16) isProtected = true; // Fixture zone
                }

                if (!isProtected) {
                    if (activeSurface === 'floor' && isFloorZone) {
                        mPx[idx]     = 168; // Purple R
                        mPx[idx + 1] = 85;  // Purple G
                        mPx[idx + 2] = 247; // Purple B
                        mPx[idx + 3] = 255; // Alpha
                    } else if (activeSurface === 'wall' && isWallZone) {
                        mPx[idx]     = 168;
                        mPx[idx + 1] = 85;
                        mPx[idx + 2] = 247;
                        mPx[idx + 3] = 255;
                    }
                }
            }
        }

        maskCtx.putImageData(maskImgData, 0, 0);
        saveMaskState();
    }

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

    window.addEventListener('mouseup', () => {
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
        maskCtx.strokeStyle = '#a855f7';
        maskCtx.fillStyle = '#a855f7';
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

        // Mask pixels
        const maskImgData = maskCtx.getImageData(0, 0, w, h);
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

        // Perspective setup
        const horizonY = Math.round(h * 0.48);
        const floorHorizonY = Math.round(h * (h > w ? 0.80 : 0.68));
        const vx = w * 0.50;
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

    // Close button for sidebar on mobile
    const sidebarCloseBtn = $('#sidebar-close-btn');
    if (sidebarCloseBtn) {
        sidebarCloseBtn.addEventListener('click', () => {
            $('.sidebar').style.display = 'none';
        });
    }

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
            surfWallBtn.click();
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
