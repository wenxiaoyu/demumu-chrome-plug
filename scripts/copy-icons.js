import { copyFileSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rootDir = join(__dirname, '..');
const srcIconsDir = join(rootDir, 'src', 'icons');
const distIconsDir = join(rootDir, 'dist', 'icons');

// Create icons directory in dist
mkdirSync(distIconsDir, { recursive: true });

// Copy icon files (both SVG and PNG)
const icons = [
  'icon-16.svg', 
  'icon-48.svg', 
  'icon-128.svg',
  'icon-16.png',
  'icon-48.png',
  'icon-128.png'
];

icons.forEach((icon) => {
  const src = join(srcIconsDir, icon);
  const dest = join(distIconsDir, icon);
  copyFileSync(src, dest);
  console.log(`Copied ${icon} to dist/icons/`);
});

console.log('✓ All icons copied successfully');

// Copy _locales directory
const srcLocalesDir = join(rootDir, 'src', '_locales');
const distLocalesDir = join(rootDir, 'dist', '_locales');

function copyDirectory(src, dest) {
  mkdirSync(dest, { recursive: true });
  
  const entries = readdirSync(src);
  
  for (const entry of entries) {
    const srcPath = join(src, entry);
    const destPath = join(dest, entry);
    
    if (statSync(srcPath).isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
      console.log(`Copied ${entry} to ${dest}/`);
    }
  }
}

copyDirectory(srcLocalesDir, distLocalesDir);
console.log('✓ All locales copied successfully');
