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
    <div className="quote-modal-backdrop">
      <div className="quote-modal-card">
        <button onClick={onClose} className="btn-modal-close">
          <X size={18} />
        </button>

        <div className="modal-header-row">
          <div className="icon-badge-gold">
            <FileText size={24} />
          </div>
          <div>
            <h2 className="modal-title">Resmi Fiyat Teklifi Oluştur</h2>
            <p className="modal-sub">
              3D Tasarım snapshot'ı ve hesaplanan kalemler teklif belgesine işlenecektir.
            </p>
          </div>
        </div>

        <form onSubmit={handleGenerateQuote} className="modal-form-grid">
          {/* Müşteri ve Proje Bilgileri */}
          <div className="inputs-2col">
            <div className="input-group">
              <label className="input-label">Müşteri Adı Soyadı *</label>
              <div className="input-with-icon">
                <User size={15} className="input-icon" />
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="ör. Zeynep Yılmaz"
                  className="modal-input"
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Telefon Numarası *</label>
              <div className="input-with-icon">
                <Phone size={15} className="input-icon" />
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="05xx xxx xx xx"
                  className="modal-input"
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">E-Posta Adresi (Opsiyonel)</label>
              <div className="input-with-icon">
                <Mail size={15} className="input-icon" />
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="ornek@email.com"
                  className="modal-input"
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Proje / Mekan Tanımı</label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="ör. Ebeveyn Banyosu Yenileme"
                className="modal-input no-icon"
              />
            </div>
          </div>

          {/* İskonto ve Notlar */}
          <div className="inputs-2col">
            <div className="input-group">
              <label className="input-label">Özel İskonto Oranı (%)</label>
              <div className="input-with-icon">
                <Percent size={15} className="input-icon" />
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  className="modal-input"
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Teklif Notu / Özel Şartlar</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="ör. 7 gün geçerlidir. Kat taşıma dahildir."
                className="modal-input no-icon"
              />
            </div>
          </div>

          {/* Hesaplama Özeti Kartı */}
          <div className="calc-summary-card">
            <div className="summary-hdr">
              <span>HESAPLANAN KALEMLER</span>
              <span className="gold-text">{selectedProduct?.name} ({areaM2} m² + %{wastePercent} Fire)</span>
            </div>
            <div className="summary-line">
              <span>Seramik Malzemesi ({totalM2WithWaste} m² / {requiredBoxes} Kutu):</span>
              <span>₺{tileCost.toLocaleString('tr-TR')}</span>
            </div>
            {includeAdhesive && (
              <div className="summary-line">
                <span>Seramik Yapıştırıcı Harç ({adhesiveBags} Torba):</span>
                <span>₺{adhesiveCost.toLocaleString('tr-TR')}</span>
              </div>
            )}
            {includeGrout && (
              <div className="summary-line">
                <span>Derz Dolgusu ({groutPacks} Kova):</span>
                <span>₺{groutCost.toLocaleString('tr-TR')}</span>
              </div>
            )}
            {includeLabor && laborCost > 0 && (
              <div className="summary-line green">
                <span>Sertifikalı Ustalık İşçiliği:</span>
                <span>₺{laborCost.toLocaleString('tr-TR')}</span>
              </div>
            )}
            {includeShipping && shippingCost > 0 && (
              <div className="summary-line sky">
                <span>Lojistik & Nakliye Teslimat:</span>
                <span>₺{shippingCost.toLocaleString('tr-TR')}</span>
              </div>
            )}
            <div className="summary-total-line">
              <span>TAHMİNİ GENEL TOPLAM (KDV Dahil):</span>
              <span className="gold-text">₺{grandTotal.toLocaleString('tr-TR')}</span>
            </div>
          </div>

          <button type="submit" className="btn-submit-pdf">
            <FileCheck size={18} />
            <span>PDF Teklifi Saniyeler İçinde Oluştur</span>
          </button>
        </form>
      </div>

      <style jsx>{`
        .quote-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: rgba(9, 13, 22, 0.85);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }

        .quote-modal-card {
          background: #0f172a;
          border: 1px solid #1e293b;
          border-radius: 24px;
          max-width: 600px;
          width: 100%;
          padding: 24px;
          color: #ffffff;
          box-shadow: 0 20px 50px rgba(0,0,0,0.5);
          position: relative;
          max-height: 90vh;
          overflow-y: auto;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
        }

        .btn-modal-close {
          position: absolute;
          top: 16px;
          right: 16px;
          background: #1e293b;
          color: #94a3b8;
          border: none;
          padding: 6px;
          border-radius: 50%;
          cursor: pointer;
        }

        .modal-header-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }

        .icon-badge-gold {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          background: rgba(245, 158, 11, 0.15);
          border: 1px solid rgba(245, 158, 11, 0.3);
          color: #fbbf24;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .modal-title {
          font-size: 1.15rem;
          font-weight: 800;
          margin: 0;
          color: #ffffff;
        }

        .modal-sub {
          font-size: 0.72rem;
          color: #94a3b8;
          margin: 2px 0 0 0;
        }

        .modal-form-grid {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .inputs-2col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .input-label {
          font-size: 0.7rem;
          font-weight: 700;
          color: #94a3b8;
        }

        .input-with-icon {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 10px;
          color: #64748b;
        }

        .modal-input {
          width: 100%;
          background: #090d16;
          border: 1px solid #1e293b;
          border-radius: 10px;
          padding: 9px 12px 9px 34px;
          font-size: 0.75rem;
          color: #ffffff;
          outline: none;
        }

        .modal-input.no-icon {
          padding-left: 12px;
        }

        .calc-summary-card {
          background: #090d16;
          border: 1px solid #1e293b;
          border-radius: 14px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 0.72rem;
        }

        .summary-hdr {
          display: flex;
          justify-content: space-between;
          font-weight: 800;
          color: #94a3b8;
          border-bottom: 1px solid #1e293b;
          padding-bottom: 6px;
        }

        .summary-line {
          display: flex;
          justify-content: space-between;
          color: #cbd5e1;
        }

        .summary-line.green { color: #34d399; }
        .summary-line.sky { color: #38bdf8; }

        .summary-total-line {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          font-weight: 900;
          color: #ffffff;
          border-top: 1px solid #1e293b;
          padding-top: 6px;
          margin-top: 4px;
        }

        .gold-text {
          color: #fbbf24;
        }

        .btn-submit-pdf {
          width: 100%;
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: #0f172a;
          border: none;
          padding: 12px;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 900;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
        }

        @media (max-width: 600px) {
          .inputs-2col {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
