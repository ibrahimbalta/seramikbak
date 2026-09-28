'use client';

import React, { useState } from 'react';
import { 
  TrendingUp, BarChart3, PieChart, Sparkles, MapPin, 
  Compass, Award, ArrowUpRight, ArrowDownRight, Layers, Lightbulb
} from 'lucide-react';

export default function MarketIntelligenceTab({ brandInfo }) {
  const brandName = brandInfo?.name || 'VitrA';

  const dimensionTrends = [
    { size: '60x120 cm Porselen Karo', share: 48, growth: '+28%', popularUsage: 'Tüm Zemin & Banyo Duvar', status: 'YÜKSELİŞTE' },
    { size: '80x80 cm Kare Karo', share: 22, growth: '+4%', popularUsage: 'Geniş Salon & Antre', status: 'DENGELİ' },
    { size: '120x240 cm Dev Slab Plaka', share: 14, growth: '+62%', popularUsage: 'Mutfak Adası & Lüks Banyo', status: 'HIZLI YÜKSELİŞ' },
    { size: '20x120 cm Ahşap Desen', share: 10, growth: '+8%', popularUsage: 'Yatak Odası & Islak Hacim', status: 'DENGELİ' },
    { size: '60x60 cm Standart Karo', share: 6, growth: '-14%', popularUsage: 'Balkon & Servis Alanları', status: 'DÜŞÜŞTE' }
  ];

  const textureTrends = [
    { name: 'Pietra Traverten & Sıcak Bej', share: 36, growth: '+45%', color: '#d97706' },
    { name: 'Brüt Beton & Antrasit Loft', share: 28, growth: '+12%', color: '#64748b' },
    { name: 'Calacatta Gold / Statuario', share: 22, growth: '+6%', color: '#3b82f6' },
    { name: 'Doğal Meşe Ahşap Dokusu', share: 14, growth: '+15%', color: '#84cc16' }
  ];

  const surfacePreferences = [
    { finish: 'Mat / Hafif Dokulu (R10)', percent: 62, desc: 'Banyo ve salon zeminlerinde 1 numara' },
    { finish: 'Full Parlak / Cilalı (Polished)', percent: 28, desc: 'Banyo duvarları ve lobi zeminleri' },
    { finish: 'Lapatto (Yarı Parlak)', percent: 10, desc: 'Ticari mağazalar ve butik ofisler' }
  ];

  const regionalDemands = [
    { region: 'Marmara (İstanbul, Kocaeli, Bursa)', share: '%42', topNeed: '60x120 Mermer & Beton', index: 'Çok Yüksek' },
    { region: 'Ege (İzmir, Muğla, Aydın)', share: '%24', topNeed: 'Teras Dona Dayanıklı R11 & Traverten', index: 'Yüksek (Yaz Sezonu)' },
    { region: 'Akdeniz (Antalya, Adana, Mersin)', share: '%18', topNeed: 'Otel Lobisi 120x240 Slab & Havuz Çevresi', index: 'Yüksek' },
    { region: 'İç Anadolu (Ankara, Konya, Kayseri)', share: '%16', topNeed: 'Yerden Isıtmaya Uygun 80x80 Porselen', index: 'Dengeli' }
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Value Banner */}
      <div className="rounded-2xl p-6 md:p-8 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/20 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-3">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Gerçek Zamanlı Pazar Algoritmaları • 120.000+ Aylık Arama Verisi</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            Canlı Pazar İstihbaratı & AR-GE Trend Radarı
          </h2>
          <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
            Türkiye ve Avrupa genelindeki tüketici ve mimar aramalarından derlenen büyük veri. Fabrikanızın üretim bantlarını en çok aranan ebatlara, renklere ve yüzey dokularına kaydırarak stok riskini sıfırlayın.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-center shrink-0">
          <div className="text-xs text-slate-400">Son 30 Günlük Veri Seti</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">128.400+</div>
          <div className="text-[11px] text-slate-400 mt-1">Arama & 3D Giydirme İşlemi</div>
        </div>
      </div>

      {/* R&D Recommendation Box */}
      <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0">
          <Lightbulb className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-extrabold text-amber-300">
            {brandName} İçin Yapay Zeka AR-GE & Üretim Planlama Tavsiyesi (2026 Q3)
          </h3>
          <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
            Pazar verilerimize göre <strong>60x120 cm Mat Traverten ve Bal Rengi Oniks</strong> dokulu porselen karolarda %42 arz açığı bulunmaktadır. Soğuk gri mermer aramaları son 6 ayda %18 gerilerken, sıcak toprak ve bej tonlarına yönelim hızla artmaktadır. Fabrikanızın yeni koleksiyon lansmanlarında bu format ve dokuya ağırlık vermesi tavsiye edilir.
          </p>
        </div>
      </div>

      {/* Dimension Trends & Texture Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Dimension Trends */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-600" />
              <span>Ebat Talep Dağılımı ve Büyüme Hızları</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Kullanıcıların ve mimarların en çok aradığı ve filtrelediği karo boyutları.
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="p-3.5 font-bold">Ebat / Format</th>
                  <th className="p-3.5 font-bold">Pazar Payı</th>
                  <th className="p-3.5 font-bold">Aylık Değişim</th>
                  <th className="p-3.5 font-bold">Trend Durumu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {dimensionTrends.map(item => (
                  <tr key={item.size} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{item.size}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{item.popularUsage}</div>
                    </td>
                    <td className="p-3.5 font-black text-slate-900 text-sm">%{item.share}</td>
                    <td className="p-3.5 font-bold text-emerald-600">{item.growth}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        item.status.includes('YÜKSELİŞ') ? 'bg-emerald-100 text-emerald-800' :
                        item.status === 'DENGELİ' ? 'bg-slate-100 text-slate-700' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Texture & Color Demand */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-amber-600" />
              <span>Yükselen Doku ve Renk Tercihleri</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              3D Stüdyo giydirmelerinde en çok seçilen doku aileleri.
            </p>
          </div>

          <div className="space-y-4">
            {textureTrends.map(t => (
              <div key={t.name} className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-800">{t.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600 text-[11px]">{t.growth}</span>
                    <span className="text-slate-900 font-black">%{t.share}</span>
                  </div>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${t.share}%`, backgroundColor: t.color }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* Surface Finishes */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h4 className="text-xs font-bold text-slate-800">Yüzey Tercihleri (Mat vs Parlak):</h4>
            <div className="grid grid-cols-3 gap-2 text-center">
              {surfacePreferences.map(s => (
                <div key={s.finish} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-lg font-black text-slate-900">%{s.percent}</div>
                  <div className="text-[11px] font-bold text-slate-700 mt-0.5 line-clamp-1">{s.finish}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Regional Demand Heatmap Table */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-sky-600" />
          <span>Bölgesel Talep Yoğunluğu & İhtiyaç Haritası</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {regionalDemands.map(reg => (
            <div key={reg.region} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-sky-700 uppercase tracking-wider">{reg.index}</span>
                <h4 className="text-sm font-extrabold text-slate-900 mt-1">{reg.region}</h4>
                <p className="text-xs text-slate-500 mt-2">Öne Çıkan: <strong className="text-slate-800">{reg.topNeed}</strong></p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-500">Pazar Payı:</span>
                <span className="font-black text-slate-900 text-sm">{reg.share}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
