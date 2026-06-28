const { execSync } = require('child_process');
try {
  const commit = execSync('git log -n 1', { encoding: 'utf8' });
  console.log('--- Latest Local Commit ---');
  console.log(commit);
} catch (e) {
  console.error(e.message);
}
