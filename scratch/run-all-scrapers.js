const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const scripts = [
  'run-bien-scraper.js',
  'run-ege-scraper.js',
  'run-gural-scraper.js',
  'run-hitit-scraper.js',
  'run-ng-scraper.js',
  'run-qua-scraper.js',
  'run-vitra-scraper.js',
  'run-yurtbay-scraper.js',
  'run-usak-scraper.js',
  'run-termal-scraper.js',
  'import-graniser.js',
  'import-seramiksan.js',
  'import-seranit.js'
];

console.log('======================================================');
console.log('       SERAMİKBAK TOPLU KAZIYICI VE İTHALATÇI         ');
db_url = process.env.TURSO_DATABASE_URL || 'AWS Turso';
console.log(`Hedef Veritabanı: ${db_url}`);
console.log('======================================================\n');

for (const script of scripts) {
  const scriptPath = path.join(__dirname, script);
  if (!fs.existsSync(scriptPath)) {
    console.log(`[Atlandı] ${script} bulunamadı.`);
    continue;
  }
  
  console.log(`\n>>> [ÇALIŞTIRILIYOR] ${script} başlatılıyor...`);
  try {
    // Run child process with inherited stdio to print output live
    execSync(`node "${scriptPath}"`, { 
      stdio: 'inherit',
      env: { ...process.env, NODE_OPTIONS: '--use-system-ca' }
    });
    console.log(`>>> [TAMAMLANDI] ${script} başarıyla tamamlandı.\n`);
  } catch (err) {
    console.error(`>>> [HATA] ${script} çalıştırılırken hata oluştu:`, err.message);
  }
}

console.log('\n======================================================');
console.log(' Tüm kazıma ve içe aktarma işlemleri tamamlandı!      ');
console.log('======================================================');
