document.addEventListener("DOMContentLoaded", () => {
  // Cache DOM elements with null checking
  const elements = {
    metadataViewer: document.getElementById("metadata-viewer"),
    cardContainer: document.getElementById("card-pack-container") || document.getElementById("packs-container"),
    openRandomBtn: document.getElementById("open-random-pack"),
    pagination: document.getElementById("pagination-container"),
    notification: document.getElementById("notification") || createNotificationElement(),
    encryptionKey: document.getElementById("encryption-key"),
    redeemBtn: document.getElementById("redeem-pack"),
    keyContainer: document.getElementById("user-key-container"),
    userKey: document.getElementById("user-key-display"),
    requestKeyBtn: document.getElementById("request-key-btn")
  };

  let currentPacks = [];
  let userKeyData = null;

  // Create notification element if it doesn't exist
  function createNotificationElement() {
    const notificationEl = document.createElement('div');
    notificationEl.id = 'notification';
    notificationEl.className = 'notification';
    document.body.appendChild(notificationEl);
    return notificationEl;
  }

  // Show notification with enhanced animation
  function showNotification(message, type = 'info') {
    const { notification } = elements;
    
    // Set message and style based on type
    notification.textContent = message;
    notification.className = 'notification show';
    
    // Set background color based on notification type
    if (type === 'success') {
      notification.style.backgroundColor = '#10B981';
    } else if (type === 'error') {
      notification.style.backgroundColor = '#EF4444';
    } else if (type === 'warning') {
      notification.style.backgroundColor = '#F59E0B';
    } else {
      notification.style.backgroundColor = '#6366F1';
    }
    
    // Hide notification after 3 seconds
    setTimeout(() => {
      notification.className = 'notification';
    }, 3000);
  }

  // Generate or retrieve user ID for localStorage
  function getUserId() {
    let userId = localStorage.getItem('rati_user_id');
    if (!userId) {
      userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('rati_user_id', userId);
    }
    return userId;
  }

  // Get user key from localStorage or request a new one
  function getUserKey() {
    const userId = getUserId();
    const storedKey = localStorage.getItem(`rati_user_key_${userId}`);
    
    if (storedKey) {
      try {
        userKeyData = JSON.parse(storedKey);
        displayUserKey(userKeyData.key);
        return userKeyData;
      } catch (error) {
        console.error('Failed to parse stored user key:', error);
      }
    }
    
    return null;
  }

  // Display user key in the UI
  function displayUserKey(key) {
    if (elements.userKey) {
      elements.userKey.textContent = key;
      
      if (elements.keyContainer) {
        elements.keyContainer.classList.remove('hidden');
      }
    }
  }

  // Request a new user key from the server
  async function requestUserKey() {
    try {
      const response = await fetch('/api/rati/user/key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: getUserId() })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to request user key');
      }
      
      const data = await response.json();
      userKeyData = {
        key: data.key,
        issuedAt: new Date().toISOString()
      };
      
      // Save to localStorage
      localStorage.setItem(`rati_user_key_${getUserId()}`, JSON.stringify(userKeyData));
      
      // Display in UI
      displayUserKey(userKeyData.key);
      
      showNotification('User key obtained successfully!', 'success');
      
      // After getting a key, fetch the packs associated with this user
      fetchPacks();
      
      return userKeyData;
    } catch (error) {
      console.error('Error requesting user key:', error);
      showNotification(error.message || 'Failed to request user key', 'error');
      return null;
    }
  }

  // Save pack to localStorage
  function savePackToLocalStorage(pack) {
    const userId = getUserId();
    const userPacks = getUserPacks();
    
    // Check if pack already exists
    const existingPackIndex = userPacks.findIndex(p => p.packId === pack.packId);
    if (existingPackIndex !== -1) {
      userPacks[existingPackIndex] = pack;
    } else {
      userPacks.push(pack);
    }
    
    localStorage.setItem(`rati_packs_${userId}`, JSON.stringify(userPacks));
  }

  // Get user packs from localStorage
  function getUserPacks() {
    const userId = getUserId();
    const packsJson = localStorage.getItem(`rati_packs_${userId}`);
    return packsJson ? JSON.parse(packsJson) : [];
  }

  // Fetch packs from API and localStorage
  async function fetchPacks(page = 1, limit = 9) {
    try {
      // Ensure user has a key before fetching packs
      if (!userKeyData) {
        const key = getUserKey();
        if (!key) {
          // No key available, show empty state with message
          renderEmptyState('You need a user key to view packs', true);
          return;
        }
      }
      
      // Fetch packs with pagination and user key
      const response = await fetch(`/api/rati/packs/all?page=${page}&limit=${limit}&userKey=${userKeyData.key}`);
      if (!response.ok) {
        throw new Error('Failed to fetch packs');
      }

      const apiData = await response.json();
      const apiPacks = apiData.packs || [];

      // Get packs from localStorage
      const localPacks = getUserPacks();

      // Merge packs, preferring localStorage versions for opened packs
      let mergedPacks = [...apiPacks];
      localPacks.forEach(localPack => {
        if (localPack.opened) {
          mergedPacks = mergedPacks.filter(p => p.packId !== localPack.packId);
          mergedPacks.push(localPack);
        }
      });

      currentPacks = mergedPacks;
      renderPacks(currentPacks);
    } catch (error) {
      console.error('Error fetching packs:', error);
      showNotification('Failed to load packs. Please try again.', 'error');

      // Fallback to localStorage packs if API fails
      const localPacks = getUserPacks();
      if (localPacks.length > 0) {
        currentPacks = localPacks;
        renderPacks(localPacks);
        showNotification('Showing your saved packs.', 'info');
      } else {
        renderEmptyState();
      }
    }
  }

  // Render empty state when no packs are available
  function renderEmptyState(message = 'No packs found', showKeyRequest = false) {
    const { cardContainer } = elements;
    cardContainer.innerHTML = `
      <div class="text-center py-12 glassmorphism rounded-xl">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">${message}</h3>
        <p class="mt-1 text-sm text-gray-500">Get started by redeeming a pack with your encryption key.</p>
        ${showKeyRequest ? `
          <button id="empty-state-request-key" class="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Request User Key
          </button>
        ` : ''}
      </div>
    `;
    
    // Add event listener for the request key button if it exists
    const requestKeyBtn = document.getElementById('empty-state-request-key');
    if (requestKeyBtn) {
      requestKeyBtn.addEventListener('click', requestUserKey);
    }
  }

  // Render packs in the UI
  function renderPacks(packs) {
    const { cardContainer } = elements;

    // Ensure packs is a valid array
    if (!Array.isArray(packs)) {
      console.error('Invalid packs data:', packs);
      renderEmptyState();
      return;
    }

    // Handle empty packs array
    if (packs.length === 0) {
      renderEmptyState();
      return;
    }

    // Create HTML for each pack
    let packsHTML = '';
    packsHTML += '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">';
    
    packs.forEach(pack => {
      // Determine if this pack has been opened
      const isOpened = pack.opened === true;
      
      packsHTML += `
        <div class="pack-card relative" data-id="${pack.packId || 'unknown'}">
          <div class="card ${isOpened ? 'flipped' : ''}">
            <div class="card-face card-back flex flex-col items-center justify-center">
              <div class="text-white text-center">
                <h3 class="font-bold text-lg mb-1">Mystery Pack</h3>
                <p class="text-sm opacity-70">Click to reveal</p>
              </div>
            </div>
            <div class="card-face card-front">
              <div class="card-image-container">
                <img class="card-image" src="${pack.imageUrl || 'https://via.placeholder.com/300x180?text=Card+Pack'}" alt="Card Pack">
              </div>
              <div class="card-content">
                <h3 class="font-semibold text-indigo-800">Pack #${pack.packId || 'Unknown'}</h3>
                ${isOpened ? '<p class="text-xs text-indigo-600">Opened</p>' : '<p class="text-xs text-gray-500">Click to open</p>'}
              </div>
            </div>
          </div>
          ${isOpened ? '<div class="absolute top-2 right-2 bg-indigo-600 text-white text-xs px-2 py-1 rounded-full">Opened</div>' : ''}
        </div>
      `;
    });
    
    packsHTML += '</div>';
    cardContainer.innerHTML = packsHTML;

    // Add event listeners to pack cards
    const packCards = document.querySelectorAll('.card');
    packCards.forEach(card => {
      card.addEventListener('click', () => handlePackClick(card));
    });
  }

  // Handle pack card click
  function handlePackClick(card) {
    const packId = card.parentElement.dataset.id;
    const pack = currentPacks.find(p => p.packId == packId);
    
    if (!pack) {
      showNotification('Pack not found', 'error');
      return;
    }
    
    if (pack.opened) {
      // Pack is already opened, just display content
      displayPackContent(pack);
      if (!card.classList.contains('flipped')) {
        card.classList.add('flipped');
      }
    } else {
      // Pack is not opened, open it
      openPack(packId, card);
    }
  }

  // Open a pack and reveal its contents
  async function openPack(packId, cardElement) {
    try {
      // Ensure user has a key
      if (!userKeyData) {
        showNotification('You need a user key to open packs', 'error');
        return;
      }
      
      const response = await fetch(`/api/rati/packs/${packId}/open`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userKey: userKeyData.key })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to open pack');
      }
      
      const data = await response.json();
      
      // Mark pack as opened
      const packIndex = currentPacks.findIndex(p => p.packId == packId);
      if (packIndex !== -1) {
        currentPacks[packIndex] = {
          ...currentPacks[packIndex],
          ...data.pack,
          opened: true
        };
        
        // Save opened pack to localStorage
        savePackToLocalStorage(currentPacks[packIndex]);
        
        // Flip the card to reveal content
        if (cardElement) {
          cardElement.classList.add('flipped');
        }
        
        // Display the content
        displayPackContent(currentPacks[packIndex]);
        
        showNotification('Pack opened successfully!', 'success');
      }
    } catch (error) {
      console.error('Error opening pack:', error);
      showNotification(error.message || 'Failed to open pack', 'error');
    }
  }

  // Display pack content in the metadata viewer
  function displayPackContent(pack) {
    const { metadataViewer } = elements;
    
    // Format the pack content for display
    let contentHTML = JSON.stringify(pack, null, 2);
    
    // Update metadata viewer
    metadataViewer.textContent = contentHTML;
  }

  // Handle random pack opening
  function openRandomPack() {
    const unopenedPacks = currentPacks.filter(pack => !pack.opened);
    
    if (unopenedPacks.length === 0) {
      showNotification('No unopened packs available', 'warning');
      return;
    }
    
    // Select a random pack
    const randomIndex = Math.floor(Math.random() * unopenedPacks.length);
    const randomPack = unopenedPacks[randomIndex];
    
    // Find card element
    const packCard = document.querySelector(`.pack-card[data-id="${randomPack.packId}"] .card`);
    
    if (packCard) {
      // Scroll to the pack
      packCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Highlight the pack briefly
      packCard.classList.add('ring-4', 'ring-indigo-500', 'ring-opacity-50');
      setTimeout(() => {
        packCard.classList.remove('ring-4', 'ring-indigo-500', 'ring-opacity-50');
        
        // Open the pack after highlighting
        openPack(randomPack.packId, packCard);
      }, 800);
    } else {
      // If card element not found, just open the pack
      openPack(randomPack.packId);
    }
  }

  // Redeem a pack using encryption key
  async function redeemPack() {
    const { encryptionKey } = elements;
    const key = encryptionKey.value.trim();
    
    if (!key) {
      showNotification('Please enter an encryption key', 'warning');
      return;
    }
    
    // Ensure user has a user key
    if (!userKeyData) {
      const userKey = await requestUserKey();
      if (!userKey) {
        showNotification('Failed to get user key. Cannot redeem pack.', 'error');
        return;
      }
    }
    
    try {
      const response = await fetch('/api/rati/packs/redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          encryptionKey: key,
          userKey: userKeyData.key 
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to redeem pack');
      }
      
      const data = await response.json();
      
      // Clear input field
      encryptionKey.value = '';
      
      // Add new packs to current packs
      if (data.packs && Array.isArray(data.packs)) {
        currentPacks = [...currentPacks, ...data.packs];
        renderPacks(currentPacks);
      }
      
      showNotification('Pack redeemed successfully!', 'success');
    } catch (error) {
      console.error('Error redeeming pack:', error);
      showNotification(error.message || 'Failed to redeem pack', 'error');
    }
  }

  // Initialize the app
  function init() {
    // Check for user key first
    getUserKey();
    
    // If no user key, show empty state with request button
    if (!userKeyData) {
      renderEmptyState('You need a user key to view packs', true);
    } else {
      // Load packs if we have a user key
      fetchPacks();
    }
    
    // Add event listeners
    if (elements.openRandomBtn) {
      elements.openRandomBtn.addEventListener('click', openRandomPack);
    }
    
    if (elements.redeemBtn) {
      elements.redeemBtn.addEventListener('click', redeemPack);
    }
    
    if (elements.requestKeyBtn) {
      elements.requestKeyBtn.addEventListener('click', requestUserKey);
    }
    
    // Set up localStorage sync (periodically save opened packs)
    setInterval(() => {
      // Find all opened packs and ensure they're saved
      const openedPacks = currentPacks.filter(pack => pack.opened);
      openedPacks.forEach(pack => savePackToLocalStorage(pack));
    }, 60000); // Every minute
  }

  // Start the app
  init();
});
