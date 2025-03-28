/**
 * Global state management for the application
 * Provides a centralized store and methods to update it
 */

// Create a global state object with default values
export const state = {
  wallet: null,         // Connected wallet information
  activeTab: "squad",   // Currently active tab
  loading: false,       // Loading state indicator
  socialSort: "new",    // Sort order for social content
  selectedAvatar: null, // Currently selected avatar
  modalOpen: false,     // Whether a modal is currently open
};

// Event types for state changes
export const STATE_EVENTS = {
  WALLET_CHANGED: 'wallet_changed',
  TAB_CHANGED: 'tab_changed',
  LOADING_CHANGED: 'loading_changed',
  SOCIAL_SORT_CHANGED: 'social_sort_changed',
  AVATAR_SELECTED: 'avatar_selected',
  MODAL_STATE_CHANGED: 'modal_state_changed',
};

// Event bus for state changes
const eventListeners = {};

/**
 * Subscribe to state change events
 * @param {string} event - Event type to subscribe to
 * @param {Function} callback - Function to call when event occurs
 * @returns {Function} - Unsubscribe function
 */
export function subscribe(event, callback) {
  if (!eventListeners[event]) {
    eventListeners[event] = [];
  }
  eventListeners[event].push(callback);
  
  // Return unsubscribe function
  return () => {
    eventListeners[event] = eventListeners[event].filter(cb => cb !== callback);
  };
}

/**
 * Emit a state change event
 * @param {string} event - Event type to emit
 * @param {*} data - Event data
 */
function emit(event, data) {
  if (eventListeners[event]) {
    eventListeners[event].forEach(callback => callback(data));
  }
}

/**
 * Update the wallet state
 * @param {Object} walletData - Wallet information
 */
export function setWallet(walletData) {
  state.wallet = walletData;
  emit(STATE_EVENTS.WALLET_CHANGED, walletData);
  
  // Store wallet address in localStorage for persistence
  if (walletData?.publicKey) {
    localStorage.setItem('lastWalletAddress', walletData.publicKey);
  } else {
    localStorage.removeItem('lastWalletAddress');
  }
}

/**
 * Set the active tab
 * @param {string} tabName - Name of the tab to activate
 */
export function setActiveTab(tabName) {
  state.activeTab = tabName;
  emit(STATE_EVENTS.TAB_CHANGED, tabName);
}

/**
 * Set the loading state
 * @param {boolean} isLoading - Whether the app is loading
 */
export function setLoading(isLoading) {
  state.loading = isLoading;
  emit(STATE_EVENTS.LOADING_CHANGED, isLoading);
}

/**
 * Set the social sort order
 * @param {string} sortOrder - Sort order ("new" or "top")
 */
export function setSocialSort(sortOrder) {
  state.socialSort = sortOrder;
  emit(STATE_EVENTS.SOCIAL_SORT_CHANGED, sortOrder);
}

/**
 * Set the selected avatar
 * @param {Object} avatar - Selected avatar data
 */
export function setSelectedAvatar(avatar) {
  state.selectedAvatar = avatar;
  emit(STATE_EVENTS.AVATAR_SELECTED, avatar);
}

/**
 * Set the modal open state
 * @param {boolean} isOpen - Whether the modal is open
 */
export function setModalOpen(isOpen) {
  state.modalOpen = isOpen;
  emit(STATE_EVENTS.MODAL_STATE_CHANGED, isOpen);
}

// Initialize state from localStorage (if available)
export function initializeStateFromStorage() {
  const lastWalletAddress = localStorage.getItem('lastWalletAddress');
  if (lastWalletAddress) {
    state.wallet = { publicKey: lastWalletAddress };
  }
  
  const lastActiveTab = localStorage.getItem('lastActiveTab');
  if (lastActiveTab) {
    state.activeTab = lastActiveTab;
  }
}

// Make state available globally (for backward compatibility)
window.state = state;