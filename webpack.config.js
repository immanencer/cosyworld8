import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import webpack from 'webpack';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    mode: isProduction ? 'production' : 'development',
    entry: {
      main: './public/js/main.js',
      adminPanel: './public/js/adminPanel.js',
      checkout: './public/js/checkout.js',
      'guild-settings': './public/js/guild-settings.js',
      'avatar-management': './public/admin/avatar-management.js'
    },
    output: {
      filename: '[name].bundle.js',
      path: path.resolve(__dirname, 'dist/js')
    },
    module: {
      rules: [
        {
          test: /\.m?js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
        }
      ]
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development'),
        'process.env.API_URL': JSON.stringify(process.env.API_URL || '/api'),
        'process.env.PUBLIC_URL': JSON.stringify(process.env.PUBLIC_URL || ''),
        'process.env.ENABLE_ANALYTICS': JSON.stringify(process.env.ENABLE_ANALYTICS || 'false')
      })
    ]
  };
};