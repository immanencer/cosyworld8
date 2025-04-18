import { BasicService } from '../foundation/basicService.mjs';
import { ActionLog } from './ActionLog.mjs';
import { AttackTool } from './tools/AttackTool.mjs';
import { DefendTool } from './tools/DefendTool.mjs';
import { MoveTool } from './tools/MoveTool.mjs';
import { RememberTool } from './tools/RememberTool.mjs';
import { CreationTool } from './tools/CreationTool.mjs';
import { XSocialTool } from './tools/XSocialTool.mjs';
import { ItemTool } from './tools/ItemTool.mjs';
import { ThinkTool } from './tools/ThinkTool.mjs';
import { SummonTool } from './tools/SummonTool.mjs';
import { BreedTool } from './tools/BreedTool.mjs';
import { OneirocomForumTool as ForumTool } from './tools/OneirocomForumTool.mjs';
import { CooldownService } from './CooldownService.mjs';
import { CameraTool } from './tools/CameraTool.mjs';

export class ToolService extends BasicService {
  static requiredServices = [
    "logger",
    "discordService",
    "databaseService",
    "configService",
    "spamControlService",
    "avatarService",
    "schedulingService",
    "decisionMaker",
    "conversationManager",
    "channelManager",
    "schemaService",
    "promptService",
    "memoryService",
    "locationService",
    "mapService",
    "aiService",
    "itemService",
    "riskManagerService",
    "statService",
    "knowledgeService",
    "battleService",
    "s3Service",
    "diceService",
    "forumService",
    "imageProcessingService",
    "xService",
  ];
  constructor(services) {
    super(services);

    // Tools & Logging
    this.ActionLog = new ActionLog(this.logger);
    this.tools = new Map();
    this.toolEmojis = new Map();

    this.defaultCooldownMs = 60 * 60 * 1000; // 1 hour cooldown
    this.cooldownService = services.cooldownService || new CooldownService();

    // Initialize tools
    const toolClasses = {
      summon: SummonTool,
      breed: BreedTool,
      attack: AttackTool,
      defend: DefendTool,
      move: MoveTool,
      remember: RememberTool,
      create: CreationTool,
      x: XSocialTool,
      item: ItemTool,
      respond: ThinkTool,
      forum: ForumTool,
      camera: CameraTool,
    };

    Object.entries(toolClasses).forEach(([name, ToolClass]) => {
      const tool = new ToolClass(this.services);
      this.tools.set(name, tool);
      if (tool.emoji) this.toolEmojis.set(tool.emoji, name);
    });

    // Load emoji mappings from config
    const configEmojis = services.configService.get('toolEmojis') || {};
    Object.entries(configEmojis).forEach(([emoji, toolName]) => {
      this.toolEmojis.set(emoji, toolName);
    });
  }

  registerTool(tool) {
    if (tool?.name) {
      this.tools.set(tool.name, tool);
      if (tool.emoji) this.toolEmojis.set(tool.emoji, tool.name);
    }
  }

  async initialize() {

    let tools = {};
    for (const [name, tool] of this.tools.entries()) {
      tools[name] = tool;
    }
    this.logger.info(`ToolService initialized with ${Object.keys(tools).length} tools.`);

    const services = {};

    for (const serviceName of this.constructor.requiredServices) {
      const service = this[serviceName];
      if (!service) {
        this.logger.error(`Service '${serviceName}' is not available.`);
        throw new Error(`Service '${serviceName}' is required but not available.`);
      }
      services[serviceName] = service;
    }

    BasicService.validateServiceDependencies({
      ...tools,
      ...services,
    });
  }

  extractToolCommands(text) {
    // Handle empty or invalid input
    if (!text) return { commands: [], cleanText: text || '', commandLines: [] };

    // Prepare emojis from toolEmojis map, escaping special regex characters
    const emojis = Array.from(this.toolEmojis.keys()).map(e => e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    if (emojis.length === 0) return { commands: [], cleanText: text, commandLines: [] };

    // Define the regex pattern to match commands and their parameters
    const pattern = new RegExp(`(^|\\s)(${emojis.join('|')})(?:\\s+((?:(?!${emojis.join('|')}).)*))?`, 'g');

    let match;
    const commands = [];
    const commandLines = [];
    let cleanText = text;

    // Iterate through all matches in the text
    while ((match = pattern.exec(text)) !== null) {
      const emoji = match[2];
      const paramsString = match[3] || '';
      const params = paramsString.trim().split(/\s+/).filter(Boolean);
      const toolName = this.toolEmojis.get(emoji);
      const fullMatch = match[0];
      commands.push({ command: toolName, emoji, params });
      commandLines.push(fullMatch.trim());
      // Remove the matched command from cleanText
      cleanText = cleanText.replace(fullMatch, '').trim();
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
        // Check cooldown for this avatar/tool
        if (avatar) {
          const cooldownMs = tool.cooldownMs ?? this.defaultCooldownMs;
          const remaining = this.cooldownService.getRemainingCooldown(name, avatar._id, cooldownMs);
          if (remaining > 0) continue; // Skip tools on cooldown
        }
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

    const cooldownMs = tool.cooldownMs ?? this.defaultCooldownMs;
    const remaining = this.cooldownService.getRemainingCooldown(toolName, avatar._id, cooldownMs);
    if (remaining > 0) {
      const minutes = Math.ceil(remaining / 60000);
      return `-# [ Please wait ${minutes} more minute(s) before using '${toolName}' again. ]`;
    }

    let result;
    try {
      result = await tool.execute(message, params, avatar);
      this.cooldownService.setUsed(toolName, avatar._id);
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