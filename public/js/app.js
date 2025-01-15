const { useState, useEffect } = React;
const { createRoot } = ReactDOM;

// Import WalletButton
const WalletButton = window.WalletButton;

// Main App Component
function App() {
  const [avatars, setAvatars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [wallet, setWallet] = useState(null);

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

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
      </div>
    );
  }

  if (!wallet) {
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
        <h1 className="text-4xl font-bold">Your Avatars</h1>
        <WalletButton onWalletChange={handleWalletChange} />
      </div>
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {avatars.map((avatar) => (
          <div key={avatar._id} className="bg-gray-800 p-4 rounded-lg">
            <img
              src={avatar.thumbnailUrl || avatar.imageUrl}
              alt={avatar.name}
              className="w-full h-48 object-cover rounded-lg mb-2"
            />
            <h3 className="text-lg font-semibold">{avatar.name}</h3>
          </div>
        ))}
      </div>
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