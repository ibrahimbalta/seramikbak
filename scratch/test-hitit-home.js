async function main() {
  const urls = [
    'https://www.hititseramik.com.tr',
    'https://www.hititseramik.com.tr/robots.txt'
  ];
  for (const url of urls) {
    console.log('Fetching:', url);
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      console.log(`Status for ${url}: ${res.status}`);
      const text = await res.text();
      console.log(`Length: ${text.length}`);
      if (url.endsWith('robots.txt')) {
        console.log('Robots.txt content:\n', text);
      } else {
        // Find links
        const regex = /href="([^"]*)"/gi;
        let match;
        const links = new Set();
        while ((match = regex.exec(text)) !== null) {
          links.add(match[1].trim());
        }
        console.log(`Total links found on homepage: ${links.size}`);
        Array.from(links).slice(0, 50).forEach(l => {
          if (l.toLowerCase().includes('product') || l.toLowerCase().includes('seri') || l.toLowerCase().includes('koleksiyon') || l.length < 50) {
            console.log('-', l);
          }
        });
      }
    } catch (err) {
      console.error('Error fetching:', err.message);
    }
  }
}
main();
