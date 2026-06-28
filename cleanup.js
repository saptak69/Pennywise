const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const filesToDelete = [
  'extract.js',
  'copy_icons.js',
  'move_files.js',
  'fix_git.js',
  'git_helper.js',
  'git_log.js',
  'check_remote_commit.js',
  'search_value.js'
];

console.log('Cleaning up temporary helper scripts...');
filesToDelete.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log(`Deleted: ${file}`);
    } catch (e) {
      console.error(`Failed to delete ${file}:`, e.message);
    }
  }
});

console.log('\nStaging changes to Git...');
try {
  execSync('git add .', { stdio: 'inherit' });
  execSync('git commit -m "Add label IDs to transactions form for accessibility and test compliance"', { stdio: 'inherit' });
  execSync('git push origin main', { stdio: 'inherit' });
  console.log('\nPushed clean code successfully to GitHub!');
} catch (e) {
  console.log('\nPlease run manually to commit and push the form fix:');
  console.log('1. git add .');
  console.log('2. git commit -m "Add label IDs to transactions form"');
  console.log('3. git push origin main');
}

// Self delete cleanup.js
try {
  fs.unlinkSync(__filename);
  console.log('Self-deleted cleanup.js');
} catch (e) {}
