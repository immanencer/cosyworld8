// ItemTool.mjs
import { BaseTool } from './BaseTool.mjs';
import { ItemService } from '../../item/itemService.mjs';
import { sendAsWebhook } from '../../discordService.mjs';
import Fuse from 'fuse.js';

export class ItemTool extends BaseTool {
  /**
   * Constructs a new ItemTool.
   * @param {Object} dungeonService - The dungeon service (must include a Discord client and optional AI service).
   */
  constructor(dungeonService) {
    super(dungeonService);
    if (!dungeonService.client) {
      throw new Error('Discord client is required for ItemTool');
    }
    this.itemService = new ItemService(
      dungeonService.client,
      dungeonService.aiService,
      dungeonService.db
    );

    this.name = 'item';
    this.description = 'Use an item from your inventory';
    this.emoji = '📦';
  }

  /**
   * Escapes RegExp special characters in a string.
   * @param {string} str - The string to escape.
   * @returns {string} The escaped string.
   */
  escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Matches an item from the avatar's inventory using a combination of exact substring matching
   * and fuzzy searching. Returns the best match along with extra context (the remainder of the text).
   * 
   * @param {Array<Object>} inventory - The avatar's inventory (each item should have a "name" property).
   * @param {string} text - The full command text (or argument) in which to search.
   * @returns {{item: Object|null, extraContext: string}} The matching item and any extra context.
   */
  matchItemFromCommand(inventory, text) {
    if (!inventory || !inventory.length) {
      return { item: null, extraContext: text };
    }
    const lowerText = text.toLowerCase();

    // 1. Exact (substring) matching: Look for items whose name appears exactly.
    let bestMatch = null;
    let bestLength = 0;
    for (const item of inventory) {
      const lowerName = item.name.toLowerCase();
      if (lowerText.includes(lowerName) && lowerName.length > bestLength) {
        bestMatch = item;
        bestLength = lowerName.length;
      }
    }

    // 2. If no exact match is found, use Fuse for fuzzy matching.
    if (!bestMatch) {
      const fuse = new Fuse(inventory, {
        keys: ['name'],
        threshold: 0.4, // Adjust the threshold as needed
      });
      const results = fuse.search(text);
      if (results.length > 0) {
        bestMatch = results[0].item;
      }
    }

    // Extract extra context by removing the matched item's name from the text.
    let extraContext = text;
    if (bestMatch) {
      const pattern = new RegExp(`\\b${this.escapeRegExp(bestMatch.name)}\\b`, 'i');
      extraContext = text.replace(pattern, '').trim();
    }
    return { item: bestMatch, extraContext };
  }

  /**
   * Posts item details (image and description) in the channel using a webhook.
   * @param {string} channelId - The Discord channel ID.
   * @param {Object} item - The item object.
   */
  async postItemDetails(channelId, item) {
    // First post the image (if desired)...
    await sendAsWebhook(
      channelId,
      item.imageUrl,
      item
    );
    // Then post the description and name.
    await sendAsWebhook(
      channelId,
      `**${item.name}**\n\n${item.description}`,
      item
    );
  }

