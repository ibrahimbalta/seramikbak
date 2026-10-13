'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Type,
  Image as ImageIcon,
  Square,
  Minus,
  Trash2,
  Copy,
  Plus,
  MoveUp,
  MoveDown,
  Undo2,
  Redo2,
  Lock,
  Unlock,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Grid,
  Save,
  Eye,
  Layers,
  Sparkles,
  Check,
  Palette
} from 'lucide-react';

const DEFAULT_PAGES = [
  {
    id: 'page-cover',
    title: 'Kapak Sayfası',
    type: 'cover',
    bgColor: '#18181b',
    elements: [
      {
        id: 'el-1',
        type: 'text',
        x: 60,
        y: 80,
        width: 420,
        height: 40,
        content: 'SERAMİK KOLEKSİYONU 2026',
        fontSize: 13,
        fontWeight: '700',
        color: '#d4af37',
        align: 'left',
        locked: false
      },
      {
        id: 'el-2',
        type: 'text',
        x: 60,
        y: 130,
        width: 460,
        height: 90,
        content: 'MİMARİ PORSELEN & DOĞAL TAŞ SEÇKİSİ',
        fontSize: 30,
        fontWeight: '800',
        color: '#ffffff',
        align: 'left',
        locked: false
      },
      {
        id: 'el-3',
        type: 'line',
        x: 60,
        y: 235,
        width: 120,
        height: 3,
        color: '#d4af37',
        locked: false
      },
      {
        id: 'el-4',
        type: 'image',
        x: 60,
        y: 270,
        width: 475,
        height: 420,
        src: '/renders/luxury_bathroom_calacatta_gold.jpg',
        locked: false
      },
      {
        id: 'el-5',
        type: 'text',
        x: 60,
        y: 720,
        width: 475,
        height: 30,
        content: 'TECHNICAL & ARCHITECTURAL CATALOG • TS EN 14411',
        fontSize: 11,
        fontWeight: '500',
        color: '#a1a1aa',
        align: 'left',
        locked: false
      }
    ]
  },
  {
    id: 'page-product-1',
    title: 'Koleksiyon Detay Sayfası',
    type: 'product',
    bgColor: '#ffffff',
    elements: [
      {
        id: 'el-p1',
        type: 'text',
        x: 50,
        y: 45,
        width: 495,
        height: 40,
        content: 'CALACATTA GOLD SERIES',
        fontSize: 24,
        fontWeight: '800',
        color: '#0f172a',
        align: 'left',
        locked: false
      },
      {
        id: 'el-p2',
        type: 'text',
        x: 50,
        y: 88,
        width: 495,
        height: 35,
        content: '60x120 cm • Rektifiyeli • Full Lappato & Mat Yüzey Seçenekleri',
        fontSize: 12,
        fontWeight: '500',
        color: '#64748b',
        align: 'left',
        locked: false
      },
      {
        id: 'el-p3',
        type: 'image',
        x: 50,
        y: 135,
        width: 495,
        height: 340,
        src: '/renders/modern_living_natural_oak.jpg',
        locked: false
      },
      {
        id: 'el-p4',
        type: 'box',
        x: 50,
        y: 500,
        width: 495,
        height: 180,
        color: '#f8fafc',
        borderColor: '#e2e8f0',
        locked: false
      },
      {
        id: 'el-p5',
        type: 'text',
        x: 70,
        y: 520,
        width: 455,
        height: 140,
        content: 'TEKNİK ÖZELLİKLER:\n• Ebat: 60x120 cm / 120x240 cm\n• Kalınlık: 9.5 mm\n• Su Emme: E ≤ %0.5 (Grup BIa Porselen)\n• Yüzey: Rektifiyeli Mat / Lappato',
        fontSize: 13,
        fontWeight: '500',
        color: '#1e293b',
        align: 'left',
        locked: false
      }
    ]
  }
];

