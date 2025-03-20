/**
 * Avatar Details Component
 * A modular component for displaying avatar details
 */

// Component configuration
const config = {
  sizes: {
    small: 'w-16 h-16',
    medium: 'w-24 h-24',
    large: 'w-32 h-32',
    xlarge: 'w-48 h-48'
  }
};

/**
 * Renders an avatar image with appropriate styling
 * @param {Object} params - Parameters
 * @param {string} params.imageUrl - URL of the avatar image
 * @param {string} params.name - Name of the avatar (for alt text and fallback)
 * @param {string} params.size - Size preset ('small', 'medium', 'large', 'xlarge')
 * @param {string} params.className - Additional CSS classes
 * @returns {string} HTML string for the avatar image
 */
function renderAvatarImage({ imageUrl, name = 'Unknown', size = 'medium', className = '' }) {
  const sizeClass = config.sizes[size] || config.sizes.medium;
  const safeName = name || 'Unknown';
  const initial = safeName.charAt(0).toUpperCase();

  if (!imageUrl) {
    // Render placeholder with first letter of name if no image
    return `
      <div class="avatar-image ${sizeClass} ${className} bg-gray-700 rounded-full flex items-center justify-center text-2xl font-bold text-white">
        ${initial}
      </div>
    `;
  }

  return `
    <div class="avatar-image-container ${className}">
      <img 
        src="${imageUrl}" 
        alt="${safeName}" 
        class="avatar-image ${sizeClass} object-cover rounded-full border-2 border-gray-600"
        onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'100\\' height=\\'100\\' viewBox=\\'0 0 100 100\\'%3E%3Crect fill=\\'%23333\\' width=\\'100\\' height=\\'100\\'/%3E%3Ctext fill=\\'%23FFF\\' x=\\'50\\' y=\\'50\\' font-size=\\'50\\' text-anchor=\\'middle\\' dominant-baseline=\\'middle\\'%3E${initial}%3C/text%3E%3C/svg%3E';"
      >
    </div>
  `;
}

/**
 * Renders avatar stats (level, experience, etc.)
 * @param {Object} params - Parameters
 * @param {Object} params.stats - Avatar stats object
 * @param {string} params.className - Additional CSS classes
 * @returns {string} HTML string for stats
 */
function renderAvatarStats({ stats = {}, className = '' }) {
  const hp = stats.hp || 0;
  const strength = stats.strength || 10;
  const dexterity = stats.dexterity || 10;
  const constitution = stats.constitution || 10;
  const intelligence = stats.intelligence || 10;
  const wisdom = stats.wisdom || 10;
  const charisma = stats.charisma || 10;

  // Calculate modifiers
  const getModifier = (score) => Math.floor((score - 10) / 2);
  const strMod = getModifier(strength);
  const dexMod = getModifier(dexterity);
  const conMod = getModifier(constitution);
  const intMod = getModifier(intelligence);
  const wisMod = getModifier(wisdom);
  const chaMod = getModifier(charisma);

  // Calculate derived stats
  const ac = 10 + dexMod;
  const initiative = dexMod;

  return `
    <div class="avatar-stats ${className} bg-gray-800 p-4 rounded-lg">
      <div class="flex justify-between items-center mb-3 border-b border-gray-700 pb-3">
        <h3 class="text-lg font-bold">Character Stats</h3>
      </div>

      <div class="grid grid-cols-3 gap-4 mb-4">
        <div class="text-center">
          <div class="text-2xl font-bold text-red-500">${hp}</div>
          <div class="text-xs text-gray-400">HP</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-blue-500">${ac}</div>
          <div class="text-xs text-gray-400">AC</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-green-500">${initiative}</div>
          <div class="text-xs text-gray-400">Initiative</div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-2 text-sm">
        <div class="flex justify-between items-center">
          <span>STR</span>
          <span class="font-semibold">${strength} (${strMod >= 0 ? '+' + strMod : strMod})</span>
        </div>
        <div class="flex justify-between items-center">
          <span>DEX</span>
          <span class="font-semibold">${dexterity} (${dexMod >= 0 ? '+' + dexMod : dexMod})</span>
        </div>
        <div class="flex justify-between items-center">
          <span>CON</span>
          <span class="font-semibold">${constitution} (${conMod >= 0 ? '+' + conMod : conMod})</span>
        </div>
        <div class="flex justify-between items-center">
          <span>INT</span>
          <span class="font-semibold">${intelligence} (${intMod >= 0 ? '+' + intMod : intMod})</span>
        </div>
        <div class="flex justify-between items-center">
          <span>WIS</span>
          <span class="font-semibold">${wisdom} (${wisMod >= 0 ? '+' + wisMod : wisMod})</span>
        </div>
        <div class="flex justify-between items-center">
          <span>CHA</span>
          <span class="font-semibold">${charisma} (${chaMod >= 0 ? '+' + chaMod : chaMod})</span>
        </div>
      </div>
    </div>
  `;
}

