
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function build() {
  console.log('🏗️ Starting build process...');
  
  try {
    await Promise.all([
      execAsync('npx tailwindcss -i ./src/tailwind.css -o ./public/css/tailwind.css --minify'),
      execAsync('npx babel public/js --out-dir public/js/dist --presets=@babel/preset-env,@babel/preset-react --source-maps'),
    ]);
    
    console.log('✅ Build completed successfully');
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

build();
