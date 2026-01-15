import { copyFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rootDir = join(__dirname, '..');
const srcIconsDir = join(rootDir, 'src', 'icons');
const distIconsDir = join(rootDir, 'dist', 'icons');

// Create icons directory in dist
mkdirSync(distIconsDir, { recursive: true });

// Copy icon files
const icons = ['icon-16.svg', 'icon-48.svg', 'icon-128.svg'];

icons.forEach((icon) => {
  const src = join(srcIconsDir, icon);
  const dest = join(distIconsDir, icon);
  copyFileSync(src, dest);
  console.log(`Copied ${icon} to dist/icons/`);
});

console.log('✓ All icons copied successfully');
