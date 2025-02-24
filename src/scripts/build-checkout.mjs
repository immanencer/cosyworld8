
import esbuild from 'esbuild';
import dotenv from 'dotenv';

dotenv.config();

await esbuild.build({
  entryPoints: ['src/react/CheckoutPage.jsx'],
  bundle: true,
  outfile: 'public/js/checkout.js',
  format: 'iife',
  globalName: 'CheckoutPage',
  plugins: [],
  define: {
    'process.env.NODE_ENV': '"production"',
    'window.React': 'React'
  },
  external: ['react', 'react-dom'],
  loader: {
    '.js': 'jsx',
    '.jsx': 'jsx'
  }
});

console.log('Checkout page built successfully');
