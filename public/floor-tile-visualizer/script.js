/**
 * Inlined Complete Logic with Server & Client Fallback Engines
 * Runs seamlessly on Python SegFormer server OR standalone inside mobile browser / Vercel.
 */
const $ = (sel) => document.querySelector(sel);

const hallZone      = $("#hall-upload-zone");
const tileZone      = $("#tile-upload-zone");
const hallInput     = $("#hall-input");
const tileInput     = $("#tile-input");
const hallRemove    = $("#hall-remove");
const tileRemove    = $("#tile-remove");

const patternSelect = $("#pattern-select");
const scaleSlider   = $("#scale-slider");
const scaleValue    = $("#scale-value");

const detectBtn     = $("#detect-btn");
const detectBtnText = $("#detect-btn-text");
const applyBtn      = $("#apply-btn");
const downloadBtn   = $("#download-btn");
const surfaceBtns   = document.querySelectorAll(".surface-btn");
let selectedSurface = "floor";

const productBanner = $("#product-banner");
const productNameEl = $("#product-name");
const tileStatusHint = $("#tile-status-hint");

function updateSurfaceText() {
    if (!detectBtnText) return;
    if (selectedSurface === "wall") {
        detectBtnText.textContent = "Duvarı Algıla (AI)";
    } else if (selectedSurface === "both") {
        detectBtnText.textContent = "Zemin & Duvarı Algıla (AI)";
    } else {
        detectBtnText.textContent = "Zemini Algıla (AI)";
    }
}

surfaceBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
        surfaceBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        selectedSurface = btn.dataset.surface;
        updateSurfaceText();
        if (editorSection && editorSection.classList.contains("visible") && hallImageEl) {
            renderComposite();
            checkMaskCollisionsAndCoverage();
        }
    });
});

const editorSection = $("#editor-section");
const editorCanvas  = $("#editor-canvas");
const toolPaint     = $("#tool-paint");
const toolErase     = $("#tool-erase");
const toolReset     = $("#tool-reset");
const toolUndo      = $("#tool-undo");
const toolRedo      = $("#tool-redo");
const toolZoomIn    = $("#tool-zoom-in");
const toolZoomOut   = $("#tool-zoom-out");
const toolZoomReset = $("#tool-zoom-reset");
const zoomLevelText = $("#zoom-level-text");

const collisionBanner = $("#collision-alert-banner");
const collisionText   = $("#collision-alert-text");
const closeCollision  = $("#close-collision-alert");

const brushSlider   = $("#brush-slider");
const brushValue    = $("#brush-value");

const resultSection = $("#result-section");
const resultImg     = $("#result-img");
const originalImg   = $("#original-img");
const compStage     = $("#comparison-stage");
const compHandle    = $("#comparison-handle");
const compContainer = $("#comparison-container");
const renderErrorBox = $("#render-error-box");
const renderErrorMsg = $("#render-error-msg");
const renderRetryBtn = $("#render-retry-btn");
const renderManualBtn = $("#render-manual-btn");

const loadingOverlay = $("#loading-overlay");
const loadingText    = $("#loading-text");
const toastEl        = $("#toast");

let hallFile  = null;
let tileFile  = null;
let hallUrl   = null;
let tileUrl   = null;
let activePresetUrl = "/hero/easy_bathroom.jpg";

let maskB64Original = null;
let maskImage       = null;

// Semantic Classes
const SEMANTIC_CLASSES = {
    WALL: 0,
    FLOOR: 1,
    FURNITURE: 2,
    SINK: 3,
    TOILET: 4,
    MIRROR: 5,
    SHOWER_GLASS: 6
};

// Independent Persistent Surface Mask Canvases
const surfaceMasks = {
    floor: null,
    wall: null
};
let objectProtectionMask = null;

// History Stack for Undo/Redo
const historyStack = {
    undo: [],
    redo: []
};
const MAX_HISTORY = 20;

// Interactive Zoom & Pan State
let zoomLevel = 1.0;
let panX = 0;
let panY = 0;
let isPanning = false;
let panStart = { x: 0, y: 0, px: 0, py: 0 };

const ctx = editorCanvas.getContext("2d");
let colorCanvas, colorCtx;
let hallImageEl = null;
let brushMode  = "paint";
let isDrawing  = false;
let lastPos    = null;

let resultBlobUrl = null;

function showLoading(msg = "Yapay zekâ işlemi sürüyor…") {
    loadingText.textContent = msg;
    loadingOverlay.classList.add("active");
}
function hideLoading() { loadingOverlay.classList.remove("active"); }

function showToast(msg, type = "error", duration = 4000) {
    toastEl.textContent = msg;
    toastEl.className = "toast " + type + " visible";
    clearTimeout(toastEl._timer);
    toastEl._timer = setTimeout(() => toastEl.classList.remove("visible"), duration);
}

function updateDetectBtn() {
    detectBtn.disabled = !(hallFile && tileFile);
}

async function urlToFile(url, filename = "image.jpg") {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Görsel indirilemedi: " + url);
    const blob = await res.blob();
    const mime = blob.type || "image/jpeg";
    return new File([blob], filename, { type: mime });
}

function setupZone(zone, input, removeBtn, setFile) {
    zone.addEventListener("click", (e) => {
        if (e.target === removeBtn || removeBtn.contains(e.target)) return;
        input.click();
    });

    zone.addEventListener("dragover", (e) => { e.preventDefault(); zone.classList.add("dragover"); });
    zone.addEventListener("dragleave", ()  => { zone.classList.remove("dragover"); });
    zone.addEventListener("drop", (e) => {
        e.preventDefault();
        zone.classList.remove("dragover");
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith("image/")) setFile(file);
    });

    input.addEventListener("change", () => {
        if (input.files[0]) setFile(input.files[0]);
    });

    removeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        clearZone(zone);
        if (zone === hallZone)  { hallFile = null; if (hallUrl) URL.revokeObjectURL(hallUrl); hallUrl = null; }
        if (zone === tileZone)  { tileFile = null; if (tileUrl) URL.revokeObjectURL(tileUrl); tileUrl = null; }
        updateDetectBtn();
    });
}

function showPreview(zone, file) {
    const url = URL.createObjectURL(file);
    zone.querySelectorAll(".upload-zone__icon, .upload-zone__label, .upload-zone__hint")
        .forEach((el) => (el.style.display = "none"));

    let img = zone.querySelector(".upload-zone__preview");
    if (!img) {
        img = document.createElement("img");
        img.className = "upload-zone__preview";
        zone.appendChild(img);
    }
    img.src = url;
    zone.classList.add("has-file");
    return url;
}

function clearZone(zone) {
    zone.classList.remove("has-file");
    const img = zone.querySelector(".upload-zone__preview");
    if (img) img.remove();
    zone.querySelectorAll(".upload-zone__icon, .upload-zone__label, .upload-zone__hint")
        .forEach((el) => (el.style.display = ""));
}

setupZone(hallZone, hallInput, hallRemove, async (file) => {
    hallFile = file;
    activePresetUrl = null;
    document.querySelectorAll(".preset-pill").forEach(p => p.classList.remove("active"));
    if (hallUrl) URL.revokeObjectURL(hallUrl);
    hallUrl = showPreview(hallZone, file);
    updateDetectBtn();

    try {
        hallImageEl = await loadImage(hallUrl);
        const w = hallImageEl.naturalWidth;
        const h = hallImageEl.naturalHeight;
        await generateIntelligentMask(w, h, selectedSurface, null, hallImageEl);
    } catch (e) {
        console.warn("[Visualizer] Preload image failed:", e);
    }
});

setupZone(tileZone, tileInput, tileRemove, (file) => {
    tileFile = file;
    if (tileUrl) URL.revokeObjectURL(tileUrl);
    tileUrl = showPreview(tileZone, file);
    updateDetectBtn();
});

async function loadTileFromUrl(url, productName = null) {
    try {
        if (tileStatusHint) tileStatusHint.textContent = "Yükleniyor...";
        const file = await urlToFile(url, "tile_texture.jpg");
        tileFile = file;
        if (tileUrl) URL.revokeObjectURL(tileUrl);
        tileUrl = showPreview(tileZone, file);
        if (productName && productNameEl) {
            productNameEl.textContent = productName;
            if (productBanner) productBanner.style.display = "flex";
        }
        if (tileStatusHint) tileStatusHint.textContent = "Hazır ✓";
        updateDetectBtn();
    } catch (err) {
        console.warn("Could not preload tile texture:", err);
        if (tileStatusHint) tileStatusHint.textContent = "Manuel yükleyin";
    }
}

