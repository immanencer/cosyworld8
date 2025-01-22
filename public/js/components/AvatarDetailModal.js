const { getTierFromModel } = window.utils;

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
        fetch(`/api/avatar/${avatar._id}/dungeon-actions`).then((r) =>
          r.json(),
        ),
      ])
        .then(([narrativeData, memoryData, dungeonActions]) => {
          setActivityData({
            messages: narrativeData?.recentMessages || [],
            memories: memoryData?.memories || [],
            narratives: narrativeData?.narratives || [],
            dungeonStats: avatar?.stats ||
              narrativeData?.dungeonStats || { attack: 0, defense: 0, hp: 0 },
            dungeonActions: dungeonActions || [],
          });
        })
        .catch((error) => {
          console.error("Error fetching activity data:", error);
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
        active ? "opacity-100" : "opacity-0"
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
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
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
                  <VariantSlide
                    key={idx}
                    variant={variant}
                    active={idx === currentVariantIndex}
                  />
                ))}
                {variants.length > 1 && (
                  <>
                    {/* Pagination Dots */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                      {variants.map((_, idx) => (
                        <button
                          key={idx}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            idx === currentVariantIndex
                              ? "bg-white"
                              : "bg-gray-500"
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
                          setCurrentVariantIndex(
                            (prev) =>
                              (prev - 1 + variants.length) % variants.length,
                          );
                        }}
                      >
                        ←
                      </button>
                      <button
                        className="bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 z-10"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentVariantIndex(
                            (prev) => (prev + 1) % variants.length,
                          );
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
                    idx === currentVariantIndex
                      ? "opacity-100 block"
                      : "opacity-0 hidden"
                  }`}
                >
                  <h3 className="text-xl font-bold mb-2">Description</h3>
                  <div className="prose prose-invert max-w-none">
                    <MarkdownContent
                      content={utils.clipDescription(variant.description)}
                    />
                    {variant.dynamicPersonality && (
                      <div className="mt-4 text-gray-400">
                        <h4 className="font-bold mb-1">Personality</h4>
                        <MarkdownContent
                          content={utils.clipDescription(
                            variant.dynamicPersonality,
                          )}
                        />
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
