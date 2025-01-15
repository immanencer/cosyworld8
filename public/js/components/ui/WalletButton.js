
const WalletButton = ({ onWalletChange }) => {
  const [wallet, setWallet] = useState(null);
  const [address, setAddress] = useState(null);

  const connectWallet = async () => {
    try {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile && !window.solana) {
        window.location.href = 'https://phantom.app/ul/browse/' + window.location.href;
        return;
      }

      if (!window.solana) {
        alert('Please install Phantom wallet!');
        window.open('https://phantom.app/', '_blank');
        return;
      }

      const resp = await window.solana.connect();
      setWallet(window.solana);
      setAddress(resp.publicKey.toString());
      onWalletChange?.(window.solana);
    } catch (err) {
      console.error('Failed to connect wallet:', err);
    }
  };

  const disconnectWallet = () => {
    if (wallet) {
      wallet.disconnect();
      setWallet(null);
      setAddress(null);
      onWalletChange?.(null);
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

export default WalletButton;
