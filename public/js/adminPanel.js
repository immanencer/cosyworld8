// Admin Panel Module
const AdminPanel = (() => {
  // DOM elements
  const adminPanel = document.getElementById('adminPanel');
  const adminModalToggle = document.getElementById('adminModalToggle');
  const adminModal = document.getElementById('adminModal');
  const adminTabs = document.getElementById('adminTabs');
  const adminContent = document.getElementById('admin-content');
  const closeModal = document.getElementById('closeModal');

  // Configuration data
  let serverConfig = {
    servers: [],
    emojis: {
      summon: "🔮",
      breed: "🏹",
      attack: "⚔️",
      defend: "🛡️"
    },
    prompts: {
      introduction: "You have been summoned to this realm. This is your one chance to impress me, and save yourself from Elimination. Good luck, and DONT fuck it up.",
      summon: "Create a unique avatar with a special ability."
    }
  };

  // Initialize admin panel
  function init() {
    console.log('Trying to initialize admin panel');

    // Check if admin elements exist
    if (!adminPanel || !adminModalToggle || !adminModal || !adminTabs || !adminContent) {
      console.log('Admin panel elements not found. Initialization skipped.');
      return;
    }

    console.log('Initializing admin panel');

    // Add event listeners
    if (adminModalToggle) {
      adminModalToggle.addEventListener('click', function() {
        adminModal.classList.toggle('hidden');
        fetchAdminData();
      });
    }

    if (closeModal) {
      closeModal.addEventListener('click', function() {
        adminModal.classList.add('hidden');
      });
    }

    // Setup admin tab buttons
    setupAdminTabs();
  }

  // Setup admin tab functionality
  function setupAdminTabs() {
    const tabs = adminTabs.querySelectorAll('button');
    tabs.forEach(tab => {
      tab.addEventListener('click', function() {
        // Remove active class from all tabs
        tabs.forEach(t => {
          t.classList.remove('bg-primary-600', 'text-white');
          t.classList.add('text-surface-300', 'hover:text-white');
        });

        // Add active class to clicked tab
        this.classList.remove('text-surface-300', 'hover:text-white');
        this.classList.add('bg-primary-600', 'text-white');

        // Show content for this tab
        const tabId = this.getAttribute('data-tab');
        console.log('Showing tab content for:', tabId);

        switch(tabId) {
          case 'dashboard':
            showDashboardTab();
            break;
          case 'avatars':
            showAvatarsTab();
            break;
          case 'settings':
            showSettingsTab();
            break;
          case 'servers':
            showServersTab();
            break;
          case 'tools':
            showToolsTab();
            break;
        }
      });
    });

    // Set dashboard as default active tab
    tabs[0].click();
  }


  // Fetch admin data from the server
  async function fetchAdminData() {
    try {
      const response = await fetch('/api/admin/config');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      updateAdminUI(data);
    } catch (error) {
      console.log('Error fetching admin data:', error);
    }

    try {
      const serverResponse = await fetch('/api/admin/servers');
      const serverData = await serverResponse.json();
      if (serverData.servers) {
        serverConfig.servers = serverData.servers;
        if (document.querySelector('button[data-tab="servers"].bg-primary-600')) {
          showServersTab();
        }
      }
    } catch (error) {
      console.error('Error fetching servers:', error);
    }

    try {
      const emojiResponse = await fetch('/api/admin/config/emojis');
      const emojiData = await emojiResponse.json();
      if (emojiData.emojis) {
        serverConfig.emojis = emojiData.emojis;
      }
      if (emojiData.prompts) {
        serverConfig.prompts = emojiData.prompts;
      }
      if (document.querySelector('button[data-tab="tools"].bg-primary-600')) {
        showToolsTab();
      }
    } catch (error) {
      console.error('Error fetching emoji config:', error);
    }
  }

  function updateAdminUI(data) {
    if (data.stats) {
      document.getElementById('avatarCount').textContent = data.stats.avatarCount || 0;
      document.getElementById('userCount').textContent = data.stats.userCount || 0;
      document.getElementById('messageCount').textContent = data.stats.messageCount || 0;
    }
  }

  // Tab content generators
  function showDashboardTab() {
    adminContent.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div class="bg-surface-800 rounded-lg p-4 flex flex-col justify-between">
          <div>
            <span class="text-surface-400 text-sm">Total Avatars</span>
            <h3 class="text-2xl font-bold text-white" id="avatarCount">--</h3>
          </div>
          <div class="flex justify-between items-center mt-4">
            <span class="text-surface-400 text-xs">24% increase</span>
            <svg class="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
          </div>
        </div>

        <div class="bg-surface-800 rounded-lg p-4 flex flex-col justify-between">
          <div>
            <span class="text-surface-400 text-sm">Total Users</span>
            <h3 class="text-2xl font-bold text-white" id="userCount">--</h3>
          </div>
          <div class="flex justify-between items-center mt-4">
            <span class="text-surface-400 text-xs">12% increase</span>
            <svg class="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
          </div>
        </div>

        <div class="bg-surface-800 rounded-lg p-4 flex flex-col justify-between">
          <div>
            <span class="text-surface-400 text-sm">Messages</span>
            <h3 class="text-2xl font-bold text-white" id="messageCount">--</h3>
          </div>
          <div class="flex justify-between items-center mt-4">
            <span class="text-surface-400 text-xs">18% increase</span>
            <svg class="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-surface-800 rounded-lg p-4 md:p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold text-white">Recent Activity</h3>
            <button class="text-primary-500 hover:text-primary-400 text-sm">View all</button>
          </div>

          <div class="space-y-4">
            <div class="flex items-center p-2 hover:bg-surface-700 rounded-lg transition-colors">
              <div class="w-10 h-10 bg-primary-700 rounded-full flex items-center justify-center">
                <span class="text-white text-sm font-bold">🧙</span>
              </div>
              <div class="ml-4">
                <p class="text-white">New avatar summoned</p>
                <p class="text-surface-400 text-sm">5 minutes ago</p>
              </div>
            </div>

            <div class="flex items-center p-2 hover:bg-surface-700 rounded-lg transition-colors">
              <div class="w-10 h-10 bg-rose-700 rounded-full flex items-center justify-center">
                <span class="text-white text-sm font-bold">⚔️</span>
              </div>
              <div class="ml-4">
                <p class="text-white">Combat occurred</p>
                <p class="text-surface-400 text-sm">12 minutes ago</p>
              </div>
            </div>

            <div class="flex items-center p-2 hover:bg-surface-700 rounded-lg transition-colors">
              <div class="w-10 h-10 bg-amber-700 rounded-full flex items-center justify-center">
                <span class="text-white text-sm font-bold">🏹</span>
              </div>
              <div class="ml-4">
                <p class="text-white">New avatar bred</p>
                <p class="text-surface-400 text-sm">25 minutes ago</p>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-surface-800 rounded-lg p-4 md:p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold text-white">System Status</h3>
            <span class="px-2 py-1 bg-emerald-500 text-xs text-white rounded-full">All Systems Normal</span>
          </div>

          <div class="space-y-4">
            <div>
              <div class="flex justify-between mb-1">
                <span class="text-surface-300">Server Load</span>
                <span class="text-surface-300">28%</span>
              </div>
              <div class="w-full bg-surface-700 rounded-full h-2">
                <div class="bg-emerald-500 h-2 rounded-full" style="width: 28%"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between mb-1">
                <span class="text-surface-300">Database</span>
                <span class="text-surface-300">45%</span>
              </div>
              <div class="w-full bg-surface-700 rounded-full h-2">
                <div class="bg-emerald-500 h-2 rounded-full" style="width: 45%"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between mb-1">
                <span class="text-surface-300">API Rate Limit</span>
                <span class="text-surface-300">62%</span>
              </div>
              <div class="w-full bg-surface-700 rounded-full h-2">
                <div class="bg-amber-500 h-2 rounded-full" style="width: 62%"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function showAvatarsTab() {
    adminContent.innerHTML = `
      <div class="bg-surface-800 rounded-lg p-4 md:p-6 mb-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg md:text-xl font-semibold text-white">Avatars Overview</h3>
          <button class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm">Add New Avatar</button>
        </div>

        <div class="mb-4 flex flex-col sm:flex-row gap-2">
          <div class="relative flex-grow">
            <input type="text" placeholder="Search avatars..." class="w-full px-4 py-2 bg-surface-700 rounded-lg text-surface-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 absolute right-3 top-2.5 text-surface-400">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <select class="bg-surface-700 text-surface-300 px-4 py-2 rounded-lg">
            <option>All Avatars</option>
            <option>Active</option>
            <option>Dead</option>
            <option>Recently Created</option>
          </select>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-surface-700">
            <thead class="bg-surface-700">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-surface-300 uppercase tracking-wider">Name</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-surface-300 uppercase tracking-wider">Status</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-surface-300 uppercase tracking-wider">Location</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-surface-300 uppercase tracking-wider">Created</th>
                <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-surface-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-surface-800 divide-y divide-surface-700">
              <tr class="hover:bg-surface-700">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10 rounded-full bg-primary-700 flex items-center justify-center">
                      <span class="text-white">🧙</span>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-white">Eldrin the Wise</div>
                      <div class="text-sm text-surface-400">Wizard</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-100 text-emerald-800">Active</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-surface-300">Mystic Forest</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-surface-300">2 days ago</td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button class="text-primary-500 hover:text-primary-400 mr-3">Edit</button>
                  <button class="text-rose-500 hover:text-rose-400">Delete</button>
                </td>
              </tr>
              <tr class="hover:bg-surface-700">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10 rounded-full bg-rose-700 flex items-center justify-center">
                      <span class="text-white">🔥</span>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-white">Pyra Flameheart</div>
                      <div class="text-sm text-surface-400">Fire Mage</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-100 text-emerald-800">Active</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-surface-300">Volcanic Peaks</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-surface-300">5 days ago</td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button class="text-primary-500 hover:text-primary-400 mr-3">Edit</button>
                  <button class="text-rose-500 hover:text-rose-400">Delete</button>
                </td>
              </tr>
              <tr class="hover:bg-surface-700">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10 rounded-full bg-blue-700 flex items-center justify-center">
                      <span class="text-white">❄️</span>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-white">Frost Whisper</div>
                      <div class="text-sm text-surface-400">Ice Elementalist</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-rose-100 text-rose-800">Dead</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-surface-300">Frozen Wastes</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-surface-300">1 week ago</td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button class="text-primary-500 hover:text-primary-400 mr-3">Edit</button>
                  <button class="text-rose-500 hover:text-rose-400">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex justify-between items-center mt-4">
          <span class="text-sm text-surface-400">Showing 3 of 120 avatars</span>
          <div class="flex space-x-2">
            <button class="px-3 py-1 bg-surface-700 text-white rounded-lg hover:bg-surface-600">&lt;</button>
            <button class="px-3 py-1 bg-primary-600 text-white rounded-lg">1</button>
            <button class="px-3 py-1 bg-surface-700 text-white rounded-lg hover:bg-surface-600">2</button>
            <button class="px-3 py-1 bg-surface-700 text-white rounded-lg hover:bg-surface-600">3</button>
            <button class="px-3 py-1 bg-surface-700 text-white rounded-lg hover:bg-surface-600">&gt;</button>
          </div>
        </div>
      </div>
    `;
  }

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
              <label class="block text-sm font-medium text-surface-300 mb-1">Default Language</label>
              <select class="w-full px-4 py-2 bg-surface-700 rounded-lg text-white">
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
                <option>German</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-surface-300 mb-1">Allow Guest Access</label>
              <div class="flex items-center space-x-2">
                <div class="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer">
                  <input type="checkbox" id="guest-toggle" class="absolute w-6 h-6 opacity-0 cursor-pointer peer" checked>
                  <span class="absolute inset-0 transition-colors duration-200 rounded-full bg-surface-600 peer-checked:bg-primary-600"></span>
                  <span class="absolute inset-y-0 left-0 w-6 h-6 transition-transform duration-200 rounded-full bg-white transform peer-checked:translate-x-6"></span>
                </div>
                <label for="guest-toggle" class="text-sm text-surface-300">On</label>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-6">
          <h4 class="text-md font-medium text-white mb-3">Feature Toggles</h4>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-surface-700 p-3 rounded-lg">
              <div class="flex items-center justify-between">
                <span class="text-white">Avatar Breeding</span>
                <div class="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer">
                  <input type="checkbox" id="feature-breeding" class="absolute w-6 h-6 opacity-0 cursor-pointer peer" checked>
                  <span class="absolute inset-0 transition-colors duration-200 rounded-full bg-surface-600 peer-checked:bg-primary-600"></span>
                  <span class="absolute inset-y-0 left-0 w-6 h-6 transition-transform duration-200 rounded-full bg-white transform peer-checked:translate-x-6"></span>
                </div>
              </div>
            </div>

            <div class="bg-surface-700 p-3 rounded-lg">
              <div class="flex items-center justify-between">
                <span class="text-white">Combat System</span>
                <div class="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer">
                  <input type="checkbox" id="feature-combat" class="absolute w-6 h-6 opacity-0 cursor-pointer peer" checked>
                  <span class="absolute inset-0 transition-colors duration-200 rounded-full bg-surface-600 peer-checked:bg-primary-600"></span>
                  <span class="absolute inset-y-0 left-0 w-6 h-6 transition-transform duration-200 rounded-full bg-white transform peer-checked:translate-x-6"></span>
                </div>
              </div>
            </div>

            <div class="bg-surface-700 p-3 rounded-lg">
              <div class="flex items-center justify-between">
                <span class="text-white">Item Creation</span>
                <div class="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer">
                  <input type="checkbox" id="feature-items" class="absolute w-6 h-6 opacity-0 cursor-pointer peer" checked>
                  <span class="absolute inset-0 transition-colors duration-200 rounded-full bg-surface-600 peer-checked:bg-primary-600"></span>
                  <span class="absolute inset-y-0 left-0 w-6 h-6 transition-transform duration-200 rounded-full bg-white transform peer-checked:translate-x-6"></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-6 flex justify-end">
          <button class="px-4 py-2 bg-surface-700 text-white rounded-lg hover:bg-surface-600 mr-2">Cancel</button>
          <button class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Save Changes</button>
        </div>
      </div>
    `;
  }

  function showServersTab() {
    let serversHtml = '';
    if (serverConfig.servers && serverConfig.servers.length > 0) {
      serversHtml = serverConfig.servers.map(server => `
        <div class="bg-surface-700 p-4 rounded-lg mb-4">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between">
            <div class="flex items-center mb-2 md:mb-0">
              <div class="w-12 h-12 bg-primary-700 rounded-lg flex items-center justify-center text-xl">
                ${server.icon || '🖥️'}
              </div>
              <div class="ml-3">
                <h4 class="text-white font-medium">${server.name || 'Unknown Server'}</h4>
                <p class="text-surface-400 text-sm">${server.id || 'No ID'}</p>
              </div>
            </div>
            <div class="flex items-center">
              <span class="px-2 py-1 bg-emerald-500 text-xs text-white rounded-full mr-4">Connected</span>
              <button class="text-white bg-primary-600 hover:bg-primary-700 px-3 py-1 rounded" data-server-id="${server.id}">Manage</button>
            </div>
          </div>
        </div>
      `).join('');
    } else {
      serversHtml = `
        <div class="bg-surface-700 p-6 rounded-lg text-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-surface-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
          </svg>
          <p class="text-white font-medium mb-2">No Servers Connected</p>
          <p class="text-surface-400 mb-4">There are no Discord servers connected to your application.</p>
          <button class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Connect a Server</button>
        </div>
      `;
    }

    adminContent.innerHTML = `
      <div class="bg-surface-800 rounded-lg p-4 md:p-6 mb-6">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg md:text-xl font-semibold text-white">Connected Servers</h3>
          <button class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Add Server</button>
        </div>

        <div class="space-y-4">
          ${serversHtml}
        </div>

        <div class="mt-8">
          <h4 class="text-md font-medium text-white mb-4">Server Configuration</h4>
          <div class="bg-surface-700 p-4 rounded-lg">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label class="block text-sm font-medium text-surface-300 mb-1">Prefix</label>
                <input type="text" value="!" class="w-full px-4 py-2 bg-surface-600 rounded-lg text-white">
              </div>
              <div>
                <label class="block text-sm font-medium text-surface-300 mb-1">Avatar Limit Per User</label>
                <input type="number" value="5" class="w-full px-4 py-2 bg-surface-600 rounded-lg text-white">
              </div>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-surface-300 mb-1">Whitelisted Channels</label>
              <div class="bg-surface-600 px-4 py-2 rounded-lg flex flex-wrap items-center">
                <span class="bg-primary-600 text-white text-xs px-2 py-1 rounded mr-2 mb-2">#general <button class="ml-1">×</button></span>
                <span class="bg-primary-600 text-white text-xs px-2 py-1 rounded mr-2 mb-2">#bot-commands <button class="ml-1">×</button></span>
                <span class="bg-primary-600 text-white text-xs px-2 py-1 rounded mr-2 mb-2">#roleplay <button class="ml-1">×</button></span>
                <input type="text" placeholder="Add channel..." class="bg-transparent text-white border-none focus:outline-none flex-grow mb-2">
              </div>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-surface-300 mb-1">Admin Roles</label>
              <div class="bg-surface-600 px-4 py-2 rounded-lg flex flex-wrap items-center">
                <span class="bg-primary-600 text-white text-xs px-2 py-1 rounded mr-2 mb-2">Admin <button class="ml-1">×</button></span>
                <span class="bg-primary-600 text-white text-xs px-2 py-1 rounded mr-2 mb-2">Moderator <button class="ml-1">×</button></span>
                <input type="text" placeholder="Add role..." class="bg-transparent text-white border-none focus:outline-none flex-grow mb-2">
              </div>
            </div>

            <div class="flex justify-end">
              <button class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Save Server Config</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function showToolsTab() {
    const emojiInputs = Object.entries(serverConfig.emojis).map(([key, value]) => `
      <div class="mb-4">
        <label class="block text-sm font-medium text-surface-300 mb-1">${key.charAt(0).toUpperCase() + key.slice(1)} Emoji</label>
        <input type="text" value="${value}" class="w-full px-4 py-2 bg-surface-600 rounded-lg text-white emoji-input" data-emoji-type="${key}">
      </div>
    `).join('');

    const promptInputs = Object.entries(serverConfig.prompts).map(([key, value]) => `
      <div class="mb-4">
        <label class="block text-sm font-medium text-surface-300 mb-1">${key.charAt(0).toUpperCase() + key.slice(1)} Prompt</label>
        <textarea class="w-full px-4 py-2 bg-surface-600 rounded-lg text-white h-24 prompt-input" data-prompt-type="${key}">${value}</textarea>
      </div>
    `).join('');

    adminContent.innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-surface-800 rounded-lg p-4 md:p-6">
          <h3 class="text-lg font-semibold text-white mb-4">Command Emoji Configuration</h3>
          <p class="text-surface-300 mb-4">Configure the emojis used for different actions in the system.</p>

          <form id="emojiConfigForm">
            ${emojiInputs}

            <button type="submit" class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Save Emoji Config</button>
          </form>
        </div>

        <div class="bg-surface-800 rounded-lg p-4 md:p-6">
          <h3 class="text-lg font-semibold text-white mb-4">Prompt Configuration</h3>
          <p class="text-surface-300 mb-4">Configure the system prompts used for avatar generation and interactions.</p>

          <form id="promptConfigForm">
            ${promptInputs}

            <button type="submit" class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Save Prompt Config</button>
          </form>
        </div>
      </div>
    `;

    document.getElementById('emojiConfigForm').addEventListener('submit', function(e) {
      e.preventDefault();
      const emojiInputs = document.querySelectorAll('.emoji-input');
      const newEmojis = {};

      emojiInputs.forEach(input => {
        newEmojis[input.dataset.emojiType] = input.value;
      });

      serverConfig.emojis = newEmojis;

      fetch('/api/admin/config/emojis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ emojis: newEmojis })
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          alert('Emoji configuration saved successfully!');
        } else {
          alert('Error saving emoji configuration');
        }
      })
      .catch(error => {
        console.error('Error saving emoji config:', error);
        alert('Error saving configuration');
      });
    });

    document.getElementById('promptConfigForm').addEventListener('submit', function(e) {
      e.preventDefault();
      const promptInputs = document.querySelectorAll('.prompt-input');
      const newPrompts = {};

      promptInputs.forEach(input => {
        newPrompts[input.dataset.promptType] = input.value;
      });

      serverConfig.prompts = newPrompts;

      fetch('/api/admin/config/prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompts: newPrompts })
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          alert('Prompt configuration saved successfully!');
        } else {
          alert('Error saving prompt configuration');
        }
      })
      .catch(error => {
        console.error('Error saving prompt config:', error);
        alert('Error saving configuration');
      });
    });
  }

  // Return public methods
  return {
    init
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  AdminPanel.init();
});