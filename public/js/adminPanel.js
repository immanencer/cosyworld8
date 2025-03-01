
// Admin Panel Module
const AdminPanel = (() => {
  // DOM elements
  const adminBtn = document.getElementById('admin-btn');
  const adminModal = document.getElementById('admin-modal');
  const adminContent = document.getElementById('admin-content');
  const closeAdminBtn = document.createElement('button');
  
  // State
  let isInitialized = false;
  
  // Initialize the admin panel
  function init() {
    if (isInitialized) return;
    
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
    adminModal.addEventListener('click', (e) => {
      if (e.target === adminModal) {
        hideAdminPanel();
      }
    });
    
    // Keyboard shortcut (Escape)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && adminModal.classList.contains('flex')) {
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
    
    // Add to DOM when modal is opened
  }
  
  // Toggle admin panel visibility
  function toggleAdminPanel() {
    if (adminModal.classList.contains('hidden')) {
      showAdminPanel();
    } else {
      hideAdminPanel();
    }
  }
  
  // Show admin panel
  function showAdminPanel() {
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
    adminModal.classList.remove('flex');
    adminModal.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
  }
  
  // Load admin panel content
  function loadAdminContent() {
    adminContent.innerHTML = `
      <div class="admin-header relative p-4 border-b border-surface-700 flex justify-between items-center">
        <h2 class="text-xl font-semibold text-white">Admin Panel</h2>
      </div>
      
      <div class="p-6 space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Avatar Management -->
          <div class="bg-surface-700 p-4 rounded-lg shadow">
            <h3 class="text-lg font-medium mb-3">Avatar Management</h3>
            <div class="space-y-2">
              <button id="create-avatar-btn" class="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded">
                Create New Avatar
              </button>
              <button id="manage-avatars-btn" class="w-full bg-surface-600 hover:bg-surface-500 text-white py-2 px-4 rounded">
                Manage Existing Avatars
              </button>
            </div>
          </div>
          
          <!-- Item Management -->
          <div class="bg-surface-700 p-4 rounded-lg shadow">
            <h3 class="text-lg font-medium mb-3">Item Management</h3>
            <div class="space-y-2">
              <button id="create-item-btn" class="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded">
                Create New Item
              </button>
              <button id="manage-items-btn" class="w-full bg-surface-600 hover:bg-surface-500 text-white py-2 px-4 rounded">
                Manage Existing Items
              </button>
            </div>
          </div>
          
          <!-- Location Management -->
          <div class="bg-surface-700 p-4 rounded-lg shadow">
            <h3 class="text-lg font-medium mb-3">Location Management</h3>
            <div class="space-y-2">
              <button id="create-location-btn" class="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded">
                Create New Location
              </button>
              <button id="manage-locations-btn" class="w-full bg-surface-600 hover:bg-surface-500 text-white py-2 px-4 rounded">
                Manage Existing Locations
              </button>
            </div>
          </div>
          
          <!-- System Settings -->
          <div class="bg-surface-700 p-4 rounded-lg shadow">
            <h3 class="text-lg font-medium mb-3">System Settings</h3>
            <div class="space-y-2">
              <button id="ai-settings-btn" class="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded">
                AI Service Settings
              </button>
              <button id="backup-btn" class="w-full bg-surface-600 hover:bg-surface-500 text-white py-2 px-4 rounded">
                Backup Database
              </button>
            </div>
          </div>
        </div>
        
        <!-- Stats Overview -->
        <div class="bg-surface-700 p-4 rounded-lg shadow">
          <h3 class="text-lg font-medium mb-3">System Overview</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-surface-800 p-3 rounded">
              <p class="text-gray-400 text-sm">Total Avatars</p>
              <p class="text-xl font-semibold" id="avatar-count">Loading...</p>
            </div>
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
    `;
    
    // Add the close button back to the header
    const headerDiv = adminContent.querySelector('.admin-header');
    headerDiv.appendChild(closeAdminBtn);
    
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
        document.getElementById('avatar-count').textContent = data.total || 0;
      })
      .catch(err => {
        document.getElementById('avatar-count').textContent = 'Error';
        console.error('Error fetching avatar count:', err);
      });
    
    // Fetch item count
    fetch('/api/items?limit=1')
      .then(res => res.json())
      .then(data => {
        document.getElementById('item-count').textContent = data.total || 0;
      })
      .catch(err => {
        document.getElementById('item-count').textContent = 'Error';
        console.error('Error fetching item count:', err);
      });
    
    // Fetch location count
    fetch('/api/locations?limit=1')
      .then(res => res.json())
      .then(data => {
        document.getElementById('location-count').textContent = data.total || 0;
      })
      .catch(err => {
        document.getElementById('location-count').textContent = 'Error';
        console.error('Error fetching location count:', err);
      });
  }
  
  // Setup admin buttons
  function setupAdminButtons() {
    // Avatar management
    document.getElementById('create-avatar-btn').addEventListener('click', showCreateAvatarForm);
    document.getElementById('manage-avatars-btn').addEventListener('click', showAvatarManagement);
    
    // Item management
    document.getElementById('create-item-btn').addEventListener('click', showCreateItemForm);
    document.getElementById('manage-items-btn').addEventListener('click', showItemManagement);
    
    // Location management
    document.getElementById('create-location-btn').addEventListener('click', showCreateLocationForm);
    document.getElementById('manage-locations-btn').addEventListener('click', showLocationManagement);
    
    // System settings
    document.getElementById('ai-settings-btn').addEventListener('click', showAISettings);
    document.getElementById('backup-btn').addEventListener('click', initiateBackup);
  }
  
  // Show create avatar form
  function showCreateAvatarForm() {
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
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">Name</label>
              <input type="text" name="name" class="w-full bg-surface-800 border border-surface-600 rounded px-3 py-2 text-white" required>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">Emoji</label>
              <input type="text" name="emoji" class="w-full bg-surface-800 border border-surface-600 rounded px-3 py-2 text-white" placeholder="✨">
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Description</label>
            <textarea name="description" rows="2" class="w-full bg-surface-800 border border-surface-600 rounded px-3 py-2 text-white" required></textarea>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Personality</label>
            <textarea name="personality" rows="4" class="w-full bg-surface-800 border border-surface-600 rounded px-3 py-2 text-white" required></textarea>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Image URL</label>
            <input type="text" name="imageUrl" class="w-full bg-surface-800 border border-surface-600 rounded px-3 py-2 text-white" placeholder="https://example.com/image.png">
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">Starting Location</label>
              <select name="locationId" class="w-full bg-surface-800 border border-surface-600 rounded px-3 py-2 text-white">
                <option value="">Select a location</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">Lives</label>
              <input type="number" name="lives" class="w-full bg-surface-800 border border-surface-600 rounded px-3 py-2 text-white" value="3" min="1">
            </div>
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
    headerDiv.appendChild(closeAdminBtn);
    
    // Load locations for dropdown
    fetch('/api/locations?limit=100')
      .then(res => res.json())
      .then(data => {
        const locationSelect = document.querySelector('select[name="locationId"]');
        data.data.forEach(location => {
          const option = document.createElement('option');
          option.value = location._id;
          option.textContent = location.name;
          locationSelect.appendChild(option);
        });
      })
      .catch(err => console.error('Error fetching locations:', err));
    
    // Set up back button
    document.getElementById('back-to-admin').addEventListener('click', loadAdminContent);
    
    // Set up form submission
    document.getElementById('avatar-form').addEventListener('submit', function(e) {
      e.preventDefault();
      
      const formData = new FormData(this);
      const avatarData = {
        name: formData.get('name'),
        description: formData.get('description'),
        personality: formData.get('personality'),
        emoji: formData.get('emoji') || '✨',
        imageUrl: formData.get('imageUrl') || '',
        locationId: formData.get('locationId') || null,
        lives: parseInt(formData.get('lives')) || 3,
        status: 'alive'
      };
      
      // Make API request to create avatar
      fetch('/api/avatars', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(avatarData)
      })
      .then(res => {
        if (!res.ok) throw new Error('Failed to create avatar');
        return res.json();
      })
      .then(data => {
        // Show success message
        Toast.show('Avatar created successfully!', 'success');
        // Clear form
        document.getElementById('avatar-form').reset();
      })
      .catch(err => {
        console.error('Error creating avatar:', err);
        Toast.show('Failed to create avatar', 'error');
      });
    });
  }
  
  // Show avatar management
  function showAvatarManagement() {
    adminContent.innerHTML = `
      <div class="admin-header relative p-4 border-b border-surface-700 flex justify-between items-center">
        <h2 class="text-xl font-semibold text-white">Manage Avatars</h2>
        <button id="back-to-admin" class="text-gray-400 hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
          </svg>
        </button>
      </div>
      
      <div class="p-6">
        <div class="flex justify-between items-center mb-4">
          <div class="flex gap-2">
            <select id="status-filter" class="bg-surface-800 border border-surface-600 rounded px-3 py-2 text-white">
              <option value="all">All Avatars</option>
              <option value="alive">Alive Only</option>
              <option value="dead">Dead Only</option>
            </select>
            <button id="refresh-avatars" class="bg-surface-600 hover:bg-surface-500 text-white py-2 px-3 rounded">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            </button>
          </div>
          <div class="flex gap-2 items-center">
            <span class="text-sm text-gray-400">Page:</span>
            <button id="prev-page" class="bg-surface-700 text-gray-300 px-3 py-1 rounded">Prev</button>
            <span id="page-info" class="text-sm text-gray-300">1</span>
            <button id="next-page" class="bg-surface-700 text-gray-300 px-3 py-1 rounded">Next</button>
          </div>
        </div>
        
        <div class="bg-surface-700 rounded-lg overflow-hidden">
          <table class="min-w-full divide-y divide-surface-600">
            <thead class="bg-surface-800">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Avatar</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Description</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody id="avatar-table-body" class="divide-y divide-surface-600">
              <tr>
                <td colspan="4" class="px-4 py-8 text-center text-gray-400">
                  <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
                  <p class="mt-2">Loading avatars...</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
    
    // Add close button
    const headerDiv = adminContent.querySelector('.admin-header');
    headerDiv.appendChild(closeAdminBtn);
    
    // Set up back button
    document.getElementById('back-to-admin').addEventListener('click', loadAdminContent);
    
    // Load avatars
    let currentPage = 1;
    const pageSize = 10;
    let currentFilter = 'all';
    
    function loadAvatars() {
      const offset = (currentPage - 1) * pageSize;
      let url = `/api/avatars?limit=${pageSize}&offset=${offset}`;
      
      if (currentFilter !== 'all') {
        url += `&status=${currentFilter}`;
      }
      
      fetch(url)
        .then(res => res.json())
        .then(data => {
          const tableBody = document.getElementById('avatar-table-body');
          tableBody.innerHTML = '';
          
          if (data.data.length === 0) {
            tableBody.innerHTML = `
              <tr>
                <td colspan="4" class="px-4 py-8 text-center text-gray-400">
                  No avatars found.
                </td>
              </tr>
            `;
            return;
          }
          
          data.data.forEach(avatar => {
            const row = document.createElement('tr');
            row.classList.add('hover:bg-surface-600');
            
            row.innerHTML = `
              <td class="px-4 py-3 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    ${avatar.imageUrl 
                      ? `<img class="h-10 w-10 rounded-full object-cover" src="${avatar.imageUrl}" alt="${avatar.name}">`
                      : `<div class="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-lg">${avatar.emoji || '✨'}</div>`
                    }
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-white">${avatar.name}</div>
                    <div class="text-xs text-gray-400">ID: ${avatar._id}</div>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3">
                <div class="text-sm text-gray-200">${avatar.description.length > 100 ? avatar.description.substring(0, 100) + '...' : avatar.description}</div>
              </td>
              <td class="px-4 py-3 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  avatar.status === 'alive' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }">
                  ${avatar.status} ${avatar.status === 'alive' ? `(${avatar.lives} lives)` : ''}
                </span>
              </td>
              <td class="px-4 py-3 whitespace-nowrap text-sm font-medium">
                <button class="text-indigo-400 hover:text-indigo-200 mr-3 edit-avatar" data-id="${avatar._id}">Edit</button>
                <button class="text-red-400 hover:text-red-200 delete-avatar" data-id="${avatar._id}">Delete</button>
              </td>
            `;
            
            tableBody.appendChild(row);
          });
          
          // Update pagination
          document.getElementById('page-info').textContent = `${currentPage} of ${Math.ceil(data.total / pageSize)}`;
          document.getElementById('prev-page').disabled = currentPage === 1;
          document.getElementById('next-page').disabled = currentPage >= Math.ceil(data.total / pageSize);
          
          // Add event listeners for edit/delete buttons
          document.querySelectorAll('.edit-avatar').forEach(btn => {
            btn.addEventListener('click', () => {
              const avatarId = btn.getAttribute('data-id');
              editAvatar(avatarId);
            });
          });
          
          document.querySelectorAll('.delete-avatar').forEach(btn => {
            btn.addEventListener('click', () => {
              const avatarId = btn.getAttribute('data-id');
              if (confirm('Are you sure you want to delete this avatar? This action cannot be undone.')) {
                deleteAvatar(avatarId);
              }
            });
          });
        })
        .catch(err => {
          console.error('Error loading avatars:', err);
          const tableBody = document.getElementById('avatar-table-body');
          tableBody.innerHTML = `
            <tr>
              <td colspan="4" class="px-4 py-4 text-center text-red-400">
                Error loading avatars. Please try again.
              </td>
            </tr>
          `;
        });
    }
    
    // Load initial data
    loadAvatars();
    
    // Set up pagination
    document.getElementById('prev-page').addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        loadAvatars();
      }
    });
    
    document.getElementById('next-page').addEventListener('click', () => {
      currentPage++;
      loadAvatars();
    });
    
    // Set up filter
    document.getElementById('status-filter').addEventListener('change', function() {
      currentFilter = this.value;
      currentPage = 1; // Reset to first page
      loadAvatars();
    });
    
    // Set up refresh button
    document.getElementById('refresh-avatars').addEventListener('click', loadAvatars);
    
    // Delete avatar function
    function deleteAvatar(avatarId) {
      fetch(`/api/avatars/${avatarId}`, {
        method: 'DELETE'
      })
      .then(res => {
        if (!res.ok) throw new Error('Failed to delete avatar');
        Toast.show('Avatar deleted successfully', 'success');
        loadAvatars(); // Refresh the list
      })
      .catch(err => {
        console.error('Error deleting avatar:', err);
        Toast.show('Failed to delete avatar', 'error');
      });
    }
    
    // Edit avatar function (placeholder)
    function editAvatar(avatarId) {
      // Fetch avatar details and show edit form
      fetch(`/api/avatars/${avatarId}`)
        .then(res => res.json())
        .then(avatar => {
          // Show edit form (similar to create form but pre-filled)
          // For brevity, implementation details omitted
          Toast.show('Edit avatar functionality coming soon', 'info');
        })
        .catch(err => {
          console.error('Error fetching avatar details:', err);
          Toast.show('Failed to load avatar details', 'error');
        });
    }
  }
  
  // Placeholder functions for other sections (to be implemented)
  function showCreateItemForm() {
    Toast.show('Create item functionality coming soon', 'info');
  }
  
  function showItemManagement() {
    Toast.show('Item management functionality coming soon', 'info');
  }
  
  function showCreateLocationForm() {
    Toast.show('Create location functionality coming soon', 'info');
  }
  
  function showLocationManagement() {
    Toast.show('Location management functionality coming soon', 'info');
  }
  
  function showAISettings() {
    Toast.show('AI settings functionality coming soon', 'info');
  }
  
  function initiateBackup() {
    Toast.show('Database backup initiated', 'info');
    // In a real implementation, make an API call to trigger backup
  }
  
  // Return public methods
  return {
    init
  };
})();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', AdminPanel.init);
