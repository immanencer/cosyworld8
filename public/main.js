//
// GLOBAL STATE
//

async function retryLeaderboardLoad(page) {
  const leaderboardItems = document.getElementById('leaderboard-items');
  const errorDiv = leaderboardItems.querySelector('.text-red-500');
  if (errorDiv) {
    errorDiv.remove();
  }
  await loadLeaderboard();
}

const state = {
  wallet: null,
  activeTab: "owned",
  loading: false,
};

//
// DOM REFERENCES
//
const content = document.getElementById("content");
const tabButtons = document.querySelectorAll("[data-tab]");

//
// HELPER FUNCTIONS
//

/**
 * Fetch JSON with error checking.
 * @param {string} url
 * @returns {Promise<any>} JSON data
 */
const fetchJSON = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

/**
 * Compute DnD-style ability modifier.
 * @param {number} score
 * @returns {number}
 */
const getModifier = (score) => {
  if (typeof score !== "number") return 0;
  return Math.floor((score - 10) / 2);
};

/**
 * Renders a small stats block for actors or targets.
 * @param {Object} stats
 * @param {string} title
 * @returns {string} HTML
 */
const renderStats = (stats = {}, title = "Details") => {
  if (!stats || typeof stats !== 'object' || Object.keys(stats).filter(k => typeof stats[k] === 'number').length === 0) {
    return `<div class="text-gray-400">${title}: Not available</div>`;
  }

  const hp = stats.hp ?? "N/A";
  const str = stats.strength ?? "N/A";
  const dex = stats.dexterity ?? "N/A";
  const con = stats.constitution ?? "N/A";
  const int = stats.intelligence ?? "N/A";
  const wis = stats.wisdom ?? "N/A";
  const cha = stats.charisma ?? "N/A";
  const ac =
    typeof stats.dexterity === "number"
      ? 10 + getModifier(stats.dexterity)
      : "N/A";

  return `
    <div>
      <h4 class="font-semibold mb-2">${title}</h4>
      <div class="flex gap-4 mb-4">
        <div class="text-center">
          <div class="text-2xl font-bold text-red-500">${hp}</div>
          <div class="text-xs text-gray-400">HP</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-blue-500">${str}</div>
          <div class="text-xs text-gray-400">STR</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-green-500">${ac}</div>
          <div class="text-xs text-gray-400">AC</div>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-2 text-sm">
        <p>DEX: ${dex} (${getModifier(stats.dexterity)})</p>
        <p>CON: ${con} (${getModifier(stats.constitution)})</p>
        <p>INT: ${int} (${getModifier(stats.intelligence)})</p>
        <p>WIS: ${wis} (${getModifier(stats.wisdom)})</p>
        <p>CHA: ${cha} (${getModifier(stats.charisma)})</p>
      </div>
    </div>
  `;
};

/**
 * Determine tier letter from model name.
 * @param {string} model
 * @returns {string} 'S', 'A', 'B', 'C', or 'U'
 */
function getTierFromModel(model) {
  if (!model) return "U"; // Unknown
  if (model.includes("gpt-4")) return "S";
  if (model.includes("gpt-3.5")) return "A";
  if (model.includes("claude")) return "B";
  return "C";
}

/**
 * Determine color class from tier.
 * @param {string} model
 * @returns {string} Tailwind CSS class
 */
function getTierColor(model) {
  const tier = getTierFromModel(model);
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
 * Render a single avatar card.
 * @param {Object} avatar
 * @returns {string} HTML
 */
function renderAvatar(avatar) {
  return `
    <div class="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition">
      <img 
        src="${avatar.thumbnailUrl || avatar.imageUrl}" 
        alt="${avatar.name}"
        class="w-full aspect-square object-cover rounded-lg mb-4"
      >
      <h3 class="text-lg font-semibold">${avatar.name}</h3>
      ${
        avatar.model
          ? `<p class="text-sm text-gray-400">${avatar.model}</p>`
          : ""
      }
      <div class="mt-2">
        <span class="px-2 py-1 rounded text-xs font-bold ${getTierColor(avatar.model)}">
          Tier ${getTierFromModel(avatar.model)}
        </span>
      </div>
    </div>
  `;
}

//
// TAB HANDLING & EVENT LISTENERS
//
tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setActiveTab(button.dataset.tab);
  });
});

function setActiveTab(tabName) {
  state.activeTab = tabName;

  // Update tab UI
  tabButtons.forEach((btn) => {
    btn.classList.toggle("bg-blue-600", btn.dataset.tab === tabName);
    btn.classList.toggle("bg-gray-700", btn.dataset.tab !== tabName);
  });

  // Load content for the new tab
  loadContent();
}

