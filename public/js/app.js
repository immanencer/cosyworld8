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

function App() {
  const [wallet, setWallet] = useState(null);
  const [activeTab, setActiveTab] = useState("owned");
  const [leaderboard, setLeaderboard] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

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
              {leaderboard.map((avatar) => {
                const tier = window.getTierFromModel(avatar.model);
                return (
                  <div key={avatar._id} className="bg-gray-800 p-4 rounded-lg flex items-center gap-4">
                    <div className={`relative shrink-0 ring-2 rounded-full p-1 ${
                      {
                        'S': 'ring-purple-600',
                        'A': 'ring-blue-600',
                        'B': 'ring-green-600',
                        'C': 'ring-yellow-600',
                        'U': 'ring-gray-600'
                      }[tier]
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
                );
              })}
            </div>
            {hasMore && (
              <div 
                ref={node => {
                  if (node) {
                    const observer = new IntersectionObserver(entries => {
                      if (entries[0].isIntersecting && !loading) {
                        setPage(p => p + 1);
                      }
                    }, { threshold: 0.1 });
                    
                    observer.observe(node);
                    return () => observer.disconnect();
                  }
                }}
                className="h-10 flex items-center justify-center"
              >
                {loading && <p>Loading more...</p>}
              </div>
            )}
            {loading && (
              <div className="text-center mt-8">
                <p>Loading...</p>
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
