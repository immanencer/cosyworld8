
function ViewToggle({ currentView, onViewChange }) {
  return (
    <div className="flex justify-center gap-4 mb-8">
      <button
        className={`px-4 py-2 rounded ${
          currentView === 'collection' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
        }`}
        onClick={() => onViewChange('collection')}
      >
        Collection
      </button>
      <button
        className={`px-4 py-2 rounded ${
          currentView === 'leaderboard' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'
        }`}
        onClick={() => onViewChange('leaderboard')}
      >
        Leaderboard
      </button>
      <button
        className={`px-4 py-2 rounded ${
          currentView === 'combat' ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300'
        }`}
        onClick={() => onViewChange('combat')}
      >
        Combat Log
      </button>
      <button
        className={`px-4 py-2 rounded ${
          currentView === 'tribes' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300'
        }`}
        onClick={() => onViewChange('tribes')}
      >
        Tribes
      </button>
    </div>
  );
}

export { ViewToggle };
