const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const frontendGitPath = path.join(__dirname, 'frontend', '.git');

if (fs.existsSync(frontendGitPath)) {
  console.log('Found nested .git folder inside frontend/! Deleting it to prevent submodule issues...');
  try {
    fs.rmSync(frontendGitPath, { recursive: true, force: true });
    console.log('Successfully deleted nested frontend/.git folder.');
  } catch (error) {
    console.error('Failed to delete nested .git folder:', error);
  }
} else {
  console.log('No nested .git folder found inside frontend/. Checking other causes...');
}

console.log('\nRunning git commands to untrack it as a submodule and add it as a normal folder...');
try {
  // Remove the submodule cache from Git index (does not delete local files)
  execSync('git rm --cached frontend -f', { stdio: 'inherit' });
  console.log('Untracked frontend submodule.');
  
  // Re-add the frontend folder as a normal directory
  execSync('git add frontend', { stdio: 'inherit' });
  console.log('Successfully added frontend folder contents to Git staging!');
  
  console.log('\nNow you can commit and push! Run:');
  console.log('git commit -m "Fix nested git submodule and track frontend files"');
  console.log('git push origin main');
} catch (error) {
  console.log('\nCould not run git commands automatically. Please run them manually in your terminal:');
  console.log('1. git rm --cached frontend -f');
  console.log('2. git add frontend');
  console.log('3. git commit -m "Fix nested git submodule and track frontend files"');
  console.log('4. git push origin main');
}
