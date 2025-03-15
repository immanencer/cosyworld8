// commands/breedCommand.mjs
import { replyToMessage } from "../services/discordService.mjs";
import { handleSummonCommand } from "./summonCommand.mjs";

export async function handleBreedCommand(message, args, commandLine, services) {
  const avatars = await services.avatarService.getAvatarsInChannel(message.channel.id);
  const mentionedAvatars = Array.from(services.avatarService.extractMentionedAvatars(commandLine, avatars))
    .sort(() => Math.random() - 0.5)
    .slice(-2);

  if (mentionedAvatars.length !== 2) {
    await replyToMessage(message, "Please mention exactly two avatars to breed.");
    return;
  }

  const [avatar1, avatar2] = mentionedAvatars;
  if (avatar1._id === avatar2._id) {
    await replyToMessage(message, "Both avatars must be different to breed.");
    return;
  }

  const checkRecentBreed = async (avatar) => {
    const lastBred = await services.avatarService.getLastBredDate(avatar._id.toString());
    return lastBred && (Date.now() - new Date(lastBred) < 24 * 60 * 60 * 1000);
  };

  if (await checkRecentBreed(avatar1) || await checkRecentBreed(avatar2)) {
    await replyToMessage(message, `${(await checkRecentBreed(avatar1) ? avatar1 : avatar2).name} has been bred in the last 24 hours.`);
    return;
  }

  await replyToMessage(message, `Breeding ${avatar1.name} with ${avatar2.name}...`);

  const buildNarrative = async (avatar) => {
    const memories = (await services.chatService.conversationHandler.memoryService.getMemories(avatar._id)).map(m => m.memory).join("\n");
    return services.chatService.conversationHandler.buildNarrativePrompt(avatar, [memories]);
  };

  const prompt = `Breed the following avatars to combine them, develop a short backstory for the offspring:\n\n` +
    `AVATAR 1: ${avatar1.name} - ${avatar1.prompt}\n${avatar1.description}\n${avatar1.personality}\n${await buildNarrative(avatar1)}\n\n` +
    `AVATAR 2: ${avatar2.name} - ${avatar2.prompt}\n${avatar2.description}\n${avatar2.personality}\n${await buildNarrative(avatar2)}\n\n` +
    `Combine their attributes creatively, avoiding cosmic or mystical elements and aiming for a down-to-earth feel suitable for the Monstone Sanctum.`;

  const originalContent = message.content;
  message.content = `${prompt}`;
  await handleSummonCommand(message, true, { summoner: `${message.author.username}@${message.author.id}`, parents: [avatar1._id, avatar2._id] }, services);
  message.content = originalContent;
}