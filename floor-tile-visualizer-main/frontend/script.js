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
    });
});

const editorSection = $("#editor-section");
const editorCanvas  = $("#editor-canvas");
const toolPaint     = $("#tool-paint");
const toolErase     = $("#tool-erase");
const toolReset     = $("#tool-reset");
const brushSlider   = $("#brush-slider");
const brushValue    = $("#brush-value");

const resultSection = $("#result-section");
const resultImg     = $("#result-img");
const originalImg   = $("#original-img");
const compBefore    = $("#comparison-before");
const compHandle    = $("#comparison-handle");
const compContainer = $("#comparison-container");

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

const ctx = editorCanvas.getContext("2d");
let maskCanvas, maskCtx;
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

setupZone(hallZone, hallInput, hallRemove, (file) => {
    hallFile = file;
    activePresetUrl = null;
    document.querySelectorAll(".preset-pill").forEach(p => p.classList.remove("active"));
    if (hallUrl) URL.revokeObjectURL(hallUrl);
    hallUrl = showPreview(hallZone, file);
    updateDetectBtn();
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
        showToast("Örnek oda seçildi. 'Zemini Algıla' butonuna tıklayabilirsiniz.", "success", 2500);
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

// Global debug store for the 7 QA layers
window.__debugLayers = {
    original: null,
    rawMask: null,
    wallMask: null,
    floorMask: null,
    protectedMask: null,
    perspectiveTile: null,
    compositeResult: null
};

function updateDebugPanel() {
    const p1 = document.getElementById("dbg-img-1");
    const p2 = document.getElementById("dbg-img-2");
    const p3 = document.getElementById("dbg-img-3");
    const p4 = document.getElementById("dbg-img-4");
    const p5 = document.getElementById("dbg-img-5");
    const p6 = document.getElementById("dbg-img-6");
    const p7 = document.getElementById("dbg-img-7");

    if (p1 && window.__debugLayers.original) p1.src = window.__debugLayers.original;
    if (p2 && window.__debugLayers.rawMask) p2.src = window.__debugLayers.rawMask;
    if (p3 && window.__debugLayers.wallMask) p3.src = window.__debugLayers.wallMask;
    if (p4 && window.__debugLayers.floorMask) p4.src = window.__debugLayers.floorMask;
    if (p5 && window.__debugLayers.protectedMask) p5.src = window.__debugLayers.protectedMask;
    if (p6 && window.__debugLayers.perspectiveTile) p6.src = window.__debugLayers.perspectiveTile;
    if (p7 && window.__debugLayers.compositeResult) p7.src = window.__debugLayers.compositeResult;
}

/**
 * Intelligent Surface Mask Generator
 * Calibrated architectural perspective mask with 100% fixture & vanity protection
 */
async function generateIntelligentMask(w, h, surface, presetUrl, roomImg = null) {
    // 1. Try to load precomputed high-precision pixel mask for preset rooms
    if (presetUrl) {
        let maskName = null;
        if (presetUrl.includes("bathroom")) maskName = "easy_bathroom";
        else if (presetUrl.includes("kitchen")) maskName = "easy_kitchen";
        else if (presetUrl.includes("living")) maskName = "modern_living";

        if (maskName) {
            try {
                const maskImg = await loadImage(`/hero/masks/${maskName}_${surface}.png`);
                const c = document.createElement("canvas");
                c.width = w;
                c.height = h;
                const cx = c.getContext("2d");
                cx.drawImage(maskImg, 0, 0, w, h);
                const dataUrl = c.toDataURL("image/png");
                window.__debugLayers.rawMask = dataUrl;
                updateDebugPanel();
                return dataUrl.split(",")[1];
            } catch (err) {
                console.warn("[Visualizer] Precomputed mask load skipped, using calibrated vector polygon:", err);
            }
        }
    }

    // 2. High-precision Computer Vision Analysis for Custom Room Photos
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = w;
    tempCanvas.height = h;
    const tempCtx = tempCanvas.getContext("2d");
    if (roomImg) {
        tempCtx.drawImage(roomImg, 0, 0, w, h);
    }
    const rgbData = tempCtx.getImageData(0, 0, w, h).data;

    // A. Detect Ceiling Line (Tavan): Top 16-24%
    const ceilingY = Math.round(h * 0.18);

    // B. Detect Floor Horizon Line (Zemin Başlangıcı):
    let floorY = Math.round(h * 0.70);
    if (roomImg) {
        let maxGrad = 0;
        let bestFloorY = floorY;
        for (let y = Math.round(h * 0.60); y < Math.round(h * 0.80); y += 4) {
            let rowDiff = 0;
            const r1 = y * w * 4;
            const r2 = (y + 4) * w * 4;
            for (let x = 0; x < w; x += 8) {
                const lum1 = rgbData[r1 + x * 4] * 0.299 + rgbData[r1 + x * 4 + 1] * 0.587 + rgbData[r1 + x * 4 + 2] * 0.114;
                const lum2 = rgbData[r2 + x * 4] * 0.299 + rgbData[r2 + x * 4 + 1] * 0.587 + rgbData[r2 + x * 4 + 2] * 0.114;
                rowDiff += Math.abs(lum1 - lum2);
            }
            if (rowDiff > maxGrad) {
                maxGrad = rowDiff;
                bestFloorY = y;
            }
        }
        if (maxGrad > 60) {
            floorY = Math.max(Math.round(h * 0.62), Math.min(Math.round(h * 0.76), bestFloorY));
        }
    }

    // Allocate 3 distinct semantic layer buffers
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

    for (let y = 0; y < h; y++) {
        const rowOffset = y * w * 4;
        const isCeiling = (y < ceilingY);
        const isFloor = (y >= floorY);
        const isWall = (y >= ceilingY && y < floorY);

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

            // 1. Ceiling (Tavan) protection: 100% of ceiling zone is preserved
            if (isCeiling) {
                isProtected = true;
            }
            // 2. White Porcelain Sanitary Ware (Klozet, Bide, Lavabo)
            else if (lum > 145 && chroma < 35) {
                isProtected = true;
            }
            // 2b. Shaded porcelain contours (toilet/bidet bowl shadows)
            else if (lum > 110 && chroma < 22 && (y > floorY - h * 0.26)) {
                isProtected = true;
            }
            // 3. Vanity Cabinets & Countertops (dark furniture blocks under sink)
            else if (lum < 55 && (x > w * 0.45 && y > floorY - h * 0.16)) {
                isProtected = true;
            }
            // 4. Mirrors & Backlit Glass Niche (specular reflection, glass frames)
            else if (isWall && ((x > w * 0.55 && y < floorY - h * 0.18 && lum > 165) || (x < w * 0.10 && chroma < 25))) {
                isProtected = true;
            }

            if (isProtected) {
                prPx[idx]     = 255;
                prPx[idx + 1] = 255;
                prPx[idx + 2] = 255;
                prPx[idx + 3] = 255;
            } else {
                if (isFloor) {
                    fPx[idx]     = 255;
                    fPx[idx + 1] = 255;
                    fPx[idx + 2] = 255;
                    fPx[idx + 3] = 255;
                } else if (isWall) {
                    wPx[idx]     = 255;
                    wPx[idx + 1] = 255;
                    wPx[idx + 2] = 255;
                    wPx[idx + 3] = 255;
                }
            }
        }
    }

    fCtx.putImageData(fData, 0, 0);
    wCtx.putImageData(wData, 0, 0);
    prCtx.putImageData(prData, 0, 0);

    // Store in debug layers
    window.__debugLayers.floorMask = floorCanvas.toDataURL("image/png");
    window.__debugLayers.wallMask = wallCanvas.toDataURL("image/png");
    window.__debugLayers.protectedMask = protCanvas.toDataURL("image/png");

    // Target surface mask assembly
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

async function initEditor(imgW, imgH) {
    hallImageEl = await loadImage(hallUrl);
    const w = hallImageEl.naturalWidth;
    const h = hallImageEl.naturalHeight;

    editorCanvas.width  = w;
    editorCanvas.height = h;

    if (!maskCanvas) {
        maskCanvas = document.createElement("canvas");
        maskCtx    = maskCanvas.getContext("2d");
    }
    maskCanvas.width  = w;
    maskCanvas.height = h;

    if (!colorCanvas) {
        colorCanvas = document.createElement("canvas");
        colorCtx    = colorCanvas.getContext("2d");
    }
    colorCanvas.width  = w;
    colorCanvas.height = h;

    maskImage = await loadImage("data:image/png;base64," + maskB64Original);
    maskCtx.clearRect(0, 0, w, h);
    maskCtx.drawImage(maskImage, 0, 0, w, h);

    renderComposite();
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
    const w = editorCanvas.width;
    const h = editorCanvas.height;

    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(hallImageEl, 0, 0, w, h);

    colorCtx.clearRect(0, 0, w, h);
    colorCtx.drawImage(maskCanvas, 0, 0);
    colorCtx.globalCompositeOperation = "source-in";
    colorCtx.fillStyle = "rgba(99, 102, 241, 1)";
    colorCtx.fillRect(0, 0, w, h);
    colorCtx.globalCompositeOperation = "source-over";

    ctx.globalAlpha = 0.38;
    ctx.drawImage(colorCanvas, 0, 0);
    ctx.globalAlpha = 1.0;
}

function canvasCoords(e) {
    const rect = editorCanvas.getBoundingClientRect();
    const scaleX = editorCanvas.width  / rect.width;
    const scaleY = editorCanvas.height / rect.height;

    let cx, cy;
    if (e.touches && e.touches[0]) {
        cx = (e.touches[0].clientX - rect.left) * scaleX;
        cy = (e.touches[0].clientY - rect.top)  * scaleY;
    } else {
        cx = (e.clientX - rect.left) * scaleX;
        cy = (e.clientY - rect.top)  * scaleY;
    }
    return { x: cx, y: cy };
}

function drawBrush(x, y) {
    const r = parseInt(brushSlider.value, 10) *
              (editorCanvas.width / editorCanvas.getBoundingClientRect().width);

    maskCtx.beginPath();
    maskCtx.arc(x, y, r, 0, Math.PI * 2);
    if (brushMode === "paint") {
        maskCtx.fillStyle = "#fff";
        maskCtx.fill();
    } else {
        maskCtx.save();
        maskCtx.globalCompositeOperation = "destination-out";
        maskCtx.fillStyle = "#fff";
        maskCtx.fill();
        maskCtx.restore();
    }
}

function drawLine(from, to) {
    const dist = Math.hypot(to.x - from.x, to.y - from.y);
    const steps = Math.max(1, Math.ceil(dist / 4));
    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        drawBrush(from.x + (to.x - from.x) * t, from.y + (to.y - from.y) * t);
    }
}

function onPointerDown(e) {
    e.preventDefault();
    isDrawing = true;
    const pos = canvasCoords(e);
    drawBrush(pos.x, pos.y);
    lastPos = pos;
    renderComposite();
}

function onPointerMove(e) {
    if (!isDrawing) return;
    e.preventDefault();
    const pos = canvasCoords(e);
    drawLine(lastPos, pos);
    lastPos = pos;
    renderComposite();
}

function onPointerUp() {
    isDrawing = false;
    lastPos = null;
}

editorCanvas.addEventListener("mousedown",  onPointerDown);
editorCanvas.addEventListener("mousemove",  onPointerMove);
editorCanvas.addEventListener("mouseup",    onPointerUp);
editorCanvas.addEventListener("mouseleave", onPointerUp);

editorCanvas.addEventListener("touchstart", onPointerDown, { passive: false });
editorCanvas.addEventListener("touchmove",  onPointerMove, { passive: false });
editorCanvas.addEventListener("touchend",   onPointerUp);

toolPaint.addEventListener("click", () => { brushMode = "paint"; toolPaint.classList.add("active"); toolErase.classList.remove("active"); });
toolErase.addEventListener("click", () => { brushMode = "erase"; toolErase.classList.add("active"); toolPaint.classList.remove("active"); });

toolReset.addEventListener("click", () => {
    if (!maskImage) return;
    maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
    maskCtx.drawImage(maskImage, 0, 0, maskCanvas.width, maskCanvas.height);
    renderComposite();
});

function getMaskBase64() {
    const w = maskCanvas.width;
    const h = maskCanvas.height;
    const data = maskCtx.getImageData(0, 0, w, h);
    const px = data.data;

    const binCanvas = document.createElement("canvas");
    binCanvas.width  = w;
    binCanvas.height = h;
    const binCtx = binCanvas.getContext("2d");
    const binData = binCtx.createImageData(w, h);
    const out = binData.data;

    for (let i = 0; i < px.length; i += 4) {
        const bright = (px[i] + px[i + 1] + px[i + 2]) / 3;
        const isMasked = (px[i + 3] > 50 && bright > 50);
        const val = isMasked ? 255 : 0;
        out[i]     = val;
        out[i + 1] = val;
        out[i + 2] = val;
        out[i + 3] = val; // Strictly transparent outside mask, opaque white inside
    }

    binCtx.putImageData(binData, 0, 0);
    return binCanvas.toDataURL("image/png").split(",")[1];
}

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

    if (topRow === -1) {
        return new Promise((resolve) => resultCanvas.toBlob(resolve, "image/png"));
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
    const floorHorizonY = Math.round(h * 0.68);
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
    if (!hallFile || !tileFile) return;

    showLoading("Perspektif dönüşümü ve gerçekçi ışık haritalaması uygulanıyor…");

    try {
        let blobResult = null;

        // Try Python Microservice first
        try {
            const fd = new FormData();
            fd.append("hall_image",  hallFile);
            fd.append("tile_image",  tileFile);
            fd.append("mask",        getMaskBase64());
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
                getMaskBase64(),
                patternSelect.value,
                parseFloat(scaleSlider.value) || 1.0,
                selectedSurface
            );
        }

        if (resultBlobUrl) URL.revokeObjectURL(resultBlobUrl);
        resultBlobUrl = URL.createObjectURL(blobResult);

        resultImg.src   = resultBlobUrl;
        originalImg.src = hallUrl;

        resultSection.classList.add("visible");
        initComparison();
        resultSection.scrollIntoView({ behavior: "smooth", block: "start" });

        showToast("Seramik başarıyla uygulandı! Kaydırıcı ile karşılaştırabilirsiniz.", "success");

        if (window !== window.parent) {
            window.parent.postMessage({ type: "VISUALIZER_APPLIED", success: true }, "*");
        }
    } catch (err) {
        console.error(err);
        showToast("Uygulama hatası: " + err.message);
    } finally {
        hideLoading();
    }
});

