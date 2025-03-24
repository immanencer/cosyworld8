document.addEventListener("DOMContentLoaded", () => {
  const metadataViewer = document.getElementById("metadata-viewer");
  const cardPackContainer = document.getElementById("card-pack-container");
  const exportAllPacksBtn = document.getElementById("export-all-packs");
  const generatePacksBtn = document.getElementById("generate-packs");
  const emptyStateGenerateBtn = document.getElementById("empty-state-generate");
  const openRandomPackBtn = document.getElementById("open-random-pack");
  const packCountInput = document.getElementById("pack-count");
  const notificationContainer = document.getElementById("notification-container");

  let currentPacks = [];
  let selectedPack = null;

  // Show notification
  function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type} p-4 mb-4 rounded-lg shadow-lg text-white transition-opacity duration-500 ease-in-out`;
    notification.style.opacity = '0';
    
    if (type === 'success') {
      notification.classList.add('bg-green-500');
    } else if (type === 'error') {
      notification.classList.add('bg-red-500');
    } else if (type === 'info') {
      notification.classList.add('bg-blue-500');
    }
    
    notification.textContent = message;
    notificationContainer.appendChild(notification);
    
    // Fade in
    setTimeout(() => {
      notification.style.opacity = '1';
    }, 10);
    
    // Fade out and remove
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        notification.remove();
      }, 500);
    }, 3000);
  }

  // Generate new packs
  async function generatePacks() {
    try {
      cardPackContainer.innerHTML = `
        <div class="col-span-full flex items-center justify-center py-10">
          <div class="loading-spinner"></div>
          <p class="ml-3 text-gray-700">Generating card packs...</p>
        </div>
      `;

      const packCount = parseInt(packCountInput.value) || 5;
      const response = await fetch('/api/rati/generate-packs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ count: packCount, itemsPerPack: 4 }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate packs');
      }

      const data = await response.json();
      showNotification(`${data.totalPacks} card packs generated successfully!`);
      
      // Fetch the newly generated packs
      await fetchPacks();
    } catch (error) {
      console.error(error);
      showNotification(`Error generating packs: ${error.message}`, 'error');
      cardPackContainer.innerHTML = `
        <div class="col-span-full text-center py-10 text-red-500">
          <p>Failed to generate card packs. Please try again.</p>
        </div>
      `;
    }
  }

  // Fetch packs from the server
  async function fetchPacks() {
    try {
      cardPackContainer.innerHTML = `
        <div class="col-span-full flex items-center justify-center py-10">
          <div class="loading-spinner"></div>
          <p class="ml-3 text-gray-700">Loading card packs...</p>
        </div>
      `;

      const response = await fetch('/api/rati/packs');
      if (!response.ok) throw new Error('Failed to fetch packs');
      const packs = await response.json();
      
      currentPacks = packs;
      renderPacksGrid();
      
      // Enable export button if we have packs
      exportAllPacksBtn.disabled = packs.length === 0;
    } catch (error) {
      console.error(error);
      showNotification(`Error fetching packs: ${error.message}`, 'error');
      cardPackContainer.innerHTML = `
        <div class="col-span-full text-center py-10 text-red-500">
          <p>Failed to load card packs. Please try again.</p>
        </div>
      `;
    }
  }

  // Render packs in a grid layout
  function renderPacksGrid() {
    if (currentPacks.length === 0) {
      cardPackContainer.innerHTML = `
        <div class="col-span-full text-center py-10 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No card packs available</h3>
          <p class="mt-1 text-sm text-gray-500">Get started by generating some card packs</p>
          <div class="mt-6">
            <button id="empty-state-generate" class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Generate Card Packs
            </button>
          </div>
        </div>
      `;
      
      // Re-add event listener to the empty state button
      document.getElementById("empty-state-generate").addEventListener("click", generatePacks);
      return;
    }

    cardPackContainer.innerHTML = "";
    
    currentPacks.forEach((pack) => {
      const packElement = document.createElement("div");
      packElement.className = "card-pack bg-white rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:transform";
      packElement.innerHTML = `
        <div class="pack-header bg-gradient-to-r from-indigo-600 to-purple-700 px-4 py-3 text-white">
          <h3 class="font-medium">Pack #${pack.packId}</h3>
        </div>
        <div class="pack-body p-4">
          <div class="grid grid-cols-2 gap-2">
            ${pack.content.map((card, index) => `
              <div class="card${pack.opened ? ' flipped' : ''}" data-pack-id="${pack.packId}" data-card-index="${index}">
                <div class="card-face card-back">
                  <div class="flex items-center justify-center h-full w-full text-white font-bold">
                    <span class="text-xl opacity-80">?</span>
                  </div>
                </div>
                <div class="card-face card-front">
                  <div class="card-image-container">
                    <img src="${card.imageUrl || card.media?.image || 'placeholder.png'}" alt="${card.name}" class="card-image">
                    <span class="card-type-badge">${card.type || 'Unknown'}</span>
                  </div>
                  <div class="card-content">
                    <div>
                      <h4 class="font-medium text-sm truncate">${card.name || 'Unknown'}</h4>
                      <p class="card-rarity rarity-${card.rarity || 'common'} text-xs">${card.rarity || 'Common'}</p>
                    </div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
          <div class="mt-4 flex justify-center">
            <button class="reveal-pack-btn px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-md text-sm font-medium shadow hover:from-indigo-600 hover:to-purple-700 transition-colors ${pack.opened ? 'opacity-50 cursor-not-allowed' : ''}" data-pack-id="${pack.packId}" ${pack.opened ? 'disabled' : ''}>
              ${pack.opened ? 'Cards Revealed' : 'Reveal Cards'}
            </button>
          </div>
        </div>
      `;
      cardPackContainer.appendChild(packElement);
    });

    // Add card click listeners
    document.querySelectorAll('.card').forEach(card => {
      card.addEventListener('click', function() {
        const packId = this.getAttribute('data-pack-id');
        const cardIndex = this.getAttribute('data-card-index');
        const pack = currentPacks.find(p => p.packId == packId);
        
        if (pack && !this.classList.contains('flipped')) {
          this.classList.add('flipped', 'card-flash');
          setTimeout(() => this.classList.remove('card-flash'), 500);
          
          // Display metadata
          const cardData = pack.content[cardIndex];
          metadataViewer.textContent = JSON.stringify(cardData, null, 2);
        }
      });
    });

    // Add reveal pack button listeners
    document.querySelectorAll('.reveal-pack-btn').forEach(button => {
      button.addEventListener('click', async function() {
        const packId = this.getAttribute('data-pack-id');
        const pack = currentPacks.find(p => p.packId == packId);
        
        if (pack && !pack.opened) {
          try {
            // Mark pack as opened
            const response = await fetch(`/api/rati/packs/${packId}/open`, {
              method: 'POST'
            });
            
            if (!response.ok) throw new Error('Failed to open pack');
            
            // Update UI to show cards
            const packCards = document.querySelectorAll(`.card[data-pack-id="${packId}"]`);
            packCards.forEach((card, index) => {
              setTimeout(() => {
                card.classList.add('flipped', 'card-flash');
                setTimeout(() => card.classList.remove('card-flash'), 500);
              }, index * 200);
            });
            
            // Update button state
            this.textContent = 'Cards Revealed';
            this.disabled = true;
            this.classList.add('opacity-50', 'cursor-not-allowed');
            
            // Update pack in our data
            pack.opened = true;
            
            showNotification(`Pack #${packId} opened successfully!`);
          } catch (error) {
            console.error(error);
            showNotification(`Error opening pack: ${error.message}`, 'error');
          }
        }
      });
    });
  }

  // Open a random pack
  function openRandomPack() {
    const unopenedPacks = currentPacks.filter(pack => !pack.opened);
    
    if (unopenedPacks.length === 0) {
      showNotification('No unopened packs available. Generate new packs first.', 'info');
      return;
    }
    
    const randomIndex = Math.floor(Math.random() * unopenedPacks.length);
    const randomPack = unopenedPacks[randomIndex];
    
    // Find and click the reveal button for this pack
    const revealButton = document.querySelector(`.reveal-pack-btn[data-pack-id="${randomPack.packId}"]`);
    if (revealButton) {
      revealButton.click();
      
      // Scroll to the pack
      const packElement = document.querySelector(`.card-pack:has(.reveal-pack-btn[data-pack-id="${randomPack.packId}"])`);
      if (packElement) {
        packElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }

  // Export all packs data
  function exportAllPacks() {
    try {
      const dataStr = JSON.stringify(currentPacks, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = 'rati-card-packs.json';
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      showNotification('Card packs exported successfully!');
    } catch (error) {
      console.error(error);
      showNotification(`Error exporting packs: ${error.message}`, 'error');
    }
  }

  // Event listeners
  generatePacksBtn.addEventListener("click", generatePacks);
  emptyStateGenerateBtn.addEventListener("click", generatePacks);
  openRandomPackBtn.addEventListener("click", openRandomPack);
  exportAllPacksBtn.addEventListener("click", exportAllPacks);

  // Initialize by fetching packs
  fetchPacks();
});
