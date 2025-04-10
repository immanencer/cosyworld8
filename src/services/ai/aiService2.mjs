import { GoogleAIService2 } from './googleAIService2.mjs';
// Future: import { OpenRouterAIService2 } from './openrouterAIService2.mjs';
// Future: import { OllamaService2 } from './ollamaService2.mjs';

let AIServiceClass;

switch (process.env.AI_SERVICE) {
  case 'google':
    AIServiceClass = GoogleAIService2;
    break;
  // case 'openrouter':
  //   AIServiceClass = OpenRouterAIService2;
  //   break;
  // case 'ollama':
  //   AIServiceClass = OllamaService2;
  //   break;
  default:
    console.warn('Unknown or unset AI_SERVICE, defaulting to GoogleAIService2');
    AIServiceClass = GoogleAIService2;
}

export { AIServiceClass };
