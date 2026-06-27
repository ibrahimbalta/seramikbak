const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'ege-output.html'), 'utf8');

console.log('--- Searching for API Endpoint Clues in Ege Seramik HTML ---');

// Search for script tags containing ajax, post, get, url, or fetch
const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let scriptIdx = 0;

while ((match = scriptRegex.exec(html)) !== null) {
  const content = match[1];
  if (content.includes('url') || content.includes('ajax') || content.includes('fetch') || content.includes('products') || content.includes('filter')) {
    console.log(`\nScript ${scriptIdx} (Length: ${content.length}):`);
    // Print parts that look like endpoint URLs
    const urlMatches = content.match(/"\/[^"]+"|'\/[^']+'/g);
    if (urlMatches) {
      console.log('Potential URL constants:', urlMatches.slice(0, 15));
    }
    // Also print segments around "ajax" or "url:" or "$.post"
    const lines = content.split('\n');
    lines.forEach((line, lineIdx) => {
      if (line.includes('ajax') || line.includes('post') || line.includes('get') || line.includes('url:') || line.includes('fetch')) {
        console.log(`Line ${lineIdx + 1}: ${line.trim()}`);
      }
    });
  }
  scriptIdx++;
}
