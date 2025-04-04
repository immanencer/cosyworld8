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
      x: XPostTool,
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
    if (!text) return { commands: [], cleanText: text || '', commandLines: [] };

    const emojis = Array.from(this.toolEmojis.keys());
    const pattern = new RegExp(`(${emojis.join('|')})(?:\s+([^\n]*))?`, 'g');

    const commands = [];
    const commandLines = [];
    let cleanText = text;

    let match;
    while ((match = pattern.exec(text)) !== null) {
      const emoji = match[1];
      const paramsString = match[2] || '';
      const toolName = this.toolEmojis.get(emoji);
      const fullMatch = match[0];

      const params = paramsString.trim() ? paramsString.trim().split(/\s+/) : [];
      commands.push({ command: toolName, emoji, params });
      commandLines.push(fullMatch);
    }

    return { commands, cleanText, commandLines };
  }

  applyGuildToolEmojiOverrides(guildConfig) {
    if (!guildConfig?.toolEmojis) return;

    for (const [toolName, overrideEmoji] of Object.entries(guildConfig.toolEmojis)) {
      if (!overrideEmoji) continue;

      // Remove all emojis currently mapped to this tool
      for (const [emoji, mappedTool] of this.toolEmojis.entries()) {
        if (mappedTool === toolName) {
          this.toolEmojis.delete(emoji);
        }
      }

      // Add override emoji
      this.toolEmojis.set(overrideEmoji, toolName);
    }
  }

  // --- Command Processing ---

  async getCommandsDescription(guildId, avatar = null) {
    const commands = [];
    for (const [name, tool] of this.tools.entries()) {
      try {
        if (tool.constructor.name === 'XSocialTool' && avatar) {
          const status = await tool.getToolStatusForAvatar(avatar);
          if (!status.visible) continue;
          const syntax = (await tool.getSyntax(guildId)) || `${tool.emoji} ${name}`;
          const description = tool.getDescription() || 'No description available.';
          const info = status.info ? `\n${status.info}` : '';
          commands.push(`**${name}**\nCommand format: ${syntax}\nDescription: ${description}${info}`);
        } else {
          const syntax = (await tool.getSyntax(guildId)) || `${tool.emoji} ${name}`;
          const description = tool.getDescription() || 'No description available.';
          commands.push(`**${name}**\nCommand format: ${syntax}\nDescription: ${description}`);
        }
      } catch (error) {
        this.logger.error(`Error getting syntax for tool '${name}': ${error.message}`);
      }
    }
    return commands.join('\n\n');
  }
}