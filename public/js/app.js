
const { useState, useEffect } = React;
const { createRoot } = ReactDOM;

const WalletButton = window.WalletButton;

function App() {
  const [avatars, setAvatars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [wallet, setWallet] = useState(null);
  const [activeTab, setActiveTab] = useState('owned');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const handleWalletChange = (newWallet) => {
    setWallet(newWallet);
    if (newWallet) {
      setLoading(true);
      fetch(`/api/avatars/owned/${newWallet.publicKey.toString()}`)
        .then(res => res.json())
        .then(data => {
          setAvatars(data || []);
          setLoading(false);
        })
        .catch(error => {
          console.error("Error fetching owned avatars:", error);
          setLoading(false);
        });
    } else {
      setAvatars([]);
    }
  };

  const handleClaimAvatar = async () => {
    if (!wallet) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/avatars/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ walletAddress: wallet.publicKey.toString() })
      });
      const data = await response.json();
      if (data.success) {
        setAvatars(prev => [...prev, data.avatar]);
      }
    } catch (error) {
      console.error("Error claiming avatar:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreAvatars = async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    try {
      const endpoint = {
        owned: `/api/avatars/owned/${wallet.publicKey.toString()}?page=${page}`,
        gallery: `/api/avatars/gallery?page=${page}`,
        leaderboard: `/api/avatars/leaderboard?page=${page}`,
        tribes: `/api/tribes?page=${page}`
      }[activeTab];

      const response = await fetch(endpoint);
      const data = await response.json();
      
      if (data.avatars?.length === 0) {
        setHasMore(false);
      } else {
        setAvatars(prev => [...prev, ...data.avatars]);
        setPage(prev => prev + 1);
      }
    } catch (error) {
      console.error("Error loading more avatars:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    setAvatars([]);
    
    if (activeTab !== 'owned' || wallet) {
      loadMoreAvatars();
    }
  }, [activeTab]);

  if (!wallet && activeTab === 'owned') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-bold mb-8 text-center">Welcome to Avatar Dashboard</h1>
        <p className="mb-8 text-gray-400 text-center">Connect your wallet to view your avatars</p>
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
        <button 
          onClick={() => setActiveTab('owned')}
          className={`px-4 py-2 rounded-lg ${activeTab === 'owned' ? 'bg-blue-600' : 'bg-gray-700'}`}
        >
          My Avatars
        </button>
        <button 
          onClick={() => setActiveTab('gallery')}
          className={`px-4 py-2 rounded-lg ${activeTab === 'gallery' ? 'bg-blue-600' : 'bg-gray-700'}`}
        >
          Gallery
        </button>
        <button 
          onClick={() => setActiveTab('leaderboard')}
          className={`px-4 py-2 rounded-lg ${activeTab === 'leaderboard' ? 'bg-blue-600' : 'bg-gray-700'}`}
        >
          Leaderboard
        </button>
        <button 
          onClick={() => setActiveTab('tribes')}
          className={`px-4 py-2 rounded-lg ${activeTab === 'tribes' ? 'bg-blue-600' : 'bg-gray-700'}`}
        >
          Tribes
        </button>
      </div>

      {activeTab === 'owned' && avatars.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-4">You don't own any avatars yet</p>
          <button
            onClick={handleClaimAvatar}
            className="bg-blue-600 px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Claim Free Avatar
          </button>
        </div>
      )}

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {avatars.map((avatar) => (
          <div key={avatar._id} className="bg-gray-800 p-4 rounded-lg">
            <img
              src={avatar.thumbnailUrl || avatar.imageUrl}
              alt={avatar.name}
              className="w-full h-48 object-cover rounded-lg mb-2"
            />
            <h3 className="text-lg font-semibold">{avatar.name}</h3>
            {activeTab === 'leaderboard' && (
              <p className="text-sm text-gray-400">Score: {avatar.score || 0}</p>
            )}
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="text-center mt-8">
          <button
            onClick={loadMoreAvatars}
            className="bg-gray-700 px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
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
