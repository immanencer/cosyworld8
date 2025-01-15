import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { AvatarCard, AvatarSearch } from './components/Avatar';
import { CombatLog } from './components/Combat';
import { TribesView } from './components/Tribes';
import { utils } from './utils';
import { 
  ProgressRing,
  TierBadge,
  ActivityFeed,
  AncestryChain,
  StatsDisplay,
  XAuthButton,
  WalletButton,
  BurnTokenButton,
  ViewToggle 
} from './components/ui';

// Sanitize number input


// Determine model rarity
const getModelRarity = (modelName) => {
  const modelRarities = {
    'meta-llama/llama-3.2-1b-instruct': 'common',
    'meta-llama/llama-3.2-3b-instruct': 'common',
    'eva-unit-01/eva-qwen-2.5-72b': 'rare',
    'openai/gpt-4o': 'legendary',
    'meta-llama/llama-3.1-405b-instruct': 'legendary',
    'anthropic/claude-3-opus:beta': 'legendary',
    'anthropic/claude-3.5-sonnet:beta': 'legendary',
    'anthropic/claude-3.5-haiku:beta': 'uncommon',
    'neversleep/llama-3.1-lumimaid-70b': 'rare',
    'nvidia/llama-3.1-nemotron-70b-instruct': 'rare',
    'meta-llama/llama-3.1-70b-instruct': 'uncommon',
    'pygmalionai/mythalion-13b': 'uncommon',
    'mistralai/mistral-large-2411': 'uncommon',
    'qwen/qwq-32b-preview': 'uncommon',
    'gryphe/mythomax-l2-13b': 'common',
    'google/gemini-flash-1.5-8b': 'common',
    'x-ai/grok-beta': 'legendary',
  };
  return modelRarities[modelName] || 'common';
};

// Map rarity to tier
const rarityToTier = {
  legendary: 'S',
  rare: 'A',
  uncommon: 'B',
  common: 'C',
};

// Get tier from model
const getTierFromModel = (model) => {
  if (!model) return 'U';
  const rarity = getModelRarity(model);
  return rarityToTier[rarity] || 'U';
};

// Safe Markdown Renderer
const MarkdownContent = ({ content }) => {
  const sanitizedContent = utils.sanitizeMarkdown(content || '');
  return (
    <div
      className="prose prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
};


// Clip Description Helper Function
const clipDescription = (text) => {
  if (!text) return '';
  const doubleNewline = text.indexOf('\n\n');
  return doubleNewline > -1 ? text.slice(0, doubleNewline) : text;
};

// Avatar Card Component
const AvatarCard = React.memo(({ avatar, onSelect }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const allAvatars = [avatar, ...(avatar.alternateAvatars || [])];

  useEffect(() => {
    if (allAvatars.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % allAvatars.length);
      }, 3000); // Change image every 3 seconds
      return () => clearInterval(interval);
    }
  }, [allAvatars.length]);

  const currentAvatar = allAvatars[currentImageIndex];
  const tier = getTierFromModel(avatar.model);

  return (
    <div
      onClick={() => onSelect(avatar)}
      className="bg-gray-800 rounded-lg p-2 cursor-pointer hover:bg-gray-700 transition-colors"
    >
      <div className="relative mb-2">
        <img
          src={currentAvatar.thumbnailUrl || currentAvatar.imageUrl}
          alt={currentAvatar.name}
          className="w-full aspect-square object-cover rounded-lg"
        />
        {allAvatars.length > 1 && (
          <span className="absolute top-1 right-1 bg-blue-500 text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {allAvatars.length}
          </span>
        )}
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-1 justify-between">
          <h3 className="text-sm font-bold truncate">{avatar.name}</h3>
          <TierBadge tier={tier} />
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <span>✉️ {avatar.messageCount}</span>
        </div>
        <StatsDisplay stats={avatar.stats} size="small" />
      </div>
    </div>
  );
});

