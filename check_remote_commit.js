const { execSync } = require('child_process');
try {
  const remoteHash = execSync('git ls-remote origin refs/heads/main', { encoding: 'utf8' });
  console.log('--- Remote Commit on GitHub ---');
  console.log(remoteHash || '(No hash returned)');
} catch (e) {
  console.error('Error running git ls-remote:', e.message);
}
