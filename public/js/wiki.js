const { useState, useEffect } = React;

function Wiki() {
  const [pages, setPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(null);

  useEffect(() => {
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
                      video.classList.remove("active");
                      imgRef.classList.add("active");
                      
                      setTimeout(() => {
                        imgRef.classList.remove("active");
                        video.classList.add("active");
                        video.play().catch(console.error);
                        
                        setTimeout(() => {
                          video.classList.remove("active");
                          imgRef.classList.add("active");
                          video.pause();
                          setTimeout(toggleVideoAndImage, 33000);
                        }, 16000);
                      }, 500);
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
              Select a page from the navigation
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.createRoot(rootElement).render(<Wiki />);
