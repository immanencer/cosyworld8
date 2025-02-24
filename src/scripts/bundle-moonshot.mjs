
import esbuild from 'esbuild';
import path from 'path';

async function bundleMoonshotSDK() {
  try {
    await esbuild.build({
      entryPoints: ['node_modules/@wen-moon-ser/moonshot-sdk/dist/index.js'],
      bundle: true,
      outfile: 'public/js/moonshot-sdk.js',
      format: 'iife',
      globalName: 'MoonshotSDK',
      platform: 'browser',
      target: ['es2020'],
      minify: true
    });
    console.log('Moonshot SDK bundled successfully');
  } catch (error) {
    console.error('Failed to bundle Moonshot SDK:', error);
    process.exit(1);
  }
}

bundleMoonshotSDK();
