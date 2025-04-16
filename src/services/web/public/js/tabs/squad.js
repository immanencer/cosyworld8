/**
 * Squad Tab
 * Displays avatars claimed by the user
 */

import { state } from '../core/state.js';
import { AvatarAPI, ClaimsAPI } from '../core/api.js';
import { showToast } from '../utils/toast.js';
import { shortenAddress } from '../utils/formatting.js';

/**
 * Load squad tab content
 */
export async function loadContent() {
  const content = document.getElementById("content");
  if (!content) return;
  
  // Check if wallet is connected
  if (!state.wallet || !state.wallet.publicKey) {
    renderWalletPrompt(content);
    return;
  }
  
  try {
    // Get user avatars
    const data = await AvatarAPI.getAvatars({
      walletAddress: state.wallet.publicKey,
      view: 'claims',
      page: 1,
      limit: 12
    });
    
    if (!data.avatars || data.avatars.length === 0) {
      renderEmptyState(content);
      return;
    }
    
    // Add claim status to each avatar
    const avatarsWithStatus = await Promise.all(data.avatars.map(async (avatar) => {
      try {
        const claimStatus = await ClaimsAPI.getStatus(avatar._id);
        return {
          ...avatar,
          mintStatus: claimStatus.claimed && !claimStatus.minted ? 'unminted' : 'minted',
          isClaimed: claimStatus.claimed,
          claimedBy: claimStatus.claimedBy || '',
          claimId: claimStatus._id
        };
      } catch (err) {
        console.warn(`Failed to get claim status for avatar ${avatar._id}:`, err);
        return {
          ...avatar,
          mintStatus: 'unknown',
          isClaimed: false,
          claimedBy: ''
        };
      }
    }));
    
    renderAvatarGrid(content, avatarsWithStatus);
  } catch (err) {
    console.error("Load Squad error:", err);
    content.innerHTML = `
      <div class="text-center py-12 text-red-500">
        Failed to load Squad: ${err.message}
        <button class="mt-4 px-4 py-2 bg-primary-600 rounded" onclick="loadContent()">
          Retry
        </button>
      </div>
    `;
  }
}

/**
 * Render wallet connection prompt
 * @param {HTMLElement} container - Container element
 */
function renderWalletPrompt(container) {
  container.innerHTML = `
    <div class="text-center py-12">
      <p class="mb-4">Connect your wallet to view your Squad</p>
      <button class="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded text-white transition" onclick="connectWallet()">
        Connect Wallet
      </button>
    </div>
  `;
}

/**
 * Render empty state when no avatars found
 * @param {HTMLElement} container - Container element
 */
function renderEmptyState(container) {
  container.innerHTML = `
    <div class="max-w-4xl mx-auto px-4">
      <div class="text-center py-12">
        <h2 class="text-2xl font-bold mb-4">No Squad Members Found</h2>
        <p class="text-gray-400 mb-6">
          You haven't claimed any avatars yet. Explore the leaderboard to find avatars to claim!
        </p>
        <button 
          onclick="setActiveTab('leaderboard')" 
          class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded transition"
        >
          Browse Leaderboard
        </button>
      </div>
    </div>
  `;
}

/**
 * Render avatar grid
 * @param {HTMLElement} container - Container element
 * @param {Array} avatars - List of avatars to render
 */
function renderAvatarGrid(container, avatars) {
  const renderAvatarCard = window.AvatarDetails?.renderAvatarCard || defaultRenderAvatarCard;
  container.innerHTML = `
    <div class="max-w-7xl mx-auto px-4">
      <div class="text-center py-4">
        <h2 class="text-xl font-bold">Wallet: ${shortenAddress(state.wallet.publicKey)}</h2>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        ${avatars.map(avatar => `
          <div class="cursor-pointer relative group">
            ${renderAvatarCard(avatar, null, avatar.isClaimed, avatar.claimedBy)}
            ${avatar.mintStatus === 'unminted' ?
              `<div class="absolute top-2 right-2 px-2 py-1 bg-yellow-600 text-white text-xs rounded-full">Unminted</div>` : ''}
            ${!avatar.isClaimed ?
              `<button class="absolute bottom-4 left-4 right-4 px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded transition opacity-90 group-hover:opacity-100" onclick="event.stopPropagation(); claimAvatar('${avatar._id}')">Claim</button>` :
              avatar.mintStatus === 'unminted' ?
                `<button class="absolute bottom-4 left-4 right-4 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition opacity-90 group-hover:opacity-100" onclick="event.stopPropagation(); mintClaim('${avatar.claimId}')">Mint NFT</button>` :
                `<div class="absolute bottom-4 left-4 right-4 px-3 py-2 bg-gray-700 text-white text-xs rounded text-center opacity-90 group-hover:opacity-100">Minted</div>`
            }
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

/**
 * Default avatar card renderer if AvatarDetails component is not available
 * @param {Object} avatar - Avatar data
 * @param {Object} options - Render options
 * @param {boolean} isClaimed - Whether the avatar is claimed
 * @param {string} claimedBy - Address that claimed the avatar
 * @returns {string} - Avatar card HTML
 */
function defaultRenderAvatarCard(avatar, options, isClaimed, claimedBy) {
  return `
    <div class="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition-colors ${isClaimed ? 'border-l-2 border-green-500' : ''}">
      <div class="aspect-w-1 aspect-h-1 relative">
        <img 
          src="${avatar.thumbnailUrl || avatar.imageUrl}" 
          alt="${avatar.name}" 
          class="object-cover w-full h-full"
          onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'100\\' height=\\'100\\' viewBox=\\'0 0 100 100\\'%3E%3Crect fill=\\'%23333\\' width=\\'100\\' height=\\'100\\'/%3E%3Ctext fill=\\'%23FFF\\' x=\\'50\\' y=\\'50\\' font-size=\\'50\\' text-anchor=\\'middle\\' dominant-baseline=\\'middle\\'%3E${avatar.name.charAt(0).toUpperCase()}%3C/text%3E%3C/svg%3E';"
        >
      </div>
      <div class="p-4">
        <h3 class="font-bold text-lg truncate">${avatar.name}</h3>
        <p class="text-sm text-gray-400 mt-1 truncate">${avatar.description || ''}</p>
      </div>
    </div>
  `;
}

/**
 * Mint a claim
 * @param {string} claimId - Claim ID to mint
 */
async function mintClaim(claimId) {
  try {
    showToast("Minting started...");
    
    const response = await fetch(`/api/claims/mint/${claimId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      showToast("Minting successful!", { type: 'success' });
      // Reload content to reflect changes
      loadContent();
    } else {
      throw new Error(data.error || "Minting failed");
    }
  } catch (err) {
    console.error("Mint error:", err);
    showToast(`Minting failed: ${err.message}`, { type: 'error' });
  }
}

// Add claimAvatar function for claim button
window.claimAvatar = async function(avatarId) {
  try {
    showToast("Claiming avatar...");
    const response = await fetch(`/api/claims/claim/${avatarId}`, { method: 'POST' });
    const data = await response.json();
    if (data.success) {
      showToast("Avatar claimed!", { type: 'success' });
      loadContent();
    } else {
      throw new Error(data.error || "Claim failed");
    }
  } catch (err) {
    showToast(`Claim failed: ${err.message}`, { type: 'error' });
  }
};