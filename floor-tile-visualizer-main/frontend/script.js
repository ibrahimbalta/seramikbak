/**
 * SeramikBak — Floor Tile Visualizer — Frontend Logic
 *
 * Handles:
 *  • Drag-and-drop / click image uploads with preview
 *  • URL query param & postMessage support (auto-load tile, presets, products)
 *  • Preset room quick selection (Modern Banyo, Ada Mutfak, Ferah Salon)
 *  • Calling /api/segment to get the SegFormer AI surface mask
 *  • Canvas-based mask editor (paint / erase / reset)
 *  • Calling /api/apply to generate perspective-aware composite
 *  • Before / after comparison slider
 *  • HD Result Download
 */

// ====================================================================
// DOM refs
// ====================================================================

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
const editorWrap    = $("#editor-canvas-wrap");
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

// ====================================================================
// State
// ====================================================================

let hallFile  = null;   // File object
let tileFile  = null;
let hallUrl   = null;   // Object URL for preview
let tileUrl   = null;

let maskB64Original = null;   // base64 PNG from the server
let maskImage       = null;   // HTMLImageElement of the mask (for reset)

// Canvas / editor state
const ctx = editorCanvas.getContext("2d");
let maskCanvas, maskCtx;        // off-screen mask layer
let colorCanvas, colorCtx;      // off-screen tinting layer
let hallImageEl = null;         // HTMLImageElement of hall image at full res
let brushMode  = "paint";       // "paint" | "erase"
let isDrawing  = false;
let lastPos    = null;

// Result blob URL for download
let resultBlobUrl = null;

// ====================================================================
// Helpers
// ====================================================================

function showLoading(msg = "Yapay zekâ işlemi sürüyor…") {
    loadingText.textContent = msg;
    loadingOverlay.classList.add("active");
}
function hideLoading() { loadingOverlay.classList.remove("active"); }

function showToast(msg, type = "error", duration = 4000) {
    toastEl.textContent = msg;
    toastEl.className = `toast ${type} visible`;
    clearTimeout(toastEl._timer);
    toastEl._timer = setTimeout(() => toastEl.classList.remove("visible"), duration);
}

function updateDetectBtn() {
    detectBtn.disabled = !(hallFile && tileFile);
}

