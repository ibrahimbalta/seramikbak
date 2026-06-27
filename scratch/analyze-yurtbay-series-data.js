const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'yurtbay-series.html'), 'utf8');

console.log('--- Analyzing script tags in Yurtbay Series HTML for product data ---');

const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let scriptIdx = 0;

while ((match = scriptRegex.exec(html)) !== null) {
  const content = match[1];
  if (content.includes('product') || content.includes('data') || content.includes('[') || content.includes('render')) {
    console.log(`\nScript ${scriptIdx} (Length: ${content.length}):`);
    if (content.length > 500) {
      console.log(content.substring(0, 500) + '...');
    } else {
      console.log(content);
    }
  }
  scriptIdx++;
}
