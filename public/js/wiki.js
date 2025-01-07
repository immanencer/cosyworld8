
const { useState, useEffect } = React;

function Wiki() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/wiki/page/moonstone-sanctum')
      .then(res => res.json())
      .then(data => {
        setContent(data.content || '');
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching content:', err);
        setLoading(false);
      });
  }, []);

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
