const { useState, useEffect, useCallback } = React;
const { createRoot } = ReactDOM;

import {
  ProgressRing,
  TierBadge,
  ActivityFeed,
  AncestryChain,
  StatsDisplay,
  XAuthButton,
  ViewToggle
} from './components/ui/index.js';

import { WalletButton } from './components/ui/WalletButton.js';
import { BurnTokenButton } from './components/ui/BurnTokenButton.js';
import { AvatarCard, AvatarSearch } from './components/AvatarCard.js';
import { AvatarDetailModal } from './components/AvatarDetailModal.js';
import { CombatLog } from './components/CombatLog.js';
import { TribesView } from './components/TribesView.js';
import { utils } from './utils/index.js';
import { MarkdownContent } from './components/utils/MarkdownContent.js';

// Determine model rarity
const getModelRarity = (modelName) => {
  const modelRarities = {
    "meta-llama/llama-3.2-1b-instruct": "common",
    "meta-llama/llama-3.2-3b-instruct": "common",
    "eva-unit-01/eva-qwen-2.5-72b": "rare",
    "openai/gpt-4o": "legendary",
    "meta-llama/llama-3.1-405b-instruct": "legendary",
    "anthropic/claude-3-opus:beta": "legendary",
    "anthropic/claude-3.5-sonnet:beta": "legendary",
    "anthropic/claude-3.5-haiku:beta": "uncommon",
    "neversleep/llama-3.1-lumimaid-70b": "rare",
    "nvidia/llama-3.1-nemotron-70b-instruct": "rare",
    "meta-llama/llama-3.1-70b-instruct": "uncommon",
    "pygmalionai/mythalion-13b": "uncommon",
    "mistralai/mistral-large-2411": "uncommon",
    "qwen/qwq-32b-preview": "uncommon",
    "gryphe/mythomax-l2-13b": "common",
    "google/gemini-flash-1.5-8b": "common",
    "x-ai/grok-beta": "legendary",
  };
  return modelRarities[modelName] || "common";
};

// Map rarity to tier
const rarityToTier = {
  legendary: "S",
  rare: "A",
  uncommon: "B",
  common: "C",
};

// Get tier from model
const getTierFromModel = (model) => {
  if (!model) return "U";
  const rarity = getModelRarity(model);
  return rarityToTier[rarity] || "U";
};



