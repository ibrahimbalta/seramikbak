'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Globe, Layers2, Sparkles, Building2, ShieldCheck, 
  ArrowRight, FileCheck, CheckCircle2, X, MessageSquare, 
  FileText, Info, Download, Check, DollarSign, Search, Zap
} from 'lucide-react';

const exportCountriesList = [
  { flag: '🇩🇪', name: 'Almanya (Germany)', searchTarget: 'Google DE / Yandex', lang: 'Deutsch (DE)' },
  { flag: '🇦🇪', name: 'BAE (United Arab Emirates)', searchTarget: 'Google AE / Arabia', lang: 'English / Arabic' },
  { flag: '🇺🇸', name: 'ABD (United States)', searchTarget: 'Google US / Bing', lang: 'English (US)' },
  { flag: '🇬🇧', name: 'İngiltere (United Kingdom)', searchTarget: 'Google UK', lang: 'English (UK)' },
  { flag: '🇸🇦', name: 'Suudi Arabistan (Saudi Arabia)', searchTarget: 'Google SA / Arabia', lang: 'العربية (AR)' },
  { flag: '🇶🇦', name: 'Katar (Qatar)', searchTarget: 'Google QA / Arabia', lang: 'English / Arabic' },
  { flag: '🇫🇷', name: 'Fransa (France)', searchTarget: 'Google FR', lang: 'Français' },
  { flag: '🇳🇱', name: 'Hollanda (Netherlands)', searchTarget: 'Google NL', lang: 'Dutch / English' },
  { flag: '🇮🇹', name: 'İtalya (Italy)', searchTarget: 'Google IT', lang: 'Italiano' },
  { flag: '🇪🇸', name: 'İspanya (Spain)', searchTarget: 'Google ES', lang: 'Español' },
  { flag: '🇷🇺', name: 'Rusya (Russia)', searchTarget: 'Yandex RU / Google RU', lang: 'Русский (RU)' },
  { flag: '🇰🇼', name: 'Kuveyt (Kuwait)', searchTarget: 'Google KW', lang: 'العربية / English' }
];

