import { BasicService } from '../basicService.mjs';
import { AIService } from "../aiService.mjs";
import { ActionLog } from './ActionLog.mjs';
import { AttackTool } from './tools/AttackTool.mjs';
import { DefendTool } from './tools/DefendTool.mjs';
import { MoveTool } from './tools/MoveTool.mjs';
import { RememberTool } from './tools/RememberTool.mjs';
import { CreationTool } from './tools/CreationTool.mjs';
import { XSocialTool as XPostTool } from './tools/XSocialTool.mjs';
import { ItemTool } from './tools/ItemTool.mjs';
import { ThinkTool } from './tools/ThinkTool.mjs';
import { SummonTool } from './tools/SummonTool.mjs';
import { BreedTool } from './tools/BreedTool.mjs';

export class ToolService extends BasicService {
  /**
   * Constructs a new ToolService instance for managing tools and actions.
   * @param {Object} client - The Discord client instance.
   * @param {Object} logger - Logging interface.
   * @param {Object} avatarService - Service for avatar operations.
   * @param {import('mongodb').Db} db - MongoDB database connection.
   * @param {Object} services - Additional services (e.g., mapService, itemService).
   */
  constructor(services) {
    super(services, [
      'locationService',
      'avatarService',
      'itemService',
      'discordService',
      'databaseService',
      'configService',
      'mapService',
    ]);
    this.client = this.discordService.client;
    this.db = this.databaseService.getDatabase();
    
    // Tools & Logging
    this.ActionLog = new ActionLog(services.logger);
    this.tools = new Map();
    this.toolEmojis = new Map();

    // Initialize tools
    const toolClasses = {
      summon: SummonTool,
      breed: BreedTool,
      attack: AttackTool,
      defend: DefendTool,
      move: MoveTool,
      remember: RememberTool,
      create: CreationTool,
      xpost: XPostTool,
      item: ItemTool,
      respond: ThinkTool,
    };

    Object.entries(toolClasses).forEach(([name, ToolClass]) => {
      const tool = new ToolClass(this.services);
      this.tools.set(name, tool);
      if (tool.emoji) this.toolEmojis.set(tool.emoji, name);
    });

    // Load emoji mappings from config
    const configEmojis = this.configService.get('toolEmojis') || {};
    Object.entries(configEmojis).forEach(([emoji, toolName]) => {
      this.toolEmojis.set(emoji, toolName);
    });

    this.creationTool = new CreationTool(this.services);

    // Event listener for avatar movements
    this.client.on('avatarMoved', ({ avatarId, newChannelId, temporary }) => {
      this.logger.debug(`Avatar ${avatarId} moved to ${newChannelId}${temporary ? ' (temporary)' : ''}`);
    });
  }

  // --- Utility Methods ---

  ensureDb() {
    if (!this.db) throw new Error('Database connection unavailable');
    return this.db;
  }

  extractToolCommands(text) {
    // Handle empty or null input
    if (!text) return { commands: [], cleanText: '', commandLines: [] };
  
    // Get the list of tool emojis from the map
    const emojis = Array.from(this.toolEmojis.keys());
    // Create a regex pattern to match any tool emoji, capturing it in the split
    const pattern = new RegExp(`(${emojis.join('|')})`, 'g');
    
    const commands = [];
    // Split the text into lines
    const lines = text.split('\n');
  
    // Process each line
    for (const line of lines) {
      // Split the line by tool emojis, keeping the emojis in the result
      const parts = line.split(pattern);
      // Iterate over the parts array, stepping by 2 since emojis are at odd indices
      for (let i = 1; i < parts.length; i += 2) {
        const emoji = parts[i];
        // Verify the emoji is in toolEmojis and there is text following it
        if (this.toolEmojis.has(emoji) && i + 1 < parts.length) {
          // Extract and trim the text following the emoji
          const rest = parts[i + 1].trim();
          // Split the remaining text into parameters by whitespace
          const params = rest ? rest.split(/\s+/) : [];
          // Get the tool name associated with the emoji
          const toolName = this.toolEmojis.get(emoji);
          // Add the command object to the list
          commands.push({ command: toolName, emoji, params });
        }
      }
    }
  
    // Return the array of extracted commands
    return commands;
  }

  // --- Command Processing ---

  async getCommandsDescription(guildId) {
    const commands = [];
    for (const [name, tool] of this.tools.entries()) {
      const syntax = (await tool.getSyntax(guildId)) || `${tool.emoji || name}`;
      const description = tool.getDescription() || 'No description available.';
      commands.push(`**${name}**\nTrigger: ${tool.emoji || 'N/A'}\nSyntax: ${syntax}\n${description}`);
    }
    return commands.join('\n\n');
  }

  async processAction(message, command, params, avatar) {
    this.logger.info(`Processing command '${command}' by ${avatar.name} (ID: ${avatar._id})`);
    const tool = this.tools.get(command);
    const target = params[0];

    if (!tool) {
      this.logger.debug(`Unknown command '${command}', using CreationTool`);
      try {
        const result = await this.creationTool.execute(message, params, avatar, this.services);
        await this.ActionLog.logAction({
          channelId: message.channel.id,
          action: command,
          actorId: message.author.id,
          actorName: message.author.username,
          target,
          result,
          isCustom: true,
        });
        return result;
      } catch (error) {
        this.logger.error(`CreationTool failed for '${command}': ${error.message}`);
        return `The command '${command}' fizzled out mysteriously...`;
      }
    }

    try {
      const result = await tool. execute(message, params, avatar, this.services);
      await this.ActionLog.logAction({
        channelId: message.channel.id,
        action: command,
        actorId: message.author.id,
        actorName: message.author.username,
        displayName: `${tool.emoji || '🛠️'} ${message.author.username}`,
        target,
        result,
        memory: command === 'remember' ? result.replace(/^\[🧠 Memory generated: "(.*)"\]$/, '$1') : null,
        tool: command,
        emoji: tool.emoji,
        isCustom: false,
      });
      return result;
    } catch (error) {
      this.logger.error(`Tool '${command}' execution failed: ${error.message}`);
      return `Oops! '${command}' failed: ${error.message}. Try again or ask for help!`;
    }
  }
}