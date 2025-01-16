const { useState, useEffect } = React;

const WalletButton = ({ onWalletChange }) => {
  const [wallet, setWallet] = useState(null);
  const [address, setAddress] = useState(null);

  useEffect(() => {
    // Determine the correct wallet object based on the environment
    const solana = window.solana || window.phantom?.solana;

    if (solana && solana.isConnected) {
      setWallet(solana);
      setAddress(solana.publicKey.toString());
      onWalletChange?.(solana);
    }

    // Event handlers to update state on wallet events
    const handleConnect = () => {
      setWallet(solana);
      setAddress(solana.publicKey.toString());
      onWalletChange?.(solana);
    };

    const handleDisconnect = () => {
      setWallet(null);
      setAddress(null);
      onWalletChange?.(null);
    };

    if (solana) {
      solana.on('connect', handleConnect);
      solana.on('disconnect', handleDisconnect);
    }

    // Cleanup event listeners on unmount
    return () => {
      if (solana) {
        solana.off('connect', handleConnect);
        solana.off('disconnect', handleDisconnect);
      }
    };
  }, [onWalletChange]);

  const connectWallet = async () => {
    try {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const solana = isMobile ? window.phantom?.solana : window.solana;

      if (isMobile && !solana) {
        // Redirect to Phantom Mobile App with Universal Link
        const dappUrl = window.location.href.split('?')[0]; // Remove query params
        const cleanUrl = dappUrl.replace(/\/$/, ''); // Remove trailing slash
        const universalLink = `https://phantom.app/ul/browse/${encodeURIComponent(cleanUrl)}`;
        window.location.href = universalLink;
        return;
      }

      if (!solana) {
        const confirmed = confirm('Phantom wallet is required. Would you like to install it?');
        if (confirmed) {
          window.open('https://phantom.app/', '_blank');
        }
        return;
      }

      // Attempt to connect to the wallet
      const resp = await solana.connect({ onlyIfTrusted: false });
      setWallet(solana);
      setAddress(resp.publicKey.toString());
      onWalletChange?.(solana);
    } catch (err) {
      console.error('Failed to connect wallet:', err);
    }
  };

  const disconnectWallet = () => {
    if (wallet) {
      wallet.disconnect();
      // The 'disconnect' event listener will handle updating the state
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      {!wallet ? (
        <button
          onClick={connectWallet}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <span>Connect Wallet</span>
        </button>
      ) : (
        <button
          onClick={disconnectWallet}
          className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <span className="truncate w-32">{address}</span>
          <span>×</span>
        </button>
      )}
    </div>
  );
};

window.WalletButton = WalletButton;
