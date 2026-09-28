import test from 'node:test';
import assert from 'node:assert/strict';

test('Brand Enterprise Portal - Export RFQ & Container Logic', async (t) => {
  await t.test('should calculate required 20ft and 40ft containers correctly', () => {
    const calculateContainers = (m2, tileThicknessMm = 9) => {
      const kgPerM2 = tileThicknessMm * 2.22;
      const totalWeightKg = m2 * kgPerM2;
      const containerCapacity20FtKg = 25000;
      const containerCapacity40FtKg = 27000;
      
      const count20Ft = Math.ceil(totalWeightKg / containerCapacity20FtKg);
      const count40Ft = Math.ceil(totalWeightKg / containerCapacity40FtKg);
      
      return { totalWeightKg, count20Ft, count40Ft };
    };

    const res = calculateContainers(5600, 9);
    assert.strictEqual(res.totalWeightKg, 111888);
    assert.strictEqual(res.count20Ft, 5);
    assert.strictEqual(res.count40Ft, 5);
  });

  await t.test('should calculate proforma FOB and CIF totals with freight/insurance correctly', () => {
    const calculateProforma = (m2, unitPriceEur, term, freightEur = 0, insuranceEur = 0) => {
      const subtotal = m2 * unitPriceEur;
      if (term === 'FOB') {
        return { subtotal, totalEur: subtotal };
      }
      return { subtotal, totalEur: subtotal + freightEur + insuranceEur };
    };

    const fob = calculateProforma(10000, 14.5, 'FOB');
    assert.strictEqual(fob.subtotal, 145000);
    assert.strictEqual(fob.totalEur, 145000);

    const cif = calculateProforma(10000, 14.5, 'CIF', 4200, 850);
    assert.strictEqual(cif.subtotal, 145000);
    assert.strictEqual(cif.totalEur, 150050);
  });
});

test('Brand Enterprise Portal - Architectural Spec-In Pipeline', async (t) => {
  await t.test('should aggregate pipeline total m2 and financial valuation correctly', () => {
    const leads = [
      { estimatedM2: 12500, unitPriceTl: 520, status: 'SPEC_IN' },
      { estimatedM2: 8400, unitPriceTl: 460, status: 'SAMPLE_SENT' },
      { estimatedM2: 3800, unitPriceTl: 390, status: 'CONTACTED' },
      { estimatedM2: 5200, unitPriceTl: 580, status: 'NEW' }
    ];

    const totalM2 = leads.reduce((sum, item) => sum + item.estimatedM2, 0);
    const totalPipelineTl = leads.reduce((sum, item) => sum + (item.estimatedM2 * item.unitPriceTl), 0);

    assert.strictEqual(totalM2, 29900);
    assert.strictEqual(totalPipelineTl, 14862000);
  });

  await t.test('should filter leads by status correctly', () => {
    const leads = [
      { id: '1', status: 'SPEC_IN' },
      { id: '2', status: 'SAMPLE_SENT' },
      { id: '3', status: 'NEW' },
      { id: '4', status: 'SPEC_IN' }
    ];

    const filterLeads = (list, filter) => {
      if (!filter || filter === 'ALL') return list;
      return list.filter(l => l.status === filter);
    };

    assert.strictEqual(filterLeads(leads, 'ALL').length, 4);
    assert.strictEqual(filterLeads(leads, 'SPEC_IN').length, 2);
    assert.strictEqual(filterLeads(leads, 'SAMPLE_SENT').length, 1);
  });
});

test('Brand Enterprise Portal - White-Label Embed SDK Generator', async (t) => {
  await t.test('should generate valid iframe HTML with brand parameters and secure attributes', () => {
    const generateEmbedCode = (brandSlug, primaryColor = '#d4af37', hideHeader = true) => {
      const origin = 'https://www.seramikbak.com';
      const url = `${origin}/embed/visualizer?brand=${encodeURIComponent(brandSlug)}&primary=${encodeURIComponent(primaryColor)}&no_nav=${hideHeader ? 1 : 0}`;
      return `<iframe src="${url}" width="100%" height="800" style="border:none; border-radius:12px; box-shadow:0 10px 30px rgba(0,0,0,0.15);" allow="fullscreen; xr-spatial-tracking" loading="lazy"></iframe>`;
    };

    const snippet = generateEmbedCode('vitra', '#000000', true);
    assert.ok(snippet.includes('src="https://www.seramikbak.com/embed/visualizer?brand=vitra&primary=%23000000&no_nav=1"'));
    assert.ok(snippet.includes('allow="fullscreen; xr-spatial-tracking"'));
    assert.ok(snippet.includes('loading="lazy"'));
  });
});
