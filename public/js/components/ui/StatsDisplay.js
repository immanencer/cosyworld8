
window.components = window.components || {};

function StatsDisplay(stats, size = "small") {
  const { hp = 0, attack = 0, defense = 0 } = stats || {};
  const container = document.createElement('div');
  
  if (size === "small") {
    container.className = "flex gap-2 text-xs text-gray-400";
    if (hp > 0) {
      const hpSpan = document.createElement('span');
      hpSpan.title = "HP";
      hpSpan.textContent = `❤️ ${hp}`;
      container.appendChild(hpSpan);
    }
    if (attack > 0) {
      const attackSpan = document.createElement('span');
      attackSpan.title = "Attack";
      attackSpan.textContent = `⚔️ ${attack}`;
      container.appendChild(attackSpan);
    }
    if (defense > 0) {
      const defenseSpan = document.createElement('span');
      defenseSpan.title = "Defense";
      defenseSpan.textContent = `🛡️ ${defense}`;
      container.appendChild(defenseSpan);
    }
  } else {
    container.className = "space-y-4";
    
    if (hp > 0) {
      const hpContainer = document.createElement('div');
      hpContainer.className = "flex justify-center";
      const hpContent = document.createElement('div');
      hpContent.className = "text-lg font-bold";
      hpContent.textContent = `❤️ ${hp}`;
      hpContainer.appendChild(hpContent);
      container.appendChild(hpContainer);
    }

    const statsGrid = document.createElement('div');
    statsGrid.className = "grid grid-cols-2 gap-2 text-center";
    
    const attackDiv = document.createElement('div');
    attackDiv.className = "bg-gray-800 rounded p-2";
    attackDiv.innerHTML = `
      <div class="text-sm text-gray-400">Attack</div>
      <div class="text-xl">⚔️ ${attack}</div>
    `;
    
    const defenseDiv = document.createElement('div');
    defenseDiv.className = "bg-gray-800 rounded p-2";
    defenseDiv.innerHTML = `
      <div class="text-sm text-gray-400">Defense</div>
      <div class="text-xl">🛡️ ${defense}</div>
    `;
    
    statsGrid.appendChild(attackDiv);
    statsGrid.appendChild(defenseDiv);
    container.appendChild(statsGrid);
  }
  
  return container;
}

window.components.StatsDisplay = StatsDisplay;