// Convert an external or relative URL to a File object
async function urlToFile(url, filename = "image.jpg") {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Görsel indirilemedi: ${url}`);
    const blob = await res.blob();
    const mime = blob.type || "image/jpeg";
    return new File([blob], filename, { type: mime });
}

// ====================================================================
// Upload handling
// ====================================================================

function setupZone(zone, input, removeBtn, setFile) {
    // Click → open file picker
    zone.addEventListener("click", (e) => {
        if (e.target === removeBtn || removeBtn.contains(e.target)) return;
        input.click();
    });

    // Drag events
    zone.addEventListener("dragover", (e) => { e.preventDefault(); zone.classList.add("dragover"); });
    zone.addEventListener("dragleave", ()  => { zone.classList.remove("dragover"); });
    zone.addEventListener("drop", (e) => {
        e.preventDefault();
        zone.classList.remove("dragover");
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith("image/")) setFile(file);
    });

    // File input change
    input.addEventListener("change", () => {
        if (input.files[0]) setFile(input.files[0]);
    });

    // Remove button
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
    // Remove placeholder elements
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

// Load Tile Texture from URL
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
        if (tileStatusHint) tileStatusHint.textContent = "Manuel seçin";
    }
}

// Load Hall / Room from Preset URL
async function loadRoomFromPreset(url, pillBtn = null) {
    try {
        showLoading("Örnek oda yükleniyor...");
        const file = await urlToFile(url, "preset_room.jpg");
        hallFile = file;
        if (hallUrl) URL.revokeObjectURL(hallUrl);
        hallUrl = showPreview(hallZone, file);

        document.querySelectorAll(".preset-pill").forEach(p => p.classList.remove("active"));
        if (pillBtn) pillBtn.classList.add("active");

        updateDetectBtn();
        showToast("Örnek oda hazır. 'Yüzeyi Algıla' butonuna tıklayabilirsiniz.", "success", 3000);
    } catch (err) {
        showToast("Örnek oda yüklenirken hata oluştu: " + err.message);
    } finally {
        hideLoading();
    }
}

// Room Preset buttons click handlers
document.querySelectorAll(".preset-pill").forEach((btn) => {
    btn.addEventListener("click", () => {
        const presetUrl = btn.dataset.preset;
        if (presetUrl) {
            loadRoomFromPreset(presetUrl, btn);
        }
    });
});

// ====================================================================
// Scale slider
// ====================================================================

scaleSlider.addEventListener("input", () => {
    scaleValue.textContent = `${parseFloat(scaleSlider.value).toFixed(1)}×`;
});

brushSlider.addEventListener("input", () => {
    brushValue.textContent = brushSlider.value;
});

// ====================================================================
// Detect floor (Step 2 → Step 3)
// ====================================================================

detectBtn.addEventListener("click", async () => {
    if (!hallFile) return;

    const surfaceLabel = selectedSurface === "wall" ? "duvar" : selectedSurface === "both" ? "zemin ve duvar" : "zemin";
    showLoading(`SegFormer AI ${surfaceLabel} yüzeyini analiz ediyor…`);

    try {
        const fd = new FormData();
        fd.append("hall_image", hallFile);
        fd.append("surface", selectedSurface);

        const res = await fetch("/api/segment", { method: "POST", body: fd });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail || `Sunucu hatası: ${res.status}`);
        }

        const data = await res.json();
        maskB64Original = data.mask;

        // Build mask image
        await initEditor(data.width, data.height);

        editorSection.classList.add("visible");
        editorSection.scrollIntoView({ behavior: "smooth", block: "start" });
        showToast(`${selectedSurface === "wall" ? "Duvar" : selectedSurface === "both" ? "Zemin ve duvar" : "Zemin"} başarıyla tespit edildi! İnce ayar yapabilir veya direkt uygulayabilirsiniz.`, "success");
    } catch (err) {
        showToast(err.message);
    } finally {
        hideLoading();
    }
});

// ====================================================================
// Mask editor
// ====================================================================

async function initEditor(imgW, imgH) {
    // Load hall image at full resolution into an HTMLImageElement
    hallImageEl = await loadImage(hallUrl);

    // Use the actual image dimensions for the canvas
    const w = hallImageEl.naturalWidth;
    const h = hallImageEl.naturalHeight;

    editorCanvas.width  = w;
    editorCanvas.height = h;

    // Off-screen mask canvas
    if (!maskCanvas) {
        maskCanvas = document.createElement("canvas");
        maskCtx    = maskCanvas.getContext("2d");
    }
    maskCanvas.width  = w;
    maskCanvas.height = h;

    // Off-screen colour tinting canvas
    if (!colorCanvas) {
        colorCanvas = document.createElement("canvas");
        colorCtx    = colorCanvas.getContext("2d");
    }
    colorCanvas.width  = w;
    colorCanvas.height = h;

    // Draw the AI mask onto the mask canvas
    maskImage = await loadImage("data:image/png;base64," + maskB64Original);
    maskCtx.clearRect(0, 0, w, h);
    maskCtx.drawImage(maskImage, 0, 0, w, h);

    renderComposite();
}

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
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

    // Tint the mask
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

// --- Drawing ---

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

// --- Tool buttons ---

toolPaint.addEventListener("click", () => { brushMode = "paint"; toolPaint.classList.add("active"); toolErase.classList.remove("active"); });
toolErase.addEventListener("click", () => { brushMode = "erase"; toolErase.classList.add("active"); toolPaint.classList.remove("active"); });

toolReset.addEventListener("click", () => {
    if (!maskImage) return;
    maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
    maskCtx.drawImage(maskImage, 0, 0, maskCanvas.width, maskCanvas.height);
    renderComposite();
});

// ====================================================================
// Apply tile (Step 3 → Step 4)
// ====================================================================

function getMaskBase64() {
    // Binarise the mask canvas: anything with alpha > 0 or brightness > 50% → 255
    const w = maskCanvas.width;
    const h = maskCanvas.height;
    const data = maskCtx.getImageData(0, 0, w, h);
    const px = data.data;

    // Create a clean black/white canvas
    const binCanvas = document.createElement("canvas");
    binCanvas.width  = w;
    binCanvas.height = h;
    const binCtx = binCanvas.getContext("2d");
    const binData = binCtx.createImageData(w, h);
    const out = binData.data;

    for (let i = 0; i < px.length; i += 4) {
        const bright = (px[i] + px[i + 1] + px[i + 2]) / 3;
        const val = (px[i + 3] > 50 && bright > 50) ? 255 : 0;
        out[i]     = val;
        out[i + 1] = val;
        out[i + 2] = val;
        out[i + 3] = 255;
    }

    binCtx.putImageData(binData, 0, 0);

    // Return pure base64 (no data-url prefix)
    return binCanvas.toDataURL("image/png").split(",")[1];
}

applyBtn.addEventListener("click", async () => {
    if (!hallFile || !tileFile) return;

    showLoading("Perspektif dönüşümü ve gerçekçi ışık haritalaması uygulanıyor…");

    try {
        const fd = new FormData();
        fd.append("hall_image",  hallFile);
        fd.append("tile_image",  tileFile);
        fd.append("mask",        getMaskBase64());
        fd.append("pattern",     patternSelect.value);
        fd.append("tile_scale",  scaleSlider.value);
        fd.append("surface",     selectedSurface);

        const res = await fetch("/api/apply", { method: "POST", body: fd });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail || `Sunucu hatası: ${res.status}`);
        }

        const blob = await res.blob();
        if (resultBlobUrl) URL.revokeObjectURL(resultBlobUrl);
        resultBlobUrl = URL.createObjectURL(blob);

        // Show comparison
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
        showToast(err.message);
    } finally {
        hideLoading();
    }
});

// ====================================================================
// Comparison slider
// ====================================================================

function initComparison() {
    // Wait for images to load
    const ready = () => {
        setSliderPos(50);
    };

    let loaded = 0;
    const check = () => { loaded++; if (loaded >= 2) ready(); };
    if (resultImg.complete)   check(); else resultImg.onload   = check;
    if (originalImg.complete) check(); else originalImg.onload  = check;
}

function setSliderPos(pct) {
    pct = Math.max(0, Math.min(100, pct));
    compBefore.style.width = pct + "%";
    compHandle.style.left  = pct + "%";

    // Keep the "before" image the same visual width as the container
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

// Also allow click anywhere on the container
compContainer.addEventListener("click", (e) => {
    const rect = compContainer.getBoundingClientRect();
    const pct = ((e.clientX - rect.left) / rect.width) * 100;
    setSliderPos(pct);
});

// Recalculate on resize
window.addEventListener("resize", () => {
    if (resultSection.classList.contains("visible")) {
        const pct = parseFloat(compBefore.style.width) || 50;
        setSliderPos(pct);
    }
});

// ====================================================================
// Download
// ====================================================================

downloadBtn.addEventListener("click", () => {
    if (!resultBlobUrl) return;
    const a = document.createElement("a");
    a.href = resultBlobUrl;
    a.download = "seramikbak_mekan_sonuc.png";
    document.body.appendChild(a);
    a.click();
    a.remove();
});

// ====================================================================
// Initialize from URL Params & Window Messages
// ====================================================================

async function initFromParams() {
    const params = new URLSearchParams(window.location.search);
    const tileParam = params.get("tile");
    const productParam = params.get("product");
    const roomParam = params.get("room");
    const surfaceParam = params.get("surface");
    const scaleParam = params.get("scale");

    if (surfaceParam && ["floor", "wall", "both"].includes(surfaceParam)) {
        surfaceBtns.forEach((b) => {
            if (b.dataset.surface === surfaceParam) {
                b.click();
            }
        });
    }

    if (scaleParam) {
        const s = parseFloat(scaleParam);
        if (!isNaN(s) && s >= 0.3 && s <= 3.0) {
            scaleSlider.value = s;
            scaleValue.textContent = `${s.toFixed(1)}×`;
        }
    }

    if (tileParam) {
        await loadTileFromUrl(tileParam, productParam);
    }

    if (roomParam) {
        await loadRoomFromPreset(roomParam);
    } else {
        // By default, select first preset room for instant demo if no room loaded
        const firstPreset = document.querySelector(".preset-pill");
        if (firstPreset) {
            firstPreset.click();
        }
    }
}

// PostMessage Listener for embedding inside React Modals
window.addEventListener("message", async (e) => {
    if (!e.data) return;
    if (e.data.type === "LOAD_PRODUCT") {
        if (e.data.tile) await loadTileFromUrl(e.data.tile, e.data.product);
        if (e.data.surface) {
            const btn = document.querySelector(`.surface-btn[data-surface="${e.data.surface}"]`);
            if (btn) btn.click();
        }
    }
});

// Run init on DOM ready
document.addEventListener("DOMContentLoaded", () => {
    initFromParams();
    updateSurfaceText();
});
