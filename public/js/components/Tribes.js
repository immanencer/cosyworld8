
import React, { useState, useEffect, useCallback } from 'react';

export const TribesView = React.memo(({ onAvatarSelect }) => {
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
        </div>
      ) : (
        <div className="text-center text-gray-400">Select an emoji to view tribe members</div>
      )}
    </div>
  );
});
