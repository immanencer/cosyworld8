// Guild settings management
class GuildSettingsManager {
  constructor() {
    this.guildConfigs = [];
    this.selectedGuildId = null;
    this.initializeInterface();

    // Make this instance globally accessible for other scripts
    window.guildSettingsManager = this;
  }

  async initializeInterface() {
    // Check if we're on the admin page with guild settings
    const guildSettingsContainer = document.getElementById('guild-settings-container');
    if (!guildSettingsContainer) return;

    try {
      // Show loading state
      this.showMessage('Loading guild configurations...', 'info');

      // Load guild configs
      await this.loadGuildConfigs();

      // Initialize interface elements
      this.initializeGuildSelector();
      this.initializeFormHandlers();
      this.setupManualWhitelistButton(); // Added this line

      // Hide the loading message
      document.getElementById('settings-message').classList.add('hidden');
    } catch (error) {
      console.error('Failed to initialize guild settings:', error);
      this.showMessage(`Error loading configurations: ${error.message}`, 'error');
    }
  }

  async loadGuildConfigs() {
    try {
      // Load existing guild configs
      const response = await fetch('/api/guilds');
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      this.guildConfigs = await response.json();
      console.log('Loaded guild configurations:', this.guildConfigs);

      // Also check for detected guilds
      this.checkDetectedGuilds();
    } catch (error) {
      console.error('Failed to load guild configurations:', error);
      throw error;
    }
  }

  async checkDetectedGuilds() {
    try {
      const response = await fetch('/api/guilds-detected');
      if (!response.ok) {
        return;
      }

      const detectedGuilds = await response.json();
      if (detectedGuilds.length > 0) {
        const detectedSection = document.getElementById('detected-guilds-section');
        const detectedContainer = document.getElementById('detected-guilds-container');

        if (detectedSection && detectedContainer) {
          detectedSection.classList.remove('hidden');
          detectedContainer.innerHTML = '';

          detectedGuilds.forEach(guild => {
            const card = this.createDetectedGuildCard(guild);
            detectedContainer.appendChild(card);
          });
        }
      }
    } catch (error) {
      console.error('Failed to check for detected guilds:', error);
    }
  }

  createDetectedGuildCard(guild) {
    const card = document.createElement('div');
    card.className = 'border rounded-md p-4 bg-white shadow-sm flex justify-between items-center';
    card.dataset.guildId = guild.id;

    let date = 'Unknown date';
    try {
      date = new Date(guild.detectedAt).toLocaleString();
    } catch (e) {}

    card.innerHTML = `
      <div>
        <h4 class="font-medium text-gray-900">${guild.name}</h4>
        <p class="text-sm text-gray-500">ID: ${guild.id}</p>
        <p class="text-xs text-gray-400">First detected: ${date}</p>
      </div>
      <button class="whitelist-guild-btn px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors">
        Whitelist
      </button>
    `;

    // Add click handler for the whitelist button
    card.querySelector('.whitelist-guild-btn').addEventListener('click', async () => {
      await this.whitelistDetectedGuild(guild);
    });

    return card;
  }

