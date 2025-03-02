
import esbuild from 'esbuild';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

// First build the React component
await esbuild.build({
  entryPoints: ['src/react/Checkout.jsx'],
  bundle: true,
  outfile: 'public/js/checkout.js',
  format: 'iife',
  globalName: 'Checkout',
  plugins: [],
  define: {
    'process.env.NODE_ENV': '"production"'
  }
});

// Then inject the API key into the HTML
let html = fs.readFileSync('public/checkout.html', 'utf8');
html = html.replace(
  '<script>',
  `<script data-api-key="${process.env.CROSSMINT_CLIENT_API_KEY}">`
);
fs.writeFileSync('public/checkout.html', html);

console.log('Checkout page built successfully');