//
// WALLET CONNECTION
//
async function connectWallet() {
  try {
    const phantomProvider = window?.phantom?.solana;
    if (!phantomProvider) {
      alert("Please install the Phantom wallet extension.");
      return;
    }

    // Tiny delay to ensure the provider is ready
    await new Promise((resolve) => setTimeout(resolve, 100));

    const resp = await phantomProvider.connect();
    if (!resp?.publicKey) {
      throw new Error("No public key received from Phantom.");
    }

    state.wallet = {
      publicKey: resp.publicKey.toString(),
    };
    await loadContent();
  } catch (err) {
    console.error("Failed to connect wallet:", err);
    alert("Failed to connect wallet. Please try again.");
    state.wallet = null;
  }
}

//
// MAIN CONTENT LOADING
//
async function loadContent() {
  content.innerHTML = '<div class="text-center py-12">Loading...</div>';
  state.loading = true;

  try {
    switch (state.activeTab) {
      case "owned":
        await loadOwnedAvatars();
        break;
      case "actions":
        await loadActionLog();
        break;
      case "leaderboard":
        await loadLeaderboard();
        break;
      case "tribes":
        content.innerHTML =
          '<div class="text-center py-12">Tribes content coming soon</div>';
        break;
      default:
        content.innerHTML = `<div class="text-center py-12 text-red-500">
          Unknown tab: ${state.activeTab}
        </div>`;
    }
  } catch (error) {
    console.error("Error loading content:", error);
    content.innerHTML = `<div class="text-center py-12 text-red-500">
      Error loading content: ${error.message}
    </div>`;
  } finally {
    state.loading = false;
  }
}

//
// TAB-SPECIFIC LOADERS
//

/**
 * Load owned avatars if a wallet is connected, or prompt to connect if not.
 */
async function loadOwnedAvatars() {
  if (!state.wallet) {
    content.innerHTML = `
      <div class="text-center py-12 col-span-3">
        <p class="mb-4">Connect your wallet to view owned avatars</p>
        <button class="px-4 py-2 bg-blue-600 rounded" onclick="connectWallet()">
          Connect Wallet
        </button>
      </div>`;
    return;
  }

  try {
    const { publicKey } = state.wallet;
    const data = await fetchJSON(
      `/api/avatars?view=owned&walletAddress=${publicKey}&page=1&limit=12`,
    );

    if (
      !data.avatars ||
      !Array.isArray(data.avatars) ||
      data.avatars.length === 0
    ) {
      content.innerHTML =
        '<div class="text-center py-12">No avatars found</div>';
      return;
    }

    content.innerHTML = data.avatars.map(renderAvatar).join("");
  } catch (error) {
    console.error("Error loading owned avatars:", error);
    content.innerHTML = `<div class="text-center py-12 text-red-500">
      Failed to load avatars: ${error.message}
    </div>`;
  }
}

/**
 * Load the action log from /api/dungeon/log and display it.
 */
async function loadActionLog() {
  try {
    const actions = await fetchJSON("/api/dungeon/log");
    if (!actions || !Array.isArray(actions) || actions.length === 0) {
      content.innerHTML =
        '<div class="text-center py-12">No actions found</div>';
      return;
    }

    content.innerHTML = actions
      .map((action) => {
        return `
          <div class="bg-gray-800 p-4 mb-2 rounded-lg hover:bg-gray-700 transition-colors">
            <div class="flex items-center gap-4">
              ${
                action.actorThumbnailUrl
                  ? `<img src="${action.actorThumbnailUrl}" alt="${action.actorName}" class="w-12 h-12 rounded-full">`
                  : ""
              }
              <div class="flex-1">
                <div class="flex items-center justify-between">
                  <div>
                    <span class="font-semibold">${action.actorName}</span>
                    <span class="text-gray-400">
                      ${
                        action.action === "attack"
                          ? "⚔️ attacked"
                          : action.action === "defend"
                            ? "🛡️ took a defensive stance"
                            : action.action === "move"
                              ? "🚶‍♂️ moved to"
                              : action.action === "remember"
                                ? "💭 remembered"
                                : action.action === "xpost"
                                  ? "🐦 posted"
                                  : `used ${action.action}`
                      }
                    </span>
                    ${
                      action.action !== "defend" && action.targetName
                        ? `<span class="font-semibold"> → ${action.targetName}</span>`
                        : ""
                    }
                  </div>
                  <button
                    onclick="this.closest('.bg-gray-800').querySelector('.action-details').classList.toggle('hidden')"
                    class="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" clip-rule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0
                         011.414 1.414l-4 4a1 1 0
                         01-1.414 0l-4-4a1 1 0
                         010-1.414z"
                      />
                    </svg>
                  </button>
                </div>
                <div class="text-sm text-gray-500">
                  ${new Date(action.timestamp).toLocaleString()}
                </div>

                <!-- Collapsible details -->
                <div class="action-details hidden mt-4 p-3 bg-gray-900 rounded-lg">
                  ${
                    ["attack", "defend"].includes(action.action)
                      ? `
                        <div class="grid grid-cols-2 gap-4">
                          ${renderStats(action.actorStats, "⚔️ Actor Stats")}
                          ${
                            action.targetName
                              ? renderStats(
                                  action.targetStats,
                                  "Target Details",
                                )
                              : ""
                          }
                        </div>
                      `
                      : ""
                  }
                  ${
                    ((action.action === "move" && action.targetImageUrl) || 
                     (action.location && action.location.imageUrl))
                      ? `
                        <div class="mt-4">
                          <h4 class="font-semibold mb-2">${action.location?.name || 'Location'}</h4>
                          <img src="${action.location?.imageUrl || action.targetImageUrl}" 
                               alt="${action.location?.name || 'Location'}" 
                               class="w-full h-48 object-cover rounded-lg">
                          ${action.location?.description 
                            ? `<p class="mt-2 text-sm text-gray-400">${action.location.description}</p>` 
                            : ''}
                        </div>
                      `
                      : ""
                  }
                  ${
                    action.result
                      ? `
                        <div class="mt-4">
                          <h4 class="font-semibold mb-2">📝 Result</h4>
                          <p class="text-gray-300">${action.result}</p>
                        </div>
                      `
                      : ""
                  }
                  ${
                    action.memory
                      ? `
                        <div class="mt-4">
                          <h4 class="font-semibold mb-2">Memory</h4>
                          <p class="text-gray-300">${action.memory}</p>
                        </div>
                      `
                      : ""
                  }
                  ${
                    action.tweet
                      ? `
                        <div class="mt-4">
                          <h4 class="font-semibold mb-2">Posted to X</h4>
                          <p class="text-gray-300">${action.tweet}</p>
                        </div>
                      `
                      : ""
                  }
                </div>
              </div>
            </div>
          </div>
        `;
      })
      .join("");
  } catch (error) {
    console.error("Action log loading error:", error);
    content.innerHTML = `<div class="text-center py-12 text-red-500">
      Failed to load action log: ${error.message}
    </div>`;
  }
}

