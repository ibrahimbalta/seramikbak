const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'vitra-output.html'), 'utf8');

// Look for data-insider-plp-product attributes or similar data attributes
console.log('--- Searching for data attributes ---');

const insiderRegex = /data-insider-plp-product='([^']+)'/gi;
const insiderRegexDouble = /data-insider-plp-product="([^"]+)"/gi;
let match;
const products = [];

while ((match = insiderRegex.exec(html)) !== null) {
  try {
    const rawJson = match[1].replace(/&quot;/g, '"');
    const parsed = JSON.parse(rawJson);
    products.push(parsed);
  } catch (err) {
    // try direct parse
    try {
      products.push(eval('(' + match[1] + ')'));
    } catch (e) {}
  }
}

while ((match = insiderRegexDouble.exec(html)) !== null) {
  try {
    const rawJson = match[1].replace(/&quot;/g, '"');
    const parsed = JSON.parse(rawJson);
    products.push(parsed);
  } catch (err) {
    try {
      products.push(eval('(' + match[1] + ')'));
    } catch (e) {}
  }
}

console.log(`Found ${products.length} products via insider data-attribute.`);
if (products.length > 0) {
  console.log('First 3 products:', JSON.stringify(products.slice(0, 3), null, 2));
}

// Let's also look for product cards in the HTML by looking at specific class structures.
// Let's search for "K95" or typical Vitra codes which often start with 'K' followed by numbers (e.g. K953272)
console.log('--- Searching for Vitra SKU codes (e.g., K9...) ---');
const skuRegex = /\b(K\d{6,15}[A-Z0-9]*)\b/gi;
const skus = new Set();
while ((match = skuRegex.exec(html)) !== null) {
  skus.add(match[1]);
}
console.log(`Found ${skus.size} potential SKUs. First 20:`, Array.from(skus).slice(0, 20));
