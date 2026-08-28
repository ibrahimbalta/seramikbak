'use client';

import React, { useState } from 'react';
import { FileText, User, Phone, Mail, FileCheck, X, Sparkles, Building2, CheckCircle2, Percent, Edit3, Plus, Trash2 } from 'lucide-react';
import QuotePDFTemplate from './QuotePDFTemplate';

export default function QuoteModal({ isOpen, onClose, selectedProduct, selectedDealer, calculationData, snapshotUrl }) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [projectName, setProjectName] = useState('Banyo / Mekan Yenileme');
  const [notes, setNotes] = useState('Teklif 7 gün süreyle geçerlidir.');
  const [discountPercent, setDiscountPercent] = useState(0);

  // Kullanıcının elle müdahale edebildiği kalemler (Editable State)
  const [editableAreaM2, setEditableAreaM2] = useState(calculationData?.areaM2 || 18);
  const [editableWastePercent, setEditableWastePercent] = useState(calculationData?.wastePercent || 10);
  const [editableUnitPriceM2, setEditableUnitPriceM2] = useState(calculationData?.unitPriceM2 || 480);
  
  const [includeAdhesive, setIncludeAdhesive] = useState(calculationData?.includeAdhesive ?? true);
  const [editableAdhesiveBags, setEditableAdhesiveBags] = useState(calculationData?.adhesiveBags || 4);
  const [editableAdhesiveBagPrice, setEditableAdhesiveBagPrice] = useState(280);

  const [includeGrout, setIncludeGrout] = useState(calculationData?.includeGrout ?? true);
  const [editableGroutPacks, setEditableGroutPacks] = useState(calculationData?.groutPacks || 2);
  const [editableGroutPackPrice, setEditableGroutPackPrice] = useState(180);

  const [includeLabor, setIncludeLabor] = useState(calculationData?.includeLabor ?? true);
  const [editableLaborRateM2, setEditableLaborRateM2] = useState(250);

  const [includeShipping, setIncludeShipping] = useState(calculationData?.includeShipping ?? true);
  const [editableShippingCost, setEditableShippingCost] = useState(1500);

  // Ekstra Özel Hizmet Kalemleri (ör. Moloz Sökümü, Eski Fayans Kırımı)
  const [customItems, setCustomItems] = useState([]);
  const [newCustomName, setNewCustomName] = useState('');
  const [newCustomPrice, setNewCustomPrice] = useState('');

  const [showPdf, setShowPdf] = useState(false);
  const [generatedQuote, setGeneratedQuote] = useState(null);

  if (!isOpen) return null;

  // Hesaplama Matematiği (Kullanıcının girdiği anlık değerlere göre)
  const areaM2Num = Number(editableAreaM2) || 0;
  const wastePercentNum = Number(editableWastePercent) || 0;
  const totalM2WithWaste = Math.round((areaM2Num * (1 + wastePercentNum / 100)) * 10) / 10;
  const requiredBoxes = Math.ceil(totalM2WithWaste / 1.44);

  const unitPriceM2Num = Number(editableUnitPriceM2) || 0;
  const tileCost = Math.round(totalM2WithWaste * unitPriceM2Num);

  const adhesiveBagsNum = Number(editableAdhesiveBags) || 0;
  const adhesiveBagPriceNum = Number(editableAdhesiveBagPrice) || 0;
  const adhesiveCost = includeAdhesive ? adhesiveBagsNum * adhesiveBagPriceNum : 0;

  const groutPacksNum = Number(editableGroutPacks) || 0;
  const groutPackPriceNum = Number(editableGroutPackPrice) || 0;
  const groutCost = includeGrout ? groutPacksNum * groutPackPriceNum : 0;

  const laborRateNum = Number(editableLaborRateM2) || 0;
  const laborCost = includeLabor ? Math.round(totalM2WithWaste * laborRateNum) : 0;

  const shippingCostNum = Number(editableShippingCost) || 0;
  const shippingCost = includeShipping ? shippingCostNum : 0;

  const customItemsTotal = customItems.reduce((sum, item) => sum + (Number(item.price) || 0), 0);

  const subtotalBeforeDiscount = tileCost + adhesiveCost + groutCost + laborCost + shippingCost + customItemsTotal;
  const discountAmount = Math.round((subtotalBeforeDiscount * (Number(discountPercent) || 0)) / 100);
  const subtotalAfterDiscount = subtotalBeforeDiscount - discountAmount;
  const vatAmount = Math.round(subtotalAfterDiscount * 0.20);
  const finalGrandTotal = subtotalAfterDiscount + vatAmount;

  const handleAddCustomItem = () => {
    if (!newCustomName || !newCustomPrice) return;
    setCustomItems([...customItems, { name: newCustomName, price: Number(newCustomPrice) || 0 }]);
    setNewCustomName('');
    setNewCustomPrice('');
  };

  const handleRemoveCustomItem = (index) => {
    setCustomItems(customItems.filter((_, i) => i !== index));
  };

  const handleGenerateQuote = (e) => {
    e.preventDefault();
    if (!customerName || !customerPhone) {
      alert('Lütfen Müşteri Adı ve Telefon Numarasını giriniz.');
      return;
    }

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
        unitPriceM2: unitPriceM2Num,
        totalTileM2: totalM2WithWaste,
        netAreaM2: areaM2Num,
        wastePercent: wastePercentNum,
        netTileCost: tileCost,
        includeAdhesive: includeAdhesive,
        adhesiveUnitPriceBag: adhesiveBagPriceNum,
        adhesiveBagsCount: adhesiveBagsNum,
        totalAdhesiveKg: adhesiveBagsNum * 25,
        totalAdhesiveCost: adhesiveCost,
        includeGrout: includeGrout,
        groutUnitPriceKg: groutPackPriceNum,
        totalGroutKg: groutPacksNum * 5,
        totalGroutCost: groutCost,
        laborCost: laborCost,
        shippingCost: shippingCost,
        subtotalBeforeVat: subtotalBeforeDiscount,
        discountPercent: Number(discountPercent) || 0,
        tileDiscountAmount: discountAmount,
        vatRate: 20,
        vatAmount: vatAmount,
        grandTotal: finalGrandTotal,
        customItems: customItems
      },
      notes: notes,
      createdAt: new Date().toISOString(),
      whatsappMessage: encodeURIComponent(
        `Merhaba ${customerName}, SeramikBak Showroom'da hazırladığımız fiyat teklifiniz hazır! Teklif No: ${quoteId}, Tutar: ₺${finalGrandTotal.toLocaleString('tr-TR')} KDV Dahil.`
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
            <h2 className="modal-title">Resmi Fiyat Teklifi Oluştur (Fiyatları Düzenleyin)</h2>
            <p className="modal-sub">
              Tüm m², malzeme, usta ve nakliye kalemlerini müşteri isteğine göre elle düzenleyebilirsiniz.
            </p>
          </div>
        </div>

        <form onSubmit={handleGenerateQuote} className="modal-form-grid">
          {/* Müşteri Bilgileri */}
          <div className="section-title-row">
            <User size={14} className="gold-text" />
            <span>Müşteri & Proje Bilgileri</span>
          </div>

          <div className="inputs-2col">
            <div className="input-group">
              <label className="input-label">Müşteri Adı Soyadı *</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="ör. Zeynep Yılmaz"
                className="modal-input"
              />
            </div>

            <div className="input-group">
              <label className="input-label">Telefon Numarası *</label>
              <input
                type="tel"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="05xx xxx xx xx"
                className="modal-input"
              />
            </div>

            <div className="input-group">
              <label className="input-label">E-Posta (Opsiyonel)</label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="ornek@email.com"
                className="modal-input"
              />
            </div>

            <div className="input-group">
              <label className="input-label">Proje Tanımı</label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="ör. Ebeveyn Banyosu Yenileme"
                className="modal-input"
              />
            </div>
          </div>

          {/* DÜZENLENEBİLİR KALEMLER & FİYATLAR */}
          <div className="section-title-row">
            <Edit3 size={14} className="gold-text" />
            <span>Kalem Kalem Malzeme ve Hizmet Fiyat Düzenleme</span>
          </div>

          <div className="editable-items-box">
            {/* Seramik m² ve Fiyatı */}
            <div className="edit-row">
              <div className="edit-info">
                <strong>Seramik Kaplama ({selectedProduct?.name || 'Karo'})</strong>
                <span className="sub-info">Net: {areaM2Num} m² + %{wastePercentNum} Fire = <strong>{totalM2WithWaste} m²</strong> ({requiredBoxes} Kutu)</span>
              </div>
              <div className="edit-inputs">
                <div className="field">
                  <label>Alan (m²)</label>
                  <input
                    type="number"
                    value={editableAreaM2}
                    onChange={(e) => setEditableAreaM2(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Birim Fiyat (₺/m²)</label>
                  <input
                    type="number"
                    value={editableUnitPriceM2}
                    onChange={(e) => setEditableUnitPriceM2(e.target.value)}
                  />
                </div>
                <div className="field-total">
                  <label>Toplam</label>
                  <span>₺{tileCost.toLocaleString('tr-TR')}</span>
                </div>
              </div>
            </div>

            {/* Yapıştırıcı Harç */}
            <div className="edit-row">
              <div className="edit-info flex-row">
                <input
                  type="checkbox"
                  checked={includeAdhesive}
                  onChange={(e) => setIncludeAdhesive(e.target.checked)}
                />
                <span>Seramik Yapıştırıcı Harç (25kg Torba)</span>
              </div>
              {includeAdhesive && (
                <div className="edit-inputs">
                  <div className="field">
                    <label>Çuval Adet</label>
                    <input
                      type="number"
                      value={editableAdhesiveBags}
                      onChange={(e) => setEditableAdhesiveBags(e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label>Çuval Fiyatı (₺)</label>
                    <input
                      type="number"
                      value={editableAdhesiveBagPrice}
                      onChange={(e) => setEditableAdhesiveBagPrice(e.target.value)}
                    />
                  </div>
                  <div className="field-total">
                    <label>Toplam</label>
                    <span>₺{adhesiveCost.toLocaleString('tr-TR')}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Derz Dolgusu */}
            <div className="edit-row">
              <div className="edit-info flex-row">
                <input
                  type="checkbox"
                  checked={includeGrout}
                  onChange={(e) => setIncludeGrout(e.target.checked)}
                />
                <span>Silikonlu Derz Dolgusu (Kova/Paket)</span>
              </div>
              {includeGrout && (
                <div className="edit-inputs">
                  <div className="field">
                    <label>Paket Adet</label>
                    <input
                      type="number"
                      value={editableGroutPacks}
                      onChange={(e) => setEditableGroutPacks(e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label>Paket Fiyatı (₺)</label>
                    <input
                      type="number"
                      value={editableGroutPackPrice}
                      onChange={(e) => setEditableGroutPackPrice(e.target.value)}
                    />
                  </div>
                  <div className="field-total">
                    <label>Toplam</label>
                    <span>₺{groutCost.toLocaleString('tr-TR')}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Ustalık İşçiliği */}
            <div className="edit-row">
              <div className="edit-info flex-row">
                <input
                  type="checkbox"
                  checked={includeLabor}
                  onChange={(e) => setIncludeLabor(e.target.checked)}
                />
                <span>Garantili Usta İşçiliği</span>
              </div>
              {includeLabor && (
                <div className="edit-inputs">
                  <div className="field">
                    <label>İşçilik (₺/m²)</label>
                    <input
                      type="number"
                      value={editableLaborRateM2}
                      onChange={(e) => setEditableLaborRateM2(e.target.value)}
                    />
                  </div>
                  <div className="field-total" style={{ gridColumn: 'span 2' }}>
                    <label>Toplam Ustalık</label>
                    <span>₺{laborCost.toLocaleString('tr-TR')}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Nakliye */}
            <div className="edit-row">
              <div className="edit-info flex-row">
                <input
                  type="checkbox"
                  checked={includeShipping}
                  onChange={(e) => setIncludeShipping(e.target.checked)}
                />
                <span>Lojistik & Kat Taşıma Bedeli</span>
              </div>
              {includeShipping && (
                <div className="edit-inputs">
                  <div className="field" style={{ gridColumn: 'span 2' }}>
                    <label>Nakliye Tutarı (₺)</label>
                    <input
                      type="number"
                      value={editableShippingCost}
                      onChange={(e) => setEditableShippingCost(e.target.value)}
                    />
                  </div>
                  <div className="field-total">
                    <label>Toplam</label>
                    <span>₺{shippingCost.toLocaleString('tr-TR')}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Ekstra Özel Kalem Ekleme */}
            <div className="custom-items-section">
              <label className="input-label">Ekstra Kalem Ekle (ör. Moloz Kırımı, Duşakabin vb.)</label>
              <div className="add-custom-row">
                <input
                  type="text"
                  placeholder="Hizmet/Ürün Adı"
                  value={newCustomName}
                  onChange={(e) => setNewCustomName(e.target.value)}
                  className="modal-input"
                />
                <input
                  type="number"
                  placeholder="Tutar (₺)"
                  value={newCustomPrice}
                  onChange={(e) => setNewCustomPrice(e.target.value)}
                  className="modal-input short"
                />
                <button type="button" onClick={handleAddCustomItem} className="btn-add-item">
                  <Plus size={16} /> Ekle
                </button>
              </div>

              {customItems.length > 0 && (
                <div className="custom-items-list">
                  {customItems.map((item, idx) => (
                    <div key={idx} className="custom-item-chip">
                      <span>{item.name}: <strong>₺{item.price.toLocaleString('tr-TR')}</strong></span>
                      <button type="button" onClick={() => handleRemoveCustomItem(idx)} className="btn-del">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* İskonto & Notlar */}
          <div className="inputs-2col">
            <div className="input-group">
              <label className="input-label">Özel İskonto Oranı (%)</label>
              <input
                type="number"
                min="0"
                max="50"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
                className="modal-input"
              />
            </div>

            <div className="input-group">
              <label className="input-label">Teklif Notu / Geçerlilik Süresi</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="modal-input"
              />
            </div>
          </div>

          {/* Hesaplama Özeti Kartı */}
          <div className="calc-summary-card">
            <div className="summary-line">
              <span>Ara Toplam (KDV Hariç):</span>
              <span>₺{subtotalBeforeDiscount.toLocaleString('tr-TR')}</span>
            </div>
            {discountAmount > 0 && (
              <div className="summary-line discount">
                <span>İskonto İndirimi (%{discountPercent}):</span>
                <span>-₺{discountAmount.toLocaleString('tr-TR')}</span>
              </div>
            )}
            <div className="summary-line">
              <span>KDV (%20):</span>
              <span>₺{vatAmount.toLocaleString('tr-TR')}</span>
            </div>
            <div className="summary-total-line">
              <span>GENEL TOPLAM (KDV Dahil):</span>
              <span className="gold-text">₺{finalGrandTotal.toLocaleString('tr-TR')}</span>
            </div>
          </div>

          <button type="submit" className="btn-submit-pdf">
            <FileCheck size={18} />
            <span>Resmi PDF Teklifi Oluştur</span>
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
          max-width: 680px;
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
          margin-bottom: 16px;
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
          font-size: 1.1rem;
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

        .section-title-row {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.78rem;
          font-weight: 800;
          color: #fbbf24;
          border-bottom: 1px solid #1e293b;
          padding-bottom: 4px;
          margin-top: 6px;
        }

        .inputs-2col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
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

        .modal-input {
          width: 100%;
          background: #090d16;
          border: 1px solid #1e293b;
          border-radius: 10px;
          padding: 8px 12px;
          font-size: 0.75rem;
          color: #ffffff;
          outline: none;
        }

        .modal-input.short {
          width: 110px;
        }

        .editable-items-box {
          background: #090d16;
          border: 1px solid #1e293b;
          border-radius: 14px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .edit-row {
          display: flex;
          flex-direction: column;
          gap: 6px;
          border-bottom: 1px dashed #1e293b;
          padding-bottom: 8px;
        }

        .edit-row:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .edit-info {
          font-size: 0.75rem;
          color: #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .edit-info.flex-row {
          justify-content: flex-start;
          gap: 8px;
          font-weight: 700;
        }

        .sub-info {
          font-size: 0.68rem;
          color: #94a3b8;
        }

        .edit-inputs {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 8px;
          align-items: center;
          background: rgba(15, 23, 42, 0.6);
          padding: 8px;
          border-radius: 8px;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .field label {
          font-size: 0.62rem;
          color: #64748b;
          font-weight: 700;
        }

        .field input {
          background: #090d16;
          border: 1px solid #334155;
          color: #ffffff;
          border-radius: 6px;
          padding: 4px 8px;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .field-total {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 2px;
        }

        .field-total label {
          font-size: 0.62rem;
          color: #64748b;
          font-weight: 700;
        }

        .field-total span {
          font-size: 0.8rem;
          font-weight: 800;
          color: #fbbf24;
        }

        .custom-items-section {
          margin-top: 4px;
        }

        .add-custom-row {
          display: flex;
          gap: 6px;
          margin-top: 4px;
        }

        .btn-add-item {
          background: #1e293b;
          color: #fbbf24;
          border: 1px solid rgba(245, 158, 11, 0.4);
          padding: 0 12px;
          border-radius: 8px;
          font-size: 0.72rem;
          font-weight: 800;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          white-space: nowrap;
        }

        .custom-items-list {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 8px;
        }

        .custom-item-chip {
          background: rgba(245, 158, 11, 0.12);
          border: 1px solid rgba(245, 158, 11, 0.3);
          color: #e2e8f0;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 0.7rem;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .btn-del {
          background: none;
          border: none;
          color: #ef4444;
          cursor: pointer;
          padding: 0;
        }

        .calc-summary-card {
          background: #090d16;
          border: 1px solid #1e293b;
          border-radius: 14px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 0.75rem;
        }

        .summary-line {
          display: flex;
          justify-content: space-between;
          color: #cbd5e1;
        }

        .summary-line.discount { color: #ef4444; }

        .summary-total-line {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
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
          font-size: 0.85rem;
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
          .edit-inputs {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
