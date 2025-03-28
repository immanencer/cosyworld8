/**
 * Actions Tab
 * Displays action log for avatars
 */

import { DungeonAPI } from '../core/api.js';
import { formatDate, getActionIcon } from '../utils/formatting.js';

/**
 * Load actions tab content
 */
export async function loadContent() {
  const content = document.getElementById("content");
  if (!content) return;
  
  try {
    const actions = await DungeonAPI.getActionLog();
    
    if (!actions || actions.length === 0) {
      renderEmptyState(content);
      return;
    }
    
    renderActionLog(content, actions);
  } catch (err) {
    console.error("Load Action Log error:", err);
    content.innerHTML = `
      <div class="text-center py-12 text-red-500">
        Failed to load actions: ${err.message}
        <button class="mt-4 px-4 py-2 bg-primary-600 rounded" onclick="loadContent()">
          Retry
        </button>
      </div>
    `;
  }
}

/**
 * Render empty state when no actions found
 * @param {HTMLElement} container - Container element
 */
function renderEmptyState(container) {
  container.innerHTML = `
    <div class="max-w-4xl mx-auto px-4">
      <div class="text-center py-12">
        <h2 class="text-2xl font-bold mb-4">No Actions Found</h2>
        <p class="text-gray-400 mb-6">
          There are no actions to display at this time.
        </p>
      </div>
    </div>
  `;
}

/**
 * Render action log
 * @param {HTMLElement} container - Container element
 * @param {Array} actions - List of actions to render
 */
function renderActionLog(container, actions) {
  container.innerHTML = `
    <div class="max-w-6xl mx-auto px-4">
      <h1 class="text-3xl font-bold mb-6">Action Log</h1>
      <div class="space-y-4">
        ${actions.map(action => {
          // Safe extraction with defaults
          const actorName = action.actorName || 'Unknown';
          const initial = actorName.charAt(0).toUpperCase();
          const actorImageUrl = action.actorImageUrl || ''; // Use direct image URL
    
          // Format the description for specific action types
          let actionDescription = '';
          let actionIcon = getActionIcon(action.action);
    
          switch (action.action) {
            case 'attack':
              actionDescription = `${actorName} attacked ${action.targetName || 'a target'}`;
              break;
            case 'defend':
              actionDescription = `${actorName} took a defensive stance`;
              break;
            case 'move':
              actionDescription = `${actorName} moved to ${action.targetName || action.location?.name || 'a location'}`;
              break;
            case 'remember':
              actionDescription = `${actorName} formed a memory`;
              break;
            case 'xpost':
              actionDescription = `${actorName} posted to X`;
              break;
            case 'post':
              actionDescription = `${actorName} posted to the social feed`;
              break;
            default:
              actionDescription = `${actorName} used ${action.action || 'an action'}`;
          }
    
          return `
            <div class="bg-gray-800 p-4 rounded-lg hover:bg-gray-750 transition-colors">
              <div class="flex items-start gap-3">
                <!-- Actor image with fallbacks -->
                ${actorImageUrl ? `
                  <img 
                    src="${actorImageUrl}" 
                    alt="${actorName}" 
                    class="w-12 h-12 rounded-full object-cover flex-shrink-0"
                    onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'100\\' height=\\'100\\' viewBox=\\'0 0 100 100\\'%3E%3Crect fill=\\'%23333\\' width=\\'100\\' height=\\'100\\'/%3E%3Ctext fill=\\'%23FFF\\' x=\\'50\\' y=\\'50\\' font-size=\\'50\\' text-anchor=\\'middle\\' dominant-baseline=\\'middle\\'%3E${initial}%3C/text%3E%3C/svg%3E';"
                  >
                ` : `
                  <div class="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-xl flex-shrink-0">
                    ${initial}
                  </div>
                `}
                
                <div class="flex-1">
                  <!-- Action header -->
                  <div class="flex justify-between">
                    <div class="font-medium">
                      <span class="text-lg mr-2">${actionIcon}</span>
                      <span class="text-white">${actionDescription}</span>
                    </div>
                    
                    <!-- Toggle action details button -->
                    <button 
                      class="text-gray-400 hover:text-white" 
                      onclick="this.closest('.bg-gray-800').querySelector('.action-details').classList.toggle('hidden')"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                  
                  <!-- Timestamp -->
                  <div class="text-sm text-gray-400 mt-1">
                    ${formatDate(action.timestamp || Date.now())}
                  </div>
                  
                  <!-- Collapsible details -->
                  <div class="action-details hidden mt-4">
                    ${action.result ? `
                      <div class="bg-gray-700 p-3 rounded mt-2">
                        <h4 class="font-medium mb-1 text-gray-300">Result</h4>
                        <p class="text-gray-300 text-sm whitespace-pre-wrap">${action.result.replace(/^✨ Posted to X and feed:\s*/, '')}</p>
                      </div>
                    ` : ''}
                    
                    ${action.memory ? `
                      <div class="bg-gray-700 p-3 rounded mt-2">
                        <h4 class="font-medium mb-1 text-gray-300">Memory</h4>
                        <p class="text-gray-300 text-sm whitespace-pre-wrap">${action.memory.replace(/\[🧠 Memory generated:\s*"(.*?)"\]$/s, '$1')}</p>
                      </div>
                    ` : ''}
                    
                    ${action.tweet ? `
                      <div class="bg-gray-700 p-3 rounded mt-2">
                        <h4 class="font-medium mb-1 flex items-center gap-2 text-gray-300">
                          <span class="text-lg">🐦</span> Posted to X
                        </h4>
                        <p class="text-gray-300 text-sm">${action.tweet}</p>
                      </div>
                    ` : ''}
                    
                    ${action.location?.imageUrl ? `
                      <div class="mt-2">
                        <h4 class="font-medium mb-1 text-gray-300">Location</h4>
                        <img 
                          src="${action.location.imageUrl}" 
                          alt="${action.location.name || 'Location'}" 
                          class="w-full h-32 object-cover rounded"
                          onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'100\\' height=\\'100\\' viewBox=\\'0 0 100 100\\'%3E%3Crect fill=\\'%23444\\' width=\\'100\\' height=\\'100\\'/%3E%3Ctext fill=\\'%23FFF\\' x=\\'50\\' y=\\'50\\' font-size=\\'24\\' text-anchor=\\'middle\\' dominant-baseline=\\'middle\\'%3ELocation Image Not Available%3C/text%3E%3C/svg%3E';"
                        >
                        ${action.location.description ? `
                          <p class="text-gray-400 text-sm mt-1">${action.location.description}</p>
                        ` : ''}
                      </div>
                    ` : ''}
                  </div>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}