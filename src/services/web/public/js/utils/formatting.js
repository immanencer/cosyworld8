/**
 * Formatting utilities for consistent text formatting across the application
 */

/**
 * Shorten a wallet address for display
 * @param {string} address - The full wallet address
 * @returns {string} - Shortened address in format: "abc...xyz"
 */
export function shortenAddress(address) {
  if (typeof address !== 'string' || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Format a date for display
 * @param {string|Date} date - Date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} - Formatted date string
 */
export function formatDate(date, options = {}) {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Default options for date formatting
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options }).format(dateObj);
}

/**
 * Format a number with thousands separators
 * @param {number} num - Number to format
 * @returns {string} - Formatted number
 */
export function formatNumber(num) {
  if (num === undefined || num === null) return '';
  return num.toLocaleString('en-US');
}

/**
 * Get tier label from model name
 * @param {string} model - AI model name
 * @returns {string} - Tier label (S, A, B, C, U)
 */
export function getTier(model) {
  if (!model) return "U";
  if (model.includes("gpt-4")) return "S";
  if (model.includes("gpt-3.5")) return "A";
  if (model.includes("claude")) return "B";
  return "C";
}

/**
 * Get CSS color class for a tier
 * @param {string} model - AI model name
 * @returns {string} - CSS color class
 */
export function getTierColorClass(model) {
  const tier = getTier(model);
  const colors = {
    S: "bg-purple-600",
    A: "bg-blue-600",
    B: "bg-green-600",
    C: "bg-yellow-600",
    U: "bg-gray-600",
  };
  return colors[tier] || colors.U;
}

/**
 * Truncate text with ellipsis if longer than maxLength
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} - Truncated text
 */
export function truncateText(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Convert snake_case or kebab-case to camelCase
 * @param {string} str - String to convert
 * @returns {string} - camelCase string
 */
export function toCamelCase(str) {
  return str.replace(/[-_]([a-z])/g, (g) => g[1].toUpperCase());
}

/**
 * Get action icon based on action type
 * @param {string} action - Action type
 * @returns {string} - Emoji icon
 */
export function getActionIcon(action) {
  switch (action) {
    case 'attack': return '⚔️';
    case 'defend': return '🛡️';
    case 'move': return '🚶';
    case 'remember': return '💭';
    case 'xpost': return '🐦';
    case 'post': return '📝';
    default: return '❓';
  }
}