/**
 * Avatar Component
 * Renders avatars and their details
 */

import { AvatarAPI, ClaimsAPI, XAuthAPI } from '../core/api.js';
import { state } from '../core/state.js';
import { showToast } from '../utils/toast.js';
import { formatDate, shortenAddress, getActionIcon, getTierColorClass, getTier } from '../utils/formatting.js';

/**
 * Show avatar details in a modal
 * @param {string} avatarId - Avatar ID to display
 */
export async function showAvatarDetailsModal(avatarId) {
  const modal = document.getElementById("avatar-modal");
  const modalContent = document.getElementById("avatar-modal-content");
  
  if (!modal || !modalContent) {
    console.error("Avatar modal elements not found");
    return;
  }
  
  // Show modal with loading indicator
  modal.classList.remove("hidden");
  modal.classList.add("flex");
  
  modalContent.innerHTML = `
    <div class="text-center p-8">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
      <p class="mt-2 text-gray-400">Loading avatar details...</p>
    </div>
  `;
  
  try {
    // Fetch all necessary avatar data in parallel
    const [
      avatarResponse,
      xauthStatusResponse,
      claimStatusResponse,
      narrativesResponse,
      actionsResponse,
      statsResponse,
    ] = await Promise.all([
      AvatarAPI.getAvatarById(avatarId),
      XAuthAPI.getStatus(avatarId),
      ClaimsAPI.getStatus(avatarId),
      AvatarAPI.getNarratives(avatarId),
      AvatarAPI.getActions(avatarId),
      AvatarAPI.getStats(avatarId),
    ]);
    
    // Combine all data into one avatar object
    const avatar = {
      ...avatarResponse,
      stats: statsResponse,
      narratives: narrativesResponse?.narratives || [],
      actions: actionsResponse?.actions || [],
    };
    
    // Set the selected avatar for global access
    state.selectedAvatar = avatar;
    window.selectedAvatar = avatar;
    
    // Process X authorization status
    const xAuthStatus = processXAuthStatus(xauthStatusResponse);
    
    // Process claim status
    const isAvatarClaimed = claimStatusResponse?.claimed || false;
    const claimantAddress = claimStatusResponse?.claimedBy || '';
    const isClaimedByCurrentWallet = isAvatarClaimed &&
      claimantAddress?.toLowerCase() === state.wallet?.publicKey?.toLowerCase();
    
    // Render the modal content
    renderAvatarModalContent(modalContent, avatar, {
      xAuthStatus,
      claimInfo: {
        claimed: isAvatarClaimed,
        claimedBy: claimantAddress,
        isClaimedByCurrentWallet
      }
    });
    
    // Add event listeners for modal actions
    setupModalEventListeners(avatarId, xAuthStatus);
    
  } catch (err) {
    console.error("Error loading avatar details:", err);
    modalContent.innerHTML = `
      <div class="text-center py-12 text-red-500">
        Failed to load avatar details: ${err.message}
        <button onclick="closeAvatarModal()" class="block mx-auto mt-4 px-4 py-2 bg-gray-700 rounded">
          Close
        </button>
      </div>
    `;
  }
}

/**
 * Process X authorization status
 * @param {Object} response - X auth status response
 * @returns {Object} - Processed status
 */
function processXAuthStatus(response) {
  // Default values
  let result = {
    authorized: false,
    statusText: "Not Connected",
    statusClass: "bg-red-600",
    showButton: true,
    buttonText: "Connect X Account",
    message: "",
    loading: false,
  };
  
  if (!response) {
    return result;
  }
  
  // Process based on authorization status
  if (response.authorized) {
    result = {
      authorized: true,
      statusText: "Connected",
      statusClass: "bg-green-600",
      showButton: true,
      buttonText: "Disconnect",
      message: "Your X account is successfully linked to this avatar.",
      expiresAt: response.expiresAt,
      isDisconnect: true
    };
  } else if (response.requiresReauth) {
    result = {
      authorized: false,
      statusText: "Authorization Required",
      statusClass: "bg-yellow-600",
      showButton: true,
      buttonText: "Connect X Account",
      message: response.error || "Your X authorization needs to be renewed."
    };
  }
  
  return result;
}

/**
 * Render avatar modal content
 * @param {HTMLElement} container - Container element
 * @param {Object} avatar - Avatar data
 * @param {Object} options - Render options
 */
