/**
 * API client for making requests to the backend
 * Provides standardized error handling and response parsing
 */

import { ENDPOINTS } from './config.js';
import { showToast } from '../utils/toast.js';

/**
 * Fetches JSON data from an endpoint
 * @param {string} url - The URL to fetch
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} - Parsed JSON response
 * @throws {Error} - If the request fails
 */
export async function fetchJSON(url, options = {}) {
  try {
    const res = await fetch(url, options);
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      const errorMessage = errorData?.message || `HTTP error: ${res.status}`;
      throw new Error(errorMessage);
    }
    
    return res.json();
  } catch (err) {
    console.error(`API Error (${url}):`, err);
    throw err;
  }
}

/**
 * Avatar-related API methods
 */
export const AvatarAPI = {
  /**
   * Get avatars with optional filtering
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - Avatars data
   */
  getAvatars: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return fetchJSON(`${ENDPOINTS.AVATARS}?${queryParams}`);
  },
  
  /**
   * Get a specific avatar by ID
   * @param {string} avatarId - Avatar ID
   * @returns {Promise<Object>} - Avatar data
   */
  getAvatarById: (avatarId) => fetchJSON(`${ENDPOINTS.AVATARS}/${avatarId}`),
  
  /**
   * Get narratives for an avatar
   * @param {string} avatarId - Avatar ID
   * @returns {Promise<Object>} - Narratives data
   */
  getNarratives: (avatarId) => fetchJSON(`${ENDPOINTS.AVATARS}/${avatarId}/narratives`),
  
  /**
   * Get dungeon actions for an avatar
   * @param {string} avatarId - Avatar ID
   * @returns {Promise<Object>} - Actions data
   */
  getActions: (avatarId) => fetchJSON(`${ENDPOINTS.AVATARS}/${avatarId}/dungeon-actions`),
  
  /**
   * Get stats for an avatar
   * @param {string} avatarId - Avatar ID
   * @returns {Promise<Object>} - Stats data
   */
  getStats: (avatarId) => fetchJSON(`${ENDPOINTS.AVATARS}/${avatarId}/stats`),
};

/**
 * X (Twitter) authentication API methods
 */
export const XAuthAPI = {
  /**
   * Get auth status for an avatar
   * @param {string} avatarId - Avatar ID
   * @returns {Promise<Object>} - Auth status
   */
  getStatus: (avatarId) => fetchJSON(`${ENDPOINTS.XAUTH}/status/${avatarId}`),
  
  /**
   * Initiate X auth process
   * @param {string} avatarId - Avatar ID
   * @param {Object} data - Auth data
   * @returns {Promise<Object>} - Auth initiation result
   */
  initiateAuth: (avatarId, data = {}) => fetchJSON(`${ENDPOINTS.XAUTH}/initiate/${avatarId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  
  /**
   * Disconnect X auth
   * @param {string} avatarId - Avatar ID
   * @returns {Promise<Object>} - Disconnect result
   */
  disconnect: (avatarId) => fetchJSON(`${ENDPOINTS.XAUTH}/disconnect/${avatarId}`, {
    method: 'POST'
  })
};

/**
 * Claims API methods
 */
export const ClaimsAPI = {
  /**
   * Get claim status for an avatar
   * @param {string} avatarId - Avatar ID
   * @returns {Promise<Object>} - Claim status
   */
  getStatus: (avatarId) => fetchJSON(`${ENDPOINTS.CLAIMS}/status/${avatarId}`),
  
  /**
   * Claim an avatar
   * @param {string} avatarId - Avatar ID
   * @param {Object} data - Claim data
   * @returns {Promise<Object>} - Claim result
   */
  claimAvatar: (avatarId, data = {}) => fetchJSON(`${ENDPOINTS.CLAIMS}/claim/${avatarId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
};

/**
 * Tribes API methods
 */
export const TribesAPI = {
  /**
   * Get tribe counts
   * @returns {Promise<Object>} - Tribe counts
   */
  getCounts: () => fetchJSON(`${ENDPOINTS.TRIBES}/counts`),
  
  /**
   * Get a specific tribe by emoji
   * @param {string} emoji - Tribe emoji
   * @returns {Promise<Object>} - Tribe data
   */
  getTribeByEmoji: (emoji) => fetchJSON(`${ENDPOINTS.TRIBES}/${emoji}`)
};

/**
 * Dungeon API methods
 */
export const DungeonAPI = {
  /**
   * Get action log
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - Action log data
   */
  getActionLog: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return fetchJSON(`${ENDPOINTS.DUNGEON}/log?${queryParams}`);
  }
};

/**
 * Social API methods
 */
export const SocialAPI = {
  /**
   * Get social posts
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - Posts data
   */
  getPosts: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return fetchJSON(`${ENDPOINTS.SOCIAL}/posts?${queryParams}`);
  }
};

/**
 * Leaderboard API methods
 */
export const LeaderboardAPI = {
  /**
   * Get leaderboard data
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - Leaderboard data
   */
  getLeaderboard: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return fetchJSON(`${ENDPOINTS.LEADERBOARD}?${queryParams}`);
  }
};