// Avatar Search Component
const AvatarSearch = React.memo(({ onSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const searchTimeout = useRef(null);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/avatars/search?name=${encodeURIComponent(query)}`);
        const data = await response.json();
        setResults(data.avatars || []);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout.current);
  }, [query]);

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search avatars..."
        className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {loading && (
        <div className="absolute right-3 top-3">
          <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
        </div>
      )}
      {results.length > 0 && (
        <div className="absolute mt-1 w-full bg-gray-800 rounded-lg shadow-lg z-50 max-h-60 overflow-auto">
          {results.map((avatar) => (
            <div
              key={avatar._id}
              className="flex items-center gap-3 p-2 hover:bg-gray-700 cursor-pointer"
              onClick={() => {
                onSelect(avatar);
                setQuery('');
                setResults([]);
              }}
            >
              <img
                src={avatar.thumbnailUrl || avatar.imageUrl}
                alt={avatar.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <div className="font-medium">{avatar.name}</div>
                {avatar.emoji && <div className="text-sm text-gray-400">{avatar.emoji}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

// Combat Log Entry Component
const CombatLogEntry = React.memo(({ entry, onAvatarClick }) => {
  const handleClick = (avatar, event) => {
    event.stopPropagation();
    if (avatar && onAvatarClick) {
      onAvatarClick(avatar);
    }
  };

  const CombatantDisplay = ({ name, emoji, imageUrl, thumbnailUrl, id }) => (
    <div className="flex items-center gap-2">
      <div className="relative">
        {imageUrl ? (
          <img
            src={thumbnailUrl || imageUrl}
            alt={name}
            className="w-10 h-10 rounded-full object-cover cursor-pointer hover:opacity-75 border-2 border-gray-700"
            onClick={(e) => handleClick({ _id: id, name, imageUrl }, e)}
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
            {emoji || '👤'}
          </div>
        )}
      </div>
      <div>
        <span
          className="text-sm text-gray-300 hover:text-white cursor-pointer font-medium"
          onClick={(e) => handleClick({ _id: id, name, imageUrl }, e)}
        >
          {name}
        </span>
        {emoji && <div className="text-xs text-gray-400">{emoji}</div>}
      </div>
    </div>
  );

  return (
    <div className="bg-gray-800 rounded-lg p-4 transition-colors hover:bg-gray-750">
      <div className="flex items-center gap-3">
        <CombatantDisplay
          name={entry.actorName}
          emoji={entry.actorEmoji}
          imageUrl={entry.actorImageUrl}
          thumbnailUrl={entry.actorThumbnailUrl}
          id={entry.actorId}
        />

        <div className="flex-grow flex items-center justify-center gap-2 px-4">
          <span className="text-gray-400">⚔️</span>
          <span className="text-sm font-medium text-gray-300">
            {entry.result.substring(0, 80)}
          </span>
        </div>

        {entry.targetName && (
          <CombatantDisplay
            name={entry.targetName}
            emoji={entry.targetEmoji}
            imageUrl={entry.targetImageUrl}
            thumbnailUrl={entry.targetThumbnailUrl}
            id={entry.targetId}
          />
        )}
      </div>

      <div className="mt-2 text-xs text-gray-500 text-right">
        {new Date(entry.timestamp).toLocaleString()}
      </div>
    </div>
  );
});

// Combat Log Component
const CombatLog = React.memo(({ onAvatarSelect }) => {
  const [combatLog, setCombatLog] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCombatLog = async () => {
      try {
        const response = await fetch('/api/dungeon/log');
        const data = await response.json();
        setCombatLog(data);
      } catch (error) {
        console.error('Error fetching combat log:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCombatLog();
    const interval = setInterval(fetchCombatLog, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-6">Recent Combat Actions</h2>

      <div className="space-y-4 max-w-3xl mx-auto">
        {combatLog.map((entry, index) => (
          <CombatLogEntry key={index} entry={entry} onAvatarClick={onAvatarSelect} />
        ))}
        {combatLog.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">⚔️</div>
            <div>No combat actions yet</div>
          </div>
        )}
      </div>
    </div>
  );
});

// Leaderboard View Component
const LeaderboardView = React.memo(() => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('/api/leaderboard');
        const data = await response.json();
        setLeaderboard(data.avatars || []);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
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
            <tr key={avatar._id} className="border-t border-gray-700 hover:bg-gray-700">
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

// View Toggle Component
const ViewToggle = React.memo(({ currentView, onViewChange }) => {
  const views = [
    { name: 'Collection', color: 'bg-green-600', key: 'collection' },
    { name: 'Leaderboard', color: 'bg-purple-600', key: 'leaderboard' },
    { name: 'Combat Log', color: 'bg-red-600', key: 'combat' },
    { name: 'Tribes', color: 'bg-blue-600', key: 'tribes' },
  ];

  return (
    <div className="flex justify-center gap-4 mb-8">
      {views.map((view) => (
        <button
          key={view.key}
          className={`px-4 py-2 rounded ${
            currentView === view.key
              ? `${view.color} text-white`
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
          onClick={() => onViewChange(view.key)}
        >
          {view.name}
        </button>
      ))}
    </div>
  );
});

