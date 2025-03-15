// commands/summonCommand.mjs
import { reactToMessage, replyToMessage, sendAsWebhook, sendAvatarProfileEmbedFromObject } from "../services/discordService.mjs";

import { sanitizeInput } from "../utils/utils.mjs";

const DAILY_SUMMON_LIMIT = 16;

async function checkDailySummonLimit(userId, services) {
  const db = services.databaseService.getDatabase();
  if (!db) {
    services.logger.error("Database not available for summon limit check.");
    return false;
  }
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return (await db.collection("daily_summons").countDocuments({ userId, timestamp: { $gte: today } })) < DAILY_SUMMON_LIMIT;
  } catch (error) {
    services.logger.error(`Error checking summon limit: ${error.message}`);
    return false;
  }
}

async function trackSummon(userId, services) {
  const db = services.databaseService.getDatabase();
  if (!db) return;
  await db.collection("daily_summons").insertOne({ userId, timestamp: new Date() });
}

export async function handleSummonCommand(message, breed = false, attributes = {}, services) {
  const content = message.content.trim().substring(2).trim();
  const [avatarName] = content.split("\n").map(line => line.trim());
  const existingAvatar = await services.avatarService.getAvatarByName(avatarName);

  try {
    if (existingAvatar) {
      await reactToMessage(message, existingAvatar.emoji || "🔮");
      const updatedAvatar = await services.chatService.dungeonService.updateAvatarPosition(existingAvatar._id, message.channel.id);
      updatedAvatar.stats = await services.chatService.dungeonService.getAvatarStats(updatedAvatar._id);
      await services.avatarService.updateAvatar(updatedAvatar);
      await sendAvatarProfileEmbedFromObject(updatedAvatar);
      await services.chatService.respondAsAvatar(message.channel, updatedAvatar, true);
      return;
    }

    const canSummon = message.author.id === "1175877613017895032" || (await checkDailySummonLimit(message.author.id, services));
    if (!canSummon) {
      await replyToMessage(message, `Daily summon limit of ${DAILY_SUMMON_LIMIT} reached. Try again tomorrow!`);
      return;
    }

    const guildConfig = await services.configService.getGuildConfig(services.databaseService.getDatabase(), message.guild?.id, true);
    const summonPrompt = guildConfig?.prompts?.summon || "Create an avatar with the following description:";
    const avatarData = {
      prompt: sanitizeInput(`${summonPrompt}\n\nRequires you to design a creative character based on the following content:\n\n${content}`),
      channelId: message.channel.id,
    };
    if (summonPrompt.match(/^(https:\/\/.*\.arweave\.net\/|ar:\/\/)/)) avatarData.arweave_prompt = summonPrompt;

    const createdAvatar = await services.avatarService.createAvatar(avatarData);
    if (!createdAvatar || !createdAvatar.name) {
      await replyToMessage(message, "Failed to create avatar. Try a more detailed description.");
      return;
    }

    createdAvatar.summoner = `${message.author.username}@${message.author.id}`;
    createdAvatar.model = createdAvatar.model || (await services.aiService.selectRandomModel());
    createdAvatar.stats = await services.chatService.dungeonService.getAvatarStats(createdAvatar._id);
    await services.avatarService.updateAvatar(createdAvatar);
    await sendAvatarProfileEmbedFromObject(createdAvatar);

    const intro = await services.aiService.chat([
      { role: "system", content: `${createdAvatar.name}. ${createdAvatar.description} ${createdAvatar.personality}` },
      { role: "user", content: guildConfig?.prompts?.introduction || "You've just arrived. Introduce yourself." },
    ]);
    createdAvatar.dynamicPersonality = intro;
    createdAvatar.channelId = message.channel.id;
    createdAvatar.attributes = attributes;
    await services.avatarService.updateAvatar(createdAvatar);
    await sendAsWebhook(message.channel.id, intro, createdAvatar);

    await services.chatService.dungeonService.initializeAvatar(createdAvatar._id, message.channel.id);
    await reactToMessage(message, createdAvatar.emoji || "🎉");
    if (!breed) await trackSummon(message.author.id, services);
    await services.chatService.respondAsAvatar(message.channel, createdAvatar, true);
  } catch (error) {
    services.logger.error(`Summon error: ${error.message}`);
    await reactToMessage(message, "❌");
    await replyToMessage(message, `Failed to summon: ${error.message}`);
  }
}