export default function CatalogVisualCanvasEditor({
  initialPages,
  brandProducts = [],
  brandInfo = {},
  onChangePages,
  onSaveDraft
}) {
  const [pages, setPages] = useState(() => {
    if (Array.isArray(initialPages) && initialPages.length > 0) return initialPages;
    return DEFAULT_PAGES;
  });
  const [activePageIdx, setActivePageIdx] = useState(0);
  const [selectedElId, setSelectedElId] = useState(null);
  const [showGrid, setShowGrid] = useState(true);
  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);
  const [autoSaveStatus, setAutoSaveStatus] = useState('Kaydedildi');

  // Dragging & Resizing refs
  const canvasRef = useRef(null);
  const dragInfoRef = useRef(null);

  const currentPage = pages[activePageIdx] || pages[0];
  const selectedEl = currentPage?.elements?.find((e) => e.id === selectedElId) || null;

  // Notify parent when pages change
  useEffect(() => {
    if (onChangePages) {
      onChangePages(pages);
    }
    setAutoSaveStatus('Otomatik kaydedildi');
  }, [pages]);

  const pushHistory = (newPages) => {
    setHistory((prev) => [...prev.slice(-19), pages]);
    setFuture([]);
    setPages(newPages);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setFuture((prev) => [pages, ...prev]);
    setPages(previous);
  };

  const handleRedo = () => {
    if (future.length === 0) return;
    const next = future[0];
    setFuture((prev) => prev.slice(1));
    setHistory((prev) => [...prev, pages]);
    setPages(next);
  };

  // Element operations
  const addElement = (type, extra = {}) => {
    const newEl = {
      id: `el-${Date.now()}`,
      type,
      x: 80,
      y: 120,
      width: type === 'text' ? 320 : type === 'line' ? 250 : 240,
      height: type === 'text' ? 50 : type === 'line' ? 3 : 180,
      content: type === 'text' ? 'Yeni Metin Alanı — Çift tıklayarak düzenleyin' : '',
      fontSize: 16,
      fontWeight: '700',
      color: type === 'box' ? '#f1f5f9' : currentPage.bgColor === '#18181b' ? '#ffffff' : '#0f172a',
      borderColor: '#cbd5e1',
      align: 'left',
      src: extra.src || '/renders/luxury_bathroom_calacatta_gold.jpg',
      locked: false,
      ...extra
    };

    const updated = pages.map((p, idx) =>
      idx === activePageIdx ? { ...p, elements: [...p.elements, newEl] } : p
    );
    pushHistory(updated);
    setSelectedElId(newEl.id);
  };

  const updateSelectedElement = (patch) => {
    if (!selectedElId) return;
    const updated = pages.map((p, idx) => {
      if (idx !== activePageIdx) return p;
      return {
        ...p,
        elements: p.elements.map((el) => (el.id === selectedElId ? { ...el, ...patch } : el))
      };
    });
    pushHistory(updated);
  };

  const deleteSelectedElement = () => {
    if (!selectedElId) return;
    const updated = pages.map((p, idx) => {
      if (idx !== activePageIdx) return p;
      return {
        ...p,
        elements: p.elements.filter((el) => el.id !== selectedElId)
      };
    });
    pushHistory(updated);
    setSelectedElId(null);
  };

  const changeLayerOrder = (direction) => {
    if (!selectedElId) return;
    const els = [...currentPage.elements];
    const idx = els.findIndex((e) => e.id === selectedElId);
    if (idx === -1) return;
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= els.length) return;
    const temp = els[idx];
    els[idx] = els[targetIdx];
    els[targetIdx] = temp;

    const updated = pages.map((p, i) => (i === activePageIdx ? { ...p, elements: els } : p));
    pushHistory(updated);
  };

  // Page operations
  const handleAddPage = (pageType = 'product') => {
    const newPage = {
      id: `page-${Date.now()}`,
      title: pageType === 'cover' ? 'Kapak Sayfası' : pageType === 'specs' ? 'Teknik Özellikler' : `Sayfa #${pages.length + 1}`,
      type: pageType,
      bgColor: '#ffffff',
      elements: [
        {
          id: `el-${Date.now()}-1`,
          type: 'text',
          x: 50,
          y: 50,
          width: 495,
          height: 40,
          content: pageType === 'specs' ? 'TEKNİK ŞARTNAME VE STANDARTLAR' : 'YENİ KOLEKSİYON SAYFASI',
          fontSize: 22,
          fontWeight: '800',
          color: '#0f172a',
          align: 'left',
          locked: false
        }
      ]
    };
    const updated = [...pages, newPage];
    pushHistory(updated);
    setActivePageIdx(updated.length - 1);
    setSelectedElId(null);
  };

  const handleDuplicatePage = (idx) => {
    const target = pages[idx];
    if (!target) return;
    const copy = {
      ...target,
      id: `page-${Date.now()}`,
      title: `${target.title} (Kopya)`,
      elements: target.elements.map((el) => ({ ...el, id: `el-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` }))
    };
    const updated = [...pages];
    updated.splice(idx + 1, 0, copy);
    pushHistory(updated);
    setActivePageIdx(idx + 1);
  };

  const handleDeletePage = (idx) => {
    if (pages.length <= 1) {
      alert('Katalogda en az 1 sayfa bulunmalıdır.');
      return;
    }
    const updated = pages.filter((_, i) => i !== idx);
    pushHistory(updated);
    setActivePageIdx(Math.max(0, idx - 1));
    setSelectedElId(null);
  };

  const handleMovePage = (idx, dir) => {
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= pages.length) return;
    const updated = [...pages];
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;
    pushHistory(updated);
    setActivePageIdx(targetIdx);
  };

  // Mouse Drag / Resize Handlers on Canvas
  const handleMouseDownElement = (e, el, mode = 'move') => {
    e.stopPropagation();
    setSelectedElId(el.id);
    if (el.locked) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const origX = el.x;
    const origY = el.y;
    const origW = el.width;
    const origH = el.height;

    dragInfoRef.current = { id: el.id, mode, startX, startY, origX, origY, origW, origH };

    const handleMouseMove = (moveEvent) => {
      if (!dragInfoRef.current) return;
      const dx = moveEvent.clientX - dragInfoRef.current.startX;
      const dy = moveEvent.clientY - dragInfoRef.current.startY;

      // Snap to 10px grid if enabled
      const snap = (val) => (showGrid ? Math.round(val / 5) * 5 : val);

      setPages((prevPages) =>
        prevPages.map((p, pIdx) => {
          if (pIdx !== activePageIdx) return p;
          return {
            ...p,
            elements: p.elements.map((item) => {
              if (item.id !== dragInfoRef.current.id) return item;
              if (dragInfoRef.current.mode === 'move') {
                return {
                  ...item,
                  x: Math.max(0, Math.min(550, snap(dragInfoRef.current.origX + dx))),
                  y: Math.max(0, Math.min(790, snap(dragInfoRef.current.origY + dy)))
                };
              } else {
                return {
                  ...item,
                  width: Math.max(30, snap(dragInfoRef.current.origW + dx)),
                  height: Math.max(4, snap(dragInfoRef.current.origH + dy))
                };
              }
            })
          };
        })
      );
    };

    const handleMouseUp = () => {
      dragInfoRef.current = null;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="bg-neutral-100 rounded-2xl border border-neutral-200 overflow-hidden flex flex-col">
      {/* Top Studio Toolbar */}
      <div className="bg-neutral-900 text-white px-4 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-bold flex items-center gap-1.5">
            <Sparkles size={13} />
            <span>Gelişmiş Görsel Stüdyo</span>
          </span>
          <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1 ml-2">
            <Check size={12} />
            <span>{autoSaveStatus}</span>
          </span>
        </div>

        {/* Add Elements Toolbar */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => addElement('text')}
            className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold flex items-center gap-1.5 transition"
            title="Metin Ekle"
          >
            <Type size={14} className="text-amber-400" />
            <span>Metin</span>
          </button>

          <button
            type="button"
            onClick={() => addElement('image')}
            className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold flex items-center gap-1.5 transition"
            title="Görsel Ekle"
          >
            <ImageIcon size={14} className="text-sky-400" />
            <span>Görsel</span>
          </button>

          <button
            type="button"
            onClick={() => addElement('box')}
            className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold flex items-center gap-1.5 transition"
            title="Kutu / Blok Ekle"
          >
            <Square size={14} className="text-emerald-400" />
            <span>Blok</span>
          </button>

          <button
            type="button"
            onClick={() => addElement('line')}
            className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold flex items-center gap-1.5 transition"
            title="Çizgi Ekle"
          >
            <Minus size={14} className="text-purple-400" />
            <span>Çizgi</span>
          </button>

          <div className="h-4 w-px bg-white/15 mx-1" />

          <button
            type="button"
            onClick={handleUndo}
            disabled={history.length === 0}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 transition"
            title="Geri Al"
          >
            <Undo2 size={14} />
          </button>
          <button
            type="button"
            onClick={handleRedo}
            disabled={future.length === 0}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 transition"
            title="İleri Al"
          >
            <Redo2 size={14} />
          </button>

          <button
            type="button"
            onClick={() => setShowGrid(!showGrid)}
            className={`p-1.5 rounded-lg transition ${showGrid ? 'bg-amber-500 text-neutral-950' : 'bg-white/10 text-white'}`}
            title="Hizalama Kılavuz Çizgileri"
          >
            <Grid size={14} />
          </button>
        </div>
      </div>

      {/* Main 3-Column Studio Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[680px]">
        {/* Left Sidebar: Page Manager & Quick Brand Product Inserter */}
        <div className="lg:col-span-3 bg-white border-r border-neutral-200 p-4 flex flex-col justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-neutral-700 flex items-center gap-1.5">
                <Layers size={14} className="text-amber-600" />
                <span>Sayfalar ({pages.length})</span>
              </h4>
              <button
                type="button"
                onClick={() => handleAddPage('product')}
                className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-[11px] font-bold flex items-center gap-1 transition"
              >
                <Plus size={12} className="text-amber-400" />
                <span>Sayfa Ekle</span>
              </button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {pages.map((p, idx) => {
                const isActive = idx === activePageIdx;
                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      setActivePageIdx(idx);
                      setSelectedElId(null);
                    }}
                    className={`p-2.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                      isActive
                        ? 'border-amber-500 bg-amber-50/60 text-neutral-900 font-bold shadow-2xs'
                        : 'border-neutral-200 bg-neutral-50/60 text-neutral-600 hover:bg-neutral-100'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-5 h-5 rounded bg-neutral-900 text-white text-[10px] font-mono flex items-center justify-center flex-shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-xs truncate">{p.title}</span>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => handleMovePage(idx, -1)}
                        disabled={idx === 0}
                        className="p-1 text-neutral-400 hover:text-neutral-800 disabled:opacity-25"
                        title="Yukarı Taşı"
                      >
                        <MoveUp size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMovePage(idx, 1)}
                        disabled={idx === pages.length - 1}
                        className="p-1 text-neutral-400 hover:text-neutral-800 disabled:opacity-25"
                        title="Aşağı Taşı"
                      >
                        <MoveDown size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDuplicatePage(idx)}
                        className="p-1 text-neutral-400 hover:text-blue-600"
                        title="Sayfayı Çoğalt"
                      >
                        <Copy size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePage(idx)}
                        className="p-1 text-neutral-400 hover:text-rose-600"
                        title="Sayfayı Sil"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Insert Real Brand Product Card into Canvas */}
            <div className="pt-4 border-t border-neutral-200">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-neutral-700 mb-2">
                Ürün Kütüphanesinden Ekle
              </h4>
              <p className="text-[11px] text-neutral-500 mb-2.5">
                Tıkladığınız ürünün gerçek görseli ve bilgileri aktif sayfaya eklenir:
              </p>
              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                {brandProducts.slice(0, 20).map((prod) => (
                  <button
                    key={prod.id}
                    type="button"
                    onClick={() => {
                      addElement('image', {
                        src: prod.imageUrl || prod.textureUrl || '/renders/luxury_bathroom_calacatta_gold.jpg',
                        width: 220,
                        height: 220,
                        x: 60,
                        y: 160
                      });
                      setTimeout(() => {
                        addElement('text', {
                          content: `${prod.name}\n${prod.width || 60}x${prod.height || 120} cm • ${prod.finish || 'Mat'}`,
                          width: 220,
                          height: 55,
                          fontSize: 13,
                          x: 60,
                          y: 390
                        });
                      }, 30);
                    }}
                    className="w-full p-2 rounded-lg border border-neutral-200 hover:border-amber-400 bg-white flex items-center gap-2.5 text-left transition"
                  >
                    <img
                      src={prod.imageUrl || prod.textureUrl || '/placeholder.png'}
                      alt={prod.name}
                      className="w-8 h-8 rounded object-cover border border-neutral-200 flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-neutral-800 truncate">{prod.name}</p>
                      <p className="text-[10px] text-neutral-400 font-mono">
                        {prod.width}x{prod.height} cm
                      </p>
                    </div>
                    <Plus size={13} className="text-amber-600 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {onSaveDraft && (
            <button
              type="button"
              onClick={() => onSaveDraft(pages)}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition"
            >
              <Save size={14} />
              <span>Tasarımı Kaydet</span>
            </button>
          )}
        </div>

        {/* Center: Interactive A4 Visual Canvas */}
        <div
          className="lg:col-span-6 bg-neutral-200/80 p-4 sm:p-8 flex items-center justify-center overflow-auto"
          onClick={() => setSelectedElId(null)}
        >
          <div
            ref={canvasRef}
            style={{
              width: '595px',
              height: '842px',
              backgroundColor: currentPage?.bgColor || '#ffffff',
              backgroundImage: showGrid
                ? 'radial-gradient(rgba(148, 163, 184, 0.45) 1px, transparent 1px)'
                : 'none',
              backgroundSize: '20px 20px'
            }}
            className="relative shadow-2xl border border-neutral-300 select-none overflow-hidden flex-shrink-0"
          >
            {currentPage?.elements?.map((el) => {
              const isSelected = el.id === selectedElId;
              return (
                <div
                  key={el.id}
                  onMouseDown={(e) => handleMouseDownElement(e, el, 'move')}
                  style={{
                    position: 'absolute',
                    left: `${el.x}px`,
                    top: `${el.y}px`,
                    width: `${el.width}px`,
                    height: `${el.height}px`,
                    cursor: el.locked ? 'not-allowed' : 'move'
                  }}
                  className={`group ${
                    isSelected ? 'ring-2 ring-amber-500 z-30' : 'hover:ring-1 hover:ring-amber-400/60 z-10'
                  }`}
                >
                  {el.type === 'text' && (
                    <div
                      style={{
                        fontSize: `${el.fontSize || 14}px`,
                        fontWeight: el.fontWeight || '600',
                        color: el.color || '#0f172a',
                        textAlign: el.align || 'left',
                        width: '100%',
                        height: '100%',
                        whiteSpace: 'pre-wrap',
                        lineHeight: 1.35
                      }}
                      className="p-1 overflow-hidden"
                    >
                      {el.content}
                    </div>
                  )}

                  {el.type === 'image' && (
                    <img
                      src={el.src}
                      alt=""
                      draggable={false}
                      className="w-full h-full object-cover pointer-events-none"
                    />
                  )}

                  {el.type === 'box' && (
                    <div
                      style={{
                        backgroundColor: el.color || '#f8fafc',
                        borderColor: el.borderColor || '#e2e8f0'
                      }}
                      className="w-full h-full border"
                    />
                  )}

                  {el.type === 'line' && (
                    <div
                      style={{
                        backgroundColor: el.color || '#d4af37',
                        height: `${el.height || 2}px`
                      }}
                      className="w-full"
                    />
                  )}

                  {/* Bottom-Right Resize Handle */}
                  {isSelected && !el.locked && (
                    <div
                      onMouseDown={(e) => handleMouseDownElement(e, el, 'resize')}
                      className="w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-white shadow absolute -bottom-1.5 -right-1.5 cursor-nwse-resize z-40"
                      title="Boyutlandır"
                    />
                  )}
                </div>
              );
            })}

            {/* Page Number Footer */}
            <div className="absolute bottom-4 right-6 text-[10px] font-mono text-neutral-400 pointer-events-none">
              Sayfa {activePageIdx + 1} / {pages.length}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Element Inspector & Page Properties */}
        <div className="lg:col-span-3 bg-white border-l border-neutral-200 p-4 space-y-5">
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-neutral-700 mb-3 flex items-center gap-1.5">
              <Palette size={14} className="text-amber-600" />
              <span>Sayfa Ayarları</span>
            </h4>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-neutral-600 block mb-1">Sayfa Başlığı</label>
                <input
                  type="text"
                  value={currentPage?.title || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPages((prev) =>
                      prev.map((p, idx) => (idx === activePageIdx ? { ...p, title: val } : p))
                    );
                  }}
                  className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 text-xs font-medium"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-neutral-600 block mb-1">Sayfa Arka Plan Rengi</label>
                <div className="flex items-center gap-2">
                  {['#ffffff', '#f8fafc', '#f5f5f4', '#18181b', '#0f172a'].map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => {
                        const updated = pages.map((p, idx) =>
                          idx === activePageIdx ? { ...p, bgColor: hex } : p
                        );
                        pushHistory(updated);
                      }}
                      style={{ backgroundColor: hex }}
                      className={`w-6 h-6 rounded-full border ${
                        currentPage?.bgColor === hex ? 'ring-2 ring-amber-500 border-amber-600' : 'border-neutral-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-neutral-200 pt-4">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-neutral-700 mb-3">
              Seçili Öğe Özellikleri
            </h4>

            {!selectedEl ? (
              <div className="p-6 rounded-xl bg-neutral-50 border border-neutral-200/80 text-center text-xs text-neutral-400">
                Düzenlemek istediğiniz metin, görsel veya şeklin üzerine tıklayın.
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 font-bold">
                    Tür: {selectedEl.type}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => updateSelectedElement({ locked: !selectedEl.locked })}
                      className={`p-1.5 rounded-lg border ${
                        selectedEl.locked
                          ? 'bg-amber-50 border-amber-300 text-amber-700'
                          : 'border-neutral-200 text-neutral-600'
                      }`}
                      title={selectedEl.locked ? 'Kilidi Aç' : 'Öğeyi Kilitle'}
                    >
                      {selectedEl.locked ? <Lock size={13} /> : <Unlock size={13} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => changeLayerOrder(1)}
                      className="p-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-100"
                      title="Öne Getir"
                    >
                      <MoveUp size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => changeLayerOrder(-1)}
                      className="p-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-100"
                      title="Arkaya Gönder"
                    >
                      <MoveDown size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={deleteSelectedElement}
                      className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50"
                      title="Öğeyi Sil"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {selectedEl.type === 'text' && (
                  <>
                    <div>
                      <label className="text-[11px] font-bold text-neutral-600 block mb-1">Metin İçeriği</label>
                      <textarea
                        rows={3}
                        value={selectedEl.content || ''}
                        onChange={(e) => updateSelectedElement({ content: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-bold text-neutral-600 block mb-1">Punto (px)</label>
                        <input
                          type="number"
                          value={selectedEl.fontSize || 14}
                          onChange={(e) => updateSelectedElement({ fontSize: Number(e.target.value) })}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-300 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-neutral-600 block mb-1">Kalınlık</label>
                        <select
                          value={selectedEl.fontWeight || '600'}
                          onChange={(e) => updateSelectedElement({ fontWeight: e.target.value })}
                          className="w-full px-2 py-1.5 rounded-lg border border-neutral-300 text-xs"
                        >
                          <option value="400">Normal</option>
                          <option value="600">Yarı Kalın</option>
                          <option value="700">Kalın</option>
                          <option value="800">Ekstra Kalın</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <label className="text-[11px] font-bold text-neutral-600 block mb-1">Renk</label>
                        <input
                          type="color"
                          value={selectedEl.color || '#0f172a'}
                          onChange={(e) => updateSelectedElement({ color: e.target.value })}
                          className="w-9 h-8 rounded cursor-pointer border border-neutral-300"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-neutral-600 block mb-1">Hizalama</label>
                        <div className="flex items-center gap-1">
                          {[
                            { id: 'left', icon: AlignLeft },
                            { id: 'center', icon: AlignCenter },
                            { id: 'right', icon: AlignRight }
                          ].map((al) => {
                            const Icon = al.icon;
                            return (
                              <button
                                key={al.id}
                                type="button"
                                onClick={() => updateSelectedElement({ align: al.id })}
                                className={`p-1.5 rounded border ${
                                  selectedEl.align === al.id
                                    ? 'bg-neutral-900 text-white border-neutral-900'
                                    : 'border-neutral-200 text-neutral-600'
                                }`}
                              >
                                <Icon size={13} />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {selectedEl.type === 'image' && (
                  <div>
                    <label className="text-[11px] font-bold text-neutral-600 block mb-1">Görsel URL</label>
                    <input
                      type="text"
                      value={selectedEl.src || ''}
                      onChange={(e) => updateSelectedElement({ src: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-300 text-xs font-mono"
                    />
                  </div>
                )}

                {(selectedEl.type === 'box' || selectedEl.type === 'line') && (
                  <div>
                    <label className="text-[11px] font-bold text-neutral-600 block mb-1">Dolgu Rengi</label>
                    <input
                      type="color"
                      value={selectedEl.color || '#f8fafc'}
                      onChange={(e) => updateSelectedElement({ color: e.target.value })}
                      className="w-12 h-8 rounded cursor-pointer border border-neutral-300"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-100">
                  <div>
                    <label className="text-[10px] text-neutral-400 block">Konum X / Y</label>
                    <p className="text-xs font-mono font-bold text-neutral-700">
                      {selectedEl.x}px, {selectedEl.y}px
                    </p>
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400 block">Boyut G × Y</label>
                    <p className="text-xs font-mono font-bold text-neutral-700">
                      {selectedEl.width} × {selectedEl.height}px
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
