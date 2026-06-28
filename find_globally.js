const fs = require('fs');
const path = require('path');

const parentDir = path.resolve(__dirname, '..');

function scanDir(dir) {
  if (!fs.existsSync(dir)) return;
  
  let files;
  try {
    files = fs.readdirSync(dir);
  } catch (e) {
    return; // ignore unreadable dirs
  }
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    let stat;
    try {
      stat = fs.statSync(filePath);
    } catch (e) {
      return;
    }
    
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'build' && file !== '.agents') {
        scanDir(filePath);
      }
    } else {
      const lower = file.toLowerCase();
      if (lower === 'popup.js' || lower === 'popup.html') {
        console.log(`Found extension file: ${filePath}`);
      }
    }
  });
}

console.log(`Scanning parent directory: ${parentDir} for popup.js/popup.html...`);
scanDir(parentDir);
console.log('Scan complete!');
