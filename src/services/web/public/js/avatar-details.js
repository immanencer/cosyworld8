// State management
const state = {
  wallet: null,
  avatar: null,
  claimed: false,
  claimedBy: null,
  xStatus: {
    linked: false,
    authorized: false
  }
};

// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", async () => {
  // Initialize the UI
  initializeWalletUI();
  setupEventListeners();
  
  // Get avatar ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const avatarId = urlParams.get("id");

  if (!avatarId) {
    showToast("Avatar ID is missing in the query string", "error");
    document.getElementById("avatar-details-container").innerHTML = 
      `<p class="text-red-500 text-center p-8">Avatar ID is missing in the query string.</p>`;
    return;
  }

  // Fetch and render avatar details
  try {
    await loadAvatarDetails(avatarId);
  } catch (error) {
    console.error("Error loading avatar details:", error);
    document.getElementById("avatar-details-container").innerHTML = 
      `<p class="text-red-500 text-center p-8">Failed to load avatar details: ${error.message}</p>`;
  }
});

// Initialize wallet UI
function initializeWalletUI() {
  const walletContainer = document.querySelector(".wallet-container");
  if (walletContainer) {
    walletContainer.innerHTML = `
      <button id="wallet-connect-btn" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition">
        Connect Wallet
      </button>
    `;
    
    // Add event listener
    const connectBtn = document.getElementById('wallet-connect-btn');
    if (connectBtn) {
      connectBtn.addEventListener('click', connectWallet);
    }
  }
}

// Set up event listeners
function setupEventListeners() {
  // Flip card event listeners
  const flipToBack = document.getElementById("flip-to-back");
  const flipToFront = document.getElementById("flip-to-front");
  const avatarCard = document.getElementById("avatar-card");
  
  if (flipToBack && flipToFront && avatarCard) {
    flipToBack.addEventListener("click", () => {
      avatarCard.classList.add("flipped");
    });
    
    flipToFront.addEventListener("click", () => {
      avatarCard.classList.remove("flipped");
    });
  }
  
  // Claim button
  const claimBtn = document.getElementById("claim-with-phantom");
  if (claimBtn) {
    claimBtn.addEventListener("click", claimWithPhantom);
  }
  
  // Link to X button
  const linkXBtn = document.getElementById("link-to-x");
  if (linkXBtn) {
    linkXBtn.addEventListener("click", linkToX);
  }
}

// Load avatar details from API
async function loadAvatarDetails(avatarId) {
  const container = document.getElementById("avatar-details-container");
  const header = container.querySelector("h1");
  
  try {
    // First check claim status
    const claimStatusResponse = await fetch(`/api/claims/status/${avatarId}`);
    const claimStatusData = await claimStatusResponse.json();
    
    if (claimStatusResponse.ok) {
      state.claimed = claimStatusData.claimed || false;
      state.claimedBy = claimStatusData.claimedBy || null;
      console.log("Claim status:", state.claimed, state.claimedBy);
    }
    
    // Fetch avatar details
    const avatarResponse = await fetch(`/api/avatars/${avatarId}`);
    if (!avatarResponse.ok) {
      throw new Error(`Failed to fetch avatar details (${avatarResponse.status})`);
    }
    
    const avatar = await avatarResponse.json();
    state.avatar = avatar;
    
    // Hide loading header
    if (header) header.classList.add("hidden");
    
    // Fetch X auth status if avatar is claimed
    if (state.claimed) {
      try {
        const xStatusResponse = await fetch(`/api/xauth/status/${avatarId}`);
        const xStatusData = await xStatusResponse.json();
        
        if (xStatusResponse.ok) {
          state.xStatus.authorized = xStatusData.authorized || false;
          state.xStatus.requiresReauth = xStatusData.requiresReauth || false;
        }
      } catch (e) {
        console.warn("Failed to fetch X auth status:", e);
      }
    }
    
    // Render avatar details
    renderAvatarDetails(avatar);
    
    // Fetch and render social posts
    loadSocialPosts(avatarId);
    
    // Update claim/X buttons
    updateActionButtons();
    
  } catch (error) {
    console.error("Error loading avatar:", error);
    showToast("Failed to load avatar details", "error");
    throw error;
  }
}

