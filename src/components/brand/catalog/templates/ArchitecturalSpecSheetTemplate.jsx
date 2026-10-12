'use client';

import React from 'react';

export default function ArchitecturalSpecSheetTemplate({ catalog, products = [], mode = 'preview' }) {
  const brand = catalog.brand || {};
  const logo = catalog.customLogoUrl || brand.logoUrl;
  const primaryColor = catalog.primaryColor || '#0f172a';
  const isLandscape = catalog.orientation === 'landscape';

  const isTR = catalog.language !== 'en';
  const t = {
    docType: isTR ? 'MİMARİ TEKNİK FÖY & ŞARTNAME DOSYASI' : 'ARCHITECTURAL TECHNICAL SPECIFICATION SHEET',
    stdHeader: isTR ? 'STANDART UYGUNLUK: TS EN 14411 (ISO 13006)' : 'STANDARD COMPLIANCE: TS EN 14411 (ISO 13006)',
    itemCode: isTR ? 'Poz / Ürün Kodu' : 'Product / Spec Code',
    dimensions: isTR ? 'Anma Ebatları' : 'Nominal Dimensions',
    thickness: isTR ? 'Kalınlık' : 'Thickness',
    surface: isTR ? 'Yüzey İşlemi' : 'Surface Finish',
    rectified: isTR ? 'Kenar Tipi' : 'Edge Finishing',
    slipResistance: isTR ? 'Kayma Direnci' : 'Slip Resistance',
    wearResistance: isTR ? 'Aşınma Dayanımı' : 'Wear Resistance',
    boxPacking: isTR ? 'Kutu İçi m² / Adet' : 'Box m² / Pcs',
    palletPacking: isTR ? 'Palet m² / Kutu' : 'Pallet m² / Boxes',
    waterAbsorption: isTR ? 'Su Emme Oranı' : 'Water Absorption',
    frostResistance: isTR ? 'Dona Dayanım' : 'Frost Resistance',
    try3D: isTR ? '3D BIM & Mekânda Gör' : '3D BIM & Try In Room',
    scanCTA: isTR ? 'SeramikBak 3D Studio ile mimari mekânda test edin.' : 'Simulate in room using SeramikBak 3D Studio.',
    summaryTable: isTR ? 'TEKNİK ÖZELLİKLER VE PAKETLEME ÖZETİ' : 'TECHNICAL SPECS & PACKAGING SUMMARY',
    page: isTR ? 'Sayfa' : 'Page',
  };

  return (
    <div className={`catalog-spec-sheet font-sans ${isLandscape ? 'orientation-landscape' : 'orientation-portrait'}`}>
      {/* -------------------- COVER PAGE (ARCHITECTURAL BLUEPRINT STYLE) -------------------- */}
      {catalog.showCover && (
        <section className="catalog-page cover-page flex flex-col justify-between p-12 bg-slate-900 text-slate-100 relative">
          <div className="border border-slate-700/80 p-8 h-full flex flex-col justify-between relative bg-slate-900/90">
            {/* Corner CAD Registration Marks */}
            <div className="absolute top-2 left-2 text-[10px] font-mono text-slate-500">+ 0,0</div>
            <div className="absolute top-2 right-2 text-[10px] font-mono text-slate-500">SPEC-REV.01 +</div>
            <div className="absolute bottom-2 left-2 text-[10px] font-mono text-slate-500">+ ISO 9001</div>
            <div className="absolute bottom-2 right-2 text-[10px] font-mono text-slate-500">TS EN 14411 +</div>

            {/* Header */}
            <div className="border-b border-slate-700 pb-6 flex items-center justify-between">
              <div>
                {logo ? (
                  <img src={logo} alt={brand.name} className="h-10 max-w-[180px] object-contain filter brightness-0 invert" />
                ) : (
                  <span className="text-2xl font-mono font-bold tracking-wider">{brand.name || 'SERAMİK'}</span>
                )}
                <p className="text-xs text-slate-400 font-mono mt-1">{t.docType}</p>
              </div>
              <div className="text-right text-xs font-mono text-slate-400">
                <p className="font-semibold text-slate-200">{catalog.pageSize.toUpperCase()} ARCH-SPEC</p>
                <p>{new Date().toLocaleDateString(isTR ? 'tr-TR' : 'en-US')}</p>
              </div>
            </div>

            {/* Central Title */}
            <div className="my-auto py-12 max-w-3xl">
              <div className="inline-block px-3 py-1 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded text-xs font-mono tracking-widest uppercase mb-4">
                {t.stdHeader}
              </div>
              <h1 className="text-4xl md:text-5xl font-mono font-bold text-white tracking-tight leading-tight mb-4">
                {catalog.coverTitle || catalog.title}
              </h1>
              {catalog.coverSubtitle && (
                <p className="text-lg text-slate-300 font-normal leading-relaxed mb-6 font-sans">
                  {catalog.coverSubtitle}
                </p>
              )}
              {catalog.introText && (
                <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-lg text-xs font-mono text-slate-300 leading-relaxed">
                  {catalog.introText}
                </div>
              )}
            </div>

            {/* Project / Brand Footer */}
            <div className="border-t border-slate-700 pt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono text-slate-400">
              <div>
                <p className="text-[10px] text-slate-500 uppercase">ÜRETİCİ / MARKA</p>
                <p className="text-slate-200 font-medium">{brand.name}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase">DOKÜMAN FORMATI</p>
                <p className="text-slate-200 font-medium">BIM & Spec Sheet</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase">İÇERİK SAYISI</p>
                <p className="text-slate-200 font-medium">{products.length} Mimari Ürün</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase">DOĞRULAMA</p>
                <p className="text-slate-200 font-medium">SeramikBak Digital</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* -------------------- TECHNICAL SUMMARY MATRIX TABLE -------------------- */}
      {catalog.showTOC && products.length > 0 && (
        <section className="catalog-page p-10 bg-white text-slate-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3 mb-6">
              <div>
                <h2 className="text-xl font-bold font-mono tracking-tight text-slate-900">{t.summaryTable}</h2>
                <p className="text-xs text-slate-500">{brand.name} &bull; {catalog.title}</p>
              </div>
              <span className="text-xs font-mono bg-slate-100 text-slate-800 px-2.5 py-1 rounded border border-slate-200">
                TS EN 14411 Ek-G
              </span>
            </div>

            <div className="overflow-x-auto border border-slate-300 rounded-lg">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-mono text-[11px] uppercase border-b border-slate-300">
                    <th className="p-2.5 border-r border-slate-300">#</th>
                    <th className="p-2.5 border-r border-slate-300">{t.itemCode}</th>
                    <th className="p-2.5 border-r border-slate-300">Ürün Adı</th>
                    <th className="p-2.5 border-r border-slate-300">{t.dimensions}</th>
                    <th className="p-2.5 border-r border-slate-300">{t.thickness}</th>
                    <th className="p-2.5 border-r border-slate-300">{t.surface}</th>
                    <th className="p-2.5 border-r border-slate-300">Kaymazlık</th>
                    <th className="p-2.5 border-r border-slate-300">Aşınma</th>
                    <th className="p-2.5">Rektifiye</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono text-slate-800">
                  {products.map((p, idx) => (
                    <tr key={p.id || idx} className="hover:bg-slate-50">
                      <td className="p-2.5 border-r border-slate-200 font-semibold">{(idx + 1).toString().padStart(2, '0')}</td>
                      <td className="p-2.5 border-r border-slate-200 text-blue-600 font-bold">{p.code || `SB-${idx+101}`}</td>
                      <td className="p-2.5 border-r border-slate-200 font-sans font-medium">{p.name}</td>
                      <td className="p-2.5 border-r border-slate-200">{p.width && p.height ? `${p.width}x${p.height} cm` : '-'}</td>
                      <td className="p-2.5 border-r border-slate-200">{p.thickness ? `${p.thickness} mm` : '9 mm'}</td>
                      <td className="p-2.5 border-r border-slate-200 font-sans">{p.finish || 'Mat'}</td>
                      <td className="p-2.5 border-r border-slate-200">{p.slipResistance || 'R10'}</td>
                      <td className="p-2.5 border-r border-slate-200">{p.peiRating ? `PEI ${p.peiRating}` : 'PEI 4'}</td>
                      <td className="p-2.5 font-sans">{p.rectified ? 'Lazer Rektifiye' : 'Standart'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-md text-[11px] text-slate-600 font-mono">
              <span className="font-bold text-slate-800">Not:</span> Tüm porselen karolar su emme oranı E &le; %0,5 normlarına uygun üretilmekte olup dış cephe, ıslak zemin ve yoğun yaya trafiğine tam mukavimdir.
            </div>
          </div>

          <div className="border-t border-slate-200 pt-3 flex justify-between items-center text-xs text-slate-500 font-mono">
            <span>{brand.name} Mimari Teknik Şartname Tablosu</span>
            {catalog.showPageNumbers && <span>{t.page} 02</span>}
          </div>
        </section>
      )}

      {/* -------------------- PRODUCT SPECIFICATION SHEETS -------------------- */}
      {products.map((p, index) => {
        const pageNum = (catalog.showCover ? 1 : 0) + (catalog.showTOC ? 1 : 0) + index + 1;
        const mainImage = p.imageUrl || p.textureUrl || '/placeholder.png';
        const dimensions = p.width && p.height ? `${p.width} × ${p.height} cm` : 'Belirtilmemiş';

        return (
          <section key={p.id || index} className="catalog-page p-10 bg-white text-slate-900 flex flex-col justify-between">
            {/* Header Bar */}
            <div className="border-b-2 border-slate-900 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {logo ? (
                  <img src={logo} alt={brand.name} className="h-6 max-w-[120px] object-contain" />
                ) : (
                  <span className="font-bold font-mono text-sm tracking-wide">{brand.name}</span>
                )}
                <span className="text-slate-300">|</span>
                <span className="text-xs font-mono text-slate-600 uppercase">{t.docType}</span>
              </div>
              <div className="text-xs font-mono text-slate-500">
                POZ KODU: <span className="font-bold text-slate-900">{p.code || `SB-${index+101}`}</span>
              </div>
            </div>

            {/* Spec Body */}
            <div className="my-auto py-4 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              {/* Product Visual & Texture Swatches */}
              <div className="md:col-span-6 space-y-4">
                <div className="border border-slate-300 rounded-lg overflow-hidden bg-slate-50 aspect-[4/3] flex items-center justify-center relative">
                  <img src={mainImage} alt={p.name} className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 bg-slate-900/90 text-white font-mono text-[11px] px-2.5 py-1 rounded">
                    ÖLÇÜ: {dimensions}
                  </div>
                </div>

                {p.textureUrl && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <img src={p.textureUrl} alt="Texture" className="w-14 h-14 rounded border border-slate-300 object-cover" />
                    <div className="text-xs font-mono">
                      <p className="font-bold text-slate-800">1:1 Yüzey Dokusu</p>
                      <p className="text-slate-500 font-sans text-[11px]">BIM / 3D Render ve pafta için doku haritası hazır.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Technical Specifications Blueprint Table */}
              <div className="md:col-span-6 flex flex-col justify-between h-full">
                <div>
                  <h3 className="text-2xl font-bold font-mono text-slate-900 mb-1">{p.name}</h3>
                  <p className="text-xs font-mono text-slate-500 mb-4">
                    Kategori: {p.style || 'Mimari Porselen'} &bull; Renk: {p.color || 'Doğal'}
                  </p>

                  {p.customNote && (
                    <div className="p-3 mb-4 bg-blue-50 border-l-4 border-blue-600 text-xs text-blue-900">
                      <span className="font-bold">Mimari Uygulama Notu:</span> {p.customNote}
                    </div>
                  )}

                  {/* Dense Specification Matrix */}
                  <div className="border border-slate-300 rounded-lg overflow-hidden text-xs font-mono">
                    <div className="bg-slate-100 px-3 py-1.5 font-bold text-slate-800 border-b border-slate-300 flex justify-between">
                      <span>TEKNİK PARAMETRELER</span>
                      <span className="text-[10px] text-slate-500">TS EN 14411</span>
                    </div>
                    <div className="divide-y divide-slate-200">
                      <div className="grid grid-cols-2 p-2">
                        <span className="text-slate-500">{t.dimensions}:</span>
                        <span className="font-semibold text-slate-800">{dimensions}</span>
                      </div>
                      <div className="grid grid-cols-2 p-2 bg-slate-50/50">
                        <span className="text-slate-500">{t.thickness}:</span>
                        <span className="font-semibold text-slate-800">{p.thickness ? `${p.thickness} mm` : '9 - 10 mm'}</span>
                      </div>
                      <div className="grid grid-cols-2 p-2">
                        <span className="text-slate-500">{t.surface}:</span>
                        <span className="font-semibold text-slate-800 font-sans">{p.finish || 'Mat R10'}</span>
                      </div>
                      <div className="grid grid-cols-2 p-2 bg-slate-50/50">
                        <span className="text-slate-500">{t.rectified}:</span>
                        <span className="font-semibold text-slate-800 font-sans">{p.rectified ? 'Lazer Rektifiye (Derzsiz)' : 'Standart'}</span>
                      </div>
                      <div className="grid grid-cols-2 p-2">
                        <span className="text-slate-500">{t.slipResistance}:</span>
                        <span className="font-semibold text-slate-800">{p.slipResistance || 'R10 Sınıfı'}</span>
                      </div>
                      <div className="grid grid-cols-2 p-2 bg-slate-50/50">
                        <span className="text-slate-500">{t.wearResistance}:</span>
                        <span className="font-semibold text-slate-800">PEI {p.peiRating || '4'} (Yoğun Trafik)</span>
                      </div>
                      <div className="grid grid-cols-2 p-2">
                        <span className="text-slate-500">{t.waterAbsorption}:</span>
                        <span className="font-semibold text-slate-800">&le; 0.1% (Grup BIa Porselen)</span>
                      </div>
                      <div className="grid grid-cols-2 p-2 bg-slate-50/50">
                        <span className="text-slate-500">{t.frostResistance}:</span>
                        <span className="font-semibold text-slate-800 text-green-700">Tam Mukavim (Donmaz)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* BIM / 3D QR Code Card */}
                {catalog.showQrCodes && p.qrCodeUrl && (
                  <div className="mt-4 p-3 border border-slate-300 rounded-lg bg-slate-50 flex items-center gap-3">
                    <img src={p.qrCodeUrl} alt="QR Code" className="w-16 h-16 bg-white p-1 border border-slate-300 rounded" />
                    <div className="flex-1 text-xs font-mono">
                      <p className="font-bold text-slate-900">{t.try3D}</p>
                      <p className="text-slate-600 text-[11px] font-sans">{t.scanCTA}</p>
                      <a href={p.productUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-[11px] block mt-1">
                        seramikbak.com/urun/{p.slug}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Spec Sheet Footer */}
            <div className="border-t border-slate-300 pt-3 flex justify-between items-center text-xs font-mono text-slate-500">
              <span>{brand.name} &bull; Poz: {p.code || `SB-${index+101}`}</span>
              {catalog.showPageNumbers && <span>{t.page} {pageNum.toString().padStart(2, '0')}</span>}
            </div>
          </section>
        );
      })}

      {/* -------------------- CONTACT & SPEC SIGN-OFF PAGE -------------------- */}
      {catalog.showContactPage && (
        <section className="catalog-page p-10 bg-slate-900 text-white flex flex-col justify-between font-mono">
          <div className="border-b border-slate-700 pb-4 flex items-center justify-between">
            <span className="text-lg font-bold">{brand.name} PROJE & ŞARTNAME DEPARTMANI</span>
            <span className="text-xs text-slate-400">ARCH-SPEC V1.0</span>
          </div>

          <div className="my-auto py-8 max-w-xl">
            <h4 className="text-2xl font-bold mb-4 text-white">Teknik Destek ve Numune İstemi</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-sans mb-6">
              Yukarıda yer alan ürünlerin mimari pafta CAD/BIM doku kütüphaneleri, laboratuvar test raporları ve yerinde numune sunumu için proje ofisimizle irtibat kurabilirsiniz.
            </p>

            <div className="space-y-3 text-xs bg-slate-800 p-4 rounded-lg border border-slate-700">
              <div className="flex"><span className="w-24 text-slate-400">Marka:</span><span>{brand.name}</span></div>
              {catalog.contactAddress && <div className="flex"><span className="w-24 text-slate-400">Adres:</span><span>{catalog.contactAddress}</span></div>}
              {catalog.contactPhone && <div className="flex"><span className="w-24 text-slate-400">Santral:</span><span>{catalog.contactPhone}</span></div>}
              {catalog.contactEmail && <div className="flex"><span className="w-24 text-slate-400">E-Posta:</span><span>{catalog.contactEmail}</span></div>}
              {catalog.websiteUrl && <div className="flex"><span className="w-24 text-slate-400">Web:</span><span>{catalog.websiteUrl}</span></div>}
            </div>
          </div>

          <div className="border-t border-slate-700 pt-4 flex justify-between items-center text-xs text-slate-500">
            <span>&copy; {new Date().getFullYear()} {brand.name}. TS EN 14411 Teknik Şartname Dosyası.</span>
            <span>Platform: SeramikBak Stüdyo</span>
          </div>
        </section>
      )}
    </div>
  );
}
