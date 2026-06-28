const fs = require('fs');
const path = require('path');

const frontendDir = path.join(__dirname, 'frontend');
const srcDir = path.join(frontendDir, 'src');

if (!fs.existsSync(srcDir)) {
  fs.mkdirSync(srcDir, { recursive: true });
}

// Items to move from frontend/ to frontend/src/
const itemsToMove = [
  'components',
  'contexts',
  'App.js',
  'App.css',
  'index.js',
  'index.css',
  'reportWebVitals.js'
];

itemsToMove.forEach(item => {
  const oldPath = path.join(frontendDir, item);
  const newPath = path.join(srcDir, item);

  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
    console.log(`Moved ${item} to frontend/src/`);
  } else {
    console.log(`Skipped (not found): ${item}`);
  }
});

console.log('Folders restructured successfully! React source files are now inside frontend/src.');
