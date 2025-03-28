/**
 * Leaderboard Tab
 * Displays avatar rankings
 */

import { LeaderboardAPI, ClaimsAPI } from '../core/api.js';
import { state } from '../core/state.js';

/**
 * Load leaderboard tab content
 */
export async function loadContent() {
  const content = document.getElementById("content");
  if (!content) return;
  
  try {
    content.innerHTML = `
      <div class="max-w-7xl mx-auto px-4">
        <h1 class="text-3xl font-bold mb-6">Leaderboard</h1>
        <div id="leaderboard-items" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"></div>
        <div id="leaderboard-loader" class="text-center py-8 hidden">
          <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
          <p class="mt-2 text-gray-400">Loading more avatars...</p>
        </div>
      </div>`;

    // Set up window scroll state for infinite scrolling
    if (state.activeTab === "leaderboard") {
      window.scrollState = {
        page: 1,
        loading: false,
        hasMore: true,
        initialized: false,
      };
    } else {
      window.scrollState = window.scrollState || {
        page: 1,
        loading: false,
        hasMore: true,
      };
    }

    // Load initial data
    const data = await LeaderboardAPI.getLeaderboard({ page: 1, limit: 12 });
    const leaderboardItems = document.getElementById("leaderboard-items");
    const loader = document.getElementById("leaderboard-loader");

    if (!data.avatars || data.avatars.length === 0) {
      renderEmptyState(leaderboardItems);
      return;
    }

    // Check claim status for each avatar
    const avatarsWithClaimStatus = await Promise.all(data.avatars.map(async avatar => {
      try {
        const claimStatusRes = await ClaimsAPI.getStatus(avatar._id);
        return {
          ...avatar,
          isClaimed: claimStatusRes.claimed || false,
          claimedBy: claimStatusRes.claimedBy || ''
        };
      } catch (err) {
        console.warn(`Failed to get claim status for avatar ${avatar._id}:`, err);
        return {
          ...avatar,
          isClaimed: false,
          claimedBy: ''
        };
      }
    }));

    renderLeaderboardItems(leaderboardItems, avatarsWithClaimStatus);
    setupInfiniteScroll(loader, leaderboardItems);

  } catch (err) {
    console.error("Load Leaderboard error:", err);
    content.innerHTML = `
      <div class="text-center py-12 text-red-500">
        Failed to load leaderboard: ${err.message}
        <button class="mt-4 px-4 py-2 bg-primary-600 rounded" onclick="loadContent()">
          Retry
        </button>
      </div>
    `;
  }
}

/**
 * Render empty state when no avatars found
 * @param {HTMLElement} container - Container element
 */
function renderEmptyState(container) {
  container.innerHTML = `
    <div class="col-span-full text-center py-4">
      <h2 class="text-xl font-bold mb-2">No Leaderboard Data Available</h2>
      <p class="text-gray-400">Check back later for updated rankings.</p>
    </div>
  `;
}

/**
 * Render leaderboard items
 * @param {HTMLElement} container - Container element
 * @param {Array} avatars - List of avatars to render
 */
function renderLeaderboardItems(container, avatars) {
  // Try to use AvatarDetails component if available
  const { renderLeaderboardCard } = window.AvatarDetails || {};
  
  // Create HTML for leaderboard items
  const itemsHTML = avatars.map(avatar => `
    <div onclick="showAvatarDetails('${avatar._id}')" class="cursor-pointer">
      ${typeof renderLeaderboardCard === 'function' 
        ? renderLeaderboardCard(avatar, avatar.isClaimed)
        : defaultRenderLeaderboardCard(avatar, avatar.isClaimed)}
    </div>
  `).join('');
  
  // Add to container
  container.innerHTML = itemsHTML;
}

/**
 * Default leaderboard card renderer if AvatarDetails component is not available
 * @param {Object} avatar - Avatar data
 * @param {boolean} isClaimed - Whether the avatar is claimed
 * @returns {string} - Leaderboard card HTML
 */
