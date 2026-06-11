const fs = require('fs');
const path = require('path');

function searchInFile(filePath, term) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.toLowerCase().includes(term.toLowerCase())) {
      console.log(`Found "${term}" in: ${filePath}`);
      // Find line number
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (line.toLowerCase().includes(term.toLowerCase())) {
          console.log(`  L${idx + 1}: ${line.trim().substring(0, 100)}`);
        }
      });
    }
  } catch (err) {
    // ignore binary or unreadable files
  }
}

function traverse(dir, term) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
        traverse(fullPath, term);
      }
    } else {
      searchInFile(fullPath, term);
    }
  }
}

const term = process.argv[2] || 'Trendyol';
console.log(`Searching for "${term}"...`);
traverse(path.join(__dirname, '..'), term);
