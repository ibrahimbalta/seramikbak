import { slugify } from './slugify';

/**
 * SeramikBak Smart Ceramic & Tile Quote Calculation Engine
 * Calculates net area, waste allowance, adhesive bag count (25kg), grout weight (kg),
 * subtotal, discount, VAT (20%), and grand total.
 * 
 * Supports manual override for adhesive bags and grout kg.
 */
export function calculateQuote({
  areaM2 = 0,
  wastePercent = 10, // Default 10% cutting waste
  unitPriceM2 = 0,
  boxM2 = null,
  discountPercent = 0,
  includeAdhesive = true,
  adhesiveUnitPriceBag = 240, // TRY per 25kg bag
  adhesiveManualBags = null,  // null = auto-calculate, number = manual override
  includeGrout = true,
  groutUnitPriceKg = 45, // TRY per kg
  groutManualKg = null,       // null = auto-calculate, number = manual override
  laborCostTotal = 0,
  shippingCostTotal = 0,
  vatRate = 20 // 20% KDV
}) {
  const m2 = Math.max(0, parseFloat(areaM2) || 0);
  const wasteP = Math.max(0, parseFloat(wastePercent) || 0);
  const priceM2 = Math.max(0, parseFloat(unitPriceM2) || 0);
  const discountP = Math.max(0, Math.min(100, parseFloat(discountPercent) || 0));

  // 1. Waste & Net Ceramic Calculation
  const wasteM2 = (m2 * wasteP) / 100;
  const totalTileM2 = Math.ceil((m2 + wasteM2) * 100) / 100;
  const tileBoxesCount = (boxM2 && parseFloat(boxM2) > 0) ? Math.ceil(totalTileM2 / parseFloat(boxM2)) : null;

  // 2. Ceramic Tile Cost before & after discount
  const grossTileCost = totalTileM2 * priceM2;
  const tileDiscountAmount = (grossTileCost * discountP) / 100;
  const netTileCost = grossTileCost - tileDiscountAmount;

  // 3. Adhesive Consumable — manual or auto
  const autoAdhesiveKg = totalTileM2 * 4.5;
  const autoAdhesiveBags = Math.ceil(autoAdhesiveKg / 25);

  const manualBags = adhesiveManualBags !== null && adhesiveManualBags !== '' 
    ? Math.max(0, parseInt(adhesiveManualBags) || 0) 
    : null;
  const adhesiveBagsCount = includeAdhesive 
    ? (manualBags !== null ? manualBags : autoAdhesiveBags) 
    : 0;
  const totalAdhesiveKg = adhesiveBagsCount * 25;
  const totalAdhesiveCost = includeAdhesive 
    ? adhesiveBagsCount * Math.max(0, parseFloat(adhesiveUnitPriceBag) || 0) 
    : 0;

  // 4. Grout Consumable — manual or auto
  const autoGroutKg = Math.ceil((totalTileM2 * 0.45) * 10) / 10;

  const manualGrout = groutManualKg !== null && groutManualKg !== '' 
    ? Math.max(0, parseFloat(groutManualKg) || 0) 
    : null;
  const totalGroutKg = includeGrout 
    ? (manualGrout !== null ? manualGrout : autoGroutKg) 
    : 0;
  const totalGroutCost = includeGrout 
    ? Math.ceil(totalGroutKg * Math.max(0, parseFloat(groutUnitPriceKg) || 0)) 
    : 0;

  // 5. Labor & Shipping
  const laborCost = Math.max(0, parseFloat(laborCostTotal) || 0);
  const shippingCost = Math.max(0, parseFloat(shippingCostTotal) || 0);

  // 6. Subtotal, VAT & Grand Total
  const subtotalBeforeVat = netTileCost + totalAdhesiveCost + totalGroutCost + laborCost + shippingCost;
  const vatAmount = (subtotalBeforeVat * vatRate) / 100;
  const grandTotal = subtotalBeforeVat + vatAmount;

  return {
    netAreaM2: m2,
    wastePercent: wasteP,
    wasteM2: Math.round(wasteM2 * 100) / 100,
    totalTileM2,
    boxM2: boxM2 ? parseFloat(boxM2) : null,
    tileBoxesCount,
    unitPriceM2: priceM2,
    discountPercent: discountP,
    grossTileCost: Math.round(grossTileCost * 100) / 100,
    tileDiscountAmount: Math.round(tileDiscountAmount * 100) / 100,
    netTileCost: Math.round(netTileCost * 100) / 100,
    
    // Consumables
    includeAdhesive,
    totalAdhesiveKg: Math.round(totalAdhesiveKg * 10) / 10,
    adhesiveBagsCount,
    adhesiveUnitPriceBag: parseFloat(adhesiveUnitPriceBag) || 0,
    totalAdhesiveCost: Math.round(totalAdhesiveCost * 100) / 100,
    autoAdhesiveBags,

    includeGrout,
    totalGroutKg,
    groutUnitPriceKg: parseFloat(groutUnitPriceKg) || 0,
    totalGroutCost: Math.round(totalGroutCost * 100) / 100,
    autoGroutKg,

    // Services
    laborCost,
    shippingCost,

    // Totals
    subtotalBeforeVat: Math.round(subtotalBeforeVat * 100) / 100,
    vatRate,
    vatAmount: Math.round(vatAmount * 100) / 100,
    grandTotal: Math.round(grandTotal * 100) / 100
  };
}

/**
 * Format a luxury, corporate-grade WhatsApp quotation text
 * without problematic multi-byte emojis or broken question marks.
 */
