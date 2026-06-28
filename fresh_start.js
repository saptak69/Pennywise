const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const filesToDelete = [
  'CNAME',
  'LICENSE',
  'extract.js',
  'copy_icons.js',
  'move_files.js',
  'fix_git.js',
  'git_helper.js',
  'git_log.js',
  'check_remote_commit.js',
  'find_popup.js',
  'find_globally.js',
  'cleanup_globals.js',
  'search_value.js',
  'copy_and_push.js',
  'copy_assets.js',
  'cleanup.js',
  'package.json',
  'package-lock.json'
];

const dirsToDelete = [
  'build',
  'node_modules'
];

console.log('--- Cleaning up old files ---');

filesToDelete.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log(`Deleted file: ${file}`);
    } catch (e) {
      console.error(`Failed to delete file ${file}:`, e.message);
    }
  }
});

dirsToDelete.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (fs.existsSync(dirPath)) {
    try {
      fs.rmSync(dirPath, { recursive: true, force: true });
      console.log(`Deleted folder: ${dir}`);
    } catch (e) {
      console.error(`Failed to delete folder ${dir}:`, e.message);
    }
  }
});

console.log('\n--- Reconfiguring Git Remote Origin ---');
try {
  // Remove current origin remote
  try {
    execSync('git remote remove origin', { stdio: 'ignore' });
  } catch (e) {}

  // Add the new repository remote URL
  execSync('git remote add origin https://github.com/saptak69/Pennywise.git', { stdio: 'inherit' });
  console.log('Successfully set git remote origin to https://github.com/saptak69/Pennywise.git');
} catch (e) {
  console.error('Failed to configure git remote:', e.message);
}

console.log('\n--- Staging and Committing New Project Files ---');
try {
  execSync('git add .', { stdio: 'inherit' });
  execSync('git commit -m "Initialize Pennywise Finance Tracker: MERN Stack with Glassmorphic Dashboard"', { stdio: 'inherit' });
  console.log('Successfully staged and committed clean code files.');
  
  console.log('\n--- Attempting Push to GitHub ---');
  try {
    execSync('git push -u origin main -f', { stdio: 'inherit' });
    console.log('\nSUCCESS! Clean code pushed to https://github.com/saptak69/Pennywise');
  } catch (pushError) {
    console.log('\nWarning: Could not push automatically to GitHub.');
    console.log('Ensure you have created the new repository at https://github.com/saptak69/Pennywise first!');
    console.log('Once created, push manually by running:');
    console.log('git push -u origin main -f');
  }
} catch (e) {
  console.log('\nCould not complete git staging/commit automatically. Please run manually:');
  console.log('1. git add .');
  console.log('2. git commit -m "Initialize Pennywise Finance Tracker"');
  console.log('3. git push -u origin main -f');
}

// Self delete
try {
  fs.unlinkSync(__filename);
} catch (e) {}
