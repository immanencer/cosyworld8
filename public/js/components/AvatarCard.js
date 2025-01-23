window.components = window.components || {};

function AvatarCard(avatar, onSelect) {
  const container = document.createElement('div');
  container.className = 'bg-gray-800 rounded-lg p-2 cursor-pointer hover:bg-gray-700 transition-colors';
  container.onclick = () => onSelect(avatar);

  const allAvatars = [avatar, ...(avatar.alternateAvatars || [])];
  let currentImageIndex = 0;

  const imageContainer = document.createElement('div');
  imageContainer.className = 'relative mb-2';

  const img = document.createElement('img');
  img.className = 'w-full aspect-square object-cover rounded-lg';
  imageContainer.appendChild(img);

  if (allAvatars.length > 1) {
    const countBadge = document.createElement('span');
    countBadge.className = 'absolute top-1 right-1 bg-blue-500 text-xs rounded-full w-5 h-5 flex items-center justify-center';
    countBadge.textContent = allAvatars.length;
    imageContainer.appendChild(countBadge);
  }

  const infoContainer = document.createElement('div');
  infoContainer.className = 'space-y-1';

  const headerRow = document.createElement('div');
  headerRow.className = 'flex items-center gap-1 justify-between';

  const name = document.createElement('h3');
  name.className = 'text-sm font-bold truncate';
  name.textContent = avatar.name;
  headerRow.appendChild(name);

  const tier = window.utils.getTierFromModel(avatar.model);
  headerRow.appendChild(window.components.TierBadge(tier));

  const messageCount = document.createElement('div');
  messageCount.className = 'flex items-center gap-1 text-xs text-gray-400';
  messageCount.innerHTML = `<span>✉️ ${avatar.messageCount}</span>`;

  infoContainer.appendChild(headerRow);
  infoContainer.appendChild(messageCount);
  infoContainer.appendChild(window.components.StatsDisplay(avatar.stats, 'small'));

  container.appendChild(imageContainer);
  container.appendChild(infoContainer);

  // Image rotation logic
  function updateImage() {
    const currentAvatar = allAvatars[currentImageIndex];
    img.src = currentAvatar.thumbnailUrl || currentAvatar.imageUrl;
    img.alt = currentAvatar.name;
  }

  updateImage();

  if (allAvatars.length > 1) {
    const interval = setInterval(() => {
      currentImageIndex = (currentImageIndex + 1) % allAvatars.length;
      updateImage();
    }, 3000);

    // Cleanup method
    container.cleanup = () => clearInterval(interval);
  }

  return container;
}

window.components.AvatarCard = AvatarCard;

// Avatar Search Component (Remains unchanged as it's not part of the conversion request)
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