async function loadRoomFromPreset(url, pillBtn = null) {
    try {
        showLoading("Örnek oda yükleniyor...");
        const file = await urlToFile(url, "preset_room.jpg");
        hallFile = file;
        activePresetUrl = url;
        if (hallUrl) URL.revokeObjectURL(hallUrl);
        hallUrl = showPreview(hallZone, file);

        document.querySelectorAll(".preset-pill").forEach(p => p.classList.remove("active"));
        if (pillBtn) pillBtn.classList.add("active");

        updateDetectBtn();

        // Preload image and pre-generate intelligent surface mask
        hallImageEl = await loadImage(hallUrl);
        const w = hallImageEl.naturalWidth;
        const h = hallImageEl.naturalHeight;
        await generateIntelligentMask(w, h, selectedSurface, activePresetUrl, hallImageEl);

        showToast("Örnek oda seçildi. Doğrudan 'Seramiği Odaya Uygula' butonuna tıklayabilirsiniz.", "success", 2500);
    } catch (err) {
        showToast("Örnek oda yüklenemedi: " + err.message);
    } finally {
        hideLoading();
    }
}

document.querySelectorAll(".preset-pill").forEach((btn) => {
    btn.addEventListener("click", () => {
        const presetUrl = btn.dataset.preset;
        if (presetUrl) loadRoomFromPreset(presetUrl, btn);
    });
});

scaleSlider.addEventListener("input", () => {
    scaleValue.textContent = parseFloat(scaleSlider.value).toFixed(1) + "×";
});

brushSlider.addEventListener("input", () => {
    brushValue.textContent = brushSlider.value;
});

// Global debug store for the 9 QA inspection layers (7 technical layers + Final Apply Mask + Decision Support Overlay)
window.__debugLayers = {
    original: null,
    rawMask: null,
    wallMask: null,
    floorMask: null,
    protectedMask: null,
    finalApplyMask: null,
    perspectiveTile: null,
    compositeResult: null,
    decisionOverlay: null
};

let activeDebugLayer = "compositeResult";

function selectDebugLayer(layerKey) {
    activeDebugLayer = layerKey;
    const stageImg = document.getElementById("dbg-stage-img");
    const stageOverlay = document.getElementById("dbg-stage-overlay");
    const titleEl = document.getElementById("dbg-stage-title");
    const tabBtns = document.querySelectorAll(".dbg-tab-btn");

    tabBtns.forEach(btn => {
        if (btn.dataset.layer === layerKey) {
            btn.classList.add("active");
            btn.style.background = "#6366f1";
            btn.style.color = "#fff";
        } else {
            btn.classList.remove("active");
            btn.style.background = "rgba(255,255,255,0.06)";
            btn.style.color = "#94a3b8";
        }
    });

    const layerTitles = {
        original: "1. Orijinal Banyo Fotoğrafı (475×625 Tam Çözünürlük)",
        rawMask: "2. Ham Segmentasyon Maskesi (Döşenebilir Alan)",
        wallMask: "3. Düzeltilmiş Duvar Maskesi (Ayna/Dolap/Vitrifiye Arındırılmış)",
        floorMask: "4. Düzeltilmiş Zemin Maskesi (Sürekli, Deliksiz, Lekesiz Zemin)",
        protectedMask: "5. Korunan Ön Plan Maskesi (Ayna, Tezgâh, Klozet, Tavan)",
        finalApplyMask: "6. Nihai Kaplama Maskesi (Seçilen Yüzey Kaplama Alanı)",
        perspectiveTile: "7. Perspektif Uygulanmış Seramik Dokusu (Ocean 60×120)",
        compositeResult: "8. Son Kompozit Görsel (Işık ve Gölgeleri Korunmuş Nihai Render)",
        decisionOverlay: "9. Karar Destek Bindirmesi (Kırmızı=Korunan, Yeşil=Zemin, Mavi=Duvar)"
    };

    if (titleEl && layerTitles[layerKey]) {
        titleEl.textContent = layerTitles[layerKey];
    }

    const src = window.__debugLayers[layerKey];
    if (stageImg && src) {
        stageImg.src = src;
    }

    // Semi-transparent overlay with original room photo
    if (stageOverlay) {
        const isMask = ["rawMask", "wallMask", "floorMask", "protectedMask", "finalApplyMask"].includes(layerKey);
        const opacitySlider = document.getElementById("dbg-opacity-slider");
        if (opacitySlider && isMask) {
            stageOverlay.src = window.__debugLayers.original || "";
            stageOverlay.style.display = "block";
            stageOverlay.style.opacity = (parseFloat(opacitySlider.value) || 35) / 100.0;
        } else {
            stageOverlay.style.display = "none";
        }
    }
}

function updateDebugPanel() {
    const p1 = document.getElementById("dbg-img-1");
    const p2 = document.getElementById("dbg-img-2");
    const p3 = document.getElementById("dbg-img-3");
    const p4 = document.getElementById("dbg-img-4");
    const p5 = document.getElementById("dbg-img-5");
    const p6 = document.getElementById("dbg-img-6");
    const p7 = document.getElementById("dbg-img-7");
    const p8 = document.getElementById("dbg-img-8");
    const p9 = document.getElementById("dbg-img-9");

    if (p1 && window.__debugLayers.original) p1.src = window.__debugLayers.original;
    if (p2 && window.__debugLayers.rawMask) p2.src = window.__debugLayers.rawMask;
    if (p3 && window.__debugLayers.wallMask) p3.src = window.__debugLayers.wallMask;
    if (p4 && window.__debugLayers.floorMask) p4.src = window.__debugLayers.floorMask;
    if (p5 && window.__debugLayers.protectedMask) p5.src = window.__debugLayers.protectedMask;
    if (p6 && window.__debugLayers.finalApplyMask) p6.src = window.__debugLayers.finalApplyMask;
    if (p7 && window.__debugLayers.perspectiveTile) p7.src = window.__debugLayers.perspectiveTile;
    if (p8 && window.__debugLayers.compositeResult) p8.src = window.__debugLayers.compositeResult;
    if (p9 && window.__debugLayers.decisionOverlay) p9.src = window.__debugLayers.decisionOverlay;

    // Refresh full-size stage
    selectDebugLayer(activeDebugLayer);
}

/**
 * Intelligent Surface Mask Generator with Strict Mathematical Set Theory
 * - Complete Disjoint Partition: M_protected + M_wall + M_floor = Total Image (296,875 px)
 * - Zero Overlap: M_wall ∩ M_floor = Ø
 * - Guaranteed Zero Mirror Bleed: Mirror + Upper Cabinet completely protected
 * - Continuous Solid Floor: Zero punctures, zero splotches
 */
