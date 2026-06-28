const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const srcDir = path.join(__dirname, 'build');
const destDir = path.join(__dirname, 'frontend', 'public');

const filesToCopy = ['favicon.ico', 'logo192.png', 'logo512.png'];

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

console.log('Copying static assets...');
filesToCopy.forEach(file => {
  const srcPath = path.join(srcDir, file);
  const destPath = path.join(destDir, file);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied ${file} to frontend/public/`);
  } else {
    console.log(`Warning: ${file} not found in build/`);
  }
});

console.log('\nRunning git commands to add, commit and push static assets...');
try {
  execSync('git add frontend/public', { stdio: 'inherit' });
  console.log('Staged frontend/public.');
  
  execSync('git commit -m "Add missing static assets (favicon and logos)"', { stdio: 'inherit' });
  console.log('Committed static assets.');
  
  execSync('git push origin main', { stdio: 'inherit' });
  console.log('Pushed static assets to GitHub successfully!');
} catch (error) {
  console.log('\nCould not complete git commands automatically. Please run manually:');
  console.log('1. git add frontend/public');
  console.log('2. git commit -m "Add missing static assets"');
  console.log('3. git push origin main');
}
