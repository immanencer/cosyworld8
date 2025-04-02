
/**
 * RATiverse Node.js SDK
 * A client library for interacting with the RATi API
 */

import http from 'http';
import https from 'https';

class RATiVerseClient {
  /**
   * Create a new RATiverse client
   * @param {Object} config - Configuration options
   * @param {string} config.baseUrl - Base URL for the API
   * @param {string} [config.apiKey] - Optional API key for authentication
   */
  constructor(config) {
    this.baseUrl = new URL(config.baseUrl);
    this.apiKey = config.apiKey;
  }

  /**
   * Make a request to the API
   * @private
   * @param {string} method - HTTP method
   * @param {string} path - API path
   * @param {Object} [body] - Request body for POST requests
   * @returns {Promise<any>} - JSON response from the API
   */
  async _request(method, path, body = null) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: this.baseUrl.hostname,
        port: this.baseUrl.port || (this.baseUrl.protocol === 'https:' ? 443 : 80),
        path: path.startsWith('/') ? path : `/${path}`,
        method: method,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      if (this.apiKey) {
        options.headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      if (body) {
        body = JSON.stringify(body);
        options.headers['Content-Length'] = Buffer.byteLength(body);
      }

      const client = this.baseUrl.protocol === 'https:' ? https : http;
      const req = client.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(data));
            } catch (e) {
              reject(new Error(`Failed to parse response: ${e.message}`));
            }
          } else {
            try {
              const error = JSON.parse(data);
              reject(new Error(`API Error (${res.statusCode}): ${error.error || 'Unknown error'}`));
            } catch (e) {
              reject(new Error(`API Error (${res.statusCode}): Unknown error`));
            }
          }
        });
      });
      
      req.on('error', (error) => {
        reject(new Error(`Request failed: ${error.message}`));
      });
      
      if (body) {
        req.write(body);
      }
      
      req.end();
    });
  }

  // Avatar methods
  
  /**
   * Get all avatars
   * @returns {Promise<Array>} - Array of avatar objects
   */
  async getAllAvatars() {
    return this._request('GET', '/api/avatars');
  }
  
  /**
   * Get a specific avatar by ID
   * @param {string} id - Avatar ID
   * @returns {Promise<Object>} - Avatar object
   */
  async getAvatar(id) {
    return this._request('GET', `/api/avatars/${id}`);
  }
  
  /**
   * Get memories for a specific avatar
   * @param {string} id - Avatar ID
   * @returns {Promise<Array>} - Array of memory objects
   */
  async getAvatarMemory(id) {
    return this._request('GET', `/api/avatars/${id}/memory`);
  }
  
  // Item methods
  
  /**
   * Get all items
   * @returns {Promise<Array>} - Array of item objects
   */
  async getAllItems() {
    return this._request('GET', '/api/items');
  }
  
  /**
   * Get a specific item by ID
   * @param {string} id - Item ID
   * @returns {Promise<Object>} - Item object
   */
  async getItem(id) {
    return this._request('GET', `/api/items/${id}`);
  }
  
  // Location methods
  
  /**
   * Get all locations
   * @returns {Promise<Array>} - Array of location objects
   */
  async getAllLocations() {
    return this._request('GET', '/api/locations');
  }
  
  /**
   * Get a specific location by ID
   * @param {string} id - Location ID
   * @returns {Promise<Object>} - Location object
   */
  async getLocation(id) {
    return this._request('GET', `/api/locations/${id}`);
  }
  
  /**
   * Get all avatars in a specific location
   * @param {string} id - Location ID
   * @returns {Promise<Array>} - Array of avatar objects in the location
   */
  async getAvatarsInLocation(id) {
    return this._request('GET', `/api/locations/${id}/avatars`);
  }
  
  // Chat method
  
  /**
   * Chat with an avatar
   * @param {Object} request - Chat request
   * @param {string} request.avatarId - Avatar ID to chat with
   * @param {string} request.message - Message to send
   * @param {string} [request.locationId] - Optional location ID
   * @returns {Promise<Object>} - Chat response
   */
  async chatWithAvatar(request) {
    return this._request('POST', '/api/chat', request);
  }
}

module.exports = { RATiVerseClient };

// Example usage
/*
const client = new RATiVerseClient({
  baseUrl: 'http://localhost:3000'
});

async function main() {
  try {
    // Get all avatars
    const avatars = await client.getAllAvatars();
    console.log(`Found ${avatars.length} avatars`);
    
    // If there are avatars, chat with the first one
    if (avatars.length > 0) {
      const avatar = avatars[0];
      console.log(`Selected avatar: ${avatar.name}`);
      
      const response = await client.chatWithAvatar({
        avatarId: avatar.tokenId,
        message: "Hello, how are you today?"
      });
      
      console.log(`${avatar.name} says: ${response.response}`);
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}

main();
*/
