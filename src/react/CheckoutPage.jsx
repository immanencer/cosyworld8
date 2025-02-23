
import React from 'react';
const { useState, useEffect } = React;

function CheckoutPage() {
  const [nftData, setNftData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const templateId = params.get('templateId');
    const collectionId = params.get('collectionId');
    const avatarId = params.get('avatarId');

    if (!templateId || !collectionId || !avatarId) {
      setError('Missing required parameters');
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch avatar data first
        const avatarResponse = await fetch(`/api/avatars/${avatarId}`);
        if (!avatarResponse.ok) throw new Error('Failed to fetch avatar data');
        const avatarData = await avatarResponse.json();

        setNftData(avatarData);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchData();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl text-red-500">Error: {error}</h1>
        </div>
      </div>
    );
  }

  if (!nftData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-800 rounded-lg shadow-xl p-6 mb-8">
          <div className="aspect-square w-64 h-64 mx-auto rounded-lg overflow-hidden mb-6">
            <img 
              src={nftData.imageUrl} 
              alt={nftData.name}
              className="w-full h-full object-cover"
            />
          </div>

          <h1 className="text-2xl font-bold mb-2 text-center">
            {nftData.emoji} {nftData.name}
          </h1>

          <p className="text-gray-300 mb-4 text-center">
            {nftData.description || nftData.short_description}
          </p>

          {nftData.personality && (
            <div className="bg-gray-700 rounded p-4 mb-6">
              <h2 className="text-lg font-semibold mb-2">Personality</h2>
              <p className="text-gray-300">{nftData.personality}</p>
            </div>
          )}

          <div className="mt-6">
            <button 
              onClick={() => {
                const crossmintId = new URLSearchParams(window.location.search).get('collectionId');
                window.location.href = `https://staging.crossmint.com/collect/${crossmintId}`;
              }}
              className="w-full bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Collect this Avatar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Initialize React
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<CheckoutPage />);
