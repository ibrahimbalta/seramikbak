/**
 * Antetli Profesyonel Seramik Metraj & Keşif Raporu Yazdırma / PDF İndirme Motoru
 * Harici ağır kütüphanelere bağımlı olmadan ultra hızlı, temiz, mobil ve desktop uyumlu yazdırma çıktısı üretir.
 */
export function exportMetrajReportToPdf({
  projectName = 'Seramik Yenileme & Keşif Projesi',
  clientName = 'Değerli Müşterimiz',
  clientCity = 'İstanbul',
  clientPhone = '',
  products = [],
  calcSummary = null,
  notes = ''
}) {
  if (typeof window === 'undefined') return;

  const dateStr = new Date().toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const reportId = 'SRM-' + Math.floor(100000 + Math.random() * 900000);

  // Ürün kalemleri HTML
  const itemsHtml = products.map((item, index) => {
    const m2 = item.quantityM2 || item.m2 || 25;
    const boxCount = item.boxCount || Math.ceil(m2 / 1.44);
    const estPrice = item.cheapestOffer?.price || item.price || 450;
    const totalEst = m2 * estPrice;

    return `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px; font-weight: 700; color: #475569; text-align: center;">${index + 1}</td>
        <td style="padding: 12px;">
          <div style="font-weight: 800; color: #0f172a; font-size: 14px;">${item.name || 'Seramik Karo'}</div>
          <div style="color: #64748b; font-size: 12px; margin-top: 2px;">
            ${item.brand?.name || item.brand || 'Lider Türk Markası'} • ${item.width || 60}x${item.height || 120} cm • ${item.finish || 'Mat/Parlak'}
            ${item.code ? `• Kod: ${item.code}` : ''}
          </div>
        </td>
        <td style="padding: 12px; text-align: center; font-weight: 800; color: #0f172a;">${m2} m²</td>
        <td style="padding: 12px; text-align: center; color: #334155;">${boxCount} Kutu</td>
        <td style="padding: 12px; text-align: right; color: #64748b; font-size: 13px;">₺${estPrice.toLocaleString('tr-TR')} / m²</td>
        <td style="padding: 12px; text-align: right; font-weight: 800; color: #b38e47; font-size: 14px;">₺${totalEst.toLocaleString('tr-TR')}</td>
      </tr>
    `;
  }).join('');

  // Yardımcı malzeme özeti (Yapıştırıcı, Derz vb.)
  let materialsSummaryHtml = '';
  if (calcSummary) {
    materialsSummaryHtml = `
      <div style="margin-top: 24px; padding: 16px; background: #f8fafc; border: 1px solid #e2e8f0; borderRadius: 12px;">
        <h4 style="margin: 0 0 10px 0; font-size: 13px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.05em;">
          🏗️ Tahmini Sarf Malzeme & Usta İhtiyacı
        </h4>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; font-size: 12px;">
          <div>
            <span style="color: #64748b;">Seramik Yapıştırıcı (25kg):</span>
            <strong style="color: #0f172a; display: block; font-size: 14px; margin-top: 2px;">${calcSummary.adhesiveBags || 4} Torba</strong>
          </div>
          <div>
            <span style="color: #64748b;">Antibakteriyel Derz Dolgu (5kg):</span>
            <strong style="color: #0f172a; display: block; font-size: 14px; margin-top: 2px;">${calcSummary.groutBags || 2} Paket</strong>
          </div>
          <div>
            <span style="color: #64748b;">Tavsiye Edilen Fire Oranı:</span>
            <strong style="color: #0f172a; display: block; font-size: 14px; margin-top: 2px;">%${calcSummary.wastagePercent || 10} Güvenlik Payı</strong>
          </div>
        </div>
      </div>
    `;
  }

  const printHtml = `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="utf-8" />
      <title>SeramikBak - Malzeme & Keşif Raporu (${reportId})</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 15mm;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: #0f172a;
          background: #ffffff;
          margin: 0;
          padding: 20px;
          line-height: 1.5;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
        }
        th {
          background: #f1f5f9;
          color: #475569;
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 10px 12px;
        }
        @media print {
          body {
            padding: 0;
          }
          .no-print {
            display: none !important;
          }
        }
      </style>
    </head>
    <body>
      <!-- Top Action Bar (Ekranda görünür, yazdırmada gizlenir) -->
      <div class="no-print" style="margin-bottom: 20px; padding: 12px 16px; background: #0f172a; color: #fff; border-radius: 10px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <strong>SeramikBak Resmi Keşif & Metraj Belgesi</strong> • Yazdırmaya veya PDF olarak kaydetmeye hazır
        </div>
        <button onclick="window.print()" style="padding: 8px 18px; background: #b38e47; color: #fff; font-weight: 800; border: none; border-radius: 6px; cursor: pointer; font-size: 13px;">
          🖨️ PDF İndir / Yazdır
        </button>
      </div>

      <!-- Antet Header -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #b38e47; padding-bottom: 16px;">
        <div>
          <div style="font-size: 24px; font-weight: 900; color: #0f172a; letter-spacing: -0.02em;">
            Seramik<span style="color: #b38e47;">Bak</span>
          </div>
          <div style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 2px;">
            Türkiye'nin Seramik Arama Motoru & Yetkili Bayi Ağı
          </div>
          <div style="font-size: 12px; color: #475569; margin-top: 6px;">
            🌐 www.seramikbak.com • ✉️ teklif@seramikbak.com
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 13px; font-weight: 800; color: #b38e47; background: #fdf8ef; padding: 4px 10px; border-radius: 6px; display: inline-block;">
            KEŞİF & METRAJ FORMU
          </div>
          <div style="font-size: 12px; color: #64748b; margin-top: 6px;">Rapor No: <strong>${reportId}</strong></div>
          <div style="font-size: 12px; color: #64748b;">Tarih: <strong>${dateStr}</strong></div>
        </div>
      </div>

      <!-- Proje & Müşteri Bilgileri -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px; padding: 14px 16px; background: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0; font-size: 13px;">
        <div>
          <div style="color: #64748b; font-size: 11px; text-transform: uppercase; font-weight: 700;">Müşteri / Talep Sahibi</div>
          <div style="font-weight: 800; color: #0f172a; font-size: 14px; margin-top: 2px;">${clientName}</div>
          ${clientPhone ? `<div style="color: #475569; margin-top: 2px;">📞 ${clientPhone}</div>` : ''}
          <div style="color: #475569; margin-top: 2px;">📍 Bölge / Şehir: <strong>${clientCity}</strong></div>
        </div>
        <div>
          <div style="color: #64748b; font-size: 11px; text-transform: uppercase; font-weight: 700;">Proje & Uygulama Alanı</div>
          <div style="font-weight: 800; color: #0f172a; font-size: 14px; margin-top: 2px;">${projectName}</div>
          <div style="color: #475569; margin-top: 2px;">Tedarikçi Kapsamı: <strong>81 İl Yetkili Marka Bayileri</strong></div>
        </div>
      </div>

      <!-- Seçilen Seramikler Tablosu -->
      <table style="margin-top: 20px;">
        <thead>
          <tr>
            <th style="width: 40px; text-align: center;">#</th>
            <th style="text-align: left;">Seramik Modeli & Ebat</th>
            <th style="text-align: center; width: 80px;">Net Alan</th>
            <th style="text-align: center; width: 90px;">Tahmini Kutu</th>
            <th style="text-align: right; width: 110px;">Birim Fiyat</th>
            <th style="text-align: right; width: 120px;">Toplam Tutar</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml || '<tr><td colspan="6" style="padding: 20px; text-align: center; color: #94a3b8;">Henüz ürün seçilmedi.</td></tr>'}
        </tbody>
      </table>

      ${materialsSummaryHtml}

      ${notes ? `
        <div style="margin-top: 16px; padding: 12px 16px; border-left: 3px solid #b38e47; background: #fffcf7; font-size: 12px; color: #475569;">
          <strong>Müşteri / Uygulama Notu:</strong> ${notes}
        </div>
      ` : ''}

      <!-- Alt Yasal & Bilgilendirme Dipnotu -->
      <div style="margin-top: 30px; border-top: 1px dashed #cbd5e1; padding-top: 14px; font-size: 11px; color: #64748b; line-height: 1.6;">
        <p style="margin: 0 0 4px 0;"><strong>Bilgilendirme ve Geçerlilik:</strong></p>
        <p style="margin: 0;">
          1. Bu rapor SeramikBak akıllı metraj motoru tarafından hesaplanmış tavsiye niteliğinde keşif özetidir.
          2. Kesin fire oranı oda mimarisine (köşe sayısı, niş, kolonlar) göre usta kontrolünde değişebilir.
          3. İlgili modelleri en yakın yetkili bayiden temin etmek ve nakliye teklifi almak için rapor kodunuzla <strong>www.seramikbak.com</strong> üzerinden başvurabilirsiniz.
        </p>
      </div>

      <!-- Barkod / QR Bilgisi -->
      <div style="margin-top: 20px; display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #94a3b8;">
        <div>SeramikBak B2B/B2C Dijital Satınalma & Keşif Sistemi</div>
        <div>Doğrulama Kodu: ${reportId}</div>
      </div>

      <script>
        // Sayfa açıldığında doğrudan yazdırma penceresini tetikle
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 300);
        };
      </script>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank', 'width=850,height=900');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(printHtml);
    printWindow.document.close();
  }
}
