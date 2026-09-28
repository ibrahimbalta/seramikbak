'use client';

import React, { useState } from 'react';
import { 
  BarChart3, TrendingUp, Award, Eye, Download, ShieldCheck, 
  Sparkles, CheckCircle2, ArrowUpRight, PieChart, Users, Layers
} from 'lucide-react';

export default function BrandHealthTab({ brandInfo }) {
  const brandName = brandInfo?.name || 'VitrA';
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const marketShareData = [
    { brand: brandName, share: 34, color: '#d4af37', isCurrent: true },
    { brand: 'Bien Seramik', share: 22, color: '#3b82f6', isCurrent: false },
    { brand: 'NG Kütahya', share: 20, color: '#10b981', isCurrent: false },
    { brand: 'Çanakkale Seramik', share: 16, color: '#8b5cf6', isCurrent: false },
    { brand: 'Diğerleri', share: 8, color: '#94a3b8', isCurrent: false }
  ];

  const categoryPerformance = [
    { category: 'Banyo Seramikleri', views: '64.200', tryRate: '%44', marketRank: '1. Sırada 🏆' },
    { category: 'Mutfak & Tezgah Arası', views: '38.400', tryRate: '%36', marketRank: '2. Sırada' },
    { category: 'Salon & Antre Zemin', views: '29.100', tryRate: '%31', marketRank: '1. Sırada 🏆' },
    { category: 'Dış Mekan & Teras', views: '16.800', tryRate: '%28', marketRank: '2. Sırada' }
  ];

  const handleDownloadReport = () => {
    setDownloadSuccess(true);
    setTimeout(() => {
      // Trigger a sample executive summary print/download
      window.print();
      setDownloadSuccess(false);
    }, 500);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Value Banner */}
      <div className="rounded-2xl p-6 md:p-8 bg-gradient-to-r from-slate-900 via-slate-900 to-purple-950/40 border border-purple-500/20 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-semibold mb-3">
            <Award className="w-3.5 h-3.5" />
            <span>Executive Board Intelligence • Yönetim Kurulu İntel Raporu</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            {brandName} Dijital Marka Sağlığı & SERP Otorite İndeksi
          </h2>
          <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
            Markanızın Google Search, SeramikBak 3D Stüdyosu ve yetkili bayi ağındaki gerçek zamanlı görünürlük, pazar payı ve mimari etkileşim performansı.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownloadReport}
          className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors flex items-center gap-2 shadow-lg shadow-purple-600/20 shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>{downloadSuccess ? 'Rapor Hazırlanıyor...' : 'Yönetici Raporunu İndir (PDF)'}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Dijital Otorite Skoru
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-purple-600">92 / 100</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> +4.2%
            </span>
          </div>
          <div className="text-xs text-slate-500 mt-2">Sektör lideri seviyesinde</div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Aylık Organik Gösterim
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">148.500+</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> +18%
            </span>
          </div>
          <div className="text-xs text-slate-500 mt-2">Google & SeramikBak içi arama</div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            3D Mekan Giydirme Sayısı
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-500">34.200</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> +26%
            </span>
          </div>
          <div className="text-xs text-slate-500 mt-2">Müşteri ve mimar 3D denemesi</div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Doğrudan Numune Talebi
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600">624 Kutu</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> +12%
            </span>
          </div>
          <div className="text-xs text-slate-500 mt-2">15x15 cm kesit numune</div>
        </div>
      </div>

      {/* Market Share & Category Performance Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Competitor Market Share */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-purple-600" />
              <span>Seramik Sektörü Dijital Pazar Payı Dağılımı</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              SeramikBak platformunda son 30 günlük marka etkileşim oranları.
            </p>
          </div>

          <div className="space-y-4">
            {marketShareData.map(item => (
              <div key={item.brand} className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className={item.isCurrent ? 'text-amber-600 font-extrabold flex items-center gap-1.5' : 'text-slate-700'}>
                    {item.isCurrent && <Sparkles className="w-3 h-3 text-amber-500" />}
                    {item.brand}
                  </span>
                  <span className="text-slate-900 font-black">%{item.share}</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${item.share}%`, backgroundColor: item.color }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-xl bg-purple-50 text-xs text-purple-900 border border-purple-200">
            <span className="font-bold">Özet İçgörü:</span> {brandName}, Türkiye dijital seramik arama hacminde %34 pay ile 1. sıradaki konumunu korumaktadır.
          </div>
        </div>

        {/* Right: Category Performance Table */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-600" />
              <span>Kategori Bazlı Hakimiyet ve 3D Dönüşüm Oranları</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {brandName} koleksiyonlarının mekan kategorilerine göre performansı.
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="p-3.5 font-bold">Mekan Kategorisi</th>
                  <th className="p-3.5 font-bold">Aylık İnceleme</th>
                  <th className="p-3.5 font-bold">3D Giydirme Oranı</th>
                  <th className="p-3.5 font-bold">Piyasa Konumu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {categoryPerformance.map(row => (
                  <tr key={row.category} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900">{row.category}</td>
                    <td className="p-3.5 font-semibold text-slate-700">{row.views}</td>
                    <td className="p-3.5 font-black text-amber-600">{row.tryRate}</td>
                    <td className="p-3.5 font-bold text-emerald-700">{row.marketRank}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