  /**
   * Executes the item command with subcommands: take, drop, use, search, create,
   * and the fallback acquire/create.
   *
   * @param {Object} message - The original Discord message.
   * @param {string[]} params - The command parameters.
   * @param {Object} avatar - The avatar (must have at least { _id, name, inventory, imageUrl }).
   * @returns {Promise<string>} A status or error message.
   */
  async execute(message, params, avatar) {
    if (!message.channel.guild) {
      return 'This command can only be used in a guild!';
    }
    if (!params || params.length < 1) {
      return 'Usage: !item <take|drop|use|search|create> <item name or query>';
    }

    // Ensure the avatar has an inventory array.
    if (!avatar.inventory || !Array.isArray(avatar.inventory)) {
      avatar.inventory = [];
    }

    // The first parameter is interpreted as a subcommand.
    const subcommand = params[0].toLowerCase();
    // All remaining text is joined into one argument.
    const argument = params.slice(1).join(' ').trim();
    // Use the channel ID as the “location” identifier.
    const locationId = message.channel.id;

    try {
      switch (subcommand) {
        case 'take': {
          if (!argument) {
            return 'Specify the name of the item to take.';
          }
          const takenItem = await this.itemService.takeItem(avatar, argument, locationId);
          if (!takenItem) {
            return `No item named "${argument}" was found on the ground.`;
          }
          await this.postItemDetails(message.channel.id, takenItem);
          // Add the item to the avatar's inventory.
          avatar.inventory.push(takenItem);
          return `${avatar.name} has taken the item "${takenItem.name}".`;
        }
        case 'drop': {
          if (!argument) {
            return 'Specify the name of the item to drop.';
          }
          const { item: matchingItem } = this.matchItemFromCommand(avatar.inventory, argument);
          if (!matchingItem) {
            return `${avatar.name} does not possess an item matching that description.`;
          }
          await this.itemService.dropItem(avatar, matchingItem, locationId);
          // Remove the item from the avatar's inventory.
          avatar.inventory = avatar.inventory.filter(
            i => i.name.toLowerCase() !== matchingItem.name.toLowerCase()
          );
          await this.postItemDetails(message.channel.id, matchingItem);
          return `${avatar.name} has dropped the item "${matchingItem.name}".`;
        }
        case 'use': {
          if (!argument) {
            return 'Specify the name of the item to use.';
          }
          const { item: matchingItem, extraContext } = this.matchItemFromCommand(avatar.inventory, argument);
          if (!matchingItem) {
            return `${avatar.name} does not possess any item mentioned in that command.`;
          }
          // Call the AI service so the item “speaks.” Pass along the extra context.
          // (Make sure that your itemService.useItem method is updated to accept extra context if needed.)
          const response = await this.itemService.useItem(
            avatar,
            matchingItem,
            message.channel.id,
            extraContext
          );
          return response;
        }
        case 'search': {
          // For the search command, ignore any arguments and list all unowned items in the location.
          const searchResults = await this.itemService.searchItems(locationId, '');
          if (!searchResults || searchResults.length === 0) {
            return `No items found in this area.`;
          }
          const itemsList = searchResults
            .map(item => `- **${item.name}**: ${item.description}`)
            .join('\n');
          return `Items in this area:\n${itemsList}`;
        }
        case 'create': {
          if (!argument) {
            return 'Specify the name of the item to create.';
          }
          // Explicitly create (or find) the item using the provided name.
          const item = await this.itemService.findOrCreateItem(argument, locationId);
          if (!item) {
            return 'Failed to create the specified item. (The daily creation limit may have been reached.)';
          }
          // If not already in the avatar's inventory, add it.
          const alreadyHasItem = avatar.inventory.some(
            i => i.name.toLowerCase() === item.name.toLowerCase()
          );
          if (!alreadyHasItem) {
            await this.itemService.assignItemToAvatar(avatar._id, item);
            avatar.inventory.push(item);
          }
          await this.postItemDetails(message.channel.id, item);
          return `${avatar.name} has created the item "${item.name}".`;
        }
        default: {
          // Fallback: if no known subcommand is provided, try to acquire/create the item.
          const itemName = params.join(' ');
          const item = await this.itemService.findOrCreateItem(itemName, locationId);
          if (!item) {
            return 'Failed to find or create the specified item. (The daily creation limit may have been reached.)';
          }
          const alreadyHasItem = avatar.inventory.some(
            i => i.name.toLowerCase() === item.name.toLowerCase()
          );
          if (!alreadyHasItem) {
            await this.itemService.assignItemToAvatar(avatar._id, item);
            avatar.inventory.push(item);
          }
          await this.postItemDetails(message.channel.id, item);
          return `${avatar.name} has acquired the item "${item.name}".`;
        }
      }
    } catch (error) {
      console.error('Error in ItemTool execute:', error);
      return `Failed to process item command: ${error.message}`;
    }
  }

  /**
   * Returns a short description of the item tool and its subcommands.
   */
  getDescription() {
    return 'Interact with mystical items in the dungeon: take items from the ground, drop items to leave them behind, use an item to invoke its ancient voice, search for items in your current area, or explicitly create a new item.';
  }

  /**
   * Returns syntax instructions for using the item command.
   */
  getSyntax() {
    return '📦 <take|drop|use|search|create> <item name or query>';
  }
}
