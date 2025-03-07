
import { GoogleAIService as AIService } from '../googleAIService.mjs';

export class QuestGeneratorService {
  constructor(db, itemService, aiService = null) {
    this.db = db;
    this.itemService = itemService;
    this.aiService = aiService || new AIService();
  }

  async generateQuest() {
    const prompt = `Generate a quest for a fantasy RPG with the following format. Only respond with valid JSON:
    {
      "title": "<short quest title>",
      "description": "<2-3 sentence quest description>",
      "conditions": {
        "type": "<either ITEM_AT_LOCATION or ITEM_OWNED_BY_AVATAR>",
        "itemId": "<will be filled in later>",
        "locationId": "<will be filled in later>"
      }
    }`;

    const response = await this.aiService.chat([
      { role: 'system', content: 'You are a creative quest designer.' },
      { role: 'user', content: prompt }
    ]);

    try {
      const questTemplate = JSON.parse(response);
      
      // Create a new item for the quest
      const item = await this.itemService.findOrCreateItem(questTemplate.title + " Quest Item", questTemplate.conditions.locationId);
      
      if (!item) {
        throw new Error('Failed to create quest item');
      }

      // Fill in the generated quest with real IDs
      const quest = {
        ...questTemplate,
        conditions: {
          ...questTemplate.conditions,
          itemId: item._id.toString()
        }
      };

      return quest;
    } catch (error) {
      console.error('Failed to generate quest:', error);
      return null;
    }
  }

  async assignQuestToAvatar(quest, avatarId) {
    if (quest.conditions.type === 'ITEM_OWNED_BY_AVATAR') {
      quest.conditions.avatarId = avatarId;
    }
    
    const questService = new QuestService(this.db, this.itemService);
    return await questService.createQuest(quest);
  }

  async generateDailyQuest(avatarId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if a quest was already generated today
    const existingQuest = await this.db.collection('quests').findOne({
      'conditions.avatarId': avatarId,
      createdAt: { $gte: today.toISOString() }
    });

    if (existingQuest) {
      return existingQuest;
    }

    const quest = await this.generateQuest();
    if (quest) {
      return await this.assignQuestToAvatar(quest, avatarId);
    }

    return null;
  }
}
