import { BaseTool } from './BaseTool.mjs';
import { LocationService } from '../../location/locationService.mjs';
import { sendAsWebhook } from '../../discordService.mjs';

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
  }

  /**
   * Executes the move command.
   * @param {Object} message - The original Discord message.
   * @param {string[]} params - The command parameters (location name, etc.).
   * @param {Object} avatar - The avatar (must have at least { name, imageUrl, _id, channelId }).
   * @returns {Promise<string>} A status or error message.
   */
  async execute(message, params, avatar) {
    // 1. Basic checks
    if (!message.channel.guild) {
      return 'This command can only be used in a guild!';
    }
    if (!params || !params.length) {
      return 'Move where? Specify a destination!';
    }

    // 2. Parse the destination name
    let destination = params.join(' ');
    // If starts with "to ", strip it out
    if (destination.toLowerCase().startsWith('to ')) {
      destination = destination.slice(3);
    }

    try {
      // 3. Get current location from the dungeonService
      const currentLocation = await this.dungeonService.getAvatarLocation(avatar._id);

      // 4. Find or create the new location
      const newLocation = await this.locationService.findOrCreateLocation(
        message.channel.guild,
        destination,
        message.channel
      );
      if (!newLocation) {
        return 'Failed to find or create that location!';
      }

      // 5. If the avatar is already in that location, bail early
      if (currentLocation?.channel?.id === newLocation.channel.id) {
        return "You're already there!";
      }

      // 6. Send a departure message from the old location if exists
      if (currentLocation?.channel) {
        try {
          const departureMessage = await this.locationService.generateDepartureMessage(
            avatar,
            currentLocation,
            newLocation
          );
          // Return the departure text so the user sees the atmospheric message
          return departureMessage;
        } catch (error) {
          console.error('Error generating departure message:', error);
          // Continue on; we can still move even if departure message fails
        }
      }

      // 7. Update the avatar's position in the new location
      await this.dungeonService.updateAvatarPosition(avatar._id, newLocation.channel.id);

      // 8. Generate an arrival message
      try {
        const arrivalMessage = await this.locationService.generateAvatarResponse(avatar, newLocation);
        // Post to the new location channel via webhook
        await sendAsWebhook(
          newLocation.channel.id,
          arrivalMessage,
          avatar
        );

        // 9. Update the avatar object in the database
        avatar.channelId = newLocation.channel.id;
        await this.dungeonService.avatarService.updateAvatar(avatar);
      } catch (error) {
        console.error('Error sending arrival message:', error);
        // We still consider the move successful, even if arrival message fails
      }

      // 10. Return success message
      return `${avatar.name} moved to ${newLocation.channel.name}!`;
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
