const { useState, useEffect, useCallback } = React;
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
  const [avatars, setAvatars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [wallet, setWallet] = useState(null);
  const [activeTab, setActiveTab] = useState("owned");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const resetState = () => {
    setPage(1);
    setHasMore(true);
    setAvatars([]);
  };

  const handleWalletChange = (newWallet) => {
    setWallet(newWallet);
    if (newWallet) {
      setLoading(true);
      fetch(`/api/avatars/owned/${newWallet.publicKey.toString()}`)
        .then((res) => res.json())
        .then((data) => {
          setAvatars(data || []);
          setLoading(false);
        })
        .catch((error) => {
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
      const response = await fetch("/api/avatars/claim", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ walletAddress: wallet.publicKey.toString() }),
      });
      const data = await response.json();
      if (data.success) {
        setAvatars((prev) => [...prev, data.avatar]);
      }
    } catch (error) {
      console.error("Error claiming avatar:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreAvatars = useCallback(async () => {
    console.log(`[Avatar Loading] Tab: ${activeTab}, Page: ${page}, Loading: ${loading}, HasMore: ${hasMore}`);
    
    if (loading) {
      console.log('[Avatar Loading] Skipped - Already loading');
      return;
    }

    if (!hasMore) {
      console.log('[Avatar Loading] Skipped - No more content');
      return;
    }
    
    if (activeTab === 'owned' && !wallet?.publicKey) {
      console.log('[Avatar Loading] Skipped - Owned tab requires wallet connection');
      return;
    }

    setLoading(true);
    console.log('[Avatar Loading] Starting fetch...');
    try {
      const endpoint = {
        owned: wallet?.publicKey ? `/api/avatars/owned/${wallet.publicKey.toString()}?page=${page}` : null,
        gallery: `/api/avatars/gallery?page=${page}`,
        leaderboard: `/api/avatars/leaderboard?page=${page}`,
        tribes: `/api/tribes?page=${page}`,
      }[activeTab];

      if (!endpoint) {
        setLoading(false);
        return;
      }

      console.log(`[Avatar Loading] Fetching from endpoint: ${endpoint}`);
      const response = await fetch(endpoint);
      const data = await response.json();
      console.log(`[Avatar Loading] Received ${data.avatars?.length || 0} avatars`);

      if (data.avatars?.length === 0) {
        setHasMore(false);
      } else {
        setAvatars((prev) => [...prev, ...data.avatars]);
        setPage((prev) => prev + 1);
      }
    } catch (error) {
      console.error("[Avatar Loading] Error:", error);
    } finally {
      console.log('[Avatar Loading] Fetch complete');
      setLoading(false);
    }
  }, [activeTab, page, hasMore, loading, wallet?.publicKey]);

  useEffect(() => {
    console.log(`[Tab Change] Active Tab: ${activeTab}, Wallet Connected: ${!!wallet?.publicKey}`);
    resetState();
    if (activeTab !== "owned" || wallet?.publicKey) {
      loadMoreAvatars();
    }
  }, [activeTab, wallet?.publicKey]);

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

      {activeTab === "owned" && avatars.length === 0 && !loading && (
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

      {loading && <p className="text-center">Loading...</p>}

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {avatars.map((avatar) => (
          <AvatarCard key={avatar._id} avatar={avatar} activeTab={activeTab} />
        ))}
      </div>

      {hasMore && !loading && (
        <div className="text-center mt-8">
          <button
            onClick={loadMoreAvatars}
            className="bg-gray-700 px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Load More
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
    </React.StrictMode>,
  );
}
