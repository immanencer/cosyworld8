const { useState, useEffect } = React;
const { createRoot } = ReactDOM;

// Main App Component
function App() {
  const [avatars, setAvatars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then(res => res.json())
      .then(data => {
        setAvatars(data.avatars || []);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching leaderboard:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Avatar Dashboard</h1>
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {avatars.map((avatar) => (
          <div key={avatar._id} className="bg-gray-800 p-4 rounded-lg">
            <img
              src={avatar.thumbnailUrl || avatar.imageUrl}
              alt={avatar.name}
              className="w-full h-48 object-cover rounded-lg mb-2"
            />
            <h3 className="text-lg font-semibold">{avatar.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}

const rootElement = document.getElementById("root");
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}