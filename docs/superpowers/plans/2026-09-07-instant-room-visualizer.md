# Instant Room Visualizer & Smart Quote Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the AR modal into a clean, modern "Odamda Canlı Gör (Instant Room Visualizer)" featuring realistic live room tiling, freeze-frame photo upload/snapshot, reliable room sizing presets, exact tile/adhesive/grout bill of materials, and direct 1-click WhatsApp quote to the nearest authorized dealer holding the product.

**Architecture:** A lightweight, high-performance HTML5 Canvas and WebRTC visualizer that lays real tile textures with realistic perspective and grout styling onto live or uploaded room imagery. Built with zero-leak camera lifecycle management (`streamRef` + `videoRef`), synchronized room sizing (presets + custom dimensions), and dynamic dealer-inventory geo-matching.

**Tech Stack:** Next.js 16 (App Router), React 19, HTML5 Canvas 2D, WebRTC MediaStream API, Prisma, Tailwind CSS.

**Spec:** `docs/superpowers/specs/2026-09-07-instant-room-visualizer-design.md`

## Global Constraints
- Zero camera hardware leak on close, escape, unmount, or pagehide.
- Do NOT display pseudo-scientific laser meter claims; focus on photorealistic room preview and transparent citizen metrics.
- Seamless mobile and desktop UX with responsive layout and touch support.
- Direct integration with `/api/dealers/nearest` prioritizing dealers with product in stock.

---

### Task 1: Rebuild AR Visualizer Core (`ARRoomScannerModal.jsx`)

**Files:**
- Modify: `src/components/ARRoomScannerModal.jsx`
- Test: `tests/quote_calc.test.js`

**Interfaces:**
- Consumes: `selectedProduct`, `currentDealer`, `/api/dealers/nearest`
- Produces: Visual room preview with live/freeze image, tile perspective overlay, layout styles (Düz, Çapraz, Balıksırtı), grout colors, snapshot download, and clean shutdown.

- [ ] **Step 1: Implement clean UI layout and state management**
  - Header with product name, brand, tile size (`60x120 cm`), and clean close button.
  - Surface toggle: `[ Duvar Kaplama ]` | `[ Zemin Kaplama ]`.
  - Tile styles: Düz, Çapraz, Balıksırtı with live rotation on Canvas.
  - Derz Rengi: Altın (`#d4af37`), Beyaz (`#ffffff`), Gri (`#94a3b8`), Antrasit (`#334155`).

- [ ] **Step 2: Implement Freeze-Frame & Photo Upload**
  - "📸 Fotoğrafı Dondur & Döşe": captures current video frame to freeze view so user can comfortably inspect tile without camera shake.
  - "📥 Odamı İndir": downloads high-res PNG of tiled room.
  - "🖼️ Galeriden Fotoğraf Yükle": allows testing tiles on an existing photo.

- [ ] **Step 3: Implement Zero-Leak Camera Lifecycle**
  - `streamRef` and `videoRef` track cleanup on unmount, close, and beforeunload.

- [ ] **Step 4: Implement Smart Room Sizing & Material Calculator**
  - 1-tap quick room presets:
    - 🚿 Küçük Banyo / WC (4.0 m²)
    - 🛁 Standart Banyo (6.2 m²)
    - 👑 Ebeveyn Banyosu (9.0 m²)
    - 🍳 Mutfak Tezgah Arası (1.8 m²)
    - 🌿 Teras / Balkon (8.0 m²)
  - Manual En × Boy inputs with instant recalculation.
  - Quick cutout deductions: `[ + 🚪 Kapı (-1.8 m²) ]`, `[ + 🪟 Pencere (-1.2 m²) ]`, `[ + 🚿 Duşakabin (-2.0 m²) ]`.
  - Accurate bill of materials: Net m², +10% waste m², tile boxes count, Kalekim 25kg bags, grout kg, estimated total cost.

- [ ] **Step 5: Implement Nearest Product-Holding Dealer Quote**
  - Fetches `/api/dealers/nearest?productId=${selectedProduct.id}&brandId=${selectedProduct.brandId}`.
  - Matches closest dealer with product in stock / authorized brand representation.
  - 1-click WhatsApp quote builder pre-filling exact product, box count, and materials.
  - Lead submission to `/api/ar/scan-lead`.

---

### Task 2: Verify and Test Integration

**Files:**
- Modify: `src/components/WebARModal.jsx` (verify delegation)
- Test: `npm run test`
- Build: `npm run build`

- [ ] **Step 1: Run unit tests to ensure calculation integrity**
  Run: `npm run test`
  Expected: All 19 tests pass.

- [ ] **Step 2: Run Next.js build**
  Run: `npm run build`
  Expected: Compiled successfully with 0 errors.

- [ ] **Step 3: Commit and Push**
  Run: `git add . && git commit -m "feat(ar): complete instant room visualizer with smart sizing and nearest dealer quote"`
