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
          className="bg-[#AB9FF2] hover:bg-[#9B8DE8] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <img 
            src="data:image/svg+xml;base64,PHN2ZyBmaWxsPSJ3aGl0ZSIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiB3aWR0aD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMTQuMjYgMTguMDhzLTEuOS0zLjI5LTIuMjYtNC45MWMtLjM2LTEuNjItLjM2LTQuMzMtLjM2LTQuMzNzLTEuNDUgMS4yOC0xLjQ1IDQuMDFjMCAyLjczLS45NSA1LjIzLS45NSA1LjIzaC0zLjJzMS40LTIuODQgMS42Ny00LjU4Yy4yOC0xLjczLjI1LTUuMDEuMjUtNS4wMXMtMi4zMyAyLjM0LTIuOTIgNC40MmMtLjU5IDIuMDctLjg0IDIuOTctLjg0IDIuOTdsLTEuODctLjI5czEuODctNy4yMyAxLjg3LTcuOTdjMC0uNzQtLjUzLTEuMjctLjUzLTEuMjdzMi41OS0uNjIgMy44NS0yLjA3YzEuMjYtMS40NSAxLjY4LTIuODMgMS42OC0yLjgzbDEuNjUuMjNzLS42NCAzLjY0LS42NCA0LjExYzAgLjQ3LjExIDEuMTEuMTEgMS4xMWwxLjM3LTIuMTFzLjM0IDMuOTIuMzQgNS4zYzAgMS4zOC4zMSA0LjQ4LjMxIDQuNDhzMS4zNC0yLjE5IDEuNjItMy44MWMuMjgtMS42Mi4zOS0zLjY5LjM5LTMuNjlsMS41OS4yOHMtLjI1IDQuMi0uMjUgNS41MmMwIDEuMzEuNzUgNC42NC43NSA0LjY0WiIgZmlsbC1ydWxlPSJldmVub2RkIi8+PC9zdmc+" 
            alt="Phantom"
            className="w-5 h-5"
          />
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
