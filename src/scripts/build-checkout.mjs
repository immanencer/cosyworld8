
import esbuild from 'esbuild';

try {
  await esbuild.build({
    entryPoints: ['src/react/CheckoutPage.jsx'],
    bundle: true,
    outfile: 'public/js/checkout.js',
    format: 'iife',
    globalName: 'Checkout',
    plugins: [],
    define: {
      'process.env.CROSSMINT_CLIENT_API_KEY': JSON.stringify(process.env.CROSSMINT_CLIENT_API_KEY)
    }
  });
  
  console.log('Checkout page built successfully');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
