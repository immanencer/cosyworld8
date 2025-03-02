const defaultModels = [
  {
    model: 'gemini-1.5-flash',
    type: 'gemini',
    provider: 'google',
    status: 'active',
    rarity: 'common',
    maxTokens: 8192,
    costPerToken: 0.0000035,
    description: 'Fast, cost-effective generative AI for text and vision tasks',
    supportsStructuredOutput: true
  },
  {
    model: 'gemini-1.5-pro',
    type: 'gemini',
    provider: 'google',
    status: 'active',
    rarity: 'uncommon',
    maxTokens: 32000,
    costPerToken: 0.00001,
    description: 'Advanced model for complex reasoning and text generation',
    supportsStructuredOutput: true
  },
  {
    model: 'gemini-2.0-flash-001',
    type: 'gemini',
    provider: 'google',
    status: 'active',
    rarity: 'common', 
    maxTokens: 8192,
    costPerToken: 0.0000035,
    description: 'Fast, cost-effective generative AI for text and vision tasks',
    supportsStructuredOutput: true
  },
  {
    model: 'openai/gpt-3.5-turbo',
    type: 'chat',
    provider: 'openai',
    status: 'active',
    rarity: 'common',
    maxTokens: 4096,
    costPerToken: 0.000001,
    description: 'Standard OpenAI GPT-3.5 Turbo model',
    supportsStructuredOutput: false
  },
];
export default defaultModels;