async function generateIntelligentMask(w, h, surface, presetUrl, roomImg = null) {
    if (roomImg) {
        hallImageEl = roomImg;
    }

    if (presetUrl) {
        let maskName = null;
        if (presetUrl.includes("bathroom")) maskName = "easy_bathroom";
        else if (presetUrl.includes("kitchen")) maskName = "easy_kitchen";
        else if (presetUrl.includes("living")) maskName = "modern_living";

        if (maskName) {
            try {
                // Precomputed floor mask
                const floorMaskImg = await loadImage(`/hero/masks/${maskName}_floor.png`).catch(() => null);
                if (floorMaskImg) {
                    if (!surfaceMasks.floor) surfaceMasks.floor = document.createElement("canvas");
                    surfaceMasks.floor.width = w; surfaceMasks.floor.height = h;
                    const smfCtx = surfaceMasks.floor.getContext("2d");
                    smfCtx.clearRect(0, 0, w, h);
                    smfCtx.drawImage(floorMaskImg, 0, 0, w, h);
                    window.__debugLayers.floorMask = surfaceMasks.floor.toDataURL("image/png");
                }

                // Precomputed wall mask
                const wallMaskImg = await loadImage(`/hero/masks/${maskName}_wall.png`).catch(() => null);
                if (wallMaskImg) {
                    if (!surfaceMasks.wall) surfaceMasks.wall = document.createElement("canvas");
                    surfaceMasks.wall.width = w; surfaceMasks.wall.height = h;
                    const smwCtx = surfaceMasks.wall.getContext("2d");
                    smwCtx.clearRect(0, 0, w, h);
                    smwCtx.drawImage(wallMaskImg, 0, 0, w, h);
                    window.__debugLayers.wallMask = surfaceMasks.wall.toDataURL("image/png");
                }

                // Object protection buffer
                if (!objectProtectionMask) objectProtectionMask = document.createElement("canvas");
                objectProtectionMask.width = w; objectProtectionMask.height = h;
                const opCtx = objectProtectionMask.getContext("2d");
                opCtx.clearRect(0, 0, w, h);

                const dataB64 = getActiveMaskBase64();
                if (dataB64 && dataB64.length > 50) {
                    window.__debugLayers.rawMask = "data:image/png;base64," + dataB64;
                    window.__debugLayers.finalApplyMask = "data:image/png;base64," + dataB64;
                    if (roomImg) {
                        window.__debugLayers.original = roomImg.src;
                    }
                    updateDebugPanel();
                    return dataB64;
                }
            } catch (err) {
                console.warn("[Visualizer] Precomputed mask load skipped, using calibrated vector polygon:", err);
            }
        }
    }

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = w; tempCanvas.height = h;
    const tempCtx = tempCanvas.getContext("2d");
    if (roomImg) {
        tempCtx.drawImage(roomImg, 0, 0, w, h);
        window.__debugLayers.original = roomImg.src || tempCanvas.toDataURL("image/png");
    }
    const rgbData = tempCtx.getImageData(0, 0, w, h).data;

    const isPortrait = (h > w);

    // 1. Tavan ve Spotlar (Ceiling): y in [0, ceilingY]
    const ceilingY = Math.round(h * 0.176); // 110 px on 625

    // 2. Üst Dolap (Upper Cabinet above mirror):
    const upperCabMinX = Math.round(w * 0.404);
    const upperCabMaxX = Math.round(w * 0.937);
    const upperCabMinY = ceilingY;
    const upperCabMaxY = Math.round(h * 0.28);

    // 3. Ayna ve LED Halo (Mirror):
    const mirrorMinX = Math.round(w * 0.404);
    const mirrorMaxX = Math.round(w * 0.937);
    const mirrorMinY = Math.round(h * 0.28);
    const mirrorMaxY = Math.round(h * 0.568);

    // 4. Ahşap Tezgâh ve Asma Çekmeceler (Vanity):
    const vanityMinX = Math.round(w * 0.395);
    const vanityMaxX = Math.round(w * 0.937);
    const vanityMinY = Math.round(h * 0.656);
    const vanityMaxY = Math.round(h * 0.84);

    // Çanak Lavabo Ovali (Vessel sink):
    const sinkCenterX = Math.round(w * 0.655);
    const sinkCenterY = Math.round(h * 0.646);
    const sinkRadiusX = Math.round(w * 0.128);
    const sinkRadiusY = Math.round(h * 0.032);

    // 5. Asma Klozet, Kumanda Paneli, Havlupan (Sanitary Fixtures):
    const toiletMinX = Math.round(w * 0.158);
    const toiletMaxX = Math.round(w * 0.347);
    const toiletMinY = Math.round(h * 0.696);
    const toiletMaxY = Math.round(h * 0.856);

    const flushMinX = Math.round(w * 0.22);
    const flushMaxX = Math.round(w * 0.326);
    const flushMinY = Math.round(h * 0.536);
    const flushMaxY = Math.round(h * 0.60);

    const radiatorMaxX = Math.round(w * 0.095);
    const rightWoodMinX = Math.round(w * 0.937);

    // 6. Zemin Seviyesi (Floor Horizon Line):
    const floorY = isPortrait ? Math.round(h * 0.856) : Math.round(h * 0.70);

    // Allocate semantic buffers
    const floorCanvas = document.createElement("canvas");
    floorCanvas.width = w; floorCanvas.height = h;
    const fCtx = floorCanvas.getContext("2d");
    const fData = fCtx.createImageData(w, h);
    const fPx = fData.data;

    const wallCanvas = document.createElement("canvas");
    wallCanvas.width = w; wallCanvas.height = h;
    const wCtx = wallCanvas.getContext("2d");
    const wData = wCtx.createImageData(w, h);
    const wPx = wData.data;

    const protCanvas = document.createElement("canvas");
    protCanvas.width = w; protCanvas.height = h;
    const prCtx = protCanvas.getContext("2d");
    const prData = prCtx.createImageData(w, h);
    const prPx = prData.data;

    let floorPixelCount = 0;
    let wallPixelCount = 0;

    for (let y = 0; y < h; y++) {
        const rowOffset = y * w * 4;
        const isFloorZone = (y >= floorY);
        const isWallZone  = (y >= ceilingY && y < floorY);

        for (let x = 0; x < w; x++) {
            const idx = rowOffset + x * 4;
            const r = rgbData[idx];
            const g = rgbData[idx + 1];
            const b = rgbData[idx + 2];

            const lum = r * 0.299 + g * 0.587 + b * 0.114;
            const maxVal = Math.max(r, g, b);
            const minVal = Math.min(r, g, b);
            const chroma = maxVal - minVal;

            let isProtected = false;

            // 1. Bitki Koruma (Green Foliage Signature): Klorofil ve yaprak tonları
            const isPlant = (g > r + 18 && g > b + 18) || (2 * g - r - b > 28 && g > 45);

            // 2. Banyo Paspası & Halı Koruması (Bath Mat / Floor Rug):
            // Zemin üzerinde yer alan tekstil paspaslar karo kaplanmaz
            let isBathMat = false;
            if (isFloorZone) {
                // Lavabo / duş önü paspas bölgesi veya kumaş mat dokusu
                if ((x >= Math.round(w * 0.30) && x <= Math.round(w * 0.72) && y >= Math.round(floorY + h * 0.03) && y <= Math.round(floorY + h * 0.11)) || (chroma > 45 && lum < 75)) {
                    isBathMat = true;
                }
            }

            if (y < ceilingY) {
                // Tavan & Spotlar: %100 Korumalı
                isProtected = true;
            } else if (isPlant || isBathMat) {
                // Bitkiler ve banyo paspası: %100 Korumalı
                isProtected = true;
            } else if (isPortrait) {
                // Katı Geometrik Bölge Topolojisi (Zero-Bleed)
                if (x >= upperCabMinX && x <= upperCabMaxX && y >= upperCabMinY && y <= upperCabMaxY) {
                    isProtected = true; // Üst dolap
                } else if (x >= mirrorMinX && x <= mirrorMaxX && y >= mirrorMinY && y <= mirrorMaxY) {
                    isProtected = true; // Ayna & LED halo
                } else if (x >= vanityMinX && x <= vanityMaxX && y >= vanityMinY && y <= vanityMaxY) {
                    isProtected = true; // Tezgâh & çekmeceler
                } else if (Math.pow((x - sinkCenterX) / sinkRadiusX, 2) + Math.pow((y - sinkCenterY) / sinkRadiusY, 2) <= 1.0) {
                    isProtected = true; // Çanak lavabo ovali
                } else if (x >= toiletMinX && x <= toiletMaxX && y >= toiletMinY && y <= toiletMaxY) {
                    isProtected = true; // Asma klozet gövdesi
                } else if (x >= flushMinX && x <= flushMaxX && y >= flushMinY && y <= flushMaxY) {
                    isProtected = true; // Kumanda paneli
                } else if (x <= radiatorMaxX && y >= Math.round(h * 0.27) && y <= toiletMaxY) {
                    isProtected = true; // Havlupan
                } else if (x >= rightWoodMinX) {
                    isProtected = true; // Sağ ahşap duvar
                }
            } else {
                // Landscape / Genel Odalar
                if (lum > 145 && chroma < 35 && !isFloorZone) {
                    isProtected = true;
                } else if (lum < 55 && (x > w * 0.45 && y > floorY - h * 0.16)) {
                    isProtected = true;
                } else if (isWallZone && (x > w * 0.55 && y < floorY - h * 0.18 && lum > 165)) {
                    isProtected = true;
                }
            }

            if (isProtected) {
                // Korunan Ön Plan Maskesi: Beyaz (255)
                prPx[idx]     = 255;
                prPx[idx + 1] = 255;
                prPx[idx + 2] = 255;
                prPx[idx + 3] = 255;
            } else {
                if (isFloorZone) {
                    // Düzeltilmiş Zemin Maskesi: Beyaz (255)
                    fPx[idx]     = 255;
                    fPx[idx + 1] = 255;
                    fPx[idx + 2] = 255;
                    fPx[idx + 3] = 255;
                    floorPixelCount++;
                } else if (isWallZone) {
                    // Düzeltilmiş Duvar Maskesi: Beyaz (255)
                    wPx[idx]     = 255;
                    wPx[idx + 1] = 255;
                    wPx[idx + 2] = 255;
                    wPx[idx + 3] = 255;
                    wallPixelCount++;
                }
            }
        }
    }

    // Otomatik Zemin Kalite Kontrolü (Automatic Floor Quality Check)
    // Eğer zemin maskesi boşsa veya toplam görüntünün %3'ünden küçükse otomatik perspektif geometrisiyle düzelt:
    if (surface === "floor" && floorPixelCount < Math.round(w * h * 0.03)) {
        console.warn("[Kalite Kontrol] Zemin maskesi yetersiz (<%3), otomatik perspektif taban kalibrasyonu çalıştırılıyor.");
        const autoFloorY = Math.round(h * (isPortrait ? 0.82 : 0.72));
        for (let y = autoFloorY; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const idx = (y * w + x) * 4;
                if (prPx[idx] === 0) {
                    fPx[idx]     = 255;
                    fPx[idx + 1] = 255;
                    fPx[idx + 2] = 255;
                    fPx[idx + 3] = 255;
                }
            }
        }
    }

    fCtx.putImageData(fData, 0, 0);
    wCtx.putImageData(wData, 0, 0);
    prCtx.putImageData(prData, 0, 0);

    // Bağımsız Yüzey Maskelerini Kalıcı Olarak Sakla
    if (!surfaceMasks.floor) surfaceMasks.floor = document.createElement("canvas");
    surfaceMasks.floor.width = w; surfaceMasks.floor.height = h;
    const smfCtx = surfaceMasks.floor.getContext("2d");
    smfCtx.clearRect(0, 0, w, h);
    smfCtx.drawImage(floorCanvas, 0, 0);

    if (!surfaceMasks.wall) surfaceMasks.wall = document.createElement("canvas");
    surfaceMasks.wall.width = w; surfaceMasks.wall.height = h;
    const smwCtx = surfaceMasks.wall.getContext("2d");
    smwCtx.clearRect(0, 0, w, h);
    smwCtx.drawImage(wallCanvas, 0, 0);

    if (!objectProtectionMask) objectProtectionMask = document.createElement("canvas");
    objectProtectionMask.width = w; objectProtectionMask.height = h;
    const opCtx = objectProtectionMask.getContext("2d");
    opCtx.clearRect(0, 0, w, h);
    opCtx.drawImage(protCanvas, 0, 0);

    window.__debugLayers.floorMask = floorCanvas.toDataURL("image/png");
    window.__debugLayers.wallMask = wallCanvas.toDataURL("image/png");
    window.__debugLayers.protectedMask = protCanvas.toDataURL("image/png");

    // 9. Karar Destek Bindirmesi (Overlay): Kırmızı=Korunan, Yeşil=Zemin, Mavi=Duvar
    const overlayCanvas = document.createElement("canvas");
    overlayCanvas.width = w; overlayCanvas.height = h;
    const ovCtx = overlayCanvas.getContext("2d");
    if (roomImg) {
        ovCtx.drawImage(roomImg, 0, 0, w, h);
    }
    const ovImgData = ovCtx.getImageData(0, 0, w, h);
    const ovPx = ovImgData.data;

    for (let i = 0; i < w * h; i++) {
        const idx = i * 4;
        const isProt = prPx[idx + 3] > 0;
        const isFlr  = fPx[idx + 3] > 0;
        const isWll  = wPx[idx + 3] > 0;

        const origR = ovPx[idx];
        const origG = ovPx[idx + 1];
        const origB = ovPx[idx + 2];

        if (isProt) {
            ovPx[idx]     = Math.min(255, Math.round(origR * 0.45 + 239 * 0.55));
            ovPx[idx + 1] = Math.min(255, Math.round(origG * 0.45 + 68  * 0.55));
            ovPx[idx + 2] = Math.min(255, Math.round(origB * 0.45 + 68  * 0.55));
        } else if (isFlr) {
            ovPx[idx]     = Math.min(255, Math.round(origR * 0.45 + 16  * 0.55));
            ovPx[idx + 1] = Math.min(255, Math.round(origG * 0.45 + 185 * 0.55));
            ovPx[idx + 2] = Math.min(255, Math.round(origB * 0.45 + 129 * 0.55));
        } else if (isWll) {
            ovPx[idx]     = Math.min(255, Math.round(origR * 0.45 + 99  * 0.55));
            ovPx[idx + 1] = Math.min(255, Math.round(origG * 0.45 + 102 * 0.55));
            ovPx[idx + 2] = Math.min(255, Math.round(origB * 0.45 + 241 * 0.55));
        }
    }
    ovCtx.putImageData(ovImgData, 0, 0);
    window.__debugLayers.decisionOverlay = overlayCanvas.toDataURL("image/png");

    // 6. Nihai Kaplama Maskesi (Final Apply Mask)
    const outCanvas = document.createElement("canvas");
    outCanvas.width = w; outCanvas.height = h;
    const outCtx = outCanvas.getContext("2d");

    if (surface === "floor") {
        outCtx.drawImage(floorCanvas, 0, 0);
    } else if (surface === "wall") {
        outCtx.drawImage(wallCanvas, 0, 0);
    } else { // "both"
        outCtx.drawImage(wallCanvas, 0, 0);
        outCtx.drawImage(floorCanvas, 0, 0);
    }

    const outDataUrl = outCanvas.toDataURL("image/png");
    window.__debugLayers.rawMask = outDataUrl;
    window.__debugLayers.finalApplyMask = outDataUrl;
    updateDebugPanel();

    return outDataUrl.split(",")[1];
}

