'use client';

import { useState, useEffect, useRef } from 'react';
import { Sparkles, X, Check, ArrowRight, ArrowLeft, Layers, Calculator, ShieldCheck, Download, RefreshCw, ShoppingBag, FileText, ChevronRight } from 'lucide-react';

const STYLE_OPTIONS = [
  {
    id: 'marble',
    name: 'Lüks Mermer (Calacatta)',
    desc: 'Zarif altın ve gri damarlı, ferah ve lüks hissettiren doğal mermer görünümü.',
    color: '#f8fafc',
    accentColor: '#d4af37',
    previewUrl: '/textures/calacatta_gold.jpg',
    defaultTile: { name: 'Calacatta Gold Luxury', code: 'CLM-60120', width: 60, height: 120, finish: 'Parlak', price: 850 }
  },
  {
    id: 'concrete',
    name: 'Minimalist Beton / Antrasit',
    desc: 'Modern, brüt beton dokulu, çağdaş mimari banyolar için monokrom görünüm.',
    color: '#334155',
    accentColor: '#94a3b8',
    previewUrl: '/textures/anthracite_slate.jpg',
    defaultTile: { name: 'Metropolitan Anthracite Slate', code: 'MAS-60120', width: 60, height: 120, finish: 'Mat', price: 680 }
  },
  {
    id: 'wood',
    name: 'Sıcak Skandinav Ahşap',
    desc: 'Doğal meşe ve ceviz dokulu parke seramik. Banyonuza sıcak ve huzurlu bir hava katar.',
    color: '#8c5a34',
    accentColor: '#fbbf24',
    previewUrl: '/textures/oak_wood.jpg',
    defaultTile: { name: 'Nordic Oak Plank Ceramic', code: 'NOP-20120', width: 20, height: 120, finish: 'Mat Rölief', price: 740 }
  },
  {
    id: 'terrazzo',
    name: 'Modern Terrazzo',
    desc: 'Renkli mikro mermer tanecikli, trend iç mimari banyo tasarımları.',
    color: '#e2e8f0',
    accentColor: '#f472b6',
    previewUrl: '/textures/terrazzo_venice.jpg',
    defaultTile: { name: 'Venetian Terrazzo Royale', code: 'VTR-8080', width: 80, height: 80, finish: 'Yarı Mat', price: 920 }
  }
];

const BUDGET_TIERS = [
  { id: 'economic', name: 'Ekonomik / Fiyat-Performans', multiplier: 0.8, label: 'Bütçe Dostu (₺450 - ₺600 / m²)' },
  { id: 'standard', name: 'Standart Premium', multiplier: 1.0, label: 'Popüler Kalite (₺650 - ₺950 / m²)' },
  { id: 'luxury', name: 'Lüks Exclusive', multiplier: 1.4, label: 'Üst Segment (₺1.200+ / m²)' }
];

const SIZE_PRESETS = [
  { id: 'small', name: 'Küçük Banyo', area: 5, desc: 'Ebeveyn / Misafir Banyosu (~5 m²)' },
  { id: 'medium', name: 'Orta Banyo', area: 9, desc: 'Standart Daire Banyosu (~9 m²)' },
  { id: 'large', name: 'Geniş Banyo', area: 15, desc: 'Lüks / Villa Banyosu (~15 m²)' }
];

