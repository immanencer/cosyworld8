/**
 * Toast notification utility
 * Displays temporary notifications to the user
 */

import { UI_CONFIG } from '../core/config.js';

/**
 * Show a toast notification
 * @param {string} message - Message to display
 * @param {Object} options - Toast options
 * @param {string} options.type - Toast type (info, success, error, warning)
 * @param {number} options.duration - Display duration in milliseconds
 */
export function showToast(message, options = {}) {
  const { 
    type = 'info', 
    duration = UI_CONFIG.TOAST_DURATION 
  } = options;
  
  const container = document.getElementById("toast-container");
  if (!container) {
    console.log(`Toast message (no container): ${message}`);
    alert(message);
    return;
  }

  // Create toast element
  const toast = document.createElement("div");
  toast.className = `toast p-3 rounded shadow-lg flex items-center ${getToastColorClass(type)}`;
  
  // Add icon based on type
  toast.innerHTML = `
    ${getToastIcon(type)}
    <span class="ml-2">${message}</span>
  `;
  
  container.appendChild(toast);

  // Remove after animation completes
  setTimeout(() => {
    if (toast.parentNode === container) {
      toast.remove();
    }
  }, duration);
}

/**
 * Get CSS color class based on toast type
 * @param {string} type - Toast type
 * @returns {string} - CSS class
 */
function getToastColorClass(type) {
  switch (type) {
    case 'success':
      return 'bg-green-700 text-white';
    case 'error':
      return 'bg-red-700 text-white';
    case 'warning':
      return 'bg-yellow-600 text-white';
    case 'info':
    default:
      return 'bg-gray-800 text-white';
  }
}

/**
 * Get toast icon based on type
 * @param {string} type - Toast type
 * @returns {string} - Icon HTML
 */
function getToastIcon(type) {
  switch (type) {
    case 'success':
      return `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>`;
    case 'error':
      return `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>`;
    case 'warning':
      return `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>`;
    case 'info':
    default:
      return `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>`;
  }
}

// Shorthand methods for different toast types
export const toast = {
  info: (message, options = {}) => showToast(message, { ...options, type: 'info' }),
  success: (message, options = {}) => showToast(message, { ...options, type: 'success' }),
  error: (message, options = {}) => showToast(message, { ...options, type: 'error' }),
  warning: (message, options = {}) => showToast(message, { ...options, type: 'warning' }),
};