
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
    if (!adminBtn || !adminModal || !adminContent || !closeAdminBtn) {
      console.error('Admin panel elements not found:', { 
        adminBtn: !!adminBtn, 
        adminModal: !!adminModal, 
        adminContent: !!adminContent,
        closeAdminBtn: !!closeAdminBtn
      });
      return;
    }

    console.log('Initializing admin panel');

    // Add event listeners
    adminBtn.addEventListener('click', showAdminPanel);
    closeAdminBtn.addEventListener('click', hideAdminPanel);

    // Setup admin tab buttons
    setupAdminTabs();
    
    // Add mobile-specific handlers
    setupMobileSupport();
  }

  // Show admin panel
  function showAdminPanel() {
    if (adminModal) {
      adminModal.classList.remove('hidden');
      adminModal.classList.add('flex');
      fetchAdminData();
      
      // Prevent body scrolling when modal is open
      document.body.style.overflow = 'hidden';
    }
  }

  // Hide admin panel
  function hideAdminPanel() {
    if (adminModal) {
      adminModal.classList.add('hidden');
      adminModal.classList.remove('flex');
      
      // Restore body scrolling
      document.body.style.overflow = '';
    }
  }

  // Mobile-specific setup
  function setupMobileSupport() {
    // Make sidebar collapsible on mobile
    const adminSidebar = document.querySelector('#admin-modal .w-64');
    const adminContentArea = document.querySelector('#admin-modal .flex-1');
    
    if (adminSidebar && adminContentArea) {
      // Add toggle button for mobile
      const sidebarToggle = document.createElement('button');
      sidebarToggle.className = 'md:hidden fixed bottom-6 left-6 z-50 bg-primary-600 text-white p-3 rounded-full shadow-lg';
      sidebarToggle.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      `;
      
      adminModal.appendChild(sidebarToggle);
      
      // Handle sidebar toggle
      sidebarToggle.addEventListener('click', () => {
        adminSidebar.classList.toggle('hidden');
        adminSidebar.classList.toggle('absolute');
        adminSidebar.classList.toggle('inset-0');
        adminSidebar.classList.toggle('z-20');
      });
      
      // Initially hide sidebar on small screens
      const checkMobileView = () => {
        if (window.innerWidth < 768) {
          adminSidebar.classList.add('hidden');
          adminSidebar.style.maxHeight = '80vh';
        } else {
          adminSidebar.classList.remove('hidden', 'absolute', 'inset-0', 'z-20');
        }
      };
      
      // Check on load and resize
      checkMobileView();
      window.addEventListener('resize', checkMobileView);
    }
  }

  // Setup admin tab functionality
  function setupAdminTabs() {
    const tabButtons = document.querySelectorAll('.admin-tab-button');
    
    if (tabButtons.length > 0) {
      tabButtons.forEach(button => {
        button.addEventListener('click', () => {
          // Remove active class from all buttons
          tabButtons.forEach(btn => {
            btn.classList.remove('bg-primary-600', 'text-white');
            btn.classList.add('hover:bg-surface-700', 'text-surface-300', 'hover:text-white');
          });
          
          // Add active class to clicked button
          button.classList.add('bg-primary-600', 'text-white');
          button.classList.remove('hover:bg-surface-700', 'text-surface-300', 'hover:text-white');
          
          // Show tab content
          const tabId = button.getAttribute('data-admin-tab');
          showTabContent(tabId);
          
          // On mobile, hide sidebar after selection
          if (window.innerWidth < 768) {
            const adminSidebar = document.querySelector('#admin-modal .w-64');
            if (adminSidebar) {
              adminSidebar.classList.add('hidden');
            }
          }
        });
      });
      
      // Show default tab (dashboard)
      showTabContent('dashboard');
    }
  }

  // Show tab content
  function showTabContent(tabId) {
    console.log(`Showing tab content for: ${tabId}`);
    
    switch(tabId) {
      case 'dashboard':
        showDashboard();
        break;
      case 'avatars':
        showAvatarsTab();
        break;
      case 'users':
        showUsersTab();
        break;
      case 'actions':
        showActionsTab();
        break;
      case 'social':
        showSocialTab();
        break;
      case 'settings':
        showSettingsTab();
        break;
      default:
        adminContent.innerHTML = `
          <div class="bg-surface-800 rounded-lg p-6 mb-6">
            <h3 class="text-xl font-semibold text-white mb-4">${tabId.charAt(0).toUpperCase() + tabId.slice(1)}</h3>
            <p class="text-surface-300">Content for ${tabId} will be displayed here.</p>
          </div>
        `;
    }
  }
  
  // Show dashboard content
  function showDashboard() {
    adminContent.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
        <div class="bg-surface-800 rounded-lg p-4 md:p-6">
          <h3 class="text-lg md:text-xl font-semibold text-white mb-2">Avatars</h3>
          <p class="text-2xl md:text-3xl font-bold text-primary-400">Loading...</p>
        </div>
        <div class="bg-surface-800 rounded-lg p-4 md:p-6">
          <h3 class="text-lg md:text-xl font-semibold text-white mb-2">Active Users</h3>
          <p class="text-2xl md:text-3xl font-bold text-primary-400">Loading...</p>
        </div>
        <div class="bg-surface-800 rounded-lg p-4 md:p-6">
          <h3 class="text-lg md:text-xl font-semibold text-white mb-2">Total Interactions</h3>
          <p class="text-2xl md:text-3xl font-bold text-primary-400">Loading...</p>
        </div>
      </div>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div class="bg-surface-800 rounded-lg p-4 md:p-6">
          <h3 class="text-lg md:text-xl font-semibold text-white mb-4">Recent Activity</h3>
          <div class="animate-pulse space-y-3">
            <div class="h-8 bg-surface-700 rounded w-full"></div>
            <div class="h-8 bg-surface-700 rounded w-full"></div>
            <div class="h-8 bg-surface-700 rounded w-full"></div>
            <div class="h-8 bg-surface-700 rounded w-full"></div>
          </div>
        </div>
        
        <div class="bg-surface-800 rounded-lg p-4 md:p-6">
          <h3 class="text-lg md:text-xl font-semibold text-white mb-4">System Status</h3>
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-surface-300">Server Status</span>
              <span class="text-green-400 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-1">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Online
              </span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-surface-300">Database</span>
              <span class="text-green-400 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-1">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Connected
              </span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-surface-300">API</span>
              <span class="text-green-400 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-1">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Healthy
              </span>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  
  // Show avatars tab
  function showAvatarsTab() {
    adminContent.innerHTML = `
      <div class="bg-surface-800 rounded-lg p-4 md:p-6 mb-6">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
          <h3 class="text-lg md:text-xl font-semibold text-white">Manage Avatars</h3>
          <div class="flex flex-col sm:flex-row gap-2">
            <div class="relative">
              <input type="text" placeholder="Search avatars..." class="px-4 py-2 bg-surface-700 rounded-lg text-surface-300 w-full sm:w-auto">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 absolute right-3 top-2.5 text-surface-400">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <button id="create-avatar-btn" class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg">
              Create Avatar
            </button>
          </div>
        </div>
        
        <div class="overflow-x-auto rounded-lg">
          <table class="w-full text-sm text-left text-surface-300">
            <thead class="text-xs uppercase bg-surface-700 text-surface-300">
              <tr>
                <th scope="col" class="px-4 py-3">Avatar</th>
                <th scope="col" class="px-4 py-3">Name</th>
                <th scope="col" class="px-4 py-3">Status</th>
                <th scope="col" class="px-4 py-3 hidden md:table-cell">Location</th>
                <th scope="col" class="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody id="avatars-table-body" class="divide-y divide-surface-700">
              <!-- Loading animation -->
              <tr>
                <td colspan="5" class="px-4 py-8 text-center">
                  <div class="flex justify-center">
                    <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
                  </div>
                  <p class="mt-2 text-surface-400">Loading avatars...</p>
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
    
    // Fetch avatars data
    fetchAvatars();
  }

  // Show settings tab
  function showSettingsTab() {
    adminContent.innerHTML = `
      <div class="bg-surface-800 rounded-lg p-4 md:p-6 mb-6">
        <h3 class="text-lg md:text-xl font-semibold text-white mb-4">System Settings</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-surface-300 mb-1">Site Name</label>
              <input type="text" value="Moonstone Sanctum" class="w-full px-4 py-2 bg-surface-700 rounded-lg text-white">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-surface-300 mb-1">Maintenance Mode</label>
              <div class="flex items-center space-x-2">
                <div class="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer">
                  <input type="checkbox" id="maintenance-toggle" class="absolute w-6 h-6 opacity-0 cursor-pointer peer">
                  <span class="absolute inset-0 transition-colors duration-200 rounded-full bg-surface-600 peer-checked:bg-primary-600"></span>
                  <span class="absolute inset-y-0 left-0 w-6 h-6 transition-transform duration-200 rounded-full bg-white transform peer-checked:translate-x-6"></span>
                </div>
                <label for="maintenance-toggle" class="text-sm text-surface-300">Off</label>
              </div>
            </div>
          </div>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-surface-300 mb-1">Default Avatar Limit</label>
              <input type="number" value="5" class="w-full px-4 py-2 bg-surface-700 rounded-lg text-white">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-surface-300 mb-1">Registration</label>
              <div class="flex items-center space-x-2">
                <div class="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer">
                  <input type="checkbox" id="registration-toggle" checked class="absolute w-6 h-6 opacity-0 cursor-pointer peer">
                  <span class="absolute inset-0 transition-colors duration-200 rounded-full bg-surface-600 peer-checked:bg-primary-600"></span>
                  <span class="absolute inset-y-0 left-0 w-6 h-6 transition-transform duration-200 rounded-full bg-white transform peer-checked:translate-x-6"></span>
                </div>
                <label for="registration-toggle" class="text-sm text-surface-300">On</label>
              </div>
            </div>
          </div>
        </div>
        
        <div class="mt-6 flex justify-end">
          <button class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg">
            Save Settings
          </button>
        </div>
      </div>
    `;
  }
  
  // Show users tab
  function showUsersTab() {
    adminContent.innerHTML = `
      <div class="bg-surface-800 rounded-lg p-4 md:p-6 mb-6">
        <h3 class="text-lg md:text-xl font-semibold text-white mb-4">User Management</h3>
        <p class="text-surface-300 mb-4">View and manage user accounts.</p>
        
        <div class="overflow-x-auto rounded-lg">
          <table class="w-full text-sm text-left text-surface-300">
            <thead class="text-xs uppercase bg-surface-700 text-surface-300">
              <tr>
                <th scope="col" class="px-4 py-3">User</th>
                <th scope="col" class="px-4 py-3">Wallet</th>
                <th scope="col" class="px-4 py-3 hidden md:table-cell">Joined</th>
                <th scope="col" class="px-4 py-3 hidden md:table-cell">Avatars</th>
                <th scope="col" class="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-surface-700">
              <tr>
                <td colspan="5" class="px-4 py-8 text-center">
                  <div class="flex justify-center">
                    <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
                  </div>
                  <p class="mt-2 text-surface-400">Loading users...</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  }
  
  // Show actions tab
  function showActionsTab() {
    adminContent.innerHTML = `
      <div class="bg-surface-800 rounded-lg p-4 md:p-6 mb-6">
        <h3 class="text-lg md:text-xl font-semibold text-white mb-4">Actions Management</h3>
        <p class="text-surface-300 mb-4">Configure and manage available actions for avatars.</p>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div class="bg-surface-700 p-4 rounded-lg">
            <div class="flex justify-between items-start">
              <div>
                <h4 class="font-medium text-white">Exploration</h4>
                <p class="text-xs text-surface-400 mt-1">Search for resources in the sanctum</p>
              </div>
              <div class="flex items-center space-x-2">
                <div class="relative inline-block w-10 h-5 transition duration-200 ease-in-out rounded-full cursor-pointer">
                  <input type="checkbox" checked class="absolute w-5 h-5 opacity-0 cursor-pointer peer">
                  <span class="absolute inset-0 transition-colors duration-200 rounded-full bg-surface-600 peer-checked:bg-primary-600"></span>
                  <span class="absolute inset-y-0 left-0 w-5 h-5 transition-transform duration-200 rounded-full bg-white transform peer-checked:translate-x-5"></span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="bg-surface-700 p-4 rounded-lg">
            <div class="flex justify-between items-start">
              <div>
                <h4 class="font-medium text-white">Training</h4>
                <p class="text-xs text-surface-400 mt-1">Improve avatar abilities</p>
              </div>
              <div class="flex items-center space-x-2">
                <div class="relative inline-block w-10 h-5 transition duration-200 ease-in-out rounded-full cursor-pointer">
                  <input type="checkbox" checked class="absolute w-5 h-5 opacity-0 cursor-pointer peer">
                  <span class="absolute inset-0 transition-colors duration-200 rounded-full bg-surface-600 peer-checked:bg-primary-600"></span>
                  <span class="absolute inset-y-0 left-0 w-5 h-5 transition-transform duration-200 rounded-full bg-white transform peer-checked:translate-x-5"></span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="bg-surface-700 p-4 rounded-lg">
            <div class="flex justify-between items-start">
              <div>
                <h4 class="font-medium text-white">Crafting</h4>
                <p class="text-xs text-surface-400 mt-1">Create items from resources</p>
              </div>
              <div class="flex items-center space-x-2">
                <div class="relative inline-block w-10 h-5 transition duration-200 ease-in-out rounded-full cursor-pointer">
                  <input type="checkbox" class="absolute w-5 h-5 opacity-0 cursor-pointer peer">
                  <span class="absolute inset-0 transition-colors duration-200 rounded-full bg-surface-600 peer-checked:bg-primary-600"></span>
                  <span class="absolute inset-y-0 left-0 w-5 h-5 transition-transform duration-200 rounded-full bg-white transform peer-checked:translate-x-5"></span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="bg-surface-700 p-4 rounded-lg">
            <div class="flex justify-between items-start">
              <div>
                <h4 class="font-medium text-white">Trading</h4>
                <p class="text-xs text-surface-400 mt-1">Exchange items with other avatars</p>
              </div>
              <div class="flex items-center space-x-2">
                <div class="relative inline-block w-10 h-5 transition duration-200 ease-in-out rounded-full cursor-pointer">
                  <input type="checkbox" class="absolute w-5 h-5 opacity-0 cursor-pointer peer">
                  <span class="absolute inset-0 transition-colors duration-200 rounded-full bg-surface-600 peer-checked:bg-primary-600"></span>
                  <span class="absolute inset-y-0 left-0 w-5 h-5 transition-transform duration-200 rounded-full bg-white transform peer-checked:translate-x-5"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <button class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg">
          Add New Action
        </button>
      </div>
    `;
  }
  
  // Show social tab
  function showSocialTab() {
    adminContent.innerHTML = `
      <div class="bg-surface-800 rounded-lg p-4 md:p-6 mb-6">
        <h3 class="text-lg md:text-xl font-semibold text-white mb-4">Social Feed Moderation</h3>
        <p class="text-surface-300 mb-4">Manage and moderate the social feed content.</p>
        
        <div class="mb-4 flex flex-col sm:flex-row gap-2">
          <div class="relative flex-grow">
            <input type="text" placeholder="Search posts..." class="w-full px-4 py-2 bg-surface-700 rounded-lg text-surface-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 absolute right-3 top-2.5 text-surface-400">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <select class="bg-surface-700 text-surface-300 px-4 py-2 rounded-lg">
            <option>All Posts</option>
            <option>Reported</option>
            <option>Approved</option>
            <option>Pending</option>
          </select>
        </div>
        
        <div class="space-y-4">
          <div class="bg-surface-700 p-4 rounded-lg">
            <div class="flex justify-between">
              <div class="flex items-center">
                <div class="w-10 h-10 bg-primary-700 rounded-full flex items-center justify-center">
                  <span class="text-white text-sm font-bold">AV</span>
                </div>
                <div class="ml-3">
                  <p class="text-white font-medium">Mystic Wanderer</p>
                  <p class="text-xs text-surface-400">2 hours ago</p>
                </div>
              </div>
              <div class="flex space-x-2">
                <button class="text-green-400 hover:text-green-300">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                <button class="text-red-400 hover:text-red-300">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <p class="mt-3 text-surface-300">Discovered a hidden chamber in the eastern wing of the sanctum. The walls are covered in ancient runes that seem to pulse with magical energy.</p>
          </div>
          
          <div class="bg-surface-700 p-4 rounded-lg">
            <div class="flex justify-between">
              <div class="flex items-center">
                <div class="w-10 h-10 bg-primary-700 rounded-full flex items-center justify-center">
                  <span class="text-white text-sm font-bold">SR</span>
                </div>
                <div class="ml-3">
                  <p class="text-white font-medium">Shadow Rogue</p>
                  <p class="text-xs text-surface-400">5 hours ago</p>
                </div>
              </div>
              <div class="flex space-x-2">
                <button class="text-green-400 hover:text-green-300">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                <button class="text-red-400 hover:text-red-300">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <p class="mt-3 text-surface-300">Looking for a group to explore the catacombs beneath the sanctum. Bring your own light sources, it gets dark down there.</p>
          </div>
        </div>
      </div>
    `;
  }

  // Show create avatar form
  function showCreateAvatarForm() {
    const createAvatarForm = `
      <div class="bg-surface-800 rounded-lg p-4 md:p-6 mb-6">
        <h3 class="text-lg md:text-xl font-semibold text-white mb-4">Create New Avatar</h3>
        
        <form id="avatar-form" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-surface-300 mb-1">Avatar Name</label>
            <input type="text" id="avatar-name" required class="w-full px-4 py-2 bg-surface-700 rounded-lg text-white">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-surface-300 mb-1">Description</label>
            <textarea id="avatar-description" rows="3" class="w-full px-4 py-2 bg-surface-700 rounded-lg text-white"></textarea>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-surface-300 mb-1">Class</label>
              <select id="avatar-class" class="w-full px-4 py-2 bg-surface-700 rounded-lg text-white">
                <option value="warrior">Warrior</option>
                <option value="mage">Mage</option>
                <option value="rogue">Rogue</option>
                <option value="healer">Healer</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-surface-300 mb-1">Starting Location</label>
              <select id="avatar-location" class="w-full px-4 py-2 bg-surface-700 rounded-lg text-white">
                <option value="sanctuary">Sanctuary</option>
                <option value="forest">Enchanted Forest</option>
                <option value="mountain">Crystal Mountains</option>
                <option value="cavern">Shadow Caverns</option>
              </select>
            </div>
          </div>
          
          <div class="pt-4 flex justify-end space-x-3">
            <button type="button" id="cancel-avatar" class="px-4 py-2 bg-surface-700 text-white rounded-lg hover:bg-surface-600">
              Cancel
            </button>
            <button type="submit" class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              Create Avatar
            </button>
          </div>
        </form>
      </div>
    `;
    
    adminContent.innerHTML = createAvatarForm;
    
    // Add event listeners
    document.getElementById('cancel-avatar').addEventListener('click', () => {
      showAvatarsTab();
    });
    
    document.getElementById('avatar-form').addEventListener('submit', (e) => {
      e.preventDefault();
      createAvatar();
    });
  }
  
  // Create avatar
  async function createAvatar() {
    const nameInput = document.getElementById('avatar-name');
    const descInput = document.getElementById('avatar-description');
    const classSelect = document.getElementById('avatar-class');
    const locationSelect = document.getElementById('avatar-location');
    
    if (!nameInput || !descInput || !classSelect || !locationSelect) {
      showToast('Form elements not found', 'error');
      return;
    }
    
    const avatarData = {
      name: nameInput.value,
      description: descInput.value,
      class: classSelect.value,
      location: locationSelect.value
    };
    
    try {
      const response = await fetch('/api/admin/avatars', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(avatarData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      showToast('Avatar created successfully!', 'success');
      showAvatarsTab();
      
    } catch (error) {
      console.error('Error creating avatar:', error);
      showToast('Failed to create avatar. Please try again.', 'error');
    }
  }
  
  // Fetch avatars
  async function fetchAvatars() {
    try {
      const response = await fetch('/api/admin/avatars');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Update the table with avatar data
      const tableBody = document.getElementById('avatars-table-body');
      if (tableBody) {
        if (data.avatars && data.avatars.length > 0) {
          tableBody.innerHTML = data.avatars.map(avatar => `
            <tr class="hover:bg-surface-700">
              <td class="px-4 py-3 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="w-10 h-10 bg-primary-700 rounded-full flex items-center justify-center mr-3">
                    <span class="text-white text-sm font-bold">${avatar.name.substring(0, 2).toUpperCase()}</span>
                  </div>
                  <img src="${avatar.image || ''}" alt="" class="w-10 h-10 rounded-full ${avatar.image ? '' : 'hidden'}">
                </div>
              </td>
              <td class="px-4 py-3 whitespace-nowrap">
                <div>
                  <div class="font-medium text-white">${avatar.name}</div>
                  <div class="text-xs text-surface-400">${avatar.class || 'Unknown'}</div>
                </div>
              </td>
              <td class="px-4 py-3 whitespace-nowrap">
                <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  avatar.status === 'active' ? 'bg-green-900 text-green-300' :
                  avatar.status === 'inactive' ? 'bg-red-900 text-red-300' :
                  'bg-yellow-900 text-yellow-300'
                }">
                  ${avatar.status || 'Unknown'}
                </span>
              </td>
              <td class="px-4 py-3 whitespace-nowrap hidden md:table-cell">
                <span class="text-surface-300">${avatar.location || 'Unknown'}</span>
              </td>
              <td class="px-4 py-3 whitespace-nowrap">
                <div class="flex space-x-2">
                  <button data-avatar-id="${avatar._id}" class="text-surface-400 hover:text-white edit-avatar-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                  </button>
                  <button data-avatar-id="${avatar._id}" class="text-surface-400 hover:text-red-400 delete-avatar-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          `).join('');
          
          // Add event listeners for edit and delete buttons
          document.querySelectorAll('.edit-avatar-btn').forEach(button => {
            button.addEventListener('click', (e) => {
              const avatarId = e.currentTarget.getAttribute('data-avatar-id');
              console.log(`Edit avatar: ${avatarId}`);
              // Implement edit functionality
            });
          });
          
          document.querySelectorAll('.delete-avatar-btn').forEach(button => {
            button.addEventListener('click', (e) => {
              const avatarId = e.currentTarget.getAttribute('data-avatar-id');
              console.log(`Delete avatar: ${avatarId}`);
              // Implement delete functionality
            });
          });
        } else {
          tableBody.innerHTML = `
            <tr>
              <td colspan="5" class="px-4 py-6 text-center text-surface-400">
                No avatars found. Click "Create Avatar" to add a new one.
              </td>
            </tr>
          `;
        }
      }
      
    } catch (error) {
      console.error('Error fetching avatars:', error);
      showToast('Failed to load avatars', 'error');
      
      const tableBody = document.getElementById('avatars-table-body');
      if (tableBody) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="5" class="px-4 py-6 text-center text-red-400">
              Error loading avatars. Please try again.
            </td>
          </tr>
        `;
      }
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
        avatarCount: avatarsData.total || avatarsData.avatars?.length || 0,
        userCount: 0, // To be implemented
        interactionCount: 0 // To be implemented
      });
      
    } catch (error) {
      console.error('Error fetching admin data:', error);
      showToast('Error loading admin data', 'error');
    }
  }
  
  // Update dashboard stats
  function updateDashboardStats(stats) {
    const dashboardItems = document.querySelectorAll('.bg-surface-800 .text-2xl, .bg-surface-800 .text-3xl');
    if (dashboardItems.length >= 3) {
      // Update avatar count
      dashboardItems[0].textContent = stats.avatarCount;
      
      // Update user count
      dashboardItems[1].textContent = stats.userCount || '0';
      
      // Update interaction count
      dashboardItems[2].textContent = stats.interactionCount || '0';
    }
  }
  
  // Show toast notification
  function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;
    
    const toast = document.createElement('div');
    toast.className = `toast p-4 rounded-lg shadow-lg max-w-xs ${
      type === 'success' ? 'bg-green-800 text-green-100' :
      type === 'error' ? 'bg-red-800 text-red-100' :
      'bg-primary-800 text-primary-100'
    }`;
    
    toast.textContent = message;
    toastContainer.appendChild(toast);
    
    // Remove toast after animation completes
    setTimeout(() => {
      toast.remove();
    }, 3000);
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
