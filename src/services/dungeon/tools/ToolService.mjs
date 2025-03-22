/**
 * Tool Management Service
 * 
 * This service manages all available tools for avatar actions, providing
 * a central registry for tools and their associated emoji commands.
 */

import { BaseTool } from './BaseTool.mjs';
import { AttackTool } from './AttackTool.mjs';
import { DefendTool } from './DefendTool.mjs';
import { MoveTool } from './MoveTool.mjs';
import { RememberTool } from './RememberTool.mjs';
import { CreationTool } from './CreationTool.mjs';
import { XSocialTool } from './XSocialTool.mjs';
import { ItemTool } from './ItemTool.mjs';
import { ThinkTool } from './ThinkTool.mjs';
import { SummonTool } from './SummonTool.mjs';
import { BreedTool } from './BreedTool.mjs';
import configService from '../../configService.mjs';

export class ToolService {
  /**
   * Creates a new ToolService instance
   * @param {Object} services - Service container with required dependencies
   */
  constructor(services) {
    this.services = services;
    this.logger = services.logger;
    
    // Tool registry
    this.tools = new Map();
    this.toolEmojis = new Map();
    this.toolNames = new Set();
    
    // Initialize default tools
    this.registerDefaultTools();
    
    // Load custom emoji mappings from config
    this.loadEmojiMappings();
  }
  
  /**
   * Register the default set of tools
   * @private
   */
  registerDefaultTools() {
    const toolClasses = {
      summon: SummonTool,
      breed: BreedTool,
      attack: AttackTool,
      defend: DefendTool,
      move: MoveTool,
      remember: RememberTool,
      create: CreationTool,
      xpost: XSocialTool,
      item: ItemTool,
      respond: ThinkTool,
    };
    
    for (const [name, ToolClass] of Object.entries(toolClasses)) {
      try {
        this.registerTool(name, new ToolClass(this.services));
      } catch (error) {
        this.logger?.error(`Failed to initialize tool ${name}: ${error.message}`);
      }
    }
  }
  
  /**
   * Register a tool in the service
   * @param {string} name - The name of the tool
   * @param {BaseTool} tool - The tool instance
   */
  registerTool(name, tool) {
    if (!(tool instanceof BaseTool)) {
      throw new Error(`Tool ${name} must extend BaseTool`);
    }
    
    this.tools.set(name, tool);
    this.toolNames.add(name);
    
    if (tool.emoji) {
      this.toolEmojis.set(tool.emoji, name);
    }
    
    this.logger?.debug?.(`Registered tool: ${name} with emoji: ${tool.emoji || 'none'}`);
  }
  
  /**
   * Load emoji mappings from configuration
   * @private
   */
  loadEmojiMappings() {
    const configEmojis = configService.get('toolEmojis') || {};
    
    Object.entries(configEmojis).forEach(([emoji, toolName]) => {
      this.toolEmojis.set(emoji, toolName);
      this.logger?.debug?.(`Mapped emoji ${emoji} to tool ${toolName} from config`);
    });
  }
  
  /**
   * Get a tool by name
   * @param {string} name - The name of the tool to get
   * @returns {BaseTool|null} The tool instance or null if not found
   */
  getTool(name) {
    return this.tools.get(name) || null;
  }
  
  /**
   * Get a tool by emoji
   * @param {string} emoji - The emoji associated with the tool
   * @returns {BaseTool|null} The tool instance or null if not found
   */
  getToolByEmoji(emoji) {
    const toolName = this.toolEmojis.get(emoji);
    return toolName ? this.getTool(toolName) : null;
  }
  
  /**
   * Check if an emoji is registered as a tool command
   * @param {string} emoji - The emoji to check
   * @returns {boolean} True if the emoji is registered, false otherwise
   */
  isToolEmoji(emoji) {
    return this.toolEmojis.has(emoji);
  }
  
  /**
   * Get all registered tool emojis
   * @returns {string[]} Array of all registered tool emojis
   */
  getAllEmojis() {
    return Array.from(this.toolEmojis.keys());
  }
  
  /**
   * Get all registered tool names
   * @returns {string[]} Array of all registered tool names
   */
  getAllToolNames() {
    return Array.from(this.toolNames);
  }
  
  /**
   * Execute a tool by name
   * @param {string} toolName - The name of the tool to execute
   * @param {Object} message - The Discord message object
   * @param {string[]} params - Parameters for the tool
   * @param {Object} avatar - The avatar executing the tool
   * @returns {Promise<string>} The result of the tool execution
   */
  async executeTool(toolName, message, params, avatar) {
    const tool = this.getTool(toolName);
    
    if (!tool) {
      this.logger?.warn?.(`Tool not found: ${toolName}`);
      return `Tool ${toolName} not found`;
    }
    
    try {
      this.logger?.info?.(`Executing tool ${toolName} for avatar ${avatar.name}`);
      const result = await tool.execute(message, params, avatar, this.services);
      return result;
    } catch (error) {
      this.logger?.error?.(`Error executing tool ${toolName}: ${error.message}`);
      return `Error executing ${toolName}: ${error.message}`;
    }
  }
  
  /**
   * Execute a tool by emoji
   * @param {string} emoji - The emoji associated with the tool
   * @param {Object} message - The Discord message object
   * @param {string[]} params - Parameters for the tool
   * @param {Object} avatar - The avatar executing the tool
   * @returns {Promise<string>} The result of the tool execution
   */
  async executeToolByEmoji(emoji, message, params, avatar) {
    const toolName = this.toolEmojis.get(emoji);
    
    if (!toolName) {
      this.logger?.warn?.(`No tool registered for emoji: ${emoji}`);
      return `No tool registered for emoji: ${emoji}`;
    }
    
    return this.executeTool(toolName, message, params, avatar);
  }
  
  /**
   * Gets a formatted description of all registered tools
   * @param {string} [guildId] - Optional guild ID for customized descriptions
   * @returns {string} A formatted description of all tools
   */
  getToolsDescription(guildId) {
    const descriptions = [];
    
    for (const [name, tool] of this.tools.entries()) {
      const syntax = tool.getSyntax?.(guildId) || `${tool.emoji || name}`;
      const description = tool.getDescription?.() || 'No description available.';
      descriptions.push(`**${name}**\nTrigger: ${tool.emoji || 'N/A'}\nSyntax: ${syntax}\n${description}`);
    }
    
    return descriptions.join('\n\n');
  }
}

export default ToolService;