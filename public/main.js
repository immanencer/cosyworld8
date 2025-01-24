//
// GLOBAL STATE
//
async function retryLeaderboardLoad(page) {
  const leaderboardItems = document.getElementById("leaderboard-items");
  const errorDiv = leaderboardItems.querySelector(".text-red-500");
  if (errorDiv) {
    errorDiv.remove();
  }
  await loadLeaderboard();
}

const state = {
  wallet: null,
  activeTab: "owned",
  loading: false,
  socialSort: "new",
};

//
// DOM REFERENCES
//
const content = document.getElementById("content");
const tabButtons = document.querySelectorAll("[data-tab]");

//
// HELPER FUNCTIONS
//
const fetchJSON = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

const getModifier = (score) => {
  if (typeof score !== "number") return 0;
  return Math.floor((score - 10) / 2);
};

function getTierFromModel(model) {
  if (!model) return "U"; // Unknown
  if (model.includes("gpt-4")) return "S";
  if (model.includes("gpt-3.5")) return "A";
  if (model.includes("claude")) return "B";
  return "C";
}

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

//
// RENDER FUNCTIONS
//
const renderStats = (stats = {}, title = "Details") => {
  if (
    !stats ||
    typeof stats !== "object" ||
    Object.keys(stats).filter((k) => typeof stats[k] === "number").length === 0
  ) {
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
        <span class="px-2 py-1 rounded text-xs font-bold ${getTierColor(
          avatar.model,
        )}">
          Tier ${getTierFromModel(avatar.model)}
        </span>
      </div>
    </div>
  `;
}

//
// TAB HANDLING
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
// MAIN CONTENT LOADING (PER TAB)
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
        content.innerHTML = `
          <div class="text-center py-12">
            Tribes content coming soon
          </div>
        `;
        break;
      case "social":
        await loadSocialContent();
        break;
      default:
        content.innerHTML = `
          <div class="text-center py-12 text-red-500">
            Unknown tab: ${state.activeTab}
          </div>
        `;
    }
  } catch (error) {
    console.error("Error loading content:", error);
    content.innerHTML = `
      <div class="text-center py-12 text-red-500">
        Error loading content: ${error.message}
      </div>
    `;
  } finally {
    state.loading = false;
  }
}

//
// AVATAR CLAIMING
//
async function claimAvatar(avatarId) {
  if (!state.wallet) {
    alert("Please connect your wallet first");
    return;
  }

  try {
    const response = await fetch(`/api/avatars/${avatarId}/claim`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ walletAddress: state.wallet.publicKey }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to claim avatar");
    }

    closeAvatarModal();
    await loadContent();
  } catch (error) {
    console.error("Error claiming avatar:", error);
    alert(error.message);
  }
}

//
// LOADERS PER TAB
//
async function loadOwnedAvatars() {
  if (!state.wallet) {
    content.innerHTML = `
      <div class="text-center py-12">
        <p class="mb-4">Connect your wallet to view owned avatars</p>
        <button
          class="px-4 py-2 bg-blue-600 rounded"
          onclick="connectWallet()"
        >
          Connect Wallet
        </button>
      </div>
    `;
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
      content.innerHTML = `
        <div class="text-center py-12">
          No avatars found
        </div>
      `;
      return;
    }

    content.innerHTML = `
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        ${data.avatars.map(renderAvatar).join("")}
      </div>
    `;
  } catch (error) {
    console.error("Error loading owned avatars:", error);
    content.innerHTML = `
      <div class="text-center py-12 text-red-500">
        Failed to load avatars: ${error.message}
      </div>
    `;
  }
}

async function loadActionLog() {
  try {
    const actions = await fetchJSON("/api/dungeon/log");
    if (!actions || !Array.isArray(actions) || actions.length === 0) {
      content.innerHTML = `
        <div class="text-center py-12">
          No actions found
        </div>
      `;
      return;
    }

    content.innerHTML = actions
      .map((action) => {
        // Clean up the "result" text (often has a prefix like "✨ Posted to X and feed: ...")
        const resultText = action.result
          ? action.result.replace(/^✨ Posted to X and feed:\s*/, "")
          : "";

        // Clean up the "memory" text (often has a bracketed prefix like "[🧠 Memory generated: "...")
        const memoryText = action.memory
          ? action.memory.replace(/\[🧠 Memory generated:\s*"(.*?)"\]$/s, "$1")
          : "";

        // Decide whether to label the block as "Post Content" (for xpost/post) or "Result"
        const isPostAction =
          action.action === "xpost" || action.action === "post";
        const headingForResult = isPostAction ? "Post Content" : "Result";

        // Hide “memory” block if it duplicates the exact same text we already displayed
        const showMemory = memoryText && memoryText !== resultText;

        return `
          <div class="bg-gray-800 p-4 mb-2 rounded-lg hover:bg-gray-700 transition-colors">
            <div class="flex flex-col sm:flex-row items-center gap-4">
              ${
                action.actorThumbnailUrl
                  ? `<img
                      src="${action.actorThumbnailUrl}"
                      alt="${action.actorName}"
                      class="w-12 h-12 rounded-full"
                    >`
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
                      (action.action === "attack" ||
                        action.action === "move") &&
                      action.targetName
                        ? `<span class="font-semibold"> → ${action.targetName}</span>`
                        : ""
                    }
                  </div>
                  <button
                    onclick="this.closest('.bg-gray-800').querySelector('.action-details').classList.toggle('hidden')"
                    class="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M5.293 7.293a1 1 0
                           011.414 0L10 10.586l3.293-3.293a1 1 0
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
                    // If it's an attack/defend, show stats
                    ["attack", "defend"].includes(action.action)
                      ? `
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    // If there's a location image (e.g., from a move action), show it
                    (action.action === "move" && action.targetImageUrl) ||
                    (action.location && action.location.imageUrl)
                      ? `
                        <div class="mt-4">
                          <h4 class="font-semibold mb-2">
                            ${action.location?.name || "Location"}
                          </h4>
                          <img
                            src="${
                              action.location?.imageUrl || action.targetImageUrl
                            }"
                            alt="${action.location?.name || "Location"}"
                            class="w-full h-48 object-cover rounded-lg"
                          >
                          ${
                            action.location?.description
                              ? `<p class="mt-2 text-sm text-gray-400">
                                  ${action.location.description}
                                </p>`
                              : ""
                          }
                        </div>
                      `
                      : ""
                  }

                  ${
                    resultText
                      ? `
                        <div class="mt-4">
                          <h4 class="font-semibold mb-2">📝 ${headingForResult}</h4>
                          <p class="text-gray-300 whitespace-pre-wrap break-words">${resultText}</p>
                        </div>
                      `
                      : ""
                  }

                  ${
                    showMemory
                      ? `
                        <div class="mt-4">
                          <h4 class="font-semibold mb-2">Memory</h4>
                          <p class="text-gray-300 whitespace-pre-wrap break-words">${memoryText}</p>
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
    content.innerHTML = `
      <div class="text-center py-12 text-red-500">
        Failed to load action log: ${error.message}
      </div>
    `;
  }
}

