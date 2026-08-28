'use client';

import React, { useState } from 'react';
import { FileText, User, Phone, Mail, FileCheck, X, Sparkles, Building2, CheckCircle2, Percent } from 'lucide-react';
import QuotePDFTemplate from './QuotePDFTemplate';

export default function QuoteModal({ isOpen, onClose, selectedProduct, selectedDealer, calculationData, snapshotUrl }) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [projectName, setProjectName] = useState('Banyo / Mekan Yenileme');
  const [notes, setNotes] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [showPdf, setShowPdf] = useState(false);
  const [generatedQuote, setGeneratedQuote] = useState(null);

  if (!isOpen) return null;

  const {
    areaM2 = 15,
    wastePercent = 10,
    totalM2WithWaste = 16.5,
    requiredBoxes = 12,
    unitPriceM2 = 450,
    tileCost = 7425,
    includeAdhesive = true,
    adhesiveBags = 4,
    adhesiveCost = 1120,
    includeGrout = true,
    groutPacks = 2,
    groutCost = 360,
    includeLabor = false,
    laborCost = 0,
    includeShipping = false,
    shippingCost = 0,
    subtotal = 8905,
    vatAmount = 1781,
    grandTotal = 10686
  } = calculationData || {};

  const handleGenerateQuote = (e) => {
    e.preventDefault();
    if (!customerName || !customerPhone) {
      alert('Lütfen Müşteri Adı ve Telefon Numarasını giriniz.');
      return;
    }

    const discountAmount = Math.round((subtotal * (Number(discountPercent) || 0)) / 100);
    const discountedSubtotal = subtotal - discountAmount;
    const calculatedVat = Math.round(discountedSubtotal * 0.20);
    const finalGrandTotal = discountedSubtotal + calculatedVat;

    const quoteId = `SB-${Math.floor(100000 + Math.random() * 900000)}`;

    const quotePayload = {
      id: quoteId,
      dealerName: selectedDealer?.name || 'SeramikBak Yetkili Showroom',
      dealerPhone: selectedDealer?.phone || '0850 300 00 00',
      dealerAddress: selectedDealer?.address || 'Showroom Merkez',
      dealerCity: selectedDealer?.city || 'İstanbul',
      dealerLogoUrl: selectedDealer?.logoUrl || null,
      brandName: selectedProduct?.brand?.name || 'SeramikBak Premium',
      customerName: customerName,
      customerPhone: customerPhone,
      customerEmail: customerEmail,
      projectName: projectName,
      productName: selectedProduct?.name || 'Calacatta Porselen Seramik',
      productCode: selectedProduct?.code || 'SB-60120',
      productImageUrl: snapshotUrl || selectedProduct?.imageUrl || selectedProduct?.textureUrl || '/hero/hero_ceramics.jpg',
      calculations: {
        unitPriceM2: unitPriceM2,
        totalTileM2: totalM2WithWaste,
        netAreaM2: areaM2,
        wastePercent: wastePercent,
        netTileCost: tileCost,
        includeAdhesive: includeAdhesive,
        adhesiveUnitPriceBag: 280,
        adhesiveBagsCount: adhesiveBags,
        totalAdhesiveKg: adhesiveBags * 25,
        totalAdhesiveCost: adhesiveCost,
        includeGrout: includeGrout,
        groutUnitPriceKg: 180,
        totalGroutKg: groutPacks * 5,
        totalGroutCost: groutCost,
        laborCost: includeLabor ? laborCost : 0,
        shippingCost: includeShipping ? shippingCost : 0,
        subtotalBeforeVat: subtotal,
        discountPercent: Number(discountPercent) || 0,
        tileDiscountAmount: discountAmount,
        vatRate: 20,
        vatAmount: calculatedVat,
        grandTotal: finalGrandTotal
      },
      notes: notes,
      createdAt: new Date().toISOString(),
      whatsappMessage: encodeURIComponent(
        `Merhaba ${customerName}, SeramikBak 3D Showroom'da hazırladığımız Sayın ${customerName} için teklifiniz hazır! Teklif No: ${quoteId}, Tutar: ₺${finalGrandTotal.toLocaleString('tr-TR')} KDV Dahil.`
      )
    };

    setGeneratedQuote(quotePayload);
    setShowPdf(true);
  };

  if (showPdf && generatedQuote) {
    return (
      <QuotePDFTemplate
        quote={generatedQuote}
        onClose={() => {
          setShowPdf(false);
          onClose();
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 text-white shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">Resmi Fiyat Teklifi Oluştur</h2>
            <p className="text-xs text-slate-400">
              3D Tasarım snapshot'ı ve hesaplanan kalemler teklif belgesine işlenecektir.
            </p>
          </div>
        </div>

        <form onSubmit={handleGenerateQuote} className="space-y-4">
          {/* Müşteri ve Proje Bilgileri */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Müşteri Adı Soyadı *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="ör. Zeynep Yılmaz"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Telefon Numarası *</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="05xx xxx xx xx"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">E-Posta Adresi (Opsiyonel)</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="ornek@email.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Proje / Mekan Tanımı</label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="ör. Ebeveyn Banyosu Yenileme"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* İskonto ve Notlar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Özel İskonto Oranı (%)</label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Teklif Notu / Özel Şartlar</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="ör. 7 gün geçerlidir. Kat taşıma dahildir."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Hesaplama Özeti Kartı */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2 text-xs">
            <div className="flex justify-between text-slate-400 font-bold border-b border-slate-800 pb-2">
              <span>HESAPLANAN KALEMLER</span>
              <span className="text-amber-400">{selectedProduct?.name} ({areaM2} m² + %{wastePercent} Fire)</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Seramik Malzemesi ({totalM2WithWaste} m² / {requiredBoxes} Kutu):</span>
              <span>₺{tileCost.toLocaleString('tr-TR')}</span>
            </div>
            {includeAdhesive && (
              <div className="flex justify-between text-slate-300">
                <span>Seramik Yapıştırıcı Harç ({adhesiveBags} Torba):</span>
                <span>₺{adhesiveCost.toLocaleString('tr-TR')}</span>
              </div>
            )}
            {includeGrout && (
              <div className="flex justify-between text-slate-300">
                <span>Derz Dolgusu ({groutPacks} Kova):</span>
                <span>₺{groutCost.toLocaleString('tr-TR')}</span>
              </div>
            )}
            {includeLabor && laborCost > 0 && (
              <div className="flex justify-between text-emerald-400 font-medium">
                <span>Sertifikalı Ustalık İşçiliği:</span>
                <span>₺{laborCost.toLocaleString('tr-TR')}</span>
              </div>
            )}
            {includeShipping && shippingCost > 0 && (
              <div className="flex justify-between text-sky-400 font-medium">
                <span>Lojistik & Nakliye Teslimat:</span>
                <span>₺{shippingCost.toLocaleString('tr-TR')}</span>
              </div>
            )}
            <div className="flex justify-between text-white font-extrabold text-sm border-t border-slate-800 pt-2 mt-2">
              <span>TAHMİNİ GENEL TOPLAM (KDV Dahil):</span>
              <span className="text-amber-400">₺{grandTotal.toLocaleString('tr-TR')}</span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <FileCheck className="w-5 h-5" />
            <span>PDF Teklifi Saniyeler İçinde Oluştur</span>
          </button>
        </form>
      </div>
    </div>
  );
}
