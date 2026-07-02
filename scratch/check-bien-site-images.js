const fs = require('fs');

async function checkBienSite() {
  try {
    const res = await fetch('https://www.bienseramik.com.tr/karolar/tum-karolar', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const html = await res.text();
    fs.writeFileSync('scratch/bien_page.html', html, 'utf8');
    
    const regex = /<img[^>]+src="([^"]+)"/gi;
    let match;
    const matches = [];
    while ((match = regex.exec(html)) !== null) {
      matches.push(match[1]);
    }
    
    console.log('Total img src attributes found:', matches.length);
    console.log('Sample images from Bien website:');
    matches.slice(0, 20).forEach(img => console.log('  ' + img));
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}
checkBienSite();