export default function GlobalExportHub({ onOpen3DStudio, onClose }) {
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [isBimModalOpen, setIsBimModalOpen] = useState(false);
  const [isCountriesModalOpen, setIsCountriesModalOpen] = useState(false);
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
  const [downloadedBim, setDownloadedBim] = useState(false);

  const handle3DStudioClick = () => {
    if (onOpen3DStudio) {
      onOpen3DStudio();
    } else {
      const el = document.getElementById('studio3d-anchor');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="global-export-hub-container">
      <div className="global-export-banner-card">
        {onClose && (
          <button onClick={onClose} className="global-hub-close-btn" title="Kapat">
            <X size={18} />
          </button>
        )}

        {/* Header Badge & SEO Tagline */}
        <div className="global-banner-header">
          <div className="global-pill-badge">
            <Globe size={13} className="globe-spin-icon" />
            <span>GLOBAL CERAMICS MULTI-LINGUAL SEO SHOWROOM</span>
          </div>
          <h2 className="global-banner-title">
            Markalarınızı ve Ürünlerinizi <span>5 Dilde Çoklu SEO ile Dünya Pazarına</span> Açıyoruz
          </h2>
          <p className="global-banner-desc">
            SeramikBak Global Altyapısı; Türk ve dünya seramik üreticilerinin koleksiyonlarını Türkçe, İngilizce, Almanca, Arapça ve Rusça dillerinde Google Global ve Yandex arama motorlarında indeksleyerek 85+ ülkedeki uluslararası mimar, distribütör ve projelerle buluşturur.
          </p>
        </div>

        {/* 4 Pillars Grid (SEO & Global Promotion Focused) */}
        <div className="global-pillars-grid">

          {/* Pillar 1: Multi-lingual SEO */}
          <div className="global-pillar-card clickable" onClick={() => setIsCountriesModalOpen(true)}>
            <div className="pillar-top-row">
              <div className="pillar-icon-box emerald">
                <Globe size={18} />
              </div>
              <span className="pillar-action-badge emerald">5 Dilde SEO ⚡</span>
            </div>
            <h3>5 Dilde Uluslararası SEO & İndeksleme</h3>
            <p>Ürünleriniz Türkçe, İngilizce, Almanca, Arapça ve Rusça otomatik Schema.org ve Hreflang SEO mimarisiyle Google Global ve Yandex'te ilk sıralarda indekslenir.</p>

            <button className="pillar-trigger-btn emerald">
              <Globe size={13} />
              <span>85+ İhracat Ülkesi & Diller</span>
              <ArrowRight size={12} />
            </button>
          </div>

          {/* Pillar 2: Multi-Currency Pricing */}
          <div className="global-pillar-card clickable" onClick={() => setIsCurrencyModalOpen(true)}>
            <div className="pillar-top-row">
              <div className="pillar-icon-box gold">
                <DollarSign size={18} />
              </div>
              <span className="pillar-action-badge gold">Çoklu Kur</span>
            </div>
            <h3>Çoklu Döviz (Multi-Currency) Fiyatlama</h3>
            <p>Uluslararası alıcılar $ USD, € EUR, £ GBP, ﷼ SAR, ₽ RUB ve ₺ TRY cinsinden canlı fiyatları ve teklifleri kendi para birimlerinde görüntüler.</p>

            <button className="pillar-trigger-btn gold">
              <DollarSign size={13} />
              <span>Desteklenen Döviz Cinslerini Gör</span>
              <ArrowRight size={12} />
            </button>
          </div>

          {/* Pillar 3: Architectural BIM / CAD */}
          <div className="global-pillar-card clickable" onClick={() => setIsBimModalOpen(true)}>
            <div className="pillar-top-row">
              <div className="pillar-icon-box blue">
                <Layers2 size={18} />
              </div>
              <span className="pillar-action-badge blue">4K PBR Ready</span>
            </div>
            <h3>Global BIM / CAD Şartname Kütüphanesi</h3>
            <p>Londra, New York ve Berlin merkezli mimarlık büroları için Revit (.rfa), AutoCAD (.dwg) ve dikişsiz 4K PBR dokular ile projelerinizin şartnameye girmesi sağlanır.</p>

            <button className="pillar-trigger-btn blue">
              <Layers2 size={13} />
              <span>4K BIM / CAD Paketleri</span>
              <ArrowRight size={12} />
            </button>
          </div>

          {/* Pillar 4: AI Visual Search & Web 3D/AR */}
          <div className="global-pillar-card clickable" onClick={handle3DStudioClick}>
            <div className="pillar-top-row">
              <div className="pillar-icon-box purple">
                <Sparkles size={18} />
              </div>
              <span className="pillar-action-badge purple">AI & Web3D</span>
            </div>
            <h3>Görsel Arama & Web 3D Canlı Deneyim</h3>
            <p>Yapay zekalı görsel arama (Visual Search) ve tarayıcı üzerinden uygulama indirmeden çalışan Web 3D & AR simülatörü ile ürünleriniz 360° deneyimlenir.</p>

            <button className="pillar-trigger-btn purple">
              <Sparkles size={13} />
              <span>3D Canlı Stüdyoyu Aç</span>
              <ArrowRight size={12} />
            </button>
          </div>

        </div>

        {/* Integrated Mini Metrics & High-Contrast CTA Bar */}
        <div className="global-metrics-and-cta-bar">
          <div className="global-metrics-mini">
            <div className="mini-metric">
              <strong>5 Dilde</strong> <span>Otomatik SEO</span>
            </div>
            <div className="mini-divider" />
            <div className="mini-metric">
              <strong>85+</strong> <span>İhracat Ülkesi</span>
            </div>
            <div className="mini-divider" />
            <div className="mini-metric">
              <strong>15.000+</strong> <span>Uluslararası Mimar</span>
            </div>
            <div className="mini-divider" />
            <div className="mini-metric">
              <strong>6 Döviz</strong> <span>Canlı Kur</span>
            </div>
          </div>

          <div className="global-cta-buttons-mini">
            <button onClick={() => setIsHowItWorksOpen(true)} className="global-how-it-works-btn">
              <Info size={14} />
              <span>SEO & Tanıtım Altyapısı Nasıl Çalışır?</span>
            </button>
            <Link href="/marka" className="global-brand-join-btn">
              <Building2 size={15} />
              <span>Markanızı İhracat Ağına Ekleyin</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

      </div>

      {/* MODAL 1: HOW MULTI-LINGUAL SEO & BRAND SHOWCASE WORKS */}
      {isHowItWorksOpen && (
        <div className="export-modal-overlay" onClick={() => setIsHowItWorksOpen(false)}>
          <div className="export-modal-card glass-panel" style={{ maxWidth: '840px' }} onClick={(e) => e.stopPropagation()}>
            <div className="export-modal-header">
              <div className="modal-title-box">
                <div className="modal-icon-gold">
                  <Globe size={22} />
                </div>
                <div>
                  <h3>🌐 SeramikBak Çok Dilli SEO & Küresel Tanıtım Altyapısı</h3>
                  <p>Üretici markaların seramik koleksiyonlarını dünya pazarına 5 dilde bağlayan SEO ve dijital vitrin sistemimiz</p>
                </div>
              </div>
              <button className="export-modal-close" onClick={() => setIsHowItWorksOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="how-it-works-steps-grid">
              
              <div className="how-step-card">
                <div className="step-num-badge">1</div>
                <div>
                  <h4>5 Dilde Otomatik SEO & Google/Yandex İndekslemesi</h4>
                  <p>Markanızın tüm koleksiyonları Türkçe, İngilizce, Almanca, Arapça ve Rusça otomatik Schema.org ve Hreflang etiketleriyle arama motorlarında indekslenir. Yabancı alıcılar kendi dillerinde arama yaptığında ürünleriniz en üst sıralarda çıkar.</p>
                </div>
              </div>

              <div className="how-step-card">
                <div className="step-num-badge">2</div>
                <div>
                  <h4>Çoklu Döviz Cinsi ile Uluslararası Fiyat Görünürlüğü</h4>
                  <p>Alıcılar $ USD, € EUR, £ GBP, ﷼ SAR, ₽ RUB veya ₺ TRY cinsinden canlı fiyatları ve metraj bütçelerini kendi para birimlerinde hesaplayarak teklif talebi gönderir.</p>
                </div>
              </div>

              <div className="how-step-card">
                <div className="step-num-badge">3</div>
                <div>
                  <h4>Global BIM / CAD Mimari Şartname Entegrasyonu</h4>
                  <p>Uluslararası mimarlık ofisleri basılı katalog yerine Revit (.rfa), AutoCAD (.dwg) ve 4K dikişsiz PBR dokuları indirir. Seramikleriniz doğrudan yurt dışındaki dev otel ve konut projelerinin şartnamesine girer.</p>
                </div>
              </div>

              <div className="how-step-card">
                <div className="step-num-badge">4</div>
                <div>
                  <h4>Yapay Zekalı Görsel Arama & Web 3D/AR Simülatörü</h4>
                  <p>Alıcılar fotoğraf yükleyerek seramiklerinizi arayabilir ve fiziki showroom ziyareti yapmadan cep telefonu veya bilgisayar üzerinden seramiklerinizi 360° sanal banyoda veya kendi mekanlarında AR ile canlı dener.</p>
                </div>
              </div>

              <div className="how-step-card highlight">
                <div className="step-num-badge gold">5</div>
                <div>
                  <h4>Onaylı Uluslararası Proje Taleplerinin Marka Kokpitine İletilmesi</h4>
                  <p>Dünya genelinden gelen proje ve alım talepleri doğrulanır (Firma adı, Ülke, Proje m²) ve doğrudan markanızın B2B İhracat Paneline (`/marka`) ve ihracat temsilcinize iletilir.</p>
                </div>
              </div>

            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
              <Link href="/marka" className="global-brand-join-btn" style={{ padding: '12px 24px', fontSize: '0.88rem' }}>
                <Building2 size={16} />
                <span>Markanızı İhracat Ağına Dahil Edin</span>
                <ArrowRight size={14} />
              </Link>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: MULTI-CURRENCY SUPPORT MODAL */}
      {isCurrencyModalOpen && (
        <div className="export-modal-overlay" onClick={() => setIsCurrencyModalOpen(false)}>
          <div className="export-modal-card glass-panel" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
            <div className="export-modal-header">
              <div className="modal-title-box">
                <div className="modal-icon-gold">
                  <DollarSign size={22} />
                </div>
                <div>
                  <h3>💲 Desteklenen Çoklu Döviz Cinsleri (Multi-Currency)</h3>
                  <p>Uluslararası alıcılar m² fiyatlarını anında kendi para birimlerinde görüntüler</p>
                </div>
              </div>
              <button className="export-modal-close" onClick={() => setIsCurrencyModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', margin: '14px 0' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '12px', borderRadius: '12px' }}>
                <div style={{ fontWeight: '800', color: '#d4af37', fontSize: '1rem' }}>$ USD (US Dollar)</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Kuzey Amerika, Orta Doğu & Küresel Ticaret</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '12px', borderRadius: '12px' }}>
                <div style={{ fontWeight: '800', color: '#38bdf8', fontSize: '1rem' }}>€ EUR (Euro)</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Avrupa Birliği & Akdeniz Havzası</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '12px', borderRadius: '12px' }}>
                <div style={{ fontWeight: '800', color: '#34d399', fontSize: '1rem' }}>£ GBP (British Pound)</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>İngiltere & Birleşik Krallık Projeleri</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '12px', borderRadius: '12px' }}>
                <div style={{ fontWeight: '800', color: '#fef08a', fontSize: '1rem' }}>﷼ SAR (Saudi Riyal)</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Suudi Arabistan & Körfez Ülkeleri</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '12px', borderRadius: '12px' }}>
                <div style={{ fontWeight: '800', color: '#c084fc', fontSize: '1rem' }}>₽ RUB (Russian Ruble)</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Rusya & BDT Pazarları</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '12px', borderRadius: '12px' }}>
                <div style={{ fontWeight: '800', color: '#ffffff', fontSize: '1rem' }}>₺ TRY (Türk Lirası)</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Türkiye İçi Projeler & Bayiler</div>
              </div>
            </div>

            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
              Sitemizin sağ üst köşesinde yer alan döviz seçiciden dilediğiniz para birimini seçebilir veya müşterilerinizin anlık kur dönüşümlerini yapmasını sağlayabilirsiniz.
            </p>
          </div>
        </div>
      )}

      {/* MODAL 3: 4K BIM / CAD ARCHITECTURAL DOWNLOAD MODAL */}
      {isBimModalOpen && (
        <div className="export-modal-overlay" onClick={() => setIsBimModalOpen(false)}>
          <div className="export-modal-card glass-panel" style={{ maxWidth: '720px' }} onClick={(e) => e.stopPropagation()}>
            <div className="export-modal-header">
              <div className="modal-title-box">
                <div className="modal-icon-gold">
                  <Layers2 size={22} />
                </div>
                <div>
                  <h3>📐 Global BIM / CAD Mimari Doku Kütüphanesi</h3>
                  <p>Revit (.RFA), AutoCAD (.DWG) ve 4K Seamless PBR Doku Paketleri</p>
                </div>
              </div>
              <button className="export-modal-close" onClick={() => setIsBimModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', margin: '10px 0' }}>
              <p style={{ fontSize: '0.85rem', color: '#e2e8f0', lineHeight: 1.6, margin: 0 }}>
                SeramikBak, uluslararası mimarlık ve iç mimarlık büroları için tüm markaların koleksiyonlarını **4K Seamless PBR (Diffuse, Roughness, Normal Map)** ve **Autodesk Revit / AutoCAD** formatlarında sunar.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '14px', borderRadius: '12px' }}>
                  <div style={{ fontWeight: '800', color: '#d4af37', fontSize: '0.9rem', marginBottom: '4px' }}>Revit BIM Family (.RFA)</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Revit 2020-2026 Uyumlu Şartname Nesnesi</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '14px', borderRadius: '12px' }}>
                  <div style={{ fontWeight: '800', color: '#38bdf8', fontSize: '0.9rem', marginBottom: '4px' }}>AutoCAD Hatch (.DWG)</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>2D Seramik Döşeme Planları & Derz Çizimleri</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '14px', borderRadius: '12px' }}>
                  <div style={{ fontWeight: '800', color: '#34d399', fontSize: '0.9rem', marginBottom: '4px' }}>4K Seamless PBR Textures</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>3ds Max, Blender, Corona & V-Ray Hazır</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '14px', borderRadius: '12px' }}>
                  <div style={{ fontWeight: '800', color: '#c084fc', fontSize: '0.9rem', marginBottom: '4px' }}>SketchUp Material (.SKM)</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Tek Tıkla İç Mimari Modellere Ekleme</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button 
                  onClick={() => { setDownloadedBim(true); setTimeout(() => setDownloadedBim(false), 3000); }} 
                  className="global-brand-join-btn"
                  style={{ flex: 1, padding: '12px', justifyContent: 'center' }}
                >
                  <Download size={16} />
                  <span>Örnek 4K BIM Paketini İndir (.ZIP)</span>
                </button>
              </div>

              {downloadedBim && (
                <div style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', color: '#34d399', padding: '10px 12px', borderRadius: '10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Check size={16} />
                  <span>Örnek 4K PBR ve BIM kütüphanesi indiriliyor. İstediğiniz seramiğin detay sayfasından o ürüne özel 4K CAD dosyasını indirebilirsiniz.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: 85+ EXPORT COUNTRIES & REGIONAL HUBS MODAL */}
      {isCountriesModalOpen && (
        <div className="export-modal-overlay" onClick={() => setIsCountriesModalOpen(false)}>
          <div className="export-modal-card glass-panel" style={{ maxWidth: '780px' }} onClick={(e) => e.stopPropagation()}>
            <div className="export-modal-header">
              <div className="modal-title-box">
                <div className="modal-icon-gold">
                  <Globe size={22} />
                </div>
                <div>
                  <h3>🌍 85+ İhracat Ülkesi & Desteklenen Diller</h3>
                  <p>SeramikBak Global Ağının Hizmet Verdiği Bölgesel Arama Motorları ve Diller</p>
                </div>
              </div>
              <button className="export-modal-close" onClick={() => setIsCountriesModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', margin: '14px 0', maxHeight: '50vh', overflowY: 'auto' }}>
              {exportCountriesList.map((country, idx) => (
                <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '10px 12px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.4rem' }}>{country.flag}</span>
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '0.82rem', color: '#f1f5f9' }}>{country.name}</div>
                    <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Arama Engine: {country.searchTarget} | {country.lang}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <Link href="/marka" className="global-brand-join-btn">
                <Building2 size={15} />
                <span>Markanızı Bu İhracat Ağına Dahil Edin</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .global-export-hub-container {
          width: 100%;
          margin: 16px 0 24px 0;
        }

        .global-export-banner-card {
          background: linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.88) 100%);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(197, 160, 89, 0.35);
          border-top: 2px solid rgba(212, 175, 55, 0.5);
          border-radius: 20px;
          padding: 24px 28px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4), 0 0 60px rgba(179, 142, 71, 0.12);
          color: #ffffff;
          display: flex;
          flex-direction: column;
          gap: 18px;
          position: relative;
          overflow: hidden;
        }

        .global-hub-close-btn {
          position: absolute;
          top: 14px;
          right: 14px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #cbd5e1;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          z-index: 10;
        }

        .global-hub-close-btn:hover {
          background: rgba(239, 68, 68, 0.25);
          border-color: rgba(239, 68, 68, 0.5);
          color: #ef4444;
        }

        .global-banner-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 6px;
          max-width: 780px;
          margin: 0 auto;
        }

        .global-pill-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(197, 160, 89, 0.18);
          border: 1px solid rgba(197, 160, 89, 0.45);
          color: #fef08a;
          font-size: 0.68rem;
          font-weight: 800;
          padding: 4px 14px;
          border-radius: 20px;
          letter-spacing: 0.08em;
          box-shadow: 0 2px 10px rgba(179, 142, 71, 0.2);
        }

        .globe-spin-icon {
          animation: spinSlow 12s linear infinite;
        }

        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .global-banner-title {
          font-family: var(--font-title);
          font-size: 1.35rem;
          font-weight: 900;
          line-height: 1.3;
          letter-spacing: -0.01em;
          margin: 0;
          color: #ffffff;
        }

        .global-banner-title span {
          background: linear-gradient(135deg, #d4af37 0%, #fef08a 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .global-banner-desc {
          font-size: 0.82rem;
          color: #e2e8f0;
          font-weight: 500;
          line-height: 1.5;
          margin: 0;
        }

        .global-pillars-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }

        @media (max-width: 1024px) {
          .global-pillars-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .global-pillars-grid {
            grid-template-columns: 1fr;
          }
          .global-export-banner-card {
            padding: 18px 14px;
          }
          .global-banner-title {
            font-size: 1.15rem;
          }
        }

        .global-pillar-card {
          background: rgba(255, 255, 255, 0.035);
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 14px;
          padding: 14px 14px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }

        .global-pillar-card.clickable {
          cursor: pointer;
        }

        .global-pillar-card:hover {
          background: rgba(255, 255, 255, 0.07);
          border-color: rgba(197, 160, 89, 0.5);
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(0, 0, 0, 0.35);
        }

        .pillar-top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .pillar-action-badge {
          background: rgba(212, 175, 55, 0.2);
          border: 1px solid rgba(212, 175, 55, 0.4);
          color: #fef08a;
          font-size: 0.6rem;
          font-weight: 800;
          padding: 2px 7px;
          border-radius: 10px;
        }

        .pillar-action-badge.blue { background: rgba(2, 132, 199, 0.2); border-color: rgba(2, 132, 199, 0.4); color: #38bdf8; }
        .pillar-action-badge.emerald { background: rgba(16, 185, 129, 0.2); border-color: rgba(16, 185, 129, 0.4); color: #34d399; }
        .pillar-action-badge.purple { background: rgba(168, 85, 247, 0.2); border-color: rgba(168, 85, 247, 0.4); color: #c084fc; }

        .pillar-icon-box {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pillar-icon-box.gold { background: rgba(212, 175, 55, 0.15); color: #d4af37; }
        .pillar-icon-box.blue { background: rgba(2, 132, 199, 0.15); color: #38bdf8; }
        .pillar-icon-box.emerald { background: rgba(16, 185, 129, 0.15); color: #34d399; }
        .pillar-icon-box.purple { background: rgba(168, 85, 247, 0.15); color: #c084fc; }

        .global-pillar-card h3 {
          font-size: 0.85rem;
          font-weight: 800;
          margin: 0;
          color: #ffffff;
          line-height: 1.3;
        }

        .global-pillar-card p {
          font-size: 0.74rem;
          color: #cbd5e1;
          line-height: 1.45;
          margin: 0;
          flex: 1;
        }

        .pillar-trigger-btn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 10px;
          border-radius: 8px;
          font-size: 0.7rem;
          font-weight: 800;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-top: 2px;
        }

        .pillar-trigger-btn.gold { background: rgba(212, 175, 55, 0.2); color: #fef08a; border: 1px solid rgba(212, 175, 55, 0.4); }
        .pillar-trigger-btn.gold:hover { background: #d4af37; color: #0b0f17; }

        .pillar-trigger-btn.blue { background: rgba(2, 132, 199, 0.2); color: #38bdf8; border: 1px solid rgba(2, 132, 199, 0.4); }
        .pillar-trigger-btn.blue:hover { background: #0284c7; color: #ffffff; }

        .pillar-trigger-btn.emerald { background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.4); }
        .pillar-trigger-btn.emerald:hover { background: #10b981; color: #ffffff; }

        .pillar-trigger-btn.purple { background: rgba(168, 85, 247, 0.2); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.4); }
        .pillar-trigger-btn.purple:hover { background: #a855f7; color: #ffffff; }

        /* Integrated Mini Metrics & High-Contrast CTA Bar */
        .global-metrics-and-cta-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 14px;
          padding: 10px 16px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .global-metrics-mini {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .mini-metric {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 0.75rem;
          color: #e2e8f0;
          font-weight: 500;
        }

        .mini-metric strong {
          font-size: 1rem;
          color: #fef08a;
          font-weight: 900;
        }

        .mini-divider {
          width: 1px;
          height: 16px;
          background: rgba(255, 255, 255, 0.15);
        }

        @media (max-width: 640px) {
          .global-metrics-mini { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
          .mini-divider { display: none; }
        }

        .global-cta-buttons-mini {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .global-how-it-works-btn {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.25);
          color: #ffffff !important;
          padding: 8px 14px;
          border-radius: 9px;
          font-size: 0.76rem;
          font-weight: 800;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .global-how-it-works-btn:hover {
          background: rgba(255, 255, 255, 0.18);
          border-color: rgba(212, 175, 55, 0.6);
          color: #fef08a !important;
        }

        .global-brand-join-btn {
          background: linear-gradient(135deg, #d4af37 0%, #b38e47 100%);
          color: #0b0f17 !important;
          border: none;
          padding: 8px 16px;
          border-radius: 9px;
          font-size: 0.78rem;
          font-weight: 900;
          cursor: pointer;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 4px 16px rgba(212, 175, 55, 0.35);
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .global-brand-join-btn:hover {
          background: linear-gradient(135deg, #fef08a 0%, #d4af37 100%);
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(212, 175, 55, 0.5);
        }

        /* MODAL STYLES */
        .export-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(5, 8, 15, 0.85);
          backdrop-filter: blur(16px);
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .export-modal-card {
          background: linear-gradient(135deg, #0d121c 0%, #161e2e 100%);
          border: 1px solid rgba(212, 175, 55, 0.4);
          border-radius: 24px;
          max-width: 960px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 25px 70px rgba(0, 0, 0, 0.8), 0 0 50px rgba(212, 175, 55, 0.15);
          padding: 28px;
          color: #ffffff;
          display: flex;
          flex-direction: column;
          gap: 24px;
          animation: modalFadeUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes modalFadeUp {
          from { opacity: 0; transform: translateY(20px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .export-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding-bottom: 16px;
        }

        .modal-title-box {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .modal-icon-gold {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: rgba(212, 175, 55, 0.15);
          border: 1px solid rgba(212, 175, 55, 0.4);
          color: #d4af37;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .modal-title-box h3 {
          font-family: var(--font-title);
          font-size: 1.25rem;
          font-weight: 800;
          margin: 0;
          color: #f8fafc;
        }

        .modal-title-box p {
          font-size: 0.78rem;
          color: #94a3b8;
          margin: 2px 0 0 0;
        }

        .export-modal-close {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #94a3b8;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .export-modal-close:hover {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }

        .how-it-works-steps-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin: 10px 0;
        }

        .how-step-card {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 14px;
          padding: 14px 16px;
        }

        .how-step-card.highlight {
          background: rgba(212, 175, 55, 0.08);
          border: 1px solid rgba(212, 175, 55, 0.3);
        }

        .step-num-badge {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
          font-size: 0.9rem;
          font-weight: 900;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .step-num-badge.gold {
          background: linear-gradient(135deg, #d4af37 0%, #b38e47 100%);
          color: #0b0f17;
        }

        .how-step-card h4 {
          font-size: 0.9rem;
          font-weight: 800;
          color: #f8fafc;
          margin: 0 0 4px 0;
        }

        .how-step-card p {
          font-size: 0.78rem;
          color: #94a3b8;
          line-height: 1.5;
          margin: 0;
        }
      `}</style>
    </div>
  );
}
