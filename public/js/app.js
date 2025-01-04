const { useState, useEffect, useCallback } = React;

// Add this utility function near the top
function sanitizeNumber(value, fallback = 0) {
  const num = Number(value);
  return !isNaN(num) && isFinite(num) ? num : fallback;
}

// Add this helper function for safe markdown rendering
function MarkdownContent({ content }) {
  const sanitizedContent = marked.parse(content || '').replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  return (
    <div 
      className="prose prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: sanitizedContent }} 
    />
  );
}

// Add these helper functions at the top of the file
const getModelRarity = (modelName) => {
  // You might want to fetch this from an API or include models.config.mjs content
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
    'x-ai/grok-beta': 'legendary'
  };
  return modelRarities[modelName] || 'common';
};

const rarityToTier = {
  'legendary': 'S',
  'rare': 'A',
  'uncommon': 'B',
  'common': 'C'
};

const getTierFromModel = (model) => {
  if (!model) return 'U';
  const rarity = getModelRarity(model);
  return rarityToTier[rarity] || 'U';
};

function TierBadge({ tier }) {
  const colors = {
    S: 'bg-purple-600',  // matches legendary: 0x9333EA
    A: 'bg-blue-600',    // matches rare: 0x2563EB
    B: 'bg-green-600',   // matches uncommon: 0x16A34A
    C: 'bg-yellow-600',  // matches common: 0xEAB308
    U: 'bg-gray-600'     // matches undefined: 0x4B5563
  };

  const tierLabels = {
    S: 'Legendary',
    A: 'Rare',
    B: 'Uncommon',
    C: 'Common',
    U: 'Unknown'
  };

  return (
    <span 
      className={`${colors[tier]} px-2 py-1 rounded text-xs font-bold`} 
      title={tierLabels[tier]}
    >
      Tier {tier}
    </span>
  );
}

function ProgressRing({ value, maxValue, size = 120, strokeWidth = 8, color = '#60A5FA', centerContent }) {
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
      <div className="absolute text-center">
        {centerContent}
      </div>
    </div>
  );
}

