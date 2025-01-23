// State management
const state = {
  wallet: null,
  activeTab: 'owned',
  avatars: [],
  loading: false
};

async function connectWallet() {
  try {
    const phantomProvider = window?.phantom?.solana;
    if (!phantomProvider) {
      alert('Please install Phantom wallet');
      return;
    }
    
    // Wait for provider to be ready
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const resp = await phantomProvider.connect();
    if (!resp?.publicKey) {
      throw new Error('No public key received');
    }
    
    state.wallet = {
      publicKey: resp.publicKey.toString()
    };
    await loadContent();
  } catch (err) {
    console.error('Failed to connect wallet:', err);
    alert('Failed to connect wallet. Please try again.');
    state.wallet = null;
  }
}

// DOM Elements
const content = document.getElementById('content');
const tabButtons = document.querySelectorAll('[data-tab]');

// Event Listeners
tabButtons.forEach(button => {
  button.addEventListener('click', () => {
    setActiveTab(button.dataset.tab);
  });
});

// Tab Management
function setActiveTab(tabName) {
  state.activeTab = tabName;

  // Update UI
  tabButtons.forEach(btn => {
    btn.classList.toggle('bg-blue-600', btn.dataset.tab === tabName);
    btn.classList.toggle('bg-gray-700', btn.dataset.tab !== tabName);
  });

  // Load content
  loadContent();
}

// Content Loading
async function loadContent() {
  content.innerHTML = '<div class="text-center py-12">Loading...</div>';
  state.loading = true;

  try {
    switch(state.activeTab) {
      case 'owned':
        if (!state.wallet) {
          content.innerHTML = `
            <div class="text-center py-12 col-span-3">
              <p class="mb-4">Connect your wallet to view owned avatars</p>
              <button class="px-4 py-2 bg-blue-600 rounded" onclick="connectWallet()">
                Connect Wallet
              </button>
            </div>`;
          break;
        }
        await loadOwnedAvatars();
        break;
      case 'actions':
        await loadActionLog();
        break;
      case 'leaderboard':
        await loadLeaderboard();
        break;
      case 'tribes':
        content.innerHTML = '<div class="text-center py-12">Tribes content coming soon</div>';
        break;
    }
  } catch (error) {
    console.error('Error loading content:', error);
    content.innerHTML = '<div class="text-center py-12 text-red-500">Error loading content</div>';
  } finally {
    state.loading = false;
  }
}

// Avatar Display
function renderAvatar(avatar) {
  return `
    <div class="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition">
      <img 
        src="${avatar.thumbnailUrl || avatar.imageUrl}" 
        alt="${avatar.name}"
        class="w-full aspect-square object-cover rounded-lg mb-4"
      >
      <h3 class="text-lg font-semibold">${avatar.name}</h3>
      ${avatar.model ? `<p class="text-sm text-gray-400">${avatar.model}</p>` : ''}
      <div class="mt-2">
        <span class="px-2 py-1 rounded text-xs font-bold ${getTierColor(avatar.model)}">
          Tier ${getTierFromModel(avatar.model)}
        </span>
      </div>
    </div>
  `;
}

// Utility Functions
function getTierColor(model) {
  const tier = getTierFromModel(model);
  const colors = {
    'S': 'bg-purple-600',
    'A': 'bg-blue-600',
    'B': 'bg-green-600',
    'C': 'bg-yellow-600',
    'U': 'bg-gray-600'
  };
  return colors[tier] || colors['U'];
}

function getTierFromModel(model) {
  if (!model) return 'U';
  if (model.includes('gpt-4')) return 'S';
  if (model.includes('gpt-3.5')) return 'A';
  if (model.includes('claude')) return 'B';
  return 'C';
}