/**
 * Load the leaderboard data from /api/leaderboard.
 */
async function loadLeaderboard() {
  let scrollState = {
    page: 1,
    loading: false,
    hasMore: true
  };

  try {
    // Create container for leaderboard items
    content.innerHTML = `
      <div id="leaderboard-items" class="space-y-4"></div>
      <div id="leaderboard-loader" class="text-center py-8 hidden">Loading more...</div>
    `;

    const leaderboardItems = document.getElementById('leaderboard-items');
    const loader = document.getElementById('leaderboard-loader');

    async function loadMore() {
      if (scrollState.loading || !scrollState.hasMore) return;
      
      scrollState.loading = true;
      loader.classList.remove('hidden');

      try {
        const data = await fetchJSON(`/api/avatars/leaderboard?page=${scrollState.page}&limit=12&sort=score`);
        
        if (!data.avatars || !Array.isArray(data.avatars)) {
          scrollState.hasMore = false;
          return;
        }

        data.avatars.forEach((avatar) => {
          const div = document.createElement('div');
          div.className = 'bg-gray-800 p-4 rounded-lg flex items-center gap-4 hover:bg-gray-700 transition-colors';
          div.innerHTML = `
            <a href="/avatar-details.html?id=${avatar._id}" class="flex items-center gap-4 w-full">
              <img
                src="${avatar.thumbnailUrl || avatar.imageUrl}"
                alt="${avatar.name}"
                class="w-16 h-16 object-cover rounded-full"
              >
              <div>
                <h3 class="text-lg font-semibold">${avatar.name}</h3>
                <p class="text-sm text-gray-400">Score: ${avatar.score || 0}</p>
                ${
                  avatar.model
                    ? `<p class="text-xs text-gray-500">${avatar.model}</p>`
                    : ""
                }
              </div>
            </a>
          `;
          leaderboardItems.appendChild(div);
        });

        scrollState.hasMore = data.avatars.length === 12;
        scrollState.page++;
      } catch (error) {
        console.error("Failed to load more leaderboard items:", error);
        
        // Clear any existing error messages
        const existingError = leaderboardItems.querySelector('.error-message');
        if (existingError) {
          existingError.remove();
        }
        
        // Show error message with retry button
        const errorDiv = document.createElement('div');
        errorDiv.className = 'text-red-500 text-center py-4 error-message';
        errorDiv.innerHTML = `
          ${error.message || 'Failed to load more items'}
          <button 
            class="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onclick="retryLeaderboardLoad(${scrollState.page})"
          >
            Retry
          </button>
        `;
        leaderboardItems.appendChild(errorDiv);
        
        // Keep scrollState.hasMore true so we can retry
        scrollState.hasMore = true;
        scrollState.loading = false;
      } finally {
        scrollState.loading = false;
        loader.classList.add('hidden');
      }
    }

    // Initial load
    await loadMore();

    // Set up infinite scroll
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        loadMore();
      }
    }, { threshold: 0.5 });

    observer.observe(loader);

  } catch (error) {
    console.error("Failed to load leaderboard:", error);
    content.innerHTML = `<div class="text-center py-12 text-red-500">
      Failed to load leaderboard: ${error.message}
    </div>`;
  }
}

//
// INITIALIZE
//
document.addEventListener("DOMContentLoaded", () => {
  loadContent();
});