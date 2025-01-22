import { useState, useEffect } from 'react';

export const CombatLog = React.memo(({ onAvatarSelect }) => {
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
            key={entry._id || `${entry.actionId || 'combat'}-${index}`}
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
});

export const CombatLogEntry = React.memo(({ entry, onAvatarClick }) => {
  // ... existing CombatLogEntry code ...
});
