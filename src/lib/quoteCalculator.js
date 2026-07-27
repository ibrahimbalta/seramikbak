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
