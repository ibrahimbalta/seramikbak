/**
 * SeramikBak Smart Ceramic & Tile Quote Calculation Engine
 * Calculates net area, waste allowance, adhesive bag count (25kg), grout weight (kg),
 * subtotal, discount, VAT (20%), and grand total.
 */
export function calculateQuote({
  areaM2 = 0,
  wastePercent = 10, // Default 10% cutting waste
  unitPriceM2 = 0,
  discountPercent = 0,
  includeAdhesive = true,
  adhesiveUnitPriceBag = 240, // TRY per 25kg bag
  includeGrout = true,
  groutUnitPriceKg = 45, // TRY per kg
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

  // 3. Adhesive Consumable Calculation (Avg 4.5 kg per m² -> 25kg bags)
  const totalAdhesiveKg = totalTileM2 * 4.5;
  const adhesiveBagsCount = includeAdhesive ? Math.ceil(totalAdhesiveKg / 25) : 0;
  const totalAdhesiveCost = includeAdhesive ? adhesiveBagsCount * parseFloat(adhesiveUnitPriceBag || 0) : 0;

  // 4. Grout Consumable Calculation (Avg 0.45 kg per m²)
  const totalGroutKg = includeGrout ? Math.ceil((totalTileM2 * 0.45) * 10) / 10 : 0;
  const totalGroutCost = includeGrout ? Math.ceil(totalGroutKg * parseFloat(groutUnitPriceKg || 0)) : 0;

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
    adhesiveUnitPriceBag,
    totalAdhesiveCost: Math.round(totalAdhesiveCost * 100) / 100,

    includeGrout,
    totalGroutKg,
    groutUnitPriceKg,
    totalGroutCost: Math.round(totalGroutCost * 100) / 100,

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
