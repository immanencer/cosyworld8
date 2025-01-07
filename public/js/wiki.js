
const { useState, useEffect } = React;

function Wiki() {
  const [pages, setPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(null);
  const [currentToast, setCurrentToast] = useState(null);
  const [shownMessageIds, setShownMessageIds] = useState(new Set());

  useEffect(() => {
    // Load default page on mount
    fetch("/api/wiki/page?path=00-moonstone-sanctum.md")
      .then((res) => res.json())
      .then((data) => {
        setCurrentPage(data);
        setTimeout(() => {
          mermaid.contentLoaded();
        }, 100);
      });

    fetch("/api/wiki/pages")
      .then((res) => res.json())
      .then((data) => setPages(data));

    mermaid.initialize({
      startOnLoad: true,
      theme: "dark",
      securityLevel: "loose",
      flowchart: {
        curve: "basis",
        padding: 20,
      },
      themeVariables: {
        fontFamily: "ui-sans-serif,system-ui,sans-serif",
        primaryColor: "#9333ea",
        primaryTextColor: "#fff",
        primaryBorderColor: "#4f46e5",
        lineColor: "#6b7280",
        secondaryColor: "#4f46e5",
        tertiaryColor: "#374151",
      },
    });
  }, []);

  // Rest of the component logic...
  const loadPage = (path) => {
    fetch(`/api/wiki/page?path=${encodeURIComponent(path)}`)
      .then((res) => res.json())
      .then((data) => {
        setCurrentPage(data);
        setTimeout(() => {
          mermaid.contentLoaded();
        }, 100);
      });
  };

  const renderMarkdown = (content) => {
    if (!content) return "";
    content = content.replace(/```mermaid\n([\s\S]*?)```/g, (match, code) => {
      return `<div class="mermaid">${code.trim()}</div>`;
    });

    marked.setOptions({
      gfm: true,
      breaks: true,
      headerIds: true,
      highlight: (code, lang) => {
        return `<pre class="bg-gray-800 p-4 rounded-lg overflow-x-auto"><code class="language-${lang}">${code}</code></pre>`;
      },
    });

    const html = marked.parse(content);
    setTimeout(() => {
      mermaid.init(undefined, document.querySelectorAll(".mermaid"));
    }, 100);

    return html;
  };

  const Toast = ({ message, onClose }) => {
    const avatar = message?.avatar || {};
    
    return (
      <div className="fixed bottom-4 right-4 bg-gray-800 rounded-lg shadow-lg p-4 animate-fade-in-out flex items-start gap-4 max-w-md">
        <img 
          src={avatar.thumbnailUrl || avatar.imageUrl} 
          alt={avatar.name}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-purple-400">{avatar.name}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-200">×</button>
          </div>
          <p className="text-gray-200 text-sm mt-1">{message.content}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-6">
        <nav className="w-full md:w-64 flex-shrink-0 md:sticky md:top-8 md:h-screen">
          <div className="nav-header">
            <div className="nav-logo">
              <img
                src="https://moonstone-sanctum.com/moonstone.webp"
                alt="Moonstone Sanctum"
                className="active"
                ref={(imgRef) => {
                  if (imgRef && !imgRef.dataset.initialized) {
                    imgRef.dataset.initialized = true;
                    const video = document.createElement("video");
                    video.src = "https://moonstone-sanctum.com/intro.mp4";
                    video.muted = true;
                    video.loop = true;
                    imgRef.parentElement.appendChild(video);

                    function toggleVideoAndImage() {
                      imgRef.classList.remove("active");
                      video.classList.add("active");
                      video.play();

                      setTimeout(() => {
                        video.classList.remove("active");
                        imgRef.classList.add("active");
                        video.pause();
                        setTimeout(toggleVideoAndImage, 33000);
                      }, 16000);
                    }

                    toggleVideoAndImage();
                  }
                }}
              />
            </div>
            <h2 className="text-xl font-bold mb-4 text-purple-400">
              Documentation
            </h2>
          </div>
          <ul className="space-y-2">
            {pages.map((page) => (
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
        {currentToast && (
          <Toast 
            message={currentToast} 
            onClose={() => setCurrentToast(null)} 
          />
        )}
        <main className="flex-1">
          {currentPage ? (
            <div className="prose prose-invert max-w-none">
              <div
                dangerouslySetInnerHTML={{
                  __html: renderMarkdown(currentPage.content),
                }}
              />
            </div>
          ) : (
            <div className="text-center text-gray-500">
              Loading...
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.createRoot(rootElement).render(<Wiki />);
