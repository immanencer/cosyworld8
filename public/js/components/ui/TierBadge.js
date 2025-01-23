
// Initialize window components
window.components = window.components || {};

function TierBadge(tier) {
  const colors = {
    'S': 'bg-purple-600',
    'A': 'bg-blue-600', 
    'B': 'bg-green-600',
    'C': 'bg-yellow-600',
    'U': 'bg-gray-600'
  };

  const span = document.createElement('span');
  span.className = `px-2 py-1 rounded text-xs font-bold ${colors[tier] || colors['U']}`;
  span.textContent = `Tier ${tier}`;
  return span;
}

// Add TierBadge to window components
window.components.TierBadge = TierBadge;
