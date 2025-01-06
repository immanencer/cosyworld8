
const Toast = ({ message, onClose }) => {
  const avatar = message?.avatar || {};
  
  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 rounded-lg shadow-lg p-4 animate-fade-in-out flex items-start gap-4 max-w-md">
      <img 
        src={avatar.thumbnailUrl || avatar.imageUrl} 
        alt={avatar.name}
        className="w-12 h-12 rounded-full object-cover"
      />
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-purple-400">{avatar.name}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-200">×</button>
        </div>
        <p className="text-gray-200 text-sm mt-1">{message.content}</p>
      </div>
    </div>
  );
};
