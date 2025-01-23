
function XAuthButton({ avatarId, walletAddress }) {
  const [authStatus, setAuthStatus] = useState({ authorized: false });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, [avatarId]);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch(`/api/xauth/status/${avatarId}`);
      const status = await response.json();
      setAuthStatus(status);
    } catch (error) {
      console.error('Error checking auth status:', error);
    }
  };

  const handleAuth = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/xauth/auth-url?walletAddress=${walletAddress}&avatarId=${avatarId}`);
      const { url } = await response.json();
      
      const popup = window.open(url, 'X Auth', 'width=600,height=600');
      
      window.addEventListener('message', async (event) => {
        if (event.data.type === 'X_AUTH_SUCCESS') {
          await checkAuthStatus();
          popup?.close();
        } else if (event.data.type === 'X_AUTH_ERROR') {
          console.error('Auth error:', event.data.error);
          popup?.close();
        }
      });
    } catch (error) {
      console.error('Error initiating auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await fetch(`/api/xauth/disconnect/${avatarId}`, { method: 'POST' });
      await checkAuthStatus();
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  };

  return authStatus.authorized ? (
    <button
      onClick={handleDisconnect}
      className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
    >
      Disconnect X
    </button>
  ) : (
    <button
      onClick={handleAuth}
      disabled={loading}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
    >
      {loading ? 'Connecting...' : 'Connect X'}
    </button>
  );
}

window.components.XAuthButton = XAuthButton;
