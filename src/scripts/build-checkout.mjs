import esbuild from 'esbuild';
import dotenv from 'dotenv';

dotenv.config();

await esbuild.build({
  entryPoints: ['src/react/CheckoutPage.jsx'],
  bundle: true,
  outfile: 'public/js/checkout.js',
  format: 'iife',
  globalName: 'CheckoutPage',
  define: {
    'process.env.NODE_ENV': '"development"',
  },
  external: ['react', 'react-dom', '@crossmint/client-sdk-react-ui'],
});

console.log('Checkout page built successfully');