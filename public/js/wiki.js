
const { useState, useEffect } = React;

function Wiki() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch('/api/wiki/page?path=00-moonstone-sanctum.md');
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        if (!data.content) {
          throw new Error('No content found');
        }
        setContent(data.content);
      } catch (err) {
        console.error('Error fetching content:', err);
        setError('Failed to load content');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  return (
    <div>
      <nav className="bg-gray-800 shadow-lg">
        <div className="nav-header">
          <div className="nav-logo">
            <img src="/thumbnails/1cc5b04ce4a13fd341a58080b96743cb.webp" alt="Moonstone Sanctum" className="active" />
          </div>
          <h1 className="text-3xl font-bold text-purple-400">Moonstone Sanctum</h1>
        </div>
        <div className="nav-menu">
          <a href="#overview" className="active">Overview</a>
          <a href="#systems">Systems</a>
          <a href="#features">Features</a>
          <a href="#community">Community</a>
        </div>
      </nav>
      <div className="container mx-auto px-4 py-8">
        {error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : loading ? (
        <div className="flex justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-purple-500 rounded-full border-t-transparent"></div>
        </div>
      ) : (
        <div className="prose prose-invert max-w-none">
          <div dangerouslySetInnerHTML={{ __html: marked.parse(content) }} />
        </div>
        )}
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Wiki />);