// Data Loading Functions
async function loadOwnedAvatars() {
  try {
    if (!state.wallet?.publicKey) {
      content.innerHTML = '<div class="text-center py-12">Please connect your wallet first</div>';
      return;
    }

    const response = await fetch(`/api/avatars?view=owned&walletAddress=${state.wallet.publicKey}&page=1&limit=12`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    if (!data.avatars) {
      content.innerHTML = '<div class="text-center py-12">No avatars found</div>';
      return;
    }
    
    content.innerHTML = data.avatars.map(renderAvatar).join('');
  } catch (error) {
    console.error('Error loading owned avatars:', error);
    content.innerHTML = `<div class="text-center py-12 text-red-500">
      Failed to load avatars: ${error.message}
    </div>`;
  }
}

async function loadActionLog() {
  try {
    content.innerHTML = '<div class="text-center py-12">Loading action log...</div>';
    const response = await fetch('/api/dungeon/log');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const actions = await response.json();
    
    if (!actions?.length) {
      content.innerHTML = '<div class="text-center py-12">No actions found</div>';
      return;
    }
    
    content.innerHTML = actions.map(action => `
      <div class="bg-gray-800 p-4 mb-2 rounded-lg hover:bg-gray-700 transition-colors">
        <div class="flex items-center gap-4">
          ${action.actorThumbnailUrl ? `
            <img src="${action.actorThumbnailUrl}" alt="${action.actorName}" 
                 class="w-12 h-12 rounded-full">` : ''}
          <div class="flex-1">
            <div class="flex items-center justify-between">
              <div>
                <span class="font-semibold">${action.actorName}</span>
                <span class="text-gray-400">
                  ${action.action === 'attack' ? '⚔️ attacked' :
                    action.action === 'defend' ? '🛡️ defended' :
                    action.action === 'move' ? '🚶‍♂️ moved to' :
                    action.action === 'remember' ? '💭 remembered' :
                    action.action === 'xpost' ? '🐦 posted' :
                    `used ${action.action}`}
                </span>
                ${action.targetName ? `<span class="font-semibold"> → ${action.targetName}</span>` : ''}
              </div>
              <button 
                onclick="this.closest('.bg-gray-800').querySelector('.action-details').classList.toggle('hidden')"
                class="text-gray-400 hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            <div class="text-sm text-gray-500">
              ${new Date(action.timestamp).toLocaleString()}
            </div>
            <div class="action-details hidden mt-4 p-3 bg-gray-900 rounded-lg">
              ${['attack', 'defend'].includes(action.action) ? 
                `<div class="grid grid-cols-2 gap-4">
                  <div>
                    <h4 class="font-semibold mb-2">⚔️ Actor Stats</h4>
                    <div class="flex gap-4 mb-4">
                      <div class="text-center">
                        <div class="text-2xl font-bold text-red-500">${action.actorStats?.hp || 'N/A'}</div>`
                : ''}
                      <div class="text-xs text-gray-400">HP</div>
                    </div>
                    <div class="text-center">
                      <div class="text-2xl font-bold text-blue-500">${action.actorStats?.strength || 'N/A'}</div>
                      <div class="text-xs text-gray-400">STR</div>
                    </div>
                    <div class="text-center">
                      <div class="text-2xl font-bold text-green-500">${10 + Math.floor((action.actorStats?.dexterity - 10) / 2) || 'N/A'}</div>
                      <div class="text-xs text-gray-400">AC</div>
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-2 text-sm">
                    <p>DEX: ${action.actorStats?.dexterity || 'N/A'} (${Math.floor((action.actorStats?.dexterity - 10) / 2) || '0'})</p>
                    <p>CON: ${action.actorStats?.constitution || 'N/A'} (${Math.floor((action.actorStats?.constitution - 10) / 2) || '0'})</p>
                    <p>INT: ${action.actorStats?.intelligence || 'N/A'} (${Math.floor((action.actorStats?.intelligence - 10) / 2) || '0'})</p>
                    <p>WIS: ${action.actorStats?.wisdom || 'N/A'} (${Math.floor((action.actorStats?.wisdom - 10) / 2) || '0'})</p>
                    <p>CHA: ${action.actorStats?.charisma || 'N/A'} (${Math.floor((action.actorStats?.charisma - 10) / 2) || '0'})</p>
                  </div>
                </div>
                ${action.targetName ? `
                  <div>
                    <h4 class="font-semibold mb-2">Target Details</h4>
                    <div class="flex gap-4 mb-4">
                      <div class="text-center">
                        <div class="text-2xl font-bold text-red-500">${action.targetStats?.hp || 'N/A'}</div>
                        <div class="text-xs text-gray-400">HP</div>
                      </div>
                      <div class="text-center">
                        <div class="text-2xl font-bold text-blue-500">${action.targetStats?.strength || 'N/A'}</div>
                        <div class="text-xs text-gray-400">STR</div>
                      </div>
                      <div class="text-center">
                        <div class="text-2xl font-bold text-green-500">${10 + Math.floor((action.targetStats?.dexterity - 10) / 2) || 'N/A'}</div>
                        <div class="text-xs text-gray-400">AC</div>
                      </div>
                    </div>
                    <div class="grid grid-cols-2 gap-2 text-sm">
                      <p>DEX: ${action.targetStats?.dexterity || 'N/A'} (${Math.floor((action.targetStats?.dexterity - 10) / 2) || '0'})</p>
                      <p>CON: ${action.targetStats?.constitution || 'N/A'} (${Math.floor((action.targetStats?.constitution - 10) / 2) || '0'})</p>
                      <p>INT: ${action.targetStats?.intelligence || 'N/A'} (${Math.floor((action.targetStats?.intelligence - 10) / 2) || '0'})</p>
                      <p>WIS: ${action.targetStats?.wisdom || 'N/A'} (${Math.floor((action.targetStats?.wisdom - 10) / 2) || '0'})</p>
                      <p>CHA: ${action.targetStats?.charisma || 'N/A'} (${Math.floor((action.targetStats?.charisma - 10) / 2) || '0'})</p>
                    </div>
                  </div>
                ` : ''}
              </div>
              ${action.action === 'move' && action.targetImageUrl ? `
                <div class="mt-4">
                  <img src="${action.targetImageUrl}" alt="Location" class="w-full rounded-lg">
                </div>
              ` : ''}
              ${action.result ? `
                <div class="mt-4">
                  <h4 class="font-semibold mb-2">📝 Result</h4>
                  <p class="text-gray-300">${action.result}</p>
                </div>
              ` : ''}
              ${action.memory ? `
                <div class="mt-4">
                  <h4 class="font-semibold mb-2">Memory</h4>
                  <p class="text-gray-300">${action.memory}</p>
                </div>
              ` : ''}
              ${action.tweet ? `
                <div class="mt-4">
                  <h4 class="font-semibold mb-2">Posted to X</h4>
                  <p class="text-gray-300">${action.tweet}</p>
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Action log loading error:', error);
    content.innerHTML = `<div class="text-center py-12 text-red-500">
      Failed to load action log: ${error.message}
    </div>`;
  }
}

async function loadLeaderboard() {
  const response = await fetch('/api/leaderboard?page=1&limit=12');
  const data = await response.json();
  content.innerHTML = data.avatars.map(avatar => `
    <div class="bg-gray-800 p-4 rounded-lg flex items-center gap-4">
      <img
        src="${avatar.thumbnailUrl || avatar.imageUrl}"
        alt="${avatar.name}"
        class="w-16 h-16 object-cover rounded-full"
      >
      <div>
        <h3 class="text-lg font-semibold">${avatar.name}</h3>
        <p class="text-sm text-gray-400">Score: ${avatar.score}</p>
        ${avatar.model ? `<p class="text-xs text-gray-500">${avatar.model}</p>` : ''}
      </div>
    </div>
  `).join('');
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadContent();
});