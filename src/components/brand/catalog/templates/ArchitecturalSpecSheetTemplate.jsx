'use client';

import React, { useState } from 'react';
import {
  Layers,
  QrCode,
  ExternalLink,
  ShieldCheck,
  Ruler,
  CheckCircle2,
  Compass,
  FileText,
  Download,
  Box,
  Cpu
} from 'lucide-react';

export default function ArchitecturalSpecSheetTemplate({
  catalog,
  products = [],
  mode = 'preview',
  activePageIndex = 0,
  viewFormat = 'single',
  onSelectPage
}) {
  const brand = catalog?.brand || {};
  const logo = catalog?.customLogoUrl || brand.logoUrl;
  const [imgErrors, setImgErrors] = useState({});

  const handleImgError = (id) => {
    setImgErrors((prev) => ({ ...prev, [id]: true }));
  };

  const safeProducts = products && products.length > 0 ? products : [
    {
      id: 'spec-demo-1',
      name: 'Loft Beton Gri',
      code: 'SB-LT60120',
      width: 60,
      height: 120,
      finish: 'Mat R10',
      slipResistance: 'R10',
      peiRating: '4',
      thickness: '10',
      rectified: true,
      imageUrl: '/renders/luxury_bathroom_loft_beton.jpg',
      description: 'Endüstriyel brüt beton dokusu ve yüksek kırılma mukavemetiyle ticari mekanlar için tasarlanmış porselen karo.'
    }
  ];

  const pages = [];
  if (catalog?.showCover !== false) pages.push({ type: 'cover' });
  if (catalog?.showTOC !== false) pages.push({ type: 'toc' });
  safeProducts.forEach((p, idx) => pages.push({ type: 'product', product: p, index: idx }));
  if (catalog?.showContactPage !== false) pages.push({ type: 'contact' });

  const renderSinglePage = (pageObj, pageIndex) => {
    if (!pageObj) return null;

    // -------------------------------------------------------------------------
    // COVER — EXECUTIVE BIM & CAD BLUEPRINT SPECIFICATION COVER
    // -------------------------------------------------------------------------
    if (pageObj.type === 'cover') {
      return (
        <section
          key="cover"
          className="catalog-page relative p-8 sm:p-12 text-slate-100 flex flex-col justify-between overflow-hidden"
          style={{
            background:
              'radial-gradient(circle at 80% 20%, rgba(37, 99, 235, 0.15) 0%, transparent 50%), linear-gradient(135deg, #090e17 0%, #0f172a 60%, #1e293b 100%)',
            backgroundColor: '#090e17'
          }}
        >
          {/* Drafting CAD Grid Overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage:
                'linear-gradient(rgba(56, 189, 248, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(56, 189, 248, 0.2) 1px, transparent 1px)',
              backgroundSize: '32px 32px'
            }}
          />

          <div className="relative z-10 border-2 border-slate-700/80 p-6 sm:p-10 h-full flex flex-col justify-between rounded-xl bg-slate-900/85 backdrop-blur-md">
            <div className="absolute top-3 left-4 text-[10px] font-mono text-cyan-400/80 flex items-center gap-1.5">
              <Compass size={12} />
              <span>BIM/REVIT & CAD SPECIFICATION DOSSIER &bull; ISO 128</span>
            </div>
            <div className="absolute top-3 right-4 text-[10px] font-mono text-slate-400">
              REV: 2026.01-FINAL
            </div>

            {/* Antet / Title Block Header */}
            <div className="border-b border-slate-700 pb-5 pt-3 flex items-center justify-between">
              <div>
                <span className="text-2xl sm:text-3xl font-mono font-bold tracking-wider uppercase text-white">
                  {brand.name || 'SERAMİK'}
                </span>
                <p className="text-xs text-cyan-400 font-mono mt-0.5 tracking-wide">
                  MİMARİ TEKNİK ŞARTNAME & POZ DOSYASI
                </p>
              </div>
              <div className="text-right font-mono">
                <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded text-xs font-bold inline-block shadow-sm">
                  TS EN 14411 EK-G BIA
                </span>
              </div>
            </div>

            {/* Center Architectural Spec Title */}
            <div className="my-auto py-8 max-w-2xl font-mono">
              <span className="text-[11px] font-bold px-3 py-1 bg-blue-600/20 text-blue-300 rounded border border-blue-500/30 uppercase tracking-wider inline-block mb-4">
                STANDART: TS EN 14411 (ISO 13006) PORSELEN KARO
              </span>
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight leading-tight mb-4 font-sans">
                {catalog.coverTitle || catalog.title}
              </h1>
              {catalog.coverSubtitle && (
                <p className="text-base sm:text-lg text-slate-300 font-sans leading-relaxed mb-4">
                  {catalog.coverSubtitle}
                </p>
              )}
              {catalog.introText && (
                <div className="p-4 bg-slate-800/90 border border-slate-700 rounded-lg text-xs font-mono text-slate-300 leading-relaxed">
                  {catalog.introText}
                </div>
              )}
            </div>

            {/* Antet Technical Metadata Table */}
            <div className="border-t border-slate-700 pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono text-slate-400">
              <div className="p-2 rounded bg-slate-800/50 border border-slate-700/50">
                <p className="text-[9px] text-slate-500 uppercase">ÜRETİCİ / MARKA</p>
                <p className="text-white font-bold truncate">{brand.name}</p>
              </div>
              <div className="p-2 rounded bg-slate-800/50 border border-slate-700/50">
                <p className="text-[9px] text-slate-500 uppercase">PROJE FORMATI</p>
                <p className="text-white font-bold">A4 Şartname Föyü</p>
              </div>
              <div className="p-2 rounded bg-slate-800/50 border border-slate-700/50">
                <p className="text-[9px] text-slate-500 uppercase">POZ SAYISI</p>
                <p className="text-white font-bold">{products.length} Kalem</p>
              </div>
              <div className="p-2 rounded bg-slate-800/50 border border-slate-700/50">
                <p className="text-[9px] text-slate-500 uppercase">DÜZENLEME TARİHİ</p>
                <p className="text-cyan-300 font-bold">{new Date().getFullYear()}</p>
              </div>
            </div>
          </div>
        </section>
      );
    }

    // -------------------------------------------------------------------------
    // TOC — TECHNICAL POZ SPECIFICATION MATRIX
    // -------------------------------------------------------------------------
    if (pageObj.type === 'toc') {
      return (
        <section
          key="toc"
          className="catalog-page relative p-8 sm:p-10 bg-slate-50 text-slate-900 flex flex-col justify-between font-mono"
          style={{
            backgroundImage:
              'radial-gradient(#94a3b8 0.75px, transparent 0.75px)',
            backgroundSize: '16px 16px'
          }}
        >
          <div>
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3 mb-6 bg-white/80 p-3 rounded-lg border border-slate-200">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  TEKNİK ŞARTNAME & POZ MATRİSİ
                </h2>
                <p className="text-xs text-slate-600 font-sans">
                  {brand.name} Proje & Mimari İhale Teknik Listesi
                </p>
              </div>
              <span className="text-xs font-mono bg-blue-100 text-blue-900 px-3 py-1 rounded border border-blue-200 font-bold">
                TS EN 14411 Ek-G
              </span>
            </div>

            <div className="overflow-x-auto border-2 border-slate-300 rounded-xl bg-white shadow-sm">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 text-[11px] uppercase border-b-2 border-slate-300">
                    <th className="p-2.5 border-r border-slate-300">#</th>
                    <th className="p-2.5 border-r border-slate-300">Poz Kodu</th>
                    <th className="p-2.5 border-r border-slate-300">Ürün Adı</th>
                    <th className="p-2.5 border-r border-slate-300">Ebat (cm)</th>
                    <th className="p-2.5 border-r border-slate-300">Yüzey</th>
                    <th className="p-2.5 border-r border-slate-300">Kaymazlık</th>
                    <th className="p-2.5">Aşınma</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {products.map((p, idx) => (
                    <tr key={p.id || idx} className="hover:bg-blue-50/50 transition">
                      <td className="p-2.5 border-r border-slate-200 font-bold text-slate-500">
                        {(idx + 1).toString().padStart(2, '0')}
                      </td>
                      <td className="p-2.5 border-r border-slate-200 text-blue-700 font-bold">
                        {p.code || `SB-${idx + 101}`}
                      </td>
                      <td className="p-2.5 border-r border-slate-200 font-sans font-semibold text-slate-900">
                        {p.name}
                      </td>
                      <td className="p-2.5 border-r border-slate-200">
                        {p.width || 60}x{p.height || 120}
                      </td>
                      <td className="p-2.5 border-r border-slate-200 font-sans">
                        {p.finish || 'Mat'}
                      </td>
                      <td className="p-2.5 border-r border-slate-200 font-bold text-slate-700">
                        {p.slipResistance || 'R10'}
                      </td>
                      <td className="p-2.5 font-bold text-slate-800">
                        {p.peiRating ? `PEI ${p.peiRating}` : 'PEI IV'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="border-t border-slate-300 pt-3 flex justify-between text-xs text-slate-500 font-mono">
            <span>{brand.name} Teknik Şartname Dosyası &bull; Standart: TS EN 14411</span>
            <span>Sayfa 02</span>
          </div>
        </section>
      );
    }

    // -------------------------------------------------------------------------
    // PRODUCT PAGE — TECHNICAL CAD SUBMITTAL & BIM ISOMETRIC SPREAD
    // -------------------------------------------------------------------------
    if (pageObj.type === 'product') {
      const p = pageObj.product;
      const index = pageObj.index;
      const pImage = p.imageUrl || p.textureUrl || '/renders/luxury_bathroom_calacatta_gold.jpg';
      const dimensions = p.width && p.height ? `${p.width} × ${p.height} cm` : '60 × 120 cm';
      const pageNum = pageIndex + 1;

      return (
        <section
          key={p.id || index}
          className="catalog-page relative p-6 sm:p-10 bg-slate-50 text-slate-900 flex flex-col justify-between overflow-hidden"
          style={{
            backgroundImage:
              'radial-gradient(#94a3b8 0.75px, transparent 0.75px)',
            backgroundSize: '16px 16px'
          }}
        >
          {/* CAD Antet Top Bar */}
          <div className="border-2 border-slate-900 bg-white p-3 rounded-xl flex items-center justify-between shadow-xs mb-3">
            <div className="flex items-center gap-3">
              <span className="font-bold font-mono text-sm tracking-wider uppercase text-slate-900">
                {brand.name}
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-xs font-mono text-blue-700 font-bold uppercase">
                MİMARİ TEKNİK FÖY (CAD/BIM)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                LEED v4 UYUMLU
              </span>
              <div className="text-xs font-mono text-blue-800 font-bold bg-blue-50 px-2.5 py-0.5 rounded border border-blue-300">
                POZ: {p.code || `SB-${index + 101}`}
              </div>
            </div>
          </div>

          {/* Main CAD Grid (Left Visual + Isometric, Right Full Submittal Table) */}
          <div className="flex-1 flex flex-col justify-between gap-3 my-auto">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
              
              {/* Left Column: Visual Staging & Isometric Drawing */}
              <div className="md:col-span-6 flex flex-col justify-between gap-3">
                <div className="border-2 border-slate-300 rounded-xl overflow-hidden aspect-[16/11] bg-white relative flex items-center justify-center shadow-md">
                  <img
                    src={pImage}
                    alt={p.name}
                    onError={() => handleImgError(`prod-${p.id}`)}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 left-2.5 bg-slate-900/90 text-white font-mono text-xs px-3 py-1 rounded shadow">
                    EBAT: {dimensions}
                  </div>
                  <div className="absolute bottom-2.5 right-2.5 bg-blue-600 text-white font-mono text-[10px] px-2.5 py-0.5 rounded font-bold shadow">
                    GRUP BIA
                  </div>
                </div>

                {/* Isometric Dimension Drawing Card */}
                <div className="p-3 bg-white border-2 border-slate-300 rounded-xl shadow-xs font-mono">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Box size={14} className="text-blue-600" />
                      <span>Geometrik & Boyutsal Toleranslar</span>
                    </span>
                    <span className="text-[10px] text-slate-500">EN ISO 10545-2</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-600 border-t border-slate-200 pt-1.5">
                    <div>
                      <p className="text-slate-400">Kalınlık</p>
                      <p className="font-bold text-slate-900">{p.thickness || '9.5'} mm ± %5</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Kenar Doğruluğu</p>
                      <p className="font-bold text-slate-900">± %0.2 mm</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Yüzey Düzgünlüğü</p>
                      <p className="font-bold text-slate-900">± %0.3 mm</p>
                    </div>
                  </div>
                </div>

                {/* 1:1 Digital Texture & BIM Sample */}
                {p.textureUrl && (
                  <div className="flex items-center gap-3 p-2.5 bg-white border border-slate-300 rounded-xl shadow-xs">
                    <img
                      src={p.textureUrl}
                      alt="Texture"
                      className="w-12 h-12 rounded-lg object-cover border border-slate-300 flex-shrink-0"
                    />
                    <div className="text-xs font-mono">
                      <p className="font-bold text-slate-900">1:1 BIM & CAD Dijital Doku</p>
                      <p className="text-slate-500 text-[10px]">
                        Revit / ArchiCAD materyal kaplamasına hazır dijital yüzey
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Full Technical Submittal Matrix */}
              <div className="md:col-span-6 flex flex-col justify-between h-full bg-white border-2 border-slate-300 rounded-xl p-4 shadow-md font-mono">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-slate-900 font-sans">
                        {p.name}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Poz No: {p.code || `SB-${index + 101}`} &bull; {p.style || 'Mimari Porselen'}
                      </p>
                    </div>
                  </div>

                  {/* Standard Submittal Table */}
                  <div className="border border-slate-200 rounded-lg overflow-hidden text-xs divide-y divide-slate-100 mb-3">
                    <div className="bg-slate-100 px-3 py-1.5 font-bold text-slate-800 text-[10px] uppercase flex justify-between">
                      <span>Test Standardı (TS EN 14411)</span>
                      <span>Beyan Edilen Değer</span>
                    </div>

                    <div className="flex justify-between px-3 py-1.5">
                      <span className="text-slate-500">Su Emme (EN ISO 10545-3)</span>
                      <span className="font-bold text-slate-800">E ≤ 0.1% (Grup BIA)</span>
                    </div>

                    <div className="flex justify-between px-3 py-1.5">
                      <span className="text-slate-500">Kırılma Dayanımı (10545-4)</span>
                      <span className="font-bold text-slate-800">≥ 2000 N</span>
                    </div>

                    <div className="flex justify-between px-3 py-1.5">
                      <span className="text-slate-500">Eğilme Dayanımı (10545-4)</span>
                      <span className="font-bold text-slate-800">≥ 45 N/mm²</span>
                    </div>

                    <div className="flex justify-between px-3 py-1.5">
                      <span className="text-slate-500">Yüzey Aşınması (PEI - 10545-7)</span>
                      <span className="font-bold text-blue-700">PEI {p.peiRating || 'IV'}</span>
                    </div>

                    <div className="flex justify-between px-3 py-1.5">
                      <span className="text-slate-500">Kayma Direnci (DIN 51130)</span>
                      <span className="font-bold text-blue-700">{p.slipResistance || 'R10 - A+B'}</span>
                    </div>

                    <div className="flex justify-between px-3 py-1.5">
                      <span className="text-slate-500">Dona Dayanıklılık (10545-12)</span>
                      <span className="font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 size={12} /> Dayanıklı (Frost-proof)
                      </span>
                    </div>

                    <div className="flex justify-between px-3 py-1.5">
                      <span className="text-slate-500">Leke Dayanımı (10545-14)</span>
                      <span className="font-bold text-slate-800">Sınıf 5 (En Yüksek)</span>
                    </div>
                  </div>
                </div>

                {/* 3D AR & BIM QR Action Bar */}
                {catalog.showQrCodes && (
                  <div className="p-2.5 rounded-xl bg-slate-900 text-white flex items-center gap-3">
                    {p.qrCodeUrl ? (
                      <img
                        src={p.qrCodeUrl}
                        alt="QR Code"
                        className="w-13 h-13 rounded bg-white p-1 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-13 h-13 rounded bg-white p-2 flex items-center justify-center flex-shrink-0 text-slate-900">
                        <QrCode size={28} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-cyan-300">
                        3D / AR Canlı İnceleme & BIM Modeli
                      </p>
                      <p className="text-[10px] text-slate-300 leading-tight mt-0.5">
                        Kameranızla okutun veya tıklayın; 3D simülatörde projeye uygulayın.
                      </p>
                      <a
                        href={p.tryInRoomUrl || p.productUrl || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] font-bold text-cyan-400 hover:underline flex items-center gap-1 mt-0.5"
                      >
                        <span>3D Görüntüle</span>
                        <ExternalLink size={10} />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Running Footer */}
          <div className="border-t-2 border-slate-900 pt-2.5 flex justify-between items-center text-xs text-slate-600 font-mono">
            <span>
              {brand.name} Mimari Teknik Şartname &bull; Poz: {p.code || `SB-${index + 101}`}
            </span>
            <span>Sayfa {pageNum.toString().padStart(2, '0')}</span>
          </div>
        </section>
      );
    }

    // -------------------------------------------------------------------------
    // CONTACT — TECHNICAL SUBMITTAL CLOSING
    // -------------------------------------------------------------------------
    if (pageObj.type === 'contact') {
      return (
        <section
          key="contact"
          className="catalog-page relative p-8 sm:p-14 bg-slate-900 text-white flex flex-col justify-between font-mono overflow-hidden"
        >
          <div className="border-b border-slate-700 pb-4 flex justify-between items-center">
            <span className="text-xl font-bold tracking-wider">{brand.name}</span>
            <span className="text-xs text-cyan-400">MİMARİ TEKNİK OFİS</span>
          </div>

          <div className="my-auto py-8 max-w-xl">
            <h3 className="text-3xl font-bold text-white mb-3 font-sans">
              Şartname & Proje Departmanı
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              Teknik şartname hazırlığı, akustik/statik hesaplamalar ve numune kutusu talepleri için proje masamızla doğrudan iletişime geçebilirsiniz.
            </p>

            <div className="p-5 rounded-xl bg-slate-800 border border-slate-700 space-y-3 text-xs">
              {catalog.contactAddress && (
                <div className="flex gap-4">
                  <span className="w-20 text-slate-400">Adres:</span>
                  <span className="text-white">{catalog.contactAddress}</span>
                </div>
              )}
              {catalog.contactPhone && (
                <div className="flex gap-4">
                  <span className="w-20 text-slate-400">Telefon:</span>
                  <a href={`tel:${catalog.contactPhone}`} className="text-cyan-400 font-bold">
                    {catalog.contactPhone}
                  </a>
                </div>
              )}
              {catalog.contactEmail && (
                <div className="flex gap-4">
                  <span className="w-20 text-slate-400">E-Posta:</span>
                  <a href={`mailto:${catalog.contactEmail}`} className="text-cyan-400 font-bold">
                    {catalog.contactEmail}
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-slate-700 pt-4 flex justify-between text-xs text-slate-400">
            <span>&copy; {new Date().getFullYear()} {brand.name} Mimari Teknik Grubu</span>
            <span>SeramikBak Mimari Çözümler</span>
          </div>
        </section>
      );
    }

    return null;
  };

  if (viewFormat === 'single') {
    return (
      <div className="w-full flex justify-center">
        {renderSinglePage(pages[activePageIndex] || pages[0], activePageIndex)}
      </div>
    );
  }

  if (viewFormat === 'spread') {
    const isCover = activePageIndex === 0;
    if (isCover) {
      return (
        <div className="w-full flex justify-center">
          {renderSinglePage(pages[0], 0)}
        </div>
      );
    }

    const leftIdx = activePageIndex % 2 === 1 ? activePageIndex : activePageIndex - 1;
    const rightIdx = leftIdx + 1;

    return (
      <div className="w-full flex flex-col md:flex-row items-center justify-center gap-4 lg:gap-6">
        <div className="w-full md:w-1/2 flex justify-end">
          {renderSinglePage(pages[leftIdx], leftIdx)}
        </div>
        <div className="w-full md:w-1/2 flex justify-start">
          {rightIdx < pages.length && renderSinglePage(pages[rightIdx], rightIdx)}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-10 items-center">
      {pages.map((p, idx) => renderSinglePage(p, idx))}
    </div>
  );
}
