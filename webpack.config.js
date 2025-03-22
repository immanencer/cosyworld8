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
    stats: 'verbose',
    performance: {
      hints: false,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000
    },
    cache: {
      type: 'filesystem'
    },
    entry: {
      main: './public/js/main.js',
      adminPanel: './public/js/adminPanel.js',
      checkout: './public/js/checkout.js',
      'guild-settings': './public/js/guild-settings.js',
      'avatar-management': './public/admin/avatar-management.js'
    },
    output: {
      filename: '[name].bundle.js',
      path: path.resolve(__dirname, 'dist/js'),
      clean: true
    },
    mode: isProduction ? 'production' : 'development',
    devtool: isProduction ? 'source-map' : 'eval-source-map',
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
    resolve: {
      extensions: ['.js', '.mjs'],
      fallback: {
        "buffer": require.resolve("buffer/"),
        "stream": require.resolve("stream-browserify"),
        "crypto": require.resolve("crypto-browserify")
      }
    },
    plugins: [
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
        process: 'process/browser'
      }),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development'),
        'process.env.API_URL': JSON.stringify(process.env.API_URL || '/api'),
        'process.env.PUBLIC_URL': JSON.stringify(process.env.PUBLIC_URL || ''),
        'process.env.ENABLE_ANALYTICS': JSON.stringify(process.env.ENABLE_ANALYTICS || 'false')
      })
    ],
    optimization: {
      minimize: isProduction,
      splitChunks: {
        chunks: 'all',
        name: 'vendor',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all'
          }
        }
      }
    }
  };
};