// Define base URL for API requests
const API_BASE_URL = "/api";

// Global State
const state = {
  wallet: null,
  activeTab: "squad",
  loading: false,
  socialSort: "new",
};

// Helper: Fetch JSON safely
const fetchJSON = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
  return res.json();
};

// Tab Handling
const tabButtons = document.querySelectorAll("[data-tab]");
tabButtons.forEach((btn) =>
  btn.addEventListener("click", () => setActiveTab(btn.dataset.tab))
);

function setActiveTab(tabName) {
  state.activeTab = tabName;
  // ...existing code to update tab UI classes...
  tabButtons.forEach((btn) =>
    btn.classList.toggle("bg-blue-600", btn.dataset.tab === tabName)
  );
  loadContent();
}

// Load main content based on active tab
async function loadContent() {
  const content = document.getElementById("content");
  content.innerHTML = '<div class="text-center py-12">Loading...</div>';
  state.loading = true;
  try {
    switch (state.activeTab) {
      case "squad":
        await loadSquad();
        break;
      case "actions":
        await loadActionLog();
        break;
      case "leaderboard":
        await loadLeaderboard();
        break;
      case "tribes":
        await loadTribes(); // Use our new tribes function
        break;
      case "social":
        await loadSocialContent();
        break;
      default:
        content.innerHTML = `<div class="text-center py-12 text-red-500">Unknown tab: ${state.activeTab}</div>`;
    }
  } catch (err) {
    console.error("Content load error:", err);
    content.innerHTML = `<div class="text-center py-12 text-red-500">${err.message}</div>`;
  } finally {
    state.loading = false;
  }
}

// Helper function to shorten wallet address
function shortenAddress(address) {
  if (typeof address !== 'string') return '';
  return address.slice(0, 6) + '...' + address.slice(-4);
}

// Load Squad Tab
async function loadSquad() {
  const content = document.getElementById("content");
  if (!state.wallet) {
    content.innerHTML = `
      <div class="text-center py-12">
        <p class="mb-4">Connect your wallet to view your Squad</p>
        <button class="px-4 py-2 bg-blue-600 rounded" onclick="connectWallet()">Connect Wallet</button>
      </div>`;
    return;
  }
  try {
    console.log(state.wallet.publicKey);
    const data = await fetchJSON(`${API_BASE_URL}/avatars?view=claims&walletAddress=${state.wallet.publicKey}&page=1&limit=12`);
    if (!data.avatars || data.avatars.length === 0) {
      content.innerHTML = '<div class="text-center py-12">No Squad members found</div>';
      return;
    }

    // Fetch claim status for each avatar to determine minting status
    const avatarsWithStatus = await Promise.all(data.avatars.map(async avatar => {
      try {
        const claimStatus = await fetchJSON(`/api/claims/status/${avatar._id}`);
        // An avatar is considered unminted if it's claimed but not minted yet
        avatar.mintStatus = claimStatus.claimed && !claimStatus.minted ? 'unminted' : 'minted';
      } catch (err) {
        avatar.mintStatus = 'unknown';
      }
      return avatar;
    }));
    // Use our new AvatarDetails component to render cards with status
    content.innerHTML = `
      <div class="text-center py-4">
        <h2 class="text-xl font-bold">Wallet: ${shortenAddress(state.wallet.publicKey)}</h2>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        ${avatarsWithStatus.map(avatar => `
          <div onclick="showAvatarDetails('${avatar._id}')" class="cursor-pointer relative">
            ${window.AvatarDetails.renderAvatarCard(avatar)}
            ${avatar.mintStatus === 'unminted' ?
        `<div class="absolute top-2 right-2 px-2 py-1 bg-yellow-600 text-white text-xs rounded-full">
                Unminted
              </div>` : ''}
          </div>
        `).join("")}
      </div>
      <div id="claims-container" class="container mx-auto max-w-7xl"></div>
      <div id="claim-form-container" class="container mx-auto max-w-7xl hidden"></div>
    `;

    // Load user claims
    await loadUserClaims();
  } catch (err) {
    console.error("Load Squad error:", err);
    content.innerHTML = `<div class="text-center py-12 text-red-500">Failed to load Squad: ${err.message}</div>`;
  }
}

