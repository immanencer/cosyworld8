/**
 * Main application entry point
 * Initializes core functionality and sets up event listeners
 */

import { initializeStateFromStorage, state, setActiveTab } from './core/state.js';
import { initializeWallet } from './services/wallet.js';
import { initializeTabs } from './components/tabs.js';
import { initializeContentLoader } from './core/contentLoader.js';
import { showToast } from './utils/toast.js';

// Initialize the application when DOM is loaded
document.addEventListener("DOMContentLoaded", initializeApplication);

/**
 * Initialize the application
 */
function initializeApplication() {
  console.log("Initializing CosyWorld application...");
  
  // Initialize state from localStorage
  initializeStateFromStorage();
  
  // Initialize wallet connection
  initializeWallet();
  
  // Initialize tabs
  initializeTabs();
  
  // Initialize content loader
  initializeContentLoader();
  
  // Set up mobile navigation toggles
  setupMobileNavigation();
  
  // Set up modal event listeners
  setupModalEventListeners();
  
  // Show welcome toast
  showToast("Welcome to CosyWorld!");
  
  // Make global functions available
  registerGlobalFunctions();
  
  // Make the state object available globally
  window.state = state;
  
  // Initial content load
  if (window.loadContent) {
    window.loadContent();
  }
}

/**
 * Set up mobile navigation toggle functionality
 */
function setupMobileNavigation() {
  // Open mobile navigation
  const openMobileNav = document.getElementById("open-mobile-nav");
  if (openMobileNav) {
    openMobileNav.addEventListener("click", () => {
      const nav = document.querySelector("nav");
      if (nav) {
        nav.classList.remove("hidden");
      }
    });
  }
  
  // Close mobile navigation
  const closeMobileNav = document.getElementById("close-mobile-nav");
  if (closeMobileNav) {
    closeMobileNav.addEventListener("click", () => {
      const nav = document.querySelector("nav");
      if (nav) {
        nav.classList.add("hidden");
      }
    });
  }
}

/**
 * Set up modal event listeners
 */
function setupModalEventListeners() {
  // Generic modal container
  const modalContainer = document.getElementById("modal-container");
  if (modalContainer) {
    modalContainer.addEventListener("click", (e) => {
      if (e.target === modalContainer) {
        closeModal();
      }
    });
  }
  
  // Avatar detail modal container
  const avatarModal = document.getElementById("avatar-modal");
  if (avatarModal) {
    avatarModal.addEventListener("click", (e) => {
      if (e.target === avatarModal) {
        closeAvatarModal();
      }
    });
  }
}

/**
 * Register global functions for backward compatibility
 */
function registerGlobalFunctions() {
  // Tab navigation
  window.setActiveTab = setActiveTab;
  
  // Social sort
  window.setSocialSort = (sort) => {
    state.socialSort = sort;
    if (window.loadContent) {
      window.loadContent();
    }
  };
  
  // Modal functions
  window.closeModal = () => {
    const modal = document.getElementById("modal-container");
    if (modal) {
      modal.classList.add("hidden");
    }
  };
  
  window.closeAvatarModal = () => {
    const modal = document.getElementById("avatar-modal");
    if (modal) {
      modal.classList.add("hidden");
    }
  };
  
  // Avatar details
  window.showAvatarDetails = async (avatarId) => {
    try {
      // Import the avatar component dynamically
      const { showAvatarDetailsModal } = await import('./components/avatar.js');
      showAvatarDetailsModal(avatarId);
    } catch (error) {
      console.error("Error loading avatar details:", error);
      showToast(`Error loading avatar details: ${error.message}`, { type: 'error' });
    }
  };
  
  // Tribe details
  window.showTribeDetails = async (emoji) => {
    try {
      // Import the tribes component dynamically
      const { showTribeDetailsContent } = await import('./tabs/tribes.js');
      showTribeDetailsContent(emoji);
    } catch (error) {
      console.error("Error loading tribe details:", error);
      showToast(`Error loading tribe details: ${error.message}`, { type: 'error' });
    }
  };
}