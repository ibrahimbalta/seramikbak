const fs = require('fs');
const path = require('path');

const contentPath = 'C:\\Users\\A\\.gemini\\antigravity\\brain\\25e2108e-e4b0-4556-bfd2-e4d621338667\\.system_generated\\steps\\1909\\content.md';
const html = fs.readFileSync(contentPath, 'utf8');

console.log('Includes Vienna:', html.toLowerCase().includes('vienna'));
console.log('Includes Dougles:', html.toLowerCase().includes('dougles'));
console.log('Includes Irona:', html.toLowerCase().includes('irona'));
console.log('Includes Calvera:', html.toLowerCase().includes('calvera'));

// Let's print the entire raw HTML to understand what's in it!
console.log('\n--- RAW HTML (first 2000 chars) ---');
console.log(html.slice(0, 2000));
console.log('\n--- RAW HTML (last 2000 chars) ---');
console.log(html.slice(-2000));
