async function main() {
  const url = 'https://www.hititseramik.com.tr/urunler/nexos/nexos-antrasit-60x120/';
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const text = await res.text();
    console.log('Detail page length:', text.length);
    
    const lines = text.split('\n');
    console.log('Searching for images and specs...');
    let found = 0;
    lines.forEach((line, idx) => {
      // Look for title, h1, specs, images
      if (line.includes('<h1>') || line.includes('<h2>') || line.includes('<img') || line.includes('class="detail') || line.includes('ebat') || line.includes('renk') || line.includes('kullanim') || line.includes('yüzey') || line.includes('yuzey')) {
        if (found < 50) {
          console.log(`Line ${idx+1}: ${line.trim()}`);
          found++;
        }
      }
    });
  } catch (err) {
    console.error('Error:', err.message);
  }
}
main();
