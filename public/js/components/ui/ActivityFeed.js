import { MarkdownContent } from '../utils/MarkdownContent';

function ActivityFeed({ messages, memories, narratives, dungeonActions }) {
  const formatDate = (date) => new Date(date).toLocaleString();

  const messagesList = Array.isArray(messages) ? messages : (messages?.messages || []);
  const memoriesList = Array.isArray(memories) ? memories : (memories?.memories || []);
  const narrativesList = Array.isArray(narratives) ? narratives : (narratives?.narratives || []);
  const actionsList = Array.isArray(dungeonActions) ? dungeonActions : (dungeonActions?.actions || []);

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
        <div
          key={`${activity.type}-${activity.timestamp?.getTime?.() || i}`}
          className="bg-gray-700 rounded-lg p-4"
        >
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

export { ActivityFeed };
