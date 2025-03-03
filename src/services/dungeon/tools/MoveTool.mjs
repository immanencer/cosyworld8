import { BaseTool } from './BaseTool.mjs';
import { sendAsWebhook, sendAvatarProfileEmbedFromObject } from '../../../services/discordService.mjs';

export class MoveTool extends BaseTool {
  /**
   * Constructs a new MoveTool.
   * @param {Object} dungeonService - The dungeon service (must include a Discord client).
   */
  constructor(dungeonService) {
    super(dungeonService);
    if (!dungeonService.client) {
      throw new Error('Discord client is required for MoveTool');
    }
    this.locationService = dungeonService.locationService;
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
      return 'You need to specify a destination!';
    }

    try {
      // 1. Get current location from the dungeonService
      const currentLocation = await this.dungeonService.getAvatarLocation(avatar._id);
      const currentLocationId = currentLocation?.channel?.id;

      // 2. Find or create the new location
      const newLocation = await this.locationService.findOrCreateLocation(
        message.channel.guild,
        destination,
        message.channel
      );
      if (!newLocation) {
        return 'Failed to find or create that location!';
      }

      // 3. If the avatar is already in that location, bail early
      if (currentLocationId === newLocation.channel.id) {
        return "You're already there!";
      }

      // 4. Generate a departure message for display to the user
      let userFacingDepartureMessage = '';
      if (currentLocation?.channel) {
        try {
          userFacingDepartureMessage = await this.locationService.generateDepartureMessage(
            avatar,
            currentLocation,
            newLocation
          );
        } catch (error) {
          console.error('Error generating departure message:', error);
          userFacingDepartureMessage = `${avatar.name} sets off to ${newLocation.name}...`;
        }
      }

      // 5. Update the avatar's position in the database
      // Let the DungeonService handle profile sending
      const updatedAvatar = await this.dungeonService.updateAvatarPosition(
        avatar._id, 
        newLocation.channel.id,
        currentLocationId,
        true // Send profile as part of position update
      );

      if (!updatedAvatar) {
        return `Failed to move: Avatar location update failed.`
      }

      // Profile is now sent by DungeonService.updateAvatarPosition

      // 7. Generate an arrival message
      try {
        const arrivalMessage = await this.locationService.generateAvatarResponse(updatedAvatar, newLocation);
        // Post to the new location channel via webhook
        await sendAsWebhook(
          newLocation.channel.id,
          arrivalMessage,
          updatedAvatar
        );
      } catch (error) {
        console.error('Error sending arrival message:', error);
        // We still consider the move successful, even if arrival message fails
      }

      // 8. Return success message with atmospheric departure text for user feedback
      return userFacingDepartureMessage || `${avatar.name} moved to ${newLocation.channel.name}!`;
    } catch (error) {
      console.error('Error in MoveTool execute:', error);
      return `Failed to move: ${error.message}`;
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
  getSyntax() {
    return '!move <location>';
  }
}