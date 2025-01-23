
const AvatarModal = ({ avatar, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const variants = avatar?.variants || [avatar];
  const currentVariant = variants[currentIndex];
  const tier = getTierFromModel(avatar.model);

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <span className="text-3xl">{avatar.emoji}</span>
            <div>
              <h2 className="text-2xl font-bold">{avatar.name}</h2>
              <div className="flex items-center gap-2">
                <TierBadge tier={tier} />
                {avatar.model && <span className="text-sm text-gray-400">{avatar.model}</span>}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">×</button>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Left Column: Image and Stats */}
          <div>
            <div className="relative aspect-square mb-4">
              <img 
                src={currentVariant.imageUrl} 
                alt={avatar.name}
                className="w-full h-full object-cover rounded-lg"
              />
              {variants.length > 1 && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {variants.map((_, idx) => (
                    <button
                      key={idx}
                      className={`w-2 h-2 rounded-full ${idx === currentIndex ? 'bg-white' : 'bg-gray-500'}`}
                      onClick={() => setCurrentIndex(idx)}
                    />
                  ))}
                </div>
              )}
            </div>
            <StatsDisplay stats={avatar.stats} />
          </div>

          {/* Right Column: Description and Details */}
          <div className="col-span-2 space-y-4">
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-xl font-bold mb-2">Description</h3>
              <p className="text-gray-300">{currentVariant.description}</p>
            </div>
            
            {currentVariant.personality && (
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-xl font-bold mb-2">Personality</h3>
                <p className="text-gray-300">{currentVariant.personality}</p>
              </div>
            )}

            {avatar.narrativesSummary && (
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-xl font-bold mb-2">Recent Activity</h3>
                <p className="text-gray-300">{avatar.narrativesSummary}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
