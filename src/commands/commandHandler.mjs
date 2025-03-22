// commands/commandHandler.mjs
import { replyToMessage, reactToMessage } from "../services/discordService.mjs";
import { getSummonEmoji } from "../utils/utils.mjs";

export async function handleCommands(message, services) {
  const content = message.content.trim();
  const guildId = message.guild?.id;
  let summonEmoji = await getSummonEmoji();

  if (content.startsWith("!summon")) {
    await replyToMessage(message, `Command Deprecated. Use ${summonEmoji} Instead.`);
    return;
  }
  
  // Get allowed tool emojis
  let toolEmojis = [];
  
  // First try to get tools from ToolService if available
  if (services.toolService) {
    toolEmojis = services.toolService.getAllEmojis();
  } else if (services.dungeonService) {
    // Fall back to DungeonService
    try {
      toolEmojis = Array.from(services.dungeonService.toolEmojis.keys());
    } catch (error) {
      // Final fallback to default emojis
      toolEmojis = [summonEmoji, "⚔️", "🛡️", "🏹", "🔍", "🧠", "🧪", "🏃"];
    }
  }
  
  // Check if the message starts with any tool emoji
  const isToolCommand = toolEmojis.some(emoji => content.startsWith(emoji));
  
  // If it's a user requesting a tool command for their avatar
  if (isToolCommand) {
    try {
      // React to acknowledge we're processing
      await reactToMessage(message, "⏳");
      
      // Get or create the user's avatar
      const avatarResult = await services.avatarService.summonUserAvatar(message, services);
      
      if (!avatarResult || !avatarResult.avatar) {
        await reactToMessage(message, "❌");
        await replyToMessage(message, "Sorry, I couldn't create or summon your avatar.");
        return;
      }
      
      const avatar = avatarResult.avatar;
      
      // Check if avatar object is valid and has required properties
      if (!avatar || !avatar.name || !avatar._id) {
        await reactToMessage(message, "❌");
        await replyToMessage(message, "Avatar data is incomplete. Unable to process command.");
        return;
      }
      
      // If it's a new avatar, inform the user
      if (avatarResult.isNewAvatar) {
        await replyToMessage(message, `Created a new avatar called ${avatar.name} for you! Your avatar will now try to execute: ${content}`);
      }
      
      // Create a dummy message with the user's avatar as sender
      const avatarMessage = {
        ...message,
        author: {
          id: avatar._id.toString(),
          username: avatar.name
        },
        channel: { id: message.channel.id }
      };
      
      const args = content.slice(1).trim().split(" ");
      const emoji = toolEmojis.find(emoji => content.startsWith(emoji));
      
      // Execute the tool using the appropriate service
      let result;
      
      // First try to use the ToolService if available
      if (services.toolService) {
        await reactToMessage(message, emoji);
        result = await services.toolService.executeToolByEmoji(emoji, avatarMessage, args, avatar);
        await reactToMessage(message, "✅");
      } 
      // Fall back to DungeonService
      else if (services.dungeonService) {
        const toolName = services.dungeonService.toolEmojis.get(emoji);
        
        if (toolName) {
          const tool = services.dungeonService.tools.get(toolName);
          if (tool) {
            await reactToMessage(message, emoji);
            result = await services.dungeonService.processAction(
              avatarMessage, 
              toolName, 
              args, 
              avatar
            );
            await reactToMessage(message, "✅");
          } else {
            await replyToMessage(message, `Tool ${toolName} not found.`);
            await reactToMessage(message, "❌");
          }
        } else {
          await replyToMessage(message, `No tool found for emoji ${emoji}.`);
          await reactToMessage(message, "❌");
        }
      }
      
      // If we got a result and it's meaningful, show it
      if (result && typeof result === 'string' && result.trim().length > 0) {
        await replyToMessage(message, `-# ${emoji} ${result}`);
      }

      // Respond as the user's avatar
      await services.responseGenerator.respondAsAvatar(message.channel, avatar);
    } catch (error) {
      console.error("Error handling tool command:", error);
      await reactToMessage(message, "❌");
      await replyToMessage(message, `There was an error processing your command: ${error.message}`);
    }
    return;
  }
  
  // Handle non-tool commands or direct game commands
  // (This is kept for backward compatibility)
  const args = content.slice(2).trim().split(" ");
  
  if (content.startsWith(summonEmoji)) {
    // Check permissions for summon command
    const member = message.guild?.members?.cache?.get(message.author.id);
    const guildConfig = guildId ? await services.configService.getGuildConfig(services.databaseService.getDatabase(), guildId) : null;
    const requiredRole = guildConfig?.summonerRole || process.env.SUMMONER_ROLE;
    
    if (requiredRole && !message.author.bot && member && !member.roles.cache.some(r => r.id === requiredRole || r.name === requiredRole)) {
      await replyToMessage(message, `You lack the required role (${requiredRole}) to summon.`);
      return;
    }
    
    // Execute tool using the appropriate service
    await reactToMessage(message, summonEmoji);
    
    if (services.toolService) {
      const result = await services.toolService.executeToolByEmoji(summonEmoji, message, args, null);
      if (result) {
        await replyToMessage(message, `-# ${summonEmoji} ${result}`);
      }
    } else if (services.dungeonService) {
      const toolName = services.dungeonService.toolEmojis.get(summonEmoji);
      if (toolName) {
        const result = await services.dungeonService.processAction(message, toolName, args, null);
        if (result) {
          await replyToMessage(message, `-# ${summonEmoji} ${result}`);
        }
      }
    }
  } 
  // Handle other direct emoji commands similarly (preserved for compatibility)
  else if (firstCharacter && toolEmojis.includes(firstCharacter)) {
    await reactToMessage(message, firstCharacter);
    
    if (services.toolService) {
      const result = await services.toolService.executeToolByEmoji(firstCharacter, message, args, null);
      if (result) {
        await replyToMessage(message, `-# ${firstCharacter} ${result}`);
      }
    } else if (services.dungeonService) {
      const toolName = services.dungeonService.toolEmojis.get(firstCharacter);
      if (toolName) {
        const result = await services.dungeonService.processAction(message, toolName, args, null);
        if (result) {
          await replyToMessage(message, `-# ${firstCharacter} ${result}`);
        }
      }
    }
    
    await reactToMessage(message, "✅");
  }
}