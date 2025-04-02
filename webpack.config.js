import path from 'path';
import webpack from 'webpack';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    mode: isProduction ? 'production' : 'development',
    target: 'web',
    entry: {
      main: './src/services/web/public/js/main.js',
      adminPanel: './src/services/web/public/js/adminPanel.js',
      avatarManagement: './src/services/web/public/js/avatar-management.js',
    },
    // Include CSS files
    entry: {
      styles: [
        './src/tailwind.css',
        './src/services/web/public/css/tribe-styles.css'
      ],
    },
    experiments: {
      outputModule: true // Enable ES module output
    },
    output: {
      filename: '[name].bundle.js',
      path: path.resolve(__dirname, 'dist/js'),
      publicPath: '/dist/js/',
      module: true, // Output as ES module
      chunkFormat: 'module' // ES module chunks
    },
    module: {
      rules: [
        {
          test: /\.(js|mjs)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', {
                  targets: '> 0.25%, not dead',
                  useBuiltIns: 'entry',
                  corejs: 3,
                  modules: false // Preserve ES modules
                }]
              ]
            }
          }
        },
        {
          test: /\.css$/,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            'postcss-loader'
          ]
        }
      ],
      parser: {
        javascript: {
          commonjs: false,
          import: true
        }
      }
    },
    resolve: {
      fallback: {
        "path": false,
        "fs": false
      }
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development'),
        'process.env.API_URL': JSON.stringify(process.env.API_URL || '/api')
      }),
      // Extract CSS into separate files
      new MiniCssExtractPlugin({
        filename: '../css/[name].css'
      })
    ]
  };
};