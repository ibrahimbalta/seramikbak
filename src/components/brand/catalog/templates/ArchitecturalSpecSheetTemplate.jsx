'use client';

import React from 'react';
import { Layers, QrCode, ExternalLink, ShieldCheck, Ruler, CheckCircle2 } from 'lucide-react';

export default function ArchitecturalSpecSheetTemplate({
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
      return (
        <section
          key="cover"
          className="catalog-page p-8 sm:p-12 text-slate-100 flex flex-col justify-between"
          style={{ backgroundColor: '#0f172a' }}
        >
          <div className="border border-slate-700/80 p-6 sm:p-10 h-full flex flex-col justify-between relative bg-slate-900/90 rounded-lg">
            <div className="absolute top-3 left-3 text-[10px] font-mono text-slate-500">+ 0,0 REF</div>
            <div className="absolute top-3 right-3 text-[10px] font-mono text-slate-500">TS EN 14411 +</div>

            <div className="border-b border-slate-700 pb-5 flex items-center justify-between">
              <div>
                <span className="text-2xl font-mono font-bold tracking-wider uppercase text-white">
                  {brand.name || 'SERAMİK'}
                </span>
                <p className="text-xs text-blue-400 font-mono mt-0.5">
                  MİMARİ TEKNİK FÖY & ŞARTNAME DOSYASI
                </p>
              </div>
              <div className="text-right text-xs font-mono text-slate-400">
                <span className="px-2.5 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded text-[11px] font-bold">
                  BIM & CAD SPEC
                </span>
              </div>
            </div>

            <div className="my-auto py-8 max-w-2xl">
              <span className="text-[11px] font-mono font-bold px-3 py-1 bg-blue-600/20 text-blue-300 rounded border border-blue-500/30 uppercase tracking-wider inline-block mb-4">
                STANDART: TS EN 14411 (ISO 13006) GRUP BIA
              </span>
              <h1 className="text-3xl sm:text-5xl font-mono font-bold text-white tracking-tight leading-tight mb-4">
                {catalog.coverTitle || catalog.title}
              </h1>
              {catalog.coverSubtitle && (
                <p className="text-base text-slate-300 font-sans leading-relaxed mb-4">
                  {catalog.coverSubtitle}
                </p>
              )}
              {catalog.introText && (
                <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-lg text-xs font-mono text-slate-300 leading-relaxed">
                  {catalog.introText}
                </div>
              )}
            </div>

            <div className="border-t border-slate-700 pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono text-slate-400">
              <div><p className="text-[10px] text-slate-500">ÜRETİCİ</p><p className="text-white font-bold">{brand.name}</p></div>
              <div><p className="text-[10px] text-slate-500">FORMAT</p><p className="text-white font-bold">A4 Şartname</p></div>
              <div><p className="text-[10px] text-slate-500">ÜRÜN ADEDİ</p><p className="text-white font-bold">{products.length} Poz</p></div>
              <div><p className="text-[10px] text-slate-500">TARİH</p><p className="text-white font-bold">{new Date().getFullYear()}</p></div>
            </div>
          </div>
        </section>
      );
    }

    if (pageObj.type === 'toc') {
      return (
        <section key="toc" className="catalog-page p-8 sm:p-10 bg-white text-slate-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3 mb-6">
              <div>
                <h2 className="text-xl font-bold font-mono tracking-tight text-slate-900">
                  TEKNİK ÖZELLİKLER & POZ LİSTESİ
                </h2>
                <p className="text-xs text-slate-500 font-sans">{brand.name} Mimari Şartname Matrisi</p>
              </div>
              <span className="text-xs font-mono bg-slate-100 text-slate-800 px-3 py-1 rounded border border-slate-200">
                TS EN 14411 Ek-G
              </span>
            </div>

            <div className="overflow-x-auto border border-slate-300 rounded-lg">
              <table className="w-full text-xs text-left border-collapse font-mono">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 text-[11px] uppercase border-b border-slate-300">
                    <th className="p-2 border-r border-slate-300">#</th>
                    <th className="p-2 border-r border-slate-300">Poz Kodu</th>
                    <th className="p-2 border-r border-slate-300">Ürün Adı</th>
                    <th className="p-2 border-r border-slate-300">Ebat (cm)</th>
                    <th className="p-2 border-r border-slate-300">Yüzey</th>
                    <th className="p-2 border-r border-slate-300">Kaymazlık</th>
                    <th className="p-2">Aşınma</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {products.map((p, idx) => (
                    <tr key={p.id || idx} className="hover:bg-slate-50">
                      <td className="p-2 border-r border-slate-200 font-bold">{(idx + 1).toString().padStart(2, '0')}</td>
                      <td className="p-2 border-r border-slate-200 text-blue-700 font-bold">{p.code || `SB-${idx + 101}`}</td>
                      <td className="p-2 border-r border-slate-200 font-sans font-medium">{p.name}</td>
                      <td className="p-2 border-r border-slate-200">{p.width}x{p.height}</td>
                      <td className="p-2 border-r border-slate-200 font-sans">{p.finish || 'Mat'}</td>
                      <td className="p-2 border-r border-slate-200">{p.slipResistance || 'R10'}</td>
                      <td className="p-2 font-bold">{p.peiRating ? `PEI ${p.peiRating}` : 'PEI 4'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-3 flex justify-between text-xs text-slate-500 font-mono">
            <span>{brand.name} Teknik Şartname Dosyası</span>
            <span>Sayfa 02</span>
          </div>
        </section>
      );
    }

    if (pageObj.type === 'product') {
      const p = pageObj.product;
      const index = pageObj.index;
      const pImage = p.imageUrl || p.textureUrl || '/renders/luxury_bathroom_calacatta_gold.jpg';
      const dimensions = p.width && p.height ? `${p.width} × ${p.height} cm` : 'Standart';

      return (
        <section key={p.id || index} className="catalog-page p-6 sm:p-10 bg-white text-slate-900 flex flex-col justify-between">
          <div className="border-b-2 border-slate-900 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-bold font-mono text-sm tracking-wide">{brand.name}</span>
              <span className="text-slate-300">|</span>
              <span className="text-xs font-mono text-slate-600 uppercase">MİMARİ TEKNİK FÖY</span>
            </div>
            <div className="text-xs font-mono text-blue-700 font-bold bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
              POZ: {p.code || `SB-${index + 101}`}
            </div>
          </div>

          <div className="my-auto py-4 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-6 space-y-3">
              <div className="border border-slate-300 rounded-xl overflow-hidden aspect-[4/3] bg-slate-50 relative flex items-center justify-center shadow-sm">
                <img src={pImage} alt={p.name} className="w-full h-full object-cover" />
                <div className="absolute top-2.5 left-2.5 bg-slate-900/90 text-white font-mono text-xs px-2.5 py-1 rounded">
                  ÖLÇÜ: {dimensions}
                </div>
              </div>

              {p.textureUrl && (
                <div className="flex items-center gap-3 p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <img src={p.textureUrl} alt="Texture" className="w-12 h-12 rounded object-cover border border-slate-300" />
                  <div className="text-xs font-mono">
                    <p className="font-bold text-slate-800">1:1 Yüzey Dokusu</p>
                    <p className="text-slate-500 text-[11px]">BIM ve 3D Render uyumlu dijital doku</p>
                  </div>
                </div>
              )}
            </div>

            <div className="md:col-span-6 flex flex-col justify-between h-full">
              <div>
                <h3 className="text-2xl font-bold font-mono text-slate-900 mb-1">{p.name}</h3>
                <p className="text-xs font-mono text-slate-500 mb-4">
                  Kategori: {p.style || 'Mimari Porselen'} &bull; Renk: {p.color || 'Doğal'}
                </p>

                <div className="border border-slate-300 rounded-lg overflow-hidden text-xs font-mono mb-4">
                  <div className="bg-slate-100 px-3 py-1.5 font-bold text-slate-800 border-b border-slate-300 flex justify-between">
                    <span>PARAMETRELER</span>
                    <span className="text-[10px] text-slate-500">TS EN 14411</span>
                  </div>
                  <div className="divide-y divide-slate-200">
                    <div className="flex justify-between p-2"><span>Ebat:</span><span className="font-bold">{dimensions}</span></div>
                    <div className="flex justify-between p-2 bg-slate-50/50"><span>Kalınlık:</span><span className="font-bold">{p.thickness ? `${p.thickness} mm` : '9 mm'}</span></div>
                    <div className="flex justify-between p-2"><span>Yüzey:</span><span className="font-bold font-sans">{p.finish || 'Mat R10'}</span></div>
                    <div className="flex justify-between p-2 bg-slate-50/50"><span>Kaymazlık:</span><span className="font-bold">{p.slipResistance || 'R10 Sınıfı'}</span></div>
                    <div className="flex justify-between p-2"><span>Aşınma:</span><span className="font-bold">PEI {p.peiRating || '4'}</span></div>
                    <div className="flex justify-between p-2 bg-slate-50/50"><span>Su Emme:</span><span className="font-bold text-blue-700">&le; 0.1% (Grup BIa)</span></div>
                  </div>
                </div>
              </div>

              {catalog.showQrCodes && (
                <div className="p-3 border border-slate-300 rounded-lg bg-slate-50 flex items-center gap-3">
                  <img src={p.qrCodeUrl || '/favicon.ico'} alt="QR" className="w-14 h-14 bg-white p-1 border border-slate-300 rounded" />
                  <div className="text-xs font-mono flex-1">
                    <p className="font-bold text-slate-900">3D Mekânda Test Et</p>
                    <p className="text-slate-600 text-[11px] font-sans">Kameranızla okutun, SeramikBak 3D Studio ile test edin.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-slate-300 pt-3 flex justify-between items-center text-xs font-mono text-slate-500">
            <span>{brand.name} &bull; Poz: {p.code || `SB-${index + 101}`}</span>
            <span>Sayfa {(pageIndex + 1).toString().padStart(2, '0')}</span>
          </div>
        </section>
      );
    }

    if (pageObj.type === 'contact') {
      return (
        <section key="contact" className="catalog-page p-8 sm:p-12 text-white flex flex-col justify-between font-mono" style={{ backgroundColor: '#0f172a' }}>
          <div className="border-b border-slate-700 pb-4 flex justify-between">
            <span className="text-lg font-bold">{brand.name} TEKNİK ŞARTNAME & PROJE</span>
            <span className="text-xs text-slate-400">ARCH-SPEC V2.0</span>
          </div>
          <div className="my-auto py-8 max-w-xl">
            <h4 className="text-2xl font-bold mb-3">Teknik Destek & Numune Sevkiyatı</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-sans mb-6">
              Yukarıda yer alan ürünlerin mimari pafta CAD/BIM doku kütüphaneleri, test raporları ve yerinde numune sunumu için proje ofisimizle irtibat kurabilirsiniz.
            </p>
            <div className="space-y-2 text-xs bg-slate-800 p-4 rounded-lg border border-slate-700 text-slate-300">
              <div><strong className="text-white">Santral:</strong> {catalog.contactPhone || '+90 (212) 000 00 00'}</div>
              <div><strong className="text-white">E-Posta:</strong> {catalog.contactEmail || 'proje@seramikbak.com'}</div>
              <div><strong className="text-white">Web:</strong> {catalog.websiteUrl || 'www.seramikbak.com'}</div>
            </div>
          </div>
          <div className="border-t border-slate-700 pt-4 text-xs text-slate-500 flex justify-between">
            <span>&copy; {new Date().getFullYear()} {brand.name}. TS EN 14411 Teknik Şartname Dosyası.</span>
            <span>SeramikBak Mimari Sistemler</span>
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
