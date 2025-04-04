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
    if (!text) return { commands: [], cleanText: text || '', commandLines: [] };

    // Get the list of tool emojis from the map
    const emojis = Array.from(this.toolEmojis.keys());
    // Regex to match lines starting with an emoji followed by text
    const pattern = new RegExp(`^(${emojis.join('|')})\\s+(.+)$`, 'gm');

    const commands = [];
    const commandLines = [];
    let cleanText = text;

    // Find all matches in the text
    let match;
    while ((match = pattern.exec(text)) !== null) {
        const emoji = match[1]; // The matched emoji
        const rest = match[2].trim(); // The text following the emoji
        const params = rest.split(/\s+/); // Split into parameters
        const toolName = this.toolEmojis.get(emoji); // Get tool name from map

        // Add the command to the list
        commands.push({ command: toolName, emoji, params });
        commandLines.push(match[0]); // Store the full matched line
    }

    // Remove command lines from cleanText
    commandLines.forEach(line => {
        cleanText = cleanText.replace(line, '').trim();
    });

    return { commands, cleanText, commandLines };
}

  // --- Command Processing ---

  async getCommandsDescription(guildId) {
    const commands = [];
    for (const [name, tool] of this.tools.entries()) {
      try {
        const syntax = (await tool.getSyntax(guildId)) || `${tool.emoji || name}`;
        const description = tool.getDescription() || 'No description available.';
        commands.push(`**${name}**\nTrigger: ${tool.emoji || 'N/A'}\nSyntax: ${syntax}\n${description}`);
      } catch (error) {
        this.logger.error(`Error getting syntax for tool '${name}': ${error.message}`);
      }
    }
    return commands.join('\n\n');
  }
}