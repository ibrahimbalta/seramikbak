'use client';

import React from 'react';
import { Printer, Share2, CheckCircle, FileText, MapPin, Phone, Mail, Building2 } from 'lucide-react';

export default function QuotePDFTemplate({ quote, onClose }) {
  if (!quote) return null;

  const {
    id,
    dealerName,
    dealerPhone,
    dealerAddress,
    dealerCity,
    dealerLogoUrl,
    brandName,
    customerName,
    customerPhone,
    customerEmail,
    projectName,
    productName,
    productCode,
    productImageUrl,
    calculations,
    notes,
    createdAt,
    expiresAt
  } = quote;

  const handlePrint = () => {
    window.print();
  };

  const whatsappUrl = `https://wa.me/${customerPhone.replace(/[^0-9]/g, '')}?text=${quote.whatsappMessage || ''}`;

  return (
    <div className="quote-pdf-modal-backdrop">
      <div className="quote-pdf-action-bar no-print">
        <div className="flex-left">
          <span className="quote-badge-live">PDF Teklif Hazır</span>
          <span className="quote-id-text">No: {id}</span>
        </div>
        <div className="flex-right">
          <button onClick={handlePrint} className="btn-print">
            <Printer size={16} />
            <span>Yazdır / PDF İndir</span>
          </button>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
            <Share2 size={16} />
            <span>WhatsApp ile Müşteriye Gönder</span>
          </a>
          <button onClick={onClose} className="btn-close-modal">Kapat</button>
        </div>
      </div>

      {/* Printable Corporate A4 Sheet */}
      <div className="quote-a4-sheet" id="printable-quote-sheet">
        {/* Header Header */}
        <header className="sheet-header">
          <div className="dealer-brand-col">
            {dealerLogoUrl ? (
              <img src={dealerLogoUrl} alt={dealerName} className="dealer-logo-img" />
            ) : (
              <div className="dealer-logo-placeholder">
                <Building2 size={24} />
                <span>{dealerName}</span>
              </div>
            )}
            <div className="dealer-info">
              <h3>{dealerName}</h3>
              <p><MapPin size={12} /> {dealerAddress} {dealerCity}</p>
              <p><Phone size={12} /> {dealerPhone} | Yetkili Seramik Bayisi</p>
            </div>
          </div>

          <div className="quote-meta-col">
            <div className="quote-title">RESMİ FİYAT TEKLİFİ</div>
            <div className="meta-row"><strong>Teklif No:</strong> {id}</div>
            <div className="meta-row"><strong>Tarih:</strong> {new Date(createdAt).toLocaleDateString('tr-TR')}</div>
            <div className="meta-row"><strong>Geçerlilik:</strong> {new Date(expiresAt).toLocaleDateString('tr-TR')} (15 Gün)</div>
          </div>
        </header>

        {/* Customer & Project Info */}
        <div className="sheet-section customer-project-grid">
          <div className="info-box">
            <h4>MÜŞTERİ BİLGİLERİ</h4>
            <div className="info-line"><strong>Sayın:</strong> {customerName}</div>
            <div className="info-line"><strong>Telefon:</strong> {customerPhone}</div>
            {customerEmail && <div className="info-line"><strong>E-Posta:</strong> {customerEmail}</div>}
          </div>

          <div className="info-box">
            <h4>PROJE / MEKAN BİLGİLERİ</h4>
            <div className="info-line"><strong>Proje Adı:</strong> {projectName}</div>
            <div className="info-line"><strong>Tedarikçi Marka:</strong> {brandName}</div>
            <div className="info-line"><strong>Garanti Statusu:</strong> %100 Orijinal Fabrika Garantili</div>
          </div>
        </div>

        {/* Itemized Table */}
        <table className="sheet-table">
          <thead>
            <tr>
              <th>Görsel</th>
              <th>Ürün / Hizmet Açıklaması</th>
              <th>Kod / Ebat</th>
              <th>Birim Fiyat</th>
              <th>Metraj / Miktar</th>
              <th className="text-right">Toplam Tutar</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="img-td">
                <img src={productImageUrl} alt={productName} className="table-product-thumb" />
              </td>
              <td>
                <strong>{productName}</strong>
                <div className="sub-text">1. Kalite Seramik Karo / Porselen Kaplama</div>
              </td>
              <td>{productCode}</td>
              <td>₺{calculations.unitPriceM2.toLocaleString('tr-TR')} / m²</td>
              <td>
                {calculations.totalTileM2} m² 
                <div className="sub-text">Net: {calculations.netAreaM2} m² + %{calculations.wastePercent} Fire</div>
              </td>
              <td className="text-right">₺{calculations.netTileCost.toLocaleString('tr-TR')}</td>
            </tr>

            {calculations.includeAdhesive && (
              <tr>
                <td>📦</td>
                <td>
                  <strong>Esnek Seramik Yapıştırıcı Harç (25 kg Torba)</strong>
                  <div className="sub-text">Yüksek yapışma mukavemetli C2TE sınıfı seramik harcı</div>
                </td>
                <td>25 KG / Torba</td>
                <td>₺{calculations.adhesiveUnitPriceBag} / Torba</td>
                <td>{calculations.adhesiveBagsCount} Torba ({calculations.totalAdhesiveKg} kg)</td>
                <td className="text-right">₺{calculations.totalAdhesiveCost.toLocaleString('tr-TR')}</td>
              </tr>
            )}

            {calculations.includeGrout && (
              <tr>
                <td>💧</td>
                <td>
                  <strong>Küf & Su İtici Derz Dolgusu (KG)</strong>
                  <div className="sub-text">Esnek, leke tutmaz antibakteriyel derz</div>
                </td>
                <td>Derz Dolgusu</td>
                <td>₺{calculations.groutUnitPriceKg} / kg</td>
                <td>{calculations.totalGroutKg} kg</td>
                <td className="text-right">₺{calculations.totalGroutCost.toLocaleString('tr-TR')}</td>
              </tr>
            )}

            {calculations.laborCost > 0 && (
              <tr>
                <td>🔨</td>
                <td><strong>Seramik Ustalık & Döşeme İşçiliği</strong></td>
                <td>Ustalık Metrajı</td>
                <td>-</td>
                <td>1 Paket Hizmet</td>
                <td className="text-right">₺{calculations.laborCost.toLocaleString('tr-TR')}</td>
              </tr>
            )}

            {calculations.shippingCost > 0 && (
              <tr>
                <td>🚚</td>
                <td><strong>Güvenli Lojistik & Şantiye Teslimat</strong></td>
                <td>Nakliye / Kat Çıkarma</td>
                <td>-</td>
                <td>Sevk Hizmeti</td>
                <td className="text-right">₺{calculations.shippingCost.toLocaleString('tr-TR')}</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Calculation Summary & Totals */}
        <div className="sheet-summary-row">
          <div className="notes-box">
            <h4>TEKLİF ŞARTLARI & NOTLAR</h4>
            <ul>
              <li>Fiyatlar teklif tarihinden itibaren 15 gün süreyle geçerlidir.</li>
              <li>Seramik kırılarak kırılması önleyici paletli teslimat yapılır.</li>
              <li>Derz ve yapıştırıcı sarfiyatları standart şantiye şartlarına göre hesaplanmıştır.</li>
            </ul>
            {notes && <div className="custom-note"><strong>Özel Not:</strong> {notes}</div>}
          </div>

          <div className="totals-box">
            <div className="total-line">
              <span>Ara Toplam:</span>
              <strong>₺{calculations.subtotalBeforeVat.toLocaleString('tr-TR')}</strong>
            </div>
            {calculations.tileDiscountAmount > 0 && (
              <div className="total-line discount">
                <span>İskonto İndirimi (%{calculations.discountPercent}):</span>
                <strong>-₺{calculations.tileDiscountAmount.toLocaleString('tr-TR')}</strong>
              </div>
            )}
            <div className="total-line">
              <span>KDV (%{calculations.vatRate}):</span>
              <strong>₺{calculations.vatAmount.toLocaleString('tr-TR')}</strong>
            </div>
            <div className="grand-total-line">
              <span>GENEL TOPLAM:</span>
              <strong>₺{calculations.grandTotal.toLocaleString('tr-TR')}</strong>
            </div>
          </div>
        </div>

        {/* Stamp & Signature Footer */}
        <footer className="sheet-footer">
          <div className="sig-col">
            <span>Teklifi Hazırlayan Bayi Yetkilisi</span>
            <div className="sig-line">{dealerName} / İmza - Kaşe</div>
          </div>
          <div className="sig-col">
            <span>Müşteri Onayı</span>
            <div className="sig-line">Okudum, Onaylıyorum / İmza</div>
          </div>
        </footer>
      </div>

      <style jsx>{`
        .quote-pdf-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(6px);
          display: flex;
          flex-direction: column;
          align-items: center;
          overflow-y: auto;
          padding: 20px 10px;
        }

        .quote-pdf-action-bar {
          width: 100%;
          max-width: 850px;
          background: #ffffff;
          border-radius: 12px;
          padding: 12px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.15);
        }

        .flex-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .quote-badge-live {
          background: rgba(5, 150, 105, 0.1);
          color: #059669;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .quote-id-text {
          font-size: 0.82rem;
          font-weight: 700;
          color: #334155;
        }

        .flex-right {
          display: flex;
          gap: 10px;
        }

        .btn-print {
          background: #0f172a;
          color: #ffffff;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
        }

        .btn-whatsapp {
          background: #25d366;
          color: #ffffff;
          text-decoration: none;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .btn-close-modal {
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          color: #475569;
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 0.8rem;
          cursor: pointer;
        }

        /* Printable A4 Sheet Styles */
        .quote-a4-sheet {
          width: 100%;
          max-width: 850px;
          min-height: auto;
          background: #ffffff;
          padding: 32px;
          border-radius: 12px;
          box-shadow: 0 15px 40px rgba(0,0,0,0.2);
          color: #1e293b;
          font-family: 'Plus Jakarta Sans', sans-serif;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .sheet-header {
          display: flex;
          justify-content: space-between;
          border-bottom: 2px solid var(--accent-gold, #b38e47);
          padding-bottom: 16px;
        }

        .dealer-brand-col {
          display: flex;
          gap: 16px;
          align-items: center;
        }

        .dealer-logo-img {
          height: 55px;
          max-width: 140px;
          object-fit: contain;
        }

        .dealer-logo-placeholder {
          width: 48px;
          height: 48px;
          background: rgba(179, 142, 71, 0.1);
          color: var(--accent-gold, #b38e47);
          border-radius: 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-size: 0.6rem;
          font-weight: 800;
        }

        .dealer-info h3 {
          margin: 0 0 4px 0;
          font-size: 1.05rem;
          font-weight: 800;
        }

        .dealer-info p {
          margin: 2px 0;
          font-size: 0.74rem;
          color: #64748b;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .quote-meta-col {
          text-align: right;
        }

        .quote-title {
          font-size: 1.15rem;
          font-weight: 900;
          color: var(--accent-gold, #b38e47);
          letter-spacing: 0.05em;
          margin-bottom: 6px;
        }

        .meta-row {
          font-size: 0.76rem;
          color: #475569;
          margin-top: 2px;
        }

        .customer-project-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .info-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 14px;
          border-radius: 8px;
        }

        .info-box h4 {
          margin: 0 0 8px 0;
          font-size: 0.73rem;
          font-weight: 800;
          color: #64748b;
          letter-spacing: 0.05em;
        }

        .info-line {
          font-size: 0.8rem;
          margin-bottom: 4px;
        }

        .sheet-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.78rem;
        }

        .sheet-table th {
          background: #f1f5f9;
          color: #475569;
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
          padding: 8px 10px;
          text-align: left;
          border-bottom: 2px solid #cbd5e1;
        }

        .sheet-table td {
          padding: 10px;
          border-bottom: 1px solid #e2e8f0;
        }

        .img-td {
          width: 44px;
        }

        .table-product-thumb {
          width: 40px;
          height: 40px;
          object-fit: cover;
          border-radius: 6px;
        }

        .sub-text {
          font-size: 0.68rem;
          color: #64748b;
          margin-top: 2px;
        }

        .text-right {
          text-align: right;
        }

        .sheet-summary-row {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 16px;
          align-items: start;
        }

        .notes-box h4 {
          margin: 0 0 6px 0;
          font-size: 0.73rem;
          font-weight: 800;
          color: #64748b;
        }

        .notes-box ul {
          padding-left: 16px;
          font-size: 0.72rem;
          color: #64748b;
          line-height: 1.4;
          margin: 0;
        }

        .custom-note {
          margin-top: 8px;
          padding: 8px;
          background: #fffbe0;
          border-radius: 6px;
          font-size: 0.74rem;
        }

        .totals-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 14px;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .total-line {
          display: flex;
          justify-content: space-between;
          font-size: 0.78rem;
          color: #475569;
        }

        .total-line.discount {
          color: #dc2626;
        }

        .grand-total-line {
          display: flex;
          justify-content: space-between;
          font-size: 1rem;
          font-weight: 900;
          color: #0f172a;
          border-top: 2px solid #cbd5e1;
          padding-top: 6px;
          margin-top: 4px;
        }

        .sheet-footer {
          margin-top: 10px;
          display: flex;
          justify-content: space-between;
          border-top: 1px dashed #cbd5e1;
          padding-top: 20px;
        }

        .sig-col {
          display: flex;
          flex-direction: column;
          gap: 24px;
          font-size: 0.73rem;
          color: #64748b;
          width: 200px;
        }

        .sig-line {
          border-top: 1px solid #94a3b8;
          padding-top: 4px;
          font-weight: 700;
          color: #1e293b;
        }

        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm;
          }

          html, body {
            background: #ffffff !important;
            color: #000000 !important;
            height: auto !important;
            overflow: visible !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          /* Hide non-printable UI components */
          .no-print,
          nav,
          aside,
          .dealer-portal-layout,
          .dealer-main-content,
          header:not(.sheet-header),
          footer:not(.sheet-footer) {
            display: none !important;
          }

          .quote-pdf-modal-backdrop {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            width: 100% !important;
            height: auto !important;
            background: #ffffff !important;
            backdrop-filter: none !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
            z-index: 999999 !important;
          }

          .quote-a4-sheet {
            box-shadow: none !important;
            max-width: 100% !important;
            width: 100% !important;
            min-height: auto !important;
            height: auto !important;
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
            border-radius: 0 !important;
            background: #ffffff !important;
            color: #1e293b !important;
            gap: 16px !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          .sheet-header {
            padding-bottom: 12px !important;
            border-bottom: 2px solid #b38e47 !important;
          }

          .customer-project-grid {
            gap: 12px !important;
          }

          .info-box {
            padding: 10px 14px !important;
            background: #f8fafc !important;
            border: 1px solid #e2e8f0 !important;
          }

          .sheet-table th {
            background: #f1f5f9 !important;
            padding: 8px 10px !important;
          }

          .sheet-table td {
            padding: 8px 10px !important;
          }

          .table-product-thumb {
            width: 36px !important;
            height: 36px !important;
          }

          .sheet-summary-row {
            gap: 12px !important;
          }

          .totals-box {
            padding: 10px 14px !important;
            background: #f8fafc !important;
          }

          .sheet-footer {
            margin-top: 16px !important;
            padding-top: 16px !important;
          }
        }
      `}</style>
    </div>
  );
}
