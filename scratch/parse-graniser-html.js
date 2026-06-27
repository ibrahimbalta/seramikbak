const fs = require('fs');
const path = require('path');

const contentPath = 'C:\\Users\\A\\.gemini\\antigravity\\brain\\25e2108e-e4b0-4556-bfd2-e4d621338667\\.system_generated\\steps\\1909\\content.md';
const html = fs.readFileSync(contentPath, 'utf8');

console.log('HTML Total Length:', html.length);

// Let's find all product links:
// e.g. <a href="/urunler/1002/yer_ve_duvar_karosu/503/vienna.aspx">
const productRegex = /<a\s+href="(\/urunler\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
const products = [];
let match;
while ((match = productRegex.exec(html)) !== null) {
  products.push({
    url: match[1],
    content: match[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  });
}

console.log('Total products found on main page:', products.length);
console.log('Samples:', products.slice(0, 15));

// Let's write the found products list
fs.writeFileSync(path.join(__dirname, 'graniser-pdp-urls.json'), JSON.stringify(products, null, 2), 'utf8');
console.log('Saved to scratch/graniser-pdp-urls.json');
