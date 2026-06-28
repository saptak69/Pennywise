const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const gitPath = path.join(__dirname, '.git');

console.log('--- Wiping Git History to Remove Exposed Secrets ---');

if (fs.existsSync(gitPath)) {
  try {
    console.log('Deleting .git folder...');
    fs.rmSync(gitPath, { recursive: true, force: true });
    console.log('Successfully deleted old .git history.');
  } catch (error) {
    console.error('Error deleting .git folder:', error.message);
    console.log('Please close any other terminal, VS Code window, or folder, and try again.');
    process.exit(1);
  }
} else {
  console.log('.git folder not found, initializing fresh...');
}

console.log('\n--- Re-initializing Clean Git Repository ---');
try {
  execSync('git init', { stdio: 'inherit' });
  execSync('git add .', { stdio: 'inherit' });
  execSync('git commit -m "Initialize Pennywise Finance Tracker: MERN Stack with Glassmorphic Dashboard"', { stdio: 'inherit' });
  execSync('git branch -M main', { stdio: 'inherit' });
  execSync('git remote add origin https://github.com/saptak69/Pennywise.git', { stdio: 'inherit' });
  
  console.log('\n--- Force Pushing Clean History to GitHub ---');
  execSync('git push -u origin main -f', { stdio: 'inherit' });
  console.log('\nSUCCESS! Clean repository with zero history has been pushed.');
} catch (e) {
  console.error('\nAn error occurred during git commands:', e.message);
}

// Self delete
try {
  fs.unlinkSync(__filename);
} catch (e) {}
