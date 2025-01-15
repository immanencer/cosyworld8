
function MarkdownContent({ content }) {
  const sanitizedContent = marked.parse(content || '').replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  return (
    <div 
      className="prose prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: sanitizedContent }} 
    />
  );
}

export { MarkdownContent };
