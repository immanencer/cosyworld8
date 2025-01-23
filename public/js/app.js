const { useState, useEffect } = React;
const { createRoot } = ReactDOM;

// const { getTierFromModel } = './utils/index';

const WalletButton = window.WalletButton;

function TabButton({ label, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg ${isActive ? "bg-blue-600" : "bg-gray-700"}`}
    >
      {label}
    </button>
  );
}

function AvatarModal({ isOpen, onClose, avatar, wallet }) {
  const [activityData, setActivityData] = useState({
    messages: [],
    memories: [],
    narratives: [],
    location: null,
    dungeonStats: avatar?.stats || { attack: 0, defense: 0, hp: 0 },
    dungeonActions: []
  });

  useEffect(() => {
    if (avatar?._id && isOpen) {
      Promise.all([
        fetch(`/api/avatars/${avatar._id}/narratives`).then(r => r.json()),
        fetch(`/api/avatars/${avatar._id}/memories`).then(r => r.json()),
        fetch(`/api/avatars/${avatar._id}/location`).then(r => r.json()),
        fetch(`/api/avatars/${avatar._id}/actions`).then(r => r.json())
      ])
      .then(([narrativeData, memoryData, locationData, actionsData]) => {
        setActivityData({
          messages: narrativeData?.recentMessages || [],
          memories: memoryData?.memories || [],
          narratives: narrativeData?.narratives || [],
          location: locationData?.location,
          dungeonStats: avatar?.stats || narrativeData?.dungeonStats,
          dungeonActions: actionsData?.actions || []
        });
      })
      .catch(error => console.error("Error fetching activity data:", error));
    }
  }, [avatar?._id, isOpen]);

  if (!isOpen || !avatar) return null;

  const tier = getTierFromModel(avatar.model);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-7xl w-full max-h-[90vh] overflow-y-auto relative">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <span className="text-3xl">{avatar.emoji}</span>
            <div>
              <h2 className="text-2xl font-bold text-white">{avatar.name}</h2>
              <div className="flex items-center gap-2">
                <TierBadge tier={tier} />
                {avatar.model && <span className="text-sm text-gray-400">{avatar.model}</span>}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">×</button>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Left Column: Image and Stats */}
          <div className="col-span-4">
            <div className="relative aspect-square mb-4">
              <img 
                src={avatar.thumbnailUrl || avatar.imageUrl} 
                alt={avatar.name}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            
            <div className="bg-gray-700 rounded-lg p-4 mb-4">
              <h3 className="text-xl font-bold mb-2 text-white">Stats</h3>
              <StatsDisplay stats={activityData.dungeonStats} size="large" />
              {wallet && (
                <div className="mt-4">
                  <XAuthButton
                    avatarId={avatar._id}
                    walletAddress={wallet.publicKey.toString()}
                  />
                </div>
              )}
            </div>

            {activityData.location && (
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-xl font-bold mb-2 text-white">Current Location</h3>
                <p className="text-gray-300">{activityData.location.name}</p>
              </div>
            )}
          </div>

          {/* Right Column: Description and Activity */}
          <div className="col-span-8 space-y-4">
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-xl font-bold mb-2 text-white">Description</h3>
              <div className="prose prose-invert max-w-none">
                <MarkdownContent content={avatar.description} />
              </div>
            </div>

            {avatar.personality && (
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-xl font-bold mb-2 text-white">Personality</h3>
                <div className="prose prose-invert max-w-none">
                  <MarkdownContent content={avatar.personality} />
                </div>
              </div>
            )}

            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-xl font-bold mb-2 text-white">Recent Activity</h3>
              <ActivityFeed
                messages={activityData.messages}
                memories={activityData.memories}
                narratives={activityData.narratives}
                dungeonActions={activityData.dungeonActions}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


function App() {
  const [wallet, setWallet] = useState(null);
  const [activeTab, setActiveTab] = useState("owned");
  const [leaderboard, setLeaderboard] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [selectedAvatar, setSelectedAvatar] = useState(null); // Added state for modal
  const [isModalOpen, setIsModalOpen] = useState(false); // Added state for modal


  useEffect(() => {
    if (activeTab === "leaderboard") {
      setLeaderboard([]); // Reset when switching to leaderboard
      setPage(1); // Reset page
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "leaderboard") {
      const fetchLeaderboard = async () => {
        setLoading(true);
        try {
          const response = await fetch(`/api/leaderboard?page=${page}&limit=12`);
          const data = await response.json();
          setLeaderboard(prev => {
            const newAvatars = data.avatars.filter(
              newAvatar => !prev.some(existingAvatar => existingAvatar._id === newAvatar._id)
            );
            return [...prev, ...newAvatars];
          });
          setHasMore(data.avatars.length === 12);
        } catch (error) {
          console.error('Error fetching leaderboard:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchLeaderboard();
    }
  }, [page, activeTab]);

  const handleWalletChange = (newWallet) => {
    setWallet(newWallet);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "owned":
        return <div className="text-center py-12">Your owned avatars will appear here</div>;
      case "gallery":
        return <div className="text-center py-12">Gallery content coming soon</div>;
      case "leaderboard":
        return (
          <div>
            <div className="space-y-4">
              {leaderboard.map((avatar) => (
                <div
                  key={avatar._id}
                  className="bg-gray-800 p-4 rounded-lg flex items-center gap-4 cursor-pointer"
                  onClick={() => { setSelectedAvatar(avatar); setIsModalOpen(true); }} // Open modal on click
                >
                  <div className={`relative shrink-0 ring-2 rounded-full p-1 ${
                    {
                      'S': 'ring-purple-600',
                      'A': 'ring-blue-600',
                      'B': 'ring-green-600',
                      'C': 'ring-yellow-600',
                      'U': 'ring-gray-600'
                    }[window.getTierFromModel(avatar.model)]
                  }`}>
                    <img
                      src={avatar.thumbnailUrl || avatar.imageUrl}
                      alt={avatar.name}
                      className="w-16 h-16 object-cover rounded-full"
                    />
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-lg font-semibold">{avatar.name}</h3>
                    <p className="text-sm text-gray-400">Score: {avatar.score}</p>
                    {avatar.model && (
                      <p className="text-xs text-gray-500">{avatar.model}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {hasMore && (
              <div
                ref={node => {
                  if (!node) return;

                  const observer = new IntersectionObserver(entries => {
                    if (entries[0].isIntersecting && !loading && hasMore) {
                      setPage(prevPage => prevPage + 1);
                    }
                  }, {
                    rootMargin: '100px',
                    threshold: 0.1
                  });

                  observer.observe(node);

                  // Store observer reference for cleanup
                  if (node._observer) {
                    node._observer.disconnect();
                  }
                  node._observer = observer;
                }}
                className="h-10 flex items-center justify-center"
              >
                {loading && <p>Loading more...</p>}
              </div>
            )}
          </div>
        );
      case "tribes":
        return <div className="text-center py-12">Tribes content coming soon</div>;
      default:
        return null;
    }
  };

  if (!wallet && activeTab === "owned") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Welcome to Avatar Dashboard
        </h1>
        <p className="mb-8 text-gray-400 text-center">
          Connect your wallet to view your avatars
        </p>
        <WalletButton onWalletChange={handleWalletChange} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Avatar Dashboard</h1>
        <WalletButton onWalletChange={handleWalletChange} />
      </div>

      <div className="flex gap-4 mb-8">
        {["owned", "gallery", "leaderboard", "tribes"].map((tab) => (
          <TabButton
            key={tab}
            label={tab.charAt(0).toUpperCase() + tab.slice(1)}
            isActive={activeTab === tab}
            onClick={() => setActiveTab(tab)}
          />
        ))}
      </div>

      {renderTabContent()}
      <AvatarModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} avatar={selectedAvatar} /> {/* Added modal */}
    </div>
  );
}

const rootElement = document.getElementById("root");
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}