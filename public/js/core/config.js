/**
 * Application configuration
 * Centralizes all configuration values for the application
 */

export const API_BASE_URL = "/api";

export const ENDPOINTS = {
  AVATARS: `${API_BASE_URL}/avatars`,
  DUNGEON: `${API_BASE_URL}/dungeon`,
  SOCIAL: `${API_BASE_URL}/social`,
  CLAIMS: `${API_BASE_URL}/claims`,
  XAUTH: `${API_BASE_URL}/xauth`,
  TRIBES: `${API_BASE_URL}/tribes`,
  LEADERBOARD: `${API_BASE_URL}/leaderboard`
};

export const UI_CONFIG = {
  TOAST_DURATION: 3000, // milliseconds
  MODAL_ANIMATION_DURATION: 200, // milliseconds
  DEFAULT_PAGINATION_LIMIT: 12
};