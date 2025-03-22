/**
 * Wallet service
 * Handles wallet connection and authentication
 */

import { setWallet } from '../core/state.js';
import { showToast } from '../utils/toast.js';
import { shortenAddress } from '../utils/formatting.js';

/**
 * Initialize wallet functionality
 */
export function initializeWallet() {
  // Check for wallet connect button and inject if missing
  const walletContainer = document.querySelector(".wallet-container");
  if (walletContainer && !walletContainer.querySelector('button')) {
    walletContainer.innerHTML = `
      <button id="wallet-connect-btn" class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded transition">
        Connect Wallet
      </button>
    `;
    
    // Add event listener to the injected button
    const connectBtn = document.getElementById('wallet-connect-btn');
    if (connectBtn) {
      connectBtn.addEventListener('click', connectWallet);
    }
  }

  // Try auto-connecting to wallet if available and trusted
  autoConnectWallet();
  
  // Update UI with current wallet state
  updateWalletUI();
  
  // Make connectWallet function available globally
  window.connectWallet = connectWallet;
  window.disconnectWallet = disconnectWallet;
}

/**
 * Try to auto-connect to a wallet if the provider is available
 */
function autoConnectWallet() {
  const provider = window?.phantom?.solana;
  if (provider) {
    provider.connect({ onlyIfTrusted: true })
      .then(connection => {
        if (connection?.publicKey) {
          handleSuccessfulConnection(connection);
        }
      })
      .catch(err => {
        console.warn("Auto-connect failed or not trusted:", err);
      });
  } else {
    console.log("No compatible wallet provider found for auto-connect");
  }
}

/**
 * Connect to wallet
 * @returns {Promise<Object>} - Connection result
 */
export async function connectWallet() {
  try {
    // Check if Phantom wallet is available
    const provider = window?.phantom?.solana;
    
    if (!provider) {
      showToast("Please install Phantom wallet", { type: 'warning' });
      return null;
    }
    
    // Request connection
    const connection = await provider.connect();
    
    // Handle successful connection
    handleSuccessfulConnection(connection);
    
    return connection;
  } catch (error) {
    console.error("Wallet connection error:", error);
    showToast(`Wallet connection failed: ${error.message}`, { type: 'error' });
    return null;
  }
}

/**
 * Disconnect wallet
 */
export function disconnectWallet() {
  try {
    const provider = window?.phantom?.solana;
    if (provider && provider.disconnect) {
      provider.disconnect();
    }
    
    // Update application state
    setWallet(null);
    
    // Update UI
    updateWalletUI();
    
    showToast("Wallet disconnected", { type: 'info' });
    
    // Reload content if needed
    if (window.loadContent) {
      window.loadContent();
    }
  } catch (error) {
    console.error("Wallet disconnect error:", error);
    showToast(`Error disconnecting wallet: ${error.message}`, { type: 'error' });
  }
}

/**
 * Handle successful wallet connection
 * @param {Object} connection - Wallet connection data
 */
function handleSuccessfulConnection(connection) {
  if (!connection?.publicKey) {
    console.error("Invalid connection object");
    return;
  }
  
  // Update application state
  const walletData = {
    publicKey: connection.publicKey.toString(),
    isConnected: true
  };
  
  setWallet(walletData);
  
  // Update UI
  updateWalletUI();
  
  showToast(`Wallet connected: ${shortenAddress(walletData.publicKey)}`, { type: 'success' });
  
  // Reload content if needed
  if (window.loadContent) {
    window.loadContent();
  }
}

/**
 * Update wallet UI based on connection state
 */
export function updateWalletUI() {
  const walletContainer = document.querySelector(".wallet-container");
  const state = window.state || {};
  
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
      <button id="wallet-connect-btn" class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded transition">
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