// Family Card Component
const FamilyCard = React.memo(({ family, onSelect }) => {
  const descendantsCount = Array.isArray(family.descendants) ? family.descendants.length : 0;

  return (
    <div
      onClick={() => onSelect(family)}
      className="bg-gray-800 rounded-lg p-4 cursor-pointer hover:bg-gray-700 transition-colors"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img
            src={family.thumbnailUrl || family.imageUrl}
            alt={family.name}
            className="w-16 h-16 rounded-full object-cover"
          />
          <div>
            <span className="text-2xl">{family.emoji}</span>
            <div className="text-xl font-bold">{family.name}</div>
            <div className="text-gray-400">{descendantsCount} descendants</div>
          </div>
        </div>
      </div>
    </div>
  );
});

// Tribes View Component
const TribesView = React.memo(({ onAvatarSelect }) => {
  const [tribeCounts, setTribeCounts] = useState([]);
  const [selectedEmoji, setSelectedEmoji] = useState(null);
  const [selectedTribe, setSelectedTribe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingTribe, setLoadingTribe] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const ITEMS_PER_PAGE = 20;

  const sanitizeMembers = useCallback((members) => {
    if (!Array.isArray(members)) return [];
    return members.filter(
      (member) =>
        member &&
        typeof member === 'object' &&
        typeof member._id === 'string' &&
        typeof member.name === 'string' &&
        (typeof member.thumbnailUrl === 'string' || typeof member.imageUrl === 'string')
    );
  }, []);

  const sanitizeTribe = useCallback(
    (tribe) => {
      if (!tribe || typeof tribe !== 'object' || typeof tribe.emoji !== 'string') return null;
      const members = sanitizeMembers(tribe.members);
      return { emoji: tribe.emoji, count: tribe.count, members };
    },
    [sanitizeMembers]
  );

  useEffect(() => {
    const fetchTribeCounts = async () => {
      try {
        const response = await fetch('/api/tribes/counts');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setTribeCounts(data || []);
      } catch (error) {
        console.error('Error fetching tribe counts:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTribeCounts();
  }, []);

  const fetchTribeDetails = useCallback(
    async (emoji) => {
      setLoadingTribe(true);
      try {
        const response = await fetch(
          `/api/tribes/${encodeURIComponent(emoji)}?skip=${page * ITEMS_PER_PAGE}&limit=${ITEMS_PER_PAGE}`
        );
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        const sanitizedTribe = sanitizeTribe(data);
        setSelectedTribe(sanitizedTribe);
      } catch (error) {
        console.error('Error fetching tribe details:', error);
        setError(error.message);
      } finally {
        setLoadingTribe(false);
      }
    },
    [page, sanitizeTribe]
  );

  useEffect(() => {
    if (selectedEmoji) {
      fetchTribeDetails(selectedEmoji);
    }
  }, [selectedEmoji, fetchTribeDetails]);

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 py-4">Error loading tribes: {error}</div>;
  }

  return (
    <div>
      <div className="flex flex-wrap gap-4 mb-8 justify-center">
        {tribeCounts.map((tribe) => (
          <button
            key={tribe.emoji}
            onClick={() => setSelectedEmoji(tribe.emoji)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full ${
              selectedEmoji === tribe.emoji
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            <span className="text-2xl">{tribe.emoji}</span>
            <span className="text-sm font-medium">{tribe.count}</span>
          </button>
        ))}
      </div>

      {/* Selected Tribe Details */}
      {selectedTribe ? (
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center gap-4 mb-6">
            <span className="text-4xl">{selectedTribe.emoji}</span>
            <div>
              <h2 className="text-2xl font-bold">{selectedTribe.count} Members</h2>
              <p className="text-gray-400">Click an avatar to view details</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {selectedTribe.members.map((member) => (
              <div
                key={member._id}
                onClick={() => onAvatarSelect(member)}
                className="cursor-pointer group"
              >
                <div className="aspect-square overflow-hidden rounded-lg mb-2">
                  <img
                    src={member.thumbnailUrl || member.imageUrl}
                    alt={member.name}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform"
                  />
                </div>
                <div className="text-center">
                  <div className="font-medium truncate">{member.name}</div>
                  {member.model && <div className="text-xs text-gray-400">{member.model}</div>}
                  {member.emoji && <div className="text-sm">{member.emoji}</div>}
                </div>
              </div>
            ))}
          </div>
          {/* Pagination or Load More can be added here */}
        </div>
      ) : (
        <div className="text-center text-gray-400">Select an emoji to view tribe members</div>
      )}
    </div>
  );
});

// Burn Token Button Component
const BurnTokenButton = React.memo(({ wallet, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleBurn = async () => {
    try {
      setLoading(true);
      setError(null);

      const burnTx = await fetch('/api/tokens/burn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: wallet.publicKey.toString(),
        }),
      }).then((r) => r.json());

      const signedTx = await wallet.signTransaction(burnTx.transaction);
      const signature = await fetch('/api/tokens/burn/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signature: signedTx.signature,
          walletAddress: wallet.publicKey.toString(),
        }),
      }).then((r) => r.json());

      if (signature.success) {
        onSuccess?.();
      } else {
        throw new Error(signature.error || 'Burn failed');
      }
    } catch (err) {
      setError(err.message);
      console.error('Burn error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!wallet) return null;

  return (
    <button
      onClick={handleBurn}
      disabled={loading}
      className={`px-4 py-2 rounded-lg ${
        loading
          ? 'bg-gray-600 cursor-not-allowed'
          : 'bg-purple-600 hover:bg-purple-700'
      }`}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white rounded-full animate-spin border-t-transparent"></div>
          Burning...
        </span>
      ) : (
        'Burn 1000 Tokens for Random NFT'
      )}
      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
    </button>
  );
});