// Load social posts
async function loadSocialPosts(avatarId) {
  const postsContainer = document.getElementById("social-posts");
  if (!postsContainer) return;
  
  try {
    const response = await fetch(`/api/avatars/${avatarId}/social-posts`);
    if (!response.ok) {
      throw new Error("Failed to fetch social posts");
    }
    
    const data = await response.json();
    const posts = Array.isArray(data) ? data : (data.posts || []);
    
    if (posts.length === 0) {
      postsContainer.innerHTML = `<p class="text-gray-400 text-center py-4">No social posts available.</p>`;
      return;
    }
    
    postsContainer.innerHTML = posts.map(post => `
      <div class="mb-3 p-3 bg-gray-800 rounded-lg">
        <p class="text-gray-200">${post.content}</p>
        <div class="mt-1 flex justify-between items-center">
          <span class="text-xs text-gray-500">${formatDate(post.timestamp || post.createdAt)}</span>
          ${post.postedToX ? 
            `<span class="text-xs text-blue-400 flex items-center">
              <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              Posted to X
            </span>` : ''
          }
        </div>
      </div>
    `).join("");
    
  } catch (error) {
    console.error("Error loading social posts:", error);
    postsContainer.innerHTML = `<p class="text-red-500 text-center py-4">Failed to load social posts.</p>`;
  }
}

