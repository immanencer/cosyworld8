# CosyWorld Frontend Build System

This document outlines the build system setup for the CosyWorld frontend application.

## Overview

The build system uses the following technologies:

- **Webpack**: Bundles and optimizes JavaScript code
- **Babel**: Transpiles modern JavaScript to browser-compatible code
- **PostCSS/TailwindCSS**: Processes and optimizes CSS
- **Environment variables**: Configures the application for different environments

## Directory Structure

- `/public`: Source files for the frontend
- `/dist`: Production build output (generated)
- `/scripts`: Build scripts and utilities
- `/src`: Server-side code and configuration

## Build Scripts

The following npm scripts are available for development and building:

### Development

- `npm run dev:js`: Runs Webpack in development mode with watch enabled
- `npm run dev:css`: Runs TailwindCSS in development mode with watch enabled
- `npm run dev`: Runs the development server

### Production

- `npm run build:js`: Builds JavaScript with production optimizations
- `npm run build:css`: Builds and optimizes CSS for production
- `npm run build`: Runs the complete production build process
- `npm run clean`: Removes the dist directory
- `npm run copy-assets`: Copies static assets to the dist directory
- `npm run serve:prod`: Runs the server in production mode

## Building for Production

To build the application for production, run:

```bash
npm run build
```

This will:

1. Clean the `/dist` directory
2. Bundle and optimize JavaScript with Webpack
3. Process and optimize CSS with PostCSS/TailwindCSS
4. Copy and transform HTML and other static assets

## Environment Configuration

The application uses environment variables for configuration. These can be set in a `.env` file in the project root.

Copy the `.env.example` file to create your own `.env` file:

```bash
cp .env.example .env
```

### Important Environment Variables

- `NODE_ENV`: Set to `development` or `production`
- `API_URL`: The URL of the API server
- `PUBLIC_URL`: The public URL where the application is hosted
- `ENABLE_ANALYTICS`: Enable/disable analytics (true/false)

## Webpack Configuration

The Webpack configuration (`webpack.config.js`) includes:

- Multiple entry points for different application sections
- Production optimizations (minification, tree-shaking)
- Source maps for debugging
- Code splitting for optimal loading
- Polyfills for cross-browser compatibility

## Adding New Pages

To add a new page to the build system:

1. Create the HTML file in the `/public` directory
2. Add the JavaScript entry point in `webpack.config.js`
3. Add the file to the `assetsToCopy` array in `/scripts/copy-assets.mjs`

## Troubleshooting

### Common Issues

- **Missing dependencies**: Run `npm install` to ensure all dependencies are installed
- **Build errors**: Check the console output for specific error messages
- **Asset not found**: Ensure the file is included in the copy-assets script

For more help, refer to the project documentation or open an issue on the project repository.