const fs = require('fs');
const path = require('path');

const contentPath = 'C:\\Users\\A\\.gemini\\antigravity\\brain\\25e2108e-e4b0-4556-bfd2-e4d621338667\\.system_generated\\steps\\1960\\content.md';
const html = fs.readFileSync(contentPath, 'utf8');

console.log('HTML Length:', html.length);

// Decode the ViewState
const vsMatch = html.match(/__VIEWSTATE[^>]+value="([^"]+)"/);
if (vsMatch) {
  const decoded = Buffer.from(vsMatch[1], 'base64').toString('utf8');
  
  // Find product-related data
  console.log('\n--- Searching for product data in ViewState ---');
  
  // Find image URLs
  const imgRegex = /\/images\/urunler\/[\w_.-]+/gi;
  const images = [];
  let m;
  while ((m = imgRegex.exec(decoded)) !== null) {
    if (!images.includes(m[0])) images.push(m[0]);
  }
  console.log('Images found:', images.length);
  images.forEach(img => console.log('  ', img));
  
  // Find size patterns like 60x120, 30x60 etc.
  const sizeRegex = /\d+[xX]\d+/gi;
  const sizes = [];
  while ((m = sizeRegex.exec(decoded)) !== null) {
    if (!sizes.includes(m[0])) sizes.push(m[0]);
  }
  console.log('\nSizes found:', sizes);
  
  // Find color names
  const colors = ['Bone', 'Grey', 'Light Grey', 'Taupe', 'White', 'Ivory', 'Beige', 'Black', 'Anthracite', 'Brown', 'Cream'];
  colors.forEach(color => {
    if (decoded.toLowerCase().includes(color.toLowerCase())) {
      console.log('Color found:', color);
    }
  });
  
  // Print a chunk of decoded content around "Vienna" or product names
  const vIdx = decoded.toLowerCase().indexOf('vienna');
  if (vIdx !== -1) {
    console.log('\n--- Context around "Vienna" ---');
    console.log(decoded.substring(Math.max(0, vIdx - 200), vIdx + 500));
  }
  
  // Find all readable strings
  console.log('\n--- All readable strings containing product info ---');
  const readableRegex = /[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g;
  const readableStrings = new Set();
  while ((m = readableRegex.exec(decoded)) !== null) {
    if (m[0].length > 3) readableStrings.add(m[0]);
  }
  console.log('Unique readable strings (>3 chars):', [...readableStrings].slice(0, 50));
  
  // Print specific sections of decoded ViewState
  console.log('\n--- Full decoded ViewState (first 5000 chars) ---');
  // Only print printable characters
  const printable = decoded.replace(/[^\x20-\x7E\xC0-\xFF]/g, '|');
  console.log(printable.substring(0, 5000));
  
} else {
  console.log('No ViewState found!');
}
