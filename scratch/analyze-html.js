const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'vitra-output.html'), 'utf8');

// Let's find some potential product divs or anchors
console.log('--- Searching for product blocks ---');

// Search for product detail links: e.g., hrefs that might be products (often containing /p- or similar in vitra)
// Or let's look at the structure by printing some blocks that contain "Modelleri" or "Seramik"
const links = [];
const linkRegex = /<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
let match;
while ((match = linkRegex.exec(html)) !== null) {
  const href = match[1];
  const content = match[2];
  if (href.includes('/p-') || href.includes('product') || href.includes('karo') || href.includes('seramik')) {
    links.push({ href, text: content.replace(/<[^>]*>/g, '').trim() });
  }
}

console.log(`Found ${links.length} matching links. First 15:`);
console.log(links.slice(0, 15));

// Check for images
console.log('--- Searching for images ---');
const imgs = [];
const imgRegex = /<img[^>]+src="([^"]+)"/gi;
while ((match = imgRegex.exec(html)) !== null) {
  imgs.push(match[1]);
}
console.log(`Found ${imgs.length} images. First 15:`);
console.log(imgs.slice(0, 15));

// Check if there is JSON payload inside <script> tags
console.log('--- Searching for scripts with JSON data ---');
const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
let scriptIdx = 0;
while ((match = scriptRegex.exec(html)) !== null) {
  const content = match[1];
  if (content.includes('product') && content.includes('{') && (content.includes('window.') || content.includes('var '))) {
    console.log(`Script ${scriptIdx} contains "product" and "{" (length ${content.length}):`);
    console.log(content.substring(0, 400) + '...');
  }
  scriptIdx++;
}
