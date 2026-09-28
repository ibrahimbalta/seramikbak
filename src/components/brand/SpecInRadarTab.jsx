'use client';

import React, { useState } from 'react';
import { 
  FileText, Phone, MessageSquare, Download, CheckCircle2, 
  MapPin, Building2, Calendar, Clock, DollarSign, Package, 
  Search, Filter, ExternalLink, Check, ChevronRight, Truck
} from 'lucide-react';

export default function SpecInRadarTab({ brandInfo, initialLeads = [] }) {
  const brandName = brandInfo?.name || 'VitrA';

  // Sample real-world architectural specification leads fallback
  const defaultLeads = [
    {
      id: 'SPEC-2026-101',
      officeName: 'Tabanlıoğlu Mimarlık',
      architectName: 'Mimar Berke Demir',
      phone: '0532 444 11 22',
      email: 'proje@tabanlioglu.com',
      city: 'İstanbul / Beşiktaş',
      projectName: 'Levent Mixed-Use Business Tower',
      projectType: 'Ticari / Ofis & Otel',
      fileType: 'REVIT_BIM (.rfa)',
      productName: 'Marmori Calacatta 60x120 Parlak',
      estimatedM2: 12500,
      unitPriceTl: 520,
      status: 'SPEC_IN', // 'NEW' | 'CONTACTED' | 'SPEC_IN' | 'SAMPLE_SENT' | 'WON' | 'CLOSED'
      date: 'Bugün 11:45',
      trackingNo: 'YURTİÇİ-88492019'
    },
    {
      id: 'SPEC-2026-098',
      officeName: 'Emre Arolat Architecture (EAA)',
      architectName: 'Y. Mimar Selin Kaya',
      phone: '0533 555 77 88',
      email: 'selin@emrearolat.com',
      city: 'Muğla / Bodrum',
      projectName: 'Bodrum Hillside Luxury Villas (42 Villa)',
      projectType: 'Villa / Konut',
      fileType: '4K_PBR_TEXTURES',
      productName: 'Pietra Traverten 60x120 Mat R10',
      estimatedM2: 8400,
      unitPriceTl: 460,
      status: 'SAMPLE_SENT',
      date: 'Dün 16:20',
      trackingNo: 'ARAS-99201827'
    },
    {
      id: 'SPEC-2026-092',
      officeName: 'Autoban Tasarım Ofisi',
      architectName: 'İç Mimar Kaan Özkan',
      phone: '0530 111 22 33',
      email: 'kaan@autoban212.com',
      city: 'İstanbul / Karaköy',
      projectName: 'Bosphorus Boutique Hotel Restorasyonu',
      projectType: 'Otel & Restoran',
      fileType: 'AUTOCAD_DWG',
      productName: 'Urban Beton Antrasit 80x80',
      estimatedM2: 3800,
      unitPriceTl: 390,
      status: 'CONTACTED',
      date: '3 gün önce',
      trackingNo: ''
    },
    {
      id: 'SPEC-2026-085',
      officeName: 'Erginoğlu & Çalışlar Mimarlık',
      architectName: 'Mimar Zeynep Arslan',
      phone: '0542 999 88 77',
      email: 'zeynep@ecarch.com',
      city: 'İzmir / Çeşme',
      projectName: 'Çeşme Marina Residence Suites',
      projectType: 'Konut & Teras',
      fileType: 'REVIT_BIM (.rfa)',
      productName: 'Dona Dayanıklı Teras 20mm 60x60',
      estimatedM2: 5200,
      unitPriceTl: 580,
      status: 'NEW',
      date: '5 gün önce',
    }
  ];

  const [leads, setLeads] = useState(() => {
    if (initialLeads && initialLeads.length > 0) {
      return initialLeads.map((l, idx) => ({
        id: l.id || `SPEC-${idx + 1}`,
        officeName: l.officeName || 'Mimarlık Ofisi',
        architectName: l.architectName || 'Yetkili Mimar',
        phone: l.phone || '05XX XXX XX XX',
        email: l.email || '',
        city: l.city || 'Türkiye',
        projectName: l.projectName || 'Mimari Tasarım Projesi',
        projectType: l.projectType || 'Mimari Proje',
        fileType: l.fileType || 'REVIT_BIM (.rfa)',
        productName: l.product?.name || l.productName || 'Porselen Karo',
        estimatedM2: l.estimatedM2 || 4500,
        unitPriceTl: l.unitPriceTl || 480,
        status: l.status || 'NEW',
        date: l.createdAt ? new Date(l.createdAt).toLocaleDateString('tr-TR') : 'Yeni',
        trackingNo: l.trackingNo || ''
      }));
    }
    return defaultLeads;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [activeTrackingModal, setActiveTrackingModal] = useState(null);
  const [tempTrackingNo, setTempTrackingNo] = useState('');

  // Total Pipeline Financial Value
  const totalPipelineM2 = leads.reduce((sum, item) => sum + item.estimatedM2, 0);
  const totalPipelineValueTl = leads.reduce((sum, item) => sum + (item.estimatedM2 * item.unitPriceTl), 0);

  const handleStatusChange = (id, newStatus) => {
    setLeads(prev => prev.map(lead => lead.id === id ? { ...lead, status: newStatus } : lead));
  };

  const handleSaveTrackingNo = (e) => {
    e.preventDefault();
    if (!activeTrackingModal) return;
    setLeads(prev => prev.map(lead => 
      lead.id === activeTrackingModal.id 
        ? { ...lead, trackingNo: tempTrackingNo, status: 'SAMPLE_SENT' } 
        : lead
    ));
    setActiveTrackingModal(null);
  };

  const handleExportCsv = () => {
    const headers = 'ID,Mimarlık Ofisi,Mimar,Telefon,Proje Adı,Proje Tipi,Ürün,Tahmini m2,Durum,Kargo Takip\n';
    const rows = leads.map(l => 
      `"${l.id}","${l.officeName}","${l.architectName}","${l.phone}","${l.projectName}","${l.projectType}","${l.productName}",${l.estimatedM2},"${l.status}","${l.trackingNo || ''}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `seramikbak_specin_leads_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLeads = leads.filter(l => {
    const matchesSearch = 
      l.officeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.architectName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'ALL' || l.projectType.includes(filterType);
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Value Banner */}
      <div className="rounded-2xl p-6 md:p-8 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border border-amber-500/20 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold mb-3">
            <FileText className="w-3.5 h-3.5" />
            <span>Mimari Şartname & Proje İhale Radarı</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            BIM / CAD Şartname Radarı (Spec-In CRM)
          </h2>
          <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
            Türkiye'nin önde gelen mimarlık ofisleri ve tasarımcılarının {brandName} ürünlerini çizimlerine (Revit BIM, AutoCAD DWG) dahil ettiği an yakalanan sıcak proje sinyalleri. Şartnameye girin, ihaleyi rakiplerinizden önce kapatın.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleExportCsv}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2 border border-slate-700 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Excel / CSV Olarak İndir</span>
          </button>
        </div>
      </div>

      {/* Financial Pipeline KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Toplam Şartname Portföy Hacmi
          </div>
          <div className="text-3xl font-black text-amber-600">
            ₺{totalPipelineValueTl.toLocaleString('tr-TR')}
          </div>
          <div className="text-xs text-slate-500 mt-2">Aktif projelerin toplam malzeme bütçesi</div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Şartnamedeki Toplam Metraj
          </div>
          <div className="text-3xl font-black text-slate-900">
            {totalPipelineM2.toLocaleString('tr-TR')} m²
          </div>
          <div className="text-xs text-slate-500 mt-2">{leads.length} aktif büyük inşaat projesi</div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Numune Gönderilen Projeler
          </div>
          <div className="text-3xl font-black text-emerald-600">
            {leads.filter(l => l.status === 'SAMPLE_SENT' || l.status === 'SPEC_IN').length} Proje
          </div>
          <div className="text-xs text-slate-500 mt-2">15x15 cm kesit kutusu teslim edildi</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Mimarlık ofisi, mimar veya proje adı ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto overflow-x-auto w-full sm:w-auto">
          {['ALL', 'Otel', 'Konut', 'Villa', 'Ticari'].map(type => (
            <button
              key={type}
              type="button"
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                filterType === type 
                  ? 'bg-slate-900 text-white' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {type === 'ALL' ? 'Tüm Projeler' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Leads List */}
      <div className="space-y-4">
        {filteredLeads.map(lead => {
          const cleanPhone = lead.phone.replace(/\s+/g, '');
          const whatsappUrl = `https://wa.me/90${cleanPhone.startsWith('0') ? cleanPhone.slice(1) : cleanPhone}?text=${encodeURIComponent(
            `Merhaba ${lead.architectName}, SeramikBak portalı üzerinden ${lead.projectName} projeniz için indirdiğiniz ${lead.productName} modelimizin Revit BIM kütüphanesi ve 15x15 numune desteği hakkında yardımcı olmak isteriz.`
          )}`;

          return (
            <div 
              key={lead.id} 
              className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-amber-400/50 transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    {lead.id}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold">
                    {lead.projectType}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{lead.city}</span>
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{lead.date}</span>
                  </span>
                </div>

                <div className="flex items-baseline gap-3">
                  <h3 className="text-lg font-extrabold text-slate-900">{lead.projectName}</h3>
                  <span className="text-xs text-slate-500 font-medium">({lead.officeName})</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-600">
                  <div>
                    <span className="font-semibold text-slate-800">Şartname Ürünü: </span>
                    <span className="text-amber-700 font-bold">{lead.productName}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800">Yetkili Mimar: </span>
                    <span>{lead.architectName}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800">Tahmini Metraj: </span>
                    <span className="font-bold text-slate-900">{lead.estimatedM2.toLocaleString('tr-TR')} m²</span>
                    <span className="text-slate-400 ml-1">(~₺{(lead.estimatedM2 * lead.unitPriceTl).toLocaleString('tr-TR')})</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800">İndirilen Dosya: </span>
                    <span className="font-mono text-slate-700">{lead.fileType}</span>
                  </div>
                </div>

                {lead.trackingNo && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
                    <Truck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Numune Gönderildi: <strong>{lead.trackingNo}</strong></span>
                  </div>
                )}
              </div>

              {/* Status & Actions */}
              <div className="flex flex-col sm:flex-row lg:flex-col items-end gap-3 shrink-0 w-full lg:w-auto pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                <select
                  value={lead.status}
                  onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border cursor-pointer ${
                    lead.status === 'SPEC_IN' ? 'bg-amber-100 text-amber-900 border-amber-300' :
                    lead.status === 'SAMPLE_SENT' ? 'bg-sky-100 text-sky-900 border-sky-300' :
                    lead.status === 'WON' ? 'bg-emerald-100 text-emerald-900 border-emerald-300' :
                    'bg-slate-100 text-slate-700 border-slate-300'
                  }`}
                >
                  <option value="NEW">⚡ Yeni Sinyal</option>
                  <option value="CONTACTED">📞 İletişime Geçildi</option>
                  <option value="SPEC_IN">📌 Şartnameye Girildi</option>
                  <option value="SAMPLE_SENT">📦 Numune Gönderildi</option>
                  <option value="WON">🏆 Proje Kazanıldı</option>
                  <option value="CLOSED">❌ Kapatıldı</option>
                </select>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <a
                    href={`tel:${lead.phone}`}
                    className="flex-1 sm:flex-none p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center justify-center gap-1.5 text-xs font-bold"
                    title="Mimarı Ara"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span className="sm:hidden">Ara</span>
                  </a>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center justify-center gap-1.5 text-xs font-bold shadow-sm"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTrackingModal(lead);
                      setTempTrackingNo(lead.trackingNo || '');
                    }}
                    className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-colors flex items-center justify-center gap-1.5 text-xs font-bold"
                  >
                    <Package className="w-3.5 h-3.5 text-amber-400" />
                    <span>Numune Gönder</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tracking Number Modal */}
      {activeTrackingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">15x15 Numune Kutusu Kargo Bilgisi</h3>
                <p className="text-xs text-slate-400 mt-0.5">{activeTrackingModal.architectName} ({activeTrackingModal.officeName})</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTrackingModal(null)}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTrackingNo} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kargo Takip No (Yurtiçi / Aras / MNG):
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: YURTİÇİ-88492019"
                  value={tempTrackingNo}
                  onChange={(e) => setTempTrackingNo(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="text-xs text-slate-500 bg-amber-50 p-3 rounded-xl border border-amber-200">
                Kargo takip no girildiğinde mimara otomatik SMS/E-posta ile kargo takip linki gönderilecektir.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTrackingModal(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold"
                >
                  Kaydet & Durumu Güncelle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
