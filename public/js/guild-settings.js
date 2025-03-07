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

      // Also get recent logs to identify unwhitelisted guilds
      const logsResponse = await fetch('/api/audit-logs?type=guild_access&limit=50');
      if (logsResponse.ok) {
        const logs = await logsResponse.json();

        // Extract unique guild IDs from logs that aren't in our configs
        const existingGuildIds = new Set(this.guildConfigs.map(g => g.guildId));
        const detectedGuildIds = new Map();

        // Parse logs for "Guild X (id) is not whitelisted" entries
        logs.forEach(log => {
          if (typeof log.message === 'string') {
            // Match different message patterns
            const matchPattern1 = log.message.match(/Guild\s+([^(]+)\s+\((\d+)\)\s+is\s+not\s+whitelisted/i);
            const matchPattern2 = log.message.match(/Retrieved guild config for (\d+) from database: whitelisted=false/i);
            
            if (matchPattern1 && matchPattern1[1] && matchPattern1[2]) {
              const guildName = matchPattern1[1].trim();
              const guildId = matchPattern1[2];

              if (!existingGuildIds.has(guildId)) {
                detectedGuildIds.set(guildId, guildName);
              }
            }
            else if (matchPattern2 && matchPattern2[1]) {
              const guildId = matchPattern2[1];
              
              // If we don't have a name, use a placeholder
              if (!existingGuildIds.has(guildId)) {
                // Look for a guild name in nearby log entries
                const nameMatch = logs.find(otherLog => 
                  otherLog.message && otherLog.message.includes(guildId) && 
                  otherLog.message.match(/Guild\s+([^(]+)\s+\((\d+)\)/i)
                );
                
                const guildName = nameMatch ? 
                  nameMatch.message.match(/Guild\s+([^(]+)\s+\((\d+)\)/i)[1].trim() : 
                  `Server ${guildId}`;
                
                detectedGuildIds.set(guildId, guildName);
              }
            }
          }
        });

        // Add detected guilds to our config list as placeholders
        for (const [guildId, guildName] of detectedGuildIds.entries()) {
          this.guildConfigs.push({
            guildId,
            guildName,
            whitelisted: false,
            _detected: true, // Flag to indicate this was automatically detected
            features: {
              breeding: false,
              combat: false,
              itemCreation: false
            },
            prompts: {},
            rateLimit: {
              messages: 5,
              interval: 60000
            }
          });
        }
      }

      return this.guildConfigs;
    } catch (error) {
      console.error('Error loading guild configurations:', error);
      throw error;
    }
  }

  initializeGuildSelector() {
    const guildList = document.getElementById('guild-cards-container');
    if (!guildList) {
      console.error('Guild cards container not found');
      return;
    }
    guildList.innerHTML = ''; // Clear existing guilds
    
    console.log('Rendering guild configs:', this.guildConfigs.length);

    // Sort configs by status and name
    const sortedConfigs = [...this.guildConfigs].sort((a, b) => {
      // First by whitelist status
      if (a.whitelisted && !b.whitelisted) return -1;
      if (!a.whitelisted && b.whitelisted) return 1;

      // Then by name
      return (a.guildName || '').localeCompare(b.guildName || '');
    });

    if (sortedConfigs.length === 0) {
      const emptyMessage = document.createElement('div');
      emptyMessage.classList.add('col-span-full', 'text-center', 'p-4', 'text-gray-500');
      emptyMessage.textContent = 'No guild configurations found';
      guildList.appendChild(emptyMessage);
    }

    sortedConfigs.forEach(config => {
      const card = document.createElement('div');
      card.setAttribute('data-guild-id', config.guildId);
      card.classList.add('bg-white', 'shadow', 'rounded-lg', 'p-4', 'cursor-pointer', 'hover:shadow-md', 'transition');
      
      // Add a border color based on whitelist status
      if (config.whitelisted) {
        card.classList.add('border-l-4', 'border-green-500');
      } else {
        card.classList.add('border-l-4', 'border-yellow-500');
      }
      
      card.innerHTML = `
        <h3 class="text-lg font-semibold">${config.guildName || `Server: ${config.guildId}`}</h3>
        <div class="mt-2 flex items-center">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.whitelisted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
            ${config.whitelisted ? 'Whitelisted' : 'Not Whitelisted'}
          </span>
          ${config._detected ? '<span class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Auto-detected</span>' : ''}
        </div>
        <p class="text-sm text-gray-500 mt-1">ID: ${config.guildId}</p>
      `;
      card.addEventListener('click', () => this.handleGuildSelection(config.guildId));
      guildList.appendChild(card);
    });

    // Add event handler for the add new guild button (which is now outside the container)
    const addNewButton = document.getElementById('add-new-guild-button');
    if (addNewButton) {
      addNewButton.addEventListener('click', () => this.handleGuildSelection('new'));
    }
  }

  initializeFormHandlers() {
    const form = document.getElementById('guild-settings-form');
    if (!form) return;

    // Set up form submission handler
    form.onsubmit = (event) => {
      event.preventDefault();
      this.saveGuildSettings();
    };

    // Cancel button handler
    const cancelButton = form.querySelector('button[type="button"]');
    if (cancelButton) {
      cancelButton.onclick = () => {
        if (this.selectedGuildId) {
          this.loadGuildSettings(this.selectedGuildId);
        } else {
          this.resetForm();
          this.toggleFormVisibility(false);
        }
      };
    }
  }

  handleGuildSelection(guildId) {
    if (!guildId) {
      this.toggleFormVisibility(false);
      document.getElementById('no-server-selected').classList.remove('hidden');
      return;
    }

    // Highlight the selected card
    const cards = document.querySelectorAll('[data-guild-id]');
    cards.forEach(card => {
      if (card.getAttribute('data-guild-id') === guildId) {
        card.classList.add('ring-2', 'ring-indigo-500');
      } else {
        card.classList.remove('ring-2', 'ring-indigo-500');
      }
    });

    // Set the selected guild ID
    this.selectedGuildId = guildId;

    // Handle new guild case
    if (guildId === 'new') {
      // Create a blank config template
      const newConfig = {
        guildId: '',
        guildName: '',
        whitelisted: false,
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
        adminRoles: [],
        summonEmoji: '✨',
        toolEmojis: {
          summon: '💼',
          breed: '🏹',
          attack: '⚔️',
          defend: '🛡️'
        }
      };
      
      this.populateSettingsForm(newConfig);
      
      // Enable the guild ID field for new guild
      const guildIdField = document.getElementById('guild-id');
      if (guildIdField) guildIdField.removeAttribute('readonly');
      
    } else {
      // Find the selected guild configuration
      const selectedConfig = this.guildConfigs.find(config => config.guildId === guildId);
      if (!selectedConfig) {
        this.showMessage(`Guild configuration not found for ID: ${guildId}`, 'error');
        return;
      }
      
      // Populate the form with the selected guild's configuration
      this.populateSettingsForm(selectedConfig);
    }

    // Show the settings form and hide the no-server message
    this.toggleFormVisibility(true);
    document.getElementById('no-server-selected').classList.add('hidden');
  }

  populateSettingsForm(config) {
    const form = document.getElementById('guild-settings-form');
    if (!form) return;

    // Basic information
    form.querySelector('#guild-id').value = config.guildId;
    form.querySelector('#guild-id').setAttribute('readonly', true);
    form.querySelector('#guild-name').value = config.guildName || '';
    form.querySelector('#summoner-role').value = config.summonerRole || '';
    form.querySelector('#admin-roles').value = (config.adminRoles || []).join(', ');
    form.querySelector('#guild-whitelisted').checked = config.whitelisted || false;

    // Summon emoji
    form.querySelector('#summon-emoji').value = config.summonEmoji || '✨';

    // Rate limits
    form.querySelector('#rate-limit-messages').value = config.rateLimit?.messages || 5;
    form.querySelector('#rate-limit-interval').value = (config.rateLimit?.interval || 60000) / 1000;

    // Prompts - ensure we're properly loading values
    const introPrompt = config.prompts?.introduction || '';
    const summonPrompt = config.prompts?.summon || '';
    const attackPrompt = config.prompts?.attack || '';
    const defendPrompt = config.prompts?.defend || '';
    const breedPrompt = config.prompts?.breed || '';

    form.querySelector('#intro-prompt').value = introPrompt;
    form.querySelector('#summon-prompt').value = summonPrompt;
    form.querySelector('#attack-prompt').value = attackPrompt;
    form.querySelector('#defend-prompt').value = defendPrompt;
    form.querySelector('#breed-prompt').value = breedPrompt;

    // Tool emojis
    form.querySelector('#tool-emoji-summon').value = config.toolEmojis?.summon || '💼';
    form.querySelector('#tool-emoji-breed').value = config.toolEmojis?.breed || '🏹';
    form.querySelector('#tool-emoji-attack').value = config.toolEmojis?.attack || '⚔️';
    form.querySelector('#tool-emoji-defend').value = config.toolEmojis?.defend || '🛡️';

    // Features
    form.querySelector('#feature-breeding').checked = config.features?.breeding || false;
    form.querySelector('#feature-combat').checked = config.features?.combat || false;
    form.querySelector('#feature-item-creation').checked = config.features?.itemCreation || false;
  }

  async saveGuildSettings() {
    try {
      this.showMessage('Saving settings...', 'info');

      // Validate form before submission
      const form = document.getElementById('guild-settings-form');
      if (!form) {
        throw new Error('Form not found');
      }

      const guildId = this.selectedGuildId === 'new'
        ? form.querySelector('#guild-id').value.trim()
        : this.selectedGuildId;

      if (!guildId) {
        throw new Error('Guild ID is required');
      }

      // Validate guild ID format (Discord guild IDs are numeric strings)
      if (!/^\d+$/.test(guildId)) {
        throw new Error('Guild ID must be a valid Discord server ID (numbers only)');
      }

      // Validate guild name
      const guildName = form.querySelector('#guild-name').value.trim();
      if (!guildName) {
        throw new Error('Guild name is required');
      }

      // Build settings object
      const settings = {
        guildId: guildId,
        guildName: form.querySelector('#guild-name').value.trim(),
        summonerRole: form.querySelector('#summoner-role').value.trim(),
        adminRoles: form.querySelector('#admin-roles').value.split(',')
          .map(role => role.trim())
          .filter(role => role),
        whitelisted: form.querySelector('#guild-whitelisted').checked,
        summonEmoji: form.querySelector('#summon-emoji').value.trim() || '✨',
        rateLimit: {
          messages: Math.max(1, parseInt(form.querySelector('#rate-limit-messages').value) || 5),
          interval: Math.max(1000, (parseInt(form.querySelector('#rate-limit-interval').value) || 60) * 1000)
        },
        prompts: {
          introduction: form.querySelector('#intro-prompt').value,
          summon: form.querySelector('#summon-prompt').value,
          attack: form.querySelector('#attack-prompt').value,
          defend: form.querySelector('#defend-prompt').value,
          breed: form.querySelector('#breed-prompt').value
        },
        toolEmojis: {
          summon: form.querySelector('#tool-emoji-summon').value.trim() || '💼',
          breed: form.querySelector('#tool-emoji-breed').value.trim() || '🏹',
          attack: form.querySelector('#tool-emoji-attack').value.trim() || '⚔️',
          defend: form.querySelector('#tool-emoji-defend').value.trim() || '🛡️'
        },
        features: {
          breeding: form.querySelector('#feature-breeding').checked,
          combat: form.querySelector('#feature-combat').checked,
          itemCreation: form.querySelector('#feature-item-creation').checked
        }
      };

      // Save settings to server
      const url = this.selectedGuildId === 'new'
        ? '/api/guilds'
        : `/api/guilds/${guildId}`;

      const method = this.selectedGuildId === 'new' ? 'POST' : 'PATCH';
      
      let response;
      try {
        response = await fetch(url, {
          method: method,
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(settings)
        });

        if (!response.ok) {
          const responseText = await response.text();
          let errorData;

          try {
            errorData = JSON.parse(responseText);
            console.log('Server error response:', errorData);
            throw new Error(errorData.error || `Server error: ${response.status}`);
          } catch (jsonError) {
            // If JSON parsing fails, use the raw response text
            console.error('Error parsing JSON response:', jsonError);
            throw new Error(`Server returned ${response.status}: ${responseText || 'No error details provided'}`);
          }
        }

        // Add cache-busting query param to force refresh server's cache
        await fetch(`/api/guilds/${guildId}/clear-cache`, { method: 'POST' });
      } catch (fetchError) {
        console.error('Network error:', fetchError);
        throw fetchError; // Re-throw to be caught by the outer try-catch
      }

      const updatedSettings = await response.json();
      console.log('Settings saved successfully:', updatedSettings);

      // Show success message
      this.showMessage('Settings saved successfully!', 'success');

      // Refresh guild configs
      await this.loadGuildConfigs();
      this.initializeGuildSelector();

      // Reselect current guild
      const selector = document.getElementById('guild-selector');
      if (selector) selector.value = guildId;
      this.selectedGuildId = guildId;
    } catch (error) {
      console.error('Error saving guild settings:', error);

      // Show a more descriptive error message to the user
      let errorMessage = error.message;
      if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
        errorMessage = 'Network error: Please check your connection and try again.';
      } else if (errorMessage.includes('JSON')) {
        errorMessage = 'Server returned an invalid response. Please try again or contact support.';
      }

      this.showMessage(`Error: ${errorMessage}`, 'error');

      // Keep the form visible so the user can fix the issue
      this.toggleFormVisibility(true);
    }
  }

  resetForm() {
    const form = document.getElementById('guild-settings-form');
    if (form) form.reset();
  }

  toggleFormVisibility(visible) {
    const form = document.getElementById('guild-settings-form');
    const noServerMessage = document.getElementById('no-server-selected');

    if (form) form.classList.toggle('hidden', !visible);
    if (noServerMessage) noServerMessage.classList.toggle('hidden', visible);
  }

  showMessage(message, type = 'info') {
    const messageElement = document.getElementById('settings-message');
    if (!messageElement) {
      console.error('Message element not found');
      return;
    }

    // Remove hidden class
    messageElement.classList.remove('hidden');
    
    // Set message content
    messageElement.textContent = message;
    
    // Reset all style classes
    messageElement.classList.remove('bg-blue-100', 'text-blue-800', 'bg-green-100', 'text-green-800', 'bg-red-100', 'text-red-800');
    
    // Apply appropriate styles based on message type
    switch (type) {
      case 'success':
        messageElement.classList.add('bg-green-100', 'text-green-800');
        break;
      case 'error':
        messageElement.classList.add('bg-red-100', 'text-red-800');
        break;
      default:
        messageElement.classList.add('bg-blue-100', 'text-blue-800');
    }
    
    // Make sure the message is visible
    messageElement.classList.add('p-4', 'rounded', 'mb-4');

    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
      setTimeout(() => {
        messageElement.classList.add('hidden');
      }, 5000);
    }
  }
  async addNewGuild(guildData) {
    try {
      if (!guildData.guildId) {
        throw new Error('Guild ID is required');
      }

      // Use the base API endpoint to create a new guild (it will use template functionality)
      const response = await fetch(`/api/guilds`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(guildData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Failed to save guild settings: ${response.status}`);
      }

      const savedGuild = await response.json();
      return savedGuild;
    } catch (error) {
      console.error('Error saving guild settings:', error);
      throw error;
    }
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  new GuildSettingsManager();
});