const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'yurtbay-output.html'), 'utf8');

const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let scriptIdx = 0;

while ((match = scriptRegex.exec(html)) !== null) {
  const content = match[1];
  if (content.includes('filterSeries')) {
    console.log(`Script ${scriptIdx} (Length: ${content.length}):`);
    console.log(content);
  }
  scriptIdx++;
}
