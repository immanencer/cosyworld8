
document.addEventListener('DOMContentLoaded', function() {
  const guildList = document.getElementById('guild-list');
  const loading = document.getElementById('loading');
  const errorMessage = document.getElementById('error-message');
  const refreshBtn = document.getElementById('refresh-btn');
  const template = document.getElementById('guild-card-template');
  
  // Load guilds on page load
  loadGuilds();
  
  // Refresh button click handler
  refreshBtn.addEventListener('click', loadGuilds);
  
  async function loadGuilds() {
    // Show loading, hide error
    loading.classList.remove('hidden');
    errorMessage.classList.add('hidden');
    guildList.innerHTML = '';
    
    try {
      // Fetch guilds from API
      const response = await fetch('/api/guilds', {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch guilds');
      }
      
      const guilds = await response.json();
      
      // Hide loading when done
      loading.classList.add('hidden');
      
      if (guilds.length === 0) {
        guildList.innerHTML = '<p class="col-span-3 text-center py-8 text-gray-400">No guilds found. Add the bot to a Discord server to get started.</p>';
        return;
      }
      
      // Render each guild
      guilds.forEach(guild => {
        const guildCard = renderGuildCard(guild);
        guildList.appendChild(guildCard);
      });
    } catch (error) {
      console.error('Error loading guilds:', error);
      loading.classList.add('hidden');
      errorMessage.classList.remove('hidden');
    }
  }
  
  function renderGuildCard(guild) {
    // Clone the template
    const guildCard = document.importNode(template.content, true).querySelector('.guild-card');
    
    // Set basic guild info
    const guildName = guildCard.querySelector('.guild-name');
    const guildId = guildCard.querySelector('.guild-id');
    const guildIcon = guildCard.querySelector('.guild-icon img');
    const memberCount = guildCard.querySelector('.member-count');
    
    guildName.textContent = guild.name;
    guildId.textContent = `ID: ${guild.id}`;
    memberCount.textContent = guild.memberCount || 'Unknown';
    
    if (guild.icon) {
      guildIcon.src = guild.icon;
      guildIcon.alt = `${guild.name} icon`;
    } else {
      // Default icon for guilds without one
      guildIcon.src = '/images/default-guild-icon.png';
      guildIcon.alt = 'Default guild icon';
    }
    
    // Set whitelist toggle
    const whitelistToggle = guildCard.querySelector('.whitelist-toggle');
    const whitelistStatus = guildCard.querySelector('.whitelist-status');
    
    whitelistToggle.checked = guild.isWhitelisted;
    whitelistStatus.textContent = guild.isWhitelisted ? 'Whitelisted' : 'Not Whitelisted';
    whitelistStatus.classList.add(guild.isWhitelisted ? 'bg-green-600' : 'bg-red-600');
    
    // Update the toggle UI
    if (guild.isWhitelisted) {
      guildCard.querySelector('.dot').classList.add('translate-x-6');
    }
    
    // Add event listener for whitelist toggle
    whitelistToggle.addEventListener('change', async (e) => {
      const isWhitelisted = e.target.checked;
      
      try {
        const response = await fetch(`/api/guilds/${guild.id}/whitelist`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAuthToken()}`
          },
          body: JSON.stringify({ isWhitelisted })
        });
        
        if (!response.ok) {
          throw new Error('Failed to update whitelist status');
        }
        
        // Update UI
        whitelistStatus.textContent = isWhitelisted ? 'Whitelisted' : 'Not Whitelisted';
        whitelistStatus.classList.remove(isWhitelisted ? 'bg-red-600' : 'bg-green-600');
        whitelistStatus.classList.add(isWhitelisted ? 'bg-green-600' : 'bg-red-600');
        
        if (isWhitelisted) {
          guildCard.querySelector('.dot').classList.add('translate-x-6');
        } else {
          guildCard.querySelector('.dot').classList.remove('translate-x-6');
        }
      } catch (error) {
        console.error('Error updating whitelist status:', error);
        // Revert the toggle on error
        e.target.checked = !isWhitelisted;
        alert('Failed to update whitelist status. Please try again.');
      }
    });
    
    // Add event listener for settings button
    const settingsBtn = guildCard.querySelector('.settings-btn');
    settingsBtn.addEventListener('click', () => {
      // TODO: Implement detailed settings for each guild
      alert(`Settings for ${guild.name} will be implemented soon!`);
    });
    
    return guildCard;
  }
  
  // Helper function to get auth token
  function getAuthToken() {
    // In a real app, you would retrieve this from localStorage or a secure cookie
    return localStorage.getItem('authToken') || '';
  }
});
