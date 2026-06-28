const fs = require('fs');
const path = require('path');

function findFiles(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') {
        findFiles(filePath);
      }
    } else {
      const lower = file.toLowerCase();
      if (lower.includes('popup') || lower.includes('extension') || lower.includes('manifest.json')) {
        console.log(`Found: ${filePath}`);
      }
    }
  });
}

console.log('Searching for popup/extension files in workspace...');
findFiles(__dirname);
console.log('Search complete!');
