// Admin Panel Module
const AdminPanel = (() => {
  // State variables
  let serverConfig = {
    servers: [],
    unauthorizedServers: [],
    emojis: {
      summon: "💼",
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
    console.log('Initializing Admin Panel');

    // Get DOM elements
    const adminButton = document.getElementById('admin-button');
    const adminModal = document.getElementById('admin-modal');
    const closeAdmin = document.getElementById('close-admin');
    const adminContent = document.getElementById('admin-content');

    // Tab buttons
    const adminTabButtons = document.querySelectorAll('.admin-tab-button');

    if (!adminButton || !adminModal || !closeAdmin) {
      console.error('Admin panel elements not found');
      return;
    }

    // Set up event listeners
    adminButton.addEventListener('click', () => {
      adminModal.classList.remove('hidden');
      fetchAdminData();
    });

    closeAdmin.addEventListener('click', () => {
      adminModal.classList.add('hidden');
    });
    
    // Event delegation for dynamically added whitelist buttons
    adminContent.addEventListener('click', (e) => {
      if (e.target && e.target.classList.contains('whitelist-server')) {
        const serverId = e.target.getAttribute('data-server-id');
        const serverName = e.target.getAttribute('data-server-name');
        whitelistServer(serverId, serverName);
      }
    });

    // Set up tab switching
    adminTabButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Remove active class from all buttons
        adminTabButtons.forEach(btn => {
          btn.classList.remove('bg-primary-600', 'text-white');
          btn.classList.add('hover:bg-surface-700', 'text-surface-300', 'hover:text-white');
        });

        // Add active class to clicked button
        button.classList.remove('hover:bg-surface-700', 'text-surface-300', 'hover:text-white');
        button.classList.add('bg-primary-600', 'text-white');

        // Show corresponding tab content
        const tabName = button.getAttribute('data-admin-tab');
        console.log(`Showing tab content for: ${tabName}`);
        showTabContent(tabName);
      });
    });

    // Initially show dashboard tab
    showTabContent('dashboard');
  }

  // Fetch admin data from API
  function fetchAdminData() {
    // Fetch admin config
    fetch('/api/admin/config')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        updateAdminUI(data);
        // After updating UI with config, fetch unauthorized servers
        fetchUnauthorizedServers();
      })
      .catch(error => {
        console.error('Error fetching admin data:', error);
      });
  }
  
  // Fetch unauthorized servers from audit logs
  function fetchUnauthorizedServers() {
    fetch('/api/audit-logs?type=guild_access&limit=50')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(logs => {
        // Extract unique guild IDs from logs that aren't in our configs
        const existingGuildIds = new Set(serverConfig.servers.map(s => s.id));
        const detectedGuildIds = new Map();

        // Parse logs for "Guild X (id) is not whitelisted" entries
        logs.forEach(log => {
          if (typeof log.message === 'string') {
            const match = log.message.match(/Guild\s+([^(]+)\s+\((\d+)\)\s+is\s+not\s+whitelisted/i);
            if (match && match[1] && match[2]) {
              const guildName = match[1].trim();
              const guildId = match[2];dId = match[2];

              if (!existingGuildIds.has(guildId)) {
                detectedGuildIds.set(guildId, guildName);
              }
            }
          }
        });

        // Add detected guilds to our unauthorized servers list with default settings
        serverConfig.unauthorizedServers = [];
        for (const [guildId, guildName] of detectedGuildIds.entries()) {
          serverConfig.unauthorizedServers.push({
            id: guildId,
            name: guildName,
            memberCount: '-',
            status: 'Unauthorized'
          });
        }
        
        // Update the servers tab to show unauthorized servers
        if (document.getElementById('admin-content').innerHTML.includes('Connected Servers')) {
          showServersTab();
        }
        
        // If we have unauthorized servers and are on the Guild Settings page, display them
        if (serverConfig.unauthorizedServers.length > 0 && window.location.pathname.includes('/admin/guild-settings')) {
          displayUnauthorizedServers(serverConfig.unauthorizedServers);
        }
      })
      .catch(error => {
        console.error('Error fetching unauthorized servers:', error);
      });
  }
  
  // Display unauthorized servers in the guild-settings UI
  function displayUnauthorizedServers(servers) {
    const guildCardsContainer = document.getElementById('guild-cards-container');
    if (!guildCardsContainer) return;
    
    if (guildCardsContainer.innerHTML.includes('No guild configurations found')) {
      guildCardsContainer.innerHTML = ''; // Clear the "no configurations" message
    }
    
    servers.forEach(server => {
      // Check if this server card already exists
      if (document.querySelector(`[data-guild-id="${server.id}"]`)) {
        return; // Skip if already displayed
      }
      
      const card = document.createElement('div');
      card.setAttribute('data-guild-id', server.id);
      card.classList.add('bg-white', 'shadow', 'rounded-lg', 'p-4', 'cursor-pointer', 'hover:shadow-md', 'transition');
      card.classList.add('border-l-4', 'border-red-500'); // Red border for unauthorized
      
      card.innerHTML = `
        <h3 class="text-lg font-semibold">${server.name || `Server: ${server.id}`}</h3>
        <div class="mt-2 flex items-center">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Unauthorized
          </span>
          <span class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Auto-detected</span>
        </div>
        <p class="text-sm text-gray-500 mt-1">ID: ${server.id}</p>
        <button class="mt-2 inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 whitelist-server-btn">
          ✅ Whitelist Server
        </button>
      `;
      
      guildCardsContainer.appendChild(card);
      
      // Add event listener for the whitelist button
      card.querySelector('.whitelist-server-btn').addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent card click
        whitelistServer(server.id, server.name);
      });
      
      // Add click handler for the card (edit full settings)
      card.addEventListener('click', () => {
        addNewServerWithPrefilledValues(server.id, server.name);
      });
    });
  }
  
  // Function to whitelist a server quickly
  function whitelistServer(guildId, guildName) {
    // Create a minimal config with defaults
    const config = {
      guildId: guildId,
      guildName: guildName || `Server ${guildId}`,
      whitelisted: true,
      features: {
        breeding: true,
        combat: true,
        itemCreation: true
      },
      rateLimit: {
        messages: 5,
        interval: 60000
      }
    };
    
    // Save to API
    fetch('/api/guilds', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(config)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      // Show success message
      const card = document.querySelector(`[data-guild-id="${guildId}"]`);
      if (card) {
        card.classList.remove('border-red-500');
        card.classList.add('border-green-500');
        
        const statusBadge = card.querySelector('.bg-red-100');
        if (statusBadge) {
          statusBadge.classList.remove('bg-red-100', 'text-red-800');
          statusBadge.classList.add('bg-green-100', 'text-green-800');
          statusBadge.textContent = 'Whitelisted';
        }
        
        const whitelistBtn = card.querySelector('.whitelist-server-btn');
        if (whitelistBtn) {
          whitelistBtn.remove();
        }
      }
      
      // Force reload configs after a second
      setTimeout(() => {
        fetchAdminData();
      }, 1000);
    })
    .catch(error => {
      console.error('Error whitelisting server:', error);
      alert(`Failed to whitelist server: ${error.message}`);
    });
  }
  
  // Function to open the full settings form with prefilled values
  function addNewServerWithPrefilledValues(guildId, guildName) {
    // Navigate to guild-settings page if not already there
    if (!window.location.pathname.includes('/admin/guild-settings')) {
      window.location.href = '/admin/guild-settings.html';
      return;
    }
    
    // Find the guild settings manager instance
    const guildSettingsManager = window.guildSettingsManager;
    if (!guildSettingsManager) {
      console.error('Guild settings manager not found');
      return;
    }
    
    // Create a new guild config
    const newConfig = {
      guildId: guildId,
      guildName: guildName,
      whitelisted: false,
      features: {
        breeding: true,
        combat: true,
        itemCreation: true
      },
      prompts: {
        introduction: '',
        summon: '',
        attack: '',
        defend: '',
        breed: ''
      },
      rateLimit: {
        messages: 5,
        interval: 60000
      },
      adminRoles: [],
      summonEmoji: '✨',
      toolEmojis: {
        summon: '💼',
        breed: '🏹',
        attack: '⚔️',
        defend: '🛡️'
      }
    };
    
    // Open the form in edit mode
    try {
      document.getElementById('no-server-selected').classList.add('hidden');
      const form = document.getElementById('guild-settings-form');
      if (form) {
        form.classList.remove('hidden');
        
        // Populate form fields
        const guildIdField = document.getElementById('guild-id');
        if (guildIdField) {
          guildIdField.value = guildId;
        }
        
        const guildNameField = document.getElementById('guild-name');
        if (guildNameField) {
          guildNameField.value = guildName;
        }
        
        // Auto-check the whitelist checkbox
        const whitelistCheckbox = document.getElementById('guild-whitelisted');
        if (whitelistCheckbox) {
          whitelistCheckbox.checked = true;
        }
      }
    } catch (error) {
      console.error('Error opening server configuration:', error);
    }
  }

  // Update UI with fetched data
  function updateAdminUI(data) {
    if (data.stats) {
      const avatarCount = document.getElementById('avatarCount');
      const userCount = document.getElementById('userCount');
      const messageCount = document.getElementById('messageCount');

      if (avatarCount) avatarCount.textContent = data.stats.avatarCount || 0;
      if (userCount) userCount.textContent = data.stats.userCount || 0;
      if (messageCount) messageCount.textContent = data.stats.messageCount || 0;
    }

    if (data.config) {
      serverConfig = { ...serverConfig, ...data.config };
    }
  }
  
  // Whitelist an unauthorized server
  function whitelistServer(serverId, serverName) {
    // Create a default server configuration
    const defaultServerConfig = {
      id: serverId,
      name: serverName,
      whitelisted: true,
      features: {
        breeding: true,
        combat: true,
        itemCreation: true
      },
      rateLimit: {
        messages: 5,
        interval: 60000 // 1 minute in milliseconds
      }
    };
    
    // Send the request to whitelist the server
    fetch('/api/guilds', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(defaultServerConfig)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('Server whitelisted successfully:', data);
      // Remove server from unauthorized list and add to authorized list
      serverConfig.unauthorizedServers = serverConfig.unauthorizedServers.filter(s => s.id !== serverId);
      serverConfig.servers.push(defaultServerConfig);
      // Refresh the servers tab
      showServersTab();
    })
    .catch(error => {
      console.error('Error whitelisting server:', error);
      alert('Failed to whitelist server. Please try again.');
    });
  }

  // Show appropriate tab content
  function showTabContent(tabName) {
    const adminContent = document.getElementById('admin-content');

    switch (tabName) {
      case 'dashboard':
        showDashboardTab();
        break;
      case 'servers':
        showServersTab();
        break;
      case 'settings':
        showSettingsTab();
        break;
      default:
        showDashboardTab();
    }
  }

  // Tab content generators
  function showDashboardTab() {
    const adminContent = document.getElementById('admin-content');
    adminContent.innerHTML = `
      <h2 class="text-2xl font-bold mb-6">Dashboard</h2>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div class="bg-surface-800 rounded-lg p-4 flex flex-col justify-between">
          <div>
            <span class="text-surface-400 text-sm">Total Avatars</span>
            <h3 class="text-2xl font-bold text-white" id="avatarCount">--</h3>
          </div>
          <div class="flex justify-between items-center mt-4">
            <span class="text-surface-400 text-xs">Growth Metric</span>
            <svg class="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
          </div>
        </div>

        <div class="bg-surface-800 rounded-lg p-4 flex flex-col justify-between">
          <div>
            <span class="text-surface-400 text-sm">Active Users</span>
            <h3 class="text-2xl font-bold text-white" id="userCount">--</h3>
          </div>
          <div class="flex justify-between items-center mt-4">
            <span class="text-surface-400 text-xs">Growth Metric</span>
            <svg class="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
          </div>
        </div>

        <div class="bg-surface-800 rounded-lg p-4 flex flex-col justify-between">
          <div>
            <span class="text-surface-400 text-sm">Total Messages</span>
            <h3 class="text-2xl font-bold text-white" id="messageCount">--</h3>
          </div>
          <div class="flex justify-between items-center mt-4">
            <span class="text-surface-400 text-xs">Growth Metric</span>
            <svg class="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
          </div>
        </div>
      </div>

      <h3 class="text-xl font-bold mb-4">Activity Overview</h3>
      <div class="bg-surface-800 rounded-lg p-4 mb-6">
        <p class="text-surface-300">Activity chart would go here</p>
      </div>

      <h3 class="text-xl font-bold mb-4">Recent Activity</h3>
      <div class="bg-surface-800 rounded-lg overflow-hidden">
        <table class="min-w-full">
          <thead class="bg-surface-700">
            <tr>
              <th class="py-3 px-4 text-left text-xs font-medium text-surface-300 uppercase tracking-wider">Time</th>
              <th class="py-3 px-4 text-left text-xs font-medium text-surface-300 uppercase tracking-wider">Event</th>
              <th class="py-3 px-4 text-left text-xs font-medium text-surface-300 uppercase tracking-wider">Details</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-700">
            <tr>
              <td class="py-3 px-4 text-sm text-surface-300">10 min ago</td>
              <td class="py-3 px-4 text-sm text-white">New Avatar Created</td>
              <td class="py-3 px-4 text-sm text-surface-300">User created "Mystical Wizard"</td>
            </tr>
            <tr>
              <td class="py-3 px-4 text-sm text-surface-300">25 min ago</td>
              <td class="py-3 px-4 text-sm text-white">Server Connected</td>
              <td class="py-3 px-4 text-sm text-surface-300">New Discord server "Fantasy Realm" connected</td>
            </tr>
            <tr>
              <td class="py-3 px-4 text-sm text-surface-300">1 hour ago</td>
              <td class="py-3 px-4 text-sm text-white">Combat Event</td>
              <td class="py-3 px-4 text-sm text-surface-300">Dragon Knight defeated Shadow Assassin</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;

    // After populating the dashboard, fetch the latest data
    fetchAdminData();
  }

  function showServersTab() {
    const adminContent = document.getElementById('admin-content');
    adminContent.innerHTML = `
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold">Connected Servers</h2>
        <button class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Server
        </button>
      </div>

      <div class="bg-surface-800 rounded-lg overflow-hidden mb-6">
        <table class="min-w-full">
          <thead class="bg-surface-700">
            <tr>
              <th class="py-3 px-4 text-left text-xs font-medium text-surface-300 uppercase tracking-wider">Server Name</th>
              <th class="py-3 px-4 text-left text-xs font-medium text-surface-300 uppercase tracking-wider">Status</th>
              <th class="py-3 px-4 text-left text-xs font-medium text-surface-300 uppercase tracking-wider">Users</th>
              <th class="py-3 px-4 text-left text-xs font-medium text-surface-300 uppercase tracking-wider">Avatars</th>
              <th class="py-3 px-4 text-left text-xs font-medium text-surface-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-700" id="server-list">
            ${serverConfig.servers.map(server => `
              <tr>
                <td class="py-3 px-4 text-sm text-white">${server.name}</td>
                <td class="py-3 px-4">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Online
                  </span>
                </td>
                <td class="py-3 px-4 text-sm text-surface-300">${server.memberCount || '-'}</td>
                <td class="py-3 px-4 text-sm text-surface-300">${server.avatarCount || '-'}</td>
                <td class="py-3 px-4 text-sm text-surface-300">
                  <button class="text-primary-500 hover:text-primary-400 mr-2">Edit</button>
                  <button class="text-red-500 hover:text-red-400">Remove</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      
      ${serverConfig.unauthorizedServers && serverConfig.unauthorizedServers.length > 0 ? `
        <div class="flex justify-between items-center mb-6 mt-8">
          <h2 class="text-2xl font-bold">Unauthorized Servers</h2>
          <div class="text-sm text-surface-400">These servers have attempted to use the bot but are not whitelisted</div>
        </div>

        <div class="bg-surface-800 rounded-lg overflow-hidden mb-6">
          <table class="min-w-full">
            <thead class="bg-surface-700">
              <tr>
                <th class="py-3 px-4 text-left text-xs font-medium text-surface-300 uppercase tracking-wider">Server Name</th>
                <th class="py-3 px-4 text-left text-xs font-medium text-surface-300 uppercase tracking-wider">Status</th>
                <th class="py-3 px-4 text-left text-xs font-medium text-surface-300 uppercase tracking-wider">Server ID</th>
                <th class="py-3 px-4 text-left text-xs font-medium text-surface-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-surface-700" id="unauthorized-server-list">
              ${serverConfig.unauthorizedServers.map(server => `
                <tr>
                  <td class="py-3 px-4 text-sm text-white">${server.name}</td>
                  <td class="py-3 px-4">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      Unauthorized
                    </span>
                  </td>
                  <td class="py-3 px-4 text-sm text-surface-300">${server.id}</td>
                  <td class="py-3 px-4 text-sm text-surface-300">
                    <button class="bg-primary-600 hover:bg-primary-700 text-white px-3 py-1 rounded-md text-xs whitelist-server" data-server-id="${server.id}" data-server-name="${server.name}">
                      Whitelist Server
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : ''}

      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold">Command Emojis</h2>
        <button class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm">Save Changes</button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div class="bg-surface-800 rounded-lg p-4">
          <div class="mb-4">
            <label class="block text-sm font-medium text-surface-300 mb-1">Summon Emoji</label>
            <input type="text" id="summonEmoji" value="💼" class="w-full bg-surface-700 border border-surface-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500">
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-surface-300 mb-1">Breed Emoji</label>
            <input type="text" id="breedEmoji" value="🏹" class="w-full bg-surface-700 border border-surface-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500">
          </div>
        </div>

        <div class="bg-surface-800 rounded-lg p-4">
          <div class="mb-4">
            <label class="block text-sm font-medium text-surface-300 mb-1">Attack Emoji</label>
            <input type="text" id="attackEmoji" value="⚔️" class="w-full bg-surface-700 border border-surface-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500">
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-surface-300 mb-1">Defend Emoji</label>
            <input type="text" id="defendEmoji" value="🛡️" class="w-full bg-surface-700 border border-surface-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500">
          </div>
        </div>
      </div>
    `;

    // Populate emoji inputs with config data
    document.getElementById('summonEmoji').value = serverConfig.emojis.summon;
    document.getElementById('breedEmoji').value = serverConfig.emojis.breed;
    document.getElementById('attackEmoji').value = serverConfig.emojis.attack;
    document.getElementById('defendEmoji').value = serverConfig.emojis.defend;
  }

  function showSettingsTab() {
    const adminContent = document.getElementById('admin-content');
    adminContent.innerHTML = `
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold">System Settings</h2>
        <button id="saveSettingsButton" class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm">Save Changes</button>
      </div>

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
            <h4 class="text-md font-medium text-white mb-3">Rate Limiting</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="rateMessages" class="block text-sm text-surface-300 mb-1">Messages per Interval</label>
                <input type="number" id="rateMessages" value="5" min="1" max="100" class="w-full bg-surface-700 border border-surface-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500">
              </div>
              <div>
                <label for="rateInterval" class="block text-sm text-surface-300 mb-1">Interval (seconds)</label>
                <input type="number" id="rateInterval" value="10" min="1" max="3600" class="w-full bg-surface-700 border border-surface-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500">
              </div>
            </div>
          </div>

          <div>
            <h4 class="text-md font-medium text-white mb-3">System Prompts</h4>
            <div class="space-y-4">
              <div>
                <label for="introPrompt" class="block text-sm text-surface-300 mb-1">Avatar Introduction Prompt</label>
                <textarea id="introPrompt" rows="3" class="w-full bg-surface-700 border border-surface-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500">${serverConfig.prompts.introduction}</textarea>
              </div>
              <div>
                <label for="summonPrompt" class="block text-sm text-surface-300 mb-1">Summon Prompt</label>
                <textarea id="summonPrompt" rows="3" class="w-full bg-surface-700 border border-surface-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500">${serverConfig.prompts.summon}</textarea>
              </div>
            </div>
          </div>

          <div>
            <h4 class="text-md font-medium text-white mb-3">Admin Access</h4>
            <div>
              <label for="adminRoles" class="block text-sm text-surface-300 mb-1">Admin Role Names (comma separated)</label>
              <input type="text" id="adminRoles" value="Admin, Moderator" class="w-full bg-surface-700 border border-surface-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500">
            </div>
          </div>
        </div>
      </div>
    `;

    // Save settings button handler
    const saveSettingsButton = document.getElementById('saveSettingsButton');
    if (saveSettingsButton) {
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
          prompts: {
            introduction: document.getElementById('introPrompt').value,
            summon: document.getElementById('summonPrompt').value
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
  }

  // Initialize on page load
  document.addEventListener('DOMContentLoaded', init);

  // Return public methods
  return {
    init
  };
})();

// Additional initialization check in case DOM is already loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  AdminPanel.init();
}