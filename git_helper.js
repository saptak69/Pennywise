const { execSync } = require('child_process');

console.log('--- Git Status ---');
try {
  const status = execSync('git status', { encoding: 'utf8' });
  console.log(status);
} catch (e) {
  console.error(e.message);
}

console.log('--- Tracked Files in frontend/ ---');
try {
  const files = execSync('git ls-files frontend', { encoding: 'utf8' });
  console.log(files || '(No files tracked in frontend/)');
} catch (e) {
  console.error(e.message);
}

console.log('--- Ignored Files Check ---');
try {
  const ignored = execSync('git status --ignored', { encoding: 'utf8' });
  console.log(ignored);
} catch (e) {
  console.error(e.message);
}
