
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

export { AncestryChain };
