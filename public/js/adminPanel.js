
// Admin Panel Module
const AdminPanel = (() => {
  // DOM elements
  const adminBtn = document.getElementById('admin-button');
  const adminModal = document.getElementById('admin-modal');
  const adminContent = document.getElementById('admin-content');
  const closeAdminBtn = document.getElementById('close-admin');

  // Initialize admin panel
  function init() {
    console.log('Trying to initialize admin panel');
    
    // Check if admin elements exist
    if (!adminBtn || !adminModal || !adminContent) {
      console.error('Admin panel elements not found:', { 
        adminBtn: !!adminBtn, 
        adminModal: !!adminModal, 
        adminContent: !!adminContent 
      });
      return;
    }

    console.log('Initializing admin panel');

    // Add event listeners
    adminBtn.addEventListener('click', showAdminPanel);
    closeAdminBtn.addEventListener('click', hideAdminPanel);

    // Setup admin tab buttons
    setupAdminTabs();
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

  // Setup admin tabs
  function setupAdminTabs() {
    const tabButtons = document.querySelectorAll('.admin-tab-button');
    
    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Remove active class from all buttons
        tabButtons.forEach(btn => {
          btn.classList.remove('bg-primary-600', 'text-white');
          btn.classList.add('hover:bg-surface-700', 'text-surface-300', 'hover:text-white');
        });
        
        // Add active class to clicked button
        button.classList.remove('hover:bg-surface-700', 'text-surface-300', 'hover:text-white');
        button.classList.add('bg-primary-600', 'text-white');
        
        // Show corresponding tab content
        const tabId = button.getAttribute('data-admin-tab');
        showTabContent(tabId);
      });
    });
  }

  // Show tab content
  function showTabContent(tabId) {
    // Implementation to show tab content based on tabId
    console.log(`Showing tab content for: ${tabId}`);
    
    // For now, just display a placeholder
    adminContent.innerHTML = `
      <div class="bg-surface-800 rounded-lg p-6 mb-6">
        <h3 class="text-xl font-semibold text-white mb-4">${tabId.charAt(0).toUpperCase() + tabId.slice(1)}</h3>
        <p class="text-surface-300">Content for ${tabId} will be displayed here.</p>
      </div>
    `;
    
    // If it's the dashboard tab, show some stats
    if (tabId === 'dashboard') {
      showDashboard();
    } else if (tabId === 'avatars') {
      showAvatarsTab();
    }
  }
  
  // Show dashboard content
  function showDashboard() {
    adminContent.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div class="bg-surface-800 rounded-lg p-6">
          <h3 class="text-xl font-semibold text-white mb-2">Avatars</h3>
          <p class="text-3xl font-bold text-primary-400">Loading...</p>
        </div>
        <div class="bg-surface-800 rounded-lg p-6">
          <h3 class="text-xl font-semibold text-white mb-2">Active Users</h3>
          <p class="text-3xl font-bold text-primary-400">Loading...</p>
        </div>
        <div class="bg-surface-800 rounded-lg p-6">
          <h3 class="text-xl font-semibold text-white mb-2">Total Interactions</h3>
          <p class="text-3xl font-bold text-primary-400">Loading...</p>
        </div>
      </div>
      
      <div class="bg-surface-800 rounded-lg p-6">
        <h3 class="text-xl font-semibold text-white mb-4">Recent Activity</h3>
        <div class="animate-pulse space-y-4">
          <div class="h-8 bg-surface-700 rounded w-full"></div>
          <div class="h-8 bg-surface-700 rounded w-full"></div>
          <div class="h-8 bg-surface-700 rounded w-full"></div>
          <div class="h-8 bg-surface-700 rounded w-full"></div>
        </div>
      </div>
    `;
  }
  
  // Show avatars tab
  function showAvatarsTab() {
    adminContent.innerHTML = `
      <div class="bg-surface-800 rounded-lg p-6 mb-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-semibold text-white">Manage Avatars</h3>
          <button id="create-avatar-btn" class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded">
            Create Avatar
          </button>
        </div>
        
        <div class="relative overflow-x-auto rounded-lg">
          <table class="w-full text-sm text-left text-surface-300">
            <thead class="text-xs uppercase bg-surface-700 text-surface-300">
              <tr>
                <th scope="col" class="px-6 py-3">Avatar</th>
                <th scope="col" class="px-6 py-3">Name</th>
                <th scope="col" class="px-6 py-3">Status</th>
                <th scope="col" class="px-6 py-3">Location</th>
                <th scope="col" class="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody id="avatars-table-body">
              <tr class="border-b border-surface-700">
                <td class="px-6 py-4 animate-pulse">
                  <div class="h-10 w-10 bg-surface-700 rounded-full"></div>
                </td>
                <td class="px-6 py-4 animate-pulse">
                  <div class="h-4 bg-surface-700 rounded w-24"></div>
                </td>
                <td class="px-6 py-4 animate-pulse">
                  <div class="h-4 bg-surface-700 rounded w-16"></div>
                </td>
                <td class="px-6 py-4 animate-pulse">
                  <div class="h-4 bg-surface-700 rounded w-24"></div>
                </td>
                <td class="px-6 py-4 animate-pulse">
                  <div class="h-8 bg-surface-700 rounded w-20"></div>
                </td>
              </tr>
              <tr class="border-b border-surface-700">
                <td class="px-6 py-4 animate-pulse">
                  <div class="h-10 w-10 bg-surface-700 rounded-full"></div>
                </td>
                <td class="px-6 py-4 animate-pulse">
                  <div class="h-4 bg-surface-700 rounded w-24"></div>
                </td>
                <td class="px-6 py-4 animate-pulse">
                  <div class="h-4 bg-surface-700 rounded w-16"></div>
                </td>
                <td class="px-6 py-4 animate-pulse">
                  <div class="h-4 bg-surface-700 rounded w-24"></div>
                </td>
                <td class="px-6 py-4 animate-pulse">
                  <div class="h-8 bg-surface-700 rounded w-20"></div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
    
    // Add event listener for create avatar button
    const createAvatarBtn = document.getElementById('create-avatar-btn');
    if (createAvatarBtn) {
      createAvatarBtn.addEventListener('click', showCreateAvatarForm);
    }
  }

  // Show create avatar form
  function showCreateAvatarForm() {
    adminContent.innerHTML = `
      <div class="bg-surface-800 rounded-lg p-6 mb-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-semibold text-white">Create New Avatar</h3>
          <button id="back-to-avatars" class="text-surface-300 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form id="create-avatar-form" class="space-y-4">
          <div>
            <label for="avatar-name" class="block text-sm font-medium text-surface-300 mb-1">Name</label>
            <input type="text" id="avatar-name" name="name" class="bg-surface-700 border border-surface-600 text-white text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5">
          </div>
          
          <div>
            <label for="avatar-description" class="block text-sm font-medium text-surface-300 mb-1">Description</label>
            <textarea id="avatar-description" name="description" rows="3" class="bg-surface-700 border border-surface-600 text-white text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"></textarea>
          </div>
          
          <div>
            <label for="avatar-personality" class="block text-sm font-medium text-surface-300 mb-1">Personality</label>
            <textarea id="avatar-personality" name="personality" rows="3" class="bg-surface-700 border border-surface-600 text-white text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"></textarea>
          </div>
          
          <div>
            <label for="avatar-emoji" class="block text-sm font-medium text-surface-300 mb-1">Emoji</label>
            <input type="text" id="avatar-emoji" name="emoji" class="bg-surface-700 border border-surface-600 text-white text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5" placeholder="e.g. 🧙‍♂️">
          </div>
          
          <div>
            <label for="avatar-model" class="block text-sm font-medium text-surface-300 mb-1">AI Model</label>
            <select id="avatar-model" name="model" class="bg-surface-700 border border-surface-600 text-white text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5">
              <option value="gpt-4">GPT-4</option>
              <option value="claude-3-opus">Claude 3 Opus</option>
              <option value="claude-3-sonnet">Claude 3 Sonnet</option>
              <option value="claude-3-haiku">Claude 3 Haiku</option>
            </select>
          </div>
          
          <div class="flex items-center justify-end mt-6">
            <button type="submit" class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded">
              Create Avatar
            </button>
          </div>
        </form>
      </div>
    `;
    
    // Add event listener for back button
    const backBtn = document.getElementById('back-to-avatars');
    if (backBtn) {
      backBtn.addEventListener('click', () => showTabContent('avatars'));
    }
    
    // Add event listener for form submission
    const form = document.getElementById('create-avatar-form');
    if (form) {
      form.addEventListener('submit', handleCreateAvatar);
    }
  }
  
  // Handle create avatar form submission
  async function handleCreateAvatar(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const avatarData = Object.fromEntries(formData.entries());
    
    try {
      const response = await fetch('/api/admin/avatars', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(avatarData)
      });
      
      if (response.ok) {
        // Show success message
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white rounded-lg px-4 py-2';
        toast.textContent = 'Avatar created successfully!';
        document.body.appendChild(toast);
        
        // Remove toast after 3 seconds
        setTimeout(() => {
          toast.remove();
        }, 3000);
        
        // Go back to avatars list
        showTabContent('avatars');
      } else {
        const errorData = await response.json();
        console.error('Error creating avatar:', errorData);
        
        // Show error message
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-4 right-4 bg-red-500 text-white rounded-lg px-4 py-2';
        toast.textContent = errorData.error || 'Error creating avatar';
        document.body.appendChild(toast);
        
        // Remove toast after 3 seconds
        setTimeout(() => {
          toast.remove();
        }, 3000);
      }
    } catch (error) {
      console.error('Error creating avatar:', error);
    }
  }

  // Fetch admin data
  async function fetchAdminData() {
    try {
      // Fetch avatars
      const avatarsResponse = await fetch('/api/admin/avatars');
      if (!avatarsResponse.ok) {
        throw new Error(`HTTP error! status: ${avatarsResponse.status}`);
      }
      const avatarsData = await avatarsResponse.json();
      
      // Update dashboard with counts
      updateDashboardStats({
        avatarCount: avatarsData.total || avatarsData.length || 0
      });
      
    } catch (error) {
      console.error('Error fetching admin data:', error);
      // Show error toast
      const toast = document.createElement('div');
      toast.className = 'fixed bottom-4 right-4 bg-red-500 text-white rounded-lg px-4 py-2';
      toast.textContent = 'Error loading admin data. Please try again.';
      document.body.appendChild(toast);
      
      // Remove toast after 3 seconds
      setTimeout(() => {
        toast.remove();
      }, 3000);
    }
  }
  
  // Update dashboard stats
  function updateDashboardStats(stats) {
    const dashboardItems = document.querySelectorAll('.bg-surface-800');
    if (dashboardItems.length >= 3) {
      // Update avatar count
      const avatarStat = dashboardItems[0].querySelector('.text-3xl');
      if (avatarStat) {
        avatarStat.textContent = stats.avatarCount;
      }
      
      // Update other stats if available
      // ...
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
