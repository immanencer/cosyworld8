
window.components = window.components || {};

function CombatLog(onAvatarSelect) {
  const container = document.createElement('div');
  container.className = 'space-y-4';
  
  async function fetchCombatLog() {
    try {
      const response = await fetch('/api/dungeon/log');
      const data = await response.json();
      renderCombatLog(data);
    } catch (error) {
      console.error('Error fetching combat log:', error);
    }
  }

  function renderCombatLog(combatLog) {
    container.innerHTML = ''; // Clear existing content
    
    const title = document.createElement('h2');
    title.className = 'text-2xl font-bold mb-6';
    title.textContent = 'Recent Combat Actions';
    container.appendChild(title);

    const logContainer = document.createElement('div');
    logContainer.className = 'space-y-4 max-w-3xl mx-auto';

    if (combatLog.length === 0) {
      const emptyState = document.createElement('div');
      emptyState.className = 'text-center py-8 text-gray-500';
      emptyState.innerHTML = `
        <div class="text-4xl mb-2">⚔️</div>
        <div>No combat actions yet</div>
      `;
      logContainer.appendChild(emptyState);
    } else {
      combatLog.forEach((entry, index) => {
        const entryElement = CombatLogEntry(entry, onAvatarSelect);
        logContainer.appendChild(entryElement);
      });
    }

    container.appendChild(logContainer);
  }

  // Initial fetch
  fetchCombatLog();
  
  // Set up polling
  const interval = setInterval(fetchCombatLog, 5000);
  
  // Cleanup method
  container.cleanup = () => clearInterval(interval);
  
  return container;
}

function CombatLogEntry(entry, onAvatarClick) {
  const entryContainer = document.createElement('div');
  entryContainer.className = 'bg-gray-800 rounded-lg p-4';

  const header = document.createElement('div');
  header.className = 'flex items-center gap-2 mb-2';
  
  if (entry.attacker) {
    const attackerImg = document.createElement('img');
    attackerImg.src = entry.attacker.thumbnailUrl || entry.attacker.imageUrl;
    attackerImg.alt = entry.attacker.name;
    attackerImg.className = 'w-8 h-8 rounded-full cursor-pointer';
    attackerImg.onclick = () => onAvatarClick(entry.attacker);
    header.appendChild(attackerImg);
  }

  const actionText = document.createElement('span');
  actionText.className = 'text-sm';
  actionText.textContent = entry.action || 'Unknown action';
  header.appendChild(actionText);

  if (entry.target) {
    const targetImg = document.createElement('img');
    targetImg.src = entry.target.thumbnailUrl || entry.target.imageUrl;
    targetImg.alt = entry.target.name;
    targetImg.className = 'w-8 h-8 rounded-full cursor-pointer';
    targetImg.onclick = () => onAvatarClick(entry.target);
    header.appendChild(targetImg);
  }

  const timestamp = document.createElement('span');
  timestamp.className = 'text-xs text-gray-500 ml-auto';
  timestamp.textContent = new Date(entry.timestamp).toLocaleString();
  header.appendChild(timestamp);

  entryContainer.appendChild(header);

  if (entry.result) {
    const result = document.createElement('div');
    result.className = 'mt-2 text-sm text-gray-300';
    result.textContent = entry.result;
    entryContainer.appendChild(result);
  }

  return entryContainer;
}

window.components.CombatLog = CombatLog;
window.components.CombatLogEntry = CombatLogEntry;
