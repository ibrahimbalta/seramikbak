const http = require('http');

const BASE_URL = 'http://localhost:3005';

function fetchUrl(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const reqOptions = {
      method: options.method || 'GET',
      headers: options.headers || {},
    };

    const req = http.request(url, reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', (err) => reject(err));

    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('===========================================================');
  console.log('SERAMİKBAK OTOMATİZE CANLIYA GEÇİŞ TEST SÜİTİ (PRE-LIVE QA)');
  console.log(`Hedef Sunucu: ${BASE_URL}`);
  console.log('===========================================================\n');

  let passed = 0;
  let failed = 0;

  async function assert(description, testFn) {
    process.stdout.write(`[TEST] ${description} ... `);
    try {
      await testFn();
      console.log('✅ BAŞARILI');
      passed++;
    } catch (err) {
      console.log(`❌ BAŞARISIZ (${err.message})`);
      failed++;
    }
  }

  // --- 1. SEO & STATİK SAYFA KONTROLLERİ ---
  console.log('--- 1. SEO VE STATİK SAYFA TESTLERİ ---');
  await assert('Ana Sayfa (GET /) 200 OK vermeli', async () => {
    const res = await fetchUrl('/');
    if (res.status !== 200) throw new Error(`Status: ${res.status}`);
  });

  await assert('Bayiler Sayfası (GET /bayiler) 200 OK vermeli', async () => {
    const res = await fetchUrl('/bayiler');
    if (res.status !== 200) throw new Error(`Status: ${res.status}`);
  });

  await assert('Ustalar Sayfası (GET /ustalar) 200 OK vermeli', async () => {
    const res = await fetchUrl('/ustalar');
    if (res.status !== 200) throw new Error(`Status: ${res.status}`);
  });

  await assert('Sitemap XML (GET /sitemap.xml) 200 OK ve XML dönmeli', async () => {
    const res = await fetchUrl('/sitemap.xml');
    if (res.status !== 200) throw new Error(`Status: ${res.status}`);
    if (!res.body.includes('xml')) throw new Error('XML içeriği bulunamadı');
  });

  await assert('Robots TXT (GET /robots.txt) 200 OK ve User-agent içermeli', async () => {
    const res = await fetchUrl('/robots.txt');
    if (res.status !== 200) throw new Error(`Status: ${res.status}`);
    if (!res.body.toLowerCase().includes('user-agent')) throw new Error('Robots içeriği eksik');
  });

  await assert('Olmayan Sayfa (GET /sayfa-bulunamadi-xyz) 404 dönmeli', async () => {
    const res = await fetchUrl('/sayfa-bulunamadi-xyz');
    if (res.status !== 404) throw new Error(`Status: ${res.status}`);
  });


  // --- 2. PUBLIC API VE FORMLARIN DOĞRULANMASI ---
  console.log('\n--- 2. PUBLIC API VE FORMLARIN DOĞRULANMASI ---');
  await assert('Arama API (GET /api/search?q=mat) JSON ve 200 OK dönmeli', async () => {
    const res = await fetchUrl('/api/search?q=mat');
    if (res.status !== 200) throw new Error(`Status: ${res.status}`);
    const json = JSON.parse(res.body);
    if (!Array.isArray(json.products) && !Array.isArray(json)) throw new Error('Geçersiz yanıt yapısı');
  });

  await assert('Yakın Bayiler API Validation (GET /api/dealers/nearest parametresiz) 400 Bad Request dönmeli', async () => {
    const res = await fetchUrl('/api/dealers/nearest');
    if (res.status !== 400) throw new Error(`Status: ${res.status}`);
  });

  await assert('Ustalar API (GET /api/installers) 200 OK dönmeli', async () => {
    const res = await fetchUrl('/api/installers');
    if (res.status !== 200) throw new Error(`Status: ${res.status}`);
  });

  await assert('Markalar API (GET /api/brands) 200 OK dönmeli', async () => {
    const res = await fetchUrl('/api/brands');
    if (res.status !== 200) throw new Error(`Status: ${res.status}`);
  });

  await assert('Canlı Ticker API (GET /api/stats/live-ticker) 200 OK dönmeli', async () => {
    const res = await fetchUrl('/api/stats/live-ticker');
    if (res.status !== 200) throw new Error(`Status: ${res.status}`);
  });

  await assert('İletişim Formu Validation (POST /api/contact eksik alan) 400 Bad Request dönmeli', async () => {
    const res = await fetchUrl('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test' })
    });
    if (res.status !== 400) throw new Error(`Status: ${res.status}`);
  });

  await assert('Numune Karo Talebi Validation (POST /api/sample-orders/create eksik alan) 400 Bad Request dönmeli', async () => {
    const res = await fetchUrl('/api/sample-orders/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientName: 'Ahmet' })
    });
    if (res.status !== 400) throw new Error(`Status: ${res.status}`);
  });


  // --- 3. GÜVENLİK VE ADMIN ENDPOINT DENETİMLERİ ---
  console.log('\n--- 3. GÜVENLİK VE KORUMALI API DENETİMLERİ ---');
  await assert('Admin Ürünler API (GET /api/admin/products) yanıtı kontrol ediliyor', async () => {
    const res = await fetchUrl('/api/admin/products');
    if (res.status !== 200 && res.status !== 401 && res.status !== 403) throw new Error(`Unexpected Status: ${res.status}`);
  });

  await assert('Admin Güvenlik Logları (GET /api/admin/security/logs) yanıtı kontrol ediliyor', async () => {
    const res = await fetchUrl('/api/admin/security/logs');
    if (res.status !== 200 && res.status !== 401 && res.status !== 403) throw new Error(`Unexpected Status: ${res.status}`);
  });

  console.log('\n===========================================================');
  console.log(`TESTLER TAMAMLANDI | Başarılı: ${passed} | Başarısız: ${failed}`);
  console.log('===========================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test koşturulurken beklenmeyen hata:', err);
  process.exit(1);
});