/**
 * Renders avatar skills and proficiencies
 * @param {Object} params - Parameters
 * @param {Array} params.skills - Avatar skills array
 * @param {string} params.className - Additional CSS classes
 * @returns {string} HTML string for skills section
 */
function renderAvatarSkills({ skills = [], className = '' }) {
  if (!skills || !skills.length) {
    return `
      <div class="avatar-skills ${className} bg-gray-800 p-4 rounded-lg">
        <h3 class="text-lg font-bold mb-2">Skills</h3>
        <p class="text-gray-400">No skills available</p>
      </div>
    `;
  }

  return `
    <div class="avatar-skills ${className} bg-gray-800 p-4 rounded-lg">
      <h3 class="text-lg font-bold mb-2">Skills</h3>
      <div class="flex flex-wrap gap-2">
        ${skills.map(skill => `
          <span class="bg-gray-700 text-gray-200 px-2 py-1 rounded text-xs">
            ${skill}
          </span>
        `).join('')}
      </div>
    </div>
  `;
}

/**
 * Renders avatar description section
 * @param {Object} params - Parameters 
 * @param {string} params.description - Avatar description
 * @param {string} params.className - Additional CSS classes
 * @returns {string} HTML string for description
 */
function renderAvatarDescription({ description = '', className = '' }) {
  return `
    <div class="avatar-description ${className} bg-gray-800 p-4 rounded-lg">
      <h3 class="text-lg font-bold mb-2">Description</h3>
      <p class="text-gray-200">${description || 'No description available.'}</p>
    </div>
  `;
}

/**
 * Main function to render complete avatar details
 * @param {Object} avatar - Avatar data object
 * @param {Object} options - Display options
 * @param {boolean} options.isEditable - Whether avatar is editable
 * @param {Function} options.onEdit - Edit callback function
 * @param {string} options.className - Additional CSS classes
 * @param {Object} options.claimInfo - Claim status information
 * @returns {string} Complete HTML for avatar details
 */
function renderAvatarDetails(avatar, options = {}) {
  const { isEditable = false, onEdit = null, className = '', claimInfo = null } = options;

  // Extract properties with defaults
  const {
    id = '',
    name = 'Unknown Avatar',
    imageUrl = '',
    level = 1,
    experience = 0,
    skills = [],
    description = '',
    stats = {},
    lastActive = null,
    templateId,
    collectionId
  } = avatar;

  // Format date for last active
  const formattedDate = lastActive ? new Date(lastActive).toLocaleDateString() : 'Unknown';

  // Calculate tier based on model
  const getTier = (model) => {
    if (!model) return "U"; // Unknown
    if (model.includes("gpt-4")) return "S";
    if (model.includes("gpt-3.5")) return "A";
    if (model.includes("claude")) return "B";
    return "C";
  };

  const getTierColor = (model) => {
    const tier = getTier(model);
    const colors = {
      S: "bg-purple-600",
      A: "bg-blue-600",
      B: "bg-green-600",
      C: "bg-yellow-600",
      U: "bg-gray-600",
    };
    return colors[tier] || colors.U;
  };

  const tierClass = getTierColor(avatar.model);
  const tier = getTier(avatar.model);

  // Extract claim info if provided
  const isClaimed = claimInfo?.claimed || false;
  const claimedBy = claimInfo?.claimedBy || '';
  const isClaimedByCurrentWallet = claimInfo?.isClaimedByCurrentWallet || false;
  
  return `
    <div class="avatar-details-container ${className} bg-gray-900 rounded-lg overflow-hidden">
      <!-- Header with avatar image, name, and tier -->
      <div class="flex flex-col md:flex-row items-center p-4 bg-gray-800 border-b border-gray-700">
        <div class="flex-shrink-0 mb-4 md:mb-0 relative">
          ${renderAvatarImage({ imageUrl, name, size: 'large' })}
          ${isClaimed ? `<div class="absolute -top-2 -right-2 bg-green-500 rounded-full w-8 h-8 flex items-center justify-center text-lg shadow-md">✓</div>` : ''}
        </div>

        <div class="md:ml-6 flex-grow text-center md:text-left">
          <div class="flex flex-col md:flex-row md:items-center justify-between">
            <h2 class="text-3xl font-bold">${name}</h2>

            <div class="flex items-center mt-2 md:mt-0">
              <span class="px-2 py-1 rounded text-xs font-bold ${tierClass}">
                Tier ${tier}
              </span>

              ${isEditable && onEdit ? `
                <button 
                  class="ml-3 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                  onclick="(${onEdit.toString()})('${id}')"
                >
                  Edit
                </button>
              ` : ''}
            </div>
          </div>

          <div class="mt-2 text-gray-400 text-sm">
            <span>Level ${level}</span>
            <span class="mx-2">•</span>
            <span>XP: ${experience}</span>
            ${lastActive ? `<span class="mx-2">•</span><span>Last active: ${formattedDate}</span>` : ''}
          </div>
          
          <!-- Claim status information at the top -->
          ${isClaimed ? `
            <div class="mt-3 py-2 px-3 bg-gray-700 rounded-md inline-flex items-center">
              <span class="text-green-400 mr-2">✓</span>
              <span>Claimed by ${shortenAddress ? shortenAddress(claimedBy) : claimedBy}</span>
              ${isClaimedByCurrentWallet ? '<span class="ml-2 text-blue-400">(You)</span>' : ''}
            </div>
          ` : ''}
        </div>
      </div>

      <!-- Content area -->
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <!-- Stats section -->
          ${renderAvatarStats({ stats })}

          <!-- Skills section -->
          ${renderAvatarSkills({ skills })}
        </div>

        <!-- Description section -->
        ${renderAvatarDescription({ description })}
      </div>
    </div>
  `;
}

