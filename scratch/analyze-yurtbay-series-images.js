const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'yurtbay-series.html'), 'utf8');

console.log('--- Searching for all image extensions in Yurtbay Series HTML ---');

const imgRegex = /(src|data-src|href)="([^"]+\.(jpg|png|webp|jpeg|svg)[^"]*)"/gi;
let match;
const imgs = new Set();
while ((match = imgRegex.exec(html)) !== null) {
  imgs.add(match[2]);
}

console.log(`Found ${imgs.size} unique image-like links:`);
Array.from(imgs).forEach((url, idx) => {
  console.log(`${idx + 1}: ${url}`);
});

// Let's print out lines containing "image" or "uploads" or "src" to see where they are
console.log('\n--- Checking for image or product blocks ---');
const lines = html.split('\n');
lines.forEach((line, lineIdx) => {
  if (line.includes('image.yurtbayseramik.com') || line.includes('/urun/') || line.includes('product-image') || line.includes('single-product')) {
    console.log(`Line ${lineIdx + 1}: ${line.trim()}`);
  }
});