function defaultRenderLeaderboardCard(avatar, isClaimed) {
  const getTier = (model) => {
    if (!model) return "U";
    if (model.includes("gpt-4")) return "S";
    if (model.includes("gpt-3.5")) return "A";
    if (model.includes("claude")) return "B";
    return "C";
  };

  const getTierColor = (model) => {
    const tier = getTier(model);
    const colors = {
      S: "bg-purple-600",
      A: "bg-blue-600",
      B: "bg-green-600",
      C: "bg-yellow-600",
      U: "bg-gray-600",
    };
    return colors[tier] || colors.U;
  };

  return `
    <div class="avatar-card bg-gray-800 p-3 rounded-lg hover:bg-gray-700 transition-colors ${isClaimed ? 'border-l-2 border-green-500' : ''}">
      <div class="flex gap-3 items-center">
        <div class="relative">
          <img 
            src="${avatar.thumbnailUrl || avatar.imageUrl}" 
            alt="${avatar.name}" 
            class="w-16 h-16 object-cover rounded-full border-2 border-gray-600"
            onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'100\\' height=\\'100\\' viewBox=\\'0 0 100 100\\'%3E%3Crect fill=\\'%23333\\' width=\\'100\\' height=\\'100\\'/%3E%3Ctext fill=\\'%23FFF\\' x=\\'50\\' y=\\'50\\' font-size=\\'50\\' text-anchor=\\'middle\\' dominant-baseline=\\'middle\\'%3E${avatar.name.charAt(0).toUpperCase()}%3C/text%3E%3C/svg%3E';"
          >
          ${isClaimed ? `<div class="absolute -top-1 -right-1 bg-green-500 rounded-full w-5 h-5 flex items-center justify-center text-xs">✓</div>` : ''}
        </div>
        
        <div class="flex-1 min-w-0">
          <h3 class="text-sm font-semibold truncate">${avatar.name}</h3>
          <p class="text-xs text-gray-400">Score: ${avatar.score || 0}</p>
          
          <div class="flex items-center gap-2 mt-1">
            <span class="px-1.5 py-0.5 rounded text-xs font-bold ${getTierColor(avatar.model)}">
              Tier ${getTier(avatar.model)}
            </span>
            ${isClaimed ? `<span class="text-xs text-green-400">Claimed</span>` : ''}
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Set up infinite scroll for leaderboard
 * @param {HTMLElement} loader - Loader element
 * @param {HTMLElement} container - Container for items
 */
function setupInfiniteScroll(loader, container) {
  if (!loader || !container) return;
  
  // Make loadMore function available globally
  window.loadMoreLeaderboard = async () => {
    if (window.scrollState.loading || !window.scrollState.hasMore) return;

    window.scrollState.loading = true;
    loader.classList.remove("hidden");

    try {
      const nextPage = window.scrollState.page + 1;
      const moreData = await LeaderboardAPI.getLeaderboard({ page: nextPage, limit: 12 });

      if (!moreData.avatars || moreData.avatars.length === 0) {
        window.scrollState.hasMore = false;
        loader.classList.add("hidden");
        return;
      }

      // Check claim status for each avatar
      const avatarsWithClaimStatus = await Promise.all(moreData.avatars.map(async avatar => {
        try {
          const claimStatusRes = await ClaimsAPI.getStatus(avatar._id);
          return {
            ...avatar,
            isClaimed: claimStatusRes.claimed || false,
            claimedBy: claimStatusRes.claimedBy || ''
          };
        } catch (err) {
          console.warn(`Failed to get claim status for avatar ${avatar._id}:`, err);
          return {
            ...avatar,
            isClaimed: false,
            claimedBy: ''
          };
        }
      }));

      // Create document fragment to append new items
      const fragment = document.createDocumentFragment();
      avatarsWithClaimStatus.forEach(avatar => {
        const div = document.createElement("div");
        div.className = "cursor-pointer";
        div.onclick = () => window.showAvatarDetails(avatar._id);
        
        // Try to use AvatarDetails component if available
        const { renderLeaderboardCard } = window.AvatarDetails || {};
        div.innerHTML = typeof renderLeaderboardCard === 'function'
          ? renderLeaderboardCard(avatar, avatar.isClaimed)
          : defaultRenderLeaderboardCard(avatar, avatar.isClaimed);
          
        fragment.appendChild(div);
      });

      container.appendChild(fragment);
      window.scrollState.page = nextPage;

    } catch (err) {
      console.error("Failed to load more leaderboard items:", err);
      const errorDiv = document.createElement("div");
      errorDiv.className = "col-span-full text-center py-4 text-red-500";
      errorDiv.innerHTML = `
        Error loading more items: ${err.message}
        <button class="ml-2 px-3 py-1 bg-blue-600 text-white rounded" onclick="loadMoreLeaderboard()">
          Retry
        </button>
      `;
      container.appendChild(errorDiv);
    } finally {
      window.scrollState.loading = false;
      if (window.scrollState.hasMore) {
        loader.classList.remove("hidden");
      } else {
        loader.classList.add("hidden");
      }
    }
  };

  // Set up intersection observer for infinite scroll
  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !window.scrollState.loading && window.scrollState.hasMore) {
      window.loadMoreLeaderboard();
    }
  }, { threshold: 0.1 });

  observer.observe(loader);
  loader.classList.remove("hidden");
}