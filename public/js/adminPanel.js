// Admin Panel Module
const AdminPanel = (() => {
  // DOM elements
  const adminBtn = document.getElementById('admin-button');
  const adminModal = document.getElementById('admin-modal');
  const adminContent = adminModal ? document.getElementById('admin-content') : null;
  const closeAdminBtn = document.createElement('button');

  // State
  let isInitialized = false;

  // Initialize the admin panel
  function init() {
    if (isInitialized) return;

    if (!adminModal || !adminBtn) {
      console.warn('Admin panel elements not found. Initialization skipped.');
      return;
    }

    setupEventListeners();
    createCloseButton();
    isInitialized = true;
  }

  // Set up event listeners
  function setupEventListeners() {
    if (adminBtn) {
      adminBtn.addEventListener('click', toggleAdminPanel);
    }

    // Close modal when clicking outside content
    if (adminModal) {
      adminModal.addEventListener('click', (e) => {
        if (e.target === adminModal) {
          hideAdminPanel();
        }
      });
    }

    // Keyboard shortcut (Escape)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && adminModal && adminModal.classList.contains('flex')) {
        hideAdminPanel();
      }
    });
  }

  // Create close button
  function createCloseButton() {
    closeAdminBtn.classList.add('absolute', 'top-4', 'right-4', 'text-gray-400', 'hover:text-white', 'p-2');
    closeAdminBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    `;
    closeAdminBtn.addEventListener('click', hideAdminPanel);
  }

  // Toggle admin panel visibility
  function toggleAdminPanel() {
    if (!adminModal) return;

    if (adminModal.classList.contains('hidden')) {
      showAdminPanel();
    } else {
      hideAdminPanel();
    }
  }

  // Show admin panel
  function showAdminPanel() {
    if (!adminModal || !adminContent) return;

    adminModal.classList.remove('hidden');
    adminModal.classList.add('flex');
    document.body.classList.add('overflow-hidden');

    // Add close button to admin panel
    const headerDiv = adminContent.querySelector('.admin-header') || document.createElement('div');
    if (!headerDiv.classList.contains('admin-header')) {
      headerDiv.classList.add('admin-header', 'relative');
      adminContent.prepend(headerDiv);
    }
    headerDiv.appendChild(closeAdminBtn);

    // Load admin panel content
    loadAdminContent();
  }

  // Hide admin panel
  function hideAdminPanel() {
    if (!adminModal) return;

    adminModal.classList.remove('flex');
    adminModal.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
  }

  // Load admin panel content
  function loadAdminContent() {
    if (!adminContent) return;

    adminContent.innerHTML = `
      <div class="admin-header relative p-4 border-b border-surface-700 flex justify-between items-center">
        <h2 class="text-xl font-semibold text-white">Admin Panel</h2>
      </div>

      <div class="p-6 space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Avatar Management -->
          <div class="bg-surface-800 rounded-lg p-4 shadow">
            <h3 class="text-lg font-medium mb-4">Avatar Management</h3>
            <div class="grid grid-cols-2 gap-3 mb-4">
              <div class="bg-surface-800 p-3 rounded">
                <p class="text-gray-400 text-sm">Total Avatars</p>
                <p class="text-xl font-semibold" id="avatar-count">Loading...</p>
              </div>
              <div class="bg-surface-800 p-3 rounded">
                <p class="text-gray-400 text-sm">Active Avatars</p>
                <p class="text-xl font-semibold">-</p>
              </div>
            </div>
            <button id="create-avatar-btn" class="bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded">
              Create New Avatar
            </button>
          </div>

          <!-- System Stats -->
          <div class="bg-surface-800 rounded-lg p-4 shadow">
            <h3 class="text-lg font-medium mb-4">System Stats</h3>
            <div class="grid grid-cols-2 gap-3">
              <div class="bg-surface-800 p-3 rounded">
                <p class="text-gray-400 text-sm">Total Items</p>
                <p class="text-xl font-semibold" id="item-count">Loading...</p>
              </div>
              <div class="bg-surface-800 p-3 rounded">
                <p class="text-gray-400 text-sm">Total Locations</p>
                <p class="text-xl font-semibold" id="location-count">Loading...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Add the close button back to the header
    const headerDiv = adminContent.querySelector('.admin-header');
    if (headerDiv) {
      headerDiv.appendChild(closeAdminBtn);
    }

    // Load system stats
    loadSystemStats();

    // Set up buttons
    setupAdminButtons();
  }

  // Load system statistics
  function loadSystemStats() {
    // Fetch avatar count
    fetch('/api/avatars?limit=1')
      .then(res => res.json())
      .then(data => {
        const avatarCount = document.getElementById('avatar-count');
        if (avatarCount) {
          avatarCount.textContent = data.total || 0;
        }
      })
      .catch(err => {
        const avatarCount = document.getElementById('avatar-count');
        if (avatarCount) {
          avatarCount.textContent = 'Error';
        }
        console.error('Error fetching avatar count:', err);
      });

    // Fetch item count
    fetch('/api/items?limit=1')
      .then(res => res.json())
      .then(data => {
        const itemCount = document.getElementById('item-count');
        if (itemCount) {
          itemCount.textContent = data.total || 0;
        }
      })
      .catch(err => {
        const itemCount = document.getElementById('item-count');
        if (itemCount) {
          itemCount.textContent = 'Error';
        }
        console.error('Error fetching item count:', err);
      });

    // Fetch location count
    fetch('/api/locations?limit=1')
      .then(res => res.json())
      .then(data => {
        const locationCount = document.getElementById('location-count');
        if (locationCount) {
          locationCount.textContent = data.total || 0;
        }
      })
      .catch(err => {
        const locationCount = document.getElementById('location-count');
        if (locationCount) {
          locationCount.textContent = 'Error';
        }
        console.error('Error fetching location count:', err);
      });
  }

  // Set up admin buttons
  function setupAdminButtons() {
    const createAvatarBtn = document.getElementById('create-avatar-btn');
    if (createAvatarBtn) {
      createAvatarBtn.addEventListener('click', showCreateAvatarForm);
    }
  }
  
  // Add return statement to expose public methods
  return {
    init
  };
})();

