/**
 * X (Twitter) Service
 * Handles X platform integration
 */

import { ENDPOINTS } from '../core/config.js';
import { showToast } from '../utils/toast.js';

class XService {
  /**
   * Initialize X authorization for an avatar
   * @param {string} avatarId - Avatar ID
   * @returns {Promise<Object>} - Auth result
   */
  async initiateXAuth(avatarId) {
    try {
      // First check current status
      const statusResponse = await fetch(`${ENDPOINTS.XAUTH}/status/${avatarId}`);
      const statusData = await statusResponse.json();
      
      // If already authorized, ask if user wants to disconnect instead
      if (statusData.authorized) {
        const confirmDisconnect = confirm(
          "This avatar is already connected to X. Do you want to disconnect it?"
        );
        
        if (confirmDisconnect) {
          return this.disconnectXAuth(avatarId);
        }
        
        return { success: false, error: "Operation cancelled" };
      }
      
      // Initiate auth process
      const response = await fetch(`${ENDPOINTS.XAUTH}/initiate/${avatarId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.authUrl) {
        // Open popup for auth
        const popup = window.open(
          data.authUrl, 
          'xauth', 
          'width=600,height=800,status=yes,scrollbars=yes'
        );
        
        if (!popup || popup.closed || typeof popup.closed === 'undefined') {
          throw new Error("Popup blocked! Please allow popups for this website.");
        }
        
        return { success: true, popup };
      } else {
        throw new Error(data.error || "Failed to initiate X authorization");
      }
    } catch (error) {
      console.error("X Auth Error:", error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Disconnect X authorization for an avatar
   * @param {string} avatarId - Avatar ID
   * @returns {Promise<Object>} - Disconnect result
   */
  async disconnectXAuth(avatarId) {
    try {
      const response = await fetch(`${ENDPOINTS.XAUTH}/disconnect/${avatarId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        return { success: true };
      } else {
        throw new Error(data.error || "Failed to disconnect X authorization");
      }
    } catch (error) {
      console.error("X Disconnect Error:", error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Check X authorization status for an avatar
   * @param {string} avatarId - Avatar ID
   * @returns {Promise<Object>} - Auth status
   */
  async checkXAuthStatus(avatarId) {
    try {
      const response = await fetch(`${ENDPOINTS.XAUTH}/status/${avatarId}`);
      const data = await response.json();
      
      return {
        success: true,
        authorized: data.authorized || false,
        requiresReauth: data.requiresReauth || false,
        expiresAt: data.expiresAt,
        error: data.error
      };
    } catch (error) {
      console.error("X Status Check Error:", error);
      return { 
        success: false, 
        authorized: false, 
        error: error.message 
      };
    }
  }
  
  /**
   * Post to X using an avatar
   * @param {string} avatarId - Avatar ID
   * @param {string} content - Post content
   * @returns {Promise<Object>} - Post result
   */
  async postToX(avatarId, content) {
    try {
      // First check authorization status
      const statusCheck = await this.checkXAuthStatus(avatarId);
      
      if (!statusCheck.authorized) {
        throw new Error("This avatar is not authorized to post to X");
      }
      
      if (statusCheck.requiresReauth) {
        throw new Error("X authorization expired. Please reconnect.");
      }
      
      // Post to X
      const response = await fetch(`${ENDPOINTS.XAUTH}/post/${avatarId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content })
      });
      
      const data = await response.json();
      
      if (data.success) {
        return { 
          success: true, 
          tweetId: data.tweetId,
          tweetUrl: data.tweetUrl 
        };
      } else {
        throw new Error(data.error || "Failed to post to X");
      }
    } catch (error) {
      console.error("X Post Error:", error);
      return { success: false, error: error.message };
    }
  }
}

// Create and export a singleton instance
const xService = new XService();
export default xService;