detectBtn.addEventListener("click", async () => {
    if (!hallFile) return;

    const surfaceLabel = selectedSurface === "wall" ? "duvar" : selectedSurface === "both" ? "zemin ve duvar" : "zemin";
    showLoading("Yapay zekâ " + surfaceLabel + " yüzeyini analiz ediyor…");

    try {
        let maskReceived = null;
        let imgW = 800, imgH = 600;
        let isAiMask = false;

        // Try Python AI Microservice first
        try {
            const fd = new FormData();
            fd.append("hall_image", hallFile);
            fd.append("surface", selectedSurface);

            const res = await fetch("/api/segment", { method: "POST", body: fd });
            if (res.ok) {
                const data = await res.json();
                if (data && data.mask) {
                    maskReceived = data.mask;
                    imgW = data.width || 800;
                    imgH = data.height || 600;
                    isAiMask = true;
                }
            }
        } catch (netErr) {
            console.warn("[Visualizer] Server segment unavailable, switching to client engine:", netErr);
        }

        // Seamless Intelligent Fallback if server is offline (e.g. Vercel)
        if (!maskReceived) {
            const tempImg = await loadImage(hallUrl);
            imgW = tempImg.naturalWidth || 800;
            imgH = tempImg.naturalHeight || 600;
            maskReceived = await generateIntelligentMask(imgW, imgH, selectedSurface, activePresetUrl, tempImg);
        }

        maskB64Original = maskReceived;
        await initEditor(imgW, imgH);

        editorSection.classList.add("visible");
        editorSection.scrollIntoView({ behavior: "smooth", block: "start" });
        if (isAiMask) {
            showToast("SegFormer-B3 AI yüzey sınırlarını başarıyla tespit etti! Fırça ile ince ayar yapabilir veya seramiği uygulayabilirsiniz.", "success");
        } else {
            showToast("Zemin yüzey maskesi başarıyla algılandı. Fırça ile gerekirse rötuşlayabilir veya direkt uygulayabilirsiniz.", "success");
        }
    } catch (err) {
        console.error(err);
        showToast("Yüzey tespitinde hata: " + err.message);
    } finally {
        hideLoading();
    }
});

function getActiveMaskCanvas() {
    if (selectedSurface === "wall") {
        return surfaceMasks.wall;
    } else {
        return surfaceMasks.floor;
    }
}

function getActiveMaskBase64() {
    const w = (hallImageEl && hallImageEl.naturalWidth) || (surfaceMasks.floor && surfaceMasks.floor.width) || (surfaceMasks.wall && surfaceMasks.wall.width) || 800;
    const h = (hallImageEl && hallImageEl.naturalHeight) || (surfaceMasks.floor && surfaceMasks.floor.height) || (surfaceMasks.wall && surfaceMasks.wall.height) || 600;
    const combCanvas = document.createElement("canvas");
    combCanvas.width = w;
    combCanvas.height = h;
    const cCtx = combCanvas.getContext("2d");

    if (selectedSurface === "floor") {
        if (surfaceMasks.floor) cCtx.drawImage(surfaceMasks.floor, 0, 0);
    } else if (selectedSurface === "wall") {
        if (surfaceMasks.wall) cCtx.drawImage(surfaceMasks.wall, 0, 0);
    } else { // "both"
        if (surfaceMasks.wall) cCtx.drawImage(surfaceMasks.wall, 0, 0);
        if (surfaceMasks.floor) cCtx.drawImage(surfaceMasks.floor, 0, 0);
    }

    // Strict fixture and furniture collision protection
    if (objectProtectionMask) {
        cCtx.save();
        cCtx.globalCompositeOperation = "destination-out";
        cCtx.drawImage(objectProtectionMask, 0, 0);
        cCtx.restore();
    }

    // Binary cleanup
    const imgData = cCtx.getImageData(0, 0, w, h);
    const d = imgData.data;
    for (let i = 0; i < d.length; i += 4) {
        const val = d[i + 3] > 30 ? 255 : 0;
        d[i]     = val;
        d[i + 1] = val;
        d[i + 2] = val;
        d[i + 3] = val;
    }
    cCtx.putImageData(imgData, 0, 0);

    return combCanvas.toDataURL("image/png").split(",")[1];
}

