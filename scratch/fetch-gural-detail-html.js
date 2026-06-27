async function main() {
  const url = 'https://www.guralseramik.com/marble/aleats';
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const text = await res.text();
    const lines = text.split('\n');
    // Log lines 530 to 630
    for (let i = 530; i < 630; i++) {
      if (lines[i]) {
        console.log(`${i+1}: ${lines[i].trim()}`);
      }
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}
main();