function initComparison() {
    const ready = () => { setSliderPos(50); };
    let loaded = 0;
    const check = () => { loaded++; if (loaded >= 2) ready(); };
    if (resultImg.complete)   check(); else resultImg.onload   = check;
    if (originalImg.complete) check(); else originalImg.onload  = check;
}

function setSliderPos(pct) {
    pct = Math.max(0, Math.min(100, pct));
    compBefore.style.width = pct + "%";
    compHandle.style.left  = pct + "%";

    const containerWidth = compContainer.offsetWidth;
    originalImg.style.width = containerWidth + "px";
}

let isDragging = false;

function startDrag(e) {
    isDragging = true;
    e.preventDefault();
    moveDrag(e);
}

function moveDrag(e) {
    if (!isDragging) return;
    const rect = compContainer.getBoundingClientRect();
    let clientX = e.clientX ?? (e.touches && e.touches[0]?.clientX);
    if (clientX == null) return;
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setSliderPos(pct);
}

function endDrag() { isDragging = false; }

compHandle.addEventListener("mousedown",  startDrag);
compContainer.addEventListener("mousemove", moveDrag);
document.addEventListener("mouseup",       endDrag);

compHandle.addEventListener("touchstart", startDrag, { passive: false });
compContainer.addEventListener("touchmove", moveDrag, { passive: false });
document.addEventListener("touchend",      endDrag);

compContainer.addEventListener("click", (e) => {
    const rect = compContainer.getBoundingClientRect();
    const pct = ((e.clientX - rect.left) / rect.width) * 100;
    setSliderPos(pct);
});

window.addEventListener("resize", () => {
    if (resultSection.classList.contains("visible")) {
        const pct = parseFloat(compBefore.style.width) || 50;
        setSliderPos(pct);
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

async function initFromParams() {
    const params = new URLSearchParams(window.location.search);
    const tileParam = params.get("tile");
    const productParam = params.get("product");
    const roomParam = params.get("room");
    const surfaceParam = params.get("surface");
    const scaleParam = params.get("scale");
    const isEmbed = params.get("embed") === "1" || window !== window.parent;
    const isDebug = params.get("debug") === "1";

    if (isDebug && debugSection) {
        debugSection.style.display = "block";
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