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
    const resp = await phantomProvider.connect();
    state.wallet = {
      publicKey: resp.publicKey.toString()
    };
    loadContent();
  } catch (err) {
    console.error('Failed to connect wallet:', err);
    alert('Failed to connect wallet');
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
      case 'gallery':
        await loadGallery();
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
  const response = await fetch(`/api/avatars/owned/${state.wallet.publicKey}?page=1&limit=12`);
  const data = await response.json();
  content.innerHTML = data.avatars.map(renderAvatar).join('');
}

async function loadGallery() {
  try {
    const response = await fetch('/api/avatars/gallery?page=1&limit=12');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to load gallery');
    }
    content.innerHTML = (data.avatars || []).map(renderAvatar).join('') || 'No avatars found';
  } catch (error) {
    console.error('Gallery loading error:', error);
    content.innerHTML = '<div class="text-center py-12 text-red-500">Failed to load gallery</div>';
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