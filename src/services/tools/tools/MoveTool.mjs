import { BasicTool } from '../BasicTool.mjs';
import { buildMiniAvatarEmbed } from '../../social/discordEmbedLibrary.mjs';
export class MoveTool extends BasicTool {
  /**
   * Constructs a new MoveTool.
   * @param {Object} services - The services container
   */
  constructor(services) {
    super(services);

    this.avatarService = services.avatarService;
    this.mapService = services.mapService;
    this.locationService = services.locationService;
    this.discordService = services.discordService;
    this.conversationManager = services.conversationManager;
    
    
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
    
    
    // Get the destination
    const destination = params.join(' ');
    if (!destination) {
      return '-# 🏃‍♂️ [ You need to specify a destination! ]';
    }

    try {
      // 1. Get current location from the toolService
      const currentLocation = await this.mapService.getAvatarLocation(avatar._id);
      const currentLocationId = currentLocation?.channel?.id || avatar.channelId;

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

      // 5. Update the avatar's position in the database
      // Don't send profile yet - we'll do it separately below
      const updatedAvatar = await this.mapService.updateAvatarPosition(
        avatar,
        newLocation.channel.id,
        currentLocationId,
     );

      if (!updatedAvatar) {
        return `-# 🏃‍♂️ [ Failed to move: Avatar location update failed.`
      }

      // Ensure avatar's position is updated in the mapService
      await this.mapService.updateAvatarPosition(updatedAvatar, newLocation.channel.id, currentLocationId);

      // 6. Send a mini card to the departure channel if we have one
      if (currentLocationId) {
        try {
          const departureMessage = `${avatar.name} has departed to <#${newLocation.channel.id}>`;
          await this.discordService.sendMiniAvatarEmbed(avatar, currentLocationId, departureMessage);
          this.logger?.debug?.(`Sent mini card for ${avatar.name} to departure location ${currentLocationId}`);
        } catch (miniCardError) {
          this.logger?.error?.(`Error sending mini card: ${miniCardError.message}`);
        }
      }

      // 7. Instead of sending full profile embed to new location, send mini embed only
      try {
        const arrivalMessage = `${avatar.name} has arrived.`;
        await this.discordService.sendMiniAvatarEmbed(updatedAvatar, newLocation.channel.id, arrivalMessage);
        this.logger?.debug?.(`Sent mini arrival card for ${updatedAvatar.name} to ${newLocation.channel.id}`);
      } catch (miniCardError) {
        this.logger?.error?.(`Error sending arrival mini card: ${miniCardError.message}`);
      }

      // 8. Trigger conversation response immediately after arrival
      try {
        await this.conversationManager.sendResponse(newLocation.channel.id, updatedAvatar);
      } catch (error) {
        console.error('Error sending arrival message:', error);
      }

      // 9. Return success message
      return `-# 🏃‍♂️ [ ${avatar.name} moved to ${newLocation.channel.name}! ]`;
    } catch (error) {
      console.error('Error in MoveTool execute:', error);
      return `-# [Failed to move: ${error.message}]`;
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