window.components = window.components || {};

function ViewToggle(currentView, onViewChange) {
  const container = document.createElement('div');
  container.className = 'flex justify-center gap-4 mb-8';

  const views = [
    { name: 'collection', label: 'Collection', color: 'blue' },
    { name: 'leaderboard', label: 'Leaderboard', color: 'purple' },
    { name: 'combat', label: 'Combat Log', color: 'red' },
    { name: 'tribes', label: 'Tribes', color: 'green' }
  ];

  views.forEach(view => {
    const button = document.createElement('button');
    button.className = `px-4 py-2 rounded ${
      currentView === view.name ? `bg-${view.color}-600 text-white` : 'bg-gray-700 text-gray-300'
    }`;
    button.textContent = view.label;
    button.onclick = () => onViewChange(view.name);
    container.appendChild(button);
  });

  return container;
}

window.components.ViewToggle = ViewToggle;