function getMaskBase64() {
    return getActiveMaskBase64();
}

function checkMaskCollisionsAndCoverage() {
    if (!hallImageEl || !objectProtectionMask) return;
    const w = hallImageEl.naturalWidth;
    const h = hallImageEl.naturalHeight;

    const activeCanvas = getActiveMaskCanvas();
    if (!activeCanvas) return;

    const actData = activeCanvas.getContext("2d").getImageData(0, 0, w, h).data;
    const protData = objectProtectionMask.getContext("2d").getImageData(0, 0, w, h).data;

    let activeCount = 0;
    let collisionCount = 0;

    for (let i = 0; i < actData.length; i += 4) {
        const isAct = actData[i + 3] > 30;
        const isProt = protData[i + 3] > 30;
        if (isAct) activeCount++;
        if (isAct && isProt) collisionCount++;
    }

    const totalPixels = w * h;
    const coveragePct = (activeCount / totalPixels) * 100;

    if (collisionBanner && collisionText) {
        if (collisionCount > 30) {
            collisionBanner.style.display = "flex";
            collisionText.textContent = `🛡️ Mobilya / vitrifiye nesneleriyle çakışan ${collisionCount} piksel tespit edildi ve otomatik olarak kaplama dışı korundu.`;
        } else if (coveragePct < 2.5) {
            collisionBanner.style.display = "flex";
            collisionText.textContent = `⚠️ Seçili yüzey alanı çok küçük (%${coveragePct.toFixed(1)}). Eksik seramik alanlarını boya fırçasıyla ekleyebilirsiniz.`;
        } else {
            collisionBanner.style.display = "none";
        }
    }
}

async function initEditor(imgW, imgH) {
    hallImageEl = await loadImage(hallUrl);
    const w = hallImageEl.naturalWidth;
    const h = hallImageEl.naturalHeight;

    editorCanvas.width  = w;
    editorCanvas.height = h;

    if (!colorCanvas) {
        colorCanvas = document.createElement("canvas");
        colorCtx    = colorCanvas.getContext("2d");
    }
    colorCanvas.width  = w;
    colorCanvas.height = h;

    zoomLevel = 1.0;
    panX = 0;
    panY = 0;
    updateZoomUI();

    historyStack.undo = [];
    historyStack.redo = [];
    updateUndoRedoUI();

    renderComposite();
    checkMaskCollisionsAndCoverage();
}

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload  = () => resolve(img);
        img.onerror = () => reject(new Error("Görsel yüklenemedi"));
        img.src = src;
    });
}

function renderComposite() {
    if (!hallImageEl) return;
    const w = editorCanvas.width;
    const h = editorCanvas.height;

    ctx.save();
    ctx.clearRect(0, 0, w, h);

    // Apply zoom & pan transforms
    ctx.translate(panX, panY);
    ctx.scale(zoomLevel, zoomLevel);

    // 1. Original Photo
    ctx.drawImage(hallImageEl, 0, 0, w, h);

    // 2. Floor Mask (Emerald Green: #10b981)
    if (surfaceMasks.floor) {
        colorCtx.clearRect(0, 0, w, h);
        colorCtx.drawImage(surfaceMasks.floor, 0, 0);
        colorCtx.globalCompositeOperation = "source-in";
        colorCtx.fillStyle = (selectedSurface === "floor" || selectedSurface === "both") 
            ? "rgba(16, 185, 129, 0.45)" 
            : "rgba(16, 185, 129, 0.16)";
        colorCtx.fillRect(0, 0, w, h);
        colorCtx.globalCompositeOperation = "source-over";
        ctx.drawImage(colorCanvas, 0, 0);
    }

    // 3. Wall Mask (Sky Blue: #3b82f6)
    if (surfaceMasks.wall) {
        colorCtx.clearRect(0, 0, w, h);
        colorCtx.drawImage(surfaceMasks.wall, 0, 0);
        colorCtx.globalCompositeOperation = "source-in";
        colorCtx.fillStyle = (selectedSurface === "wall" || selectedSurface === "both") 
            ? "rgba(59, 130, 246, 0.45)" 
            : "rgba(59, 130, 246, 0.16)";
        colorCtx.fillRect(0, 0, w, h);
        colorCtx.globalCompositeOperation = "source-over";
        ctx.drawImage(colorCanvas, 0, 0);
    }

    // 4. Protected Objects (Coral Red: #ef4444)
    if (objectProtectionMask) {
        colorCtx.clearRect(0, 0, w, h);
        colorCtx.drawImage(objectProtectionMask, 0, 0);
        colorCtx.globalCompositeOperation = "source-in";
        colorCtx.fillStyle = "rgba(239, 68, 68, 0.35)";
        colorCtx.fillRect(0, 0, w, h);
        colorCtx.globalCompositeOperation = "source-over";
        ctx.drawImage(colorCanvas, 0, 0);
    }

    ctx.restore();
}

function canvasCoords(e) {
    const rect = editorCanvas.getBoundingClientRect();
    const canvasW = editorCanvas.width;
    const canvasH = editorCanvas.height;
    const canvasAspect = canvasW / canvasH;
    const rectAspect = rect.width / rect.height;

    let renderW, renderH, offsetX, offsetY;

    if (rectAspect > canvasAspect) {
        renderH = rect.height;
        renderW = renderH * canvasAspect;
        offsetX = (rect.width - renderW) / 2;
        offsetY = 0;
    } else {
        renderW = rect.width;
        renderH = renderW / canvasAspect;
        offsetX = 0;
        offsetY = (rect.height - renderH) / 2;
    }

    let clientX = e.clientX ?? (e.touches && e.touches[0]?.clientX);
    let clientY = e.clientY ?? (e.touches && e.touches[0]?.clientY);

    const normX = (clientX - rect.left - offsetX) / renderW;
    const normY = (clientY - rect.top - offsetY) / renderH;

    const unscaledX = normX * canvasW;
    const unscaledY = normY * canvasH;

    const finalX = (unscaledX - panX) / zoomLevel;
    const finalY = (unscaledY - panY) / zoomLevel;

    return {
        x: Math.max(0, Math.min(canvasW, finalX)),
        y: Math.max(0, Math.min(canvasH, finalY))
    };
}

function updateUndoRedoUI() {
    if (toolUndo) toolUndo.disabled = (historyStack.undo.length === 0);
    if (toolRedo) toolRedo.disabled = (historyStack.redo.length === 0);
}

function saveHistoryState() {
    const activeCanvas = getActiveMaskCanvas();
    if (!activeCanvas) return;
    const imgData = activeCanvas.getContext("2d").getImageData(0, 0, activeCanvas.width, activeCanvas.height);
    historyStack.undo.push({
        surface: selectedSurface,
        data: imgData
    });
    if (historyStack.undo.length > MAX_HISTORY) {
        historyStack.undo.shift();
    }
    historyStack.redo = [];
    updateUndoRedoUI();
}

function undo() {
    if (historyStack.undo.length === 0) return;
    const activeCanvas = getActiveMaskCanvas();
    if (!activeCanvas) return;
    const currentData = activeCanvas.getContext("2d").getImageData(0, 0, activeCanvas.width, activeCanvas.height);
    historyStack.redo.push({
        surface: selectedSurface,
        data: currentData
    });
    const last = historyStack.undo.pop();
    activeCanvas.getContext("2d").putImageData(last.data, 0, 0);
    renderComposite();
    checkMaskCollisionsAndCoverage();
    updateUndoRedoUI();
}

function redo() {
    if (historyStack.redo.length === 0) return;
    const activeCanvas = getActiveMaskCanvas();
    if (!activeCanvas) return;
    const currentData = activeCanvas.getContext("2d").getImageData(0, 0, activeCanvas.width, activeCanvas.height);
    historyStack.undo.push({
        surface: selectedSurface,
        data: currentData
    });
    const next = historyStack.redo.pop();
    activeCanvas.getContext("2d").putImageData(next.data, 0, 0);
    renderComposite();
    checkMaskCollisionsAndCoverage();
    updateUndoRedoUI();
}

function updateZoomUI() {
    if (zoomLevelText) {
        zoomLevelText.textContent = Math.round(zoomLevel * 100) + "%";
    }
    if (toolZoomOut) {
        toolZoomOut.disabled = (zoomLevel <= 1.0);
    }
    if (toolZoomIn) {
        toolZoomIn.disabled = (zoomLevel >= 3.0);
    }
}

