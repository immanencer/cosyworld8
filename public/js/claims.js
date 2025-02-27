// Claims page logic

// Global variables
let claims = [];
let allowance = { allowed: false, remaining: 0, current: 0 };
let pendingSignatures = {};

// DOM Elements
const claimsContainer = document.getElementById('claims-container');
const claimFormContainer = document.getElementById('claim-form-container');

// Function to be called when wallet is connected
function onWalletConnected() {
  loadUserClaims();
}

// Function to be called when wallet is disconnected
function onWalletDisconnected() {
  claims = [];
  allowance = { allowed: false, remaining: 0, current: 0 };
  if (claimsContainer) {
    claimsContainer.innerHTML = '<div class="text-center py-8">Connect your wallet to view claims</div>';
  }
  if (claimFormContainer) {
    claimFormContainer.classList.add('hidden');
  }
}

// Load user claims
async function loadUserClaims() {
  if (!walletState.wallet) return;
  
  const claimsContainer = document.getElementById('claims-container');
  if (!claimsContainer) {
    console.error('Claims container not found when rendering claims');
    return;
  }
  
  claimsContainer.innerHTML = `
    <div class="text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
      <p class="mt-2 text-gray-400">Loading your claims...</p>
    </div>
  `;
  
  try {
    const response = await fetch(`/api/claims/user/${walletState.wallet.publicKey}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch claims');
    }
    
    claims = data.claims || [];
    allowance = data.allowance || { allowed: false, remaining: 0, current: 0 };
    
    renderClaims();
    renderClaimForm();
  } catch (error) {
    console.error('Load claims error:', error);
    claimsContainer.innerHTML = `
      <div class="text-center py-8 text-red-500">
        Failed to load claims: ${error.message}
        <button onclick="loadUserClaims()" class="block mx-auto mt-4 px-4 py-2 bg-gray-700 rounded">
          Retry
        </button>
      </div>
    `;
  }
}

// Render claims
function renderClaims() {
  const container = document.getElementById('claims-container');
  if (!container) {
    console.error('Claims container not found when rendering claims');
    return;
  }
  
  if (claims.length === 0) {
    container.innerHTML = `
      <div class="text-center py-8 text-gray-400">
        You haven't claimed any avatars yet.
        ${allowance.allowed ? 
          `<p class="mt-2">You can claim up to ${allowance.remaining} more avatars.</p>` : 
          '<p class="mt-2">You have reached your claim limit.</p>'
        }
      </div>
    `;
    return;
  }
  
  container.innerHTML = `
    <div class="mb-4">
      <h2 class="text-xl font-bold">Your Claims</h2>
      <p class="text-sm text-gray-400">
        You have claimed ${allowance.current} avatar${allowance.current !== 1 ? 's' : ''}.
        ${allowance.allowed ? 
          `You can claim ${allowance.remaining} more.` : 
          'You have reached your claim limit.'
        }
      </p>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      ${claims.map(claim => renderClaimCard(claim)).join('')}
    </div>
  `;
}

// Render claim card
function renderClaimCard(claimData) {
  const { claim, avatar } = claimData;
  if (!avatar) {
    return `
      <div class="bg-gray-800 p-4 rounded-lg">
        <p class="text-center text-gray-400">Avatar data not available</p>
        <p class="text-xs text-center text-gray-500 mt-2">ID: ${claim.avatarId}</p>
      </div>
    `;
  }
  
  return `
    <div class="bg-gray-800 p-4 rounded-lg">
      <div class="flex items-center gap-3">
        <img 
          src="${avatar.thumbnailUrl || avatar.imageUrl || ''}" 
          alt="${avatar.name || 'Avatar'}" 
          class="w-16 h-16 object-cover rounded-full"
          onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'100\\' height=\\'100\\' viewBox=\\'0 0 100 100\\'%3E%3Crect fill=\\'%23333\\' width=\\'100\\' height=\\'100\\'/%3E%3Ctext fill=\\'%23FFF\\' x=\\'50\\' y=\\'50\\' font-size=\\'50\\' text-anchor=\\'middle\\' dominant-baseline=\\'middle\\'%3E${(avatar.name || 'A').charAt(0).toUpperCase()}%3C/text%3E%3C/svg%3E';"
        >
        
        <div class="flex-1 min-w-0">
          <h3 class="font-bold truncate">${avatar.name || 'Unknown'}</h3>
          <div class="text-xs text-gray-400">
            Claimed: ${new Date(claim.createdAt).toLocaleDateString()}
          </div>
          <div class="mt-1 flex items-center">
            <span class="px-2 py-0.5 text-xs rounded ${getStatusBadgeColor(claim.status)}">
              ${formatClaimStatus(claim.status)}
            </span>
          </div>
        </div>
        
        ${avatar.emoji ? `<div class="text-2xl">${avatar.emoji}</div>` : ''}
      </div>
      
      <div class="mt-4 flex justify-between items-center">
        <button 
          onclick="viewAvatar('${avatar._id}')"
          class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
        >
          View Details
        </button>
        
        ${claim.status === 'minted' ? `
          <a 
            href="${getMarketplaceUrl(claim)}" 
            target="_blank"
            class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
          >
            View on Marketplace
          </a>
        ` : claim.status === 'pending' ? `
          <div class="text-xs text-gray-400">
            Pending mint
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

// Render claim form
function renderClaimForm() {
  const claimFormContainer = document.getElementById('claim-form-container');
  if (!claimFormContainer) {
    console.error('Claim form container not found when rendering form');
    return;
  }
  
  if (!allowance.allowed) {
    claimFormContainer.classList.add('hidden');
    return;
  }
  
  claimFormContainer.classList.remove('hidden');
  claimFormContainer.innerHTML = `
    <div class="bg-gray-800 p-6 rounded-lg">
      <h2 class="text-xl font-bold mb-4">Claim a New Avatar</h2>
      
      <div class="mb-4">
        <label for="avatar-id" class="block text-sm font-medium text-gray-300">Avatar ID</label>
        <input 
          type="text" 
          id="avatar-id" 
          placeholder="Enter Avatar ID"
          class="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
      </div>
      
      <div class="mb-4">
        <button
          onclick="findAvatar()"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
        >
          Find Avatar
        </button>
      </div>
      
      <div id="avatar-preview" class="hidden bg-gray-700 p-4 rounded-lg mb-4">
        <!-- Avatar preview will be inserted here -->
      </div>
      
      <button
        onclick="claimAvatar()"
        id="claim-btn"
        class="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-bold disabled:bg-gray-600 disabled:cursor-not-allowed"
        disabled
      >
        Sign & Claim Avatar
      </button>
    </div>
  `;
}

// Format claim status
function formatClaimStatus(status) {
  switch (status) {
    case 'pending': return 'Pending';
    case 'minted': return 'Minted';
    case 'failed': return 'Failed';
    default: return 'Unknown';
  }
}

// Get status badge color
function getStatusBadgeColor(status) {
  switch (status) {
    case 'pending': return 'bg-yellow-600';
    case 'minted': return 'bg-green-600';
    case 'failed': return 'bg-red-600';
    default: return 'bg-gray-600';
  }
}

// Get marketplace URL (placeholder)
function getMarketplaceUrl(claim) {
  // This would be replaced with your actual marketplace URL logic
  return `https://testnets.opensea.io/assets/base-sepolia/${claim.contractAddress || '0x0000'}/${claim.tokenId || '0'}`;
}

// Find avatar by ID
async function findAvatar() {
  const avatarIdInput = document.getElementById('avatar-id');
  const avatarId = avatarIdInput.value.trim();
  const avatarPreview = document.getElementById('avatar-preview');
  const claimBtn = document.getElementById('claim-btn');
  
  if (!avatarId) {
    showAlert('Please enter an Avatar ID');
    return;
  }
  
  avatarPreview.innerHTML = `
    <div class="text-center py-4">
      <div class="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
      <p class="mt-2 text-xs text-gray-400">Looking for avatar...</p>
    </div>
  `;
  avatarPreview.classList.remove('hidden');
  claimBtn.disabled = true;
  
  try {
    // First check if avatar is already claimed
    const claimStatusRes = await fetch(`/api/claims/status/${avatarId}`);
    const claimStatusData = await claimStatusRes.json();
    
    if (!claimStatusRes.ok) {
      throw new Error(claimStatusData.error || 'Failed to check claim status');
    }
    
    if (claimStatusData.claimed) {
      avatarPreview.innerHTML = `
        <div class="text-center py-4 text-red-500">
          This avatar has already been claimed by 
          <span class="cursor-pointer text-blue-500" onclick="copyToClipboard('${claimStatusData.claimedBy}')">
            ${shortenAddress(claimStatusData.claimedBy)}
          </span>.
        </div>
      `;
      return;
    }
    
    // If not claimed, fetch avatar details
    const avatarRes = await fetch(`/api/avatars/${avatarId}`);
    const avatar = await avatarRes.json();
    
    if (!avatarRes.ok) {
      throw new Error(avatar.error || 'Failed to fetch avatar');
    }
    
    // Store avatar data for claim process
    window.selectedAvatar = avatar;
    
    // Render avatar preview
    avatarPreview.innerHTML = `
      <div class="flex items-center gap-3">
        <img 
          src="${avatar.thumbnailUrl || avatar.imageUrl || ''}" 
          alt="${avatar.name}" 
          class="w-16 h-16 object-cover rounded-full"
          onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'100\\' height=\\'100\\' viewBox=\\'0 0 100 100\\'%3E%3Crect fill=\\'%23333\\' width=\\'100\\' height=\\'100\\'/%3E%3Ctext fill=\\'%23FFF\\' x=\\'50\\' y=\\'50\\' font-size=\\'50\\' text-anchor=\\'middle\\' dominant-baseline=\\'middle\\'%3E${(avatar.name || 'A').charAt(0).toUpperCase()}%3C/text%3E%3C/svg%3E';"
        >
        <div class="flex-1 min-w-0">
          <h3 class="font-bold truncate">${avatar.name || 'Unknown'}</h3>
          <div class="text-xs text-gray-400">
            Created: ${new Date(avatar.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    `;
    
    claimBtn.disabled = false;
  } catch (error) {
    console.error('Find avatar error:', error);
    avatarPreview.innerHTML = `
      <div class="text-center py-4 text-red-500">
        Failed to find avatar: ${error.message}
      </div>
    `;
  }
}

// Convert Uint8Array to hex string
function uint8ArrayToHexString(uint8Array) {
  return Array.from(uint8Array)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

// Initiate claim process
async function claimAvatar() {
  const claimBtn = document.getElementById('claim-btn');
  if (!claimBtn) {
    console.error('Claim button not found');
    return;
  }
  claimBtn.disabled = true;
  
  try {
    const avatar = window.selectedAvatar;
    if (!avatar || !avatar._id) {
      showAlert('Please select an avatar first');
      claimBtn.disabled = false;
      return;
    }
    if (!walletState.wallet) {
      showAlert('Wallet not connected. Please connect your wallet.');
      claimBtn.disabled = false;
      return;
    }
    
    // Request signature from user
    const message = `I am claiming avatar ${avatar._id}`;
    const encodedMessage = new TextEncoder().encode(message);
    const signature = await window.phantom.solana.signMessage(encodedMessage, 'utf8');
    
    // Convert signature to hex string
    const signatureHex = uint8ArrayToHexString(signature.signature);
    
    // Submit claim
    const response = await fetch('/api/claims/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        avatarId: avatar._id,
        walletAddress: walletState.wallet.publicKey,
        signature: signatureHex,
        message
      })
    });
    
    const data = await response.json();
    if (!response.ok) {
      if (data.error === 'Avatar already claimed') {
        showAlert(`Avatar already claimed by ${shortenAddress(data.claimedBy)}`);
      } else if (data.error === 'Invalid signature') {
        showAlert('Invalid signature. Please try again.');
      } else {
        throw new Error(data.error || 'Failed to claim avatar');
      }
      claimBtn.disabled = false;
      return;
    }
    
    // Reload claims
    await loadUserClaims();
    showAlert('Avatar claimed successfully!');
  } catch (error) {
    console.error('Claim process error:', error);
    showAlert('Failed to claim avatar: ' + (error.message || 'Unknown error'));
  } finally {
    claimBtn.disabled = false;
  }
}

// Helper functions
function showAlert(message) {
  console.log('Alert:', message);
  
  // Try to use toast notification if available
  const toastContainer = document.getElementById('toast-container');
  if (toastContainer) {
    const toast = document.createElement('div');
    toast.className = 'toast bg-gray-800 text-white p-3 rounded shadow';
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, 3000);
    return;
  }
  
  // Fall back to standard alert
  alert(message);
}

function shortenAddress(address) {
  return address.slice(0, 6) + '...' + address.slice(-4);
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showAlert('Address copied to clipboard');
  }).catch(err => {
    console.error('Failed to copy text: ', err);
  });
}
