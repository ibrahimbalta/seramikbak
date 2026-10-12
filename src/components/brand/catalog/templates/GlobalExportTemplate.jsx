'use client';

import React from 'react';

export default function GlobalExportTemplate({ catalog, products = [], mode = 'preview' }) {
  const brand = catalog.brand || {};
  const logo = catalog.customLogoUrl || brand.logoUrl;
  const isLandscape = catalog.orientation === 'landscape';

  return (
    <div className={`catalog-global-export font-sans ${isLandscape ? 'orientation-landscape' : 'orientation-portrait'}`}>
      {/* -------------------- COVER PAGE (INTERNATIONAL B2B & EXPORT) -------------------- */}
      {catalog.showCover && (
        <section className="catalog-page cover-page flex flex-col justify-between p-12 bg-slate-950 text-white relative">
          <div className="flex items-center justify-between border-b border-slate-800 pb-6">
            <div className="flex items-center gap-4">
              {logo ? (
                <img src={logo} alt={brand.name} className="h-10 max-w-[180px] object-contain filter brightness-0 invert" />
              ) : (
                <span className="text-2xl font-bold tracking-widest">{brand.name}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-mono">
                GLOBAL EXPORT
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">
                EN 14411 BIa
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">
                CE CERTIFIED
              </span>
            </div>
          </div>

          <div className="my-auto py-12 max-w-2xl">
            <p className="text-xs font-mono uppercase tracking-[0.25em] text-blue-400 mb-4">
              INTERNATIONAL CERAMIC TILES CATALOGUE &bull; {new Date().getFullYear()}
            </p>
            <h1 className="text-5xl md:text-6xl font-light tracking-tight text-white mb-6">
              {catalog.coverTitle || catalog.title}
            </h1>
            {catalog.coverSubtitle && (
              <p className="text-xl text-slate-300 font-light leading-relaxed mb-6">
                {catalog.coverSubtitle}
              </p>
            )}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 space-y-1 font-mono">
              <p><strong className="text-white">Export Origin:</strong> Republic of Turkey / Port of Izmir & Port of Gemlik</p>
              <p><strong className="text-white">Harmonized Code (HS):</strong> 6907.21 (Glazed Porcelain Stoneware)</p>
              <p><strong className="text-white">Logistics Capabilities:</strong> 20ft / 40ft FCL Container & Full Truckload (FTL)</p>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-6 flex items-end justify-between text-xs text-slate-400 font-mono">
            <div>
              <p className="text-white font-semibold">{brand.name} Export Division</p>
              <p>{catalog.websiteUrl || 'www.seramikbak.com'}</p>
            </div>
            <div className="text-right">
              <p className="text-slate-300">Certified Quality & Logistics Portal</p>
              <p className="text-[10px] text-slate-500">POWERED BY SERAMİKBAK B2B</p>
            </div>
          </div>
        </section>
      )}

      {/* -------------------- EXPORT LOGISTICS & PACKAGING TABLE -------------------- */}
      {catalog.showTOC && products.length > 0 && (
        <section className="catalog-page p-10 bg-white text-slate-900 flex flex-col justify-between font-mono">
          <div>
            <div className="border-b-2 border-slate-900 pb-3 mb-6 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold tracking-tight">PACKING LIST & CONTAINER LOADING DATA</h2>
                <p className="text-xs text-slate-500 font-sans">{brand.name} Global Logistics Matrix</p>
              </div>
              <span className="text-xs bg-slate-100 text-slate-800 px-3 py-1 rounded border border-slate-200">
                HS CODE: 6907.21.00
              </span>
            </div>

            <div className="border border-slate-300 rounded-lg overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300 text-[11px]">
                    <th className="p-2.5 border-r border-slate-300">#</th>
                    <th className="p-2.5 border-r border-slate-300">Item / Ref</th>
                    <th className="p-2.5 border-r border-slate-300">Sizes (cm)</th>
                    <th className="p-2.5 border-r border-slate-300">Thick. (mm)</th>
                    <th className="p-2.5 border-r border-slate-300">m² / Box</th>
                    <th className="p-2.5 border-r border-slate-300">Pcs / Box</th>
                    <th className="p-2.5 border-r border-slate-300">Boxes / Pallet</th>
                    <th className="p-2.5 border-r border-slate-300">m² / Pallet</th>
                    <th className="p-2.5">Gross Wt (kg)</th>
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
                    const weightPerPallet = Math.round(Number(m2PerPallet) * 22);

                    return (
                      <tr key={p.id || idx} className="hover:bg-slate-50">
                        <td className="p-2.5 border-r border-slate-200 font-semibold">{(idx + 1).toString().padStart(2, '0')}</td>
                        <td className="p-2.5 border-r border-slate-200 text-blue-600 font-bold">{p.code || `EXP-${idx+1}`}</td>
                        <td className="p-2.5 border-r border-slate-200">{width}x{height}</td>
                        <td className="p-2.5 border-r border-slate-200">{p.thickness || '9.5'} mm</td>
                        <td className="p-2.5 border-r border-slate-200">{m2PerBox} m²</td>
                        <td className="p-2.5 border-r border-slate-200">{pcsPerBox}</td>
                        <td className="p-2.5 border-r border-slate-200">{boxesPerPallet}</td>
                        <td className="p-2.5 border-r border-slate-200 font-bold">{m2PerPallet} m²</td>
                        <td className="p-2.5">{weightPerPallet} kg</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <p className="font-bold text-slate-800 mb-1">20ft FCL Container</p>
                <p className="text-slate-600">Capacity: 21 - 24 Pallets</p>
                <p className="text-slate-600">Total m²: ~1,100 - 1,450 m²</p>
                <p className="text-slate-600">Max Weight: 26,000 kg</p>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <p className="font-bold text-slate-800 mb-1">40ft HC Container</p>
                <p className="text-slate-600">Capacity: 26 - 28 Pallets</p>
                <p className="text-slate-600">Total m²: ~1,400 - 1,800 m²</p>
                <p className="text-slate-600">Max Weight: 27,500 kg</p>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <p className="font-bold text-slate-800 mb-1">Standard Mega Truck</p>
                <p className="text-slate-600">Capacity: 24 - 26 Pallets</p>
                <p className="text-slate-600">Total m²: ~1,350 - 1,600 m²</p>
                <p className="text-slate-600">Max Weight: 24,000 kg (EU limit)</p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-3 flex justify-between items-center text-xs text-slate-500">
            <span>{brand.name} Logistics & Packing Specification</span>
            {catalog.showPageNumbers && <span>Page 02</span>}
          </div>
        </section>
      )}

      {/* -------------------- EXPORT ITEM PAGES -------------------- */}
      {products.map((p, index) => {
        const pageNum = (catalog.showCover ? 1 : 0) + (catalog.showTOC ? 1 : 0) + index + 1;
        const mainImage = p.imageUrl || p.textureUrl || '/placeholder.png';
        const dimensions = p.width && p.height ? `${p.width} × ${p.height} cm` : 'Custom';

        return (
          <section key={p.id || index} className="catalog-page p-10 bg-white text-slate-900 flex flex-col justify-between font-sans">
            {/* Header */}
            <div className="border-b-2 border-slate-900 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {logo ? (
                  <img src={logo} alt={brand.name} className="h-6 max-w-[120px] object-contain" />
                ) : (
                  <span className="font-bold font-mono text-sm">{brand.name}</span>
                )}
                <span className="text-slate-300">|</span>
                <span className="text-xs font-mono text-blue-700 font-bold uppercase">PORCELAIN STONEWARE</span>
              </div>
              <span className="text-xs font-mono text-slate-500">ITEM REF: {p.code || `EXP-${index+1}`}</span>
            </div>

            {/* Content */}
            <div className="my-auto py-6 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-7">
                <div className="border border-slate-300 rounded-xl overflow-hidden aspect-[4/3] bg-slate-100 flex items-center justify-center relative shadow-sm">
                  <img src={mainImage} alt={p.name} className="w-full h-full object-cover" />
                  <div className="absolute bottom-3 left-3 bg-slate-900/90 text-white font-mono text-xs px-3 py-1 rounded">
                    {dimensions} &bull; Rectified
                  </div>
                </div>
              </div>

              <div className="md:col-span-5 flex flex-col justify-between h-full">
                <div>
                  <div className="text-[11px] font-mono font-bold text-blue-600 uppercase tracking-wider mb-1">
                    Group BIa &bull; EN 14411
                  </div>
                  <h3 className="text-3xl font-light text-slate-900 mb-2">{p.name}</h3>
                  <p className="text-xs text-slate-600 mb-6 font-light">
                    {p.customNote || p.description || 'Full-body rectified porcelain tile engineered for heavy pedestrian traffic, indoor & outdoor applications.'}
                  </p>

                  {/* Export Specs Table */}
                  <div className="border border-slate-200 rounded-lg text-xs font-mono overflow-hidden mb-6">
                    <div className="bg-slate-100 px-3 py-1.5 font-bold text-slate-800 border-b border-slate-200">
                      TECHNICAL CERTIFICATION
                    </div>
                    <div className="divide-y divide-slate-200">
                      <div className="flex justify-between p-2">
                        <span className="text-slate-500">Nominal Size:</span>
                        <span className="font-bold text-slate-800">{dimensions}</span>
                      </div>
                      <div className="flex justify-between p-2 bg-slate-50/50">
                        <span className="text-slate-500">Thickness:</span>
                        <span className="font-bold text-slate-800">{p.thickness ? `${p.thickness} mm` : '9.5 mm'}</span>
                      </div>
                      <div className="flex justify-between p-2">
                        <span className="text-slate-500">Surface Finish:</span>
                        <span className="font-bold text-slate-800">{p.finish || 'Honed / Matte'}</span>
                      </div>
                      <div className="flex justify-between p-2 bg-slate-50/50">
                        <span className="text-slate-500">Slip Rating:</span>
                        <span className="font-bold text-slate-800">{p.slipResistance || 'R10 (DIN 51130)'}</span>
                      </div>
                      <div className="flex justify-between p-2">
                        <span className="text-slate-500">Abrasion Class:</span>
                        <span className="font-bold text-slate-800">PEI {p.peiRating || '4'} (ISO 10545-7)</span>
                      </div>
                      <div className="flex justify-between p-2 bg-slate-50/50">
                        <span className="text-slate-500">Frost Resistance:</span>
                        <span className="font-bold text-emerald-700">Resistant (ISO 10545-12)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3D Visualizer & Live Spec QR */}
                {catalog.showQrCodes && p.qrCodeUrl && (
                  <div className="p-3 border border-slate-200 rounded-xl bg-slate-50 flex items-center gap-3">
                    <img src={p.qrCodeUrl} alt="QR Code" className="w-16 h-16 bg-white p-1 border border-slate-300 rounded-lg" />
                    <div className="text-xs font-mono">
                      <p className="font-bold text-slate-900">Virtual Reality & 3D Simulation</p>
                      <p className="text-[11px] text-slate-500 font-sans mt-0.5">
                        Scan to visualize this porcelain tile in 3D architectural spaces.
                      </p>
                      <a href={p.productUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-[11px] block mt-1">
                        seramikbak.com/urun/{p.slug}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 pt-3 flex justify-between items-center text-xs font-mono text-slate-500">
              <span>{brand.name} Export Series &bull; {p.name}</span>
              {catalog.showPageNumbers && <span>Page {pageNum.toString().padStart(2, '0')}</span>}
            </div>
          </section>
        );
      })}

      {/* -------------------- EXPORT CONTACT & INCOTERMS PAGE -------------------- */}
      {catalog.showContactPage && (
        <section className="catalog-page p-12 bg-slate-950 text-white flex flex-col justify-between font-mono">
          <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
            <span className="text-lg font-bold">{brand.name} INTERNATIONAL SALES & EXPORT HQ</span>
            <span className="text-xs text-slate-400">INCOTERMS 2020: FOB / CIF / EXW</span>
          </div>

          <div className="my-auto py-8 max-w-xl">
            <h4 className="text-2xl font-bold mb-4 text-white">Commercial Inquiries & Container Quotations</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-sans mb-6">
              For volume export orders, distributor partnerships, customized project sizing, and container loading schedules, please contact our international trading desk.
            </p>

            <div className="space-y-3 text-xs bg-slate-900 p-5 rounded-xl border border-slate-800 text-slate-300">
              <div className="flex"><span className="w-28 text-slate-500">Manufacturer:</span><span className="text-white font-bold">{brand.name}</span></div>
              {catalog.contactAddress && <div className="flex"><span className="w-28 text-slate-500">Export Office:</span><span>{catalog.contactAddress}</span></div>}
              {catalog.contactPhone && <div className="flex"><span className="w-28 text-slate-500">Telephone:</span><span>{catalog.contactPhone}</span></div>}
              {catalog.contactEmail && <div className="flex"><span className="w-28 text-slate-500">Export Email:</span><span>{catalog.contactEmail}</span></div>}
              {catalog.websiteUrl && <div className="flex"><span className="w-28 text-slate-500">Web Portal:</span><span>{catalog.websiteUrl}</span></div>}
            </div>
          </div>

          <div className="border-t border-slate-800 pt-4 flex justify-between items-center text-xs text-slate-500">
            <span>&copy; {new Date().getFullYear()} {brand.name}. Global Porcelain Export Catalogue.</span>
            <span>Platform: SeramikBak Global</span>
          </div>
        </section>
      )}
    </div>
  );
}
