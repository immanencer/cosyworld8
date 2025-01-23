const TierBadge = ({ tier }) => {
  const colors = {
    'S': 'bg-purple-600',
    'A': 'bg-blue-600',
    'B': 'bg-green-600',
    'C': 'bg-yellow-600',
    'U': 'bg-gray-600'
  };

  return React.createElement('span', {
    className: `px-2 py-1 rounded text-xs font-bold ${colors[tier] || colors['U']}`
  }, `Tier ${tier}`);
};

// Initialize window.components if not exists
window.components = window.components || {};

// Add TierBadge to components
window.components.TierBadge = TierBadge;