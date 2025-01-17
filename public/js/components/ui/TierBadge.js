
function TierBadge({ tier }) {
  const colors = {
    S: 'bg-purple-600',
    A: 'bg-blue-600',
    B: 'bg-green-600',
    C: 'bg-yellow-600',
    U: 'bg-gray-600'
  };

  const tierLabels = {
    S: 'Legendary',
    A: 'Rare',
    B: 'Uncommon',
    C: 'Common',
    U: 'Unknown'
  };

  return (
    <span 
      className={`${colors[tier]} px-2 py-1 rounded text-xs font-bold`} 
      title={tierLabels[tier]}
    >
      Tier {tier}
    </span>
  );
}

export { TierBadge };
