/**
 * X (Twitter) Authentication Service
 * Handles X authentication for avatars
 */

// Base API URL for X auth endpoints
const API_BASE = '/api/xauth';

/**
 * Initialize X authorization for an avatar
 * @param {string} avatarId - The ID of the avatar to authorize
 * @returns {Promise<Object>} - Response with success/error information
 */
async function initiateXAuth(avatarId) {
  try {
    // Make the API request
    const response = await fetch(`${API_BASE}/auth-url?avatarId=${avatarId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Check if the server returned a 404 - endpoint not found
    if (response.status === 404) {
      console.error('X auth API endpoint not found. Server may not support X integration yet.');
      return {
        success: false,
        error: 'X integration is not available on this server.'
      };
    }

    // For other error codes
    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      let errorMessage;

      // Try to parse JSON response if that's what we got
      if (contentType && contentType.includes('application/json')) {
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || `Server error: ${response.status}`;
        } catch (e) {
          errorMessage = `Failed to parse error response: ${e.message}`;
        }
      } else {
        // For non-JSON responses (like HTML error pages)
        errorMessage = `Server returned: ${response.status} ${response.statusText}`;
      }

      return {
        success: false,
        error: errorMessage
      };
    }

    // Parse the successful response
    const data = await response.json();

    // Open the authorization URL in a new window
    if (data.url) {
      // Open a small centered popup window
      const width = 600;
      const height = 600;
      const left = (window.innerWidth - width) / 2;
      const top = (window.innerHeight - height) / 2;

      const popup = window.open(
        data.url,
        'xAuth',
        `width=${width},height=${height},top=${top},left=${left}`
      );

      // Check if popup was blocked
      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        return {
          success: false,
          error: 'Popup blocked. Please allow popups for this site.'
        };
      }

      return {
        success: true,
        popup
      };
    }

    return {
      success: false,
      error: 'No authorization URL provided by the server.'
    };
  } catch (error) {
    console.error('Error initiating X auth:', error);
    return {
      success: false,
      error: error.message || 'An unknown error occurred connecting to the server.'
    };
  }
}

/**
 * Disconnect X authorization for an avatar
 * @param {string} avatarId - The ID of the avatar to disconnect
 * @returns {Promise<Object>} - Response with success/error information
 */
async function disconnectXAuth(avatarId) {
  try {
    const response = await fetch(`${API_BASE}/disconnect/${avatarId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Check if the server returned a 404 - endpoint not found
    if (response.status === 404) {
      console.error('X auth disconnect endpoint not found. Server may not support X integration yet.');
      return {
        success: false,
        error: 'X integration is not available on this server.'
      };
    }

    // For other error codes
    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      let errorMessage;

      // Try to parse JSON response if that's what we got
      if (contentType && contentType.includes('application/json')) {
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || `Server error: ${response.status}`;
        } catch (e) {
          errorMessage = `Failed to parse error response: ${e.message}`;
        }
      } else {
        // For non-JSON responses (like HTML error pages)
        errorMessage = `Server returned: ${response.status} ${response.statusText}`;
      }

      return {
        success: false,
        error: errorMessage
      };
    }
    
    // Parse the successful response
    try {
      const data = await response.json();
      return {
        success: true,
        message: data.message || 'X account disconnected successfully.'
      };
    } catch (e) {
      console.error('Failed to parse JSON response:', e);
      return {
        success: false,
        error: 'Invalid response from server.'
      };
    }
  } catch (error) {
    console.error('Error disconnecting X auth:', error);
    return {
      success: false,
      error: error.message || 'An unknown error occurred connecting to the server.'
    };
  }
}

export default {
  initiateXAuth,
  disconnectXAuth
};
