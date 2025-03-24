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
const srcDir = path.join(rootDir, 'public');
const destDir = path.join(rootDir, 'dist');

// Files and directories to copy
const assetsToCopy = [
  { src: 'css/tribe-styles.css', dest: 'css/tribe-styles.css' },
  { src: 'index.html', dest: 'index.html', transform: true },
  { src: 'checkout.html', dest: 'checkout.html', transform: true },
  { src: 'api-docs.html', dest: 'api-docs.html', transform: true },
  { src: 'admin/avatar-management.html', dest: 'admin/avatar-management.html', transform: true },
  { src: 'admin/guild-settings.html', dest: 'admin/guild-settings.html', transform: true },
  { src: 'admin/index.html', dest: 'admin/index.html', transform: true }
];

/**
 * Ensures a directory exists
 */
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}

/**
 * Copy a file from source to destination
 */
function copyFile(src, dest, transform = false) {
  const srcPath = path.join(srcDir, src);
  const destPath = path.join(destDir, dest);

  // Ensure the destination directory exists
  const destDirPath = path.dirname(destPath);
  ensureDirectoryExists(destDirPath);

  if (!fs.existsSync(srcPath)) {
    console.warn(`Warning: Source file not found: ${srcPath}`);
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

/**
 * Copy a directory recursively
 */
function copyDirectory(src, dest) {
  const srcPath = path.join(srcDir, src);
  const destPath = path.join(destDir, dest);

  if (!fs.existsSync(srcPath)) {
    console.warn(`Warning: Source directory not found: ${srcPath}`);
    return;
  }

  ensureDirectoryExists(destPath);

  const entries = fs.readdirSync(srcPath, { withFileTypes: true });

  for (const entry of entries) {
    const srcEntry = path.join(src, entry.name);
    const destEntry = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(srcEntry, destEntry);
    } else {
      copyFile(srcEntry, destEntry);
    }
  }

  console.log(`Copied directory: ${src} -> ${dest}`);
}

/**
 * Main execution function
 */
function copyAssets() {
  console.log('Starting to copy assets...');
  ensureDirectoryExists(destDir);

  for (const asset of assetsToCopy) {
    const srcPath = path.join(srcDir, asset.src);

    if (fs.existsSync(srcPath)) {
      copyFile(asset.src, asset.dest, asset.transform);
    } else {
      console.warn(`Warning: Source path does not exist: ${srcPath}`);
    }
  }

  console.log('Assets copied successfully!');
}

// Execute the copy
copyAssets();