
// Admin Panel Module
const AdminPanel = (() => {
  // DOM elements
  let adminPanel;
  let adminModalToggle;
  let adminModal;
  let adminTabs;
  let adminContent;
  let closeModal;

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

    // Get DOM elements
    adminPanel = document.getElementById('adminPanel');
    adminModalToggle = document.getElementById('adminModalToggle');
    adminModal = document.getElementById('adminModal');
    adminTabs = document.getElementById('adminTabs');
    adminContent = document.getElementById('admin-content');
    closeModal = document.getElementById('closeModal');

    // Check if admin elements exist
    if (!adminModal || !adminModalToggle) {
      console.log('Admin panel elements not found. Initialization skipped.');
      return;
    }

    console.log('Initializing admin panel');

    // Add event listeners
    adminModalToggle.addEventListener('click', function() {
      adminModal.classList.toggle('hidden');
      fetchAdminData();
    });

    closeModal.addEventListener('click', function() {
      adminModal.classList.add('hidden');
    });

    // Tab navigation
    const tabButtons = adminTabs.querySelectorAll('button[data-tab]');
    tabButtons.forEach(button => {
      button.addEventListener('click', function() {
        const tabName = this.getAttribute('data-tab');
        
        // Update active tab styling
        tabButtons.forEach(btn => {
          btn.classList.remove('bg-primary-600');
          btn.classList.add('bg-surface-700');
        });
        this.classList.remove('bg-surface-700');
        this.classList.add('bg-primary-600');
        
        console.log('Showing tab content for:', tabName);
        
        // Show appropriate content
        switch(tabName) {
          case 'dashboard':
            showDashboardTab();
            break;
          case 'avatars':
            showAvatarsTab();
            break;
          case 'servers':
            showServersTab();
            break;
          case 'tools':
            showToolsTab();
            break;
          case 'settings':
            showSettingsTab();
            break;
        }
      });
    });

    // Show dashboard tab by default
    document.querySelector('button[data-tab="dashboard"]').click();
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
      if (serverResponse.ok) {
        const serverData = await serverResponse.json();
        if (serverData.servers) {
          serverConfig.servers = serverData.servers;
          if (document.querySelector('button[data-tab="servers"].bg-primary-600')) {
            showServersTab();
          }
        }
      }
    } catch (error) {
      console.error('Error fetching servers:', error);
    }

    try {
      const emojiResponse = await fetch('/api/admin/config/emojis');
      if (emojiResponse.ok) {
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
      }
    } catch (error) {
      console.error('Error fetching emoji config:', error);
    }
  }

  function updateAdminUI(data) {
    if (data.stats) {
      const avatarCount = document.getElementById('avatarCount');
      const userCount = document.getElementById('userCount');
      const messageCount = document.getElementById('messageCount');
      
      if (avatarCount) avatarCount.textContent = data.stats.avatarCount || 0;
      if (userCount) userCount.textContent = data.stats.userCount || 0;
      if (messageCount) messageCount.textContent = data.stats.messageCount || 0;
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
            <span class="text-surface-400 text-sm">Active Users</span>
            <h3 class="text-2xl font-bold text-white" id="userCount">--</h3>
          </div>
          <div class="flex justify-between items-center mt-4">
            <span class="text-surface-400 text-xs">12% increase</span>
            <svg class="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
          </div>
        </div>
        
        <div class="bg-surface-800 rounded-lg p-4 flex flex-col justify-between">
          <div>
            <span class="text-surface-400 text-sm">Total Messages</span>
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
          <h3 class="text-lg md:text-xl font-semibold text-white mb-4">System Status</h3>
          <div class="space-y-4">
            <div>
              <div class="flex justify-between mb-1">
                <span class="text-surface-300">Server Load</span>
                <span class="text-surface-300">28%</span>
              </div>
              <div class="w-full bg-surface-700 rounded-full h-2">
                <div class="bg-blue-500 h-2 rounded-full" style="width: 28%"></div>
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
        
        <div class="bg-surface-800 rounded-lg p-4 md:p-6">
          <h3 class="text-lg md:text-xl font-semibold text-white mb-4">Recent Activity</h3>
          <div class="space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-surface-700 flex items-center justify-center text-lg">🧙</div>
              <div class="flex-1">
                <p class="text-white">New avatar created</p>
                <p class="text-surface-400 text-sm">10 minutes ago</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-surface-700 flex items-center justify-center text-lg">🏆</div>
              <div class="flex-1">
                <p class="text-white">Dungeon cleared</p>
                <p class="text-surface-400 text-sm">25 minutes ago</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-surface-700 flex items-center justify-center text-lg">💬</div>
              <div class="flex-1">
                <p class="text-white">New chat thread started</p>
                <p class="text-surface-400 text-sm">45 minutes ago</p>
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
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-surface-700">
            <thead>
              <tr>
                <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-surface-400 uppercase tracking-wider">Name</th>
                <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-surface-400 uppercase tracking-wider">Model</th>
                <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-surface-400 uppercase tracking-wider">Status</th>
                <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-surface-400 uppercase tracking-wider">Created</th>
                <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-surface-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-surface-700">
              <tr>
                <td class="px-4 py-3 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="h-8 w-8 rounded-full bg-surface-700 flex items-center justify-center text-lg">🧙</div>
                    <div class="ml-3">
                      <div class="text-sm font-medium text-white">Gandalf</div>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <div class="text-sm text-surface-300">Claude</div>
                </td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-surface-300">3 days ago</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm font-medium">
                  <button class="text-primary-500 hover:text-primary-400 mr-3">Edit</button>
                  <button class="text-red-500 hover:text-red-400">Delete</button>
                </td>
              </tr>
              <tr>
                <td class="px-4 py-3 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="h-8 w-8 rounded-full bg-surface-700 flex items-center justify-center text-lg">🧝</div>
                    <div class="ml-3">
                      <div class="text-sm font-medium text-white">Legolas</div>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <div class="text-sm text-surface-300">GPT-4</div>
                </td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-surface-300">1 week ago</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm font-medium">
                  <button class="text-primary-500 hover:text-primary-400 mr-3">Edit</button>
                  <button class="text-red-500 hover:text-red-400">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function showServersTab() {
    let serversHTML = '';
    
    if (serverConfig.servers && serverConfig.servers.length > 0) {
      serversHTML = serverConfig.servers.map(server => `
        <tr>
          <td class="px-4 py-3 whitespace-nowrap">
            <div class="flex items-center">
              <div class="ml-1">
                <div class="text-sm font-medium text-white">${server.name || 'Unnamed Server'}</div>
                <div class="text-xs text-surface-400">${server.id || 'No ID'}</div>
              </div>
            </div>
          </td>
          <td class="px-4 py-3 whitespace-nowrap">
            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${server.status === 'online' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">${server.status || 'Unknown'}</span>
          </td>
          <td class="px-4 py-3 whitespace-nowrap text-sm text-surface-300">${server.users || 0}</td>
          <td class="px-4 py-3 whitespace-nowrap text-sm text-surface-300">${server.avatars || 0}</td>
          <td class="px-4 py-3 whitespace-nowrap text-sm font-medium">
            <button class="text-primary-500 hover:text-primary-400 mr-3">Configure</button>
            <button class="text-red-500 hover:text-red-400">Disconnect</button>
          </td>
        </tr>
      `).join('');
    } else {
      serversHTML = `
        <tr>
          <td colspan="5" class="px-4 py-8 text-center text-surface-400">
            No servers connected. Click "Add Server" to connect a new Discord server.
          </td>
        </tr>
      `;
    }

    adminContent.innerHTML = `
      <div class="bg-surface-800 rounded-lg p-4 md:p-6 mb-6">
        <div class="flex flex-wrap justify-between items-center mb-4 gap-2">
          <h3 class="text-lg md:text-xl font-semibold text-white">Connected Servers</h3>
          <button class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm">Add Server</button>
        </div>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-surface-700">
            <thead>
              <tr>
                <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-surface-400 uppercase tracking-wider">Server</th>
                <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-surface-400 uppercase tracking-wider">Status</th>
                <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-surface-400 uppercase tracking-wider">Users</th>
                <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-surface-400 uppercase tracking-wider">Avatars</th>
                <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-surface-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-surface-700">
              ${serversHTML}
            </tbody>
          </table>
        </div>
      </div>
    `;

    // Add server button functionality
    const addServerBtn = adminContent.querySelector('button');
    addServerBtn.addEventListener('click', function() {
      const newServer = {
        id: 'server-' + Math.floor(Math.random() * 1000),
        name: 'New Discord Server',
        status: 'online',
        users: Math.floor(Math.random() * 100),
        avatars: Math.floor(Math.random() * 10)
      };
      
      serverConfig.servers.push(newServer);
      showServersTab(); // Refresh the tab
    });
  }

  function showToolsTab() {
    adminContent.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-surface-800 rounded-lg p-4 md:p-6">
          <h3 class="text-lg md:text-xl font-semibold text-white mb-4">Custom Emojis</h3>
          <p class="text-surface-300 mb-4">Configure the emojis used for different actions in the game.</p>
          
          <div class="space-y-4">
            <div>
              <label class="block text-surface-300 text-sm font-medium mb-2">Summon Emoji</label>
              <div class="flex">
                <input type="text" id="summonEmoji" value="${serverConfig.emojis.summon}" class="w-full rounded-lg bg-surface-700 border-0 text-white focus:ring-2 focus:ring-primary-500 p-2 text-lg">
              </div>
            </div>
            
            <div>
              <label class="block text-surface-300 text-sm font-medium mb-2">Breed Emoji</label>
              <div class="flex">
                <input type="text" id="breedEmoji" value="${serverConfig.emojis.breed}" class="w-full rounded-lg bg-surface-700 border-0 text-white focus:ring-2 focus:ring-primary-500 p-2 text-lg">
              </div>
            </div>
            
            <div>
              <label class="block text-surface-300 text-sm font-medium mb-2">Attack Emoji</label>
              <div class="flex">
                <input type="text" id="attackEmoji" value="${serverConfig.emojis.attack}" class="w-full rounded-lg bg-surface-700 border-0 text-white focus:ring-2 focus:ring-primary-500 p-2 text-lg">
              </div>
            </div>
            
            <div>
              <label class="block text-surface-300 text-sm font-medium mb-2">Defend Emoji</label>
              <div class="flex">
                <input type="text" id="defendEmoji" value="${serverConfig.emojis.defend}" class="w-full rounded-lg bg-surface-700 border-0 text-white focus:ring-2 focus:ring-primary-500 p-2 text-lg">
              </div>
            </div>
            
            <button id="saveEmojisButton" class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm w-full">Save Emoji Changes</button>
          </div>
        </div>
        
        <div class="bg-surface-800 rounded-lg p-4 md:p-6">
          <h3 class="text-lg md:text-xl font-semibold text-white mb-4">Custom Prompts</h3>
          <p class="text-surface-300 mb-4">Configure the prompts used for different actions in the game.</p>
          
          <div class="space-y-4">
            <div>
              <label class="block text-surface-300 text-sm font-medium mb-2">Introduction Prompt</label>
              <textarea id="introPrompt" class="w-full rounded-lg bg-surface-700 border-0 text-white focus:ring-2 focus:ring-primary-500 p-2 h-24">${serverConfig.prompts.introduction}</textarea>
            </div>
            
            <div>
              <label class="block text-surface-300 text-sm font-medium mb-2">Summon Prompt</label>
              <textarea id="summonPrompt" class="w-full rounded-lg bg-surface-700 border-0 text-white focus:ring-2 focus:ring-primary-500 p-2 h-24">${serverConfig.prompts.summon}</textarea>
            </div>
            
            <button id="savePromptsButton" class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm w-full">Save Prompt Changes</button>
          </div>
        </div>
      </div>
    `;

    // Save emojis button
    const saveEmojisButton = document.getElementById('saveEmojisButton');
    saveEmojisButton.addEventListener('click', function() {
      const newEmojis = {
        summon: document.getElementById('summonEmoji').value,
        breed: document.getElementById('breedEmoji').value,
        attack: document.getElementById('attackEmoji').value,
        defend: document.getElementById('defendEmoji').value
      };

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

    // Save prompts button
    const savePromptsButton = document.getElementById('savePromptsButton');
    savePromptsButton.addEventListener('click', function() {
      const newPrompts = {
        introduction: document.getElementById('introPrompt').value,
        summon: document.getElementById('summonPrompt').value
      };

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

  function showSettingsTab() {
    adminContent.innerHTML = `
      <div class="bg-surface-800 rounded-lg p-4 md:p-6 mb-6">
        <h3 class="text-lg md:text-xl font-semibold text-white mb-4">General Settings</h3>
        
        <div class="space-y-6">
          <div>
            <h4 class="text-md font-medium text-white mb-3">Feature Toggles</h4>
            <div class="space-y-3">
              <div class="flex items-center">
                <input type="checkbox" id="featureBreeding" class="w-4 h-4 text-primary-600 rounded border-surface-500 focus:ring-primary-500" checked>
                <label for="featureBreeding" class="ml-2 text-sm text-surface-300">Enable Avatar Breeding</label>
              </div>
              <div class="flex items-center">
                <input type="checkbox" id="featureCombat" class="w-4 h-4 text-primary-600 rounded border-surface-500 focus:ring-primary-500" checked>
                <label for="featureCombat" class="ml-2 text-sm text-surface-300">Enable Combat System</label>
              </div>
              <div class="flex items-center">
                <input type="checkbox" id="featureItems" class="w-4 h-4 text-primary-600 rounded border-surface-500 focus:ring-primary-500" checked>
                <label for="featureItems" class="ml-2 text-sm text-surface-300">Enable Item Creation</label>
              </div>
            </div>
          </div>
          
          <div>
            <h4 class="text-md font-medium text-white mb-3">Rate Limits</h4>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-surface-300 text-sm font-medium mb-2">Messages per Interval</label>
                <input type="number" id="rateMessages" class="w-full rounded-lg bg-surface-700 border-0 text-white focus:ring-2 focus:ring-primary-500 p-2" value="5">
              </div>
              <div>
                <label class="block text-surface-300 text-sm font-medium mb-2">Interval (seconds)</label>
                <input type="number" id="rateInterval" class="w-full rounded-lg bg-surface-700 border-0 text-white focus:ring-2 focus:ring-primary-500 p-2" value="10">
              </div>
            </div>
          </div>
          
          <div>
            <h4 class="text-md font-medium text-white mb-3">Admin Access</h4>
            <div class="space-y-3">
              <div>
                <label class="block text-surface-300 text-sm font-medium mb-2">Admin Discord Roles (comma-separated)</label>
                <input type="text" id="adminRoles" class="w-full rounded-lg bg-surface-700 border-0 text-white focus:ring-2 focus:ring-primary-500 p-2" value="Admin, Moderator">
              </div>
            </div>
          </div>
          
          <button id="saveSettingsButton" class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm">Save Settings</button>
        </div>
      </div>
    `;

    // Save settings button
    const saveSettingsButton = document.getElementById('saveSettingsButton');
    saveSettingsButton.addEventListener('click', function() {
      const settings = {
        features: {
          breeding: document.getElementById('featureBreeding').checked,
          combat: document.getElementById('featureCombat').checked,
          itemCreation: document.getElementById('featureItems').checked
        },
        rateLimit: {
          messages: parseInt(document.getElementById('rateMessages').value),
          interval: parseInt(document.getElementById('rateInterval').value)
        },
        adminRoles: document.getElementById('adminRoles').value.split(',').map(role => role.trim())
      };

      fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          alert('Settings saved successfully!');
        } else {
          alert('Error saving settings');
        }
      })
      .catch(error => {
        console.error('Error saving settings:', error);
        alert('Error saving settings');
      });
    });
  }

  // Return public methods
  return {
    init
  };
})();

// Initialize the admin panel when the DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  AdminPanel.init();
});
