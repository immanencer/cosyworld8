// Guild settings management
class GuildSettingsManager {
  constructor() {
    this.guildConfigs = [];
    this.selectedGuildId = null;
    this.initializeInterface();
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
      const response = await fetch('/api/guilds');
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      this.guildConfigs = await response.json();
      console.log('Loaded guild configurations:', this.guildConfigs);
      return this.guildConfigs;
    } catch (error) {
      console.error('Error loading guild configurations:', error);
      throw error;
    }
  }

  initializeGuildSelector() {
    const selector = document.getElementById('guild-selector');
    if (!selector) return;

    // Clear existing options (except the placeholder)
    while (selector.options.length > 1) {
      selector.remove(1);
    }

    // Add options for each guild configuration
    this.guildConfigs.forEach(config => {
      const option = document.createElement('option');
      option.value = config.guildId;
      option.textContent = config.guildName || `Server: ${config.guildId}`;
      selector.appendChild(option);
    });

    // Add an option to create a new guild configuration
    const newOption = document.createElement('option');
    newOption.value = 'new';
    newOption.textContent = '➕ Add New Server Configuration';
    selector.appendChild(newOption);

    // Set up change event handler
    selector.onchange = () => this.handleGuildSelection(selector.value);
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
    if (!guildId || guildId === '') {
      this.selectedGuildId = null;
      this.resetForm();
      this.toggleFormVisibility(false);
      return;
    }

    if (guildId === 'new') {
      this.selectedGuildId = 'new';
      this.resetForm();
      this.toggleFormVisibility(true);
      document.getElementById('guild-id').removeAttribute('readonly');
      document.getElementById('guild-id').focus();
    } else {
      this.selectedGuildId = guildId;
      this.loadGuildSettings(guildId);
    }
  }

  loadGuildSettings(guildId) {
    const config = this.guildConfigs.find(c => c.guildId === guildId);
    if (!config) {
      this.showMessage(`Could not find configuration for server ID: ${guildId}`, 'error');
      return;
    }

    this.toggleFormVisibility(true);

    // Populate form fields
    const form = document.getElementById('guild-settings-form');

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

      try {
        const response = await fetch(url, {
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
    if (!messageElement) return;

    messageElement.textContent = message;
    messageElement.classList.remove('hidden', 'message-success', 'message-error', 'message-info');

    switch (type) {
      case 'success':
        messageElement.classList.add('message-success');
        break;
      case 'error':
        messageElement.classList.add('message-error');
        break;
      default:
        messageElement.classList.add('message-info');
    }

    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
      setTimeout(() => {
        messageElement.classList.add('hidden');
      }, 5000);
    }
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  new GuildSettingsManager();
});