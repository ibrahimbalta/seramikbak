const fs = require('fs');

async function debug() {
  const url = 'https://ngkutahyaseramik.com.tr/urun/60x120-albatros-rektifiye-parlak-nano';
  console.log('Fetching', url);
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    }
  });
  const html = await response.text();
  
  console.log('--- META TAGS ---');
  const metaRegex = /<meta\s+[^>]*>/gi;
  let match;
  while ((match = metaRegex.exec(html)) !== null) {
    if (match[0].includes('image') || match[0].includes('og:') || match[0].includes('twitter:')) {
      console.log(match[0]);
    }
  }
}

debug().catch(console.error);
