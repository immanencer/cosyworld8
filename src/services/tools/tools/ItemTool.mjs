// ItemTool.mjs
import { BasicTool } from '../BasicTool.mjs';

export class ItemTool extends BasicTool {
  constructor(services) {
    super(services);
    this.avatarService = services.avatarService;
    this.itemService = services.itemService;
    this.discordService = services.discordService;

    this.name = 'item';
    this.description = 'Manage items: take, drop, use, store, or craft items. Usage: 📦 take <item>, 📦 drop <item>, 📦 use, 📦 store, or 📦 craft <item1> <item2>.';
    this.emoji = '📦';
    this.replyNotification = true;
  }

  async postItemDetails(channelId, item) {
    await this.discordService.sendAsWebhook(channelId, item.imageUrl, item);
    await this.discordService.sendAsWebhook(channelId, `**${item.name}**\n\n${item.description}`, item);
  }

  async execute(message, params, avatar) {
    if (!message.channel.guild) {
      return `-# [${this.emoji} This command can only be used in a guild!]`;
    }
    if (!params || params.length < 1) {
      return `-# [${this.emoji} Usage: !item <use|craft|take|drop|store> [params]]`;
    }

    if (!avatar.inventory || !Array.isArray(avatar.inventory)) {
      avatar.inventory = [];
    }

    const subcommand = params[0].toLowerCase();
    const locationId = message.channel.id;

    try {
      switch (subcommand) {
        case 'use': {
          if (!avatar.selectedItemId) {
            return `-# [${this.emoji} You have no selected item to use.]`;
          }
          const item = avatar.inventory.find(i => i._id === avatar.selectedItemId);
          if (!item) {
            return `-# [${this.emoji} Selected item not found in inventory.]`;
          }
          const extraContext = params.slice(1).join(' ').trim();
          const response = await this.itemService.useItem(avatar, item, message.channel.id, extraContext);
          return response;
        }
        case 'take': {
          const itemName = params.slice(1).join(' ').trim();
          if (!itemName) {
            return `-# [${this.emoji} Specify the name of the item to take.]`;
          }
          if (avatar.selectedItemId && avatar.storedItemId) {
            return `-# [${this.emoji} You can only hold 2 items. Use 'store' or 'drop' to free a slot.]`;
          }
          const item = await this.itemService.takeItem(avatar, itemName, locationId);
          if (!item) {
            return `-# [${this.emoji} No item named "${itemName}" found on the ground.]`;
          }
          avatar.inventory.push(item);
          if (!avatar.selectedItemId) {
            avatar.selectedItemId = item._id;
          } else {
            avatar.storedItemId = item._id;
          }
          await this.avatarService.updateAvatar(avatar);
          await this.postItemDetails(message.channel.id, item);
          return `-# [${this.emoji} You picked up ${item.name}.]`;
        }
        case 'store': {
          if (!avatar.selectedItemId) {
            return `-# [${this.emoji} You have no selected item to store.]`;
          }
          if (avatar.storedItemId) {
            // Swap selected and stored
            const temp = avatar.selectedItemId;
            avatar.selectedItemId = avatar.storedItemId;
            avatar.storedItemId = temp;
            await this.avatarService.updateAvatar(avatar);
            return `-# [${this.emoji} Swapped your held and stored items.]`;
          } else {
            avatar.storedItemId = avatar.selectedItemId;
            avatar.selectedItemId = null;
            await this.avatarService.updateAvatar(avatar);
            return `-# [${this.emoji} Stored your current item. You can now take another.]`;
          }
        }
        case 'drop': {
          const itemName = params.slice(1).join(' ').trim();
          let item = null;
          if (!itemName && avatar.selectedItemId) {
            item = avatar.inventory.find(i => i._id === avatar.selectedItemId);
          } else if (itemName) {
            item = this.findClosestItem(avatar.inventory, itemName);
          }
          if (!item) {
            return `-# [${this.emoji} No item specified or found to drop.]`;
          }
          avatar.inventory = avatar.inventory.filter(i => i._id !== item._id);
          if (avatar.selectedItemId === item._id) avatar.selectedItemId = null;
          if (avatar.storedItemId === item._id) avatar.storedItemId = null;
          await this.avatarService.updateAvatar(avatar);
          await this.itemService.dropItem(avatar, item, locationId);
          return `-# [${this.emoji} You dropped ${item.name}.]`;
        }
        case 'craft': {
          if (params.length < 3) {
            return `-# [${this.emoji} Usage: !item craft <item1> <item2>]`;
          }
          const itemName1 = params[1].trim();
          const itemName2 = params[2].trim();
          const item1 = this.findClosestItem(avatar.inventory, itemName1);
          const item2 = this.findClosestItem(avatar.inventory, itemName2);
          if (!item1 || !item2) {
            return `-# [${this.emoji} You do not have the specified items in your inventory.]`;
          }
          const inputItems = [item1, item2];
          const newItem = await this.itemService.createCraftedItem(inputItems, avatar._id);
          if (!newItem) {
            return `-# [${this.emoji} Cannot craft item: daily item creation limit reached or failed to generate item.]`;
          }
          avatar.inventory.push(newItem);
          const inputItemIds = inputItems.map(i => i._id);
          avatar.inventory = avatar.inventory.filter(i => !inputItemIds.includes(i._id));
          if (inputItemIds.includes(avatar.selectedItemId)) avatar.selectedItemId = null;
          if (inputItemIds.includes(avatar.storedItemId)) avatar.storedItemId = null;
          await this.avatarService.updateAvatar(avatar);
          const db = await this.databaseService.getDatabase();
          await db.collection('items').deleteMany({ _id: { $in: inputItemIds } });
          await this.postItemDetails(message.channel.id, newItem);
          return `-# [${this.emoji} You have crafted a new item: ${newItem.name}]`;
        }
        default:
          return `-# [${this.emoji} Invalid subcommand. Use !item <use|craft|take|drop|store> [params]]`;
      }
    } catch (error) {
      console.error('Error in ItemTool execute:', error);
      return `-# [${this.emoji} Failed to process item command: ${error.message}]`;
    }
  }

  findClosestItem(items, query) {
    if (!items || items.length === 0) return null;
    query = query.toLowerCase();
    let bestMatch = null;
    let bestScore = Infinity;
    for (const item of items) {
      const name = item.name.toLowerCase();
      const dist = this.levenshteinDistance(query, name);
      if (dist < bestScore) {
        bestScore = dist;
        bestMatch = item;
      }
    }
    // Accept only reasonably close matches
    return bestScore <= Math.max(3, query.length / 2) ? bestMatch : null;
  }

  levenshteinDistance(a, b) {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }

  getDescription() {
    return 'Manage items: take, drop, use, store, or craft items. Usage: 📦 take <item>, 📦 drop <item>, 📦 use, 📦 store, or 📦 craft <item1> <item2>.';
  }

  async getSyntax() {
    return '📦 take|use|store|craft|drop <item1> <item2>';
  }
}