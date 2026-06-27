const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'ege-collection.html'), 'utf8');

// Regex to capture Ege Seramik product details inside collection page
const regex = /<a[^>]+href="([^"]+koleksiyon\/[^"]+)"[^>]*>[\s\S]*?<img[^>]+src="([^"]+)"[^>]*alt="([^"]*)"[^>]*>[\s\S]*?<span>\s*([\s\S]*?)\s*<small>([^<]*)<\/small>/gi;

let match;
const products = [];
while ((match = regex.exec(html)) !== null) {
  const href = match[1].trim();
  const imgUrl = match[2].trim();
  const alt = match[3].trim();
  const name = match[4].replace(/<[^>]*>/g, '').trim().replace(/\s+/g, ' ');
  const finish = match[5].trim();
  
  products.push({
    href,
    imgUrl,
    alt,
    name,
    finish
  });
}

console.log(`Found ${products.length} products in Adriatic collection.`);
console.log('Parsed Products:', JSON.stringify(products, null, 2));