// Leaderboard View Component
const LeaderboardView = React.memo(() => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch("/api/leaderboard");
        const data = await response.json();
        setLeaderboard(data.avatars || []);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <table className="w-full bg-gray-800 rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-gray-700">
            <th className="px-6 py-3 text-left">Rank</th>
            <th className="px-6 py-3 text-left">Avatar</th>
            <th className="px-6 py-3 text-left">Name</th>
            <th className="px-6 py-3 text-right">Score</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((avatar, index) => (
            <tr
              key={avatar._id}
              className="border-t border-gray-700 hover:bg-gray-700"
            >
              <td className="px-6 py-4">{index + 1}</td>
              <td className="px-6 py-4">
                <img
                  src={avatar.thumbnailUrl || avatar.imageUrl}
                  alt={avatar.name}
                  className="w-10 h-10 rounded-full"
                />
              </td>
              <td className="px-6 py-4">{avatar.name}</td>
              <td className="px-6 py-4 text-right">{avatar.score || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});


// Tier Filter Component
const TierFilter = React.memo(({ selectedTier, onTierChange }) => {
  const tiers = ["All", "S", "A", "B", "C", "U"];
  const colors = {
    S: "bg-purple-600",
    A: "bg-blue-600",
    B: "bg-green-600",
    C: "bg-yellow-600",
    U: "bg-gray-600",
  };

  return (
    <div className="flex gap-2 justify-center mb-6">
      {tiers.map((tier) => (
        <button
          key={tier}
          className={`px-3 py-1 rounded ${
            selectedTier === tier
              ? tier === "All"
                ? "bg-white text-gray-900"
                : `${colors[tier]} text-white`
              : "bg-gray-700 text-gray-300"
          }`}
          onClick={() => onTierChange(tier)}
        >
          {tier}
        </button>
      ))}
    </div>
  );
});

// Main App Component
function App() {
  const [avatars, setAvatars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastMessageCount, setLastMessageCount] = useState(null);
  const [lastId, setLastId] = useState(null);
  const [selectedTier, setSelectedTier] = useState("All");
  const [currentView, setCurrentView] = useState("leaderboard");
  const [modalAvatar, setModalAvatar] = useState(null);
  const [wallet, setWallet] = useState(null);

  const loadAvatars = useCallback(
    async (isInitial = false) => {
      if (loading || (!hasMore && !isInitial)) return;

      setLoading(true);
      try {
        const url = new URL("/api/leaderboard", window.location.origin);
        url.searchParams.set("limit", "24");

        if (selectedTier !== "All") {
          url.searchParams.set("tier", selectedTier);
        }

        if (!isInitial && lastMessageCount !== null && lastId) {
          url.searchParams.set("lastMessageCount", lastMessageCount);
          url.searchParams.set("lastId", lastId);
        }

        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();

        if (isInitial) {
          setAvatars(data.avatars || []);
        } else {
          setAvatars((prev) => [...prev, ...(data.avatars || [])]);
        }

        setHasMore(data.hasMore);
        setLastMessageCount(data.lastMessageCount);
        setLastId(data.lastId);
      } catch (error) {
        console.error("Error loading avatars:", error);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    },
    [loading, hasMore, selectedTier, lastMessageCount, lastId],
  );

  useEffect(() => {
    loadAvatars(true);
  }, [loadAvatars]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.documentElement.scrollHeight - 1000 &&
        !loading &&
        hasMore
      ) {
        loadAvatars();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore, loadAvatars]);

  useEffect(() => {
    setLastMessageCount(null);
    setLastId(null);
    setHasMore(true);
    setAvatars([]);
    loadAvatars(true);
  }, [selectedTier, loadAvatars]);

  // Handler for avatar selection from any view
  const handleAvatarSelect = useCallback((avatar) => {
    // Fetch full avatar details if needed
    fetch(`/api/avatars/${avatar._id}`)
      .then((res) => res.json())
      .then((data) => setModalAvatar(data))
      .catch((err) => {
        console.error("Error fetching avatar details:", err);
        setModalAvatar(avatar); // Fallback to basic avatar data
      });
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <WalletButton onWalletChange={setWallet} />
      <h1 className="text-4xl font-bold mb-8 text-center">Avatar Dashboard</h1>
      <ViewToggle currentView={currentView} onViewChange={setCurrentView} />

      {currentView === "collection" ? (
        <>
          <TierFilter
            selectedTier={selectedTier}
            onTierChange={setSelectedTier}
          />
          <AvatarSearch onSelect={handleAvatarSelect} />
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 mt-4">
            {avatars.map((avatar) => (
              <AvatarCard
                key={avatar._id}
                avatar={avatar}
                onSelect={handleAvatarSelect}
              />
            ))}
          </div>
          {loading && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
            </div>
          )}
          {modalAvatar && (
            <AvatarDetailModal
              avatar={modalAvatar}
              onClose={() => setModalAvatar(null)}
              wallet={wallet}
            />
          )}
        </>
      ) : currentView === "leaderboard" ? (
        <LeaderboardView />
      ) : currentView === "combat" ? (
        <CombatLog onAvatarSelect={handleAvatarSelect} />
      ) : currentView === "tribes" ? (
        <TribesView onAvatarSelect={handleAvatarSelect} />
      ) : null}

      {/* Optionally, include BurnTokenButton somewhere in the UI */}
      {wallet && (
        <BurnTokenButton
          wallet={wallet}
          onSuccess={() => {
            /* Handle success */
          }}
        />
      )}
    </div>
  );
}

// Initialize app
const rootElement = document.getElementById("root");
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    console.error('Error caught in error boundary:', error);
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Component stack trace:', errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return <div className="text-white p-4">Something went wrong. Please refresh the page.</div>;
    }
    return this.props.children;
  }
}

if (rootElement) {
  console.log('Root element found, initializing React app');
  try {
    const root = createRoot(rootElement);
    console.log('Root created successfully');
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </React.StrictMode>
    );
    console.log('Initial render completed');
  } catch (error) {
    console.error('Failed to initialize React app:', error);
  }
} else {
  console.error('Root element not found');
}
