
import { SchemaValidator } from '../utils/schemaValidator.mjs';

export class QuestService {
  constructor(db, itemService) {
    this.db = db;
    this.itemService = itemService;
    this.schemaValidator = new SchemaValidator();
    this.CURRENT_SCHEMA_VERSION = '1.0.0';
  }

  async createQuest(questData) {
    const quest = {
      ...questData,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: this.CURRENT_SCHEMA_VERSION
    };

    const validation = this.schemaValidator.validateQuest(quest);
    if (!validation.valid) {
      throw new Error(`Invalid quest schema: ${JSON.stringify(validation.errors)}`);
    }

    const result = await this.db.collection('quests').insertOne(quest);
    return { _id: result.insertedId, ...quest };
  }

  async checkQuestCondition(quest) {
    const { conditions } = quest;
    const itemsCollection = this.db.collection('items');

    switch (conditions.type) {
      case 'ITEM_AT_LOCATION': {
        const item = await itemsCollection.findOne({
          _id: conditions.itemId,
          locationId: conditions.locationId
        });
        return !!item;
      }

      case 'ITEM_OWNED_BY_AVATAR': {
        const item = await itemsCollection.findOne({
          _id: conditions.itemId,
          owner: conditions.avatarId
        });
        return !!item;
      }

      default:
        return false;
    }
  }

  async updateQuestStatus(questId, status) {
    return await this.db.collection('quests').updateOne(
      { _id: questId },
      { 
        $set: { 
          status,
          updatedAt: new Date().toISOString()
        }
      }
    );
  }

  async getActiveQuests() {
    return await this.db.collection('quests')
      .find({ status: 'ACTIVE' })
      .toArray();
  }

  async getQuestsByAvatar(avatarId) {
    return await this.db.collection('quests')
      .find({
        $or: [
          { 'conditions.avatarId': avatarId },
          { 'conditions.type': 'ITEM_AT_LOCATION' }
        ]
      })
      .toArray();
  }
}
