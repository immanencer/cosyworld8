
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
