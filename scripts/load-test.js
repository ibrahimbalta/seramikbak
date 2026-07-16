const autocannon = require('autocannon');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3005;
const BASE_URL = `http://localhost:${PORT}`;
const DURATION = 10; // seconds for each run

const SCENARIOS = [
  { name: 'Ana Sayfa (GET /)', url: `${BASE_URL}/` },
  { name: 'Arama API (GET /api/search?q=mat)', url: `${BASE_URL}/api/search?q=mat` }
];

const USER_LEVELS = [10, 50, 250, 1000];

async function runBenchmark(name, url, connections) {
  console.log(`\n[TEST] '${name}' testi başlatılıyor | Eşzamanlı Ziyaretçi: ${connections} | Süre: ${DURATION}s...`);
  
  try {
    const result = await autocannon({
      url,
      connections,
      duration: DURATION,
      pipelining: 1,
      headers: {
        'accept-encoding': 'gzip, deflate, br'
      }
    });

    const avgLatency = result.latency.average; // in ms
    const p99Latency = result.latency.p99;
    const reqsPerSec = result.requests.average;
    const totalRequests = result.requests.sent;
    const errors = result.errors + result.timeouts + result.non2xx;

    console.log(`[SONUÇ] Başarı: ${result.requests.sent - errors} | Hata/Timeouts: ${errors} | Ortalama Gecikme: ${avgLatency.toFixed(2)}ms | Rps: ${reqsPerSec.toFixed(1)}`);
    
    return {
      connections,
      avgLatency: `${avgLatency.toFixed(1)} ms`,
      p99Latency: `${p99Latency.toFixed(1)} ms`,
      reqsPerSec: reqsPerSec.toFixed(1),
      totalRequests,
      errors
    };
  } catch (error) {
    console.error(`[HATA] Test sırasında hata oluştu:`, error.message);
    return {
      connections,
      avgLatency: 'Hata',
      p99Latency: 'Hata',
      reqsPerSec: '0',
      totalRequests: 0,
      errors: connections
    };
  }
}

async function start() {
  console.log('==================================================');
  console.log(`SERAMİKBAK YÜK VE PERFORMANS TESTİ BAŞLIYOR`);
  console.log(`Hedef Port: ${PORT}`);
  console.log(`Süre: Her aşama için ${DURATION} saniye`);
  console.log('==================================================');

  const reportData = [];

  for (const scenario of SCENARIOS) {
    console.log(`\n--------------------------------------------------`);
    console.log(`Senaryo: ${scenario.name}`);
    console.log(`Hedef URL: ${scenario.url}`);
    console.log(`--------------------------------------------------`);
    
    const scenarioResults = [];
    for (const users of USER_LEVELS) {
      const res = await runBenchmark(scenario.name, scenario.url, users);
      scenarioResults.push(res);
    }
    reportData.push({
      scenarioName: scenario.name,
      results: scenarioResults
    });
  }

  // Generate Markdown report
  let markdown = `# SeramikBak Yük Testi Sonuçları\n\n`;
  markdown += `*Test Tarihi: ${new Date().toLocaleString('tr-TR')}*\n`;
  markdown += `*Test Süresi: Her seviye için ${DURATION} saniye*\n\n`;
  markdown += `Bu testler local ortamda SQLite veritabanı ile derlenmiş Next.js prodüksiyon sunucusu üzerinde yapılmıştır.\n\n`;

  for (const item of reportData) {
    markdown += `## Senaryo: ${item.scenarioName}\n\n`;
    markdown += `| Eşzamanlı Kullanıcı (VU) | Ort. Gecikme (Latency) | 99% Gecikme (p99) | İstek / Saniye (RPS) | Toplam İstek | Hata / Başarısız |\n`;
    markdown += `| :---: | :---: | :---: | :---: | :---: | :---: |\n`;
    
    for (const r of item.results) {
      markdown += `| **${r.connections}** | ${r.avgLatency} | ${r.p99Latency} | ${r.reqsPerSec} | ${r.totalRequests} | <span style="color:${r.errors > 0 ? 'red' : 'green'}">${r.errors}</span> |\n`;
    }
    markdown += `\n`;
  }

  // Save report to the artifacts directory
  const artifactDir = 'C:\\Users\\A\\.gemini\\antigravity\\brain\\5f85e9e0-acee-4e64-a11d-7f02c64cd2f0';
  const reportPath = path.join(artifactDir, 'performance_report.md');
  
  try {
    fs.writeFileSync(reportPath, markdown, 'utf8');
    console.log(`\n[OK] Rapor başarıyla kaydedildi: ${reportPath}`);
  } catch (err) {
    // Fallback to local scratch
    console.error('Rapor yazılırken hata oluştu, yerel dizine yazılıyor:', err.message);
    fs.writeFileSync(path.join(__dirname, 'performance_report.md'), markdown, 'utf8');
  }

  console.log('\n==================================================');
  console.log('TESTLER TAMAMLANDI!');
  console.log('==================================================\n');
}

start().catch(console.error);
