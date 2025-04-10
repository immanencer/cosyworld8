import { BasicService } from '../foundation/basicService.mjs';
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
import { ForumTool } from './ForumTool.mjs';

export class ToolService extends BasicService {
  constructor(services) {
    super(services);
    this.services = services;
    this.databaseService = services.databaseService;
    this.configService = services.configService;
    this.memoryService = services.memoryService;

    this.db = this.databaseService.getDatabase();

    // Tools & Logging
    this.ActionLog = new ActionLog(this.logger);
    this.tools = new Map();
    this.toolEmojis = new Map();

    this.toolCooldowns = new Map(); // toolName -> last execution timestamp
    this.defaultCooldownMs = 60 * 1000; // 1 hour cooldown

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
      forum: ForumTool,
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

    this.creationTool = new CreationTool({ logger: this.logger, databaseService: this.databaseService, configService: this.configService });
  }

  registerTool(tool) {
    if (tool?.name) {
      this.tools.set(tool.name, tool);
      if (tool.emoji) this.toolEmojis.set(tool.emoji, tool.name);
    }
  }

  async initialize() {
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

    const emojis = Array.from(this.toolEmojis.keys()).map(e => e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    if (emojis.length === 0) return { commands: [], cleanText: text, commandLines: [] };

    const pattern = new RegExp(`(^|\s)(${emojis.join('|')})(?:\s+([^\n]*))?`, 'g');

    const commands = [];
    const commandLines = [];
    let cleanText = text;

    let match;
    while ((match = pattern.exec(text)) !== null) {
      const emoji = match[2];
      const paramsString = match[3] || '';
      const toolName = this.toolEmojis.get(emoji);
      const fullMatch = match[0];

      const params = paramsString.trim() ? paramsString.trim().split(/\s+/) : [];
      commands.push({ command: toolName, emoji, params });
      commandLines.push(fullMatch.trim());
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

  /**
   * Executes a tool by name, logs the action, and returns the result.
   * @param {string} toolName - The tool name (e.g., 'move', 'item')
   * @param {Object} message - The Discord message object
   * @param {string[]} params - The command parameters
   * @param {Object} avatar - The avatar performing the action
   * @param {Object} guildConfig - The guild configuration
   * @returns {Promise<string>} The tool's response
   */
  async executeTool(toolName, message, params, avatar, guildConfig = {}) {
    const tool = this.tools.get(toolName);
    if (!tool) {
      return `Tool '${toolName}' not found.`;
    }

    // ForumTool restriction logic
    if (tool.name === 'forum') {
      if (!guildConfig?.enableForumTool) {
        return 'Forum tool is disabled for this server.';
      }
      if (guildConfig.forumToolChannelId && message.channel.id !== guildConfig.forumToolChannelId) {
        return 'Forum tool can only be used in the designated channel.';
      }
    }

    const now = Date.now();
    const lastUsed = this.toolCooldowns.get(toolName) || 0;
    const cooldownMs = tool.cooldownMs ?? this.defaultCooldownMs;
    if (now - lastUsed < cooldownMs) {
      const remainingMs = cooldownMs - (now - lastUsed);
      const minutes = Math.ceil(remainingMs / 60000);
      return `-# [ Please wait ${minutes} more minute(s) before using '${toolName}' again. ]`;
    }

    let result;
    try {
      result = await tool.execute(message, params, avatar);
      this.toolCooldowns.set(toolName, now);
    } catch (error) {
      result = `Error executing ${toolName}: ${error.message}`;
    }

    try {
      await this.memoryService.addMemory(avatar._id, result);
      await this.ActionLog.logAction({
        channelId: message.channel.id,
        action: toolName,
        actorId: avatar._id,
        actorName: avatar.name,
        displayName: avatar.displayName || avatar.name,
        target: params.join(' '),
        result,
        tool: toolName,
        emoji: tool.emoji,
        isCustom: false,
        timestamp: Date.now(),
      });
    } catch (logError) {
      this.logger?.error(`Failed to log action '${toolName}': ${logError.message}`);
    }

    return result;
  }
}