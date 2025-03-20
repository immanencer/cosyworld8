import { BaseTool } from './BaseTool.mjs';
import { sendAsWebhook, sendAvatarProfileEmbedFromObject } from '../../../services/discordService.mjs';
import { EmbedBuilder } from 'discord.js';

export class MoveTool extends BaseTool {
  /**
   * Constructs a new MoveTool.
   * @param {Object} dungeonService - The dungeon service (must include a Discord client).
   */
  constructor() {
    super();
    if (!dungeonService.client) {
      throw new Error('Discord client is required for MoveTool');
    }
    this.locationService = dungeonService.locationService;
    this.name = 'move';
    this.description = 'Move to the location specified, creating it if it does not exist.';
    this.emoji = '🏃‍♂️';
  }

  /**
   * Sends a mini avatar card to the specified channel
   * @param {Object} avatar - The avatar object
   * @param {string} channelId - The channel ID to send the mini card to
   * @param {string} message - Optional message to include with the mini card
   * @returns {Promise<void>}
   */
  async sendMiniAvatarCard(avatar, channelId, message = '') {
    try {
      const channel = await this.dungeonService.client.channels.fetch(channelId);
      if (!channel) return;

      const embed = new EmbedBuilder()
        .setColor('#3498db') // Blue color for movement
        .setAuthor({
          name: avatar.name,
          iconURL: avatar.imageUrl
        })
        .setThumbnail(avatar.imageUrl)
        .setDescription(message || `${avatar.name} is on the move!`);

      // Send the mini card via webhook
      const webhook = await this.getOrCreateWebhook(channel);
      if (webhook) {
        await webhook.send({
          embeds: [embed],
          username: avatar.name,
          avatarURL: avatar.imageUrl
        });
      } else {
        // Fallback to regular channel send if webhook fails
        await channel.send({ embeds: [embed] });
      }
    } catch (error) {
      this.logger.error(`Error sending mini avatar card: ${error.message}`);
    }
  }

  /**
   * Gets or creates a webhook for a channel
   * @param {Object} channel - The Discord channel
   * @returns {Promise<Object|null>} - Webhook object or null
   */
  async getOrCreateWebhook(channel) {
    try {
      const webhooks = await channel.fetchWebhooks();
      let webhook = webhooks.find(wh => wh.owner.id === this.dungeonService.client.user.id);

      if (!webhook) {
        webhook = await channel.createWebhook({
          name: 'Movement Webhook',
          avatar: this.dungeonService.client.user.displayAvatarURL()
        });
      }

      return webhook;
    } catch (error) {
      this.logger.error(`Error getting/creating webhook: ${error.message}`);
      return null;
    }
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
      const currentLocationId = currentLocation?.channel?.id || avatar.channelId;

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
      // Don't send profile yet - we'll do it separately below
      const updatedAvatar = await this.dungeonService.updateAvatarPosition(
        avatar._id, 
        newLocation.channel.id,
        currentLocationId,
        false // Don't send profile in updateAvatarPosition, we'll do it here
      );

      if (!updatedAvatar) {
        return `Failed to move: Avatar location update failed.`
      }

      // 6. Send a mini card to the departure channel if we have one
      if (currentLocationId) {
        try {
          const departureMessage = `${avatar.name} has departed to <#${newLocation.channel.id}>`;
          await this.sendMiniAvatarCard(avatar, currentLocationId, departureMessage);
          this.logger.debug(`Sent mini card for ${avatar.name} to departure location ${currentLocationId}`);
        } catch (miniCardError) {
          this.logger.error(`Error sending mini card: ${miniCardError.message}`);
        }
      }

      // 7. Send the full profile to the new location
      try {
        const { sendAvatarProfileEmbedFromObject } = await import('../../../services/discordService.mjs');
        await sendAvatarProfileEmbedFromObject(updatedAvatar, newLocation.channel.id);
        this.logger.debug(`Sent profile for ${updatedAvatar.name} to new location ${newLocation.channel.id}`);
      } catch (profileError) {
        this.logger.error(`Error sending profile after movement: ${profileError.message}`);
        // Continue even if profile send fails
      }

      // 8. Generate an arrival message
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

      // 9. Return success message with atmospheric departure text for user feedback
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