  async whitelistDetectedGuild(guild) {
    try {
      // Create a basic guild config with whitelist enabled
      const newGuildConfig = {
        guildId: guild.id,
        name: guild.name,
        whitelisted: true,
        summonEmoji: "✨", // Default summon emoji
        adminRoles: [],
        features: {
          breeding: true,
          combat: true,
          itemCreation: true
        },
        prompts: {
          intro: "You are now conversing with {avatar_name}, a unique AI character with its own personality and abilities.",
          summon: "You are {avatar_name}, responding to being summoned by {user_name}.",
          attack: "You are {avatar_name}, attacking {target_name} with your abilities.",
          defend: "You are {avatar_name}, defending against an attack.",
          breed: "You are {avatar_name}, breeding with {target_name} to create a new entity."
        },
        rateLimiting: {
          messages: 5,
          interval: 60
        },
        toolEmojis: {
          summon: "💼",
          breed: "🏹",
          attack: "⚔️",
          defend: "🛡️"
        }
      };

      // Send the request to create a new guild config
      const response = await fetch('/api/guilds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newGuildConfig)
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      // Reload guild configs
      await this.loadGuildConfigs();
      this.initializeGuildSelector();

      // Show success message
      this.showMessage(`Guild "${guild.name}" has been whitelisted and configured with default settings.`, 'success');

      // Remove the card from the detected guilds container
      const card = document.querySelector(`[data-guild-id="${guild.id}"]`);
      if (card) {
        card.remove();
      }
    } catch (error) {
      console.error('Failed to whitelist guild:', error);
      this.showMessage(`Failed to whitelist guild: ${error.message}`, 'error');
    }
  }

  initializeGuildSelector() {
    const container = document.getElementById('guild-cards-container');
    if (!container) return;

    // Clear existing cards
    container.innerHTML = '';

    console.log('Rendering guild configs:', this.guildConfigs.length);

    if (this.guildConfigs.length === 0) {
      // Show no configurations found message
      const noConfigsMsg = document.createElement('div');
      noConfigsMsg.className = 'col-span-full p-4 text-center border border-dashed border-gray-300 rounded-lg';
      noConfigsMsg.innerHTML = `
        <p class="text-gray-500">No guild configurations found</p>
        <p class="mt-2 text-sm text-gray-400">Note: New servers will inherit settings from the first configured server as a template</p>
      `;
      container.appendChild(noConfigsMsg);
    } else {
      // Render each guild card
      this.guildConfigs.forEach(guild => {
        const card = this.createGuildCard(guild);
        container.appendChild(card);
      });
    }

    // Set up the add new guild button
    const addNewGuildButton = document.getElementById('add-new-guild-button');
    if (addNewGuildButton) {
      addNewGuildButton.addEventListener('click', () => this.showAddGuildModal());
    }
  }

  createGuildCard(guild) {
    const card = document.createElement('div');
    card.className = 'border rounded-lg shadow-sm overflow-hidden bg-white';
    card.dataset.guildId = guild.guildId || guild.id;

    const iconUrl = guild.icon ? 
      `https://cdn.discordapp.com/icons/${guild.guildId || guild.id}/${guild.icon}.png` : 
      '/images/default-guild-icon.png';

    card.innerHTML = `
      <div class="flex items-center p-4 cursor-pointer hover:bg-gray-50" data-guild-id="${guild.guildId || guild.id}">
        <div class="flex-shrink-0 h-12 w-12 rounded-full overflow-hidden bg-gray-200">
          <img src="${iconUrl}" alt="${guild.name}" class="h-full w-full object-cover" onerror="this.src='/images/default-guild-icon.png'">
        </div>
        <div class="ml-4 flex-1">
          <h3 class="text-lg font-medium text-gray-900">${guild.name}</h3>
          <p class="text-sm text-gray-500">ID: ${guild.guildId || guild.id}</p>
        </div>
        <div class="ml-4 flex-shrink-0">
          <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${guild.whitelisted ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
            ${guild.whitelisted ? 'Whitelisted' : 'Not Whitelisted'}
          </span>
        </div>
      </div>
    `;

    // Add click handler
    card.querySelector('[data-guild-id]').addEventListener('click', () => {
      this.selectGuild(guild.guildId || guild.id);
    });

    return card;
  }

  selectGuild(guildId) {
    this.selectedGuildId = guildId;

    // Highlight the selected guild card
    document.querySelectorAll('#guild-cards-container > div').forEach(card => {
      if (card.dataset.guildId === guildId) {
        card.classList.add('ring-2', 'ring-indigo-500');
      } else {
        card.classList.remove('ring-2', 'ring-indigo-500');
      }
    });

    // Hide the no server selected message
    document.getElementById('no-server-selected').classList.add('hidden');

    // Show the form
    const form = document.getElementById('guild-settings-form');
    form.classList.remove('hidden');

    // Find the selected guild config
    const guildConfig = this.guildConfigs.find(g => (g.guildId || g.id) === guildId);

    if (guildConfig) {
      this.populateForm(guildConfig);
    } else {
      this.showMessage('Guild configuration not found', 'error');
    }
  }

  populateForm(guildConfig) {
    // Set form field values
    document.getElementById('guild-id').value = guildConfig.guildId || guildConfig.id || '';
    document.getElementById('guild-name').value = guildConfig.name || '';
    document.getElementById('summoner-role').value = guildConfig.summonerRole || '';
    document.getElementById('summon-emoji').value = guildConfig.summonEmoji || '✨';
    document.getElementById('admin-roles').value = Array.isArray(guildConfig.adminRoles) ? guildConfig.adminRoles.join(', ') : '';
    document.getElementById('guild-whitelisted').checked = guildConfig.whitelisted || false;

    // Rate limiting
    if (guildConfig.rateLimit) {
      document.getElementById('rate-limit-messages').value = guildConfig.rateLimit.messages || 5;
      document.getElementById('rate-limit-interval').value = guildConfig.rateLimit.interval || 60;
    }

    // Tool emojis
    if (guildConfig.toolEmojis) {
      document.getElementById('tool-emoji-summon').value = guildConfig.toolEmojis.summon || '💼';
      document.getElementById('tool-emoji-breed').value = guildConfig.toolEmojis.breed || '🏹';
      document.getElementById('tool-emoji-attack').value = guildConfig.toolEmojis.attack || '⚔️';
      document.getElementById('tool-emoji-defend').value = guildConfig.toolEmojis.defend || '🛡️';
    }

    // Features
    if (guildConfig.features) {
      document.getElementById('feature-breeding').checked = guildConfig.features.breeding || false;
      document.getElementById('feature-combat').checked = guildConfig.features.combat || false;
      document.getElementById('feature-item-creation').checked = guildConfig.features.itemCreation || false;
    }

    // Prompts
    if (guildConfig.prompts) {
      document.getElementById('intro-prompt').value = guildConfig.prompts.intro || '';
      document.getElementById('summon-prompt').value = guildConfig.prompts.summon || '';
      document.getElementById('attack-prompt').value = guildConfig.prompts.attack || '';
      document.getElementById('defend-prompt').value = guildConfig.prompts.defend || '';
      document.getElementById('breed-prompt').value = guildConfig.prompts.breed || '';
    }
  }

  initializeFormHandlers() {
    const form = document.getElementById('guild-settings-form');
    if (!form) return;

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      await this.saveGuildSettings();
    });
  }

  async saveGuildSettings() {
    if (!this.selectedGuildId) {
      this.showMessage('No guild selected', 'error');
      return;
    }

    try {
      this.showMessage('Saving guild settings...', 'info');

      const formData = this.getFormData();

      // Make API call to save settings
      const response = await fetch(`/api/guilds/${this.selectedGuildId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save guild settings');
      }

      const updatedConfig = await response.json();

      // Update the local cache
      const index = this.guildConfigs.findIndex(g => (g.guildId || g.id) === this.selectedGuildId);
      if (index !== -1) {
        this.guildConfigs[index] = updatedConfig;
      } else {
        this.guildConfigs.push(updatedConfig);
      }

      // Update the UI
      this.initializeGuildSelector();

      this.showMessage('Guild settings saved successfully', 'success');
    } catch (error) {
      console.error('Failed to save guild settings:', error);
      this.showMessage(`Error: ${error.message}`, 'error');
    }
  }

  getFormData() {
    return {
      guildId: document.getElementById('guild-id').value.trim(),
      name: document.getElementById('guild-name').value.trim(),
      summonerRole: document.getElementById('summoner-role').value.trim(),
      summonEmoji: document.getElementById('summon-emoji').value.trim(),
      adminRoles: document.getElementById('admin-roles').value.split(',').map(role => role.trim()).filter(Boolean),
      whitelisted: document.getElementById('guild-whitelisted').checked,
      rateLimit: {
        messages: parseInt(document.getElementById('rate-limit-messages').value, 10) || 5,
        interval: parseInt(document.getElementById('rate-limit-interval').value, 10) || 60,
      },
      toolEmojis: {
        summon: document.getElementById('tool-emoji-summon').value.trim(),
        breed: document.getElementById('tool-emoji-breed').value.trim(),
        attack: document.getElementById('tool-emoji-attack').value.trim(),
        defend: document.getElementById('tool-emoji-defend').value.trim(),
      },
      features: {
        breeding: document.getElementById('feature-breeding').checked,
        combat: document.getElementById('feature-combat').checked,
        itemCreation: document.getElementById('feature-item-creation').checked,
      },
      prompts: {
        intro: document.getElementById('intro-prompt').value.trim(),
        summon: document.getElementById('summon-prompt').value.trim(),
        attack: document.getElementById('attack-prompt').value.trim(),
        defend: document.getElementById('defend-prompt').value.trim(),
        breed: document.getElementById('breed-prompt').value.trim(),
      },
    };
  }

  showAddGuildModal() {
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50';
    modal.id = 'add-guild-modal';

    modal.innerHTML = `
      <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Add New Discord Server</h3>
        <form id="add-guild-form">
          <div class="mb-4">
            <label for="new-guild-id" class="block text-sm font-medium text-gray-700">Discord Server ID</label>
            <input type="text" id="new-guild-id" class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" placeholder="Discord server ID (numbers only)" required>
            <p class="mt-1 text-xs text-gray-500">Enter the numeric Discord server ID. Right-click on server → Copy ID (with developer mode enabled)</p>
          </div>
          <div class="mb-4">
            <label for="new-guild-name" class="block text-sm font-medium text-gray-700">Server Name</label>
            <input type="text" id="new-guild-name" class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" placeholder="Server name" required>
          </div>
          <div class="flex items-start mb-4">
            <div class="flex items-center h-5">
              <input id="new-guild-whitelisted" type="checkbox" class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded">
            </div>
            <div class="ml-3 text-sm">
              <label for="new-guild-whitelisted" class="font-medium text-gray-700">Whitelist this server</label>
              <p class="text-gray-500">Enable the bot to respond to messages in this server</p>
            </div>
          </div>
          <div class="flex justify-end space-x-3 mt-6">
            <button type="button" id="cancel-add-guild" class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Cancel
            </button>
            <button type="submit" class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Add Server
            </button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    // Add event listeners
    document.getElementById('cancel-add-guild').addEventListener('click', () => {
      document.body.removeChild(modal);
    });

    document.getElementById('add-guild-form').addEventListener('submit', async (event) => {
      event.preventDefault();

      const guildId = document.getElementById('new-guild-id').value.trim();
      const name = document.getElementById('new-guild-name').value.trim();
      const whitelisted = document.getElementById('new-guild-whitelisted').checked;

      try {
        this.showMessage('Adding new guild configuration...', 'info');

        // Make API call to create new guild config
        const response = await fetch('/api/guilds', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            guildId,
            name,
            whitelisted,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to add guild');
        }

        const newGuild = await response.json();

        // Update local cache and UI
        this.guildConfigs.push(newGuild);
        this.initializeGuildSelector();

        // Select the new guild
        this.selectGuild(guildId);

        this.showMessage('Guild configuration added successfully', 'success');

        // Remove modal
        document.body.removeChild(modal);
      } catch (error) {
        console.error('Failed to add guild:', error);
        this.showMessage(`Error: ${error.message}`, 'error');
      }
    });
  }

  showMessage(message, type = 'info') {
    const messageContainer = document.getElementById('settings-message');
    if (!messageContainer) return;

    messageContainer.innerHTML = message;
    messageContainer.classList.remove('hidden', 'message-success', 'message-error', 'message-info');
    messageContainer.classList.add(`message-${type}`);

    if (type !== 'info') {
      // Auto-hide success and error messages after a delay
      setTimeout(() => {
        messageContainer.classList.add('hidden');
      }, 5000);
    }
  }

  async whitelistGuild(guildId, guildName) {
    try {
      const newGuildConfig = {
        guildId: guildId,
        name: guildName,
        whitelisted: true,
        // Add other default settings as needed
      };

      const response = await fetch('/api/guilds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newGuildConfig),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      await this.loadGuildConfigs();
      this.initializeGuildSelector();
      this.showMessage(`Guild "${guildName}" (ID: ${guildId}) whitelisted successfully!`, 'success');
    } catch (error) {
      console.error('Failed to whitelist guild:', error);
      this.showMessage(`Error whitelisting guild: ${error.message}`, 'error');
    }
  }

  setupManualWhitelistButton() {
    const manualWhitelistButton = document.getElementById('manual-whitelist-button');
    if (manualWhitelistButton) {
      manualWhitelistButton.addEventListener('click', () => {
        const guildIdInput = document.getElementById('manual-guild-id');
        const guildNameInput = document.getElementById('manual-guild-name');

        if (!guildIdInput || !guildIdInput.value) {
          alert('Please enter a Discord server ID');
          return;
        }

        const guildId = guildIdInput.value.trim();
        const guildName = guildNameInput ? guildNameInput.value.trim() : `Server ${guildId}`;

        this.whitelistGuild(guildId, guildName).then(() => {
          // Clear inputs on success
          if (guildIdInput) guildIdInput.value = '';
          if (guildNameInput) guildNameInput.value = '';
        });
      });
    }
  }

}

async function checkForDetectedServers() {
    try {
        const response = await fetch('/api/guilds-detected');
        if (!response.ok) return;
        const detectedGuilds = await response.json();
        const nonWhitelisted = detectedGuilds.filter(guild => !guild.whitelisted);
        if (nonWhitelisted.length > 0) {
            const detectedSection = document.getElementById('detected-guilds-section');
            const detectedContainer = document.getElementById('detected-guilds-container');
            if (detectedSection && detectedContainer) {
                detectedSection.classList.remove('hidden');
                detectedContainer.innerHTML = '';
                nonWhitelisted.forEach(guild => {
                    const card = window.guildSettingsManager.createDetectedGuildCard(guild);
                    detectedContainer.appendChild(card);
                });
            }
        }
    } catch (error) {
        console.error('Failed to check for detected non-whitelisted guilds:', error);
    }
}


// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new GuildSettingsManager();
  checkForDetectedServers();
});