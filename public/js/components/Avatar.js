
import { useState, useEffect } from 'react';

// Avatar Card Component
export const AvatarCard = React.memo(({ avatar, onSelect }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const allAvatars = [avatar, ...(avatar.alternateAvatars || [])];

  useEffect(() => {
    if (allAvatars.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % allAvatars.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [allAvatars.length]);

  const currentAvatar = allAvatars[currentImageIndex];
  const tier = getTierFromModel(avatar.model);

  return (
    <div
      onClick={() => onSelect(avatar)}
      className="bg-gray-800 rounded-lg p-2 cursor-pointer hover:bg-gray-700 transition-colors"
    >
      <div className="relative mb-2">
        <img
          src={currentAvatar.thumbnailUrl || currentAvatar.imageUrl}
          alt={currentAvatar.name}
          className="w-full aspect-square object-cover rounded-lg"
        />
        {allAvatars.length > 1 && (
          <span className="absolute top-1 right-1 bg-blue-500 text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {allAvatars.length}
          </span>
        )}
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-1 justify-between">
          <h3 className="text-sm font-bold truncate">{avatar.name}</h3>
          <TierBadge tier={tier} />
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <span>✉️ {avatar.messageCount}</span>
        </div>
        <StatsDisplay stats={avatar.stats} size="small" />
      </div>
    </div>
  );
});

// Avatar Search Component
export const AvatarSearch = React.memo(({ onSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const searchTimeout = useRef(null);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/avatars/search?name=${encodeURIComponent(query)}`);
        const data = await response.json();
        setResults(data.avatars || []);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout.current);
  }, [query]);

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search avatars..."
        className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {loading && (
        <div className="absolute right-3 top-3">
          <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
        </div>
      )}
      {results.length > 0 && (
        <div className="absolute mt-1 w-full bg-gray-800 rounded-lg shadow-lg z-50 max-h-60 overflow-auto">
          {results.map((avatar) => (
            <div
              key={avatar._id}
              className="flex items-center gap-3 p-2 hover:bg-gray-700 cursor-pointer"
              onClick={() => {
                onSelect(avatar);
                setQuery('');
                setResults([]);
              }}
            >
              <img
                src={avatar.thumbnailUrl || avatar.imageUrl}
                alt={avatar.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <div className="font-medium">{avatar.name}</div>
                {avatar.emoji && <div className="text-sm text-gray-400">{avatar.emoji}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});
