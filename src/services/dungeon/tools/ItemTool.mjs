import { BaseTool } from './BaseTool.mjs';
import { ItemService } from '../../item/itemService.mjs';
import { sendAsWebhook } from '../../discordService.mjs';

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
      dungeonService.aiService
    );
  }

  /**
   * Executes the item command.
   * @param {Object} message - The original Discord message.
   * @param {string[]} params - The command parameters (item name, etc.).
   * @param {Object} avatar - The avatar (must have at least { _id, name, inventory, imageUrl }).
   * @returns {Promise<string>} A status or error message.
   */
  async execute(message, params, avatar) {
    // 1. Ensure the command is used within a guild.
    if (!message.channel.guild) {
      return 'This command can only be used in a guild!';
    }
    if (!params || !params.length) {
      return 'Specify an item name to acquire or examine!';
    }

    // 2. Parse the item name from parameters.
    let itemName = params.join(' ');
    // Optionally strip a leading keyword like "item " if present.
    if (itemName.toLowerCase().startsWith('item ')) {
      itemName = itemName.slice(5);
    }

    try {
      // 3. Find or create the item using the ItemService.
      const item = await this.itemService.findOrCreateItem(itemName);
      if (!item) {
        return 'Failed to find or create the specified item.';
      }

      // 4. Add the item to the avatar’s inventory if not already present.
      if (!avatar.inventory || !Array.isArray(avatar.inventory)) {
        avatar.inventory = [];
      }
      const alreadyHasItem = avatar.inventory.some(
        (i) => i.name.toLowerCase() === item.name.toLowerCase()
      );
      if (!alreadyHasItem) {
        await this.itemService.assignItemToAvatar(avatar._id, item);
        avatar.inventory.push(item);
      }

      // 5. Send an in-character message (via webhook) displaying the item details.
      const itemDisplayMessage = `**${item.name}**\n${item.description}`;
      await sendAsWebhook(
        message.channel.id,
        itemDisplayMessage,
        item.name,
        item.imageUrl
      );

      // 6. Return a success message.
      return `${avatar.name} has acquired the item "${item.name}".`;
    } catch (error) {
      console.error('Error in ItemTool execute:', error);
      return `Failed to process item command: ${error.message}`;
    }
  }

  /**
   * Returns a short description of what this tool does.
   */
  getDescription() {
    return 'Acquire or examine a mystical item.';
  }

  /**
   * Returns syntax instructions for using the item command.
   */
  getSyntax() {
    return '!item <item name>';
  }
}
