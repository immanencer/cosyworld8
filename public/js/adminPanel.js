function showMessage(message, type) {
  const messageElement = document.getElementById('settings-message');
  if (!messageElement) return;

  messageElement.textContent = message;
  messageElement.classList.remove('hidden', 'text-green-500', 'text-red-500');
  messageElement.classList.add(`text-${type === 'success' ? 'green' : 'red'}-500`);
  messageElement.classList.remove('hidden');


// Function to render detected but not whitelisted guilds
async function renderDetectedGuilds() {
  try {
    // First, fetch guild configurations from database to know what guilds exist
    const guildsResponse = await fetch('/api/guilds');
    if (!guildsResponse.ok) {
      console.error('Error fetching guilds:', await guildsResponse.text());
      return;
    }
    
    const guildConfigs = await guildsResponse.json();
    
    // Identify non-whitelisted guilds from the database
    const nonWhitelistedGuilds = new Map();
    
    // Add database guilds that are not whitelisted
    guildConfigs.forEach(config => {
      if (!config.whitelisted) {
        nonWhitelistedGuilds.set(config.guildId, { 
          name: config.guildName || `Server ${config.guildId}`, 
          id: config.guildId,
          inDatabase: true
        });
      }
    });
    
    // Now fetch logs to find additional detected guilds
    const logsResponse = await fetch('/api/audit-logs?type=guild_access&limit=50');
    if (logsResponse.ok) {
      const logs = await logsResponse.json();
      
      // Set of whitelisted guild IDs for reference
      const whitelistedGuildIds = new Set(
        guildConfigs.filter(g => g.whitelisted).map(g => g.guildId)
      );
      
      // Parse logs for "Guild X (id) is not whitelisted" entries
      logs.forEach(log => {
        if (typeof log.message === 'string') {
          // Match different message patterns
          const matchPattern1 = log.message.match(/Guild\s+([^(]+)\s+\((\d+)\)\s+is\s+not\s+whitelisted/i);
          const matchPattern2 = log.message.match(/Retrieved guild config for (\d+) from database: whitelisted=false/i);

          if (matchPattern1 && matchPattern1[1] && matchPattern1[2]) {
            const guildName = matchPattern1[1].trim();
            const guildId = matchPattern1[2];

            if (!whitelistedGuildIds.has(guildId) && !nonWhitelistedGuilds.has(guildId)) {
              nonWhitelistedGuilds.set(guildId, { 
                name: guildName, 
                id: guildId,
                inDatabase: false 
              });
            }
          }
          else if (matchPattern2 && matchPattern2[1]) {
            const guildId = matchPattern2[1];

            // Only add if we don't already have this guild
            if (!whitelistedGuildIds.has(guildId) && !nonWhitelistedGuilds.has(guildId)) {
              // Look for a guild name in logs
              const nameMatch = logs.find(otherLog => 
                otherLog.message && otherLog.message.includes(guildId) && 
                otherLog.message.match(/Guild\s+([^(]+)\s+\((\d+)\)/i)
              );

              const guildName = nameMatch ? 
                nameMatch.message.match(/Guild\s+([^(]+)\s+\((\d+)\)/i)[1].trim() : 
                `Server ${guildId}`;

              nonWhitelistedGuilds.set(guildId, { 
                name: guildName, 
                id: guildId,
                inDatabase: false
              });
            }
          }
        }
      });
    }
    
    // Get the container and update visibility
    const detectedGuildsSection = document.getElementById('detected-guilds-section');
    const detectedGuildsContainer = document.getElementById('detected-guilds-container');
    
    if (!detectedGuildsContainer) return;
    
    // Clear existing content
    detectedGuildsContainer.innerHTML = '';
    
    // If we have detected guilds, show the section and render them
    if (nonWhitelistedGuilds.size > 0) {
      detectedGuildsSection.classList.remove('hidden');
      
      for (const [id, guild] of nonWhitelistedGuilds.entries()) {
        const card = document.createElement('div');
        card.classList.add('bg-white', 'shadow', 'rounded-lg', 'p-4', 'flex', 'items-center', 'justify-between');
        
        // Add different styling for guilds already in database
        if (guild.inDatabase) {
          card.classList.add('border-l-4', 'border-yellow-500');
        }
        
        card.innerHTML = `
          <div>
            <h4 class="font-medium">${guild.name}</h4>
            <p class="text-sm text-gray-500">ID: ${guild.id}</p>
            ${guild.inDatabase ? 
              '<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">In Database (Not Whitelisted)</span>' : 
              '<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Detected from Logs</span>'
            }
          </div>
          <button 
            data-guild-id="${guild.id}" 
            data-guild-name="${guild.name}"
            class="whitelist-detected-guild px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
          >
            Whitelist Server
          </button>
        `;
        
        detectedGuildsContainer.appendChild(card);
      }
      
      // Add event listeners to whitelist buttons
      document.querySelectorAll('.whitelist-detected-guild').forEach(button => {
        button.addEventListener('click', whitelistDetectedGuild);
      });
    } else {
      detectedGuildsSection.classList.add('hidden');
    }
  } catch (error) {
    console.error('Error rendering detected guilds:', error);
  }
}

// Function to handle whitelisting a detected guild
async function whitelistDetectedGuild(event) {
  const button = event.currentTarget;
  const guildId = button.dataset.guildId;
  const guildName = button.dataset.guildName;
  
  if (!guildId) return;
  
  // Disable the button and show loading state
  button.disabled = true;
  button.textContent = 'Processing...';
  
  try {
    let method = 'POST';
    let url = '/api/guilds';
    let config = {
      guildId,
      guildName,
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
    
    // First check if the guild already exists in the database
    const checkResponse = await fetch(`/api/guilds/${guildId}`);
    
    // If guild already exists, use PATCH instead of POST
    if (checkResponse.ok) {
      method = 'PATCH';
      url = `/api/guilds/${guildId}`;
      
      // Get existing configuration
      const existingConfig = await checkResponse.json();
      
      // Only update the whitelisted status and keep other settings
      config = {
        ...existingConfig,
        guildId,
        guildName: existingConfig.guildName || guildName,
        whitelisted: true
      };
    }
    
    // Send the request to whitelist the guild
    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(config)
    });
    
    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }
    
    showMessage('Server successfully whitelisted! You can now configure its settings.', 'success');

    // Refresh the guild configs
    if (window.guildSettingsManager) {
      await window.guildSettingsManager.loadGuildConfigs();
      window.guildSettingsManager.initializeGuildSelector();
      
      // Refresh detected guilds
      renderDetectedGuilds();
    } else {
      // Reload the page if the guild manager isn't available
      window.location.reload();
    }
  } catch (error) {
    console.error('Error whitelisting detected guild:', error);
    showMessage(`Failed to whitelist server: ${error.message}`, 'error');
    
    // Re-enable the button
    button.disabled = false;
    button.textContent = 'Whitelist Server';
  }
}

  setTimeout(() => {
    messageElement.classList.add('hidden');
  }, 5000);
}

// Function to initialize guild discovery
async function initGuildDiscovery() {
  const guildSelector = document.getElementById('guild-selector');
  if (!guildSelector) return;

  try {
    // Fetch available guilds
    const response = await fetch('/api/discord/guilds');
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const guilds = await response.json();

    // Clear existing options
    guildSelector.innerHTML = '<option value="" disabled selected>Please select a Discord server to configure</option>';

    // Add new options
    guilds.forEach(guild => {
      const option = document.createElement('option');
      option.value = guild.id;
      option.textContent = guild.name;
      guildSelector.appendChild(option);
    });

    // Add event listener
    guildSelector.addEventListener('change', handleGuildSelection);

    // Check for detected but non-whitelisted servers
    await checkForDetectedServers();
  } catch (error) {
    console.error('Error fetching available guilds:', error);
    showMessage('Failed to fetch available Discord servers. Please try again later.', 'error');
  }
}

// Function to check for detected but non-whitelisted servers
async function checkForDetectedServers() {
  try {
    // Get logs to check for non-whitelisted servers
    const logsResponse = await fetch('/api/audit-logs?type=guild_access&limit=50');
    if (!logsResponse.ok) {
      console.error('Failed to fetch audit logs');
      return;
    }

    const logs = await logsResponse.json();
    console.log('Retrieved audit logs:', logs);

    // Get existing guild configs
    const configsResponse = await fetch('/api/guilds');
    if (!configsResponse.ok) {
      console.error('Failed to fetch guild configs');
      return;
    }

    const existingConfigs = await configsResponse.json();
    const existingGuildIds = new Set(existingConfigs.map(g => g.guildId));

    // Container for detected guilds
    const detectedGuildsContainer = document.getElementById('detected-guilds-container');
    if (!detectedGuildsContainer) {
      console.error('Detected guilds container not found');
      return;
    }

    // Map to track detected guild IDs and names
    const detectedGuilds = new Map();

    // Parse logs for "Guild X (id) is not whitelisted" entries
    logs.forEach(log => {
      if (typeof log.message === 'string') {
        // Match different message patterns
        const matchPattern1 = log.message.match(/Guild\s+([^(]+)\s+\((\d+)\)\s+is\s+not\s+whitelisted/i);
        const matchPattern2 = log.message.match(/Retrieved guild config for (\d+) from database: whitelisted=false/i);

        if (matchPattern1 && matchPattern1[1] && matchPattern1[2]) {
          const guildName = matchPattern1[1].trim();
          const guildId = matchPattern1[2];

          if (!existingGuildIds.has(guildId) && !detectedGuilds.has(guildId)) {
            detectedGuilds.set(guildId, { name: guildName, id: guildId });
          }
        }
        else if (matchPattern2 && matchPattern2[1]) {
          const guildId = matchPattern2[1];

          // Only add if we don't already have this guild
          if (!existingGuildIds.has(guildId) && !detectedGuilds.has(guildId)) {
            // Look for a guild name in logs
            const nameMatch = logs.find(otherLog => 
              otherLog.message && otherLog.message.includes(guildId) && 
              otherLog.message.match(/Guild\s+([^(]+)\s+\((\d+)\)/i)
            );

            const guildName = nameMatch ? 
              nameMatch.message.match(/Guild\s+([^(]+)\s+\((\d+)\)/i)[1].trim() : 
              `Server ${guildId}`;

            detectedGuilds.set(guildId, { name: guildName, id: guildId });
          }
        }
      }
    });

    // Display detected guilds
    if (detectedGuilds.size > 0) {
      // Show the detected guilds section
      const detectedSection = document.getElementById('detected-guilds-section');
      if (detectedSection) {
        detectedSection.classList.remove('hidden');
      }

      // Clear the container
      detectedGuildsContainer.innerHTML = '';

      // Add each detected guild
      for (const guildInfo of detectedGuilds.values()) {
        const card = document.createElement('div');
        card.classList.add('bg-white', 'border', 'border-yellow-300', 'shadow', 'rounded-lg', 'p-4', 'mb-3');
        card.innerHTML = `
          <div class="flex justify-between items-center">
            <div>
              <h3 class="text-lg font-semibold">${guildInfo.name}</h3>
              <p class="text-sm text-gray-500">ID: ${guildInfo.id}</p>
            </div>
            <button
              class="whitelist-btn bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
              data-guild-id="${guildInfo.id}"
              data-guild-name="${guildInfo.name}"
            >
              Whitelist
            </button>
          </div>
        `;

        // Add click handler for the whitelist button
        const whitelistBtn = card.querySelector('.whitelist-btn');
        if (whitelistBtn) {
          whitelistBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const guildId = whitelistBtn.getAttribute('data-guild-id');
            const guildName = whitelistBtn.getAttribute('data-guild-name');
            whitelistDetectedGuild(guildId, guildName);
          });
        }

        detectedGuildsContainer.appendChild(card);
      }
    } else {
      // Hide the detected guilds section if none found
      const detectedSection = document.getElementById('detected-guilds-section');
      if (detectedSection) {
        detectedSection.classList.add('hidden');
      }
    }

  } catch (error) {
    console.error('Error checking for detected servers:', error);
  }
}

// Function to whitelist a detected guild
async function whitelistDetectedGuild(guildId, guildName) {
  try {
    // Create a base configuration with defaults
    const guildConfig = {
      guildId: guildId,
      guildName: guildName,
      whitelisted: true,
      features: {
        breeding: false,
        combat: false,
        itemCreation: false
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
      summonEmoji: '✨',
      toolEmojis: {
        summon: '🔮',
        breed: '🏹',
        attack: '⚔️',
        defend: '🛡️'
      }
    };

    // Save the new configuration
    const response = await fetch('/api/guilds', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(guildConfig)
    });

    if (!response.ok) {
      throw new Error(`Failed to save guild configuration: ${response.status}`);
    }

    // Show success message
    showMessage(`Server "${guildName}" has been whitelisted successfully!`, 'success');

    // Refresh the guild configs
    if (window.guildSettingsManager) {
      await window.guildSettingsManager.loadGuildConfigs();
      window.guildSettingsManager.initializeGuildSelector();
    } else {
      // Reload the page if the guild manager isn't available
      window.location.reload();
    }
  } catch (error) {
    console.error('Error whitelisting detected guild:', error);
    showMessage(`Failed to whitelist server: ${error.message}`, 'error');
  }
}

function initializeAdminPanel() {
  initGuildDiscovery();
  renderDetectedGuilds();
  renderAdminPanel();
}

function renderAdminPanel() {
  const mainContent = document.getElementById('main-content');
  if (!mainContent) return;

  mainContent.innerHTML = `
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div class="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 class="text-2xl font-semibold mb-4">Configure Discord Server Settings</h2>
        <p class="text-gray-600 mb-6">Manage settings for each connected Discord server</p>

        <div id="settings-message" class="hidden"></div>

        <div class="mb-6">
          <h3 class="text-xl font-semibold mb-3">Discord Servers</h3>
          <div id="guild-cards-container" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <!-- Guild cards will be rendered here -->
          </div>
          <p class="text-sm text-gray-500 mb-4">Note: New servers will inherit settings from the first configured server as a template</p>
          <button id="add-new-guild-button" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded flex items-center">
            <svg class="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd" />
            </svg>
            Add New Server Configuration
          </button>
        </div>

        <!-- Detected servers section -->
        <div id="detected-guilds-section" class="mb-6 hidden">
          <h3 class="text-xl font-semibold mb-3">Detected Servers</h3>
          <p class="text-sm text-gray-600 mb-4">The following Discord servers have attempted to interact with the bot but are not yet whitelisted:</p>
          <div id="detected-guilds-container" class="space-y-3">
            <!-- Detected guild cards will be rendered here -->
          </div>
        </div>

        <div id="no-server-selected" class="text-center p-8 border border-dashed border-gray-300 rounded-lg">
          <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p class="text-gray-500 mb-2">Please select a Discord server to configure</p>
          <p class="text-sm text-gray-400">Note: New servers will inherit settings from the first configured server as a template</p>
        </div>

        <!-- Guild settings form is defined in guild-settings.html -->
      </div>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  // Check if we're on the admin page
  const adminContainer = document.getElementById('admin-container');
  if (adminContainer) {
    initializeAdminPanel();

    // Also check for detected servers on page load
    setTimeout(() => {
      checkForDetectedServers();
    }, 1000); // Small delay to ensure other components are loaded
  }
});