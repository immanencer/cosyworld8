/**
 * Social Tab
 * Displays social feed content
 */

import { SocialAPI } from '../core/api.js';
import { state } from '../core/state.js';
import { formatDate } from '../utils/formatting.js';

/**
 * Load social tab content
 */
export async function loadContent() {
  const content = document.getElementById("content");
  if (!content) return;
  
  try {
    const data = await SocialAPI.getPosts({ sort: state.socialSort });
    
    if (!data || !data.posts|| data.posts.length === 0) {
      renderEmptyState(content);
      return;
    }
    
    renderSocialFeed(content, data.posts);
  } catch (err) {
    console.error("Load Social Content error:", err);
    content.innerHTML = `
      <div class="text-center py-12 text-red-500">
        Failed to load social content: ${err.message}
        <button class="mt-4 px-4 py-2 bg-primary-600 rounded" onclick="loadContent()">
          Retry
        </button>
      </div>
    `;
  }
}

/**
 * Render empty state when no posts found
 * @param {HTMLElement} container - Container element
 */
function renderEmptyState(container) {
  container.innerHTML = `
    <div class="max-w-4xl mx-auto px-4">
      <div class="text-center py-12">
        <h2 class="text-2xl font-bold mb-4">No Social Posts Found</h2>
        <p class="text-gray-400 mb-6">
          There are no social posts to display at this time.
        </p>
      </div>
    </div>
  `;
}

/**
 * Render social feed
 * @param {HTMLElement} container - Container element
 * @param {Array} posts - List of posts to render
 */
function renderSocialFeed(container, posts) {
  console.log(posts);
  container.innerHTML = `
    <div class="max-w-6xl mx-auto px-4">
      <div class="flex flex-col md:flex-row justify-between items-center mb-6">
        <h2 class="text-4xl font-bold text-white">Social Feed</h2>
        <div>
          <button 
            onclick="setSocialSort('new')" 
            class="${state.socialSort === 'new' ? 'bg-blue-600' : 'bg-gray-700'} px-4 py-2 rounded"
          >
            Latest
          </button>
          <button 
            onclick="setSocialSort('top')" 
            class="${state.socialSort === 'top' ? 'bg-blue-600' : 'bg-gray-700'} px-4 py-2 rounded"
          >
            Top
          </button>
        </div>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        ${posts.map(post => `
          <div class="bg-gray-800 rounded-lg p-6">
            <div class="flex items-center gap-3 mb-3">
              <img 
                src="${post.avatar.thumbnailUrl || post.avatar.imageUrl}" 
                class="w-12 h-12 rounded-full" 
                alt="${post.avatar.name}"
                onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'100\\' height=\\'100\\' viewBox=\\'0 0 100 100\\'%3E%3Crect fill=\\'%23333\\' width=\\'100\\' height=\\'100\\'/%3E%3Ctext fill=\\'%23FFF\\' x=\\'50\\' y=\\'50\\' font-size=\\'50\\' text-anchor=\\'middle\\' dominant-baseline=\\'middle\\'%3E${post.avatar.name.charAt(0).toUpperCase()}%3C/text%3E%3C/svg%3E';"
              >
              <div>
                <div class="font-bold text-xl text-white">${post.avatar.name}</div>
                <div class="text-sm text-gray-400">${formatDate(post.timestamp)}</div>
              </div>
            </div>
            <p class="mb-4 text-lg text-gray-100">${post.content}</p>
            <div class="flex justify-end">
              <button 
                onclick="showAvatarDetails('${post.avatar._id}')" 
                class="text-blue-400 hover:text-blue-300 text-sm"
              >
                View Avatar
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}