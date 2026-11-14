/**
 * Tile Detection and Visualization Engine
 * Core Interactive Client Engine & High-Fidelity 3D Perspective Tile Renderer
 * Inspired directly by Tile-Detection-and-Visualization-Engine-main
 */

(function () {
    'use strict';

    // DOM Elements
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => Array.from(document.querySelectorAll(sel));

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
    const groutSwatches   = $$('.grout-swatch');
    const sizeChips       = $$('.size-chip');
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
    const modeBrushBtn    = $('#mode-brush-btn');
    const modeEraserBtn   = $('#mode-eraser-btn');
    const btnQuickProtect = $('#btn-quick-protect-fixtures');
    const btnQuickSelectAll = $('#btn-quick-select-all');

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
    let activeRoomUrl = '/hero/wide_living.jpg';
    let activeRoomName = 'Modern Salon';

    let tileImageEl = null;
    let roomImageEl = null;
    let roomFgImageEl = null;
    let surfaceTypeMap = null; // Uint8Array: 0=none, 1=floor, 2=back_wall, 3=left_wall, 4=right_wall
    let floorRefLum = 0.55;
    let wallRefLum = 0.65;
    const aiSegmentCache = new Map();

    // Calibrated Room Geometries & Exact Surface Polygons (0-100% coordinates)
    const ROOM_PRESETS = {
        'wide_living': {
            floorY: 0.618,
            ceilingY: 0.08,
            horizonY: 0.56,
            vanishingX: 0.45,
            vanishingY: 0.56,
            fgUrl: null,
            isBathroom: false,
            defaultSurface: 'floor',
            floor: {
                polygon: [[0, 74.5], [9.0, 69.5], [24.8, 61.8], [83.4, 61.8], [87.5, 63.0], [95.2, 65.0], [100, 66.5], [100, 100], [0, 100]],
                exclude: [
                    [[26.5, 56.5], [29.8, 56.5], [29.8, 63.5], [26.5, 63.5]],
                    [[25.0, 71.0], [28.2, 67.5], [28.2, 53.0], [65.5, 53.0], [65.5, 62.5], [75.8, 55.0], [77.8, 71.0]],
                    [[95.0, 50.0], [100, 50.0], [100, 67.5], [95.0, 65.5]]
                ]
            },
            walls: [
                {
                    name: 'right_pillar',
                    type: 'back_wall',
                    polygon: [[83.4, 25.5], [87.5, 25.5], [87.5, 63.0], [83.4, 61.8]],
                    exclude: []
                }
            ]
        },
        'wide_kitchen': {
            floorY: 0.63,
            ceilingY: 0.12,
            horizonY: 0.52,
            vanishingX: 0.48,
            vanishingY: 0.52,
            fgUrl: null,
            isBathroom: false,
            defaultSurface: 'floor',
            floor: {
                polygon: [[0, 75.2], [20.0, 64.0], [21.8, 63.0], [66.5, 63.0], [71.5, 60.5], [74.2, 60.5], [79.5, 62.8], [84.5, 66.0], [100, 76.5], [100, 100], [0, 100]],
                exclude: [
                    [[21.8, 48.0], [66.5, 48.0], [66.5, 73.2], [21.8, 73.2]]
                ]
            },
            walls: [
                {
                    name: 'backsplash',
                    type: 'back_wall',
                    polygon: [[35.0, 31.3], [58.8, 31.3], [58.8, 45.8], [35.0, 45.8]],
                    exclude: [
                        [[36.0, 36.8], [41.5, 36.8], [41.5, 45.8], [36.0, 45.8]],
                        [[44.8, 40.5], [49.8, 40.5], [49.8, 45.8], [44.8, 45.8]],
                        [[53.8, 34.5], [58.8, 34.5], [58.8, 45.8], [53.8, 45.8]]
                    ]
                }
            ]
        },
        'wide_terrace': {
            floorY: 0.582,
            ceilingY: 0.18,
            horizonY: 0.52,
            vanishingX: 0.50,
            vanishingY: 0.52,
            fgUrl: null,
            isBathroom: false,
            defaultSurface: 'floor',
            floor: {
                polygon: [[0, 68.5], [12.0, 64.5], [27.5, 58.2], [72.5, 58.2], [85.5, 62.5], [100, 69.0], [100, 100], [0, 100]],
                exclude: [
                    [[11.8, 60.5], [16.0, 60.5], [16.0, 66.5], [11.8, 66.5]],
                    [[14.8, 51.5], [26.6, 51.5], [26.6, 66.2], [17.0, 66.2], [14.8, 61.5]],
                    [[25.8, 55.5], [32.2, 55.5], [32.2, 61.5], [25.8, 61.5]],
                    [[29.6, 50.5], [35.5, 50.5], [35.5, 59.5], [29.6, 59.5]],
                    [[36.3, 25.0], [37.6, 25.0], [37.6, 61.0], [36.3, 61.0]],
                    [[62.8, 25.0], [64.1, 25.0], [64.1, 61.0], [62.8, 61.0]],
                    [[66.8, 50.5], [71.8, 50.5], [71.8, 59.8], [66.8, 59.8]],
                    [[69.5, 56.0], [76.5, 56.0], [76.5, 62.5], [69.5, 62.5]],
                    [[75.5, 51.2], [88.2, 51.2], [88.2, 63.5], [75.5, 62.0]],
                    [[85.5, 58.5], [91.5, 58.5], [91.5, 67.2], [85.5, 67.2]]
                ]
            },
            walls: [
                {
                    name: 'right_wall',
                    type: 'right_wall',
                    polygon: [[91.5, 21.5], [100, 18.0], [100, 69.0], [91.5, 64.5]],
                    exclude: []
                }
            ]
        },
        'wide_bathroom': {
            floorY: 0.862,
            ceilingY: 0.095,
            horizonY: 0.56,
            vanishingX: 0.48,
            vanishingY: 0.56,
            fgUrl: null,
            isBathroom: true,
            defaultSurface: 'both',
            floor: {
                polygon: [[27.8, 89.0], [36.5, 89.0], [40.0, 86.2], [59.5, 86.2], [59.5, 100], [27.8, 100]],
                exclude: [
                    [[52.5, 76.5], [59.8, 76.5], [59.8, 99.0], [54.0, 99.0], [52.5, 85.0]]
                ]
            },
            walls: [
                {
                    name: 'shower_back_wall',
                    type: 'back_wall',
                    polygon: [[5.0, 10.5], [39.8, 10.5], [39.8, 86.2], [5.0, 89.0]],
                    exclude: [
                        [[5.0, 21.0], [19.8, 25.0], [19.8, 56.5], [5.0, 62.0]],
                        [[4.5, 80.5], [28.2, 85.5], [28.2, 100], [4.5, 100]],
                        [[8.8, 11.8], [21.5, 11.8], [21.5, 19.2], [8.8, 19.2]]
                    ]
                },
                {
                    name: 'back_wall',
                    type: 'back_wall',
                    polygon: [[39.8, 9.5], [65.2, 12.0], [65.2, 86.2], [39.8, 86.2]],
                    exclude: [
                        [[42.8, 47.5], [51.0, 47.5], [51.0, 72.5], [42.8, 72.5]],
                        [[53.0, 65.2], [56.0, 65.2], [56.0, 71.2], [53.0, 71.2]],
                        [[52.5, 76.5], [59.8, 76.5], [59.8, 86.2], [52.5, 86.2]],
                        [[58.5, 65.0], [65.2, 65.0], [65.2, 86.2], [58.5, 86.2]]
                    ]
                },
                {
                    name: 'right_wall',
                    type: 'right_wall',
                    polygon: [[65.2, 12.0], [100, 0], [100, 64.0], [65.2, 65.0]],
                    exclude: [
                        [[73.0, 0], [100, 0], [100, 61.5], [73.0, 60.5]],
                        [[80.0, 24.0], [100, 24.0], [100, 78.0], [80.0, 78.0]],
                        [[64.2, 28.0], [71.2, 28.0], [71.2, 50.0], [64.2, 50.0]]
                    ]
                }
            ]
        },
        'wide_luxury_bathroom': {
            floorY: 0.89,
            ceilingY: 0.05,
            horizonY: 0.50,
            vanishingX: 0.62,
            vanishingY: 0.50,
            fgUrl: null,
            isBathroom: true,
            defaultSurface: 'both',
            floor: {
                polygon: [[34.0, 91.5], [43.5, 89.0], [56.5, 100], [33.5, 100]],
                exclude: []
            },
            walls: [
                {
                    name: 'left_wall',
                    type: 'left_wall',
                    polygon: [[0, 0], [58.0, 18.0], [58.0, 72.0], [43.5, 89.0], [34.0, 91.5], [0, 100]],
                    exclude: [
                        [[5.2, 46.5], [17.2, 46.5], [17.2, 58.2], [5.2, 58.2]],
                        [[26.5, 0], [31.5, 0], [31.5, 58.0], [26.5, 58.0]],
                        [[46.5, 65.5], [51.0, 65.5], [51.0, 80.5], [46.5, 80.5]],
                        [[43.5, 69.5], [58.0, 69.5], [58.0, 100], [43.5, 89.0]]
                    ]
                },
                {
                    name: 'right_wall',
                    type: 'right_wall',
                    polygon: [[90.5, 0], [100, 0], [100, 100], [90.5, 77.5]],
                    exclude: []
                }
            ]
        },
        'easy_bathroom': {
            floorY: 0.71,
            ceilingY: 0.198,
            horizonY: 0.50,
            vanishingX: 0.50,
            vanishingY: 0.50,
            fgUrl: null,
            isBathroom: true,
            defaultSurface: 'both',
            floor: {
                polygon: [[0, 85.2], [13.8, 75.5], [19.8, 71.0], [69.8, 71.0], [76.5, 74.5], [91.0, 74.5], [100, 74.5], [100, 100], [0, 100]],
                exclude: []
            },
            walls: [
                {
                    name: 'back_wall_main',
                    type: 'back_wall',
                    polygon: [[31.5, 19.8], [69.8, 19.8], [69.8, 71.0], [31.5, 71.0]],
                    exclude: [
                        [[40.2, 25.0], [59.8, 25.0], [59.8, 49.8], [40.2, 49.8]],
                        [[48.2, 50.2], [51.8, 50.2], [51.8, 54.6], [48.2, 54.6]],
                        [[30.5, 54.5], [69.5, 54.5], [69.5, 68.2], [30.5, 68.2]],
                        [[36.0, 32.0], [38.0, 32.0], [38.0, 44.0], [36.0, 44.0]],
                        [[62.0, 32.0], [64.0, 32.0], [64.0, 44.0], [62.0, 44.0]]
                    ]
                },
                {
                    name: 'shower_back_wall',
                    type: 'back_wall',
                    polygon: [[69.8, 19.8], [91.0, 19.8], [91.0, 74.5], [69.8, 74.5]],
                    exclude: [
                        [[79.8, 24.0], [87.5, 24.0], [87.5, 29.0], [79.8, 29.0]]
                    ]
                },
                {
                    name: 'shower_right_wall',
                    type: 'right_wall',
                    polygon: [[91.0, 19.8], [100, 11.0], [100, 74.5], [91.0, 74.5]],
                    exclude: []
                }
            ]
        },
        'luxury_bathroom': {
            floorY: 0.72,
            ceilingY: 0.04,
            horizonY: 0.56,
            vanishingX: 0.48,
            vanishingY: 0.56,
            fgUrl: null,
            isBathroom: true,
            defaultSurface: 'both',
            floor: {
                polygon: [[0, 88.5], [18.5, 81.5], [48.0, 72.5], [83.8, 69.0], [100, 69.0], [100, 100], [0, 100]],
                exclude: [
                    [[15.8, 63.0], [49.8, 63.0], [49.8, 92.0], [35.0, 96.5], [21.0, 96.5], [15.8, 86.0]],
                    [[4.5, 71.0], [28.5, 71.0], [28.5, 100], [4.5, 100]],
                    [[51.5, 80.0], [80.0, 80.0], [94.5, 100], [50.8, 100]]
                ]
            },
            walls: [
                {
                    name: 'left_wall',
                    type: 'left_wall',
                    polygon: [[0, 0], [23.0, 0], [23.0, 81.5], [0, 88.5]],
                    exclude: [
                        [[0, 1.0], [18.0, 8.5], [18.0, 68.5], [0, 69.5]],
                        [[0, 56.0], [7.0, 56.0], [7.0, 85.0], [0, 85.0]]
                    ]
                },
                {
                    name: 'back_wall',
                    type: 'back_wall',
                    polygon: [[23.0, 0], [100, 14.0], [100, 69.0], [23.0, 74.5]],
                    exclude: [
                        [[33.2, 20.0], [71.5, 25.0], [71.5, 48.8], [33.2, 48.8]],
                        [[45.2, 50.0], [83.8, 52.0], [83.8, 70.0], [45.2, 74.0]],
                        [[15.8, 63.0], [49.8, 63.0], [49.8, 92.0], [15.8, 88.0]],
                        [[89.5, 50.0], [97.0, 50.0], [97.0, 63.0], [89.5, 63.0]]
                    ]
                }
            ]
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
            ceilingY: isBathroom ? 0.04 : 0.06,
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
        Array.isArray(sizeChips) && sizeChips.forEach((chip) => {
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
    Array.isArray(groutSwatches) && groutSwatches.forEach((swatch) => {
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
            tileDetailsNote.textContent = name;

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
            if (!conf.floor && !aiSegmentCache.has(url)) {
                await segmentRoomWithAI(roomImageEl, url);
            }
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

    // Rasterize 0-100% polygons + exclusions to an anti-aliased alpha mask using 2D Canvas
    function rasterizePolygonLayer(w, h, items) {
        const c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        const ctx = c.getContext('2d');
        ctx.clearRect(0, 0, w, h);

        for (const item of items) {
            if (!item || !Array.isArray(item.polygon) || item.polygon.length < 3) continue;
            ctx.save();
            ctx.globalCompositeOperation = 'source-over';
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            item.polygon.forEach(([px, py], idx) => {
                const x = (px / 100) * w;
                const y = (py / 100) * h;
                if (idx === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.closePath();
            ctx.fill();

            if (Array.isArray(item.exclude) && item.exclude.length > 0) {
                ctx.globalCompositeOperation = 'destination-out';
                for (const exPoly of item.exclude) {
                    if (!Array.isArray(exPoly) || exPoly.length < 3) continue;
                    ctx.beginPath();
                    exPoly.forEach(([px, py], idx) => {
                        const x = (px / 100) * w;
                        const y = (py / 100) * h;
                        if (idx === 0) ctx.moveTo(x, y);
                        else ctx.lineTo(x, y);
                    });
                    ctx.closePath();
                    ctx.fill();
                }
            }
            ctx.restore();
        }

        const data = ctx.getImageData(0, 0, w, h).data;
        const alpha = new Uint8ClampedArray(w * h);
        for (let i = 0; i < w * h; i++) {
            alpha[i] = data[i * 4 + 3];
        }
        return alpha;
    }

    // Call /api/ai/segment for user-uploaded photos
    async function segmentRoomWithAI(imgEl, cacheKey) {
        try {
            const maxDim = 1024;
            let sw = imgEl.naturalWidth || imgEl.width;
            let sh = imgEl.naturalHeight || imgEl.height;
            if (sw > maxDim || sh > maxDim) {
                const r = maxDim / Math.max(sw, sh);
                sw = Math.round(sw * r);
                sh = Math.round(sh * r);
            }
            const sc = document.createElement('canvas');
            sc.width = sw;
            sc.height = sh;
            sc.getContext('2d').drawImage(imgEl, 0, 0, sw, sh);
            const dataUrl = sc.toDataURL('image/jpeg', 0.85);

            const res = await fetch('/api/ai/segment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: dataUrl, target: 'both' })
            });
            if (!res.ok) return null;
            const json = await res.json();
            if (json && json.success && json.floor) {
                aiSegmentCache.set(cacheKey, json);
                return json;
            }
        } catch (err) {
            console.warn('AI segmentation unavailable, using fallback geometry:', err);
        }
        return null;
    }

    function inferWallType(wall) {
        if (wall.type === 'left_wall') return 3;
        if (wall.type === 'right_wall') return 4;
        if (wall.type === 'back_wall') return 2;
        const n = (wall.name || '').toLowerCase();
        if (n.includes('left') || n.includes('sol')) return 3;
        if (n.includes('right') || n.includes('sag') || n.includes('sağ')) return 4;
        return 2;
    }

    // Intelligent Mask Generation (Exact calibrated/AI polygons + surface-median luminance)
    function generateAutoMask() {
        if (!roomImageEl) return;
        const w = maskCanvas.width;
        const h = maskCanvas.height;

        maskCtx.clearRect(0, 0, w, h);

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = w;
        tempCanvas.height = h;
        const tCtx = tempCanvas.getContext('2d');
        tCtx.drawImage(roomImageEl, 0, 0, w, h);
        const rgbData = tCtx.getImageData(0, 0, w, h).data;

        const conf = getRoomConfig(activeRoomUrl, w, h, activeRoomName);
        const segSource = conf.floor ? conf : aiSegmentCache.get(activeRoomUrl);

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

        surfaceTypeMap = new Uint8Array(w * h);

        if (segSource && segSource.floor && Array.isArray(segSource.floor.polygon)) {
            const floorAlpha = rasterizePolygonLayer(w, h, [segSource.floor]);
            const wallAlpha = new Uint8ClampedArray(w * h);
            const wallTypes = new Uint8Array(w * h);

            if (Array.isArray(segSource.walls)) {
                for (const wall of segSource.walls) {
                    const wa = rasterizePolygonLayer(w, h, [wall]);
                    const wt = inferWallType(wall);
                    for (let i = 0; i < w * h; i++) {
                        if (wa[i] > wallAlpha[i]) {
                            wallAlpha[i] = wa[i];
                            wallTypes[i] = wt;
                        }
                    }
                }
            }

            const floorHist = new Uint32Array(64);
            const wallHist = new Uint32Array(64);
            let floorCount = 0;
            let wallCount = 0;

            for (let i = 0; i < w * h; i++) {
                const idx = i * 4;
                const r = rgbData[idx];
                const g = rgbData[idx + 1];
                const b = rgbData[idx + 2];
                const fA = floorAlpha[i];
                const wA = fA > 128 ? 0 : wallAlpha[i];

                if (fA > 10) {
                    surfaceTypeMap[i] = 1;
                    fPx[idx] = 255; fPx[idx + 1] = 255; fPx[idx + 2] = 255; fPx[idx + 3] = fA;
                    ovPx[idx] = Math.min(255, Math.round(r * 0.45 + 16 * 0.55));
                    ovPx[idx + 1] = Math.min(255, Math.round(g * 0.45 + 185 * 0.55));
                    ovPx[idx + 2] = Math.min(255, Math.round(b * 0.45 + 129 * 0.55));
                    ovPx[idx + 3] = 255;

                    if (fA > 200) {
                        const lum = r * 0.299 + g * 0.587 + b * 0.114;
                        floorHist[Math.min(63, Math.floor(lum / 4))]++;
                        floorCount++;
                    }
                } else if (wA > 10) {
                    surfaceTypeMap[i] = wallTypes[i] || 2;
                    wPx[idx] = 255; wPx[idx + 1] = 255; wPx[idx + 2] = 255; wPx[idx + 3] = wA;
                    ovPx[idx] = Math.min(255, Math.round(r * 0.45 + 99 * 0.55));
                    ovPx[idx + 1] = Math.min(255, Math.round(g * 0.45 + 102 * 0.55));
                    ovPx[idx + 2] = Math.min(255, Math.round(b * 0.45 + 241 * 0.55));
                    ovPx[idx + 3] = 255;

                    if (wA > 200) {
                        const lum = r * 0.299 + g * 0.587 + b * 0.114;
                        wallHist[Math.min(63, Math.floor(lum / 4))]++;
                        wallCount++;
                    }
                } else {
                    prPx[idx] = 255; prPx[idx + 1] = 68; prPx[idx + 2] = 68; prPx[idx + 3] = 255;
                    ovPx[idx] = Math.min(255, Math.round(r * 0.45 + 239 * 0.55));
                    ovPx[idx + 1] = Math.min(255, Math.round(g * 0.45 + 68 * 0.55));
                    ovPx[idx + 2] = Math.min(255, Math.round(b * 0.45 + 68 * 0.55));
                    ovPx[idx + 3] = 255;
                }

                const targetAlpha = activeSurface === 'floor' ? fA :
                                    activeSurface === 'wall' ? wA :
                                    Math.max(fA, wA);
                if (targetAlpha > 10) {
                    mPx[idx] = 179; mPx[idx + 1] = 142; mPx[idx + 2] = 71; mPx[idx + 3] = targetAlpha;
                }
            }

            const getPercentileLum = (hist, count, pct) => {
                if (count === 0) return 0.58;
                const target = Math.floor(count * pct);
                let acc = 0;
                for (let b = 0; b < 64; b++) {
                    acc += hist[b];
                    if (acc >= target) return Math.max(0.18, Math.min(0.88, (b * 4 + 2) / 255.0));
                }
                return 0.58;
            };
            floorRefLum = getPercentileLum(floorHist, floorCount, 0.58);
            wallRefLum  = getPercentileLum(wallHist, wallCount, 0.58);

            cachedMasks.active    = activeImgData;
            cachedMasks.wall      = wallImgData;
            cachedMasks.floor     = floorImgData;
            cachedMasks.protected = protImgData;
            cachedMasks.overlay   = overlayImgData;

            renderCurrentLayerToCanvas();
            saveMaskState();
            return;
        }

        const floorY = Math.round(h * conf.floorY);
        const ceilingY = Math.round(h * conf.ceilingY);
        const isLuxuryBathroom = (activeRoomUrl || '').includes('luxury_bathroom') || (activeRoomName || '').toLowerCase().includes('lüks');
        const isEasyBathroom = (activeRoomUrl || '').includes('easy_bathroom') || (activeRoomName || '').toLowerCase().includes('modern');

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

                // 1. Ceiling protection (only top ceiling drywall)
                if (y < ceilingY) {
                    isProtected = true;
                }

                // 2. Plants / Foliage protection (pure green chromaticity)
                if ((g > r + 15 && g > b + 15) || (2 * g - r - b > 25 && g > 40)) {
                    isProtected = true;
                }

                // 3. Plant / Foliage protection (pure green leaves)
                if ((g > r + 20 && g > b + 20) || (2 * g - r - b > 35 && g > 50)) {
                    isProtected = true;
                }

                // 4. Small black metal fixtures (faucets, small shower heads)
                if (lum < 20 && chroma < 12 && y >= Math.round(h * 0.15) && y <= Math.round(h * 0.60)) {
                    isProtected = true;
                }

                // 6. Calibrated protection for stock presets
                if (isLuxuryBathroom) {
                    // Suspended Toilet Bowl (klozet)
                    if (x >= Math.round(w * 0.09) && x <= Math.round(w * 0.28) && y >= Math.round(h * 0.65) && y <= Math.round(h * 0.90)) {
                        isProtected = true;
                    }
                    // Flush actuator plate above toilet
                    else if (x >= Math.round(w * 0.14) && x <= Math.round(w * 0.24) && y >= Math.round(h * 0.49) && y <= Math.round(h * 0.58)) {
                        isProtected = true;
                    }
                    // Toilet brush & paper holder
                    else if (x >= Math.round(w * 0.27) && x <= Math.round(w * 0.38) && y >= Math.round(h * 0.62) && y <= Math.round(h * 0.88)) {
                        isProtected = true;
                    }
                    // Shelf decorative items & perfume bottles inside niche
                    else if (x >= Math.round(w * 0.08) && x <= Math.round(w * 0.35) && y >= Math.round(h * 0.35) && y <= Math.round(h * 0.44)) {
                        isProtected = true;
                    }
                    // Upper beige cabinets
                    else if (x >= Math.round(w * 0.36) && x <= Math.round(w * 0.53) && y >= Math.round(h * 0.04) && y <= Math.round(h * 0.31)) {
                        isProtected = true;
                    }
                    // Floating Vanity Cabinet & Drawers (banyo dolabı ahşap gövde)
                    else if (x >= Math.round(w * 0.44) && x <= Math.round(w * 0.93) && y >= Math.round(h * 0.67) && y <= Math.round(h * 0.90)) {
                        isProtected = true;
                    }
                    // Vanity countertop & stone sink basin (tezgah & lavabo)
                    else if (x >= Math.round(w * 0.41) && x <= Math.round(w * 0.94) && y >= Math.round(h * 0.57) && y <= Math.round(h * 0.68)) {
                        isProtected = true;
                    }
                    // Faucet, toiletries & plant on countertop
                    else if (x >= Math.round(w * 0.63) && x <= Math.round(w * 0.88) && y >= Math.round(h * 0.47) && y <= Math.round(h * 0.58)) {
                        isProtected = true;
                    }
                    // Circular illuminated mirror (ayna)
                    else if (Math.pow((x - w * 0.686) / (w * 0.198), 2) + Math.pow((y - h * 0.325) / (h * 0.198), 2) <= 1.0) {
                        isProtected = true;
                    }
                    // Vertical wood slats on far right
                    else if (x >= Math.round(w * 0.89) && y <= Math.round(h * 0.92)) {
                        isProtected = true;
                    }
                    // Black shower head & bracket
                    else if (x >= Math.round(w * 0.22) && x <= Math.round(w * 0.33) && y >= Math.round(h * 0.11) && y <= Math.round(h * 0.22)) {
                        isProtected = true;
                    }
                    // Blinds on far left
                    else if (x <= Math.round(w * 0.10)) {
                        isProtected = true;
                    }
                } else if (isEasyBathroom) {
                    // 1. Far left wood door casing / trim
                    if (x <= Math.round(w * 0.08)) {
                        isProtected = true;
                    }
                    // 2. Suspended Toilet Bowl (klozet gövdesi)
                    else if (x >= Math.round(w * 0.11) && x <= Math.round(w * 0.32) && y >= Math.round(h * 0.56) && y <= Math.round(h * 0.94)) {
                        isProtected = true;
                    }
                    // 3. Toilet actuator flush plate (gömme rezervuar kumanda paneli)
                    else if (x >= Math.round(w * 0.18) && x <= Math.round(w * 0.26) && y >= Math.round(h * 0.45) && y <= Math.round(h * 0.54)) {
                        isProtected = true;
                    }
                    // 4. Mirror above vanity (ayna)
                    else if (x >= Math.round(w * 0.39) && x <= Math.round(w * 0.62) && y >= Math.round(h * 0.20) && y <= Math.round(h * 0.49)) {
                        isProtected = true;
                    }
                    // 5. Vessel sink & faucet (lavabo haznesi ve batarya)
                    else if (x >= Math.round(w * 0.41) && x <= Math.round(w * 0.60) && y >= Math.round(h * 0.47) && y <= Math.round(h * 0.56)) {
                        isProtected = true;
                    }
                    // 6. Vanity countertop & wooden drawers (banyo dolabı ahşap gövdesi ve çekmeceleri)
                    else if (x >= Math.round(w * 0.31) && x <= Math.round(w * 0.70) && y >= Math.round(h * 0.55) && y <= Math.round(h * 0.74)) {
                        isProtected = true;
                    }
                    // Shower cabin wall and floor are explicitly NOT protected so tiles flow seamlessly behind glass!
                }

                if (isProtected) {
                    // Protected Mask: White (255)
                    prPx[idx]     = 255;
                    prPx[idx + 1] = 255;
                    prPx[idx + 2] = 255;
                    prPx[idx + 3] = 255;

                    // Decision Overlay: Red tint
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

                        // Decision Overlay: Green tint
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

                        // Decision Overlay: Blue tint
                        ovPx[idx]     = Math.min(255, Math.round(r * 0.45 + 99  * 0.55));
                        ovPx[idx + 1] = Math.min(255, Math.round(g * 0.45 + 102 * 0.55));
                        ovPx[idx + 2] = Math.min(255, Math.round(b * 0.45 + 241 * 0.55));
                        ovPx[idx + 3] = 255;
                    }

                    // Active Target Mask (Gold)
                    const isTarget = (activeSurface === 'floor' && isFloorZone) ||
                                     (activeSurface === 'wall' && isWallZone) ||
                                     (activeSurface === 'both' && (isFloorZone || isWallZone));

                    if (isTarget) {
                        mPx[idx]     = 179;
                        mPx[idx + 1] = 142;
                        mPx[idx + 2] = 71;
                        mPx[idx + 3] = 255;
                    }
                }
            }
        }

        // Cache generated layers
        cachedMasks.active    = activeImgData;
        cachedMasks.wall      = wallImgData;
        cachedMasks.floor     = floorImgData;
        cachedMasks.protected = protImgData;
        cachedMasks.overlay   = overlayImgData;

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
            executeVisualization(true);
        }
    });

    window.addEventListener('touchend', () => {
        if (isDrawing) {
            isDrawing = false;
            lastPoint = null;
            saveMaskState();
            executeVisualization(true);
        }
    });

    // Brush Mode Buttons
    if (modeBrushBtn && modeEraserBtn) {
        modeBrushBtn.addEventListener('click', () => {
            currentBrushMode = 'paint';
            modeBrushBtn.classList.add('active');
            modeEraserBtn.classList.remove('active');
            if (brushCursor) {
                brushCursor.style.borderColor = 'rgba(179, 142, 71, 0.9)';
                brushCursor.style.background = 'rgba(179, 142, 71, 0.25)';
            }
        });

        modeEraserBtn.addEventListener('click', () => {
            currentBrushMode = 'erase';
            modeEraserBtn.classList.add('active');
            modeBrushBtn.classList.remove('active');
            if (brushCursor) {
                brushCursor.style.borderColor = '#ef4444';
                brushCursor.style.background = 'rgba(239, 68, 68, 0.25)';
            }
        });
    }

    // Quick Action: Auto-Protect Fixtures
    if (btnQuickProtect) {
        btnQuickProtect.addEventListener('click', () => {
            generateAutoMask();
            drawMaskViewport();
            showToast('Klozet, banyo dolabı ve ayna korumaya alındı!', 'success');
            executeVisualization(true);
        });
    }

    // Quick Action: Select All Wall & Floor
    if (btnQuickSelectAll) {
        btnQuickSelectAll.addEventListener('click', () => {
            const w = maskCanvas.width;
            const h = maskCanvas.height;
            maskCtx.fillStyle = '#b38e47';
            maskCtx.fillRect(0, 0, w, h);
            saveMaskState();
            drawMaskViewport();
            showToast('Tüm alan seramik için seçildi.', 'info');
            executeVisualization(true);
        });
    }

    let currentBrushMode = 'paint'; // 'paint' | 'erase'

    function drawBrushStroke(from, to) {
        if (!from || !to) return;
        const sz = parseInt(brushSizeSlider.value, 10);
        maskCtx.save();
        if (currentBrushMode === 'erase') {
            maskCtx.globalCompositeOperation = 'destination-out';
            maskCtx.strokeStyle = 'rgba(0,0,0,1)';
            maskCtx.fillStyle = 'rgba(0,0,0,1)';
        } else {
            maskCtx.globalCompositeOperation = 'source-over';
            maskCtx.strokeStyle = '#b38e47';
            maskCtx.fillStyle = '#b38e47';
        }
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

        // Camera and Metric focal scaling for Floor & Side Walls
        // In realistic interior room photography, bottom width represents ~340cm on wide 16:9 or ~260cm on square
        const roomSpanCm = (w / h) > 1.35 ? 360.0 : 260.0;
        const camHeightCm = 145.0; // Human standing eye-level
        const focalMetricY = (h - vy) * 1.85;
        const focalMetricX = (w / roomSpanCm) * focalMetricY;
        const backWallScale = roomSpanCm / w;
        const halfSpanCm = roomSpanCm * 0.5;
        const sideWallK = focalMetricY * halfSpanCm; // depth constant along side wall
        const sideWallHScale = halfSpanCm;           // vertical scale matching 1-point perspective rays

        // Grout & Bevel physical dimensions in centimeters
        const gHalfCm = Math.max(0.06, gw / 20.0); // e.g. 2mm -> 0.1cm half-width
        const bevelWidthCm = gHalfCm + 0.16;      // 1.6mm tactile bevel transition

        const outImgData = rCtx.createImageData(w, h);
        const outBuf = new Uint32Array(outImgData.data.buffer);
        const roomBuf = new Uint32Array(roomPx.buffer);
        const wallH = Math.max(1, floorHorizonY - ceilingY);

        for (let y = 0; y < h; y++) {
            const rowOffset = y * w;
            const rowByteOffset = rowOffset * 4;
            const dy = y - vy;

            // Pre-calculate per-row perspective depths for floor and back wall
            const absDyFloor = Math.max(1.0, dy);
            const zFloorCm = (focalMetricY * camHeightCm) / absDyFloor;
            const uFloorScale = zFloorCm / focalMetricX;
            const vCoordBase = zFloorCm;
            const yWallCm = (floorHorizonY - y) * (250.0 / wallH);

            for (let x = 0; x < w; x++) {
                const pxIdx = rowOffset + x;
                const byteIdx = rowByteOffset + x * 4;
                const maskAlpha = maskPx[byteIdx + 3];

                if (maskAlpha < 10) {
                    outBuf[pxIdx] = roomBuf[pxIdx];
                    continue;
                }

                const sType = surfaceTypeMap ? surfaceTypeMap[pxIdx] : (y >= floorHorizonY ? 1 : 2);
                const isFloorPlane = (sType === 1) || (sType === 0 && y >= floorHorizonY);

                let uMetric = 0;
                let vMetric = 0;

                if (isFloorPlane) {
                    uMetric = (x - vx) * uFloorScale;
                    vMetric = vCoordBase;
                } else if (sType === 3) {
                    // Left Wall receding toward vanishing point (vx, vy)
                    const dx = Math.max(8.0, vx - x);
                    uMetric = sideWallK / dx;
                    vMetric = ((vy - y) / dx) * sideWallHScale + 145.0;
                } else if (sType === 4) {
                    // Right Wall receding toward vanishing point (vx, vy)
                    const dx = Math.max(8.0, x - vx);
                    uMetric = sideWallK / dx;
                    vMetric = ((vy - y) / dx) * sideWallHScale + 145.0;
                } else {
                    // Fronto-parallel Back Wall
                    uMetric = (x - vx) * backWallScale;
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
                    depthFactor = 1.0 - (depthDist * 0.08);
                }

                // 2. Surface-median luminance normalization (preserves shadows & highlights for both dark & light tiles)
                const refLum = isFloorPlane ? floorRefLum : wallRefLum;
                const relLight = Math.min(1.35, Math.max(0.32, roomLum / Math.max(0.15, refLum)));
                const shadowFactor = Math.min(1.22, Math.max(0.38, (0.28 + 0.72 * Math.pow(relLight, 0.85)) * depthFactor));

                // 3. Ambient bounce light color tinting (subtle 6% room ambient warmth/coolness)
                const lumClamp = Math.max(0.12, roomLum * 255.0);
                const tintR = 0.94 + 0.06 * (rR / lumClamp);
                const tintG = 0.94 + 0.06 * (rG / lumClamp);
                const tintB = 0.94 + 0.06 * (rB / lumClamp);

                let shadedR = Math.min(255, tR * shadowFactor * tintR);
                let shadedG = Math.min(255, tG * shadowFactor * tintG);
                let shadedB = Math.min(255, tB * shadowFactor * tintB);

                // 4. Specular Glaze Highlights (relative to surface median so dark rooms don't lose gloss)
                if (finishType === 'glossy' && relLight > 1.08) {
                    const spec = Math.min(0.45, Math.pow((relLight - 1.08) / 0.45, 1.8) * 0.38);
                    shadedR = Math.min(255, shadedR + 255 * spec);
                    shadedG = Math.min(255, shadedG + 255 * spec);
                    shadedB = Math.min(255, shadedB + 255 * spec);
                } else if (finishType === 'satin' && relLight > 1.15) {
                    const spec = Math.min(0.20, Math.pow((relLight - 1.15) / 0.40, 1.6) * 0.16);
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
        if (!silent) showLoading('Seramik mekâna döşeniyor…');

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

            setSliderSplit(0);
            window.dispatchEvent(new CustomEvent('tileengine:rendered', { detail: { url: resultBlobUrl } }));
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
        showLoading('Mekân hazırlanıyor…');
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
        const initialRoomUrl = roomParam || '/hero/wide_living.jpg';
        const initialRoomName = roomParam ? 'Seçilen Mekân' : 'Modern Salon';

        await Promise.allSettled([
            loadTile(initialTileUrl, initialTileName),
            loadRoom(initialRoomUrl, initialRoomName)
        ]);

        drawMaskViewport();

        // AUTOMATIC PERSPECTIVE TILE LAYING ON INITIAL LOAD ("seramikleri döşesin")
        await executeVisualization(true);
        hideLoading();
    }

    // Public API for the Roomvo-style UI layer (roomvo-ui.js)
    window.TileEngine = {
        loadTile,
        loadRoom,
        execute: executeVisualization,
        switchSurface,
        showToast,
        showLoading,
        hideLoading,
        getState: () => ({
            surface: activeSurface,
            tileUrl: activeTileUrl,
            tileName: activeTileName,
            roomUrl: activeRoomUrl,
            roomName: activeRoomName,
            resultUrl: resultBlobUrl
        })
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFromUrlParams);
    } else {
        initFromUrlParams();
    }
})();
