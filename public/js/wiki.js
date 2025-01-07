
const { useState, useEffect } = React;

function Wiki() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/wiki/page?path=00-moonstone-sanctum.md')
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        if (data.content) {
          setContent(data.content);
        } else {
          setError('No content found');
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching content:', err);
        setError('Failed to load content');
        setLoading(false);
      });
  }, []);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
        </div>
      ) : (
        <div className="prose prose-invert max-w-none">
          <div dangerouslySetInnerHTML={{ __html: marked.parse(content) }} />
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Wiki />);
