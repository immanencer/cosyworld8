// ItemTool.mjs
import { BasicTool } from '../BasicTool.mjs';

export class ItemTool extends BasicTool {
  constructor(services) {
    super(services);
    this.avatarService = services.avatarService;
    this.itemService = services.itemService;

    this.name = 'item';
    this.description = 'Manage items: use or craft items. Usage: !item use <item>, or !item craft <item1> <item2>.';
    this.emoji = '📦';
    this.replyNotification = true;
  }

  async postItemDetails(channelId, item) {
    await this.services.discordService.sendAsWebhook(channelId, item.imageUrl, item);
    await this.services.discordService.sendAsWebhook(channelId, `**${item.name}**\n\n${item.description}`, item);
  }

  async execute(message, params, avatar) {
    if (!message.channel.guild) {
      return `-# [${this.emoji} This command can only be used in a guild!]`;
    }
    if (!params || params.length < 1) {
      return `-# [${this.emoji} Usage: !item <use|craft|take|drop> [params]]`;
    }

    if (!avatar.inventory || !Array.isArray(avatar.inventory)) {
      avatar.inventory = [];
    }

    const subcommand = params[0].toLowerCase();
    const locationId = message.channel.id;

    try {
      switch (subcommand) {
        case 'use':
        case 'take': {
          const itemName = params.slice(1).join(' ').trim();
          if (!itemName) {
            return `-# [${this.emoji} Specify the name of the item to use or take.]`;
          }

          // Fuzzy match in inventory
          let item = this.findClosestItem(avatar.inventory, itemName);

          if (!item) {
            // If not found in inventory, try to take from ground
            item = await this.itemService.takeClosestItem(avatar, itemName, locationId);
            if (!item) {
              return `-# [${this.emoji} No item similar to "${itemName}" found in inventory or on the ground.]`;
            }
            avatar.inventory.push(item);
            await this.avatarService.updateAvatar(avatar);
            await this.postItemDetails(message.channel.id, item);
          }

          // Use the item
          const extraContext = params.slice(2).join(' ').trim();
          const response = await this.itemService.useItem(
            avatar,
            item,
            message.channel.id,
            extraContext
          );
          return response;
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
          // Remove both source items from inventory
          avatar.inventory = avatar.inventory.filter(i => !inputItemIds.includes(i._id));
          await this.avatarService.updateAvatar(avatar);
          await this.services.db.collection('items').deleteMany({ _id: { $in: inputItemIds } });
          await this.postItemDetails(message.channel.id, newItem);
          return `-# [${this.emoji} You have crafted a new item: ${newItem.name}]`;
        }
        case 'drop': {
          const itemName = params.slice(1).join(' ').trim();
          if (!itemName) {
            return `-# [${this.emoji} Specify the name of the item to drop.]`;
          }
          const item = this.findClosestItem(avatar.inventory, itemName);
          if (!item) {
            return `-# [${this.emoji} No item similar to "${itemName}" found in your inventory.]`;
          }
          // Remove from inventory
          avatar.inventory = avatar.inventory.filter(i => i._id !== item._id);
          await this.avatarService.updateAvatar(avatar);
          // Place item on ground/location
          await this.itemService.dropItemAtLocation(item, locationId);
          return `-# [${this.emoji} You dropped ${item.name}.]`;
        }
        default:
          return `-# [${this.emoji} Invalid subcommand. Use !item <use|craft|take|drop> [params]]`;
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
    return 'Manage items: take, drop, use, or craft items. Usage: 📦 take <item>, 📦 drop <item>, 📦 use <item>, or 📦 craft <item1> <item2>.';
  }

  async getSyntax() {
    return '📦 take|use|craft|drop <item1> <item2>';
  }
}