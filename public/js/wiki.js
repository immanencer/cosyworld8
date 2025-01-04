
const { useState, useEffect } = React;

function Wiki() {
  const [pages, setPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(null);

  useEffect(() => {
    fetch('/api/wiki/pages')
      .then(res => res.json())
      .then(data => setPages(data));
    
    mermaid.initialize({
      startOnLoad: true,
      theme: 'dark',
      securityLevel: 'loose',
      flowchart: { curve: 'basis' }
    });
  }, []);

  const loadPage = (path) => {
    fetch(`/api/wiki/page?path=${encodeURIComponent(path)}`)
      .then(res => res.json())
      .then(data => {
        setCurrentPage(data);
        setTimeout(() => {
          mermaid.contentLoaded();
        }, 100);
      });
  };

  const renderMarkdown = (content) => {
    if (!content) return '';
    
    marked.setOptions({
      gfm: true,
      breaks: true,
      headerIds: true,
      highlight: (code, lang) => {
        if (lang === 'mermaid') {
          return `<div class="mermaid">${code}</div>`;
        }
        return `<pre class="bg-gray-800 p-4 rounded-lg overflow-x-auto"><code class="language-${lang}">${code}</code></pre>`;
      }
    });

    return marked.parse(content);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-6">
        <nav className="w-64 flex-shrink-0">
          <div className="nav-header">
            <div className="nav-logo">
              🌙
            </div>
            <h2 className="text-xl font-bold mb-4 text-purple-400">Documentation</h2>
          </div>
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
                __html: renderMarkdown(currentPage.content) 
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