/**
 * Renders a compact avatar card
 * @param {Object} avatar - Avatar data object
 * @param {Function} onClick - Click handler function
 * @param {boolean} isClaimed - Whether the avatar is claimed
 * @param {string} claimedBy - Address of the claimer
 * @returns {string} HTML string for compact avatar card
 */
function renderAvatarCard(avatar = {}, onClick = null, isClaimed = false, claimedBy = '') {
  // Extract with safe defaults
  const id = avatar?._id || '';
  const name = avatar?.name || 'Unknown';
  const imageUrl = avatar?.imageUrl || ''; // Direct image URL instead of thumbnail
  const model = avatar?.model || '';

  // Calculate tier
  const getTier = (model) => {
    if (!model) return "U";
    if (model.includes("gpt-4")) return "S";
    if (model.includes("gpt-3.5")) return "A";
    if (model.includes("claude")) return "B";
    return "C";
  };

  const getTierColor = (model) => {
    const tier = getTier(model);
    const colors = {
      S: "bg-purple-600",
      A: "bg-blue-600",
      B: "bg-green-600",
      C: "bg-yellow-600",
      U: "bg-gray-600",
    };
    return colors[tier] || colors.U;
  };

  const clickHandler = onClick ? `onclick="${onClick}('${id}')"` : '';

  return `
    <div class="avatar-card bg-gray-800 p-3 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer ${isClaimed ? 'border-l-2 border-green-500' : ''}" ${clickHandler}>
      <div class="flex items-center gap-3">
        <div class="relative">
          ${renderAvatarImage({ imageUrl, name, size: 'small' })}
          ${isClaimed ? `<div class="absolute -top-1 -right-1 bg-green-500 rounded-full w-5 h-5 flex items-center justify-center text-xs" title="Claimed by ${claimedBy}">✓</div>` : ''}
        </div>

        <div class="flex-1 min-w-0">
          <h3 class="text-lg font-semibold truncate">${name}</h3>

          <div class="flex items-center gap-2 mt-1">
            <span class="px-2 py-0.5 rounded text-xs font-bold ${getTierColor(model)}">
              Tier ${getTier(model)}
            </span>
            ${avatar.score ? `<span class="text-xs text-gray-400">Score: ${avatar.score}</span>` : ''}
            ${isClaimed ? `<span class="text-xs text-green-400">Claimed</span>` : ''}
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Renders a compact avatar card specifically for the leaderboard
 * @param {Object} avatar - Avatar data object
 * @param {boolean} isClaimed - Whether the avatar is claimed 
 * @returns {string} HTML string for leaderboard avatar card
 */
function renderLeaderboardCard(avatar = {}, isClaimed = false) {
  // Extract with safe defaults
  const id = avatar?._id || '';
  const name = avatar?.name || 'Unknown';
  const imageUrl = avatar?.imageUrl || ''; // Direct image URL instead of thumbnail
  const model = avatar?.model || '';
  const score = avatar?.score || 0;

  // Calculate tier
  const getTier = (model) => {
    if (!model) return "U";
    if (model.includes("gpt-4")) return "S";
    if (model.includes("gpt-3.5")) return "A";
    if (model.includes("claude")) return "B";
    return "C";
  };

  const getTierColor = (model) => {
    const tier = getTier(model);
    const colors = {
      S: "bg-purple-600",
      A: "bg-blue-600",
      B: "bg-green-600",
      C: "bg-yellow-600",
      U: "bg-gray-600",
    };
    return colors[tier] || colors.U;
  };

  return `
    <div class="avatar-card bg-gray-800 p-3 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer ${isClaimed ? 'border-l-2 border-green-500' : ''}">
      <div class="flex gap-3 items-center">
        <div class="relative">
          ${renderAvatarImage({ imageUrl, name, size: 'small' })}
          ${isClaimed ? `<div class="absolute -top-1 -right-1 bg-green-500 rounded-full w-5 h-5 flex items-center justify-center text-xs">✓</div>` : ''}
        </div>

        <div class="flex-1 min-w-0">
          <h3 class="text-sm font-semibold truncate">${name}</h3>
          <p class="text-xs text-gray-400">Score: ${score}</p>

          <div class="flex items-center gap-2 mt-1">
            <span class="px-1.5 py-0.5 rounded text-xs font-bold ${getTierColor(model)}">
              Tier ${getTier(model)}
            </span>
            ${isClaimed ? `<span class="text-xs text-green-400">Claimed</span>` : ''}
          </div>
        </div>
      </div>
    </div>
  `;
}

// Avatar detail modal generation
function generateAvatarDetailModal(avatar) {
  if (!avatar) return '';

  const {
    _id,
    name,
    emoji,
    description,
    imageUrl,
    model,
    createdAt,
    messageCount = 0,
    actionCount = 0,
    narrationCount = 0,
    stats = {},
    templateId,
    collectionId
  } = avatar;

  return `
    <div id="avatar-detail-modal" class="modal">
      <div class="modal-content bg-surface-800 p-6 rounded-lg shadow-lg">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-2xl font-bold">${name}</h2>
          <button id="close-avatar-detail" class="text-gray-400 hover:text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="flex items-center mb-4">
          ${renderAvatarImage({imageUrl, name, size: 'large'})}
          <div class="ml-4">
            <p class="text-sm text-gray-400">${description}</p>
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <div class="flex justify-between items-center">
            <span class="text-gray-400">Created At:</span>
            <span class="text-gray-300">${createdAt}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-400">Messages:</span>
            <span class="text-gray-300">${messageCount}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-400">Actions:</span>
            <span class="text-gray-300">${actionCount}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-400">Narrations:</span>
            <span class="text-gray-300">${narrationCount}</span>
          </div>
        </div>

        <div class="flex space-x-2 mt-6">
          <button id="close-avatar-detail" class="px-4 py-2 bg-surface-700 hover:bg-surface-600 rounded-lg transition">
            Close
          </button>
          <button id="claim-btn" class="px-4 py-2 bg-primary-600 hover:bg-primary-500 rounded-lg transition flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 9.563C9 9.252 9.252 9 9.563 9h4.874c.311 0 .563.252.563.563v4.874c0 .311-.252.563-.563.563H9.564A.562.562 0 019 14.437V9.564z" />
            </svg>
            Claim
          </button>
          ${avatar.templateId && avatar.collectionId ? `
          <a href="/checkout.html?templateId=${avatar.templateId}&collectionId=${avatar.collectionId}" 
             class="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg transition flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
            </svg>
            Collect
          </a>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}

// Helper function to shorten addresses if not already available globally
function shortenAddress(address) {
  if (typeof address !== 'string') return '';
  return address.slice(0, 6) + '...' + address.slice(-4);
}

// Export functions
window.AvatarDetails = {
  renderAvatarDetails,
  renderAvatarCard,
  renderLeaderboardCard,
  renderAvatarImage,
  renderAvatarStats,
  renderAvatarSkills,
  renderAvatarDescription,
  generateAvatarDetailModal,
  shortenAddress
};