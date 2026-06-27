async function main() {
  const url = 'https://www.guralseramik.com/marble/aleats';
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const text = await res.text();
    console.log('Detail page length:', text.length);
    
    // Look for image sources or product info
    // Print lines around typical image paths
    const lines = text.split('\n');
    console.log('Searching for images and specs...');
    let found = 0;
    lines.forEach((line, idx) => {
      if (line.includes('.jpg') || line.includes('.png') || line.includes('class="ebat"') || line.includes('class="size"') || line.includes('class="title"') || line.includes('class="name"')) {
        if (found < 40) {
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
