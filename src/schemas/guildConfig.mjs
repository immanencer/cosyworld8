
import { z } from 'zod';

export const GuildConfigSchema = z.object({
  guildId: z.string().min(1).regex(/^\d+$/, "Guild ID must be a valid Discord server ID (numbers only)"),
  guildName: z.string().optional(),
  whitelisted: z.boolean().default(false),
  summonerRole: z.string().optional(),
  adminRoles: z.array(z.string()).default([]),
  prompts: z.object({
    introduction: z.string().optional(),
    summon: z.string().optional(),
    attack: z.string().optional(),
    defend: z.string().optional(),
    breed: z.string().optional()
  }).optional(),
  toolEmojis: z.object({
    summon: z.string().optional(),
    breed: z.string().optional(),
    attack: z.string().optional(),
    defend: z.string().optional()
  }).optional(),
  features: z.object({
    breeding: z.boolean().default(true),
    combat: z.boolean().default(true),
    itemCreation: z.boolean().default(true)
  }).optional(),
  rateLimit: z.object({
    messages: z.number().default(5),
    interval: z.number().default(60000)
  }).optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date())
});

export default GuildConfigSchema;
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

export const guildConfigSchema = {
  type: 'object',
  required: ['guildId'],
  properties: {
    guildId: {
      type: 'string',
      description: 'Discord guild (server) ID'
    },
    name: {
      type: 'string',
      description: 'Name of the Discord server'
    },
    icon: {
      type: 'string',
      nullable: true,
      description: 'URL to the guild icon'
    },
    joinedAt: {
      type: 'string',
      format: 'date-time',
      description: 'When the bot joined this guild'
    },
    isWhitelisted: {
      type: 'boolean',
      default: false,
      description: 'Whether this guild is allowed to use the bot'
    },
    memberCount: {
      type: 'integer',
      minimum: 0,
      description: 'Number of members in the guild'
    },
    owner: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        username: { type: 'string' }
      },
      required: ['id']
    },
    settings: {
      type: 'object',
      properties: {
        prefix: {
          type: 'string',
          default: '!',
          description: 'Command prefix for this guild'
        },
        aiResponseChannel: {
          type: 'string',
          nullable: true,
          description: 'Channel ID where AI should respond'
        },
        disabledCommands: {
          type: 'array',
          items: { type: 'string' },
          default: [],
          description: 'List of disabled command names'
        },
        enabledModules: {
          type: 'array',
          items: { type: 'string' },
          default: ['avatar', 'combat', 'dungeon'],
          description: 'List of enabled module names'
        }
      },
      additionalProperties: true
    }
  },
  additionalProperties: true
};

export const validateGuildConfig = ajv.compile(guildConfigSchema);
