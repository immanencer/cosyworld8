
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
      // Load guild configs
      await this.loadGuildConfigs();
      
      // Initialize interface elements
      this.initializeGuildSelector();
      this.initializeFormHandlers();
      
      // Show the interface
      guildSettingsContainer.classList.remove('hidden');
    } catch (error) {
      console.error('Failed to initialize guild settings:', error);
    }
  }

  async loadGuildConfigs() {
    try {
      const response = await fetch('/api/guilds');
      if (!response.ok) throw new Error('Failed to load guild configurations');
      
      this.guildConfigs = await response.json();
      
      // Also load connected guilds
      const connectedResponse = await fetch('/api/guilds/connected/list');
      if (connectedResponse.ok) {
        const connectedGuilds = await connectedResponse.json();
        
        // Merge connected guilds with configurations
        for (const guild of connectedGuilds) {
          if (!this.guildConfigs.find(g => g.guildId === guild.id)) {
            this.guildConfigs.push({
              guildId: guild.id,
              guildName: guild.name,
              whitelisted: false
            });
          }
        }
      }
      
      console.log('Loaded guild configurations:', this.guildConfigs);
    } catch (error) {
      console.error('Error loading guild configs:', error);
      this.guildConfigs = [];
    }
  }

  initializeGuildSelector() {
    const selector = document.getElementById('guild-selector');
    if (!selector) return;
    
    // Clear existing options
    selector.innerHTML = '';
    
    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select Discord Server';
    selector.appendChild(defaultOption);
    
    // Add options for each guild
    this.guildConfigs.forEach(guild => {
      const option = document.createElement('option');
      option.value = guild.guildId;
      option.textContent = guild.guildName || `Server ID: ${guild.guildId}`;
      selector.appendChild(option);
    });
    
    // Handle selection change
    selector.addEventListener('change', () => {
      this.selectedGuildId = selector.value;
      this.loadGuildSettings(this.selectedGuildId);
    });
  }

  async loadGuildSettings(guildId) {
    if (!guildId) {
      this.resetForm();
      this.toggleFormVisibility(false);
      return;
    }
    
    try {
      const response = await fetch(`/api/guilds/${guildId}`);
      if (!response.ok) throw new Error('Failed to load guild settings');
      
      const settings = await response.json();
      this.populateForm(settings);
      this.toggleFormVisibility(true);
    } catch (error) {
      console.error(`Error loading settings for guild ${guildId}:`, error);
      this.toggleFormVisibility(false);
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

  populateForm(settings) {
    // Basic settings
    this.setFormValue('guild-name', settings.guildName || '');
    this.setFormValue('guild-whitelisted', settings.whitelisted || false);
    this.setFormValue('summoner-role', settings.summonerRole || '');
    
    // Admin roles
    this.setFormValue('admin-roles', (settings.adminRoles || []).join(', '));
    
    // Emojis
    if (settings.toolEmojis) {
      this.setFormValue('summon-emoji', settings.toolEmojis.summon || '🔮');
      this.setFormValue('breed-emoji', settings.toolEmojis.breed || '🏹');
      this.setFormValue('attack-emoji', settings.toolEmojis.attack || '⚔️');
      this.setFormValue('defend-emoji', settings.toolEmojis.defend || '🛡️');
    }
    
    // Features
    if (settings.features) {
      this.setFormValue('feature-breeding', settings.features.breeding !== false);
      this.setFormValue('feature-combat', settings.features.combat !== false);
      this.setFormValue('feature-item-creation', settings.features.itemCreation !== false);
    }
    
    // Prompts
    if (settings.prompts) {
      this.setFormValue('prompt-introduction', settings.prompts.introduction || '');
      this.setFormValue('prompt-summon', settings.prompts.summon || '');
      this.setFormValue('prompt-attack', settings.prompts.attack || '');
      this.setFormValue('prompt-defend', settings.prompts.defend || '');
      this.setFormValue('prompt-breed', settings.prompts.breed || '');
    }
    
    // Rate limits
    if (settings.rateLimit) {
      this.setFormValue('rate-limit-messages', settings.rateLimit.messages || 5);
      this.setFormValue('rate-limit-interval', settings.rateLimit.interval / 1000 || 60);
    }
  }

  setFormValue(id, value) {
    const element = document.getElementById(id);
    if (!element) return;
    
    if (element.type === 'checkbox') {
      element.checked = value;
    } else {
      element.value = value;
    }
  }

  getFormValue(id) {
    const element = document.getElementById(id);
    if (!element) return null;
    
    if (element.type === 'checkbox') {
      return element.checked;
    } else {
      return element.value;
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
    if (!this.selectedGuildId) return;
    
    try {
      const settings = {
        guildName: this.getFormValue('guild-name'),
        whitelisted: this.getFormValue('guild-whitelisted'),
        summonerRole: this.getFormValue('summoner-role'),
        adminRoles: this.getFormValue('admin-roles').split(',').map(role => role.trim()).filter(Boolean),
        toolEmojis: {
          summon: this.getFormValue('summon-emoji'),
          breed: this.getFormValue('breed-emoji'),
          attack: this.getFormValue('attack-emoji'),
          defend: this.getFormValue('defend-emoji')
        },
        features: {
          breeding: this.getFormValue('feature-breeding'),
          combat: this.getFormValue('feature-combat'),
          itemCreation: this.getFormValue('feature-item-creation')
        },
        prompts: {
          introduction: this.getFormValue('prompt-introduction'),
          summon: this.getFormValue('prompt-summon'),
          attack: this.getFormValue('prompt-attack'),
          defend: this.getFormValue('prompt-defend'),
          breed: this.getFormValue('prompt-breed')
        },
        rateLimit: {
          messages: parseInt(this.getFormValue('rate-limit-messages'), 10),
          interval: parseInt(this.getFormValue('rate-limit-interval'), 10) * 1000 // Convert to milliseconds
        }
      };
      
      const response = await fetch(`/api/guilds/${this.selectedGuildId}`, {
        method: 'POST',
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
      if (selector) selector.value = this.selectedGuildId;
    } catch (error) {
      console.error('Error saving guild settings:', error);
      this.showMessage(`Error: ${error.message}`, 'error');
    }
  }

  showMessage(message, type = 'info') {
    const messageContainer = document.getElementById('settings-message');
    if (!messageContainer) return;
    
    messageContainer.textContent = message;
    messageContainer.className = ''; // Clear existing classes
    messageContainer.classList.add('settings-message', `message-${type}`);
    
    // Show the message
    messageContainer.classList.remove('hidden');
    
    // Hide after 5 seconds
    setTimeout(() => {
      messageContainer.classList.add('hidden');
    }, 5000);
  }
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', () => {
  window.guildSettingsManager = new GuildSettingsManager();
});