// Load Action Log Tab
async function loadActionLog() {
  const content = document.getElementById("content");
  try {
    const actions = await fetchJSON(`${API_BASE_URL}/dungeon/log`);
    if (!actions || actions.length === 0) {
      content.innerHTML = '<div class="text-center py-12">No actions found</div>';
      return;
    }

    content.innerHTML = `
      <div class="max-w-6xl mx-auto">
        <h1 class="text-3xl font-bold mb-6">Action Log</h1>
        <div class="space-y-4">
          ${actions.map(action => {
      // Safe extraction with defaults
      const actorName = action.actorName || 'Unknown';
      const initial = actorName.charAt(0).toUpperCase();
      const actorImageUrl = action.actorImageUrl || ''; // Use direct image URL

      // Format the description for specific action types
      let actionDescription = '';
      let actionIcon = '';

      switch (action.action) {
        case 'attack':
          actionIcon = '⚔️';
          actionDescription = `${actorName} attacked ${action.targetName || 'a target'}`;
          break;
        case 'defend':
          actionIcon = '🛡️';
          actionDescription = `${actorName} took a defensive stance`;
          break;
        case 'move':
          actionIcon = '🚶';
          actionDescription = `${actorName} moved to ${action.targetName || action.location?.name || 'a location'}`;
          break;
        case 'remember':
          actionIcon = '💭';
          actionDescription = `${actorName} formed a memory`;
          break;
        case 'xpost':
          actionIcon = '🐦';
          actionDescription = `${actorName} posted to X`;
          break;
        case 'post':
          actionIcon = '📝';
          actionDescription = `${actorName} posted to the social feed`;
          break;
        default:
          actionIcon = '❓';
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
                      ${new Date(action.timestamp || Date.now()).toLocaleString()}
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
      </div>`;
  } catch (err) {
    console.error("Load Action Log error:", err);
    content.innerHTML = `<div class="text-center py-12 text-red-500">Failed to load actions: ${err.message}</div>`;
  }
}