function renderAvatarModalContent(container, avatar, options) {
  const { xAuthStatus, claimInfo } = options;
  
  // Add X auth button and status display only if claimed by current wallet
  const xAuthSection = claimInfo.isClaimedByCurrentWallet ? `
    <div class="mt-4 border-t border-gray-700 pt-4">
      <h3 class="font-medium text-lg mb-2">X Connection Status</h3>
      <div class="flex items-center justify-between">
        <span class="px-2 py-1 rounded text-sm ${xAuthStatus.statusClass}">${xAuthStatus.statusText}</span>
        ${xAuthStatus.showButton ?
          `<button id="xauth-button" class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm">
            ${xAuthStatus.buttonText}
          </button>` : ''}
      </div>
      ${xAuthStatus.message ? `<p class="text-sm mt-2 text-gray-400">${xAuthStatus.message}</p>` : ''}
      ${xAuthStatus.expiresAt ? `<p class="text-sm mt-1 text-gray-400">Expires: ${formatDate(xAuthStatus.expiresAt)}</p>` : ''}
    </div>
  ` : '';
  
  // Add claim button only if avatar is not claimed and wallet is connected
  const claimSection = !claimInfo.claimed && state.wallet ?
    `<button id="claim-btn" class="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
      Claim this Avatar
    </button>` : '';
  
  // Render the modal content
  container.innerHTML = `
    <div class="relative p-6">
      <!-- Close button -->
      <button onclick="closeAvatarModal()" class="absolute top-4 right-4 text-gray-400 hover:text-white p-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      
      <!-- Avatar Details -->
      ${renderAvatarDetails(avatar, { claimInfo })}
      
      <!-- Additional sections for narratives, actions, etc. -->
      <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Narratives section -->
        <div class="bg-gray-800 p-4 rounded-lg">
          <h3 class="text-lg font-bold mb-2">Recent Narratives</h3>
          ${avatar.narratives.length > 0 ? `
            <div class="space-y-3">
              ${avatar.narratives.slice(0, 3).map(narrative => `
                <div class="bg-gray-700/50 p-3 rounded">
                  <p class="text-sm text-gray-300">${narrative.content}</p>
                  <div class="text-xs text-gray-500 mt-1">
                    ${formatDate(narrative.createdAt)}
                  </div>
                </div>
              `).join('')}
            </div>
          ` : '<p class="text-gray-400">No narratives available.</p>'}
        </div>
        
        <!-- Actions section -->
        <div class="bg-gray-800 p-4 rounded-lg">
          <h3 class="text-lg font-bold mb-2">Recent Actions</h3>
          ${avatar.actions.length > 0 ? `
            <div class="space-y-2">
              ${avatar.actions.slice(0, 5).map(action => `
                <div class="text-sm flex items-center gap-2 bg-gray-700/30 p-2 rounded">
                  <span class="text-lg">${getActionIcon(action.action)}</span>
                  <span>${action.description || action.action}</span>
                </div>
              `).join('')}
            </div>
          ` : '<p class="text-gray-400">No recent actions.</p>'}
        </div>
      </div>
      
      <!-- X Auth Section -->
      ${xAuthSection}

      <!-- Claim Section -->
      ${claimSection}
    </div>
  `;
}

/**
 * Set up avatar modal event listeners
 * @param {string} avatarId - Avatar ID
 * @param {Object} xAuthStatus - X auth status
 */
function setupModalEventListeners(avatarId, xAuthStatus) {
  // X auth button
  if (xAuthStatus.showButton) {
    const xauthButton = document.getElementById("xauth-button");
    if (xauthButton) {
      if (xAuthStatus.isDisconnect) {
        xauthButton.addEventListener("click", () => disconnectXAuth(avatarId));
      } else {
        xauthButton.addEventListener("click", () => initiateXAuth(avatarId));
      }
    }
  }
  
  // Claim button
  const claimBtn = document.getElementById('claim-btn');
  if (claimBtn) {
    claimBtn.addEventListener('click', () => claimAvatar(avatarId));
  }
}

/**
 * Initiate X authentication
 * @param {string} avatarId - Avatar ID
 */
async function initiateXAuth(avatarId) {
  try {
    // Import the X service dynamically
    const xServiceModule = await import('../services/xService.mjs');
    const xService = xServiceModule.default;
    
    showToast("Initiating X authorization...");
    
    const result = await xService.initiateXAuth(avatarId);
    
    if (result.success) {
      showToast("X authorization initiated. Please complete the process in the popup window.");
      
      // Set up a listener for auth callback messages from the popup
      window.addEventListener('message', function authMessageListener(event) {
        if (event.data.type === 'X_AUTH_SUCCESS') {
          showToast("X authorization successful!", { type: 'success' });
          window.removeEventListener('message', authMessageListener);
          
          // Refresh the avatar modal to show updated status
          showAvatarDetailsModal(avatarId);
        } else if (event.data.type === 'X_AUTH_ERROR') {
          showToast(`X authorization failed: ${event.data.error || 'Unknown error'}`, { type: 'error' });
          window.removeEventListener('message', authMessageListener);
        }
      });
    } else {
      showToast(`Error initiating X authorization: ${result.error}`, { type: 'error' });
    }
  } catch (error) {
    console.error("Error initiating X auth:", error);
    showToast(`Error initiating X authorization: ${error.message}`, { type: 'error' });
  }
}

