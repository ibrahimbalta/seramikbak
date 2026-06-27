const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'yurtbay-series.html'), 'utf8');

const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let scriptIdx = 0;

while ((match = scriptRegex.exec(html)) !== null) {
  if (scriptIdx === 7) {
    const content = match[1];
    console.log(`Script 7 (Length: ${content.length}):`);
    
    // Check for array definitions or JSON payloads
    const lines = content.split('\n');
    console.log('--- Checking for keyword occurrences ---');
    lines.forEach((line, lineIdx) => {
      if (line.includes('products') || line.includes('[{') || line.includes('series') || line.includes('item') || line.includes('append') || line.includes('html(')) {
        console.log(`Line ${lineIdx + 1}: ${line.trim().substring(0, 150)}`);
      }
    });

    // Write full Script 7 to a file so we can view it
    fs.writeFileSync(path.join(__dirname, 'yurtbay-script7.js'), content, 'utf8');
  }
  scriptIdx++;
}