function TierFilter({ selectedTier, onTierChange }) {
  const tiers = ['All', 'S', 'A', 'B', 'C', 'U'];
  const colors = {
    S: 'bg-purple-600',
    A: 'bg-blue-600',
    B: 'bg-green-600',
    C: 'bg-yellow-600',
    U: 'bg-gray-600'
  };

  return (
    <div className="flex gap-2 justify-center mb-6">
      {tiers.map(tier => (
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
}

// Update ActivityFeed to include dungeon actions and markdown
function ActivityFeed({ messages, memories, narratives, dungeonActions }) {
  const formatDate = (date) => new Date(date).toLocaleString();

  // Safely extract arrays from potentially nested response objects
  const messagesList = Array.isArray(messages) ? messages : (messages?.messages || []);
  const memoriesList = Array.isArray(memories) ? memories : (memories?.memories || []);
  const narrativesList = Array.isArray(narratives) ? narratives : (narratives?.narratives || []);
  const actionsList = Array.isArray(dungeonActions) ? dungeonActions : (dungeonActions?.actions || []);

  // Combine and sort all activities
  const activities = [
    ...messagesList.map(m => ({ 
      type: 'message', 
      content: m.content, 
      timestamp: new Date(m.timestamp),
      icon: '💭'
    })),
    ...memoriesList.map(m => ({ 
      type: 'memory', 
      content: m.memory, 
      timestamp: new Date(m.timestamp),
      icon: '🧠'
    })),
    ...narrativesList.map(n => ({ 
      type: 'narrative', 
      content: n.content, 
      timestamp: new Date(n.timestamp),
      icon: '📖'
    })),
    ...actionsList.map(d => ({
      type: 'dungeon',
      content: `**${d.result}** ${d.targetName ? `against ${d.targetName}` : ''}`,
      timestamp: new Date(d.timestamp),
      icon: '⚔️'
    }))
  ].sort((a, b) => b.timestamp - a.timestamp);

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
}

// Add helper function to clip description
function clipDescription(text) {
  if (!text) return '';
  const doubleNewline = text.indexOf('\n\n');
  return doubleNewline > -1 ? text.slice(0, doubleNewline) : text;
}

// Add an AncestryChain component
function AncestryChain({ ancestry }) {
  if (!ancestry?.length) return null;

  return (
    <div className="bg-gray-700 rounded-lg p-4 mb-4">
      <h3 className="text-xl font-bold mb-3">Ancestry</h3>
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {ancestry.slice().reverse().map((ancestor, index, array) => (
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
}

// Add a StatsDisplay component
function StatsDisplay({ stats, size = "small" }) {
  const { hp = 0, attack = 0, defense = 0 } = stats || {};
  
  if (size === "small") {
    return (
      <div className="flex gap-2 text-xs text-gray-400">
        {hp > 0 && <span title="HP">❤️ {hp}</span>}
        {attack > 0 && <span title="Attack">⚔️ {attack}</span>}
        {defense > 0 && <span title="Defense">🛡️ {defense}</span>}
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
            centerContent={
              <div className="text-lg font-bold">❤️ {hp}</div>
            }
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
}

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
      const { url, error } = await response.json();
      
      if (error) {
        throw new Error(error);
      }

      const popup = window.open(
        url, 
        'x-auth', 
        'width=600,height=800,left=100,top=100'
      );

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
    } finally {
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
      <button className="bg-gray-600 px-4 py-2 rounded opacity-50 cursor-not-allowed flex items-center gap-2">
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
          ⚠️ {/* Replace AlertCircle with emoji */}
          <span>Retry connection</span>
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
            𝕏 {/* Replace Twitter icon with X symbol */}
            <span>Connected</span>
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
      𝕏 {/* Replace Twitter icon with X symbol */}
      <span>Connect X Account</span>
    </button>
  );
};

// Update the modal layout
function AvatarDetailModal({ avatar, onClose, wallet }) {  // Add wallet prop
  const [currentVariantIndex, setCurrentVariantIndex] = useState(0);
  const [activityData, setActivityData] = useState({
    messages: [],
    memories: [],
    narratives: [],
    dungeonStats: avatar?.stats || { attack: 0, defense: 0, hp: 0 },
    dungeonActions: []
  });

  const variants = avatar?.variants || [avatar];
  const currentVariant = variants[currentVariantIndex];

  useEffect(() => {
    if (avatar?._id) {
      Promise.all([
        fetch(`/api/avatar/${avatar._id}/narratives`).then(r => r.json()),
        fetch(`/api/avatar/${avatar._id}/memories`).then(r => r.json()),
        fetch(`/api/avatar/${avatar._id}/dungeon-actions`).then(r => r.json())
      ]).then(([narrativeData, memoryData, dungeonActions]) => {
        setActivityData({
          messages: narrativeData?.recentMessages || [],
          memories: memoryData?.memories || [],
          narratives: narrativeData?.narratives || [],
          dungeonStats: avatar?.stats || narrativeData?.dungeonStats || { attack: 0, defense: 0, hp: 0 },
          dungeonActions: dungeonActions || []
        });
      });
    }
  }, [avatar?._id]);

  // Add automatic carousel
  useEffect(() => {
    if (variants.length > 1) {
      const interval = setInterval(() => {
        setCurrentVariantIndex((prev) => (prev + 1) % variants.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [variants.length]);

  function VariantSlide({ variant, active }) {
    return (
      <div className={`absolute inset-0 transition-opacity duration-500 ${
        active ? 'opacity-100' : 'opacity-0'
      }`}>
        <img 
          src={variant.imageUrl}
          alt={variant.name}
          className="w-full aspect-[2/3] object-cover rounded-lg"
        />
      </div>
    );
  }

  const tier = getTierFromModel(avatar.model);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header row */}
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
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">×</button>
        </div>

        {/* Add Ancestry Chain */}
        <AncestryChain ancestry={avatar.ancestry} />

        <div className="grid grid-cols-3 gap-6">
          {/* Left column: Carousel and Stats */}
          <div className="space-y-4">
            {/* Image and description carousel */}
            <div className="relative">
              <div className="relative aspect-[2/3]">
                {variants.map((variant, idx) => (
                  <VariantSlide 
                    key={idx}
                    variant={variant}
                    active={idx === currentVariantIndex}
                  />
                ))}
                {variants.length > 1 && (
                  <>
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
              
              {/* Add wallet check before showing XAuthButton */}
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

          {/* Right columns: Description and Activity Feed */}
          <div className="col-span-2 space-y-4">
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
                    <MarkdownContent content={clipDescription(variant.description)} />
                    {variant.dynamicPersonality && (
                      <div className="mt-4 text-gray-400">
                        <h4 className="font-bold mb-1">Personality</h4>
                        <MarkdownContent content={clipDescription(variant.dynamicPersonality)} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

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
}

// Update AvatarCard to show stats
function AvatarCard({ avatar, onSelect }) {
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
    <div onClick={() => onSelect(avatar)} 
         className="bg-gray-800 rounded-lg p-2 cursor-pointer hover:bg-gray-700 transition-colors">
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
}

// Add AvatarSearch component
function AvatarSearch({ onSelect }) {
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
        setResults(data.avatars);
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
          {results.map(avatar => (
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
                src={avatar.thumbnailUrl} 
                alt={avatar.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <div className="font-medium">{avatar.name}</div>
                {avatar.emoji && (
                  <div className="text-sm text-gray-400">{avatar.emoji}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Update CombatLogEntry component
function CombatLogEntry({ entry, onAvatarClick }) {
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
        {emoji && (
          <div className="text-xs text-gray-400">{emoji}</div>
        )}
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
          <span className="text-sm font-medium text-gray-300">{entry.result.substring(0, 80)}</span>
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
}

// Update CombatLog component
function CombatLog({ onAvatarSelect }) {
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
          <CombatLogEntry 
            key={index} 
            entry={entry}
            onAvatarClick={onAvatarSelect}
          />
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
}

function LeaderboardView() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('/api/leaderboard/minted');
        const data = await response.json();
        setLeaderboard(data);
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
}

function ViewToggle({ currentView, onViewChange }) {
  return (
    <div className="flex justify-center gap-4 mb-8">
      <button
        className={`px-4 py-2 rounded ${
          currentView === 'collection' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
        }`}
        onClick={() => onViewChange('collection')}
      >
        Collection
      </button>
      <button
        className={`px-4 py-2 rounded ${
          currentView === 'leaderboard' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'
        }`}
        onClick={() => onViewChange('leaderboard')}
      >
        Leaderboard
      </button>
      <button
        className={`px-4 py-2 rounded ${
          currentView === 'combat' ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300'
        }`}
        onClick={() => onViewChange('combat')}
      >
        Combat Log
      </button>
      <button
        className={`px-4 py-2 rounded ${
          currentView === 'tribes' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300'
        }`}
        onClick={() => onViewChange('tribes')}
      >
        Tribes
      </button>
    </div>
  );
}

function FamilyCard({ family, onSelect }) {
  // Ensure descendants exists and is an array
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
            <div className="text-gray-400">
              {descendantsCount} descendants
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Update TribesView to use shared avatar click handler
function TribesView({ onAvatarSelect }) {
  const [tribes, setTribes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmoji, setSelectedEmoji] = useState(null);
  const [error, setError] = useState(null);

  const sanitizeMembers = useCallback((members) => {
    if (!Array.isArray(members)) return [];
    return members.filter(member => 
      member && 
      typeof member === 'object' &&
      typeof member._id === 'string' &&
      typeof member.name === 'string' &&
      (typeof member.thumbnailUrl === 'string' || typeof member.imageUrl === 'string')
    );
  }, []);

  const sanitizeTribe = useCallback((tribe) => {
    if (!tribe || typeof tribe !== 'object' || typeof tribe.emoji !== 'string') return null;
    const members = sanitizeMembers(tribe.members);
    if (!members.length) {
      // Even if no members are found, return a tribe with empty members array
      return { emoji: tribe.emoji, count: 0, members: [] };
    }
    return { emoji: tribe.emoji, count: members.length, members };
  }, [sanitizeMembers]);
  

  useEffect(() => {
    const fetchTribes = async () => {
      try {
        const response = await fetch('/api/tribes');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Sanitize the entire tribes data
        const validTribes = (Array.isArray(data) ? data : [])
          .map(sanitizeTribe)
          .filter(Boolean);

        setTribes(validTribes);
      } catch (error) {
        console.error('Error fetching tribes:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTribes();
  }, [sanitizeTribe]);

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-4">
        Error loading tribes: {error}
      </div>
    );
  }

  if (!tribes.length) {
    return (
      <div className="text-center text-gray-400 py-4">
        No tribes found
      </div>
    );
  }

  const selectedTribe = selectedEmoji ? 
    tribes.find(t => t && t.emoji === selectedEmoji) : null;
    console.log('selectedTribe', selectedTribe);
    console.log('selectedTribe.emoji', selectedTribe?.emoji);
    console.log('members', selectedTribe?.members);
  return (
    <div>
      {/* Emoji selector */}
      <div className="flex flex-wrap gap-4 mb-8 justify-center">
        {tribes.map(tribe => (
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

      {/* Selected tribe details */}
      {selectedTribe && (
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center gap-4 mb-6">
            <span className="text-4xl">{selectedTribe.emoji}</span>
            <div>
              <h2 className="text-2xl font-bold">
                {selectedTribe.count} Members
              </h2>
              <p className="text-gray-400">Click an avatar to view details</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {selectedTribe.members.map(member => (
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
                  {member.model && (
                    <div className="text-xs text-gray-400">{member.model}</div>
                  )}
                  {member.emoji && (
                    <div className="text-sm">{member.emoji}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {!selectedTribe && (
        <div className="text-center text-gray-400">
          Select an emoji to view tribe members
        </div>
      )}
    </div>
  );
}

// Add these new components at the top with other component definitions
function BurnTokenButton({ wallet, onSuccess }) {
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
          walletAddress: wallet.publicKey.toString()
        })
      }).then(r => r.json());

      const signedTx = await wallet.signTransaction(burnTx.transaction);
      const signature = await fetch('/api/tokens/burn/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          signature: signedTx.signature,
          walletAddress: wallet.publicKey.toString()
        })
      }).then(r => r.json());

      if (signature.success) {
        onSuccess?.();
      }
    } catch (err) {
      setError(err.message);
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
}

function WalletButton({ onWalletChange }) {
  const [wallet, setWallet] = useState(null);
  const [address, setAddress] = useState(null);

  const connectWallet = async () => {
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
  };

  const disconnectWallet = () => {
    if (wallet) {
      wallet.disconnect();
      setWallet(null);
      setAddress(null);
      onWalletChange?.(null);  // Notify parent of wallet disconnection
    }
  };

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
}

// Update App component to include WalletButton
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

  const loadAvatars = async (isInitial = false) => {
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
        setAvatars(prev => [...prev, ...(data.avatars || [])]);
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
  };

  useEffect(() => {
    loadAvatars(true);
  }, []);

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
  }, [loading, hasMore, lastMessageCount, lastId]);

  useEffect(() => {
    setLastMessageCount(null);
    setLastId(null);
    setHasMore(true);
    setAvatars([]);
    loadAvatars(true);
  }, [selectedTier]);

  // Handler for avatar selection from any view
  const handleAvatarSelect = (avatar) => {
    // Fetch full avatar details if needed
    fetch(`/api/avatars/${avatar._id}`)
      .then(res => res.json())
      .then(data => setModalAvatar(data))
      .catch(err => {
        console.error('Error fetching avatar details:', err);
        setModalAvatar(avatar); // Fallback to basic avatar data
      });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <WalletButton onWalletChange={setWallet} />  {/* Update WalletButton to accept callback */}
      <h1 className="text-4xl font-bold mb-8 text-center">Avatar Dashboard</h1>
      <ViewToggle currentView={currentView} onViewChange={setCurrentView} />
      
      {currentView === 'collection' ? (
        <>
          <TierFilter 
            selectedTier={selectedTier} 
            onTierChange={tier => setSelectedTier(tier)} 
          />
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {avatars.map(avatar => (
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
          {selectedAvatar && (
            <AvatarDetailModal 
              avatar={selectedAvatar} 
              onClose={() => setSelectedAvatar(null)} 
            />
          )}
        </>
      ) : currentView === 'leaderboard' ? (
        <LeaderboardView />
      ) : currentView === 'combat' ? (
        <CombatLog onAvatarSelect={handleAvatarSelect} />
      ) : (
        <TribesView onAvatarSelect={handleAvatarSelect} />
      )}

      {modalAvatar && (
        <AvatarDetailModal 
          avatar={modalAvatar} 
          onClose={() => setModalAvatar(null)} 
          wallet={wallet}  // Pass wallet to modal
        />
      )}
    </div>
  );
}
// Root render
const rootElement = document.getElementById('root');
ReactDOM.createRoot(rootElement).render(<App />);

function AvatarGallery() {
  const [avatars, setAvatars] = useState([]);
  const [publicKey, setPublicKey] = useState(null);
  const [loading, setLoading] = useState(true);

  const connectWallet = async () => {
    try {
      if (!window.solana) {
        alert('Please install Phantom wallet');
        return;
      }
      const resp = await window.solana.connect();
      setPublicKey(resp.publicKey.toString());
    } catch (err) {
      console.error('Wallet connection error:', err);
    }
  };

  const mintAvatar = async () => {
    try {
      const response = await fetch('/api/tokens/mint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ walletAddress: publicKey })
      });
      const data = await response.json();
      if (data.success) {
        loadAvatars();
      }
    } catch (err) {
      console.error('Minting error:', err);
    }
  };

  const loadAvatars = async () => {
    if (!publicKey) return;
    try {
      const response = await fetch(`/api/avatars/owned/${publicKey}`);
      const data = await response.json();
      setAvatars(data);
    } catch (err) {
      console.error('Error loading avatars:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (publicKey) {
      loadAvatars();
    }
  }, [publicKey]);

  if (!publicKey) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
        <button
          onClick={connectWallet}
          className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {avatars.map(avatar => (
          <div key={avatar._id} className="bg-gray-800 rounded-lg p-4">
            <img src={avatar.imageUrl} alt={avatar.name} className="w-full rounded-lg" />
            <h3 className="text-xl font-bold mt-2">{avatar.name}</h3>
            <p className="text-gray-400">{avatar.description}</p>
          </div>
        ))}
        <div className="bg-gray-800 rounded-lg p-4 flex flex-col items-center justify-center">
          <div className="w-48 h-48 bg-wood-pattern rounded-lg mb-4"></div>
          <button
            onClick={mintAvatar}
            className="px-6 py-3 bg-green-600 rounded-lg hover:bg-green-700"
          >
            Mint New Avatar
          </button>
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<AvatarGallery />);
