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
      return `-# [${this.emoji} Usage: !item <select|take|drop|use|craft> [params]]`;
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
          // Existing select logic remains unchanged
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
          // Existing take logic remains unchanged
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
          // Existing drop logic remains unchanged
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
          // Existing use logic remains unchanged
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
        case 'craft': {
          // Check for at least two item names after 'craft'
          if (params.length < 3) {
            return `-# [${this.emoji} Usage: !item craft <item1> <item2>]`;
          }

          // Get the names of the items to craft
          const itemName1 = params[1].trim();
          const itemName2 = params[2].trim();

          // Find the items in the avatar's inventory (case-insensitive)
          const item1 = avatar.inventory.find(i => i.name.toLowerCase() === itemName1.toLowerCase());
          const item2 = avatar.inventory.find(i => i.name.toLowerCase() === itemName2.toLowerCase());

          // Ensure both items exist
          if (!item1 || !item2) {
            return `-# [${this.emoji} You do not have the specified items in your inventory.]`;
          }

          // Collect input items
          const inputItems = [item1, item2];

          // Create the new crafted item
          const newItem = await this.itemService.createCraftedItem(inputItems, avatar._id);
          if (!newItem) {
            return `-# [${this.emoji} Cannot craft item: daily item creation limit reached or failed to generate item.]`;
          }

          // Add the new item to the inventory
          avatar.inventory.push(newItem);

          // Remove the input items from the inventory
          const inputItemIds = inputItems.map(i => i._id);
          avatar.inventory = avatar.inventory.filter(i => !inputItemIds.includes(i._id));

          // Save the updated avatar
          await this.avatarService.updateAvatar(avatar);

          // Delete the consumed input items from the items collection
          await this.services.db.collection('items').deleteMany({ _id: { $in: inputItemIds } });

          // Display the new item's details
          await this.postItemDetails(message.channel.id, newItem);

          // Return success message
          return `-# [${this.emoji} You have crafted a new item: ${newItem.name}]`;
        }
        default: {
          return `-# [${this.emoji} Invalid subcommand. Use !item <select|take|drop|use|craft> [params]]`;
        }
      }
    } catch (error) {
      console.error('Error in ItemTool execute:', error);
      return `-# [${this.emoji} Failed to process item command: ${error.message}]`;
    }
  }

  getDescription() {
    return 'Manage items: select an item from your inventory, take items from the ground, drop the selected item, use the selected item, or craft a new item from two existing items.';
  }

  async getSyntax() {
    return '📦 select|take|drop|use|craft';
  }
}