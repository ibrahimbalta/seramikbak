'use client';

import React, { useState } from 'react';
import {
  Globe,
  QrCode,
  ExternalLink,
  ShieldCheck,
  Box,
  Truck,
  Ship,
  FileCheck2,
  Anchor
} from 'lucide-react';

export default function GlobalExportTemplate({
  catalog,
  products = [],
  mode = 'preview',
  activePageIndex = 0,
  viewFormat = 'single'
}) {
  const brand = catalog.brand || {};
  const logo = catalog.customLogoUrl || brand.logoUrl;
  const [imgErrors, setImgErrors] = useState({});

  const handleImgError = (id) => {
    setImgErrors((prev) => ({ ...prev, [id]: true }));
  };

  const pages = [];
  if (catalog.showCover) pages.push({ type: 'cover' });
  if (catalog.showTOC && products.length > 0) pages.push({ type: 'toc' });
  products.forEach((p, idx) => pages.push({ type: 'product', product: p, index: idx }));
  if (catalog.showContactPage) pages.push({ type: 'contact' });

  const renderSinglePage = (pageObj, pageIndex) => {
    if (!pageObj) return null;

    // -------------------------------------------------------------------------
    // COVER — EXECUTIVE GLOBAL MARITIME & EXPORT COVER
    // -------------------------------------------------------------------------
    if (pageObj.type === 'cover') {
      const coverHero =
        products[0]?.imageUrl ||
        products[0]?.textureUrl ||
        '/renders/luxury_bathroom_calacatta_gold.jpg';

      return (
        <section
          key="cover"
          className="catalog-page relative p-8 sm:p-14 text-white flex flex-col justify-between overflow-hidden"
          style={{
            background: `radial-gradient(circle at 85% 15%, rgba(14, 165, 233, 0.2) 0%, transparent 55%), linear-gradient(135deg, #020617 0%, #0f172a 50%, #1e293b 100%), url(${coverHero}) center/cover no-repeat`,
            backgroundColor: '#020617'
          }}
        >
          {/* Subtle Technical Border */}
          <div className="absolute inset-5 sm:inset-7 border border-sky-500/20 pointer-events-none rounded-xl" />

          <div className="relative z-10 flex items-center justify-between border-b border-slate-800 pb-5">
            <span className="text-2xl sm:text-3xl font-bold tracking-widest uppercase font-mono">
              {brand.name}
            </span>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-mono font-bold flex items-center gap-1.5">
                <Globe size={13} />
                <span>GLOBAL EXPORT &bull; B2B DOSSIER</span>
              </span>
            </div>
          </div>

          <div className="relative z-10 my-auto py-10 max-w-2xl font-mono">
            <p className="text-xs uppercase tracking-[0.3em] text-sky-400 mb-4 font-semibold">
              INTERNATIONAL CERAMIC SPECIFICATION &bull; {new Date().getFullYear()}
            </p>
            <h1 className="text-4xl sm:text-6xl font-light tracking-tight text-white mb-5 font-sans leading-tight">
              {catalog.coverTitle || catalog.title}
            </h1>
            {catalog.coverSubtitle && (
              <p className="text-base sm:text-xl text-slate-300 font-light leading-relaxed mb-6 font-sans">
                {catalog.coverSubtitle}
              </p>
            )}

            <div className="p-4 sm:p-5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-slate-300 space-y-2 backdrop-blur-md">
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">Harmonized Tariff (HS Code):</span>
                <span className="text-white font-bold font-mono">6907.21 (Glazed Porcelain)</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">Country of Origin:</span>
                <span className="text-white font-bold font-mono">Republic of Turkey</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Seaport Ports of Loading:</span>
                <span className="text-sky-300 font-bold font-mono">Port of Ambarli / Izmir / Gemlik</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 border-t border-slate-800 pt-4 flex justify-between text-xs text-slate-400 font-mono">
            <span>{brand.name} International Export Division</span>
            <span className="text-sky-400">SeramikBak B2B Global Trade</span>
          </div>
        </section>
      );
    }

    // -------------------------------------------------------------------------
    // TOC — CONTAINER & LOGISTICS MATRIX
    // -------------------------------------------------------------------------
    if (pageObj.type === 'toc') {
      return (
        <section
          key="toc"
          className="catalog-page relative p-8 sm:p-10 bg-slate-50 text-slate-900 flex flex-col justify-between font-mono overflow-hidden"
          style={{
            backgroundImage:
              'radial-gradient(#94a3b8 0.75px, transparent 0.75px)',
            backgroundSize: '16px 16px'
          }}
        >
          <div>
            <div className="border-b-2 border-slate-900 pb-3 mb-6 flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                  PACKING LIST & LOGISTICS MATRIX
                </h2>
                <p className="text-xs text-slate-500 font-sans">
                  {brand.name} Container Freight & Pallet Optimization
                </p>
              </div>
              <span className="text-xs bg-sky-100 text-sky-900 px-3 py-1 rounded font-bold border border-sky-300">
                HS 6907.21
              </span>
            </div>

            <div className="border-2 border-slate-300 rounded-xl overflow-x-auto text-xs bg-white shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold border-b-2 border-slate-300 text-[11px] uppercase">
                    <th className="p-2.5 border-r border-slate-300">#</th>
                    <th className="p-2.5 border-r border-slate-300">Ref Code</th>
                    <th className="p-2.5 border-r border-slate-300">Item Name</th>
                    <th className="p-2.5 border-r border-slate-300">Sizes (cm)</th>
                    <th className="p-2.5 border-r border-slate-300">m² / Box</th>
                    <th className="p-2.5 border-r border-slate-300">Boxes / Pallet</th>
                    <th className="p-2.5">m² / Pallet</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {products.map((p, idx) => {
                    const width = p.width || 60;
                    const height = p.height || 120;
                    const m2PerTile = (width * height) / 10000;
                    const pcsPerBox = width >= 60 ? 2 : 4;
                    const m2PerBox = (m2PerTile * pcsPerBox).toFixed(2);
                    const boxesPerPallet = width >= 60 ? 32 : 40;
                    const m2PerPallet = (Number(m2PerBox) * boxesPerPallet).toFixed(2);

                    return (
                      <tr key={p.id || idx} className="hover:bg-slate-50 transition">
                        <td className="p-2.5 border-r border-slate-200 font-bold text-slate-400">
                          {(idx + 1).toString().padStart(2, '0')}
                        </td>
                        <td className="p-2.5 border-r border-slate-200 text-sky-700 font-bold">
                          {p.code || `EXP-${idx + 1}`}
                        </td>
                        <td className="p-2.5 border-r border-slate-200 font-sans font-medium text-slate-900">
                          {p.name}
                        </td>
                        <td className="p-2.5 border-r border-slate-200">{width}x{height}</td>
                        <td className="p-2.5 border-r border-slate-200">{m2PerBox} m²</td>
                        <td className="p-2.5 border-r border-slate-200">{boxesPerPallet} boxes</td>
                        <td className="p-2.5 font-bold text-slate-900">{m2PerPallet} m²</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="border-t border-slate-300 pt-3 flex justify-between text-xs text-slate-500">
            <span>{brand.name} Logistics & Packing Specification</span>
            <span>Page 02</span>
          </div>
        </section>
      );
    }

    // -------------------------------------------------------------------------
    // PRODUCT PAGE — B2B EXPORT SPECIFICATION SHEET
    // -------------------------------------------------------------------------
    if (pageObj.type === 'product') {
      const p = pageObj.product;
      const index = pageObj.index;
      const pImage = p.imageUrl || p.textureUrl || '/renders/luxury_bathroom_calacatta_gold.jpg';
      const dimensions = p.width && p.height ? `${p.width} × ${p.height} cm` : '60 × 120 cm';
      const pageNum = pageIndex + 1;

      const width = p.width || 60;
      const height = p.height || 120;
      const m2PerTile = (width * height) / 10000;
      const pcsPerBox = width >= 60 ? 2 : 4;
      const m2PerBox = (m2PerTile * pcsPerBox).toFixed(2);
      const boxesPerPallet = width >= 60 ? 32 : 40;
      const m2PerPallet = (Number(m2PerBox) * boxesPerPallet).toFixed(2);
      const palletWeightKg = (Number(m2PerPallet) * 22.5).toFixed(0);

      return (
        <section
          key={p.id || index}
          className="catalog-page relative p-6 sm:p-10 bg-slate-50 text-slate-900 flex flex-col justify-between font-sans overflow-hidden"
          style={{
            backgroundImage:
              'radial-gradient(#94a3b8 0.75px, transparent 0.75px)',
            backgroundSize: '16px 16px'
          }}
        >
          {/* Header */}
          <div className="border-2 border-slate-900 bg-white p-3 rounded-xl flex items-center justify-between shadow-xs mb-3 font-mono">
            <div className="flex items-center gap-3">
              <span className="font-bold text-sm tracking-wider">{brand.name}</span>
              <span className="text-slate-300">|</span>
              <span className="text-xs text-sky-700 font-bold uppercase">
                B2B EXPORT SPECIFICATION
              </span>
            </div>
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-300">
              ITEM REF: {p.code || `EXP-${index + 1}`}
            </span>
          </div>

          {/* Main Layout */}
          <div className="flex-1 flex flex-col justify-between gap-3 my-auto">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
              
              {/* Left Column: Visual & Logistics Schematics */}
              <div className="md:col-span-6 flex flex-col justify-between gap-3">
                <div className="border-2 border-slate-300 rounded-xl overflow-hidden aspect-[16/11] bg-white relative flex items-center justify-center shadow-md group">
                  <img
                    src={pImage}
                    alt={p.name}
                    onError={() => handleImgError(`prod-${p.id}`)}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 left-2.5 bg-slate-900/90 text-white font-mono text-xs px-2.5 py-1 rounded shadow">
                    SIZE: {dimensions}
                  </div>
                  <div className="absolute bottom-2.5 right-2.5 bg-sky-600 text-white font-mono text-[10px] px-2.5 py-0.5 rounded font-bold shadow">
                    EXPORT GRADE
                  </div>
                </div>

                {/* Pallet Schematic Card */}
                <div className="p-3 bg-white border-2 border-slate-300 rounded-xl shadow-xs font-mono">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-2">
                    <span className="flex items-center gap-1.5">
                      <Truck size={14} className="text-sky-600" />
                      <span>Pallet & Freight Specifications</span>
                    </span>
                    <span className="text-[10px] text-slate-500">Euro-Pallet (80x120)</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-600 border-t border-slate-200 pt-2">
                    <div>
                      <p className="text-slate-400">Box Contents</p>
                      <p className="font-bold text-slate-900">{pcsPerBox} pcs / {m2PerBox} m²</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Pallet Volume</p>
                      <p className="font-bold text-slate-900">{boxesPerPallet} Boxes / {m2PerPallet} m²</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Pallet Gross Wt.</p>
                      <p className="font-bold text-slate-900">~{palletWeightKg} kg</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: B2B Specifications Matrix */}
              <div className="md:col-span-6 flex flex-col justify-between h-full bg-white border-2 border-slate-300 rounded-xl p-4 shadow-md font-mono">
                <div>
                  <div className="border-b border-slate-200 pb-2 mb-2">
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 font-sans">
                      {p.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      HS Code: 6907.21 &bull; Origin: TR &bull; Series: {p.code || `EXP-${index + 1}`}
                    </p>
                  </div>

                  {/* Export Specs Table */}
                  <div className="border border-slate-200 rounded-lg overflow-hidden text-xs divide-y divide-slate-100 mb-3">
                    <div className="flex justify-between px-3 py-1.5 bg-slate-100 font-bold text-slate-800 text-[10px] uppercase">
                      <span>Parameter</span>
                      <span>Specification</span>
                    </div>
                    <div className="flex justify-between px-3 py-1.5">
                      <span className="text-slate-500">Nominal Size</span>
                      <span className="font-bold text-slate-800">{dimensions}</span>
                    </div>
                    <div className="flex justify-between px-3 py-1.5">
                      <span className="text-slate-500">Thickness</span>
                      <span className="font-bold text-slate-800">{p.thickness || '9.5'} mm</span>
                    </div>
                    <div className="flex justify-between px-3 py-1.5">
                      <span className="text-slate-500">Surface Finish</span>
                      <span className="font-bold text-slate-800">{p.finish || 'Polished Lappato'}</span>
                    </div>
                    <div className="flex justify-between px-3 py-1.5">
                      <span className="text-slate-500">Edge Finish</span>
                      <span className="font-bold text-slate-800">Rectified Laser-Cut</span>
                    </div>
                    <div className="flex justify-between px-3 py-1.5">
                      <span className="text-slate-500">Water Absorption</span>
                      <span className="font-bold text-slate-800">≤ 0.1% (Group BIA)</span>
                    </div>
                    <div className="flex justify-between px-3 py-1.5">
                      <span className="text-slate-500">Breaking Strength</span>
                      <span className="font-bold text-slate-800">≥ 2200 N</span>
                    </div>
                    <div className="flex justify-between px-3 py-1.5">
                      <span className="text-slate-500">Frost Resistance</span>
                      <span className="font-bold text-emerald-700">Fully Resistant</span>
                    </div>
                  </div>
                </div>

                {/* 3D AR Simulator Action */}
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
                      <p className="text-xs font-bold text-sky-300">
                        Interactive 3D / AR Digital Inspection
                      </p>
                      <p className="text-[10px] text-slate-300 leading-tight mt-0.5">
                        Scan to inspect 3D slab reliefs and simulate in room environments.
                      </p>
                      <a
                        href={p.tryInRoomUrl || p.productUrl || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] font-bold text-sky-400 hover:underline flex items-center gap-1 mt-0.5"
                      >
                        <span>Open 3D Simulator</span>
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
              {brand.name} International Export &bull; Item: {p.code || `EXP-${index + 1}`}
            </span>
            <span>Page {pageNum.toString().padStart(2, '0')}</span>
          </div>
        </section>
      );
    }

    // -------------------------------------------------------------------------
    // CONTACT
    // -------------------------------------------------------------------------
    if (pageObj.type === 'contact') {
      return (
        <section
          key="contact"
          className="catalog-page relative p-8 sm:p-14 bg-slate-950 text-white flex flex-col justify-between font-mono overflow-hidden"
        >
          <div className="border-b border-slate-800 pb-4 flex justify-between items-center">
            <span className="text-xl font-bold tracking-wider">{brand.name}</span>
            <span className="text-xs text-sky-400">GLOBAL EXPORT DESK</span>
          </div>

          <div className="my-auto py-8 max-w-xl">
            <h3 className="text-3xl font-bold text-white mb-3 font-sans">
              International Trade & Logistics Desk
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-6 font-sans">
              For FCL container quotations, maritime freight bookings, and physical sample shipments, please contact our export sales department.
            </p>

            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
              {catalog.contactAddress && (
                <div className="flex gap-4">
                  <span className="w-20 text-slate-400">Address:</span>
                  <span className="text-white">{catalog.contactAddress}</span>
                </div>
              )}
              {catalog.contactPhone && (
                <div className="flex gap-4">
                  <span className="w-20 text-slate-400">Telephone:</span>
                  <a href={`tel:${catalog.contactPhone}`} className="text-sky-400 font-bold">
                    {catalog.contactPhone}
                  </a>
                </div>
              )}
              {catalog.contactEmail && (
                <div className="flex gap-4">
                  <span className="w-20 text-slate-400">E-Mail:</span>
                  <a href={`mailto:${catalog.contactEmail}`} className="text-sky-400 font-bold">
                    {catalog.contactEmail}
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-slate-800 pt-4 flex justify-between text-xs text-slate-500">
            <span>&copy; {new Date().getFullYear()} {brand.name} Export Division</span>
            <span>SeramikBak Global B2B</span>
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

  return (
    <div className="w-full flex flex-col gap-10 items-center">
      {pages.map((p, idx) => renderSinglePage(p, idx))}
    </div>
  );
}
