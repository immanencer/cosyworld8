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
  if (!str || typeof str !== 'string') {
    throw new Error('Invalid input: Expected a string.');
  }

  // First, try to extract JSON from markdown code blocks
  let cleanedStr = str;

  // Handle ```json code blocks
  const jsonBlockRegex = /```json\s*([\s\S]*?)\s*```/;
  const jsonBlockMatch = str.match(jsonBlockRegex);
  if (jsonBlockMatch && jsonBlockMatch[1]) {
    cleanedStr = jsonBlockMatch[1].trim();
  } else {
    // Handle generic ``` code blocks
    const codeBlockRegex = /```\s*([\s\S]*?)\s*```/;
    const codeBlockMatch = str.match(codeBlockRegex);
    if (codeBlockMatch && codeBlockMatch[1]) {
      cleanedStr = codeBlockMatch[1].trim();
    }
  }

  // Find the outermost JSON object
  const start = cleanedStr.indexOf('{');
  const end = cleanedStr.lastIndexOf('}');

  if (start === -1 || end === -1 || end < start) {
    throw new Error('No valid JSON object found in the response.');
  }

  const jsonString = cleanedStr.substring(start, end + 1);

  try {
    // Validate JSON structure
    JSON.parse(jsonString);
    return jsonString;
  } catch (parseError) {
    // Try one more approach - find any JSON-like structure
    const jsonRegex = /{[^]*?}/;
    const match = str.match(jsonRegex);
    if (match && match[0]) {
      try {
        JSON.parse(match[0]);
        return match[0];
      } catch (error) {
        throw new Error('Failed to extract valid JSON: ' + parseError.message);
      }
    }
    throw new Error('Extracted string is not valid JSON: ' + parseError.message);
  }
}