const fs = require('fs');

const contentPath = 'C:\\Users\\A\\.gemini\\antigravity\\brain\\25e2108e-e4b0-4556-bfd2-e4d621338667\\.system_generated\\steps\\1960\\content.md';
const html = fs.readFileSync(contentPath, 'utf8');

const vsMatch = html.match(/__VIEWSTATE[^>]+value="([^"]+)"/);
const decoded = Buffer.from(vsMatch[1], 'base64').toString('utf8');

// Find alturunler image and print hex of surrounding bytes
const altIdx = decoded.indexOf('/images/alturunler/');
if (altIdx !== -1) {
  // Print 100 bytes before and 300 bytes after in both hex and printable
  const start = Math.max(0, altIdx - 50);
  const end = Math.min(decoded.length, altIdx + 300);
  const chunk = decoded.substring(start, end);
  
  console.log('=== Around first alturunler image ===');
  console.log('Printable (control chars as \\xNN):');
  let printable = '';
  for (let i = 0; i < chunk.length; i++) {
    const code = chunk.charCodeAt(i);
    if (code >= 32 && code < 127) {
      printable += chunk[i];
    } else {
      printable += `\\x${code.toString(16).padStart(2, '0')}`;
    }
  }
  console.log(printable);
  
  // Now find ALL alturunler images and what comes after each
  console.log('\n=== All alturunler entries ===');
  const regex = /\/images\/alturunler\/([^\x00-\x1f]+?)\.jpg/g;
  let m;
  let count = 0;
  while ((m = regex.exec(decoded)) !== null) {
    count++;
    const afterImg = decoded.substring(m.index + m[0].length, m.index + m[0].length + 200);
    let afterPrintable = '';
    for (let i = 0; i < afterImg.length; i++) {
      const code = afterImg.charCodeAt(i);
      if (code >= 32 && code < 127) {
        afterPrintable += afterImg[i];
      } else {
        afterPrintable += `\\x${code.toString(16).padStart(2, '0')}`;
      }
    }
    console.log(`\n[${count}] Image: ${m[0]}`);
    console.log(`    After: ${afterPrintable.substring(0, 200)}`);
  }
}
