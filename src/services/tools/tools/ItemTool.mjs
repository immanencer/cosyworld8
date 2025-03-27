// ItemTool.mjs
import { BasicTool } from '../BasicTool.mjs';

export class ItemTool extends BasicTool {
  constructor(services) {
    super(services);
    this.avatarService = services.avatarService;
    this.itemService = services.itemService;

    this.name = 'item';
    this.description = 'Manage items in your inventory';
    this.emoji = '📦';
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
      return `-# [${this.emoji} Usage: !item <select|take|drop|use> [params]]`;
    }

    // Ensure inventory exists
    if (!avatar.inventory || !Array.isArray(avatar.inventory)) {
      avatar.inventory = [];
    }

    const subcommand = params[0].toLowerCase();
    const locationId = message.channel.id;

    try {
      switch (subcommand) {
        case 'select': {
          if (avatar.inventory.length === 0) {
            return `-# [${this.emoji} Your inventory is empty. No item to select.]`;
          }
          const sortedInventory = avatar.inventory.slice().sort((a, b) => a.name.localeCompare(b.name));
          let selectedItem;
          if (!avatar.selectedItemId || !avatar.inventory.some(i => i._id === avatar.selectedItemId)) {
            selectedItem = sortedInventory[0];
          } else {
            const currentIndex = sortedInventory.findIndex(i => i._id === avatar.selectedItemId);
            const nextIndex = (currentIndex + 1) % sortedInventory.length;
            selectedItem = sortedInventory[nextIndex];
          }
          avatar.selectedItemId = selectedItem._id;
          await this.avatarService.updateAvatar(avatar);
          return `-# [${this.emoji} Selected item: ${selectedItem.name}]`;
        }
        case 'take': {
          const itemName = params.slice(1).join(' ').trim();
          if (!itemName) {
            return `-# [${this.emoji} Specify the name of the item to take.]`;
          }
          const takenItem = await this.itemService.takeItem(avatar, itemName, locationId);
          if (!takenItem) {
            return `-# [${this.emoji} No item named "${itemName}" was found on the ground.]`;
          }
          await this.postItemDetails(message.channel.id, takenItem);
          avatar.inventory.push(takenItem);
          await this.avatarService.updateAvatar(avatar);
          return `-# [${this.emoji} ${avatar.name} has taken the item "${takenItem.name}."]`;
        }
        case 'drop': {
          if (!avatar.selectedItemId) {
            return `-# [${this.emoji} No item selected to drop.]`;
          }
          const selectedItem = avatar.inventory.find(i => i._id === avatar.selectedItemId);
          if (!selectedItem) {
            return `-# [${this.emoji} Selected item not found in inventory.]`;
          }
          await this.itemService.dropItem(avatar, selectedItem, locationId);
          avatar.inventory = avatar.inventory.filter(i => i._id !== selectedItem._id);
          avatar.selectedItemId = null;
          await this.avatarService.updateAvatar(avatar);
          await this.postItemDetails(message.channel.id, selectedItem);
          return `-# [${this.emoji} ${avatar.name} has dropped the item "${selectedItem.name}."]`;
        }
        case 'use': {
          if (!avatar.selectedItemId) {
            return `-# [${this.emoji} No item selected to use.]`;
          }
          const selectedItem = avatar.inventory.find(i => i._id === avatar.selectedItemId);
          if (!selectedItem) {
            return `-# [${this.emoji} Selected item not found in inventory.]`;
          }
          const extraContext = params.slice(1).join(' ').trim();
          const response = await this.itemService.useItem(
            avatar,
            selectedItem,
            message.channel.id,
            extraContext
          );
          return response;
        }
        default: {
          return `-# [${this.emoji} Invalid subcommand. Use !item <select|take|drop|use> [params]]`;
        }
      }
    } catch (error) {
      console.error('Error in ItemTool execute:', error);
      return `-# [${this.emoji} Failed to process item command: ${error.message}]`;
    }
  }

  getDescription() {
    return 'Manage items: select an item from your inventory, take items from the ground, drop the selected item, or use the selected item.';
  }

  getSyntax() {
    return '📦 select|take|drop|use';
  }
}