// Wallet Button Component
const WalletButton = React.memo(({ onWalletChange }) => {
  const [wallet, setWallet] = useState(null);
  const [address, setAddress] = useState(null);

  const connectWallet = useCallback(async () => {
    try {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile && !window.solana) {
        window.location.href = 'https://phantom.app/ul/browse/' + window.location.href;
        return;
      }

      if (!window.solana) {
        alert('Please install Phantom wallet!');
        window.open('https://phantom.app/', '_blank');
        return;
      }

      const resp = await window.solana.connect();
      setWallet(window.solana);
      setAddress(resp.publicKey.toString());
      onWalletChange?.(window.solana);
    } catch (err) {
      console.error('Failed to connect wallet:', err);
    }
  }, [onWalletChange]);

  const disconnectWallet = useCallback(() => {
    if (wallet) {
      wallet.disconnect();
      setWallet(null);
      setAddress(null);
      onWalletChange?.(null);
    }
  }, [wallet, onWalletChange]);

  return (
    <div className="fixed top-4 right-4 z-50">
      {!wallet ? (
        <button
          onClick={connectWallet}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <span>Connect Wallet</span>
        </button>
      ) : (
        <button
          onClick={disconnectWallet}
          className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <span className="truncate w-32">{address}</span>
          <span>×</span>
        </button>
      )}
    </div>
  );
});


