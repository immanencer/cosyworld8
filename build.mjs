
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

// Create proper React components
const checkoutComponent = `
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Buffer } from 'buffer';

// Make Buffer available globally
window.Buffer = Buffer;

const Checkout = () => {
  return (
    <div>
      <h1>Checkout Page</h1>
      <p>This is a simple checkout page.</p>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Checkout />);
`;

// Create checkout.html file
fs.writeFileSync(path.join(process.cwd(), 'public', 'checkout.html'), `
<!DOCTYPE html>
<html>
<head>
  <title>Checkout</title>
</head>
<body>
  <div id="root"></div>
  <script src="/js/dist/checkout.js"></script> 
</body>
</html>
`);

// Create checkout.jsx file
fs.writeFileSync(path.join(process.cwd(), 'src', 'react', 'Checkout.jsx'), checkoutComponent);

async function build() {
  console.log('🏗️ Starting build process...');

  try {
    // Build checkout page
    await execAsync(`npx babel src/react/Checkout.jsx --out-dir public/js --presets=@babel/preset-env,@babel/preset-react`);
    await execAsync(`npx babel src/react/Checkout.jsx -o public/js/dist/checkout.js --presets=@babel/preset-env,@babel/preset-react`);

    // Build CSS
    await execAsync('npx tailwindcss -i ./src/tailwind.css -o ./public/css/tailwind.css --minify');

    console.log('✅ Build completed successfully');
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

build();
