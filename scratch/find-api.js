async function test() {
  const url = 'https://ngkutahyaseramik.com.tr/urunler';
  console.log('Fetching', url);
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    }
  });
  const html = await response.text();
  console.log('HTML Length:', html.length);
  // Find any variable definitions in scripts
  const scriptRegex = /<script\s*[^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = scriptRegex.exec(html)) !== null) {
    const content = match[1].trim();
    if (content.includes('window.') || content.includes('var ') || content.includes('let ')) {
      console.log('--- SCRIPT CONTENT ---');
      console.log(content.substring(0, 500));
    }
  }
}
test().catch(console.error);