/**
 * Disconnect X authentication
 * @param {string} avatarId - Avatar ID
 */
async function disconnectXAuth(avatarId) {
  try {
    // Import the X service dynamically
    const xServiceModule = await import('../services/xService.mjs');
    const xService = xServiceModule.default;
    
    showToast("Disconnecting X account...");
    
    const result = await xService.disconnectXAuth(avatarId);
    
    if (result.success) {
      showToast("X account disconnected successfully.", { type: 'success' });
      // Refresh the avatar modal to show updated status
      showAvatarDetailsModal(avatarId);
    } else {
      showToast(`Error disconnecting X account: ${result.error}`, { type: 'error' });
    }
  } catch (error) {
    console.error("Error disconnecting X auth:", error);
    showToast(`Error disconnecting X account: ${error.message}`, { type: 'error' });
  }
}

/**
 * Claim an avatar
 * @param {string} avatarId - Avatar ID
 */
async function claimAvatar(avatarId) {
  try {
    if (!state.wallet || !state.wallet.publicKey) {
      showToast("Please connect your wallet first", { type: 'warning' });
      return;
    }
    
    showToast("Processing claim...");
    
    const response = await fetch(`/api/claims/claim/${avatarId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        walletAddress: state.wallet.publicKey
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      showToast("Avatar claimed successfully!", { type: 'success' });
      // Close modal and refresh content
      closeAvatarModal();
      if (window.loadContent) {
        window.loadContent();
      }
    } else {
      throw new Error(data.error || "Failed to claim avatar");
    }
  } catch (err) {
    console.error("Claim error:", err);
    showToast(`Failed to claim avatar: ${err.message}`, { type: 'error' });
  }
}

/**
 * Render avatar details
 * @param {Object} avatar - Avatar data
 * @param {Object} options - Render options
 * @returns {string} - Avatar details HTML
 */
export function renderAvatarDetails(avatar, options = {}) {
  const { claimInfo = {} } = options;
  
  return `
    <div class="flex flex-col md:flex-row gap-6">
      <!-- Avatar image -->
      <div class="md:w-1/3">
        <div class="relative">
          <img 
            src="${avatar.imageUrl}" 
            alt="${avatar.name}" 
            class="w-full aspect-square object-cover rounded-lg"
            onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'100\\' height=\\'100\\' viewBox=\\'0 0 100 100\\'%3E%3Crect fill=\\'%23333\\' width=\\'100\\' height=\\'100\\'/%3E%3Ctext fill=\\'%23FFF\\' x=\\'50\\' y=\\'50\\' font-size=\\'50\\' text-anchor=\\'middle\\' dominant-baseline=\\'middle\\'%3E${avatar.name.charAt(0).toUpperCase()}%3C/text%3E%3C/svg%3E';"
          >
          ${claimInfo.claimed ? `
            <div class="absolute top-2 right-2 px-2 py-1 bg-green-600 text-white text-xs rounded-full">
              Claimed
            </div>
          ` : ''}
        </div>
        
        <!-- Tier badge -->
        <div class="mt-3 flex justify-center">
          <span class="px-3 py-1 rounded text-sm font-bold ${getTierColorClass(avatar.model)}">
            Tier ${getTier(avatar.model)}
          </span>
        </div>
      </div>
      
      <!-- Avatar information -->
      <div class="md:w-2/3">
        <h2 class="text-2xl font-bold">${avatar.name}</h2>
        
        ${avatar.description ? `
          <p class="text-gray-300 mt-2">${avatar.description}</p>
        ` : ''}
        
        <!-- Stats -->
        <div class="mt-4 grid grid-cols-2 gap-3">
          <div class="bg-gray-800/50 p-3 rounded">
            <div class="text-sm text-gray-400">Score</div>
            <div class="text-xl font-bold">${avatar.score || 0}</div>
          </div>
          <div class="bg-gray-800/50 p-3 rounded">
            <div class="text-sm text-gray-400">Messages</div>
            <div class="text-xl font-bold">${avatar.messageCount || 0}</div>
          </div>
        </div>
        
        <!-- Claim information -->
        ${claimInfo.claimed ? `
          <div class="mt-4 bg-gray-800/50 p-3 rounded">
            <div class="flex justify-between items-center">
              <div class="text-sm text-gray-400">Claimed by</div>
              <div>${shortenAddress(claimInfo.claimedBy)}</div>
            </div>
          </div>
        ` : ''}
        
        <!-- Emoji/Tribe -->
        ${avatar.emoji ? `
          <div class="mt-4 flex items-center">
            <span class="text-2xl mr-2">${avatar.emoji}</span>
            <span class="text-gray-400">Tribe Member</span>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

/**
 * Render avatar card
 * @param {Object} avatar - Avatar data
 * @param {Object} options - Render options
 * @param {boolean} isClaimed - Whether the avatar is claimed
 * @param {string} claimedBy - Address that claimed the avatar
 * @returns {string} - Avatar card HTML
 */
export function renderAvatarCard(avatar, options = {}, isClaimed = false, claimedBy = '') {
  return `
    <div class="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition-colors ${isClaimed ? 'border-l-2 border-green-500' : ''}">
      <div class="aspect-w-1 aspect-h-1">
        <img 
          src="${avatar.thumbnailUrl || avatar.imageUrl}" 
          alt="${avatar.name}" 
          class="w-full h-full object-cover"
          onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'100\\' height=\\'100\\' viewBox=\\'0 0 100 100\\'%3E%3Crect fill=\\'%23333\\' width=\\'100\\' height=\\'100\\'/%3E%3Ctext fill=\\'%23FFF\\' x=\\'50\\' y=\\'50\\' font-size=\\'50\\' text-anchor=\\'middle\\' dominant-baseline=\\'middle\\'%3E${avatar.name.charAt(0).toUpperCase()}%3C/text%3E%3C/svg%3E';"
        >
      </div>
      <div class="p-4">
        <div class="flex justify-between items-start mb-2">
          <h3 class="font-bold text-lg truncate">${avatar.name}</h3>
          <span class="px-2 py-0.5 rounded text-xs font-bold ${getTierColorClass(avatar.model)}">
            ${getTier(avatar.model)}
          </span>
        </div>
        <p class="text-sm text-gray-400 truncate">${avatar.description || ''}</p>
        ${isClaimed ? 
          `<div class="mt-2 text-xs text-green-400 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            Claimed
          </div>` : 
          ''
        }
      </div>
    </div>
  `;
}

/**
 * Render leaderboard card
 * @param {Object} avatar - Avatar data
 * @param {boolean} isClaimed - Whether the avatar is claimed
 * @returns {string} - Leaderboard card HTML
 */
export function renderLeaderboardCard(avatar, isClaimed = false) {
  return `
    <div class="avatar-card bg-gray-800 p-3 rounded-lg hover:bg-gray-700 transition-colors ${isClaimed ? 'border-l-2 border-green-500' : ''}">
      <div class="flex gap-3 items-center">
        <div class="relative">
          <img 
            src="${avatar.thumbnailUrl || avatar.imageUrl}" 
            alt="${avatar.name}" 
            class="w-16 h-16 object-cover rounded-full border-2 border-gray-600"
            onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'100\\' height=\\'100\\' viewBox=\\'0 0 100 100\\'%3E%3Crect fill=\\'%23333\\' width=\\'100\\' height=\\'100\\'/%3E%3Ctext fill=\\'%23FFF\\' x=\\'50\\' y=\\'50\\' font-size=\\'50\\' text-anchor=\\'middle\\' dominant-baseline=\\'middle\\'%3E${avatar.name.charAt(0).toUpperCase()}%3C/text%3E%3C/svg%3E';"
          >
          ${isClaimed ? `<div class="absolute -top-1 -right-1 bg-green-500 rounded-full w-5 h-5 flex items-center justify-center text-xs">✓</div>` : ''}
        </div>
        
        <div class="flex-1 min-w-0">
          <h3 class="text-sm font-semibold truncate">${avatar.name}</h3>
          <p class="text-xs text-gray-400">Score: ${avatar.score || 0}</p>
          
          <div class="flex items-center gap-2 mt-1">
            <span class="px-1.5 py-0.5 rounded text-xs font-bold ${getTierColorClass(avatar.model)}">
              Tier ${getTier(avatar.model)}
            </span>
            ${isClaimed ? `<span class="text-xs text-green-400">Claimed</span>` : ''}
          </div>
        </div>
      </div>
    </div>
  `;
}

// Make components available globally for backward compatibility
window.AvatarDetails = {
  renderAvatarCard,
  renderLeaderboardCard,
  renderAvatarDetails
};