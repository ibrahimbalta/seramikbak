async function main() {
  const url = 'https://www.hititseramik.com.tr/urunler/nexos/nexos-antrasit-60x120/';
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const text = await res.text();
    
    // Let's find all pairs of fancybox links and h1 tags
    // We can search for the fancybox gallery image and then the following h1 title
    const regex = /<a [^>]*data-fancybox="product-detail-image-gallery"[^>]*href="([^"]+)"[^>]*>[\s\S]*?<h1>([\s\S]*?)<\/h1>/gi;
    let match;
    const parsed = [];
    while ((match = regex.exec(text)) !== null) {
      parsed.push({
        img: match[1].trim(),
        title: match[2].trim()
      });
    }
    console.log(`Parsed ${parsed.length} products:`);
    parsed.forEach((p, i) => {
      console.log(`${i+1}. Title: "${p.title}" | Img: "${p.img}"`);
    });
  } catch (err) {
    console.error('Error:', err.message);
  }
}
main();
