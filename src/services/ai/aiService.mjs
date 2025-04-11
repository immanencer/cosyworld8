// aiService.mjs
import { GoogleAIService } from "./googleAIService.mjs";
import { OpenRouterAIService } from "./openrouterAIService.mjs";
import { OllamaService } from "./ollamaService.mjs";

let AIServiceClass = OpenRouterAIService;

switch (process.env.AI_SERVICE) {
    case 'google':
        AIServiceClass = GoogleAIService;
        break;
    case 'ollama':
        AIServiceClass = OllamaService;
        break;
    case 'openrouter':
        AIServiceClass = OpenRouterAIService;
        break;
    default:
        console.warn(`Unknown AI_SERVICE: ${process.env.AI_SERVICE}. Defaulting to OpenRouterAIService.`);
        AIServiceClass = OpenRouterAIService;
        break;
}

export { AIServiceClass };