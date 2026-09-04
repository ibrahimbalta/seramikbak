import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateQuote } from '../src/lib/quoteCalculator.js';

test('Quote Calculator - Tile Metraj & Price Estimation Engine', async (t) => {
  await t.test('should calculate tile quantity with 10% cutting waste correctly', () => {
    const result = calculateQuote({
      areaM2: 50,
      wastePercent: 10,
      unitPriceM2: 500,
      includeAdhesive: false,
      includeGrout: false
    });

    assert.equal(result.netAreaM2, 50);
    assert.equal(result.wasteM2, 5);
    assert.equal(result.totalTileM2, 55);
    assert.equal(result.grossTileCost, 27500); // 55 * 500
    assert.equal(result.subtotalBeforeVat, 27500);
    assert.equal(result.vatAmount, 5500); // 20% of 27500
    assert.equal(result.grandTotal, 33000); // 27500 + 5500
  });

  await t.test('should calculate adhesive bags (25kg) and grout weight correctly', () => {
    const result = calculateQuote({
      areaM2: 100,
      wastePercent: 10,
      unitPriceM2: 400,
      includeAdhesive: true,
      adhesiveUnitPriceBag: 200,
      includeGrout: true,
      groutUnitPriceKg: 40
    });

    // Total tiles = 110 m2
    // Adhesive = 110 * 4.5 = 495 kg -> Math.ceil(495 / 25) = 20 bags
    assert.equal(result.autoAdhesiveBags, 20);
    assert.equal(result.adhesiveBagsCount, 20);
    assert.equal(result.totalAdhesiveCost, 4000); // 20 bags * 200 TL
  });

  await t.test('should apply discount and handle manual overrides', () => {
    const result = calculateQuote({
      areaM2: 50,
      wastePercent: 0,
      unitPriceM2: 1000,
      discountPercent: 10, // 10% discount
      includeAdhesive: true,
      adhesiveManualBags: 5, // Manual override: 5 bags
      adhesiveUnitPriceBag: 200,
      includeGrout: false,
      vatRate: 20
    });

    assert.equal(result.netTileCost, 45000); // 50000 - 5000
    assert.equal(result.adhesiveBagsCount, 5);
    assert.equal(result.totalAdhesiveCost, 1000); // 5 * 200
    assert.equal(result.subtotalBeforeVat, 46000);
    assert.equal(result.grandTotal, 55200); // 46000 * 1.2
  });
});