// Load Leaderboard Tab
async function loadLeaderboard() {
  const content = document.getElementById("content");
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
    const data = await fetchJSON(`${API_BASE_URL}/leaderboard?page=1&limit=12`);
    const leaderboardItems = document.getElementById("leaderboard-items");
    const loader = document.getElementById("leaderboard-loader");

    if (!data.avatars || data.avatars.length === 0) {
      leaderboardItems.innerHTML = '<div class="text-center py-4">No leaderboard data available</div>';
      return;
    }

    // Function to render a leaderboard card with fallback if the component function is not available
    const renderLeaderboardItem = (avatar) => {
      // First try using our component
      if (window.AvatarDetails && typeof window.AvatarDetails.renderLeaderboardCard === 'function') {
        return window.AvatarDetails.renderLeaderboardCard(avatar);
      }

      // Fallback to render the card directly if the component function is not available
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
        <div class="avatar-card bg-gray-800 p-3 rounded-lg hover:bg-gray-700 transition-colors">
          <div class="flex gap-3 items-center">
            <img 
              src="${avatar.thumbnailUrl || avatar.imageUrl}" 
              alt="${avatar.name}" 
              class="w-16 h-16 object-cover rounded-full border-2 border-gray-600"
              onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'100\\' height=\\'100\\' viewBox=\\'0 0 100 100\\'%3E%3Crect fill=\\'%23333\\' width=\\'100\\' height=\\'100\\'/%3E%3Ctext fill=\\'%23FFF\\' x=\\'50\\' y=\\'50\\' font-size=\\'50\\' text-anchor=\\'middle\\' dominant-baseline=\\'middle\\'%3E${avatar.name.charAt(0).toUpperCase()}%3C/text%3E%3C/svg%3E';"
            >
            
            <div class="flex-1 min-w-0">
              <h3 class="text-sm font-semibold truncate">${avatar.name}</h3>
              <p class="text-xs text-gray-400">Score: ${avatar.score || 0}</p>
              
              <div class="flex items-center gap-2 mt-1">
                <span class="px-1.5 py-0.5 rounded text-xs font-bold ${getTierColor(avatar.model)}">
                  Tier ${getTier(avatar.model)}
                </span>
              </div>
            </div>
          </div>
        </div>
      `;
    };

    // Use our render function (either component or fallback)
    leaderboardItems.innerHTML = data.avatars.map(avatar => `
      <div onclick="showAvatarDetails('${avatar._id}')" class="cursor-pointer">
        ${renderLeaderboardItem(avatar)}
      </div>
    `).join("");

    // Set up infinite scroll with the same render function
    const loadMore = async () => {
      if (window.scrollState.loading || !window.scrollState.hasMore) return;

      window.scrollState.loading = true;
      loader.classList.remove("hidden");

      try {
        const nextPage = window.scrollState.page + 1;
        const moreData = await fetchJSON(`${API_BASE_URL}/leaderboard?page=${nextPage}&limit=12`);

        if (!moreData.avatars || moreData.avatars.length === 0) {
          window.scrollState.hasMore = false;
          loader.classList.add("hidden");
          return;
        }

        // Append new avatar cards
        const fragment = document.createDocumentFragment();
        moreData.avatars.forEach(avatar => {
          const div = document.createElement("div");
          div.className = "cursor-pointer";
          div.onclick = () => showAvatarDetails(avatar._id);
          div.innerHTML = renderLeaderboardItem(avatar);
          fragment.appendChild(div);
        });

        leaderboardItems.appendChild(fragment);
        window.scrollState.page = nextPage;

      } catch (err) {
        console.error("Failed to load more leaderboard items:", err);
        const errorDiv = document.createElement("div");
        errorDiv.className = "col-span-full text-center py-4 text-red-500";
        errorDiv.innerHTML = `
          Error loading more items: ${err.message}
          <button class="ml-2 px-3 py-1 bg-blue-600 text-white rounded" onclick="retryLeaderboardLoad()">
            Retry
          </button>
        `;
        leaderboardItems.appendChild(errorDiv);
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
        loadMore();
      }
    }, { threshold: 0.1 });

    if (loader) {
      observer.observe(loader);
    }

  } catch (err) {
    console.error("Load Leaderboard error:", err);
    content.innerHTML = `<div class="text-center py-12 text-red-500">Failed to load leaderboard: ${err.message}</div>`;
  }
}

// Load Social Content Tab
async function loadSocialContent() {
  const content = document.getElementById("content");
  try {
    const posts = await fetchJSON(`${API_BASE_URL}/social/posts?sort=${state.socialSort}`);
    content.innerHTML = `
      <div class="max-w-6xl mx-auto px-4">
        <div class="flex flex-col md:flex-row justify-between items-center mb-6">
          <h2 class="text-4xl font-bold text-white">Social Feed</h2>
          <div>
            <button onclick="setSocialSort('new')" class="${state.socialSort === 'new' ? 'bg-blue-600' : 'bg-gray-700'} px-4 py-2 rounded">Latest</button>
            <button onclick="setSocialSort('top')" class="${state.socialSort === 'top' ? 'bg-blue-600' : 'bg-gray-700'} px-4 py-2 rounded">Top</button>
          </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          ${posts.map(post => `
            <div class="bg-gray-800 rounded-lg p-6">
              <div class="flex items-center gap-3 mb-3">
                <img src="${post.avatar.thumbnailUrl || post.avatar.imageUrl}" class="w-12 h-12 rounded-full" alt="${post.avatar.name}">
                <div>
                  <div class="font-bold text-xl text-white">${post.avatar.name}</div>
                  <div class="text-sm text-gray-400">${new Date(post.timestamp).toLocaleString()}</div>
                </div>
              </div>
              <p class="mb-4 text-lg text-gray-100">${post.content}</p>
            </div>
          `).join("")}
        </div>
      </div>`;
  } catch (err) {
    console.error("Load Social Content error:", err);
    content.innerHTML = `<div class="text-center py-12 text-red-500">Failed to load social content: ${err.message}</div>`;
  }
}

async function setSocialSort(sort) {
  state.socialSort = sort;
  await loadSocialContent();
}

// Load Tribes Tab
async function loadTribes() {
  const content = document.getElementById("content");

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
    const tribeCounts = await fetchJSON(`${API_BASE_URL}/tribes/counts`);
    const loader = document.getElementById('tribes-loader');
    const tribesContent = document.getElementById('tribes-content');
    const tribesGrid = document.getElementById('tribes-grid');
    const tribeDetails = document.getElementById('tribe-details');

    if (!tribeCounts || tribeCounts.length === 0) {
      loader.innerHTML = '<div class="text-center text-gray-400">No tribes found</div>';
      return;
    }

    // Render tribe cards
    tribesGrid.innerHTML = tribeCounts.map(tribe => `
      <div 
        class="tribe-card bg-gray-800 rounded-lg p-5 flex flex-col items-center hover:bg-gray-700 transition-colors cursor-pointer"
        data-emoji="${tribe.emoji}" 
        onclick="showTribeDetails('${tribe.emoji}')"
      >
        <div class="text-5xl mb-3">${tribe.emoji}</div>
        <div class="text-xl font-bold">Tribe ${tribe.emoji}</div>
        <div class="text-gray-400 mt-2">
          ${tribe.count} ${tribe.count === 1 ? 'member' : 'members'}
        </div>
      </div>
    `).join('');

    // Hide loader, show content
    loader.classList.add('hidden');
    tribesContent.classList.remove('hidden');

    // Set up back button handler
    document.getElementById('back-to-tribes').addEventListener('click', () => {
      tribesContent.classList.remove('hidden');
      tribeDetails.classList.add('hidden');
    });

  } catch (err) {
    console.error("Load Tribes error:", err);
    content.innerHTML = `
      <div class="text-center py-12 text-red-500">
        Failed to load tribes: ${err.message}
        <button 
          class="block mx-auto mt-4 px-4 py-2 bg-gray-700 rounded"
          onclick="loadTribes()"
        >
          Retry
        </button>
      </div>
    `;
  }
}

// Show details for a specific tribe
async function showTribeDetails(emoji) {
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
    const tribeData = await fetchJSON(`${API_BASE_URL}/tribes/${emoji}`);

    if (!tribeData || !tribeData.members || tribeData.members.length === 0) {
      tribeMembers.innerHTML = `
        <div class="col-span-full text-center text-gray-400 py-8">
          No members found for this tribe
        </div>
      `;
      return;
    }

    // Render tribe members with safe name extraction
    tribeMembers.innerHTML = tribeData.members.map(member => {
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

  } catch (err) {
    console.error("Show Tribe Details error:", err);
    document.getElementById('tribe-members').innerHTML = `
      <div class="col-span-full text-center text-red-500 py-8">
        Failed to load tribe members: ${err.message}
        <button 
          class="block mx-auto mt-4 px-4 py-2 bg-gray-700 rounded"
          onclick="showTribeDetails('${emoji}')"
        >
          Retry
        </button>
      </div>
    `;
  }
}

// Mobile Navigation Toggle
document.getElementById("open-mobile-nav")?.addEventListener("click", () => {
  // ...existing code to open mobile navigation...
  document.querySelector("nav").classList.toggle("hidden");
});

// Toast Notifications
function showToast(message) {
  const container = document.getElementById("toast-container");
  if (!container) {
    console.log('Toast message (no container):', message);
    alert(message);
    return;
  }

  const toast = document.createElement("div");
  toast.className = "toast bg-gray-800 text-white p-3 rounded shadow";
  toast.textContent = message;
  container.appendChild(toast);

  // Remove after animation completes
  setTimeout(() => {
    if (toast.parentNode === container) {
      toast.remove();
    }
  }, 3000);
}

// Initialization
document.addEventListener("DOMContentLoaded", () => {
  // Inject wallet connect button if missing
  const walletContainer = document.querySelector(".wallet-container");
  if (walletContainer && !walletContainer.innerHTML.trim()) {
    walletContainer.innerHTML = `<button onclick="connectWallet()" class="px-4 py-2 bg-blue-600 text-white rounded">Connect Wallet</button>`;
  }

  // Auto connect wallet if available and trusted
  const provider = window?.phantom?.solana;
  if (provider) {
    provider.connect({ onlyIfTrusted: true })
      .then(resp => {
        if (resp?.publicKey) {
          state.wallet = { publicKey: resp.publicKey.toString() };
          updateWalletUI();
          loadContent();
        }
      })
      .catch(err => {
        console.warn("Auto-connect failed or not trusted:", err);
        // Proceed with loading the component script even if auto-connect fails
        loadAvatarDetailsScript();
      });
  } else {
    loadAvatarDetailsScript();
  }

  function loadAvatarDetailsScript() {
    // Load the AvatarDetails component script
    if (!window.AvatarDetails) {
      const script = document.createElement('script');
      script.src = '/js/avatarDetails.js';
      script.onload = () => {
        console.log('AvatarDetails component loaded');
        loadContent();
      };
      script.onerror = (err) => {
        console.error('Failed to load AvatarDetails component:', err);
        loadContent(); // Still attempt to load content without the component
      };
      document.head.appendChild(script);
    } else {
      loadContent();
    }
  }

  // Event listener to close modal when clicking outside
  document.getElementById("avatar-modal")?.addEventListener("click", (e) => {
    if (e.target.id === "avatar-modal") {
      closeAvatarModal();
    }
  });

  updateWalletUI();
});

async function showAvatarDetails(avatarId) {
  const modal = document.getElementById("avatar-modal");
  const modalContent = document.getElementById("avatar-modal-content");

  modal.classList.remove("hidden");
  modalContent.innerHTML = `
    <div class="text-center p-8">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
      <p class="mt-2 text-gray-400">Loading avatar details...</p>
    </div>
  `;

  try {
    // Fetch all necessary avatar data
    const [
      avatarResponse,
      xauthStatusResponse,
      claimStatusResponse,
      narrativesResponse,
      actionsResponse,
      statsResponse,
    ] = await Promise.all([
      fetchJSON(`/api/avatars/${avatarId}`),
      fetchJSON(`/api/xauth/status/${avatarId}`),
      fetchJSON(`/api/claims/status/${avatarId}`),
      fetchJSON(`/api/avatars/${avatarId}/narratives`),
      fetchJSON(`/api/avatars/${avatarId}/dungeon-actions`),
      fetchJSON(`/api/avatars/${avatarId}/stats`),
    ]);

    // Combine all data into one avatar object
    const avatar = {
      ...avatarResponse,
      stats: statsResponse,
      narratives: narrativesResponse?.narratives || [],
      actions: actionsResponse?.actions || [],
    };

    // Set the selected avatar so that claimAvatar() can use it
    window.selectedAvatar = avatar;

    // Process X authorization status
    const xAuthStatus = processXAuthStatus(xauthStatusResponse, avatarId);

    // Use claimStatusResponse to determine if avatar is already claimed
    const isAvatarClaimed = claimStatusResponse && claimStatusResponse.claimed;
    const claimantAddress = claimStatusResponse?.claimedBy || '';

    // Check if the avatar is claimed by the current wallet
    const isClaimedByCurrentWallet = isAvatarClaimed &&
      claimantAddress?.toLowerCase() === state.wallet?.publicKey?.toLowerCase();

    // Add X auth button and status display only if claimed by current wallet
    const xAuthSection = isClaimedByCurrentWallet ? `
  <div class="mt-4 border-t border-gray-700 pt-4">
    <h3 class="font-medium text-lg mb-2">X Authorization Status</h3>
    <div class="flex items-center">
      <span class="px-2 py-1 rounded text-sm ${xAuthStatus.statusClass}">${xAuthStatus.statusText}</span>
      ${xAuthStatus.showButton ?
        `<button id="xauth-button" class="ml-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm">
          ${xAuthStatus.buttonText}
        </button>` : ''}
    </div>
    ${xAuthStatus.message ? `<p class="text-sm mt-2 text-gray-400">${xAuthStatus.message}</p>` : ''}
  </div>
` : '';

    // Add claim button only if avatar is not claimed and wallet is connected
    const claimSection = !isAvatarClaimed && state.wallet ?
      `<button id="claim-btn" class="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
        Claim this Avatar
      </button>` :
      (isAvatarClaimed ?
        `<div class="mt-4 px-4 py-2 bg-gray-700 rounded text-center">
          Already claimed by ${shortenAddress(claimantAddress)}
        </div>` : '');

    // Use our AvatarDetails component for the modal content
    modalContent.innerHTML = `
      <div class="relative p-6">
        <!-- Close button -->
        <button onclick="closeAvatarModal()" class="absolute top-4 right-4 text-gray-400 hover:text-white p-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <!-- Avatar Details -->
        ${window.AvatarDetails.renderAvatarDetails(avatar)}
        
        <!-- Additional sections for narratives, actions, etc. -->
        <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Narratives section -->
          <div class="bg-gray-800 p-4 rounded-lg">
            <h3 class="text-lg font-bold mb-2">Recent Narratives</h3>
            ${avatar.narratives.length > 0 ? `
              <div class="space-y-3">
                ${avatar.narratives.slice(0, 3).map(narrative => `
                  <div class="bg-gray-700/50 p-3 rounded">
                    <p class="text-sm text-gray-300">${narrative.content}</p>
                    <div class="text-xs text-gray-500 mt-1">
                      ${new Date(narrative.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : '<p class="text-gray-400">No narratives available.</p>'}
          </div>
          
          <!-- Actions section -->
          <div class="bg-gray-800 p-4 rounded-lg">
            <h3 class="text-lg font-bold mb-2">Recent Actions</h3>
            ${avatar.actions.length > 0 ? `
              <div class="space-y-2">
                ${avatar.actions.slice(0, 5).map(action => `
                  <div class="text-sm flex items-center gap-2 bg-gray-700/30 p-2 rounded">
                    <span class="text-lg">
                      ${action.action === "attack" ? "⚔️" :
        action.action === "defend" ? "🛡️" :
          action.action === "move" ? "🚶" :
            action.action === "remember" ? "💭" : "❓"}
                    </span>
                    <span>${action.description || action.action}</span>
                  </div>
                `).join('')}
              </div>
            ` : '<p class="text-gray-400">No recent actions.</p>'}
          </div>
        </div>
        

        <!-- X Auth Section -->
        ${xAuthSection}

        <!-- Claim Section -->
        ${claimSection}
      </div>
    `;

    if (xAuthStatus.showButton) {
      const xauthButton = document.getElementById("xauth-button");
      if (xauthButton) {
        xauthButton.addEventListener("click", () => initiateXAuth(avatarId));
      }
    }

    const claimBtn = document.getElementById('claim-btn');
    if (claimBtn) {
      claimBtn.addEventListener('click', () => claimAvatar(avatarId));
    }
  } catch (err) {
    console.error("Error loading avatar details:", err);
    modalContent.innerHTML = `
      <div class="text-center py-12 text-red-500">
        Failed to load avatar details: ${err.message}
        <button onclick="closeAvatarModal()" class="block mx-auto mt-4 px-4 py-2 bg-gray-700 rounded">Close</button>
      </div>
    `;
  }
}
// Helper function to process X authorization status
function processXAuthStatus(response, avatarId) {
  // Default values
  let result = {
    authorized: false,
    statusText: "Not Authorized",
    statusClass: "bg-red-600",
    showButton: true,
    buttonText: "Authorize with X",
    message: ""
  };

  if (!response) {
    return result;
  }

  switch (response.status) {
    case "authorized":
      result = {
        authorized: true,
        statusText: "Authorized",
        statusClass: "bg-green-600",
        showButton: false,
        buttonText: "",
        message: "Your X account is successfully linked to this avatar."
      };
      break;
    case "pending":
      result = {
        authorized: false,
        statusText: "Pending",
        statusClass: "bg-yellow-600",
        showButton: true,
        buttonText: "Complete Authorization",
        message: "Your authorization is pending. Please complete the process."
      };
      break;
    case "expired":
      result = {
        authorized: false,
        statusText: "Expired",
        statusClass: "bg-orange-600",
        showButton: true,
        buttonText: "Reauthorize",
        message: "Your authorization has expired. Please reauthorize."
      };
      break;
    // Add more cases as needed
  }

  return result;
}

// Convert Uint8Array to hex string
function uint8ArrayToHexString(uint8Array) {
  return Array.from(uint8Array)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

async function initiateXAuth(avatarId) {
  if (!state.wallet) {
    showAlert("Please connect your wallet first");
    return;
  }

  try {
    // Create a message to sign - include avatar ID and timestamp to prevent replay attacks
    const message = `Authorize X for avatar ${avatarId} at ${Date.now()}`;

    // Get wallet address from state - make sure to get publicKey for Phantom wallet
    const walletAddress = state.wallet.publicKey ||
      (typeof state.wallet === 'object' ?
        state.wallet.address || state.wallet.toString() :
        state.wallet);

    // Show a loading indicator or message
    showAlert("Please approve the signature request in your wallet");

    // Sign the message using Phantom wallet
    if (window.phantom && window.phantom.solana) {
      // Convert message to Uint8Array for Solana
      const messageBytes = new TextEncoder().encode(message);

      // Request signature from Phantom
      const signedMessage = await window.phantom.solana.signMessage(messageBytes, 'utf8');

      // Convert to hex string - same approach as working claims.js
      const signature = uint8ArrayToHexString(signedMessage.signature);

      // Use the auth-url endpoint with signature
      const queryParams = new URLSearchParams({
        avatarId,
        walletAddress,
        signature,
        message
      });

      const response = await fetch(`/api/xauth/auth-url?${queryParams}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("X auth error response:", errorText);
        throw new Error(`HTTP error ${response.status}`);
      }

      const data = await response.json();

      if (data.url) {
        // Open X authorization page in a new window/tab
        window.open(data.url, "_blank");
        showAlert("X authorization initiated. Please complete the process in the new window.");
      } else {
        showAlert("Failed to initiate X authorization.");
      }
    } else {
      throw new Error("Phantom wallet not connected");
    }
  } catch (error) {
    console.error("Error initiating X auth:", error);
    showAlert(`Error initiating X authorization: ${error.message}`);
  }
}
// Function to close the avatar modal
function closeAvatarModal() {
  const modal = document.getElementById("avatar-modal");
  if (modal) {
    modal.classList.add("hidden");
  }
}