// Render avatar details
function renderAvatarDetails(avatar) {
  if (!avatar) return;
  
  // Set image
  const avatarImage = document.getElementById("avatar-image");
  if (avatarImage) {
    avatarImage.src = avatar.imageUrl || "/images/default-avatar.png";
    avatarImage.onerror = function() {
      this.onerror = null;
      const initial = (avatar.name || 'A').charAt(0).toUpperCase();
      this.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect fill='%23333' width='100' height='100'/%3E%3Ctext fill='%23FFF' x='50' y='50' font-size='50' text-anchor='middle' dominant-baseline='middle'%3E${initial}%3C/text%3E%3C/svg%3E`;
    };
  }
  
  // Set claimed badge
  const claimedBadge = document.getElementById("claimed-badge");
  if (claimedBadge) {
    if (state.claimed) {
      claimedBadge.classList.remove("hidden");
    } else {
      claimedBadge.classList.add("hidden");
    }
  }
  
  // Set tier badge
  const tierBadge = document.getElementById("tier-badge");
  if (tierBadge) {
    const tier = getTier(avatar.model);
    const tierColor = getTierColor(tier);
    tierBadge.className = `px-2 py-1 text-xs font-bold rounded ${tierColor}`;
    tierBadge.textContent = `Tier ${tier}`;
  }
  
  // Set name and meta
  document.getElementById("avatar-name").textContent = `${avatar.name || "Unknown"} ${avatar.emoji || ""}`;
  document.getElementById("avatar-meta").textContent = avatar.createdAt ? 
    `Created: ${formatDate(avatar.createdAt)}` : "";
  
  // Set stats
  const stats = avatar.stats || {};
  document.getElementById("avatar-hp").textContent = stats.hp || "0";
  document.getElementById("avatar-ac").textContent = stats.ac || "0";
  document.getElementById("avatar-init").textContent = stats.initiative || "0";
  
  // Set personality and description
  document.getElementById("avatar-personality").textContent = avatar.personality || "No personality information available.";
  document.getElementById("avatar-description").textContent = avatar.description || "No description available.";
}

// Update claim and X buttons based on state
function updateActionButtons() {
  const claimBtn = document.getElementById("claim-with-phantom");
  const linkXBtn = document.getElementById("link-to-x");
  const linkXText = document.getElementById("link-x-text");
  
  // Handle claim button visibility
  if (claimBtn) {
    if (!state.claimed) {
      claimBtn.classList.remove("hidden");
    } else {
      claimBtn.classList.add("hidden");
    }
  }
  
  // Handle X button visibility
  if (linkXBtn && linkXText) {
    if (state.claimed) {
      linkXBtn.classList.remove("hidden");
      
      if (state.xStatus.authorized) {
        linkXText.textContent = "Reconnect to X";
      } else {
        linkXText.textContent = "Link to X";
      }
    } else {
      linkXBtn.classList.add("hidden");
    }
  }
}

// Format date helper
function formatDate(dateString) {
  if (!dateString) return "Unknown";
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

// Get tier from model name
function getTier(model) {
  if (!model) return "C";
  if (model.includes("gpt-4")) return "S";
  if (model.includes("gpt-3.5")) return "A";
  if (model.includes("claude")) return "B";
  return "C";
}

// Get tier color
function getTierColor(tier) {
  switch (tier) {
    case "S": return "bg-purple-600";
    case "A": return "bg-blue-600";
    case "B": return "bg-green-600";
    case "C": return "bg-yellow-600";
    default: return "bg-gray-600";
  }
}

// Connect wallet
async function connectWallet() {
  try {
    // Check if Phantom wallet is available
    const provider = window?.phantom?.solana;
    
    if (!provider) {
      showToast("Please install Phantom wallet", "warning");
      window.open("https://phantom.app/", "_blank");
      return;
    }
    
    // Request connection
    const connection = await provider.connect();
    
    if (connection?.publicKey) {
      // Update application state
      state.wallet = {
        publicKey: connection.publicKey.toString(),
        isConnected: true
      };
      
      // Update UI
      updateWalletUI();
      
      showToast(`Wallet connected: ${shortenAddress(state.wallet.publicKey)}`, "success");
      
      // Check if this is the owner of the claimed avatar
      if (state.claimed && state.avatar && state.avatar.claimedBy && 
          state.avatar.claimedBy.toLowerCase() === state.wallet.publicKey.toLowerCase()) {
        updateActionButtons();
      }
    }
  } catch (error) {
    console.error("Wallet connection error:", error);
    showToast(`Wallet connection failed: ${error.message}`, "error");
  }
}

// Disconnect wallet
function disconnectWallet() {
  try {
    const provider = window?.phantom?.solana;
    if (provider && provider.disconnect) {
      provider.disconnect();
    }
    
    // Update state
    state.wallet = null;
    
    // Update UI
    updateWalletUI();
    
    showToast("Wallet disconnected", "info");
  } catch (error) {
    console.error("Wallet disconnect error:", error);
    showToast(`Error disconnecting wallet: ${error.message}`, "error");
  }
}

// Update wallet UI
function updateWalletUI() {
  const walletContainer = document.querySelector(".wallet-container");
  
  if (!walletContainer) return;
  
  if (state.wallet && state.wallet.publicKey) {
    // Display connected wallet info
    walletContainer.innerHTML = `
      <div class="flex items-center space-x-2">
        <span class="text-green-400 text-sm">●</span>
        <span class="text-gray-200">${shortenAddress(state.wallet.publicKey)}</span>
        <button id="wallet-disconnect-btn" class="text-gray-400 hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    `;
    
    // Add event listener to disconnect button
    const disconnectBtn = document.getElementById('wallet-disconnect-btn');
    if (disconnectBtn) {
      disconnectBtn.addEventListener('click', disconnectWallet);
    }
  } else {
    // Display connect button
    walletContainer.innerHTML = `
      <button id="wallet-connect-btn" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition">
        Connect Wallet
      </button>
    `;
    
    // Add event listener to connect button
    const connectBtn = document.getElementById('wallet-connect-btn');
    if (connectBtn) {
      connectBtn.addEventListener('click', connectWallet);
    }
  }
}

// Claim with Phantom
async function claimWithPhantom() {
  if (!state.wallet) {
    showToast("Please connect your wallet first", "warning");
    await connectWallet();
    if (!state.wallet) return;
  }
  
  if (!state.avatar || !state.avatar._id) {
    showToast("No avatar to claim", "error");
    return;
  }
  
  try {
    const claimButton = document.getElementById("claim-with-phantom");
    if (claimButton) {
      claimButton.disabled = true;
      claimButton.innerHTML = `
        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Claiming...
      `;
    }
    
    // Generate a message to sign
    const message = `I am claiming avatar ${state.avatar._id}`;
    const encodedMessage = new TextEncoder().encode(message);
    
    // Request signature from the user
    const signatureResponse = await window.phantom.solana.signMessage(encodedMessage, "utf8");
    
    // Convert signature to hex string for backend validation
    const signatureHex = Array.from(signatureResponse.signature)
      .map(byte => byte.toString(16).padStart(2, "0"))
      .join("");
    
    // Submit claim to backend
    const response = await fetch("/api/claims/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        avatarId: state.avatar._id,
        walletAddress: state.wallet.publicKey,
        signature: signatureHex,
        message
      })
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || "Claim failed");
    }
    
    // Update state
    state.claimed = true;
    state.claimedBy = state.wallet.publicKey;

    // Re-fetch avatar details to ensure UI reflects the latest state
    await loadAvatarDetails(state.avatar._id);

    // Update UI
    updateActionButtons();
    document.getElementById("claimed-badge").classList.remove("hidden");
    
    showToast("Avatar claimed successfully!", "success");
  } catch (error) {
    console.error("Error claiming avatar:", error);
    showToast(`Failed to claim avatar: ${error.message}`, "error");
  } finally {
    const claimButton = document.getElementById("claim-with-phantom");
    if (claimButton) {
      claimButton.disabled = false;
      claimButton.innerHTML = `
        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M20.6 12.25c0-.5-.4-.9-.9-.9h-1.8c-.5 0-.9.4-.9.9v1.8c0 .5.4.9.9.9h1.8c.5 0 .9-.4.9-.9v-1.8zm-10.1-.9h1.8c.5 0 .9.4.9.9v1.8c0 .5-.4.9-.9.9h-1.8c-.5 0-.9-.4-.9-.9v-1.8c0-.5.4-.9.9-.9zm-5.5 0h1.8c.5 0 .9.4.9.9v1.8c0 .5-.4.9-.9.9H5c-.5 0-.9-.4-.9-.9v-1.8c0-.5.4-.9.9-.9z"/>
        </svg>
        Claim with Phantom
      `;
    }
  }
}

