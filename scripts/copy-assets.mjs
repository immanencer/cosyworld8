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
  { src: 'assets', dest: 'assets' },
  { src: 'thumbnails', dest: 'thumbnails' },
  { src: 'swagger-ui', dest: 'swagger-ui' },
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
  const destDir = path.dirname(destPath);
  ensureDirectoryExists(destDir);
  
  if (!fs.existsSync(srcPath)) {
    console.error(`Source file not found: ${srcPath}`);
    return;
  }
  
  if (transform && (src.endsWith('.html') || src.endsWith('.htm'))) {
    // Transform HTML files to update JS and CSS paths for production
    let content = fs.readFileSync(srcPath, 'utf8');
    
    // Update script src paths to use bundled JS files
    content = content.replace(
      /<script src="\/js\/([^"]+)\.js" type="module"><\/script>/g, 
      '<script src="/js/$1.bundle.js"></script>'
    );
    
    // Write the transformed content
    fs.writeFileSync(destPath, content);
    console.log(`Transformed and copied: ${src} -> ${dest}`);
  } else {
    // Simple copy for non-transformable files
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
  
  // Create destination directory
  ensureDirectoryExists(destPath);
  
  // Read source directory
  const entries = fs.readdirSync(srcPath, { withFileTypes: true });
  
  // Process each entry
  for (const entry of entries) {
    const srcEntry = path.join(src, entry.name);
    const destEntry = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      // Recursively copy subdirectory
      copyDirectory(srcEntry, destEntry);
    } else {
      // Copy file
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
  
  // Ensure the destination root exists
  ensureDirectoryExists(destDir);
  
  // Process each asset
  for (const asset of assetsToCopy) {
    const srcPath = path.join(srcDir, asset.src);
    
    if (fs.existsSync(srcPath)) {
      const stats = fs.statSync(srcPath);
      
      if (stats.isDirectory()) {
        copyDirectory(asset.src, asset.dest);
      } else {
        copyFile(asset.src, asset.dest, asset.transform);
      }
    } else {
      console.warn(`Warning: Source path does not exist: ${srcPath}`);
    }
  }
  
  console.log('Assets copied successfully!');
}

// Execute the copy
copyAssets();