// Helper function to retry leaderboard loading
function retryLeaderboardLoad() {
  if (window.scrollState) {
    window.scrollState.loading = false;
  }
  loadLeaderboard();
}

// Function to claim avatar from modal
async function claimAvatar() {
  if (!state.wallet) {
    showToast('Please connect your wallet first');
    return;
  }

  const avatar = window.selectedAvatar;
  if (!avatar || !avatar._id) {
    showToast('No avatar selected');
    return;
  }

  const claimBtn = document.getElementById('claim-btn');
  if (claimBtn) claimBtn.disabled = true;

  try {
    // Request signature from user
    const message = `I am claiming avatar ${avatar._id}`;
    const encodedMessage = new TextEncoder().encode(message);

    showToast('Please approve the signature request in your wallet');

    const signature = await window.phantom.solana.signMessage(encodedMessage, 'utf8');

    // Convert signature to hex string
    const signatureHex = Array.from(signature.signature)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Submit claim
    const response = await fetch('/api/claims/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        avatarId: avatar._id,
        walletAddress: state.wallet.publicKey,
        signature: signatureHex,
        message
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to claim avatar');
    }

    // Close the modal
    closeAvatarModal();

    // Show success message
    showToast('Avatar claimed successfully! View it in your squad.');

    // Refresh the content if on squad tab
    if (state.activeTab === "squad") {
      loadContent();
    }

  } catch (error) {
    console.error('Claim avatar error:', error);
    showToast('Failed to claim avatar: ' + (error.message || 'Unknown error'));
  } finally {
    if (claimBtn && document.body.contains(claimBtn)) {
      claimBtn.disabled = false;
    }
  }
}

