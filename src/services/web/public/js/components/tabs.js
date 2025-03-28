/**
 * Tabs component
 * Handles tab navigation and tab content switching
 */

import { setActiveTab } from '../core/state.js';

/**
 * Initialize tabs component
 */
export function initializeTabs() {
  // Select all tab buttons
  const tabButtons = document.querySelectorAll("[data-tab]");
  
  // Add click listeners to toggle tabs
  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tabName = btn.dataset.tab;
      setActiveTab(tabName);
      updateTabUI(tabName);
    });
  });
  
  // Set up tab indicator if present
  setupTabIndicator();
}

/**
 * Update tab UI based on active tab
 * @param {string} activeTab - Name of the active tab
 */
export function updateTabUI(activeTab) {
  const tabButtons = document.querySelectorAll("[data-tab]");
  
  // Update button states
  tabButtons.forEach((btn) => {
    const isActive = btn.dataset.tab === activeTab;
    
    // Remove all state classes first
    btn.classList.remove(
      "bg-primary-600", "text-white", 
      "hover:bg-surface-800", "text-surface-300"
    );
    
    // Add appropriate classes based on active state
    if (isActive) {
      btn.classList.add("bg-primary-600", "text-white");
      btn.setAttribute("aria-selected", "true");
    } else {
      btn.classList.add("hover:bg-surface-800", "text-surface-300", "hover:text-white");
      btn.setAttribute("aria-selected", "false");
    }
  });
  
  // Update tab indicator position if present
  updateTabIndicator(activeTab);
  
  // Trigger content loading
  if (window.loadContent) {
    window.loadContent();
  }
}

/**
 * Set up tab indicator animation
 */
function setupTabIndicator() {
  const tabsContainer = document.getElementById("tab-buttons");
  const activeTab = document.querySelector("[data-tab][aria-selected='true']");
  
  if (!tabsContainer || !activeTab) return;
  
  // Create the indicator if it doesn't exist
  let indicator = tabsContainer.querySelector(".tab-indicator");
  if (!indicator) {
    indicator = document.createElement("div");
    indicator.className = "tab-indicator absolute left-0 w-1 bg-primary-600 rounded-r transition-transform";
    tabsContainer.appendChild(indicator);
  }
  
  // Set initial position
  updateTabIndicator(activeTab.dataset.tab);
}

/**
 * Update tab indicator position
 * @param {string} activeTab - Name of the active tab
 */
function updateTabIndicator(activeTab) {
  const indicator = document.querySelector(".tab-indicator");
  const activeTabButton = document.querySelector(`[data-tab="${activeTab}"]`);
  
  if (!indicator || !activeTabButton) return;
  
  // Get the position and size of the active tab button
  const { top, height } = activeTabButton.getBoundingClientRect();
  const tabsContainer = document.getElementById("tab-buttons");
  const containerTop = tabsContainer.getBoundingClientRect().top;
  
  // Update indicator position and height
  indicator.style.top = `${top - containerTop}px`;
  indicator.style.height = `${height}px`;
}