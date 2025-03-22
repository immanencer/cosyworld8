/**
 * Application Configuration
 * 
 * This module provides configuration values for the application.
 * In production, these values are replaced during the build process.
 */

// Browser-safe environment variables
const ENV = {
  NODE_ENV: window.ENV_NODE_ENV || 'development',
  API_URL: window.ENV_API_URL || '/api',
  PUBLIC_URL: window.ENV_PUBLIC_URL || '',
  ENABLE_ANALYTICS: window.ENV_ENABLE_ANALYTICS || 'false'
};

/**
 * Get the current environment (development or production)
 * @returns {string} The current environment
 */
export function getEnvironment() {
  return ENV.NODE_ENV;
}

/**
 * Check if the application is running in production
 * @returns {boolean} True if in production, false otherwise
 */
export function isProduction() {
  return getEnvironment() === 'production';
}

/**
 * Get the API URL based on the current environment
 * @returns {string} The API URL
 */
export function getApiUrl() {
  return ENV.API_URL;
}

// Get the base API URL
export const API_BASE_URL = getApiUrl();

// Define API endpoints
export const ENDPOINTS = {
  AVATARS: `${API_BASE_URL}/avatars`,
  DUNGEON: `${API_BASE_URL}/dungeon`,
  SOCIAL: `${API_BASE_URL}/social`,
  CLAIMS: `${API_BASE_URL}/claims`,
  XAUTH: `${API_BASE_URL}/xauth`,
  TRIBES: `${API_BASE_URL}/tribes`,
  LEADERBOARD: `${API_BASE_URL}/leaderboard`
};

// UI Configuration
export const UI_CONFIG = {
  TOAST_DURATION: 3000, // milliseconds
  MODAL_ANIMATION_DURATION: 200, // milliseconds
  DEFAULT_PAGINATION_LIMIT: 12,
  DEFAULT_TAB: 'squad',
  WALLET_AUTO_CONNECT: false
};

/**
 * Get the public URL for the application
 * @returns {string} The public URL
 */
export function getPublicUrl() {
  return ENV.PUBLIC_URL;
}

/**
 * Check if analytics are enabled
 * @returns {boolean} True if analytics are enabled
 */
export function isAnalyticsEnabled() {
  return ENV.ENABLE_ANALYTICS === 'true';
}

/**
 * Complete application configuration object
 */
export const config = {
  env: getEnvironment(),
  isProduction: isProduction(),
  apiUrl: API_BASE_URL,
  publicUrl: getPublicUrl(),
  analyticsEnabled: isAnalyticsEnabled(),
  endpoints: ENDPOINTS,
  ui: UI_CONFIG
};

export default config;