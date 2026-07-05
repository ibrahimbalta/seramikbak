const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'app', 'page.js');
const content = fs.readFileSync(filePath, 'utf8');

console.log("Analyzing JSX tags with absolute original line number tracking...");
const stack = [];
const errors = [];

const standardSelfClosing = new Set(['img', 'input', 'br', 'hr', 'link', 'meta']);

// Find indices of newlines in the original content to map index -> line number
const newlines = [];
for (let idx = 0; idx < content.length; idx++) {
  if (content[idx] === '\n') {
    newlines.push(idx);
  }
}
function getOriginalLineNum(index) {
  let low = 0, high = newlines.length - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (newlines[mid] < index) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  return low + 1;
}

// Clean comments by replacing comment characters with spaces to preserve indices and line numbers
let cleanContent = content;

// Replace {/* ... */} with spaces of same length
cleanContent = cleanContent.replace(/\{\/\*[\s\S]*?\*\/\}/g, (match) => ' '.repeat(match.length));
// Replace /* ... */ with spaces of same length
cleanContent = cleanContent.replace(/\/\*[\s\S]*?\*\//g, (match) => ' '.repeat(match.length));
// Replace // ... till end of line with spaces of same length
cleanContent = cleanContent.replace(/\/\/.*$/gm, (match) => ' '.repeat(match.length));

const tagRegex = /<[^>]+>/g;
let match;

while ((match = tagRegex.exec(cleanContent)) !== null) {
  const tag = match[0];
  const index = match.index;
  const lineNum = getOriginalLineNum(index);
  
  if (lineNum < 2133) continue; // Start tracing from JSX return
  
  if (tag.startsWith('<!--')) continue;
  
  // Ignore javascript comparisons/expressions
  if (tag.includes('=>') || tag.includes('<=') || tag.includes('++') || tag.includes('&&') || tag.includes('||')) {
    continue;
  }
  
  if (tag.startsWith('</')) {
    const name = tag.substring(2, tag.length - 1).trim().split(/[\s>]/)[0];
    if (!name) continue;
    
    if (stack.length === 0) {
      errors.push(`Line ${lineNum}: Attempted to close </${name}> but stack is empty!`);
      continue;
    }
    const lastOpen = stack.pop();
    if (lastOpen.name !== name) {
      errors.push(`Line ${lineNum}: Mismatch! Tried to close </${name}>, but last opened was <${lastOpen.name}> (opened on Line ${lastOpen.lineNum})`);
      stack.push(lastOpen);
    }
  } else {
    const isSelfClosed = tag.endsWith('/>');
    const name = tag.substring(1, tag.length - (isSelfClosed ? 2 : 1)).trim().split(/[\s>]/)[0];
    if (!name) continue;
    
    if (!/^[a-zA-Z0-9\-]+$/.test(name)) continue;
    
    const isStandardSelfClosing = standardSelfClosing.has(name.toLowerCase());
    
    if (!isSelfClosed && !isStandardSelfClosing) {
      stack.push({ name: name, lineNum: lineNum });
    }
  }
}

console.log("=== FINAL RESULTS ===");
console.log(`Mismatch Errors Found: ${errors.length}`);
errors.slice(0, 30).forEach(e => console.log(e));

console.log(`\nStack size at end: ${stack.length}`);
if (stack.length > 0) {
  console.log("Remaining stack:", stack.slice(0, 10));
}