export function formatQuoteWhatsAppText(quote, dealerInfo = {}) {
  const calc = quote.calculations || calculateQuote({
    areaM2: quote.areaM2,
    wastePercent: quote.wastePercent,
    unitPriceM2: quote.unitPriceM2,
    boxM2: quote.boxM2,
    discountPercent: quote.discountPercent,
    includeAdhesive: quote.includeAdhesive,
    adhesiveUnitPriceBag: quote.adhesiveUnitPriceBag,
    adhesiveManualBags: quote.adhesiveManualBags,
    includeGrout: quote.includeGrout,
    groutUnitPriceKg: quote.groutUnitPriceKg,
    groutManualKg: quote.groutManualKg,
    laborCostTotal: quote.laborCostTotal !== undefined ? quote.laborCostTotal : quote.laborCost,
    shippingCostTotal: quote.shippingCostTotal !== undefined ? quote.shippingCostTotal : quote.shippingCost
  });

  const dealerName = dealerInfo?.name || quote.dealerName || 'Yetkili Seramik Bayisi';
  const district = dealerInfo?.district || quote.dealerDistrict || '';
  const city = dealerInfo?.city || quote.dealerCity || '';
  const locationParts = [district, city].filter(Boolean);
  const locationStr = locationParts.length > 0 ? `(${locationParts.join(', ')})` : '';

  const custName = (quote.customerName || 'Değerli Müşterimiz').trim();
  const prodName = quote.productName || 'Seramik Porselen Karo';
  const prodCode = quote.productCode || '';
  const projectName = quote.projectName || '';
  const dealerSlug = dealerInfo?.slug || quote.dealerSlug || (dealerName ? slugify(dealerName) : '');

  let studioUrl = '';
  if (prodCode) {
    const params = new URLSearchParams();
    params.set('code', prodCode);
    params.set('tab', 'studio');
    if (dealerSlug) params.set('dealer', dealerSlug);
    studioUrl = `https://www.seramikbak.com/?${params.toString()}`;
  }

  // Box calculation: show only if numeric and positive
  let boxInfo = '';
  const boxes = quote.tileBoxesCount || calc.tileBoxesCount || quote.boxCount || (quote.boxM2 ? Math.ceil(calc.totalTileM2 / parseFloat(quote.boxM2)) : null);
  if (boxes && Number(boxes) > 0) {
    boxInfo = ` (${boxes} Kutu)`;
  }

  const lines = [
    `*RESMİ FİYAT TEKLİFİ*`,
    `*${dealerName}* ${locationStr}`.trim(),
    `─────────────────────────────`,
    ``,
    `Sayın *${custName}*,`,
    `Mağazamızı ziyaret ettiğiniz için teşekkür ederiz. ${projectName ? `*${projectName}* projeniz` : 'Projeniz'} için hazırlanan resmi fiyat teklifi detayları aşağıda bilginize sunulmuştur:`,
    ``,
    `*TEKLİF DETAYLARI*`,
    `• Seçilen Model: ${prodName}`,
    prodCode ? `• Model Kodu: ${prodCode}` : null,
    `• Net Uygulama Alanı: ${calc.netAreaM2} m² (+%${calc.wastePercent} fire payı)`,
    `• Toplam Sipariş Metrajı: ${calc.totalTileM2} m²${boxInfo}`,
    calc.includeAdhesive ? `• Yapıştırıcı Harç: ${calc.adhesiveBagsCount} Torba (${calc.totalAdhesiveKg} kg)` : null,
    calc.includeGrout ? `• Derz Dolgusu: ${calc.totalGroutKg} kg` : null,
    Number(calc.laborCost) > 0 ? `• Uygulama & İşçilik: ₺${Number(calc.laborCost).toLocaleString('tr-TR')}` : null,
    Number(calc.shippingCost) > 0 ? `• Lojistik & Nakliye: ₺${Number(calc.shippingCost).toLocaleString('tr-TR')}` : null,
    ``,
    `─────────────────────────────`,
    `*GENEL TOPLAM:* ₺${calc.grandTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} _(KDV Dahil)_`,
    `─────────────────────────────`,
    ``
  ].filter(line => line !== null);

  if (studioUrl) {
    lines.push(
      `*3D Mekan Simülasyonu:*`,
      `Seçtiğiniz modeli mekanınızda 3D ve canlı olarak görüntülemek için:`,
      `${studioUrl}`,
      ``
    );
  }

  if (quote.notes && quote.notes.trim()) {
    lines.push(`*Not:* ${quote.notes.trim()}`, ``);
  }

  lines.push(
    `Teklif detayları, sevkiyat ve sipariş onayı için bu mesaj üzerinden bizimle iletişime geçebilirsiniz.`,
    ``,
    `Saygılarımızla,`,
    `*${dealerName}*`,
    `Yetkili Satış & Showroom Departmanı`
  );

  return lines.join('\n');
}

/**
 * Generates an official WhatsApp API URL that avoids the wa.me shortener encoding bug.
 */
export function getWhatsAppUrl(phone, text) {
  const cleanDigits = (phone || '').toString().replace(/[^\d]/g, '');
  const cleanPhone = cleanDigits.startsWith('0')
    ? '9' + cleanDigits
    : (cleanDigits.startsWith('90') ? cleanDigits : (cleanDigits.length === 10 ? '90' + cleanDigits : cleanDigits));

  const encoded = encodeURIComponent(text || '');
  return cleanPhone
    ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encoded}`
    : `https://api.whatsapp.com/send?text=${encoded}`;
}
