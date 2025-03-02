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

      const form = document.getElementById('guild-settings-form');
      const guildId = this.selectedGuildId === 'new' 
        ? form.querySelector('#guild-id').value 
        : this.selectedGuildId;

      if (!guildId) {
        throw new Error('Guild ID is required');
      }

      // Build settings object
      const settings = {
        guildId: guildId,
        guildName: form.querySelector('#guild-name').value,
        summonerRole: form.querySelector('#summoner-role').value,
        adminRoles: form.querySelector('#admin-roles').value.split(',')
          .map(role => role.trim())
          .filter(role => role),
        whitelisted: form.querySelector('#guild-whitelisted').checked,
        summonEmoji: form.querySelector('#summon-emoji').value,
        rateLimit: {
          messages: parseInt(form.querySelector('#rate-limit-messages').value) || 5,
          interval: (parseInt(form.querySelector('#rate-limit-interval').value) || 60) * 1000
        },
        prompts: {
          introduction: form.querySelector('#intro-prompt').value,
          summon: form.querySelector('#summon-prompt').value,
          attack: form.querySelector('#attack-prompt').value,
          defend: form.querySelector('#defend-prompt').value,
          breed: form.querySelector('#breed-prompt').value
        },
        toolEmojis: {
          summon: form.querySelector('#tool-emoji-summon').value,
          breed: form.querySelector('#tool-emoji-breed').value,
          attack: form.querySelector('#tool-emoji-attack').value,
          defend: form.querySelector('#tool-emoji-defend').value
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

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save guild settings');
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
      this.showMessage(`Error: ${error.message}`, 'error');
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