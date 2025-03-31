/**
 * Script to copy static assets to the dist folder for production build
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Define source and destination directories
const srcDir = path.join(rootDir, 'src/services/web/public');
const destDir = path.join(rootDir, 'dist');

// Files and directories to copy
const assetsToCopy = [
  { src: 'css/tribe-styles.css', dest: 'css/tribe-styles.css' },
  { src: 'index.html', dest: 'index.html', transform: true },
  { src: 'checkout.html', dest: 'checkout.html', transform: true },
  { src: 'api-docs.html', dest: 'api-docs.html', transform: true },
  { src: 'admin/avatar-management.html', dest: 'admin/avatar-management.html', transform: true },
  { src: 'admin/guild-settings.html', dest: 'admin/guild-settings.html', transform: true },
  { src: 'admin/index.html', dest: 'admin/index.html', transform: true },
];

function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}

function copyFile(src, dest, transform = false) {
  const srcPath = path.join(srcDir, src);
  const destPath = path.join(destDir, dest);

  ensureDirectoryExists(path.dirname(destPath));

  if (!fs.existsSync(srcPath)) {
    console.warn(`Warning: Source path does not exist: ${srcPath}`);
    return;
  }

  if (transform && (src.endsWith('.html') || src.endsWith('.htm'))) {
    let content = fs.readFileSync(srcPath, 'utf8');
    content = content.replace(
      /<script src="\/js\/([^"]+)\.js" type="module"><\/script>/g, 
      '<script src="/js/$1.bundle.js"></script>'
    );
    fs.writeFileSync(destPath, content);
    console.log(`Transformed and copied: ${src} -> ${dest}`);
  } else {
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied: ${src} -> ${dest}`);
  }
}

function copyAssets() {
  console.log('Starting to copy assets...');
  ensureDirectoryExists(destDir);
  ensureDirectoryExists(path.join(destDir, 'js'));

  for (const asset of assetsToCopy) {
    copyFile(asset.src, asset.dest, asset.transform);
  }

  console.log('Assets copied successfully!');
}

copyAssets();