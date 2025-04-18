import { BasicTool } from '../BasicTool.mjs';
import { buildMiniAvatarEmbed } from '../../social/discordEmbedLibrary.mjs';
export class MoveTool extends BasicTool {
  /**
   * List of services required by this tool.
   * @type {string[]}
   */
  static requiredServices = [
    'avatarService',
    'mapService',
    'locationService',
    'discordService',
    'conversationManager',
  ];
  /**
   * Constructs a new MoveTool.
   * @param {Object} services - The services container
   */
  constructor() {
    super();
    
    this.name = 'move';
    this.description = 'Move to the location specified, creating it if it does not exist.';
    this.emoji = '🏃‍♂️';
  }

  /**
   * Executes the move command.
   * @param {Object} message - The original Discord message.
   * @param {string[]} params - The command parameters (location name, etc.).
   * @param {Object} avatar - The avatar (must have at least { name, imageUrl, _id, channelId }).
   * @returns {Promise<string>} A status or error message.
   */
  async execute(message, params, avatar) {
    const destination = params.join(' ');
    if (!destination) {
      return '-# [ ❌ Error: You need to specify a destination! ]';
    }

    try {
      // 1. Get current location from the toolService
      const currentLocation = await this.mapService.getAvatarLocation(avatar);
      const currentLocationId = currentLocation?.location?.channelId || avatar.channelId;

      // 2. Find or create the new location
      const newLocation = await this.locationService.findOrCreateLocation(
        message.channel.guild,
        destination,
        message.channel
      );
      if (!newLocation) {
        return '-# 🏃‍♂️ [ Failed to find or create that location!';
      }

      // 3. If the avatar is already in that location, bail early
      if (currentLocationId === newLocation.channel.id) {
        return "-# 🏃‍♂️ [ You're already there!";
      }

      // 4. Update the avatar's position in the database (only once)
      const updatedAvatar = await this.mapService.updateAvatarPosition(
        avatar,
        newLocation.channel.id,
        currentLocationId
      );

      if (!updatedAvatar) {
        return `-# 🏃‍♂️ [ Failed to move: Avatar location update failed.`
      }

      // 5. Send a mini card to the departure channel if we have one
      if (currentLocationId) {
        try {
          const departureMessage = `${avatar.name} has departed to <#${newLocation.channel.id}>`;
          await this.discordService.sendMiniAvatarEmbed(avatar, currentLocationId, departureMessage);
          this.logger?.debug?.(`Sent mini card for ${avatar.name} to departure location ${currentLocationId}`);
        } catch (miniCardError) {
          this.logger?.error?.(`Error sending mini card: ${miniCardError.message}`);
        }
      }

      // 6. Instead of sending full profile embed to new location, send mini embed only
      try {
        const arrivalMessage = `${avatar.name} has arrived.`;
        await this.discordService.sendMiniAvatarEmbed(updatedAvatar, newLocation.channel.id, arrivalMessage);
        this.logger?.debug?.(`Sent mini arrival card for ${updatedAvatar.name} to ${newLocation.channel.id}`);
      } catch (miniCardError) {
        this.logger?.error?.(`Error sending arrival mini card: ${miniCardError.message}`);
      }

      // 7. Trigger conversation response immediately after arrival
      try {
        await this.conversationManager.sendResponse(newLocation.channel.id, updatedAvatar);
      } catch (error) {
        console.error('Error sending arrival message:', error);
      }

      // 8. Return success message
      return `-# 🏃‍♂️ [ ${avatar.name} moved to ${newLocation.channel.name}! ]`;
    } catch (error) {
      this.logger?.error('Error in MoveTool execute:', error);
      return `-# [ ❌ Error: Failed to move: ${error.message} ]`;
    }
  }

  /**
   * Short description of what the tool does.
   */
  getDescription() {
    return 'Move to a different area.';
  }

  /**
   * Syntax instruction for help or usage references.
   */
  async getSyntax() {
    return `${this.emoji} <location>`;
  }
}