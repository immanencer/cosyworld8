
import esbuild from 'esbuild';
import dotenv from 'dotenv';

dotenv.config();

await esbuild.build({
  entryPoints: ['src/react/CheckoutPage.jsx'],
  bundle: true,
  outfile: 'public/js/checkout.js',
  format: 'iife',
  globalName: 'Checkout',
  plugins: [],
  define: {
    'process.env.CROSSMINT_CLIENT_API_KEY': JSON.stringify(process.env.CROSSMINT_CLIENT_API_KEY),
    'process.env.NODE_ENV': '"production"'
  }
});

console.log('Checkout page built successfully');