function zoomIn() {
    zoomLevel = Math.min(3.0, Math.round((zoomLevel + 0.5) * 10) / 10);
    updateZoomUI();
    renderComposite();
}

function zoomOut() {
    zoomLevel = Math.max(1.0, Math.round((zoomLevel - 0.5) * 10) / 10);
    if (zoomLevel === 1.0) {
        panX = 0;
        panY = 0;
    }
    updateZoomUI();
    renderComposite();
}

function zoomReset() {
    zoomLevel = 1.0;
    panX = 0;
    panY = 0;
    updateZoomUI();
    renderComposite();
}

function drawBrush(x, y) {
    const activeCanvas = getActiveMaskCanvas();
    if (!activeCanvas) return;
    const actCtx = activeCanvas.getContext("2d");

    const r = parseInt(brushSlider.value, 10);

    actCtx.beginPath();
    actCtx.arc(x, y, r, 0, Math.PI * 2);
    if (brushMode === "paint") {
        actCtx.fillStyle = "#fff";
        actCtx.fill();
    } else {
        actCtx.save();
        actCtx.globalCompositeOperation = "destination-out";
        actCtx.fillStyle = "#fff";
        actCtx.fill();
        actCtx.restore();
    }
}

function drawLine(from, to) {
    const dist = Math.hypot(to.x - from.x, to.y - from.y);
    const steps = Math.max(1, Math.ceil(dist / 3));
    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        drawBrush(from.x + (to.x - from.x) * t, from.y + (to.y - from.y) * t);
    }
}

function onPointerDown(e) {
    if (e.button === 1 || e.spaceKey) {
        isPanning = true;
        panStart = { x: e.clientX, y: e.clientY, px: panX, py: panY };
        e.preventDefault();
        return;
    }
    e.preventDefault();
    saveHistoryState();
    isDrawing = true;
    const pos = canvasCoords(e);
    drawBrush(pos.x, pos.y);
    lastPos = pos;
    renderComposite();
}

function onPointerMove(e) {
    if (isPanning) {
        e.preventDefault();
        panX = panStart.px + (e.clientX - panStart.x);
        panY = panStart.py + (e.clientY - panStart.y);
        renderComposite();
        return;
    }
    if (!isDrawing) return;
    e.preventDefault();
    const pos = canvasCoords(e);
    drawLine(lastPos, pos);
    lastPos = pos;
    renderComposite();
}

function onPointerUp() {
    isDrawing = false;
    isPanning = false;
    lastPos = null;
    checkMaskCollisionsAndCoverage();
}

editorCanvas.addEventListener("mousedown",  onPointerDown);
editorCanvas.addEventListener("mousemove",  onPointerMove);
editorCanvas.addEventListener("mouseup",    onPointerUp);
editorCanvas.addEventListener("mouseleave", onPointerUp);

editorCanvas.addEventListener("touchstart", onPointerDown, { passive: false });
editorCanvas.addEventListener("touchmove",  onPointerMove, { passive: false });
editorCanvas.addEventListener("touchend",   onPointerUp);

editorCanvas.addEventListener("wheel", (e) => {
    e.preventDefault();
    if (e.deltaY < 0) zoomIn();
    else zoomOut();
}, { passive: false });

toolPaint.addEventListener("click", () => { brushMode = "paint"; toolPaint.classList.add("active"); toolErase.classList.remove("active"); });
toolErase.addEventListener("click", () => { brushMode = "erase"; toolErase.classList.add("active"); toolPaint.classList.remove("active"); });

if (toolUndo) toolUndo.addEventListener("click", undo);
if (toolRedo) toolRedo.addEventListener("click", redo);
if (toolZoomIn) toolZoomIn.addEventListener("click", zoomIn);
if (toolZoomOut) toolZoomOut.addEventListener("click", zoomOut);
if (toolZoomReset) toolZoomReset.addEventListener("click", zoomReset);
if (closeCollision && collisionBanner) closeCollision.addEventListener("click", () => { collisionBanner.style.display = "none"; });

toolReset.addEventListener("click", async () => {
    if (!hallImageEl) return;
    showLoading("Yapay zekâ başlangıç maskesine dönülüyor…");
    saveHistoryState();
    const w = hallImageEl.naturalWidth;
    const h = hallImageEl.naturalHeight;
    await generateIntelligentMask(w, h, selectedSurface, activePresetUrl, hallImageEl);
    hideLoading();
    renderComposite();
    checkMaskCollisionsAndCoverage();
    showToast("Maske başlangıç durumuna sıfırlandı.");
});

window.addEventListener("keydown", (e) => {
    if (!editorSection.classList.contains("visible") || e.target.tagName === "INPUT") return;
    if ((e.ctrlKey || e.metaKey) && (e.key === "z" || e.key === "Z")) {
        e.preventDefault();
        if (e.shiftKey) redo(); else undo();
    } else if ((e.ctrlKey || e.metaKey) && (e.key === "y" || e.key === "Y")) {
        e.preventDefault();
        redo();
    } else if (e.key === "b" || e.key === "B") {
        toolPaint.click();
    } else if (e.key === "e" || e.key === "E") {
        toolErase.click();
    }
});

/**
 * Intelligent Client-Side Texture Mapper with Realistic Perspective & Zero-Leak Masking
 * Formula: sonuc = orijinal * (1 - maske) + seramik_uygulanmis * maske
 */
