'use client';

import React, { useState } from 'react';
import { 
  Globe, Send, Download, CheckCircle2, ShieldCheck, 
  MapPin, Calendar, FileText, Check, DollarSign, Calculator,
  ExternalLink, Building2, Package, Clock
} from 'lucide-react';

export default function ExportRfqTab({ brandInfo }) {
  const brandName = brandInfo?.name || 'VitrA';

  // Sample real-world international B2B RFQ inquiries
  const [rfqList, setRfqList] = useState([
    {
      id: 'RFQ-DE-2026-081',
      country: 'Almanya',
      countryCode: 'DE',
      flag: '🇩🇪',
      city: 'Münih / Bavyera',
      company: 'Bavaria Bau & Fliesen GmbH',
      projectType: 'Rezidans & Otel Kompleksi (350 Daire)',
      requestedM2: 14500,
      requestedFormat: '60x120 cm Porselen Karo',
      surface: 'Mat / R10 Kaydırmazlık',
      certRequired: 'CE, EN 14411 Grup BIa, Dona Dayanıklı',
      deliveryPort: 'Hamburg Limanı (FOB/CIF)',
      date: 'Bugün',
      status: 'TEKLİF_BEKLİYOR',
      estimatedBudgetUsd: 14500 * 18.5
    },
    {
      id: 'RFQ-US-2026-044',
      country: 'Amerika Birleşik Devletleri',
      countryCode: 'US',
      flag: '🇺🇸',
      city: 'Miami, Florida',
      company: 'Coastal Luxury Interiors LLC',
      projectType: 'Lüks Sahil Villaları & Teras Zeminleri',
      requestedM2: 8200,
      requestedFormat: '120x240 cm Slab & 80x80 cm',
      surface: 'Parlak Calacatta & Mat Traverten',
      certRequired: 'ASTM C373 Su Emme < %0.5, DCOF > 0.42',
      deliveryPort: 'Miami Port (CIF)',
      date: 'Dün',
      status: 'TEKLİF_BEKLİYOR',
      estimatedBudgetUsd: 8200 * 24.0
    },
    {
      id: 'RFQ-SA-2026-102',
      country: 'Suudi Arabistan',
      countryCode: 'SA',
      flag: '🇸🇦',
      city: 'Riyadh',
      company: 'Al-Madar Construction & Contracting',
      projectType: 'Ticari İş Merkezi & AVM Projesi',
      requestedM2: 28000,
      requestedFormat: '60x120 cm & 60x60 cm Porselen',
      surface: 'Mat Beton Dokulu & Gri / Kemik Renk',
      certRequired: 'SASO Sertifikası, ISO 10545, PEI 5',
      deliveryPort: 'Jeddah Islamic Port (FOB Mersin/İzmir)',
      date: '3 gün önce',
      status: 'İNCELENİYOR',
      estimatedBudgetUsd: 28000 * 16.0
    },
    {
      id: 'RFQ-GB-2026-029',
      country: 'Birleşik Krallık',
      countryCode: 'GB',
      flag: '🇬🇧',
      city: 'Londra',
      company: 'Thames Urban Architecture Ltd.',
      projectType: 'Boutique Hotel & Restaurant Renovation',
      requestedM2: 4500,
      requestedFormat: '20x120 cm Ahşap Desen Porselen',
      surface: 'Mat Ahşap Meşe Dokusu',
      certRequired: 'UKCA, PTV 36+ Islak Kaydırmazlık',
      deliveryPort: 'Felixstowe Port (CIF)',
      date: '5 gün önce',
      status: 'TEKLİF_VERİLDİ',
      estimatedBudgetUsd: 4500 * 22.0
    }
  ]);

  // Selected RFQ for proposal builder modal
  const [selectedRfq, setSelectedRfq] = useState(null);
  const [fobPricePerM2, setFobPricePerM2] = useState('16.50');
  const [freightPerContainer, setFreightPerContainer] = useState('2200');
  const [productionDays, setProductionDays] = useState('25 gün');
  const [offerSubmitted, setOfferSubmitted] = useState(false);

  // Calculations for Proforma
  const m2 = selectedRfq ? selectedRfq.requestedM2 : 0;
  // Standard 20ft container carries ~1,300 m² of 60x120 tiles (approx 24-26 tons)
  const containersNeeded = Math.ceil(m2 / 1300);
  const totalFobAmount = Math.round(m2 * parseFloat(fobPricePerM2 || 0));
  const totalFreight = containersNeeded * parseFloat(freightPerContainer || 0);
  const totalCifAmount = totalFobAmount + totalFreight;

  const handleOpenOfferModal = (rfq) => {
    setSelectedRfq(rfq);
    setOfferSubmitted(false);
  };

  const handleSubmitOffer = (e) => {
    e.preventDefault();
    setOfferSubmitted(true);
    setTimeout(() => {
      // Update local state status
      setRfqList(prev => prev.map(item => 
        item.id === selectedRfq.id ? { ...item, status: 'TEKLİF_VERİLDİ' } : item
      ));
    }, 1000);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Value Banner */}
      <div className="rounded-2xl p-6 md:p-8 bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950/40 border border-sky-500/20 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 text-xs font-semibold mb-3">
            <Globe className="w-3.5 h-3.5" />
            <span>Global Export Matchmaker • 7 Dilde Doğrudan İhale Havuzu</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            Uluslararası İhracat Talepleri & Toptan Alım Masası
          </h2>
          <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
            Almanya, ABD, Körfez ülkeleri ve Birleşik Krallık'taki toptancı ve müteahhitlerin SeramikBak üzerinden açtığı yüksek metrajlı porselen seramik talepleri. Tek tıkla fabrikanız adına doğrudan FOB veya CIF proforma teklif verin.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-center shrink-0">
          <div className="text-xs text-slate-400">Aktif Küresel Talep Hacmi</div>
          <div className="text-2xl font-black text-sky-400 mt-1">55.200 m²</div>
          <div className="text-[11px] text-emerald-400 mt-1">~ $1.050.000 İhracat Potansiyeli</div>
        </div>
      </div>

      {/* RFQ List Table */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-sky-500" />
            <span>Bekleyen İhracat İhaleleri & Sipariş Fırsatları</span>
          </h3>
          <span className="text-xs px-2.5 py-1 rounded-md bg-sky-100 text-sky-800 font-bold">
            {rfqList.length} Aktif Talep
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="p-3.5 font-bold">Ülke / Firma</th>
                <th className="p-3.5 font-bold">Proje Detayı</th>
                <th className="p-3.5 font-bold">Talep Edilen Ebat & Yüzey</th>
                <th className="p-3.5 font-bold">Miktar (m²)</th>
                <th className="p-3.5 font-bold">Teslim Limanı</th>
                <th className="p-3.5 font-bold">Durum</th>
                <th className="p-3.5 font-bold text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {rfqList.map(rfq => (
                <tr key={rfq.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5">
                    <div className="flex items-center gap-2 font-bold text-slate-900">
                      <span className="text-base">{rfq.flag}</span>
                      <span>{rfq.country}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{rfq.company}</div>
                  </td>
                  <td className="p-3.5">
                    <div className="font-semibold text-slate-800">{rfq.projectType}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{rfq.city}</div>
                  </td>
                  <td className="p-3.5">
                    <div className="font-semibold text-slate-800">{rfq.requestedFormat}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{rfq.surface}</div>
                  </td>
                  <td className="p-3.5">
                    <span className="font-black text-slate-900 text-sm">{rfq.requestedM2.toLocaleString('tr-TR')} m²</span>
                  </td>
                  <td className="p-3.5 text-slate-600">
                    <div>{rfq.deliveryPort}</div>
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                      rfq.status === 'TEKLİF_BEKLİYOR'
                        ? 'bg-amber-100 text-amber-800'
                        : rfq.status === 'TEKLİF_VERİLDİ'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-700'
                    }`}>
                      {rfq.status === 'TEKLİF_BEKLİYOR' ? 'Teklif Bekliyor' : rfq.status === 'TEKLİF_VERİLDİ' ? 'Teklif İletildi ✓' : 'İnceleniyor'}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => handleOpenOfferModal(rfq)}
                      className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-colors shadow-sm"
                    >
                      Proforma Teklif Ver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Proforma Proposal Modal */}
      {selectedRfq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-xs text-sky-400 font-semibold">{selectedRfq.id}</span>
                <h3 className="text-lg font-bold mt-0.5">
                  {selectedRfq.flag} {selectedRfq.country} — {selectedRfq.company} İçin İhracat Teklifi
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRfq(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {offerSubmitted ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900">Proforma Teklif Başarıyla Gönderildi!</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Teklifiniz {selectedRfq.company} satın alma yetkilisine İngilizce formatta iletildi. Görüşmeler platformumuz üzerinden takip edilecektir.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSelectedRfq(null)}
                    className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold"
                  >
                    Kapat
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitOffer} className="space-y-6">
                  {/* Summary Banner */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-3 gap-3 text-center">
                    <div>
                      <div className="text-[11px] text-slate-500">Talep Metrajı</div>
                      <div className="text-sm font-extrabold text-slate-900">{selectedRfq.requestedM2.toLocaleString('tr-TR')} m²</div>
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-500">Konteyner Sayısı</div>
                      <div className="text-sm font-extrabold text-sky-600">~{containersNeeded} x 20ft</div>
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-500">Varış Limanı</div>
                      <div className="text-sm font-extrabold text-slate-900">{selectedRfq.deliveryPort}</div>
                    </div>
                  </div>

                  {/* Form Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        FOB m² Teklif Fiyatı (USD):
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-slate-400 font-bold">$</span>
                        <input
                          type="number"
                          step="0.10"
                          value={fobPricePerM2}
                          onChange={(e) => setFobPricePerM2(e.target.value)}
                          className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-sky-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Konteyner Başı Tahmini Navlun (USD):
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-slate-400 font-bold">$</span>
                        <input
                          type="number"
                          value={freightPerContainer}
                          onChange={(e) => setFreightPerContainer(e.target.value)}
                          className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-sky-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Calculation Overview */}
                  <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-200/80 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>FOB Fabrika Tutarı:</span>
                      <span className="font-bold text-slate-900">${totalFobAmount.toLocaleString('en-US')}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Tahmini Deniz Navlunu ({containersNeeded} Konteyner):</span>
                      <span className="font-bold text-slate-900">${totalFreight.toLocaleString('en-US')}</span>
                    </div>
                    <div className="flex justify-between text-sm font-black text-sky-900 pt-2 border-t border-sky-200">
                      <span>Toplam CIF Teklif Tutarı:</span>
                      <span>${totalCifAmount.toLocaleString('en-US')}</span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedRfq(null)}
                      className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
                    >
                      Vazgeç
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-sky-600/20 transition-all"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>İhracat Proforma Teklifini İlet</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
