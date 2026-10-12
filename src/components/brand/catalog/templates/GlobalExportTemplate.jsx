'use client';

import React from 'react';
import { Globe, QrCode, ExternalLink, ShieldCheck, Box, Truck } from 'lucide-react';

export default function GlobalExportTemplate({
  catalog,
  products = [],
  mode = 'preview',
  activePageIndex = 0,
  viewFormat = 'single'
}) {
  const brand = catalog.brand || {};
  const logo = catalog.customLogoUrl || brand.logoUrl;

  const pages = [];
  if (catalog.showCover) pages.push({ type: 'cover' });
  if (catalog.showTOC && products.length > 0) pages.push({ type: 'toc' });
  products.forEach((p, idx) => pages.push({ type: 'product', product: p, index: idx }));
  if (catalog.showContactPage) pages.push({ type: 'contact' });

  const renderSinglePage = (pageObj, pageIndex) => {
    if (!pageObj) return null;

    if (pageObj.type === 'cover') {
      const coverHero = products[0]?.imageUrl || '/renders/luxury_bathroom_calacatta_gold.jpg';
      return (
        <section
          key="cover"
          className="catalog-page p-8 sm:p-14 text-white flex flex-col justify-between"
          style={{
            background: `linear-gradient(135deg, rgba(2, 6, 23, 0.95) 0%, rgba(15, 23, 42, 0.88) 100%), url(${coverHero}) center/cover no-repeat`,
            backgroundColor: '#020617'
          }}
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-5">
            <span className="text-2xl font-bold tracking-widest uppercase">{brand.name}</span>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-mono">
                GLOBAL EXPORT
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">
                EN 14411 BIA
              </span>
            </div>
          </div>

          <div className="my-auto py-8 max-w-2xl font-mono">
            <p className="text-xs uppercase tracking-[0.25em] text-blue-400 mb-3">
              INTERNATIONAL CERAMIC TILES CATALOGUE &bull; {new Date().getFullYear()}
            </p>
            <h1 className="text-4xl sm:text-5xl font-light tracking-tight text-white mb-4 font-sans">
              {catalog.coverTitle || catalog.title}
            </h1>
            {catalog.coverSubtitle && (
              <p className="text-base text-slate-300 font-light leading-relaxed mb-6 font-sans">
                {catalog.coverSubtitle}
              </p>
            )}
            <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-300 space-y-1">
              <p><strong className="text-white">Harmonized Code (HS):</strong> 6907.21 (Glazed Porcelain)</p>
              <p><strong className="text-white">Origin:</strong> Republic of Turkey (Port of Izmir / Gemlik)</p>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-4 flex justify-between text-xs text-slate-400 font-mono">
            <span>{brand.name} International Export Division</span>
            <span>SeramikBak B2B Global</span>
          </div>
        </section>
      );
    }

    if (pageObj.type === 'toc') {
      return (
        <section key="toc" className="catalog-page p-8 sm:p-10 bg-white text-slate-900 flex flex-col justify-between font-mono">
          <div>
            <div className="border-b-2 border-slate-900 pb-3 mb-6 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold tracking-tight">PACKING LIST & CONTAINER SPECS</h2>
                <p className="text-xs text-slate-500 font-sans">{brand.name} Logistics Matrix</p>
              </div>
              <span className="text-xs bg-slate-100 text-slate-800 px-3 py-1 rounded border border-slate-200">
                HS 6907.21
              </span>
            </div>

            <div className="border border-slate-300 rounded-lg overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300 text-[11px]">
                    <th className="p-2 border-r border-slate-300">#</th>
                    <th className="p-2 border-r border-slate-300">Ref</th>
                    <th className="p-2 border-r border-slate-300">Sizes (cm)</th>
                    <th className="p-2 border-r border-slate-300">Thick.</th>
                    <th className="p-2 border-r border-slate-300">m² / Box</th>
                    <th className="p-2 border-r border-slate-300">Boxes / Pallet</th>
                    <th className="p-2">m² / Pallet</th>
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
                      <tr key={p.id || idx} className="hover:bg-slate-50">
                        <td className="p-2 border-r border-slate-200 font-semibold">{(idx + 1).toString().padStart(2, '0')}</td>
                        <td className="p-2 border-r border-slate-200 text-blue-600 font-bold">{p.code || `EXP-${idx+1}`}</td>
                        <td className="p-2 border-r border-slate-200">{width}x{height}</td>
                        <td className="p-2 border-r border-slate-200">{p.thickness || '9.5'} mm</td>
                        <td className="p-2 border-r border-slate-200">{m2PerBox} m²</td>
                        <td className="p-2 border-r border-slate-200">{boxesPerPallet}</td>
                        <td className="p-2 font-bold">{m2PerPallet} m²</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-3 flex justify-between text-xs text-slate-500">
            <span>{brand.name} Logistics & Packing Specification</span>
            <span>Page 02</span>
          </div>
        </section>
      );
    }

    if (pageObj.type === 'product') {
      const p = pageObj.product;
      const index = pageObj.index;
      const pImage = p.imageUrl || p.textureUrl || '/renders/luxury_bathroom_calacatta_gold.jpg';
      const dimensions = p.width && p.height ? `${p.width} × ${p.height} cm` : 'Standard';

      return (
        <section key={p.id || index} className="catalog-page p-6 sm:p-10 bg-white text-slate-900 flex flex-col justify-between font-sans">
          <div className="border-b-2 border-slate-900 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-bold font-mono text-sm">{brand.name}</span>
              <span className="text-slate-300">|</span>
              <span className="text-xs font-mono text-blue-700 font-bold uppercase">PORCELAIN STONEWARE</span>
            </div>
            <span className="text-xs font-mono text-slate-500 font-bold">ITEM REF: {p.code || `EXP-${index+1}`}</span>
          </div>

          <div className="my-auto py-4 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-7">
              <div className="border border-slate-300 rounded-xl overflow-hidden aspect-[4/3] bg-slate-100 flex items-center justify-center relative shadow-sm">
                <img src={pImage} alt={p.name} className="w-full h-full object-cover" />
                <div className="absolute bottom-3 left-3 bg-slate-900/90 text-white font-mono text-xs px-3 py-1 rounded">
                  {dimensions} &bull; Rectified
                </div>
              </div>
            </div>

            <div className="md:col-span-5 flex flex-col justify-between h-full">
              <div>
                <span className="text-[10px] font-mono font-bold text-blue-600 uppercase tracking-wider block mb-1">
                  Group BIa &bull; EN 14411
                </span>
                <h3 className="text-2xl sm:text-3xl font-light text-slate-900 mb-2">{p.name}</h3>

                <div className="border border-slate-200 rounded-lg text-xs font-mono overflow-hidden mb-4">
                  <div className="bg-slate-100 px-3 py-1.5 font-bold text-slate-800 border-b border-slate-200">
                    TECHNICAL PARAMETERS
                  </div>
                  <div className="divide-y divide-slate-200">
                    <div className="flex justify-between p-2"><span>Size:</span><span className="font-bold">{dimensions}</span></div>
                    <div className="flex justify-between p-2 bg-slate-50/50"><span>Finish:</span><span className="font-bold">{p.finish || 'Matte R10'}</span></div>
                    <div className="flex justify-between p-2"><span>Slip Rating:</span><span className="font-bold">{p.slipResistance || 'R10'}</span></div>
                    <div className="flex justify-between p-2 bg-slate-50/50"><span>PEI Class:</span><span className="font-bold">PEI {p.peiRating || '4'}</span></div>
                    <div className="flex justify-between p-2"><span>Frost Resistance:</span><span className="font-bold text-emerald-700">Resistant</span></div>
                  </div>
                </div>
              </div>

              {catalog.showQrCodes && (
                <div className="p-3 border border-slate-200 rounded-xl bg-slate-50 flex items-center gap-3">
                  <img src={p.qrCodeUrl || '/favicon.ico'} alt="QR" className="w-14 h-14 bg-white p-1 border border-slate-300 rounded-lg" />
                  <div className="text-xs font-mono">
                    <p className="font-bold text-slate-900">Virtual Reality & 3D</p>
                    <p className="text-[10px] text-slate-500 font-sans">Scan with smartphone camera to simulate in 3D rooms.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-slate-200 pt-3 flex justify-between text-xs font-mono text-slate-500">
            <span>{brand.name} Export Series &bull; {p.name}</span>
            <span>Page {(pageIndex + 1).toString().padStart(2, '0')}</span>
          </div>
        </section>
      );
    }

    if (pageObj.type === 'contact') {
      return (
        <section key="contact" className="catalog-page p-8 sm:p-12 text-white flex flex-col justify-between font-mono" style={{ backgroundColor: '#020617' }}>
          <div className="border-b border-slate-800 pb-4 flex justify-between">
            <span className="text-lg font-bold">{brand.name} EXPORT DESK</span>
            <span className="text-xs text-slate-400">INCOTERMS 2020: FOB / CIF</span>
          </div>
          <div className="my-auto py-8 max-w-xl">
            <h4 className="text-2xl font-bold mb-3 font-sans">Commercial Inquiries & Container Quotations</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-sans mb-6">
              For volume export orders, container loading schedules and distributor partnerships, please contact our international trading desk.
            </p>
            <div className="space-y-2 text-xs bg-slate-900 p-4 rounded-xl border border-slate-800 text-slate-300">
              <div><strong className="text-white">Export Office:</strong> {catalog.contactAddress || 'Istanbul / Izmir Trade Zone'}</div>
              <div><strong className="text-white">Telephone:</strong> {catalog.contactPhone || '+90 (212) 000 00 00'}</div>
              <div><strong className="text-white">Email:</strong> {catalog.contactEmail || 'export@seramikbak.com'}</div>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-4 text-xs text-slate-500 flex justify-between">
            <span>&copy; {new Date().getFullYear()} {brand.name}. Global Porcelain Export.</span>
            <span>SeramikBak Global</span>
          </div>
        </section>
      );
    }

    return null;
  };

  if (viewFormat === 'single') {
    return <div className="w-full flex justify-center">{renderSinglePage(pages[activePageIndex] || pages[0], activePageIndex)}</div>;
  }

  return <div className="w-full flex flex-col gap-8 items-center">{pages.map((p, idx) => renderSinglePage(p, idx))}</div>;
}
