const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'yurtbay-output.html'), 'utf8');

console.log('--- Analyzing Yurtbay Seramik HTML Structure ---');

// List all links (href and text) to see if we have actual products
const linkRegex = /<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
let match;
const links = [];
while ((match = linkRegex.exec(html)) !== null) {
  const href = match[1];
  const text = match[2].replace(/<[^>]*>/g, '').trim().replace(/\s+/g, ' ');
  links.push({ href, text });
}

console.log(`Found total ${links.length} links.`);
console.log('Listing links from index 50 to 120:');
links.slice(50, 120).forEach((l, idx) => {
  console.log(`${idx + 51}: [${l.text}] -> ${l.href}`);
});

// Let's search for potential product cards
// Look for card class or product class or similar
const cardRegex = /<div[^>]+class="[^"]*card[^"]*"[^>]*>([\s\S]*?)<\/div>/gi;
let cardIdx = 0;
console.log('\n--- Checking for divs with class "card" ---');
while ((match = cardRegex.exec(html)) !== null && cardIdx < 5) {
  console.log(`\nCard ${cardIdx + 1} (Length: ${match[1].length}):`);
  console.log(match[1].substring(0, 800));
  cardIdx++;
}

// Check if there is an image folder path that looks like uploads or products
const productImgRegex = /src="([^"]*(uploads|products|seriler)[^"]*)"/gi;
const productImgs = [];
while ((match = productImgRegex.exec(html)) !== null) {
  productImgs.push(match[1]);
}
console.log(`\nFound ${productImgs.length} images containing uploads/products/seriler. First 15:`);
console.log(productImgs.slice(0, 15));