// Link to X
async function linkToX() {
  if (!state.avatar || !state.avatar._id) {
    showToast("No avatar details found", "error");
    return;
  }

  if (!state.claimed) {
    showToast("Avatar must be claimed before linking to X", "warning");
    return;
  }

  if (!state.wallet || state.avatar.claimedBy.toLowerCase() !== state.wallet.publicKey.toLowerCase()) {
    showToast("You must be the owner of this avatar to link with X", "warning");
    return;
  }

  try {
    const linkButton = document.getElementById("link-to-x");
    if (linkButton) {
      linkButton.disabled = true;
      const originalText = document.getElementById("link-x-text").textContent;
      document.getElementById("link-x-text").textContent = "Initiating...";
    }

    // First, verify that the wallet is connected and matches the claimed avatar
    if (!state.wallet) {
      showToast("Please connect your wallet first", "warning");
      await connectWallet();
      if (!state.wallet) return;
    }

    // Check claim status again to ensure we have accurate data
    const claimStatusResponse = await fetch(`/api/claims/status/${state.avatar._id}`);
    const claimStatusData = await claimStatusResponse.json();
    
    console.log("Current claim status:", claimStatusData);
    
    if (!claimStatusData.claimed) {
      showToast("Avatar must be claimed before linking to X", "warning");
      return;
    }

    // Verify the wallet matches the claim
    console.log("Wallet comparison:", {
      connected: state.wallet.publicKey.toLowerCase(),
      claimed: claimStatusData.claimedBy.toLowerCase(),
      matches: state.wallet.publicKey.toLowerCase() === claimStatusData.claimedBy.toLowerCase()
    });
    
    if (claimStatusData.claimedBy.toLowerCase() !== state.wallet.publicKey.toLowerCase()) {
      showToast("You must be the owner of this avatar to link with X", "warning");
      return;
    }

    const message = `Link X account for avatar ${state.avatar._id}`;
    const encodedMessage = new TextEncoder().encode(message);
    const signatureResponse = await window.phantom.solana.signMessage(encodedMessage, "utf8");
    const signatureHex = Array.from(signatureResponse.signature)
      .map(byte => byte.toString(16).padStart(2, "0"))
      .join("");

    // Debug headers in console
    console.log("Debug headers:", {
      'walletAddress': state.wallet.publicKey,
      'signature': signatureHex,
      'message': message
    });

    // Use fetch with explicit headers
    const response = await fetch(`/api/xauth/auth-url?avatarId=${state.avatar._id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-wallet-address': state.wallet.publicKey,
        'x-signature': signatureHex,
        'x-message': message
      }
    });

    // Log raw response for debugging
    console.log("Auth URL response status:", response.status);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Error ${response.status}`);
    }

    const data = await response.json();

    if (!data.url) {
      throw new Error("No authentication URL returned");
    }

    const width = 600, height = 650;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const popup = window.open(
      data.url,
      "xauth_popup",
      `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes`
    );

    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      throw new Error("Popup was blocked. Please allow popups for this site.");
    }

    window.addEventListener('message', async function authMessageListener(event) {
      if (event.data.type === 'X_AUTH_SUCCESS') {
        showToast("X account linked successfully!", "success");
        window.removeEventListener('message', authMessageListener);

        state.xStatus.authorized = true;
        document.getElementById("link-x-text").textContent = "Reconnect to X";

        await loadAvatarDetails(state.avatar._id);
      } else if (event.data.type === 'X_AUTH_ERROR') {
        showToast(`X authorization failed: ${event.data.error || 'Unknown error'}`, "error");
        window.removeEventListener('message', authMessageListener);
      }
    });

    showToast("X authorization initiated. Please complete the process in the popup.", "info");
  } catch (error) {
    console.error("Error initiating X auth:", error);
    showToast(`Error linking to X: ${error.message}`, "error");
  } finally {
    const linkButton = document.getElementById("link-to-x");
    if (linkButton) {
      linkButton.disabled = false;
      document.getElementById("link-x-text").textContent = 
        state.xStatus.authorized ? "Reconnect to X" : "Link to X";
    }
  }
}

// Helper: Shorten wallet address
function shortenAddress(address) {
  if (!address || typeof address !== 'string') return '';
  return address.slice(0, 6) + '...' + address.slice(-4);
}

// Show toast notification
function showToast(message, type = "info") {
  const toastContainer = document.getElementById("toast-container");
  if (!toastContainer) return;
  
  const toast = document.createElement("div");
  toast.className = `px-4 py-2 rounded-lg shadow-lg max-w-xs text-white 
    ${type === "error" ? "bg-red-600" : 
      type === "success" ? "bg-green-600" : 
      type === "warning" ? "bg-yellow-600" : "bg-blue-600"}`;
  toast.textContent = message;
  
  toastContainer.appendChild(toast);
  
  // Auto remove after 3 seconds
  setTimeout(() => {
    toast.classList.add("opacity-0", "transition-opacity", "duration-500");
    setTimeout(() => {
      toastContainer.removeChild(toast);
    }, 500);
  }, 3000);
}