// Load user claims
async function loadUserClaims() {
  if (!state.wallet) return;

  const claimsContainer = document.getElementById('claims-container');
  if (!claimsContainer) {
    console.error('Claims container not found when rendering claims');
    return;
  }

  claimsContainer.innerHTML = `
    <div class="text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
      <p class="mt-2 text-gray-400">Loading your claims...</p>
    </div>
  `;

  try {
    const response = await fetch(`/api/claims/user/${state.wallet.publicKey}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch claims');
    }

    claims = data.claims || [];
    allowance = data.allowance || { allowed: false, remaining: 0, current: 0 };

    renderClaims();
    renderClaimForm();
  } catch (error) {
    console.error('Load claims error:', error);
    claimsContainer.innerHTML = `
      <div class="text-center py-8 text-red-500">
        Failed to load claims: ${error.message}
        <button onclick="loadUserClaims()" class="block mx-auto mt-4 px-4 py-2 bg-gray-700 rounded">
          Retry
        </button>
      </div>
    `;
  }
}

// Render claims
function renderClaims() {
  const container = document.getElementById('claims-container');
  if (!container) {
    console.error('Claims container not found when rendering claims');
    return;
  }

  if (claims.length === 0) {
    container.innerHTML = `
      <div class="text-center py-8 text-gray-400">
        You haven't claimed any avatars yet.
        ${allowance.allowed ?
        `<p class="mt-2">You can claim up to ${allowance.remaining} more avatars.</p>` :
        '<p class="mt-2">You have reached your claim limit.</p>'
      }
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="mb-4">
      <h2 class="text-xl font-bold">Your Claims</h2>
      <p class="text-sm text-gray-400">
        You have claimed ${allowance.current} avatar${allowance.current !== 1 ? 's' : ''}.
        ${allowance.allowed ?
      `You can claim ${allowance.remaining} more.` :
      'You have reached your claim limit.'
    }
      </p>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      ${claims.map(claim => renderClaimCard(claim)).join('')}
    </div>
  `;
}

// Render claim card
function renderClaimCard(claimData) {
  const { claim, avatar } = claimData;
  if (!avatar) {
    return `
      <div class="bg-gray-800 p-4 rounded-lg">
        <p class="text-center text-gray-400">Avatar data not available</p>
        <p class="text-xs text-center text-gray-500 mt-2">ID: ${claim.avatarId}</p>
      </div>
    `;
  }

  return `
    <div class="bg-gray-800 p-4 rounded-lg">
      <div class="flex items-center gap-3">
        <img 
          src="${avatar.thumbnailUrl || avatar.imageUrl || ''}" 
          alt="${avatar.name || 'Avatar'}" 
          class="w-16 h-16 object-cover rounded-full"
          onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'100\\' height=\\'100\\' viewBox=\\'0 0 100 100\\'%3E%3Crect fill=\\'%23333\\' width=\\'100\\' height=\\'100\\'/%3E%3Ctext fill=\\'%23FFF\\' x=\\'50\\' y=\\'50\\' font-size=\\'50\\' text-anchor=\\'middle\\' dominant-baseline=\\'middle\\'%3E${(avatar.name || 'A').charAt(0).toUpperCase()}%3C/text%3E%3C/svg%3E';"
        >
        
        <div class="flex-1 min-w-0">
          <h3 class="font-bold truncate">${avatar.name || 'Unknown'}</h3>
          <div class="text-xs text-gray-400">
            Claimed: ${new Date(claim.createdAt).toLocaleDateString()}
          </div>
          <div class="text-xs text-gray-400">
            Claimed by: ${shortenAddress(claim.walletAddress)}
          </div>
          <div class="mt-1 flex items-center">
            <span class="px-2 py-0.5 text-xs rounded ${getStatusBadgeColor(claim.status)}">
              ${formatClaimStatus(claim.status)}
            </span>
          </div>
        </div>
        
        ${avatar.emoji ? `<div class="text-2xl">${avatar.emoji}</div>` : ''}
      </div>
      
      <div class="mt-4 flex justify-between items-center">
        <button 
          onclick="viewAvatar('${avatar._id}')"
          class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
        >
          View Details
        </button>
        
        ${claim.status === 'minted' ? `
          <a 
            href="${getMarketplaceUrl(claim)}" 
            target="_blank"
            class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
          >
            View on Marketplace
          </a>
        ` : claim.status === 'pending' ? `
          <div class="text-xs text-gray-400">
            Pending mint
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

// Render claim form
function renderClaimForm() {
  const claimFormContainer = document.getElementById('claim-form-container');
  if (!claimFormContainer) {
    console.error('Claim form container not found when rendering form');
    return;
  }

  if (!allowance.allowed) {
    claimFormContainer.classList.add('hidden');
    return;
  }

  claimFormContainer.classList.remove('hidden');
  claimFormContainer.innerHTML = `
    <div class="bg-gray-800 p-6 rounded-lg">
      <h2 class="text-xl font-bold mb-4">Claim a New Avatar</h2>
      
      <div class="mb-4">
        <label for="avatar-id" class="block text-sm font-medium text-gray-300">Avatar ID</label>
        <input 
          type="text" 
          id="avatar-id" 
          placeholder="Enter Avatar ID"
          class="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
      </div>
      
      <div class="mb-4">
        <button
          onclick="findAvatar()"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
        >
          Find Avatar
        </button>
      </div>
      
      <div id="avatar-preview" class="hidden bg-gray-700 p-4 rounded-lg mb-4">
        <!-- Avatar preview will be inserted here -->
      </div>
      
      <button
        onclick="claimAvatar()"
        id="claim-btn"
        class="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-bold disabled:bg-gray-600 disabled:cursor-not-allowed"
        disabled
      >
        Sign & Claim Avatar
      </button>
    </div>
  `;
}

// Format claim status
function formatClaimStatus(status) {
  switch (status) {
    case 'pending': return 'Pending';
    case 'minted': return 'Minted';
    case 'failed': return 'Failed';
    default: return 'Unknown';
  }
}

// Get status badge color
function getStatusBadgeColor(status) {
  switch (status) {
    case 'pending': return 'bg-yellow-600';
    case 'minted': return 'bg-green-600';
    case 'failed': return 'bg-red-600';
    default: return 'bg-gray-600';
  }
}

// Get marketplace URL (placeholder)
function getMarketplaceUrl(claim) {
  // This would be replaced with your actual marketplace URL logic
  return `https://testnets.opensea.io/assets/base-sepolia/${claim.contractAddress || '0x0000'}/${claim.tokenId || '0'}`;
}

// Find avatar by ID
async function findAvatar() {
  const avatarIdInput = document.getElementById('avatar-id');
  const avatarId = avatarIdInput.value.trim();
  const avatarPreview = document.getElementById('avatar-preview');
  const claimBtn = document.getElementById('claim-btn');

  if (!avatarId) {
    showAlert('Please enter an Avatar ID');
    return;
  }

  avatarPreview.innerHTML = `
    <div class="text-center py-4">
      <div class="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
      <p class="mt-2 text-xs text-gray-400">Looking for avatar...</p>
    </div>
  `;
  avatarPreview.classList.remove('hidden');
  claimBtn.disabled = true;

  try {
    // First check if avatar is already claimed
    const claimStatusRes = await fetch(`/api/claims/status/${avatarId}`);
    const claimStatusData = await claimStatusRes.json();

    if (!claimStatusRes.ok) {
      throw new Error(claimStatusData.error || 'Failed to check claim status');
    }

    if (claimStatusData.claimed) {
      avatarPreview.innerHTML = `
        <div class="text-center py-4 text-red-500">
          This avatar has already been claimed by 
          <span class="cursor-pointer text-blue-500" onclick="copyToClipboard('${claimStatusData.claimedBy}')">
            ${shortenAddress(claimStatusData.claimedBy)}
          </span>.
        </div>
      `;
      return;
    }

    // If not claimed, fetch avatar details
    const avatarRes = await fetch(`/api/avatars/${avatarId}`);
    const avatar = await avatarRes.json();

    if (!avatarRes.ok) {
      throw new Error(avatar.error || 'Failed to fetch avatar');
    }

    // Store avatar data for claim process
    window.selectedAvatar = avatar;

    // Render avatar preview
    avatarPreview.innerHTML = `
      <div class="flex items-center gap-3">
        <img 
          src="${avatar.thumbnailUrl || avatar.imageUrl || ''}" 
          alt="${avatar.name}" 
          class="w-16 h-16 object-cover rounded-full"
          onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'100\\' height=\\'100\\' viewBox=\\'0 0 100 100\\'%3E%3Crect fill=\\'%23333\\' width=\\'100\\' height=\\'100\\'/%3E%3Ctext fill=\\'%23FFF\\' x=\\'50\\' y=\\'50\\' font-size=\\'50\\' text-anchor=\\'middle\\' dominant-baseline=\\'middle\\'%3E${(avatar.name || 'A').charAt(0).toUpperCase()}%3C/text%3E%3C/svg%3E';"
        >
        <div class="flex-1 min-w-0">
          <h3 class="font-bold truncate">${avatar.name || 'Unknown'}</h3>
          <div class="text-xs text-gray-400">
            Created: ${new Date(avatar.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    `;

    claimBtn.disabled = false;
  } catch (error) {
    console.error('Find avatar error:', error);
    avatarPreview.innerHTML = `
      <div class="text-center py-4 text-red-500">
        Failed to find avatar: ${error.message}
      </div>
    `;
  }
}

// Convert Uint8Array to hex string
function uint8ArrayToHexString(uint8Array) {
  return Array.from(uint8Array)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

// Initiate claim process
async function claimAvatar() {
  const claimBtn = document.getElementById('claim-btn');
  if (!claimBtn) {
    console.error('Claim button not found');
    return;
  }
  claimBtn.disabled = true;

  try {
    const avatar = window.selectedAvatar;
    if (!avatar || !avatar._id) {
      showAlert('Please select an avatar first');
      claimBtn.disabled = false;
      return;
    }
    if (!state.wallet) {
      showAlert('Wallet not connected. Please connect your wallet.');
      claimBtn.disabled = false;
      return;
    }

    // Request signature from user
    const message = `I am claiming avatar ${avatar._id}`;
    const encodedMessage = new TextEncoder().encode(message);
    const signature = await window.phantom.solana.signMessage(encodedMessage, 'utf8');

    // Convert signature to hex string
    const signatureHex = uint8ArrayToHexString(signature.signature);

    // Submit claim
    const response = await fetch('/api/claims/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        avatarId: avatar._id,
        walletAddress: state.wallet.publicKey,
        signature: signatureHex,
        message
      })
    });

    const data = await response.json();
    if (!response.ok) {
      if (data.error === 'Avatar already claimed') {
        showAlert(`Avatar already claimed by ${shortenAddress(data.claimedBy)}`);
      } else if (data.error === 'Invalid signature') {
        showAlert('Invalid signature. Please try again.');
      } else {
        throw new Error(data.error || 'Failed to claim avatar');
      }
      claimBtn.disabled = false;
      return;
    }

    // Reload claims
    await loadUserClaims();
    showAlert('Avatar claimed successfully!');
  } catch (error) {
    console.error('Claim process error:', error);
    showAlert('Failed to claim avatar: ' + (error.message || 'Unknown error'));
  } finally {
    claimBtn.disabled = false;
  }
}

// Helper functions
function showAlert(message) {
  console.log('Alert:', message);

  // Try to use toast notification if available
  const toastContainer = document.getElementById('toast-container');
  if (toastContainer) {
    const toast = document.createElement('div');
    toast.className = 'toast bg-gray-800 text-white p-3 rounded shadow';
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, 3000);
    return;
  }

  // Fall back to standard alert
  alert(message);
}

function shortenAddress(address) {
  if (typeof address !== 'string') return '';
  return address.slice(0, 6) + '...' + address.slice(-4);
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showAlert('Address copied to clipboard');
  }).catch(err => {
    console.error('Failed to copy text: ', err);
  });
}
