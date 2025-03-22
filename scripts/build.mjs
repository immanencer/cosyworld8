/**
 * Production build script
 * 
 * This script orchestrates the full production build process:
 * 1. Clean the dist directory
 * 2. Build JavaScript with Webpack
 * 3. Build CSS with PostCSS/TailwindCSS
 * 4. Copy static assets
 * 5. Process HTML files to inject environment variables
 * 
 * Usage: node scripts/build.mjs
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

/**
 * Execute a shell command and log output
 */
async function runCommand(command, name) {
  console.log(`\n🚀 Running ${name}...`);
  console.log(`> ${command}\n`);
  
  try {
    const { stdout, stderr } = await execAsync(command, { cwd: rootDir });
    
    if (stdout) {
      console.log(stdout);
    }
    
    if (stderr) {
      console.error(stderr);
    }
    
    console.log(`✅ ${name} completed successfully\n`);
    return true;
  } catch (error) {
    console.error(`❌ ${name} failed: ${error.message}`);
    if (error.stdout) console.log(error.stdout);
    if (error.stderr) console.error(error.stderr);
    return false;
  }
}

/**
 * Process HTML files to inject environment variables
 */
async function processHtmlFiles() {
  const distDir = path.resolve(rootDir, 'dist');
  const htmlFiles = await findHtmlFiles(distDir);
  
  console.log(`Found ${htmlFiles.length} HTML files to process`);
  
  for (const file of htmlFiles) {
    console.log(`Processing ${path.relative(distDir, file)}`);
    
    // Read the HTML file
    let html = await fs.readFile(file, 'utf-8');
    
    // Define the environment variables to inject
    const envVars = {
      NODE_ENV: process.env.NODE_ENV || 'production',
      API_URL: process.env.API_URL || '/api',
      PUBLIC_URL: process.env.PUBLIC_URL || '',
      ENABLE_ANALYTICS: process.env.ENABLE_ANALYTICS || 'false'
    };
    
    // Create environment variables script
    const envScript = `
    <!-- Environment Variables (Injected during build) -->
    <script>
      // Browser-friendly environment variables
      window.ENV_NODE_ENV = '${envVars.NODE_ENV}';
      window.ENV_API_URL = '${envVars.API_URL}';
      window.ENV_PUBLIC_URL = '${envVars.PUBLIC_URL}';
      window.ENV_ENABLE_ANALYTICS = '${envVars.ENABLE_ANALYTICS}';
    </script>
    `;
    
    // Find if there's already an environment variables script
    const existingEnvScript = html.match(/<script>[\s\n]*\/\/ Browser-friendly environment variables[\s\S]*?<\/script>/);
    
    if (existingEnvScript) {
      // Replace existing environment script
      html = html.replace(existingEnvScript[0], envScript);
    } else {
      // Insert before closing head tag
      html = html.replace('</head>', `${envScript}\n</head>`);
    }
    
    // Write the modified HTML back to the file
    await fs.writeFile(file, html, 'utf-8');
  }
}

/**
 * Find all HTML files in a directory recursively
 */
async function findHtmlFiles(dir) {
  const files = await fs.readdir(dir, { withFileTypes: true });
  
  const htmlFiles = await Promise.all(
    files.map(async (file) => {
      const filePath = path.join(dir, file.name);
      
      if (file.isDirectory()) {
        return findHtmlFiles(filePath);
      } else if (file.name.endsWith('.html')) {
        return filePath;
      }
      
      return [];
    })
  );
  
  return htmlFiles.flat();
}

/**
 * Main build process
 */
async function build() {
  console.log('📦 Starting production build process...');
  
  // Set NODE_ENV to production
  process.env.NODE_ENV = 'production';
  
  // Step 1: Clean the dist directory
  if (!await runCommand('npm run clean', 'Clean dist directory')) {
    process.exit(1);
  }
  
  // Step 2: Build JavaScript with Webpack
  if (!await runCommand('npm run build:js', 'JavaScript build')) {
    process.exit(1);
  }
  
  // Step 3: Build CSS with PostCSS/TailwindCSS
  if (!await runCommand('npm run build:css', 'CSS build')) {
    process.exit(1);
  }
  
  // Step 4: Copy static assets
  if (!await runCommand('npm run copy-assets', 'Copy assets')) {
    process.exit(1);
  }
  
  // Step 5: Process HTML files to inject environment variables
  console.log('\n🔧 Processing HTML files...');
  try {
    await processHtmlFiles();
    console.log('✅ HTML processing completed successfully\n');
  } catch (error) {
    console.error(`❌ HTML processing failed: ${error.message}`);
    process.exit(1);
  }
  
  // Log success
  console.log('\n✨ Production build completed successfully!');
  console.log('\nTo run the production build locally:');
  console.log('  npm run serve:prod');
}

// Run the build process
build().catch(error => {
  console.error('Build failed:', error);
  process.exit(1);
});