export function extractJsonFuzzy(text) {
  if (typeof text !== 'string') return null;

  const jsonRegex = /([\[{])[\s\S]*?([\]}])/m;
  const match = text.match(jsonRegex);
  if (!match) return null;

  const startIdx = text.indexOf(match[1]);
  const openChar = match[1];
  const closeChar = openChar === '{' ? '}' : ']';

  let depth = 0;
  let endIdx = -1;
  for (let i = startIdx; i < text.length; i++) {
    if (text[i] === openChar) depth++;
    else if (text[i] === closeChar) depth--;

    if (depth === 0) {
      endIdx = i + 1;
      break;
    }
  }

  if (endIdx === -1) return null;

  const jsonStr = text.slice(startIdx, endIdx).trim();

  try {
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}