async function loadLeaderboard() {
  const scrollState = {
    cursor: null,
    loading: false,
    hasMore: true,
    initialized: false,
  };

  content.innerHTML = `
    <div class="max-w-7xl mx-auto px-4">
      <div id="leaderboard-items" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-3"></div>
      <div id="leaderboard-loader" class="text-center py-8 hidden">
        Loading more...
      </div>
    </div>
  `;

  const leaderboardItems = document.getElementById("leaderboard-items");
  const loader = document.getElementById("leaderboard-loader");

  async function loadMore() {
    if (scrollState.loading || !scrollState.hasMore) return;

    scrollState.loading = true;
    loader.classList.remove("hidden");

    try {
      const data = await fetchJSON(
        `/api/leaderboard?limit=12${scrollState.cursor ? `&cursor=${scrollState.cursor}` : ""}`,
      );

      if (!data || !data.avatars || !Array.isArray(data.avatars)) {
        throw new Error("Invalid response format");
      }

      data.avatars.forEach((avatar) => {
        const div = document.createElement("div");
        div.className =
          "bg-gray-800 p-3 rounded-lg hover:bg-gray-700 transition-colors shadow-lg";
        div.innerHTML = `
          <button
            onclick="showAvatarDetails('${avatar._id}')"
            class="w-full text-left flex gap-3 items-center"
          >
            <img
              src="${avatar.thumbnailUrl || avatar.imageUrl}"
              alt="${avatar.name}"
              class="w-16 h-16 object-cover rounded-lg flex-shrink-0"
            >
            <div class="min-w-0 flex-1">
              <h3 class="text-sm font-semibold truncate">${avatar.name}</h3>
              <p class="text-xs text-gray-400">Score: ${avatar.score || 0}</p>
              <div class="flex items-center gap-2 mt-1">
                <span class="px-1.5 py-0.5 rounded text-xs font-bold ${getTierColor(
                  avatar.model,
                )}">
                  Tier ${getTierFromModel(avatar.model)}
                </span>
              </div>
            </div>
          </button>
        `;
        leaderboardItems.appendChild(div);
      });

      scrollState.cursor = data.nextCursor;
      scrollState.hasMore = data.hasMore;
    } catch (error) {
      console.error("Failed to load leaderboard items:", error);
    } finally {
      scrollState.loading = false;
      loader.classList.add("hidden");
    }
  }

  const observer = new IntersectionObserver(
    (entries) => {
      if (
        entries[0].isIntersecting &&
        !scrollState.loading &&
        scrollState.hasMore
      ) {
        loadMore();
      }
    },
    { threshold: 0.1, rootMargin: "100px" },
  );

  observer.observe(loader);

  // Initial load
  await loadMore();

  // Cleanup observer when the tab changes
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) observer.disconnect();
    else observer.observe(loader);
  });

  // Prevent reinitializing the observer on tab switches
  scrollState.initialized = true;
}
