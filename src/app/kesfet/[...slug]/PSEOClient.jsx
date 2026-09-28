'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Sparkles, Layers, Box, CheckCircle2, ChevronRight, ShieldCheck, 
  MapPin, HelpCircle, ArrowRight, Eye, Phone, RefreshCw, 
  FileText, Award, Hammer, Compass
} from 'lucide-react';
import { calculateTileRequirements } from '@/lib/seo/guideContentEngine';
import { generateImageAltText } from '@/lib/seo/imageSeo';

export default function PSEOClient({
  matrix,
  products = [],
  dealers = [],
  internalLinks,
  comparisonTables,
  expertQuotes = [],
  technicalGuides,
  faqs = []
}) {
  const [calcArea, setCalcArea] = useState(45);
  const [isDiagonal, setIsDiagonal] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const calcResult = calculateTileRequirements(calcArea, isDiagonal);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-amber-500 selection:text-slate-950">
      {/* Top Breadcrumb Bar */}
      <div className="border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-2 overflow-x-auto whitespace-nowrap">
            <Link href="/" className="hover:text-amber-400 transition-colors">Anasayfa</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            <Link href="/kategori/banyo-seramikleri" className="hover:text-amber-400 transition-colors">Keşfet</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            <span className="text-amber-400 font-medium truncate max-w-xs">{matrix.mainTitle}</span>
          </div>
          <div className="hidden sm:flex items-center space-x-3 text-emerald-400 font-medium">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Yetkili Fabrika & Bayi Ağı Doğrulandı</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 border-b border-slate-800/60 bg-radial from-slate-900 via-slate-950 to-slate-950">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b0a_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0a_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>2026 Programmatic SEO Koleksiyonu • {products.length}+ Aktif Model</span>
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            {matrix.mainTitle}
          </h1>

          <p className="text-base md:text-lg text-slate-300 max-w-3xl leading-relaxed mb-8">
            {matrix.metaDescription}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/ilham"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all text-sm"
            >
              <Eye className="w-4 h-4" />
              <span>3D Sanal Stüdyo ile Canlı Dene</span>
            </Link>
            <a
              href="#calculator"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-white font-semibold transition-all text-sm"
            >
              <Layers className="w-4 h-4 text-amber-400" />
              <span>m² & Maliyet Hesaplayıcı</span>
            </a>
            <a
              href="#guide"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 text-slate-300 hover:text-white transition-all text-sm"
            >
              <FileText className="w-4 h-4 text-sky-400" />
              <span>Teknik Uzman Rehberi</span>
            </a>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-12 space-y-20">
        {/* Products Grid */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Box className="w-6 h-6 text-amber-400" />
                <span>Öne Çıkan {matrix.mainTitle} Modelleri</span>
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Yetkili distribütörlerden güncel liste, 3D uyumlu dokular ve numune talep edilebilir ürünler.
              </p>
            </div>
            <span className="text-xs bg-slate-800 px-3 py-1.5 rounded-lg text-slate-300 border border-slate-700">
              {products.length} Sonuç
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((p) => {
              const dimensions = `${p.width}x${p.height} cm`;
              const altText = generateImageAltText(p, matrix.brand?.name);

              return (
                <div 
                  key={p.id}
                  className="group rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-amber-500/50 transition-all duration-300 overflow-hidden flex flex-col hover:shadow-xl hover:shadow-amber-500/5"
                >
                  <div className="relative aspect-4/3 bg-slate-950 overflow-hidden">
                    <img
                      src={p.imageUrl || '/og-image.png'}
                      alt={altText}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <span className="px-2 py-1 rounded-md bg-slate-950/80 backdrop-blur-md text-[11px] font-semibold text-amber-400 border border-amber-500/20">
                        {dimensions}
                      </span>
                      {p.rectified && (
                        <span className="px-2 py-1 rounded-md bg-emerald-950/80 backdrop-blur-md text-[11px] font-semibold text-emerald-400 border border-emerald-500/20">
                          Rektifiye
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="text-xs text-amber-400/90 font-medium mb-1">
                        {p.brand?.name || matrix.brand?.name || 'Seramik'}
                      </div>
                      <h3 className="font-bold text-white text-base group-hover:text-amber-300 transition-colors line-clamp-1">
                        {p.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                        <span>{p.finish || 'Mat'}</span>
                        <span>•</span>
                        <span>{p.style || 'Doğal'}</span>
                        <span>•</span>
                        <span>{p.color}</span>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <Link
                        href={`/urun/${p.slug || p.id}`}
                        className="flex-1 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold text-center transition-colors"
                      >
                        İncele & Numune Al
                      </Link>
                      <Link
                        href={`/ilham?product=${p.id}`}
                        title="3D Mekan Giydirme"
                        className="p-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Interactive Material & Cost Calculator */}
        <section id="calculator" className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-6 md:p-10 shadow-2xl">
          <div className="max-w-3xl mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 text-xs font-semibold mb-3">
              <Compass className="w-3.5 h-3.5" />
              <span>Hatasız Metraj Standardı</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">
              {matrix.mainTitle} İçin Sarfiyat & Maliyet Hesaplayıcı
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Döşenecek net alanı girin; TS EN standartlarına göre kutu adedi, fire payı (%10-%15), esnek yapıştırıcı, derz dolgusu ve tahmini usta işçilik maliyetini anında hesaplayın.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-6 bg-slate-950/60 p-6 rounded-2xl border border-slate-800">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Döşenecek Net Alan (m²):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    value={calcArea}
                    onChange={(e) => setCalcArea(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white text-lg font-bold focus:outline-none focus:border-amber-400 transition-colors"
                  />
                  <span className="absolute right-4 top-3.5 text-slate-500 font-bold">m²</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-xs text-slate-300 font-medium">Döşeme Şekli</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsDiagonal(false)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      !isDiagonal ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Düz (%10 Fire)
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDiagonal(true)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      isDiagonal ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Çapraz (%15 Fire)
                  </button>
                </div>
              </div>

              <div className="text-xs text-slate-400 bg-amber-500/5 p-3 rounded-xl border border-amber-500/10">
                <span className="font-semibold text-amber-400">Mimar Önerisi:</span> Kırılma ve ilerideki olası tadilatlar için en az 1 tam kutu seramiğin yedek olarak saklanması önerilir.
              </div>
            </div>

            {calcResult && (
              <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
                  <div className="text-xs text-slate-400 mb-1">Gereken Brüt Metraj</div>
                  <div className="text-2xl font-black text-amber-400">{calcResult.grossAreaM2} m²</div>
                  <div className="text-[11px] text-slate-500 mt-1">%{calcResult.wastePercentage} fire dahil</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
                  <div className="text-xs text-slate-400 mb-1">Sipariş Edilecek Kutu</div>
                  <div className="text-2xl font-black text-white">{calcResult.boxCount60x120} Kutu</div>
                  <div className="text-[11px] text-slate-500 mt-1">1.44 m² / kutu baz alınmıştır</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
                  <div className="text-xs text-slate-400 mb-1">C2TE S1 Yapıştırıcı</div>
                  <div className="text-2xl font-black text-white">{calcResult.adhesiveBags25Kg} Torba</div>
                  <div className="text-[11px] text-slate-500 mt-1">~{calcResult.totalAdhesiveKg} kg esnek harç</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
                  <div className="text-xs text-slate-400 mb-1">Silikonlu Derz Dolgusu</div>
                  <div className="text-2xl font-black text-white">{calcResult.groutBuckets5Kg} Kova</div>
                  <div className="text-[11px] text-slate-500 mt-1">~{calcResult.totalGroutKg} kg antibakteriyel</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
                  <div className="text-xs text-slate-400 mb-1">Tesviye Takozu / Klips</div>
                  <div className="text-2xl font-black text-white">{calcResult.levelingClips} Adet</div>
                  <div className="text-[11px] text-slate-500 mt-1">Sıfır diş / düz ayak</div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30">
                  <div className="text-xs text-emerald-400 font-semibold mb-1">Tahmini Usta İşçiliği</div>
                  <div className="text-2xl font-black text-emerald-300">
                    ₺{calcResult.estimatedLaborCost.toLocaleString('tr-TR')}
                  </div>
                  <div className="text-[11px] text-emerald-500 mt-1">Ort. 300 ₺/m² işçilik</div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* GEO Fact Block: Comparison Matrices */}
        <section className="space-y-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-semibold mb-3">
              <Award className="w-3.5 h-3.5" />
              <span>Teknik Karşılaştırma Matrisi (ISO 10545 Standartları)</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">
              Seramik, Porselen ve Granit Arasındaki Farklar Nelerdir?
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Doğru malzeme seçimi için mühendislik kıyaslama verileri.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
            <table className="w-full text-left text-xs md:text-sm">
              <thead className="bg-slate-950/80 text-amber-400 border-b border-slate-800 uppercase tracking-wider text-[11px]">
                <tr>
                  {comparisonTables.materialComparison.headers.map((h, i) => (
                    <th key={i} className="p-4 font-bold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {comparisonTables.materialComparison.rows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-800/30 transition-colors">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className={`p-4 ${cIdx === 0 ? 'font-semibold text-white' : ''}`}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Expert Quotes */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {expertQuotes.map((eq, idx) => (
            <div key={idx} className="p-6 md:p-8 rounded-2xl bg-slate-900/60 border border-slate-800 relative">
              <span className="text-4xl text-amber-500/30 font-serif absolute top-4 right-6">“</span>
              <p className="text-sm md:text-base text-slate-300 italic leading-relaxed mb-6">
                {eq.quote}
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-amber-700 flex items-center justify-center font-bold text-slate-950 text-sm">
                  {eq.author.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{eq.author}</h4>
                  <p className="text-xs text-amber-400">{eq.title}</p>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Comprehensive Technical Guide */}
        <section id="guide" className="space-y-8">
          <div className="max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">
              {technicalGuides.installation.title}
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Büyük ebat porselen seramik döşemesinde dikkat edilmesi gereken kritik uygulama protokolleri.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {technicalGuides.installation.rules.map((rule, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex gap-4">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-sm shrink-0 border border-amber-500/20">
                  {idx + 1}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white mb-2">{rule.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{rule.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Authorized Dealers (if present) */}
        {dealers.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-amber-400" />
                  <span>{matrix.city} Yetkili Showroomları ve Bayileri</span>
                </h2>
                <p className="text-sm text-slate-400">Doğrudan adres, telefon ve canlı stok durumu.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dealers.map(d => (
                <div key={d.id} className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-white text-base">{d.name}</h3>
                    <p className="text-xs text-slate-400 mt-1">{d.address} • {d.district}, {d.city}</p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
                    <a 
                      href={`tel:${d.phone}`} 
                      className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-semibold hover:underline"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{d.phone}</span>
                    </a>
                    <Link
                      href={`/bayi/${d.slug || d.id}`}
                      className="text-xs bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
                    >
                      Showroom İncele
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* FAQ Accordion */}
        {faqs.length > 0 && (
          <section className="max-w-4xl mx-auto space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                <HelpCircle className="w-6 h-6 text-amber-400" />
                <span>Sıkça Sorulan Sorular</span>
              </h2>
            </div>

            <div className="space-y-3">
              {faqs.map((f, idx) => (
                <div 
                  key={idx}
                  className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full text-left p-5 flex items-center justify-between gap-4 font-semibold text-white text-sm md:text-base hover:text-amber-400 transition-colors"
                  >
                    <span>{f.q}</span>
                    <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${openFaq === idx ? 'rotate-90 text-amber-400' : ''}`} />
                  </button>
                  {openFaq === idx && (
                    <div className="p-5 pt-0 text-sm text-slate-300 leading-relaxed border-t border-slate-800/40">
                      {f.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* AI Internal Linking Hub & Topic Cluster */}
        <section className="rounded-3xl border border-slate-800/80 bg-slate-950 p-8 space-y-8">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">İlgili Seramik & Karo Koleksiyonları</h3>
            <p className="text-xs text-slate-400">Topic Cluster ve semantik bağlantılı diğer seriler.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3">Popüler Ebatlar</h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {internalLinks.dimensionLinks.map((l, i) => (
                  <li key={i}>
                    <Link href={l.url} className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                      <ChevronRight className="w-3 h-3 text-slate-600" />
                      <span>{l.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3">Tasarım & Stiller</h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {internalLinks.styleLinks.map((l, i) => (
                  <li key={i}>
                    <Link href={l.url} className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                      <ChevronRight className="w-3 h-3 text-slate-600" />
                      <span>{l.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3">Kullanım Alanları</h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {internalLinks.areaLinks.map((l, i) => (
                  <li key={i}>
                    <Link href={l.url} className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                      <ChevronRight className="w-3 h-3 text-slate-600" />
                      <span>{l.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3">Yetkili Showroomlar</h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {internalLinks.localDealerLinks.map((l, i) => (
                  <li key={i}>
                    <Link href={l.url} className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                      <ChevronRight className="w-3 h-3 text-slate-600" />
                      <span>{l.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