export default function SmartBathroomAssistantModal({ isOpen, onClose, onSelectProduct, onOpenStudio }) {
  const [step, setStep] = useState(1); // 1: Style, 2: Budget, 3: Size, 4: AI Result
  const [selectedStyle, setSelectedStyle] = useState(STYLE_OPTIONS[0]);
  const [selectedBudget, setSelectedBudget] = useState(BUDGET_TIERS[1]);
  const [roomArea, setRoomArea] = useState(9);
  const [customAreaInput, setCustomAreaInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const canvasRef = useRef(null);

  // Material & Cost Calculations
  const wallAreaRatio = 2.4;
  const totalFloorM2 = roomArea;
  const totalWallM2 = Math.round(roomArea * wallAreaRatio * 10) / 10;
  const totalM2WithWaste = Math.ceil((totalFloorM2 + totalWallM2) * 1.1);

  const tileUnitPrice = Math.round(selectedStyle.defaultTile.price * selectedBudget.multiplier);
  const totalTileCost = totalM2WithWaste * tileUnitPrice;

  const kalekimBags = Math.ceil(totalM2WithWaste * 5 / 25);
  const kalekimCost = kalekimBags * 220;

  const groutKg = Math.ceil(totalM2WithWaste * 0.4);
  const groutCost = Math.ceil(groutKg / 5) * 180;

  const clipsBoxes = Math.ceil(totalM2WithWaste / 15);
  const clipsCost = clipsBoxes * 350;

  const estimatedLaborCost = Math.round(totalM2WithWaste * 380);
  const grandTotalCost = totalTileCost + kalekimCost + groutCost + clipsCost + estimatedLaborCost;

  const handleGenerateResult = () => {
    setIsGenerating(true);
    setStep(4);
    setTimeout(() => {
      setIsGenerating(false);
    }, 800);
  };

  useEffect(() => {
    if (step !== 4 || isGenerating) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cw = canvas.width;
    const ch = canvas.height;

    ctx.clearRect(0, 0, cw, ch);

    const wallGrad = ctx.createLinearGradient(0, 0, 0, ch * 0.65);
    wallGrad.addColorStop(0, '#1e293b');
    wallGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = wallGrad;
    ctx.fillRect(0, 0, cw, ch * 0.65);

    const tileW = selectedStyle.id === 'wood' ? 120 : 70;
    const tileH = selectedStyle.id === 'wood' ? 24 : 70;

    ctx.fillStyle = selectedStyle.color;
    for (let y = 0; y < ch * 0.65; y += tileH + 2) {
      for (let x = 0; x < cw; x += tileW + 2) {
        ctx.fillRect(x, y, tileW, tileH);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, tileW, tileH);

        if (selectedStyle.id === 'marble') {
          ctx.strokeStyle = selectedStyle.accentColor;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x + 10, y + 5);
          ctx.lineTo(x + tileW - 10, y + tileH - 5);
          ctx.stroke();
        }
      }
    }

    const floorGrad = ctx.createLinearGradient(0, ch * 0.65, 0, ch);
    floorGrad.addColorStop(0, '#090d16');
    floorGrad.addColorStop(1, '#020617');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, ch * 0.65, cw, ch * 0.35);

    ctx.strokeStyle = selectedStyle.accentColor;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.4;

    const vanishingX = cw / 2;
    const horizonY = ch * 0.65;
    for (let x = -cw; x <= cw * 2; x += 60) {
      ctx.beginPath();
      ctx.moveTo(vanishingX, horizonY);
      ctx.lineTo(x, ch);
      ctx.stroke();
    }
    for (let y = horizonY; y <= ch; y += 25) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(cw, y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1.0;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.arc(cw / 2, horizonY - 110, 55, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = selectedStyle.accentColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cw / 2, horizonY - 110, 57, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(cw / 2 - 110, horizonY - 30, 220, 45, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(cw / 2, horizonY - 32, 45, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = selectedStyle.accentColor;
    ctx.fillRect(cw / 2 - 4, horizonY - 65, 8, 30);

  }, [step, isGenerating, selectedStyle, selectedBudget, roomArea]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 99999,
      background: 'rgba(2, 6, 23, 0.85)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: step === 4 ? '1100px' : '720px',
        background: '#090d16',
        border: '1px solid rgba(212, 175, 55, 0.25)',
        borderRadius: '24px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '90vh',
        transition: 'all 0.3s ease'
      }}>

        {/* Modal Header */}
        <div style={{
          padding: '20px 28px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(15, 23, 42, 0.6)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--accent-gold, #d4af37), #b8860b)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0f172a'
            }}>
              <Sparkles size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fff', margin: 0, fontFamily: 'Outfit, sans-serif' }}>
                30 Saniyede Banyo Tasarla (Akıllı AI Asistanı)
              </h3>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                {step < 4 ? `Adım ${step} / 3 — Kriterlerinizi Seçin` : 'Yapay Zeka Tarafından Oluşturulan Banyo Tasarımı & Metraj Raporu'}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#94a3b8',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '28px', overflowY: 'auto', flex: 1 }}>

          {/* STEP 1 */}
          {step === 1 && (
            <div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>
                1. Banyonuz için hayal ettiğiniz tarzı seçin:
              </h4>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '20px' }}>
                Yapay zeka, seçtiğiniz konsepte en uyumlu seramik ve renk paletini otomatik eşleştirecektir.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {STYLE_OPTIONS.map(styleOpt => (
                  <div
                    key={styleOpt.id}
                    onClick={() => setSelectedStyle(styleOpt)}
                    style={{
                      padding: '18px',
                      borderRadius: '16px',
                      border: selectedStyle.id === styleOpt.id ? `2px solid ${styleOpt.accentColor}` : '1px solid rgba(255, 255, 255, 0.08)',
                      background: selectedStyle.id === styleOpt.id ? 'rgba(212, 175, 55, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: '800', color: '#fff' }}>{styleOpt.name}</span>
                      {selectedStyle.id === styleOpt.id && (
                        <div style={{ background: styleOpt.accentColor, color: '#0f172a', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Check size={14} />
                        </div>
                      )}
                    </div>
                    <p style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: '1.4', margin: 0 }}>{styleOpt.desc}</p>
                    <div style={{ marginTop: '6px', fontSize: '0.72rem', color: styleOpt.accentColor, fontWeight: '700' }}>
                      Örnek Ürün: {styleOpt.defaultTile.name} ({styleOpt.defaultTile.width}x{styleOpt.defaultTile.height} cm)
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>
                2. Bütçe ve Segment Tercihiniz:
              </h4>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '20px' }}>
                Seçiminize göre metrekare birim fiyatı ve malzeme kalitesi filtrelenir.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {BUDGET_TIERS.map(bTier => (
                  <div
                    key={bTier.id}
                    onClick={() => setSelectedBudget(bTier)}
                    style={{
                      padding: '16px 20px',
                      borderRadius: '14px',
                      border: selectedBudget.id === bTier.id ? '2px solid var(--accent-gold, #d4af37)' : '1px solid rgba(255, 255, 255, 0.08)',
                      background: selectedBudget.id === bTier.id ? 'rgba(212, 175, 55, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: '0.95rem', color: '#fff', display: 'block' }}>{bTier.name}</strong>
                      <span style={{ fontSize: '0.78rem', color: 'var(--accent-gold, #d4af37)', fontWeight: '600' }}>{bTier.label}</span>
                    </div>
                    {selectedBudget.id === bTier.id && (
                      <div style={{ background: 'var(--accent-gold, #d4af37)', color: '#0f172a', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Check size={16} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>
                3. Banyonuzun Taban Alanı (m²):
              </h4>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '20px' }}>
                Yapay zeka duvar yüksekliğini (ortalama 2.40m) ve %10 kesim fire payını ekleyerek tam metraj çıkarır.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px' }}>
                {SIZE_PRESETS.map(sPreset => (
                  <div
                    key={sPreset.id}
                    onClick={() => { setRoomArea(sPreset.area); setCustomAreaInput(''); }}
                    style={{
                      padding: '16px',
                      borderRadius: '14px',
                      border: roomArea === sPreset.area && !customAreaInput ? '2px solid var(--accent-gold, #d4af37)' : '1px solid rgba(255, 255, 255, 0.08)',
                      background: roomArea === sPreset.area && !customAreaInput ? 'rgba(212, 175, 55, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    <strong style={{ fontSize: '1rem', color: '#fff', display: 'block', marginBottom: '4px' }}>{sPreset.name}</strong>
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{sPreset.desc}</span>
                  </div>
                ))}
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '16px' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>Veya Özel Taban Alanı Girin (m²):</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="number"
                    min="2"
                    max="100"
                    placeholder="Örn: 8.5"
                    value={customAreaInput}
                    onChange={(e) => {
                      setCustomAreaInput(e.target.value);
                      const parsed = parseFloat(e.target.value);
                      if (parsed > 0) setRoomArea(parsed);
                    }}
                    style={{
                      flex: 1,
                      background: '#0f172a',
                      border: '1px solid rgba(212, 175, 55, 0.4)',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      color: '#fff',
                      fontSize: '0.9rem',
                      fontWeight: '700'
                    }}
                  />
                  <span style={{ fontSize: '0.9rem', color: 'var(--accent-gold, #d4af37)', fontWeight: '800' }}>m² Taban</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div>
              {isGenerating ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: '16px' }}>
                  <div className="animate-spin" style={{ width: '48px', height: '48px', border: '4px solid rgba(212, 175, 55, 0.2)', borderTopColor: 'var(--accent-gold, #d4af37)', borderRadius: '50%' }} />
                  <span style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff' }}>Yapay Zeka Banyonuzu Oluşturuyor ve Metraj Hesabı Yapıyor...</span>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }} className="ai-result-grid">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{
                      position: 'relative',
                      background: '#020617',
                      border: '1px solid rgba(212, 175, 55, 0.3)',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.5)'
                    }}>
                      <canvas
                        ref={canvasRef}
                        width={480}
                        height={380}
                        style={{ display: 'block', width: '100%', height: 'auto' }}
                      />
                      <div style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        background: 'rgba(15, 23, 42, 0.85)',
                        backdropFilter: 'blur(8px)',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        border: '1px solid rgba(212, 175, 55, 0.3)',
                        fontSize: '0.72rem',
                        fontWeight: '800',
                        color: 'var(--accent-gold, #d4af37)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <Sparkles size={14} />
                        <span>AI Birebir Görsel Önizleme</span>
                      </div>
                    </div>

                    <div style={{
                      padding: '14px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <span style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'block', fontWeight: '700' }}>ÖNERİLEN SERAMİK MODELİ</span>
                        <strong style={{ fontSize: '0.9rem', color: '#fff' }}>{selectedStyle.defaultTile.name}</strong>
                        <span style={{ fontSize: '0.74rem', color: 'var(--accent-gold, #d4af37)', display: 'block', marginTop: '2px' }}>
                          {selectedStyle.defaultTile.width}x{selectedStyle.defaultTile.height} cm • {selectedStyle.defaultTile.finish}
                        </span>
                      </div>
                      <span style={{ fontSize: '1.1rem', fontWeight: '900', color: '#fff' }}>₺{tileUnitPrice} <small style={{ fontSize: '0.65rem', color: '#94a3b8' }}>/ m²</small></span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '18px' }}>
                      <h5 style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--accent-gold, #d4af37)', marginBottom: '12px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calculator size={16} />
                        <span>Otomatik Metraj ve Malzeme İhtiyacı</span>
                      </h5>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.78rem' }}>
                        <div style={{ background: '#0f172a', padding: '10px', borderRadius: '8px' }}>
                          <span style={{ color: '#94a3b8', display: 'block' }}>Zemin + Duvar Alanı:</span>
                          <strong style={{ color: '#fff', fontSize: '0.9rem' }}>{totalFloorM2 + totalWallM2} m²</strong>
                        </div>
                        <div style={{ background: '#0f172a', padding: '10px', borderRadius: '8px' }}>
                          <span style={{ color: '#94a3b8', display: 'block' }}>Toplam Seramik (%10 Fire):</span>
                          <strong style={{ color: 'var(--accent-gold, #d4af37)', fontSize: '0.9rem' }}>{totalM2WithWaste} m² ({Math.ceil(totalM2WithWaste / 1.44)} Kutu)</strong>
                        </div>
                        <div style={{ background: '#0f172a', padding: '10px', borderRadius: '8px' }}>
                          <span style={{ color: '#94a3b8', display: 'block' }}>Kalekim Yapıştırıcı (25kg):</span>
                          <strong style={{ color: '#fff' }}>{kalekimBags} Torba</strong>
                        </div>
                        <div style={{ background: '#0f172a', padding: '10px', borderRadius: '8px' }}>
                          <span style={{ color: '#94a3b8', display: 'block' }}>Derz Dolgusu + Klips:</span>
                          <strong style={{ color: '#fff' }}>{groutKg} kg Derz + {clipsBoxes} Klips Set</strong>
                        </div>
                      </div>
                    </div>

                    <div style={{ background: 'rgba(212, 175, 55, 0.05)', border: '1px solid rgba(212, 175, 55, 0.2)', borderRadius: '16px', padding: '18px' }}>
                      <h5 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#fff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <ShieldCheck size={16} style={{ color: 'var(--accent-gold, #d4af37)' }} />
                        <span>Tahmini Toplam Proje Bütçesi</span>
                      </h5>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem', color: '#cbd5e1' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Seramik Malzeme Tutarı:</span>
                          <strong>₺{totalTileCost.toLocaleString()}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Yapıştırıcı, Derz & Klips Tutarı:</span>
                          <strong>₺{(kalekimCost + groutCost + clipsCost).toLocaleString()}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Tahmini Usta İşçilik Tutarı:</span>
                          <strong>₺{estimatedLaborCost.toLocaleString()}</strong>
                        </div>
                        <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '8px 0' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: '900', color: 'var(--accent-gold, #d4af37)' }}>
                          <span>GENEL TOPLAM BÜTÇE:</span>
                          <span>₺{grandTotalCost.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div style={{
          padding: '16px 28px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(15, 23, 42, 0.8)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {step > 1 && step < 4 && (
            <button
              onClick={() => setStep(step - 1)}
              style={{
                fontSize: '0.8rem',
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.05)',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <ArrowLeft size={16} />
              <span>Geri</span>
            </button>
          )}

          {step === 4 && (
            <button
              onClick={() => setStep(1)}
              style={{
                fontSize: '0.8rem',
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.05)',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <RefreshCw size={16} />
              <span>Yeniden Tasarla</span>
            </button>
          )}

          {step < 3 && (
            <button
              onClick={() => setStep(step + 1)}
              style={{
                marginLeft: 'auto',
                fontSize: '0.82rem',
                padding: '10px 20px',
                borderRadius: '10px',
                border: 'none',
                background: 'var(--accent-gold, #d4af37)',
                color: '#0f172a',
                cursor: 'pointer',
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>Devam Et</span>
              <ArrowRight size={16} />
            </button>
          )}

          {step === 3 && (
            <button
              onClick={handleGenerateResult}
              style={{
                marginLeft: 'auto',
                fontSize: '0.88rem',
                padding: '12px 24px',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, var(--accent-gold, #d4af37), #b8860b)',
                color: '#0f172a',
                cursor: 'pointer',
                fontWeight: '900',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 15px rgba(212, 175, 55, 0.4)'
              }}
            >
              <Sparkles size={18} />
              <span>3D Banyo Görselini & Metrajı Oluştur</span>
            </button>
          )}

          {step === 4 && !isGenerating && (
            <div style={{ display: 'flex', gap: '10px', marginLeft: 'auto' }}>
              {onOpenStudio && (
                <button
                  onClick={() => { onClose(); onOpenStudio(selectedStyle.defaultTile); }}
                  style={{
                    fontSize: '0.8rem',
                    padding: '10px 18px',
                    borderRadius: '10px',
                    border: '1px solid var(--accent-gold, #d4af37)',
                    background: 'rgba(212, 175, 55, 0.15)',
                    color: 'var(--accent-gold, #d4af37)',
                    cursor: 'pointer',
                    fontWeight: '800'
                  }}
                >
                  3D Stüdyoda Özelleştir
                </button>
              )}
              <button
                onClick={() => {
                  alert('Tasarımınız ve metraj listesi teklif sepetinize eklendi! Bayilerimiz sizinle iletişime geçecektir.');
                  onClose();
                }}
                style={{
                  fontSize: '0.85rem',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'var(--accent-gold, #d4af37)',
                  color: '#0f172a',
                  cursor: 'pointer',
                  fontWeight: '900',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <ShoppingBag size={16} />
                <span>Teklif Al & Sepete Ekle (₺{grandTotalCost.toLocaleString()})</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
