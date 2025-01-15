
import { ProgressRing } from './ProgressRing';

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

export { StatsDisplay };