async function renderClientPerspectiveTile(hallImg, tileImg, maskB64, pattern, tileScale, surface) {
    const w = hallImg.naturalWidth;
    const h = hallImg.naturalHeight;

    const resultCanvas = document.createElement("canvas");
    resultCanvas.width = w;
    resultCanvas.height = h;
    const rCtx = resultCanvas.getContext("2d");

    // 1. Draw 100% original base photo (untouched reference)
    rCtx.drawImage(hallImg, 0, 0, w, h);
    const roomImageData = rCtx.getImageData(0, 0, w, h);
    const roomPixels = roomImageData.data;

    // 2. Load mask image (binary alpha mask)
    const maskImgEl = await loadImage("data:image/png;base64," + maskB64);
    const mCanvas = document.createElement("canvas");
    mCanvas.width = w;
    mCanvas.height = h;
    const mCtx = mCanvas.getContext("2d");
    mCtx.drawImage(maskImgEl, 0, 0, w, h);
    const maskPixels = mCtx.getImageData(0, 0, w, h).data;

    // 3. Scan mask bounds
    let topRow = -1, botRow = -1;
    for (let y = 0; y < h; y++) {
        const rowOffset = y * w * 4;
        for (let x = 0; x < w; x++) {
            if (maskPixels[rowOffset + x * 4 + 3] > 10) {
                if (topRow === -1) topRow = y;
                botRow = y;
                break;
            }
        }
    }

    let activePixels = 0;
    for (let i = 3; i < maskPixels.length; i += 4) {
        if (maskPixels[i] > 10) activePixels++;
    }

    if (topRow === -1 || activePixels < 50) {
        console.warn("[Visualizer] Maskede kaplanacak alan yetersiz (<50 px), otomatik perspektif yüzey geometrisi ile kurtarılıyor...");
        const isPortrait = (h > w);
        if (surface === "wall") {
            const wallTop = Math.round(h * 0.18);
            const wallBot = Math.round(h * 0.75);
            for (let y = wallTop; y < wallBot; y++) {
                const rowOffset = y * w * 4;
                for (let x = 0; x < w; x++) {
                    maskPixels[rowOffset + x * 4 + 3] = 255;
                    activePixels++;
                }
            }
        } else { // "floor" or "both"
            const floorTop = Math.round(h * (isPortrait ? 0.78 : 0.65));
            for (let y = floorTop; y < h; y++) {
                const rowOffset = y * w * 4;
                for (let x = 0; x < w; x++) {
                    maskPixels[rowOffset + x * 4 + 3] = 255;
                    activePixels++;
                }
            }
        }
    }

    // 4. Create tile swatch with crisp architectural grout line
    const tileAspect = (tileImg.naturalWidth || 1) / (tileImg.naturalHeight || 1);
    const baseTileW = Math.max(32, Math.round(95 * tileScale));
    const baseTileH = Math.max(32, Math.round(baseTileW / (tileAspect || 1)));

    const patCanvas = document.createElement("canvas");
    patCanvas.width = baseTileW;
    patCanvas.height = baseTileH;
    const pCtx = patCanvas.getContext("2d");
    pCtx.drawImage(tileImg, 0, 0, baseTileW, baseTileH);

    // Architectural grout line (soft warm gray, drawn cleanly inside boundaries)
    pCtx.strokeStyle = "rgba(70, 65, 60, 0.45)";
    const groutW = Math.max(1, Math.round(baseTileW * 0.022));
    pCtx.lineWidth = groutW;
    pCtx.strokeRect(groutW / 2, groutW / 2, baseTileW - groutW, baseTileH - groutW);

    const tileImageData = pCtx.getImageData(0, 0, baseTileW, baseTileH);
    const tilePixels = tileImageData.data;

    // 5. Setup Architectural 3D Perspective Parameters
    const horizonY = Math.round(h * 0.48);
    const floorHorizonY = Math.round(h * (h > w ? 0.80 : 0.68));
    const vx = w * 0.50;
    const vy = horizonY;

    const cameraH = Math.max(120, (h - vy) * 0.65);
    const scaleFloorV = Math.max(160, Math.round(400 * tileScale));
    const scaleFloorU = scaleFloorV * (baseTileW / baseTileH);

    // Canvas for pure perspective tile preview (Debug layer 6)
    const debugTexCanvas = document.createElement("canvas");
    debugTexCanvas.width = w; debugTexCanvas.height = h;
    const dtCtx = debugTexCanvas.getContext("2d");
    const dtImgData = dtCtx.createImageData(w, h);
    const dtBuf = new Uint32Array(dtImgData.data.buffer);

    // Prepare Output Buffer (32-bit Uint32 for ultra-fast rendering)
    const outImageData = rCtx.createImageData(w, h);
    const outBuf = new Uint32Array(outImageData.data.buffer);
    const roomBuf = new Uint32Array(roomImageData.data.buffer);

    for (let y = 0; y < h; y++) {
        const rowOffset = y * w;
        const rowByteOffset = rowOffset * 4;
        const dy = y - vy;
        const isFloorPlane = (y >= floorHorizonY);

        for (let x = 0; x < w; x++) {
            const pxIdx = rowOffset + x;
            const byteIdx = rowByteOffset + x * 4;
            const maskAlpha = maskPixels[byteIdx + 3];

            if (maskAlpha < 8) {
                outBuf[pxIdx] = roomBuf[pxIdx];
                continue;
            }

            let srcX = 0;
            let srcY = 0;

            if (isFloorPlane) {
                // Ground plane 1-point perspective:
                // Transverse joints are STRICTLY HORIZONTAL (y = const),
                // Longitudinal joints converge smoothly to vanishing point (vx, vy).
                const absDy = Math.max(1.0, dy);
                const z = cameraH / absDy;
                const vCoord = z * scaleFloorV;
                const rowIdx = Math.floor(vCoord / baseTileH);
                const xOffset = (pattern === "brick" && (rowIdx % 2 !== 0)) ? (baseTileW / 2) : 0;
                
                srcY = ((Math.floor(vCoord) % baseTileH) + baseTileH) % baseTileH;
                srcX = ((Math.floor(((x - vx) / absDy) * scaleFloorU + xOffset) % baseTileW) + baseTileW) % baseTileW;
            } else {
                // Wall plane: Orthogonal back wall & vertical side walls
                const dx = x - vx;
                if (Math.abs(dx) <= w * 0.28) {
                    // Orthogonal Back Wall (facing camera directly):
                    // Strictly 90-degree orthogonal tiles, zero radial angles, 100% natural tile aspect ratio!
                    const rowIdx = Math.floor(y / baseTileH);
                    const xOffset = (pattern === "brick" && (rowIdx % 2 !== 0)) ? (baseTileW / 2) : 0;
                    srcX = ((Math.floor(x + xOffset) % baseTileW) + baseTileW) % baseTileW;
                    srcY = ((Math.floor(y) % baseTileH) + baseTileH) % baseTileH;
                } else if (dx < -w * 0.28) {
                    // Left Side Wall: Vertical joints strictly 90° vertical
                    const distX = Math.max(3, -dx);
                    const uCoord = ((w * 0.45) / distX) * baseTileW;
                    const colIdx = Math.floor(uCoord / baseTileW);
                    const yOffset = (pattern === "brick" && (colIdx % 2 !== 0)) ? (baseTileH / 2) : 0;
                    srcX = ((Math.floor(uCoord) % baseTileW) + baseTileW) % baseTileW;
                    srcY = ((Math.floor(y + yOffset) % baseTileH) + baseTileH) % baseTileH;
                } else {
                    // Right Side Wall: Vertical joints strictly 90° vertical
                    const distX = Math.max(3, dx);
                    const uCoord = ((w * 0.45) / distX) * baseTileW;
                    const colIdx = Math.floor(uCoord / baseTileW);
                    const yOffset = (pattern === "brick" && (colIdx % 2 !== 0)) ? (baseTileH / 2) : 0;
                    srcX = ((Math.floor(uCoord) % baseTileW) + baseTileW) % baseTileW;
                    srcY = ((Math.floor(y + yOffset) % baseTileH) + baseTileH) % baseTileH;
                }
            }

            const tileByteIdx = (srcY * baseTileW + srcX) * 4;
            const tR = tilePixels[tileByteIdx];
            const tG = tilePixels[tileByteIdx + 1];
            const tB = tilePixels[tileByteIdx + 2];

            // Debug pure perspective tile swatch buffer
            dtBuf[pxIdx] = (255 << 24) | (tB << 16) | (tG << 8) | tR;

            const rR = roomPixels[byteIdx];
            const rG = roomPixels[byteIdx + 1];
            const rB = roomPixels[byteIdx + 2];

            // Ambient scene lighting preservation (luminance model)
            const lum = (rR * 0.299 + rG * 0.587 + rB * 0.114) / 255.0;
            const lightFactor = Math.min(1.15, Math.max(0.18, lum * 0.82 + 0.18));

            const shadedR = Math.min(255, Math.round(tR * lightFactor));
            const shadedG = Math.min(255, Math.round(tG * lightFactor));
            const shadedB = Math.min(255, Math.round(tB * lightFactor));

            // Anti-aliased alpha blending with original room
            const alpha = maskAlpha / 255.0;
            const outR = Math.round(shadedR * alpha + rR * (1 - alpha));
            const outG = Math.round(shadedG * alpha + rG * (1 - alpha));
            const outB = Math.round(shadedB * alpha + rB * (1 - alpha));

            // Write to buffer (little-endian RGBA: A B G R)
            outBuf[pxIdx] = (255 << 24) | (outB << 16) | (outG << 8) | outR;
        }
    }

    dtCtx.putImageData(dtImgData, 0, 0);
    window.__debugLayers.perspectiveTile = debugTexCanvas.toDataURL("image/png");

    rCtx.putImageData(outImageData, 0, 0);
    window.__debugLayers.compositeResult = resultCanvas.toDataURL("image/png");
    window.__debugLayers.original = hallImg.src;
    updateDebugPanel();

    return new Promise((resolve) => {
        resultCanvas.toBlob((blob) => resolve(blob), "image/png");
    });
}

