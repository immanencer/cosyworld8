
const { useState, useEffect } = React;

function Wiki() {
  const [pages, setPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(null);

  useEffect(() => {
    fetch('/api/wiki/pages')
      .then(res => res.json())
      .then(data => setPages(data));
  }, []);

  const loadPage = (path) => {
    fetch(`/api/wiki/page?path=${encodeURIComponent(path)}`)
      .then(res => res.json())
      .then(data => setCurrentPage(data));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-6">
        <nav className="w-64 flex-shrink-0">
          <h2 className="text-xl font-bold mb-4">Documentation</h2>
          <ul className="space-y-2">
            {pages.map(page => (
              <li key={page.path}>
                <button
                  onClick={() => loadPage(page.path)}
                  className="text-left hover:text-blue-400 w-full"
                >
                  {page.title}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <main className="flex-1">
          {currentPage ? (
            <div className="prose prose-invert max-w-none">
              <div dangerouslySetInnerHTML={{ 
                __html: marked.parse(currentPage.content) 
              }} />
            </div>
          ) : (
            <div className="text-center text-gray-500">
              Select a page from the navigation
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

const rootElement = document.getElementById('root');
ReactDOM.createRoot(rootElement).render(<Wiki />);
