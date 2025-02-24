
const { Moonshot, CurveType, Environment, MigrationDex, SolanaSerializationService } = MoonshotSDK;


(() => {
  // GLOBAL STATE
  const state = {
    wallet: null,
    activeTab: "squad",
    loading: false,
    socialSort: "new",
  };

  // DOM REFERENCES
  // DOM REFERENCES
const content = document.getElementById("content");
const tabButtons = document.querySelectorAll("[data-tab]");

  // HELPER FUNCTIONS
  const fetchJSON = async (url, options = {}) => {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  };

  const getModifier = (score) =>
    typeof score === "number" ? Math.floor((score - 10) / 2) : 0;

  const getTierFromModel = (model) => {
    if (!model) return "U";
    if (model.includes("gpt-4")) return "S";
    if (model.includes("gpt-3.5")) return "A";
    if (model.includes("claude")) return "B";
    return "C";
  };

  const getTierColor = (model) => {
    const tier = getTierFromModel(model);
    const colors = {
      S: "bg-purple-600",
      A: "bg-blue-600",
      B: "bg-green-600",
      C: "bg-yellow-600",
      U: "bg-gray-600",
    };
    return colors[tier] || colors.U;
  };

  const createModal = (title, message, isError = false) => {
    const modal = document.createElement("div");
    modal.className =
      "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4";
    modal.innerHTML = `
      <div class="bg-gray-800 p-6 rounded-lg max-w-md w-full">
        <h3 class="text-xl font-bold mb-4 ${isError ? "text-red-400" : "text-green-400"}">${title}</h3>
        <p class="mb-4 text-gray-300">${message}</p>
        <button onclick="this.closest('.fixed').remove()"
                class="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white">
          Close
        </button>
      </div>
    `;
    document.body.appendChild(modal);
  };

  // TAB HANDLING
  tabButtons.forEach((button) => {
    button.addEventListener("click", () => setActiveTab(button.dataset.tab));
  });

  const setActiveTab = async (tabName) => {
    state.activeTab = tabName;
    tabButtons.forEach((btn) => {
      btn.classList.toggle("bg-blue-600", btn.dataset.tab === tabName);
      btn.classList.toggle("bg-gray-700", btn.dataset.tab !== tabName);
    });
    await loadContent();
  };

  const connectWallet = async () => {
    try {
      const phantomProvider = window?.phantom?.solana;
      if (!phantomProvider) {
        alert("Please install the Phantom wallet extension.");
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
      const resp = await phantomProvider.connect();
      if (!resp?.publicKey)
        throw new Error("No public key received from Phantom.");
      state.wallet = { publicKey: resp.publicKey.toString() };

      // If the avatar modal is open, re-render its content using the stored avatarId.
      const avatarModal = document.getElementById("avatar-modal");
      if (
        avatarModal &&
        !avatarModal.classList.contains("hidden") &&
        avatarModal.dataset.avatarId
      ) {
        await showAvatarDetails(avatarModal.dataset.avatarId);
      } else {
        await loadContent();
      }
    } catch (err) {
      console.error("Failed to connect wallet:", err);
      alert("Failed to connect wallet. Please try again.");
      state.wallet = null;
    }
  };

  // MAIN CONTENT LOADING (PER TAB)
  const loadContent = async () => {
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
          content.innerHTML =
            '<div class="text-center py-12">Tribes content coming soon</div>';
          break;
        case "social":
          await loadSocialContent();
          break;
        case "world":
          await loadWorldContent();
          break;
        default:
          content.innerHTML = `<div class="text-center py-12 text-red-500">Unknown tab: ${state.activeTab}</div>`;
      }
    } catch (error) {
      console.error("Error loading content:", error);
      content.innerHTML = `<div class="text-center py-12 text-red-500">Error loading content: ${error.message}</div>`;
    } finally {
      state.loading = false;
    }
  };

  // AVATAR OPERATIONS
  const claimAvatar = async (avatarId) => {
    if (!state.wallet) {
      alert("Please connect your wallet first");
      return;
    }
    try {
      const { transaction } = await fetchJSON(
        `/api/burn-tx?walletAddress=${state.wallet.publicKey}`,
      );
      if (!transaction) throw new Error("Failed to create burn transaction");
      const signedTx = await window.phantom.solana.signTransaction(transaction);
      const connection = new solanaWeb3.Connection(
        process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com",
        "confirmed",
      );
      const burnTxSignature = await connection.sendRawTransaction(
        signedTx.serialize(),
      );
      await connection.confirmTransaction(burnTxSignature, "confirmed");
      const claimResponse = await fetchJSON(`/api/avatars/${avatarId}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: state.wallet.publicKey,
          burnTxSignature,
        }),
      });
      if (!claimResponse.ok)
        throw new Error(claimResponse.error || "Failed to claim avatar");
      await showAvatarDetails(avatarId);
      if (state.activeTab === "squad") await loadSquad();
    } catch (error) {
      console.error("Error claiming avatar:", error);
      alert(error.message);
    }
  };

  const createToken = async (avatarId) => {
    if (!state.wallet) {
      alert("Please connect your wallet first");
      return;
    }
    const button = document.querySelector(
      `button[onclick="createToken('${avatarId}')"]`,
    );
    const originalText = button.textContent;
    try {
      button.disabled = true;
      button.innerHTML = '<span class="animate-pulse">Creating token...</span>';
      
      // Get token metadata
      // Initialize Moonshot SDK
      const moonshot = new Moonshot({
        rpcUrl: process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com",
        environment: Environment.DEVNET,
        chainOptions: {
          solana: { confirmOptions: { commitment: 'confirmed' } },
        },
      });

      // Get token metadata first
      const tokenMetadata = await fetchJSON(`/api/tokens/metadata/${avatarId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: state.wallet.publicKey }),
      });

      if (!tokenMetadata.success) {
        throw new Error(tokenMetadata.error || "Failed to get token metadata");
      }

      // Prepare mint transaction
      const prepMint = await moonshot.prepareMintTx({
        creator: state.wallet.publicKey,
        name: tokenMetadata.name,
        symbol: tokenMetadata.symbol,
        description: tokenMetadata.description,
        icon: tokenMetadata.icon,
        banner: tokenMetadata.banner,
        curveType: CurveType.CONSTANT_PRODUCT_V1,
        migrationDex: MigrationDex.RAYDIUM,
        tokenAmount: '42000000000'
      });

      // Sign the transaction with Phantom
      const phantomProvider = window?.phantom?.solana;
      if (!phantomProvider) throw new Error("Phantom wallet not found");
      
      const deserializedTx = SolanaSerializationService.deserializeVersionedTransaction(prepMint.transaction);
      if (!deserializedTx) throw new Error("Failed to deserialize transaction");
      
      const signedTx = await phantomProvider.signTransaction(deserializedTx);
      const serializedTx = SolanaSerializationService.serializeVersionedTransaction(signedTx);
      
      // Submit the signed transaction
      const result = await moonshot.submitMintTx({
        tokenId: prepMint.tokenId, 
        token: prepMint.token,
        signedTransaction: serializedTx
      });

      // Update backend about the token
      await fetchJSON(`/api/tokens/record/${avatarId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          avatarId: data.avatarId,
          tokenId: prepMint.tokenId,
          mint: submitResult.mint
        }),
      });

      const tokenDetails = `
        <div class="space-y-2">
          <p class="text-lg">Token "${data.tokenParams.name}" (${data.tokenParams.symbol}) created successfully!</p>
          <p class="text-sm text-gray-400">Token ID: ${prepMint.tokenId}</p>
        </div>
      `;
      createModal("Token Created Successfully!", tokenDetails);
      
      // Update token status display
      const tokenStatus = document.getElementById('token-status');
      if (tokenStatus) {
        tokenStatus.innerHTML = `<div class="text-green-400">✓ Token Created: ${data.tokenParams.symbol}</div>`;
      }
    } catch (error) {
      console.error("Error creating token:", error);
      createModal(
        "Token Creation Failed",
        error.message ||
          "Failed to create token. Please ensure all required information is provided.",
        true,
      );
    } finally {
      button.disabled = false;
      button.textContent = originalText;
    }
  };

  const renderAvatar = (avatar) => {
    const { _id, claimed, imageUrl, name, description } = avatar;
    return claimed
      ? `
      <div class="p-4 bg-gray-800 rounded-lg">
        <img src="${imageUrl}" class="w-full rounded-lg mb-2" alt="${name}">
        <h3 class="text-lg font-bold mb-2 text-white">${name}</h3>
        <p class="mb-2 text-gray-300">${description || ""}</p>
        <div class="flex flex-col gap-2">
          <div class="text-green-400 text-center py-2 bg-green-400/10 rounded">Avatar Claimed</div>
          <button type="button" onclick="createToken('${_id}')" class="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded text-white">
            Create SPL Token
          </button>
          <button type="button" onclick="linkXAccount('${_id}')" class="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white">
            Link X Account
          </button>
        </div>
      </div>
    `
      : `
      <div class="p-4 bg-gray-800 rounded-lg">
        <img src="${imageUrl}" class="w-full rounded-lg mb-2" alt="${name}">
        <h3 class="text-lg font-bold mb-2 text-white">${name}</h3>
        <p class="mb-2 text-gray-300">${description || ""}</p>
        <button type="button" onclick="claimAvatar('${_id}');" class="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white">
          Claim with Wallet
        </button>
      </div>
    `;
  };

  const linkXAccount = async (avatarId) => {
    if (!state.wallet) {
      alert("Please connect your wallet first");
      return;
    }
    const challengeMessage = `Link X Account for avatar ${avatarId}`;
    const encodedMessage = new TextEncoder().encode(challengeMessage);
    const phantomProvider = window?.phantom?.solana;
    if (!phantomProvider) {
      alert("Please install the Phantom wallet extension.");
      return;
    }
    let signedMessage;
    try {
      const signatureResponse = await phantomProvider.signMessage(
        encodedMessage,
        "utf8",
      );
      signedMessage = btoa(
        String.fromCharCode(...new Uint8Array(signatureResponse.signature)),
      );
    } catch (error) {
      console.error("Failed to sign message:", error);
      alert("Failed to sign message.");
      return;
    }
    try {
      const { url } = await fetchJSON(
        `/api/xauth/auth-url?avatarId=${avatarId}&walletAddress=${state.wallet.publicKey}&signature=${encodeURIComponent(signedMessage)}`,
      );
      const popup = window.open(url, "Link X Account", "width=600,height=600");
      window.addEventListener("message", async (event) => {
        if (event.data.type === "X_AUTH_SUCCESS") {
          popup.close();
          await loadContent();
          alert("X Account linked successfully!");
        }
      });
    } catch (error) {
      console.error("Error linking X account:", error);
      alert(error.message);
    }
  };

  // LOADERS PER TAB
  const loadSquad = async () => {
    if (!state.wallet) {
      content.innerHTML = `
        <div class="text-center py-12">
          <h2 class="text-3xl font-bold mb-6 text-white">Your Squad</h2>
          <p class="text-gray-400 mb-8">Connect your Phantom wallet to view your claimed avatars</p>
          <button onclick="connectWallet()" 
                  class="mx-auto flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-full shadow-lg transition transform hover:scale-105">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v16h16V4H4z"/>
            </svg>
            <span class="text-white font-semibold text-lg">Connect Phantom Wallet</span>
          </button>
        </div>
      `;
      return;
    }

    // Only initialize if the container does not exist
    let squadContainer = document.getElementById("squad-items");
    if (!squadContainer) {
      window.scrollState = { page: 1, loading: false, hasMore: true };
      content.innerHTML = `
        <div class="max-w-7xl mx-auto px-4" id="squad-container">
          <div id="squad-items" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-3"></div>
          <div id="squad-loader" class="text-center py-8 hidden">Loading more...</div>
          <div id="avatar-modal" class="fixed inset-0 bg-black bg-opacity-75 hidden flex items-center justify-center p-4">
            <div class="bg-parchment rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div id="modal-content" class="p-6"></div>
            </div>
          </div>
        </div>
      `;
      squadContainer = document.getElementById("squad-items");
    }

    const loader = document.getElementById("squad-loader");

    const loadMore = async () => {
      const scrollState = window.scrollState;
      if (scrollState.loading || !scrollState.hasMore) return;
      scrollState.loading = true;
      loader.classList.remove("hidden");
      try {
        const data = await fetchJSON(
          `/api/avatars?view=owned&walletAddress=${state.wallet.publicKey}&page=${scrollState.page}&limit=12`,
        );
        if (!data || !data.avatars || !Array.isArray(data.avatars))
          throw new Error("Invalid response format");

        // Update hasMore based on totalPages (if provided) or items length.
        scrollState.hasMore = data.totalPages
          ? scrollState.page < data.totalPages
          : data.avatars.length === 12;

        data.avatars.forEach((avatar) => {
          const div = document.createElement("div");
          div.className =
            "bg-gray-800 p-3 rounded-lg hover:bg-gray-700 transition-colors shadow-lg";
          div.innerHTML = renderAvatar(avatar);
          squadContainer.appendChild(div);
        });
        window.scrollState.page++;
      } catch (error) {
        console.error("Failed to load more squad items:", error);
        const errorDiv = document.createElement("div");
        errorDiv.className =
          "text-red-500 text-center py-4 error-message col-span-full";
        errorDiv.innerHTML = `
          ${error.message || "Failed to load more items"}
          <button class="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onclick="retrySquadLoad(window.scrollState.page)">
            Retry
          </button>
        `;
        squadContainer.appendChild(errorDiv);
      } finally {
        window.scrollState.loading = false;
        if (!window.scrollState.hasMore) loader.classList.add("hidden");
      }
    };

    // First load only appends to the container
    await loadMore();

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !window.scrollState.loading &&
          window.scrollState.hasMore
        ) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: "100px" },
    );
    observer.observe(loader);
  };
  const loadActionLog = async () => {
    try {
      const actions = await fetchJSON("/api/dungeon/log");
      if (!actions || !Array.isArray(actions) || actions.length === 0) {
        content.innerHTML =
          '<div class="text-center py-12">No actions found</div>';
        return;
      }
      content.innerHTML = actions
        .map((action) => {
          const resultText = action.result
            ? action.result.replace(/^✨ Posted to X and feed:\s*/, "")
            : "";
          const memoryText = action.memory
            ? action.memory.replace(
                /\[🧠 Memory generated:\s*"(.*?)"\]$/s,
                "$1",
              )
            : "";
          const isPostAction =
            action.action === "xpost" || action.action === "post";
          const headingForResult = isPostAction ? "Post Content" : "Result";
          const showMemory = memoryText && memoryText !== resultText;
          return `
            <div class="bg-gray-800 p-4 mb-2 rounded-lg hover:bg-gray-700 transition-colors">
              <div class="flex flex-col sm:flex-row items-center gap-4">
                ${action.actorThumbnailUrl ? `<img src="${action.actorThumbnailUrl}" alt="${action.actorName}" class="w-12 h-12 rounded-full">` : ""}
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
                      ${["attack", "move"].includes(action.action) && action.targetName ? `<span class="font-semibold"> → ${action.targetName}</span>` : ""}
                    </div>
                    <button onclick="this.closest('.bg-gray-800').querySelector('.action-details').classList.toggle('hidden')"
                            class="text-gray-400 hover:text-white transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
                      </svg>
                    </button>
                  </div>
                  <div class="text-sm text-gray-500">${new Date(action.timestamp).toLocaleString()}</div>
                  <div class="action-details hidden mt-4 p-3 bg-gray-900 rounded-lg">
                    ${
                      ["attack", "defend"].includes(action.action)
                        ? `
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                          ${renderStats(action.actorStats, "⚔️ Actor Stats")}
                          ${action.targetName ? renderStats(action.targetStats, "Target Details") : ""}
                        </div>
                      `
                        : ""
                    }
                    ${
                      (action.action === "move" && action.targetImageUrl) ||
                      (action.location && action.location.imageUrl)
                        ? `
                        <div class="mt-4">
                          <h4 class="font-semibold mb-2">${action.location?.name || "Location"}</h4>
                          <img src="${action.location?.imageUrl || action.targetImageUrl}" alt="${action.location?.name || "Location"}" class="w-full h-48 object-cover rounded-lg">
                          ${action.location?.description ? `<p class="mt-2 text-sm text-gray-400">${action.location.description}</p>` : ""}
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
      content.innerHTML = `<div class="text-center py-12 text-red-500">Failed to load action log: ${error.message}</div>`;
    }
  };

  const loadLeaderboard = async () => {
    window.scrollState = window.scrollState || {
      page: 1,
      loading: false,
      hasMore: true,
    };
    content.innerHTML = `
      <div class="max-w-7xl mx-auto px-4">
        <div id="leaderboard-items" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-3"></div>
        <div id="leaderboard-loader" class="text-center py-8 hidden">Loading more...</div>
        <div id="avatar-modal" class="fixed inset-0 bg-black bg-opacity-75 hidden flex items-center justify-center p-4">
          <div class="bg-parchment rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div id="modal-content" class="p-6"></div>
          </div>
        </div>
      </div>
    `;
    const leaderboardItems = document.getElementById("leaderboard-items");
    const loader = document.getElementById("leaderboard-loader");

    const loadMore = async () => {
      const scrollState = window.scrollState;
      if (scrollState.loading || !scrollState.hasMore) return;
      scrollState.loading = true;
      loader.classList.remove("hidden");
      try {
        const data = await fetchJSON(
          `/api/leaderboard?page=${scrollState.page}&limit=12`,
        );
        if (!data || !data.avatars || !Array.isArray(data.avatars))
          throw new Error("Invalid response format");
        scrollState.hasMore = data.totalPages
          ? scrollState.page < data.totalPages
          : data.avatars.length === 12;
        data.avatars.forEach((avatar) => {
          const div = document.createElement("div");
          div.className =
            "bg-gray-800 p-3 rounded-lg hover:bg-gray-700 transition-colors shadow-lg";
          div.innerHTML = `
            <button onclick="showAvatarDetails('${avatar._id}')" class="w-full text-left flex gap-3 items-center">
              <img src="${avatar.thumbnailUrl || avatar.imageUrl}" alt="${avatar.name}" class="w-16 h-16 object-cover rounded-lg flex-shrink-0">
              <div class="min-w-0 flex-1">
                <h3 class="text-sm font-semibold truncate">${avatar.name}</h3>
                <p class="text-xs text-gray-400">Score: ${avatar.score || 0}</p>
                <div class="flex items-center gap-2 mt-1">
                  <span class="px-1.5 py-0.5 rounded text-xs font-bold ${getTierColor(avatar.model)}">
                    Tier ${getTierFromModel(avatar.model)}
                  </span>
                </div>
              </div>
            </button>
          `;
          leaderboardItems.appendChild(div);
        });
        window.scrollState.page++;
      } catch (error) {
        console.error("Failed to load more leaderboard items:", error);
        const errorDiv = document.createElement("div");
        errorDiv.className =
          "text-red-500 text-center py-4 error-message col-span-full";
        errorDiv.innerHTML = `
          ${error.message || "Failed to load more items"}
          <button class="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" onclick="retryLeaderboardLoad(window.scrollState.page)">
            Retry
          </button>
        `;
        leaderboardItems.appendChild(errorDiv);
      } finally {
        window.scrollState.loading = false;
        if (!window.scrollState.hasMore) loader.classList.add("hidden");
      }
    };

    await loadMore();
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !window.scrollState.loading &&
          window.scrollState.hasMore
        ) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: "100px" },
    );
    observer.observe(loader);
  };

  window.retryLeaderboardLoad = (page) => {
    const leaderboardItems = document.getElementById("leaderboard-items");
    const errorDiv = leaderboardItems.querySelector(".text-red-500");
    if (errorDiv) errorDiv.remove();
    loadLeaderboard();
  };

  window.retrySquadLoad = (page) => {
    const squadItems = document.getElementById("squad-items");
    const errorDiv = squadItems.querySelector(".error-message");
    if (errorDiv) errorDiv.remove();
    loadSquad();
  };
  const showAvatarDetails = async (avatarId) => {
    const modal = document.getElementById("avatar-modal");
    modal.dataset.avatarId = avatarId;
    const modalContent = document.getElementById("modal-content");
    modal.classList.remove("hidden");
    modalContent.innerHTML = "Loading...";
    try {
      const [
        avatarResponse,
        narrativesResponse,
        actionsResponse,
        statsResponse,
      ] = await Promise.all([
        fetchJSON(
          `/api/avatars/${avatarId}?walletAddress=${state.wallet ? state.wallet.publicKey : ""}`,
        ),
        fetchJSON(`/api/avatars/${avatarId}/narratives`),
        fetchJSON(`/api/avatars/${avatarId}/dungeon-actions`),
        fetchJSON(`/api/avatars/${avatarId}/stats`),
      ]);
      avatarResponse.stats = statsResponse;
      avatarResponse.narratives = narrativesResponse?.narratives || [];
      avatarResponse.actions = actionsResponse?.actions || [];
      const claimed = avatarResponse.claimed;
      modalContent.innerHTML = `
        <div class="flex flex-col items-center relative bg-parchment text-gray-900">
          <div class="w-full p-6 bg-gray-800 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="flex items-center gap-4">
              <img src="${avatarResponse.imageUrl}" alt="${avatarResponse.name}" class="w-32 h-32 object-cover rounded-full border-4 border-gray-600">
              <div>
                <h1 class="text-3xl font-bold mb-1">${avatarResponse.name}</h1>
                <div class="flex items-center gap-2">
                  <span class="px-2 py-1 rounded text-xs font-bold ${getTierColor(avatarResponse.model)}">
                    Tier ${getTierFromModel(avatarResponse.model)}
                  </span>
                </div>
              </div>
            </div>
            <div class="flex-shrink-0">
              ${
                !state.wallet
                  ? `<button onclick="connectWallet()" type="button" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors text-sm">
                        Connect Wallet
                     </button>`
                  : !claimed
                    ? `<button onclick="claimAvatar('${avatarId}')" type="button" class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors text-sm">
                          Claim Avatar
                       </button>`
                    : `<div class="flex flex-col gap-2">
                          <button onclick="createToken('${avatarId}')" type="button" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors text-sm">
                            Create SPL Token
                          </button>
                          <button onclick="linkXAccount('${avatarId}')" type="button" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors text-sm">
                            Link X Account
                          </button>
                       </div>`
              }
            </div>
        <div id="token-status" class="mt-4 text-sm text-gray-300"></div>
          </div>
          <div class="absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold ${getTierColor(avatarResponse.model)}">
            Tier ${getTierFromModel(avatarResponse.model)}
          </div>
          <h1 class="text-2xl font-bold mt-4">${avatarResponse.name}</h1>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mb-4 mt-4 px-4">
            <div class="bg-gray-100 p-4 rounded-lg text-gray-900">
              <h3 class="text-lg font-bold mb-2">Class & Level</h3>
              <p class="text-gray-700">Adventurer 1</p>
              <p class="text-sm text-gray-600 mb-3">XP: 0 / 1000</p>
              <div class="grid grid-cols-3 gap-2">
                <div class="text-center">
                  <div class="text-red-500 font-bold">❤️ ${avatarResponse.stats?.hp || 0}</div>
                  <div class="text-xs text-gray-600">HP</div>
                </div>
                <div class="text-center">
                  <div class="text-blue-500 font-bold">🛡️ ${10 + getModifier(avatarResponse.stats?.dexterity || 10)}</div>
                  <div class="text-xs text-gray-600">AC</div>
                </div>
                <div class="text-center">
                  <div class="text-purple-500 font-bold">⚡ ${getModifier(avatarResponse.stats?.dexterity || 10)}</div>
                  <div class="text-xs text-gray-600">Initiative</div>
                </div>
              </div>
            </div>
            <div class="bg-gray-100 p-4 rounded-lg text-gray-900">
              <h3 class="text-lg font-bold mb-2">Ability Scores</h3>
              <div class="grid grid-cols-2 gap-2 text-sm">
                <div class="flex items-center gap-2"><span>💪</span><span class="text-gray-700">STR: ${avatarResponse.stats?.strength || 10}</span></div>
                <div class="flex items-center gap-2"><span>🎯</span><span class="text-gray-700">DEX: ${avatarResponse.stats?.dexterity || 10}</span></div>
                <div class="flex items-center gap-2"><span>🏋️</span><span class="text-gray-700">CON: ${avatarResponse.stats?.constitution || 10}</span></div>
                <div class="flex items-center gap-2"><span>🧠</span><span class="text-gray-700">INT: ${avatarResponse.stats?.intelligence || 10}</span></div>
                <div class="flex items-center gap-2"><span>👁️</span><span class="text-gray-700">WIS: ${avatarResponse.stats?.wisdom || 10}</span></div>
                <div class="flex items-center gap-2"><span>👑</span><span class="text-gray-700">CHA: ${avatarResponse.stats?.charisma || 10}</span></div>
              </div>
            </div>
            <div class="bg-gray-100 p-4 rounded-lg text-gray-900">
              <h3 class="text-lg font-bold mb-2">Equipment</h3>
              <p class="text-gray-700">No weapon equipped</p>
              <p class="text-gray-700">No armor equipped</p>
              <p class="text-gray-700">No accessories</p>
            </div>
            <div class="bg-gray-100 p-4 rounded-lg text-gray-900">
              <h3 class="text-lg font-bold mb-2">📦 Inventory</h3>
              ${
                avatarResponse.inventory && avatarResponse.inventory.length
                  ? `<div class="grid grid-cols-3 gap-2">
                     ${avatarResponse.inventory
                       .map(
                         (item) => `
                       <div class="flex flex-col items-center">
                         <img src="${item.thumbnailUrl || item.imageUrl}" alt="${item.name}" class="w-16 h-16 object-cover rounded">
                         <span class="text-xs mt-1">${item.name}</span>
                       </div>
                     `,
                       )
                       .join("")}
                   </div>`
                  : `<p class="text-gray-700">No items yet</p>`
              }
            </div>
          </div>
          <div class="mt-4 space-y-4 w-full px-4 mb-8">
            <div class="bg-white/10 p-4 rounded-lg">
              <h3 class="font-bold text-lg mb-2">Description</h3>
              <p class="text-gray-300">${avatarResponse.description || "No description available."}</p>
            </div>
            <div class="bg-white/10 p-4 rounded-lg">
              <h3 class="font-bold text-lg mb-2">Personality</h3>
              <p class="text-gray-300">${avatarResponse.personality || "Mysterious and undefined."}</p>
            </div>
            <div class="bg-white/10 p-4 rounded-lg">
              <h3 class="font-bold text-lg mb-2">Recent Narrative</h3>
              <p class="text-gray-300">${avatarResponse.narratives?.[0]?.content || "No recent narratives."}</p>
            </div>
            <div class="bg-white/10 p-4 rounded-lg">
              <h3 class="font-bold text-lg mb-2">Recent Actions</h3>
              <div class="space-y-2">
                ${
                  avatarResponse.actions && avatarResponse.actions.length
                    ? avatarResponse.actions
                        .slice(0, 3)
                        .map(
                          (action) => `
                      <div class="text-sm text-gray-300">
                        ${action.action === "attack" ? "⚔️" : action.action === "defend" ? "🛡️" : action.action === "move" ? "🚶" : action.action === "remember" ? "💭" : "❓"}
                        ${action.description || action.action}
                      </div>
                    `,
                        )
                        .join("")
                    : `<div class="text-gray-500 text-sm">No recent actions recorded.</div>`
                }
              </div>
            </div>
          </div>
        </div>
        <button onclick="closeAvatarModal()" class="absolute top-4 right-4 text-gray-400 hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none"
               viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      `;
    } catch (error) {
      console.error("Error loading avatar details:", error);
      modalContent.innerHTML = `
        <div class="text-center py-8">
          <div class="text-red-500 font-semibold mb-4">
            Error loading avatar details: ${error.message || "Unknown error occurred"}
          </div>
          <button onclick="closeAvatarModal()" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded transition-colors">
            Close
          </button>
        </div>
      `;
    }
  };

  window.closeAvatarModal = () => {
    document.getElementById("avatar-modal").classList.add("hidden");
  };

  // Close modal on backdrop click
  document.addEventListener("click", (e) => {
    const modal = document.getElementById("avatar-modal");
    if (e.target === modal) closeAvatarModal();
  });

  const loadSocialContent = async () => {
    try {
      const posts = await fetchJSON(
        `/api/social/posts?sort=${state.socialSort}`,
      );
      content.innerHTML = `
        <div class="max-w-6xl mx-auto px-4">
          <div class="flex flex-col md:flex-row justify-between items-center mb-6 bg-gray-800/50 p-6 rounded-xl">
            <div>
              <h2 class="text-4xl font-bold mb-2 text-white flex items-center gap-2">
                <span>📱</span> Social Feed
              </h2>
              <p class="text-gray-300 text-lg">Latest posts from the dungeon</p>
            </div>
            <div class="flex flex-col items-end gap-3 mt-4 md:mt-0">
              <h3 class="font-medium text-gray-300 text-lg">Sort by</h3>
              <div class="flex gap-2">
                <button onclick="setSocialSort('new')"
                        class="${state.socialSort === "new" ? "bg-blue-600 ring-2 ring-blue-400" : "bg-gray-700"} px-6 py-2.5 rounded-lg hover:bg-blue-500 transition-all font-medium">
                  ⏰ Latest
                </button>
                <button onclick="setSocialSort('top')"
                        class="${state.socialSort === "top" ? "bg-blue-600 ring-2 ring-blue-400" : "bg-gray-700"} px-6 py-2.5 rounded-lg hover:bg-blue-500 transition-all font-medium">
                  🔥 Top
                </button>
              </div>
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            ${posts
              .map(
                (post) => `
              <div class="bg-gray-800/90 backdrop-blur rounded-lg p-6 hover:bg-gray-700/90 transition-all duration-200 border border-gray-700/50 shadow-lg">
                <div class="flex flex-col sm:flex-row items-center gap-3 mb-3">
                  <img src="${post.avatar.thumbnailUrl || post.avatar.imageUrl}" class="w-12 h-12 rounded-full border-2 border-gray-600 shadow-md hover:border-blue-400 transition-colors" alt="${post.avatar.name}">
                  <div>
                    <div class="font-bold text-xl text-white">${post.avatar.name}</div>
                    <div class="text-sm text-gray-400 mt-0.5">
                      ${new Date(post.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
                <p class="mb-4 text-lg text-gray-100 whitespace-pre-wrap break-words leading-relaxed">
                  ${post.content}
                </p>
                <div class="flex gap-2 mb-4">
                  <span class="inline-flex items-center gap-1.5 text-green-400 text-sm bg-green-500/10 px-3 py-1 rounded-full">
                    <span class="text-xs">📱</span> Local Feed
                  </span>
                  ${
                    post.postedToX
                      ? `
                    <span class="inline-flex items-center gap-1.5 text-blue-400 text-sm bg-blue-500/10 px-3 py-1 rounded-full">
                      <span class="text-xs">🐦</span> Posted to X
                    </span>
                  `
                      : ""
                  }
                </div>
                <div class="flex flex-col sm:flex-row gap-4 mt-2 text-sm text-gray-300 border-t border-gray-700/50 pt-4">
                  <button onclick="likePost('${post._id}')"
                          class="flex items-center gap-2 hover:text-red-400 px-4 py-2 rounded-lg transition-all ${post.likedBy?.includes(state.wallet?.publicKey) ? "bg-red-500/10 text-red-400" : ""} hover:bg-red-500/10">
                    <span class="text-xl">
                      ${post.likedBy?.includes(state.wallet?.publicKey) ? "❤️" : "🤍"}
                    </span>
                    <span>${post.likes || 0}</span>
                  </button>
                  <button onclick="repostPost('${post._id}')"
                          class="flex items-center gap-2 hover:text-green-400 px-4 py-2 rounded-lg transition-all ${post.repostedBy?.includes(state.wallet?.publicKey) ? "bg-green-500/10 text-green-400" : ""} hover:bg-green-500/10">
                    <span class="text-xl">
                      ${post.repostedBy?.includes(state.wallet?.publicKey) ? "🔁" : "↻"}
                    </span>
                    <span>${post.reposts || 0}</span>
                  </button>
                  <span class="flex items-center gap-2 text-gray-500 sm:ml-auto">
                    <span>🕒</span>${new Date(post.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            `,
              )
              .join("")}
          </div>
        </div>
      `;
    } catch (error) {
      console.error("Error loading social content:", error);
      content.innerHTML = `<div class="text-center py-12 text-red-500">Failed to load social content: ${error.message}</div>`;
    }
  };

  const setSocialSort = async (sort) => {
    state.socialSort = sort;
    await loadSocialContent();
  };

  const likePost = async (postId) => {
    if (!state.wallet) {
      alert("Please connect your wallet first");
      return;
    }
    await fetchJSON(`/api/social/posts/${postId}/like`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ walletAddress: state.wallet.publicKey }),
    });
    await loadSocialContent();
  };

  const repostPost = async (postId) => {
    if (!state.wallet) {
      alert("Please connect your wallet first");
      return;
    }
    await fetchJSON(`/api/social/posts/${postId}/repost`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ walletAddress: state.wallet.publicKey }),
    });
    await loadSocialContent();
  };

  const loadWorldContent = async () => {
    try {
      const page = window.worldState ? window.worldState.page || 1 : 1;
      const { locations, totalPages, hasMore } = await fetchJSON(
        `/api/dungeon/locations?page=${page}&limit=12`,
      );
      if (page === 1) {
        content.innerHTML = `
          <div class="max-w-7xl mx-auto px-4">
            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" id="locations-grid"></div>
            <div id="world-loader" class="text-center py-8 hidden">Loading more locations...</div>
          </div>
        `;
      }
      const locationsGrid = document.getElementById("locations-grid");
      const loader = document.getElementById("world-loader");

      locations.forEach((location) => {
        const locationCard = document.createElement("div");
        locationCard.className =
          "bg-gray-800 rounded-lg overflow-hidden shadow-lg";
        const imageHtml = location.imageUrl
          ? `<img src="${location.imageUrl}" alt="${location.name}" class="w-full h-48 object-cover">`
          : `<div class="w-full h-48 bg-gray-700 flex items-center justify-center"><span class="text-4xl">🗺️</span></div>`;
        const avatarsHtml =
          location.avatars && location.avatars.length
            ? location.avatars
                .map(
                  (avatar) => `
              <div class="relative group">
                <img src="${avatar.thumbnailUrl || avatar.imageUrl}" alt="${avatar.name}" class="w-10 h-10 rounded-full border-2 border-gray-700 hover:border-blue-500 transition-colors">
                <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  ${avatar.name}
                </div>
              </div>
            `,
                )
                .join("")
            : `<span class="text-gray-500 text-sm">No avatars present</span>`;
        const itemsHtml =
          location.items && location.items.length
            ? location.items
                .map(
                  (item) => `
              <div class="relative group">
                <img src="${item.imageUrl}" alt="${item.name}" class="w-12 h-12 rounded-lg border-2 border-gray-700 hover:border-blue-500 transition-colors object-cover">
                <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  ${item.name}
                </div>
              </div>
            `,
                )
                .join("")
            : `<span class="text-gray-500 text-sm">No items present</span>`;

        locationCard.innerHTML = `
          <div class="relative">
            ${imageHtml}
            <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 p-4">
              <h3 class="text-xl font-bold text-white">${location.name}</h3>
            </div>
          </div>
          <div class="p-4">
            <p class="text-gray-300 mb-4">${location.description || "No description available."}</p>
            <div class="mb-4">
              <h4 class="text-sm font-semibold text-gray-400 uppercase mb-2">Avatars Present</h4>
              <div class="flex flex-wrap gap-2">${avatarsHtml}</div>
            </div>
            <div>
              <h4 class="text-sm font-semibold text-gray-400 uppercase mb-2">Items</h4>
              <div class="grid grid-cols-4 gap-2">${itemsHtml}</div>
            </div>
          </div>
        `;
        locationsGrid.appendChild(locationCard);
      });

      if (hasMore) {
        const observer = new IntersectionObserver(
          (entries) => {
            if (entries[0].isIntersecting && !window.worldState?.loading) {
              window.worldState = { page: page + 1, loading: true };
              loadWorldContent();
            }
          },
          { threshold: 0.1 },
        );
        if (loader) {
          loader.classList.remove("hidden");
          observer.observe(loader);
        }
      } else if (loader) {
        loader.classList.add("hidden");
      }
      window.worldState = { page, loading: false };
    } catch (error) {
      console.error("Error loading world content:", error);
      content.innerHTML = `<div class="text-center py-12 text-red-500">Failed to load world content: ${error.message}</div>`;
    }
  };

  // INITIALIZE
  document.addEventListener("DOMContentLoaded", loadContent);

  // Expose functions to the global scope
  window.connectWallet = connectWallet;
  window.claimAvatar = claimAvatar;
  window.createToken = createToken;
  window.linkXAccount = linkXAccount;
  window.showAvatarDetails = showAvatarDetails;
  window.loadContent = loadContent;
  window.loadSquad = loadSquad;
  window.loadActionLog = loadActionLog;
  window.loadLeaderboard = loadLeaderboard;
  window.loadSocialContent = loadSocialContent;
  window.setSocialSort = setSocialSort;
  window.likePost = likePost;
  window.repostPost = repostPost;
  window.loadWorldContent = loadWorldContent;
})();
