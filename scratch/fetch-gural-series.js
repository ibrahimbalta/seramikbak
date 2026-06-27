async function main() {
  const url = 'https://www.guralseramik.com/tum-seriler';
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const text = await res.text();
    const regex = /href="([^"]*)"/gi;
    let match;
    const links = new Set();
    while ((match = regex.exec(text)) !== null) {
      links.add(match[1].trim());
    }
    console.log('All links on series page (total: ' + links.size + '):');
    Array.from(links).slice(0, 100).forEach(link => console.log('-', link));
  } catch (err) {
    console.error('Error:', err.message);
  }
}
main();
