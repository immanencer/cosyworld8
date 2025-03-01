
// Admin Panel Module
const AdminPanel = (() => {
  // DOM elements
  const adminBtn = document.getElementById('admin-button');
  const adminModal = document.getElementById('admin-modal');
  const adminContent = adminModal ? document.getElementById('admin-content') : null;
  const closeAdminBtn = document.createElement('button');

  // Initialize admin panel
  function init() {
    // Check if admin elements exist
    if (!adminBtn || !adminModal || !adminContent) {
      console.log('Admin panel elements not found. Initialization skipped.');
      return;
    }

    console.log('Initializing admin panel');

    // Set up close button
    closeAdminBtn.className = 'absolute top-4 right-4 text-gray-600 hover:text-gray-800';
    closeAdminBtn.innerHTML = '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>';
    adminModal.appendChild(closeAdminBtn);

    // Add event listeners
    adminBtn.addEventListener('click', showAdminPanel);
    closeAdminBtn.addEventListener('click', hideAdminPanel);

    // Create tabs
    createTabs();
  }

  // Show admin panel
  function showAdminPanel() {
    if (adminModal) {
      adminModal.classList.remove('hidden');
      fetchAdminData();
    }
  }

  // Hide admin panel
  function hideAdminPanel() {
    if (adminModal) {
      adminModal.classList.add('hidden');
    }
  }

  // Fetch admin data
  async function fetchAdminData() {
    try {
      // Fetch avatars
      const avatarsResponse = await fetch('/api/admin/avatars');
      const avatarsData = await avatarsResponse.json();
      
      // Fetch items
      const itemsResponse = await fetch('/api/admin/items');
      const itemsData = await itemsResponse.json();
      
      // Fetch locations
      const locationsResponse = await fetch('/api/admin/locations');
      const locationsData = await locationsResponse.json();
      
      // Update UI with data
      updateAvatarsTab(avatarsData);
      updateItemsTab(itemsData);
      updateLocationsTab(locationsData);
      
    } catch (error) {
      console.error('Error fetching admin data:', error);
      showToast('Error loading admin data. Please try again.', 'error');
    }
  }

  // Create admin tabs
  function createTabs() {
    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'border-b border-gray-200';
    
    const tabsList = document.createElement('div');
    tabsList.className = 'flex -mb-px';
    
    const tabs = [
      { id: 'avatars-tab', name: 'Avatars' },
      { id: 'items-tab', name: 'Items' },
      { id: 'locations-tab', name: 'Locations' },
      { id: 'create-tab', name: 'Create' }
    ];
    
    tabs.forEach((tab, index) => {
      const tabBtn = document.createElement('button');
      tabBtn.className = index === 0 
        ? 'py-2 px-4 text-sm font-medium text-blue-600 border-b-2 border-blue-600'
        : 'py-2 px-4 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300';
      tabBtn.textContent = tab.name;
      tabBtn.id = tab.id;
      tabBtn.addEventListener('click', () => switchTab(tab.id));
      tabsList.appendChild(tabBtn);
    });
    
    tabsContainer.appendChild(tabsList);
    adminContent.appendChild(tabsContainer);
    
    // Create content containers for each tab
    tabs.forEach(tab => {
      const contentDiv = document.createElement('div');
      contentDiv.id = `${tab.id}-content`;
      contentDiv.className = tab.id === 'avatars-tab' ? 'mt-4' : 'mt-4 hidden';
      adminContent.appendChild(contentDiv);
    });
    
    // Create forms for the "Create" tab
    setupCreateTab();
  }

  // Switch between tabs
  function switchTab(tabId) {
    // Reset all tabs
    const allTabs = document.querySelectorAll('[id$="-tab"]');
    allTabs.forEach(tab => {
      tab.className = 'py-2 px-4 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300';
    });
    
    // Reset all content divs
    const allContent = document.querySelectorAll('[id$="-tab-content"]');
    allContent.forEach(content => {
      content.classList.add('hidden');
    });
    
    // Activate selected tab
    document.getElementById(tabId).className = 'py-2 px-4 text-sm font-medium text-blue-600 border-b-2 border-blue-600';
    document.getElementById(`${tabId}-content`).classList.remove('hidden');
  }

  // Setup create tab
  function setupCreateTab() {
    const createContent = document.getElementById('create-tab-content');
    if (!createContent) return;
    
    createContent.innerHTML = `
      <div class="space-y-6">
        <h3 class="text-lg font-medium text-gray-900">Create New</h3>
        <div class="space-y-2">
          <button id="create-avatar-btn" class="bg-blue-600 text-white px-4 py-2 rounded">New Avatar</button>
          <button id="create-item-btn" class="bg-green-600 text-white px-4 py-2 rounded">New Item</button>
          <button id="create-location-btn" class="bg-purple-600 text-white px-4 py-2 rounded">New Location</button>
        </div>
      </div>
    `;
    
    const createAvatarBtn = document.getElementById('create-avatar-btn');
    if (createAvatarBtn) {
      createAvatarBtn.addEventListener('click', showCreateAvatarForm);
    }
  }

  // Show create avatar form
  function showCreateAvatarForm() {
    const createContent = document.getElementById('create-tab-content');
    if (!createContent) return;
    
    createContent.innerHTML = `
      <div class="space-y-6">
        <div class="flex items-center">
          <button id="back-to-create" class="mr-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>
          <h3 class="text-lg font-medium text-gray-900">Create New Avatar</h3>
        </div>
        
        <form id="create-avatar-form" class="space-y-4">
          <div>
            <label for="avatar-name" class="block text-sm font-medium text-gray-700">Name</label>
            <input type="text" id="avatar-name" name="name" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
          </div>
          
          <div>
            <label for="avatar-description" class="block text-sm font-medium text-gray-700">Description</label>
            <textarea id="avatar-description" name="description" rows="3" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"></textarea>
          </div>
          
          <div>
            <label for="avatar-personality" class="block text-sm font-medium text-gray-700">Personality</label>
            <textarea id="avatar-personality" name="personality" rows="3" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"></textarea>
          </div>
          
          <div>
            <label for="avatar-emoji" class="block text-sm font-medium text-gray-700">Emoji</label>
            <input type="text" id="avatar-emoji" name="emoji" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" maxlength="5">
          </div>
          
          <div>
            <label for="avatar-model" class="block text-sm font-medium text-gray-700">AI Model</label>
            <select id="avatar-model" name="model" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
              <option value="llama3:8b-instruct-fp16">Llama 3 (8B)</option>
              <option value="llama3:70b-instruct-fp16">Llama 3 (70B)</option>
              <option value="claude-3-haiku">Claude 3 Haiku</option>
              <option value="claude-3-sonnet">Claude 3 Sonnet</option>
              <option value="gpt-4-turbo">GPT-4 Turbo</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
            </select>
          </div>
          
          <div>
            <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded">Create Avatar</button>
          </div>
        </form>
      </div>
    `;
    
    // Back button handler
    const backBtn = document.getElementById('back-to-create');
    if (backBtn) {
      backBtn.addEventListener('click', setupCreateTab);
    }
    
    // Form submission
    const form = document.getElementById('create-avatar-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await createAvatar(form);
      });
    }
  }

  // Create avatar
  async function createAvatar(form) {
    const formData = new FormData(form);
    const avatarData = {
      name: formData.get('name'),
      description: formData.get('description'),
      personality: formData.get('personality'),
      emoji: formData.get('emoji'),
      model: formData.get('model'),
      status: 'active'
    };
    
    try {
      const response = await fetch('/api/admin/avatars', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(avatarData)
      });
      
      if (response.ok) {
        const result = await response.json();
        showToast('Avatar created successfully!', 'success');
        setupCreateTab();
        fetchAdminData();
      } else {
        const error = await response.json();
        showToast(error.message || 'Error creating avatar', 'error');
      }
    } catch (error) {
      console.error('Error creating avatar:', error);
      showToast('Error creating avatar. Please try again.', 'error');
    }
  }

  // Update avatars tab with data
  function updateAvatarsTab(avatars) {
    const avatarsContent = document.getElementById('avatars-tab-content');
    if (!avatarsContent) return;
    
    if (!avatars || avatars.length === 0) {
      avatarsContent.innerHTML = '<p class="text-gray-500">No avatars found.</p>';
      return;
    }
    
    let html = `
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Emoji</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
    `;
    
    avatars.forEach(avatar => {
      html += `
        <tr>
          <td class="px-6 py-4 whitespace-nowrap">${avatar.name}</td>
          <td class="px-6 py-4 whitespace-nowrap">${avatar.emoji || '—'}</td>
          <td class="px-6 py-4 whitespace-nowrap">
            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-${avatar.status === 'active' ? 'green' : 'gray'}-100 text-${avatar.status === 'active' ? 'green' : 'gray'}-800">
              ${avatar.status}
            </span>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">${avatar.model || 'Default'}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
            <button class="text-indigo-600 hover:text-indigo-900 mr-2 edit-avatar" data-id="${avatar._id}">Edit</button>
            <button class="text-red-600 hover:text-red-900 delete-avatar" data-id="${avatar._id}">Delete</button>
          </td>
        </tr>
      `;
    });
    
    html += `
          </tbody>
        </table>
      </div>
    `;
    
    avatarsContent.innerHTML = html;
    
    // Add event listeners for edit and delete buttons
    const editButtons = avatarsContent.querySelectorAll('.edit-avatar');
    editButtons.forEach(button => {
      button.addEventListener('click', () => {
        const avatarId = button.getAttribute('data-id');
        editAvatar(avatarId);
      });
    });
    
    const deleteButtons = avatarsContent.querySelectorAll('.delete-avatar');
    deleteButtons.forEach(button => {
      button.addEventListener('click', () => {
        const avatarId = button.getAttribute('data-id');
        deleteAvatar(avatarId);
      });
    });
  }

  // Update items tab with data
  function updateItemsTab(items) {
    const itemsContent = document.getElementById('items-tab-content');
    if (!itemsContent) return;
    
    // Similar implementation as updateAvatarsTab
    itemsContent.innerHTML = '<p class="text-gray-500">Items tab content loading...</p>';
  }

  // Update locations tab with data
  function updateLocationsTab(locations) {
    const locationsContent = document.getElementById('locations-tab-content');
    if (!locationsContent) return;
    
    // Similar implementation as updateAvatarsTab
    locationsContent.innerHTML = '<p class="text-gray-500">Locations tab content loading...</p>';
  }

  // Edit avatar
  function editAvatar(avatarId) {
    console.log('Edit avatar:', avatarId);
    // Implementation TBD
  }

  // Delete avatar
  async function deleteAvatar(avatarId) {
    if (!confirm('Are you sure you want to delete this avatar?')) return;
    
    try {
      const response = await fetch(`/api/admin/avatars/${avatarId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        showToast('Avatar deleted successfully!', 'success');
        fetchAdminData();
      } else {
        const error = await response.json();
        showToast(error.message || 'Error deleting avatar', 'error');
      }
    } catch (error) {
      console.error('Error deleting avatar:', error);
      showToast('Error deleting avatar. Please try again.', 'error');
    }
  }

  // Return public methods
  return {
    init
  };
})();

// Initialize the admin panel when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  AdminPanel.init();
});
