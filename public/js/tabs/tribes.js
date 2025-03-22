/**
 * Tribes Tab
 * Displays tribes and their members
 */

import { TribesAPI } from '../core/api.js';
import { showToast } from '../utils/toast.js';

/**
 * Load tribes tab content
 */
export async function loadContent() {
  const content = document.getElementById("content");
  if (!content) return;

  try {
    content.innerHTML = `
      <div class="max-w-7xl mx-auto px-4">
        <h1 class="text-3xl font-bold mb-6">Tribes</h1>
        <div class="bg-gray-800/50 p-6 rounded-lg mb-8">
          <p class="text-lg">Tribes are groups of avatars that share the same emoji identifier. Each tribe has its own characteristics and traits.</p>
        </div>
        
        <div id="tribes-loader" class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
        
        <div id="tribes-content" class="hidden">
          <div id="tribes-grid" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"></div>
        </div>
        
        <div id="tribe-details" class="hidden mt-8">
          <button 
            id="back-to-tribes" 
            class="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded mb-6 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to tribes
          </button>
          
          <div class="flex items-center gap-4 mb-6">
            <div id="tribe-emoji" class="text-5xl"></div>
            <h2 class="text-3xl font-bold">Tribe <span id="tribe-name"></span></h2>
          </div>
          
          <div id="tribe-members" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"></div>
        </div>
      </div>
    `;

    // Get tribe counts
    const tribeCounts = await TribesAPI.getCounts();
    const loader = document.getElementById('tribes-loader');
    const tribesContent = document.getElementById('tribes-content');
    const tribesGrid = document.getElementById('tribes-grid');
    const tribeDetails = document.getElementById('tribe-details');

    if (!tribeCounts || tribeCounts.length === 0) {
      renderEmptyState(loader);
      return;
    }

    // Render tribe cards
    renderTribesGrid(tribesGrid, tribeCounts);

    // Hide loader, show content
    loader.classList.add('hidden');
    tribesContent.classList.remove('hidden');

    // Set up back button handler
    document.getElementById('back-to-tribes').addEventListener('click', () => {
      tribesContent.classList.remove('hidden');
      tribeDetails.classList.add('hidden');
    });

    // Make global function available for showing tribe details
    window.showTribeDetailsContent = showTribeDetailsContent;

  } catch (err) {
    console.error("Load Tribes error:", err);
    content.innerHTML = `
      <div class="text-center py-12 text-red-500">
        Failed to load tribes: ${err.message}
        <button 
          class="block mx-auto mt-4 px-4 py-2 bg-gray-700 rounded"
          onclick="loadContent()"
        >
          Retry
        </button>
      </div>
    `;
  }
}

/**
 * Render empty state when no tribes found
 * @param {HTMLElement} container - Container element
 */
function renderEmptyState(container) {
  container.innerHTML = '<div class="text-center text-gray-400">No tribes found</div>';
}

/**
 * Render tribes grid
 * @param {HTMLElement} container - Container element
 * @param {Array} tribes - List of tribes to render
 */
function renderTribesGrid(container, tribes) {
  container.innerHTML = tribes.map(tribe => `
    <div 
      class="tribe-card bg-gray-800 rounded-lg p-5 flex flex-col items-center hover:bg-gray-700 transition-colors cursor-pointer"
      data-emoji="${tribe.emoji}" 
      onclick="showTribeDetailsContent('${tribe.emoji}')"
    >
      <div class="text-5xl mb-3">${tribe.emoji}</div>
      <div class="text-xl font-bold">Tribe ${tribe.emoji}</div>
      <div class="text-gray-400 mt-2">
        ${tribe.count} ${tribe.count === 1 ? 'member' : 'members'}
      </div>
    </div>
  `).join('');
}

/**
 * Show details for a specific tribe
 * @param {string} emoji - Tribe emoji
 */
export async function showTribeDetailsContent(emoji) {
  try {
    const tribesContent = document.getElementById('tribes-content');
    const tribeDetails = document.getElementById('tribe-details');
    const tribeEmoji = document.getElementById('tribe-emoji');
    const tribeName = document.getElementById('tribe-name');
    const tribeMembers = document.getElementById('tribe-members');

    // Update UI
    tribesContent.classList.add('hidden');
    tribeDetails.classList.remove('hidden');
    tribeEmoji.textContent = emoji;
    tribeName.textContent = emoji;

    // Show loading state
    tribeMembers.innerHTML = `
      <div class="col-span-full flex justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    `;

    // Fetch tribe details
    const tribeData = await TribesAPI.getTribeByEmoji(emoji);

    if (!tribeData || !tribeData.members || tribeData.members.length === 0) {
      tribeMembers.innerHTML = `
        <div class="col-span-full text-center text-gray-400 py-8">
          No members found for this tribe
        </div>
      `;
      return;
    }

    // Render tribe members with safe name extraction
    renderTribeMembers(tribeMembers, tribeData.members, emoji);

  } catch (err) {
    console.error("Show Tribe Details error:", err);
    document.getElementById('tribe-members').innerHTML = `
      <div class="col-span-full text-center text-red-500 py-8">
        Failed to load tribe members: ${err.message}
        <button 
          class="block mx-auto mt-4 px-4 py-2 bg-gray-700 rounded"
          onclick="showTribeDetailsContent('${emoji}')"
        >
          Retry
        </button>
      </div>
    `;
  }
}

/**
 * Render tribe members
 * @param {HTMLElement} container - Container element
 * @param {Array} members - List of members to render
 * @param {string} emoji - Tribe emoji
 */
function renderTribeMembers(container, members, emoji) {
  container.innerHTML = members.map(member => {
    const safeName = member.name || 'Unknown';
    const initial = safeName.charAt(0).toUpperCase();
    return `
      <div 
        class="bg-gray-800 p-3 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
        onclick="showAvatarDetails('${member._id}')"
      >
        <div class="flex items-center gap-3">
          ${member.imageUrl
            ? `<img 
                  src="${member.imageUrl}" 
                  alt="${safeName}" 
                  class="w-16 h-16 object-cover rounded-full"
                  onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'100\\' height=\\'100\\' viewBox=\\'0 0 100 100\\'%3E%3Crect fill=\\'%23333\\' width=\\'100\\' height=\\'100\\'/%3E%3Ctext fill=\\'%23FFF\\' x=\\'50\\' y=\\'50\\' font-size=\\'50\\' text-anchor=\\'middle\\' dominant-baseline=\\'middle\\'%3E${initial}%3C/text%3E%3C/svg%3E';">` 
            : `<div class="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center text-2xl font-bold text-white">
                  ${initial}
              </div>` 
          }
        
          <div class="flex-1 min-w-0">
            <h3 class="text-lg font-semibold truncate">${safeName}</h3>
            <div class="text-xs text-gray-400 mt-1">
              ${member.messageCount || 0} messages
            </div>
          </div>
        
          <div class="text-xl">${emoji}</div>
        </div>
      </div>
    `;
  }).join('');
}