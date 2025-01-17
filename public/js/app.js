const { useState } = React;
const { createRoot } = ReactDOM;

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

  const handleWalletChange = (newWallet) => {
    setWallet(newWallet);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "owned":
        return <div className="text-center py-12">Your owned avatars will appear here</div>;
      case "gallery":
        return <div className="text-center py-12">Gallery content coming soon</div>;
      case "leaderboard": {
  const [leaderboard, setLeaderboard] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/leaderboard?page=${page}&limit=12`);
        const data = await response.json();
        setLeaderboard(prev => [...prev, ...data.avatars]);
        setHasMore(data.avatars.length === 12);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [page]);

  return (
    <div>
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {leaderboard.map((avatar) => (
          <div key={avatar._id} className="bg-gray-800 p-4 rounded-lg">
            <img
              src={avatar.thumbnailUrl || avatar.imageUrl}
              alt={avatar.name}
              className="w-full h-48 object-cover rounded-lg mb-2"
            />
            <h3 className="text-lg font-semibold">{avatar.name}</h3>
            <p className="text-sm text-gray-400">Score: {avatar.score}</p>
          </div>
        ))}
      </div>
      
      {hasMore && !loading && (
        <div className="text-center mt-8">
          <button
            onClick={() => setPage(p => p + 1)}
            className="bg-gray-700 px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Load More
          </button>
        </div>
      )}
      
      {loading && (
        <div className="text-center mt-8">
          <p>Loading...</p>
        </div>
      )}
    </div>
  );
}
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