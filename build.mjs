
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function build() {
  console.log('🏗️ Starting build process...');
  
  try {
    // Run builds in parallel
    await Promise.all([
      execAsync('npx tailwindcss -i ./src/tailwind.css -o ./public/css/tailwind.css --minify'),
      execAsync('npx babel public/js/wiki.js -o public/js/wiki.min.js'),
      execAsync('npx babel public/js/app.js -o public/js/app.min.js')
    ]);
    
    console.log('✅ Build completed successfully');
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

build();
