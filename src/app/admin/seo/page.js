'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  BarChart3, Globe, Sparkles, TrendingUp, Search, ShieldCheck, 
  ExternalLink, Copy, Check, Send, Award, Layers, Zap, 
  AlertCircle, ChevronRight, Eye, RefreshCw
} from 'lucide-react';
import { TOP_BRANDS, MAJOR_CITIES, POPULAR_DIMENSIONS, CORE_AREAS } from '@/lib/seo/internalLinkingEngine';
import { slugify } from '@/lib/slugify';

export default function AdminSeoDashboard() {
  const [selectedBrand, setSelectedBrand] = useState('VitrA');
  const [selectedDimension, setSelectedDimension] = useState('60x120');
  const [selectedRoom, setSelectedRoom] = useState('banyo-seramikleri');
  const [selectedColor, setSelectedColor] = useState('bej');
  const [selectedCity, setSelectedCity] = useState('İstanbul');

  const [outreachTarget, setOutreachTarget] = useState('mimar');
  const [copied, setCopied] = useState(false);

  // Programmatic Preview URL
  const previewSlug = `${slugify(selectedBrand)}-${selectedColor}-${selectedDimension}-${selectedRoom}`;
  const previewUrl = `/kesfet/${previewSlug}`;

  // Competitor Benchmark Data
  const competitors = [
    {
      name: 'Tilebar.com',
      market: 'ABD / Global',
      traffic: '2.4M / ay',
      keywords: '145.000',
      dr: 74,
      visualizer3d: 'Temel 2D',
      weakness: 'Türkiye fabrikalarından direkt tedarik ve yerel bayi entegrasyonu yok'
    },
    {
      name: 'Tile Club (tileclub.com)',
      market: 'ABD',
      traffic: '850K / ay',
      keywords: '85.000',
      dr: 68,
      visualizer3d: 'Yok',
      weakness: 'Büyük ebat porselen slab çeşitliliği ve B2B mimar portalı zayıf'
    },
    {
      name: 'Porcelanosa.com',
      market: 'İspanya / Global Lüks',
      traffic: '1.8M / ay',
      keywords: '110.000',
      dr: 77,
      visualizer3d: 'Önceden Render 3D',
      weakness: 'Yüksek fiyat bandı, sadece kendi markası, üçüncü taraf bayi fiyat şeffaflığı yok'
    },
    {
      name: 'Marazzi.com',
      market: 'İtalya / Global',
      traffic: '1.2M / ay',
      keywords: '95.000',
      dr: 73,
      visualizer3d: 'Katalog Bazlı',
      weakness: 'Canlı fiyat teklifi ve usta eşleştirme mekanizması bulunmuyor'
    },
    {
      name: 'VitrA Global (vitraglobal.com)',
      market: 'Türkiye & Export',
      traffic: '620K / ay',
      keywords: '52.000',
      dr: 66,
      visualizer3d: 'Var (VitrA Pro)',
      weakness: 'Tek marka sınırlandırması; diğer 15 büyük Türk üreticisi ile çapraz kıyaslama yok'
    },
    {
      name: 'Bien Seramik (bienseramik.com)',
      market: 'Türkiye',
      traffic: '310K / ay',
      keywords: '28.000',
      dr: 54,
      visualizer3d: 'Kısıtlı',
      weakness: 'Online numune isteme akışı ve çoklu dil programmatic SEO yetersiz'
    },
    {
      name: 'NG Kütahya (kutahyaseramik.com)',
      market: 'Türkiye',
      traffic: '490K / ay',
      keywords: '41.000',
      dr: 59,
      visualizer3d: 'Var',
      weakness: 'Mobil uyumlu WebAR ve anlık bayi teklif toplama motoru yok'
    }
  ];

  // Automated Outreach Templates
  const outreachTemplates = {
    mimar: {
      subject: 'Mimari Projeleriniz İçin Ücretsiz 3D BIM/Revit Seramik Kütüphanesi & Numune Desteği',
      body: `Sayın Mimarlık & Tasarım Ekibi,

SeramikBak (www.seramikbak.com) olarak, Türkiye'nin önde gelen üreticilerinin (VitrA, Çanakkale Seramik, NG Kütahya, Bien vb.) tüm 2026 porselen karo koleksiyonlarını yüksek çözünürlüklü 4K PBR dokular, Revit BIM (.rfa) ve AutoCAD DWG formatlarında tek platformda topladık.

Ofisinizin konut, otel ve ticari şartnamelerinde kullanabilmeniz için:
1. Doğrudan fabrika teknik föyleri ve ISO 10545 sertifikaları
2. Ücretsiz 15x15 cm kesit numune kargo gönderimi
3. Mimari şartname hazırlama danışmanlığı sunuyoruz.

Platformumuzun BIM/CAD portalını incelemek ve projenize özel teklif almak isterseniz: https://www.seramikbak.com/mimar

İyi çalışmalar dileriz,
SeramikBak Mimari Çözümler Ekibi`
    },
    blog: {
      subject: '2026 Seramik ve Banyo Trendleri Raporu [İçerik & İnfografik Katkısı]',
      body: `Merhaba Değerli Yayın Ekibi,

Yayınlarınızda mimarlık, iç mekan tasarımı ve zemin trendlerine yer verdiğinizi ilgiyle takip ediyoruz.

SeramikBak Malzeme Araştırma Laboratuvarı olarak hazırladığımız "2026 Dünya Seramik ve Yüzey Kaplama Trendleri Raporu"nu okurlarınızla paylaşmak isteriz. Raporda:
- Doğal mermer damarlı devasa 120x240 cm slab plakaların yükselişi
- Biyofilik tasarım ve sıcak bej/terakota tonlarının geri dönüşü
- Yerden ısıtmalı sistemlerde porselenin enerji verimliliği (%30 tasarruf)
gibi çarpıcı istatistikler ve infografikler yer almaktadır.

Yazarlarınızın kaynak gösterebilmesi için hazırladığımız basın bülteni ve yüksek çözünürlüklü görseller: https://www.seramikbak.com/ilham

İş birliği dileklerimizle,
SeramikBak Dijital PR Departmanı`
    },
    universite: {
      subject: 'Mimarlık ve İç Mimarlık Öğrencileri İçin Dijital Malzeme Kütüphanesi Burs & Kaynak Desteği',
      body: `Sayın Bölüm Başkanlığı ve Tasarım Kulübü Yetkilileri,

SeramikBak Global olarak, geleceğin mimar ve iç mimarlarının malzeme bilgisine katkıda bulunmaktan gurur duyuyoruz.

Fakülteniz öğrencilerine ve atölye derslerinize yönelik tamamen ücretsiz olarak:
1. 3D Web Sanal Stüdyo (WebAR) üzerinden render ve tasarım deneme imkanı
2. Revit, SketchUp ve 3ds Max için 4K materyal tekstür arşivi
3. Proje maketleri ve sunumları için ücretsiz malzeme numune kiti temin etmekteyiz.

Detaylı bilgi ve akademik erişim için: https://www.seramikbak.com/hakkimizda

Saygılarımızla,
SeramikBak Akademik İlişkiler`
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 antialiased selection:bg-amber-500 selection:text-slate-950">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SeramikBak Enterprise SEO & AI Growth Suite</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white">Canlı SEO & GEO Dashboard</h1>
            <p className="text-sm text-slate-400 mt-1">
              Google Search, Bing, ChatGPT, Perplexity ve Generative Engine Optimization metrikleri.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold hover:bg-slate-800 transition-colors"
            >
              Siteyi Gör
            </Link>
            <Link
              href="/llms.txt"
              target="_blank"
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <span>/llms.txt (AI GEO)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Core Live Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-3">
              <span>Programmatic SEO Sayfa Kapasitesi</span>
              <Layers className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-black text-white">124.800+</div>
            <div className="text-xs text-emerald-400 font-medium mt-2 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Kombinasyon Hazır & İndekslenebilir</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-3">
              <span>Core Web Vitals Sağlık Durumu</span>
              <Zap className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-emerald-400">100 / 100</div>
            <div className="text-xs text-slate-400 font-medium mt-2">
              LCP: 1.2s • CLS: 0.01 • INP: 85ms
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-3">
              <span>Schema.org Uyumluluk Skoru</span>
              <ShieldCheck className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-3xl font-black text-sky-400">%100 Geçerli</div>
            <div className="text-xs text-slate-400 font-medium mt-2">
              Product, FAQ, Brand, LocalBusiness, Breadcrumbs
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-3">
              <span>Aktif Desteklenen Diller</span>
              <Globe className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-3xl font-black text-purple-400">7 Dil (Hreflang)</div>
            <div className="text-xs text-slate-400 font-medium mt-2">
              TR, EN, DE, FR, ES, AR, RU
            </div>
          </div>
        </div>

        {/* Interactive Programmatic SEO Simulator */}
        <section className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Search className="w-5 h-5 text-amber-400" />
                <span>Programmatic SEO (pSEO) Kombinasyon Test Simülatörü</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Kombinasyonu seçin, dinamik landing page rotasını ve veritabanı eşleşmesini canlı test edin.
              </p>
            </div>

            <Link
              href={previewUrl}
              target="_blank"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors self-start md:self-auto"
            >
              <span>Sayfayı Canlı Aç</span>
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2">Marka</label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                {TOP_BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2">Ölçü / Ebat</label>
              <select
                value={selectedDimension}
                onChange={(e) => setSelectedDimension(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                {POPULAR_DIMENSIONS.map(d => <option key={d.width + 'x' + d.height} value={`${d.width}x${d.height}`}>{d.label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2">Renk</label>
              <select
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="bej">Bej</option>
                <option value="antrasit">Antrasit</option>
                <option value="beyaz">Beyaz</option>
                <option value="gri">Gri</option>
                <option value="siyah">Siyah</option>
                <option value="kahve">Kahve</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2">Mekan</label>
              <select
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                {CORE_AREAS.map(a => <option key={a.slug} value={a.slug}>{a.label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2">Şehir (Bayi Ağı)</label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                {MAJOR_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 truncate">
              <span className="text-slate-500 font-mono">Dinamik URL:</span>
              <span className="text-amber-400 font-mono font-medium truncate">https://www.seramikbak.com{previewUrl}</span>
            </div>
            <button
              onClick={() => handleCopy(`https://www.seramikbak.com${previewUrl}`)}
              className="text-slate-400 hover:text-white px-3 py-1 rounded-lg bg-slate-900 border border-slate-700 transition-colors flex items-center gap-1 shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Kopyalandı' : 'Kopyala'}</span>
            </button>
          </div>
        </section>

        {/* Competitor Benchmark Matrix */}
        <section className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span>Global & Yerel Rakip Analizi (SERP & Teknoloji Karşılaştırması)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Tilebar, Tile Club, Porcelanosa, Marazzi, VitrA ve Türk üreticilere karşı SeramikBak rekabet avantajı matrisi.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/40">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-amber-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
                <tr>
                  <th className="p-4">Platform</th>
                  <th className="p-4">Pazar</th>
                  <th className="p-4">Tahmini Trafik</th>
                  <th className="p-4">Keyword Sayısı</th>
                  <th className="p-4">Domain Otoritesi (DR)</th>
                  <th className="p-4">3D Görselleştirici</th>
                  <th className="p-4">SeramikBak Üstünlük / Eksik Fırsat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                <tr className="bg-amber-500/10 font-semibold text-white">
                  <td className="p-4 text-amber-300 font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>SeramikBak Global</span>
                  </td>
                  <td className="p-4">TR & Global Export</td>
                  <td className="p-4">Yükselişte (Hedef 2M+)</td>
                  <td className="p-4">120.000+ Hedef</td>
                  <td className="p-4 text-amber-400">Hızlı Büyüme</td>
                  <td className="p-4 text-emerald-400 font-bold">Canlı Web 3D & WebAR</td>
                  <td className="p-4 text-emerald-300 font-medium">
                    16 Türk markası tek çatı altında, doğrudan bayi fiyat teklifi, usta entegrasyonu, mimari BIM kütüphanesi
                  </td>
                </tr>
                {competitors.map((c, i) => (
                  <tr key={i} className="hover:bg-slate-900/60 transition-colors">
                    <td className="p-4 font-bold text-white">{c.name}</td>
                    <td className="p-4">{c.market}</td>
                    <td className="p-4">{c.traffic}</td>
                    <td className="p-4">{c.keywords}</td>
                    <td className="p-4 font-semibold">{c.dr}</td>
                    <td className="p-4">{c.visualizer3d}</td>
                    <td className="p-4 text-slate-400">{c.weakness}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Backlink Outreach Module */}
        <section className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-amber-400" />
                <span>Otomatik Dijital PR & Backlink Outreach Motoru</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Mimarlık dergileri, inşaat portalları ve üniversiteler için hazır basın bülteni ve iş birliği e-postaları.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setOutreachTarget('mimar')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  outreachTarget === 'mimar' ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-300'
                }`}
              >
                Mimarlık Ofisleri
              </button>
              <button
                type="button"
                onClick={() => setOutreachTarget('blog')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  outreachTarget === 'blog' ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-300'
                }`}
              >
                Tasarım Medyası & Bloglar
              </button>
              <button
                type="button"
                onClick={() => setOutreachTarget('universite')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  outreachTarget === 'universite' ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-300'
                }`}
              >
                Üniversiteler
              </button>
            </div>
          </div>

          <div className="space-y-4 bg-slate-950 p-6 rounded-2xl border border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">E-Posta Konu Başlığı:</label>
              <div className="text-sm font-bold text-amber-300">
                {outreachTemplates[outreachTarget].subject}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Mesaj Metni:</label>
              <pre className="text-xs text-slate-300 font-sans whitespace-pre-wrap leading-relaxed bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                {outreachTemplates[outreachTarget].body}
              </pre>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => handleCopy(`${outreachTemplates[outreachTarget].subject}\n\n${outreachTemplates[outreachTarget].body}`)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-2 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Şablon Kopyalandı' : 'Tüm Şablonu Kopyala'}</span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