// Initialize the admin panel when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  AdminPanel.init();
});

  // Show create avatar form
  function showCreateAvatarForm() {
    if (!adminContent) return;

    adminContent.innerHTML = `
      <div class="admin-header relative p-4 border-b border-surface-700 flex justify-between items-center">
        <h2 class="text-xl font-semibold text-white">Create New Avatar</h2>
        <button id="back-to-admin" class="text-gray-400 hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
          </svg>
        </button>
      </div>

      <div class="p-6">
        <form id="avatar-form" class="space-y-4">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-300">Name</label>
            <input type="text" id="name" name="name" required
                  class="mt-1 block w-full bg-surface-700 border border-surface-600 rounded-md shadow-sm py-2 px-3 text-white">
          </div>

          <div>
            <label for="description" class="block text-sm font-medium text-gray-300">Description</label>
            <textarea id="description" name="description" rows="3" required
                     class="mt-1 block w-full bg-surface-700 border border-surface-600 rounded-md shadow-sm py-2 px-3 text-white"></textarea>
          </div>

          <div>
            <label for="personality" class="block text-sm font-medium text-gray-300">Personality</label>
            <textarea id="personality" name="personality" rows="3" required
                     class="mt-1 block w-full bg-surface-700 border border-surface-600 rounded-md shadow-sm py-2 px-3 text-white"></textarea>
          </div>

          <div>
            <label for="emoji" class="block text-sm font-medium text-gray-300">Emoji</label>
            <input type="text" id="emoji" name="emoji" placeholder="✨"
                  class="mt-1 block w-full bg-surface-700 border border-surface-600 rounded-md shadow-sm py-2 px-3 text-white">
          </div>

          <div>
            <label for="imageUrl" class="block text-sm font-medium text-gray-300">Image URL</label>
            <input type="text" id="imageUrl" name="imageUrl"
                  class="mt-1 block w-full bg-surface-700 border border-surface-600 rounded-md shadow-sm py-2 px-3 text-white">
          </div>

          <div>
            <label for="locationId" class="block text-sm font-medium text-gray-300">Location</label>
            <select id="locationId" name="locationId"
                   class="mt-1 block w-full bg-surface-700 border border-surface-600 rounded-md shadow-sm py-2 px-3 text-white">
              <option value="">Select location...</option>
            </select>
          </div>

          <div class="pt-2">
            <button type="submit" class="bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded">
              Create Avatar
            </button>
          </div>
        </form>
      </div>
    `;

    // Add close button
    const headerDiv = adminContent.querySelector('.admin-header');
    if (headerDiv) {
      headerDiv.appendChild(closeAdminBtn);
    }

    // Load locations for dropdown
    fetch('/api/locations?limit=100')
      .then(res => res.json())
      .then(data => {
        const locationSelect = document.querySelector('select[name="locationId"]');
        if (locationSelect) {
          data.data.forEach(location => {
            const option = document.createElement('option');
            option.value = location._id;
            option.textContent = location.name;
            locationSelect.appendChild(option);
          });
        }
      })
      .catch(err => console.error('Error fetching locations:', err));

    // Set up back button
    const backBtn = document.getElementById('back-to-admin');
    if (backBtn) {
      backBtn.addEventListener('click', loadAdminContent);
    }

    // Set up form submission
    const avatarForm = document.getElementById('avatar-form');
    if (avatarForm) {
      avatarForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const formData = new FormData(this);
        const avatarData = {
          name: formData.get('name'),
          description: formData.get('description'),
          personality: formData.get('personality'),
          emoji: formData.get('emoji') || '✨',
          imageUrl: formData.get('imageUrl') || 'https://via.placeholder.com/200',
          locationId: formData.get('locationId')
        };

        fetch('/api/admin/avatars', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(avatarData)
        })
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            throw new Error(data.error);
          }
          alert('Avatar created successfully!');
          loadAdminContent();
        })
        .catch(err => {
          console.error('Error creating avatar:', err);
          alert('Failed to create avatar: ' + err.message);
        });
      });
    }
  }

  // Public API
  return {
    init,
    toggleAdminPanel
  };
})();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', AdminPanel.init);