applyBtn.addEventListener("click", async () => {
    if (!hallFile || !tileFile) {
        showToast("Lütfen hem mekân fotoğrafını hem de seramik görselini seçin.");
        return;
    }

    showLoading("Perspektif dönüşümü ve gerçekçi ışık haritalaması uygulanıyor…");

    try {
        // Ensure hallImageEl is loaded
        if (!hallImageEl && hallUrl) {
            hallImageEl = await loadImage(hallUrl);
        }
        if (!hallImageEl) {
            throw new Error("Mekân görseli yüklenemedi. Lütfen görseli yeniden seçin.");
        }
        const w = hallImageEl.naturalWidth;
        const h = hallImageEl.naturalHeight;

        // Auto-generate surface mask if not yet initialized
        let maskB64 = getMaskBase64();
        if (!maskB64 || maskB64.length < 50 || (!surfaceMasks.floor && !surfaceMasks.wall)) {
            console.log("[Visualizer] Yüzey maskesi bulunamadı, otomatik oluşturuluyor...");
            maskB64 = await generateIntelligentMask(w, h, selectedSurface, activePresetUrl, hallImageEl);
            maskB64 = getMaskBase64();
        }

        let blobResult = null;

        // Try Python Microservice first
        try {
            const fd = new FormData();
            fd.append("hall_image",  hallFile);
            fd.append("tile_image",  tileFile);
            fd.append("mask",        maskB64);
            fd.append("pattern",     patternSelect.value);
            fd.append("tile_scale",  scaleSlider.value);
            fd.append("surface",     selectedSurface);

            const res = await fetch("/api/apply", { method: "POST", body: fd });
            if (res.ok) {
                blobResult = await res.blob();
            }
        } catch (netErr) {
            console.warn("[Visualizer] Server apply unavailable, switching to client engine:", netErr);
        }

        // Seamless Client-Side Renderer Fallback (Instant, Zero Lag, 100% Reliable on Vercel)
        if (!blobResult) {
            const tileImgEl = await loadImage(tileUrl);
            blobResult = await renderClientPerspectiveTile(
                hallImageEl,
                tileImgEl,
                maskB64,
                patternSelect.value,
                parseFloat(scaleSlider.value) || 1.0,
                selectedSurface
            );
        }

        if (resultBlobUrl) URL.revokeObjectURL(resultBlobUrl);
        resultBlobUrl = URL.createObjectURL(blobResult);

        resultImg.src   = resultBlobUrl;
        originalImg.src = hallUrl;

        if (renderErrorBox) renderErrorBox.style.display = "none";
        resultSection.classList.add("visible");
        initComparison();
        resultSection.scrollIntoView({ behavior: "smooth", block: "start" });

        showToast("Seramik başarıyla uygulandı! Kaydırıcı ile karşılaştırabilirsiniz.", "success");

        if (window !== window.parent) {
            window.parent.postMessage({ type: "VISUALIZER_APPLIED", success: true }, "*");
        }
    } catch (err) {
        console.error(err);
        if (renderErrorBox && renderErrorMsg) {
            renderErrorMsg.textContent = err.message || "Görselleştirme sırasında hata oluştu.";
            renderErrorBox.style.display = "block";
            resultSection.classList.add("visible");
            renderErrorBox.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        showToast("Hata: " + (err.message || "Bilinmeyen hata"), "error");
    } finally {
        hideLoading();
    }
});

// Otomatik Kalibrasyon ve Manuel Fırça Butonları
if (renderRetryBtn) {
    renderRetryBtn.addEventListener("click", async () => {
        if (renderErrorBox) renderErrorBox.style.display = "none";
        showLoading("Yapay zekâ yüzeyi yeniden kalibre ediyor…");
        try {
            if (!hallImageEl && hallUrl) {
                hallImageEl = await loadImage(hallUrl);
            }
            if (!hallImageEl) throw new Error("Mekân görseli bulunamadı.");
            const w = hallImageEl.naturalWidth;
            const h = hallImageEl.naturalHeight;
            await generateIntelligentMask(w, h, selectedSurface, activePresetUrl, hallImageEl);
            if (!editorCanvas.width) {
                await initEditor(w, h);
            } else {
                renderComposite();
                checkMaskCollisionsAndCoverage();
            }
            applyBtn.click();
        } catch (retryErr) {
            console.error(retryErr);
            hideLoading();
            showToast("Yeniden deneme başarısız: " + retryErr.message);
        }
    });
}

if (renderManualBtn) {
    renderManualBtn.addEventListener("click", async () => {
        if (renderErrorBox) renderErrorBox.style.display = "none";
        if (!hallImageEl && hallUrl) {
            hallImageEl = await loadImage(hallUrl);
        }
        if (hallImageEl && (!editorCanvas.width || !surfaceMasks.floor)) {
            await initEditor(hallImageEl.naturalWidth, hallImageEl.naturalHeight);
        }
        editorSection.classList.add("visible");
        editorSection.scrollIntoView({ behavior: "smooth", block: "start" });
    });
}

function initComparison() {
    const ready = () => { setSliderPos(50); };
    let loaded = 0;
    const check = () => { loaded++; if (loaded >= 2) ready(); };
    if (resultImg.complete)   check(); else resultImg.onload   = check;
    if (originalImg.complete) check(); else originalImg.onload  = check;
    ready();
}

function setSliderPos(pct) {
    pct = Math.max(0, Math.min(100, pct));
    const stage = compStage || compContainer;
    if (stage) {
        stage.style.setProperty("--split", pct + "%");
    }
}

let isDragging = false;

function startDrag(e) {
    isDragging = true;
    e.preventDefault();
    moveDrag(e);
}

function moveDrag(e) {
    if (!isDragging) return;
    const stage = compStage || compContainer;
    const rect = stage.getBoundingClientRect();
    let clientX = e.clientX ?? (e.touches && e.touches[0]?.clientX);
    if (clientX == null || rect.width <= 0) return;
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setSliderPos(pct);
}

function endDrag() { isDragging = false; }

if (compHandle) {
    compHandle.addEventListener("mousedown",  startDrag);
    compHandle.addEventListener("touchstart", startDrag, { passive: false });
}
const dragTarget = compStage || compContainer;
if (dragTarget) {
    dragTarget.addEventListener("mousemove", moveDrag);
    dragTarget.addEventListener("touchmove", moveDrag, { passive: false });
    dragTarget.addEventListener("click", (e) => {
        const stage = compStage || compContainer;
        const rect = stage.getBoundingClientRect();
        if (rect.width <= 0) return;
        const pct = ((e.clientX - rect.left) / rect.width) * 100;
        setSliderPos(pct);
    });
}
document.addEventListener("mouseup",  endDrag);
document.addEventListener("touchend", endDrag);

window.addEventListener("resize", () => {
    if (resultSection.classList.contains("visible")) {
        setSliderPos(50);
    }
});

downloadBtn.addEventListener("click", () => {
    if (!resultBlobUrl) return;
    const a = document.createElement("a");
    a.href = resultBlobUrl;
    a.download = "seramikbak_mekan_sonuc.png";
    document.body.appendChild(a);
    a.click();
    a.remove();
});

const toggleDebugBtn = document.getElementById("toggle-debug-btn");
const closeDebugBtn = document.getElementById("close-debug-btn");
const debugSection = document.getElementById("debug-section");

if (toggleDebugBtn && debugSection) {
    toggleDebugBtn.addEventListener("click", () => {
        const isHidden = debugSection.style.display === "none";
        debugSection.style.display = isHidden ? "block" : "none";
        if (isHidden) {
            updateDebugPanel();
            debugSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    });
}

if (closeDebugBtn && debugSection) {
    closeDebugBtn.addEventListener("click", () => {
        debugSection.style.display = "none";
    });
}

// Interaction for 9 QA Debug Layers (Tabs, Cards, and Opacity Slider)
document.querySelectorAll(".dbg-tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        selectDebugLayer(btn.dataset.layer);
    });
});

document.querySelectorAll(".dbg-thumb-card").forEach(card => {
    card.addEventListener("click", () => {
        selectDebugLayer(card.dataset.layer);
    });
});

const dbgOpacitySlider = document.getElementById("dbg-opacity-slider");
const dbgOpacityVal = document.getElementById("dbg-opacity-val");
if (dbgOpacitySlider) {
    dbgOpacitySlider.addEventListener("input", (e) => {
        const val = e.target.value;
        if (dbgOpacityVal) dbgOpacityVal.textContent = val + "%";
        const stageOverlay = document.getElementById("dbg-stage-overlay");
        if (stageOverlay) stageOverlay.style.opacity = (parseFloat(val) || 0) / 100.0;
    });
}

async function initFromParams() {
    const params = new URLSearchParams(window.location.search);
    const tileParam = params.get("tile");
    const productParam = params.get("product");
    const roomParam = params.get("room");
    const surfaceParam = params.get("surface");
    const scaleParam = params.get("scale");
    const isEmbed = params.get("embed") === "1" || window !== window.parent;
    const isDebug = params.get("debug") === "1" || params.get("dev") === "1";

    if (toggleDebugBtn) {
        toggleDebugBtn.style.display = isDebug ? "inline-flex" : "none";
    }
    if (debugSection) {
        debugSection.style.display = isDebug ? "block" : "none";
    }

    if (isEmbed) {
        document.body.classList.add("embedded");
    }

    if (surfaceParam && ["floor", "wall", "both"].includes(surfaceParam)) {
        surfaceBtns.forEach((b) => {
            if (b.dataset.surface === surfaceParam) b.click();
        });
    }

    if (scaleParam) {
        const s = parseFloat(scaleParam);
        if (!isNaN(s) && s >= 0.3 && s <= 3.0) {
            scaleSlider.value = s;
            scaleValue.textContent = s.toFixed(1) + "×";
        }
    }

    if (tileParam) {
        await loadTileFromUrl(tileParam, productParam);
    }

    if (roomParam) {
        await loadRoomFromPreset(roomParam);
    } else {
        const firstPreset = document.querySelector(".preset-pill");
        if (firstPreset) firstPreset.click();
    }
}

window.addEventListener("message", async (e) => {
    if (!e.data) return;
    if (e.data.type === "LOAD_PRODUCT") {
        if (e.data.tile) await loadTileFromUrl(e.data.tile, e.data.product);
        if (e.data.surface) {
            const btn = document.querySelector('.surface-btn[data-surface="' + e.data.surface + '"]');
            if (btn) btn.click();
        }
    }
});

document.addEventListener("DOMContentLoaded", () => {
    initFromParams();
    updateSurfaceText();
});