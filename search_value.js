const fs = require('fs');
const path = require('path');

function searchInDir(dir, query) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') {
        searchInDir(filePath, query);
      }
    } else {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes(query)) {
        console.log(`Match found in: ${filePath}`);
        // Find line number
        const lines = content.split('\n');
        lines.forEach((line, index) => {
          if (line.includes(query)) {
            console.log(`  Line ${index + 1}: ${line.trim()}`);
          }
        });
      }
    }
  });
}

console.log('Searching for "valueAsNumber" in codebase...');
searchInDir(__dirname, 'valueAsNumber');
console.log('Search complete!');
