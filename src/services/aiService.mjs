// aiService.mjs

import { GoogleAIService } from "./googleAIService.mjs";
import { OpenRouterAIService } from "./openrouterAIService.mjs";
import { OllamaService } from "./ollamaService.mjs";

let AIService;

switch (process.env.AI_SERVICE) {
    case 'google':
        AIService = GoogleAIService;
        break;
    case 'ollama':
        AIService = OllamaService;
        break;
    case 'openrouter':
        AIService = OpenRouterAIService;
        break;
    default:
        console.warn(`Unknown AI_SERVICE: ${process.env.AI_SERVICE}. Defaulting to OpenRouterAIService.`);
        AIService = OpenRouterAIService;
        break;
}

export { AIService };