// Avatar Detail Modal Component
const AvatarDetailModal = ({ avatar, onClose, wallet }) => {
  const [currentVariantIndex, setCurrentVariantIndex] = useState(0);
  const [activityData, setActivityData] = useState({
    messages: [],
    memories: [],
    narratives: [],
    dungeonStats: avatar?.stats || { attack: 0, defense: 0, hp: 0 },
    dungeonActions: [],
  });

  const variants = avatar?.variants || [avatar];
  const currentVariant = variants[currentVariantIndex];

  useEffect(() => {
    if (avatar?._id) {
      Promise.all([
        fetch(`/api/avatar/${avatar._id}/narratives`).then((r) => r.json()),
        fetch(`/api/avatar/${avatar._id}/memories`).then((r) => r.json()),
        fetch(`/api/avatar/${avatar._id}/dungeon-actions`).then((r) => r.json()),
      ])
        .then(([narrativeData, memoryData, dungeonActions]) => {
          setActivityData({
            messages: narrativeData?.recentMessages || [],
            memories: memoryData?.memories || [],
            narratives: narrativeData?.narratives || [],
            dungeonStats: avatar?.stats || narrativeData?.dungeonStats || { attack: 0, defense: 0, hp: 0 },
            dungeonActions: dungeonActions || [],
          });
        })
        .catch((error) => {
          console.error('Error fetching activity data:', error);
        });
    }
  }, [avatar?._id, avatar?.stats]);

  // Automatic carousel
  useEffect(() => {
    if (variants.length > 1) {
      const interval = setInterval(() => {
        setCurrentVariantIndex((prev) => (prev + 1) % variants.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [variants.length]);

  // Slide Component
  const VariantSlide = React.memo(({ variant, active }) => (
    <div
      className={`absolute inset-0 transition-opacity duration-500 ${
        active ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <img
        src={variant.imageUrl}
        alt={variant.name}
        className="w-full aspect-[2/3] object-cover rounded-lg"
      />
    </div>
  ));

  const tier = getTierFromModel(avatar.model);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <span className="text-3xl">{avatar.emoji}</span>
            <div>
              <h2 className="text-2xl font-bold">{avatar.name}</h2>
              <div className="flex items-center gap-2">
                <TierBadge tier={tier} />
                {avatar.model && <span>{avatar.model}</span>}
                {avatar.emoji && <span>{avatar.emoji}</span>}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">
            ×
          </button>
        </div>

        {/* Ancestry Chain */}
        <AncestryChain ancestry={avatar.ancestry} />

        <div className="grid grid-cols-3 gap-6">
          {/* Left Column: Carousel and Stats */}
          <div className="space-y-4">
            {/* Carousel */}
            <div className="relative">
              <div className="relative aspect-[2/3]">
                {variants.map((variant, idx) => (
                  <VariantSlide key={idx} variant={variant} active={idx === currentVariantIndex} />
                ))}
                {variants.length > 1 && (
                  <>
                    {/* Pagination Dots */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                      {variants.map((_, idx) => (
                        <button
                          key={idx}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            idx === currentVariantIndex ? 'bg-white' : 'bg-gray-500'
                          }`}
                          onClick={() => setCurrentVariantIndex(idx)}
                        />
                      ))}
                    </div>
                    {/* Navigation Arrows */}
                    <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2">
                      <button
                        className="bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 z-10"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentVariantIndex((prev) => (prev - 1 + variants.length) % variants.length);
                        }}
                      >
                        ←
                      </button>
                      <button
                        className="bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 z-10"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentVariantIndex((prev) => (prev + 1) % variants.length);
                        }}
                      >
                        →
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-xl font-bold mb-4">Stats</h3>
              <StatsDisplay stats={avatar.stats} size="large" />

              {/* Wallet Check Before Showing XAuthButton */}
              {wallet && (
                <div className="mt-4">
                  <XAuthButton
                    avatarId={avatar._id}
                    walletAddress={wallet.publicKey.toString()}
                    onAuthChange={(authorized) => {
                      // Optionally update UI to show X posting capability
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right Columns: Description and Activity Feed */}
          <div className="col-span-2 space-y-4">
            {/* Description */}
            <div className="bg-gray-700 rounded-lg p-4">
              {variants.map((variant, idx) => (
                <div
                  key={idx}
                  className={`transition-opacity duration-500 ${
                    idx === currentVariantIndex ? 'opacity-100 block' : 'opacity-0 hidden'
                  }`}
                >
                  <h3 className="text-xl font-bold mb-2">Description</h3>
                  <div className="prose prose-invert max-w-none">
                    <MarkdownContent content={utils.clipDescription(variant.description)} />
                    {variant.dynamicPersonality && (
                      <div className="mt-4 text-gray-400">
                        <h4 className="font-bold mb-1">Personality</h4>
                        <MarkdownContent content={utils.clipDescription(variant.dynamicPersonality)} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
              <ActivityFeed
                messages={activityData.messages}
                memories={activityData.memories}
                narratives={activityData.narratives}
                dungeonActions={activityData.dungeonActions}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Tier Badge Component
const TierBadge = React.memo(({ tier }) => {
  const colors = {
    S: 'bg-purple-600', // Legendary
    A: 'bg-blue-600', // Rare
    B: 'bg-green-600', // Uncommon
    C: 'bg-yellow-600', // Common
    U: 'bg-gray-600', // Unknown
  };

  const tierLabels = {
    S: 'Legendary',
    A: 'Rare',
    B: 'Uncommon',
    C: 'Common',
    U: 'Unknown',
  };

  return (
    <span
      className={`${colors[tier]} px-2 py-1 rounded text-xs font-bold`}
      title={tierLabels[tier]}
    >
      Tier {tier}
    </span>
  );
});

// Progress Ring Component
const ProgressRing = ({ value, maxValue, size = 120, strokeWidth = 8, color = '#60A5FA', centerContent }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = value / maxValue;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#374151"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          fill="transparent"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <div className="absolute text-center">{centerContent}</div>
    </div>
  );
};

// Tier Filter Component
const TierFilter = React.memo(({ selectedTier, onTierChange }) => {
  const tiers = ['All', 'S', 'A', 'B', 'C', 'U'];
  const colors = {
    S: 'bg-purple-600',
    A: 'bg-blue-600',
    B: 'bg-green-600',
    C: 'bg-yellow-600',
    U: 'bg-gray-600',
  };

  return (
    <div className="flex gap-2 justify-center mb-6">
      {tiers.map((tier) => (
        <button
          key={tier}
          className={`px-3 py-1 rounded ${
            selectedTier === tier
              ? tier === 'All'
                ? 'bg-white text-gray-900'
                : `${colors[tier]} text-white`
              : 'bg-gray-700 text-gray-300'
          }`}
          onClick={() => onTierChange(tier)}
        >
          {tier}
        </button>
      ))}
    </div>
  );
});


// Activity Feed Component
const ActivityFeed = ({ messages, memories, narratives, dungeonActions }) => {
  const formatDate = (date) => new Date(date).toLocaleString();

  // Safely extract arrays from potentially nested response objects
  const messagesList = Array.isArray(messages) ? messages : messages?.messages || [];
  const memoriesList = Array.isArray(memories) ? memories : memories?.memories || [];
  const narrativesList = Array.isArray(narratives) ? narratives : narratives?.narratives || [];
  const actionsList = Array.isArray(dungeonActions) ? dungeonActions : dungeonActions?.actions || [];

  // Combine and sort all activities
  const activities = React.useMemo(
    () =>
      [
        ...messagesList.map((m) => ({
          type: 'message',
          content: m.content,
          timestamp: new Date(m.timestamp),
          icon: '💭',
        })),
        ...memoriesList.map((m) => ({
          type: 'memory',
          content: m.memory,
          timestamp: new Date(m.timestamp),
          icon: '🧠',
        })),
        ...narrativesList.map((n) => ({
          type: 'narrative',
          content: n.content,
          timestamp: new Date(n.timestamp),
          icon: '📖',
        })),
        ...actionsList.map((d) => ({
          type: 'dungeon',
          content: `**${d.result}** ${d.targetName ? `against ${d.targetName}` : ''}`,
          timestamp: new Date(d.timestamp),
          icon: '⚔️',
        })),
      ].sort((a, b) => b.timestamp - a.timestamp),
    [messagesList, memoriesList, narrativesList, actionsList]
  );

  return (
    <div className="space-y-4">
      {activities.map((activity, i) => (
        <div key={i} className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-gray-400">{activity.icon}</span>
            <span className="text-xs text-gray-500">{formatDate(activity.timestamp)}</span>
            <span className="text-xs text-gray-400 ml-auto">{activity.type}</span>
          </div>
          <MarkdownContent content={activity.content} />
        </div>
      ))}
      {activities.length === 0 && (
        <div className="text-gray-500 text-center">No recent activity</div>
      )}
    </div>
  );
};

// Ancestry Chain Component
const AncestryChain = React.memo(({ ancestry }) => {
  if (!ancestry?.length) return null;

  return (
    <div className="bg-gray-700 rounded-lg p-4 mb-4">
      <h3 className="text-xl font-bold mb-3">Ancestry</h3>
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {ancestry
          .slice()
          .reverse()
          .map((ancestor, index, array) => (
            <React.Fragment key={ancestor._id}>
              <div className="flex items-center gap-2 flex-shrink-0">
                <img
                  src={ancestor.imageUrl}
                  alt={ancestor.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="text-sm">
                  <div className="font-medium">{ancestor.name}</div>
                  <div className="text-gray-400 text-xs">{ancestor.emoji}</div>
                </div>
              </div>
              {index < array.length - 1 && (
                <span className="text-gray-500 mx-2">→</span>
              )}
            </React.Fragment>
          ))}
      </div>
    </div>
  );
});

// Stats Display Component
const StatsDisplay = React.memo(({ stats, size = 'small' }) => {
  const { hp = 0, attack = 0, defense = 0 } = stats || {};

  if (size === 'small') {
    return (
      <div className="flex gap-2 text-xs text-gray-400">
        {hp > 0 && (
          <span title="HP">
            ❤️ {hp}
          </span>
        )}
        {attack > 0 && (
          <span title="Attack">
            ⚔️ {attack}
          </span>
        )}
        {defense > 0 && (
          <span title="Defense">
            🛡️ {defense}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {hp > 0 && (
        <div className="flex justify-center">
          <ProgressRing
            value={hp}
            maxValue={100}
            size={80}
            centerContent={<div className="text-lg font-bold">❤️ {hp}</div>}
          />
        </div>
      )}
      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="bg-gray-800 rounded p-2">
          <div className="text-sm text-gray-400">Attack</div>
          <div className="text-xl">⚔️ {attack}</div>
        </div>
        <div className="bg-gray-800 rounded p-2">
          <div className="text-sm text-gray-400">Defense</div>
          <div className="text-xl">🛡️ {defense}</div>
        </div>
      </div>
    </div>
  );
});

// XAuth Button Component
const XAuthButton = ({ avatarId, walletAddress, onAuthChange }) => {
  const [authStatus, setAuthStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkAuthStatus = useCallback(async () => {
    if (!avatarId) return;

    try {
      setError(null);
      const response = await fetch(`/api/xauth/status/${avatarId}`);
      const data = await response.json();
      setAuthStatus(data);
      onAuthChange?.(data.authorized);

      // If token is invalid/revoked, clear the status
      if (data.requiresReauth) {
        setAuthStatus(null);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setError('Failed to check connection status');
      setAuthStatus(null);
    } finally {
      setLoading(false);
    }
  }, [avatarId, onAuthChange]);

  // Poll status every minute to detect revoked access
  useEffect(() => {
    if (avatarId) {
      checkAuthStatus();
      const interval = setInterval(checkAuthStatus, 60000);
      return () => clearInterval(interval);
    }
  }, [avatarId, checkAuthStatus]);

  const handleAuth = async () => {
    try {
      setError(null);
      setLoading(true);

      const response = await fetch(
        `/api/xauth/auth-url?walletAddress=${walletAddress}&avatarId=${avatarId}`
      );
      const { url, error: authError } = await response.json();

      if (authError) {
        throw new Error(authError);
      }

      const popup = window.open(url, 'x-auth', 'width=600,height=800,left=100,top=100');

      const handleMessage = async (event) => {
        if (event.data.type === 'X_AUTH_SUCCESS') {
          await checkAuthStatus();
          popup?.close();
        } else if (event.data.type === 'X_AUTH_ERROR') {
          setError(event.data.error || 'Authentication failed');
          popup?.close();
        }
      };

      window.addEventListener('message', handleMessage);

      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', handleMessage);
          setLoading(false);
        }
      }, 1000);
    } catch (error) {
      console.error('Error starting auth:', error);
      setError(error.message || 'Failed to start authentication');
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setLoading(true);
      await fetch(`/api/xauth/disconnect/${avatarId}`, { method: 'POST' });
      setAuthStatus(null);
      onAuthChange?.(false);
    } catch (error) {
      console.error('Error disconnecting:', error);
      setError('Failed to disconnect');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <button
        className="bg-gray-600 px-4 py-2 rounded opacity-50 cursor-not-allowed flex items-center gap-2"
        disabled
      >
        <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
        <span>Checking status...</span>
      </button>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-2">
        <button
          onClick={checkAuthStatus}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded flex items-center gap-2"
        >
          ⚠️ Retry connection
        </button>
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  if (authStatus?.authorized) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <button
            className="bg-blue-600 px-4 py-2 rounded flex items-center gap-2"
            title={`Connected until ${new Date(authStatus.expiresAt).toLocaleString()}`}
          >
            𝕏 Connected
          </button>
          <button
            onClick={handleDisconnect}
            className="bg-gray-600 hover:bg-gray-700 px-3 py-2 rounded text-sm"
          >
            Disconnect
          </button>
        </div>
        <p className="text-xs text-gray-400">
          Expires: {new Date(authStatus.expiresAt).toLocaleString()}
        </p>
      </div>
    );
  }

  return (
    <button
      onClick={handleAuth}
      className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded flex items-center gap-2"
    >
      𝕏 Connect X Account
    </button>
  );
};

// Main App Component
function App() {
  const [avatars, setAvatars] = useState([]);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastMessageCount, setLastMessageCount] = useState(null);
  const [lastId, setLastId] = useState(null);
  const [selectedTier, setSelectedTier] = useState('All');
  const [currentView, setCurrentView] = useState('leaderboard');
  const [modalAvatar, setModalAvatar] = useState(null);
  const [wallet, setWallet] = useState(null);

  const loadAvatars = useCallback(
    async (isInitial = false) => {
      if (loading || (!hasMore && !isInitial)) return;

      setLoading(true);
      try {
        const url = new URL('/api/leaderboard', window.location.origin);
        url.searchParams.set('limit', '24');

        if (selectedTier !== 'All') {
          url.searchParams.set('tier', selectedTier);
        }

        if (!isInitial && lastMessageCount !== null && lastId) {
          url.searchParams.set('lastMessageCount', lastMessageCount);
          url.searchParams.set('lastId', lastId);
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
        console.error('Error loading avatars:', error);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    },
    [loading, hasMore, selectedTier, lastMessageCount, lastId]
  );

  useEffect(() => {
    loadAvatars(true);
  }, [loadAvatars]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 1000 &&
        !loading &&
        hasMore
      ) {
        loadAvatars();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
        console.error('Error fetching avatar details:', err);
        setModalAvatar(avatar); // Fallback to basic avatar data
      });
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <WalletButton onWalletChange={setWallet} />
      <h1 className="text-4xl font-bold mb-8 text-center">Avatar Dashboard</h1>
      <ViewToggle currentView={currentView} onViewChange={setCurrentView} />

      {currentView === 'collection' ? (
        <>
          <TierFilter selectedTier={selectedTier} onTierChange={setSelectedTier} />
          <AvatarSearch onSelect={handleAvatarSelect} />
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 mt-4">
            {avatars.map((avatar) => (
              <AvatarCard key={avatar._id} avatar={avatar} onSelect={handleAvatarSelect} />
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
      ) : currentView === 'leaderboard' ? (
        <LeaderboardView />
      ) : currentView === 'combat' ? (
        <CombatLog onAvatarSelect={handleAvatarSelect} />
      ) : currentView === 'tribes' ? (
        <TribesView onAvatarSelect={handleAvatarSelect} />
      ) : null}

      {/* Optionally, include BurnTokenButton somewhere in the UI */}
      {wallet && <BurnTokenButton wallet={wallet} onSuccess={() => { /* Handle success */ }} />}
    </div>
  );
};

// Initialize app
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}