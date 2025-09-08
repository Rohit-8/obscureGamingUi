// Simple post-build script: copy build/index.html to build/200.html
// Many static hosts (including Render) will serve 200.html as the SPA fallback.

const fs = require('fs');
const path = require('path');

const buildDir = path.join(__dirname, '..', 'build');
const indexFile = path.join(buildDir, 'index.html');
const destFile = path.join(buildDir, '200.html');

try {
  if (!fs.existsSync(buildDir)) {
    console.error('Build directory not found, run `npm run build` first.');
    process.exit(1);
  }
  fs.copyFileSync(indexFile, destFile);
  console.log('Copied index.html -> 200.html');
} catch (err) {
  console.error('Failed to copy index.html to 200.html', err);
  process.exit(1);
}
