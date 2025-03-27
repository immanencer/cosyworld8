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
import configService from '../configService.mjs';
import { LocationService } from '../location/locationService.mjs';

export class ToolService {
  /**
   * Constructs a new ToolService instance for managing tools and actions.
   * @param {Object} client - The Discord client instance.
   * @param {Object} logger - Logging interface.
   * @param {Object} avatarService - Service for avatar operations.
   * @param {import('mongodb').Db} db - MongoDB database connection.
   * @param {Object} services - Additional services (e.g., mapService, itemService).
   */
  constructor(client, logger, avatarService, db, services) {
    this.services = { ...services, client, toolService: this };
    this.db = db;
    this.client = client;
    this.logger = logger;
    this.avatarService = avatarService;
    this.itemService = services.itemService;

    // Tools & Logging
    this.ActionLog = new ActionLog(logger);
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
    const configEmojis = configService.get('toolEmojis') || {};
    Object.entries(configEmojis).forEach(([emoji, toolName]) => {
      this.toolEmojis.set(emoji, toolName);
    });

    this.creationTool = new CreationTool(this.services);

    // Service dependencies
    this.aiService = new AIService();
    this.locationService = new LocationService(this.client, this.aiService, this.db);

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
    if (!text) return { commands: [], cleanText: '', commandLines: [] };

    const lines = text.split('\n');
    const commands = [];
    const commandLines = [];
    const narrativeLines = [];

    for (const line of lines) {
      const trimmedLine = line.trim();
      let isCommand = false;
      for (const [emoji, toolName] of this.toolEmojis.entries()) {
        if (trimmedLine.startsWith(emoji)) {
          const rest = trimmedLine.slice(emoji.length).trim();
          const params = rest ? rest.split(/\s+/) : [];
          commands.push({ command: toolName, params });
          commandLines.push(line);
          isCommand = true;
          break;
        }
      }
      if (!isCommand) narrativeLines.push(line);
    }

    return { commands, text, commandLines };
  }

  // --- Command Processing ---

  getCommandsDescription(guildId) {
    const commands = [];
    for (const [name, tool] of this.tools.entries()) {
      const syntax = tool.getSyntax?.(guildId) || `${tool.emoji || name}`;
      const description = tool.getDescription?.() || 'No description available.';
      commands.push(`**${name}**\nTrigger: ${tool.emoji || 'N/A'}\nSyntax: ${syntax}\n${description}`);
    }
    return commands.join('\n\n');
  }

  async processAction(message, command, params, avatar) {
    this.logger.info(`Processing command '${command}' by ${avatar.name} (ID: ${avatar._id})`);
    const tool = this.tools.get(command);

    if (!tool) {
      this.logger.debug(`Unknown command '${command}', using CreationTool`);
      try {
        const result = await this.creationTool.execute(message, params, avatar, this.services);
        await this.ActionLog.logAction({
          channelId: message.channel.id,
          action: command,
          actorId: message.author.id,
          actorName: message.author.username,
          target: params[0],
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
      const result = await tool.execute(message, params, avatar, this.services);
      await this.ActionLog.logAction({
        channelId: message.channel.id,
        action: command,
        actorId: message.author.id,
        actorName: message.author.username,
        displayName: `${tool.emoji || '🛠️'} ${message.author.username}`,
        target: params[0],
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