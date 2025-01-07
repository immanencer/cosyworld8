
// services/utils.mjs

/**
 * Sanitizes user input to prevent injection attacks or malformed data.
 * @param {string} input - The user-provided input.
 * @returns {string} - The sanitized input.
 */
export function sanitizeInput(input) {
    // Remove all characters except letters, numbers, whitespace, and emojis
    // \p{Emoji} matches any emoji character
    return input.replace(/[^\p{L}\p{N}\s\p{Emoji}]/gu, '').trim();
  }
  

  /**
 * Extracts JSON substring from a given string.
 *
 * @param {string} str - The input string containing JSON.
 * @returns {string} - The extracted JSON string.
 * @throws Will throw an error if no valid JSON is found.
 */
export function extractJSON(str) {
  const startjsonblock = str.indexOf('```json');
  const endjsonblock = str.indexOf('```', startjsonblock + 1);
  if (startjsonblock !== -1 && endjsonblock !== -1) {
    str = str.substring(startjsonblock + 7, endjsonblock);
  }

  const startCodeBlock = str.indexOf('```');
  const endCodeBlock = str.indexOf('```', startCodeBlock + 1);
  if (startCodeBlock !== -1 && endCodeBlock !== -1) {
    str = str.substring(startCodeBlock + 3, endCodeBlock);
  }

  const start = str.indexOf('{');
  const end = str.lastIndexOf('}');
  
  if (start === -1 || end === -1 || end < start) {
    throw new Error('No valid JSON object found in the response.');
  }
  
  const jsonString = str.substring(start, end + 1);
  
  try {
    // Validate JSON structure
    JSON.parse(jsonString);
    return jsonString;
  } catch (parseError) {
    throw new Error('Extracted string is not valid JSON.');
  }
}